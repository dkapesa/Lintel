"use client";

/* R0B.2B — Workspace V2 visual lab client boundary.

   This is the single route-level UI-state owner for the lab. It owns:

     selectedCaseId          which queue case is open
     focusedArtifact         which finding / evidence / requirement is focal
     activeStage             which Evidence Spine stage is current
     decisionFocused         whether the Decision Context inspector is focal
     decisions               per-case recorded-decision records (sample)
     scenarioSelection       which named sample state is loaded per case
     activeDialog            which decision flow dialog is open
     polite/assertiveMessage screen-reader announcements

   Everything on screen is a pure projection of these values plus the static
   fixtures and the fixture-backed decision model. The recorded Human Decision
   system is entirely lab-local: sample data and React state only. There is no
   global state, no provider, no context, no persistence, no localStorage, and
   no import of any production ledger mutation function (R0B.2B boundary). */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./workspace-v2.module.css";
import {
  WORKSPACE_V2_CASES,
  WORKSPACE_V2_DEFAULT_CASE_ID,
  WORKSPACE_V2_QUEUE_GROUPS,
  WORKSPACE_V2_STAGES,
  casesForGroup,
  confirmedEvidenceCount,
  evidenceComposition,
  evidenceRank,
  findCase,
  isStrongEvidence,
  openBlockingCount,
  staleEvidenceCount,
  stageCount,
  stageState,
  type CaseFixture,
  type EvidenceView,
  type FindingView,
  type FocusedArtifact,
  type Recommendation,
  type RequirementView,
  type StageId,
} from "./fixtures";
import {
  OUTCOME_LABEL,
  classifySubmission,
  createDecisionEvent,
  decisionFooterNote,
  decisionStageLabel,
  decisionStageState,
  outcomeTone,
  projectDecision,
  type DecisionActor,
  type DecisionEventType,
  type DecisionRecord,
  type DecisionReference,
} from "./decision-model";
import {
  DECISION_SCENARIOS,
  sampleFullHistory,
  scenarioById,
  seedScenarioFor,
  type DecisionScenarioId,
  type ScenarioContext,
} from "./decision-fixtures";
import { DecisionLiveRegion, toneClassName } from "./decision-atoms";
import { DecisionPlate, type DecisionPlateActions } from "./decision-plate";
import { DecisionContextInspector, DecisionHistorySurface } from "./decision-inspector";
import {
  DecisionCreationDialog,
  DecisionReaffirmDialog,
  DecisionWithdrawDialog,
  DecisionRevokeRiskDialog,
  type DecisionDraft,
} from "./decision-dialogs";

/* The accountable engineer acting in the lab. Sample identity only — never a
   real, fabricated organisational identity (§17.2, §24.18). */
const LOCAL_ACTOR: DecisionActor = {
  displayLabel: "You (sample reviewer)",
  source: "local",
  role: "Accountable engineer",
};

/* A fixed sample prior head, distinct from any case head, used when a loaded
   sample state predates the current head. */
const SAMPLE_PRIOR_HEAD = "7b3e0c9";

function scenarioContextFor(fixture: CaseFixture): ScenarioContext {
  return {
    recommendation: fixture.recommendation,
    headSha: fixture.headSha,
    priorHeadSha: SAMPLE_PRIOR_HEAD,
    openBlockingRequirements: openBlockingCount(fixture),
  };
}

function seedDecisions(): Record<string, DecisionRecord> {
  const seed: Record<string, DecisionRecord> = {};
  for (const fixture of WORKSPACE_V2_CASES) {
    const scenario = seedScenarioFor(fixture.caseId);
    seed[fixture.caseId] = scenarioById(scenario).build(scenarioContextFor(fixture));
  }
  return seed;
}

/* Blocking, open requirements projected as clause references the decision can
   carry or accept as risk. */
function caseClauseReferences(fixture: CaseFixture): DecisionReference[] {
  return fixture.requirements
    .filter((requirement) => requirement.importance === "blocking" && requirement.status === "open")
    .map((requirement) => ({
      id: requirement.requirementId,
      kind: "clause" as const,
      label: requirement.title,
      available: true,
    }));
}

/* Clearly-sample display timestamp generated after a successful local event.
   Not part of any identity (§11). */
function sampleNowLabel(): string {
  return "Recorded just now · sample";
}

type ActiveDialog =
  | null
  | { kind: "create" | "change" | "supersede" }
  | { kind: "reaffirm" }
  | { kind: "withdraw" }
  | { kind: "revoke" }
  | { kind: "history" };

/* --- Static label maps ------------------------------------------------ */

const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  APPROVE: "Approve",
  REVIEW_REQUIRED: "Review required",
  TESTS_REQUIRED: "Tests required",
  BLOCK: "Block",
};

function recommendationTone(value: Recommendation) {
  if (value === "APPROVE") return styles.toneSuccess;
  if (value === "BLOCK") return styles.toneDanger;
  if (value === "TESTS_REQUIRED") return styles.toneWarning;
  return styles.toneInformation;
}

function riskTone(value: string) {
  if (value === "LOW") return styles.toneSuccess;
  if (value === "MEDIUM") return styles.toneWarning;
  return styles.toneDanger;
}

/* Severity drives weight, not just colour. */
function severityRank(value: string) {
  if (value === "CRITICAL") return styles.sevCritical;
  if (value === "HIGH") return styles.sevHigh;
  if (value === "MEDIUM") return styles.sevMedium;
  return styles.sevLow;
}

function severityTone(value: string) {
  if (value === "LOW") return styles.toneMuted;
  if (value === "MEDIUM") return styles.toneWarning;
  return styles.toneDanger;
}

function evidenceStatusTone(value: string) {
  if (value === "confirmed" || value === "present") return styles.toneSuccess;
  if (value === "missing") return styles.toneDanger;
  if (value === "stale" || value === "unverified") return styles.toneWarning;
  return styles.toneMuted;
}

function requirementStatusTone(value: string) {
  if (value === "satisfied") return styles.toneSuccess;
  if (value === "accepted") return styles.toneInformation;
  if (value === "stale") return styles.toneWarning;
  if (value === "invalidated") return styles.toneDanger;
  return styles.toneMuted;
}

/* Four-step strength meter reading the production evidence ladder. */
function StrengthMeter({ rank }: { rank: number }) {
  return (
    <span className={styles.meter} aria-hidden="true">
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={`${styles.meterTick} ${step <= rank ? styles.meterTickOn : ""}`}
        />
      ))}
    </span>
  );
}

/* The shared cue that ties a focused canvas object to the inspector. */
function ArtifactMarker({
  kind,
  id,
  accent,
}: {
  kind: string;
  id: string;
  accent?: string;
}) {
  return (
    <span className={styles.marker}>
      <span className={`${styles.markerBar} ${accent ?? styles.toneMuted}`} />
      <span className={styles.markerKind}>{kind}</span>
      <span className={styles.markerId}>{id}</span>
    </span>
  );
}

/* --- Component -------------------------------------------------------- */

export default function WorkspaceV2Client() {
  /* ---- Held UI values (single route-level owner) ---- */
  const [selectedCaseId, setSelectedCaseId] = useState<string>(WORKSPACE_V2_DEFAULT_CASE_ID);
  const [focusedArtifact, setFocusedArtifact] = useState<FocusedArtifact>(null);
  const [activeStage, setActiveStage] = useState<StageId>("change");
  const [decisionFocused, setDecisionFocused] = useState(false);

  /* ---- Local, fixture-backed decision state ----
     A per-case record plus which named sample state is loaded (or "custom"
     once a local interaction has edited it). This is the only decision state;
     it is React-local, never persisted, and never read from a production
     ledger or localStorage. */
  const [decisions, setDecisions] = useState<Record<string, DecisionRecord>>(seedDecisions);
  const [scenarioSelection, setScenarioSelection] = useState<
    Record<string, DecisionScenarioId | "custom">
  >(() => {
    const seed: Record<string, DecisionScenarioId | "custom"> = {};
    for (const fixture of WORKSPACE_V2_CASES) seed[fixture.caseId] = seedScenarioFor(fixture.caseId);
    return seed;
  });
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const suppressReconcileUntil = useRef(0);
  /* The control that opened a dialog or the decision-context inspector, so
     focus can be restored to it (§19). */
  const decisionTriggerRef = useRef<HTMLElement | null>(null);

  /* ---- Pure projections ---- */
  const activeCase: CaseFixture = useMemo(() => findCase(selectedCaseId), [selectedCaseId]);

  const focusedFinding = useMemo(
    () =>
      focusedArtifact?.kind === "finding"
        ? activeCase.findings.find((item) => item.findingId === focusedArtifact.id) ?? null
        : null,
    [focusedArtifact, activeCase],
  );

  const focusedEvidence = useMemo(
    () =>
      focusedArtifact?.kind === "evidence"
        ? activeCase.evidence.find((item) => item.evidenceId === focusedArtifact.id) ?? null
        : null,
    [focusedArtifact, activeCase],
  );

  const focusedRequirement = useMemo(
    () =>
      focusedArtifact?.kind === "requirement"
        ? activeCase.requirements.find((item) => item.requirementId === focusedArtifact.id) ?? null
        : null,
    [focusedArtifact, activeCase],
  );

  const composition = useMemo(() => evidenceComposition(activeCase), [activeCase]);

  /* ---- Decision projections ---- */
  const activeRecord = useMemo<DecisionRecord>(
    () => decisions[selectedCaseId] ?? scenarioById("no-decision").build(scenarioContextFor(activeCase)),
    [decisions, selectedCaseId, activeCase],
  );
  const activeView = useMemo(() => projectDecision(activeRecord), [activeRecord]);
  const activeSelection = scenarioSelection[selectedCaseId] ?? "custom";

  /* ---- Announcements (§19) ---- */
  const announcePolite = useCallback((message: string) => {
    setPoliteMessage("");
    /* Reassert so repeated identical messages still announce. */
    window.requestAnimationFrame(() => setPoliteMessage(message));
    setAssertiveMessage("");
  }, []);
  const announceAssertive = useCallback((message: string) => {
    setAssertiveMessage("");
    window.requestAnimationFrame(() => setAssertiveMessage(message));
  }, []);

  /* ---- Decision context inspector focus ---- */
  const openDecisionContext = useCallback((trigger: HTMLElement) => {
    decisionTriggerRef.current = trigger;
    setFocusedArtifact(null);
    setDecisionFocused(true);
  }, []);
  const closeDecisionContext = useCallback(() => {
    setDecisionFocused(false);
    const trigger = decisionTriggerRef.current;
    if (trigger && document.contains(trigger)) trigger.focus();
  }, []);

  /* ---- Dialog open/close ---- */
  const openDialog = useCallback((dialog: ActiveDialog, trigger: HTMLElement) => {
    decisionTriggerRef.current = trigger;
    setActiveDialog(dialog);
  }, []);
  const closeDialog = useCallback(() => setActiveDialog(null), []);

  /* ---- Scenario loading (lab affordance) ---- */
  const loadScenario = useCallback(
    (scenarioId: DecisionScenarioId) => {
      const record = scenarioById(scenarioId).build(scenarioContextFor(activeCase));
      setDecisions((current) => ({ ...current, [selectedCaseId]: record }));
      setScenarioSelection((current) => ({ ...current, [selectedCaseId]: scenarioId }));
      setActiveDialog(null);
      setDecisionFocused(false);
      announcePolite(`Loaded sample state: ${scenarioById(scenarioId).label}.`);
    },
    [activeCase, selectedCaseId, announcePolite],
  );

  const markCustom = useCallback(() => {
    setScenarioSelection((current) => ({ ...current, [selectedCaseId]: "custom" }));
  }, [selectedCaseId]);

  /* ---- Local mutators (route-local state only) ---- */
  const commitRecord = useCallback(
    (caseId: string, updater: (record: DecisionRecord) => DecisionRecord) => {
      setDecisions((current) => {
        const record = current[caseId];
        if (!record) return current;
        return { ...current, [caseId]: updater(record) };
      });
    },
    [],
  );

  const applyDraft = useCallback(
    (draft: DecisionDraft) => {
      const record = decisions[selectedCaseId];
      if (!record) return;
      const effective = record.effective;
      const identityInput = {
        outcome: draft.outcome,
        headSha: record.currentHeadSha,
        predecessorId: effective?.eventId,
        rationale: draft.rationale,
        referenceIds: draft.references.map((reference) => reference.id),
        acceptedRiskIds: draft.acceptedRiskReferences.map((reference) => reference.id),
        actorLabel: LOCAL_ACTOR.displayLabel,
      };
      const submission = classifySubmission(identityInput, effective, record.applicability);
      if (submission === "no-op") {
        announceAssertive("No change — identical to the recorded decision. Nothing was recorded.");
        setActiveDialog(null);
        return;
      }
      const eventType: DecisionEventType =
        draft.outcome === "approve-with-accepted-risk"
          ? "risk-accepted"
          : submission === "reaffirm"
            ? "decision-reaffirmed"
            : submission === "supersede"
              ? "decision-superseded"
              : "decision-recorded";
      const newEvent = createDecisionEvent({
        eventType,
        outcome: draft.outcome,
        actor: LOCAL_ACTOR,
        recordedAt: sampleNowLabel(),
        headSha: record.currentHeadSha,
        rationale: draft.rationale,
        references: draft.references,
        acceptedRiskReferences: draft.acceptedRiskReferences,
        supersedesEventId: submission === "supersede" ? effective?.eventId : undefined,
        reaffirmsEventId: submission === "reaffirm" ? effective?.eventId : undefined,
      });
      commitRecord(selectedCaseId, (current) => ({
        ...current,
        status: "recorded",
        readError: undefined,
        applicability: "applicable",
        effective: newEvent,
        priorHeadSha: undefined,
        history: [...current.history, newEvent],
      }));
      markCustom();
      setActiveDialog(null);
      announcePolite(
        submission === "supersede"
          ? "Decision superseded. The prior decision is retained in history."
          : submission === "reaffirm"
            ? "Decision reaffirmed against the current head."
            : "Decision recorded.",
      );
    },
    [decisions, selectedCaseId, commitRecord, markCustom, announcePolite, announceAssertive],
  );

  const applyReaffirm = useCallback(
    (rationale: string) => {
      const record = decisions[selectedCaseId];
      const effective = record?.effective;
      if (!record || !effective || !effective.outcome) return;
      const newEvent = createDecisionEvent({
        eventType: "decision-reaffirmed",
        outcome: effective.outcome,
        actor: LOCAL_ACTOR,
        recordedAt: sampleNowLabel(),
        headSha: record.currentHeadSha,
        rationale,
        references: effective.references,
        acceptedRiskReferences: effective.acceptedRiskReferences,
        reaffirmsEventId: effective.eventId,
      });
      commitRecord(selectedCaseId, (current) => ({
        ...current,
        applicability: "applicable",
        effective: newEvent,
        priorHeadSha: undefined,
        history: [...current.history, newEvent],
      }));
      markCustom();
      setActiveDialog(null);
      announcePolite(`Decision reaffirmed against ${record.currentHeadSha ?? "the current head"}.`);
    },
    [decisions, selectedCaseId, commitRecord, markCustom, announcePolite],
  );

  const applyWithdraw = useCallback(
    (reason: string) => {
      const record = decisions[selectedCaseId];
      const effective = record?.effective;
      if (!record || !effective) return;
      const newEvent = createDecisionEvent({
        eventType: "decision-withdrawn",
        actor: LOCAL_ACTOR,
        recordedAt: sampleNowLabel(),
        headSha: record.currentHeadSha,
        rationale: reason,
        withdrawsEventId: effective.eventId,
      });
      commitRecord(selectedCaseId, (current) => ({
        ...current,
        applicability: "withdrawn",
        effective: newEvent,
        history: [...current.history, newEvent],
      }));
      markCustom();
      setActiveDialog(null);
      announcePolite("Decision withdrawn. History is retained.");
    },
    [decisions, selectedCaseId, commitRecord, markCustom, announcePolite],
  );

  const applyRevoke = useCallback(
    (reason: string) => {
      const record = decisions[selectedCaseId];
      const effective = record?.effective;
      if (!record || !effective) return;
      const newEvent = createDecisionEvent({
        eventType: "risk-acceptance-revoked",
        actor: LOCAL_ACTOR,
        recordedAt: sampleNowLabel(),
        headSha: record.currentHeadSha,
        rationale: reason,
        acceptedRiskReferences: effective.acceptedRiskReferences,
        withdrawsEventId: effective.eventId,
      });
      commitRecord(selectedCaseId, (current) => ({
        ...current,
        effective: newEvent,
        history: [...current.history, newEvent],
      }));
      markCustom();
      setActiveDialog(null);
      announcePolite("Risk acceptance revoked. The accepted-risk event is retained in history.");
    },
    [decisions, selectedCaseId, commitRecord, markCustom, announcePolite],
  );

  const retryDecisionRead = useCallback(
    (trigger: HTMLElement) => {
      decisionTriggerRef.current = trigger;
      commitRecord(selectedCaseId, (current) => ({
        ...current,
        status: "empty",
        readError: undefined,
        applicability: "unavailable",
        effective: undefined,
      }));
      markCustom();
      announcePolite("Decision record read — no engineer decision recorded.");
    },
    [selectedCaseId, commitRecord, markCustom, announcePolite],
  );

  const openHistory = useCallback((trigger: HTMLElement) => {
    decisionTriggerRef.current = trigger;
    setActiveDialog({ kind: "history" });
  }, []);

  const plateActions = useMemo<DecisionPlateActions>(
    () => ({
      onRecord: (trigger) => openDialog({ kind: "create" }, trigger),
      onChange: (trigger) => openDialog({ kind: "change" }, trigger),
      onReaffirm: (trigger) => openDialog({ kind: "reaffirm" }, trigger),
      onSupersede: (trigger) => openDialog({ kind: "supersede" }, trigger),
      onWithdraw: (trigger) => openDialog({ kind: "withdraw" }, trigger),
      onRevokeRisk: (trigger) => openDialog({ kind: "revoke" }, trigger),
      onViewContext: (trigger) => openDecisionContext(trigger),
      onRetry: (trigger) => retryDecisionRead(trigger),
    }),
    [openDialog, openDecisionContext, retryDecisionRead],
  );

  /* Full sample history for the history surface — the loaded record's own
     history if it has depth, otherwise a richer sample lineage. */
  const historyForSurface = useMemo(
    () =>
      activeRecord.history.length > 5
        ? activeRecord.history
        : sampleFullHistory(scenarioContextFor(activeCase)),
    [activeRecord, activeCase],
  );

  /* ---- Case selection ---- */
  const selectCase = useCallback((caseId: string) => {
    setSelectedCaseId(caseId);
    setFocusedArtifact(null);
    setActiveStage("change");
    setDecisionFocused(false);
    setActiveDialog(null);
    const body = bodyRef.current;
    if (body) {
      suppressReconcileUntil.current = Date.now() + 400;
      body.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  /* ---- Spine navigation ----
     Canvas stages scroll the body. The terminal Human decision stage
     navigates to the Decision Plate, which sits outside the scroll region,
     so it scrolls the body to its end and marks the plate current. */
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

  /* ---- Active-stage reconciliation from canvas position ---- */
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

  /* ---- Escape clears artifact focus / decision context ----
     A dialog, when open, owns Escape (it stops propagation and restores its
     own focus), so this handler steps aside while a dialog is present. */
  useEffect(() => {
    if (!focusedArtifact && !decisionFocused) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activeDialog) return;
      event.stopPropagation();
      if (decisionFocused) {
        closeDecisionContext();
      } else {
        setFocusedArtifact(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedArtifact, decisionFocused, activeDialog, closeDecisionContext]);

  const toggleFocus = useCallback((kind: "finding" | "evidence" | "requirement", id: string) => {
    setFocusedArtifact((current) =>
      current && current.kind === kind && current.id === id ? null : { kind, id },
    );
  }, []);

  const isFocused = useCallback(
    (kind: string, id: string) =>
      focusedArtifact !== null && focusedArtifact.kind === kind && focusedArtifact.id === id,
    [focusedArtifact],
  );

  const plateCurrent = activeStage === "decision";

  /* ---- Render ---- */
  return (
    <div className={styles.root}>
      <a className={styles.skipLink} href="#wsv2-canvas-body">
        Skip to verification canvas
      </a>

      {/* Plane 1 — queue */}
      <aside className={styles.queue} aria-label="Case queue">
        <div className={styles.planeHeader}>
          <span className={styles.planeLabel}>Queue</span>
        </div>
        <div className={styles.queueList}>
          {WORKSPACE_V2_QUEUE_GROUPS.map((group) => {
            const cases = casesForGroup(group);
            if (cases.length === 0) return null;
            return (
              <section key={group.id} className={styles.queueGroup}>
                <div className={styles.queueGroupHeader}>
                  <span className={styles.queueGroupLabel}>{group.label}</span>
                  <span className={styles.queueGroupCount}>{cases.length}</span>
                </div>
                {cases.map((item) => {
                  const selected = item.caseId === selectedCaseId;
                  return (
                    <button
                      key={item.caseId}
                      type="button"
                      aria-current={selected ? "true" : undefined}
                      className={`${styles.queueRow} ${selected ? styles.queueRowSelected : ""}`}
                      onClick={() => selectCase(item.caseId)}
                    >
                      <span className={styles.queueRef}>#{item.pullRequestNumber}</span>
                      <span className={styles.queueTitle}>{item.title}</span>
                      <span className={styles.queueState}>
                        <span
                          className={`${styles.queueRec} ${recommendationTone(item.recommendation)}`}
                        >
                          {RECOMMENDATION_LABEL[item.recommendation]}
                        </span>
                        <span className={styles.queueRisk}>{item.riskLevel}</span>
                        <QueueDecisionMarker record={decisions[item.caseId]} />
                      </span>
                    </button>
                  );
                })}
              </section>
            );
          })}
        </div>
      </aside>

      {/* Plane 2 — Evidence Spine */}
      <nav className={styles.spine} aria-label="Evidence spine">
        <div className={styles.planeHeader}>
          <span className={styles.planeLabel}>Spine</span>
        </div>

        <ol className={styles.spineChain}>
          {WORKSPACE_V2_STAGES.map((definition, index) => {
            const current = definition.id === activeStage;
            const state = definition.terminal
              ? decisionStageState(activeView)
              : stageState(activeCase, definition.id);
            const count = stageCount(activeCase, definition.id);
            const last = index === WORKSPACE_V2_STAGES.length - 1;
            return (
              <li
                key={definition.id}
                className={`${styles.spineItem} ${last ? styles.spineItemLast : ""}`}
              >
                <button
                  type="button"
                  aria-current={current ? "step" : undefined}
                  className={`${styles.spineNode} ${current ? styles.spineNodeCurrent : ""}`}
                  onClick={() => goToStage(definition.id)}
                >
                  <span
                    className={`${styles.spineMark} ${
                      state === "attention"
                        ? styles.spineMarkAttention
                        : state === "complete"
                          ? styles.spineMarkComplete
                          : styles.spineMarkPending
                    }`}
                  >
                    <span className={styles.spineMarkCore} />
                  </span>
                  <span className={styles.spineText}>
                    <span className={styles.spineLabel}>{definition.label}</span>
                    <span className={styles.spineCount}>
                      {definition.terminal ? decisionStageLabel(activeView) : count}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Truthful, fixture-derived state of this case only. */}
        <div className={styles.spineFoot}>
          <SpineFact
            value={openBlockingCount(activeCase)}
            label="blocking open"
            attention={openBlockingCount(activeCase) > 0}
          />
          <SpineFact value={confirmedEvidenceCount(activeCase)} label="confirmed" />
          <SpineFact
            value={staleEvidenceCount(activeCase)}
            label="stale"
            attention={staleEvidenceCount(activeCase) > 0}
          />
          <span className={`${styles.spineFootNote} ${toneClassName(decisionFooterNote(activeView).tone)}`}>
            {decisionFooterNote(activeView).text}
          </span>

          {/* Lab affordance — project any of the twelve sample decision states
              onto the current case for visual and accessibility review. */}
          <div className={styles.scenarioSelect}>
            <label className={styles.scenarioSelectLabel} htmlFor="wsv2-scenario">
              Sample decision state
            </label>
            <select
              id="wsv2-scenario"
              className={styles.scenarioSelectInput}
              value={activeSelection}
              onChange={(event) => {
                const value = event.target.value;
                if (value !== "custom") loadScenario(value as DecisionScenarioId);
              }}
            >
              {activeSelection === "custom" ? (
                <option value="custom">Edited locally (custom)</option>
              ) : null}
              {DECISION_SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.index}. {scenario.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      {/* Plane 3 — canvas */}
      <section className={styles.canvas} aria-label="Verification canvas">
        {/* Row 1 — case header, stable two-column composition */}
        <header className={styles.caseHeader}>
          <div className={styles.caseIdentity}>
            <span className={styles.labBadge}>Visual lab · Workspace V2</span>
            <h1 className={styles.caseTitle}>{activeCase.title}</h1>
            {/* Each value is its own element separated by gap alone. Any
                inline separator — attached to either the preceding or the
                following value — can land on a line boundary, so no glyph
                separator is emitted at all. Mono is retained for the
                provenance-bearing values; the author is sans. */}
            <div className={styles.caseMeta}>
              <span className={styles.caseMetaItem}>{activeCase.repository}</span>
              <span className={styles.caseMetaItem}>#{activeCase.pullRequestNumber}</span>
              <span className={styles.caseMetaItem}>{activeCase.branch}</span>
              <span className={styles.caseMetaItem}>{activeCase.headSha}</span>
              <span className={`${styles.caseMetaItem} ${styles.metaAuthor}`}>
                {activeCase.author}
              </span>
            </div>
          </div>

          <div className={styles.caseVerdict}>
            <span className={`${styles.verdictMark} ${recommendationTone(activeCase.recommendation)}`}>
              {RECOMMENDATION_LABEL[activeCase.recommendation]}
            </span>
            <span className={styles.verdictFacts}>
              <span className={riskTone(activeCase.riskLevel)}>{activeCase.riskLevel}</span>
              <span className={styles.metaDot}>·</span>
              <span>score {activeCase.riskScore}</span>
              <span className={styles.metaDot}>·</span>
              <span>confidence {activeCase.confidence}</span>
            </span>
          </div>
        </header>

        {/* Row 2 — canvas body, the only canvas scroll region */}
        <div className={styles.canvasBody} id="wsv2-canvas-body" ref={bodyRef} tabIndex={-1}>
          <div
            className={`${styles.canvasInner} ${focusedArtifact ? styles.canvasInnerFocusing : ""}`}
          >
            {/* Stage 1 — Change */}
            <section className={styles.stage} id="wsv2-stage-change">
              <StageHeading index="1" title="Change" meta={`${activeCase.changedFiles.length} files`} />
              <div className={styles.fileList}>
                {activeCase.changedFiles.map((file) => (
                  <div key={file.path} className={styles.fileRow}>
                    <span className={styles.filePath}>{file.path}</span>
                    <span className={styles.fileStats}>
                      <span className={styles.additions}>+{file.additions}</span>
                      <span className={styles.deletions}>−{file.deletions}</span>
                      <span className={`${styles.fileRisk} ${riskTone(file.risk)}`}>
                        {file.risk}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Stage 2 — Observation */}
            <section className={styles.stage} id="wsv2-stage-observation">
              <StageHeading
                index="2"
                title="Observation"
                meta={`${activeCase.findings.length} recorded`}
              />
              {activeCase.findings.length === 0 ? (
                <p className={styles.emptyState}>No observations recorded on this head.</p>
              ) : (
                <div className={styles.recordList}>
                  {activeCase.findings.map((finding) => (
                    <FindingRecord
                      key={finding.findingId}
                      finding={finding}
                      focused={isFocused("finding", finding.findingId)}
                      onFocus={() => toggleFocus("finding", finding.findingId)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Stage 3 — Evidence */}
            <section className={styles.stage} id="wsv2-stage-evidence">
              <StageHeading
                index="3"
                title="Evidence"
                meta={`${activeCase.evidence.length} records · ${composition.strong} strong`}
              />
              <div className={styles.recordList}>
                {activeCase.evidence.map((record) => (
                  <EvidenceRecord
                    key={record.evidenceId}
                    record={record}
                    focused={isFocused("evidence", record.evidenceId)}
                    onFocus={() => toggleFocus("evidence", record.evidenceId)}
                  />
                ))}
              </div>
            </section>

            {/* Stage 4 — Requirement */}
            <section className={styles.stage} id="wsv2-stage-requirement">
              <StageHeading
                index="4"
                title="Requirement"
                meta={`${openBlockingCount(activeCase)} blocking open · ${
                  activeCase.requirements.length
                } total`}
              />
              <div className={styles.recordList}>
                {activeCase.requirements.map((requirement) => (
                  <RequirementRecord
                    key={requirement.requirementId}
                    requirement={requirement}
                    focused={isFocused("requirement", requirement.requirementId)}
                    onFocus={() => toggleFocus("requirement", requirement.requirementId)}
                  />
                ))}
              </div>

              {/* Movement is subordinate context, not a stage of the chain. */}
              <div className={styles.movement}>
                <span className={styles.movementLabel}>Movement since previous head</span>
                <span className={styles.movementFacts}>
                  <span>
                    score {activeCase.readiness.previousScore} → {activeCase.readiness.currentScore}
                  </span>
                  <span className={styles.metaDot}>·</span>
                  <span>{activeCase.readiness.clearedCount} cleared</span>
                  <span className={styles.metaDot}>·</span>
                  <span>{activeCase.readiness.openedCount} opened</span>
                  <span className={styles.metaDot}>·</span>
                  <span>{activeCase.readiness.becameStaleCount} became stale</span>
                </span>
                <p className={styles.movementNote}>{activeCase.readiness.note}</p>
              </div>
            </section>
          </div>
        </div>

        {/* Row 3 — terminal act: recorded Decision Plate */}
        <DecisionPlate view={activeView} current={plateCurrent} actions={plateActions} />
      </section>

      {/* Plane 4 — inspector */}
      <aside className={styles.inspector} aria-label="Inspector">
        <div className={styles.planeHeader}>
          <span className={styles.planeLabel}>
            {decisionFocused
              ? "Decision context"
              : focusedArtifact
                ? "Artifact detail"
                : "Case context"}
          </span>
          {decisionFocused || focusedArtifact ? (
            <button
              type="button"
              className={styles.inspectorClear}
              onClick={() => {
                if (decisionFocused) closeDecisionContext();
                else setFocusedArtifact(null);
              }}
            >
              Esc
            </button>
          ) : null}
        </div>

        <div className={styles.inspectorBody}>
          {decisionFocused ? (
            <DecisionContextInspector
              record={activeRecord}
              view={activeView}
              onViewHistory={openHistory}
              onWithdraw={(trigger) => openDialog({ kind: "withdraw" }, trigger)}
              onRevokeRisk={(trigger) => openDialog({ kind: "revoke" }, trigger)}
            />
          ) : focusedFinding ? (
            <FindingInspector finding={focusedFinding} />
          ) : focusedEvidence ? (
            <EvidenceInspector record={focusedEvidence} />
          ) : focusedRequirement ? (
            <RequirementInspector requirement={focusedRequirement} />
          ) : (
            <CaseContextInspector fixture={activeCase} composition={composition} />
          )}
        </div>
      </aside>

      {/* Polite announcements for decision changes; assertive for errors (§19). */}
      <DecisionLiveRegion politeMessage={politeMessage} assertiveMessage={assertiveMessage} />

      {/* Decision flow dialogs — route-local state only, no persistence. */}
      {activeDialog &&
      (activeDialog.kind === "create" ||
        activeDialog.kind === "change" ||
        activeDialog.kind === "supersede") ? (
        <DecisionCreationDialog
          mode={activeDialog.kind === "create" ? "record" : activeDialog.kind}
          headSha={activeRecord.currentHeadSha}
          headRecorded={Boolean(activeRecord.currentHeadSha)}
          recommendation={activeRecord.recommendation}
          openBlockingRequirements={activeRecord.openBlockingRequirements}
          carriedReferences={caseClauseReferences(activeCase)}
          candidateRiskReferences={caseClauseReferences(activeCase)}
          onSubmit={applyDraft}
          onCancel={closeDialog}
          returnFocusRef={decisionTriggerRef}
        />
      ) : null}

      {activeDialog?.kind === "reaffirm" && activeRecord.effective?.outcome ? (
        <DecisionReaffirmDialog
          outcome={activeRecord.effective.outcome}
          priorHeadSha={activeView.reaffirmation.priorHeadSha}
          currentHeadSha={activeView.reaffirmation.currentHeadSha}
          priorRationale={activeRecord.effective.rationale}
          survivingReferences={activeRecord.effective.references.filter(
            (reference) => reference.available && !reference.stale,
          )}
          staleReferences={activeRecord.effective.references.filter(
            (reference) => !reference.available || reference.stale,
          )}
          onSubmit={applyReaffirm}
          onCancel={closeDialog}
          returnFocusRef={decisionTriggerRef}
        />
      ) : null}

      {activeDialog?.kind === "withdraw" ? (
        <DecisionWithdrawDialog
          onSubmit={applyWithdraw}
          onCancel={closeDialog}
          returnFocusRef={decisionTriggerRef}
        />
      ) : null}

      {activeDialog?.kind === "revoke" ? (
        <DecisionRevokeRiskDialog
          onSubmit={applyRevoke}
          onCancel={closeDialog}
          returnFocusRef={decisionTriggerRef}
        />
      ) : null}

      {activeDialog?.kind === "history" ? (
        <DecisionHistorySurface
          history={historyForSurface}
          onClose={closeDialog}
          returnFocusRef={decisionTriggerRef}
        />
      ) : null}
    </div>
  );
}

/* Compact queue decision marker — one restrained glyph, shown only when a
   sample recorded decision exists (§15). Never renders for an absent or
   unavailable decision. */
function QueueDecisionMarker({ record }: { record?: DecisionRecord }) {
  if (!record) return null;
  const view = projectDecision(record);
  if (view.status !== "recorded" || !view.outcome) return null;
  const needsReaffirm = view.reaffirmation.required;
  return (
    <span
      className={`${styles.queueDecisionMark} ${needsReaffirm ? styles.queueDecisionStale : ""}`}
      title={`Sample decision: ${OUTCOME_LABEL[view.outcome]}${needsReaffirm ? " · needs reaffirmation" : ""}`}
      aria-label={`Sample decision recorded: ${OUTCOME_LABEL[view.outcome]}${
        needsReaffirm ? ", needs reaffirmation" : ""
      }`}
    >
      <span className={`${styles.queueDecisionDot} ${toneClassName(outcomeTone(view.outcome))}`} />
    </span>
  );
}

/* --- Canvas parts ----------------------------------------------------- */

function StageHeading({ index, title, meta }: { index: string; title: string; meta: string }) {
  return (
    <div className={styles.stageHeading}>
      <span className={styles.stageIndex}>{index}</span>
      <h2 className={styles.stageTitle}>{title}</h2>
      <span className={styles.stageMeta}>{meta}</span>
    </div>
  );
}

function SpineFact({
  value,
  label,
  attention,
}: {
  value: number;
  label: string;
  attention?: boolean;
}) {
  return (
    <span className={styles.spineFact}>
      <span className={`${styles.spineFactValue} ${attention ? styles.toneWarning : ""}`}>
        {value}
      </span>
      <span className={styles.spineFactLabel}>{label}</span>
    </span>
  );
}

function FindingRecord({
  finding,
  focused,
  onFocus,
}: {
  finding: FindingView;
  focused: boolean;
  onFocus: () => void;
}) {
  return (
    <article
      className={`${styles.record} ${styles.focusable} ${styles.recordFinding} ${severityRank(
        finding.severity,
      )} ${focused ? styles.recordFocused : ""}`}
    >
      <button type="button" className={styles.recordButton} onClick={onFocus} aria-pressed={focused}>
        <span className={styles.recordTop}>
          <span className={styles.recordTitle}>{finding.title}</span>
          <span className={`${styles.recordSeverity} ${severityTone(finding.severity)}`}>
            {finding.severity}
          </span>
        </span>
        <span className={styles.recordStatement}>{finding.statement}</span>
        {!focused ? (
          <span className={styles.recordFoot}>
            <span className={styles.technical}>{finding.file}</span>
            <span className={styles.metaDot}>·</span>
            <span>{finding.category}</span>
            {finding.provenance === "Model assisted" ? (
              <>
                <span className={styles.metaDot}>·</span>
                <span className={styles.toneProvenance}>model assisted</span>
              </>
            ) : null}
          </span>
        ) : null}
      </button>

      {focused ? (
        <div className={styles.recordExpansion}>
          <ArtifactMarker
            kind="Finding"
            id={finding.findingId}
            accent={severityTone(finding.severity)}
          />
          <p className={styles.proofBlock}>
            <span className={styles.proofLabel}>Required action</span>
            {finding.action}
          </p>
          <div className={styles.recordFoot}>
            <span className={styles.technical}>{finding.file}</span>
            <span className={styles.metaDot}>·</span>
            <span>{finding.category}</span>
            <span className={styles.metaDot}>·</span>
            <span>{finding.provenance}</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function EvidenceRecord({
  record,
  focused,
  onFocus,
}: {
  record: EvidenceView;
  focused: boolean;
  onFocus: () => void;
}) {
  const strong = isStrongEvidence(record.evidenceClass);
  return (
    <article
      className={`${styles.record} ${styles.focusable} ${styles.recordEvidence} ${
        strong ? styles.evStrong : styles.evWeak
      } ${record.stale ? styles.evStale : ""} ${
        record.status === "missing" ? styles.evMissing : ""
      } ${focused ? styles.recordFocused : ""}`}
    >
      <button type="button" className={styles.recordButton} onClick={onFocus} aria-pressed={focused}>
        <span className={styles.recordTop}>
          <span className={styles.recordTitle}>{record.title}</span>
          <span className={styles.evidenceState}>
            <StrengthMeter rank={evidenceRank(record.evidenceClass)} />
            <span className={`${styles.evidenceStatus} ${evidenceStatusTone(record.status)}`}>
              {record.status}
            </span>
          </span>
        </span>
        <span className={styles.recordStatement}>{record.statement}</span>
        <span className={styles.recordFoot}>
          <span className={styles.evidenceClass}>{record.evidenceClass}</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.technical}>{record.source}</span>
          {record.stale ? <span className={styles.staleFlag}>stale · {record.observedAt}</span> : null}
        </span>
      </button>

      {focused ? (
        <div className={styles.recordExpansion}>
          <ArtifactMarker
            kind="Evidence"
            id={record.evidenceId}
            accent={evidenceStatusTone(record.status)}
          />
          <div className={styles.recordFoot}>
            <span>{record.provenance}</span>
            <span className={styles.metaDot}>·</span>
            <span>observed {record.observedAt}</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function RequirementRecord({
  requirement,
  focused,
  onFocus,
}: {
  requirement: RequirementView;
  focused: boolean;
  onFocus: () => void;
}) {
  const blocking = requirement.importance === "blocking";
  return (
    <article
      className={`${styles.record} ${styles.focusable} ${styles.recordRequirement} ${
        blocking ? styles.reqBlocking : styles.reqAdvisory
      } ${requirement.status === "satisfied" ? styles.reqSatisfied : ""} ${
        requirement.stale ? styles.reqStale : ""
      } ${focused ? styles.recordFocused : ""}`}
    >
      <button type="button" className={styles.recordButton} onClick={onFocus} aria-pressed={focused}>
        <span className={styles.recordTop}>
          <span className={styles.recordTitle}>{requirement.title}</span>
          <span className={styles.reqState}>
            {blocking ? <span className={styles.reqBlockingFlag}>blocking</span> : null}
            <span className={`${styles.reqStatus} ${requirementStatusTone(requirement.status)}`}>
              {requirement.status}
            </span>
          </span>
        </span>
        <span className={styles.recordStatement}>{requirement.statement}</span>
      </button>

      {focused ? (
        <div className={styles.recordExpansion}>
          <ArtifactMarker
            kind="Requirement"
            id={requirement.requirementId}
            accent={requirementStatusTone(requirement.status)}
          />
          <p className={styles.proofBlock}>
            <span className={styles.proofLabel}>Proof required</span>
            {requirement.evidenceRequired}
          </p>
        </div>
      ) : null}
    </article>
  );
}

/* --- Inspector projections -------------------------------------------- */

function InspectorGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className={styles.inspectorGroup}>
      <span className={styles.inspectorGroupLabel}>{label}</span>
      {children}
    </section>
  );
}

function FindingInspector({ finding }: { finding: FindingView }) {
  return (
    <>
      <ArtifactMarker
        kind="Finding"
        id={finding.findingId}
        accent={severityTone(finding.severity)}
      />
      <h2 className={styles.inspectorTitle}>{finding.title}</h2>
      <p className={styles.inspectorLead}>{finding.statement}</p>

      <InspectorGroup label="Required action">
        <p className={styles.inspectorText}>{finding.action}</p>
      </InspectorGroup>

      <InspectorGroup label="Origin">
        <p className={styles.inspectorMono}>{finding.file}</p>
        <p className={styles.inspectorText}>
          {finding.category} · {finding.provenance}
        </p>
      </InspectorGroup>

      {/* Evidence and requirements are different relationships and are never
          presented under one heading. Evidence supports the observation;
          requirements are what the observation opens. */}
      <InspectorGroup label="Supporting evidence">
        {finding.supportingEvidenceIds.length === 0 ? (
          <p className={styles.inspectorEmpty}>No supporting evidence recorded</p>
        ) : (
          <div className={styles.refList}>
            {finding.supportingEvidenceIds.map((id) => (
              <span key={id} className={styles.ref}>
                {id}
              </span>
            ))}
          </div>
        )}
      </InspectorGroup>

      <InspectorGroup label="Related requirements">
        {finding.relatedRequirementIds.length === 0 ? (
          <p className={styles.inspectorEmpty}>No requirement opened by this observation</p>
        ) : (
          <div className={styles.refList}>
            {finding.relatedRequirementIds.map((id) => (
              <span key={id} className={styles.ref}>
                {id}
              </span>
            ))}
          </div>
        )}
      </InspectorGroup>
    </>
  );
}

function EvidenceInspector({ record }: { record: EvidenceView }) {
  return (
    <>
      <ArtifactMarker
        kind="Evidence"
        id={record.evidenceId}
        accent={evidenceStatusTone(record.status)}
      />
      <h2 className={styles.inspectorTitle}>{record.title}</h2>
      <p className={styles.inspectorLead}>{record.statement}</p>

      <InspectorGroup label="Strength">
        <div className={styles.inspectorStrength}>
          <StrengthMeter rank={evidenceRank(record.evidenceClass)} />
          <span className={styles.inspectorText}>{record.evidenceClass}</span>
        </div>
        <p className={`${styles.inspectorText} ${evidenceStatusTone(record.status)}`}>
          {record.status}
          {record.stale ? " · stale" : ""}
        </p>
      </InspectorGroup>

      <InspectorGroup label="Origin">
        <p className={styles.inspectorMono}>{record.source}</p>
        <p className={styles.inspectorText}>
          {record.provenance} · observed {record.observedAt}
        </p>
      </InspectorGroup>

      <InspectorGroup label="Supports observations">
        {record.supportsFindingIds.length === 0 ? (
          <p className={styles.inspectorEmpty}>Not linked to an observation</p>
        ) : (
          <div className={styles.refList}>
            {record.supportsFindingIds.map((id) => (
              <span key={id} className={styles.ref}>
                {id}
              </span>
            ))}
          </div>
        )}
      </InspectorGroup>
    </>
  );
}

function RequirementInspector({ requirement }: { requirement: RequirementView }) {
  return (
    <>
      <ArtifactMarker
        kind="Requirement"
        id={requirement.requirementId}
        accent={requirementStatusTone(requirement.status)}
      />
      <h2 className={styles.inspectorTitle}>{requirement.title}</h2>
      <p className={styles.inspectorLead}>{requirement.statement}</p>

      <InspectorGroup label="Proof required">
        <p className={styles.inspectorText}>{requirement.evidenceRequired}</p>
      </InspectorGroup>

      <InspectorGroup label="State">
        <p className={`${styles.inspectorText} ${requirementStatusTone(requirement.status)}`}>
          {requirement.importance} · {requirement.status}
          {requirement.stale ? " · stale" : ""}
        </p>
      </InspectorGroup>

      <InspectorGroup label="Satisfied by">
        {requirement.supportingEvidenceIds.length === 0 ? (
          <p className={styles.inspectorEmpty}>No evidence recorded yet</p>
        ) : (
          <div className={styles.refList}>
            {requirement.supportingEvidenceIds.map((id) => (
              <span key={id} className={styles.ref}>
                {id}
              </span>
            ))}
          </div>
        )}
      </InspectorGroup>
    </>
  );
}

function CaseContextInspector({
  fixture,
  composition,
}: {
  fixture: CaseFixture;
  composition: ReturnType<typeof evidenceComposition>;
}) {
  return (
    <>
      <h2 className={styles.inspectorTitle}>{fixture.reviewStatus}</h2>
      <p className={styles.inspectorLead}>{fixture.context.summary}</p>

      <InspectorGroup label="Reviewer focus">
        <ul className={styles.inspectorPoints}>
          {fixture.context.reviewerFocus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </InspectorGroup>

      {/* Counts describe this case's own evidence only. No comparison,
          benchmark or organisational metric is implied. */}
      <InspectorGroup label={`Evidence composition · ${composition.total} records`}>
        <div className={styles.composition}>
          <CompositionRow label="Observed or verified" value={composition.strong} rank={4} />
          <CompositionRow label="Inferred or assumed" value={composition.inferred} rank={1} />
          <CompositionRow label="Missing or unverified" value={composition.incomplete} rank={0} />
          <CompositionRow label="Stale" value={composition.stale} rank={0} />
        </div>
      </InspectorGroup>

      {fixture.context.limitations.length > 0 ? (
        <InspectorGroup label="Limitations">
          <ul className={styles.inspectorPoints}>
            {fixture.context.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InspectorGroup>
      ) : null}

      <InspectorGroup label="Head">
        <p className={styles.inspectorMono}>{fixture.headSha}</p>
        <p className={styles.inspectorText}>Updated {fixture.updatedAt}</p>
      </InspectorGroup>
    </>
  );
}

function CompositionRow({ label, value, rank }: { label: string; value: number; rank: number }) {
  return (
    <div className={styles.compositionRow}>
      <StrengthMeter rank={value === 0 ? 0 : rank} />
      <span className={styles.compositionLabel}>{label}</span>
      <span className={styles.compositionValue}>{value}</span>
    </div>
  );
}
