/** BS0.9: current route wiring only. No React/HTTP execution or network access.
 * Run independently with the existing R6C node-hooks.mjs import hook.
 * SOURCE-CONTRACT means tracked TypeScript AST/import/JSX/gate evidence.
 * EXECUTABLE means an injected production service/adapter was actually called.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import ts from "typescript";
import { createCanonicalReviewRunManifest } from "../../canonical-review-run";
import { conditionKey, reportConditions } from "../../condition-progress";
import { generateReport, GENERATED_REPORT_STORAGE_KEY } from "../../report-generator";
import { addReportToHistory, readReportHistory, REPORT_HISTORY_STORAGE_KEY } from "../../report-history";
import { REVIEW_STATE_STORAGE_KEY } from "../../review-state";
import { CONDITION_PROGRESS_STORAGE_KEY } from "../../condition-progress";
import { HUMAN_DECISION_LEDGER_STORAGE_KEY } from "../../human-decision-ledger";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import { readOnlyStorage } from "../../workspace-v2/read-only-storage";
import { createFixtureWorkspaceAdapter } from "../../workspace-v2/fixture-adapter";
import { resolveWorkspaceSource } from "../../workspace-v2/adapter";
import { createWorkspacePersistence } from "../../workspace-v2/persistence";
import { createWorkspaceDecisionService } from "../../workspace-v2/decision-mutations";
import type { CaseDetail } from "../../workspace-v2/view-model";
import { decisionDraftContextFor, decisionSubjectIdFromCapability, indexReviews, parseRoute } from "../../r6c/index";
import { HUMAN_DECISION_DRAFT_STORAGE_KEY } from "../../r6c/human-decision-draft-boundary";
import { HumanDecisionDraftStore, createEmptyHumanDecisionDraft, decisionSubmittability, buildHumanDecisionCommand } from "../../r6k/index";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
function equal(actual: unknown, expected: unknown, message: string): void {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const trackedSet = new Set(tracked);
const cache = new Map<string, ts.SourceFile>();
function source(path: string): ts.SourceFile {
  assert(trackedSet.has(path), `authority source must be tracked: ${path}`);
  let parsed = cache.get(path);
  if (!parsed) {
    parsed = ts.createSourceFile(path, readFileSync(join(process.cwd(), path), "utf8"), ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    cache.set(path, parsed);
  }
  return parsed;
}
function nodes(path: string): ts.Node[] {
  const result: ts.Node[] = [];
  function visit(node: ts.Node): void { result.push(node); ts.forEachChild(node, visit); }
  visit(source(path));
  return result;
}
const printer = ts.createPrinter({ removeComments: true });
const compact = (text: string) => text.replace(/\s+/g, "");
function contract(path: string, ...tokens: string[]): void {
  const code = compact(printer.printFile(source(path)));
  for (const token of tokens) assert(code.includes(compact(token)), `${path} executable source contract missing: ${token}`);
}
function calls(path: string, name: string): ts.CallExpression[] {
  return nodes(path).filter((node): node is ts.CallExpression => ts.isCallExpression(node) &&
    (ts.isIdentifier(node.expression) ? node.expression.text === name : ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === name));
}
function call(path: string, name: string, ...tokens: string[]): void {
  const matching = calls(path, name);
  assert(matching.length > 0, `${path} must actually call ${name}`);
  for (const token of tokens) assert(matching.some((node) => compact(node.getText(source(path))).includes(compact(token))), `${path}/${name} call argument missing: ${token}`);
}
function importEdge(from: string, to: string, binding?: string): void {
  const imports = source(from).statements.filter(ts.isImportDeclaration);
  assert(imports.some((node) => {
    if (!ts.isStringLiteral(node.moduleSpecifier) || !node.moduleSpecifier.text.startsWith(".")) return false;
    const base = posix.normalize(posix.join(dirname(from).replaceAll("\\", "/"), node.moduleSpecifier.text));
    return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].includes(to) &&
      (!binding || Boolean(node.importClause && !node.importClause.isTypeOnly && node.importClause.getText(source(from)).includes(binding)));
  }), `tracked import edge missing: ${from} -> ${to}${binding ? ` (${binding})` : ""}`);
}
function component(from: string, to: string, binding: string): void {
  importEdge(from, to, binding);
  assert(nodes(from).some((node) => (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(source(from)) === binding), `${from} must mount ${binding}`);
}
const appSources = tracked.filter((path) => path.startsWith("app/") && /\.tsx?$/.test(path));
function callers(name: string): string[] { return appSources.filter((path) => calls(path, name).length > 0).sort(); }
function noCalls(paths: readonly string[], ...names: string[]): void {
  for (const path of paths) for (const name of names) equal(calls(path, name).length, 0, `${path} has no ${name} invocation`);
}
function urlFor(path: string): string {
  return "/" + path.split("/").slice(1, -1).filter((segment) => !/^\(.+\)$/.test(segment)).join("/");
}
const topology = {
  pages: tracked.filter((path) => /^app\/.+\/page\.tsx$/.test(path)).map((file) => ({ url: urlFor(file), file })),
  layouts: tracked.filter((path) => /^app\/(?:.*\/)?layout\.tsx$/.test(path)),
  api: tracked.filter((path) => /^app\/api\/.*\/route\.ts$/.test(path)).map((file) => ({ url: urlFor(file), file })),
};
const W = "app/workspace/WorkspaceR4Client.tsx";
const WB = "app/workspace/RealWorkspaceR4Bootstrap.tsx";
const WD = "app/workspace/HumanDecisionDialog.tsx";
const V = "app/workspace-v2/WorkspaceV2Client.tsx";
const VB = "app/workspace-v2/RealWorkspaceBootstrap.tsx";
const VE = "app/workspace-v2/WorkspaceRouteEntry.tsx";
const VD = "app/workspace-v2/components/decision-dialogs.tsx";
const P = "app/(workstation)/WorkstationProvider.tsx";
const C = "app/(workstation)/HumanDecisionComposer.tsx";
const L = "app/workspace-legacy/page.tsx";
const R = "app/report/page.tsx";
const N = "app/new/page.tsx";
const S = "app/(workstation)/settings/settings-client.tsx";
const A = "app/api/github-app/route.ts";
const H = "app/api/github-app/webhook/route.ts";
const G = "app/api/generate-report/route.ts";
const F = "app/api/fetch-pr-diff/route.ts";
const X = "app/api/github-workspace/route.ts";
const ADAPTER = "lib/workspace-v2/real-adapter.ts";
const DECISIONS = "lib/workspace-v2/decision-mutations.ts";
const PROGRESS = "lib/workspace-v2/persistence.ts";

// Metadata describes topology, not capability conclusions. Capability cells start UNKNOWN.
const browserInventory = [
  { url: "/", file: "app/(public)/page.tsx", entry: "app/_public-r5-reference-reconstruction/R5ReferenceReconstruction.tsx", projection: "bundled reconstruction-content/canonical demo scenes", classification: "public demonstration" },
  { url: "/new", file: N, entry: N, projection: "submitted/imported input -> generated Report; read-back Report history", classification: "real intake; explicit sample remains session-only" },
  { url: "/report", file: R, entry: R, projection: "real adapter over local history OR transient session/demo Storage", classification: "read-only durable/session/demo Case File" },
  { url: "/workspace", file: "app/workspace/page.tsx", entry: W, projection: "real adapter default; explicit fixture adapter", classification: "R4 real default; fixture read-only" },
  { url: "/workspace-v2", file: "app/workspace-v2/page.tsx", entry: V, projection: "fixture default; explicit real adapter", classification: "QA/compatibility; separate V2 client" },
  { url: "/workspace-legacy", file: L, entry: L, projection: "workspace-scoped real Report history + review state", classification: "rollback generation; real persistence" },
  { url: "/reviews", file: "app/(workstation)/reviews/[[...segments]]/page.tsx", entry: "app/(workstation)/WorkspaceHost.tsx", projection: "layout Provider real adapter -> indexReviews -> selected Case", classification: "active workstation; optional catch-all; derived ReviewId" },
  { url: "/home", file: "app/home/page.tsx", entry: "app/home/home-client.tsx", projection: "operational projection -> real/explicit demo adapter", classification: "read-only operational overview" },
  { url: "/review-operations", file: "app/review-operations/page.tsx", entry: "app/review-operations/review-operations-client.tsx", projection: "operational projection -> real/explicit demo adapter", classification: "read-only operational collection" },
  { url: "/policies", file: "app/(workstation)/policies/page.tsx", entry: "app/(workstation)/policies/review-policies-client.tsx", projection: "bundled REVIEW_POLICY_PROFILES; layout loads real Cases", classification: "inspection; no policy writer" },
  { url: "/review-policies", file: "app/review-policies/page.tsx", entry: "app/review-policies/page.tsx", projection: "existing redirect to /policies with preserved query", classification: "redirect compatibility" },
  { url: "/integrations", file: "app/(workstation)/integrations/page.tsx", entry: "app/(workstation)/integrations/page.tsx", projection: "API environment capability status; layout loads real Cases", classification: "read-only capability inspection" },
  { url: "/settings", file: "app/(workstation)/settings/page.tsx", entry: S, projection: "browser Report history + API provider status; layout loads real Cases", classification: "history retention controls" },
  { url: "/team", file: "app/team/page.tsx", entry: "app/team/page.tsx", projection: "browser workspace metadata presence + static boundaries", classification: "inspection; shared AppShell workspace selection" },
  { url: "/github-action", file: "app/github-action/page.tsx", entry: "app/github-action/page.tsx", projection: "bundled workflow blueprint", classification: "non-executing blueprint" },
  { url: "/slack-handoff", file: "app/slack-handoff/page.tsx", entry: "app/slack-handoff/page.tsx", projection: "bundled copyable message blueprints", classification: "clipboard-only blueprint" },
  { url: "/visual-lab/workspace-r4", file: "app/visual-lab/workspace-r4/page.tsx", entry: "app/visual-lab/workspace-r4/WorkspaceR4Lab.tsx", projection: "CANONICAL_REVIEW/REVIEWS local fixtures", classification: "demo interactions; session lab preferences" },
  { url: "/visual-lab/workspace-v2", file: "app/visual-lab/workspace-v2/page.tsx", entry: "app/visual-lab/workspace-v2/WorkspaceV2Client.tsx", projection: "local fixtures/decision-fixtures", classification: "demo interactions; no product writer" },
  { url: "/visual-lab/workstation-r6b", file: "app/visual-lab/workstation-r6b/page.tsx", entry: "app/visual-lab/workstation-r6b/R6BLabClient.tsx", projection: "buildFixtureSnapshot", classification: "demo interactions; no product writer" },
] as const;
type Cell = "YES" | "NO" | "NOT_APPLICABLE" | "UNKNOWN";
const browserColumns = ["reads handoff", "route tree reaches Report history", "explicitly mutates Report history", "history read can normalize/prune persisted history", "route tree loads real Case projection", "writes workflow", "writes condition/action progress", "records decision", "persists draft", "headless acknowledgement", "fixture/demo projection"] as const;
const apiColumns = ["generates Report", "external network", "reads App store", "writes App store", "reads browser store", "writes browser store", "mutates App/repository lifecycle state", "mutates repository enablement/configuration", "mutates verification/recheck"] as const;
type BrowserRow = typeof browserInventory[number]["url"];
type BrowserColumn = typeof browserColumns[number];
type ApiColumn = typeof apiColumns[number];
const historyMutationColumns: readonly BrowserColumn[] = ["explicitly mutates Report history", "history read can normalize/prune persisted history"];
const browserMatrix = Object.fromEntries(browserInventory.map(({ url }) => [url, Object.fromEntries(browserColumns.map((col) => [col, "UNKNOWN"]))])) as Record<BrowserRow, Record<BrowserColumn, Cell>>;
const apiMatrix = Object.fromEntries(topology.api.map(({ url }) => [url, Object.fromEntries(apiColumns.map((col) => [col, "UNKNOWN"]))])) as Record<string, Record<ApiColumn, Cell>>;
const matrixEvidence: { ra: string; row: string; column: string; value: Cell; basis: string }[] = [];
const historyAuthority: { route: BrowserRow; explicit: readonly string[]; readPath: string; normalization: Cell; evidence: string }[] = [];
let historyReadSideEffectResult: {
  directWritableReadRewroteBytes: boolean;
  readOnlyFacadeRewroteBytes: boolean;
  realAdapterProjectionRewroteBytes: boolean;
  inputEntryCount: number;
  validatedEntryCount: number;
  adapterProjectedCaseCount: number;
} | null = null;
function observe(ra: string, row: BrowserRow, column: BrowserColumn, value: Cell, basis: string): void {
  const old = browserMatrix[row][column];
  assert(old === "UNKNOWN" || old === value, `conflicting ${row}/${column} observation`);
  browserMatrix[row][column] = value;
  matrixEvidence.push({ ra, row, column, value, basis });
}
function apiObserve(row: string, column: ApiColumn, value: Cell, basis: string): void {
  assert(apiMatrix[row], `API row was discovered: ${row}`);
  const old = apiMatrix[row][column];
  assert(old === "UNKNOWN" || old === value, `conflicting API observation ${row}/${column}`);
  apiMatrix[row][column] = value;
  matrixEvidence.push({ ra: "RA12", row, column, value, basis });
}
const observations: { ra: string; evidence: string; behaviour: string; files: readonly string[] }[] = [];
const tests: { ra: string; run: () => void | Promise<void> }[] = [];
function test(ra: string, evidence: string, behaviour: string, files: readonly string[], run: () => void | Promise<void>): void {
  tests.push({ ra, run: async () => { await run(); observations.push({ ra, evidence, behaviour, files }); } });
}
class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}
async function seed(head = true) {
  const storage = new MemoryStorage();
  const input = { title: "BS0.9 shared route writer", repository: "lintel/bs0-route-authority", technology: "TypeScript", inputSource: "github-pr" as const, pullRequestNumber: 909, diff: ["diff --git a/src/payments.ts b/src/payments.ts", "index 1111111..2222222 100644", "--- a/src/payments.ts", "+++ b/src/payments.ts", "@@ -1 +1 @@", "-export const charge = once;", "+export const charge = retryPaymentWithoutIdempotency;"].join("\n") };
  const report = generateReport(input);
  const manifest = createCanonicalReviewRunManifest({ input, report, analysisSource: "deterministic", pullRequestNumber: 909, baseSha: "base-bs0-route", ...(head ? { headSha: "head-bs0-route" } : {}), createdAt: "2026-09-15T09:00:00.000Z", completedAt: "2026-09-15T09:00:00.000Z" });
  addReportToHistory(storage, report, "deterministic", manifest);
  const entry = readReportHistory(storage)[0];
  assert(entry, "production history writer created an entry");
  const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: entry.createdAt });
  assert(snapshot.status === "ready", "seed must project real ready Cases");
  const detail = snapshot.cases.find((item) => item.caseId === snapshot.defaultCaseId);
  assert(detail, "seed default Case exists");
  return { storage, report, entry, detail };
}
function draftContext(detail: CaseDetail) {
  const reviewId = indexReviews([detail]).reviewIdByCaseId.get(detail.caseId);
  assert(reviewId, "ReviewId derives from current projection");
  const context = decisionDraftContextFor(reviewId, detail, (_id, current) => current.decisionMutation.kind === "available"
    ? { status: "available", decisionSubjectId: decisionSubjectIdFromCapability(current.decisionMutation.caseId) }
    : { status: "unavailable", reason: "no writable capability" });
  return { reviewId, context };
}

test("RA1", "SOURCE-CONTRACT + EXECUTABLE (pure route grammar/source selection)", "Tracked topology contains both route groups, optional catch-all Reviews, independent Workspace clients, three Workspace labs and five APIs; route names/comments are not authority.", ["app/workspace/page.tsx", VE, "app/(workstation)/layout.tsx", "lib/r6c/route-contract.ts"], () => {
  equal(topology.api.map(({ file }) => file), [F, G, A, H, X].sort(), "complete API topology");
  for (const row of browserInventory) {
    assert(topology.pages.some((item) => item.file === row.file), `discovered browser page ${row.url}`);
    source(row.entry);
  }
  equal(topology.layouts, ["app/(public)/layout.tsx", "app/(workstation)/layout.tsx", "app/layout.tsx", "app/workspace-legacy/layout.tsx"], "all current layouts");
  component("app/(public)/page.tsx", browserInventory[0].entry, "R5ReferenceReconstruction");
  component("app/workspace/page.tsx", WB, "RealWorkspaceR4Bootstrap");
  component("app/workspace/page.tsx", W, "WorkspaceR4Client");
  importEdge("app/workspace-v2/page.tsx", VE, "renderWorkspaceRoute");
  call("app/workspace-v2/page.tsx", "renderWorkspaceRoute", '"fixture"');
  component(VE, VB, "RealWorkspaceBootstrap"); component(VE, V, "WorkspaceV2Client");
  noCalls(["app/workspace/page.tsx"], "renderWorkspaceRoute");
  for (const [value, expectedReal, expectedFixture] of [[undefined, "real", "fixture"], ["invalid", "real", "fixture"], ["real", "real", "real"], ["fixture", "fixture", "fixture"]] as const) {
    equal(resolveWorkspaceSource(value, "real"), expectedReal, "R4 source boundary");
    equal(resolveWorkspaceSource(value, "fixture"), expectedFixture, "V2 source boundary");
  }
  for (const path of ["/reviews", "/reviews/opaque", "/reviews/opaque/overview", "/reviews/opaque/change", "/reviews/opaque/evidence", "/reviews/opaque/requirements", "/reviews/opaque/history"]) equal(parseRoute(path).status, "valid", `actual Reviews grammar ${path}`);
  equal(parseRoute("/reviews/opaque/unsupported").status, "invalid", "catch-all does not establish arbitrary mode authority");
  contract("app/(workstation)/reviews/[[...segments]]/page.tsx", "return null");
  for (const row of browserInventory) for (const col of browserColumns) equal(browserMatrix[row.url][col], "UNKNOWN", "matrix has no prefilled capabilities");
  observeSupportingRoutes();
});

test("RA2", "SOURCE-CONTRACT", "/report reads durable history through the read-only real adapter, or explicit non-consuming session/demo handoff; it displays projected Human Decision but exposes no durable review mutation.", [R, ADAPTER, "lib/workspace-v2/read-only-storage.ts"], () => {
  importEdge(R, ADAPTER, "createRealWorkspaceAdapter"); call(R, "createRealWorkspaceAdapter", "storage");
  call(R, "readReportHistory", "readOnlyStorage(window.localStorage)");
  call(R, "getItem", "GENERATED_REPORT_STORAGE_KEY");
  contract(R, 'params.get("session") === "1"', 'params.get("demo") === "1"', "transientStorage(payload", "caseDetail.decision");
  noCalls([R], "addReportToHistory", "deleteReportFromHistory", "clearReportHistory", "createWorkspacePersistence", "createWorkspaceDecisionService", "recordDecision", "writeReviewState", "writeConditionProgress", "removeItem");
  for (const col of browserColumns.filter((col) => !historyMutationColumns.includes(col))) observe("RA2", "/report", col, ["reads handoff", "route tree reaches Report history", "route tree loads real Case projection", "fixture/demo projection"].includes(col) ? "YES" : col === "headless acknowledgement" ? "NOT_APPLICABLE" : "NO", "CaseFilePage resolver + read-only adapter; no production review writer calls");
});

test("RA3", "SOURCE-CONTRACT", "/workspace defaults to real R4 projection and supplies shared persistence/decision services; only condition progress is invoked from WorkspacePersistence, with no review-status/action/draft caller.", ["app/workspace/page.tsx", WB, W, WD, PROGRESS, DECISIONS], () => {
  call("app/workspace/page.tsx", "resolveWorkspaceSource", '"real"');
  for (const name of ["createRealWorkspaceAdapter", "createWorkspacePersistence", "createWorkspaceDecisionService"]) call(WB, name, "window.localStorage");
  component(WB, W, "WorkspaceR4Client"); component(W, WD, "HumanDecisionDialog");
  call(W, "applyConditionProgress", "capability.conditionKey"); call(W, "recordDecision", "capability.currentHeadSha");
  call(W, "supersedeDecision"); call(W, "reaffirmDecision"); call(W, "withdrawDecision");
  noCalls([W, WB, WD], "applyReviewStatus", "writeReviewActionStatus", "addReportToHistory", "appendDecisionHistoryEvent");
  for (const col of browserColumns.filter((col) => !historyMutationColumns.includes(col))) observe("RA3", "/workspace", col, ["route tree reaches Report history", "route tree loads real Case projection", "writes condition/action progress", "records decision", "headless acknowledgement", "fixture/demo projection"].includes(col) ? "YES" : "NO", "real R4 bootstrap and actual R4 client/dialog calls; fixture branch supplies no services");
});

test("RA4", "SOURCE-CONTRACT + EXECUTABLE (production fixture adapter)", "/workspace-v2 defaults to fixtures; source=real constructs real adapter plus the same two service factories as R4, through a different V2 UI. Real mode exposes review status, conditions and decisions; fixture mode supplies no writers.", [VE, VB, V, VD, "lib/workspace-v2/fixture-adapter.ts"], async () => {
  call(VE, "resolveWorkspaceSource", "defaultSource"); component(VB, V, "WorkspaceV2Client");
  for (const name of ["createRealWorkspaceAdapter", "createWorkspacePersistence", "createWorkspaceDecisionService"]) call(VB, name, "window.localStorage");
  call(V, "applyReviewStatus"); call(V, "applyConditionProgress"); call(V, "recordDecision"); call(V, "reaffirmDecision");
  component(V, VD, "DecisionCreationDialog"); component(V, VD, "DecisionReaffirmDialog");
  const fixture = await createFixtureWorkspaceAdapter().loadSnapshot({ scenario: "default" });
  assert(fixture.status === "ready" && fixture.provenance.isSample, "actual fixture adapter marks demo projection");
  assert(fixture.cases.every((item) => item.decisionMutation.kind === "sample" && item.reviewStateMutation.kind === "read-only-sample"), "fixture capability boundary is sample read-only");
  for (const col of browserColumns.filter((col) => !historyMutationColumns.includes(col))) observe("RA4", "/workspace-v2", col, ["route tree reaches Report history", "route tree loads real Case projection", "writes workflow", "writes condition/action progress", "records decision", "headless acknowledgement", "fixture/demo projection"].includes(col) ? "YES" : "NO", "real V2 service injection/callers; default fixture branch is read-only");
});

test("RA5", "SOURCE-CONTRACT + EXECUTABLE (real adapter/index)", "/reviews is implemented by the workstation layout/Provider/Shell/WorkspaceHost rather than its null page. It indexes real Cases using the default conservative derived ReviewId; HumanDecisionComposer calls the shared decision writer via Provider, with no workflow/progress service invocation.", ["app/(workstation)/layout.tsx", "app/(workstation)/WorkstationShell.tsx", "app/(workstation)/WorkspaceHost.tsx", "app/(workstation)/SelectedReviewFoundation.tsx", P, C, "lib/r6c/review-identity.ts"], async () => {
  component("app/(workstation)/layout.tsx", P, "WorkstationProvider");
  component("app/(workstation)/layout.tsx", "app/(workstation)/WorkstationShell.tsx", "WorkstationShell");
  component("app/(workstation)/WorkstationShell.tsx", "app/(workstation)/WorkspaceHost.tsx", "WorkspaceHost");
  component("app/(workstation)/WorkspaceHost.tsx", "app/(workstation)/SelectedReviewFoundation.tsx", "SelectedReviewFoundation");
  contract("app/(workstation)/SelectedReviewFoundation.tsx", "humanDecision.open(event.currentTarget)");
  component(P, C, "HumanDecisionComposer"); call(P, "createRealWorkspaceAdapter", "storage");
  call(P, "indexReviews", 'snapshot.status === "ready" ? snapshot.cases : []'); call(P, "createWorkspaceDecisionService", "browserStorage.current");
  for (const name of ["recordDecision", "supersedeDecision", "reaffirmDecision", "withdrawDecision"]) call(P, name, "command");
  noCalls([P, C, "app/(workstation)/RequirementsMode.tsx", "app/(workstation)/RequirementRow.tsx", "app/(workstation)/ContextualInspector.tsx"], "createWorkspacePersistence", "applyReviewStatus", "applyConditionProgress", "writeReviewActionStatus");
  const { detail, storage } = await seed(); const before = [...storage.values]; const index = indexReviews([detail]);
  equal(index.reviewIdByCaseId.get(detail.caseId), `case:${detail.caseId.length}:${detail.caseId}`, "route identity is derived from Case");
  equal([...storage.values], before, "indexing creates no persistent Review");
  for (const col of browserColumns.filter((col) => !historyMutationColumns.includes(col))) observe("RA5", "/reviews", col, ["route tree reaches Report history", "route tree loads real Case projection", "records decision", "persists draft"].includes(col) ? "YES" : "NO", "layout Provider real adapter/index + composer; no product workflow/progress callers");
});

test("RA6", "SOURCE-CONTRACT", "Legacy projects real workspace-scoped history, writes scoped review status/ownership and separate decision-history events, removes reports/review-state/history records and writes a session handoff. It has no explicit Human Decision, modern condition/action or draft writer.", [L, "app/workspace-legacy/layout.tsx", "lib/team-workspace.ts", "lib/review-state.ts", "lib/decision-history.ts"], () => {
  call(L, "readReportHistory", "window.localStorage"); call(L, "ensureWorkspaceStore"); call(L, "writeReviewState", "stateKey");
  contract(L, 'workspaceScopedReviewKey(activeWorkspaceId ?? "local", group.key)');
  call(L, "appendDecisionHistoryEvent"); call(L, "deleteReportFromHistory"); call(L, "removeReviewState"); call(L, "removeDecisionHistory");
  call(L, "readConditionProgress"); call(L, "setItem", "GENERATED_REPORT_STORAGE_KEY");
  noCalls([L], "createWorkspaceDecisionService", "recordDecision", "writeConditionProgress", "writeReviewActionStatus", "createFixtureWorkspaceAdapter", "createRealWorkspaceAdapter");
  for (const col of browserColumns.filter((col) => !historyMutationColumns.includes(col))) observe("RA6", "/workspace-legacy", col, ["route tree reaches Report history", "explicitly mutates Report history", "writes workflow"].includes(col) ? "YES" : col === "headless acknowledgement" ? "NOT_APPLICABLE" : "NO", "direct legacy real-history/scoped workflow calls; no real CaseDetail adapter or modern decision/progress writer");
});

test("RA7", "SOURCE-CONTRACT + EXECUTABLE (composer pre-writer functions and shared decision service)", "R4/V2 use separate ephemeral dialogs: headless acknowledgement allows recording without head, with no canonical-run or persistent-draft prerequisite. Reviews requires a draft with applicable subject/case/run/head basis; missing risk IDs block buildHumanDecisionCommand. Reaffirmation is exposed in all three real paths.", [WD, W, VD, V, C, P, "lib/r6k/composer-state.ts", "lib/r6c/human-decision-draft-boundary.ts", DECISIONS], async () => {
  contract(WD, "const noHead = !detail.github.headSha", "(!noHead || unboundAcknowledged)", 'if (intent === "record" && !valid)', "existing?.needsReaffirmation && detail.github.headSha", "selectedReferences.length > 0 && riskAcknowledged");
  contract(VD, "if (!headRecorded && !noHeadAck)", "if (isAcceptedRisk && chosenRisk.length === 0)", "candidateRiskReferences.filter((reference) => reference.available)");
  component(V, VD, "DecisionCreationDialog"); contract(V, "headRecorded={decisionCap.headRecorded}");
  call(C, "decisionSubmittability", "draft, detail, context"); call(C, "buildHumanDecisionCommand", "draft, detail, context");
  contract(C, "if (!open || !reviewId || !detail || !draft || !context || !basis");
  noCalls([WD, VD], "decisionDraftApplicability", "decisionSubmittability");
  const bound = await seed(); const { reviewId, context } = draftContext(bound.detail);
  const draft = { ...createEmptyHumanDecisionDraft(reviewId, context, null, "2026-09-15T09:00:00.000Z"), selectedOutcome: "request-changes" as const, rationale: "Route composer pre-writer proof" };
  assert(decisionSubmittability(draft, bound.detail, context).submittable, "known head/run draft permits composer command");
  assert(buildHumanDecisionCommand(draft, bound.detail, context), "composer builds actual production command");
  for (const basis of [{ ...context.basis, headSha: null }, { ...context.basis, runId: null }]) {
    const unknown = { ...context, basis };
    const unboundDraft = { ...draft, binding: { ...draft.binding, ...basis } };
    equal(buildHumanDecisionCommand(unboundDraft, bound.detail, unknown), null, "unknown run/head blocked before service invocation even with matching null binding");
  }
  equal(buildHumanDecisionCommand({ ...draft, binding: { ...draft.binding, headSha: "older-head" } }, bound.detail, context), null, "stale draft blocks composer command");
  equal(buildHumanDecisionCommand({ ...draft, selectedOutcome: "approve-with-accepted-risk", acceptedRiskReferenceIds: ["missing-route-risk"] }, bound.detail, context), null, "missing selected risk reference blocks composer command");
  const unbound = await seed(false);
  const result = createWorkspaceDecisionService(unbound.storage).recordDecision({ kind: "record", caseId: unbound.detail.caseId, expectedHeadSha: null, outcome: "request-changes", rationale: "Shared service permits acknowledged headless route submission", references: [], acceptedRiskReferences: [] });
  equal(result.outcome, "persisted", "underlying writer accepts null head; route acknowledgement is a UI gate");
});

test("RA8", "SOURCE-CONTRACT", "Workflow status callers are V2 real mode and legacy scoped helpers. Condition writer is reachable from R4 and V2 real modes. Reviews has no workflow/progress invocation; review-action writer has no current app caller. Injecting a service does not expose every method.", [W, V, L, P, PROGRESS, "lib/review-actions.ts", "lib/review-state.ts", "lib/condition-progress.ts"], () => {
  equal(callers("applyReviewStatus"), [V], "actual modern status caller");
  equal(callers("applyConditionProgress"), [V, W].sort(), "actual shared condition callers");
  equal(callers("writeReviewState"), [L], "direct workflow writer caller");
  equal(callers("writeReviewActionStatus"), [], "exported review-action writer is not current route authority");
  importEdge(PROGRESS, "lib/review-state.ts", "writeReviewState"); call(PROGRESS, "writeReviewState");
  importEdge(PROGRESS, "lib/condition-progress.ts", "writeConditionProgress"); call(PROGRESS, "writeConditionProgress");
});

test("RA9", "SOURCE-CONTRACT + EXECUTABLE (controlled production history read/facade/adapter)", "Explicit history lifecycle callers are New add, legacy delete and Settings clear. Writable direct New/legacy/Settings reads can rewrite pruned/normalized history bytes. Controlled direct production read rewrites bytes; equivalent real adapter and Report read-only facade preserve them. Workstation administration inherits adapter loading from its layout, with Settings also reading directly.", [N, R, L, S, P, "app/(workstation)/layout.tsx", "lib/report-history.ts", ADAPTER, "lib/workspace-v2/read-only-storage.ts"], async () => {
  for (const { url } of browserInventory) for (const col of historyMutationColumns) equal(browserMatrix[url][col], "UNKNOWN", "refined history authority waits for RA9 source/executable evidence");
  equal(callers("addReportToHistory"), [N], "actual add UI caller");
  equal(callers("deleteReportFromHistory"), [L], "actual delete UI caller");
  equal(callers("clearReportHistory"), [S], "actual clear UI caller");
  importEdge(N, "lib/report-history.ts", "addReportToHistory"); call(N, "addReportToHistory", "payload.report");
  contract(N, 'if (source !== "sample")', "persistCanonicalReview(payload)", "entry.canonicalRun?.runId === payload.canonicalRun.runId");
  importEdge(L, "lib/report-history.ts", "deleteReportFromHistory"); call(L, "deleteReportFromHistory", "entry.createdAt");
  component("app/(workstation)/settings/page.tsx", S, "SettingsClient"); importEdge(S, "lib/report-history.ts", "clearReportHistory"); call(S, "clearReportHistory", "window.localStorage");
  contract("lib/report-history.ts", "if (entries.length !== parsed.length) writeReportHistory(storage, entries)");
  equal(callers("readReportHistory"), [N, R, L, S].sort(), "complete direct app history-reader census");
  call(N, "readReportHistory", "window.localStorage");
  call(L, "readReportHistory", "window.localStorage");
  call(S, "readReportHistory", "window.localStorage");
  assert(calls(R, "readReportHistory").every((node) => compact(node.arguments[0]?.getText(source(R)) ?? "") === "readOnlyStorage(window.localStorage)"), "every Report direct history read is guarded");
  importEdge(ADAPTER, "lib/workspace-v2/read-only-storage.ts", "readOnlyStorage");
  contract(ADAPTER, "const storage = readOnlyStorage(rawStorage)");
  call(ADAPTER, "readReportHistory", "storage");
  for (const bootstrap of [WB, VB, P]) { importEdge(bootstrap, ADAPTER, "createRealWorkspaceAdapter"); call(bootstrap, "createRealWorkspaceAdapter"); noCalls([bootstrap], "readReportHistory"); }
  component("app/(workstation)/layout.tsx", P, "WorkstationProvider");
  // AppShell's workspace helpers do not introduce another history-reader path.
  call("app/app-shell.tsx", "ensureWorkspaceStore", "window.localStorage");
  contract("lib/team-workspace.ts", "history: ReportHistoryEntry[] = []");
  noCalls(["app/app-shell.tsx", "lib/team-workspace.ts"], "readReportHistory");

  const { entry } = await seed();
  const controlledEntry = { ...entry, createdAt: "2026-09-15T09:00:00.000Z", inputLabel: "obsolete input label", metadata: { ...entry.metadata, title: "obsolete metadata title" } };
  // Valid non-empty array reaches adapter parsing; unsupported source is pruned by production validation.
  const inputBytes = JSON.stringify([controlledEntry, { ...controlledEntry, source: "unsupported-history-source" }], null, 2);
  function controlledStorage(): MemoryStorage {
    const storage = new MemoryStorage(); storage.setItem(REPORT_HISTORY_STORAGE_KEY, inputBytes); return storage;
  }
  const writable = controlledStorage(); const writableBefore = writable.getItem(REPORT_HISTORY_STORAGE_KEY);
  const validated = readReportHistory(writable);
  equal(validated.length, 1, "production direct history read prunes unsupported entry");
  equal(validated[0].metadata.title, entry.report.pr.title, "production history reader normalizes retained metadata");
  const writableAfter = writable.getItem(REPORT_HISTORY_STORAGE_KEY);
  assert(writableAfter !== writableBefore, "writable production history read rewrites normalization-requiring bytes");
  equal(writableAfter, JSON.stringify(validated), "rewritten bytes are the actual validated production entries");

  const guarded = controlledStorage(); const guardedBefore = [...guarded.values];
  equal(readReportHistory(readOnlyStorage(guarded)), validated, "Report facade reuses the same production validation");
  equal([...guarded.values], guardedBefore, "Report read-only facade suppresses persisted normalization/pruning");
  const adapterStorage = controlledStorage(); const adapterBefore = [...adapterStorage.values];
  const snapshot = await createRealWorkspaceAdapter(adapterStorage).loadSnapshot({ scenario: "default", reportId: controlledEntry.createdAt });
  assert(snapshot.status === "ready", "controlled normalization-requiring history reaches ready real adapter projection");
  equal(snapshot.cases.length, 1, "adapter projects the valid entry and omits the unsupported entry");
  equal([...adapterStorage.values], adapterBefore, "real adapter does not mutate controlled persisted history or other bytes");
  equal(adapterStorage.getItem(REPORT_HISTORY_STORAGE_KEY), inputBytes, "adapter preserves exact original history bytes");
  historyReadSideEffectResult = {
    directWritableReadRewroteBytes: writableAfter !== writableBefore,
    readOnlyFacadeRewroteBytes: guarded.getItem(REPORT_HISTORY_STORAGE_KEY) !== inputBytes,
    realAdapterProjectionRewroteBytes: adapterStorage.getItem(REPORT_HISTORY_STORAGE_KEY) !== inputBytes,
    inputEntryCount: 2, validatedEntryCount: validated.length, adapterProjectedCaseCount: snapshot.cases.length,
  };

  for (const row of browserInventory) {
    const explicit = row.url === "/new" ? ["addReportToHistory"] : row.url === "/workspace-legacy" ? ["deleteReportFromHistory"] : row.url === "/settings" ? ["clearReportHistory"] : [];
    for (const name of explicit) { importEdge(row.entry, "lib/report-history.ts", name); call(row.entry, name); }
    const directWritable = ["/new", "/workspace-legacy", "/settings"].includes(row.url);
    const inherited = ["/policies", "/integrations", "/settings", "/reviews"].includes(row.url);
    const operational = ["/home", "/review-operations"].includes(row.url);
    const realWorkspace = ["/workspace", "/workspace-v2"].includes(row.url);
    const readPath = row.url === "/report" ? "CaseFilePage: readOnlyStorage direct reads + guarded real adapter; session/demo in-memory projection" :
      directWritable ? `${row.entry}: readReportHistory(window.localStorage)${inherited ? "; real Case loading inherited from workstation layout / WorkstationProvider -> guarded adapter" : ""}` :
        inherited ? "inherited from workstation layout / WorkstationProvider -> createRealWorkspaceAdapter -> readOnlyStorage" :
          realWorkspace ? `${row.url} real bootstrap -> createRealWorkspaceAdapter -> readOnlyStorage; fixture branch has no browser history read` :
            operational ? "operational projection -> createRealWorkspaceAdapter -> readOnlyStorage; explicit demo uses fixture adapter" : "no route-tree Report-history reader established; AppShell workspace metadata helpers do not read history";
    const evidence = directWritable ? "SOURCE-CONTRACT direct writable route caller + EXECUTABLE production reader rewrote equivalent controlled bytes" :
      row.url === "/report" || inherited || realWorkspace || operational ? "SOURCE-CONTRACT route/facade/adapter chain + EXECUTABLE equivalent controlled facade/adapter preserved bytes" : "SOURCE-CONTRACT negative reader census and projection imports";
    observe("RA9", row.url, "explicitly mutates Report history", explicit.length ? "YES" : "NO", explicit.length ? `actual route caller: ${row.entry} -> ${explicit.join(", ")}; read normalization is excluded` : "complete add/delete/clear route-caller census establishes no explicit lifecycle caller in this route tree");
    observe("RA9", row.url, "history read can normalize/prune persisted history", directWritable ? "YES" : "NO", `${readPath}; ${evidence}`);
    historyAuthority.push({ route: row.url, explicit, readPath, normalization: directWritable ? "YES" : "NO", evidence });
  }
  observe("RA9", "/new", "route tree reaches Report history", "YES", "persistCanonicalReview direct read-back");
  observe("RA9", "/settings", "route tree reaches Report history", "YES", "page-level SettingsClient direct history read; real Case loading inherited from workstation layout / WorkstationProvider");
});

test("RA10", "SOURCE-CONTRACT", "NewReviewPage and legacy openReport write lintel.generatedReport.v1 in sessionStorage. /report reads only session=1 (reportId takes precedence), without consume/remove. New persists separately for non-samples; handoff projection uses an in-memory history-shaped Storage, creating transient CaseDetail but no durable Case/Review. Legacy pushes bare /report, so its handoff is not selected by that URL.", [N, L, R, "lib/report-generator.ts"], () => {
  equal(GENERATED_REPORT_STORAGE_KEY, "lintel.generatedReport.v1", "handoff key");
  equal(appSources.filter((path) => calls(path, "setItem").some((node) => node.arguments[0]?.getText(source(path)) === "GENERATED_REPORT_STORAGE_KEY")).sort(), [N, L].sort(), "actual handoff writers");
  equal(appSources.filter((path) => calls(path, "getItem").some((node) => node.arguments[0]?.getText(source(path)) === "GENERATED_REPORT_STORAGE_KEY")), [R], "actual handoff reader");
  call(N, "setItem", "sessionStorage", "JSON.stringify(payload)"); call(L, "setItem", "window.sessionStorage");
  contract(L, 'router.push("/report")'); contract(R, "if (requested !== null)", "if (sessionRequested)", "new Map<string, string>", "REPORT_HISTORY_STORAGE_KEY");
  noCalls([R], "removeItem", "addReportToHistory");
  observe("RA10", "/new", "reads handoff", "NO", "writes but has no handoff getItem");
  for (const col of browserColumns) if (browserMatrix["/new"][col] === "UNKNOWN") observe("RA10", "/new", col, col === "headless acknowledgement" ? "NOT_APPLICABLE" : "NO", "NewReviewPage generates submitted/sample input and persists history separately; no CaseDetail/decision/workflow/draft projection or writer");
});

test("RA11", "SOURCE-CONTRACT + EXECUTABLE (production draft store)", "Only WorkstationProvider constructs HumanDecisionDraftStore: selected derived ReviewId hydrates a draft; dirty edits debounce/write and flush; discard and successful canonical decisions removeValid; unreadable draft replacement is explicit. Route navigation/context does not create persistent Review ownership. Older real Workspace paths do not use this store.", [P, C, "lib/r6k/decision-draft.ts", "lib/r6c/review-identity.ts"], async () => {
  equal(appSources.filter((path) => nodes(path).some((node) => ts.isNewExpression(node) && node.expression.getText(source(path)) === "HumanDecisionDraftStore")), [P], "actual draft store constructor user");
  call(P, "read", "reviewId"); call(P, "write", "reviewId, draft"); call(P, "removeValid", "reviewId"); call(P, "replaceUnreadable", "selection.reviewId");
  contract(P, "if (selectedReviewId && selectedCase) hydrateDraft(selectedReviewId, selectedCase)", "if (!draft || !isHumanDecisionDraftDirty(draft)) return null", 'if (selection.status !== "available" || currentSnapshot.status !== "ready") return', "const reviewId = draft.binding.reviewId");
  const { storage, detail } = await seed(); const { reviewId, context } = draftContext(detail);
  const store = new HumanDecisionDraftStore(storage); const empty = createEmptyHumanDecisionDraft(reviewId, context, null, "2026-09-15T09:00:00.000Z");
  equal(store.read(reviewId).status, "absent", "index/navigation alone has no persisted draft");
  assert(store.write(reviewId, { ...empty, rationale: "Route-owned interaction, ReviewId-owned record" }).persisted, "production store writes derived ReviewId draft");
  equal(new HumanDecisionDraftStore(storage).read(reviewId).status, "valid", "fresh store reads shared persisted draft");
  assert(storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY), "actual draft persistence key");
  assert(new HumanDecisionDraftStore(storage).removeValid(reviewId).removed, "production draft removal");
});

test("RA12", "SOURCE-CONTRACT", "Five APIs retain distinct authority: webhook mutates installation/repository/delivery/PR/analysis/comment lifecycle; github-app controls repository enablement and separately records verification/rechecks. Webhook upsert defaults/preserves enabled metadata but is not an operator enablement/configuration caller. Other APIs are read/import/generation paths without browser or App persistence.", [F, G, A, H, X, "lib/github-app-store.ts", "lib/github-app-auth.ts", "lib/github-app-comments.ts"], () => {
  for (const { url } of topology.api) for (const col of apiColumns) equal(apiMatrix[url][col], "UNKNOWN", "API authority waits for RA12 source evidence");
  const methods: Record<string, string[]> = { [F]: ["POST"], [G]: ["GET", "POST"], [A]: ["GET", "POST"], [H]: ["POST"], [X]: ["GET", "POST"] };
  // Verification/recheck and operator enablement have their own columns, not lifecycle authority.
  const lifecycleWriters = ["recordDelivery", "upsertInstallation", "upsertRepository", "markRepositoryRemoved", "updateDeliveryState", "markPullRequestProcessing", "completePullRequestAnalysis", "failPullRequestAnalysis", "markCommentPublishing", "completeCommentPublishing", "failCommentPublishing"];
  for (const name of lifecycleWriters) { equal(callers(name), [H], `actual lifecycle route caller ${name}`); importEdge(H, "lib/github-app-store.ts", name); call(H, name); }
  equal(callers("setRepositoryEnabled"), [A], "only operator repository-enable route caller");
  importEdge(A, "lib/github-app-store.ts", "setRepositoryEnabled"); call(A, "setRepositoryEnabled", "installationId, repositoryId, enabled");
  equal(callers("addRunVerification"), [A], "actual verification route caller");
  equal(callers("addRunContractRecheck"), [A], "actual recheck route caller");
  contract("lib/github-app-store.ts", "enabled: existing?.enabled ?? true", "record.enabled = enabled");
  for (const { url, file } of topology.api) {
    const actual = source(file).statements.filter(ts.isFunctionDeclaration).filter((node) => node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)).map((node) => node.name?.text).filter((name) => ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(name ?? ""));
    equal(actual, methods[file], `actual HTTP exports ${url}`);
    noCalls([file], "readReportHistory", "addReportToHistory", "writeReviewState", "writeHumanDecisionLedger");
    assert(!nodes(file).some((node) => ts.isIdentifier(node) && ["localStorage", "sessionStorage"].includes(node.text)), `${url} has no browser storage reference`);
    const appStore = file === A || file === H;
    const generating = file === G || file === A || file === H;
    const lifecycle = lifecycleWriters.some((name) => calls(file, name).length > 0);
    const enablement = calls(file, "setRepositoryEnabled").length > 0;
    const verification = calls(file, "addRunVerification").length > 0 || calls(file, "addRunContractRecheck").length > 0;
    if (generating) call(file, "generateReport");
    if (appStore) importEdge(file, "lib/github-app-store.ts");
    if (file === F || file === G || file === X) call(file, "fetch");
    else { importEdge(file, "lib/github-app-auth.ts", "installationFetch"); call(file, "installationFetch"); }
    for (const col of apiColumns) apiObserve(url, col,
      col === "external network" ? "YES" : col === "generates Report" ? generating ? "YES" : "NO" :
        ["reads App store", "writes App store"].includes(col) ? appStore ? "YES" : "NO" :
          col === "mutates App/repository lifecycle state" ? lifecycle ? "YES" : "NO" :
            col === "mutates repository enablement/configuration" ? enablement ? "YES" : "NO" :
              col === "mutates verification/recheck" ? verification ? "YES" : "NO" : "NO", `${file}: actual imported/called writer census; lifecycle=installation/repository metadata, delivery, PR, analysis/comment; enablement=setRepositoryEnabled; verification/rechecks separate; App store owns persistence`);
  }
  call(A, "readGitHubAppStore"); call(A, "addRunVerification"); call(A, "addRunContractRecheck"); call(A, "setRepositoryEnabled");
  for (const name of ["recordDelivery", "upsertInstallation", "upsertRepository", "markRepositoryRemoved", "completePullRequestAnalysis", "completeCommentPublishing", "findCompletedAnalysis", "repositoryIsEnabled"]) call(H, name);
  call(H, "publishGitHubDecisionComment");
  contract("lib/github-app-store.ts", '"github-app-store.json"');
});

test("RA13", "SOURCE-CONTRACT + EXECUTABLE (one injected MemoryStorage; no route execution)", "R4, V2 real and Reviews are wired to the same WorkspaceDecisionService/Human Decision ledger; R4 and V2 share condition service/store. A shared production service write is reloaded through independent real-adapter instances and pure Review indexing, proving store-owned visibility without claiming browser cross-route execution. Legacy uses the same review-state helper but scoped keys differ.", [WB, VB, P, DECISIONS, PROGRESS, ADAPTER, L], async () => {
  for (const bootstrap of [WB, VB, P]) importEdge(bootstrap, DECISIONS, "createWorkspaceDecisionService");
  importEdge(WB, PROGRESS, "createWorkspacePersistence"); importEdge(VB, PROGRESS, "createWorkspacePersistence");
  const { storage, report, entry, detail } = await seed();
  const persistence = createWorkspacePersistence(storage);
  equal(persistence.applyReviewStatus({ kind: "review-status", caseId: detail.caseId, status: "Reviewed" }).outcome, "persisted", "shared modern workflow service writes");
  const conditions = reportConditions(report); assert(conditions.length > 0, "seed has actual canonical conditions");
  equal(persistence.applyConditionProgress({ kind: "condition-progress", caseId: detail.caseId, conditionKey: conditionKey(conditions[0]), intent: "clear" }).outcome, "persisted", "shared condition service writes");
  assert(detail.decisionMutation.kind === "available", "seed decision capability is writable");
  equal(createWorkspaceDecisionService(storage).recordDecision({ kind: "record", caseId: detail.caseId, expectedHeadSha: detail.decisionMutation.currentHeadSha, outcome: "request-changes", rationale: "Shared store route wiring proof", references: [], acceptedRiskReferences: [] }).outcome, "persisted", "shared production decision writer");
  for (const key of [REVIEW_STATE_STORAGE_KEY, CONDITION_PROGRESS_STORAGE_KEY, HUMAN_DECISION_LEDGER_STORAGE_KEY]) assert(storage.getItem(key), `actual persisted shared key ${key}`);
  const before = [...storage.values];
  for (let reader = 0; reader < 2; reader++) {
    const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: entry.createdAt });
    assert(snapshot.status === "ready", "independent adapter reload is ready");
    const current = snapshot.cases.find((item) => item.caseId === detail.caseId); assert(current, "written Case remains projected");
    assert(current.decision.status === "recorded" && current.decision.outcome === "request-changes", "shared decision visible through real projection");
    assert(current.reviewStateMutation.kind === "available" && current.reviewStateMutation.currentStatus === "Reviewed", "shared workflow visible through real projection");
    assert(current.requirements.some((item) => item.conditionProgress.kind === "available" && item.conditionProgress.conditionKey === conditionKey(conditions[0]) && item.conditionProgress.cleared), "shared condition visible through real projection");
    equal(indexReviews(snapshot.cases).reviewIdByCaseId.get(detail.caseId), `case:${detail.caseId.length}:${detail.caseId}`, "workstation index still derives identity");
  }
  equal([...storage.values], before, "adapter/index reads do not own or rewrite persistence");
});

test("RA14", "SOURCE-CONTRACT (earlier verified observations)", "Authority disagreements: read-only Report vs durable decision routes; separate R4/V2 clients with different status capability/source defaults; Reviews alone has durable drafts and stricter known run/head gates but no workflow/condition caller; legacy scoped workflow/deletion without explicit decision; legacy bare /report navigation ignores its session handoff.", [R, W, V, P, C, L], () => {
  equal(browserMatrix["/workspace"]["writes workflow"], "NO", "R4 injected service has no status caller");
  equal(browserMatrix["/workspace-v2"]["writes workflow"], "YES", "V2 actually invokes status service");
  equal(browserMatrix["/reviews"]["persists draft"], "YES", "workstation durable draft interaction");
  equal(browserMatrix["/report"]["records decision"], "NO", "Report decision projection is not authority to record");
  equal(browserMatrix["/workspace-legacy"]["records decision"], "NO", "workflow decision-history is separate from Human Decision");
});

function observeSupportingRoutes(): void {
  // Remaining support routes: prove their entry edges/projection sources before observation.
  for (const [page, client] of [["app/home/page.tsx", "app/home/home-client.tsx"], ["app/review-operations/page.tsx", "app/review-operations/review-operations-client.tsx"]]) {
    importEdge(page, client); importEdge(client, "app/use-operational-projection.ts", "useOperationalProjection"); call(client, "useOperationalProjection", "demoMode");
  }
  importEdge("app/use-operational-projection.ts", "lib/operational-review-projection.ts", "readOperationalReviewProjection");
  call("lib/operational-review-projection.ts", "createRealWorkspaceAdapter"); call("lib/operational-review-projection.ts", "createFixtureWorkspaceAdapter");
  component("app/(workstation)/policies/page.tsx", "app/(workstation)/policies/review-policies-client.tsx", "ReviewPoliciesClient");
  importEdge("app/(workstation)/policies/review-policies-client.tsx", "lib/review-policies.ts", "REVIEW_POLICY_PROFILES");
  call("app/review-policies/page.tsx", "redirect");
  call("app/(workstation)/integrations/page.tsx", "readEndpoint", '"/api/github-app?view=status"');
  call("app/team/page.tsx", "getItem", "TEAM_WORKSPACE_STORAGE_KEY");
  for (const row of browserInventory.filter((item) => item.url.startsWith("/visual-lab/workspace") || item.url === "/visual-lab/workstation-r6b")) {
    importEdge(row.file, row.entry);
    if (row.url === "/visual-lab/workspace-r4") importEdge(row.entry, "app/visual-lab/workspace-r4/fixtures.ts", "REVIEWS");
    if (row.url === "/visual-lab/workspace-v2") importEdge(row.entry, "app/visual-lab/workspace-v2/fixtures.ts");
    if (row.url === "/visual-lab/workstation-r6b") call(row.file, "buildFixtureSnapshot");
  }
  const supportFiles = browserInventory.filter((row) => !["/new", "/workspace", "/workspace-v2", "/workspace-legacy", "/reviews", "/report", "/settings"].includes(row.url)).map((row) => row.entry);
  noCalls(supportFiles, "recordDecision", "writeReviewState", "writeConditionProgress", "writeReviewActionStatus", "addReportToHistory", "deleteReportFromHistory", "clearReportHistory");
  // Shared AppShell may establish/select workspace metadata; this is not a Review/status/decision writer.
  call("app/app-shell.tsx", "ensureWorkspaceStore"); call("app/app-shell.tsx", "setActiveWorkspace");
  importEdge("app/app-shell.tsx", "lib/team-workspace.ts", "ensureWorkspaceStore");
  for (const row of browserInventory.filter((item) => !["/new", "/report", "/workspace", "/workspace-v2", "/workspace-legacy", "/reviews"].includes(item.url))) for (const col of browserColumns) {
    if (historyMutationColumns.includes(col)) continue; // RA9 observes both only after executable read-side-effect evidence.
    if (row.url === "/settings" && ["route tree reaches Report history", "explicitly mutates Report history"].includes(col)) continue;
    const realLayout = ["/policies", "/integrations", "/settings"].includes(row.url);
    const operational = ["/home", "/review-operations"].includes(row.url);
    const fixture = row.url === "/" || operational || row.url.startsWith("/visual-lab/");
    const value: Cell = col === "route tree reaches Report history" ? realLayout || operational ? "YES" : "NO" :
      col === "route tree loads real Case projection" ? realLayout || operational ? "YES" : "NO" :
        col === "fixture/demo projection" ? fixture ? "YES" : "NO" :
          col === "headless acknowledgement" ? "NOT_APPLICABLE" : "NO";
    const basis = realLayout && ["route tree reaches Report history", "route tree loads real Case projection"].includes(col)
      ? `${row.file}: inherited from workstation layout / WorkstationProvider -> createRealWorkspaceAdapter; page component does not own Case projection`
      : `${row.file} -> ${row.entry}; verified projection imports, negative writer census and shared layout boundary`;
    observe("RA1", row.url, col, value, basis);
  }
}

test("RA15", "SOURCE-CONTRACT (observation-populated matrices)", "UNKNOWN-initialized matrices are populated only after earlier RA source/service assertions, then compared with separate expected validation metadata. YES denotes any established reachable mode, not the default or persistence ownership. No Review writer is inferred from injected service availability.", browserInventory.map((row) => row.file), () => {
  assert(historyReadSideEffectResult, "controlled production history/facade/adapter evidence ran before matrix comparison");
  equal(historyReadSideEffectResult, { directWritableReadRewroteBytes: true, readOnlyFacadeRewroteBytes: false, realAdapterProjectionRewroteBytes: false, inputEntryCount: 2, validatedEntryCount: 1, adapterProjectedCaseCount: 1 }, "observed controlled read-side effects");
  const expectedBrowser: Record<BrowserRow, readonly Cell[]> = {
    "/": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "YES"],
    "/new": ["NO", "YES", "YES", "YES", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/report": ["YES", "YES", "NO", "NO", "YES", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "YES"],
    "/workspace": ["NO", "YES", "NO", "NO", "YES", "NO", "YES", "YES", "NO", "YES", "YES"],
    "/workspace-v2": ["NO", "YES", "NO", "NO", "YES", "YES", "YES", "YES", "NO", "YES", "YES"],
    "/workspace-legacy": ["NO", "YES", "YES", "YES", "NO", "YES", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/reviews": ["NO", "YES", "NO", "NO", "YES", "NO", "NO", "YES", "YES", "NO", "NO"],
    "/home": ["NO", "YES", "NO", "NO", "YES", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "YES"],
    "/review-operations": ["NO", "YES", "NO", "NO", "YES", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "YES"],
    "/policies": ["NO", "YES", "NO", "NO", "YES", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/review-policies": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/integrations": ["NO", "YES", "NO", "NO", "YES", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/settings": ["NO", "YES", "YES", "YES", "YES", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/team": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/github-action": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/slack-handoff": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "NO"],
    "/visual-lab/workspace-r4": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "YES"],
    "/visual-lab/workspace-v2": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "YES"],
    "/visual-lab/workstation-r6b": ["NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NOT_APPLICABLE", "YES"],
  };
  const expectedApi: Record<string, readonly Cell[]> = {
    "/api/fetch-pr-diff": ["NO", "YES", "NO", "NO", "NO", "NO", "NO", "NO", "NO"],
    "/api/generate-report": ["YES", "YES", "NO", "NO", "NO", "NO", "NO", "NO", "NO"],
    "/api/github-app": ["YES", "YES", "YES", "YES", "NO", "NO", "NO", "YES", "YES"],
    "/api/github-app/webhook": ["YES", "YES", "YES", "YES", "NO", "NO", "YES", "NO", "NO"],
    "/api/github-workspace": ["NO", "YES", "NO", "NO", "NO", "NO", "NO", "NO", "NO"],
  };
  for (const { url } of browserInventory) equal(browserColumns.map((col) => browserMatrix[url][col]), expectedBrowser[url], `observation-populated browser row ${url}`);
  for (const { url } of topology.api) equal(apiColumns.map((col) => apiMatrix[url][col]), expectedApi[url], `observation-populated API row ${url}`);
  equal(matrixEvidence.length, browserInventory.length * browserColumns.length + topology.api.length * apiColumns.length, "each cell has observation provenance");
  for (const route of ["/policies", "/integrations", "/settings"]) {
    assert(matrixEvidence.some((entry) => entry.row === route && entry.column === "route tree loads real Case projection" && entry.basis.includes("inherited from workstation layout / WorkstationProvider")), `${route} Case projection has explicit inherited-layout evidence`);
  }
});

test("RA16", "SOURCE-CONTRACT + EXECUTABLE (prior bounded observations)", "No page owns persistence or the complete lifecycle, no common persistent Review record is established by routing. New creates history; Report is a read-only durable/transient view; R4/V2/Reviews project shared stores with different mutation gates; Reviews owns current draft interaction keyed by derived ReviewId; legacy projects scoped history with workflow/removal authority; App APIs own server-state access independently.", [N, R, W, V, P, L, A, H, "lib/r6c/review-identity.ts"], () => {
  equal(observations.length, 15, "all earlier RA findings succeeded");
  const decisionRoutes = browserInventory.filter(({ url }) => browserMatrix[url]["records decision"] === "YES").map(({ url }) => url);
  equal(decisionRoutes, ["/workspace", "/workspace-v2", "/reviews"], "actual decision route authority");
  equal(browserInventory.filter(({ url }) => browserMatrix[url]["persists draft"] === "YES").map(({ url }) => url), ["/reviews"], "current persistent draft interaction family");
  assert(!browserInventory.some(({ url }) => ["explicitly mutates Report history", "writes workflow", "writes condition/action progress", "records decision", "persists draft"].every((col) => browserMatrix[url][col as BrowserColumn] === "YES")), "no route is wired to entire persistent review lifecycle");
  contract("lib/r6c/review-identity.ts", "provider: ReviewIdentityProvider = conservativeReviewIdentityProvider", "singletonCaseIdentity(caseDetail.caseId)");
});

let passed = 0;
for (const check of tests) {
  try { await check.run(); passed++; process.stdout.write(`PASS ${check.ra}\n`); }
  catch (error) { process.stderr.write(`FAIL ${check.ra}: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; break; }
}
process.stdout.write(`BS0.9 route authority: ${passed}/${tests.length} grouped checks passed\n`);
if (passed === tests.length) {
  process.stdout.write(JSON.stringify({ evidenceDistinction: "No browser or HTTP routes executed. Services/adapter/index/composer functions only were executed where labeled EXECUTABLE.", matrixMeaning: "YES = established capability in at least one mode; NOT_APPLICABLE = no decision writer for acknowledgement. Explicit Report-history mutation counts actual add/delete/clear callers only; normalization/pruning counts writable history reads separately. Route-tree real projection includes inherited workstation layout / WorkstationProvider loading, not page ownership. App lifecycle excludes separately classified operator enablement and verification/rechecks. Legacy real history is not modern CaseDetail projection; New sample generation is not fixture Case projection.", topology, browserInventory, observations, browserMatrix, apiMatrix, historyReadSideEffectResult, historyAuthority, inheritedProjectionEvidence: matrixEvidence.filter((entry) => ["/policies", "/integrations", "/settings"].includes(entry.row) && ["route tree reaches Report history", "route tree loads real Case projection"].includes(entry.column)), matrixObservationCount: matrixEvidence.length }, null, 2) + "\n");
}
