import type { JSX } from 'react';
import {
  ChatsIcon,
  ConnectionsIcon,
  MemoryIcon,
  NewTabIcon,
  SettingsIcon,
} from './icons.js';
import './WorkspaceSidebar.css';

export type WorkspaceSidebarProps = {
  readonly userInitial: string;
  readonly onOpenChat: () => void;
  readonly onOpenMemory: () => void;
  readonly onOpenSettings: () => void;
  readonly onOpenAccount: () => void;
  readonly onOpenConnections: () => void;
};

type RailItemProps = {
  readonly label: string;
  readonly icon: JSX.Element;
  readonly onClick: () => void;
};

const RailItem = ({ label, icon, onClick }: RailItemProps): JSX.Element => (
  <button
    type="button"
    className="tinker-workspace-sidebar__item"
    aria-label={label}
    onClick={onClick}
  >
    {icon}
  </button>
);

export const WorkspaceSidebar = ({
  userInitial,
  onOpenChat,
  onOpenMemory,
  onOpenSettings,
  onOpenAccount,
  onOpenConnections,
}: WorkspaceSidebarProps): JSX.Element => {
  return (
    <nav className="tinker-workspace-sidebar" aria-label="Workspace navigation">
      <div className="tinker-workspace-sidebar__top">
        <RailItem label="Chats" icon={<ChatsIcon />} onClick={onOpenChat} />
        <RailItem label="Memory" icon={<MemoryIcon />} onClick={onOpenMemory} />
        <RailItem label="Connections" icon={<ConnectionsIcon />} onClick={onOpenConnections} />
        <RailItem label="New tab" icon={<NewTabIcon />} onClick={onOpenChat} />
      </div>
      <div className="tinker-workspace-sidebar__bottom">
        <RailItem label="Settings" icon={<SettingsIcon />} onClick={onOpenSettings} />
        <button
          type="button"
          className="tinker-workspace-sidebar__avatar-shell"
          aria-label="Account"
          onClick={onOpenAccount}
        >
          <span className="tinker-workspace-sidebar__avatar" aria-hidden="true">
            {userInitial}
          </span>
        </button>
      </div>
    </nav>
  );
};
