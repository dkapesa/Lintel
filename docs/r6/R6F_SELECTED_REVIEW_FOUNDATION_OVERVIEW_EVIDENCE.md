# R6F selected Review foundation and Overview evidence

Status: accepted R6F evidence record. This record confirms independent acceptance and freeze readiness; it does not claim that the Git freeze commit or merge has occurred.

## Purpose and boundary

R6F establishes the real selected Review foundation and its bounded Overview. It preserves the R6C selected-Review and route authority, R6E collection authority, and the R6D shell. It does not establish substantive Evidence / Inspector, Requirements, Change, History comparison, Human Decision workflow, command or keyboard architecture, final responsive geometry, cutover, or R6G+ record substance.

## Source-of-truth architecture

| R6F output | Canonical source |
| --- | --- |
| Selected Review and mode | R6C `WorkstationState` |
| Durable identity and Current Case | R6C `ReviewId`, `ReviewIndex`, and `resolveCurrentCase` |
| Loading and store standing | real-adapter `WorkspaceSnapshot.status` |
| Review content | `CaseDetail` |
| Mode order and routes | R6C `REVIEW_MODES` and `formatRoute` |
| Recommendation and Human Decision labels | existing canonical maps |
| Verification counts | existing `openBlockingCount` and `evidenceComposition` |

`projectSelectedReview` is a read-only projection. It owns no second selected Review, mode, identity, or store; its ready result deliberately remains a bounded R6F view rather than `CaseDetail`.

## Selected Review foundation and Overview

The ready foundation is shared across the five native Review mode links: Overview, Change, Evidence, Requirements, and History. It keeps repository eyebrow, one Review-title `h1`, branch/author/verbatim `Updated {github.updatedAt}` context, the five-link mode navigation, and the mode outlet. It excludes the PR number, recommendation, Human Decision, risk, run metadata, action bar, buttons, and Inspector controls from persistent identity.

Overview has exactly five sibling sections:

1. Lintel recommendation
2. Human Decision
3. Verification standing
4. Next step
5. Analysis basis

Recommendation is always attributed as `Lintel recommends {label}.` Human Decision is a separate read-only orientation: unavailable, pending, and recorded states are source-derived; it omits read errors, rationale, references, fingerprints, entry IDs, accepted-risk references, and mutation controls. Verification standing uses a bounded semantic `dl`; severe findings are recorded, never described with invented lifecycle wording. Next step is a pure deterministic first-match projection and never instructs the user to approve, reject, record, or reaffirm. Analysis basis parses only `run.createdAt`; `github.updatedAt` remains opaque and is displayed verbatim. No risk score, run ID, Case ID, detailed comparison, or R6G+ object is introduced.

## Selected Workspace projection states

The single projection distinguishes `none`, `resolving`, `store-unavailable`, `review-unavailable`, and `ready`.

- `none` retains the R6D no-selection copy and the idle `/workspace` compatibility link.
- `resolving` has one `h1`, exactly the five Overview labels, restrained skeletons, and no identity or mode strip.
- `store-unavailable` exposes only a safe snapshot reason.
- `review-unavailable` preserves the requested route, keeps the Queue usable, provides Back to Reviews, and silently replaces nothing.
- `ready` resolves the current Case through the frozen index and renders the shared foundation/outlet.

Rendering adds no route effects. Native mode links use R6C route formatting; an unmodified primary click dispatches the existing `mode/activate` action, while modified and middle clicks stay native. The current workstation action registry evolves from five to exactly six actions by appending `mode/activate`; the historical R6D registry remains exactly four.

## Route, responsive, accessibility, and compatibility results

Different-mode activation uses canonical R6C Push semantics; same-mode activation leaves URL/history unchanged; Back and Forward restore URL and current-link state. The selected Review foundation has no `/workspace?reportId=` escape. Legacy `/workspace` remains operational outside the R6 shell and is unchanged.

R6F consumes the R6D layout bands without adding a breakpoint. At 899px, Queue return precedes Workspace content, all five links remain available, and document/body/client widths were 899/899/899 with no horizontal overflow. The existing R6D main/focus shell remains intact: one `main#workspace-primary`, existing focus registration, one `h1` per selected state, five Overview `h2`s, native navigation/current-page semantics, and semantic standing rows.

Two inherited live regions remain: the shell live region and the R6E Review Collection feedback live region. R6F adds zero live regions and removed the third, migration-host live region.

## Deterministic validation

The R6F suite has 14 substantive grouped tests covering the five projection states, frozen Case resolution, Queue independence, recommendation/decision separation, decision discriminants, exact mode routes, action/history semantics, next-step precedence, omission boundaries, opaque `github.updatedAt`, analysis basis, verification standing, and the six-current/four-historical registries. Final command results are recorded in `evidence/r6f/R6F_VALIDATION_EVIDENCE.md`.

## Visual evidence and limitations

The visual inventory is in `evidence/r6f/R6F_VALIDATION_EVIDENCE.md`. `R6F-1440-ready.png` is explicitly fixture-backed legacy `/workspace?source=fixture` evidence, not an R6F production-route frame. `R6F-1440-mode-navigation-composite.png` is explicitly a labelled composite of separate native mode captures.

`R6F-1440-recorded-human-decision.png` is a 1440px native R6F Overview capture. It is backed by a controlled browser-local test decision recorded through the existing Human Decision UI. It shows separately attributed Lintel recommendation and recorded Human Decision, restrained actor/time/applicability details, and no rationale, fingerprint, or mutation control.

`store-unavailable` was exercised live in the independent Opus acceptance review. The reviewer verified its distinct truthful heading, safe snapshot reason, absence of fabricated Review identity and mode strip, and no silent replacement. No retained native screenshot was produced. The later freeze-preparation browser prohibited reproducing the necessary storage-denial condition; no workaround or source change was attempted. This non-blocking evidence limitation remains covered by the pure projection, source inspection, deterministic validation, and independent live verification.

## Long-session error classification A

Classification A — inherited development-session observation: a long multi-tab session intermittently logged `Maximum update depth exceeded` at unchanged protected `WorkstationProvider.tsx:308`. A fresh isolated selected-Review load had no console entries and no R6F file appeared in the stack. It is retained as an inherited non-blocking follow-up, not assigned to R6F.

## Final independent verdict

**ACCEPT R6F WITH NON-BLOCKING FOLLOW-UPS**

**READY TO FREEZE R6F**

## Final non-blocking follow-ups

1. Consider later consolidation of the two inherited live regions.
2. Add direct behavioural assertions for currently source/independent-review-proven projection branches.
3. Replace weak source-string tripwires where useful.
4. Review HIGH + CRITICAL → “high-severity” terminology.
5. Consider explicitly gating ready projection on `selectedReview.status === "available"`.
6. Harden the inherited WorkstationProvider storage listener and adapter-error handling.
7. Harden SourceType display fallback handling.
8. Retain the store-unavailable no-screenshot limitation: behaviour was independently live-verified and remains deterministic/source covered.
9. Keep earlier accepted R6C/R6D/R6E follow-ups deferred unless superseded.

No production source change is made by this freeze-preparation record. Nothing is staged, committed, pushed, or merged here.
