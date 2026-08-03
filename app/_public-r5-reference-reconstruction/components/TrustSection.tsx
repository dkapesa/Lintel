import styles from "../reference-reconstruction.module.css";
import { TRUST_SECTION } from "../reconstruction-content";

/* R5E.1E.2B — Trust boundary.

   Task brief §8. Deliberately not a product scene: a normal-flow white
   section with one heading, one paragraph, and up to four compact records.
   No compliance claim, no deployment claim, no customer logo, no diagram, no
   roadmap language, no dark background, no second call to action — the brief
   forbids all of these explicitly, and detailed Trust pages remain future
   work. */
export function TrustSection() {
  return (
    <section id={TRUST_SECTION.id} className={styles.plainSection} aria-labelledby="trust-heading">
      <div className={styles.wrap}>
        <h2 id="trust-heading" className={styles.sectionHeadline}>
          {TRUST_SECTION.heading}
        </h2>
        <p className={styles.sectionSupporting}>{TRUST_SECTION.supporting}</p>

        <dl className={styles.trustGrid}>
          {TRUST_SECTION.records.map((record) => (
            <div key={record.label} className={styles.trustRecord}>
              <dt className={styles.microLabel}>{record.label}</dt>
              <dd className={styles.trustDetail}>{record.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
