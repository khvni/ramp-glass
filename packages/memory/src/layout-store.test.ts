import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CURRENT_LAYOUT_VERSION, hydrateLayoutRow, serializeLayoutState } from './layout-store.js';

describe('hydrateLayoutRow', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns null when no row is stored', () => {
    expect(hydrateLayoutRow(undefined, 'user')).toBeNull();
  });

  it('returns null and warns when the stored version is incompatible', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION + 1,
      dockview_model_json: '{"grid":{}}',
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toBeNull();
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('returns null and warns when the payload is not valid JSON', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      dockview_model_json: '{ not json',
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toBeNull();
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('returns null when the payload is valid JSON but not an object', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      dockview_model_json: 'null',
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toBeNull();
  });

  it('round-trips a persisted layout including workspace preferences', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      dockview_model_json: serializeLayoutState({
        version: CURRENT_LAYOUT_VERSION,
        dockviewModel: { grid: { height: 1, width: 1 } },
        updatedAt: '2026-04-15T00:00:00.000Z',
        preferences: { autoOpenAgentWrittenFiles: false },
      }),
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toEqual({
      version: CURRENT_LAYOUT_VERSION,
      dockviewModel: { grid: { height: 1, width: 1 } },
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences: { autoOpenAgentWrittenFiles: false },
    });
  });

  it('defaults auto-open on when loading a legacy dockview payload', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      dockview_model_json: '{"grid":{"height":1,"width":1}}',
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toEqual({
      version: CURRENT_LAYOUT_VERSION,
      dockviewModel: { grid: { height: 1, width: 1 } },
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences: { autoOpenAgentWrittenFiles: true },
    });
  });
});
