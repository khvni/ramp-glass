# Ramp Glass

A personal/enterprise AI workspace inspired by Ramp's internal "Glass" suite. Electron desktop app with OpenCode as the headless backend, Codex OAuth for flat-rate LLM access, and an Obsidian-compatible vault as the knowledge base.

## Read these first

| File | What |
|---|---|
| `ramp-glass-prd.md` | PRD v2 — what to build |
| `CLAUDE.md` / `AGENTS.md` | Build guide — how to build it |
| `tasks/README.md` | Conductor task briefs |

## Architecture

```
Glass Desktop (Electron + React + Dockview)
    ↕ @opencode-ai/sdk (HTTP + SSE)
OpenCode Server (bundled, headless)
    ↕ Vercel AI SDK + Codex OAuth
GPT-5.4 (flat-rate via ChatGPT subscription)
```

## Status

Scaffolding in place. Run `tasks/foundation.md` (F0) first, then dispatch 4 Wave-1 agents in parallel via Conductor.

## Principles

1. **Don't limit anyone's upside.** Make complexity invisible, don't remove it.
2. **One person's breakthrough becomes everyone's baseline.** (Dojo in v2.)
3. **The product is the enablement.** First-run delivers a result in minutes.
