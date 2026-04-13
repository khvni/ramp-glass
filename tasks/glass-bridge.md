# W1 · Glass Bridge + Chat pane

## Recommended coding agent
- **Primary: Claude Code.** Streaming UI, @opencode-ai/sdk integration, iterative Chat pane work.

## Exclusive write scope
- `packages/glass-bridge/**`
- `apps/desktop/src/renderer/panes/Chat.tsx`
- `apps/desktop/src/main/bridge-handler.ts` (new — IPC bridge between renderer and OpenCode SDK)

## Context
- PRD §2.1 (OpenCode backend), §3.3 (runtime flow b — sending a message).
- OpenCode SDK docs: HTTP + SSE. Sessions, streaming, tool calls.

## What to build
1. `packages/glass-bridge/src/client.ts`: wrap `@opencode-ai/sdk`. Connect to the local OpenCode server (URL from Electron main process). Manage sessions (create, list, resume).
2. `packages/glass-bridge/src/stream.ts`: convert OpenCode's SSE stream into `AsyncIterable<StreamEvent>` (token deltas, tool calls, tool results, file writes, done, error).
3. `packages/glass-bridge/src/memory-injector.ts`: before each turn, load top-k entities from the memory store and prepend them to the system prompt via OpenCode's session config.
4. `packages/glass-bridge/src/models.ts`: `listModels()` and `setModel()` — expose OpenCode's model selection to the UI.
5. `apps/desktop/src/main/bridge-handler.ts`: IPC handler. Renderer calls `window.glass.sendMessage(sessionId, text)` → main process calls the bridge → streams events back via `webContents.send`.
6. `apps/desktop/src/renderer/panes/Chat.tsx`: streaming message list, input box, model selector dropdown, cancel button. Replace the placeholder.

## Tests
- Unit: stream adapter converts mock SSE into expected `StreamEvent` sequence.
- Unit: memory injector prepends entities to system prompt.
- Unit: model list returns expected shape.

## Acceptance
- [ ] User types in Chat, GPT-5.4 streams a response, tool calls round-trip.
- [ ] Model selector dropdown switches models.
- [ ] Cancel button stops the stream.
- [ ] No raw errors in UI on network failure.

## When done
`feat(glass-bridge): SDK wrapper + Chat pane`. PR to `main`.
