import type { ReactNode } from "react";
import "./sidebar-detail.css";

type Props = {
  sidebar: ReactNode;
  detail: ReactNode;
  /** width for sidebar; default 280px */
  sidebarWidth?: number;
};

export function SidebarDetailLayout({ sidebar, detail, sidebarWidth = 280 }: Props) {
  return (
    <div className="sd" style={{ gridTemplateColumns: `${sidebarWidth}px minmax(0, 1fr)` }}>
      <aside className="sd__sidebar">{sidebar}</aside>
      <section className="sd__detail">{detail}</section>
    </div>
  );
}

export function DetailTabStrip({
  tabs,
  active,
  onChange,
}: {
  tabs: ReadonlyArray<{ key: string; label: string; dot?: string }>;
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="sd-tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`sd-tab ${active === t.key ? "sd-tab--active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.dot && <span className="sd-tab__dot" style={{ background: t.dot }} />}
          <span className="sd-tab__label">{t.label}</span>
        </button>
      ))}
      <button className="sd-tab sd-tab--new" aria-label="New">
        +
      </button>
    </div>
  );
}

export function DetailHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="sd-detail-head">
      <div className="sd-detail-head__main">
        <h1 className="sd-detail-head__title">{title}</h1>
        {subtitle && <div className="sd-detail-head__sub">{subtitle}</div>}
      </div>
      {actions && <div className="sd-detail-head__actions">{actions}</div>}
    </header>
  );
}

export function SidebarSearch({
  placeholder = "Search…",
  value,
  onChange,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="sd-search">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <circle cx="6" cy="6" r="4.25" fill="none" stroke="currentColor" strokeWidth={1.4} />
        <path d="M9.25 9.25l3 3" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
      </svg>
      <input
        className="sd-search__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <kbd className="mono sd-search__kbd">⌘F</kbd>
    </div>
  );
}
