import styles from "./public-r5.module.css";
import { PublicR5Header } from "./components/PublicR5Header";
import { PublicR5Footer } from "./components/PublicR5Footer";
import { MotionController } from "./components/MotionController";
import {
  Section1Hero,
  Section2Problem,
  Section3Model,
  Section4Workspace,
  Section5Evidence,
  Section6Readiness,
  Section7Trust,
  Section8Final,
} from "./sections";

/* R5D — shared accepted R5 public experience.

   Single source of truth for page composition, content, header, footer,
   product scenes and crop treatment, rendered by both the production
   homepage (app/page.tsx) and the private visual laboratory
   (app/visual-lab/public-r5/page.tsx). The two routes differ only in
   route-level metadata and indexing rules; this component and everything it
   imports carries no route-specific behaviour. Living under app/_public-r5
   (a Next.js private folder, excluded from routing by its leading
   underscore) keeps it out of the route tree entirely.

   R5D: fully server-rendered, no client component, no JavaScript required.

   R5E adds exactly one client boundary, <MotionController />, which owns
   the three accepted motion moments (queue-entry, evidence-to-requirement,
   decision-surface-open). It renders no markup of its own and never gates
   this tree's server-rendered visibility; see
   docs/r5/R5E_PUBLIC_MOTION_SYSTEM.md and
   docs/r5/R5D_PRODUCTION_HOMEPAGE_TRANSFER.md. */

export function PublicR5Page() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <PublicR5Header />
      <main id="main">
        <Section1Hero />
        <Section2Problem />
        <Section3Model />
        <Section4Workspace />
        <Section5Evidence />
        <Section6Readiness />
        <Section7Trust />
        <Section8Final />
      </main>
      <PublicR5Footer />
      <MotionController />
    </div>
  );
}
