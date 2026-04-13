# F0 · Foundation (serial, before Wave 1)

## Recommended coding agent
- **Primary: Codex.** Config, bundling, lockfile, OpenCode spawn verification.

## Exclusive write scope
- Root `package.json`, `pnpm-workspace.yaml`, `tsconfig.json` (solution file), `pnpm-lock.yaml`
- `opencode.json` (MCP server config)
- `apps/desktop/src/main/opencode.ts` (spawn logic)
- `packages/shared-types/src/**` (FINAL pass — frozen after this merges)

## What to build
1. Add OpenCode as a bundled dependency. Determine how to ship it inside Electron (npm package if available, or bundle the binary). Verify `opencode serve` can be spawned as a child process and responds to `@opencode-ai/sdk` calls.
2. Create `apps/desktop/src/main/opencode.ts`: spawns `opencode serve` on a random local port, monitors health, restarts on crash.
3. Create `opencode.json` at repo root with placeholder MCP server entries for Gmail, Google Calendar, Google Drive.
4. Root `tsconfig.json` solution file referencing all packages/apps.
5. `pnpm install` → commit `pnpm-lock.yaml`.
6. `pnpm typecheck` passes.
7. `packages/shared-types/FROZEN.md` marker.

## Acceptance
- [ ] Electron main process spawns OpenCode, connects via SDK, sends a test message, gets a response.
- [ ] `pnpm typecheck` passes.
- [ ] `opencode.json` has MCP entries (they don't need to work yet — just valid config shape).

## When done
`chore(foundation): OpenCode bundling + freeze shared-types`. PR to `main`.
