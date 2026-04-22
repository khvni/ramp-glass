import type {
  ChatTurn,
  PortfolioItem,
  Recommendation,
  SfdcAccount,
  Signal,
} from "./types";

export const account = {
  name: "Marvell Technology",
  domain: "marvell.com",
  sector: "Semiconductors · Data infrastructure",
  hq: "Santa Clara, CA",
  employees: "~6,500",
  fiscalYear: "FY26 (Jan → Jan)",
};

export const signals: ReadonlyArray<Signal> = [
  {
    kind: "press",
    source: "Exa · marvell.com/company/newsroom",
    headline:
      "Marvell announces 1.6T PAM4 DSP in 3nm for next-generation AI cluster interconnect",
    date: "2026-04-14",
    note: "Silicon sampling; production Q4 FY26. Targets hyperscale AI fabric.",
  },
  {
    kind: "filing",
    source: "Exa · sec.gov/Marvell · 10-Q",
    headline: "Q4 FY26 revenue $1.82B, AI-infrastructure segment +77% YoY",
    date: "2026-03-28",
    note:
      "Guidance raised on accelerated AI silicon ramp. $1.1B capex shift toward 5nm/3nm test capacity.",
  },
  {
    kind: "hire",
    source: "Exa · linkedin.com/in/ · press pickup",
    headline:
      "New VP of RF Integration joins from Broadcom — mandate to accelerate coherent-optical validation",
    date: "2026-03-11",
    note:
      "This hire owns mixed-signal test budget. Public talk in Jan referenced 'bottleneck at 200 GBd BERT coverage.'",
  },
  {
    kind: "news",
    source: "Exa · eenews.com",
    headline: "Marvell taping out 800G coherent DSP with integrated SerDes — Q2 FY26",
    date: "2026-02-22",
    note:
      "Competitor Acacia uses legacy optical VSA stack. Gap in high-speed BERT coverage for >200 GBd.",
  },
  {
    kind: "press",
    source: "Exa · marvell.com/press",
    headline: "Acquires Innovium IP portfolio for DC switching silicon",
    date: "2025-11-30",
    note:
      "Expanding protocol-analyzer footprint; acquired team was on Keysight IXIA — integration lead-time 4–6 months.",
  },
];

export const sfdc: SfdcAccount = {
  name: "Marvell Technology — Global",
  tier: "Platinum · Strategic",
  owner: "Maya Okafor (AE, Enterprise West)",
  lastActivity: "08 Feb 2026 · QBR with Test Eng leadership",
  openArr: "$3.4M · maint + software",
  contacts: [
    { name: "Rajeev Sundaram", role: "Sr. Director, Silicon Validation" },
    { name: "Priya Chen", role: "Head of RF Test Lab" },
    { name: "Dr. Ben Osei", role: "Principal Engineer, Optical DSP" },
  ],
  owned: [
    { product: "N9030B PXA Signal Analyzer ×8", qty: 8, purchased: "2023-09", renewal: "2026-09" },
    { product: "E5080B ENA Vector Network Analyzer ×4", qty: 4, purchased: "2024-03", renewal: "2027-03" },
    { product: "89600 VSA Software — 12 seats", qty: 12, purchased: "2024-06", renewal: "2026-06" },
    { product: "N1000A DCA-X Mainframe ×1", qty: 1, purchased: "2022-11", renewal: "2025-11 (lapsed)" },
  ],
};

export const portfolio: ReadonlyArray<PortfolioItem> = [
  {
    code: "M8080A",
    family: "High-Speed BERT",
    name: "Keysight M8080A Ultra-High-Speed BERT",
    blurb: "256 GBd PAM4 / 200 GBd NRZ with inline error analysis and link-training support.",
  },
  {
    code: "N1092",
    family: "Coherent DCA",
    name: "Keysight N1092 Digital Communication Analyzer",
    blurb: "Coherent optical modulation analysis up to 1.6T per lane; integrated O-VSA workflow.",
  },
  {
    code: "N7620B",
    family: "Optical Modulation Analyzer",
    name: "Keysight Optical Modulation Analyzer 89600",
    blurb: "Real-time DSP tuning + IQ impairment decomposition for coherent engines.",
  },
  {
    code: "PXI-M9410A",
    family: "Vector Transceiver",
    name: "Keysight M9410A VXT Vector Transceiver",
    blurb: "Multi-channel MIMO calibration + envelope-tracking for 5G FR2.",
  },
];

export const recommendations: ReadonlyArray<Recommendation> = [
  {
    rank: 1,
    code: "N1092",
    name: "N1092 Coherent DCA + O-VSA bundle",
    why:
      "Marvell is taping out 1.6T + 800G coherent DSP through FY26. Their current N1000A lapsed in 2025; the N1092 adds the integrated coherent analysis their new VP flagged as a bottleneck.",
    trigger: "1.6T PAM4 DSP announcement · Optical DSP tape-out",
    listPrice: "$412,000 · starter config",
  },
  {
    rank: 2,
    code: "M8080A",
    name: "M8080A Ultra-High-Speed BERT",
    why:
      "Their public talk called out 'bottleneck at 200 GBd BERT coverage'. M8080A is the only instrument that covers 256 GBd PAM4 with link training. Directly replaces the gap.",
    trigger: "VP of RF Integration hire · 800G tape-out cadence",
    listPrice: "$687,500 · 4-slot config",
  },
  {
    rank: 3,
    code: "IXIA-AresONE",
    name: "AresONE-M 800GE traffic generator",
    why:
      "Innovium acquisition team was on IXIA. Extending that footprint to 800GE closes the DC-switching validation loop without retraining engineers.",
    trigger: "Innovium IP acquisition",
    listPrice: "$236,000 · per chassis",
  },
];

export const transcript: ReadonlyArray<ChatTurn> = [
  {
    kind: "user",
    text:
      "Where's the whitespace on Marvell? I want 3 specific products to lead with and why. Pull recent signals + what we already own.",
  },
  {
    kind: "assistant-thinking",
    note:
      "Gathering public signals, cross-referencing current product footprint, and mapping against Keysight portfolio gaps.",
  },
  {
    kind: "assistant",
    text:
      "I pulled signals from the last 5 months + the current SFDC account. Three gaps stood out — ranked by fit, strongest trigger first.\n\nThe biggest opening is coherent optical test. Their N1000A DCA lapsed last November and they're now taping out 1.6T and 800G coherent DSP — the N1092 covers exactly this workload and their new VP of RF Integration publicly flagged the bottleneck. Second is the 200 GBd BERT gap their VP mentioned on stage; the M8080A is the only instrument that hits 256 GBd PAM4. Third, the Innovium acquisition brings a team already on IXIA — AresONE-M is the natural extension to 800GE.\n\nI drafted a one-paragraph outreach angle for Maya (AE on the account) in the right pane.",
    toolCalls: [
      {
        name: "exa.web_search",
        label: "Signals scan",
        args: 'q: "Marvell" filed: last 180d · sites [newsroom, sec.gov, eenews, linkedin]',
        durationMs: 1820,
        result: "14 results · 5 high-signal",
        details: [
          "marvell.com/company/newsroom · 1.6T PAM4 DSP announcement",
          "sec.gov · 10-Q · Q4 FY26 · AI-infra +77%",
          "Press pickup · New VP of RF Integration from Broadcom",
          "eenews.com · 800G coherent DSP tape-out Q2 FY26",
          "marvell.com/press · Innovium IP acquisition",
        ],
      },
      {
        name: "salesforce.query",
        label: "Account snapshot",
        args: "SOQL · Account='Marvell Technology' + child Assets + OpenPipeline",
        durationMs: 640,
        result: "12 assets · 3 key contacts · $3.4M open ARR",
      },
      {
        name: "portfolio.map",
        label: "Keysight portfolio · gap analysis",
        args: "input: owned_products[] · filter: {speed>=200GBd, coherent, AI-infra}",
        durationMs: 412,
        result: "4 candidate products · 3 ranked by trigger-fit",
      },
      {
        name: "memory.recall",
        label: "Prior account memory",
        args: "entity='Marvell Technology' · relationship='prior_interaction'",
        durationMs: 180,
        result: "2 prior briefings · last QBR Feb 8",
        details: [
          "Feb 8 QBR: Rajeev flagged 'legacy optical stack from Acacia acquisition'",
          "Nov 17: Priya requested M8080A demo — no follow-up landed",
        ],
      },
    ],
  },
];
