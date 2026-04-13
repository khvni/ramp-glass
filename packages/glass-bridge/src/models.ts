import { getClient } from './client.js';

export async function listModels() {
  const client = getClient();
  const res = await client.config.providers();

  if (res.error) {
    throw new Error('Failed to fetch providers');
  }

  return res.data;
}

let currentModel: { providerID: string; modelID: string } | undefined = undefined;

export function setModel(providerID: string, modelID: string) {
  currentModel = { providerID, modelID };
}

export function getModel() {
  return currentModel;
}
