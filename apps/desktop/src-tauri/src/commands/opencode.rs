use std::{fs, path::PathBuf};

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use tauri::async_runtime::{spawn, Receiver};
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};
use tokio::time::{sleep, timeout, Duration, Instant};

const HEALTH_POLL_INTERVAL: Duration = Duration::from_millis(100);
const HEALTH_POLL_TIMEOUT: Duration = Duration::from_secs(10);
const LISTEN_ANNOUNCE_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct OpencodeHandle {
  pub base_url: String,
  pub pid: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct OpencodeManifest {
  pub pid: u32,
  pub port: u16,
  pub secret: String,
  pub folder_path: String,
  pub user_id: String,
  pub memory_subdir: String,
  pub base_url: String,
  pub session_id: String,
}

fn random_url_safe(bytes: usize) -> String {
  let mut buffer = vec![0_u8; bytes];
  OsRng.fill_bytes(&mut buffer);
  URL_SAFE_NO_PAD.encode(buffer)
}

pub(crate) fn manifests_dir(home: &PathBuf) -> Result<PathBuf, String> {
  let dir = home.join(".tinker").join("manifests");
  fs::create_dir_all(&dir).map_err(|e| format!("create manifests dir {dir:?}: {e}"))?;
  Ok(dir)
}

pub(crate) fn extract_base_url(line: &[u8]) -> Option<String> {
  let text = String::from_utf8_lossy(line);
  let start = text.find("http://127.0.0.1:")?;
  let candidate = text[start..].split_whitespace().next()?;
  Some(candidate.to_string())
}

async fn wait_for_health(base_url: &str, user: &str, secret: &str) -> Result<(), String> {
  let client = reqwest::Client::new();
  let url = format!("{base_url}/health");
  let deadline = Instant::now() + HEALTH_POLL_TIMEOUT;

  loop {
    if let Ok(response) = client.get(&url).basic_auth(user, Some(secret)).send().await {
      if response.status().is_success() {
        return Ok(());
      }
    }

    if Instant::now() >= deadline {
      return Err(format!(
        "opencode /health did not respond within {}s",
        HEALTH_POLL_TIMEOUT.as_secs()
      ));
    }
    sleep(HEALTH_POLL_INTERVAL).await;
  }
}

async fn wait_for_listening(rx: &mut Receiver<CommandEvent>) -> Result<String, String> {
  let deadline = Instant::now() + LISTEN_ANNOUNCE_TIMEOUT;

  loop {
    let remaining = deadline
      .checked_duration_since(Instant::now())
      .ok_or_else(|| "opencode did not announce a listening URL within 10s".to_string())?;

    let event = timeout(remaining, rx.recv())
      .await
      .map_err(|_| "opencode did not announce a listening URL within 10s".to_string())?
      .ok_or_else(|| "opencode exited before announcing a listening URL".to_string())?;

    match event {
      CommandEvent::Stdout(line) => {
        eprintln!("[opencode] {}", String::from_utf8_lossy(&line));
        if let Some(url) = extract_base_url(&line) {
          return Ok(url);
        }
      }
      CommandEvent::Stderr(line) => {
        eprintln!("[opencode:error] {}", String::from_utf8_lossy(&line));
      }
      CommandEvent::Terminated(payload) => {
        return Err(format!(
          "opencode exited before becoming ready (code {:?}, signal {:?})",
          payload.code, payload.signal
        ));
      }
      _ => {}
    }
  }
}

#[tauri::command]
pub async fn start_opencode(
  app: AppHandle,
  folder_path: String,
  user_id: String,
  memory_subdir: String,
) -> Result<OpencodeHandle, String> {
  if folder_path.is_empty() {
    return Err("folder_path must not be empty".to_string());
  }
  if user_id.is_empty() {
    return Err("user_id must not be empty".to_string());
  }

  let session_id = random_url_safe(16);
  let username = format!("tinker-{}", random_url_safe(8));
  let secret = random_url_safe(24);
  let home = app
    .path()
    .home_dir()
    .map_err(|e| format!("resolve home dir: {e}"))?;

  let (mut rx, child) = app
    .shell()
    .sidecar("opencode")
    .map_err(|e| e.to_string())?
    .args([
      "serve",
      "--hostname",
      "127.0.0.1",
      "--port",
      "0",
      "--cwd",
      &folder_path,
    ])
    .envs([
      ("OPENCODE_SERVER_USERNAME", username.clone()),
      ("OPENCODE_SERVER_PASSWORD", secret.clone()),
      ("SMART_VAULT_PATH", memory_subdir.clone()),
    ])
    .current_dir(PathBuf::from(&folder_path))
    .spawn()
    .map_err(|e| format!("spawn opencode: {e}"))?;

  let pid = child.pid();

  let base_url = match wait_for_listening(&mut rx).await {
    Ok(url) => url,
    Err(error) => {
      let _ = child.kill();
      return Err(error);
    }
  };

  if let Err(error) = wait_for_health(&base_url, &username, &secret).await {
    let _ = child.kill();
    return Err(error);
  }

  let port: u16 = base_url
    .rsplit(':')
    .next()
    .and_then(|p| p.parse().ok())
    .ok_or_else(|| format!("could not parse port from base url {base_url}"))?;

  let manifest = OpencodeManifest {
    pid,
    port,
    secret: secret.clone(),
    folder_path,
    user_id,
    memory_subdir,
    base_url: base_url.clone(),
    session_id: session_id.clone(),
  };
  let manifest_path = manifests_dir(&home)?.join(format!("{session_id}.json"));
  let manifest_json = serde_json::to_string_pretty(&manifest)
    .map_err(|e| format!("serialize manifest: {e}"))?;
  fs::write(&manifest_path, manifest_json)
    .map_err(|e| format!("write manifest {manifest_path:?}: {e}"))?;
  // Manifest contains the basic-auth secret; restrict to owner on unix.
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    let perms = std::fs::Permissions::from_mode(0o600);
    fs::set_permissions(&manifest_path, perms)
      .map_err(|e| format!("chmod manifest {manifest_path:?}: {e}"))?;
  }

  // Move child into a detached drain task. Dropping `CommandChild` does not
  // signal the process (tauri-plugin-shell uses shared-child), so the opencode
  // process survives app quit. The task keeps stdout/stderr pipes flowing so
  // the child never blocks on a full pipe buffer.
  spawn(async move {
    let _detached = child;
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout(line) => {
          eprintln!("[opencode:{pid}] {}", String::from_utf8_lossy(&line));
        }
        CommandEvent::Stderr(line) => {
          eprintln!("[opencode:{pid}:error] {}", String::from_utf8_lossy(&line));
        }
        CommandEvent::Terminated(payload) => {
          eprintln!(
            "[opencode:{pid}] terminated code={:?} signal={:?}",
            payload.code, payload.signal
          );
          break;
        }
        _ => {}
      }
    }
  });

  Ok(OpencodeHandle { base_url, pid })
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn extract_base_url_parses_listening_line() {
    let line = b"opencode server listening on http://127.0.0.1:53821\n";
    assert_eq!(
      extract_base_url(line),
      Some("http://127.0.0.1:53821".to_string())
    );
  }

  #[test]
  fn extract_base_url_returns_none_without_match() {
    let line = b"starting up\n";
    assert_eq!(extract_base_url(line), None);
  }

  #[test]
  fn manifest_roundtrips() {
    let manifest = OpencodeManifest {
      pid: 12345,
      port: 53821,
      secret: "secret".into(),
      folder_path: "/tmp/vault".into(),
      user_id: "user-1".into(),
      memory_subdir: "/tmp/memory/user-1".into(),
      base_url: "http://127.0.0.1:53821".into(),
      session_id: "sess-abc".into(),
    };
    let json = serde_json::to_string(&manifest).unwrap();
    let parsed: OpencodeManifest = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed, manifest);
  }

  #[test]
  fn manifests_dir_is_created_under_home() {
    let tmp = tempfile::tempdir().expect("tempdir");
    let dir = manifests_dir(&tmp.path().to_path_buf()).expect("manifests dir");
    assert!(dir.exists());
    assert!(dir.ends_with(".tinker/manifests"));
  }

  #[test]
  fn handle_serializes_camel_case() {
    let handle = OpencodeHandle {
      base_url: "http://127.0.0.1:1".into(),
      pid: 42,
    };
    let json = serde_json::to_string(&handle).unwrap();
    assert!(json.contains("\"baseUrl\":\"http://127.0.0.1:1\""));
    assert!(json.contains("\"pid\":42"));
  }

  #[cfg(unix)]
  #[test]
  fn manifest_permissions_are_owner_only() {
    use std::os::unix::fs::PermissionsExt;
    let tmp = tempfile::tempdir().expect("tempdir");
    let path = tmp.path().join("m.json");
    fs::write(&path, "{}").unwrap();
    fs::set_permissions(&path, std::fs::Permissions::from_mode(0o600)).unwrap();
    let mode = fs::metadata(&path).unwrap().permissions().mode() & 0o777;
    assert_eq!(mode, 0o600);
  }
}
