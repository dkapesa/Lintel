/* R1B.2 — Production Workspace V2 · deterministic queue grouping & ordering.

   One pure, side-effect-free projection from already-built case signals into
   the four approved operational groups (r1a §16.5 / D5): Needs attention,
   Review, Ready, Reviewed. No React, no DOM, no storage — every input is
   passed in, so the whole projection is deterministic and unit-reviewable.
   Assignment and awaiting-evidence stay secondary metadata / future filters,
   never a fifth group (r1a §16 D5).

   ────────────────────────────────────────────────────────────────────────
   GROUPING PRECEDENCE  (evaluated in order; the first authoritative signal
   wins). This is the milestone's required precedence, made explicit:

     1. EXPLICIT recorded review / completion state (lintel.reviewState.v1).
        Authoritative only when a state was genuinely RECORDED (updatedAt set) —
        never the recommendation-derived default, which would smuggle a
        recommendation in as if it were workflow state. Honoured directly:
          Reviewed / Archived                     → Reviewed
          Ready to merge                          → Ready
          Review required                         → Review
          Needs work / Tests requested / Blocked  → Needs attention

     2. EFFECTIVE Human Decision (lintel.humanDecisionLedger.v1), used only when
        the latest effective decision is recorded AND still applicable to the
        current head (not predates-current-head, not withdrawn, not awaiting
        reaffirmation). A stale decision is deliberately ignored here so a moved
        head can never keep a case falsely "Reviewed":
          approve / approve-with-accepted-risk         → Reviewed (human signed off)
          request-changes / blocked / tests-required   → Needs attention
          review-required / defer                      → Review

     3. OPEN BLOCKING state on the current report:
          recommendation BLOCK or TESTS_REQUIRED       → Needs attention
          any open blocking merge requirement          → Needs attention
          any unresolved merge condition               → Needs attention

     4. RECOMMENDATION fallback. This tier is NOT persisted workflow state; the
        result carries `basis: "recommendation-fallback"` so callers never
        present it as a recorded review status:
          APPROVE with zero unresolved blockers        → Ready
          REVIEW_REQUIRED                              → Review
          anything missing / contradictory / uncertain → Review (never Ready)

   The ONLY routes to Ready are an explicit recorded "Ready to merge" (tier 1)
   or a clean APPROVE with no unresolved blockers (tier 4). Missing,
   contradictory or uncertain state resolves to Review, never Ready
   (acceptance §5). */

import {
  type DecisionPlateViewModel,
  type QueueCaseSummary,
  type QueueGroup,
  type QueueGroupId,
  type Recommendation,
  type ReviewStatus,
  type RiskLevel,
} from "./view-model";

/* --- Grouping --------------------------------------------------------- */

export type GroupingBasis =
  | "review-state"
  | "human-decision"
  | "blocking-state"
  | "recommendation-fallback";

export type GroupingResult = {
  groupId: QueueGroupId;
  basis: GroupingBasis;
};

/* Review-state channel outcome for one case. Four cases are kept distinct so a
   status is only ever treated as authoritative when it is genuinely bound to a
   single analysis entry:
     · recorded    — a recorded status for this case, bound to exactly one entry;
     · untouched   — no recorded status;
     · ambiguous   — a recorded status whose key is shared by several history
                     entries, so it cannot be attributed to this specific entry;
     · unavailable — the review-state store itself is present but unreadable.
   Only `recorded` is authoritative for grouping, displayed status and Reviewed
   ordering; the other three fall through to decision / blocker / recommendation
   signals. */
export type ReviewStateSignal =
  | { kind: "recorded"; status: ReviewStatus; updatedAt: string }
  | { kind: "untouched" }
  | { kind: "ambiguous" }
  | { kind: "unavailable" };

export type CaseGroupingInput = {
  recommendation: Recommendation;
  reviewState: ReviewStateSignal;
  decision: DecisionPlateViewModel;
  openBlockingRequirements: number;
  unresolvedConditions: number;
};

function reviewStateGroup(status: ReviewStatus): QueueGroupId {
  if (status === "Reviewed" || status === "Archived") return "reviewed";
  if (status === "Ready to merge") return "ready";
  if (status === "Review required") return "review";
  /* "Needs work" | "Tests requested" | "Blocked" */
  return "attention";
}

/* Tier 2 helper. Returns a group only when a recorded decision is safely
   authoritative for the current head; otherwise null so the caller falls
   through to the blocking/recommendation tiers. */
function applicableDecisionGroup(decision: DecisionPlateViewModel): QueueGroupId | null {
  if (decision.status !== "recorded") return null;
  /* Predates-current-head, withdrawn or unavailable applicability all mean the
     decision does not authoritatively describe the current head. */
  if (decision.applicability !== "applicable") return null;
  /* A decision that needs reaffirmation is no longer a safe authority. */
  if (decision.needsReaffirmation) return null;

  switch (decision.outcome) {
    case "approve":
    case "approve-with-accepted-risk":
      return "reviewed";
    case "request-changes":
    case "blocked":
    case "tests-required":
      return "attention";
    case "review-required":
    case "defer":
      return "review";
  }
}

export function groupForCase(input: CaseGroupingInput): GroupingResult {
  /* Tier 1 — explicit recorded review/completion state. */
  if (input.reviewState.kind === "recorded") {
    return { groupId: reviewStateGroup(input.reviewState.status), basis: "review-state" };
  }

  /* Tier 2 — effective, head-applicable human decision. */
  const decisionGroup = applicableDecisionGroup(input.decision);
  if (decisionGroup) return { groupId: decisionGroup, basis: "human-decision" };

  /* Tier 3 — open blocking state on the current report. A blocking signal on
     an otherwise-APPROVE report is treated as contradictory and routed to
     Needs attention rather than Ready. */
  if (
    input.recommendation === "BLOCK" ||
    input.recommendation === "TESTS_REQUIRED" ||
    input.openBlockingRequirements > 0 ||
    input.unresolvedConditions > 0
  ) {
    return { groupId: "attention", basis: "blocking-state" };
  }

  /* Tier 4 — recommendation fallback (not persisted workflow state). */
  if (input.recommendation === "APPROVE") {
    return { groupId: "ready", basis: "recommendation-fallback" };
  }
  /* REVIEW_REQUIRED and every uncertain/contradictory case resolve to Review,
     never Ready (acceptance §5). */
  return { groupId: "review", basis: "recommendation-fallback" };
}

/* --- Ordering --------------------------------------------------------- */

/* Fixed render order of the four groups. Ordering is always computed from an
   explicit comparator below; JavaScript object / array insertion order is
   never the sole ordering rule (r1b2 ordering contract). */
export const GROUP_ORDER: readonly QueueGroupId[] = ["attention", "review", "ready", "reviewed"];

export const GROUP_LABEL: Record<QueueGroupId, string> = {
  attention: "Needs attention",
  review: "Review",
  ready: "Ready",
  reviewed: "Reviewed",
};

const RISK_RANK: Record<RiskLevel, number> = {
  CRITICAL: 3,
  HIGH: 2,
  MEDIUM: 1,
  LOW: 0,
};

/* All fields needed to order one case within its group, without reaching back
   into the full case detail. `createdAt` is the history entry's stable, unique
   timestamp; `decidedAt` is the authoritative moment a case was reviewed /
   decided (review-state updatedAt or applicable decision recordedAt), or null. */
export type OrderableCase = {
  caseId: string;
  createdAt: string;
  riskLevel: RiskLevel;
  isBlocking: boolean;
  isAccountableReview: boolean;
  decidedAt: string | null;
};

function parseMs(value: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? Number.NEGATIVE_INFINITY : ms;
}

/* Newer first; final stable tie-break on caseId so ordering is total and never
   depends on array position. */
function byRecencyThenId(a: OrderableCase, b: OrderableCase): number {
  const delta = parseMs(b.createdAt) - parseMs(a.createdAt);
  if (delta !== 0) return delta;
  return a.caseId.localeCompare(b.caseId);
}

function byRiskDesc(a: OrderableCase, b: OrderableCase): number {
  return RISK_RANK[b.riskLevel] - RISK_RANK[a.riskLevel];
}

function flagFirst(a: boolean, b: boolean): number {
  if (a === b) return 0;
  return a ? -1 : 1;
}

/* Needs attention: critical/blocking first, then higher risk, then newest. */
function compareAttention(a: OrderableCase, b: OrderableCase): number {
  return flagFirst(a.isBlocking, b.isBlocking) || byRiskDesc(a, b) || byRecencyThenId(a, b);
}

/* Review: accountable-review cases first, then higher risk, then newest. */
function compareReview(a: OrderableCase, b: OrderableCase): number {
  return (
    flagFirst(a.isAccountableReview, b.isAccountableReview) ||
    byRiskDesc(a, b) ||
    byRecencyThenId(a, b)
  );
}

/* Ready: newest first (no authoritative completion priority exists in R1B.2). */
function compareReady(a: OrderableCase, b: OrderableCase): number {
  return byRecencyThenId(a, b);
}

/* Reviewed: most recently reviewed/decided first when that is authoritative,
   otherwise report-history (newest) order. */
function compareReviewed(a: OrderableCase, b: OrderableCase): number {
  const delta = parseMs(b.decidedAt) - parseMs(a.decidedAt);
  if (delta !== 0) return delta;
  return byRecencyThenId(a, b);
}

export function orderCasesForGroup(groupId: QueueGroupId, cases: OrderableCase[]): OrderableCase[] {
  const comparator =
    groupId === "attention"
      ? compareAttention
      : groupId === "review"
        ? compareReview
        : groupId === "ready"
          ? compareReady
          : compareReviewed;
  /* Copy before sort so callers' arrays are never mutated. */
  return [...cases].sort(comparator);
}

/* --- Queue assembly --------------------------------------------------- */

export type QueueItem = {
  summary: QueueCaseSummary;
  order: OrderableCase;
};

/* Build the four groups in fixed order, each internally ordered by its own
   comparator, dropping empty groups (restrained counts). Every item lands in
   exactly one group because `summary.groupId` is a single value from
   `groupForCase`. */
export function buildQueueGroups(items: QueueItem[]): QueueGroup[] {
  const byGroup = new Map<QueueGroupId, QueueItem[]>();
  for (const item of items) {
    const list = byGroup.get(item.summary.groupId) ?? [];
    list.push(item);
    byGroup.set(item.summary.groupId, list);
  }

  const groups: QueueGroup[] = [];
  for (const groupId of GROUP_ORDER) {
    const list = byGroup.get(groupId);
    if (!list || list.length === 0) continue;
    const ordered = orderCasesForGroup(groupId, list.map((item) => item.order));
    const orderIndex = new Map(ordered.map((entry, index) => [entry.caseId, index]));
    const cases = [...list]
      .sort(
        (a, b) =>
          (orderIndex.get(a.summary.caseId) ?? 0) - (orderIndex.get(b.summary.caseId) ?? 0),
      )
      .map((item) => item.summary);
    groups.push({ id: groupId, label: GROUP_LABEL[groupId], cases });
  }
  return groups;
}

/* Deterministic default selection (acceptance §6, r1b2 selection contract):
     1. an explicit, resolved caseId (regardless of group);
     2. otherwise the first case of the first non-empty group, in the fixed
        precedence order Needs attention → Review → Ready → Reviewed.
   `groups` must already be ordered by `buildQueueGroups`. */
export function pickDefaultCaseId(
  groups: QueueGroup[],
  explicitCaseId: string | null,
): string | null {
  if (explicitCaseId) {
    const exists = groups.some((group) =>
      group.cases.some((item) => item.caseId === explicitCaseId),
    );
    if (exists) return explicitCaseId;
  }
  for (const group of groups) {
    if (group.cases.length > 0) return group.cases[0].caseId;
  }
  return null;
}
