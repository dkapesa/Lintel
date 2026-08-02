import styles from "./public-r5-recalibrated.module.css";
import { PublicPrototypeHeader } from "./components/PublicPrototypeHeader";
import { LiveReviewStage } from "./components/LiveReviewStage";
import {
  ACTIONS,
  CLOSEOUT,
  HERO,
  HOW_IT_WORKS,
  NAV_LINKS,
  NEW_REVIEW_HREF,
  PROTOTYPE_LABEL,
  SAMPLE_REVIEW_HREF,
  TRUST_LINE,
  TRUST_NOTE,
} from "./prototype-content";

/* R5E.1B — Navigation, Hero and Live Shell Prototype.

   Private, thin implementation for the recalibrated public direction locked
   by the five R5E.1A documents under docs/r5/. This component owns page
   composition; the route wrapper at
   app/visual-lab/public-r5-recalibrated/page.tsx owns only metadata.

   Fully server-rendered except for <LiveReviewStage/>, the one small
   client-owned product stage
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §13). Everything else here
   — navigation destinations, hero copy, the "How it works" and "Trust"
   anchor sections, the closeout actions — is real content with no
   JavaScript dependency, satisfying the no-JavaScript resting state
   required by docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §8b. */
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
              <span className={styles.prototypeLabel}>{PROTOTYPE_LABEL}</span>
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

            <div className={styles.stageSection}>
              <LiveReviewStage />
            </div>
          </div>
        </section>

        <section className={styles.section} id="how-it-works">
          <div className={styles.wrap}>
            <div className={styles.sectionCopy}>
              <h2 className={styles.sectionHeadline}>{HOW_IT_WORKS.headline}</h2>
              <p className={styles.sectionSupporting}>{HOW_IT_WORKS.supporting}</p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="trust">
          <div className={styles.wrap}>
            <div className={styles.sectionCopy}>
              <h2 className={styles.sectionHeadline}>{TRUST_NOTE.headline}</h2>
              <p className={styles.sectionSupporting}>{TRUST_NOTE.supporting}</p>
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
