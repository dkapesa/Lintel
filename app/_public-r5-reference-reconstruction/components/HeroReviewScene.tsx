import styles from "../reference-reconstruction.module.css";
import { PublicSceneViews } from "./PublicSceneViews";
import {
  AFFECTED_FILES,
  CANONICAL_REVIEW,
  DECISION_READINESS,
  PRIMARY_FINDING,
  QUEUE_CONTEXT_ROWS,
  READINESS,
  REVIEW_OVERVIEW,
} from "../../_public-r5-recalibrated/canonical-review";
import { DECISION_AUTHORITY_STATEMENT } from "../reconstruction-content";

const DEFAULT_HERO_VIEW = "overview" as const;
const HERO_SEQUENCE_DURATION = 4300;
const PRIMARY_AFFECTED_FILE = AFFECTED_FILES[0];

function HeroContext() {
  return (
    <aside className={styles.heroSceneAside} aria-label="Review context">
      <p className={styles.microLabel}>Needs attention</p>

      <div className={styles.contextCardSelected}>
        <p className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</p>
        <p className={styles.contextCardTitle}>{CANONICAL_REVIEW.title}</p>
        <p className={styles.contextCardMeta}>
          {CANONICAL_REVIEW.recommendation} · {CANONICAL_REVIEW.riskLabel}
        </p>
        <p className={styles.contextCardState}>Selected</p>
      </div>

      <p className={styles.asideNote}>Context only — not inspectable here.</p>

      <ul className={styles.contextList}>
        {QUEUE_CONTEXT_ROWS.map((row) => (
          <li key={row.reviewKey} className={styles.contextCard}>
            <p className={styles.mono}>{row.pullRequestLabel}</p>
            <p className={styles.contextCardTitle}>{row.title}</p>
            <p className={styles.contextCardMeta}>
              {row.recommendation} · {row.riskLabel}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function HeroPersistentReview() {
  return (
    <div className={styles.heroScenePersistent}>
      <p className={styles.sceneTitle}>{CANONICAL_REVIEW.title}</p>
      <p className={styles.sceneSub}>
        <span className={styles.mono}>{CANONICAL_REVIEW.branch}</span>
        <span className={styles.sceneChromeDot} aria-hidden="true" />
        <span className={styles.mono}>head {CANONICAL_REVIEW.headSha}</span>
      </p>

      <dl className={styles.factRow}>
        <div className={styles.fact}>
          <dt className={styles.microLabel}>Recommendation</dt>
          <dd className={styles.factValue}>{CANONICAL_REVIEW.recommendation}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.microLabel}>Risk</dt>
          <dd className={styles.factValue}>{CANONICAL_REVIEW.riskLabel}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.microLabel}>Requirements</dt>
          <dd className={styles.factValue}>{CANONICAL_REVIEW.requirementsSummary}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.microLabel}>Human Decision</dt>
          <dd className={`${styles.factValue} ${styles.factPending}`}>
            {CANONICAL_REVIEW.humanDecision}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function HeroOverviewPanel() {
  return (
    <div className={styles.heroOverviewPanel}>
      <div className={styles.heroOverviewNext} data-hero-step="h1">
        <p className={styles.microLabel}>Next inspection</p>
        <p className={styles.heroPanelLead}>{REVIEW_OVERVIEW.nextInspection}</p>
      </div>

      <div className={styles.heroOverviewFocus} data-hero-step="h2">
        <p className={styles.microLabel}>Reviewer focus</p>
        <ul className={styles.heroFocusList}>
          {REVIEW_OVERVIEW.reviewerFocus.map((focus) => (
            <li key={focus}>{focus}</li>
          ))}
        </ul>
      </div>

      <p className={styles.heroEvidenceBoundary} data-hero-step="h3">
        <span className={styles.microLabel}>Evidence boundary</span>
        <span>{REVIEW_OVERVIEW.evidenceBoundary}</span>
      </p>
    </div>
  );
}

function HeroFindingPanel() {
  return (
    <article className={styles.heroFindingPanel}>
      <p className={styles.recordTags}>
        <span className={styles.tagSeverity}>{PRIMARY_FINDING.severity}</span>
        <span className={styles.tagPlain}>{PRIMARY_FINDING.category}</span>
        <span className={styles.tagPlain}>{PRIMARY_FINDING.provenance}</span>
      </p>
      <h3 className={styles.recordTitle}>{PRIMARY_FINDING.title}</h3>
      <p className={styles.recordStatement}>{PRIMARY_FINDING.statement}</p>
      <p className={styles.recordSource}>
        <code className={styles.mono}>{PRIMARY_FINDING.file}</code>
      </p>
      <dl className={styles.heroFindingFacts}>
        <div>
          <dt>Inspection action</dt>
          <dd>{PRIMARY_FINDING.action}</dd>
        </div>
        <div>
          <dt>Related requirement</dt>
          <dd>
            {PRIMARY_FINDING.relatedRequirement.title} · {PRIMARY_FINDING.relatedRequirement.state}
          </dd>
        </div>
      </dl>
      <p className={styles.heroAffectedFile}>
        <code className={styles.mono}>{PRIMARY_AFFECTED_FILE.path}</code>
        <span>
          +{PRIMARY_AFFECTED_FILE.additions} −{PRIMARY_AFFECTED_FILE.deletions}
        </span>
        <span>{PRIMARY_AFFECTED_FILE.risk}</span>
      </p>
    </article>
  );
}

function HeroReadinessPanel() {
  return (
    <div className={styles.heroReadinessPanel}>
      <p className={styles.readinessNote}>{READINESS.note}</p>
      <dl className={styles.heroReadinessFacts}>
        <div>
          <dt>Proof state</dt>
          <dd>{READINESS.missingOrUnverified} missing or unverified</dd>
        </div>
        <div>
          <dt>Staleness</dt>
          <dd>{READINESS.stale} stale</dd>
        </div>
      </dl>
      <p className={styles.heroPriorDecision}>{DECISION_READINESS.priorDecision}</p>
      <p className={styles.authorityStatement}>{DECISION_AUTHORITY_STATEMENT}</p>
    </div>
  );
}

/* R5E.1E.4C — three bounded views of the same selected review. Persistent
   identity and readiness facts never enter a panel, queue context stays inert,
   and automatic H1–H3 emphasis never writes the active view. */
export function HeroReviewScene() {
  const views = [
    {
      key: "overview",
      label: "Overview",
      control: <span>Overview</span>,
      panel: <HeroOverviewPanel />,
    },
    {
      key: "finding",
      label: "Finding",
      control: <span>Finding</span>,
      panel: <HeroFindingPanel />,
    },
    {
      key: "readiness",
      label: "Readiness",
      control: <span>Readiness</span>,
      panel: <HeroReadinessPanel />,
    },
  ] as const;

  return (
    <PublicSceneViews
      idPrefix="hero-review"
      classNames={{
        scene: `${styles.scene} ${styles.heroReviewScene}`,
        interaction: styles.publicSceneInteraction,
        plate: styles.scenePlate,
        frame: styles.sceneFrame,
        body: styles.heroInteractiveBody,
        controls: `${styles.publicSceneSwitchControls} ${styles.heroViewControls}`,
        staticControls: `${styles.publicSceneStaticLabel} ${styles.heroViewControls}`,
        tab: styles.publicSceneSwitchTab,
        panelStack: `${styles.publicScenePanelStack} ${styles.heroPanelStack}`,
        panel: styles.publicScenePanel,
      }}
      defaultKey={DEFAULT_HERO_VIEW}
      groupLabel="Selected review views"
      introductionDuration={HERO_SEQUENCE_DURATION}
      orientation="horizontal"
      staticPanelLabel="Overview"
      chrome={
        <div className={styles.sceneChrome}>
          <span className={styles.mono}>{CANONICAL_REVIEW.repository}</span>
          <span className={styles.sceneChromeDot} aria-hidden="true" />
          <span className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</span>
          <span className={styles.sceneChromeTail}>{CANONICAL_REVIEW.selectedReviewLabel}</span>
        </div>
      }
      persistent={
        <>
          <HeroContext />
          <HeroPersistentReview />
        </>
      }
      views={views}
    />
  );
}
