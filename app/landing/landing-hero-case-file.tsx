import type { LandingHeroCaseFile } from "../../lib/landing-theatre-fixtures";
import { Chip, Sample } from "./landing-primitives";
import styles from "./landing.module.css";

function HeroEngineeringGround() {
  return (
    <svg
      className={styles.heroGround}
      viewBox="0 0 1440 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
      focusable="false"
    >
      <path d="M92 444 C260 444 326 362 474 362 C584 362 630 318 720 318" />
      <path d="M208 500 C350 438 438 414 566 414 C646 414 682 372 720 350" />
      <path d="M430 500 C522 452 614 446 720 392" />
      <path d="M720 318 C816 318 884 358 972 358 H1196" />
      <path d="M720 350 C792 350 840 358 892 358" />
      <path d="M720 392 C804 392 856 382 914 358" />
      <path d="M720 226 V438" />
      <path d="M720 258 H884" />
      <path d="M720 414 H1082" />
      <path d="M972 340 V376 M954 358 H990" />
      <path d="M1082 396 V432 M1064 414 H1100" />
    </svg>
  );
}

export default function LandingHeroCaseFile({ caseFile }: { caseFile: LandingHeroCaseFile }) {
  return (
    <div className={styles.heroReveal}>
      <HeroEngineeringGround />

      <article
        className={styles.heroCaseFile}
        aria-label={`Sample Case File for ${caseFile.repository} pull request ${caseFile.pullRequest}`}
      >
        <header className={styles.heroCaseHead}>
          <div className={styles.heroCaseIdentity}>
            <p className={styles.heroCaseRepository}>
              <span>{caseFile.repository}</span>
              <span aria-hidden="true">·</span>
              <span>PR {caseFile.pullRequest}</span>
            </p>
            <Sample>{caseFile.provenance}</Sample>
          </div>
          <p className={styles.heroCaseTitle}>{caseFile.title}</p>
        </header>

        <dl className={styles.heroVerdictBand}>
          <div className={styles.heroVerdictRecommendation}>
            <dt>Lintel recommendation</dt>
            <dd>
              <Chip tone={caseFile.recommendationTone}>{caseFile.recommendation}</Chip>
            </dd>
          </div>
          <div>
            <dt>Risk</dt>
            <dd className={styles.heroVerdictValue}>
              {caseFile.riskScore}/100 <span aria-hidden="true">·</span> {caseFile.riskBand}
            </dd>
          </div>
          <div className={styles.heroVerdictDecision}>
            <dt>Human Decision</dt>
            <dd className={styles.heroVerdictValue}>{caseFile.decisionState}</dd>
          </div>
        </dl>

        <div className={styles.heroRelationship}>
          <section className={styles.heroProofRecord} aria-labelledby="hero-missing-proof-title">
            <p className={styles.heroRecordHead}>
              <span>{caseFile.missingProof.id}</span>
              <span>{caseFile.missingProof.kind}</span>
            </p>
            <h2 id="hero-missing-proof-title" className={styles.heroRecordTitle}>
              {caseFile.missingProof.title}
            </h2>
            <p className={styles.heroRecordState}>
              <Chip tone={caseFile.missingProof.tone}>{caseFile.missingProof.state}</Chip>
            </p>
          </section>

          <div className={styles.heroRelationshipTrace} aria-hidden="true" />

          <section className={styles.heroRequirementRecord} aria-labelledby="hero-requirement-title">
            <p className={styles.heroRecordHead}>
              <span>{caseFile.requirement.id}</span>
              <span>{caseFile.requirement.kind}</span>
            </p>
            <h2 id="hero-requirement-title" className={styles.heroRecordTitle}>
              {caseFile.requirement.title}
            </h2>
            <p className={styles.heroRecordState}>
              <Chip tone={caseFile.requirement.tone}>{caseFile.requirement.state}</Chip>
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
