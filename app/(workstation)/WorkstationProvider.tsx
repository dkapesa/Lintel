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
  decisionSubjectIdFromCapability,
  dispatchAction,
  effectiveLayout,
  indexReviews,
  parseRoute,
  readWorkstationPersistence,
  reconcile,
  removeReviewContext,
  restoreInitialState,
  writeReviewContext,
  writeWorkstationPersistence,
  type ActionResult,
  type ApplicationAction,
  type DecisionSubjectResolver,
  type EffectiveLayout,
  type LayoutBand,
  type ReviewIndex,
  type StorageLike,
  type WorkstationState,
} from "../../lib/r6c/index";
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
  type R6DBoundActionId,
  type SemanticRestorationGate,
} from "../../lib/r6d/controller-contract";
import {
  R6D_LAYOUT_POLICY,
  layoutBandForWidth,
  supportingLeftPresentation,
  type SupportingLeftPresentation,
} from "../../lib/r6d/layout-policy";
import { FocusRegistry, type R6DRegisteredFocusRegion } from "./FocusRegistry";

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

type R6DBoundAction = Extract<ApplicationAction, { id: R6DBoundActionId }>;

type WorkstationContextValue = Readonly<{
  state: WorkstationState;
  snapshot: WorkspaceSnapshot;
  reviewIndex: ReviewIndex;
  selectedCase: CaseDetail | null;
  selectedCaseTitle: string | null;
  band: LayoutBand;
  layout: EffectiveLayout;
  leftPresentation: SupportingLeftPresentation;
  announcement: string;
  dispatchBound: (action: R6DBoundAction, source: "visible-ui" | "system" | "browser") => ActionResult;
  onDestinationClick: (event: MouseEvent<HTMLAnchorElement>, destination: R6DBoundAction & { id: "route/navigate" }) => void;
  registerFocusRegion: (region: R6DRegisteredFocusRegion, element: HTMLElement | null) => void;
}>;

const WorkstationContext = createContext<WorkstationContextValue | null>(null);
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function structuralState(pathname: string): WorkstationState {
  const restored = restoreInitialState({
    pathname,
    storage: STRUCTURAL_STORAGE,
    authoritativeSnapshot: LOADING_SNAPSHOT,
    capturedAt: new Date(0).toISOString(),
    layout: { band: "standard" as const, policy: R6D_LAYOUT_POLICY },
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
  const [state, setState] = useState<WorkstationState>(() => structuralState(pathname));
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(LOADING_SNAPSHOT);
  const [band, setBand] = useState<LayoutBand>("standard");
  const [announcement, setAnnouncement] = useState("");
  const stateRef = useRef(state);
  const snapshotRef = useRef(snapshot);
  const bandRef = useRef(band);
  const phaseAComplete = useRef(false);
  const semanticGate = useRef<SemanticRestorationGate>(INITIAL_SEMANTIC_RESTORATION_GATE);
  const routeGate = useRef<PendingRouteGate>({ pending: null });
  const focusRegistry = useRef(new FocusRegistry());
  const browserStorage = useRef<Storage | null>(null);

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
    const result = dispatchAction(stateRef.current, action, actionContext(), { source });
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

    if (result.focusEffect.kind === "region" && result.focusEffect.region !== "inspector") {
      const region = result.focusEffect.region;
      requestAnimationFrame(() => focusRegistry.current.focusRegion(region));
    }
    return { ...result, state: nextState };
  }, [actionContext, applyRouteEffect, commitState, persistManualPreference]);

  const applyBrowserIntent = useCallback((intent: Parameters<typeof receiveRouteIntent>[1]) => {
    const received = receiveRouteIntent(routeGate.current, intent, snapshotRef.current.status);
    routeGate.current = received.gate;
    if (received.apply) {
      dispatchBound({ id: "route/apply", intent: received.apply }, "browser");
    }
  }, [dispatchBound]);

  useIsomorphicLayoutEffect(() => {
    const nextBand = layoutBandForWidth(window.innerWidth);
    bandRef.current = nextBand;
    setBand(nextBand);
    try {
      browserStorage.current = window.localStorage;
    } catch {
      browserStorage.current = null;
    }
    const restored = restoreInitialState({
      pathname,
      storage: browserStorage.current ?? STRUCTURAL_STORAGE,
      authoritativeSnapshot: LOADING_SNAPSHOT,
      capturedAt: new Date().toISOString(),
      layout: { band: nextBand, policy: R6D_LAYOUT_POLICY },
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

  useEffect(() => {
    let active = true;
    async function load(): Promise<void> {
      try {
        const storage = browserStorage.current;
        if (!storage) throw new Error("Browser storage is unavailable.");
        const adapter = createRealWorkspaceAdapter(storage);
        const next = await adapter.loadSnapshot({ scenario: "default", reportId: null });
        if (active) {
          snapshotRef.current = next;
          setSnapshot(next);
        }
      } catch (error) {
        if (!active) return;
        const next: WorkspaceSnapshot = {
          status: "unavailable",
          identity: BOOTSTRAP_IDENTITY,
          provenance: provenance("unavailable"),
          reason: error instanceof Error
            ? `Local report storage could not be read: ${error.message}`
            : "Local report storage could not be read.",
        };
        snapshotRef.current = next;
        setSnapshot(next);
      }
    }
    void load();
    const refresh = () => void load();
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
    };
  }, []);

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
        layout: { band: bandRef.current, policy: R6D_LAYOUT_POLICY },
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
        layout: { band: bandRef.current, policy: R6D_LAYOUT_POLICY },
        decisionSubjectResolver,
      });
      const surfaceResult = reconcileRestoredNarrowPresentation(restored, actionContext());
      commitState(surfaceResult.state);
      persistRestoration(restored);
      applyRouteEffect(restored.routeEffect);
    }
  }, [pathname, actionContext, applyBrowserIntent, applyRouteEffect, commitState, persistRestoration]);

  useEffect(() => {
    const updateBand = () => {
      const next = layoutBandForWidth(window.innerWidth);
      bandRef.current = next;
      setBand(next);
    };
    window.addEventListener("resize", updateBand, { passive: true });
    return () => window.removeEventListener("resize", updateBand);
  }, []);

  const layout = useMemo(() => effectiveLayout({
    band,
    policy: R6D_LAYOUT_POLICY,
    manualPreference: state.queue.manualPreference,
    focusActive: state.focus.active,
    inspectorOpen: state.inspector.open,
    narrowSurface: state.narrowSurface,
  }), [band, state]);
  const leftPresentation = supportingLeftPresentation(state.destination, layout.queue);

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-band", band);
    root.setAttribute("data-queue", leftPresentation);
    root.setAttribute("data-narrow-surface", state.narrowSurface);
    return () => {
      root.removeAttribute("data-band");
      root.removeAttribute("data-queue");
      root.removeAttribute("data-narrow-surface");
    };
  }, [band, leftPresentation, state.narrowSurface]);

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

  const onDestinationClick = useCallback<WorkstationContextValue["onDestinationClick"]>((event, action) => {
    if (!isPlainPrimaryClick(event)) return;
    event.preventDefault();
    dispatchBound(action, "visible-ui");
  }, [dispatchBound]);

  const registerFocusRegion = useCallback((region: R6DRegisteredFocusRegion, element: HTMLElement | null) => {
    focusRegistry.current.register(region, element);
  }, []);

  const value = useMemo<WorkstationContextValue>(() => ({
    state,
    snapshot,
    reviewIndex,
    selectedCase,
    selectedCaseTitle,
    band,
    layout,
    leftPresentation,
    announcement,
    dispatchBound,
    onDestinationClick,
    registerFocusRegion,
  }), [
    state,
    snapshot,
    reviewIndex,
    selectedCase,
    selectedCaseTitle,
    band,
    layout,
    leftPresentation,
    announcement,
    dispatchBound,
    onDestinationClick,
    registerFocusRegion,
  ]);

  return <WorkstationContext.Provider value={value}>{children}</WorkstationContext.Provider>;
}
