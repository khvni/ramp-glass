import { describe, expect, it, vi } from 'vitest';
import { createWorkspaceStore } from '@tinker/panes';
import type { TinkerPaneData } from '@tinker/shared-types';
import { getPanelIdForPath } from '../renderers/file-utils.js';
import { openWorkspaceFile } from './file-open.js';

describe('openWorkspaceFile', () => {
  it('reuses an existing workspace tab for the same path', () => {
    const store = createWorkspaceStore<TinkerPaneData>();
    const activateTab = vi.spyOn(store.getState().actions, 'activateTab');
    store.getState().actions.openTab({
      id: getPanelIdForPath('/vault/note.ts'),
      title: 'note.ts',
      pane: {
        id: getPanelIdForPath('/vault/note.ts'),
        kind: 'file',
        data: {
          kind: 'file',
          path: '/vault/note.ts',
          mime: 'text/plain',
        },
      },
    });

    openWorkspaceFile(store, '/vault/note.ts');

    expect(activateTab).toHaveBeenCalledOnce();
    expect(activateTab).toHaveBeenCalledWith(getPanelIdForPath('/vault/note.ts'));
    expect(store.getState().tabs).toHaveLength(1);
  });

  it('creates a new workspace tab when no matching tab exists', () => {
    const store = createWorkspaceStore<TinkerPaneData>();

    openWorkspaceFile(store, '/vault/note.ts');

    expect(store.getState().tabs).toHaveLength(1);
    expect(store.getState().tabs[0]).toMatchObject({
      id: getPanelIdForPath('/vault/note.ts'),
      title: 'note.ts',
      panes: {
        [getPanelIdForPath('/vault/note.ts')]: {
          id: getPanelIdForPath('/vault/note.ts'),
          kind: 'file',
          data: {
            kind: 'file',
            path: '/vault/note.ts',
            mime: 'text/plain',
          },
        },
      },
    });
  });
});
