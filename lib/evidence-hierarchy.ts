import type { ChangePassport } from "./change-passport";
import type { Report } from "./mock-report";
import { decisionConditions, deduplicateReportItems, pruneUnsupportedReviewerFocus } from "./report-quality";

export const EVIDENCE_HIERARCHY_SCHEMA_VERSION = "1.0";
export const ASSUMPTION_REGISTRY_SCHEMA_VERSION = "1.0";

export type EvidenceClass =
  | "externally-verified"
  | "directly-observed"
  | "human-confirmed"
  | "builder-declared"
  | "model-inferred"
  | "assumption"
  | "unknown";

export type EvidenceStrength =
  | "externally verified"
  | "directly observed"
  | "human confirmed"
  | "builder declared"
  | "model inferred"
  | "assumption"
  | "unknown";

export type EvidenceRecord = {
  evidenceId: string;
  schemaVersion: typeof EVIDENCE_HIERARCHY_SCHEMA_VERSION;
  class: EvidenceClass;
  strength: EvidenceStrength;
  title: string;
  statement: string;
  source: string;
  provenance: string;
  relatedFindingIds: string[];
  relatedTestIds: string[];
  relatedConditionIds: string[];
  relatedSurfaces: string[];
  repository?: string;
  pullRequestNumber?: number;
  headSha?: string;
  status: "present" | "missing" | "unverified" | "confirmed" | "stale" | "not-applicable";
  observedAt: string;
  supportingReference?: string;
  stale: boolean;
  fingerprint: string;
};

export type AssumptionStatus = "open" | "supported" | "invalidated" | "accepted" | "superseded" | "stale";
export type AssumptionImportance = "blocking" | "advisory";

export type AssumptionRecord = {
  assumptionId: string;
  schemaVersion: typeof ASSUMPTION_REGISTRY_SCHEMA_VERSION;
  statement: string;
  source: string;
  provenance: string;
  importance: AssumptionImportance;
  status: AssumptionStatus;
  affectedSurfaces: string[];
  relatedFindingIds: string[];
  relatedEvidenceIds: string[];
  relatedConditionIds: string[];
  evidenceRequired: string;
  ownerCue?: string;
  introducedRunId?: string;
  introducedHeadSha?: string;
  lastEvaluatedRunId?: string;
  lastEvaluatedHeadSha?: string;
  resolvedAt?: string;
  acceptedAt?: string;
  resolutionEvidenceIds: string[];
  stale: boolean;
  fingerprint: string;
};

export type EvidenceHierarchySummary = {
  schemaVersion: typeof EVIDENCE_HIERARCHY_SCHEMA_VERSION;
  assumptionRegistrySchemaVersion: typeof ASSUMPTION_REGISTRY_SCHEMA_VERSION;
  records: EvidenceRecord[];
  assumptions: AssumptionRecord[];
  countsByClass: Record<EvidenceClass, number>;
  evidenceFingerprint: string;
  assumptionRegistryFingerprint: string;
  openBlockingAssumptions: number;
  openAdvisoryAssumptions: number;
};

export const evidenceClassOrder: EvidenceClass[] = [
  "externally-verified",
  "directly-observed",
  "human-confirmed",
  "builder-declared",
  "model-inferred",
  "assumption",
  "unknown",
];

export const evidenceClassLabels: Record<EvidenceClass, string> = {
  "externally-verified": "Externally verified",
  "directly-observed": "Directly observed",
  "human-confirmed": "Human confirmed",
  "builder-declared": "Builder declared",
  "model-inferred": "Model inferred",
  assumption: "Assumption",
  unknown: "Unknown",
};

const strengthByClass: Record<EvidenceClass, EvidenceStrength> = {
  "externally-verified": "externally verified",
  "directly-observed": "directly observed",
  "human-confirmed": "human confirmed",
  "builder-declared": "builder declared",
  "model-inferred": "model inferred",
  assumption: "assumption",
  unknown: "unknown",
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

function safeText(value: string, limit = 240) {
  return value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "[raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function comparisonKey(value: string) {
  return safeText(value, 180).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

function tokens(value: string) {
  return new Set(value.toLowerCase().match(/[a-z0-9_/-]{3,}/g) ?? []);
}

function overlaps(a: string, b: string) {
  const aTokens = tokens(a);
  const bTokens = tokens(b);
  for (const token of aTokens) if (bTokens.has(token)) return true;
  return false;
}

function makeEvidence(input: Omit<EvidenceRecord, "evidenceId" | "schemaVersion" | "strength" | "fingerprint">) {
  const fingerprint = stableFingerprint({
    class: input.class,
    title: input.title,
    statement: input.statement,
    source: input.source,
    provenance: input.provenance,
    headSha: input.headSha,
    status: input.status,
  });

  return {
    ...input,
    evidenceId: `ev_${fingerprint.slice(0, 12)}`,
    schemaVersion: EVIDENCE_HIERARCHY_SCHEMA_VERSION,
    strength: strengthByClass[input.class],
    fingerprint,
  } satisfies EvidenceRecord;
}

function makeAssumption(input: Omit<AssumptionRecord, "assumptionId" | "schemaVersion" | "fingerprint">) {
  const fingerprint = stableFingerprint({
    statement: input.statement,
    source: input.source,
    provenance: input.provenance,
    importance: input.importance,
    status: input.status,
    introducedHeadSha: input.introducedHeadSha,
  });

  return {
    ...input,
    assumptionId: `as_${fingerprint.slice(0, 12)}`,
    schemaVersion: ASSUMPTION_REGISTRY_SCHEMA_VERSION,
    fingerprint,
  } satisfies AssumptionRecord;
}

function dedupeEvidence(records: EvidenceRecord[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = `${record.class} ${record.title} ${record.statement}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeAssumptions(records: AssumptionRecord[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = record.statement.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function blockerAssumption(statement: string, report: Report, conditions: string[]) {
  const context = [
    ...conditions,
    ...report.findings.flatMap((finding) => [finding.title, finding.evidence, finding.action]),
  ].join(" ");
  return /(duplicate|idempot|timeout|provider|payment|refund|redemption|security|privacy|contract|rollback|recovery|migration|auth|session)/i.test(statement)
    || overlaps(statement, context);
}

function ownerCueFor(statement: string, report: Report) {
  const focus = pruneUnsupportedReviewerFocus(report) ?? [];
  return focus.find((item) => overlaps(statement, `${item.area} ${item.reason}`))?.area
    ?? focus[0]?.area;
}

export function buildEvidenceHierarchy(
  report: Report,
  passport?: ChangePassport | null,
  metadata?: { runId?: string; headSha?: string },
): EvidenceHierarchySummary {
  const timestamp = new Date().toISOString();
  const conditions = decisionConditions(report.conditionsBeforeMerge);
  const records: EvidenceRecord[] = [];
  const assumptions: AssumptionRecord[] = [];
  const repository = report.pr.repository;
  const pullRequestNumber = report.pr.number;
  const headSha = metadata?.headSha;

  for (const [index, finding] of report.findings.entries()) {
    const evidenceClass: EvidenceClass = finding.provenance === "Model assisted" ? "model-inferred" : "directly-observed";
    records.push(makeEvidence({
      class: evidenceClass,
      title: safeText(finding.title),
      statement: safeText(finding.evidence),
      source: "Lintel finding",
      provenance: finding.provenance ?? "Rule detected",
      relatedFindingIds: [`finding-${index}`],
      relatedTestIds: [],
      relatedConditionIds: conditions.filter((condition) => overlaps(condition, `${finding.title} ${finding.evidence} ${finding.action}`)).map((condition) => `condition-${comparisonKey(condition)}`),
      relatedSurfaces: [finding.category],
      repository,
      pullRequestNumber,
      headSha,
      status: "present",
      observedAt: timestamp,
      supportingReference: finding.file,
      stale: false,
    }));

    if (/(no confirmed|needs? confirmation|must prove|prove|verify|could|may|not established|unverified)/i.test(`${finding.evidence} ${finding.action}`)) {
      assumptions.push(makeAssumption({
        statement: safeText(finding.action || finding.title),
        source: "Lintel finding",
        provenance: finding.provenance ?? "Rule detected",
        importance: finding.severity === "HIGH" || finding.severity === "CRITICAL" ? "blocking" : "advisory",
        status: "open",
        affectedSurfaces: [finding.category],
        relatedFindingIds: [`finding-${index}`],
        relatedEvidenceIds: [],
        relatedConditionIds: [],
        evidenceRequired: safeText(finding.action || "Provide supporting evidence for this finding."),
        ownerCue: ownerCueFor(`${finding.title} ${finding.action}`, report),
        introducedRunId: metadata?.runId,
        introducedHeadSha: headSha,
        lastEvaluatedRunId: metadata?.runId,
        lastEvaluatedHeadSha: headSha,
        resolutionEvidenceIds: [],
        stale: false,
      }));
    }
  }

  for (const file of report.changedFiles.slice(0, 12)) {
    records.push(makeEvidence({
      class: "directly-observed",
      title: "Changed file observed",
      statement: safeText(file.path),
      source: "Changed files",
      provenance: "Lintel deterministic input",
      relatedFindingIds: [],
      relatedTestIds: [],
      relatedConditionIds: [],
      relatedSurfaces: [file.risk ? `${file.risk} risk file` : "Changed file"],
      repository,
      pullRequestNumber,
      headSha,
      status: "present",
      observedAt: timestamp,
      supportingReference: file.path,
      stale: false,
    }));
  }

  for (const missingTest of report.missingTests.slice(0, 8)) {
    records.push(makeEvidence({
      class: "unknown",
      title: "Test evidence unavailable",
      statement: safeText(missingTest),
      source: "Test plan",
      provenance: "Lintel missing coverage signal",
      relatedFindingIds: [],
      relatedTestIds: [`test-${comparisonKey(missingTest)}`],
      relatedConditionIds: [],
      relatedSurfaces: ["Tests/coverage"],
      repository,
      pullRequestNumber,
      headSha,
      status: "missing",
      observedAt: timestamp,
      stale: false,
    }));
  }

  for (const condition of conditions.slice(0, 8)) {
    assumptions.push(makeAssumption({
      statement: safeText(condition),
      source: "Conditions before merge",
      provenance: "Lintel merge contract",
      importance: "blocking",
      status: "open",
      affectedSurfaces: pruneUnsupportedReviewerFocus(report)?.map((item) => item.area).slice(0, 3) ?? [],
      relatedFindingIds: report.findings.filter((finding) => overlaps(condition, `${finding.title} ${finding.evidence} ${finding.action}`)).map((finding) => `finding-${comparisonKey(finding.title)}`),
      relatedEvidenceIds: [],
      relatedConditionIds: [`condition-${comparisonKey(condition)}`],
      evidenceRequired: safeText(`Provide evidence that this merge condition is satisfied: ${condition}`),
      ownerCue: ownerCueFor(condition, report),
      introducedRunId: metadata?.runId,
      introducedHeadSha: headSha,
      lastEvaluatedRunId: metadata?.runId,
      lastEvaluatedHeadSha: headSha,
      resolutionEvidenceIds: [],
      stale: false,
    }));
  }

  if (passport) {
    const declaredItems = [
      ...passport.claimedFiles.map((item) => ({ title: "Claimed file", statement: item, surface: "Claimed file" })),
      ...passport.claimedSurfaces.map((item) => ({ title: "Claimed surface", statement: item, surface: item })),
      ...passport.claimedValidation.map((item) => ({ title: "Claimed validation", statement: item, surface: "Validation" })),
      ...passport.claimedTests.map((item) => ({ title: "Claimed test", statement: item, surface: "Validation" })),
    ];

    for (const item of declaredItems.slice(0, 16)) {
      records.push(makeEvidence({
        class: "builder-declared",
        title: item.title,
        statement: safeText(item.statement),
        source: `Change Passport (${passport.source})`,
        provenance: passport.provenance,
        relatedFindingIds: [],
        relatedTestIds: item.title.includes("test") || item.title.includes("validation") ? [`test-${comparisonKey(item.statement)}`] : [],
        relatedConditionIds: conditions.filter((condition) => overlaps(condition, item.statement)).map((condition) => `condition-${comparisonKey(condition)}`),
        relatedSurfaces: [item.surface],
        repository,
        pullRequestNumber,
        headSha,
        status: "unverified",
        observedAt: passport.createdAt,
        supportingReference: passport.passportId,
        stale: false,
      }));
    }

    for (const statement of [...passport.assumptions, ...passport.unresolvedUncertainty].slice(0, 12)) {
      const importance: AssumptionImportance = blockerAssumption(statement, report, conditions) ? "blocking" : "advisory";
      assumptions.push(makeAssumption({
        statement: safeText(statement),
        source: `Change Passport (${passport.source})`,
        provenance: passport.provenance,
        importance,
        status: "open",
        affectedSurfaces: passport.claimedSurfaces,
        relatedFindingIds: report.findings.filter((finding) => overlaps(statement, `${finding.title} ${finding.evidence} ${finding.action}`)).map((finding) => `finding-${comparisonKey(finding.title)}`),
        relatedEvidenceIds: [],
        relatedConditionIds: conditions.filter((condition) => overlaps(statement, condition)).map((condition) => `condition-${comparisonKey(condition)}`),
        evidenceRequired: importance === "blocking"
          ? "Direct or external evidence is required before this assumption should be treated as supported."
          : "Human review should confirm whether this assumption matters for the merge decision.",
        ownerCue: ownerCueFor(statement, report),
        introducedRunId: metadata?.runId,
        introducedHeadSha: headSha,
        lastEvaluatedRunId: metadata?.runId,
        lastEvaluatedHeadSha: headSha,
        resolutionEvidenceIds: [],
        stale: false,
      }));
    }
  }

  if (report.reportQuality?.status === "PASS") {
    records.push(makeEvidence({
      class: "directly-observed",
      title: "Report quality checks passed",
      statement: "The normalized report passed current internal consistency checks.",
      source: "Report quality",
      provenance: "Lintel deterministic validation",
      relatedFindingIds: [],
      relatedTestIds: [],
      relatedConditionIds: [],
      relatedSurfaces: ["Report quality"],
      repository,
      pullRequestNumber,
      headSha,
      status: "present",
      observedAt: timestamp,
      stale: false,
    }));
  }

  const dedupedRecords = dedupeEvidence(records);
  const dedupedAssumptions = dedupeAssumptions(assumptions);
  const countsByClass = evidenceClassOrder.reduce<Record<EvidenceClass, number>>((result, item) => {
    result[item] = dedupedRecords.filter((record) => record.class === item).length;
    return result;
  }, {
    "externally-verified": 0,
    "directly-observed": 0,
    "human-confirmed": 0,
    "builder-declared": 0,
    "model-inferred": 0,
    assumption: 0,
    unknown: 0,
  });

  countsByClass.assumption = dedupedAssumptions.length;

  return {
    schemaVersion: EVIDENCE_HIERARCHY_SCHEMA_VERSION,
    assumptionRegistrySchemaVersion: ASSUMPTION_REGISTRY_SCHEMA_VERSION,
    records: dedupedRecords,
    assumptions: dedupedAssumptions,
    countsByClass,
    evidenceFingerprint: stableFingerprint(dedupedRecords.map((record) => ({
      class: record.class,
      title: record.title,
      statement: record.statement,
      status: record.status,
      fingerprint: record.fingerprint,
    }))),
    assumptionRegistryFingerprint: stableFingerprint(dedupedAssumptions.map((assumption) => ({
      statement: assumption.statement,
      importance: assumption.importance,
      status: assumption.status,
      fingerprint: assumption.fingerprint,
    }))),
    openBlockingAssumptions: dedupedAssumptions.filter((assumption) => assumption.status === "open" && assumption.importance === "blocking").length,
    openAdvisoryAssumptions: dedupedAssumptions.filter((assumption) => assumption.status === "open" && assumption.importance === "advisory").length,
  };
}

export function evidenceHandoffSummary(summary: EvidenceHierarchySummary) {
  const directlyObserved = summary.countsByClass["directly-observed"];
  const builderDeclared = summary.countsByClass["builder-declared"];
  const modelInferred = summary.countsByClass["model-inferred"];
  const unknown = summary.countsByClass.unknown;
  return `${directlyObserved} directly observed; ${builderDeclared} builder declared; ${modelInferred} model inferred; ${unknown} unknown.`;
}

export function assumptionHandoffSummary(summary: EvidenceHierarchySummary) {
  const accepted = summary.assumptions.filter((assumption) => assumption.status === "accepted").length;
  return `${summary.openBlockingAssumptions} blocking open; ${summary.openAdvisoryAssumptions} advisory open; ${accepted} accepted.`;
}
