import { resolveContext, type ContextRef } from "../r6c/index";
import { projectRelationship, type RelationshipPresentation } from "../r6h/relationship-presentation";
import type { CaseDetail } from "../workspace-v2/view-model";
import {
  CHANGED_CONTENT_UNAVAILABLE_FILE,
  lineCountLabel,
  recordedLocationCountLabel,
  riskLabel,
} from "./labels";

export type ChangeContextProjection =
  | Readonly<{ status: "unavailable" }>
  | Readonly<{
      status: "ready";
      kind: "change";
      title: string;
      statement: string;
      standing: readonly Readonly<{
        label: "Line counts" | "Risk" | "Recorded locations";
        value: string;
      }>[];
      relationships: readonly Readonly<{
        label: "Recorded observations" | "Related evidence";
        value: RelationshipPresentation;
      }>[];
    }>;

export function projectChangeContext(detail: CaseDetail, context: ContextRef | null): ChangeContextProjection {
  if (!context || context.kind !== "change") return { status: "unavailable" };
  const resolved = resolveContext(detail, context);
  if (resolved.status !== "resolved" || resolved.context.kind !== "change") return { status: "unavailable" };
  const change = resolved.context.value;
  return {
    status: "ready",
    kind: "change",
    title: change.path,
    statement: CHANGED_CONTENT_UNAVAILABLE_FILE,
    standing: [
      { label: "Line counts", value: lineCountLabel(change.additions, change.deletions) },
      { label: "Risk", value: riskLabel(change.risk) },
      { label: "Recorded locations", value: recordedLocationCountLabel(change.focusedRegions.length) },
    ],
    relationships: [
      { label: "Recorded observations", value: projectRelationship(change.observations) },
      { label: "Related evidence", value: projectRelationship(change.evidence) },
    ],
  };
}
