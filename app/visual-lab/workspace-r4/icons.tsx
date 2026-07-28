import type { ReactNode } from "react";

export { ShellIcon } from "../../nav-config";

export type GlyphName =
  | "search"
  | "filter"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "panel-left"
  | "panel-right"
  | "focus"
  | "command"
  | "close"
  | "warning"
  | "check"
  | "arrow-right"
  | "link"
  | "file"
  | "evidence"
  | "requirement"
  | "history"
  | "reset"
  | "copy"
  | "more";

const GLYPHS: Record<GlyphName, ReactNode> = {
  search: <><circle cx="7" cy="7" r="4" /><path d="m10.2 10.2 3 3" /></>,
  filter: <><path d="M2 4h12M4.5 8h7M7 12h2" /></>,
  "chevron-down": <path d="m4 6 4 4 4-4" />,
  "chevron-left": <path d="m10 3-5 5 5 5" />,
  "chevron-right": <path d="m6 3 5 5-5 5" />,
  "panel-left": <><rect x="2" y="2.5" width="12" height="11" rx="1.5" /><path d="M6 3v10" /></>,
  "panel-right": <><rect x="2" y="2.5" width="12" height="11" rx="1.5" /><path d="M10 3v10" /></>,
  focus: <><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" /></>,
  command: <><path d="M5.3 5.3H3.8a1.8 1.8 0 1 1 1.5-2.8v11a1.8 1.8 0 1 1-1.5-2.8h8.4a1.8 1.8 0 1 1-1.5 2.8v-11a1.8 1.8 0 1 1 1.5 2.8z" /></>,
  close: <path d="m3 3 10 10M13 3 3 13" />,
  warning: <><path d="M8 2.2 14 13H2z" /><path d="M8 5.5v3.7M8 11.5h.01" /></>,
  check: <path d="m3 8 3.1 3.1L13 4.4" />,
  "arrow-right": <path d="M2.5 8h10.5M9 4l4 4-4 4" />,
  link: <><path d="m6.6 9.4 2.8-2.8" /><path d="m5.2 6.3-1 1a2.2 2.2 0 1 0 3.1 3.1l1-1M10.8 9.7l1-1a2.2 2.2 0 1 0-3.1-3.1l-1 1" /></>,
  file: <><path d="M4 2.5h5l3 3V13.5H4z" /><path d="M9 2.5v3h3" /></>,
  evidence: <><circle cx="7" cy="7" r="4" /><path d="m10.2 10.2 3 3M5.4 7l1.2 1.2L9 5.8" /></>,
  requirement: <><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" /><path d="m5 8 2 2 4-4" /></>,
  history: <><path d="M3.2 5.5A5.2 5.2 0 1 1 3 10.2" /><path d="M3 2.5v3h3M8 5v3.5l2.2 1.3" /></>,
  reset: <><path d="M3.2 5.5A5.2 5.2 0 1 1 3 10.2" /><path d="M3 2.5v3h3" /></>,
  copy: <><rect x="5" y="5" width="8" height="8" rx="1.5" /><path d="M3 10V3h7" /></>,
  more: <><circle cx="3" cy="8" r=".7" fill="currentColor" stroke="none" /><circle cx="8" cy="8" r=".7" fill="currentColor" stroke="none" /><circle cx="13" cy="8" r=".7" fill="currentColor" stroke="none" /></>,
};

export function Glyph({ name, size = 16 }: { name: GlyphName; size?: 14 | 16 | 18 | 20 }) {
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
      {GLYPHS[name]}
    </svg>
  );
}
