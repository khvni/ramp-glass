import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToastProvider } from '@tinker/design';
import type {
  RoleProfile,
  Skill,
  SkillDraft,
  SkillGitConfig,
  SkillSearchResult,
  SkillStore,
} from '@tinker/shared-types';
import { SaveAsSkillModal } from './SaveAsSkillModal.js';

// Silence the CSS import in jsdom.
vi.mock('./SaveAsSkillModal.css', () => ({}));

const makeSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: overrides.slug ?? 'demo-skill',
  slug: overrides.slug ?? 'demo-skill',
  title: overrides.title ?? 'Demo Skill',
  role: overrides.role ?? null,
  description: overrides.description ?? '',
  tools: overrides.tools ?? [],
  tags: overrides.tags ?? [],
  version: overrides.version ?? '1.0.0',
  author: overrides.author ?? null,
  body: overrides.body ?? '# Body',
  relativePath: overrides.relativePath ?? '.tinker/skills/demo-skill.md',
  frontmatter: overrides.frontmatter ?? {
    id: overrides.slug ?? 'demo-skill',
    title: overrides.title ?? 'Demo Skill',
    version: overrides.version ?? '1.0.0',
  },
  lastModified: overrides.lastModified ?? '2026-04-22T00:00:00.000Z',
  active: overrides.active ?? false,
  installedAt: overrides.installedAt ?? '2026-04-22T00:00:00.000Z',
  ...overrides,
});

type Harness = {
  store: SkillStore;
  installedDrafts: SkillDraft[];
  activations: Array<{ slug: string; active: boolean }>;
};

const createHarness = (): Harness => {
  const installedDrafts: SkillDraft[] = [];
  const activations: Array<{ slug: string; active: boolean }> = [];

  const store: SkillStore = {
    init: () => Promise.resolve(),
    list: () => Promise.resolve([]),
    get: () => Promise.resolve(null),
    search: (): Promise<SkillSearchResult[]> => Promise.resolve([]),
    getActive: () => Promise.resolve([]),
    getRoleProfile: (): Promise<RoleProfile> =>
      Promise.resolve({ roleLabel: '', connectedTools: [], frequentedSkills: [] }),
    setActive: (slug, active) => {
      activations.push({ slug, active });
      return Promise.resolve();
    },
    installFromFile: () => Promise.reject(new Error('not used')),
    installFromDraft: (draft) => {
      installedDrafts.push(draft);
      return Promise.resolve(makeSkill({ slug: draft.slug, title: draft.title ?? draft.slug }));
    },
    uninstall: () => Promise.resolve(),
    reindex: () => Promise.resolve({ skillsIndexed: 0 }),
    getGitConfig: (): Promise<SkillGitConfig | null> => Promise.resolve(null),
    setGitConfig: () => Promise.resolve(),
  };

  return { store, installedDrafts, activations };
};

describe('SaveAsSkillModal', () => {
  it('renders all required fields plus the Activate toggle when open', () => {
    const { store } = createHarness();
    const markup = renderToStaticMarkup(
      <ToastProvider>
        <SaveAsSkillModal
          open
          onClose={() => undefined}
          skillStore={store}
          skillsRootPath={null}
          defaultBody="## User\nHi\n"
          onPublished={() => undefined}
        />
      </ToastProvider>,
    );

    expect(markup).toContain('Save conversation as skill');
    expect(markup).toContain('aria-label="Skill title"');
    expect(markup).toContain('aria-label="Skill role"');
    expect(markup).toContain('aria-label="Skill tags"');
    expect(markup).toContain('aria-label="Skill tools"');
    expect(markup).toContain('aria-label="Skill description"');
    expect(markup).toContain('aria-label="Skill body"');
    expect(markup).toContain('Activate immediately');
    expect(markup).toContain('Save skill');
  });

  it('initial render disables the Save button because title + slug are empty', () => {
    const { store } = createHarness();
    const markup = renderToStaticMarkup(
      <ToastProvider>
        <SaveAsSkillModal
          open
          onClose={() => undefined}
          skillStore={store}
          skillsRootPath={null}
          defaultBody=""
          onPublished={() => undefined}
        />
      </ToastProvider>,
    );

    // Primary Save button is disabled when the title+body are empty.
    expect(markup).toMatch(/tk-button--primary[^"]*tk-button--disabled[^"]*"\s+disabled/);
    expect(markup).toContain('Save skill');
  });

  it('does not render the dialog when closed', () => {
    const { store } = createHarness();
    const markup = renderToStaticMarkup(
      <ToastProvider>
        <SaveAsSkillModal
          open={false}
          onClose={() => undefined}
          skillStore={store}
          skillsRootPath={null}
          defaultBody=""
          onPublished={() => undefined}
        />
      </ToastProvider>,
    );

    expect(markup).not.toContain('Save conversation as skill');
  });
});
