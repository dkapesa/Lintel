import type { ReactNode } from "react";
import styles from "./landing.module.css";

/* R3E.1 — the page's five narrative acts.

   A transparent grouping element, not a landmark. It carries no ARIA and no
   heading of its own, so the document's landmark and heading structure is
   exactly what it was: one `main`, one `h1`, one `h2` per section.

   Its only job is vertical rhythm. Sections inside an act sit closer to one
   another than acts do to each other, which is what makes five chapters
   legible without ever printing the word "act" on the page.

     1  The promise         hero
     2  The verification gap
     3  The product         five-stage register → interactive theatre
     4  Accountable decisions  evolution → recommendation vs decision → GitHub
     5  Trust and action    trust → final CTA (footer follows) */

const ACT_CLASS = {
  1: styles.act1,
  2: styles.act2,
  3: styles.act3,
  4: styles.act4,
  5: styles.act5,
} as const;

export type ActNumber = keyof typeof ACT_CLASS;

export default function Act({ n, children }: { n: ActNumber; children: ReactNode }) {
  return (
    <div className={`${styles.act} ${ACT_CLASS[n]}`} data-act={n}>
      {children}
    </div>
  );
}
