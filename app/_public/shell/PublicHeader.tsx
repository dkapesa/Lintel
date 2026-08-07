"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  isPublicRouteActive,
  livePrimaryPublicRoutes,
  primaryPublicRoutes,
} from "../routes";
import styles from "./public-shell.module.css";

const SAMPLE_REVIEW_HREF = "/workspace?source=fixture";
const SAMPLE_REVIEW_LABEL = "Open the sample review";

export function PublicHeader() {
  const pathname = usePathname() || "/";
  const hasMobileDisclosure = livePrimaryPublicRoutes.length >= 2;
  const [enhanced, setEnhanced] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousPathname = useRef(pathname);

  useEffect(() => setEnhanced(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      setOpen(false);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  const closeAndRestore = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;

    const firstLink = mobileRef.current?.querySelector<HTMLAnchorElement>("a[href]");
    firstLink?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndRestore();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        mobileRef.current?.querySelectorAll<HTMLElement>(
          'button:not([hidden]), a[href]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !mobileRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [closeAndRestore, open]);

  return (
    <header
      ref={headerRef}
      className={styles.header}
      data-scrolled={scrolled ? "true" : undefined}
      data-disclosure-ready={enhanced && hasMobileDisclosure ? "true" : undefined}
    >
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="Lintel home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span>Lintel</span>
        </Link>

        <nav
          className={styles.desktopNav}
          aria-label="Primary navigation"
          data-public-desktop-nav
        >
          {primaryPublicRoutes.map((route) =>
            route.state === "live" ? (
              <Link
                key={route.id}
                className={styles.navLink}
                href={route.pathname}
                aria-current={isPublicRouteActive(pathname, route) ? "page" : undefined}
              >
                {route.label}
              </Link>
            ) : (
              <span key={route.id} className={styles.navUnavailable}>
                <span>{route.label}</span>
                <span className={styles.unavailableLabel}>Not available</span>
              </span>
            ),
          )}
        </nav>

        <div ref={mobileRef} className={styles.mobileNavigation}>
          {hasMobileDisclosure ? (
            <>
              <button
                ref={toggleRef}
                className={styles.menuButton}
                type="button"
                aria-expanded={open}
                aria-controls="public-mobile-navigation"
                aria-label={open ? "Close primary navigation" : "Open primary navigation"}
                hidden={!enhanced}
                onClick={() => setOpen((current) => !current)}
              >
                <span aria-hidden="true" className={styles.menuGlyph}>
                  <span />
                  <span />
                </span>
              </button>
              {enhanced && open ? (
                <nav
                  id="public-mobile-navigation"
                  className={styles.mobilePanel}
                  aria-label="Mobile primary navigation"
                >
                  {livePrimaryPublicRoutes.map((route) => (
                    <Link
                      key={route.id}
                      className={styles.mobileLink}
                      href={route.pathname}
                      aria-current={isPublicRouteActive(pathname, route) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}
                </nav>
              ) : null}
              <noscript>
                <nav className={styles.noScriptNavigation} aria-label="Primary navigation">
                  {livePrimaryPublicRoutes.map((route) => (
                    <a key={route.id} href={route.pathname}>
                      {route.label}
                    </a>
                  ))}
                </nav>
              </noscript>
            </>
          ) : null}
        </div>

        <Link
          className={styles.primaryAction}
          href={SAMPLE_REVIEW_HREF}
          aria-label={SAMPLE_REVIEW_LABEL}
        >
          <span className={styles.actionFullLabel} aria-hidden="true">
            {SAMPLE_REVIEW_LABEL}
          </span>
          <span className={styles.actionShortLabel} aria-hidden="true">
            Open sample
          </span>
        </Link>
      </div>
    </header>
  );
}
