import { useState, type JSX, type ReactNode } from 'react';
import {
  Badge,
  Button,
  ClickableBadge,
  IconButton,
  SearchInput,
  SegmentedControl,
  StatusDot,
  TextInput,
  Toggle,
  type BadgeVariant,
  type StatusDotState,
} from '@tinker/design';
import '@tinker/design/styles/tokens.css';
import './design-system.css';

type PlaygroundTab = 'colors' | 'typography' | 'spacing' | 'components' | 'chat';

const TABS: ReadonlyArray<{ value: PlaygroundTab; label: string }> = [
  { value: 'colors', label: 'Colors' },
  { value: 'typography', label: 'Typography' },
  { value: 'spacing', label: 'Spacing' },
  { value: 'components', label: 'Components' },
  { value: 'chat', label: 'Chat' },
];

const BADGE_VARIANTS: ReadonlyArray<{ variant: BadgeVariant; label: string }> = [
  { variant: 'default', label: 'Default' },
  { variant: 'success', label: 'Success' },
  { variant: 'error', label: 'Error' },
  { variant: 'warning', label: 'Warning' },
  { variant: 'info', label: 'Info' },
  { variant: 'accent', label: 'Accent' },
  { variant: 'skill', label: 'Skill' },
  { variant: 'ghost', label: 'Ghost' },
];

const STATUS_DOTS: ReadonlyArray<{ state: StatusDotState; label: string }> = [
  { state: 'muted', label: 'Muted' },
  { state: 'constructive', label: 'Constructive' },
  { state: 'warning', label: 'Warning' },
  { state: 'danger', label: 'Danger' },
  { state: 'info', label: 'Info' },
  { state: 'claude', label: 'Claude' },
  { state: 'skill', label: 'Skill' },
  { state: 'pulse', label: 'Pulse' },
];

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 5h10M6 5V3.5h4V5M5 5l.6 8h4.8L11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13 8a5 5 0 1 1-1.5-3.55L13 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13 3v3h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type SectionProps = {
  label: string;
  children: ReactNode;
};

const Section = ({ label, children }: SectionProps): JSX.Element => (
  <section className="ds-section">
    <p className="ds-section__label">{label}</p>
    <div className="ds-section__content">{children}</div>
  </section>
);

const Row = ({ children }: { children: ReactNode }): JSX.Element => (
  <div className="ds-row">{children}</div>
);

const ComponentsTab = (): JSX.Element => {
  const [segValue, setSegValue] = useState<'first' | 'second' | 'third'>('first');
  const [toggleOn, setToggleOn] = useState(true);
  const [toggleDim, setToggleDim] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="ds-sections">
      <Section label="Button">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </Row>
        <Row>
          <Button variant="primary" size="s">
            Size S
          </Button>
          <Button variant="primary" size="m">
            Size M
          </Button>
        </Row>
        <Row>
          <Button variant="primary" leadingIcon={<PlusIcon />}>
            With Icon
          </Button>
          <Button variant="secondary" leadingIcon={<SettingsIcon />}>
            Settings
          </Button>
        </Row>
      </Section>

      <Section label="IconButton">
        <Row>
          <IconButton variant="secondary" icon={<SettingsIcon />} label="Settings" />
          <IconButton variant="secondary" icon={<RefreshIcon />} label="Refresh" />
          <IconButton variant="primary" icon={<PlusIcon />} label="Add" />
          <IconButton variant="secondary" icon={<PlusIcon />} label="Add ghost" />
          <IconButton variant="danger" icon={<TrashIcon />} label="Delete" />
          <IconButton variant="ghost" icon={<SettingsIcon />} label="More" />
          <IconButton variant="secondary" icon={<RefreshIcon />} label="Sync" />
        </Row>
        <Row>
          <IconButton variant="secondary" size="s" icon={<SettingsIcon />} label="Settings small" />
          <IconButton variant="secondary" size="s" icon={<SettingsIcon />} label="Settings small 2" />
          <IconButton variant="secondary" size="s" icon={<SettingsIcon />} label="Settings small 3" />
        </Row>
      </Section>

      <Section label="Badge">
        <Row>
          {BADGE_VARIANTS.map((item) => (
            <Badge key={item.variant} variant={item.variant}>
              {item.label}
            </Badge>
          ))}
        </Row>
        <Row>
          <Badge size="small">Small</Badge>
          <Badge size="medium">Medium</Badge>
          <Badge variant="success" icon={<CheckIcon />}>
            With Icon
          </Badge>
        </Row>
      </Section>

      <Section label="Clickable Badge (Button)">
        <Row>
          {BADGE_VARIANTS.map((item) => (
            <ClickableBadge key={item.variant} variant={item.variant}>
              {item.label}
            </ClickableBadge>
          ))}
        </Row>
        <Row>
          <ClickableBadge variant="info">To-Dos: 2/3</ClickableBadge>
          <ClickableBadge variant="accent">Accent</ClickableBadge>
          <ClickableBadge variant="skill">Skill</ClickableBadge>
          <ClickableBadge variant="ghost">Ghost</ClickableBadge>
        </Row>
      </Section>

      <Section label="StatusDot">
        <Row>
          {STATUS_DOTS.map((item) => (
            <span key={item.state} className="ds-status-item">
              <StatusDot state={item.state} label={item.label} />
              <span className="ds-status-item__label">{item.label}</span>
            </span>
          ))}
        </Row>
      </Section>

      <Section label="SegmentedControl">
        <Row>
          <SegmentedControl<'first' | 'second' | 'third'>
            value={segValue}
            onChange={setSegValue}
            options={[
              { value: 'first', label: 'First' },
              { value: 'second', label: 'Second' },
              { value: 'third', label: 'Third' },
            ]}
            label="Segmented example"
          />
        </Row>
      </Section>

      <Section label="Toggle">
        <Row>
          <span className="ds-toggle-item">
            <Toggle checked={toggleOn} onChange={setToggleOn} label="Enabled toggle" />
            <span className="ds-status-item__label">Enabled</span>
          </span>
          <span className="ds-toggle-item">
            <Toggle checked={toggleDim} onChange={setToggleDim} label="Disabled look toggle" dim />
            <span className="ds-status-item__label">Disabled look</span>
          </span>
          <span className="ds-toggle-item">
            <Toggle checked={false} onChange={() => undefined} label="Disabled toggle" disabled />
            <span className="ds-status-item__label">Disabled</span>
          </span>
        </Row>
      </Section>

      <Section label="TextInput">
        <Row>
          <div className="ds-input-wrap">
            <TextInput
              placeholder="Type something..."
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
            />
          </div>
        </Row>
      </Section>

      <Section label="SearchInput">
        <Row>
          <div className="ds-input-wrap">
            <SearchInput
              placeholder="Search..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
        </Row>
      </Section>
    </div>
  );
};

const PlaceholderTab = ({ label }: { label: string }): JSX.Element => (
  <div className="ds-placeholder">
    <p className="ds-placeholder__title">{label}</p>
    <p className="ds-placeholder__hint">Placeholder — implement in a later pass.</p>
  </div>
);

export const DesignSystem = (): JSX.Element => {
  const [tab, setTab] = useState<PlaygroundTab>('components');

  return (
    <div className="ds-root">
      <aside className="ds-sidebar" aria-hidden="true">
        <span className="ds-sidebar__dot" />
        <span className="ds-sidebar__dot" />
        <span className="ds-sidebar__dot" />
        <span className="ds-sidebar__dot" />
      </aside>

      <main className="ds-main">
        <header className="ds-titlebar">
          <span className="ds-titlebar__crumb">Design System</span>
        </header>

        <nav className="ds-tabs" aria-label="Design system sections">
          {TABS.map((item) => {
            const active = item.value === tab;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                className={`ds-tab${active ? ' ds-tab--active' : ''}`}
                onClick={() => setTab(item.value)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ds-content">
          {tab === 'components' ? <ComponentsTab /> : <PlaceholderTab label={TABS.find((t) => t.value === tab)?.label ?? ''} />}
        </div>
      </main>
    </div>
  );
};
