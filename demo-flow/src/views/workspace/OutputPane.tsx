import type { DemoKey } from "../../seed/types";
import * as demo1 from "../../seed/demo1-whitespace";
import * as demo2 from "../../seed/demo2-enrichment";
import * as demo3 from "../../seed/demo3-meeting";

type Props = { demo: DemoKey; auditOpen: boolean };

export function OutputPane({ demo, auditOpen }: Props) {
  return (
    <section className="pane pane--output" data-audit-open={auditOpen}>
      <header className="pane__header pane__header--output">
        <div className="pane__output-title">
          <span className="caps">Output</span>
          <span className="pane__output-doc mono">
            {demo === "whitespace" && "marvell-whitespace-2026-04-22.md"}
            {demo === "enrichment" && "prospects-enriched-2026-04-22.csv"}
            {demo === "meeting" && "orbion-anika-prep.md  ·  follow-up-draft.md"}
          </span>
        </div>
        <div className="pane__output-actions">
          <button className="pane__action" aria-label="Save to vault">
            save
          </button>
          <button className="pane__action" aria-label="Open in editor">
            open
          </button>
          <button className="pane__action pane__action--primary" aria-label="Send">
            send&nbsp;→
          </button>
        </div>
      </header>
      <div className="pane__body scroll">
        {demo === "whitespace" && <WhitespaceOutput />}
        {demo === "enrichment" && <EnrichmentOutput />}
        {demo === "meeting" && <MeetingOutput />}
      </div>
    </section>
  );
}

function WhitespaceOutput() {
  return (
    <article className="doc">
      <header className="doc__head">
        <h1 className="doc__title">Marvell Technology · Whitespace Analysis</h1>
        <div className="doc__meta mono">
          <span>built · today · 08:42</span>
          <span>·</span>
          <span>5 signals scanned</span>
          <span>·</span>
          <span>confidence · high</span>
        </div>
      </header>

      <section className="doc__section">
        <h2 className="doc__h2">Recent signals — in order</h2>
        <ol className="doc__signals">
          {demo1.signals.map((s, i) => (
            <li key={i}>
              <span className="mono doc__signals-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="doc__signals-headline">{s.headline}</span>
              <span className="mono doc__signals-date">{s.date}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Currently owned</h2>
        <table className="doc__table">
          <thead>
            <tr>
              <th className="caps">Product</th>
              <th className="caps" style={{ textAlign: "right" }}>
                Qty
              </th>
              <th className="caps">Purchased</th>
              <th className="caps">Renewal</th>
            </tr>
          </thead>
          <tbody>
            {demo1.sfdc.owned.map((p, i) => (
              <tr key={i}>
                <td>{p.product.replace(/ ×\d+$/, "")}</td>
                <td className="mono doc__table-num">{p.qty}</td>
                <td className="mono doc__table-num">{p.purchased}</td>
                <td className="mono doc__table-num">{p.renewal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Top 3 Keysight products to lead with</h2>
        {demo1.recommendations.map((r) => (
          <article key={r.code} className="reco">
            <header className="reco__head">
              <span className="mono reco__rank">#{r.rank}</span>
              <div>
                <h3 className="reco__name">{r.name}</h3>
                <span className="reco__code mono">{r.code}</span>
              </div>
              <span className="reco__price mono">{r.listPrice}</span>
            </header>
            <p className="reco__why">{r.why}</p>
            <div className="reco__trigger">
              <span className="caps">Trigger</span>
              <span>{r.trigger}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Outreach angle · to Maya (AE)</h2>
        <blockquote className="doc__quote">
          <p>
            Marvell&rsquo;s N1000A lapsed in November and they&rsquo;re now taping out 1.6T + 800G coherent
            through FY26. The new VP of RF Integration&nbsp;— hired from Broadcom&nbsp;— publicly flagged
            the 200 GBd BERT bottleneck on stage in March. The clean opening is a paired motion:
            <strong> N1092 coherent DCA bundle</strong> (replaces the lapsed mainframe) +
            <strong> M8080A 256 GBd BERT </strong>
            (closes the flagged bottleneck). Lead with the renewal conversation on the N1092; let the
            M8080A ride behind it as the answer to Priya&rsquo;s November demo ask.
          </p>
        </blockquote>
      </section>
    </article>
  );
}

function EnrichmentOutput() {
  const cols: ReadonlyArray<{ key: keyof (typeof demo2.after)[number]; label: string; mono?: boolean }> = [
    { key: "company", label: "Company" },
    { key: "hq", label: "HQ" },
    { key: "employees", label: "Emp.", mono: true },
    { key: "primary", label: "Decision-maker" },
    { key: "title", label: "Title" },
    { key: "email", label: "Email", mono: true },
    { key: "phone", label: "Phone", mono: true },
    { key: "lastActivity", label: "Last activity" },
  ];

  return (
    <article className="doc doc--wide">
      <header className="doc__head">
        <h1 className="doc__title">Prospect Enrichment · 2026-04-22</h1>
        <div className="doc__meta mono">
          <span>8 / 8 rows</span>
          <span>·</span>
          <span>64 cells added</span>
          <span>·</span>
          <span>0 bounces predicted</span>
          <span>·</span>
          <span>written to vault/prospects/2026-04-22.csv</span>
        </div>
      </header>

      <section className="doc__section">
        <div className="doc__compare">
          <div className="doc__compare-side">
            <span className="caps">Before</span>
            <span className="mono">1 column · 8 rows</span>
          </div>
          <div className="doc__compare-arrow mono">
            <span>→ 5 stages · 2m 08s ·</span>
            <span className="doc__compare-arrow-val">8 cols · 64 cells</span>
          </div>
          <div className="doc__compare-side">
            <span className="caps">After</span>
            <span className="mono">8 columns · 8 rows</span>
          </div>
        </div>
      </section>

      <section className="doc__section">
        <div className="doc__table-wrap">
          <table className="doc__table doc__table--dense">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.key} className="caps">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demo2.after.map((r) => (
                <tr key={r.company}>
                  {cols.map((c) => (
                    <td key={c.key} className={c.mono ? "mono" : ""}>
                      {(r[c.key] ?? "—") as string}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Warm first — what to touch today</h2>
        <ul className="doc__warm">
          <li>
            <span className="mono doc__warm-n">01</span>
            <div>
              <strong>NovaCadence</strong> · inbound 4 days ago. Marcus Bell replies to inbound forms. One-line reply today.
            </div>
          </li>
          <li>
            <span className="mono doc__warm-n">02</span>
            <div>
              <strong>Verdant Micro</strong> · opened renewal Feb 2026. Sato Tanaka will read. Propose a call tied to the renewal agenda.
            </div>
          </li>
          <li>
            <span className="mono doc__warm-n">03</span>
            <div>
              <strong>Kairos Optics</strong> · never contacted, founding-engineer target. Emma Linnér will read personally. Lead with optical test.
            </div>
          </li>
        </ul>
      </section>
    </article>
  );
}

function MeetingOutput() {
  const b = demo3.prepBrief;
  return (
    <article className="doc">
      <header className="doc__head">
        <h1 className="doc__title">Prep brief · Orbion Semi · Anika Raskolnikova</h1>
        <div className="doc__meta mono">
          <span>for · today · 11:00 PT</span>
          <span>·</span>
          <span>11 sources</span>
          <span>·</span>
          <span>confidence · high</span>
        </div>
      </header>

      <section className="doc__section">
        <div className="doc__tldr">
          <span className="caps">TL;DR</span>
          <p>{b.tldr}</p>
        </div>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">What we already know</h2>
        <ul className="doc__bullets">
          {b.know.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Questions to ask</h2>
        <ul className="doc__bullets">
          {b.askAbout.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Angle</h2>
        <p className="doc__angle">{b.angle}</p>
      </section>

      <section className="doc__section doc__section--boxed">
        <div className="email">
          <div className="email__head">
            <span className="caps">Draft follow-up email</span>
            <span className="mono email__head-meta">ready to send · edit before ship</span>
          </div>
          <pre className="email__body">{demo3.followUpEmail}</pre>
          <div className="email__attachments">
            <span className="caps">Attachments</span>
            <ul>
              <li className="mono">01 · keysight-lab-ops-sla.pdf · 1.2 MB</li>
              <li className="mono">02 · orbion-ardent-whitespace.pdf · 482 kB</li>
              <li className="mono">03 · poc-terms-2026-04.pdf · 318 kB</li>
            </ul>
          </div>
        </div>
      </section>
    </article>
  );
}
