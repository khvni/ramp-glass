import type { JSX } from 'react';
import { ConnectionsSection } from '../../../panes/Settings/ConnectionsSection/index.js';
import { useSettingsPaneRuntime } from '../../settings-pane-runtime.js';
import './ConnectionsRoute.css';

export const ConnectionsRoute = (): JSX.Element => {
  const runtime = useSettingsPaneRuntime();

  return (
    <main className="tinker-connections-route" aria-labelledby="tinker-connections-route-heading">
      <header className="tinker-connections-route__header">
        <p className="tinker-eyebrow">Workspace route</p>
        <h2 id="tinker-connections-route-heading">Connections</h2>
        <p className="tinker-muted">
          Monitor and retry the built-in MCP tools available to the active OpenCode sidecar.
        </p>
      </header>
      <ConnectionsSection
        opencode={runtime.opencode}
        vaultPath={runtime.vaultPath}
        memoryPath={runtime.vaultPath}
        seedStatuses={runtime.mcpSeedStatuses}
        onRequestRespawn={runtime.onRequestRespawn}
      />
    </main>
  );
};
