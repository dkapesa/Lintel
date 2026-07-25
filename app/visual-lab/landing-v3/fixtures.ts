/* R3C — Landing V3 visual laboratory · lab-owned fixtures.

   This file is a LAB fixture representation only. It is deliberately a small,
   flat, serialisable shape so the lab can be evaluated as a visual system
   without touching production data paths.

   It does NOT:
     - read or write report history, decision ledgers or any storage key;
     - import Workspace persistence, decision services or report builders;
     - make a network request.

   R3D replaces this file with the canonical landing fixture adapter described
   in R3B §8 / §16, which derives the same shape at build or server time from
   `lib/mock-report`, `buildEvidenceHierarchy` and `buildMergeContract`.

   Content truthfulness: scenario 1 mirrors the canonical `lib/mock-report`
   record (PR #482, TESTS REQUIRED, risk 46/100 medium, four conditions before
   merge, no recorded decision). Scenario 3 mirrors the canonical clean
   scenario. Scenario 2 is an explicitly sample second failure class using the
   canonical `acme/*` sample namespace. Every scenario keeps Human Decision
   pending, and every surface carries visible sample provenance. */

export type StageId = "change" | "observation" | "evidence" | "requirement" | "decision";

export type ScenarioId = "missing-tests" | "provider-failure" | "ready";

export type Tone = "neutral" | "warning" | "danger" | "success" | "info" | "provenance";

export type LabRecord = {
  /** Mono identity (`F1`, `E1`, `C1`) where the product would carry one. */
  id?: string;
  /** Micro label above the record title. */
  kind: string;
  title: string;
  detail?: string;
  state?: string;
  tone?: Tone;
  meta?: { label: string; value: string }[];
  /** Mono-set lines rendered as a technical well (paths, test names). */
  lines?: string[];
};

export type LabStage = {
  id: StageId;
  label: string;
  definition: string;
  /** One-line summary of this stage in the selected scenario. */
  caption: string;
  records: LabRecord[];
};

export type LabScenario = {
  id: ScenarioId;
  label: string;
  /** Short line shown beside the scenario control. */
  summary: string;
  repository: string;
  pullRequest: string;
  branch: string;
  title: string;
  headSha: string;
  recommendation: string;
  recommendationTone: Tone;
  riskScore: number;
  riskBand: string;
  openRequirements: number;
  blockingRequirements: number;
  missingProof: number;
  /** Locked: pending in every scenario (R3B §7.5). */
  decisionState: "pending";
  stages: LabStage[];
};

export const STAGE_ORDER: StageId[] = ["change", "observation", "evidence", "requirement", "decision"];

/** The abstract model, used by the evidence-chain section (R3B §7.4). */
export const CHAIN_MODEL: {
  id: StageId;
  label: string;
  definition: string;
  exampleId: string;
  exampleTitle: string;
  exampleState: string;
  exampleTone: Tone;
}[] = [
  {
    id: "change",
    label: "Change",
    definition: "What the pull request actually alters.",
    exampleId: "4 files",
    exampleTitle: "app/services/redemption_service.py",
    exampleState: "REDEMPTION PATH",
    exampleTone: "neutral",
  },
  {
    id: "observation",
    label: "Observation",
    definition: "What Lintel found, with its origin labelled.",
    exampleId: "F1",
    exampleTitle: "A retry can duplicate a redemption.",
    exampleState: "HIGH · RULE DETECTED",
    exampleTone: "danger",
  },
  {
    id: "evidence",
    label: "Evidence",
    definition: "The record behind each observation — observed, inferred or missing.",
    exampleId: "E1",
    exampleTitle: "Retry path present, no idempotency guard observed.",
    exampleState: "DIRECTLY OBSERVED",
    exampleTone: "info",
  },
  {
    id: "requirement",
    label: "Requirement",
    definition: "Anything unproved, turned into an explicit condition to satisfy before merge.",
    exampleId: "C1",
    exampleTitle: "Prove retries cannot issue duplicate discount codes.",
    exampleState: "OPEN · BLOCKING",
    exampleTone: "warning",
  },
  {
    id: "decision",
    label: "Human Decision",
    definition: "The accountable engineer's recorded outcome.",
    exampleId: "—",
    exampleTitle: "No engineer decision recorded.",
    exampleState: "PENDING",
    exampleTone: "neutral",
  },
];

/* Hero fragments — one continuous verification chain (R3B §7.2).

   R3C.1 gives each fragment a compositional role so the field reads as an
   authored scene rather than six equal boxes. The chain itself is unchanged:
   every fragment still hangs off the single rail, in order.

     anchor     the pull request identity — dominant, bordered, full width
     principal  evidence and missing proof — bordered, medium, offset
     support    observation and requirement — bare type, narrow, no box
     terminal   the pending decision — wide, shallow, dashed, quiet */
export type FragmentRole = "anchor" | "principal" | "support" | "terminal";

export const HERO_FRAGMENTS: {
  stage: StageId;
  role: FragmentRole;
  kind: string;
  id?: string;
  title: string;
  detail?: string;
  state?: string;
  tone?: Tone;
  /** Left indent from the rail, in px, at desktop. */
  indent: number;
  /** Record width at desktop. */
  width: string;
  /** Present in the reduced three-fragment mobile composition. */
  mobile: boolean;
}[] = [
  {
    stage: "change",
    role: "anchor",
    kind: "Change",
    id: "#482",
    title: "Add fallback handling for failed discount-code retrieval",
    detail: "acme/redemption-api · fix/discount-code-retrieval-fallback · 4 files",
    state: "TESTS REQUIRED · RISK 46/100 MEDIUM",
    tone: "warning",
    indent: 0,
    width: "100%",
    mobile: true,
  },
  {
    stage: "observation",
    role: "support",
    kind: "Observation",
    id: "F1",
    title: "A retry can duplicate a redemption.",
    detail: "Rule detected · Reliability",
    state: "HIGH",
    tone: "danger",
    indent: 48,
    width: "62%",
    mobile: false,
  },
  {
    stage: "evidence",
    role: "principal",
    kind: "Evidence",
    id: "E1",
    title: "Retry path present; no idempotency guard observed.",
    detail: "app/services/redemption_service.py",
    state: "DIRECTLY OBSERVED",
    tone: "info",
    indent: 20,
    width: "82%",
    mobile: false,
  },
  {
    stage: "evidence",
    role: "principal",
    kind: "Missing proof",
    id: "E4",
    title: "No test proves a repeated attempt cannot issue a second code.",
    state: "MISSING · UNVERIFIED",
    tone: "warning",
    indent: 68,
    width: "76%",
    mobile: false,
  },
  {
    stage: "requirement",
    role: "support",
    kind: "Requirement",
    id: "C1",
    title: "Prove retries cannot issue duplicate discount codes.",
    detail: "1 of 4 open requirements",
    state: "OPEN · BLOCKING",
    tone: "warning",
    indent: 36,
    width: "66%",
    mobile: true,
  },
  {
    stage: "decision",
    role: "terminal",
    kind: "Human Decision",
    title: "No engineer decision recorded.",
    detail: "Open proof and requirements remain. Lintel does not decide.",
    state: "PENDING",
    tone: "neutral",
    indent: 8,
    width: "94%",
    mobile: true,
  },
];

const canonicalStages: LabStage[] = [
  {
    id: "change",
    label: "Change",
    definition: "What the pull request alters.",
    caption: "Four files. The redemption path and its partner client both move.",
    records: [
      {
        kind: "Changed files",
        title: "Redemption path and partner client",
        detail: "The fallback is added inside the redemption service and the partner code client.",
        state: "4 FILES",
        tone: "neutral",
        lines: [
          "app/services/redemption_service.py",
          "app/clients/partner_code_client.py",
          "app/api/redemptions.py",
          "tests/test_redemption_service.py",
        ],
      },
      {
        kind: "Review frame",
        title: "Standard readiness",
        detail: "Python · FastAPI · deterministic analysis, no configured model in this sample.",
        state: "PROFILE",
        tone: "neutral",
        meta: [
          { label: "Head", value: "a41c9e2" },
          { label: "Base", value: "main" },
        ],
      },
    ],
  },
  {
    id: "observation",
    label: "Observation",
    definition: "What Lintel found, with its origin labelled.",
    caption: "Three findings. One high, tied to the retry path.",
    records: [
      {
        id: "F1",
        kind: "Finding",
        title: "Retry behaviour may create duplicate redemption risk.",
        detail:
          "The redemption flow retries after failed discount-code retrieval, but no idempotency guard around repeated redemption attempts is observed.",
        state: "HIGH · RULE DETECTED",
        tone: "danger",
      },
      {
        id: "F2",
        kind: "Finding",
        title: "External provider failure states need fuller coverage.",
        detail: "Timeout, 5xx, malformed response and empty response cases need explicit tests.",
        state: "MEDIUM · RULE DETECTED",
        tone: "warning",
      },
      {
        id: "F3",
        kind: "Finding",
        title: "API error contract may be unclear for clients.",
        detail: "Failed discount-code retrieval needs a stable client-facing error shape.",
        state: "MEDIUM · RULE DETECTED",
        tone: "warning",
      },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    definition: "The record behind each observation.",
    caption: "One observed record supports F1. The proof that would close it is missing.",
    records: [
      {
        id: "E1",
        kind: "Evidence · supports F1",
        title: "Retry path present; no idempotency guard observed.",
        detail: "Read directly from the changed redemption service.",
        state: "DIRECTLY OBSERVED",
        tone: "info",
        lines: ["app/services/redemption_service.py"],
      },
      {
        id: "E4",
        kind: "Missing proof · blocks C1",
        title: "No test proves a repeated attempt cannot issue a second code.",
        detail: "Nothing in the changed test file exercises a repeated redemption after a provider timeout.",
        state: "MISSING · UNVERIFIED",
        tone: "warning",
      },
      {
        id: "E6",
        kind: "Inferred",
        title: "Provider unavailability is surfaced as a retryable response.",
        detail: "Inferred from the handler shape, not confirmed by a test.",
        state: "INFERRED",
        tone: "provenance",
      },
    ],
  },
  {
    id: "requirement",
    label: "Requirement",
    definition: "Unproved evidence, turned into an explicit condition before merge.",
    caption: "Four open. One blocking, tied directly to F1 and E4.",
    records: [
      {
        id: "C1",
        kind: "Requirement",
        title: "Prove retries cannot issue duplicate discount codes.",
        detail: "Satisfied by evidence a person supplies. Lintel does not clear its own requirements.",
        state: "OPEN · BLOCKING",
        tone: "warning",
      },
      {
        id: "C2",
        kind: "Requirement",
        title: "Add timeout, 5xx, malformed response and empty response tests.",
        state: "OPEN · BLOCKING",
        tone: "warning",
      },
      {
        id: "C3",
        kind: "Requirement",
        title: "Define a frontend-safe API error contract.",
        state: "OPEN · ADVISORY",
        tone: "neutral",
      },
      {
        id: "C4",
        kind: "Requirement",
        title: "Add structured logging for provider failure paths.",
        state: "OPEN · ADVISORY",
        tone: "neutral",
      },
    ],
  },
  {
    id: "decision",
    label: "Human Decision",
    definition: "The accountable engineer's recorded outcome.",
    caption: "Nothing is recorded. The recommendation is not an outcome.",
    records: [
      {
        kind: "Decision record",
        title: "No engineer decision recorded.",
        detail:
          "Lintel has produced a recommendation and a risk band. The accountable engineer records the decision, in the product — not here.",
        state: "PENDING",
        tone: "neutral",
        meta: [
          { label: "Outcome", value: "—" },
          { label: "Actor", value: "—" },
          { label: "Recorded", value: "—" },
          { label: "Applies to", value: "a41c9e2" },
        ],
      },
    ],
  },
];

const providerStages: LabStage[] = [
  {
    id: "change",
    label: "Change",
    definition: "What the pull request alters.",
    caption: "Two files. The provider client gains a retry budget.",
    records: [
      {
        kind: "Changed files",
        title: "Payment provider client",
        detail: "A retry budget and a circuit state are added to the outbound provider client.",
        state: "2 FILES",
        tone: "neutral",
        lines: ["app/clients/payment_provider.py", "app/api/charges.py"],
      },
    ],
  },
  {
    id: "observation",
    label: "Observation",
    definition: "What Lintel found, with its origin labelled.",
    caption: "Two findings. The failure class is different; the record structure is identical.",
    records: [
      {
        id: "F1",
        kind: "Finding",
        title: "Retry budget can exhaust before the provider recovers.",
        detail: "The budget is fixed and is not reset on a successful probe, so a slow recovery reads as a hard failure.",
        state: "MEDIUM · RULE DETECTED",
        tone: "warning",
      },
      {
        id: "F2",
        kind: "Finding",
        title: "Circuit state is not visible to callers.",
        detail: "A caller cannot distinguish an open circuit from a provider error.",
        state: "MEDIUM · RULE DETECTED",
        tone: "warning",
      },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    definition: "The record behind each observation.",
    caption: "The circuit is observed. Its recovery behaviour is not proved.",
    records: [
      {
        id: "E1",
        kind: "Evidence · supports F1",
        title: "Retry budget is decremented and never reset.",
        state: "DIRECTLY OBSERVED",
        tone: "info",
        lines: ["app/clients/payment_provider.py"],
      },
      {
        id: "E3",
        kind: "Missing proof · blocks C1",
        title: "No test exercises recovery after the budget is exhausted.",
        state: "MISSING · UNVERIFIED",
        tone: "warning",
      },
    ],
  },
  {
    id: "requirement",
    label: "Requirement",
    definition: "Unproved evidence, turned into an explicit condition before merge.",
    caption: "Three open. One blocking.",
    records: [
      {
        id: "C1",
        kind: "Requirement",
        title: "Prove the client recovers once the provider returns.",
        state: "OPEN · BLOCKING",
        tone: "warning",
      },
      {
        id: "C2",
        kind: "Requirement",
        title: "Expose an open circuit distinctly from a provider error.",
        state: "OPEN · ADVISORY",
        tone: "neutral",
      },
      {
        id: "C3",
        kind: "Requirement",
        title: "Record a detection signal for a sustained open circuit.",
        state: "OPEN · ADVISORY",
        tone: "neutral",
      },
    ],
  },
  {
    id: "decision",
    label: "Human Decision",
    definition: "The accountable engineer's recorded outcome.",
    caption: "Nothing is recorded.",
    records: [
      {
        kind: "Decision record",
        title: "No engineer decision recorded.",
        detail: "A different failure class reaches the same place: a person decides.",
        state: "PENDING",
        tone: "neutral",
        meta: [
          { label: "Outcome", value: "—" },
          { label: "Actor", value: "—" },
          { label: "Recorded", value: "—" },
          { label: "Applies to", value: "7c30b18" },
        ],
      },
    ],
  },
];

const readyStages: LabStage[] = [
  {
    id: "change",
    label: "Change",
    definition: "What the pull request alters.",
    caption: "Two files. A display-name normaliser and its tests.",
    records: [
      {
        kind: "Changed files",
        title: "Display-name normalisation",
        detail: "A pure formatting helper, changed together with its tests.",
        state: "2 FILES",
        tone: "neutral",
        lines: ["app/services/customer_names.py", "tests/test_customer_names.py"],
      },
    ],
  },
  {
    id: "observation",
    label: "Observation",
    definition: "What Lintel found, with its origin labelled.",
    caption: "No material issue. The record stays short — that is the restraint, not a guarantee.",
    records: [
      {
        kind: "Observation",
        title: "No material issue found.",
        detail:
          "The change is contained, has no external call and no side effect. Lintel keeps the record concise rather than manufacturing findings.",
        state: "NONE OPEN",
        tone: "success",
      },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    definition: "The record behind each observation.",
    caption: "The behaviour change is covered by the tests in the same change.",
    records: [
      {
        id: "E1",
        kind: "Evidence",
        title: "Each new formatting branch has a corresponding test.",
        state: "DIRECTLY OBSERVED",
        tone: "info",
        lines: ["tests/test_customer_names.py"],
      },
      {
        kind: "Evidence composition",
        title: "Observed 4 · Inferred 0 · Missing 0",
        detail: "Nothing in this change rests on an assumption Lintel could not read.",
        state: "PRESENT",
        tone: "success",
      },
    ],
  },
  {
    id: "requirement",
    label: "Requirement",
    definition: "Unproved evidence, turned into an explicit condition before merge.",
    caption: "None open, and none blocking.",
    records: [
      {
        kind: "Requirements",
        title: "No open requirement.",
        detail: "Nothing was left unproved, so nothing became a condition.",
        state: "NONE OPEN",
        tone: "success",
      },
    ],
  },
  {
    id: "decision",
    label: "Human Decision",
    definition: "The accountable engineer's recorded outcome.",
    caption: "Still pending. A favourable recommendation does not conclude anything.",
    records: [
      {
        kind: "Decision record",
        title: "No engineer decision recorded.",
        detail:
          "Lintel recommends approval and the risk is low. Nothing has been decided. There is no control here that would record a decision on your behalf.",
        state: "PENDING",
        tone: "neutral",
        meta: [
          { label: "Outcome", value: "—" },
          { label: "Actor", value: "—" },
          { label: "Recorded", value: "—" },
          { label: "Applies to", value: "d92f440" },
        ],
      },
    ],
  },
];

export const SCENARIOS: LabScenario[] = [
  {
    id: "missing-tests",
    label: "Missing tests",
    summary: "The default record: proof is missing, so requirements are open.",
    repository: "acme/redemption-api",
    pullRequest: "#482",
    branch: "fix/discount-code-retrieval-fallback",
    title: "Add fallback handling for failed discount-code retrieval",
    headSha: "a41c9e2",
    recommendation: "TESTS REQUIRED",
    recommendationTone: "warning",
    riskScore: 46,
    riskBand: "MEDIUM",
    openRequirements: 4,
    blockingRequirements: 2,
    missingProof: 1,
    decisionState: "pending",
    stages: canonicalStages,
  },
  {
    id: "provider-failure",
    label: "Provider failure",
    summary: "A different failure class. The same five stages hold.",
    repository: "acme/checkout-gateway",
    pullRequest: "#211",
    branch: "reliability/provider-retry-budget",
    title: "Add a retry budget to the payment provider client",
    headSha: "7c30b18",
    recommendation: "REVIEW REQUIRED",
    recommendationTone: "warning",
    riskScore: 58,
    riskBand: "MEDIUM",
    openRequirements: 3,
    blockingRequirements: 1,
    missingProof: 1,
    decisionState: "pending",
    stages: providerStages,
  },
  {
    id: "ready",
    label: "Ready for decision",
    summary: "A favourable recommendation. The decision is still not recorded.",
    repository: "acme/profile-api",
    pullRequest: "#118",
    branch: "chore/normalize-display-names",
    title: "Normalize customer display names",
    headSha: "d92f440",
    recommendation: "APPROVE",
    recommendationTone: "success",
    riskScore: 22,
    riskBand: "LOW",
    openRequirements: 0,
    blockingRequirements: 0,
    missingProof: 0,
    decisionState: "pending",
    stages: readyStages,
  },
];

/* Review evolution — two valid runs of the canonical scenario (R3B §7.6).

   The two heads reconcile exactly, and they reconcile with the theatre's
   requirement set (current open = C1 blocking, C2 blocking, C3, C4):

     open       4 − 2 cleared + 1 opened + 1 reopened = 4   (unchanged)
     blocking   1 + C1 reopened as blocking             = 2
     missing    2 − 2 cleared + 1 reopened              = 1

   The open count does not move while the record underneath it changes
   substantially. That is the section's argument, not a coincidence. */
export const EVOLUTION = {
  previous: {
    id: "previous" as const,
    label: "Previous head",
    sha: "9f2ad07",
    recorded: "Run 1",
    recommendation: "REVIEW REQUIRED",
    riskScore: 41,
    riskBand: "MEDIUM",
    openRequirements: 4,
    blockingRequirements: 1,
    missingProof: 2,
    decision: "No engineer decision recorded",
  },
  current: {
    id: "current" as const,
    label: "Current head",
    sha: "a41c9e2",
    recorded: "Run 2",
    recommendation: "TESTS REQUIRED",
    riskScore: 46,
    riskBand: "MEDIUM",
    openRequirements: 4,
    blockingRequirements: 2,
    missingProof: 1,
    decision: "No engineer decision recorded",
  },
  movements: [
    {
      mark: "cleared" as const,
      id: "C5",
      label: "Cleared",
      detail: "Redact partner identifiers from failure logs — proof supplied in this commit.",
    },
    {
      mark: "cleared" as const,
      id: "C6",
      label: "Cleared",
      detail: "Confirm the fallback cannot bypass the redemption ledger — now covered by a test.",
    },
    {
      mark: "opened" as const,
      id: "C4",
      label: "Opened",
      detail: "The new logging path has no structured failure context of its own.",
    },
    {
      mark: "reopened" as const,
      id: "C1",
      label: "Reopened",
      detail: "The idempotency guard was refactored, so its earlier proof no longer applies.",
    },
    {
      mark: "changed" as const,
      id: "E1",
      label: "Evidence changed",
      detail: "The retry path moved; the evidence was re-read against the new head.",
    },
  ],
};

/** GitHub workflow sequence (R3B §7.8) — implemented capabilities only. */
export const WORKFLOW_STEPS = [
  { id: "01", label: "Pull request", detail: "A pull request is opened or updated on an installed repository." },
  { id: "02", label: "Verified webhook", detail: "The raw body is verified with HMAC SHA-256 and a timing-safe comparison before anything is read." },
  { id: "03", label: "Deterministic analysis", detail: "The deterministic baseline runs first. It is the safety floor, not a degraded mode." },
  { id: "04", label: "Optional model context", detail: "A configured model can enrich the wording. On failure, timeout or invalid output the deterministic result is kept." },
  { id: "05", label: "One decision comment", detail: "A single comment per pull request, updated in place rather than appended to." },
];

/* R3C.1 — implemented capabilities compress to one mono register beneath the
   flow stem, and every "not implied" boundary consolidates into a single
   restrained note. No boundary was weakened; they simply stopped dominating
   the section. */
export const WORKFLOW_CAPABILITIES = [
  "GitHub App auth · short-lived JWTs",
  "installation tokens",
  "raw-body HMAC SHA-256",
  "timing-safe comparison",
  "idempotent ingestion",
  "deterministic fallback",
  "one updated comment",
  "server-side credentials",
];

export const WORKFLOW_BOUNDARY =
  "The GitHub App is real when configured, and not configured by default; its status is always shown where it is claimed. The GitHub Action is a separate blueprint, not a live connection, and the Slack handoff copies content rather than sending it. Lintel does not merge, enforce repository policy, install itself, or claim exact reproduction of optional model output.";

/* R3C.1 — the principle is stated first and short; the qualification that
   keeps it truthful follows as a quieter second line. Nothing accurate was
   dropped, but each principle now communicates before it documents. */
export const TRUST_PRINCIPLES = [
  {
    id: "01",
    title: "Deterministic by default",
    lead: "A deterministic analysis runs first and is the safety floor.",
    note: "Deterministic-only operation is first-class, not a degraded mode.",
  },
  {
    id: "02",
    title: "Optional model analysis",
    lead: "A configured model can enrich the analysis. It is optional, and off unless an operator supplies one.",
    note: "On failure, timeout or invalid output the deterministic result is retained. Model output cannot silently remove a known blocker or a required test.",
  },
  {
    id: "03",
    title: "Traceable results",
    lead: "Every finding shows its origin.",
    note: "Provenance distinguishes deterministic reproducibility from model traceability. Exact reproduction of stochastic model output is not claimed.",
  },
  {
    id: "04",
    title: "Explicit data boundaries",
    lead: "Review history is stored on the device by default, and raw diffs are excluded from it.",
    note: "Integration credentials stay server-side. This is an architecture characteristic, not a privacy, security or compliance guarantee.",
  },
];

export const AUDIENCE = [
  "Teams using coding agents to produce more software changes",
  "Engineers responsible for deciding what reaches production",
  "Organisations that need evidence and explicit requirements before merge",
];
