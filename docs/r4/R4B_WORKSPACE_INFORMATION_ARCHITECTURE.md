# R4B Workspace Information Architecture

> **Milestone:** R4B — Workspace Information and Interaction Architecture
> **Status:** Binding R4B contract pending human acceptance
> **Scope:** Binding information ownership, Queue anatomy, five-mode Workspace composition, contextual selection, relationship traversal, requirement actions, run comparison, decision readiness, and Human Decision composition.
> **Authoritative inputs:** The six accepted R4A contracts under `docs/r4/`; the binding R4B task prompt; targeted repository evidence listed in `R4B_R4C_HANDOFF.md`; supplemental structural screenshots 01, 06, 07, and 08.
> **Excluded scope:** Production UI, `/workspace` modification, a production route, the R4C visual laboratory, implementation code, dependencies, final visual polish, and any reconsideration of R4A.
> **Next owning milestone:** R4C — Workspace Reconstruction Lab.

## Binding model

R4B preserves one evidence chain:

`Change → Observation → Evidence → Requirement → Human Decision`

R4B preserves one authority rule:

- Lintel recommends.
- The accountable engineer decides.

R4B preserves one shell:

`Global Rail → Review Queue → Verification Workspace → Contextual Inspector`

The selected review is the only review in operational context. The Workspace has at most one primary selected object. An activation that establishes a new primary object replaces the former object; it never creates a second selection.

## Region responsibilities

| Region | Primary responsibility | Persistent content | Contextual content | Prohibited content |
| --- | --- | --- | --- | --- |
| Global Rail | Select the product area. | Lintel identity; Reviews, Operations, Governance, Integrations, System; truthful local/account entry where supported. | Active-area marker and compact destination disclosure. | Review records, Queue groups, recommendation detail, object actions, full route list. |
| Review Queue | Select and orient within review work. | Group order, filters, search, stable selected-review row, collection limitations. | Expanded selected row and changed-since-last-run cue. | App-route navigation, full review summary, complete findings or requirements. |
| Selected-review header | Preserve review identity and current authority context. | Repository, PR, title, recommendation, risk, current run/head, provenance, Human Decision applicability, strongest limitation. | Mode-specific count or comparison cue. | Metric-card dashboard, full record collections, Human Decision fields. |
| Workspace mode navigation | Select one view of the selected review. | Overview, Change, Evidence, Requirements, History; active-mode state. | Mode counts and unavailable marker. | Route navigation or a second review selector. |
| Active Workspace mode | Own the primary collection and primary reading task. | Mode heading, ordered records, selected-record representation, mode loading/error state. | Focused record context and inline explicit relationships. | Complete Inspector copy, unrelated route content, fabricated raw diff. |
| Contextual Inspector | Explain or act on one contextual object. | Selected-object identity, applicability, provenance, consequences, direct relationships, truthful action capability. | No-selection decision-readiness guidance. | Complete Workspace collections, complete review summary, stacked selections, graph canvas. |
| Decision-readiness entry | Summarise whether accountable action is ready. | Recommendation, risk, blockers, requirements, missing/stale proof, run/head, earlier decision applicability, handoff state, next accountable action. | Selected-object consequence. | A recorded Human Decision or preselected outcome. |
| Human Decision dialog | Contain one consequential append-only decision act. | Review/run/head context, seven outcomes, rationale, references, acknowledgements, save state. | Outcome-specific requirements and conflict recovery. | Recommendation masquerading as authority, background interaction, transient waiver. |

## Information ownership register

| Information | Primary owner | Allowed abbreviation | Explanation owner | Action owner | Duplication prohibition |
| --- | --- | --- | --- | --- | --- |
| Repository and PR identity | Selected-review header | Queue row and modal context | Header | Queue selection | Inspector never repeats the full header. |
| Review title | Selected-review header | Two Queue lines; one compact line | Header | None | Mode headings do not repeat the full title. |
| Recommendation | Header and Overview | Queue text label; readiness line | Overview | None | Never labelled or styled as Human Decision. |
| Risk | Header and Overview | Queue band; score only when present | Overview | Accepted risk only in Human Decision | Missing score never becomes zero. |
| Confidence and limitation | Header for strongest limitation; Overview for full concise set | Queue only when it changes triage | Overview | Next-inspection link | Low confidence never disappears behind the Inspector. |
| Run identity | Header and History | Queue disambiguation only for repeated PR analyses | History or run Inspector | Select comparison run | No invented run or synthetic replay claim. |
| Commit/head identity | Header and History | Queue disambiguation where needed | History or selected-record Inspector | Open supported handoff/context | Unknown remains `Not recorded`; two unknown values never prove applicability. |
| Provenance/source | Header and record row | Queue `Fixture`, `Local`, or limitation cue | Inspector | None | Fixture, model-assisted, local, and external states never merge. |
| Findings | Overview summary; Evidence collection | Queue blocker count only | Finding Inspector | Select finding | Inspector never becomes the full finding list. |
| Evidence | Evidence mode | Overview composition counts | Evidence Inspector | Select evidence | Counts never replace records. |
| Missing proof | Overview summary; Evidence collection | Queue missing-proof cue | Missing-proof Inspector | Open proof target | Empty evidence is not a missing-proof record. |
| Affected files/surfaces | Change mode | Finding/evidence row reference | File/surface Inspector | Open focused context when supported | Do not claim complete raw-diff coverage. |
| Requirements | Requirements mode | Header/Overview open and blocking counts | Requirement Inspector | Exact condition action only where supported | Local task progress is not proof or resolution. |
| Requirement capability | Requirement Inspector | Row capability label | Inspector | Inspector | A disabled fictional waiver or acknowledgement is prohibited. |
| Readiness Delta | History comparison summary | Overview changed signal | History and run Inspector | Open counted records | It does not duplicate field-level Review Diff. |
| Review Diff | History record collection | Per-category counts | Changed-record Inspector | Select changed record | It does not restate the readiness classification. |
| Human Decision | Decision readiness and History | Queue marker and header applicability | Decision readiness or decision-history Inspector | Human Decision dialog | Recommendation, review status, and task status remain separate. |
| Decision applicability/staleness | Header and decision readiness | Queue stale marker | History | Reaffirm, change, or withdraw when supported | A stale decision never appears current. |
| Reviewer/ownership | Queue and header only when real | Compact initials/name | Ownership Inspector | Route to real local ownership context | Fixture people never imply authentication or presence. |
| Handoff capabilities | Decision readiness | Header GitHub App configured/unavailable cue | Inspector or Integrations route | Open configured GitHub App handoff or truthful local copy/export | GitHub App, GitHub Action Blueprint, and Slack Export-only remain separate records; the automated GitHub analysis comment never implies Human Decision publication. |

## Review Queue architecture

### Groups and deterministic priority

The group order is fixed:

1. `Needs attention`
2. `In review`
3. `Ready`
4. `Reviewed`

Each valid review appears exactly once. Within a group, sorting is deterministic:

1. blocking state before non-blocking state;
2. changed-since-last-run movement in this exact order: regression, mixed, comparison unavailable, unchanged, improvement;
3. risk `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`;
4. open blocker count descending;
5. most recently updated current run descending;
6. repository, PR number, then stable review identity ascending.

Unavailable comparison data occupies the third movement rank and carries a `Comparison unavailable` cue; it never receives a fabricated comparison result.

### Row anatomy

| State | Required anatomy |
| --- | --- |
| Expanded row | Repository and PR; title up to two visual lines; recommendation text; risk band and source score when present; blocking/open requirement counts; changed cue when valid; real owner when present; update time last. |
| Compact row | PR number plus unambiguous repository abbreviation; one-line title only when width permits; recommendation icon plus accessible text; risk band; blocker count; selected marker. |
| Selected row | Persistent selected surface and marker independent of keyboard focus; expanded selected row exposes current run/head disambiguation when the PR has multiple analyses. |
| Focused row | High-contrast focus indicator independent of selection. Focus alone does not load the review. |

Repository, PR, recommendation, risk band, and blocker count do not truncate into ambiguity. The title truncates first. Ownership and time disappear before required fields. Full technical values remain keyboard- and assistive-technology-accessible.

### Collapse, filtering, and large collections

- Group collapse is Queue-local session state. Collapsing the group containing the selected review leaves a pinned selected-row summary directly below that group header.
- Queue collapse reduces the region to an orientation strip containing the selected repository/PR, recommendation state, blocker count, Queue restore control, and filtered-result count.
- Search matches repository, PR number, title, stable review identity, and real owner. Status controls filter group membership; recommendation, risk, changed state, and provenance are explicit filters.
- Filter changes preserve selection when the selected review still matches. A selected review filtered out remains selected and appears in a pinned `Selected outside filters` row with `Clear filters` and `Return to result` actions.
- Updates preserve selection by stable review identity even when the row changes group or position. The Queue scrolls only enough to keep the selected row visible after an explicit update; passive reordering announces the new group without stealing focus.
- At 50+ reviews, the Queue progressively renders visible rows plus a bounded buffer. Search and filter operate over the complete loaded collection, not only rendered rows. Loading the next page preserves group order, selection, and scroll anchor.
- The Queue is never route navigation. Global and contextual destinations remain owned by the Rail and route header.

### Queue readiness states

| State | Queue content | Primary action | Focus |
| --- | --- | --- | --- |
| Initial/loading | Group skeleton rows with stable widths; `Loading stored reviews`. | None until identity is available. | Queue heading; status is announced politely. |
| Empty | `No reviews are stored in this browser.` | `Check a pull request` to `/new`. | Empty-state heading. |
| Unavailable | Reason, retained source label, recovery instruction. | `Retry`; `Open New Review` remains secondary. | Error heading; assertive announcement once. |
| Partial | Valid rows plus persistent limitation banner naming omitted records. | `Inspect limitation`; continue reviewing valid rows. | Existing focus remains. |
| Invalid requested identity | No substitute selection; requested ID and available-count explanation. | `Return to review list`. | Unavailable-state heading. |

### Queue keyboard contract

Tab enters the Queue toolbar, group disclosures, then the active collection. `J` and `K` move focus through visible review rows only while Queue scope is active. `Enter` selects the focused review. Arrow keys retain native scrolling because the Queue is an ordinary list, not a composite widget. Collapsing a group returns focus to its disclosure. Collapsing the Queue returns focus to the Queue restore control.

## Five Workspace modes

### Shared mode rules

- Mode activation never changes the selected review.
- Each mode owns one vertical Workspace scroll position per selected review for the current session.
- Returning to a mode restores its last position and selected object only when that object still exists in that mode.
- A selected object remains primary across a mode change only when the destination contains a canonical representation of that exact object. Otherwise the destination opens with no explicit object and retains the prior object in a one-level contextual return token.
- Mode loading leaves the selected-review header and mode navigation operable. It never clears review identity.
- A context change announces mode name, record count or state, and retained selection when it would not be visually obvious.

### Overview

**Primary question:** Why is this review ready or not ready now?

The fixed reading order is:

1. current recommendation, risk, and confidence/limitation;
2. highest-impact finding or strongest ready signal;
3. evidence composition with missing/unverified and stale proof called out;
4. open and blocking requirements;
5. changed-since-last-run summary or explicit initial/unavailable state;
6. Human Decision applicability;
7. one next inspection target and one accountable action.

Overview contains concise linked summaries, not parallel full collections. Selecting its highest-impact finding activates that finding in Evidence mode. Selecting missing proof activates the missing-proof record in Evidence mode. Selecting requirement counts activates Requirements mode with the deterministic first blocker selected. Overview scroll starts at the top on review switch. Empty findings show `No findings recorded for this run` without asserting safety. Partial evidence keeps the recommendation visible and names the limitation. Unavailable comparison shows `No usable run comparison` and leaves current facts intact.

### Change

**Primary question:** What changed, and where should I inspect?

Order files and affected surfaces by linked blocking findings, linked advisory findings, recorded per-file risk, then path. The collection row owns path, additions/deletions when present, recorded risk when present, linked counts, and focused-context availability. The detail region shows only available technical metadata and focused context. Missing counts render `Unknown`; missing line mapping renders `Focused diff context unavailable`. The mode never calls itself a complete raw-diff viewer.

Selecting a file or surface makes it the primary object and opens file/surface context in the Inspector. When no files exist, show `No changed-file records are available for this review` and point to source provenance. Partial mode content retains valid files and labels omitted or unavailable context. Stale file relationships are labelled against their run/head. Loading additional focused context does not block the file collection.

### Evidence

**Primary question:** What supports or weakens the recommendation?

The collection is ordered:

1. blocking missing/unverified proof;
2. stale evidence affecting a blocker or decision;
3. blocking findings;
4. directly observed or externally verified evidence;
5. human-confirmed and builder-declared evidence;
6. model-inferred evidence;
7. advisory findings and evidence.

Findings, evidence records, and missing-proof records retain distinct record types and filters. Each row names type, state, strength/class, provenance, run/head applicability, and direct relationship count. Missing proof states what was sought, why it matters, affected finding/requirement, verification state, and next proof-producing action. Where the current repository lacks a dedicated missing-proof object, R4C uses a planned R4 fixture with a persistent `Planned R4 record` label; production current data maps only deterministic missing-test or unverified-evidence identities.

Selecting any record updates the Inspector without duplicating the collection. No findings means `No findings recorded`; it does not mean `No risk`. No evidence means `No evidence records available`; it does not imply missing proof unless a source asserts it. Partial and stale states remain inline at record level. Unavailable relationships show their reason instead of an empty related list.

### Requirements

**Primary question:** What must be proved or acted on?

Order records by blocking reopened, blocking open with missing proof, blocking open, blocking stale, advisory reopened/open, satisfied/cleared, unavailable. Each row shows statement, importance, status, required proof, supporting-evidence count, run/head applicability, source, and capability label.

Selecting a requirement makes it primary and opens its exact action capability in the Inspector. An empty collection shows `No requirements recorded for this run`; it does not assert merge readiness. Partial projection retains valid requirements and names omissions. An unavailable capability appears as explanation text, never as an inert fake button. A stale requirement remains inspectable and links to the current run consequence.

### History

**Primary question:** What moved, and does an earlier Human Decision still apply?

Runs are newest first. The current run is persistently labelled. Default comparison is current versus immediately previous applicable run. A user selects at most one comparison run; current remains fixed. The collection contains run identity, head/base identity, timestamp, analysis source, provider/model where relevant, configuration/result fingerprints, reproducibility, and limitations.

The composition order is:

1. comparison identities and limitations;
2. Readiness Delta classification and recommendation/risk movement;
3. Review Diff record categories;
4. evidence and requirement movement;
5. manifest/configuration movement;
6. Human Decision applicability and lineage.

Initial run shows current identity and `Initial run — no previous comparison`. No usable comparison states the reason. Invalid prior history leaves the current run intact, blocks comparison claims, and offers `Select another prior run` when one exists. Selecting a run opens run identity and comparison limitations in the Inspector. Selecting a changed record opens its before/current values, status, direct relationships, and decision-readiness consequence. Counts are links only when backing records exist.

## Object selection and Inspector contract

| Primary selection | Workspace focus | Inspector order | Related-object order | Deselect/back |
| --- | --- | --- | --- | --- |
| Finding | Exact finding row/detail in Evidence | Identity/state → why it matters → severity/category → provenance/applicability → action statement → relationships → readiness consequence | supporting evidence → missing proof → blocking requirements → affected file/surface → advisory requirements | Deselect returns to mode collection; related activation stores one-level return token. |
| Evidence record | Exact evidence row/detail | Identity/state → statement → class/strength → provenance/source → run/head/staleness → relationships → readiness consequence | supported blocking findings → requirements → affected files → run | Back restores prior record and its scroll anchor. |
| Missing-proof record | Exact missing-proof row/detail | Missing statement → proof sought → why it matters → verification state → source/limitation → proof-producing action → consequence | blocking requirement → finding → verification surface → related stale evidence | Back restores prior record; dismiss leaves no explicit selection. |
| Requirement | Exact requirement row/detail | Identity/status/importance → required proof → supporting evidence → source/applicability → capability → history → consequence | missing proof → supporting evidence → source finding/change → prior run | Back returns to activating record or collection. |
| Affected file/surface | Exact row/focused context in Change | Path/surface → availability → technical metadata → why in scope → direct links → focused-context action | blocking findings → evidence → requirements | Back returns to source record or Change collection. |
| Run | Exact History row/comparison | Run/head/base → provenance → fingerprints/configuration → reproducibility/limitations → comparison summary → decision applicability | changed blockers → missing/stale proof → reopened requirements → other changes | Back restores prior History target. |
| Reviewer/ownership | Ownership cue in Queue/header | Real identity/source → responsibility → local/fixture limitation → reviews in current context | current selected review only | Close returns focus to invoking ownership control. |
| Decision readiness | Readiness entry | Recommendation/risk → blockers/requirements → missing/stale proof → run/head → prior decision applicability → handoff → next action | first blocker → first missing proof → stale decision/run | Close returns to readiness entry. |
| No explicit object | Active mode collection | Decision-readiness headline → strongest unresolved condition → next inspection target → current limitation → open Inspector help | next inspection only, followed by readiness | Not applicable. |

Selection moves DOM focus only when activation changes the primary location, including related-record navigation and cross-mode activation. Ordinary row selection keeps focus on the activating row. Programmatic movement uses the minimum scroll needed inside the Workspace; it never scrolls Queue or Inspector. A polite announcement states the new record type, title, mode, and position where known.

If an update removes the selected object, selection clears, the active mode retains its scroll anchor, focus moves to the nearest surviving record or collection heading, and a polite status states that the former object is no longer present. If the Inspector is collapsed, selection and the one-level return token remain. Reopening restores the selected object's Inspector state. On narrow layouts the same Inspector content appears in one drawer; closing restores focus to its invoker without deselecting the object.

## Explicit relationship traversal

The canonical traversal is:

`Finding → supporting evidence → missing proof → requirement → affected file or focused change context → decision-readiness consequence`

The Inspector renders an ordered relationship trace followed by a compact adjacency list. Every edge carries a source state:

- `Direct` for explicit repository IDs or deterministic exact-path mapping;
- `Unavailable` when the current record version cannot derive the relationship;
- `Unresolved` when stored references exist but do not resolve;
- `None recorded` when the source asserted no relationship.

Priority is fixed: direct before unavailable/unresolved; blocking before advisory; current before historical outside History; observed/externally verified before inferred; missing and stale consequences before complete/current supporting records. An activated related record becomes the only primary selection. A one-level `Back to [record]` control returns to the prior identity and scroll anchor. Deeper traversal replaces the token with the immediately prior record; browser Back retains normal route/history behaviour and is not commandeered for in-panel traversal.

The Inspector renders one ordered relationship trace followed by one compact adjacency list. The selected Workspace record carries a one-line related-record summary that opens that Inspector trace. Free-form canvas, draggable nodes, automatic graph layout, decorative connection lines, zoom/pan, and workflow authoring are prohibited.

## Requirement action capability matrix

| Action | Availability | Actor/rationale/evidence | Persistence and audit | Confirmation | Failure and stale behaviour | Unavailable explanation |
| --- | --- | --- | --- | --- | --- | --- |
| Inspect | Every valid requirement, including read-only and stale records. | No actor or rationale. Show required and supporting proof. | No write. | None. | Retain selection; missing related data is labelled. | Only absent when the requirement itself is unavailable. |
| Clear | Current real requirement with exact canonical persisted condition identity and currently open state. | Invoked by the current local user against the exact condition key. The current schema records no actor, rationale, audit author, or accountable owner for attribution. | Persist only fields supported by the existing condition-progress schema; reproject and read back before success. Keep condition progress separate from the Human Decision ledger and from proof state. | Inline explicit `Clear condition`; no modal. | On write failure retain open state and focus; on refresh failure state that storage succeeded but projection did not refresh. A changed identity refuses the command. | `Only exact Conditions before merge support persisted clear/reopen.` |
| Reopen | Same exact condition capability with currently cleared state. | Invoked by the current local user against the exact condition key. The current schema records no actor, rationale, audit author, or accountable owner for attribution. | Persist only fields supported by the existing condition-progress schema; reproject and read back before success. Keep condition progress separate from the Human Decision ledger and from proof state. | Inline explicit `Reopen condition`. | Same recovery as clear; reopened state returns to blocking priority when applicable. | Same exact-condition explanation. |
| Acknowledge | No general current requirement capability. | A future contract must name actor, rationale, references, applicability, and reopening; absent today. | No write in R4. | No control. | Not applicable. | `Requirement acknowledgement is not supported by the current durable contract.` |
| Waive | No current requirement-level capability. | Accepted risk belongs to Human Decision, not requirement status. | No write in R4. | No control. | Not applicable. | `Requirement waiver is not supported. Record named accepted risk through Human Decision when appropriate.` |
| Accept risk | Only Human Decision outcome `Approve with accepted risk`, with at least one current available risk reference. | Accountable actor; required rationale; selected risk references; explicit unchecked acknowledgement. | Append-only Human Decision event with run/head/report identity and read-back verification. | Consequential modal confirmation. | Stale head/effective decision refuses write; retry preserves draft; duplicate logical command is an unchanged no-op. | `Accepted risk requires the Human Decision contract and available references.` |
| Mark local task progress | Current local review-action record only. | Local user; status `Open`, `In progress`, `Done`, or `Not needed`; task context only. | Persist existing local task record where supported; audit remains local task state. | Inline selection. | Failure retains prior status and explains local-storage recovery. | `Task progress does not clear proof, resolve a requirement, acknowledge, or waive risk.` |
| Read-only explanation | Derived requirement, sample/fixture, unavailable storage, ambiguous identity, or unsupported action. | None. | No write. | No control. | Remains inspectable. | Name the exact boundary and supported next action. |

Clear/reopen presentation states only the persisted condition state. It does not display an attributed actor, rationale, audit author, or accountable owner unless a future approved schema actually stores that value. Clearing or reopening a condition is not a Human Decision and does not claim that proof exists.

## Readiness Delta and Review Diff

Readiness Delta owns the directional assessment: `initial`, `improved`, `regressed`, `mixed`, or `unchanged`; score, recommendation and risk movement; opened/cleared/reopened condition counts; blocker/gap movement; evidence boundary movement; and comparison limitation.

Review Diff owns inspectable record changes: `added`, `cleared`, `changed`, `reopened`, and `unchanged`, with previous/current fields and category. It never repeats the top-level readiness narrative. Readiness Delta count activation filters Review Diff to the corresponding backing records. When no backing records exist, the count is text rather than an interactive control.

Current and comparison run identity stays visible above both. Manifest or configuration change appears after record movement and states whether reproducibility is exact, traceable, historical, unavailable, or failed. A stale Human Decision is tied to prior/current head identity. An unbound Human Decision states that staleness cannot be established. Invalid prior history blocks both Delta and Diff claims for that pair without damaging the current run.

## Decision-readiness composition

Decision readiness appears before any modal in the Workspace and in the no-selection Inspector. Its fixed order is:

1. `Lintel recommendation` and risk;
2. open blockers;
3. open requirements, including blocking count;
4. missing/unverified proof;
5. stale evidence;
6. current run identity;
7. current commit/head identity or `Not recorded`;
8. earlier Human Decision outcome and applicability, including stale, withdrawn, superseded, unbound, or unavailable;
9. real reviewer/owner, otherwise `No owner recorded`;
10. Handoff capabilities as three separate records defined below;
11. one next accountable action.

### Handoff capabilities

| Record | Truth states | Decision-readiness action | Prohibited implication |
| --- | --- | --- | --- |
| GitHub App | `Connected`, `Available`, or `Unavailable` | Target the configured App only when the current state supports the automated analysis handoff. | GitHub Action connection; universal availability; publication of the Human Decision through the automated analysis comment. |
| GitHub Action | `Blueprint` | Open or copy the blueprint information. | Installed, connected, executable, or posting capability. |
| Slack handoff | `Export-only` | Copy or export the local handoff content. | Slack connection, send, delivery, scheduling, or receipt. |

The next action is `Inspect first blocker`, `Inspect missing proof`, `Reaffirm stale decision`, `Resolve unavailable head`, or `Record Human Decision`, in that precedence. After those decision responsibilities are resolved, it may target the configured GitHub App or a truthful local copy/export action. Decision readiness never records authority, never changes requirement state, and never states that the automated GitHub analysis comment publishes a Human Decision.

## Human Decision architecture

### Entry and retained context

`Human Decision` is a persistent action in decision readiness. Activation opens one modal while preserving the selected review, active mode, selected object, Queue/Workspace/Inspector scroll positions, and invoker. The modal header shows repository/PR, title, current run, current head or `Not recorded`, Lintel recommendation, risk, blocker count, missing/stale proof count, and prior decision applicability.

### Field order

1. Outcome selector with no default selection.
2. Plain-language explanation for the selected outcome.
3. Required rationale.
4. Optional referenced evidence and requirements for every outcome.
5. Accepted-risk references when outcome is `Approve with accepted risk`.
6. Explicit risk-acceptance acknowledgement, unchecked initially.
7. Open-blocker acknowledgement for `Approve` and `Approve with accepted risk`, unchecked initially.
8. Missing-head acknowledgement when no current head is recorded, unchecked initially.
9. Read-only persistence/applicability statement.
10. Cancel and outcome-specific Confirm.

| Outcome | Explanation and enablement |
| --- | --- |
| Approve | Engineer judges the change ready without accepting named residual risk. Requires rationale, blocker acknowledgement when blockers remain, and missing-head acknowledgement when unbound. |
| Approve with accepted risk | Engineer approves while accepting named residual risk. Requires rationale, at least one available risk reference, risk acknowledgement, blocker acknowledgement when blockers remain, and missing-head acknowledgement when unbound. |
| Tests required | Engineer requires specified test proof before readiness. Requires rationale; references remain optional but are encouraged by field guidance. |
| Review required | Engineer requires another named review or specialist assessment. Requires rationale. No authenticated reviewer is implied. |
| Request changes | Engineer requires code or configuration changes. Requires rationale. |
| Blocked | Engineer records that progress cannot continue under current conditions. Requires rationale and exposes unresolved blockers. |
| Defer decision | Engineer intentionally makes no current merge decision. Requires rationale and keeps responsibility pending. |

Confirm remains disabled until all outcome-specific requirements are satisfied. Pressing Enter in text or modal body never confirms. One explicit Confirm activation starts one write, disables dismissal and all mutation controls, and prevents duplicate submission.

### Containment, short height, and recovery

The modal owns one contained scroll region. The heading/context and footer remain visible; the body scrolls. At short height and 200% zoom, context collapses to repository/PR, run/head, recommendation, blockers, and prior applicability; no required field or acknowledgement is hidden. The background is inert and does not scroll.

Tab is contained. Initial focus lands on the outcome group heading or first outcome, with no outcome selected. Cancel remains visually separate from Confirm. Escape or scrim dismissal closes only when the draft is pristine. A dirty draft opens a contained discard warning with `Keep editing` as the initial focus and `Discard draft` as the explicit destructive action. During a pending write, Escape and dismissal do nothing and announce `Saving decision`.

Validation errors focus the first invalid field and preserve the entire draft. Persistence failure and read-back mismatch retain every field, show the precise error, and offer `Try again` plus Cancel. A save conflict caused by changed head or effective decision blocks the stale write and offers `Reload current context`; the draft remains recoverable for copy or deliberate reapplication after reload. An identical logical write returns `No change — identical decision already recorded` without appending.

Success closes the modal only after verified persistence, announces the recorded outcome and applicability, recomputes Queue/header/readiness/History, and restores focus to the Human Decision invoker or the resulting decision summary if the invoker was replaced. Earlier events remain in append-only history. A decision bound to an earlier head is stale and exposes `Reaffirm` or `Change decision`; an unbound decision never claims current applicability.

## Acceptance

This contract is satisfied when each fact has one primary owner, every collection has deterministic order, every selection produces one Inspector response, relationship traversal stays explicit, unsupported actions remain explanatory, History separates directional movement from record difference, and Human Decision remains a contained accountable act distinct from Lintel's recommendation.
