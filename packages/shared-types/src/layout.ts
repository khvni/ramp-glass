import type { WorkspaceState } from '@tinker/panes';
import type { TinkerPaneData } from './pane.js';

export type WorkspacePreferences = {
  autoOpenAgentWrittenFiles: boolean;
};

export const createDefaultWorkspacePreferences = (): WorkspacePreferences => {
  return {
    autoOpenAgentWrittenFiles: true,
  };
};

export type LayoutState = {
  version: 2;
  workspace: WorkspaceState<TinkerPaneData>;
  updatedAt: string;
  preferences: WorkspacePreferences;
};

export type LayoutStore = {
  load(userId: string): Promise<LayoutState | null>;
  save(userId: string, state: LayoutState): Promise<void>;
};
