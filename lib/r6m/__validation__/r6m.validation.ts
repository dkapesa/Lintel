import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import type { StorageLike } from "../../r6c/persistence";
import {
  createInitialWorkstationState,
  defaultWorkstationPersistence,
  dispatchAction,
  indexReviews,
  resolveFocusReturn,
  type WorkstationState,
} from "../../r6c/index";
import { resolveCommandsFocusReturn } from "../../r6l/command-focus";
import {
  INSPECTOR_DEFAULT,
  INSPECTOR_MAX,
  INSPECTOR_MIN,
  QUEUE_DEFAULT,
  QUEUE_MAX,
  QUEUE_MIN,
  QUEUE_NAV_ONLY,
  WORKSPACE_MIN,
  applyResolvedGeometry,
  buildR6MFirstPaintGeometryScript,
  createR6MLayoutPolicy,
  deriveR6MFirstPaintGeometry,
  isElementRendered,
  keyboardResizeCandidate,
  pointerResizeCandidate,
  readR6MLayoutPreference,
  readR6MPreferredWidths,
  resizeBoundsForGeometry,
  resolveWorkstationGeometry,
  writePreferredInspectorWidth,
  writePreferredQueueWidth,
  writeR6MLayoutPreference,
  type WorkstationGeometryInput,
} from "../index";

type Test = Readonly<{ name: string; run: () => void }>;
const tests: Test[] = [];
const test = (name: string, run: () => void): void => { tests.push({ name, run }); };
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  equal(JSON.stringify(actual), JSON.stringify(expected), message);
}

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  writes = 0;
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.writes += 1; this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

function geometry(overrides: Partial<WorkstationGeometryInput> = {}) {
  return resolveWorkstationGeometry({
    viewportWidth: 1440,
    destination: "reviews",
    queueDensity: "expanded",
    preferredQueueWidth: null,
    preferredInspectorWidth: null,
    queueCollapsed: false,
    focusActive: false,
    inspectorOpen: false,
    narrowSurface: "workspace",
    ...overrides,
  });
}

test("accepted geometry tokens are exact", () => {
  deepEqual(
    [QUEUE_MIN, QUEUE_DEFAULT, QUEUE_MAX, QUEUE_NAV_ONLY, INSPECTOR_MIN, INSPECTOR_DEFAULT, INSPECTOR_MAX, WORKSPACE_MIN],
    [240, 280, 400, 88, 320, 384, 480, 640],
    "tokens",
  );
});

test("representative closed and pane geometries are exact", () => {
  const cases = [
    [1600, false, 280, 0, 1320],
    [1600, true, 280, 384, 936],
    [1440, false, 280, 0, 1160],
    [1440, true, 280, 384, 776],
    [1360, true, 280, 384, 696],
    [1359, true, 280, 384, 695],
    [1180, true, 0, 384, 796],
    [1100, true, 0, 384, 716],
  ] as const;
  for (const [width, inspectorOpen, queue, inspector, workspace] of cases) {
    const result = geometry({ viewportWidth: width, inspectorOpen });
    deepEqual([result.queueTrack, result.inspectorTrack, result.workspaceTrack], [queue, inspector, workspace], `${width}/${inspectorOpen}`);
  }
});

test("all frozen band thresholds are exact", () => {
  deepEqual(
    [899, 900, 1099, 1100, 1359, 1360, 1599, 1600].map((viewportWidth) => geometry({ viewportWidth }).band),
    ["narrow", "constrained", "constrained", "compact", "compact", "standard", "standard", "spacious"],
    "band thresholds",
  );
});

test("closed-Inspector Queue clamps continuously against the Workspace floor", () => {
  deepEqual(
    [900, 919, 920, 1000].map((viewportWidth) => {
      const result = geometry({ viewportWidth });
      return [result.queueTrack, result.workspaceTrack];
    }),
    [[260, 640], [279, 640], [280, 640], [280, 720]],
    "closed Inspector clamp",
  );
});

test("sheet has zero track and an effective independent size", () => {
  const constrained = geometry({ viewportWidth: 1000, inspectorOpen: true });
  deepEqual(
    [constrained.inspectorPresentation, constrained.inspectorTrack, constrained.inspectorSize, constrained.queueTrack, constrained.workspaceTrack, constrained.queuePresentation],
    ["sheet", 0, 384, 0, 1000, "yielded-context"],
    "constrained sheet",
  );
});

test("Narrow sequential properties are inert and preference-independent", () => {
  const narrow = geometry({ viewportWidth: 899, inspectorOpen: true, preferredQueueWidth: 400, preferredInspectorWidth: 480 });
  deepEqual(
    [narrow.band, narrow.inspectorPresentation, narrow.queueTrack, narrow.inspectorTrack, narrow.inspectorSize, narrow.workspaceTrack],
    ["narrow", "sequential", 0, 0, 0, 899],
    "narrow geometry",
  );
});

test("expanded Queue yields to every Constrained Inspector sheet boundary", () => {
  for (const viewportWidth of [1099, 1000, 900]) {
    const result = geometry({ viewportWidth, inspectorOpen: true });
    deepEqual(
      [result.queueTrack, result.queuePresentation, result.inspectorTrack, result.inspectorSize, result.workspaceTrack],
      [0, "yielded-context", 0, 384, viewportWidth],
      `${viewportWidth} sheet geometry`,
    );
  }
});

test("manual 88px application rail survives a Constrained Inspector sheet", () => {
  const result = geometry({ viewportWidth: 1000, queueCollapsed: true, inspectorOpen: true });
  deepEqual(
    [result.queueTrack, result.queuePresentation, result.inspectorTrack, result.inspectorSize, result.workspaceTrack],
    [88, "navigation-only", 0, 384, 912],
    "collapsed sheet geometry",
  );
});

test("1300 Inspector 420 keeps Queue at 240", () => {
  const result = geometry({ viewportWidth: 1300, inspectorOpen: true, preferredInspectorWidth: 420 });
  deepEqual([result.queueTrack, result.inspectorTrack, result.workspaceTrack], [240, 420, 640], "420 threshold");
});

test("1300 Inspector 421 yields Queue immediately", () => {
  const result = geometry({ viewportWidth: 1300, inspectorOpen: true, preferredInspectorWidth: 421 });
  deepEqual([result.queueTrack, result.inspectorTrack, result.queuePresentation], [0, 421, "yielded-context"], "421 threshold");
});

test("1300 threshold reverses without hysteresis or preference mutation", () => {
  const preferred = 337;
  const yielded = geometry({ viewportWidth: 1300, inspectorOpen: true, preferredQueueWidth: preferred, preferredInspectorWidth: 421 });
  const returned = geometry({ viewportWidth: 1300, inspectorOpen: true, preferredQueueWidth: preferred, preferredInspectorWidth: 420 });
  deepEqual([yielded.queueTrack, returned.queueTrack, preferred], [0, 240, 337], "reversible threshold");
});

test("manual collapse is a fixed navigation rail and restores preferred Queue width", () => {
  const collapsed = geometry({ queueCollapsed: true, preferredQueueWidth: 337 });
  const restored = geometry({ queueCollapsed: false, preferredQueueWidth: 337 });
  deepEqual([collapsed.queueTrack, collapsed.queuePresentation, restored.queueTrack], [88, "navigation-only", 337], "collapse restore");
});

test("Focus supersedes and then restores manual collapse", () => {
  const focused = geometry({ queueCollapsed: true, focusActive: true });
  const exited = geometry({ queueCollapsed: true, focusActive: false });
  deepEqual([focused.queueTrack, focused.queuePresentation, exited.queueTrack, exited.queuePresentation], [0, "hidden-focus", 88, "navigation-only"], "Focus collapse");
});

test("collapsed 1100 Inspector 480 clamps to 372 and preserves Workspace 640", () => {
  const result = geometry({ viewportWidth: 1100, queueCollapsed: true, inspectorOpen: true, preferredInspectorWidth: 480 });
  deepEqual([result.queueTrack, result.inspectorTrack, result.inspectorSize, result.workspaceTrack], [88, 372, 372, 640], "collapsed clamp");
});

test("Inspector preference survives an effective clamp", () => {
  const constrained = geometry({ viewportWidth: 1100, queueCollapsed: true, inspectorOpen: true, preferredInspectorWidth: 480 });
  const spacious = geometry({ viewportWidth: 1600, queueCollapsed: true, inspectorOpen: true, preferredInspectorWidth: 480 });
  deepEqual([constrained.inspectorTrack, spacious.inspectorTrack], [372, 480], "preferred Inspector returns");
});

test("Narrow ignores but does not mutate durable pane preferences", () => {
  const input: WorkstationGeometryInput = {
    viewportWidth: 899,
    destination: "reviews",
    queueDensity: "compact",
    preferredQueueWidth: 337,
    preferredInspectorWidth: 419,
    queueCollapsed: true,
    focusActive: false,
    inspectorOpen: true,
    narrowSurface: "inspector",
  };
  const before = JSON.stringify(input);
  const result = resolveWorkstationGeometry(input);
  equal(JSON.stringify(input), before, "resolver input remains byte-identical");
  deepEqual([result.queueTrack, result.inspectorTrack, result.inspectorSize], [0, 0, 0], "Narrow inert geometry");
});

test("density changes presentation only and never Queue width", () => {
  const expanded = geometry({ queueDensity: "expanded" });
  const compact = geometry({ queueDensity: "compact" });
  deepEqual([expanded.queueTrack, compact.queueTrack, expanded.queuePresentation, compact.queuePresentation], [280, 280, "expanded", "compact"], "density decoupled");
});

test("preferred Queue and Inspector limits are exact", () => {
  deepEqual([
    geometry({ preferredQueueWidth: 240 }).queueTrack,
    geometry({ preferredQueueWidth: 400 }).queueTrack,
    geometry({ inspectorOpen: true, preferredInspectorWidth: 320 }).inspectorTrack,
    geometry({ inspectorOpen: true, preferredInspectorWidth: 480 }).inspectorTrack,
  ], [240, 400, 320, 480], "width bounds");
});

test("no desktop state retains three cramped visible regions", () => {
  for (let width = 900; width <= 1800; width += 1) {
    for (const inspector of [320, 384, 480]) {
      const result = geometry({ viewportWidth: width, inspectorOpen: true, preferredInspectorWidth: inspector });
      if (result.queueTrack > 0 && result.inspectorTrack > 0) {
        assert(result.workspaceTrack >= WORKSPACE_MIN, `workspace floor at ${width}/${inspector}`);
      }
      if (result.inspectorPresentation === "sheet" && result.inspectorSize > 0) {
        const expandedQueueRemains = result.queueTrack > 0
          && (result.queuePresentation === "expanded" || result.queuePresentation === "compact");
        assert(!expandedQueueRemains, `expanded Queue beside sheet at ${width}/${inspector}`);
      }
    }
  }
});

test("1359 and 1360 change presentation class without geometry discontinuity", () => {
  const compact = geometry({ viewportWidth: 1359, inspectorOpen: true });
  const standard = geometry({ viewportWidth: 1360, inspectorOpen: true });
  deepEqual([compact.band, standard.band], ["compact", "standard"], "band boundary");
  deepEqual([compact.queueTrack, compact.inspectorTrack], [standard.queueTrack, standard.inspectorTrack], "track continuity");
});

test("non-Reviews destinations retain only the 88px application rail", () => {
  const result = geometry({ destination: "settings", inspectorOpen: true, focusActive: true, queueCollapsed: false });
  deepEqual([result.queueTrack, result.queuePresentation, result.inspectorTrack, result.inspectorSize], [88, "navigation-only", 0, 0], "destination gate");
});

test("R6M LayoutPolicy composes spatial yield through the frozen seam", () => {
  const policy420 = createR6MLayoutPolicy({ viewportWidth: 1300, destination: "reviews", preferredQueueWidth: 280, preferredInspectorWidth: 420, queueCollapsed: false });
  const policy421 = createR6MLayoutPolicy({ viewportWidth: 1300, destination: "reviews", preferredQueueWidth: 280, preferredInspectorWidth: 421, queueCollapsed: false });
  equal(policy420.shouldYieldQueue({ band: "compact", inspectorOpen: true, inspectorPresentation: "pane" }), false, "420 visible");
  equal(policy421.shouldYieldQueue({ band: "compact", inspectorOpen: true, inspectorPresentation: "pane" }), true, "421 yielded");
});

test("layout preference accepts only literal true and writes only its field", () => {
  const storage = new MemoryStorage();
  storage.values.set("lintel.r6m.layout.v1", JSON.stringify({ queueCollapsed: true, ignored: 42 }));
  equal(readR6MLayoutPreference(storage).queueCollapsed, true, "true read");
  storage.values.set("lintel.r6m.layout.v1", "{");
  equal(readR6MLayoutPreference(storage).queueCollapsed, false, "malformed defaults");
  assert(writeR6MLayoutPreference(storage, { queueCollapsed: false }).persisted, "write succeeds");
  equal(storage.values.get("lintel.r6m.layout.v1"), '{"queueCollapsed":false}', "bounded shape");
});

test("preferred widths round-trip through existing R6C slots", () => {
  const storage = new MemoryStorage();
  storage.values.set("lintel.r6.workstation.v1", JSON.stringify(defaultWorkstationPersistence()));
  assert(writePreferredQueueWidth(storage, 337).persisted, "Queue write");
  assert(writePreferredInspectorWidth(storage, 419).persisted, "Inspector write");
  deepEqual(readR6MPreferredWidths(storage), { queue: 337, inspector: 419 }, "width round trip");
  const persisted = JSON.parse(storage.values.get("lintel.r6.workstation.v1")!) as { devicePreferences: { queue: { preferredWidth: { compact: number | null } } } };
  equal(persisted.devicePreferences.queue.preferredWidth.compact, null, "unused density slot untouched");
  equal(storage.writes, 2, "one storage write per completed width commit");
});

test("width persistence clamps invalid user candidates at the accepted bounds", () => {
  const storage = new MemoryStorage();
  storage.values.set("lintel.r6.workstation.v1", JSON.stringify(defaultWorkstationPersistence()));
  writePreferredQueueWidth(storage, -500);
  writePreferredInspectorWidth(storage, 900);
  deepEqual(readR6MPreferredWidths(storage), { queue: 240, inspector: 480 }, "persisted bounds");
});

test("pointer resize direction and bounds are pane-correct", () => {
  const queueBounds = { minimum: 240, maximum: 400 };
  const inspectorBounds = { minimum: 320, maximum: 480 };
  equal(pointerResizeCandidate({ pane: "queue", startX: 100, currentX: 164, startWidth: 280, bounds: queueBounds }), 344, "Queue grows right");
  equal(pointerResizeCandidate({ pane: "inspector", startX: 100, currentX: 36, startWidth: 384, bounds: inspectorBounds }), 448, "Inspector grows left");
  equal(pointerResizeCandidate({ pane: "queue", startX: 100, currentX: -500, startWidth: 280, bounds: queueBounds }), 240, "Queue min");
  equal(pointerResizeCandidate({ pane: "inspector", startX: 100, currentX: -500, startWidth: 384, bounds: inspectorBounds }), 480, "Inspector max");
});

test("keyboard separator supports standard, large, Home and End", () => {
  const bounds = { minimum: 240, maximum: 400 };
  equal(keyboardResizeCandidate({ key: "ArrowRight", currentWidth: 280, shiftKey: false, bounds }), 296, "standard");
  equal(keyboardResizeCandidate({ key: "ArrowLeft", currentWidth: 320, shiftKey: true, bounds }), 256, "large");
  equal(keyboardResizeCandidate({ key: "Home", currentWidth: 320, shiftKey: false, bounds }), 240, "Home");
  equal(keyboardResizeCandidate({ key: "End", currentWidth: 320, shiftKey: false, bounds }), 400, "End");
});

test("Queue live bounds govern ARIA, pointer and keyboard candidates", () => {
  const constrainedInput = {
    viewportWidth: 1300,
    destination: "reviews",
    queueDensity: "expanded",
    preferredQueueWidth: 280,
    preferredInspectorWidth: 420,
    queueCollapsed: false,
    focusActive: false,
    inspectorOpen: true,
    narrowSurface: "workspace",
  } satisfies WorkstationGeometryInput;
  const constrained = resolveWorkstationGeometry(constrainedInput);
  const constrainedBounds = resizeBoundsForGeometry(constrainedInput, constrained, "queue");
  deepEqual(constrainedBounds, { minimum: 240, maximum: 240 }, "1300/420 Queue bounds");
  equal(pointerResizeCandidate({ pane: "queue", startX: 0, currentX: 500, startWidth: 240, bounds: constrainedBounds! }), 240, "pointer clamps to live max");
  equal(keyboardResizeCandidate({ key: "End", currentWidth: 240, shiftKey: false, bounds: constrainedBounds! }), 240, "End clamps to live max");

  const roomyInput = { ...constrainedInput, viewportWidth: 1800, preferredInspectorWidth: 384 };
  const roomyBounds = resizeBoundsForGeometry(roomyInput, resolveWorkstationGeometry(roomyInput), "queue");
  deepEqual(roomyBounds, { minimum: 240, maximum: 400 }, "roomy Queue bounds");
});

test("Inspector live maximum accounts for yielded Queue and fixed application rail", () => {
  const expandedInput = {
    viewportWidth: 1300,
    destination: "reviews",
    queueDensity: "expanded",
    preferredQueueWidth: 280,
    preferredInspectorWidth: 420,
    queueCollapsed: false,
    focusActive: false,
    inspectorOpen: true,
    narrowSurface: "workspace",
  } satisfies WorkstationGeometryInput;
  const expandedBounds = resizeBoundsForGeometry(expandedInput, resolveWorkstationGeometry(expandedInput), "inspector");
  deepEqual(expandedBounds, { minimum: 320, maximum: 480 }, "Inspector can widen through Queue yield");
  equal(pointerResizeCandidate({ pane: "inspector", startX: 500, currentX: -500, startWidth: 420, bounds: expandedBounds! }), 480, "Inspector pointer max");
  equal(keyboardResizeCandidate({ key: "End", currentWidth: 420, shiftKey: false, bounds: expandedBounds! }), 480, "Inspector keyboard max");

  const navigationInput = { ...expandedInput, viewportWidth: 1100, preferredInspectorWidth: 480, queueCollapsed: true };
  const navigationBounds = resizeBoundsForGeometry(navigationInput, resolveWorkstationGeometry(navigationInput), "inspector");
  deepEqual(navigationBounds, { minimum: 320, maximum: 372 }, "88px rail remains a fixed cost");
});

test("rendered focus requires connection, CSS visibility and a non-empty rect", () => {
  const visible = { isConnected: true, checkVisibility: () => true, getClientRects: () => [{ width: 10, height: 10 }] };
  const hidden = { ...visible, checkVisibility: () => false };
  const trackless = { ...visible, getClientRects: () => [] };
  assert(isElementRendered(visible), "visible element");
  assert(!isElementRendered(hidden), "CSS-hidden element");
  assert(!isElementRendered(trackless), "zero-track element");
  assert(!isElementRendered({ ...visible, isConnected: false }), "disconnected element");
});

test("hidden exact origin and Queue region fall through to visible Workspace", () => {
  const origin = { handle: "hidden-queue-control", region: "queue" as const, scope: { destination: "reviews" as const, reviewId: null } };
  const target = resolveFocusReturn(origin, "queue", {
    isOriginRestorable: () => false,
    isRegionRegistered: (region) => region === "workspacePrimary" || region === "destinationMain",
  });
  deepEqual(target, { kind: "region", region: "workspacePrimary" }, "hidden Queue fallback");
});

test("invisible Commands origin falls through to destination and then none", () => {
  const origin = { element: "hidden-commands-trigger", region: null, scope: { destination: "reviews" as const, reviewId: null } };
  const destination = resolveCommandsFocusReturn(origin as never, {
    isElementConnected: () => false,
    isOriginRestorable: () => false,
    isRegionRegistered: (region) => region === "destinationMain",
  });
  deepEqual(destination, { kind: "region", region: "destinationMain" }, "destination fallback");
  const none = resolveCommandsFocusReturn(origin as never, {
    isElementConnected: () => false,
    isOriginRestorable: () => false,
    isRegionRegistered: () => false,
  });
  deepEqual(none, { kind: "none" }, "no rendered focus target");
});

test("Escape unwinds Inspector without exiting Focus Mode", () => {
  const base = createInitialWorkstationState();
  const focused: WorkstationState = {
    ...base,
    focus: { active: true, origin: null },
    inspector: {
      open: true,
      context: { kind: "evidence", id: "validation-context" },
      unavailableContext: null,
      relationshipTrail: [],
      focusOrigin: null,
    },
  };
  const closed = dispatchAction(
    focused,
    { id: "escape/unwind" },
    { reviewIndex: indexReviews([]), cases: [] },
    { source: "keyboard" },
  );
  equal(closed.state.inspector.open, false, "Inspector closes");
  equal(closed.state.focus.active, true, "Focus remains active");
  const secondEscape = dispatchAction(
    closed.state,
    { id: "escape/unwind" },
    { reviewIndex: indexReviews([]), cases: [] },
    { source: "keyboard" },
  );
  equal(secondEscape.state.focus.active, true, "second Escape does not exit Focus");
});

test("runtime writer emits only effective tracks and presentation", () => {
  const values = new Map<string, string>();
  const attributes = new Map<string, string>();
  applyResolvedGeometry(geometry({ inspectorOpen: true }), {
    style: { setProperty: (name, value) => { values.set(name, value); } },
    setAttribute: (name, value) => { attributes.set(name, value); },
  });
  deepEqual([...values.entries()], [["--queue-track", "280px"], ["--inspector-track", "384px"], ["--inspector-size", "384px"]], "effective properties");
  equal(attributes.get("data-queue"), "expanded", "presentation");
});

test("R6M pre-paint is resolver-equivalent for allowed fields", () => {
  const persistence = defaultWorkstationPersistence();
  const raw = JSON.stringify({
    ...persistence,
    devicePreferences: {
      ...persistence.devicePreferences,
      queue: {
        ...persistence.devicePreferences.queue,
        preferredWidth: { ...persistence.devicePreferences.queue.preferredWidth, expanded: 337 },
      },
    },
  });
  for (const viewportWidth of [390, 899, 900, 1000, 1300, 1600]) {
    for (const queueCollapsed of [false, true]) {
      const first = deriveR6MFirstPaintGeometry({ pathname: "/reviews/example", viewportWidth, workstationRaw: raw, layoutRaw: JSON.stringify({ queueCollapsed }) });
      const resolved = geometry({ viewportWidth, preferredQueueWidth: 337, queueCollapsed });
      deepEqual([first.queueTrack, first.inspectorTrack, first.inspectorSize], [resolved.queueTrack, 0, 0], `${viewportWidth}/${queueCollapsed}`);
    }
  }
});

test("R6M pre-paint script is read-only and never asserts Inspector, Focus, or band", () => {
  const script = buildR6MFirstPaintGeometryScript();
  assert(script.includes("getItem") && !script.includes("setItem") && !script.includes("removeItem") && !script.includes("localStorage.length"), "read-only storage");
  assert(script.includes("--queue-track") && script.includes("--inspector-track") && script.includes("--inspector-size"), "effective CSS properties");
  assert(!script.includes('setAttribute("data-band"') && !script.includes("focus.active") && !script.includes("inspectorOpen"), "no forbidden assertion");
});

test("emitted R6M pre-paint script executes resolver-equivalent geometry", () => {
  const script = buildR6MFirstPaintGeometryScript();
  for (const viewportWidth of [390, 899, 900, 1000, 1099, 1100, 1300, 1512, 1600]) {
    for (const preferredQueueWidth of [240, 337, 400]) {
      for (const queueCollapsed of [false, true]) {
        const styles = new Map<string, string>();
        const attributes = new Map<string, string>();
        const persistence = defaultWorkstationPersistence();
        const workstationRaw = JSON.stringify({
          ...persistence,
          devicePreferences: {
            ...persistence.devicePreferences,
            queue: {
              ...persistence.devicePreferences.queue,
              preferredWidth: { ...persistence.devicePreferences.queue.preferredWidth, expanded: preferredQueueWidth },
            },
          },
        });
        const storageValues = new Map([
          ["lintel.r6.workstation.v1", workstationRaw],
          ["lintel.r6m.layout.v1", JSON.stringify({ queueCollapsed })],
        ]);
        runInNewContext(script, {
          document: {
            documentElement: {
              clientWidth: viewportWidth,
              style: { setProperty: (name: string, value: string) => { styles.set(name, value); } },
              setAttribute: (name: string, value: string) => { attributes.set(name, value); },
            },
          },
          window: {
            innerWidth: viewportWidth,
            location: { pathname: "/reviews/example" },
            localStorage: { getItem: (key: string) => storageValues.get(key) ?? null },
          },
          isFinite: Number.isFinite,
          JSON,
          Math,
        });
        const expected = geometry({ viewportWidth, preferredQueueWidth, queueCollapsed });
        deepEqual(
          [...styles.entries()],
          [["--queue-track", `${expected.queueTrack}px`], ["--inspector-track", "0px"], ["--inspector-size", "0px"]],
          `emitted styles ${viewportWidth}/${preferredQueueWidth}/${queueCollapsed}`,
        );
        equal(
          attributes.get("data-queue"),
          queueCollapsed && viewportWidth >= 900 ? "navigation-only" : undefined,
          `emitted presentation ${viewportWidth}/${preferredQueueWidth}/${queueCollapsed}`,
        );
      }
    }
  }
});

test("R6D and R6M pre-paint scripts are in deterministic document order", () => {
  const source = readFileSync(join(process.cwd(), "app", "(workstation)", "layout.tsx"), "utf8");
  const r6d = source.indexOf("buildWorkstationFirstPaintScript()");
  const r6m = source.indexOf("buildR6MFirstPaintGeometryScript()");
  const provider = source.indexOf("<WorkstationProvider>");
  assert(r6d >= 0 && r6d < r6m && r6m < provider, "R6D, R6M, hydration order");
});

test("separator source implements zero-track pointer, cancellation, keyboard and ARIA contract", () => {
  const source = readFileSync(join(process.cwd(), "app", "(workstation)", "PaneSeparator.tsx"), "utf8");
  for (const token of [
    'role="separator"', 'aria-orientation="vertical"', "tabIndex={0}", "aria-valuenow", "aria-valuemin",
    "aria-valuemax", "aria-controls", "setPointerCapture", "onPointerCancel={cancel}",
    "onLostPointerCapture={cancel}", 'event.key !== "Escape"', "session.resize.preview(candidate)",
    "session.resize.commit(candidate)",
  ]) assert(source.includes(token), `separator token: ${token}`);
  assert(source.includes("resizeBounds[pane]") && source.includes("bounds: session.resize.bounds"), "ARIA and pointer consume live shared bounds");
  const pointerMove = source.slice(source.indexOf("const onPointerMove"), source.indexOf("const onPointerUp"));
  assert(!pointerMove.includes("setState") && !pointerMove.includes("dispatchBound") && !pointerMove.includes("persist"), "pointermove is direct manipulation only");
});

test("provider guards React geometry writes and persists only at commit boundaries", () => {
  const source = readFileSync(join(process.cwd(), "app", "(workstation)", "WorkstationProvider.tsx"), "utf8");
  assert(source.includes("if (resizeSessionToken.current) return;\n    applyResolvedGeometry(geometry);"), "layout synchronisation guard");
  const preview = source.slice(source.indexOf("preview: (candidate)"), source.indexOf("commit: (candidate)"));
  assert(preview.includes("applyResolvedGeometry") && !preview.includes("setPreferredWidths") && !preview.includes("persistPaneWidth"), "preview is write-only geometry");
  assert(source.includes("persistPaneWidth(pane, normalized);"), "pointer commit persists normalized preference");
  assert(source.includes("geometryInputRef.current = baseInput") && source.includes("applyResolvedGeometry(baseGeometry)"), "cancel restores pre-drag geometry");
  assert(source.includes('setAttribute("data-viewport-resizing"') && source.includes('removeAttribute("data-viewport-resizing"'), "viewport reflow has a bounded snap window");
});

test("collapse and Focus controls retain separate accessible semantics", () => {
  const collapse = readFileSync(join(process.cwd(), "app", "(workstation)", "QueueCollapseControl.tsx"), "utf8");
  const supporting = readFileSync(join(process.cwd(), "app", "(workstation)", "SupportingLeft.tsx"), "utf8");
  const focusExit = readFileSync(join(process.cwd(), "app", "(workstation)", "FocusExitAffordance.tsx"), "utf8");
  for (const token of ["Hide Review Queue", "Show Review Queue", "aria-expanded", "aria-controls={REVIEW_QUEUE_REGION_ID}"]) {
    assert(collapse.includes(token), `collapse token: ${token}`);
  }
  assert(!supporting.includes("aria-expanded"), "density control has no disclosure semantics");
  assert(focusExit.includes("EXIT_FOCUS_MODE_ACTION") && !focusExit.includes('id: "focus/set"'), "Focus exit imports the accepted action");
  assert(focusExit.includes('aria-label="Exit Focus Mode"'), "Focus exit accessible name");
});

test("CSS owns quiet zero-track separators, container detail and centred content", () => {
  const shell = readFileSync(join(process.cwd(), "app", "(workstation)", "workstation-shell.module.css"), "utf8");
  const collection = readFileSync(join(process.cwd(), "app", "(workstation)", "review-collection.module.css"), "utf8");
  const selected = readFileSync(join(process.cwd(), "app", "(workstation)", "selected-review.module.css"), "utf8");
  for (const token of [
    "position: absolute", "width: 12px", "@media (pointer: coarse)", "width: 24px",
    "left: var(--queue-track", "left: calc(100% - var(--inspector-track", "background: transparent",
    "container: review-queue / inline-size", "container: workspace-pane / inline-size", "@container workspace-pane",
  ]) assert(shell.includes(token), `shell CSS token: ${token}`);
  assert(shell.includes("html[data-viewport-resizing]") && shell.includes("transition: none"), "viewport geometry snaps without animation");
  assert(collection.includes("@container review-queue") && !collection.includes("--queue-track"), "Queue detail is container-scoped");
  assert(shell.includes("margin-inline: auto") && selected.includes("margin-inline: auto"), "useful content is centred");
  assert(selected.includes("position: sticky"), "mode navigation remains sticky");
  assert(!`${shell}\n${collection}`.includes("--queue-width") && !shell.includes("--inspector-width"), "obsolete preferred-width CSS properties absent");
});

test("CSS registers effective tracks and gives separators zero-cost hover and active feedback", () => {
  const shell = readFileSync(join(process.cwd(), "app", "(workstation)", "workstation-shell.module.css"), "utf8");
  const collection = readFileSync(join(process.cwd(), "app", "(workstation)", "review-collection.module.css"), "utf8");
  for (const token of [
    "@property --queue-track", "@property --inspector-track", "@property --inspector-size",
    ".paneSeparator::after", ".paneSeparator:hover::after", 'html[data-resizing="queue"]',
    'html[data-resizing="inspector"]', "width: 2px", "background: var(--color-border-strong)",
  ]) assert(shell.includes(token), `effective property/separator token: ${token}`);
  assert(collection.includes("@container review-queue (max-width: 220px)"), "measured Queue metadata threshold");
});

test("Queue scroll continuity and Narrow Inspector crossing are wired without persistence", () => {
  const queue = readFileSync(join(process.cwd(), "app", "(workstation)", "QueueRegion.tsx"), "utf8");
  const provider = readFileSync(join(process.cwd(), "app", "(workstation)", "WorkstationProvider.tsx"), "utf8");
  assert(queue.includes("yieldedScrollTop.current = element.scrollTop") && queue.includes("element.scrollTop = yieldedScrollTop.current"), "session scroll continuity");
  assert(!queue.includes("localStorage") && !queue.includes("sessionStorage"), "Queue scroll is not persisted");
  assert(provider.includes('previousBand !== "narrow"') && provider.includes('nextBand === "narrow"') && provider.includes('surface: "inspector"'), "desktop Inspector becomes Narrow sequential surface");
});

let passed = 0;
for (const item of tests) {
  try { item.run(); passed += 1; }
  catch (error) {
    process.stderr.write(`R6M validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`R6M validation: ${passed}/${tests.length} passed\n`);
