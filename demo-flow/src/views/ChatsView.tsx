import { useMemo, useState } from "react";
import { SidebarDetailLayout, DetailHeader, SidebarSearch } from "./shared/SidebarDetail";
import { chatList } from "../seed/sidebars";
import * as d1 from "../seed/demo1-whitespace";
import * as d2 from "../seed/demo2-enrichment";
import * as d3 from "../seed/demo3-meeting";
import type { ChatTurn } from "../seed/types";
import "./chats.css";

const TRANSCRIPTS: Record<string, ReadonlyArray<ChatTurn>> = {
  "c-1": d1.transcript,
  "c-2": d2.transcript,
  "c-3": d3.transcript,
};

export function ChatsView() {
  const [selected, setSelected] = useState<string>("c-3");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return chatList;
    const q = query.toLowerCase();
    return chatList.filter(
      (c) => c.title.toLowerCase().includes(q) || c.snippet.toLowerCase().includes(q)
    );
  }, [query]);

  const chat = chatList.find((c) => c.id === selected) ?? chatList[0]!;
  const turns = TRANSCRIPTS[chat.id];

  return (
    <SidebarDetailLayout
      sidebarWidth={320}
      sidebar={
        <>
          <SidebarSearch placeholder="Search conversations…" value={query} onChange={setQuery} />
          <div className="chats__list scroll">
            {filtered.map((c) => (
              <button
                key={c.id}
                className="chats__row"
                data-active={selected === c.id}
                onClick={() => setSelected(c.id)}
              >
                <div className="chats__row-head">
                  <span className="chats__row-title">{c.title}</span>
                  {c.unread && <span className="chats__row-dot" aria-hidden />}
                </div>
                <div className="chats__row-snippet">{c.snippet}</div>
                <div className="chats__row-meta">
                  <span className="mono chats__row-when">{c.when}</span>
                  {c.tags?.map((t) => (
                    <span key={t} className="chats__row-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </>
      }
      detail={
        <>
          <DetailHeader
            title={chat.title}
            subtitle={
              <>
                <span className="mono">session · {chat.id.replace("c-", "#482")}</span>
                <span>·</span>
                <span>{chat.when}</span>
                <span>·</span>
                <span>
                  {turns?.length ?? 0} turns · {countTools(turns)} tool calls
                </span>
              </>
            }
            actions={
              <>
                <button className="sd-btn sd-btn--ghost">export</button>
                <button className="sd-btn sd-btn--primary">resume →</button>
              </>
            }
          />
          <div className="sd-detail-body">
            {turns ? (
              <div className="chats__stream">
                {turns.map((t, i) => (
                  <TurnBlock key={i} turn={t} />
                ))}
              </div>
            ) : (
              <div className="chats__no-transcript">
                <span className="caps">Transcript</span>
                <p>
                  Full transcript for this session is in the vault. Press <kbd>resume →</kbd> to continue.
                </p>
              </div>
            )}
          </div>
        </>
      }
    />
  );
}

function TurnBlock({ turn }: { turn: ChatTurn }) {
  if (turn.kind === "user") {
    return (
      <div className="chats__turn chats__turn--user">
        <span className="chats__turn-who">You</span>
        <p>{turn.text}</p>
      </div>
    );
  }
  if (turn.kind === "assistant-thinking") {
    return <div className="chats__turn chats__turn--thinking">· {turn.note}</div>;
  }
  return (
    <div className="chats__turn chats__turn--assist">
      <span className="chats__turn-who">Tinker</span>
      {turn.text.split("\n\n").map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {turn.toolCalls && (
        <div className="chats__calls">
          {turn.toolCalls.map((c, i) => (
            <span key={i} className="chats__call mono">
              <span className="chats__call-name">{c.name}</span>
              <span className="chats__call-ms">{c.durationMs}ms</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function countTools(turns?: ReadonlyArray<ChatTurn>): number {
  if (!turns) return 0;
  return turns.reduce((s, t) => s + (t.kind === "assistant" ? t.toolCalls?.length ?? 0 : 0), 0);
}
