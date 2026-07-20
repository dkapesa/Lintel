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

   Fixture-fed only. No global state, no context, no persistence, no
   localStorage / sessionStorage, no API calls, no ledger reads or writes, and
   no import from app/visual-lab/workspace-v2/**. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./workspace-v2.module.css";
import { WorkspaceQueue } from "./components/WorkspaceQueue";
import { EvidenceSpine } from "./components/EvidenceSpine";
import { VerificationCanvas } from "./components/VerificationCanvas";
import { WorkspaceInspector } from "./components/WorkspaceInspector";
import { WorkspaceShellState } from "./components/WorkspaceShellState";
import { WorkstationMinWidthNotice } from "./components/atoms";
import { resolveInspector, stageForArtifactKind } from "../../lib/workspace-v2/projections";
import {
  WORKSPACE_V2_STAGES,
  type ArtifactKind,
  type ArtifactRef,
  type CaseDetail,
  type StageId,
  type WorkspaceReadySnapshot,
  type WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";

export default function WorkspaceV2Client({ snapshot }: { snapshot: WorkspaceSnapshot }) {
  if (snapshot.status !== "ready") {
    return <WorkspaceShellState snapshot={snapshot} />;
  }
  return <ReadyWorkspace snapshot={snapshot} />;
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

function ReadyWorkspace({ snapshot }: { snapshot: WorkspaceReadySnapshot }) {
  /* ---- Held UI values (single route-level owner) ---- */
  const [selectedCaseId, setSelectedCaseId] = useState<string>(snapshot.defaultCaseId);
  const [focusedArtifact, setFocusedArtifact] = useState<ArtifactRef | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("change");
  const [decisionFocused, setDecisionFocused] = useState(false);
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
