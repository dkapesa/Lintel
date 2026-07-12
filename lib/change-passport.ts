import { stableFingerprint } from "./canonical-review-run";
import type { Report } from "./mock-report";
import { decisionConditions, deduplicateReportItems, pruneUnsupportedReviewerFocus } from "./report-quality";

export const CHANGE_PASSPORT_SCHEMA_VERSION = "1.0";
const MAX_TEXT = 900;
const MAX_SHORT_TEXT = 160;
const MAX_ITEMS = 12;
const MAX_BLOCK = 8_000;

export type ChangePassportProducerType = "human" | "agent" | "mixed" | "unknown";
export type ChangePassportSource = "manual" | "github-pr-body" | "sample" | "api";
export type ChangePassportProvenance = "manually entered" | "imported from PR body" | "builder-declared" | "derived by Lintel";
export type ChangePassportCompleteness = "absent" | "partial" | "complete";
export type DeclarationState = "supported" | "unverified" | "observed but undeclared" | "declared" | "not applicable";

export type ChangePassport = {
  passportId: string;
  schemaVersion: typeof CHANGE_PASSPORT_SCHEMA_VERSION;
  producerType: ChangePassportProducerType;
  source: ChangePassportSource;
  provenance: ChangePassportProvenance;
  taskIntent?: string;
  changeSummary?: string;
  producer?: {
    tool?: string;
    provider?: string;
    model?: string;
    externalRunId?: string;
  };
  claimedFiles: string[];
  claimedSurfaces: string[];
  claimedTests: string[];
  claimedValidation: string[];
  assumptions: string[];
  constraints: string[];
  knownLimitations: string[];
  unresolvedUncertainty: string[];
  handoffNotes?: string;
  createdAt: string;
  updatedAt: string;
  completeness: ChangePassportCompleteness;
  fingerprint: string;
};

export type PassportObservation = {
  state: DeclarationState;
  label: string;
  detail: string;
};

export type ChangePassportComparison = {
  completeness: ChangePassportCompleteness;
  summary: string;
  supportedDeclarations: PassportObservation[];
  unverifiedDeclarations: PassportObservation[];
  observedButUndeclared: PassportObservation[];
  declaredUncertainty: PassportObservation[];
};

type PassportInput = Partial<{
  producerType: string;
  taskIntent: string;
  changeSummary: string;
  producer: Partial<{ tool: string; provider: string; model: string; externalRunId: string }>;
  claimedFiles: unknown[];
  claimedSurfaces: unknown[];
  affectedSurfaces: unknown[];
  claimedTests: unknown[];
  claimedValidation: unknown[];
  validation: unknown[];
  assumptions: unknown[];
  constraints: unknown[];
  knownLimitations: unknown[];
  limitations: unknown[];
  unresolvedUncertainty: unknown[];
  handoffNotes: string;
}>;

function cleanText(value: unknown, limit = MAX_TEXT) {
  if (typeof value !== "string") return undefined;
  const trimmed = value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "[raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim();
  return trimmed ? trimmed.slice(0, limit) : undefined;
}

function cleanItems(value: unknown, limit = MAX_ITEMS) {
  if (!Array.isArray(value)) return [];
  return deduplicateReportItems(
    value.flatMap((item) => {
      const text = cleanText(item, MAX_SHORT_TEXT);
      return text ? [text] : [];
    }),
  ).slice(0, limit);
}

function producerType(value: unknown): ChangePassportProducerType {
  return value === "human" || value === "agent" || value === "mixed" || value === "unknown" ? value : "unknown";
}

function explicitNone(values: string[]) {
  return values.some((value) => /^(none|n\/a|not applicable|no known|nothing known)$/i.test(value.trim()));
}

function completenessFor(passport: Omit<ChangePassport, "passportId" | "schemaVersion" | "completeness" | "fingerprint">): ChangePassportCompleteness {
  const hasProducer = passport.producerType !== "unknown" || !!passport.producer?.tool || !!passport.producer?.model;
  const hasIntent = !!passport.taskIntent;
  const hasSummary = !!passport.changeSummary;
  const hasValidation = passport.claimedValidation.length > 0 || passport.claimedTests.length > 0 || explicitNone(passport.claimedValidation);
  const hasAssumptions = passport.assumptions.length > 0 || explicitNone(passport.assumptions);
  const hasUncertainty = passport.unresolvedUncertainty.length > 0 || explicitNone(passport.unresolvedUncertainty);
  const count = [hasProducer, hasIntent, hasSummary, hasValidation, hasAssumptions, hasUncertainty].filter(Boolean).length;
  if (count === 0) return "absent";
  return count === 6 ? "complete" : "partial";
}

function withoutIdentity(passport: Omit<ChangePassport, "passportId" | "fingerprint">) {
  return {
    schemaVersion: passport.schemaVersion,
    producerType: passport.producerType,
    source: passport.source,
    provenance: passport.provenance,
    taskIntent: passport.taskIntent,
    changeSummary: passport.changeSummary,
    producer: passport.producer,
    claimedFiles: passport.claimedFiles,
    claimedSurfaces: passport.claimedSurfaces,
    claimedTests: passport.claimedTests,
    claimedValidation: passport.claimedValidation,
    assumptions: passport.assumptions,
    constraints: passport.constraints,
    knownLimitations: passport.knownLimitations,
    unresolvedUncertainty: passport.unresolvedUncertainty,
    handoffNotes: passport.handoffNotes,
    completeness: passport.completeness,
  };
}

export function normalizeChangePassport(value: unknown, source: ChangePassportSource): ChangePassport | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as PassportInput;
  const timestamp = new Date().toISOString();
  const provenance: ChangePassportProvenance = source === "manual" ? "manually entered" : source === "github-pr-body" ? "imported from PR body" : "builder-declared";
  const base = {
    schemaVersion: CHANGE_PASSPORT_SCHEMA_VERSION,
    producerType: producerType(record.producerType),
    source,
    provenance,
    taskIntent: cleanText(record.taskIntent),
    changeSummary: cleanText(record.changeSummary),
    producer: {
      tool: cleanText(record.producer?.tool, MAX_SHORT_TEXT),
      provider: cleanText(record.producer?.provider, MAX_SHORT_TEXT),
      model: cleanText(record.producer?.model, MAX_SHORT_TEXT),
      externalRunId: cleanText(record.producer?.externalRunId, MAX_SHORT_TEXT),
    },
    claimedFiles: cleanItems(record.claimedFiles),
    claimedSurfaces: cleanItems(record.claimedSurfaces ?? record.affectedSurfaces),
    claimedTests: cleanItems(record.claimedTests),
    claimedValidation: cleanItems(record.claimedValidation ?? record.validation),
    assumptions: cleanItems(record.assumptions),
    constraints: cleanItems(record.constraints),
    knownLimitations: cleanItems(record.knownLimitations ?? record.limitations),
    unresolvedUncertainty: cleanItems(record.unresolvedUncertainty),
    handoffNotes: cleanText(record.handoffNotes),
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies Omit<ChangePassport, "passportId" | "completeness" | "fingerprint">;
  const completeness = completenessFor(base);
  if (completeness === "absent") return null;
  const withCompleteness = { ...base, completeness };
  const fingerprint = stableFingerprint(withoutIdentity(withCompleteness));
  return {
    ...withCompleteness,
    passportId: `passport_${fingerprint.slice(0, 12)}`,
    fingerprint,
  };
}

export function parseChangePassportBlock(body: unknown): ChangePassport | null {
  const text = cleanText(body, MAX_BLOCK);
  if (!text) return null;
  const match = text.match(/```lintel-change-passport\s*([\s\S]*?)```/i);
  if (!match?.[1]) return null;
  try {
    return normalizeChangePassport(JSON.parse(match[1]), "github-pr-body");
  } catch {
    return null;
  }
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

function observedSurfaces(report: Report) {
  const focus = pruneUnsupportedReviewerFocus(report)?.map((item) => item.area) ?? [];
  const categories = report.findings.map((finding) => finding.category);
  const operations = report.operationalReadiness?.status === "ATTENTION" ? ["Operational readiness"] : [];
  const tests = report.missingTests.length > 0 ? ["Tests/coverage"] : [];
  return deduplicateReportItems([...focus, ...categories, ...operations, ...tests]);
}

export function compareChangePassport(passport: ChangePassport | null | undefined, report: Report): ChangePassportComparison {
  if (!passport) {
    return {
      completeness: "absent",
      summary: "No Change Passport was supplied for this change.",
      supportedDeclarations: [],
      unverifiedDeclarations: [],
      observedButUndeclared: observedSurfaces(report).slice(0, 6).map((surface) => ({
        state: "observed but undeclared",
        label: surface,
        detail: "Lintel observed this review concern without a corresponding builder declaration.",
      })),
      declaredUncertainty: [],
    };
  }

  const surfaces = observedSurfaces(report);
  const supportedDeclarations: PassportObservation[] = [];
  const unverifiedDeclarations: PassportObservation[] = [];
  const declaredUncertainty = passport.unresolvedUncertainty.map((item) => ({
    state: "declared" as const,
    label: "Unresolved uncertainty",
    detail: item,
  }));

  for (const surface of passport.claimedSurfaces) {
    const supported = surfaces.some((observed) => overlaps(surface, observed));
    (supported ? supportedDeclarations : unverifiedDeclarations).push({
      state: supported ? "supported" : "unverified",
      label: surface,
      detail: supported ? "Declared surface also appears in Lintel reviewer focus, findings or operations." : "Declared surface is retained as builder context, but was not independently matched.",
    });
  }

  for (const file of passport.claimedFiles) {
    const supported = report.changedFiles.some((changed) => changed.path.toLowerCase() === file.toLowerCase() || changed.path.toLowerCase().endsWith(file.toLowerCase()));
    (supported ? supportedDeclarations : unverifiedDeclarations).push({
      state: supported ? "supported" : "unverified",
      label: file,
      detail: supported ? "Claimed file appears in the changed-file list." : "Claimed file was not matched to the normalized changed-file list.",
    });
  }

  for (const validation of [...passport.claimedValidation, ...passport.claimedTests]) {
    const supported = report.changedFiles.some((file) => /test|spec|__tests__/.test(file.path.toLowerCase())) || report.missingTests.length === 0;
    (supported ? supportedDeclarations : unverifiedDeclarations).push({
      state: supported ? "supported" : "unverified",
      label: validation,
      detail: supported ? "Lintel observed test-related evidence in the report context." : "Claimed validation was not independently verified by Lintel.",
    });
  }

  const declaredSurfaceText = passport.claimedSurfaces.join(" ");
  const observedButUndeclared = surfaces
    .filter((surface) => !overlaps(surface, declaredSurfaceText))
    .slice(0, 6)
    .map((surface) => ({
      state: "observed but undeclared" as const,
      label: surface,
      detail: "Lintel observed this concern, but it was not declared in the passport.",
    }));

  return {
    completeness: passport.completeness,
    summary: `${passport.completeness} passport: ${supportedDeclarations.length} supported declarations, ${unverifiedDeclarations.length} unverified declarations, ${observedButUndeclared.length} observed-but-undeclared concerns.`,
    supportedDeclarations,
    unverifiedDeclarations,
    observedButUndeclared,
    declaredUncertainty,
  };
}

export function passportHandoffSummary(passport: ChangePassport | null | undefined, comparison: ChangePassportComparison) {
  if (!passport) return "Change Passport: Absent";
  const producer = [passport.producerType, passport.producer?.tool].filter(Boolean).join(" · ");
  return `Change Passport: ${passport.completeness}. Producer: ${producer || "unknown"}. Unverified declarations: ${comparison.unverifiedDeclarations.length}.`;
}
