import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import type { WorkspaceSnapshot } from "../../workspace-v2/view-model";
import {
  R6C_SCHEMA_VERSION,
  createInitialWorkstationState,
  defaultWorkstationPersistence,
  dispatchAction,
  effectiveQueue,
  formatRoute,
  indexReviews,
  parseRoute,
  readWorkstationPersistence,
  restoreInitialState,
  writeWorkstationPersistence,
  type ApplicationAction,
  type LayoutBand,
  type QueueManualPreference,
  type ReviewId,
  type RouteIntent,
  type StorageLike,
  type WorkstationState,
} from "../../r6c/index";
import {
  INITIAL_SEMANTIC_RESTORATION_GATE,
  R6D_BOUND_ACTION_IDS,
  receiveRouteIntent,
  reconcileRestoredNarrowPresentation,
  releasePendingRouteIntent,
  semanticRestorationStep,
  shouldApplyParsedPathname,
  shouldGateRouteIntent,
} from "../controller-contract";
import {
  buildWorkstationFirstPaintScript,
  deriveFirstPaintAttributes,
  narrowSurfaceForPathname,
  storedQueuePreferenceFromRaw,
} from "../first-paint";
import {
  R6D_LAYOUT_POLICY,
  layoutBandForWidth,
  supportingLeftWidth,
} from "../layout-policy";
import { WORKSTATION_DESTINATIONS, destinationForPathname } from "../navigation";

type Test = Readonly<{ name: string; run: () => void }>;
const tests: Test[] = [];
function test(name: string, run: () => void): void { tests.push({ name, run }); }
function fail(message: string): never { throw new Error(message); }
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}
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

const snapshot = buildFixtureSnapshot("default");
assert(snapshot.status === "ready", "ready fixture required");
const reviewIndex = indexReviews(snapshot.cases);
const firstReview = [...reviewIndex.byReviewId.keys()][0];
assert(firstReview, "fixture Review required");
const canonicalReviewPath = formatRoute({
  destination: "reviews",
  reviewId: firstReview,
  mode: "overview",
});
const bareReviewPath = formatRoute({
  destination: "reviews",
  reviewId: firstReview,
  mode: null,
});

function restore(pathname: string, authoritativeSnapshot: WorkspaceSnapshot = snapshot) {
  return restoreInitialState({
    pathname,
    storage: new MemoryStorage(),
    authoritativeSnapshot,
    capturedAt: "2026-08-10T12:00:00.000Z",
    layout: { band: "standard" as const, policy: R6D_LAYOUT_POLICY },
    decisionSubjectResolver: () => ({ status: "unavailable", reason: "not used by this shell" }),
  });
}

test("layout policy covers every provisional band", () => {
  const cases: readonly [number, LayoutBand, string][] = [
    [1600, "spacious", "pane"],
    [1599, "standard", "pane"],
    [1360, "standard", "pane"],
    [1359, "compact", "pane"],
    [1100, "compact", "pane"],
    [1099, "constrained", "sheet"],
    [900, "constrained", "sheet"],
    [899, "narrow", "sequential"],
  ];
  for (const [width, band, inspector] of cases) {
    equal(layoutBandForWidth(width), band, `band at ${width}`);
    equal(R6D_LAYOUT_POLICY.inspectorPresentation(band), inspector, `Inspector at ${band}`);
  }
  equal(supportingLeftWidth("expanded"), 300, "expanded width");
  equal(supportingLeftWidth("compact"), 232, "compact width");
  equal(supportingLeftWidth("navigation-only"), 88, "navigation-only width");
  equal(supportingLeftWidth("yielded-context"), 0, "yielded width");
});

test("effective Queue matrix preserves collision priority and manual preference", () => {
  const bands: LayoutBand[] = ["spacious", "standard", "compact", "constrained", "narrow"];
  const preferences: QueueManualPreference[] = ["expanded", "compact"];
  for (const band of bands) for (const manualPreference of preferences) {
    for (const focusActive of [false, true]) for (const inspectorOpen of [false, true]) {
      for (const narrowSurface of ["queue", "workspace", "inspector"] as const) {
        const result = effectiveQueue({
          band,
          policy: R6D_LAYOUT_POLICY,
          manualPreference,
          focusActive,
          inspectorOpen,
          narrowSurface,
        });
        const expected = band === "narrow"
          ? narrowSurface === "queue" ? "narrow-queue" : "hidden-narrow"
          : focusActive
            ? "hidden-focus"
            : inspectorOpen && (band === "compact" || band === "constrained")
              ? "yielded-context"
              : manualPreference;
        equal(result.kind, expected, `${band}/${manualPreference}/${focusActive}/${inspectorOpen}/${narrowSurface}`);
        equal(manualPreference, manualPreference, "derivation cannot mutate its input preference");
      }
    }
  }
});

test("first-paint Queue derivation equals R6C under structural invariants", () => {
  for (const width of [1700, 1440, 1200, 1000, 899]) {
    for (const manualPreference of ["expanded", "compact"] as const) {
      for (const path of ["/reviews", canonicalReviewPath]) {
        const firstPaint = deriveFirstPaintAttributes(path, width, manualPreference);
        const expected = effectiveQueue({
          band: firstPaint.band,
          policy: R6D_LAYOUT_POLICY,
          manualPreference,
          focusActive: false,
          inspectorOpen: false,
          narrowSurface: firstPaint.narrowSurface,
        });
        equal(firstPaint.queue, expected.kind, `pre-paint Queue at ${width} ${path}`);
      }
    }
  }
});

test("first-paint Narrow surface is URL-derived", () => {
  equal(narrowSurfaceForPathname("/reviews"), "queue", "idle Reviews");
  equal(narrowSurfaceForPathname(canonicalReviewPath), "workspace", "selected Review");
  equal(deriveFirstPaintAttributes("/settings", 1440, "compact").queue, "navigation-only", "administrative nav only");
  equal(storedQueuePreferenceFromRaw("{broken"), "expanded", "corrupt hint is ignored");
  equal(storedQueuePreferenceFromRaw(JSON.stringify({ devicePreferences: { queue: { manualPreference: "compact" } } })), "compact", "compact hint");
  const script = buildWorkstationFirstPaintScript();
  assert(script.includes("data-band") && script.includes("data-queue") && script.includes("data-narrow-surface"), "three attributes set");
  assert(!script.includes("setItem") && !script.includes("removeItem") && !script.includes("localStorage.length"), "pre-paint storage stays read-only and non-enumerating");
});

test("exactly four production-bound actions remain invocation-equivalent", () => {
  deepEqual(R6D_BOUND_ACTION_IDS, [
    "route/navigate",
    "route/apply",
    "queue/set-manual-preference",
    "queue/show-narrow-surface",
  ], "bound action list");
  const context = { reviewIndex, cases: snapshot.cases };
  const actions: ApplicationAction[] = [
    { id: "route/navigate", destination: "settings" },
    { id: "route/apply", intent: { destination: "policies", reviewId: null, mode: null } },
    { id: "queue/set-manual-preference", preference: "compact" },
    { id: "queue/show-narrow-surface", surface: "queue" },
  ];
  for (const action of actions) {
    const state = createInitialWorkstationState();
    deepEqual(
      dispatchAction(state, action, context, { source: "system" }),
      dispatchAction(state, action, context, { source: "visible-ui" }),
      `${action.id} invocation equivalence`,
    );
  }
});

test("route effect table is exact", () => {
  equal(restore(canonicalReviewPath).routeEffect.kind, "none", "canonical Review+mode");
  equal(restore(bareReviewPath).routeEffect.kind, "replace", "bare Review");
  const malformed = restore("/reviews/not-valid/unknown-mode");
  equal(malformed.routeEffect.kind, "replace", "malformed route");
  equal(malformed.routeEffect.kind === "replace" ? malformed.routeEffect.path : "", "/reviews", "malformed fallback");
  const context = { reviewIndex, cases: snapshot.cases };
  const initial = createInitialWorkstationState();
  equal(dispatchAction(initial, { id: "route/navigate", destination: "settings" }, context, { source: "visible-ui" }).routeEffect.kind, "push", "destination navigate");
  equal(dispatchAction(initial, { id: "route/apply", intent: { destination: "settings", reviewId: null, mode: null } }, context, { source: "browser" }).routeEffect.kind, "none", "Back/Forward apply");
  for (const path of ["/reviews", "/policies", "/integrations", "/settings"]) {
    equal(restore(path).routeEffect.kind, "none", `${path} idle route`);
  }
});

test("restored canonical route owns final Narrow presentation", () => {
  const context = { reviewIndex, cases: snapshot.cases };
  const cases = [
    { pathname: "/reviews", expectedPath: "/reviews", expectedSurface: "queue", snapshot },
    { pathname: canonicalReviewPath, expectedPath: canonicalReviewPath, expectedSurface: "workspace", snapshot },
    { pathname: "/reviews/abc123/not-a-mode", expectedPath: "/reviews", expectedSurface: "queue", snapshot },
    { pathname: "/reviews/abc123/overview/extra", expectedPath: "/reviews", expectedSurface: "queue", snapshot },
    { pathname: "/reviews/abc123/not-a-mode", expectedPath: "/reviews", expectedSurface: "queue", snapshot: buildFixtureSnapshot("loading") },
  ] as const;

  for (const item of cases) {
    const restored = restore(item.pathname, item.snapshot);
    const presentation = reconcileRestoredNarrowPresentation(restored, context);
    equal(restored.state.routePath, item.expectedPath, `${item.pathname} canonical restoration path`);
    equal(presentation.state.narrowSurface, item.expectedSurface, `${item.pathname} Narrow surface`);
    equal(presentation.routeEffect.kind, "none", `${item.pathname} presentation adds no history effect`);
  }

  for (const pathname of ["/reviews/abc123/not-a-mode", "/reviews/abc123/overview/extra"]) {
    const restored = restore(pathname);
    equal(restored.routeEffect.kind, "replace", `${pathname} retains one restoration Replace`);
    equal(restored.routeEffect.kind === "replace" ? restored.routeEffect.path : "", "/reviews", `${pathname} fallback destination`);
  }
});

test("echo guard suppresses our own canonical Push and Replace", () => {
  const parsed = parseRoute(canonicalReviewPath);
  assert(parsed.status === "valid", "canonical path parses");
  equal(shouldApplyParsedPathname(parsed, canonicalReviewPath), false, "canonical echo suppressed");
  equal(shouldApplyParsedPathname(parsed, "/reviews"), true, "external path applied");
});

test("semantic snapshot gate holds only loading Review-bearing intents", () => {
  const reviewIntent: RouteIntent = { destination: "reviews", reviewId: firstReview, mode: "overview" };
  const idleIntents: RouteIntent[] = [
    { destination: "reviews", reviewId: null, mode: null },
    { destination: "policies", reviewId: null, mode: null },
    { destination: "integrations", reviewId: null, mode: null },
    { destination: "settings", reviewId: null, mode: null },
  ];
  for (const status of ["loading", "ready", "empty", "unavailable"] as const) {
    equal(shouldGateRouteIntent(reviewIntent, status), status === "loading", `Review gate ${status}`);
    for (const intent of idleIntents) equal(shouldGateRouteIntent(intent, status), false, `idle gate ${status}`);
  }
});

test("two-phase semantic restoration seals at the truthful terminal boundary", () => {
  function run(statuses: WorkspaceSnapshot["status"][]) {
    let gate = INITIAL_SEMANTIC_RESTORATION_GATE;
    let restores = 0;
    for (const status of statuses) {
      const step = semanticRestorationStep(gate, status);
      gate = step.gate;
      if (step.restore) restores += 1;
    }
    return { gate, restores };
  }
  deepEqual(run(["loading", "ready", "ready"]), { gate: { sealed: true, phaseBCalls: 1, unavailableObserved: false }, restores: 1 }, "loading to ready");
  deepEqual(run(["loading", "empty", "empty"]), { gate: { sealed: true, phaseBCalls: 1, unavailableObserved: false }, restores: 1 }, "loading to empty");
  deepEqual(run(["loading", "unavailable", "unavailable", "ready", "empty"]), { gate: { sealed: true, phaseBCalls: 2, unavailableObserved: true }, restores: 2 }, "unavailable then ready");
});

test("pending Review route is last-wins and releases on every non-loading status", () => {
  const first: RouteIntent = { destination: "reviews", reviewId: firstReview, mode: "overview" };
  const second: RouteIntent = { destination: "reviews", reviewId: firstReview, mode: "history" };
  let received = receiveRouteIntent({ pending: null }, first, "loading");
  received = receiveRouteIntent(received.gate, second, "loading");
  const released = releasePendingRouteIntent(received.gate, "unavailable");
  deepEqual(released.apply, second, "last pending intent released under unavailable");
  equal(released.gate.pending, null, "slot cleared");
});

test("R6C persistence is the sole Queue preference round trip", () => {
  const storage = new MemoryStorage();
  const baseline = defaultWorkstationPersistence();
  const compact = {
    ...baseline,
    schemaVersion: R6C_SCHEMA_VERSION,
    devicePreferences: {
      ...baseline.devicePreferences,
      queue: { ...baseline.devicePreferences.queue, manualPreference: "compact" as const },
    },
  };
  assert(writeWorkstationPersistence(storage, compact).persisted, "R6C persistence writes");
  equal(readWorkstationPersistence(storage).value.devicePreferences.queue.manualPreference, "compact", "R6C persistence reads");
  equal(storage.values.size, 1, "one R6C-owned namespace written");
});

test("manual Queue preference survives every responsive derivation", () => {
  const state = createInitialWorkstationState({
    ...defaultWorkstationPersistence().devicePreferences,
    queue: { manualPreference: "compact", preferredWidth: { expanded: null, compact: null } },
  });
  for (const band of ["spacious", "standard", "compact", "constrained", "narrow"] as const) {
    effectiveQueue({ band, policy: R6D_LAYOUT_POLICY, manualPreference: state.queue.manualPreference, focusActive: true, inspectorOpen: true, narrowSurface: "workspace" });
    equal(state.queue.manualPreference, "compact", `manual preference at ${band}`);
  }
});

test("bare Reviews remains idle after a selected Review", () => {
  const selected = restore(canonicalReviewPath).state;
  const result = dispatchAction(
    selected,
    { id: "route/navigate", destination: "reviews" },
    { reviewIndex, cases: snapshot.cases },
    { source: "visible-ui" },
  );
  equal(result.state.routePath, "/reviews", "Reviews path");
  equal(result.state.selectedReview.status, "none", "no previous Review reopened");
});

test("frozen destination model and legacy family attribution are exact", () => {
  deepEqual(WORKSTATION_DESTINATIONS.map(({ label, href }) => ({ label, href })), [
    { label: "Reviews", href: "/reviews" },
    { label: "Policies", href: "/policies" },
    { label: "Integrations", href: "/integrations" },
    { label: "Settings", href: "/settings" },
  ], "destination vocabulary");
  for (const path of ["/workspace", "/new", "/report", "/home", "/review-operations"]) equal(destinationForPathname(path), "reviews", path);
  for (const path of ["/github-action", "/slack-handoff"]) equal(destinationForPathname(path), "integrations", path);
  equal(destinationForPathname("/team"), "settings", "team");
});

test("R6D source contains no Inspector implementation promise", () => {
  const inspectorState: WorkstationState["inspector"] = createInitialWorkstationState().inspector;
  equal(inspectorState.open, false, "Inspector begins closed");
});

const workstationRoot = join(process.cwd(), "app", "(workstation)");
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(target)
      : entry.name.endsWith(".tsx") ? [target] : [];
  });
}

test("production-bound source binds no action beyond the frozen four", () => {
  const source = sourceFiles(workstationRoot)
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  const actionIds = [...source.matchAll(/id:\s*"([a-z-]+\/[a-z-]+)"/g)].map((match) => match[1]);
  deepEqual([...new Set(actionIds)].sort(), [...R6D_BOUND_ACTION_IDS].sort(), "bound action source set");
});

test("rendered workstation copy excludes programme vocabulary", () => {
  const renderedFragments: string[] = [];
  for (const file of sourceFiles(workstationRoot)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/>([^<{][^<]*)</g)) renderedFragments.push(match[1]);
    for (const match of source.matchAll(/(?:aria-label|title|alt)="([^"]*)"/g)) renderedFragments.push(match[1]);
  }
  const renderedCopy = renderedFragments.join(" ");
  assert(!/\bR6[A-P]?\b|\bmilestone\b|\bmigration\b|\bphase\b|not yet implemented/i.test(renderedCopy), "programme vocabulary is absent from rendered copy");
});

test("Inspector seam emits no DOM contract and Workspace owns the sole main", () => {
  const files = sourceFiles(workstationRoot);
  const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
  const inspectorHost = readFileSync(join(workstationRoot, "InspectorHost.tsx"), "utf8");
  equal((source.match(/<main\b/g) ?? []).length, 1, "one main source owner");
  equal((source.match(/<InspectorHost\s*\/>/g) ?? []).length, 1, "one null seam invocation");
  assert(/return null;/.test(inspectorHost), "Inspector seam returns null");
  assert(!/data-region="inspector"|aria-label="[^"]*Inspector/i.test(source), "no Inspector DOM contract");
});

test("route-group first child is the workstation-only pre-paint script", () => {
  const layoutSource = readFileSync(join(workstationRoot, "layout.tsx"), "utf8");
  const scriptIndex = layoutSource.indexOf("<script dangerouslySetInnerHTML");
  const providerIndex = layoutSource.indexOf("<WorkstationProvider>");
  assert(scriptIndex >= 0 && providerIndex > scriptIndex, "pre-paint script precedes shell provider");
});

test("workstation provider owns the existing authenticated light-theme lock", () => {
  const providerSource = readFileSync(join(workstationRoot, "WorkstationProvider.tsx"), "utf8");
  assert(providerSource.includes('const { setForcedTheme } = useTheme();'), "provider acquires ThemeProvider control");
  assert(
    /useIsomorphicLayoutEffect\(\(\) => \{[\s\S]*?setForcedTheme\("light"\);\s*return \(\) => setForcedTheme\(null\);/.test(providerSource),
    "provider forces light on mount and releases on unmount",
  );
});

test("loading, unavailable, and proven absence remain semantically distinct", () => {
  const loading = restore(canonicalReviewPath, buildFixtureSnapshot("loading"));
  const unavailable = restore(canonicalReviewPath, buildFixtureSnapshot("unavailable"));
  const empty = restore(canonicalReviewPath, buildFixtureSnapshot("empty"));
  equal(loading.authoritativeStatus, "loading", "loading status retained");
  equal(unavailable.authoritativeStatus, "unavailable", "unavailable status retained");
  equal(unavailable.writeBack.discardReviewContext, null, "unreadable storage proves no absence");
  equal(empty.authoritativeStatus, "empty", "empty status retained");
  equal(empty.state.selectedReview.status, "unavailable", "empty proves requested Review absent without substitution");
  equal(empty.writeBack.discardReviewContext, firstReview, "only proven absence discards scoped convenience");
});

test("Queue production copy is exact and contains no collection implementation", () => {
  const queueSource = readFileSync(join(workstationRoot, "QueueRegion.tsx"), "utf8");
  for (const exact of [
    "Checking reviews stored in this browser.",
    "Reviews stored in this browser could not be read.",
    "No reviews are stored in this browser.",
    "Check a pull request",
    "Your stored reviews open in the Verification Workspace.",
    "Open the Verification Workspace",
  ]) assert(queueSource.includes(exact), `Queue copy: ${exact}`);
  assert(!/search|filter|group label|row selection|review count/i.test(queueSource), "Queue collection work remains absent");
});

let passed = 0;
for (const item of tests) {
  try {
    item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`R6D validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`R6D validation: ${passed}/${tests.length} passed\n`);
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
