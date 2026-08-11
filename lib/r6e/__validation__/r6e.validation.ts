import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import type { QueueCaseSummary, WorkspaceSnapshot } from "../../workspace-v2/view-model";
import { indexReviews, reviewIdFromOpaqueToken } from "../../r6c/review-identity";
import { WORKSTATION_BOUND_ACTION_IDS } from "../action-registry";
import {
  DEFAULT_REVIEW_COLLECTION_PREFERENCES,
  isReviewCollectionPreferences,
  readReviewCollectionPreferences,
  writeReviewCollectionPreferences,
} from "../collection-preferences";
import { projectReviewCollection } from "../collection-projection";
import { writeCollectionPreference, type StorageLike } from "../../r6c/persistence";

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
class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}
const base = buildFixtureSnapshot("default");
assert(base.status === "ready", "ready fixture required");
function view(search = "", filter: "all" | "attention" | "review" | "ready" | "reviewed" = "all", grouping: "semantic" | "none" = "semantic") {
  return { search, filter, grouping } as const;
}
function project(snapshot: WorkspaceSnapshot = base, search = "", filter: ReturnType<typeof view>["filter"] = "all", grouping: ReturnType<typeof view>["grouping"] = "semantic") {
  return projectReviewCollection(snapshot, indexReviews(snapshot.status === "ready" ? snapshot.cases : []), view(search, filter, grouping));
}

test("default Review identity joins every production-shaped row", () => {
  const result = project();
  const sourceCount = base.groups.flatMap((group) => group.cases).length;
  equal(result.rows.length, sourceCount, "all valid rows join");
  for (const row of result.rows) equal(row.reviewId, reviewIdFromOpaqueToken(`case:${row.currentCaseId.length}:${row.currentCaseId}`), "case identity");
});

test("malformed synthetic summary is excluded without identity invention", () => {
  const malformed = { ...base, groups: [{ id: "review" as const, label: "Review", cases: [{ ...base.groups[0].cases[0], caseId: "missing" }] }] };
  equal(project(malformed).rows.length, 0, "unjoinable summary excluded");
});

test("ordering is chronology descending, unknown-last, then ReviewId", () => {
  const first = base.cases[0];
  const second = base.cases[1];
  const summaries: QueueCaseSummary[] = [
    { ...base.groups[0].cases[0], caseId: first.caseId, groupId: "review" },
    { ...base.groups[0].cases[0], caseId: second.caseId, groupId: "review" },
  ];
  const fixture = {
    ...base,
    cases: [
      { ...first, run: { ...first.run!, createdAt: "2026-01-01T00:00:00.000Z" } },
      { ...second, run: { ...second.run!, createdAt: "not-a-date" } },
    ],
    groups: [{ id: "review" as const, label: "Review", cases: summaries }],
  };
  const ordered = project(fixture).rows;
  equal(ordered[0].currentCaseId, first.caseId, "valid chronology first");
  equal(ordered[1].currentCaseId, second.caseId, "unknown chronology last");
  const tied = { ...fixture, cases: fixture.cases.map((item) => ({ ...item, run: { ...item.run!, createdAt: "2026-01-01T00:00:00.000Z" } })) };
  const expected = [...tied.cases].sort((a, b) => `case:${a.caseId.length}:${a.caseId}`.localeCompare(`case:${b.caseId.length}:${b.caseId}`)).map((item) => item.caseId);
  deepEqual(project(tied).rows.map((row) => row.currentCaseId), expected, "ReviewId tie-break");
});

test("groups use semantic order and None only removes headings", () => {
  const result = project();
  const expectedOrder = ["attention", "review", "ready", "reviewed"];
  deepEqual(result.groups.map((group) => group.groupId), expectedOrder.filter((id) => result.rows.some((row) => row.groupId === id)), "group order");
  const none = project(base, "", "all", "none");
  equal(none.groups.length, 0, "none has no headings");
  deepEqual(none.rows.map((row) => row.reviewId), result.rows.map((row) => row.reviewId), "none keeps flattened group order");
});

test("searches only title/repository and combines with State", () => {
  const source = project().rows[0];
  assert(project(base, `  ${source.title.slice(0, 3).toUpperCase()}  `).rows.some((row) => row.reviewId === source.reviewId), "trimmed case-insensitive title search");
  assert(project(base, source.repository.slice(0, 3).toUpperCase()).rows.some((row) => row.reviewId === source.reviewId), "case-insensitive repository search");
  equal(project(base, "a non matching query").rows.length, 0, "no fuzzy or hidden-field match");
  const combined = project(base, "", source.groupId).rows;
  assert(combined.every((row) => row.groupId === source.groupId), "State filter");
});

test("preferences validate and safely default across storage boundaries", () => {
  const storage = new MemoryStorage();
  equal(readReviewCollectionPreferences(storage).status, "missing", "missing");
  const saved = { schemaVersion: 1, grouping: "none", filter: "ready" } as const;
  assert(writeReviewCollectionPreferences(storage, saved, "2026-08-11T12:00:00.000Z").persisted, "write");
  deepEqual(readReviewCollectionPreferences(storage).preferences, saved, "valid round trip");
  assert(writeCollectionPreference(storage, "reviews-queue", 2, saved, "2026-08-11T12:00:00.000Z").persisted, "wrong-version seed");
  equal(readReviewCollectionPreferences(storage).status, "invalid", "wrong version");
  storage.values.set("lintel.r6.workstation.v1", "{");
  equal(readReviewCollectionPreferences(storage).status, "invalid", "invalid");
  deepEqual(readReviewCollectionPreferences(storage).preferences, DEFAULT_REVIEW_COLLECTION_PREFERENCES, "invalid default");
  equal(isReviewCollectionPreferences({ schemaVersion: 2, grouping: "semantic", filter: "all" }), false, "wrong schema rejected");
  const unavailable: StorageLike = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); }, removeItem: () => undefined };
  equal(readReviewCollectionPreferences(unavailable).status, "unavailable", "unavailable defaults");
});

test("a dense production-shaped collection remains fully projected", () => {
  const prototypeCase = base.cases[0];
  const prototypeSummary = base.groups[0].cases[0];
  const groupIds = ["attention", "review", "ready", "reviewed"] as const;
  const cases = Array.from({ length: 500 }, (_, index) => ({
    ...prototypeCase,
    caseId: `synthetic-scale-${String(index).padStart(3, "0")}`,
    github: { ...prototypeCase.github, repository: `lintel/collection-${index}` },
    run: { ...prototypeCase.run!, createdAt: `2026-08-${String((index % 28) + 1).padStart(2, "0")}T12:00:00.000Z` },
  }));
  const groups = groupIds.map((groupId) => ({
    id: groupId,
    label: groupId,
    cases: cases.filter((_item, index) => groupIds[index % groupIds.length] === groupId).map((item) => ({
      ...prototypeSummary,
      caseId: item.caseId,
      title: `Long review title ${item.caseId} — ${"x".repeat(120)}`,
      repository: item.github.repository,
      groupId,
    })),
  }));
  const dense = { ...base, cases, groups };
  const result = project(dense);
  equal(result.rows.length, 500, "all dense rows project");
  deepEqual(result.groups.map((group) => group.groupId), [...groupIds], "all groups retain semantic order");
  equal(project(dense, "collection-42").rows.length, 11, "dense substring search stays deterministic");
});

test("current action registry is exactly six actions", () => {
  deepEqual(WORKSTATION_BOUND_ACTION_IDS, ["route/navigate", "route/apply", "queue/set-manual-preference", "queue/show-narrow-surface", "review/select", "mode/activate"], "six actions");
});

let passed = 0;
for (const item of tests) {
  try { item.run(); passed += 1; }
  catch (error) { process.stderr.write(`R6E validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`); process.exitCode = 1; break; }
}
if (passed === tests.length) process.stdout.write(`R6E validation: ${passed}/${tests.length} passed\n`);
