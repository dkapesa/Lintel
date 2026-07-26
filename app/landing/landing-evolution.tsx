"use client";

import { useState } from "react";
import styles from "./landing.module.css";
import { TONE_CLASS } from "./landing-primitives";
import type { LandingHeadSummary, LandingMovement, LandingTone } from "../../lib/landing-theatre-fixtures";

/* R3D — review evolution.

   A two-state run toggle and nothing else: no autoplay, no scrubber, no third
   state, no animated counter. Both runs stay readable at every width — the
   toggle moves emphasis rather than hiding a record — and every value comes
   from the build-time comparison of two real runs, so the two columns
   reconcile by construction. */

const MARK_LABEL: Record<LandingMovement["mark"], string> = {
  cleared: "Cleared",
  opened: "Opened",
  reopened: "Reopened",
  changed: "Evidence changed",
};

const MARK_TONE: Record<LandingMovement["mark"], LandingTone> = {
  cleared: "success",
  opened: "warning",
  reopened: "danger",
  changed: "info",
};

export default function LandingEvolution({
  previous,
  current,
  movements,
  headNote,
}: {
  previous: LandingHeadSummary;
  current: LandingHeadSummary;
  movements: LandingMovement[];
  headNote: string;
}) {
  const [selected, setSelected] = useState<"previous" | "current">("current");
  const heads = [previous, current] as const;

  const rows = (index: 0 | 1) => {
    const value = heads[index];
    const other = heads[index === 0 ? 1 : 0];
    return [
      { label: "Recommendation", value: value.recommendation, changed: value.recommendation !== other.recommendation },
      { label: "Risk", value: `${value.riskScore}/100 ${value.riskBand}`, changed: value.riskScore !== other.riskScore },
      { label: "Open requirements", value: String(value.openRequirements), changed: value.openRequirements !== other.openRequirements },
      { label: "Blocking", value: String(value.blockingRequirements), changed: value.blockingRequirements !== other.blockingRequirements },
      { label: "Missing proof", value: String(value.missingProof), changed: value.missingProof !== other.missingProof },
      { label: "Human Decision", value: "PENDING", changed: false },
    ];
  };

  return (
    <>
      <div className={styles.evoToggle} role="radiogroup" aria-label="Emphasised run">
        {heads.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected === item.id}
            tabIndex={selected === item.id ? 0 : -1}
            className={`${styles.evoToggleBtn} ${selected === item.id ? styles.evoToggleOn : ""}`}
            onClick={() => setSelected(item.id)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
              event.preventDefault();
              setSelected(selected === "previous" ? "current" : "previous");
            }}
          >
            {item.label}
            <code>{item.runId}</code>
          </button>
        ))}
      </div>

      <div className={styles.evoCompare}>
        {heads.map((item, index) => {
          const emphasised = selected === item.id;
          return (
            <section
              key={item.id}
              className={`${styles.evoColumn} ${emphasised ? "" : styles.evoDim}`}
              aria-label={item.label}
              aria-current={emphasised ? "true" : undefined}
            >
              <header className={styles.evoHead}>
                <h3 className={styles.evoHeadName}>{item.label}</h3>
                <span className={styles.mono}>
                  {item.runId} · {item.recorded}
                </span>
              </header>
              <dl className={styles.evoRows}>
                {rows(index as 0 | 1).map((row) => (
                  <div key={row.label} className={`${styles.evoRow} ${row.changed && emphasised ? styles.evoChanged : ""}`}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      <p className={`${styles.support} ${styles.evoNote}`}>{headNote}</p>

      <div className={styles.movements}>
        <div className={styles.coordinate}>
          <b>What moved</b>
          <span>
            between run {previous.runId} and run {current.runId}
          </span>
          <span className={styles.sample}>Sample data</span>
        </div>
        <ul className={styles.movementList}>
          {movements.map((movement) => (
            <li key={`${movement.id}-${movement.mark}`} className={styles.movement}>
              <span className={styles.movementId}>{movement.id}</span>
              <span className={`${styles.chip} ${TONE_CLASS[MARK_TONE[movement.mark]]}`}>
                {MARK_LABEL[movement.mark].toUpperCase()}
              </span>
              <span className={styles.movementDetail}>{movement.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
