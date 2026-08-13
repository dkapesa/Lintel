import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import type {
  CaseDetail,
  RunView,
  WorkspaceReadySnapshot,
  WorkspaceSnapshot,
} from "../../workspace-v2/view-model";
import {
  R6D_BOUND_ACTION_IDS,
} from "../../r6d/controller-contract";
import {
  REVIEW_MODES,
  conservativeReviewIdentityProvider,
  createInitialWorkstationState,
  dispatchAction,
  formatRoute,
  indexReviews,
  reviewIdFromOpaqueToken,
  type ReviewId,
  type WorkstationState,
} from "../../r6c/index";
import { WORKSTATION_BOUND_ACTION_IDS } from "../../r6e/action-registry";
import {
  projectAnalysisBasis,
  projectHumanDecision,
  projectRecommendation,
  projectReviewModeLinks,
  projectSelectedReview,
  projectVerificationStanding,
} from "../index";

type Test = { name: string; run: () => void };
const tests: Test[] = [];
function test(name: string, run: () => void): void { tests.push({ name, run }); }
function fail(message: string): never { throw new Error(message); }
function assert(value: unknown, message: string): asserts value { if (!value) fail(message); }
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) fail(`${message}: expected ${String(expected)}, received ${String(actual)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) fail(`${message}: expected ${right}, received ${left}`);
}

const fixture = buildFixtureSnapshot("default");
assert(fixture.status === "ready", "ready fixture required");
const readyFixture: WorkspaceReadySnapshot = fixture;
const baseCase = fixture.cases.find((item) => item.caseId === fixture.defaultCaseId) ?? fixture.cases[0];
assert(baseCase, "fixture case required");
const readyCase = fixture.cases.find((item) => item.decision.status === "recorded" && item.decision.applicability === "applicable");
assert(readyCase, "recorded fixture case required");
const recordedDecision = readyCase.decision;
assert(recordedDecision.status === "recorded", "recorded decision required");

function cloneCase(source: CaseDetail, changes: Partial<CaseDetail> = {}): CaseDetail {
  return { ...(structuredClone(source) as CaseDetail), ...changes };
}

function readyWith(cases: readonly CaseDetail[]): WorkspaceReadySnapshot {
  return { ...readyFixture, cases: [...cases], defaultCaseId: cases[0]?.caseId ?? readyFixture.defaultCaseId };
}

function selectedState(detail: CaseDetail, mode: WorkstationState["mode"] = "overview"): { state: WorkstationState; reviewId: ReviewId } {
  const reviewId = conservativeReviewIdentityProvider.reviewIdFor(detail);
  return {
    reviewId,
    state: {
      ...createInitialWorkstationState(),
      routePath: formatRoute({ destination: "reviews", reviewId, mode }),
      selectedReview: { status: "available", reviewId, currentCaseId: detail.caseId },
      mode,
      lastKnownCaseId: detail.caseId,
    },
  };
}

function project(detail: CaseDetail, mode: WorkstationState["mode"] = "overview") {
  const snapshot = readyWith([detail]);
  const selection = selectedState(detail, mode);
  return projectSelectedReview(selection.state, snapshot, indexReviews(snapshot.cases));
}

test("five selected Review states remain distinct", () => {
  const none = projectSelectedReview(createInitialWorkstationState(), readyFixture, indexReviews(readyFixture.cases));
  equal(none.status, "none", "none");

  const selection = selectedState(baseCase);
  const loading: WorkspaceSnapshot = { status: "loading", identity: readyFixture.identity, provenance: { ...readyFixture.provenance, scenario: "loading" } };
  equal(projectSelectedReview(selection.state, loading, indexReviews([])).status, "resolving", "resolving");

  const unavailable: WorkspaceSnapshot = {
    status: "unavailable",
    identity: readyFixture.identity,
    provenance: { ...readyFixture.provenance, scenario: "unavailable" },
    reason: "Stored reports could not be projected.",
  };
  const store = projectSelectedReview(selection.state, unavailable, indexReviews([]));
  equal(store.status, "store-unavailable", "store unavailable");

  const staleReviewId = reviewIdFromOpaqueToken("stale-review");
  const staleState: WorkstationState = {
    ...selection.state,
    selectedReview: { status: "unavailable", reviewId: staleReviewId },
    routePath: formatRoute({ destination: "reviews", reviewId: staleReviewId, mode: "overview" }),
  };
  equal(projectSelectedReview(staleState, readyFixture, indexReviews(readyFixture.cases)).status, "review-unavailable", "review unavailable");
  equal(project(baseCase).status, "ready", "ready");
});

test("current Case resolves only through the frozen Review index", () => {
  const selection = selectedState(baseCase);
  const poisoned: WorkstationState = {
    ...selection.state,
    selectedReview: { ...selection.state.selectedReview, currentCaseId: "not-the-current-case" },
  } as WorkstationState;
  const result = projectSelectedReview(poisoned, readyFixture, indexReviews(readyFixture.cases));
  assert(result.status === "ready", "resolver returns ready");
  equal(result.identity.title, "Add fallback handling for failed discount-code retrieval", "resolved title");
});

test("Queue filtering and presentation cannot alter selected Workspace projection", () => {
  const selection = selectedState(baseCase);
  const compact: WorkstationState = { ...selection.state, queue: { manualPreference: "compact" }, narrowSurface: "queue" };
  const expanded: WorkstationState = { ...selection.state, queue: { manualPreference: "expanded" }, narrowSurface: "workspace" };
  const index = indexReviews(readyFixture.cases);
  const left = projectSelectedReview(compact, readyFixture, index);
  const right = projectSelectedReview(expanded, readyFixture, index);
  assert(left.status === "ready" && right.status === "ready", "both projections ready");
  deepEqual(left.identity, right.identity, "identity independent of Queue");
  deepEqual(left.overview, right.overview, "Overview independent of Queue");
});

test("recommendation is attributed and separate from Human Decision", () => {
  const recommendation = projectRecommendation(baseCase);
  assert(recommendation.statement.startsWith("Lintel recommends "), "attributed recommendation");
  assert(!JSON.stringify(recommendation).includes("Human Decision"), "recommendation excludes Human Decision");
  const decision = projectHumanDecision(readyCase);
  assert(!JSON.stringify(decision).includes("recommendation"), "Human Decision excludes recommendation");
  assert(!JSON.stringify(decision).includes(readyCase.executiveSummary), "Human Decision excludes recommendation summary");
});

test("Human Decision discriminants preserve unavailable, empty, recorded, applicability and reaffirmation", () => {
  const unavailable = projectHumanDecision(cloneCase(baseCase, {
    decision: { status: "unavailable", readError: "internal detail", isSample: false },
  }));
  equal(unavailable.statement, "Human Decision unavailable.", "unavailable copy");
  assert(!JSON.stringify(unavailable).includes("internal detail"), "read error withheld");

  const pending = projectHumanDecision(baseCase);
  equal(pending.status, "pending", "empty maps to pending");
  const reaffirmationCase = fixture.cases.find((item) => item.decision.status === "recorded" && item.decision.needsReaffirmation);
  assert(reaffirmationCase, "reaffirmation fixture required");
  const recorded = projectHumanDecision(reaffirmationCase);
  equal(recorded.status, "recorded", "recorded remains recorded");
  assert(recorded.details.some((item) => item.includes("Predates current head")), "applicability label");
  assert(recorded.details.some((item) => item.includes("Reaffirmation")), "reaffirmation label");

  const withdrawn = projectHumanDecision(cloneCase(readyCase, {
    decision: { ...recordedDecision, applicability: "withdrawn", withdrawn: true },
  }));
  assert(withdrawn.statement.startsWith("Human Decision withdrawn:"), "withdrawn derived from discriminant");
});

test("mode links exactly match the five canonical modes and routes", () => {
  const { reviewId } = selectedState(baseCase);
  const links = projectReviewModeLinks(reviewId, "evidence");
  deepEqual(links.map((item) => item.mode), REVIEW_MODES, "canonical mode order");
  equal(links.length, 5, "exactly five links");
  for (const link of links) {
    equal(link.href, formatRoute({ destination: "reviews", reviewId, mode: link.mode }), `${link.mode} route`);
  }
  equal(links.filter((item) => item.current).length, 1, "one current mode");
});

test("mode activation and Review selection retain frozen R6C semantics", () => {
  const { state, reviewId } = selectedState(baseCase);
  const context = { reviewIndex: indexReviews(readyFixture.cases), cases: readyFixture.cases };
  const evidence = baseCase.evidence[0];
  assert(evidence, "evidence context required");
  const contextual: WorkstationState = {
    ...state,
    primarySelection: { kind: "evidence", id: evidence.evidenceId },
  };
  const different = dispatchAction(contextual, { id: "mode/activate", mode: "history" }, context, { source: "visible-ui" });
  equal(different.status, "applied", "different mode applies");
  equal(different.routeEffect.kind, "push", "different mode pushes");
  deepEqual(different.state.primarySelection, contextual.primarySelection, "contextual selection preserved");
  const same = dispatchAction(state, { id: "mode/activate", mode: "overview" }, context, { source: "visible-ui" });
  equal(same.status, "noop", "same mode noops");
  equal(same.routeEffect.kind, "none", "same mode has no route effect");
  const reselect = dispatchAction(state, { id: "review/select", reviewId }, context, { source: "visible-ui" });
  equal(reselect.status, "noop", "same Review reselect noops");
  equal(reselect.routeEffect.kind, "none", "same Review does not push");
  const stale = dispatchAction(state, { id: "review/select", reviewId: reviewIdFromOpaqueToken("stale") }, context, { source: "visible-ui" });
  equal(stale.status, "unavailable", "stale Review unavailable");
  deepEqual(stale.state, state, "stale Review does not mutate");
  equal(stale.routeEffect.kind, "none", "stale Review has no route effect");
  const unavailableMode = dispatchAction(
    { ...state, selectedReview: { status: "unavailable", reviewId } },
    { id: "mode/activate", mode: "change" },
    context,
    { source: "visible-ui" },
  );
  equal(unavailableMode.status, "unavailable", "mode unavailable without available Review");
  equal(unavailableMode.routeEffect.kind, "none", "unavailable mode has no route effect");
});

test("next step follows blocking, missing, stale and severe precedence", () => {
  const blocking = project(baseCase);
  assert(blocking.status === "ready", "blocking projection ready");
  equal(blocking.overview.nextStep.target?.mode, "requirements", "blocking first");

  const noBlocking = cloneCase(baseCase, { requirements: [] });
  const missing = project(noBlocking);
  assert(missing.status === "ready", "missing projection ready");
  equal(missing.overview.nextStep.target?.mode, "evidence", "missing proof second");

  const staleOnly = cloneCase(noBlocking, {
    evidence: noBlocking.evidence.map((item) => ({ ...item, status: "present", stale: item === noBlocking.evidence[0] })),
  });
  const stale = project(staleOnly);
  assert(stale.status === "ready", "stale projection ready");
  equal(stale.overview.nextStep.target?.mode, "evidence", "stale evidence third");

  const severeOnly = cloneCase(staleOnly, { evidence: [], findings: baseCase.findings });
  const severe = project(severeOnly);
  assert(severe.status === "ready", "severe projection ready");
  equal(severe.overview.nextStep.target?.mode, "change", "severe finding fourth");
  assert(severe.overview.nextStep.statement.includes("recorded"), "severe wording is source-proven");
  assert(!severe.overview.nextStep.statement.includes("unresolved"), "no invented lifecycle state");
});

test("complete verification distinguishes pending and recorded decisions", () => {
  const completePending = cloneCase(baseCase, { requirements: [], evidence: [], findings: [] });
  const pending = project(completePending);
  assert(pending.status === "ready", "pending complete ready");
  equal(pending.overview.nextStep.statement, "Verification is complete. Human Decision remains pending.", "complete pending");
  equal(pending.overview.nextStep.target, null, "pending does not route to workflow");

  const completeRecorded = cloneCase(completePending, { decision: recordedDecision });
  const recorded = project(completeRecorded);
  assert(recorded.status === "ready", "recorded complete ready");
  equal(recorded.overview.nextStep.statement, "Verification is complete and a current Human Decision is recorded.", "complete recorded");
  equal(recorded.overview.nextStep.target, null, "recorded does not route");
});

test("Overview omits risk score and R6G-plus record detail", () => {
  const result = project(baseCase);
  assert(result.status === "ready", "Overview ready");
  const serialised = JSON.stringify(result.overview);
  for (const forbidden of ["riskScore", "findingId", "evidenceId", "requirementId", "file path", "rationale", "fingerprint", "runId", "caseId"]) {
    assert(!serialised.includes(forbidden), `Overview excludes ${forbidden}`);
  }
  const source = [
    "recommendation.ts",
    "human-decision-orientation.ts",
    "verification-standing.ts",
    "selected-review.ts",
  ].map((file) => readFileSync(join(process.cwd(), "lib", "r6f", file), "utf8")).join("\n");
  assert(!source.includes("riskScore"), "source does not consume riskScore");
  assert(!source.includes("nextAction("), "legacy nextAction helper unused");
  assert(!source.includes("useState("), "no second selected Review state");
});

test("github.updatedAt remains opaque and absent run/head values are omitted", () => {
  const opaque = "Yesterday, 17:04 / not chronology";
  const detail = cloneCase(baseCase, {
    github: { ...baseCase.github, updatedAt: opaque, headSha: null },
    run: null,
  });
  const result = project(detail);
  assert(result.status === "ready", "opaque projection ready");
  assert(result.identity.context.includes(`Updated ${opaque}`), "foundation uses opaque updatedAt verbatim");
  const basis = projectAnalysisBasis(detail);
  deepEqual(basis.items, [{ label: "Updated", value: opaque }], "analysis uses opaque updatedAt verbatim");
  assert(!JSON.stringify(basis).includes("unknown"), "missing run/head not fabricated");
});

test("run chronology is formatted only when parseable and source/head are bounded", () => {
  const run: RunView = {
    runId: "not-rendered",
    headSha: "123456789abcdef",
    baseSha: "not-rendered",
    createdAt: "2026-08-11T10:42:00.000Z",
    completedAt: null,
    analysisSource: "deterministic",
    sourceType: "github-app",
    provider: null,
    model: null,
    reproducibility: "traceable",
    reproducibilityLimitation: "Stored input can be traced but not fully replayed.",
    inputFingerprint: "not-rendered",
    configurationFingerprint: "not-rendered",
    resultFingerprint: "not-rendered",
    generatorVersion: "not-rendered",
    deterministicRulesetVersion: "not-rendered",
    reportSchemaVersion: "not-rendered",
  };
  const basis = projectAnalysisBasis(cloneCase(baseCase, { run }));
  assert(basis.items.some((item) => item.label === "Analysed"), "parseable chronology formatted");
  assert(basis.items.some((item) => item.label === "Head" && item.value === "1234567"), "head bounded to seven chars");
  assert(basis.items.some((item) => item.label === "Source" && item.value === "GitHub App"), "safe source label");
  const serialised = JSON.stringify(basis);
  assert(!serialised.includes(run.runId) && !serialised.includes(run.baseSha!), "run/base ids withheld");
});

test("verification standing uses canonical projections and bounded labels", () => {
  const standing = projectVerificationStanding(baseCase);
  equal(standing.blockingRequirements, 2, "canonical blocking count");
  assert(standing.items.length <= 6, "at most six dl rows");
  assert(standing.items.some((item) => item.label === "Risk level" && item.value === baseCase.riskLevel), "canonical risk level");
  assert(!JSON.stringify(standing).includes(String(baseCase.riskScore)), "risk score withheld");
});

test("production registry is eleven while the R6D historical registry remains four", () => {
  deepEqual(WORKSTATION_BOUND_ACTION_IDS, [
    "route/navigate",
    "route/apply",
    "queue/set-manual-preference",
    "queue/show-narrow-surface",
    "review/select",
    "mode/activate",
    "selection/set",
    "inspector/open",
    "inspector/close",
    "inspector/traverse-relationship",
    "history/set-comparison",
  ], "current eleven");
  deepEqual(R6D_BOUND_ACTION_IDS, [
    "route/navigate",
    "route/apply",
    "queue/set-manual-preference",
    "queue/show-narrow-surface",
  ], "historical four");
});

let passed = 0;
for (const item of tests) {
  try { item.run(); passed += 1; }
  catch (error) {
    process.stderr.write(`R6F validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`R6F validation: ${passed}/${tests.length} passed\n`);
