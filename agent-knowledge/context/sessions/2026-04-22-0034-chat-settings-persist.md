# Session Summary — TIN-46, TIN-173, TIN-174

## What shipped

- Added persisted chat-session settings in SQLite: `sessions.mode`, `sessions.model_id`, and `sessions.reasoning_level`, plus migration logic for existing databases.
- Extended shared pane payload so each chat pane stores its persisted SQLite session id in layout state and restores settings across app restart.
- Moved model, mode, reasoning, and context controls into the Chat header. Plan mode now shows a read-only badge tint.
- Verified OpenCode prompt wiring against upstream: mode maps to prompt `agent`, reasoning maps to prompt `variant`.
- Added reasoning-capable model metadata + stable stored ids (`provider/model`) in `apps/desktop/src/renderer/opencode.ts`.
- Seeded a `local-user` record on boot so offline mode can persist chat sessions before any SSO connection.

## Verification

- `pnpm -r --filter "./packages/*" --filter "./apps/*" typecheck`
- `pnpm -r --filter "./packages/*" --filter "./apps/*" test`

## Follow-up context

- PR: #80
- Branch: `khvni/chat-settings-persist`
- Context badge is now wired into the Chat header for the selected model/session state. Full streaming-token recompute semantics from task 5.3 still deserve a dedicated pass if that task stays open separately.
