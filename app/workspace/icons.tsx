import type { ReactNode } from "react";

export type IconName =
  | "reviews"
  | "operations"
  | "governance"
  | "integrations"
  | "system"
  | "queue"
  | "inspector"
  | "focus"
  | "search"
  | "filter"
  | "chevron"
  | "back"
  | "close"
  | "warning"
  | "check"
  | "file"
  | "evidence"
  | "requirement"
  | "history"
  | "external";

const PATHS: Record<IconName, ReactNode> = {
  reviews: <><path d="M4 3h8v10H4z" /><path d="M6 6h4M6 8.5h4M6 11h2.5" /></>,
  operations: <><path d="M2.5 8h3l1.2-3 2.2 6 1.4-3h3.2" /></>,
  governance: <><path d="M8 2.5 13 4v3.6c0 3-2 5-5 5.9-3-.9-5-2.9-5-5.9V4z" /><path d="m5.7 8 1.4 1.4 3.2-3.2" /></>,
  integrations: <><path d="M5.2 6.2 3.8 7.6a2.3 2.3 0 0 0 3.2 3.2l1.4-1.4M10.8 9.8l1.4-1.4A2.3 2.3 0 0 0 9 5.2L7.6 6.6" /><path d="m6.2 9.8 3.6-3.6" /></>,
  system: <><path d="M3 5h10M3 11h10" /><circle cx="6" cy="5" r="1.3" /><circle cx="10" cy="11" r="1.3" /></>,
  queue: <><rect x="2.5" y="3" width="11" height="10" rx="1" /><path d="M6 3v10M8.5 6h2.5M8.5 9h2.5" /></>,
  inspector: <><rect x="2.5" y="3" width="11" height="10" rx="1" /><path d="M9 3v10" /></>,
  focus: <><path d="M5 2.5H2.5V5M11 2.5h2.5V5M5 13.5H2.5V11M11 13.5h2.5V11" /></>,
  search: <><circle cx="7" cy="7" r="4" /><path d="m10 10 3 3" /></>,
  filter: <path d="M2.5 4h11M4.5 8h7M6.5 12h3" />,
  chevron: <path d="m5 6 3 3 3-3" />,
  back: <><path d="m7 4-4 4 4 4M3 8h10" /></>,
  close: <path d="m3 3 10 10M13 3 3 13" />,
  warning: <><path d="M8 2.2 14 13H2z" /><path d="M8 5.5v3.7M8 11.5h.01" /></>,
  check: <path d="m3 8 3.1 3.1L13 4.4" />,
  file: <><path d="M4 2.5h5l3 3V13.5H4z" /><path d="M9 2.5v3h3" /></>,
  evidence: <><circle cx="7" cy="7" r="4" /><path d="m10.2 10.2 3 3M5.4 7l1.2 1.2L9 5.8" /></>,
  requirement: <><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" /><path d="m5 8 2 2 4-4" /></>,
  history: <><path d="M3.2 5.5A5.2 5.2 0 1 1 3 10.2" /><path d="M3 2.5v3h3M8 5v3.5l2.2 1.3" /></>,
  external: <><path d="M8.5 3H13v4.5M13 3 7 9" /><path d="M11 8.5V13H3V5h4.5" /></>,
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
