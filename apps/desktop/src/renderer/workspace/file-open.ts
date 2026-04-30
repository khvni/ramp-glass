import { Actions, DockLocation, type Model, type TabNode } from 'flexlayout-react';
import type { TinkerPaneData } from '@tinker/shared-types';
import { resolveFilePaneMime } from '../panes/FilePane/file-mime.js';
import {
  getPanelIdForPath,
  getPanelTitleForPath,
  isAbsolutePath,
} from '../renderers/file-utils.js';

export const FILE_PANE_SPLIT_RATIO = 0.6;

export type ResolveWorkspaceFileMime = (absolutePath: string) => Promise<string>;

type ExistingFilePane = {
  nodeId: string;
  data: Extract<TinkerPaneData, { readonly kind: 'file' }>;
};

const findFilePaneByPath = (
  model: Model,
  absolutePath: string,
): ExistingFilePane | null => {
  let found: ExistingFilePane | null = null;
  model.visitNodes((node) => {
    if (found) return;
    if (node.getType() !== 'tab') return;
    const tabNode = node as TabNode;
    const config = tabNode.getConfig() as TinkerPaneData | undefined;
    if (config?.kind === 'file' && config.path === absolutePath) {
      found = { nodeId: tabNode.getId(), data: config };
    }
  });
  return found;
};

const findFirstFilePaneInActiveTabset = (
  model: Model,
): TabNode | null => {
  const activeTabset = model.getActiveTabset();
  if (!activeTabset) return null;

  const children = activeTabset.getChildren();
  for (const child of children) {
    if (child.getType() !== 'tab') continue;
    const tabNode = child as TabNode;
    const config = tabNode.getConfig() as TinkerPaneData | undefined;
    if (config?.kind === 'file') {
      return tabNode;
    }
  }
  return null;
};

export const openWorkspaceFile = async (
  model: Model,
  absolutePath: string,
  resolveMime: ResolveWorkspaceFileMime = resolveFilePaneMime,
): Promise<void> => {
  if (!isAbsolutePath(absolutePath)) {
    return;
  }

  let mime = 'application/octet-stream';
  try {
    mime = await resolveMime(absolutePath);
  } catch (error) {
    console.warn(`Failed to resolve pane MIME for "${absolutePath}".`, error);
  }

  const samePathPane = findFilePaneByPath(model, absolutePath);
  if (samePathPane) {
    if (samePathPane.data.mime !== mime) {
      model.doAction(
        Actions.updateNodeAttributes(samePathPane.nodeId, {
          config: { ...samePathPane.data, mime },
        }),
      );
    }
    model.doAction(Actions.selectTab(samePathPane.nodeId));
    return;
  }

  const fileTabJson = {
    type: 'tab' as const,
    id: getPanelIdForPath('file', absolutePath),
    name: getPanelTitleForPath(absolutePath),
    component: 'file',
    config: {
      kind: 'file' as const,
      path: absolutePath,
      mime,
    },
  };

  const existingFilePane = findFirstFilePaneInActiveTabset(model);
  if (existingFilePane) {
    model.doAction(
      Actions.updateNodeAttributes(existingFilePane.getId(), {
        name: getPanelTitleForPath(absolutePath),
        config: { kind: 'file' as const, path: absolutePath, mime },
      }),
    );
    model.doAction(Actions.selectTab(existingFilePane.getId()));
    return;
  }

  const activeTabset = model.getActiveTabset();
  if (activeTabset) {
    model.doAction(
      Actions.addTab(
        fileTabJson,
        activeTabset.getId(),
        DockLocation.RIGHT,
        -1,
        true,
      ),
    );
    return;
  }

  const firstTabset = model.getFirstTabSet();
  model.doAction(
    Actions.addTab(
      fileTabJson,
      firstTabset.getId(),
      DockLocation.CENTER,
      -1,
      true,
    ),
  );
};
