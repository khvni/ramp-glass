import type { JSX } from 'react';
import type { SSOSession } from '@tinker/shared-types';

type SettingsProps = {
  session: SSOSession | null;
  vaultPath: string | null;
  onConnectGoogle(): Promise<void>;
  onDisconnectGoogle(): Promise<void>;
  onCreateVault(): Promise<void>;
  onSelectVault(): Promise<void>;
};

export const Settings = ({
  session,
  vaultPath,
  onConnectGoogle,
  onCreateVault,
  onDisconnectGoogle,
  onSelectVault,
}: SettingsProps): JSX.Element => {
  return (
    <section className="tinker-pane">
      <header className="tinker-pane-header">
        <div>
          <p className="tinker-eyebrow">Settings</p>
          <h2>Connections and storage</h2>
        </div>
      </header>

      <div className="tinker-list">
        <article className="tinker-list-item">
          <h3>Google</h3>
          <p className="tinker-muted">
            {session ? `Connected as ${session.email}` : 'Not connected. You can skip this and still use Tinker as a coding workspace.'}
          </p>
          <div className="tinker-inline-actions">
            {session ? (
              <button className="tinker-button-secondary" type="button" onClick={() => void onDisconnectGoogle()}>
                Disconnect Google
              </button>
            ) : (
              <button className="tinker-button" type="button" onClick={() => void onConnectGoogle()}>
                Connect Google
              </button>
            )}
          </div>
        </article>

        <article className="tinker-list-item">
          <h3>Vault</h3>
          <p className="tinker-muted">{vaultPath ?? 'No vault selected yet.'}</p>
          <div className="tinker-inline-actions">
            <button className="tinker-button-secondary" type="button" onClick={() => void onSelectVault()}>
              Select existing vault
            </button>
            <button className="tinker-button-ghost" type="button" onClick={() => void onCreateVault()}>
              Create default vault
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};
