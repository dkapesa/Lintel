# R6J — History, Comparison and Readiness Movement — Final Evidence

## 1. Milestone outcome

R6J is accepted and ready for freeze, subject only to the final Git freeze commit. It is not yet committed, merged, published, or pushed.

## 2. Baseline

- Baseline: `6c81798eb9afa2f38d9a44996924adde5595d24d`
- Parent milestone: R6I — Change and Diff Working Surface

## 3. Delivered capability

R6J adds History mode for genuine browser-local canonical report history. The current analysis is compared only with a stored historical analysis for the same genuine review identity; a historical target can be selected through the existing `comparisonRunId` R6C seam. The surface renders bounded Readiness Movement and Review Diff, integrates the production-bound history action, and makes genuine public-GitHub-PR comparisons reachable through the accepted metadata plumbing.

## 4. Final action-registry state

The production-bound workstation registry contains exactly 11 actions:

1. `route/navigate`
2. `route/apply`
3. `queue/set-manual-preference`
4. `queue/show-narrow-surface`
5. `review/select`
6. `mode/activate`
7. `selection/set`
8. `inspector/open`
9. `inspector/close`
10. `inspector/traverse-relationship`
11. `history/set-comparison`

This is the current production-bound registry, not the complete declared `ACTION_IDS` set. The historical R6D production-bound boundary remains exactly four actions.

## 5. Comparison semantics

`history/set-comparison` accepts `runId | null`. A valid run ID selects a genuine current-Case history target; an invalid or unavailable target leaves state unchanged; selecting the same target is a no-op; and `null` clears explicit selection so the effective target falls back to `history.previous` where available. It has `routeEffect = none`, no durable navigation, no focus change, and state remains scoped per Review. Current analysis is always one side; the other side is a stored historical target. Historical-to-historical comparison is not supported. A mounted-session return does not reread persisted selection automatically; fresh restoration may recover a still-valid target and discards stale ones.

## 6. Human Decision boundary

Human Decision is entirely deferred from R6J. No Human Decision mutation, storage, or comparison behaviour was introduced.

## 7. Historical Inspector boundary

Historical Inspector support remains deferred because it would require an identity expansion outside R6J.

## 8. Reachability defect discovered by native evidence

Native evidence discovered that browser-local canonical runs from the public PR workflow lacked `headSha`, preventing comparison eligibility. It also established that generated reports hard-coded PR number `1`, risking false same-repository grouping for unrelated reports.

## 9. Bounded reachability correction

The accepted correction is limited to five existing files:

- `app/api/fetch-pr-diff/route.ts` projects optional genuine public-API `headSha` and `baseSha`.
- `app/api/generate-report/route.ts` forwards actual PR number and SHA metadata.
- `app/new/page.tsx` carries those fields through import, request, and client-fallback paths.
- `lib/report-generator.ts` accepts optional `pullRequestNumber` and writes `input.pullRequestNumber ?? 0`.
- `lib/workspace-v2/real-adapter.ts` requires both PR numbers to be positive before matching repository plus PR number.

Genuine public PRs retain their real positive number. Manual, pasted-diff, and sample reports use `0` and never become comparison candidates merely through a shared repository string. GitHub App code was untouched and no schema migration occurred.

## 10. Genuine native workflow

The genuine browser-local workflow used public GitHub PR `vercel/next.js` #63226, “Fix sendGAEvent function params and type clearly.” The first corrected analysis was Deterministic-only with genuine recorded head and no prior corrected applicable analysis. The second was for the same genuine PR and head, used Operational readiness review mode, and remained Deterministic-only analysis. The newest Review reached `/reviews/<reviewId>/history` with `history.status === "comparison"` without fixture data, localStorage injection, fake history, or a GitHub App bridge.

## 11. Genuine comparison result

The genuine comparison direction is **Unchanged**. No changed or regressed result was fabricated for evidence: the recommendation remained Tests required, risk remained 46, movement values were unchanged, and Review Diff reported unchanged counts. Legacy false-PR-#1 data was excluded from the comparison target.

## 12. Review Diff / Readiness presentation

Readiness Movement retains the bounded accepted presentation: recommendation is explicitly attributed to Lintel, risk is labelled Risk score, and no standalone readiness score was introduced. Review Diff material rows remain limited to reopened, added, changed, and cleared; unchanged remains count-only, rows are non-interactive, and no raw source-code diff is presented.

## 13. C6 reference-fidelity programme

The raw C6 Automations reference was directly inspected. The initial C6 | Lintel review returned `R6J REQUIRES BOUNDED VISUAL CONVERGENCE` and identified VG-J1 History-register structure, VG-J2 redundant orientation, VG-J3 link-blue non-interactive text, VG-J4 duplicate status pills, and VG-J5 Review Diff spacing. The bounded correction closed all five. A subsequent review found metadata clipping: partial short SHA, truncated source, and omitted late metadata. The final `history.module.css` micro-correction removed clipping, preserved atomic fields, retained the complete GitHub pull request label and seven-character short SHA, and permits only whole-field wrapping while preserving the flat register. Final verdict: **R6J REFERENCE FIDELITY ACCEPTED**.

## 14. Formal visual evidence

All frames were captured from the genuine Chrome browser-local session at 1440 x 900 CSS viewport, DPR 1, and 100% zoom.

| File | Dimensions | SHA-256 | What it proves | What it does not prove |
| --- | --- | --- | --- | --- |
| `evidence/r6j/R6J-1440-history-default-comparison.png` | 1440 x 900 | `90C192CB2C983DFA004F4C5D43CFE0B9401D664D4440610FB1993543824D2767` | Genuine populated History: current/comparison rows, selected target, complete source/head metadata, and beginning Readiness Movement. | Target click/keyboard behaviour, persistence, route stability, reconciliation, or transition timing. |
| `evidence/r6j/R6J-1440-history-comparison-detail.png` | 1440 x 900 | `5D468C1454072E884F00D6827886E37321CDD8F9CBA1A0546D445552B8C21874` | Genuine Unchanged Readiness Movement and Review Diff continuation. | Temporal interaction or persistence behaviour. |
| `evidence/r6j/R6J-1440-history-initial.png` | 1440 x 900 | `4A4AD4D8FF3C873923FA6D348550F50EED1CC3E9B251AF6DC880A64F741BA417` | Genuine corrected initial History state with no previous applicable analysis. | Populated-comparison interaction or target resolution. |

The formal set is exactly these three PNGs. There is no r4f2 screenshot, diagnostic PNG, MP4, or GIF.

## 15. Validation evidence

| Gate | Final result |
| --- | --- |
| R6J | 9/9 PASS |
| R6I | 13/13 PASS |
| R6H | 5/5 PASS |
| R6G | 11/11 PASS |
| R6F | 14/14 PASS |
| R6E | 8/8 PASS |
| R6D | 23/23 PASS |
| R6C | 36/36 PASS |
| TypeScript | PASS — `tsc --noEmit --incremental false` |
| Production build | PASS — `npm run build` / `next build` |
| Whitespace validation | PASS — `git diff --check` |

## 16. Security / trust boundaries

No raw diff was introduced into persisted History. Run IDs remain non-visible. No Human Decision mutation, historical Inspector identity expansion, schema migration, fabricated history, fake diff, fake status, raw fingerprint rendering, or GitHub App dependency was introduced. The reachability correction uses only existing public GitHub PR reads and canonical Git metadata.

## 17. Known non-blocking / deferred items

- Global shell geometry → R6M/R6O.
- Responsive resize, reflow, and restore → R6M.
- Cross-surface row harmonisation and holistic convergence → R6O.
- Historical Inspector remains deferred by identity constraints.
- The C6 column-header concept is not required for R6J and may be considered only in later holistic polish if still useful.

## 18. Freeze readiness

Functional acceptance is complete, native evidence is complete, reference fidelity is accepted, the production build and final validation matrix are green, and the exact scope is reconciled. R6J is ready for its freeze commit; at creation of this evidence record it is not yet committed, merged, or pushed.
