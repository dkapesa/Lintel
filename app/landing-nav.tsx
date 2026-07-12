"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/workspace", label: "Risk inbox" },
  { href: "/review-operations", label: "Review operations" },
  { href: "/docs/security-model.md", label: "Security model" },
] as const;

/* W1 landing header. Desktop shows inline links; below 680px they move into a
   small disclosure menu with button semantics, Escape-to-close and 44px+ targets. */
export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="lp-nav">
      <Link className="lp-brand" href="/" aria-label="Lintel home">
        <span className="brand-mark" aria-hidden="true" />
        <span>Lintel</span>
      </Link>
      <nav className="lp-nav-links" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>
      <div className="lp-nav-cta">
        <Link className="lp-btn lp-btn--small" href="/new">Review a pull request</Link>
        <button
          ref={toggleRef}
          type="button"
          className="lp-nav-toggle"
          aria-expanded={open}
          aria-controls="lp-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      <nav id="lp-mobile-menu" className="lp-mobile-menu" aria-label="Primary" hidden={!open}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
        ))}
      </nav>
    </header>
  );
}
