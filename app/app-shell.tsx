"use client";

/* R2B — authoritative logged-in application shell.
   Four structural regions: a 56px global product rail (five areas), a
   contextual navigation column that expands (≈220px) or collapses to a compact
   icon rail (≈64px) at wide desktop, a 52px command bar, and the route body.
   Intermediate widths move contextual navigation into a drawer; mobile uses one
   combined drawer. The Workspace renders full-bleed OUTSIDE this shell.
   Logged-in routes are locked to one authoritative dark theme. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Children,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  findShellArea,
  findShellRoute,
  isShellAreaActive,
  isShellContextDestinationActive,
  SHELL_GLOBAL_AREAS,
  SHELL_ROUTE_CONTEXTS,
  ShellIcon,
  visibleShellContextDestinations,
  type ShellGlobalArea,
  type ShellRouteContext,
} from "./nav-config";
import { useTheme } from "./theme-provider";
import {
  readWorkspaceReturnContext,
  workspaceReturnHref,
  type WorkspaceReturnContext,
} from "./workspace-return-context";
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
const DRAWER_FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
export const SHELL_NAVIGATION_OPEN_EVENT = "lintel:shell-navigation-open";

/* SSR-safe layout effect: the dark-theme lock must apply before paint on the
   client, without emitting a useLayoutEffect warning during server rendering. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

function LocalWorkspaceGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="3.25" width="11" height="7.5" rx="1" />
      <path d="M5.75 13.25h4.5M8 10.75v2.5" />
    </svg>
  );
}

function CollapseGlyph({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {collapsed
        ? <path d="M6 3.5l4.5 4.5L6 12.5" />
        : <path d="M10 3.5L5.5 8l4.5 4.5" />}
    </svg>
  );
}

function GlobalNavigation({ route, onNavigate }: { route: ShellRouteContext; onNavigate?: () => void }) {
  return (
    <nav className="shell-global-navigation" aria-label="Product areas">
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

function DestinationList({
  route,
  navId,
  compact,
  onNavigate,
}: {
  route: ShellRouteContext;
  navId: string;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const area = findShellArea(route.area);
  const destinations = visibleShellContextDestinations(route);

  return (
    <nav
      className={compact ? "shell-context-links shell-context-links--compact" : "shell-context-links"}
      id={navId}
      aria-label={`${area.label} destinations`}
    >
      {!compact && <span className="shell-context-group-label">Destinations</span>}
      {destinations.map((destination) => {
        const active = isShellContextDestinationActive(destination, route);
        const tooltipId = compact ? `shell-dest-${destination.id}-tooltip` : undefined;
        return (
          <Link
            className={active ? "shell-context-link shell-context-link--active" : "shell-context-link"}
            href={destination.href}
            aria-current={active ? "page" : undefined}
            aria-label={compact ? destination.label : undefined}
            aria-describedby={tooltipId}
            key={`${route.area}-${destination.id}`}
            onClick={onNavigate}
          >
            <span className="shell-context-link-icon" aria-hidden="true">
              <ShellIcon name={destination.icon} />
            </span>
            {compact ? (
              <RailTooltip id={tooltipId!}>{destination.label}</RailTooltip>
            ) : (
              <>
                <span className="shell-context-link-label">{destination.label}</span>
                {active && <span className="shell-context-current" aria-hidden="true">Current</span>}
              </>
            )}
          </Link>
        );
      })}
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
    <div className="shell-workspace-switcher" aria-label="Local workspace">
      <label>
        <span>Workspace</span>
        <select
          value={store?.activeWorkspaceId ?? current?.workspaceId ?? ""}
          onChange={(event) => changeWorkspace(event.target.value)}
          aria-label="Select active local workspace"
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
        className="shell-workspace-affordance"
        href="/team"
        aria-label="Local workspace, stored on this device"
        aria-describedby="shell-workspace-affordance-tooltip"
      >
        <LocalWorkspaceGlyph />
        <RailTooltip id="shell-workspace-affordance-tooltip">Local workspace · stored on this device</RailTooltip>
      </Link>
    </aside>
  );
}

function ContextNavigation({
  route,
  area,
  collapsed,
  onToggle,
  toggleRef,
  navId,
}: {
  route: ShellRouteContext;
  area: ShellGlobalArea;
  collapsed: boolean;
  onToggle: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  navId: string;
}) {
  if (collapsed) {
    return (
      <div className="shell-context-navigation-content shell-context-navigation-content--compact">
        <button
          className="shell-context-toggle shell-context-toggle--compact"
          type="button"
          ref={toggleRef}
          onClick={onToggle}
          aria-expanded={false}
          aria-controls={navId}
          aria-label={`Expand ${area.label} navigation`}
          aria-describedby="shell-context-expand-tooltip"
        >
          <CollapseGlyph collapsed />
          <RailTooltip id="shell-context-expand-tooltip">Expand navigation</RailTooltip>
        </button>
        <DestinationList route={route} navId={navId} compact />
        <Link
          className="shell-context-compact-workspace"
          href="/team"
          aria-label="Local workspace, stored on this device"
          aria-describedby="shell-context-compact-workspace-tooltip"
        >
          <LocalWorkspaceGlyph />
          <RailTooltip id="shell-context-compact-workspace-tooltip">Local workspace · stored on this device</RailTooltip>
        </Link>
      </div>
    );
  }

  return (
    <div className="shell-context-navigation-content">
      <div className="shell-context-head">
        <div className="shell-context-identity">
          <span>Current area</span>
          <strong>{area.label}</strong>
        </div>
        <button
          className="shell-context-toggle"
          type="button"
          ref={toggleRef}
          onClick={onToggle}
          aria-expanded
          aria-controls={navId}
          aria-label={`Collapse ${area.label} navigation`}
        >
          <CollapseGlyph collapsed={false} />
        </button>
      </div>
      <DestinationList route={route} navId={navId} />
    </div>
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

const ADMINISTRATIVE_ROUTES = SHELL_ROUTE_CONTEXTS.filter(
  (route) => route.family === "administrative",
);

function ProductIdentity({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={compact ? "r4-product-identity r4-product-identity--compact" : "r4-product-identity"} href="/workspace" aria-label="Lintel Reviews">
      <span className="r4-product-mark" aria-hidden="true">L</span>
      <span className="r4-product-name">Lintel</span>
    </Link>
  );
}

function R4GlobalRail({ route }: { route: ShellRouteContext }) {
  return (
    <aside className="r4-global-rail" aria-label="Global product areas">
      <ProductIdentity compact />
      <nav className="r4-global-navigation" aria-label="Product areas">
        {SHELL_GLOBAL_AREAS.map((area) => {
          const active = isShellAreaActive(area, route);
          const tooltipId = `r4-area-${area.id}-tooltip`;
          return (
            <Link
              className={active ? "r4-global-link r4-global-link--active" : "r4-global-link"}
              href={area.href}
              aria-current={active ? "page" : undefined}
              aria-label={area.label}
              aria-describedby={tooltipId}
              key={area.id}
            >
              <ShellIcon name={area.icon} />
              <span className="r4-global-label">{area.label}</span>
              <span className="r4-global-tooltip" id={tooltipId} role="tooltip">{area.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link className="r4-global-local" href="/team" aria-label="Team boundaries, browser-local administration" title="Team boundaries">
        <LocalWorkspaceGlyph />
      </Link>
    </aside>
  );
}

function WorkspaceReturnLink({
  context,
  compact = false,
  onNavigate,
}: {
  context: WorkspaceReturnContext | null;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const supportId = useId();
  const support = context
    ? "Prior review, mode and investigation context will be validated before restoration."
    : "No prior Workspace context is stored in this tab. Reviews will open at the truthful default state.";
  return (
    <Link
      className={compact ? "r4-return-link r4-return-link--compact" : "r4-return-link"}
      href={workspaceReturnHref(context)}
      aria-describedby={supportId}
      onClick={onNavigate}
    >
      <span aria-hidden="true">←</span>
      <span>{context ? "Back to Reviews" : "Open Reviews"}</span>
      <span className="r4-sr-only" id={supportId}>{support}</span>
    </Link>
  );
}

function AdministrativeNavigation({
  route,
  returnContext,
  onNavigate,
}: {
  route: ShellRouteContext;
  returnContext: WorkspaceReturnContext | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="r4-admin-navigation-content">
      <div className="r4-admin-identity-block">
        <ProductIdentity />
        <WorkspaceReturnLink context={returnContext} onNavigate={onNavigate} />
      </div>
      <nav className="r4-admin-section-nav" aria-label="Administrative sections">
        <span className="r4-admin-nav-label">Administration</span>
        {ADMINISTRATIVE_ROUTES.map((destination) => {
          const active = destination.pathname === route.pathname;
          const icon = destination.pathname === "/integrations"
            ? "integrations"
            : destination.pathname === "/team"
            ? "team"
            : destination.pathname === "/review-policies"
              ? "review-policies"
              : "system";
          return (
            <Link
              className={active ? "r4-admin-nav-link r4-admin-nav-link--active" : "r4-admin-nav-link"}
              href={destination.pathname}
              aria-current={active ? "page" : undefined}
              key={destination.pathname}
              onClick={onNavigate}
            >
              <ShellIcon name={icon} />
              <span>{destination.contextLabel}</span>
            </Link>
          );
        })}
      </nav>
      <div className="r4-admin-scope">
        <strong>Browser-local administration</strong>
        <span>No organisation, account or shared-state authority is implied.</span>
      </div>
    </div>
  );
}

function SharedProductShell({
  children,
  title,
  context,
  contextTone = "support",
  actions,
}: AppShellProps) {
  const pathname = usePathname() ?? "";
  const route = findShellRoute(pathname) ?? findShellRoute("/new")!;
  const area = findShellArea(route.area);
  const { setForcedTheme } = useTheme();
  const [returnContext, setReturnContext] = useState<WorkspaceReturnContext | null>(null);
  const [adminNavigationOpen, setAdminNavigationOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const adminDrawerRef = useRef<HTMLDivElement | null>(null);
  const adminMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    setForcedTheme("light");
    return () => setForcedTheme(null);
  }, [setForcedTheme]);

  const refreshReturnContext = useCallback(() => {
    try {
      setReturnContext(readWorkspaceReturnContext(window.sessionStorage));
    } catch {
      setReturnContext(null);
    }
  }, []);

  useEffect(() => {
    refreshReturnContext();
    window.addEventListener("storage", refreshReturnContext);
    window.addEventListener("pageshow", refreshReturnContext);
    return () => {
      window.removeEventListener("storage", refreshReturnContext);
      window.removeEventListener("pageshow", refreshReturnContext);
    };
  }, [pathname, refreshReturnContext]);

  useEffect(() => {
    setAdminNavigationOpen(false);
    const intendedTitle = `${route.documentTitle} — Lintel`;
    const applyDocumentTitle = () => {
      if (window.location.pathname !== pathname) return;
      if (document.title !== intendedTitle) document.title = intendedTitle;
    };
    applyDocumentTitle();
    const titleObserver = new MutationObserver(applyDocumentTitle);
    titleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    let focusedHeading: HTMLElement | null = null;
    const focusRouteHeading = (force = false) => {
      const heading = mainRef.current?.querySelector<HTMLElement>("h1");
      if (!heading) return;
      heading.tabIndex = -1;
      heading.dataset.routeHeading = "true";
      const priorHeadingWasReplaced = focusedHeading !== null && !focusedHeading.isConnected;
      if (force || focusedHeading === null || priorHeadingWasReplaced) {
        heading.focus({ preventScroll: true });
        focusedHeading = heading;
      }
    };
    const headingObserver = new MutationObserver(() => focusRouteHeading());
    if (mainRef.current) {
      headingObserver.observe(mainRef.current, { childList: true, subtree: true });
    }
    const headingObserverTimeout = window.setTimeout(() => headingObserver.disconnect(), 10_000);
    const frame = window.requestAnimationFrame(() => {
      applyDocumentTitle();
      focusRouteHeading(true);
    });
    return () => {
      titleObserver.disconnect();
      headingObserver.disconnect();
      window.clearTimeout(headingObserverTimeout);
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, route.documentTitle]);

  useEffect(() => {
    if (!adminNavigationOpen) return;
    const drawer = adminDrawerRef.current;
    const frame = window.requestAnimationFrame(() => drawer?.focus());
    function onKeyDown(event: KeyboardEvent) {
      if (!drawer) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setAdminNavigationOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(DRAWER_FOCUSABLE)).filter((item) => item.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === drawer)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      adminMenuButtonRef.current?.focus();
    };
  }, [adminNavigationOpen]);

  const routeTitle = title ?? route.contextLabel;
  const routeActions = (
    <div className="r4-route-actions" aria-label="Route actions">
      <WorkspaceReturnLink context={returnContext} compact />
      {route.primaryAction && (
        <Link className="shell-command-link shell-command-link--primary" href={route.primaryAction.href}>
          {route.primaryAction.label}
        </Link>
      )}
      <CommandActionOverflow route={route} actions={actions} closeSignal={0} />
    </div>
  );

  if (route.family === "administrative") {
    return (
      <div className="app-shell r4-product-shell r4-administrative-shell">
        <title>{`${route.documentTitle} — Lintel`}</title>
        <a className="r4-skip-link" href="#r4-route-main">Skip to administrative content</a>
        <div className="r4-admin-frame" inert={adminNavigationOpen ? true : undefined} aria-hidden={adminNavigationOpen ? true : undefined}>
          <aside className="r4-admin-sidebar" aria-label="Administrative navigation">
            <AdministrativeNavigation route={route} returnContext={returnContext} />
          </aside>
          <div className="r4-product-body">
            <header className="r4-route-header r4-route-header--administrative">
              <button
                className="r4-admin-menu-button"
                type="button"
                ref={adminMenuButtonRef}
                onClick={() => {
                  window.dispatchEvent(new Event(SHELL_NAVIGATION_OPEN_EVENT));
                  setAdminNavigationOpen(true);
                }}
                aria-expanded={adminNavigationOpen}
                aria-haspopup="dialog"
                aria-label="Open administrative sections"
              >
                <span aria-hidden="true">☰</span>
              </button>
              <div className="r4-route-identity">
                <span className="r4-route-mode">Administrative · {route.scopeLabel}</span>
                <strong>{routeTitle}</strong>
                <span className="r4-route-description">{route.routeDescription}</span>
              </div>
              {context && <span className={`r4-route-context r4-route-context--${contextTone}`}>{context}</span>}
              <div className="r4-admin-mobile-return"><WorkspaceReturnLink context={returnContext} compact /></div>
            </header>
            <main className="r4-route-main" id="r4-route-main" aria-label={route.accessiblePageName} ref={mainRef}>{children}</main>
          </div>
        </div>
        {adminNavigationOpen && (
          <div className="r4-admin-drawer-layer">
            <button className="r4-admin-drawer-scrim" type="button" tabIndex={-1} aria-label="Close administrative sections" onClick={() => setAdminNavigationOpen(false)} />
            <div className="r4-admin-drawer" role="dialog" aria-modal="true" aria-label="Administrative sections" ref={adminDrawerRef} tabIndex={-1}>
              <div className="r4-admin-drawer-header">
                <span>Administrative sections</span>
                <button type="button" onClick={() => setAdminNavigationOpen(false)} aria-label="Close administrative sections">×</button>
              </div>
              <AdministrativeNavigation route={route} returnContext={returnContext} onNavigate={() => setAdminNavigationOpen(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell r4-product-shell r4-operational-shell">
      <title>{`${route.documentTitle} — Lintel`}</title>
      <a className="r4-skip-link" href="#r4-route-main">Skip to route content</a>
      <div className="r4-operational-frame">
        <R4GlobalRail route={route} />
        <div className="r4-product-body">
          <header className="r4-route-header">
            <div className="r4-route-identity">
              <span className="r4-route-mode">{area.label} · Operational · {route.scopeLabel}</span>
              <strong>{routeTitle}</strong>
              <span className="r4-route-description">{route.routeDescription}</span>
            </div>
            {context && <span className={`r4-route-context r4-route-context--${contextTone}`}>{context}</span>}
            {routeActions}
          </header>
          <main className="r4-route-main" id="r4-route-main" aria-label={route.accessiblePageName} ref={mainRef}>{children}</main>
        </div>
      </div>
    </div>
  );
}

export default function AppShell(props: AppShellProps) {
  const pathname = usePathname() ?? "";
  return pathname === "/workspace-legacy"
    ? <LegacyAppShell {...props} />
    : <SharedProductShell {...props} />;
}

function LegacyAppShell({
  children,
  title,
  context,
  contextTone = "support",
  actions,
}: AppShellProps) {
  const pathname = usePathname() ?? "";
  const route = findShellRoute(pathname) ?? findShellRoute("/workspace")!;
  const area = findShellArea(route.area);
  const { setForcedTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [commandMenuCloseSignal, setCommandMenuCloseSignal] = useState(0);
  const [mobile, setMobile] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const contextToggleRef = useRef<HTMLButtonElement | null>(null);
  const pendingToggleFocus = useRef(false);
  const contextNavId = useId();

  /* Lock the authoritative dark theme for this logged-in route. Applied before
     paint on the client (no light flash) and released on unmount, which
     restores the resolved public preference. Storage is never mutated. */
  useIsomorphicLayoutEffect(() => {
    setForcedTheme("dark");
    return () => setForcedTheme(null);
  }, [setForcedTheme]);

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

  /* Collapse is presentation-only. Keep keyboard focus on the toggle across the
     expanded/compact switch — never drop it to the body, never change route. */
  useEffect(() => {
    if (!pendingToggleFocus.current) return;
    pendingToggleFocus.current = false;
    contextToggleRef.current?.focus();
  }, [contextCollapsed]);

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

  function toggleContextNavigation() {
    pendingToggleFocus.current = true;
    setContextCollapsed((current) => !current);
  }

  return (
    <div className="app-shell legacy-app-shell shell">
      <div
        className="shell-frame"
        data-context-collapsed={contextCollapsed ? "true" : undefined}
        aria-hidden={drawerOpen ? true : undefined}
        inert={drawerOpen ? true : undefined}
      >
        <GlobalRail route={route} />

        <aside
          className="shell-context-navigation"
          data-collapsed={contextCollapsed ? "true" : undefined}
          aria-label={`${area.label} contextual navigation`}
        >
          <ContextNavigation
            route={route}
            area={area}
            collapsed={contextCollapsed}
            onToggle={toggleContextNavigation}
            toggleRef={contextToggleRef}
            navId={contextNavId}
          />
          {!contextCollapsed && (
            <div className="shell-context-footer">
              <WorkspaceSwitcher />
              <ShellLocalNote />
            </div>
          )}
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
              <div className="shell-context-identity">
                <span>Current area</span>
                <strong>{area.label}</strong>
              </div>
              <DestinationList route={route} navId={`${contextNavId}-drawer`} onNavigate={() => setDrawerOpen(false)} />
            </div>

            <div className="shell-drawer-footer">
              <WorkspaceSwitcher onNavigate={() => setDrawerOpen(false)} />
              <ShellLocalNote onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
