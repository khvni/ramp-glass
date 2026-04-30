export type TabKind =
  | 'vault-browser'
  | 'chat'
  | 'today'
  | 'scheduler'
  | 'settings'
  | 'playbook'
  | 'markdown-editor'
  | 'file'
  | 'markdown'
  | 'html'
  | 'csv'
  | 'image'
  | 'code';

export type WorkspacePreferences = {
  autoOpenAgentWrittenFiles: boolean;
  isLeftRailVisible: boolean;
  isRightInspectorVisible: boolean;
};

export const createDefaultWorkspacePreferences = (): WorkspacePreferences => {
  return {
    autoOpenAgentWrittenFiles: true,
    isLeftRailVisible: true,
    isRightInspectorVisible: false,
  };
};

/**
 * FlexLayout-compatible persisted model JSON. This replaces the former
 * `WorkspaceState<TinkerPaneData>` from `@tinker/panes`.
 *
 * Each FlexLayout tab node carries:
 *   - `component`: the `TinkerPaneKind` string
 *   - `config`: the `TinkerPaneData` payload
 */
export type PersistedLayoutJson = {
  global?: Record<string, unknown>;
  borders?: unknown[];
  layout: unknown;
};

export type LayoutState = {
  version: 3;
  layoutJson: PersistedLayoutJson;
  updatedAt: string;
  preferences: WorkspacePreferences;
};

export type LayoutStore = {
  load(userId: string): Promise<LayoutState | null>;
  save(userId: string, state: LayoutState): Promise<void>;
};
