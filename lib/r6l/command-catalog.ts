import type { ReviewMode, WorkstationState } from "../r6c/index";
import type { R6LBoundAction } from "./action-registry";
import { projectReviewCollection, reviewMatchesQuery, type ReviewRowViewModel } from "../r6e/collection-projection";
import { projectReviewModeLinks } from "../r6f/mode-navigation";
import type { WorkspaceSnapshot } from "../workspace-v2/view-model";
import type { ReviewIndex } from "../r6c/review-identity";

export type CommandKind = "action" | "contextual" | "review";
export type Command = Readonly<{
  id: string;
  kind: CommandKind;
  label: string;
  detail?: string;
  action: R6LBoundAction;
}>;

export type CommandSection = Readonly<{
  id: "actions" | "contextual" | "reviews" | "results";
  label: "Actions" | "Contextual" | "Reviews" | "Results";
  commands: readonly Command[];
}>;

export type CommandCatalogInput = Readonly<{
  state: WorkstationState;
  snapshot: WorkspaceSnapshot;
  reviewIndex: ReviewIndex;
  queueVisible: boolean;
}>;

function action(id: string, label: string, command: R6LBoundAction): Command {
  return { id, kind: "action", label, action: command };
}

function actionsFor(input: CommandCatalogInput): readonly Command[] {
  const items: Command[] = [
    action("focus", input.state.focus.active ? "Exit Focus Mode" : "Enter Focus Mode", {
      id: "focus/set", active: !input.state.focus.active,
    }),
    action("go-reviews", "Go to Reviews", { id: "route/navigate", destination: "reviews" }),
    action("go-policies", "Go to Policies", { id: "route/navigate", destination: "policies" }),
    action("go-integrations", "Go to Integrations", { id: "route/navigate", destination: "integrations" }),
    action("go-settings", "Go to Settings", { id: "route/navigate", destination: "settings" }),
  ];
  if (input.queueVisible) {
    const compact = input.state.queue.manualPreference === "compact";
    items.push(action("queue-density", compact ? "Switch Queue to Expanded" : "Switch Queue to Compact", {
      id: "queue/set-manual-preference", preference: compact ? "expanded" : "compact",
    }));
  }
  return items;
}

function contextualFor(input: CommandCatalogInput): readonly Command[] {
  if (input.state.selectedReview.status !== "available") return [];
  return projectReviewModeLinks(input.state.selectedReview.reviewId, input.state.mode).map((link) => ({
    id: `mode-${link.mode}`,
    kind: "contextual" as const,
    label: link.label,
    detail: "Review mode",
    action: { id: "mode/activate", mode: link.mode as ReviewMode },
  }));
}

function reviewsFor(input: CommandCatalogInput): readonly Command[] {
  return projectReviewCollection(input.snapshot, input.reviewIndex, {
    grouping: "semantic",
    filter: "all",
    search: "",
  }).rows.map((row: ReviewRowViewModel) => ({
    id: `review-${row.reviewId}`,
    kind: "review" as const,
    label: row.title,
    detail: row.repository,
    action: { id: "review/select", reviewId: row.reviewId },
  }));
}

function matches(command: Command, query: string): boolean {
  if (command.kind === "review") {
    return reviewMatchesQuery({ title: command.label, repository: command.detail ?? "" }, query);
  }
  return command.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

/** Pure, ordered Commands projection. Typed searches intentionally have one flat Results section. */
export function projectCommandCatalog(input: CommandCatalogInput, query: string): readonly CommandSection[] {
  const actions = actionsFor(input);
  const contextual = contextualFor(input);
  const reviews = reviewsFor(input);
  if (query.trim().length > 0) {
    return [{
      id: "results",
      label: "Results",
      commands: [...actions, ...contextual, ...reviews].filter((command) => matches(command, query)),
    }];
  }
  const sections: CommandSection[] = [{ id: "actions", label: "Actions", commands: actions }];
  if (contextual.length > 0) sections.push({ id: "contextual", label: "Contextual", commands: contextual });
  sections.push({ id: "reviews", label: "Reviews", commands: reviews });
  return sections;
}
