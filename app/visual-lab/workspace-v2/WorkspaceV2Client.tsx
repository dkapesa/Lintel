"use client";

/* R0B.1 — Workspace V2 visual lab client boundary.

   This is the only client component in the lab. It owns exactly four pieces
   of state and nothing else:

     selectedCaseId          which queue case is open
     focusedArtifact         which finding / evidence / requirement is focal
     activeStage             which Evidence Spine stage is current
     decisionConceptExpanded whether the plate concept panel is open

   Everything else on screen is a pure projection of those four values plus
   the static fixture. There is no global state, no provider, no context, no
   persistence, and no decision mutation. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./workspace-v2.module.css";
import {
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
  /* ---- The four held values ---- */
  const [selectedCaseId, setSelectedCaseId] = useState<string>(WORKSPACE_V2_DEFAULT_CASE_ID);
  const [focusedArtifact, setFocusedArtifact] = useState<FocusedArtifact>(null);
  const [activeStage, setActiveStage] = useState<StageId>("change");
  const [decisionConceptExpanded, setDecisionConceptExpanded] = useState(false);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const suppressReconcileUntil = useRef(0);

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

  /* ---- Case selection ---- */
  const selectCase = useCallback((caseId: string) => {
    setSelectedCaseId(caseId);
    setFocusedArtifact(null);
    setActiveStage("change");
    setDecisionConceptExpanded(false);
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

  /* ---- Escape clears artifact focus ---- */
  useEffect(() => {
    if (!focusedArtifact) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setFocusedArtifact(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedArtifact]);

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
            const state = stageState(activeCase, definition.id);
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
                      {definition.terminal ? "not recorded" : count}
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
          <span className={styles.spineFootNote}>Decision not recorded</span>
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

        {/* Row 3 — terminal act: unsigned Decision Plate */}
        <footer
          className={`${styles.plate} ${plateCurrent ? styles.plateCurrent : ""}`}
          id="wsv2-decision-plate"
        >
          <div className={styles.plateMain}>
            <div className={styles.plateState}>
              <span className={styles.plateLabel}>
                <span className={styles.plateStep}>5</span>
                Human decision
              </span>
              <span className={styles.plateHeadline}>No engineer decision recorded</span>
              <span className={styles.plateDetail}>
                Lintel recommends{" "}
                <span
                  className={`${styles.plateRec} ${recommendationTone(
                    activeCase.decision.recommendation,
                  )}`}
                >
                  {RECOMMENDATION_LABEL[activeCase.decision.recommendation].toUpperCase()}
                </span>
                <span className={styles.metaDot}>·</span>
                <span className={styles.plateBlocking}>
                  {activeCase.decision.openBlockingRequirements}
                </span>{" "}
                blocking requirement
                {activeCase.decision.openBlockingRequirements === 1 ? "" : "s"} open
              </span>
            </div>

            <button
              type="button"
              className={styles.plateAction}
              aria-expanded={decisionConceptExpanded}
              onClick={() => setDecisionConceptExpanded((value) => !value)}
            >
              {decisionConceptExpanded ? "Hide concept" : "Show concept"}
            </button>
          </div>

          {decisionConceptExpanded ? (
            <div className={styles.plateConcept}>
              <span className={styles.conceptBadge}>Visual-lab concept — not functional</span>
              <p className={styles.conceptBody}>
                A recorded decision would be captured here and attested against the current head.
                Decision capture, persistence and attestation are out of scope for R0B.1 and are
                deferred to R0B.2. Nothing in this panel writes state.
              </p>
            </div>
          ) : null}
        </footer>
      </section>

      {/* Plane 4 — inspector */}
      <aside className={styles.inspector} aria-label="Inspector">
        <div className={styles.planeHeader}>
          <span className={styles.planeLabel}>
            {focusedArtifact ? "Artifact detail" : "Case context"}
          </span>
          {focusedArtifact ? (
            <button
              type="button"
              className={styles.inspectorClear}
              onClick={() => setFocusedArtifact(null)}
            >
              Esc
            </button>
          ) : null}
        </div>

        <div className={styles.inspectorBody}>
          {focusedFinding ? (
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
    </div>
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
