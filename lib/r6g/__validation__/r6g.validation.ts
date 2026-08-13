import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import type {
  CaseDetail,
  EvidenceClass,
  EvidenceStatus,
  EvidenceView,
  RelationshipState,
  WorkspaceReadySnapshot,
} from "../../workspace-v2/view-model";
import {
  conservativeReviewIdentityProvider,
  createInitialWorkstationState,
  dispatchAction,
  effectiveLayout,
  formatRoute,
  indexReviews,
  reconcile,
  type ContextRef,
  type ReviewId,
  type WorkstationState,
} from "../../r6c/index";
import { R6D_BOUND_ACTION_IDS } from "../../r6d/controller-contract";
import { R6D_LAYOUT_POLICY } from "../../r6d/layout-policy";
import { WORKSTATION_BOUND_ACTION_IDS } from "../../r6e/action-registry";
import {
  EVIDENCE_CLASS_LABELS,
  EVIDENCE_GROUPS,
  EVIDENCE_STATUS_LABELS,
  evidenceStatusLabel,
  effectiveNarrowSurfaceForInspector,
  inspectorIsActive,
  projectEvidenceContext,
  projectEvidenceRegister,
  projectEvidenceRegisterFromCase,
  projectRelationship,
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
const baseEvidence = baseCase.evidence[0];
assert(baseEvidence, "fixture Evidence required");

function cloneCase(source: CaseDetail, changes: Partial<CaseDetail> = {}): CaseDetail {
  return { ...(structuredClone(source) as CaseDetail), ...changes };
}

function evidence(index: number, changes: Partial<EvidenceView> = {}): EvidenceView {
  return {
    ...(structuredClone(baseEvidence) as EvidenceView),
    evidenceId: `evidence-validation-${index}`,
    title: `Evidence ${index}`,
    statement: `Statement ${index}`,
    observedAt: `20${String(index % 25).padStart(2, "0")}-01-01T00:00:00.000Z`,
    ...changes,
  };
}

function readyWith(cases: readonly CaseDetail[]): WorkspaceReadySnapshot {
  return { ...readyFixture, cases: [...cases], defaultCaseId: cases[0]?.caseId ?? readyFixture.defaultCaseId };
}

function selectedState(detail: CaseDetail, mode: WorkstationState["mode"] = "evidence"):
  { state: WorkstationState; reviewId: ReviewId } {
  const reviewId = conservativeReviewIdentityProvider.reviewIdFor(detail);
  return {
    reviewId,
    state: {
      ...createInitialWorkstationState(),
      routePath: formatRoute({ destination: "reviews", reviewId, mode }),
      selectedReview: { status: "available", reviewId, currentCaseId: detail.caseId },
      mode,
      lastKnownCaseId: detail.caseId,
      narrowSurface: "workspace",
    },
  };
}

function actionContext(detail: CaseDetail) {
  const cases = [detail];
  return { reviewIndex: indexReviews(cases), cases };
}

function visibleRow(row: ReturnType<typeof projectEvidenceRegisterFromCase>["groups"][number]["rows"][number]) {
  return {
    title: row.title,
    statement: row.statement,
    statusLabel: row.statusLabel,
    evidenceClassLabel: row.evidenceClassLabel,
    source: row.source,
  };
}

test("current Review resolution, zero, singular, duplicates, long content and 120-record scale", () => {
  const reviewId = "shared-review" as ReviewId;
  const current = cloneCase(baseCase, {
    caseId: "current-case",
    evidence: [evidence(1, { title: "Current evidence" })],
  });
  const historical = cloneCase(baseCase, {
    caseId: "historical-case",
    evidence: [evidence(2, { title: "Historical evidence" })],
  });
  const provider = { reviewIdFor: () => reviewId };
  const cases = [current, historical];
  const resolved = projectEvidenceRegister(indexReviews(cases, provider), reviewId, cases);
  assert(resolved.status === "ready", "current register ready");
  equal(resolved.groups[0]?.rows[0]?.title, "Current evidence", "current Case only");

  const zero = projectEvidenceRegisterFromCase(cloneCase(baseCase, { evidence: [] }));
  equal(zero.recordCount, 0, "zero Evidence");
  equal(zero.groups.length, 0, "zero groups omitted");
  const singular = projectEvidenceRegisterFromCase(cloneCase(baseCase, { evidence: [evidence(3)] }));
  equal(singular.recordCount, 1, "singular Evidence");

  const duplicate = projectEvidenceRegisterFromCase(cloneCase(baseCase, {
    evidence: [evidence(4), evidence(5, { evidenceId: "evidence-validation-4" })],
  }));
  equal(duplicate.recordCount, 1, "duplicate identity does not create ambiguous row");
  equal(duplicate.excludedDuplicateIdentityCount, 1, "duplicate identity recorded internally");

  const long = "x".repeat(240);
  const dense = Array.from({ length: 120 }, (_, index) => evidence(index + 10, {
    statement: index === 0 ? long : `Scale statement ${index}`,
  }));
  const scale = projectEvidenceRegisterFromCase(cloneCase(baseCase, { evidence: dense }));
  equal(scale.recordCount, 120, "120 records project");
  equal(scale.groups.flatMap((group) => group.rows)[0]?.statement, long, "long content preserved");
});

test("all canonical status and Evidence-class labels are exhaustive and observedAt stays omitted", () => {
  const statuses: EvidenceStatus[] = ["present", "missing", "unverified", "confirmed", "stale", "not-applicable"];
  deepEqual(statuses.map((status) => EVIDENCE_STATUS_LABELS[status]), [
    "Present", "Missing", "Unverified", "Confirmed", "Stale", "Not applicable",
  ], "six status labels");
  const classes: EvidenceClass[] = [
    "externally-verified", "directly-observed", "human-confirmed", "builder-declared",
    "model-inferred", "assumption", "unknown",
  ];
  deepEqual(classes.map((value) => EVIDENCE_CLASS_LABELS[value]), [
    "Externally verified", "Directly observed", "Human confirmed", "Builder declared",
    "Model inferred", "Assumption", "Unknown",
  ], "seven class labels");

  const secretId = "opaque-evidence-secret";
  const observedAt = "2099-12-31T23:59:59.000Z";
  const detail = cloneCase(baseCase, { evidence: [evidence(20, { evidenceId: secretId, observedAt })] });
  const register = projectEvidenceRegisterFromCase(detail);
  const row = register.groups[0]?.rows[0];
  assert(row, "row required");
  const inspector = projectEvidenceContext(detail, row.context);
  assert(inspector.status === "ready", "Inspector projection ready");
  const presentation = JSON.stringify({ row: visibleRow(row), inspector });
  assert(!presentation.includes(secretId), "opaque id excluded from presentation");
  assert(!presentation.includes(observedAt) && !presentation.includes("Observed"), "observedAt omitted");
  assert(!presentation.includes("Strength"), "Evidence class is never labelled Strength");
});

test("four first-match groups and source order are exact with no chronology sort", () => {
  const records = [
    evidence(1, { status: "confirmed", observedAt: "2100-01-01T00:00:00Z" }),
    evidence(2, { status: "missing", stale: true, observedAt: "1900-01-01T00:00:00Z" }),
    evidence(3, { status: "stale", stale: false }),
    evidence(4, { status: "not-applicable", stale: false }),
    evidence(5, { status: "unverified", stale: false }),
    evidence(6, { status: "present", stale: true }),
    evidence(7, { status: "present", stale: false, observedAt: "1800-01-01T00:00:00Z" }),
  ];
  const projected = projectEvidenceRegisterFromCase(cloneCase(baseCase, { evidence: records }));
  deepEqual(projected.groups.map((group) => group.label), EVIDENCE_GROUPS.map((group) => group.label), "fixed group order");
  deepEqual(projected.groups.map((group) => group.rows.map((row) => row.sourceIndex)), [
    [1, 4], [2, 5], [0, 6], [3],
  ], "first-match predicates and canonical order");
  equal(projected.groups[0]?.rows[0]?.statusLabel, "Missing · stale", "missing plus stale presentation");
  equal(evidenceStatusLabel("stale", true), "Stale", "stale is not duplicated");
});

test("selection is local, route-free, reselect-safe and never moves an open Inspector", () => {
  const a = evidence(30);
  const b = evidence(31);
  const detail = cloneCase(baseCase, { evidence: [a, b] });
  const selected = selectedState(detail);
  const context = actionContext(detail);
  const refA: ContextRef = { kind: "evidence", id: a.evidenceId };
  const refB: ContextRef = { kind: "evidence", id: b.evidenceId };
  const chosenA = dispatchAction(selected.state, { id: "selection/set", context: refA }, context, { source: "visible-ui" });
  equal(chosenA.status, "applied", "selection applies");
  equal(chosenA.routeEffect.kind, "none", "selection route effect none");
  equal(chosenA.state.routePath, selected.state.routePath, "history path unchanged");
  equal(chosenA.state.inspector.open, false, "selection does not open Inspector");
  equal(dispatchAction(chosenA.state, { id: "selection/set", context: refA }, context, { source: "visible-ui" }).status, "noop", "reselect noop");
  equal(dispatchAction(chosenA.state, { id: "selection/set", context: { kind: "evidence", id: "stale" } }, context, { source: "visible-ui" }).status, "unavailable", "stale selection unavailable");

  const openedA = dispatchAction(chosenA.state, { id: "inspector/open", context: refA }, context, { source: "visible-ui" });
  const chosenB = dispatchAction(openedA.state, { id: "selection/set", context: refB }, context, { source: "visible-ui" });
  deepEqual(chosenB.state.primarySelection, refB, "B selected");
  deepEqual(chosenB.state.inspector.context, refA, "Inspector remains on A");
  equal(chosenB.routeEffect.kind, "none", "no object route mutation");
});

test("explicit Inspector open, same-context focus semantics, replacement and close are exact", () => {
  const a = evidence(40);
  const b = evidence(41);
  const detail = cloneCase(baseCase, { evidence: [a, b] });
  const selected = selectedState(detail);
  const context = actionContext(detail);
  const refA: ContextRef = { kind: "evidence", id: a.evidenceId };
  const refB: ContextRef = { kind: "evidence", id: b.evidenceId };
  const originA = { handle: "origin-a", region: "workspacePrimary" as const, scope: { destination: "reviews" as const, reviewId: selected.reviewId } };
  const withSelection = dispatchAction(selected.state, { id: "selection/set", context: refA }, context, { source: "visible-ui" }).state;
  const opened = dispatchAction(withSelection, { id: "inspector/open", context: refA, origin: originA }, context, { source: "visible-ui" });
  equal(opened.status, "applied", "Inspector opens");
  deepEqual(opened.state.inspector.context, refA, "exact context");
  equal(opened.focusEffect.kind, "region", "open focus effect");
  equal(opened.state.inspector.relationshipTrail.length, 0, "trail empty");
  equal(dispatchAction(opened.state, { id: "inspector/open", context: refA }, context, { source: "visible-ui" }).status, "noop", "same context open noop");

  const originB = { ...originA, handle: "origin-b" };
  const replaced = dispatchAction(opened.state, { id: "inspector/open", context: refB, origin: originB }, context, { source: "visible-ui" });
  deepEqual(replaced.state.inspector.context, refB, "explicit B open replaces in place");
  equal(replaced.state.inspector.relationshipTrail.length, 0, "replacement adds no trail");
  equal(replaced.state.inspector.focusOrigin?.handle, "origin-b", "new explicit origin recorded");
  const closed = dispatchAction(replaced.state, { id: "inspector/close" }, context, { source: "visible-ui" });
  deepEqual(closed.state.primarySelection, refA, "close preserves primary selection");
  equal(closed.state.inspector.open, false, "close closes");
  equal(closed.state.inspector.context, null, "close clears context");
  equal(closed.state.inspector.focusOrigin, null, "close clears origin");
});

test("mode and same-Review browser navigation preserve local context; Review switch clears it", () => {
  const record = evidence(50);
  const detail = cloneCase(baseCase, { evidence: [record] });
  const ref: ContextRef = { kind: "evidence", id: record.evidenceId };
  const selected = selectedState(detail);
  const context = actionContext(detail);
  const chosen = dispatchAction(selected.state, { id: "selection/set", context: ref }, context, { source: "visible-ui" }).state;
  const opened = dispatchAction(chosen, { id: "inspector/open", context: ref }, context, { source: "visible-ui" }).state;
  const overview = dispatchAction(opened, { id: "mode/activate", mode: "overview" }, context, { source: "visible-ui" }).state;
  deepEqual(overview.primarySelection, ref, "mode switch preserves selection");
  deepEqual(overview.inspector.context, ref, "mode switch preserves Inspector");
  const back = dispatchAction(overview, {
    id: "route/apply",
    intent: { destination: "reviews", reviewId: selected.reviewId, mode: "evidence" },
  }, context, { source: "browser" }).state;
  deepEqual(back.primarySelection, ref, "same-Review Back/Forward preserves selection");
  deepEqual(back.inspector.context, ref, "same-Review Back/Forward preserves Inspector");

  const second = cloneCase(baseCase, { caseId: "second-review-case", evidence: [evidence(51)] });
  const cases = [detail, second];
  const switched = dispatchAction(back, {
    id: "review/select",
    reviewId: conservativeReviewIdentityProvider.reviewIdFor(second),
  }, { reviewIndex: indexReviews(cases), cases }, { source: "visible-ui" }).state;
  equal(switched.primarySelection, null, "Review switch clears selection");
  equal(switched.inspector.open, false, "Review switch closes Inspector");
});

test("valid refresh restoration survives and invalid refs are discarded without replacement", () => {
  const record = evidence(60);
  const detail = cloneCase(baseCase, { evidence: [record] });
  const ref: ContextRef = { kind: "evidence", id: record.evidenceId };
  const selected = selectedState(detail);
  const context = actionContext(detail);
  const chosen = dispatchAction(selected.state, { id: "selection/set", context: ref }, context, { source: "visible-ui" }).state;
  const opened = dispatchAction(chosen, { id: "inspector/open", context: ref }, context, { source: "visible-ui" }).state;
  const options = {
    capturedAt: "2026-01-01T00:00:00.000Z",
    decisionSubjectResolver: () => ({ status: "unavailable" as const, reason: "not needed" }),
  };
  const valid = reconcile(opened, readyWith([detail]), options).state;
  deepEqual(valid.primarySelection, ref, "valid selection restored");
  deepEqual(valid.inspector.context, ref, "valid Inspector restored");

  const refreshed = cloneCase(detail, { evidence: [] });
  const invalid = reconcile(opened, readyWith([refreshed]), options).state;
  equal(invalid.primarySelection, null, "invalid selection discarded");
  equal(invalid.inspector.context, null, "invalid Inspector context cleared");
  deepEqual(invalid.inspector.unavailableContext, ref, "invalid context retained only as opaque unavailable ref");
  equal(projectEvidenceContext(refreshed, invalid.inspector.context).status, "unavailable", "no replacement selected");
});

test("all RelationshipState variants retain user-facing non-disclosure while carrying exact targets internally", () => {
  const linked: RelationshipState = {
    status: "linked",
    related: [{ kind: "finding", id: "raw-finding-id", label: "Finding label", detail: "HIGH" }],
    unresolved: ["raw-unresolved-id"],
  };
  const none: RelationshipState = { status: "none" };
  const unavailable: RelationshipState = { status: "unavailable", reason: "Requirement linkage is not derivable from this report version." };
  const unresolved: RelationshipState = { status: "unresolved", unresolved: ["raw-a", "raw-b"] };
  const projected = [linked, none, unavailable, unresolved].map(projectRelationship);
  deepEqual(projected.map((item) => item.status), ["linked", "none", "unavailable", "unresolved"], "four relationship states");
  const text = JSON.stringify(projected.map((item) => item.status === "linked"
    ? { status: item.status, items: item.items.map(({ label, detail }) => ({ label, detail })), unresolvedCount: item.unresolvedCount }
    : item));
  assert(text.includes("Finding label") && text.includes("HIGH"), "safe labels and details retained");
  assert(!text.includes("raw-finding-id") && !text.includes("raw-unresolved-id") && !text.includes("raw-a"), "raw ids omitted");
  const linkedPresentation = projected[0];
  assert(linkedPresentation.status === "linked", "linked presentation required");
  equal(linkedPresentation.items[0]?.target.id, "raw-finding-id", "target retains exact internal identity");
  assert(!text.includes("href") && !text.includes("context"), "presentation has no route object");

  const detail = cloneCase(baseCase, {
    evidence: [evidence(61, { supportsFindings: linked, supportsRequirements: unavailable, relatedChanges: unresolved })],
  });
  const inspector = projectEvidenceContext(detail, { kind: "evidence", id: detail.evidence[0].evidenceId });
  const inspectorText = JSON.stringify(inspector);
  assert(!/clause text|diff|history|human decision/i.test(inspectorText), "later-milestone substance absent");
});

test("effective Inspector activity gates renderability and layout pressure", () => {
  equal(inspectorIsActive(true, false), false, "hidden when Review not ready");
  equal(inspectorIsActive(false, true), false, "closed when state closed");
  equal(inspectorIsActive(true, true), true, "active only when open and ready");
  const hidden = effectiveLayout({
    band: "compact", policy: R6D_LAYOUT_POLICY, manualPreference: "expanded",
    focusActive: false, inspectorOpen: inspectorIsActive(true, false), narrowSurface: "workspace",
  });
  equal(hidden.queue.kind, "expanded", "hidden Inspector creates no Queue yield");
  const active = effectiveLayout({
    band: "compact", policy: R6D_LAYOUT_POLICY, manualPreference: "expanded",
    focusActive: false, inspectorOpen: inspectorIsActive(true, true), narrowSurface: "workspace",
  });
  equal(active.queue.kind, "yielded-context", "active Inspector yields Queue");
  equal(effectiveNarrowSurfaceForInspector("inspector", false), "workspace", "hidden Narrow Inspector reveals Workspace");
  equal(effectiveNarrowSurfaceForInspector("inspector", true), "inspector", "active Narrow Inspector remains sequential");
});

test("current and historical action registries preserve the exact boundary", () => {
  deepEqual(WORKSTATION_BOUND_ACTION_IDS, [
    "route/navigate", "route/apply", "queue/set-manual-preference", "queue/show-narrow-surface",
    "review/select", "mode/activate", "selection/set", "inspector/open", "inspector/close", "inspector/traverse-relationship", "history/set-comparison", "overlay/open", "overlay/close",
  ], "current registry exactly thirteen");
  deepEqual(R6D_BOUND_ACTION_IDS, [
    "route/navigate", "route/apply", "queue/set-manual-preference", "queue/show-narrow-surface",
  ], "historical R6D registry exactly four");
  assert(!WORKSTATION_BOUND_ACTION_IDS.includes("inspector/replace-context" as never), "replace remains unbound");
  assert(WORKSTATION_BOUND_ACTION_IDS.includes("inspector/traverse-relationship" as never), "traverse is bound");
});

test("Narrow Inspector remains an explicit sequential surface with no route mutation", () => {
  const record = evidence(70);
  const detail = cloneCase(baseCase, { evidence: [record] });
  const ref: ContextRef = { kind: "evidence", id: record.evidenceId };
  const selected = selectedState(detail);
  const context = actionContext(detail);
  const routePath = selected.state.routePath;
  const selectedOnly = dispatchAction(selected.state, { id: "selection/set", context: ref }, context, { source: "visible-ui" }).state;
  equal(selectedOnly.narrowSurface, "workspace", "selection does not change Narrow surface");
  const opened = dispatchAction(selectedOnly, { id: "inspector/open", context: ref }, context, { source: "visible-ui" });
  equal(opened.routeEffect.kind, "none", "Inspector has no route effect");
  const sequential = dispatchAction(opened.state, { id: "queue/show-narrow-surface", surface: "inspector" }, context, { source: "visible-ui" }).state;
  equal(sequential.narrowSurface, "inspector", "explicit invocation chooses Inspector surface");
  equal(sequential.routePath, routePath, "Narrow invocation preserves route");
});

let passed = 0;
for (const item of tests) {
  try { item.run(); passed += 1; }
  catch (error) {
    process.stderr.write(`FAIL ${item.name}: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}
if (passed === tests.length) process.stdout.write(`R6G validation: ${passed}/${tests.length} passed\n`);
else process.exitCode = 1;
