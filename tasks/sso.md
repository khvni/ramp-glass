# W4 · SSO + First-Run

## Recommended coding agent
- **Primary: Codex.** Google OAuth OIDC, Codex OAuth embed — protocol work.
- **Tandem: OpenCode / GPT-5.4** for the Codex OAuth Electron embed (forked from OpenCode's codex.ts).

## Exclusive write scope
- `apps/desktop/src/main/sso.ts`
- `apps/desktop/src/main/codex-auth.ts` (new — Codex OAuth popup in Electron)
- `apps/desktop/src/renderer/panes/Settings.tsx`
- `apps/desktop/src/renderer/panes/FirstRun.tsx` (new — onboarding wizard)

## Context
- PRD §2.2 (SSO + auto-configured integrations), §3.3 (flow a — first launch).
- OpenCode's Codex auth: `packages/opencode/src/plugin/codex.ts`. PKCE flow, auth.openai.com, rewrites to chatgpt.com/backend-api. Fork the logic, embed in Electron BrowserWindow.

## What to build
1. `main/sso.ts`: Google OAuth via `google-auth-library` (or `openid-client` against Google's OIDC endpoints). Opens an Electron BrowserWindow popup. Exchanges code for tokens. Stores in OS keychain (`keytar`). Returns `SSOSession`.
2. `main/codex-auth.ts`: fork OpenCode's Codex PKCE flow. Instead of a terminal browser-open, render the auth page in an Electron BrowserWindow. Capture the redirect. Store tokens. This gives the user GPT-5.4 access via their ChatGPT subscription.
3. `main/sso.ts` → after Google sign-in, auto-configure MCP servers: write Gmail/Calendar/Drive entries to `opencode.json` (or pass config to the running OpenCode server) using the Google OAuth token.
4. `renderer/panes/FirstRun.tsx`: onboarding wizard shown on first launch:
   - Step 1: "Sign in with Google" (or skip).
   - Step 2: "Connect to ChatGPT" (Codex OAuth — or skip for API key fallback).
   - Step 3: "Choose your knowledge base" (connect vault or create new).
   - Step 4: "You're ready."
5. `renderer/panes/Settings.tsx`: view connected accounts, disconnect, re-auth. Model selector. Vault path.

## Tests
- Unit: Google OAuth token exchange with a mocked endpoint.
- Unit: Codex PKCE code verifier/challenge generation.
- Unit: MCP config auto-generation after Google sign-in produces valid opencode.json entries.

## Acceptance
- [ ] First-run wizard walks through all 4 steps.
- [ ] Google OAuth popup completes and returns a session.
- [ ] Codex OAuth popup completes and the user can send messages via GPT-5.4.
- [ ] After Google sign-in, Gmail/Calendar/Drive MCP servers are configured.
- [ ] Skipping SSO still lets the user chat (OpenCode's built-in tools only).

## When done
`feat(sso): Google OAuth + Codex OAuth + first-run wizard`. PR to `main`.
