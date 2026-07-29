# R4F.3 — Operational Home and Review Operations

> **Milestone:** R4F.3 — Operational Home and Review Operations  
> **Production routes:** `/home` and `/review-operations`  
> **Authority:** Accepted R4A–R4E contracts, R4F.1 shared logged-in product system, and R4F.2 lifecycle boundaries  
> **Boundary:** Browser-local operational orientation and cross-review records only; Workspace, New Review, Case File, administration, integrations and governance retain their accepted owners

## Outcome and route ownership

R4F.3 adds the smallest dedicated logged-in Operational Home at `/home` and matures `/review-operations` into the dense cross-review engineering-record surface. The public `/` route remains the public landing page and is unchanged.

No logged-in operational landing route existed before R4F.3. The accepted R4F.1 route-family matrix explicitly classified `/` as public and assigned `/review-operations` to the operational shell. `/home` was therefore required to give orientation a truthful logged-in owner without turning the public landing into application chrome or making Review Operations responsible for both orientation and dense record work.

Both `/home` and `/review-operations` use the accepted R4F.1 `SharedProductShell` operational branch. Operations now opens `/home`; its contextual destinations are Operational Home, Review Operations and the existing Team boundaries route. `/workspace` remains outside the shared shell under the specialist `WorkspaceR4Client`. Administrative routes retain the administrative branch.

The logged-in lifecycle is:

`Operational Home → Review Operations → Workspace → Case File → New Review`

Each destination retains one responsibility:

- `/home`: orient, resume recent real work, and expose the next truthful route.
- `/review-operations`: search, filter, sort, select and compare across stored review records.
- `/workspace`: investigate one selected review and perform accountable supported actions.
- `/report`: inspect and export the durable read-oriented Case File.
- `/new`: create and persist another canonical review.

## Canonical record source

`lib/operational-review-projection.ts` is the single R4F.3 read-time projection. In real mode it calls `createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default" })`. It therefore inherits the same:

- validated `lintel.reportHistory.v1` source and ten-entry cap;
- raw-diff exclusion;
- exact report and case identity;
- canonical evidence hierarchy and derived missing/unverified proof;
- merge requirements and exact condition progress;
- canonical run, head and base identity;
- Human Decision ledger projection and applicability;
- Readiness Delta and Review Diff comparison;
- empty, unavailable and partial-history semantics;
- read-only storage guard

used by canonical Workspace and Case File. R4F.3 creates no parser, operational database, cache, durable recents store or storage namespace. URL state is presentation state only and is never product authority.

Explicit `?demo=1` selects the existing controlled Workspace fixture adapter and fixed R4F.3-only display metadata. It does not read or mix real history. The route discloses sample status, the absence of organisation analytics, live monitoring, authoritative user activity, shared assignment state and external writes. Sample records have no durable Report identity, so exact Workspace and Case File actions are withheld. `?demo=empty` is a controlled empty demonstration for layout review.

## Operational classification and precedence

Every record has exactly one `primaryGroup`, evaluated in this order:

1. **Stale Human Decision** — a recorded Human Decision exists but is not applicable to the current head, needs reaffirmation, is unbound/current-head-unavailable, or was withdrawn.
2. **Reviewed** — a recorded Human Decision is applicable to the current head and does not need reaffirmation. Accepted risk remains cautionary and is not a clean approval.
3. **Needs attention** — no preceding group applies and one or more current canonical facts require attention: Block, Tests required or Review required recommendation; open blocking requirement; missing/unverified proof; stale evidence; stale/unavailable requirement; deterministic analysis fallback; failed analysis; or unavailable Human Decision authority.
4. **Ready for assessment** — a current canonical case exists, no applicable or stale Human Decision owns placement, and none of the attention facts applies.

This ordering deliberately keeps Human Decision applicability separate from the Lintel recommendation. `Approve` is never displayed as `Approved`; only a current applicable Human Decision produces Reviewed. Accepted risk does not remove proof gaps or blockers.

Cross-cutting Views use the same record facts but need not be mutually exclusive. A Reviewed record with a current blocker can appear in both Reviewed and Needs attention while retaining Reviewed as its one primary group. Counts are computed by the same predicates as filtered results and are not presented as additive totals.

## Operational views and URL contract

The implemented visible heading is **Views**. Values are:

| View | URL value | Predicate |
| --- | --- | --- |
| All reviews | omitted or `view=all` | Every projected record |
| Needs attention | `view=needs-attention` | At least one current attention reason |
| Ready for assessment | `view=ready-for-assessment` | Primary group is Ready for assessment |
| Reviewed | `view=reviewed` | Human Decision is applicable |
| Stale Human Decision | `view=stale-decision` | Human Decision is recorded but not applicable |
| Missing proof | `view=missing-proof` | Missing/unverified proof count is greater than zero |
| Recently changed | `view=recently-changed` | Canonical compatible run comparison produced a change summary |

View selection is URL-owned, refresh-safe, direct-linkable and Browser-Back compatible. Invalid `view` values fall back to All reviews without becoming authority or mutating records.

The rest of the URL state is:

- `q`: bounded case-insensitive search.
- `recommendation`: exact recorded recommendation.
- `risk`: exact risk band.
- `blockers`: `present` or `none`.
- `proof`: `missing` or `complete`.
- `decision`: `none`, `applicable`, `stale` or `unavailable`.
- `source`: an exact source value present in the current projection.
- `analysis`: an exact analysis-path value present in the current projection.
- `sort`: a documented sort value.
- `selected`: exact durable Report identity in real mode or exact sample identity in demo mode.
- `demo`: explicit demonstration mode only.

Invalid filters and sort values are ignored safely. Search uses replace navigation so keystrokes do not create a long Browser Back history; deliberate view, filter, sort and selection changes use ordinary navigation history.

## Operational Home architecture

`/home` is a calm orientation surface rather than a dashboard. It contains:

1. compact route identity and primary route action;
2. truthful demo or partial-history boundary where applicable;
3. linked operational Views and exact counts;
4. Needs attention only when records qualify;
5. Ready for assessment only when records qualify;
6. Stale Human Decisions only when records qualify;
7. bounded Recent reviews;
8. Recently changed only when comparison exists;
9. one concise browser-local boundary.

With real records, the newest meaningful record provides **Continue most recent review**, and New Review remains secondary. This is explicitly not a fabricated last-viewed state. With no real records, New Review is primary and the route renders no zero-filled dashboard grid. With demonstration data, New Review remains primary because sample records cannot supply a durable exact Workspace destination.

Every summary count links to the exact Review Operations view that computes it. Counts are derived from one projection and are withheld while loading.

## Recent reviews

Recent reviews use exact projected identity, title, repository/PR, recommendation, Human Decision applicability, current run/head where available and `updatedAt`.

`updatedAt` is the latest valid timestamp among:

- durable Report-history `createdAt`;
- canonical run `createdAt` or `completedAt`;
- current projected Human Decision `recordedAt`;
- established compatible comparison timestamp.

Records are ordered newest first with exact report identity as the stable tie-break and bounded to five. No page visit, last-viewed time, author, reviewer, avatar or activity feed is invented. Because the list is projected fresh from current canonical history, removed records disappear and no stale recents link is retained.

## Recently changed

Real Recently changed records require `CaseDetail.history.status === "comparison"`. R4F.3 uses the existing canonical comparison and may state:

- recommendation transition;
- risk-score transition;
- opened, cleared or reopened Review Diff records;
- evidence that became stale;
- current Human Decision reassessment;
- a new canonical run when no more specific comparison fact is available.

The list is ordered by current comparison run timestamp and bounded to five. Initial or unavailable comparison produces no changed summary and the section is omitted when no records qualify. Ordinary page visits never qualify.

Demonstration comparison copy is fixed, visibly labelled fixture metadata and isolated from real history.

## Review Operations architecture

The shared shell retains the route identity **Review Operations** and its browser-local description. The route-owned content uses the eyebrow **Cross-review engineering records** and the single page H1 **Inspect review records**, avoiding a duplicated route title while preserving one logical heading hierarchy.

Wide and normal layouts use a real semantic table plus a compact route-owned selection summary. Columns are:

1. Review;
2. Repository / PR;
3. Recommendation;
4. Risk;
5. Blockers / proof;
6. Human Decision;
7. Run / head;
8. Updated;
9. Source at wide width.

The Review cell contains the one row-selection button. There are no nested row actions; exact route actions live once in the selected-record summary. Selection remains distinct from focus and uses neutral selection, while focus remains blue.

Column priority is Review → Repository/PR → Recommendation → Risk → blockers/proof → Human Decision → run/head → Updated → Source. Source is removed first below wide layout. Below tablet responsibility the table transforms into structured technical records with visible field labels instead of squeezing desktop columns. On mobile, a selected record becomes a sequential summary with explicit **Back to records**.

Every truncated title and technical value retains its full `title` value. Run, head, repository and exact requested identity use Geist Mono.

The local-data boundary states that the surface covers browser-local reports, a maximum of ten retained entries, no organisation telemetry, no monitoring, no activity feed and no shared assignments.

## Search, filters and sorting

Search is case-insensitive and covers only existing fields:

- review title;
- repository;
- PR number;
- report ID;
- run ID;
- head SHA;
- Lintel recommendation;
- Human Decision label/outcome.

It is immediate, clearable, bounded by the existing ten-entry history and never searches source code or fixture data in real mode.

Filters compose as an intersection after the selected View. A single global **Reset filters** action appears in the filter-control region only when search, filters or non-default sort are resettable; search **Clear** remains query-specific. Reset preserves the established contract: it clears search, filters, sort and selection while retaining the current View and explicit demo boundary, returns focus to search on wide layouts or the filter trigger on compact layouts, and lets the polite result count announce the resolved set. On narrow/tablet/mobile the same filter DOM becomes a contained modal drawer. Escape closes it, focus is contained, and closing restores the trigger.

Sort values and stable rules are:

| Sort | URL value | Order |
| --- | --- | --- |
| Most recently recorded | omitted or `sort=recent` | meaningful timestamp descending |
| Oldest recorded | `sort=oldest` | meaningful timestamp ascending |
| Highest risk | `sort=risk-high` | risk band descending |
| Lowest risk | `sort=risk-low` | risk band ascending |
| Most blockers | `sort=blockers` | blockers then proof gaps descending |
| Review title | `sort=title` | locale-aware title ascending |
| Repository / PR | `sort=repository` | repository then PR ascending |
| Human Decision state | `sort=decision` | documented decision-state rank then label |

Every comparator ends with exact report identity as a total tie-break. Sort survives refresh and is exposed through the select plus sortable table headings with `aria-sort`.

## Record selection and navigation

Selection uses the `selected` URL parameter. Sorting retains it. If view/search/filter composition removes a currently resolved record, selection clears and a polite announcement explains why. If an explicitly requested identity does not resolve at all, the summary retains and displays that identity as unavailable and does not silently select another record.

Real selected records expose:

- exact identity and repository/PR;
- recommendation and risk;
- blockers and proof gaps;
- stale evidence/requirements;
- Human Decision state and applicability;
- current run/head;
- source and analysis path;
- updated timestamp;
- current attention reasons;
- comparison summary where available;
- **Open in Workspace** using `/workspace?reportId=<exact durable id>`;
- **Open Case File** using `/report?reportId=<exact durable id>`.

Neither action passes recommendation, risk, decision or other projected display state as authority. Workspace and Case File revalidate the exact identity. Browser Back restores the operational URL state.

The summary does not render findings, evidence traversal, Conditions editing, Human Decision recording, command palette, Focus mode or complete Case File content.

## No-Queue-duplication boundary

The Workspace Queue is selected-review orientation inside the specialist verification workstation. It groups and selects reviews so one Workspace can own mode, object, Inspector and decision state.

Review Operations is a separate cross-review engineering-record surface. It supports URL-addressable operational Views, exact-field search, composing filters, deterministic sorts, table comparison and route selection before entering a specialist route. It does not reproduce Workspace modes, investigation selection, Queue collapse/group state, evidence traversal, readiness bar or Human Decision entry.

## Empty, loading, unavailable and partial states

- **Loading:** route identity remains; counts, rows and selected detail are withheld.
- **Empty real history:** Views remain reachable with zero truthful counts, the stable route-level New Review action remains, the body does not duplicate it, and no sample is loaded. Operational Home likewise retains its hero New Review and Review Operations actions without repeating them in the empty body.
- **Filtered empty:** the route states that valid records exist but no record matches; the single filter-region Reset remains available when resettable state exists.
- **Unavailable:** the exact adapter reason is shown, record actions are absent, Retry local read and New Review are offered, and no sample count appears.
- **Partial:** all valid projected records remain; canonical adapter limitations name omitted/unavailable history. No invalid record erases valid records.
- **Requested selection unavailable:** the requested identity is retained and no substitute is selected.

## Responsive behaviour

- **Wide (≥1440px):** accepted operational Rail, compact identity, dense nine-column table and sticky compact summary.
- **Normal (1200–1439px):** Source column drops first; primary engineering columns remain.
- **Narrow (960–1199px):** table remains dense; selection summary follows records.
- **Tablet (640–959px):** filters use a contained drawer; table becomes labelled structured technical records.
- **Mobile (<640px):** single principal sequence; records transform into compact technical records; selected summary replaces the record surface and provides Back to records.
- **Effective 200% zoom:** CSS viewport responsibility resolves to tablet/mobile composition; no document-level horizontal overflow is required.

Operational Home moves from two balanced work regions to one sequential flow. Recent and changed entries become compact list records. No essential information depends on hover.

At 1199px and below, the shared Views navigation remains one bounded horizontal strip. Complete labels and their counts never ellipsise, overflow remains local to the strip, and a restrained thin scrollbar/neutral edge makes additional views discoverable without gradients or carousel controls. Initial URL selection and keyboard focus adjust only the strip's horizontal scroll position so the current or focused view is fully visible. Scrolling uses `auto`, preserving reduced-motion behaviour and avoiding document-level horizontal overflow.

## Keyboard and accessibility

The routes retain the R4F.1 skip link, one `main`, route-heading focus, current-route semantics and shared visible blue focus.

Operational Home exposes native links for New Review, Continue, Views, recent records and Review Operations.

Review Operations exposes native search, selects, sortable-heading buttons, row selection buttons, the one conditional Reset, exact route links, filter drawer and mobile Back. The filter drawer traps focus, closes with Escape and restores its trigger. Every focused View is horizontally revealed in full without moving document focus or changing URL authority. Tab order follows views → search/sort/filter → results → selected summary. No global shortcut or second command palette was added.

The semantic table has real headings and `aria-sort`. Mobile records preserve the same field labels. Result counts and selection clearing use polite live regions. Selection uses `aria-pressed` and a neutral row background; focus uses a separate blue outline. Status is always named in text, not colour alone.

Reduced-motion CSS suppresses nonessential transition duration. Touch-facing controls are at least 44px in compact responsibility, and dense desktop controls retain at least 32px.

## Visual system

The accepted R4 light product roles remain intact:

- charcoal/black for primary action and durable chrome;
- neutral grey for selection, borders and provenance;
- blue for focus and direct interaction;
- green for genuinely ready states and the recorded **Approve** Human Decision outcome;
- amber for tests, proof and accepted-risk caution;
- orange for review attention;
- red for blocking or failed outcomes;
- neutral grey for ordinary applicability and non-outcome state.

Human Decision colour is outcome-owned: Approve is green; Approve with accepted risk and Tests required are amber; Review required is orange; Request changes and Blocked are red; Defer decision and No Human Decision are neutral. Applicability is rendered as separate supporting text: applicable/current, withdrawn and lineage-neutral states are neutral; predating, unbound or current-head-unavailable states use warning treatment. Applicability never recolours a Blocked outcome green, and these presentation rules do not alter Reviewed classification or decision authority.

The pages use compact application typography, restrained dividers, limited cards, no decorative metrics, no marketing-scale headings and no added shadow system.

## Performance boundaries

R4F.3 performs:

- one canonical adapter read per route load/retry;
- one bounded projection over at most ten retained records;
- memoised view/search/filter/sort composition;
- stable exact identifiers;
- bounded Recent and Recently changed lists of five;
- no polling, event stream, monitoring, layout loop, graph layout or data-grid dependency;
- no durable writes for view, filter, sort, search, selection, recents or demo state.

## Inspection expansion record

The required R4 inputs, R4F.1 route matrix, `/review-operations`, route registry, shell, styling and listed canonical libraries were inspected. Inspection expanded only to:

- `lib/operations-projection.ts`: direct dependency of the previous Review Operations route, needed to confirm its earlier Queue-aligned grouping and Team sharing contract.
- `lib/workspace-v2/queue-projection.ts` and `read-only-storage.ts`: direct canonical-adapter dependencies needed to avoid forking grouping/partial-history truth or introducing read-time writes.
- `lib/workspace-v2/adapter.ts` and `fixture-adapter.ts`: required to use the accepted real/explicit-demo adapter boundary.
- `app/layout.tsx`: required to give the new logged-in route the accepted first-paint light theme.
- `app/administrative-document.module.css`: direct prior route stylesheet, needed to identify and replace only Review Operations-owned responsive styling.
- `package.json`: required to use only supported validation commands and confirm no test/dependency script.

No broad unrelated route or library audit was performed.

## Known limitations

- Browser-local history remains capped at ten records.
- Older Reports without canonical run manifests show run/head/comparison unavailable and cannot appear in Recently changed.
- Missing proof remains a derived read-only presentation of canonical evidence status.
- A cross-cutting Needs attention count can overlap Reviewed because current blockers do not erase a valid applicable Human Decision.
- The operational projection does not create last-viewed activity, organisation aggregation, assignments or monitoring.
- Demonstration records intentionally withhold exact Workspace/Case File actions because their fixture identities are not durable Report identities.
- Full adversarial cross-browser, screen-reader and large-history acceptance remains R4G work.

## R4F.4 handoff

R4F.4 owns Integrations, System and Settings maturity: GitHub App capability truth, GitHub Action Blueprint, Slack Export-only, provider/configuration scope and instrumented usage only where real. It must not turn operational Views into monitoring, reinterpret local counts as organisation telemetry, or move selected-review authority out of Workspace.
