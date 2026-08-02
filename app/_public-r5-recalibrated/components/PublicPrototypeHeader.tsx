"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../public-r5-recalibrated.module.css";
import { ACTIONS, NAV_LINKS, SAMPLE_REVIEW_HREF } from "../prototype-content";

/* R5E.1B — sticky, compact, white header.
   docs/r5/R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md §3 locks: white
   background, ~60–64px height, sticky without becoming a floating capsule,
   a fine lower border that appears without changing any box dimension, and
   quiet active-section indication exposed via aria-current rather than
   colour alone.

   This is a small client boundary purely for progressive enhancement: the
   header is fully usable, and every destination resolves, without
   JavaScript. IntersectionObserver (not a scroll listener) drives the
   active-section indication, and it never moves focus or announces on
   every scroll tick, per docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §12
   and the navigation contract §7. */
export function PublicPrototypeHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const linksRef = useRef(NAV_LINKS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = linksRef.current
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveHref(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.headerInner}>
        <a href="/visual-lab/public-r5-recalibrated" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span>Lintel</span>
        </a>
        <nav className={styles.nav} aria-label="Section">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              className={styles.navLink}
              href={link.href}
              aria-current={activeHref === link.href ? "true" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <a
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnCompact}`}
            href={SAMPLE_REVIEW_HREF}
            aria-label={ACTIONS.primaryFull}
          >
            <span className={styles.navFullLabel} aria-hidden="true">
              {ACTIONS.primary}
            </span>
            <span className={styles.navShortLabel} aria-hidden="true">
              Open sample
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
