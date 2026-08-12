import { resolveContext, type ContextRef, type NarrowSurface } from "../r6c/index";
import type { CaseDetail, RelationshipState } from "../workspace-v2/view-model";
import { EVIDENCE_CLASS_LABELS, evidenceStatusLabel } from "./labels";

export type EvidenceRelationshipPresentation =
  | Readonly<{ status: "linked"; items: readonly Readonly<{ label: string; detail: string | null }>[]; unresolvedCount: number }>
  | Readonly<{ status: "none" }>
  | Readonly<{ status: "unavailable"; reason: string }>
  | Readonly<{ status: "unresolved"; unresolvedCount: number }>;

export type EvidenceContextProjection =
  | Readonly<{ status: "unavailable" }>
  | Readonly<{
      status: "ready";
      title: string;
      statement: string;
      standing: readonly Readonly<{
        label: "Status" | "Evidence class" | "Source" | "Provenance";
        value: string;
      }>[];
      relationships: readonly Readonly<{
        label: "Supports findings" | "Supports requirements" | "Related changed files";
        value: EvidenceRelationshipPresentation;
      }>[];
    }>;

export function projectRelationship(state: RelationshipState): EvidenceRelationshipPresentation {
  if (state.status === "linked") {
    return {
      status: "linked",
      items: state.related.map((item) => ({ label: item.label, detail: item.detail })),
      unresolvedCount: state.unresolved.length,
    };
  }
  if (state.status === "unavailable") return { status: "unavailable", reason: state.reason };
  if (state.status === "unresolved") return { status: "unresolved", unresolvedCount: state.unresolved.length };
  return { status: "none" };
}

export function projectEvidenceContext(detail: CaseDetail, context: ContextRef | null): EvidenceContextProjection {
  if (!context || context.kind !== "evidence") return { status: "unavailable" };
  const resolved = resolveContext(detail, context);
  if (resolved.status !== "resolved" || resolved.context.kind !== "evidence") return { status: "unavailable" };
  const record = resolved.context.value;
  return {
    status: "ready",
    title: record.title,
    statement: record.statement,
    standing: [
      { label: "Status", value: evidenceStatusLabel(record.status, record.stale) },
      { label: "Evidence class", value: EVIDENCE_CLASS_LABELS[record.evidenceClass] },
      { label: "Source", value: record.source },
      { label: "Provenance", value: record.provenance },
    ],
    relationships: [
      { label: "Supports findings", value: projectRelationship(record.supportsFindings) },
      { label: "Supports requirements", value: projectRelationship(record.supportsRequirements) },
      { label: "Related changed files", value: projectRelationship(record.relatedChanges) },
    ],
  };
}

export function inspectorIsActive(inspectorOpen: boolean, selectedReviewReady: boolean): boolean {
  return inspectorOpen && selectedReviewReady;
}

export function effectiveNarrowSurfaceForInspector(
  narrowSurface: NarrowSurface,
  inspectorActive: boolean,
): NarrowSurface {
  return narrowSurface === "inspector" && !inspectorActive ? "workspace" : narrowSurface;
}
