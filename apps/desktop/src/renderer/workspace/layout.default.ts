import type { WorkspaceState } from '@tinker/panes';
import type { TinkerPaneData } from '@tinker/shared-types';

const DEFAULT_CHAT_TAB_ID = 'chat';
const DEFAULT_CHAT_PANE_ID = 'chat';
const DEFAULT_CHAT_STACK_ID = 'stack-chat';

export const createDefaultLayout = (): WorkspaceState<TinkerPaneData> => {
  return {
    version: 2,
    activeTabId: DEFAULT_CHAT_TAB_ID,
    tabs: [
      {
        id: DEFAULT_CHAT_TAB_ID,
        title: 'Chat',
        createdAt: Date.now(),
        layout: {
          kind: 'stack',
          id: DEFAULT_CHAT_STACK_ID,
          paneIds: [DEFAULT_CHAT_PANE_ID],
          activePaneId: DEFAULT_CHAT_PANE_ID,
        },
        panes: {
          [DEFAULT_CHAT_PANE_ID]: {
            id: DEFAULT_CHAT_PANE_ID,
            kind: 'chat',
            data: { kind: 'chat' },
          },
        },
        activePaneId: DEFAULT_CHAT_PANE_ID,
        activeStackId: DEFAULT_CHAT_STACK_ID,
      },
    ],
  };
};
