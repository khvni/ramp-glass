import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  Modal,
  SearchInput,
  SegmentedControl,
  Skeleton,
  Toggle,
  useToast,
} from '@tinker/design';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Skill, SkillGitConfig, SkillStore } from '@tinker/shared-types';
import { isGitAvailable, syncSkills } from '@tinker/memory';
import { usePlaybookPaneRuntime } from '../../playbook-pane-runtime.js';
import { runSkillAutoSync } from '../../skill-auto-sync.js';
import { PlaybookSettingsModal } from './components/PlaybookSettingsModal/index.js';
import {
  derivePlaybookRoleOptions,
  matchesPlaybookFilter,
  type PlaybookRoleFilter,
} from './playbookFilters.js';
import './PlaybookPane.css';

const MAX_PREVIEW_BODY_LENGTH = 16_000;

const SettingsIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

export type PlaybookPaneProps = {
  /**
   * Test hook: supply the skill store + active-skill revision callback
   * directly rather than reading from `PlaybookPaneRuntimeContext`. Production
   * callers go through the context.
   */
  readonly runtimeOverride?: {
    readonly skillStore: SkillStore;
    readonly skillsRootPath: string | null;
    readonly onActiveSkillsChanged: () => void;
  };
  /**
   * Test hook: short-circuits `isGitAvailable()` so tests don't invoke the
   * shell plugin. Defaults to the production helper.
   */
  readonly gitAvailabilityOverride?: () => Promise<boolean>;
  /**
   * Test hook: replaces the real `syncSkills` call.
   */
  readonly syncSkillsOverride?: typeof syncSkills;
  /**
   * Test hook: replaces the Tauri dialog.open for the install-from-file flow.
   */
  readonly openFileDialogOverride?: () => Promise<string | null>;
};

export const PlaybookPane = (props: PlaybookPaneProps = {}): JSX.Element => {
  if (props.runtimeOverride) {
    return <PlaybookPaneInner {...props} runtimeOverride={props.runtimeOverride} />;
  }

  return <PlaybookPaneWithContextRuntime {...props} />;
};

const PlaybookPaneWithContextRuntime = (props: PlaybookPaneProps): JSX.Element => {
  const runtime = usePlaybookPaneRuntime();
  return <PlaybookPaneInner {...props} runtimeOverride={runtime} />;
};

type PlaybookPaneInnerProps = PlaybookPaneProps & {
  runtimeOverride: NonNullable<PlaybookPaneProps['runtimeOverride']>;
};

const PlaybookPaneInner = ({
  runtimeOverride: { skillStore, skillsRootPath, onActiveSkillsChanged },
  gitAvailabilityOverride,
  syncSkillsOverride,
  openFileDialogOverride,
}: PlaybookPaneInnerProps): JSX.Element => {

  const toast = useToast();
  const [skills, setSkills] = useState<ReadonlyArray<Skill>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlaybookRoleFilter>('');
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const refresh = useCallback(async (): Promise<ReadonlyArray<Skill>> => {
    const next = await skillStore.list();
    setSkills(next);
    return next;
  }, [skillStore]);

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } catch (error) {
        if (active) {
          toast.show({
            title: 'Could not load skills',
            description: error instanceof Error ? error.message : String(error),
            variant: 'error',
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [refresh, toast]);

  const runAutoSync = useCallback(async (): Promise<void> => {
    try {
      await runSkillAutoSync({
        skillStore,
        skillsRootPath,
        ...(gitAvailabilityOverride ? { isGitAvailable: gitAvailabilityOverride } : {}),
        ...(syncSkillsOverride ? { syncSkills: syncSkillsOverride } : {}),
      });
    } catch (error) {
      toast.show({
        title: 'Skill git sync failed',
        description: error instanceof Error ? error.message : String(error),
        variant: 'warning',
      });
    }
  }, [gitAvailabilityOverride, skillStore, skillsRootPath, syncSkillsOverride, toast]);

  const installFromFile = useCallback(
    async (sourcePath: string): Promise<void> => {
      setInstalling(true);
      try {
        const installed = await skillStore.installFromFile(sourcePath);
        await refresh();
        onActiveSkillsChanged();
        toast.show({
          title: `Installed ${installed.title}`,
          variant: 'success',
        });
        void runAutoSync();
      } catch (error) {
        toast.show({
          title: 'Skill install failed',
          description: error instanceof Error ? error.message : String(error),
          variant: 'error',
        });
      } finally {
        setInstalling(false);
      }
    },
    [onActiveSkillsChanged, refresh, runAutoSync, skillStore, toast],
  );

  const handlePickInstallFile = useCallback(async (): Promise<void> => {
    try {
      const picker = openFileDialogOverride
        ?? (async () => {
          const result = await openDialog({
            multiple: false,
            directory: false,
            title: 'Pick a skill markdown file',
            filters: [{ name: 'Skill markdown', extensions: ['md', 'markdown'] }],
          });
          return typeof result === 'string' ? result : null;
        });

      const selected = await picker();
      if (!selected) {
        return;
      }

      await installFromFile(selected);
    } catch (error) {
      toast.show({
        title: 'Could not open file picker',
        description: error instanceof Error ? error.message : String(error),
        variant: 'error',
      });
    }
  }, [installFromFile, openFileDialogOverride, toast]);

  const handleToggleActive = useCallback(
    async (skill: Skill, next: boolean): Promise<void> => {
      try {
        await skillStore.setActive(skill.slug, next);
        await refresh();
        onActiveSkillsChanged();
      } catch (error) {
        toast.show({
          title: 'Could not update skill',
          description: error instanceof Error ? error.message : String(error),
          variant: 'error',
        });
      }
    },
    [onActiveSkillsChanged, refresh, skillStore, toast],
  );

  const handleSaveGitConfig = useCallback(
    async (config: SkillGitConfig): Promise<void> => {
      await skillStore.setGitConfig(config);
      toast.show({ title: 'Skill sync settings saved', variant: 'success' });
    },
    [skillStore, toast],
  );

  const handleSyncNow = useCallback(async (): Promise<void> => {
    // Validation errors surface inline in PlaybookSettingsModal via its own
    // try/catch → setError. Throw a descriptive Error and let the modal render
    // it; no toast here (single source of truth per review).
    const config = await skillStore.getGitConfig();
    if (!config) {
      throw new Error('No git remote configured. Add one in Settings before syncing.');
    }

    const isAvailable = await (gitAvailabilityOverride ?? isGitAvailable)();
    if (!isAvailable) {
      throw new Error('Git is not available on this machine. Install git before syncing skills.');
    }

    if (!skillsRootPath) {
      throw new Error('Skill store is not initialized yet.');
    }

    const syncFn = syncSkillsOverride ?? syncSkills;
    const report = await syncFn(skillsRootPath, config);
    await refresh();
    toast.show({
      title: 'Skill sync complete',
      description: `${report.message}${report.conflicts.length > 0 ? ` · conflicts: ${report.conflicts.join(', ')}` : ''}`,
      variant: report.conflicts.length > 0 ? 'warning' : 'success',
    });
  }, [gitAvailabilityOverride, refresh, skillStore, skillsRootPath, syncSkillsOverride, toast]);

  const roleOptions = useMemo(() => derivePlaybookRoleOptions(skills), [skills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      if (roleFilter.length > 0 && skill.role !== roleFilter) {
        return false;
      }

      return matchesPlaybookFilter(skill, filter);
    });
  }, [filter, roleFilter, skills]);

  return (
    <section className="tinker-pane tinker-playbook-pane">
      <header className="tinker-playbook-pane__header">
        <div>
          <p className="tinker-eyebrow">Playbook</p>
          <h2 className="tinker-playbook-pane__title">Skills</h2>
        </div>
        <div className="tinker-playbook-pane__header-actions">
          <Button
            variant="secondary"
            size="s"
            onClick={() => void handlePickInstallFile()}
            disabled={installing}
          >
            {installing ? 'Installing…' : 'Install from file…'}
          </Button>
          <IconButton
            variant="ghost"
            size="s"
            icon={<SettingsIcon />}
            label="Playbook settings"
            onClick={() => setSettingsOpen(true)}
          />
        </div>
      </header>

      <div className="tinker-playbook-pane__toolbar">
        <div className="tinker-playbook-pane__search">
          <SearchInput
            aria-label="Search skills"
            placeholder="Search by title, description, role, or tag"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
        {roleOptions.length > 0 ? (
          <div className="tinker-playbook-pane__roles">
            <SegmentedControl<PlaybookRoleFilter>
              value={roleFilter}
              onChange={setRoleFilter}
              options={roleOptions}
              label="Filter by role"
            />
          </div>
        ) : null}
      </div>

      <div className="tinker-playbook-pane__grid-wrap">
        {loading ? (
          <div className="tinker-playbook-pane__grid" data-testid="playbook-skeletons">
            <Skeleton variant="rect" width="100%" height={140} />
            <Skeleton variant="rect" width="100%" height={140} />
            <Skeleton variant="rect" width="100%" height={140} />
          </div>
        ) : filteredSkills.length === 0 ? (
          <EmptyState
            title={skills.length === 0 ? 'No skills yet' : 'No skills match this search'}
            description={
              skills.length === 0
                ? 'Install a skill markdown from your disk, or save a conversation as a skill from the chat.'
                : 'Try a different search or clear the role filter.'
            }
            action={
              skills.length === 0 ? (
                <Button variant="primary" size="s" onClick={() => void handlePickInstallFile()}>
                  Install from file…
                </Button>
              ) : (
                <Button variant="ghost" size="s" onClick={() => { setFilter(''); setRoleFilter(''); }}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <div className="tinker-playbook-pane__grid">
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.slug}
                skill={skill}
                onPreview={() => setPreviewSkill(skill)}
                onToggleActive={(next) => void handleToggleActive(skill, next)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={previewSkill !== null}
        onClose={() => setPreviewSkill(null)}
        title={previewSkill?.title ?? 'Skill preview'}
        actions={
          <Button variant="primary" onClick={() => setPreviewSkill(null)}>
            Close
          </Button>
        }
      >
        {previewSkill ? (
          <div className="tinker-playbook-pane__preview">
            {previewSkill.description ? (
              <p className="tinker-playbook-pane__preview-description">{previewSkill.description}</p>
            ) : null}
            <div className="tinker-chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewSkill.body.slice(0, MAX_PREVIEW_BODY_LENGTH)}
              </ReactMarkdown>
            </div>
          </div>
        ) : null}
      </Modal>

      <PlaybookSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        skillStore={skillStore}
        onSave={handleSaveGitConfig}
        onSyncNow={handleSyncNow}
      />
    </section>
  );
};

type SkillCardProps = {
  readonly skill: Skill;
  readonly onPreview: () => void;
  readonly onToggleActive: (next: boolean) => void;
};

const SkillCard = ({ skill, onPreview, onToggleActive }: SkillCardProps): JSX.Element => {
  return (
    <article className="tinker-playbook-card">
      <header className="tinker-playbook-card__header">
        <h3 className="tinker-playbook-card__title">{skill.title}</h3>
        {skill.role ? <Badge variant="skill" size="small">{skill.role}</Badge> : null}
      </header>
      {skill.description ? (
        <p className="tinker-playbook-card__description">{skill.description}</p>
      ) : (
        <p className="tinker-playbook-card__description tinker-playbook-card__description--muted">
          No description provided.
        </p>
      )}
      <footer className="tinker-playbook-card__footer">
        <label className="tinker-playbook-card__toggle">
          <Toggle
            checked={skill.active}
            onChange={onToggleActive}
            label={skill.active ? `Disable ${skill.title} in session` : `Enable ${skill.title} in session`}
          />
          <span>Active in session</span>
        </label>
        <Button variant="ghost" size="s" onClick={onPreview}>
          Preview
        </Button>
      </footer>
    </article>
  );
};

