import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AddToolPicker } from './AddToolPicker.js';
import { AVAILABLE_MCPS } from './available-mcps.js';

describe('AddToolPicker', () => {
  it('renders nothing when closed', () => {
    const markup = renderToStaticMarkup(<AddToolPicker open={false} onClose={vi.fn()} />);
    expect(markup).toBe('');
  });

  it('lists every available-mcp entry as a disabled card when open', () => {
    const markup = renderToStaticMarkup(<AddToolPicker open onClose={vi.fn()} />);

    expect(markup).toContain('Add a tool');
    for (const mcp of AVAILABLE_MCPS) {
      expect(markup).toContain(mcp.label);
      expect(markup).toContain(mcp.ticket);
      expect(markup).toContain(mcp.ticketUrl);
    }
    const disabledCount = markup.match(/aria-disabled="true"/g)?.length ?? 0;
    expect(disabledCount).toBeGreaterThanOrEqual(AVAILABLE_MCPS.length);
  });

  it('announces placeholder copy', () => {
    const markup = renderToStaticMarkup(<AddToolPicker open onClose={vi.fn()} />);
    expect(markup).toContain('Coming soon — needs sign-in');
  });
});
