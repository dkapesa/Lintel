/* R1B.0 — Production Workspace V2 · serialisable view-model contracts.

   This module is the production home for the Workspace V2 view model. It is a
   pure, serialisable type surface plus a small set of static label maps — no
   React, no DOM, no `localStorage`, no API calls, no import of any production
   persistence, ledger or domain module. Everything declared here is designed
   to cross the server → client boundary as plain data.

   Provenance is explicit (`WorkspaceProvenance.source`). The UI must not infer
   whether a snapshot came from the R1B.0 fixture adapter or a future R1B.1
   real adapter beyond that field — both produce the same shapes.

   Truthfulness rules baked into the types:
     · unknown / absent values are modelled explicitly (`| null`, discriminated
       unions) rather than as empty strings;
     · the Human Decision projection distinguishes absent (A) from unavailable
       (I) — never collapse them (r0b2 §24.13);
     · no finding→evidence / finding→requirement relationship is asserted that
       the source cannot support (r1a §16.10); reference id arrays may be empty
       and render as explicitly empty.

   The primitive unions below are transcribed to stay value-identical with the
   verified production sources named in r1a §2.5 / r0b2 §2. R1B.1 replaces the
   fixture adapter with a real adapter that maps `lib/*` domain types onto
   these same view models; a compile-time parity guard belongs to that step. */

/* --- Primitive unions (production-parity) ----------------------------- */

export type Recommendation = "APPROVE" | "REVIEW_REQUIRED" | "TESTS_REQUIRED" | "BLOCK";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ReviewStatus =
  | "Needs work"
  | "Tests requested"
  | "Review required"
  | "Blocked"
  | "Ready to merge"
  | "Reviewed"
  | "Archived";

export type EvidenceClass =
  | "externally-verified"
  | "directly-observed"
  | "human-confirmed"
  | "builder-declared"
  | "model-inferred"
  | "assumption"
  | "unknown";

export type EvidenceStatus =
  | "present"
  | "missing"
  | "unverified"
  | "confirmed"
  | "stale"
  | "not-applicable";

export type RequirementStatus =
  | "open"
  | "satisfied"
  | "accepted"
  | "invalidated"
  | "superseded"
  | "stale"
  | "unavailable";

export type RequirementImportance = "blocking" | "advisory";

export type ReadinessClassification =
  | "initial"
  | "improved"
  | "regressed"
  | "mixed"
  | "unchanged";

export type FindingProvenance = "Rule detected" | "Model assisted" | "Baseline preserved";

export type FindingCategory =
  | "Security"
  | "Reliability"
  | "Maintainability"
  | "Missing tests"
  | "API contract";

/* Semantic tone key. Maps to CSS classes in the presentation layer only;
   final palette calibration is deferred to R1C. */
export type ToneKey = "success" | "warning" | "danger" | "information" | "muted" | "provenance";

/* --- Evidence Spine — canonical visible stage chain ------------------- */

export type StageId = "change" | "observation" | "evidence" | "requirement" | "decision";

export type StageState = "complete" | "current" | "attention" | "pending";

export type StageDefinition = {
  id: StageId;
  label: string;
  domId: string;
  /* The decision stage terminates at the Decision Plate rather than at a
     scrollable canvas section. */
  terminal?: boolean;
};

export const WORKSPACE_V2_STAGES: StageDefinition[] = [
  { id: "change", label: "Change", domId: "wsv2-stage-change" },
  { id: "observation", label: "Observation", domId: "wsv2-stage-observation" },
  { id: "evidence", label: "Evidence", domId: "wsv2-stage-evidence" },
  { id: "requirement", label: "Requirement", domId: "wsv2-stage-requirement" },
  { id: "decision", label: "Human decision", domId: "wsv2-decision-plate", terminal: true },
];

/* --- Focus model ------------------------------------------------------ */

export type ArtifactKind = "finding" | "evidence" | "requirement";

export type ArtifactRef = {
  kind: ArtifactKind;
  id: string;
};

/* --- Artifact view models --------------------------------------------- */

export type ChangedFileView = {
  path: string;
  /* Line counts and per-file risk are optional on the canonical Report and
     absent on many real reports. Absence is modelled as null and rendered as
     unknown — never invented as a zero count or a fabricated risk band
     (r1a §7 "missing counts render as unknown, not 0"). */
  additions: number | null;
  deletions: number | null;
  risk: RiskLevel | null;
};

export type FindingView = {
  findingId: string;
  severity: FindingSeverity;
  title: string;
  statement: string;
  action: string;
  file: string;
  provenance: FindingProvenance;
  category: FindingCategory;
  /* Derived edges. Empty is a truthful "no known link" — never fabricated. */
  supportingEvidenceIds: string[];
  relatedRequirementIds: string[];
};

export type EvidenceView = {
  evidenceId: string;
  title: string;
  statement: string;
  evidenceClass: EvidenceClass;
  status: EvidenceStatus;
  provenance: string;
  source: string;
  observedAt: string;
  stale: boolean;
  supportsFindingIds: string[];
};

export type RequirementView = {
  requirementId: string;
  title: string;
  statement: string;
  importance: RequirementImportance;
  status: RequirementStatus;
  evidenceRequired: string;
  supportingEvidenceIds: string[];
  stale: boolean;
};

export type ReadinessView = {
  classification: ReadinessClassification;
  previousScore: number;
  currentScore: number;
  scoreChange: number;
  previousRecommendation: Recommendation;
  currentRecommendation: Recommendation;
  clearedCount: number;
  openedCount: number;
  becameStaleCount: number;
  note: string;
};

/* Readiness movement is subordinate context and may not be derivable for a
   first-analysed head; absence is explicit rather than a zeroed record. */
export type ReadinessProjection =
  | { available: true; readiness: ReadinessView }
  | { available: false; reason: string };

export type CaseContextView = {
  summary: string;
  reviewerFocus: string[];
  limitations: string[];
};

export type EvidenceComposition = {
  strong: number;
  inferred: number;
  incomplete: number;
  stale: number;
  total: number;
};

/* --- Human Decision projection (r0b2) --------------------------------- */

export type DecisionOutcome =
  | "approve"
  | "approve-with-accepted-risk"
  | "tests-required"
  | "review-required"
  | "request-changes"
  | "blocked"
  | "defer";

/* Live top-level applicability set (r0b2 §24.7). `partially-applicable`
   (deferred) and `superseded` (lineage-only) are intentionally excluded. */
export type DecisionApplicability =
  | "applicable"
  | "predates-current-head"
  | "withdrawn"
  | "unavailable";

export type DecisionDivergence =
  | "aligned"
  | "human-more-conservative"
  | "human-accepted-additional-risk"
  | "materially-different";

export type DecisionActorSource = "local" | "github" | "imported" | "unknown";

export type DecisionActor = {
  displayLabel: string;
  source: DecisionActorSource;
  role: string | null;
};

export type DecisionReferenceKind = "clause" | "assumption" | "evidence";

export type DecisionReference = {
  id: string;
  kind: DecisionReferenceKind;
  label: string;
  /* false → the reference can no longer be resolved. Never dropped. */
  available: boolean;
  stale: boolean;
  modelAssisted: boolean;
};

/* Discriminated on `status` so absent (A) is never confused with unavailable
   (I), and a recorded decision always carries its applicability and actor. */
export type DecisionPlateViewModel =
  | DecisionEmptyView
  | DecisionUnavailableView
  | DecisionRecordedView;

/* State A — read succeeded, ledger genuinely empty. */
export type DecisionEmptyView = {
  status: "empty";
  recommendation: Recommendation;
  openBlockingRequirements: number;
  isSample: boolean;
};

/* State I — read / projection failure, distinct from A (r0b2 §24.13). */
export type DecisionUnavailableView = {
  status: "unavailable";
  readError: string;
  isSample: boolean;
};

/* States B / C (and, when supplied, H) — a resting recorded decision. */
export type DecisionRecordedView = {
  status: "recorded";
  outcome: DecisionOutcome;
  actor: DecisionActor;
  recordedAt: string;
  applicability: DecisionApplicability;
  applicableHeadSha: string | null;
  currentHeadSha: string | null;
  priorHeadSha: string | null;
  /* Only present when a Report is available (r0b2 §24.15); otherwise null. */
  divergence: DecisionDivergence | null;
  rationale: string | null;
  references: DecisionReference[];
  acceptedRiskReferences: DecisionReference[];
  needsReaffirmation: boolean;
  isSample: boolean;
};

/* Compact queue marker — shown only when a decision is genuinely recorded
   (r0b2 §15). Absent / unavailable decisions never render a marker. */
export type DecisionMarker =
  | { kind: "none" }
  | { kind: "recorded"; outcome: DecisionOutcome; needsReaffirmation: boolean; isSample: boolean };

/* --- Queue ------------------------------------------------------------ */

/* Production operational groups (r1a §16.5). All four are first-class; an
   empty group carries zero cases and is simply not rendered. */
export type QueueGroupId = "attention" | "review" | "ready" | "reviewed";

export type QueueCaseSummary = {
  caseId: string;
  pullRequestNumber: number;
  title: string;
  repository: string;
  recommendation: Recommendation;
  riskLevel: RiskLevel;
  groupId: QueueGroupId;
  reviewStatus: ReviewStatus;
  decisionMarker: DecisionMarker;
  /* Explicit unknown rather than an empty string. */
  currentHeadSha: string | null;
  /* Restrained disambiguation token, set (R1B.2) only when a PR has more than
     one case in the queue — the short head SHA when known, otherwise the
     analysis date. Absent (null) for singleton PRs so the row stays compact and
     the Queue never becomes an activity feed (r1b2 queue restraint). */
  provenanceHint?: string | null;
};

export type QueueGroup = {
  id: QueueGroupId;
  label: string;
  cases: QueueCaseSummary[];
};

/* --- Case detail ------------------------------------------------------ */

export type CaseGitHubContext = {
  repository: string;
  pullRequestNumber: number;
  branch: string;
  /* Explicit unknown; stale detection is disabled when head is not recorded. */
  headSha: string | null;
  author: string;
  updatedAt: string;
};

export type CaseDetail = {
  caseId: string;
  github: CaseGitHubContext;
  recommendation: Recommendation;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: Confidence;
  reviewStatus: ReviewStatus;
  executiveSummary: string;
  changedFiles: ChangedFileView[];
  findings: FindingView[];
  evidence: EvidenceView[];
  requirements: RequirementView[];
  readiness: ReadinessProjection;
  decision: DecisionPlateViewModel;
  context: CaseContextView;
};

/* --- Inspector projection (peer modes, r0b2 §14) ---------------------- */

export type InspectorProjection =
  | {
      mode: "case-context";
      title: string;
      context: CaseContextView;
      composition: EvidenceComposition;
      headSha: string | null;
      updatedAt: string;
    }
  | { mode: "finding"; finding: FindingView }
  | { mode: "evidence"; evidence: EvidenceView }
  | { mode: "requirement"; requirement: RequirementView }
  | { mode: "decision-context"; decision: DecisionPlateViewModel; caseTitle: string };

/* --- Workspace snapshot ----------------------------------------------- */

export type WorkspaceScenario = "default" | "empty" | "unavailable" | "loading";

export type WorkspaceProvenance = {
  /* The one field the UI may read to know its data origin. */
  source: "sample-fixture" | "live";
  isSample: boolean;
  label: string;
  scenario: WorkspaceScenario;
};

export type WorkspaceIdentity = {
  workspaceId: string;
  repository: string;
  label: string;
};

/* Discriminated on `status`. `ready` carries the full workstation; the other
   three are restrained shell states that still preserve plane geometry. */
export type WorkspaceSnapshot =
  | WorkspaceReadySnapshot
  | WorkspaceEmptySnapshot
  | WorkspaceUnavailableSnapshot
  | WorkspaceLoadingSnapshot;

export type WorkspaceReadySnapshot = {
  status: "ready";
  identity: WorkspaceIdentity;
  provenance: WorkspaceProvenance;
  groups: QueueGroup[];
  cases: CaseDetail[];
  defaultCaseId: string;
  /* Restrained, truthful limitations about how the queue was projected — e.g.
     that some stored reports could not be read and are omitted (R1B.2 partial
     history). Empty / absent means every stored, in-window report is shown. The
     queue never silently claims completeness. */
  limitations?: string[];
};

export type WorkspaceEmptySnapshot = {
  status: "empty";
  identity: WorkspaceIdentity;
  provenance: WorkspaceProvenance;
};

export type WorkspaceUnavailableSnapshot = {
  status: "unavailable";
  identity: WorkspaceIdentity;
  provenance: WorkspaceProvenance;
  reason: string;
};

export type WorkspaceLoadingSnapshot = {
  status: "loading";
  identity: WorkspaceIdentity;
  provenance: WorkspaceProvenance;
};

/* --- Static label maps ------------------------------------------------ */

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  APPROVE: "Approve",
  REVIEW_REQUIRED: "Review required",
  TESTS_REQUIRED: "Tests required",
  BLOCK: "Block",
};

export const OUTCOME_LABEL: Record<DecisionOutcome, string> = {
  approve: "Approve",
  "approve-with-accepted-risk": "Approve with accepted risk",
  "tests-required": "Tests required",
  "review-required": "Review required",
  "request-changes": "Request changes",
  blocked: "Blocked",
  defer: "Defer decision",
};

export const APPLICABILITY_LABEL: Record<DecisionApplicability, string> = {
  applicable: "Applies to current head",
  "predates-current-head": "Predates current head",
  withdrawn: "Withdrawn",
  unavailable: "Unavailable",
};

export const DIVERGENCE_LABEL: Record<DecisionDivergence, string> = {
  aligned: "Matches Lintel",
  "human-more-conservative": "More conservative",
  "human-accepted-additional-risk": "Accepted risk",
  "materially-different": "Differs from Lintel",
};

export const DIVERGENCE_MEANING: Record<DecisionDivergence, string> = {
  aligned: "Human decision matches the recommendation.",
  "human-more-conservative": "Engineer chose a stricter outcome than Lintel.",
  "human-accepted-additional-risk": "Engineer accepted referenced risks Lintel flagged.",
  "materially-different": "Human outcome differs materially from the recommendation.",
};
