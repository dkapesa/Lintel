/* E7.1 — single route/navigation configuration for the application shell.
   Desktop sidebar, collapsed rail and the mobile drawer all render from
   this list so labels, destinations, grouping and active-route matching
   stay defined once. */

export type ShellIconName =
  | "new-report"
  | "risk-inbox"
  | "team-workspace"
  | "review-operations"
  | "reports"
  | "review-policies"
  | "analysis-settings"
  | "github-action"
  | "slack-handoff"
  | "evaluation"
  | "security-model";

export type ShellNavItem = {
  label: string;
  href: string;
  icon: ShellIconName;
  /* Match nested routes (e.g. /report with query-driven views) without
     changing any URL. Exact-match items omit this. */
  activePrefix?: string;
};

export type ShellNavGroup = {
  label: string;
  items: ShellNavItem[];
};

export const SHELL_NAV_GROUPS: ShellNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "New report", href: "/new", icon: "new-report" },
      { label: "Risk inbox", href: "/workspace", icon: "risk-inbox" },
      { label: "Team workspace", href: "/team", icon: "team-workspace" },
      { label: "Review operations", href: "/review-operations", icon: "review-operations" },
      { label: "Reports", href: "/report", icon: "reports", activePrefix: "/report" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Review policies", href: "/review-policies", icon: "review-policies" },
      { label: "Analysis settings", href: "/settings", icon: "analysis-settings" },
      { label: "GitHub Action", href: "/github-action", icon: "github-action" },
      { label: "Slack handoff", href: "/slack-handoff", icon: "slack-handoff" },
    ],
  },
  {
    label: "Evidence",
    items: [
      { label: "Evaluation", href: "/docs/evaluation-results.md", icon: "evaluation" },
      { label: "Security model", href: "/docs/security-model.md", icon: "security-model" },
    ],
  },
];

export function isShellNavItemActive(item: ShellNavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  if (item.activePrefix) {
    return pathname === item.activePrefix || pathname.startsWith(`${item.activePrefix}/`);
  }
  return false;
}

export function findShellRoute(pathname: string): { group: ShellNavGroup; item: ShellNavItem } | null {
  for (const group of SHELL_NAV_GROUPS) {
    for (const item of group.items) {
      if (isShellNavItemActive(item, pathname)) return { group, item };
    }
  }
  return null;
}

/* Minimal geometric line icons for navigation. Functional (they identify
   destinations in the collapsed rail), monochrome via currentColor, and
   defined once here so the sidebar and drawer stay in sync. */
const SHELL_ICON_PATHS: Record<ShellIconName, React.ReactNode> = {
  "new-report": <path d="M8 3.25v9.5M3.25 8h9.5" />,
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
  "github-action": (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M6.9 5.9l2.9 2.1-2.9 2.1z" />
    </>
  ),
  "slack-handoff": (
    <path d="M13.25 7.4c0 2.6-2.35 4.35-5.25 4.35-.55 0-1.1-.06-1.6-.18L3 12.9l.6-2.4c-.55-.85-.85-1.85-.85-3.1C2.75 4.8 5.1 3.05 8 3.05s5.25 1.75 5.25 4.35z" />
  ),
  evaluation: <path d="M2.25 13.25h11.5M3.75 13.25V8.75M8 13.25V4.25M12.25 13.25V6.75" />,
  "security-model": (
    <>
      <rect x="3.5" y="7" width="9" height="6.25" rx="1" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
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
