import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsPane } from './SettingsPane.js';

describe('SettingsPane', () => {
  it('renders the account settings shell with guest actions', () => {
    const markup = renderToStaticMarkup(
      <SettingsPane
        currentUserName="Guest"
        currentUserProvider="local"
        currentUserEmail={null}
        currentUserAvatarUrl={null}
        nativeRuntimeAvailable
        guestBusy={false}
        guestMessage={null}
        modelConnected={false}
        modelAuthBusy={false}
        modelAuthMessage={null}
        providerBusy={{ google: false, github: false, microsoft: false }}
        providerMessages={{ google: null, github: null, microsoft: null }}
        sessions={{ google: null, github: null, microsoft: null }}
        onContinueAsGuest={async () => {}}
        onConnectModel={async () => {}}
        onDisconnectModel={async () => {}}
        onConnectGoogle={async () => {}}
        onConnectGithub={async () => {}}
        onConnectMicrosoft={async () => {}}
      />,
    );

    expect(markup).toContain('Settings');
    expect(markup).toContain('Account');
    expect(markup).toContain('Model');
    expect(markup).toContain('Continue as guest');
    expect(markup).toContain('Continue with GitHub');
  });
});
