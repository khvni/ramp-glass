import { describe, expect, it, vi } from 'vitest';
import type { Event, OpencodeClient, Part } from '@opencode-ai/sdk/v2/client';
import { streamSessionEvents, type TinkerStreamEvent } from './stream.js';

const toAsyncIterable = <T,>(values: T[]): AsyncIterable<T> => ({
  async *[Symbol.asyncIterator]() {
    yield* values;
  },
});

const makeClient = (events: Event[]): Pick<OpencodeClient, 'event'> => ({
  event: {
    subscribe: vi.fn().mockResolvedValue({
      stream: toAsyncIterable(events),
    }),
  },
}) as unknown as Pick<OpencodeClient, 'event'>;

const makeEvent = (type: Event['type'], properties: Record<string, unknown>): Event =>
  ({ type, properties } as Event);

const collectEvents = async (stream: AsyncIterable<TinkerStreamEvent>): Promise<TinkerStreamEvent[]> => {
  const events: TinkerStreamEvent[] = [];
  for await (const event of stream) {
    events.push(event);
  }
  return events;
};

describe('streamSessionEvents', () => {
  it('emits file_written for patch and file parts from the active session', async () => {
    const client = makeClient([
      makeEvent('message.part.delta', {
        sessionID: 'session-1',
        field: 'text',
        delta: 'hello',
      }),
      makeEvent('message.part.updated', {
        sessionID: 'session-2',
        part: {
          type: 'patch',
          files: ['ignored.md'],
        },
      }),
      makeEvent('message.part.updated', {
        sessionID: 'session-1',
        part: {
          type: 'patch',
          files: ['a.md', 'b.md'],
        } as Part,
      }),
      makeEvent('message.part.updated', {
        sessionID: 'session-1',
        part: {
          type: 'file',
          source: {
            type: 'file',
            path: 'c.md',
          },
        } as Part,
      }),
      makeEvent('session.idle', {
        sessionID: 'session-1',
      }),
      makeEvent('message.part.updated', {
        sessionID: 'session-1',
        part: {
          type: 'patch',
          files: ['after-idle.md'],
        },
      }),
    ]);

    const events = await collectEvents(streamSessionEvents(client, 'session-1'));

    expect(events).toEqual([
      { type: 'token', text: 'hello' },
      { type: 'file_written', path: 'a.md' },
      { type: 'file_written', path: 'b.md' },
      { type: 'file_written', path: 'c.md' },
      { type: 'done' },
    ]);
  });

  it('emits error from session.error and stops', async () => {
    const client = makeClient([
      makeEvent('session.error', {
        sessionID: 'session-1',
        error: {
          name: 'OpenCodeError',
          data: {
            message: 'broken',
          },
        },
      }),
      makeEvent('message.part.updated', {
        sessionID: 'session-1',
        part: {
          type: 'patch',
          files: ['ignored.md'],
        },
      }),
    ]);

    const events = await collectEvents(streamSessionEvents(client, 'session-1'));

    expect(events).toEqual([{ type: 'error', message: 'broken' }]);
  });
});
