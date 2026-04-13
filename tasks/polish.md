# W5 · Markdown editor + E2E tests (Wave 2)

## Recommended coding agent
- **Primary: Claude Code.** Iterative UI + Playwright.

**Wait for Wave 1 to merge.**

## Exclusive write scope
- `apps/desktop/src/renderer/panes/MarkdownEditor.tsx` (new)
- `apps/desktop/src/renderer/renderers/MarkdownRenderer.tsx` (add edit toggle)
- `tests/e2e/**` (new directory)

## What to build

### Markdown editor pane
1. `panes/MarkdownEditor.tsx`: open vault notes for editing. Toggle between rendered view and source editor (Monaco in markdown mode). Save writes back to the vault file. Registered as pane kind `markdown-editor`.
2. Update `MarkdownRenderer.tsx` to add an "Edit" button that opens the same file in the editor pane.

### E2E tests (Playwright against Electron)
1. **First-run smoke:** launch → first-run wizard renders → skip SSO → chat pane loads → type a message → get a response (mocked OpenCode).
2. **Layout persistence:** arrange panes → close → relaunch → assert identical layout.
3. **Vault indexing:** point at a fixture vault → Today pane shows entities.
4. **File auto-open:** agent writes a .md file → tab opens with markdown renderer.
5. **Markdown edit:** open a vault note → toggle to edit → change text → save → verify file on disk.

## Acceptance
- [ ] Markdown editor pane works for vault notes.
- [ ] All 5 E2E tests pass.
- [ ] PRD §9 fidelity checklist: every testable box has a passing test.

## When done
`feat(polish): markdown editor + E2E suite`. PR to `main`.
