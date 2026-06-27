import type { Confidence, FindingSeverity, Recommendation, Report, ReviewArea, RiskLevel } from "./mock-report";

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

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 31) return "MEDIUM";
  return "LOW";
}

function normaliseReview(value: unknown, fallback: ReviewArea): ReviewArea {
  if (!isRecord(value)) return fallback;
  return {
    status: enumValue(value.status, ["CLEAR", "ATTENTION"], fallback.status),
    summary: text(value.summary, fallback.summary),
    points: stringArray(value.points, fallback.points, 6, 400),
  };
}

function normaliseFindings(value: unknown, baseline: Report) {
  if (!Array.isArray(value)) return baseline.findings;
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

function normaliseChecklist(value: unknown, fallback: Report["reviewerChecklist"]) {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item): Report["reviewerChecklist"] => {
    if (!isRecord(item) || typeof item.label !== "string" || !item.label.trim()) return [];
    if (item.status !== "COMPLETE" && item.status !== "ATTENTION") return [];
    return [{ label: item.label.trim().slice(0, 300), status: item.status }];
  }).slice(0, 12);
}

function canonicalRecommendationCopy(recommendation: Recommendation) {
  if (recommendation === "APPROVE") return "No unresolved findings or merge conditions remain. Complete normal human review before approval.";
  if (recommendation === "TESTS_REQUIRED") return "Do not approve until the identified test gaps have been addressed.";
  return "Focused human review is required for the findings and conditions identified in this report.";
}

export function normaliseReport(value: unknown, baseline: Report): Report | null {
  if (!isRecord(value) || !isRecord(value.verdict) || !isRecord(value.reviews)) return null;

  const reviews = {
    security: normaliseReview(value.reviews.security, baseline.reviews.security),
    reliability: normaliseReview(value.reviews.reliability, baseline.reviews.reliability),
    maintainability: normaliseReview(value.reviews.maintainability, baseline.reviews.maintainability),
  };
  const findings = normaliseFindings(value.findings, baseline);
  const missingTests = stringArray(value.missingTests, baseline.missingTests, 12, 500);
  const conditionsBeforeMerge = stringArray(value.conditionsBeforeMerge, baseline.conditionsBeforeMerge, 12, 500);
  const suggestedTests = normaliseSuggestedTests(value.suggestedTests, baseline.suggestedTests);
  const reviewerChecklist = normaliseChecklist(value.reviewerChecklist, baseline.reviewerChecklist);
  const rawScore = typeof value.verdict.riskScore === "number" && Number.isFinite(value.verdict.riskScore)
    ? value.verdict.riskScore
    : baseline.verdict.riskScore;
  const riskScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  const recommendation: Recommendation = missingTests.length > 0
    ? "TESTS_REQUIRED"
    : findings.length > 0 || conditionsBeforeMerge.length > 0 || Object.values(reviews).some((review) => review.status === "ATTENTION")
      ? "REVIEW_REQUIRED"
      : "APPROVE";
  const submittedRecommendation = enumValue(value.verdict.recommendation, RECOMMENDATIONS, baseline.verdict.recommendation);
  const finalRecommendation = submittedRecommendation === recommendation
    ? text(value.finalRecommendation, canonicalRecommendationCopy(recommendation), 1000)
    : canonicalRecommendationCopy(recommendation);

  return {
    pr: baseline.pr,
    verdict: {
      recommendation,
      riskScore,
      riskLevel: riskLevelFromScore(riskScore),
      confidence: enumValue(value.verdict.confidence, CONFIDENCE_LEVELS, baseline.verdict.confidence),
      summary: text(value.verdict.summary, baseline.verdict.summary, 1200),
    },
    changedFiles: baseline.changedFiles,
    findings,
    reviews,
    missingTests,
    suggestedTests,
    reviewerChecklist,
    finalRecommendation,
    conditionsBeforeMerge: recommendation === "APPROVE" ? [] : conditionsBeforeMerge,
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
      },
      required: ["number", "title", "repository", "project", "branch", "language", "framework", "author", "updatedAt"],
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
    "missingTests",
    "suggestedTests",
    "reviewerChecklist",
    "finalRecommendation",
    "conditionsBeforeMerge",
  ],
  additionalProperties: false,
} as const;
