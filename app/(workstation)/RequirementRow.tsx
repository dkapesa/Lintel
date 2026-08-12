"use client";

import type { MouseEvent } from "react";
import type { RequirementRegisterRow } from "../../lib/r6h/requirement-register";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./requirements.module.css";

export default function RequirementRow({ row, selected, inInspector }: {
  row: RequirementRegisterRow;
  selected: boolean;
  inInspector: boolean;
}) {
  const { state, band, dispatchBound } = useWorkstation();

  function inspect(event: MouseEvent<HTMLButtonElement>): void {
    dispatchBound({
      id: "inspector/open",
      context: row.context,
      origin: {
        handle: event.currentTarget,
        region: "workspacePrimary",
        scope: {
          destination: state.destination,
          reviewId: state.selectedReview.status === "available" ? state.selectedReview.reviewId : null,
        },
      },
    }, "visible-ui");
    if (band === "narrow") dispatchBound({ id: "queue/show-narrow-surface", surface: "inspector" }, "visible-ui");
  }

  return (
    <li className={selected ? styles.selectedRecord : styles.record}>
      <button
        className={styles.rowButton}
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={() => dispatchBound({ id: "selection/set", context: row.context }, "visible-ui")}
      >
        <span className={styles.title}>{row.title}</span>
        <span className={styles.statement}>{row.statement}</span>
        <span className={styles.metadata}>
          <span>{row.statusLabel}</span>
          <span>{row.importanceLabel}</span>
          {inInspector && <span className={styles.inspectorMarker}>In Inspector</span>}
        </span>
      </button>
      {selected && (
        <div className={styles.detail}>
          <p>{row.statement}</p>
          <dl>
            <div><dt>Status</dt><dd>{row.statusLabel}</dd></div>
            <div><dt>Importance</dt><dd>{row.importanceLabel}</dd></div>
            <div><dt>Evidence required</dt><dd>{row.evidenceRequired}</dd></div>
          </dl>
          <button className={styles.inspectButton} type="button" aria-label={`Inspect relationships for ${row.title}`} onClick={inspect}>
            Inspect relationships
          </button>
        </div>
      )}
    </li>
  );
}
