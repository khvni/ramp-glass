import type { ReactNode } from 'react';
import { registerPane } from '../../workspace/pane-registry.js';
import { FilePane } from './FilePane.js';

export const registerFilePane = (): void => {
  registerPane('file', (data): ReactNode => <FilePane data={data} />);
};
