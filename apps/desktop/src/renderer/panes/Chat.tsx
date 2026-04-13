import { useEffect, useRef, useState, useMemo } from 'react';
import type { PaneComponent } from '../workspace/pane-registry.js';
import type { GlassStreamEvent } from '@ramp-glass/glass-bridge';
import MarkdownRenderer from '../renderers/MarkdownRenderer.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const Chat: PaneComponent = ({ paneId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create session on mount
    window.glass.invoke('bridge:createSession')
      .then((id) => setSessionId(id as string))
      .catch((err) => console.error('Failed to create session:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sessionId) return;

    const unbind = window.glass.on(`bridge:stream:${sessionId}`, (rawEvent) => {
      const event = rawEvent as GlassStreamEvent;

      setMessages(prev => {
        if (event.type === 'token') {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id === event.messageId) {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + event.text }
            ];
          } else {
             return [...prev, { id: event.messageId, role: 'assistant', content: event.text }];
          }
        }

        if (event.type === 'tool_call') {
          // You could display tools here. Just appending for now.
          const lastMsg = prev[prev.length - 1];
          const toolStr = `\n_Running tool: ${event.tool}_`;
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id === event.messageId) {
            return [
               ...prev.slice(0, -1),
               { ...lastMsg, content: lastMsg.content + toolStr }
            ];
          } else {
             return [...prev, { id: event.messageId, role: 'assistant', content: toolStr }];
          }
        }

        if (event.type === 'tool_result') {
          // Or append result info
           const lastMsg = prev[prev.length - 1];
           const resStr = `\n_Finished tool: ${event.tool}_`;
           if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id === event.messageId) {
             return [
               ...prev.slice(0, -1),
               { ...lastMsg, content: lastMsg.content + resStr }
             ];
           } else {
             return [...prev, { id: event.messageId, role: 'assistant', content: resStr }];
           }
        }

        if (event.type === 'error') {
           return [...prev, { id: Date.now().toString(), role: 'assistant', content: `**Error:** Glass is reconnecting...` }];
        }

        return prev;
      });

      if (event.type === 'done' || event.type === 'error') {
        setLoading(false);
      }
    });

    return unbind;
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }]);
    setLoading(true);

    try {
      await window.glass.invoke('bridge:sendMessage', { sessionId, text: userText });
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '**Error:** Glass is reconnecting...' }]);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'}`}>
               <MarkdownRenderer content={msg.content} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading || !sessionId}
            placeholder={loading ? 'Thinking...' : 'Type a message...'}
            className="flex-1 bg-gray-800 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
             type="submit"
             disabled={loading || !input.trim() || !sessionId}
             className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded text-white font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
