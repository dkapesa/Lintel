import type { Metadata } from "next";
import styles from "./surface-comparison.module.css";
import { SURFACE_VARIANTS, surfaceVariantHref } from "./variants";

export const metadata: Metadata = {
  title: "Private surface comparison laboratory — Lintel",
  description:
    "Private Phase 7.1C laboratory comparing the accepted neutral plate, the extended neutral band, and the retained B2 and C2 diagnostics.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PublicR5SurfaceComparisonIndexPage() {
  return (
    <main className={styles.indexPage}>
      <div className={styles.indexContent}>
        <p className={styles.indexEyebrow}>Private · non-production-facing · Phase 7.1C</p>
        <h1>Private surface comparison laboratory</h1>
        <p className={styles.indexIntro}>
          Four isolated routes compare the accepted live Hero without duplicating its interaction
          authority. Extended neutral is the current Gate 1 leader; this laboratory asks whether
          genuine interaction and choreography change that static-board result.
        </p>

        <p className={styles.indexNotice}>
          B2 is experimental, private and non-shippable. C2 is conditional and not selected. The
          extended-band dimensions are laboratory values, not frozen production dimensions. This
          route family is unlinked from production and from the accepted reconstruction.
        </p>

        <div className={styles.indexGrid} aria-label="Surface comparison configurations">
          {SURFACE_VARIANTS.map((variant) => (
            <a key={variant.id} className={styles.indexCard} href={surfaceVariantHref(variant.id)}>
              <span className={styles.indexCardName}>{variant.name}</span>
              <span className={styles.indexCardStatus}>{variant.status}</span>
              <span className={styles.indexCardSummary}>{variant.summary}</span>
            </a>
          ))}
        </div>

        <section className={styles.reviewSteps} aria-labelledby="review-steps-heading">
          <h2 id="review-steps-heading">Concise review method</h2>
          <ol>
            <li>Open every isolated route in its own tab at the same viewport and zoom.</li>
            <li>Reload immediately before comparison and allow H1–H3 to complete.</li>
            <li>Activate Finding and Readiness once, then compare selected-state visibility.</li>
            <li>Compare neutral 26 with extended neutral before comparing B2 and C2.</li>
            <li>Repeat at 390×844 without cropping away genuine diagnostic degradation.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}

