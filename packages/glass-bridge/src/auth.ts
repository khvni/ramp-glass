import type { Auth } from '@opencode-ai/sdk/v2';
import { getClient } from './client.js';

export async function setAuth(providerId: string, credentials: Auth) {
  const client = getClient();
  const res = await client.auth.set({
    providerID: providerId,
    auth: credentials as any,
  });
  if (res.error) {
     throw new Error(`Failed to set auth for ${providerId}`);
  }
  return true;
}
