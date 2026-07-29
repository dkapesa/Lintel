import type { ReactNode } from "react";

/* R2B — authoritative logged-in shell route ownership.
   One typed model owns product areas, contextual destinations, command-bar
   context and active-state matching. The global rail carries five product
   AREAS (Review, Operations, Governance, Integrations, System) — not every
   route. Contextual destinations live under an area. Query strings remain
   owned by route links and are never used to decide shell ownership. */

export type ShellIconName =
  | "review"
  | "workspace"
  | "new-review"
  | "case-file"
  | "operations"
  | "operational-home"
  | "review-operations"
  | "team"
  | "governance"
  | "review-policies"
  | "integrations"
  | "github"
  | "slack-handoff"
  | "system";

export type ShellGlobalAreaId =
  | "review"
  | "operations"
  | "governance"
  | "integrations"
  | "system";

export type ShellGlobalArea = {
  id: ShellGlobalAreaId;
  label: string;
  /* Default shell destination for the area. Review deliberately defaults to
     /new (New Review) rather than /workspace, so entering the area does not
     immediately leave the broad shell and New Review stays discoverable. */
  href: string;
  icon: ShellIconName;
};

export type ShellContextDestination = {
  id: string;
  label: string;
  href: string;
  /* Canonical pathname used for active matching. Query strings never affect it. */
  pathname: string;
  icon: ShellIconName;
  /* Contextual destinations are only shown when their route is truthfully
     active (e.g. Case File only while /report is the current route). */
  contextual?: boolean;
};

export type ShellCommandLink = {
  label: string;
  href: string;
};

export type ShellCommandActionConfig = {
  overflowLabel: string;
  metadataActionIndexes: number[];
  visibleDesktopActionIndexes: number[];
  destructiveActionIndexes: number[];
};

export type ShellRouteContext = {
  pathname: string;
  area: ShellGlobalAreaId;
  family: "specialist" | "operational" | "administrative";
  currentItemPathname: string;
  contextLabel: string;
  routeDescription: string;
  scopeLabel: string;
  documentTitle: string;
  accessiblePageName: string;
  primaryAction: ShellCommandLink | null;
  secondaryActions: ShellCommandLink[];
  commandActions: ShellCommandActionConfig;
};

const NO_COMMAND_ACTIONS: ShellCommandActionConfig = {
  overflowLabel: "More actions",
  metadataActionIndexes: [],
  visibleDesktopActionIndexes: [],
  destructiveActionIndexes: [],
};

export const SHELL_GLOBAL_AREAS: ShellGlobalArea[] = [
  { id: "review", label: "Reviews", href: "/workspace", icon: "review" },
  { id: "operations", label: "Operations", href: "/home", icon: "operations" },
  { id: "governance", label: "Governance", href: "/review-policies", icon: "governance" },
  { id: "integrations", label: "Integrations", href: "/github-action", icon: "integrations" },
  { id: "system", label: "System", href: "/settings", icon: "system" },
];

export const SHELL_CONTEXT_DESTINATIONS: Record<ShellGlobalAreaId, ShellContextDestination[]> = {
  review: [
    { id: "workspace", label: "Verification Workspace", href: "/workspace", pathname: "/workspace", icon: "workspace" },
    { id: "new-review", label: "New review", href: "/new", pathname: "/new", icon: "new-review" },
    { id: "case-file", label: "Case File", href: "/report", pathname: "/report", icon: "case-file", contextual: true },
  ],
  operations: [
    { id: "operational-home", label: "Operational Home", href: "/home", pathname: "/home", icon: "operational-home" },
    { id: "review-operations", label: "Review Operations", href: "/review-operations", pathname: "/review-operations", icon: "review-operations" },
    { id: "team", label: "Team boundaries", href: "/team", pathname: "/team", icon: "team" },
  ],
  governance: [
    { id: "review-policies", label: "Review policies", href: "/review-policies", pathname: "/review-policies", icon: "review-policies" },
  ],
  integrations: [
    { id: "github", label: "GitHub Action blueprint", href: "/github-action", pathname: "/github-action", icon: "github" },
    { id: "slack-handoff", label: "Slack handoff export", href: "/slack-handoff", pathname: "/slack-handoff", icon: "slack-handoff" },
  ],
  system: [
    { id: "system", label: "System settings", href: "/settings", pathname: "/settings", icon: "system" },
  ],
};

export const SHELL_ROUTE_CONTEXTS: ShellRouteContext[] = [
  {
    /* Workspace renders full-bleed OUTSIDE AppShell. This entry only exists so
       that any shell reference to /workspace resolves to the Review area; the
       broad shell is never rendered on /workspace. It also backs the legacy
       AppShell fallback used by /workspace-legacy. */
    pathname: "/workspace",
    area: "review",
    family: "specialist",
    currentItemPathname: "/workspace",
    contextLabel: "Verification Workspace",
    routeDescription: "Investigate one review through change, evidence, requirements and accountable Human Decision.",
    scopeLabel: "Selected review",
    documentTitle: "Verification Workspace",
    accessiblePageName: "Workspace",
    primaryAction: { label: "Check a pull request", href: "/new" },
    secondaryActions: [],
    commandActions: {
      overflowLabel: "More actions",
      metadataActionIndexes: [],
      visibleDesktopActionIndexes: [0, 1],
      destructiveActionIndexes: [1],
    },
  },
  {
    pathname: "/new",
    area: "review",
    family: "operational",
    currentItemPathname: "/new",
    contextLabel: "New review",
    routeDescription: "Prepare one change and create a truthful browser-local Case File.",
    scopeLabel: "Review intake",
    documentTitle: "New review",
    accessiblePageName: "New Review",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/report",
    area: "review",
    family: "operational",
    currentItemPathname: "/report",
    contextLabel: "Case File",
    routeDescription: "Inspect one review record, its provenance and Human Decision lineage.",
    scopeLabel: "Review record",
    documentTitle: "Case File",
    accessiblePageName: "Report Case File",
    primaryAction: null,
    secondaryActions: [],
    commandActions: {
      overflowLabel: "More actions",
      metadataActionIndexes: [0],
      visibleDesktopActionIndexes: [1, 2],
      destructiveActionIndexes: [],
    },
  },
  {
    pathname: "/home",
    area: "operations",
    family: "operational",
    currentItemPathname: "/home",
    contextLabel: "Operational Home",
    routeDescription: "Orient across browser-local review work and resume the next truthful action.",
    scopeLabel: "Browser-local orientation",
    documentTitle: "Operational Home",
    accessiblePageName: "Operational Home",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/review-operations",
    area: "operations",
    family: "operational",
    currentItemPathname: "/review-operations",
    contextLabel: "Review Operations",
    routeDescription: "Filter and inspect operational records stored in this browser.",
    scopeLabel: "Browser-local records",
    documentTitle: "Review Operations",
    accessiblePageName: "Review Operations",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/team",
    area: "operations",
    family: "administrative",
    currentItemPathname: "/team",
    contextLabel: "Team boundaries",
    routeDescription: "Manage browser-local workspaces, reviewer metadata and responsibility boundaries.",
    scopeLabel: "Current browser",
    documentTitle: "Team boundaries",
    accessiblePageName: "Team boundaries",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/review-policies",
    area: "governance",
    family: "administrative",
    currentItemPathname: "/review-policies",
    contextLabel: "Review policies",
    routeDescription: "Inspect local policy profiles and their current non-enforcement boundary.",
    scopeLabel: "Local prototype",
    documentTitle: "Review policies",
    accessiblePageName: "Review policies",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/github-action",
    area: "integrations",
    family: "operational",
    currentItemPathname: "/github-action",
    contextLabel: "GitHub Action blueprint",
    routeDescription: "Read and copy a blueprint that does not install, execute, connect or post.",
    scopeLabel: "Blueprint",
    documentTitle: "GitHub Action blueprint",
    accessiblePageName: "GitHub Action blueprint",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/slack-handoff",
    area: "integrations",
    family: "operational",
    currentItemPathname: "/slack-handoff",
    contextLabel: "Slack handoff export",
    routeDescription: "Prepare and copy a local handoff artifact without external delivery.",
    scopeLabel: "Export-only",
    documentTitle: "Slack handoff export",
    accessiblePageName: "Slack handoff export",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/settings",
    area: "system",
    family: "administrative",
    currentItemPathname: "/settings",
    contextLabel: "System settings",
    routeDescription: "Inspect analysis, provider and local-data configuration truth.",
    scopeLabel: "Read-only prototype",
    documentTitle: "System settings",
    accessiblePageName: "System settings",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
];

export function findShellRoute(pathname: string): ShellRouteContext | null {
  return SHELL_ROUTE_CONTEXTS.find((route) => route.pathname === pathname) ?? null;
}

export function findShellArea(areaId: ShellGlobalAreaId): ShellGlobalArea {
  return SHELL_GLOBAL_AREAS.find((area) => area.id === areaId) ?? SHELL_GLOBAL_AREAS[0];
}

export function isShellAreaActive(area: ShellGlobalArea, route: ShellRouteContext): boolean {
  return route.area === area.id;
}

export function isShellContextDestinationActive(
  destination: ShellContextDestination,
  route: ShellRouteContext,
): boolean {
  return destination.pathname === route.currentItemPathname;
}

/* Contextual destinations visible for the active route. Contextual entries
   (Case File) appear only when their own route is truthfully active — never as
   a permanent or dead destination, and never reconstructed from report
   identity. */
export function visibleShellContextDestinations(route: ShellRouteContext): ShellContextDestination[] {
  return SHELL_CONTEXT_DESTINATIONS[route.area].filter(
    (destination) => !destination.contextual || isShellContextDestinationActive(destination, route),
  );
}

const SHELL_ICON_PATHS: Record<ShellIconName, ReactNode> = {
  review: (
    <>
      <path d="M2.75 4.25h7.5M2.75 7h7.5M2.75 9.75h4.25" />
      <path d="M9.4 10.35l1.35 1.4 2.5-2.75" />
    </>
  ),
  workspace: (
    <>
      <path d="M2.75 5.5a1 1 0 0 1 1-1h8.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1z" />
      <path d="M2.75 9h3.1l.95 1.6h2.4L10.15 9h3.1" />
    </>
  ),
  "new-review": (
    <>
      <path d="M4.25 2.75h4.4l2.85 2.85v7.65h-7.25z" />
      <path d="M8.5 2.75V5.6h2.85" />
      <path d="M7.5 7.9v3.1M6 9.45h3" />
    </>
  ),
  "case-file": (
    <>
      <path d="M2.5 4.5h3.5l1.15 1.4h5.35a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" />
    </>
  ),
  operations: <path d="M1.75 8.5h2.4l1.7-4.2 2.9 7.4 1.6-3.2h3.9" />,
  "operational-home": (
    <>
      <path d="M2.5 7.25L8 2.75l5.5 4.5" />
      <path d="M4 6.5v6.75h8V6.5M6.5 13.25V9h3v4.25" />
    </>
  ),
  "review-operations": <path d="M1.75 8.5h2.4l1.7-4.2 2.9 7.4 1.6-3.2h3.9" />,
  team: (
    <>
      <circle cx="5.4" cy="5.4" r="2" />
      <circle cx="10.8" cy="6.2" r="1.7" />
      <path d="M2.6 12.8c.55-2 1.75-3.1 2.8-3.1s2.25 1.1 2.8 3.1M8.7 12.8c.45-1.45 1.25-2.35 2.1-2.35.8 0 1.6.75 2.1 2.35" />
    </>
  ),
  governance: (
    <>
      <path d="M8 2.5l4.5 1.75v3.4c0 2.9-1.85 4.65-4.5 5.85-2.65-1.2-4.5-2.95-4.5-5.85v-3.4z" />
      <path d="M6.1 8l1.4 1.4 2.4-2.6" />
    </>
  ),
  "review-policies": (
    <>
      <path d="M8 2.5l4.5 1.75v3.4c0 2.9-1.85 4.65-4.5 5.85-2.65-1.2-4.5-2.95-4.5-5.85v-3.4z" />
      <path d="M6.1 8l1.4 1.4 2.4-2.6" />
    </>
  ),
  integrations: (
    <>
      <path d="M6.4 9.6l3.2-3.2" />
      <path d="M6.9 5.3l.95-.95a2.3 2.3 0 0 1 3.25 3.25l-.95.95" />
      <path d="M9.1 10.7l-.95.95a2.3 2.3 0 0 1-3.25-3.25l.95-.95" />
    </>
  ),
  github: (
    <>
      <circle cx="4.6" cy="4" r="1.4" />
      <circle cx="4.6" cy="12" r="1.4" />
      <circle cx="11.4" cy="4" r="1.4" />
      <path d="M4.6 5.4v5.2M11.4 5.4v1.3a3 3 0 0 1-3 3h-3.8" />
    </>
  ),
  "slack-handoff": (
    <>
      <path d="M13.25 2.75L2.4 7.05l4.35 1.65L8.4 13z" />
      <path d="M13.25 2.75L6.75 8.7" />
    </>
  ),
  system: (
    <>
      <path d="M2.5 5.25h1.6M8 5.25h5.5M2.5 10.75h5.5M12 10.75h1.5" />
      <circle cx="5.9" cy="5.25" r="1.7" />
      <circle cx="9.9" cy="10.75" r="1.7" />
    </>
  ),
};

export function ShellIcon({ name }: { name: ShellIconName }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SHELL_ICON_PATHS[name]}
    </svg>
  );
}
