/* R1B.6 — Production Workspace V2 · client-side Human Decision mutation service.

   The single, narrow seam through which Workspace V2 records an accountable
   engineer decision. Everywhere else in the stack is a read-only projection:
   the real adapter reads the ledger through `readOnlyStorage`, and the R1B.5
   review/condition persistence service deliberately never touches the Human
   Decision ledger. This service is the ONLY place Workspace V2 appends to the
   Human Decision ledger, and it does so exclusively through the existing
   production write helpers and their existing key and schema — it invents no
   outcome, no actor identity, no timestamp field, no storage key, no schema
   version.

   Governing product rule (never conflated): Lintel recommends; an accountable
   engineer decides. Every command here records an explicit Human Decision.

   Design constraints honoured (R1B.6):
     · browser `Storage` is injected (dependency injection) — this module never
       reaches for `window` and can be exercised against any Storage;
     · it exposes only the four supported ledger commands (record / supersede /
       reaffirm / withdraw), reusing the production ledger helpers;
     · every command returns a typed, discriminated result — never a bare
       boolean and never `any`;
     · a "success" is returned only after an authoritative read-back re-projects
       the ledger and confirms the intended effective / lineage state. A write
       helper returning without throwing is NOT treated as success;
     · idempotency is deterministic and does NOT depend on a fresh timestamp: a
       submission whose logical command identity already exists in the ledger is
       an unchanged no-op, never a duplicate append (r0b2 §24.9–24.11);
     · a stale command (the effective decision or head changed since the dialog
       opened, or the selected case no longer matches) is refused, never written;
     · storage-access, malformed-ledger and write failures are caught and
       reported as typed failures — the service never silently falls back to an
       in-memory success and never rebuilds a clean ledger over a malformed one.

   Presentation never constructs or holds this service: the real-data bootstrap
   builds it once with the writable `localStorage` and hands narrow callbacks
   down, exactly as R1B.5 does for review/condition persistence. */

import { buildEvidenceHierarchy } from "../evidence-hierarchy";
import { buildMergeContract, type MergeContract } from "../merge-contract";
import {
  appendHumanDecisionLedgerEntry,
  HUMAN_DECISION_LEDGER_STORAGE_KEY,
  humanDecisionLedgerKeyForReport,
  projectHumanDecisionLedger,
  readHumanDecisionLedger,
  writeHumanDecisionLedger,
  type HumanDecisionEventType,
  type HumanDecisionLedger,
  type HumanDecisionLedgerAppendInput,
  type HumanDecisionLedgerContext,
  type HumanDecisionLedgerEntry,
  type HumanDecisionOutcome,
} from "../human-decision-ledger";
import type { CanonicalReviewRunManifest } from "../canonical-review-run";
import type { Report } from "../mock-report";
import { readReportHistory } from "../report-history";
import { readOnlyStorage } from "./read-only-storage";
import type {
  DecisionEventType,
  DecisionLedgerEventView,
  DecisionOutcome,
} from "./view-model";

/* --- Public command inputs -------------------------------------------- */

/* A reference selected in a dialog. `kind` mirrors the ledger's three
   reference buckets; assumptions are accepted for completeness but are not
   currently surfaced as case artifacts, so the UI never offers them. */
export type DecisionReferenceInput = {
  id: string;
  kind: "clause" | "evidence" | "assumption";
};

/* Every command names the case, and every mutation of an existing decision
   carries the exact effective entry the dialog opened against plus the head it
   was shown — so a decision or head that changed underneath the dialog is
   refused rather than overwritten. */
type BaseMutationTarget = {
  caseId: string;
  /* The head SHA shown in the dialog (null when head was not recorded). */
  expectedHeadSha: string | null;
};

export type RecordDecisionCommand = BaseMutationTarget & {
  kind: "record";
  outcome: DecisionOutcome;
  rationale: string;
  references: DecisionReferenceInput[];
  acceptedRiskReferences: DecisionReferenceInput[];
};

export type SupersedeDecisionCommand = BaseMutationTarget & {
  kind: "supersede";
  expectedEffectiveEntryId: string;
  outcome: DecisionOutcome;
  rationale: string;
  references: DecisionReferenceInput[];
  acceptedRiskReferences: DecisionReferenceInput[];
};

export type ReaffirmDecisionCommand = BaseMutationTarget & {
  kind: "reaffirm";
  expectedEffectiveEntryId: string;
  rationale: string;
};

export type WithdrawDecisionCommand = BaseMutationTarget & {
  kind: "withdraw";
  expectedEffectiveEntryId: string;
  rationale: string;
};

export type DecisionMutationCommand =
  | RecordDecisionCommand
  | SupersedeDecisionCommand
  | ReaffirmDecisionCommand
  | WithdrawDecisionCommand;

/* --- Result model ----------------------------------------------------- */

/* A discriminated union. `boolean` is deliberately not used: the caller must be
   able to tell a verified persist from an idempotent no-op, a stale command, a
   refusal, a hard failure and a read-back mismatch, and must reproject only on
   `persisted`. `persisted-refresh-failed` is set by the client owner when a
   verified write could not be re-projected (the ledger IS saved). */
export type DecisionMutationOutcome =
  | "persisted"
  | "unchanged"
  | "unavailable"
  | "stale-command"
  | "failed"
  | "verification-mismatch"
  | "persisted-refresh-failed";

export type DecisionMutationResult = {
  outcome: DecisionMutationOutcome;
  /* Precise, user-facing copy. Never a stack trace or raw exception text. */
  message: string;
  /* The effective entry id after a verified persist, for focus / lineage. */
  effectiveEntryId?: string | null;
};

const persisted = (message: string, effectiveEntryId: string | null): DecisionMutationResult => ({
  outcome: "persisted",
  message,
  effectiveEntryId,
});
const unchanged = (message: string): DecisionMutationResult => ({ outcome: "unchanged", message });
const unavailable = (message: string): DecisionMutationResult => ({ outcome: "unavailable", message });
const staleCommand = (message: string): DecisionMutationResult => ({ outcome: "stale-command", message });
const failed = (message: string): DecisionMutationResult => ({ outcome: "failed", message });
const verificationMismatch = (message: string): DecisionMutationResult => ({
  outcome: "verification-mismatch",
  message,
});

/* --- Service interface ------------------------------------------------ */

export interface WorkspaceDecisionService {
  recordDecision(command: RecordDecisionCommand): DecisionMutationResult;
  supersedeDecision(command: SupersedeDecisionCommand): DecisionMutationResult;
  reaffirmDecision(command: ReaffirmDecisionCommand): DecisionMutationResult;
  withdrawDecision(command: WithdrawDecisionCommand): DecisionMutationResult;
}

/* --- Shared normalisation (mirrors the ledger's own sanitisation) ------ */

/* The ledger stores `reason` through `safeText` (collapse whitespace, cap) and
   ids through `boundedIds` (trim/cap/dedupe). Mirroring that here keeps the
   logical-identity comparison stable between an incoming draft and an
   already-stored entry, so idempotency is deterministic. */
function normalizeReason(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 700);
}

function normalizeIds(values: string[]): string[] {
  return [
    ...new Set(values.map((value) => value.replace(/\s+/g, " ").trim().slice(0, 140)).filter(Boolean)),
  ]
    .slice(0, 20)
    .sort();
}

/* The truthful local actor the ledger stamps when no authenticated identity
   exists. Kept identical to `defaultActor`'s local label so the stored actor
   and the identity used for dedup agree. No real name, email or authority. */
const LOCAL_ACTOR_LABEL = "Local reviewer";

/* --- Deterministic logical identity (no timestamp; §24.11) ------------ */

type LogicalCommandShape = {
  eventType: HumanDecisionEventType;
  outcome: HumanDecisionOutcome | null;
  headSha: string | null;
  reason: string;
  clauseIds: string[];
  evidenceIds: string[];
  assumptionIds: string[];
  acceptedRiskIds: string[];
  supersedesEntryId: string | null;
  reaffirmsEntryId: string | null;
  withdrawsEntryId: string | null;
  actorLabel: string;
};

function logicalIdentity(shape: LogicalCommandShape): string {
  return JSON.stringify({
    eventType: shape.eventType,
    outcome: shape.outcome ?? "",
    head: shape.headSha ?? "",
    reason: normalizeReason(shape.reason),
    clause: normalizeIds(shape.clauseIds),
    evidence: normalizeIds(shape.evidenceIds),
    assumption: normalizeIds(shape.assumptionIds),
    risk: normalizeIds(shape.acceptedRiskIds),
    supersedes: shape.supersedesEntryId ?? "",
    reaffirms: shape.reaffirmsEntryId ?? "",
    withdraws: shape.withdrawsEntryId ?? "",
    actor: shape.actorLabel,
  });
}

/* The logical identity of an already-stored ledger entry, computed through the
   same normalisation as the incoming command. */
function entryLogicalIdentity(entry: HumanDecisionLedgerEntry): string {
  return logicalIdentity({
    eventType: entry.eventType,
    outcome: entry.outcome ?? null,
    headSha: entry.applicableHeadSha ?? null,
    reason: entry.reason ?? "",
    clauseIds: entry.referencedClauseIds,
    evidenceIds: entry.referencedEvidenceIds,
    assumptionIds: entry.referencedAssumptionIds,
    acceptedRiskIds: entry.acceptedRiskReferences,
    supersedesEntryId: entry.supersedesEntryId ?? null,
    reaffirmsEntryId: entry.reaffirmsEntryId ?? null,
    withdrawsEntryId: entry.withdrawsEntryId ?? null,
    actorLabel: entry.actor.displayLabel,
  });
}

/* --- Ledger integrity peek (malformed ≠ absent; r0b2 §24.13–24.14) ----- */

/* The production reader swallows a corrupt blob and returns an empty ledger, so
   on its own it cannot distinguish a malformed store from a genuinely empty
   one. This read-only peek at the raw value restores that distinction without
   modifying the ledger module: a present-but-unparseable blob, or a present but
   wrongly-shaped entry for this case's key, is malformed — never silently
   rendered as "no decision recorded". */
export type LedgerIntegrity = { ok: true } | { ok: false; reason: string };

export function ledgerIntegrityForKey(storage: Storage, key: string): LedgerIntegrity {
  let raw: string | null;
  try {
    raw = storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY);
  } catch {
    return { ok: false, reason: "The Human Decision ledger store could not be read in this browser." };
  }
  if (!raw || raw.trim().length === 0) return { ok: true };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      reason: "The stored Human Decision ledger is malformed (unparseable) and was not overwritten.",
    };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      ok: false,
      reason: "The stored Human Decision ledger has an unexpected shape and was not overwritten.",
    };
  }
  const forKey = (parsed as Record<string, unknown>)[key];
  if (forKey === undefined) return { ok: true };
  if (typeof forKey !== "object" || forKey === null || Array.isArray(forKey)) {
    return {
      ok: false,
      reason: "The stored decision record for this case is malformed and was not overwritten.",
    };
  }
  const entries = (forKey as Record<string, unknown>).entries;
  if (entries !== undefined && !Array.isArray(entries)) {
    return {
      ok: false,
      reason: "The stored decision record for this case has a malformed history and was not overwritten.",
    };
  }
  return { ok: true };
}

/* --- Lineage projection for Decision Context (read-only) --------------- */

/* Build the full lineage view (newest first), labelling each entry's role
   relative to the current projection. Historical roles (superseded / withdrawn)
   are never presented as the effective decision (r0b2 §17.10). */
export function projectDecisionLineage(
  ledger: HumanDecisionLedger,
  currentHeadSha: string | undefined,
): DecisionLedgerEventView[] {
  const projection = projectHumanDecisionLedger(ledger, currentHeadSha);
  const superseded = new Set(projection.supersededEntryIds);
  const withdrawn = new Set(projection.withdrawnEntryIds);
  const effectiveId = projection.latestEffectiveEntry?.entryId;
  const sorted = [...ledger.entries].sort(
    (a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt),
  );
  return sorted.map((entry) => {
    let role: DecisionLedgerEventView["role"] = "historical";
    if (entry.entryId === effectiveId) role = "effective";
    else if (withdrawn.has(entry.entryId)) role = "withdrawn";
    else if (superseded.has(entry.entryId)) role = "superseded";
    else if (entry.eventType === "decision-reaffirmed") role = "reaffirmed";
    return {
      entryId: entry.entryId,
      eventType: entry.eventType as DecisionEventType,
      outcome: (entry.outcome ?? null) as DecisionOutcome | null,
      actor: {
        displayLabel: entry.actor.displayLabel,
        source: entry.actor.source,
        role: entry.actor.role ?? null,
      },
      recordedAt: entry.recordedAt,
      applicableHeadSha: entry.applicableHeadSha ?? null,
      rationale: entry.reason ?? null,
      fingerprint: entry.fingerprint,
      role,
      supersedesEntryId: entry.supersedesEntryId ?? null,
      reaffirmsEntryId: entry.reaffirmsEntryId ?? null,
      withdrawsEntryId: entry.withdrawsEntryId ?? null,
    };
  });
}

/* When the production projection has no effective entry but the newest terminal
   decision event is a withdrawal, the live state is `withdrawn` (state H), not
   absent (state A). Returns the entry that was withdrawn so the Plate can show
   it, or null when the case is genuinely absent. */
export function deriveWithdrawnDisplayEntry(
  ledger: HumanDecisionLedger,
): HumanDecisionLedgerEntry | null {
  const sorted = [...ledger.entries].sort(
    (a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt),
  );
  const decisionTypes: HumanDecisionEventType[] = [
    "decision-recorded",
    "decision-reaffirmed",
    "decision-superseded",
    "risk-accepted",
  ];
  const hasDecision = sorted.some((entry) => decisionTypes.includes(entry.eventType));
  if (!hasDecision) return null;
  /* The newest lineage-changing terminal event decides live state. */
  const terminal = [...sorted]
    .reverse()
    .find(
      (entry) =>
        entry.eventType === "decision-withdrawn" ||
        entry.eventType === "risk-acceptance-revoked" ||
        decisionTypes.includes(entry.eventType),
    );
  if (!terminal || terminal.eventType !== "decision-withdrawn") return null;
  const withdrawn = terminal.withdrawsEntryId
    ? sorted.find((entry) => entry.entryId === terminal.withdrawsEntryId)
    : undefined;
  return withdrawn && withdrawn.outcome ? withdrawn : null;
}

/* --- Case context resolution ------------------------------------------ */

type ResolvedCase = {
  report: Report;
  canonicalRun: CanonicalReviewRunManifest | null;
  createdAt: string;
};

/* Resolve a `report-<createdAt>` case id to its stored history entry. The
   lookup read is wrapped read-only so `readReportHistory`'s documented
   prune-on-read side effect cannot write during resolution. */
function resolveCase(storage: Storage, caseId: string): ResolvedCase | null {
  const wanted = caseId.startsWith("report-") ? caseId.slice("report-".length) : caseId;
  const history = readReportHistory(readOnlyStorage(storage));
  const entry = history.find((item) => item.createdAt === wanted);
  if (!entry) return null;
  return { report: entry.report, canonicalRun: entry.canonicalRun ?? null, createdAt: entry.createdAt };
}

type DecisionContext = {
  key: string;
  context: HumanDecisionLedgerContext;
  currentHeadSha: string | undefined;
  validClauseIds: Set<string>;
  validEvidenceIds: Set<string>;
};

/* Rebuild the exact canonical context the read adapter uses, so the ledger key
   and head binding written here match the read-only projection precisely. The
   two expensive canonical builds are pure and deterministic given the entry. */
function buildDecisionContext(resolved: ResolvedCase): DecisionContext {
  const headSha = resolved.canonicalRun?.headSha;
  const evidenceSummary = buildEvidenceHierarchy(resolved.report, null, {
    createdAt: resolved.createdAt,
    headSha,
  });
  const contract: MergeContract = buildMergeContract({
    report: resolved.report,
    evidenceHierarchy: evidenceSummary,
    headSha,
    createdAt: resolved.createdAt,
  });
  const context: HumanDecisionLedgerContext = {
    report: resolved.report,
    canonicalRun: resolved.canonicalRun,
    mergeContract: contract,
    currentHeadSha: headSha,
  };
  return {
    key: humanDecisionLedgerKeyForReport(resolved.report),
    context,
    currentHeadSha: headSha,
    validClauseIds: new Set(contract.clauses.map((clause) => clause.clauseId)),
    validEvidenceIds: new Set(evidenceSummary.records.map((record) => record.evidenceId)),
  };
}

/* Split validated references into the ledger's three buckets. A reference not
   present in the current case projection is dropped from the write and reported
   — it is never persisted against a stale or invented identity. */
type SplitReferences = {
  clauseIds: string[];
  evidenceIds: string[];
  assumptionIds: string[];
  unresolved: string[];
};

function splitReferences(
  references: DecisionReferenceInput[],
  ctx: DecisionContext,
): SplitReferences {
  const clauseIds: string[] = [];
  const evidenceIds: string[] = [];
  const assumptionIds: string[] = [];
  const unresolved: string[] = [];
  for (const reference of references) {
    if (reference.kind === "clause" && ctx.validClauseIds.has(reference.id)) {
      clauseIds.push(reference.id);
    } else if (reference.kind === "evidence" && ctx.validEvidenceIds.has(reference.id)) {
      evidenceIds.push(reference.id);
    } else if (
      reference.kind === "assumption" &&
      !ctx.validClauseIds.has(reference.id) &&
      !ctx.validEvidenceIds.has(reference.id)
    ) {
      /* Assumptions are not surfaced as artifacts, so there is nothing to
         validate against; they are refused rather than written unresolved. */
      unresolved.push(reference.id);
    } else {
      unresolved.push(reference.id);
    }
  }
  return { clauseIds, evidenceIds, assumptionIds, unresolved };
}

/* Accepted-risk references are a flat id list on the ledger. Each must resolve
   to a current-case requirement or evidence artifact (r0b2 §13). */
function resolveAcceptedRisk(
  references: DecisionReferenceInput[],
  ctx: DecisionContext,
): { ids: string[]; unresolved: string[] } {
  const ids: string[] = [];
  const unresolved: string[] = [];
  for (const reference of references) {
    if (ctx.validClauseIds.has(reference.id) || ctx.validEvidenceIds.has(reference.id)) {
      ids.push(reference.id);
    } else {
      unresolved.push(reference.id);
    }
  }
  return { ids, unresolved };
}

/* --- The service ------------------------------------------------------ */

export function createWorkspaceDecisionService(storage: Storage): WorkspaceDecisionService {
  /* Shared prelude: resolve the case, refuse a malformed ledger, rebuild the
     canonical context, read the current ledger + projection. */
  type Prepared = {
    ctx: DecisionContext;
    ledger: HumanDecisionLedger;
    effective: HumanDecisionLedgerEntry | undefined;
  };

  function prepare(caseId: string): Prepared | DecisionMutationResult {
    const resolved = resolveCase(storage, caseId);
    if (!resolved) {
      return unavailable(
        "This report is no longer stored in this browser, so a decision cannot be recorded for it.",
      );
    }
    const ctx = buildDecisionContext(resolved);
    const integrity = ledgerIntegrityForKey(storage, ctx.key);
    if (!integrity.ok) {
      /* Safe write semantics cannot be established over a malformed store. */
      return unavailable(integrity.reason);
    }
    const ledger = readHumanDecisionLedger(storage, ctx.key, ctx.context, null);
    const projection = projectHumanDecisionLedger(ledger, ctx.currentHeadSha);
    return { ctx, ledger, effective: projection.latestEffectiveEntry };
  }

  function headMatches(ctx: DecisionContext, expected: string | null): boolean {
    return (ctx.currentHeadSha ?? null) === expected;
  }

  /* Append, verify through read-back, and return a typed result. `verify`
     re-projects the freshly-read ledger and confirms the intended state. */
  function commit(
    ctx: DecisionContext,
    ledgerBefore: HumanDecisionLedger,
    input: HumanDecisionLedgerAppendInput,
    identity: string,
    verify: (
      after: HumanDecisionLedger,
      projection: ReturnType<typeof projectHumanDecisionLedger>,
    ) => DecisionMutationResult,
  ): DecisionMutationResult {
    /* Deterministic idempotency: a logically identical command already in the
       ledger is an unchanged no-op — never a duplicate append (§24.9–24.11). */
    if (ledgerBefore.entries.some((entry) => entryLogicalIdentity(entry) === identity)) {
      return unchanged(
        "No change — an identical decision is already recorded. Nothing was appended.",
      );
    }

    const appended = appendHumanDecisionLedgerEntry(ledgerBefore, ctx.context, {
      ...input,
      idempotencyKey: identity,
    });
    writeHumanDecisionLedger(storage, ctx.key, appended);

    /* Authoritative read-back: re-read the ledger through the production helper
       and re-project against the current head. Success is only returned when
       the intended entry is present with the intended state. */
    const after = readHumanDecisionLedger(storage, ctx.key, ctx.context, null);
    const projection = projectHumanDecisionLedger(after, ctx.currentHeadSha);
    return verify(after, projection);
  }

  return {
    recordDecision(command: RecordDecisionCommand): DecisionMutationResult {
      try {
        const prepared = prepare(command.caseId);
        if ("outcome" in prepared && "message" in prepared) return prepared as DecisionMutationResult;
        const { ctx, ledger, effective } = prepared as Prepared;

        if (!headMatches(ctx, command.expectedHeadSha)) {
          return staleCommand(
            "The current head changed since this dialog opened. Reopen the decision to record against the current head.",
          );
        }
        /* State A only: recording is for a case with no effective decision. */
        if (effective) {
          return staleCommand(
            "A decision now exists for this case. Reopen the workspace to change the current decision.",
          );
        }

        const refs = splitReferences(command.references, ctx);
        if (refs.unresolved.length > 0) {
          return unavailable(
            "One or more selected references are no longer part of this case, so the decision was not recorded.",
          );
        }
        const isAcceptedRisk = command.outcome === "approve-with-accepted-risk";
        const risk = resolveAcceptedRisk(command.acceptedRiskReferences, ctx);
        if (isAcceptedRisk) {
          if (risk.ids.length === 0) {
            return unavailable(
              "Accepted risk requires at least one available referenced risk, so the decision was not recorded.",
            );
          }
          if (risk.unresolved.length > 0) {
            return unavailable(
              "One or more accepted-risk references are no longer available, so the decision was not recorded.",
            );
          }
        }

        const eventType: HumanDecisionEventType = isAcceptedRisk ? "risk-accepted" : "decision-recorded";
        const identity = logicalIdentity({
          eventType,
          outcome: command.outcome,
          headSha: ctx.currentHeadSha ?? null,
          reason: command.rationale,
          clauseIds: refs.clauseIds,
          evidenceIds: refs.evidenceIds,
          assumptionIds: refs.assumptionIds,
          acceptedRiskIds: risk.ids,
          supersedesEntryId: null,
          reaffirmsEntryId: null,
          withdrawsEntryId: null,
          actorLabel: LOCAL_ACTOR_LABEL,
        });

        return commit(
          ctx,
          ledger,
          {
            eventType,
            outcome: command.outcome,
            actor: { source: "local", displayLabel: LOCAL_ACTOR_LABEL },
            reason: command.rationale,
            referencedClauseIds: refs.clauseIds,
            referencedEvidenceIds: refs.evidenceIds,
            referencedAssumptionIds: refs.assumptionIds,
            acceptedRiskReferences: risk.ids,
            source: "local",
          },
          identity,
          (_after, projection) => {
            const entry = projection.latestEffectiveEntry;
            if (
              !entry ||
              entry.outcome !== command.outcome ||
              normalizeReason(entry.reason ?? "") !== normalizeReason(command.rationale) ||
              (entry.applicableHeadSha ?? null) !== (ctx.currentHeadSha ?? null) ||
              (isAcceptedRisk && entry.acceptedRiskReferences.length === 0)
            ) {
              return verificationMismatch(
                "The decision was written but a read-back did not confirm the recorded state, so the workspace was not updated.",
              );
            }
            return persisted("Decision recorded.", entry.entryId);
          },
        );
      } catch {
        return failed(
          "The decision could not be saved. Local storage may be unavailable or full in this browser.",
        );
      }
    },

    supersedeDecision(command: SupersedeDecisionCommand): DecisionMutationResult {
      try {
        const prepared = prepare(command.caseId);
        if ("outcome" in prepared && "message" in prepared) return prepared as DecisionMutationResult;
        const { ctx, ledger, effective } = prepared as Prepared;

        if (!effective || effective.entryId !== command.expectedEffectiveEntryId) {
          return staleCommand(
            "The effective decision changed since this dialog opened. Reopen to act on the current decision.",
          );
        }
        if (!headMatches(ctx, command.expectedHeadSha)) {
          return staleCommand(
            "The current head changed since this dialog opened. Reopen the decision to record against the current head.",
          );
        }

        const refs = splitReferences(command.references, ctx);
        if (refs.unresolved.length > 0) {
          return unavailable(
            "One or more selected references are no longer part of this case, so the decision was not recorded.",
          );
        }
        const isAcceptedRisk = command.outcome === "approve-with-accepted-risk";
        const risk = resolveAcceptedRisk(command.acceptedRiskReferences, ctx);
        if (isAcceptedRisk) {
          if (risk.ids.length === 0) {
            return unavailable(
              "Accepted risk requires at least one available referenced risk, so the decision was not recorded.",
            );
          }
          if (risk.unresolved.length > 0) {
            return unavailable(
              "One or more accepted-risk references are no longer available, so the decision was not recorded.",
            );
          }
        }

        /* Same outcome + same head against a predating decision is a
           reaffirmation; anything else that differs is a supersession. A fully
           identical submission is caught as a no-op inside `commit`. */
        const sameOutcome = effective.outcome === command.outcome;
        const sameHead = (effective.applicableHeadSha ?? null) === (ctx.currentHeadSha ?? null);
        const predates =
          Boolean(effective.applicableHeadSha) &&
          Boolean(ctx.currentHeadSha) &&
          effective.applicableHeadSha !== ctx.currentHeadSha;
        const asReaffirm = sameOutcome && sameHead && predates;

        const eventType: HumanDecisionEventType = isAcceptedRisk
          ? "risk-accepted"
          : asReaffirm
            ? "decision-reaffirmed"
            : "decision-superseded";

        const identity = logicalIdentity({
          eventType,
          outcome: command.outcome,
          headSha: ctx.currentHeadSha ?? null,
          reason: command.rationale,
          clauseIds: refs.clauseIds,
          evidenceIds: refs.evidenceIds,
          assumptionIds: refs.assumptionIds,
          acceptedRiskIds: risk.ids,
          supersedesEntryId: asReaffirm ? null : effective.entryId,
          reaffirmsEntryId: asReaffirm ? effective.entryId : null,
          withdrawsEntryId: null,
          actorLabel: LOCAL_ACTOR_LABEL,
        });

        return commit(
          ctx,
          ledger,
          {
            eventType,
            outcome: command.outcome,
            actor: { source: "local", displayLabel: LOCAL_ACTOR_LABEL },
            reason: command.rationale,
            referencedClauseIds: refs.clauseIds,
            referencedEvidenceIds: refs.evidenceIds,
            referencedAssumptionIds: refs.assumptionIds,
            acceptedRiskReferences: risk.ids,
            supersedesEntryId: asReaffirm ? undefined : effective.entryId,
            reaffirmsEntryId: asReaffirm ? effective.entryId : undefined,
            source: "local",
          },
          identity,
          (_after, projection) => {
            const entry = projection.latestEffectiveEntry;
            const priorRetained = projection.latestEffectiveEntry?.entryId !== effective.entryId;
            const lineageOk = asReaffirm
              ? entry?.reaffirmsEntryId === effective.entryId
              : projection.supersededEntryIds.includes(effective.entryId) &&
                entry?.supersedesEntryId === effective.entryId;
            if (
              !entry ||
              entry.outcome !== command.outcome ||
              normalizeReason(entry.reason ?? "") !== normalizeReason(command.rationale) ||
              !priorRetained ||
              !lineageOk
            ) {
              return verificationMismatch(
                "The replacement decision was written but a read-back did not confirm the lineage, so the workspace was not updated.",
              );
            }
            return persisted(
              asReaffirm
                ? "Decision reaffirmed against the current head. The prior decision remains in history."
                : "Decision superseded. The prior decision remains in history.",
              entry.entryId,
            );
          },
        );
      } catch {
        return failed(
          "The decision could not be saved. Local storage may be unavailable or full in this browser.",
        );
      }
    },

    reaffirmDecision(command: ReaffirmDecisionCommand): DecisionMutationResult {
      try {
        const prepared = prepare(command.caseId);
        if ("outcome" in prepared && "message" in prepared) return prepared as DecisionMutationResult;
        const { ctx, ledger, effective } = prepared as Prepared;

        if (!effective || effective.entryId !== command.expectedEffectiveEntryId) {
          return staleCommand(
            "The effective decision changed since this dialog opened. Reopen to act on the current decision.",
          );
        }
        if (!effective.outcome) {
          return unavailable("The current decision has no outcome to reaffirm.");
        }
        /* Reaffirmation binds to the current canonical head; refuse when the
           head cannot be established safely (r0b2 §10). */
        if (!ctx.currentHeadSha) {
          return unavailable(
            "The current head is not recorded, so this decision cannot be reaffirmed against it.",
          );
        }
        if (!headMatches(ctx, command.expectedHeadSha)) {
          return staleCommand(
            "The current head changed since this dialog opened. Reopen the reaffirmation to bind the current head.",
          );
        }

        const identity = logicalIdentity({
          eventType: "decision-reaffirmed",
          outcome: effective.outcome,
          headSha: ctx.currentHeadSha,
          reason: command.rationale,
          clauseIds: effective.referencedClauseIds,
          evidenceIds: effective.referencedEvidenceIds,
          assumptionIds: effective.referencedAssumptionIds,
          acceptedRiskIds: effective.acceptedRiskReferences,
          supersedesEntryId: null,
          reaffirmsEntryId: effective.entryId,
          withdrawsEntryId: null,
          actorLabel: LOCAL_ACTOR_LABEL,
        });

        return commit(
          ctx,
          ledger,
          {
            eventType: "decision-reaffirmed",
            outcome: effective.outcome,
            actor: { source: "local", displayLabel: LOCAL_ACTOR_LABEL },
            reason: command.rationale,
            referencedClauseIds: effective.referencedClauseIds,
            referencedEvidenceIds: effective.referencedEvidenceIds,
            referencedAssumptionIds: effective.referencedAssumptionIds,
            acceptedRiskReferences: effective.acceptedRiskReferences,
            reaffirmsEntryId: effective.entryId,
            source: "local",
          },
          identity,
          (_after, projection) => {
            const entry = projection.latestEffectiveEntry;
            if (
              !entry ||
              entry.eventType !== "decision-reaffirmed" ||
              entry.reaffirmsEntryId !== effective.entryId ||
              (entry.applicableHeadSha ?? null) !== ctx.currentHeadSha ||
              projection.applicability !== "applicable"
            ) {
              return verificationMismatch(
                "The reaffirmation was written but a read-back did not confirm the new applicable state, so the workspace was not updated.",
              );
            }
            return persisted("Decision reaffirmed against the current head.", entry.entryId);
          },
        );
      } catch {
        return failed(
          "The reaffirmation could not be saved. Local storage may be unavailable or full in this browser.",
        );
      }
    },

    withdrawDecision(command: WithdrawDecisionCommand): DecisionMutationResult {
      try {
        const prepared = prepare(command.caseId);
        if ("outcome" in prepared && "message" in prepared) return prepared as DecisionMutationResult;
        const { ctx, ledger, effective } = prepared as Prepared;

        if (!effective || effective.entryId !== command.expectedEffectiveEntryId) {
          return staleCommand(
            "The effective decision changed since this dialog opened. Reopen to act on the current decision.",
          );
        }
        if (!headMatches(ctx, command.expectedHeadSha)) {
          return staleCommand(
            "The current head changed since this dialog opened. Reopen the withdrawal.",
          );
        }

        const identity = logicalIdentity({
          eventType: "decision-withdrawn",
          outcome: null,
          headSha: ctx.currentHeadSha ?? null,
          reason: command.rationale,
          clauseIds: [],
          evidenceIds: [],
          assumptionIds: [],
          acceptedRiskIds: [],
          supersedesEntryId: null,
          reaffirmsEntryId: null,
          withdrawsEntryId: effective.entryId,
          actorLabel: LOCAL_ACTOR_LABEL,
        });

        return commit(
          ctx,
          ledger,
          {
            eventType: "decision-withdrawn",
            actor: { source: "local", displayLabel: LOCAL_ACTOR_LABEL },
            reason: command.rationale,
            withdrawsEntryId: effective.entryId,
            source: "local",
          },
          identity,
          (after, projection) => {
            const withdrawnDisplay = deriveWithdrawnDisplayEntry(after);
            const withdrawnOk =
              projection.withdrawnEntryIds.includes(effective.entryId) &&
              withdrawnDisplay?.entryId === effective.entryId &&
              projection.latestEffectiveEntry?.entryId !== effective.entryId;
            if (!withdrawnOk) {
              return verificationMismatch(
                "The withdrawal was written but a read-back did not confirm the withdrawn state, so the workspace was not updated.",
              );
            }
            return persisted("Decision withdrawn. History is retained.", null);
          },
        );
      } catch {
        return failed(
          "The withdrawal could not be saved. Local storage may be unavailable or full in this browser.",
        );
      }
    },
  };
}
