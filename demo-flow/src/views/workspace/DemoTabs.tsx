import type { DemoKey } from "../../seed/types";

type Tab = { key: DemoKey; label: string; crumb: string };

const TABS: ReadonlyArray<Tab> = [
  { key: "whitespace", label: "Marvell · Whitespace", crumb: "Demo 1" },
  { key: "enrichment", label: "Enrich 8-company list", crumb: "Demo 2" },
  { key: "meeting", label: "Orbion · Anika prep", crumb: "Demo 3" },
];

type Props = {
  active: DemoKey;
  onChange: (key: DemoKey) => void;
  auditOpen: boolean;
  onToggleAudit: () => void;
};

export function DemoTabs({ active, onChange, auditOpen, onToggleAudit }: Props) {
  return (
    <div className="ws-tabs" role="tablist">
      {TABS.map((t, i) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            className={`ws-tab ${isActive ? "ws-tab--active" : ""}`}
            onClick={() => onChange(t.key)}
          >
            <span className="ws-tab__crumb mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="ws-tab__label">{t.label}</span>
          </button>
        );
      })}
      <div className="ws-tabs__spacer" />
      <button
        className={`ws-tab-audit ${auditOpen ? "ws-tab-audit--on" : ""}`}
        onClick={onToggleAudit}
        aria-pressed={auditOpen}
        aria-label="Toggle tool-call audit"
        title="Show / hide tool-call audit (⌘ J)"
      >
        <span className="ws-tab-audit__dot" aria-hidden />
        <span className="mono">audit</span>
      </button>
    </div>
  );
}
