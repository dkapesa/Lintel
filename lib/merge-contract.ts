import type { BuilderVerifierAssessment } from "./builder-verifier-boundary";
import type { ChangePassport } from "./change-passport";
import {
  ASSUMPTION_REGISTRY_SCHEMA_VERSION,
  buildEvidenceHierarchy,
  EVIDENCE_HIERARCHY_SCHEMA_VERSION,
  type AssumptionRecord,
  type EvidenceClass,
  type EvidenceHierarchySummary,
  type EvidenceRecord,
} from "./evidence-hierarchy";
import type { Report } from "./mock-report";
import { decisionConditions, pruneUnsupportedReviewerFocus } from "./report-quality";

export const MERGE_CONTRACT_SCHEMA_VERSION = "1.0";
export const MERGE_CONTRACT_CLAUSE_SCHEMA_VERSION = "1.0";

export type MergeContractState = "open" | "partially-satisfied" | "satisfied" | "accepted-risk" | "stale" | "historical" | "unavailable";
export type MergeContractClauseType =
  | "test"
  | "evidence"
  | "operational-readiness"
  | "security-privacy"
  | "API-contract"
  | "recovery-rollback"
  | "review"
  | "assumption-resolution"
  | "change-verification"
  | "other";
export type MergeContractClauseStatus = "open" | "satisfied" | "accepted" | "invalidated" | "superseded" | "stale" | "unavailable";
export type MergeContractImportance = "blocking" | "advisory";
export type MergeContractRequirementType =
  | "evidence-present"
  | "evidence-class-present"
  | "evidence-reference-satisfied"
  | "test-gap-resolved"
  | "assumption-status-in"
  | "finding-status-in"
  | "condition-status-in"
  | "human-confirmation-present"
  | "reviewer-decision-present"
  | "verification-boundary-status-in";

export type MergeContractRequirement = {
  requirementId: string;
  type: MergeContractRequirementType;
  mode: "all" | "any";
  description: string;
  acceptedEvidenceClasses: EvidenceClass[];
  referencedIds: string[];
  currentResult: "satisfied" | "missing" | "not-applicable";
  limitation?: string;
};

export type MergeContractClause = {
  clauseId: string;
  schemaVersion: typeof MERGE_CONTRACT_CLAUSE_SCHEMA_VERSION;
  type: MergeContractClauseType;
  title: string;
  statement: string;
  rationale: string;
  importance: MergeContractImportance;
  status: MergeContractClauseStatus;
  source: string;
  provenance: string;
  relatedFindingIds: string[];
  relatedTestGapIds: string[];
  relatedEvidenceIds: string[];
  relatedAssumptionIds: string[];
  relatedAffectedSurfaces: string[];
  requirements: MergeContractRequirement[];
  evidenceRequired: string;
  currentSupportingEvidenceIds: string[];
  ownerCue?: string;
  introducedRunId?: string;
  introducedHeadSha?: string;
  lastEvaluatedRunId?: string;
  lastEvaluatedHeadSha?: string;
  acceptedRisk?: {
    reason: string;
    acceptedAt: string;
    headSha?: string;
  };
  stale: boolean;
  fingerprint: string;
};

export type MergeContract = {
  contractId: string;
  schemaVersion: typeof MERGE_CONTRACT_SCHEMA_VERSION;
  reportId: string;
  canonicalRunId?: string;
  repository: string;
  pullRequestNumber?: number;
  baseSha?: string;
  headSha?: string;
  sourceType: string;
  reviewMode: string;
  createdAt: string;
  updatedAt: string;
  state: MergeContractState;
  clauses: MergeContractClause[];
  evidenceHierarchyVersion: string;
  assumptionRegistryVersion: string;
  builderVerifierAssessmentId?: string;
  contractFingerprint: string;
  currentEvaluationFingerprint: string;
  limitations: string[];
};

function normaliseValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normaliseValue);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        const next = (value as Record<string, unknown>)[key];
        if (next !== undefined) result[key] = normaliseValue(next);
        return result;
      }, {});
  }
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  return value;
}

function stableFingerprint(value: unknown) {
  const serialized = JSON.stringify(normaliseValue(value));
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let index = 0; index < serialized.length; index += 1) {
    const code = serialized.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, "0")}${(h1 >>> 0).toString(16).padStart(8, "0")}`;
}

function safeText(value: string, limit = 260) {
  return value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "[raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function keyText(value: string) {
  return safeText(value, 220).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "clause";
}

function requirement(input: Omit<MergeContractRequirement, "requirementId">) {
  const fingerprint = stableFingerprint(input);
  return { ...input, requirementId: `req_${fingerprint.slice(0, 10)}` };
}

function relatedEvidence(statement: string, evidence: EvidenceRecord[], accepted: EvidenceClass[]) {
  const tokens = new Set(statement.toLowerCase().match(/[a-z0-9_/-]{4,}/g) ?? []);
  return evidence.filter((record) => {
    if (!accepted.includes(record.class)) return false;
    const value = `${record.title} ${record.statement} ${record.relatedSurfaces.join(" ")}`.toLowerCase();
    for (const token of tokens) if (value.includes(token)) return true;
    return false;
  });
}

function ownerCue(statement: string, report: Report) {
  const focus = pruneUnsupportedReviewerFocus(report) ?? [];
  return focus.find((item) => `${item.area} ${item.reason}`.toLowerCase().includes(statement.toLowerCase().split(" ")[0]))?.area
    ?? focus[0]?.area;
}

function clause(input: Omit<MergeContractClause, "clauseId" | "schemaVersion" | "fingerprint">) {
  const fingerprint = stableFingerprint({
    type: input.type,
    statement: input.statement,
    source: input.source,
    relatedFindingIds: input.relatedFindingIds,
    relatedTestGapIds: input.relatedTestGapIds,
    relatedAssumptionIds: input.relatedAssumptionIds,
    relatedAffectedSurfaces: input.relatedAffectedSurfaces,
  });
  return {
    ...input,
    clauseId: `clause_${input.type}_${fingerprint.slice(0, 12)}`,
    schemaVersion: MERGE_CONTRACT_CLAUSE_SCHEMA_VERSION,
    fingerprint,
  } satisfies MergeContractClause;
}

function typeForFinding(category: Report["findings"][number]["category"]): MergeContractClauseType {
  if (category === "Security") return "security-privacy";
  if (category === "API contract") return "API-contract";
  if (category === "Reliability") return "change-verification";
  if (category === "Missing tests") return "test";
  return "review";
}

function dedupeClauses(clauses: MergeContractClause[]) {
  const seen = new Set<string>();
  return clauses.filter((item) => {
    const key = `${item.type}:${keyText(item.statement)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function contractState(clauses: MergeContractClause[]): MergeContractState {
  if (clauses.length === 0) return "satisfied";
  const openBlocking = clauses.some((item) => item.importance === "blocking" && item.status === "open");
  const acceptedBlocking = clauses.some((item) => item.importance === "blocking" && item.status === "accepted");
  const openAny = clauses.some((item) => item.status === "open");
  const satisfied = clauses.filter((item) => item.status === "satisfied").length;
  if (openBlocking) return "open";
  if (acceptedBlocking) return "accepted-risk";
  if (openAny || (satisfied > 0 && satisfied < clauses.length)) return "partially-satisfied";
  return "satisfied";
}

export function buildMergeContract({
  report,
  changePassport,
  evidenceHierarchy,
  builderVerifier,
  canonicalRunId,
  baseSha,
  headSha,
  sourceType,
  reviewMode,
  createdAt = new Date().toISOString(),
}: {
  report: Report;
  changePassport?: ChangePassport | null;
  evidenceHierarchy?: EvidenceHierarchySummary;
  builderVerifier?: BuilderVerifierAssessment;
  canonicalRunId?: string;
  baseSha?: string;
  headSha?: string;
  sourceType?: string;
  reviewMode?: string;
  createdAt?: string;
}): MergeContract {
  const evidence = evidenceHierarchy ?? buildEvidenceHierarchy(report, changePassport, { runId: canonicalRunId, headSha });
  const clauses: MergeContractClause[] = [];
  const conditions = decisionConditions(report.conditionsBeforeMerge);

  conditions.forEach((condition, index) => {
    const related = relatedEvidence(condition, evidence.records, ["externally-verified", "directly-observed", "human-confirmed"]);
    clauses.push(clause({
      type: "change-verification",
      title: "Prove merge condition",
      statement: safeText(condition),
      rationale: "The readiness report requires this condition before merge.",
      importance: "blocking",
      status: "open",
      source: "Conditions before merge",
      provenance: "Lintel merge contract",
      relatedFindingIds: [],
      relatedTestGapIds: [],
      relatedEvidenceIds: related.map((item) => item.evidenceId),
      relatedAssumptionIds: evidence.assumptions.filter((assumption) => condition.toLowerCase().includes(assumption.statement.toLowerCase().slice(0, 24))).map((item) => item.assumptionId),
      relatedAffectedSurfaces: pruneUnsupportedReviewerFocus(report)?.map((item) => item.area).slice(0, 3) ?? [],
      requirements: [
        requirement({
          type: "evidence-class-present",
          mode: "any",
          description: "Provide directly observed, externally verified or bounded human-confirmed evidence that the condition is satisfied.",
          acceptedEvidenceClasses: ["externally-verified", "directly-observed", "human-confirmed"],
          referencedIds: [`condition-${index}`],
          currentResult: "missing",
          limitation: "Builder declarations and model inference are not sufficient for this blocking condition.",
        }),
      ],
      evidenceRequired: `Evidence that satisfies: ${safeText(condition)}`,
      currentSupportingEvidenceIds: [],
      ownerCue: ownerCue(condition, report),
      introducedRunId: canonicalRunId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: false,
    }));
  });

  report.missingTests.slice(0, 8).forEach((missingTest, index) => {
    clauses.push(clause({
      type: "test",
      title: "Resolve missing test evidence",
      statement: safeText(missingTest),
      rationale: "Lintel found a missing test gap that must be resolved before the test obligation is clear.",
      importance: "blocking",
      status: "open",
      source: "Test plan",
      provenance: "Lintel missing coverage signal",
      relatedFindingIds: [],
      relatedTestGapIds: [`test-gap-${index}`],
      relatedEvidenceIds: [],
      relatedAssumptionIds: [],
      relatedAffectedSurfaces: ["Tests/coverage"],
      requirements: [
        requirement({
          type: "test-gap-resolved",
          mode: "all",
          description: "Resolve the missing test gap with directly observed test structure or externally verified test result.",
          acceptedEvidenceClasses: ["externally-verified", "directly-observed"],
          referencedIds: [`test-gap-${index}`],
          currentResult: "missing",
          limitation: "A builder-declared test command is context only unless a supporting result or changed test structure is present.",
        }),
      ],
      evidenceRequired: "Direct test evidence or external test result.",
      currentSupportingEvidenceIds: [],
      ownerCue: "Test owner",
      introducedRunId: canonicalRunId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: false,
    }));
  });

  report.findings.filter((finding) => finding.severity === "HIGH" || finding.severity === "CRITICAL").slice(0, 6).forEach((finding, index) => {
    const related = relatedEvidence(`${finding.title} ${finding.evidence} ${finding.action}`, evidence.records, ["externally-verified", "directly-observed"]);
    clauses.push(clause({
      type: typeForFinding(finding.category),
      title: safeText(finding.title, 120),
      statement: safeText(finding.action || finding.title),
      rationale: safeText(finding.evidence),
      importance: "blocking",
      status: "open",
      source: "Risk finding",
      provenance: finding.provenance ?? "Rule detected",
      relatedFindingIds: [`finding-${index}`],
      relatedTestGapIds: [],
      relatedEvidenceIds: related.map((item) => item.evidenceId),
      relatedAssumptionIds: [],
      relatedAffectedSurfaces: [finding.category],
      requirements: [
        requirement({
          type: "finding-status-in",
          mode: "all",
          description: "Resolve or explicitly accept the blocking finding.",
          acceptedEvidenceClasses: ["externally-verified", "directly-observed", "human-confirmed"],
          referencedIds: [`finding-${index}`],
          currentResult: "missing",
        }),
      ],
      evidenceRequired: safeText(finding.action),
      currentSupportingEvidenceIds: [],
      ownerCue: ownerCue(`${finding.title} ${finding.action}`, report),
      introducedRunId: canonicalRunId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: false,
    }));
  });

  evidence.assumptions.filter((assumption) => assumption.importance === "blocking" && assumption.status === "open").slice(0, 6).forEach((assumption: AssumptionRecord) => {
    clauses.push(clause({
      type: "assumption-resolution",
      title: "Resolve open assumption",
      statement: safeText(assumption.statement),
      rationale: "This assumption remains open in the Assumption Registry.",
      importance: "blocking",
      status: "open",
      source: assumption.source,
      provenance: assumption.provenance,
      relatedFindingIds: assumption.relatedFindingIds,
      relatedTestGapIds: [],
      relatedEvidenceIds: assumption.relatedEvidenceIds,
      relatedAssumptionIds: [assumption.assumptionId],
      relatedAffectedSurfaces: assumption.affectedSurfaces,
      requirements: [
        requirement({
          type: "assumption-status-in",
          mode: "all",
          description: "Support, invalidate or explicitly accept the assumption with bounded local rationale.",
          acceptedEvidenceClasses: ["externally-verified", "directly-observed", "human-confirmed"],
          referencedIds: [assumption.assumptionId],
          currentResult: "missing",
          limitation: "Accepted uncertainty is tracked separately from satisfied evidence.",
        }),
      ],
      evidenceRequired: assumption.evidenceRequired,
      currentSupportingEvidenceIds: assumption.resolutionEvidenceIds,
      ownerCue: assumption.ownerCue,
      introducedRunId: assumption.introducedRunId ?? canonicalRunId,
      introducedHeadSha: assumption.introducedHeadSha ?? headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: assumption.stale,
    }));
  });

  if (report.operationalReadiness?.status === "ATTENTION") {
    clauses.push(clause({
      type: "operational-readiness",
      title: "Operational readiness needs review",
      statement: safeText(report.operationalReadiness.summary),
      rationale: "Operational readiness is marked attention for this review.",
      importance: "advisory",
      status: "open",
      source: "Operational readiness",
      provenance: "Lintel structured analysis",
      relatedFindingIds: [],
      relatedTestGapIds: [],
      relatedEvidenceIds: evidence.records.filter((item) => item.source === "Operational readiness").map((item) => item.evidenceId),
      relatedAssumptionIds: [],
      relatedAffectedSurfaces: ["Operational readiness"],
      requirements: [
        requirement({
          type: "human-confirmation-present",
          mode: "any",
          description: "A reviewer should confirm operational detection, recovery or impact handling.",
          acceptedEvidenceClasses: ["externally-verified", "directly-observed", "human-confirmed"],
          referencedIds: ["operational-readiness"],
          currentResult: "missing",
        }),
      ],
      evidenceRequired: "Bounded operational confirmation or direct evidence of detection/recovery controls.",
      currentSupportingEvidenceIds: [],
      ownerCue: "Platform/operations reviewer",
      introducedRunId: canonicalRunId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: false,
    }));
  }

  const changedFileEvidence = evidence.records.filter((item) => item.source === "Changed files" && item.class === "directly-observed");
  if (changedFileEvidence.length > 0) {
    clauses.push(clause({
      type: "change-verification",
      title: "Changed file scope captured",
      statement: "Lintel observed the changed-file scope used to frame this review.",
      rationale: "This clause records a satisfied baseline requirement for current change context.",
      importance: "advisory",
      status: "satisfied",
      source: "Changed files",
      provenance: "Lintel deterministic input",
      relatedFindingIds: [],
      relatedTestGapIds: [],
      relatedEvidenceIds: changedFileEvidence.slice(0, 6).map((item) => item.evidenceId),
      relatedAssumptionIds: [],
      relatedAffectedSurfaces: ["Changed files"],
      requirements: [
        requirement({
          type: "evidence-class-present",
          mode: "any",
          description: "Directly observed changed-file evidence is present.",
          acceptedEvidenceClasses: ["directly-observed"],
          referencedIds: changedFileEvidence.slice(0, 6).map((item) => item.evidenceId),
          currentResult: "satisfied",
        }),
      ],
      evidenceRequired: "Directly observed changed-file scope.",
      currentSupportingEvidenceIds: changedFileEvidence.slice(0, 6).map((item) => item.evidenceId),
      introducedRunId: canonicalRunId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: false,
    }));
  }

  if (changePassport && [...changePassport.claimedValidation, ...changePassport.claimedTests].length > 0) {
    const claims = [...changePassport.claimedValidation, ...changePassport.claimedTests];
    const supporting = evidence.records.filter((item) => item.class !== "builder-declared" && claims.some((claim) => item.statement.toLowerCase().includes(claim.toLowerCase().slice(0, 16))));
    clauses.push(clause({
      type: "evidence",
      title: "Validate builder-declared test claim",
      statement: safeText(claims[0]),
      rationale: "The Change Passport includes claimed validation. It remains builder-declared unless supported by stronger evidence.",
      importance: "advisory",
      status: supporting.length > 0 ? "satisfied" : "open",
      source: "Change Passport",
      provenance: changePassport.provenance,
      relatedFindingIds: [],
      relatedTestGapIds: [],
      relatedEvidenceIds: supporting.map((item) => item.evidenceId),
      relatedAssumptionIds: [],
      relatedAffectedSurfaces: ["Validation"],
      requirements: [
        requirement({
          type: "evidence-class-present",
          mode: "any",
          description: "Support the declared validation with direct or external evidence.",
          acceptedEvidenceClasses: ["externally-verified", "directly-observed", "human-confirmed"],
          referencedIds: supporting.map((item) => item.evidenceId),
          currentResult: supporting.length > 0 ? "satisfied" : "missing",
          limitation: supporting.length > 0 ? undefined : "Builder-declared validation is not enough to satisfy this clause.",
        }),
      ],
      evidenceRequired: "Direct test evidence, external test result, or bounded human confirmation.",
      currentSupportingEvidenceIds: supporting.map((item) => item.evidenceId),
      introducedRunId: canonicalRunId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: false,
    }));
  }

  if (builderVerifier && builderVerifier.classification === "same-context verification") {
    clauses.push(clause({
      type: "review",
      title: "Review shared verifier context",
      statement: "Builder and verifier metadata may share a relevant context.",
      rationale: "Shared model, provider or execution context should be reviewed before treating model-assisted output as independent.",
      importance: "advisory",
      status: "open",
      source: "Builder-Verifier Boundary",
      provenance: builderVerifier.classification,
      relatedFindingIds: [],
      relatedTestGapIds: [],
      relatedEvidenceIds: [],
      relatedAssumptionIds: [],
      relatedAffectedSurfaces: ["Verification boundary"],
      requirements: [
        requirement({
          type: "verification-boundary-status-in",
          mode: "any",
          description: "Confirm whether shared context is acceptable for this review.",
          acceptedEvidenceClasses: ["human-confirmed"],
          referencedIds: [builderVerifier.assessmentId],
          currentResult: "missing",
        }),
      ],
      evidenceRequired: "Human confirmation or separate verifier evidence.",
      currentSupportingEvidenceIds: [],
      ownerCue: "Senior reviewer",
      introducedRunId: canonicalRunId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: canonicalRunId,
      lastEvaluatedHeadSha: headSha,
      stale: false,
    }));
  }

  const finalClauses = dedupeClauses(clauses);
  const state = contractState(finalClauses);
  const contractFingerprint = stableFingerprint(finalClauses.map((item) => ({
    type: item.type,
    statement: item.statement,
    importance: item.importance,
    status: item.status,
    requirements: item.requirements.map((requirementItem) => ({
      type: requirementItem.type,
      currentResult: requirementItem.currentResult,
      referencedIds: requirementItem.referencedIds,
    })),
  })));
  const currentEvaluationFingerprint = stableFingerprint({
    state,
    contractFingerprint,
    evidenceFingerprint: evidence.evidenceFingerprint,
    assumptionRegistryFingerprint: evidence.assumptionRegistryFingerprint,
    boundaryFingerprint: builderVerifier?.fingerprint,
  });
  const reportFingerprint = stableFingerprint({
    title: report.pr.title,
    repository: report.pr.repository,
    recommendation: report.verdict.recommendation,
    riskScore: report.verdict.riskScore,
  });

  return {
    contractId: `contract_${contractFingerprint.slice(0, 12)}`,
    schemaVersion: MERGE_CONTRACT_SCHEMA_VERSION,
    reportId: `report_${reportFingerprint.slice(0, 12)}`,
    canonicalRunId,
    repository: report.pr.repository,
    pullRequestNumber: report.pr.number,
    baseSha,
    headSha,
    sourceType: sourceType ?? report.pr.branch,
    reviewMode: reviewMode ?? report.pr.reviewProfile ?? "standard",
    createdAt,
    updatedAt: createdAt,
    state,
    clauses: finalClauses,
    evidenceHierarchyVersion: EVIDENCE_HIERARCHY_SCHEMA_VERSION,
    assumptionRegistryVersion: ASSUMPTION_REGISTRY_SCHEMA_VERSION,
    builderVerifierAssessmentId: builderVerifier?.assessmentId,
    contractFingerprint,
    currentEvaluationFingerprint,
    limitations: [
      "This contract records requirements and evidence state; it is not an automatic merge authorization.",
      "Builder declarations and model inference do not satisfy blocking clauses without stronger support.",
    ],
  };
}

export function mergeContractSummary(contract: MergeContract) {
  const blockingOpen = contract.clauses.filter((item) => item.importance === "blocking" && item.status === "open").length;
  const advisoryOpen = contract.clauses.filter((item) => item.importance === "advisory" && item.status === "open").length;
  const satisfied = contract.clauses.filter((item) => item.status === "satisfied").length;
  const accepted = contract.clauses.filter((item) => item.status === "accepted").length;
  const unresolvedAssumptions = contract.clauses.filter((item) => item.relatedAssumptionIds.length > 0 && item.status === "open").length;
  return `${blockingOpen} blocking open; ${advisoryOpen} advisory open; ${satisfied} satisfied; ${accepted} accepted-risk; ${unresolvedAssumptions} assumption unresolved.`;
}

export function safeMergeContractJson(contract: MergeContract) {
  return JSON.stringify(contract, null, 2);
}
