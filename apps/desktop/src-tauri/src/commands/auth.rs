use std::collections::HashMap;

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use chrono::{Duration, Utc};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Runtime};
use tauri_plugin_keyring::KeyringExt;
use tokio::{
  io::{AsyncReadExt, AsyncWriteExt},
  net::TcpListener,
  time::{sleep, timeout, Duration as TokioDuration},
};
use url::Url;

pub const KEYRING_SERVICE: &str = "tinker";
pub const GOOGLE_SESSION_ACCOUNT: &str = "google-session";
pub const GITHUB_SESSION_ACCOUNT: &str = "github-session";

const GOOGLE_AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL: &str = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_CLIENT_ID_PLACEHOLDER: &str = "GOOGLE_OAUTH_CLIENT_ID_PLACEHOLDER";
const GOOGLE_SCOPES: [&str; 6] = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

const GITHUB_DEVICE_CODE_URL: &str = "https://github.com/login/device/code";
const GITHUB_ACCESS_TOKEN_URL: &str = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL: &str = "https://api.github.com/user";
const GITHUB_EMAILS_URL: &str = "https://api.github.com/user/emails";
const GITHUB_CLIENT_ID_PLACEHOLDER: &str = "GITHUB_OAUTH_CLIENT_ID_PLACEHOLDER";
const GITHUB_SCOPES: [&str; 3] = ["read:user", "user:email", "repo"];
const APP_USER_AGENT: &str = "tinker-desktop";

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AuthProvider {
  Google,
  Github,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SSOSession {
  provider: AuthProvider,
  user_id: String,
  email: String,
  display_name: String,
  avatar_url: Option<String>,
  access_token: String,
  refresh_token: String,
  expires_at: String,
  scopes: Vec<String>,
}

impl SSOSession {
  pub fn access_token(&self) -> &str {
    &self.access_token
  }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthStatus {
  google: Option<SSOSession>,
  github: Option<SSOSession>,
}

#[derive(Deserialize)]
struct GoogleTokenResponse {
  access_token: String,
  expires_in: i64,
  refresh_token: Option<String>,
  scope: String,
}

#[derive(Deserialize)]
struct GoogleUserInfo {
  id: String,
  email: String,
  name: String,
  picture: Option<String>,
}

#[derive(Deserialize)]
struct GithubDeviceCodeResponse {
  device_code: String,
  user_code: String,
  verification_uri: String,
  verification_uri_complete: Option<String>,
  expires_in: i64,
  interval: Option<u64>,
}

#[derive(Clone, Deserialize)]
struct GithubAccessTokenResponse {
  access_token: Option<String>,
  expires_in: Option<i64>,
  refresh_token: Option<String>,
  scope: Option<String>,
  error: Option<String>,
  error_description: Option<String>,
}

#[derive(Deserialize)]
struct GithubUser {
  id: u64,
  login: String,
  email: Option<String>,
  name: Option<String>,
  avatar_url: Option<String>,
}

#[derive(Deserialize)]
struct GithubEmail {
  email: String,
  verified: bool,
  primary: bool,
}

fn google_client_id() -> String {
  std::env::var("GOOGLE_OAUTH_CLIENT_ID").unwrap_or_else(|_| GOOGLE_CLIENT_ID_PLACEHOLDER.to_string())
}

fn github_client_id() -> String {
  std::env::var("GITHUB_OAUTH_CLIENT_ID").unwrap_or_else(|_| GITHUB_CLIENT_ID_PLACEHOLDER.to_string())
}

fn random_url_safe(bytes: usize) -> String {
  let mut buffer = vec![0_u8; bytes];
  OsRng.fill_bytes(&mut buffer);
  URL_SAFE_NO_PAD.encode(buffer)
}

fn pkce_challenge(verifier: &str) -> String {
  let digest = Sha256::digest(verifier.as_bytes());
  URL_SAFE_NO_PAD.encode(digest)
}

fn provider_account(provider: AuthProvider) -> &'static str {
  match provider {
    AuthProvider::Google => GOOGLE_SESSION_ACCOUNT,
    AuthProvider::Github => GITHUB_SESSION_ACCOUNT,
  }
}

fn parse_callback_request(request: &str) -> Result<HashMap<String, String>, String> {
  let request_line = request
    .lines()
    .next()
    .ok_or_else(|| "Missing OAuth callback request line.".to_string())?;
  let path = request_line
    .split_whitespace()
    .nth(1)
    .ok_or_else(|| "Missing OAuth callback path.".to_string())?;
  let url = Url::parse(&format!("http://127.0.0.1{path}")).map_err(|error| error.to_string())?;

  Ok(url.query_pairs().into_owned().collect())
}

fn keyring_error(error: impl std::fmt::Display) -> String {
  format!("Keychain operation failed: {error}")
}

fn token_access_token(response: &GithubAccessTokenResponse) -> Option<&str> {
  response.access_token.as_deref().filter(|token| !token.is_empty())
}

fn store_session<R: Runtime>(app: &AppHandle<R>, session: &SSOSession) -> Result<(), String> {
  app
    .keyring()
    .set_password(
      KEYRING_SERVICE,
      provider_account(session.provider),
      &serde_json::to_string(session).map_err(|error| error.to_string())?,
    )
    .map_err(keyring_error)
}

fn read_session<R: Runtime>(app: &AppHandle<R>, provider: AuthProvider) -> Result<Option<SSOSession>, String> {
  let account = provider_account(provider);
  let raw = app
    .keyring()
    .get_password(KEYRING_SERVICE, account)
    .map_err(keyring_error)?;

  let Some(raw) = raw else {
    return Ok(None);
  };

  match serde_json::from_str::<SSOSession>(&raw) {
    Ok(session) if session.provider == provider => Ok(Some(session)),
    Ok(_) | Err(_) => {
      clear_session(app, provider)?;
      Ok(None)
    }
  }
}

fn clear_session<R: Runtime>(app: &AppHandle<R>, provider: AuthProvider) -> Result<(), String> {
  let account = provider_account(provider);
  let existing = app
    .keyring()
    .get_password(KEYRING_SERVICE, account)
    .map_err(keyring_error)?;

  if existing.is_none() {
    return Ok(());
  }

  app
    .keyring()
    .delete_password(KEYRING_SERVICE, account)
    .map_err(keyring_error)
}

async fn read_google_authorization_code(state: &str, challenge: &str) -> Result<(String, String), String> {
  let listener = TcpListener::bind("127.0.0.1:0")
    .await
    .map_err(|error| error.to_string())?;
  let redirect_uri = format!(
    "http://127.0.0.1:{}/callback",
    listener.local_addr().map_err(|error| error.to_string())?.port()
  );

  let auth_url = Url::parse_with_params(
    GOOGLE_AUTH_URL,
    &[
      ("client_id", google_client_id()),
      ("redirect_uri", redirect_uri.clone()),
      ("response_type", "code".to_string()),
      ("scope", GOOGLE_SCOPES.join(" ")),
      ("state", state.to_string()),
      ("code_challenge", challenge.to_string()),
      ("code_challenge_method", "S256".to_string()),
      ("access_type", "offline".to_string()),
      ("prompt", "consent".to_string()),
    ],
  )
  .map_err(|error| error.to_string())?;

  webbrowser::open(auth_url.as_str()).map_err(|error| error.to_string())?;

  let (mut stream, _) = timeout(TokioDuration::from_secs(180), listener.accept())
    .await
    .map_err(|_| "Timed out waiting for Google OAuth callback.".to_string())?
    .map_err(|error| error.to_string())?;

  let mut buffer = [0_u8; 8192];
  let bytes_read = stream
    .read(&mut buffer)
    .await
    .map_err(|error| error.to_string())?;
  let request = String::from_utf8_lossy(&buffer[..bytes_read]);
  let params = parse_callback_request(&request)?;

  stream
    .write_all(
      b"HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<html><body><h1>Tinker</h1><p>You can close this window and return to the app.</p></body></html>",
    )
    .await
    .map_err(|error| error.to_string())?;

  let returned_state = params
    .get("state")
    .ok_or_else(|| "Google OAuth callback did not include state.".to_string())?;
  if returned_state != state {
    return Err("Google OAuth callback state did not match request.".to_string());
  }

  let code = params
    .get("code")
    .ok_or_else(|| "Google OAuth callback did not include code.".to_string())?;

  Ok((code.clone(), redirect_uri))
}

async fn sign_in_google<R: Runtime>(app: &AppHandle<R>) -> Result<SSOSession, String> {
  let previous = read_session(app, AuthProvider::Google)?;
  let state = random_url_safe(24);
  let verifier = random_url_safe(48);
  let challenge = pkce_challenge(&verifier);
  let (code, redirect_uri) = read_google_authorization_code(&state, &challenge).await?;

  let token = reqwest::Client::new()
    .post(GOOGLE_TOKEN_URL)
    .form(&[
      ("client_id", google_client_id()),
      ("code", code),
      ("code_verifier", verifier),
      ("grant_type", "authorization_code".to_string()),
      ("redirect_uri", redirect_uri),
    ])
    .send()
    .await
    .map_err(|error| error.to_string())?
    .error_for_status()
    .map_err(|error| error.to_string())?
    .json::<GoogleTokenResponse>()
    .await
    .map_err(|error| error.to_string())?;

  let user = reqwest::Client::new()
    .get(GOOGLE_USERINFO_URL)
    .bearer_auth(&token.access_token)
    .send()
    .await
    .map_err(|error| error.to_string())?
    .error_for_status()
    .map_err(|error| error.to_string())?
    .json::<GoogleUserInfo>()
    .await
    .map_err(|error| error.to_string())?;

  let refresh_token = token
    .refresh_token
    .filter(|token| !token.is_empty())
    .or_else(|| previous.as_ref().map(|session| session.refresh_token.clone()))
    .unwrap_or_default();

  let session = SSOSession {
    provider: AuthProvider::Google,
    user_id: user.id,
    email: user.email,
    display_name: user.name,
    avatar_url: user.picture,
    access_token: token.access_token,
    refresh_token,
    expires_at: (Utc::now() + Duration::seconds(token.expires_in)).to_rfc3339(),
    scopes: token.scope.split_whitespace().map(ToString::to_string).collect(),
  };

  store_session(app, &session)?;
  Ok(session)
}

async fn sign_in_github<R: Runtime>(app: &AppHandle<R>) -> Result<SSOSession, String> {
  let client = reqwest::Client::builder()
    .user_agent(APP_USER_AGENT)
    .build()
    .map_err(|error| error.to_string())?;

  let device = client
    .post(GITHUB_DEVICE_CODE_URL)
    .header("Accept", "application/json")
    .form(&[
      ("client_id", github_client_id()),
      ("scope", GITHUB_SCOPES.join(" ")),
    ])
    .send()
    .await
    .map_err(|error| error.to_string())?
    .error_for_status()
    .map_err(|error| error.to_string())?
    .json::<GithubDeviceCodeResponse>()
    .await
    .map_err(|error| error.to_string())?;

  let auth_url = device
    .verification_uri_complete
    .clone()
    .unwrap_or_else(|| device.verification_uri.clone());
  webbrowser::open(&auth_url).map_err(|error| error.to_string())?;

  let started_at = Utc::now();
  let mut interval = device.interval.unwrap_or(5);
  loop {
    if (Utc::now() - started_at) >= Duration::seconds(device.expires_in) {
      return Err(format!(
        "GitHub device sign-in timed out. Retry and enter code {} at {}.",
        device.user_code, device.verification_uri
      ));
    }

    sleep(TokioDuration::from_secs(interval)).await;

    let token = client
      .post(GITHUB_ACCESS_TOKEN_URL)
      .header("Accept", "application/json")
      .form(&[
        ("client_id", github_client_id()),
        ("device_code", device.device_code.clone()),
        ("grant_type", "urn:ietf:params:oauth:grant-type:device_code".to_string()),
      ])
      .send()
      .await
      .map_err(|error| error.to_string())?
      .error_for_status()
      .map_err(|error| error.to_string())?
      .json::<GithubAccessTokenResponse>()
      .await
      .map_err(|error| error.to_string())?;

    if let Some(access_token) = token_access_token(&token) {
      let user = client
        .get(GITHUB_USER_URL)
        .bearer_auth(access_token)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|error| error.to_string())?
        .error_for_status()
        .map_err(|error| error.to_string())?
        .json::<GithubUser>()
        .await
        .map_err(|error| error.to_string())?;

      let emails = client
        .get(GITHUB_EMAILS_URL)
        .bearer_auth(access_token)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|error| error.to_string())?
        .error_for_status()
        .map_err(|error| error.to_string())?
        .json::<Vec<GithubEmail>>()
        .await
        .unwrap_or_default();

      let email = user
        .email
        .clone()
        .or_else(|| {
          emails
            .iter()
            .find(|email| email.primary && email.verified)
            .map(|email| email.email.clone())
        })
        .or_else(|| {
          emails
            .iter()
            .find(|email| email.verified)
            .map(|email| email.email.clone())
        })
        .unwrap_or_else(|| format!("{}@users.noreply.github.com", user.login));

      let session = SSOSession {
        provider: AuthProvider::Github,
        user_id: user.id.to_string(),
        email,
        display_name: user.name.unwrap_or_else(|| user.login.clone()),
        avatar_url: user.avatar_url,
        access_token: access_token.to_string(),
        refresh_token: token.refresh_token.unwrap_or_default(),
        expires_at: token
          .expires_in
          .map(|seconds| (Utc::now() + Duration::seconds(seconds)).to_rfc3339())
          .unwrap_or_else(|| (Utc::now() + Duration::days(3650)).to_rfc3339()),
        scopes: token
          .scope
          .unwrap_or_else(|| GITHUB_SCOPES.join(","))
          .split([',', ' '])
          .filter(|scope| !scope.is_empty())
          .map(ToString::to_string)
          .collect(),
      };

      store_session(app, &session)?;
      return Ok(session);
    }

    match token.error.as_deref() {
      Some("authorization_pending") => continue,
      Some("slow_down") => {
        interval += 5;
        continue;
      }
      Some("expired_token") => {
        return Err(format!(
          "GitHub device code expired. Retry and enter code {} at {}.",
          device.user_code, device.verification_uri
        ));
      }
      Some("access_denied") => return Err("GitHub sign-in was denied.".to_string()),
      Some(error) => {
        return Err(
          token
            .error_description
            .unwrap_or_else(|| format!("GitHub token exchange failed: {error}")),
        );
      }
      None => return Err("GitHub token exchange did not return access token.".to_string()),
    }
  }
}

#[tauri::command]
pub async fn auth_sign_in<R: Runtime>(app: AppHandle<R>, provider: AuthProvider) -> Result<SSOSession, String> {
  match provider {
    AuthProvider::Google => sign_in_google(&app).await,
    AuthProvider::Github => sign_in_github(&app).await,
  }
}

#[tauri::command]
pub fn auth_sign_out<R: Runtime>(app: AppHandle<R>, provider: AuthProvider) -> Result<(), String> {
  clear_session(&app, provider)
}

#[tauri::command]
pub fn auth_status<R: Runtime>(app: AppHandle<R>) -> Result<AuthStatus, String> {
  Ok(AuthStatus {
    google: read_session(&app, AuthProvider::Google)?,
    github: read_session(&app, AuthProvider::Github)?,
  })
}
