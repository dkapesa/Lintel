import type { ChangePassport } from "./change-passport";
import { buildEvidenceHierarchy } from "./evidence-hierarchy";
import { buildBuilderVerifierAssessment, type VerificationBoundaryClassification } from "./builder-verifier-boundary";
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
  evidenceMovement?: {
    evidenceAdded: number;
    strongerEvidenceAdded: number;
    evidenceBecameStale: number;
    assumptionsOpened: number;
    assumptionsSupported: number;
    assumptionsInvalidated: number;
    assumptionsAccepted: number;
    assumptionsBecameStale: number;
  };
  verificationBoundaryMovement?: {
    previousClassification?: VerificationBoundaryClassification;
    currentClassification: VerificationBoundaryClassification;
    builderContextAdded: boolean;
    verifierContextChanged: boolean;
    separationChanged: boolean;
    sameContextDetected: boolean;
    separationBecameUnknown: boolean;
    deterministicBaselineVersionChanged: boolean;
  };
  classification: ReadinessDeltaClassification;
  generatedAt: string;
  deltaFailureCategory?: string;
};

export type ReviewDiffStatus = "added" | "cleared" | "changed" | "unchanged" | "reopened";

export type ReviewDiffChange = {
  field: string;
  previous?: string;
  current?: string;
};

export type ReviewDiffItem = {
  key: string;
  status: ReviewDiffStatus;
  title: string;
  category: string;
  previousState?: string;
  currentState?: string;
  changes?: ReviewDiffChange[];
};

export type ReviewDiff = {
  previousRunId?: string;
  previousHeadSha?: string;
  currentRunId: string;
  currentHeadSha: string;
  previousScore?: number;
  currentScore: number;
  previousRecommendation?: Recommendation;
  currentRecommendation: Recommendation;
  previousRiskLevel?: RiskLevel;
  currentRiskLevel: RiskLevel;
  classification: ReadinessDeltaClassification;
  findings: ReviewDiffItem[];
  evidence: ReviewDiffItem[];
  testGaps: ReviewDiffItem[];
  mergeConditions: ReviewDiffItem[];
  evidenceMovement?: ReadinessDelta["evidenceMovement"];
  verificationBoundaryMovement?: ReadinessDelta["verificationBoundaryMovement"];
  generatedAt: string;
  failureCategory?: string;
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
  changePassport?: ChangePassport;
  analysisSource: "deterministic";
  completedAt: string;
  delta?: ReadinessDelta;
  reviewDiff?: ReviewDiff;
  deltaFailureCategory?: string;
};

type ComparableItem = {
  key: string;
  label: string;
};
type Finding = Report["findings"][number];
type SuggestedTest = Report["suggestedTests"][number];
type ComparableRecord = {
  key: string;
  title: string;
  category: string;
  state?: string;
  fields: Record<string, string | undefined>;
};

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

function findingRecord(finding: Finding): ComparableRecord {
  return {
    key: `finding:${normaliseComparisonText(finding.category)}:${normaliseComparisonText(finding.file ?? "")}:${normaliseComparisonText(finding.title)}`,
    title: finding.title,
    category: finding.category,
    state: finding.severity === "CRITICAL" || finding.severity === "HIGH" ? "Blocking" : "Advisory",
    fields: {
      severity: finding.severity,
      blockerState: finding.severity === "CRITICAL" || finding.severity === "HIGH" ? "Blocking" : "Advisory",
      evidence: finding.evidence,
      action: finding.action,
      file: finding.file,
      provenance: finding.provenance,
    },
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

function suggestedTestState(test: SuggestedTest) {
  return test.priority ?? "Recommended";
}

function testGapRecords(report: Report): ComparableRecord[] {
  const missing = report.missingTests.map((test) => ({
    key: `test:missing:${normaliseComparisonText(test)}`,
    title: test,
    category: "Missing test",
    state: "Missing",
    fields: {
      state: "Missing",
      priority: "Required",
      detail: test,
    },
  }));
  const suggested = report.suggestedTests.map((test) => ({
    key: `test:suggested:${normaliseComparisonText(test.title)}`,
    title: test.title,
    category: "Suggested test",
    state: suggestedTestState(test),
    fields: {
      state: "Suggested",
      priority: suggestedTestState(test),
      detail: test.description,
    },
  }));

  return [...missing, ...suggested];
}

function conditionRecords(report: Report): ComparableRecord[] {
  return decisionConditions(report.conditionsBeforeMerge).map((condition) => ({
    key: `condition:${normaliseComparisonText(condition)}`,
    title: condition,
    category: "Merge condition",
    state: "Open",
    fields: {
      state: "Open",
      clearanceRequirement: condition,
    },
  }));
}

function evidenceRecords(report: Report): ComparableRecord[] {
  const records: ComparableRecord[] = [];

  for (const finding of report.findings) {
    records.push({
      key: `evidence:finding:${normaliseComparisonText(finding.category)}:${normaliseComparisonText(finding.title)}`,
      title: finding.title,
      category: finding.category,
      state: finding.provenance ?? "Rule detected",
      fields: {
        evidence: finding.evidence,
        provenance: finding.provenance ?? "Rule detected",
        status: finding.evidence ? "Present" : "Missing",
      },
    });
  }

  if (report.operationalReadiness) {
    for (const signal of deduplicateReportItems(report.operationalReadiness.detectionSignals)) {
      records.push({
        key: `evidence:operational:detection:${normaliseComparisonText(signal)}`,
        title: "Detection signal",
        category: "Operational readiness",
        state: "Present",
        fields: { evidence: signal, status: "Present", provenance: "Rule detected" },
      });
    }
    for (const gap of deduplicateReportItems(report.operationalReadiness.observabilityGaps)) {
      records.push({
        key: `evidence:operational:observability:${normaliseComparisonText(gap)}`,
        title: "Observability evidence missing",
        category: "Operational readiness",
        state: "Missing",
        fields: { evidence: gap, status: "Missing", provenance: "Rule detected" },
      });
    }
    for (const recovery of deduplicateReportItems(report.operationalReadiness.recoveryOrRollback)) {
      records.push({
        key: `evidence:operational:recovery:${normaliseComparisonText(recovery)}`,
        title: "Recovery evidence",
        category: "Operational readiness",
        state: report.operationalReadiness.status === "ATTENTION" ? "Needs confirmation" : "Present",
        fields: { evidence: recovery, status: report.operationalReadiness.status === "ATTENTION" ? "Needs confirmation" : "Present", provenance: "Rule detected" },
      });
    }
  }

  for (const check of report.reportQuality?.checks ?? []) {
    if (check.status === "WARNING") {
      records.push({
        key: `evidence:quality:${normaliseComparisonText(check.label)}`,
        title: check.label,
        category: "Report quality",
        state: "Missing",
        fields: { evidence: check.detail, status: "Warning", provenance: "Rule detected" },
      });
    }
  }

  return records;
}

function recordMap(records: ComparableRecord[]) {
  const map = new Map<string, ComparableRecord>();
  for (const record of records) {
    if (!map.has(record.key)) map.set(record.key, record);
  }
  return map;
}

function fieldChanges(previous: ComparableRecord, current: ComparableRecord, fields: string[]) {
  return fields.flatMap((field) => {
    const previousValue = previous.fields[field]?.trim();
    const currentValue = current.fields[field]?.trim();
    if (normaliseComparisonText(previousValue ?? "") === normaliseComparisonText(currentValue ?? "")) return [];
    return [{ field, previous: previousValue, current: currentValue }];
  });
}

function compareRecordSet({
  previous,
  current,
  changeFields,
  reopenedKeys = new Set<string>(),
}: {
  previous: ComparableRecord[];
  current: ComparableRecord[];
  changeFields: string[];
  reopenedKeys?: Set<string>;
}): ReviewDiffItem[] {
  const previousMap = recordMap(previous);
  const currentMap = recordMap(current);
  const keys = new Set([...previousMap.keys(), ...currentMap.keys()]);
  const items: ReviewDiffItem[] = [];

  for (const key of keys) {
    const previousItem = previousMap.get(key);
    const currentItem = currentMap.get(key);

    if (!previousItem && currentItem) {
      items.push({
        key,
        status: reopenedKeys.has(key) ? "reopened" : "added",
        title: currentItem.title,
        category: currentItem.category,
        currentState: currentItem.state,
      });
      continue;
    }

    if (previousItem && !currentItem) {
      items.push({
        key,
        status: "cleared",
        title: previousItem.title,
        category: previousItem.category,
        previousState: previousItem.state,
      });
      continue;
    }

    if (previousItem && currentItem) {
      const changes = fieldChanges(previousItem, currentItem, changeFields);
      items.push({
        key,
        status: changes.length > 0 ? "changed" : "unchanged",
        title: currentItem.title,
        category: currentItem.category,
        previousState: previousItem.state,
        currentState: currentItem.state,
        changes: changes.length > 0 ? changes : undefined,
      });
    }
  }

  return items.sort((a, b) => {
    const order: Record<ReviewDiffStatus, number> = { reopened: 0, added: 1, changed: 2, cleared: 3, unchanged: 4 };
    return order[a.status] - order[b.status] || a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
  });
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
  const previousEvidence = previousRun ? buildEvidenceHierarchy(previousRun.report, previousRun.changePassport, { runId: previousRun.runId, headSha: previousRun.headSha }) : null;
  const currentEvidence = buildEvidenceHierarchy(currentRun.report, currentRun.changePassport, { runId: currentRun.runId, headSha: currentRun.headSha });
  const previousEvidenceIds = new Set(previousEvidence?.records.map((record) => record.evidenceId) ?? []);
  const currentEvidenceIds = new Set(currentEvidence.records.map((record) => record.evidenceId));
  const previousAssumptionIds = new Set(previousEvidence?.assumptions.map((assumption) => assumption.assumptionId) ?? []);
  const currentAssumptionIds = new Set(currentEvidence.assumptions.map((assumption) => assumption.assumptionId));
  const evidenceMovement = {
    evidenceAdded: currentEvidence.records.filter((record) => !previousEvidenceIds.has(record.evidenceId)).length,
    strongerEvidenceAdded: currentEvidence.records.filter((record) => !previousEvidenceIds.has(record.evidenceId) && (record.class === "externally-verified" || record.class === "directly-observed" || record.class === "human-confirmed")).length,
    evidenceBecameStale: currentEvidence.records.filter((record) => record.stale).length,
    assumptionsOpened: currentEvidence.assumptions.filter((assumption) => !previousAssumptionIds.has(assumption.assumptionId) && assumption.status === "open").length,
    assumptionsSupported: currentEvidence.assumptions.filter((assumption) => previousAssumptionIds.has(assumption.assumptionId) && assumption.status === "supported").length,
    assumptionsInvalidated: currentEvidence.assumptions.filter((assumption) => previousAssumptionIds.has(assumption.assumptionId) && assumption.status === "invalidated").length,
    assumptionsAccepted: currentEvidence.assumptions.filter((assumption) => previousAssumptionIds.has(assumption.assumptionId) && assumption.status === "accepted").length,
    assumptionsBecameStale: currentEvidence.assumptions.filter((assumption) => assumption.stale).length,
  };
  const previousBoundary = previousRun ? buildBuilderVerifierAssessment({
    passport: previousRun.changePassport,
    repository: previousRun.repository,
    pullRequestNumber: previousRun.pullRequestNumber,
    headSha: previousRun.headSha,
    canonicalRunId: previousRun.runId,
    analysisSource: previousRun.analysisSource,
    generatorVersion: "historical",
    deterministicRulesetVersion: "historical",
  }) : null;
  const currentBoundary = buildBuilderVerifierAssessment({
    passport: currentRun.changePassport,
    repository: currentRun.repository,
    pullRequestNumber: currentRun.pullRequestNumber,
    headSha: currentRun.headSha,
    canonicalRunId: currentRun.runId,
    analysisSource: currentRun.analysisSource,
    generatorVersion: "historical",
    deterministicRulesetVersion: "historical",
  });
  const verificationBoundaryMovement = {
    previousClassification: previousBoundary?.classification,
    currentClassification: currentBoundary.classification,
    builderContextAdded: !previousRun?.changePassport && !!currentRun.changePassport,
    verifierContextChanged: previousBoundary ? previousBoundary.verifier.analysisSource !== currentBoundary.verifier.analysisSource : false,
    separationChanged: previousBoundary ? previousBoundary.classification !== currentBoundary.classification : false,
    sameContextDetected: currentBoundary.classification === "same-context verification",
    separationBecameUnknown: previousBoundary ? previousBoundary.classification !== "separation unknown" && currentBoundary.classification === "separation unknown" : currentBoundary.classification === "separation unknown",
    deterministicBaselineVersionChanged: false,
  };

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
    evidenceMovement,
    verificationBoundaryMovement,
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

export function createReviewDiff(
  previousRun: AnalysisRunSnapshot | null,
  currentRun: AnalysisRunSnapshot,
  delta: ReadinessDelta,
  earlierRuns: AnalysisRunSnapshot[] = [],
  generatedAt = new Date().toISOString(),
): ReviewDiff | null {
  if (!previousRun) return null;

  const historicalConditionKeys = new Set(
    earlierRuns.flatMap((run) => conditionRecords(run.report).map((item) => item.key)),
  );
  const previousConditionKeys = new Set(conditionRecords(previousRun.report).map((item) => item.key));
  const reopenedKeys = new Set(
    conditionRecords(currentRun.report)
      .filter((item) => historicalConditionKeys.has(item.key) && !previousConditionKeys.has(item.key))
      .map((item) => item.key),
  );

  return {
    previousRunId: previousRun.runId,
    previousHeadSha: previousRun.headSha,
    currentRunId: currentRun.runId,
    currentHeadSha: currentRun.headSha,
    previousScore: delta.previousScore,
    currentScore: delta.currentScore,
    previousRecommendation: delta.previousRecommendation,
    currentRecommendation: delta.currentRecommendation,
    previousRiskLevel: delta.previousRiskLevel,
    currentRiskLevel: delta.currentRiskLevel,
    classification: delta.classification,
    findings: compareRecordSet({
      previous: previousRun.report.findings.map(findingRecord),
      current: currentRun.report.findings.map(findingRecord),
      changeFields: ["severity", "blockerState", "evidence", "action", "file", "provenance"],
    }),
    evidence: compareRecordSet({
      previous: evidenceRecords(previousRun.report),
      current: evidenceRecords(currentRun.report),
      changeFields: ["status", "evidence", "provenance"],
    }),
    testGaps: compareRecordSet({
      previous: testGapRecords(previousRun.report),
      current: testGapRecords(currentRun.report),
      changeFields: ["state", "priority", "detail"],
    }),
    mergeConditions: compareRecordSet({
      previous: conditionRecords(previousRun.report),
      current: conditionRecords(currentRun.report),
      changeFields: ["state", "clearanceRequirement"],
      reopenedKeys,
    }),
    evidenceMovement: delta.evidenceMovement,
    verificationBoundaryMovement: delta.verificationBoundaryMovement,
    generatedAt,
  };
}

export function shortSha(value?: string) {
  return value ? value.slice(0, 7) : "unknown";
}
