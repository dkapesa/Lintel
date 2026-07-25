"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./landing-v3.module.css";

/* R3C — public navigation lab (R3B §7.1).

   Locked destinations, one primary action, no theme toggle, no sign-in, no
   pricing, no dropdown. The lab uses in-page anchors and inert action hrefs so
   the lab never navigates into production routes; the labels and hierarchy are
   the ones R3D ships. */

const LINKS = [
  { href: "#lv3-theatre", label: "Product" },
  { href: "#lv3-chain", label: "How it works" },
  { href: "#lv3-principles", label: "Principles" },
  { href: "#lv3-github", label: "GitHub" },
] as const;

export default function LabNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        <a className={styles.brand} href="#lv3-top" aria-label="Lintel home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span>Lintel</span>
        </a>

        <nav className={styles.navLinks} aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} href="#lv3-final">
            Review a pull request
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={styles.navToggle}
            aria-expanded={open}
            aria-controls="lv3-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav id="lv3-menu" className={styles.navMenu} aria-label="Primary" hidden={!open}>
        {LINKS.map((link, index) => (
          <a
            key={link.href}
            ref={index === 0 ? firstItemRef : undefined}
            href={link.href}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          className={`${styles.btn} ${styles.btnPrimary} ${styles.navMenuAction}`}
          href="#lv3-final"
          onClick={() => setOpen(false)}
        >
          Review a pull request
        </a>
      </nav>
    </header>
  );
}
