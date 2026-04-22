import { useEffect } from "react";
import type { RouteKey } from "./nav";
import { NAV } from "./nav";
import { LeftRail } from "./LeftRail";
import { TitleBar } from "./TitleBar";
import { WorkspaceView } from "../views/workspace/WorkspaceView";
import { ExplorerView } from "../views/ExplorerView";
import { ChatsView } from "../views/ChatsView";
import { SkillsView } from "../views/SkillsView";
import { AgentsView } from "../views/AgentsView";
import { ConnectionsView } from "../views/ConnectionsView";
import { MemoryView } from "../views/MemoryView";

type Props = {
  route: RouteKey;
  onNavigate: (route: RouteKey) => void;
  onExit: () => void;
};

export function Shell({ route, onNavigate, onExit }: Props) {
  // ⌘1–7 switch views; ⌘⇧N returns to narrative
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= NAV.length) {
        const item = NAV[n - 1];
        if (item) {
          e.preventDefault();
          onNavigate(item.key);
        }
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNavigate, onExit]);

  const label = NAV.find((n) => n.key === route)?.label ?? "";

  return (
    <div className="app-root">
      <TitleBar crumb={label.toLowerCase()} />
      <div className="main-row">
        <LeftRail route={route} onNavigate={onNavigate} />
        <main className="content">{renderView(route)}</main>
      </div>
    </div>
  );
}

function renderView(route: RouteKey) {
  switch (route) {
    case "workspace":
      return <WorkspaceView />;
    case "explorer":
      return <ExplorerView />;
    case "chats":
      return <ChatsView />;
    case "skills":
      return <SkillsView />;
    case "agents":
      return <AgentsView />;
    case "connections":
      return <ConnectionsView />;
    case "memory":
      return <MemoryView />;
  }
}
