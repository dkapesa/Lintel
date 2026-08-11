import { evidenceComposition, openBlockingCount } from "../workspace-v2/projections";
import type { CaseDetail } from "../workspace-v2/view-model";

export type VerificationStandingItem = Readonly<{
  label: "Blocking requirements" | "Missing proof" | "Stale evidence" | "Findings" | "Changed files" | "Risk level";
  value: string;
}>;

export type VerificationStanding = Readonly<{
  items: readonly VerificationStandingItem[];
  limitations: readonly string[];
  blockingRequirements: number;
  missingProof: number;
  staleEvidence: number;
  severeFindings: number;
}>;

function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function projectVerificationStanding(detail: CaseDetail): VerificationStanding {
  const composition = evidenceComposition(detail);
  const blockingRequirements = openBlockingCount(detail);
  const severeFindings = detail.findings.filter(
    (finding) => finding.severity === "HIGH" || finding.severity === "CRITICAL",
  ).length;
  const items: VerificationStandingItem[] = [
    { label: "Blocking requirements", value: `${blockingRequirements} open` },
    { label: "Missing proof", value: countLabel(composition.incomplete, "record") },
  ];
  if (composition.stale > 0) {
    items.push({ label: "Stale evidence", value: countLabel(composition.stale, "record") });
  }
  items.push(
    {
      label: "Findings",
      value: severeFindings > 0
        ? countLabel(severeFindings, "high-severity finding") + " recorded"
        : countLabel(detail.findings.length, "finding") + " recorded",
    },
    { label: "Changed files", value: countLabel(detail.changedFiles.length, "file") },
    { label: "Risk level", value: detail.riskLevel },
  );

  return {
    items,
    limitations: detail.context.limitations.filter((limitation) => limitation.trim().length > 0),
    blockingRequirements,
    missingProof: composition.incomplete,
    staleEvidence: composition.stale,
    severeFindings,
  };
}
