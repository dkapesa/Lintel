import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildContractRecheck,
  type ContractRecheckClauseEvaluation,
} from "../../contract-recheck";
import {
  buildEvidenceHierarchy,
  type EvidenceHierarchySummary,
} from "../../evidence-hierarchy";
import {
  buildMergeContract,
  type MergeContract,
  type MergeContractClauseStatus,
} from "../../merge-contract";
import type { Report } from "../../mock-report";
import {
  createReadinessDelta,
  createReviewDiff,
  type AnalysisRunSnapshot,
} from "../../readiness-delta";

type Test = { name: string; run: () => void };
const tests: Test[] = [];
const test = (name: string, run: () => void): void => { tests.push({ name, run }); };

function fail(message: string): never { throw new Error(message); }
function assert(value: unknown, message: string): asserts value {
  if (!value) fail(message);
}
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) fail(`${message}: expected ${String(expected)}, received ${String(actual)}`);
}
function notEqual<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) fail(`${message}: both values were ${String(actual)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) fail(`${message}: expected ${right}, received ${left}`);
}

const CREATED_AT = "2026-09-08T20:00:00.000Z";
const HEAD_A = "head-bs0-temporal-a";
const HEAD_B = "head-bs0-temporal-b";

function emptyReport(): Report {
  return {
    pr: {
      number: 73,
      title: "Temporal characterization",
      repository: "lintel/temporal-characterization",
      project: "Lintel",
      branch: "github-pr",
      language: "TypeScript",
      framework: "Node",
      author: "BS0",
      updatedAt: CREATED_AT,
      reviewProfile: "standard",
    },
    verdict: {
      recommendation: "REVIEW_REQUIRED",
      riskScore: 50,
      riskLevel: "MEDIUM",
      confidence: "MEDIUM",
      summary: "Deterministic temporal characterization.",
    },
    changedFiles: [],
    findings: [],
    reviews: {
      security: { status: "CLEAR", summary: "No signal.", points: [] },
      reliability: { status: "CLEAR", summary: "No signal.", points: [] },
      maintainability: { status: "CLEAR", summary: "No signal.", points: [] },
    },
    missingTests: [],
    suggestedTests: [],
    reviewerChecklist: [],
    finalRecommendation: "Review the characterized boundary.",
    conditionsBeforeMerge: [],
  };
}

function runSnapshot(
  report: Report,
  {
    runId,
    headSha = HEAD_A,
    readinessScore = report.verdict.riskScore,
    recommendation = report.verdict.recommendation,
    riskLevel = report.verdict.riskLevel,
  }: {
    runId: string;
    headSha?: string;
    readinessScore?: number;
    recommendation?: Report["verdict"]["recommendation"];
    riskLevel?: Report["verdict"]["riskLevel"];
  },
): AnalysisRunSnapshot {
  return {
    runId,
    repository: report.pr.repository,
    pullRequestNumber: report.pr.number,
    baseSha: "base-bs0-temporal",
    headSha,
    recommendation,
    readinessScore,
    riskLevel,
    report,
    analysisSource: "deterministic",
    completedAt: CREATED_AT,
  };
}

function contractFor(
  report: Report,
  runId: string,
  headSha = HEAD_A,
  evidenceHierarchy?: EvidenceHierarchySummary,
): MergeContract {
  return buildMergeContract({
    report,
    evidenceHierarchy,
    canonicalRunId: runId,
    baseSha: "base-bs0-temporal",
    headSha,
    sourceType: "github-app",
    reviewMode: "standard",
    createdAt: CREATED_AT,
  });
}

function evaluationByIndex(
  evaluations: ContractRecheckClauseEvaluation[],
  index: number,
): ContractRecheckClauseEvaluation {
  const evaluation = evaluations[index];
  assert(evaluation, `contract evaluation ${index} must exist`);
  return evaluation;
}

test("T1 - identical state has no readiness or Review Diff movement", () => {
  const report = emptyReport();
  report.missingTests = ["Exercise the neutral temporal boundary."];
  const previous = runSnapshot(structuredClone(report), { runId: "run-t1-previous" });
  const current = runSnapshot(structuredClone(report), { runId: "run-t1-current" });

  const delta = createReadinessDelta(previous, current, [], CREATED_AT);
  const reviewDiff = createReviewDiff(previous, current, delta, [], CREATED_AT);
  assert(reviewDiff, "identical reports must produce a Review Diff");

  equal(delta.classification, "unchanged", "identical state classification");
  equal(delta.scoreChange, 0, "identical score movement");
  deepEqual(delta.openedMergeConditions, [], "no conditions open");
  deepEqual(delta.clearedMergeConditions, [], "no conditions clear");
  deepEqual(delta.addedBlockers, [], "no blockers are added");
  deepEqual(delta.clearedBlockers, [], "no blockers are cleared");
  deepEqual(delta.addedTestOrEvidenceGaps, [], "no gaps are added");
  deepEqual(delta.clearedTestOrEvidenceGaps, [], "no gaps are cleared");
  equal(delta.evidenceMovement?.evidenceAdded, 0, "equivalent Evidence IDs do not move");
  assert(
    [...reviewDiff.findings, ...reviewDiff.evidence, ...reviewDiff.testGaps, ...reviewDiff.mergeConditions]
      .every((item) => item.status === "unchanged"),
    "all comparable records remain unchanged",
  );

  const previousEvidence = buildEvidenceHierarchy(previous.report, null, {
    runId: previous.runId,
    headSha: previous.headSha,
    createdAt: CREATED_AT,
  });
  const currentEvidence = buildEvidenceHierarchy(current.report, null, {
    runId: current.runId,
    headSha: current.headSha,
    createdAt: CREATED_AT,
  });
  const recheck = buildContractRecheck({
    previousContract: contractFor(previous.report, previous.runId, previous.headSha, previousEvidence),
    currentContract: contractFor(current.report, current.runId, current.headSha, currentEvidence),
    previousEvidenceHierarchy: previousEvidence,
    currentEvidenceHierarchy: currentEvidence,
    triggeredAt: CREATED_AT,
  });
  assert(recheck, "equivalent contracts must recheck");
  equal(recheck.classification, "unchanged", "neutral contract recheck classification");
  equal(recheck.clauseEvaluations.length, 1, "one continuing requirement is evaluated");
  equal(recheck.clauseEvaluations[0]?.evaluationStatus, "still-open", "open requirement remains open");
  equal(recheck.newClauses.length, 0, "no contract clauses are added");
});

test("T2 - a readiness score increase from 10 to 20 is classified improved", () => {
  const report = emptyReport();
  const previous = runSnapshot(structuredClone(report), {
    runId: "run-t2-previous",
    readinessScore: 10,
  });
  const current = runSnapshot(structuredClone(report), {
    runId: "run-t2-current",
    readinessScore: 20,
  });

  const delta = createReadinessDelta(previous, current, [], CREATED_AT);
  equal(delta.previousScore, 10, "previous score");
  equal(delta.currentScore, 20, "current score");
  equal(delta.scoreChange, 10, "score movement");
  equal(delta.classification, "improved", "positive score movement classification");
});

test("T3 - disappearance is surfaced as cleared and improves classification", () => {
  const previousReport = emptyReport();
  previousReport.findings = [{
    severity: "HIGH",
    title: "Temporal concern",
    evidence: "The concern is visible in the earlier report.",
    action: "Investigate the concern.",
    file: "src/temporal.ts",
    provenance: "Rule detected",
    category: "Reliability",
  }];
  const currentReport = structuredClone(previousReport);
  currentReport.findings = [];

  const previous = runSnapshot(previousReport, { runId: "run-t3-previous" });
  const current = runSnapshot(currentReport, { runId: "run-t3-current" });
  const delta = createReadinessDelta(previous, current, [], CREATED_AT);
  const reviewDiff = createReviewDiff(previous, current, delta, [], CREATED_AT);
  assert(reviewDiff, "finding removal must produce a Review Diff");

  equal(delta.clearedBlockers.length, 1, "the absent finding is a cleared blocker");
  equal(delta.classification, "improved", "cleared finding drives improvement");
  equal(reviewDiff.findings.length, 1, "one finding comparison exists");
  equal(reviewDiff.findings[0]?.status, "cleared", "the absent finding is cleared");
  equal(reviewDiff.evidence[0]?.status, "cleared", "finding-derived evidence is also cleared");
  assert(
    !("resolutionEvidenceIds" in reviewDiff.findings[0]!),
    "cleared Review Diff output carries no independent resolution proof",
  );
});

test("T4 - Evidence identity changes when only head SHA changes", () => {
  const report = emptyReport();
  report.changedFiles = [{ path: "src/temporal.ts", risk: "LOW" }];
  const previousEvidence = buildEvidenceHierarchy(report, null, {
    runId: "run-t4-controlled",
    headSha: HEAD_A,
    createdAt: CREATED_AT,
  });
  const currentEvidence = buildEvidenceHierarchy(structuredClone(report), null, {
    runId: "run-t4-controlled",
    headSha: HEAD_B,
    createdAt: CREATED_AT,
  });

  equal(previousEvidence.records.length, 1, "previous Evidence count");
  equal(currentEvidence.records.length, 1, "current Evidence count");
  equal(previousEvidence.records[0]?.statement, currentEvidence.records[0]?.statement, "Evidence meaning is equivalent");
  notEqual(previousEvidence.records[0]?.evidenceId, currentEvidence.records[0]?.evidenceId, "Evidence ID is head-sensitive");
  notEqual(previousEvidence.records[0]?.fingerprint, currentEvidence.records[0]?.fingerprint, "Evidence fingerprint is head-sensitive");
  notEqual(previousEvidence.evidenceFingerprint, currentEvidence.evidenceFingerprint, "hierarchy fingerprint is head-sensitive");

  const delta = createReadinessDelta(
    runSnapshot(report, { runId: "run-t4-previous", headSha: HEAD_A }),
    runSnapshot(structuredClone(report), { runId: "run-t4-current", headSha: HEAD_B }),
    [],
    CREATED_AT,
  );
  equal(delta.evidenceMovement?.evidenceAdded, 1, "new-head equivalent Evidence is counted as added");
  equal(delta.evidenceMovement?.strongerEvidenceAdded, 1, "new-head directly observed Evidence is counted as stronger added");
  equal(delta.classification, "unchanged", "Evidence counters do not drive readiness classification");
});

test("T5 - proposition continuity is not represented across a new revision", () => {
  const report = emptyReport();
  report.changedFiles = [{ path: "src/proposition.ts", risk: "LOW" }];
  const previous = runSnapshot(report, { runId: "run-t5-previous", headSha: HEAD_A });
  const current = runSnapshot(structuredClone(report), { runId: "run-t5-current", headSha: HEAD_B });
  const delta = createReadinessDelta(previous, current, [], CREATED_AT);
  const reviewDiff = createReviewDiff(previous, current, delta, [], CREATED_AT);
  assert(reviewDiff, "equivalent reports on different heads must produce a Review Diff");

  equal(delta.evidenceMovement?.evidenceAdded, 1, "structured Evidence movement treats the new revision as added");
  equal(reviewDiff.evidence.length, 0, "Report Review Diff has no changed-file Evidence row");
  equal(reviewDiff.findings.length, 0, "no proposition-level finding movement is emitted");
  const evidence = buildEvidenceHierarchy(current.report, null, {
    runId: current.runId,
    headSha: current.headSha,
    createdAt: CREATED_AT,
  }).records[0];
  assert(evidence, "new-revision Evidence exists");
  assert(!("propositionId" in evidence), "Evidence has no proposition continuity identity");
  assert(
    !("addedEvidenceIds" in delta.evidenceMovement!),
    "Evidence movement exposes counts rather than proposition-aware continuity records",
  );
});

test("T6 - contract recheck accepts unrelated eligible Evidence-class presence", () => {
  const previousReport = emptyReport();
  previousReport.conditionsBeforeMerge = ["Prove payment timeout semantics."];
  const currentReport = structuredClone(previousReport);
  currentReport.changedFiles = [{ path: "docs/unrelated-notes.md", risk: "LOW" }];
  const previousEvidence = buildEvidenceHierarchy(previousReport, null, {
    runId: "run-t6-previous",
    headSha: HEAD_A,
    createdAt: CREATED_AT,
  });
  const currentEvidence = buildEvidenceHierarchy(currentReport, null, {
    runId: "run-t6-current",
    headSha: HEAD_A,
    createdAt: CREATED_AT,
  });
  const previousContract = contractFor(previousReport, "run-t6-previous", HEAD_A, previousEvidence);
  const currentContract = contractFor(currentReport, "run-t6-current", HEAD_A, currentEvidence);
  const recheck = buildContractRecheck({
    previousContract,
    currentContract,
    previousEvidenceHierarchy: previousEvidence,
    currentEvidenceHierarchy: currentEvidence,
    triggeredAt: CREATED_AT,
  });
  assert(recheck, "contract recheck must be available");

  const evaluation = evaluationByIndex(recheck.clauseEvaluations, 0);
  const requirement = evaluation.requirementEvaluations[0];
  const unrelatedEvidence = currentEvidence.records.find((record) => record.statement === "docs/unrelated-notes.md");
  assert(requirement && unrelatedEvidence, "requirement and unrelated Evidence must exist");
  equal(currentContract.clauses[0]?.currentSupportingEvidenceIds.length, 0, "clause has no attached supporting Evidence");
  equal(unrelatedEvidence.relatedConditionIds.length, 0, "Evidence has no condition relationship");
  equal(requirement.currentResult, "satisfied", "eligible class presence satisfies the requirement");
  deepEqual(requirement.evidenceOrRecordIds, [unrelatedEvidence.evidenceId], "unrelated eligible Evidence is credited");
  equal(evaluation.evaluationStatus, "newly-satisfied", "open clause is classified newly satisfied");
  equal(recheck.classification, "improved", "class-presence satisfaction drives improved recheck");
});

test("T7 - contract recheck statuses follow clause status and current requirement results", () => {
  const report = emptyReport();
  report.conditionsBeforeMerge = [
    "Verify temporal condition one.",
    "Verify temporal condition two.",
    "Verify temporal condition three.",
    "Verify temporal condition four.",
  ];
  const baseContract = contractFor(report, "run-t7", HEAD_A);
  baseContract.clauses = baseContract.clauses.filter((clause) => clause.type === "change-verification");
  equal(baseContract.clauses.length, 4, "four controlled clauses are available");
  const previousContract = structuredClone(baseContract);
  const currentContract = structuredClone(baseContract);
  const previousStatuses: MergeContractClauseStatus[] = ["open", "open", "satisfied", "satisfied"];
  const currentStatuses: MergeContractClauseStatus[] = ["satisfied", "open", "open", "satisfied"];
  previousContract.clauses.forEach((clause, index) => { clause.status = previousStatuses[index]!; });
  currentContract.clauses.forEach((clause, index) => { clause.status = currentStatuses[index]!; });

  const recheck = buildContractRecheck({
    previousContract,
    currentContract,
    triggeredAt: CREATED_AT,
  });
  assert(recheck, "controlled contracts must recheck");
  deepEqual(
    recheck.clauseEvaluations.map((item) => item.evaluationStatus),
    ["newly-satisfied", "still-open", "reopened", "still-satisfied"],
    "current recheck status vocabulary follows before/after clause satisfaction",
  );
  equal(recheck.classification, "mixed", "simultaneous newly-satisfied and reopened clauses are mixed");
  equal(recheck.clauseEvaluations[1]?.actionRequired, true, "blocking still-open clause requires action");
  equal(recheck.clauseEvaluations[2]?.actionRequired, true, "blocking reopened clause requires action");
});

test("T8 - Readiness Delta collapses distinct suggested-test objects", () => {
  const previousReport = emptyReport();
  previousReport.suggestedTests = [{
    title: "Exercise timeout handling",
    description: "First distinct suggestion.",
    priority: "Recommended",
  }];
  const currentReport = structuredClone(previousReport);
  currentReport.suggestedTests.push({
    title: "Exercise retry handling",
    description: "Second distinct suggestion.",
    priority: "Required",
  });
  const previous = runSnapshot(previousReport, { runId: "run-t8-previous" });
  const current = runSnapshot(currentReport, { runId: "run-t8-current" });
  const delta = createReadinessDelta(previous, current, [], CREATED_AT);
  const reviewDiff = createReviewDiff(previous, current, delta, [], CREATED_AT);
  assert(reviewDiff, "suggested-test reports must produce a Review Diff");

  deepEqual(delta.addedTestOrEvidenceGaps, [], "Readiness Delta does not see the second suggested-test object");
  deepEqual(delta.clearedTestOrEvidenceGaps, [], "Readiness Delta retains the collapsed object identity");
  equal(delta.classification, "unchanged", "collapsed suggestion does not move readiness");
  equal(
    reviewDiff.testGaps.filter((item) => item.status === "added").length,
    1,
    "Review Diff title identity still sees the distinct suggestion",
  );
  equal(
    reviewDiff.testGaps.find((item) => item.title === "Exercise retry handling")?.status,
    "added",
    "the distinct title is added in Review Diff",
  );
});

test("T9 - stale Evidence eligibility depends on requirement type", () => {
  const evidenceReport = emptyReport();
  evidenceReport.changedFiles = [{ path: "src/older-revision.ts", risk: "LOW" }];
  const previousEvidence = buildEvidenceHierarchy(evidenceReport, null, {
    runId: "run-t9-evidence",
    headSha: HEAD_A,
    createdAt: CREATED_AT,
  });
  const currentEvidence = structuredClone(previousEvidence);
  const staleRecord = currentEvidence.records[0];
  assert(staleRecord, "controlled stale Evidence record must exist");
  equal(staleRecord.headSha, HEAD_A, "Evidence remains tied to the older head");
  equal(staleRecord.stale, false, "older-head Evidence is not automatically marked stale");
  staleRecord.stale = true;
  staleRecord.status = "stale";

  const contractReport = emptyReport();
  contractReport.conditionsBeforeMerge = [
    "Verify stale class handling.",
    "Verify stale reference handling.",
  ];
  const baseContract = contractFor(contractReport, "run-t9-contract", HEAD_B);
  baseContract.clauses[0]!.requirements[0]!.type = "evidence-class-present";
  baseContract.clauses[0]!.requirements[0]!.acceptedEvidenceClasses = ["directly-observed"];
  baseContract.clauses[1]!.requirements[0]!.type = "evidence-reference-satisfied";
  baseContract.clauses[1]!.requirements[0]!.referencedIds = [staleRecord.evidenceId];
  const previousContract = structuredClone(baseContract);
  const currentContract = structuredClone(baseContract);

  const recheck = buildContractRecheck({
    previousContract,
    currentContract,
    previousEvidenceHierarchy: previousEvidence,
    currentEvidenceHierarchy: currentEvidence,
    triggeredAt: CREATED_AT,
  });
  assert(recheck, "stale Evidence contract recheck must be available");
  const classEvaluation = evaluationByIndex(recheck.clauseEvaluations, 0);
  const referenceEvaluation = evaluationByIndex(recheck.clauseEvaluations, 1);
  equal(currentEvidence.records.includes(staleRecord), true, "stale Evidence remains visible");
  equal(classEvaluation.requirementEvaluations[0]?.currentResult, "missing", "stale Evidence is ineligible for class presence");
  equal(classEvaluation.evaluationStatus, "still-open", "class requirement remains open");
  equal(referenceEvaluation.requirementEvaluations[0]?.currentResult, "satisfied", "stale Evidence remains eligible by reference");
  equal(referenceEvaluation.evaluationStatus, "newly-satisfied", "stale referenced Evidence can satisfy a clause");
  equal(recheck.evidenceChanges.evidenceBecameStale, 1, "recheck counts the explicit stale flag");
  equal(recheck.evidenceChanges.currentEvidenceNoLongerApplies, 1, "recheck counts stale semantic continuity");

  const readiness = createReadinessDelta(
    runSnapshot(evidenceReport, { runId: "run-t9-previous", headSha: HEAD_A }),
    runSnapshot(structuredClone(evidenceReport), { runId: "run-t9-current", headSha: HEAD_B }),
    [],
    CREATED_AT,
  );
  equal(readiness.evidenceMovement?.evidenceBecameStale, 0, "Readiness Delta rebuild does not infer staleness from head change");
  equal(readiness.evidenceMovement?.evidenceAdded, 1, "Readiness Delta instead sees new head-sensitive Evidence identity");
});

test("T10 - current temporal outputs are not a Verification Delta", () => {
  const report = emptyReport();
  const previous = runSnapshot(structuredClone(report), { runId: "run-t10-previous" });
  const current = runSnapshot(structuredClone(report), { runId: "run-t10-current" });
  const delta = createReadinessDelta(previous, current, [], CREATED_AT);
  const reviewDiff = createReviewDiff(previous, current, delta, [], CREATED_AT);
  const recheck = buildContractRecheck({
    previousContract: contractFor(previous.report, previous.runId),
    currentContract: contractFor(current.report, current.runId),
    triggeredAt: CREATED_AT,
  });
  assert(reviewDiff && recheck, "current temporal outputs must be constructible");

  for (const field of ["established", "unresolved", "contradicted", "conflicting", "judgementDependent"]) {
    assert(!(field in delta), `Readiness Delta excludes future semantic field ${field}`);
    assert(!(field in reviewDiff), `Review Diff excludes future semantic field ${field}`);
    assert(!(field in recheck), `contract recheck excludes future semantic field ${field}`);
  }

  const relevantProductionSources = [
    "readiness-delta.ts",
    "contract-recheck.ts",
    "evidence-hierarchy.ts",
    join("r6j", "comparison-context.ts"),
    join("workspace-v2", "real-adapter.ts"),
  ].map((path) => readFileSync(join(process.cwd(), "lib", path), "utf8"));
  assert(
    relevantProductionSources.every((source) => !/\bVerificationDelta\b/.test(source)),
    "relevant tracked temporal production source defines no VerificationDelta symbol",
  );
  assert("classification" in delta && "findings" in reviewDiff && "clauseEvaluations" in recheck, "current outputs retain their separate concepts");
});

let passed = 0;
for (const item of tests) {
  try {
    item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`BS0 temporal validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`BS0 temporal validation: ${passed}/${tests.length} passed\n`);
