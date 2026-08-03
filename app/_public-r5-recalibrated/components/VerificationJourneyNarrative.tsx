import styles from "../public-r5-recalibrated.module.css";
import {
  AFFECTED_CONTEXT_SUMMARY,
  AFFECTED_FILES,
  BLOCKING_REQUIREMENT,
  CANONICAL_REVIEW,
  DECISION_DIALOG_COPY,
  DECISION_OUTCOMES,
  DECISION_READINESS,
  MISSING_PROOF_RECORDS,
  PRIMARY_EVIDENCE,
  PRIMARY_FINDING,
  READINESS,
  REVIEW_OVERVIEW,
  STALE_EVIDENCE,
  VERIFICATION_STAGES,
} from "../canonical-review";
import { ACCOUNTABLE_DECISION, JOURNEY_INTRO, VERIFICATION_GAP } from "../prototype-content";

function stageMeta(name: string) {
  return VERIFICATION_STAGES.find((item) => item.name === name);
}

/* R5E.1C — movements two and three of the page composition
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §10). A plain
   server-rendered component: every fact here also drives the interactive
   Workspace/Inspector panels via the same canonical-review.ts module — no
   value is retyped or paraphrased, satisfying
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §8a.3 and §8b.2 (the
   server-rendered resting state must be complete and truthful on its own,
   and the interactive shell must never hold the only copy of a fact).

   Each stage block below carries `data-verification-stage`, the anchor the
   guided IntersectionObserver in LiveReviewStage.tsx observes. The "how it
   works" anchor sits on the movement-two block, which also carries
   `data-verification-stage="overview"` so scrolling back up from "Finding"
   returns the live shell to its Overview state rather than leaving it
   stranded (docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §5.1:
   "Scrolling back up moves back through the same states"). */
export function VerificationJourneyNarrative() {
  const findingStage = stageMeta("Finding");
  const evidenceStage = stageMeta("Evidence");
  const missingProofStage = stageMeta("Missing proof");
  const requirementStage = stageMeta("Requirement");
  const affectedContextStage = stageMeta("Affected context");
  const readinessStage = stageMeta("Readiness");
  const humanDecisionStage = stageMeta("Human Decision");

  return (
    <div className={styles.journeyNarrative}>
      <div id="how-it-works" className={styles.movementBlock} data-verification-stage="overview">
        <h2 className={styles.sectionHeadline}>{VERIFICATION_GAP.headline}</h2>
        <p className={styles.sectionSupporting}>{VERIFICATION_GAP.supporting}</p>
      </div>

      <div className={styles.movementBlock}>
        <h2 className={styles.sectionHeadline}>{JOURNEY_INTRO.headline}</h2>
        <p className={styles.sectionSupporting}>{JOURNEY_INTRO.supporting}</p>
      </div>

      <article className={styles.stageNarrative} data-verification-stage="finding">
        <p className={styles.stageNarrativeEyebrow}>
          {findingStage?.no} {findingStage?.name}
        </p>
        <h3 className={styles.stageNarrativeHeading}>{PRIMARY_FINDING.title}</h3>
        <p className={styles.stageNarrativeBody}>{PRIMARY_FINDING.statement}</p>
        <p className={styles.stageNarrativeMeta}>
          {PRIMARY_FINDING.severity} · {PRIMARY_FINDING.category} · {PRIMARY_FINDING.provenance} ·{" "}
          <span className={styles.inspectorMono}>{PRIMARY_FINDING.file}</span>
        </p>
      </article>

      <article className={styles.stageNarrative} data-verification-stage="evidence">
        <p className={styles.stageNarrativeEyebrow}>
          {evidenceStage?.no} {evidenceStage?.name}
        </p>
        <h3 className={styles.stageNarrativeHeading}>Canonical evidence already on record</h3>
        {PRIMARY_EVIDENCE.map((evidence) => (
          <p className={styles.stageNarrativeBody} key={evidence.recordKey}>
            <strong>{evidence.status}</strong> — {evidence.title}. {evidence.statement}
          </p>
        ))}
        <p className={styles.stageNarrativeMeta}>{REVIEW_OVERVIEW.evidenceBoundary}</p>
      </article>

      <article className={styles.stageNarrative} data-verification-stage="missing-proof">
        <p className={styles.stageNarrativeEyebrow}>
          {missingProofStage?.no} {missingProofStage?.name}
        </p>
        <h3 className={styles.stageNarrativeHeading}>What the review still lacks</h3>
        {MISSING_PROOF_RECORDS.map((record) => (
          <p className={styles.stageNarrativeBody} key={record.recordKey}>
            <strong>{record.status}</strong> — {record.title}. {record.statement} Affects{" "}
            <strong>{record.affectsRequirement.title}</strong> ({record.affectsRequirement.state}).
          </p>
        ))}
        <p className={styles.stageNarrativeMeta}>
          Also stale: {STALE_EVIDENCE.title} — {STALE_EVIDENCE.statement}
        </p>
      </article>

      <article className={styles.stageNarrative} data-verification-stage="requirement">
        <p className={styles.stageNarrativeEyebrow}>
          {requirementStage?.no} {requirementStage?.name}
        </p>
        <h3 className={styles.stageNarrativeHeading}>{BLOCKING_REQUIREMENT.title}</h3>
        <p className={styles.stageNarrativeBody}>{BLOCKING_REQUIREMENT.statement}</p>
        <p className={styles.stageNarrativeMeta}>
          {BLOCKING_REQUIREMENT.importance} · {BLOCKING_REQUIREMENT.status} · follows from{" "}
          {BLOCKING_REQUIREMENT.contributingFindingTitle}. Required: {BLOCKING_REQUIREMENT.evidenceRequired}
        </p>
      </article>

      <article className={styles.stageNarrative} data-verification-stage="affected-context">
        <p className={styles.stageNarrativeEyebrow}>
          {affectedContextStage?.no} {affectedContextStage?.name}
        </p>
        <h3 className={styles.stageNarrativeHeading}>Where this change reaches</h3>
        <p className={styles.stageNarrativeBody}>{AFFECTED_CONTEXT_SUMMARY.intro}</p>
        <ul className={styles.stageNarrativeList}>
          {AFFECTED_FILES.map((file) => (
            <li key={file.path}>
              <span className={styles.inspectorMono}>{file.path}</span> — +{file.additions}/-{file.deletions} ·{" "}
              {file.risk}
            </li>
          ))}
        </ul>
      </article>

      <article className={styles.stageNarrative} data-verification-stage="readiness">
        <p className={styles.stageNarrativeEyebrow}>
          {readinessStage?.no} {readinessStage?.name}
        </p>
        <h3 className={styles.stageNarrativeHeading}>{READINESS.headline}</h3>
        <p className={styles.stageNarrativeBody}>
          {READINESS.blockers} blockers · {READINESS.missingOrUnverified} missing/unverified · {READINESS.stale}{" "}
          stale. {READINESS.note}
        </p>
        <p className={styles.stageNarrativeMeta}>
          {READINESS.decisionContext}. Recommendation, risk and requirement counts stay{" "}
          {CANONICAL_REVIEW.recommendation}, {CANONICAL_REVIEW.riskLabel} and {CANONICAL_REVIEW.requirementsSummary}{" "}
          throughout — nothing here recalculates them.
        </p>
      </article>

      <div className={styles.movementBlock}>
        <h2 className={styles.sectionHeadline}>{ACCOUNTABLE_DECISION.headline}</h2>
        <p className={styles.sectionSupporting}>{ACCOUNTABLE_DECISION.supporting}</p>
      </div>

      <article className={styles.stageNarrative} data-verification-stage="human-decision">
        <p className={styles.stageNarrativeEyebrow}>
          {humanDecisionStage?.no} {humanDecisionStage?.name}
        </p>
        <h3 className={styles.stageNarrativeHeading}>{DECISION_READINESS.headline}</h3>
        <p className={styles.stageNarrativeBody}>
          {DECISION_DIALOG_COPY.statement} {DECISION_READINESS.priorDecision}{" "}
          {DECISION_READINESS.outcomeSelected}
        </p>
        <ul className={styles.stageNarrativeList}>
          {DECISION_OUTCOMES.map((item) => (
            <li key={item.recordKey}>
              <strong>{item.label}</strong> — {item.meaning} · not selected
            </li>
          ))}
        </ul>
        <p className={styles.stageNarrativeMeta}>
          {DECISION_DIALOG_COPY.readOnlyLabel} · {DECISION_DIALOG_COPY.readOnlyBody} {DECISION_READINESS.appliesTo}.
        </p>
      </article>
    </div>
  );
}
