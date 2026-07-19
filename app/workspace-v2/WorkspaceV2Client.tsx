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
import { resolveInspector } from "../../lib/workspace-v2/projections";
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

function ReadyWorkspace({ snapshot }: { snapshot: WorkspaceReadySnapshot }) {
  /* ---- Held UI values (single route-level owner) ---- */
  const [selectedCaseId, setSelectedCaseId] = useState<string>(snapshot.defaultCaseId);
  const [focusedArtifact, setFocusedArtifact] = useState<ArtifactRef | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("change");
  const [decisionFocused, setDecisionFocused] = useState(false);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const suppressReconcileUntil = useRef(0);
  /* The control that opened the Decision Context inspector, so focus can be
     restored to it when the context is cleared. */
  const decisionTriggerRef = useRef<HTMLElement | null>(null);

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
  const selectCase = useCallback((caseId: string) => {
    setSelectedCaseId(caseId);
    /* Changing case clears stale artifact focus and Decision Context focus,
       and resets the Spine to the first stage. */
    setFocusedArtifact(null);
    setDecisionFocused(false);
    setActiveStage("change");
    const body = bodyRef.current;
    if (body) {
      suppressReconcileUntil.current = Date.now() + 400;
      body.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

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
      const trigger = decisionTriggerRef.current;
      if (trigger && document.contains(trigger)) trigger.focus();
      return;
    }
    setFocusedArtifact(null);
  }, [decisionFocused]);

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

    if (definition.terminal) {
      body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
      return;
    }
    const target = body.querySelector<HTMLElement>(`#${definition.domId}`);
    if (!target) return;
    body.scrollTo({ top: Math.max(0, target.offsetTop - 12), behavior: "smooth" });
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

  /* ---- Escape clears Decision Context first, then artifact focus ---- */
  useEffect(() => {
    if (!focusedArtifact && !decisionFocused) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
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
      />
    </div>
  );
}
