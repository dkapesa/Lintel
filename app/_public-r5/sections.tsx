import Link from "next/link";
import styles from "./public-r5.module.css";
import { CropFrame, FullScene, type CropRect } from "./components/CropFrame";
import {
  ACTIONS,
  EVIDENCE,
  FINAL,
  HERO,
  MOBILE_SCENES,
  MODEL,
  NEW_REVIEW_HREF,
  PROBLEM,
  READINESS,
  SAMPLE_REVIEW_HREF,
  TRUST,
  TRUST_LINE,
  WORKSPACE,
} from "./content";

/* Non-destructive CSS crop rectangles, in source-pixel space. Scene C's
   rectangle is the exact, human-accepted boundary recorded in
   R5A_VISUAL_CONTEXT_PACKAGE/r5b1-canonical-scenes/R5B1_CAPTURE_MANIFEST.md
   (left 350, top 92, right 1450, bottom 200 of the 1585×991 source). The
   remaining rectangles were not given pixel boundaries by any accepted R5
   document; they were measured directly against the accepted source images
   for sections 2 and 8, which have no dedicated Scene B/H source and reuse
   hero-workspace.png per R5B_LANDING_PAGE_ARCHITECTURE.md §13. Each window
   carries deliberate margin so a small measurement error only shows a
   sliver more surrounding whitespace, never a truncated value. See
   docs/r5/R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md §6. */
const CROP = {
  reviewMapStages: { left: 350, top: 92, right: 1450, bottom: 200 } satisfies CropRect,
  nextInspection: { left: 335, top: 200, right: 1215, bottom: 275 } satisfies CropRect,
  evidenceBoundary: { left: 325, top: 600, right: 790, bottom: 800 } satisfies CropRect,
  handoffRows: { left: 1250, top: 520, right: 1600, bottom: 685 } satisfies CropRect,
  closingRecord: { left: 330, top: 0, right: 1600, bottom: 142 } satisfies CropRect,
  closingRecordMobile: { left: 0, top: 195, right: 390, bottom: 350 } satisfies CropRect,
  /* R5C correction pass: evidence/requirement and decision-flow crops,
     measured directly against the built page via canvas pixel sampling
     (getImageData boundary scans on the served asset), the same measurement
     method already used above, so a compact composition replaces the prior
     full 1600×1000 frames. */
  evidenceState: { left: 0, top: 155, right: 1600, bottom: 755 } satisfies CropRect,
  requirementState: { left: 0, top: 460, right: 1600, bottom: 750 } satisfies CropRect,
  humanDecision: { left: 0, top: 60, right: 1600, bottom: 950 } satisfies CropRect,
};

export function Section1Hero() {
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-title" data-motion-section="hero">
      <div className={styles.editorial}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{HERO.eyebrow}</p>
          <h1 id="hero-title" className={styles.h1}>
            {HERO.headline}
          </h1>
          <p className={styles.supporting}>{HERO.supporting}</p>
          <div className={`${styles.actions} ${styles.heroActions}`}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href={SAMPLE_REVIEW_HREF}>
              {ACTIONS.primary}
            </Link>
            <Link className={`${styles.btn} ${styles.btnSecondary}`} href={NEW_REVIEW_HREF}>
              {ACTIONS.secondary}
            </Link>
          </div>
          <p className={styles.trustLine}>{TRUST_LINE}</p>
        </div>
      </div>
      <div className={`${styles.heroScene} ${styles.motionSlot}`} data-motion-slot="queue-entry">
        <FullScene
          src="/r5/scenes/hero-workspace.jpg"
          alt={HERO.sceneAlt}
          width={1600}
          height={1000}
          className={`${styles.sceneFrame} ${styles.desktopOnly}`}
          priority
          sizes="(min-width: 1440px) 1360px, 92vw"
        />
        <FullScene
          src="/r5/scenes/mobile-queue.jpg"
          alt={MOBILE_SCENES.heroQueueAlt}
          width={390}
          height={843}
          className={`${styles.sceneFrame} ${styles.mobileOnly}`}
          priority
          sizes="92vw"
        />
      </div>
    </section>
  );
}

export function Section2Problem() {
  return (
    <section className={styles.section} aria-labelledby="problem-title">
      <div className={styles.editorial}>
        <div className={styles.problemGrid}>
          <div>
            <p className={styles.eyebrow}>{PROBLEM.eyebrow}</p>
            <h2 id="problem-title" className={styles.h2}>
              {PROBLEM.headline}
            </h2>
            <p className={styles.supporting} style={{ marginBottom: 0 }}>
              {PROBLEM.supporting}
            </p>
          </div>
          <div className={styles.problemFragments}>
            <CropFrame
              src="/r5/scenes/hero-workspace.jpg"
              alt={PROBLEM.nextInspectionAlt}
              fullWidth={1600}
              fullHeight={1000}
              rect={CROP.nextInspection}
              className={styles.sceneFrame}
            />
            <CropFrame
              src="/r5/scenes/hero-workspace.jpg"
              alt={PROBLEM.evidenceBoundaryAlt}
              fullWidth={1600}
              fullHeight={1000}
              rect={CROP.evidenceBoundary}
              className={styles.sceneFrame}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Section3Model() {
  return (
    <section id="verification-model" className={styles.sectionCharcoal} aria-labelledby="model-title">
      <div className={styles.editorial}>
        <p className={styles.eyebrow}>{MODEL.eyebrow}</p>
        <h2 id="model-title" className={styles.h2}>
          {MODEL.headline}
        </h2>
        <p className={styles.supporting}>{MODEL.supporting}</p>

        <div className={styles.modelStages}>
          <ol className={styles.stageList}>
            {MODEL.stages.map((stage) => (
              <li key={stage.no} className={styles.stageRow}>
                <span className={styles.stageNo}>{stage.no}</span>
                <p className={styles.stageName}>{stage.name}</p>
                <p className={styles.stageBody}>{stage.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.orientationBox}>
            <p className={styles.orientationLabel}>
              {MODEL.orientationLabel} · {MODEL.mapLabel}
            </p>
            <p className={styles.orientationCaveat}>{MODEL.orientationCaveat}</p>
          </div>
        </div>
      </div>

      <div className={styles.modelInsetWrap}>
        <div className={styles.modelInsetScroll}>
          <CropFrame
            src="/r5/scenes/review-map.png"
            alt={MODEL.insetAlt}
            fullWidth={1585}
            fullHeight={991}
            rect={CROP.reviewMapStages}
            className={`${styles.sceneFrame} ${styles.modelInsetFrame}`}
          />
        </div>
        <p className={styles.caption}>{MODEL.insetCaption}</p>
        <div className={styles.modelStageIndex} aria-hidden="true">
          {MODEL.stages.map((stage) => (
            <span key={stage.no}>{stage.no}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Section4Workspace() {
  return (
    <section id="investigation-workspace" className={styles.section} aria-labelledby="workspace-title">
      <div className={styles.editorial}>
        <p className={styles.eyebrow}>{WORKSPACE.eyebrow}</p>
        <h2 id="workspace-title" className={styles.h2}>
          {WORKSPACE.headline}
        </h2>
        <p className={styles.supporting}>{WORKSPACE.supporting}</p>
      </div>
      <div className={styles.workspaceSceneWrap}>
        <FullScene
          src="/r5/scenes/workspace-inspector.jpg"
          alt={WORKSPACE.sceneAlt}
          width={1600}
          height={1000}
          className={`${styles.sceneFrame} ${styles.desktopOnly}`}
          sizes="(min-width: 1440px) 1360px, 92vw"
        />
        <FullScene
          src="/r5/scenes/mobile-record.jpg"
          alt={MOBILE_SCENES.workspaceRecordAlt}
          width={390}
          height={843}
          className={`${styles.sceneFrame} ${styles.mobileOnly}`}
          sizes="92vw"
        />
        <p className={styles.caption}>{WORKSPACE.caption}</p>
      </div>
    </section>
  );
}

export function Section5Evidence() {
  return (
    <section className={styles.section} aria-labelledby="evidence-title">
      <div className={styles.editorial}>
        <div className={styles.evidenceGrid}>
          <div className={styles.evidenceCopy}>
            <p className={styles.eyebrow}>{EVIDENCE.eyebrow}</p>
            <h2 id="evidence-title" className={styles.h2}>
              {EVIDENCE.headline}
            </h2>
            <p className={styles.supporting} style={{ marginBottom: 0 }}>
              {EVIDENCE.supporting}
            </p>
          </div>
          <div className={`${styles.evidenceScenes} ${styles.motionSlot}`} data-motion-slot="evidence-to-requirement">
            <CropFrame
              src="/r5/scenes/evidence-missing-proof.jpg"
              alt={EVIDENCE.evidenceSceneAlt}
              fullWidth={1600}
              fullHeight={1000}
              rect={CROP.evidenceState}
              className={`${styles.sceneFrame} ${styles.desktopOnly} ${styles.evidencePrimaryFrame}`}
              motionPart="evidence"
            />
            <CropFrame
              src="/r5/scenes/requirement-continuation.jpg"
              alt={EVIDENCE.requirementSceneAlt}
              fullWidth={1600}
              fullHeight={1000}
              rect={CROP.requirementState}
              className={`${styles.sceneFrame} ${styles.desktopOnly} ${styles.evidenceSecondaryFrame}`}
              motionPart="requirement"
            />
            <p className={`${styles.caption} ${styles.desktopOnly}`}>{EVIDENCE.requirementCaption}</p>
            <FullScene
              src="/r5/scenes/mobile-record.jpg"
              alt={MOBILE_SCENES.evidenceRecordAlt}
              width={390}
              height={843}
              className={`${styles.sceneFrame} ${styles.mobileOnly}`}
              sizes="92vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Section6Readiness() {
  return (
    <section className={styles.section} aria-labelledby="readiness-title">
      <div className={styles.editorial}>
        <p className={styles.eyebrow}>{READINESS.eyebrow}</p>
        <h2 id="readiness-title" className={styles.h2}>
          {READINESS.headline}
        </h2>
        <p className={styles.supporting}>{READINESS.supporting}</p>
      </div>
      <div className={`${styles.readinessSceneWrap} ${styles.motionSlot}`} data-motion-slot="decision-surface-open">
        <CropFrame
          src="/r5/scenes/human-decision-preview.jpg"
          alt={READINESS.sceneAlt}
          fullWidth={1600}
          fullHeight={1000}
          rect={CROP.humanDecision}
          className={styles.sceneFrame}
        />
      </div>
    </section>
  );
}

export function Section7Trust() {
  return (
    <section id="trust-architecture" className={styles.sectionCharcoal} aria-labelledby="trust-title">
      <div className={styles.editorial}>
        <p className={styles.eyebrow}>{TRUST.eyebrow}</p>
        <h2 id="trust-title" className={styles.h2}>
          {TRUST.headline}
        </h2>
        <p className={styles.supporting}>{TRUST.supporting}</p>

        <div className={styles.trustGrid}>
          <ol className={styles.statementList}>
            {TRUST.statements.map((statement) => (
              <li key={statement.no} className={styles.statement}>
                <span className={styles.statementNo}>{statement.no}</span>
                <div>
                  <p className={styles.statementTitle}>{statement.title}</p>
                  <p className={styles.statementBody}>{statement.body}</p>
                  {"provenance" in statement && statement.provenance ? (
                    <p className={`${styles.statementProvenance} ${styles.mono}`}>{statement.provenance}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.trustInset}>
            <CropFrame
              src="/r5/scenes/handoff-boundaries.jpg"
              alt={TRUST.insetAlt}
              fullWidth={1600}
              fullHeight={1000}
              rect={CROP.handoffRows}
              className={`${styles.sceneFrame} ${styles.trustInsetFrame}`}
            />
            <p className={styles.caption}>{TRUST.insetCaption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Section8Final() {
  return (
    <section className={`${styles.section} ${styles.final}`} aria-labelledby="final-title">
      <div className={styles.editorial}>
        <div className={styles.finalInner}>
          <div className={styles.finalCopy}>
            <p className={styles.eyebrow}>{FINAL.eyebrow}</p>
            <h2 id="final-title" className={styles.h2} style={{ maxWidth: "none" }}>
              {FINAL.headline}
            </h2>
            <p className={styles.supporting}>{FINAL.supporting}</p>
          </div>

          <CropFrame
            src="/r5/scenes/hero-workspace.jpg"
            alt={FINAL.sceneAlt}
            fullWidth={1600}
            fullHeight={1000}
            rect={CROP.closingRecord}
            className={`${styles.finalSceneFrame} ${styles.desktopOnly}`}
          />
          <CropFrame
            src="/r5/scenes/mobile-queue.jpg"
            alt={MOBILE_SCENES.finalQueueAlt}
            fullWidth={390}
            fullHeight={843}
            rect={CROP.closingRecordMobile}
            className={`${styles.finalSceneFrame} ${styles.mobileOnly}`}
          />

          <div className={`${styles.actions} ${styles.finalActions}`}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href={SAMPLE_REVIEW_HREF}>
              {ACTIONS.primary}
            </Link>
            <Link className={`${styles.btn} ${styles.btnSecondary}`} href={NEW_REVIEW_HREF}>
              {ACTIONS.secondary}
            </Link>
          </div>
          <p className={styles.finalTrust}>{TRUST_LINE}</p>
        </div>
      </div>
    </section>
  );
}
