import type { Report } from "./mock-report";
import type { ReportInput } from "./report-generator";
import { buildEvidenceHierarchy, type EvidenceClass } from "./evidence-hierarchy";

export const CANONICAL_RUN_SCHEMA_VERSION = "1.1";
export const REPORT_SCHEMA_VERSION = "1.0";
export const REPORT_GENERATOR_VERSION = "6.4";
export const DETERMINISTIC_RULESET_VERSION = "6.3";

export type CanonicalRunSourceType = "github-app" | "github-pr" | "manual" | "sample" | "demo";
export type CanonicalAnalysisSource = "deterministic" | "model" | "fallback" | "demo";
export type ReproducibilityClassification =
  | "exact"
  | "traceable"
  | "source-unavailable"
  | "configuration-unavailable"
  | "manual-input-not-retained"
  | "historical-schema"
  | "drift-detected"
  | "failed";

export type CanonicalReviewRunManifest = {
  runId: string;
  schemaVersion: typeof CANONICAL_RUN_SCHEMA_VERSION;
  sourceType: CanonicalRunSourceType;
  repository: string;
  pullRequestNumber?: number;
  sourceUrl?: string;
  baseSha?: string;
  headSha?: string;
  inputFingerprint: string;
  configurationFingerprint: string;
  resultFingerprint: string;
  reviewMode: string;
  policyProfile: {
    id: string;
    version: string;
  };
  generatorVersion: string;
  deterministicRulesetVersion: string;
  reportSchemaVersion: string;
  analysisSource: CanonicalAnalysisSource;
  provider?: string;
  model?: string;
  modelConfiguration?: Record<string, string | number | boolean>;
  changePassport?: {
    passportId: string;
    schemaVersion: string;
    source: string;
    producerType: string;
    completeness: string;
    fingerprint: string;
  };
  evidenceHierarchy?: {
    schemaVersion: string;
    assumptionRegistrySchemaVersion: string;
    evidenceFingerprint: string;
    assumptionRegistryFingerprint: string;
    countsByClass: Record<EvidenceClass, number>;
    activeAssumptionIds: string[];
    openBlockingAssumptionCount: number;
    openAdvisoryAssumptionCount: number;
  };
  previousRunId?: string;
  processingState: "completed" | "failed" | "historical";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  reproducibility: ReproducibilityClassification;
  reproducibilityLimitation?: string;
};

export type CanonicalRunVerificationRecord = {
  id: string;
  runId: string;
  createdAt: string;
  sourceMatched: boolean;
  configurationMatched: boolean;
  resultMatched?: boolean;
  reproducibility: ReproducibilityClassification;
  failureCategory?: string;
  details: string;
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

export function stableSerialize(value: unknown) {
  return JSON.stringify(normaliseValue(value));
}

export function stableFingerprint(value: unknown) {
  const serialized = stableSerialize(value);
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

export function reviewInputFingerprint(input: ReportInput, metadata?: {
  sourceType?: CanonicalRunSourceType;
  sourceUrl?: string;
  baseSha?: string;
  headSha?: string;
  pullRequestNumber?: number;
}) {
  return stableFingerprint({
    sourceType: metadata?.sourceType ?? (input.inputSource === "sample" ? "sample" : input.inputSource === "github-pr" ? "github-pr" : "manual"),
    sourceUrl: metadata?.sourceUrl,
    repository: input.repository,
    pullRequestNumber: metadata?.pullRequestNumber,
    baseSha: metadata?.baseSha,
    headSha: metadata?.headSha,
    title: input.title,
    technology: input.technology,
    diff: input.diff,
    reviewMode: input.reviewProfile ?? "standard",
    changePassport: input.changePassport ? {
      passportId: input.changePassport.passportId,
      schemaVersion: input.changePassport.schemaVersion,
      source: input.changePassport.source,
      producerType: input.changePassport.producerType,
      completeness: input.changePassport.completeness,
      fingerprint: input.changePassport.fingerprint,
    } : undefined,
  });
}

export function reviewConfigurationFingerprint(input: Pick<ReportInput, "reviewProfile">, analysisSource: CanonicalAnalysisSource, provider?: string, model?: string) {
  return stableFingerprint({
    reviewMode: input.reviewProfile ?? "standard",
    policyProfile: input.reviewProfile ?? "standard",
    policyVersion: "1.0",
    generatorVersion: REPORT_GENERATOR_VERSION,
    deterministicRulesetVersion: DETERMINISTIC_RULESET_VERSION,
    reportSchemaVersion: REPORT_SCHEMA_VERSION,
    analysisSource,
    provider,
    model,
  });
}

export function reportFingerprint(report: Report) {
  return stableFingerprint(report);
}

function defaultReproducibility(sourceType: CanonicalRunSourceType, analysisSource: CanonicalAnalysisSource): { classification: ReproducibilityClassification; limitation?: string } {
  if (sourceType === "manual") {
    return { classification: "manual-input-not-retained", limitation: "Manual raw diff input is intentionally not retained after report generation." };
  }
  if (analysisSource === "model") {
    return { classification: "traceable", limitation: "Model-assisted output is traceable by provenance, but exact model replay is not promised." };
  }
  if (sourceType === "github-app" || sourceType === "github-pr" || sourceType === "sample") {
    return { classification: "exact" };
  }
  return { classification: "historical-schema", limitation: "This report predates complete canonical-run metadata." };
}

export function createCanonicalReviewRunManifest({
  input,
  report,
  sourceType,
  analysisSource,
  runId,
  previousRunId,
  sourceUrl,
  baseSha,
  headSha,
  pullRequestNumber,
  provider,
  model,
  createdAt = new Date().toISOString(),
  startedAt,
  completedAt = createdAt,
}: {
  input: ReportInput;
  report: Report;
  sourceType?: CanonicalRunSourceType;
  analysisSource: CanonicalAnalysisSource;
  runId?: string;
  previousRunId?: string;
  sourceUrl?: string;
  baseSha?: string;
  headSha?: string;
  pullRequestNumber?: number;
  provider?: string;
  model?: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
}): CanonicalReviewRunManifest {
  const inferredSourceType = sourceType ?? (input.inputSource === "sample" ? "sample" : input.inputSource === "github-pr" ? "github-pr" : "manual");
  const inputFingerprint = reviewInputFingerprint(input, { sourceType: inferredSourceType, sourceUrl, baseSha, headSha, pullRequestNumber });
  const configurationFingerprint = reviewConfigurationFingerprint(input, analysisSource, provider, model);
  const resultFingerprint = reportFingerprint(report);
  const reproducibility = defaultReproducibility(inferredSourceType, analysisSource);
  const evidenceHierarchy = buildEvidenceHierarchy(report, input.changePassport, { runId, headSha });

  return {
    runId: runId ?? `run_${inputFingerprint.slice(0, 10)}_${configurationFingerprint.slice(0, 8)}_${resultFingerprint.slice(0, 8)}`,
    schemaVersion: CANONICAL_RUN_SCHEMA_VERSION,
    sourceType: inferredSourceType,
    repository: input.repository,
    pullRequestNumber,
    sourceUrl,
    baseSha,
    headSha,
    inputFingerprint,
    configurationFingerprint,
    resultFingerprint,
    reviewMode: input.reviewProfile ?? "standard",
    policyProfile: { id: input.reviewProfile ?? "standard", version: "1.0" },
    generatorVersion: REPORT_GENERATOR_VERSION,
    deterministicRulesetVersion: DETERMINISTIC_RULESET_VERSION,
    reportSchemaVersion: REPORT_SCHEMA_VERSION,
    analysisSource,
    provider,
    model,
    modelConfiguration: model ? { store: false, maxOutputTokens: 8000 } : undefined,
    changePassport: input.changePassport ? {
      passportId: input.changePassport.passportId,
      schemaVersion: input.changePassport.schemaVersion,
      source: input.changePassport.source,
      producerType: input.changePassport.producerType,
      completeness: input.changePassport.completeness,
      fingerprint: input.changePassport.fingerprint,
    } : undefined,
    evidenceHierarchy: {
      schemaVersion: evidenceHierarchy.schemaVersion,
      assumptionRegistrySchemaVersion: evidenceHierarchy.assumptionRegistrySchemaVersion,
      evidenceFingerprint: evidenceHierarchy.evidenceFingerprint,
      assumptionRegistryFingerprint: evidenceHierarchy.assumptionRegistryFingerprint,
      countsByClass: evidenceHierarchy.countsByClass,
      activeAssumptionIds: evidenceHierarchy.assumptions.filter((assumption) => assumption.status === "open").slice(0, 12).map((assumption) => assumption.assumptionId),
      openBlockingAssumptionCount: evidenceHierarchy.openBlockingAssumptions,
      openAdvisoryAssumptionCount: evidenceHierarchy.openAdvisoryAssumptions,
    },
    previousRunId,
    processingState: "completed",
    createdAt,
    startedAt,
    completedAt,
    reproducibility: reproducibility.classification,
    reproducibilityLimitation: reproducibility.limitation,
  };
}

export function historicalCanonicalRunManifest(report: Report, sourceType: CanonicalRunSourceType = "demo"): CanonicalReviewRunManifest {
  const timestamp = report.pr.updatedAt && !Number.isNaN(Date.parse(report.pr.updatedAt)) ? report.pr.updatedAt : new Date().toISOString();
  const resultFingerprint = reportFingerprint(report);
  return {
    runId: `historical_${resultFingerprint.slice(0, 12)}`,
    schemaVersion: CANONICAL_RUN_SCHEMA_VERSION,
    sourceType,
    repository: report.pr.repository,
    pullRequestNumber: report.pr.number,
    inputFingerprint: "unavailable",
    configurationFingerprint: "unavailable",
    resultFingerprint,
    reviewMode: report.pr.reviewProfile ?? "standard",
    policyProfile: { id: report.pr.reviewProfile ?? "standard", version: "1.0" },
    generatorVersion: "historical",
    deterministicRulesetVersion: "historical",
    reportSchemaVersion: REPORT_SCHEMA_VERSION,
    analysisSource: sourceType === "demo" ? "demo" : "deterministic",
    processingState: "historical",
    createdAt: timestamp,
    completedAt: timestamp,
    reproducibility: "historical-schema",
    reproducibilityLimitation: "This report does not include complete canonical-run provenance.",
  };
}

export function fingerprintPrefix(value?: string) {
  if (!value || value === "unavailable") return "unavailable";
  return value.slice(0, 12);
}
