import { useMemo, type JSX } from 'react';
import { DockviewReact, type DockviewReadyEvent } from 'dockview-react';
import type { LayoutStore, MemoryStore, SSOSession } from '@tinker/shared-types';
import { DEFAULT_USER_ID } from '../../bindings.js';
import { Chat } from '../panes/Chat.js';
import { Settings } from '../panes/Settings.js';
import { Today } from '../panes/Today.js';
import { applyDefaultLayout } from './layout.default.js';
import { createPaneRegistry } from './pane-registry.js';

type WorkspaceProps = {
  layoutStore: LayoutStore;
  memoryStore: MemoryStore;
  opencodeUrl: string;
  session: SSOSession | null;
  vaultPath: string | null;
  onConnectGoogle(): Promise<void>;
  onDisconnectGoogle(): Promise<void>;
  onCreateVault(): Promise<void>;
  onSelectVault(): Promise<void>;
};

export const Workspace = ({
  layoutStore,
  memoryStore,
  onConnectGoogle,
  onCreateVault,
  onDisconnectGoogle,
  onSelectVault,
  opencodeUrl,
  session,
  vaultPath,
}: WorkspaceProps): JSX.Element => {
  const components = useMemo(
    () =>
      createPaneRegistry({
        chat: () => <Chat memoryStore={memoryStore} opencodeUrl={opencodeUrl} />,
        today: () => <Today memoryStore={memoryStore} vaultPath={vaultPath} />,
        settings: () => (
          <Settings
            session={session}
            vaultPath={vaultPath}
            onConnectGoogle={onConnectGoogle}
            onDisconnectGoogle={onDisconnectGoogle}
            onCreateVault={onCreateVault}
            onSelectVault={onSelectVault}
          />
        ),
        file: () => <section className="tinker-pane">File panes land here.</section>,
        markdown: () => <section className="tinker-pane">Markdown panes land here.</section>,
        html: () => <section className="tinker-pane">HTML panes land here.</section>,
        csv: () => <section className="tinker-pane">CSV panes land here.</section>,
        image: () => <section className="tinker-pane">Image panes land here.</section>,
        code: () => <section className="tinker-pane">Code panes land here.</section>,
        'markdown-editor': () => <section className="tinker-pane">Markdown editor lands here.</section>,
      }),
    [memoryStore, onConnectGoogle, onCreateVault, onDisconnectGoogle, onSelectVault, opencodeUrl, session, vaultPath],
  );

  const onReady = (event: DockviewReadyEvent): void => {
    void (async () => {
      const savedLayout = await layoutStore.load(DEFAULT_USER_ID);

      if (savedLayout?.dockviewModel) {
        event.api.fromJSON(savedLayout.dockviewModel as ReturnType<typeof event.api.toJSON>);
      } else {
        applyDefaultLayout(event.api);
      }

      event.api.onDidLayoutChange(() => {
        void layoutStore.save(DEFAULT_USER_ID, {
          version: 1,
          dockviewModel: event.api.toJSON(),
          updatedAt: new Date().toISOString(),
        });
      });
    })();
  };

  return (
    <main className="tinker-workspace-shell">
      <header className="tinker-header">
        <div>
          <p className="tinker-eyebrow">Workspace</p>
          <h1>Tinker</h1>
        </div>
        <div className="tinker-header-meta">
          <span className="tinker-pill">{session ? session.email : 'Offline mode'}</span>
          <span className="tinker-pill">{vaultPath ?? 'No vault selected'}</span>
        </div>
      </header>

      <DockviewReact className="dockview-theme-abyss tinker-dockview" components={components} onReady={onReady} />
    </main>
  );
};
