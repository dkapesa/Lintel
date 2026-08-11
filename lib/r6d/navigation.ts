import type { Destination } from "../r6c/route-contract";

export type WorkstationDestination = Readonly<{
  id: Destination;
  label: string;
  href: `/${Destination}`;
  icon: "review" | "review-policies" | "integrations" | "system";
}>;

export const WORKSTATION_DESTINATIONS: readonly WorkstationDestination[] = [
  { id: "reviews", label: "Reviews", href: "/reviews", icon: "review" },
  { id: "policies", label: "Policies", href: "/policies", icon: "review-policies" },
  { id: "integrations", label: "Integrations", href: "/integrations", icon: "integrations" },
  { id: "settings", label: "Settings", href: "/settings", icon: "system" },
];

const REVIEW_FAMILY = [
  "/reviews",
  "/workspace",
  "/new",
  "/report",
  "/home",
  "/review-operations",
] as const;
const INTEGRATION_FAMILY = ["/integrations", "/github-action", "/slack-handoff"] as const;
const SETTINGS_FAMILY = ["/settings", "/team"] as const;

function matchesFamily(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

/** Canonical and compatibility route attribution for both shell generations. */
export function destinationForPathname(pathname: string): Destination {
  if (pathname === "/policies" || matchesFamily(pathname, "/review-policies")) {
    return "policies";
  }
  if (INTEGRATION_FAMILY.some((root) => matchesFamily(pathname, root))) {
    return "integrations";
  }
  if (SETTINGS_FAMILY.some((root) => matchesFamily(pathname, root))) {
    return "settings";
  }
  if (REVIEW_FAMILY.some((root) => matchesFamily(pathname, root))) {
    return "reviews";
  }
  return "reviews";
}
