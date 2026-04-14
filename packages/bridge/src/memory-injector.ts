import type { OpencodeClient } from '@opencode-ai/sdk/v2/client';
import type { Entity } from '@tinker/shared-types';
import type { EntitySource } from '@tinker/shared-types/memory';

const entitySummary = (entity: Entity): string => {
  const aliases = entity.aliases.length > 0 ? ` aliases=${entity.aliases.join(', ')}` : '';
  const sources = entity.sources
    .map((source: EntitySource) => `${source.integration}:${source.externalId}`)
    .join(', ');

  return `- ${entity.name} [${entity.kind}]${aliases}${sources ? ` sources=${sources}` : ''}`;
};

export const buildMemoryContext = (entities: Entity[]): string | null => {
  if (entities.length === 0) {
    return null;
  }

  return ['Relevant local memory:', ...entities.map(entitySummary)].join('\n');
};

export const injectMemoryContext = async (
  client: Pick<OpencodeClient, 'session'>,
  sessionID: string,
  entities: Entity[],
): Promise<void> => {
  const text = buildMemoryContext(entities);

  if (!text) {
    return;
  }

  await client.session.prompt({
    sessionID,
    noReply: true,
    parts: [{ type: 'text', text }],
  });
};
