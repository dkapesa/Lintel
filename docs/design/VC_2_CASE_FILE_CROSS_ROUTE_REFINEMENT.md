# VC-2A — Case File desktop precision

**Status:** Implemented — validation passed  
**LVOS baseline:** v1.0, approved and closed  
**Scope:** Desktop-first visual refinement of `/report?demo=1`

## Objective

Refine the Case File into a precise technical verification dossier. An engineer can move from a change, through Lintel's observations and their proof, to open Merge Contract requirements and the pending human decision without mentally reconnecting detached panels.

## Fixed LVOS architecture

- Archetype C remains fixed: quiet section outline, dominant verification dossier and connected verdict/decision rail.
- The reading chain remains Change → Observation → Evidence → Requirement → Human decision.
- The five-stage trace, F/E/M/C record grammar, canonical sample data, Merge Contract semantics, risk/recommendation treatment, evidence provenance, uncertainty and decision-sheet behaviour remain unchanged.
- The global shell, Workspace, public landing page, report generation, persistence, API surface and human-decision authority are outside this pass.

## Pre-implementation declaration

- **Approved visual layer:** LVOS v1.0 and the subordinate Visual Calibration Note; no new visual direction or primitive.
- **Route and regions changing:** `/report` header, verification trace, desktop outline, dossier record rhythm, finding/evidence attachment, Merge Contract ledger, verdict rail and Case File-owned CSS.
- **Regions untouched:** shell/navigation, canonical report and evidence data, report logic, decision semantics, public landing page, Workspace and compact architecture.
- **Typography:** Geist Sans retains application, body and control roles; Geist Mono remains only for genuine identifiers and technical values. The 10px floor and 600 ceiling remain in force.
- **Semantic colour:** warning identifies active blocking interpretation; success and information retain their existing meanings; missing, unknown and pending remain neutral; danger remains reserved for verified harm.
- **Responsive implication:** desktop is refined at `>=1180px`. Existing `1179px` rail/sheet, selector and mobile transformations are deliberately preserved for VC-2B.
- **Explicit non-goals:** no product feature, canonical-data, persistence, scoring, API, shell, landing-page, dependency or motion change.

## Previous Case File desktop dialect

The approved LVOS-5 Case File already used the correct three-part composition and truthful ledger data. On desktop, however, its very narrow internal grid gutters, comparatively generous section rhythm and more uniform record surfaces made the outline, dossier and rail feel adjacent rather than deliberately calibrated as one dossier. Supporting evidence and expanded contracts were correct but could read with less immediate ownership.

## Refined desktop composition

At wide desktop, the grid remains a compact outline, dominant 680px-class document measure and persistent roughly 300px verdict rail. The outline and rail are aligned to the same dossier start. Gutters become deliberate, while the central dossier remains the largest uninterrupted reading plane. The header becomes denser without becoming a hero; repository, branch, run and analysis provenance remain compact orientation data.

## Outline treatment

- The outline remains quiet, sticky and structurally subordinate.
- It uses ledger rows, technical section numbers and counts rather than controls or cards.
- The current section gains only a selected plane and left rule, plus accessible `aria-current`; navigation behaviour is unchanged.
- Existing compact `Jump to section` transformation remains untouched below desktop.

## Dossier rhythm

- Section rules, condensed section spacing and compact ledger rows make the document read continuously rather than as stacked cards.
- File, disclosure and finding rows retain their record order and source grammar.
- The short dossier lede and recommendation summary are tightened to preserve evidence density without reducing readable line length.

## Verification-trace treatment

The trace remains in the header and continues to link each written stage to its owning region. It remains a semantic navigation artifact: satisfied, partial and open states are data-driven, the Human decision node remains distinct, and no animation is introduced.

## Finding/evidence grammar

- Findings retain F identifiers, severity, provenance, observed explanation, affected surface, related requirement and required action.
- Supporting E records remain directly beneath their owning finding.
- Expanded evidence is indented by a shared hairline and uses the existing selected technical plane, making proof visibly subordinate to its claim rather than a detached card.
- Missing proof remains neutral unless an already-existing interpretation changes; no source location or excerpt is fabricated.

## Merge Contract treatment

- The Contract remains a numbered operational ledger with real clause state, blocking importance, related records, owner/clearance details and in-place disclosure.
- Expanded clauses gain a restrained selected plane, making the selected requirement feel owned by the dossier rather than floating above it.
- Blocking-open clauses use the existing warning semantic rather than danger. Truthful counts and first-open-clause disclosure behaviour are retained.

## Verdict and human-decision hierarchy

- The persistent rail remains an attached secondary plane, not an early dashboard summary.
- Recommendation, risk, open requirements, missing proof and immediate next action remain in their fixed order.
- The Human Decision terminus receives the rail's raised terminal plane and compact pending treatment.
- The canonical state remains explicitly pending: no actor, timestamp, approval or rejection is invented.

## Selectors and components changed

- `app/globals.css`: desktop-only refinement for `.case-file-header`, `.case-file-grid`, `.case-file-outline*`, `.dossier-*`, `.finding-evidence-links`, `.uncertainty-record*`, `.contract-ledger-*` and `.report-verdict-rail` / `.decision-studio--rail`.
- `docs/design/VC_2_CASE_FILE_CROSS_ROUTE_REFINEMENT.md`: this VC-2A record.

No report component, data model or interaction handler changes are required for this presentation-only pass.

## Responsive work deferred to VC-2B

- Dedicated desktop-to-sheet visual convergence at 1024px.
- Dedicated mobile hierarchy, trace and long-record calibration at 390px.
- Any breakpoint-specific spacing or selector refinements beyond regression preservation.

## Cross-route work deferred to VC-2C

- Cross-route visual calibration beyond the retained Workspace continuity reference.
- Any shared record primitive migration that would affect routes outside the Case File.

## Validation matrix

| Check | Result |
| --- | --- |
| 1440px dark | Passed: 148px outline, 679px dossier and 298px rail remain within the desktop working surface; no horizontal overflow. |
| 1440px light | Passed: identical structure and spacing on warm technical-paper planes; no horizontal overflow. |
| 1024px regression | Passed: written trace, labelled section selector, fixed compact verdict access and no page-level horizontal overflow. |
| 390px regression | Passed: written trace names/state labels, section selector, 44px decision action and no page-level horizontal overflow. |
| Outline/jump/clauses/decision sheet | Passed: trace anchors and selector state remain available; clause disclosure toggles; decision sheet opens, closes with Escape and restores focus to `Review decision`. |
| Theme control and Workspace return link | Passed: the existing theme control preserved dark/light parity; the existing Case File footer retains the `/workspace` return link. |
| TypeScript, build and diff checks | Passed: `git diff --check`, `npx tsc --noEmit --incremental false` and `npm run build`. The sandbox-only build could not fetch Google Fonts; the approved network retry passed. |

## Current approval status

**Complete — final approval recorded after the bounded VC-2D selector correction.** LVOS v1.0 remains closed and unaltered. VC-2A does not commit or push.

# VC-2B — Case File responsive and interaction refinement

**Status:** Implemented — validation passed  
**Route:** `/report?demo=1`  
**LVOS baseline:** v1.0 (unchanged)

## Bounded scope and fixed state

VC-2B changes only the responsive presentation and compact interaction layer of the Case File. VC-2A's approved 1440px composition remains fixed: quiet outline, dominant dossier, persistent verdict/human-decision rail, written five-stage trace, finding/evidence ledger and restrained Merge Contract.

No canonical report data, scoring, recommendations, report generation, persistence, human-decision semantics, global shell, Workspace, `/new`, Review Operations, landing page, dependencies or motion changed. Geist Sans remains the application/prose face; Geist Mono remains limited to technical values. The 10px rendered floor, 600 weight ceiling and LVOS semantic-colour meanings remain in force.

## Breakpoint strategy

| Range | Deliberate state |
| --- | --- |
| `>=1320px` | Approved three-plane desktop dossier remains unchanged. |
| `1180–1319px` | The desktop shell remains, but the quiet outline becomes the labelled `Jump to section` selector. The dossier and persistent verdict rail form a readable two-plane surface. |
| `900–1179px` | Existing shell drawer pattern applies. The dossier becomes the one primary column; the verdict becomes a compact pinned summary that opens the decision sheet. |
| `641–899px` | One dominant dossier column, with written trace and the same selector/bar/sheet mechanics. |
| `<=640px` | Ledger rows use wrapping, rules, identifiers and indentation; the section selector and compact decision bar retain 44px-capable controls without covering the final record. |

The 601–640px state preserves written labels and states for every trace node. There is no glyph-only trace state or unsupported 620px gap.

## Outline and verdict transformations

The desktop outline keeps its numbered links and `aria-current="location"`. Its compact selector exposes every meaningful dossier section, has the accessible name **Jump to Case File section**, retains the selected/current section through its value, scrolls to the selected landmark and leaves focus on the operating control.

At compact widths the verdict rail becomes one fixed, truthful recommendation/risk bar with a single `Review decision` action. Document bottom reserve permits the final dossier section to scroll above it. The sheet remains the only report overlay: named `role="dialog"`, `aria-modal="true"`, explicit Close action, internal scrolling, Escape close, focus trap, return focus, inert/hidden report and shell background, and document/body scroll locking. Focusable controls are recomputed while the sheet is open, so expanded sheet content remains within the trap. Resizing to desktop closes the compact dialog state rather than leaving desktop content incorrectly modal.

## Responsive ledger grammar and long records

Findings retain their F identifiers, written severity/provenance, explanation and directly indented E evidence beneath the owning finding. On narrow screens technical excerpts, identifiers, branch/run values and evidence values wrap safely rather than silently clipping; selected/focused state remains readable beyond colour.

Merge Contract rows retain clause identifier, written state/importance, related F/E/A references, owner cue where present and exact clearance evidence inside their disclosure. Narrow rows move secondary state below the clause statement rather than becoming decorative cards; disclosure controls meet the compact touch floor. Open/pending remains neutral or warning according to LVOS, with danger reserved for verified harm.

## Theme and accessibility verification

Dark and light retain identical structural states: near-black connected workstation planes in dark and warm technical-paper planes in light. The refinement adds no theme-specific geometry or hierarchy. Semantic headings, section navigation, current location, disclosure semantics, visible focus, keyboard operation, touch targets, logical document order, Workspace return link and shell theme control are retained.

## Acceptance matrix

| Check | Result |
| --- | --- |
| 1440px dark/light | Regression-only desktop state: approved three-plane proportions retained. |
| 1180px dark/light | Compact outline plus dossier/rail layout prevents document squeeze and sticky collision. |
| 1024px dark/light | One dossier column, labelled selector, compact decision bar and sheet; shell navigation remains separate. |
| 768px dark/light | Written trace, ledger wrapping and one reading column retained. |
| 620px dark/light | All five labels/states, selector, clause disclosures and compact decision bar remain usable. |
| 390px dark/light | Technical dossier grammar retains identity, recommendation/risk, findings/evidence, missing proof, Contract, clearance evidence, pending decision and next action. |
| Interaction and accessibility | Selector/jump, clause disclosure, expand/collapse, decision sheet, Escape, focus restoration/trap, inertness, scroll lock, theme control and Workspace return verified. |
| Overflow/obstruction | No page-level horizontal overflow; no fixed element obscures essential or final dossier content. |
| Quality gates | `git diff --check`, `npx tsc --noEmit --incremental false` and `npm run build` passed. The build required its configured Google Font access. |

## Deferred to VC-2C

- Cross-route calibration or shared-record primitive migration outside the Case File.
- Any new report state, canonical-data, decision-policy or global-shell work.

# VC-2C — Supporting route convergence

**Status:** Implemented — validation complete  
**Routes:** `/new`, `/review-operations`  
**LVOS baseline:** v1.0 (unchanged)

## Bounded declaration

VC-2C changes only the review-entry surface, Review Operations, their directly owned presentation, and this record. VC-2A's approved Case File desktop dossier and VC-2B's responsive and compact interaction behaviour remain fixed. The workflow objective is continuity from review entry through Workspace and Case File into local operational follow-up.

Geist Sans remains the interface and explanatory face; Geist Mono remains reserved for actual identifiers and technical values. The existing 10px floor, 600 weight ceiling, semantic-token meanings, warm-paper/light and matte-near-black/dark material pairing remain unchanged. No shell architecture, Workspace, Case File, canonical data, report generation, persistence, human-decision semantics, landing page, dependency or motion work is included. No broad shared component system was created.

## `/new` previous and refined composition

`/new` retains connected GitHub, public PR import, pasted unified diff and built-in samples, plus editable metadata, Change Passport, review profile and local history. Its source rail, change region, optional context and command dock are now a numbered intake rather than adjacent workbench regions: **01 / Change source**, **02 / Change material**, **03 / Add review context**, **04 / Review behaviour** and **05 / Generate Case File**. The source rail retains its existing written active state and truthful Connected GitHub configuration signal; public PR URL, manual diff and Sample review remain available alternatives rather than equal-sized dashboard cards.

The route remains one working plane: source rail, source-specific change material/contextual brief and compact command dock. Imported fields remain editable; manual-diff labels, source-specific validation/loading/error messages and existing source guidance retain their current behaviour. Change Passport remains optional, builder-declared and unable to clear blockers or alter a recommendation. A compact Workspace return link and local-first/raw-diff disclosure preserve the existing model-assisted, deterministic-fallback, public-PR-only and raw-diff boundaries without legalistic copy.

## Review Operations previous and refined composition

Review Operations previously derived blocker, repository and decision records from local history but fell back to a demo dossier whenever history was empty; its five-value strip and simultaneous sections read closer to a dashboard than a follow-up ledger. Empty local history now shows an intentional record-free state with **Start a review** and **Open Workspace** routes: it does not seed demo evidence or imply organisation activity.

Real local history is summarized only as a compact ruled ledger of stored reviews, reviews needing follow-up, recurring requirements, recorded decisions and any reaffirmation-required state. It is not a KPI or repository-health score. The explicit current view is a compact tablist: **Review records**, **Requirements** and **Decision history**. Requirement records retain occurrence, change, repository, latest-seen and recorded-state grammar; repository records retain identity, open requirements, recommendation, activity and human decision without a score; decision history remains newest-first and source-derived. A Case File link is offered only for the current report identity with a correct route—older archived reports receive no fabricated per-report URL.

## Shared primitives, responsive and accessibility verification

No new shared component abstraction was added. `/new` uses the established workbench, source-button, field, Change Passport and command-dock primitives with stage labels. Review Operations uses existing administrative-document ledger/table primitives with route-owned ledger/view-bar rules. Existing status vocabulary, focus treatment, semantic colours and border-led materials are retained.

At 1440px and 1024px the intake retains its source rail/working plane and Operations its one ledger surface without KPI tiles. At 768px and 620px source controls retain their existing labelled scrollable transformation, Operations views remain available and tables retain their labelled-record transformation. At 390px written labels, Workspace/entry actions, form controls, profile control and primary action remain reachable; empty actions stack and technical values wrap. Dark/light retain token-driven structural parity. Semantic landmarks/headings, visible labels, status/error roles, keyboard-operable source controls, focus visibility, `aria-selected` current Operations view state and touch floors are retained. No private access, organisation telemetry, analytics, score, successful import, analysis or human decision is fabricated.

## Acceptance matrix and work remaining

| Check | VC-2C result |
| --- | --- |
| `/new` source, pasted-diff, sample, labels, validation and primary action | Existing capabilities retained; numbered hierarchy and truthful boundary copy added. |
| Review Operations records, views and empty state | Local-only ledger views retained; demo-history fallback removed; direct entry/Workspace routes added. |
| Case File continuity | Uses shared source/recommendation/requirement/decision vocabulary; only current report gets a correct Case File route. |
| Responsive, themes and accessibility | Existing transformations/token parity retained; no page-level overflow observed in rendered desktop empty state. |
| Quality gates | `git diff --check`, TypeScript and production build complete for VC-2C. |

VC-2D: human visual approval at the full theme/breakpoint matrix; no further Workspace or Case File change is implied.

## Current VC-2C milestone status

**VC-2C complete.** No commit or push is part of this milestone.

## Historical VC-2B milestone status

**VC-2B complete.** VC-2A desktop remains fixed; LVOS v1.0 remains unmodified. No commit or push is part of this milestone.

# VC-2D — Final bounded correction and closure

**Final verdict:** APPROVED after bounded correction  
**VC-2 overall status:** APPROVED AND COMPLETE  
**Next:** VC-3 Landing-page Final Art Direction

## Resolved blocker

The dead selector-specificity conflict affecting the desktop Human Decision terminal plane is resolved. Inside the existing `@media (min-width:1180px)` VC-2A block, `.decision-studio--rail` was increased to `.report-case-file .decision-studio--rail` while preserving `background:var(--color-surface-raised)`. This allows the approved raised dark surface and raised warm-paper surface to render at desktop widths without changing the structure, wording, semantics, border treatment or any state below 1180px.

## Final completion record

- VC-2A desktop precision: complete.
- VC-2B responsive and interaction refinement: complete.
- VC-2C supporting-route convergence: complete.
- Case File desktop, responsive and dark/light verification passed.
- `/new` convergence passed.
- `/review-operations` convergence passed.
- No remaining VC-2 blockers.

## Accepted non-blocking observations

These observations remain deferred and were not implemented during closure:

- Review Operations `boundaryText` dead code remains deferred.
- Operations tab semantics may receive a later focused accessibility improvement.
- Retained `!important` view-bar rules are maintenance debt.
- `/new` mobile Generate and profile controls retain their pre-existing heights.
- The 1024px Jump-to-section control retains its current intermediate height.
- Populated Review Operations state was source-verified because truthful local history was empty.

Claude's screenshot timeout is recorded as a tooling limitation, not a product defect.
