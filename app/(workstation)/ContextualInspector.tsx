"use client";

import { modeLabel } from "../../lib/r6f/index";
import { projectEvidenceContext } from "../../lib/r6g/evidence-context";
import { projectFindingContext } from "../../lib/r6h/finding-context";
import { projectRequirementContext } from "../../lib/r6h/requirement-context";
import {
  relationshipTraversalAccessibleName,
  relationshipVisibleText,
  unresolvedRelationshipText,
  type RelationshipPresentation,
} from "../../lib/r6h/relationship-presentation";
import type { CaseDetail } from "../../lib/workspace-v2/view-model";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./inspector.module.css";

function RelationshipValue({ value }: { value: RelationshipPresentation }) {
  const { dispatchBound } = useWorkstation();
  if (value.status === "none") return <p>None recorded.</p>;
  if (value.status === "unavailable") return <p>{value.reason}</p>;
  if (value.status === "unresolved") return <p>{unresolvedRelationshipText(value.unresolvedCount)}</p>;
  return (
    <>
      <ul>
        {value.items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.target.kind === "evidence" || item.target.kind === "requirement" || item.target.kind === "finding" ? (
              <button
                className={styles.relationshipButton}
                type="button"
                aria-label={relationshipTraversalAccessibleName(item)}
                onClick={() => dispatchBound({ id: "inspector/traverse-relationship", context: item.target }, "visible-ui")}
              >
                {relationshipVisibleText(item)}
              </button>
            ) : relationshipVisibleText(item)}
          </li>
        ))}
      </ul>
      {value.unresolvedCount > 0 && <p>{unresolvedRelationshipText(value.unresolvedCount)}</p>}
    </>
  );
}

export default function ContextualInspector({ selectedCase }: { selectedCase: CaseDetail }) {
  const { state, band, dispatchBound, registerFocusRegion } = useWorkstation();
  const projection = state.inspector.context?.kind === "requirement"
    ? projectRequirementContext(selectedCase, state.inspector.context)
    : state.inspector.context?.kind === "finding"
      ? projectFindingContext(selectedCase, state.inspector.context)
      : projectEvidenceContext(selectedCase, state.inspector.context);
  const eyebrow = state.inspector.context?.kind === "requirement"
    ? "Requirement"
    : state.inspector.context?.kind === "finding"
      ? "Finding"
      : state.inspector.context?.kind === "evidence"
        ? "Evidence"
        : "Inspector";
  const narrow = band === "narrow";

  function close(): void {
    dispatchBound({ id: "inspector/close" }, "visible-ui");
    if (narrow) dispatchBound({ id: "queue/show-narrow-surface", surface: "workspace" }, "visible-ui");
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
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2>{projection.status === "ready"
            ? projection.title
            : "This Inspector record is no longer in the current analysis."}</h2>
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
