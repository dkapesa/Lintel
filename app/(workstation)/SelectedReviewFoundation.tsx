"use client";

import type { ReviewMode } from "../../lib/r6c/index";
import type { ReadySelectedReview } from "../../lib/r6f/index";
import { APPLICABILITY_LABEL, OUTCOME_LABEL } from "../../lib/r6k/index";
import ChangeMode from "./ChangeMode";
import EvidenceMode from "./EvidenceMode";
import HistoryMode from "./HistoryMode";
import RequirementsMode from "./RequirementsMode";
import ReviewModeNav from "./ReviewModeNav";
import ReviewModeUnavailable from "./ReviewModeUnavailable";
import ReviewOverview from "./ReviewOverview";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./selected-review.module.css";

export default function SelectedReviewFoundation({
  review,
  onModeActivate,
}: {
  review: ReadySelectedReview;
  onModeActivate: (mode: ReviewMode) => void;
}) {
  const { selectedCase, humanDecision } = useWorkstation();
  const decisionStanding = !selectedCase || selectedCase.decision.status === "unavailable"
    ? "Human Decision unavailable"
    : selectedCase.decision.status === "empty"
      ? "Human Decision pending"
      : `${OUTCOME_LABEL[selectedCase.decision.outcome]} · ${APPLICABILITY_LABEL[selectedCase.decision.applicability]}`;
  const showDurability = humanDecision.recordQuarantined || humanDecision.draftDirty;
  return (
    <article className={styles.selectedReview}>
      <header className={styles.identityHeader}>
        {review.identity.repository && <p className={styles.eyebrow}>{review.identity.repository}</p>}
        <h1>{review.identity.title}</h1>
        {review.identity.context.length > 0 && (
          <p className={styles.identityContext}>{review.identity.context.join(" · ")}</p>
        )}
      </header>
      <div className={styles.decisionChrome}>
        <div className={styles.decisionStanding}>
          <p>{decisionStanding}</p>
          {showDurability && humanDecision.durability && (
            <span>{humanDecision.durability.label}</span>
          )}
        </div>
        <button
          className={styles.decisionAction}
          type="button"
          aria-haspopup="dialog"
          onClick={(event) => humanDecision.open(event.currentTarget)}
        >
          Human Decision
        </button>
      </div>
      {humanDecision.refreshFailure && (
        <div className={styles.refreshFailure} role="status">
          <p>{humanDecision.refreshFailure}</p>
          <button type="button" onClick={() => void humanDecision.retryRefresh()}>Reload</button>
        </div>
      )}
      <ReviewModeNav links={review.modes} onActivate={onModeActivate} />
      <div className={styles.modeOutlet}>
        {review.mode === "overview"
          ? <ReviewOverview review={review} onModeActivate={onModeActivate} />
          : review.mode === "evidence"
            ? <EvidenceMode review={review} />
            : review.mode === "requirements"
              ? <RequirementsMode review={review} />
              : review.mode === "change"
                ? <ChangeMode review={review} />
                : review.mode === "history"
                  ? <HistoryMode review={review} />
            : <ReviewModeUnavailable mode={review.mode} />}
      </div>
    </article>
  );
}
