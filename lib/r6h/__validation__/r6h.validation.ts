import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import type { CaseDetail, FindingView, RelationshipState, RequirementView } from "../../workspace-v2/view-model";
import {
  conservativeReviewIdentityProvider,
  createInitialWorkstationState,
  dispatchAction,
  formatRoute,
  indexReviews,
  type ContextRef,
  type ReviewId,
  type WorkstationState,
} from "../../r6c/index";
import { R6D_BOUND_ACTION_IDS } from "../../r6d/controller-contract";
import { WORKSTATION_BOUND_ACTION_IDS } from "../../r6e/action-registry";
import { projectEvidenceContext } from "../../r6g/evidence-context";
import { projectFindingContext } from "../finding-context";
import { REQUIREMENT_GROUPS, projectRequirementRegister, projectRequirementRegisterFromCase } from "../requirement-register";
import { projectRequirementContext } from "../requirement-context";
import { projectRelationship, relationshipTraversalAccessibleName, relationshipVisibleText } from "../relationship-presentation";

type Test = { name: string; run: () => void };
const tests: Test[] = [];
const test = (name: string, run: () => void) => tests.push({ name, run });
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function equal<T>(actual: T, expected: T, message: string): void { if (actual !== expected) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); }
function deepEqual(actual: unknown, expected: unknown, message: string): void { equal(JSON.stringify(actual), JSON.stringify(expected), message); }

const fixture = buildFixtureSnapshot("default");
assert(fixture.status === "ready", "ready fixture required");
const base = fixture.cases.find((item) => item.caseId === fixture.defaultCaseId) ?? fixture.cases[0];
assert(base, "case required");
const cloneCase = (changes: Partial<CaseDetail> = {}): CaseDetail => ({ ...(structuredClone(base) as CaseDetail), ...changes });
const related = (kind: "evidence" | "finding" | "requirement" | "change", id: string, label: string): RelationshipState => ({ status: "linked", related: [{ kind, id, label, detail: null }], unresolved: [] });
const actionContext = (detail: CaseDetail) => ({ reviewIndex: indexReviews([detail]), cases: [detail] });
function selected(detail: CaseDetail): { state: WorkstationState; reviewId: ReviewId } {
  const reviewId = conservativeReviewIdentityProvider.reviewIdFor(detail);
  return { reviewId, state: { ...createInitialWorkstationState(), routePath: formatRoute({ destination: "reviews", reviewId, mode: "requirements" }), selectedReview: { status: "available", reviewId, currentCaseId: detail.caseId }, mode: "requirements", lastKnownCaseId: detail.caseId } };
}

test("register uses current Case, four exact first-match groups, source order and duplicate defence", () => {
  const requirements = [
    { ...base.requirements[0]!, requirementId: "open-stale", title: "Open stale", status: "open" as const, stale: true },
    { ...base.requirements[0]!, requirementId: "stale", title: "Stale", status: "stale" as const, stale: false },
    { ...base.requirements[0]!, requirementId: "satisfied", title: "Satisfied", status: "accepted" as const, stale: false },
    { ...base.requirements[0]!, requirementId: "unavailable", title: "Unavailable", status: "unavailable" as const, stale: false },
    { ...base.requirements[0]!, requirementId: "open-stale", title: "Duplicate", status: "open" as const, stale: false },
  ];
  const current = cloneCase({ caseId: "current", requirements });
  const historical = cloneCase({ caseId: "historical", requirements: [] });
  const reviewId = conservativeReviewIdentityProvider.reviewIdFor(current);
  const projection = projectRequirementRegister(indexReviews([current, historical]), reviewId, [current, historical]);
  assert(projection.status === "ready", "register ready");
  deepEqual(projection.groups.map((group) => group.label), REQUIREMENT_GROUPS.map((group) => group.label), "exact group order");
  deepEqual(projection.groups.map((group) => group.rows.map((row) => row.title)), [["Open stale"], ["Stale"], ["Satisfied"], ["Unavailable"]], "canonical source order and first matches");
  equal(projection.groups[0]?.rows[0]?.statusLabel, "Open · stale", "open stale remains Remaining");
  equal(projection.excludedDuplicateIdentityCount, 1, "duplicate excluded");
  equal(projectRequirementRegisterFromCase(cloneCase({ requirements: [] })).recordCount, 0, "zero requirements");
});

test("Requirement and Finding projections expose only the settled truthful fields", () => {
  const requirement = base.requirements[0]!;
  const finding = base.findings[0]!;
  const detail = cloneCase({ requirements: [requirement], findings: [finding] });
  const requirementProjection = projectRequirementContext(detail, { kind: "requirement", id: requirement.requirementId });
  const findingProjection = projectFindingContext(detail, { kind: "finding", id: finding.findingId });
  assert(requirementProjection.status === "ready" && findingProjection.status === "ready", "projections ready");
  deepEqual(requirementProjection.standing.map((item) => item.label), ["Status", "Importance", "Evidence required"], "requirement standing exact");
  deepEqual(findingProjection.standing.map((item) => item.label), ["Severity", "Category", "Provenance", "Location"], "finding standing exact");
  assert(!JSON.stringify(requirementProjection).includes("conditionProgress"), "requirement condition progress withheld");
  assert(!JSON.stringify(findingProjection).includes(finding.action), "finding action withheld");
});

test("selection is route-free and Inspector traversal is primary-selection independent, safe and trail-only", () => {
  const evidence = { ...base.evidence[0]!, evidenceId: "evidence-a", supportsFindings: related("finding", "finding-b", "Finding B") };
  const finding = { ...base.findings[0]!, findingId: "finding-b", supportingEvidence: related("evidence", "evidence-a", "Evidence A") };
  const detail = cloneCase({ evidence: [evidence], findings: [finding] });
  const initial = selected(detail);
  const context = actionContext(detail);
  const evidenceRef: ContextRef = { kind: "evidence", id: evidence.evidenceId };
  const findingRef: ContextRef = { kind: "finding", id: finding.findingId };
  const selection = dispatchAction(initial.state, { id: "selection/set", context: evidenceRef }, context, { source: "visible-ui" });
  equal(selection.routeEffect.kind, "none", "selection no route");
  equal(selection.state.inspector.open, false, "selection does not open");
  const opened = dispatchAction(selection.state, { id: "inspector/open", context: evidenceRef }, context, { source: "visible-ui" });
  const traversed = dispatchAction(opened.state, { id: "inspector/traverse-relationship", context: findingRef }, context, { source: "visible-ui" });
  equal(traversed.status, "applied", "traversal applies");
  equal(traversed.routeEffect.kind, "none", "traversal no route");
  deepEqual(traversed.state.primarySelection, evidenceRef, "selection frozen while inspector traverses");
  deepEqual(traversed.state.inspector.context, findingRef, "inspector target exact");
  equal(traversed.state.inspector.relationshipTrail.length, 1, "trail grows once");
  equal(dispatchAction(traversed.state, { id: "inspector/traverse-relationship", context: findingRef }, context, { source: "visible-ui" }).status, "noop", "same target noop");
  const cycle = dispatchAction(traversed.state, { id: "inspector/traverse-relationship", context: evidenceRef }, context, { source: "visible-ui" });
  equal(cycle.state.inspector.relationshipTrail.length, 2, "A to B to A is safe without Back");
});

test("relationship presentation deduplicates targets and never discloses raw ids in visible or accessible text", () => {
  const secret = "SECRET_RAW_RELATIONSHIP_ID_DO_NOT_RENDER";
  const relationship: RelationshipState = { status: "linked", related: [
    { kind: "finding", id: secret, label: "Finding title", detail: "High" },
    { kind: "finding", id: secret, label: "Duplicate", detail: null },
    { kind: "change", id: "change-secret", label: "Changed file", detail: "src/a.ts" },
  ], unresolved: ["unresolved-secret"] };
  const projection = projectRelationship(relationship);
  assert(projection.status === "linked", "linked");
  equal(projection.items.length, 2, "exact duplicate target removed");
  equal(projection.items[0]?.target.id, secret, "internal target retains secret");
  const visible = relationshipVisibleText(projection.items[0]!);
  const accessible = relationshipTraversalAccessibleName(projection.items[0]!);
  assert(!visible.includes(secret) && !accessible.includes(secret), "raw id withheld from presentation");
  assert(accessible.includes("Finding title"), "accessible name contains visible label");
  const source = readFileSync(join(process.cwd(), "app", "(workstation)", "ContextualInspector.tsx"), "utf8");
  assert(!/target\.id[^\n]*(aria-label|title|data-|id=)|(?:aria-label|title|data-|id=)[^\n]*target\.id/.test(source), "Inspector does not interpolate target id into DOM attributes");
});

test("action registry stays bounded with historical R6D frozen", () => {
  equal(WORKSTATION_BOUND_ACTION_IDS.length, 11, "exactly eleven bound actions");
  assert(WORKSTATION_BOUND_ACTION_IDS.includes("inspector/traverse-relationship"), "traverse bound");
  assert(!WORKSTATION_BOUND_ACTION_IDS.includes("inspector/replace-context" as never), "replace unbound");
  equal(R6D_BOUND_ACTION_IDS.length, 4, "historical four");
});

let passed = 0;
for (const item of tests) {
  try { item.run(); passed += 1; }
  catch (error) { process.stderr.write(`R6H validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`); process.exitCode = 1; break; }
}
if (passed === tests.length) process.stdout.write(`R6H validation: ${passed}/${tests.length} passed\n`);
