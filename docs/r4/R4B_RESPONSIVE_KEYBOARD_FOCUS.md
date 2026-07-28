# R4B Responsive, Keyboard, and Focus Architecture

> **Milestone:** R4B — Workspace Information and Interaction Architecture
> **Status:** Binding R4B contract pending human acceptance
> **Scope:** Responsive responsibility thresholds, panel and drawer behaviour, keyboard traversal, scoped shortcut candidates, focus movement/restoration, announcements, modal containment, collapse controls, and 200% zoom behaviour.
> **Authoritative inputs:** The six accepted R4A contracts under `docs/r4/`; the binding R4B task prompt; accepted shell dimensions and accessibility/performance boundaries; targeted Workspace interaction evidence.
> **Excluded scope:** Production CSS or JavaScript, final visual calibration, browser-tested shortcut authority, dependency selection, production accessibility sign-off, and R4C implementation.
> **Next owning milestone:** R4C — Workspace Reconstruction Lab.

## Responsive responsibility resolver

Breakpoints use CSS viewport width after browser zoom. R4B locks the responsibility at each threshold and recommends these values for R4C browser validation:

| State | Recommended threshold | Persistent composition |
| --- | ---: | --- |
| Wide workstation | `≥ 1440px` | 52px Rail + 264px Queue + dominant Workspace + 352px Inspector. |
| Normal laptop | `1280–1439px` | 52px Rail + 248px Queue + dominant Workspace + collapsible 320px Inspector. With no saved preference, the Inspector is initially collapsed at `1280–1359px` and initially open at `1360–1439px`; an explicit remembered preference then governs while at least 640px of usable Workspace width remains. |
| Narrow laptop | `960–1279px` | 52px Rail + 80px compact Queue + dominant Workspace + Inspector drawer. |
| Tablet | `640–959px` | Compact global navigation; Review list → Workspace → contextual drawer. |
| Mobile | `< 640px` | Review list → selected review → selected record or consequential action. |

R4C validates these thresholds in a real browser at 100% and 200% zoom. It may move a threshold only to the first width that preserves the same locked responsibility, the 640px Workspace target where simultaneous panels apply, 32px minimum dense targets, and 40px touch-facing targets. It may not introduce another layout state or compress the four-panel shell below its responsibility boundary.

No responsive variant duplicates the full Workspace DOM. The same semantic records move between persistent panel and drawer/full-step containers. DOM reading order follows the active responsibility state.

## Layout-state contracts

### Wide workstation

- **Visible regions:** Rail, Queue, selected-review header, mode navigation, active Workspace, Inspector, decision-readiness entry.
- **Hidden/collapsed regions:** None by default. User collapse preferences remain available.
- **Navigation path:** Rail selects area; Queue selects review; modes select review view; records select contextual detail.
- **Persistence:** Review, mode, object, run comparison, per-region scroll, and Inspector context survive all panel collapse and resizing.
- **Back and drawer:** No drawer. Contextual Back traverses the one-level relationship return token.
- **Focus entry/restoration:** Tab follows the wide order below. Inspector collapse restores its disclosure; Queue collapse restores its disclosure.
- **Scroll:** Queue, Workspace, and Inspector each own one vertical scroll region. Rail does not routinely scroll.
- **Mode navigation:** Persistent horizontal tablist controlling the five mode panels.
- **Decision action:** Persistent decision-readiness entry remains visible without overlaying records.
- **No-data/failure:** The owning region renders its state while other regions retain orientation.
- **200% zoom:** Resolver moves to Tablet or Mobile based on CSS width; it does not horizontally squeeze four panels.

### Normal laptop

- **Visible regions:** Rail, Queue, Workspace, and either the 320px Inspector or its disclosure. The Inspector remains open only while at least 640px of usable Workspace width remains.
- **Hidden/collapsed regions:** With no saved preference, the Inspector is initially collapsed at 1280–1359px and initially open at 1360–1439px. After an explicit user choice, the remembered preference governs throughout Normal laptop while the Workspace minimum remains satisfied.
- **Navigation path:** Same as Wide. Inspector disclosure opens the bounded side panel only when at least 640px of usable Workspace width remains. If opening would violate that minimum, the Inspector remains collapsed and the disclosure explains `Inspector unavailable at this width; increase the viewport or close another constrained surface.`
- **Persistence:** Review and object remain selected while Inspector is closed. Opening restores the exact Inspector context and scroll anchor.
- **Back:** Relationship Back stays inside Inspector when open and in the Workspace selected-record header when closed.
- **Focus:** Opening moves focus to the Inspector heading only after explicit keyboard activation. Closing restores the disclosure.
- **Scroll:** Queue, Workspace, Inspector independently scroll. Opening Inspector never shifts Workspace vertically.
- **Modes/decision:** Both remain persistent in Workspace.
- **No-data/failure:** Same owner behaviour as Wide.
- **200% zoom:** Becomes Tablet/Mobile responsibility.

### Narrow laptop

- **Visible regions:** Rail, compact Queue, Workspace, Inspector-drawer control.
- **Hidden/collapsed regions:** Expanded Queue content and persistent Inspector.
- **Navigation path:** Compact Queue still selects review. A labelled `Open review queue` overlay exposes full search/filter/group rows without becoming route navigation. Record detail opens Inspector drawer.
- **Persistence:** Review and object persist when Queue overlay or Inspector drawer closes.
- **Back:** Drawer Back first follows relationship return; Close returns to the invoking record. Queue overlay Close returns to its opener.
- **Drawer:** One drawer exists at a time. Opening Inspector closes Queue overlay; a dirty Human Decision modal blocks both.
- **Focus:** Drawer initial focus is its heading; focus is contained only when the drawer blocks background interaction. Close restores the invoker.
- **Scroll:** Workspace remains primary. Drawer owns contained vertical scroll; compact Queue does not scroll. Queue overlay owns its list scroll.
- **Modes:** Persistent; labels may shorten only when accessible names remain full.
- **Decision:** Persistent readiness action opens readiness drawer, then modal.
- **No-data/failure:** Compact orientation retains review identity and the drawer/overlay states own their errors.
- **200% zoom:** Resolves to Tablet or Mobile.

### Tablet

- **Visible regions:** One principal step plus compact global navigation and persistent review orientation.
- **Hidden/collapsed regions:** Rail and Queue are not simultaneous panels; Inspector is a drawer.
- **Navigation path:** Review list → selected review Workspace → selected record; contextual Inspector opens over the current step.
- **Persistence:** Selecting a review preserves list filters/scroll. Returning from Workspace restores the selected row and scroll. Mode/object state remains in the review session.
- **Back:** From selected record, Back returns to its mode collection; from selected review, Back returns to review list; global route Back remains separate.
- **Drawer:** Contextual Inspector is one full-height right-edge drawer. Close does not deselect.
- **Focus:** Forward navigation focuses destination heading. Back restores the originating record/row. Drawer focus returns to its invoker.
- **Scroll:** Exactly one principal step scrolls; an open drawer owns its own contained scroll and freezes the background.
- **Modes:** Horizontally scrollable mode navigation with visible current mode and no hidden selected state. Scrolling modes does not scroll content.
- **Decision:** Readiness is a full-width action; modal becomes a large contained dialog.
- **No-data/failure:** Retain source and review identity at the top; recovery stays in the current step.
- **200% zoom:** This is the expected desktop reflow state near 1280–1918 physical pixels at 200%, subject to browser chrome.

### Mobile

- **Visible regions:** One full functional step: review list, selected-review Overview/mode, selected-record detail, decision readiness, or Human Decision.
- **Hidden/collapsed regions:** No persistent Rail, Queue, or Inspector panel. Global navigation is a disclosure.
- **Navigation path:** Review list → selected review → mode collection → selected record; decision readiness → Human Decision.
- **Persistence:** Review identity remains in a compact sticky orientation header. List query/filters/scroll, mode, selected object, and draft survive forward/back within the task.
- **Back:** Selected record → mode collection; mode collection/selected review → review list; Human Decision Cancel → readiness. Dirty draft invokes discard warning.
- **Drawer:** Supporting Inspector content is integrated into the selected-record step. Only short auxiliary selectors use a drawer; complete record detail is not hidden in a drawer.
- **Focus:** Each forward step focuses its heading. Back restores the exact invoking row/control. Browser viewport never lands focus on the body.
- **Scroll:** One page/step scroll at a time. Sticky review orientation and action footer do not cover content.
- **Modes:** A labelled compact mode selector followed by current-mode heading. Core modes remain reachable without horizontal precision.
- **Decision:** Human Decision is a full-screen contained flow with sticky heading/context and action footer; body alone scrolls.
- **No-data/failure:** The step retains repository/PR/source when known and exposes Back plus one recovery action.
- **200% zoom:** Content remains a single-column sequence with no horizontal page scroll except intentionally scrollable technical code/diff fragments.

## Responsive state transfer

| Transition | Required transfer |
| --- | --- |
| Wide/Normal → Narrow | Persistent Inspector closes into drawer control without deselection. Expanded Queue becomes compact; its scroll anchor and group state persist. Focus moves only if the currently focused control becomes hidden, then it moves to the corresponding disclosure. |
| Narrow → Tablet | Queue state becomes Review-list state; selected review stays open if one exists. Rail area becomes compact global navigation. An open Inspector drawer closes and exposes a reopen control. |
| Tablet → Mobile | Selected review/object remain. Inspector detail becomes the selected-record step. Mode control recomposes without resetting mode. |
| Mobile/Tablet → wider | Review list state repopulates Queue; selected review row remains selected; selected-record step becomes Workspace selection plus Inspector context. Focus stays on the semantic control with the same identity. |
| Any state with modal open | Modal remains open and recomposes. Draft, validation, pending state, and frozen transaction identities persist. Background layout transitions while inert. |

## Keyboard focus order

### Wide workstation

The document Tab sequence is:

1. skip links (`Skip to Workspace`, then `Skip to review queue`);
2. Rail area controls and current-area disclosure;
3. Queue toolbar: search, filters, group disclosures, visible review-row controls, Queue collapse;
4. selected-review header actions and mode navigation;
5. active Workspace collection in document order;
6. selected-record contextual actions embedded in Workspace;
7. Inspector disclosure/heading and Inspector controls;
8. decision-readiness entry and Human Decision action.

Sticky visual placement never changes DOM order. Independent scroll regions receive a programmatic name and do not require focus merely to scroll with wheel/touch; keyboard users reach their first interactive content naturally.

### Normal and narrow laptop

Normal follows Wide with collapsed Inspector content omitted from Tab order. Its disclosure occupies the Inspector position. Narrow follows Rail → compact Queue controls → header/modes → Workspace → Inspector drawer trigger → decision readiness. Open Queue overlay or Inspector drawer removes inert background controls from Tab order and contains focus until closed.

### Tablet and mobile

Tab order follows the visible step only: skip/global navigation → Back/orientation → step heading/actions → records → decision entry. Hidden prior and future steps are absent from Tab order. An open drawer or modal contains focus. Closing restores the exact invoker or the nearest stable fallback named below.

## Skip behaviour

`Skip to Workspace` is the first focusable control after page entry. It focuses the active mode heading and scrolls the Workspace region to reveal it without resetting its saved position beyond the minimum needed. If no review is selected, it focuses the no-selection heading. If the review is unavailable, it focuses the unavailable heading.

`Skip to review queue` focuses Queue search when expanded, the Queue restore control when collapsed, or the Review-list heading on Tablet/Mobile. Skip links become visible on focus.

## Collection focus and selection

- Queue and record collections use ordinary list/table semantics, not ARIA application mode.
- Focus is the keyboard's current location. Selection is the persistent review/object context. They always have different visual cues.
- `J`/`K` moves focus, not selection. `Enter` activates the focused row and changes selection.
- Tab exits the current collection to its next logical control. It does not traverse every non-interactive cell.
- A row with secondary actions exposes them after its primary activation control in DOM order.
- Group headers are buttons with expanded state. Collapsing a group containing focus returns focus to the group disclosure and retains selected-row orientation.
- Filtering that removes the focused row moves focus to the filter summary; selection follows the separate selected-outside-filters rule.

## Mode activation

Mode navigation uses a tablist only when each mode panel is present as one selected tab panel. Left/Right arrows move focus among mode tabs without activation; `Enter` or `Space` activates the focused tab. Home/End move to first/last tab. Direct mode shortcuts activate immediately only under the shortcut scope below. On Mobile the compact selector uses native select/listbox semantics and does not imitate desktop tabs.

Activation retains selected review, follows the selection-survival contract, restores the destination scroll anchor, and announces `[Mode], [count/state], [selection retained/cleared]` politely.

## Scoped shortcut candidate map

These assignments are binding R4C implementation candidates. R4C must validate real browser, operating-system, screen-reader, international-layout, input, and embedded-editor behaviour before they gain production authority.

| Shortcut | Scope | Candidate action | Suppression/conflict rule | Discoverability |
| --- | --- | --- | --- | --- |
| `J` | Queue scope | Focus next visible review row. | Suppressed in text entry, editable content, modal/drawer focus trap, command palette, native select/listbox, or while modifiers other than Shift are pressed. | Queue help and command palette. |
| `K` | Queue scope | Focus previous visible review row. | Same as `J`; `Cmd/Ctrl K` always belongs to palette. | Queue help and command palette. |
| `J` / `K` | Active Workspace collection scope | Focus next/previous primary record in the current mode. | Never crosses into another mode or Queue. Same suppression rules. | Mode help and palette. |
| `Enter` | Focused actionable row | Select/open the focused review or record. | Native semantics govern buttons/links. Never confirms from textarea, modal body, or generic record region. | Row action label. |
| `E` | Workspace global scope | Activate Evidence mode. | Suppressed whenever typing/editing, a modal/drawer/palette is open, a modifier is pressed, or assistive-technology browse/application interaction reports the keystroke consumed. | Mode tooltip/help/palette. |
| `R` | Workspace global scope | Activate Requirements mode. | Same suppression. It never triggers browser reload because unmodified `R` has no standard reload behaviour. | Mode tooltip/help/palette. |
| `H` | Workspace global scope | Activate History mode. | Same suppression. | Mode tooltip/help/palette. |
| `D` | Workspace global scope | Open decision readiness. | Same suppression; never directly opens or confirms Human Decision. | Readiness action/help/palette. |
| `[` | Workstation layout scope | Collapse Queue; when collapsed, restore Queue. | Suppressed in typing/editing, modal/drawer/palette, and when browser/AT consumes key. Tablet/Mobile opens Review list instead of synthesising a panel. | Collapse tooltip/help/palette. |
| `]` | Workstation layout scope | Collapse Inspector; when collapsed with a selected context, restore Inspector. | Same suppression. Narrow/Tablet opens/closes Inspector drawer. Mobile goes to/returns from selected-record detail only from a safe context. | Inspector tooltip/help/palette. |
| `Cmd/Ctrl K` | Logged-in route scope | Open scoped command palette. | Browser-reserved behaviour is prevented only after the Workspace root confirms focus is inside the application and no native editable/menu interaction owns it. | Rail/route command control. |
| `Esc` | Current contextual scope | Close the top non-destructive overlay or return one contextual level. | Dirty Human Decision opens discard warning; pending save refuses dismissal; browser Escape remains untouched when no R4 context consumes it. | Overlay close label and keyboard help. |

### Shortcut focus scope

Scope is determined by the most recent explicit focus entry:

- focus in Queue toolbar/row establishes Queue scope;
- focus in active Workspace mode/record establishes Workspace collection scope;
- focus in Inspector does not grant `J`/`K`; related records use Tab and Enter;
- opening any modal, drawer, menu, native select/listbox, or command palette suspends global letter shortcuts;
- pointer activation establishes the scope of the activated region without moving selection beyond the activated control;
- after route entry with focus outside collections, `J`/`K` do nothing.

No shortcut is required. Every action is reachable by visible native controls and Tab/Enter/Space.

## Command palette scope

The palette contains only actions already available in the current truthful state:

- switch product area or current Review contextual route;
- select a loaded review by repository/PR/title;
- activate one of the five modes;
- open the currently supported Queue/Inspector/focus-mode controls;
- open decision readiness;
- open a selected object's direct related records;
- invoke a supported exact condition action only after navigating to its visible confirmation control, not directly from the palette.

The palette never records Human Decision, clears/reopens a condition, marks task progress, posts to GitHub, claims an integration connection, or invokes an unavailable action. Commands name the review/object they target. Closing restores the palette invoker.

## Inspector, drawer, and overlay focus

- Opening persistent Inspector through a disclosure focuses its heading only when the user explicitly requests focus transfer; pointer selection of a Workspace row leaves focus on that row.
- Opening an Inspector drawer always focuses its heading because it changes the active surface.
- Drawer Close restores its invoker. If removed, fallback order is selected record → active mode heading → selected-review header.
- `Esc` precedence is: discard warning → non-dirty Human Decision modal → command palette/menu → Inspector drawer/Queue overlay → Inspector explicit readiness/ownership context → primary object → focus mode. Pending Human Decision consumes Escape without closing. At no layer does Escape change the selected review.
- Queue collapse focus returns to Queue restore. Inspector collapse focus returns to Inspector restore. Focus-mode exit returns to the focus-mode control and restores pre-focus panel preferences.

## Human Decision modal focus

1. Opening marks background regions inert and freezes background scroll.
2. Initial focus lands on the unselected outcome group instruction/first outcome.
3. Tab and Shift+Tab cycle within the modal.
4. Invalid confirm moves focus to the first unmet required field in field order.
5. Dirty Escape/scrim/Cancel opens the discard warning. `Keep editing` receives initial focus.
6. Pending save disables Cancel and dismissal; the modal announces `Saving decision` politely once.
7. Conflict/write failure focuses the error summary, preserves fields, and exposes Retry/Reload before Cancel.
8. Verified success restores the invoking readiness control or new decision summary and announces outcome/applicability.
9. Cancel restores the exact invoker. If it no longer exists, fallback is decision-readiness heading, then selected-review header.

## Announcements

Use a restrained polite status region for:

- selected review opened: repository, PR, title, recommendation;
- mode activated: name and collection state/count;
- related record activated: type, title, destination mode;
- selection removed after update;
- Queue row regrouped while selection remains;
- panel collapsed/restored when the visual change is not evident from focus;
- verified mutation success, unchanged duplicate, copied/exported result.

Use an assertive alert for:

- selected review unavailable after explicit navigation;
- invalid/corrupt source;
- mutation failure or verification mismatch;
- stale save conflict;
- modal validation only when Confirm was attempted.

Do not announce routine focus movement, every loading skeleton, or repeated unchanged limitation text. Status messages include the affected object and recovery action.

## Scroll and sticky responsibility

- Rail does not routinely scroll; at extreme height/zoom its controls enter one labelled overflow menu.
- Queue owns one scroll region; sticky group headings never cover the selected row.
- Workspace owns one scroll region; selected-review header and mode navigation may remain sticky as one stack. Decision entry may remain sticky only when it does not obscure the last record or focus target.
- Inspector/drawer owns one scroll region. Activating a new object resets Inspector detail to top; returning through the one-level token restores its prior anchor.
- Modal body owns one scroll region; heading/context and footer remain visible at standard and short height.
- Focus movement scrolls only its owning region by the minimum amount. Overscroll containment prevents routine panel chaining.

## Focus mode and collapse controls

Queue and Inspector each expose a text-equivalent disclosure with current expanded state. When both are manually collapsed, their individual restore controls remain and their stored preferences remain independent.

Focus mode is a separate labelled command. It temporarily overrides both presentations, records their pre-focus state, and leaves a compact orientation bar containing repository/PR, recommendation, risk, blockers, Human Decision applicability, active mode, selected object, and `Exit focus mode`. It never hides decision responsibility. `[` and `]` continue to update the saved post-focus preferences without expanding panels until focus mode exits; the control announces that the preference was saved.

Responsive drawers open above focus mode and return to it. Tablet/Mobile focus mode removes only secondary chrome because the normal composition is already sequential.

## R4C validation gates

R4C must visibly validate:

- all five breakpoint states and the transfer rules at boundary widths;
- 200% zoom at a desktop viewport, short viewport, landscape tablet, and 320px mobile width;
- long repository/title/path truncation with accessible full values;
- independent selection and focus styling;
- all Tab sequences and skip targets;
- every candidate shortcut under allowed and suppressed scope;
- keyboard-only relationship traversal and contextual Back;
- Queue/Inspector collapse, both collapsed, and focus mode;
- drawer containment and restoration;
- standard-height and short-height Human Decision modal, dirty discard, validation, pending, conflict, failure, and success;
- polite/assertive announcement timing with a screen reader;
- reduced motion and no essential hover/drag behaviour.

Production shortcut authority remains reserved for the R4C browser validation result and final R4G acceptance. The underlying keyboard-complete architecture is binding now.
