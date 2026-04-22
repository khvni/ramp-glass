export type RouteKey =
  | "workspace"
  | "explorer"
  | "chats"
  | "skills"
  | "agents"
  | "connections"
  | "memory";

export type NavItem = {
  key: RouteKey;
  label: string;
  kbd: string;
  /** one-line tooltip describing the destination. */
  hint: string;
};

export const NAV: ReadonlyArray<NavItem> = [
  { key: "workspace", label: "Workspaces", kbd: "⌘1", hint: "Split-pane work sessions" },
  { key: "explorer", label: "Explorer", kbd: "⌘2", hint: "Local vault + project files" },
  { key: "chats", label: "Chats", kbd: "⌘3", hint: "All conversations in this workspace" },
  { key: "skills", label: "Skills", kbd: "⌘4", hint: "Enabled playbooks + workflow skills" },
  { key: "agents", label: "Agents", kbd: "⌘5", hint: "Scheduled + on-demand agents" },
  { key: "connections", label: "Connections", kbd: "⌘6", hint: "Tools wired to this workspace" },
  { key: "memory", label: "Memory", kbd: "⌘7", hint: "Entities, relationships, history" },
];
