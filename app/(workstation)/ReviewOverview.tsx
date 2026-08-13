"use client";

import type { MouseEvent } from "react";
import type { ReviewMode } from "../../lib/r6c/index";
import type { ReadySelectedReview } from "../../lib/r6f/index";
import styles from "./selected-review.module.css";

function isPlainPrimaryClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey;
}

export default function ReviewOverview({
  review,
  onModeActivate,
}: {
  review: ReadySelectedReview;
  onModeActivate: (mode: ReviewMode) => void;
}) {
  const { overview } = review;
  return (
    <div className={styles.overview}>
      <section className={styles.overviewSection} aria-labelledby="r6f-recommendation">
        <h2 id="r6f-recommendation">Lintel recommendation</h2>
        <p className={styles.prominentStatement}>{overview.recommendation.statement}</p>
        <p className={styles.prose}>{overview.recommendation.summary}</p>
      </section>

      <section className={styles.overviewSection} aria-labelledby="r6f-human-decision">
        <h2 id="r6f-human-decision">Human Decision</h2>
        <p className={styles.prominentStatement}>{overview.humanDecision.statement}</p>
        {overview.humanDecision.details.length > 0 && (
          <ul className={styles.supportList} aria-label="Recorded Human Decision details">
            {overview.humanDecision.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        )}
      </section>

      <section className={styles.overviewSection} aria-labelledby="r6f-verification">
        <h2 id="r6f-verification">Verification standing</h2>
        <dl className={styles.standing}>
          {overview.verification.items.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        {overview.verification.limitations.length > 0 && (
          <ul className={styles.limitations} aria-label="Analysis limitations">
            {overview.verification.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        )}
      </section>

      <section className={styles.overviewSection} aria-labelledby="r6f-next-step">
        <h2 id="r6f-next-step">Next step</h2>
        <p className={styles.prose}>{overview.nextStep.statement}</p>
        {overview.nextStep.target && (
          <a
            className={styles.nextStepLink}
            href={overview.nextStep.target.href}
            onClick={(event) => {
              if (!isPlainPrimaryClick(event)) return;
              event.preventDefault();
              onModeActivate(overview.nextStep.target!.mode);
            }}
          >
            Inspect {overview.nextStep.target.label}
          </a>
        )}
      </section>

      <section className={`${styles.overviewSection} ${styles.analysisBasis}`} aria-labelledby="r6f-analysis-basis">
        <h2 id="r6f-analysis-basis">Analysis basis</h2>
        {overview.analysisBasis.items.length > 0 && (
          <dl className={styles.basisList}>
            {overview.analysisBasis.items.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {overview.analysisBasis.movement && <p>{overview.analysisBasis.movement}</p>}
        {overview.analysisBasis.limitation && <p>{overview.analysisBasis.limitation}</p>}
      </section>
    </div>
  );
}
