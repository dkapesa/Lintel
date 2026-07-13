import {
  CANONICAL_RUN_SCHEMA_VERSION,
  DETERMINISTIC_RULESET_VERSION,
  REPORT_GENERATOR_VERSION,
  REPORT_SCHEMA_VERSION,
  fingerprintPrefix,
  historicalCanonicalRunManifest,
  stableFingerprint,
  type CanonicalReviewRunManifest,
} from "./canonical-review-run";
import { compareChangePassport, type ChangePassport } from "./change-passport";
import { buildBuilderVerifierAssessment, type BuilderVerifierAssessment } from "./builder-verifier-boundary";
import {
  buildEvidenceHierarchy,
  evidenceClassLabels,
  evidenceClassOrder,
  type AssumptionRecord,
  type EvidenceClass,
  type EvidenceHierarchySummary,
  type EvidenceRecord,
} from "./evidence-hierarchy";
import { buildMergeContract, mergeContractSummary, type MergeContract, type MergeContractClause } from "./merge-contract";
import type { Report } from "./mock-report";
import { decisionConditions, deduplicateReportItems, pruneUnsupportedReviewerFocus } from "./report-quality";
import type { DecisionHistoryEvent } from "./decision-history";
import type { ReadinessDelta, ReviewDiff, ReviewDiffItem } from "./readiness-delta";
import { shortSha } from "./readiness-delta";
import type { ReportReviewState } from "./review-state";

export const VERIFICATION_PACK_SCHEMA_VERSION = "1.0";

const LIMITS = {
  evidenceRecords: 16,
  assumptions: 12,
  findings: 10,
  tests: 8,
  clauses: 14,
  reviewDiffExamples: 6,
  decisionEvents: 8,
  text: 360,
  note: 600,
};

export type VerificationPackState = "complete" | "partial" | "stale" | "historical" | "unavailable";

export type BoundedList<T> = {
  total: number;
  exported: number;
  truncated: boolean;
  items: T[];
};

export type VerificationPack = {
  packId: string;
  schemaVersion: typeof VERIFICATION_PACK_SCHEMA_VERSION;
  generationStatus: VerificationPackState;
  createdAt: string;
  reportId: string;
  canonicalRunId?: string;
  changeIdentity: {
    repository: string;
    pullRequestNumber?: number;
    title: string;
    sourceType: string;
    sourceUrl?: string;
    baseSha?: string;
    headSha?: string;
    author?: string;
    producerType: string;
  };
  reviewResult: {
    recommendation: Report["verdict"]["recommendation"];
    riskBand: Report["verdict"]["riskLevel"];
    riskScore: number;
    executiveSummary: string;
    nextAction: string;
    reviewMode: string;
    analysisSource: string;
  };
  builderDeclaration: {
    present: boolean;
    passportId?: string;
    schemaVersion?: string;
    source?: string;
    producerType: string;
    intent?: string;
    changeSummary?: string;
    producer?: {
      tool?: string;
      provider?: string;
      model?: string;
      externalRunId?: string;
    };
    claimedValidation: BoundedList<string>;
    assumptions: BoundedList<string>;
    limitations: BoundedList<string>;
    unresolvedUncertainty: BoundedList<string>;
    comparisonSummary?: string;
  };
  independentVerification: {
    boundaryAssessmentId: string;
    classification: string;
    deterministicBaselineApplied: boolean;
    verifierTypes: string[];
    dimensions: Array<{ key: string; status: string; rationale: string }>;
    limitations: string[];
  };
  evidence: {
    countsByClass: Record<EvidenceClass, number>;
    records: BoundedList<Pick<EvidenceRecord, "evidenceId" | "class" | "title" | "statement" | "source" | "provenance" | "status" | "relatedFindingIds" | "relatedTestIds" | "relatedConditionIds" | "relatedSurfaces" | "headSha" | "stale" | "fingerprint">>;
  };
  assumptions: {
    openBlocking: number;
    openAdvisory: number;
    records: BoundedList<Pick<AssumptionRecord, "assumptionId" | "statement" | "source" | "provenance" | "importance" | "status" | "affectedSurfaces" | "relatedFindingIds" | "relatedEvidenceIds" | "relatedConditionIds" | "evidenceRequired" | "ownerCue" | "introducedHeadSha" | "stale" | "fingerprint">>;
  };
  mergeContract: {
    contractId: string;
    schemaVersion: string;
    state: string;
    contractFingerprint: string;
    currentEvaluationFingerprint: string;
    summary: string;
    blockingOpen: number;
    advisoryOpen: number;
    satisfied: number;
    acceptedRisk: number;
    unresolvedAssumptionLinked: number;
    clauses: BoundedList<Pick<MergeContractClause, "clauseId" | "type" | "title" | "statement" | "rationale" | "importance" | "status" | "source" | "provenance" | "relatedEvidenceIds" | "relatedAssumptionIds" | "relatedAffectedSurfaces" | "requirements" | "evidenceRequired" | "currentSupportingEvidenceIds" | "ownerCue" | "lastEvaluatedHeadSha" | "stale" | "fingerprint">>;
  };
  reviewEvolution: {
    available: boolean;
    reason?: string;
    previousRunId?: string;
    currentRunId?: string;
    previousHeadSha?: string;
    currentHeadSha?: string;
    scoreMovement?: string;
    recommendationMovement?: string;
    riskMovement?: string;
    openedConditions: number;
    clearedConditions: number;
    reopenedConditions: number;
    stillOpenConditions: number;
    addedBlockers: number;
    clearedBlockers: number;
    evidenceMovement?: ReadinessDelta["evidenceMovement"];
    verificationBoundaryMovement?: ReadinessDelta["verificationBoundaryMovement"];
    mergeContractMovement?: ReadinessDelta["mergeContractMovement"];
    reviewDiffExamples: BoundedList<{ status: string; title: string; category: string }>;
  };
  humanDecision: {
    present: boolean;
    status?: string;
    owner?: string;
    note?: string;
    updatedAt?: string | null;
    applicableHeadSha?: string;
    stale: boolean;
    acceptedRiskEvents: BoundedList<Pick<DecisionHistoryEvent, "title" | "timestamp" | "detail" | "nextState">>;
    recentEvents: BoundedList<Pick<DecisionHistoryEvent, "type" | "title" | "timestamp" | "detail" | "previousState" | "nextState" | "label">>;
  };
  provenance: {
    canonicalRun?: CanonicalReviewRunManifest;
    canonicalRunSchemaVersion: string;
    reportSchemaVersion: string;
    generatorVersion: string;
    deterministicRulesetVersion: string;
    provider?: string;
    model?: string;
    inputFingerprint?: string;
    configurationFingerprint?: string;
    resultFingerprint?: string;
    reproducibility: string;
    reproducibilityLimitation?: string;
  };
  limitations: string[];
  unavailableSections: string[];
  stale: boolean;
  sectionFingerprints: Record<string, string>;
  packFingerprint: string;
};

type VerificationPackInput = {
  report: Report;
  canonicalRun?: CanonicalReviewRunManifest | null;
  changePassport?: ChangePassport | null;
  evidenceHierarchy?: EvidenceHierarchySummary;
  builderVerifier?: BuilderVerifierAssessment;
  mergeContract?: MergeContract;
  readinessDelta?: ReadinessDelta | null;
  reviewDiff?: ReviewDiff | null;
  reviewState?: ReportReviewState | null;
  decisionHistory?: DecisionHistoryEvent[];
  sourceType?: string;
  sourceUrl?: string;
  createdAt?: string;
};

function safeText(value: string | undefined | null, limit = LIMITS.text) {
  if (!value) return undefined;
  const cleaned = value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "[raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[a-z0-9_-]{8,}\b/gi, "[REDACTED]")
    .replace(/((?:openai_api_key|api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, limit) : undefined;
}

function bounded<T>(items: T[], limit: number, rank?: (item: T) => number): BoundedList<T> {
  const ordered = rank ? [...items].sort((a, b) => rank(b) - rank(a)) : [...items];
  const sliced = ordered.slice(0, limit);
  return { total: items.length, exported: sliced.length, truncated: items.length > sliced.length, items: sliced };
}

function nextAction(report: Report) {
  if (report.verdict.recommendation === "APPROVE") return "Complete normal human review and CI checks.";
  if (report.missingTests.length > 0) return "Resolve missing test evidence, then re-check readiness.";
  const condition = decisionConditions(report.conditionsBeforeMerge)[0];
  if (condition) return `Resolve merge condition: ${condition}`;
  if (report.findings.length > 0) return `Review finding: ${report.findings[0].title}`;
  return "Review the report and remaining local decision state.";
}

function listStrings(values: string[] | undefined, limit = LIMITS.tests) {
  return bounded(deduplicateReportItems((values ?? []).flatMap((item) => {
    const value = safeText(item);
    return value ? [value] : [];
  })), limit);
}

function reviewDiffItems(reviewDiff?: ReviewDiff | null) {
  if (!reviewDiff) return [];
  const groups: ReviewDiffItem[] = [
    ...reviewDiff.findings,
    ...reviewDiff.evidence,
    ...reviewDiff.testGaps,
    ...reviewDiff.mergeConditions,
  ];
  return groups.map((item) => ({
    status: item.status,
    title: safeText(item.title, 140) ?? item.title,
    category: safeText(item.category, 80) ?? item.category,
  }));
}

function eventRank(event: DecisionHistoryEvent) {
  if (event.type === "accepted-risk-recorded") return 5;
  if (event.type === "human-decision-recorded") return 4;
  if (event.type === "condition-cleared" || event.type === "condition-reopened") return 3;
  return 1;
}

function sectionFingerprint(value: unknown) {
  return stableFingerprint(value);
}

function packState({
  canonicalRun,
  changePassport,
  mergeContract,
  evidenceHierarchy,
}: {
  canonicalRun: CanonicalReviewRunManifest;
  changePassport?: ChangePassport | null;
  mergeContract: MergeContract;
  evidenceHierarchy: EvidenceHierarchySummary;
}): { state: VerificationPackState; unavailable: string[]; limitations: string[] } {
  const unavailable: string[] = [];
  const limitations: string[] = [];

  if (canonicalRun.processingState === "historical" || canonicalRun.reproducibility === "historical-schema") {
    unavailable.push("current canonical-run provenance");
    limitations.push("This report uses historical fallback metadata where current schema fields are unavailable.");
  }
  if (!changePassport) {
    unavailable.push("Change Passport");
    limitations.push("No builder-declared Change Passport was supplied.");
  }
  if (mergeContract.state === "unavailable" || mergeContract.state === "historical") unavailable.push("complete Merge Contract");
  if (evidenceHierarchy.records.length === 0) unavailable.push("structured evidence records");

  if (unavailable.some((item) => item.includes("historical") || item.includes("canonical"))) return { state: "historical", unavailable, limitations };
  if (unavailable.length > 0) return { state: "partial", unavailable, limitations };
  return { state: "complete", unavailable, limitations };
}

export function buildVerificationPack({
  report,
  canonicalRun,
  changePassport,
  evidenceHierarchy,
  builderVerifier,
  mergeContract,
  readinessDelta,
  reviewDiff,
  reviewState,
  decisionHistory = [],
  sourceType,
  sourceUrl,
  createdAt = new Date().toISOString(),
}: VerificationPackInput): VerificationPack {
  const run = canonicalRun ?? historicalCanonicalRunManifest(report, sourceType === "sample" ? "sample" : "demo");
  const evidence = evidenceHierarchy ?? buildEvidenceHierarchy(report, changePassport, { runId: run.runId, headSha: run.headSha });
  const boundary = builderVerifier ?? buildBuilderVerifierAssessment({
    passport: changePassport,
    repository: report.pr.repository,
    pullRequestNumber: report.pr.number,
    headSha: run.headSha,
    canonicalRunId: run.runId,
    analysisSource: run.analysisSource,
    provider: run.provider,
    model: run.model,
    generatorVersion: run.generatorVersion ?? REPORT_GENERATOR_VERSION,
    deterministicRulesetVersion: run.deterministicRulesetVersion ?? DETERMINISTIC_RULESET_VERSION,
    humanDecisionPresent: decisionHistory.some((event) => event.type === "human-decision-recorded" || event.type === "accepted-risk-recorded"),
    createdAt,
  });
  const contract = mergeContract ?? buildMergeContract({
    report,
    changePassport,
    evidenceHierarchy: evidence,
    builderVerifier: boundary,
    canonicalRunId: run.runId,
    baseSha: run.baseSha,
    headSha: run.headSha,
    sourceType: run.sourceType,
    reviewMode: run.reviewMode,
    createdAt,
  });
  const passportComparison = changePassport ? compareChangePassport(changePassport, report) : null;
  const acceptedRiskEvents = decisionHistory.filter((event) => event.type === "accepted-risk-recorded");
  const recentEvents = bounded(decisionHistory, LIMITS.decisionEvents, eventRank).items.map((event) => ({
    type: event.type,
    title: safeText(event.title, 120) ?? event.title,
    timestamp: event.timestamp,
    detail: safeText(event.detail, 220) ?? event.detail,
    previousState: safeText(event.previousState, 80),
    nextState: safeText(event.nextState, 80),
    label: event.label,
  }));
  const humanDecisionStale = !!(reviewState?.updatedAt && run.headSha && readinessDelta?.currentHeadSha && readinessDelta.currentHeadSha !== run.headSha);
  const stateInfo = packState({ canonicalRun: run, changePassport, mergeContract: contract, evidenceHierarchy: evidence });

  const findingRecords = report.findings.map((finding, index) => ({
    evidenceId: `finding_${index}`,
    class: finding.provenance === "Model assisted" ? "model-inferred" as const : "directly-observed" as const,
    title: safeText(finding.title, 140) ?? finding.title,
    statement: safeText(finding.evidence, 220) ?? finding.evidence,
    source: "Report finding",
    provenance: finding.provenance ?? "Rule detected",
    status: "present" as const,
    relatedFindingIds: [`finding-${index}`],
    relatedTestIds: [],
    relatedConditionIds: [],
    relatedSurfaces: [finding.category],
    headSha: run.headSha,
    stale: false,
    fingerprint: stableFingerprint({ finding, index }),
  }));
  const evidenceRecords = [...evidence.records, ...findingRecords];
  const evidenceBounded = bounded(evidenceRecords.map((record) => ({
    evidenceId: record.evidenceId,
    class: record.class,
    title: safeText(record.title, 140) ?? record.title,
    statement: safeText(record.statement, 240) ?? record.statement,
    source: safeText(record.source, 100) ?? record.source,
    provenance: safeText(record.provenance, 100) ?? record.provenance,
    status: record.status,
    relatedFindingIds: record.relatedFindingIds.slice(0, 6),
    relatedTestIds: record.relatedTestIds.slice(0, 6),
    relatedConditionIds: record.relatedConditionIds.slice(0, 6),
    relatedSurfaces: record.relatedSurfaces.slice(0, 6).map((item) => safeText(item, 80) ?? item),
    headSha: record.headSha,
    stale: record.stale,
    fingerprint: record.fingerprint,
  })), LIMITS.evidenceRecords, (record) => (
    record.class === "externally-verified" ? 7
      : record.class === "directly-observed" ? 6
        : record.class === "human-confirmed" ? 5
          : record.class === "builder-declared" ? 3
            : record.class === "assumption" ? 2
              : 1
  ));
  const assumptionBounded = bounded(evidence.assumptions.map((assumption) => ({
    assumptionId: assumption.assumptionId,
    statement: safeText(assumption.statement, 220) ?? assumption.statement,
    source: safeText(assumption.source, 100) ?? assumption.source,
    provenance: safeText(assumption.provenance, 100) ?? assumption.provenance,
    importance: assumption.importance,
    status: assumption.status,
    affectedSurfaces: assumption.affectedSurfaces.slice(0, 6).map((item) => safeText(item, 80) ?? item),
    relatedFindingIds: assumption.relatedFindingIds.slice(0, 6),
    relatedEvidenceIds: assumption.relatedEvidenceIds.slice(0, 6),
    relatedConditionIds: assumption.relatedConditionIds.slice(0, 6),
    evidenceRequired: safeText(assumption.evidenceRequired, 220) ?? assumption.evidenceRequired,
    ownerCue: safeText(assumption.ownerCue, 80),
    introducedHeadSha: assumption.introducedHeadSha,
    stale: assumption.stale,
    fingerprint: assumption.fingerprint,
  })), LIMITS.assumptions, (assumption) => (
    assumption.importance === "blocking" && assumption.status === "open" ? 8
      : assumption.status === "open" ? 5
        : assumption.status === "accepted" ? 4
          : 2
  ));
  const clauseBounded = bounded(contract.clauses.map((clause) => ({
    clauseId: clause.clauseId,
    type: clause.type,
    title: safeText(clause.title, 140) ?? clause.title,
    statement: safeText(clause.statement, 240) ?? clause.statement,
    rationale: safeText(clause.rationale, 240) ?? clause.rationale,
    importance: clause.importance,
    status: clause.status,
    source: safeText(clause.source, 100) ?? clause.source,
    provenance: safeText(clause.provenance, 100) ?? clause.provenance,
    relatedEvidenceIds: clause.relatedEvidenceIds.slice(0, 8),
    relatedAssumptionIds: clause.relatedAssumptionIds.slice(0, 8),
    relatedAffectedSurfaces: clause.relatedAffectedSurfaces.slice(0, 6).map((item) => safeText(item, 80) ?? item),
    requirements: clause.requirements.slice(0, 4),
    evidenceRequired: safeText(clause.evidenceRequired, 240) ?? clause.evidenceRequired,
    currentSupportingEvidenceIds: clause.currentSupportingEvidenceIds.slice(0, 8),
    ownerCue: safeText(clause.ownerCue, 80),
    lastEvaluatedHeadSha: clause.lastEvaluatedHeadSha,
    stale: clause.stale,
    fingerprint: clause.fingerprint,
  })), LIMITS.clauses, (clause) => (
    clause.importance === "blocking" && clause.status === "open" ? 8
      : clause.status === "accepted" ? 7
        : clause.status === "open" ? 6
          : clause.status === "satisfied" ? 3
            : 1
  ));
  const reviewDiffExamples = bounded(reviewDiffItems(reviewDiff), LIMITS.reviewDiffExamples, (item) => (
    item.status === "added" || item.status === "reopened" ? 5 : item.status === "changed" ? 4 : item.status === "cleared" ? 3 : 1
  ));
  const stillOpen = readinessDelta
    ? readinessDelta.unchangedOpenMergeConditions.length + readinessDelta.openedMergeConditions.length + readinessDelta.reopenedMergeConditions.length
    : decisionConditions(report.conditionsBeforeMerge).length;

  const packBase = {
    reportId: contract.reportId,
    canonicalRunId: run.runId,
    changeIdentity: {
      repository: report.pr.repository,
      pullRequestNumber: report.pr.number,
      title: safeText(report.pr.title, 180) ?? report.pr.title,
      sourceType: run.sourceType ?? sourceType ?? report.pr.branch,
      sourceUrl: safeSourceUrl(sourceUrl ?? run.sourceUrl),
      baseSha: run.baseSha,
      headSha: run.headSha,
      author: safeText(report.pr.author, 100),
      producerType: changePassport?.producerType ?? "unknown",
    },
    reviewResult: {
      recommendation: report.verdict.recommendation,
      riskBand: report.verdict.riskLevel,
      riskScore: report.verdict.riskScore,
      executiveSummary: safeText(report.verdict.summary, 280) ?? report.verdict.summary,
      nextAction: safeText(nextAction(report), 220) ?? nextAction(report),
      reviewMode: run.reviewMode ?? report.pr.reviewProfile ?? "standard",
      analysisSource: run.analysisSource,
    },
    builderDeclaration: {
      present: !!changePassport,
      passportId: changePassport?.passportId,
      schemaVersion: changePassport?.schemaVersion,
      source: changePassport?.source,
      producerType: changePassport?.producerType ?? "unknown",
      intent: safeText(changePassport?.taskIntent, 220),
      changeSummary: safeText(changePassport?.changeSummary, 260),
      producer: changePassport?.producer ? {
        tool: safeText(changePassport.producer.tool, 80),
        provider: safeText(changePassport.producer.provider, 80),
        model: safeText(changePassport.producer.model, 100),
        externalRunId: safeText(changePassport.producer.externalRunId, 120),
      } : undefined,
      claimedValidation: listStrings([...(changePassport?.claimedValidation ?? []), ...(changePassport?.claimedTests ?? [])]),
      assumptions: listStrings(changePassport?.assumptions),
      limitations: listStrings(changePassport?.knownLimitations),
      unresolvedUncertainty: listStrings(changePassport?.unresolvedUncertainty),
      comparisonSummary: passportComparison?.summary ? safeText(passportComparison.summary, 220) : undefined,
    },
    independentVerification: {
      boundaryAssessmentId: boundary.assessmentId,
      classification: boundary.classification,
      deterministicBaselineApplied: boundary.verifier.deterministicBaselineApplied,
      verifierTypes: boundary.verifier.verifierTypes,
      dimensions: boundary.dimensions.map((item) => ({
        key: item.key,
        status: item.status,
        rationale: safeText(item.rationale, 180) ?? item.rationale,
      })),
      limitations: boundary.knownLimitations.map((item) => safeText(item, 180) ?? item).slice(0, 8),
    },
    evidence: {
      countsByClass: evidence.countsByClass,
      records: evidenceBounded,
    },
    assumptions: {
      openBlocking: evidence.openBlockingAssumptions,
      openAdvisory: evidence.openAdvisoryAssumptions,
      records: assumptionBounded,
    },
    mergeContract: {
      contractId: contract.contractId,
      schemaVersion: contract.schemaVersion,
      state: contract.state,
      contractFingerprint: contract.contractFingerprint,
      currentEvaluationFingerprint: contract.currentEvaluationFingerprint,
      summary: mergeContractSummary(contract),
      blockingOpen: contract.clauses.filter((item) => item.importance === "blocking" && item.status === "open").length,
      advisoryOpen: contract.clauses.filter((item) => item.importance === "advisory" && item.status === "open").length,
      satisfied: contract.clauses.filter((item) => item.status === "satisfied").length,
      acceptedRisk: contract.clauses.filter((item) => item.status === "accepted").length,
      unresolvedAssumptionLinked: contract.clauses.filter((item) => item.relatedAssumptionIds.length > 0 && item.status === "open").length,
      clauses: clauseBounded,
    },
    reviewEvolution: {
      available: !!readinessDelta,
      reason: readinessDelta ? undefined : "No previous completed run is attached to this report.",
      previousRunId: readinessDelta?.previousRunId,
      currentRunId: readinessDelta?.currentRunId ?? run.runId,
      previousHeadSha: readinessDelta?.previousHeadSha,
      currentHeadSha: readinessDelta?.currentHeadSha ?? run.headSha,
      scoreMovement: readinessDelta?.previousScore !== undefined ? `${readinessDelta.previousScore} -> ${readinessDelta.currentScore}` : undefined,
      recommendationMovement: readinessDelta?.previousRecommendation ? `${readinessDelta.previousRecommendation} -> ${readinessDelta.currentRecommendation}` : readinessDelta?.currentRecommendation,
      riskMovement: readinessDelta?.previousRiskLevel ? `${readinessDelta.previousRiskLevel} -> ${readinessDelta.currentRiskLevel}` : readinessDelta?.currentRiskLevel,
      openedConditions: readinessDelta?.openedMergeConditions.length ?? 0,
      clearedConditions: readinessDelta?.clearedMergeConditions.length ?? 0,
      reopenedConditions: readinessDelta?.reopenedMergeConditions.length ?? 0,
      stillOpenConditions: stillOpen,
      addedBlockers: readinessDelta?.addedBlockers.length ?? 0,
      clearedBlockers: readinessDelta?.clearedBlockers.length ?? 0,
      evidenceMovement: readinessDelta?.evidenceMovement,
      verificationBoundaryMovement: readinessDelta?.verificationBoundaryMovement,
      mergeContractMovement: readinessDelta?.mergeContractMovement,
      reviewDiffExamples,
    },
    humanDecision: {
      present: !!reviewState || acceptedRiskEvents.length > 0,
      status: safeText(reviewState?.status, 80),
      owner: safeText(reviewState?.owner, 80),
      note: safeText(reviewState?.note, LIMITS.note),
      updatedAt: reviewState?.updatedAt,
      applicableHeadSha: run.headSha,
      stale: humanDecisionStale,
      acceptedRiskEvents: bounded(acceptedRiskEvents.map((event) => ({
        title: safeText(event.title, 120) ?? event.title,
        timestamp: event.timestamp,
        detail: safeText(event.detail, 220) ?? event.detail,
        nextState: safeText(event.nextState, 80),
      })), 6),
      recentEvents: { total: decisionHistory.length, exported: recentEvents.length, truncated: decisionHistory.length > recentEvents.length, items: recentEvents },
    },
    provenance: {
      canonicalRun: run,
      canonicalRunSchemaVersion: CANONICAL_RUN_SCHEMA_VERSION,
      reportSchemaVersion: run.reportSchemaVersion ?? REPORT_SCHEMA_VERSION,
      generatorVersion: run.generatorVersion ?? REPORT_GENERATOR_VERSION,
      deterministicRulesetVersion: run.deterministicRulesetVersion ?? DETERMINISTIC_RULESET_VERSION,
      provider: run.provider,
      model: run.model,
      inputFingerprint: run.inputFingerprint,
      configurationFingerprint: run.configurationFingerprint,
      resultFingerprint: run.resultFingerprint,
      reproducibility: run.reproducibility,
      reproducibilityLimitation: run.reproducibilityLimitation,
    },
    limitations: stateInfo.limitations,
    unavailableSections: stateInfo.unavailable,
    stale: humanDecisionStale,
  };

  const sectionFingerprints = {
    changeIdentity: sectionFingerprint(packBase.changeIdentity),
    reviewResult: sectionFingerprint(packBase.reviewResult),
    builderDeclaration: sectionFingerprint(packBase.builderDeclaration),
    independentVerification: sectionFingerprint(packBase.independentVerification),
    evidence: sectionFingerprint(packBase.evidence),
    assumptions: sectionFingerprint(packBase.assumptions),
    mergeContract: sectionFingerprint(packBase.mergeContract),
    reviewEvolution: sectionFingerprint(packBase.reviewEvolution),
    humanDecision: sectionFingerprint(packBase.humanDecision),
    provenance: sectionFingerprint(packBase.provenance),
  };
  const packFingerprint = stableFingerprint({ ...packBase, sectionFingerprints });
  const generationStatus: VerificationPackState = humanDecisionStale ? "stale" : stateInfo.state;

  return {
    packId: `vp_${packFingerprint.slice(0, 12)}`,
    schemaVersion: VERIFICATION_PACK_SCHEMA_VERSION,
    generationStatus,
    createdAt,
    ...packBase,
    sectionFingerprints,
    packFingerprint,
  };
}

function safeSourceUrl(value?: string) {
  if (!value) return undefined;
  return /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/pull\/\d+/.test(value) ? value : undefined;
}

function escapeMarkdown(value: string | undefined) {
  return (value ?? "Unavailable").replace(/([\\`*_[\]<>])/g, "\\$1");
}

function markdownList(items: string[], empty = "None recorded.") {
  return items.length > 0 ? items.map((item) => `- ${escapeMarkdown(item)}`).join("\n") : empty;
}

export function verificationPackToMarkdown(pack: VerificationPack) {
  const evidenceCounts = evidenceClassOrder
    .map((evidenceClass) => `${evidenceClassLabels[evidenceClass]}: ${pack.evidence.countsByClass[evidenceClass]}`)
    .join("; ");
  const clauses = pack.mergeContract.clauses.items.map((clause) => `${clause.importance} / ${clause.status}: ${clause.statement}`);
  const assumptions = pack.assumptions.records.items
    .filter((item) => item.status === "open" || item.status === "accepted" || item.stale)
    .map((item) => `${item.importance} / ${item.status}: ${item.statement}`);

  return [
    `# Lintel Verification Pack`,
    "",
    `Pack: \`${escapeMarkdown(pack.packId)}\``,
    `State: ${escapeMarkdown(pack.generationStatus)}`,
    `Head: \`${escapeMarkdown(shortSha(pack.changeIdentity.headSha))}\``,
    `Repository: ${escapeMarkdown(pack.changeIdentity.repository)}`,
    pack.changeIdentity.pullRequestNumber ? `Pull request: #${pack.changeIdentity.pullRequestNumber} — ${escapeMarkdown(pack.changeIdentity.title)}` : `Review: ${escapeMarkdown(pack.changeIdentity.title)}`,
    "",
    "## Review result",
    `Recommendation: ${escapeMarkdown(pack.reviewResult.recommendation)}`,
    `Risk: ${escapeMarkdown(pack.reviewResult.riskBand)} (${pack.reviewResult.riskScore}/100)`,
    `Review mode: ${escapeMarkdown(pack.reviewResult.reviewMode)}`,
    `Analysis source: ${escapeMarkdown(pack.reviewResult.analysisSource)}`,
    `Next action: ${escapeMarkdown(pack.reviewResult.nextAction)}`,
    "",
    "## Builder declaration",
    pack.builderDeclaration.present
      ? [
        `Producer: ${escapeMarkdown(pack.builderDeclaration.producerType)}`,
        `Intent: ${escapeMarkdown(pack.builderDeclaration.intent)}`,
        `Claimed validation: ${pack.builderDeclaration.claimedValidation.total}`,
        `Assumptions: ${pack.builderDeclaration.assumptions.total}`,
        `Unresolved uncertainty: ${pack.builderDeclaration.unresolvedUncertainty.total}`,
      ].join("\n")
      : "No Change Passport was supplied.",
    "",
    "## Independent verification",
    `Boundary: ${escapeMarkdown(pack.independentVerification.classification)}`,
    `Deterministic baseline: ${pack.independentVerification.deterministicBaselineApplied ? "applied" : "unknown"}`,
    `Verifier components: ${escapeMarkdown(pack.independentVerification.verifierTypes.join(" / "))}`,
    "",
    "## Evidence",
    evidenceCounts,
    "",
    "## Assumptions",
    `Open blocking: ${pack.assumptions.openBlocking}`,
    `Open advisory: ${pack.assumptions.openAdvisory}`,
    markdownList(assumptions),
    "",
    "## Merge Contract",
    `Contract: \`${escapeMarkdown(pack.mergeContract.contractId)}\``,
    `State: ${escapeMarkdown(pack.mergeContract.state)}`,
    `Blocking open: ${pack.mergeContract.blockingOpen}`,
    `Advisory open: ${pack.mergeContract.advisoryOpen}`,
    `Satisfied: ${pack.mergeContract.satisfied}`,
    `Accepted risk: ${pack.mergeContract.acceptedRisk}`,
    markdownList(clauses),
    "",
    "## Review evolution",
    pack.reviewEvolution.available
      ? [
        `Run: \`${escapeMarkdown(fingerprintPrefix(pack.reviewEvolution.previousRunId))}\` -> \`${escapeMarkdown(fingerprintPrefix(pack.reviewEvolution.currentRunId))}\``,
        `Score: ${escapeMarkdown(pack.reviewEvolution.scoreMovement)}`,
        `Recommendation: ${escapeMarkdown(pack.reviewEvolution.recommendationMovement)}`,
        `Risk: ${escapeMarkdown(pack.reviewEvolution.riskMovement)}`,
        `Opened: ${pack.reviewEvolution.openedConditions}; cleared: ${pack.reviewEvolution.clearedConditions}; reopened: ${pack.reviewEvolution.reopenedConditions}; still open: ${pack.reviewEvolution.stillOpenConditions}`,
      ].join("\n")
      : escapeMarkdown(pack.reviewEvolution.reason),
    "",
    "## Human decision",
    pack.humanDecision.present
      ? [
        `State: ${escapeMarkdown(pack.humanDecision.status)}`,
        `Owner: ${escapeMarkdown(pack.humanDecision.owner)}`,
        `Updated: ${escapeMarkdown(pack.humanDecision.updatedAt ?? undefined)}`,
        `Stale: ${pack.humanDecision.stale ? "yes" : "no"}`,
        pack.humanDecision.note ? `Note: ${escapeMarkdown(pack.humanDecision.note)}` : "Note: none",
      ].join("\n")
      : "No local human decision was recorded in this pack.",
    "",
    "## Provenance",
    `Canonical run: \`${escapeMarkdown(fingerprintPrefix(pack.canonicalRunId))}\``,
    `Generator/ruleset: ${escapeMarkdown(pack.provenance.generatorVersion)} / ${escapeMarkdown(pack.provenance.deterministicRulesetVersion)}`,
    `Input fingerprint: \`${escapeMarkdown(fingerprintPrefix(pack.provenance.inputFingerprint))}\``,
    `Configuration fingerprint: \`${escapeMarkdown(fingerprintPrefix(pack.provenance.configurationFingerprint))}\``,
    `Result fingerprint: \`${escapeMarkdown(fingerprintPrefix(pack.provenance.resultFingerprint))}\``,
    `Pack fingerprint: \`${escapeMarkdown(fingerprintPrefix(pack.packFingerprint))}\``,
    "",
    "## Limitations",
    markdownList([...pack.limitations, ...pack.unavailableSections.map((item) => `Unavailable: ${item}`)]),
    "",
    "_This Verification Pack is a derived review artifact. It is not proof of correctness and does not authorize merge automatically._",
  ].join("\n");
}

export function verificationPackJson(pack: VerificationPack) {
  return JSON.stringify(pack, null, 2);
}

export function verificationPackHandoffSummary(pack: VerificationPack) {
  const direct = pack.evidence.countsByClass["directly-observed"];
  const external = pack.evidence.countsByClass["externally-verified"];
  return `Pack ${fingerprintPrefix(pack.packId)}; Head ${shortSha(pack.changeIdentity.headSha)}; State ${pack.generationStatus}; Contract ${pack.mergeContract.blockingOpen} blocking open; Assumptions ${pack.assumptions.openBlocking} blocking open; Evidence ${direct} directly observed, ${external} externally verified.`;
}

export function verificationPackFilename(pack: VerificationPack, extension: "json" | "md") {
  const repo = pack.changeIdentity.repository.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "repository";
  const pr = pack.changeIdentity.pullRequestNumber ? `pr-${pack.changeIdentity.pullRequestNumber}` : "review";
  const head = shortSha(pack.changeIdentity.headSha).replace(/[^a-z0-9]+/gi, "") || "head";
  return `lintel-${repo}-${pr}-${head}-verification-pack.${extension}`;
}
