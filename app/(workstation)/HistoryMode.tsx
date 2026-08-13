"use client";

import type { ReadySelectedReview } from "../../lib/r6f";
import { HISTORY_ORIENTATION, projectComparisonContext, projectHistoryRegister } from "../../lib/r6j";
import { resolveCurrentCase } from "../../lib/r6c";
import HistoryRow from "./HistoryRow";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./history.module.css";

export default function HistoryMode({ review }: { review: ReadySelectedReview }) {
  const { snapshot, reviewIndex, state, dispatchBound } = useWorkstation();
  const cases = snapshot.status === "ready" ? snapshot.cases : [];
  const detail = resolveCurrentCase(reviewIndex, review.reviewId, cases);
  if (!detail) return null;
  const register = projectHistoryRegister(detail);
  const comparison = projectComparisonContext(detail, state.comparisonRunId);
  return (
    <section className={styles.historyMode} aria-labelledby="review-mode-history">
      <div className={styles.orientation}>
        <h2 id="review-mode-history">History</h2>
        <p>{HISTORY_ORIENTATION}</p>
      </div>
      {register.status !== "ready" ? <p className={styles.empty}>No previous applicable analysis is available in this browser.</p> : <>
        <ol className={styles.register} aria-label="Analysis history">
          <HistoryRow row={register.current} />
          {register.targets.map((row) => <HistoryRow key={row.runId} row={row} selected={(state.comparisonRunId ?? (detail.history?.status === "comparison" ? detail.history.previous.runId : null)) === row.runId} onSelect={(runId) => dispatchBound({ id: "history/set-comparison", runId }, "visible-ui")} />)}
        </ol>
        {comparison.status === "ready" && <div className={styles.comparisonDetail}>
          <section className={styles.detailSection} aria-labelledby="readiness-movement"><h3 id="readiness-movement">Readiness movement</h3><dl className={styles.movement}>{comparison.movement.map((item) => <div key={item.label}><dt>{item.label}</dt><dd className={item.tone ? styles[`tone-${item.tone}`] : undefined}>{item.value}</dd></div>)}</dl></section>
          <section className={styles.detailSection} aria-labelledby="review-diff"><h3 id="review-diff">Review Diff</h3>{comparison.sections.map((section) => <section className={styles.diffSection} aria-labelledby={`review-diff-${section.key}`} key={section.key}><h4 id={`review-diff-${section.key}`}>{section.label}</h4>{section.rows.map((row, index) => <div className={styles.diffRow} key={`${row.status}-${row.title}-${index}`}><span className={styles.diffStatus}>{row.status}</span><span><strong>{row.title}</strong><small>{row.category}</small></span><span>{row.state}</span></div>)}{section.unchanged > 0 && <p className={styles.unchanged}>{section.unchanged} unchanged</p>}</section>)}</section>
        </div>}
      </>}
    </section>
  );
}
