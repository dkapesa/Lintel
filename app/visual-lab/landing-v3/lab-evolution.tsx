"use client";

import { useState } from "react";
import styles from "./landing-v3.module.css";
import { EVOLUTION } from "./fixtures";

/* R3C — review evolution lab (R3B §7.6).

   A two-state commit toggle and nothing else. No autoplay, no scrubber, no
   third state, no animated counter. On desktop both heads stay visible and the
   toggle emphasises one; on mobile the toggle selects which head is shown. */

const MARK_LABEL: Record<string, string> = {
  cleared: "Cleared",
  opened: "Opened",
  reopened: "Reopened",
  changed: "Evidence changed",
};

const MARK_TONE: Record<string, string> = {
  cleared: styles.toneSuccess,
  opened: styles.toneWarning,
  reopened: styles.toneDanger,
  changed: styles.toneInfo,
};

export default function LabEvolution() {
  const [head, setHead] = useState<"previous" | "current">("current");
  const heads = [EVOLUTION.previous, EVOLUTION.current] as const;

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
      <div className={styles.evoToggle} role="radiogroup" aria-label="Head">
        {heads.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={head === item.id}
            tabIndex={head === item.id ? 0 : -1}
            className={`${styles.evoToggleBtn} ${head === item.id ? styles.evoToggleOn : ""}`}
            onClick={() => setHead(item.id)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
              event.preventDefault();
              setHead(head === "previous" ? "current" : "previous");
            }}
          >
            {item.label}
            <code>{item.sha}</code>
          </button>
        ))}
      </div>

      <div className={styles.evoCompare}>
        {heads.map((item, index) => {
          const selected = head === item.id;
          return (
            <section
              key={item.id}
              className={[
                styles.evoColumn,
                selected ? "" : styles.evoDim,
                selected ? "" : styles.evoHidden,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={item.label}
            >
              <header className={styles.evoHead}>
                <h3 className={styles.evoHeadName}>{item.label}</h3>
                <span className={styles.mono}>
                  {item.sha} · {item.recorded}
                </span>
              </header>
              <dl className={styles.evoRows}>
                {rows(index as 0 | 1).map((row) => (
                  <div
                    key={row.label}
                    className={`${styles.evoRow} ${row.changed && selected ? styles.evoChanged : ""}`}
                  >
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      <div className={styles.movements}>
        <div className={styles.coordinate}>
          <b>What moved</b>
          <span>between {EVOLUTION.previous.sha} and {EVOLUTION.current.sha}</span>
          <span className={styles.sample}>Sample data</span>
        </div>
        <ul className={styles.movementList}>
          {EVOLUTION.movements.map((movement) => (
            <li key={`${movement.id}-${movement.mark}`} className={styles.movement}>
              <span className={styles.movementId}>{movement.id}</span>
              <span className={`${styles.chip} ${MARK_TONE[movement.mark]}`}>
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
