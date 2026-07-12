import type { Recommendation, Report, RiskLevel } from "./mock-report";
import { decisionConditions, deduplicateReportItems } from "./report-quality";

export type ReadinessDeltaClassification = "initial" | "improved" | "regressed" | "mixed" | "unchanged";

export type ReadinessDelta = {
  previousRunId?: string;
  previousHeadSha?: string;
  currentRunId: string;
  currentHeadSha: string;
  previousScore?: number;
  currentScore: number;
  scoreChange?: number;
  previousRecommendation?: Recommendation;
  currentRecommendation: Recommendation;
  recommendationChanged: boolean;
  previousRiskLevel?: RiskLevel;
  currentRiskLevel: RiskLevel;
  riskChanged: boolean;
  openedMergeConditions: string[];
  clearedMergeConditions: string[];
  unchangedOpenMergeConditions: string[];
  reopenedMergeConditions: string[];
  addedBlockers: string[];
  clearedBlockers: string[];
  addedTestOrEvidenceGaps: string[];
  clearedTestOrEvidenceGaps: string[];
  classification: ReadinessDeltaClassification;
  generatedAt: string;
  deltaFailureCategory?: string;
};

export type AnalysisRunSnapshot = {
  runId: string;
  repositoryId: number;
  owner: string;
  repository: string;
  pullRequestNumber: number;
  baseSha?: string;
  headSha: string;
  recommendation: Recommendation;
  readinessScore: number;
  riskLevel: RiskLevel;
  report: Report;
  analysisSource: "deterministic";
  completedAt: string;
  delta?: ReadinessDelta;
  deltaFailureCategory?: string;
};

type ComparableItem = {
  key: string;
  label: string;
};
type Finding = Report["findings"][number];

function normaliseComparisonText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function byKey(items: ComparableItem[]) {
  const map = new Map<string, string>();
  for (const item of items) {
    if (!map.has(item.key)) map.set(item.key, item.label);
  }
  return map;
}

function diffOpened(current: Map<string, string>, previous: Map<string, string>) {
  return [...current].filter(([key]) => !previous.has(key)).map(([, label]) => label);
}

function diffCleared(current: Map<string, string>, previous: Map<string, string>) {
  return [...previous].filter(([key]) => !current.has(key)).map(([, label]) => label);
}

function diffUnchanged(current: Map<string, string>, previous: Map<string, string>) {
  return [...current].filter(([key]) => previous.has(key)).map(([, label]) => label);
}

function conditionItems(report: Report): ComparableItem[] {
  return decisionConditions(report.conditionsBeforeMerge).map((condition) => ({
    key: `condition:${normaliseComparisonText(condition)}`,
    label: condition,
  }));
}

function findingItem(finding: Finding): ComparableItem {
  return {
    key: `finding:${normaliseComparisonText(finding.category)}:${normaliseComparisonText(finding.severity)}:${normaliseComparisonText(finding.title)}`,
    label: `${finding.severity} ${finding.category}: ${finding.title}`,
  };
}

function blockerItems(report: Report): ComparableItem[] {
  return report.findings.map(findingItem);
}

function testGapItems(report: Report): ComparableItem[] {
  return deduplicateReportItems([
    ...report.missingTests.map((test) => `Missing test: ${test}`),
    ...report.suggestedTests.map((test) => `Suggested test: ${test}`),
  ]).map((gap) => ({
    key: `gap:${normaliseComparisonText(gap)}`,
    label: gap,
  }));
}

const recommendationRank: Record<Recommendation, number> = {
  BLOCK: 0,
  TESTS_REQUIRED: 1,
  REVIEW_REQUIRED: 2,
  APPROVE: 3,
};

const riskRank: Record<RiskLevel, number> = {
  CRITICAL: -1,
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

function movement(previous?: number, current?: number) {
  if (previous === undefined || current === undefined) return 0;
  return current - previous;
}

function reopenedConditions(
  openedConditions: string[],
  previousRun: AnalysisRunSnapshot | null,
  earlierRuns: AnalysisRunSnapshot[],
) {
  if (!previousRun || earlierRuns.length === 0 || openedConditions.length === 0) return [];
  const openedKeys = new Set(openedConditions.map((condition) => `condition:${normaliseComparisonText(condition)}`));
  const historicalKeys = new Set<string>();

  for (const run of earlierRuns) {
    for (const item of conditionItems(run.report)) historicalKeys.add(item.key);
  }

  return openedConditions.filter((condition) => historicalKeys.has(`condition:${normaliseComparisonText(condition)}`) && openedKeys.has(`condition:${normaliseComparisonText(condition)}`));
}

function classifyDelta({
  previousRun,
  scoreChange,
  recommendationChange,
  riskChange,
  openedConditions,
  clearedConditions,
  reopened,
  addedBlockers,
  clearedBlockers,
  addedGaps,
  clearedGaps,
}: {
  previousRun: AnalysisRunSnapshot | null;
  scoreChange?: number;
  recommendationChange: number;
  riskChange: number;
  openedConditions: number;
  clearedConditions: number;
  reopened: number;
  addedBlockers: number;
  clearedBlockers: number;
  addedGaps: number;
  clearedGaps: number;
}): ReadinessDeltaClassification {
  if (!previousRun) return "initial";

  const improved = (scoreChange ?? 0) > 0
    || recommendationChange > 0
    || riskChange > 0
    || clearedConditions > 0
    || clearedBlockers > 0
    || clearedGaps > 0;
  const regressed = (scoreChange ?? 0) < 0
    || recommendationChange < 0
    || riskChange < 0
    || openedConditions > 0
    || reopened > 0
    || addedBlockers > 0
    || addedGaps > 0;

  if (improved && regressed) return "mixed";
  if (improved) return "improved";
  if (regressed) return "regressed";
  return "unchanged";
}

export function createReadinessDelta(
  previousRun: AnalysisRunSnapshot | null,
  currentRun: AnalysisRunSnapshot,
  earlierRuns: AnalysisRunSnapshot[] = [],
  generatedAt = new Date().toISOString(),
): ReadinessDelta {
  const previousConditions = byKey(previousRun ? conditionItems(previousRun.report) : []);
  const currentConditions = byKey(conditionItems(currentRun.report));
  const previousBlockers = byKey(previousRun ? blockerItems(previousRun.report) : []);
  const currentBlockers = byKey(blockerItems(currentRun.report));
  const previousGaps = byKey(previousRun ? testGapItems(previousRun.report) : []);
  const currentGaps = byKey(testGapItems(currentRun.report));

  const openedMergeConditions = diffOpened(currentConditions, previousConditions);
  const clearedMergeConditions = diffCleared(currentConditions, previousConditions);
  const unchangedOpenMergeConditions = diffUnchanged(currentConditions, previousConditions);
  const addedBlockers = diffOpened(currentBlockers, previousBlockers);
  const clearedBlockers = diffCleared(currentBlockers, previousBlockers);
  const addedTestOrEvidenceGaps = diffOpened(currentGaps, previousGaps);
  const clearedTestOrEvidenceGaps = diffCleared(currentGaps, previousGaps);
  const reopenedMergeConditions = reopenedConditions(openedMergeConditions, previousRun, earlierRuns);
  const scoreChange = previousRun ? currentRun.readinessScore - previousRun.readinessScore : undefined;
  const recommendationChange = previousRun ? movement(recommendationRank[previousRun.recommendation], recommendationRank[currentRun.recommendation]) : 0;
  const riskChange = previousRun ? movement(riskRank[previousRun.riskLevel], riskRank[currentRun.riskLevel]) : 0;

  return {
    previousRunId: previousRun?.runId,
    previousHeadSha: previousRun?.headSha,
    currentRunId: currentRun.runId,
    currentHeadSha: currentRun.headSha,
    previousScore: previousRun?.readinessScore,
    currentScore: currentRun.readinessScore,
    scoreChange,
    previousRecommendation: previousRun?.recommendation,
    currentRecommendation: currentRun.recommendation,
    recommendationChanged: previousRun ? previousRun.recommendation !== currentRun.recommendation : false,
    previousRiskLevel: previousRun?.riskLevel,
    currentRiskLevel: currentRun.riskLevel,
    riskChanged: previousRun ? previousRun.riskLevel !== currentRun.riskLevel : false,
    openedMergeConditions,
    clearedMergeConditions,
    unchangedOpenMergeConditions,
    reopenedMergeConditions,
    addedBlockers,
    clearedBlockers,
    addedTestOrEvidenceGaps,
    clearedTestOrEvidenceGaps,
    classification: classifyDelta({
      previousRun,
      scoreChange,
      recommendationChange,
      riskChange,
      openedConditions: openedMergeConditions.length,
      clearedConditions: clearedMergeConditions.length,
      reopened: reopenedMergeConditions.length,
      addedBlockers: addedBlockers.length,
      clearedBlockers: clearedBlockers.length,
      addedGaps: addedTestOrEvidenceGaps.length,
      clearedGaps: clearedTestOrEvidenceGaps.length,
    }),
    generatedAt,
  };
}

export function shortSha(value?: string) {
  return value ? value.slice(0, 7) : "unknown";
}
