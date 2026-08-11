# R6E — Reviews Collection evidence

## Purpose and boundary

R6E replaces the R6D ready-state Review Queue placeholder with the production
Reviews Collection in R6D's supporting-left Queue. It is a deliberately narrow
collection milestone: it establishes the Queue projection and Review selection
entry point, without redesigning the selected Review or Overview.

R6E does not establish Evidence or Inspector, Requirements, Change workspace,
History, Human Decision, commands/global keyboard work, final
resizing/restoration hardening, authenticated-domain migration, or cutover.
Those remain later milestones.

## Accepted implementation scope

- The Queue is a pure projection of the existing real-adapter
  `WorkspaceSnapshot`, joined through the R6C `ReviewIndex`.
- `ReviewId` is the identity boundary: a Queue row exists only where the group
  summary, authoritative case and indexed `ReviewId` join. Malformed or
  synthetic rows without that join are excluded. No second Review identity,
  state, or store was introduced.
- Each row is native `ul > li > a` content, with a title, repository, textual
  triage state and quiet recency in Expanded mode. The selected route is exposed
  with `aria-current="page"` and the restrained selected treatment.
- Existing semantic Queue classification is reused. The single State filter
  operates on its four groups; collection preferences support semantic and None
  grouping. Title/repository search is trimmed, case-insensitive and in-memory
  only.
- Ordering is semantic group order, then valid `run.createdAt` descending,
  unknown chronology last, then lexical `ReviewId`.
- The grouping/filter preference is persisted through R6C's `reviews-queue`
  collection slot at version 1. Search is intentionally not persisted.
- The composed current production registry contains the R6D historical four
  actions plus `review/select`; `R6D_BOUND_ACTION_IDS` itself remains exactly
  its historical four.
- Plain row activation dispatches `review/select`. Native modified and middle
  link behaviour is preserved. In Narrow, activation moves the existing surface
  from Queue to Workspace after selection, with no added route effect.
- Expanded retains a 300px Queue and full row metadata; Compact uses the R6D
  presentation at 232px and yields repository/recency before title and textual
  triage state. This milestone adds no new resizing policy.
- The Queue remains `aside[aria-label="Review Queue"]`; accessible search and
  View options controls retain their native semantics and ARIA relationships.

## Compatibility and intentional exclusions

`/workspace` remains untouched. There is no reverse
`/workspace?reportId=` to `/reviews` bridge. R6D first-paint geometry,
WorkspaceHost and R6C remain unchanged, and R6F chrome or selected-Review /
Overview functionality was not implemented.

## Validation and scale evidence

Final freeze-preparation validation reran the deterministic R6E, R6D and R6C
suites, TypeScript, production build and `git diff --check` from this tree.
The R6E suite is 8/8, R6D is 23/23 and R6C is 36/36. The production build
passes with 47 routes/pages.

The R6E deterministic suite constructs a 500-row production-shaped collection
with long titles/repositories and all four semantic groups. It projects all 500
rows, retains semantic ordering and has deterministic substring search. No
production fixture route, pagination or virtualization was added.

Browser observations, screenshot details, and the Compact recovery record are
in [R6E validation evidence](../../evidence/r6e/R6E_VALIDATION_EVIDENCE.md).

## B1 evidence recovery

B1 was an evidence defect, not a production-source defect. The original
Compact capture came from a stale, effectively unstyled runtime and therefore
did not prove Compact. A fresh localhost:3000 runtime compiled `/reviews` from
the current source; the scoped `.rowMetadata` Compact rule was present in source
and served CSS, and its live computed display was `none`.

The accepted replacement, `evidence/r6e/R6E-compact.png`, is a genuine manual
Compact capture: `data-queue="compact"`, Queue 232px, Workspace 1208px, title
and textual triage state visible, repository/recency hidden and zero horizontal
overflow. Expanded evidence remains `data-queue="expanded"`, Queue 300px and
Workspace 1140px. No production correction was required, and B1 is resolved.

## Final accepted status

Accepted R6E Reviews Collection. Production Review Queue projection, semantic
grouping, local search and filtering, collection preferences, Review selection,
Narrow Queue-to-Workspace behaviour and collection accessibility are approved
for consumption by R6F and later milestones. R6F selected Review and Overview
functionality was not implemented in R6E.

Independent verdict: **ACCEPT R6E WITH NON-BLOCKING FOLLOW-UPS**

Freeze readiness: **READY TO FREEZE R6E**

This evidence record does not claim that a Git freeze commit, merge or push has
occurred.

## Remaining non-blocking follow-ups

1. `"Partial local history — "` can mislabel limitation text that is not
   actually historical.
2. There is no explicit named deterministic assertion for same-Review reselect
   being a noop without a duplicate push, or for stale `reviewId` yielding
   unavailable without route mutation.
3. There is no approximately 100-row deterministic/browser scale capture;
   present scale proof is small real data plus the deterministic 500-row case.
4. Screenshots do not specifically show selected plus focused together, the
   State filter dropdown open, the None-grouping view, or a selected Review
   hidden by the current view.
5. There is no explicit `/workspace?reportId=<valid>` browser capture, though
   `/workspace` and `/workspace?source=fixture&restore=1` were independently
   verified.
6. Any previously frozen R6C/R6D non-blocking follow-ups remain deferred unless
   superseded by accepted R6E work.
