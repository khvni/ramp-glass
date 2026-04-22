import { useEffect, useState } from "react";
import { Shell } from "./shell/Shell";
import { OpeningNarrative } from "./views/OpeningNarrative";
import type { RouteKey } from "./shell/nav";
import "./styles/app.css";

export type AppState = { stage: "narrative" } | { stage: "app"; route: RouteKey };

export function App() {
  const [state, setState] = useState<AppState>({ stage: "narrative" });

  // ⌘K / Ctrl+K jumps straight into the app
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setState({ stage: "app", route: "workspace" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (state.stage === "narrative") {
    return <OpeningNarrative onEnter={() => setState({ stage: "app", route: "workspace" })} />;
  }

  return (
    <Shell
      route={state.route}
      onNavigate={(route) => setState({ stage: "app", route })}
      onExit={() => setState({ stage: "narrative" })}
    />
  );
}
