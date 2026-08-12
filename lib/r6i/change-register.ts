import { resolveCurrentCase, type ContextRef, type ReviewId, type ReviewIndex } from "../r6c/index";
import type { CaseDetail, RelationshipState } from "../workspace-v2/view-model";
import { lineCountLabel, riskLabel } from "./labels";

export type ChangeRegisterRow = Readonly<{
  context: ContextRef;
  sourceIndex: number;
  path: string;
  lineCountLabel: string;
  riskLabel: string;
  recordedLocationCount: number;
  observations: RelationshipState;
  evidence: RelationshipState;
}>;

export type ChangeRegisterProjection =
  | Readonly<{ status: "unavailable" }>
  | Readonly<{
      status: "ready";
      recordCount: number;
      excludedDuplicateIdentityCount: number;
      rows: readonly ChangeRegisterRow[];
    }>;

export function projectChangeRegisterFromCase(detail: CaseDetail): Extract<ChangeRegisterProjection, { status: "ready" }> {
  const seen = new Set<string>();
  let excludedDuplicateIdentityCount = 0;
  const rows: ChangeRegisterRow[] = [];

  detail.changedFiles.forEach((file, sourceIndex) => {
    if (seen.has(file.artifactId)) {
      excludedDuplicateIdentityCount += 1;
      return;
    }
    seen.add(file.artifactId);
    rows.push({
      context: { kind: "change", id: file.artifactId },
      sourceIndex,
      path: file.path,
      lineCountLabel: lineCountLabel(file.additions, file.deletions),
      riskLabel: riskLabel(file.risk),
      recordedLocationCount: file.focusedRegions.length,
      observations: file.observations,
      evidence: file.evidence,
    });
  });

  return {
    status: "ready",
    recordCount: rows.length,
    excludedDuplicateIdentityCount,
    rows,
  };
}

export function projectChangeRegister(
  reviewIndex: ReviewIndex,
  reviewId: ReviewId,
  cases: readonly CaseDetail[],
): ChangeRegisterProjection {
  const detail = resolveCurrentCase(reviewIndex, reviewId, cases);
  return detail ? projectChangeRegisterFromCase(detail) : { status: "unavailable" };
}
