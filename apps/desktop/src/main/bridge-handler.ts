import { ipcMain, type IpcMain, type WebContents } from 'electron';
import { getOpencodeClient } from './opencode.js';
import { streamSessionEvents, getModel, injectMemoryContext } from '@ramp-glass/glass-bridge';

export const BRIDGE_IPC_CHANNELS = {
  sendMessage: 'bridge:sendMessage',
  createSession: 'bridge:createSession',
};

export const registerBridgeIpcHandlers = (ipc: IpcMain = ipcMain): void => {
  ipc.handle(BRIDGE_IPC_CHANNELS.createSession, async () => {
    const client = await getOpencodeClient();
    const session = await client.session.create();
    if (session.error) {
      throw new Error(`Failed to create session: ${session.error}`);
    }
    return session.data.id;
  });

  ipc.handle(
    BRIDGE_IPC_CHANNELS.sendMessage,
    async (event, { sessionId, text, memoryBlock }: { sessionId: string; text: string; memoryBlock?: string }) => {
      const client = await getOpencodeClient();

      if (memoryBlock) {
         await injectMemoryContext(sessionId, memoryBlock);
      }

      const model = getModel();

      const promptParams: Parameters<typeof client.session.prompt>[0] = {
        sessionID: sessionId,
        parts: [{ type: 'text', text }],
      };
      if (model) {
        promptParams.model = { providerID: model.providerID, modelID: model.modelID };
      }
      const res = await client.session.prompt(promptParams);

      if (res.error) {
         throw new Error(`Prompt failed: ${res.error}`);
      }

      const sender = event.sender;

      // Fire and forget the streaming
      void (async () => {
         try {
           for await (const streamEvent of streamSessionEvents(sessionId)) {
              if (sender.isDestroyed()) break;
              sender.send(`bridge:stream:${sessionId}`, streamEvent);
              if (streamEvent.type === 'done' || streamEvent.type === 'error') {
                 break;
              }
           }
         } catch (err) {
            if (!sender.isDestroyed()) {
               sender.send(`bridge:stream:${sessionId}`, { type: 'error', message: err instanceof Error ? err.message : String(err) });
            }
         }
      })();

      return true;
    }
  );
};
