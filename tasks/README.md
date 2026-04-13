# Per-worktree task briefs

Paste the prompt template into Conductor chat and `@tasks/<name>.md` each brief.

## Agent routing

| Brief | Primary | Tandem | Why |
|---|---|---|---|
| `foundation.md` | **Codex** | OpenCode for bundling verification | Config, lockfile, OpenCode spawn |
| `glass-bridge.md` | **Claude Code** | OpenCode for SDK specifics | Streaming UI, @opencode-ai/sdk |
| `memory.md` | **Codex** | Claude Code (Today.tsx) | SQLite + vault indexer |
| `workspace.md` | **Claude Code** | — | Dockview, renderers, iterative UI |
| `sso.md` | **Codex** | OpenCode (Codex OAuth embed) | Google OAuth, OIDC protocol |
| `polish.md` | **Claude Code** | — | Markdown editor, E2E tests |

## Wave 0 — Foundation (serial)

| Brief | Scope |
|---|---|
| [`foundation.md`](./foundation.md) | Monorepo + OpenCode bundling + opencode.json + freeze shared-types |

## Wave 1 — Parallel (4 agents)

| Brief | Scope |
|---|---|
| [`glass-bridge.md`](./glass-bridge.md) | `packages/glass-bridge` + Chat pane |
| [`memory.md`](./memory.md) | `packages/memory` + vault indexer + Today pane |
| [`workspace.md`](./workspace.md) | Dockview layout + all renderers + persistence |
| [`sso.md`](./sso.md) | Google OAuth + Codex OAuth embed + first-run + Settings |

## Wave 2 — Polish

| Brief | Scope |
|---|---|
| [`polish.md`](./polish.md) | Markdown editor pane + E2E tests |
