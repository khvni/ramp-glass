export type DemoKey = "whitespace" | "enrichment" | "meeting";

export type ToolCall = {
  name: string; // e.g. "exa.web_search"
  label: string; // human label
  args: string; // short argument summary, shown mono
  durationMs: number;
  result: string; // short result summary
  /** A little tree of what was scanned / returned, rendered as bullet list. */
  details?: ReadonlyArray<string>;
};

export type ChatTurn =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string; toolCalls?: ReadonlyArray<ToolCall> }
  | { kind: "assistant-thinking"; note: string };

export type Signal = {
  kind: "news" | "filing" | "hire" | "press";
  source: string;
  headline: string;
  date: string;
  note: string;
};

export type SfdcLine = { product: string; qty: number; purchased: string; renewal: string };
export type SfdcAccount = {
  name: string;
  tier: string;
  owner: string;
  lastActivity: string;
  openArr: string;
  contacts: ReadonlyArray<{ name: string; role: string }>;
  owned: ReadonlyArray<SfdcLine>;
};

export type PortfolioItem = {
  code: string;
  family: string;
  name: string;
  blurb: string;
};

export type Recommendation = {
  rank: 1 | 2 | 3;
  code: string;
  name: string;
  why: string;
  trigger: string; // which signal it maps to
  listPrice: string;
};

export type EnrichmentRow = {
  company: string;
  /** filled after enrichment */
  hq?: string;
  employees?: string;
  primary?: string;
  title?: string;
  email?: string;
  phone?: string;
  lastActivity?: string;
};

export type MeetingContact = {
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin: string;
  bio: string;
  notableProjects: ReadonlyArray<string>;
};

export type MemoryNote = {
  kind: "prior-meeting" | "fact" | "preference";
  when: string;
  title: string;
  body: string;
};
