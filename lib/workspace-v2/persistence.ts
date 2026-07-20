/* R1B.5 — Production Workspace V2 · client-side persistence boundary.

   The single, narrow mutation seam for Workspace V2. Everywhere else in the
   Workspace V2 stack is a read-only projection: the `WorkspaceAdapter` and the
   real Report path are wrapped in `readOnlyStorage` and cannot write. This
   service is the ONLY place Workspace V2 records state, and it does so through
   the existing production write helpers and their existing keys — it invents no
   status, no actor, no timestamp field, no storage key and no schema version.

   Design constraints honoured here (R1B.5):
     · browser `Storage` is injected (dependency injection), so this module never
       reaches for `window` and can be exercised against any Storage;
     · it exposes only two commands — review status and condition progress —
       and never touches the Human Decision ledger (that is R1B.6);
     · every command returns a typed, discriminated result, never a bare
       boolean and never `any`;
     · a "success" is only ever returned after an authoritative read-back
       confirms the intended value was persisted (read-after-write). A write
       helper returning without throwing is NOT treated as success;
     · storage-access and write failures are caught and reported as typed
       failures — the service never silently falls back to an in-memory success;
     · the review-state key is only written when it maps to exactly ONE stored
       analysis. A shared (ambiguous) key is refused as `unavailable`, matching
       the read-side truthfulness boundary — it is never assigned to one entry.

   Presentation components never construct or hold this service directly; the
   real-data client bootstrap builds it once with the writable `localStorage`
   and hands narrow callbacks down. The read adapter keeps its writable Storage
   wrapped read-only; this service is the deliberate, separate exception. */

import {
  conditionKey,
  readConditionProgress,
  reportConditions,
  writeConditionProgress,
} from "../condition-progress";
import type { Report } from "../mock-report";
import { readReportHistory } from "../report-history";
import {
  defaultReviewState,
  readReviewStates,
  reviewStateKeyForReport,
  writeReviewState,
  type ReviewStatus,
} from "../review-state";
import { readOnlyStorage } from "./read-only-storage";

/* --- Commands --------------------------------------------------------- */

/* Commands carry only stable public identities the snapshot already exposes:
   a `caseId` (`report-<createdAt>`) and, for conditions, the persisted
   `conditionKey`. They never carry a Report, a storage key, or a Storage. */
export type ReviewStatusCommand = {
  kind: "review-status";
  caseId: string;
  status: ReviewStatus;
};

export type ConditionProgressCommand = {
  kind: "condition-progress";
  caseId: string;
  conditionKey: string;
  intent: "clear" | "reopen";
};

export type WorkspaceMutationCommand = ReviewStatusCommand | ConditionProgressCommand;

/* --- Result model ----------------------------------------------------- */

/* A small discriminated union. `boolean` is deliberately not used: the caller
   must be able to tell a verified persist from a no-op, a refusal, a hard
   failure and a read-back mismatch, and must reproject only on `persisted`. */
export type MutationOutcome =
  | "persisted"
  | "unchanged"
  | "unavailable"
  | "failed"
  | "verification-mismatch";

export type MutationResult = {
  outcome: MutationOutcome;
  /* Precise, user-facing copy. Never a stack trace or raw exception text. */
  message: string;
};

const persisted = (message: string): MutationResult => ({ outcome: "persisted", message });
const unchanged = (message: string): MutationResult => ({ outcome: "unchanged", message });
const unavailable = (message: string): MutationResult => ({ outcome: "unavailable", message });
const failed = (message: string): MutationResult => ({ outcome: "failed", message });
const verificationMismatch = (message: string): MutationResult => ({
  outcome: "verification-mismatch",
  message,
});

/* --- Service ---------------------------------------------------------- */

export interface WorkspacePersistence {
  applyReviewStatus(command: ReviewStatusCommand): MutationResult;
  applyConditionProgress(command: ConditionProgressCommand): MutationResult;
}

/* Resolve a `report-<createdAt>` case id to its stored Report. The lookup read
   is wrapped read-only so that `readReportHistory`'s documented prune-on-read
   side effect cannot write during resolution; the actual mutation below uses
   the writable Storage through the production write helper. */
function resolveReport(storage: Storage, caseId: string): Report | null {
  const wanted = caseId.startsWith("report-") ? caseId.slice("report-".length) : caseId;
  const history = readReportHistory(readOnlyStorage(storage));
  const entry = history.find((item) => item.createdAt === wanted);
  return entry ? entry.report : null;
}

/* How many stored, valid history entries share `report`'s review-state key.
   A recorded status can only be attributed to a single case when this is 1.
   Uses the read-only lookup so counting never writes. */
function reviewKeyMultiplicity(storage: Storage, key: string): number {
  const history = readReportHistory(readOnlyStorage(storage));
  return history.filter((entry) => reviewStateKeyForReport(entry.report) === key).length;
}

export function createWorkspacePersistence(storage: Storage): WorkspacePersistence {
  return {
    applyReviewStatus(command: ReviewStatusCommand): MutationResult {
      try {
        const report = resolveReport(storage, command.caseId);
        if (!report) {
          return unavailable(
            "This report is no longer stored in this browser, so its review status cannot be updated.",
          );
        }

        /* Reuse the exact production key derivation. This is the same key the
           read-only adapter reads, so a read-after-write here is authoritative
           for the Workspace V2 projection. */
        const key = reviewStateKeyForReport(report);

        /* Truthfulness boundary: never write a status that cannot be attributed
           to a single stored analysis. Enforced at the mutation layer, not only
           in the UI, so a stale command can never smuggle an ambiguous write. */
        if (reviewKeyMultiplicity(storage, key) !== 1) {
          return unavailable(
            "This report identity is shared by more than one stored analysis, so a recorded " +
              "review status cannot be assigned to a single case without ambiguity.",
          );
        }

        const current = readReviewStates(storage)[key];

        /* Selecting the already-persisted value is a typed no-op, not a write. A
           recommendation-derived provisional label (updatedAt null / absent) is
           NOT the persisted value, so applying it is a real first write. */
        if (current && current.updatedAt !== null && current.status === command.status) {
          return unchanged(`Review status is already recorded as “${command.status}”.`);
        }

        /* Reuse the production write helper. Owner and note are preserved from
           the current recorded state (or the neutral default); no new actor,
           timestamp field or status is invented — the helper stamps updatedAt. */
        writeReviewState(storage, key, {
          ...(current ?? defaultReviewState(report)),
          status: command.status,
        });

        /* Read-after-write: success requires an authoritative read-back that
           matches the intended value AND carries a recorded timestamp. */
        const verify = readReviewStates(storage)[key];
        if (!verify || verify.status !== command.status || verify.updatedAt === null) {
          return verificationMismatch(
            "The review status was written but a read-back did not confirm the new value, so the " +
              "workspace was not updated.",
          );
        }

        return persisted(`Review status recorded as “${command.status}”.`);
      } catch {
        /* Storage access / quota / security errors surface as a typed failure;
           the previous authoritative state is retained by the caller. */
        return failed(
          "The review status could not be saved. Local storage may be unavailable or full in this browser.",
        );
      }
    },

    applyConditionProgress(command: ConditionProgressCommand): MutationResult {
      try {
        const report = resolveReport(storage, command.caseId);
        if (!report) {
          return unavailable(
            "This report is no longer stored in this browser, so its condition progress cannot be updated.",
          );
        }

        /* Reuse the canonical condition set + key derivation. The write helper
           keys progress by `conditionProgressReportKey(report, conditions)`, so
           passing this exact conditions array keeps the key stable and matches
           what `/report` writes. */
        const conditions = reportConditions(report);
        if (conditions.length === 0) {
          return unavailable(
            "This report records no merge conditions, so condition progress cannot be changed.",
          );
        }

        /* The command must name a canonical condition of THIS report, proven by
           its persisted `conditionKey`. Anything else is refused rather than
           written against a wrong or invented identity. */
        const validKeys = new Set(conditions.map((condition) => conditionKey(condition)));
        if (!validKeys.has(command.conditionKey)) {
          return unavailable(
            "The selected requirement is not a canonical merge condition for this report, so its " +
              "progress cannot be recorded.",
          );
        }

        const cleared = readConditionProgress(storage, report, conditions);
        const isCleared = cleared.has(command.conditionKey);
        const wantCleared = command.intent === "clear";
        if (isCleared === wantCleared) {
          return unchanged(
            wantCleared ? "This condition is already marked cleared." : "This condition is already open.",
          );
        }

        const next = new Set(cleared);
        if (wantCleared) next.add(command.conditionKey);
        else next.delete(command.conditionKey);

        writeConditionProgress(storage, report, conditions, next);

        /* Read-after-write: confirm the cleared set now reflects the intent. */
        const verify = readConditionProgress(storage, report, conditions);
        if (verify.has(command.conditionKey) !== wantCleared) {
          return verificationMismatch(
            "Condition progress was written but a read-back did not confirm the change, so the " +
              "workspace was not updated.",
          );
        }

        return persisted(
          wantCleared
            ? "Condition marked cleared. This records progress only — it does not verify the " +
                "evidence, resolve the finding, record a decision, or make the merge safe."
            : "Condition reopened.",
        );
      } catch {
        return failed(
          "Condition progress could not be saved. Local storage may be unavailable or full in this browser.",
        );
      }
    },
  };
}
