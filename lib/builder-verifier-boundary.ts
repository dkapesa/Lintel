import type { CanonicalAnalysisSource } from "./canonical-review-run";
import type { ChangePassport, ChangePassportProducerType } from "./change-passport";

export const BUILDER_VERIFIER_SCHEMA_VERSION = "1.0";

export type BoundaryStatus = "separate" | "shared" | "unknown" | "not-applicable";
export type VerificationBoundaryClassification =
  | "independently verified"
  | "partially separated"
  | "same-context verification"
  | "separation unknown"
  | "not applicable";

export type BuilderVerifierContext = {
  producerType: ChangePassportProducerType;
  tool?: string;
  provider?: string;
  model?: string;
  externalRunId?: string;
  source: string;
  provenance: "declared" | "lintel" | "unknown";
};

export type VerifierContext = {
  verifierTypes: Array<"deterministic" | "model-assisted" | "human" | "mixed">;
  tool: "Lintel";
  provider?: string;
  model?: string;
  canonicalRunId?: string;
  generatorVersion: string;
  deterministicRulesetVersion: string;
  analysisSource: CanonicalAnalysisSource;
  deterministicBaselineApplied: boolean;
  humanDecisionPresent: boolean;
};

export type SeparationDimension = {
  key: "tool" | "provider" | "model" | "execution" | "deterministic-analysis" | "human-review";
  label: string;
  status: BoundaryStatus;
  rationale: string;
};

export type BuilderVerifierAssessment = {
  assessmentId: string;
  schemaVersion: typeof BUILDER_VERIFIER_SCHEMA_VERSION;
  canonicalRunId?: string;
  repository: string;
  pullRequestNumber?: number;
  headSha?: string;
  builder: BuilderVerifierContext;
  verifier: VerifierContext;
  dimensions: SeparationDimension[];
  classification: VerificationBoundaryClassification;
  rationale: string;
  knownLimitations: string[];
  createdAt: string;
  fingerprint: string;
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

function safeText(value: string | undefined, limit = 160) {
  if (!value) return undefined;
  const cleaned = value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "[raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, limit) : undefined;
}

function sameKnown(a?: string, b?: string) {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function differentKnown(a?: string, b?: string) {
  return !!a && !!b && a.toLowerCase() !== b.toLowerCase();
}

function verifierTypes(analysisSource: CanonicalAnalysisSource, humanDecisionPresent: boolean) {
  const types: VerifierContext["verifierTypes"] = ["deterministic"];
  if (analysisSource === "model") types.push("model-assisted");
  if (humanDecisionPresent) types.push("human");
  if (types.length > 1) types.push("mixed");
  return types;
}

function dimension(key: SeparationDimension["key"], label: string, status: BoundaryStatus, rationale: string): SeparationDimension {
  return { key, label, status, rationale };
}

function classify(builder: BuilderVerifierContext, verifier: VerifierContext, dimensions: SeparationDimension[]): VerificationBoundaryClassification {
  if (builder.producerType === "human") return "not applicable";
  if (builder.producerType === "unknown") return "separation unknown";

  const sharedCritical = dimensions.some((item) => item.status === "shared" && (item.key === "provider" || item.key === "model" || item.key === "execution"));
  if (sharedCritical) return "same-context verification";

  const meaningfulSeparate = dimensions.filter((item) => item.status === "separate" && item.key !== "deterministic-analysis").length;
  const unknownCritical = dimensions.some((item) => item.status === "unknown" && (item.key === "provider" || item.key === "model" || item.key === "execution"));

  if (meaningfulSeparate >= 3 && !unknownCritical && verifier.deterministicBaselineApplied) return "independently verified";
  if (meaningfulSeparate > 0 || verifier.deterministicBaselineApplied) return "partially separated";
  return "separation unknown";
}

function rationaleFor(classification: VerificationBoundaryClassification) {
  if (classification === "independently verified") return "Structured metadata establishes meaningful builder/verifier separation and the deterministic Lintel baseline was applied.";
  if (classification === "partially separated") return "At least one meaningful verification boundary is separate, but complete independence is not established from available metadata.";
  if (classification === "same-context verification") return "Available metadata shows the builder and verifier may share a relevant provider, model or execution context.";
  if (classification === "not applicable") return "The change is declared as human-produced, so agent builder/verifier separation is not the primary question. Verification components are still shown.";
  return "Available metadata is insufficient to establish builder/verifier separation.";
}

export function buildBuilderVerifierAssessment({
  passport,
  repository,
  pullRequestNumber,
  headSha,
  canonicalRunId,
  analysisSource,
  provider,
  model,
  generatorVersion,
  deterministicRulesetVersion,
  humanDecisionPresent = false,
  createdAt = new Date().toISOString(),
}: {
  passport?: ChangePassport | null;
  repository: string;
  pullRequestNumber?: number;
  headSha?: string;
  canonicalRunId?: string;
  analysisSource: CanonicalAnalysisSource;
  provider?: string;
  model?: string;
  generatorVersion: string;
  deterministicRulesetVersion: string;
  humanDecisionPresent?: boolean;
  createdAt?: string;
}): BuilderVerifierAssessment {
  const builder: BuilderVerifierContext = {
    producerType: passport?.producerType ?? "unknown",
    tool: safeText(passport?.producer?.tool),
    provider: safeText(passport?.producer?.provider),
    model: safeText(passport?.producer?.model),
    externalRunId: safeText(passport?.producer?.externalRunId),
    source: passport?.source ?? "unknown",
    provenance: passport ? "declared" : "unknown",
  };

  const deterministicBaselineApplied = analysisSource === "deterministic" || analysisSource === "model" || analysisSource === "fallback" || analysisSource === "demo";
  const verifier: VerifierContext = {
    verifierTypes: verifierTypes(analysisSource, humanDecisionPresent),
    tool: "Lintel",
    provider: safeText(provider),
    model: safeText(model),
    canonicalRunId,
    generatorVersion,
    deterministicRulesetVersion,
    analysisSource,
    deterministicBaselineApplied,
    humanDecisionPresent,
  };

  const modelVerifierPresent = analysisSource === "model" || (!!provider && !!model && analysisSource === "fallback");
  const dimensions: SeparationDimension[] = [
    dimension(
      "tool",
      "Tool boundary",
      !builder.tool ? "unknown" : /lintel/i.test(builder.tool) ? "shared" : "separate",
      !builder.tool ? "Builder tool was not supplied." : /lintel/i.test(builder.tool) ? "Builder and verifier tool context both reference Lintel." : "Builder tool differs from Lintel verifier.",
    ),
    dimension(
      "provider",
      "Provider boundary",
      !modelVerifierPresent ? "not-applicable" : !builder.provider || !provider ? "unknown" : sameKnown(builder.provider, provider) ? "shared" : "separate",
      !modelVerifierPresent ? "No model-assisted verifier provider was used for this run." : !builder.provider || !provider ? "Builder or verifier provider metadata is missing." : sameKnown(builder.provider, provider) ? "Builder and model verifier use the same declared provider." : "Builder and model verifier providers differ.",
    ),
    dimension(
      "model",
      "Model boundary",
      !modelVerifierPresent ? "not-applicable" : !builder.model || !model ? "unknown" : sameKnown(builder.model, model) ? "shared" : differentKnown(builder.model, model) ? "separate" : "unknown",
      !modelVerifierPresent ? "No model-assisted verifier model was used for this run." : !builder.model || !model ? "Builder or verifier model metadata is missing." : sameKnown(builder.model, model) ? "Builder and model verifier use the same declared model." : "Builder and model verifier models differ.",
    ),
    dimension(
      "execution",
      "Execution/run boundary",
      builder.externalRunId && canonicalRunId && sameKnown(builder.externalRunId, canonicalRunId) ? "shared" : "unknown",
      builder.externalRunId && canonicalRunId && sameKnown(builder.externalRunId, canonicalRunId)
        ? "Builder run ID matches the Lintel canonical run ID."
        : builder.externalRunId && canonicalRunId
          ? "Builder and Lintel run identifiers are from different namespaces, so execution isolation is not established."
          : "Builder or verifier run identifier is missing.",
    ),
    dimension(
      "deterministic-analysis",
      "Deterministic-analysis boundary",
      deterministicBaselineApplied ? "separate" : "unknown",
      deterministicBaselineApplied ? "Lintel deterministic rules were applied independently of builder declarations." : "Deterministic baseline presence could not be established.",
    ),
    dimension(
      "human-review",
      "Human-review boundary",
      humanDecisionPresent ? "separate" : "unknown",
      humanDecisionPresent ? "A local human decision is recorded as a separate authority." : "No local human decision is recorded for this report.",
    ),
  ];

  const classification = classify(builder, verifier, dimensions);
  const limitations = [
    ...(builder.producerType === "unknown" ? ["Builder context is unknown because no Change Passport producer metadata was supplied."] : []),
    ...(dimensions.some((item) => item.key === "execution" && item.status === "unknown") ? ["Execution isolation cannot be established from current run identifiers."] : []),
    ...(dimensions.some((item) => item.key === "provider" && item.status === "unknown") ? ["Provider separation is unknown."] : []),
    ...(dimensions.some((item) => item.key === "model" && item.status === "unknown") ? ["Model separation is unknown."] : []),
  ].slice(0, 6);

  const fingerprint = stableFingerprint({
    schemaVersion: BUILDER_VERIFIER_SCHEMA_VERSION,
    repository,
    pullRequestNumber,
    headSha,
    builder,
    verifier,
    dimensions,
    classification,
  });

  return {
    assessmentId: `bv_${fingerprint.slice(0, 12)}`,
    schemaVersion: BUILDER_VERIFIER_SCHEMA_VERSION,
    canonicalRunId,
    repository,
    pullRequestNumber,
    headSha,
    builder,
    verifier,
    dimensions,
    classification,
    rationale: rationaleFor(classification),
    knownLimitations: limitations,
    createdAt,
    fingerprint,
  };
}

export function builderVerifierHandoffSummary(assessment: BuilderVerifierAssessment) {
  const deterministic = assessment.verifier.deterministicBaselineApplied ? "Deterministic baseline applied" : "Deterministic baseline unknown";
  const provider = assessment.dimensions.find((item) => item.key === "provider");
  const model = assessment.dimensions.find((item) => item.key === "model");
  const execution = assessment.dimensions.find((item) => item.key === "execution");
  const providerCopy = provider?.status === "separate"
    ? "Model provider differs from builder"
    : provider?.status === "shared"
      ? "Model provider shared with builder"
      : provider?.status === "unknown"
        ? "Provider separation unknown"
        : undefined;
  const modelCopy = model?.status === "shared" ? "Model context shared" : model?.status === "unknown" ? "Model separation unknown" : undefined;
  const executionCopy = execution?.status === "unknown" ? "Execution isolation unknown" : undefined;
  return [assessment.classification, deterministic, providerCopy, modelCopy, executionCopy].filter(Boolean).join("; ");
}
