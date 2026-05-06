# MVP verification — identity scoping

End-to-end proof that Tinker scopes sessions, chat history, and memory per user. Pairs M8 (identity) with M2 (folder-scoped sessions) + M6 (per-user memory).

## Automated test

The six-step scenario is encoded as a Vitest integration test:

```
apps/desktop/src/renderer/identityScopingIntegration.test.ts
```

Run it locally:

```bash
pnpm --filter @tinker/desktop exec vitest run src/renderer/identityScopingIntegration.test.ts
```

The test exercises real `@tinker/memory` (`upsertUser`, `createSession`, `listSessionsForUser`, `findLatestSessionForFolder`, `syncActiveMemoryPath`) and real `@tinker/bridge` (`createChatHistoryWriter`, `readChatHistory`) modules against a Node-fs-backed `@tauri-apps/plugin-fs` mock and an in-memory `@tauri-apps/plugin-sql` Database fake. The Tauri shell, OAuth flow, and OpenCode sidecar are out of scope — those layers are exercised by the manual smoke test in `docs/development.md`.

## Scenario

| # | Step | Verified by |
|---|------|-------------|
| 1 | User A signs in, picks folder `F`, sends a message, app closes. | `upsertUser(A)` + `createSession(sessionA)` + `createChatHistoryWriter({ folderPath: F, userId: A })` writes to `<F>/.tinker/chats/<A>/<sessionA>.jsonl`. |
| 2 | Sign out → sign in as User B. | `syncActiveMemoryPath(B)` emits `memory.path-changed` with `previousUserId=A`, `nextUserId=B`. |
| 3 | Folder `F` session NOT visible in User B's switcher. | `listSessionsForUser(B)` is empty; `findLatestSessionForFolder(B, F)` is null; A's session list still contains `sessionA`. |
| 4 | User B picks folder `F` → new JSONL at `<F>/.tinker/chats/<B>/<sessionB>.jsonl`. | New per-user JSONL exists; A's JSONL is byte-identical to step 1; B's chats dir contains only `<sessionB>.jsonl`. |
| 5 | User B's memory subdir is empty (no leak from A). | `<memory_root>/<B>/` does not contain A's marker file; `<memory_root>/<A>/` still does. |
| 6 | Sign out → sign back in as User A → old session resumes + hydrates. | `syncActiveMemoryPath(A)` returns A's original path; `listSessionsForUser(A)` returns `[sessionA]`; `readChatHistory({ folderPath: F, userId: A, sessionId: sessionA })` returns the original events; `getUser(A)` round-trips. |

Pass criteria: User B never sees User A's session, User B gets a new per-user JSONL path for the same folder, User B memory context excludes User A's memory subdir, and User A's original session restores after switching back.

## Manual walkthrough

For a full-stack pass against a real Tauri build (real OAuth, MCP startup, live Chat pane), use two different OAuth accounts on the same machine:

1. Sign in as User A.
2. Pick session folder `F`.
3. Send one chat message and wait for the assistant response to finish.
4. Confirm a chat history file exists under `F/.tinker/chats/<user-a-id>/<session-id>.jsonl`.
5. Close and reopen Tinker.
6. Sign out User A.
7. Sign in as User B.
8. Confirm User A's session for folder `F` is not visible in the session switcher.
9. Pick the same session folder `F`.
10. Send one chat message and wait for the assistant response to finish.
11. Confirm Tinker created a different chat history file under `F/.tinker/chats/<user-b-id>/<new-session-id>.jsonl`.
12. Confirm User B's memory injection reads from `<memory_root>/<user-b-id>/`; on a fresh User B profile it should inject no notes from User A's subdirectory.
13. Sign out User B.
14. Sign back in as User A.
15. Confirm User A's original folder `F` session is visible in the switcher.
16. Open it and confirm the chat hydrates from `F/.tinker/chats/<user-a-id>/<session-id>.jsonl`.

## What the automated test does NOT cover

- The Better Auth sidecar's HTTP/PKCE flow (covered by `packages/auth-sidecar` tests).
- The OpenCode sidecar respawn on user switch (`SMART_VAULT_PATH` plumbing in `apps/desktop/src-tauri`).
- Renderer UI hydration ordering (covered by `apps/desktop/src/renderer/panes/Chat/Chat.test.tsx` + `historyReplay.test.ts`).

For the broader MVP smoke pass, see [`docs/development.md`](./development.md).
