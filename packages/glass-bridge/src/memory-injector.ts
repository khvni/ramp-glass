import { getClient } from './client.js';

export async function injectMemoryContext(sessionId: string, memoryBlock: string) {
  const client = getClient();

  if (!memoryBlock.trim()) return;

  const res = await client.session.prompt({
    sessionID: sessionId,
    noReply: true,
    parts: [
      {
        type: 'text',
        text: `[Memory Entities injected by Glass Bridge]\n\n${memoryBlock}`,
      }
    ]
  });

  if (res.error) {
    console.error('Failed to inject memory context', res.error);
    throw new Error('Failed to inject memory context');
  }
}
