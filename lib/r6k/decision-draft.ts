import {
  type DecisionDraftBinding,
  type ReviewId,
  type StorageLike,
} from "../r6c/index";
import {
  HUMAN_DECISION_DRAFT_STORAGE_KEY,
  draftBindingIntegrity,
} from "../r6c/human-decision-draft-boundary";
import { DECISION_OUTCOMES, type DecisionOutcome } from "../workspace-v2/view-model";

export const R6K_DRAFT_SCHEMA_VERSION = 1 as const;
export const MAX_HUMAN_DECISION_DRAFTS = 64;

export type HumanDecisionDraftRecord = Readonly<{
  schemaVersion: typeof R6K_DRAFT_SCHEMA_VERSION;
  binding: DecisionDraftBinding;
  recordedEntryId: string | null;
  selectedOutcome: DecisionOutcome | null;
  rationale: string;
  acceptedRiskReferenceIds: readonly string[];
  updatedAt: string;
}>;

export type DraftNotSavedReason =
  | "storage-full"
  | "device-draft-limit-reached"
  | "unreadable-review-draft"
  | "storage-unavailable";

export type DraftDurability =
  | Readonly<{ category: "saved"; label: "Draft saved" }>
  | Readonly<{
      category: "not-saved";
      label: "Draft not saved on this device";
      reason: DraftNotSavedReason;
    }>
  | Readonly<{
      category: "unavailable";
      label: "Drafts unavailable on this device";
      reason: "store-unreadable" | "storage-unavailable";
    }>;

export type DraftReadResult =
  | Readonly<{ status: "absent" }>
  | Readonly<{ status: "valid"; draft: HumanDecisionDraftRecord }>
  | Readonly<{ status: "quarantined"; reasonCodes: readonly string[] }>;

export type DraftWriteResult = Readonly<{
  persisted: boolean;
  durability: DraftDurability;
}>;

export type DraftRemovalResult = Readonly<{
  removed: boolean;
  durability: DraftDurability;
  reason?: "record-quarantined";
}>;

type DraftEnvelope = Readonly<{
  schemaVersion: typeof R6K_DRAFT_SCHEMA_VERSION;
  drafts: Record<string, unknown>;
}>;

type StoreState =
  | { status: "available"; drafts: Record<string, unknown> }
  | { status: "unavailable"; reason: "store-unreadable" | "storage-unavailable" };

const OUTCOME_SET = new Set<string>(DECISION_OUTCOMES);
const DRAFT_KEYS = [
  "schemaVersion",
  "binding",
  "recordedEntryId",
  "selectedOutcome",
  "rationale",
  "acceptedRiskReferenceIds",
  "updatedAt",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function finiteDate(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}

function nullableNonEmptyString(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.length > 0);
}

export function humanDecisionDraftIntegrity(
  value: unknown,
  expectedReviewId?: ReviewId,
): DraftReadResult {
  if (!isRecord(value)) return { status: "quarantined", reasonCodes: ["not-an-object"] };
  const reasons: string[] = [];
  if (!hasExactKeys(value, DRAFT_KEYS)) reasons.push("record-shape");
  if (value.schemaVersion !== R6K_DRAFT_SCHEMA_VERSION) reasons.push("schema-version");
  const binding = draftBindingIntegrity(value.binding);
  if (binding.status === "quarantine") {
    reasons.push(...binding.reasonCodes.map((reason) => `binding-${reason}`));
  } else if (expectedReviewId !== undefined && binding.binding.reviewId !== expectedReviewId) {
    reasons.push("review-owner");
  }
  if (!nullableNonEmptyString(value.recordedEntryId)) reasons.push("recorded-entry-id");
  if (value.selectedOutcome !== null && (
    typeof value.selectedOutcome !== "string" || !OUTCOME_SET.has(value.selectedOutcome)
  )) reasons.push("selected-outcome");
  if (typeof value.rationale !== "string" || value.rationale.length > 700) reasons.push("rationale");
  if (!Array.isArray(value.acceptedRiskReferenceIds) || value.acceptedRiskReferenceIds.some(
    (id) => typeof id !== "string" || id.length === 0,
  )) reasons.push("accepted-risk-reference-ids");
  if (Array.isArray(value.acceptedRiskReferenceIds) && new Set(value.acceptedRiskReferenceIds).size !== value.acceptedRiskReferenceIds.length) {
    reasons.push("duplicate-accepted-risk-reference-id");
  }
  if (!finiteDate(value.updatedAt)) reasons.push("updated-at");
  return reasons.length > 0
    ? { status: "quarantined", reasonCodes: reasons }
    : { status: "valid", draft: value as unknown as HumanDecisionDraftRecord };
}

function readStore(storage: StorageLike | null): StoreState {
  if (!storage) return { status: "unavailable", reason: "storage-unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY);
  } catch {
    return { status: "unavailable", reason: "storage-unavailable" };
  }
  if (raw === null) return { status: "available", drafts: {} };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "unavailable", reason: "store-unreadable" };
  }
  if (
    !isRecord(parsed)
    || !hasExactKeys(parsed, ["schemaVersion", "drafts"])
    || parsed.schemaVersion !== R6K_DRAFT_SCHEMA_VERSION
    || !isRecord(parsed.drafts)
  ) {
    return { status: "unavailable", reason: "store-unreadable" };
  }
  return { status: "available", drafts: parsed.drafts };
}

function unavailableDurability(reason: StoreState extends infer _T ? "store-unreadable" | "storage-unavailable" : never): DraftDurability {
  return { category: "unavailable", label: "Drafts unavailable on this device", reason };
}

function notSaved(reason: DraftNotSavedReason): DraftDurability {
  return { category: "not-saved", label: "Draft not saved on this device", reason };
}

function saved(): DraftDurability {
  return { category: "saved", label: "Draft saved" };
}

function writeFailure(error: unknown): DraftWriteResult {
  const name = isRecord(error) && typeof error.name === "string" ? error.name : "";
  const message = error instanceof Error ? error.message : "";
  const quota = /quota/i.test(name) || /quota|storage full/i.test(message);
  return { persisted: false, durability: notSaved(quota ? "storage-full" : "storage-unavailable") };
}

/**
 * One session-scoped durable mirror. Envelope quarantine is fixed at construction
 * so no later R6K path can accidentally repair or overwrite unreadable bytes.
 */
export class HumanDecisionDraftStore {
  private state: StoreState;
  private readonly storage: StorageLike | null;

  constructor(storage: StorageLike | null) {
    this.storage = storage;
    this.state = readStore(storage);
  }

  storeDurability(): DraftDurability | null {
    return this.state.status === "unavailable" ? unavailableDurability(this.state.reason) : null;
  }

  read(reviewId: ReviewId): DraftReadResult {
    if (this.state.status === "unavailable") return { status: "absent" };
    if (!Object.prototype.hasOwnProperty.call(this.state.drafts, reviewId)) return { status: "absent" };
    return humanDecisionDraftIntegrity(this.state.drafts[reviewId], reviewId);
  }

  occupiedSlots(): number {
    return this.state.status === "available" ? Object.keys(this.state.drafts).length : 0;
  }

  write(reviewId: ReviewId, draft: HumanDecisionDraftRecord): DraftWriteResult {
    if (this.state.status === "unavailable") {
      return { persisted: false, durability: unavailableDurability(this.state.reason) };
    }
    const valid = humanDecisionDraftIntegrity(draft, reviewId);
    if (valid.status !== "valid") return { persisted: false, durability: notSaved("storage-unavailable") };

    const existing = this.read(reviewId);
    if (existing.status === "quarantined") {
      return { persisted: false, durability: notSaved("unreadable-review-draft") };
    }
    if (existing.status === "absent" && this.occupiedSlots() >= MAX_HUMAN_DECISION_DRAFTS) {
      return { persisted: false, durability: notSaved("device-draft-limit-reached") };
    }
    const next = { ...this.state.drafts, [reviewId]: draft };
    try {
      this.storage!.setItem(HUMAN_DECISION_DRAFT_STORAGE_KEY, JSON.stringify({
        schemaVersion: R6K_DRAFT_SCHEMA_VERSION,
        drafts: next,
      } satisfies DraftEnvelope));
      this.state = { status: "available", drafts: next };
      return { persisted: true, durability: saved() };
    } catch (error) {
      return writeFailure(error);
    }
  }

  removeValid(reviewId: ReviewId): DraftRemovalResult {
    if (this.state.status === "unavailable") {
      return { removed: false, durability: unavailableDurability(this.state.reason) };
    }
    const existing = this.read(reviewId);
    if (existing.status === "quarantined") {
      return {
        removed: false,
        durability: notSaved("unreadable-review-draft"),
        reason: "record-quarantined",
      };
    }
    if (existing.status === "absent") return { removed: true, durability: saved() };
    const next = { ...this.state.drafts };
    delete next[reviewId];
    try {
      this.storage!.setItem(HUMAN_DECISION_DRAFT_STORAGE_KEY, JSON.stringify({
        schemaVersion: R6K_DRAFT_SCHEMA_VERSION,
        drafts: next,
      } satisfies DraftEnvelope));
      this.state = { status: "available", drafts: next };
      return { removed: true, durability: saved() };
    } catch (error) {
      const failure = writeFailure(error);
      return { removed: false, durability: failure.durability };
    }
  }

  replaceUnreadable(reviewId: ReviewId, draft: HumanDecisionDraftRecord): DraftWriteResult {
    if (this.state.status === "unavailable") {
      return { persisted: false, durability: unavailableDurability(this.state.reason) };
    }
    if (this.read(reviewId).status !== "quarantined") {
      return { persisted: false, durability: notSaved("storage-unavailable") };
    }
    const valid = humanDecisionDraftIntegrity(draft, reviewId);
    if (valid.status !== "valid") return { persisted: false, durability: notSaved("storage-unavailable") };
    const next = { ...this.state.drafts, [reviewId]: draft };
    try {
      this.storage!.setItem(HUMAN_DECISION_DRAFT_STORAGE_KEY, JSON.stringify({
        schemaVersion: R6K_DRAFT_SCHEMA_VERSION,
        drafts: next,
      } satisfies DraftEnvelope));
      this.state = { status: "available", drafts: next };
      return { persisted: true, durability: saved() };
    } catch (error) {
      return writeFailure(error);
    }
  }
}

export function isHumanDecisionDraftDirty(draft: HumanDecisionDraftRecord): boolean {
  return draft.selectedOutcome !== null
    || draft.rationale.length > 0
    || draft.acceptedRiskReferenceIds.length > 0;
}
