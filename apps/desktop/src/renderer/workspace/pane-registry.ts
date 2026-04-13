import type { IContentRenderer } from 'dockview-react';
import type { PaneKind } from '@ramp-glass/shared-types';

export type PaneComponent = React.FC<{ paneId: string; props?: Record<string, unknown> }>;

const registry: Map<PaneKind, PaneComponent> = new Map();

export const registerPane = (kind: PaneKind, component: PaneComponent): void => {
  registry.set(kind, component);
};

export const getPaneComponent = (kind: PaneKind): PaneComponent | undefined => {
  return registry.get(kind);
};

export const listRegisteredPanes = (): PaneKind[] => {
  return Array.from(registry.keys());
};
