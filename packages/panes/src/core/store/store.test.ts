import { describe, expect, it } from 'vitest';
import { createWorkspaceStore } from './store.js';
import { findStack, findStackContainingPane, isSplit, isStack } from '../utils/layout.js';

type Data = { readonly label: string };

const openDefault = () => {
  const store = createWorkspaceStore<Data>();
  store.getState().actions.openTab({
    id: 't1',
    pane: { id: 'p1', kind: 'chat', data: { label: 'hello' } },
  });
  return store;
};

describe('workspace store — tabs', () => {
  it('opens a tab with one stack + one pane', () => {
    const store = openDefault();
    const state = store.getState();
    expect(state.tabs).toHaveLength(1);
    const tab = state.tabs[0]!;
    expect(tab.activePaneId).toBe('p1');
    expect(tab.activeStackId).toBeTruthy();
    expect(isStack(tab.layout)).toBe(true);
    if (isStack(tab.layout)) {
      expect(tab.layout.paneIds).toEqual(['p1']);
      expect(tab.layout.id).toBe(tab.activeStackId);
    }
  });

  it('activateTab switches the active tab id', () => {
    const store = openDefault();
    store.getState().actions.openTab({
      id: 't2',
      pane: { id: 'p2', kind: 'notes', data: { label: 'second' } },
      activate: false,
    });
    expect(store.getState().activeTabId).toBe('t1');
    store.getState().actions.activateTab('t2');
    expect(store.getState().activeTabId).toBe('t2');
  });

  it('closeTab removes the tab', () => {
    const store = openDefault();
    store.getState().actions.closeTab('t1');
    expect(store.getState().tabs).toHaveLength(0);
    expect(store.getState().activeTabId).toBeNull();
  });
});

describe('workspace store — stack operations', () => {
  it('addPane appends to the active stack and activates it', () => {
    const store = openDefault();
    store.getState().actions.addPane('t1', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'second' },
    });
    const tab = store.getState().tabs[0]!;
    if (isStack(tab.layout)) {
      expect(tab.layout.paneIds).toEqual(['p1', 'p2']);
      expect(tab.layout.activePaneId).toBe('p2');
    }
    expect(tab.activePaneId).toBe('p2');
  });

  it('splitPane creates a new stack on the requested edge', () => {
    const store = openDefault();
    store.getState().actions.splitPane(
      't1',
      'p1',
      'right',
      { id: 'p2', kind: 'notes', data: { label: 'second' } },
    );
    const tab = store.getState().tabs[0]!;
    expect(isSplit(tab.layout)).toBe(true);
    if (isSplit(tab.layout)) {
      expect(tab.layout.orientation).toBe('row');
      if (isStack(tab.layout.a)) expect(tab.layout.a.paneIds).toEqual(['p1']);
      if (isStack(tab.layout.b)) expect(tab.layout.b.paneIds).toEqual(['p2']);
    }
  });

  it('closePane removes a pane from a stack without affecting siblings', () => {
    const store = openDefault();
    store.getState().actions.addPane('t1', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'x' },
    });
    store.getState().actions.closePane('t1', 'p1');
    const tab = store.getState().tabs[0]!;
    if (isStack(tab.layout)) {
      expect(tab.layout.paneIds).toEqual(['p2']);
      expect(tab.layout.activePaneId).toBe('p2');
    }
    expect(tab.activePaneId).toBe('p2');
  });

  it('closePane collapses empty stack and unwinds parent split', () => {
    const store = openDefault();
    store.getState().actions.splitPane('t1', 'p1', 'right', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'x' },
    });
    store.getState().actions.closePane('t1', 'p2');
    const tab = store.getState().tabs[0]!;
    expect(isStack(tab.layout)).toBe(true);
    if (isStack(tab.layout)) expect(tab.layout.paneIds).toEqual(['p1']);
  });

  it('closePane closes the entire tab when the last pane is removed', () => {
    const store = openDefault();
    store.getState().actions.closePane('t1', 'p1');
    expect(store.getState().tabs).toHaveLength(0);
  });

  it('focusPane updates the stack active pane + tab active pane/stack', () => {
    const store = openDefault();
    store.getState().actions.addPane('t1', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'x' },
    });
    store.getState().actions.focusPane('t1', 'p1');
    const tab = store.getState().tabs[0]!;
    expect(tab.activePaneId).toBe('p1');
    const host = findStackContainingPane(tab.layout, 'p1');
    expect(host?.activePaneId).toBe('p1');
  });

  it('setSplitRatio updates a split by id', () => {
    const store = openDefault();
    store.getState().actions.splitPane('t1', 'p1', 'right', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'x' },
    });
    const tab = store.getState().tabs[0]!;
    if (!isSplit(tab.layout)) throw new Error('expected split');
    const splitId = tab.layout.id;
    store.getState().actions.setSplitRatio('t1', splitId, 0.75);
    const afterTab = store.getState().tabs[0]!;
    if (isSplit(afterTab.layout)) expect(afterTab.layout.ratio).toBe(0.75);
  });
});

describe('workspace store — movePane', () => {
  it('moves a pane across stacks via center drop', () => {
    const store = openDefault();
    store.getState().actions.splitPane('t1', 'p1', 'right', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'second' },
    });
    const tab1 = store.getState().tabs[0]!;
    if (!isSplit(tab1.layout)) throw new Error('expected split');
    const leftStack = tab1.layout.a;
    if (!isStack(leftStack)) throw new Error('expected stack');
    // drop p2 into left stack
    store.getState().actions.movePane('t1', 'p2', leftStack.id, { kind: 'center' });
    const tab2 = store.getState().tabs[0]!;
    expect(isStack(tab2.layout)).toBe(true);
    if (isStack(tab2.layout)) expect(tab2.layout.paneIds).toEqual(['p1', 'p2']);
  });

  it('moves a pane into target stack at an insert index', () => {
    const store = openDefault();
    store.getState().actions.addPane('t1', { id: 'p2', kind: 'notes', data: { label: 'x' } });
    store.getState().actions.addPane('t1', { id: 'p3', kind: 'notes', data: { label: 'y' } });
    const tab = store.getState().tabs[0]!;
    if (!isStack(tab.layout)) throw new Error('expected stack');
    const stackId = tab.layout.id;
    // Move p1 between p2 and p3 (index 2 in the post-removal array [p2, p3]).
    store.getState().actions.movePane('t1', 'p1', stackId, { kind: 'insert', index: 2 });
    const after = store.getState().tabs[0]!;
    if (isStack(after.layout)) expect(after.layout.paneIds).toEqual(['p2', 'p3', 'p1']);
  });

  it('moves a pane across stacks via edge drop (creates new split)', () => {
    const store = openDefault();
    store.getState().actions.addPane('t1', { id: 'p2', kind: 'notes', data: { label: 'x' } });
    const tab = store.getState().tabs[0]!;
    if (!isStack(tab.layout)) throw new Error('expected stack');
    // split p2 out to the bottom
    store.getState().actions.movePane('t1', 'p2', tab.layout.id, { kind: 'edge', edge: 'bottom' });
    const after = store.getState().tabs[0]!;
    expect(isSplit(after.layout)).toBe(true);
    if (isSplit(after.layout)) {
      expect(after.layout.orientation).toBe('column');
      if (isStack(after.layout.a)) expect(after.layout.a.paneIds).toEqual(['p1']);
      if (isStack(after.layout.b)) expect(after.layout.b.paneIds).toEqual(['p2']);
    }
  });
});

describe('workspace store — focusNeighbor', () => {
  it('moves focus from left stack to right stack', () => {
    const store = openDefault();
    store.getState().actions.splitPane('t1', 'p1', 'right', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'x' },
    });
    // focus the left pane first
    store.getState().actions.focusPane('t1', 'p1');
    const paneId = store.getState().actions.focusNeighbor('right');
    expect(paneId).toBe('p2');
    expect(store.getState().tabs[0]!.activePaneId).toBe('p2');
  });
});

describe('workspace store — hydrate + snapshot', () => {
  it('hydrates from a snapshot + preserves ids', () => {
    const store = openDefault();
    const snapshot = {
      version: 2 as const,
      activeTabId: store.getState().activeTabId,
      tabs: store.getState().tabs.map((tab) => ({ ...tab, panes: { ...tab.panes } })),
    };
    const other = createWorkspaceStore<Data>();
    other.getState().actions.hydrate(snapshot);
    expect(other.getState().tabs).toEqual(snapshot.tabs);
    expect(other.getState().activeTabId).toBe(snapshot.activeTabId);
  });

  it('reset clears all state', () => {
    const store = openDefault();
    store.getState().actions.reset();
    expect(store.getState().tabs).toHaveLength(0);
    expect(store.getState().activeTabId).toBeNull();
  });
});

describe('workspace store — version is v2', () => {
  it('emits version: 2 on empty init', () => {
    const store = createWorkspaceStore<Data>();
    expect(store.getState().version).toBe(2);
  });
});

describe('workspace store — findStack helpers round-trip', () => {
  it('findStack + findStackContainingPane walk the updated tree', () => {
    const store = openDefault();
    store.getState().actions.splitPane('t1', 'p1', 'right', {
      id: 'p2',
      kind: 'notes',
      data: { label: 'x' },
    });
    const tab = store.getState().tabs[0]!;
    const host = findStackContainingPane(tab.layout, 'p2');
    expect(host?.paneIds).toEqual(['p2']);
    if (host) expect(findStack(tab.layout, host.id)).toBe(host);
  });
});
