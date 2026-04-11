# Per-worktree task briefs

These files are the hand-offs for Conductor. The human operator spawns one Conductor workspace per brief and pastes (or `@`-references) the brief into the Conductor chat with a one-line framing:

> *"You are the W<N> agent. Follow `tasks/<name>.md` end-to-end. Do not touch any path outside your Exclusive Write Scope. When done, open a PR to `main`."*

Each brief is self-contained: scope, contract, dependencies, stubs allowed, acceptance test, and the PRD sections that govern it.

## Coding-agent routing (at a glance)

Each brief names a **primary agent** and — where useful — a **tandem** or hand-off. The routing is based on which agent has the strongest native knowledge and feedback loop for the work. Each brief has a "Recommended coding agent" section with the full rationale; the table below is the summary.

| Brief | Primary | Tandem / hand-off | Why |
|---|---|---|---|
| `foundation.md` | **Codex** | OpenCode (shared-types final pass) | Config, lockfile, CI — systematic tooling |
| `agent-runtime.md` | **Claude Code** | — | Native Claude Agent SDK knowledge; iterative Chat pane |
| `memory.md` | **Codex** | Claude Code (Today.tsx); OpenCode (dedupe review) | SQLite + synthesis pipelines are backend |
| `skills.md` | **Claude Code** | — | Same markdown+frontmatter format as Claude Code itself; iterative Dojo UI |
| `integrations.md` | **Codex** | **OpenCode** (parallel on vendor-REST clients) | 11 systematic client wrappers — Codex + GPT consistency |
| `auth.md` | **Codex** | OpenCode (parallel or reviewer) | OIDC + keytar protocol work |
| `dojo-web.md` | **Claude Code** | OpenCode (`/api/sensei` prompt hardening) | Next.js 15 App Router + Tailwind iteration |
| `scheduler.md` | **Codex** | Claude Code (`mobile-approvals`); OpenCode (`prompt-to-job`) | cron + headless + process lifecycle = backend |
| `slack-bot.md` | **Codex** | **OpenCode** (classifier + prompt-injection defense) | Bolt + Octokit systematic work |
| `workspace-polish.md` | **Claude Code** | OpenCode (CSV / Monaco renderers, optional) | Fine-grained visual iteration against live Electron |
| `e2e.md` | **Claude Code** | OpenCode (fixture data generation) | Playwright-Electron iteration |

### Why each agent for which work

- **Claude Code** — unbeatable when the task touches Anthropic-native code (Agent SDK, MCP, skill format) or when the work is iterative frontend with a reload-verify loop (React + FlexLayout + Next.js). Use it for: `agent-runtime`, `skills`, `dojo-web`, `workspace-polish`, `e2e`.
- **Codex** — fastest on systematic backend, protocol, and infra work where consistency across many similar files matters more than visual iteration. Use it for: `foundation`, `memory`, `integrations`, `auth`, `scheduler`, `slack-bot`.
- **OpenCode (GPT-5.4)** — best as a **tandem** for tasks with clear batch structure (N similar clients, OpenAPI-driven wrappers) or as a second pass on security-sensitive and LLM-calling code. Pair it with Codex on `integrations`, `auth`, and `slack-bot`; with Claude Code on the Sensei API route, scheduler's prompt extractor, and E2E fixture data.

## Wave 1 — parallelizable (6 agents)

Run all six simultaneously. They only depend on `packages/shared-types`, which is frozen.

| Brief | Package/App | PRD sections | Primary agent |
|---|---|---|---|
| [`agent-runtime.md`](./agent-runtime.md) | `packages/agent-runtime` + `apps/desktop` Chat pane | §2.1 tone, §3.2 runtime | Claude Code |
| [`memory.md`](./memory.md) | `packages/memory` + Today pane | §2.4, §3.3 Entity model | Codex |
| [`skills.md`](./skills.md) | `packages/skills` + Dojo pane + seed skills | §2.2, §3.3 Skill model | Claude Code |
| [`integrations.md`](./integrations.md) | `packages/integrations` | §2.1, §4.3 self-heal | Codex + OpenCode |
| [`auth.md`](./auth.md) | `packages/auth` + Electron main auth window | §2.1 Okta SSO | Codex |
| [`dojo-web.md`](./dojo-web.md) | `apps/dojo-web` (Next.js on Vercel) | §2.3 Sensei | Claude Code |

## Wave 2 — sequential (start after Wave 1 is merged)

| Brief | Package/App | PRD sections | Primary agent |
|---|---|---|---|
| [`scheduler.md`](./scheduler.md) | `packages/scheduler` + `apps/mobile-approvals` | §2.5, §2.7 | Codex |
| [`slack-bot.md`](./slack-bot.md) | `packages/slack-bot` | §2.6, §2.9 | Codex + OpenCode |
| [`workspace-polish.md`](./workspace-polish.md) | `apps/desktop` workspace layout + renderers | §2.8 | Claude Code |
| [`e2e.md`](./e2e.md) | `tests/e2e` Playwright-Electron | §9 fidelity checklist | Claude Code |

## Rules that apply to every brief

- **`packages/shared-types` is frozen.** Need a new type? Stop, open a coordinator PR against `shared-types`, wait for merge, rebase.
- **Exclusive write scope.** Your brief names the exact paths you may write to. No others.
- **Stub, don't import runtime.** Wave-1 agents must not import another Wave-1 package at runtime. Code against the `shared-types` interface and stub the implementation in tests.
- **`pnpm-lock.yaml` is single-writer.** Rebase onto `main` immediately before adding a dependency.
- **Don't delete placeholder panes** in `apps/desktop/src/renderer/panes/` unless your brief says you own them — another agent may still be racing you.
- **Conventional commits.** Scope = your package (`feat(memory): add sqlite schema`).

See `AGENTS.md` / `CLAUDE.md` at the repo root for the full coding standard.
