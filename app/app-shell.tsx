"use client";

/* E7.1 — shared application shell for the main Lintel workspace routes.
   One frame: persistent primary navigation (expandable/collapsible on
   desktop, drawer on mobile), a compact top bar with route context and
   route-owned actions, and the main working region. Route bodies render
   unchanged as children. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { findShellRoute, isShellNavItemActive, SHELL_NAV_GROUPS, ShellIcon } from "./nav-config";
import { ThemeControl } from "./theme-provider";
import {
  activeWorkspace,
  ensureWorkspaceStore,
  setActiveWorkspace,
  workspaceLabel,
  WORKSPACE_CHANGED_EVENT,
  type TeamWorkspace,
  type WorkspaceStore,
} from "../lib/team-workspace";

const NAV_COLLAPSE_STORAGE_KEY = "lintel.shell.nav-collapsed.v1";
const MOBILE_NAV_QUERY = "(max-width: 900px)";
const COMPACT_DESKTOP_QUERY = "(min-width: 901px) and (max-width: 1100px)";

type AppShellProps = {
  children: ReactNode;
  /* Overrides the top-bar title when a route has a more specific context
     than its navigation label (e.g. a specific report). */
  title?: string;
  /* Technical context (repository, PR number) rendered as metadata next
     to the title. Mono is applied by the shell. */
  context?: ReactNode;
  /* Route-owned top-bar actions (existing command trigger, copy/export
     controls). The shell provides no actions of its own. */
  actions?: ReactNode;
};

function ShellNav({
  pathname,
  onNavigate,
  id,
}: {
  pathname: string;
  onNavigate?: () => void;
  id?: string;
}) {
  return (
    <nav className="shell-nav" id={id} aria-label="Primary navigation">
      {SHELL_NAV_GROUPS.map((group) => (
        <div className="shell-nav-group" key={group.label}>
          <span className="shell-nav-group-label">{group.label}</span>
          {group.items.map((item) => {
            const active = isShellNavItemActive(item, pathname);
            return (
              <Link
                key={item.href}
                className={active ? "shell-nav-item shell-nav-item--active" : "shell-nav-item"}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
                onClick={onNavigate}
              >
                <ShellIcon name={item.icon} />
                <span className="shell-nav-item-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function ShellLocalNote({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link className="shell-local-note" href="/docs/security-model.md" onClick={onNavigate}>
      Local-first · raw diffs are not stored
    </Link>
  );
}

function WorkspaceSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const [store, setStore] = useState<WorkspaceStore | null>(null);

  useEffect(() => {
    try {
      setStore(ensureWorkspaceStore(window.localStorage));
    } catch {
      setStore(null);
    }

    const onWorkspaceChange = () => {
      try {
        setStore(ensureWorkspaceStore(window.localStorage));
      } catch {
        setStore(null);
      }
    };
    window.addEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChange);
    window.addEventListener("storage", onWorkspaceChange);
    return () => {
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChange);
      window.removeEventListener("storage", onWorkspaceChange);
    };
  }, []);

  const current: TeamWorkspace | null = store ? activeWorkspace(store) : null;
  const workspaces = store?.workspaces.filter((workspace) => workspace.status === "active") ?? [];

  function changeWorkspace(workspaceId: string) {
    try {
      const next = setActiveWorkspace(window.localStorage, workspaceId);
      setStore(next);
      window.dispatchEvent(new Event(WORKSPACE_CHANGED_EVENT));
    } catch {
      // Workspace selection is local-only; failure should not break navigation.
    }
  }

  return (
    <div className="shell-workspace-switcher" aria-label="Active team workspace">
      <label>
        <span>Workspace</span>
        <select
          value={store?.activeWorkspaceId ?? current?.workspaceId ?? ""}
          onChange={(event) => changeWorkspace(event.target.value)}
          aria-label="Select active workspace"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.workspaceId} value={workspace.workspaceId}>{workspace.name}</option>
          ))}
        </select>
      </label>
      <div className="shell-workspace-meta">
        <strong>{current?.name ?? "Local Review Workspace"}</strong>
        <span>{workspaceLabel(current)} · data stored on this device</span>
      </div>
      <Link className="shell-workspace-link" href="/team" onClick={onNavigate}>Team workspace</Link>
    </div>
  );
}

export default function AppShell({ children, title, context, actions }: AppShellProps) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  /* Restore the stored desktop preference; auto-collapse at compact
     desktop widths so route content keeps a usable working area. */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(NAV_COLLAPSE_STORAGE_KEY) === "1") setCollapsed(true);
    } catch {
      /* Preference persistence is optional. */
    }
    const compact = window.matchMedia(COMPACT_DESKTOP_QUERY);
    if (compact.matches) setCollapsed(true);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setCollapsed(true);
    };
    compact.addEventListener("change", onChange);
    return () => compact.removeEventListener("change", onChange);
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(NAV_COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* Preference persistence is optional. */
      }
      return next;
    });
  }

  /* The drawer closes on route change, on Escape, and when the viewport
     leaves mobile widths; focus stays inside while open and returns to
     the menu button on close. */
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    const drawer = drawerRef.current;
    drawer?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const focusable = drawer.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === drawer)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const mobile = window.matchMedia(MOBILE_NAV_QUERY);
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKeyDown, true);
    mobile.addEventListener("change", onViewportChange);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      mobile.removeEventListener("change", onViewportChange);
      document.documentElement.style.overflow = previousOverflow;
      menuButtonRef.current?.focus();
    };
  }, [drawerOpen]);

  const route = findShellRoute(pathname);
  const routeTitle = title ?? route?.item.label ?? "Lintel";
  const groupLabel = route?.group.label;

  return (
    <div className="app-shell shell" data-nav={collapsed ? "collapsed" : "expanded"}>
      <aside className="shell-sidebar">
        <div className="shell-sidebar-top">
          <Link className="shell-brand" href="/" aria-label="Lintel home">
            <span className="brand-mark" aria-hidden="true" />
            <span className="shell-brand-name">Lintel</span>
          </Link>
          <button
            className="shell-collapse-toggle"
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="shell-primary-nav"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {collapsed ? <path d="M6 3.5L10.5 8 6 12.5" /> : <path d="M10 3.5L5.5 8l4.5 4.5" />}
            </svg>
          </button>
        </div>
        <ShellNav pathname={pathname} id="shell-primary-nav" />
        <div className="shell-sidebar-end">
          <WorkspaceSwitcher />
          <ShellLocalNote />
          <div className="shell-account">
            <div className="shell-avatar" aria-hidden="true">N</div>
            <div className="shell-account-meta">
              <strong>Local workspace</strong>
              <span>Responsibility metadata</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="shell-body">
        <header className="shell-topbar">
          <button
            className="shell-menu-button"
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
              <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
            </svg>
          </button>
          <div className="shell-topbar-context">
            {groupLabel && (
              <>
                <span className="shell-topbar-group">{groupLabel}</span>
                <span className="shell-topbar-sep" aria-hidden="true">/</span>
              </>
            )}
            <strong className="shell-topbar-title">{routeTitle}</strong>
            {context && <span className="shell-topbar-meta">{context}</span>}
          </div>
          <div className="shell-topbar-actions"><ThemeControl />{actions}</div>
        </header>
        <main className="shell-main">{children}</main>
      </div>

      {drawerOpen && (
        <div className="shell-drawer-root">
          <div className="shell-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div
            className="shell-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            ref={drawerRef}
            tabIndex={-1}
          >
            <div className="shell-drawer-top">
              <Link className="shell-brand" href="/" aria-label="Lintel home" onClick={() => setDrawerOpen(false)}>
                <span className="brand-mark" aria-hidden="true" />
                <span className="shell-brand-name">Lintel</span>
              </Link>
              <button
                className="shell-drawer-close"
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
            <ShellNav pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            <div className="shell-sidebar-end">
              <WorkspaceSwitcher onNavigate={() => setDrawerOpen(false)} />
              <ShellLocalNote onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
