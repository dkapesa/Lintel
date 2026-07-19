"use client";

/* R1B.0 — Production Workspace V2 · Evidence Spine plane.

   Load-bearing structure, not decoration: the five-stage chain plus a
   truthful, fixture-derived footer of this case's own counts. A pure
   projection of the active case detail and the active stage. Roving keyboard
   navigation keeps the chain a single tab stop. */

import { useRef } from "react";
import styles from "../workspace-v2.module.css";
import { rovingKeyDown, toneClass } from "./presentation";
import {
  canvasStageState,
  confirmedEvidenceCount,
  decisionFooterNote,
  decisionStageLabel,
  openBlockingCount,
  stageCount,
  staleEvidenceCount,
} from "../../../lib/workspace-v2/projections";
import {
  WORKSPACE_V2_STAGES,
  type CaseDetail,
  type StageId,
  type StageState,
} from "../../../lib/workspace-v2/view-model";

export function EvidenceSpine({
  detail,
  activeStage,
  onGoToStage,
}: {
  detail: CaseDetail;
  activeStage: StageId;
  onGoToStage: (stage: StageId) => void;
}) {
  const chainRef = useRef<HTMLOListElement | null>(null);
  const footerNote = decisionFooterNote(detail.decision);
  const openBlocking = openBlockingCount(detail);
  const stale = staleEvidenceCount(detail);

  return (
    <nav className={styles.spine} aria-label="Evidence spine">
      <div className={styles.planeHeader}>
        <span className={styles.planeLabel}>Spine</span>
      </div>

      <ol
        className={styles.spineChain}
        ref={chainRef}
        onKeyDown={(event) => rovingKeyDown(event, chainRef.current)}
      >
        {WORKSPACE_V2_STAGES.map((definition, index) => {
          const current = definition.id === activeStage;
          const state: StageState = canvasStageState(detail, definition.id);
          const last = index === WORKSPACE_V2_STAGES.length - 1;
          const sublabel = definition.terminal
            ? decisionStageLabel(detail.decision)
            : String(stageCount(detail, definition.id));
          return (
            <li
              key={definition.id}
              className={`${styles.spineItem} ${last ? styles.spineItemLast : ""}`}
            >
              <button
                type="button"
                data-roving="true"
                tabIndex={current ? 0 : -1}
                aria-current={current ? "step" : undefined}
                className={`${styles.spineNode} ${current ? styles.spineNodeCurrent : ""}`}
                onClick={() => onGoToStage(definition.id)}
              >
                <span className={`${styles.spineMark} ${spineMarkClass(state)}`}>
                  <span className={styles.spineMarkCore} />
                </span>
                <span className={styles.spineText}>
                  <span className={styles.spineLabel}>{definition.label}</span>
                  <span className={styles.spineCount}>{sublabel}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className={styles.spineFoot}>
        <SpineFact value={openBlocking} label="blocking open" attention={openBlocking > 0} />
        <SpineFact value={confirmedEvidenceCount(detail)} label="confirmed" />
        <SpineFact value={stale} label="stale" attention={stale > 0} />
        <span className={`${styles.spineFootNote} ${toneClass(footerNote.tone)}`}>
          {footerNote.text}
        </span>
      </div>
    </nav>
  );
}

function spineMarkClass(state: StageState): string {
  if (state === "attention") return styles.spineMarkAttention;
  if (state === "complete") return styles.spineMarkComplete;
  return styles.spineMarkPending;
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
