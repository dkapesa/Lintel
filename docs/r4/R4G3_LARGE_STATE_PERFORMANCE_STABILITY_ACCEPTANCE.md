# R4G.3 — Large-State, Performance and Stability Acceptance

> **Milestone:** R4G.3
> **Status:** Machine acceptance complete with two bounded production corrections; R4G.4 manual/final freeze remains.
> **Runtime:** production build on disposable `http://r4g3.localhost:3000`
> **Authority:** current production implementation and accepted R4A–R4F, R4G.1 and R4G.2 contracts

## Outcome

Lintel remained bounded, exact-identity-safe and operationally stable at its current browser-local limits. Report history retained 10 valid Reports, exact duplicate analysis did not grow the collection, and an attempted eleventh distinct Report evicted only the oldest. The removed identity failed closed in Workspace and Case File without fixture or neighbouring-record substitution.

The separate Human Decision implementation retained the newest 80 entries in a compiled in-memory boundary check and deduplicated an exact retry. One genuine controlled `Defer decision` was recorded through the UI and correctly classified as current-head-unavailable/stale. Eighty UI decisions were not fabricated for a benchmark.

One defect was demonstrated: Review Operations search was coupled directly to asynchronous URL replacement, so rapid query changes could lag for seconds and an obsolete query could reassert after later navigation. A local query projection plus cancellable 150 ms URL replacement corrected the issue. No schema, key, cap, route ownership, dependency or authority model changed.

The accepted Workspace screenshots also demonstrated a bounded layout defect: with the Queue and Inspector docked at 1600×1000, long controlled identifiers expanded the Workspace's implicit inner grid column beyond the central shell track. The Inspector therefore covered part of the Command palette and Open next inspection controls. An explicit `minmax(0, 1fr)` Workspace column corrected the sizing contract without changing shell tracks, panel widths, breakpoints, overlay responsibility, labels or visual identity.

## Canonical limits

| Boundary | Accepted implementation |
| --- | --- |
| Report history | 10 newest valid Reports (`lib/report-history.ts`) |
| Human Decision ledger | 80 entries per Report ledger (`lib/human-decision-ledger.ts`) |
| Decision reference arrays | 20 unique IDs per array |
| Local/legacy decision history | 60 events, separate from ledger |
| Real Workspace Queue and Review Operations | same 10-Report projection |
| Compatible Workspace comparison candidates | 9 |
| Review Map | 3 nodes in each first six stages; 1 Readiness; 1 Human Decision |
| Integrations | 8 current records (5 static, 3 environment-resolved) |
| Review Policies | 7 bundled records |

Findings, evidence and requirements have no independent collection-count constant. They are constrained by the validated Report/input contracts. R4G.3 does not invent a cap. Controlled dense Reports observed 5/15/20 and 3/11/14 records respectively.

## Report-history acceptance

The disposable origin was exercised at zero, one, one below cap, cap and cap+1 through supported New Review flows. At 10, Home, Operations, Workspace and Settings agreed on the count. The cap+1 Report became `2026-07-30T22:06:08.937Z`; the evicted `2026-07-30T21:37:20.874Z` resolved to explicit unavailable states on both exact routes.

An initial exact duplicate and a later exact duplicate returned the existing Report identity and left the count unchanged. Settings' destructive dialog read back 10 and proposed zero, explicitly excluding Human Decision ledgers; ten cancel cycles left history unchanged. Durable surfaces exposed file-only context and did not retain raw diff.

## Human Decision ledger acceptance

The unchanged production module was compiled to a temporary directory and exercised in memory at 0, 1, 79, 80 and 81 entries. Retention was 0, 1, 79, 80 and 80; at 81 the oldest retained reason advanced from entry 1 to entry 2. An exact idempotent retry stayed at 80 with the same latest entry ID. Twenty-five reference IDs normalized to 20.

The UI-created controlled decision was deliberately `Defer decision`, with rationale and the required acknowledgement that no recorded head existed. Workspace read-back displayed `Defer decision · Current head unavailable`; Home counted one Stale Human Decision. Recommendation remained `Tests required` and was not promoted into a decision.

## Large-state route behaviour

Operational Home showed exact counts at 10 Reports: All 10, Needs attention 10, Ready 0, Reviewed 0, Stale Human Decision 1, Missing proof 10 and Recently changed 0. Classification precedence gave the stale Human Decision label to the newest record without removing its attention work.

Review Operations rendered exactly 10 rows. At 1024×768 it retained one selected row/detail and one responsive dialog with no horizontal document overflow. Selection filtered out and evicted identities cleared without replacement.

The densest Workspace exercised all five modes, 50 mode transitions, 50 Queue cycles, 50 Inspector cycles, 25 palette cycles, 25 selected-review transitions and 20 exit/restore pairs. No stale Inspector, duplicate overlay, duplicate record or horizontal overflow was observed. The palette contained 25 upstream-bounded commands at max history.

The Case File retained exact identity, eight sequential Review Map stages, full inspectable record sections, one local export group and explicit raw-diff exclusion. The map showed at most three records in its first six stages and one each for Readiness and Human Decision; no graph canvas appeared. Exact unavailable Case File resolution did not mutate history.

## Repeated New Review and administration

Eleven distinct deterministic analyses were attempted, with 10 retained; analyses 2–10 took 1,072–1,383 ms in the browser harness. An initial exact duplicate took 1,464 ms; the later cap fixture duplicate returned the same Report in 4,088 ms including an explicit 2,500 ms observation wait. Source/profile/analysis controls, backward steps and repeated route abandonment were exercised without a paid/model-assisted call. The available model-assisted radio was inspected but never submitted.

Integrations completed 10 select/filter-clear cycles over 8 records. Review Policies completed 10 select/filter/reset cycles over 7 records. Settings completed 10 destructive-dialog cancel cycles with exactly one dialog during each open state and none afterward. Team completed 20 section transitions and continued to render no authenticated people, membership or organisation activity.

## Route-transition soak

Fifty production transitions covered all nine owned routes, browser Back, browser Forward and actual reload. Exact Report IDs were used for Workspace and Case File. All authority markers matched and no transition ended with a dialog. Browser-harness wall times were 317–1,128 ms, median 613 ms. Twenty additional Report→Workspace pairs restored the exact Report and controlled decision every time.

These timings include browser/RPC overhead and are local regression evidence, not production guarantees. Snapshot size varied by route and did not grow monotonically. Heap, listeners and timers were not exposed, so no unsupported leak claim is made.

## Network, storage and layout

The browser did not expose request/resource timing. Source inspection confirms the Integrations mount/retry effect makes exactly three same-origin reads in one `Promise.all`, is keyed only by explicit `retryKey` and aborts on unmount; it contains no polling. Presentation filtering performs no fetch. No model-assisted analysis, GitHub import or external write was invoked.

Origin `localStorage` serialization was unavailable, so byte size and parse/write timing are not claimed. Settings supplied exact counts; canonical caps and raw-diff rejection remained visible. Storage keys were unchanged.

CLS entries were unavailable. At 1600×1000 the Workspace baseline main/H1 rectangles were `(316,0,932,1000)` and `(332,46.4,841.2,31.3125)`. Collapsing supporting panels intentionally widened the main plane. Opening the command palette left the collapsed background rectangles and 1600 px body width unchanged; restored Queue geometry exactly matched baseline. Horizontal overflow remained zero.

Post-acceptance review of `07_workspace_dense_evidence_1600x1000.png` and `24_route_soak_final_state.png` showed that zero document overflow did not prevent descendant underpaint: the main rectangle ended at x 1248 and the Inspector began at x 1248, but the implicit Workspace column made the header/readiness rows 1155.25 px wide and extended them to x 1471.25. Before correction, Command reached x 1329.25 and Open next inspection reached x 1374.03. After `app/workspace/workspace-r4.module.css` explicitly constrained the inner column, the header/readiness boundary is x 1248, Command ends at x 1106.00, Open next inspection ends at x 1200.80, the Inspector remains 352 px, and document/body width remains 1600/1600.

The bounded layout regression covered Overview, Evidence, Requirements and History with both panels docked, Queue collapse, Inspector close, and Focus mode enter/exit. At 1280×800 the Inspector retained the accepted 380 px modal-drawer responsibility while the Queue remained docked. At 1024×768 the Queue retained its accepted 290 px modal-drawer responsibility and the Inspector was closed. Overlay backgrounds were inert, complete accessible names and native buttons were unchanged, focus outlines remained inside their surfaces, and the browser console reported no warnings or errors.

## Performance and correction evidence

The corrected Review Operations local search projection completed 25 alternating updates in 27–45 ms (median 30 ms) and converged the URL after the 150 ms debounce. Before correction, completed replacements lagged roughly 1.5–3.2 seconds and an obsolete no-match query could apply after navigation.

The Workspace layout correction is one CSS grid declaration. It changes no runtime collection, persistence, authority or performance path; the dense controlled review was reused only for the requested layout/accessibility regression rather than repeating the accepted stress and route-soak work.

Focused DOM counts stayed bounded: Home 249, Operations 483, selected Operations 533, Workspace max Queue 410, Evidence 578, Requirements 564 and History 401. Console warning/error count after the final soak was zero.

The correction in `app/review-operations/review-operations-client.tsx` keeps local query state, cancels prior timeout work, preserves the local query during other URL changes and clears pending work on reset/unmount. The correction in `app/workspace/workspace-r4.module.css` prevents intrinsic descendant width from enlarging the Workspace's inner grid column beyond its reserved shell track. Neighbour checks covered the already accepted search scenarios plus the focused Workspace layout, responsive responsibility, accessibility, build and TypeScript matrix.

## Unavailable facilities

The attached browser did not expose User-Agent, page Performance API/navigation/resource timing, PerformanceObserver long-task/layout-shift entries, heap/memory, actual request logs, serialized origin storage, or listener/timer enumeration. CPU/network throttling was not intentionally applied, but an authoritative throttling-status API and hardware detail were also unavailable. These items are recorded as unavailable rather than passed.

## R4G.4 carryovers and freeze requirements

R4G.4 still owns the accepted manual items: exact responsive viewport matrix, genuine 200% zoom, screen-reader testing, reduced-motion runtime, touch, full hardware-keyboard checks and genuine short-height modal evidence.

Final freeze must also confirm the R4G.3 source correction and documentation, retain no dependency/storage-key/laboratory/landing change, stop temporary servers, restore generated artifacts and leave all human review packages untracked. R4 as a whole is not marked complete here.

## Evidence

The untracked `R4G3_HUMAN_REVIEW_PACKAGE/` contains 24 required production screenshots, exact limits, stress matrices, correction evidence, storage/network/layout boundaries and JSON/CSV summaries.
