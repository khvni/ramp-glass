import { useRef, useEffect } from 'react';
import {
  DockviewReact,
  type DockviewReadyEvent,
  type IDockviewPanelProps
} from 'dockview-react';
import type { PaneKind } from '@ramp-glass/shared-types';
import { defaultLayoutModel } from './layout.default.js';
import { getPaneComponent, registerPane } from './pane-registry.js';
import { Chat } from '../panes/Chat.js';
import { Today } from '../panes/Today.js';
import { Settings } from '../panes/Settings.js';
import { MarkdownEditor } from '../panes/MarkdownEditor.js';
import 'dockview-react/dist/styles/dockview.css';

// Register built-in panes
registerPane('chat', Chat);
registerPane('today', Today);
registerPane('settings', Settings);
registerPane('markdown-editor', MarkdownEditor);

const DockviewWrapper = (props: IDockviewPanelProps) => {
  const componentName = props.api.component as PaneKind;
  const Component = getPaneComponent(componentName);

  if (!Component) {
    return <div className="text-red-500 p-4">Unknown component: {componentName}</div>;
  }

  return <Component paneId={props.api.id} props={props.params as Record<string, unknown>} />;
};

export const Workspace = (): JSX.Element => {
  const components = {
    chat: DockviewWrapper,
    today: DockviewWrapper,
    'markdown-editor': DockviewWrapper,
    file: DockviewWrapper,
    markdown: DockviewWrapper,
    html: DockviewWrapper,
    csv: DockviewWrapper,
    image: DockviewWrapper,
    code: DockviewWrapper,
    settings: DockviewWrapper
  };

  const onReady = (event: DockviewReadyEvent) => {
     window.glass.invoke('layout:load', 'default').then((state: any) => {
         if (state && state.dockviewModel) {
            try {
                event.api.fromJSON(state.dockviewModel);
            } catch (err) {
                console.error('Failed to restore layout', err);
                event.api.fromJSON(defaultLayoutModel as any);
            }
         } else {
             event.api.fromJSON(defaultLayoutModel as any);
         }
     });

     event.api.onDidLayoutChange(() => {
         const dockviewModel = event.api.toJSON();
         window.glass.invoke('layout:save', {
             userId: 'default',
             state: { version: 1, dockviewModel, updatedAt: new Date().toISOString() }
         });
     });

     window.addEventListener('keydown', (e) => {
        if (e.metaKey && e.key === '\\') {
            if (e.shiftKey) {
                // Split horizontal
                const activePanel = event.api.activePanel;
                if (activePanel) {
                    event.api.addPanel({
                        id: `chat-${Date.now()}`,
                        component: 'chat',
                        position: { direction: 'down', referencePanel: activePanel }
                    });
                }
            } else {
                // Split vertical
                const activePanel = event.api.activePanel;
                if (activePanel) {
                    event.api.addPanel({
                        id: `chat-${Date.now()}`,
                        component: 'chat',
                        position: { direction: 'right', referencePanel: activePanel }
                    });
                }
            }
        } else if (e.metaKey && e.key === 'w') {
            const activePanel = event.api.activePanel;
            if (activePanel) {
                activePanel.api.close();
            }
        }
     });
  };

  return (
    <div className="dockview-theme-dark w-full h-full text-white">
      <DockviewReact
        components={components}
        onReady={onReady}
        className="w-full h-full"
      />
    </div>
  );
};
