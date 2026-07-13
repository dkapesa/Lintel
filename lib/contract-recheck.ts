import { fingerprintPrefix, stableFingerprint, type CanonicalReviewRunManifest } from "./canonical-review-run";
import type { EvidenceClass, EvidenceHierarchySummary } from "./evidence-hierarchy";
import type { BuilderVerifierAssessment } from "./builder-verifier-boundary";
import type { MergeContract, MergeContractClause, MergeContractRequirement } from "./merge-contract";
import type { VerificationPack } from "./verification-pack";

export const CONTRACT_RECHECK_SCHEMA_VERSION = "1.0";
export const CONTRACT_RECHECK_RETENTION = 20;

export type ContractRecheckClassification =
  | "improved"
  | "regressed"
  | "mixed"
  | "unchanged"
  | "fully-satisfied"
  | "stale"
  | "incomplete"
  | "unavailable";

export type ContractRecheckClauseEvaluationStatus =
  | "still-satisfied"
  | "newly-satisfied"
  | "still-open"
  | "reopened"
  | "accepted-risk-still-recorded"
  | "accepted-risk-stale"
  | "invalidated"
  | "superseded"
  | "stale"
  | "unavailable";

export type ContractRecheckRequirementResult = {
  requirementId: string;
  type: MergeContractRequirement["type"];
  mode: MergeContractRequirement["mode"];
  previousResult: MergeContractRequirement["currentResult"];
  currentResult: MergeContractRequirement["currentResult"];
  evidenceOrRecordIds: string[];
  missingDataReason?: string;
  stale: boolean;
  explanation: string;
};

export type ContractRecheckClauseEvaluation = {
  clauseId: string;
  currentClauseId?: string;
  title: string;
  type: MergeContractClause["type"];
  importance: MergeContractClause["importance"];
  previousStatus: MergeContractClause["status"];
  currentStatus?: MergeContractClause["status"];
  evaluationStatus: ContractRecheckClauseEvaluationStatus;
  requirementEvaluations: ContractRecheckRequirementResult[];
  evidenceChange?: string;
  assumptionChange?: string;
  explanation: string;
  actionRequired: boolean;
};

export type ContractRecheckEvidenceChanges = {
  strongerEvidenceAdded: number;
  evidenceRemoved: number;
  evidenceBecameStale: number;
  builderDeclarationGainedSupport: number;
  builderDeclarationRemainsUnverified: number;
  externallyVerifiedEvidenceAdded: number;
  modelInferenceReplacedByDirectObservation: number;
  currentEvidenceNoLongerApplies: number;
};

export type ContractRecheckAssumptionChanges = {
  opened: number;
  remainedOpen: number;
  supported: number;
  invalidated: number;
  accepted: number;
  acceptedStale: number;
  superseded: number;
  stale: number;
};

export type HumanDecisionApplicability =
  | "applicable"
  | "predates-current-head"
  | "partially-applicable"
  | "unavailable";

export type ContractRecheckRecord = {
  recheckId: string;
  schemaVersion: typeof CONTRACT_RECHECK_SCHEMA_VERSION;
  repository: string;
  pullRequestNumber?: number;
  previousContractId: string;
  currentContractId: string;
  previousCanonicalRunId?: string;
  currentCanonicalRunId?: string;
  previousVerificationPackId?: string;
  currentVerificationPackId?: string;
  previousHeadSha?: string;
  currentHeadSha?: string;
  triggeredAt: string;
  source: "automated-analysis" | "manual-report" | "local-report" | "api";
  classification: ContractRecheckClassification;
  clauseEvaluations: ContractRecheckClauseEvaluation[];
  newClauses: Array<Pick<MergeContractClause, "clauseId" | "title" | "type" | "importance" | "status" | "statement" | "evidenceRequired">>;
  evidenceChanges: ContractRecheckEvidenceChanges;
  assumptionChanges: ContractRecheckAssumptionChanges;
  humanDecisionApplicability: {
    state: HumanDecisionApplicability;
    reason: string;
  };
  limitations: string[];
  fingerprint: string;
};

type BuildContractRecheckInput = {
  previousContract?: MergeContract | null;
  currentContract?: MergeContract | null;
  previousEvidenceHierarchy?: EvidenceHierarchySummary | null;
  currentEvidenceHierarchy?: EvidenceHierarchySummary | null;
  previousBuilderVerifier?: BuilderVerifierAssessment | null;
  currentBuilderVerifier?: BuilderVerifierAssessment | null;
  previousCanonicalRun?: CanonicalReviewRunManifest | null;
  currentCanonicalRun?: CanonicalReviewRunManifest | null;
  previousVerificationPack?: VerificationPack | null;
  currentVerificationPack?: VerificationPack | null;
  source?: ContractRecheckRecord["source"];
  triggeredAt?: string;
};

const evidenceStrength: Record<EvidenceClass, number> = {
  "externally-verified": 7,
  "directly-observed": 6,
  "human-confirmed": 5,
  "builder-declared": 4,
  "model-inferred": 3,
  assumption: 2,
  unknown: 1,
};

function safeText(value: string | undefined | null, limit = 220) {
  if (!value) return "";
  return value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "[raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[a-z0-9_-]{8,}\b/gi, "[REDACTED]")
    .replace(/((?:openai_api_key|api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function normalKey(value: string | undefined | null) {
  return safeText(value, 240).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function clauseContinuityKey(clause: MergeContractClause) {
  return [
    clause.type,
    normalKey(clause.statement),
    clause.relatedFindingIds.join("-"),
    clause.relatedTestGapIds.join("-"),
    clause.relatedAssumptionIds.join("-"),
    clause.relatedAffectedSurfaces.join("-"),
  ].filter(Boolean).join(":");
}

function mapClauses(clauses: MergeContractClause[]) {
  const byId = new Map<string, MergeContractClause>();
  const byKey = new Map<string, MergeContractClause>();
  clauses.forEach((clause) => {
    byId.set(clause.clauseId, clause);
    byKey.set(clauseContinuityKey(clause), clause);
  });
  return { byId, byKey };
}

function matchingCurrentClause(previous: MergeContractClause, current: ReturnType<typeof mapClauses>) {
  return current.byId.get(previous.clauseId) ?? current.byKey.get(clauseContinuityKey(previous));
}

function requirementMatchesEvidenceClass(requirement: MergeContractRequirement, hierarchy?: EvidenceHierarchySummary | null) {
  if (!hierarchy) return { result: "missing" as const, ids: [] as string[], reason: "current evidence hierarchy unavailable" };
  const accepted = new Set(requirement.acceptedEvidenceClasses);
  const records = hierarchy.records.filter((record) => accepted.has(record.class) && !record.stale && record.status !== "missing");
  return {
    result: records.length > 0 ? "satisfied" as const : "missing" as const,
    ids: records.slice(0, 8).map((record) => record.evidenceId),
    reason: records.length > 0 ? undefined : "no acceptable current evidence class present",
  };
}

function requirementMatchesReferencedEvidence(requirement: MergeContractRequirement, currentClause?: MergeContractClause, hierarchy?: EvidenceHierarchySummary | null) {
  const references = new Set(requirement.referencedIds);
  const clauseIds = currentClause?.currentSupportingEvidenceIds ?? [];
  const evidenceIds = hierarchy?.records.map((record) => record.evidenceId) ?? [];
  const matches = [...clauseIds, ...evidenceIds].filter((id) => references.has(id));
  return {
    result: matches.length > 0 ? "satisfied" as const : "missing" as const,
    ids: matches.slice(0, 8),
    reason: matches.length > 0 ? undefined : "referenced evidence is not present in the current snapshot",
  };
}

function assumptionRequirement(requirement: MergeContractRequirement, hierarchy?: EvidenceHierarchySummary | null) {
  if (!hierarchy) return { result: "missing" as const, ids: [] as string[], reason: "current assumption registry unavailable" };
  const references = new Set(requirement.referencedIds);
  const assumptions = hierarchy.assumptions.filter((item) => references.size === 0 || references.has(item.assumptionId));
  const supported = assumptions.filter((item) => item.status === "supported" || item.status === "invalidated");
  const accepted = assumptions.filter((item) => item.status === "accepted");
  if (supported.length > 0) return { result: "satisfied" as const, ids: supported.slice(0, 8).map((item) => item.assumptionId), reason: undefined };
  if (accepted.length > 0) return { result: "missing" as const, ids: accepted.slice(0, 8).map((item) => item.assumptionId), reason: "assumption was accepted as risk, not supported by evidence" };
  return { result: "missing" as const, ids: assumptions.slice(0, 8).map((item) => item.assumptionId), reason: "assumption is still open or unavailable" };
}

function boundaryRequirement(builderVerifier?: BuilderVerifierAssessment | null) {
  if (!builderVerifier) return { result: "missing" as const, ids: [] as string[], reason: "verification-boundary metadata unavailable" };
  const separated = builderVerifier.classification === "independently verified" || builderVerifier.classification === "partially separated";
  return {
    result: separated ? "satisfied" as const : "missing" as const,
    ids: [builderVerifier.assessmentId],
    reason: separated ? undefined : "verification-boundary separation was not established",
  };
}

function evaluateRequirement(
  requirement: MergeContractRequirement,
  previousClause: MergeContractClause,
  currentClause: MergeContractClause | undefined,
  currentEvidenceHierarchy?: EvidenceHierarchySummary | null,
  currentBuilderVerifier?: BuilderVerifierAssessment | null,
): ContractRecheckRequirementResult {
  let result: { result: MergeContractRequirement["currentResult"]; ids: string[]; reason?: string };

  if (currentClause?.status === "satisfied" && (requirement.type === "condition-status-in" || requirement.type === "finding-status-in" || requirement.type === "test-gap-resolved")) {
    result = { result: "satisfied", ids: [currentClause.clauseId] };
  } else if (requirement.type === "evidence-present") {
    const ids = currentClause?.currentSupportingEvidenceIds ?? [];
    result = { result: ids.length > 0 ? "satisfied" : "missing", ids, reason: ids.length > 0 ? undefined : "no supporting evidence is attached to the current clause" };
  } else if (requirement.type === "evidence-class-present") {
    result = requirementMatchesEvidenceClass(requirement, currentEvidenceHierarchy);
  } else if (requirement.type === "evidence-reference-satisfied") {
    result = requirementMatchesReferencedEvidence(requirement, currentClause, currentEvidenceHierarchy);
  } else if (requirement.type === "assumption-status-in") {
    result = assumptionRequirement(requirement, currentEvidenceHierarchy);
  } else if (requirement.type === "verification-boundary-status-in") {
    result = boundaryRequirement(currentBuilderVerifier);
  } else if (currentClause) {
    result = {
      result: currentClause.status === "satisfied" ? "satisfied" : currentClause.status === "invalidated" || currentClause.status === "superseded" ? "not-applicable" : "missing",
      ids: [currentClause.clauseId],
      reason: currentClause.status === "satisfied" ? undefined : "current clause does not show this requirement satisfied",
    };
  } else {
    result = { result: "missing", ids: [], reason: "matching current clause unavailable" };
  }

  return {
    requirementId: requirement.requirementId,
    type: requirement.type,
    mode: requirement.mode,
    previousResult: requirement.currentResult,
    currentResult: result.result,
    evidenceOrRecordIds: result.ids.slice(0, 8),
    missingDataReason: result.reason,
    stale: !!currentClause?.stale,
    explanation: result.result === "satisfied"
      ? "The current review snapshot satisfies this typed requirement."
      : safeText(result.reason ?? "The current review snapshot does not satisfy this typed requirement.", 180),
  };
}

function statusForClause(previous: MergeContractClause, current: MergeContractClause | undefined, requirements: ContractRecheckRequirementResult[], previousHeadSha?: string, currentHeadSha?: string): ContractRecheckClauseEvaluationStatus {
  const currentSatisfied = current?.status === "satisfied" || requirements.some((item) => item.currentResult === "satisfied");
  const previousSatisfied = previous.status === "satisfied";

  if (previous.status === "accepted") {
    return previous.acceptedRisk?.headSha && currentHeadSha && previous.acceptedRisk.headSha !== currentHeadSha
      ? "accepted-risk-stale"
      : previousHeadSha && currentHeadSha && previousHeadSha !== currentHeadSha
        ? "accepted-risk-stale"
        : "accepted-risk-still-recorded";
  }
  if (current?.status === "invalidated") return "invalidated";
  if (current?.status === "superseded") return "superseded";
  if (current?.stale) return "stale";
  if (!current) return "unavailable";
  if (previousSatisfied && currentSatisfied) return "still-satisfied";
  if (!previousSatisfied && currentSatisfied) return "newly-satisfied";
  if (previousSatisfied && !currentSatisfied) return "reopened";
  return "still-open";
}

function clauseExplanation(status: ContractRecheckClauseEvaluationStatus) {
  if (status === "still-satisfied") return "The latest review still contains acceptable supporting evidence.";
  if (status === "newly-satisfied") return "The previous open requirement is now satisfied by the latest review snapshot.";
  if (status === "reopened") return "A previously satisfied requirement no longer has sufficient current supporting evidence.";
  if (status === "accepted-risk-stale") return "Accepted risk was recorded for an earlier relevant head SHA and should be reaffirmed.";
  if (status === "accepted-risk-still-recorded") return "Accepted risk remains recorded, but it is not satisfied evidence.";
  if (status === "invalidated") return "Structured current data marks this clause no longer applicable.";
  if (status === "superseded") return "A newer clause formulation supersedes this one.";
  if (status === "stale") return "The clause is stale for the current head SHA.";
  if (status === "unavailable") return "Continuity with the latest contract could not be established.";
  return "The requirement remains open in the current contract.";
}

function evidenceChanges(previous?: EvidenceHierarchySummary | null, current?: EvidenceHierarchySummary | null): ContractRecheckEvidenceChanges {
  const empty = {
    strongerEvidenceAdded: 0,
    evidenceRemoved: 0,
    evidenceBecameStale: 0,
    builderDeclarationGainedSupport: 0,
    builderDeclarationRemainsUnverified: 0,
    externallyVerifiedEvidenceAdded: 0,
    modelInferenceReplacedByDirectObservation: 0,
    currentEvidenceNoLongerApplies: 0,
  };
  if (!previous || !current) return empty;

  const previousById = new Map(previous.records.map((item) => [item.evidenceId, item]));
  const currentByStatement = new Map(current.records.map((item) => [normalKey(`${item.title} ${item.statement}`), item]));

  current.records.forEach((record) => {
    const old = currentByStatement.get(normalKey(`${record.title} ${record.statement}`));
    if (record.class === "externally-verified" && !previousById.has(record.evidenceId)) empty.externallyVerifiedEvidenceAdded += 1;
    const prior = previous.records.find((item) => normalKey(`${item.title} ${item.statement}`) === normalKey(`${record.title} ${record.statement}`));
    if (prior && evidenceStrength[record.class] > evidenceStrength[prior.class]) empty.strongerEvidenceAdded += 1;
    if (record.class === "directly-observed" && previous.records.some((item) => item.class === "model-inferred" && normalKey(`${item.title} ${item.statement}`) === normalKey(`${record.title} ${record.statement}`))) {
      empty.modelInferenceReplacedByDirectObservation += 1;
    }
    if (record.class !== "builder-declared" && previous.records.some((item) => item.class === "builder-declared" && normalKey(`${item.title} ${item.statement}`) === normalKey(`${record.title} ${record.statement}`))) {
      empty.builderDeclarationGainedSupport += 1;
    }
    if (old?.stale) empty.evidenceBecameStale += 1;
  });

  previous.records.forEach((record) => {
    const key = normalKey(`${record.title} ${record.statement}`);
    const currentRecord = currentByStatement.get(key);
    if (!currentRecord) empty.evidenceRemoved += 1;
    if (record.class === "builder-declared" && currentRecord?.class === "builder-declared" && currentRecord.status === "unverified") empty.builderDeclarationRemainsUnverified += 1;
    if (currentRecord?.stale) empty.currentEvidenceNoLongerApplies += 1;
  });

  return empty;
}

function assumptionChanges(previous?: EvidenceHierarchySummary | null, current?: EvidenceHierarchySummary | null): ContractRecheckAssumptionChanges {
  const result: ContractRecheckAssumptionChanges = { opened: 0, remainedOpen: 0, supported: 0, invalidated: 0, accepted: 0, acceptedStale: 0, superseded: 0, stale: 0 };
  if (!previous || !current) return result;
  const previousByKey = new Map(previous.assumptions.map((item) => [normalKey(item.statement), item]));

  current.assumptions.forEach((item) => {
    const prior = previousByKey.get(normalKey(item.statement));
    if (!prior && item.status === "open") result.opened += 1;
    if (prior?.status === "open" && item.status === "open") result.remainedOpen += 1;
    if (prior?.status === "open" && item.status === "supported") result.supported += 1;
    if (item.status === "invalidated" && prior?.status !== "invalidated") result.invalidated += 1;
    if (item.status === "accepted" && prior?.status !== "accepted") result.accepted += 1;
    if (item.status === "accepted" && item.stale) result.acceptedStale += 1;
    if (item.status === "superseded" && prior?.status !== "superseded") result.superseded += 1;
    if (item.stale && !prior?.stale) result.stale += 1;
  });

  return result;
}

function humanDecisionApplicability(previousHeadSha?: string, currentHeadSha?: string): ContractRecheckRecord["humanDecisionApplicability"] {
  if (!previousHeadSha && !currentHeadSha) return { state: "unavailable", reason: "No head SHA is available for human-decision applicability." };
  if (previousHeadSha && currentHeadSha && previousHeadSha !== currentHeadSha) {
    return { state: "predates-current-head", reason: "Previous human decision or accepted risk was attached to an earlier head SHA." };
  }
  return { state: "applicable", reason: "No newer head SHA invalidates the recorded human decision context." };
}

function classifyRecheck(evaluations: ContractRecheckClauseEvaluation[], newClauses: ContractRecheckRecord["newClauses"], human: HumanDecisionApplicability): ContractRecheckClassification {
  const newlySatisfied = evaluations.filter((item) => item.evaluationStatus === "newly-satisfied").length;
  const reopened = evaluations.filter((item) => item.evaluationStatus === "reopened").length;
  const stillOpen = evaluations.filter((item) => item.evaluationStatus === "still-open").length;
  const stale = evaluations.filter((item) => item.evaluationStatus === "stale" || item.evaluationStatus === "accepted-risk-stale").length;
  const newBlocking = newClauses.filter((item) => item.importance === "blocking").length;

  const positive = newlySatisfied > 0;
  const negative = reopened > 0 || newBlocking > 0 || human === "predates-current-head";
  if (evaluations.length === 0 && newClauses.length === 0) return "unavailable";
  if (stale > 0 && !positive && !negative) return "stale";
  if (stillOpen === 0 && reopened === 0 && newBlocking === 0 && evaluations.some((item) => item.evaluationStatus === "still-satisfied" || item.evaluationStatus === "newly-satisfied")) return "fully-satisfied";
  if (positive && negative) return "mixed";
  if (positive) return "improved";
  if (negative) return "regressed";
  return "unchanged";
}

export function buildContractRecheck({
  previousContract,
  currentContract,
  previousEvidenceHierarchy,
  currentEvidenceHierarchy,
  previousBuilderVerifier,
  currentBuilderVerifier,
  previousCanonicalRun,
  currentCanonicalRun,
  previousVerificationPack,
  currentVerificationPack,
  source = "automated-analysis",
  triggeredAt = new Date().toISOString(),
}: BuildContractRecheckInput): ContractRecheckRecord | null {
  if (!previousContract || !currentContract) return null;

  const currentMap = mapClauses(currentContract.clauses);
  const matchedCurrentIds = new Set<string>();
  const evaluations = previousContract.clauses.map((previousClause) => {
    const currentClause = matchingCurrentClause(previousClause, currentMap);
    if (currentClause) matchedCurrentIds.add(currentClause.clauseId);
    const requirementEvaluations = previousClause.requirements.map((requirement) => evaluateRequirement(requirement, previousClause, currentClause, currentEvidenceHierarchy, currentBuilderVerifier));
    const evaluationStatus = statusForClause(previousClause, currentClause, requirementEvaluations, previousContract.headSha, currentContract.headSha);
    return {
      clauseId: previousClause.clauseId,
      currentClauseId: currentClause?.clauseId,
      title: safeText(previousClause.title, 120),
      type: previousClause.type,
      importance: previousClause.importance,
      previousStatus: previousClause.status,
      currentStatus: currentClause?.status,
      evaluationStatus,
      requirementEvaluations,
      evidenceChange: currentClause?.currentSupportingEvidenceIds.length !== previousClause.currentSupportingEvidenceIds.length
        ? `${previousClause.currentSupportingEvidenceIds.length} → ${currentClause?.currentSupportingEvidenceIds.length ?? 0} supporting evidence references`
        : undefined,
      assumptionChange: currentClause?.relatedAssumptionIds.length !== previousClause.relatedAssumptionIds.length
        ? `${previousClause.relatedAssumptionIds.length} → ${currentClause?.relatedAssumptionIds.length ?? 0} related assumptions`
        : undefined,
      explanation: clauseExplanation(evaluationStatus),
      actionRequired: ["still-open", "reopened", "accepted-risk-stale", "stale", "unavailable"].includes(evaluationStatus) && previousClause.importance === "blocking",
    } satisfies ContractRecheckClauseEvaluation;
  });

  const newClauses = currentContract.clauses
    .filter((clause) => !matchedCurrentIds.has(clause.clauseId))
    .map((clause) => ({
      clauseId: clause.clauseId,
      title: clause.title,
      type: clause.type,
      importance: clause.importance,
      status: clause.status,
      statement: safeText(clause.statement, 220),
      evidenceRequired: safeText(clause.evidenceRequired, 180),
    }));

  const human = humanDecisionApplicability(previousContract.headSha, currentContract.headSha);
  const classification = classifyRecheck(evaluations, newClauses, human.state);
  const limitations = [
    ...(previousContract.schemaVersion !== currentContract.schemaVersion ? ["Contract schema versions differ; continuity is conservative."] : []),
    ...(!previousEvidenceHierarchy || !currentEvidenceHierarchy ? ["Evidence movement is partial because one evidence hierarchy snapshot is unavailable."] : []),
    ...(!previousBuilderVerifier || !currentBuilderVerifier ? ["Verification-boundary movement is partial because one assessment is unavailable."] : []),
  ];

  const fingerprintBase = {
    schemaVersion: CONTRACT_RECHECK_SCHEMA_VERSION,
    previousContractId: previousContract.contractId,
    currentContractId: currentContract.contractId,
    previousHeadSha: previousContract.headSha,
    currentHeadSha: currentContract.headSha,
    classification,
    evaluations: evaluations.map((item) => ({ clauseId: item.clauseId, currentClauseId: item.currentClauseId, status: item.evaluationStatus })),
    newClauses: newClauses.map((item) => item.clauseId),
    human,
  };
  const fingerprint = stableFingerprint(fingerprintBase);

  return {
    recheckId: `cr_${fingerprint.slice(0, 14)}`,
    schemaVersion: CONTRACT_RECHECK_SCHEMA_VERSION,
    repository: currentContract.repository || previousContract.repository,
    pullRequestNumber: currentContract.pullRequestNumber ?? previousContract.pullRequestNumber,
    previousContractId: previousContract.contractId,
    currentContractId: currentContract.contractId,
    previousCanonicalRunId: previousCanonicalRun?.runId ?? previousContract.canonicalRunId,
    currentCanonicalRunId: currentCanonicalRun?.runId ?? currentContract.canonicalRunId,
    previousVerificationPackId: previousVerificationPack?.packId,
    currentVerificationPackId: currentVerificationPack?.packId,
    previousHeadSha: previousContract.headSha,
    currentHeadSha: currentContract.headSha,
    triggeredAt,
    source,
    classification,
    clauseEvaluations: evaluations,
    newClauses,
    evidenceChanges: evidenceChanges(previousEvidenceHierarchy, currentEvidenceHierarchy),
    assumptionChanges: assumptionChanges(previousEvidenceHierarchy, currentEvidenceHierarchy),
    humanDecisionApplicability: human,
    limitations,
    fingerprint,
  };
}

export function contractRecheckSummary(recheck?: ContractRecheckRecord | null) {
  if (!recheck) return "No contract re-check is available yet.";
  const newlySatisfied = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "newly-satisfied").length;
  const reopened = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "reopened").length;
  const newBlocking = recheck.newClauses.filter((item) => item.importance === "blocking").length;
  const staleDecision = recheck.humanDecisionApplicability.state === "predates-current-head";
  return [
    `${recheck.classification.replaceAll("-", " ")}`,
    `${newlySatisfied} newly satisfied`,
    `${reopened} reopened`,
    `${newBlocking} new blocking`,
    staleDecision ? "human decision predates current head" : undefined,
  ].filter(Boolean).join(" · ");
}

export function contractRecheckMarkdown(recheck: ContractRecheckRecord) {
  const newlySatisfied = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "newly-satisfied").length;
  const reopened = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "reopened").length;
  const stillOpen = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "still-open").length;
  return [
    "Contract re-check:",
    `- ${safeText(fingerprintPrefix(recheck.previousHeadSha))} → ${safeText(fingerprintPrefix(recheck.currentHeadSha))}`,
    `- Classification: ${safeText(recheck.classification.replaceAll("-", " "))}`,
    `- Newly satisfied: ${newlySatisfied}`,
    `- Reopened: ${reopened}`,
    `- Still open: ${stillOpen}`,
    `- New requirements: ${recheck.newClauses.length}`,
    ...(recheck.humanDecisionApplicability.state === "predates-current-head" ? ["- Previous human decision predates current head"] : []),
  ].join("\n");
}

