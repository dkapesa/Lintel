"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";

const NAV_LINKS = [
  { href: "/report?demo=1", label: "Sample report" },
  { href: "/workspace", label: "Workspace" },
  { href: "/docs/security-model.md", label: "Security model" },
] as const;

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { resolvedTheme, setThemePreference } = useTheme();

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
        <button
          className="lp-theme-toggle"
          type="button"
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
          onClick={() => setThemePreference(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <span aria-hidden="true">{resolvedTheme === "dark" ? "☼" : "◐"}</span>
        </button>
        <Link className="lp-btn lp-btn--small" href="/new">Check a pull request</Link>
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
        <Link className="lp-mobile-action lp-btn lp-btn--primary" href="/new" onClick={() => setOpen(false)}>
          Check a pull request
        </Link>
      </nav>
    </header>
  );
}
