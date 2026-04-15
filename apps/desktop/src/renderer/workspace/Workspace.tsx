import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { DockviewReact, type DockviewApi, type DockviewReadyEvent } from 'dockview-react';
import { resolveVaultPath } from '@tinker/memory';
import {
  createDefaultWorkspacePreferences,
  type LayoutState,
  type LayoutStore,
  type MemoryStore,
  type ScheduledJobStore,
  type SkillStore,
  type SSOSession,
  type WorkspacePreferences,
} from '@tinker/shared-types';
import { DEFAULT_USER_ID, type OpencodeConnection } from '../../bindings.js';
import { Chat } from '../panes/Chat.js';
import { Dojo } from '../panes/Dojo.js';
import { SchedulerPane } from '../panes/SchedulerPane.js';
import { Settings } from '../panes/Settings.js';
import { Today } from '../panes/Today.js';
import { VaultBrowser } from '../panes/VaultBrowser.js';
import { CodeRenderer } from '../renderers/CodeRenderer.js';
import { CsvRenderer } from '../renderers/CsvRenderer.js';
import { HtmlRenderer } from '../renderers/HtmlRenderer.js';
import { ImageRenderer } from '../renderers/ImageRenderer.js';
import { MarkdownEditor } from '../renderers/MarkdownEditor.js';
import { MarkdownRenderer } from '../renderers/MarkdownRenderer.js';
import { isAbsolutePath } from '../renderers/file-utils.js';
import { DockviewApiContext } from './DockviewContext.js';
import { openNewChatPanel } from './chat-panels.js';
import { applyDefaultLayout } from './layout.default.js';
import { openWorkspaceFile } from './file-open.js';
import { createPaneRegistry } from './pane-registry.js';

const LAYOUT_SAVE_DEBOUNCE_MS = 300;
const LAYOUT_VERSION = 1 as const;

type WorkspaceProps = {
  layoutStore: LayoutStore;
  memoryStore: MemoryStore;
  schedulerStore: ScheduledJobStore;
  schedulerRevision: number;
  skillStore: SkillStore;
  modelConnected: boolean;
  modelAuthBusy: boolean;
  modelAuthMessage: string | null;
  googleAuthBusy: boolean;
  googleAuthMessage: string | null;
  opencode: OpencodeConnection;
  session: SSOSession | null;
  vaultPath: string | null;
  vaultRevision: number;
  activeSkillsRevision: number;
  onConnectModel(): Promise<void>;
  onDisconnectModel(): Promise<void>;
  onConnectGoogle(): Promise<void>;
  onDisconnectGoogle(): Promise<void>;
  onCreateVault(): Promise<void>;
  onSelectVault(): Promise<void>;
  onActiveSkillsChanged(): void;
  onRunScheduledJobNow(jobId: string): Promise<void>;
  onSchedulerChanged(): void;
};

export const Workspace = ({
  layoutStore,
  memoryStore,
  schedulerStore,
  schedulerRevision,
  skillStore,
  modelAuthBusy,
  modelAuthMessage,
  modelConnected,
  googleAuthBusy,
  googleAuthMessage,
  onConnectModel,
  onConnectGoogle,
  onCreateVault,
  onDisconnectModel,
  onDisconnectGoogle,
  onSelectVault,
  onActiveSkillsChanged,
  onRunScheduledJobNow,
  onSchedulerChanged,
  opencode,
  session,
  vaultPath,
  vaultRevision,
  activeSkillsRevision,
}: WorkspaceProps): JSX.Element => {
  const dockviewApiRef = useRef<DockviewApi | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const vaultPathRef = useRef<string | null>(vaultPath);
  const workspacePreferencesRef = useRef<WorkspacePreferences>(createDefaultWorkspacePreferences());
  const [dockviewApi, setDockviewApi] = useState<DockviewApi | null>(null);
  const [workspacePreferences, setWorkspacePreferences] = useState<WorkspacePreferences>(createDefaultWorkspacePreferences);

  useEffect(() => {
    vaultPathRef.current = vaultPath;
  }, [vaultPath]);

  useEffect(() => {
    workspacePreferencesRef.current = workspacePreferences;
  }, [workspacePreferences]);

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

  const openFileInWorkspace = useCallback((reportedPath: string): void => {
    const api = dockviewApiRef.current;
    if (!api) {
      return;
    }

    const absolutePath = resolveAgentPath(reportedPath);
    if (!absolutePath) {
      return;
    }

    openWorkspaceFile(api, absolutePath);
  }, [resolveAgentPath]);

  const openNewChatPane = useCallback((): void => {
    const api = dockviewApiRef.current;
    if (!api) {
      return;
    }

    openNewChatPanel(api);
  }, []);

  const handleAgentFileWritten = useCallback(
    (reportedPath: string): void => {
      if (!workspacePreferencesRef.current.autoOpenAgentWrittenFiles) {
        return;
      }

      openFileInWorkspace(reportedPath);
    },
    [openFileInWorkspace],
  );

  const saveLayoutNow = useCallback(
    (api: DockviewApi): void => {
      const snapshot: LayoutState = {
        version: LAYOUT_VERSION,
        dockviewModel: api.toJSON(),
        updatedAt: new Date().toISOString(),
        preferences: workspacePreferencesRef.current,
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

  const handleWorkspacePreferencesChange = useCallback(
    (nextPreferences: WorkspacePreferences): void => {
      workspacePreferencesRef.current = nextPreferences;
      setWorkspacePreferences(nextPreferences);

      const api = dockviewApiRef.current;
      if (api) {
        saveLayoutNow(api);
      }
    },
    [saveLayoutNow],
  );

  const openSchedulerPane = (): void => {
    const api = dockviewApiRef.current;
    if (!api) {
      return;
    }

    const existingPanel = api.panels.find((panel) => panel.id === 'scheduler');
    if (existingPanel) {
      existingPanel.api.setActive();
      return;
    }

    const referencePanelId = getReferencePanelId(api);
    api.addPanel({
      id: 'scheduler',
      component: 'scheduler',
      title: 'Scheduler',
      ...(referencePanelId
        ? {
            position: {
              referencePanel: referencePanelId,
              direction: 'within' as const,
            },
          }
        : {}),
    });
  };

  const components = useMemo(
    () =>
      createPaneRegistry({
        'vault-browser': (props) => <VaultBrowser {...props} vaultRevision={vaultRevision} />,
        chat: () => (
          <Chat
            memoryStore={memoryStore}
            skillStore={skillStore}
            modelConnected={modelConnected}
            opencode={opencode}
            vaultPath={vaultPath}
            activeSkillsRevision={activeSkillsRevision}
            onFileWritten={handleAgentFileWritten}
            onOpenNewChat={openNewChatPane}
          />
        ),
        today: () => (
          <Today
            memoryStore={memoryStore}
            schedulerStore={schedulerStore}
            vaultPath={vaultPath}
            vaultRevision={vaultRevision}
            schedulerRevision={schedulerRevision}
          />
        ),
        scheduler: () => (
          <SchedulerPane
            schedulerStore={schedulerStore}
            schedulerRevision={schedulerRevision}
            vaultPath={vaultPath}
            onRunJobNow={onRunScheduledJobNow}
            onSchedulerChanged={onSchedulerChanged}
          />
        ),
        settings: () => (
          <Settings
            modelConnected={modelConnected}
            modelAuthBusy={modelAuthBusy}
            modelAuthMessage={modelAuthMessage}
            googleAuthBusy={googleAuthBusy}
            googleAuthMessage={googleAuthMessage}
            session={session}
            vaultPath={vaultPath}
            onConnectModel={onConnectModel}
            onConnectGoogle={onConnectGoogle}
            onDisconnectModel={onDisconnectModel}
            onDisconnectGoogle={onDisconnectGoogle}
            onCreateVault={onCreateVault}
            onSelectVault={onSelectVault}
            workspacePreferences={workspacePreferences}
            onWorkspacePreferencesChange={handleWorkspacePreferencesChange}
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
      modelAuthBusy,
      modelAuthMessage,
      modelConnected,
      googleAuthBusy,
      googleAuthMessage,
      onConnectGoogle,
      onConnectModel,
      onCreateVault,
      onDisconnectGoogle,
      onDisconnectModel,
      onRunScheduledJobNow,
      onSchedulerChanged,
      onSelectVault,
      opencode,
      handleAgentFileWritten,
      openFileInWorkspace,
      openNewChatPane,
      schedulerRevision,
      schedulerStore,
      session,
      skillStore,
      vaultPath,
      vaultRevision,
      handleWorkspacePreferencesChange,
      workspacePreferences,
    ],
  );

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
      const nextPreferences = savedLayout?.preferences ?? createDefaultWorkspacePreferences();
      workspacePreferencesRef.current = nextPreferences;
      setWorkspacePreferences(nextPreferences);

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
            vaultPath,
            onActiveSkillsChanged,
          });
        });

      event.api.onDidLayoutChange(() => {
        scheduleLayoutSave(event.api);
      });

      setDockviewApi(event.api);
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
  }, [dockviewApi, memoryStore, onActiveSkillsChanged, skillStore, vaultPath]);

  return (
    <main className="tinker-workspace-shell">
      <header className="tinker-header">
        <div>
          <p className="tinker-eyebrow">Workspace</p>
          <h1>Tinker</h1>
        </div>
        <div className="tinker-inline-actions">
          <button className="tinker-button-secondary" type="button" onClick={openSchedulerPane} disabled={!dockviewApi}>
            Open scheduler
          </button>
          <button className="tinker-button-secondary" type="button" onClick={openNewChatPane} disabled={!dockviewApi}>
            New chat tab
          </button>
        </div>
        <div className="tinker-header-meta">
          <span className="tinker-pill">{modelConnected ? 'GPT-5.4 connected' : 'GPT-5.4 disconnected'}</span>
          <span className="tinker-pill">{session ? session.email : 'Offline mode'}</span>
          <span className="tinker-pill">{vaultPath ?? 'No vault selected'}</span>
        </div>
      </header>

      <DockviewApiContext.Provider value={dockviewApi}>
        <DockviewReact className="dockview-theme-abyss tinker-dockview" components={components} onReady={onReady} />
      </DockviewApiContext.Provider>
    </main>
  );
};
