# R6K — Human Decision Evidence

## Baseline

- R6K baseline and retained HEAD: `443cf02f2fc272bccf8540435b3bb0e5bae303d6`
- Branch: `r6k-human-decision`
- `HEAD...main`: `0 0`
- R6J freeze: `Freeze R6J history comparison and readiness movement`

## Product outcome

R6K makes Human Decision the accountable engineer decision workflow while preserving the product's authority boundary:

> Lintel recommends. The accountable engineer decides.

Lintel Recommendation and Human Decision remain separate records. Recording a Human Decision does not overwrite the recommendation, close requirements, clear blockers, mutate evidence, or recalculate risk.

## Canonical decisions

R6K uses the seven existing canonical outcomes without renaming or redefining them:

1. Approve
2. Approve with accepted risk
3. Tests required
4. Review required
5. Request changes
6. Blocked
7. Defer decision

## Draft lifecycle

The reconciled trust-critical lifecycle is:

- a provider-owned, per-Review session cache is the active session source of truth;
- `localStorage` supplies restart durability under the reserved key `lintel.r6.humanDecisionDraft.v1`;
- valid drafts are never silently evicted, expired, pruned, or rebased;
- `MAX_HUMAN_DECISION_DRAFTS = 64` bounds the durable mirror;
- at capacity, a new durable slot is refused instead of removing existing work;
- unreadable envelopes and individual records are quarantined without guessed migration;
- Review switching preserves the session draft even when a durability flush fails;
- durability states describe the actual durable result without implying canonical success;
- a verified canonical `persisted` result clears the draft before workspace reprojection;
- stale basis blocks submission and preserves entered work;
- Reconcile explicitly acknowledges current basis movement;
- Discard explicitly removes the private draft.

Closing the composer is not discard. Draft persistence and canonical persistence remain separate concerns.

## Canonical persistence

R6K reuses `createWorkspaceDecisionService(storage)` as the sole Human Decision writer. It adds no second API or server writer and no new canonical storage key. Canonical success remains subject to the existing service's persistence and read-back semantics.

## Command routing

Composer intent maps to the existing canonical operations:

- new decision → `recordDecision`;
- same decision reaffirmation → `reaffirmDecision`;
- replacement decision → `supersedeDecision`.

Reaffirmation is routed explicitly through `reaffirmDecision`. Withdrawal remains deferred.

## UI / interaction

The accepted R6K surface provides:

- persistent Human Decision invocation in Review chrome;
- a top-anchored, single-plane modal with fixed header/footer and a scrolling body;
- five default outcomes plus two under More outcomes;
- required rationale with the existing 700-character authority;
- conditional accepted-risk disclosure and required risk references;
- quiet Currently recorded context and a canonical Recorded marker;
- stale-state Reconcile and Discard actions;
- no typed confirmation;
- no toast or celebratory success UI;
- no new Review mode or destination.

## C5 convergence

The raw perceptual reference was **Fifth Cursor Batch / C5 Settings**. The programme rule was: where Cursor and Lintel solve an equivalent UI problem, closely match the supplied Cursor reference unless Lintel semantics require a truthful divergence.

Claude directly re-inspected the raw C5 reference and all five final frames. Final verdict:

`R6K REFERENCE FIDELITY ACCEPTED`

Final closure:

- VG-K1 — CLOSED: thin, quiet scrollbar and materially corrected content alignment;
- VG-K2 — CLOSED: compact dark More outcomes disclosure with adjacent caret;
- VG-K4 — CLOSED: rationale resize grip absent;
- VG-K5 — CLOSED: header/footer separators visually consistent.

VG-K3 is deferred to R6O. Recorded-chip harmonisation and the remaining cosmetic residuals are non-blocking R6O candidates, not R6K freeze blockers. Visual acceptance does not substitute for deterministic engineering validation.

## Native evidence

The formal set contains exactly five 1440 × 900 PNGs:

| Formal frame | Dimensions | Bytes | SHA-256 | Pixel-visible proof |
| --- | ---: | ---: | --- | --- |
| `evidence/r6k/R6K-1440-composer-clean.png` | 1440 × 900 | 150,647 | `2484e7c481a5b3e28554967272c87c135765b0196df6fd45cc85ac29a415d782` | Genuine clean composer; five default outcomes; collapsed compact More outcomes; empty rationale; disabled Record decision; corrected quiet scrollbar; no resize grip; consistent separators. |
| `evidence/r6k/R6K-1440-more-outcomes.png` | 1440 × 900 | 164,525 | `6ff30a7555c46e9b2848af05d700c2af3cdaf1357d07543d206caef85b6a7382` | Genuine expanded disclosure with Approve with accepted risk and Defer decision; compact disclosure remains below the revealed rows; flat modal body and fixed restrained footer. |
| `evidence/r6k/R6K-1440-consequential-disclosure.png` | 1440 × 900 | 187,938 | `3b227e837072a667017ebe6a085e439e7465ab2dde5e89db0ead8aeda32b09b7` | Genuine accepted-risk replacement state; amber explanation; required current Risk references with one selected; populated rationale; Draft saved; enabled Replace decision. |
| `evidence/r6k/R6K-1440-decision-recorded.png` | 1440 × 900 | 164,102 | `2dbdb82e0a500ea7e08fcdadbd94755ce83c00e189223c97150afda61dbc6bf4` | Genuine canonical Tests required record; Local reviewer; timestamp; current-head applicability; Matches Lintel; rationale; separate Lintel Recommendation and visible verification standing. |
| `evidence/r6k/R6K-1440-stale-draft.png` | 1440 × 900 | 202,289 | `3a2532f0c5f6c0342b7b6eb48dca34a025cd6bf5f2b6226f0b4e4013b81cf6e2` | Genuine stale state; currently recorded Tests required and canonical Recorded marker; independent private Approve draft; `The recorded decision changed.`; Discard draft; Reconcile primary; no silent rebase. |

The accepted consequential frame truthfully substitutes a genuine accepted-risk replacement state for the earlier unresolved-blocker Record state because canonical product state had advanced. Claude accepted the substituted frame as a valid and strong C5 comparison state. No localStorage manipulation, fabricated evidence, or historical-state reconstruction was used.

Still images prove rendered state only. They do not independently prove keyboard behavior, focus trapping, dismissal, persistence, arrow-key behavior, transition timing, service invocation, reprojection timing, or the interaction sequence that produced stale state. The recorded actor is local/device truth, not authenticated identity.

## Genuine workflow

The observed browser-native path covered:

1. opening a clean composer;
2. expanding More outcomes;
3. entering and retaining a private draft;
4. closing/reopening and switching Reviews while the draft persisted;
5. recording a canonical Tests required decision through the existing service;
6. observing workspace reprojection and recorded rationale;
7. creating a new private draft;
8. genuine canonical-state movement relative to that draft;
9. stale detection with blocked submission;
10. visible Reconcile and Discard actions.

The corrected consequential capture subsequently exercised the genuine accepted-risk replacement path with a required current risk reference. Native workflow observation and deterministic test proof remain separate evidence categories.

## Validation

Fresh final freeze-gate validation:

| Suite | Result |
| --- | --- |
| R6K | 24/24 PASS |
| R6J | 9/9 PASS |
| R6I | 13/13 PASS |
| R6H | 5/5 PASS |
| R6G | 11/11 PASS |
| R6F | 14/14 PASS |
| R6E | 8/8 PASS |
| R6D | 23/23 PASS |
| R6C | 36/36 PASS |

The production-bound action-registry count remains 13. The historical R6D bound count remains 4.

## Build

Production build: **PASS**.

The initial Codex-environment build attempt could not reach Google Fonts. The unchanged candidate was then built successfully from the exact R6K worktree, `C:\Users\dkape\Documents\Codex\2026-06-23\r6k-human-decision`, in the user's normal Windows environment with verified network access. Next.js 16.2.9 compiled successfully, completed TypeScript, collected page data, generated static pages **47/47**, finalized page optimization, and emitted the complete route manifest. No product, package, font, or configuration change was required between attempts.

## TypeScript / diff

- `.\node_modules\.bin\tsc.cmd --noEmit --incremental false`: **PASS**, no diagnostics.
- `git diff --check`: **PASS**; normal Windows LF/CRLF notices are non-failures.

## Security / trust boundaries

- no authenticated identity is fabricated; actor truth is `Local reviewer` / this device;
- R6K persists no raw source diff;
- recording Human Decision requires no model call;
- recommendation state is not mutated;
- a draft durability failure never implies canonical success;
- canonical writes use the existing decision service and verified persistence/read-back behavior;
- there is no new canonical key, server writer, API, schema migration, silent rebase, silent eviction, blind overwrite, or optimistic success before persistence.

## Deferrals

- R6L: broader keyboard/focus and withdrawal work already assigned there;
- R6M: responsive shell/reflow;
- R6O: holistic convergence, including VG-K3, Recorded-chip harmonisation, magnification-only scrollbar glyphs, risk-reference checkbox accent, and cross-surface scalar-fact grammar.

## Freeze readiness

Claude acceptance, production build, the fresh full validation matrix, TypeScript, diff-check, formal evidence integrity, candidate-scope reconciliation, and protected-boundary integrity are green.

R6K is ready for its freeze commit. No freeze SHA is asserted before that commit exists.
