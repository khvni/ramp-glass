import type { DemoKey } from "../../seed/types";
import * as demo1 from "../../seed/demo1-whitespace";
import * as demo2 from "../../seed/demo2-enrichment";
import * as demo3 from "../../seed/demo3-meeting";

type Props = { demo: DemoKey };

export function ChatPane({ demo }: Props) {
  const transcript =
    demo === "whitespace" ? demo1.transcript : demo === "enrichment" ? demo2.transcript : demo3.transcript;
  const promptSuggestion = PROMPTS[demo];

  return (
    <section className="pane pane--chat">
      <header className="pane__header pane__header--chat">
        <span className="caps">Conversation</span>
        <span className="chat__header-ctx mono">
          <span className="chat__header-dot" /> running · session #4821 · 6m 12s
        </span>
      </header>
      <div className="chat__body scroll">
        <div className="chat__stream">
          {transcript.map((t, i) => {
            if (t.kind === "user") {
              return (
                <div key={i} className="turn turn--user">
                  <div className="turn__meta">
                    <span className="turn__avatar chat__avatar-k">K</span>
                    <span className="turn__who">You · Khani</span>
                    <span className="mono turn__when">now</span>
                  </div>
                  <p className="turn__text">{t.text}</p>
                </div>
              );
            }
            if (t.kind === "assistant-thinking") {
              return (
                <div key={i} className="turn turn--thinking">
                  <span className="turn__thinking-dot" />
                  <span>{t.note}</span>
                </div>
              );
            }
            return (
              <div key={i} className="turn turn--assist">
                <div className="turn__meta">
                  <span className="turn__avatar chat__avatar-t" aria-hidden>
                    ✦
                  </span>
                  <span className="turn__who">Tinker</span>
                  {t.toolCalls && (
                    <span className="mono turn__tools">
                      <span className="turn__tools-dot" /> {t.toolCalls.length} tool call{t.toolCalls.length > 1 ? "s" : ""} · see audit
                    </span>
                  )}
                </div>
                <div className="turn__text">
                  {t.text.split("\n\n").map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
                {t.toolCalls && <InlineCallStrip calls={t.toolCalls} />}
              </div>
            );
          })}
        </div>
      </div>
      <div className="chat__footer">
        <div className="chat__status-dock">
          <div className="chip">
            <span className="chip__icon" aria-hidden />
            <span>Context</span>
            <span className="chip__sep" />
            <span className="mono">{CTX_PCT[demo]}%</span>
          </div>
          <div className="chat__status-spacer" />
          <span className="chat__run-dot" aria-label="Session running" />
          <button className="chat__kebab" aria-label="More">
            <span /> <span /> <span />
          </button>
        </div>
        <div className="composer">
          <textarea
            className="composer__input"
            placeholder={promptSuggestion}
            rows={1}
            defaultValue=""
          />
          <div className="composer__controls">
            <button className="composer__plus" aria-label="Attach">
              +
            </button>
            <div className="composer__spacer" />
            <button className="composer__send" aria-label="Send">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 10V2M2.5 5.5L6 2l3.5 3.5"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="chat__bottom-controls">
          <button className="chip chip--accent">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M6 1l-3 6h2.5L5 11l4-6H6.5L7 1z" fill="currentColor" />
            </svg>
            <span>Auto Accept</span>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M2 3.75l3 3 3-3" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <button className="chip">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <circle cx="6" cy="6" r="4.25" fill="none" stroke="currentColor" strokeWidth={1.2} />
              <circle cx="6" cy="6" r="1.5" fill="none" stroke="currentColor" strokeWidth={1.2} />
            </svg>
            <span>Default</span>
            <span className="chip__sep" />
            <span className="chip__strong">Opus 4.6</span>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M2 3.75l3 3 3-3" stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <div className="chat__bottom-spacer" />
          <button className="chip">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M1.5 3.5c0-.55.45-1 1-1h2l1 1h5c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1h-8c-.55 0-1-.45-1-1v-5z"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.3}
              />
            </svg>
            <span>keysight-west / accounts</span>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M2 6l3-3 3 3" stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function InlineCallStrip({ calls }: { calls: ReadonlyArray<{ name: string; durationMs: number }> }) {
  return (
    <div className="turn__strip">
      {calls.map((c, i) => (
        <span key={i} className="turn__strip-chip">
          <span className="mono turn__strip-name">{c.name}</span>
          <span className="mono turn__strip-ms">{c.durationMs}ms</span>
        </span>
      ))}
    </div>
  );
}

const PROMPTS: Record<DemoKey, string> = {
  whitespace: "Reply…  (try: 'Draft an outreach email to the new Broadcom VP')",
  enrichment: "Reply…  (try: 'Which of the 8 companies is warmest to a new POC?')",
  meeting: "Reply…  (try: 'Rewrite the follow-up email in a shorter, more urgent voice')",
};

const CTX_PCT: Record<DemoKey, number> = {
  whitespace: 4,
  enrichment: 3,
  meeting: 6,
};
