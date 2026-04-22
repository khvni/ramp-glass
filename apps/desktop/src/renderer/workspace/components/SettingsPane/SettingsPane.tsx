import { useMemo, type JSX } from 'react';
import { SettingsShell, type SettingsShellSection } from '../SettingsShell/index.js';
import { useSettingsPaneRuntime } from '../../settings-pane-runtime.js';
import { ConnectionsSection } from '../../../panes/Settings/ConnectionsSection/index.js';
import { AccountSection } from './components/AccountSection/index.js';
import { ModelSection } from './components/ModelSection/index.js';

export const SettingsPane = (): JSX.Element => {
  const runtime = useSettingsPaneRuntime();

  const sections = useMemo<ReadonlyArray<SettingsShellSection>>(
    () => [
      {
        id: 'account',
        label: 'Account',
        content: (
          <AccountSection
            currentUserName={runtime.currentUserName}
            currentUserProvider={runtime.currentUserProvider}
            currentUserEmail={runtime.currentUserEmail}
            currentUserAvatarUrl={runtime.currentUserAvatarUrl}
            nativeRuntimeAvailable={runtime.nativeRuntimeAvailable}
            guestBusy={runtime.guestBusy}
            guestMessage={runtime.guestMessage}
            providerBusy={runtime.providerBusy}
            providerMessages={runtime.providerMessages}
            sessions={runtime.sessions}
            onContinueAsGuest={runtime.onContinueAsGuest}
            onConnectGoogle={runtime.onConnectGoogle}
            onConnectGithub={runtime.onConnectGithub}
            onConnectMicrosoft={runtime.onConnectMicrosoft}
          />
        ),
      },
      {
        id: 'model',
        label: 'Model',
        content: (
          <ModelSection
            nativeRuntimeAvailable={runtime.nativeRuntimeAvailable}
            modelConnected={runtime.modelConnected}
            modelAuthBusy={runtime.modelAuthBusy}
            modelAuthMessage={runtime.modelAuthMessage}
            onConnectModel={runtime.onConnectModel}
            onDisconnectModel={runtime.onDisconnectModel}
          />
        ),
      },
      {
        id: 'connections',
        label: 'Connections',
        content: (
          <ConnectionsSection
            opencode={runtime.opencode}
            vaultPath={runtime.vaultPath}
            memoryPath={runtime.vaultPath}
            seedStatuses={runtime.mcpSeedStatuses}
            onRequestRespawn={runtime.onRequestRespawn}
          />
        ),
      },
    ],
    [runtime],
  );

  return <SettingsShell title="Settings" sections={sections} defaultActiveSectionId="account" />;
};
