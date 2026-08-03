import styles from "../reference-reconstruction.module.css";
import { FOOTER, ROUTE_HREF } from "../reconstruction-content";

/* R5E.1E.2B — restrained footer.

   Task brief §10. Identity, one purpose statement, the three genuine section
   links, copyright and the private-lab note. Does not repeat the handoff
   explanation, the primary actions, the hero copy, or a second conversion
   panel — those already exist above, once each. No fake public routes: every
   link here already resolves elsewhere on this page. */
export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <a className={styles.brand} href={ROUTE_HREF}>
              <span className={styles.brandMark} aria-hidden="true" />
              <span>Lintel</span>
            </a>
            <p className={styles.footerPurpose}>{FOOTER.purpose}</p>
          </div>

          <nav className={styles.footerNav} aria-label="Footer">
            <a href="#product">Product</a>
            <a href="#how-it-works">How it works</a>
            <a href="#trust">Trust</a>
          </nav>
        </div>

        <div className={styles.footerBottom}>
          <span>{FOOTER.legal}</span>
          <span>{FOOTER.boundary}</span>
        </div>
      </div>
    </footer>
  );
}
