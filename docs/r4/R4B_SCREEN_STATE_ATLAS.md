# R4B Screen-State Atlas

> **Milestone:** R4B — Workspace Information and Interaction Architecture
> **Status:** Binding R4B contract pending human acceptance
> **Scope:** Low-fidelity structural diagrams for the canonical desktop, responsive, selection, comparison, loading, unavailable, focus, decision-readiness, and Human Decision states required by R4C.
> **Authoritative inputs:** The six accepted R4A contracts under `docs/r4/`; the binding R4B task prompt; `R4B_WORKSPACE_INFORMATION_ARCHITECTURE.md`; `R4B_INTERACTION_STATE_MODEL.md`; `R4B_RESPONSIVE_KEYBOARD_FOCUS.md`.
> **Excluded scope:** Styled mock-ups, image files, production UI, implementation code, visual polish, token calibration, and alternate layouts.
> **Next owning milestone:** R4C — Workspace Reconstruction Lab.

## Diagram notation

- `R` = Global Rail; `Q` = Review Queue; `W` = Verification Workspace; `I` = Contextual Inspector; `D` = drawer/dialog.
- `*` marks persistent review selection. `>` marks keyboard focus. `[x]` marks the one primary selected object.
- `↕` marks an independently owned vertical scroll region. `—` marks persistent/sticky orientation.
- Every state uses the R4C review `acme/redemption-api`, PR `#482`, recommendation `TESTS REQUIRED`, risk `46/100 MEDIUM`, requirements `4 open / 4 blocking`, Human Decision `PENDING`.

## 1. Wide default Overview

```text
┌─R─┬────── Q ↕ ──────┬────────────── W ↕ (dominant) ──────────────┬──── I ↕ ────┐
│●  │ Needs attention │— acme/redemption-api · PR #482 —──────────│Decision ready│
│   │ * #482 title    │ TESTS REQUIRED · 46 MEDIUM · 4 blockers  │4 blockers    │
│   │   #517 title    │ [Overview] Change Evidence Req History   │missing proof │
│   │ In review       │ Highest-impact finding                   │next: inspect │
│   │ Ready           │ Evidence / missing proof / movement      │[Open target] │
│   │ Reviewed        │— Human Decision: PENDING [Assess] —──────│              │
└───┴─────────────────┴────────────────────────────────────────────┴──────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Rail=area; Queue=review selection; Workspace=Overview/readiness; Inspector=next inspection. |
| Primary focus | Overview highest-impact explanation. |
| Persistent review identity | `acme/redemption-api · PR #482` in selected Queue row and Workspace header. |
| Selected object | None. |
| Inspector/drawer state | Inspector open in no-selection decision-readiness state. |
| Scroll ownership | Queue, Workspace, Inspector independently own `↕`; Rail fixed. |
| Primary action | `Inspect first blocker`. |

## 2. Review Queue with multiple groups

```text
┌─R─┬──────────── Q ↕ ────────────┬──────────────── W ↕ ────────────────┬── I ↕ ─┐
│●  │ Search…  Risk▼ Changed▼     │— * PR #482 · TESTS REQUIRED —─────│readiness│
│   │ ▾ Needs attention (12)      │ Overview                            │        │
│   │ >*#482 · 4B · changed       │                                    │        │
│   │   #517 · 2B · stale         │                                    │        │
│   │ ▾ In review (8)             │                                    │        │
│   │ ▸ Ready (17)                │                                    │        │
│   │ ▾ Reviewed (21)             │                                    │        │
└───┴─────────────────────────────┴─────────────────────────────────────┴────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Queue owns grouping, filters, deterministic order, focus and selection distinction. |
| Primary focus | Focused selected Queue row for PR #482. |
| Persistent review identity | Selected row plus Workspace header. |
| Selected object | None. |
| Inspector/drawer state | Open readiness fallback; unaffected by Queue focus. |
| Scroll ownership | Queue scrolls rows; Workspace and Inspector keep their anchors. |
| Primary action | `Enter` opens focused review; group disclosures collapse/expand. |

## 3. Queue compact/collapsed

```text
┌─R─┬─ Q ─┬──────────────────── W ↕ (expanded) ───────────────────┬── I ↕ ─┐
│●  │[>]  │— acme/redemption-api · PR #482 · TESTS REQUIRED —───│readiness│
│   │482* │ 46 MED · 4B · changed                                │        │
│   │4B   │ [Overview] Change Evidence Requirements History      │        │
│   │12/58│                                                      │        │
└───┴─────┴──────────────────────────────────────────────────────┴────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Compact Queue owns selected-review orientation and restore only. |
| Primary focus | Workspace Overview. |
| Persistent review identity | PR #482, repository accessible name, recommendation, blocker count in compact Queue and header. |
| Selected object | None. |
| Inspector/drawer state | Inspector open. |
| Scroll ownership | Compact Queue fixed; Workspace and Inspector scroll. |
| Primary action | `Restore review queue`. |

## 4. Finding selected

```text
┌─R─┬──── Q ↕ ────┬──────────────── W ↕ / Evidence ──────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ Findings                                      │[Finding]    │
│   │             │ >[x] HIGH · fallback hides retrieval failure  │why it matters│
│   │             │      action / file / provenance               │provenance   │
│   │             │ Evidence records                              │evidence (2) │
│   │             │ Missing proof                                 │missing (1)  │
│   │             │                                               │requirements │
└───┴─────────────┴───────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Evidence mode owns collection/primary record; Inspector owns finding explanation and direct links. |
| Primary focus | Selected HIGH finding. |
| Persistent review identity | Header remains PR #482. |
| Selected object | Finding `finding-fallback-retrieval`. |
| Inspector/drawer state | Finding Inspector open at top. |
| Scroll ownership | Workspace scrolls record; Inspector scrolls detail; Queue retains anchor. |
| Primary action | `Open supporting evidence`. |

## 5. Evidence selected

```text
┌─R─┬──── Q ↕ ────┬──────────────── W ↕ / Evidence ──────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ Evidence                                      │[Evidence]   │
│   │             │ >[x] Directly observed · present              │statement    │
│   │             │      run_482_03 · head 8ac41de                │class/strength│
│   │             │      supports Finding F-01                    │source/head  │
│   │             │                                               │findings/req │
└───┴─────────────┴───────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Workspace owns evidence record; Inspector owns provenance/applicability/relationships. |
| Primary focus | Present directly observed evidence. |
| Persistent review identity | Header and Queue selected row. |
| Selected object | Evidence `evidence-discount-error-path`. |
| Inspector/drawer state | Evidence Inspector open. |
| Scroll ownership | Workspace and Inspector independent. |
| Primary action | `Open supported finding`. |

## 6. Missing proof selected

```text
┌─R─┬──── Q ↕ ────┬──────────────── W ↕ / Evidence ──────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ Missing proof                                 │[Missing]    │
│   │             │ >[x] Unverified retry/failure-path test       │what absent  │
│   │             │      affects F-01 / R-01                      │why it matters│
│   │             │      next: produce integration-test result    │proof action │
│   │             │                                               │consequence  │
└───┴─────────────┴───────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Evidence owns first-class missing-proof record; Inspector owns absence explanation and proof path. |
| Primary focus | Blocking missing proof. |
| Persistent review identity | PR #482 persists. |
| Selected object | Missing proof `proof-retry-integration`. |
| Inspector/drawer state | Missing-proof Inspector open. |
| Scroll ownership | Workspace/Inspector independent. |
| Primary action | `Open blocking requirement`. |

## 7. Requirement selected

```text
┌─R─┬──── Q ↕ ────┬──────────── W ↕ / Requirements ──────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ 4 open · 4 blocking                           │[Requirement]│
│   │             │ >[x] R-01 Prove fallback failure path         │required proof│
│   │             │      OPEN · BLOCKING · exact condition        │evidence     │
│   │             │   R-02 Validate timeout handling              │capability   │
│   │             │                                               │[Clear]      │
└───┴─────────────┴───────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Requirements owns collection/status; Inspector owns proof, relationships, exact capability. |
| Primary focus | Open blocking R-01. |
| Persistent review identity | PR #482 persists. |
| Selected object | Requirement `requirement-r01`. |
| Inspector/drawer state | Requirement Inspector open; exact condition action available. |
| Scroll ownership | Workspace/Inspector independent. |
| Primary action | `Clear condition` only after exact capability is established. |

## 8. Affected file selected

```text
┌─R─┬──── Q ↕ ────┬──────────────── W ↕ / Change ────────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ Changed files                                 │[File]       │
│   │             │ >[x] src/discounts/retrieve.ts  +38 −12       │why in scope │
│   │             │      focused context available                │metadata     │
│   │             │   tests/discounts/retrieve.test.ts            │findings (2) │
│   │             │                                               │[Open context]│
└───┴─────────────┴───────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Change owns affected-file collection and focused context; Inspector owns direct risk relationships. |
| Primary focus | `src/discounts/retrieve.ts`. |
| Persistent review identity | PR #482 persists. |
| Selected object | Affected file stable case-local identity. |
| Inspector/drawer state | File Inspector open. |
| Scroll ownership | Workspace/Inspector independent. |
| Primary action | `Open focused change context`; never `Open complete diff` unless truly supported. |

## 9. History mode

```text
┌─R─┬──── Q ↕ ────┬──────────────── W ↕ / History ───────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ Current: run_482_03 · head 8ac41de            │readiness    │
│   │             │ Compare: run_482_02 · head 631fb20 ▼          │current run  │
│   │             │ Readiness Delta: REGRESSED                    │limitations  │
│   │             │ Review Diff: added 2 · changed 1 · cleared 1  │decision stale│
│   │             │ Runs                                          │             │
└───┴─────────────┴───────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | History owns run list/comparison/Delta/Diff; Inspector fallback owns readiness consequence. |
| Primary focus | Current-versus-previous comparison. |
| Persistent review identity | PR #482 persists. |
| Selected object | None; one comparison run selected as comparison state, not primary object. |
| Inspector/drawer state | No-selection readiness with stale-decision consequence. |
| Scroll ownership | History Workspace and Inspector independent. |
| Primary action | `Inspect added blockers`. |

## 10. Run selected

```text
┌─R─┬──── Q ↕ ────┬──────────────── W ↕ / History ───────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ Runs                                          │[Run]        │
│   │             │ >[x] run_482_02 · 631fb20 · deterministic     │base/head    │
│   │             │   current run_482_03 · 8ac41de                │fingerprints │
│   │             │ Comparison remains current ↔ selected         │reproducible │
│   │             │                                               │limitations  │
└───┴─────────────┴───────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | History owns run selection; Inspector owns identity, provenance, reproducibility, comparison limits. |
| Primary focus | Comparison run `run_482_02`. |
| Persistent review identity | PR #482 persists; current run remains fixed. |
| Selected object | Run `run_482_02`. |
| Inspector/drawer state | Run Inspector open. |
| Scroll ownership | Workspace/Inspector independent. |
| Primary action | `Compare with current`. |

## 11. Readiness Delta and Review Diff

```text
┌─R─┬──── Q ↕ ────┬──────────────────── W ↕ / History ───────────────────┬─ I ↕ ─┐
│●  │ * PR #482   │ CURRENT run_03 ↔ PRIOR run_02                         │change │
│   │             │ ┌ Readiness Delta: REGRESSED ───────────────────────┐ │before │
│   │             │ │ recommendation TESTS_REQUIRED → TESTS_REQUIRED   │ │current│
│   │             │ │ risk 38 LOW → 46 MED · opened 2 · reopened 1    │ │links  │
│   │             │ └───────────────────────────────────────────────────┘ │impact │
│   │             │ Review Diff: >[x] reopened R-01 | added F-03 | …     │       │
└───┴─────────────┴───────────────────────────────────────────────────────┴───────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Delta owns direction/counts; Review Diff owns inspectable changes; Inspector owns selected change detail. |
| Primary focus | Reopened requirement change. |
| Persistent review identity | PR #482 and comparison identities visible. |
| Selected object | Review Diff record for R-01. |
| Inspector/drawer state | Changed-record Inspector open. |
| Scroll ownership | Workspace/Inspector independent. |
| Primary action | `Open current requirement`. |

## 12. Decision readiness

```text
┌─R─┬──── Q ↕ ────┬────────────── W ↕ / readiness entry ───────────────┬──── I ↕ ────┐
│●  │ * PR #482   │ Lintel recommendation: TESTS REQUIRED              │[Readiness]  │
│   │             │ Risk 46 MEDIUM · 4 blockers · 4 open               │missing 2    │
│   │             │ Missing/unverified 2 · stale evidence 1            │stale 1      │
│   │             │ run_482_03 · head 8ac41de                           │prior stale  │
│   │             │ Human Decision PENDING · GitHub Available          │next action  │
│   │             │ > [Record Human Decision]                           │             │
└───┴─────────────┴─────────────────────────────────────────────────────┴─────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Workspace readiness entry owns complete pre-modal summary; Inspector owns contextual consequence. |
| Primary focus | Decision-readiness summary. |
| Persistent review identity | PR #482, run/head visible. |
| Selected object | Explicit decision-readiness context, not a Human Decision. |
| Inspector/drawer state | Readiness Inspector open. |
| Scroll ownership | Workspace/Inspector independent. |
| Primary action | `Record Human Decision`. |

## 13. Human Decision modal at standard height

```text
┌──────────────────────── inert Workspace background ────────────────────────┐
│       ┌────────────── D: Human Decision ───────────────────────────┐       │
│       │— acme/redemption-api · PR #482 · run_03 · 8ac41de —───────│       │
│       │ Lintel: TESTS REQUIRED · 46 MED · 4 blockers · PENDING    │       │
│       │ > Outcome (none selected): seven explained choices        │       │
│       │ Rationale *                                                │       │
│       │ References / outcome acknowledgements                      │       │
│       │────────────────────────────────────────────────────────────│       │
│       │                              [Cancel] [Confirm disabled]    │       │
│       └────────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Modal exclusively owns the consequential draft; background regions are inert. |
| Primary focus | Unselected outcome group. |
| Persistent review identity | Modal context shows repository/PR/run/head; background selection preserved. |
| Selected object | Prior Workspace object preserved beneath modal; no outcome selected. |
| Inspector/drawer state | Background Inspector preserved and inert. |
| Scroll ownership | Modal body owns contained scroll; heading/footer fixed; background frozen. |
| Primary action | Outcome-specific Confirm after requirements; Cancel remains separate. |

## 14. Human Decision modal at short height

```text
┌──────────── viewport ────────────┐
│┌─D— PR #482 · run_03 · 4B —────┐│
││ TESTS REQUIRED · head 8ac41de ││ ← fixed context
│├───────────────────────────────┤│
││ Outcome                       ││
││ Rationale                     ││
││ References             ↕ body ││
││ Acknowledgements              ││
│├───────────────────────────────┤│
││        [Cancel] [Confirm]     ││ ← fixed footer
│└───────────────────────────────┘│
└─────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Modal header owns compact context; body fields; footer actions. |
| Primary focus | Current field or first invalid field. |
| Persistent review identity | PR #482/run/head always visible. |
| Selected object | Background object preserved; selected outcome shown in body. |
| Inspector/drawer state | Background inert and not visible as an active drawer. |
| Scroll ownership | Body alone scrolls; viewport/background fixed. |
| Primary action | Confirm remains reachable at every body position. |

## 15. Inspector collapsed

```text
┌─R─┬──── Q ↕ ────┬──────────────────── W ↕ (expanded) ───────────────────┬─I─┐
│●  │ * PR #482   │— PR #482 · TESTS REQUIRED · 4B —────────────────────│[<]│
│   │             │ Evidence                                              │F-01│
│   │             │ >[x] Finding F-01                                     │   │
│   │             │ Relationship strip remains in Workspace               │   │
└───┴─────────────┴───────────────────────────────────────────────────────┴───┘
```

| Required label | State |
| --- | --- |
| Region ownership | Workspace retains selection; collapsed Inspector owns restore/orientation only. |
| Primary focus | Selected finding in Workspace. |
| Persistent review identity | PR #482 persists. |
| Selected object | Finding F-01 persists. |
| Inspector/drawer state | Collapsed with object type/ID and restore control. |
| Scroll ownership | Workspace/Queue scroll; Inspector fixed. |
| Primary action | `Restore Inspector`. |

## 16. Focus mode

```text
┌─R─┬────────────────────────────── W ↕ maximum ──────────────────────────────┐
│●  │— PR #482 · TESTS REQUIRED · 46 MED · 4B · PENDING · Evidence · F-01 —│
│   │ [Exit focus mode] [Queue 12/58] [Inspector: F-01] [Human Decision]     │
│   │                                                                        │
│   │ >[x] Dominant selected record and collection                           │
│   │                                                                        │
└───┴────────────────────────────────────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Workspace dominates; orientation bar temporarily represents Queue/Inspector responsibilities. |
| Primary focus | Selected record in expanded Workspace. |
| Persistent review identity | Repository/PR/recommendation/risk/blockers/decision visible. |
| Selected object | F-01 persists. |
| Inspector/drawer state | Temporarily suppressed; explicit activation opens normal drawer. |
| Scroll ownership | Workspace only until a drawer opens. |
| Primary action | `Exit focus mode`; Human Decision remains reachable. |

## 17. Loading state

```text
┌─R─┬──── Q ──────┬──────────────── W / loading ─────────────────┬──── I ─────┐
│●  │ ▭ repository│— Local reports · Loading selected review… —│Context held│
│   │ ▭ title     │ ▭ header                                    │No stale    │
│   │ ▭ metadata  │ ▭ mode row                                  │detail claim│
│   │             │ ▭ stable record geometry                    │            │
└───┴─────────────┴─────────────────────────────────────────────┴────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Each region owns restrained placeholders; source owner states loading. |
| Primary focus | Workspace loading heading or retained Queue row. |
| Persistent review identity | Requested identity shown when known; never invented. |
| Selected object | Retained but inert when still valid; otherwise none. |
| Inspector/drawer state | Context held without stale detail claim. |
| Scroll ownership | Existing anchors frozen; skeleton does not create new scroll jumps. |
| Primary action | None until ready; route-level retry appears only after failure. |

## 18. Unavailable review

```text
┌─R─┬──── Q ↕ ────┬──────────────── W / unavailable ─────────────┬──── I ─────┐
│●  │ 3 local     │ Requested report: report-2026…                │Unavailable│
│   │ reports     │ > This stored review is no longer available. │reason     │
│   │ no selection│ It may have been cleared or replaced.        │recovery   │
│   │             │ [Return to review list] [Retry]               │           │
└───┴─────────────┴──────────────────────────────────────────────┴───────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Workspace owns requested-identity failure; Queue owns valid available reviews. |
| Primary focus | Unavailable-state heading. |
| Persistent review identity | Requested ID retained; no substitute selected. |
| Selected object | None. |
| Inspector/drawer state | Unavailable explanation only. |
| Scroll ownership | Queue scrolls; failure Workspace is a simple region. |
| Primary action | `Return to review list`; Retry secondary. |

## 19. Narrow laptop

```text
┌─R─┬─Q─┬──────────────────────── W ↕ ─────────────────────────────┐
│●  │482│— PR #482 · TESTS REQUIRED · 46 MED · 4B —──────────────│
│   │4B │ [Overview] Change Evidence Requirements History         │
│   │[Q]│ >[x] Selected record                       [Open detail] │
│   │   │— PENDING [Decision readiness] —────────────────────────│
└───┴───┴─────────────────────────────────────────────────────────┘
          ┌──────── I drawer ↕ (when open) ────────┐
          │ context / relationships / action [x]  │
          └────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Rail area; compact Queue orientation; Workspace work; Inspector drawer context. |
| Primary focus | Workspace selected record. |
| Persistent review identity | Compact Queue and header. |
| Selected object | Preserved exact object. |
| Inspector/drawer state | Closed by default; opens one drawer. |
| Scroll ownership | Workspace; open drawer separately; Queue overlay separately. |
| Primary action | `Open detail`. |

## 20. Tablet

```text
┌──────────────── selected-review step ↕ ────────────────┐
│[Areas] [← Review list]                                 │
│— acme/redemption-api · PR #482 · 4B —────────────────│
│Mode: Overview ▼                                        │
│TESTS REQUIRED · 46 MEDIUM                              │
│>[x] Highest-impact finding                             │
│[Open contextual detail]                                │
│— Human Decision PENDING [Assess] —────────────────────│
└────────────────────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Global disclosure=area; prior Review list=Queue; current step=Workspace; drawer=Inspector. |
| Primary focus | Selected-review Workspace step. |
| Persistent review identity | Sticky orientation header. |
| Selected object | Highest-impact finding when activated; otherwise none. |
| Inspector/drawer state | Contextual drawer closed. |
| Scroll ownership | One principal step; drawer owns scroll when open. |
| Primary action | `Open contextual detail`. |

## 21. Mobile review list

```text
┌──────────── Review list ↕ ────────────┐
│[Areas] Reviews                         │
│Search… [Filters]                       │
│Needs attention (12)                    │
│>* PR #482 · acme/redemption-api        │
│  TESTS REQUIRED · 46 MED · 4B          │
│  PR #517 · …                           │
│In review …                             │
└────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Review-list step owns Queue responsibilities; global disclosure owns Rail. |
| Primary focus | Focused PR #482 row. |
| Persistent review identity | Selection marker persists; Workspace not yet active. |
| Selected object | None. |
| Inspector/drawer state | None. |
| Scroll ownership | Review-list page only. |
| Primary action | `Open review`. |

## 22. Mobile selected review

```text
┌────────── Selected review / Overview ↕ ──────────┐
│[← Reviews] acme/redemption-api · PR #482          │
│Add fallback handling…                             │
│TESTS REQUIRED · 46 MEDIUM                         │
│4 open · 4 blocking · missing proof 2              │
│Mode: Overview ▼                                   │
│> Highest-impact finding [Open]                    │
│Movement: regressed [History]                      │
│Human Decision PENDING [Assess]                    │
└───────────────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Current full step owns Workspace; prior list retains Queue state. |
| Primary focus | Overview first-five-second summary. |
| Persistent review identity | Sticky repository/PR orientation. |
| Selected object | None. |
| Inspector/drawer state | No Inspector; contextual detail opens selected-record step. |
| Scroll ownership | Selected-review page only. |
| Primary action | `Open` highest-impact finding. |

## 23. Mobile selected record

```text
┌──────────── Selected record ↕ ─────────────┐
│[← Evidence] PR #482                         │
│Finding · HIGH · [x] Fallback failure path   │
│Why it matters                               │
│Provenance · run/head · affected file        │
│Relationships                                │
│> Supporting evidence [Open]                 │
│  Missing proof [Open]                       │
│Decision consequence · 4 blockers            │
└──────────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Selected-record step combines Workspace primary record with Inspector context in one sequence. |
| Primary focus | Finding F-01 detail. |
| Persistent review identity | PR #482 sticky orientation. |
| Selected object | Finding F-01. |
| Inspector/drawer state | Inspector content integrated, not duplicated. |
| Scroll ownership | Selected-record page only. |
| Primary action | Open next explicit related record; Back restores Evidence collection. |

## 24. Mobile Human Decision flow

```text
┌──────── Human Decision full-screen step ────────┐
│[Cancel] PR #482 · run_03 · 8ac41de              │ ← fixed
│TESTS REQUIRED · 46 MED · 4 blockers             │
├─────────────────────────────────────────────────┤
│Outcome (none selected)                           │
│Seven explained outcomes                          │
│Rationale *                                  ↕    │
│References / accepted risk / acknowledgements     │
├─────────────────────────────────────────────────┤
│[Cancel]                    [Confirm disabled]     │ ← fixed
└─────────────────────────────────────────────────┘
```

| Required label | State |
| --- | --- |
| Region ownership | Consequential step exclusively owns draft; selected review remains frozen background context. |
| Primary focus | Outcome group, then field order. |
| Persistent review identity | PR/run/head/recommendation/blockers fixed at top. |
| Selected object | Prior record preserved in task state; no modal outcome preselected. |
| Inspector/drawer state | Closed/integrated; no competing drawer. |
| Scroll ownership | Decision body only; header/footer fixed. |
| Primary action | Confirm after outcome requirements; dirty Cancel opens discard warning. |

## Atlas acceptance

R4C must implement every diagram as a controlled state, preserve the labelled ownership/focus/identity/selection/scroll/action contract, and treat the ASCII proportions as structural rather than visual measurements. The accepted R4A documentation tokens and R4C calibration govern visual execution.
