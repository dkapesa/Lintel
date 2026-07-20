"use client";

/* R1B.0 — Production Workspace V2 · route-level UI-state owner.

   The single client boundary and the one owner of coherent interaction state
   for the whole route. It owns exactly:

     selectedCaseId    which queue case is open
     focusedArtifact   which finding / evidence / requirement is focal (or none)
     activeStage       which Evidence Spine stage is current
     decisionFocused   whether the Decision Context inspector is focal

   Everything on screen is a pure projection of those four values plus the
   serialisable snapshot passed in from the server route. Individual planes
   receive projections and callbacks; none of them holds a competing copy of
   the selected case or focused artifact.

   Persistence (R1B.5). The client is the authoritative owner of the mutation
   flow, but never touches storage itself: in real mode the bootstrap injects a
   narrow `WorkspacePersistence` service and a `reload` reprojection. The client
   validates the command target against the selected case, marks that exact
   action pending, runs the write, and only after a verified persist asks the
   bootstrap to reproject through the read-only adapter — it never optimistically
   edits queue groups, review status, condition status or counts. In fixture mode
   both are absent, so no control is interactive and nothing is written. No global
   state, no context, no direct localStorage, no ledger writes, and no import from
   app/visual-lab/workspace-v2/**. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./workspace-v2.module.css";
import { WorkspaceQueue } from "./components/WorkspaceQueue";
import { EvidenceSpine } from "./components/EvidenceSpine";
import { VerificationCanvas } from "./components/VerificationCanvas";
import { WorkspaceInspector, type InspectorMutations } from "./components/WorkspaceInspector";
import { WorkspaceShellState } from "./components/WorkspaceShellState";
import { WorkstationMinWidthNotice } from "./components/atoms";
import {
  resolveArtifactRef,
  resolveInspector,
  stageForArtifactKind,
} from "../../lib/workspace-v2/projections";
import type {
  MutationResult,
  WorkspacePersistence,
} from "../../lib/workspace-v2/persistence";
import type { ReloadOutcome } from "./RealWorkspaceBootstrap";
import {
  WORKSPACE_V2_STAGES,
  type ArtifactKind,
  type ArtifactRef,
  type CaseDetail,
  type ConditionProgressCapability,
  type ReviewStatus,
  type StageId,
  type WorkspaceReadySnapshot,
  type WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";

/* An `available` condition capability — the only shape the client acts on. */
type AvailableCondition = Extract<ConditionProgressCapability, { kind: "available" }>;

export default function WorkspaceV2Client({
  snapshot,
  persistence,
  reload,
}: {
  snapshot: WorkspaceSnapshot;
  /* Present only in real mode. Absent → the workstation is read-only. */
  persistence?: WorkspacePersistence | null;
  reload?: () => Promise<ReloadOutcome>;
}) {
  if (snapshot.status !== "ready") {
    return <WorkspaceShellState snapshot={snapshot} />;
  }
  return <ReadyWorkspace snapshot={snapshot} persistence={persistence ?? null} reload={reload ?? null} />;
}

/* Reduced-motion-aware scroll behaviour. Programmatic smooth scrolling is
   disabled when the user prefers reduced motion, so no essential state change
   depends on animation. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

/* A related-artifact focus request. `token` makes each activation distinct so a
   repeated activation of the same artifact still re-runs the post-render focus
   effect deterministically (no arbitrary delay). */
type FocusRequest = { ref: ArtifactRef; token: number };

function ReadyWorkspace({
  snapshot,
  persistence,
  reload,
}: {
  snapshot: WorkspaceReadySnapshot;
  persistence: WorkspacePersistence | null;
  reload: (() => Promise<ReloadOutcome>) | null;
}) {
  /* ---- Held UI values (single route-level owner) ---- */
  const [selectedCaseId, setSelectedCaseId] = useState<string>(snapshot.defaultCaseId);
  const [focusedArtifact, setFocusedArtifact] = useState<ArtifactRef | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("change");
  const [decisionFocused, setDecisionFocused] = useState(false);

  /* ---- Persistence flow state (R1B.5) ----
     `pendingMutation` is the exact in-flight command identity; while set, every
     mutation control is disabled so a rapid second click / Space cannot start a
     duplicate write or a second timestamp. Read navigation is never disabled.
     The two result holders drive the restrained inline status + a polite
     announcement; they are the ONLY places a mutation outcome is shown. */
  const [pendingMutation, setPendingMutation] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<MutationResult | null>(null);
  const [conditionResult, setConditionResult] = useState<
    { conditionKey: string; result: MutationResult } | null
  >(null);
  const interactive = persistence !== null && reload !== null;
  /* Pending post-render focus move for related-artifact navigation. Ordinary
     record clicks never set this (focus is already on the clicked control), so
     de-emphasis / focus is only forcibly moved when the Inspector drives it. */
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);

  /* Restrained polite live region for ordinary navigation the eye can miss
     (case selected, unresolved relation target). Blocking failures are
     announced assertively by the shell states' role="alert" instead, so the
     ready workstation never needs an assertive region. The nonce lets an
     identical message be re-announced. */
  const [politeMessage, setPoliteMessage] = useState<{ text: string; n: number }>({ text: "", n: 0 });

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const suppressReconcileUntil = useRef(0);
  const focusTokenRef = useRef(0);
  /* The control that opened the Decision Context inspector, so focus can be
     restored to it when the context is cleared. */
  const decisionTriggerRef = useRef<HTMLElement | null>(null);

  const announce = useCallback((text: string) => {
    setPoliteMessage((current) => ({ text, n: current.n + 1 }));
  }, []);

  /* ---- Pure projections ---- */
  const caseById = useMemo(() => {
    const map = new Map<string, CaseDetail>();
    for (const detail of snapshot.cases) map.set(detail.caseId, detail);
    return map;
  }, [snapshot.cases]);

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of snapshot.groups) {
      for (const item of group.cases) map.set(item.caseId, item.title);
    }
    return map;
  }, [snapshot.groups]);

  /* Selection is always valid: fall back to the default case if a stale id is
     ever held. */
  const activeCase: CaseDetail =
    caseById.get(selectedCaseId) ?? caseById.get(snapshot.defaultCaseId) ?? snapshot.cases[0];
  const activeTitle = titleById.get(activeCase.caseId) ?? activeCase.github.branch;

  const inspectorProjection = useMemo(
    () => resolveInspector(activeCase, focusedArtifact, decisionFocused, activeTitle),
    [activeCase, focusedArtifact, decisionFocused, activeTitle],
  );

  const plateCurrent = activeStage === "decision";

  /* ---- Case selection: one update drives every plane ---- */
  const selectCase = useCallback(
    (caseId: string) => {
      if (caseId === selectedCaseId) return;
      setSelectedCaseId(caseId);
      /* Changing case clears every piece of state that could otherwise expose
         content from the previous case: focused artifact, Decision Context, a
         stale Inspector projection (re-derived from the new case), any in-flight
         related-artifact focus request, and the Spine stage. */
      setFocusedArtifact(null);
      setDecisionFocused(false);
      setActiveStage("change");
      setFocusRequest(null);
      /* A mutation result belongs to the case it was applied to; clear it so a
         previous case's status message never bleeds onto a different case. */
      setReviewResult(null);
      setConditionResult(null);
      decisionTriggerRef.current = null;
      const body = bodyRef.current;
      if (body) {
        suppressReconcileUntil.current = Date.now() + 400;
        body.scrollTo({ top: 0, behavior: "auto" });
      }
      /* Selecting a case does not move focus (it stays on the Queue row), so
         the case change is announced for assistive technology. */
      const title = titleById.get(caseId);
      if (title) announce(`Opened case: ${title}`);
    },
    [announce, selectedCaseId, titleById],
  );

  /* ---- Artifact focus ---- */
  const toggleFocus = useCallback((kind: ArtifactKind, id: string) => {
    /* Focusing an artifact supersedes an open Decision Context. */
    setDecisionFocused(false);
    setFocusedArtifact((current) =>
      current && current.kind === kind && current.id === id ? null : { kind, id },
    );
  }, []);

  const clearFocus = useCallback(() => {
    if (decisionFocused) {
      setDecisionFocused(false);
      /* Restore focus to the control that opened the Decision Context when it
         still exists; otherwise fall back to the Decision Plate's first
         available control so focus never lands on <body>. */
      const trigger = decisionTriggerRef.current;
      if (trigger && document.contains(trigger)) {
        trigger.focus();
      } else {
        const plate = document.getElementById("wsv2-decision-plate");
        const fallback = plate?.querySelector<HTMLElement>(
          'button:not([aria-disabled="true"])',
        );
        fallback?.focus();
      }
      decisionTriggerRef.current = null;
      return;
    }
    if (focusedArtifact) {
      /* Clearing artifact focus returns focus to that artifact's own control in
         the Canvas (it persists across the collapse) rather than dropping to
         <body>. */
      const ref = focusedArtifact;
      setFocusedArtifact(null);
      const body = bodyRef.current;
      const node = body?.querySelector<HTMLElement>(
        `[data-artifact="${ref.kind}:${ref.id}"] button`,
      );
      node?.focus({ preventScroll: true });
    }
  }, [decisionFocused, focusedArtifact]);

  /* ---- Related-artifact navigation (from the Inspector) ----
     One owner drives every plane: set the target ArtifactRef, move the Spine to
     the target's stage, scroll the canvas to the artifact, then move DOM focus
     to it. The Inspector re-derives causally from `focusedArtifact`; there is no
     competing selection state inside it. Focus stays on exactly one artifact. */
  const activateArtifact = useCallback((ref: ArtifactRef) => {
    /* Drive every plane from the single owner: supersede any Decision Context,
       set the target as the one focused artifact, and move the Spine to its
       stage. The scroll + DOM-focus move is handled by a deterministic
       post-render effect (below), never by an arbitrary delay, so it is safe
       even if the target has not painted yet. */
    setDecisionFocused(false);
    setFocusedArtifact(ref);
    setActiveStage(stageForArtifactKind(ref.kind));
    suppressReconcileUntil.current = Date.now() + 800;
    focusTokenRef.current += 1;
    setFocusRequest({ ref, token: focusTokenRef.current });
  }, []);

  /* ---- Decision Context focus (from the plate) ---- */
  const openDecisionContext = useCallback((trigger: HTMLElement) => {
    decisionTriggerRef.current = trigger;
    setFocusedArtifact(null);
    setDecisionFocused(true);
  }, []);

  /* ---- Persistence commands (R1B.5) ----
     Both commands follow the same disciplined sequence: validate the command
     still targets the selected case, mark that exact action pending, run the
     narrow (already read-after-write-verified) persistence command, and only on
     a verified persist ask the bootstrap to reproject through the read-only
     adapter. Nothing on screen is optimistically edited — queue groups, review
     status, condition status and counts change only via that reprojection. If
     the reprojection itself fails after a verified write, the interface stays
     truthful: the change was saved but the workspace could not refresh. */

  /* After a reprojection replaces the control's subtree, focus can land on
     <body>. Restore it to the initiating control when that happened; otherwise
     leave focus exactly where the browser kept it (ordinary success). */
  const restoreMutationFocus = useCallback((controlId: string) => {
    window.requestAnimationFrame(() => {
      if (document.activeElement && document.activeElement !== document.body) return;
      const control = document.querySelector<HTMLElement>(
        `[data-mutation-control="${controlId}"]`,
      );
      control?.focus();
    });
  }, []);

  const applyReviewStatus = useCallback(
    async (nextStatus: ReviewStatus) => {
      if (!persistence || !reload) return;
      /* One write at a time: ignore activation while any command is pending. */
      if (pendingMutation) return;
      const capability = caseById.get(selectedCaseId)?.reviewStateMutation;
      if (!capability || capability.kind !== "available") return;
      /* Reject a stale command whose target is no longer the selected case. */
      if (capability.caseId !== selectedCaseId) return;

      setPendingMutation(`review:${capability.caseId}`);
      setReviewResult(null);
      const result = persistence.applyReviewStatus({
        kind: "review-status",
        caseId: capability.caseId,
        status: nextStatus,
      });

      if (result.outcome === "persisted") {
        const outcome = await reload();
        if (outcome.ok) {
          setReviewResult(result);
          announce(result.message);
        } else {
          const message =
            "Review status was saved, but the workspace could not be refreshed. The status is " +
            "stored; reopen the workspace to see it applied.";
          setReviewResult({ outcome: "persisted", message });
          announce(message);
        }
      } else {
        /* unchanged / unavailable / failed / verification-mismatch: the previous
           authoritative state is retained and the requested value is NOT shown as
           saved. */
        setReviewResult(result);
        announce(result.message);
      }

      setPendingMutation(null);
      restoreMutationFocus("review");
    },
    [persistence, reload, pendingMutation, caseById, selectedCaseId, announce, restoreMutationFocus],
  );

  const toggleCondition = useCallback(
    async (capability: AvailableCondition, intent: "clear" | "reopen") => {
      if (!persistence || !reload) return;
      if (pendingMutation) return;
      /* Reject a stale command whose target is no longer the selected case. */
      if (capability.caseId !== selectedCaseId) return;

      const controlId = `condition:${capability.conditionKey}`;
      setPendingMutation(`condition:${capability.caseId}:${capability.conditionKey}`);
      setConditionResult(null);
      const result = persistence.applyConditionProgress({
        kind: "condition-progress",
        caseId: capability.caseId,
        conditionKey: capability.conditionKey,
        intent,
      });

      if (result.outcome === "persisted") {
        const outcome = await reload();
        if (outcome.ok) {
          setConditionResult({ conditionKey: capability.conditionKey, result });
          announce(result.message);
        } else {
          const message =
            "Condition progress was saved, but the workspace could not be refreshed. The change is " +
            "stored; reopen the workspace to see it applied.";
          setConditionResult({
            conditionKey: capability.conditionKey,
            result: { outcome: "persisted", message },
          });
          announce(message);
        }
      } else {
        setConditionResult({ conditionKey: capability.conditionKey, result });
        announce(result.message);
      }

      setPendingMutation(null);
      restoreMutationFocus(controlId);
    },
    [persistence, reload, pendingMutation, selectedCaseId, announce, restoreMutationFocus],
  );

  /* ---- Spine navigation: scroll the canvas body / mark the plate ---- */
  const goToStage = useCallback((stage: StageId) => {
    const definition = WORKSPACE_V2_STAGES.find((item) => item.id === stage);
    const body = bodyRef.current;
    if (!definition || !body) return;

    setActiveStage(stage);
    suppressReconcileUntil.current = Date.now() + 800;
    const behavior = scrollBehavior();

    if (definition.terminal) {
      body.scrollTo({ top: body.scrollHeight, behavior });
      return;
    }
    const target = body.querySelector<HTMLElement>(`#${definition.domId}`);
    if (!target) return;
    body.scrollTo({ top: Math.max(0, target.offsetTop - 12), behavior });
  }, []);

  /* ---- Active-stage reconciliation from canvas scroll position ---- */
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    let frame = 0;
    const reconcile = () => {
      frame = 0;
      if (Date.now() < suppressReconcileUntil.current) return;

      const scrollTop = body.scrollTop;
      if (scrollTop + body.clientHeight >= body.scrollHeight - 4) {
        setActiveStage("decision");
        return;
      }

      let current: StageId = WORKSPACE_V2_STAGES[0].id;
      for (const definition of WORKSPACE_V2_STAGES) {
        if (definition.terminal) continue;
        const node = body.querySelector<HTMLElement>(`#${definition.domId}`);
        if (!node) continue;
        if (node.offsetTop - 72 <= scrollTop) current = definition.id;
      }
      setActiveStage(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(reconcile);
    };

    body.addEventListener("scroll", onScroll, { passive: true });
    reconcile();
    return () => {
      body.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [selectedCaseId]);

  /* ---- Related-artifact navigation: deterministic post-render focus ----
     Runs after the commit that set `focusedArtifact`, so the target record is
     mounted. It scrolls the target into view (reduced-motion-safe) and moves
     DOM focus onto the target's control. A target that cannot be resolved in
     the current case (e.g. the case changed first) leaves the current focus
     untouched and is announced rather than throwing. */
  useEffect(() => {
    if (!focusRequest) return;
    const body = bodyRef.current;
    if (!body) return;
    const { ref } = focusRequest;
    const target = body.querySelector<HTMLElement>(
      `[data-artifact="${ref.kind}:${ref.id}"]`,
    );
    if (!target) {
      announce("The related artifact is not present in this case.");
      return;
    }
    target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    const control = target.querySelector<HTMLElement>("button, a[href], [tabindex]") ?? target;
    control.focus({ preventScroll: true });
  }, [focusRequest, announce]);

  /* ---- One document-level Escape listener with a single precedence order ----
       1. close an open responsive overlay / modal-like panel (none exist in the
          restrained responsive strategy, so this step is a documented no-op);
       2. close Decision Context;
       3. clear the focused artifact;
       4. otherwise do nothing.
     Escape never mutates stored state, never changes the selected case, never
     activates a pending action and never sends focus to <body>. It only acts —
     and only then calls preventDefault/stopPropagation — when there is
     something to close. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!decisionFocused && !focusedArtifact) return;
      event.preventDefault();
      event.stopPropagation();
      clearFocus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedArtifact, decisionFocused, clearFocus]);

  /* ---- Post-reprojection focus reconciliation ----
     After an authoritative reprojection the selected case may have moved group
     but is still selected. A focused artifact whose identity survived stays
     focused; one whose target disappeared is cleared truthfully so the Inspector
     never describes an artifact that no longer exists. Selection itself is never
     cleared here — a moved case remains selected. */
  useEffect(() => {
    if (focusedArtifact && !resolveArtifactRef(activeCase, focusedArtifact)) {
      setFocusedArtifact(null);
    }
  }, [activeCase, focusedArtifact]);

  /* The interactive mutation bundle handed to the Inspector. Present only in real
     mode; in fixture mode it is null and the Inspector renders read-only copy
     from the (sample) capabilities alone. */
  const mutations: InspectorMutations | null = useMemo(() => {
    if (!interactive) return null;
    return {
      review: {
        pending: pendingMutation === `review:${activeCase.caseId}`,
        busy: pendingMutation !== null,
        result: reviewResult,
        onApply: applyReviewStatus,
      },
      condition: {
        pendingConditionKey:
          pendingMutation && pendingMutation.startsWith(`condition:${activeCase.caseId}:`)
            ? pendingMutation.slice(`condition:${activeCase.caseId}:`.length)
            : null,
        busy: pendingMutation !== null,
        result: conditionResult,
        onToggle: toggleCondition,
      },
    };
  }, [
    interactive,
    pendingMutation,
    activeCase.caseId,
    reviewResult,
    conditionResult,
    applyReviewStatus,
    toggleCondition,
  ]);

  /* ---- Render ---- */
  return (
    <div className={styles.root}>
      <a className={styles.skipLink} href="#wsv2-canvas-body">
        Skip to verification canvas
      </a>

      <WorkspaceQueue
        groups={snapshot.groups}
        selectedCaseId={activeCase.caseId}
        onSelectCase={selectCase}
        limitations={snapshot.limitations}
      />

      <EvidenceSpine detail={activeCase} activeStage={activeStage} onGoToStage={goToStage} />

      <VerificationCanvas
        detail={activeCase}
        caseTitle={activeTitle}
        provenanceLabel={snapshot.provenance.label}
        focus={focusedArtifact}
        onToggleFocus={toggleFocus}
        bodyRef={bodyRef}
        decision={activeCase.decision}
        plateCurrent={plateCurrent}
        onViewDecisionContext={openDecisionContext}
      />

      <WorkspaceInspector
        projection={inspectorProjection}
        canClear={decisionFocused || focusedArtifact !== null}
        onClear={clearFocus}
        onActivate={activateArtifact}
        reviewStateMutation={activeCase.reviewStateMutation}
        mutations={mutations}
      />

      {/* Restrained polite live region for navigation the eye may miss (case
          selected, unresolved relation target). Assistive-tech only. */}
      <div className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
        {politeMessage.text}
      </div>

      {/* Below the practical workstation minimum, a truthful notice replaces the
          dense four-plane grid rather than presenting a clipped interface. */}
      <WorkstationMinWidthNotice />
    </div>
  );
}
