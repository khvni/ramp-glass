import 'dockview-react/dist/styles/dockview.css';

export const defaultLayoutModel = {
  activePanel: 'welcome-chat',
  grid: {
    orientation: 'horizontal' as const,
    size: 100,
    type: 'branch' as const,
    data: [
      {
        type: 'leaf' as const,
        data: {
          views: ['welcome-chat'],
          activeView: 'welcome-chat',
          id: 'group-left'
        },
        size: 60
      },
      {
        type: 'leaf' as const,
        data: {
          views: ['welcome-today'],
          activeView: 'welcome-today',
          id: 'group-right'
        },
        size: 40
      }
    ]
  },
  panels: {
    'welcome-chat': {
      id: 'welcome-chat',
      component: 'chat',
      title: 'Chat'
    },
    'welcome-today': {
      id: 'welcome-today',
      component: 'today',
      title: 'Today'
    }
  }
};
