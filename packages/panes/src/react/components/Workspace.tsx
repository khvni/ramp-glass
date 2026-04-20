import { useCallback, useMemo, type ReactNode } from 'react';
import type { DropTarget, StackId } from '../../types.js';
import { findStack } from '../../core/utils/layout.js';
import { useWorkspaceActions, useWorkspaceSelector } from '../hooks/useWorkspaceStore.js';
import type { WorkspaceProps } from '../types.js';
import { SplitTree } from './SplitTree.js';
import { TabStrip } from './TabStrip.js';

export const Workspace = <TData,>(props: WorkspaceProps<TData>): ReactNode => {
  const { store, registry } = props;
  const tabs = useWorkspaceSelector(store, (state) => state.tabs);
  const activeTabId = useWorkspaceSelector(store, (state) => state.activeTabId);
  const actions = useWorkspaceActions(store);

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? null, [tabs, activeTabId]);

  const handleActivateTab = useCallback((tabId: string) => actions.activateTab(tabId), [actions]);
  const handleCloseTab = useCallback((tabId: string) => actions.closeTab(tabId), [actions]);
  const handleMoveTab = useCallback((tabId: string, toIndex: number) => actions.moveTab(tabId, toIndex), [actions]);

  const handleFocusPane = useCallback(
    (_stackId: StackId, paneId: string) => {
      if (!activeTab) return;
      actions.focusPane(activeTab.id, paneId);
    },
    [actions, activeTab],
  );

  const handleClosePane = useCallback(
    (paneId: string) => {
      if (!activeTab) return;
      actions.closePane(activeTab.id, paneId);
    },
    [actions, activeTab],
  );

  const handleReorderPane = useCallback(
    (paneId: string, toIndex: number) => {
      if (!activeTab) return;
      actions.reorderPane(activeTab.id, paneId, toIndex);
    },
    [actions, activeTab],
  );

  const handleSetRatio = useCallback(
    (splitId: string, ratio: number) => {
      if (!activeTab) return;
      actions.setSplitRatio(activeTab.id, splitId, ratio);
    },
    [actions, activeTab],
  );

  const handleDrop = useCallback(
    ({ sourcePaneId, targetStackId, target }: { sourcePaneId: string; targetStackId: StackId; target: DropTarget }) => {
      if (!activeTab) return;

      // Modern hook — if the consumer supplied one, they drive movement themselves.
      const custom = props.onDropPane;
      if (custom) {
        custom({ tabId: activeTab.id, sourcePaneId, targetStackId, target });
        return;
      }

      // Legacy pane-on-pane bridge — resolve a representative target pane from
      // the target stack so shim callers keep working while they migrate.
      const legacy = props.onDropPaneOnPane;
      if (legacy) {
        const targetStack = findStack(activeTab.layout, targetStackId);
        const representative = targetStack?.activePaneId ?? targetStack?.paneIds[0];
        if (representative) {
          const edge: 'top' | 'right' | 'bottom' | 'left' | 'center' =
            target.kind === 'edge' ? target.edge : 'center';
          legacy({ tabId: activeTab.id, sourcePaneId, targetPaneId: representative, edge });
          return;
        }
      }

      actions.movePane(activeTab.id, sourcePaneId, targetStackId, target);
    },
    [actions, activeTab, props.onDropPane, props.onDropPaneOnPane],
  );

  return (
    <section
      className="tinker-panes-workspace"
      aria-label={props.ariaLabel ?? 'Workspace'}
    >
      <TabStrip
        tabs={tabs}
        activeTabId={activeTabId}
        registry={registry}
        {...(props.tabStripActions ? { actions: props.tabStripActions } : {})}
        onActivate={handleActivateTab}
        onClose={handleCloseTab}
        onMove={handleMoveTab}
      />
      <div
        role="tabpanel"
        id={activeTab ? `tinker-panes-tabpanel-${activeTab.id}` : undefined}
        aria-labelledby={activeTab ? `tinker-panes-tab-${activeTab.id}` : undefined}
        className="tinker-panes-surface"
      >
        {activeTab ? (
          <SplitTree
            tab={activeTab}
            registry={registry}
            onFocusPane={handleFocusPane}
            onClosePane={handleClosePane}
            onReorderPaneInStack={handleReorderPane}
            onSetRatio={handleSetRatio}
            onDropPane={handleDrop}
          />
        ) : (
          <div className="tinker-panes-empty">
            {props.emptyState ?? <p>No panes open.</p>}
          </div>
        )}
      </div>
    </section>
  );
};
