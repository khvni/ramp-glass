import { PaneLeftIcon, PaneRightIcon } from "./icons";

type Props = {
  /** short crumb shown at the top right — e.g. current view or session. */
  crumb?: string;
};

export function TitleBar({ crumb }: Props) {
  return (
    <header className="titlebar">
      <div className="titlebar__lights" aria-hidden>
        <span className="titlebar__light" style={{ background: "var(--tl-red)" }} />
        <span className="titlebar__light" style={{ background: "var(--tl-yellow)" }} />
        <span className="titlebar__light" style={{ background: "var(--tl-green)" }} />
      </div>
      <div className="titlebar__title">Tinker</div>
      <div className="titlebar__right">
        {crumb && <span className="titlebar__crumb">{crumb}</span>}
        <button aria-label="Toggle left pane" style={{ color: "var(--ink-faint)", display: "grid", placeItems: "center", padding: 2 }}>
          <PaneLeftIcon style={{ width: 15, height: 15 }} />
        </button>
        <button aria-label="Toggle right pane" style={{ color: "var(--ink-faint)", display: "grid", placeItems: "center", padding: 2 }}>
          <PaneRightIcon style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </header>
  );
}
