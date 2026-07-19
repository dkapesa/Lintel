"use client";

/* R1B.0 — Production Workspace V2 · Queue plane.

   A compact, operational queue. It is a pure projection of the snapshot's
   grouped case summaries plus two callbacks; it holds no selection state of
   its own. Roving keyboard navigation makes the whole queue a single tab
   stop. */

import { useRef } from "react";
import styles from "../workspace-v2.module.css";
import { recommendationTone, rovingKeyDown, toneClass, outcomeTone } from "./presentation";
import {
  OUTCOME_LABEL,
  RECOMMENDATION_LABEL,
  type DecisionMarker,
  type QueueCaseSummary,
  type QueueGroup,
} from "../../../lib/workspace-v2/view-model";

export function WorkspaceQueue({
  groups,
  selectedCaseId,
  onSelectCase,
}: {
  groups: QueueGroup[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const totalCases = groups.reduce((sum, group) => sum + group.cases.length, 0);

  return (
    <aside className={styles.queue} aria-label="Case queue">
      <div className={styles.planeHeader}>
        <span className={styles.planeLabel}>Queue</span>
        <span className={styles.planeHeaderCount}>{totalCases}</span>
      </div>
      <div
        className={styles.queueList}
        ref={listRef}
        role="list"
        onKeyDown={(event) => rovingKeyDown(event, listRef.current)}
      >
        {groups.map((group) => (
          <section key={group.id} className={styles.queueGroup} role="listitem">
            <div className={styles.queueGroupHeader}>
              <span className={styles.queueGroupLabel}>{group.label}</span>
              <span className={styles.queueGroupCount}>{group.cases.length}</span>
            </div>
            {group.cases.map((item) => (
              <QueueRow
                key={item.caseId}
                item={item}
                selected={item.caseId === selectedCaseId}
                onSelect={() => onSelectCase(item.caseId)}
              />
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
}

function QueueRow({
  item,
  selected,
  onSelect,
}: {
  item: QueueCaseSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-roving="true"
      tabIndex={selected ? 0 : -1}
      aria-current={selected ? "true" : undefined}
      className={`${styles.queueRow} ${selected ? styles.queueRowSelected : ""}`}
      onClick={onSelect}
    >
      <span className={styles.queueRef}>#{item.pullRequestNumber}</span>
      <span className={styles.queueTitle}>{item.title}</span>
      <span className={styles.queueState}>
        <span className={`${styles.queueRec} ${recommendationTone(item.recommendation)}`}>
          {RECOMMENDATION_LABEL[item.recommendation]}
        </span>
        <span className={styles.queueRisk}>{item.riskLevel}</span>
        <QueueDecisionMarker marker={item.decisionMarker} />
      </span>
    </button>
  );
}

/* One restrained glyph, shown only when a decision is genuinely recorded.
   Never renders for an absent or unavailable decision (r0b2 §15, RISK-B). */
function QueueDecisionMarker({ marker }: { marker: DecisionMarker }) {
  if (marker.kind !== "recorded") return null;
  /* Real recorded decisions must not carry the fixture-era "Sample" prefix. */
  const prefix = marker.isSample ? "Sample decision recorded" : "Decision recorded";
  const label = `${prefix}: ${OUTCOME_LABEL[marker.outcome]}${
    marker.needsReaffirmation ? ", needs reaffirmation" : ""
  }`;
  return (
    <span
      className={`${styles.queueDecisionMark} ${
        marker.needsReaffirmation ? styles.queueDecisionStale : ""
      }`}
      title={label}
      aria-label={label}
    >
      <span className={`${styles.queueDecisionDot} ${toneClass(outcomeTone(marker.outcome))}`} />
    </span>
  );
}
