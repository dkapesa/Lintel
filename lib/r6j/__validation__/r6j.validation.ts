import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { R6D_BOUND_ACTION_IDS } from "../../r6d/controller-contract";
import { WORKSTATION_BOUND_ACTION_IDS } from "../../r6e/action-registry";
import { createCanonicalReviewRunManifest } from "../../canonical-review-run";
import { generateReport, type ReportInput } from "../../report-generator";
import { addReportToHistory, readReportHistory } from "../../report-history";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import { POST as fetchPublicPullRequest } from "../../../app/api/fetch-pr-diff/route";
import { POST as generateReportRoute } from "../../../app/api/generate-report/route";
import {
  createInitialWorkstationState,
  dispatchAction,
  formatRoute,
  indexReviews,
  reduceWorkstationState,
  reviewIdFromOpaqueToken,
  type WorkstationState,
} from "../../r6c/index";
import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import { projectComparisonContext, projectHistoryRegister } from "../index";

type Test = { name: string; run: () => void | Promise<void> };
const tests: Test[] = [];
const test = (name: string, run: () => void | Promise<void>): void => { tests.push({ name, run }); };
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function equal<T>(actual: T, expected: T, message: string): void { if (actual !== expected) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); }
function deepEqual(actual: unknown, expected: unknown, message: string): void { equal(JSON.stringify(actual), JSON.stringify(expected), message); }

const fixture = buildFixtureSnapshot("default");
assert(fixture.status === "ready", "ready fixture required");
const detail = fixture.cases.find((item) => item.history?.status === "comparison") ?? fixture.cases[0];
assert(detail, "case required");
const reviewId = reviewIdFromOpaqueToken("r6j-validation-review");
const context = { reviewIndex: indexReviews(fixture.cases, { reviewIdFor: () => reviewId }), cases: fixture.cases };
const selected: WorkstationState = {
  ...createInitialWorkstationState(), routePath: formatRoute({ destination: "reviews", reviewId, mode: "history" }),
  selectedReview: { status: "available", reviewId, currentCaseId: detail.caseId }, mode: "history", lastKnownCaseId: detail.caseId,
};

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

function reviewInput(pullRequestNumber?: number): ReportInput {
  return {
    title: "Public pull request reachability validation",
    repository: "lintel/validation-repository",
    technology: "TypeScript",
    diff: "diff --git a/src/reachability.ts b/src/reachability.ts\nindex 1111111..2222222 100644\n--- a/src/reachability.ts\n+++ b/src/reachability.ts\n@@ -1 +1 @@\n-export const status = 'old';\n+export const status = 'new';",
    inputSource: "github-pr",
    pullRequestNumber,
  };
}

function addCanonicalReport(storage: Storage, input: ReportInput, runId: string, headSha?: string) {
  const report = generateReport(input);
  const canonicalRun = createCanonicalReviewRunManifest({
    input,
    report,
    analysisSource: "deterministic",
    runId,
    pullRequestNumber: input.pullRequestNumber,
    baseSha: headSha ? "base-validation-sha" : undefined,
    headSha,
  });
  addReportToHistory(storage, report, "deterministic", canonicalRun);
  return { report, canonicalRun };
}

async function projectedHistory(storage: Storage, headSha: string) {
  const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: null });
  assert(snapshot.status === "ready", "real adapter projects browser-local reports");
  const detail = snapshot.cases.find((item) => item.github.headSha === headSha);
  assert(detail, "current report is present in the real adapter snapshot");
  return detail;
}

test("1. canonical comparison history projects a current row and ordered target rows", () => {
  const register = projectHistoryRegister(detail);
  if (detail.history?.status !== "comparison") { equal(register.status, "unavailable", "no-history fixture fails safely"); return; }
  assert(register.status === "ready", "comparison history projects");
  equal(register.current.kind, "current", "current row remains presentational");
  assert(register.targets.length > 0, "previous target is present");
  equal(register.targets[0]?.runId, detail.history.comparisons?.[0]?.target.runId ?? detail.history.previous.runId, "adapter order retained");
  assert(!JSON.stringify(register.current).includes(detail.run?.runId ?? "__not_present__"), "current display projection excludes run identity");
});

test("2. comparison action validates target membership, noops and clears", () => {
  if (detail.history?.status !== "comparison") return;
  const target = detail.history.previous.runId;
  const applied = dispatchAction(selected, { id: "history/set-comparison", runId: target }, context, { source: "visible-ui" });
  equal(applied.status, "applied", "valid target applies"); equal(applied.state.comparisonRunId, target, "run id is internal state only");
  equal(applied.routeEffect.kind, "none", "comparison does not navigate");
  const noop = dispatchAction(applied.state, { id: "history/set-comparison", runId: target }, context, { source: "visible-ui" });
  equal(noop.status, "noop", "same target noops");
  const unavailable = dispatchAction(applied.state, { id: "history/set-comparison", runId: "expired-run" }, context, { source: "visible-ui" });
  equal(unavailable.status, "unavailable", "expired target unavailable"); deepEqual(unavailable.state, applied.state, "invalid target retains full state");
  const cleared = dispatchAction(applied.state, { id: "history/set-comparison", runId: null }, context, { source: "visible-ui" });
  equal(cleared.state.comparisonRunId, null, "clear removes explicit selection");
});

test("3. effective comparison falls back only to canonical previous", () => {
  const projection = projectComparisonContext(detail, null);
  if (detail.history?.status !== "comparison") { equal(projection.status, "unavailable", "initial/unavailable history does not fabricate a comparison"); return; }
  assert(projection.status === "ready", "previous fallback projects");
  equal(projection.currentIdentity, "Current analysis", "current-to-historical direction retained");
  assert(projection.movement.some((item) => item.label === "Risk score"), "risk movement present");
  assert(projection.sections.every((section) => section.rows.every((row) => ["reopened", "added", "changed", "cleared"].includes(row.status))), "material status vocabulary and order retained");
});

test("4. reducer preserves comparison through mode changes and resets on Review switch", () => {
  const target = detail.history?.status === "comparison" ? detail.history.previous.runId : "run";
  const active = reduceWorkstationState(selected, { type: "comparison", runId: target });
  equal(reduceWorkstationState(active, { type: "mode", mode: "change", routePath: "/reviews/x/change" }).comparisonRunId, target, "mode switch preserves comparison");
  equal(reduceWorkstationState(active, { type: "review", reviewId, currentCaseId: detail.caseId, routePath: "/reviews/x/overview" }).comparisonRunId, null, "review switch resets comparison");
});

test("5. action registries remain deliberately bounded", () => {
  equal(WORKSTATION_BOUND_ACTION_IDS.length, 13, "production registry exactly thirteen");
  equal(WORKSTATION_BOUND_ACTION_IDS.at(-1), "overlay/close", "overlay close is last");
  equal(R6D_BOUND_ACTION_IDS.length, 4, "R6D registry remains four");
  for (const id of ["inspector/replace-context", "focus/set", "escape/unwind"]) assert(!WORKSTATION_BOUND_ACTION_IDS.includes(id as never), `${id} stays unbound`);
  for (const id of ["overlay/open", "overlay/close"]) assert(WORKSTATION_BOUND_ACTION_IDS.includes(id as never), `${id} is bound`);
});

test("6. UI has no temporal inspector, raw ids, Human Decision or unsupported controls", () => {
  const source = ["HistoryMode.tsx", "HistoryRow.tsx", "history.module.css"].map((file) => readFileSync(join(process.cwd(), "app", "(workstation)", file), "utf8")).join("\n");
  for (const forbidden of ["Inspector", "Human Decision", "inputFingerprint", "configurationFingerprint", "resultFingerprint", "innerHTML", "dangerouslySetInnerHTML", "Trigger", "Tools", "Duration"]) assert(!source.includes(forbidden), `forbidden history UI token absent: ${forbidden}`);
  assert(source.includes("type=\"button\"") && source.includes("aria-pressed"), "historical targets use native selected buttons");
});

test("7. public PR metadata, report identity and canonical head/base truth propagate through production routes", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith("https://api.github.com/repos/lintel/validation-repository/pulls/73")) {
      return new Response(JSON.stringify({
        title: "Validation PR",
        user: { login: "lintel" },
        state: "open",
        base: { ref: "main", sha: "base-public-sha" },
        head: { ref: "feature/reachability", sha: "head-public-sha" },
        changed_files: 1,
        additions: 1,
        deletions: 1,
      }), { headers: { "Content-Type": "application/json" } });
    }
    if (url === "https://github.com/lintel/validation-repository/pull/73.diff") {
      return new Response(reviewInput(73).diff, { status: 200 });
    }
    throw new Error(`Unexpected validation fetch: ${url}`);
  }) as typeof fetch;

  try {
    const importedResponse = await fetchPublicPullRequest(new Request("http://lintel.test/api/fetch-pr-diff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://github.com/lintel/validation-repository/pull/73" }),
    }));
    assert(importedResponse.ok, "public PR import succeeds without GitHub App configuration");
    const imported = await importedResponse.json() as { number: number; diff: string; baseSha?: string; headSha?: string; repository: string; title?: string };
    equal(imported.number, 73, "public PR number is retained");
    equal(imported.baseSha, "base-public-sha", "public PR base SHA is retained");
    equal(imported.headSha, "head-public-sha", "public PR head SHA is retained");

    const generatedResponse = await generateReportRoute(new Request("http://lintel.test/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...reviewInput(imported.number),
        title: imported.title ?? "Validation PR",
        repository: imported.repository,
        diff: imported.diff,
        analysisMode: "deterministic-only",
        sourceUrl: "https://github.com/lintel/validation-repository/pull/73",
        pullRequestNumber: imported.number,
        baseSha: imported.baseSha,
        headSha: imported.headSha,
      }),
    }));
    assert(generatedResponse.ok, "generate-report accepts genuine public PR metadata");
    const generated = await generatedResponse.json() as { report: { pr: { number: number } }; canonicalRun: { pullRequestNumber?: number; baseSha?: string; headSha?: string } };
    equal(generated.report.pr.number, 73, "generated report uses the real PR number");
    equal(generated.canonicalRun.pullRequestNumber, 73, "canonical run receives the real PR number");
    equal(generated.canonicalRun.baseSha, "base-public-sha", "canonical run receives the real base SHA");
    equal(generated.canonicalRun.headSha, "head-public-sha", "canonical run receives the real head SHA");

    const fallbackInput = reviewInput(73);
    const fallbackRun = createCanonicalReviewRunManifest({
      input: fallbackInput,
      report: generateReport(fallbackInput),
      analysisSource: "fallback",
      pullRequestNumber: 73,
      baseSha: "base-public-sha",
      headSha: "head-public-sha",
    });
    equal(fallbackRun.headSha, "head-public-sha", "client fallback retains the genuine head SHA");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("8. real adapter compares only positive same-PR browser-local runs and retains unavailable/raw-diff boundaries", async () => {
  const comparableStorage = new MemoryStorage();
  const input = reviewInput(73);
  addCanonicalReport(comparableStorage, input, "run-previous", "head-previous");
  addCanonicalReport(comparableStorage, input, "run-current", "head-current");
  const comparable = await projectedHistory(comparableStorage, "head-current");
  assert(comparable.history?.status === "comparison", "two same-repository, same-real-PR headed runs compare");
  equal(comparable.history.previous.runId, "run-previous", "canonical prior run is selected");

  const differentPrStorage = new MemoryStorage();
  addCanonicalReport(differentPrStorage, reviewInput(72), "run-pr-72", "head-pr-72");
  addCanonicalReport(differentPrStorage, reviewInput(73), "run-pr-73", "head-pr-73");
  const differentPr = await projectedHistory(differentPrStorage, "head-pr-73");
  equal(differentPr.history?.status, "initial", "different positive PR numbers never compare");

  const manualStorage = new MemoryStorage();
  const manualInput = reviewInput();
  addCanonicalReport(manualStorage, manualInput, "run-manual-previous", "head-manual-previous");
  addCanonicalReport(manualStorage, manualInput, "run-manual-current", "head-manual-current");
  const manual = await projectedHistory(manualStorage, "head-manual-current");
  equal(manual.github.pullRequestNumber, 0, "non-PR reports use the accepted zero sentinel");
  equal(manual.history?.status, "initial", "two PR-number-zero reports never compare");

  const missingHeadStorage = new MemoryStorage();
  addCanonicalReport(missingHeadStorage, input, "run-headed", "head-available");
  addCanonicalReport(missingHeadStorage, input, "run-no-head");
  const missingHeadSnapshot = await createRealWorkspaceAdapter(missingHeadStorage).loadSnapshot({ scenario: "default", reportId: null });
  assert(missingHeadSnapshot.status === "ready", "missing-head history still projects");
  const missingHead = missingHeadSnapshot.cases.find((item) => item.run?.runId === "run-no-head");
  assert(missingHead?.history?.status === "unavailable", "missing head remains truthfully unavailable");

  const rawStorage = new MemoryStorage();
  const rawReport = generateReport(input);
  rawReport.pr.title = "diff --git a/raw.ts b/raw.ts";
  addReportToHistory(rawStorage, rawReport, "deterministic");
  equal(readReportHistory(rawStorage).length, 0, "raw-diff rejection remains intact");
});

test("9. candidate scope and trust boundary are exact", () => {
  const modifiedExisting = [
    "app/(workstation)/ReviewModeUnavailable.tsx", "app/(workstation)/SelectedReviewFoundation.tsx", "app/api/fetch-pr-diff/route.ts", "app/api/generate-report/route.ts", "app/new/page.tsx",
    "lib/r6c/actions.ts", "lib/r6c/dispatch.ts", "lib/r6c/reducer.ts", "lib/r6e/__validation__/r6e.validation.ts", "lib/r6e/action-registry.ts", "lib/r6f/__validation__/r6f.validation.ts", "lib/r6g/__validation__/r6g.validation.ts", "lib/r6h/__validation__/r6h.validation.ts", "lib/r6i/__validation__/r6i.validation.ts", "lib/report-generator.ts", "lib/workspace-v2/real-adapter.ts",
  ].sort();
  const newPaths = [
    "app/(workstation)/HistoryMode.tsx", "app/(workstation)/HistoryRow.tsx", "app/(workstation)/history.module.css", "docs/r6/R6J_HISTORY_COMPARISON_READINESS_CANDIDATE.md", "evidence/r6j/R6J-1440-history-comparison-detail.png", "evidence/r6j/R6J-1440-history-default-comparison.png", "evidence/r6j/R6J-1440-history-initial.png", "evidence/r6j/R6J_VALIDATION_EVIDENCE.md", "lib/r6j/__validation__/r6j.validation.ts", "lib/r6j/comparison-context.ts", "lib/r6j/history-register.ts", "lib/r6j/index.ts", "lib/r6j/labels.ts",
  ].sort();
  equal(modifiedExisting.length, 16, "exactly sixteen modified existing paths");
  equal(newPaths.length, 13, "exactly thirteen new paths");
  for (const file of [...modifiedExisting, ...newPaths]) assert(readFileSync(join(process.cwd(), file)).length > 0, `${file} exists in the approved scope`);
  deepEqual(
    readdirSync(join(process.cwd(), "evidence", "r6j")).filter((file) => file.endsWith(".png")).sort(),
    ["R6J-1440-history-comparison-detail.png", "R6J-1440-history-default-comparison.png", "R6J-1440-history-initial.png"],
    "formal native PNG set is exactly three files",
  );
  assert(!readFileSync(join(process.cwd(), "app/api/fetch-pr-diff/route.ts"), "utf8").includes("github-app"), "public import does not add a GitHub App dependency");
});

let passed = 0;
for (const item of tests) { try { await item.run(); passed += 1; } catch (error) { process.stderr.write(`R6J validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`); process.exitCode = 1; break; } }
if (passed === tests.length) process.stdout.write(`R6J validation: ${passed}/${tests.length} grouped checks passed\n`);
