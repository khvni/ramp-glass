// @vitest-environment jsdom

// @ts-expect-error React uses this flag in tests.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceSidebar } from './WorkspaceSidebar.js';

const noop = (): void => {};

describe('WorkspaceSidebar', () => {
  it('renders the rail with user initial and core MVP nav labels', () => {
    const markup = renderToStaticMarkup(
      <WorkspaceSidebar
        userInitial="K"
        onOpenChat={noop}
        onOpenMemory={noop}
        onOpenSettings={noop}
        onOpenAccount={noop}
        onOpenConnections={noop}
      />,
    );

    expect(markup).toContain('aria-label="Workspace navigation"');
    for (const label of ['Chats', 'Memory', 'Connections', 'New tab', 'Settings', 'Account']) {
      expect(markup).toContain(`aria-label="${label}"`);
    }
    expect(markup).toContain('>K<');
  });

  it('hides deferred post-MVP rail items', () => {
    const markup = renderToStaticMarkup(
      <WorkspaceSidebar
        userInitial="T"
        onOpenChat={noop}
        onOpenMemory={noop}
        onOpenSettings={noop}
        onOpenAccount={noop}
        onOpenConnections={noop}
      />,
    );

    const hidden = ['Workspaces', 'Explorer', 'Skills', 'Agents', 'Playbook', 'Analytics'];
    for (const label of hidden) {
      expect(markup).not.toContain(`aria-label="${label}"`);
    }
  });

  it('fires callbacks when rail items are clicked', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onOpenChat = vi.fn();
    const onOpenMemory = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenAccount = vi.fn();
    const onOpenConnections = vi.fn();

    await act(async () => {
      root.render(
        <WorkspaceSidebar
          userInitial="K"
          onOpenChat={onOpenChat}
          onOpenMemory={onOpenMemory}
          onOpenSettings={onOpenSettings}
          onOpenAccount={onOpenAccount}
          onOpenConnections={onOpenConnections}
        />,
      );
    });

    const click = (label: string): void => {
      const button = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
      if (!button) {
        throw new Error(`button ${label} not found`);
      }
      button.click();
    };

    click('Chats');
    click('Memory');
    click('Connections');
    click('New tab');
    click('Settings');
    click('Account');

    expect(onOpenChat).toHaveBeenCalledTimes(2);
    expect(onOpenMemory).toHaveBeenCalledTimes(1);
    expect(onOpenConnections).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onOpenAccount).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
