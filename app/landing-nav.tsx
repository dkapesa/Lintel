"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./landing/landing.module.css";

/* R3D — public landing navigation (R3B §7.1).

   Locked destinations, one primary action, no theme toggle, no sign-in, no
   pricing, no dropdown. The four in-page anchors resolve to real sections on
   this page; the single action is a real route. */

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#principles", label: "Principles" },
  { href: "#github", label: "GitHub" },
] as const;

const ACTION = { href: "/new", label: "Review a pull request" } as const;

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* While the menu is open: Escape closes and restores focus to the toggle,
     Tab is kept inside the menu, and focus starts on the first item. */
  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const menu = menuRef.current;
      if (!menu) return;
      const focusable = Array.from(menu.querySelectorAll<HTMLElement>("a[href]"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === toggleRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        <Link className={styles.brand} href="/" aria-label="Lintel home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span>Lintel</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} href={ACTION.href}>
            {ACTION.label}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.navToggle}
            aria-expanded={open}
            aria-controls="lnd-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav ref={menuRef} id="lnd-menu" className={styles.navMenu} aria-label="Primary" hidden={!open}>
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
        <Link
          className={`${styles.btn} ${styles.btnPrimary} ${styles.navMenuAction}`}
          href={ACTION.href}
          onClick={() => setOpen(false)}
        >
          {ACTION.label}
        </Link>
      </nav>
    </header>
  );
}
