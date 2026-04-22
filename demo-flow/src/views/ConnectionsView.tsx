import { useMemo, useState } from "react";
import { SidebarDetailLayout, DetailHeader, SidebarSearch } from "./shared/SidebarDetail";
import { connections, type Connection } from "../seed/sidebars";
import "./connections.css";

export function ConnectionsView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("conn-2");

  const filtered = useMemo(() => {
    if (!query) return connections;
    const q = query.toLowerCase();
    return connections.filter(
      (c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [query]);

  const selected = connections.find((c) => c.id === selectedId) ?? connections[0]!;

  const counts = useMemo(() => {
    const healthy = connections.filter((c) => c.status !== "attention").length;
    const total = connections.length;
    return { healthy, total };
  }, []);

  return (
    <SidebarDetailLayout
      sidebarWidth={300}
      sidebar={
        <>
          <SidebarSearch placeholder="Search connections…" value={query} onChange={setQuery} />
          <div className="conn__status-strip">
            <span className="caps">Health</span>
            <div className="conn__status-val mono">
              <span className="conn__status-dot" /> {counts.healthy} / {counts.total} connected
            </div>
          </div>
          <div className="conn__list scroll">
            {filtered.map((c) => (
              <button
                key={c.id}
                className="conn__row"
                data-active={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              >
                <ConnGlyph category={c.category} />
                <div className="conn__row-body">
                  <div className="conn__row-name">{c.name}</div>
                  <div className="conn__row-meta mono">{c.lastSync}</div>
                </div>
                <ConnStatus status={c.status} />
              </button>
            ))}
            <button className="conn__row conn__row--add">
              <span className="conn__add-glyph">+</span>
              <span className="conn__row-name">Add connection…</span>
            </button>
          </div>
        </>
      }
      detail={<ConnectionDetail conn={selected} />}
    />
  );
}

function ConnectionDetail({ conn }: { conn: Connection }) {
  return (
    <>
      <DetailHeader
        title={
          <span className="conn__detail-title">
            {conn.name}
            <StatusPill status={conn.status} />
          </span>
        }
        subtitle={
          <>
            <span className="caps">{conn.category}</span>
            <span>·</span>
            <span className="mono">{conn.account}</span>
            <span>·</span>
            <span>last sync · {conn.lastSync}</span>
          </>
        }
        actions={
          conn.status === "attention" ? (
            <>
              <button className="sd-btn sd-btn--ghost">logs</button>
              <button className="sd-btn sd-btn--primary">re-authenticate</button>
            </>
          ) : (
            <>
              <button className="sd-btn sd-btn--ghost">logs</button>
              <button className="sd-btn">disconnect</button>
              <button className="sd-btn">test</button>
            </>
          )
        }
      />
      <div className="sd-detail-body">
        {conn.note && (
          <div className="conn__note">
            <span className="caps">Attention</span>
            <p>{conn.note}</p>
          </div>
        )}
        <section>
          <span className="section-caps">Scope</span>
          <p className="conn__scope">{conn.scope}</p>
        </section>
        <section>
          <span className="section-caps">Usage · last 7 days</span>
          <UsageChart conn={conn} />
        </section>
        <section>
          <span className="section-caps">Recent calls</span>
          <table className="doc__table doc__table--dense">
            <thead>
              <tr>
                <th className="caps">When</th>
                <th className="caps">Operation</th>
                <th className="caps">Caller</th>
                <th className="caps">Result</th>
              </tr>
            </thead>
            <tbody>
              {(SAMPLE_CALLS[conn.id] ?? SAMPLE_CALLS.default ?? []).map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.when}</td>
                  <td className="mono">{r.op}</td>
                  <td>{r.caller}</td>
                  <td style={{ color: r.result.startsWith("✓") ? "var(--ok)" : "var(--ink)" }}>{r.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function ConnGlyph({ category }: { category: Connection["category"] }) {
  const map = {
    data: { color: "var(--ok)", letter: "D" },
    crm: { color: "var(--amber-ink)", letter: "C" },
    email: { color: "var(--skill)", letter: "M" },
    calendar: { color: "var(--amber-strong)", letter: "C" },
    identity: { color: "var(--ink)", letter: "I" },
    docs: { color: "var(--ink-muted)", letter: "D" },
    chat: { color: "var(--err)", letter: "T" },
    search: { color: "var(--amber)", letter: "S" },
  } as const;
  const m = map[category];
  return (
    <span className="conn__glyph" style={{ color: m.color, borderColor: m.color }}>
      {m.letter}
    </span>
  );
}

function ConnStatus({ status }: { status: Connection["status"] }) {
  const color =
    status === "connected" ? "var(--ok)" : status === "healthy" ? "var(--ok)" : "var(--warn)";
  return (
    <span
      className="conn__status-dot-sm"
      style={{ background: color, boxShadow: status === "connected" ? "0 0 0 2px rgba(34,163,85,0.18)" : undefined }}
      aria-hidden
    />
  );
}

function StatusPill({ status }: { status: Connection["status"] }) {
  if (status === "attention") {
    return (
      <span className="status-pill status-pill--warn">
        <span className="status-pill__dot" />
        needs reauth
      </span>
    );
  }
  return (
    <span className="status-pill status-pill--ok">
      <span className="status-pill__dot" />
      healthy
    </span>
  );
}

function UsageChart({ conn }: { conn: Connection }) {
  const bars = USAGE_SERIES[conn.id] ?? [6, 12, 9, 22, 18, 14, 27];
  const max = Math.max(...bars);
  return (
    <div className="conn__chart">
      {bars.map((v, i) => (
        <div key={i} className="conn__chart-col">
          <div
            className="conn__chart-bar"
            style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            title={`${v} calls`}
          />
          <span className="mono conn__chart-label">{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

const DAYS = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];

const USAGE_SERIES: Record<string, ReadonlyArray<number>> = {
  "conn-1": [42, 61, 38, 14, 3, 71, 88],
  "conn-2": [120, 135, 108, 42, 22, 166, 202],
  "conn-4": [18, 26, 14, 6, 1, 32, 40],
  "conn-5": [7, 18, 9, 2, 1, 22, 31],
};

const SAMPLE_CALLS: Record<string, ReadonlyArray<{ when: string; op: string; caller: string; result: string }>> = {
  default: [
    { when: "11:21", op: "read", caller: "Maya · AE copilot", result: "✓ ok" },
    { when: "11:18", op: "search", caller: "Morning whitespace", result: "✓ ok" },
    { when: "10:57", op: "write", caller: "Pre-meeting brief", result: "✓ ok" },
  ],
  "conn-1": [
    { when: "11:21", op: "SOQL · Account read", caller: "Whitespace · Marvell", result: "✓ 12 assets" },
    { when: "10:58", op: "SOQL · Activity join", caller: "Enrichment · 8 rows", result: "✓ 8 rows" },
    { when: "09:21", op: "SOQL · Open opp", caller: "Pre-meeting · Orbion", result: "✓ 1 opp" },
  ],
  "conn-2": [
    { when: "11:20", op: "people.get", caller: "Pre-meeting · Orbion", result: "✓ profile + 14 reports" },
    { when: "11:19", op: "calendar.list", caller: "Maya · AE copilot", result: "✓ 7 events" },
    { when: "09:18", op: "org.manager", caller: "Pre-meeting · Orbion", result: "✓ Yusuf Ibrahim" },
  ],
  "conn-8": [
    { when: "yesterday · 23:14", op: "files.list", caller: "Morning whitespace", result: "401 · token rotated" },
  ],
};
