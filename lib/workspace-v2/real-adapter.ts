/* R1B.1 — Production Workspace V2 · real read-only Report adapter.

   The second `WorkspaceAdapter` implementation. Where the fixture adapter
   returns fixed sample data, this adapter reads one authoritative, already
   stored Lintel Report and projects it into the same serialisable
   `WorkspaceSnapshot` shapes the fixture adapter produces. It performs no
   writes, adds no storage key, and mutates nothing.

   AUTHORITATIVE SOURCE (r1b1). The current production Report source is
   browser-only: `/workspace` and `/report` read persisted Reports from the
   browser. Of the two browser Report paths, the durable report history
   (`lintel.reportHistory.v1`) is the one with an exported, validated read
   helper and a stable identifier — `readReportHistory` guards every entry
   (`isReport`, raw-diff rejection) and each entry carries a stable `createdAt`.
   The generated-report path (`lintel.generatedReport.v1`) is read inline in
   `/report` from `sessionStorage` with no reusable exported helper. This
   adapter therefore treats report history as authoritative and reuses
   `readReportHistory` rather than duplicating parse logic. Browser access is
   injected as a `Storage` so this module never reaches for `window` itself and
   stays out of presentational components (see `RealWorkspaceBootstrap`).

   SINGLE-REPORT SCOPE (r1b1). One selected Report is projected into a single
   case. No report-history grouping, no queue scan — that is R1B.2. The four
   operational groups are preserved structurally; the single case is placed by
   a documented, provisional recommendation → group mapping (see below).

   TRUTHFULNESS. Evidence and requirements are recomputed from the selected
   Report through the existing canonical projections `buildEvidenceHierarchy`
   and `buildMergeContract`, sharing one evidence hierarchy so that every
   requirement→evidence and decision→evidence reference resolves inside the
   snapshot. Relationships that the source cannot support are left empty and
   rendered as explicitly empty; none are fabricated (r1a §16.10). Real
   snapshots carry `provenance.source = "live"`, `isSample: false`, and never
   the word "Sample". A failed real load renders a truthful empty/unavailable
   state and never falls back to fixture content. */

import type { CanonicalReviewRunManifest } from "../canonical-review-run";
import {
  buildEvidenceHierarchy,
  type EvidenceHierarchySummary,
} from "../evidence-hierarchy";
import {
  buildMergeContract,
  type MergeContract,
} from "../merge-contract";
import {
  humanDecisionLedgerKeyForReport,
  projectHumanDecisionLedger,
  readHumanDecisionLedger,
  recommendationDivergenceForReport,
  type HumanDecisionApplicability,
  type HumanDecisionLedgerContext,
  type HumanDecisionLedgerEntry,
  type RecommendationDivergence,
} from "../human-decision-ledger";
import type { Report } from "../mock-report";
import {
  readReportHistory,
  REPORT_HISTORY_STORAGE_KEY,
  type ReportHistoryEntry,
} from "../report-history";
import {
  type WorkspaceAdapter,
  type WorkspaceSnapshotRequest,
} from "./adapter";
import { decisionMarkerFor } from "./projections";
import {
  type CaseContextView,
  type CaseDetail,
  type ChangedFileView,
  type DecisionApplicability,
  type DecisionDivergence,
  type DecisionPlateViewModel,
  type DecisionReference,
  type EvidenceView,
  type FindingView,
  type QueueCaseSummary,
  type QueueGroup,
  type QueueGroupId,
  type Recommendation,
  type RequirementView,
  type ReviewStatus,
  type WorkspaceEmptySnapshot,
  type WorkspaceIdentity,
  type WorkspaceProvenance,
  type WorkspaceReadySnapshot,
  type WorkspaceSnapshot,
  type WorkspaceUnavailableSnapshot,
} from "./view-model";

/* --- Provenance & identity -------------------------------------------- */

/* Real data is read from durable browser storage on this machine — it is a
   local report, not a claim of remote persistence, GitHub sync or team
   activity (r1b1 provenance rule). */
const REAL_PROVENANCE_LABEL = "Local report";

function liveProvenance(scenario: WorkspaceProvenance["scenario"]): WorkspaceProvenance {
  return {
    source: "live",
    isSample: false,
    label: REAL_PROVENANCE_LABEL,
    scenario,
  };
}

function identityForReport(report: Report): WorkspaceIdentity {
  return {
    workspaceId: "local-report",
    repository: report.pr.repository,
    label: report.pr.repository,
  };
}

const EMPTY_IDENTITY: WorkspaceIdentity = {
  workspaceId: "local-report",
  repository: "—",
  label: "Local reports",
};

/* --- Provisional grouping (single-report scope, r1b1) ------------------ */

/* R1B.1 does not read persisted review status (that store belongs to a later
   persistence milestone). Review status and queue group are therefore a
   provisional, documented projection of the Report's recommendation — enough
   to place one case truthfully without presenting it as authoritative workflow
   state. The four operational groups (r1a §16.5) are all declared; only the
   group holding the case is rendered. */
const GROUP_DEFINITIONS: { id: QueueGroupId; label: string; recommendations: Recommendation[] }[] = [
  { id: "attention", label: "Needs attention", recommendations: ["BLOCK", "TESTS_REQUIRED"] },
  { id: "review", label: "Review", recommendations: ["REVIEW_REQUIRED"] },
  { id: "ready", label: "Ready", recommendations: ["APPROVE"] },
  { id: "reviewed", label: "Reviewed", recommendations: [] },
];

function provisionalGroupId(recommendation: Recommendation): QueueGroupId {
  const match = GROUP_DEFINITIONS.find((group) =>
    group.recommendations.includes(recommendation),
  );
  /* Neutral Review group when no confident mapping exists (r1b1). */
  return match ? match.id : "review";
}

function provisionalReviewStatus(recommendation: Recommendation): ReviewStatus {
  if (recommendation === "BLOCK") return "Blocked";
  if (recommendation === "TESTS_REQUIRED") return "Tests requested";
  if (recommendation === "APPROVE") return "Ready to merge";
  return "Review required";
}

/* --- Field-level mapping ---------------------------------------------- */

function mapChangedFiles(report: Report): ChangedFileView[] {
  return report.changedFiles.map((file) => ({
    path: file.path,
    /* Absent line counts and risk stay null — never invented as 0 (r1a §7). */
    additions: typeof file.additions === "number" ? file.additions : null,
    deletions: typeof file.deletions === "number" ? file.deletions : null,
    risk: file.risk ?? null,
  }));
}

/* Stable finding id. This matches the id convention `buildEvidenceHierarchy`
   already assigns to a finding's own evidence records (`finding-${index}`,
   indexing the full `report.findings` array), which is what makes the
   finding↔evidence edge below a truthful projection rather than a guess. */
function findingIdForIndex(index: number): string {
  return `finding-${index}`;
}

function mapEvidence(
  summary: EvidenceHierarchySummary,
  knownFindingIds: ReadonlySet<string>,
): EvidenceView[] {
  return summary.records.map((record) => ({
    evidenceId: record.evidenceId,
    title: record.title,
    statement: record.statement,
    /* Domain unions are value-identical to the view-model unions (guarded by
       the parity assertions at the foot of this module). */
    evidenceClass: record.class,
    status: record.status,
    provenance: record.provenance,
    source: record.source,
    observedAt: record.observedAt,
    stale: record.stale,
    /* Only edges to findings that actually exist in this case are kept. */
    supportsFindingIds: record.relatedFindingIds.filter((id) => knownFindingIds.has(id)),
  }));
}

function mapFindings(
  report: Report,
  evidence: EvidenceView[],
): FindingView[] {
  /* Invert the canonical evidence→finding edges into finding→evidence. This is
     a deterministic projection of an existing canonical output, not a
     similarity or position heuristic. */
  const evidenceByFinding = new Map<string, string[]>();
  for (const record of evidence) {
    for (const findingId of record.supportsFindingIds) {
      const list = evidenceByFinding.get(findingId) ?? [];
      list.push(record.evidenceId);
      evidenceByFinding.set(findingId, list);
    }
  }

  return report.findings.map((finding, index) => {
    const findingId = findingIdForIndex(index);
    return {
      findingId,
      severity: finding.severity,
      title: finding.title,
      /* `Report.findings[].evidence` is the explanatory statement text. */
      statement: finding.evidence,
      action: finding.action,
      file: finding.file ?? "Location not recorded",
      provenance: finding.provenance ?? "Rule detected",
      category: finding.category,
      supportingEvidenceIds: evidenceByFinding.get(findingId) ?? [],
      /* finding→requirement edges are intentionally empty. The merge-contract
         clause id convention (`finding-${index}` over the HIGH/CRITICAL-only
         filtered subset) is not reconcilable with the full-array finding index
         above without semantic guessing, so no edge is asserted (r1a §16.10,
         RISK-A). Rendered as explicitly empty. */
      relatedRequirementIds: [],
    };
  });
}

function mapRequirements(
  contract: MergeContract,
  knownEvidenceIds: ReadonlySet<string>,
): RequirementView[] {
  return contract.clauses.map((clause) => ({
    requirementId: clause.clauseId,
    title: clause.title,
    statement: clause.statement,
    importance: clause.importance,
    status: clause.status,
    evidenceRequired: clause.evidenceRequired,
    /* Currently-supporting evidence produced by the same projection; filtered
       to ids present in this snapshot so every reference resolves. */
    supportingEvidenceIds: clause.currentSupportingEvidenceIds.filter((id) =>
      knownEvidenceIds.has(id),
    ),
    stale: clause.stale,
  }));
}

function mapContext(report: Report): CaseContextView {
  const limitations: string[] = [];
  if (report.verdict.confidence === "LOW") {
    limitations.push("Analysis confidence is low.");
  }
  if (report.findings.some((finding) => finding.provenance === "Model assisted")) {
    limitations.push("Some findings are model assisted and unverified.");
  }
  if (report.reportQuality?.status === "WARNING") {
    limitations.push("Report quality checks reported a warning.");
  }
  return {
    summary: report.verdict.summary,
    reviewerFocus: report.reviewerFocus?.map((item) => item.area) ?? [],
    limitations,
  };
}

/* --- Human Decision projection (read-only) ---------------------------- */

/* `projectHumanDecisionLedger` only ever returns the four top-level
   applicability values that the view-model union carries; `partially-applicable`
   and `superseded` are lineage-only and unreachable here. They are mapped
   defensively to `unavailable` so a future change is caught rather than
   silently mislabelled. */
function mapApplicability(value: HumanDecisionApplicability): DecisionApplicability {
  if (value === "applicable") return "applicable";
  if (value === "predates-current-head") return "predates-current-head";
  if (value === "withdrawn") return "withdrawn";
  if (value === "unavailable") return "unavailable";
  return "unavailable";
}

function mapDivergence(value: RecommendationDivergence): DecisionDivergence | null {
  if (value === "unavailable") return null;
  return value;
}

function makeReference(
  id: string,
  kind: DecisionReference["kind"],
  requirementsById: Map<string, RequirementView>,
  evidenceById: Map<string, EvidenceView>,
): DecisionReference {
  if (kind === "evidence") {
    const record = evidenceById.get(id);
    return {
      id,
      kind,
      label: record?.title ?? id,
      available: record !== undefined,
      stale: record?.stale ?? false,
      modelAssisted: record?.evidenceClass === "model-inferred",
    };
  }
  if (kind === "clause") {
    const requirement = requirementsById.get(id);
    return {
      id,
      kind,
      label: requirement?.title ?? id,
      available: requirement !== undefined,
      stale: requirement?.stale ?? false,
      modelAssisted: false,
    };
  }
  /* Assumptions are not surfaced as artifacts in the R1B.1 single-report
     projection, so an assumption reference cannot be resolved here. This is a
     truthful "reference could not be resolved", not a fabricated link. */
  return { id, kind: "assumption", label: id, available: false, stale: false, modelAssisted: false };
}

function inferReference(
  id: string,
  requirementsById: Map<string, RequirementView>,
  evidenceById: Map<string, EvidenceView>,
): DecisionReference {
  if (evidenceById.has(id)) return makeReference(id, "evidence", requirementsById, evidenceById);
  if (requirementsById.has(id)) return makeReference(id, "clause", requirementsById, evidenceById);
  return makeReference(id, "assumption", requirementsById, evidenceById);
}

function openBlockingRequirementCount(requirements: RequirementView[]): number {
  return requirements.filter((item) => item.importance === "blocking" && item.status === "open").length;
}

/* Read the authoritative Human Decision ledger and project it read-only.
   Distinguishes absent (empty, State A) from unavailable (read/projection
   failure, State I). Review-state-derived historical decisions are deliberately
   NOT synthesised (reviewState passed as null) so only genuinely recorded
   ledger entries surface; that historical synthesis belongs to a later
   persistence milestone. No mutation, no dialog, no write. */
function readDecisionProjection(
  storage: Storage,
  report: Report,
  canonicalRun: CanonicalReviewRunManifest | null,
  mergeContract: MergeContract,
  requirements: RequirementView[],
  evidence: EvidenceView[],
): DecisionPlateViewModel {
  const openBlocking = openBlockingRequirementCount(requirements);
  try {
    const key = humanDecisionLedgerKeyForReport(report);
    const context: HumanDecisionLedgerContext = {
      report,
      canonicalRun,
      mergeContract,
      currentHeadSha: canonicalRun?.headSha,
    };
    const ledger = readHumanDecisionLedger(storage, key, context, null);
    const projection = projectHumanDecisionLedger(ledger, context.currentHeadSha);
    const entry: HumanDecisionLedgerEntry | undefined = projection.latestEffectiveEntry;

    if (!entry || !entry.outcome) {
      /* State A — read succeeded, no engineer decision recorded. */
      return {
        status: "empty",
        recommendation: report.verdict.recommendation,
        openBlockingRequirements: openBlocking,
        isSample: false,
      };
    }

    const requirementsById = new Map(requirements.map((item) => [item.requirementId, item]));
    const evidenceById = new Map(evidence.map((item) => [item.evidenceId, item]));
    const applicability = mapApplicability(projection.applicability);
    const predates = applicability === "predates-current-head";

    const references: DecisionReference[] = [
      ...entry.referencedClauseIds.map((id) => makeReference(id, "clause", requirementsById, evidenceById)),
      ...entry.referencedEvidenceIds.map((id) => makeReference(id, "evidence", requirementsById, evidenceById)),
      ...entry.referencedAssumptionIds.map((id) => makeReference(id, "assumption", requirementsById, evidenceById)),
    ];
    const acceptedRiskReferences = entry.acceptedRiskReferences.map((id) =>
      inferReference(id, requirementsById, evidenceById),
    );

    return {
      status: "recorded",
      outcome: entry.outcome,
      actor: {
        displayLabel: entry.actor.displayLabel,
        source: entry.actor.source,
        role: entry.actor.role ?? null,
      },
      recordedAt: entry.recordedAt,
      applicability,
      applicableHeadSha: entry.applicableHeadSha ?? null,
      currentHeadSha: context.currentHeadSha ?? null,
      priorHeadSha: predates ? entry.applicableHeadSha ?? null : null,
      divergence: mapDivergence(recommendationDivergenceForReport(report, entry)),
      rationale: entry.reason ?? null,
      references,
      acceptedRiskReferences,
      needsReaffirmation: projection.reaffirmationRequired,
      isSample: false,
    };
  } catch (error) {
    /* State I — read / projection failure. Distinct from absent. */
    return {
      status: "unavailable",
      readError:
        error instanceof Error
          ? `Human Decision ledger could not be read: ${error.message}`
          : "Human Decision ledger could not be read.",
      isSample: false,
    };
  }
}

/* --- Case projection -------------------------------------------------- */

export type ReportProjectionInput = {
  report: Report;
  /* Stable case id (the history entry's stable `createdAt`). */
  caseId: string;
  /* The report's canonical analysis time (ISO) — threaded so the canonical
     projections are deterministic instead of stamping `Date.now()`. */
  createdAt: string;
  canonicalRun: CanonicalReviewRunManifest | null;
};

/* Pure projection of one Report into a `CaseDetail`, given an already-resolved
   Human Decision view model. Storage-free and deterministic, so it is unit
   testable in isolation. */
export function projectReportToCaseDetail(
  input: ReportProjectionInput,
  decision: DecisionPlateViewModel,
): CaseDetail {
  const { report, caseId, createdAt, canonicalRun } = input;
  const headSha = canonicalRun?.headSha;

  const evidenceSummary = buildEvidenceHierarchy(report, null, { createdAt, headSha });
  const contract = buildMergeContract({
    report,
    evidenceHierarchy: evidenceSummary,
    headSha,
    createdAt,
  });

  const knownFindingIds = new Set(report.findings.map((_, index) => findingIdForIndex(index)));
  const evidence = mapEvidence(evidenceSummary, knownFindingIds);
  const knownEvidenceIds = new Set(evidence.map((item) => item.evidenceId));
  const findings = mapFindings(report, evidence);
  const requirements = mapRequirements(contract, knownEvidenceIds);

  return {
    caseId,
    github: {
      repository: report.pr.repository,
      pullRequestNumber: report.pr.number,
      branch: report.pr.branch,
      /* head SHA lives on the canonical run manifest, not on the Report; null
         when no run was recorded (disables stale detection truthfully). */
      headSha: headSha ?? null,
      author: report.pr.author.trim() || "Author not recorded",
      updatedAt: report.pr.updatedAt,
    },
    recommendation: report.verdict.recommendation,
    riskLevel: report.verdict.riskLevel,
    riskScore: report.verdict.riskScore,
    confidence: report.verdict.confidence,
    reviewStatus: provisionalReviewStatus(report.verdict.recommendation),
    executiveSummary: report.verdict.summary,
    changedFiles: mapChangedFiles(report),
    findings,
    evidence,
    requirements,
    /* Readiness movement needs a previous analysis run to compare against;
       R1B.1 reads a single stored head. Truthfully unavailable, not zeroed. */
    readiness: {
      available: false,
      reason:
        "Readiness movement requires a previous analysis run to compare against; this projection reads a single stored Report head with no recorded prior run.",
    },
    decision,
    context: mapContext(report),
  };
}

/* Build the case's Human Decision from storage, then the full `CaseDetail`. */
function projectEntry(entry: ReportHistoryEntry, storage: Storage): CaseDetail {
  const report = entry.report;
  const canonicalRun = entry.canonicalRun ?? null;
  const caseId = `report-${entry.createdAt}`;
  const input: ReportProjectionInput = {
    report,
    caseId,
    createdAt: entry.createdAt,
    canonicalRun,
  };

  /* Build artifacts once to resolve decision references, then project. */
  const headSha = canonicalRun?.headSha;
  const evidenceSummary = buildEvidenceHierarchy(report, null, { createdAt: entry.createdAt, headSha });
  const contract = buildMergeContract({
    report,
    evidenceHierarchy: evidenceSummary,
    headSha,
    createdAt: entry.createdAt,
  });
  const knownFindingIds = new Set(report.findings.map((_, index) => findingIdForIndex(index)));
  const evidence = mapEvidence(evidenceSummary, knownFindingIds);
  const knownEvidenceIds = new Set(evidence.map((item) => item.evidenceId));
  const requirements = mapRequirements(contract, knownEvidenceIds);

  const decision = readDecisionProjection(storage, report, canonicalRun, contract, requirements, evidence);
  return projectReportToCaseDetail(input, decision);
}

/* --- Snapshot assembly ------------------------------------------------ */

function buildGroups(summary: QueueCaseSummary): QueueGroup[] {
  return GROUP_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    cases: summary.groupId === definition.id ? [summary] : [],
  })).filter((group) => group.cases.length > 0);
}

function summaryForCase(detail: CaseDetail): QueueCaseSummary {
  return {
    caseId: detail.caseId,
    pullRequestNumber: detail.github.pullRequestNumber,
    title: detail.github.repository ? detail.github.repository : detail.github.branch,
    repository: detail.github.repository,
    recommendation: detail.recommendation,
    riskLevel: detail.riskLevel,
    groupId: provisionalGroupId(detail.recommendation),
    reviewStatus: detail.reviewStatus,
    decisionMarker: decisionMarkerFor(detail.decision),
    currentHeadSha: detail.github.headSha,
  };
}

function readySnapshot(report: Report, detail: CaseDetail, title: string): WorkspaceReadySnapshot {
  const summary: QueueCaseSummary = { ...summaryForCase(detail), title };
  return {
    status: "ready",
    identity: identityForReport(report),
    provenance: liveProvenance("default"),
    groups: buildGroups(summary),
    cases: [detail],
    defaultCaseId: detail.caseId,
  };
}

function emptySnapshot(): WorkspaceEmptySnapshot {
  return {
    status: "empty",
    identity: EMPTY_IDENTITY,
    provenance: liveProvenance("empty"),
  };
}

function unavailableSnapshot(reason: string): WorkspaceUnavailableSnapshot {
  return {
    status: "unavailable",
    identity: EMPTY_IDENTITY,
    provenance: liveProvenance("unavailable"),
    reason,
  };
}

/* Select the authoritative entry: an explicit stable id when supplied,
   otherwise the most recent stored Report (history is newest-first). */
function selectEntry(
  history: ReportHistoryEntry[],
  reportId: string | null | undefined,
): ReportHistoryEntry | null {
  if (reportId) {
    const wanted = reportId.startsWith("report-") ? reportId.slice("report-".length) : reportId;
    return history.find((entry) => entry.createdAt === wanted) ?? null;
  }
  return history[0] ?? null;
}

/* --- The adapter ------------------------------------------------------ */

/* Distinguish an absent / genuinely-empty history from corrupt storage without
   duplicating Report validation. `readReportHistory` intentionally swallows
   corruption (returns [] and prunes), so a raw preflight is required to tell
   "no reports" apart from "unreadable reports". Returns null when the caller
   should proceed to project the validated history. */
type HistoryPreflight =
  | { kind: "proceed" }
  | { kind: "empty" }
  | { kind: "unavailable"; reason: string };

function preflightHistory(storage: Storage): HistoryPreflight {
  const raw = storage.getItem(REPORT_HISTORY_STORAGE_KEY);
  /* Key absent — the store has never held a report. Genuinely empty. */
  if (raw === null) return { kind: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* Present but invalid JSON — corruption, not emptiness. Return before
       touching `readReportHistory`, which would prune/remove the key (a write)
       on this path. */
    return { kind: "unavailable", reason: "invalid JSON" };
  }

  /* Present but not the expected array shape — unsupported structure/version. */
  if (!Array.isArray(parsed)) {
    return { kind: "unavailable", reason: "unsupported structure" };
  }

  /* A valid, genuinely-empty history. */
  if (parsed.length === 0) return { kind: "empty" };

  return { kind: "proceed" };
}

export function createRealWorkspaceAdapter(storage: Storage): WorkspaceAdapter {
  return {
    async loadSnapshot(request: WorkspaceSnapshotRequest): Promise<WorkspaceSnapshot> {
      try {
        const preflight = preflightHistory(storage);
        if (preflight.kind === "empty") {
          /* No stored Report — a truthful empty state, never fixture content. */
          return emptySnapshot();
        }
        if (preflight.kind === "unavailable") {
          /* Corrupt storage must not collapse to an empty queue. */
          return unavailableSnapshot(
            `The stored report history could not be read (${preflight.reason}). This is a projection failure, not an empty workspace.`,
          );
        }

        /* Preflight proved a non-empty array; project the validated entries. */
        const history = readReportHistory(storage);
        if (history.length === 0) {
          /* The raw history held entries but none survived validation —
             unreadable content, distinct from an empty history. */
          return unavailableSnapshot(
            "The stored report history contains entries but none could be read as a valid report. This is a projection failure, not an empty workspace.",
          );
        }

        const entry = selectEntry(history, request.reportId);
        if (!entry) {
          /* An explicit report id that does not resolve is a failed request,
             distinct from an empty store — surfaced as unavailable, not
             fixture data. */
          return unavailableSnapshot(
            `No stored report matches the requested id. It may have been cleared or replaced. ${history.length} report${history.length === 1 ? " is" : "s are"} available in this browser.`,
          );
        }

        const detail = projectEntry(entry, storage);
        return readySnapshot(entry.report, detail, entry.report.pr.title);
      } catch (error) {
        /* Any parse / projection failure is a projection failure, never an
           empty queue and never a silent fixture fallback. */
        return unavailableSnapshot(
          error instanceof Error
            ? `The stored report could not be projected: ${error.message}`
            : "The stored report could not be projected.",
        );
      }
    },
  };
}

/* --- Compile-time union parity guard (r1a §6 RISK-D) ------------------ */

/* These assignments fail to compile if a production union drifts from the
   value-identical view-model union this adapter relies on. They cost nothing
   at runtime and are the parity guard the R1B.0 contract asked R1B.1 to add. */
import type { EvidenceClass as DomainEvidenceClass } from "../evidence-hierarchy";
import type {
  MergeContractClauseStatus as DomainClauseStatus,
  MergeContractImportance as DomainImportance,
} from "../merge-contract";
import type { HumanDecisionOutcome as DomainOutcome } from "../human-decision-ledger";
import type {
  EvidenceClass as ViewEvidenceClass,
  DecisionOutcome as ViewDecisionOutcome,
  RequirementImportance as ViewImportance,
  RequirementStatus as ViewRequirementStatus,
} from "./view-model";

/* eslint-disable @typescript-eslint/no-unused-vars */
type _EvidenceClassParity = DomainEvidenceClass extends ViewEvidenceClass
  ? ViewEvidenceClass extends DomainEvidenceClass
    ? true
    : never
  : never;
type _OutcomeParity = DomainOutcome extends ViewDecisionOutcome
  ? ViewDecisionOutcome extends DomainOutcome
    ? true
    : never
  : never;
type _ImportanceParity = DomainImportance extends ViewImportance
  ? ViewImportance extends DomainImportance
    ? true
    : never
  : never;
/* Clause status is a value-identical superset match with requirement status. */
type _RequirementStatusParity = DomainClauseStatus extends ViewRequirementStatus
  ? ViewRequirementStatus extends DomainClauseStatus
    ? true
    : never
  : never;

const _evidenceClassParity: _EvidenceClassParity = true;
const _outcomeParity: _OutcomeParity = true;
const _importanceParity: _ImportanceParity = true;
const _requirementStatusParity: _RequirementStatusParity = true;
void _evidenceClassParity;
void _outcomeParity;
void _importanceParity;
void _requirementStatusParity;
/* eslint-enable @typescript-eslint/no-unused-vars */
