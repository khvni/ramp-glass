import type { JSX } from 'react';
import type { SSOStatus, User } from '@tinker/shared-types';
import type { AuthProvider } from '../../../../bindings.js';
import { SettingsShell } from '../SettingsShell/index.js';
import { AccountSection } from './components/AccountSection/index.js';

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
  readonly providerBusy: ProviderBusyState;
  readonly providerMessages: ProviderMessageState;
  readonly sessions: SSOStatus;
  readonly onContinueAsGuest: () => Promise<void>;
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
  providerBusy,
  providerMessages,
  sessions,
  onContinueAsGuest,
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
      ]}
      defaultActiveSectionId="account"
    />
  );
};
