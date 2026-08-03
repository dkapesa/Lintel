import styles from "./public-r5-recalibrated.module.css";
import { PublicPrototypeHeader } from "./components/PublicPrototypeHeader";
import { LiveReviewStage } from "./components/LiveReviewStage";
import { VerificationJourneyNarrative } from "./components/VerificationJourneyNarrative";
import { CANONICAL_REVIEW } from "./canonical-review";
import {
  ACTIONS,
  CLOSEOUT,
  HERO,
  NAV_LINKS,
  NEW_REVIEW_HREF,
  SAMPLE_REVIEW_HREF,
  TRUST_BOUNDARY,
  TRUST_LINE,
  UNRESOLVED_HANDOFF,
} from "./prototype-content";

/* R5E.1E — Full Private Public Experience Assembly.

   Assembles the five accepted movements (R5E.1B navigation/hero/shell,
   R5E.1C verification journey, R5E.1D readiness/Human Decision/trust/
   handoff) into one page composition. Private, thin implementation for the
   recalibrated public direction locked by the five R5E1A documents under
   docs/r5/. This component owns page composition; the route wrapper at
   app/visual-lab/public-r5-recalibrated/page.tsx owns only metadata.

   Fully server-rendered except for <LiveReviewStage/>, the one small
   client-owned product stage
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §13). Everything else here
   — navigation destinations, hero copy, the movement-two through
   movement-five narrative (verification journey, accountable decision,
   trust boundary, unresolved-case handoff), the closeout actions — is real
   content with no JavaScript dependency, satisfying the no-JavaScript
   resting state required by
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §8b.

   R5E.1C layout: hero copy, then the shell (position: sticky at
   1024px+, static below it — see §15/§19 of
   docs/r5/R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md), then the narrative.
   Shell and narrative share one parent (`.journeyColumn`) so the sticky
   shell remains pinned near the top of the viewport for the full height of
   the narrative that follows it in the same column, releasing naturally
   once the narrative ends — one persistent shell, no duplicated DOM, no
   narrow sidebar squeeze on the shell's own four-region grid
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §10, movement three: "One
   persistent shell follows Finding → Evidence → Missing proof →
   Requirement → Affected context → Readiness"). */
export function R5RecalibratedPrototype() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <PublicPrototypeHeader />
      <main id="main">
        <section className={styles.hero} id="product">
          <div className={styles.wrap}>
            <div className={styles.heroCopy}>
              <h1 className={styles.heroHeadline}>{HERO.headline}</h1>
              <p className={styles.heroSupporting}>{HERO.supporting}</p>
              <div className={styles.heroActions}>
                <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnRegular}`} href={SAMPLE_REVIEW_HREF}>
                  {ACTIONS.primary}
                </a>
                <a className={`${styles.btn} ${styles.btnSecondary} ${styles.btnRegular}`} href={NEW_REVIEW_HREF}>
                  {ACTIONS.secondary}
                </a>
              </div>
              <p className={styles.trustLine}>{TRUST_LINE}</p>
            </div>

            <div className={styles.journeyColumn}>
              <div className={styles.stageSticky}>
                <LiveReviewStage />
              </div>
              <VerificationJourneyNarrative />
            </div>
          </div>
        </section>

        <section className={styles.section} id="trust">
          <div className={styles.wrap}>
            <div className={styles.sectionCopy}>
              <h2 className={styles.sectionHeadline}>{TRUST_BOUNDARY.headline}</h2>
              <p className={styles.sectionSupporting}>{TRUST_BOUNDARY.supporting}</p>
            </div>
            <ul className={styles.trustRecordList}>
              {TRUST_BOUNDARY.records.map((record) => (
                <li key={record.label} className={styles.trustRecordRow}>
                  <span className={styles.trustRecordLabel}>{record.label}</span>
                  <span className={styles.trustRecordDetail}>{record.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section} id="unresolved-case">
          <div className={styles.wrap}>
            <div className={styles.handoffCard}>
              <div className={styles.handoffContext}>
                <span className={styles.handoffEyebrow}>{UNRESOLVED_HANDOFF.eyebrow}</span>
                <p className={styles.handoffRepoLine}>
                  {CANONICAL_REVIEW.repository} · {CANONICAL_REVIEW.pullRequestLabel}
                </p>
                <h2 className={styles.sectionHeadline}>{UNRESOLVED_HANDOFF.headline}</h2>
                <p className={styles.sectionSupporting}>{UNRESOLVED_HANDOFF.supporting}</p>
                <div className={styles.handoffRecordRow}>
                  <span>{CANONICAL_REVIEW.recommendation}</span>
                  <span>{CANONICAL_REVIEW.riskLabel}</span>
                  <span>{CANONICAL_REVIEW.requirementsSummary}</span>
                  <span>Human Decision {CANONICAL_REVIEW.humanDecision}</span>
                </div>
              </div>
              <div className={styles.heroActions}>
                <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnRegular}`} href={SAMPLE_REVIEW_HREF}>
                  {ACTIONS.primary}
                </a>
                <a className={`${styles.btn} ${styles.btnSecondary} ${styles.btnRegular}`} href={NEW_REVIEW_HREF}>
                  {ACTIONS.secondary}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerInner}>
            <div>
              <span className={styles.brand}>
                <span className={styles.brandMark} aria-hidden="true" />
                <span>Lintel</span>
              </span>
              <p className={styles.footerBrandLine}>{CLOSEOUT.supporting}</p>
              <div className={styles.heroActions}>
                <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnCompact}`} href={SAMPLE_REVIEW_HREF}>
                  {ACTIONS.primary}
                </a>
                <a className={`${styles.btn} ${styles.btnSecondary} ${styles.btnCompact}`} href={NEW_REVIEW_HREF}>
                  {ACTIONS.secondary}
                </a>
              </div>
            </div>
            <ul className={styles.footerLinks}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a className={styles.footerLink} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.footerLegal}>
            <span>{CLOSEOUT.legal}</span>
            <span>{CLOSEOUT.boundary}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
