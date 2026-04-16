---
type: concept
tags: [tinker, feature, workspace, dockview, ui, persistence]
status: review
priority: p1
---

# Feature 07 — Workspace Persistence + Split-Pane UI

Code-editor-style workspace. Not a chat window. Layout survives restart. Renders everything inline.

## Goal

User opens Tinker. Their workspace is exactly how they left it — panes in the same positions, tabs in the same order, scroll positions preserved. New tabs (markdown, CSV, code, images) open inline as they're created by the agent. Drag tabs to rearrange, split panes to compare.

## Reference Implementation ([[ramp-glass]])

- `[2026-04-10]` **Split panes** — multiple chat sessions side by side, or docs/data/code alongside conversations
- `[2026-04-10]` Works like a code editor: drag tabs to rearrange, split horizontally or vertically
- `[2026-04-10]` Renders markdown, HTML, CSVs, images, and code with syntax highlighting inline as tabs
- `[2026-04-10]` When Claude creates or edits a file, it opens automatically — no switching windows
- `[2026-04-10]` Layout **persists across sessions** — workspace is exactly how you left it

## Tinker Scope

### v1 Scope
- `[2026-04-14]` **Dockview** (`dockview-react`) for split-pane layout (already in PRD §2.5, CLAUDE.md §3)
- `[2026-04-14]` Layout state serialized to SQLite on every change (debounced)
- `[2026-04-14]` Default layout: Chat + Today (per PRD)
- `[2026-04-14]` Tab renderers: markdown, CSV, code (syntax-highlighted), image, plain text, agent-created-file
- `[2026-04-14]` Auto-open on file creation/edit by agent

### v2 / later
- Workspace profiles (different layouts for different work modes — "research mode" vs "email drafting mode")
- Saved layout presets (users publish to Dojo-adjacent repo)
- Multi-window support (not v1 per Tauri simplicity)

## Architecture

### Dockview integration

- `[2026-04-14]` Dockview component at the root of the renderer tree
- `[2026-04-14]` Panes registered with a type string; a pane factory instantiates the right component
- `[2026-04-14]` Dockview API exposes `toJSON()` / `fromJSON()` for serialization — use these

### Serialization

- `[2026-04-14]` Dockview layout JSON persisted to SQLite `layout_state` table (single row, updated in place)
- `[2026-04-14]` Save on layout events (debounced to avoid thrashing): pane added/removed, tab moved, split/merge, size change
- `[2026-04-14]` On app launch: read `layout_state`; if present and version-compatible, hydrate via `fromJSON()`; else fall back to default layout
- `[2026-04-14]` Version the serialized format — if app ships a breaking change, migrate or fall back

### Tab content types

| Tab type | Renderer | Open trigger |
|---|---|---|
| `chat` | Chat pane — existing OpenCode session view | User action, default layout |
| `today` | Today pane — recent entities, recommended skills | Default layout |
| `markdown` | Markdown renderer (with wikilinks) | User opens `.md` file, agent creates note |
| `csv` | Table renderer (sortable, searchable) | Agent outputs CSV, user opens `.csv` |
| `code` | Lazy syntax-highlighted code renderer (`highlight.js`) | Agent creates/edits code file |
| `image` | Image viewer | Agent outputs image, user opens image file |
| `text` | Plain text fallback | Any other file type |
| `skill` | Skill markdown editor (special mode) | User edits a skill via Dojo |

### Auto-open behavior

- `[2026-04-14]` Bridge package listens for OpenCode `file-created` / `file-edited` events
- `[2026-04-14]` When a vault file is created or modified by the agent, auto-open in a new tab (or focus existing tab)
- `[2026-04-14]` User preference: "open created files automatically" toggle (default on)

## Implementation Outline

### Package boundary
- `[2026-04-14]` **`apps/desktop/src/renderer`** — Dockview setup, pane factory, tab renderers
- `[2026-04-14]` **`packages/memory`** — `layout_state` table + save/load queries
- `[2026-04-14]` **`packages/bridge`** — file-event listener for auto-open

### Dependencies (per CLAUDE.md §3)
- `[2026-04-14]` `dockview-react` — layout (required)
- `[2026-04-15]` `highlight.js` — render-only syntax highlighting for code tabs (lazy language chunks)
- `[2026-04-14]` `react-markdown` or similar — markdown rendering
- `[2026-04-14]` `papaparse` — CSV parsing for table renderer

## UX Invariants (from CLAUDE.md §8)

- Dockview only — no custom layout engine
- Split panes, movable tabs, restored layout must work
- App must stay usable when integrations disconnected
- No modal-heavy core flows
- Dark, focused UI with persistent workspace state

## Out of Scope

- `[2026-04-14]` Multi-window support — v1 is single-window
- `[2026-04-14]` Floating panes (detached from main window) — adds complexity for minor benefit
- `[2026-04-14]` Custom theming in v1 — dark theme only, CSS variables for later extensibility

## Open Questions

- **Inline code editing**: render-only code tabs now use lazy `highlight.js`. If v1 expands into richer in-pane editing, revisit CodeMirror 6 vs. Monaco then.
- **Layout migration**: how aggressive on version bumps? Safer to fall back to default than to attempt auto-migration for significant structural changes.
- **Multi-session chat tabs**: can user open two separate OpenCode sessions side by side? Leaning yes — this is part of Glass's "multi-chat" flavor.

## Open-Source References

- `dockview-react` — https://dockview.dev/
- VS Code workbench layout — conceptual reference for behavior expectations
- JetBrains IDEs — reference for tab/pane interaction patterns
- Positron IDE — React-based code editor with Dockview-style layout (good OSS reference for similar patterns)
- Cursor — chat + code editor hybrid; reference for how chat coexists with editor panes

## Acceptance Criteria

- [x] Dockview renders a multi-pane workspace — `apps/desktop/src/renderer/workspace/Workspace.tsx`
- [x] Default layout shows Chat + Today on first launch — `workspace/layout.default.ts` (+ Vault + Settings)
- [x] User can drag tabs to rearrange — native Dockview behavior
- [x] User can split panes horizontally and vertically — native Dockview behavior
- [x] Layout state serializes to SQLite on change — `packages/memory/src/layout-store.ts` + debounced (300ms) save in `Workspace.onReady`
- [x] Layout restores on app relaunch — `layoutStore.load()` + `event.api.fromJSON()` with version-gated hydration
- [x] Agent-created files auto-open in new tabs — `Chat` forwards `file_written` stream events to `Workspace.openFileInWorkspace`, which resolves vault-relative paths via `resolveVaultPath` and opens/focuses the right renderer panel
- [x] Markdown, CSV, code, and image tabs render inline with correct content — renderers wired through `pane-registry` + `getPaneKindForPath`; code tabs now lazy-highlight through `renderers/code-highlighter.ts`
- [x] App remains usable if the layout_state table is empty or corrupted (fallback to default) — `hydrateLayoutRow` rejects incompatible versions and malformed JSON; `fromJSON` failures fall back to `applyDefaultLayout` (see `layout-store.test.ts` for corruption cases)

## Implementation Notes (2026-04-15)

- Layout save is debounced 300ms in `Workspace.scheduleLayoutSave` to avoid thrashing on tab drags. A final flush runs on unmount.
- `hydrateLayoutRow` exported from `layout-store.ts` is the pure hydrate path used both at runtime and in `layout-store.test.ts`.
- `isAbsolutePath` helper in `renderer/renderers/file-utils.ts` keeps POSIX + Windows path detection local to the renderer without leaking `vault-utils` regex internals.
- Auto-open uses the existing `getPanelIdForPath` keying, so repeat writes to the same file reuse the open tab instead of stacking duplicates.
- Code tabs now lazy-load `highlight.js` core plus language modules through `renderers/code-highlighter.ts`. Oversized files (>200k chars) skip highlighting and fall back to plain text so large generated files stay responsive.
- Workspace preferences now persist alongside the Dockview payload inside the existing `layouts.dockview_model_json` row, keeping the new auto-open toggle local-first without extra schema.
- `packages/bridge/src/stream.test.ts` now covers both `patch` and `file` parts emitting `file_written`, closing the original auto-open regression gap from the feature handoff.

## Connections
- [[ramp-glass]] — workspace reference
- [[vision]] — "not a chat window" principle
- [[02-dojo-skill-marketplace]] — uses this pane system for skill browser
