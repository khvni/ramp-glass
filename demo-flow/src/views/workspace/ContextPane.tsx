import type { DemoKey } from "../../seed/types";
import * as demo1 from "../../seed/demo1-whitespace";
import * as demo2 from "../../seed/demo2-enrichment";
import * as demo3 from "../../seed/demo3-meeting";

type Props = { demo: DemoKey };

export function ContextPane({ demo }: Props) {
  return (
    <aside className="pane pane--context">
      <header className="pane__header">
        <span className="caps">Context</span>
        <span className="pane__header-hint mono">read-only</span>
      </header>
      <div className="pane__body scroll">
        {demo === "whitespace" && <WhitespaceContext />}
        {demo === "enrichment" && <EnrichmentContext />}
        {demo === "meeting" && <MeetingContext />}
      </div>
    </aside>
  );
}

function WhitespaceContext() {
  return (
    <>
      <Section label="Account">
        <div className="ctx-account">
          <h3>{demo1.account.name}</h3>
          <p className="ctx-sub">{demo1.account.sector}</p>
          <dl className="ctx-defs mono">
            <div>
              <dt>HQ</dt>
              <dd>{demo1.account.hq}</dd>
            </div>
            <div>
              <dt>Employees</dt>
              <dd>{demo1.account.employees}</dd>
            </div>
            <div>
              <dt>Fiscal</dt>
              <dd>{demo1.account.fiscalYear}</dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section label="Public signals · Exa" count={demo1.signals.length}>
        <ul className="signal-list">
          {demo1.signals.map((s, i) => (
            <li key={i} className="signal">
              <span className={`signal__kind signal__kind--${s.kind}`}>{s.kind}</span>
              <div className="signal__body">
                <div className="signal__head">{s.headline}</div>
                <div className="signal__meta mono">
                  <span>{s.date}</span>
                  <span className="signal__source">· {s.source}</span>
                </div>
                <div className="signal__note">{s.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Salesforce snapshot">
        <div className="sfdc">
          <div className="sfdc__row">
            <span className="caps">Tier</span>
            <span>{demo1.sfdc.tier}</span>
          </div>
          <div className="sfdc__row">
            <span className="caps">Owner</span>
            <span>{demo1.sfdc.owner}</span>
          </div>
          <div className="sfdc__row">
            <span className="caps">Open ARR</span>
            <span className="mono">{demo1.sfdc.openArr}</span>
          </div>
          <div className="sfdc__row">
            <span className="caps">Last</span>
            <span>{demo1.sfdc.lastActivity}</span>
          </div>
          <div className="sfdc__split" />
          <div className="sfdc__owned">
            <span className="caps">Currently owned</span>
            <ul>
              {demo1.sfdc.owned.map((p, i) => (
                <li key={i}>
                  <span className="sfdc__owned-prod">{p.product}</span>
                  <span className="mono sfdc__owned-meta">
                    purchased {p.purchased} · renewal {p.renewal}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sfdc__split" />
          <div className="sfdc__owned">
            <span className="caps">Key contacts</span>
            <ul>
              {demo1.sfdc.contacts.map((c, i) => (
                <li key={i}>
                  <span className="sfdc__owned-prod">{c.name}</span>
                  <span className="sfdc__owned-meta">{c.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section label="Keysight portfolio · cross-reference">
        <ul className="portfolio">
          {demo1.portfolio.map((p) => (
            <li key={p.code}>
              <div className="portfolio__head">
                <span className="mono portfolio__code">{p.code}</span>
                <span className="caps portfolio__family">{p.family}</span>
              </div>
              <div className="portfolio__name">{p.name}</div>
              <div className="portfolio__blurb">{p.blurb}</div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function EnrichmentContext() {
  return (
    <>
      <Section label="Input list · prospects.csv">
        <div className="ctx-input">
          <div className="ctx-input__meta mono">
            <span>8 rows</span>
            <span>·</span>
            <span>1 column</span>
            <span>·</span>
            <span>added · 2026-04-22 · 09:57</span>
          </div>
          <ul className="ctx-input__rows">
            {demo2.before.map((r) => (
              <li key={r.company} className="ctx-input__row">
                <span className="mono ctx-input__n">{(demo2.before.indexOf(r) + 1).toString().padStart(2, "0")}</span>
                <span>{r.company}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section label="Enrichment plan · 5 stages">
        <ol className="plan">
          {demo2.enrichmentStages.map((s, i) => (
            <li key={i} className="plan__step">
              <span className="mono plan__n">{String(i + 1).padStart(2, "0")}</span>
              <div className="plan__body">
                <div className="plan__head">{s.label}</div>
                <div className="mono plan__args">{s.name}</div>
                <div className="plan__hint">{s.args}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section label="Target fields">
        <ul className="fields">
          {["HQ", "Employees", "Primary decision-maker", "Title", "Verified email", "Phone", "Last activity"].map((f) => (
            <li key={f} className="fields__item">
              <span className="fields__dot" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function MeetingContext() {
  return (
    <>
      <Section label="Attendee">
        <div className="contact">
          <div className="contact__avatar">AR</div>
          <div className="contact__body">
            <h3 className="contact__name">{demo3.contact.name}</h3>
            <p className="contact__title">{demo3.contact.title}</p>
            <p className="contact__company">{demo3.contact.company}</p>
            <p className="mono contact__email">{demo3.contact.email}</p>
          </div>
        </div>
        <p className="contact__bio">{demo3.contact.bio}</p>
        <div className="contact__projects">
          <span className="caps">Notable work</span>
          <ul>
            {demo3.contact.notableProjects.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section label="Memory · Orbion + Anika" count={demo3.memory.length}>
        <ul className="memory-list">
          {demo3.memory.map((m, i) => (
            <li key={i} className="memory-item">
              <span className={`memory-item__kind memory-item__kind--${m.kind.replace(/-/g, "_")}`}>{m.kind.replace("-", " ")}</span>
              <div className="memory-item__body">
                <div className="memory-item__head">{m.title}</div>
                <div className="mono memory-item__when">{m.when}</div>
                <div className="memory-item__text">{m.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Transcript · last call">
        <pre className="transcript">{demo3.transcriptExcerpt}</pre>
      </Section>
    </>
  );
}

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="ctx-section">
      <div className="ctx-section__head">
        <span className="caps">{label}</span>
        {count != null && <span className="mono ctx-section__count">{count}</span>}
      </div>
      <div className="ctx-section__body">{children}</div>
    </section>
  );
}
