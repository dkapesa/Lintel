import {
  CANONICAL_REVIEW,
  DECISION_OUTCOMES,
  MISSING_PROOF_RECORDS,
  PRIMARY_EVIDENCE,
  PRIMARY_FINDING,
  QUEUE_CONTEXT_ROWS,
  READINESS,
  STALE_EVIDENCE,
} from "../../_public-r5-recalibrated/canonical-review";
import type {
  ChangePassportCompleteness,
  DeclarationState,
} from "../../../lib/change-passport";
import type { EvidenceClass } from "../../../lib/evidence-hierarchy";
import type { HumanDecisionOutcome } from "../../../lib/human-decision-ledger";
import type {
  ReadinessDeltaClassification,
  ReviewDiffStatus,
} from "../../../lib/readiness-delta";

/* Provenance: README.md:132-180, 255-269, 460-480; the accepted Phase 8D
   plan's copy direction is a bounded presentation of those repository claims. */
export const PRODUCT_METADATA = {
  title: "Product",
  description:
    "What Lintel presents across a complete verification record: findings with provenance, missing proof, merge requirements, readiness movement and the boundary between a recommendation and a Human Decision.",
} as const;

export const PRODUCT_INTRODUCTION = {
  eyebrow: "Product",
  title: "Engineering verification for the changes you have to merge.",
  lead:
    "Lintel takes a change — written by an engineer, by an agent, or by both — and produces a structured record of what it found, what supports that, what proof is missing, and what must be true before the change can progress.",
  primaryAction: { label: "Open the sample review", href: "/workspace?source=fixture" },
  secondaryAction: { label: "How it works", href: "/how-it-works" },
} as const;

/* Provenance: README.md:132-140, 255-261, 480. */
export const ANALYSIS_SOURCE_CONTENT = {
  title: "Deterministic analysis first. Model assistance is optional.",
  body:
    "Deterministic checks provide the baseline and do not require model access. When model configuration is absent or model analysis fails, Lintel returns deterministic output rather than failing silently. Model-assisted synthesis is optional, environment-configured, structurally constrained and identified wherever it contributed.",
  limitation:
    "Model-assisted analysis depends on the configured provider and may send submitted content outside the local application.",
  sources: [
    { label: "Deterministic", detail: "Baseline analysis; model access is not required." },
    { label: "Model-assisted", detail: "Optional, configured and explicitly identified." },
  ],
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:26-43. */
export const CHANGE_SUMMARY = {
  title: "One change becomes one record.",
  facts: [
    { label: "Repository", value: CANONICAL_REVIEW.repository, identifier: true },
    { label: "Pull request", value: CANONICAL_REVIEW.pullRequestLabel, identifier: true },
    { label: "Title", value: CANONICAL_REVIEW.title, identifier: false },
    { label: "Branch", value: CANONICAL_REVIEW.branch, identifier: true },
    { label: "Head", value: CANONICAL_REVIEW.headSha, identifier: true },
    { label: "Recommendation", value: CANONICAL_REVIEW.recommendation, identifier: false },
    { label: "Risk", value: CANONICAL_REVIEW.riskLabel, identifier: false },
    { label: "Requirements", value: CANONICAL_REVIEW.requirementsSummary, identifier: false },
    { label: "Human Decision", value: CANONICAL_REVIEW.humanDecision, identifier: false },
  ],
  caption: "Read-only sample. It does not change PR #482.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:47-87, 112-169,
   191-226, 272-283. */
export const EVIDENCE_MODEL_CONTENT = {
  title: "Change, finding, evidence, missing proof, requirement, decision.",
  relations: [
    { label: "Change", value: CANONICAL_REVIEW.reviewKey, relation: "raises" },
    { label: "Finding", value: PRIMARY_FINDING.recordKey, relation: "is supported by" },
    {
      label: "Evidence",
      value: PRIMARY_FINDING.supportingEvidence.map((item) => item.recordKey).join(" · "),
      relation: "exposes",
    },
    { label: "Missing proof", value: MISSING_PROOF_RECORDS[0].recordKey, relation: "creates" },
    { label: "Requirement", value: PRIMARY_FINDING.relatedRequirement.recordKey, relation: "awaits" },
    { label: "Human Decision", value: CANONICAL_REVIEW.humanDecision, relation: "accountable engineer" },
  ],
  boundary:
    "Nothing in the chain is inferred from the step before it; each record carries its own provenance.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:91-111;
   README.md:234-251. */
export const REVIEW_QUEUE_CONTENT = {
  title: "Reviews stay inspectable.",
  body:
    "Each analysed change is a record with its own recommendation and risk, and can be re-entered.",
  rows: QUEUE_CONTEXT_ROWS,
  boundary:
    "Review state is stored locally in the browser or in the local GitHub App store; there is no shared team database and no organisation-wide view.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:47-87, 112-169;
   lib/evidence-hierarchy.ts:9-24, 78-95; docs/github-app-local-setup.md:183-195. */
export const EVIDENCE_CONTENT = {
  title: "A finding is only as strong as what supports it.",
  finding: PRIMARY_FINDING,
  evidence: PRIMARY_EVIDENCE,
  evidenceClasses: [
    "externally-verified",
    "directly-observed",
    "human-confirmed",
    "builder-declared",
    "model-inferred",
    "assumption",
    "unknown",
  ] satisfies readonly EvidenceClass[],
  evidenceClassLabels: [
    "Externally verified",
    "Directly observed",
    "Human confirmed",
    "Builder declared",
    "Model inferred",
    "Assumption",
    "Unknown",
  ],
  boundary:
    "The hierarchy describes provenance strength; it does not prove a conclusion, clear a merge condition or change the recommendation.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:172-226. */
export const MISSING_PROOF_CONTENT = {
  title: "What is missing is recorded as explicitly as what is present.",
  records: [...MISSING_PROOF_RECORDS, STALE_EVIDENCE],
  boundary:
    "A requirement states what must be proven, and the evidence that would satisfy it.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:297-312. */
export const READINESS_CONTENT = {
  title: "Readiness is a state, not a verdict.",
  record: READINESS,
  recommendation: CANONICAL_REVIEW.recommendation,
  boundary: "Readiness summarises the record; it does not decide.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:297-312;
   lib/readiness-delta.ts:9,68; docs/github-app-local-setup.md:65-106. */
export const READINESS_MOVEMENT_CONTENT = {
  title: "Readiness moves, and the movement is recorded.",
  delta: {
    classification: READINESS.classification satisfies ReadinessDeltaClassification,
    previousScore: READINESS.previousScore,
    currentScore: READINESS.currentScore,
    scoreChange: READINESS.scoreChange,
    cleared: "Two blocking requirements cleared",
    stale: "One latency requirement became stale",
  },
  diffObjectClasses: [
    "Findings",
    "Evidence signals",
    "Missing or suggested tests",
    "Merge conditions",
  ],
  diffStatuses: ["added", "cleared", "changed", "unchanged", "reopened"] satisfies readonly ReviewDiffStatus[],
  persistenceBoundary:
    "Readiness Delta and Review Diff are implemented in the GitHub App persistence path.",
  diffBoundary:
    "The Review Diff is not a source-code diff — it compares structured report fields, never patch hunks, line-level changes or model-generated comparison text.",
} as const;

/* Provenance: lib/change-passport.ts:8-44, 122-180, 217-231;
   docs/github-app-local-setup.md:145-181. The excerpt is the repository's
   documented explanatory example and is not attributed to PR #482. */
export const PASSPORT_CONTENT = {
  title: "What was declared, and what was verified.",
  body:
    "When a pull-request description carries a fenced lintel-change-passport block, Lintel reads the declared producer type, task intent, claimed tests, claimed validation, assumptions, constraints, known limitations and unresolved uncertainty, then compares those declarations against its own structured signals.",
  optionalBoundary:
    "A Change Passport is optional, and absent is a first-class completeness state. Producer type is declared, never detected.",
  unverifiedBoundary:
    "Unverified means Lintel could not independently match the declaration; it does not mean false, wrong or failed.",
  scoringBoundary:
    "Passport claims do not alter readiness scoring, recommendations, blockers or merge conditions.",
  canonical: {
    completeness: "absent" satisfies ChangePassportCompleteness,
    statement: "PR #482 contains no Change Passport.",
    concernBoundary:
      "Every canonical concern shown for PR #482 is observed but undeclared.",
    concerns: [
      PRIMARY_FINDING.title,
      MISSING_PROOF_RECORDS[0].title,
      MISSING_PROOF_RECORDS[1].title,
    ],
  },
  exampleLabel: "Explanatory example — not PR #482",
  exampleExcerpt: `\`\`\`lintel-change-passport
{
  "producerType": "agent",
  "taskIntent": "Prevent duplicate refund creation",
  "claimedTests": [
    "npm test -- refund-service"
  ],
  "unresolvedUncertainty": [
    "A timeout may follow provider acceptance."
  ]
}
\`\`\``,
  vocabulary: [
    {
      state: "supported" satisfies DeclarationState,
      label: "supported",
      detail: "A declaration Lintel independently matched.",
    },
    {
      state: "unverified" satisfies DeclarationState,
      label: "unverified",
      detail: "A declaration retained as builder context but not independently matched.",
    },
    {
      state: "observed but undeclared" satisfies DeclarationState,
      label: "observed but undeclared",
      detail: "A concern Lintel observed without a corresponding builder declaration.",
    },
    {
      state: "declared" satisfies DeclarationState,
      label: "declared uncertainty",
      detail: "Unresolved uncertainty explicitly declared by the builder.",
    },
  ],
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:318-376;
   lib/human-decision-ledger.ts:21-43; README.md:158-166,267-269. */
export const DECISION_CONTENT = {
  title: "Lintel recommends. The accountable engineer decides.",
  body:
    "The Case File keeps the recommendation, decision history and accountable engineer's outcome together without turning one into the other.",
  outcomes: DECISION_OUTCOMES satisfies readonly {
    recordKey: HumanDecisionOutcome;
    label: string;
    meaning: string;
  }[],
  currentState:
    "No Human Decision has been recorded for this review, and Lintel does not select one.",
  headBoundary:
    "A recorded decision applies to a specific head SHA. When the head moves, the earlier decision is marked as predating the current head rather than silently carried forward.",
  storageBoundary: "Decision history is stored in the browser locally.",
} as const;

/* Provenance: docs/github-app-local-setup.md:43-63,306-314; README.md:168-178. */
export const GITHUB_WORKFLOW_CONTENT = {
  title: "From a completed analysis to the pull request.",
  steps: [
    "Validate X-Hub-Signature-256 before parsing JSON.",
    "Normalise only the minimal event envelope.",
    "Deduplicate by X-GitHub-Delivery.",
    "Store safe processing state in the local GitHub App store.",
    "Use a short-lived installation token server-side.",
    "Fetch pull-request metadata and diff.",
    "Run the existing deterministic readiness generator.",
    "Store the completed report.",
    "Create or update one pull-request conversation comment marked with <!-- lintel:merge-readiness -->.",
  ],
  boundaries: [
    "The GitHub App is an environment-configured prototype using local filesystem persistence.",
    "Lintel does not block merging by default and does not post inline comments.",
    "Lintel never edits or deletes comments that do not carry its marker.",
    "Raw webhook payloads, installation tokens and raw diffs are not persisted.",
  ],
} as const;

/* Provenance: README.md:251,460-480; accepted Phase 8A contract
   docs/r5/R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT.md:486-515. */
export const AVAILABILITY_CONTENT = {
  title: "How Lintel runs today.",
  sentences: [
    "Lintel runs locally from this repository.",
    "There is no hosted service and no account.",
  ],
  trustPointer:
    "The complete availability and provenance statement is owned by the Trust route, which is not yet available.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:26-43;
   README.md:127-128. */
export const PRODUCT_CLOSING = {
  title: "Look at the record yourself.",
  body: "The sample is read-only and does not change PR #482.",
  action: { label: "Open the sample review", href: "/workspace?source=fixture" },
} as const;
