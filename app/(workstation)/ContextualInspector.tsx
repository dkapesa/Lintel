"use client";

import { modeLabel } from "../../lib/r6f/index";
import { projectEvidenceContext, type EvidenceRelationshipPresentation } from "../../lib/r6g/index";
import type { CaseDetail } from "../../lib/workspace-v2/view-model";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./inspector.module.css";

function unresolvedCopy(count: number): string {
  return `${count} recorded ${count === 1 ? "reference" : "references"} could not be resolved in this analysis.`;
}

function RelationshipValue({ value }: { value: EvidenceRelationshipPresentation }) {
  if (value.status === "none") return <p>None recorded.</p>;
  if (value.status === "unavailable") return <p>{value.reason}</p>;
  if (value.status === "unresolved") return <p>{unresolvedCopy(value.unresolvedCount)}</p>;
  return (
    <>
      <ul>
        {value.items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.label}{item.detail ? <span> · {item.detail}</span> : null}
          </li>
        ))}
      </ul>
      {value.unresolvedCount > 0 && <p>{unresolvedCopy(value.unresolvedCount)}</p>}
    </>
  );
}

export default function ContextualInspector({ selectedCase }: { selectedCase: CaseDetail }) {
  const { state, band, dispatchBound, registerFocusRegion } = useWorkstation();
  const projection = projectEvidenceContext(selectedCase, state.inspector.context);
  const narrow = band === "narrow";

  function close(): void {
    dispatchBound({ id: "inspector/close" }, "visible-ui");
    if (narrow) {
      dispatchBound({ id: "queue/show-narrow-surface", surface: "workspace" }, "visible-ui");
    }
  }

  return (
    <aside
      className={styles.inspector}
      data-region="inspector"
      aria-label="Contextual Inspector"
      tabIndex={-1}
      ref={(element) => registerFocusRegion("inspector", element)}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Evidence</p>
          <h2>{projection.status === "ready"
            ? projection.title
            : "This evidence record is no longer in the current analysis."}</h2>
        </div>
        <button type="button" aria-label="Close Inspector" onClick={close}>
          {narrow ? `← ${modeLabel(state.mode)}` : "Close"}
        </button>
      </header>

      {projection.status === "ready" ? (
        <div className={styles.body}>
          <p className={styles.statement}>{projection.statement}</p>
          <dl className={styles.standing}>
            {projection.standing.map((item) => (
              <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
            ))}
          </dl>
          <div className={styles.relationships}>
            {projection.relationships.map((relationship) => (
              <section key={relationship.label}>
                <h3>{relationship.label}</h3>
                <RelationshipValue value={relationship.value} />
              </section>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.unavailable}>
          The analysis was refreshed and this record is not present. No other record was selected in its place.
        </p>
      )}
    </aside>
  );
}
