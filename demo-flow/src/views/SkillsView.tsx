import { useMemo, useState } from "react";
import { SidebarDetailLayout, DetailHeader, SidebarSearch } from "./shared/SidebarDetail";
import { skillCatalog, type Skill } from "../seed/sidebars";
import "./skills.css";

const CATEGORIES: ReadonlyArray<{ key: Skill["category"] | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "research", label: "Research" },
  { key: "data", label: "Data" },
  { key: "analysis", label: "Analysis" },
  { key: "writing", label: "Writing" },
  { key: "integration", label: "Integration" },
];

export function SkillsView() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Skill["category"] | "all">("all");
  const [selectedId, setSelectedId] = useState<string>("sk-3");

  const filtered = useMemo(() => {
    return skillCatalog.filter((s) => {
      const matchCat = cat === "all" || s.category === cat;
      const matchQ = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [query, cat]);

  const selected = skillCatalog.find((s) => s.id === selectedId) ?? skillCatalog[0]!;
  const enabledCount = skillCatalog.filter((s) => s.enabled).length;

  return (
    <SidebarDetailLayout
      sidebarWidth={300}
      sidebar={
        <>
          <SidebarSearch placeholder="Search skills…" value={query} onChange={setQuery} />
          <div className="skills__cats">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className="skills__cat"
                data-active={cat === c.key}
                onClick={() => setCat(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="skills__list scroll">
            <div className="sd__group">
              <span className="sd__group-label">Installed</span>
              <span className="sd__group-count">
                {enabledCount} / {skillCatalog.length}
              </span>
            </div>
            {filtered.map((s) => (
              <button
                key={s.id}
                className="skills__row"
                data-active={selectedId === s.id}
                onClick={() => setSelectedId(s.id)}
              >
                <SkillGlyph category={s.category} />
                <div className="skills__row-body">
                  <div className="skills__row-head">
                    <span className="skills__row-name">{s.name}</span>
                    {s.badge && <BadgeDot badge={s.badge} />}
                  </div>
                  <div className="skills__row-desc">{s.description}</div>
                </div>
                <span className="skills__row-status" data-on={s.enabled} aria-hidden />
              </button>
            ))}
          </div>
        </>
      }
      detail={<SkillDetail skill={selected} />}
    />
  );
}

function SkillDetail({ skill }: { skill: Skill }) {
  return (
    <>
      <DetailHeader
        title={
          <span className="skills__detail-title">
            {skill.name}
            <span className={`status-pill ${skill.enabled ? "status-pill--ok" : "status-pill--paused"}`}>
              <span className="status-pill__dot" />
              {skill.enabled ? "enabled" : "not installed"}
            </span>
          </span>
        }
        subtitle={
          <>
            <span className="caps">{skill.category}</span>
            <span>·</span>
            <span className="mono">{skill.usage}</span>
            <span>·</span>
            <span>maintained by · keysight-west</span>
          </>
        }
        actions={
          skill.enabled ? (
            <>
              <button className="sd-btn sd-btn--ghost">configure</button>
              <button className="sd-btn">pause</button>
            </>
          ) : (
            <>
              <button className="sd-btn sd-btn--ghost">preview</button>
              <button className="sd-btn sd-btn--primary">install</button>
            </>
          )
        }
      />
      <div className="sd-detail-body">
        <section>
          <span className="section-caps">Description</span>
          <p className="skills__desc">{skill.description}</p>
        </section>
        <section>
          <span className="section-caps">Example prompts</span>
          <ul className="skills__prompts">
            {EXAMPLE_PROMPTS[skill.id]?.map((p, i) => (
              <li key={i}>
                <span className="mono skills__prompts-pip">·</span>
                <span>{p}</span>
              </li>
            )) ?? <li>—</li>}
          </ul>
        </section>
        <section>
          <span className="section-caps">Tools used</span>
          <div className="skills__tools">
            {(SKILL_TOOLS[skill.id] ?? []).map((t) => (
              <span key={t} className="skills__tool mono">
                {t}
              </span>
            ))}
          </div>
        </section>
        <section>
          <span className="section-caps">Recent runs</span>
          <table className="doc__table doc__table--dense">
            <thead>
              <tr>
                <th className="caps">When</th>
                <th className="caps">Input</th>
                <th className="caps">Duration</th>
                <th className="caps">Outcome</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono">today · 09:18</td>
                <td>Orbion · Anika prep</td>
                <td className="mono doc__table-num">2m 08s</td>
                <td>shipped follow-up email</td>
              </tr>
              <tr>
                <td className="mono">yesterday · 11:02</td>
                <td>Ciena · RFP prep</td>
                <td className="mono doc__table-num">3m 44s</td>
                <td>brief approved</td>
              </tr>
              <tr>
                <td className="mono">Mon 19 Apr</td>
                <td>Acme · renewal prep</td>
                <td className="mono doc__table-num">1m 52s</td>
                <td>saved to vault</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function SkillGlyph({ category }: { category: Skill["category"] }) {
  const color = {
    research: "var(--amber-ink)",
    data: "var(--ok)",
    analysis: "var(--skill)",
    writing: "var(--ink-muted)",
    integration: "var(--amber-strong)",
  }[category];
  return (
    <span className="skills__glyph" style={{ borderColor: color, color }}>
      {category[0]?.toUpperCase()}
    </span>
  );
}

function BadgeDot({ badge }: { badge: NonNullable<Skill["badge"]> }) {
  const map = {
    popular: { label: "popular", color: "var(--amber)" },
    verified: { label: "verified", color: "var(--ok)" },
    new: { label: "new", color: "var(--skill)" },
  }[badge];
  return (
    <span className="skills__badge" style={{ color: map.color, borderColor: map.color }}>
      {map.label}
    </span>
  );
}

const EXAMPLE_PROMPTS: Record<string, ReadonlyArray<string>> = {
  "sk-1": [
    "Find whitespace on Marvell — 3 products to lead with and why.",
    "What did we miss on Acme? Their last purchase was 18 months ago.",
  ],
  "sk-2": [
    "Enrich this list of 8 companies with HQ, size, decision-maker, email.",
    "Verify emails for all contacts in the Q2 target list.",
  ],
  "sk-3": [
    "I'm meeting Anika at Orbion in 40 minutes — pull everything we know + draft follow-up.",
    "Prep for the Ciena QBR tomorrow — focus on the optical roadmap.",
  ],
  "sk-4": [
    "Which of my 7 open opps are at renewal risk this quarter?",
    "Surface the accounts with usage drops + competitor press in the last 30 days.",
  ],
  "sk-5": [
    "Read the Ciena RFP and draft our response section by section.",
    "Draft the technical-compliance section using our portfolio refs.",
  ],
  "sk-7": [
    "3-year TCO on the Ardent bundle vs R&S equivalent for Orbion.",
    "Scenario: what happens to Acme's TCO if we ship the service bundle?",
  ],
  "sk-8": [
    "What blocked customers in Hsinchu this week? Summarize by severity.",
  ],
};

const SKILL_TOOLS: Record<string, ReadonlyArray<string>> = {
  "sk-1": ["exa.web_search", "salesforce.query", "portfolio.map", "memory.recall"],
  "sk-2": ["zoominfo.find_company", "zoominfo.find_contact", "clay.verify_email", "salesforce.lastActivity", "memory.write"],
  "sk-3": ["msgraph.people.get", "otter.transcript.scan", "memory.search", "salesforce.account.read", "vault.search"],
  "sk-4": ["salesforce.query", "usage.metrics", "exa.web_search", "memory.recall"],
  "sk-5": ["pdf.read", "vault.search", "portfolio.map", "draft.write"],
  "sk-7": ["pricing.lookup", "salesforce.query", "competitive.lookup"],
  "sk-8": ["ticketing.query", "memory.write"],
};
