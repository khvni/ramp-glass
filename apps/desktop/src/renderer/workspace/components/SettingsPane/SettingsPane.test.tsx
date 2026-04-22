import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SSOStatus } from '@tinker/shared-types';
import { SettingsPane } from './SettingsPane.js';
import {
  SettingsPaneRuntimeContext,
  type SettingsPaneRuntime,
} from '../../settings-pane-runtime.js';

const emptySessions: SSOStatus = { google: null, github: null, microsoft: null };

const baseRuntime: SettingsPaneRuntime = {
  nativeRuntimeAvailable: true,
  currentUserName: 'Guest',
  currentUserProvider: 'local',
  currentUserEmail: null,
  currentUserAvatarUrl: null,
  sessions: emptySessions,
  activeSession: null,
  signOutBusy: false,
  signOutMessage: null,
  guestBusy: false,
  guestMessage: null,
  providerBusy: { google: false, github: false, microsoft: false },
  providerMessages: { google: null, github: null, microsoft: null },
  modelConnected: false,
  modelAuthBusy: false,
  modelAuthMessage: null,
  opencode: null,
  vaultPath: null,
  mcpSeedStatuses: {},
  onSignOut: vi.fn().mockResolvedValue(undefined),
  onContinueAsGuest: vi.fn().mockResolvedValue(undefined),
  onConnectGoogle: vi.fn().mockResolvedValue(undefined),
  onConnectGithub: vi.fn().mockResolvedValue(undefined),
  onConnectMicrosoft: vi.fn().mockResolvedValue(undefined),
  onConnectModel: vi.fn().mockResolvedValue(undefined),
  onDisconnectModel: vi.fn().mockResolvedValue(undefined),
  onRequestRespawn: vi.fn().mockResolvedValue(undefined),
};

describe('SettingsPane', () => {
  it('renders Account, Model, and Connections sections', () => {
    const markup = renderToStaticMarkup(
      <SettingsPaneRuntimeContext.Provider value={baseRuntime}>
        <SettingsPane />
      </SettingsPaneRuntimeContext.Provider>,
    );

    expect(markup).toContain('Settings');
    expect(markup).toContain('Account');
    expect(markup).toContain('Model');
    expect(markup).toContain('Connections');
    expect(markup).toContain('Continue as guest');
    expect(markup).toContain('Continue with GitHub');
  });

  it('throws without a runtime provider', () => {
    expect(() => renderToStaticMarkup(<SettingsPane />)).toThrow(/Settings pane runtime is missing/);
  });
});
