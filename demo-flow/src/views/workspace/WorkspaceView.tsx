import { useMemo, useState } from "react";
import { DemoTabs } from "./DemoTabs";
import { ContextPane } from "./ContextPane";
import { ChatPane } from "./ChatPane";
import { OutputPane } from "./OutputPane";
import { AuditRail } from "./AuditRail";
import * as demo1 from "../../seed/demo1-whitespace";
import * as demo2 from "../../seed/demo2-enrichment";
import * as demo3 from "../../seed/demo3-meeting";
import type { DemoKey, ToolCall } from "../../seed/types";
import "./workspace.css";

export function WorkspaceView() {
  const [demo, setDemo] = useState<DemoKey>("whitespace");
  const [auditOpen, setAuditOpen] = useState(true);

  const toolCalls = useMemo<ReadonlyArray<ToolCall>>(() => {
    switch (demo) {
      case "whitespace":
        return extractCalls(demo1.transcript);
      case "enrichment":
        return extractCalls(demo2.transcript);
      case "meeting":
        return extractCalls(demo3.transcript);
    }
  }, [demo]);

  return (
    <div className="workspace">
      <DemoTabs
        active={demo}
        onChange={setDemo}
        auditOpen={auditOpen}
        onToggleAudit={() => setAuditOpen((v) => !v)}
      />
      <div className="workspace__panes">
        <ContextPane demo={demo} />
        <ChatPane demo={demo} />
        <div className="workspace__right">
          <OutputPane demo={demo} auditOpen={auditOpen} />
          <AuditRail open={auditOpen} calls={toolCalls} onClose={() => setAuditOpen(false)} />
        </div>
      </div>
    </div>
  );
}

function extractCalls(turns: ReadonlyArray<{ kind: string; toolCalls?: ReadonlyArray<ToolCall> }>): ReadonlyArray<ToolCall> {
  const out: ToolCall[] = [];
  for (const t of turns) {
    if (t.toolCalls) out.push(...t.toolCalls);
  }
  return out;
}
