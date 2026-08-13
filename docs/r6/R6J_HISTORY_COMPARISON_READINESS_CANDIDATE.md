# R6J History, Comparison and Readiness Candidate

This is a PRE-NATIVE implementation candidate, not an accepted or frozen result.

## Source and comparison truth

One valid stored report is one history entry, bounded by the existing ten-entry browser-local history. The existing adapter retains same-PR candidates by repository plus pull-request number. The current analysis is always compared to one historical target; historical-to-historical comparison is not represented.

`history/set-comparison` accepts `{ id: "history/set-comparison", runId: string | null }`. A non-null id must be in the selected Case's canonical previous/comparisons set. Invalid ids are unavailable without state change; equal ids noop; null returns presentation to canonical `history.previous`. It has no route, durable-navigation, or focus effect.

`comparisonRunId` remains the existing R6C persisted seam. Mode changes preserve it, review switches reset it, and fresh restoration only retains a persisted id after canonical revalidation. No storage, schema, route, or local React selection state was added.

## History and comparison presentation

The register has one presentational current row sourced directly from the current Case and native-button historical rows sourced from each `RunComparisonView`. Internal run ids, fingerprints, ReviewDiff keys, and ContextRefs are not rendered. The selected target is visible through quiet selected/previous-applicable markers.

Readiness shows Direction, Lintel recommendation movement, Risk score movement, merge-condition movement, still blocking, blocker movement, test/evidence-gap movement, and conditional evidence freshness. Review Diff renders material rows only, in reopened, added, changed, cleared order, with truthful unchanged counts. Human Decision is entirely deferred to R6K.

## C6 raw-reference provenance and convergence

The attached C6 Cursor/Mobbin PDF was rendered and visually inspected directly. R6J targets high-fidelity convergence for the equivalent record-scanning surface, then awaits native side-by-side comparison.

### Direct matches

- Flat, single bordered register with small radius, no shadow, contiguous rows, hairline separators, and one document scroll.
- Compact technical row rhythm, restrained metadata, absolute UTC timestamps, quiet pills, and confident surrounding whitespace.
- No summary-tile or card proliferation; comparison detail is a flat continuation with rules and aligned rows.

### Lintel substitutions

- Cursor automation runs become verification analyses.
- Cursor status becomes an explicitly attributed Lintel recommendation and risk/orientation record.
- C6 selected-pill grammar becomes selected and previous-applicable comparison indicators.

### Necessary divergences

- C6 summary metrics, Trigger, Tools, Duration, test-run controls, menus, icons, and Cursor shell are absent because Lintel has no truthful equivalent capability.
- Lintel requires a current-to-historical orientation and Readiness/Review Diff continuation to expose canonical verification movement.

### Known pre-native avoidable divergences

- The candidate uses Lintel's existing surface tokens pending browser screenshot comparison; native measurement may require a bounded row-density or content-width adjustment.
- Native initial-state evidence now exists, but no populated comparison state was honestly available for perceptual comparison. No visual correction was performed.

## Native evidence capture

The attached C6 raw PDF was re-inspected before native capture. At a 1440 x 900 CSS viewport with no browser zoom override (the default 100% browser zoom), two genuine new R6J routes produced the initial History state:

- `/reviews/case%3A31%3Areport-2026-07-17T17%3A55%3A53.533Z/history` — `evidence/r6j/R6J-1440-history-initial.png`
- `/reviews/case%3A31%3Areport-2026-07-29T12%3A14%3A33.427Z/history` — `evidence/r6j/R6J-1440-history-initial-r4f2-validation.png`

Both visibly show the authenticated workstation frame, selected History mode, restrained orientation, and truthful copy: "No previous applicable analysis is available in this browser."

All three genuine persisted reviews available in this browser were initial History states; none had `history.status === "comparison"`, a previous-applicable target, an alternate target, or a truthful unavailable state. The normal intake supports user-supplied pasted diffs, public GitHub pull-request reads, and a session-only sample. No genuine same-PR source material was available, so no analysis was generated and no data was fabricated.

The still images do not prove target activation, keyboard behavior, route stability after comparison selection, persistence, reconciliation, transition behavior, or populated comparison/detail rendering. Those checks were not honestly producible because no historical target exists in the genuine initial states. The initial routes showed no Inspector, Human Decision content, raw run id, fingerprint, Review Diff row, or desktop horizontal overflow. Current and historical register-row semantics are likewise absent in the initial state and were not inferred from the stills. C6 | Lintel side-by-side review, visual-gap ledger, and any bounded convergence correction remain pending.

## Validation and scope

The initial candidate changed exactly seven protected existing paths and added exactly ten candidate paths (17 total). It correctly stopped when four frozen live-registry expectations were discovered. Adjudication then authorized only those four mechanical R6E-R6H validation expectation updates: the amended pre-native candidate changes eleven existing paths and adds ten new paths (21 total). No predecessor implementation or evidence was reopened; only the current live production-registry expectations advanced from ten to eleven. Native evidence, production build, independent review, final evidence, and visual freeze remain pending.

Initial visual-gap ledger: macro geometry; content width; row density; typography/metadata prominence; border/radius/separator contrast; selected state; focus/hover; scrolling.

## Bounded public-PR reachability correction

Native capture established that populated History was initially not honestly producible: browser-local canonical runs did not receive a genuine `headSha`, so the existing adapter correctly withheld comparison. Focused source tracing also established that generated reports used a hard-coded PR number of `1`, creating a false same-repository identity risk.

The protected correction changes only five existing source paths: `app/api/fetch-pr-diff/route.ts`, `app/api/generate-report/route.ts`, `app/new/page.tsx`, `lib/report-generator.ts`, and `lib/workspace-v2/real-adapter.ts`. A public GitHub PR import now carries its API-supplied real PR number and bounded `head.sha`/`base.sha` values through the existing report, canonical-run, and browser-local history seams. The client fallback applies the same values. No GitHub App dependency or storage bridge was added.

Reports without a genuine PR identity use number `0`; `sameReview` requires both report numbers to be positive before retaining the existing repository-plus-number comparison rule. Manual, pasted-diff, and sample inputs therefore cannot acquire historical comparison solely from a shared repository string. Missing head identity remains unavailable truthfully.

No schema, schema version, history key, raw-diff boundary, GitHub App store, Review identity provider, ContextRef, comparison action, Readiness Delta, or Review Diff implementation changed. Existing browser-local condition-progress keys include `report.pr.number`; historical records created under the former false `1` identity may no longer match. The reader safely falls back to an empty cleared set. Human Decision descriptive fingerprint identity also includes PR number; neither its storage nor R6K-owned logic was changed.

The two genuine initial-state PNGs remain valid evidence. Populated native evidence, C6 | Lintel side-by-side review, visual-gap adjudication, and convergence work remain pending; this correction does not claim native success.

The candidate now has exactly 16 modified existing paths and 12 new paths (including the two existing PNGs): 28 literal paths. No new screenshot or final evidence document was created.

The bounded correction passes R6J validation with 9/9 grouped checks, the unchanged R6I/R6H/R6G/R6F/R6E/R6D/R6C suites, TypeScript no-emit checking, and `git diff --check`. Native populated comparison remains the next gate.

## Reconciled native evidence — before C6 review

The earlier native limitation is now resolved through the genuine public GitHub PR workflow, not through a fixture, localStorage injection, fake run, or GitHub App bridge. The first corrected deterministic-only analysis of `vercel/next.js` PR #63226, “Fix sendGAEvent function params and type clearly,” had a genuine recorded head and truthfully showed no previous corrected applicable analysis. A second genuine analysis of that same PR used the Operational readiness review mode while remaining Deterministic-only. The newest real `/reviews/<reviewId>/history` surface then reached `history.status === "comparison"`; legacy false-PR-#1 data was not selected as the comparison target.

The comparison is genuinely **Unchanged**. The evidence does not embellish this result: both visible recommendations are Tests required, risk is 46 to 46, merge-condition, blocker, and test/evidence movement are zero, and the Review Diff reports unchanged counts.

The authoritative formal native set was captured in Chrome at a 1440 x 900 CSS viewport, DPR 1, and 100% page zoom. Exact encoded ReviewIds were not independently recoverable from the PNGs, so the route truth for every frame is `/reviews/<reviewId>/history`.

| File | Pixel dimensions | SHA-256 | Visible evidence |
| --- | --- | --- | --- |
| `evidence/r6j/R6J-1440-history-default-comparison.png` | 1440 x 900 | `7BF8CE99073836C7DF2E4611757DB91B5970A60FB708A5F284EFC0ABC13B4058` | Authenticated History surface for `vercel/next.js`; current and comparison analyses; actual UTC timestamps; attributed recommendation, risk, GitHub-pull-request source, short head, Previous applicable and Selected markers; beginning of Readiness movement. |
| `evidence/r6j/R6J-1440-history-comparison-detail.png` | 1440 x 900 | `4E3B9955C58CA7827774D16532E15EEDC0FB1F20010D2818AFFBE96E29622D5E` | Current-to-comparison orientation; Unchanged direction; recommendation, risk, merge-condition, blocker, and test/evidence movement; Review Diff with Findings 2 unchanged, Evidence 2 unchanged, Test gaps 4 unchanged, and Merge conditions 2 unchanged. It is Lintel-specific, not a direct C6 counterpart. |
| `evidence/r6j/R6J-1440-history-initial.png` | 1440 x 900 | `4A4AD4D8FF3C873923FA6D348550F50EED1CC3E9B251AF6DC880A64F741BA417` | The corrected `vercel/next.js` review title and authenticated History surface with the truthful no-previous-applicable message. Workflow provenance identifies it as the initial corrected PR #63226 analysis with recorded head. |

Stills prove rendered state only. They do not independently prove target click or keyboard behaviour, persistence, reconciliation, route stability over time, or transitions; deterministic validation and genuine workflow observation remain the evidence for those claims. The formal PNG set is exactly the three files above. The prior `R6J-1440-history-initial-r4f2-validation.png` is absent; no diagnostic/full-workstation screenshot or MP4 is in the repository evidence set.

C6 | Lintel side-by-side perceptual review is pending. Reference fidelity is not accepted, no convergence correction has been performed, production build remains pending, and independent final acceptance remains pending.

The stale retired-PNG assertion was replaced with an exact three-file formal-set assertion. R6J validation is now 9/9 PASS, TypeScript no-emit and `git diff --check` pass, and native evidence reconciliation is complete. The candidate is ready for C6 | Lintel side-by-side review; it is not accepted, frozen, visually converged, or production-built.

## Bounded C6 convergence correction — corrected native evidence

Claude identified five R6J-local avoidable History presentation gaps: flattening the populated register (VG-J1), removing the redundant orientation block (VG-J2), neutralising non-interactive labels/counts (VG-J3), removing the duplicate previous-applicable/selected pill treatment (VG-J4), and tightening Review Diff rhythm (VG-J5). Terra implemented that bounded correction only in the existing History presentation components and stylesheet; no History semantics, comparison state, identity, persistence, Readiness Movement, or Review Diff data changed.

The genuine populated Chrome states were then recaptured at 1440 x 900 CSS viewport, DPR 1, and 100% zoom. `R6J-1440-history-default-comparison.png` is 162,250 bytes with SHA-256 `78403F1C92D65AA80A312A97E69E8E94405EACEE31BC26A8B25536FE01B2FBFE`; it visibly shows the flat equal-weight current/comparison register, one Selected marker, no nested comparison card, and the start of Readiness movement for the genuine `vercel/next.js` PR #63226 comparison. `R6J-1440-history-comparison-detail.png` is 146,761 bytes with SHA-256 `F4C5543128D138122731FFA7C1CEA59FBFBC8C23E06129ED2BA471F0F4D8C22A`; it visibly retains the Unchanged Readiness Movement and Review Diff semantics with neutral labels/counts and tighter document rhythm. `R6J-1440-history-initial.png` remains byte-identical at 118,199 bytes and SHA-256 `4A4AD4D8FF3C873923FA6D348550F50EED1CC3E9B251AF6DC880A64F741BA417`.

These corrected stills establish rendered presentation only; they do not independently prove target activation, keyboard behaviour, persistence, reconciliation, route stability, or transitions. Final Claude C6 fidelity acceptance, production build, and freeze remain pending.

## Final register metadata-fit native evidence

Final Claude review found one remaining metadata-fit regression in the otherwise closed VG-J1 through VG-J5 register treatment: the former desktop clipping could show partial source/head fields. The bounded CSS micro-correction removed that clipping and allows only complete metadata field units to flow within the same flat register row.

The populated Chrome frames were recaptured at 1440 x 900 CSS viewport, DPR 1, and 100% zoom. `R6J-1440-history-default-comparison.png` is 165,407 bytes with SHA-256 `90C192CB2C983DFA004F4C5D43CFE0B9401D664D4440610FB1993543824D2767`; both genuine rows visibly retain complete `GitHub pull request` and `Head 7e56f0b` text, with the source/head fields wrapping whole rather than clipping. `R6J-1440-history-comparison-detail.png` is 149,948 bytes with SHA-256 `5D468C1454072E884F00D6827886E37321CDD8F9CBA1A0546D445552B8C21874`; it preserves the genuine Unchanged Readiness Movement and flat neutral Review Diff treatment. The initial frame remains byte-identical at SHA-256 `4A4AD4D8FF3C873923FA6D348550F50EED1CC3E9B251AF6DC880A64F741BA417`.

Final Claude visual acceptance, production build, and freeze remain pending.

## Final acceptance disposition

This retained candidate record is superseded as the active acceptance record by `R6J_HISTORY_COMPARISON_READINESS_EVIDENCE.md`. R6J reference fidelity is accepted, the final production build and inherited validation matrix are green, and the candidate is ready for freeze commit; it remains uncommitted, unmerged, and unpushed at this point.
