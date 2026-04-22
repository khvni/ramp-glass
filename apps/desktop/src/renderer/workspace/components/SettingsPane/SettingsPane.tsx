import type { JSX } from 'react';
import type { SSOStatus, User } from '@tinker/shared-types';
import type { AuthProvider } from '../../../../bindings.js';
import { SettingsShell } from '../SettingsShell/index.js';
import { AccountSection } from './components/AccountSection/index.js';
import { ModelSection } from './components/ModelSection/index.js';

type ProviderBusyState = Record<AuthProvider, boolean>;
type ProviderMessageState = Partial<Record<AuthProvider, string | null>>;

export type SettingsPaneProps = {
  readonly currentUserName: string;
  readonly currentUserProvider: User['provider'];
  readonly currentUserEmail: string | null;
  readonly currentUserAvatarUrl: string | null;
  readonly nativeRuntimeAvailable: boolean;
  readonly guestBusy: boolean;
  readonly guestMessage: string | null;
  readonly modelConnected: boolean;
  readonly modelAuthBusy: boolean;
  readonly modelAuthMessage: string | null;
  readonly providerBusy: ProviderBusyState;
  readonly providerMessages: ProviderMessageState;
  readonly sessions: SSOStatus;
  readonly onContinueAsGuest: () => Promise<void>;
  readonly onConnectModel: () => Promise<void>;
  readonly onDisconnectModel: () => Promise<void>;
  readonly onConnectGoogle: () => Promise<void>;
  readonly onConnectGithub: () => Promise<void>;
  readonly onConnectMicrosoft: () => Promise<void>;
};

export const SettingsPane = ({
  currentUserName,
  currentUserProvider,
  currentUserEmail,
  currentUserAvatarUrl,
  nativeRuntimeAvailable,
  guestBusy,
  guestMessage,
  modelConnected,
  modelAuthBusy,
  modelAuthMessage,
  providerBusy,
  providerMessages,
  sessions,
  onContinueAsGuest,
  onConnectModel,
  onDisconnectModel,
  onConnectGoogle,
  onConnectGithub,
  onConnectMicrosoft,
}: SettingsPaneProps): JSX.Element => {
  return (
    <SettingsShell
      title="Settings"
      sections={[
        {
          id: 'account',
          label: 'Account',
          content: (
            <AccountSection
              currentUserName={currentUserName}
              currentUserProvider={currentUserProvider}
              currentUserEmail={currentUserEmail}
              currentUserAvatarUrl={currentUserAvatarUrl}
              nativeRuntimeAvailable={nativeRuntimeAvailable}
              guestBusy={guestBusy}
              guestMessage={guestMessage}
              providerBusy={providerBusy}
              providerMessages={providerMessages}
              sessions={sessions}
              onContinueAsGuest={onContinueAsGuest}
              onConnectGoogle={onConnectGoogle}
              onConnectGithub={onConnectGithub}
              onConnectMicrosoft={onConnectMicrosoft}
            />
          ),
        },
        {
          id: 'model',
          label: 'Model',
          content: (
            <ModelSection
              nativeRuntimeAvailable={nativeRuntimeAvailable}
              modelConnected={modelConnected}
              modelAuthBusy={modelAuthBusy}
              modelAuthMessage={modelAuthMessage}
              onConnectModel={onConnectModel}
              onDisconnectModel={onDisconnectModel}
            />
          ),
        },
      ]}
      defaultActiveSectionId="account"
    />
  );
};
