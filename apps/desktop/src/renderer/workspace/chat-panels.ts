type WorkspacePanel = {
  id: string;
};

type WorkspaceDockviewApi = {
  activePanel: { id: string } | null | undefined;
  panels: WorkspacePanel[];
  addPanel(panel: {
    id: string;
    component: 'chat';
    title: string;
    position?: {
      referencePanel: string;
      direction: 'within';
    };
  }): void;
};

const CHAT_PANEL_PATTERN = /^chat(?:-(\d+))?$/u;

const getChatPanelIndex = (panelId: string): number | null => {
  const match = panelId.match(CHAT_PANEL_PATTERN);
  if (!match) {
    return null;
  }

  return match[1] ? Number(match[1]) : 1;
};

const getReferencePanelId = (api: WorkspaceDockviewApi): string | null => {
  return api.panels.find((panel) => getChatPanelIndex(panel.id) !== null)?.id ?? api.activePanel?.id ?? api.panels[0]?.id ?? null;
};

export const getNextChatPanelId = (panelIds: string[]): string => {
  const nextIndex = panelIds.reduce((highest, panelId) => {
    const index = getChatPanelIndex(panelId);
    return index && index > highest ? index : highest;
  }, 0);

  return nextIndex === 0 ? 'chat' : `chat-${nextIndex + 1}`;
};

export const getChatPanelTitle = (panelId: string): string => {
  const index = getChatPanelIndex(panelId);
  return index && index > 1 ? `Chat ${index}` : 'Chat';
};

export const openNewChatPanel = (api: WorkspaceDockviewApi): void => {
  const panelId = getNextChatPanelId(api.panels.map((panel) => panel.id));
  const referencePanelId = getReferencePanelId(api);

  api.addPanel({
    id: panelId,
    component: 'chat',
    title: getChatPanelTitle(panelId),
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
