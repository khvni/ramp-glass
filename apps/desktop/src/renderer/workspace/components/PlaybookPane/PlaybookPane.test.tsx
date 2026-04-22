import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToastProvider } from '@tinker/design';
import type {
  RoleProfile,
  Skill,
  SkillDraft,
  SkillGitConfig,
  SkillStore,
  SkillSearchResult,
} from '@tinker/shared-types';
import { PlaybookPane } from './PlaybookPane.js';
import {
  derivePlaybookRoleOptions,
  matchesPlaybookFilter,
} from './playbookFilters.js';

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}));

const makeSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: overrides.slug ?? 'gong-call-analysis',
  slug: overrides.slug ?? 'gong-call-analysis',
  title: overrides.title ?? 'Gong Call Analysis',
  role: overrides.role ?? 'sales',
  description: overrides.description ?? 'Summarize a Gong transcript.',
  tools: overrides.tools ?? [],
  tags: overrides.tags ?? ['sales'],
  version: overrides.version ?? '1.0.0',
  author: overrides.author ?? null,
  body: overrides.body ?? '# Body\n\nStep 1',
  relativePath: overrides.relativePath ?? '.tinker/skills/gong-call-analysis.md',
  frontmatter: overrides.frontmatter ?? {
    id: overrides.slug ?? 'gong-call-analysis',
    title: overrides.title ?? 'Gong Call Analysis',
    version: overrides.version ?? '1.0.0',
  },
  lastModified: overrides.lastModified ?? '2026-04-22T00:00:00.000Z',
  active: overrides.active ?? false,
  installedAt: overrides.installedAt ?? '2026-04-22T00:00:00.000Z',
  ...overrides,
});

const createStubSkillStore = (initial: ReadonlyArray<Skill>): SkillStore => {
  const records = new Map<string, Skill>(initial.map((skill) => [skill.slug, skill]));

  return {
    async init(): Promise<void> {
      return;
    },
    async list(): Promise<Skill[]> {
      return [...records.values()];
    },
    async get(slug: string): Promise<Skill | null> {
      return records.get(slug) ?? null;
    },
    async search(_query: string, _limit?: number): Promise<SkillSearchResult[]> {
      return [];
    },
    async getActive(): Promise<Skill[]> {
      return [...records.values()].filter((skill) => skill.active);
    },
    async getRoleProfile(): Promise<RoleProfile> {
      return { roleLabel: '', connectedTools: [], frequentedSkills: [] };
    },
    async setActive(slug: string, active: boolean): Promise<void> {
      const existing = records.get(slug);
      if (existing) {
        records.set(slug, { ...existing, active });
      }
    },
    async installFromFile(_path: string): Promise<Skill> {
      throw new Error('not used');
    },
    async installFromDraft(_draft: SkillDraft): Promise<Skill> {
      throw new Error('not used');
    },
    async uninstall(_slug: string): Promise<void> {
      return;
    },
    async reindex(): Promise<{ skillsIndexed: number }> {
      return { skillsIndexed: records.size };
    },
    async getGitConfig(): Promise<SkillGitConfig | null> {
      return null;
    },
    async setGitConfig(_config: SkillGitConfig | null): Promise<void> {
      return;
    },
  };
};

describe('matchesPlaybookFilter', () => {
  const skill = makeSkill({
    title: 'Pull Request Review',
    description: 'Walk through a changeset and leave comments.',
    role: 'engineering',
    tags: ['code-review', 'github'],
  });

  it('matches on empty / whitespace filter', () => {
    expect(matchesPlaybookFilter(skill, '')).toBe(true);
    expect(matchesPlaybookFilter(skill, '   ')).toBe(true);
  });

  it('matches case-insensitively on title', () => {
    expect(matchesPlaybookFilter(skill, 'pull request')).toBe(true);
    expect(matchesPlaybookFilter(skill, 'REQUEST')).toBe(true);
  });

  it('matches on description, role, and tag substrings', () => {
    expect(matchesPlaybookFilter(skill, 'changeset')).toBe(true);
    expect(matchesPlaybookFilter(skill, 'engineer')).toBe(true);
    expect(matchesPlaybookFilter(skill, 'github')).toBe(true);
  });

  it('returns false when no field contains the filter', () => {
    expect(matchesPlaybookFilter(skill, 'zzzzzz')).toBe(false);
  });
});

describe('derivePlaybookRoleOptions', () => {
  it('returns empty array when fewer than 2 distinct roles exist', () => {
    const skills = [makeSkill({ role: 'sales' }), makeSkill({ role: 'sales', slug: 'b' })];
    expect(derivePlaybookRoleOptions(skills)).toEqual([]);
  });

  it('emits an All option + each role when there are multiple', () => {
    const skills = [
      makeSkill({ role: 'sales', slug: 'a' }),
      makeSkill({ role: 'engineering', slug: 'b' }),
    ];
    const options = derivePlaybookRoleOptions(skills);
    expect(options.map((option) => option.value)).toEqual(['', 'engineering', 'sales']);
  });
});

describe('PlaybookPane', () => {
  it('renders the Playbook eyebrow, title, and Install button', () => {
    const store = createStubSkillStore([]);
    const markup = renderToStaticMarkup(
      <ToastProvider>
        <PlaybookPane
          runtimeOverride={{
            skillStore: store,
            skillsRootPath: '/memory/google:user-1',
            onActiveSkillsChanged: () => undefined,
          }}
          gitAvailabilityOverride={async () => false}
        />
      </ToastProvider>,
    );

    expect(markup).toContain('Playbook');
    expect(markup).toContain('Skills');
    expect(markup).toContain('Install from file');
  });
});
