# R6D — Production Shell and Unified Left Region evidence

> **Status:** Accepted R6D production shell and unified left region.
> Authenticated workstation shell ownership, unified supporting-left
> composition, R6C application-state integration, route/history behaviour,
> first-paint geometry, destination migration and compatibility boundaries are
> approved for consumption by R6E and later milestones. No R6E product
> functionality was implemented in R6D.
>
> **Final independent review verdict:** `ACCEPT R6D WITH NON-BLOCKING FOLLOW-UPS`.
>
> **READY TO FREEZE R6D**
>
> This evidence does not claim that the Git freeze, commit, or merge has
> already occurred.

## 1. Outcome

The authenticated workstation route group now owns `/reviews`, selected Review
paths, `/policies`, `/integrations`, and `/settings`. Its production shape is a
single supporting-left application plane beside one dominant Workspace. The
Inspector seam is present as a component boundary and returns `null`.

The existing `/workspace` product and all named compatibility routes remain on
their prior shell and product owners. No R6E-or-later collection, selected
Review product chrome, Inspector content, decision UI, command system, or final
responsive/resizing system was added.

## 2. CP0 environment and baseline

- Baseline: `e179aeb3ff737d924ecb4571530cd11e63b0510e`.
- Initial worktree: clean.
- `node_modules`: absent.
- `npm ci`: passed from the existing lockfile; 22 packages installed, no
  package metadata or lockfile change.
- Untouched `npx tsc --noEmit --incremental false`: passed.
- Untouched `npm run build`: the sandboxed attempt failed only because the
  existing Google Font imports could not reach `fonts.googleapis.com`; the same
  command passed once the existing build was allowed network access. No font,
  dependency, or build workaround was added.

## 3. Shell and route ownership

`app/(workstation)/layout.tsx` is the one route-group shell owner. It renders,
in order, the route-local first-paint script, `WorkstationProvider`, and
`WorkstationShell`. The route group adds no URL segment.

Owned routes:

- `/reviews`
- `/reviews/<ReviewId>`
- `/reviews/<ReviewId>/<overview|change|evidence|requirements|history>`
- `/policies`
- `/integrations`
- `/settings`

`app/(workstation)/reviews/[[...segments]]/page.tsx` is deliberately a null
migration host. R6C `parseRoute` remains the semantic grammar authority.

`app/layout.tsx` remains the root owner of fonts, global CSS, theme bootstrap,
`ThemeProvider`, and `GuidedTour`. Its only R6D change is adding `/reviews` and
`/policies` to the existing product-light classification.

## 4. Unified supporting-left structure

The rendered shell structure is:

```text
WorkstationShell
├── skip link
├── live region
├── supporting-left (not a landmark)
│   ├── product identity
│   ├── Application destinations navigation
│   ├── inset divider on Reviews
│   ├── Review Queue aside on Reviews
│   └── manual compact/expand control on Reviews outside Narrow
├── main#workspace-primary[data-region="workspace"]
└── InspectorHost → null
```

Navigation and Queue use one background and one outer boundary. Their only
internal separation is an inset divider. There is no independent full-height
Queue sidebar, card shell, shadow, or rounded sidebar container.

Visible application destinations are exactly Reviews, Policies, Integrations,
and Settings with canonical hrefs `/reviews`, `/policies`, `/integrations`, and
`/settings`.

## 5. R6C controller integration

`WorkstationProvider` is the sole React owner of `WorkstationState`. It owns:

- the authoritative read-only Workspace snapshot/status;
- a fresh R6C `ReviewIndex` per accepted snapshot;
- R6C effective layout under the injected R6D policy;
- structural and semantic restoration;
- sealed reconciliation;
- R6C workstation/review-context write-back;
- one pending semantic route slot;
- route effects and echo suppression;
- live announcements;
- a DOM `FocusRegistry` implementing `FocusValidity`.

The provider uses `createRealWorkspaceAdapter` read-only. No adapter, domain,
report-history, Human Decision, or R6C source changed.

The Decision-draft context input is derived only when the existing
`decisionMutation` capability supplies its canonical case subject. Sample and
unavailable capabilities remain explicitly unavailable. No draft storage or UI
is implemented.

## 6. Four bound actions

The production source binds exactly:

1. `route/navigate`
2. `route/apply`
3. `queue/set-manual-preference`
4. `queue/show-narrow-surface`

`queue/show-narrow-surface` is used for system route-derived surface
reconciliation and the visible Narrow `Review Queue` return control. No other
R6C action ID is bound in the production route group; there is no global key
handler.

## 7. Restoration, reconciliation, and routing

Phase A runs once at controller mount with a synthetic loading snapshot. It
establishes route structure and persisted manual Queue preference without
asserting Review truth. Phase B runs on the first terminal authoritative
status. `ready` and `empty` seal restoration; `unavailable` does not. A later
`ready`/`empty` result after `unavailable` performs the one final Phase B and
seals. Every later accepted refresh goes through `reconcile` only.

The pre-seal R6D surface exposes no Review-scoped semantic mutation. Manual
Queue preference is persisted and re-read through the R6C namespace.

Route effects:

- an unmodified primary destination click dispatches `route/navigate` and
  applies its single Push;
- modifier/middle-click retains native Link behavior;
- browser pathname changes dispatch `route/apply` and add no history entry;
- restoration alone applies Replace for bare selected-Review completion and
  invalid-route fallback;
- canonical Review+mode and all idle destination routes apply None;
- a parsed canonical pathname equal to `state.routePath` is suppressed by the
  echo guard.

Review-bearing `route/apply` intents are held only while status is `loading`.
The pending slot is last-wins and releases for `ready`, `empty`, or
`unavailable`. Non-Review-bearing intents always apply immediately.

## 8. First paint and provisional geometry

`lib/r6d/first-paint.ts` builds the first child script of the workstation route
group. It writes exactly `data-band`, `data-queue`, and
`data-narrow-surface` on `document.documentElement`. It reads only the R6C
workstation key as a tolerant manual-preference hint; it performs no write,
remove, migration, or storage enumeration.

Narrow URL derivation is `/reviews` → Queue and selected Review path →
Workspace. The provider sets the same attributes in an SSR-safe layout effect
and removes them on unmount. Raw production HTML placed the first-paint body at
byte index 4407 and shell skip-link copy at 5793, proving the script precedes
shell markup under the current Next production renderer. The guarded root-head
fallback was not required.

Hard-reload evidence:

- 1100 stored Compact: `data-band=compact`, `data-queue=compact`, grid
  `232px 868px` before and after the reload observation;
- 899 idle Reviews: `data-narrow-surface=queue`, grid `899.2px 0px`;
- 899 selected Review: `data-narrow-surface=workspace`, grid `0px 899.2px`.

The browser surface does not expose a frame-freeze hook between inline-script
execution and React hydration, so the exact pre-hydration pixel frame could not
be separately frozen. The independent pure first-paint/effectiveQueue matrix,
raw script ordering, and hard-reload geometry are the available evidence. No
claim beyond that evidence is made.

All geometry is explicitly provisional and expires in R6M:

- Expanded 300px;
- Compact 232px;
- navigation-only 88px;
- yielded 0px;
- useful Workspace minimum 720px;
- future Inspector minimum/provisional widths 300/336px;
- Spacious ≥1600, Standard 1360–1599, Compact 1100–1359,
  Constrained 900–1099, Narrow <900;
- Compact/Constrained with an open pane would yield the Queue;
- Inspector presentation policy is pane, sheet, sequential by band.

## 9. Queue, Workspace, and Inspector boundaries

The Queue renders only its labelled host, heading, status copy, authoritative
reason, compatibility links, and manual preference control. It renders no row,
selection, group, count, search, filter, collection schema, or traversal.

Bare `/reviews` is idle and never reopens prior selection. An available selected
Review renders only resolved authoritative repository/PR identity, projected
authoritative title, plain committed mode label, and the exact legacy Workspace
link by CaseId. Loading, storage-unavailable, and proven absence are distinct.
No verdict, recommendation, risk, readiness, requirement count, decision,
metric, mode-tab, Focus, Commands, or Inspector control is rendered.

At Narrow, exactly one Reviews surface is visible. The Queue and Workspace stay
mounted, while CSS gives one a zero track and hides it from interaction. A
selected Review begins in Workspace and exposes `Review Queue`; activating it
shows Queue while retaining the selected Review and route. The Queue exposes no
fake path back to selected Workspace.

`InspectorHost.tsx` returns `null`. Production server and hydrated DOM checks
found zero Inspector regions/labels and exactly one main. The normal shell has
exactly two grid tracks.

## 10. Destination migration and legacy compatibility

- Existing Review Policies content moved to `/policies` without redesign.
- `/review-policies` redirects to `/policies` and preserves query parameters.
- Existing Integrations content moved into the route group; only `AppShell`
  ownership was removed.
- Existing Settings content moved into the route group; only the client-owned
  `AppShell` wrapper was removed.
- `/new`, `/report`, `/home`, `/review-operations`, `/team`, `/github-action`,
  `/slack-handoff`, `/workspace`, and `/workspace-legacy` retain their prior
  owners.

The legacy global navigation now shows exactly the four frozen destination
concepts. Legacy family attribution is Reviews for `/workspace`, `/new`,
`/report`, `/home`, `/review-operations`; Integrations for `/github-action`,
`/slack-handoff`; Settings for `/team`; Policies for the compatibility policy
route. `ShellIcon` remains exported. Brand Review links target `/reviews`.
Legacy controls which still open `/workspace` truthfully say Verification
Workspace.

## 11. Accessibility and focus

- one `main#workspace-primary[data-region="workspace"]`, owning scroll and
  focus;
- `nav[aria-label="Application destinations"]`;
- Reviews-only `aside[aria-label="Review Queue"]`;
- text labels remain visible in Expanded, Compact, and navigation-only states;
- active destinations use `aria-current="page"`;
- icons are aria-hidden;
- first shell control is `Skip to Workspace`; browser activation focused
  `main#workspace-primary`;
- the collapse control is a real button with `aria-expanded` and
  `aria-controls`; focus remained on it across 300→232px change;
- FocusRegistry registers Queue, Workspace primary, and destination main only;
- active and independently keyboard-focused destinations were captured
  together;
- reduced-motion and forced-colours rules preserve state/focus distinctions;
- all measured workstation viewports had zero horizontal document overflow.

## 12. Deterministic and build validation

Final commands and results:

```text
node --experimental-strip-types --no-warnings --import ./lib/r6c/__validation__/node-hooks.mjs ./lib/r6d/__validation__/r6d.validation.ts
R6D validation: 23/23 passed

node --experimental-strip-types --no-warnings --import ./lib/r6c/__validation__/node-hooks.mjs ./lib/r6c/__validation__/r6c.validation.ts
R6C validation: 36/36 passed

npx tsc --noEmit --incremental false
passed

npm run build
passed; 47 application routes generated/registered

git diff --check
passed
```

The R6D suite covers the LayoutPolicy bands, exhaustive effectiveQueue matrix,
first-paint equivalence, Narrow derivation, exactly four bound actions and
invocation equivalence, route-effect table, echo guard, semantic snapshot gate,
two-phase sealing, last-wins pending intent, R6C persistence round-trip, manual
preference preservation, idle Reviews, exact IA/family attribution, production
copy lint, loading/unavailable/absence semantics, Inspector absence, single
main ownership, route-local first-child script order, authenticated light-theme
lock ownership, and restored-canonical-route Narrow presentation.

## 13. Browser, route, and history evidence

Observed production behavior:

- `/reviews`: idle Workspace; ready authoritative Queue status;
- bare valid Review: replaced to canonical `/overview` once and resolved the
  stored Review;
- canonical Review+mode hard load: requested and observed URL identical;
- malformed Review mode: replaced to `/reviews` with no selected Review;
- `/policies`, `/integrations`, `/settings`: correct active destination,
  exactly one main, zero Inspector nodes;
- `/review-policies?policy=standard-readiness&view=all`: redirected to
  `/policies?policy=standard-readiness&view=all`;
- destination click `/reviews`→`/settings`, then one browser Back returned to
  `/reviews` and one Forward returned to `/settings`, demonstrating one Push
  and no Back/Forward-added entry;
- ready state observed on port 3000;
- empty state observed on a clean port-3001 origin with exact empty copy;
- selected Review under that empty snapshot rendered proven-absence copy and
  no substitute;
- loading copy was present in raw selected-Review server markup;
- the controlled browser blocked the attempted sandboxed storage-denial page
  under its URL security policy. Unavailable behavior is therefore proven by
  the deterministic suite and storage-safe production boundary, but was not
  manually captured in a denied-storage browser frame;
- browser console warnings/errors: zero in both final browser tabs.

Compatibility routes `/new`, `/report`, `/home`, `/review-operations`, `/team`,
`/github-action`, `/slack-handoff`, and `/workspace-legacy` all rendered their
existing headings with no workstation geometry attributes.

Public hard loads `/`, `/product`, and `/trust` carried none of
`data-band`, `data-queue`, or `data-narrow-surface`.

## 14. Viewport and visual evidence

- `evidence/r6d/R6D-1440-reviews-idle.png`
- `evidence/r6d/R6D-1440-settings.png`
- `evidence/r6d/R6D-1100-compact-supporting-left.png`
- `evidence/r6d/R6D-899-narrow-queue.png`
- `evidence/r6d/R6D-899-selected-review-workspace.png`
- `evidence/r6d/R6D-destination-focus-visible.png`
- `evidence/r6d/R6D-1440-workspace-regression.png`
- `evidence/r6d/R6D-correction-dark-system-light-workstation.png`
- `evidence/r6d/R6D-correction-899-malformed-fallback-queue.png`

Measured two-track/absence checks passed at 1440, 1100, 1000, and 899. The
fractional 899px browser viewport initially exposed a CSS/JavaScript boundary
mismatch; the stylesheet was corrected to the actual `<900px` contract using
`max-width: 899.98px`, then the Narrow evidence was recaptured.

## 15. Protected scope and `/workspace` regression

Changed-path inspection found no modifications under the frozen public trees,
R6C, Workspace V2, Human Decision ledger, API routes, visual labs, Workspace
products, or protected global/app-shell styles. `package.json`,
`package-lock.json`, and `tsconfig.json` are unchanged.

`/workspace`, `/workspace?source=fixture`,
`/workspace?reportId=report-2026-07-17T17:55:53.533Z`, and
`/workspace?restore=1` all rendered their existing product, retained one main,
showed zero horizontal overflow, and carried no workstation geometry
attributes. The 1440 comparison capture is listed above.

## 16. Exact implementation scope

Created:

- `lib/r6d/layout-policy.ts`
- `lib/r6d/navigation.ts`
- `lib/r6d/first-paint.ts`
- `lib/r6d/controller-contract.ts`
- `lib/r6d/__validation__/r6d.validation.ts`
- `app/(workstation)/layout.tsx`
- `app/(workstation)/WorkstationProvider.tsx`
- `app/(workstation)/WorkstationShell.tsx`
- `app/(workstation)/SupportingLeft.tsx`
- `app/(workstation)/DestinationNav.tsx`
- `app/(workstation)/QueueRegion.tsx`
- `app/(workstation)/WorkspaceHost.tsx`
- `app/(workstation)/InspectorHost.tsx`
- `app/(workstation)/FocusRegistry.ts`
- `app/(workstation)/workstation-shell.module.css`
- `app/(workstation)/reviews/[[...segments]]/page.tsx`
- `app/(workstation)/policies/page.tsx`
- `docs/r6/R6D_PRODUCTION_SHELL_UNIFIED_LEFT_REGION_EVIDENCE.md`
- the nine evidence PNGs listed above.

Moved/adapted:

- `app/integrations/page.tsx` →
  `app/(workstation)/integrations/page.tsx`
- `app/settings/page.tsx` → `app/(workstation)/settings/page.tsx`
- `app/settings/settings-client.tsx` →
  `app/(workstation)/settings/settings-client.tsx`
- `app/review-policies/review-policies-client.tsx` →
  `app/(workstation)/policies/review-policies-client.tsx`

Modified:

- `app/layout.tsx`
- `app/nav-config.tsx`
- `app/app-shell.tsx`
- `app/review-policies/page.tsx`

No functional source was deleted; the four old page/client locations above are
recorded by Git as deletions paired with their moved route-group destinations.

## 17. Known limitations and deferred ownership

- Exact pre-hydration screenshot freezing and a manually denied-storage browser
  frame were unavailable in the controlled browser; the evidence boundaries
  are recorded above rather than hidden.
- Cross-Case Review grouping remains conservative because the current
  authoritative projection cannot prove durable upstream identity.
- Widths, breakpoints, resizing, and stored widths are provisional until R6M.
- R6E owns Queue rows, grouping/counts/search/filter/traversal, collection
  schemas, and Queue→Workspace selection.
- R6F owns selected Review foundation, chrome, mode navigation, selection
  binding, and anchors.
- R6G–R6L own Inspector, Requirements, Change Focus, History/comparison,
  Human Decision, and Commands/keyboard vocabulary respectively.
- R6N–R6P retain later administrative redistribution, hardening, and final
  `/workspace` cutover responsibilities.

Nothing was staged, committed, or merged while producing R6D implementation
evidence.

## 18. Final blocker disposition

The initial independent implementation review found exactly two blockers and
returned `REQUIRES BOUNDED CORRECTIONS`. The bounded correction pass resolved
both. The final independent bounded re-review returned
`ACCEPT R6D WITH NON-BLOCKING FOLLOW-UPS`. No R6D blocking correction remains.
The corrections made no architecture change and no change under `lib/r6c/**`.

### B1 — authenticated forced-light ownership

Cause: the workstation first-paint path correctly selected light, but the new
workstation owner never acquired `ThemeProvider`'s existing forced-theme lock.
After hydration, a stored `system` preference under a dark system could
therefore resolve the workstation back to dark.

Correction: `WorkstationProvider` now mirrors the existing authenticated-shell
layout-effect pattern exactly: `setForcedTheme("light")` on mount and
`setForcedTheme(null)` on cleanup. No theme context, persistence, root logic,
provider semantics, or CSS override was added or changed.

**Status: RESOLVED.**

Targeted evidence used an actual dark system preference and the visible theme
control to set the stored public preference to `system`:

- `/reviews` at DOMContentLoaded and after hydration: `data-theme=light`,
  computed `color-scheme=light`, body/root canvas `rgb(245, 243, 238)`;
- `/settings` at DOMContentLoaded and after hydration: the same light result;
- `/policies` and `/integrations`: the same light result;
- soft `/reviews` → `/workspace` → Back to `/reviews`: light → light → light;
- workstation → legacy → public: light → light → dark, proving the workstation
  lock releases and the stored dark-system public preference resumes;
- final browser warnings/errors: zero;
- screenshot:
  `evidence/r6d/R6D-correction-dark-system-light-workstation.png`.

The controlled browser still cannot freeze the interval before
DOMContentLoaded. The root pre-paint contract remains independently covered by
the existing inline-script ordering evidence; DOMContentLoaded and hydrated
measurements showed no workstation dark correction.

### B2 — restored route owns Narrow presentation

Cause: Phase A and Phase B derived `narrowSurface` from the incoming `pathname`
after R6C restoration had already rejected it and returned canonical
`state.routePath`. The invalid-path effect also committed restored state without
the presentation reconciliation. A malformed Review-shaped URL therefore
retained `workspace` after replacing to `/reviews`.

Correction: `reconcileRestoredNarrowPresentation` now dispatches the existing
`queue/show-narrow-surface` action with source `system`, deriving its surface
from `restoration.state.routePath`. Structural initialization, Phase A, Phase B,
and the invalid-path restoration effect all use this shared seam. The
presentation action returns no route effect; the original restoration result
remains the only source of Replace.

**Status: RESOLVED.**

The new deterministic regression exercises real `restoreInitialState` output
through that presentation seam for:

- bare `/reviews` → `/reviews` → Queue;
- selected canonical Review → unchanged canonical path → Workspace;
- `/reviews/abc123/not-a-mode` under ready and loading snapshots → one
  restoration Replace to `/reviews` → Queue;
- `/reviews/abc123/overview/extra` → one restoration Replace to `/reviews` →
  Queue;
- every presentation reconciliation → route effect None.

At the 899px browser viewport, both malformed forms ended at `/reviews` with
`data-narrow-surface=queue`, `899.2px 0px` grid tracks, supporting-left visible,
Workspace width zero, all four destination links visible, no Review Queue
return control, zero Inspector nodes, and zero horizontal overflow. Evidence:
`evidence/r6d/R6D-correction-899-malformed-fallback-queue.png`.

The accepted route/history table remains unchanged: canonical selected Review
None; bare selected Review one Replace to completed mode; malformed route one
Replace to fallback; deliberate destination one Push; Back/Forward no added
entry. Browser Push → Back → Forward remained `/settings` → `/reviews` →
`/settings`.

### Full validation after correction

```text
R6D deterministic suite: 23/23 passed
R6C deterministic suite: 36/36 passed
npx tsc --noEmit --incremental false: passed
npm run build: passed; 47 application routes generated/registered
browser console warnings/errors caused by the correction: zero
```

The sandboxed build first encountered the repository's existing external
Google Fonts network boundary, and process-fork restrictions also prevented a
normal local dev worker. The completed production build used Next's official
temporary mocked font-response hook and worker-thread mode; both temporary
harness files were removed afterward. No package metadata, lockfile, Next
configuration, font source, or production application source was retained from
that harness.

### Preserved non-blocking follow-ups

These accepted follow-ups remain explicitly non-blocking and were not changed:

- M1 — runtime geometry has two owners: TypeScript policy constants and CSS
  literals. Primary later owner: R6M.
- M2 — production-copy lint does not cover every JSX-expression string literal.
  Hardening follow-up only.
- M3 — a rare unavailable-read / successful-write storage case could write
  default workstation preference state. Hardening follow-up only.
- M4 — Back/Forward between Reviews and another workstation destination can
  transiently commit an empty `main` before R6C route state catches up. Later
  integration concern for R6E/R6F.
- N1 — CSS Narrow boundary `899.98px` versus JS `<900px`. Note only.
- N2 — legacy `/home` and `/review-operations` zero-main behaviour is
  pre-existing. Note only.
- N3 — two R6D deterministic tests are near-tautological while substantive
  coverage exists elsewhere. Note only.

### Frozen R6C non-blocking follow-ups

The following seven accepted R6C follow-ups remain untouched:

- active-only mode-anchor retention during reconciliation;
- loading/unavailable selected-Review representation overlap;
- applicability-coverage wording versus deterministic sweep;
- offline compiler-path dependency;
- coarse container-level persistence invalidation;
- Inspector open/trail downstream binding distinction;
- unreachable `stored-review-unavailable` branch.

### Action-set evidence note

The action-set invariant still holds at exactly four actions, but the automated
source scan does not currently include every `lib/r6d/*.ts` binding location
after the B2 correction. This is evidence-strength debt only and may be
addressed alongside M2/hardening; it is not a blocker.

Nothing was staged, committed, or merged during R6D implementation, correction,
or final evidence preparation.
