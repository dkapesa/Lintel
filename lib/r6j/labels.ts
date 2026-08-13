import type { RunView } from "../workspace-v2/view-model";

export const HISTORY_ORIENTATION = "Compare the current Lintel analysis with a stored analysis for this pull request.";
export const HISTORY_CURRENT = "Current analysis";
export const HISTORY_TARGETS = "Historical comparison targets";

const SOURCE_LABEL: Record<RunView["sourceType"], string> = {
  "github-app": "GitHub App",
  "github-pr": "GitHub pull request",
  manual: "Manual input",
  sample: "Sample",
  demo: "Demo",
};

export function sourceLabel(source: RunView["sourceType"]): string {
  return SOURCE_LABEL[source];
}

export function analysedAtLabel(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Time not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "UTC", timeZoneName: "short",
  }).format(date);
}

export function shortHead(head: string | null): string | null {
  return head?.slice(0, 7) ?? null;
}
