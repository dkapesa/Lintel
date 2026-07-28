# R4C Workspace Reconstruction Lab Guide

> **Milestone:** R4C — Workspace Reconstruction Lab  
> **Route:** `/visual-lab/workspace-r4`  
> **Status:** Private laboratory implemented; authority transfer remains pending human acceptance.  
> **Boundary:** Controlled planned-R4 fixtures only. Nothing in this route is a production report, production Human Decision, external delivery, or current integration connection.

## Open the laboratory

Run the repository with its existing development script and open:

`http://localhost:3000/visual-lab/workspace-r4?state=overview`

The ordinary lab view includes a compact collapsible control at the upper right. It selects a controlled state and fixture variant, reports the active slug and viewport guidance, copies the current link, and resets the lab. The persistent label `Controlled R4C fixture — planned R4 behaviour` remains visible in every state.

## Addressable states

Every state is deterministic. Add `&capture=1` to any URL for the screenshot-ready form.

### Canonical 24-state atlas

| State | Exact URL |
| --- | --- |
| Wide default Overview | `/visual-lab/workspace-r4?state=overview` |
| Queue with multiple groups and focus distinct from selection | `/visual-lab/workspace-r4?state=queue-groups` |
| Queue compact/collapsed | `/visual-lab/workspace-r4?state=queue-collapsed` |
| Finding selected | `/visual-lab/workspace-r4?state=finding-selected` |
| Evidence selected | `/visual-lab/workspace-r4?state=evidence-selected` |
| Missing proof selected | `/visual-lab/workspace-r4?state=missing-proof-selected` |
| Writable exact-condition requirement selected | `/visual-lab/workspace-r4?state=requirement-selected` |
| Affected file selected, context unavailable | `/visual-lab/workspace-r4?state=file-selected` |
| History mode | `/visual-lab/workspace-r4?state=history` |
| Run selected | `/visual-lab/workspace-r4?state=run-selected` |
| Readiness Delta and Review Diff | `/visual-lab/workspace-r4?state=readiness-diff` |
| Decision readiness | `/visual-lab/workspace-r4?state=decision-readiness` |
| Human Decision, standard height | `/visual-lab/workspace-r4?state=decision-modal` |
| Human Decision, short height | `/visual-lab/workspace-r4?state=decision-modal-short` |
| Inspector collapsed | `/visual-lab/workspace-r4?state=inspector-collapsed` |
| Focus mode | `/visual-lab/workspace-r4?state=focus-mode` |
| Loading | `/visual-lab/workspace-r4?state=loading` |
| Unavailable requested review | `/visual-lab/workspace-r4?state=unavailable-review` |
| Narrow laptop with Inspector drawer | `/visual-lab/workspace-r4?state=narrow` |
| Tablet selected review | `/visual-lab/workspace-r4?state=tablet` |
| Mobile review list | `/visual-lab/workspace-r4?state=mobile-review-list` |
| Mobile selected review | `/visual-lab/workspace-r4?state=mobile-selected-review` |
| Mobile selected record | `/visual-lab/workspace-r4?state=mobile-selected-record` |
| Mobile Human Decision | `/visual-lab/workspace-r4?state=mobile-decision` |

### Supplementary architecture and recovery states

| State | Exact URL |
| --- | --- |
| Normal laptop | `/visual-lab/workspace-r4?state=normal-laptop` |
| Inspector with no explicit selection | `/visual-lab/workspace-r4?state=inspector-no-selection` |
| Selected Queue group collapsed | `/visual-lab/workspace-r4?state=queue-selected-group-collapsed` |
| Both supporting regions collapsed | `/visual-lab/workspace-r4?state=both-panels-collapsed` |
| Partial projection | `/visual-lab/workspace-r4?state=partial-projection` |
| Empty Workspace | `/visual-lab/workspace-r4?state=empty-workspace` |
| Initial run | `/visual-lab/workspace-r4?state=initial-run` |
| Invalid history | `/visual-lab/workspace-r4?state=invalid-history` |
| Stale Human Decision | `/visual-lab/workspace-r4?state=stale-decision` |
| Unbound Human Decision | `/visual-lab/workspace-r4?state=unbound-decision` |
| Selected review outside filters | `/visual-lab/workspace-r4?state=selected-outside-filters` |
| Selected object removed | `/visual-lab/workspace-r4?state=selected-object-removed` |
| Unresolved relationship | `/visual-lab/workspace-r4?state=unresolved-relationship` |
| Slow detail | `/visual-lab/workspace-r4?state=slow-detail` |
| Complete stress catalogue | `/visual-lab/workspace-r4?state=stress` |
| Reduced-motion evidence | `/visual-lab/workspace-r4?state=reduced-motion` |

### Requirement and handoff capability states

| State | Exact URL |
| --- | --- |
| Exact-condition write failure | `/visual-lab/workspace-r4?state=condition-write-failure` |
| Condition saved, projection refresh failure | `/visual-lab/workspace-r4?state=condition-refresh-failure` |
| Read-only derived requirement | `/visual-lab/workspace-r4?state=derived-requirement` |
| Reopened requirement variant | `/visual-lab/workspace-r4?state=requirement-reopened` |
| Advisory-open requirement variant | `/visual-lab/workspace-r4?state=requirement-advisory` |
| Cleared requirement variant | `/visual-lab/workspace-r4?state=requirement-cleared` |
| Stale requirement variant | `/visual-lab/workspace-r4?state=requirement-stale` |
| Unavailable requirement variant | `/visual-lab/workspace-r4?state=requirement-unavailable` |
| GitHub App connected | `/visual-lab/workspace-r4?state=github-connected` |
| GitHub App unavailable | `/visual-lab/workspace-r4?state=github-unavailable` |

GitHub App defaults to `Available`; `Connected` and `Unavailable` are controlled alternatives. GitHub Action remains `Blueprint`. Slack handoff remains `Export-only`. No state connects, installs, posts, or sends.

### Human Decision outcome and transaction states

| State | Exact URL |
| --- | --- |
| Outcome: Approve | `/visual-lab/workspace-r4?state=decision-outcome-approve` |
| Outcome: Approve with accepted risk | `/visual-lab/workspace-r4?state=decision-outcome-approve-with-accepted-risk` |
| Outcome: Tests required | `/visual-lab/workspace-r4?state=decision-outcome-tests-required` |
| Outcome: Review required | `/visual-lab/workspace-r4?state=decision-outcome-review-required` |
| Outcome: Request changes | `/visual-lab/workspace-r4?state=decision-outcome-request-changes` |
| Outcome: Blocked | `/visual-lab/workspace-r4?state=decision-outcome-blocked` |
| Outcome: Defer decision | `/visual-lab/workspace-r4?state=decision-outcome-defer` |
| Valid rationale | `/visual-lab/workspace-r4?state=decision-valid-rationale` |
| References selected | `/visual-lab/workspace-r4?state=decision-references` |
| Accepted risk without reference | `/visual-lab/workspace-r4?state=decision-accepted-risk-no-reference` |
| Accepted risk acknowledgement unchecked | `/visual-lab/workspace-r4?state=decision-accepted-risk-unchecked` |
| Open blocker acknowledgement | `/visual-lab/workspace-r4?state=decision-blocker-acknowledgement` |
| Missing-head acknowledgement | `/visual-lab/workspace-r4?state=decision-missing-head` |
| Confirm enabled | `/visual-lab/workspace-r4?state=decision-confirm-enabled` |
| Dirty discard warning | `/visual-lab/workspace-r4?state=decision-discard-warning` |
| Saving | `/visual-lab/workspace-r4?state=decision-saving` |
| Validation error | `/visual-lab/workspace-r4?state=decision-validation` |
| Stale-head conflict | `/visual-lab/workspace-r4?state=decision-head-conflict` |
| Effective-record conflict | `/visual-lab/workspace-r4?state=decision-conflict` |
| Storage write failure | `/visual-lab/workspace-r4?state=decision-write-failure` |
| Read-back mismatch | `/visual-lab/workspace-r4?state=decision-readback-mismatch` |
| Duplicate no-op | `/visual-lab/workspace-r4?state=decision-duplicate` |
| Verified success | `/visual-lab/workspace-r4?state=decision-success` |
| Stale decision reaffirmation | `/visual-lab/workspace-r4?state=decision-reaffirm` |
| Decision supersession | `/visual-lab/workspace-r4?state=decision-supersede` |
| Decision withdrawal | `/visual-lab/workspace-r4?state=decision-withdrawal` |

All recorded decisions are sample in-memory lab events. The automated GitHub analysis comment and Human Decision remain separate. The production Human Decision ledger is never called.

## Fixture variants

The normal control exposes these variants through `variant=`: `canonical`, `partial`, `empty`, `unavailable`, `initial`, `invalid-history`, `stale-decision`, `unbound-decision`, `reopened-requirement`, `advisory-requirement`, `cleared-requirement`, `stale-requirement`, `unavailable-requirement`, `stress`, `github-connected`, and `github-unavailable`.

The canonical default always mounts exactly four open requirements, all four blocking. Across the controlled catalogue exactly two requirement identities are writable canonical conditions and nine are read-only derived requirements. Inactive reopened, advisory, cleared, stale, and unavailable variants never alter the default counts.

## Capture mode

Append `capture=1`, for example:

`http://localhost:3000/visual-lab/workspace-r4?state=finding-selected&capture=1`

Capture mode hides the lab control, suppresses the framework development portal, keeps the fixture label, applies any state-specific focus marker, disables non-deterministic display, and retains native roles, names, focusability, live regions, and dialog semantics. There are no time-based animations or live timestamps in the fixture.

## Keyboard controls

| Key | Candidate behaviour |
| --- | --- |
| `J` / `K` | Move focus through the active Queue or mode-local record collection. |
| `Enter` | Select or open the focused review/record. |
| `E` | Evidence mode. |
| `R` | Requirements mode. |
| `H` | History mode. |
| `D` | Decision readiness. |
| `[` | Collapse/restore or open/close the Queue for the current responsibility state. |
| `]` | Collapse/restore or open/close the Inspector for the current responsibility state. |
| `Cmd/Ctrl K` | Open the read-only navigation command palette. Mutation commands are absent. |
| `Esc` | Close the current contextual level using the contracted precedence. |

Shortcuts are suppressed in input, textarea, select and editable content, during modal containment, and when modifiers conflict. All operations have visible controls. Arrow keys, Home and End move focus within the five-mode tablist.

## Viewport targets

- Wide: `≥1440px`; Rail 52px, Queue 264px, dominant Workspace, Inspector 352px.
- Normal: `1280–1439px`; Queue retained, Inspector collapsible. First load is collapsed at 1280–1359px and open at 1360–1439px when no preference exists.
- Narrow: `960–1279px`; Rail and dominant Workspace, with the Queue collapsed by default into one readable on-demand drawer and the Inspector remaining on demand.
- Tablet: `640–959px`; review list → Workspace → contextual drawer.
- Mobile: `<640px`; review list → selected review → selected record or consequential action.

The same Workspace DOM is used in every responsibility state. At zoom, responsibility follows the effective CSS viewport instead of squeezing the four-region shell.

## Reset and storage boundary

`Reset laboratory` restores PR #482, the canonical fixture, Overview mode, open default groups, panel defaults, requirement/task states, and lab-local decision state. Ordinary panel preferences may use only `sessionStorage` key `lintel.r4c.lab.preferences`. Capture mode does not persist preferences. No production storage key or production ledger is read or written.

## Browser validation results

Validated in the Codex in-app Chromium browser for `1600×1000`, `1440×900`, `1366×768`, `1280×800`, `1024×768`, `768×1024`, `390×844`, `320×700`, and short modal `960×400`. Complete-viewport captures had no document-level horizontal overflow. The Narrow Queue is collapsed by default and opens as one 288px focus-managed drawer. The Normal 1366 header retains its compact four-column verdict calibration; the accepted 640/960/1280/1440 responsibility thresholds did not change.

The correction pass withholds live recommendation, risk, blockers, run/head, readiness and Human Decision authority in the unavailable state; loading retains only identity while current detail loads. The Workspace readiness bar is the sole persistent primary Human Decision entry. All five modes and focus mode retain final-content clearance above that bar, and consequential dialogs suppress lab controls while open.

The browser controller could not change browser zoom. The 200% review image therefore uses the exact effective CSS viewport (`720×450` for a `1440×900` host target) and is scaled to the host-pixel canvas for review. Manual browser-zoom confirmation remains listed in the temporary package. Reduced-motion CSS removes smooth scrolling and suppresses transition/animation duration; the addressable reduced-motion state exposes this evidence visibly.

Validated interactions include all five modes; Queue, Inspector and focus collapse; stable Queue selection through filtering, collapse and regrouping; explicit relationship traversal and one-level Back; exact-condition clear/reopen; read-only derived requirements; task-progress separation; seven decision outcomes; modal focus containment; dirty Escape warning; conflict, write failure and pending-save refusal; deterministic success; command-palette restoration; shortcut suppression; and bounded progressive reveal.

## Screenshot manifest

The temporary untracked `R4C_HUMAN_REVIEW_PACKAGE/` contains the 28 required PNG files plus one focused Narrow Queue correction image, exact URLs, viewport details, validation notes and keyboard/focus capture steps. The numbered files are:

1. `01_wide_overview_1600x1000.png`
2. `02_wide_queue_focus_1600x1000.png`
3. `03_queue_collapsed_inspector_open_1600x1000.png`
4. `04_finding_relationship_trace_1600x1000.png`
5. `05_missing_proof_selected_1600x1000.png`
6. `06_writable_requirement_1600x1000.png`
7. `07_readonly_requirement_1600x1000.png`
8. `08_file_context_unavailable_1600x1000.png`
9. `09_history_delta_diff_1600x1000.png`
10. `10_run_provenance_1600x1000.png`
11. `11_decision_readiness_stale_1600x1000.png`
12. `12_decision_pristine_1600x1000.png`
13. `13_decision_accepted_risk_enabled_1600x1000.png`
14. `14_decision_short_scrolled_960x400.png`
15. `15_decision_conflict_1600x1000.png`
16. `16_inspector_collapsed_1600x1000.png`
17. `17_focus_mode_1600x1000.png`
18. `18_loading_authority_withheld_1600x1000.png`
19. `19_unavailable_review_1600x1000.png`
20. `20_normal_laptop_1366x768.png`
21. `21_narrow_queue_closed_1024x768.png`
22. `22_tablet_selected_review_768x1024.png`
23. `23_mobile_review_list_390x844.png`
24. `24_mobile_selected_record_390x844.png`
25. `25_mobile_human_decision_390x844.png`
26. `26_desktop_200_percent_zoom_1440x900.png`
27. `27_keyboard_focus_1600x1000.png`
28. `28_reduced_motion_1600x1000.png`
29. `29_narrow_queue_drawer_open_1024x768.png`

Video capture was not available. `KEYBOARD_FOCUS_CAPTURE_STEPS.md` provides the exact manual sequence and identifies the browser-controlled portions that were validated.

## Authority-transfer status

R4A and R4B remain authoritative. This laboratory is the R4C human-acceptance candidate. It becomes production visual authority only after explicit human acceptance; production Workspace conversion remains prohibited until then.
