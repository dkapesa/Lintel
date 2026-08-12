import type { ContextRef } from "../r6c/index";
import type { RelationshipState } from "../workspace-v2/view-model";

export type TraversableRelationshipItem = Readonly<{
  target: ContextRef;
  label: string;
  detail: string | null;
}>;

export type RelationshipPresentation =
  | Readonly<{ status: "linked"; items: readonly TraversableRelationshipItem[]; unresolvedCount: number }>
  | Readonly<{ status: "none" }>
  | Readonly<{ status: "unavailable"; reason: string }>
  | Readonly<{ status: "unresolved"; unresolvedCount: number }>;

/** Keeps all user-facing relationship text separate from its opaque target. */
export function relationshipVisibleText(item: Pick<TraversableRelationshipItem, "label" | "detail">): string {
  return item.detail ? `${item.label} · ${item.detail}` : item.label;
}

/** This deliberately derives from presentation text, never from `target.id`. */
export function relationshipTraversalAccessibleName(item: Pick<TraversableRelationshipItem, "label" | "detail">): string {
  return `Inspect ${relationshipVisibleText(item)}`;
}

export function unresolvedRelationshipText(count: number): string {
  return `${count} recorded ${count === 1 ? "reference" : "references"} could not be resolved in this analysis.`;
}

export function projectRelationship(state: RelationshipState): RelationshipPresentation {
  if (state.status === "linked") {
    const seen = new Set<string>();
    const items: TraversableRelationshipItem[] = [];
    for (const related of state.related) {
      const key = `${related.kind}\u0000${related.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        target: { kind: related.kind, id: related.id },
        label: related.label,
        detail: related.detail,
      });
    }
    return { status: "linked", items, unresolvedCount: state.unresolved.length };
  }
  if (state.status === "unavailable") return { status: "unavailable", reason: state.reason };
  if (state.status === "unresolved") return { status: "unresolved", unresolvedCount: state.unresolved.length };
  return { status: "none" };
}
