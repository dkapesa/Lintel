import Link from "next/link";
import styles from "../public-r5.module.css";
import { ACTIONS, NAV_LINKS, SAMPLE_REVIEW_HREF } from "../content";

/* Static header, per R5B_LANDING_PAGE_ARCHITECTURE.md §3e: not fixed, not
   sticky, scrolls away with the page. Below the mobile navigation
   breakpoint the three anchor labels are omitted; identity and the compact
   primary action remain, with no menu drawer. */
export function PublicR5Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/visual-lab/public-r5" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span>Lintel</span>
        </Link>
        <nav className={styles.nav} aria-label="Section">
          {NAV_LINKS.map((link) => (
            <a key={link.href} className={styles.navLink} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.btnCompact}`} href={SAMPLE_REVIEW_HREF}>
            {ACTIONS.primary}
          </Link>
        </div>
      </div>
    </header>
  );
}
