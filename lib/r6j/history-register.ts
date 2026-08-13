import { RECOMMENDATION_LABEL, type CaseDetail, type RunComparisonView, type RunView } from "../workspace-v2/view-model";
import { analysedAtLabel, shortHead, sourceLabel } from "./labels";

export type HistoryCurrentRow = Readonly<{
  kind: "current";
  analysedAt: string;
  recommendation: string;
  riskScore: number;
  source: string;
  head: string | null;
}>;

export type HistoryTargetRow = Readonly<{
  kind: "target";
  runId: string;
  analysedAt: string;
  recommendation: string;
  riskScore: number;
  source: string;
  reproducibility: RunView["reproducibility"];
  head: string | null;
  previousApplicable: boolean;
}>;

export type HistoryRegister = Readonly<{
  status: "ready";
  current: HistoryCurrentRow;
  targets: readonly HistoryTargetRow[];
}> | Readonly<{ status: "unavailable" }>;

function targetRow(comparison: RunComparisonView, previousRunId: string): HistoryTargetRow {
  return {
    kind: "target",
    runId: comparison.target.runId,
    analysedAt: analysedAtLabel(comparison.target.createdAt),
    recommendation: RECOMMENDATION_LABEL[comparison.readiness.previousRecommendation],
    riskScore: comparison.readiness.previousScore,
    source: sourceLabel(comparison.target.sourceType),
    reproducibility: comparison.target.reproducibility,
    head: shortHead(comparison.target.headSha),
    previousApplicable: comparison.target.runId === previousRunId,
  };
}

/** Pure canonical history projection. Ordering is provided by the adapter. */
export function projectHistoryRegister(detail: CaseDetail): HistoryRegister {
  const history = detail.history;
  if (!detail.run || !history || history.status !== "comparison") return { status: "unavailable" };
  const previousRunId = history.previous.runId;
  const comparisons = history.comparisons ?? [];
  const available = comparisons.length > 0
    ? comparisons
    : [{ target: history.previous, readiness: history.readiness, changes: history.changes, limitation: history.limitation }];
  return {
    status: "ready",
    current: {
      kind: "current",
      analysedAt: analysedAtLabel(detail.run.createdAt),
      recommendation: RECOMMENDATION_LABEL[detail.recommendation],
      riskScore: detail.riskScore,
      source: sourceLabel(detail.run.sourceType),
      head: shortHead(detail.github.headSha),
    },
    targets: available.map((comparison) => targetRow(comparison, previousRunId)),
  };
}
