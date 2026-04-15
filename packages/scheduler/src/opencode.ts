import type { OpencodeClient, Part } from '@opencode-ai/sdk/v2/client';

const getTextOutput = (parts: Part[]): string => {
  const text = parts
    .filter((part): part is Extract<Part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('')
    .trim();

  return text.length > 0 ? text : 'Run completed without text output.';
};

export const runPromptWithClient = async (
  client: OpencodeClient,
  title: string,
  prompt: string,
): Promise<string> => {
  const created = await client.session.create({ title: `Scheduled: ${title}` });
  const session = created.data;

  if (!session) {
    throw new Error('OpenCode did not return a session for scheduled job.');
  }

  const response = await client.session.prompt({
    sessionID: session.id,
    parts: [{ type: 'text', text: prompt }],
  });

  const payload = response.data;
  if (!payload) {
    throw new Error('OpenCode did not return output for scheduled job.');
  }

  return getTextOutput(payload.parts);
};
