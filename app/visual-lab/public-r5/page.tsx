import type { Metadata } from "next";
import styles from "./public-r5.module.css";
import { PublicR5Header } from "./components/PublicR5Header";
import { PublicR5Footer } from "./components/PublicR5Footer";
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

/* R5C — private public visual laboratory.

   Isolated, unlinked internal surface following the app/visual-lab
   precedent (see app/visual-lab/landing-v3, app/visual-lab/workspace-r4): a
   server component that emits noindex metadata, renders no AppShell, is not
   registered in app/nav-config.tsx, and is not imported by app/page.tsx or
   any production route. Fully server-rendered; no client component exists
   in this route, because R5C's static motion states (§9 of the R5C brief)
   require no observer, no hydration boundary and no JavaScript to be
   completely readable. */

export const metadata: Metadata = {
  title: "Public R5 visual lab — Lintel",
  description: "Private R5C visual laboratory for the accepted public homepage direction.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PublicR5LabPage() {
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
    </div>
  );
}
