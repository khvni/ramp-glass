import { useEffect, useMemo, useState, type JSX } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { homeDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { exists, mkdir, writeTextFile } from '@tauri-apps/plugin-fs';
import { createOpencodeClient } from '@opencode-ai/sdk/v2/client';
import { createLayoutStore, createMemoryStore, indexVault } from '@tinker/memory';
import type { LayoutStore, MemoryStore, SSOSession } from '@tinker/shared-types';
import { deletePassword, getPassword, setPassword } from 'tauri-plugin-keyring-api';
import {
  DEFAULT_USER_ID,
  GOOGLE_SESSION_ACCOUNT,
  KEYRING_SERVICE,
  ONBOARDING_KEY,
  VAULT_PATH_KEY,
  type GoogleOAuthSession,
} from '../bindings.js';
import { FirstRun } from './panes/FirstRun.js';
import { Workspace } from './workspace/Workspace.js';

type AppState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      layoutStore: LayoutStore;
      memoryStore: MemoryStore;
      opencodeUrl: string;
      session: SSOSession | null;
      vaultPath: string | null;
      onboarded: boolean;
    };

const readStoredSession = async (): Promise<SSOSession | null> => {
  const raw = await getPassword(KEYRING_SERVICE, GOOGLE_SESSION_ACCOUNT);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as SSOSession;
};

const storeSession = async (session: SSOSession | null): Promise<void> => {
  if (!session) {
    await deletePassword(KEYRING_SERVICE, GOOGLE_SESSION_ACCOUNT);
    return;
  }

  await setPassword(KEYRING_SERVICE, GOOGLE_SESSION_ACCOUNT, JSON.stringify(session));
};

const createDefaultVault = async (): Promise<string> => {
  const home = await homeDir();
  const vaultPath = await join(home, 'Tinker', 'knowledge');

  if (!(await exists(vaultPath))) {
    await mkdir(vaultPath, { recursive: true });
  }

  const welcomePath = await join(vaultPath, 'Welcome.md');
  if (!(await exists(welcomePath))) {
    await writeTextFile(
      welcomePath,
      ['---', 'title: Welcome to Tinker', '---', '', '# Welcome', '', 'Your vault is ready.'].join(
        '\n',
      ),
    );
  }

  return vaultPath;
};

const selectVault = async (): Promise<string | null> => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: 'Select your Tinker vault',
  });

  return typeof selected === 'string' ? selected : null;
};

const forwardGoogleAuth = async (opencodeUrl: string, session: SSOSession): Promise<void> => {
  const client = createOpencodeClient({ baseUrl: opencodeUrl });

  await client.auth.set({
    providerID: 'google',
    auth: {
      type: 'oauth',
      access: session.accessToken,
      refresh: session.refreshToken,
      expires: Date.parse(session.expiresAt),
      accountId: session.userId,
    },
  });
};

export const App = (): JSX.Element => {
  const memoryStore = useMemo(() => createMemoryStore(), []);
  const layoutStore = useMemo(() => createLayoutStore(), []);
  const [state, setState] = useState<AppState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [opencodeUrl, session] = await Promise.all([
          invoke<string>('get_opencode_url'),
          readStoredSession(),
        ]);
        const vaultPath = window.localStorage.getItem(VAULT_PATH_KEY);

        if (session) {
          await forwardGoogleAuth(opencodeUrl, session);
        }

        if (vaultPath) {
          await indexVault({ path: vaultPath, isNew: false });
        }

        if (!active) {
          return;
        }

        setState({
          status: 'ready',
          layoutStore,
          memoryStore,
          opencodeUrl,
          session,
          vaultPath,
          onboarded: window.localStorage.getItem(ONBOARDING_KEY) === '1',
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [layoutStore, memoryStore]);

  if (state.status === 'loading') {
    return (
      <div className="tinker-app">
        <main className="tinker-stage">
          <section className="tinker-card">
            <p className="tinker-eyebrow">Booting</p>
            <h1>Tinker is starting the workspace</h1>
            <p className="tinker-muted">Launching OpenCode, loading your vault state, and restoring local context.</p>
          </section>
        </main>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="tinker-app">
        <main className="tinker-stage">
          <section className="tinker-card">
            <p className="tinker-eyebrow">Start-up failed</p>
            <h1>Tinker could not finish booting</h1>
            <p className="tinker-muted">{state.message}</p>
          </section>
        </main>
      </div>
    );
  }

  const setVaultPath = async (vaultPath: string): Promise<void> => {
    await indexVault({ path: vaultPath, isNew: false });
    window.localStorage.setItem(VAULT_PATH_KEY, vaultPath);
    setState((current) =>
      current.status !== 'ready'
        ? current
        : {
            ...current,
            vaultPath,
          },
    );
  };

  const handleGoogleConnect = async (): Promise<void> => {
    const session = await invoke<GoogleOAuthSession>('oauth_flow');
    await storeSession(session);
    await forwardGoogleAuth(state.opencodeUrl, session);

    setState((current) =>
      current.status !== 'ready'
        ? current
        : {
            ...current,
            session,
          },
    );
  };

  const handleGoogleDisconnect = async (): Promise<void> => {
    await storeSession(null);
    setState((current) =>
      current.status !== 'ready'
        ? current
        : {
            ...current,
            session: null,
          },
    );
  };

  const handleCreateVault = async (): Promise<void> => {
    await setVaultPath(await createDefaultVault());
  };

  const handlePickVault = async (): Promise<void> => {
    const vaultPath = await selectVault();
    if (vaultPath) {
      await setVaultPath(vaultPath);
    }
  };

  const finishOnboarding = (): void => {
    window.localStorage.setItem(ONBOARDING_KEY, '1');
    setState((current) =>
      current.status !== 'ready'
        ? current
        : {
            ...current,
            onboarded: true,
          },
    );
  };

  return (
    <div className="tinker-app">
      {!state.onboarded ? (
        <FirstRun
          session={state.session}
          vaultPath={state.vaultPath}
          onConnectGoogle={handleGoogleConnect}
          onCreateVault={handleCreateVault}
          onSelectVault={handlePickVault}
          onContinue={finishOnboarding}
        />
      ) : (
        <Workspace
          key={DEFAULT_USER_ID}
          layoutStore={state.layoutStore}
          memoryStore={state.memoryStore}
          opencodeUrl={state.opencodeUrl}
          session={state.session}
          vaultPath={state.vaultPath}
          onConnectGoogle={handleGoogleConnect}
          onDisconnectGoogle={handleGoogleDisconnect}
          onCreateVault={handleCreateVault}
          onSelectVault={handlePickVault}
        />
      )}
    </div>
  );
};
