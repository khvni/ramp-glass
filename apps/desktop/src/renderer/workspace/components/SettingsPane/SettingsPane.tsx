import { useMemo, type JSX } from 'react';
import { AccountPanel } from '../AccountPanel/index.js';
import { MemorySettingsPanel } from '../MemorySettingsPanel/index.js';
import { SettingsShell, type SettingsShellSection } from '../SettingsShell/index.js';
import { useSettingsPaneRuntime } from '../../settings-pane-runtime.js';

const UserIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MemoryIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16" />
    <path d="M4 12h10" />
    <path d="M4 17h7" />
    <path d="M18 15v4" />
    <path d="M16 17h4" />
  </svg>
);

export const SettingsPane = (): JSX.Element => {
  const runtime = useSettingsPaneRuntime();

  const sections = useMemo<ReadonlyArray<SettingsShellSection>>(
    () => [
      {
        id: 'account',
        label: 'Account',
        icon: <UserIcon />,
        content: (
          <AccountPanel
            session={runtime.activeSession}
            signOutBusy={runtime.signOutBusy}
            signOutMessage={runtime.signOutMessage}
            onSignOut={runtime.onSignOut}
          />
        ),
      },
      {
        id: 'memory',
        label: 'Memory',
        icon: <MemoryIcon />,
        content: (
          <MemorySettingsPanel
            workspacePreferences={runtime.workspacePreferences}
            onWorkspacePreferencesChange={runtime.onWorkspacePreferencesChange}
          />
        ),
      },
    ],
    [
      runtime.activeSession,
      runtime.onSignOut,
      runtime.onWorkspacePreferencesChange,
      runtime.signOutBusy,
      runtime.signOutMessage,
      runtime.workspacePreferences,
    ],
  );

  return <SettingsShell sections={sections} />;
};
