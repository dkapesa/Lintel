import type { Confidence, FindingSeverity, OperationalReadiness, Recommendation, Report, ReviewArea, RiskLevel } from "./mock-report";
import { assessReportQuality, pruneUnsupportedReviewerFocus } from "./report-quality";
import { REVIEW_PROFILES } from "./review-profiles";

const RECOMMENDATIONS: Recommendation[] = ["APPROVE", "REVIEW_REQUIRED", "TESTS_REQUIRED"];
const RISK_LEVELS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CONFIDENCE_LEVELS: Confidence[] = ["LOW", "MEDIUM", "HIGH"];
const FINDING_SEVERITIES: FindingSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const FINDING_CATEGORIES: Report["findings"][number]["category"][] = [
  "Security",
  "Reliability",
  "Maintainability",
  "Missing tests",
  "API contract",
];
const REVIEWER_FOCUS_AREAS = [
  "Backend reliability",
  "API contract",
  "Security/privacy",
  "Data/migration",
  "Payments/domain logic",
  "Platform/observability",
  "Frontend integration",
  "Docs/API consumer review",
] as const;
const REVIEW_PROFILE_IDS = REVIEW_PROFILES.map((profile) => profile.id);
type ReviewerFocusArea = typeof REVIEWER_FOCUS_AREAS[number];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, fallback: string, maxLength = 800) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function enumValue<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;
}

function stringArray(value: unknown, fallback: string[], maxItems = 12, maxLength = 500) {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, maxLength));
}

function normalisedKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function mergeStrings(primary: string[], secondary: string[], maxItems = 12, maxLength = 500) {
  const seen = new Set<string>();

  return [...primary, ...secondary].flatMap((item) => {
    const trimmed = item.trim().slice(0, maxLength);
    const key = normalisedKey(trimmed);
    if (!trimmed || seen.has(key)) return [];
    seen.add(key);
    return [trimmed];
  }).slice(0, maxItems);
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 31) return "MEDIUM";
  return "LOW";
}

function normaliseReview(value: unknown, fallback: ReviewArea): ReviewArea {
  if (!isRecord(value)) return fallback;

  const submittedStatus = enumValue(value.status, ["CLEAR", "ATTENTION"], fallback.status);
  const preserveAttention = fallback.status === "ATTENTION";

  return {
    status: preserveAttention ? "ATTENTION" : submittedStatus,
    summary: preserveAttention && submittedStatus === "CLEAR"
      ? fallback.summary
      : text(value.summary, fallback.summary),
    points: preserveAttention
      ? mergeStrings(fallback.points, stringArray(value.points, [], 6, 400), 6, 400)
      : stringArray(value.points, fallback.points, 6, 400),
  };
}

function normaliseOperationalReadiness(value: unknown, fallback: OperationalReadiness): OperationalReadiness {
  if (!isRecord(value)) return fallback;

  const submittedStatus = enumValue(value.status, ["CLEAR", "ATTENTION"], fallback.status);
  const preserveAttention = fallback.status === "ATTENTION";
  const operationalArray = (field: keyof Pick<
    OperationalReadiness,
    "failureModes" | "detectionSignals" | "observabilityGaps" | "recoveryOrRollback" | "customerOrDataImpact" | "ownerOrReviewerFocus"
  >) => preserveAttention
    ? mergeStrings(fallback[field], stringArray(value[field], [], 6, 400), 6, 400)
    : stringArray(value[field], fallback[field], 6, 400);

  return {
    status: preserveAttention ? "ATTENTION" : submittedStatus,
    summary: preserveAttention && submittedStatus === "CLEAR"
      ? fallback.summary
      : text(value.summary, fallback.summary, 800),
    failureModes: operationalArray("failureModes"),
    detectionSignals: operationalArray("detectionSignals"),
    observabilityGaps: operationalArray("observabilityGaps"),
    recoveryOrRollback: operationalArray("recoveryOrRollback"),
    customerOrDataImpact: operationalArray("customerOrDataImpact"),
    ownerOrReviewerFocus: operationalArray("ownerOrReviewerFocus"),
  };
}

function normaliseFindings(value: unknown, baseline: Report) {
  if (!Array.isArray(value)) return [];
  const knownFiles = new Set(baseline.changedFiles.map((file) => file.path));

  return value.flatMap((item): Report["findings"] => {
    if (!isRecord(item)) return [];
    if (typeof item.title !== "string" || typeof item.evidence !== "string" || typeof item.action !== "string") return [];
    if (!FINDING_SEVERITIES.includes(item.severity as FindingSeverity)) return [];
    if (!FINDING_CATEGORIES.includes(item.category as Report["findings"][number]["category"])) return [];

    const finding: Report["findings"][number] = {
      severity: item.severity as FindingSeverity,
      category: item.category as Report["findings"][number]["category"],
      title: text(item.title, "Review finding", 180),
      evidence: text(item.evidence, "Evidence requires reviewer confirmation.", 900),
      action: text(item.action, "Complete focused human review.", 700),
    };

    if (typeof item.file === "string" && knownFiles.has(item.file.trim())) finding.file = item.file.trim();
    return [finding];
  }).slice(0, 12);
}

function mergeFindings(primary: Report["findings"], secondary: Report["findings"]) {
  const seen = new Set<string>();

  return [...primary, ...secondary].filter((finding) => {
    const key = `${finding.category}:${normalisedKey(finding.title)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

function normaliseSuggestedTests(value: unknown, fallback: Report["suggestedTests"]) {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item): Report["suggestedTests"] => {
    if (!isRecord(item) || typeof item.title !== "string" || !item.title.trim()) return [];
    const test: Report["suggestedTests"][number] = { title: item.title.trim().slice(0, 180) };
    if (typeof item.description === "string" && item.description.trim()) test.description = item.description.trim().slice(0, 500);
    if (item.priority === "Required" || item.priority === "Recommended") test.priority = item.priority;
    return [test];
  }).slice(0, 12);
}

function mergeSuggestedTests(
  primary: Report["suggestedTests"],
  secondary: Report["suggestedTests"],
) {
  const seen = new Set<string>();

  return [...primary, ...secondary].filter((test) => {
    const key = normalisedKey(test.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

function normaliseChecklist(value: unknown, fallback: Report["reviewerChecklist"]) {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item): Report["reviewerChecklist"] => {
    if (!isRecord(item) || typeof item.label !== "string" || !item.label.trim()) return [];
    if (item.status !== "COMPLETE" && item.status !== "ATTENTION") return [];
    return [{ label: item.label.trim().slice(0, 300), status: item.status }];
  }).slice(0, 12);
}

function reviewerFocusSupport(baseline: Report) {
  const supported = new Set<ReviewerFocusArea>();
  const baselineAreas = baseline.reviewerFocus ?? [];
  const baselineOperationalReadiness = baseline.operationalReadiness;

  baselineAreas.forEach((item) => {
    if (
      item.area !== "Payments/domain logic"
      && REVIEWER_FOCUS_AREAS.includes(item.area as ReviewerFocusArea)
    ) {
      supported.add(item.area as ReviewerFocusArea);
    }
  });

  const evidence = [
    ...baseline.changedFiles.map((file) => file.path),
    ...baseline.findings.flatMap((finding) => [finding.title, finding.category, finding.evidence, finding.action, finding.file ?? ""]),
    ...(baselineOperationalReadiness?.status === "ATTENTION"
      ? [
          baselineOperationalReadiness.summary,
          ...baselineOperationalReadiness.failureModes,
          ...baselineOperationalReadiness.detectionSignals,
          ...baselineOperationalReadiness.observabilityGaps,
          ...baselineOperationalReadiness.recoveryOrRollback,
          ...baselineOperationalReadiness.customerOrDataImpact,
          ...baselineOperationalReadiness.ownerOrReviewerFocus,
        ]
      : []),
  ].join("\n").toLowerCase();

  if (baseline.missingTests.length > 0 || /\bproviders?\b|\bretr(?:y|ies|ied|ying)\b|\btime[ _-]?outs?\b|\bduplicates?\b|\bidempoten(?:t|cy)\b|\bfailure(?: mode)?s?\b/.test(evidence)) {
    supported.add("Backend reliability");
  }
  if (/\bapi\b|\bendpoints?\b|\broutes?\b|\bresponse[ _-]?shapes?\b|\bstatus[_ ]codes?\b|\berror[ _-]?contracts?\b|\bopenapi\b|\bpublic[ _-]?(?:api|contract)\b/.test(evidence)) {
    supported.add("API contract");
  }
  if (/\bauth(?:entication|orisation|orization)?\b|\bpermissions?\b|\btokens?\b|\bsecrets?\b|\bcredentials?\b|\bidentifiers?\b|\b(?:user|partner|customer|account|tenant)_id\b|\bpii\b|\bsensitive[ _-]?data\b|\blogg(?:er|ing)\b|\bexpos(?:e|ed|ure)\b/.test(evidence)) {
    supported.add("Security/privacy");
  }
  if (/\bdatabases?\b|\bmigrations?\b|\bschemas?\b|\bdata[ _-]?(?:write|update|delete|insert)\b/.test(evidence)) {
    supported.add("Data/migration");
  }
  if (/\bpayments?\b|\bbilling\b|\brefunds?\b|\bredemptions?\b|\bdiscount(?:[_ -]?codes?)?\b|\bcheckout\b|\binvoices?\b|\bsubscriptions?\b|\borders?\b|\bcharges?\b/.test(evidence)) {
    supported.add("Payments/domain logic");
  }
  if (baselineOperationalReadiness?.status === "ATTENTION" || /\blogs?\b|\bmetrics?\b|\balerts?\b|\btraces?\b|\bmonitor(?:ing|ed)?\b|\broll[ _-]?back\b|\brecovery\b|\boperational[ _-]?gaps?\b|\bdetection[ _-]?signals?\b/.test(evidence)) {
    supported.add("Platform/observability");
  }
  if (/\bfrontend\b|\bbrowser\b|\banalytics\b|\bui\b|\.(?:tsx|jsx|css|scss)(?:\b|$)/.test(evidence)) {
    supported.add("Frontend integration");
  }
  if (/(?:^|\/)docs?(?:\/|\.|$)|(?:^|\/)(?:readme|openapi|swagger)(?:\.|$)|\bpublic[ _-]?api[ _-]?docs?\b/m.test(evidence)) {
    supported.add("Docs/API consumer review");
  }

  return supported;
}

function normaliseReviewerFocus(
  value: unknown,
  supportedAreas: Set<ReviewerFocusArea>,
): NonNullable<Report["reviewerFocus"]> {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): NonNullable<Report["reviewerFocus"]> => {
    if (!isRecord(item) || typeof item.area !== "string" || typeof item.reason !== "string") return [];
    if (!REVIEWER_FOCUS_AREAS.includes(item.area as ReviewerFocusArea)) return [];
    if (!supportedAreas.has(item.area as ReviewerFocusArea)) return [];
    if (item.priority !== "PRIMARY" && item.priority !== "SECONDARY") return [];

    const reason = item.reason.trim().slice(0, 500);
    if (!reason || /\b(?:assigned to|owner is|team is|reviewer is)\b|@[a-z0-9_-]+/i.test(reason)) return [];

    return [{ area: item.area, priority: item.priority, reason }];
  }).slice(0, REVIEWER_FOCUS_AREAS.length);
}

function mergeReviewerFocus(
  primary: NonNullable<Report["reviewerFocus"]>,
  secondary: NonNullable<Report["reviewerFocus"]>,
) {
  const merged = new Map<string, NonNullable<Report["reviewerFocus"]>[number]>();

  [...primary, ...secondary].forEach((item) => {
    const key = normalisedKey(item.area);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, item);
      return;
    }

    merged.set(key, {
      area: existing.area,
      priority: existing.priority === "PRIMARY" || item.priority === "PRIMARY" ? "PRIMARY" : "SECONDARY",
      reason: mergeStrings([existing.reason], [item.reason], 2, 500).join(" "),
    });
  });

  return [...merged.values()].slice(0, REVIEWER_FOCUS_AREAS.length);
}

function canonicalRecommendationCopy(recommendation: Recommendation) {
  if (recommendation === "APPROVE") return "No unresolved findings or merge conditions remain. Complete normal human review before approval.";
  if (recommendation === "TESTS_REQUIRED") return "Do not approve until the identified test gaps have been addressed.";
  return "Focused human review is required for the findings and conditions identified in this report.";
}

function canonicalAiSummary(baseline: Report, findings: Report["findings"], missingTests: string[]) {
  const changedFileCount = baseline.changedFiles.length;
  const changedFiles = `${changedFileCount} changed file${changedFileCount === 1 ? "" : "s"}`;

  if (findings.length === 0 && missingTests.length === 0) {
    return `AI-assisted analysis found no unresolved merge-readiness findings or test gaps across ${changedFiles}.`;
  }

  return `AI-assisted analysis identified ${findings.length} merge-readiness finding${findings.length === 1 ? "" : "s"} and ${missingTests.length} test gap${missingTests.length === 1 ? "" : "s"} across ${changedFiles}.`;
}

function baselineRiskFloor(baseline: Report) {
  let floor = 0;
  const concreteFindings = baseline.findings.filter((finding) => finding.category !== "Missing tests").length;

  if (baseline.verdict.recommendation === "TESTS_REQUIRED" && baseline.missingTests.length > 0) {
    floor = 31;
  }

  if (baseline.verdict.riskLevel === "HIGH") {
    floor = Math.max(floor, baseline.verdict.riskScore - 5);
    if (concreteFindings >= 2) floor = Math.max(floor, 61);
  }

  if (baseline.verdict.riskLevel === "CRITICAL") {
    floor = Math.max(floor, baseline.verdict.riskScore - 5);
    if (concreteFindings >= 2) floor = Math.max(floor, 81);
  }

  const profileAttention = baseline.pr.reviewProfile
    && baseline.pr.reviewProfile !== "standard"
    && (
      baseline.findings.length > 0
      || Object.values(baseline.reviews).some((review) => review.status === "ATTENTION")
      || baseline.operationalReadiness?.status === "ATTENTION"
    );
  if (profileAttention) floor = Math.max(floor, baseline.verdict.riskScore - 5);

  return Math.round(Math.min(100, Math.max(0, floor)));
}

export function normaliseReport(value: unknown, baseline: Report): Report | null {
  if (
    !isRecord(value)
    || !isRecord(value.verdict)
    || !isRecord(value.reviews)
    || !isRecord(value.operationalReadiness)
    || !Array.isArray(value.reviewerFocus)
  ) return null;

  const reviews = {
    security: normaliseReview(value.reviews.security, baseline.reviews.security),
    reliability: normaliseReview(value.reviews.reliability, baseline.reviews.reliability),
    maintainability: normaliseReview(value.reviews.maintainability, baseline.reviews.maintainability),
  };
  const baselineOperationalReadiness = baseline.operationalReadiness ?? {
    status: "CLEAR",
    summary: "No deterministic operational readiness signal was available.",
    failureModes: [],
    detectionSignals: [],
    observabilityGaps: [],
    recoveryOrRollback: [],
    customerOrDataImpact: [],
    ownerOrReviewerFocus: [],
  } satisfies OperationalReadiness;
  const operationalReadiness = normaliseOperationalReadiness(value.operationalReadiness, baselineOperationalReadiness);
  const submittedFindings = normaliseFindings(value.findings, baseline);
  const baselineHasMissingTestFinding = baseline.findings.some((finding) => finding.category === "Missing tests");
  const findings = mergeFindings(
    baseline.findings,
    baselineHasMissingTestFinding
      ? submittedFindings
      : submittedFindings.filter((finding) => finding.category !== "Missing tests"),
  );
  const submittedMissingTests = stringArray(value.missingTests, [], 12, 500);
  const missingTests = baseline.missingTests.length > 0
    ? mergeStrings(baseline.missingTests, submittedMissingTests, 12, 500)
    : [];
  const conditionsBeforeMerge = mergeStrings(
    baseline.conditionsBeforeMerge,
    stringArray(value.conditionsBeforeMerge, [], 12, 500),
    12,
    500,
  );
  const suggestedTests = mergeSuggestedTests(
    baseline.suggestedTests,
    normaliseSuggestedTests(value.suggestedTests, []),
  );
  const reviewerChecklist = normaliseChecklist(value.reviewerChecklist, baseline.reviewerChecklist);
  const supportedReviewerFocus = reviewerFocusSupport(baseline);
  const reviewerFocus = mergeReviewerFocus(
    baseline.reviewerFocus ?? [],
    normaliseReviewerFocus(value.reviewerFocus, supportedReviewerFocus),
  ).filter((item) => supportedReviewerFocus.has(item.area as ReviewerFocusArea));
  const rawScore = typeof value.verdict.riskScore === "number" && Number.isFinite(value.verdict.riskScore)
    ? value.verdict.riskScore
    : baseline.verdict.riskScore;
  const submittedRiskScore = Math.round(Math.min(100, Math.max(0, rawScore)));
  const riskScore = Math.max(submittedRiskScore, baselineRiskFloor(baseline));

  const recommendation: Recommendation = missingTests.length > 0
    ? "TESTS_REQUIRED"
    : findings.length > 0
      || conditionsBeforeMerge.length > 0
      || Object.values(reviews).some((review) => review.status === "ATTENTION")
      || operationalReadiness.status === "ATTENTION"
      ? "REVIEW_REQUIRED"
      : "APPROVE";
  const recommendationSuggestedTests = recommendation === "APPROVE" ? [] : suggestedTests;
  const submittedRecommendation = enumValue(value.verdict.recommendation, RECOMMENDATIONS, baseline.verdict.recommendation);
  const finalRecommendation = submittedRecommendation === recommendation
    ? text(value.finalRecommendation, canonicalRecommendationCopy(recommendation), 1000)
    : canonicalRecommendationCopy(recommendation);
  const fallbackSummary = canonicalAiSummary(baseline, findings, missingTests);
  const submittedSummary = text(value.verdict.summary, fallbackSummary, 1200);
  const summary = riskScore > submittedRiskScore
    ? `${fallbackSummary} Risk scoring retains deterministic safety guardrails.`
    : /local prototype rules/i.test(submittedSummary)
      ? fallbackSummary
      : submittedSummary;

  const normalisedReport: Report = {
    pr: baseline.pr,
    verdict: {
      recommendation,
      riskScore,
      riskLevel: riskLevelFromScore(riskScore),
      confidence: enumValue(value.verdict.confidence, CONFIDENCE_LEVELS, baseline.verdict.confidence),
      summary,
    },
    changedFiles: baseline.changedFiles,
    findings,
    reviews,
    operationalReadiness,
    reviewerFocus,
    missingTests,
    suggestedTests: recommendationSuggestedTests,
    reviewerChecklist,
    finalRecommendation,
    conditionsBeforeMerge: recommendation === "APPROVE" ? [] : conditionsBeforeMerge,
  };

  const prunedReport: Report = {
    ...normalisedReport,
    reviewerFocus: pruneUnsupportedReviewerFocus(normalisedReport),
  };

  return {
    ...prunedReport,
    reportQuality: assessReportQuality(prunedReport),
  };
}

const reviewSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["CLEAR", "ATTENTION"] },
    summary: { type: "string" },
    points: { type: "array", items: { type: "string" } },
  },
  required: ["status", "summary", "points"],
  additionalProperties: false,
};

export const REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    pr: {
      type: "object",
      properties: {
        number: { type: "integer" },
        title: { type: "string" },
        repository: { type: "string" },
        project: { type: "string" },
        branch: { type: "string" },
        language: { type: "string" },
        framework: { type: "string" },
        author: { type: "string" },
        updatedAt: { type: "string" },
        reviewProfile: { type: "string", enum: REVIEW_PROFILE_IDS },
      },
      required: ["number", "title", "repository", "project", "branch", "language", "framework", "author", "updatedAt", "reviewProfile"],
      additionalProperties: false,
    },
    verdict: {
      type: "object",
      properties: {
        recommendation: { type: "string", enum: RECOMMENDATIONS },
        riskScore: { type: "number", minimum: 0, maximum: 100 },
        riskLevel: { type: "string", enum: RISK_LEVELS },
        confidence: { type: "string", enum: CONFIDENCE_LEVELS },
        summary: { type: "string" },
      },
      required: ["recommendation", "riskScore", "riskLevel", "confidence", "summary"],
      additionalProperties: false,
    },
    changedFiles: {
      type: "array",
      items: {
        type: "object",
        properties: { path: { type: "string" }, risk: { type: "string", enum: RISK_LEVELS } },
        required: ["path", "risk"],
        additionalProperties: false,
      },
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: FINDING_SEVERITIES },
          title: { type: "string" },
          evidence: { type: "string" },
          action: { type: "string" },
          category: { type: "string", enum: FINDING_CATEGORIES },
        },
        required: ["severity", "title", "evidence", "action", "category"],
        additionalProperties: false,
      },
    },
    reviews: {
      type: "object",
      properties: { security: reviewSchema, reliability: reviewSchema, maintainability: reviewSchema },
      required: ["security", "reliability", "maintainability"],
      additionalProperties: false,
    },
    operationalReadiness: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["CLEAR", "ATTENTION"] },
        summary: { type: "string" },
        failureModes: { type: "array", items: { type: "string" } },
        detectionSignals: { type: "array", items: { type: "string" } },
        observabilityGaps: { type: "array", items: { type: "string" } },
        recoveryOrRollback: { type: "array", items: { type: "string" } },
        customerOrDataImpact: { type: "array", items: { type: "string" } },
        ownerOrReviewerFocus: { type: "array", items: { type: "string" } },
      },
      required: [
        "status",
        "summary",
        "failureModes",
        "detectionSignals",
        "observabilityGaps",
        "recoveryOrRollback",
        "customerOrDataImpact",
        "ownerOrReviewerFocus",
      ],
      additionalProperties: false,
    },
    reviewerFocus: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string", enum: REVIEWER_FOCUS_AREAS },
          priority: { type: "string", enum: ["PRIMARY", "SECONDARY"] },
          reason: { type: "string" },
        },
        required: ["area", "priority", "reason"],
        additionalProperties: false,
      },
    },
    missingTests: { type: "array", items: { type: "string" } },
    suggestedTests: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" } },
        required: ["title"],
        additionalProperties: false,
      },
    },
    reviewerChecklist: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, status: { type: "string", enum: ["COMPLETE", "ATTENTION"] } },
        required: ["label", "status"],
        additionalProperties: false,
      },
    },
    finalRecommendation: { type: "string" },
    conditionsBeforeMerge: { type: "array", items: { type: "string" } },
  },
  required: [
    "pr",
    "verdict",
    "changedFiles",
    "findings",
    "reviews",
    "operationalReadiness",
    "reviewerFocus",
    "missingTests",
    "suggestedTests",
    "reviewerChecklist",
    "finalRecommendation",
    "conditionsBeforeMerge",
  ],
  additionalProperties: false,
} as const;
