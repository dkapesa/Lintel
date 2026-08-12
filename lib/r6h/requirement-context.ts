import { resolveContext, type ContextRef } from "../r6c/index";
import type { CaseDetail } from "../workspace-v2/view-model";
import { REQUIREMENT_IMPORTANCE_LABELS, requirementStatusLabel } from "./labels";
import { projectRelationship, type RelationshipPresentation } from "./relationship-presentation";

export type RequirementContextProjection =
  | Readonly<{ status: "unavailable" }>
  | Readonly<{
      status: "ready";
      kind: "requirement";
      title: string;
      statement: string;
      standing: readonly Readonly<{ label: "Status" | "Importance" | "Evidence required"; value: string }>[];
      relationships: readonly Readonly<{
        label: "Supporting evidence" | "Related findings";
        value: RelationshipPresentation;
      }>[];
    }>;

export function projectRequirementContext(detail: CaseDetail, context: ContextRef | null): RequirementContextProjection {
  if (!context || context.kind !== "requirement") return { status: "unavailable" };
  const resolved = resolveContext(detail, context);
  if (resolved.status !== "resolved" || resolved.context.kind !== "requirement") return { status: "unavailable" };
  const requirement = resolved.context.value;
  return {
    status: "ready",
    kind: "requirement",
    title: requirement.title,
    statement: requirement.statement,
    standing: [
      { label: "Status", value: requirementStatusLabel(requirement.status, requirement.stale) },
      { label: "Importance", value: REQUIREMENT_IMPORTANCE_LABELS[requirement.importance] },
      { label: "Evidence required", value: requirement.evidenceRequired },
    ],
    relationships: [
      { label: "Supporting evidence", value: projectRelationship(requirement.supportingEvidence) },
      { label: "Related findings", value: projectRelationship(requirement.relatedFindings) },
    ],
  };
}
