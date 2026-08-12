"use client";

import type { ReadySelectedReview } from "../../lib/r6f/index";
import { resolveCurrentCase } from "../../lib/r6c/index";
import { CHANGED_CONTENT_UNAVAILABLE_MODE, projectChangeRegister } from "../../lib/r6i/index";
import ChangedFileRow from "./ChangedFileRow";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./change.module.css";

export default function ChangeMode({ review }: { review: ReadySelectedReview }) {
  const { snapshot, reviewIndex, state } = useWorkstation();
  const cases = snapshot.status === "ready" ? snapshot.cases : [];
  const register = projectChangeRegister(reviewIndex, review.reviewId, cases);
  if (register.status !== "ready") return null;

  const currentCase = resolveCurrentCase(reviewIndex, review.reviewId, cases);
  const selectedContext = state.primarySelection?.kind === "change" ? state.primarySelection : null;
  const inspectorContext = state.inspector.open && state.inspector.context?.kind === "change"
    ? state.inspector.context
    : null;

  return (
    <section className={styles.changeMode} aria-labelledby="review-mode-change">
      <div className={styles.orientation}>
        <h2 id="review-mode-change">Change</h2>
        <p>{CHANGED_CONTENT_UNAVAILABLE_MODE}</p>
      </div>

      {register.recordCount === 0 ? (
        <p className={styles.empty}>This analysis recorded no changed files.</p>
      ) : (
        <ul className={styles.register}>
          {register.rows.map((row) => {
            const source = currentCase?.changedFiles[row.sourceIndex];
            const locations = source?.artifactId === row.context.id
              ? source.focusedRegions.map(({ startLine, endLine, sourceLabel }) => ({ startLine, endLine, sourceLabel }))
              : [];
            return (
              <ChangedFileRow
                key={row.context.id}
                row={row}
                locations={locations}
                selected={selectedContext?.id === row.context.id}
                inInspector={inspectorContext?.id === row.context.id}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
