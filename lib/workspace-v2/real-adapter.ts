/* R1B.1 / R1B.2 — Production Workspace V2 · real read-only Report adapter.

   The second `WorkspaceAdapter` implementation. Where the fixture adapter
   returns fixed sample data, this adapter reads the stored Lintel Report
   history and projects it into the same serialisable `WorkspaceSnapshot`
   shapes the fixture adapter produces. It performs no writes, adds no storage
   key, and mutates nothing — the injected `Storage` is wrapped read-only at the
   adapter boundary so even read helpers that prune on read cannot persist.

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

   QUEUE SCOPE (r1b2). Every valid report-history entry is projected into one
   stable case; each case appears exactly once and is placed into exactly one of
   the four operational groups (Needs attention / Review / Ready / Reviewed) by
   the pure, documented precedence in `queue-projection.ts` (recorded review
   state → applicable Human Decision → open blockers → recommendation fallback).
   An explicit `reportId` selects a specific case; an unknown id is unavailable,
   never a fallback. Distinct analysis entries stay distinct — no PR-level
   collapse.

   TRUTHFULNESS. Evidence and requirements are recomputed from each stored
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
  readReviewStates,
  reviewStateKeyForReport,
  REVIEW_STATE_STORAGE_KEY,
  type ReportReviewState,
} from "../review-state";
import {
  conditionKey,
  readConditionProgress,
  reportConditions,
} from "../condition-progress";
import {
  type WorkspaceAdapter,
  type WorkspaceSnapshotRequest,
} from "./adapter";
import { decisionMarkerFor } from "./projections";
import {
  assembleCaseArtifacts,
  type ChangedFileSeed,
  type EvidenceSeed,
  type FindingSeed,
  type RequirementSeed,
} from "./relationships";
import { readOnlyStorage } from "./read-only-storage";
import {
  buildQueueGroups,
  groupForCase,
  pickDefaultCaseId,
  type CaseGroupingInput,
  type GroupingResult,
  type OrderableCase,
  type QueueItem,
  type ReviewStateSignal,
} from "./queue-projection";
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

/* One identity for the whole real queue. A single repository names itself;
   a queue spanning several repositories is labelled generically rather than
   claiming one repository's name for all of them. */
function identityForHistory(history: ReportHistoryEntry[]): WorkspaceIdentity {
  const repositories = new Set(history.map((entry) => entry.report.pr.repository));
  if (repositories.size === 1 && history[0]) {
    const repository = history[0].report.pr.repository;
    return { workspaceId: "local-report", repository, label: repository };
  }
  return { workspaceId: "local-report", repository: "—", label: "Local reports" };
}

const EMPTY_IDENTITY: WorkspaceIdentity = {
  workspaceId: "local-report",
  repository: "—",
  label: "Local reports",
};

/* --- Review-state channel (read-only, r1b2) --------------------------- */

/* The authoritative recorded review state lives in `lintel.reviewState.v1`
   (read via `readReviewStates`). R1B.2 reads it read-only and never writes it.
   The channel distinguishes an unreadable store (present but corrupt/wrong
   shape) from a genuinely untouched one, so grouping can represent "review
   state unavailable" separately from "no recorded state" (r1b2 review-state
   contract). `readReviewStates` itself swallows corruption and returns {}, so
   this raw preflight is what surfaces the unavailable case. */
type ReviewStateChannel =
  | { available: true; states: Record<string, ReportReviewState> }
  | { available: false };

function readReviewStateChannel(storage: Storage): ReviewStateChannel {
  let raw: string | null;
  try {
    raw = storage.getItem(REVIEW_STATE_STORAGE_KEY);
  } catch {
    return { available: false };
  }
  /* Absent key — the store has never been written. Untouched, not unreadable. */
  if (raw === null) return { available: true, states: {} };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { available: false };
    }
  } catch {
    /* Present but unparseable — corruption, kept distinct from untouched. */
    return { available: false };
  }
  return { available: true, states: readReviewStates(storage) };
}

/* Resolve the review-state signal for one report.

   A recorded state carries a non-null `updatedAt`; the recommendation-derived
   default (updatedAt null, see `defaultReviewState`) is NOT authoritative and
   never groups a case as if a human had set its status.

   The existing review-state key (`reviewStateKeyForReport` = repository/title/
   input-label) is NOT unique per history entry: several analysis entries for
   the same PR/report identity can share it. A recorded status is therefore only
   authoritative when its key maps to exactly ONE projected entry. When the key
   is shared by several entries the status cannot be attributed to a specific
   analysis or head, so it is reported as `ambiguous` — never silently applied
   to (say) the newest entry, which could let a moved/new head inherit Reviewed
   or Ready from a different analysis. `keyCounts` is precomputed once over the
   whole validated history. No schema or key change is made. */
function reviewSignalFor(
  channel: ReviewStateChannel,
  report: Report,
  keyCounts: Map<string, number>,
): ReviewStateSignal {
  if (!channel.available) return { kind: "unavailable" };
  const key = reviewStateKeyForReport(report);
  const state = channel.states[key];
  if (!state || state.updatedAt === null) return { kind: "untouched" };
  if ((keyCounts.get(key) ?? 0) > 1) return { kind: "ambiguous" };
  return { kind: "recorded", status: state.status, updatedAt: state.updatedAt };
}

/* Unresolved (uncleared) merge conditions for THIS report. The condition
   progress key is derived from the report's own identity + condition text
   (`conditionProgressReportKey`), so a read here is authoritative to the report
   and never picks up progress recorded against a different report, head or
   condition set (r1b2 condition-progress contract). Reads are read-only. */
function unresolvedConditionCount(storage: Storage, report: Report): number {
  const conditions = reportConditions(report);
  if (conditions.length === 0) return 0;
  const cleared = readConditionProgress(storage, report, conditions);
  return conditions.filter((condition) => !cleared.has(conditionKey(condition))).length;
}

/* Displayed review status for a case that has NO authoritative recorded state.
   Derived from the resolved grouping result (not from recommendation alone) so
   the Inspector's status label can never contradict the queue group — e.g. an
   APPROVE report with an open blocker groups under Needs attention and is shown
   as "Needs work", not "Ready to merge". "Reviewed" is only ever produced from
   an authoritative recorded state or an applicable Human Decision (the only
   ways a case reaches the reviewed group without a recorded review state). */
function displayedReviewStatus(
  grouping: GroupingResult,
  recommendation: Recommendation,
): ReviewStatus {
  switch (grouping.groupId) {
    case "reviewed":
      return "Reviewed";
    case "ready":
      return "Ready to merge";
    case "review":
      return "Review required";
    case "attention":
      if (recommendation === "BLOCK") return "Blocked";
      if (recommendation === "TESTS_REQUIRED") return "Tests requested";
      /* Blockers, unresolved conditions or a contradictory APPROVE. */
      return "Needs work";
  }
}

/* --- Canonical case-projection context (built once per case) ---------- */

/* Stable finding id, indexing the FULL `report.findings` array. This is the id
   convention `buildEvidenceHierarchy` assigns to each finding's own evidence
   record (`finding-${index}`), which is exactly what makes the finding↔evidence
   edge a truthful inversion of a canonical output rather than a guess. */
function findingIdForIndex(index: number): string {
  return `finding-${index}`;
}

/* The exact, documented reason Observation ↔ Requirement is NOT asserted for
   real reports. Merge-contract clause finding references (`finding-${k}`) are
   indexed over a severity-filtered, capped subset (HIGH/CRITICAL findings,
   first six — see `buildMergeContract`), a DIFFERENT id namespace than the
   canonical full-array `finding-${index}` the evidence hierarchy uses. The two
   cannot be reconciled without replicating an internal projection predicate, so
   no edge is asserted rather than a fabricated one (r1a §16.10, RISK-A). */
const REQUIREMENT_LINKAGE_UNAVAILABLE =
  "Requirement linkage is not derivable from this report version.";

/* One canonical projection context per Report history entry. The evidence
   hierarchy and merge contract — the two expensive canonical builds — are
   computed exactly once here and reused for artifacts, grouping and the Human
   Decision projection, replacing the previous per-case double build (R1B.3
   performance). Pure and deterministic given the entry. */
export type CaseProjectionContext = {
  report: Report;
  caseId: string;
  createdAt: string;
  canonicalRun: CanonicalReviewRunManifest | null;
  headSha: string | undefined;
  evidenceSummary: EvidenceHierarchySummary;
  contract: MergeContract;
  changedFiles: ChangedFileView[];
  findings: FindingView[];
  evidence: EvidenceView[];
  requirements: RequirementView[];
};

function buildCaseProjectionContext(
  report: Report,
  caseId: string,
  createdAt: string,
  canonicalRun: CanonicalReviewRunManifest | null,
): CaseProjectionContext {
  const headSha = canonicalRun?.headSha;

  /* The single canonical builds for the whole case. */
  const evidenceSummary = buildEvidenceHierarchy(report, null, { createdAt, headSha });
  const contract = buildMergeContract({
    report,
    evidenceHierarchy: evidenceSummary,
    headSha,
    createdAt,
  });

  const changedFileSeeds: ChangedFileSeed[] = report.changedFiles.map((file) => ({
    path: file.path,
    /* Absent line counts and risk stay null — never invented as 0 (r1a §7). */
    additions: typeof file.additions === "number" ? file.additions : null,
    deletions: typeof file.deletions === "number" ? file.deletions : null,
    risk: file.risk ?? null,
  }));

  const findingSeeds: FindingSeed[] = report.findings.map((finding, index) => ({
    findingId: findingIdForIndex(index),
    severity: finding.severity,
    title: finding.title,
    /* `Report.findings[].evidence` is the explanatory statement text. */
    statement: finding.evidence,
    action: finding.action,
    /* Raw recorded location, preserved verbatim; the assembler parses a bare
       path from it only when a numeric line suffix is unambiguous. */
    location: typeof finding.file === "string" ? finding.file : null,
    provenance: finding.provenance ?? "Rule detected",
    category: finding.category,
  }));

  const evidenceSeeds: EvidenceSeed[] = evidenceSummary.records.map((record) => ({
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
    /* Raw canonical evidence→finding references; the assembler resolves each and
       surfaces any that fall outside this case rather than pre-filtering. */
    relatedFindingIds: record.relatedFindingIds,
    /* Change ↔ Evidence is asserted ONLY from the canonical "Changed files"
       evidence records, which carry the exact changed path in
       `supportingReference`. No other record is treated as a change edge, and
       no edge is inferred from shared wording. */
    changePath:
      record.source === "Changed files" && typeof record.supportingReference === "string"
        ? record.supportingReference
        : null,
  }));

  const requirementSeeds: RequirementSeed[] = contract.clauses.map((clause) => ({
    requirementId: clause.clauseId,
    title: clause.title,
    statement: clause.statement,
    importance: clause.importance,
    status: clause.status,
    evidenceRequired: clause.evidenceRequired,
    stale: clause.stale,
    /* Raw canonical current supporting evidence; resolved by the assembler so
       an unresolved stored reference is surfaced, not silently dropped. */
    supportingEvidenceIds: clause.currentSupportingEvidenceIds,
  }));

  const artifacts = assembleCaseArtifacts({
    changedFiles: changedFileSeeds,
    findings: findingSeeds,
    evidence: evidenceSeeds,
    requirements: requirementSeeds,
    /* Observation ↔ Requirement is not deterministically reconcilable for real
       reports (see `REQUIREMENT_LINKAGE_UNAVAILABLE`). */
    requirementLinkage: { derivable: false, reason: REQUIREMENT_LINKAGE_UNAVAILABLE },
  });

  return {
    report,
    caseId,
    createdAt,
    canonicalRun,
    headSha,
    evidenceSummary,
    contract,
    changedFiles: artifacts.changedFiles,
    findings: artifacts.findings,
    evidence: artifacts.evidence,
    requirements: artifacts.requirements,
  };
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
  /* Assumptions are not surfaced as artifacts in the per-case projection, so an
     assumption reference cannot be resolved here. This is a truthful "reference
     could not be resolved", not a fabricated link. */
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

/* Pure assembly of a fully-projected `CaseDetail` from an already-built
   canonical context and an already-resolved Human Decision view model. No
   canonical rebuild happens here — the context owns the single evidence
   hierarchy, merge contract and linked artifacts for the case, so this is a
   deterministic, storage-free composition. */
export function projectContextToCaseDetail(
  context: CaseProjectionContext,
  decision: DecisionPlateViewModel,
  reviewStatus: ReviewStatus,
): CaseDetail {
  const { report, caseId, headSha } = context;

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
    /* Authoritative recorded review status when one exists; otherwise the
       recommendation-derived provisional label (resolved by the caller). */
    reviewStatus,
    executiveSummary: report.verdict.summary,
    changedFiles: context.changedFiles,
    findings: context.findings,
    evidence: context.evidence,
    requirements: context.requirements,
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

/* One fully-projected real case: its `CaseDetail`, the group it deterministically
   belongs to, the fields needed to order it within that group, and whether its
   recorded review state was ambiguous (shared key) so the workspace can surface
   that limitation. */
type CaseProjection = {
  detail: CaseDetail;
  createdAt: string;
  groupId: QueueGroupId;
  order: OrderableCase;
  reviewStateAmbiguous: boolean;
};

/* The authoritative moment a case was reviewed/decided, used only to order the
   Reviewed group: an AUTHORITATIVE recorded review-state `updatedAt` (never an
   ambiguous/shared one), else an applicable decision's `recordedAt`, else null
   (unknown, ordered last). */
function authoritativeDecidedAt(
  reviewSignal: ReviewStateSignal,
  decision: DecisionPlateViewModel,
): string | null {
  if (reviewSignal.kind === "recorded") return reviewSignal.updatedAt;
  if (
    decision.status === "recorded" &&
    decision.applicability === "applicable" &&
    !decision.needsReaffirmation
  ) {
    return decision.recordedAt;
  }
  return null;
}

/* Project one history entry into a case, reading review state, condition
   progress and the Human Decision ledger read-only, then deriving the group
   and ordering signals through the pure `queue-projection` module. */
function projectCase(
  entry: ReportHistoryEntry,
  storage: Storage,
  reviewChannel: ReviewStateChannel,
  keyCounts: Map<string, number>,
): CaseProjection {
  const report = entry.report;
  const canonicalRun = entry.canonicalRun ?? null;
  const caseId = `report-${entry.createdAt}`;

  /* The single canonical build for the whole case: evidence hierarchy, merge
     contract and the fully-linked artifact graph, reused for decision
     resolution, grouping and the final `CaseDetail`. */
  const context = buildCaseProjectionContext(report, caseId, entry.createdAt, canonicalRun);

  const decision = readDecisionProjection(
    storage,
    report,
    canonicalRun,
    context.contract,
    context.requirements,
    context.evidence,
  );

  const reviewState = reviewSignalFor(reviewChannel, report, keyCounts);
  const openBlocking = openBlockingRequirementCount(context.requirements);
  const unresolvedConditions = unresolvedConditionCount(storage, report);

  const groupingInput: CaseGroupingInput = {
    recommendation: report.verdict.recommendation,
    reviewState,
    decision,
    openBlockingRequirements: openBlocking,
    unresolvedConditions,
  };
  const grouping = groupForCase(groupingInput);

  /* Authoritative recorded status when unambiguously bound to this entry;
     otherwise a grouping-consistent label so the Inspector never contradicts
     the queue group. */
  const reviewStatus: ReviewStatus =
    reviewState.kind === "recorded"
      ? reviewState.status
      : displayedReviewStatus(grouping, report.verdict.recommendation);

  const detail = projectContextToCaseDetail(context, decision, reviewStatus);

  const decisionApplicable =
    decision.status === "recorded" &&
    decision.applicability === "applicable" &&
    !decision.needsReaffirmation;

  const order: OrderableCase = {
    caseId,
    createdAt: entry.createdAt,
    riskLevel: report.verdict.riskLevel,
    isBlocking:
      report.verdict.recommendation === "BLOCK" ||
      openBlocking > 0 ||
      unresolvedConditions > 0,
    isAccountableReview:
      report.verdict.recommendation === "REVIEW_REQUIRED" ||
      (reviewState.kind === "recorded" && reviewState.status === "Review required") ||
      (decisionApplicable &&
        decision.status === "recorded" &&
        decision.outcome === "review-required"),
    decidedAt: authoritativeDecidedAt(reviewState, decision),
  };

  return {
    detail,
    createdAt: entry.createdAt,
    groupId: grouping.groupId,
    order,
    reviewStateAmbiguous: reviewState.kind === "ambiguous",
  };
}

/* --- Snapshot assembly ------------------------------------------------ */

/* Restrained disambiguation token for cases that share a PR number: the short
   head SHA when known (distinguishes multiple heads for one PR), else the
   analysis date from the history entry. Both are proven by stored data; it is
   never invented activity. Only set on shared-PR cases (see `buildRealCases`). */
function provenanceHintFor(detail: CaseDetail, createdAt: string): string {
  const head = detail.github.headSha;
  if (head && head.trim().length >= 7) return `head ${head.slice(0, 7)}`;
  return `analysed ${createdAt.slice(0, 10)}`;
}

function summaryForCase(
  detail: CaseDetail,
  groupId: QueueGroupId,
  title: string,
  provenanceHint: string | null,
): QueueCaseSummary {
  return {
    caseId: detail.caseId,
    pullRequestNumber: detail.github.pullRequestNumber,
    title,
    repository: detail.github.repository,
    recommendation: detail.recommendation,
    riskLevel: detail.riskLevel,
    groupId,
    /* Authoritative recorded review status, or the provisional label. The Queue
       row does not render this field; the Inspector case-context header does. */
    reviewStatus: detail.reviewStatus,
    decisionMarker: decisionMarkerFor(detail.decision),
    currentHeadSha: detail.github.headSha,
    provenanceHint,
  };
}

/* Logical PR identity for shared-report detection: a PR is identified by its
   repository AND pull-request number together (`repository#number`), so e.g.
   `acme/profile-api#1` and `vercel/next.js#1` are different PRs. Number alone
   would wrongly merge same-numbered PRs across repositories. */
function prIdentity(detail: CaseDetail): string {
  return `${detail.github.repository}#${detail.github.pullRequestNumber}`;
}

/* Project every valid entry, then build queue items. Provenance hints are set
   only for cases whose PR — the same repository and pull-request number —
   appears more than once, so distinct reports for the same PR are
   distinguishable without crowding singleton rows. One case per history entry;
   repeated analyses are never collapsed. Titles come from each report's own PR
   title. */
function buildRealCases(
  projections: CaseProjection[],
  history: ReportHistoryEntry[],
): QueueItem[] {
  const prCounts = new Map<string, number>();
  for (const projection of projections) {
    const pr = prIdentity(projection.detail);
    prCounts.set(pr, (prCounts.get(pr) ?? 0) + 1);
  }

  return projections.map((projection, index) => {
    const pr = prIdentity(projection.detail);
    const shared = (prCounts.get(pr) ?? 0) > 1;
    const hint = shared ? provenanceHintFor(projection.detail, projection.createdAt) : null;
    const title = history[index].report.pr.title;
    return {
      summary: summaryForCase(projection.detail, projection.groupId, title, hint),
      order: projection.order,
    };
  });
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

/* Resolve an explicit stable report id to its history entry. Returns null when
   an id was supplied but does not match any stored entry — an unknown explicit
   id is a failed request (→ unavailable), never a silent fallback. Case ids use
   the `report-<createdAt>` convention; a bare `createdAt` is also accepted. */
function resolveExplicitEntry(
  history: ReportHistoryEntry[],
  reportId: string | null | undefined,
): ReportHistoryEntry | null {
  if (!reportId) return null;
  const wanted = reportId.startsWith("report-") ? reportId.slice("report-".length) : reportId;
  return history.find((entry) => entry.createdAt === wanted) ?? null;
}

/* --- The adapter ------------------------------------------------------ */

/* Distinguish an absent / genuinely-empty history from corrupt storage without
   duplicating Report validation. `readReportHistory` intentionally swallows
   corruption (returns [] and prunes), so a raw preflight is required to tell
   "no reports" apart from "unreadable reports". The raw entry count is carried
   through so partial-history omissions can be surfaced truthfully. */
type HistoryPreflight =
  | { kind: "proceed"; rawCount: number }
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

  return { kind: "proceed", rawCount: parsed.length };
}

/* Compose the restrained, truthful limitations for a ready snapshot: partial
   history (some stored reports could not be projected or fall outside the
   retained window) and an unreadable review-state store (grouping fell back).
   Never claims completeness it cannot prove. */
function buildLimitations(
  projectedCount: number,
  rawCount: number,
  reviewChannel: ReviewStateChannel,
  ambiguousCount: number,
): string[] {
  const limitations: string[] = [];
  if (projectedCount < rawCount) {
    const omitted = rawCount - projectedCount;
    limitations.push(
      `${projectedCount} of ${rawCount} stored reports could be projected; ` +
        `${omitted} could not be read as valid reports or fall outside the retained history window and ` +
        `${omitted === 1 ? "is" : "are"} omitted from the queue.`,
    );
  }
  if (!reviewChannel.available) {
    limitations.push(
      "Recorded review state could not be read; affected cases are grouped from decision, " +
        "condition and recommendation signals rather than a recorded review status.",
    );
  }
  if (ambiguousCount > 0) {
    limitations.push(
      `Recorded review state could not be assigned to a specific analysis entry for ` +
        `${ambiguousCount} case${ambiguousCount === 1 ? "" : "s"} that share a report identity; ` +
        `${ambiguousCount === 1 ? "it is" : "they are"} grouped from decision, condition and ` +
        `recommendation signals instead.`,
    );
  }
  return limitations;
}

export function createRealWorkspaceAdapter(rawStorage: Storage): WorkspaceAdapter {
  /* Wrap once at the boundary: the whole adapter — and every production read
     helper it calls — is now structurally incapable of writing (r1b2 §11). */
  const storage = readOnlyStorage(rawStorage);

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

        /* Preflight proved a non-empty array; project ALL validated entries. */
        const history = readReportHistory(storage);
        if (history.length === 0) {
          /* The raw history held entries but none survived validation —
             unreadable content, distinct from an empty history. */
          return unavailableSnapshot(
            "The stored report history contains entries but none could be read as a valid report. This is a projection failure, not an empty workspace.",
          );
        }

        /* An explicit report id must resolve to a stored entry, or the whole
           request is unavailable (never a fallback selection). */
        let explicitCaseId: string | null = null;
        if (request.reportId) {
          const explicitEntry = resolveExplicitEntry(history, request.reportId);
          if (!explicitEntry) {
            return unavailableSnapshot(
              `No stored report matches the requested id. It may have been cleared or replaced. ${history.length} report${history.length === 1 ? " is" : "s are"} available in this browser.`,
            );
          }
          explicitCaseId = `report-${explicitEntry.createdAt}`;
        }

        const reviewChannel = readReviewStateChannel(storage);

        /* Count how many valid entries share each review-state key, so a shared
           (ambiguous) recorded status is never attributed to one specific
           entry. Computed once over the whole validated history. */
        const keyCounts = new Map<string, number>();
        for (const entry of history) {
          const key = reviewStateKeyForReport(entry.report);
          keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
        }

        /* One case per valid entry; each appears exactly once. */
        const projections = history.map((entry) =>
          projectCase(entry, storage, reviewChannel, keyCounts),
        );
        const items = buildRealCases(projections, history);
        const groups = buildQueueGroups(items);

        /* Deterministic default: explicit valid id, else first case of the
           first non-empty group in Needs attention → Review → Ready → Reviewed
           precedence. */
        const defaultCaseId = pickDefaultCaseId(groups, explicitCaseId);
        if (!defaultCaseId) {
          return unavailableSnapshot(
            "Valid reports were read but none could be placed into a queue group. This is a projection failure, not an empty workspace.",
          );
        }

        const ambiguousCount = projections.filter(
          (projection) => projection.reviewStateAmbiguous,
        ).length;
        const limitations = buildLimitations(
          history.length,
          preflight.rawCount,
          reviewChannel,
          ambiguousCount,
        );

        return {
          status: "ready",
          identity: identityForHistory(history),
          provenance: liveProvenance("default"),
          groups,
          cases: projections.map((projection) => projection.detail),
          defaultCaseId,
          /* Always present (possibly empty); the Queue renders nothing when
             empty. Truthful about how the queue was projected. */
          limitations,
        };
      } catch (error) {
        /* Any parse / projection failure is a projection failure, never an
           empty queue and never a silent fixture fallback. */
        return unavailableSnapshot(
          error instanceof Error
            ? `The stored reports could not be projected: ${error.message}`
            : "The stored reports could not be projected.",
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
