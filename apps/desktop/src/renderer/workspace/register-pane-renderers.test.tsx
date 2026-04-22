import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('./components/SettingsPane/index.js', () => ({
  SettingsPane: () => <div>settings-pane</div>,
}));

vi.mock('./components/MemoryPane/index.js', () => ({
  MemoryPane: () => <div>memory-pane</div>,
}));

const { getRenderer, resetPaneRegistry } = await import('./pane-registry.js');
const { registerWorkspacePaneRenderers } = await import('./register-pane-renderers.js');

describe('registerWorkspacePaneRenderers', () => {
  afterEach(() => {
    resetPaneRegistry();
  });

  it('registers settings and memory panes once', () => {
    registerWorkspacePaneRenderers();
    expect(() => registerWorkspacePaneRenderers()).not.toThrow();

    const settingsMarkup = renderToStaticMarkup(
      <>{getRenderer('settings')({ kind: 'settings' })}</>,
    );
    const memoryMarkup = renderToStaticMarkup(<>{getRenderer('memory')({ kind: 'memory' })}</>);

    expect(settingsMarkup).toContain('settings-pane');
    expect(memoryMarkup).toContain('memory-pane');
  });
});
