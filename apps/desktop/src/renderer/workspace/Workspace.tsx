import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { DockviewReact, type DockviewApi, type DockviewReadyEvent } from 'dockview-react';
import { resolveVaultPath, type MemoryRunState } from '@tinker/memory';
import type { LayoutState, LayoutStore, MemoryStore, SkillStore, SSOStatus } from '@tinker/shared-types';
import { DEFAULT_USER_ID, type OpencodeConnection } from '../../bindings.js';
import { IntegrationsStrip, type MCPStatus } from '../components/IntegrationsStrip.js';
import { Chat } from '../panes/Chat.js';
import { Dojo } from '../panes/Dojo.js';
import { Settings } from '../panes/Settings.js';
import { Today } from '../panes/Today.js';
import { VaultBrowser } from '../panes/VaultBrowser.js';
import { CodeRenderer } from '../renderers/CodeRenderer.js';
import { CsvRenderer } from '../renderers/CsvRenderer.js';
import { HtmlRenderer } from '../renderers/HtmlRenderer.js';
import { ImageRenderer } from '../renderers/ImageRenderer.js';
import { MarkdownEditor } from '../renderers/MarkdownEditor.js';
import { MarkdownRenderer } from '../renderers/MarkdownRenderer.js';
import {
  getPaneKindForPath,
  getPanelIdForPath,
  getPanelTitleForPath,
  isAbsolutePath,
} from '../renderers/file-utils.js';
import { applyDefaultLayout } from './layout.default.js';
import { createPaneRegistry } from './pane-registry.js';
import { DockviewApiContext } from './DockviewContext.js';

const LAYOUT_SAVE_DEBOUNCE_MS = 300;
const LAYOUT_VERSION = 1 as const;

type WorkspaceProps = {
  layoutStore: LayoutStore;
  memoryStore: MemoryStore;
  skillStore: SkillStore;
  modelConnected: boolean;
  modelAuthBusy: boolean;
  modelAuthMessage: string | null;
  googleAuthBusy: boolean;
  googleAuthMessage: string | null;
  githubAuthBusy: boolean;
  githubAuthMessage: string | null;
  opencode: OpencodeConnection;
  sessions: SSOStatus;
  mcpStatus: Record<string, MCPStatus>;
  vaultPath: string | null;
  vaultRevision: number;
  activeSkillsRevision: number;
  memorySweepState: MemoryRunState | null;
  memorySweepBusy: boolean;
  onConnectModel(): Promise<void>;
  onDisconnectModel(): Promise<void>;
  onConnectGoogle(): Promise<void>;
  onConnectGithub(): Promise<void>;
  onDisconnectGoogle(): Promise<void>;
  onDisconnectGithub(): Promise<void>;
  onCreateVault(): Promise<void>;
  onSelectVault(): Promise<void>;
  onActiveSkillsChanged(): void;
  onRunMemorySweep(): Promise<void>;
  onMemoryCommitted(): void;
};

export const Workspace = ({
  layoutStore,
  memoryStore,
  skillStore,
  modelAuthBusy,
  modelAuthMessage,
  modelConnected,
  googleAuthBusy,
  googleAuthMessage,
  githubAuthBusy,
  githubAuthMessage,
  onConnectModel,
  onConnectGithub,
  onConnectGoogle,
  onCreateVault,
  onDisconnectGithub,
  onDisconnectModel,
  onDisconnectGoogle,
  onSelectVault,
  onActiveSkillsChanged,
  mcpStatus,
  opencode,
  sessions,
  vaultPath,
  vaultRevision,
  activeSkillsRevision,
  memorySweepState,
  memorySweepBusy,
  onRunMemorySweep,
  onMemoryCommitted,
}: WorkspaceProps): JSX.Element => {
  const dockviewApiRef = useRef<DockviewApi | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const vaultPathRef = useRef<string | null>(vaultPath);
  const [dockviewApi, setDockviewApi] = useState<DockviewApi | null>(null);

  useEffect(() => {
    vaultPathRef.current = vaultPath;
  }, [vaultPath]);

  const getReferencePanelId = (api: DockviewApi): string | null => {
    return api.activePanel?.id ?? api.panels[0]?.id ?? null;
  };

  const resolveAgentPath = useCallback((reportedPath: string): string | null => {
    if (isAbsolutePath(reportedPath)) {
      return reportedPath;
    }

    const activeVault = vaultPathRef.current;
    if (!activeVault) {
      return null;
    }

    try {
      return resolveVaultPath(activeVault, reportedPath);
    } catch (error) {
      console.warn(`Ignoring agent file event with unsafe path "${reportedPath}".`, error);
      return null;
    }
  }, []);

  const openFileInWorkspace = useCallback(
    (reportedPath: string): void => {
      const api = dockviewApiRef.current;
      if (!api) {
        return;
      }

      const absolutePath = resolveAgentPath(reportedPath);
      if (!absolutePath) {
        return;
      }

      const component = getPaneKindForPath(absolutePath);
      const panelId = getPanelIdForPath(component, absolutePath);
      const existingPanel = api.panels.find((panel) => panel.id === panelId);

      if (existingPanel) {
        existingPanel.api.updateParameters({ path: absolutePath });
        existingPanel.api.setActive();
        return;
      }

      const referencePanelId = getReferencePanelId(api);
      api.addPanel({
        id: panelId,
        component,
        title: getPanelTitleForPath(absolutePath),
        params: { path: absolutePath },
        ...(referencePanelId
          ? {
              position: {
                referencePanel: referencePanelId,
                direction: 'right' as const,
              },
            }
          : {}),
      });
    },
    [resolveAgentPath],
  );

  const components = useMemo(
    () =>
      createPaneRegistry({
        'vault-browser': (props) => <VaultBrowser {...props} vaultRevision={vaultRevision} />,
        chat: () => (
          <Chat
            skillStore={skillStore}
            modelConnected={modelConnected}
            opencode={opencode}
            vaultPath={vaultPath}
            activeSkillsRevision={activeSkillsRevision}
            onFileWritten={openFileInWorkspace}
            onMemoryCommitted={onMemoryCommitted}
          />
        ),
        today: () => (
          <Today
            memoryStore={memoryStore}
            vaultPath={vaultPath}
            vaultRevision={vaultRevision}
            memorySweepState={memorySweepState}
            memorySweepBusy={memorySweepBusy}
            onRunMemorySweep={onRunMemorySweep}
          />
        ),
        settings: () => (
          <Settings
            modelConnected={modelConnected}
            modelAuthBusy={modelAuthBusy}
            modelAuthMessage={modelAuthMessage}
            googleAuthBusy={googleAuthBusy}
            googleAuthMessage={googleAuthMessage}
            githubAuthBusy={githubAuthBusy}
            githubAuthMessage={githubAuthMessage}
            sessions={sessions}
            mcpStatus={mcpStatus}
            vaultPath={vaultPath}
            onConnectModel={onConnectModel}
            onConnectGoogle={onConnectGoogle}
            onConnectGithub={onConnectGithub}
            onDisconnectModel={onDisconnectModel}
            onDisconnectGoogle={onDisconnectGoogle}
            onDisconnectGithub={onDisconnectGithub}
            onCreateVault={onCreateVault}
            onSelectVault={onSelectVault}
          />
        ),
        dojo: (props) => <Dojo {...props} />,
        file: (props) => <CodeRenderer {...props} />,
        markdown: (props) => <MarkdownRenderer {...props} vaultRevision={vaultRevision} />,
        html: (props) => <HtmlRenderer {...props} />,
        csv: (props) => <CsvRenderer {...props} />,
        image: (props) => <ImageRenderer {...props} />,
        code: (props) => <CodeRenderer {...props} />,
        'markdown-editor': (props) => <MarkdownEditor {...props} vaultRevision={vaultRevision} />,
      }),
    [
      activeSkillsRevision,
      memoryStore,
      skillStore,
      modelAuthBusy,
      modelAuthMessage,
      modelConnected,
      memorySweepBusy,
      memorySweepState,
      googleAuthBusy,
      googleAuthMessage,
      githubAuthBusy,
      githubAuthMessage,
      onConnectGoogle,
      onConnectGithub,
      onConnectModel,
      onCreateVault,
      onDisconnectGoogle,
      onDisconnectGithub,
      onDisconnectModel,
      onMemoryCommitted,
      onRunMemorySweep,
      onSelectVault,
      opencode,
      sessions,
      mcpStatus,
      vaultPath,
      vaultRevision,
      openFileInWorkspace,
    ],
  );

  const saveLayoutNow = useCallback(
    (api: DockviewApi): void => {
      const snapshot: LayoutState = {
        version: LAYOUT_VERSION,
        dockviewModel: api.toJSON(),
        updatedAt: new Date().toISOString(),
      };

      void layoutStore.save(DEFAULT_USER_ID, snapshot).catch((error) => {
        console.warn('Failed to persist workspace layout.', error);
      });
    },
    [layoutStore],
  );

  const scheduleLayoutSave = useCallback(
    (api: DockviewApi): void => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null;
        saveLayoutNow(api);
      }, LAYOUT_SAVE_DEBOUNCE_MS);
    },
    [saveLayoutNow],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;

        const api = dockviewApiRef.current;
        if (api) {
          saveLayoutNow(api);
        }
      }
    };
  }, [saveLayoutNow]);

  const onReady = (event: DockviewReadyEvent): void => {
    dockviewApiRef.current = event.api;

    void (async () => {
      let savedLayout: LayoutState | null = null;
      try {
        savedLayout = await layoutStore.load(DEFAULT_USER_ID);
      } catch (error) {
        console.warn('Failed to load saved workspace layout. Falling back to default.', error);
      }

      let hydrated = false;
      if (savedLayout?.dockviewModel) {
        try {
          event.api.fromJSON(savedLayout.dockviewModel as ReturnType<typeof event.api.toJSON>);
          hydrated = event.api.panels.length > 0;
        } catch (error) {
          console.warn('Stored workspace layout could not be hydrated. Falling back to default.', error);
          hydrated = false;
        }
      }

      if (!hydrated) {
        event.api.clear();
        applyDefaultLayout(event.api, {
          memoryStore,
          skillStore,
          vaultPath,
        });
      }

      event.api.panels
        .filter((panel) => panel.id === 'vault-browser')
        .forEach((panel) => {
          panel.api.updateParameters({
            memoryStore,
            vaultPath,
          });
        });

      event.api.panels
        .filter((panel) => panel.id === 'dojo')
        .forEach((panel) => {
          panel.api.updateParameters({
            skillStore,
            onActiveSkillsChanged,
            vaultPath,
          });
        });

      event.api.onDidAddPanel(() => scheduleLayoutSave(event.api));
      event.api.onDidRemovePanel(() => scheduleLayoutSave(event.api));
      event.api.onDidMovePanel(() => scheduleLayoutSave(event.api));
      event.api.onDidActivePanelChange(() => scheduleLayoutSave(event.api));

      setDockviewApi(event.api);
      scheduleLayoutSave(event.api);
    })();
  };

  useEffect(() => {
    const api = dockviewApi;
    if (!api) {
      return;
    }

    api.panels
      .filter((panel) => panel.id === 'vault-browser')
      .forEach((panel) => {
        panel.api.updateParameters({
          memoryStore,
          vaultPath,
        });
      });

    api.panels
      .filter((panel) => panel.id === 'dojo')
      .forEach((panel) => {
        panel.api.updateParameters({
          skillStore,
          vaultPath,
          onActiveSkillsChanged,
        });
      });

    if (!vaultPath) {
      return;
    }

    if (!api.panels.some((panel) => panel.id === 'vault-browser')) {
      const referencePanelId = getReferencePanelId(api);
      api.addPanel({
        id: 'vault-browser',
        component: 'vault-browser',
        title: 'Vault',
        params: {
          memoryStore,
          vaultPath,
        },
        initialWidth: 280,
        inactive: true,
        ...(referencePanelId
          ? {
              position: {
                referencePanel: referencePanelId,
                direction: 'left' as const,
              },
            }
          : {}),
      });
    }

    if (!api.panels.some((panel) => panel.id === 'dojo')) {
      const referencePanelId = getReferencePanelId(api);
      api.addPanel({
        id: 'dojo',
        component: 'dojo',
        title: 'Dojo',
        params: {
          skillStore,
          vaultPath,
          onActiveSkillsChanged,
        },
        inactive: true,
        ...(referencePanelId
          ? {
              position: {
                referencePanel: referencePanelId,
                direction: 'within' as const,
              },
            }
          : {}),
      });
    }
  }, [dockviewApi, memoryStore, skillStore, vaultPath, onActiveSkillsChanged]);

  return (
    <main className="tinker-workspace-shell">
      <header className="tinker-header">
        <div>
          <p className="tinker-eyebrow">Workspace</p>
          <h1>Tinker</h1>
        </div>
        <div className="tinker-header-meta">
          <span className="tinker-pill">{modelConnected ? 'GPT-5.4 connected' : 'GPT-5.4 disconnected'}</span>
          <span className="tinker-pill">{sessions.google?.email ?? sessions.github?.email ?? 'Offline mode'}</span>
          <span className="tinker-pill">{vaultPath ?? 'No vault selected'}</span>
        </div>
      </header>

      <div className="tinker-workspace-integrations">
        <IntegrationsStrip compact mcpStatus={mcpStatus} sessions={sessions} />
      </div>

      <DockviewApiContext.Provider value={dockviewApi}>
        <DockviewReact className="dockview-theme-abyss tinker-dockview" components={components} onReady={onReady} />
      </DockviewApiContext.Provider>
    </main>
  );
};
