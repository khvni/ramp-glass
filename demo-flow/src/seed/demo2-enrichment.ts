import type { ChatTurn, EnrichmentRow, ToolCall } from "./types";

export const before: ReadonlyArray<EnrichmentRow> = [
  { company: "Aria Biosciences" },
  { company: "Verdant Micro" },
  { company: "Halcyon Networks" },
  { company: "NovaCadence" },
  { company: "Flux Semiconductors" },
  { company: "Kairos Optics" },
  { company: "MeridianAI Labs" },
  { company: "Polycrest Robotics" },
];

export const after: ReadonlyArray<EnrichmentRow> = [
  {
    company: "Aria Biosciences",
    hq: "Cambridge, MA",
    employees: "480",
    primary: "Dr. Helena Voss",
    title: "Director of RF Instrumentation",
    email: "h.voss@aria-biosciences.com",
    phone: "+1 617 555 0133",
    lastActivity: "Keysight demo · Oct 2025",
  },
  {
    company: "Verdant Micro",
    hq: "Fremont, CA",
    employees: "1,240",
    primary: "Sato Tanaka",
    title: "VP Test Engineering",
    email: "sato@verdantmicro.io",
    phone: "+1 510 555 0177",
    lastActivity: "Opened renewal · Feb 2026",
  },
  {
    company: "Halcyon Networks",
    hq: "Dublin, IE",
    employees: "3,890",
    primary: "Siobhán Doyle",
    title: "Head of Validation",
    email: "s.doyle@halcyon-net.ie",
    phone: "+353 1 555 0142",
    lastActivity: "Responded to RFP · Mar 2026",
  },
  {
    company: "NovaCadence",
    hq: "Austin, TX",
    employees: "210",
    primary: "Marcus Bell",
    title: "Principal Engineer",
    email: "mbell@novacadence.ai",
    phone: "+1 512 555 0108",
    lastActivity: "Inbound form · 4 days ago",
  },
  {
    company: "Flux Semiconductors",
    hq: "Hsinchu, TW",
    employees: "2,050",
    primary: "Chen Wei-Lun",
    title: "Director, Production Test",
    email: "wlchen@fluxsemi.tw",
    phone: "+886 3 555 0194",
    lastActivity: "PO raised · Jan 2026",
  },
  {
    company: "Kairos Optics",
    hq: "Palo Alto, CA",
    employees: "96",
    primary: "Emma Linnér",
    title: "Founding Engineer, Optical",
    email: "emma@kairosoptics.com",
    phone: "+1 650 555 0150",
    lastActivity: "Never contacted",
  },
  {
    company: "MeridianAI Labs",
    hq: "Seattle, WA",
    employees: "760",
    primary: "Dr. Rohan Iyer",
    title: "Head of Silicon Engineering",
    email: "r.iyer@meridianai.com",
    phone: "+1 206 555 0121",
    lastActivity: "Cancelled POC · Sep 2025",
  },
  {
    company: "Polycrest Robotics",
    hq: "Boulder, CO",
    employees: "580",
    primary: "Alina Park",
    title: "VP Hardware Operations",
    email: "alina.park@polycrest.dev",
    phone: "+1 303 555 0166",
    lastActivity: "Conference lead · Oct 2025",
  },
];

/** Staged tool-call progression — each stage fires sequentially in the UI. */
export const enrichmentStages: ReadonlyArray<ToolCall> = [
  {
    name: "zoominfo.find_company",
    label: "Find company profiles",
    args: "batch[8] · fields: [hq, employees, sector]",
    durationMs: 1420,
    result: "8/8 matched",
    details: [
      "Aria Biosciences → Cambridge, MA · 480 emp",
      "Verdant Micro → Fremont, CA · 1,240 emp",
      "Halcyon Networks → Dublin, IE · 3,890 emp",
      "NovaCadence → Austin, TX · 210 emp",
      "Flux Semiconductors → Hsinchu, TW · 2,050 emp",
      "Kairos Optics → Palo Alto, CA · 96 emp",
      "MeridianAI Labs → Seattle, WA · 760 emp",
      "Polycrest Robotics → Boulder, CO · 580 emp",
    ],
  },
  {
    name: "zoominfo.find_contact",
    label: "Surface decision-makers",
    args: "title_contains: [VP, Director, Head, Principal] · seniority: director+",
    durationMs: 2180,
    result: "8 primary contacts located",
    details: [
      "Aria → Helena Voss · Director RF Instrumentation",
      "Verdant → Sato Tanaka · VP Test Eng",
      "Halcyon → Siobhán Doyle · Head of Validation",
      "NovaCadence → Marcus Bell · Principal Engineer",
      "Flux → Chen Wei-Lun · Director Production Test",
      "Kairos → Emma Linnér · Founding Eng, Optical",
      "Meridian → Rohan Iyer · Head Silicon Eng",
      "Polycrest → Alina Park · VP Hardware Ops",
    ],
  },
  {
    name: "clay.verify_email",
    label: "Verify work emails",
    args: "batch[8] · deliverability + catch-all check",
    durationMs: 960,
    result: "8/8 valid · 0 bounces predicted",
  },
  {
    name: "salesforce.lastActivity",
    label: "Pull last activity from SFDC",
    args: "account_ids[8] · joins: Activity + Opportunity",
    durationMs: 480,
    result: "8/8 last-touch resolved",
  },
  {
    name: "memory.write",
    label: "Commit enriched rows to vault",
    args: "vault/prospects/2026-04-22.csv · +8 rows · +64 cells",
    durationMs: 240,
    result: "Wrote 64 cells · versioned in git",
  },
];

export const transcript: ReadonlyArray<ChatTurn> = [
  {
    kind: "user",
    text:
      "Take this list of 8 companies and enrich it — HQ, size, primary decision-maker, verified email, phone, last activity in our SFDC. Write the result back to the vault.",
  },
  {
    kind: "assistant-thinking",
    note:
      "Running enrichment in stages: company profile → contact → email verification → SFDC lookup → write.",
  },
  {
    kind: "assistant",
    text:
      "Done. 8 of 8 companies enriched and written to `vault/prospects/2026-04-22.csv`. Three are worth flagging: NovaCadence came in as an inbound 4 days ago, Verdant just opened renewal, and Kairos Optics has never been touched — that's a clean slate with a founding engineer who'll read your email personally.\n\nNo bounces predicted. I skipped adding phone numbers for Meridian (their SFDC record is marked do-not-call) and noted it in the output column.",
    toolCalls: enrichmentStages,
  },
];
