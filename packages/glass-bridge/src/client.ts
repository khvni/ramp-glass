import { createOpencodeClient, OpencodeClient } from '@opencode-ai/sdk/v2';

let clientInstance: OpencodeClient | null = null;

export function getClient(): OpencodeClient {
  if (!clientInstance) {
    throw new Error('OpenCode client not initialized. Call initClient first.');
  }
  return clientInstance;
}

export function initClient(url: string) {
  clientInstance = createOpencodeClient({ baseUrl: url });
  return clientInstance;
}
