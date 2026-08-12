"use client";

import type { MouseEvent } from "react";
import type { ChangeRegisterRow } from "../../lib/r6i/change-register";
import { CHANGED_CONTENT_UNAVAILABLE_FILE, recordedLocationLabel } from "../../lib/r6i/labels";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./change.module.css";

type RecordedLocation = Readonly<{ startLine: number; endLine: number; sourceLabel: string }>;

export default function ChangedFileRow({ row, locations, selected, inInspector }: {
  row: ChangeRegisterRow;
  locations: readonly RecordedLocation[];
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
        <span className={styles.path}>{row.path}</span>
        <span className={styles.metadata}>
          <span>{row.lineCountLabel}</span>
          <span>{row.riskLabel}</span>
          {inInspector && <span className={styles.inspectorMarker}>In Inspector</span>}
        </span>
      </button>
      {selected && (
        <div className={styles.detail}>
          <p className={styles.fullPath}>{row.path}</p>
          <p className={styles.unavailableStatement}>{CHANGED_CONTENT_UNAVAILABLE_FILE}</p>
          <section className={styles.locations} aria-labelledby={`change-locations-${row.sourceIndex}`}>
            <h3 id={`change-locations-${row.sourceIndex}`}>Recorded locations</h3>
            {locations.length === 0 ? (
              <p>No recorded locations in this file.</p>
            ) : (
              <ul>
                {locations.map((location, index) => (
                  <li key={`${location.startLine}-${location.endLine}-${index}`}>
                    <span>{recordedLocationLabel(location.startLine, location.endLine)}</span>
                    <span>{location.sourceLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <dl>
            <div><dt>Line counts</dt><dd>{row.lineCountLabel}</dd></div>
            <div><dt>Risk</dt><dd>{row.riskLabel}</dd></div>
          </dl>
          <button
            className={styles.inspectButton}
            type="button"
            aria-label={`Inspect relationships for ${row.path}`}
            onClick={inspect}
          >
            Inspect relationships
          </button>
        </div>
      )}
    </li>
  );
}
