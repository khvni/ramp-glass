import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CURRENT_LAYOUT_VERSION,
  hydrateLayoutRow,
  serializeLayoutState,
} from './layout-store.js';

const SAMPLE_LAYOUT_JSON = {
  global: {},
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 100,
        children: [
          { type: 'tab', id: 'chat-1', name: 'Chat', component: 'chat', config: { kind: 'chat' } },
        ],
      },
    ],
  },
};

const DEFAULT_PREFERENCES = {
  autoOpenAgentWrittenFiles: true,
  isLeftRailVisible: true,
  isRightInspectorVisible: false,
  activeRoute: 'workspace' as const,
  customMcps: [],
};

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
      workspace_state_json: JSON.stringify({ layoutJson: SAMPLE_LAYOUT_JSON }),
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toBeNull();
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('returns null and warns when the payload is not valid JSON', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      workspace_state_json: '{ not json',
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toBeNull();
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('returns null when the payload is valid JSON but not an object', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      workspace_state_json: 'null',
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toBeNull();
  });

  it('round-trips a persisted layout including workspace preferences', () => {
    const preferences = {
      autoOpenAgentWrittenFiles: false,
      isLeftRailVisible: true,
      isRightInspectorVisible: false,
      activeRoute: 'workspace' as const,
      customMcps: [],
    };
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      workspace_state_json: serializeLayoutState({
        version: CURRENT_LAYOUT_VERSION,
        layoutJson: SAMPLE_LAYOUT_JSON,
        updatedAt: '2026-04-15T00:00:00.000Z',
        preferences,
      }),
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toEqual({
      version: CURRENT_LAYOUT_VERSION,
      layoutJson: SAMPLE_LAYOUT_JSON,
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences,
    });
  });

  it('defaults preferences when loading a raw layout payload', () => {
    const row = {
      version: CURRENT_LAYOUT_VERSION,
      workspace_state_json: JSON.stringify({ layoutJson: SAMPLE_LAYOUT_JSON }),
      updated_at: '2026-04-15T00:00:00.000Z',
    };

    expect(hydrateLayoutRow(row, 'user')).toEqual({
      version: CURRENT_LAYOUT_VERSION,
      layoutJson: SAMPLE_LAYOUT_JSON,
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences: DEFAULT_PREFERENCES,
    });
  });
});

describe('serializeLayoutState', () => {
  it('produces valid JSON with layoutJson and preferences keys', () => {
    const state = {
      version: CURRENT_LAYOUT_VERSION,
      layoutJson: SAMPLE_LAYOUT_JSON,
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences: {
        autoOpenAgentWrittenFiles: true,
        isLeftRailVisible: true,
        isRightInspectorVisible: false,
        activeRoute: 'workspace' as const,
        customMcps: [],
      },
    };

    const result = serializeLayoutState(state);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('layoutJson');
    expect(parsed).toHaveProperty('preferences');
  });

  it('serializes layout payload without storage row metadata', () => {
    const state = {
      version: CURRENT_LAYOUT_VERSION,
      layoutJson: SAMPLE_LAYOUT_JSON,
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences: {
        autoOpenAgentWrittenFiles: true,
        isLeftRailVisible: true,
        isRightInspectorVisible: false,
        activeRoute: 'workspace' as const,
        customMcps: [],
      },
    };

    const result = serializeLayoutState(state);
    const parsed = JSON.parse(result);
    expect(parsed.layoutJson).toEqual(SAMPLE_LAYOUT_JSON);
    expect(parsed).not.toHaveProperty('version');
    expect(parsed).not.toHaveProperty('updatedAt');
  });

  it('serializes a layout with an empty/minimal layoutJson', () => {
    const state = {
      version: CURRENT_LAYOUT_VERSION,
      layoutJson: { global: {}, borders: [], layout: { type: 'row', weight: 100, children: [] } },
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences: {
        autoOpenAgentWrittenFiles: false,
        isLeftRailVisible: false,
        isRightInspectorVisible: false,
        activeRoute: 'workspace' as const,
        customMcps: [],
      },
    };

    const result = serializeLayoutState(state);
    const parsed = JSON.parse(result);
    expect(parsed.layoutJson.layout.children).toHaveLength(0);
    expect(parsed.preferences.autoOpenAgentWrittenFiles).toBe(false);
  });

  it('preferences round-trip correctly through serialize and JSON.parse', () => {
    const customPrefs = {
      autoOpenAgentWrittenFiles: false,
      isLeftRailVisible: false,
      isRightInspectorVisible: true,
      activeRoute: 'workspace' as const,
      customMcps: [
        {
          id: 'mcp-1',
          label: 'Test MCP',
          url: 'http://localhost:3000',
          headerName: 'test',
          enabled: true,
        },
      ],
    };

    const state = {
      version: CURRENT_LAYOUT_VERSION,
      layoutJson: SAMPLE_LAYOUT_JSON,
      updatedAt: '2026-04-15T00:00:00.000Z',
      preferences: customPrefs,
    };

    const parsed = JSON.parse(serializeLayoutState(state));
    expect(parsed.preferences).toEqual(customPrefs);
  });
});
