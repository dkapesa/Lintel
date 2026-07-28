export type WorkspaceMode = "overview" | "change" | "evidence" | "requirements" | "history";

export type ReviewGroup = "Needs attention" | "In review" | "Ready" | "Reviewed";

export type Recommendation = "TESTS REQUIRED" | "REVIEW REQUIRED" | "APPROVE" | "BLOCKED";

export type RiskBand = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReviewFixture = {
  id: string;
  repository: string;
  pr: number;
  title: string;
  group: ReviewGroup;
  recommendation: Recommendation;
  riskScore: number;
  riskBand: RiskBand;
  openRequirements: number;
  blockingRequirements: number;
  movement: "regressed" | "mixed" | "unavailable" | "unchanged" | "improved";
  decision: "PENDING" | "APPROVE" | "STALE" | "WITHDRAWN" | "SUPERSEDED" | "UNBOUND";
  owner?: string;
  updated: string;
  runId: string;
  head?: string;
};

export type FindingRecord = {
  id: string;
  title: string;
  statement: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  provenance: "Rule detected" | "Model assisted" | "Baseline preserved";
  blocking: boolean;
  relationshipIds: string[];
};

export type EvidenceRecord = {
  id: string;
  title: string;
  statement: string;
  evidenceClass:
    | "externally verified"
    | "directly observed"
    | "human confirmed"
    | "builder declared"
    | "model inferred"
    | "assumption"
    | "unknown";
  status: "present" | "missing" | "unverified" | "confirmed" | "stale" | "not applicable";
  source: string;
  runId: string;
  head?: string;
  relationshipIds: string[];
};

export type MissingProofRecord = {
  id: string;
  title: string;
  sought: string;
  why: string;
  state: "missing" | "unverified" | "stale";
  importance: "blocking" | "advisory";
  nextAction: string;
  relationshipIds: string[];
};

export type RequirementRecord = {
  id: string;
  title: string;
  statement: string;
  status: "open" | "reopened" | "cleared" | "stale" | "unavailable";
  importance: "blocking" | "advisory";
  requiredProof: string;
  capability: "condition" | "derived";
  conditionKey?: string;
  taskStatus: "Open" | "In progress" | "Done" | "Not needed";
  relationshipIds: string[];
  activeByDefault: boolean;
};

export type ChangeRecord = {
  id: string;
  kind: "file" | "surface";
  path: string;
  additions?: number;
  deletions?: number;
  risk?: RiskBand;
  contextAvailable: boolean;
  relationshipIds: string[];
};

export type RunRecord = {
  id: string;
  head?: string;
  base?: string;
  source: "deterministic" | "model-assisted" | "fallback" | "historical-schema";
  recordedAt: string;
  reproducibility: "exact" | "traceable" | "historical" | "unavailable";
  resultFingerprint: string;
  configurationFingerprint: string;
  limitation: string;
};

export type RecordKind = "finding" | "evidence" | "proof" | "requirement" | "change" | "run" | "readiness" | "diff";

export type SelectedObject = { kind: RecordKind; id: string } | null;

export type RelationshipState = "Direct" | "Unavailable" | "Unresolved" | "None recorded";

export type RelationshipEdge = {
  from: string;
  to: string;
  state: RelationshipState;
  reason?: string;
};

export type DecisionOutcome =
  | "approve"
  | "approve-with-accepted-risk"
  | "tests-required"
  | "review-required"
  | "request-changes"
  | "blocked"
  | "defer";

export type DecisionTransaction =
  | "pristine"
  | "empty-rationale"
  | "valid"
  | "accepted-risk-no-reference"
  | "accepted-risk-unacknowledged"
  | "blocker-acknowledgement"
  | "missing-head-acknowledgement"
  | "enabled"
  | "discard-warning"
  | "saving"
  | "validation-error"
  | "head-conflict"
  | "decision-conflict"
  | "storage-failure"
  | "readback-mismatch"
  | "duplicate"
  | "success";

export type LayoutPreset =
  | "default"
  | "queue-collapsed"
  | "inspector-collapsed"
  | "both-collapsed"
  | "focus"
  | "narrow"
  | "tablet"
  | "mobile-list"
  | "mobile-review"
  | "mobile-record"
  | "mobile-decision";

export type FixtureVariant =
  | "canonical"
  | "partial"
  | "empty"
  | "unavailable"
  | "initial"
  | "invalid-history"
  | "stale-decision"
  | "unbound-decision"
  | "reopened-requirement"
  | "advisory-requirement"
  | "cleared-requirement"
  | "stale-requirement"
  | "unavailable-requirement"
  | "stress"
  | "github-connected"
  | "github-unavailable";

export type LabStateDefinition = {
  slug: string;
  label: string;
  category: "Atlas" | "Supplementary" | "Decision" | "Capability" | "Stress";
  mode?: WorkspaceMode;
  selected?: SelectedObject;
  layout?: LayoutPreset;
  variant?: FixtureVariant;
  modal?: boolean;
  outcome?: DecisionOutcome;
  transaction?: DecisionTransaction;
  inspectorOpen?: boolean;
  queueGroupCollapsed?: boolean;
  filtersSelectedOut?: boolean;
  focusedControl?: "queue-selected" | "queue-unselected" | "workspace-record" | "mode";
};
