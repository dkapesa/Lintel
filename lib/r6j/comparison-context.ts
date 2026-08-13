import { RECOMMENDATION_LABEL, type CaseDetail, type HistoryChangeView, type RunComparisonView } from "../workspace-v2/view-model";

export type ComparisonMovement = Readonly<{ label: string; value: string; tone?: "positive" | "negative" | "neutral" }>;
export type ComparisonDiffRow = Readonly<{ status: "reopened" | "added" | "changed" | "cleared"; category: string; title: string; state: string }>;
export type ComparisonDiffSection = Readonly<{ key: "findings" | "evidence" | "test-gaps" | "merge-conditions"; label: string; rows: readonly ComparisonDiffRow[]; unchanged: number }>;
export type ComparisonContext = Readonly<{
  status: "ready";
  currentIdentity: string;
  comparisonIdentity: string;
  movement: readonly ComparisonMovement[];
  sections: readonly ComparisonDiffSection[];
}> | Readonly<{ status: "unavailable" }>;

const ORDER = ["reopened", "added", "changed", "cleared"] as const;
const sectionDefinitions = [
  ["findings", "Findings", "finding:"] as const,
  ["evidence", "Evidence", "evidence:"] as const,
  ["test-gaps", "Test gaps", "test:"] as const,
  ["merge-conditions", "Merge conditions", "condition:"] as const,
];

function comparisonFor(detail: CaseDetail, runId: string | null): RunComparisonView | null {
  if (detail.history?.status !== "comparison") return null;
  const candidates = detail.history.comparisons ?? [];
  const targetId = runId ?? detail.history.previous.runId;
  return candidates.find((item) => item.target.runId === targetId) ?? (
    detail.history.previous.runId === targetId
      ? { target: detail.history.previous, readiness: detail.history.readiness, changes: detail.history.changes, limitation: detail.history.limitation }
      : null
  );
}

function count(changes: readonly HistoryChangeView[], prefix: string, status: HistoryChangeView["status"]): number {
  return changes.filter((item) => item.key.startsWith(prefix) && item.status === status).length;
}

function stateLabel(item: HistoryChangeView): string {
  if (item.previousState && item.currentState) return `${item.previousState} → ${item.currentState}`;
  return item.currentState ?? item.previousState ?? "State not recorded";
}

export function projectComparisonContext(detail: CaseDetail, comparisonRunId: string | null): ComparisonContext {
  const comparison = comparisonFor(detail, comparisonRunId);
  if (!comparison || !detail.run) return { status: "unavailable" };
  const changes = comparison.changes;
  const classification = comparison.readiness.classification;
  const mergeOpened = count(changes, "condition:", "added");
  const mergeCleared = count(changes, "condition:", "cleared");
  const mergeReopened = count(changes, "condition:", "reopened");
  const evidenceAdded = count(changes, "evidence:", "added");
  const evidenceStale = changes.filter((item) => item.key.startsWith("evidence:") && item.status === "changed" && /stale/i.test(stateLabel(item))).length;
  const movement: ComparisonMovement[] = [
    { label: "Direction", value: classification[0]!.toUpperCase() + classification.slice(1), tone: classification === "improved" ? "positive" : classification === "regressed" ? "negative" : "neutral" },
    { label: "Lintel recommendation", value: `${RECOMMENDATION_LABEL[comparison.readiness.previousRecommendation]} → ${RECOMMENDATION_LABEL[comparison.readiness.currentRecommendation]}` },
    { label: "Risk score", value: `${comparison.readiness.previousScore} → ${comparison.readiness.currentScore}` },
    { label: "Merge conditions", value: `${mergeOpened} opened · ${mergeCleared} cleared · ${mergeReopened} reopened` },
    { label: "Still blocking", value: `${count(changes, "condition:", "unchanged")} still open` },
    { label: "Blocker movement", value: `${count(changes, "finding:", "added")} added · ${count(changes, "finding:", "cleared")} cleared` },
    { label: "Test/evidence gap movement", value: `${count(changes, "test:", "added")} added · ${count(changes, "test:", "cleared")} cleared` },
  ];
  if (evidenceAdded > 0 || evidenceStale > 0) movement.push({ label: "Evidence freshness", value: `${evidenceAdded} added · ${evidenceStale} became stale` });
  return {
    status: "ready",
    currentIdentity: "Current analysis",
    comparisonIdentity: "Comparison analysis",
    movement,
    sections: sectionDefinitions.map(([key, label, prefix]) => {
      const sectionItems = changes.filter((item) => item.key.startsWith(prefix));
      return {
        key,
        label,
        rows: ORDER.flatMap((status) => sectionItems.filter((item) => item.status === status).map((item) => ({ status, category: item.category, title: item.title, state: stateLabel(item) }))),
        unchanged: sectionItems.filter((item) => item.status === "unchanged").length,
      };
    }),
  };
}
