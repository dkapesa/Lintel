"use client";

import type { HistoryCurrentRow, HistoryTargetRow } from "../../lib/r6j";
import styles from "./history.module.css";

export default function HistoryRow({
  row,
  selected = false,
  onSelect,
}: {
  row: HistoryCurrentRow | HistoryTargetRow;
  selected?: boolean;
  onSelect?: (runId: string) => void;
}) {
  const metadata = <>
    <span>{row.analysedAt}</span>
    <span>Lintel recommendation: {row.recommendation}</span>
    <span>Risk score {row.riskScore}</span>
    <span>{row.source}</span>
    {row.head && <span>Head {row.head}</span>}
  </>;
  if (row.kind === "current") {
    return <li className={`${styles.historyRow} ${styles.currentRow}`}><div className={styles.rowContent}><strong>Current analysis</strong><span className={styles.rowMetadata}>{metadata}</span></div></li>;
  }
  return (
    <li className={`${styles.historyRow} ${selected ? styles.selectedRow : ""}`}>
      <button type="button" className={styles.rowButton} aria-pressed={selected} onClick={() => onSelect?.(row.runId)}>
        <span className={styles.rowContent}>
          <strong>Comparison analysis</strong>
          <span className={styles.rowMetadata}>{metadata}</span>
        </span>
        <span className={styles.rowMarkers}>
          {selected ? <span className={styles.quietPill}>Selected</span> : row.previousApplicable && <span className={styles.previousApplicable}>Previous applicable</span>}
        </span>
      </button>
    </li>
  );
}
