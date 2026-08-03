"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../reference-reconstruction.module.css";
import { ACTIONS, NAV_LINKS, ROUTE_HREF, SAMPLE_REVIEW_HREF } from "../reconstruction-content";

/* R5E.1E.2A — compact white navigation, the only sticky element on the route.

   docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md §6 and §16. Follows the
   accepted navigation from app/_public-r5-recalibrated: white, ~62px, sticky
   without becoming a floating capsule, a hairline that appears on scroll
   without changing any box dimension, and active-section indication exposed
   through aria-current rather than colour alone.

   The client boundary is purely progressive enhancement. Without JavaScript
   the header still renders, every destination still resolves, and the only
   loss is the scrolled hairline and the active-link mark.

   R5E.1E.2B adds Trust to NAV_LINKS now that the Trust section exists
   (task brief §8). There is still no hamburger: below 768px the section
   links are removed rather than hidden behind a control with nothing genuine
   to reveal, leaving the wordmark and the one real action. */
export function PublicHeader() {
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
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.headerInner}>
        <a className={styles.brand} href={ROUTE_HREF}>
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

        {/* Two spans, one visible per breakpoint, both hidden from assistive
            technology so the accessible name stays the full label at every
            viewport rather than changing with a media query. */}
        <a
          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnCompact}`}
          href={SAMPLE_REVIEW_HREF}
          aria-label={ACTIONS.primary}
        >
          <span className={styles.navFullLabel} aria-hidden="true">
            {ACTIONS.primary}
          </span>
          <span className={styles.navShortLabel} aria-hidden="true">
            {ACTIONS.primaryShort}
          </span>
        </a>
      </div>
    </header>
  );
}
