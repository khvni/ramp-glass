import type { WorkspaceStore } from '@tinker/panes';
import type { TinkerPaneData } from '@tinker/shared-types';
import { getFileMimeForPath, getFileTitleForPath, getPanelIdForPath } from '../renderers/file-utils.js';

type OpenWorkspaceFileOptions = {
  mime?: string;
};

export const openWorkspaceFile = (
  store: WorkspaceStore<TinkerPaneData>,
  absolutePath: string,
  options: OpenWorkspaceFileOptions = {},
): void => {
  const mime = options.mime ?? getFileMimeForPath(absolutePath);
  const tabId = getPanelIdForPath(absolutePath, mime);
  const state = store.getState();

  if (state.tabs.some((tab) => tab.id === tabId)) {
    state.actions.activateTab(tabId);
    return;
  }

  state.actions.openTab({
    id: tabId,
    title: getFileTitleForPath(absolutePath, mime),
    pane: {
      id: tabId,
      kind: 'file',
      data: {
        kind: 'file',
        path: absolutePath,
        mime,
      },
    },
  });
};
