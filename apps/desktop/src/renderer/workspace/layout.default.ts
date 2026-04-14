import type { DockviewApi } from 'dockview-react';

export const applyDefaultLayout = (api: DockviewApi): void => {
  api.addPanel({
    id: 'chat',
    component: 'chat',
    title: 'Chat',
  });

  api.addPanel({
    id: 'today',
    component: 'today',
    title: 'Today',
    position: {
      referencePanel: 'chat',
      direction: 'right',
    },
  });

  api.addPanel({
    id: 'settings',
    component: 'settings',
    title: 'Settings',
    inactive: true,
    position: {
      referencePanel: 'today',
      direction: 'within',
    },
  });
};
