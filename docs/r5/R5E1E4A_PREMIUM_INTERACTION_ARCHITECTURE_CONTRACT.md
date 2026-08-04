# R5E.1E.4A — Premium Interaction Architecture Contract

Interaction architecture only. No interaction was implemented, no application
code, CSS, route, canonical value or dependency was created or modified in this
phase.

Companion documents (unchanged authority):
[`R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md),
[`R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md`](./R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md),
[`R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md`](./R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md),
[`R5E1E2D_REFERENCE_FIDELITY_IMPLEMENTATION.md`](./R5E1E2D_REFERENCE_FIDELITY_IMPLEMENTATION.md),
[`R5E1E3_RESPONSIVE_VISUAL_REVIEW.md`](./R5E1E3_RESPONSIVE_VISUAL_REVIEW.md).

---

## 1. Purpose

R5E.1E.2A–D built the reference-led public reconstruction at
`/visual-lab/public-r5-reference-reconstruction` and received human visual
acceptance. R5E.1E.3 reviewed it responsively and closed. The page is complete,
truthful and entirely demonstrative: nothing on it can be operated.

This phase decides — before any interaction is written — exactly which parts of
that page become manually inspectable, what states they may hold, who owns those
states, how automatic and manual authority interact, and what the page does
without JavaScript, under reduced motion, and at every viewport.

It locks fourteen things: which public product scenes become interactive; which
remain non-interactive; the canonical state inventory for each interactive
scene; the exact public controls; state ownership; automatic-versus-manual
authority; keyboard and touch behaviour; accessibility semantics; no-JavaScript
behaviour; reduced-motion interaction behaviour; responsive interaction
behaviour; reusable public interaction primitives; product-truth boundaries; and
the implementation handoff for later Phase 7 work.

It does not define motion timing. That is the Motion Choreography Contract
(Phase 7A.2), whose handoff is §25 below.

## 2. Cursor evidence

A 139.23 s Cursor recording
(`Cursor_ AI coding agent - Google Chrome 2026-08-04 01-25-34.mp4`, 1920 × 1140,
2738 coded frames, h264) was located as readable local bytes, probed, frame
extracted and **visually inspected as images** before any repository file was
read. Full record, including the toolchain note and every frame path:
untracked `R5E1E4A_CURSOR_INTERACTION_ANALYSIS/CURSOR_INTERACTION_FINDINGS.md`.

**CURSOR INTERACTION GATE: PASSED.**

The ten required behaviours were each confirmed against frames:

| # | Behaviour | Finding |
|---|---|---|
| a | Automatic scene narrative | Confirmed. Every product scene advances on its own, time-driven, with the pointer elsewhere. |
| b | Manual product affordances | **None exist.** In 139 s across four routes, no control inside any marketing product scene is operable. |
| c | Stable application frame | Confirmed. Depicted window keeps identical position, dimensions and column widths throughout. |
| d | Layered content transitions | Confirmed. Whole-region replacement and small overlay plates; never a whole-scene cross-fade. |
| e | State persistence while scrolling | Confirmed. Scrolling a scene half out of view changes nothing about its state. |
| f | Whether scenes replay | **They do not replay on re-entry** — but Cursor's narratives run continuously and rebuild. |
| g | Route navigation behaviour | Ordinary. Nav dropdown → full new document → hard reset. No state crosses the boundary. |
| h | Interaction restraint | Total. No overlay, no scroll-jacking, no carousel. Parallel static cards are used where tabs would be expected. |
| i | Normal document flow | Confirmed. Only the top navigation is sticky; no scene scrolls internally. |
| j | Cross-route continuity | The scene *grammar* is reused on `/product/agents`; state is independent even between two scenes on one page. |

Three findings do real work in this contract:

1. **Cursor makes nothing operable (b).** This is why the manual-interaction cap
   is three scenes rather than "every section", and why the fourth scene stays
   choreography-only. Cursor is authoritative for restraint, not for volume.
2. **Cursor depicts controls it does not wire (b).** A "Questions" card inside
   the scene carries `‹ ›` arrows and Skip / Continue buttons that are pixels,
   not controls. Lintel takes the opposite rule and states it as a boundary:
   nothing that looks operable may be inert, and nothing inert may look
   operable.
3. **Cursor's narratives never stop (f).** Lintel adopts the half that is right
   — no replay on scroll-back — and rejects the half that is wrong. A perpetual
   demo reel is a screensaver. Lintel's introduction runs once and settles.

Lintel's own frozen product remains authoritative for product meaning and
canonical state. Cursor informs interaction discipline only.

## 3. Accepted homepage baseline

Frozen by the R5E.1E.2A–D closeout and re-verified by R5E.1E.3. This phase does
not reopen any of it:

1. Normal document flow.
2. Only the public navigation is sticky; `position: fixed` appears nowhere.
3. Continuous white canvas.
4. Alternating editorial and product-scene sections.
5. Restrained scene-presentation plates.
6. One principal product relationship per section.
7. Local scene motion.
8. No internal public-scene scrolling.
9. No page-level overlays.
10. Canonical PR #482 product truth.

Page order: Navigation → Hero → Hero product scene → Finding and Evidence →
Missing Proof and Requirement → Readiness and Human Decision → Trust →
unresolved-case handoff → footer.

Current client boundaries: `PublicHeader` and `SceneMotion`. Every product scene
is a server component.

## 4. Interaction thesis

> The homepage presents a carefully directed product narrative that becomes
> manually inspectable without becoming a second full application.

Consequences, all binding:

1. Interaction must improve understanding. Interaction that only makes the page
   feel busy is a defect, not a feature.
2. The page continues to scroll normally.
3. Every interactive product scene owns its own local state.
4. There is no global homepage state machine.
5. There is no persistent Workspace.
6. There is no page-scroll-controlled product state.
7. There is no cross-scene synchronization.
8. There is no simulated analysis.

The complete, operable product remains the sample Workspace at
`/workspace?source=fixture`. The homepage never competes with it.

## 5. Interactive-scene inventory

Exactly three scenes become manually interactive. This is the maximum.

| # | Scene | Classification | States | Default |
|---|---|---|---|---|
| 1 | Hero selected-review scene | Interactive — 3 views | `overview` · `finding` · `readiness` | `overview` |
| 2 | Finding and Evidence | Interactive — 2 records | `ev_retry_path` · `ev_no_idempotency_key` | `ev_retry_path` |
| 3 | Readiness and Human Decision | Interactive — 2 views | `readiness` · `decision-boundary` | `readiness` |
| 4 | Missing Proof and Requirement | **Choreography only** — no manual control | — | — |

No scene is classified differently from the plan set out in the phase brief. No
deviation is claimed and none was needed: canonical data supports all three
interactions, and no accessibility evidence contradicts any classification.

## 6. Non-interactive-scene inventory

Explicitly and permanently non-interactive on this page:

1. **Missing Proof and Requirement** — choreography only (§9).
2. **Trust** — four static records. Nothing to select; the four boundary
   statements are a single argument read top to bottom.
3. **Unresolved-case handoff** — a structured record plus two genuine
   navigation links. The links are the interaction; nothing else is.
4. **Footer** — identity, purpose, links, private-laboratory note.
5. **The seven Human Decision outcomes** — permanently plain `<li>` text.
   Zero focusable, zero role-carrying, at every viewport and in every state.
6. **The two Review Queue context rows** in the hero aside — permanently inert
   text under the existing "Context only — not inspectable here." note.

## 7. Hero state contract

The Hero remains one selected canonical review: `example/b2b-redemption-api`,
`PR #482`. Switching to an unrelated queue review is forbidden (§21), and no
adjacent review is given fabricated working data.

### 7a. Persistent scene chrome — visible in all three views

These are never inside a panel and are therefore never hidden by a view change,
at any viewport, with or without JavaScript:

1. Scene chrome bar: `example/b2b-redemption-api` · `PR #482` ·
   `SELECTED REVIEW · READ-ONLY SAMPLE`.
2. The review-context aside: the selected-review card, the
   "Context only — not inspectable here." note, and the two inert queue rows.
3. `Add fallback handling for failed discount-code retrieval`.
4. `fix/discount-code-retrieval-fallback` · `head 9c41af2`.
5. The four-fact definition list: **Recommendation** `Tests required` ·
   **Risk** `46/100 · MEDIUM` · **Requirements** `4 open · 2 blocking` ·
   **Human Decision** `PENDING`.
6. The view control row (§7c).

The phase brief requires Overview to *preserve* items 1–5 and the selected-review
context. Promoting them to persistent chrome preserves them in Overview and in
every other view as well, which is strictly stronger, keeps every §21 canonical
value on screen at all times, and removes the only real risk in a view switch —
that a canonical value could be hidden behind a control the visitor never
operates. This is the interpretation this contract locks.

### 7b. Exact panel content

| View | Locked content | Canonical source |
|---|---|---|
| **Overview** (default) | `Next inspection` — "Provider failure cases absent from test suite"; the three reviewer-focus lines; the evidence boundary — "5 canonical evidence records. 2 missing or unverified; 1 stale." | `REVIEW_OVERVIEW.nextInspection`, `.reviewerFocus`, `.evidenceBoundary` |
| **Finding** | Tags `HIGH` · `Reliability` · `Rule detected`; title "Retry behaviour may create duplicate redemption risk"; the statement in full; `app/services/redemption_service.py:118`; the action — "Add idempotency checks and tests proving retries cannot issue duplicate codes."; the related requirement "Idempotency proven under retry" `blocking · open`; **one** affected-file row — `app/services/redemption_service.py` `+74 −12` `HIGH` | `PRIMARY_FINDING.*`, `AFFECTED_FILES[0]` |
| **Readiness** | The change-over-time note — "Two blocking requirements cleared since the previous head. One latency requirement became stale because the load test has not been re-run."; `2 missing or unverified` · `1 stale`; "No Human Decision has been recorded for this review."; `Lintel recommends. The engineer decides.` | `READINESS.note`, `.missingOrUnverified`, `.stale`, `DECISION_READINESS.priorDecision`, `DECISION_AUTHORITY_STATEMENT` |

Every value is imported from
`app/_public-r5-recalibrated/canonical-review.ts`, which is itself cross-checked
against the frozen fixture. Nothing is restated, recalculated or invented. No
panel duplicates another panel's content, and no panel repeats a persistent-chrome
value.

Finding is deliberately bounded: the finding, why it matters, and exactly one
affected-context row. The other three changed files are unrelated full-review
content and do not appear.

### 7c. Controls

| Property | Lock |
|---|---|
| Visible labels | `Overview` · `Finding` · `Readiness` |
| Accessible names | Identical to the visible labels. Stable at every viewport and in every state — no viewport-dependent label swap. |
| Control-group accessible name | `Selected review views` |
| Semantics | Tabs (§11) |
| Default server-rendered view | `overview` |
| Enhanced initial view | `overview` — identical to the server state |
| Selected-state treatment | §11d — three simultaneous non-colour cues |
| Responsive treatment | §17 |
| Manual-intent behaviour | §13 |
| Canonical settled state | `overview`, all introduction steps complete |
| No-JavaScript state | Panel label `Overview` in the control row; Overview panel visible; other panels present but `visibility: hidden` and `inert` |
| Reduced-motion state | `overview` rendered complete and immediately; controls fully available |

## 8. Finding and Evidence state contract

This is the primary interaction gate for the later implementation (§24).

The genuine finding is fixed and never changes. Evidence selection changes
inspection focus only.

### 8a. Selectable evidence records

Verified against `lib/workspace-v2/fixture-adapter.ts` (case482) directly, not
inferred: `finding_retry_idempotency.supportingEvidenceIds` is exactly
`["ev_retry_path", "ev_no_idempotency_key"]`.

| Key | Title | Status | Provenance | Source |
|---|---|---|---|---|
| `ev_retry_path` | Retry path observed in redemption service | `confirmed` | Rule detected | `app/services/redemption_service.py:118` |
| `ev_no_idempotency_key` | No idempotency key present on redemption write | `present` | Rule detected | `app/clients/partner_code_client.py:64` |

The set is exactly two. `ev_coverage_gap` and `ev_error_shape_inferred` support
*different* findings (`finding_provider_failure_coverage`,
`finding_error_contract`) and `ev_prior_load_test` supports none
(`supportsFindingIds: []`). Including any of them would misstate which evidence
supports this finding, so none is selectable here.

**Default selected record: `ev_retry_path`** — the record that establishes the
retry behaviour the finding is about.

### 8b. Scene anatomy

Three regions, top to bottom, at every viewport:

1. **Finding head — persistent, never changes.** Tags `HIGH` · `Reliability` ·
   `Rule detected`, title, full statement, `app/services/redemption_service.py:118`.
2. **Record list — the controls.** Both records always rendered in full, exactly
   as today: status tag, provenance tag, title, statement, source. Selecting one
   does not hide the other.
3. **Provenance trace — one labelled panel.** For the focused record:
   **Provenance**, **Source**, and **Supports** — the canonical `supports` value,
   which states in words the relationship back to the finding
   ("Retry behaviour may create duplicate redemption risk"). The `supports`
   trace is not rendered anywhere on the page today; it is the genuinely new
   information this interaction reveals.

The relationship the scene demonstrates is therefore literal and complete:
**Finding → selected evidence → provenance or source context.**

### 8c. Locked properties

| Property | Lock |
|---|---|
| Exact default evidence | `ev_retry_path` |
| Source or provenance displayed | Provenance, source and the `supports` trace, as labelled facts |
| Active-record styling | §11d, applied to the record card: filled `--pub-selected` surface, `--pub-border` outline, a 3px leading rule, and a stronger title weight |
| Control semantics | Tabs, vertical orientation (§11) |
| Keyboard navigation | ↑ ↓ move and select; Home / End jump; Tab enters and leaves the list once (§16) |
| Focus behaviour | Roving tabindex; focus never moves on its own; the panel is not focused on selection |
| Touch behaviour | Whole card is the target; ≥ 44 px high at every viewport; no hover dependency |
| Panel labelling | `aria-labelledby` the selected record control; visible label `Provenance and source` |
| Transition-state stability | Panels share one grid cell (§15c); the scene never changes height on selection |
| Manual-intent behaviour | §13 |
| No-JavaScript presentation | Finding head, both records complete, and the `ev_retry_path` trace panel, all visible. Record cards render as `<div>`, not controls. |
| Reduced-motion presentation | Identical content, rendered immediately, no spatial transition |
| Mobile content order | Section copy, then finding head, then record list, then trace panel — the DOM order at every viewport |

### 8d. Forbidden in this scene

The finding never changes because another record is selected. Selection must
not: change the recommendation; change the risk; clear a requirement; create new
evidence; simulate source loading; run a model; or perform an external request.

### 8e. Proof obligation

Two records is a small set, and both are already fully visible. The comprehension
gain rests entirely on the `supports` trace and on the record-to-detail
relationship being legible. Phase 7B must demonstrate that gain before Phase 7C
proceeds. If it cannot, the correct outcome is to reclassify Finding and Evidence
as choreography-only and ship two interactive scenes, not three — see §24.

## 9. Missing Proof and Requirement contract

**Option A is locked: no manual control at all.**

The scene communicates one relationship and nothing else:

> Missing proof → open blocking requirement → merge readiness remains blocked.

Locked content, unchanged from the accepted implementation: `ev_coverage_gap`
("Provider failure cases absent from test suite", `missing`, Lintel missing
coverage signal, `tests/test_redemption_service.py`) → `Leaves open` →
`Provider failure states covered` `blocking · open` → `Merge readiness blocked` ·
`4 open · 2 blocking · Human Decision PENDING`.

Option B — locally focusable relationship records — is rejected. Three reasons,
in order of weight:

1. **No comprehension benefit.** Both records and the edge between them are
   already on screen simultaneously. Focusability would add tab stops that
   reveal nothing.
2. **No accessibility benefit.** The relationship is already conveyed by reading
   order and by the visible `Leaves open` edge label. Making static text
   focusable is a common accessibility anti-pattern, not a remedy.
3. **Cursor evidence.** Cursor's equivalent single-relationship scenes carry
   zero controls (§2h).

The earlier candidate note in
`R5E1E3_RESPONSIVE_REVIEW_PACKAGE/FUTURE_SURFACE_AND_INTERACTION_OPPORTUNITIES.md`
suggested revealing the second missing-proof record here. That is declined:
`ev_error_shape_inferred` is advisory and supports a *different* finding, so
surfacing it would reintroduce the second competing relationship R5E.1E.2B
deliberately removed. It remains in canonical data, unshown, unresolved.

Not introduced: tabs, multiple modes, requirement resolution, outcome changes,
expandable hidden content, or a second interaction grammar.

## 10. Readiness and Human Decision state contract

### 10a. Persistent scene content — visible in both views

1. Scene chrome bar: `PR #482` · `Readiness`.
2. The three-fact definition list: **Recommendation** `Tests required` ·
   **Risk** `46/100 · MEDIUM` · **Requirements** `4 open · 2 blocking`.
3. **Human Decision** `PENDING`.
4. The complete list of all seven genuine outcomes, plain `<li>` text, all
   unselected, none focusable, none carrying a role: `Approve`,
   `Approve with accepted risk`, `Tests required`, `Review required`,
   `Request changes`, `Blocked`, `Defer decision` — verified verbatim against
   `lib/workspace-v2/view-model.ts` `DECISION_OUTCOMES` / `OUTCOME_LABEL` in
   canonical order.
5. `Seven outcomes are available and unselected. Open the sample review for the
   complete decision surface.`

Items 3 and 4 are persistent rather than confined to the Decision-boundary view
for one decisive reason: R5E.1E.3 obtained human acceptance of a state in which
`Human Decision PENDING` and all seven outcomes are visible **with JavaScript
disabled**. Placing them behind a control would regress an accepted, verified
truth. They stay on screen unconditionally.

### 10b. Exact panel content

| View | Locked content | Canonical source |
|---|---|---|
| **Readiness** (default) | `2 blocking` · `2 missing or unverified` · `1 stale`; the recommendation explanation — "Two blocking requirements cleared since the previous head. One latency requirement became stale because the load test has not been re-run." | `READINESS.blockers`, `.missingOrUnverified`, `.stale`, `.note` |
| **Decision boundary** | "No Human Decision has been recorded for this review."; `Head 9c41af2 · fix/discount-code-retrieval-fallback`; `Lintel recommends. The engineer decides.`; "No outcome is selected from Lintel's recommendation."; and the statement that the complete decision surface belongs in the sample Workspace, carried by the persistent outcomes note (§10a.5) and the handoff section's genuine link | `DECISION_READINESS.priorDecision`, `.appliesTo`, `.outcomeSelected`, `DECISION_AUTHORITY_STATEMENT` |

The phase brief requires Readiness to preserve `Tests required`,
`46/100 · MEDIUM`, `4 open · 2 blocking`, missing-or-unverified proof and the
recommendation explanation; and Decision boundary to preserve `PENDING`, "Lintel
recommends", "the accountable engineer decides", that seven genuine outcomes
exist, that all remain unselected, and that the complete decision surface belongs
in the sample Workspace. Every one is preserved — items shared by both views sit
in persistent content, which satisfies both lists at once and hides nothing.

### 10c. Controls

| Property | Lock |
|---|---|
| Visible labels | `Readiness` · `Decision boundary` |
| Accessible names | Identical to the visible labels; stable at every viewport |
| Control-group accessible name | `Readiness views` |
| Semantics | Tabs, horizontal orientation (§11) |
| Default view | `readiness` |
| Are all seven outcomes visibly listed | **Yes — always, in persistent content, in both views** |
| Outcome visual hierarchy | Subordinate: a wrapped chip row beneath the panel, lighter than every product record on the page, never competing with `PENDING` |
| Responsive treatment | §17 |
| Manual-intent behaviour | §13 |
| No-JavaScript state | Panel label `Readiness`; Readiness panel visible; Decision-boundary panel present but `visibility: hidden` and `inert`; persistent content complete |
| Reduced-motion state | `readiness` rendered complete and immediately; controls fully available |

### 10d. Forbidden in this scene

Selecting an outcome; submitting a decision; entering rationale; changing
readiness; opening a homepage modal; recreating the full Workspace decision form.

## 11. Shared interaction grammar

One grammar governs all three interactive scenes.

### 11a. Semantic model — tabs

**Tabs and tab panels are locked**, over native toggle buttons controlling a
labelled detail region. This is not ARIA used to imitate a component pattern; it
is the pattern the interaction actually is. In all three scenes the states are
mutually exclusive views of one subject rendered into one region — which is the
definition of a tab set. The alternative requires more machinery, not less:
toggle buttons carry no built-in selected-among-siblings semantic, so
communicating "this one of three is showing" would need either a misused
`aria-pressed` or a polite live region — and §14 rules live regions out.

Tabs also settle the announcement question for free (§14b).

### 11b. Anatomy

```
scene
├── persistent chrome                    (never inside a panel)
├── control row                          fixed height, always occupied
│   ├── no JS  → panel label   <p>       plain text, no control affordance
│   └── enhanced → tablist     role=tablist
│                  └── tab ×N  role=tab
└── panel stack                          one CSS grid cell
    └── panel ×N               role=tabpanel   (inactive: visibility:hidden + inert)
```

### 11c. Keyboard, activation and focus model

| Property | Lock |
|---|---|
| Orientation | Horizontal for Hero and Readiness view switches; **vertical** for the Finding and Evidence record list, matching its stacked layout. Declared with `aria-orientation`. |
| Arrow keys | Horizontal lists: ← → move. Vertical lists: ↑ ↓ move. The unused axis is **not** intercepted, so page scrolling with ↑ ↓ still works wherever the list is horizontal. |
| Home / End | Move to first / last control. |
| Wrapping | Arrow movement wraps at the ends. |
| Activation | **Automatic** — selection follows focus. Panels are local, pre-rendered and instantaneous; there is nothing to defer. |
| Tab key | The control group is one tab stop. Tab enters the selected control and leaves the group. |
| Roving tabindex | Selected control `tabindex="0"`, all others `tabindex="-1"`. |
| Panel focusability | A panel receives `tabindex="0"` **only** when it contains no focusable element, so keyboard users can reach its text. Panels containing a link do not. |
| Focus movement on selection | None. Focus stays on the control. |
| Space / Enter | Select the focused control. Redundant under automatic activation, and supported anyway, because pointer and touch users who have focused a control expect it. |

### 11d. Selected-state semantics and visual cues

Programmatic: `aria-selected="true"` on the selected control; `aria-controls`
pointing at its panel; `aria-labelledby` on the panel pointing back.

Visual — **three simultaneous cues, never colour alone**:

1. **Surface** — filled `--pub-selected` (`#f3f3f1`) against the unselected
   transparent ground.
2. **Border** — a 1px `--pub-border` outline the unselected controls do not
   carry, plus a 2px leading rule (bottom for horizontal lists, left for the
   vertical record list).
3. **Weight** — text steps from `--pub-text-2` at 450 to `--pub-text` at 550.

Focus is separate from selection and always visible: the existing
`2px solid var(--pub-focus)` outline at `2px` offset, unchanged.

### 11e. Pointer, touch and target size

Whole control is the target. No hover-only information anywhere — hover may
change surface tone only, and every hover cue has a focus and a selected
equivalent. Minimum target: **44 × 44 CSS px at ≤ 767 px**; **≥ 36 px high with
≥ 44 px effective touch target via padding at ≥ 768 px**. Record-card controls
exceed both by construction.

### 11f. Appearance boundary

Controls must not look like form fields: no inset shadow, no field border
radius, no chevron, no caret, no placeholder-like text. Evidence-record controls
use this same semantic foundation while keeping their record-like visual
treatment — a full-width, left-aligned, multi-line card, not a pill.

## 12. Typed state ownership

Every interactive scene owns an independent local state. There is no global
reducer, and Hero, Evidence and Readiness selections are never synchronized.
A later implementation may share primitives and utilities; it may never share
mutable scene state.

```ts
/* Who last decided what this scene shows. */
type InteractionAuthority = "automatic" | "manual";

/* The shape every interactive scene owns one of, privately. */
type SceneInteractionState<TStateKey extends string> = {
  /** The active view or the active record. */
  active: TStateKey;
  /** Manual once the visitor has genuinely interacted; never returns to automatic. */
  authority: InteractionAuthority;
  /** True once the automatic introduction has finished, or been superseded. */
  introductionComplete: boolean;
  /** True once the scene has entered the viewport at least once. */
  hasEnteredViewport: boolean;
  /** True when prefers-reduced-motion is reduce; forces introductionComplete. */
  reducedMotion: boolean;
  /** False during server render and first hydration render; true afterwards. */
  enhanced: boolean;
};

type HeroViewKey       = "overview" | "finding" | "readiness";
type EvidenceRecordKey = "ev_retry_path" | "ev_no_idempotency_key";
type ReadinessViewKey  = "readiness" | "decision-boundary";

type HeroSceneState      = SceneInteractionState<HeroViewKey>;
type EvidenceSceneState  = SceneInteractionState<EvidenceRecordKey>;
type ReadinessSceneState = SceneInteractionState<ReadinessViewKey>;
```

`EvidenceRecordKey` is a union of genuine canonical `recordKey` values, not an
invented identifier scheme.

The Missing Proof scene has no interaction state. It keeps only the existing
`SceneMotion` reveal state, unchanged.

## 13. Manual-intent authority

**Manual visitor intent always wins within the scene.**

The first genuine interaction with a scene's controls — a click or tap on a
control, or a keyboard selection within it — must:

1. Set that scene's `authority` to `"manual"`.
2. Cancel any pending automatic step in that scene.
3. Set `introductionComplete` to `true`, so the scene renders its settled state
   at once rather than continuing to stagger underneath the visitor.
4. Prevent automatic behaviour from changing that scene again for the page
   lifetime.
5. Preserve the selected state while the visitor scrolls away and back.
6. Leave every other scene independent and still automatic.
7. Move no focus.
8. Scroll the page nowhere.

Rule 3 is the answer to "what happens if a visitor interacts during the
automatic introduction": the introduction ends immediately and completely.
A visitor never competes with an animation.

Hover, focus arriving by keyboard, and scrolling are **not** genuine
interactions and do not claim authority. Only an actual selection does.

**Manual state persists** for the current page lifetime, including while
navigating up and down the page.

**Manual state resets** on full page reload and on a new route visit — matching
Cursor's own hard-reset behaviour at a route boundary (§2g).

**Not used, at all:** URL query state; URL hash state for scene modes;
`localStorage`; `sessionStorage`; cookies; backend persistence; analytics
persistence.

## 14. Accessibility

### 14a. Locked requirements

1. Native semantic controls — real `<button>` elements carrying tab roles. No
   `<div>` is given a click handler.
2. Visible focus at every control, unchanged from the accepted route.
3. Selected state communicated programmatically via `aria-selected`.
4. Selected state communicated without colour alone — three cues (§11d).
5. No focus movement when scene content changes.
6. No auto-focus anywhere.
7. No page-level keyboard interception. Arrow keys are handled only while focus
   is inside a control group, and only on that group's own axis.
8. No hover-only information.
9. Touch and keyboard parity — every state reachable by both.
10. No fake controls. Nothing that looks operable is inert; nothing inert looks
    operable.
11. The seven Human Decision outcomes are never interactive.
12. Logical tab order — the page's existing 14 native stops plus exactly three
    new group stops, in document order.
13. Stable accessible names — no viewport-dependent label swapping.
14. No automatic announcement during scene introduction: the introduction does
    not change the a11y tree, only opacity and transform of already-present
    nodes.
15. An explicit strategy for manually changed content — §14b.
16. Usable at 200% zoom, no horizontal overflow, no control truncation.
17. Reduced-motion compatible — §16.
18. Coherent mobile reading order — copy, then scene, then controls, then panel.

### 14b. Announcement strategy — tab-panel semantics, no live region

**Locked: tab-panel semantics alone. No live region is introduced anywhere.**

Reason: the content change is user-initiated, bounded, and immediately adjacent
to the control that caused it, and the panel is programmatically associated with
that control through `aria-controls` / `aria-labelledby`. Selecting a tab already
announces the tab's name and its selected state, and the changed region is
discoverable by the standard means. Adding a polite status region on top would
announce the same change twice and would put a live region on a marketing page
that changes content only when a visitor asks it to — precisely the noisy
live-region pattern the brief warns against.

This is a further reason tabs beat toggle buttons here: toggle buttons would
have created the announcement problem that a live region would then have had to
solve.

## 15. Progressive enhancement

### 15a. Strategy

> Static truthful scene → bounded client enhancement.

The server renders a complete, truthful, fully readable page. Enhancement adds
inspection depth. It never adds meaning that the static page needed.

### 15b. Server-rendered static state per scene

| Scene | Server-rendered |
|---|---|
| Hero | Persistent chrome (§7a) complete; control row rendered as the plain panel label `Overview`; Overview panel visible; Finding and Readiness panels present, `visibility: hidden`, `inert` |
| Finding and Evidence | Finding head; both evidence records complete, as `<div>` cards; control row rendered as the plain panel label `Provenance and source`; the `ev_retry_path` trace panel visible; the second trace panel present, hidden, inert |
| Missing Proof | Unchanged from today. No control, no panel stack. |
| Readiness | Persistent content (§10a) complete, including `PENDING` and all seven outcomes; control row rendered as the plain panel label `Readiness`; Readiness panel visible; Decision-boundary panel present, hidden, inert |

### 15c. How the four hard problems are solved

**Do interactive controls appear only after client enhancement?** Yes. The
server never emits a control. The control row is emitted as a plain text panel
label — genuinely useful without JavaScript, and carrying no button affordance,
no border, no fill, no pointer cursor. It cannot be mistaken for a control
because it does not look like one.

**How does control-space stability avoid layout shift?** The control row has a
fixed height (`--scene-control-row-h`) that the panel label and the tablist both
occupy exactly. The row is present and occupied in both states, so enhancement
changes what is inside the row, never the box.

**How does hydration avoid false-state flashing?** The first client render is
identical to the server render (`enhanced: false`), so hydration matches exactly.
An effect then sets `enhanced: true` and React re-renders the row as a tablist
and the record cards as buttons. The element-type change happens after
hydration, in a normal re-render, not during it. Because CSS gives
`div.recordCard` and `button.recordCard` identical box models, and the control
row is height-fixed, the replacement is invisible.

**How do all scene dimensions remain stable?** Every panel of a scene occupies
the same CSS grid cell (`grid-area: 1 / 1`). Inactive panels are
`visibility: hidden` and `inert` — removed from the accessibility tree and the
tab order, but still contributing height. The scene therefore always measures
the height of its tallest panel, in every state, from the first server-rendered
paint onward. Switching views cannot change the scene's height, cannot move
anything below it, and cannot jump the page.

The cost is bounded whitespace beneath a shorter panel. Authoring constraint:
**panels within one scene are authored to within roughly 20% of each other's
height at desktop**, which the locked content in §7b and §10b already satisfies.

### 15d. Without JavaScript

1. Every scene remains understandable.
2. Every canonical value in §21 remains visible — verified item by item in
   `R5E1E4A_INTERACTION_ARCHITECTURE_PACKAGE/NO_JAVASCRIPT_CONTRACT.md`.
3. No fake working control appears.
4. No essential state is hidden. The hidden panels carry optional inspection
   depth only; every core product relationship is complete without them.
5. Genuine actions remain links — the sample-review and start-a-review actions,
   the navigation, the footer, and the handoff, all unchanged native anchors.
6. The page remains complete.

Per §14 of the brief, optional interactive states are deliberately **not**
duplicated into the static page, because each core product relationship is
already complete and truthful without them.

## 16. Reduced-motion behaviour

Detailed motion remains deferred to Phase 7A.2. The interaction behaviour is
locked now:

1. Automatic choreography does not run.
2. The scene renders its canonical settled state immediately.
3. Manual scene controls remain fully available.
4. Manual state changes occur without spatial choreography — the panel swap is
   instant.
5. Selection and focus remain clear; both cue systems are unaffected, since
   neither depends on motion.
6. No content becomes unavailable.
7. No scene remains in a pre-reveal state.

Reduced motion never disables genuine interaction. It removes movement, not
capability.

## 17. Responsive and touch behaviour

### 17a. Control treatment by tier

Aligned to the route's existing, accepted breakpoints — no new breakpoint is
introduced.

| Tier | Hero (3) and Readiness (2) view controls | Evidence record controls |
|---|---|---|
| **Desktop ≥ 1280px** | Compact horizontal row, left-aligned, 36px high, 8px gap | Vertical stack, full scene width |
| **Laptop 1025–1279px** | Identical | Identical |
| **Tablet ≤ 1024px** | Identical horizontal row; more room, since the split has collapsed to full width | Identical |
| **Mobile ≤ 767px** | Horizontal row that **wraps** onto a second line where needed; 44px min height; full labels retained | Identical; cards remain full width |
| **≤ 359px** | **Vertical control list**, full-width stacked — the one deliberate recomposition, at the breakpoint the stylesheet already defines | Identical |
| **200% zoom (640×400 @2x)** | Behaves as the ≤ 767px tier; no truncation, no overflow | Identical |

**No dropdown, at any width.** Three states and two states never justify one,
and §16 of the brief forbids introducing one merely to save space.

### 17b. Requirements

1. Minimum comfortable touch targets — §11e.
2. No horizontal control overflow at any width. Controls wrap or recompose; they
   never scroll sideways.
3. No tiny desktop tab treatment — 36px minimum height, 13px minimum label.
4. Controls wrap or recompose deliberately, per the table above.
5. Focused detail appears close to its controlling record — the trace panel sits
   directly beneath the record list at every viewport, never in a distant column.
6. State changes cause no page jump — guaranteed structurally by §15c.
7. Product scenes retain stable height in every state — same guarantee.
8. No internal scene scrolling, at any viewport, in any state. Unchanged.
9. No hover dependency.
10. Selected state obvious at every viewport — all three cues survive wrapping
    and the ≤ 359px vertical recomposition.
11. Canonical selected-review truth remains visible — guaranteed by persistent
    chrome (§7a, §10a), never behind a control.
12. Mobile source order remains copy before scene. Unchanged; already the DOM
    order.

## 18. Reusable public interaction primitives

The smallest set the three interactions justify. Defined, **not implemented**.

### 18a. `PublicSceneViews`

| Property | Lock |
|---|---|
| Responsibility | The client boundary for one scene. Owns that scene's `SceneInteractionState`, resolves automatic-versus-manual authority, decides `enhanced`, renders the control row and the panel grid. |
| Semantics | Renders `role="tablist"` with the supplied orientation and accessible name once enhanced; renders a plain panel label before that. |
| State ownership | Sole owner. One instance per scene. Never lifted, never shared, never synchronized. |
| Allowed content | A persistent-chrome slot, a typed list of `{ key, label, panel }`, and nothing else. It renders no product value itself. |
| Responsive behaviour | Orientation and tier treatment per §17a, driven by CSS only. |
| Accessibility | §11c–d, §14. |
| No-JavaScript | Emits the panel label and the panel grid with the default panel visible. Emits no control. |
| Future-route reuse | The intended reuse unit. A future route composes it with its own content; it carries no homepage-specific knowledge. |

### 18b. `PublicSceneTab`

| Property | Lock |
|---|---|
| Responsibility | One control within the group. |
| Semantics | `<button type="button" role="tab">` with `aria-selected`, `aria-controls` and roving `tabindex`. |
| State ownership | None. Fully controlled by `PublicSceneViews`. |
| Allowed content | Text for the `switch` variant; a record card composition for the `record` variant. |
| Responsive behaviour | Target sizes per §11e; wrapping and vertical recomposition per §17a. |
| Accessibility | Three selected-state cues; stable accessible name; native focus ring. |
| No-JavaScript | Not rendered. Its `record` variant's content is rendered as a plain `<div>` card instead, with an identical box model. |
| Future-route reuse | Both variants are content-agnostic. |

### 18c. `PublicScenePanel`

| Property | Lock |
|---|---|
| Responsibility | One panel in the stack. |
| Semantics | `role="tabpanel"`, `aria-labelledby` its control. `tabindex="0"` only when it contains no focusable element. |
| State ownership | None. |
| Allowed content | Arbitrary scene content, authored within the §15c height constraint. |
| Responsive behaviour | Fills the shared grid cell at every viewport. |
| Accessibility | Inactive panels are `visibility: hidden` and `inert`. |
| No-JavaScript | Default panel visible; others present, hidden and inert. |
| Future-route reuse | Content-agnostic. |

### 18d. Explicitly rejected primitives

- **`PublicSceneStatus`** — would be a live region. §14b rules live regions out.
- **`PublicRelationshipTrace`** — the Finding-and-Evidence trace is one scene's
  content, not a shared abstraction. Abstracting a single use is speculative.
- **`PublicInteractionAuthority`** — authority is a field on
  `SceneInteractionState`, not a component.
- **`PublicSceneEnhancementBoundary`** — folded into `PublicSceneViews`, which
  is already the boundary. A separate wrapper would add a client component
  without adding a decision.
- **`PublicSceneTabList`** — folded into `PublicSceneViews` for the same reason.

Three primitives, not eight. Two of the three are stateless.

## 19. Future-route reuse

An early continuity note only. The full cross-route contract remains Phase 8.
No route below is built, scaffolded or scheduled here, and **no assumption is
made that any of them needs product interaction.**

| Route | Likely reuse |
|---|---|
| Product | The most likely genuine reuse: one scene with two or three views of a single canonical subject, exactly the Hero pattern. |
| Trust | Probably none. Trust is an argument read in order — the homepage Trust section is already correctly non-interactive, and a longer version stays so. |
| Model Assistance | Plausible: a two-view switch contrasting deterministic and model-assisted provenance on one canonical record. Only if genuine canonical data supports both sides. |
| Resources | None. A list of destinations is links. |
| Security or Architecture | Probably none. Dense reference material belongs in ordinary prose and tables. Cursor's own documentation route (§2j) abandons marketing scene grammar entirely for a sidebar and prose — the right instinct, worth copying. |
| Documentation | None from this grammar. |

The homepage primitives support reuse **without forcing every route into a mini
application.** The correct default for a new route is no product interaction at
all; a route earns a scene switch only by having a canonical subject with more
than one genuine view.

## 20. Performance boundary

| # | Lock |
|---|---|
| 1 | No new dependency. |
| 2 | No animation library. |
| 3 | No generic state-management library. |
| 4 | Small independent client boundaries — one per interactive scene, three in total, added to the existing two (`PublicHeader`, `SceneMotion`). Five client components on the route, maximum. |
| 5 | Server-rendered static scene truth. |
| 6 | No external request. |
| 7 | No model call. |
| 8 | No persistence of any kind. |
| 9 | No telemetry in this private phase. |
| 10 | No continuous scroll listeners added. Viewport entry keeps using the existing one-shot `IntersectionObserver`. |
| 11 | No layout-measurement loops. No `getBoundingClientRect` in a handler, no `ResizeObserver`, no measured heights — §15c solves stability with CSS grid, not measurement. |
| 12 | No duplicated full application trees. |
| 13 | No internal scrollbars. |
| 14 | Stable scene dimensions in every state. |

### 20a. Complexity expectation

Deliberately modest, because these are three bounded interactions:

- **≤ 3 new component modules** (§18) plus one shared types module.
- **≤ ~6 KB gzipped** added to first-load client JS across all three scenes.
- **≤ 3 React state values per scene**, or one `useReducer` over the single
  typed state object in §12.
- **Zero new observers.** `hasEnteredViewport` is supplied by the existing
  `SceneMotion`, not by a second observer.
- **Zero new dependencies, zero new breakpoints, zero new CSS files.**

Anything materially larger than this is evidence the design drifted toward a
second application and should be rejected in review.

## 21. Product-truth boundaries

Preserved exactly, in every state, at every viewport, with and without
JavaScript, and under reduced motion:

| Field | Value |
|---|---|
| Repository | `example/b2b-redemption-api` |
| PR | `#482` |
| Title | Add fallback handling for failed discount-code retrieval |
| Recommendation | `TESTS REQUIRED` |
| Risk | `46/100 · MEDIUM` |
| Requirements | `4 open · 2 blocking` |
| Human Decision | `PENDING` |

**Permitted interaction effects.** Change local inspection focus; change which
canonical record is foregrounded; show existing provenance; show existing
readiness context; switch between existing public views.

**Forbidden effects.** Run analysis; simulate analysis; create evidence; resolve
missing proof; clear a requirement; change risk; change recommendation; select a
Human Decision outcome; record a decision; write externally; persist state;
invent collaboration; imply repository connection; imply model execution.

Structural guarantee: every canonical value above lives in **persistent scene
chrome**, outside every panel (§7a, §10a). No interaction can hide one, because
no interaction touches the region they live in.

## 22. Acceptance criteria

The later implementation is acceptable only if all of the following hold.

1. Exactly three scenes are manually interactive; Missing Proof has zero
   controls.
2. Each interactive scene holds only the states listed in §5, keyed by genuine
   canonical `recordKey` values where records are involved.
3. Each scene's default server state and canonical settled state are as locked
   in §7, §8 and §10.
4. One control grammar (tabs) is used in all three scenes; no second grammar
   appears.
5. The keyboard model matches §11c exactly, including that the unused arrow axis
   is not intercepted.
6. A genuine interaction during the automatic introduction ends it immediately
   and completely, and never moves focus or scrolls the page.
7. Manual state survives scrolling away and back, and resets only on reload or a
   new route visit.
8. No URL, storage, cookie, backend or analytics persistence exists.
9. Scene height does not change when a view changes, at any viewport.
10. No layout shift occurs at hydration.
11. Without JavaScript, every §21 value is visible, every scene is
    understandable, and no control-like element appears.
12. Under reduced motion, every scene renders its settled state immediately and
    every control still works.
13. No live region exists on the route.
14. All seven Human Decision outcomes are present, unselected, and zero are
    focusable or role-carrying — at every viewport and in every state.
15. Controls meet the target sizes in §11e and never overflow horizontally.
16. Selected state is conveyed by three cues, never colour alone.
17. No dependency, lockfile, canonical data file, production route or frozen R4
    file changed.
18. The client-complexity expectation in §20a holds.

## 23. What remains explicitly non-interactive

Restated as a single list because it is the easiest thing to erode: Missing
Proof and Requirement; Trust; the unresolved-case handoff apart from its two
genuine links; the footer apart from its links; the seven Human Decision
outcomes; the two Review Queue context rows; the eight verification stages
(which do not appear on this route at all); every product value in §21.

## 24. Phase 7 implementation sequence

Defined, not implemented. The brief's recommended structure is kept, with the
boundaries sharpened where this phase's evidence supports it.

| Phase | Scope | Gate |
|---|---|---|
| **7A.2** Motion Choreography Contract | Documentation only. Defines durations, easings, step ordering, the settled state for all four scenes, and how a manual interaction terminates a running introduction. | Must precede 7B, because the settled state and the §13.3 termination rule are motion definitions this contract deliberately leaves open. |
| **7B** Finding and Evidence Interaction Gate | Builds all three primitives (§18) and wires **only** the Finding and Evidence scene. | Human review of one working scene. Also the §8e proof obligation: if the trace does not demonstrably improve comprehension, reclassify the scene as choreography-only and continue with two interactive scenes. |
| **7C** Hero and Readiness Interaction Completion | Wires the remaining two scenes using the primitives 7B proved. No new primitive may be introduced here; needing one means 7B's abstraction was wrong. | Human review of the complete interactive page. |
| **7D** Responsive, accessibility and final interaction review | Full sweep at every R5E.1E.3 viewport plus the reduced-motion and no-JavaScript states; keyboard walk; §22 verified item by item. | Human acceptance. |

Finding and Evidence is first, as the brief directs, because it is the clearest
demonstration of Lintel's evidence model — and because it is the scene most
likely to fail its own justification test. Building the weakest case first means
the primitives are proved against the hardest requirement, and a negative result
costs one phase instead of three.

### 24a. What the implementation phase must prove first

Before any second scene is wired, 7B must prove: the record-to-trace
relationship is legible without explanation; zero layout shift at hydration;
zero height change on selection; the keyboard model; the no-JavaScript state;
and the reduced-motion state.

### 24b. Stopping condition for Phase 7

Phase 7 is complete, and stops, when 7D is accepted with: three interactive
scenes (or two, if §8e resolves negatively), one grammar, three primitives, zero
new dependencies, and §22 satisfied in full.

Phase 7 does **not** continue into atmospheric surface exploration, additional
public routes, a fourth interactive scene, or any transfer to the production
homepage. Each of those is separately scoped and separately accepted.

## 25. Motion-choreography handoff

This contract fixes the interaction boundary. Phase 7A.2 owns everything below
the line.

**Already locked here — 7A.2 may not contradict:**

1. An automatic introduction may run **once per scene**.
2. It may not create new product truth.
3. It may not depend on precise scroll position.
4. It may not loop.
5. It may not restart when scrolling back.
6. It may not continue after a manual interaction — §13.3 ends it at once.
7. It must settle into a valid canonical state.
8. It must preserve stable scene dimensions.
9. It must not move focus.
10. It must not generate automatic screen-reader announcements.
11. The introduction does **not** change `active`. It reveals the default view's
    content; it never switches views. There is therefore no automatic state
    change for manual intent to fight — only a reveal to terminate.

**Canonical settled states, locked here:**

| Scene | Settled state |
|---|---|
| Hero | `active: "overview"`, all steps revealed, persistent chrome and all four canonical facts fully visible |
| Finding and Evidence | `active: "ev_retry_path"`, finding head, both records and the trace panel fully visible |
| Missing Proof and Requirement | All three steps revealed: missing proof, `Leaves open` edge, blocking requirement, unresolved bar |
| Readiness and Human Decision | `active: "readiness"`, persistent content including `PENDING` and all seven outcomes fully visible |

**Open to 7A.2:** step durations and delays; easing curves; the number and
grouping of reveal steps per scene; whether the control row participates in the
introduction at all (this contract's preference: it does not — controls should
be available from first paint); how a terminated introduction settles (instantly
versus a short completing transition); and reduced-motion equivalents for each.

No duration is specified in this document, deliberately.

## 26. Protected scope

Not modified, verified by `git diff` before and after this phase:
`app/page.tsx`, `app/_public-r5`, `app/_public-r5-recalibrated`,
`app/_public-r5-reference-reconstruction`, `app/visual-lab/public-r5`,
`app/visual-lab/public-r5-recalibrated`,
`app/visual-lab/public-r5-reference-reconstruction`, `app/workspace`,
`app/report`, `app/new`, `app/home`, `app/review-operations`,
`app/integrations`, `app/settings`, `app/review-policies`, `app/team`,
`app/visual-lab/workspace-r4`, `lib/workspace-v2`, `package.json`, every
lockfile, `public/r5/scenes`, `.claude/launch.json`, accepted R4 documentation,
and accepted earlier R5 documentation.

Created or modified in tracked scope: this document, and `docs/r5/README.md`
(this milestone's entry). Created untracked:
`R5E1E4A_INTERACTION_ARCHITECTURE_PACKAGE/`,
`R5E1E4A_CURSOR_INTERACTION_ANALYSIS/`.

No application code, CSS, route, canonical value or dependency changed. Nothing
was staged, committed, pushed or merged. No build was required or run, because
no application code may change in this phase.

## 27. Decisions required — answered

| # | Question | Answer |
|---|---|---|
| 1 | Which exact three scenes are interactive? | Hero selected-review; Finding and Evidence; Readiness and Human Decision. |
| 2 | Which scene remains choreography-only? | Missing Proof and Requirement. |
| 3 | Exact states per interactive scene? | Hero `overview`/`finding`/`readiness`; Evidence `ev_retry_path`/`ev_no_idempotency_key`; Readiness `readiness`/`decision-boundary`. |
| 4 | Each scene's default static state? | `overview`; `ev_retry_path`; `readiness`. |
| 5 | Each scene's canonical settled state? | Identical to the default, with all introduction steps complete (§25). |
| 6 | Which control semantics? | Tabs and tab panels — one grammar, two orientations (§11a). |
| 7 | Keyboard model? | Roving tabindex; automatic activation; arrows on the group's own axis only; Home/End; wrapping; one Tab stop per group (§11c). |
| 8 | Interaction during automatic introduction? | Ends it immediately and completely; authority becomes manual; focus does not move; the page does not scroll (§13.3). |
| 9 | Does manual state persist after scrolling away? | Yes, for the page lifetime. |
| 10 | What resets manual state? | Full page reload, and a new route visit. Nothing else. |
| 11 | What appears without JavaScript? | Every §21 canonical value, every core relationship, the default panel of every scene, and no control (§15b, §15d). |
| 12 | How are controls introduced without fake no-JS controls? | The server emits a plain text panel label in a fixed-height row; enhancement replaces its contents with a tablist (§15c). |
| 13 | What happens under reduced motion? | No choreography; settled state immediately; all controls still work; instant panel swaps (§16). |
| 14 | Which content changes require announcement? | None beyond what tab-panel semantics already provide. No live region exists (§14b). |
| 15 | Mobile control treatment? | Wrapping horizontal row at ≤ 767px with 44px targets; vertical list at ≤ 359px; never a dropdown (§17a). |
| 16 | Which primitives become shared? | `PublicSceneViews`, `PublicSceneTab`, `PublicScenePanel`. Five candidates rejected (§18d). |
| 17 | What remains explicitly non-interactive? | §23. |
| 18 | What must motion choreography define next? | Durations, easings, step grouping, control-row participation, terminated-introduction settling, reduced-motion equivalents (§25). |
| 19 | What must implementation prove first? | §24a. |
| 20 | Stopping condition for Phase 7? | §24b. |

No core interaction question is left unresolved.

## 28. Remaining non-core questions

Carried forward deliberately. None blocks Phase 7.

1. Whether the Hero's Overview panel is the right home for the three
   reviewer-focus lines, or whether they read better as persistent chrome. A
   7C composition question, not an architecture question.
2. Whether the Readiness scene's two view labels should be `Readiness` /
   `Decision boundary` or a warmer pair. Wording, decided at implementation.
3. Whether the ≤ 359px vertical control list should also apply at ≤ 400px. A
   measurement 7D can settle with genuine pixels; it changes no semantic.
4. Whether the bounded whitespace under a shorter panel (§15c) is visible enough
   at desktop to warrant tightening the 20% authoring constraint. 7B will show
   real numbers.
5. The alternating sections' copy/scene height mismatch carried forward from
   R5E.1E.3 §24 remains open and is not reopened here; the interaction layer
   neither worsens nor improves it.
6. Whether `PublicSceneViews` should eventually accept a horizontal *and*
   vertical variant as separate components. Deferred until a second route
   genuinely needs it — Phase 8, not Phase 7.
