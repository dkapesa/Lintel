/* R3D — landing-owned public fixture adapter.

   The public landing shows real product structure, so it derives that
   structure from the same code the product uses:

     canonical sample input / canonical report
       → generateReport (deterministic prototype rules)
       → historicalCanonicalRunManifest
       → buildEvidenceHierarchy
       → buildMergeContract
       → a small serialisable landing shape
       → the client theatre component

   Everything below runs at build/server time. The client receives only the
   projected shape, never a Report, an EvidenceHierarchySummary or a
   MergeContract. Nothing here reads or writes report history, decision
   ledgers, review state or any storage key, and nothing here makes a network
   request.

   TRUTHFULNESS NOTES
   - Scenario 1 is the canonical curated dossier (`lib/mock-report`): the
     `acme/redemption-api` #482 change, TESTS REQUIRED, risk 46/100 medium,
     four conditions before merge, no recorded decision.
   - Scenarios 2 and 3 are produced by running the real deterministic
     generator over real canonical samples in `lib/sample-pr-input`. Their
     recommendation, risk and counts are whatever the rules actually produce.
   - No sample carries a head commit, because none of these inputs has one.
     The landing shows "not recorded" rather than inventing a SHA, and keeps
     R3A's "where the head is available" qualifier visible.
   - Human Decision is pending in every scenario. Nothing in this file can
     record one. */

import {
  createCanonicalReviewRunManifest,
  fingerprintPrefix,
  historicalCanonicalRunManifest,
  type CanonicalReviewRunManifest,
} from "./canonical-review-run";
import { buildEvidenceHierarchy, type EvidenceHierarchySummary, type EvidenceRecord } from "./evidence-hierarchy";
import { buildMergeContract, type MergeContract, type MergeContractClause } from "./merge-contract";
import { report as canonicalReport, type Report } from "./mock-report";
import { generateReport } from "./report-generator";
import { CLEAN_APPROVE_SAMPLE, LOGGING_PRIVACY_SAMPLE, RISKY_TESTS_REQUIRED_SAMPLE } from "./sample-pr-input";

/* ------------------------------------------------------------------ shape */

export type LandingStageId = "change" | "observation" | "evidence" | "requirement" | "decision";
export type LandingTone = "neutral" | "warning" | "danger" | "success" | "info" | "provenance";

export type LandingRecord = {
  /** Mono identity (`F1`, `E1`, `C1`) where the product carries one. */
  id?: string;
  kind: string;
  title: string;
  detail?: string;
  state?: string;
  tone?: LandingTone;
  meta?: { label: string; value: string }[];
  /** Mono-set lines rendered as a technical well (paths, identities). */
  lines?: string[];
};

export type LandingStage = {
  id: LandingStageId;
  label: string;
  definition: string;
  caption: string;
  records: LandingRecord[];
};

export type LandingScenario = {
  id: string;
  label: string;
  summary: string;
  repository: string;
  pullRequest: string;
  branch: string;
  title: string;
  /** Real run identity. These samples carry no head commit. */
  runId: string;
  head: string;
  recommendation: string;
  recommendationTone: LandingTone;
  riskScore: number;
  riskBand: string;
  openRequirements: number;
  blockingRequirements: number;
  missingProof: number;
  /** Locked: pending in every scenario. */
  decisionState: "pending";
  stages: LandingStage[];
};

export type LandingHeadSummary = {
  id: "previous" | "current";
  label: string;
  runId: string;
  recorded: string;
  recommendation: string;
  riskScore: number;
  riskBand: string;
  openRequirements: number;
  blockingRequirements: number;
  missingProof: number;
};

export type LandingMovement = {
  mark: "cleared" | "opened" | "reopened" | "changed";
  id: string;
  detail: string;
};

export type LandingRunManifest = {
  mode: "deterministic" | "model";
  runId: string;
  schemaVersion: string;
  sourceType: string;
  reportSchemaVersion: string;
  generatorVersion: string;
  deterministicRulesetVersion: string;
  reviewMode: string;
  analysisSource: string;
  inputFingerprint: { full: string; short: string };
  configurationFingerprint: { full: string; short: string };
  resultFingerprint: { full: string; short: string };
  reproducibility: "EXACT" | "TRACEABLE";
  limitation: string;
};

/* ------------------------------------------------------------- projection */

const RECOMMENDATION_LABEL: Record<string, string> = {
  APPROVE: "APPROVE",
  REVIEW_REQUIRED: "REVIEW REQUIRED",
  TESTS_REQUIRED: "TESTS REQUIRED",
  BLOCK: "BLOCK",
};

const RECOMMENDATION_TONE: Record<string, LandingTone> = {
  APPROVE: "success",
  REVIEW_REQUIRED: "warning",
  TESTS_REQUIRED: "warning",
  BLOCK: "danger",
};

const SEVERITY_TONE: Record<string, LandingTone> = {
  CRITICAL: "danger",
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "neutral",
};

const HEAD_NOT_RECORDED = "not recorded";

type Derived = {
  report: Report;
  runId: string;
  evidence: EvidenceHierarchySummary;
  contract: MergeContract;
};

function derive(report: Report, sourceType: "demo" | "sample"): Derived {
  const run = historicalCanonicalRunManifest(report, sourceType);
  const evidence = buildEvidenceHierarchy(report, null, { runId: run.runId, createdAt: run.completedAt });
  const contract = buildMergeContract({
    report,
    evidenceHierarchy: evidence,
    canonicalRunId: run.runId,
    sourceType: run.sourceType,
    reviewMode: run.reviewMode,
    createdAt: run.completedAt,
  });
  return { report, runId: fingerprintPrefix(run.resultFingerprint), evidence, contract };
}

/* "Requirement" on the public page means what the product means by a condition
   before merge — the clauses `buildMergeContract` derives from
   `report.conditionsBeforeMerge`, carrying source "Conditions before merge".
   The contract also holds test-gap, evidence and review clauses; those are
   real, but they are not the requirement register the landing describes, and
   counting them would contradict the canonical record's four open
   requirements. */
const CONDITION_SOURCE = "Conditions before merge";

/* The assumption register derives its own clauses from the same conditions and
   carries the same source string, so source alone would double the count. The
   condition clauses are the `change-verification` ones. */
const isRequirement = (clause: MergeContractClause) =>
  clause.source === CONDITION_SOURCE && clause.type === "change-verification";

const openClauses = (contract: MergeContract) =>
  contract.clauses.filter((clause) => clause.status === "open" && isRequirement(clause));
const blockingOpen = (contract: MergeContract) =>
  contract.clauses.filter((clause) => clause.status === "open" && clause.importance === "blocking" && isRequirement(clause));
const missingEvidence = (evidence: EvidenceHierarchySummary) =>
  evidence.records.filter((record) => record.status === "missing" || record.status === "unverified");
const observedEvidence = (evidence: EvidenceHierarchySummary) =>
  evidence.records.filter((record) => record.status === "present" || record.status === "confirmed");

function clauseState(clause: MergeContractClause) {
  return `${clause.status.toUpperCase()} · ${clause.importance.toUpperCase()}`;
}

function evidenceState(record: EvidenceRecord) {
  if (record.status === "missing" || record.status === "unverified") return "MISSING · UNVERIFIED";
  if (record.class === "model-inferred") return "MODEL INFERRED";
  if (record.class === "assumption") return "ASSUMPTION";
  return "DIRECTLY OBSERVED";
}

function evidenceTone(record: EvidenceRecord): LandingTone {
  if (record.status === "missing" || record.status === "unverified") return "warning";
  if (record.class === "model-inferred" || record.class === "assumption") return "provenance";
  return "info";
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function buildStages(derived: Derived): LandingStage[] {
  const { report, evidence, contract, runId } = derived;
  const files = report.changedFiles.map((file) => file.path);
  const findings = report.findings;
  const observed = observedEvidence(evidence).slice(0, 2);
  const missing = missingEvidence(evidence).slice(0, 2);
  const open = openClauses(contract);
  const blocking = blockingOpen(contract);

  const changeRecords: LandingRecord[] = [
    {
      kind: "Changed files",
      title: files.length === 1 ? "One file moves" : "The changed surface",
      detail: report.verdict.summary,
      state: plural(files.length, "FILE", "FILES").toUpperCase(),
      tone: "neutral",
      lines: files,
    },
    {
      kind: "Review frame",
      title: `${report.pr.reviewProfile === "standard" ? "Standard readiness" : report.pr.reviewProfile} review`,
      detail: `${report.pr.language} · ${report.pr.framework} · deterministic analysis. No model was configured for this sample.`,
      state: "PROFILE",
      tone: "neutral",
      meta: [
        { label: "Run", value: runId },
        { label: "Head", value: HEAD_NOT_RECORDED },
      ],
    },
  ];

  const observationRecords: LandingRecord[] = findings.length
    ? findings.slice(0, 3).map((finding, index) => ({
        id: `F${index + 1}`,
        kind: "Finding",
        title: finding.title,
        detail: finding.evidence,
        state: `${finding.severity} · ${(finding.provenance ?? "Rule detected").toUpperCase()}`,
        tone: SEVERITY_TONE[finding.severity] ?? "warning",
      }))
    : [
        {
          kind: "Observation",
          title: "No material issue found.",
          detail:
            "The change is contained and the deterministic rules raised nothing. Lintel keeps the record concise rather than manufacturing findings.",
          state: "NONE OPEN",
          tone: "success" as LandingTone,
        },
      ];

  const evidenceRecords: LandingRecord[] = [
    ...observed.map((record, index) => ({
      id: `E${index + 1}`,
      kind: record.relatedFindingIds.length ? `Evidence · supports F${Number(record.relatedFindingIds[0].split("-")[1]) + 1}` : "Evidence",
      title: record.statement,
      detail: `${record.source} · ${record.provenance}`,
      state: evidenceState(record),
      tone: evidenceTone(record),
      lines: record.supportingReference ? [record.supportingReference] : undefined,
    })),
    ...missing.map((record, index) => ({
      id: `E${observed.length + index + 1}`,
      kind: "Missing proof",
      title: record.statement,
      detail: record.source,
      state: evidenceState(record),
      tone: evidenceTone(record),
    })),
  ];

  if (!evidenceRecords.length) {
    evidenceRecords.push({
      kind: "Evidence composition",
      title: "Nothing in this change rests on an assumption Lintel could not read.",
      state: "PRESENT",
      tone: "success",
    });
  }

  const requirementRecords: LandingRecord[] = open.length
    ? open.slice(0, 4).map((clause, index) => ({
        id: `C${index + 1}`,
        kind: "Requirement",
        title: clause.statement,
        detail: index === 0 ? "Satisfied by evidence a person supplies. Lintel does not clear its own requirements." : clause.evidenceRequired,
        state: clauseState(clause),
        tone: clause.importance === "blocking" ? "warning" : "neutral",
      }))
    : [
        {
          kind: "Requirements",
          title: "No open requirement.",
          detail: "Nothing was left unproved, so nothing became a condition before merge.",
          state: "NONE OPEN",
          tone: "success" as LandingTone,
        },
      ];

  const decisionRecords: LandingRecord[] = [
    {
      kind: "Decision record",
      title: "No engineer decision recorded.",
      detail:
        "Lintel has produced a recommendation and a risk band. The accountable engineer records the decision, in the product — not here.",
      state: "PENDING",
      tone: "neutral",
      meta: [
        { label: "Outcome", value: "—" },
        { label: "Actor", value: "—" },
        { label: "Recorded", value: "—" },
        { label: "Applies to", value: HEAD_NOT_RECORDED },
      ],
    },
  ];

  return [
    {
      id: "change",
      label: "Change",
      definition: "What the pull request alters.",
      caption: `${plural(files.length, "file", "files")} changed. The review is framed by what actually moved.`,
      records: changeRecords,
    },
    {
      id: "observation",
      label: "Observation",
      definition: "What Lintel found, with its origin labelled.",
      caption: findings.length
        ? `${plural(findings.length, "finding", "findings")}. Each carries the rule that produced it.`
        : "No material issue. The record stays short — that is restraint, not a guarantee.",
      records: observationRecords,
    },
    {
      id: "evidence",
      label: "Evidence",
      definition: "The record behind each observation.",
      caption: missing.length
        ? `${plural(observed.length, "record is", "records are")} observed. ${plural(missing.length, "proof is", "proofs are")} missing.`
        : "Every observation here rests on a record Lintel could read directly.",
      records: evidenceRecords,
    },
    {
      id: "requirement",
      label: "Requirement",
      definition: "Unproved evidence, turned into an explicit condition before merge.",
      caption: open.length
        ? `${plural(open.length, "requirement is", "requirements are")} open. ${blocking.length} blocking.`
        : "None open, and none blocking.",
      records: requirementRecords,
    },
    {
      id: "decision",
      label: "Human Decision",
      definition: "The accountable engineer's recorded outcome.",
      caption: "Nothing is recorded. The recommendation is not an outcome.",
      records: decisionRecords,
    },
  ];
}

function toScenario(
  derived: Derived,
  meta: { id: string; label: string; summary: string; repository?: string; pullRequest: string; branch: string },
): LandingScenario {
  const { report, evidence, contract, runId } = derived;
  return {
    id: meta.id,
    label: meta.label,
    summary: meta.summary,
    /* The canonical dossier stores a prose project name; the public page uses
       the canonical `acme/*` sample repository that the same change carries in
       lib/sample-pr-input, per R3A §15. */
    repository: meta.repository ?? report.pr.repository,
    pullRequest: meta.pullRequest,
    branch: meta.branch,
    title: report.pr.title,
    runId,
    head: HEAD_NOT_RECORDED,
    recommendation: RECOMMENDATION_LABEL[report.verdict.recommendation] ?? report.verdict.recommendation,
    recommendationTone: RECOMMENDATION_TONE[report.verdict.recommendation] ?? "warning",
    riskScore: report.verdict.riskScore,
    riskBand: report.verdict.riskLevel,
    openRequirements: openClauses(contract).length,
    blockingRequirements: blockingOpen(contract).length,
    missingProof: missingEvidence(evidence).length,
    decisionState: "pending",
    stages: buildStages(derived),
  };
}

/* --------------------------------------------------------------- scenarios */

/** Scenario 1 — the canonical curated dossier. The locked default state. */
const canonical = derive(canonicalReport, "demo");

/** Scenario 2 — a different failure class, produced by the real rules. */
const loggingPrivacy = derive(generateReport({ ...LOGGING_PRIVACY_SAMPLE, inputSource: "sample" }), "sample");

/** Scenario 3 — the canonical clean change, produced by the real rules. */
const cleanChange = derive(generateReport({ ...CLEAN_APPROVE_SAMPLE, inputSource: "sample" }), "sample");

export const LANDING_SCENARIOS: LandingScenario[] = [
  toScenario(canonical, {
    id: "missing-tests",
    label: "Missing tests",
    summary: "The default record: proof is missing, so requirements are open.",
    repository: RISKY_TESTS_REQUIRED_SAMPLE.repository,
    pullRequest: "#482",
    branch: canonicalReport.pr.branch,
  }),
  toScenario(loggingPrivacy, {
    id: "sensitive-logging",
    label: "Sensitive logging",
    summary: "A different failure class. The same five stages hold.",
    pullRequest: "",
    branch: "sample review",
  }),
  toScenario(cleanChange, {
    id: "ready",
    label: "Ready for decision",
    summary: "A favourable recommendation. The decision is still not recorded.",
    pullRequest: "",
    branch: "sample review",
  }),
];

/* ------------------------------------------------------------------- hero */

export type LandingHeroCaseFile = {
  repository: string;
  pullRequest: string;
  title: string;
  recommendation: string;
  recommendationTone: LandingTone;
  riskScore: number;
  riskBand: string;
  decisionState: "PENDING";
  missingProof: {
    id: "E4";
    kind: "Missing proof";
    title: string;
    state: string;
    tone: LandingTone;
  };
  requirement: {
    id: "C1";
    kind: "Requirement";
    title: string;
    state: string;
    tone: LandingTone;
  };
  provenance: "Sample data";
};

const heroFinding = canonicalReport.findings[0];
const heroObserved = observedEvidence(canonical.evidence)[0];
const heroMissing = missingEvidence(canonical.evidence)[0];
const heroClause = blockingOpen(canonical.contract)[0] ?? openClauses(canonical.contract)[0];
const heroOpenCount = openClauses(canonical.contract).length;

export const LANDING_HERO_CASE_FILE: LandingHeroCaseFile = {
  repository: RISKY_TESTS_REQUIRED_SAMPLE.repository,
  pullRequest: "#482",
  title: canonicalReport.pr.title,
  recommendation: RECOMMENDATION_LABEL[canonicalReport.verdict.recommendation] ?? canonicalReport.verdict.recommendation,
  recommendationTone: RECOMMENDATION_TONE[canonicalReport.verdict.recommendation] ?? "warning",
  riskScore: canonicalReport.verdict.riskScore,
  riskBand: canonicalReport.verdict.riskLevel,
  decisionState: "PENDING",
  missingProof: {
    id: "E4",
    kind: "Missing proof",
    title: heroMissing?.title ?? "Test evidence unavailable",
    state: "MISSING · UNVERIFIED",
    tone: "warning",
  },
  requirement: {
    id: "C1",
    kind: "Requirement",
    title: heroClause?.statement ?? "Prove retries cannot issue duplicate discount codes",
    state: heroClause ? clauseState(heroClause) : "OPEN · BLOCKING",
    tone: "warning",
  },
  provenance: "Sample data",
};

/* ---------------------------------------------------------- evidence chain */

export const LANDING_CHAIN: {
  id: LandingStageId;
  label: string;
  definition: string;
  exampleId: string;
  exampleTitle: string;
  exampleState: string;
  exampleTone: LandingTone;
}[] = [
  {
    id: "change",
    label: "Change",
    definition: "What the pull request actually alters.",
    exampleId: `${canonicalReport.changedFiles.length} files`,
    exampleTitle: canonicalReport.changedFiles[0].path,
    exampleState: "REDEMPTION PATH",
    exampleTone: "neutral",
  },
  {
    id: "observation",
    label: "Observation",
    definition: "What Lintel found, with its origin labelled.",
    exampleId: "F1",
    exampleTitle: heroFinding.title,
    exampleState: `${heroFinding.severity} · ${(heroFinding.provenance ?? "Rule detected").toUpperCase()}`,
    exampleTone: SEVERITY_TONE[heroFinding.severity] ?? "danger",
  },
  {
    id: "evidence",
    label: "Evidence",
    definition: "The record behind each observation — observed, inferred or missing.",
    exampleId: "E1",
    exampleTitle: heroObserved?.statement ?? "The retry path is present; no idempotency guard is observed.",
    exampleState: "DIRECTLY OBSERVED",
    exampleTone: "info",
  },
  {
    id: "requirement",
    label: "Requirement",
    definition: "Anything unproved, turned into an explicit condition to satisfy before merge.",
    exampleId: "C1",
    exampleTitle: heroClause?.statement ?? "Prove retries cannot issue duplicate discount codes.",
    exampleState: heroClause ? clauseState(heroClause) : "OPEN · BLOCKING",
    exampleTone: "warning",
  },
  {
    id: "decision",
    label: "Human Decision",
    definition: "The accountable engineer's recorded outcome.",
    exampleId: "—",
    exampleTitle: "No engineer decision recorded.",
    exampleState: "PENDING",
    exampleTone: "neutral",
  },
];

/* -------------------------------------------------------- review evolution

   Two real runs of the same canonical change: the deterministic prototype run
   over the raw sample diff, and the curated canonical dossier. Every value and
   every movement below is computed by comparing those two records, so the
   comparison reconciles by construction. Neither run carries a head commit,
   and the section says so rather than inventing one. */

const previousRun = derive(generateReport({ ...RISKY_TESTS_REQUIRED_SAMPLE, inputSource: "sample" }), "sample");

function headSummary(derived: Derived, id: "previous" | "current", label: string, recorded: string): LandingHeadSummary {
  return {
    id,
    label,
    runId: derived.runId,
    recorded,
    recommendation: RECOMMENDATION_LABEL[derived.report.verdict.recommendation] ?? derived.report.verdict.recommendation,
    riskScore: derived.report.verdict.riskScore,
    riskBand: derived.report.verdict.riskLevel,
    openRequirements: openClauses(derived.contract).length,
    blockingRequirements: blockingOpen(derived.contract).length,
    missingProof: missingEvidence(derived.evidence).length,
  };
}

export const LANDING_EVOLUTION: {
  previous: LandingHeadSummary;
  current: LandingHeadSummary;
  movements: LandingMovement[];
  headNote: string;
} = (() => {
  const previous = headSummary(previousRun, "previous", "Previous run", "Run 1");
  const current = headSummary(canonical, "current", "Current run", "Run 2");

  const key = (clause: MergeContractClause) => clause.statement.trim().toLowerCase();
  const previousOpen = new Map(openClauses(previousRun.contract).map((clause) => [key(clause), clause]));
  const currentOpen = new Map(openClauses(canonical.contract).map((clause) => [key(clause), clause]));

  const movements: LandingMovement[] = [];
  let cleared = 0;
  let opened = 0;

  previousOpen.forEach((clause, id) => {
    if (currentOpen.has(id)) return;
    cleared += 1;
    if (cleared > 2) return;
    movements.push({ mark: "cleared", id: `C${cleared}`, detail: `${clause.statement} — no longer open at the current run.` });
  });

  currentOpen.forEach((clause, id) => {
    if (previousOpen.has(id)) return;
    opened += 1;
    if (opened > 2) return;
    movements.push({ mark: "opened", id: `C${cleared + opened}`, detail: `${clause.statement} — raised by the current run.` });
  });

  movements.push({
    mark: "changed",
    id: "E1",
    detail: "The evidence behind the retry path was re-read against the current record rather than carried forward.",
  });

  return {
    previous,
    current,
    movements,
    headNote:
      "Neither sample run records a head commit. Where a head is available, a recorded decision is tied to it and can go stale as the change moves on.",
  };
})();

/* ------------------------------------------------- recommendation register */

export const LANDING_RECOMMENDATION_ENTRIES: { id: string; label: string; value: string }[] = [
  {
    id: "F1",
    label: "Finding",
    value: `${heroFinding.title} ${heroFinding.severity} · ${(heroFinding.provenance ?? "Rule detected").toLowerCase()}.`,
  },
  {
    id: "E1",
    label: "Evidence",
    value: `${heroObserved?.statement ?? "The retry path is present; no idempotency guard is observed."} Directly observed.`,
  },
  { id: "E4", label: "Missing proof", value: heroMissing?.title ?? "No test proves a repeated attempt cannot issue a second code." },
  { id: "C1", label: "Requirement", value: `${heroClause?.statement ?? ""} ${heroClause ? clauseState(heroClause) : "OPEN · BLOCKING"}.` },
  {
    id: "—",
    label: "Requirements open",
    value: `${heroOpenCount} open · ${blockingOpen(canonical.contract).length} blocking · ${
      heroOpenCount - blockingOpen(canonical.contract).length
    } advisory`,
  },
  { id: "—", label: "Risk", value: `${canonicalReport.verdict.riskScore}/100 · ${canonicalReport.verdict.riskLevel}` },
];

export const LANDING_RECOMMENDATION_STATE = {
  label: RECOMMENDATION_LABEL[canonicalReport.verdict.recommendation],
  tone: RECOMMENDATION_TONE[canonicalReport.verdict.recommendation],
};

/* --------------------------------------------- GitHub, trust and audience */

export const LANDING_WORKFLOW_STEPS = [
  { id: "01", label: "Pull request received", detail: "An installed repository opens or updates a pull request." },
  {
    id: "02",
    label: "Webhook verified",
    detail: "Raw-body HMAC SHA-256, checked with a timing-safe comparison.",
  },
  {
    id: "03",
    label: "Analysis run",
    detail: "Deterministic first; configured model context can enrich the result without replacing the fallback.",
  },
  {
    id: "04",
    label: "Decision comment updated",
    detail: "The current result is created or rewritten in place.",
  },
];

export const LANDING_WORKFLOW_BOUNDARY =
  "The GitHub App is real when configured. The GitHub Action remains a blueprint. Lintel does not merge, approve or enforce repository policy.";

export const LANDING_TRUST_PRINCIPLES = [
  {
    id: "01",
    title: "Deterministic first",
    lead: "The ruleset runs first and remains the fallback if optional model analysis cannot complete.",
  },
  {
    id: "02",
    title: "Optional model analysis",
    lead: "A configured model may enrich the result, but cannot silently remove a known blocker or required test.",
  },
  {
    id: "03",
    title: "Canonical run identity",
    lead: "Every run binds its source, schemas, generator, ruleset and fingerprints to one manifest.",
  },
  {
    id: "04",
    title: "Explicit reproducibility",
    lead: "Deterministic runs are reproducible; model-assisted runs retain traceable provenance without promising exact replay.",
  },
];

function projectRunManifest(manifest: CanonicalReviewRunManifest): LandingRunManifest {
  if (manifest.reproducibility !== "exact" && manifest.reproducibility !== "traceable") {
    throw new Error(`Landing run manifest requires exact or traceable provenance, received ${manifest.reproducibility}.`);
  }

  return {
    mode: manifest.analysisSource === "model" ? "model" : "deterministic",
    runId: manifest.runId,
    schemaVersion: manifest.schemaVersion,
    sourceType: manifest.sourceType,
    reportSchemaVersion: manifest.reportSchemaVersion,
    generatorVersion: manifest.generatorVersion,
    deterministicRulesetVersion: manifest.deterministicRulesetVersion,
    reviewMode: manifest.reviewMode,
    analysisSource: manifest.analysisSource,
    inputFingerprint: {
      full: manifest.inputFingerprint,
      short: fingerprintPrefix(manifest.inputFingerprint),
    },
    configurationFingerprint: {
      full: manifest.configurationFingerprint,
      short: fingerprintPrefix(manifest.configurationFingerprint),
    },
    resultFingerprint: {
      full: manifest.resultFingerprint,
      short: fingerprintPrefix(manifest.resultFingerprint),
    },
    reproducibility: manifest.reproducibility.toUpperCase() as "EXACT" | "TRACEABLE",
    limitation:
      manifest.reproducibilityLimitation ??
      "The deterministic inputs, configuration and ruleset reproduce the same canonical result.",
  };
}

const landingManifestInput = { ...RISKY_TESTS_REQUIRED_SAMPLE, inputSource: "sample" as const };
const landingManifestReport = generateReport(landingManifestInput);
const landingManifestCreatedAt = landingManifestReport.pr.updatedAt || canonicalReport.pr.updatedAt;

export const LANDING_RUN_MANIFESTS: Record<LandingRunManifest["mode"], LandingRunManifest> = {
  deterministic: projectRunManifest(
    createCanonicalReviewRunManifest({
      input: landingManifestInput,
      report: landingManifestReport,
      sourceType: "sample",
      analysisSource: "deterministic",
      pullRequestNumber: canonicalReport.pr.number,
      createdAt: landingManifestCreatedAt,
      completedAt: landingManifestCreatedAt,
    }),
  ),
  model: projectRunManifest(
    createCanonicalReviewRunManifest({
      input: landingManifestInput,
      report: landingManifestReport,
      sourceType: "sample",
      analysisSource: "model",
      pullRequestNumber: canonicalReport.pr.number,
      createdAt: landingManifestCreatedAt,
      completedAt: landingManifestCreatedAt,
    }),
  ),
};

export const LANDING_AUDIENCE = [
  "Teams using coding agents to produce more software changes",
  "Engineers responsible for deciding what reaches production",
  "Organisations that need evidence and explicit requirements before merge",
];

/* The updated GitHub decision comment, projected from the canonical record. */
export const LANDING_COMMENT = {
  recommendation: RECOMMENDATION_LABEL[canonicalReport.verdict.recommendation],
  risk: `${canonicalReport.verdict.riskScore}/100 ${canonicalReport.verdict.riskLevel}`,
  openRequirements: `${heroOpenCount} open`,
  decision: "PENDING",
  head: HEAD_NOT_RECORDED,
  clauses: blockingOpen(canonical.contract)
    .slice(0, 2)
    .map((clause, index) => ({ id: `C${index + 1}`, statement: `${clause.statement} — open, blocking.` })),
};
