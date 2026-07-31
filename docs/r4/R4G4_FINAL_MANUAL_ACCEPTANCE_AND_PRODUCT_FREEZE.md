# R4G.4 — Final Manual Acceptance and Product Freeze

> **Milestone:** R4G.4 — Final manual acceptance and product freeze  
> **Date:** 31 July 2026  
> **Branch:** `r4g-final-quality-product-freeze`  
> **Decision:** Ready for R4 freeze. No demonstrated source defect remains. Named facility-limited checks remain explicit human carryovers and are not represented as passes.  
> **Evidence package:** `R4G4_HUMAN_REVIEW_PACKAGE/` is temporary, untracked and non-authoritative.

## Outcome

R4G.4 completed the final executable product pass across the nine production routes in scope:

`/home · /review-operations · /new · /report · /workspace · /integrations · /settings · /review-policies · /team`

The production build passed. Every route was exercised at exact CSS viewports of 1600×1000, 1280×800, 1024×768, 768×1024, 390×844 and 320×568. The final 1600×1000 and 390×844 sweeps found one `main`, one H1, zero document-level horizontal overflow and no stranded dialog on every route. The selected Workspace flow, mobile responsibility transfer, drawers, palette and consequential dialogs were exercised through the supported UI.

Two bounded source defects were demonstrated and corrected:

1. Shared consequential dialogs did not lock document scrolling at short heights. The dialog now preserves and restores the prior HTML/body inline overflow state.
2. Workspace modal isolation and mobile focus transfer could leave background ownership ambiguous or focus on `body`. Command Palette now owns inert isolation and restoration; mobile list, review and record transitions now receive a stable visible focus target and Back restores the invoking record.

The corrected behavior was re-run in the production build. No other demonstrated source defect remains.

## Authority and truth boundaries

- Lintel recommends; the accountable engineer decides.
- Recommendation, review status, task progress, requirement state, accepted risk and Human Decision remain separate records.
- `/workspace` remains the authoritative active investigation and accountable-action surface.
- `/report` remains the exact read-only Case File and does not become a second Workspace.
- Real mode uses validated browser-local Report history and never silently substitutes fixture content.
- Fixture coverage remained explicit through `?source=fixture` and was used only where a complete selected Workspace record was necessary.
- Hosted administration, authentication, collaboration, remote persistence, policy deployment/enforcement and organisation analytics remain outside R4.
- No external write or model call was used during acceptance.

## Final route ownership

| Family | Routes | Frozen R4 responsibility |
| --- | --- | --- |
| Public | `/` | Public landing page outside the logged-in product system; unchanged in R4G.4. |
| Operational | `/home`, `/review-operations`, `/new`, `/report` | Orient, create and inspect cross-review records; Case File remains durable and read-oriented. |
| Specialist | `/workspace` | Sustained selected-review investigation, requirement conditions and the sole Human Decision authority. |
| Administrative | `/integrations`, `/settings`, `/review-policies`, `/team` | Inspect configuration, bundled policy and browser/environment boundaries without hosted authority. |
| Protected reference | `/visual-lab/workspace-r4` | Accepted R4C visual authority; unchanged and never production data authority. |

Operational, specialist and administrative shells remain distinct. Unknown, removed or evicted identities fail closed; no stale recommendation, readiness, Inspector or Human Decision authority survives an invalid identity.

## Environment and origin isolation

- Validation used the production build on the isolated origin `http://r4g4.localhost:3000`.
- Ordinary `localhost` storage was not used.
- One disposable real Report was created through the supported deterministic New Review flow, exercised, and removed through the supported Settings clear-history action.
- Cleanup read-back showed zero durable Case Files and zero local Case Files.
- `/home`, `/workspace`, `/report` and `/review-operations` were then checked against the removed exact identity. They showed zero history, a required selection/create state, an explicit unavailable Case File and zero records respectively. No record was silently substituted.
- Raw diff input remained memory-only and was not persisted as durable review authority.

## Route and viewport acceptance

The exact matrix is recorded in the package `EXACT_VIEWPORT_MATRIX.md` and `FINAL_ROUTE_MATRIX.md`. Across all 54 route/viewport combinations:

- the requested CSS viewport equaled the observed CSS viewport;
- no route produced document-level horizontal overflow;
- each route exposed one main landmark and one H1;
- mobile navigation, labels and primary actions remained available;
- no modal or drawer remained open after its test;
- the final wide and mobile sweeps contained no focus on `body`.

Screenshots can exclude the browser scrollbar gutter, so some operational-shell PNG dimensions are 1585×991 or 375×811 while the browser-reported CSS viewport remained 1600×1000 or 390×844. Workspace captures used the complete CSS viewport. The measured CSS viewport, not bitmap dimensions, is the matrix authority.

## Responsive responsibility

- Wide and normal layouts retain route-family navigation and route-owned work.
- Tablet layouts preserve Workspace responsibility without compressing all four regions into competing columns.
- Mobile Workspace remains a sequence: review list → selected review → selected record.
- Opening a mobile record focuses the visible `Back to …` control; returning restores the exact invoking row.
- Closing the mobile Queue transfers to the review and focuses the Workspace main region.
- Valid restored mobile selection focuses the visible Back control; review-only restoration focuses the Workspace main region.
- At 320×568, all nine routes remained free of document-level horizontal overflow and retained complete action labels.

## Keyboard, focus and Escape

The attached browser genuinely exercised `Ctrl+K`, `Escape` and `Shift+Tab`, plus pointer-driven focus entry and restoration. It confirmed:

- Command Palette opens on its search input, locks body scrolling, inerts the background, closes on Escape and restores Workspace focus.
- Review Queue and Contextual Inspector drawers lock body scrolling, isolate the background, close on Escape and restore their exact invokers.
- Human Decision opens on Cancel, contains its own scroll at 960×400, keeps terminal actions reachable, closes on Escape and restores `Record Human Decision`.
- New Review source-change confirmation and Settings clear-history dialogs contain scrolling at 960×400, close on Escape and restore the exact invoking control.
- Review Operations filters remain contained at 960×400 and restore their invoker.
- No closed surface left stale `inert`, `aria-hidden`, dialog ownership or body scroll lock.

The attached browser did not reliably dispatch ordinary Tab, Enter or Space as hardware-keyboard input. Those specific activation and full tab-order checks remain manual. They are not recorded as passed.

## Modal, drawer and sticky safety

The final short-height checks used 960×400 for shared dialogs and 390×400 for the mobile administrative drawer, the closest layout where that drawer exists.

- Human Decision: 720×388 at y=6; internal scroll owned the long form; Cancel, record action and terminal controls remained reachable.
- Settings clear-history: document locked; internal dialog body scrolled; Cancel and destructive action remained reachable.
- New Review source change: document locked; contained body scrolled; draft was then cleared without creating a Report.
- Review Operations filters: contained dialog fit the viewport and exposed Close and result actions.
- Workspace Queue, Inspector and Command Palette: background inert and scroll lock existed only while open and were fully restored.
- Administrative navigation drawer: one Back control, contained at 390×400 and 390×844, with no duplicate action or document overflow.

Sticky and fixed surfaces were visually checked at wide, tablet, mobile and short-height sizes. No demonstrated overlap, hidden terminal action or background activation remained.

## Accessibility semantics

DOM/accessibility snapshots confirmed route landmarks, one H1/main per route, table structure in Review Operations, Workspace tablist ownership, named modal dialogs, descriptions, live regions and inert background state. Visible focus was captured in the mobile Workspace record state.

NVDA was not installed. Windows Narrator was installed and launched for a limited Settings-dialog sample, but spoken output and its virtual cursor were not observable through the attached browser. Full screen-reader reading order, announcement content and browse-mode operation therefore remain manual and are not represented as accepted runtime results.

## Zoom, reduced motion and touch

The browser exposed exact viewport control but no page-zoom, media-emulation or touch-input capability:

- Chrome/CUA zoom-key attempts left `innerWidth`, `clientWidth`, device-pixel ratio and visual viewport scale unchanged. Genuine 200% zoom was not achieved; screenshots 20–22 were not fabricated.
- Source inspection confirmed bounded `prefers-reduced-motion: reduce` rules for Workspace, operational, New Review, Case File and administrative surfaces, but runtime reduced-motion behavior could not be forced. Screenshot 24 was not fabricated.
- Pointer interactions covered the target actions without double execution or background activation, but they are not equivalent to real touch input. Touch acceptance remains manual.

Exact human procedures are in `ZOOM_200_MATRIX.md`, `REDUCED_MOTION_MATRIX.md`, `TOUCH_MATRIX.md` and `MANUAL_CARRYOVERS.md`.

## Storage-failure acceptance

The key-scoped storage failure injections inherited from R4G.1 could not be executed. Browser evaluation is read-only and the available browser capabilities expose no DevTools override or page-script injection. Broadly corrupting the isolated origin would not prove the required key-scoped behavior and was not used.

The following remain manual:

1. Team `lintel.teamWorkspaces.v1` read denial, truthful failure state, restoration and Retry against real storage truth.
2. New Review `lintel.reportHistory.v1` write denial, retained completed analysis, restoration and persistence Retry without rerunning analysis or duplicating the Report.

Source inspection remains consistent with the intended behavior, and exact reversible DevTools scripts are recorded in `STORAGE_FAILURE_MATRIX.md`. Screenshots 25 and 26 were not fabricated.

## Large-state and stability carry-forward

R4G.3 remains authoritative for the 10-Report and 80-entry Human Decision boundaries, cap+1 eviction, max-state rendering, repeated panels/dialogs and the 50-transition route soak. R4G.4 did not reopen those accepted results. Its final production build and route sweeps found no regression in affected route families.

## Duplicate action and decision authority audit

The final cross-route audit found no competing Human Decision authority and no duplicate primary action that changes the same record:

- Home and Review Operations orient or navigate.
- New Review owns intake and analysis creation.
- Workspace owns active investigation and Human Decision.
- Case File is read-only and navigates to Workspace for accountable action.
- Integrations and System expose bounded capability/system actions only.
- Policies browse and preview; profile selection remains New Review intake authority.
- Team exposes local responsibility truth and no collaboration mutation.

Responsive copies of an action are mutually exclusive presentations of one responsibility, not simultaneous competing authorities.

## Visual quality sweep

The final sweep covered the nine routes at wide and mobile sizes, plus Workspace tablet, Workspace Queue, selected record, Inspector, Command Palette, short-height Human Decision, shared dialogs and the administrative drawer. The accepted neutral/light application direction, route-family coherence, dense operational hierarchy, explicit provenance labels and Workspace dominance remain intact. No clipping, document overflow, route-identity loss or modal-background ownership defect remained in the demonstrated states.

## Evidence limitations

The human-review package contains 23 genuine PNGs. Required sequence numbers 20–22 and 24–26 are intentionally absent because the corresponding runtime condition could not be produced. Their manifest rows say `Not captured — manual`, with the precise reason and execution procedure. A missing required facility is a limitation, not a pass and not a source defect by itself.

## Source corrections

### Shared consequential dialog

`app/consequential-dialog.tsx` now stores prior inline overflow for `html` and `body`, locks both while open and restores the exact prior values on every cleanup path.

### Workspace modal and mobile focus ownership

`app/workspace/WorkspaceR4Client.tsx` now avoids claiming inert state already owned by another modal layer, gives Command Palette inert-background ownership and cleanup, marks its scrim as the modal scrim, refuses `document.body` as an invoker, focuses stable mobile list/review/record targets and restores the exact visible record invoker after mobile Back.

No storage key, schema, package, dependency, laboratory route or accepted authority contract changed.

## Validation

- `npm run build` — passed in the final production source state.
- `npx tsc --noEmit` — passed.
- Exact route/viewport sweeps — passed for 54 combinations.
- Final wide/mobile sweep — passed for all nine routes.
- Short-height modal/drawer checks — passed for the executable states listed above.
- Disposable Report cleanup and exact-identity negative read-back — passed.
- Generated artifacts are restored to their preflight hashes before handoff.
- Nothing is staged, committed or pushed by R4G.4.

## Freeze decision

R4 is ready for product freeze because no demonstrated source defect remains after bounded correction and regression. The freeze record does not convert unavailable facilities into passes. Human reviewers must execute the explicit genuine-zoom, hardware-keyboard, screen-reader, reduced-motion, touch and two key-scoped storage-failure procedures before claiming those individual checks as human-accepted.

R4G.1, R4G.2 and R4G.3 remain accepted and authoritative. R4G.4 closes the implementation-quality pass and supplies the final truthful review record.

## R5 boundary

R5 is not designed or implemented here. Any work involving authentication, organisations, collaboration, hosted/remote persistence, provider writes, policy deployment or enforcement, organisation analytics, expanded product strategy, new dependencies or a reopened visual system requires a separately authorised milestone and contract. The frozen R4 source and evidence do not imply or pre-authorise that work.

## Remaining known defects

No demonstrated source defect remains in R4G.4 scope.

The remaining items are facility-limited manual acceptance checks, not hidden passes:

- genuine Chrome 200% zoom;
- full physical/hardware keyboard activation and tab order;
- complete NVDA or Narrator reading/announcement pass;
- runtime reduced-motion emulation;
- real touch input;
- Team key-scoped storage read denial and Retry;
- New Review key-scoped Report-history write denial and persistence Retry.
