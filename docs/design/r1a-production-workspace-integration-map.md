# R1A — Production Workspace Integration Map

**Milestone:** R1A — analysis and migration planning only (read-only)
**Branch:** `r1a-production-workspace-integration-map`
**HEAD:** `96b73b6 Merge Workspace V2 visual lab`
**Date:** 2026-07-18
**Status:** Approved. Sections 1–15 are the analysis of record; section 16 is the approved, normative decision lock for R1B planning.

**Legend for claim types used throughout:**

- **[FACT]** — verified directly against repository source.
- **[REC]** — recommendation (a proposed choice, not yet a fact).
- **[ASSUMPTION]** — inferred, not fully verified; stated so it can be checked.
- **[RISK]** — unresolved risk requiring attention or a decision.

---

## 1. Repository Verification

| Check | Required | Observed | Result |
|---|---|---|---|
| Repository root | — | `we-are-building-the-first-static` | **[FACT]** ✓ |
| Current branch | `r1a-production-workspace-integration-map` | `r1a-production-workspace-integration-map` | **[FACT]** ✓ |
| HEAD commit | — | `96b73b6 Merge Workspace V2 visual lab` | **[FACT]** ✓ |
| V2 lab committed | in HEAD history | `e29eba4 Add Workspace V2 visual lab`; `git cat-file -e HEAD:app/visual-lab/workspace-v2/page.tsx` → OK | **[FACT]** ✓ |
| Production route | `/workspace` exists | `app/workspace/page.tsx` (1,869 lines) + `workspace.module.css` | **[FACT]** ✓ |
| V2 route | `/visual-lab/workspace-v2` exists | 4 files, all in HEAD tree | **[FACT]** ✓ |
| Working tree | clean | 79 files show CRLF/LF-only churn | **[FACT] — see note** |

**Working-tree note [FACT].** `git status` reports 79 modified files, but this is a known Cowork mount artefact, verified repeatedly: the raw diff was exactly symmetric (36,921 insertions = 36,921 deletions), `core.autocrlf=false`, and `git diff --ignore-all-space` / `git diff --ignore-cr-at-eol` both returned empty. There is **zero semantic change**. Treated as an environment artefact; not restored, normalised, staged, or committed.

**[RISK — environmental, low]** A stale, zero-byte `.git/index.lock` (owned by the mount, "Operation not permitted" on unlink) was observed during verification. It does not affect analysis but may block the next write/commit from inside Cowork. Recommend clearing it from outside Cowork before R1B implementation begins.

**V2 lab files (all [FACT], all in HEAD `e29eba4`):**

- `app/visual-lab/workspace-v2/page.tsx` (28 lines) — server component, metadata + `robots: noindex`, renders the client.
- `app/visual-lab/workspace-v2/WorkspaceV2Client.tsx` (~1,010 lines) — the single client boundary.
- `app/visual-lab/workspace-v2/fixtures.ts` (~900 lines) — lab-local view types + fixture cases + projection helpers.
- `app/visual-lab/workspace-v2/workspace-v2.module.css` (1,448 lines) — self-contained token + component styles.

---

## 2. Production Architecture Map

### 2.1 The central finding: production is a two-route split

**[FACT]** The "one workspace" that Workspace V2 unifies does not exist as one route in production. It is split across two routes that hand off via `router.push("/report")`:

| Route | File | Lines | Role | Owns |
|---|---|---|---|---|
| `/workspace` | `app/workspace/page.tsx` | 1,869 | **Queue + triage surface.** Grouped operational queue, per-case canvas with a proto verification-trace, review status, condition progress. | review-state, decision-history, condition-progress, team-workspace, report-history |
| `/report` | `app/report/page.tsx` | 4,220 | **Full case-file detail surface.** The deep canonical chain and the terminal decision act. | change-passport, evidence-hierarchy, merge-contract, human-decision-ledger, readiness-delta, verification-pack, contract-recheck, canonical-review-run |

**[FACT]** `/workspace` imports only the lighter operational libs. It does **not** import `evidence-hierarchy`, `merge-contract`, `human-decision-ledger`, `change-passport`, `readiness-delta`, or `verification-pack`. Those are consumed by `/report`, `/new`, `/review-operations`, and the API/github-app layer.

**[FACT]** The Human Decision ledger is **written only from `app/report/page.tsx`** (`appendHumanDecisionLedgerEntry` appears in no other app file). `/workspace` writes only `review-state` + `decision-history`. `/review-operations` **reads** the ledger.

**Consequence [REC / RISK].** Workspace V2's four-plane shell (Queue / Evidence Spine / Verification Canvas / Inspector) with the full chain Change → Observation → Evidence → Requirement → Human decision is a **convergence of `/workspace` + `/report`**, not a reskin of `/workspace` alone. This is the dominant fact shaping every section below. Underestimating it is the single biggest semantic-loss risk in the migration: the terminal Decision Plate's real data and mutation path live in `/report`, not `/workspace`.

### 2.2 Server / client boundaries

- **[FACT]** `app/workspace/page.tsx` — `"use client"` at top; entire route is client-rendered. No server component wrapper, no server data fetch; all data is read from `localStorage` after hydration.
- **[FACT]** `app/report/page.tsx` — client component; reads selected report from `localStorage` (`GENERATED_REPORT_STORAGE_KEY`) / report-history, plus `/report?demo=1` sample path.
- **[FACT]** V2 lab — server component `page.tsx` (emits static metadata incl. `noindex`) wrapping a single client boundary `WorkspaceV2Client`. This split (server shell for metadata, one client island) is the [REC] pattern to carry into production.
- **[FACT]** GitHub-derived data enters via server route handlers under `app/api/*` (`generate-report`, `github-app`, `github-app/webhook`, `github-workspace`, `fetch-pr-diff`).

### 2.3 Component hierarchy (production `/workspace`) [FACT]

```
WorkspacePage (client, top-level state owner)
├── AppShell (shared chrome; SHELL_NAVIGATION_OPEN_EVENT)
├── GuidedTourStartButton
├── Queue plane
│   └── QueueGroup list (QUEUES: inbox / assigned / awaiting-evidence / ready / reviewed)
│       └── case cards (grouped by WorkspaceGroup) — cardRefs, keyboard roving
├── Selected-case surface (opens as overlay < 1180px via media query)
│   ├── Canvas (role=tablist modebar)
│   │   ├── modes: overview | findings | requirements | decision  (WORKSPACE_CANVAS_MODES)
│   │   ├── verification-trace (Change→Observation→Evidence→Requirement→Human decision)
│   │   └── mode panels (empty-state copy per mode)
│   └── Inspector (projection of activeFocus; empty shell when no focus)
└── Loading skeleton (aria-busy, pre-hydration)
```

### 2.4 Shared application-shell dependencies [FACT]

- `AppShell` (`app/app-shell.tsx`) + `SHELL_NAVIGATION_OPEN_EVENT` — shared by `/workspace`, `/report`, `/new`, `/team`, `/settings`, `/review-operations`, `/review-policies`, `/slack-handoff`, `/github-action`.
- `GuidedTourStartButton` (`app/guided-tour.tsx`).
- `app/nav-config.tsx`, `app/theme-provider.tsx`, `app/design-system.css`, `app/globals.css`, `app/app-shell.css`.
- **[FACT]** The V2 lab **deliberately does not render AppShell** and is **not registered in `nav-config.tsx`** (documented in `page.tsx`, following the `app/lvos/typography-proof` precedent). Production V2 will need a decision on whether it re-enters AppShell (see §15 Q3 / §16 D4).

### 2.5 Imported libraries / production types [FACT]

- **`/workspace` imports:** `condition-progress`, `decision-history`, `report-generator` (storage key), `report-history`, `report-markdown`, `report-quality`, `reviewer-ownership`, `review-state`, `team-workspace`. Framework: `next/link`, `next/navigation`, React hooks.
- **Canonical domain type:** `Report` is defined in `lib/mock-report.ts` (`export type Report`), consumed everywhere. Sub-types: `Recommendation`, `RiskLevel`, `Confidence`, `FindingSeverity`, `ReviewArea`, `OperationalReadiness`, `ReviewerFocusItem`, `ReportQuality`.
- **Chain libs (used by `/report`, not `/workspace`):** `evidence-hierarchy` (`EvidenceRecord`, `EvidenceClass`, `EvidenceStrength`, `AssumptionRecord`, schema v1.0), `merge-contract` (`MergeContract`, `MergeContractClause`, `MergeContractRequirement`, states incl. `stale`/`unavailable`), `human-decision-ledger` (`HumanDecisionLedgerEntry`, applicability, divergence, schema v1.0, 80-entry limit), `readiness-delta` (`ReadinessDelta`, `ReviewDiff`, `AnalysisRunSnapshot`), `change-passport`, `contract-recheck`, `verification-pack`, `canonical-review-run` (fingerprints, `REPORT_GENERATOR_VERSION` 6.6, `DETERMINISTIC_RULESET_VERSION` 6.3).

---

## 3. Capability Inventory (production)

Legend: **W** = present in `/workspace`, **R** = present in `/report`.

| # | Capability | Where | Notes [FACT unless marked] |
|---|---|---|---|
| 1 | Report/case selection | W | Grouped queue; select → open case surface; `router.push("/report")` for full file |
| 2 | Recommendation + risk band/score | W, R | From `report.verdict` (recommendation, riskScore, riskLevel, confidence) |
| 3 | Findings | W, R | `report.findings[]` (severity, title, evidence, action, provenance, category) |
| 4 | Evidence hierarchy | R | `buildEvidenceHierarchy`; class order + strength + staleness + provenance |
| 5 | Merge requirements (contract) | R | `buildMergeContract`; clauses/requirements with status + importance |
| 6 | Missing + suggested tests | W, R | `report.missingTests[]`, `report.suggestedTests[]` |
| 7 | Readiness movement / delta | R | `createReadinessDelta`, `createReviewDiff` (added/cleared/changed/reopened) |
| 8 | Review Diff | R | `ReviewDiff` between analysis-run snapshots |
| 9 | Commit awareness | R (+API) | `headSha`/`shortSha`; provenance via `canonical-review-run` |
| 10 | Human Decisions (record) | R | `appendHumanDecisionLedgerEntry` — **write path is `/report` only** |
| 11 | Decision applicability + reaffirmation | R | `contract-recheck` applicability; ledger applicability/divergence |
| 12 | Human Decision review/history | R, `/review-operations` | `/review-operations` reads + projects the ledger |
| 13 | Review status (local) | W | `review-state` (REVIEW_STATUSES); default derived from report |
| 14 | Condition progress | W | `condition-progress` per report; cleared/total summary |
| 15 | Decision history (lightweight) | W | `decision-history` events (status/ownership changes) |
| 16 | Reviewer ownership / assignment | W, R | `reviewer-ownership`; `team-workspace` assignable members |
| 17 | Team workspace scoping | W | `team-workspace` store; workspace-scoped review keys |
| 18 | GitHub integration | R (heavy), W (light), API | Installations/workspace via API + `github-app-store` |
| 19 | Exports / handoffs | R | Markdown (`report-markdown`), verification-pack JSON/MD, merge-summary |
| 20 | Comments | API | `github-app-comments` |
| 21 | Empty / loading / error / unavailable states | W, R | Skeleton (aria-busy), per-mode empty copy, try/catch guards, `unavailable` contract states |
| 22 | Keyboard / a11y | W | Roving tablist (Arrow/Home/End), roles, aria-selected/controls/pressed |
| 23 | Narrow-width behaviour | W | Media query `(max-width: 1179px)` → case surface opens as overlay with motion states |

---

## 4. State-Ownership Map

### 4.1 Production `/workspace` local state [FACT] (lines cited from `app/workspace/page.tsx`)

**Top-level (WorkspacePage):**

| State | Type | Owns |
|---|---|---|
| `history` (1223) | `ReportHistoryEntry[]` | queue source data |
| `reviewStates` (1224) | `Record<string, ReportReviewState>` | per-case review status |
| `workspaceStore` (1225) | `WorkspaceStore \| null` | team workspace scope |
| `conditionProgressByGroup` (1226) | `Record<string,string>` | condition progress summaries |
| `activeQueue` (1227) | `WorkspaceQueue` | selected queue group |
| `selectedGroupKey` (1228) | `string \| null` | selected case |
| `activeFocus` (1229) | `WorkspaceFocus \| null` | focused artifact (case/finding/evidence/requirement/human-decision) |
| `copyFeedback` (1230) | `CopyFeedback` | transient UI |
| `error` (1231) | `string \| null` | error surface |
| `hydrated` (1232) | `boolean` | hydration gate |
| `selectedCaseOpen` / `selectedCaseView` / `selectedCaseMotion` / `selectedCaseSurfaceViewport` / `motionReady` (1233-1237) | mixed | narrow-width overlay + motion |

**Canvas sub-component (ReportCanvas):** `mode` (707, WorkspaceCanvasMode), `selectedFindingId` (708), `selectedRequirementId` (709), `selectedEvidenceId` (710). **[RISK — duplicated selection]** Canvas holds its own finding/requirement/evidence selection while the parent holds `activeFocus`; these are two sources of truth for "what is focused."

**Refs:** `scrollRef`, `copyResetTimer`, `cardRefs`, `selectedCaseMatchRef`, `selectedCaseNodeRef`, `selectedCaseCloseNodeRef`, `selectedGroupKeyRef`, `selectedCaseCloseTimer`.

### 4.2 V2 target state [FACT] (`WorkspaceV2Client.tsx`)

Exactly four pieces, everything else a pure projection (documented in the file header):

| State | Type |
|---|---|
| `selectedCaseId` | `string` |
| `focusedArtifact` | `{ kind: "finding"\|"evidence"\|"requirement"; id } \| null` |
| `activeStage` | `StageId` (change/observation/evidence/requirement/decision) |
| `decisionConceptExpanded` | `boolean` |

Plus refs `bodyRef`, `suppressReconcileUntil` for scroll-spy. **No global state, no context, no persistence, no decision mutation.**

**Ownership gap [RISK].** Production has ~16 stateful concerns spread across two components with duplicated selection; V2 has 4 and one `focusedArtifact` source of truth. The migration must **fold** production's `activeFocus` + canvas selection into one `focusedArtifact`, and **add back** the persistence/mutation concerns V2 deliberately omitted (review status, condition progress, decision recording, team scope). V2 is a clean projection core that production must wrap with real state — not the reverse.

---

## 5. Persistence Map

**[FACT]** All persistence is `localStorage`, versioned `.v1`. Keys:

| Key | Module | Purpose |
|---|---|---|
| `lintel.reportHistory.v1` | report-history | stored reports (queue source) |
| `lintel.generatedReport.v1` | report-generator | last generated report handed to `/report` |
| `lintel.reviewState.v1` | review-state | per-case review status |
| `lintel.workspaceStatus.v1` | review-state | **legacy** status key (migration source) |
| `lintel.conditionProgress.v1` | condition-progress | cleared conditions per report |
| `lintel.decisionHistory.v1` | decision-history | lightweight status/ownership events |
| `lintel.humanDecisionLedger.v1` | human-decision-ledger | terminal Human Decision ledger (write: `/report`) |
| `lintel.reviewActionStatus.v1` | review-actions | review action status |
| `lintel.teamWorkspaces.v1` | team-workspace | workspace store |
| `lintel.activeTeamWorkspace.v1` | team-workspace | active workspace id |
| `lintel.workspaceSelectedGroup.v1` | workspace/page.tsx | selected case group (UI preference) |

**Hydration/migration [FACT].**

- `/workspace` gates render on `hydrated`; a skeleton (`aria-busy`) shows pre-hydration. On hydrate it reads report-history, `ensureWorkspaceStore`, workspace-scoped review states, condition progress, and the selected group key. All reads are wrapped in try/catch.
- `review-state` carries an explicit legacy key (`LEGACY_WORKSPACE_STATUS_STORAGE_KEY`) — evidence of an established migration pattern to reuse.
- `team-workspace` uses `workspaceScopedReviewKey` / `workspaceIdForReportEntry`; review state is namespaced by workspace, with a fallback to `"local"`.
- Human Decision ledger: schema-versioned (`HUMAN_DECISION_LEDGER_ENTRY_SCHEMA_VERSION` 1.0), 80-entry cap, keyed via `humanDecisionLedgerKeyForReport`.

**V2 persistence [FACT].** None. The lab has zero persistence and zero mutation. Fixtures header explicitly: "no mutation path and no persistence"; "R0B.1 SCOPE — UNSIGNED DECISION ONLY."

**[REC] Persistence boundary.** Do **not** let the V2 surface import `localStorage` modules directly. Introduce a persistence adapter/hook layer (`useWorkspaceData`) that owns all `localStorage` I/O and passes plain view-models down. This preserves V2's pure-projection property and honours the instruction "do not assume the visual lab should directly import production persistence."

---

## 6. Data & Truth-Boundary Map

**[FACT]** The codebase encodes truth boundaries explicitly — this is a product-quality strength to preserve, not paper over.

| Source class | Where | UI must signal |
|---|---|---|
| Deterministic analysis | `DETERMINISTIC_RULESET_VERSION` 6.3; findings `provenance: "Rule detected"` | "Rule detected" |
| Model-assisted analysis | `canonicalAiSummary`; findings `provenance: "Model assisted"`; `CanonicalAnalysisSource: "model"` | "Model assisted" / model+provider named |
| Fallback / demo | `CanonicalAnalysisSource: "fallback" \| "demo"`; `/report?demo=1`; `lib/mock-report.ts` | clearly labelled sample/demo |
| Baseline preserved | findings `provenance: "Baseline preserved"` | "Baseline preserved" |
| Persisted user data | review-state, decision-history, condition-progress, human-decision-ledger | user-entered vs derived |
| GitHub-derived | API routes + `github-app-store`; installation/workspace/commit SHA | provenance-bearing (repo, SHA, author) |
| Computed projections | evidence-hierarchy summary, merge-contract summary, readiness-delta, contract-recheck | derived, with staleness |
| Evidence strength/staleness | `EvidenceStrength`, `stale` flags; contract `stale`/`unavailable` states | strength meter + stale badge |

**Overstatement hotspots [RISK].**

1. **[RISK-A]** V2 `FindingView` carries explicit `supportingEvidenceIds` and `relatedRequirementIds`; production `report.findings[]` has **no such link arrays** — evidence↔finding↔requirement relationships are derived in `evidence-hierarchy`/`merge-contract`, not stored on the finding. Adapting fixtures→production must derive these edges honestly; hard-coding or guessing them would fabricate a certainty the data does not have.
2. **[RISK-B]** V2 is **unsigned-decision only**. Production has a real recorded ledger with applicability, divergence, and reaffirmation. Wiring the Decision Plate to real data must not present an unsigned concept panel as if a decision were recorded, nor vice-versa.
3. **[RISK-C]** The verification-trace/Evidence Spine shows counts ("N gaps", "N recorded"). These must be computed from real evidence-hierarchy/merge-contract output, not from fixture-shaped assumptions, or the Spine will overstate coverage.
4. **[RISK-D]** V2 fixtures transcribe production unions by hand and note they "must stay value-identical." Any drift (e.g. a new `EvidenceClass`) silently breaks the mapping. Needs a type-parity guard.

---

## 7. Old-to-New Component Matrix

For each: current source → destination V2 component; transformation; adapter?; missing data; semantic-loss risk; test.

| Current (production) | Source type | → V2 destination | Transformation | Adapter? | Missing data | Semantic-loss risk | Test required |
|---|---|---|---|---|---|---|---|
| `QUEUES` (5 queues) + WorkspaceGroup cards | `/workspace` const + grouping fn | Grouped queue (`WORKSPACE_V2_QUEUE_GROUPS`) | Remap operational queues → recommendation-based groups | **Yes** | mapping of assigned/awaiting-evidence | **High** — can hide states | Queue-grouping unit test: every case in exactly one group |
| Report header (canvas headline) | `report.pr.*` + metadata | Case header (`CaseContextView` + case fields) | Field rename to `CaseFixture` shape | Yes | `headSha`, `confidence` surfacing | Low | Snapshot of header projection |
| `report.changedFiles[]` | `Report` | Change stage (`ChangedFileView[]`) | Add additions/deletions/risk defaults | Yes | additions/deletions often absent in `Report` | Medium — risk per file may be unknown | Adapter test: missing counts render as unknown, not 0 |
| `report.findings[]` | `Report` | Observation stage (`FindingView[]`) | Add `findingId`, derive `supportingEvidenceIds`/`relatedRequirementIds` | **Yes** | link arrays not stored | **High** (RISK-A) | Edge-derivation test vs evidence-hierarchy |
| `buildEvidenceHierarchy` output | `evidence-hierarchy` | Evidence stage (`EvidenceView[]`) | Map `EvidenceRecord`→`EvidenceView`; class/strength/staleness | **Yes** | `EvidenceStatus` union differs from `EvidenceStrength` | **High** — class/strength semantics | Class + strength + stale mapping test |
| `buildMergeContract` output | `merge-contract` | Requirement stage (`RequirementView[]`) | Map clauses/requirements → `RequirementView`; keep `unavailable`/`stale` | **Yes** | `evidenceRequired` text, importance | **High** — dropping `unavailable`/`accepted-risk` loses truth | Status-fidelity test incl. edge states |
| `createReadinessDelta` / `ReviewDiff` | `readiness-delta` | Subordinate movement context (`ReadinessView`) | Map to score/rec deltas + counts | Yes | prior-run snapshot availability | Medium | Delta projection test (initial vs regressed) |
| Canvas modes (overview/findings/requirements/decision) | `/workspace` local | Stage + focus model (`activeStage` + `focusedArtifact`) | Modes → stages; selection → single focus | **Yes** | none (superset) | Medium — must preserve keyboard tab semantics | Stage-nav + focus-sync test |
| Detail panels (canvas per-mode + `/report` panels) | both routes | Contextual Inspector (Finding/Evidence/Requirement/CaseContext inspectors) | Inspector as projection of `focusedArtifact` | Yes | none | Medium | Inspector-causality test (§13) |
| Human Decision ledger | `human-decision-ledger` (write in `/report`) | Decision Plate (terminal) | Project ledger → plate; wire record path | **Yes** | V2 is unsigned-only (R0B.1) | **Critical** — recorded-decision UI deferred to R0B.2 | Ledger truthfulness test (§13) |
| Review status / condition progress | review-state / condition-progress | Queue + Canvas projections (badges, movement) | Feed status into group + header | Yes | none | Medium | Status/roundtrip test |
| GitHub identity + commit SHA | API + github-app-store + canonical-run | Provenance-bearing metadata (header + evidence provenance) | Attach repo/SHA/author to case + evidence | Yes | installation state in workspace context | Medium | Provenance-preservation test |

---

## 8. Interaction-Parity Matrix

Classification: **Preserve** unchanged · **Adapt** to V2 · **Replace** · **Defer** · **Remove (approval)**. No production capability may silently disappear.

| # | Interaction | Production behaviour [FACT] | Classification | Notes |
|---|---|---|---|---|
| 1 | Select a report/case | Queue card select; opens case surface | **Adapt** | Into `selectedCaseId`; keep group context |
| 2 | Switch modes/tabs | Canvas modebar tablist (overview/findings/requirements/decision) | **Adapt** | → `activeStage` (5 stages); preserve roving keyboard |
| 3 | Focus a finding | `selectedFindingId` / `activeFocus` | **Adapt** | → `focusedArtifact{kind:finding}` |
| 4 | Navigate evidence | `selectedEvidenceId`; evidence-hierarchy (`/report`) | **Adapt** | → Evidence stage + `focusedArtifact{kind:evidence}` |
| 5 | Navigate requirements | `selectedRequirementId`; merge-contract (`/report`) | **Adapt** | → Requirement stage + focus; keep edge states |
| 6 | Review actions (status) | `writeReviewState`, review-actions | **Preserve** (behaviour) / **Adapt** (surface) | Must round-trip to same keys |
| 7 | Decision recording | `appendHumanDecisionLedgerEntry` (`/report`) | **Defer to R0B.2 / adapt in R1B** | V2 lab is unsigned-only; record path must be wired before parity |
| 8 | Decision reaffirmation | contract-recheck applicability + ledger | **Defer / Adapt** | Depends on #7 |
| 9 | Decision supersession/withdrawal | ledger event types | **Defer / Adapt** | Depends on #7 |
| 10 | Readiness changes | readiness-delta / review-diff | **Adapt** | Subordinate movement context in header/Spine |
| 11 | Commit changes | headSha/shortSha; canonical-run | **Preserve** | Provenance metadata |
| 12 | Local persistence | localStorage read/write/remove | **Preserve** | Via adapter layer, not direct in V2 |
| 13 | GitHub actions | API routes + store | **Preserve** | Unchanged server side |
| 14 | Exports | markdown, verification-pack, merge-summary | **Preserve / Defer surface** | Keep export capability; surface placement per §16 D9 |
| 15 | Keyboard navigation | roving tablist Arrow/Home/End; roles/aria | **Preserve** | Parity is a hard R1B criterion |
| 16 | Narrow-width / mobile | media query overlay + motion states | **Adapt** | V2 shell must define < 1180px behaviour |
| 17 | Copy-to-clipboard feedback | `copyFeedback` transient | **Preserve** | Minor UI |
| 18 | Delete case / clear state | deleteReportFromHistory + remove review/decision | **Preserve** | Destructive; keep guards |
| 19 | Guided tour | GuidedTourStartButton | **Defer** | Re-attach after shell decision |

**[RISK]** Items 7–9 (record / reaffirm / supersede / withdraw a decision) are the parity gap: the approved V2 lab implements the *concept* (Decision Plate, unsigned) but not the *recorded* path. These cannot be marked "preserve" until wired. Top R1B risk; gated behind R0B.2 (§16 D3).

---

## 9. Proposed Production Architecture [REC]

**Guiding constraints (from the brief):** pure projections; one source of truth per state; minimal duplicated state; stable production types; explicit uncertainty; small reversible steps; no broad rewrite for cleanliness.

**9.1 Route & shell.** New production route (`/workspace-v2` behind a flag) = server component (static metadata) → single client boundary, mirroring the lab. Production V2 remains full-bleed (§16 D4); AppShell chrome must not become a permanent fifth plane — a compact global nav trigger or chrome-less shell mode may be used.

**9.2 Component hierarchy [REC].**

```
WorkspaceV2Route (server)
└── WorkspaceV2Client (client; owns 4 UI-state values only)
    ├── useWorkspaceData()  ← adapter hook: all localStorage + GitHub-derived reads
    ├── QueuePlane        (projection of grouped cases)
    ├── EvidenceSpine     (stage nav; activeStage)
    ├── VerificationCanvas(stage records: Change/Observation/Evidence/Requirement)
    │   └── DecisionPlate (terminal; recorded vs unsigned)
    └── Inspector         (projection of focusedArtifact)
```

**9.3 State ownership [REC].** UI state (4 values) stays in the client, exactly as the lab. All *data* comes from `useWorkspaceData()` returning plain view-models. `focusedArtifact` is the **single** focus source of truth — retire the canvas-local `selectedFindingId/RequirementId/EvidenceId` duplication (RISK in §4).

**9.4 Adapter layer [REC].** `lib/workspace-v2/adapters/*` — pure functions `Report + evidence-hierarchy + merge-contract + readiness-delta + ledger → CaseView`. No React, no storage; unit-testable in isolation. This is where every §7 transformation lives and where the type-parity guard sits.

**9.5 Projection functions [REC].** Reuse the lab's `casesForGroup`, `evidenceComposition`, `evidenceRank`, `openBlockingCount`, `staleEvidenceCount`, etc., promoting them from fixtures into the adapter/projection module so both lab and production share one implementation.

**9.6 Persistence boundary [REC].** Only `useWorkspaceData()` touches `localStorage`. Writes (review status, condition progress, decision recording) go through typed mutators that reuse the existing `lib/*` write functions and their existing keys — no new key schemes, no schema bumps in R1B.

**9.7 Error / loading / empty / a11y [REC].** Preserve production's `hydrated` gate + skeleton; wrap each plane in an error boundary; keep per-stage empty copy (the lab already renders "nothing" rather than empty shells); keep roving-tablist keyboard model and ARIA roles. Accessibility parity is a release gate, not a polish item.

**9.8 What NOT to do.** No rewrite of `lib/*` domain modules; no change to API routes; no migration of storage keys; no redesign of the four-plane principles (locked).

---

## 10. File-by-File Plan [REC]

Risk levels: L / M / H. All new production files are additive; production route files stay untouched until cut-over.

**Create:**

| File | Why | Owns | Risk | Rollback |
|---|---|---|---|---|
| `app/workspace-v2/page.tsx` | Server route entry (metadata) | route shell | L | delete file / unregister |
| `app/workspace-v2/WorkspaceV2Client.tsx` | Client boundary (composed, not copied — §16 D11) | 4 UI states + composition | M | flag off; delete |
| `app/workspace-v2/workspace-v2.module.css` | Styling (from lab) | component styles | L | delete |
| `lib/workspace-v2/view-model.ts` | Canonical `CaseView`/`FindingView`/… types | shared types | M | delete; lab unaffected |
| `lib/workspace-v2/adapters.ts` | `Report+chain → CaseView` pure fns | transformations (§7) | **H** | delete; no prod consumer until wired |
| `lib/workspace-v2/projections.ts` | grouping/composition/rank helpers | pure projections | M | delete |
| `lib/workspace-v2/use-workspace-data.ts` | localStorage + GitHub-derived reads/writes | persistence boundary | **H** | flag off; delete |
| `lib/workspace-v2/__tests__/*` | adapter/projection/parity tests | verification | L | delete |
| `lib/workspace-v2/type-parity.ts` (or test) | compile-time guard that lab unions == lib unions | RISK-D guard | M | delete |

**Modify (later, at cut-over only):**

| File | Why | Risk | Rollback |
|---|---|---|---|
| `app/nav-config.tsx` | register route (or swap `/workspace`) | M | revert nav entry |
| `app/workspace/page.tsx` | only at retirement, or to add a "try V2" link | M | git revert |

**Retire later (only after parity proven):** `app/workspace/page.tsx`, `app/workspace/workspace.module.css`. `/report` is **retained** as a secondary snapshot / print-share / export route (§16 D7), not retired.

**Must remain untouched initially (production surfaces + domain):** `app/workspace/*`, `app/report/*`, `app/new/*`, `app/review-operations/*`, all `app/api/*`, and all `lib/*` domain modules (`mock-report`, `evidence-hierarchy`, `merge-contract`, `human-decision-ledger`, `readiness-delta`, `change-passport`, `contract-recheck`, `verification-pack`, `canonical-review-run`, `review-state`, `condition-progress`, `decision-history`, `team-workspace`, `report-*`).

**Shared files needing special care:** `app/app-shell.tsx` (+`SHELL_NAVIGATION_OPEN_EVENT`), `app/theme-provider.tsx`, `app/design-system.css`, `app/globals.css` — changes here hit every route.

**Unavoidable global change:** only `app/nav-config.tsx` (one nav entry), and only at the flag/cut-over step. Everything else is additive under `app/workspace-v2/` and `lib/workspace-v2/`.

**Lab files:** `app/visual-lab/workspace-v2/*` stay as the reference; **[REC]** keep them until production V2 reaches parity, then retire the lab (not before).

---

## 11. Staged Migration Plan [REC]

**Principle:** current `/workspace` stays fully available until parity is proven; V2 ships behind a flag/parallel route.

- **Stage 0 — Scaffolding.** Create `app/workspace-v2/` (route + client + css promoted from lab, still fixture-fed) and `lib/workspace-v2/` (view-model + empty adapters + type-parity guard). No production route touched. *QA:* build + typecheck green; `/workspace` unchanged.
- **Stage 1 — Data adapters (fixtures → real).** Implement `adapters.ts` mapping real `Report` + evidence-hierarchy + merge-contract + readiness-delta into `CaseView`. Unit-test each §7 transformation, especially RISK-A (finding↔evidence edges), evidence class/strength, and merge-contract edge states. *QA:* adapter tests green; V2 renders one real case read-only.
- **Stage 2 — Read-only real data end-to-end.** Wire `useWorkspaceData()` reads (report-history, review-state, condition-progress, team-workspace, GitHub-derived). Queue parity + selection parity, still no mutation. *QA:* queue grouping test; every production case appears in exactly one V2 group.
- **Stage 3 — Interaction integration (non-destructive).** Focus, stage nav, keyboard/a11y parity, narrow-width behaviour. *QA:* interaction-parity matrix items 1–5,15,16 pass.
- **Stage 4 — Persistence writes.** Review status + condition progress writes through existing keys. *QA:* round-trip test — a status set in V2 is read by `/workspace` and vice-versa (same keys).
- **Stage 5 — Decision Plate (recorded).** Wire the terminal record/reaffirm/supersede/withdraw path to `human-decision-ledger` (per the R0B.2 recorded-decision design, §16 D3). *QA:* ledger truthfulness test; `/review-operations` sees V2-recorded decisions identically.
- **Stage 6 — Parity sign-off + flag default.** Full parity matrix pass; flip default to V2 while `/workspace` remains reachable.
- **Stage 7 — Retirement.** After a soak period with no regressions, retire `/workspace`. `/report` retained per §16 D7.

**Branch strategy [REC].** Keep milestone branches: R1A (this) → `r1b-workspace-v2-data-integration` off HEAD. One PR per stage; each independently revertable. Do not squash stages together.

**Feature-flag / parallel-route [REC].** Parallel route `app/workspace-v2/` + a flag (env or config) controlling nav visibility and eventual default. Parallel route is preferred over in-place replacement so rollback is a flag flip, not a revert.

**[REC]** Do not let the V2 surface import production persistence directly (per brief) — the adapter/hook boundary is the enforcement point.

---

## 12. Risk Register

| ID | Risk | Likelihood | Impact | Type | Mitigation |
|---|---|---|---|---|---|
| R-1 | Underestimating that V2 = `/workspace` **+** `/report` convergence; Decision Plate data/mutation lives in `/report` | High | High | Scope/semantic | Convergence is locked (§16 D1); Stage 5 dedicated to recorded decisions |
| R-2 (RISK-A) | Finding↔evidence↔requirement edges not stored on `Report`; V2 view types assume them | High | High | Fabrication | Derive edges from evidence-hierarchy/merge-contract; test; render "unknown" honestly (§16 D10) |
| R-3 (RISK-B) | Presenting unsigned decision as recorded (or vice-versa) | Medium | Critical | Truthfulness | Ledger truthfulness test; recorded path gated to Stage 5 / R0B.2 |
| R-4 | Operational queues → recommendation-based groups hides states | Medium | High | Semantic loss | Explicit grouping map + test: every case in exactly one group (§16 D5) |
| R-5 (RISK-D) | Lab unions drift from `lib/*` unions | Medium | Medium | Correctness | Compile-time type-parity guard |
| R-6 | Merge-contract edge states (`unavailable`, `accepted-risk`, `stale`) dropped in mapping | Medium | High | Semantic loss | Status-fidelity test incl. all states |
| R-7 | Duplicated focus state (canvas selection vs `activeFocus`) reintroduced | Medium | Medium | Architecture | Single `focusedArtifact`; lint/review gate |
| R-8 | Direct `localStorage` import into V2 surface | Medium | Medium | Boundary violation | Adapter hook is the only storage consumer |
| R-9 | Keyboard/a11y parity regression | Medium | High | Accessibility | a11y parity is a release gate (§14) |
| R-10 | Shared AppShell/token change bleeds into other routes | Low | High | Blast radius | Keep shell changes out of R1B; additive only |
| R-11 | Stale `.git/index.lock` blocks first commit | Low | Low | Environment | Clear outside Cowork before R1B |
| R-12 | GitHub installation/workspace state not surfaced in V2 queue context | Medium | Medium | Data completeness | Include in `useWorkspaceData` read set (Stage 2); concise per §16 D8 |
| R-13 | Narrow-width behaviour undefined in V2 shell | Medium | Medium | Parity | Port media-query overlay model in Stage 3 |

---

## 13. Rollback Strategy [REC]

- **Primary:** feature flag. V2 ships as parallel route `app/workspace-v2/`; `/workspace` untouched. Rollback = flip flag / hide nav entry. Zero data risk (V2 uses the same keys via the adapter; no new schema).
- **Per-stage:** one PR per stage, each independently `git revert`-able; no stage squashing.
- **Data:** no key renames, no schema bumps in R1B → nothing to migrate back. Existing `.v1` keys remain canonical.
- **Full retreat:** delete `app/workspace-v2/` + `lib/workspace-v2/` + revert the single `nav-config.tsx` entry. Production is byte-for-byte unaffected.
- **Retirement is reversible until Stage 7:** `/workspace` stays reachable through Stage 6.

---

## 14. R1B Acceptance Criteria [REC]

R1B is "prove parity on real data." All must hold:

1. **Real production data** — V2 renders from real `Report` + chain modules via adapters; no fixtures in the production route.
2. **Queue parity** — every case in current `/workspace` appears in V2, in exactly one group; no state hidden by the queue remap.
3. **Report-selection parity** — selecting any case yields the same case as `/workspace`→`/report`.
4. **Evidence Spine accuracy** — stage counts/states computed from real evidence-hierarchy/merge-contract; no fixture-derived numbers.
5. **Artifact-focus accuracy** — a single `focusedArtifact`; selecting a finding/evidence/requirement focuses the correct one with no duplicate-selection drift.
6. **Inspector causality** — Inspector is a pure projection of `focusedArtifact`; never shows stale/mismatched detail.
7. **Human Decision truthfulness** — recorded vs unsigned rendered exactly per ledger; a recorded decision in V2 is identical in `/review-operations`; no fabricated decisions.
8. **Persistence integrity** — status/condition writes round-trip through existing `.v1` keys; `/workspace` and V2 agree; no orphaned/renamed keys.
9. **GitHub-state preservation** — repo/SHA/author/installation provenance preserved and displayed; no server-side change.
10. **No fabricated evidence or decisions** — every edge and count traceable to a real source; unknowns shown as unknown.
11. **Keyboard accessibility** — roving tablist (Arrow/Home/End), roles, aria-selected/controls/pressed at parity with production.
12. **Build & typecheck** — green, including the type-parity guard.
13. **No regression in current production capabilities** — the §3 inventory all remain reachable (via V2 or preserved routes).
14. **Rollback availability** — flag flip fully reverts to `/workspace` with no data migration.

**Explicitly out of R1B (deferred):** final colour calibration (R1C) and advanced/restrained interaction motion (R1D) are **not** R1B blockers (§16 D12).

---

## 15. Unresolved Questions Requiring a Decision

> Status after approval: Q1–Q8 below were resolved by the §16 Decision Lock. They are retained for traceability; the binding answers are in §16.

1. **Convergence scope.** → Resolved D1/D2 (converge; no route handoff for the core journey).
2. **Recorded decisions (R0B.2).** → Resolved D3 (R0B.2 is the next milestone, precedes production decision integration).
3. **AppShell.** → Resolved D4 (full-bleed; compact nav trigger or chrome-less shell mode; no permanent fifth plane).
4. **Queue mapping.** → Resolved D5 (Needs attention / Review / Ready / Reviewed; assigned-to-me and awaiting-evidence are filters/secondary statuses).
5. **Route naming / cut-over.** → Resolved D6 (ship on `/workspace-v2`; `/workspace` remains until parity proven).
6. **`/report` disposition.** → Resolved D7 (retained as secondary snapshot / print-share / export route).
7. **GitHub context in V2 queue.** → Resolved D8 (concise: repo/PR/branch/head SHA in header; installation/workspace status only where operationally relevant).
8. **Export surface placement.** → Resolved D9 (case utility menu / command palette / Inspector utility area; never the Decision Plate).

**Remaining open items for R1B planning (not blocking this lock):**

- **O-1** Exact grouping predicate mapping each recommendation/review status into Needs attention / Review / Ready / Reviewed (implements D5; test per R-4).
- **O-2** The concrete finding→evidence and finding→requirement derivation algorithm from evidence-hierarchy/merge-contract (implements D10; test per R-2).
- **O-3** Feature-flag mechanism (env vs config) and who controls default flip at Stage 6.
- **O-4** Clearing the stale `.git/index.lock` before R1B writes (R-11).

---

## 16. Approved Decision Lock

**Status: APPROVED — NORMATIVE for R1B planning.** The following decisions are binding. Where earlier sections (notably §9, §10, §11, §15) offered recommendations or open questions, these decisions govern.

1. **Convergence.** Workspace V2 will converge the current `/workspace` queue/triage surface and the current `/report` deep case-file workflow into one primary engineering workstation.
2. **Core workflow.** The core workflow must include Change → Observation → Evidence → Requirement → Human decision. The product must not require a route handoff for the core review and decision journey.
3. **R0B.2 sequencing.** R0B.2 — Recorded Human Decision Design is the next milestone and must be completed before production decision integration.
4. **Shell.** Production Workspace V2 remains full-bleed. Existing AppShell chrome must not become a permanent fifth plane or reduce the approved four-plane composition. A compact global navigation trigger or chrome-less shell mode may be used.
5. **Queue groups.** Production queue groups are: **Needs attention**, **Review**, **Ready**, **Reviewed**. Assigned-to-me and awaiting-evidence are filters or secondary statuses, not replacements for recommendation-based grouping.
6. **Route.** Workspace V2 initially ships on the parallel route `/workspace-v2`. The current `/workspace` remains available until parity is proven.
7. **`/report` disposition.** After convergence, `/report` remains as a secondary canonical snapshot, print/share and export route rather than the primary working surface.
8. **GitHub context.** GitHub context is concise: repo, PR, branch and head SHA in the case header; installation/workspace status only where operationally relevant.
9. **Exports.** Exports belong in a case utility menu, command palette or Inspector utility area. They do not belong in the Human Decision Plate.
10. **No fabricated relationships.** Production adapters must not fabricate finding-to-evidence or finding-to-requirement relationships. Unknown or non-derivable links must remain explicitly unknown.
11. **Component decomposition.** Production should preserve one UI-state owner but decompose Queue, Evidence Spine, Verification Canvas, Inspector and Decision Plate into reviewable components rather than copying the entire visual-lab client unchanged.
12. **Deferred calibration.** Final colour calibration belongs to R1C and restrained interaction smoothness belongs to R1D.

---

*End of R1A report. Sections 1–15 are the approved analysis of record; section 16 is normative for R1B planning.*
