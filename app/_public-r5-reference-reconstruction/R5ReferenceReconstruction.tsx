import styles from "./reference-reconstruction.module.css";
import { PublicHeader } from "./components/PublicHeader";
import { HeroReviewScene } from "./components/HeroReviewScene";
import { FindingEvidenceScene } from "./components/FindingEvidenceScene";
import { MissingProofRequirementScene } from "./components/MissingProofRequirementScene";
import { ReadinessDecisionScene } from "./components/ReadinessDecisionScene";
import { TrustSection } from "./components/TrustSection";
import { HandoffSection } from "./components/HandoffSection";
import { PublicFooter } from "./components/PublicFooter";
import {
  ACTIONS,
  FINDING_SECTION,
  HERO,
  HERO_SCENE,
  MISSING_PROOF_SECTION,
  NEW_REVIEW_HREF,
  READINESS_SECTION,
  SAMPLE_REVIEW_HREF,
} from "./reconstruction-content";

/* R5E.1E.2B — reference-led public reconstruction, complete page.

   Server component. The whole page is a plain vertical stack of sections in
   normal document flow: no sticky scene, no fixed shell, no scroll-driven
   state, no overlay. Only the header is sticky.

   Contracts:
     docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md       (composition)
     docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md (first gate, accepted)
     docs/r5/R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md (this milestone)

   Page order (task brief §5): navigation, hero, hero product scene, Finding
   and Evidence, Missing Proof and Requirement, Readiness and Human Decision,
   Trust, unresolved-case handoff, footer. Every section is an independent
   sibling; none reads another section's scroll state. */
export function R5ReferenceReconstruction({
  heroPresentation = "historical-control",
}: {
  heroPresentation?: "historical-control" | "extended-neutral";
} = {}) {
  return (
    <div
      className={`${styles.page} ${
        heroPresentation === "extended-neutral" ? styles.extendedNeutralHierarchy : ""
      }`}
    >
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      <PublicHeader />

      <main id="main" className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.wrap}>
            <div className={styles.heroCopy}>
              <h1 id="hero-heading" className={styles.heroHeadline}>
                {HERO.headline}
              </h1>
              <p className={styles.heroSupporting}>{HERO.supporting}</p>
              <p className={styles.heroActions}>
                <a
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnRegular}`}
                  href={SAMPLE_REVIEW_HREF}
                >
                  {ACTIONS.primary}
                </a>
                <a
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnRegular}`}
                  href={NEW_REVIEW_HREF}
                >
                  {ACTIONS.secondary}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* The hero product scene is its own section so that "Product" has a
            genuine destination and so the scene owns its whitespace rhythm
            independently of the hero copy above it. */}
        <section
          id="product"
          className={styles.heroSceneSection}
          aria-labelledby="hero-scene-heading"
        >
          <div className={styles.wrap}>
            {/* The composition deliberately carries no visible heading here —
                the scene itself is the statement. The heading exists so the
                document outline descends H1 → H2 → H3 without a skip and so
                the section has a real accessible name. */}
            <h2 id="hero-scene-heading" className={styles.visuallyHidden}>
              {HERO_SCENE.label}
            </h2>
            <HeroReviewScene />
            <p className={styles.sceneCaption}>{HERO_SCENE.caption}</p>
          </div>
        </section>

        {/* Desktop: text left, scene right. Mobile: text first, scene second —
            which is already the DOM order, so source order needs no override. */}
        <section
          id={FINDING_SECTION.id}
          className={styles.split}
          aria-labelledby="finding-heading"
        >
          <div className={`${styles.wrap} ${styles.splitGrid}`}>
            <div className={styles.splitCopy}>
              <h2 id="finding-heading" className={styles.sectionHeadline}>
                {FINDING_SECTION.heading}
              </h2>
              <p className={styles.sectionSupporting}>{FINDING_SECTION.supporting}</p>
            </div>
            <div className={styles.splitScene} aria-label={FINDING_SECTION.sceneLabel} role="group">
              <FindingEvidenceScene />
            </div>
          </div>
        </section>

        {/* Desktop: scene left, text right — achieved with grid column
            placement, not by reordering the DOM, so the copy still precedes
            its scene in source order and on mobile. */}
        <section
          id={MISSING_PROOF_SECTION.id}
          className={`${styles.split} ${styles.splitReversed}`}
          aria-labelledby="missing-proof-heading"
        >
          <div className={`${styles.wrap} ${styles.splitGrid}`}>
            <div className={styles.splitCopy}>
              <h2 id="missing-proof-heading" className={styles.sectionHeadline}>
                {MISSING_PROOF_SECTION.heading}
              </h2>
              <p className={styles.sectionSupporting}>{MISSING_PROOF_SECTION.supporting}</p>
            </div>
            <div
              className={styles.splitScene}
              aria-label={MISSING_PROOF_SECTION.sceneLabel}
              role="group"
            >
              <MissingProofRequirementScene />
            </div>
          </div>
        </section>

        {/* Third alternating section: text left, scene right — same side as
            Finding and Evidence, so the rhythm is text/scene, scene/text,
            text/scene rather than a coincidental repeat. */}
        <section
          id={READINESS_SECTION.id}
          className={styles.split}
          aria-labelledby="readiness-heading"
        >
          <div className={`${styles.wrap} ${styles.splitGrid}`}>
            <div className={styles.splitCopy}>
              <h2 id="readiness-heading" className={styles.sectionHeadline}>
                {READINESS_SECTION.heading}
              </h2>
              <p className={styles.sectionSupporting}>{READINESS_SECTION.supporting}</p>
            </div>
            <div
              className={styles.splitScene}
              aria-label={READINESS_SECTION.sceneLabel}
              role="group"
            >
              <ReadinessDecisionScene />
            </div>
          </div>
        </section>

        <TrustSection />
        <HandoffSection />
      </main>

      <PublicFooter />
    </div>
  );
}
