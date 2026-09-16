/* BS0.12-C1: additive characterization of adjudicated IR-F01..IR-F05.
 * EXECUTABLE observations exercise current production code with controlled
 * inputs. SOURCE_CONTRACT observations establish otherwise private wiring.
 * This file neither changes historical evidence nor attests external BS0.8
 * execution. Its passing status must never substitute for that execution log.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { generateReport, type ReportInput } from "../../report-generator";
import { createCanonicalReviewRunManifest } from "../../canonical-review-run";
import { REPORT_HISTORY_STORAGE_KEY } from "../../report-history";
import { REVIEW_STATE_STORAGE_KEY, defaultReviewState, readReviewStates, reviewStateKeyForReport, writeReviewState } from "../../review-state";
import { HUMAN_DECISION_LEDGER_STORAGE_KEY, appendHumanDecisionLedgerEntryToStorage, createEmptyHumanDecisionLedger, humanDecisionLedgerKeyForReport } from "../../human-decision-ledger";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import { createWorkspacePersistence } from "../../workspace-v2/persistence";
import { createWorkspaceDecisionService } from "../../workspace-v2/decision-mutations";

type Test = { name: string; run: () => void | Promise<void> };
const tests: Test[] = [];
const observations: string[] = [];
function test(name: string, run: Test["run"]) { tests.push({ name, run }); }
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function equal(actual: unknown, expected: unknown, message: string) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}
function note(group: string, evidence: "EXECUTABLE" | "SOURCE_CONTRACT" | "EVIDENCE_SCOPE", finding: string) {
  observations.push(`${group} ${evidence}: ${finding}`);
}
const workspace = process.cwd();
const tracked = new Set(execFileSync("git", ["ls-files"], { encoding: "utf8", cwd: workspace }).trim().split(/\r?\n/));
function source(path: string) {
  assert(tracked.has(path), `source evidence must be tracked: ${path}`);
  return readFileSync(join(workspace, path), "utf8").replace(/\r\n/g, "\n");
}
function section(text: string, start: string, end: string) {
  const from = text.indexOf(start); const to = text.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, `source section: ${start} -> ${end}`);
  return text.slice(from, to);
}
function contains(text: string, ...tokens: string[]) {
  for (const token of tokens) assert(text.includes(token), `source contract missing: ${token}`);
}
function nodes(root: ts.Node): ts.Node[] {
  const result: ts.Node[] = [];
  function visit(node: ts.Node) { result.push(node); ts.forEachChild(node, visit); }
  visit(root); return result;
}
function ast(path: string) { return ts.createSourceFile(path, source(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS); }
function calls(root: ts.Node, name: string) {
  return nodes(root).filter(ts.isCallExpression).filter(node => ts.isIdentifier(node.expression) && node.expression.text === name);
}

// These modes are adversarial injected dependencies, not observed native
// browser localStorage behavior. Only the selected key has fault behavior.
class InjectedStorage implements Storage {
  readonly values = new Map<string, string>();
  readonly sets: string[] = [];
  mode: "normal" | "ignore" | "reject-before" | "set-then-throw" = "normal";
  faultKey = REVIEW_STATE_STORAGE_KEY;
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) {
    this.sets.push(key);
    const mode = key === this.faultKey ? this.mode : "normal";
    if (mode === "reject-before") throw new Error("C1 injected reject before set");
    if (mode !== "ignore") this.values.set(key, value);
    if (mode === "set-then-throw") throw new Error("C1 injected set then throw");
  }
}
const input: ReportInput = {
  title: "Correction boundary", repository: "lintel/bs0-c1", technology: "TypeScript",
  inputSource: "github-pr", pullRequestNumber: 73, reviewProfile: "standard",
  diff: "diff --git a/docs/note.md b/docs/note.md\n--- a/docs/note.md\n+++ b/docs/note.md\n@@ -1 +1 @@\n-old note\n+new note",
};
const report = generateReport(input);
report.verdict = { ...report.verdict, riskScore: 10, recommendation: "REVIEW_REQUIRED", riskLevel: "MEDIUM" };
report.changedFiles = []; report.findings = []; report.missingTests = [];
report.suggestedTests = []; report.reviewerChecklist = []; report.conditionsBeforeMerge = [];
const previousAt = "2026-09-15T10:00:00.000Z";
const currentAt = "2026-09-15T10:01:00.000Z";
const manifest = createCanonicalReviewRunManifest({ input, report, sourceType: "github-app", analysisSource: "deterministic", runId: "bs0-c1-previous", headSha: "head-c1", baseSha: "base-c1", pullRequestNumber: 73, createdAt: previousAt });
const entry = { report, source: "deterministic", canonicalRun: manifest, createdAt: previousAt };
const caseId = `report-${previousAt}`;
function seeded() {
  const storage = new InjectedStorage();
  storage.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([entry]));
  return storage;
}
const facts = { risk: false, manifest: false, replay: false, storage: false, terminology: false, appBoundary: false };

test("C1 — IR-F01 risk-score polarity through real Workspace adapter", async () => {
  const currentReport = structuredClone(report); currentReport.verdict.riskScore = 20;
  const currentManifest = createCanonicalReviewRunManifest({ input, report: currentReport, sourceType: "github-app", analysisSource: "deterministic", runId: "bs0-c1-current", previousRunId: manifest.runId, headSha: "head-c1", baseSha: "base-c1", pullRequestNumber: 73, createdAt: currentAt });
  const storage = seeded();
  storage.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([{ ...entry, report: currentReport, canonicalRun: currentManifest, createdAt: currentAt }, entry]));
  const before = [...storage.values];
  const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: `report-${currentAt}` });
  assert(snapshot.status === "ready", "real adapter must project controlled Reports");
  const detail = snapshot.cases.find(item => item.caseId === `report-${currentAt}`);
  assert(detail?.readiness.available && detail.history?.status === "comparison", "applicable real comparison exists");
  const result = detail.readiness.readiness;
  equal(result.previousScore, report.verdict.riskScore, "previous score originates from Report risk");
  equal(result.currentScore, currentReport.verdict.riskScore, "current score originates from Report risk");
  equal(result.scoreChange, 10, "risk 10 -> 20"); equal(result.classification, "improved", "legacy numeric direction");
  equal(result.clearedCount, 0, "no cleared conditions"); equal(result.openedCount, 0, "no opened conditions");
  equal(detail.history.changes, [], "no finding, evidence, test-gap or condition diff rows");
  const { riskScore: previousRisk, ...previousVerdict } = report.verdict;
  const { riskScore: currentRisk, ...currentVerdict } = currentReport.verdict;
  assert(previousRisk < currentRisk, "current Report risk is greater");
  equal(previousVerdict, currentVerdict, "other verdict dimensions fixed");
  equal({ ...report, verdict: previousVerdict }, { ...currentReport, verdict: currentVerdict }, "all other Report dimensions fixed");
  assert(result.note?.includes("Risk score 10 to 20."), "adapter identifies risk source in returned note");
  equal([...storage.values], before, "adapter remains read-only");
  facts.risk = true;
  note("C1", "EXECUTABLE", `createRealWorkspaceAdapter.loadSnapshot -> internal analysisRun/historyForProjection -> createReadinessDelta/createReviewDiff: ${JSON.stringify(result)}. readinessScore naming does not change the Report.verdict.riskScore source. Increasing risk can contribute to legacy improved; this label cannot be migrated as proposition-level verification improvement without interpreting contributing dimensions and polarity. Risk is not the only contributor; this does not assert every improved classification is wrong.`);
});

test("C2A — IR-F02 generation-time manifest exact", () => {
  const built = createCanonicalReviewRunManifest({ input, report, sourceType: "github-app", analysisSource: "deterministic", headSha: "head-c1", createdAt: previousAt });
  equal(built.reproducibility, "exact", "manifest builder assigns exact at generation");
  assert(!("verifications" in built), "manifest is not an executed verification collection");
  const tree = ast("lib/canonical-review-run.ts");
  const builder = tree.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === "createCanonicalReviewRunManifest");
  assert(builder && ts.isFunctionDeclaration(builder) && builder.body, "manifest builder exists");
  assert(!builder.modifiers?.some(node => node.kind === ts.SyntaxKind.AsyncKeyword), "builder is synchronous");
  equal(calls(builder.body, "defaultReproducibility").length, 1, "generation invokes default classification");
  equal(calls(builder.body, "addRunVerification").length, 0, "generation performs no verification persistence");
  facts.manifest = true;
  note("C2A", "EXECUTABLE", "createCanonicalReviewRunManifest assigns reproducibility exact for github-app/deterministic at generation; this invocation executes no replay operation and manufactures no replay record.");
  note("C2A", "SOURCE_CONTRACT", "lib/canonical-review-run.ts: synchronous manifest builder calls defaultReproducibility, not addRunVerification. Manifest reproducibility exact != replay was executed.");
});

test("C2B — IR-F02 separate executed replay authority and bounded comparisons", () => {
  const path = "app/api/github-app/route.ts"; const tree = ast(path);
  const branch = nodes(tree).filter(ts.isIfStatement).find(node => node.expression.getText(tree) === 'record.action === "verify-run"');
  assert(branch && ts.isBlock(branch.thenStatement), "private verify-run branch exists");
  const body = branch.thenStatement; const text = body.getText(tree);
  contains(text, "const store = await readGitHubAppStore()", "pullRequest?.analysisRuns?.find", "if (!pullRequest || !run)", "if (!sourceMatched)", "configurationMatched && resultMatched ? \"exact\" : \"drift-detected\"");
  const comparisons = nodes(body).filter(ts.isBinaryExpression).filter(node => node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken && /run\.(headSha|canonicalRun\.)/.test(node.getText(tree))).map(node => node.getText(tree));
  equal(comparisons, ["metadata.head?.sha === run.headSha", "configurationFingerprint === run.canonicalRun.configurationFingerprint", "reproducedManifest.resultFingerprint === run.canonicalRun.resultFingerprint"], "bounded replay comparison set");
  for (const [name, module] of [["generateReport", "../../../lib/report-generator"], ["createCanonicalReviewRunManifest", "../../../lib/canonical-review-run"], ["reviewConfigurationFingerprint", "../../../lib/canonical-review-run"]]) {
    const imported = tree.statements.filter(ts.isImportDeclaration).find(node => ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === module && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) && node.importClause.namedBindings.elements.some(element => element.name.text === name));
    assert(imported, `${name} is statically imported from current ${module}`);
    equal(calls(body, name).length, 1, `current ${name} called once`);
  }
  assert(!/run\.canonicalRun\.(generatorVersion|deterministicRulesetVersion|reportSchemaVersion|inputFingerprint|evidenceHierarchy|builderVerifier|mergeContract)/.test(text), "branch does not dispatch historical implementation or compare these broader bases");
  const save = calls(body, "addRunVerification"); equal(save.length, 1, "separate verification persisted once");
  equal(save[0].arguments.map(arg => arg.getText(tree)), ["pullRequestId", "runId", "verification"], "verification persistence arguments");
  assert(save[0].getStart(tree) > calls(body, "createCanonicalReviewRunManifest")[0].getStart(tree), "verification stored after replay construction");
  contains(text, "jsonResponse({ verification, verifications: updated.verifications ?? [] })");
  const store = section(source("lib/github-app-store.ts"), "export async function addRunVerification", "export async function addRunContractRecheck");
  contains(store, "return updateStore", "run.verifications = [verification, ...(run.verifications ?? [])].slice(0, 20)");
  assert(!store.includes("run.canonicalRun ="), "verification does not replace generation manifest");
  facts.replay = true;
  note("C2B", "SOURCE_CONTRACT", "app/api/github-app/route.ts verify-run reads an existing run, checks current head, declared configuration fingerprint and Report-result fingerprint, invokes statically imported current builders, then separately persists/returns a CanonicalRunVerificationRecord via lib/github-app-store.ts addRunVerification. No HTTP/GitHub replay executed here. Executed replay exact != complete historical verification-basis reproduction.");
});

test("C3 — IR-F03 injected Storage conditional service behavior", async () => {
  for (const mode of ["ignore", "reject-before", "set-then-throw"] as const) {
    const storage = seeded(); const key = reviewStateKeyForReport(report);
    writeReviewState(storage, key, { ...defaultReviewState(report), status: "Review required" });
    const before = storage.getItem(REVIEW_STATE_STORAGE_KEY); storage.sets.length = 0; storage.mode = mode;
    const result = createWorkspacePersistence(storage).applyReviewStatus({ kind: "review-status", caseId, status: "Reviewed" });
    equal(result.outcome, mode === "ignore" ? "verification-mismatch" : "failed", `${mode} structured outcome`);
    equal(storage.sets, [REVIEW_STATE_STORAGE_KEY], `${mode} attempted production write`);
    equal(storage.getItem(REVIEW_STATE_STORAGE_KEY) === before, mode !== "set-then-throw", `${mode} authoritative byte preservation`);
    const stored = readReviewStates(storage)[key];
    equal(stored.status, mode === "set-then-throw" ? "Reviewed" : "Review required", `${mode} production read-back status`);
    const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: caseId });
    assert(snapshot.status === "ready", `${mode} stored Report remains projectable`);
    equal(snapshot.cases[0].reviewStatus, stored.status, `${mode} projection follows stored state`);
    note("C3", "EXECUTABLE", `Injected ${mode}: createWorkspacePersistence.applyReviewStatus -> ${JSON.stringify(result)}; readReviewStates and real adapter project ${stored.status}; prior bytes preserved=${storage.getItem(REVIEW_STATE_STORAGE_KEY) === before}.`);
  }
  facts.storage = true;
  note("C3", "EVIDENCE_SCOPE", "These observations establish production behavior conditional on supplied Storage behavior. No native browser window.localStorage was used or observed: silent successful-write loss, successful mutation followed by throw, and native failure frequency are NOT established. FAILED != ROLLED BACK remains supported by the conditional set-then-throw case; this scope correction does not remove independently established App rename/destination-write, read-back mismatch, saved-but-refresh-failed or publishing/persistence mismatch evidence.");
});

test("C4 — IR-F05 thrown failure versus structured returned failure", () => {
  const helper = seeded(); helper.faultKey = HUMAN_DECISION_LEDGER_STORAGE_KEY; helper.mode = "reject-before";
  const context = { report, canonicalRun: manifest, currentHeadSha: "head-c1" };
  let returned = false; let thrown: unknown;
  try {
    appendHumanDecisionLedgerEntryToStorage(helper, humanDecisionLedgerKeyForReport(report), createEmptyHumanDecisionLedger(context), context, { eventType: "decision-recorded", outcome: "approve", reason: "Correction fixture" });
    returned = true;
  } catch (error) { thrown = error; }
  assert(!returned && thrown instanceof Error && thrown.message === "C1 injected reject before set", "production ledger helper throws failure without returned result");
  assert(!helper.values.has(HUMAN_DECISION_LEDGER_STORAGE_KEY), "pre-write rejection leaves absent ledger");
  const service = seeded(); service.faultKey = HUMAN_DECISION_LEDGER_STORAGE_KEY; service.mode = "reject-before";
  const result = createWorkspaceDecisionService(service).recordDecision({ kind: "record", caseId, expectedHeadSha: "head-c1", outcome: "approve", rationale: "Correction fixture", references: [], acceptedRiskReferences: [] });
  equal(result.outcome, "failed", "decision service returns structured failure");
  const historical = source("lib/bs0/__validation__/failure-state.validation.ts");
  const fs6 = section(historical, 'test("FS6 -', 'test("FS7 -');
  contains(historical, '"explicit failure"');
  contains(fs6, '"ledger append write throws"', 'observe("Ledger helper",', 'observe("Decision service",');
  const tree = ast("lib/bs0/__validation__/failure-state.validation.ts");
  for (const [row, expected] of [["Ledger helper", "NO"], ["Decision service", "YES"]]) {
    const observed = calls(tree, "observe").find(call => ts.isStringLiteral(call.arguments[0]) && call.arguments[0].text === row);
    assert(observed && ts.isObjectLiteralExpression(observed.arguments[1]), `historical observation for ${row}`);
    const cell = observed.arguments[1].properties.find(prop => ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.name) && prop.name.text === "explicit failure");
    assert(cell && ts.isPropertyAssignment(cell) && ts.isStringLiteral(cell.initializer), `historical failure cell for ${row}`);
    equal(cell.initializer.text, expected, `historical ${row} explicit failure`);
  }
  facts.terminology = true;
  note("C4", "EXECUTABLE", `Ledger append throws ${thrown.message}; decision service returns ${JSON.stringify(result)} for injected pre-write rejection. Thrown/rejected failure signals differ from structured returned failure results.`);
  note("C4", "SOURCE_CONTRACT", "Accepted BS0.10 FS6 both executes ledger append throws and records Ledger helper explicit failure NO, while Decision service is YES. The label is ambiguous if read as any failure signal. Structured returned failure is a supported distinction for these characterized surfaces, not a claim about the author's universal intended meaning. Future readers must interpret or relabel the column before relying on migration semantics; NO must not mean cannot fail.");
});

test("C5 — IR-F04 external BS0.8 execution evidence boundary", () => {
  const tree = ast("lib/bs0/__validation__/github-app.validation.ts");
  equal(calls(tree, "test").length, 16, "unchanged BS0.8 has sixteen groups");
  const loops = nodes(tree).filter(ts.isForOfStatement);
  const runner = loops.find(loop => loop.expression.getText(tree) === "tests");
  assert(runner, "BS0.8 runner loops over tests");
  contains(runner.statement.getText(tree), "await item.run()", "process.exitCode = 1", "break;");
  contains(source("lib/bs0/__validation__/github-app.validation.ts"), "} finally {", "process.chdir(WORKSPACE)", "await rm(resolvedForRemoval, { recursive: true, force: true })");
  facts.appBoundary = true;
  note("C5", "SOURCE_CONTRACT", "BS0.8 has sixteen serial awaited groups, stops on failure, and cleans its generated OS-temp root in finally. This validator does not execute BS0.8 or assert its external outcome. App executable status: NOT ESTABLISHED BY THIS VALIDATOR; consult this producer task's per-process execution/EPERM log. An absent path after finally cannot establish the cause of an earlier rename failure. No environmental cause is encoded as product semantics.");
});

test("C6 — correction-boundary synthesis from preceding observations", () => {
  for (const [name, established] of Object.entries(facts)) assert(established, `preceding correction evidence required: ${name}`);
  note("C6", "EVIDENCE_SCOPE", "Temporal: legacy improved can include adverse Report risk-score movement and is not itself verification-improvement truth. Replay: generation manifest exact and executed replay exact are separate authorities with bounded scope. Storage: adversarial injected fixtures establish conditional service behavior, not observed native-browser failure behavior/frequency. Terminology: thrown/rejected failures and structured returned failures remain distinguishable. App execution: external evidence must be reported separately; a C1 pass cannot close IR-F04. IR-F01 extends MR-06; IR-F02 extends MR-09; IR-F03 qualifies MR-11; IR-F04 concerns independent execution closure; IR-F05 clarifies the historical matrix. No ledger update or new migration risk is made here.");
});

let passed = 0;
for (const item of tests) {
  try { await item.run(); passed++; process.stdout.write(`PASS ${item.name}\n`); }
  catch (error) {
    process.stderr.write(`BS0.12-C1 correction validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1; break;
  }
}
if (passed === tests.length) {
  process.stdout.write(`BS0.12-C1 correction validation: ${passed}/${tests.length} grouped checks passed\n`);
  for (const observation of observations) process.stdout.write(`${observation}\n`);
}
