import { readFileSync } from "node:fs";
import { join } from "node:path";
import { R6D_LAYOUT_POLICY } from "../../r6d/layout-policy";
import { R6D_BOUND_ACTION_IDS } from "../../r6d/controller-contract";
import { WORKSTATION_BOUND_ACTION_IDS } from "../../r6e/action-registry";
import {
  R6C_SCHEMA_VERSION,
  conservativeReviewIdentityProvider,
  createInitialWorkstationState,
  dispatchAction,
  formatRoute,
  indexReviews,
  reconcile,
  resolveContext,
  restoreInitialState,
  reviewIdFromOpaqueToken,
  writeReviewContext,
  type ContextRef,
  type ReviewContextRecord,
  type ReviewId,
  type ReviewIdentityProvider,
  type StorageLike,
  type WorkstationState,
} from "../../r6c/index";
import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import { assembleCaseArtifacts } from "../../workspace-v2/relationships";
import type {
  CaseDetail,
  ChangedFileView,
  RelationshipState,
  RunView,
  WorkspaceReadySnapshot,
} from "../../workspace-v2/view-model";
import {
  projectRelationship,
  relationshipTraversalAccessibleName,
  relationshipVisibleText,
} from "../../r6h/relationship-presentation";
import { projectChangeContext } from "../change-context";
import { projectChangeRegister, projectChangeRegisterFromCase } from "../change-register";
import {
  CHANGED_CONTENT_UNAVAILABLE_FILE,
  CHANGED_CONTENT_UNAVAILABLE_MODE,
  lineCountLabel,
  recordedLocationCountLabel,
  recordedLocationLabel,
  riskLabel,
} from "../labels";

type Test = { name: string; run: () => void };
const tests: Test[] = [];
const test = (name: string, run: () => void): void => { tests.push({ name, run }); };
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  equal(JSON.stringify(actual), JSON.stringify(expected), message);
}

const fixture = buildFixtureSnapshot("default");
assert(fixture.status === "ready", "ready fixture required");
const readyFixture: WorkspaceReadySnapshot = fixture;
const base = fixture.cases.find((item) => item.caseId === fixture.defaultCaseId) ?? fixture.cases[0];
assert(base, "fixture Case required");

function runView(runId: string, createdAt: string): RunView {
  return {
    runId,
    headSha: `${runId}-head`,
    baseSha: "base-head",
    createdAt,
    completedAt: createdAt,
    analysisSource: "deterministic",
    sourceType: "github-pr",
    provider: null,
    model: null,
    reproducibility: "exact",
    reproducibilityLimitation: null,
    inputFingerprint: `${runId}-input`,
    configurationFingerprint: `${runId}-configuration`,
    resultFingerprint: `${runId}-result`,
    generatorVersion: "r6i-validation",
    deterministicRulesetVersion: "r6i-validation",
    reportSchemaVersion: "r6i-validation",
  };
}

function caseWithPaths(caseId: string, paths: readonly string[], createdAt = "2026-08-12T10:00:00.000Z"): CaseDetail {
  const relationshipPath = paths.includes("path/A.ts") ? "path/A.ts" : paths[0] ?? "path/A.ts";
  const artifacts = assembleCaseArtifacts({
    changedFiles: paths.map((path, index) => ({
      path,
      additions: index === 0 ? 74 : null,
      deletions: index === 0 ? 12 : null,
      risk: index === 0 ? "HIGH" : null,
    })),
    findings: [{
      findingId: "finding-a",
      severity: "HIGH",
      title: "Recorded observation A",
      statement: "A recorded observation.",
      action: "Verify the affected behaviour.",
      location: `${relationshipPath}:12`,
      provenance: "Rule detected",
      category: "Reliability",
    }],
    evidence: [{
      evidenceId: "evidence-a",
      title: "Related evidence A",
      statement: "Recorded evidence for the changed path.",
      evidenceClass: "directly-observed",
      status: "confirmed",
      provenance: "Rule detected",
      source: "Deterministic validation",
      observedAt: createdAt,
      stale: false,
      relatedFindingIds: ["finding-a"],
      changePath: relationshipPath,
    }],
    requirements: [],
    requirementLinkage: { derivable: true, findingRequirementIds: new Map() },
  });
  const clone = structuredClone(base) as CaseDetail;
  return {
    ...clone,
    caseId,
    run: runView(`run-${caseId}`, createdAt),
    github: { ...clone.github, headSha: `head-${caseId}` },
    ...artifacts,
  };
}

function readyWith(cases: readonly CaseDetail[]): WorkspaceReadySnapshot {
  return { ...readyFixture, cases: [...cases], defaultCaseId: cases[0]?.caseId ?? readyFixture.defaultCaseId };
}

function selectedState(detail: CaseDetail, reviewId = conservativeReviewIdentityProvider.reviewIdFor(detail)): WorkstationState {
  return {
    ...createInitialWorkstationState(),
    routePath: formatRoute({ destination: "reviews", reviewId, mode: "change" }),
    selectedReview: { status: "available", reviewId, currentCaseId: detail.caseId },
    mode: "change",
    lastKnownCaseId: detail.caseId,
  };
}

function actionContext(cases: readonly CaseDetail[], provider: ReviewIdentityProvider = conservativeReviewIdentityProvider) {
  return { reviewIndex: indexReviews(cases, provider), cases };
}

const decisionSubjectResolver = () => ({ status: "unavailable" as const, reason: "Validation has no decision subject." });

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

function relationshipTarget(state: RelationshipState, kind: ContextRef["kind"]): ContextRef {
  assert(state.status === "linked", `linked ${kind} relationship required`);
  const target = state.related.find((item) => item.kind === kind);
  assert(target, `${kind} target required`);
  return { kind: target.kind, id: target.id };
}

test("1. source truth uses only the current Case selected through ReviewIndex", () => {
  const older = caseWithPaths("older", ["path/old.ts"], "2026-08-11T10:00:00.000Z");
  const current = caseWithPaths("current", ["path/current.ts"], "2026-08-12T10:00:00.000Z");
  const reviewId = reviewIdFromOpaqueToken("joined-review");
  const provider: ReviewIdentityProvider = { reviewIdFor: () => reviewId };
  const cases = [older, current];
  const projection = projectChangeRegister(indexReviews(cases, provider), reviewId, cases);
  assert(projection.status === "ready", "current register ready");
  deepEqual(projection.rows.map((row) => row.path), ["path/current.ts"], "only newest current Case projected");
  equal(projectChangeRegister(indexReviews(cases, provider), reviewIdFromOpaqueToken("missing"), cases).status, "unavailable", "unknown Review unavailable");
});

test("2. collection preserves source order, long paths and duplicate paths while excluding duplicate identities", () => {
  const longPath = `src/${"nested/".repeat(24)}component-with-a-deliberately-long-name.tsx`;
  const detail = caseWithPaths("collection", ["path/B.ts", longPath, "path/A.ts", "path/A.ts"]);
  const projection = projectChangeRegisterFromCase(detail);
  deepEqual(projection.rows.map((row) => row.path), ["path/B.ts", longPath, "path/A.ts", "path/A.ts"], "canonical order retained");
  equal(projection.recordCount, 4, "duplicate exact paths remain separate");
  assert(projection.rows[2]?.context.id !== projection.rows[3]?.context.id, "duplicate paths have occurrence-qualified identities");
  const duplicateIdentity: ChangedFileView = { ...detail.changedFiles[1]!, artifactId: detail.changedFiles[0]!.artifactId };
  const defended = projectChangeRegisterFromCase({ ...detail, changedFiles: [detail.changedFiles[0]!, duplicateIdentity, ...detail.changedFiles.slice(2)] });
  equal(defended.excludedDuplicateIdentityCount, 1, "later duplicate identity excluded");
  deepEqual(defended.rows.map((row) => row.sourceIndex), [0, 2, 3], "first occurrence wins without sorting");
});

test("3. line, risk and recorded-location labels preserve null truth", () => {
  equal(lineCountLabel(null, null), "Lines not recorded", "both counts absent");
  equal(lineCountLabel(74, 12), "+74 · −12", "both counts recorded");
  equal(lineCountLabel(74, null), "+74 · deletions not recorded", "deletions absent");
  equal(lineCountLabel(null, 12), "Additions not recorded · −12", "additions absent");
  equal(riskLabel("CRITICAL"), "CRITICAL", "canonical RiskLevel verbatim");
  equal(riskLabel(null), "Risk not recorded", "missing risk truthful");
  deepEqual([0, 1, 3].map(recordedLocationCountLabel), ["None recorded", "1 recorded location", "3 recorded locations"], "location counts exact");
});

test("4. recorded locations expose line labels and source labels without raw finding identity", () => {
  const detail = caseWithPaths("locations", ["path/A.ts"]);
  const row = projectChangeRegisterFromCase(detail).rows[0];
  assert(row, "change row required");
  equal(row.recordedLocationCount, 1, "exact recorded location counted");
  equal(recordedLocationLabel(12, 12), "Line 12", "single line label");
  equal(recordedLocationLabel(12, 18), "Lines 12–18", "defensive range label");
  const location = detail.changedFiles[0]?.focusedRegions[0];
  assert(location?.sourceLabel === "Recorded observation A", "canonical source label preserved");
  const uiSource = ["ChangeMode.tsx", "ChangedFileRow.tsx"].map((file) => readFileSync(join(process.cwd(), "app", "(workstation)", file), "utf8")).join("\n");
  assert(!uiSource.includes("sourceFindingId"), "raw sourceFindingId is not consumed by Change UI");
});

test("5. Change selection is route-free and remains independent from Inspector context", () => {
  const detail = caseWithPaths("selection", ["path/A.ts", "path/B.ts"]);
  const [changeA, changeB] = detail.changedFiles;
  const finding = detail.findings[0];
  assert(changeA && changeB && finding, "selection fixtures required");
  const initial = selectedState(detail);
  const context = actionContext([detail]);
  const findingRef: ContextRef = { kind: "finding", id: finding.findingId };
  const refA: ContextRef = { kind: "change", id: changeA.artifactId };
  const refB: ContextRef = { kind: "change", id: changeB.artifactId };
  const inspectorFinding = dispatchAction(initial, { id: "inspector/open", context: findingRef }, context, { source: "visible-ui" });
  const selectedA = dispatchAction(inspectorFinding.state, { id: "selection/set", context: refA }, context, { source: "visible-ui" });
  equal(selectedA.routeEffect.kind, "none", "file selection has no URL effect");
  deepEqual(selectedA.state.inspector.context, findingRef, "selection leaves Inspector unchanged");
  const selectedB = dispatchAction(selectedA.state, { id: "selection/set", context: refB }, context, { source: "visible-ui" });
  deepEqual(selectedB.state.primarySelection, refB, "second file selected");
  deepEqual(selectedB.state.inspector.context, findingRef, "Inspector still independent");
  const inspectedB = dispatchAction(selectedB.state, { id: "inspector/open", context: refB }, context, { source: "visible-ui" });
  deepEqual(inspectedB.state.inspector.context, refB, "explicit Inspect opens selected Change");
  deepEqual(inspectedB.state.primarySelection, refB, "Inspect does not alter selection");
});

test("6. mode independence and R6C restoration preserve only an exact valid Change ref", () => {
  const detail = caseWithPaths("restoration", ["path/A.ts"]);
  const reviewId = conservativeReviewIdentityProvider.reviewIdFor(detail);
  const ref: ContextRef = { kind: "change", id: detail.changedFiles[0]!.artifactId };
  const contextual = { ...selectedState(detail, reviewId), primarySelection: ref };
  const evidenceMode = dispatchAction(contextual, { id: "mode/activate", mode: "evidence" }, actionContext([detail]), { source: "visible-ui" });
  deepEqual(evidenceMode.state.primarySelection, ref, "mode change preserves canonical selection");
  const storage = new MemoryStorage();
  const record: ReviewContextRecord = {
    schemaVersion: R6C_SCHEMA_VERSION,
    reviewId,
    mode: "change",
    primarySelection: ref,
    inspector: { open: false, context: null },
    comparisonRunId: null,
    lastKnownCaseId: detail.caseId,
    modeAnchors: {},
    capturedAt: "2026-08-12T12:00:00.000Z",
  };
  assert(writeReviewContext(storage, record).persisted, "restoration record persisted");
  const restored = restoreInitialState({
    pathname: formatRoute({ destination: "reviews", reviewId, mode: null }),
    storage,
    authoritativeSnapshot: readyWith([detail]),
    capturedAt: "2026-08-12T12:01:00.000Z",
    layout: { band: "standard", policy: R6D_LAYOUT_POLICY },
    decisionSubjectResolver,
  });
  equal(restored.state.mode, "change", "Change mode restored");
  deepEqual(restored.state.primarySelection, ref, "exact Change selection restored");
  const modeSource = readFileSync(join(process.cwd(), "app", "(workstation)", "ChangeMode.tsx"), "utf8");
  assert(modeSource.includes('state.primarySelection?.kind === "change"'), "other-mode selection cannot mark a Change row selected");
  assert(!modeSource.includes("useState("), "no local parallel selection state");
});

test("7. Change Inspector projection has exact standing and relationship blocks", () => {
  const detail = caseWithPaths("inspector", ["path/A.ts"]);
  const ref: ContextRef = { kind: "change", id: detail.changedFiles[0]!.artifactId };
  const projection = projectChangeContext(detail, ref);
  assert(projection.status === "ready", "Change Inspector ready");
  equal(projection.kind, "change", "projection kind exact");
  equal(projection.title, "path/A.ts", "canonical path title");
  equal(projection.statement, CHANGED_CONTENT_UNAVAILABLE_FILE, "truthful no-content statement");
  deepEqual(projection.standing.map((item) => item.label), ["Line counts", "Risk", "Recorded locations"], "exact three standing rows");
  deepEqual(projection.relationships.map((item) => item.label), ["Recorded observations", "Related evidence"], "exact two relationship blocks");
  equal(projectChangeContext(detail, { kind: "change", id: "missing" }).status, "unavailable", "stale context unavailable");
  const keys = new Set<string>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => { keys.add(key); visit(child); });
  };
  visit(projection);
  for (const key of ["patch", "hunk", "diff", "binary", "truncated", "renamed", "oldLine", "newLine", "requirement", "riskScore", "caseId", "artifactId", "sourceFindingId"]) {
    assert(!keys.has(key), `Inspector projection excludes unsupported key ${key}`);
  }
});

test("8. all Change traversal directions, unavailable targets, noop and cycles use the existing dispatcher", () => {
  const detail = caseWithPaths("traversal", ["path/A.ts"]);
  const change = detail.changedFiles[0];
  const finding = detail.findings[0];
  const evidence = detail.evidence[0];
  assert(change && finding && evidence, "relationship fixtures required");
  const changeRef: ContextRef = { kind: "change", id: change.artifactId };
  const findingRef: ContextRef = { kind: "finding", id: finding.findingId };
  const evidenceRef: ContextRef = { kind: "evidence", id: evidence.evidenceId };
  deepEqual(relationshipTarget(finding.affectedChange, "change"), changeRef, "Finding to Change canonical edge");
  deepEqual(relationshipTarget(evidence.relatedChanges, "change"), changeRef, "Evidence to Change canonical edge");
  deepEqual(relationshipTarget(change.observations, "finding"), findingRef, "Change to Finding canonical edge");
  deepEqual(relationshipTarget(change.evidence, "evidence"), evidenceRef, "Change to Evidence canonical edge");
  const context = actionContext([detail]);
  const selected = { ...selectedState(detail), primarySelection: changeRef };
  const opened = dispatchAction(selected, { id: "inspector/open", context: changeRef }, context, { source: "visible-ui" });
  const toEvidence = dispatchAction(opened.state, { id: "inspector/traverse-relationship", context: evidenceRef }, context, { source: "visible-ui" });
  equal(toEvidence.status, "applied", "Change to Evidence applies");
  deepEqual(toEvidence.state.primarySelection, changeRef, "traversal preserves primary Change");
  equal(toEvidence.routeEffect.kind, "none", "traversal has no route effect");
  const toChange = dispatchAction(toEvidence.state, { id: "inspector/traverse-relationship", context: changeRef }, context, { source: "visible-ui" });
  equal(toChange.state.inspector.relationshipTrail.length, 2, "safe cycle grows forward trail");
  equal(dispatchAction(toChange.state, { id: "inspector/traverse-relationship", context: changeRef }, context, { source: "visible-ui" }).status, "noop", "same-context traversal noops");
  const unavailable = dispatchAction(toChange.state, { id: "inspector/traverse-relationship", context: { kind: "evidence", id: "missing" } }, context, { source: "visible-ui" });
  equal(unavailable.status, "unavailable", "NB-H1 stale traversal target unavailable");
  deepEqual(unavailable.state, toChange.state, "unavailable traversal does not mutate state");
  const findingOpen = dispatchAction(selected, { id: "inspector/open", context: findingRef }, context, { source: "visible-ui" });
  equal(dispatchAction(findingOpen.state, { id: "inspector/traverse-relationship", context: changeRef }, context, { source: "visible-ui" }).status, "applied", "Finding to Change traversable");
  const evidenceOpen = dispatchAction(selected, { id: "inspector/open", context: evidenceRef }, context, { source: "visible-ui" });
  equal(dispatchAction(evidenceOpen.state, { id: "inspector/traverse-relationship", context: changeRef }, context, { source: "visible-ui" }).status, "applied", "Evidence to Change traversable");
  equal(dispatchAction(opened.state, { id: "inspector/traverse-relationship", context: findingRef }, context, { source: "visible-ui" }).status, "applied", "Change to Finding traversable");
});

test("9. shared relationship presentation preserves state and withholds raw ids from visible text", () => {
  const secret = "RAW_CHANGE_OR_FINDING_ID";
  const states: RelationshipState[] = [
    { status: "linked", related: [{ kind: "change", id: secret, label: "path/safe.ts", detail: "HIGH risk" }], unresolved: ["RAW_UNRESOLVED"] },
    { status: "none" },
    { status: "unavailable", reason: "Canonical relationship unavailable." },
    { status: "unresolved", unresolved: ["RAW_A", "RAW_B"] },
  ];
  const projections = states.map(projectRelationship);
  deepEqual(projections.map((item) => item.status), ["linked", "none", "unavailable", "unresolved"], "four states preserved");
  const linked = projections[0];
  assert(linked?.status === "linked", "linked presentation required");
  equal(linked.unresolvedCount, 1, "unresolved count preserved with links");
  equal(linked.items[0]?.target.id, secret, "opaque target retained for traversal only");
  const visible = relationshipVisibleText(linked.items[0]!);
  const accessible = relationshipTraversalAccessibleName(linked.items[0]!);
  assert(!visible.includes(secret) && !accessible.includes(secret), "raw target id absent from user-facing text");
  assert(visible.includes("path/safe.ts") && accessible.startsWith("Inspect "), "safe presentation retained");
});

test("10. reconciliation re-proves Change objects and discards removed refs without substitution", () => {
  const oldCase = caseWithPaths("old-reconcile", ["path/A.ts", "path/B.ts"], "2026-08-11T10:00:00.000Z");
  const newCase = caseWithPaths("new-reconcile", ["path/A.ts"], "2026-08-12T10:00:00.000Z");
  const reviewId = reviewIdFromOpaqueToken("reconcile-review");
  const provider: ReviewIdentityProvider = { reviewIdFor: () => reviewId };
  const refA: ContextRef = { kind: "change", id: oldCase.changedFiles[0]!.artifactId };
  const refB: ContextRef = { kind: "change", id: oldCase.changedFiles[1]!.artifactId };
  const state: WorkstationState = {
    ...selectedState(oldCase, reviewId),
    primarySelection: refA,
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: refB, relationshipTrail: [refA, refB] },
  };
  const result = reconcile(state, readyWith([newCase, oldCase]), {
    capturedAt: "2026-08-12T12:00:00.000Z",
    decisionSubjectResolver,
    reviewIdentityProvider: provider,
  });
  deepEqual(result.state.primarySelection, refA, "surviving Change ref re-proved");
  equal(result.state.inspector.context, null, "removed Inspector ref not substituted");
  deepEqual(result.state.inspector.unavailableContext, refB, "removed Inspector ref remains truthful unavailable context");
  deepEqual(result.state.inspector.relationshipTrail, [refA], "removed trail ref discarded only");
});

test("11. production action registry and one-main/one-Inspector composition remain bounded", () => {
  deepEqual(WORKSTATION_BOUND_ACTION_IDS, [
    "route/navigate", "route/apply", "queue/set-manual-preference", "queue/show-narrow-surface",
    "review/select", "mode/activate", "selection/set", "inspector/open", "inspector/close", "inspector/traverse-relationship", "history/set-comparison", "overlay/open", "overlay/close",
  ], "production registry exactly thirteen");
  equal(R6D_BOUND_ACTION_IDS.length, 4, "historical R6D registry remains four");
  assert(!WORKSTATION_BOUND_ACTION_IDS.includes("inspector/replace-context" as never), "replace context remains unbound");
  const workspace = readFileSync(join(process.cwd(), "app", "(workstation)", "WorkspaceHost.tsx"), "utf8");
  const inspector = readFileSync(join(process.cwd(), "app", "(workstation)", "InspectorHost.tsx"), "utf8");
  equal((workspace.match(/<main\b/g) ?? []).length, 1, "one Workspace main");
  equal((inspector.match(/<ContextualInspector\b/g) ?? []).length, 1, "one Contextual Inspector host");
});

test("12. rendering surface is diff-truth safe, package-free and uses the settled responsive boundary", () => {
  equal(CHANGED_CONTENT_UNAVAILABLE_MODE, "Lintel records the changed paths for this analysis. Changed file content is not part of the stored analysis, so no diff is available here.", "mode statement exact");
  equal(CHANGED_CONTENT_UNAVAILABLE_FILE, "No file content is stored for this analysis, so this change cannot be read line by line here.", "file statement exact");
  const detail = caseWithPaths("negative-shape", ["path/A.ts"]);
  const register = projectChangeRegisterFromCase(detail);
  const context = projectChangeContext(detail, register.rows[0]!.context);
  const keys = new Set<string>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => { keys.add(key); visit(child); });
  };
  visit(register);
  visit(context);
  for (const key of ["patch", "hunk", "diff", "binary", "truncated", "renamed", "oldLine", "newLine"]) {
    assert(!keys.has(key), `Change output has no unsupported ${key} key`);
  }
  equal(register.status, "ready", "generic projection status is not a synthetic Git status");
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };
  deepEqual(Object.keys(packageJson.dependencies).sort(), ["next", "react", "react-dom"], "no production package added");
  deepEqual(Object.keys(packageJson.devDependencies).sort(), ["@types/node", "@types/react", "@types/react-dom", "typescript"], "no development package added");
  const uiSource = ["ChangeMode.tsx", "ChangedFileRow.tsx", "change.module.css"].map((file) => readFileSync(join(process.cwd(), "app", "(workstation)", file), "utf8")).join("\n");
  for (const forbidden of ["View diff", "Apply patch", "Checkout", "Commit change", "Revert change", "SyntaxHighlighter"]) {
    assert(!uiSource.includes(forbidden), `forbidden source-control affordance absent: ${forbidden}`);
  }
  equal((uiSource.match(/max-width:\s*899\.98px/g) ?? []).length, 1, "only established local breakpoint used");
  assert(uiSource.includes("overflow-wrap: anywhere") && uiSource.includes("forced-colors: active") && uiSource.includes("min-height: 44px"), "rendering safety rules present");
});

test("13. semantic Change identity and conservative-provider adversarial safety are load-bearing", () => {
  const caseA = caseWithPaths("identity-a", ["path/A.ts", "path/B.ts"], "2026-08-11T10:00:00.000Z");
  const caseB = caseWithPaths("identity-b", ["path/C.ts", "path/A.ts"], "2026-08-12T10:00:00.000Z");
  const conservativeA = conservativeReviewIdentityProvider.reviewIdFor(caseA);
  const conservativeB = conservativeReviewIdentityProvider.reviewIdFor(caseB);
  assert(conservativeA !== conservativeB, "V-13a conservative provider separates Reviews");
  const conservativeIndex = indexReviews([caseB, caseA]);
  equal(conservativeIndex.byReviewId.get(conservativeA)?.currentCaseId, caseA.caseId, "Review A still resolves Case A");
  const oldARef: ContextRef = { kind: "change", id: caseA.changedFiles[0]!.artifactId };
  const initial: WorkstationState = {
    ...selectedState(caseA, conservativeA),
    primarySelection: oldARef,
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: oldARef },
  };
  const selectedB = dispatchAction(initial, { id: "review/select", reviewId: conservativeB }, { reviewIndex: conservativeIndex, cases: [caseB, caseA] }, { source: "visible-ui" });
  equal(selectedB.state.primarySelection, null, "Review switch clears primary selection");
  equal(selectedB.state.inspector.open, false, "Review switch closes Inspector");

  const joinedReview = reviewIdFromOpaqueToken("future-joined-review");
  const joiningProvider: ReviewIdentityProvider = { reviewIdFor: () => joinedReview };
  const aInA = caseA.changedFiles.find((item) => item.path === "path/A.ts")!;
  const aInB = caseB.changedFiles.find((item) => item.path === "path/A.ts")!;
  const cInB = caseB.changedFiles.find((item) => item.path === "path/C.ts")!;
  const bInA = caseA.changedFiles.find((item) => item.path === "path/B.ts")!;
  equal(aInA.artifactId, "change:0:9:path/A.ts", "identity exact format");
  equal(aInA.artifactId, aInB.artifactId, "A identity stable despite index change");
  assert(aInA.artifactId !== cInB.artifactId, "C receives different semantic id");
  const refA: ContextRef = { kind: "change", id: aInA.artifactId };
  const refB: ContextRef = { kind: "change", id: bInA.artifactId };
  const joinedState: WorkstationState = {
    ...selectedState(caseA, joinedReview),
    primarySelection: refA,
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: refA, relationshipTrail: [refA, refB] },
  };
  const reconciled = reconcile(joinedState, readyWith([caseB, caseA]), {
    capturedAt: "2026-08-12T12:00:00.000Z",
    decisionSubjectResolver,
    reviewIdentityProvider: joiningProvider,
  });
  assert(reconciled.state.selectedReview.status === "available" && reconciled.state.selectedReview.currentCaseId === caseB.caseId, "joined Review advances to Case B");
  deepEqual(reconciled.state.primarySelection, refA, "primary A re-proves as A");
  deepEqual(reconciled.state.inspector.context, refA, "Inspector A re-proves as A");
  deepEqual(reconciled.state.inspector.relationshipTrail, [refA], "trail A survives and absent B is discarded");
  const resolvedA = resolveContext(caseB, refA);
  equal((resolvedA.status === "resolved" && resolvedA.context.kind === "change") ? resolvedA.context.value.path : null, "path/A.ts", "A never rebinds to C");

  const unavailableState: WorkstationState = {
    ...selectedState(caseA, joinedReview),
    primarySelection: refB,
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: null, unavailableContext: refB, relationshipTrail: [refB] },
  };
  const unavailable = reconcile(unavailableState, readyWith([caseB, caseA]), {
    capturedAt: "2026-08-12T12:00:00.000Z",
    decisionSubjectResolver,
    reviewIdentityProvider: joiningProvider,
  });
  equal(unavailable.state.primarySelection, null, "removed path selection discarded");
  equal(unavailable.state.inspector.context, null, "removed unavailable context does not resolve to substitute");
  deepEqual(unavailable.state.inspector.unavailableContext, refB, "unavailableContext remains truthful");
  deepEqual(unavailable.state.inspector.relationshipTrail, [], "removed path trail discarded");

  const duplicate = caseWithPaths("duplicates", ["path/A.ts", "path/A.ts"]);
  deepEqual(duplicate.changedFiles.map((item) => item.artifactId), ["change:0:9:path/A.ts", "change:1:9:path/A.ts"], "duplicate exact paths are occurrence-qualified");
  const legacy: ContextRef = { kind: "change", id: "change-0" };
  equal(resolveContext(caseB, legacy).status, "discarded", "legacy positional ref cannot resolve");
  const legacyState: WorkstationState = {
    ...selectedState(caseA, joinedReview),
    primarySelection: legacy,
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: legacy, relationshipTrail: [legacy] },
  };
  const legacyResult = reconcile(legacyState, readyWith([caseB, caseA]), {
    capturedAt: "2026-08-12T12:00:00.000Z",
    decisionSubjectResolver,
    reviewIdentityProvider: joiningProvider,
  });
  equal(legacyResult.state.primarySelection, null, "legacy primary ref discarded");
  equal(legacyResult.state.inspector.context, null, "legacy Inspector ref discarded");
  deepEqual(legacyResult.state.inspector.unavailableContext, legacy, "legacy Inspector ref reported unavailable without rebinding");
  deepEqual(legacyResult.state.inspector.relationshipTrail, [], "legacy trail ref discarded");
});

let passed = 0;
for (const item of tests) {
  try { item.run(); passed += 1; }
  catch (error) {
    process.stderr.write(`R6I validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`R6I validation: ${passed}/${tests.length} passed\n`);
