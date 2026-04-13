import type { Event, OpencodeClient, Part, TextPart, ToolPart } from '@opencode-ai/sdk/v2';
import { getClient } from './client.js';

export type GlassStreamEvent =
  | { type: 'token'; text: string; messageId: string }
  | { type: 'tool_call'; tool: string; callId: string; messageId: string }
  | { type: 'tool_result'; tool: string; callId: string; result: string; messageId: string }
  | { type: 'file_written'; path: string }
  | { type: 'done'; sessionId: string }
  | { type: 'error'; message: string };

export async function* streamSessionEvents(
  sessionId: string
): AsyncIterable<GlassStreamEvent> {
  const client = getClient();
  const res = await client.event.subscribe();

  for await (const raw of res.stream) {
    const ev = raw as Event;

    if (ev.type === 'message.part.updated') {
      const part = ev.properties.part;

      // We only care about parts from the current session
      if (part.sessionID !== sessionId) continue;

      if (part.type === 'text') {
        // v2 doesn't have delta property directly on properties. Just emit the new part.text if we need to.
        // Or if SDK doesn't send token delta explicitly, we just emit the text part text.
        // A delta based approach is more involved (needs storing last text). For now we yield the text change.
        yield {
           type: 'token',
           text: (part as any).text || '',
           messageId: part.messageID
        };
      } else if (part.type === 'tool') {
        const toolPart = part as ToolPart;
        // SDK typings are slightly different, the state object is the literal string "pending" / "running" / "completed" / "error" or an object depending on the version. Assuming standard literal if typescript complains.
        const state = toolPart.state as any;
        if (state === 'running' || state === 'pending' || state.type === 'running' || state.type === 'pending') {
          yield {
            type: 'tool_call',
            tool: toolPart.tool,
            callId: toolPart.callID,
            messageId: part.messageID
          };
        } else if (state === 'completed' || state.type === 'completed') {
           yield {
              type: 'tool_result',
              tool: toolPart.tool,
              callId: toolPart.callID,
              result: JSON.stringify(state.result || 'completed'),
              messageId: part.messageID
           }
        } else if (state === 'error' || state.type === 'error') {
            yield {
              type: 'tool_result',
              tool: toolPart.tool,
              callId: toolPart.callID,
              result: `Error: ${state.error || 'unknown error'}`,
              messageId: part.messageID
            }
        }
      }
    } else if (ev.type === 'file.edited') {
      yield {
        type: 'file_written',
        path: ev.properties.file
      };
    } else if (ev.type === 'session.idle') {
      if (ev.properties.sessionID === sessionId) {
         yield { type: 'done', sessionId };
         break;
      }
    } else if (ev.type === 'session.error') {
      if (!ev.properties.sessionID || ev.properties.sessionID === sessionId) {
        yield { type: 'error', message: 'An error occurred during the session.' };
        break;
      }
    }
  }
}
