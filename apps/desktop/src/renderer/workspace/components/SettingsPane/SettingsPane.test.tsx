import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDefaultWorkspacePreferences, type SSOStatus } from '@tinker/shared-types';
import { SettingsPane } from './SettingsPane.js';
import { SettingsPaneRuntimeContext, type SettingsPaneRuntime } from '../../settings-pane-runtime.js';

const emptySessions: SSOStatus = { google: null, github: null, microsoft: null };

const renderWithRuntime = (overrides: Partial<SettingsPaneRuntime>): string => {
  return renderToStaticMarkup(
    <SettingsPaneRuntimeContext.Provider
      value={{
        sessions: emptySessions,
        activeSession: null,
        signOutBusy: false,
        signOutMessage: null,
        workspacePreferences: createDefaultWorkspacePreferences(),
        onWorkspacePreferencesChange: vi.fn(),
        onSignOut: vi.fn(),
        ...overrides,
      }}
    >
      <SettingsPane />
    </SettingsPaneRuntimeContext.Provider>,
  );
};

describe('SettingsPane', () => {
  it('renders account and memory sections from runtime context', () => {
    const markup = renderWithRuntime({});

    expect(markup).toContain('Account');
    expect(markup).toContain('Memory');
    expect(markup).toContain('Not signed in');
  });

  it('renders the signed-in account state for the active session', () => {
    const activeSession = {
      provider: 'google' as const,
      userId: 'u-1',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      accessToken: 'token',
      refreshToken: 'refresh',
      expiresAt: '2030-01-01T00:00:00.000Z',
      scopes: [],
    };

    const markup = renderWithRuntime({
      sessions: {
        google: activeSession,
        github: null,
        microsoft: null,
      },
      activeSession,
    });

    expect(markup).toContain('Signed in');
    expect(markup).toContain('Ada Lovelace');
    expect(markup).toContain('ada@example.com');
  });

  it('throws when rendered without a runtime provider', () => {
    expect(() => renderToStaticMarkup(<SettingsPane />)).toThrow(/Settings pane runtime is missing/);
  });
});
