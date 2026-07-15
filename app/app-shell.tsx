"use client";

/* LVOS-2 — definitive authenticated application shell.
   Wide desktop keeps the 56px global rail and 220px contextual navigation
   structurally separate. Intermediate widths retain the rail and move only
   contextual navigation into a drawer. Mobile uses one combined drawer.
   Route bodies remain unchanged children below the 52px command bar. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  findShellArea,
  findShellRoute,
  isShellAreaActive,
  isShellContextDestinationActive,
  SHELL_CONTEXT_DESTINATIONS,
  SHELL_GLOBAL_AREAS,
  ShellIcon,
  type ShellRouteContext,
} from "./nav-config";
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

const MOBILE_QUERY = "(max-width: 899px)";
const DRAWER_QUERY = "(max-width: 1179px)";
export const SHELL_NAVIGATION_OPEN_EVENT = "lintel:shell-navigation-open";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  context?: ReactNode;
  contextTone?: "support" | "technical";
  actions?: ReactNode;
};

function RailTooltip({ id, children }: { id: string; children: ReactNode }) {
  return <span className="shell-rail-tooltip" id={id} role="tooltip">{children}</span>;
}

function GlobalNavigation({ route, onNavigate }: { route: ShellRouteContext; onNavigate?: () => void }) {
  return (
    <nav className="shell-global-navigation" aria-label="Primary navigation">
      {SHELL_GLOBAL_AREAS.map((area) => {
        const active = isShellAreaActive(area, route);
        const tooltipId = `shell-area-${area.id}-tooltip`;
        return (
          <Link
            className={active ? "shell-global-link shell-global-link--active" : "shell-global-link"}
            href={area.href}
            aria-current={active ? "page" : undefined}
            aria-label={area.label}
            aria-describedby={tooltipId}
            key={area.id}
            onClick={onNavigate}
          >
            <ShellIcon name={area.icon} />
            <span className="shell-global-link-label">{area.label}</span>
            <RailTooltip id={tooltipId}>{area.label}</RailTooltip>
          </Link>
        );
      })}
    </nav>
  );
}

function ContextNavigation({ route, onNavigate }: { route: ShellRouteContext; onNavigate?: () => void }) {
  const area = findShellArea(route.area);
  const destinations = SHELL_CONTEXT_DESTINATIONS[route.area];

  return (
    <div className="shell-context-navigation-content">
      <div className="shell-context-identity">
        <span>Current area</span>
        <strong>{area.label}</strong>
      </div>
      <nav className="shell-context-links" aria-label={`${area.label} navigation`}>
        <span className="shell-context-group-label">Destinations</span>
        {destinations.map((destination) => {
          const active = isShellContextDestinationActive(destination, route);
          return (
            <Link
              className={active ? "shell-context-link shell-context-link--active" : "shell-context-link"}
              href={destination.href}
              aria-current={active ? "page" : undefined}
              key={`${route.area}-${destination.pathname}`}
              onClick={onNavigate}
            >
              <span>{destination.label}</span>
              {active && <span className="shell-context-current" aria-hidden="true">Current</span>}
            </Link>
          );
        })}
      </nav>
    </div>
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
    const readWorkspace = () => {
      try {
        setStore(ensureWorkspaceStore(window.localStorage));
      } catch {
        setStore(null);
      }
    };

    readWorkspace();
    window.addEventListener(WORKSPACE_CHANGED_EVENT, readWorkspace);
    window.addEventListener("storage", readWorkspace);
    return () => {
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, readWorkspace);
      window.removeEventListener("storage", readWorkspace);
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
      // Workspace selection is local-only; failure must not break navigation.
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

function GlobalRail({ route }: { route: ShellRouteContext }) {
  return (
    <aside className="shell-global-rail" aria-label="Global product areas">
      <Link className="shell-brand-mark" href="/" aria-label="Lintel home">
        <span className="brand-mark" aria-hidden="true" />
      </Link>
      <GlobalNavigation route={route} />
      <Link
        className="shell-account-control"
        href="/team"
        aria-label="Open team workspace and account controls"
        aria-describedby="shell-account-tooltip"
      >
        <span className="shell-avatar" aria-hidden="true">N</span>
        <RailTooltip id="shell-account-tooltip">Team workspace</RailTooltip>
      </Link>
    </aside>
  );
}

type CommandActionEntry = {
  key: string;
  node: ReactNode;
  metadata: boolean;
  destructive: boolean;
  visibleOnWideDesktop: boolean;
};

function CommandActionOverflow({
  route,
  actions,
  closeSignal,
}: {
  route: ShellRouteContext;
  actions?: ReactNode;
  closeSignal: number;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const suppliedActions = Children.toArray(actions);
  const entries: CommandActionEntry[] = [
    ...suppliedActions.map((node, index) => ({
      key: `route-action-${index}`,
      node,
      metadata: route.commandActions.metadataActionIndexes.includes(index),
      destructive: route.commandActions.destructiveActionIndexes.includes(index),
      visibleOnWideDesktop: route.commandActions.visibleDesktopActionIndexes.includes(index),
    })),
    ...route.secondaryActions.map((action) => ({
      key: `shell-action-${action.href}`,
      node: <Link className="shell-command-link" href={action.href}>{action.label}</Link>,
      metadata: false,
      destructive: false,
      visibleOnWideDesktop: true,
    })),
  ];
  const wideOverflowEntries = entries.filter((entry) => !entry.metadata && !entry.visibleOnWideDesktop);
  const hasActions = entries.length > 0;

  function closeMenu(returnFocus = false) {
    setOpen(false);
    if (returnFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    setOpen(false);
  }, [closeSignal, route.pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) closeMenu();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  if (!hasActions) return null;

  return (
    <div className={wideOverflowEntries.length === 0 ? "shell-command-overflow shell-command-overflow--wide-empty" : "shell-command-overflow"}>
      <div className="shell-command-wide-actions" aria-label="Visible route actions">
        {entries.filter((entry) => entry.metadata || entry.visibleOnWideDesktop).map((entry) => (
          <div className={entry.metadata ? "shell-command-action shell-command-action--metadata" : "shell-command-action"} key={entry.key}>
            {entry.node}
          </div>
        ))}
      </div>
      <button
        className="shell-command-overflow-trigger"
        ref={triggerRef}
        type="button"
        aria-label={route.commandActions.overflowLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">•••</span>
      </button>
      {open && (
        <div className="shell-command-overflow-menu" ref={menuRef} id={menuId} aria-label={route.commandActions.overflowLabel}>
          <ul className="shell-command-overflow-list shell-command-overflow-list--wide">
            {wideOverflowEntries.map((entry) => (
              <li className={entry.destructive ? "shell-command-overflow-item shell-command-overflow-item--destructive" : "shell-command-overflow-item"} key={entry.key} onClick={() => closeMenu()}>
                {entry.node}
              </li>
            ))}
          </ul>
          <ul className="shell-command-overflow-list shell-command-overflow-list--compact">
            {entries.map((entry) => (
              <li className={`${entry.metadata ? "shell-command-overflow-item shell-command-overflow-item--metadata" : "shell-command-overflow-item"}${entry.destructive ? " shell-command-overflow-item--destructive" : ""}`} key={entry.key} onClick={() => closeMenu()}>
                {entry.node}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AppShell({
  children,
  title,
  context,
  contextTone = "support",
  actions,
}: AppShellProps) {
  const pathname = usePathname() ?? "";
  const route = findShellRoute(pathname) ?? findShellRoute("/workspace")!;
  const area = findShellArea(route.area);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandMenuCloseSignal, setCommandMenuCloseSignal] = useState(0);
  const [mobile, setMobile] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const mobileMedia = window.matchMedia(MOBILE_QUERY);
    const updateMobile = () => setMobile(mobileMedia.matches);
    updateMobile();
    mobileMedia.addEventListener("change", updateMobile);
    return () => mobileMedia.removeEventListener("change", updateMobile);
  }, []);

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
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
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

    const drawerMedia = window.matchMedia(DRAWER_QUERY);
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKeyDown, true);
    drawerMedia.addEventListener("change", onViewportChange);
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      drawerMedia.removeEventListener("change", onViewportChange);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      menuButtonRef.current?.focus();
    };
  }, [drawerOpen]);

  const routeTitle = title ?? route.contextLabel;
  const triggerLabel = mobile ? "Open navigation" : `Open ${area.label} navigation`;

  function openNavigation() {
    setCommandMenuCloseSignal((current) => current + 1);
    window.dispatchEvent(new Event(SHELL_NAVIGATION_OPEN_EVENT));
    window.requestAnimationFrame(() => setDrawerOpen(true));
  }

  return (
    <div className="app-shell shell">
      <div className="shell-frame" aria-hidden={drawerOpen ? true : undefined} inert={drawerOpen ? true : undefined}>
        <GlobalRail route={route} />

        <aside className="shell-context-navigation" aria-label={`${area.label} contextual navigation`}>
          <ContextNavigation route={route} />
          <div className="shell-context-footer">
            <WorkspaceSwitcher />
            <ShellLocalNote />
          </div>
        </aside>

        <div className="shell-body">
          <header className="shell-command-bar" role="banner" aria-label="Application command bar">
            <button
              className="shell-navigation-trigger"
              ref={menuButtonRef}
              type="button"
              onClick={openNavigation}
              aria-label={triggerLabel}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
              </svg>
            </button>

            <div className="shell-command-context" aria-label={`Current location: ${area.label}, ${routeTitle}`}>
              <span className="shell-command-area">{area.label}</span>
              <span className="shell-command-separator" aria-hidden="true">/</span>
              <strong className="shell-command-title">{routeTitle}</strong>
              {context && (
                <span className={`shell-command-meta shell-command-meta--${contextTone}`}>{context}</span>
              )}
            </div>

            <div className="shell-command-actions" aria-label="Command bar actions">
              {route.primaryAction && (
                <Link className="shell-command-link shell-command-link--primary" href={route.primaryAction.href}>
                  {route.primaryAction.label}
                </Link>
              )}
              <CommandActionOverflow route={route} actions={actions} closeSignal={commandMenuCloseSignal} />
              <ThemeControl />
            </div>
          </header>
          <main className="shell-main" aria-label={route.accessiblePageName}>{children}</main>
        </div>
      </div>

      {drawerOpen && (
        <div className="shell-navigation-drawer-root" data-mode={mobile ? "combined" : "contextual"}>
          <button
            className="shell-navigation-backdrop"
            type="button"
            tabIndex={-1}
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="shell-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={mobile ? "Application navigation" : `${area.label} navigation`}
            ref={drawerRef}
            tabIndex={-1}
          >
            <div className="shell-drawer-header">
              <Link className="shell-drawer-brand" href="/" aria-label="Lintel home" onClick={() => setDrawerOpen(false)}>
                <span className="brand-mark" aria-hidden="true" />
                <span>Lintel</span>
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

            <div className="shell-drawer-global">
              <span className="shell-context-group-label">Product areas</span>
              <GlobalNavigation route={route} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="shell-drawer-context">
              <ContextNavigation route={route} onNavigate={() => setDrawerOpen(false)} />
            </div>

            <div className="shell-drawer-footer">
              <WorkspaceSwitcher onNavigate={() => setDrawerOpen(false)} />
              <ThemeControl />
              <ShellLocalNote onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
