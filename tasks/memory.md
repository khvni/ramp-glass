# W2 · Memory + Vault

## Recommended coding agent
- **Primary: Codex.** SQLite schema, vault indexer, entity extraction pipelines.
- **Hand-off: Claude Code** for Today.tsx pane.

## Exclusive write scope
- `packages/memory/**`
- `apps/desktop/src/renderer/panes/Today.tsx`
- `apps/desktop/src/main/vault.ts`

## Context
- PRD §2.4 (memory + vault), §3.2 (data model), §3.3 (flows a + c).

## What to build
1. `packages/memory/src/sqlite.ts`: SQLite schema for entities, relationships. `better-sqlite3`. FTS5 for text search.
2. `packages/memory/src/vector.ts`: embedding index for hybrid search (BM25 + vector). Use `sqlite-vss` or a pure-TS fallback.
3. `packages/memory/src/store.ts`: real `createMemoryStore` — upsert, search (hybrid), recentEntities.
4. `packages/memory/src/vault-indexer.ts`: `indexVault(config)` — walk the vault directory, parse markdown + frontmatter, extract entities (people, projects, docs), write to SQLite. Incremental: only re-index changed files.
5. `packages/memory/src/entity-extractor.ts`: given a conversation turn or a vault note, extract entities using a lightweight heuristic (named entity patterns, @-mentions, links). No LLM call for extraction — keep it fast.
6. `packages/memory/src/synthesis.ts`: `runDailySynthesis` — mine last 24h sessions, pull deltas from vault changes, write `daily-summary-YYYY-MM-DD.md` to vault.
7. `apps/desktop/src/main/vault.ts`: vault setup logic — first-run dialog asks "connect existing vault" or "create new at ~/Glass/knowledge/". Store choice in SQLite config table.
8. `apps/desktop/src/renderer/panes/Today.tsx`: shows recent entities, active projects, daily summary. Read-only.

## Tests
- Unit: upsert + search round-trip on `:memory:` SQLite.
- Unit: vault indexer on a fixture directory returns expected entity count.
- Unit: entity extractor on sample text returns expected names/projects.
- Unit: daily synthesis with seeded history produces a non-empty markdown summary.

## Acceptance
- [ ] `pnpm --filter @ramp-glass/memory test` passes.
- [ ] Vault indexer processes 100 markdown files in <2s.
- [ ] Today pane renders entities from an indexed vault.
- [ ] Daily synthesis writes a summary note to the vault directory.

## When done
`feat(memory): SQLite store + vault indexer + Today pane`. PR to `main`.
