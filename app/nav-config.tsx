import type { ReactNode } from "react";

/* LVOS-2 — definitive authenticated-shell route ownership.
   Global areas, contextual destinations, command-bar context and active-state
   matching are defined here once. Query strings remain owned by route links
   and are never used to decide shell ownership. */

export type ShellIconName =
  | "risk-inbox"
  | "team-workspace"
  | "review-operations"
  | "reports"
  | "review-policies"
  | "analysis-settings";

export type ShellGlobalAreaId =
  | "workspace"
  | "reports"
  | "operations"
  | "policies"
  | "team"
  | "settings";

export type ShellGlobalArea = {
  id: ShellGlobalAreaId;
  label: string;
  href: string;
  icon: ShellIconName;
};

export type ShellContextDestination = {
  label: string;
  href: string;
  pathname: string;
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
  currentItemPathname: string;
  contextLabel: string;
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
  { id: "workspace", label: "Workspace", href: "/workspace", icon: "risk-inbox" },
  { id: "reports", label: "Reports", href: "/report", icon: "reports" },
  { id: "operations", label: "Operations", href: "/review-operations", icon: "review-operations" },
  { id: "policies", label: "Policies", href: "/review-policies", icon: "review-policies" },
  { id: "team", label: "Team", href: "/team", icon: "team-workspace" },
  { id: "settings", label: "Settings", href: "/settings", icon: "analysis-settings" },
];

export const SHELL_CONTEXT_DESTINATIONS: Record<ShellGlobalAreaId, ShellContextDestination[]> = {
  workspace: [
    { label: "Risk Inbox", href: "/workspace", pathname: "/workspace" },
    { label: "New Review", href: "/new", pathname: "/new" },
  ],
  reports: [
    { label: "Case File", href: "/report", pathname: "/report" },
    { label: "New Review", href: "/new", pathname: "/new" },
    { label: "Risk Inbox", href: "/workspace", pathname: "/workspace" },
  ],
  operations: [
    { label: "Review Operations", href: "/review-operations", pathname: "/review-operations" },
    { label: "GitHub Action", href: "/github-action", pathname: "/github-action" },
    { label: "Slack Handoff", href: "/slack-handoff", pathname: "/slack-handoff" },
  ],
  policies: [
    { label: "Review Policies", href: "/review-policies", pathname: "/review-policies" },
    { label: "Security Model", href: "/docs/security-model.md", pathname: "/docs/security-model.md" },
  ],
  team: [
    { label: "Team Workspace", href: "/team", pathname: "/team" },
    { label: "Review Operations", href: "/review-operations", pathname: "/review-operations" },
  ],
  settings: [
    { label: "Analysis Settings", href: "/settings", pathname: "/settings" },
    { label: "GitHub Action", href: "/github-action", pathname: "/github-action" },
    { label: "Slack Handoff", href: "/slack-handoff", pathname: "/slack-handoff" },
  ],
};

export const SHELL_ROUTE_CONTEXTS: ShellRouteContext[] = [
  {
    pathname: "/workspace",
    area: "workspace",
    currentItemPathname: "/workspace",
    contextLabel: "Risk Inbox",
    accessiblePageName: "Risk Inbox workspace",
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
    area: "workspace",
    currentItemPathname: "/new",
    contextLabel: "New Review",
    accessiblePageName: "New Review",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/report",
    area: "reports",
    currentItemPathname: "/report",
    contextLabel: "Case File",
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
    pathname: "/review-operations",
    area: "operations",
    currentItemPathname: "/review-operations",
    contextLabel: "Review Operations",
    accessiblePageName: "Review Operations",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/github-action",
    area: "operations",
    currentItemPathname: "/github-action",
    contextLabel: "GitHub Action",
    accessiblePageName: "GitHub Action",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/slack-handoff",
    area: "operations",
    currentItemPathname: "/slack-handoff",
    contextLabel: "Slack Handoff",
    accessiblePageName: "Slack Handoff",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/review-policies",
    area: "policies",
    currentItemPathname: "/review-policies",
    contextLabel: "Review Policies",
    accessiblePageName: "Review Policies",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/team",
    area: "team",
    currentItemPathname: "/team",
    contextLabel: "Team Workspace",
    accessiblePageName: "Team Workspace",
    primaryAction: null,
    secondaryActions: [],
    commandActions: NO_COMMAND_ACTIONS,
  },
  {
    pathname: "/settings",
    area: "settings",
    currentItemPathname: "/settings",
    contextLabel: "Analysis Settings",
    accessiblePageName: "Analysis Settings",
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

const SHELL_ICON_PATHS: Record<ShellIconName, ReactNode> = {
  "risk-inbox": (
    <>
      <path d="M2.75 5.5a1 1 0 0 1 1-1h8.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1z" />
      <path d="M2.75 9h3.1l.95 1.6h2.4L10.15 9h3.1" />
    </>
  ),
  "review-operations": <path d="M1.75 8.5h2.4l1.7-4.2 2.9 7.4 1.6-3.2h3.9" />,
  "team-workspace": (
    <>
      <circle cx="5.4" cy="5.4" r="2" />
      <circle cx="10.8" cy="6.2" r="1.7" />
      <path d="M2.6 12.8c.55-2 1.75-3.1 2.8-3.1s2.25 1.1 2.8 3.1M8.7 12.8c.45-1.45 1.25-2.35 2.1-2.35.8 0 1.6.75 2.1 2.35" />
    </>
  ),
  reports: (
    <>
      <path d="M4.25 2.75h5.25l2.25 2.25v8.25h-7.5z" />
      <path d="M9.5 2.75V5h2.25M6.25 8.5h3.5M6.25 10.75h3.5" />
    </>
  ),
  "review-policies": (
    <>
      <path d="M8 2.5l4.5 1.75v3.4c0 2.9-1.85 4.65-4.5 5.85-2.65-1.2-4.5-2.95-4.5-5.85v-3.4z" />
      <path d="M6.1 8l1.4 1.4 2.4-2.6" />
    </>
  ),
  "analysis-settings": (
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
