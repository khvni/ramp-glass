import "./opening.css";

type Props = {
  onEnter: () => void;
};

export function OpeningNarrative({ onEnter }: Props) {
  return (
    <div className="opening">
      <header className="opening__titlebar">
        <div className="opening__lights" aria-hidden>
          <span style={{ background: "var(--tl-red)" }} />
          <span style={{ background: "var(--tl-yellow)" }} />
          <span style={{ background: "var(--tl-green)" }} />
        </div>
        <div className="opening__titlebar-title">Tinker</div>
        <div className="opening__titlebar-right">
          <span className="mono">welcome</span>
        </div>
      </header>

      <main className="opening__body">
        <div className="opening__brand">
          <span className="opening__brand-mark">Tinker</span>
          <span className="caps opening__brand-meta">for Keysight · internal preview</span>
        </div>

        <section className="opening__hero">
          <span className="caps opening__eyebrow">The harness problem</span>
          <h1 className="opening__headline">
            We built every Keysight employee their own{" "}
            <em className="opening__headline-em">AI coworker.</em>
          </h1>
          <p className="opening__lede">
            The models are good enough. The harness isn&rsquo;t. Tinker gives every employee
            company context, built-in tools, and memory — a local-first workspace where work
            gets <em>finished</em>, not just answered.
          </p>
        </section>

        <section className="opening__stat">
          <div className="opening__stat-left">
            <span className="opening__stat-value mono">2,042</span>
            <span className="opening__stat-label">
              of ~20,000 Keysight employees are on Claude Code, Codex, or Copilot today.
            </span>
          </div>
          <div className="opening__stat-right">
            <span className="caps">Not a model problem</span>
            <p>
              Scattered context across Salesforce, Notion, Slack, internal docs. Tools that
              require setup. AI that forgets everything between chats. The model works — the
              harness around it doesn&rsquo;t.
            </p>
          </div>
        </section>

        <section className="opening__pillars">
          <Pillar
            n="01"
            cat="Context"
            heading="All context in one place."
            body="Salesforce, Exa signals, Microsoft Graph, internal wikis, the user’s local vault — one workspace. No copy-paste between tabs."
          />
          <Pillar
            n="02"
            cat="Tools"
            heading="Built-in. No setup."
            body="Enrichment, web research, Graph lookups, memory writes — wired on day one. The user authenticates once; everything is connected."
          />
          <Pillar
            n="03"
            cat="Output"
            heading="Finished work, not just answers."
            body="Enriched spreadsheets, drafted emails, whitespace analyses, prep briefs — delivered ready to send, with every tool call auditable."
          />
        </section>

        <footer className="opening__cta-row">
          <div className="opening__actions">
            <button className="opening__cta-primary" onClick={onEnter}>
              <span>Enter workspace</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="opening__cta-secondary" onClick={onEnter}>
              <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden>
                <path d="M3.5 2.5v8l7-4-7-4z" fill="currentColor" />
              </svg>
              <span>Guided walkthrough · 10 min</span>
            </button>
            <span className="mono opening__hint">⌘&thinsp;+&thinsp;K to jump anywhere</span>
          </div>
          <div className="opening__footer-stamp">
            <span className="caps">Built for · Keysight · Hackathon &rsquo;26</span>
            <span className="mono opening__stamp-fine">
              local-first · vault owned by user · no SSO required for preview
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Pillar({ n, cat, heading, body }: { n: string; cat: string; heading: string; body: string }) {
  return (
    <div className="opening__pillar">
      <span className="caps opening__pillar-num">
        {n} · <span style={{ color: "var(--amber-strong)" }}>{cat}</span>
      </span>
      <h3 className="opening__pillar-heading">{heading}</h3>
      <p className="opening__pillar-body">{body}</p>
    </div>
  );
}
