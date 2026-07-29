/* R4F.3 — deterministic, read-only operational projection.

   Real mode delegates the entire browser-local read to the canonical real
   Workspace adapter. That keeps report validation, canonical evidence and
   requirement construction, run comparison, condition progress, partial
   history, and Human Decision applicability aligned with Workspace and Case
   File. This module only projects those already-resolved records into bounded
   cross-review operational facts. It never writes storage.

   Primary-group precedence is deliberately separate from cross-cutting Views:
     1. Stale Human Decision — a recorded decision is not applicable now.
     2. Reviewed — a recorded decision is applicable to the current head.
     3. Needs attention — blockers, proof gaps, stale proof/requirements,
        attention recommendations, fallback/failed analysis, or unavailable
        decision authority exist.
     4. Ready for assessment — a current canonical case remains with none of
        the preceding states and no applicable Human Decision.

   A record can therefore appear in more than one cross-cutting View while it
   has exactly one primary group. For example, an already-reviewed record can
   still appear in Needs attention if its current canonical facts contain a
   blocker. View counts are computed with the same predicates as result sets. */

import { createFixtureWorkspaceAdapter } from "./workspace-v2/fixture-adapter";
import { createRealWorkspaceAdapter } from "./workspace-v2/real-adapter";
import {
  APPLICABILITY_LABEL,
  OUTCOME_LABEL,
  RECOMMENDATION_LABEL,
  type CaseDetail,
  type DecisionApplicability,
  type DecisionOutcome,
  type Recommendation,
  type RiskLevel,
  type WorkspaceReadySnapshot,
} from "./workspace-v2/view-model";

export const OPERATIONAL_VIEW_IDS = [
  "all",
  "needs-attention",
  "ready-for-assessment",
  "reviewed",
  "stale-decision",
  "missing-proof",
  "recently-changed",
] as const;

export type OperationalViewId = (typeof OPERATIONAL_VIEW_IDS)[number];

export const OPERATIONAL_VIEW_LABEL: Record<OperationalViewId, string> = {
  all: "All reviews",
  "needs-attention": "Needs attention",
  "ready-for-assessment": "Ready for assessment",
  reviewed: "Reviewed",
  "stale-decision": "Stale Human Decision",
  "missing-proof": "Missing proof",
  "recently-changed": "Recently changed",
};

export type OperationalPrimaryGroup =
  | "stale-decision"
  | "reviewed"
  | "needs-attention"
  | "ready-for-assessment";

export const OPERATIONAL_PRIMARY_GROUP_LABEL: Record<OperationalPrimaryGroup, string> = {
  "stale-decision": "Stale Human Decision",
  reviewed: "Reviewed",
  "needs-attention": "Needs attention",
  "ready-for-assessment": "Ready for assessment",
};

export type OperationalDecisionState =
  | {
      kind: "none";
      label: "No Human Decision";
      outcome: null;
      applicability: null;
      recordedAt: null;
      acceptedRisk: false;
    }
  | {
      kind: "unavailable";
      label: "Human Decision unavailable";
      outcome: null;
      applicability: "unavailable";
      recordedAt: null;
      acceptedRisk: false;
    }
  | {
      kind: "applicable" | "stale";
      label: string;
      outcome: DecisionOutcome;
      applicability: DecisionApplicability;
      recordedAt: string;
      acceptedRisk: boolean;
    };

export type OperationalSource =
  | "github-app"
  | "github-pr"
  | "manual"
  | "historical"
  | "demo";

export type OperationalAnalysis =
  | "deterministic"
  | "model"
  | "fallback"
  | "failed"
  | "historical"
  | "demo";

export type OperationalReviewRecord = {
  reportId: string;
  caseId: string;
  title: string;
  repository: string;
  pullRequestNumber: number | null;
  recommendation: Recommendation;
  recommendationLabel: string;
  riskLevel: RiskLevel;
  riskScore: number;
  blockerCount: number;
  missingProofCount: number;
  staleEvidenceCount: number;
  staleRequirementCount: number;
  decision: OperationalDecisionState;
  primaryGroup: OperationalPrimaryGroup;
  attentionReasons: string[];
  runId: string | null;
  headSha: string | null;
  baseSha: string | null;
  source: OperationalSource;
  sourceLabel: string;
  analysis: OperationalAnalysis;
  analysisLabel: string;
  createdAt: string;
  updatedAt: string;
  changeSummary: string | null;
  changeAt: string | null;
  workspaceHref: string | null;
  caseFileHref: string | null;
  searchText: string;
};

export type OperationalProjectionStatus = "empty" | "ready" | "unavailable";
export type OperationalProjectionMode = "local" | "demo";
export type OperationalDemoMode = "none" | "records" | "empty";

export type OperationalReviewProjection = {
  status: OperationalProjectionStatus;
  mode: OperationalProjectionMode;
  records: OperationalReviewRecord[];
  limitations: string[];
  unavailableReason: string | null;
};

type DemoMetadata = {
  recordedAt: string;
  runId: string;
  baseSha: string;
  source: Exclude<OperationalSource, "historical">;
  analysis: Exclude<OperationalAnalysis, "historical" | "failed">;
  changeSummary: string | null;
};

/* Fixed metadata belongs only to explicit ?demo=1. It supplies deterministic
   screenshot ordering and never enters browser storage or real counts. */
const DEMO_METADATA: Record<string, DemoMetadata> = {
  "case-489": {
    recordedAt: "2026-07-29T10:58:00.000Z",
    runId: "demo_run_489_02",
    baseSha: "e11877a",
    source: "demo",
    analysis: "demo",
    changeSummary: "Fixture comparison: blocking credential-cache requirement opened in the newest sample run.",
  },
  "case-482": {
    recordedAt: "2026-07-29T09:42:00.000Z",
    runId: "demo_run_482_03",
    baseSha: "a291d87",
    source: "demo",
    analysis: "demo",
    changeSummary: "Fixture comparison: recommendation changed to Tests required after missing retry proof was recorded.",
  },
  "case-476": {
    recordedAt: "2026-07-29T08:15:00.000Z",
    runId: "demo_run_476_04",
    baseSha: "d840a0c",
    source: "demo",
    analysis: "demo",
    changeSummary: "Fixture comparison: the recorded Human Decision no longer applies to the sample head.",
  },
  "case-471": {
    recordedAt: "2026-07-28T16:04:00.000Z",
    runId: "demo_run_471_02",
    baseSha: "15a072c",
    source: "demo",
    analysis: "demo",
    changeSummary: "Fixture comparison: the final open sample requirement cleared.",
  },
};

const DEMO_READY_RECORD: OperationalReviewRecord = {
  reportId: "demo-ready-505",
  caseId: "demo-ready-505",
  title: "Add typed retry envelope to webhook delivery",
  repository: "example/event-relay",
  pullRequestNumber: 505,
  recommendation: "APPROVE",
  recommendationLabel: "Approve",
  riskLevel: "LOW",
  riskScore: 14,
  blockerCount: 0,
  missingProofCount: 0,
  staleEvidenceCount: 0,
  staleRequirementCount: 0,
  decision: {
    kind: "none",
    label: "No Human Decision",
    outcome: null,
    applicability: null,
    recordedAt: null,
    acceptedRisk: false,
  },
  primaryGroup: "ready-for-assessment",
  attentionReasons: [],
  runId: "demo_run_505_01",
  headSha: "c3a9e74",
  baseSha: "7725b10",
  source: "demo",
  sourceLabel: "Controlled sample fixture",
  analysis: "demo",
  analysisLabel: "Demonstration",
  createdAt: "2026-07-27T14:20:00.000Z",
  updatedAt: "2026-07-27T14:20:00.000Z",
  changeSummary: null,
  changeAt: null,
  workspaceHref: null,
  caseFileHref: null,
  searchText: [
    "Add typed retry envelope to webhook delivery",
    "example/event-relay",
    "505",
    "demo-ready-505",
    "demo_run_505_01",
    "c3a9e74",
    "Approve",
    "No Human Decision",
  ].join("\n").toLocaleLowerCase("en-GB"),
};

function reportIdFromCaseId(caseId: string): string {
  return caseId.startsWith("report-") ? caseId.slice("report-".length) : caseId;
}

function validTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  return Number.isNaN(Date.parse(value)) ? null : value;
}

function latestTimestamp(values: Array<string | null | undefined>, fallback: string): string {
  const valid = values
    .map(validTimestamp)
    .filter((value): value is string => value !== null)
    .sort((left, right) => Date.parse(right) - Date.parse(left));
  return valid[0] ?? fallback;
}

function decisionFor(detail: CaseDetail): OperationalDecisionState {
  if (detail.decision.status === "empty") {
    return {
      kind: "none",
      label: "No Human Decision",
      outcome: null,
      applicability: null,
      recordedAt: null,
      acceptedRisk: false,
    };
  }
  if (detail.decision.status === "unavailable") {
    return {
      kind: "unavailable",
      label: "Human Decision unavailable",
      outcome: null,
      applicability: "unavailable",
      recordedAt: null,
      acceptedRisk: false,
    };
  }

  const applicable =
    detail.decision.applicability === "applicable" && !detail.decision.needsReaffirmation;
  const outcome = OUTCOME_LABEL[detail.decision.outcome];
  const applicability = APPLICABILITY_LABEL[detail.decision.applicability];
  return {
    kind: applicable ? "applicable" : "stale",
    label: applicable ? outcome : `${outcome} · ${applicability}`,
    outcome: detail.decision.outcome,
    applicability: detail.decision.applicability,
    recordedAt: detail.decision.recordedAt,
    acceptedRisk: detail.decision.outcome === "approve-with-accepted-risk",
  };
}

function sourceFor(detail: CaseDetail, demo: DemoMetadata | null): {
  source: OperationalSource;
  sourceLabel: string;
  analysis: OperationalAnalysis;
  analysisLabel: string;
} {
  if (demo) {
    return {
      source: demo.source,
      sourceLabel: "Controlled sample fixture",
      analysis: demo.analysis,
      analysisLabel: "Demonstration",
    };
  }
  const run = detail.run;
  if (!run) {
    return {
      source: "historical",
      sourceLabel: "Historical report",
      analysis: "historical",
      analysisLabel: "Run manifest unavailable",
    };
  }

  const source: OperationalSource =
    run.sourceType === "github-app"
      ? "github-app"
      : run.sourceType === "github-pr"
        ? "github-pr"
        : run.sourceType === "manual"
          ? "manual"
          : "historical";
  const sourceLabel =
    source === "github-app"
      ? "GitHub App"
      : source === "github-pr"
        ? "GitHub PR import"
        : source === "manual"
          ? "Manual input"
          : "Historical report";

  const failed = run.reproducibility === "failed";
  const analysis: OperationalAnalysis = failed ? "failed" : run.analysisSource;
  const analysisLabel =
    analysis === "model"
      ? "Model-assisted"
      : analysis === "fallback"
        ? "Deterministic fallback"
        : analysis === "failed"
          ? "Analysis failed"
          : analysis === "demo"
            ? "Demonstration"
            : "Deterministic";
  return { source, sourceLabel, analysis, analysisLabel };
}

function changeFor(detail: CaseDetail, decision: OperationalDecisionState): {
  summary: string | null;
  changedAt: string | null;
} {
  if (!detail.history || detail.history.status !== "comparison") {
    return { summary: null, changedAt: null };
  }

  const facts: string[] = [];
  const readiness = detail.history.readiness;
  if (readiness.previousRecommendation !== readiness.currentRecommendation) {
    facts.push(
      `Recommendation ${RECOMMENDATION_LABEL[readiness.previousRecommendation]} → ${RECOMMENDATION_LABEL[readiness.currentRecommendation]}`,
    );
  }
  if (readiness.previousScore !== readiness.currentScore) {
    facts.push(`risk ${readiness.previousScore} → ${readiness.currentScore}`);
  }

  const reopened = detail.history.changes.filter((item) => item.status === "reopened").length;
  const cleared = detail.history.changes.filter((item) => item.status === "cleared").length;
  const opened = detail.history.changes.filter((item) => item.status === "added").length;
  if (reopened > 0) facts.push(`${reopened} record${reopened === 1 ? "" : "s"} reopened`);
  if (cleared > 0) facts.push(`${cleared} record${cleared === 1 ? "" : "s"} cleared`);
  if (opened > 0) facts.push(`${opened} record${opened === 1 ? "" : "s"} opened`);
  if (readiness.becameStaleCount > 0) {
    facts.push(`${readiness.becameStaleCount} evidence record${readiness.becameStaleCount === 1 ? "" : "s"} became stale`);
  }
  if (decision.kind === "stale") facts.push("Human Decision requires reassessment");
  if (facts.length === 0) {
    facts.push(`New canonical run ${detail.history.current.runId} recorded`);
  }
  return {
    summary: facts.slice(0, 3).join(" · "),
    changedAt:
      validTimestamp(detail.history.current.completedAt) ??
      validTimestamp(detail.history.current.createdAt),
  };
}

function classify(input: {
  decision: OperationalDecisionState;
  attentionReasons: string[];
}): OperationalPrimaryGroup {
  if (input.decision.kind === "stale") return "stale-decision";
  if (input.decision.kind === "applicable") return "reviewed";
  if (input.attentionReasons.length > 0) return "needs-attention";
  return "ready-for-assessment";
}

function recordFromCase(
  detail: CaseDetail,
  title: string,
  mode: OperationalProjectionMode,
): OperationalReviewRecord {
  const demo = mode === "demo" ? DEMO_METADATA[detail.caseId] ?? null : null;
  const reportId = reportIdFromCaseId(detail.caseId);
  const createdAt =
    demo?.recordedAt ??
    validTimestamp(detail.run?.completedAt) ??
    validTimestamp(detail.run?.createdAt) ??
    validTimestamp(reportId) ??
    "1970-01-01T00:00:00.000Z";
  const decision = decisionFor(detail);
  const blockerCount = detail.requirements.filter(
    (item) => item.importance === "blocking" && item.status === "open",
  ).length;
  const missingProofCount = detail.evidence.filter(
    (item) => item.status === "missing" || item.status === "unverified",
  ).length;
  const staleEvidenceCount = detail.evidence.filter(
    (item) => item.stale || item.status === "stale",
  ).length;
  const staleRequirementCount = detail.requirements.filter(
    (item) => item.stale || item.status === "stale" || item.status === "unavailable",
  ).length;
  const source = sourceFor(detail, demo);
  const attentionReasons: string[] = [];
  if (detail.recommendation === "BLOCK") attentionReasons.push("Blocking recommendation");
  if (detail.recommendation === "TESTS_REQUIRED") attentionReasons.push("Tests required");
  if (detail.recommendation === "REVIEW_REQUIRED") attentionReasons.push("Review required");
  if (blockerCount > 0) {
    attentionReasons.push(`${blockerCount} open blocking requirement${blockerCount === 1 ? "" : "s"}`);
  }
  if (missingProofCount > 0) {
    attentionReasons.push(`${missingProofCount} missing or unverified proof record${missingProofCount === 1 ? "" : "s"}`);
  }
  if (staleEvidenceCount > 0) {
    attentionReasons.push(`${staleEvidenceCount} stale evidence record${staleEvidenceCount === 1 ? "" : "s"}`);
  }
  if (staleRequirementCount > 0) {
    attentionReasons.push(`${staleRequirementCount} stale or unavailable requirement${staleRequirementCount === 1 ? "" : "s"}`);
  }
  if (source.analysis === "fallback") attentionReasons.push("Analysis used a deterministic fallback");
  if (source.analysis === "failed") attentionReasons.push("Analysis run failed");
  if (decision.kind === "stale") attentionReasons.push("Human Decision is not currently applicable");
  if (decision.kind === "unavailable") attentionReasons.push("Human Decision authority is unavailable");

  const change = demo
    ? { summary: demo.changeSummary, changedAt: demo.changeSummary ? demo.recordedAt : null }
    : changeFor(detail, decision);
  const updatedAt = latestTimestamp(
    [createdAt, detail.run?.completedAt, decision.recordedAt, change.changedAt],
    createdAt,
  );
  const primaryGroup = classify({ decision, attentionReasons });
  const pullRequestNumber =
    Number.isFinite(detail.github.pullRequestNumber) && detail.github.pullRequestNumber > 0
      ? detail.github.pullRequestNumber
      : null;
  const runId = demo?.runId ?? detail.run?.runId ?? null;
  const headSha = detail.github.headSha;
  const baseSha = demo?.baseSha ?? detail.run?.baseSha ?? null;
  const workspaceHref =
    mode === "local" ? `/workspace?reportId=${encodeURIComponent(reportId)}` : null;
  const caseFileHref =
    mode === "local" ? `/report?reportId=${encodeURIComponent(reportId)}` : null;
  const searchable = [
    title,
    detail.github.repository,
    pullRequestNumber ? String(pullRequestNumber) : "",
    reportId,
    runId ?? "",
    headSha ?? "",
    RECOMMENDATION_LABEL[detail.recommendation],
    decision.label,
  ].join("\n").toLocaleLowerCase("en-GB");

  return {
    reportId,
    caseId: detail.caseId,
    title: title.trim() || "Untitled review",
    repository: detail.github.repository.trim() || "Repository unavailable",
    pullRequestNumber,
    recommendation: detail.recommendation,
    recommendationLabel: RECOMMENDATION_LABEL[detail.recommendation],
    riskLevel: detail.riskLevel,
    riskScore: detail.riskScore,
    blockerCount,
    missingProofCount,
    staleEvidenceCount,
    staleRequirementCount,
    decision,
    primaryGroup,
    attentionReasons,
    runId,
    headSha,
    baseSha,
    source: source.source,
    sourceLabel: source.sourceLabel,
    analysis: source.analysis,
    analysisLabel: source.analysisLabel,
    createdAt,
    updatedAt,
    changeSummary: change.summary,
    changeAt: change.changedAt,
    workspaceHref,
    caseFileHref,
    searchText: searchable,
  };
}

function recordsFromSnapshot(
  snapshot: WorkspaceReadySnapshot,
  mode: OperationalProjectionMode,
): OperationalReviewRecord[] {
  const titles = new Map(
    snapshot.groups.flatMap((group) =>
      group.cases.map((item) => [item.caseId, item.title] as const),
    ),
  );
  return snapshot.cases
    .map((detail) => recordFromCase(detail, titles.get(detail.caseId) ?? detail.github.branch, mode))
    .concat(mode === "demo" ? [DEMO_READY_RECORD] : [])
    .sort(compareOperationalRecords("recent"));
}

export async function readOperationalReviewProjection(
  storage: Storage,
  demoMode: OperationalDemoMode = "none",
): Promise<OperationalReviewProjection> {
  const mode: OperationalProjectionMode = demoMode === "none" ? "local" : "demo";
  const adapter =
    mode === "demo" ? createFixtureWorkspaceAdapter() : createRealWorkspaceAdapter(storage);
  const snapshot = await adapter.loadSnapshot({
    scenario: demoMode === "empty" ? "empty" : "default",
  });

  if (snapshot.status === "empty") {
    return {
      status: "empty",
      mode,
      records: [],
      limitations: [],
      unavailableReason: null,
    };
  }
  if (snapshot.status === "unavailable") {
    return {
      status: "unavailable",
      mode,
      records: [],
      limitations: [],
      unavailableReason: snapshot.reason,
    };
  }
  if (snapshot.status !== "ready") {
    return {
      status: "unavailable",
      mode,
      records: [],
      limitations: [],
      unavailableReason: "The operational projection did not resolve to a current record set.",
    };
  }
  return {
    status: "ready",
    mode,
    records: recordsFromSnapshot(snapshot, mode),
    limitations: snapshot.limitations ?? [],
    unavailableReason: null,
  };
}

export function recordMatchesOperationalView(
  record: OperationalReviewRecord,
  view: OperationalViewId,
): boolean {
  switch (view) {
    case "all":
      return true;
    case "needs-attention":
      return record.attentionReasons.length > 0;
    case "ready-for-assessment":
      return record.primaryGroup === "ready-for-assessment";
    case "reviewed":
      return record.decision.kind === "applicable";
    case "stale-decision":
      return record.decision.kind === "stale";
    case "missing-proof":
      return record.missingProofCount > 0;
    case "recently-changed":
      return record.changeSummary !== null;
  }
}

export function operationalViewCounts(
  records: OperationalReviewRecord[],
): Record<OperationalViewId, number> {
  return Object.fromEntries(
    OPERATIONAL_VIEW_IDS.map((view) => [
      view,
      records.filter((record) => recordMatchesOperationalView(record, view)).length,
    ]),
  ) as Record<OperationalViewId, number>;
}

export type OperationalSortId =
  | "recent"
  | "oldest"
  | "risk-high"
  | "risk-low"
  | "blockers"
  | "title"
  | "repository"
  | "decision";

const RISK_RANK: Record<RiskLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const DECISION_RANK: Record<OperationalDecisionState["kind"], number> = {
  stale: 0,
  unavailable: 1,
  none: 2,
  applicable: 3,
};

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function textCompare(left: string, right: string): number {
  return left.localeCompare(right, "en-GB", { sensitivity: "base", numeric: true });
}

export function compareOperationalRecords(
  sort: OperationalSortId,
): (left: OperationalReviewRecord, right: OperationalReviewRecord) => number {
  return (left, right) => {
    let result = 0;
    switch (sort) {
      case "recent":
        result = timestamp(right.updatedAt) - timestamp(left.updatedAt);
        break;
      case "oldest":
        result = timestamp(left.updatedAt) - timestamp(right.updatedAt);
        break;
      case "risk-high":
        result = RISK_RANK[right.riskLevel] - RISK_RANK[left.riskLevel];
        break;
      case "risk-low":
        result = RISK_RANK[left.riskLevel] - RISK_RANK[right.riskLevel];
        break;
      case "blockers":
        result =
          right.blockerCount - left.blockerCount ||
          right.missingProofCount - left.missingProofCount;
        break;
      case "title":
        result = textCompare(left.title, right.title);
        break;
      case "repository":
        result =
          textCompare(left.repository, right.repository) ||
          (left.pullRequestNumber ?? Number.MAX_SAFE_INTEGER) -
            (right.pullRequestNumber ?? Number.MAX_SAFE_INTEGER);
        break;
      case "decision":
        result =
          DECISION_RANK[left.decision.kind] - DECISION_RANK[right.decision.kind] ||
          textCompare(left.decision.label, right.decision.label);
        break;
    }
    return result || textCompare(left.reportId, right.reportId);
  };
}

export function recentOperationalRecords(
  records: OperationalReviewRecord[],
  limit = 5,
): OperationalReviewRecord[] {
  return [...records].sort(compareOperationalRecords("recent")).slice(0, Math.max(0, limit));
}

export function recentlyChangedOperationalRecords(
  records: OperationalReviewRecord[],
  limit = 5,
): OperationalReviewRecord[] {
  return records
    .filter((record) => record.changeSummary !== null)
    .sort((left, right) => {
      const delta = timestamp(right.changeAt ?? right.updatedAt) - timestamp(left.changeAt ?? left.updatedAt);
      return delta || textCompare(left.reportId, right.reportId);
    })
    .slice(0, Math.max(0, limit));
}
