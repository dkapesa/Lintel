import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createInitialWorkstationState, indexReviews } from "../../r6c/index";
import type { FocusOriginRecord } from "../../r6c/focus";
import { WORKSTATION_BOUND_ACTION_IDS } from "../../r6e/action-registry";
import { projectReviewCollection } from "../../r6e/collection-projection";
import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import { FocusRegistry } from "../../../app/(workstation)/FocusRegistry";
import { R6L_BOUND_ACTION_IDS } from "../action-registry";
import { projectCommandCatalog } from "../command-catalog";
import { resolveCommandsFocusReturn } from "../command-focus";
import { focusedQueueReviewWasRemoved } from "../queue-focus";

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

const snapshot = buildFixtureSnapshot("default");
assert(snapshot.status === "ready", "ready fixture required");
const reviewIndex = indexReviews(snapshot.cases);
class TestElement {
  isConnected = true;
  private readonly descendants = new Set<TestElement>();
  append(element: TestElement): void { this.descendants.add(element); }
  remove(element: TestElement): void { this.descendants.delete(element); }
  contains(element: unknown): boolean { return this === element || this.descendants.has(element as TestElement); }
  focus(): void { /* focus calls are asserted through return targets in this Node harness */ }
}
(globalThis as unknown as { HTMLElement: typeof TestElement }).HTMLElement = TestElement;
const scope: FocusOriginRecord<HTMLElement>["scope"] = { destination: "reviews", reviewId: null };
function catalog(query = "", state = createInitialWorkstationState()) {
  return projectCommandCatalog({ state, snapshot, reviewIndex, queueVisible: true }, query);
}

test("R6L action boundary is exactly the frozen thirteen plus Focus and Escape", () => {
  equal(WORKSTATION_BOUND_ACTION_IDS.length, 13, "frozen R6E count");
  deepEqual(R6L_BOUND_ACTION_IDS, [...WORKSTATION_BOUND_ACTION_IDS, "focus/set", "escape/unwind"], "additive R6L boundary");
});

test("FocusRegistry retains strict registered-region containment for pre-existing origins", () => {
  const registry = new FocusRegistry();
  const workspace = new TestElement();
  const origin = new TestElement();
  workspace.append(origin);
  registry.register("workspacePrimary", workspace as unknown as HTMLElement);
  const record = { handle: origin as unknown as HTMLElement, region: "workspacePrimary" as const, scope };
  assert(registry.isOriginRestorable(record), "contained origin restores");
  workspace.remove(origin);
  assert(!registry.isOriginRestorable(record), "connected origin moved outside registered region is rejected");
});

test("region-associated Commands origins retain strict restoration before canonical fallback", () => {
  const registry = new FocusRegistry();
  const workspace = new TestElement();
  const origin = new TestElement();
  workspace.append(origin);
  registry.register("workspacePrimary", workspace as unknown as HTMLElement);
  const captured = { element: origin as unknown as HTMLElement, region: "workspacePrimary" as const, scope };
  const exact = resolveCommandsFocusReturn(captured, registry);
  assert(exact.kind === "recorded-origin" && (exact.handle as unknown) === origin, "contained region origin restores exactly");
  workspace.remove(origin);
  const fallback = resolveCommandsFocusReturn(captured, registry);
  deepEqual(fallback, { kind: "region", region: "workspacePrimary" }, "moved region origin uses canonical workspace fallback");
});

test("Commands exact outside-region return does not fabricate workspace membership", () => {
  const registry = new FocusRegistry();
  const workspace = new TestElement();
  const trigger = new TestElement();
  registry.register("workspacePrimary", workspace as unknown as HTMLElement);
  assert(registry.regionContaining(trigger as unknown as HTMLElement) === null, "SupportingLeft-like trigger is outside registered regions");
  const target = resolveCommandsFocusReturn({ element: trigger as unknown as HTMLElement, region: null, scope }, registry);
  assert(target.kind === "outside-origin" && (target.element as unknown) === trigger, "connected outside trigger returns exactly");
});

test("disconnected Commands outside origin falls back canonically without focusing stale element", () => {
  const registry = new FocusRegistry();
  const workspace = new TestElement();
  const trigger = new TestElement();
  trigger.isConnected = false;
  registry.register("workspacePrimary", workspace as unknown as HTMLElement);
  const target = resolveCommandsFocusReturn({ element: trigger as unknown as HTMLElement, region: null, scope }, registry);
  deepEqual(target, { kind: "region", region: "workspacePrimary" }, "disconnected outside origin uses canonical fallback");
});

test("Queue removal detection uses the focus identity captured before projection removes the anchor", () => {
  const rows = projectReviewCollection(snapshot, reviewIndex, { grouping: "semantic", filter: "all", search: "" }).rows;
  const focused = rows[0]!.reviewId;
  const nextRows = rows.filter((row) => row.reviewId !== focused);
  assert(focusedQueueReviewWasRemoved(focused, nextRows), "focused row disappears in next projection");
  let active: "body" | "search" = "body";
  if (focusedQueueReviewWasRemoved(focused, nextRows)) active = "search";
  equal(active, "search", "fallback focuses Queue search rather than leaving body active");
  assert(active !== "body", "focus is not lost to body");
});

test("empty Commands has Actions, then Reviews when no Review is selected", () => {
  deepEqual(catalog().map((section) => section.label), ["Actions", "Reviews"], "empty section composition");
});

test("selected Review exposes canonical contextual Review modes in their frozen order", () => {
  const reviewId = reviewIndex.reviewIdByCaseId.get(snapshot.cases[0]!.caseId)!;
  const selected = {
    ...createInitialWorkstationState(),
    selectedReview: { status: "available" as const, reviewId, currentCaseId: snapshot.cases[0]!.caseId },
  };
  const contextual = catalog("", selected).find((section) => section.label === "Contextual");
  deepEqual(contextual?.commands.map((command) => command.label), ["Overview", "Change", "Evidence", "Requirements", "History"], "mode order");
});

test("typed query uses one Results section with Actions before Reviews", () => {
  const result = catalog("review");
  equal(result.length, 1, "one section");
  equal(result[0]!.label, "Results", "Results label");
  const kinds = result[0]!.commands.map((command) => command.kind);
  equal(kinds.join(","), [...kinds].sort((a, b) => ({ action: 0, contextual: 1, review: 2 }[a] - { action: 0, contextual: 1, review: 2 }[b])).join(","), "source precedence");
});

test("Review search remains canonical title/repository substring matching", () => {
  const row = catalog().find((section) => section.label === "Reviews")!.commands[0]!;
  assert(catalog(row.detail!.slice(0, 5)).at(-1)!.commands.some((command) => command.id === row.id), "repository match");
  equal(catalog("not-a-truthful-review-field")[0]!.commands.length, 0, "no fuzzy match");
});

test("Commands source retains non-modal combobox semantics, flat active state and inert options", () => {
  const source = readFileSync(join(process.cwd(), "app", "(workstation)", "CommandsPalette.tsx"), "utf8");
  const css = readFileSync(join(process.cwd(), "app", "(workstation)", "commands.module.css"), "utf8");
  for (const token of ['role="combobox"', 'role="listbox"', 'role="option"', "aria-activedescendant", "onPointerDown", "tabIndex={-1}"]) assert(source.includes(token), `Commands token: ${token}`);
  assert(!source.includes("aria-modal") && !source.includes("inert") && !source.includes("setAnnouncement"), "non-modal and no custom count announcement");
  assert(css.includes("background: var(--color-surface-selected)") && !css.includes("border-left"), "flat selected treatment");
});

test("Queue remains a linked list with additive Arrow/Home/End movement", () => {
  const collection = readFileSync(join(process.cwd(), "app", "(workstation)", "ReviewCollection.tsx"), "utf8");
  const row = readFileSync(join(process.cwd(), "app", "(workstation)", "ReviewRow.tsx"), "utf8");
  for (const token of ["ArrowDown", "ArrowUp", "Home", "End", "scrollIntoView({ block: \"nearest\" })"]) assert(collection.includes(token), `Queue token: ${token}`);
  assert(row.includes("data-review-row") && row.includes("<Link"), "real Review links retained");
});

let passed = 0;
for (const item of tests) {
  try { item.run(); passed += 1; }
  catch (error) {
    process.stderr.write(`R6L validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`R6L validation: ${passed}/${tests.length} passed\n`);
