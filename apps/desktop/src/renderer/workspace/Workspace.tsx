import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import {
  Workspace as PaneWorkspace,
  createWorkspaceStore,
  selectWorkspaceSnapshot,
  type PaneRegistry,
  type PaneRendererProps,
  type WorkspaceStore,
} from '@tinker/panes';
import { Badge, Button } from '@tinker/design';
import { resolveVaultPath, type MemoryRunState } from '@tinker/memory';
import {
  createDefaultWorkspacePreferences,
  type LayoutState,
  type LayoutStore,
  type MemoryStore,
  type ScheduledJobStore,
  type SkillStore,
  type SSOStatus,
  type TinkerPaneData,
  type WorkspacePreferences,
} from '@tinker/shared-types';
import { DEFAULT_USER_ID, type OpencodeConnection } from '../../bindings.js';
import { IntegrationsStrip } from '../components/IntegrationsStrip.js';
import type { MCPStatus } from '../integrations.js';
import { Settings } from '../panes/Settings.js';
import { isAbsolutePath } from '../renderers/file-utils.js';
import { FilePaneRuntimeContext } from '../panes/FilePane/file-pane-runtime.js';
import { ChatPaneRuntimeContext } from './chat-pane-runtime.js';
import { openWorkspaceFile } from './file-open.js';
import { createDefaultLayout } from './layout.default.js';
import { getRenderer } from './pane-registry.js';
import { registerWorkspacePaneRenderers } from './register-pane-renderers.js';
import { registerWorkspacePanes } from './register-panes.js';

const LAYOUT_SAVE_DEBOUNCE_MS = 300;
const LAYOUT_VERSION = 2 as const;
const CHAT_TAB_PATTERN = /^chat(?:-(\d+))?$/u;

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
  onRunScheduledJobNow(jobId: string): Promise<void>;
  onSchedulerChanged(): void;
  onRunMemorySweep(): Promise<void>;
  onMemoryCommitted(): void;
};

const getChatTabIndex = (tabId: string): number | null => {
  const match = tabId.match(CHAT_TAB_PATTERN);
  if (!match) {
    return null;
  }

  return match[1] ? Number(match[1]) : 1;
};

const getNextChatTabId = (tabIds: readonly string[]): string => {
  const nextIndex = tabIds.reduce((highest, tabId) => {
    const index = getChatTabIndex(tabId);
    return index && index > highest ? index : highest;
  }, 0);

  return nextIndex === 0 ? 'chat' : `chat-${nextIndex + 1}`;
};

const getChatTabTitle = (tabId: string): string => {
  const index = getChatTabIndex(tabId);
  return index && index > 1 ? `Chat ${index}` : 'Chat';
};

const openNewChatTab = (store: WorkspaceStore<TinkerPaneData>): void => {
  const tabId = getNextChatTabId(store.getState().tabs.map((tab) => tab.id));
  store.getState().actions.openTab({
    id: tabId,
    title: getChatTabTitle(tabId),
    pane: {
      id: tabId,
      kind: 'chat',
      data: { kind: 'chat' },
    },
  });
};

const openSingletonTab = (
  store: WorkspaceStore<TinkerPaneData>,
  kind: 'settings' | 'memory',
  title: string,
): void => {
  const state = store.getState();
  if (state.tabs.some((tab) => tab.id === kind)) {
    state.actions.activateTab(kind);
    return;
  }

  state.actions.openTab({
    id: kind,
    title,
    pane: {
      id: kind,
      kind,
      data: { kind },
    },
  });
};

const RegisteredChatPane = ({ pane }: PaneRendererProps<TinkerPaneData>): JSX.Element => {
  if (pane.data.kind !== 'chat') {
    throw new Error(`Expected chat pane data, received "${pane.data.kind}".`);
  }

  return <>{getRenderer('chat')(pane.data)}</>;
};

const RegisteredFilePane = ({ pane }: PaneRendererProps<TinkerPaneData>): JSX.Element => {
  if (pane.data.kind !== 'file') {
    throw new Error(`Expected file pane data, received "${pane.data.kind}".`);
  }

  return <>{getRenderer('file')(pane.data)}</>;
};

const RegisteredMemoryPane = ({ pane }: PaneRendererProps<TinkerPaneData>): JSX.Element => {
  if (pane.data.kind !== 'memory') {
    throw new Error(`Expected memory pane data, received "${pane.data.kind}".`);
  }

  return <>{getRenderer('memory')(pane.data)}</>;
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
  onRunScheduledJobNow,
  onSchedulerChanged,
  onRunMemorySweep,
  onMemoryCommitted,
  mcpStatus,
  opencode,
  sessions,
  vaultPath,
  vaultRevision,
  activeSkillsRevision,
  memorySweepState,
  memorySweepBusy,
}: WorkspaceProps): JSX.Element => {
  registerWorkspacePaneRenderers();
  registerWorkspacePanes();

  const workspaceStore = useMemo(() => createWorkspaceStore<TinkerPaneData>(), []);
  const saveTimerRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);
  const vaultPathRef = useRef<string | null>(vaultPath);
  const workspacePreferencesRef = useRef<WorkspacePreferences>(createDefaultWorkspacePreferences());
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [workspacePreferences, setWorkspacePreferences] = useState<WorkspacePreferences>(createDefaultWorkspacePreferences);

  useEffect(() => {
    vaultPathRef.current = vaultPath;
  }, [vaultPath]);

  useEffect(() => {
    workspacePreferencesRef.current = workspacePreferences;
  }, [workspacePreferences]);

  const saveLayoutNow = useCallback((): void => {
    if (!hydratedRef.current) {
      return;
    }

    const snapshot: LayoutState = {
      version: LAYOUT_VERSION,
      workspace: selectWorkspaceSnapshot(workspaceStore.getState()),
      updatedAt: new Date().toISOString(),
      preferences: workspacePreferencesRef.current,
    };

    void layoutStore.save(DEFAULT_USER_ID, snapshot).catch((error) => {
      console.warn('Failed to persist workspace layout.', error);
    });
  }, [layoutStore, workspaceStore]);

  const scheduleLayoutSave = useCallback((): void => {
    if (!hydratedRef.current) {
      return;
    }

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      saveLayoutNow();
    }, LAYOUT_SAVE_DEBOUNCE_MS);
  }, [saveLayoutNow]);

  useEffect(() => {
    const unsubscribe = workspaceStore.subscribe(() => {
      scheduleLayoutSave();
    });

    return () => {
      unsubscribe();
    };
  }, [scheduleLayoutSave, workspaceStore]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      saveLayoutNow();
    };
  }, [saveLayoutNow]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let savedLayout: LayoutState | null = null;
      try {
        savedLayout = await layoutStore.load(DEFAULT_USER_ID);
      } catch (error) {
        console.warn('Failed to load saved workspace layout. Falling back to default.', error);
      }

      if (cancelled) {
        return;
      }

      const nextPreferences = savedLayout?.preferences ?? createDefaultWorkspacePreferences();
      workspacePreferencesRef.current = nextPreferences;
      setWorkspacePreferences(nextPreferences);
      workspaceStore.getState().actions.hydrate(savedLayout?.workspace ?? createDefaultLayout());
      hydratedRef.current = true;
      setWorkspaceReady(true);
      scheduleLayoutSave();
    })();

    return () => {
      cancelled = true;
      hydratedRef.current = false;
    };
  }, [layoutStore, scheduleLayoutSave, workspaceStore]);

  const handleWorkspacePreferencesChange = useCallback(
    (nextPreferences: WorkspacePreferences): void => {
      workspacePreferencesRef.current = nextPreferences;
      setWorkspacePreferences(nextPreferences);
      saveLayoutNow();
    },
    [saveLayoutNow],
  );

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
      const absolutePath = resolveAgentPath(reportedPath);
      if (!absolutePath) {
        return;
      }

      openWorkspaceFile(workspaceStore, absolutePath);
    },
    [resolveAgentPath, workspaceStore],
  );

  const handleAgentFileWritten = useCallback(
    (reportedPath: string): void => {
      if (!workspacePreferencesRef.current.autoOpenAgentWrittenFiles) {
        return;
      }

      openFileInWorkspace(reportedPath);
    },
    [openFileInWorkspace],
  );

  const openNewChatPane = useCallback((): void => {
    openNewChatTab(workspaceStore);
  }, [workspaceStore]);

  const openSettingsPane = useCallback((): void => {
    openSingletonTab(workspaceStore, 'settings', 'Settings');
  }, [workspaceStore]);

  const openMemoryPane = useCallback((): void => {
    openSingletonTab(workspaceStore, 'memory', 'Memory');
  }, [workspaceStore]);

  const chatPaneRuntime = useMemo(
    () => ({
      modelConnected,
      opencode,
      vaultPath,
      onFileWritten: handleAgentFileWritten,
      onOpenNewChat: openNewChatPane,
      onMemoryCommitted,
    }),
    [
      handleAgentFileWritten,
      modelConnected,
      onMemoryCommitted,
      openNewChatPane,
      opencode,
      vaultPath,
    ],
  );

  const filePaneRuntime = useMemo(
    () => ({
      vaultRevision,
      openFile: (path: string, options?: { mime?: string }) => openWorkspaceFile(workspaceStore, path, options),
    }),
    [vaultRevision, workspaceStore],
  );

  const registry = useMemo<PaneRegistry<TinkerPaneData>>(
    () => ({
      chat: {
        kind: 'chat',
        defaultTitle: 'Chat',
        render: RegisteredChatPane,
      },
      file: {
        kind: 'file',
        defaultTitle: 'File',
        render: RegisteredFilePane,
      },
      settings: {
        kind: 'settings',
        defaultTitle: 'Settings',
        render: () => (
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
            workspacePreferences={workspacePreferences}
            onWorkspacePreferencesChange={handleWorkspacePreferencesChange}
          />
        ),
      },
      memory: {
        kind: 'memory',
        defaultTitle: 'Memory',
        render: RegisteredMemoryPane,
      },
    }),
    [
      githubAuthBusy,
      githubAuthMessage,
      googleAuthBusy,
      googleAuthMessage,
      handleWorkspacePreferencesChange,
      mcpStatus,
      modelAuthBusy,
      modelAuthMessage,
      modelConnected,
      onConnectGithub,
      onConnectGoogle,
      onConnectModel,
      onCreateVault,
      onDisconnectGithub,
      onDisconnectGoogle,
      onDisconnectModel,
      onSelectVault,
      sessions,
      vaultPath,
      workspacePreferences,
    ],
  );

  void memoryStore;
  void schedulerStore;
  void schedulerRevision;
  void skillStore;
  void activeSkillsRevision;
  void onActiveSkillsChanged;
  void onRunScheduledJobNow;
  void onSchedulerChanged;
  void onRunMemorySweep;
  void memorySweepState;
  void memorySweepBusy;

  return (
    <main className="tinker-workspace-shell">
      <header className="tinker-header">
        <div>
          <p className="tinker-eyebrow">Workspace</p>
          <h1>Tinker</h1>
        </div>
        <div className="tinker-inline-actions">
          <Button variant="secondary" size="s" onClick={openNewChatPane} disabled={!workspaceReady}>
            New chat
          </Button>
          <Button variant="secondary" size="s" onClick={openSettingsPane} disabled={!workspaceReady}>
            Settings
          </Button>
          <Button variant="secondary" size="s" onClick={openMemoryPane} disabled={!workspaceReady}>
            Memory
          </Button>
        </div>
        <div className="tinker-header-meta">
          <Badge variant={modelConnected ? 'success' : 'default'} size="small">
            {modelConnected ? 'Model connected' : 'Model disconnected'}
          </Badge>
          <Badge variant="default" size="small">
            {sessions.google?.email ?? sessions.github?.email ?? 'Offline mode'}
          </Badge>
          <Badge variant="default" size="small">
            {vaultPath ?? 'No vault selected'}
          </Badge>
        </div>
      </header>

      <div className="tinker-workspace-integrations">
        <IntegrationsStrip compact mcpStatus={mcpStatus} sessions={sessions} />
      </div>

      <ChatPaneRuntimeContext.Provider value={chatPaneRuntime}>
        <FilePaneRuntimeContext.Provider value={filePaneRuntime}>
          <PaneWorkspace
            store={workspaceStore}
            registry={registry}
            ariaLabel="Tinker workspace"
            emptyState={<p>{workspaceReady ? 'No panes open.' : 'Loading workspace…'}</p>}
          />
        </FilePaneRuntimeContext.Provider>
      </ChatPaneRuntimeContext.Provider>
    </main>
  );
};
