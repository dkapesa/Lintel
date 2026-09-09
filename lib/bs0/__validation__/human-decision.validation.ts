import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createCanonicalReviewRunManifest,
  type CanonicalReviewRunManifest,
} from "../../canonical-review-run";
import { buildEvidenceHierarchy } from "../../evidence-hierarchy";
import {
  appendHumanDecisionLedgerEntry,
  appendHumanDecisionLedgerEntryToStorage,
  createEmptyHumanDecisionLedger,
  humanDecisionLedgerKeyForReport,
  projectHumanDecisionLedger,
  readHumanDecisionLedger,
  recommendationDivergenceForReport,
  writeHumanDecisionLedger,
  type HumanDecisionLedger,
  type HumanDecisionLedgerContext,
} from "../../human-decision-ledger";
import { buildMergeContract } from "../../merge-contract";
import type { Report } from "../../mock-report";
import { generateReport, type ReportInput } from "../../report-generator";
import {
  REPORT_HISTORY_STORAGE_KEY,
  type ReportHistoryEntry,
} from "../../report-history";
import {
  decisionDraftApplicability,
  decisionSubjectIdFromCapability,
  reviewIdFromOpaqueToken,
  type DecisionDraftContext,
} from "../../r6c/index";
import {
  HumanDecisionDraftStore,
  createDecisionDraftBinding,
  createEmptyHumanDecisionDraft,
} from "../../r6k/index";
import {
  createWorkspaceDecisionService,
  projectDecisionLineage,
} from "../../workspace-v2/decision-mutations";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import type { CaseDetail } from "../../workspace-v2/view-model";

type Test = { name: string; run: () => void | Promise<void> };
const tests: Test[] = [];
const test = (name: string, run: () => void | Promise<void>): void => { tests.push({ name, run }); };

function fail(message: string): never { throw new Error(message); }
function assert(value: unknown, message: string): asserts value {
  if (!value) fail(message);
}
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) fail(`${message}: expected ${String(expected)}, received ${String(actual)}`);
}
function notEqual<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) fail(`${message}: both values were ${String(actual)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) fail(`${message}: expected ${right}, received ${left}`);
}

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

const REPOSITORY = "lintel/bs0-human-decision";
const TITLE = "Characterize Human Decision boundary";
const HEAD_A = "head-bs0-human-a";
const HEAD_B = "head-bs0-human-b";
const CREATED_A = "2026-09-09T08:00:00.000Z";
const CREATED_B = "2026-09-09T09:00:00.000Z";

const RISKY_DIFF = [
  "diff --git a/src/payments.ts b/src/payments.ts",
  "index 1111111..2222222 100644",
  "--- a/src/payments.ts",
  "+++ b/src/payments.ts",
  "@@ -1 +1 @@",
  "-export const charge = once;",
  "+export const charge = retryPaymentWithoutIdempotency;",
].join("\n");

const DOCS_DIFF = [
  "diff --git a/docs/review.md b/docs/review.md",
  "index 3333333..4444444 100644",
  "--- a/docs/review.md",
  "+++ b/docs/review.md",
  "@@ -1 +1 @@",
  "-Old review note.",
  "+Clarify the reviewer instructions.",
].join("\n");

type Derived = {
  input: ReportInput;
  report: Report;
  canonicalRun: CanonicalReviewRunManifest;
  context: HumanDecisionLedgerContext;
};

function derive(options: {
  pullRequestNumber?: number;
  title?: string;
  diff?: string;
  headSha?: string;
  baseSha?: string;
  runId?: string;
  createdAt?: string;
  reviewProfile?: ReportInput["reviewProfile"];
} = {}): Derived {
  const pullRequestNumber = options.pullRequestNumber ?? 501;
  const createdAt = options.createdAt ?? CREATED_A;
  const input: ReportInput = {
    title: options.title ?? TITLE,
    repository: REPOSITORY,
    technology: "TypeScript",
    diff: options.diff ?? RISKY_DIFF,
    inputSource: "github-pr",
    pullRequestNumber,
    reviewProfile: options.reviewProfile ?? "standard",
  };
  const report = generateReport(input);
  const canonicalRun = createCanonicalReviewRunManifest({
    input,
    report,
    analysisSource: "deterministic",
    sourceType: "github-pr",
    runId: options.runId ?? `run-bs0-human-${pullRequestNumber}`,
    pullRequestNumber,
    baseSha: options.baseSha ?? "base-bs0-human",
    headSha: options.headSha ?? HEAD_A,
    createdAt,
    completedAt: createdAt,
  });
  const evidence = buildEvidenceHierarchy(report, null, {
    runId: canonicalRun.runId,
    headSha: canonicalRun.headSha,
    createdAt,
  });
  const mergeContract = buildMergeContract({
    report,
    evidenceHierarchy: evidence,
    canonicalRunId: canonicalRun.runId,
    baseSha: canonicalRun.baseSha,
    headSha: canonicalRun.headSha,
    sourceType: canonicalRun.sourceType,
    reviewMode: canonicalRun.reviewMode,
    createdAt,
  });
  return {
    input,
    report,
    canonicalRun,
    context: { report, canonicalRun, mergeContract, currentHeadSha: canonicalRun.headSha },
  };
}

function historyEntry(derived: Derived, createdAt: string, includeRun = true): ReportHistoryEntry {
  return {
    report: derived.report,
    source: "deterministic",
    ...(includeRun ? { canonicalRun: derived.canonicalRun } : {}),
    inputLabel: "GitHub PR import",
    createdAt,
    metadata: {
      title: derived.report.pr.title,
      repository: derived.report.pr.repository,
      recommendation: derived.report.verdict.recommendation,
      riskScore: derived.report.verdict.riskScore,
      reviewProfile: derived.canonicalRun.reviewMode,
    },
  };
}

function seedHistory(storage: Storage, entries: ReportHistoryEntry[]): void {
  storage.setItem(REPORT_HISTORY_STORAGE_KEY, JSON.stringify(entries));
}

async function currentDetail(storage: Storage): Promise<CaseDetail> {
  const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: null });
  assert(snapshot.status === "ready" && snapshot.cases.length > 0, "real Workspace detail must project");
  return snapshot.cases[0]!;
}

function recordedLedger(derived: Derived, options: {
  outcome?: "approve" | "tests-required" | "review-required";
  recordedAt?: string;
  referencedEvidenceIds?: string[];
  referencedClauseIds?: string[];
} = {}): HumanDecisionLedger {
  const empty = createEmptyHumanDecisionLedger(derived.context, CREATED_A);
  return appendHumanDecisionLedgerEntry(empty, derived.context, {
    eventType: "decision-recorded",
    outcome: options.outcome ?? "approve",
    actor: { displayLabel: "BS0 reviewer", source: "local" },
    reason: "Explicit accountable engineering judgment.",
    referencedEvidenceIds: options.referencedEvidenceIds,
    referencedClauseIds: options.referencedClauseIds,
    recordedAt: options.recordedAt ?? CREATED_A,
    source: "local",
  });
}

function source(path: string): string {
  return readFileSync(join(process.cwd(), ...path.split("/")), "utf8");
}

test("H1 - machine recommendation remains separate from Human Decision authority", async () => {
  const storage = new MemoryStorage();
  const derived = derive();
  seedHistory(storage, [historyEntry(derived, CREATED_A)]);

  const before = await currentDetail(storage);
  assert(before.recommendation.length > 0, "machine recommendation exists");
  equal(before.decision.status, "empty", "no Human Decision is inferred from recommendation");
  assert(before.decisionMutation.kind === "available", "real decision mutation is available");

  const result = createWorkspaceDecisionService(storage).recordDecision({
    kind: "record",
    caseId: before.decisionMutation.caseId,
    expectedHeadSha: before.decisionMutation.currentHeadSha,
    outcome: "approve",
    rationale: "The accountable reviewer approves independently.",
    references: [],
    acceptedRiskReferences: [],
  });
  equal(result.outcome, "persisted", "explicit Human Decision persists");

  const after = await currentDetail(storage);
  equal(after.recommendation, before.recommendation, "machine recommendation remains unchanged");
  assert(after.decision.status === "recorded", "Human Decision is separately recorded");
  equal(after.decision.outcome, "approve", "human outcome remains independently represented");
  assert(recommendationDivergenceForReport(derived.report, {
    ...readHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(derived.report), derived.context).entries[0]!,
  }) !== "unavailable", "recommendation relationship is derived only after a Human Decision exists");
});

test("H2 - draft binding is stronger than persisted decision applicability", () => {
  const storage = new MemoryStorage();
  const reviewId = reviewIdFromOpaqueToken("review-bs0-human-draft");
  const contextA: DecisionDraftContext = {
    reviewId,
    decisionSubject: { status: "available", decisionSubjectId: decisionSubjectIdFromCapability("subject-bs0-human") },
    basis: { caseId: "case-bs0-human", runId: "run-a", headSha: HEAD_A },
  };
  const binding = createDecisionDraftBinding(reviewId, contextA, CREATED_A);
  deepEqual(Object.keys(binding).sort(), [
    "authoredAt", "caseId", "decisionSubject", "headSha", "reviewId", "runId", "schemaVersion",
  ], "draft binding carries its actual identity dimensions");

  const draft = {
    ...createEmptyHumanDecisionDraft(reviewId, contextA, null, CREATED_A),
    selectedOutcome: "tests-required" as const,
    rationale: "Retain the authored draft basis.",
    updatedAt: CREATED_A,
  };
  assert(new HumanDecisionDraftStore(storage).write(reviewId, draft).persisted, "draft persists by ReviewId");
  const draftEnvelope = JSON.parse(storage.getItem("lintel.r6.humanDecisionDraft.v1")!) as { drafts: Record<string, unknown> };
  deepEqual(Object.keys(draftEnvelope.drafts), [reviewId], "draft store slot is the ReviewId");

  const contextB: DecisionDraftContext = {
    ...contextA,
    basis: { ...contextA.basis, runId: "run-b" },
  };
  const draftApplicability = decisionDraftApplicability(binding, contextB);
  equal(draftApplicability.verdict, "stale-verification-basis", "run change stales the draft");
  assert(draftApplicability.reasonCodes.includes("run-changed"), "draft reports the changed run");

  const derivedA = derive({ runId: "run-a" });
  const derivedB = derive({ runId: "run-b" });
  const persisted = recordedLedger(derivedA);
  writeHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(derivedA.report), persisted);
  const reread = readHumanDecisionLedger(
    storage,
    humanDecisionLedgerKeyForReport(derivedB.report),
    derivedB.context,
  );
  equal(reread.entries[0]?.canonicalRunId, "run-a", "persisted entry retains its authored run");
  equal(reread.reportLineage.canonicalRunId, "run-b", "read context carries the later run");
  equal(projectHumanDecisionLedger(reread, HEAD_A).applicability, "applicable", "persisted decision remains applicable without a run check");
});

test("H3 - distinct PRs collide in the real outer persistence key and surface one decision in the other", async () => {
  const storage = new MemoryStorage();
  const prA = derive({ pullRequestNumber: 601, runId: "run-pr-a" });
  const prB = derive({ pullRequestNumber: 602, runId: "run-pr-b" });
  assert(prA.report.pr.number !== prB.report.pr.number, "PR situations are genuinely distinct");
  const keyA = humanDecisionLedgerKeyForReport(prA.report);
  const keyB = humanDecisionLedgerKeyForReport(prB.report);
  equal(keyA, keyB, "outer persistence key omits PR number");

  writeHumanDecisionLedger(storage, keyA, recordedLedger(prA, { outcome: "tests-required" }));
  seedHistory(storage, [historyEntry(prB, CREATED_B)]);
  const surfaced = await currentDetail(storage);
  equal(surfaced.github.pullRequestNumber, 602, "current case is PR B");
  assert(surfaced.decision.status === "recorded", "PR A decision surfaces in PR B");
  equal(surfaced.decision.outcome, "tests-required", "aliased decision outcome is observable in PR B");
});

test("H4 - outer storage ownership and intrinsic ledger identity use different ingredients", () => {
  const storage = new MemoryStorage();
  const prA = derive({ pullRequestNumber: 611, runId: "run-ledger-a" });
  const prB = derive({ pullRequestNumber: 612, runId: "run-ledger-b" });
  const emptyA = createEmptyHumanDecisionLedger(prA.context, CREATED_A);
  const emptyB = createEmptyHumanDecisionLedger(prB.context, CREATED_A);
  equal(humanDecisionLedgerKeyForReport(prA.report), humanDecisionLedgerKeyForReport(prB.report), "outer keys alias");
  notEqual(emptyA.ledgerId, emptyB.ledgerId, "intrinsic ledger identity includes the distinct PR number");

  const storedA = recordedLedger(prA);
  writeHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(prA.report), storedA);
  const readAsB = readHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(prB.report), prB.context);
  equal(readAsB.ledgerId, storedA.ledgerId, "outer lookup returns PR A intrinsic ledger under PR B context");
  equal(readAsB.pullRequestNumber, 611, "ledger ownership remains PR A");
  equal(readAsB.entries[0]?.pullRequestNumber, 611, "entry identity remains PR A");
});

test("H5 - ledger applicability is the current head equality boundary, including unknown heads", () => {
  const derived = derive();
  const bound = recordedLedger(derived);
  const same = projectHumanDecisionLedger(bound, HEAD_A);
  const changed = projectHumanDecisionLedger(bound, HEAD_B);
  const unknownCurrent = projectHumanDecisionLedger(bound, undefined);
  equal(same.applicability, "applicable", "same known head applies");
  equal(same.currentApplicableEntry?.entryId, same.latestEffectiveEntry?.entryId, "same head supplies current applicable entry");
  equal(changed.applicability, "predates-current-head", "different known head predates current head");
  equal(changed.currentApplicableEntry, undefined, "different head has no current applicable entry");
  equal(unknownCurrent.applicability, "applicable", "missing current head is treated as applicable by ledger projection");

  const headlessContext: HumanDecisionLedgerContext = { ...derived.context, canonicalRun: null, currentHeadSha: undefined };
  const headless = appendHumanDecisionLedgerEntry(
    createEmptyHumanDecisionLedger(headlessContext, CREATED_A),
    headlessContext,
    { eventType: "decision-recorded", outcome: "approve", recordedAt: CREATED_A },
  );
  equal(headless.entries[0]?.applicableHeadSha, undefined, "headless record stores no head");
  equal(projectHumanDecisionLedger(headless, HEAD_B).applicability, "applicable", "missing recorded head also applies in the raw ledger projection");
});

test("H6 - equal head keeps a decision applicable across a different verification basis", () => {
  const storage = new MemoryStorage();
  const basisA = derive({ runId: "run-basis-a", diff: RISKY_DIFF, reviewProfile: "standard", headSha: HEAD_A });
  const basisB = derive({ runId: "run-basis-b", diff: DOCS_DIFF, reviewProfile: "security-sensitive", headSha: HEAD_A, baseSha: "base-bs0-human-b", createdAt: CREATED_B });
  notEqual(basisA.canonicalRun.runId, basisB.canonicalRun.runId, "canonical run differs");
  notEqual(basisA.canonicalRun.baseSha, basisB.canonicalRun.baseSha, "base SHA differs");
  notEqual(basisA.canonicalRun.configurationFingerprint, basisB.canonicalRun.configurationFingerprint, "configuration fingerprint differs");
  notEqual(basisA.canonicalRun.resultFingerprint, basisB.canonicalRun.resultFingerprint, "result fingerprint differs");
  notEqual(basisA.canonicalRun.evidenceHierarchy?.evidenceFingerprint, basisB.canonicalRun.evidenceHierarchy?.evidenceFingerprint, "Evidence fingerprint differs");
  notEqual(basisA.canonicalRun.mergeContract?.contractFingerprint, basisB.canonicalRun.mergeContract?.contractFingerprint, "Contract fingerprint differs");

  const key = humanDecisionLedgerKeyForReport(basisA.report);
  equal(key, humanDecisionLedgerKeyForReport(basisB.report), "verification-basis changes do not change outer key");
  writeHumanDecisionLedger(storage, key, recordedLedger(basisA));
  const readOnB = readHumanDecisionLedger(storage, key, basisB.context);
  const projection = projectHumanDecisionLedger(readOnB, HEAD_A);
  equal(projection.applicability, "applicable", "equal head alone preserves current ledger applicability");
  equal(projection.latestEffectiveEntry?.canonicalRunId, "run-basis-a", "entry remains bound to the earlier run");
  equal(readOnB.reportLineage.canonicalRunId, "run-basis-b", "read ledger lineage is refreshed from the later context");
});

test("H7 - unavailable referenced evidence is retained without invalidating the decision", async () => {
  const storage = new MemoryStorage();
  const earlier = derive({ runId: "run-reference-a", diff: RISKY_DIFF, headSha: HEAD_A });
  const later = derive({ runId: "run-reference-b", diff: DOCS_DIFF, headSha: HEAD_A, createdAt: CREATED_B });
  const earlierEvidence = buildEvidenceHierarchy(earlier.report, null, { runId: earlier.canonicalRun.runId, headSha: HEAD_A, createdAt: CREATED_A });
  const laterEvidence = buildEvidenceHierarchy(later.report, null, { runId: later.canonicalRun.runId, headSha: HEAD_A, createdAt: CREATED_B });
  const laterIds = new Set(laterEvidence.records.map((record) => record.evidenceId));
  const missing = earlierEvidence.records.find((record) => !laterIds.has(record.evidenceId));
  assert(missing, "fixture must produce an evidence reference absent from the later basis");

  const key = humanDecisionLedgerKeyForReport(earlier.report);
  writeHumanDecisionLedger(storage, key, recordedLedger(earlier, { referencedEvidenceIds: [missing.evidenceId] }));
  seedHistory(storage, [historyEntry(later, CREATED_B)]);
  const detail = await currentDetail(storage);
  assert(detail.decision.status === "recorded", "decision remains recorded");
  equal(detail.decision.applicability, "applicable", "unavailable reference does not stale equal-head decision");
  const unresolved = detail.decision.references.find((reference) => reference.id === missing.evidenceId);
  assert(unresolved, "unresolved reference ID is retained");
  equal(unresolved.available, false, "reference is explicitly projected unavailable");
});

test("H8 - reaffirmation copies authority and unresolved references onto the new head", async () => {
  const storage = new MemoryStorage();
  const earlier = derive({ runId: "run-reaffirm-a", diff: RISKY_DIFF, headSha: HEAD_A });
  const later = derive({ runId: "run-reaffirm-b", diff: DOCS_DIFF, headSha: HEAD_B, baseSha: HEAD_A, createdAt: CREATED_B });
  seedHistory(storage, [historyEntry(earlier, CREATED_A)]);
  const before = await currentDetail(storage);
  assert(before.decisionMutation.kind === "available", "initial decision is mutable");
  const laterIds = new Set(buildEvidenceHierarchy(later.report, null, {
    runId: later.canonicalRun.runId,
    headSha: HEAD_B,
    createdAt: CREATED_B,
  }).records.map((record) => record.evidenceId));
  const reference = before.evidence.find((item) => !laterIds.has(item.evidenceId));
  assert(reference, "initial case supplies a reference absent from the new basis");

  const service = createWorkspaceDecisionService(storage);
  const first = service.recordDecision({
    kind: "record",
    caseId: before.decisionMutation.caseId,
    expectedHeadSha: before.decisionMutation.currentHeadSha,
    outcome: "review-required",
    rationale: "Specialist review is required on the initial head.",
    references: [{ id: reference.evidenceId, kind: "evidence" }],
    acceptedRiskReferences: [],
  });
  assert(first.outcome === "persisted" && first.effectiveEntryId, "initial referenced decision persists");

  seedHistory(storage, [historyEntry(later, CREATED_B)]);
  const moved = await currentDetail(storage);
  assert(moved.decision.status === "recorded", "prior decision projects on new head");
  equal(moved.decision.applicability, "predates-current-head", "head change requires reaffirmation");
  equal(moved.decision.references[0]?.available, false, "referenced evidence is unavailable on new basis");
  assert(moved.decisionMutation.kind === "available", "new-head decision is mutable");

  const reaffirmed = service.reaffirmDecision({
    kind: "reaffirm",
    caseId: moved.decisionMutation.caseId,
    expectedHeadSha: moved.decisionMutation.currentHeadSha,
    expectedEffectiveEntryId: first.effectiveEntryId,
    rationale: "Reaffirm the human judgment on the new head.",
  });
  assert(reaffirmed.outcome === "persisted" && reaffirmed.effectiveEntryId, "reaffirmation persists");
  const after = await currentDetail(storage);
  assert(after.decision.status === "recorded", "reaffirmed decision projects");
  equal(after.decision.effectiveEventType, "decision-reaffirmed", "new effective event is reaffirmation");
  equal(after.decision.applicableHeadSha, HEAD_B, "reaffirmation binds the new head");
  equal(after.decision.outcome, "review-required", "reaffirmation copies the outcome");
  equal(after.decision.references[0]?.id, reference.evidenceId, "reaffirmation copies the prior reference ID");
  equal(after.decision.references[0]?.available, false, "copied reference remains unresolved");
  equal(after.decision.history?.[0]?.reaffirmsEntryId, first.effectiveEntryId, "reaffirmation links the prior entry");
});

test("H9 - exact duplicate append is idempotent while multiple ledger decisions select the latest", () => {
  const storage = new MemoryStorage();
  const derived = derive();
  const key = humanDecisionLedgerKeyForReport(derived.report);
  let ledger = createEmptyHumanDecisionLedger(derived.context, CREATED_A);
  const firstInput = {
    eventType: "decision-recorded" as const,
    outcome: "tests-required" as const,
    reason: "Run the focused suite.",
    recordedAt: CREATED_A,
    idempotencyKey: "bs0-exact-repeat",
  };
  ledger = appendHumanDecisionLedgerEntryToStorage(storage, key, ledger, derived.context, firstInput);
  ledger = appendHumanDecisionLedgerEntryToStorage(storage, key, ledger, derived.context, firstInput);
  equal(ledger.entries.length, 1, "identical fingerprint appends once");

  ledger = appendHumanDecisionLedgerEntryToStorage(storage, key, ledger, derived.context, {
    eventType: "decision-recorded",
    outcome: "approve",
    reason: "A later independently recorded decision.",
    recordedAt: CREATED_B,
    idempotencyKey: "bs0-later-decision",
  });
  equal(ledger.entries.length, 2, "ledger helper allows a second distinct decision event");
  const projection = projectHumanDecisionLedger(ledger, HEAD_A);
  equal(projection.latestEffectiveEntry?.outcome, "approve", "latest unsuperseded decision is current");
  deepEqual(projectDecisionLineage(ledger, HEAD_A).map((event) => event.outcome), ["approve", "tests-required"], "history is newest first");
  equal(ledger.latestEffectiveEntryId, projection.latestEffectiveEntry?.entryId, "ledger records the projected current entry");
});

test("H10 - headless recording is executable and later projects as unbound", async () => {
  const storage = new MemoryStorage();
  const derived = derive({ runId: "run-headless-later", headSha: HEAD_B });
  seedHistory(storage, [historyEntry(derived, CREATED_A, false)]);
  const headless = await currentDetail(storage);
  assert(headless.decisionMutation.kind === "available", "headless case remains mutable");
  equal(headless.decisionMutation.headRecorded, false, "mutation capability reports no head");
  equal(headless.decisionMutation.currentHeadSha, null, "headless target is null");

  const result = createWorkspaceDecisionService(storage).recordDecision({
    kind: "record",
    caseId: headless.decisionMutation.caseId,
    expectedHeadSha: null,
    outcome: "approve",
    rationale: "Explicitly record without a known head.",
    references: [],
    acceptedRiskReferences: [],
  });
  equal(result.outcome, "persisted", "service permits headless record");
  const initiallyProjected = await currentDetail(storage);
  assert(initiallyProjected.decision.status === "recorded", "headless decision is recorded");
  equal(initiallyProjected.decision.applicableHeadSha, null, "persisted entry has no head binding");
  equal(initiallyProjected.decision.applicability, "current-head-unavailable", "Workspace does not infer currentness while current head is unknown");

  seedHistory(storage, [historyEntry(derived, CREATED_B, true)]);
  const later = await currentDetail(storage);
  assert(later.decision.status === "recorded", "headless decision remains visible once a head is known");
  equal(later.decision.applicability, "unbound", "Workspace marks the headless decision unbound");
  const raw = readHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(derived.report), derived.context);
  equal(projectHumanDecisionLedger(raw, HEAD_B).applicability, "applicable", "raw ledger projection still calls the unbound decision applicable");

  const r4Dialog = source("app/workspace/HumanDecisionDialog.tsx");
  const v2Dialog = source("app/workspace-v2/components/decision-dialogs.tsx");
  assert(r4Dialog.includes("(!noHead || unboundAcknowledged)"), "R4 dialog requires explicit unbound acknowledgement");
  assert(r4Dialog.includes("this decision cannot be bound to a recorded head"), "R4 dialog explains unbound applicability");
  assert(v2Dialog.includes("if (!headRecorded && !noHeadAck)"), "Workspace V2 dialog requires explicit no-head acknowledgement");
  assert(v2Dialog.includes("stale detection is disabled"), "Workspace V2 dialog states the headless consequence");
});

test("H11 - reachable Human Decision routes share the writer but retain different head gates", () => {
  const workspacePage = source("app/workspace/page.tsx");
  const r4Bootstrap = source("app/workspace/RealWorkspaceR4Bootstrap.tsx");
  const r4Client = source("app/workspace/WorkspaceR4Client.tsx");
  const v2Page = source("app/workspace-v2/page.tsx");
  const v2Entry = source("app/workspace-v2/WorkspaceRouteEntry.tsx");
  const v2Bootstrap = source("app/workspace-v2/RealWorkspaceBootstrap.tsx");
  const v2Client = source("app/workspace-v2/WorkspaceV2Client.tsx");
  const workstationLayout = source("app/(workstation)/layout.tsx");
  const workstationProvider = source("app/(workstation)/WorkstationProvider.tsx");
  const workstationComposer = source("app/(workstation)/HumanDecisionComposer.tsx");
  const reportPage = source("app/report/page.tsx");
  const legacyPage = source("app/workspace-legacy/page.tsx");

  assert(workspacePage.includes("RealWorkspaceR4Bootstrap"), "/workspace real route enters R4 bootstrap");
  assert(r4Bootstrap.includes("createWorkspaceDecisionService(window.localStorage)"), "R4 bootstrap constructs canonical decision service");
  for (const call of ["recordDecision", "supersedeDecision", "reaffirmDecision", "withdrawDecision"]) {
    assert(r4Client.includes(`decisionService.${call}`), `R4 client routes ${call}`);
  }
  assert(v2Page.includes("renderWorkspaceRoute(params, \"fixture\")"), "/workspace-v2 is the fixture-default compatibility route");
  assert(v2Entry.includes("<RealWorkspaceBootstrap reportId={reportId} />"), "Workspace V2 real mode enters its bootstrap");
  assert(v2Bootstrap.includes("createWorkspaceDecisionService(window.localStorage)"), "Workspace V2 bootstrap constructs canonical decision service");
  for (const call of ["recordDecision", "supersedeDecision", "reaffirmDecision", "withdrawDecision"]) {
    assert(v2Client.includes(`decisionService.${call}`), `Workspace V2 client routes ${call}`);
  }
  assert(workstationLayout.includes("<WorkstationProvider>"), "/reviews route group is owned by Workstation provider");
  assert(workstationProvider.includes("createWorkspaceDecisionService(browserStorage.current)"), "Workstation constructs canonical decision service");
  assert(workstationProvider.includes("<HumanDecisionComposer"), "Workstation mounts its draft-backed composer");
  assert(workstationComposer.includes("decisionSubmittability(draft, detail, context)"), "Workstation submission uses strict draft applicability");

  const reviewId = reviewIdFromOpaqueToken("review-head-gate");
  const unavailableContext: DecisionDraftContext = {
    reviewId,
    decisionSubject: { status: "available", decisionSubjectId: decisionSubjectIdFromCapability("subject-head-gate") },
    basis: { caseId: "case-head-gate", runId: null, headSha: null },
  };
  const unavailableBinding = createDecisionDraftBinding(reviewId, unavailableContext, CREATED_A);
  equal(decisionDraftApplicability(unavailableBinding, unavailableContext).verdict, "indeterminate", "Workstation draft path blocks unknown run/head even when unchanged");
  assert(!reportPage.includes("createWorkspaceDecisionService"), "/report is read-only for Human Decisions");
  assert(!legacyPage.includes("createWorkspaceDecisionService"), "/workspace-legacy does not record ledger decisions");
});

test("H12 - ambiguous ownership aliases in the ledger but remains isolated in the draft store", async () => {
  const storage = new MemoryStorage();
  const prA = derive({ pullRequestNumber: 701, runId: "run-ambiguity-a" });
  const prB = derive({ pullRequestNumber: 702, runId: "run-ambiguity-b" });
  const sharedKey = humanDecisionLedgerKeyForReport(prA.report);
  equal(sharedKey, humanDecisionLedgerKeyForReport(prB.report), "distinct PR ownership is ambiguous at the ledger key");
  writeHumanDecisionLedger(storage, sharedKey, recordedLedger(prA, { outcome: "review-required" }));
  seedHistory(storage, [historyEntry(prB, CREATED_B)]);
  const detailB = await currentDetail(storage);
  assert(detailB.decision.status === "recorded", "storage layer aliases PR A decision into PR B");
  assert(detailB.decisionMutation.kind === "available", "aliased record is treated as an effective mutable decision");
  const attemptedB = createWorkspaceDecisionService(storage).recordDecision({
    kind: "record",
    caseId: detailB.decisionMutation.caseId,
    expectedHeadSha: detailB.decisionMutation.currentHeadSha,
    outcome: "approve",
    rationale: "A distinct PR B decision.",
    references: [],
    acceptedRiskReferences: [],
  });
  equal(attemptedB.outcome, "stale-command", "service chooses aliased PR A as an existing effective decision instead of reporting ambiguity");

  const reviewA = reviewIdFromOpaqueToken("review-ambiguity-a");
  const reviewB = reviewIdFromOpaqueToken("review-ambiguity-b");
  const sharedSubject = decisionSubjectIdFromCapability("colliding-subject");
  const contextFor = (reviewId: typeof reviewA): DecisionDraftContext => ({
    reviewId,
    decisionSubject: { status: "available", decisionSubjectId: sharedSubject },
    basis: { caseId: "colliding-case", runId: "colliding-run", headSha: HEAD_A },
  });
  const draftStore = new HumanDecisionDraftStore(storage);
  assert(draftStore.write(reviewA, {
    ...createEmptyHumanDecisionDraft(reviewA, contextFor(reviewA), null, CREATED_A),
    rationale: "Draft A",
    updatedAt: CREATED_A,
  }).persisted, "draft A persists");
  assert(draftStore.write(reviewB, {
    ...createEmptyHumanDecisionDraft(reviewB, contextFor(reviewB), null, CREATED_B),
    rationale: "Draft B",
    updatedAt: CREATED_B,
  }).persisted, "draft B persists");
  assert(draftStore.read(reviewA).status === "valid" && draftStore.read(reviewB).status === "valid", "draft records remain separately addressable by ReviewId");
  const readA = draftStore.read(reviewA);
  const readB = draftStore.read(reviewB);
  assert(readA.status === "valid" && readB.status === "valid", "both draft records remain valid");
  notEqual(readA.draft.rationale, readB.draft.rationale, "draft layer does not upgrade shared subject into shared ownership");
});

let passed = 0;
for (const item of tests) {
  try {
    await item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`BS0.5 Human Decision validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`BS0.5 Human Decision validation: ${passed}/${tests.length} grouped checks passed\n`);
