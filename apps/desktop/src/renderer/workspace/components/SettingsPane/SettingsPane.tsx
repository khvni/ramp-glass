import type { JSX } from 'react';
import { Settings } from '../../../panes/Settings/index.js';
import { useSettingsPaneRuntime } from '../../settings-pane-runtime.js';

export const SettingsPane = (): JSX.Element => {
  return <Settings {...useSettingsPaneRuntime()} />;
};
