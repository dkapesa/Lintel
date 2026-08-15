"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  R6C_SCHEMA_VERSION,
  decisionDraftContextFor,
  decisionSubjectIdFromCapability,
  dispatchAction,
  indexReviews,
  parseRoute,
  readWorkstationPersistence,
  reconcile,
  removeReviewContext,
  restoreInitialState,
  writeReviewContext,
  writeWorkstationPersistence,
  type ActionResult,
  type DecisionSubjectResolver,
  type InvocationSource,
  type LayoutBand,
  type ReviewId,
  type ReviewIndex,
  type StorageLike,
  type WorkstationState,
} from "../../lib/r6c/index";
import { projectSelectedReview } from "../../lib/r6f/index";
import { effectiveNarrowSurfaceForInspector, inspectorIsActive } from "../../lib/r6g/index";
import {
  DEFAULT_REVIEW_COLLECTION_PREFERENCES,
  readReviewCollectionPreferences,
  writeReviewCollectionPreferences,
  type ReviewCollectionPreferences,
} from "../../lib/r6e/collection-preferences";
import type { R6LBoundAction } from "../../lib/r6l/action-registry";
import type { CommandsFocusOrigin } from "../../lib/r6l/command-focus";
import { createRealWorkspaceAdapter } from "../../lib/workspace-v2/real-adapter";
import type {
  CaseDetail,
  WorkspaceIdentity,
  WorkspaceProvenance,
  WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";
import { useTheme } from "../theme-provider";
import {
  INITIAL_SEMANTIC_RESTORATION_GATE,
  receiveRouteIntent,
  reconcileRestoredNarrowPresentation,
  releasePendingRouteIntent,
  semanticRestorationStep,
  shouldApplyParsedPathname,
  type PendingRouteGate,
  type SemanticRestorationGate,
} from "../../lib/r6d/controller-contract";
import {
  layoutBandForWidth,
  type SupportingLeftPresentation,
} from "../../lib/r6d/layout-policy";
import {
  INSPECTOR_DEFAULT,
  QUEUE_DEFAULT,
  applyResolvedGeometry,
  createR6MLayoutPolicy,
  readR6MLayoutPreference,
  readR6MPreferredWidths,
  resizeBoundsForGeometry,
  resolveWorkstationGeometry,
  writePreferredInspectorWidth,
  writePreferredQueueWidth,
  writeR6MLayoutPreference,
  type ResizablePane,
  type ResizeBounds,
  type ResolvedGeometry,
  type WorkstationGeometryInput,
} from "../../lib/r6m/index";
import {
  HumanDecisionDraftStore,
  acknowledgeDecisionDraftReconciliation,
  createEmptyHumanDecisionDraft,
  currentEffectiveEntryId,
  isHumanDecisionDraftDirty,
  type DecisionBasisSnapshot,
  type DraftDurability,
  type DraftRemovalResult,
  type DraftWriteResult,
  type HumanDecisionDraftRecord,
} from "../../lib/r6k/index";
import {
  createWorkspaceDecisionService,
  type DecisionMutationCommand,
  type DecisionMutationResult,
  type WorkspaceDecisionService,
} from "../../lib/workspace-v2/decision-mutations";
import { FocusRegistry, type RegisteredFocusRegion } from "./FocusRegistry";
import HumanDecisionComposer from "./HumanDecisionComposer";
import {
  RenderedFocusValidity,
  restoreRenderedCommandsFocus,
  restoreRenderedFocus,
} from "./renderedFocusValidity";

const BOOTSTRAP_IDENTITY: WorkspaceIdentity = {
  workspaceId: "local-report",
  repository: "—",
  label: "Local reports",
};

function provenance(scenario: WorkspaceProvenance["scenario"]): WorkspaceProvenance {
  return { source: "live", isSample: false, label: "Local reports", scenario };
}

const LOADING_SNAPSHOT: WorkspaceSnapshot = {
  status: "loading",
  identity: BOOTSTRAP_IDENTITY,
  provenance: provenance("loading"),
};

const STRUCTURAL_STORAGE = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
} satisfies StorageLike;

export const HUMAN_DECISION_OVERLAY_ID = "human-decision-composer";
export const COMMANDS_OVERLAY_ID = "commands-palette";

export type CommandCloseReason = "escape" | "execution" | "navigation" | "tab" | "outside-pointer" | "external-transition";
export type CommandsController = Readonly<{
  open: () => void;
  close: (reason: CommandCloseReason) => void;
}>;

const decisionSubjectResolver: DecisionSubjectResolver = (_reviewId, currentCase) => {
  if (currentCase.decisionMutation.kind !== "available") {
    return {
      status: "unavailable",
      reason: currentCase.decisionMutation.kind === "unavailable"
        ? currentCase.decisionMutation.reason
        : "Sample review decisions are read-only.",
    };
  }
  return {
    status: "available",
    decisionSubjectId: decisionSubjectIdFromCapability(currentCase.decisionMutation.caseId),
  };
};

export type HumanDecisionController = Readonly<{
  open: (trigger: HTMLButtonElement) => void;
  close: () => void;
  draft: HumanDecisionDraftRecord | null;
  durability: DraftDurability | null;
  draftDirty: boolean;
  recordQuarantined: boolean;
  updateDraft: (draft: HumanDecisionDraftRecord) => void;
  flush: () => DraftWriteResult | null;
  discardDraft: () => DraftRemovalResult;
  discardUnreadableDraft: () => DraftWriteResult;
  acknowledgeReconcile: (
    reviewedBasis: DecisionBasisSnapshot,
  ) => ReturnType<typeof acknowledgeDecisionDraftReconciliation>;
  submit: (command: DecisionMutationCommand) => Promise<DecisionMutationResult>;
  refreshFailure: string | null;
  retryRefresh: () => Promise<void>;
}>;

export type ActivePaneResize = Readonly<{
  startX: number;
  startWidth: number;
  bounds: ResizeBounds;
  preview: (candidate: number) => void;
  commit: (candidate: number) => void;
  cancel: () => void;
}>;

type WorkstationContextValue = Readonly<{
  state: WorkstationState;
  snapshot: WorkspaceSnapshot;
  reviewIndex: ReviewIndex;
  selectedCase: CaseDetail | null;
  selectedCaseTitle: string | null;
  band: LayoutBand;
  geometry: ResolvedGeometry;
  resizeBounds: Readonly<Record<ResizablePane, ResizeBounds | null>>;
  inspectorActive: boolean;
  leftPresentation: SupportingLeftPresentation;
  queueCollapsed: boolean;
  announcement: string;
  collectionPreferences: ReviewCollectionPreferences;
  humanDecision: HumanDecisionController;
  commands: CommandsController;
  setCollectionPreferences: (preferences: ReviewCollectionPreferences) => void;
  dispatchBound: (action: R6LBoundAction, source: InvocationSource) => ActionResult;
  onDestinationClick: (event: MouseEvent<HTMLAnchorElement>, destination: Extract<R6LBoundAction, { id: "route/navigate" }>) => void;
  registerFocusRegion: (region: RegisteredFocusRegion, element: HTMLElement | null) => void;
  setQueueCollapsed: (collapsed: boolean) => void;
  beginPaneResize: (pane: ResizablePane, startX: number) => ActivePaneResize | null;
  commitKeyboardPaneWidth: (pane: ResizablePane, width: number) => void;
}>;

const WorkstationContext = createContext<WorkstationContextValue | null>(null);
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function policyDestination(pathname: string): WorkstationState["destination"] {
  const parsed = parseRoute(pathname);
  return parsed.status === "valid" ? parsed.intent.destination : "reviews";
}

function structuralState(pathname: string, viewportWidth: number): WorkstationState {
  const restored = restoreInitialState({
    pathname,
    storage: STRUCTURAL_STORAGE,
    authoritativeSnapshot: LOADING_SNAPSHOT,
    capturedAt: new Date(0).toISOString(),
    layout: {
      band: layoutBandForWidth(viewportWidth),
      policy: createR6MLayoutPolicy({
        viewportWidth,
        destination: policyDestination(pathname),
        preferredQueueWidth: QUEUE_DEFAULT,
        preferredInspectorWidth: INSPECTOR_DEFAULT,
        queueCollapsed: false,
      }),
    },
    decisionSubjectResolver,
  });
  return reconcileRestoredNarrowPresentation(
    restored,
    { reviewIndex: indexReviews([]), cases: [] },
  ).state;
}

function isPlainPrimaryClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function useWorkstation(): WorkstationContextValue {
  const value = useContext(WorkstationContext);
  if (!value) throw new Error("Workstation components must be rendered inside WorkstationProvider.");
  return value;
}

export default function WorkstationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setForcedTheme } = useTheme();
  const initialViewportWidth = 1440;
  const [viewportWidth, setViewportWidth] = useState(initialViewportWidth);
  const [state, setState] = useState<WorkstationState>(() => structuralState(pathname, initialViewportWidth));
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(LOADING_SNAPSHOT);
  const [preferredWidths, setPreferredWidths] = useState({
    queue: QUEUE_DEFAULT,
    inspector: INSPECTOR_DEFAULT,
  });
  const [queueCollapsed, setQueueCollapsedState] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [collectionPreferences, setCollectionPreferencesState] = useState<ReviewCollectionPreferences>(DEFAULT_REVIEW_COLLECTION_PREFERENCES);
  const [, setDraftVersion] = useState(0);
  const [decisionRefreshFailure, setDecisionRefreshFailure] = useState<string | null>(null);
  const stateRef = useRef(state);
  const snapshotRef = useRef(snapshot);
  const viewportWidthRef = useRef(viewportWidth);
  const preferredWidthsRef = useRef(preferredWidths);
  const queueCollapsedRef = useRef(queueCollapsed);
  const band = layoutBandForWidth(viewportWidth);
  const bandRef = useRef(band);
  const phaseAComplete = useRef(false);
  const semanticGate = useRef<SemanticRestorationGate>(INITIAL_SEMANTIC_RESTORATION_GATE);
  const routeGate = useRef<PendingRouteGate>({ pending: null });
  const focusRegistry = useRef(new FocusRegistry());
  const renderedFocusValidity = useRef(new RenderedFocusValidity(focusRegistry.current));
  const browserStorage = useRef<Storage | null>(null);
  const decisionService = useRef<WorkspaceDecisionService | null>(null);
  const draftStore = useRef<HumanDecisionDraftStore | null>(null);
  const draftCache = useRef(new Map<ReviewId, HumanDecisionDraftRecord>());
  const draftDurability = useRef(new Map<ReviewId, DraftDurability>());
  const quarantinedDrafts = useRef(new Set<ReviewId>());
  const draftWriteTimers = useRef(new Map<ReviewId, ReturnType<typeof setTimeout>>());
  const decisionInvocation = useRef<HTMLButtonElement | null>(null);
  const commandOrigin = useRef<CommandsFocusOrigin | null>(null);
  const flushDraftRef = useRef<() => DraftWriteResult | null>(() => null);
  const geometryInputRef = useRef<WorkstationGeometryInput | null>(null);
  const geometryRef = useRef<ResolvedGeometry | null>(null);
  const resizeSessionToken = useRef<symbol | null>(null);
  const viewportTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardWriteTimers = useRef<Partial<Record<ResizablePane, ReturnType<typeof setTimeout>>>>({});
  const pendingKeyboardWidths = useRef<Partial<Record<ResizablePane, number>>>({});

  viewportWidthRef.current = viewportWidth;
  preferredWidthsRef.current = preferredWidths;
  queueCollapsedRef.current = queueCollapsed;
  bandRef.current = band;

  useIsomorphicLayoutEffect(() => {
    setForcedTheme("light");
    return () => setForcedTheme(null);
  }, [setForcedTheme]);

  const reviewIndex = useMemo(
    () => indexReviews(snapshot.status === "ready" ? snapshot.cases : []),
    [snapshot],
  );
  const reviewIndexRef = useRef(reviewIndex);
  reviewIndexRef.current = reviewIndex;

  const commitState = useCallback((next: WorkstationState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const currentLayoutPolicy = useCallback((path = pathname) => createR6MLayoutPolicy({
    viewportWidth: viewportWidthRef.current,
    destination: policyDestination(path),
    preferredQueueWidth: preferredWidthsRef.current.queue,
    preferredInspectorWidth: preferredWidthsRef.current.inspector,
    queueCollapsed: queueCollapsedRef.current,
  }), [pathname]);

  const applyRouteEffect = useCallback((effect: ActionResult["routeEffect"]) => {
    if (effect.kind === "push") router.push(effect.path);
    if (effect.kind === "replace") router.replace(effect.path);
  }, [router]);

  const persistRestoration = useCallback((result: ReturnType<typeof restoreInitialState>) => {
    const storage = browserStorage.current;
    if (!storage) return;
    writeWorkstationPersistence(storage, result.writeBack.workstation);
    if (result.writeBack.reviewContext) {
      writeReviewContext(storage, result.writeBack.reviewContext);
    }
    if (result.writeBack.discardReviewContext) {
      removeReviewContext(storage, result.writeBack.discardReviewContext);
    }
  }, []);

  const persistManualPreference = useCallback((nextState: WorkstationState) => {
    const storage = browserStorage.current;
    if (!storage) return;
    const read = readWorkstationPersistence(storage);
    writeWorkstationPersistence(storage, {
      ...read.value,
      schemaVersion: R6C_SCHEMA_VERSION,
      devicePreferences: {
        ...read.value.devicePreferences,
        queue: {
          ...read.value.devicePreferences.queue,
          manualPreference: nextState.queue.manualPreference,
        },
      },
    });
  }, []);

  const actionContext = useCallback(() => ({
    reviewIndex: reviewIndexRef.current,
    cases: snapshotRef.current.status === "ready" ? snapshotRef.current.cases : [],
  }), []);

  const dispatchBound = useCallback<WorkstationContextValue["dispatchBound"]>((action, source) => {
    const previousInspectorOrigin = stateRef.current.inspector.focusOrigin;
    let startingState = stateRef.current;
    if (
      action.id !== "overlay/close"
      && startingState.overlayStack.at(-1) === HUMAN_DECISION_OVERLAY_ID
      && ["route/navigate", "route/apply", "review/select", "mode/activate"].includes(action.id)
    ) {
      flushDraftRef.current();
      startingState = dispatchAction(
        startingState,
        { id: "overlay/close", overlayId: HUMAN_DECISION_OVERLAY_ID },
        actionContext(),
        { source: "system" },
      ).state;
    }
    if (
      action.id !== "overlay/close"
      && startingState.overlayStack.at(-1) === COMMANDS_OVERLAY_ID
      && ["route/navigate", "route/apply", "review/select", "mode/activate"].includes(action.id)
    ) {
      commandOrigin.current = null;
      startingState = dispatchAction(
        startingState,
        { id: "overlay/close", overlayId: COMMANDS_OVERLAY_ID },
        actionContext(),
        { source: "system" },
      ).state;
    }
    const result = dispatchAction(startingState, action, actionContext(), { source });
    let nextState = result.state;

    if (action.id === "route/navigate" || action.id === "route/apply") {
      const surface = action.id === "route/navigate"
        ? action.destination === "reviews" ? "queue" : "workspace"
        : action.intent.destination === "reviews" && action.intent.reviewId === null ? "queue" : "workspace";
      const surfaceResult = dispatchAction(
        nextState,
        { id: "queue/show-narrow-surface", surface },
        actionContext(),
        { source: "system" },
      );
      nextState = surfaceResult.state;
    }

    commitState(nextState);
    if (action.id === "queue/set-manual-preference") persistManualPreference(nextState);
    if (result.announcement) setAnnouncement(result.announcement);
    applyRouteEffect(result.routeEffect);

    if (result.focusEffect.kind === "region") {
      const region = result.focusEffect.region;
      requestAnimationFrame(() => renderedFocusValidity.current.focusRegion(region));
    } else if (action.id === "focus/set" && action.active && result.status === "applied") {
      requestAnimationFrame(() => renderedFocusValidity.current.focusRegion("workspacePrimary"));
    } else if (action.id === "inspector/open") {
      requestAnimationFrame(() => renderedFocusValidity.current.focusRegion("inspector"));
    } else if (action.id === "inspector/traverse-relationship" && result.status === "applied") {
      requestAnimationFrame(() => renderedFocusValidity.current.focusRegion("inspector"));
    } else if (result.focusEffect.kind === "return-from-inspector") {
      const recordedOrigin = previousInspectorOrigin?.handle instanceof HTMLElement
        ? { ...previousInspectorOrigin, handle: previousInspectorOrigin.handle }
        : null;
      requestAnimationFrame(() => {
        restoreRenderedFocus(
          recordedOrigin,
          previousInspectorOrigin?.region ?? null,
          renderedFocusValidity.current,
        );
      });
    }
    return { ...result, state: nextState };
  }, [actionContext, applyRouteEffect, commitState, persistManualPreference]);

  const setCollectionPreferences = useCallback((preferences: ReviewCollectionPreferences) => {
    setCollectionPreferencesState(preferences);
    const storage = browserStorage.current;
    if (storage) writeReviewCollectionPreferences(storage, preferences, new Date().toISOString());
  }, []);

  const applyBrowserIntent = useCallback((intent: Parameters<typeof receiveRouteIntent>[1]) => {
    const received = receiveRouteIntent(routeGate.current, intent, snapshotRef.current.status);
    routeGate.current = received.gate;
    if (received.apply) {
      dispatchBound({ id: "route/apply", intent: received.apply }, "browser");
    }
  }, [dispatchBound]);

  useIsomorphicLayoutEffect(() => {
    const nextViewportWidth = window.innerWidth;
    viewportWidthRef.current = nextViewportWidth;
    bandRef.current = layoutBandForWidth(nextViewportWidth);
    setViewportWidth(nextViewportWidth);
    try {
      browserStorage.current = window.localStorage;
    } catch {
      browserStorage.current = null;
    }
    draftStore.current = new HumanDecisionDraftStore(browserStorage.current);
    decisionService.current = browserStorage.current
      ? createWorkspaceDecisionService(browserStorage.current)
      : null;
    if (browserStorage.current) {
      const restoredWidths = readR6MPreferredWidths(browserStorage.current);
      const restoredLayout = readR6MLayoutPreference(browserStorage.current);
      preferredWidthsRef.current = restoredWidths;
      queueCollapsedRef.current = restoredLayout.queueCollapsed;
      setPreferredWidths(restoredWidths);
      setQueueCollapsedState(restoredLayout.queueCollapsed);
      setCollectionPreferencesState(readReviewCollectionPreferences(browserStorage.current).preferences);
    }
    const restored = restoreInitialState({
      pathname,
      storage: browserStorage.current ?? STRUCTURAL_STORAGE,
      authoritativeSnapshot: LOADING_SNAPSHOT,
      capturedAt: new Date().toISOString(),
      layout: {
        band: bandRef.current,
        policy: createR6MLayoutPolicy({
          viewportWidth: nextViewportWidth,
          destination: policyDestination(pathname),
          preferredQueueWidth: preferredWidthsRef.current.queue,
          preferredInspectorWidth: preferredWidthsRef.current.inspector,
          queueCollapsed: queueCollapsedRef.current,
        }),
      },
      decisionSubjectResolver,
    });
    const surfaceResult = reconcileRestoredNarrowPresentation(
      restored,
      { reviewIndex: indexReviews([]), cases: [] },
    );
    commitState(surfaceResult.state);
    phaseAComplete.current = true;
    applyRouteEffect(restored.routeEffect);
  }, []); // One structural restoration at controller mount.

  const loadSnapshot = useCallback(async (preserveOnFailure = false): Promise<Readonly<{
    ok: boolean;
    reason?: string;
  }>> => {
    try {
      const storage = browserStorage.current;
      if (!storage) throw new Error("Browser storage is unavailable.");
      const adapter = createRealWorkspaceAdapter(storage);
      const next = await adapter.loadSnapshot({ scenario: "default", reportId: null });
      snapshotRef.current = next;
      setSnapshot(next);
      return { ok: true };
    } catch (error) {
      const reason = error instanceof Error
        ? `Local report storage could not be read: ${error.message}`
        : "Local report storage could not be read.";
      if (!preserveOnFailure) {
        const next: WorkspaceSnapshot = {
          status: "unavailable",
          identity: BOOTSTRAP_IDENTITY,
          provenance: provenance("unavailable"),
          reason,
        };
        snapshotRef.current = next;
        setSnapshot(next);
      }
      return { ok: false, reason };
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active) await loadSnapshot();
    };
    void load();
    const refresh = () => void load();
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
    };
  }, [loadSnapshot]);

  useEffect(() => {
    if (!phaseAComplete.current) return;
    const semantic = semanticRestorationStep(semanticGate.current, snapshot.status);
    semanticGate.current = semantic.gate;
    if (semantic.restore) {
      const restored = restoreInitialState({
        pathname,
        storage: browserStorage.current ?? STRUCTURAL_STORAGE,
        authoritativeSnapshot: snapshot,
        capturedAt: new Date().toISOString(),
        layout: { band: bandRef.current, policy: currentLayoutPolicy(pathname) },
        decisionSubjectResolver,
      });
      const surfaceResult = reconcileRestoredNarrowPresentation(
        restored,
        {
          reviewIndex: indexReviews(snapshot.status === "ready" ? snapshot.cases : []),
          cases: snapshot.status === "ready" ? snapshot.cases : [],
        },
      );
      commitState(surfaceResult.state);
      persistRestoration(restored);
      if (restored.announcements.length > 0) setAnnouncement(restored.announcements.join(" "));
      applyRouteEffect(restored.routeEffect);
    } else if (semanticGate.current.sealed) {
      const reconciled = reconcile(stateRef.current, snapshot, {
        capturedAt: new Date().toISOString(),
        decisionSubjectResolver,
      });
      if (reconciled.authoritativeSnapshotAccepted) {
        commitState(reconciled.state);
        if (reconciled.reviewContextWriteBack) {
          const storage = browserStorage.current;
          if (storage) writeReviewContext(storage, reconciled.reviewContextWriteBack);
        }
        if (reconciled.discardReviewContext) {
          const storage = browserStorage.current;
          if (storage) removeReviewContext(storage, reconciled.discardReviewContext);
        }
        if (reconciled.announcements.length > 0) setAnnouncement(reconciled.announcements.join(" "));
      }
    }

    const released = releasePendingRouteIntent(routeGate.current, snapshot.status);
    routeGate.current = released.gate;
    if (released.apply) dispatchBound({ id: "route/apply", intent: released.apply }, "browser");
  }, [snapshot]);

  useEffect(() => {
    if (!phaseAComplete.current) return;
    const parsed = parseRoute(pathname);
    if (shouldApplyParsedPathname(parsed, stateRef.current.routePath)) {
      applyBrowserIntent(parsed.intent);
      return;
    }
    if (parsed.status === "invalid") {
      const restored = restoreInitialState({
        pathname,
        storage: browserStorage.current ?? STRUCTURAL_STORAGE,
        authoritativeSnapshot: snapshotRef.current,
        capturedAt: new Date().toISOString(),
        layout: { band: bandRef.current, policy: currentLayoutPolicy(pathname) },
        decisionSubjectResolver,
      });
      const surfaceResult = reconcileRestoredNarrowPresentation(restored, actionContext());
      commitState(surfaceResult.state);
      persistRestoration(restored);
      applyRouteEffect(restored.routeEffect);
    }
  }, [pathname, actionContext, applyBrowserIntent, applyRouteEffect, commitState, persistRestoration]);

  useEffect(() => {
    const updateViewport = () => {
      const root = document.documentElement;
      const next = window.innerWidth;
      const previousBand = bandRef.current;
      const nextBand = layoutBandForWidth(next);
      root.setAttribute("data-viewport-resizing", "");
      if (viewportTransitionTimer.current !== null) {
        clearTimeout(viewportTransitionTimer.current);
      }
      viewportTransitionTimer.current = setTimeout(() => {
        viewportTransitionTimer.current = null;
        root.removeAttribute("data-viewport-resizing");
      }, 120);
      viewportWidthRef.current = next;
      bandRef.current = nextBand;
      if (
        previousBand !== "narrow"
        && nextBand === "narrow"
        && stateRef.current.inspector.open
        && stateRef.current.narrowSurface !== "inspector"
      ) {
        dispatchBound({ id: "queue/show-narrow-surface", surface: "inspector" }, "system");
      }
      setViewportWidth(next);
    };
    window.addEventListener("resize", updateViewport, { passive: true });
    return () => {
      window.removeEventListener("resize", updateViewport);
      if (viewportTransitionTimer.current !== null) {
        clearTimeout(viewportTransitionTimer.current);
        viewportTransitionTimer.current = null;
      }
      document.documentElement.removeAttribute("data-viewport-resizing");
    };
  }, [dispatchBound]);

  const selectedReviewProjection = useMemo(
    () => projectSelectedReview(state, snapshot, reviewIndex),
    [reviewIndex, snapshot, state],
  );
  const inspectorActive = inspectorIsActive(
    state.inspector.open,
    selectedReviewProjection.status === "ready",
  );
  const effectiveNarrowSurface = effectiveNarrowSurfaceForInspector(
    state.narrowSurface,
    inspectorActive,
  );
  const geometryInput = useMemo<WorkstationGeometryInput>(() => ({
    viewportWidth,
    destination: state.destination,
    queueDensity: state.queue.manualPreference,
    preferredQueueWidth: preferredWidths.queue,
    preferredInspectorWidth: preferredWidths.inspector,
    queueCollapsed,
    focusActive: state.focus.active,
    inspectorOpen: inspectorActive,
    narrowSurface: effectiveNarrowSurface,
  }), [
    effectiveNarrowSurface,
    inspectorActive,
    preferredWidths.inspector,
    preferredWidths.queue,
    queueCollapsed,
    state.destination,
    state.focus.active,
    state.queue.manualPreference,
    viewportWidth,
  ]);
  const geometry = useMemo(
    () => resolveWorkstationGeometry(geometryInput),
    [geometryInput],
  );
  const resizeBounds = useMemo<Readonly<Record<ResizablePane, ResizeBounds | null>>>(() => ({
    queue: resizeBoundsForGeometry(geometryInput, geometry, "queue"),
    inspector: resizeBoundsForGeometry(geometryInput, geometry, "inspector"),
  }), [geometry, geometryInput]);
  geometryInputRef.current = geometryInput;
  geometryRef.current = geometry;
  const leftPresentation = geometry.queuePresentation;

  useIsomorphicLayoutEffect(() => {
    if (resizeSessionToken.current) return;
    applyResolvedGeometry(geometry);
    document.documentElement.setAttribute("data-narrow-surface", effectiveNarrowSurface);
  }, [effectiveNarrowSurface, geometry]);

  useEffect(() => () => {
    const root = document.documentElement;
    root.removeAttribute("data-band");
    root.removeAttribute("data-queue");
    root.removeAttribute("data-narrow-surface");
    root.removeAttribute("data-resizing");
    root.removeAttribute("data-viewport-resizing");
    root.style.removeProperty("--queue-track");
    root.style.removeProperty("--inspector-track");
    root.style.removeProperty("--inspector-size");
  }, []);

  const persistPaneWidth = useCallback((pane: ResizablePane, width: number) => {
    const storage = browserStorage.current;
    if (!storage) return;
    if (pane === "queue") writePreferredQueueWidth(storage, width);
    else writePreferredInspectorWidth(storage, width);
  }, []);

  const commitPreferredPaneWidth = useCallback((pane: ResizablePane, width: number, bounds: ResizeBounds) => {
    const normalized = Math.min(Math.max(width, bounds.minimum), bounds.maximum);
    const next = pane === "queue"
      ? { ...preferredWidthsRef.current, queue: normalized }
      : { ...preferredWidthsRef.current, inspector: normalized };
    preferredWidthsRef.current = next;
    setPreferredWidths(next);
    return normalized;
  }, []);

  const setQueueCollapsed = useCallback((collapsed: boolean) => {
    queueCollapsedRef.current = collapsed;
    setQueueCollapsedState(collapsed);
    const storage = browserStorage.current;
    if (storage) writeR6MLayoutPreference(storage, { queueCollapsed: collapsed });
  }, []);

  const beginPaneResize = useCallback((pane: ResizablePane, startX: number): ActivePaneResize | null => {
    if (resizeSessionToken.current) return null;
    const baseInput = geometryInputRef.current;
    const baseGeometry = geometryRef.current;
    if (!baseInput || !baseGeometry) return null;
    const bounds = resizeBoundsForGeometry(baseInput, baseGeometry, pane);
    if (!bounds) return null;

    const token = Symbol(pane);
    resizeSessionToken.current = token;
    document.documentElement.setAttribute("data-resizing", pane);
    const startWidth = pane === "queue" ? baseGeometry.queueTrack : baseGeometry.inspectorTrack;
    const resolveCandidate = (candidate: number) => {
      const nextInput: WorkstationGeometryInput = pane === "queue"
        ? { ...baseInput, preferredQueueWidth: candidate }
        : { ...baseInput, preferredInspectorWidth: candidate };
      return { nextInput, resolved: resolveWorkstationGeometry(nextInput) };
    };
    const finish = () => {
      if (resizeSessionToken.current !== token) return false;
      resizeSessionToken.current = null;
      document.documentElement.removeAttribute("data-resizing");
      return true;
    };

    return {
      startX,
      startWidth,
      bounds,
      preview: (candidate) => {
        if (resizeSessionToken.current !== token) return;
        applyResolvedGeometry(resolveCandidate(candidate).resolved);
      },
      commit: (candidate) => {
        if (resizeSessionToken.current !== token) return;
        const normalized = commitPreferredPaneWidth(pane, candidate, bounds);
        const next = resolveCandidate(normalized);
        geometryInputRef.current = next.nextInput;
        geometryRef.current = next.resolved;
        if (!finish()) return;
        applyResolvedGeometry(next.resolved);
        persistPaneWidth(pane, normalized);
      },
      cancel: () => {
        if (!finish()) return;
        geometryInputRef.current = baseInput;
        geometryRef.current = baseGeometry;
        applyResolvedGeometry(baseGeometry);
      },
    };
  }, [commitPreferredPaneWidth, persistPaneWidth]);

  const commitKeyboardPaneWidth = useCallback((pane: ResizablePane, width: number) => {
    if (resizeSessionToken.current) return;
    const currentInput = geometryInputRef.current;
    const currentGeometry = geometryRef.current;
    if (!currentInput || !currentGeometry) return;
    const bounds = resizeBoundsForGeometry(currentInput, currentGeometry, pane);
    if (!bounds) return;
    const normalized = commitPreferredPaneWidth(pane, width, bounds);
    const nextInput: WorkstationGeometryInput = pane === "queue"
      ? { ...currentInput, preferredQueueWidth: normalized }
      : { ...currentInput, preferredInspectorWidth: normalized };
    const resolved = resolveWorkstationGeometry(nextInput);
    geometryInputRef.current = nextInput;
    geometryRef.current = resolved;
    const root = document.documentElement;
    root.setAttribute("data-resizing", "keyboard");
    applyResolvedGeometry(resolved);
    requestAnimationFrame(() => {
      if (!resizeSessionToken.current && root.getAttribute("data-resizing") === "keyboard") {
        root.removeAttribute("data-resizing");
      }
    });

    pendingKeyboardWidths.current[pane] = normalized;
    const existing = keyboardWriteTimers.current[pane];
    if (existing) clearTimeout(existing);
    keyboardWriteTimers.current[pane] = setTimeout(() => {
      const pending = pendingKeyboardWidths.current[pane];
      if (pending !== undefined) persistPaneWidth(pane, pending);
      delete pendingKeyboardWidths.current[pane];
      delete keyboardWriteTimers.current[pane];
    }, 150);
  }, [commitPreferredPaneWidth, persistPaneWidth]);

  useEffect(() => () => {
    for (const pane of ["queue", "inspector"] as const) {
      const timer = keyboardWriteTimers.current[pane];
      if (timer) clearTimeout(timer);
      const pending = pendingKeyboardWidths.current[pane];
      if (pending !== undefined) persistPaneWidth(pane, pending);
    }
  }, [persistPaneWidth]);

  const selectedCase = useMemo(() => {
    if (state.selectedReview.status !== "available" || snapshot.status !== "ready") return null;
    const currentCaseId = state.selectedReview.currentCaseId;
    return snapshot.cases.find((item) => item.caseId === currentCaseId) ?? null;
  }, [snapshot, state.selectedReview]);
  const selectedCaseTitle = useMemo(() => {
    if (!selectedCase || snapshot.status !== "ready") return null;
    for (const group of snapshot.groups) {
      const summary = group.cases.find((item) => item.caseId === selectedCase.caseId);
      if (summary) return summary.title;
    }
    return selectedCase.github.branch;
  }, [selectedCase, snapshot]);

  const selectedReviewId = state.selectedReview.status === "available"
    ? state.selectedReview.reviewId
    : null;

  const hydrateDraft = useCallback((reviewId: ReviewId, detail: CaseDetail): HumanDecisionDraftRecord => {
    const cached = draftCache.current.get(reviewId);
    if (cached) return cached;
    const context = decisionDraftContextFor(reviewId, detail, decisionSubjectResolver);
    const stored = draftStore.current?.read(reviewId) ?? { status: "absent" as const };
    let draft: HumanDecisionDraftRecord;
    if (stored.status === "valid") {
      draft = stored.draft;
      draftDurability.current.set(reviewId, { category: "saved", label: "Draft saved" });
      quarantinedDrafts.current.delete(reviewId);
    } else {
      const now = new Date().toISOString();
      draft = createEmptyHumanDecisionDraft(
        reviewId,
        context,
        currentEffectiveEntryId(detail),
        now,
      );
      if (stored.status === "quarantined") {
        quarantinedDrafts.current.add(reviewId);
        draftDurability.current.set(reviewId, {
          category: "not-saved",
          label: "Draft not saved on this device",
          reason: "unreadable-review-draft",
        });
      } else {
        quarantinedDrafts.current.delete(reviewId);
        const storeStatus = draftStore.current?.storeDurability();
        if (storeStatus) draftDurability.current.set(reviewId, storeStatus);
        else draftDurability.current.delete(reviewId);
      }
    }
    draftCache.current.set(reviewId, draft);
    setDraftVersion((version) => version + 1);
    return draft;
  }, []);

  useEffect(() => {
    if (selectedReviewId && selectedCase) hydrateDraft(selectedReviewId, selectedCase);
  }, [hydrateDraft, selectedCase, selectedReviewId]);

  const persistDraft = useCallback((reviewId: ReviewId): DraftWriteResult | null => {
    const timer = draftWriteTimers.current.get(reviewId);
    if (timer) clearTimeout(timer);
    draftWriteTimers.current.delete(reviewId);
    const draft = draftCache.current.get(reviewId);
    if (!draft || !isHumanDecisionDraftDirty(draft)) return null;
    const store = draftStore.current;
    const result = store
      ? store.write(reviewId, draft)
      : {
          persisted: false,
          durability: {
            category: "unavailable" as const,
            label: "Drafts unavailable on this device" as const,
            reason: "storage-unavailable" as const,
          },
        };
    draftDurability.current.set(reviewId, result.durability);
    setDraftVersion((version) => version + 1);
    return result;
  }, []);

  flushDraftRef.current = () => {
    const selection = stateRef.current.selectedReview;
    return selection.status === "available" ? persistDraft(selection.reviewId) : null;
  };

  const focusDecisionInvocation = useCallback(() => {
    requestAnimationFrame(() => {
      const trigger = decisionInvocation.current;
      if (trigger?.isConnected) trigger.focus();
    });
  }, []);

  const closeDecisionOverlay = useCallback((flush: boolean, returnFocus: boolean) => {
    if (flush) flushDraftRef.current();
    if (stateRef.current.overlayStack.at(-1) === HUMAN_DECISION_OVERLAY_ID) {
      dispatchBound({ id: "overlay/close", overlayId: HUMAN_DECISION_OVERLAY_ID }, "visible-ui");
    }
    if (returnFocus) focusDecisionInvocation();
  }, [dispatchBound, focusDecisionInvocation]);

  const openHumanDecision = useCallback((trigger: HTMLButtonElement) => {
    const selection = stateRef.current.selectedReview;
    const currentSnapshot = snapshotRef.current;
    if (selection.status !== "available" || currentSnapshot.status !== "ready") return;
    const detail = currentSnapshot.cases.find((item) => item.caseId === selection.currentCaseId);
    if (!detail) return;
    decisionInvocation.current = trigger;
    hydrateDraft(selection.reviewId, detail);
    dispatchBound({ id: "overlay/open", overlayId: HUMAN_DECISION_OVERLAY_ID }, "visible-ui");
  }, [dispatchBound, hydrateDraft]);

  const updateHumanDecisionDraft = useCallback((draft: HumanDecisionDraftRecord) => {
    const reviewId = draft.binding.reviewId;
    draftCache.current.set(reviewId, draft);
    draftDurability.current.delete(reviewId);
    const existing = draftWriteTimers.current.get(reviewId);
    if (existing) clearTimeout(existing);
    draftWriteTimers.current.set(reviewId, setTimeout(() => persistDraft(reviewId), 150));
    setDraftVersion((version) => version + 1);
  }, [persistDraft]);

  const discardSelectedDraft = useCallback((): DraftRemovalResult => {
    const selection = stateRef.current.selectedReview;
    if (selection.status !== "available") {
      return {
        removed: false,
        durability: {
          category: "unavailable",
          label: "Drafts unavailable on this device",
          reason: "storage-unavailable",
        },
      };
    }
    const result = draftStore.current?.removeValid(selection.reviewId) ?? {
      removed: false,
      durability: {
        category: "unavailable" as const,
        label: "Drafts unavailable on this device" as const,
        reason: "storage-unavailable" as const,
      },
    };
    draftDurability.current.set(selection.reviewId, result.durability);
    if (result.removed) {
      draftCache.current.delete(selection.reviewId);
      draftDurability.current.delete(selection.reviewId);
      quarantinedDrafts.current.delete(selection.reviewId);
      const currentSnapshot = snapshotRef.current;
      const detail = currentSnapshot.status === "ready"
        ? currentSnapshot.cases.find((item) => item.caseId === selection.currentCaseId)
        : null;
      if (detail) hydrateDraft(selection.reviewId, detail);
    }
    setDraftVersion((version) => version + 1);
    return result;
  }, [hydrateDraft]);

  const discardUnreadableSelectedDraft = useCallback((): DraftWriteResult => {
    const selection = stateRef.current.selectedReview;
    const unavailable: DraftWriteResult = {
      persisted: false,
      durability: {
        category: "unavailable",
        label: "Drafts unavailable on this device",
        reason: "storage-unavailable",
      },
    };
    if (selection.status !== "available") return unavailable;
    const draft = draftCache.current.get(selection.reviewId);
    if (!draft) return unavailable;
    const result = draftStore.current?.replaceUnreadable(selection.reviewId, draft) ?? unavailable;
    draftDurability.current.set(selection.reviewId, result.durability);
    if (result.persisted) quarantinedDrafts.current.delete(selection.reviewId);
    setDraftVersion((version) => version + 1);
    return result;
  }, []);

  const acknowledgeSelectedReconcile = useCallback((reviewedBasis: DecisionBasisSnapshot) => {
    const selection = stateRef.current.selectedReview;
    const currentSnapshot = snapshotRef.current;
    if (selection.status !== "available" || currentSnapshot.status !== "ready") {
      return { status: "moved-again" as const };
    }
    const detail = currentSnapshot.cases.find((item) => item.caseId === selection.currentCaseId);
    const draft = draftCache.current.get(selection.reviewId);
    if (!detail || !draft) return { status: "moved-again" as const };
    const currentBasis: DecisionBasisSnapshot = {
      context: decisionDraftContextFor(selection.reviewId, detail, decisionSubjectResolver),
      recordedEntryId: currentEffectiveEntryId(detail),
    };
    const result = acknowledgeDecisionDraftReconciliation(
      draft,
      reviewedBasis,
      currentBasis,
      new Date().toISOString(),
    );
    if (result.status === "rebound") updateHumanDecisionDraft(result.draft);
    return result;
  }, [updateHumanDecisionDraft]);

  const submitHumanDecision = useCallback(async (
    command: DecisionMutationCommand,
  ): Promise<DecisionMutationResult> => {
    const selection = stateRef.current.selectedReview;
    const service = decisionService.current;
    if (selection.status !== "available" || !service) {
      return {
        outcome: "unavailable",
        message: "Human Decision storage is unavailable in this browser.",
      };
    }
    const result = command.kind === "record"
      ? service.recordDecision(command)
      : command.kind === "reaffirm"
        ? service.reaffirmDecision(command)
        : command.kind === "supersede"
          ? service.supersedeDecision(command)
          : service.withdrawDecision(command);
    if (result.outcome === "stale-command") {
      await loadSnapshot(true);
      return result;
    }
    if (result.outcome !== "persisted") return result;

    const reviewId = selection.reviewId;
    const timer = draftWriteTimers.current.get(reviewId);
    if (timer) clearTimeout(timer);
    draftWriteTimers.current.delete(reviewId);
    draftCache.current.delete(reviewId);
    draftDurability.current.delete(reviewId);
    const durableClear = draftStore.current?.removeValid(reviewId);
    if (durableClear?.removed) quarantinedDrafts.current.delete(reviewId);
    else if (durableClear?.reason === "record-quarantined") quarantinedDrafts.current.add(reviewId);
    setDraftVersion((version) => version + 1);
    closeDecisionOverlay(false, false);

    const refreshed = await loadSnapshot(true);
    if (!refreshed.ok) {
      const message = `Decision recorded, but the workspace could not be refreshed. ${refreshed.reason ?? "Reload the workspace."}`;
      setDecisionRefreshFailure(message);
      setAnnouncement(message);
      focusDecisionInvocation();
      return { ...result, outcome: "persisted-refresh-failed", message };
    }
    setDecisionRefreshFailure(null);
    setAnnouncement(result.message);
    focusDecisionInvocation();
    return result;
  }, [closeDecisionOverlay, focusDecisionInvocation, loadSnapshot]);

  const retryDecisionRefresh = useCallback(async () => {
    const result = await loadSnapshot(true);
    if (result.ok) {
      setDecisionRefreshFailure(null);
      setAnnouncement("Workspace refreshed.");
    } else {
      setDecisionRefreshFailure(`Decision recorded, but the workspace could not be refreshed. ${result.reason ?? "Reload the workspace."}`);
    }
  }, [loadSnapshot]);

  const onDestinationClick = useCallback<WorkstationContextValue["onDestinationClick"]>((event, action) => {
    if (!isPlainPrimaryClick(event)) return;
    event.preventDefault();
    dispatchBound(action, "visible-ui");
  }, [dispatchBound]);

  const registerFocusRegion = useCallback((region: RegisteredFocusRegion, element: HTMLElement | null) => {
    renderedFocusValidity.current.register(region, element);
  }, []);

  const closeCommands = useCallback((reason: CommandCloseReason) => {
    const origin = commandOrigin.current;
    if (stateRef.current.overlayStack.at(-1) === COMMANDS_OVERLAY_ID) {
      dispatchBound({ id: "overlay/close", overlayId: COMMANDS_OVERLAY_ID }, "commands");
    }
    commandOrigin.current = null;
    if (reason !== "escape" && reason !== "execution") return;
    requestAnimationFrame(() => {
      restoreRenderedCommandsFocus(origin, renderedFocusValidity.current);
    });
  }, [dispatchBound]);

  const openCommands = useCallback(() => {
    if (stateRef.current.overlayStack.at(-1) === HUMAN_DECISION_OVERLAY_ID) return;
    if (stateRef.current.overlayStack.at(-1) === COMMANDS_OVERLAY_ID) {
      document.getElementById("lintel-commands-input")?.focus();
      return;
    }
    const element = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const region = focusRegistry.current.regionContaining(element);
    commandOrigin.current = element ? {
      element,
      region,
      scope: {
        destination: stateRef.current.destination,
        reviewId: stateRef.current.selectedReview.status === "none" ? null : stateRef.current.selectedReview.reviewId,
      },
    } : null;
    dispatchBound({ id: "overlay/open", overlayId: COMMANDS_OVERLAY_ID }, "commands");
  }, [dispatchBound]);

  const activeDraft = selectedReviewId ? draftCache.current.get(selectedReviewId) ?? null : null;
  const activeDurability = selectedReviewId
    ? draftDurability.current.get(selectedReviewId) ?? draftStore.current?.storeDurability() ?? null
    : null;
  const activeDraftDirty = activeDraft ? isHumanDecisionDraftDirty(activeDraft) : false;
  const activeRecordQuarantined = selectedReviewId ? quarantinedDrafts.current.has(selectedReviewId) : false;
  const humanDecision = useMemo<HumanDecisionController>(() => ({
    open: openHumanDecision,
    close: () => closeDecisionOverlay(true, true),
    draft: activeDraft,
    durability: activeDurability,
    draftDirty: activeDraftDirty,
    recordQuarantined: activeRecordQuarantined,
    updateDraft: updateHumanDecisionDraft,
    flush: () => selectedReviewId ? persistDraft(selectedReviewId) : null,
    discardDraft: discardSelectedDraft,
    discardUnreadableDraft: discardUnreadableSelectedDraft,
    acknowledgeReconcile: acknowledgeSelectedReconcile,
    submit: submitHumanDecision,
    refreshFailure: decisionRefreshFailure,
    retryRefresh: retryDecisionRefresh,
  }), [
    acknowledgeSelectedReconcile,
    activeDraft,
    activeDraftDirty,
    activeDurability,
    activeRecordQuarantined,
    closeDecisionOverlay,
    decisionRefreshFailure,
    discardSelectedDraft,
    discardUnreadableSelectedDraft,
    openHumanDecision,
    persistDraft,
    retryDecisionRefresh,
    selectedReviewId,
    submitHumanDecision,
    updateHumanDecisionDraft,
  ]);

  const commands = useMemo<CommandsController>(() => ({ open: openCommands, close: closeCommands }), [closeCommands, openCommands]);

  const value = useMemo<WorkstationContextValue>(() => ({
    state,
    snapshot,
    reviewIndex,
    selectedCase,
    selectedCaseTitle,
    band,
    geometry,
    resizeBounds,
    inspectorActive,
    leftPresentation,
    queueCollapsed,
    announcement,
    collectionPreferences,
    humanDecision,
    commands,
    setCollectionPreferences,
    dispatchBound,
    onDestinationClick,
    registerFocusRegion,
    setQueueCollapsed,
    beginPaneResize,
    commitKeyboardPaneWidth,
  }), [
    state,
    snapshot,
    reviewIndex,
    selectedCase,
    selectedCaseTitle,
    band,
    geometry,
    resizeBounds,
    inspectorActive,
    leftPresentation,
    queueCollapsed,
    announcement,
    collectionPreferences,
    humanDecision,
    commands,
    setCollectionPreferences,
    dispatchBound,
    onDestinationClick,
    registerFocusRegion,
    setQueueCollapsed,
    beginPaneResize,
    commitKeyboardPaneWidth,
  ]);

  const composerOpen = state.overlayStack.at(-1) === HUMAN_DECISION_OVERLAY_ID;

  return (
    <WorkstationContext.Provider value={value}>
      {children}
      <HumanDecisionComposer
        open={composerOpen}
        reviewId={selectedReviewId}
        detail={selectedCase}
        draft={activeDraft}
        durability={activeDurability}
        recordQuarantined={activeRecordQuarantined}
        onClose={humanDecision.close}
        onUpdateDraft={humanDecision.updateDraft}
        onDiscardDraft={humanDecision.discardDraft}
        onDiscardUnreadableDraft={humanDecision.discardUnreadableDraft}
        onAcknowledgeReconcile={humanDecision.acknowledgeReconcile}
        onSubmit={humanDecision.submit}
      />
    </WorkstationContext.Provider>
  );
}
