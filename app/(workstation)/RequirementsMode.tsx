"use client";

import type { ReadySelectedReview } from "../../lib/r6f/index";
import { projectRequirementRegister } from "../../lib/r6h/requirement-register";
import RequirementRow from "./RequirementRow";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./requirements.module.css";

export default function RequirementsMode({ review }: { review: ReadySelectedReview }) {
  const { snapshot, reviewIndex, state } = useWorkstation();
  const cases = snapshot.status === "ready" ? snapshot.cases : [];
  const register = projectRequirementRegister(reviewIndex, review.reviewId, cases);
  if (register.status !== "ready") return null;

  const selectedContext = state.primarySelection?.kind === "requirement" ? state.primarySelection : null;
  const inspectorContext = state.inspector.open && state.inspector.context?.kind === "requirement"
    ? state.inspector.context
    : null;

  return (
    <section className={styles.requirementsMode} aria-labelledby="review-mode-requirements">
      <div className={styles.orientation}>
        <h2 id="review-mode-requirements">Requirements</h2>
        {register.recordCount > 0 && (
          <p>{register.recordCount} {register.recordCount === 1 ? "requirement" : "requirements"}</p>
        )}
      </div>
      {register.recordCount === 0 ? (
        <p className={styles.empty}>This analysis produced no requirements.</p>
      ) : register.groups.map((group) => (
        <section className={styles.group} aria-labelledby={`requirements-group-${group.key}`} key={group.key}>
          <h3 id={`requirements-group-${group.key}`}>{group.label}</h3>
          <ul>
            {group.rows.map((row) => (
              <RequirementRow
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
