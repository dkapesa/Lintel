import {
  AFFECTED_CONTEXT_SUMMARY,
  AFFECTED_FILES,
  BLOCKING_REQUIREMENT,
  CANONICAL_REVIEW,
  DECISION_OUTCOMES,
  MISSING_PROOF_RECORDS,
  PRIMARY_EVIDENCE,
  PRIMARY_FINDING,
  READINESS,
  STALE_EVIDENCE,
} from "../../_public-r5-recalibrated/canonical-review";
import type { HumanDecisionOutcome } from "../../../lib/human-decision-ledger";
import type { ReadinessDeltaClassification } from "../../../lib/readiness-delta";

/* Provenance: README.md:132-180, 255-273; the accepted Phase 8D plan's copy
   direction is a procedural presentation of these repository claims. */
export const HOW_IT_WORKS_METADATA = {
  title: "How it works",
  description:
    "How a change becomes an accountable merge decision: deterministic analysis, findings connected to evidence, missing proof, requirements, readiness across commits, and the engineer's decision.",
} as const;

export const HOW_IT_WORKS_INTRODUCTION = {
  eyebrow: "How it works",
  title: "How a change becomes an accountable decision.",
  lead:
    "This is the path a pull request takes through Lintel — where the input comes from, what runs, what is recorded at each step, and where the engineer's authority sits. Every step below is shown against the same real review.",
  primaryAction: { label: "Open the sample review", href: "/workspace?source=fixture" },
  secondaryAction: { label: "Start a review", href: "/new" },
} as const;

/* Provenance: README.md:132-143,168-178,468;
   app/_public-r5-recalibrated/canonical-review.ts:26-43,228-237. */
export const STEP_01 = {
  index: "01",
  title: "A change enters Lintel.",
  body:
    "The input is the fixed sample review, a public GitHub pull request imported by URL, a pasted diff, or a verified GitHub App webhook delivery. The record starts with the change, its branch, head and affected files.",
  boundary: "Private repository import is not available through the public web flow.",
  entryPoints: [
    "Fixed sample review",
    "Public pull request URL",
    "Pasted diff",
    "Verified GitHub App webhook",
  ],
  change: CANONICAL_REVIEW,
  files: AFFECTED_FILES,
} as const;

/* Provenance: README.md:132-140,255-261; lib/change-passport.ts:122-180;
   docs/github-app-local-setup.md:145-181. */
export const STEP_02 = {
  index: "02",
  title: "Analysis runs, and declarations are collected.",
  body:
    "Deterministic checks run first and provide the baseline. Optional model-assisted synthesis runs only when configured; its output is validated against a typed structure, normalised and passed through guardrails. If it is absent or fails, Lintel returns deterministic output.",
  stages: [
    "Run deterministic checks",
    "Run optional configured model-assisted synthesis",
    "Validate typed structured output",
    "Normalise and apply guardrails",
    "Return deterministic output when model analysis is absent or fails",
    "Parse only a marked lintel-change-passport block when present",
    "Enforce field and size limits; safely ignore malformed JSON",
  ],
  passportBoundary:
    "A missing or malformed Change Passport does not fail analysis. What the builder declared is kept separate from what Lintel observed, and it is not promoted to evidence.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:47-87. */
export const STEP_03 = {
  index: "03",
  title: "A finding is raised.",
  body:
    "Lintel records a concrete risk, gap or review concern with severity, category, provenance and location. Next, the finding remains attached to the observed behaviour that raised it.",
  finding: PRIMARY_FINDING,
  boundary:
    "Provenance stays attached, so a rule-detected finding is never confused with a model-assisted one.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:112-169. */
export const STEP_04 = {
  index: "04",
  title: "The finding is connected to evidence.",
  body:
    "Each finding is bound to the records that support it. Next, each evidence record keeps its own statement, source and status visible.",
  evidence: PRIMARY_EVIDENCE,
  boundary: "Evidence supports or weakens a finding; it does not settle it.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:172-226. */
export const STEP_05 = {
  index: "05",
  title: "Missing proof is separated from evidence.",
  body:
    "Lintel separates proof that is absent, proof that exists but is unverified, and proof that has gone stale against the current head. Next, each gap can be connected to the requirement it affects.",
  records: [...MISSING_PROOF_RECORDS, STALE_EVIDENCE],
  boundary: "An absent test is recorded as an absence, not as a pass.",
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:242-283. */
export const STEP_06 = {
  index: "06",
  title: "Requirements define what must change.",
  body:
    "Important gaps become explicit requirements that can block readiness, each stating the evidence that would satisfy it. Next, affected context shows which other surfaces and concerns the change reaches.",
  requirement: BLOCKING_REQUIREMENT,
  affectedContext: AFFECTED_CONTEXT_SUMMARY,
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:297-312;
   lib/readiness-delta.ts:9; docs/github-app-local-setup.md:65-106. */
export const STEP_07 = {
  index: "07",
  title: "Readiness changes across commits.",
  body:
    "When the same pull request is analysed at a new head SHA, Lintel keeps the previous completed analysis and compares structured report fields: recommendation, score, risk level, merge conditions, findings and missing tests.",
  classifications: ["initial", "improved", "regressed", "mixed", "unchanged"] satisfies readonly ReadinessDeltaClassification[],
  readiness: READINESS,
  boundaries: [
    "The comparison is deterministic and field-based, with no fuzzy matching and no model-generated comparison text.",
    "It is implemented in the GitHub App persistence path.",
    "An improved score is not a clearance — the review is still blocked.",
  ],
} as const;

/* Provenance: app/_public-r5-recalibrated/canonical-review.ts:318-376;
   lib/human-decision-ledger.ts:21-43. */
export const STEP_08 = {
  index: "08",
  title: "The engineer records the Human Decision.",
  body:
    "The engineer chooses one of seven outcomes. The decision is recorded against a specific head SHA with the engineer's own reasoning, and Lintel records whether that decision aligned with or diverged from its recommendation.",
  outcomes: DECISION_OUTCOMES satisfies readonly {
    recordKey: HumanDecisionOutcome;
    label: string;
    meaning: string;
  }[],
  boundaries: [
    "Lintel never converts a recommendation into a decision, and no outcome is selected on this page.",
    "The decision ledger is stored in the browser locally.",
  ],
} as const;

/* Provenance: README.md:158-177; docs/github-app-local-setup.md:43-63,306-314. */
export const STEP_09 = {
  index: "09",
  title: "The result returns to the existing workflow.",
  body:
    "The record can return as a markdown summary or, through the GitHub App prototype, as one pull-request conversation comment carrying the recommendation, risk, head SHA, top blockers, missing tests, conditions before merge, reviewer focus and next action.",
  handoffs: [
    "Markdown summary of the structured record",
    "One pull-request conversation comment created once and updated in place through its marker",
  ],
  boundaries: [
    "The GitHub App is a prototype using local filesystem persistence.",
    "Lintel does not block merging and does not post inline comments.",
    "Slack handoff is export-only.",
  ],
} as const;

/* Provenance: README.md:460-480. */
export const HOW_IT_WORKS_CLOSING = {
  title: "What this model does not do.",
  body:
    "Lintel can miss or misclassify engineering risk. Reports support engineering judgment and do not prove that a pull request is safe. The product does not replace tests, continuous integration, static analysis, security review or human code review, and it does not execute test suites or perform full static analysis.",
  action: { label: "Open the sample review", href: "/workspace?source=fixture" },
} as const;

export const HOW_IT_WORKS_STEPS = [
  STEP_01,
  STEP_02,
  STEP_03,
  STEP_04,
  STEP_05,
  STEP_06,
  STEP_07,
  STEP_08,
  STEP_09,
] as const;
