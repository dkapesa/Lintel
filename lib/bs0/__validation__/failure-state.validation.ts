/* BS0.10: CURRENT failure semantics only. No HTTP/React/provider execution.
 * Every observation carries EXECUTABLE or SOURCE-CONTRACT evidence. Matrix
 * cells begin UNKNOWN; expectations are separate from observation collection.
 * File-system fixtures live strictly under a generated OS-temp root.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { generateReport, type ReportInput } from "../../report-generator";
import { normaliseReport } from "../../report-normalizer";
import { createCanonicalReviewRunManifest } from "../../canonical-review-run";
import { REPORT_HISTORY_STORAGE_KEY, readReportHistory, MAX_REPORT_HISTORY } from "../../report-history";
import { REVIEW_STATE_STORAGE_KEY, readReviewStates, reviewStateKeyForReport, writeReviewState, defaultReviewState } from "../../review-state";
import { CONDITION_PROGRESS_STORAGE_KEY, conditionKey, reportConditions, readConditionProgress, writeConditionProgress } from "../../condition-progress";
import { HUMAN_DECISION_LEDGER_STORAGE_KEY, humanDecisionLedgerKeyForReport, readHumanDecisionLedger, createEmptyHumanDecisionLedger, appendHumanDecisionLedgerEntryToStorage, writeHumanDecisionLedger } from "../../human-decision-ledger";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import { createWorkspacePersistence } from "../../workspace-v2/persistence";
import { createWorkspaceDecisionService, ledgerIntegrityForKey, type RecordDecisionCommand } from "../../workspace-v2/decision-mutations";
import { HumanDecisionDraftStore, createEmptyHumanDecisionDraft } from "../../r6k/index";
import { HUMAN_DECISION_DRAFT_STORAGE_KEY } from "../../r6c/human-decision-draft-boundary";
import { reviewIdFromOpaqueToken, decisionSubjectIdFromCapability, type DecisionDraftContext } from "../../r6c/index";
import type { GitHubWebhookEnvelope } from "../../github-app-store";

type Evidence = "EXECUTABLE" | "SOURCE-CONTRACT";
type Cell = "YES" | "NO" | "NOT_APPLICABLE" | "UNKNOWN";
const columns = ["absent distinguishable", "malformed distinguishable", "unavailable distinguishable", "explicit failure", "fallback", "partial preserved", "pre-write rejection preserves prior state", "reported failure can occur after authoritative mutation", "collapse to empty/default", "retry possible"] as const;
const matrixSemantics = "Each column has one fixed meaning over the characterized surface. YES establishes an observed/source-proved path; NO requires affirmative evidence of non-occurrence within the characterized scope, never a lack of observation. Pre-write preservation YES means a characterized rejection before authoritative mutation preserved prior authoritative state; post-mutation failure YES means failure was returned/thrown after authoritative state changed. Neither cell asserts universal rollback safety. UNKNOWN marks unestablished properties; NOT_APPLICABLE marks non-mutating surfaces. Retry means structural reuse after restoration, not automatic retry.";
type Column = typeof columns[number];
const rows = ["Report history", "Real adapter", "Session handoff", "Review persistence", "Condition persistence", "Ledger helper", "Decision service", "Draft store", "Model assist", "Generate API", "Public PR API", "Connected GitHub API", "App analysis", "App persistence", "Comment publishing"] as const;
type Row = typeof rows[number];
const matrix = Object.fromEntries(rows.map(row => [row, Object.fromEntries(columns.map(col => [col, "UNKNOWN"]))])) as Record<Row, Record<Column, Cell>>;
const observations: { fs: number; evidence: Evidence; finding: string; production: string }[] = [];
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function equal(actual: unknown, expected: unknown, message: string) { assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
function throws(run: () => unknown, message: string) { let caught = false; try { run(); } catch { caught = true; } assert(caught, message); }
async function rejects(run: () => Promise<unknown>, message: string) { let caught = false; try { await run(); } catch { caught = true; } assert(caught, message); }
function note(fs: number, evidence: Evidence, finding: string, production: string) { observations.push({ fs, evidence, finding, production }); }
function observe(row: Row, values: Partial<Record<Column, Exclude<Cell, "UNKNOWN">>>) {
  for (const [key, value] of Object.entries(values)) {
    const col = key as Column;
    assert(matrix[row][col] === "UNKNOWN" || matrix[row][col] === value, `conflicting observation: ${row}/${col}`);
    matrix[row][col] = value!;
  }
}
const tests: { name: string; run: () => void | Promise<void> }[] = [];
function test(name: string, run: () => void | Promise<void>) { tests.push({ name, run }); }
const WORKSPACE = process.cwd();
const tracked = new Set(execFileSync("git", ["ls-files"], { cwd: WORKSPACE, encoding: "utf8" }).trim().split(/\r?\n/));
function source(path: string) { assert(tracked.has(path), `evidence must be tracked: ${path}`); return readFileSync(join(WORKSPACE, path), "utf8").replace(/\r\n/g, "\n"); }
function section(text: string, start: string, end?: string) {
  const begin = text.indexOf(start); assert(begin >= 0, `source start: ${start}`);
  const finish = end === undefined ? text.length : text.indexOf(end, begin + start.length);
  assert(finish > begin, `source end: ${end}`); return text.slice(begin, finish);
}
function contains(text: string, ...tokens: string[]) { for (const token of tokens) assert(text.includes(token), `source contract missing: ${token}`); }
function ordered(text: string, ...tokens: string[]) { let offset = -1; for (const token of tokens) { offset = text.indexOf(token, offset + 1); assert(offset >= 0, `source order missing: ${token}`); } }
const paths = {
  history: "lib/report-history.ts", adapter: "lib/workspace-v2/real-adapter.ts", workflow: "lib/workspace-v2/persistence.ts",
  ledger: "lib/human-decision-ledger.ts", decisions: "lib/workspace-v2/decision-mutations.ts", draft: "lib/r6k/decision-draft.ts",
  generator: "lib/report-generator.ts", normalizer: "lib/report-normalizer.ts", report: "app/report/page.tsx",
  generate: "app/api/generate-report/route.ts", public: "app/api/fetch-pr-diff/route.ts", connected: "app/api/github-workspace/route.ts",
  store: "lib/github-app-store.ts", webhook: "app/api/github-app/webhook/route.ts", comments: "lib/github-app-comments.ts", auth: "lib/github-app-auth.ts",
} as const;
const sources = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, source(path)])) as Record<keyof typeof paths, string>;

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  readonly writes: string[] = []; readonly removals: string[] = [];
  failGet = new Set<string>(); failSet = new Set<string>(); failRemove = new Set<string>();
  ignoreSet = new Set<string>(); setThenThrow = new Set<string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { if (this.failGet.has(key) || this.failGet.has("*")) throw new Error("controlled read failure"); return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.removals.push(key); if (this.failRemove.has(key) || this.failRemove.has("*")) throw new Error("controlled remove failure"); this.values.delete(key); }
  setItem(key: string, value: string) {
    this.writes.push(key); if (this.failSet.has(key) || this.failSet.has("*")) throw new Error("controlled write failure");
    if (!this.ignoreSet.has(key)) this.values.set(key, value);
    if (this.setThenThrow.has(key)) throw new Error("controlled post-write failure");
  }
}
const input: ReportInput = { title: "Failure fixtures", repository: "lintel/bs0-failure", technology: "TypeScript", inputSource: "github-pr", pullRequestNumber: 1010, diff: "diff --git a/src/payments.ts b/src/payments.ts\n--- a/src/payments.ts\n+++ b/src/payments.ts\n@@ -1 +1 @@\n-export const charge = once;\n+export const charge = retryPaymentWithoutIdempotency;", reviewProfile: "standard" };
const report = generateReport(input);
const CREATED = "2026-09-15T10:00:00.000Z";
const canonicalRun = createCanonicalReviewRunManifest({ input, report, analysisSource: "deterministic", sourceType: "github-pr", runId: "bs0-failure-run", pullRequestNumber: 1010, baseSha: "base-fs", headSha: "head-fs", createdAt: CREATED, completedAt: CREATED });
const entry = { report, source: "deterministic", canonicalRun, createdAt: CREATED };
const caseId = `report-${CREATED}`;
const ledgerKey = humanDecisionLedgerKeyForReport(report);
const context = { report, canonicalRun, currentHeadSha: "head-fs" };
const command: RecordDecisionCommand = { kind: "record", caseId, expectedHeadSha: "head-fs", outcome: "approve", rationale: "Failure-specific fixture", references: [], acceptedRiskReferences: [] };
function seeded() { const storage = new MemoryStorage(); storage.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([entry])); return storage; }
function bytes(storage: MemoryStorage) { return [...storage.values]; }
async function snapshot(storage: Storage, reportId: string | null = null) { return createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId }); }

test("FS1 - tracked failure surface discovery", () => {
  const surfaces: [keyof typeof paths, string, string[]][] = [
    ["history", "readReportHistory", ["catch {", "storage.removeItem(REPORT_HISTORY_STORAGE_KEY)"]],
    ["adapter", "createRealWorkspaceAdapter", ["preflightHistory", "unavailableSnapshot", "emptySnapshot"]],
    ["workflow", "createWorkspacePersistence", ['| "failed"', '| "verification-mismatch"']],
    ["decisions", "createWorkspaceDecisionService", ["ledgerIntegrityForKey", '| "stale-command"', '| "persisted-refresh-failed"']],
    ["draft", "HumanDecisionDraftStore", ['"store-unreadable"', '"storage-unavailable"', '"quarantined"']],
    ["generate", "POST/generateWithOpenAI", ["if (!response.ok) return null", '"fallback"', 'state: configured ? "configured" : "unavailable"']],
    ["public", "POST/fetchPullRequestMetadata", ["Invalid JSON request.", "return {};", "response.status === 404"]],
    ["connected", "GET/POST/githubError", ["Unsupported GitHub workspace action.", "malformed pull request metadata", "GitHub did not respond in time."]],
    ["store", "updateStore/failPullRequestAnalysis/failCommentPublishing", ["await rename(tempPath, STORE_PATH)", 'record.state = "failed"', 'record.commentPublishingState = "failed"']],
    ["auth", "createInstallationToken/installationFetchError", ['"installation_token_failure"', '"github_unavailable"']],
    ["comments", "publishGitHubDecisionComment", ['ok: false', '"comment_publish_failure"']],
  ];
  for (const [key, fn, tokens] of surfaces) { contains(sources[key], ...tokens); note(1, "SOURCE-CONTRACT", `Tracked failure surface: ${fn}`, paths[key]); }
  assert(Object.values(matrix).every(row => Object.values(row).every(cell => cell === "UNKNOWN")), "no prefilled matrix conclusions");
});

test("FS2 - report-history parsing, pruning, cleanup and storage failures", () => {
  const absent = new MemoryStorage(); equal(readReportHistory(absent), [], "absent"); equal(absent.removals, [], "absent no cleanup");
  const empty = new MemoryStorage(); empty.values.set(REPORT_HISTORY_STORAGE_KEY, "[]"); equal(readReportHistory(empty), [], "valid empty"); equal(empty.getItem(REPORT_HISTORY_STORAGE_KEY), "[]", "empty retained");
  for (const raw of ["{", "{}", "null"]) { const storage = new MemoryStorage(); storage.values.set(REPORT_HISTORY_STORAGE_KEY, raw); equal(readReportHistory(storage), [], "malformed/unsupported collapse"); equal(storage.getItem(REPORT_HISTORY_STORAGE_KEY), null, "key removed"); }
  const invalid = new MemoryStorage(); invalid.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([null, {}, { ...entry, source: "unsupported" }])); equal(readReportHistory(invalid), [], "bad entries dropped"); equal(invalid.getItem(REPORT_HISTORY_STORAGE_KEY), "[]", "invalid array rewritten empty");
  const mixed = seeded(); mixed.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([entry, null, { ...entry, report: { ...report, missingTests: null } }]));
  equal(readReportHistory(mixed).length, 1, "valid survives beside invalid"); equal(JSON.parse(mixed.getItem(REPORT_HISTORY_STORAGE_KEY)!).length, 1, "mixed normalized persisted");
  const unchanged = seeded(); const original = unchanged.getItem(REPORT_HISTORY_STORAGE_KEY); equal(readReportHistory(unchanged).length, 1, "valid retained"); equal(unchanged.getItem(REPORT_HISTORY_STORAGE_KEY), original, "same-count normalization not rewritten"); equal(unchanged.writes, [], "no write just for metadata normalization");
  const overflow = new MemoryStorage(); overflow.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify(Array.from({ length: MAX_REPORT_HISTORY + 1 }, (_, i) => ({ ...entry, createdAt: new Date(Date.parse(CREATED) + i).toISOString() })))); equal(readReportHistory(overflow).length, MAX_REPORT_HISTORY, "prune result"); equal(JSON.parse(overflow.getItem(REPORT_HISTORY_STORAGE_KEY)!).length, MAX_REPORT_HISTORY, "prune rewrite");
  const readFailure = seeded(); readFailure.failGet.add(REPORT_HISTORY_STORAGE_KEY); equal(readReportHistory(readFailure), [], "read failure collapse"); assert(!readFailure.values.has(REPORT_HISTORY_STORAGE_KEY), "read failure removes previously valid bytes");
  const writeFailure = seeded(); writeFailure.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([entry, null])); writeFailure.failSet.add(REPORT_HISTORY_STORAGE_KEY); equal(readReportHistory(writeFailure), [], "normalization write failure discards returned partial"); assert(!writeFailure.values.has(REPORT_HISTORY_STORAGE_KEY), "failed normalization removes key");
  const pruneFailure = new MemoryStorage(); pruneFailure.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify(Array.from({ length: MAX_REPORT_HISTORY + 1 }, (_, i) => ({ ...entry, createdAt: new Date(Date.parse(CREATED) + i).toISOString() })))); pruneFailure.failSet.add(REPORT_HISTORY_STORAGE_KEY); equal(readReportHistory(pruneFailure), [], "all-valid overflow pruning write failure collapses"); equal(pruneFailure.values.has(REPORT_HISTORY_STORAGE_KEY), false, "failed overflow rewrite removes all prior bytes");
  const cleanupFailure = seeded(); cleanupFailure.values.set(REPORT_HISTORY_STORAGE_KEY, "{"); cleanupFailure.failRemove.add(REPORT_HISTORY_STORAGE_KEY); throws(() => readReportHistory(cleanupFailure), "cleanup throw propagates"); equal(cleanupFailure.values.get(REPORT_HISTORY_STORAGE_KEY), "{", "failed cleanup preserves corrupt bytes");
  cleanupFailure.failGet.add(REPORT_HISTORY_STORAGE_KEY); throws(() => readReportHistory(cleanupFailure), "get+remove unavailable throws");
  note(2, "EXECUTABLE", "Absent and successful empty both return []; parse/shape errors remove key; bad array entries drop and rewrite; valid partial survives only if normalization succeeds; get/set errors also clean up and return []; remove error escapes. Same-count normalized metadata does not rewrite bytes.", `${paths.history}: readReportHistory`);
  // The rejected cleanup removeItem preserves prior bytes. In contrast, the
  // rejected normalization setItem triggers a successful destructive cleanup.
  // Those collapsed reads do not establish an explicit post-mutation failure.
  observe("Report history", { "absent distinguishable": "NO", "malformed distinguishable": "NO", "unavailable distinguishable": "NO", "explicit failure": "NO", "partial preserved": "YES", "pre-write rejection preserves prior state": "YES", "collapse to empty/default": "YES", "retry possible": "YES" });
});

test("FS3 - real adapter unavailable versus empty and associated degradation", async () => {
  for (const raw of [null, "[]"]) { const storage = new MemoryStorage(); if (raw !== null) storage.values.set(REPORT_HISTORY_STORAGE_KEY, raw); equal((await snapshot(storage)).status, "empty", "absent/empty adapter"); equal((await snapshot(storage, "missing")).status, "empty", "empty preflight precedes requested-id check"); }
  for (const raw of ["{", "{}", "[null]", "[{}]"]) { const storage = new MemoryStorage(); storage.values.set(REPORT_HISTORY_STORAGE_KEY, raw); const before = bytes(storage); equal((await snapshot(storage)).status, "unavailable", "malformed/no usable report unavailable"); equal(bytes(storage), before, "adapter read-only preserves bytes"); }
  const missing = seeded(); equal((await snapshot(missing, "missing")).status, "unavailable", "missing explicit report no substitute");
  const readFailure = seeded(); readFailure.failGet.add("*"); const before = bytes(readFailure); equal((await snapshot(readFailure)).status, "unavailable", "underlying failure unavailable"); equal(bytes(readFailure), before, "adapter failure read-only");
  const partial = seeded(); const partialResult = await snapshot(partial); assert(partialResult.status === "ready", "missing associated stores still ready"); equal(partialResult.cases[0].decision.status, "empty", "absent ledger empty decision");
  for (const raw of ["{", "[]"]) { const storage = seeded(); storage.values.set(REVIEW_STATE_STORAGE_KEY, raw); storage.values.set(CONDITION_PROGRESS_STORAGE_KEY, raw); storage.values.set(HUMAN_DECISION_LEDGER_STORAGE_KEY, raw); const prior = bytes(storage); const result = await snapshot(storage); assert(result.status === "ready", "associated malformed preserves known report"); equal(result.cases.length, 1, "known case survives"); equal(result.cases[0].decision.status, "unavailable", "malformed ledger decision unavailable"); assert(result.limitations?.some(item => item.includes("Recorded review state could not be read")), "review failure limitation"); equal(bytes(storage), prior, "associated corrupt bytes untouched"); }
  for (const key of [REVIEW_STATE_STORAGE_KEY, CONDITION_PROGRESS_STORAGE_KEY, HUMAN_DECISION_LEDGER_STORAGE_KEY]) { const storage = seeded(); storage.failGet.add(key); const result = await snapshot(storage); assert(result.status === "ready", `associated read failure retains report: ${key}`); if (key === HUMAN_DECISION_LEDGER_STORAGE_KEY) equal(result.cases[0].decision.status, "unavailable", "ledger read failure explicit"); if (key === REVIEW_STATE_STORAGE_KEY) assert(result.limitations?.some(item => item.includes("Recorded review state could not be read")), "review read failure explicit"); if (key === CONDITION_PROGRESS_STORAGE_KEY) assert(result.cases[0].requirements.filter(item => item.conditionProgress.kind === "available").every(item => item.conditionProgress.kind === "available" && !item.conditionProgress.cleared), "progress read failure defaults uncleared"); }
  const mixed = seeded(); mixed.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([entry, null])); const prior = bytes(mixed); const result = await snapshot(mixed); assert(result.status === "ready", "mixed history ready"); assert(result.limitations?.some(item => item.includes("1 of 2")), "partial omission visible"); equal(bytes(mixed), prior, "no normalization write through adapter");
  const shallow = seeded(); shallow.values.set(REPORT_HISTORY_STORAGE_KEY, JSON.stringify([{ ...entry, report: { ...report, findings: [null] } }])); equal(readReportHistory(shallow).length, 1, "history validator admits invalid nested finding"); equal((await snapshot(shallow)).status, "unavailable", "projection exception becomes unavailable");
  note(3, "EXECUTABLE", "History absent/[] -> empty (even with requested id); unreadable/unsupported/nonempty without usable reports/get failure -> unavailable; unknown id in usable history -> unavailable; missing associated state -> ready; review failure limits grouping, ledger failure marks decision unavailable, condition failure defaults uncleared; useful report and mixed valid evidence survive; all reads are guarded read-only.", `${paths.adapter}: createRealWorkspaceAdapter/loadSnapshot`);
  observe("Real adapter", { "absent distinguishable": "YES", "malformed distinguishable": "YES", "unavailable distinguishable": "YES", "explicit failure": "YES", "fallback": "YES", "partial preserved": "YES", "pre-write rejection preserves prior state": "NOT_APPLICABLE", "reported failure can occur after authoritative mutation": "NOT_APPLICABLE", "collapse to empty/default": "YES", "retry possible": "YES" });
});

test("FS4 - generated session handoff source contract", () => {
  const parse = section(sources.report, "function parseSessionPayload", "function normaliseReportId");
  contains(parse, 'if (isReport(value)) return { report: value, source: "deterministic" }', "!isReport(value.report)) return null", 'value.source !== "ai" && value.source !== "deterministic"');
  const load = section(sources.report, 'const requested = params.get("reportId")', "void resolve();");
  ordered(load, "if (requested !== null)", "if (sessionRequested)", "if (demoRequested)");
  contains(load, "The requested report identity is empty", "No other report was selected", "const raw = sessionStorage.getItem(GENERATED_REPORT_STORAGE_KEY)", "raw ? parseSessionPayload(JSON.parse(raw) as unknown) : null", "No valid session review is available. A durable report was not substituted.", "catch (error)", "The Case File could not be read:");
  note(4, "SOURCE-CONTRACT", "Private inline parser accepts shallow bare Report as deterministic or envelope with ai/deterministic; structural invalid -> null. Explicit reportId (including empty identity) precedes session=1. Missing session payload/invalid shape -> unavailable without durable substitution; invalid JSON/storage throw -> unavailable catch. Without explicit session/id/demo, durable history is selected; missing session is irrelevant. No exported pure parser seam; React not executed.", `${paths.report}: parseSessionPayload/Resolution/resolve effect`);
  observe("Session handoff", { "absent distinguishable": "NO", "malformed distinguishable": "NO", "unavailable distinguishable": "YES", "explicit failure": "YES", "fallback": "NO", "pre-write rejection preserves prior state": "NOT_APPLICABLE", "reported failure can occur after authoritative mutation": "NOT_APPLICABLE", "collapse to empty/default": "NO", "retry possible": "YES" });
});

test("FS5 - workflow and condition failures, replacement, mismatch and partial writes", () => {
  const conditions = reportConditions(report); assert(conditions.length > 0, "condition fixture required"); const key = conditionKey(conditions[0]);
  for (const kind of ["review", "condition"] as const) {
    const storeKey = kind === "review" ? REVIEW_STATE_STORAGE_KEY : CONDITION_PROGRESS_STORAGE_KEY;
    const apply = (storage: Storage, id = caseId, condition = key) => kind === "review" ? createWorkspacePersistence(storage).applyReviewStatus({ kind: "review-status", caseId: id, status: "Reviewed" }) : createWorkspacePersistence(storage).applyConditionProgress({ kind: "condition-progress", caseId: id, conditionKey: condition, intent: "clear" });
    const unknown = seeded(); const prior = bytes(unknown); equal(apply(unknown, "missing").outcome, "unavailable", "unknown case refusal"); equal(bytes(unknown), prior, "unknown case no write");
    if (kind === "condition") equal(apply(unknown, caseId, "unknown-key").outcome, "unavailable", "unknown canonical key refusal");
    const unavailable = seeded(); unavailable.failGet.add("*"); equal(apply(unavailable).outcome, "unavailable", "history read failure collapses to case absent");
    for (const malformed of ["{", "[]", "{\"bad\":null}"]) { const storage = seeded(); storage.values.set(storeKey, malformed); equal(apply(storage).outcome, "persisted", "malformed prior replaced/defaulted"); assert(storage.values.get(storeKey) !== malformed, "successful replacement mutates malformed bytes"); }
    const readFailure = seeded(); readFailure.values.set(storeKey, '{"prior":true}'); readFailure.failGet.add(storeKey); equal(apply(readFailure).outcome, kind === "review" ? "verification-mismatch" : "failed", "associated read failure asymmetry"); equal(readFailure.values.get(storeKey) === '{"prior":true}', kind === "condition", "review overwrites unreadable prior before mismatch; progress get fails before set");
    const writeFailure = seeded(); writeFailure.values.set(storeKey, "{\"prior\":true}"); writeFailure.failSet.add(storeKey); const before = bytes(writeFailure); equal(apply(writeFailure).outcome, "failed", "write throw typed failed"); equal(bytes(writeFailure), before, "pre-write rejecting storage preserves prior");
    writeFailure.failSet.clear(); equal(apply(writeFailure).outcome, "persisted", "existing API can retry after write restored");
    const ignored = seeded(); ignored.ignoreSet.add(storeKey); equal(apply(ignored).outcome, "verification-mismatch", "silent dropped write detected");
    const postWrite = seeded(); postWrite.setThenThrow.add(storeKey); equal(apply(postWrite).outcome, "failed", "post-write throw typed failed"); assert(postWrite.values.has(storeKey), "no transaction/rollback guarantee on reported failure");
    note(5, "EXECUTABLE", `${kind}: unknown case (including swallowed history read failure) -> unavailable; malformed prior defaults/replaced on successful write; pre-write rejection -> failed preserving bytes; silent write -> verification-mismatch; write-then-throw -> failed with mutated bytes, no rollback; restored storage permits retry. Associated get failure -> ${kind === "review" ? "write then verification-mismatch" : "failed before write"}.`, `${paths.workflow}: ${kind === "review" ? "applyReviewStatus/readReviewStates/writeReviewState" : "applyConditionProgress/readConditionProgress/writeConditionProgress"}`);
    observe(kind === "review" ? "Review persistence" : "Condition persistence", { "absent distinguishable": "NO", "malformed distinguishable": "NO", "unavailable distinguishable": "NO", "explicit failure": "YES", "fallback": "YES", "pre-write rejection preserves prior state": "YES", "reported failure can occur after authoritative mutation": "YES", "collapse to empty/default": "YES", "retry possible": "YES" });
  }
  const storage = new MemoryStorage(); storage.failGet.add("*"); equal(readReviewStates(storage), {}, "review read collapse"); equal([...readConditionProgress(storage, report)], [], "condition read collapse");
  storage.failSet.add("*"); throws(() => writeReviewState(storage, reviewStateKeyForReport(report), defaultReviewState(report)), "direct review helper write throws"); throws(() => writeConditionProgress(storage, report, conditions, new Set([key])), "direct progress helper get throws");
});

test("FS6 - ledger helper versus decision service failures", () => {
  for (const raw of [null, "{", "[]", JSON.stringify({ [ledgerKey]: null }), JSON.stringify({ [ledgerKey]: { ledgerId: "fixture", entries: [null, {}] } })]) { const storage = new MemoryStorage(); if (raw !== null) storage.values.set(HUMAN_DECISION_LEDGER_STORAGE_KEY, raw); const prior = bytes(storage); equal(readHumanDecisionLedger(storage, ledgerKey, context).entries.length, 0, "invalid ledger collapse"); equal(bytes(storage), prior, "reader does not rewrite"); }
  const unavailable = new MemoryStorage(); unavailable.failGet.add("*"); equal(readHumanDecisionLedger(unavailable, ledgerKey, context).entries.length, 0, "unavailable ledger empty");
  const legacy = readHumanDecisionLedger(unavailable, ledgerKey, context, { ...defaultReviewState(report), status: "Reviewed", updatedAt: CREATED }); equal(legacy.entries.length, 1, "read failure can fall back to supplied historical state");
  const helper = new MemoryStorage(); helper.values.set(HUMAN_DECISION_LEDGER_STORAGE_KEY, "{\"prior\":true}"); helper.failSet.add(HUMAN_DECISION_LEDGER_STORAGE_KEY); const prior = bytes(helper); throws(() => appendHumanDecisionLedgerEntryToStorage(helper, ledgerKey, createEmptyHumanDecisionLedger(context), context, { eventType: "decision-recorded", outcome: "approve", reason: "write failure" }), "ledger append write throws"); equal(bytes(helper), prior, "helper failed set preserves bytes");
  const helperPostWrite = new MemoryStorage(); helperPostWrite.setThenThrow.add(HUMAN_DECISION_LEDGER_STORAGE_KEY);
  throws(() => appendHumanDecisionLedgerEntryToStorage(helperPostWrite, ledgerKey, createEmptyHumanDecisionLedger(context), context, { eventType: "decision-recorded", outcome: "approve", reason: "post-write failure" }), "ledger append throws after authoritative write");
  equal(readHumanDecisionLedger(helperPostWrite, ledgerKey, context).entries.length, 1, "direct helper failure occurs after persisted entry exists");
  const recorded = seeded(); equal(createWorkspaceDecisionService(recorded).recordDecision(command).outcome, "persisted", "seed valid decision for mixed corrupt entries"); const rawLedger = JSON.parse(recorded.values.get(HUMAN_DECISION_LEDGER_STORAGE_KEY)!); rawLedger[ledgerKey].entries.push(null, {}); recorded.values.set(HUMAN_DECISION_LEDGER_STORAGE_KEY, JSON.stringify(rawLedger)); equal(readHumanDecisionLedger(recorded, ledgerKey, context).entries.length, 1, "valid ledger entry survives invalid entries"); equal(ledgerIntegrityForKey(recorded, ledgerKey).ok, true, "preflight does not validate individual entries");
  for (const raw of ["{", "[]", JSON.stringify({ [ledgerKey]: null }), JSON.stringify({ [ledgerKey]: { entries: "invalid" } })]) { const storage = seeded(); storage.values.set(HUMAN_DECISION_LEDGER_STORAGE_KEY, raw); const before = bytes(storage); equal(createWorkspaceDecisionService(storage).recordDecision(command).outcome, "unavailable", "service refuses malformed envelope/history shape"); equal(bytes(storage), before, "malformed ledger not overwritten"); }
  const shallow = seeded(); shallow.values.set(HUMAN_DECISION_LEDGER_STORAGE_KEY, JSON.stringify({ [ledgerKey]: { ledgerId: "fixture", entries: [null, {}] } })); equal(createWorkspaceDecisionService(shallow).recordDecision(command).outcome, "persisted", "invalid individual entries dropped then replaced by service write");
  const ledgerReadFail = seeded(); ledgerReadFail.failGet.add(HUMAN_DECISION_LEDGER_STORAGE_KEY); equal(createWorkspaceDecisionService(ledgerReadFail).recordDecision(command).outcome, "unavailable", "ledger integrity read failure refusal");
  const allFail = seeded(); allFail.failGet.add("*"); equal(createWorkspaceDecisionService(allFail).recordDecision(command).outcome, "unavailable", "history get failure collapses to unknown case");
  const writeFail = seeded(); writeFail.values.set(HUMAN_DECISION_LEDGER_STORAGE_KEY, "{}"); writeFail.failSet.add(HUMAN_DECISION_LEDGER_STORAGE_KEY); const before = bytes(writeFail); equal(createWorkspaceDecisionService(writeFail).recordDecision(command).outcome, "failed", "service write failure explicit"); equal(bytes(writeFail), before, "failed write no false persist"); writeFail.failSet.clear(); equal(createWorkspaceDecisionService(writeFail).recordDecision(command).outcome, "persisted", "retry write restored");
  const ignored = seeded(); ignored.ignoreSet.add(HUMAN_DECISION_LEDGER_STORAGE_KEY); equal(createWorkspaceDecisionService(ignored).recordDecision(command).outcome, "verification-mismatch", "dropped write never persisted");
  const postWrite = seeded(); postWrite.setThenThrow.add(HUMAN_DECISION_LEDGER_STORAGE_KEY); equal(createWorkspaceDecisionService(postWrite).recordDecision(command).outcome, "failed", "no false persist on throw"); equal(readHumanDecisionLedger(postWrite, ledgerKey, context).entries.length, 1, "reported failure cannot promise rollback");
  for (const method of ["recordDecision", "supersedeDecision", "reaffirmDecision", "withdrawDecision"]) {
    const body = section(sources.decisions, `    ${method}(command:`);
    contains(body, "prepare(command.caseId)", "catch {", "return failed(");
  }
  note(6, "EXECUTABLE", "Ledger helper absent/malformed/get error -> empty or supplied legacy-state fallback; no read rewrite; valid entries survive bad entries. Writes throw. Service integrity refuses unreadable envelope/per-key/history shape but admits invalid individual array entries; command write failure -> failed, dropped write -> verification-mismatch, never false persisted. No rollback on post-write exception; retry available.", `${paths.ledger}: readHumanDecisionLedger/writeHumanDecisionLedger/appendHumanDecisionLedgerEntryToStorage; ${paths.decisions}: ledgerIntegrityForKey/recordDecision`);
  note(6, "SOURCE-CONTRACT", "All four decision commands use the shared prepare/commit boundary and catch exceptions into failed; this group executes record failure, not normal applicability/dedupe.", paths.decisions);
  observe("Ledger helper", { "absent distinguishable": "NO", "malformed distinguishable": "NO", "unavailable distinguishable": "NO", "explicit failure": "NO", "fallback": "YES", "partial preserved": "YES", "pre-write rejection preserves prior state": "YES", "reported failure can occur after authoritative mutation": "YES", "collapse to empty/default": "YES", "retry possible": "YES" });
  observe("Decision service", { "absent distinguishable": "YES", "malformed distinguishable": "YES", "unavailable distinguishable": "YES", "explicit failure": "YES", "fallback": "YES", "partial preserved": "YES", "pre-write rejection preserves prior state": "YES", "reported failure can occur after authoritative mutation": "YES", "collapse to empty/default": "YES", "retry possible": "YES" });
});

test("FS7 - draft envelope durability, record quarantine, write/remove/replace failure", () => {
  const reviewId = reviewIdFromOpaqueToken("bs0-failure-draft");
  const draftContext: DecisionDraftContext = { reviewId, decisionSubject: { status: "available", decisionSubjectId: decisionSubjectIdFromCapability(caseId) }, basis: { caseId, runId: canonicalRun.runId, headSha: "head-fs" } };
  const draft = createEmptyHumanDecisionDraft(reviewId, draftContext, null, CREATED);
  const absent = new HumanDecisionDraftStore(new MemoryStorage()); equal(absent.read(reviewId).status, "absent", "absent draft"); equal(absent.storeDurability(), null, "absent store available");
  for (const raw of ["{", "[]", '{"schemaVersion":2,"drafts":{}}']) { const storage = new MemoryStorage(); storage.values.set(HUMAN_DECISION_DRAFT_STORAGE_KEY, raw); const store = new HumanDecisionDraftStore(storage); equal(store.read(reviewId).status, "absent", "unreadable envelope read alone collapses"); equal(store.storeDurability(), { category: "unavailable", label: "Drafts unavailable on this device", reason: "store-unreadable" }, "envelope unreadable channel"); equal(store.write(reviewId, draft).persisted, false, "unreadable envelope not repaired"); equal(store.replaceUnreadable(reviewId, draft).persisted, false, "replace cannot repair envelope"); equal(storage.values.get(HUMAN_DECISION_DRAFT_STORAGE_KEY), raw, "unreadable bytes retained"); storage.values.delete(HUMAN_DECISION_DRAFT_STORAGE_KEY); equal(store.write(reviewId, draft).persisted, false, "constructor-fixed unavailable state"); assert(new HumanDecisionDraftStore(storage).write(reviewId, draft).persisted, "new instance can recover after source restored"); }
  const getFail = new MemoryStorage(); getFail.failGet.add(HUMAN_DECISION_DRAFT_STORAGE_KEY);
  for (const store of [new HumanDecisionDraftStore(null), new HumanDecisionDraftStore(getFail)]) { equal(store.read(reviewId).status, "absent", "unavailable read alone absent"); const durability = store.storeDurability(); assert(durability?.category === "unavailable", "availability separate channel"); equal(durability.reason, "storage-unavailable", "unavailable reason"); equal(store.write(reviewId, draft).persisted, false, "unavailable write refused"); equal(store.removeValid(reviewId).removed, false, "unavailable removal refused"); }
  const siblingId = reviewIdFromOpaqueToken("bs0-failure-sibling");
  const storage = new MemoryStorage(); storage.values.set(HUMAN_DECISION_DRAFT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, drafts: { [reviewId]: {}, [siblingId]: {} } })); const store = new HumanDecisionDraftStore(storage); equal(store.read(reviewId).status, "quarantined", "bad record quarantined"); equal(store.write(reviewId, draft).persisted, false, "ordinary write refuses quarantined record"); equal(store.removeValid(reviewId).reason, "record-quarantined", "ordinary removal refuses quarantine"); storage.failSet.add(HUMAN_DECISION_DRAFT_STORAGE_KEY); const before = bytes(storage); equal(store.replaceUnreadable(reviewId, draft).persisted, false, "replacement set failure"); equal(bytes(storage), before, "replacement failure bytes preserved"); equal(store.read(reviewId).status, "quarantined", "memory quarantine preserved"); storage.failSet.clear(); assert(store.replaceUnreadable(reviewId, draft).persisted, "explicit replacement allowed"); equal(store.read(reviewId).status, "valid", "valid after replacement"); equal(store.read(siblingId).status, "quarantined", "sibling quarantine survives useful valid draft"); assert(Object.hasOwn(JSON.parse(storage.values.get(HUMAN_DECISION_DRAFT_STORAGE_KEY)!).drafts, siblingId), "partial store record preserved on replacement");
  storage.failSet.add(HUMAN_DECISION_DRAFT_STORAGE_KEY); const validBytes = bytes(storage); equal(store.write(reviewId, { ...draft, rationale: "unsaved" }).persisted, false, "write failure explicit"); equal(store.removeValid(reviewId).removed, false, "removal fails via setItem, not removeItem"); equal(bytes(storage), validBytes, "failed write/removal preserve prior bytes"); equal(store.read(reviewId).status, "valid", "memory retained"); storage.failSet.clear(); storage.failRemove.add(HUMAN_DECISION_DRAFT_STORAGE_KEY); assert(store.removeValid(reviewId).removed, "removeValid uses setItem; removeItem seam irrelevant");
  note(7, "EXECUTABLE", "Production statuses are absent/valid/quarantined, with separate unavailable durability (store-unreadable or storage-unavailable). Read alone returns absent for unavailable. Envelope quarantine fixed at construction, cannot be repaired by replaceUnreadable; per-record quarantine can be explicitly replaced. Failed writes/removals/replacement do not update cached state or pre-write-rejecting storage; removeValid rewrites envelope using setItem. New instance after restored envelope and ordinary retries after set failure are structurally possible.", `${paths.draft}: HumanDecisionDraftStore/read/storeDurability/write/removeValid/replaceUnreadable`);
  observe("Draft store", { "absent distinguishable": "YES", "malformed distinguishable": "YES", "unavailable distinguishable": "YES", "explicit failure": "YES", "fallback": "NO", "partial preserved": "YES", "pre-write rejection preserves prior state": "YES", "collapse to empty/default": "YES", "retry possible": "YES" });
});

test("FS8 - deterministic helper, normalization rejection and model fallback source", () => {
  assert(report.changedFiles.length > 0, "pure deterministic report generated"); equal(normaliseReport(null, report), null, "invalid model null rejected"); equal(normaliseReport({}, report), null, "missing required model structure rejected"); equal(normaliseReport({ ...report, verdict: { ...report.verdict, summary: "diff --git unsafe raw patch" } }, report), null, "raw diff model rejected");
  const modelSummary = "The payment retry path needs an idempotency check before merge.";
  const repaired = normaliseReport({ verdict: { summary: modelSummary }, reviews: {}, operationalReadiness: {}, reviewerFocus: [], findings: "invalid", missingTests: 123, conditionsBeforeMerge: null }, report); assert(repaired, "partial shape accepted with field defaults"); equal(repaired.verdict.summary, modelSummary, "valid model-provided semantic summary used beside malformed fields"); equal(repaired.pr, report.pr, "submitted model metadata never trusted"); equal(repaired.changedFiles, report.changedFiles, "changed-file baseline preserved"); assert(report.findings.every(item => repaired.findings.some(next => next.title === item.title)), "baseline findings retained in partial output");
  const model = section(sources.generate, "async function generateWithOpenAI", "export async function POST"); contains(model, 'strict: true', "schema: REPORT_JSON_SCHEMA", "if (!response.ok) return null", "if (!outputText) return null", "JSON.parse(outputText)", "catch {\n    return null;", "controller.abort()");
  const post = section(sources.generate, "export async function POST"); ordered(post, "const baseline = generateReport(input)", 'analysisMode === "deterministic-only"', "if (!apiKey || !model)", "await generateWithOpenAI", "normaliseReport(generated, baseline)"); contains(post, 'analysisMode === "model-assisted"', 'input, "fallback", "openai", model', 'input, "model", "openai", model');
  note(8, "EXECUTABLE", "generateReport is pure deterministic; normaliseReport rejects missing top-level structural requirements/raw patch output but accepts partially malformed fields with defaults/merges. The partial fixture's valid model-provided verdict summary is used unchanged after normalization; deterministic metadata/files/findings survive. This establishes use of that semantic field, not arbitrary model content.", `${paths.generator}: generateReport; ${paths.normalizer}: normaliseReport`);
  note(8, "SOURCE-CONTRACT", "Model call inseparable from private route function; non-2xx/missing output/JSON parse/fetch/timeout exception -> null -> deterministic report with canonical analysisSource fallback. Missing config in auto -> deterministic, explicit model-assisted -> fallback; normalized success -> model/source ai. Provider strict JSON schema request is not a separate local full-schema validator. No provider called.", `${paths.generate}: generateWithOpenAI/POST`);
  observe("Model assist", { "absent distinguishable": "NO", "malformed distinguishable": "NO", "unavailable distinguishable": "NO", "explicit failure": "NO", "fallback": "YES", "partial preserved": "YES", "pre-write rejection preserves prior state": "NOT_APPLICABLE", "reported failure can occur after authoritative mutation": "NOT_APPLICABLE", "collapse to empty/default": "NO", "retry possible": "YES" });
});

test("FS9 - generate-report GET/POST error authority source", () => {
  contains(section(sources.generate, "export async function GET", "function requiredString"), 'state: "available"', 'state: configured ? "configured" : "unavailable"', 'fallback: "deterministic"', 'externalWrite: false');
  const post = section(sources.generate, "export async function POST"); contains(post, '{ error: "Invalid JSON request." }, { status: 400 }', '{ error: "Invalid request body." }, { status: 400 }', '{ error: "Title, repository, technology and diff are required." }, { status: 400 }', '{ error: "The submitted diff is too large." }, { status: 413 }', ': "pasted-diff"', ': "standard"');
  contains(section(sources.generate, "function requestedAnalysisMode", "export async function GET"), 'return "auto"');
  assert(!section(post, "const baseline = generateReport(input)").includes("catch"), "generator/response construction exceptions not route-caught"); assert(!/setItem|writeFile|writeHumanDecision|addReportToHistory/.test(sources.generate), "route has no local persistence calls");
  note(9, "SOURCE-CONTRACT", "GET reports deterministic available and model configured/unavailable without contacting provider. POST JSON/body/required fields 400, size 413, {error:string}; invalid inputSource/profile/mode default pasted-diff/standard/auto. Model failure still 200 deterministic response with fallback manifest. Baseline generator and response construction exceptions propagate (no established custom status). No local persistence. HTTP not executed.", `${paths.generate}: GET/POST/responseWithReport/requestedAnalysisMode`);
  observe("Generate API", { "explicit failure": "YES", "fallback": "YES", "partial preserved": "YES", "pre-write rejection preserves prior state": "NOT_APPLICABLE", "reported failure can occur after authoritative mutation": "NOT_APPLICABLE", "collapse to empty/default": "NO", "retry possible": "YES" });
});

test("FS10 - public PR and connected read/import failure source", () => {
  const pub = section(sources.public, "export async function POST"); contains(pub, '"The request is too large." }, 413', '"Invalid JSON request." }, 400', '"A public GitHub pull request URL is required." }, 400', '"Enter a valid public GitHub PR URL without query parameters or fragments." }, 400', '"This pull request could not be found or is not publicly accessible." }, 404', '"GitHub rate-limited this request. Please try again later." }, 429', '"GitHub could not provide this pull request diff." }, 502', '"GitHub returned an empty or invalid pull request diff." }, 502', '"GitHub took too long to return this pull request." }, 504', '"The pull request could not be fetched from GitHub." }, 502');
  const metadata = section(sources.public, "async function fetchPullRequestMetadata", "async function fetchGitHubDiff"); contains(metadata, "if (!response.ok) return {}", "if (!record) return {}", "catch {\n    return {};"); assert(!/Authorization|process.env|TOKEN/.test(sources.public), "public import has no credential seam");
  const con = sources.connected; contains(section(con, "function githubError", "async function withTimeout"), 'response.status === 401', '}, 401)', 'response.status === 403 || response.status === 429', '}, 429)', 'response.status === 404', '}, 404)', '}, 502)');
  const get = section(con, "export async function GET", "export async function POST"); contains(get, '{ connected: false, error: "Set GITHUB_TOKEN to enable the connected GitHub workspace." }, 200', '"A valid owner and repository are required." }, 400', '"Unsupported GitHub workspace action." }, 400', 'Array.isArray(payload) ? payload.map(repositoryPayload)', 'Array.isArray(payload) ? payload.map(pullRequestPayload)', ': []', '"GitHub did not respond in time." }, 504');
  const post = section(con, "export async function POST"); contains(post, '"Set GITHUB_TOKEN to enable the connected GitHub workspace." }, 401', '"Invalid JSON request." }, 400', '"A valid repository and pull request number are required." }, 400', '"GitHub returned malformed pull request metadata." }, 502', '"GitHub returned an empty or invalid pull request diff." }, 502', '"GitHub did not respond in time." }, 504', '}, 413'); ordered(post, "const token = githubToken()", "await request.json()");
  for (const text of [sources.public, con]) assert(!/setItem|writeFile|addReportToHistory/.test(text), "read/import route no local persist");
  note(10, "SOURCE-CONTRACT", "Public PR: no token required; invalid requests 400/413; inaccessible/private/not-found collapsed 404; rate limit 429; other upstream/invalid diff 502; abort 504 and other exceptions 502. Metadata non-2xx/parse/read/shape failure -> {} while valid diff can succeed. Connected: no token GET connected:false 200, POST 401 before parsing; invalid args/action/JSON 400; upstream 401/429/404/502; size 413; invalid diff/required metadata 502; every GET/POST task exception (including malformed JSON/network) called timeout and 504. Wrong-shaped lists -> successful []; invalid list entries dropped. Neither route persists locally. No HTTP/GitHub execution.", `${paths.public}: POST/fetchPullRequestMetadata; ${paths.connected}: GET/POST/githubError`);
  observe("Public PR API", { "explicit failure": "YES", "fallback": "YES", "partial preserved": "YES", "pre-write rejection preserves prior state": "NOT_APPLICABLE", "reported failure can occur after authoritative mutation": "NOT_APPLICABLE", "collapse to empty/default": "YES", "retry possible": "YES" });
  observe("Connected GitHub API", { "explicit failure": "YES", "fallback": "YES", "partial preserved": "YES", "pre-write rejection preserves prior state": "NOT_APPLICABLE", "reported failure can occur after authoritative mutation": "NOT_APPLICABLE", "collapse to empty/default": "YES", "retry possible": "YES" });
});

let tempRoot: string | null = null;
type Store = typeof import("../../github-app-store");
async function isolatedStore(name: string): Promise<{ store: Store; cwd: string }> {
  if (!tempRoot) tempRoot = await mkdtemp(join(tmpdir(), "lintel-bs0-failure-"));
  const cwd = resolve(tempRoot, name); assert(cwd.startsWith(`${resolve(tempRoot)}${sep}`), "store path contained in generated root"); await mkdir(cwd);
  process.chdir(cwd);
  try { return { store: await import(`${pathToFileURL(join(WORKSPACE, "lib/github-app-store.ts")).href}?bs0_10_${name}`) as Store, cwd }; }
  finally { process.chdir(WORKSPACE); }
}
const envelope = (deliveryId: string, headSha = "head-failure-app"): GitHubWebhookEnvelope => ({ deliveryId, event: "pull_request", action: "synchronize", installationId: 10, repositoryId: 20, repositoryOwner: "lintel", repositoryName: "bs0-failure", pullRequestNumber: 1010, baseSha: "base-fs", headSha, receivedAt: CREATED });
let lifecycle: { store: Store; cwd: string; id: string };
test("FS11 - App analysis failure persists independently of completed history", async () => {
  const isolated = await isolatedStore("analysis"); const store = isolated.store;
  await store.recordDelivery(envelope("failure-first"), "received"); const processing = await store.markPullRequestProcessing(envelope("failure-first")); assert(processing, "processing record"); await store.updateDeliveryState("failure-first", "processing", undefined, processing.id);
  await store.failPullRequestAnalysis(processing.id, "diff_fetch_failure"); await store.updateDeliveryState("failure-first", "failed", "diff_fetch_failure", processing.id);
  let data = await store.readGitHubAppStore(); equal(data.pullRequests[processing.id].state, "failed", "PR failure persisted"); equal(data.pullRequests[processing.id].failureCategory, "diff_fetch_failure", "PR category"); equal(data.deliveries["failure-first"].failureCategory, "diff_fetch_failure", "delivery category"); equal(data.pullRequests[processing.id].analysisRuns, undefined, "failed analysis does not create runs"); equal(await store.findCompletedAnalysis(10, 20, 1010, "head-failure-app"), null, "failure does not count as completion");
  await store.markPullRequestProcessing(envelope("attempt-new")); const completed = await store.completePullRequestAnalysis(processing.id, report, { input, sourceType: "github-app", analysisSource: "deterministic" }); assert(completed?.analysisRuns?.length === 1, "later current API attempt completes"); const savedRun = completed.analysisRuns[0];
  await store.markPullRequestProcessing(envelope("failure-later", "head-failure-later")); await store.failPullRequestAnalysis(processing.id, "report_generation_failure"); data = await store.readGitHubAppStore(); const failed = data.pullRequests[processing.id]; equal(failed.state, "failed", "later failure current PR state"); equal(failed.analysisRuns, [savedRun], "prior completed history survives later failure"); equal(failed.latestReport, report, "useful prior report survives"); equal(failed.headSha, "head-failure-later", "current PR head remains later head"); equal(await store.failPullRequestAnalysis("unknown", "failure"), null, "unknown PR returns null");
  const disk = JSON.parse(await readFile(join(isolated.cwd, ".lintel-data", "github-app-store.json"), "utf8")); equal(disk.pullRequests[processing.id].failureCategory, "report_generation_failure", "failure durable on disk");
  lifecycle = { ...isolated, id: processing.id };
  note(11, "EXECUTABLE", "mark processing then fail persists PR failed/category and explicit delivery failure via separate API. Failure creates no analysisRuns. New attempt through current mark/complete API succeeds. Later failure retains completed run and latest report while changing current head/state/category. Unknown fail target null. Temp-backed store only.", `${paths.store}: markPullRequestProcessing/failPullRequestAnalysis/updateDeliveryState/findCompletedAnalysis/completePullRequestAnalysis`);
  const webhook = section(sources.webhook, "async function processPullRequest", "export async function POST"); contains(webhook, 'token.error', '"diff_fetch_failure"', '"diff_too_large"', '"report_generation_failure"');
  const complete = section(sources.store, "export async function completePullRequestAnalysis", "export async function addRunVerification"); ordered(complete, 'currentRun.deltaFailureCategory = "delta_generation_failed"', 'record.state = "completed"', "record.analysisRuns = [currentRun");
  note(11, "SOURCE-CONTRACT", "Webhook persists token/upstream/diff/generator failure categories. Metadata/diff fetch and metadata JSON parsing occur outside generator try; exceptions there propagate and may leave processing. Broad generation/comment try can mark PR/delivery report_generation_failure after analysis already completed. Store comparison/delta exception records delta_generation_failed on current run and still completes/persists analysis. Duplicate failed delivery is not automatically reprocessed; store retry is not a webhook replay redesign.", `${paths.webhook}; ${paths.store}: completePullRequestAnalysis`);
  observe("App analysis", { "explicit failure": "YES", "partial preserved": "YES", "retry possible": "YES" });
});

test("FS12 - App store safe filesystem failures, temp leftovers, queue recovery", async () => {
  const blocked = await isolatedStore("mkdir-blocked"); await writeFile(join(blocked.cwd, ".lintel-data"), "safe generated blocker");
  equal(await blocked.store.readGitHubAppStore(), { deliveries: {}, installations: {}, repositories: {}, pullRequests: {} }, "unreadable filesystem collapse"); equal(await blocked.store.repositoryIsEnabled(10, 20), true, "unreadable missing config fails open");
  await rejects(() => blocked.store.recordDelivery(envelope("blocked"), "received"), "mkdir persistence rejection propagated"); equal(await readFile(join(blocked.cwd, ".lintel-data"), "utf8"), "safe generated blocker", "blocker unchanged"); equal((await blocked.store.readGitHubAppStore()).deliveries, {}, "failed updater not cached as success");
  const renameBlocked = await isolatedStore("rename-blocked"); const dir = join(renameBlocked.cwd, ".lintel-data"); const destination = join(dir, "github-app-store.json"); await mkdir(destination, { recursive: true });
  await rejects(() => renameBlocked.store.recordDelivery(envelope("rename-fail"), "received"), "rename persistence rejection propagated"); const files = await readdir(dir); const leftovers = files.filter(file => file.endsWith(".tmp")); equal(leftovers.length, 1, "temp write remains after rename failure"); const candidate = JSON.parse(await readFile(join(dir, leftovers[0]), "utf8")); equal(candidate.deliveries["rename-fail"].state, "received", "local mutation serialized before failed rename"); equal((await renameBlocked.store.readGitHubAppStore()).deliveries, {}, "no cached authoritative success");
  assert(destination.startsWith(`${resolve(tempRoot!)}${sep}`), "generated blocker removal within temp root"); await rm(destination, { recursive: true }); await renameBlocked.store.recordDelivery(envelope("after-failure"), "received"); equal((await renameBlocked.store.readGitHubAppStore()).deliveries["after-failure"].state, "received", "rejected queue does not poison later write");
  const corrupt = await isolatedStore("corrupt"); await mkdir(join(corrupt.cwd, ".lintel-data")); const file = join(corrupt.cwd, ".lintel-data", "github-app-store.json"); await writeFile(file, "{"); equal((await corrupt.store.readGitHubAppStore()).deliveries, {}, "corrupt JSON collapse"); await corrupt.store.recordDelivery(envelope("replace-corrupt"), "received"); assert((await readFile(file, "utf8")) !== "{", "successful mutation overwrites malformed store with default-backed state");
  const update = section(sources.store, "async function updateStore", "export async function readGitHubAppStore"); ordered(update, "const data = await readStore()", "const result = await updater(data)", "await writeStore(data)", "return result"); contains(update, "writeQueue.then(run, run)", "next.then(() => undefined, () => undefined)");
  note(12, "EXECUTABLE", "Generated file blocker makes mkdir fail; generated destination-directory blocker makes rename fail after temp write. Both promises reject, updater result never returned as success, no persistent in-memory cache, rename failure leaves serialized temp file. Removing only generated blocker permits later queued call. Missing/unreadable/corrupt read -> empty defaults; repositoryIsEnabled defaults true; successful later mutation replaces corrupt bytes. No permissions changed.", `${paths.store}: readStore/writeStore/updateStore/recordDelivery/repositoryIsEnabled`);
  note(12, "SOURCE-CONTRACT", "Store updater mutates local object before awaited disk write but returns result only after write; write failures propagate. Webhook pre-analysis writes are outside broad catch; failures inside catch-covered block may be labeled generation failure, and a failing failure-state persistence call itself propagates.", `${paths.store}: updateStore; ${paths.webhook}: processPullRequest/POST`);
  observe("App persistence", { "absent distinguishable": "NO", "malformed distinguishable": "NO", "unavailable distinguishable": "NO", "explicit failure": "NO", "fallback": "YES", "collapse to empty/default": "YES", "retry possible": "YES" });
});

test("FS13 - decision-comment failure transitions and network catch boundary", async () => {
  const { store, id } = lifecycle;
  const published = await store.completeCommentPublishing(id, { commentId: 1010, htmlUrl: "https://example.invalid/comment", headSha: "head-success" }); assert(published, "successful pointer fixture"); const pointer = { id: published.githubCommentId, url: published.githubCommentHtmlUrl, head: published.latestPublishedHeadSha, time: published.latestPublishedAt };
  const publishing = await store.markCommentPublishing(id); equal(publishing?.commentPublishingState, "publishing", "publishing before call");
  const failed = await store.failCommentPublishing(id, "comment_rate_limited"); assert(failed, "comment failure record"); equal(failed.commentPublishingState, "failed", "failed comment state"); equal(failed.commentFailureCategory, "comment_rate_limited", "category durable"); equal({ id: failed.githubCommentId, url: failed.githubCommentHtmlUrl, head: failed.latestPublishedHeadSha, time: failed.latestPublishedAt }, pointer, "last success pointer/head/time retained");
  const retry = await store.markCommentPublishing(id); equal(retry?.commentPublishingState, "publishing", "later mark structurally allowed"); equal(retry?.commentFailureCategory, undefined, "later mark clears failure category"); equal(await store.failCommentPublishing("unknown", "failure"), null, "unknown comment target null");
  const hook = section(sources.webhook, "if (completedRecord && completedRecord.latestPublishedHeadSha", "return jsonResponse({ ok: true, state: \"completed\" });"); ordered(hook, "await markCommentPublishing", "await publishGitHubDecisionComment", "if (published.ok)", "await failCommentPublishing(processingRecord.id, published.error)");
  const safe = section(sources.comments, "function safeCommentError", "async function githubCommentFetch"); contains(safe, '"comment_not_found"', '"comment_permission_missing"', '"comment_rate_limited"', '"comment_publish_failure"');
  const publisher = section(sources.comments, "export async function publishGitHubDecisionComment"); assert(!publisher.includes("catch"), "publisher network/json exceptions propagate"); contains(publisher, 'existingStoredComment !== "comment_not_found"', 'return { ok: false, error: existingStoredComment }', 'if (typeof comments === "string") return { ok: false, error: comments }');
  // SOURCE-CONTRACT: parse only the tracked webhook/comment modules. Parent
  // links prove the corresponding try/catch, rather than matching unrelated
  // tokens elsewhere in processPullRequest. No route or network is executed.
  function nodes(root: ts.Node): ts.Node[] {
    const result: ts.Node[] = [];
    function visit(node: ts.Node) { result.push(node); ts.forEachChild(node, visit); }
    visit(root); return result;
  }
  function calls(root: ts.Node, name: string): ts.CallExpression[] {
    return nodes(root).filter(ts.isCallExpression).filter(call => ts.isIdentifier(call.expression) && call.expression.text === name);
  }
  function enclosingTry(node: ts.Node): ts.TryStatement | null {
    for (let parent = node.parent; parent; parent = parent.parent) if (ts.isTryStatement(parent)) return parent;
    return null;
  }
  function inside(node: ts.Node, ancestor: ts.Node): boolean {
    for (let current: ts.Node | undefined = node; current; current = current.parent) if (current === ancestor) return true;
    return false;
  }
  const webhookAst = ts.createSourceFile(paths.webhook, sources.webhook, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const processFunction = webhookAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === "processPullRequest");
  assert(processFunction && ts.isFunctionDeclaration(processFunction) && processFunction.body, "tracked processPullRequest body exists");
  const publishCalls = calls(processFunction.body, "publishGitHubDecisionComment"); equal(publishCalls.length, 1, "one webhook publisher call");
  const publishCall = publishCalls[0]; const surroundingTry = enclosingTry(publishCall);
  assert(surroundingTry && surroundingTry.catchClause, "publisher has a corresponding enclosing try/catch");
  assert(surroundingTry.parent === processFunction.body && inside(publishCall, surroundingTry.tryBlock), "publisher is inside the direct processPullRequest try body, not its catch");
  const markCalls = calls(surroundingTry.tryBlock, "markCommentPublishing"); equal(markCalls.length, 1, "one mark publishing in same try");
  const markCall = markCalls[0]; assert(enclosingTry(markCall) === surroundingTry, "mark and publisher share nearest try; no intervening try");
  const publishingBranch = nodes(surroundingTry.tryBlock).filter(ts.isIfStatement).find(branch => inside(markCall, branch.thenStatement) && inside(publishCall, branch.thenStatement));
  assert(publishingBranch && ts.isBlock(publishingBranch.thenStatement), "mark and publisher are in same publishing branch");
  const branchStatements = publishingBranch.thenStatement.statements;
  const markIndex = branchStatements.findIndex(statement => ts.isExpressionStatement(statement) && ts.isAwaitExpression(statement.expression) && statement.expression.expression === markCall);
  const publishIndex = branchStatements.findIndex(statement => ts.isVariableStatement(statement) && inside(publishCall, statement));
  assert(markIndex >= 0 && publishIndex > markIndex && ts.isAwaitExpression(publishCall.parent), "awaited mark is a preceding direct statement before awaited publisher");
  const analysisCompletion = calls(surroundingTry.tryBlock, "completePullRequestAnalysis"); equal(analysisCompletion.length, 1, "analysis completion in same try");
  assert(analysisCompletion[0].getStart(webhookAst) < markCall.getStart(webhookAst), "analysis completion precedes comment publishing");
  const catchBlock = surroundingTry.catchClause.block;
  const prFailure = calls(catchBlock, "failPullRequestAnalysis"); const deliveryFailure = calls(catchBlock, "updateDeliveryState");
  equal(prFailure.length, 1, "corresponding catch contains PR failure"); equal(deliveryFailure.length, 1, "corresponding catch contains delivery failure");
  equal(prFailure[0].arguments.map(arg => arg.getText(webhookAst)), ["processingRecord.id", '"report_generation_failure"'], "catch PR failure category/target");
  equal(deliveryFailure[0].arguments.map(arg => arg.getText(webhookAst)), ["deliveryId", '"failed"', '"report_generation_failure"', "processingRecord.id"], "catch delivery failure category/target");
  equal(catchBlock.statements.length, 3, "catch is exactly two awaited failure transitions then return");
  for (const [index, call] of [prFailure[0], deliveryFailure[0]].entries()) {
    const statement = catchBlock.statements[index];
    assert(ts.isExpressionStatement(statement) && ts.isAwaitExpression(statement.expression) && statement.expression.expression === call, "catch failure transition is directly awaited in order");
  }
  assert(ts.isReturnStatement(catchBlock.statements[2]), "catch returns after both failure transitions");
  contains(catchBlock.statements[2].getText(webhookAst), 'return jsonResponse({ ok: true, state: "failed", error: "report_generation_failure" })');
  equal(calls(catchBlock, "failCommentPublishing").length, 0, "corresponding catch never marks comment failed");
  const commentAst = ts.createSourceFile(paths.comments, sources.comments, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const commentFunctions = ["publishGitHubDecisionComment", "githubCommentFetch", "readComment", "listComments", "updateComment", "createComment"];
  for (const name of commentFunctions) {
    const fn = commentAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
    assert(fn && ts.isFunctionDeclaration(fn) && fn.body, `tracked comment function exists: ${name}`);
    equal(nodes(fn.body).filter(ts.isTryStatement).length, 0, `${name} does not catch transport/JSON exceptions`);
    assert(!nodes(fn.body).filter(ts.isCallExpression).some(call => ts.isPropertyAccessExpression(call.expression) && ["catch", "then"].includes(call.expression.name.text)), `${name} has no promise rejection handler`);
    if (name === "githubCommentFetch") equal(calls(fn.body, "fetch").length, 1, "transport helper directly calls fetch");
    else if (name === "publishGitHubDecisionComment") {
      for (const helper of ["readComment", "listComments", "updateComment", "createComment"]) assert(calls(fn.body, helper).length > 0, `publisher invokes uncaught helper: ${helper}`);
    } else {
      equal(calls(fn.body, "githubCommentFetch").length, 1, `${name} invokes uncaught transport helper`);
      contains(fn.body.getText(commentAst), "await response.json()");
    }
  }
  const failAnalysisBody = section(sources.store, "export async function failPullRequestAnalysis", "export async function setRepositoryEnabled");
  const deliveryBody = section(sources.store, "export async function updateDeliveryState", "export async function upsertInstallation");
  assert(!/commentPublishingState|commentFailureCategory/.test(failAnalysisBody + deliveryBody), "catch's PR/delivery transitions do not alter comment publishing state");
  note(13, "EXECUTABLE", "Publishing -> failed/category preserves existing comment id/url and last successful published head/time; mark publishing later clears category and permits structural retry; unknown record null. Pure store transitions only.", `${paths.store}: markCommentPublishing/failCommentPublishing`);
  note(13, "SOURCE-CONTRACT", "AST proves completePullRequestAnalysis, awaited markCommentPublishing and awaited publishGitHubDecisionComment are ordered inside the same processPullRequest try; mark/publish share the publishing branch with no intervening try. Publisher and its transport/JSON helpers contain no try/catch. The corresponding catch directly awaits PR failed/report_generation_failure, then delivery failed/report_generation_failure, then returns failed; it never calls failCommentPublishing. Those store transitions do not change comment state. A thrown publisher exception after persisted mark can therefore leave publishing plus report_generation_failure if failure persistence succeeds; if it fails, the catch propagates. Returned ok:false separately invokes failCommentPublishing. Store API retry exists; webhook admission does not provide automatic comment-only retry.", `${paths.comments}: publishGitHubDecisionComment/transport and JSON helpers; ${paths.webhook}: processPullRequest enclosing try/catch; ${paths.store}: failPullRequestAnalysis/updateDeliveryState`);
  observe("App analysis", { "reported failure can occur after authoritative mutation": "YES" });
  observe("Comment publishing", { "explicit failure": "YES", "fallback": "YES", "partial preserved": "YES", "reported failure can occur after authoritative mutation": "YES", "retry possible": "YES" });
});

test("FS14 - current browser error/degraded branches source only", () => {
  contains(sources.report, 'resolution.status === "loading"', 'resolution.status === "empty"', 'resolution.status === "unavailable"', 'Human Decision history is unavailable:', 'Configured capability is unavailable:');
  const r4 = source("app/workspace/WorkspaceR4Client.tsx"); contains(r4, 'snapshot.status === "loading"', 'snapshot.status === "empty"', 'snapshot.status === "unavailable"', "Stored review unavailable", "Derived requirement · read-only", 'outcome: "persisted-refresh-failed"', "The write is stored locally, but the Workspace could not be refreshed.");
  const v2 = source("app/workspace-v2/WorkspaceV2Client.tsx"); contains(v2, 'snapshot.status !== "ready"', 'result.outcome === "failed" || result.outcome === "verification-mismatch"', "setDecisionDialogError(result.message)", 'outcome: "persisted-refresh-failed"');
  const stateShell = source("app/workspace-v2/components/WorkspaceShellState.tsx"); contains(stateShell, 'snapshot.status === "loading"', 'snapshot.status === "empty"', "Workspace unavailable", "{snapshot.reason}", 'role="alert"');
  for (const path of ["app/workspace/RealWorkspaceR4Bootstrap.tsx", "app/workspace-v2/RealWorkspaceBootstrap.tsx"]) { const bootstrap = source(path); contains(bootstrap, 'status: "loading"', 'status: "unavailable"', "return null;", "setSnapshot(next)", "return { ok: false }"); }
  const host = source("app/(workstation)/WorkspaceHost.tsx"); contains(host, 'selectedReview.status === "resolving"', 'selectedReview.status === "store-unavailable"', 'selectedReview.status === "review-unavailable"', "This review is no longer stored in this browser", "No replacement Review was silently selected");
  const queue = source("app/(workstation)/QueueRegion.tsx"); contains(queue, 'snapshot.status === "loading"', 'snapshot.status === "unavailable"', 'snapshot.status === "empty"');
  const composer = source("app/(workstation)/HumanDecisionComposer.tsx"); contains(composer, "durability.reason === \"store-unreadable\"", "Discard unreadable draft", 'serviceResult?.outcome === "failed"', ">Retry</button>");
  const provider = source("app/(workstation)/WorkstationProvider.tsx"); contains(provider, 'status: "unavailable"', 'outcome: "persisted-refresh-failed"', "replaceUnreadable");
  const operational = source("lib/operational-review-projection.ts"); contains(operational, 'snapshot.status === "empty"', 'snapshot.status === "unavailable"', "unavailableReason: snapshot.reason", 'decision.kind === "unavailable"', 'item.status === "stale" || item.status === "unavailable"');
  for (const path of ["app/home/home-client.tsx", "app/review-operations/review-operations-client.tsx"]) {
    contains(source(path), 'state.kind === "loading"', 'projection?.status === "unavailable"', 'projection?.status === "empty"', "Retry local read", "setRetrySignal((value) => value + 1)");
  }
  contains(source("app/review-operations/review-operations-client.tsx"), "No reviews match the current view, search and filters", "storage is not empty.");
  note(14, "SOURCE-CONTRACT", "Home and Review Operations visibly separate loading, unavailable and empty with Retry local read. Operations also distinguishes successful filtered-empty from empty storage. The operational hook's promise catch handles rejected projection; window.localStorage property access is evaluated before that promise catch and is not enclosed in a synchronous try.", "app/home/home-client.tsx; app/review-operations/review-operations-client.tsx; app/use-operational-projection.ts");
  const hook = source("app/use-operational-projection.ts"); ordered(hook, "readOperationalReviewProjection(window.localStorage, demoMode)", ".then(", ".catch("); assert(!hook.includes("try {"), "operational localStorage property access has no synchronous catch");
  note(14, "SOURCE-CONTRACT", "Report exposes loading/empty/unavailable plus nested unavailable decision/integration and stale evidence. R4/V2 real expose loading/empty/unavailable and read-only capabilities; malformed/not-found render unavailable with reason, no universal separate malformed state. Decision failures/mismatch displayed; saved-refresh-failed distinguished (R4 condition refresh failure uses failed copy despite saved write). Bootstrap reload ok means no throw, even if adapter returns unavailable. Workstation separates resolving/store-unavailable/review-unavailable and queue loading/empty/unavailable; draft unreadable/durability and failed Retry displayed. Operational projection maps empty/unavailable and partial attention reasons. No React/browser execution or visual evaluation.", "app/report/page.tsx; app/workspace/{RealWorkspaceR4Bootstrap,WorkspaceR4Client}.tsx; app/workspace-v2/{RealWorkspaceBootstrap,WorkspaceV2Client,components/WorkspaceShellState}.tsx; app/(workstation)/{WorkspaceHost,QueueRegion,HumanDecisionComposer,WorkstationProvider}.tsx; lib/operational-review-projection.ts");
});

test("FS15 - observation-backed failure matrix versus separate expectations", () => {
  // UNKNOWN explicitly means not established; NO requires an observed collapse,
  // rejection, missing returned failure model, or source-established absence.
  const expectedValues: Record<Row, readonly Cell[]> = {
    "Report history": ["NO", "NO", "NO", "NO", "UNKNOWN", "YES", "YES", "UNKNOWN", "YES", "YES"],
    "Real adapter": ["YES", "YES", "YES", "YES", "YES", "YES", "NOT_APPLICABLE", "NOT_APPLICABLE", "YES", "YES"],
    "Session handoff": ["NO", "NO", "YES", "YES", "NO", "UNKNOWN", "NOT_APPLICABLE", "NOT_APPLICABLE", "NO", "YES"],
    "Review persistence": ["NO", "NO", "NO", "YES", "YES", "UNKNOWN", "YES", "YES", "YES", "YES"],
    "Condition persistence": ["NO", "NO", "NO", "YES", "YES", "UNKNOWN", "YES", "YES", "YES", "YES"],
    "Ledger helper": ["NO", "NO", "NO", "NO", "YES", "YES", "YES", "YES", "YES", "YES"],
    "Decision service": ["YES", "YES", "YES", "YES", "YES", "YES", "YES", "YES", "YES", "YES"],
    "Draft store": ["YES", "YES", "YES", "YES", "NO", "YES", "YES", "UNKNOWN", "YES", "YES"],
    "Model assist": ["NO", "NO", "NO", "NO", "YES", "YES", "NOT_APPLICABLE", "NOT_APPLICABLE", "NO", "YES"],
    "Generate API": ["UNKNOWN", "UNKNOWN", "UNKNOWN", "YES", "YES", "YES", "NOT_APPLICABLE", "NOT_APPLICABLE", "NO", "YES"],
    "Public PR API": ["UNKNOWN", "UNKNOWN", "UNKNOWN", "YES", "YES", "YES", "NOT_APPLICABLE", "NOT_APPLICABLE", "YES", "YES"],
    "Connected GitHub API": ["UNKNOWN", "UNKNOWN", "UNKNOWN", "YES", "YES", "YES", "NOT_APPLICABLE", "NOT_APPLICABLE", "YES", "YES"],
    "App analysis": ["UNKNOWN", "UNKNOWN", "UNKNOWN", "YES", "UNKNOWN", "YES", "UNKNOWN", "YES", "UNKNOWN", "YES"],
    "App persistence": ["NO", "NO", "NO", "NO", "YES", "UNKNOWN", "UNKNOWN", "UNKNOWN", "YES", "YES"],
    "Comment publishing": ["UNKNOWN", "UNKNOWN", "UNKNOWN", "YES", "YES", "YES", "UNKNOWN", "YES", "UNKNOWN", "YES"],
  };
  for (const row of rows) equal(expectedValues[row].length, columns.length, `expected metadata covers all ten columns: ${row}`);
  const expected = Object.fromEntries(rows.map(row => [row, Object.fromEntries(columns.map((col, i) => [col, expectedValues[row][i]]))]));
  equal(matrix, expected, "matrix conclusions collected before expectation comparison");
  assert(observations.some(item => item.fs === 2 && item.evidence === "EXECUTABLE") && observations.some(item => item.fs === 14 && item.evidence === "SOURCE-CONTRACT"), "matrix uses actual observations");
  note(15, "EXECUTABLE", `Matrix initialized UNKNOWN, populated only in FS2-FS13 after production invocation/source assertions, compared separately. ${matrixSemantics} Draft pre-write preservation is established; post-mutation failure remains UNKNOWN. Report-history preservation refers to rejected cleanup removal, not destructive cleanup after rejected normalization. App persistence's new cells remain UNKNOWN: non-authoritative temp files do not establish preservation of a prior authoritative store or failure after authoritative mutation.`, "validation-local matrix/observe/expectedValues");
});

test("FS16 - bounded current cross-product failure boundary", () => {
  const at = (row: Row, col: Column) => matrix[row][col];
  equal(at("Real adapter", "unavailable distinguishable"), "YES", "adapter restores read distinction"); equal(at("Decision service", "malformed distinguishable"), "YES", "decision preflight distinction"); equal(at("Draft store", "unavailable distinguishable"), "YES", "draft durability channel distinction");
  for (const row of ["Report history", "Ledger helper", "App persistence"] as const) equal(at(row, "unavailable distinguishable"), "NO", "lower-level failure collapse");
  for (const row of ["Real adapter", "Model assist", "App analysis", "Comment publishing"] as const) equal(at(row, "partial preserved"), "YES", "partial knowledge survives bounded failure");
  assert(observations.some(item => item.fs === 12 && item.finding.includes("defaults true")), "open repository fallback observed"); assert(observations.some(item => item.finding.includes("refuses unreadable envelope")), "closed decision gate observed");
  note(16, "SOURCE-CONTRACT", "Current product has no single coherent failure union: helper defaults/cleanup, projection unavailable, typed mutation failed/mismatch/refusal, draft quarantine+durability, deterministic fallback, HTTP error statuses, persisted App PR/delivery/comment categories coexist. Adapter/decision/draft durability distinguish selected absent/unavailable paths; history/ledger/App reads collapse. Decision envelope/explicit-id gates fail closed; missing App repository config defaults enabled and optional model/associated projections continue with bounded fallbacks. Workflow/decision service failures returned, low-level writes/App writes throw; App failure states persist, browser service errors generally do not. Current commands/reconstruction permit bounded retry; webhook admission limits retry; no future failure model proposed.", Object.values(paths).join("; "));
});

let passed = 0;
try {
  for (const item of tests) {
    try { await item.run(); passed++; }
    catch (error) { process.stderr.write(`BS0.10 failure-state validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`); process.exitCode = 1; break; }
  }
  if (passed === tests.length) {
    process.stdout.write(`BS0.10 failure-state validation: ${passed}/${tests.length} grouped checks passed\n`);
    for (const item of observations) process.stdout.write(`FS${item.fs} ${item.evidence}: ${item.finding}\nProduction: ${item.production}\n`);
    process.stdout.write(`Failure matrix columns: ${columns.join(" | ")}\n`);
    for (const row of rows) process.stdout.write(`${row}: ${columns.map(col => matrix[row][col]).join(" | ")}\n`);
  }
} finally {
  process.chdir(WORKSPACE);
  if (tempRoot) { const target = resolve(tempRoot); assert(target.startsWith(`${resolve(tmpdir())}${sep}`) && target.includes("lintel-bs0-failure-"), "cleanup generated root only below OS temp"); await rm(target, { recursive: true, force: true }); }
}
