# W3 · Workspace + Renderers

## Recommended coding agent
- **Primary: Claude Code.** Dockview iteration, inline renderers, persistent layout — all visual/iterative.

## Exclusive write scope
- `apps/desktop/src/renderer/workspace/**`
- `apps/desktop/src/renderer/renderers/**` (new directory)
- `apps/desktop/src/main/layout-store.ts` (new — SQLite layout persistence)

## Context
- PRD §2.5 (workspace UI), §7 workspace invariants in CLAUDE.md.
- **Dockview**, not FlexLayout. Use `dockview-react` v5+. Consult https://dockview.dev/docs before writing code.

## What to build
1. `workspace/Workspace.tsx`: swap FlexLayout for Dockview. `DockviewReact` component with the pane registry. Default layout: Chat (60%) + Today (40%).
2. `workspace/pane-registry.ts`: update for Dockview's component API (`IContentRenderer`).
3. `workspace/layout.default.ts`: Dockview default layout JSON.
4. `main/layout-store.ts`: serialize Dockview model via `api.toJSON()` to SQLite on every layout change. Restore on launch via `api.fromJSON()`.
5. Renderers (one file each in `renderers/`):
   - `MarkdownRenderer.tsx` — `react-markdown` with syntax-highlighted code blocks. Read-only view.
   - `CsvRenderer.tsx` — `papaparse` → scrollable virtualized table.
   - `CodeRenderer.tsx` — Monaco, read-only by default.
   - `ImageRenderer.tsx` — `<img>` with object-fit.
   - `HtmlRenderer.tsx` — DOMPurify → sandboxed iframe.
6. File auto-open: subscribe to Glass Bridge's `file_written` events. When fired, open a new tab with the appropriate renderer based on file extension.
7. Keyboard shortcuts: `Cmd+\` split vertical, `Cmd+Shift+\` split horizontal, `Cmd+W` close tab, `Cmd+Shift+]`/`[` next/prev tab.

## Tests (Playwright against Electron)
- Drag a tab between pane groups → assert Dockview model updated.
- Close + relaunch → assert identical layout.
- Fake `file_written` event → assert new tab opens with correct renderer.
- Render a fixture markdown, CSV, code, image file → assert visible content.

## Acceptance
- [ ] Dockview workspace renders with Chat + Today.
- [ ] Split H/V, drag tabs between groups.
- [ ] All 5 renderers work.
- [ ] Layout persists across restart.
- [ ] File auto-open on agent write.

## When done
`feat(workspace): Dockview layout + renderers + persistence`. PR to `main`.
