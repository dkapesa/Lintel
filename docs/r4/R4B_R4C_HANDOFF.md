# R4B to R4C Handoff

> **Milestone:** R4B — Workspace Information and Interaction Architecture
> **Status:** Binding R4B contract pending human acceptance
> **Scope:** Implementation-ready R4C laboratory handoff: canonical scenario, screen/interaction/responsive/accessibility fixtures, exact relationship data, Human Decision states, stress cases, screenshot package, acceptance gates, and validation-only reservations.
> **Authoritative inputs:** The six accepted R4A contracts under `docs/r4/`; the five other R4B contracts; the binding R4B task prompt; targeted repository evidence; supplemental structural screenshots 01, 06, 07, and 08.
> **Excluded scope:** Creating `/visual-lab/workspace-r4`, production UI or routes, `/workspace` changes, dependencies, production data migration, R4C implementation, and any renewed reference analysis.
> **Next owning milestone:** R4C — Workspace Reconstruction Lab.

## Authority transferred to R4C

R4C implements and visually validates the R4B architecture. It does not select another shell, information model, responsive strategy, relationship model, modal flow, shortcut map, or route-family ownership.

The binding hierarchy is:

1. accepted R4A contracts;
2. accepted R4B contracts;
3. R4C controlled implementation and browser validation;
4. external screenshots only for their bounded R4A responsibilities.

After human acceptance of R4C, the laboratory becomes production's visual authority and the external screenshots stop governing production decisions.

## Canonical R4C scenario

| Field | Required value |
| --- | --- |
| Repository | `acme/redemption-api` |
| Pull request | `PR #482` |
| Title | `Add fallback handling for failed discount-code retrieval` |
| Recommendation | `TESTS REQUIRED` |
| Risk | `46/100 MEDIUM` |
| Requirements | `4 open, 4 blocking` |
| Human Decision | `PENDING` |
| Current run | `run_482_03` |
| Current head | `8ac41de9f2b47a31c4d9be00f3a55d3281f6a102` |
| Previous run | `run_482_02` |
| Previous head | `631fb20a6b76d115c9830f71ce738f2b32c81a14` |
| Provenance | `Controlled R4C fixture — planned R4 behaviour` |

The fixture label remains persistent. R4C never presents this scenario as a production report or current live capability.

## Canonical screen-state list

R4C must implement the 24 atlas states as addressable controlled states:

1. Wide default Overview.
2. Queue with multiple groups.
3. Queue compact/collapsed.
4. Finding selected.
5. Evidence selected.
6. Missing proof selected.
7. Requirement selected.
8. Affected file selected.
9. History mode.
10. Run selected.
11. Readiness Delta and Review Diff.
12. Decision readiness.
13. Human Decision modal at standard height.
14. Human Decision modal at short height.
15. Inspector collapsed.
16. Focus mode.
17. Loading state.
18. Unavailable review.
19. Narrow laptop.
20. Tablet.
21. Mobile review list.
22. Mobile selected review.
23. Mobile selected record.
24. Mobile Human Decision flow.

R4C must additionally expose Normal laptop, no explicit Inspector selection, Queue group collapsed around selected review, both supporting regions manually collapsed, partial projection, empty Workspace, initial run, invalid history, stale Human Decision, unbound Human Decision, save conflict, condition write failure, and Human Decision write failure.

## State-fixture requirements

### Review Queue fixtures

Provide at least 58 reviews distributed across all groups:

| Group | Minimum | Required records |
| --- | ---: | --- |
| Needs attention | 12 | PR #482 selected; regression; mixed movement; comparison unavailable; critical/high/medium/low risk; stale decision; missing proof; long repository/title. |
| In review | 8 | Real-owner label and no-owner record; task progress states; repeated PR analyses with head/date disambiguation. |
| Ready | 17 | Applicable Approve and no-decision examples; no findings without false safety wording. |
| Reviewed | 21 | Applicable, stale, withdrawn, superseded, and unbound Human Decision markers. |

Include selected-outside-filters, a collapsed selected group, a partial-history limitation, an invalid requested identity, and deterministic reorder while stable selection survives.

### Selected-review fixtures

PR #482 must contain:

- 24 findings: 4 blocking/high, 8 medium, 12 advisory/low;
- 31 evidence records spanning externally verified, directly observed, human confirmed, builder declared, model inferred, assumption, and unknown classes;
- present, missing, unverified, confirmed, stale, and not-applicable evidence statuses;
- 6 missing-proof records, 2 blocking, 2 stale, 2 advisory;
- 14 affected files plus 3 affected non-file surfaces;
- additions/deletions present, unknown counts, recorded risk, unknown risk, focused context available, and focused context unavailable;
- 11 requirement identities across the complete fixture catalogue. The canonical default mounts exactly 4 currently open requirements, and all 4 are blocking;
- exactly 2 canonical-default blocking requirements are writable canonical conditions; the other 2 canonical-default blocking requirements are read-only derived requirements;
- the other 7 catalogue identities are read-only derived requirements exposed only through separate addressable controlled variants spanning reopened, advisory-open, satisfied/cleared, stale, and unavailable states;
- activating a requirement-status variant replaces the canonical-default requirement projection for that controlled state and recomputes its header counts; inactive catalogue variants never alter the canonical default `4 open / 4 blocking` summary;
- exactly 2 identities remain writable canonical conditions and 9 remain read-only derived requirements across the complete 11-identity catalogue;
- local task statuses `Open`, `In progress`, `Done`, `Not needed`, visibly separated from requirement resolution;
- a current run, previous run, earlier run, invalid prior run, and an initial-run variant;
- Human Decision defaults to `PENDING`; recorded/applicable, stale, unbound, withdrawn, and superseded are separate controlled states, and only the active state is presented as current;
- GitHub App defaults to `Available`; `Connected` and `Unavailable` are separate controlled states, and only the active App state is presented as current;
- GitHub Action Blueprint and Slack Export-only records.

### Provenance fixtures

Provide separate source states for durable local, session, fixture, deterministic, model-assisted, fallback, partial, unavailable, and historical-schema. Each state carries explicit label, limitation, and action boundary. Do not reuse colour as the only distinction.

## Exact relationship records

R4C fixtures must use stable IDs and explicit adjacency. Text similarity is never enough.

| ID | Type | Required state | Explicit outgoing relationships |
| --- | --- | --- | --- |
| `finding-fallback-retrieval` | Finding | HIGH, blocking, Rule detected, current | evidence `evidence-error-path-observed`; evidence `evidence-model-timeout`; missing proof `proof-retry-integration`; requirement `requirement-fallback-proof`; file `file-retrieve-ts`. |
| `finding-cache-staleness` | Finding | MEDIUM, advisory, Model assisted | evidence `evidence-model-timeout`; non-default requirement `requirement-cache-review` only when that controlled variant is active; surface `surface-discount-cache`. |
| `evidence-error-path-observed` | Evidence | directly observed, present, current | finding `finding-fallback-retrieval`; requirement `requirement-fallback-proof`; file `file-retrieve-ts`. |
| `evidence-model-timeout` | Evidence | model inferred, unverified, current | findings `finding-fallback-retrieval`, `finding-cache-staleness`; non-default requirement `requirement-timeout-test` only when that controlled variant is active. |
| `evidence-prior-test` | Evidence | externally verified, stale, prior head | missing proof `proof-retry-integration`; requirement `requirement-fallback-proof`; run `run_482_02`. |
| `proof-retry-integration` | Missing proof | blocking, missing, current | finding `finding-fallback-retrieval`; requirement `requirement-fallback-proof`; file `file-retrieve-test-ts`; readiness consequence `readiness-blocker-01`. |
| `proof-timeout-boundary` | Missing proof | advisory, unverified | finding `finding-cache-staleness`; non-default requirement `requirement-timeout-test` only when that controlled variant is active; surface `surface-provider-timeout`. |
| `requirement-fallback-proof` | Requirement | blocking open, exact condition writable | proof `proof-retry-integration`; evidence `evidence-error-path-observed`; finding `finding-fallback-retrieval`; file `file-retrieve-test-ts`; condition key fixture `condition-fallback-proof`. |
| `requirement-timeout-test` | Requirement | non-default controlled variant; blocking reopened when active; derived read-only; excluded from canonical-default counts while inactive | proof `proof-timeout-boundary`; evidence `evidence-model-timeout`; finding `finding-fallback-retrieval`; file `file-retrieve-test-ts`. |
| `requirement-cache-review` | Requirement | non-default controlled variant; advisory open when active; derived read-only; excluded from canonical-default counts while inactive | finding `finding-cache-staleness`; surface `surface-discount-cache`. |
| `file-retrieve-ts` | Affected file | +38/−12, focused context available | findings `finding-fallback-retrieval`; evidence `evidence-error-path-observed`; requirement `requirement-fallback-proof`. |
| `file-retrieve-test-ts` | Affected file | counts unknown, context unavailable | missing proof `proof-retry-integration`; requirement `requirement-fallback-proof`; non-default requirement `requirement-timeout-test` only when that controlled variant is active. |
| `run_482_02` | Run | prior, deterministic, exact | changed records; stale evidence `evidence-prior-test`; prior Human Decision `decision-approve-02`. |
| `run_482_03` | Run | current, model-assisted traceable variant | all current records; current head; stale prior decision consequence. |
| `readiness-blocker-01` | Readiness consequence | open blocker | requirement `requirement-fallback-proof`; proof `proof-retry-integration`; Human Decision entry. |

The fixture must also include:

- one `none recorded` relationship;
- one `unavailable` relationship with exact reason;
- one `unresolved` stored ID;
- one partially linked relationship with one valid and one unresolved ID;
- direct/current, direct/historical, blocking/advisory, observed/inferred, missing/stale priority cases;
- a one-level return token through finding → evidence → requirement traversal.

No line or connection may imply an edge that the fixture does not store.

## Run-comparison fixtures

The current-versus-previous pair must show:

- recommendation unchanged at `TESTS REQUIRED`;
- risk movement from `38/100 LOW` to `46/100 MEDIUM`;
- Readiness Delta `REGRESSED`;
- 2 added findings, 1 cleared finding, 1 changed finding;
- 3 new evidence records, 1 stale evidence record;
- 2 requirements opened, 1 cleared, 1 reopened;
- configuration fingerprint changed because the current run is model-assisted;
- previous/current head identity;
- prior Approve decision bound to `631fb20…`, now stale against `8ac41de…`;
- counts linked to exact records.

Provide additional variants for `INITIAL`, `IMPROVED`, `MIXED`, `UNCHANGED`, no usable comparison, and invalid prior history. Readiness Delta stays directional; Review Diff stays record-specific.

## Interaction-fixture requirements

R4C must make these deterministic interactions testable without external services:

1. Select a review and preserve it through regrouping.
2. Search/filter until the selected review is outside results; clear filters.
3. Collapse selected group, Queue, Inspector, both supporting panels, then enter/exit focus mode.
4. Switch all five modes and restore per-mode scroll.
5. Select/deselect each object type.
6. Traverse finding → evidence → missing proof → requirement → file → readiness consequence and return one level.
7. Remove the selected object during a controlled update and apply the recovery rule.
8. Select a run and changed record; activate a Delta count backed by records.
9. Clear and reopen an exact condition with pending, success, write failure, and saved-but-refresh-failed outcomes.
10. Inspect a derived requirement and receive read-only capability explanation.
11. Mark local task progress and show that requirement/proof state does not change.
12. Open decision readiness and each Human Decision outcome.
13. Trigger validation, dirty discard warning, pending save, duplicate no-op, stale-head conflict, persistence failure, read-back mismatch, verified success, reaffirm, change/supersede, and withdraw.
14. Open/close Queue overlay and Inspector drawer with focus restoration.
15. Exercise every shortcut in allowed and suppressed scope.
16. Open command palette and verify mutation commands are absent.
17. Exercise Connected/Available/Unavailable GitHub App, Action Blueprint, and Slack Export-only states without external writes.

## Human Decision modal fixtures

### Outcome states

Provide one state per outcome with no recommendation-derived preselection:

- Approve;
- Approve with accepted risk;
- Tests required;
- Review required;
- Request changes;
- Blocked;
- Defer decision.

### Field and transaction states

Provide:

- pristine, no outcome;
- outcome selected, empty rationale;
- valid rationale;
- references selected;
- accepted risk with zero references;
- accepted risk references selected but acknowledgement unchecked;
- open blockers acknowledgement required;
- missing head acknowledgement required;
- all requirements valid, Confirm enabled;
- standard height;
- short height;
- 200% zoom;
- dirty discard warning;
- saving/pending;
- validation error focused;
- stale head conflict;
- changed effective decision conflict;
- storage failure;
- read-back verification mismatch;
- duplicate unchanged result;
- verified success and focus restoration;
- stale prior decision reaffirmation;
- supersession with prior history retained;
- withdrawal with history retained.

No fixture auto-selects the recommendation outcome. No Enter key from rationale submits. No pending state permits dismissal or a second write.

## Responsive fixtures

| State | Required viewport fixtures | Required evidence |
| --- | --- | --- |
| Wide | 1440×900, 1600×1000 | Four visible regions; independent scroll; Workspace dominance. |
| Normal | 1366×768, 1280×800 | Queue retained; Inspector preference/default collapse; 640px work target. |
| Narrow | 1279×800, 1024×768, 960×720 | Compact Queue; Inspector drawer; one overlay at a time. |
| Tablet | 959×1024, 768×1024, 640×900 | Review list → Workspace → drawer; Back/focus restoration. |
| Mobile | 639×900, 390×844, 320×568 | Full functional sequence; selected-record step; full-screen decision. |
| Zoom | 1440×900 at 200%, 1280×720 at 200% | Responsibility resolves by CSS width; no four-panel compression or lost action. |
| Short modal | Any ≥320px width at 480px and 400px CSS height | Fixed context/footer; body-only scroll; all fields reachable. |

Breakpoint boundary tests use one pixel below, at, and one pixel above `640`, `960`, `1280`, and `1440` CSS pixels.

## Accessibility states visibly testable in R4C

- skip links visible on focus and landing on correct heading;
- independent focus and selection on Queue and records;
- focus indicator against default, selected, semantic, and modal surfaces;
- full accessible names for truncated repository/title/path/hash;
- group disclosure state and selected-row orientation after collapse;
- semantic labels that do not depend on colour;
- observed versus inferred versus missing versus stale evidence;
- blocking versus advisory requirement;
- recommendation versus pending/applicable/stale/unbound Human Decision;
- polite selection/mode/panel/success announcements;
- assertive unavailable/conflict/write-failure announcements;
- drawer and modal containment/restoration;
- dirty Escape warning and pending Escape refusal;
- native control semantics and no Enter-to-confirm from text fields;
- 32px minimum dense and 40px touch-facing targets;
- 200% reflow, 320px width, reduced motion, and keyboard-only operation;
- no hover-only content and no pointer-precision/drag requirement.

## Stress fixtures

R4C must include:

- 58-review Queue with all group/filter/search/selection states;
- repository of 90 characters, title of 220 characters, path of 260 characters, branch of 120 characters, and full 40-character SHAs;
- repeated analyses for one PR with known and unknown head identities;
- 24 findings, 31 evidence records, 11 requirements, 14 files, and 12 runs;
- 80 Human Decision ledger events to represent the current cap;
- partial valid history with omitted invalid entries;
- 10-entry current local history limitation plus a planned long-history laboratory list, clearly distinguished;
- rapid deterministic regrouping while selected identity stays stable;
- selected object removed, selected comparison removed, and relationship target unresolved;
- slow mode detail loading without blocking header/navigation;
- long rationale, 20 references, stale/unavailable references, and all modal acknowledgements;
- local-storage full/unavailable, stale command, read-back mismatch, and refresh failure.

Large inactive collections must not all render simultaneously. R4C must preserve selection and scroll anchors under progressive rendering.

## Required human-review screenshots

Capture at device-pixel ratio 1 unless the zoom state requires otherwise. Each capture must show the complete viewport and persistent fixture label.

1. Wide default Overview at 1600×1000.
2. Wide multiple-group Queue with focus distinct from selection.
3. Queue collapsed and Inspector open.
4. Finding selected with explicit relationship trace.
5. Missing proof selected.
6. Writable exact-condition requirement selected.
7. Read-only derived requirement selected.
8. Affected file with focused context unavailable.
9. History current-versus-previous with Readiness Delta and Review Diff.
10. Run selected with provenance/reproducibility.
11. Decision readiness with stale prior decision and GitHub Available.
12. Human Decision pristine standard height.
13. Approve with accepted risk acknowledgements and Confirm enabled.
14. Human Decision short height with body scrolled to final acknowledgement.
15. Human Decision save conflict preserving draft.
16. Inspector collapsed with selected object retained.
17. Focus mode orientation bar.
18. Partial loading/limitation state.
19. Unavailable requested review with no substitute.
20. Normal laptop at 1366×768.
21. Narrow laptop with Inspector drawer.
22. Tablet selected review.
23. Mobile review list at 390×844.
24. Mobile selected record.
25. Mobile Human Decision.
26. Desktop browser at 200% zoom.
27. Visible keyboard focus on selected and unselected controls.
28. Reduced-motion state or test evidence panel.

The human review package also includes a short keyboard/focus capture showing skip-to-Workspace, Queue `J/K` focus, Enter selection, Evidence shortcut, relationship activation, Inspector drawer, decision modal containment, dirty Escape warning, and focus restoration.

## Traceability to R4A

| R4A contract | R4C proof required |
| --- | --- |
| `README.md` | First-five-second Overview and complete evidence-chain navigation. |
| `R4A_ENGINEER_WORKFLOW_CONTRACT.md` | All 14 transitions, requirement truth, comparison, readiness, seven outcomes. |
| `R4A_REFERENCE_AND_VISUAL_SYSTEM_LOCK.md` | Light sustained-use shell, named token calibration, bounded reference influence, no rejected patterns. |
| `R4A_WORKSPACE_SHELL_CONTRACT.md` | Four-region hierarchy, Queue anatomy, five modes, Inspector, responsive transfer, scroll ownership. |
| `R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md` | Capability labels, provenance, modal safeguards, keyboard/zoom/reduced motion, collection stress. |
| `R4A_R4B_R4C_HANDOFF.md` | Canonical scenario, all controlled states, laboratory authority transfer, no production implementation. |

## Matters that must not reach R4C unresolved

R4B resolves the following. R4C must reject its start if any implementation brief reopens or omits them:

- shell and region ownership;
- one-review/one-object selection model;
- Queue group/order/collapse/filter/large-list rules;
- five-mode questions, record order, states, and scroll restoration;
- no-selection Inspector and every selected-object response;
- explicit relationship representation and priority;
- current requirement capability boundaries;
- Readiness Delta versus Review Diff composition;
- decision-readiness field order;
- all seven Human Decision outcomes, fields, acknowledgements, containment, conflict, idempotency, and focus restoration;
- responsive responsibility and navigation sequence;
- focus mode versus manual panel collapse;
- shortcut candidate assignment and suppression scope;
- non-ready/failure messages and recovery;
- route-family primary/contextual ownership;
- Connected, Available, Blueprint, Export-only, and Unavailable meanings;
- canonical fixture values and exact relationship IDs.

No architecture choice remains open.

## Validation-only reservations for R4C

R4C validates, without reopening architecture:

1. breakpoint thresholds at real browser widths and 200% zoom; any numeric shift follows the preservation rule in `R4B_RESPONSIVE_KEYBOARD_FOCUS.md`;
2. shortcut interception across supported browsers, operating systems, international keyboards, and assistive technologies; conflicting candidates are removed from production authority while visible controls remain complete;
3. focus order, containment, restoration, and announcement timing in the implemented DOM;
4. sticky header/footer collision and scroll reachability at short height and zoom;
5. token contrast, focus visibility, truncation disclosure, 32px dense targets, and 40px touch targets;
6. progressive rendering and scroll-anchor stability under stress fixtures;
7. reduced-motion behaviour and the absence of essential animation.

These are implementation-validation results, not unresolved information or interaction architecture.

## R4C acceptance checklist

- [ ] The light shell is recognisably one Lintel engineering workstation.
- [ ] Workspace remains visually and operationally dominant.
- [ ] The canonical review satisfies the first-five-second contract.
- [ ] Exactly one review and at most one primary object are selected.
- [ ] Queue order, filtering, collapse, regrouping, and 58-record stress preserve stable selection.
- [ ] All five modes implement their locked question, order, states, selection, Inspector, and scroll rules.
- [ ] Every object selection produces exactly one documented Inspector/drawer response.
- [ ] Relationship traversal uses only explicit fixture edges and provides contextual Back.
- [ ] No graph canvas, drag, automatic layout, workflow builder, or decorative relationship line exists.
- [ ] Exact conditions clear/reopen; derived requirements remain read-only; task progress remains separate.
- [ ] Readiness Delta and Review Diff remain distinct and link counts to records.
- [ ] Decision readiness is complete and remains distinct from Human Decision.
- [ ] Seven outcomes, rationale, references, acknowledgements, dirty discard, conflict, failure, idempotency, success, and focus restoration work in controlled fixtures.
- [ ] Wide, Normal, Narrow, Tablet, Mobile, short-height, and 200% zoom preserve responsibility.
- [ ] Keyboard-only operation, skip links, shortcut suppression, drawers, modal containment, and announcements validate.
- [ ] Fixtures, local/session/durable, model, stale, partial, unavailable, Blueprint, and Export-only labels remain truthful.
- [ ] All required screenshots and keyboard capture are complete.
- [ ] No production route, production UI, external write, dependency, or unapproved schema is introduced.

## Delivery boundary

R4C receives these six R4B contracts and the updated `docs/r4/README.md`. It may build the private laboratory only after human acceptance of R4B. Production implementation remains prohibited until human acceptance of R4C.
