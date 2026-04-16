import { describe, expect, it, vi } from 'vitest';
import { getChatPanelTitle, getNextChatPanelId, openNewChatPanel } from './chat-panels.js';

describe('chat panel helpers', () => {
  it('allocates stable incrementing chat ids', () => {
    expect(getNextChatPanelId([])).toBe('chat');
    expect(getNextChatPanelId(['chat'])).toBe('chat-2');
    expect(getNextChatPanelId(['chat', 'chat-3'])).toBe('chat-4');
  });

  it('derives readable titles from panel ids', () => {
    expect(getChatPanelTitle('chat')).toBe('Chat');
    expect(getChatPanelTitle('chat-2')).toBe('Chat 2');
  });

  it('opens a new chat within the active group when one exists', () => {
    const api = {
      activePanel: { id: 'today' },
      panels: [{ id: 'chat' }, { id: 'today' }],
      addPanel: vi.fn(),
    };

    openNewChatPanel(api);

    expect(api.addPanel).toHaveBeenCalledOnce();
    expect(api.addPanel).toHaveBeenCalledWith({
      id: 'chat-2',
      component: 'chat',
      title: 'Chat 2',
      position: {
        referencePanel: 'chat',
        direction: 'within',
      },
    });
  });
});
