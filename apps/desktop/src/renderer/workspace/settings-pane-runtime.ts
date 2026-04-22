import { createContext, useContext } from 'react';
import type { SettingsProps } from '../panes/Settings/Settings.js';

export type SettingsPaneRuntime = SettingsProps;

export const SettingsPaneRuntimeContext = createContext<SettingsPaneRuntime | null>(null);

export const useSettingsPaneRuntime = (): SettingsPaneRuntime => {
  const runtime = useContext(SettingsPaneRuntimeContext);
  if (!runtime) {
    throw new Error(
      'Settings pane runtime is missing. Wrap workspace panes in SettingsPaneRuntimeContext.Provider.',
    );
  }

  return runtime;
};
