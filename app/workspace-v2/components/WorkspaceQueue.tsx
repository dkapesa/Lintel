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
  limitations,
}: {
  groups: QueueGroup[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  /* Restrained, truthful notes about how the queue was projected (e.g. some
     stored reports could not be read). Optional; absent in fixture mode. */
  limitations?: string[];
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  /* Empty groups are never rendered, so they introduce no group header and no
     dead tab stop (view-model §16.5: an empty group simply is not shown). */
  const visibleGroups = groups.filter((group) => group.cases.length > 0);
  const totalCases = visibleGroups.reduce((sum, group) => sum + group.cases.length, 0);
  const notes = limitations?.filter((note) => note.trim().length > 0) ?? [];

  /* Exactly one row is tabbable. Normally that is the selected case; if a stale
     selection is passed that matches no visible row, the first case becomes the
     single tab stop so the widget never drops out of the tab order. */
  const firstCaseId = visibleGroups[0]?.cases[0]?.caseId ?? null;
  const selectionVisible = visibleGroups.some((group) =>
    group.cases.some((item) => item.caseId === selectedCaseId),
  );
  const tabbableCaseId = selectionVisible ? selectedCaseId : firstCaseId;

  return (
    <aside className={styles.queue} aria-label="Case queue" data-tour="risk-inbox">
      <div className={styles.planeHeader}>
        <span className={styles.planeLabel}>Queue</span>
        <span className={styles.planeHeaderCount} aria-hidden="true">
          {totalCases}
        </span>
      </div>
      <div
        className={styles.queueList}
        ref={listRef}
        onKeyDown={(event) => rovingKeyDown(event, listRef.current)}
      >
        {visibleGroups.map((group) => (
          <section
            key={group.id}
            className={styles.queueGroup}
            role="group"
            aria-label={`${group.label}, ${group.cases.length} ${
              group.cases.length === 1 ? "case" : "cases"
            }`}
          >
            {/* The visible header is decorative for AT — the group's aria-label
                already announces the same label and count, so it is hidden to
                avoid announcing the count twice. */}
            <div className={styles.queueGroupHeader} aria-hidden="true">
              <span className={styles.queueGroupLabel}>{group.label}</span>
              <span className={styles.queueGroupCount}>{group.cases.length}</span>
            </div>
            {group.cases.map((item) => (
              <QueueRow
                key={item.caseId}
                item={item}
                selected={item.caseId === selectedCaseId}
                tabbable={item.caseId === tabbableCaseId}
                onSelect={() => onSelectCase(item.caseId)}
              />
            ))}
          </section>
        ))}
      </div>
      {notes.length > 0 ? (
        <div className={styles.queueLimitations} role="note">
          {notes.map((note, index) => (
            <p key={index} className={styles.queueLimitationLine}>
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function QueueRow({
  item,
  selected,
  tabbable,
  onSelect,
}: {
  item: QueueCaseSummary;
  selected: boolean;
  tabbable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-roving="true"
      tabIndex={tabbable ? 0 : -1}
      aria-current={selected ? "true" : undefined}
      aria-label={queueRowLabel(item, selected)}
      className={`${styles.queueRow} ${selected ? styles.queueRowSelected : ""}`}
      onClick={onSelect}
    >
      {/* The individual spans are aria-hidden: the composed aria-label above is
          the single, ordered announcement so the row is not read as a run of
          disconnected tokens. */}
      <span className={styles.queueRef} aria-hidden="true">
        #{item.pullRequestNumber}
      </span>
      <span className={styles.queueTitle} aria-hidden="true">
        {item.title}
      </span>
      {item.provenanceHint ? (
        <span className={styles.queueProvenanceHint} aria-hidden="true">
          {item.provenanceHint}
        </span>
      ) : null}
      <span className={styles.queueState} aria-hidden="true">
        <span className={`${styles.queueRec} ${recommendationTone(item.recommendation)}`}>
          {RECOMMENDATION_LABEL[item.recommendation]}
        </span>
        <span className={styles.queueRisk}>{item.riskLevel}</span>
        <QueueDecisionMarker marker={item.decisionMarker} />
      </span>
    </button>
  );
}

/* One ordered, human-readable announcement for a queue row: identity, title,
   recommendation, risk, then — only when genuinely recorded — the decision
   marker, and finally the restrained same-PR provenance hint. Selection is
   already exposed through aria-current, so it is not repeated here. */
function queueRowLabel(item: QueueCaseSummary, selected: boolean): string {
  const parts = [
    `Pull request ${item.pullRequestNumber}`,
    item.title,
    `${RECOMMENDATION_LABEL[item.recommendation]}, ${item.riskLevel.toLowerCase()} risk`,
  ];
  if (item.decisionMarker.kind === "recorded") {
    const prefix = item.decisionMarker.isSample ? "Sample decision" : "Decision";
    parts.push(
      `${prefix} recorded: ${OUTCOME_LABEL[item.decisionMarker.outcome]}${
        item.decisionMarker.needsReaffirmation ? ", needs reaffirmation" : ""
      }`,
    );
  }
  if (item.provenanceHint) parts.push(item.provenanceHint);
  const label = parts.join(". ");
  return selected ? `${label}. Current case` : label;
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
