# R4B Interaction State Model

> **Milestone:** R4B — Workspace Information and Interaction Architecture
> **Status:** Binding R4B contract pending human acceptance
> **Scope:** Conceptual state ownership, persistence lifetimes, reset and survival rules, canonical workflow transitions, selection/back semantics, mutation transactions, and non-ready/failure recovery.
> **Authoritative inputs:** The six accepted R4A contracts under `docs/r4/`; the binding R4B task prompt; targeted Workspace snapshot, adapter, persistence, evidence, readiness, run, history, Human Decision, and navigation evidence.
> **Excluded scope:** Implementation code, new schemas, production UI, `/workspace` changes, R4C visual execution, dependencies, and alternate state systems.
> **Next owning milestone:** R4C — Workspace Reconstruction Lab.

## State invariants

1. Exactly one product area is current.
2. Zero or one review is selected. A ready Workspace has exactly one selected review.
3. At most one primary object is selected within that review.
4. The Inspector derives from the selected review, primary object, and explicit readiness/ownership context. It does not own a second domain selection.
5. The current run remains fixed while History selects at most one comparison run.
6. UI state never promotes fixture, session, inferred, stale, partial, blueprint, export-only, or unavailable data into current durable fact.
7. Domain mutations become visible only after verified persistence and authoritative reprojection.
8. A recoverable failure preserves identity, user input, focus context, and an explicit recovery action.

## Conceptual ownership register

`Session` means the mounted browser session. `Review session` means the period for which one stable review remains available. `Durable local` means validated browser-local storage on the current device only.

| State | Authoritative owner | Lifetime | Reset conditions | Survives review switch | Survives mode switch | Survives panel collapse | Survives responsive transition | URL or durable representation | Capability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Current product area | Route family / Global Rail | Route session | Route-family change | Yes | Yes | Yes | Yes | Pathname | Current route capability; R4 area composition planned. |
| Selected review identity | Workspace route state | Review session | Explicit new selection; selected identity deleted/unavailable; leaving Reviews without preserved context | Replaced, never accumulated | Yes | Yes | Yes | Stable `reportId` query is allowed; durable report identity exists locally | Current exact selection; R4 responsive preservation planned. |
| Queue grouping/filtering | Queue owner | Session | Explicit reset; source change; incompatible collection reload | Yes, applies to collection | Yes | Yes | Yes | Search and shareable filters use query parameters; density remains session-only | R4 planned; current groups exist. |
| Queue expanded/collapsed | Workspace layout owner | Session | Refresh or explicit restore; responsive state may force compact/drawer presentation without erasing preference | Yes | Yes | Not applicable | User preference survives; rendered responsibility adapts | Session only in R4; not URL or durable domain state | R4 planned; current Queue collapse is session state. |
| Queue group collapse | Queue owner | Session | Explicit expand/reset; group removed | Yes | Yes | Yes | Preserved when Queue becomes list/drawer | Session only | R4 planned. |
| Active Workspace mode | Workspace route state | Per selected review, session | New review defaults to Overview; mode unavailable | No; each review remembers its mode only in session | Not applicable | Yes | Yes | `mode` query is allowed when valid | R4 planned. |
| Primary selected object | Workspace route state | Per review and mode | Explicit deselect; review switch; object removed; destination mode lacks exact object | No | Only when exact object exists in destination | Yes | Yes | Stable object type/id query is allowed only for durable identities | Current artifact focus exists; R4 types expand missing proof/run/ownership/readiness. |
| Selected comparison run | History mode owner | Per review, session | Review switch; comparison invalid/removed; explicit reset to previous | No | Yes while leaving/returning to History | Yes | Yes | `compareRun` query is allowed when stable | Current run metadata/delta exists; R4 History composition planned. |
| Inspector context | Derived Workspace selector | Until replaced | New primary object, explicit readiness/ownership selection, review switch | No | Recomputed | Yes | Yes; content moves to drawer | Not independently encoded; derives from other state | R4 planned from current projection. |
| Inspector expanded/collapsed/drawer | Workspace layout owner | Session | Explicit control; responsive responsibility forces drawer/hidden state | Yes | Yes | Not applicable | Preference survives; drawer open state closes on breakpoint change and returns focus | Session only in R4; not URL or durable domain state | R4 planned. |
| Focus mode | Workspace layout owner | Session | Explicit exit; route change; tablet/mobile where it becomes single-surface sequence | Yes within Reviews | Yes | Yes | Intent survives, composition adapts | Session only | R4 planned. |
| Decision-readiness state | Derived review projection | Current reprojection | Any report, condition, evidence, run, decision, head, or handoff update | Recomputed | Yes | Yes | Yes | Current facts may be linkable; never separately persisted | R4 planned from current records. |
| Human Decision dialog state | Dialog owner under Workspace route | Until close/success | Cancel/discard; verified success; review/context invalidation after conflict acknowledgement | No; review switching is blocked while dirty/open | Mode change is blocked by modal containment | Yes; background layout unchanged | Yes; presentation adapts to viewport | Never URL state | Current modal capability exists; R4 composition planned. |
| Unsaved Human Decision draft | Dialog owner | Dialog lifetime plus recoverable error | Explicit discard or verified success | No; switching is blocked until resolution | No | Yes | Yes | Memory only; never durable autosave in R4B | Current local component draft; R4 adds discard/conflict handling. |
| Responsive layout state | CSS/layout responsibility resolver | Viewport session | Breakpoint/zoom/orientation change | Yes | Yes | Governs rendered panels | Not applicable | Not URL/durable | R4 planned. |
| Provenance/source state | Workspace snapshot / record source | Record lifetime | New source, new review, authoritative reload | No | Yes | Yes | Yes | `source=fixture` is explicit; durable record carries source | Current. |
| Loading state | Owning asynchronous region | Request lifetime | Success, partial, unavailable, invalid, cancellation | Context retained | Context retained | Yes | Yes | No | Current shell-level; R4 adds mode-level. |
| Partial state | Owning projection plus limitation register | Until successful reload/source change | Valid complete reprojection | Per record | Yes | Yes | Yes | Source record may carry limitation | Current Queue limitations; R4 generalises. |
| Unavailable state | Owning source/capability | Until retry/context change | Successful retry or new valid context | No | Yes when mode-scoped | Yes | Yes | Requested identity may remain in URL | Current. |
| Invalid state | Validator/projection owner | Until corrected source/identity | Correction, removal, or successful reload | No | Yes when mode-scoped | Yes | Yes | Invalid requested identity stays represented | Current history preflight; R4 generalises. |
| Conflict state | Mutation transaction owner | Until reload/reconcile/cancel | Context reload and deliberate retry or discard | Review switch blocked while draft requires action | Modal retains mode beneath | Yes | Yes | No | Current stale-command result; R4 presentation planned. |

### Survival rules

- Review switching preserves product area, Queue filters/search, Queue/group collapse, panel preferences, focus-mode preference, and responsive responsibility. It resets active mode to the new review's remembered session mode or Overview, clears the primary object and comparison run, recomputes the Inspector to no-selection readiness, closes non-dirty contextual overlays, and scrolls the new Workspace mode to its remembered position or top.
- Mode switching preserves selected review, Queue state, panel state, focus-mode intent, decision readiness, provenance, and per-mode scroll anchors. It preserves primary object only through exact identity, never through title similarity.
- Panel collapse preserves review, mode, object, comparison, return token, and each panel's scroll position. It restores focus to the disclosure control.
- Responsive transitions preserve all domain selection. They close an open non-modal drawer, remember its context, and restore focus to the corresponding drawer control. A consequential modal remains open and recomposes.
- Route-family changes preserve review context only for contextual Review routes that explicitly carry the stable local `reportId`. Operations, Governance, Integrations, and System receive a compact `Return to review` context link rather than the Workspace state tree.

## Workspace state composition

The route state is conceptually:

```text
WorkspaceState
├── area: Reviews
├── source: live | fixture
├── collection: initial | loading | ready | empty | partial | unavailable | invalid
├── selectedReviewId: string | null
├── queue: query + filters + groupCollapse + presentation
├── mode: Overview | Change | Evidence | Requirements | History
├── primaryObject: { kind, stableId } | null
├── comparisonRunId: string | null
├── inspector: derivedContext + presentation
├── layout: responsiveState + focusMode + userCollapsePreferences
├── readiness: derivedProjection
└── decisionTransaction: closed | editing | discardWarning | saving | conflict | failed | succeeded
```

`primaryObject` is the only selection that changes Workspace record emphasis. `inspector.derivedContext` is a projection, not another selected object. `decisionTransaction` freezes the review target and expected run/head/effective-decision identity while open.

## Canonical workflow transitions

| Step and action | Visible information and owning region | State change and selection | Inspector | Focus and announcement | Scroll | Failure/unsupported/narrow behaviour |
| --- | --- | --- | --- | --- | --- | --- |
| 1. Open work requiring attention | Queue groups and selected-review header | Set one `selectedReviewId`; clear primary object and comparison; set remembered mode or Overview | No-selection readiness | Focus remains on selected Queue row; announce repository, PR, title, recommendation | Workspace mode scroll restores or starts at top; Queue keeps row visible | Unknown identity opens unavailable state with no substitute. Tablet/mobile navigates list → selected review. |
| 2. Establish recommendation and risk | Header and Overview | No domain state change | Readiness summary | Skip-to-Workspace lands on header; unavailable score/limitation is announced with context | Workspace only | Missing risk score is `Not recorded`, never zero. |
| 3. Select highest-impact finding | Overview link or Evidence row | Set finding as sole primary object; activate Evidence when required | Finding detail | Focus moves to exact finding on cross-mode activation; announce severity and position | Workspace minimally scrolls target into view | Missing finding ID clears selection and reports removal. |
| 4. Inspect supporting evidence | Finding Inspector relationship | Replace primary object with exact evidence ID; store one-level return token | Evidence detail | Focus moves to evidence; announce evidence class/state | Workspace only; Inspector preserves its own scroll reset to top | Unavailable/unresolved edge remains explanation, not activation. Drawer replaces Inspector on narrow. |
| 5. Understand missing proof | Evidence/finding relationship | Replace primary object with missing-proof identity | Missing-proof detail | Focus moves; announce missing/unverified and proof request | Workspace only | No dedicated current object uses planned fixture only in R4C; production shows truthful source limitation. |
| 6. Inspect affected code context | Related file/surface activation | Activate Change; select exact path/surface | File/surface detail | Focus exact file row/context; announce focused-context availability | Workspace only | No raw diff/line map displays `Focused diff context unavailable`; external handoff only if configured. |
| 7. Inspect requirements | Relationship or Requirements mode | Activate Requirements; select exact requirement or deterministic first blocker | Requirement detail and capability | Focus selected requirement; announce blocking/advisory, status, capability | Workspace only | Missing edge remains unavailable; empty mode does not assert readiness. |
| 8. Clear/reopen supported condition | Requirement Inspector | Start transaction against case + exact condition key; selection stays | Pending/result in requirement context | Focus stays on action; success polite, failure assertive | No automatic panel scroll | Unsupported derived requirement is read-only. Failure keeps prior state. Verified write + refresh failure states saved-but-not-refreshed. |
| 9. Compare runs | History mode / run list | Activate History; current fixed; set one comparison run | Run identity and limitations | Focus comparison control or run row; announce pair and validity | Restore History scroll; comparison summary starts at top after explicit pair change | Initial/no usable/invalid comparison remains explicit. |
| 10. Inspect movement | Delta counts and Review Diff records | Set changed record as primary object | Before/current values and consequence | Focus exact changed record; announce status | Workspace only | Count is not interactive without backing records. |
| 11. Assess decision readiness | Persistent readiness entry | Set explicit readiness context; no Human Decision recorded | Full readiness order | Focus readiness heading; announce blocker/proof/decision summary | Inspector/drawer starts at top | Missing source data remains listed; next action targets first recoverable constraint. |
| 12. Open Human Decision | Readiness action | Open transaction frozen to review/run/head/effective decision; draft pristine | Background Inspector inert | Initial focus outcome group; announce dialog title and context | Modal body owns scroll; background frozen | Unavailable mutation explains why and does not open a fake dialog. Mobile opens full-screen consequential step. |
| 13. Confirm Human Decision | Modal | Validate; saving state; append once; verified reprojection; close on success | Recomputed decision context | Invalid field receives focus; success restores invoker/result; conflict focuses conflict heading | Modal retains position on errors | Draft preserved on failure/conflict. Duplicate is unchanged. Stale command is refused. |
| 14. Communicate through GitHub | Decision readiness or Integrations context | No Workspace authority change unless current capability returns verified handoff state | Handoff explanation | Focus remains on action/result; announce configured success/failure | Owning region only | Configured GitHub App only. Action is Blueprint; Slack is Export-only; unavailable state never implies delivery. |

## Mode and selection transitions

### Mode activation

1. The activating control receives selected state.
2. The destination mode heading and loading state render while the selected-review header persists.
3. If the exact primary object exists in the destination, it remains selected and focus moves only when the activation was explicitly object-directed.
4. If it does not exist, selection clears, the prior identity becomes the one-level return token, and the Inspector becomes no-selection readiness.
5. The destination restores its session scroll anchor after content identity is confirmed.
6. A polite announcement reports mode, collection state/count, and selection retention.

### Deselect and contextual Back

- Activating the selected row's disclosure again deselects it only when the control is explicitly labelled `Close details`; Enter on a selected ordinary row does not silently deselect.
- `Esc` returns one contextual level: drawer → Inspector context → primary object → no-selection readiness. It does not change review or mode.
- `Back to [record]` replaces the current primary object with the stored prior identity, restores its mode and scroll anchor, focuses it, and consumes the return token.
- Browser Back controls route/query history only where selections were deliberately encoded. Internal traversal does not flood browser history.

### Object removal after update

When the selected object disappears:

1. retain selected review and active mode;
2. clear the primary object and return token;
3. keep the collection scroll anchor unless it points beyond content;
4. focus the nearest next record, otherwise previous record, otherwise collection heading;
5. recompute Inspector to no-selection readiness;
6. announce `[type] is no longer present after the update`;
7. expose changed-run context in History when the update supplies it.

## Asynchronous region states

| State | Retained shell | Collection behaviour | Focus/announcement | Exit |
| --- | --- | --- | --- | --- |
| Initial | Rail, Queue boundary, Workspace boundary, source label | No fake records; stable placeholders | Initial route heading; polite `Loading Workspace` | Ready, empty, unavailable, invalid |
| Loading review | Queue and previous selection remain; Workspace header uses selected identity | Previous review content is inert and marked updating, or skeleton if none loaded | Focus stays on Queue row; no repeated announcements | Ready/partial/unavailable |
| Loading mode | Header/modes/readiness remain | Mode skeleton with stable row geometry; other modes operable unless a transaction blocks them | Focus stays on mode control; announce once | Ready/partial/unavailable |
| Partial | All valid content and source limitation | Invalid/omitted records are counted and explained | Existing focus remains; limitation announced once | Complete reload or source change |
| Unavailable | Review identity and source when known | No substitute; exact reason and recovery | Error heading receives focus only after explicit navigation; alert once | Retry, return to list, new review |
| Invalid | Requested/stored identity and validation reason | Current facts not projected from invalid data | Validation heading | Correct/remove invalid source; select valid review |
| Conflict | Review/run/head context and full draft | Background remains frozen; stale values not written | Conflict heading and assertive message | Reload/reconcile, retry deliberately, or cancel/discard |

## Mutation transaction protocol

Every supported write uses this sequence:

1. capture stable review identity, object/condition identity, expected run/head, and expected effective-decision identity where applicable;
2. validate current capability and actor requirements;
3. set one exact pending mutation identity and disable all mutation controls, not read navigation outside a modal;
4. perform the narrow current persistence command;
5. read back through the authoritative projection;
6. expose success only when the intended state and lineage verify;
7. reproject Workspace state without optimistic domain edits;
8. restore focus to the initiating control or documented replacement;
9. announce success politely, refusal/conflict/error assertively;
10. treat a logically identical Human Decision command as unchanged and append nothing.

A condition or local task write failure leaves the previous projected state visible. A Human Decision failure preserves the draft. A verified persistence followed by refresh failure states that the write is stored locally and instructs the engineer to reopen or retry projection; it never repeats the write automatically.

## Non-ready and failure-state register

| State | Visible message | Retained context | Available action | Prohibited implication | Focus and recovery |
| --- | --- | --- | --- | --- | --- |
| No reviews | `No reviews are stored in this browser.` | Reviews area; Local source | `Check a pull request` | No organisation-wide emptiness claim | Empty heading; `/new` returns with explicit result. |
| No selected review | `Select a review to begin verification.` | Queue, filters, source limitations | Select row | No fabricated default after explicit deselection | Queue selected/first result focus. |
| Selected review unavailable | `This stored review is no longer available.` plus ID/reason | Requested identity and Queue when readable | Return to list; retry | No substitution | Unavailable heading; selection cleared only after user leaves. |
| Loading review | `Loading selected review…` | Selected row/header identity | Cancel selection only if supported | Old details are not current | Focus stays on row; ready state announced. |
| Loading mode content | `Loading [mode]…` | Header, modes, review identity | Switch mode | Skeleton is not data | Focus stays on mode; completion polite. |
| Partial evidence | `Some evidence could not be projected.` plus count/reason | Valid records, recommendation, provenance | Inspect limitation; retry | Collection completeness | Existing focus; invalid item never silently omitted without banner. |
| No findings | `No findings were recorded for this run.` | Run, risk, recommendation, other proof | Inspect evidence/requirements | `No risk` or `Ready` | Collection heading. |
| No requirements | `No requirements were recorded for this run.` | Run and evidence | Inspect decision readiness | Merge readiness | Collection heading. |
| No history | `No prior run history is available in this browser.` | Current review/run if present | Continue current review | Hosted or unlimited history | History heading. |
| Invalid history | `Stored history could not be read as valid report history.` | Source label and invalid-state reason | Retry; create/open valid review | Empty history | Alert heading; never prune through a UI claim. |
| Initial run | `Initial run — no previous comparison.` | Current run/head/provenance | Inspect current records | Zero movement | Current run heading. |
| Deterministic fallback | `Deterministic analysis used.` plus model limitation | Current report and source | Inspect results; retry model from authorised intake when available | Model output or equivalent confidence | Source cue focus only on activation. |
| Model unavailable | `Configured model analysis was unavailable.` | Deterministic result when genuinely produced, labelled separately | Inspect deterministic result; retry from `/new` | Silent model fallback | Limitation announced; no loss of report context. |
| GitHub disconnected | `GitHub App is not configured for this environment.` | Review and local result | Open Integrations information | Universal GitHub connection | Action result/Inspector. |
| GitHub App unavailable | `Configured GitHub capability is unavailable right now.` | Handoff draft/current review | Retry; copy truthful summary when available | Successful post | Error stays near handoff action. |
| Action blueprint | `Blueprint — does not install, execute, connect, or post.` | Integration route context | Read setup architecture | Connected or runnable Action | Route heading. |
| Slack export-only | `Export-only — copies or downloads; does not send to Slack.` | Formatted handoff | Copy/export | OAuth, connection, schedule, delivery | Result announced as copied/exported only. |
| Fixture review | `Sample fixture — read-only demonstration data.` | Complete fixture selection | Inspect; return to real reviews | Production record or persistence | Persistent label; mutation controls absent. |
| Session review | `Session review — not stored in durable local history.` | Current session record | Continue; return to intake | Refresh durability | Source cue and decision storage limitation. |
| Durable local review | `Local report — stored in this browser on this device.` | Full local identity | Continue; manage locally | Hosted/shared durability | Source cue. |
| Stale Human Decision | `Human Decision predates current head.` with prior/current head | Decision lineage, current review | Reaffirm; change; withdraw | Current authorization | Readiness or History target; focus chosen action. |
| Unbound Human Decision | `Recorded without a head binding; current applicability cannot be proven.` | Decision event and rationale | Record replacement when supported | Applicable or merely stale | Decision summary. |
| Condition write failure | `Condition progress was not saved.` plus recovery | Requirement selection and old state | Retry | Cleared/reopened state | Failed control; alert once. |
| Human Decision write failure | `Decision was not saved.` plus precise local-storage/read-back reason | Entire draft and frozen context | Try again; Cancel | Appended authority | Error heading/first invalid field. |
| Save conflict | `Review head or effective decision changed while this action was open.` | Draft, prior and current identity | Reload current context; copy rationale; cancel | Automatic overwrite | Conflict heading; deliberate retry only after reload. |
| Selected object removed | `[Record] is no longer present after the update.` | Review, mode, collection, nearby scroll | Inspect current records; History change | Stale detail remains selected | Nearest surviving record/heading; polite announcement. |

## Focus-mode state distinction

Manual collapse records two independent user preferences: Queue collapsed and Inspector collapsed. Focus mode is one explicit temporary layout state that:

- collapses both supporting regions regardless of their saved preferences;
- preserves their saved pre-focus presentation for exit;
- leaves a persistent orientation bar with repository/PR/title abbreviation, recommendation, risk, blocker count, Human Decision applicability, mode, selected-object identity, `Exit focus mode`, and Human Decision entry;
- retains the Rail on workstation layouts and the global navigation disclosure on tablet/mobile;
- leaves all keyboard commands active except commands for absent drawers;
- exits through its visible control, `Esc` only when no deeper contextual layer is open, or route change;
- restores Queue/Inspector to their pre-focus preferences and returns focus to the focus-mode control.

On narrow layouts focus mode closes drawers and suppresses their automatic opening; explicit Inspector activation opens the normal drawer above focus mode and returns to the focused Workspace when closed. On tablet/mobile, the normal single-surface sequence already provides working space, so focus mode changes only orientation density and never removes Back, recommendation, blockers, or Human Decision responsibility.

## Acceptance

This model is accepted when state has one owner, survival and reset rules are deterministic, all 14 workflow steps define selection/focus/scroll/failure behaviour, mutations never become optimistic fact, and every non-ready condition preserves the maximum truthful context with one recoverable next action.
