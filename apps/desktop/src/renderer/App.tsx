import { useState } from 'react';
import { Workspace } from './workspace/Workspace.js';
import { FirstRun } from './panes/FirstRun.js';

export const App = (): JSX.Element => {
  const [firstRunComplete, setFirstRunComplete] = useState(false);

  return (
    <div className="glass-app h-screen w-screen overflow-hidden">
      {!firstRunComplete ? (
        <FirstRun onComplete={() => setFirstRunComplete(true)} />
      ) : (
        <Workspace />
      )}
    </div>
  );
};
