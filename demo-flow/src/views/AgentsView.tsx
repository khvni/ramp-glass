import { useMemo, useState } from "react";
import { SidebarDetailLayout, DetailHeader, SidebarSearch } from "./shared/SidebarDetail";
import { agentList, type Agent } from "../seed/sidebars";
import "./agents.css";

const GROUPS: ReadonlyArray<{ kind: Agent["kind"]; label: string }> = [
  { kind: "assistant", label: "Assistants" },
  { kind: "automation", label: "Automations" },
  { kind: "scheduled", label: "Scheduled" },
];

export function AgentsView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("a-2");

  const filtered = useMemo(() => {
    if (!query) return agentList;
    const q = query.toLowerCase();
    return agentList.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }, [query]);

  const selected = agentList.find((a) => a.id === selectedId) ?? agentList[0]!;

  return (
    <SidebarDetailLayout
      sidebarWidth={296}
      sidebar={
        <>
          <SidebarSearch placeholder="Search agents…" value={query} onChange={setQuery} />
          <div className="agents__list scroll">
            {GROUPS.map((g) => {
              const rows = filtered.filter((a) => a.kind === g.kind);
              if (rows.length === 0) return null;
              return (
                <div key={g.kind}>
                  <div className="sd__group">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="sd__group-caret" aria-hidden>
                      <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth={1.4} />
                    </svg>
                    <span className="sd__group-label">{g.label}</span>
                    <span className="sd__group-count">{rows.length}</span>
                  </div>
                  {rows.map((a) => (
                    <button
                      key={a.id}
                      className="agents__row"
                      data-active={selectedId === a.id}
                      onClick={() => setSelectedId(a.id)}
                    >
                      <AgentGlyph kind={a.kind} />
                      <div className="agents__row-body">
                        <div className="agents__row-name">{a.name}</div>
                        <div className="agents__row-desc">{a.description}</div>
                      </div>
                      <StatusDot status={a.status} />
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      }
      detail={<AgentDetail agent={selected} />}
    />
  );
}

function AgentDetail({ agent }: { agent: Agent }) {
  return (
    <>
      <DetailHeader
        title={
          <span className="agents__detail-title">
            {agent.name}
            <StatusPill status={agent.status} />
          </span>
        }
        subtitle={
          <>
            <span className="caps">{agent.kind}</span>
            {agent.schedule && (
              <>
                <span>·</span>
                <span className="mono">{agent.schedule}</span>
              </>
            )}
            {agent.lastRun && (
              <>
                <span>·</span>
                <span>last · {agent.lastRun}</span>
              </>
            )}
          </>
        }
        actions={
          agent.status === "active" ? (
            <>
              <button className="sd-btn sd-btn--ghost">logs</button>
              <button className="sd-btn">pause</button>
              <button className="sd-btn sd-btn--primary">run now</button>
            </>
          ) : agent.status === "paused" ? (
            <>
              <button className="sd-btn sd-btn--ghost">logs</button>
              <button className="sd-btn sd-btn--primary">resume</button>
            </>
          ) : (
            <>
              <button className="sd-btn">discard</button>
              <button className="sd-btn sd-btn--primary">publish</button>
            </>
          )
        }
      />
      <div className="sd-detail-body">
        <section>
          <span className="section-caps">Description</span>
          <p className="agents__desc">{agent.description}</p>
        </section>

        <section>
          <span className="section-caps">Configuration</span>
          <dl className="key-val">
            <dt>Schedule</dt>
            <dd>{agent.schedule ?? "on demand"}</dd>
            <dt>Channels</dt>
            <dd className="mono">{agent.channels?.join("  ·  ") ?? "—"}</dd>
            <dt>Skills attached</dt>
            <dd className="mono">{agent.skills?.join("  ·  ") ?? "—"}</dd>
            <dt>Owner</dt>
            <dd>Maya Okafor · AE Enterprise West</dd>
          </dl>
        </section>

        <section>
          <span className="section-caps">Recent runs</span>
          <table className="doc__table doc__table--dense">
            <thead>
              <tr>
                <th className="caps">Started</th>
                <th className="caps">Trigger</th>
                <th className="caps">Duration</th>
                <th className="caps">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {RUNS[agent.id]?.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.when}</td>
                  <td>{r.trigger}</td>
                  <td className="mono doc__table-num">{r.duration}</td>
                  <td>{r.outcome}</td>
                </tr>
              )) ?? (
                <tr>
                  <td colSpan={4} style={{ color: "var(--ink-faint)" }}>
                    No runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function AgentGlyph({ kind }: { kind: Agent["kind"] }) {
  if (kind === "assistant") {
    return (
      <span className="agents__glyph agents__glyph--assist">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M7 1.5l1.3 3.5 3.5 1.3-3.5 1.3L7 11l-1.3-3.4-3.5-1.3 3.5-1.3L7 1.5z" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (kind === "scheduled") {
    return (
      <span className="agents__glyph agents__glyph--sched">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" strokeWidth={1.3} />
          <path d="M7 3.5V7l2.2 1.3" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="agents__glyph agents__glyph--auto">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <path d="M2 7l3 3 7-7" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function StatusDot({ status }: { status: Agent["status"] }) {
  return <span className={`agents__dot agents__dot--${status}`} aria-hidden />;
}

function StatusPill({ status }: { status: Agent["status"] }) {
  const map = {
    active: { cls: "status-pill--ok", label: "active" },
    paused: { cls: "status-pill--paused", label: "paused" },
    drafting: { cls: "status-pill--draft", label: "drafting" },
  }[status];
  return (
    <span className={`status-pill ${map.cls}`}>
      <span className="status-pill__dot" />
      {map.label}
    </span>
  );
}

const RUNS: Record<string, ReadonlyArray<{ when: string; trigger: string; duration: string; outcome: string }>> = {
  "a-1": [
    { when: "now", trigger: "on demand · Khani", duration: "—", outcome: "in session" },
    { when: "today · 10:04", trigger: "on demand · Khani", duration: "2m 08s", outcome: "enrichment shipped" },
    { when: "today · 09:18", trigger: "on demand · Khani", duration: "2m 12s", outcome: "meeting prep shipped" },
  ],
  "a-2": [
    { when: "today · 07:00 PT", trigger: "schedule · daily", duration: "4m 12s", outcome: "5 briefs · posted" },
    { when: "Mon 19 Apr · 07:00", trigger: "schedule · daily", duration: "4m 03s", outcome: "5 briefs · posted" },
    { when: "Fri 16 Apr · 07:00", trigger: "schedule · daily", duration: "3m 58s", outcome: "5 briefs · posted" },
  ],
  "a-3": [
    { when: "today · 09:22", trigger: "/inbound · NovaCadence", duration: "18s", outcome: "routed → Maya + draft" },
    { when: "today · 08:41", trigger: "/inbound · Halcyon Networks", duration: "22s", outcome: "routed → Maya + draft" },
    { when: "yesterday · 16:12", trigger: "/inbound · 3 leads", duration: "44s", outcome: "3 routes · 2 drafts" },
  ],
  "a-4": [
    { when: "yesterday · 16:41", trigger: "/qbr Marvell", duration: "2m 38s", outcome: "deck → drafts/qbr-marvell-feb.pptx" },
    { when: "Thu 15 Apr · 14:09", trigger: "/qbr Ciena", duration: "2m 54s", outcome: "deck drafted" },
  ],
  "a-5": [
    { when: "Fri 19 Apr · 16:00", trigger: "schedule · weekly", duration: "1m 47s", outcome: "digest → #asia-se-ops" },
    { when: "Fri 12 Apr · 16:00", trigger: "schedule · weekly", duration: "1m 52s", outcome: "digest → #asia-se-ops" },
  ],
  "a-6": [
    { when: "11 Apr · 06:30", trigger: "schedule · daily", duration: "3m 05s", outcome: "2 at risk · flagged" },
    { when: "10 Apr · 06:30", trigger: "schedule · daily", duration: "3m 12s", outcome: "1 at risk · flagged" },
  ],
  "a-7": [],
};
