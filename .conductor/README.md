# Tinker × Conductor

This repo still supports package-scoped tasking, but the active source of truth is the Tinker PRD and build guide at the repo root.

## Layout

```text
apps/
  desktop/          <- Tauri v2 shell + React renderer
packages/
  shared-types/     <- stable contracts
  bridge/           <- OpenCode stream + memory helpers
  memory/           <- SQLite-backed memory and layout state
```

## Rules

Follow the constraints in `AGENTS.md` / `CLAUDE.md`.

- keep business logic in TypeScript
- keep Rust limited to system plumbing
- prefer deleting obsolete scaffolding over preserving it
