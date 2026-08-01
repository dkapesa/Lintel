/* R5C — single content source and single canonical-facts source for the
   private public visual laboratory, per R5B_LANDING_PAGE_ARCHITECTURE.md
   §19f. Every eyebrow, headline, supporting paragraph, caption and action
   label below is copied verbatim from the accepted R5B working copy.

   One deviation from the R5B working copy is recorded here: R5B's own
   working text for the Missing proof and requirements requirement used the
   placeholder title "Prove merge condition". The accepted R5B1 scene
   (public/r5/scenes/requirement-continuation.png) shows the frozen
   product's actual requirement title, "Idempotency proven under retry".
   Per R5B1_SCENE_RESOLUTION_ADDENDUM.md's authority order, frozen product
   truth outranks the architecture's working copy for product-scene detail,
   so that title is used here instead. See docs/r5/R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md. */

export const SAMPLE_REVIEW_HREF = "/workspace?source=fixture";
export const NEW_REVIEW_HREF = "/new";

export const NAV_LINKS = [
  { label: "Product", href: "#investigation-workspace" },
  { label: "How it works", href: "#verification-model" },
  { label: "Security", href: "#trust-architecture" },
] as const;

export const TRUST_LINE = "Deterministic by default. Model assistance is optional. The engineer decides.";

export const CANONICAL = {
  repoAndPr: "example/b2b-redemption-api · PR #482",
  title: "Add fallback handling for failed discount-code retrieval",
  selectedReview: "SELECTED REVIEW · READ-ONLY SAMPLE",
  fixtureSource: "SAMPLE FIXTURE DATA · EXPLICIT FIXTURE",
  recommendation: "Tests required",
  risk: "46/100 MEDIUM",
  confidence: "MEDIUM",
  requirements: "4 open · 2 blocking",
  humanDecision: "Human Decision pending",
  nextInspection: "Provider failure cases absent from test suite",
  primaryFinding: "01 HIGH · PRIMARY FINDING Retry behaviour may create duplicate redemption risk",
  evidenceBoundary: "5 canonical evidence records. 2 missing or unverified; 1 stale.",
  readinessBlocked: "Merge readiness blocked",
  readinessBreakdown: "2 blockers · 2 missing/unverified · 1 stale",
  decisionContext: "Review decision context · Human Decision pending",
  head: "9c41af2",
  branch: "fix/discount-code-retrieval-fallback",
  requirementTitle: "Idempotency proven under retry",
  requirementState: "blocking · open",
} as const;

export const HERO = {
  eyebrow: "01 · ONE REVIEW",
  headline: "Know what is ready to merge.",
  supporting:
    "Lintel connects a change to its findings, its evidence, its missing proof and its open requirements, so an engineer can judge readiness and record an accountable decision.",
  sceneAlt:
    "Lintel Workspace showing PR #482, Add fallback handling for failed discount-code retrieval, with the Review Queue open and PR #482 selected. The four-cell summary band reads Tests required, 46/100 MEDIUM, 4 open · 2 blocking, Human Decision pending. The primary finding, evidence boundary and bottom readiness bar are visible; the Contextual Inspector is closed.",
};

export const PROBLEM = {
  eyebrow: "02 · THE PROBLEM",
  headline: "Changes arrive faster than proof does.",
  supporting:
    "More changes are produced by more people and more tools, and each still needs someone to establish what is verified and what is not. Reading the change is only the start. The harder work is reconstructing what is known, what is assumed and what still needs proof.",
  nextInspectionAlt:
    "The Workspace's Next inspection banner: Provider failure cases absent from test suite. Why: this derived missing or unverified proof blocks 1 requirement and is not current verified evidence.",
  evidenceBoundaryAlt:
    "The Workspace's Proof cell: Evidence boundary, 5 canonical evidence records, 2 missing or unverified, 1 stale.",
};

export const MODEL = {
  eyebrow: "03 · THE VERIFICATION MODEL",
  headline: "Eight stages structure the review.",
  supporting:
    "A change can produce findings. Canonical evidence supports or weakens them. Missing or unverified evidence is shown as missing proof. Blocking gaps can surface requirements. Requirements and affected context inform readiness. The accountable engineer retains the Human Decision.",
  orientationLabel: "RELATIONSHIP ORIENTATION",
  mapLabel: "Review Map",
  orientationCaveat:
    "Stage order is orientation only. The active relationship records below are the only asserted edges; no link is inferred from visual proximity.",
  stages: [
    { no: "01", name: "Change", body: "What was changed, with its branch, head and files." },
    { no: "02", name: "Finding", body: "What in that change may matter, with severity and provenance." },
    { no: "03", name: "Evidence", body: "Canonical records that support or weaken the finding." },
    { no: "04", name: "Missing proof", body: "Where canonical evidence is missing, unverified or stale." },
    { no: "05", name: "Requirement", body: "What must be proven before the change can progress." },
    { no: "06", name: "Affected context", body: "The surfaces and concerns the change reaches." },
    { no: "07", name: "Readiness", body: "The current blocking state of the review." },
    { no: "08", name: "Human Decision", body: "The outcome reserved for the accountable engineer." },
  ],
  insetCaption: "Review Map, Case File · the eight stages in the product's own orientation record.",
  insetAlt:
    "A crop of the Case File's Review Map showing the RELATIONSHIP ORIENTATION label, the Review Map title, the complete orientation caveat, and the stage column headers 01 Change through 08 Human Decision.",
};

export const WORKSPACE = {
  eyebrow: "04 · THE INVESTIGATION WORKSPACE",
  headline: "One place to investigate the whole review.",
  supporting:
    "The Workspace holds the change, the findings, the evidence and the requirements as one record. The Contextual Inspector answers the question you are holding without losing the review you are in, so an investigation can be sustained across findings instead of restarted at every tab.",
  caption: "The Workspace with the Contextual Inspector open and the Review Queue closed.",
  sceneAlt:
    "The same Lintel Workspace record for PR #482 with the Review Queue closed and the Contextual Inspector open on the right. The Inspector header reads Decision readiness · not a decision, with rows for Lintel recommendation, open blockers, missing or unverified proof, stale evidence, current run, current head, prior Human Decision and what changed. The provenance line reads Head 9c41af2, Branch fix/discount-code-retrieval-fallback.",
};

export const EVIDENCE = {
  eyebrow: "05 · MISSING PROOF",
  headline: "What is not proven is stated, not assumed.",
  supporting:
    "The retry path is observed. The idempotency guard is not. Lintel keeps findings, canonical evidence and derived missing or unverified proof as distinct records, so the gap between what is observed and what is confirmed stays visible. A blocking gap can surface an open requirement.",
  evidenceSceneAlt:
    "The Workspace's Evidence tab for the primary finding, Retry behaviour may create duplicate redemption risk, HIGH severity, Reliability. Supporting evidence: Retry path observed in redemption service, confirmed, and No idempotency key present on redemption write, present. A derived missing-or-unverified-proof block reads Repeated retry after provider timeout does not issue duplicate discount codes, derived from canonical evidence status: missing, derived · not persisted.",
  requirementSceneAlt:
    "The Workspace's Requirements tab with the linked requirement selected: Idempotency proven under retry, blocking · open. The Contextual Inspector shows the requirement definition, its required proof, and that it is contributed to by the primary finding.",
  requirementCaption:
    "A second, genuine Workspace state: the linked requirement, Idempotency proven under retry, blocking and open.",
};

export const READINESS = {
  eyebrow: "06 · READINESS",
  headline: "Lintel recommends. The accountable engineer decides.",
  supporting:
    "Readiness summarises what still blocks the change. It is not an approval and it is not a score to be overridden quietly. When the engineer opens the decision surface, no outcome is selected from Lintel's recommendation, and a rationale is required before anything is recorded.",
  sceneAlt:
    "The Workspace's read-only Preview decision flow open over the dimmed record. The four-cell summary band and the readiness bar, Merge readiness blocked, are visible behind it. The dialog is titled Accountable engineer action, Preview decision flow, and states Lintel recommends. The accountable engineer decides. An explicit read-only sample warning is shown. Outcome is required and no outcome is selected from Lintel's recommendation; all seven outcomes — Approve, Approve with accepted risk, Tests required, Review required, Request changes, Blocked, Defer decision — are visibly unselected. A Cancel action and a disabled read-only submit action are visible at the foot of the dialog.",
};

export const TRUST = {
  eyebrow: "07 · ARCHITECTURE",
  headline: "Deterministic first. Model assistance stays optional.",
  supporting:
    "Deterministic analysis provides the baseline through explicit, traceable rules. Model assistance is optional and identified in provenance when used; it does not select or record the Human Decision. Reports created through supported browser based review flows may be stored in the current browser. The public sample performs no external write, and the environment shown states each handoff capability explicitly.",
  statements: [
    {
      no: "01",
      title: "Deterministic analysis",
      body: "Deterministic analysis provides the baseline through explicit, traceable rules.",
    },
    {
      no: "02",
      title: "Optional model assistance",
      body: "Model assistance is optional and must be identified in provenance when used. It may contribute within the implemented analysis contract. It does not select or record the Human Decision.",
    },
    {
      no: "03",
      title: "Canonical report",
      body: "Each supported analysis creates a canonical report record, with its run, head and branch recorded when available.",
      provenance: "Run Not recorded · Head 9c41af2 · Branch fix/discount-code-retrieval-fallback",
    },
    {
      no: "04",
      title: "Evidence and requirements",
      body: "Canonical evidence is stored. Missing or unverified proof is derived from canonical evidence status and is marked Derived · not persisted. Derived requirements remain read-only. The record does not blur what is stored and what is derived.",
    },
    {
      no: "05",
      title: "Human Decision",
      body: "Lintel recommends. The accountable engineer decides. No outcome is selected from the recommendation, and a rationale is required before an outcome is recorded.",
    },
    {
      no: "06",
      title: "Explicit handoff",
      body: "In the public sample and environment shown, handoff capability is explicit and user initiated. The product states its current integration positions.",
    },
    {
      no: "07",
      title: "Sample and browser storage",
      body: "The homepage scenario is an explicit read only fixture. It is not itself a browser stored report. Reports created through supported browser based review flows may be stored in the current browser, shown by the product as Local report · stored on this device and Browser-local · maximum 10, subject to that bounded history limit.",
    },
    {
      no: "08",
      title: "No external write from the public sample",
      body: "The public sample performs no external write. In the environment shown, GitHub App is not configured, GitHub Action is a blueprint, and Slack handoff is export-only. This describes the sample and the environment shown, not every configured integration.",
    },
  ],
  insetCaption:
    "The Contextual Inspector's own Decision readiness · not a decision boundary, shown against its GitHub App, GitHub Action and Slack handoff rows.",
  insetAlt:
    "A crop of the Contextual Inspector's integration rows: GitHub App, not configured, implemented capability is not configured for this environment; GitHub Action, blueprint, does not install, execute, connect or post; Slack handoff, export-only, copies or downloads, it does not send.",
};

export const FINAL = {
  eyebrow: "08 · CONTINUE",
  headline: "Inspect the review for yourself.",
  supporting: "The case remains unresolved. Open the read only sample to follow its evidence, or start a review with your own change.",
  sceneAlt:
    "A closing record line for the same review: example/b2b-redemption-api · PR #482, Add fallback handling for failed discount-code retrieval, marked SELECTED REVIEW · READ-ONLY SAMPLE, with the four-cell band Tests required, 46/100 MEDIUM, 4 open · 2 blocking, Human Decision pending.",
};

export const ACTIONS = {
  primary: "Open the sample review",
  secondary: "Start a review",
} as const;

export const FOOTER = {
  brandLine: "Engineering verification for pull requests. Lintel recommends; the accountable engineer decides.",
  legal: "© Lintel",
  storageLine: "Review history is stored on your device by default.",
};

export const MOBILE_SCENES = {
  heroQueueAlt:
    "The mobile Review Queue with PR #482 in Needs attention, showing Tests required, Medium 46, 2 blocking, 4 open, improved.",
  workspaceRecordAlt:
    "The mobile finding record for PR #482: Finding · High, Retry behaviour may create duplicate redemption risk, Category Reliability, Provenance Rule detected, Current applicability Current projection · 9c41af2, Affected surface app/services/redemption_service.py:118.",
  evidenceRecordAlt:
    "The same mobile finding record, scrolled to Supporting evidence, supported by · 2 direct, Explicit stored relationship, and the Requirements heading that follows it.",
  finalQueueAlt:
    "A closing crop of the mobile Review Queue showing the PR #482 row, Tests required, Medium 46, 2 blocking, 4 open.",
};
