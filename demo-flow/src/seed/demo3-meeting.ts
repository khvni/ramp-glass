import type { ChatTurn, MeetingContact, MemoryNote, ToolCall } from "./types";

export const contact: MeetingContact = {
  name: "Dr. Anika Raskolnikova",
  title: "Director of Test Engineering",
  company: "Orbion Semi",
  email: "a.raskolnikova@orbion-semi.com",
  linkedin: "linkedin.com/in/anika-raskolnikova",
  bio:
    "PhD EE (Stanford, '14). 11 years at Cisco on optical transport, then coherent-DSP lead at Acacia → Cisco acquisition. Joined Orbion in 2024 to stand up the silicon-photonics validation lab. Oversees a 14-person test team + an $8.4M capital budget.",
  notableProjects: [
    "Orbion Ardent 800G coherent engine — tape-out complete, test in progress",
    "Q1 expansion of Hsinchu test lab (doubled BERT + VNA capacity)",
    "Published IEEE paper on 200 GBd PAM4 EQ training loops (2025)",
  ],
};

export const memory: ReadonlyArray<MemoryNote> = [
  {
    kind: "prior-meeting",
    when: "2025-11-08 · 60m video call",
    title: "Intro call — Anika + Maya (AE) + Rohit (SE)",
    body:
      "Anika walked through Orbion's validation roadmap. Frustration: current vendor (competitor) lab-ops team cuts support calls at 5pm local — she'd lost 3 tape-out weeks chasing driver issues. Asked for a POC proposal by end of November. Ours was delivered; no update since.",
  },
  {
    kind: "prior-meeting",
    when: "2026-01-22 · coffee at OFC kickoff",
    title: "OFC sidebar · informal",
    body:
      "Dropped that she's 'looking hard' at N1092 for Ardent — budget approval pending, needs ROI case. Mentioned her deputy Kenji Ohno does day-to-day eval. Temperature: warm but cost-sensitive — Orbion is pre-IPO, every dollar is watched.",
  },
  {
    kind: "fact",
    when: "2026-03-14 · vault/orbion/budget-signal.md",
    title: "Budget signal — LinkedIn hire",
    body:
      "Orbion posted a Principal Coherent Test Engineer req in Hsinchu on Mar 14. Implies lab expansion is funded; our POC window is about to re-open.",
  },
  {
    kind: "preference",
    when: "2026-02-01 · Anika's email footer",
    title: "Communication preference",
    body:
      "Uses bullet summaries, not prose. Signs off 'Best, A'. Prefers mornings. Will not respond to cold calls but opens every email from known senders.",
  },
];

export const transcriptExcerpt = `
[00:04:12] Anika: ... and the honest answer is we lost two full weeks of our Ardent tape-out in December because the support window on our current VNA vendor expires at 5pm local time. In Hsinchu that means my team's blocked overnight every time a driver bug surfaces.

[00:05:01] Maya (Keysight): That matches what Priya at Marvell told us last quarter — same vendor, same issue. One of the reasons we run our Asia lab-ops on a follow-the-sun model is exactly that.

[00:05:38] Anika: Right. That's the kind of thing that, frankly, matters more to me than the last 5% on a spec sheet. I need my engineers unblocked. If you can tell me what a 24-hour SLA looks like on the N1092 + optical VSA bundle, concretely, that changes the calculus on approval.

[00:06:42] Anika: Also — and put this in your notes — Kenji is the one who actually evaluates instruments. He's the one who needs the POC, not me. I just approve the PO.
`.trim();

export const followUpEmail = `Subject: Orbion Ardent — proposed POC + a follow-the-sun SLA, concretely

Hi Anika,

Thanks for the time this morning. A quick recap + next steps, since you said bullets work better —

· SLA: Keysight runs follow-the-sun lab-ops from Santa Rosa → Böblingen → Hsinchu. For the N1092 + O-VSA bundle you'd be on a 4-hour response, 24-hour on-site commit — I've attached the service spec.
· POC scope: 6-week eval of N1092 + 89600 VSA, focused on Ardent 800G coherent engine. I looped in Jonas (our Hsinchu SE) who can be on-site with Kenji from day one.
· Budget fit: list is $412k; POC terms are $0 for the eval + Keysight-funded setup. If we convert, we structure against your pre-IPO cashflow profile — Maya has proposed terms attached.
· Cross-reference: I've attached the whitespace brief I built for your Ardent roadmap; the gap analysis against your current optical stack is on page 3.

Happy to set up Kenji's kickoff for next week.

Best,
Maya

Attached · 01 · keysight-lab-ops-sla.pdf  · 02 · orbion-ardent-whitespace.pdf  · 03 · poc-terms-2026-04.pdf`;

export const prepBrief = {
  who: "Dr. Anika Raskolnikova · Director Test Eng · Orbion Semi",
  tldr:
    "Warm but cost-sensitive. Previous vendor pain = overnight support blackouts in Hsinchu. Her deputy Kenji Ohno is the actual evaluator. Budget signal confirmed (new hire posted Mar 14).",
  know: [
    "Orbion Ardent 800G coherent engine is in test phase — the pain is live.",
    "She's been looking at N1092 since January OFC; no written proposal yet.",
    "Orbion is pre-IPO. Cashflow-sensitive. Multi-year discounting will be decisive.",
    "She was ex-Acacia → Cisco. Knows coherent DSP deeply.",
  ],
  askAbout: [
    "Timeline on Ardent first-silicon — do they need test gear pre-tape-out or post?",
    "What Kenji's minimum acceptable POC looks like — we should propose specifics, not options.",
    "Whether the Hsinchu lab expansion is funded through FY27 or just FY26.",
  ],
  angle:
    "Lead with follow-the-sun lab-ops, not the spec sheet. She said — verbatim — that unblocking her engineers matters more than the last 5% on specs. The N1092 wins on both axes, but mention the SLA first.",
  nextStep: "Draft follow-up email that lands the SLA commitment + a specific POC structure, not a meeting.",
};

export const toolCalls: ReadonlyArray<ToolCall> = [
  {
    name: "msgraph.people.get",
    label: "Microsoft Graph · profile + org",
    args: "email='a.raskolnikova@orbion-semi.com' · include reports",
    durationMs: 320,
    result: "Profile + 14 direct/indirect reports returned",
    details: [
      "Anika Raskolnikova · Director, Test Engineering",
      "Reports to: Yusuf Ibrahim · VP Engineering",
      "Key direct: Kenji Ohno · Staff Test Engineer (Hsinchu)",
    ],
  },
  {
    name: "otter.transcript.scan",
    label: "Meeting transcript scan",
    args: "conversation_id='orb-anika-2026-04-22' · extract: [ask, pain, commitments]",
    durationMs: 780,
    result: "3 pains · 2 explicit asks · 1 routing note",
    details: [
      "Pain · overnight support blackouts costing tape-out weeks",
      "Ask · concrete 24h SLA on N1092 + O-VSA",
      "Routing · 'Kenji is the evaluator, not me'",
    ],
  },
  {
    name: "memory.search",
    label: "Tinker memory · Orbion + Anika",
    args: "entity='Orbion Semi' OR contact='Anika' · last 12 months",
    durationMs: 140,
    result: "4 notes · 2 prior meetings",
    details: [
      "Nov 8 intro call (Maya + Rohit) — POC asked for, no follow-up",
      "Jan 22 OFC sidebar — warm but cost-sensitive",
      "Mar 14 budget-signal note — Hsinchu Principal req posted",
      "Feb 1 communication preference — bullets, morning, bullets",
    ],
  },
  {
    name: "salesforce.account.read",
    label: "Orbion Semi account",
    args: "include=[Opportunity, OpenAttachments, NotesFromOwner]",
    durationMs: 520,
    result: "1 open opp · $412k · stage=Discovery · owner=Maya Okafor",
  },
  {
    name: "vault.search",
    label: "Local vault · prior whitespace brief",
    args: "query: 'Orbion Ardent whitespace' · include: PDFs",
    durationMs: 90,
    result: "1 file: orbion-ardent-whitespace.pdf (built 2026-03-04)",
  },
];

export const transcript: ReadonlyArray<ChatTurn> = [
  {
    kind: "user",
    text:
      "I have a call with Dr. Raskolnikova at Orbion Semi in 40 minutes. Pull what we know, read the last meeting transcript, and draft a prep brief + the follow-up email I'll send after.",
  },
  {
    kind: "assistant-thinking",
    note:
      "Cross-referencing Microsoft Graph, Otter transcripts, internal memory, SFDC, and the local vault.",
  },
  {
    kind: "assistant",
    text:
      "Prep brief + follow-up draft in the right pane. The short version: she's warm but cost-sensitive, Kenji Ohno is the actual evaluator, and the unlock is a concrete 24-hour SLA commitment on the N1092 bundle — not a better spec sheet. I found the March 14 hiring signal that confirms her budget is funded, and attached the whitespace brief you already have on Ardent so the email lands with context.",
    toolCalls,
  },
];
