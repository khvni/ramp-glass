import { useMemo, useState } from "react";
import { SidebarDetailLayout, DetailHeader, SidebarSearch } from "./shared/SidebarDetail";
import { memoryCategories, memoryEntries } from "../seed/sidebars";
import "./memory.css";

export function MemoryView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("people");
  const [selectedId, setSelectedId] = useState<string>("m-1");

  const entriesInCategory = useMemo(() => {
    return memoryEntries.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.body.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [category, query]);

  const selected = memoryEntries.find((e) => e.id === selectedId) ?? entriesInCategory[0] ?? memoryEntries[0]!;

  const total = memoryCategories.reduce((s, c) => s + c.count, 0);

  return (
    <SidebarDetailLayout
      sidebarWidth={284}
      sidebar={
        <>
          <SidebarSearch placeholder="Search memory…" value={query} onChange={setQuery} />
          <div className="mem__pending">
            <span className="mem__pending-dot" />
            <span className="mem__pending-label">Pending review</span>
            <span className="mono mem__pending-n">3</span>
          </div>
          <div className="mem__cats scroll">
            <div className="sd__group">
              <span className="sd__group-label">Categories</span>
              <span className="sd__group-count">{total}</span>
            </div>
            {memoryCategories.map((c) => (
              <button
                key={c.id}
                className="mem__cat"
                data-active={category === c.id}
                onClick={() => setCategory(c.id)}
              >
                <CatGlyph icon={c.icon} />
                <span className="mem__cat-name">{c.name}</span>
                <span className="mono mem__cat-n">{c.count}</span>
              </button>
            ))}
          </div>
        </>
      }
      detail={
        <>
          <div className="mem__split">
            <aside className="mem__entries">
              <div className="mem__entries-head">
                <span className="caps">
                  {memoryCategories.find((c) => c.id === category)?.name ?? "All"}
                </span>
                <span className="mono mem__entries-count">{entriesInCategory.length}</span>
              </div>
              <div className="mem__entries-list scroll">
                {entriesInCategory.map((e) => (
                  <button
                    key={e.id}
                    className="mem__entry-row"
                    data-active={selectedId === e.id}
                    onClick={() => setSelectedId(e.id)}
                  >
                    <div className="mem__entry-row-title">{e.title}</div>
                    <div className="mem__entry-row-sub">{e.subtitle}</div>
                    <div className="mono mem__entry-row-when">{e.when}</div>
                  </button>
                ))}
              </div>
            </aside>
            <section className="mem__reader">
              {selected && (
                <>
                  <DetailHeader
                    title={selected.title}
                    subtitle={
                      <>
                        <span className="caps">{selected.category}</span>
                        <span>·</span>
                        <span>{selected.subtitle}</span>
                      </>
                    }
                    actions={
                      <>
                        <button className="sd-btn sd-btn--ghost">forget</button>
                        <button className="sd-btn">edit</button>
                        <button className="sd-btn sd-btn--primary">link</button>
                      </>
                    }
                  />
                  <div className="sd-detail-body">
                    <section>
                      <span className="section-caps">Body</span>
                      <p className="mem__body">{selected.body}</p>
                    </section>
                    <section>
                      <span className="section-caps">Sources</span>
                      <p className="mem__source mono">{selected.source}</p>
                    </section>
                    <section>
                      <span className="section-caps">Tags</span>
                      <div className="mem__tags">
                        {selected.tags.map((t) => (
                          <span key={t} className="mem__tag mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section>
                      <span className="section-caps">Cross-references</span>
                      <ul className="mem__refs">
                        <li>
                          <span className="mono mem__refs-pip">·</span>
                          <span>
                            <strong>chats/</strong> Orbion · Anika prep + follow-up
                          </span>
                        </li>
                        <li>
                          <span className="mono mem__refs-pip">·</span>
                          <span>
                            <strong>vault/</strong> accounts/orbion-semi/prep-brief-2026-04-22.md
                          </span>
                        </li>
                        <li>
                          <span className="mono mem__refs-pip">·</span>
                          <span>
                            <strong>connections/</strong> Salesforce · opp #OPP-8143
                          </span>
                        </li>
                      </ul>
                    </section>
                  </div>
                </>
              )}
            </section>
          </div>
        </>
      }
    />
  );
}

function CatGlyph({ icon }: { icon: (typeof memoryCategories)[number]["icon"] }) {
  const map = {
    people: { color: "var(--amber-ink)", letter: "P" },
    accounts: { color: "var(--ok)", letter: "A" },
    capabilities: { color: "var(--skill)", letter: "C" },
    preferences: { color: "var(--amber-strong)", letter: "P" },
    org: { color: "var(--ink-muted)", letter: "O" },
    work: { color: "var(--err)", letter: "W" },
  }[icon];
  return (
    <span className="mem__cat-glyph" style={{ color: map.color, borderColor: map.color }}>
      {map.letter}
    </span>
  );
}
