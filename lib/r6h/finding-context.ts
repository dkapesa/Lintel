import { resolveContext, type ContextRef } from "../r6c/index";
import type { CaseDetail } from "../workspace-v2/view-model";
import { projectRelationship, type RelationshipPresentation } from "./relationship-presentation";

export type FindingContextProjection =
  | Readonly<{ status: "unavailable" }>
  | Readonly<{
      status: "ready";
      kind: "finding";
      title: string;
      statement: string;
      standing: readonly Readonly<{
        label: "Severity" | "Category" | "Provenance" | "Location";
        value: string;
      }>[];
      relationships: readonly Readonly<{
        label: "Affected change" | "Supporting evidence" | "Related requirements";
        value: RelationshipPresentation;
      }>[];
    }>;

export function projectFindingContext(detail: CaseDetail, context: ContextRef | null): FindingContextProjection {
  if (!context || context.kind !== "finding") return { status: "unavailable" };
  const resolved = resolveContext(detail, context);
  if (resolved.status !== "resolved" || resolved.context.kind !== "finding") return { status: "unavailable" };
  const finding = resolved.context.value;
  return {
    status: "ready",
    kind: "finding",
    title: finding.title,
    statement: finding.statement,
    standing: [
      { label: "Severity", value: finding.severity },
      { label: "Category", value: finding.category },
      { label: "Provenance", value: finding.provenance },
      { label: "Location", value: finding.file },
    ],
    relationships: [
      { label: "Affected change", value: projectRelationship(finding.affectedChange) },
      { label: "Supporting evidence", value: projectRelationship(finding.supportingEvidence) },
      { label: "Related requirements", value: projectRelationship(finding.relatedRequirements) },
    ],
  };
}
