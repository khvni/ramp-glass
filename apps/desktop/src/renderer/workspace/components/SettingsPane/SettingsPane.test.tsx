import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDefaultWorkspacePreferences, type SSOStatus } from '@tinker/shared-types';

vi.mock('../../../panes/Settings/index.js', () => ({
  Settings: ({ modelConnected }: { modelConnected: boolean }) => (
    <div>{modelConnected ? 'Mock settings connected' : 'Mock settings disconnected'}</div>
  ),
}));

import { SettingsPane } from './SettingsPane.js';
import { SettingsPaneRuntimeContext } from '../../settings-pane-runtime.js';

const EMPTY_SESSIONS: SSOStatus = {
  google: null,
  github: null,
  microsoft: null,
};

describe('SettingsPane', () => {
  it('renders the wired settings surface through runtime context', () => {
    const markup = renderToStaticMarkup(
      <SettingsPaneRuntimeContext.Provider
        value={{
          modelConnected: false,
          modelAuthBusy: false,
          modelAuthMessage: null,
          googleAuthBusy: false,
          googleAuthMessage: null,
          githubAuthBusy: false,
          githubAuthMessage: null,
          microsoftAuthBusy: false,
          microsoftAuthMessage: null,
          sessions: EMPTY_SESSIONS,
          mcpStatus: {},
          vaultPath: null,
          onConnectModel: async () => undefined,
          onConnectGoogle: async () => undefined,
          onConnectGithub: async () => undefined,
          onConnectMicrosoft: async () => undefined,
          onDisconnectModel: async () => undefined,
          onDisconnectGoogle: async () => undefined,
          onDisconnectGithub: async () => undefined,
          onDisconnectMicrosoft: async () => undefined,
          onCreateVault: async () => undefined,
          onSelectVault: async () => undefined,
          workspacePreferences: createDefaultWorkspacePreferences(),
          onWorkspacePreferencesChange: () => undefined,
        }}
      >
        <SettingsPane />
      </SettingsPaneRuntimeContext.Provider>,
    );

    expect(markup).toContain('Mock settings disconnected');
  });
});
