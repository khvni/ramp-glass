import type { JSX } from 'react';
import type { SSOStatus } from '@tinker/shared-types';
import type { MCPStatus } from '../../integrations.js';
import {
  SettingsShell,
  type SettingsShellSection,
} from '../../workspace/components/SettingsShell/index.js';
import { Account, type AccountUser } from './sections/Account/index.js';
import { Connections } from './sections/Connections/index.js';
import './Settings.css';

type SettingsProps = {
  modelConnected: boolean;
  modelAuthBusy: boolean;
  modelAuthMessage: string | null;
  googleAuthBusy: boolean;
  googleAuthMessage: string | null;
  githubAuthBusy: boolean;
  githubAuthMessage: string | null;
  microsoftAuthBusy: boolean;
  microsoftAuthMessage: string | null;
  sessions: SSOStatus;
  mcpStatus: Record<string, MCPStatus>;
  vaultPath: string | null;
  currentUser: AccountUser | null;
  signOutBusy: boolean;
  signOutMessage: string | null;
  onConnectModel(): Promise<void>;
  onConnectGoogle(): Promise<void>;
  onConnectGithub(): Promise<void>;
  onConnectMicrosoft(): Promise<void>;
  onDisconnectModel(): Promise<void>;
  onDisconnectGoogle(): Promise<void>;
  onDisconnectGithub(): Promise<void>;
  onDisconnectMicrosoft(): Promise<void>;
  onCreateVault(): Promise<void>;
  onSelectVault(): Promise<void>;
  onSignOut(): Promise<void> | void;
};

export const Settings = ({
  modelAuthBusy,
  modelAuthMessage,
  modelConnected,
  googleAuthBusy,
  googleAuthMessage,
  githubAuthBusy,
  githubAuthMessage,
  microsoftAuthBusy,
  microsoftAuthMessage,
  mcpStatus,
  onConnectGithub,
  onConnectGoogle,
  onConnectMicrosoft,
  onConnectModel,
  onCreateVault,
  onDisconnectGithub,
  onDisconnectGoogle,
  onDisconnectMicrosoft,
  onDisconnectModel,
  onSelectVault,
  sessions,
  vaultPath,
  currentUser,
  signOutBusy,
  signOutMessage,
  onSignOut,
}: SettingsProps): JSX.Element => {
  const sections: ReadonlyArray<SettingsShellSection> = [
    {
      id: 'account',
      label: 'Account',
      content: (
        <div className="tinker-settings__section">
          <Account
            user={currentUser}
            onSignOut={onSignOut}
            busy={signOutBusy}
            message={signOutMessage}
          />
        </div>
      ),
    },
    {
      id: 'connections',
      label: 'Connections',
      content: (
        <div className="tinker-settings__section">
          <Connections
            modelConnected={modelConnected}
            modelAuthBusy={modelAuthBusy}
            modelAuthMessage={modelAuthMessage}
            googleAuthBusy={googleAuthBusy}
            googleAuthMessage={googleAuthMessage}
            githubAuthBusy={githubAuthBusy}
            githubAuthMessage={githubAuthMessage}
            microsoftAuthBusy={microsoftAuthBusy}
            microsoftAuthMessage={microsoftAuthMessage}
            sessions={sessions}
            mcpStatus={mcpStatus}
            vaultPath={vaultPath}
            onConnectModel={onConnectModel}
            onConnectGoogle={onConnectGoogle}
            onConnectGithub={onConnectGithub}
            onConnectMicrosoft={onConnectMicrosoft}
            onDisconnectModel={onDisconnectModel}
            onDisconnectGoogle={onDisconnectGoogle}
            onDisconnectGithub={onDisconnectGithub}
            onDisconnectMicrosoft={onDisconnectMicrosoft}
            onCreateVault={onCreateVault}
            onSelectVault={onSelectVault}
          />
        </div>
      ),
    },
  ];

  return (
    <section className="tinker-pane tinker-settings">
      <SettingsShell sections={sections} />
    </section>
  );
};
