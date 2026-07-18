# R0B.2 — Recorded Human Decision System: Design Contract

**Milestone:** R0B.2A — Recorded Human Decision System Definition
**Status:** **APPROVED** with amendments (see §24). Design/analysis + normative lock only. No application/domain code changed. Awaiting R0B.2B implementation.
**Scope discipline (R0B.2A):** Exactly one repository file is created/modified by this step — this document. No application code, domain code, routes, styles, configuration, tests, dependencies, or other documentation were modified. No commit/push.
**Tagging:** Every material claim is tagged `[FACT]` (verified in source), `[REC]` (recommendation), `[ASSUMPTION]` (inferred), or `[RISK]`. Decisions locked in §24 are marked `[LOCK]` where they thread into earlier sections.

**Section map (24 discrete top-level sections):** 1 Repository Verification · 2 Existing Decision-Domain Audit · 3 Current Mutation & Read-Path Audit · 4 Complete Decision-State Taxonomy · 5 Outcome Matrix · 6 Applicability Matrix · 7 Divergence Matrix · 8 Recorded Decision Plate Specification · 9 Decision-Creation Flow · 10 Reaffirmation Flow · 11 Supersede Flow · 12 Withdrawal Flow · 13 Accepted-Risk Flow · 14 Inspector & History Specification · 15 Evidence Spine & Queue Projections · 16 Visual Hierarchy · 17 Truthfulness Rules · 18 Edge and Error States · 19 Accessibility Contract · 20 Proposed Component and State Model · 21 Exact Implementation Boundaries for R0B.2B · 22 Acceptance Criteria · 23 Risks and Unresolved Questions · 24 Approved Decision Lock.

---

## 1. Repository Verification

- `[FACT]` Repository root: `we-are-building-the-first-static` (Next.js app-router project).
- `[FACT]` Branch at audit time: **`r0b2-recorded-human-decision-design`** — matches the required branch.
- `[FACT]` Working tree was **dirty** at audit: 84 tracked paths modified (`git status --porcelain` count = 84), including `app/report/page.tsx`, `app/review-operations/page.tsx`, and all four `app/visual-lab/workspace-v2/*` files. No untracked additions were introduced by the audit.
- `[FACT]` `.git/index.lock` present and non-removable from this environment (`unable to unlink … Operation not permitted`); blocks git writes, consistent with the read-only mandate; does not affect analysis.
- `[FACT]` HEAD commit: `8e8fe0a Merge Workspace V2 integration plan`.
- `[FACT]` Required inputs all exist and were read:
  - `app/visual-lab/workspace-v2/` — `WorkspaceV2Client.tsx` (~1,016 lines), `fixtures.ts` (~29 KB), `page.tsx`, `workspace-v2.module.css` (~29 KB).
  - `docs/design/r1a-production-workspace-integration-map.md` (~43 KB).
  - `lib/human-decision-ledger.ts` (~26 KB, 568 lines), `lib/decision-history.ts` (183 lines).
  - Decision UI + mutation path: `app/report/page.tsx` (4,220 lines).
  - Consumers: `app/review-operations/page.tsx` (609 lines), `lib/verification-pack.ts`, `lib/team-workspace.ts`.
  - Applicability sources: `lib/contract-recheck.ts`, `lib/merge-contract.ts`, `lib/readiness-delta.ts`, `lib/canonical-review-run.ts`.
- `[RISK]` Because the working tree was uncommitted at audit, line references are against on-disk state, not a committed SHA. R0B.2B must re-verify against the branch tip it builds on.

---

## 2. Existing Decision-Domain Audit — `lib/human-decision-ledger.ts`

### 2.1 Constants and persistence `[FACT]`
- Schema version `1.0` for both ledger and entry (`HUMAN_DECISION_LEDGER_SCHEMA_VERSION`, `..._ENTRY_SCHEMA_VERSION`).
- Storage key: `lintel.humanDecisionLedger.v1`. One JSON object keyed by per-report key (`reviewStateKeyForReport(report)`), each value a ledger.
- Entry cap: `HUMAN_DECISION_LEDGER_ENTRY_LIMIT = 80`; entries are sorted by `recordedAt` and truncated to the last 80 on normalize.

### 2.2 Entry schema `[FACT]` (`HumanDecisionLedgerEntry`)
`entryId`, `schemaVersion`, `ledgerId`, `eventType`, `outcome?`, `actor`, `reason?`, `repository`, `pullRequestNumber?`, `applicableHeadSha?`, `canonicalRunId?`, `reportId?`, `verificationPackId?`, `mergeContractId?`, `contractRecheckId?`, `referencedClauseIds[]`, `referencedAssumptionIds[]`, `referencedEvidenceIds[]`, `acceptedRiskReferences[]`, `supersedesEntryId?`, `reaffirmsEntryId?`, `withdrawsEntryId?`, `recordedAt`, `source`, `fingerprint`.

### 2.3 Actor `[FACT]` (`HumanDecisionActor`)
`displayLabel`, `source: "local" | "github" | "imported" | "unknown"`, `workspaceId?`, `memberId?`, `externalId?`, `role?`. `defaultActor()` coerces unknown sources to `local` and defaults `displayLabel` to `"Local reviewer"`; `parseActor()` on read defaults to `"Unknown actor"` / `source: "unknown"`.

### 2.4 Event types `[FACT]` (`HumanDecisionEventType`)
`decision-recorded`, `decision-reaffirmed`, `decision-superseded`, `decision-withdrawn`, `risk-accepted`, `risk-acceptance-revoked`, `note-recorded`.

### 2.5 Outcomes `[FACT]` (`HumanDecisionOutcome`)
`approve`, `approve-with-accepted-risk`, `request-changes`, `tests-required`, `review-required`, `blocked`, `defer`.
- `[LOCK]` (§24.3–24.4) **All seven outcomes are first-class** and semantically distinct; see §5 for the normative meaning of each.

### 2.6 Applicability `[FACT]` (`HumanDecisionApplicability` — the type)
`applicable`, `predates-current-head`, `partially-applicable`, `superseded`, `withdrawn`, `unavailable`.
- `[FACT]` `projectHumanDecisionLedger()` returns only `unavailable | withdrawn | predates-current-head | applicable`. Superseded entries are removed from the effective set (surfaced per-entry, not as a top-level applicability), and there is no partial-applicability computation anywhere.
- `[LOCK]` (§24.5–24.7) The **live top-level applicability states for R0B.2B are exactly**: `applicable`, `predates-current-head`, `withdrawn`, `unavailable`. `partially-applicable` is **deferred** and must not be rendered or claimed. `superseded` is a **historical lineage state**, not a current top-level applicability state. See §6.

### 2.7 Divergence `[FACT]` (`RecommendationDivergence`)
`aligned`, `human-more-conservative`, `human-accepted-additional-risk`, `materially-different`, `unavailable`.
- `[FACT]` Two divergence functions exist:
  - `recommendationDivergence(ledger, entry)` — a **stub**: returns `human-accepted-additional-risk` for accepted-risk outcomes, otherwise `unavailable` (discards a `recommendation` variable via `void`). This is the one `projectHumanDecisionLedger()` calls.
  - `recommendationDivergenceForReport(report, entry)` — the **real** comparator: ranks `report.verdict.recommendation` against the human outcome and returns `aligned` / `human-more-conservative` / `materially-different`.
- `[LOCK]` (§24.15) Visible divergence **must** be computed with the current `Report` via `recommendationDivergenceForReport`. When no `Report` is available, the divergence treatment is **omitted** (never rendered as a meaningful "unavailable"). See §7.

### 2.8 Lineage `[FACT]`
`supersedesEntryId` / `reaffirmsEntryId` / `withdrawsEntryId` link entries. `projectHumanDecisionLedger()` builds `superseded`, `withdrawn`, `revokedRisks` sets by scanning entries in `recordedAt` order; the effective decision is the **last** non-superseded, non-withdrawn decision/reaffirm/supersede/risk-accepted entry.

### 2.9 Fingerprint generation `[FACT]`
- `entryFingerprintBase()` selects a canonical subset of fields; `stableFingerprint({...base, idempotencyKey})` produces the fingerprint; `entryId = "hde_" + fingerprint.slice(0,14)`.
- Ledger fingerprint = `stableFingerprint` over ledger metadata + the **list of entry fingerprints** (a Merkle-style roll-up, not a signature).
- `[FACT]` `stableFingerprint` (in `canonical-review-run.ts`) is a deterministic content hash over stable-serialized JSON — consistent with the locked principle **"fingerprint-attested, not cryptographically signed."** No private key, no signature, no identity attestation.
- `[LOCK]` (§24.11) The deduplication identity must be **deterministic**: `Date.now()` or any fresh timestamp must not participate in idempotency.

### 2.10 Read / persistence functions `[FACT]`
- `readHumanDecisionLedger(storage, key, context, reviewState?)` — parses stored ledger; if absent, **synthesizes** a legacy ledger from `ReportReviewState` via `historicalLedgerFromReviewState()` (source `"legacy"`, actor from `state.owner`).
- `writeHumanDecisionLedger`, `appendHumanDecisionLedgerEntryToStorage`.
- `readAllLedgers` swallows JSON parse errors and returns `{}` (fail-safe read).
- `[FACT]` Append dedup: if an entry's fingerprint or entryId already exists, the ledger is returned unchanged (normalized). This is the only idempotency guard.
- `[LOCK]` (§24.13–24.14) A malformed/unreadable ledger must be surfaced as **`unavailable`** (state I), never silently degraded into the empty **"No engineer decision recorded"** (state A). The read layer must distinguish parse/projection failure from a genuinely empty ledger.

---

## 3. Current Mutation & Read-Path Audit

### 3.1 Write path — `app/report/page.tsx` "Decision Studio" `[FACT]`
- State: `studioDecision: StudioHumanDecision` (`"Ready to merge" | "Tests required" | "Review required" | "Blocked" | "Approved with accepted risk"`), `acceptedRiskReason: string`, `decisionStudioExpanded`, `studioDecisionState: CopyState`.
- `[FACT]` Decision Studio currently exposes **five** labels; two ledger outcomes (`request-changes`, `defer`) have **no Studio entry point**. `[LOCK]` (§24.3) R0B.2B must make all seven outcomes selectable.
- `saveStudioDecision()`:
  1. Validates: if outcome requires a reason (`studioDecisionReasonRequired`, i.e. accepted-risk) and `acceptedRiskReason` is empty → `failed`, aborts. `[LOCK]` (§24.1) R0B.2B extends this so **every** recorded outcome requires a non-whitespace rationale.
  2. Computes `outcome = humanDecisionOutcomeFromStudio(studioDecision)`.
  3. Derives event type: `risk-accepted` if accepted-risk; else `decision-reaffirmed` if `previousEntry.outcome === outcome && applicability === "predates-current-head"`; else `decision-superseded` if a previous entry exists with a different outcome; else `decision-recorded`.
  4. Collects `openBlockingClauseIds` (max 8) and `openAssumptionIds` (max 8) — **only referenced when accepted-risk**.
  5. `updateReviewState(studioReviewState)` — writes the coarse review status first.
  6. `appendLedgerEntry({...})` with `idempotencyKey: "studio:{outcome}:{headSha|local}:{Date.now()}"`.
  7. Mirrors a human-readable event into `decision-history` via `recordDecisionEvent()`.
- `appendLedgerEntry()` derives actor: `displayLabel` from `actorMember?.displayName` or `reviewState.owner` (unless `"Unassigned"`/`"Suggested:"`) else `"Local engineer"`; `source: "local"`; `workspaceId`, `memberId`, `role` when available. Try/catch: on storage failure falls back to in-memory `appendHumanDecisionLedgerEntry` (session-only).
- `withdrawCurrentHumanDecision()`: gated by **`window.confirm(...)`**; appends `decision-withdrawn` with `withdrawsEntryId = current.entryId`; original entry preserved; reason hard-coded.
- `revokeAcceptedRisk(entry)`: gated by `window.confirm(...)`; appends `risk-acceptance-revoked` with `withdrawsEntryId` + `acceptedRiskReferences`.
- Head/commit binding `[FACT]`: `applicableHeadSha = context.currentHeadSha ?? canonicalRun.headSha`; `context.currentHeadSha = canonicalRun?.headSha ?? readinessDelta?.currentHeadSha`. Demo path uses `historicalCanonicalRunManifest(demoReport, "demo")`.

### 3.2 Key mutation risks `[RISK]` / locked resolutions
- **Idempotency is defeated.** `idempotencyKey` embeds `Date.now()`, so the fingerprint is unique on every click → duplicate ledger entries on double-submit. `[LOCK]` (§24.9–24.11) The dedup identity must be deterministic and exclude fresh timestamps; a fully identical submission (§24.9) is a **no-op**.
- **`window.confirm` for destructive actions.** `[LOCK]` (§24.17) Replaced by an accessible, focus-managed in-product confirmation surface.
- **Reaffirmation vs supersession heuristic is order/outcome-only.** `[LOCK]` (§24.9–24.10) A same-outcome/same-head submission with **materially changed** rationale or references **supersedes** (retaining lineage); a fully identical one is a no-op.
- **Divergence not persisted.** `[LOCK]` (§24.15) Recompute against the live `Report`; omit when absent.
- **Two parallel logs.** `human-decision-ledger.v1` (authoritative) and `decision-history.v1` (human-readable activity, cap 60) are written together but independently and can drift on partial failure. `[RISK]` retained; R0B.2B keeps them consistent by writing the ledger first and treating the history log as derived.

### 3.3 Read path — `app/report/page.tsx` `[FACT]`
- `humanDecisionProjection = projectHumanDecisionLedger(ledger, currentHeadSha)`.
- `HumanDecisionLedgerRow` renders a `<details>` per entry: event type, outcome, time, actor, commit (`shortSha`), applicability as **binary** string `"applies to current commit" | "predates current commit"`, reason, references (via `fingerprintPrefix`), lineage lines. Last 10 entries, reversed.

### 3.4 Read path — `app/review-operations/page.tsx` `[FACT]`
- Reads the ledger per report (`readHumanDecisionLedger`) and projects it (`projectHumanDecisionLedger(ledger, context.currentHeadSha)`).
- `humanEventTitle()` maps all seven event types to sentence-case titles; `formatTimestamp()` returns `"Timestamp unavailable"` on unparseable dates; `shortIdentifier()` truncates long ids.
- Aggregates `humanDecisions[]` and `latestHumanDecision` per operational record.

### 3.5 Other consumers `[FACT]`
- `lib/verification-pack.ts` — projects the ledger against `run.headSha` for the verification pack.
- `lib/team-workspace.ts` — treats `human-decision-ledger` as one provenance source among several.

### 3.6 Contract & commit applicability sources `[FACT]`
- `lib/contract-recheck.ts` defines its **own** `HumanDecisionApplicability` (`applicable | predates-current-head | partially-applicable | unavailable`) and `humanDecisionApplicability(previousHeadSha, currentHeadSha)`: returns `unavailable` when no SHA, `predates-current-head` when previous ≠ current, else `applicable`. `partially-applicable` is declared but **not produced** here either.
- `classifyRecheck()` treats `human === "predates-current-head"` as a negative signal; recheck copy includes "Previous human decision predates current head."
- `lib/canonical-review-run.ts` — `headSha` on the manifest, `stableFingerprint`, `fingerprintPrefix(value)` (short display form), `historicalCanonicalRunManifest`.
- `lib/merge-contract.ts`, `lib/readiness-delta.ts` — carry `headSha` and stale detection for clauses/assumptions (`status === "stale"` when `override.headSha !== currentHeadSha`).
- `[LOCK]` (§24.12) R0B.2B reconciles the two `HumanDecisionApplicability` definitions into **one canonical type**, without changing the persisted schema and without pretending `partially-applicable` is implemented.

### 3.7 Accessibility / confirmation / destructive behaviour today `[FACT]`
- Decision Studio uses a disclosure (`decisionStudioExpanded`) and a save button with a transient `copied`/`failed` state.
- Destructive actions use `window.confirm` (see §3.2). `[LOCK]` (§24.17) replaced.
- The report page has a decision sheet (`decisionSheetOpen`, `closeDecisionSheet({restoreFocus})`) with focus-restore plumbing and a `SHELL_NAVIGATION_OPEN_EVENT` close hook — a reusable pattern for the Plate's modal flows.

### 3.8 Workspace V2 Decision Plate today `[FACT]`
- `WorkspaceV2Client.tsx` renders the Plate as **Row 3 footer**, `id="wsv2-decision-plate"`, stage 5 terminal.
- Content: label "5 · Human decision"; headline **"No engineer decision recorded"**; detail "Lintel recommends `{RECOMMENDATION}` · `{openBlockingRequirements}` blocking requirement(s) open"; a "Show concept / Hide concept" toggle revealing a **non-functional** concept panel badged "Visual-lab concept — not functional".
- Data source: `fixtures.ts` `UnsignedDecisionView = { recorded: false; recommendation; openBlockingRequirements }`. **No recorded-decision fields, no mutation, no persistence** — R0B.1 scope.
- `[FACT]` R1A locks: Workspace V2 = convergence of `/workspace` + `/report`; the Plate's real data + mutation live in `/report`; the recorded path is deferred to R0B.2 / migration Stage 5; **RISK-B: never present an unsigned concept as a recorded decision, or vice-versa**; persistence must flow through a `useWorkspaceData()` adapter, never a direct `localStorage` import into the V2 surface.

---

## 4. Complete Decision-State Taxonomy

Three orthogonal axes, never collapsed into one "decision recorded" label: **applicability** (§6) × **lineage event** × **divergence** (§7). "Editable" = whether the Plate offers record/change actions; "Rationale required" / "Risk ack required" describe the creation gate. Outcome semantics are normative in §5.

| # | State | Canonical meaning | Source fields | Headline | Support copy | Tone | Primary action | Secondary | Editable | Rationale req. | Risk ack req. | Refs shown |
|---|-------|-------------------|---------------|----------|--------------|------|----------------|-----------|----------|----------------|---------------|------------|
| A | No decision recorded | No effective decision entry exists (ledger readable & empty) | `latestEffectiveEntry == null`, `applicability = "unavailable"`, **read succeeded** | "No engineer decision recorded" | "Lintel recommends X · N blocking open" | neutral | Record decision | Show reasoning | Yes | Yes `[LOCK]` | If risk | No |
| B | Current applicable decision | Effective entry binds to current head | `applicability = "applicable"`, entry present | "{Outcome} · {Actor}" | "Applies to current head {sha7}" | outcome-coloured | Change decision | View detail | Yes | Yes (on change) | — | Yes |
| C | Decision predates current head | Effective entry's head ≠ current | `applicability = "predates-current-head"`, `reaffirmationRequired = true` | "{Outcome} — needs reaffirmation" | "Recorded at {sha7}; head is now {sha7}" | caution | Reaffirm | Supersede / View | Yes | Yes (reaffirm reuses prior) | — | Yes |
| D | Partially applicable | **DEFERRED — not rendered in R0B.2B** | not computable from current projection | — | — | — | — | — | — | — | — |
| E | Reaffirmation required | Predates head AND not yet reaffirmed | `reaffirmationRequired = true` | "Reaffirmation required" | "Nothing has been reaffirmed against {sha7}" | caution | Reaffirm | Supersede | Yes | Yes | — | Yes |
| F | Decision reaffirmed | A `decision-reaffirmed` entry is effective | effective `eventType = "decision-reaffirmed"`, `reaffirmsEntryId` set, `applicability = "applicable"` | "{Outcome} · reaffirmed" | "Reaffirmed at {sha7} by {Actor}" | outcome-coloured | Change decision | View lineage | Yes | Yes (on change) | — | Yes |
| G | Decision superseded | **Historical lineage state, not a top-level applicability** | entryId ∈ `supersededEntryIds` | shown in history only | "Superseded by {entry7} on {date}" | muted | — | View successor | No | — | — | Yes |
| H | Decision withdrawn | Effective decision withdrawn | `applicability = "withdrawn"`, entryId ∈ `withdrawnEntryIds` | "Decision withdrawn" | "Withdrawn by {Actor} on {date}; history retained" | caution/muted | Record new decision | View withdrawn | Yes | Yes (on new record) | — | Yes |
| I | Decision unavailable | Ledger unreadable/malformed or projection failed | parse/projection failure — **distinct from A** | "Decision state unavailable" | "The decision record could not be read" | error | Retry / Record new | View raw | Guarded | — | — | No |
| J | Aligned with Lintel | Human outcome matches recommendation | `recommendationDivergenceForReport = "aligned"` | badge "Matches Lintel" on B/F | "Human decision matches the recommendation" | positive-neutral | — | — | — | — | — | — |
| K | More conservative than Lintel | Human stricter than recommendation | `= "human-more-conservative"` | badge "More conservative" | "Engineer chose a stricter outcome than Lintel" | neutral | — | — | — | — | — | — |
| L | Accepted additional risk | Approve-with-accepted-risk | `= "human-accepted-additional-risk"`, `outcome = "approve-with-accepted-risk"` | badge "Accepted risk" | "Engineer accepted N referenced risks Lintel flagged" | caution | View accepted risks | Revoke risk | Yes | Yes | Yes `[LOCK]` | Yes |
| M | Materially different | Outcome diverges, not simply stricter | `= "materially-different"` | badge "Differs from Lintel" | "Human outcome differs materially from the recommendation" | caution | View reasoning | — | — | — | — | Yes |

- `[FACT]` States A, B, C, F, H, I are directly projectable. J/K/L/M require the `Report` (§2.7, §7).
- `[LOCK]` (§24.5) **State D (partial) is deferred** and must not be rendered or claimed in R0B.2B. It may only be introduced once production adapters can derive it truthfully from real decision references and current contract/evidence state.
- `[LOCK]` (§24.6) **State G (superseded)** is a **lineage** state shown in history, never a top-level applicability.
- `[LOCK]` (§24.13) **A and I are different states.** The view-model must distinguish an absent effective decision (read succeeded, empty) from malformed/unreadable/projection-failed data.
- `[REC]` The three axes render one value each; never collapse them.

---

## 5. Outcome Matrix

`[LOCK]` (§24.3–24.4) All seven outcomes are first-class and semantically distinct. This section is the normative meaning referenced by §2.5 and §3.1.

| Outcome | Studio label (R0B.2B) | Review status | Normative meaning | Recommendation match |
|---|---|---|---|---|
| `approve` | Ready to merge | Ready to merge | Engineer approves merge. | APPROVE |
| `approve-with-accepted-risk` | Approved with accepted risk | Ready to merge | Approve **and** the engineer (not Lintel) explicitly accepts named residual risks. | never "aligned" |
| `tests-required` | Tests required | Tests requested | **Test evidence is missing.** | TESTS_REQUIRED |
| `review-required` | Review required | Review required | **Further specialist / accountable-human review is required.** | REVIEW_REQUIRED |
| `request-changes` | Request changes | (maps to Review required) | **Implementation changes are required.** | REVIEW_REQUIRED (alias) |
| `blocked` | Blocked | Blocked | **Stop:** a critical unresolved issue prevents progress. | BLOCK |
| `defer` | Defer decision | (no auto-approve) | **The engineer cannot responsibly decide yet — this is not approval.** | ranked as REVIEW |

- `[LOCK]` `tests-required`, `review-required`, `request-changes`, `blocked`, and `defer` are semantically distinct per the meanings above and must not be conflated in copy, mapping, or divergence ranking. `defer` in particular must never read as an approval.
- `[LOCK]` (§24.2) `approve-with-accepted-risk` additionally requires explicit risk references and an unselected engineer-accepts acknowledgement (see §13).

---

## 6. Applicability Matrix

`[LOCK]` (§24.7) The live top-level applicability states for R0B.2B are exactly the four rows below. `partially-applicable` (state D) and top-level `superseded` (state G) are excluded per §24.5–24.6.

| Applicability | Projection condition | UI treatment | Reaffirmation |
|---|---|---|---|
| `applicable` | effective entry, head matches (or either head unknown) | resting recorded plate | no |
| `predates-current-head` | effective entry head ≠ current head | caution banner + Reaffirm | yes |
| `withdrawn` | effective entry ∈ withdrawn set | withdrawn state, record-new CTA | via new decision |
| `unavailable` | no effective entry **or** read/projection failure — disambiguated in the view-model as A vs I (§24.13) | empty plate (A) OR error plate (I) | n/a |
| `partially-applicable` | **deferred — not emitted, not rendered** | — | — |
| `superseded` | **lineage only — never top-level** | history | — |

---

## 7. Divergence Matrix

`[FACT]` / `[LOCK]` (§24.15) Visible divergence is computed with the current `Report` using `recommendationDivergenceForReport`; when no `Report` is available the divergence treatment is omitted entirely (never rendered as "unavailable").

| Divergence | Source | When computable |
|---|---|---|
| `aligned` | `recommendationDivergenceForReport` exact match table | needs `Report` |
| `human-more-conservative` | human rank > recommendation rank | needs `Report` |
| `human-accepted-additional-risk` | outcome = accepted-risk | ledger-only (both functions) |
| `materially-different` | diverges, not stricter | needs `Report` |
| (omitted) | no `Report` available | divergence treatment omitted entirely |

---

## 8. Recorded Decision Plate Specification

`[REC]` The Plate is a **terminal act**, not a permanent form. Four shapes: **resting** (recorded), **empty** (state A), **error** (state I), and **transient creation/confirmation** (see §9–§13). It must remain concise enough to coexist with the full four-plane Workspace at 1440×900 and legible at 50% screenshot scale.

### 8.1 Resting recorded state (states B/C/F/H) `[REC]`
Single-row footer (retain `id="wsv2-decision-plate"`), in reading order:
1. Stage marker "5 · Human decision".
2. **Outcome** — dominant token, outcome-coloured (semantic colour restrained to this token + applicability/divergence chip; final calibration owned by R1C, §16).
3. **Actor + source** — `{displayLabel}` and, only when truthful, a source qualifier (`local` plain; `github`/`imported` labelled; `unknown` → "Unknown actor").
4. **Recorded time** — absolute + relative; "Timestamp unavailable" if unparseable.
5. **Applicable head** — `{sha7}` via `fingerprintPrefix`; if head unknown, "Head not recorded" (no implied match).
6. **Fingerprint-attestation cue** — mono `fp:{prefix}` chip, tooltip "Content fingerprint — attested, not cryptographically signed." Never a lock/"signed" icon.
7. **Alignment/divergence chip** — J/K/L/M, only when a `Report` is available; otherwise omitted (§7).
8. **Applicability chip** — B/C/H wording per §6.
9. **Rationale summary** — first ~140 chars of `reason`, expandable; legacy/imported without a rationale show "No rationale recorded" `[LOCK]` (§24.1).
10. **Reference chips** — counts for clause/assumption/evidence references; expand to Inspector (§14).
11. **Primary action** — "Change decision" (B/F), "Reaffirm" (C/E), "Record decision" (A/H).

### 8.2 Expansion behaviour `[REC]`
- Inline: rationale full text, reference chip list. Nothing that writes state.
- Inspector (Decision Context mode, §14): lineage, fingerprint detail, commit binding, latest five events.
- Modal / separate surface: full history beyond the inline limit; creation, reaffirm, supersede, withdraw flows (§9–§13).
- `[REC]` Hard rule: resting height ≤ 2 logical rows; everything else is a projection elsewhere.

---

## 9. Decision-Creation Flow

`[REC]` / `[LOCK]` State A → B. Order: (1) select **outcome** from all seven (§5); (2) enter **rationale** — `[LOCK]` (§24.1) **required, non-whitespace, for every outcome**; (3) if accepted-risk, route to the accepted-risk gate (§13); (4) show **referenced requirements/evidence** carried; (5) **confirm head SHA** binding (display `{sha7}`; if unknown, require explicit "record without head binding" acknowledgement); (6) **open-requirement awareness** — surface the count of blocking requirements still open and require acknowledgement when recording an approve over open blockers; (7) **final confirm**; cancel restores prior focus. Keyboard: full tab order, Enter confirms only on the confirm control, Escape cancels with focus restoration (§19).

---

## 10. Reaffirmation Flow

`[REC]` / `[LOCK]` States C/E → F. Show: what changed since the recorded head (head delta, invalidated vs surviving references), what remains applicable, what must be re-evaluated. Rationale is **required** (`[LOCK]` §24.1) and may be **reused** from the prior entry (prefilled, editable). Creates a `decision-reaffirmed` entry with `reaffirmsEntryId` → prior effective entry; binds `applicableHeadSha` to current head. `[FACT]` The existing heuristic reaffirms only when the outcome is unchanged; a changed outcome routes to supersede (§11).

---

## 11. Supersede Flow

`[REC]` / `[LOCK]` New effective decision; prior entry → state G (lineage). New decision carries a **required reason for replacement** (`[LOCK]` §24.1); sets `supersedesEntryId`; the prior entry is retained and shown as superseded in history (§14). `[LOCK]` (§24.10) A same-outcome/same-head submission whose rationale or references materially changed **supersedes** (retaining lineage); (§24.9) a fully identical submission is a **no-op**. Supersede is distinct from reaffirm: supersede changes the outcome or materially the rationale/references.

---

## 12. Withdrawal Flow

`[REC]` / `[LOCK]` → State H. Warning language: "Withdrawing removes this decision as the effective decision. History is retained; this cannot un-record the original." Requires an **entered reason** (`[LOCK]` §24.1 — the current path hard-codes a generic reason; R0B.2B must collect one). Result: `applicability = "withdrawn"`, Plate returns to the record-new CTA. `[LOCK]` (§24.17) Destructive safeguard: an **accessible, focus-managed in-product confirmation** surface (not `window.confirm`); Escape cancels with focus restoration (§19).

---

## 13. Accepted-Risk Flow

`[REC]` / `[LOCK]` (§24.2) → State L. Requires: explicit **risk references** (blocking clauses/assumptions still open), a **required rationale**, and an **unselected acknowledgement** whose copy states the engineer — not Lintel — accepts the risk. No pre-selected acceptance. Copy must never imply Lintel approved the risk ("Engineer accepted the following risks Lintel flagged"). Revocation (`risk-acceptance-revoked`) mirrors the withdrawal safeguards (§12, §24.17).

---

## 14. Inspector & History Specification

`[REC]` Add a **Decision Context** inspector mode (peer to Finding/Evidence/Requirement/Case-Context modes in `WorkspaceV2Client`). It shows: latest decision summary, applicability (§6), divergence (only when a `Report` is present, §7), rationale (full), references (resolvable → linked; unresolvable → "Reference no longer available"), lineage (reaffirms/supersedes/withdraws), fingerprint (full + prefix), commit binding, and `[LOCK]` (§24.8) the **latest five** history events inline. Older events open in a **dedicated full-history surface/modal** (all up to 80), not the Inspector. Terminology fixed: **recorded / reaffirmed / superseded / withdrawn** (never "signed", "approved by Lintel", "confirmed"). Navigation: Plate → "View decision context" focuses the Inspector mode; Escape clears `focusedArtifact` and restores focus to the triggering Plate control (mirror the existing `Esc` clear + `closeDecisionSheet({restoreFocus})` pattern, §19). `[REC]` No invented approval chains, collaboration, or org-policy enforcement.

---

## 15. Evidence Spine & Queue Projections

- `[REC]` **Evidence Spine stage 5** ("Human decision", `terminal: true`): replace the fixed "not recorded" label with the projected state — A→"not recorded", I→"unavailable", B/F→outcome, C/E→"needs reaffirmation", H→"withdrawn". Stage 5's count becomes 0/1 effective.
- `[REC]` **Queue**: add a compact decision marker only when a decision exists (outcome glyph + stale dot for C/E). `[RISK]` Never show an unsigned/absent decision as anything other than absent (RISK-B). One glyph only — the Queue is not an activity feed.
- `[FACT]` Footer counters ("2 blocking · 2 confirmed · 1 stale · Decision not recorded") already summarize; wire "Decision not recorded" to the projected applicability, distinguishing A from I.

---

## 16. Visual Hierarchy

`[REC]` Within the approved Workspace V2 system, reuse existing `.plate` / `.plateCurrent` / `.plateMain` / `.plateState` / `.plateHeadline` / `.plateDetail` / `.plateRec` / `.plateAction` classes and the `--wsv2-plate` surface token. Hierarchy, strongest → quietest: **outcome token** → **applicability chip** → **actor/time** → **rationale summary** → **reference chips** → **fingerprint chip** → **actions**. Divergence is a single restrained chip. `[FACT]` Geist Sans for prose, Geist Mono for SHAs, entry ids, and the fingerprint chip. `[REC]` No gradients/glow/glass; restrained borders; semantic colour limited to the outcome token + applicability/divergence chips; the Plate terminates stage 5 of the Spine via the existing `plateCurrent::before` connector. The system must stay readable at 50% screenshot scale and calm during normal use. `[LOCK]` (§24.18) Final palette calibration is **owned by R1C** — this milestone defines hierarchy and semantics only, not final colour values.

---

## 17. Truthfulness Rules

`[REC]` For every unknown/unavailable field the UI degrades honestly:
1. **Recommendation vs Human Decision** — always distinct; "Lintel recommends" vs "Engineer decided". Never merge.
2. **Actor unknown** — "Unknown actor"; never invent a name. `source: "unknown"` shown as such.
3. **Timestamp unavailable** — literal "Timestamp unavailable" (matches `review-operations`).
4. **Missing rationale** — "No rationale recorded"; never fabricate. `[LOCK]` (§24.1) Since new records require a rationale, this appears only for legacy/imported entries.
5. **Stale / predates head** — explicit "predates current head", show both SHAs; never present as current.
6. **Partially applicable** — `[LOCK]` (§24.5) not computed, not claimed.
7. **Accepted risk** — name the referenced risks; `[LOCK]` (§24.2) never imply Lintel approved them.
8. **Model-assisted evidence** — carry the "model assisted" marker from the observation into any referenced evidence chip; a decision resting on model-assisted evidence must surface that.
9. **Unresolvable references** — "Reference no longer available"; never silently drop.
10. **Superseded / withdrawn** — shown in history with lineage; never deleted, never shown as effective.
11. **Fingerprint** — always "attested, not cryptographically signed"; no lock/"verified" iconography.
12. **Demo / sample decisions** — badged "Sample" (fixtures/`source: "demo"`); never counted as a real engineer decision.
13. **Imported decisions** — `source: "imported"`/`"legacy"` labelled; actor/time shown as recorded or "Unknown".
14. **No decision recorded vs unavailable** — `[LOCK]` (§24.13–24.14) A ("No engineer decision recorded") is a genuinely empty, readable ledger; I ("Decision state unavailable") is read/projection failure. A malformed ledger must **never** silently render as A.
15. **Divergence** — `[LOCK]` (§24.15) computed with the current `Report`; omitted when no `Report` (§7).
16. **Session-only persistence** — `[LOCK]` (§24.16) after a write failure, the session-only fallback must be **visibly disclosed** ("Saved for this session only — not persisted").

---

## 18. Edge and Error States

`[REC]` messaging + recovery, without inventing server guarantees:
- **Ledger unavailable/malformed** → state I "Decision state unavailable" + retry; `[LOCK]` (§24.14) never silently blanks to A.
- **localStorage write failure** → in-memory fallback (existing try/catch) **and** `[LOCK]` (§24.16) a visible "Saved for this session only — not persisted" disclosure.
- **Duplicate submission** → `[LOCK]` (§24.9, §24.11) deterministic identity; a fully identical submission is a no-op; confirm control disabled while pending.
- **Head changes during creation** → re-read head at confirm; if changed, warn and require re-confirmation of binding.
- **Referenced requirement disappears** → "Reference no longer available"; decision remains valid, flagged.
- **Referenced evidence goes stale** → badge the reference stale (partial-applicability remains deferred, §24.5).
- **Decision saved but projection fails** → keep the ledger write; show state I "Recorded — display unavailable", never a lost decision.
- **Actor identity incomplete** → "Unknown actor" / omit role.
- **Imported legacy entry** → §17.13.
- **No recommendation** → decision shown without a divergence chip (§24.15).
- **No head SHA** → "Head not recorded"; disable stale detection; require explicit acknowledgement to record without a head binding.
- **History exceeds inline limit (>5 / cap 80)** → "View full history"; oldest beyond 80 truncated by `normalizeLedger` (`[FACT]`) — disclose truncation.
- **Concurrent-tab changes** → `[RISK]` `localStorage` shared; a `storage` event listener re-projects; on conflicting append, last-write-wins per key. Disclose "Updated in another tab — reload."
- **Unknown fields generally** → degrade to the exact truthfulness copy in §17.

---

## 19. Accessibility Contract

`[REC]`
- **Tab order**: outcome select → rationale → risk refs (if any) → head-binding confirm → references → primary confirm → cancel.
- **Focus entry/restoration**: opening creation/history moves focus to the first control; Escape/cancel restores to the triggering Plate control (reuse `closeDecisionSheet({restoreFocus})`).
- **Keyboard selection**: roving model consistent with the existing Spine tablist; Enter confirms only on the confirm control.
- **Confirmation**: `[LOCK]` (§24.17) destructive actions use a focus-trapped in-product dialog (no `window.confirm`); explicit confirm control; Escape cancels.
- **Screen reader**: outcome, actor, applicability, and divergence announced together as the decision's accessible name; state changes via a polite `aria-live` region ("Decision recorded", "Decision reaffirmed against {sha7}", "Decision withdrawn").
- **Live region**: one polite region for record/reaffirm/supersede/withdraw; assertive only for errors.
- **Reduced motion**: honor `prefers-reduced-motion`; no essential meaning in motion alone.
- **Target sizes**: ≥ 24×24 CSS px (prefer 44 for primary/destructive).
- **Disabled vs unavailable**: disabled (e.g. confirm during pending) is `aria-disabled` with reason; unavailable (state I) is distinct copy, not a greyed control.
- **Error association**: rationale/required errors via `aria-describedby`, not colour alone.
- **No colour-only communication**: every semantic state carries text/icon + colour.

---

## 20. Proposed Component and State Model

`[REC]`

```
DecisionPlate (presentational)          ← props: DecisionPlateViewModel
├── DecisionOutcomeToken
├── DecisionApplicabilityChip
├── DecisionDivergenceChip              (render only when a Report is present)
├── DecisionActorProvenance
├── DecisionFingerprintChip
├── DecisionReferenceChips
├── DecisionRationaleSummary
└── DecisionActions                     (Record | Change | Reaffirm | Withdraw)

DecisionCreationDialog (transient)      ← outcome (7), rationale (required), riskRefs+ack, headBinding, confirm
DecisionReaffirmDialog
DecisionSupersedeDialog
DecisionWithdrawDialog (destructive, focus-trapped, in-product)
DecisionContextInspector               (new inspector mode; latest 5 events)
DecisionHistorySurface                 (full history modal, up to 80)

useDecisionPlate() (adapter)           ← wraps lib/human-decision-ledger via useWorkspaceData()
   view = projectHumanDecisionLedger(ledger, currentHeadSha)
   divergence = report ? recommendationDivergenceForReport(report, view.latestEffectiveEntry) : omitted
   returns DecisionPlateViewModel + typed mutators (record/reaffirm/supersede/withdraw/acceptRisk/revokeRisk)
```

- `[REC]` One UI-state owner (R1A §16.11); the V2 surface stays presentational and receives a `DecisionPlateViewModel`. All `localStorage` I/O is confined to `useWorkspaceData()` — the V2 component must not import `human-decision-ledger` directly.
- `[LOCK]` (§24.13) `DecisionPlateViewModel` distinguishes **absent** (A) from **unavailable/error** (I): `{ status: "recorded" | "empty" | "error", state: A..M axes, outcome?, actor?, recordedAt?, applicableHeadSha?, applicability, divergence?, fingerprint?, references, rationale?, lineage, isSample, isSessionOnly, readError? }`.

---

## 21. Exact Implementation Boundaries for R0B.2B

`[REC]` / `[LOCK]` (§24.18) R0B.2B **may**:
- Add the presentational `DecisionPlate*` components and `DecisionContextInspector` mode inside `app/visual-lab/workspace-v2/` (lab first), driven by fixtures extended with a **recorded** decision view-model alongside the existing `UnsignedDecisionView`.
- Add the `useDecisionPlate()` adapter and typed mutators that **reuse existing** `lib/human-decision-ledger.ts` functions and the **existing** storage key/schema (no key rename, no schema bump).
- Expose all seven outcomes (§5); require rationale on every record/reaffirm/supersede/withdraw (§24.1); add the accepted-risk acknowledgement (§13).
- Replace `window.confirm` destructive flows with the accessible in-product dialog (§24.17).
- Make idempotency deterministic (§24.9–24.11): a fully identical submission = no-op; a materially changed one = supersede.
- Reconcile the two `HumanDecisionApplicability` definitions into one canonical type (§24.12) without schema change.
- Disambiguate A vs I (§24.13); disclose session-only fallback (§24.16).

R0B.2B **must not** (`[LOCK]` §24.18):
- Wire the production `/workspace-v2` route or migrate `/report`'s mutation path (R1B / migration Stage 5).
- Change the storage key or schema version.
- Import `localStorage` directly into the V2 surface (R1A §5 boundary).
- Render or claim `partially-applicable` (§24.5); or present `superseded` as a top-level applicability (§24.6).
- Finalize colour values (R1C, §16).
- Introduce signing, identity assurance, approval chains, or policy enforcement.

---

## 22. Acceptance Criteria

`[REC]`
1. Every taxonomy state A–M (with D deferred, G lineage-only) has one defined Plate/Inspector/Queue/Spine treatment; none collapse into a vague "decision recorded."
2. The resting Plate fits ≤ 2 rows and stays legible at 50% scale and 1440×900 with all four planes present.
3. No unsigned/absent decision renders as recorded, and no recorded decision as unsigned (RISK-B passes).
4. State A ("No engineer decision recorded") and state I ("Decision state unavailable") are visibly distinct; a malformed ledger never renders as A.
5. Divergence renders only when a `Report` is available; otherwise the chip is absent.
6. All seven outcomes are selectable and semantically distinct per §5; `defer` never reads as approval.
7. Recording, reaffirming, superseding, and withdrawing each require a non-whitespace rationale; accepted-risk additionally requires explicit references + an unselected engineer-accepts acknowledgement.
8. Idempotency is deterministic: a fully identical submission is a no-op; a materially changed same-outcome/same-head submission supersedes with lineage; rapid double-confirm yields exactly one entry.
9. Destructive actions use an accessible, focus-managed in-product confirmation surface; no `window.confirm`.
10. Session-only persistence fallback is visibly disclosed.
11. The Decision Context Inspector shows the latest five events; older events open a dedicated full-history surface.
12. The two `HumanDecisionApplicability` definitions are reconciled into one canonical type with no persisted-schema change.
13. Adapter is the sole `localStorage` consumer; the V2 surface stays presentational.
14. `/review-operations` and `verification-pack` project lab-recorded decisions identically.
15. Fingerprint is presented as attested, never signed; no lock iconography.
16. Full a11y contract (§19) verified by keyboard-only walkthrough + SR spot check as a release gate.

---

## 23. Risks and Unresolved Questions

**Unresolved questions — resolved by the Approved Decision Lock (§24).** All six original open questions are resolved; genuine technical risks are retained below.

1. **Rationale for all outcomes?** → **Resolved (§24.1):** required for every record/reaffirm/supersede/withdraw; legacy/imported without one show "No rationale recorded."
2. **Expose `request-changes` and `defer`?** → **Resolved (§24.3–24.4):** all seven outcomes are first-class and semantically distinct.
3. **Implement `partially-applicable` now?** → **Resolved (§24.5):** deferred; not rendered or claimed in R0B.2B.
4. **Inline history depth?** → **Resolved (§24.8):** latest five; older in a dedicated full-history surface.
5. **No-op on same-outcome/same-head re-save?** → **Resolved (§24.9–24.11):** identical submission = no-op; materially changed = supersede; deterministic identity without `Date.now()`.
6. **Reconcile the two applicability types?** → **Resolved (§24.12):** one canonical type in R0B.2B, no schema change.

**Retained technical risks** `[RISK]`
- `[RISK]` **R-1** Existing `idempotencyKey` embeds `Date.now()`; R0B.2B must remove it from the dedup identity.
- `[RISK]` **R-2** Head SHA absent in demo/manual paths disables stale detection; guard by requiring explicit acknowledgement to record without a head binding.
- `[RISK]` **R-3** Ledger-only divergence stub returns `unavailable`; the Plate must be fed a `Report`.
- `[RISK]` **R-4** Concurrent-tab writes are last-write-wins with no reconciliation; surface a reload prompt.
- `[RISK]` **R-5** Dual logs (`human-decision-ledger.v1` + `decision-history.v1`) can drift on partial failure; write ledger first, treat history as derived.
- `[RISK]` **R-6** RISK-B (R1A): presenting unsigned as recorded during migration remains the top migration risk; gated to R0B.2B / Stage 5.

---

## 24. Approved Decision Lock

**APPROVED — NORMATIVE FOR R0B.2B**

The following decisions are normative for R0B.2B. Where they conflict with any earlier phrasing in this document, these govern. Each is threaded into the relevant sections above and tagged `[LOCK]`.

1. **Rationale mandatory.** Every new Human Decision outcome requires a non-whitespace rationale. Reaffirmation, supersession, and withdrawal also require rationale. Legacy/imported entries without one display "No rationale recorded."
2. **Accepted-risk gate.** Approve-with-accepted-risk additionally requires explicit risk references and an unselected acknowledgement stating that the engineer — not Lintel — accepts the risk.
3. **Seven first-class outcomes.** All seven ledger outcomes are first-class: approve; approve with accepted risk; tests required; review required; request changes; blocked; defer decision.
4. **Outcome distinctions preserved.** Tests required = test evidence is missing. Review required = further specialist / accountable-human review is required. Request changes = implementation changes are required. Blocked = progress should stop due to a critical unresolved issue. Defer = the engineer cannot responsibly decide yet and is not approval.
5. **Partially applicable deferred.** R0B.2B must not render or claim it. It may only be introduced once production adapters can derive it truthfully from real decision references and current contract/evidence state.
6. **Superseded is lineage.** Superseded is a historical lineage state, not a current top-level applicability state.
7. **Live applicability set.** The live top-level applicability states for R0B.2B are: applicable; predates current head; withdrawn; unavailable.
8. **Inspector history depth.** The Decision Context Inspector shows the latest five history events. Older events open in a dedicated full-history surface.
9. **No-op identity.** A submission with identical outcome, head, effective predecessor, rationale, references, accepted-risk references, and actor is a no-op.
10. **Material change supersedes.** A same-outcome/same-head submission with materially changed rationale or references supersedes the previous effective entry and retains lineage.
11. **Deterministic idempotency.** Decision idempotency must be deterministic. `Date.now()` or any fresh timestamp must not be included in the deduplication identity.
12. **Applicability type reconciliation.** R0B.2B reconciles the two `HumanDecisionApplicability` definitions into one canonical type without changing the persisted schema or pretending `partially-applicable` is implemented.
13. **Absent ≠ unavailable.** "No decision recorded" and "decision state unavailable" are different states. The view-model must distinguish an absent effective decision from malformed/unreadable/projection-failed data.
14. **No silent degradation.** A malformed or unreadable ledger must never silently degrade into the empty "No engineer decision recorded" state.
15. **Divergence needs the Report.** Visible recommendation divergence must be computed with the current Report using `recommendationDivergenceForReport`. When no Report is available, omit the divergence treatment.
16. **Disclose session-only fallback.** Session-only fallback after a persistence failure must be visibly disclosed.
17. **No `window.confirm`.** Destructive actions must not use `window.confirm`. They require an accessible, focus-managed in-product confirmation surface.
18. **R0B.2B bounds.** No production `/workspace-v2` integration; no storage-key or schema-version change; no final colour calibration; no invented signing, identity assurance, approval chains, or policy enforcement.

---

*End of R0B.2A Design Contract. Approved and normative for R0B.2B. No application or domain code was modified; no commit or push performed.*
