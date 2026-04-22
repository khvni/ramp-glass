// @vitest-environment jsdom

// @ts-expect-error React uses this flag in tests.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Titlebar } from './Titlebar.js';

describe('<Titlebar>', () => {
  it('renders the brand label', () => {
    const markup = renderToStaticMarkup(
      <Titlebar
        sessionFolderPath={null}
        isLeftRailVisible
        isRightInspectorVisible
        onToggleLeftRail={() => undefined}
        onToggleRightInspector={() => undefined}
      />,
    );
    expect(markup).toContain('Tinker');
  });

  it('shows the basename crumb when sessionFolderPath is set', () => {
    const markup = renderToStaticMarkup(
      <Titlebar
        sessionFolderPath="/Users/foo/bar/baz"
        isLeftRailVisible
        isRightInspectorVisible
        onToggleLeftRail={() => undefined}
        onToggleRightInspector={() => undefined}
      />,
    );
    expect(markup).toContain('tinker-titlebar__crumb');
    expect(markup).toContain('>baz<');
  });

  it('shows only the brand when sessionFolderPath is null', () => {
    const markup = renderToStaticMarkup(
      <Titlebar
        sessionFolderPath={null}
        isLeftRailVisible
        isRightInspectorVisible
        onToggleLeftRail={() => undefined}
        onToggleRightInspector={() => undefined}
      />,
    );
    expect(markup).not.toContain('tinker-titlebar__crumb');
    expect(markup).not.toContain('tinker-titlebar__sep');
  });

  it('trims trailing separators before picking the basename', () => {
    const withTrailing = renderToStaticMarkup(
      <Titlebar
        sessionFolderPath="/Users/foo/bar/baz/"
        isLeftRailVisible
        isRightInspectorVisible
        onToggleLeftRail={() => undefined}
        onToggleRightInspector={() => undefined}
      />,
    );
    expect(withTrailing).toContain('>baz<');
  });

  it('marks the root with data-tauri-drag-region', () => {
    const markup = renderToStaticMarkup(
      <Titlebar
        sessionFolderPath={null}
        isLeftRailVisible
        isRightInspectorVisible
        onToggleLeftRail={() => undefined}
        onToggleRightInspector={() => undefined}
      />,
    );
    expect(markup).toMatch(/<header[^>]*class="tinker-titlebar"[^>]*data-tauri-drag-region/);
  });

  it('marks the actions cluster with data-tauri-drag-region="false"', () => {
    const markup = renderToStaticMarkup(
      <Titlebar
        sessionFolderPath={null}
        isLeftRailVisible
        isRightInspectorVisible
        onToggleLeftRail={() => undefined}
        onToggleRightInspector={() => undefined}
      />,
    );
    expect(markup).toMatch(
      /<div[^>]*class="tinker-titlebar__actions"[^>]*data-tauri-drag-region="false"/,
    );
  });

  it('reflects rail visibility via aria-pressed on each toggle', () => {
    const collapsed = renderToStaticMarkup(
      <Titlebar
        sessionFolderPath={null}
        isLeftRailVisible={false}
        isRightInspectorVisible
        onToggleLeftRail={() => undefined}
        onToggleRightInspector={() => undefined}
      />,
    );
    // Left rail hidden → aria-pressed="true"; right visible → aria-pressed="false".
    expect(collapsed).toMatch(
      /<button[^>]*aria-label="Toggle left sidebar"[^>]*aria-pressed="true"/,
    );
    expect(collapsed).toMatch(
      /<button[^>]*aria-label="Toggle right inspector"[^>]*aria-pressed="false"/,
    );
  });

  describe('click handlers', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
    });

    afterEach(() => {
      act(() => root.unmount());
      container.remove();
    });

    const renderTitlebar = (handlers: {
      onToggleLeftRail?: () => void;
      onToggleRightInspector?: () => void;
    }): void => {
      act(() => {
        root.render(
          <Titlebar
            sessionFolderPath={null}
            isLeftRailVisible
            isRightInspectorVisible
            onToggleLeftRail={handlers.onToggleLeftRail ?? (() => undefined)}
            onToggleRightInspector={handlers.onToggleRightInspector ?? (() => undefined)}
          />,
        );
      });
    };

    const clickByLabel = (label: string): void => {
      const button = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
      expect(button).not.toBeNull();
      if (button) {
        act(() => {
          button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        });
      }
    };

    it('invokes onToggleLeftRail when the left pane toggle is clicked', () => {
      const spy = vi.fn();
      renderTitlebar({ onToggleLeftRail: spy });
      clickByLabel('Toggle left sidebar');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('invokes onToggleRightInspector when the right inspector toggle is clicked', () => {
      const spy = vi.fn();
      renderTitlebar({ onToggleRightInspector: spy });
      clickByLabel('Toggle right inspector');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
