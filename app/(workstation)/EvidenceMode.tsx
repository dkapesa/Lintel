"use client";

import type { ReadySelectedReview } from "../../lib/r6f/index";
import { projectEvidenceRegister } from "../../lib/r6g/index";
import EvidenceRow from "./EvidenceRow";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./evidence.module.css";

export default function EvidenceMode({ review }: { review: ReadySelectedReview }) {
  const { snapshot, reviewIndex, state } = useWorkstation();
  const cases = snapshot.status === "ready" ? snapshot.cases : [];
  const register = projectEvidenceRegister(reviewIndex, review.reviewId, cases);
  if (register.status !== "ready") return null;

  const selectedContext = state.primarySelection?.kind === "evidence" ? state.primarySelection : null;
  const inspectorContext = state.inspector.open && state.inspector.context?.kind === "evidence"
    ? state.inspector.context
    : null;

  return (
    <section className={styles.evidenceMode} aria-labelledby="review-mode-evidence">
      <div className={styles.orientation}>
        <h2 id="review-mode-evidence">Evidence</h2>
        {register.recordCount > 0 && (
          <p>{register.recordCount} evidence {register.recordCount === 1 ? "record" : "records"}</p>
        )}
      </div>

      {register.recordCount === 0 ? (
        <p className={styles.empty}>This analysis produced no evidence records.</p>
      ) : register.groups.map((group) => (
        <section className={styles.group} aria-labelledby={`evidence-group-${group.key}`} key={group.key}>
          <h3 id={`evidence-group-${group.key}`}>{group.label}</h3>
          <ul>
            {group.rows.map((row) => (
              <EvidenceRow
                key={row.context.id}
                row={row}
                selected={selectedContext?.id === row.context.id}
                inInspector={inspectorContext?.id === row.context.id}
              />
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
