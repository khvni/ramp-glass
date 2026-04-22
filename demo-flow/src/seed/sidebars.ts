/** Seed data for non-demo destinations: Explorer, Chats, Skills, Agents, Connections, Memory. */

/* ---------- Explorer (file tree) ---------- */

export type FileNode = {
  id: string;
  name: string;
  kind: "folder" | "file";
  ext?: string;
  size?: string;
  modified?: string;
  children?: ReadonlyArray<FileNode>;
  /** Preview text when selected. */
  preview?: string;
};

export const explorerTree: FileNode = {
  id: "root",
  name: "keysight-west",
  kind: "folder",
  children: [
    {
      id: "accounts",
      name: "accounts",
      kind: "folder",
      children: [
        {
          id: "marvell",
          name: "marvell",
          kind: "folder",
          children: [
            {
              id: "mv-whitespace",
              name: "whitespace-2026-04-22.md",
              kind: "file",
              ext: "md",
              size: "4.8 kB",
              modified: "today · 08:42",
              preview:
                "# Marvell · Whitespace Analysis\n\n## Top 3 product openings\n\n1. **N1092 Coherent DCA** — their N1000A lapsed Nov 2025; they're taping out 1.6T + 800G\n2. **M8080A 256 GBd BERT** — VP publicly flagged 200 GBd ceiling as a bottleneck\n3. **AresONE-M 800GE** — Innovium team already standardized on IXIA\n\n## Angle\n\nLead with SLA, not specs. Priya at Marvell mentioned overnight support gap at Feb QBR — same story we heard from Orbion.",
            },
            {
              id: "mv-qbr",
              name: "qbr-feb-08.md",
              kind: "file",
              ext: "md",
              size: "2.1 kB",
              modified: "08 Feb · 14:12",
            },
            {
              id: "mv-signals",
              name: "signals.jsonl",
              kind: "file",
              ext: "jsonl",
              size: "11.4 kB",
              modified: "today · 08:34",
            },
          ],
        },
        {
          id: "orbion",
          name: "orbion-semi",
          kind: "folder",
          children: [
            {
              id: "orb-prep",
              name: "prep-brief-2026-04-22.md",
              kind: "file",
              ext: "md",
              size: "3.2 kB",
              modified: "today · 09:18",
              preview:
                "# Orbion Semi · Anika call prep\n\n**TL;DR** warm but cost-sensitive. Kenji Ohno is the evaluator. Lead with follow-the-sun SLA.\n\n- Orbion Ardent 800G in test phase\n- Budget confirmed via Mar 14 hire signal\n- Pre-IPO — multi-year discount will be decisive",
            },
            {
              id: "orb-ws",
              name: "orbion-ardent-whitespace.pdf",
              kind: "file",
              ext: "pdf",
              size: "482 kB",
              modified: "04 Mar · 11:01",
            },
            {
              id: "orb-trans",
              name: "transcripts",
              kind: "folder",
              children: [
                { id: "orb-t1", name: "2025-11-08-intro.txt", kind: "file", ext: "txt", size: "14.2 kB", modified: "08 Nov" },
                { id: "orb-t2", name: "2026-01-22-ofc-sidebar.txt", kind: "file", ext: "txt", size: "6.8 kB", modified: "22 Jan" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "prospects",
      name: "prospects",
      kind: "folder",
      children: [
        {
          id: "pros-csv",
          name: "2026-04-22.csv",
          kind: "file",
          ext: "csv",
          size: "2.9 kB",
          modified: "today · 10:04",
          preview:
            "company,hq,employees,primary,title,email,last_activity\nAria Biosciences,Cambridge MA,480,Dr. Helena Voss,Director of RF Instrumentation,h.voss@aria-biosciences.com,Keysight demo · Oct 2025\nVerdant Micro,Fremont CA,1240,Sato Tanaka,VP Test Engineering,sato@verdantmicro.io,Opened renewal · Feb 2026\nHalcyon Networks,Dublin IE,3890,Siobhán Doyle,Head of Validation,s.doyle@halcyon-net.ie,Responded to RFP · Mar 2026",
        },
        { id: "pros-log", name: "enrichment-log.md", kind: "file", ext: "md", size: "1.8 kB", modified: "today · 10:05" },
      ],
    },
    {
      id: "portfolio",
      name: "portfolio",
      kind: "folder",
      children: [
        { id: "pf-1", name: "high-speed-bert.md", kind: "file", ext: "md", size: "5.2 kB", modified: "12 Apr" },
        { id: "pf-2", name: "coherent-optical.md", kind: "file", ext: "md", size: "6.1 kB", modified: "12 Apr" },
        { id: "pf-3", name: "vna-families.md", kind: "file", ext: "md", size: "3.4 kB", modified: "09 Apr" },
      ],
    },
    { id: "readme", name: "README.md", kind: "file", ext: "md", size: "512 B", modified: "01 Apr", preview: "# keysight-west vault\n\nAE region = Enterprise West. Shared across AE + SE + CS.\n\nStructure: `accounts/` per-account briefs; `prospects/` enriched target lists; `portfolio/` product knowledge." },
  ],
};

/* ---------- Chats ---------- */

export type ChatSummary = {
  id: string;
  title: string;
  snippet: string;
  when: string;
  unread?: boolean;
  tags?: ReadonlyArray<string>;
};

export const chatList: ReadonlyArray<ChatSummary> = [
  {
    id: "c-1",
    title: "Marvell · Whitespace for Q2",
    snippet: "Where's the whitespace on Marvell? I want 3 specific products…",
    when: "today · 08:42",
    unread: true,
    tags: ["Marvell", "whitespace"],
  },
  {
    id: "c-2",
    title: "Enrich the 8-company prospect list",
    snippet: "Take this list of 8 companies and enrich it — HQ, size, primary…",
    when: "today · 10:04",
    tags: ["enrichment", "prospects"],
  },
  {
    id: "c-3",
    title: "Orbion · Anika prep + follow-up",
    snippet: "I have a call with Dr. Raskolnikova at Orbion Semi in 40 minutes…",
    when: "today · 09:18",
    unread: true,
    tags: ["Orbion", "meeting"],
  },
  {
    id: "c-4",
    title: "Acme Aerospace · renewal risk",
    snippet: "Pull renewal timeline for all 7 open opps on Acme — which are at risk?",
    when: "yesterday",
    tags: ["Acme", "renewals"],
  },
  {
    id: "c-5",
    title: "Ciena · response to RFP draft",
    snippet: "Read the Ciena RFP in the vault and draft our response section-by-section.",
    when: "yesterday",
    tags: ["Ciena", "rfp"],
  },
  {
    id: "c-6",
    title: "Weekly Hsinchu lab ops report",
    snippet: "Summarise the Hsinchu lab tickets from this week; which ones blocked customers?",
    when: "Mon 19 Apr",
    tags: ["ops"],
  },
  {
    id: "c-7",
    title: "Competitive — Rohde & Schwarz positioning",
    snippet: "Compare our optical stack to R&S OSA100 across 400G / 800G / 1.6T.",
    when: "Mon 19 Apr",
    tags: ["competitive"],
  },
  {
    id: "c-8",
    title: "Capex modeling · customer 3-year TCO",
    snippet: "Run a TCO model comparing our bundle versus two competitors over 3 years…",
    when: "Fri 16 Apr",
    tags: ["modeling"],
  },
];

/* ---------- Skills ---------- */

export type Skill = {
  id: string;
  name: string;
  category: "research" | "writing" | "data" | "integration" | "analysis";
  description: string;
  enabled: boolean;
  usage: string;
  badge?: "popular" | "new" | "verified";
};

export const skillCatalog: ReadonlyArray<Skill> = [
  {
    id: "sk-1",
    name: "Account Whitespace",
    category: "analysis",
    description: "Cross-reference signals, SFDC footprint, and portfolio to rank product openings.",
    enabled: true,
    usage: "24 runs this quarter",
    badge: "popular",
  },
  {
    id: "sk-2",
    name: "List Enrichment",
    category: "data",
    description: "Enrich a CSV of companies with HQ, size, decision-makers, verified emails.",
    enabled: true,
    usage: "88 runs this quarter",
    badge: "verified",
  },
  {
    id: "sk-3",
    name: "Pre-meeting Brief",
    category: "research",
    description: "Pull memory + Microsoft Graph + last transcript; draft bullet prep + follow-up email.",
    enabled: true,
    usage: "42 runs this quarter",
    badge: "verified",
  },
  {
    id: "sk-4",
    name: "Renewal Risk Signals",
    category: "analysis",
    description: "Scan active accounts for renewal timing + usage drop + competitor signals.",
    enabled: true,
    usage: "12 runs this quarter",
  },
  {
    id: "sk-5",
    name: "RFP Drafter",
    category: "writing",
    description: "Read an RFP PDF + pull our portfolio refs, draft response section-by-section.",
    enabled: true,
    usage: "7 runs this quarter",
    badge: "new",
  },
  {
    id: "sk-6",
    name: "Competitive Teardown",
    category: "research",
    description: "Fetch competitor spec sheets + press, produce a comparison table with sourced claims.",
    enabled: false,
    usage: "—",
  },
  {
    id: "sk-7",
    name: "3-year TCO Model",
    category: "analysis",
    description: "Generate a three-year TCO across bundle, service, and competitor alternatives.",
    enabled: true,
    usage: "9 runs this quarter",
  },
  {
    id: "sk-8",
    name: "Weekly Ops Digest",
    category: "research",
    description: "Read this week's Hsinchu / Santa Rosa / Böblingen ticket stream; summarize blockers.",
    enabled: true,
    usage: "18 runs this quarter",
  },
  {
    id: "sk-9",
    name: "Exec Narrative Builder",
    category: "writing",
    description: "Turn messy notes into a 1-pager exec summary with recommendation + confidence.",
    enabled: false,
    usage: "—",
    badge: "new",
  },
  {
    id: "sk-10",
    name: "Slack Thread Summarizer",
    category: "integration",
    description: "Summarize any #channel or thread in the user's preferred voice.",
    enabled: false,
    usage: "—",
  },
];

/* ---------- Agents ---------- */

export type Agent = {
  id: string;
  name: string;
  kind: "assistant" | "automation" | "scheduled";
  description: string;
  status: "active" | "paused" | "drafting";
  schedule?: string;
  lastRun?: string;
  channels?: ReadonlyArray<string>;
  skills?: ReadonlyArray<string>;
};

export const agentList: ReadonlyArray<Agent> = [
  {
    id: "a-1",
    name: "Maya · AE copilot",
    kind: "assistant",
    description: "Personal AE assistant · answers questions grounded in the keysight-west vault.",
    status: "active",
    lastRun: "now · on demand",
    channels: ["@maya"],
    skills: ["whitespace", "enrichment", "pre-meeting-brief", "tco-model"],
  },
  {
    id: "a-2",
    name: "Morning whitespace · top 5 accounts",
    kind: "scheduled",
    description: "Each weekday 07:00 PT — runs whitespace on Maya's top 5 accounts + posts to #maya-briefing.",
    status: "active",
    schedule: "Weekdays · 07:00 PT",
    lastRun: "today · 07:00 PT · 4m 12s",
    channels: ["#maya-briefing"],
    skills: ["whitespace", "renewal-risk"],
  },
  {
    id: "a-3",
    name: "Inbound triage",
    kind: "automation",
    description: "Watches the inbound form · classifies → routes to AE + drafts first-response email.",
    status: "active",
    schedule: "trigger · /inbound",
    lastRun: "today · 09:22 · 18s",
    channels: ["#inbound-west", "maya@"],
    skills: ["enrichment", "narrative"],
  },
  {
    id: "a-4",
    name: "QBR deck builder",
    kind: "automation",
    description: "Given an account name, assembles the QBR deck from vault + usage data.",
    status: "active",
    schedule: "trigger · /qbr <account>",
    lastRun: "yesterday · 16:41 · 2m 38s",
    skills: ["whitespace", "tco-model"],
  },
  {
    id: "a-5",
    name: "Hsinchu lab-ops weekly",
    kind: "scheduled",
    description: "Every Friday 16:00 HST · summarizes the week's lab tickets for the Asia SE team.",
    status: "active",
    schedule: "Fri · 16:00 HST",
    lastRun: "Fri 19 Apr · 16:00 · 1m 47s",
    channels: ["#asia-se-ops"],
    skills: ["ops-digest"],
  },
  {
    id: "a-6",
    name: "Renewal radar",
    kind: "scheduled",
    description: "Daily scan for accounts with renewal in <90 days + usage anomalies.",
    status: "paused",
    schedule: "Daily · 06:30 PT · paused 12 Apr",
    lastRun: "11 Apr · 06:30 · 3m 05s",
    skills: ["renewal-risk"],
  },
  {
    id: "a-7",
    name: "Competitive watch",
    kind: "automation",
    description: "Watches R&S + Anritsu + Tektronix newsrooms · drafts a digest on notable moves.",
    status: "drafting",
    schedule: "trigger · hourly",
    lastRun: "—",
    skills: ["competitive"],
  },
];

/* ---------- Connections ---------- */

export type Connection = {
  id: string;
  name: string;
  category: "data" | "crm" | "email" | "calendar" | "identity" | "docs" | "chat" | "search";
  status: "connected" | "healthy" | "attention";
  account: string;
  lastSync: string;
  scope: string;
  note?: string;
};

export const connections: ReadonlyArray<Connection> = [
  {
    id: "conn-1",
    name: "Salesforce",
    category: "crm",
    status: "connected",
    account: "keysight-west.my.salesforce.com",
    lastSync: "2 min ago",
    scope: "read · Accounts, Contacts, Opportunities, Activities",
  },
  {
    id: "conn-2",
    name: "Microsoft Graph",
    category: "identity",
    status: "connected",
    account: "maya.okafor@keysight.com · keysight.onmicrosoft.com",
    lastSync: "live",
    scope: "read · people, org, calendar, mail (metadata only)",
  },
  {
    id: "conn-3",
    name: "Otter.ai",
    category: "chat",
    status: "connected",
    account: "AE-west workspace",
    lastSync: "4 min ago",
    scope: "read · transcripts from team meetings",
  },
  {
    id: "conn-4",
    name: "Exa",
    category: "search",
    status: "connected",
    account: "enterprise · 50k queries/mo",
    lastSync: "live",
    scope: "search · filings, press, hires",
  },
  {
    id: "conn-5",
    name: "ZoomInfo",
    category: "data",
    status: "connected",
    account: "account-tier · 500 credits left this mo",
    lastSync: "used 11 min ago",
    scope: "enrich · companies + contacts",
  },
  {
    id: "conn-6",
    name: "Clay",
    category: "data",
    status: "healthy",
    account: "keysight-ops",
    lastSync: "used 12 min ago",
    scope: "verify · email deliverability + phone format",
  },
  {
    id: "conn-7",
    name: "Slack",
    category: "chat",
    status: "connected",
    account: "keysight.slack.com · #inbound-west, #maya-briefing, #asia-se-ops",
    lastSync: "live",
    scope: "read + post to 3 channels",
  },
  {
    id: "conn-8",
    name: "Google Drive",
    category: "docs",
    status: "attention",
    account: "maya.okafor@keysight.com",
    lastSync: "12 hours ago",
    scope: "read · /keysight-west/accounts",
    note: "Reauth required — OAuth token rotated by Keysight IT last night.",
  },
  {
    id: "conn-9",
    name: "Gmail",
    category: "email",
    status: "connected",
    account: "maya.okafor@keysight.com",
    lastSync: "live",
    scope: "draft · read (no send without approval)",
  },
  {
    id: "conn-10",
    name: "Notion",
    category: "docs",
    status: "connected",
    account: "keysight-west workspace",
    lastSync: "3 min ago",
    scope: "read + write · playbooks, QBRs",
  },
  {
    id: "conn-11",
    name: "Local vault",
    category: "docs",
    status: "connected",
    account: "~/keysight-west/",
    lastSync: "live · filesystem watcher",
    scope: "read + write · local-first markdown",
  },
];

/* ---------- Memory ---------- */

export type MemoryCategory = {
  id: string;
  name: string;
  count: number;
  icon: "people" | "accounts" | "capabilities" | "preferences" | "org" | "work";
};

export type MemoryEntry = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  body: string;
  when: string;
  source: string;
  tags: ReadonlyArray<string>;
};

export const memoryCategories: ReadonlyArray<MemoryCategory> = [
  { id: "people", name: "People", count: 34, icon: "people" },
  { id: "accounts", name: "Accounts", count: 18, icon: "accounts" },
  { id: "capabilities", name: "Capabilities", count: 7, icon: "capabilities" },
  { id: "preferences", name: "Preferences", count: 11, icon: "preferences" },
  { id: "org", name: "Organization", count: 5, icon: "org" },
  { id: "active-work", name: "Active Work", count: 12, icon: "work" },
];

export const memoryEntries: ReadonlyArray<MemoryEntry> = [
  {
    id: "m-1",
    category: "people",
    title: "Anika Raskolnikova (Orbion Semi)",
    subtitle: "Director, Test Engineering · warm but cost-sensitive",
    body:
      "Director, Test Eng at Orbion Semi. PhD EE Stanford '14. Ex-Acacia / Cisco on coherent DSP. Started Orbion lab in 2024. Kenji Ohno is her deputy + day-to-day evaluator for instrument POCs. Communication: bullets only, mornings, signs off 'Best, A'. Budget approval flows through her.",
    when: "updated · today · 09:15",
    source: "3 meetings · 2 emails · LinkedIn",
    tags: ["Orbion", "decision-maker", "coherent-dsp"],
  },
  {
    id: "m-2",
    category: "people",
    title: "Priya Chen (Marvell)",
    subtitle: "Head of RF Test Lab · champion for M8080A",
    body:
      "Priya asked for an M8080A demo last November; the follow-up stalled when her budget got reshuffled. Public tech talk Jan '26 cited 200 GBd BERT ceiling as a lab bottleneck — that's the lever for the reopen.",
    when: "updated · 22 Jan",
    source: "1 meeting · 1 tech talk",
    tags: ["Marvell", "BERT", "reopen"],
  },
  {
    id: "m-3",
    category: "accounts",
    title: "Marvell Technology",
    subtitle: "Platinum · $3.4M open ARR · coherent + BERT gap",
    body:
      "Global account. 12 assets owned. Their N1000A DCA lapsed Nov '25 — they're taping out 1.6T + 800G coherent through FY26. New VP of RF Integration joined from Broadcom with mandate to accelerate coherent validation.",
    when: "updated · today · 08:42",
    source: "SFDC · Exa signals",
    tags: ["Marvell", "whitespace", "coherent"],
  },
  {
    id: "m-4",
    category: "accounts",
    title: "Orbion Semi",
    subtitle: "Pre-IPO · Ardent 800G in test · budget confirmed",
    body:
      "Silicon-photonics startup standing up a Hsinchu validation lab. Ardent coherent engine taped out Q1 '26. Pre-IPO, so discounting must ladder to a pre-IPO cashflow profile. Lab expansion funded through at least FY26.",
    when: "updated · today · 09:18",
    source: "3 meetings · hire signal · SFDC",
    tags: ["Orbion", "coherent", "pre-ipo"],
  },
  {
    id: "m-5",
    category: "preferences",
    title: "Maya — writing voice",
    subtitle: "Owner preference · outbound email style",
    body:
      "Maya writes short, direct, specific. Always leads with the ask or the commitment, not the greeting. Bullets over paragraphs. No 'I hope this finds you well.' Signs off 'Best, Maya'.",
    when: "updated · 14 Mar",
    source: "samples · 42 sent emails",
    tags: ["style", "voice"],
  },
  {
    id: "m-6",
    category: "capabilities",
    title: "Coherent optical · Keysight portfolio",
    subtitle: "N1092 + 89600 VSA + N7620B · canonical bundle",
    body:
      "For 400G through 1.6T coherent validation, the canonical bundle is N1092 DCA + 89600 VSA software + N7620B OMA. The M8080A BERT is the companion for electrical-side link training. List prices anchored against 2026 price book.",
    when: "updated · 12 Apr",
    source: "portfolio/coherent-optical.md",
    tags: ["portfolio", "coherent"],
  },
  {
    id: "m-7",
    category: "active-work",
    title: "Writing: Ardent whitespace PDF · v4",
    subtitle: "Pending review · Maya",
    body:
      "Draft 4 of Orbion Ardent whitespace brief. v3 landed well — Anika said in OFC sidebar it 'reads like something my team would write.' v4 updates the M8080A gap analysis after Mar 11 Broadcom hire signal.",
    when: "updated · 04 Mar",
    source: "accounts/orbion-semi/orbion-ardent-whitespace.pdf",
    tags: ["writing", "active"],
  },
];
