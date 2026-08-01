import styles from "../public-r5.module.css";
import { FOOTER, NAV_LINKS, TRUST_LINE } from "../content";

/* Minimal, honest footer, per R5B_LANDING_PAGE_ARCHITECTURE.md §3g: identity,
   one trust line, the same three on-page anchors, a legal line. No
   newsletter, no sitemap of pages that do not exist, no status claim. */
export function PublicR5Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.editorial}>
        <div className={styles.footerInner}>
          <div>
            <span className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true" />
              <span>Lintel</span>
            </span>
            <p className={styles.footerBrandLine}>{FOOTER.brandLine}</p>
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
          <span>{FOOTER.legal}</span>
          <span>{TRUST_LINE}</span>
          <span>{FOOTER.storageLine}</span>
        </div>
      </div>
    </footer>
  );
}
