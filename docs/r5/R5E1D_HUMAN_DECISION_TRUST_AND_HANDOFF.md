# R5E.1D — Readiness, Human Decision, Trust and Handoff

Branch: `r5e1d-human-decision-and-handoff`
Status: implementation prototype at the same private route. No production
route, no accepted R5 or R4 document, no R5E.1A–C document was modified.
Owning phase: R5E.1 — deliberate recalibration of Lintel's public visual
identity, composition and interactive product storytelling.

R5E.1A is accepted and closed. R5E.1B is accepted and closed. R5E.1C is
accepted and closed (`docs/r5/R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md`, human
visual acceptance recorded 2 August 2026). R5E.1D extends R5E.1C's accepted
implementation at the same private route,
`/visual-lab/public-r5-recalibrated`.

This completes the private prototype's product story. It is not the complete
assembled page: R5E.1E is responsible for full-page composition, rhythm and
density; R5E.1F reviews and freezes the direction and decides on any
production transfer.

---

## 1. Purpose and scope

R5E.1D completes the recalibrated public prototype:

1. the `readiness` state in full (already built by R5E.1C; unchanged here
   except for its new "next action");
2. both Human Decision surfaces — the guided, non-modal preview and the
   manually activated `role="dialog"` — exactly as specified in
   `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §7 and
   `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §12a;
3. genuine decision-readiness context and all seven genuine, unselected
   outcomes;
4. an explicit, visible read-only warning wherever the decision surface
   appears;
5. the eighth and final working verification-spine stage;
6. a compact, product-led trust boundary;
7. the unresolved PR #482 handoff;
8. movements four ("Accountable decision") and five ("Trust and
   continuation") of the five-movement page composition.

It does not build outcome selection, decision submission, a successful
decision state, external writes, local persistence, GitHub or Slack
execution, production transfer, supporting public pages, pricing or
authentication. None of these has an event, a control or a code path capable
of them — see §7 and §12 below.

---

## 2. Authoritative inputs

Read before implementation, in this order:

1. `docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
2. `docs/r5/R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md`
3. `docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
4. `docs/r5/R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`
5. `docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md`
6. `docs/r5/R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md`
7. `docs/r5/R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md`
8. `docs/r5/README.md`
9. the existing `app/_public-r5-recalibrated/**` implementation, read in full
   before any edit
10. `lib/workspace-v2/fixture-adapter.ts` (`case482`), read for
    `decision.status === "empty"` (State A: no engineer decision recorded)
11. `lib/workspace-v2/view-model.ts`, read for `DecisionOutcome`,
    `DECISION_OUTCOMES`, `OUTCOME_LABEL` and `OUTCOME_MEANING` — the frozen
    product's own seven outcomes, verbatim
12. `app/workspace/HumanDecisionDialog.tsx`, read in full for genuine dialog
    semantics, focus containment, the read-only preview mode
    (`readOnlyReason`), and its own copy
13. `app/workspace/workspace-r4.module.css`, read for the real dialog's
    layout pattern (`.dialogLayer`, `.decisionDialog`, `.outcomeGrid`)
14. `docs/r4/R4B_RESPONSIVE_KEYBOARD_FOCUS.md` §"Human Decision modal focus"
    and its `Esc` precedence table, read for frozen modal focus, Escape and
    responsive requirements this phase must not contradict

No broad repository audit was conducted. No R5E.1A–C document, no earlier
accepted R5/R4 document, was edited.

---

## 3. Implementation architecture

All work is inside the existing private folder and route from R5E.1B/C; no
new route was created.

```
app/_public-r5-recalibrated/
  R5RecalibratedPrototype.tsx        page composition — extended (movements 4–5)
  canonical-review.ts                canonical data module — extended
  demo-reducer.ts                    full state model — extended
  prototype-content.ts                nav/hero/trust/journey copy — extended
  public-r5-recalibrated.module.css  — extended
  components/
    PublicPrototypeHeader.tsx        unchanged
    LiveReviewStage.tsx              extended: decision dispatch, trigger-ref capture
    GlobalRail.tsx                   unchanged
    ReviewQueue.tsx                  unchanged
    VerificationWorkspace.tsx        extended: Human Decision orientation panel
    ContextualInspector.tsx          extended: Human Decision inspector panel
    VerificationSpine.tsx            extended: stage 08 interactive
    VerificationJourneyNarrative.tsx extended: movement four + stage-08 narrative
    HumanDecisionSurface.tsx         new — shared content, guided preview, manual dialog
```

`app/visual-lab/public-r5-recalibrated/page.tsx` (the route wrapper) was not
modified.

---

## 4. Canonical Human Decision data

`canonical-review.ts` gained three exports, cross-checked against the frozen
product on 2026-08-02:

| Export | Frozen source | Content |
|---|---|---|
| `DECISION_OUTCOMES` | `lib/workspace-v2/view-model.ts` `DECISION_OUTCOMES`, `OUTCOME_LABEL`, `OUTCOME_MEANING` | The seven outcomes, verbatim: `approve`, `approve-with-accepted-risk`, `tests-required`, `review-required`, `request-changes`, `blocked`, `defer` — each with its exact label and meaning string |
| `DECISION_READINESS` | `case482.decision.status === "empty"` (frozen fixture, State A: read succeeded, no engineer decision recorded); `CANONICAL_REVIEW.headSha`/`branch` | `priorDecision: "No Human Decision has been recorded for this review."`; `appliesTo: "Head 9c41af2 · fix/discount-code-retrieval-fallback"`; `outcomeSelected`, transcribed verbatim from the real dialog's own `<p>No outcome is selected from Lintel's recommendation.</p>` |
| `DECISION_DIALOG_COPY` | `app/workspace/HumanDecisionDialog.tsx` | Eyebrow (`"Accountable engineer action"`), heading (`"Preview decision flow"`, the exact string the real dialog renders when given a `readOnlyReason`), statement (`"Lintel recommends. The accountable engineer decides."`), and the read-only label/body, transcribed verbatim from the real dialog's own `readOnlyReason`-branch copy (`"This preview does not write to the browser-local Human Decision ledger or publish through any integration."`) |

No outcome is renamed, reworded, simplified or reordered. No field was
invented that the frozen product does not itself carry — see §11 for the
full outcome-and-product-truth traceability.

---

## 5. State-model extension

`demo-reducer.ts`'s `DemoStage`, `DecisionSurface` and event types were
already present from R5E.1A's frozen contract (`demo-reducer.ts` carried
`decisionSurface`/`decisionSurfaceOrigin` in `DemoState` since R5E.1B,
unused until now). R5E.1D adds:

```ts
type DemoEvent =
  | ... (unchanged R5E.1C events)
  | { type: "OPEN_DECISION"; source: EventSource }
  | { type: "CLOSE_DECISION"; source: EventSource }
  | { type: "RESUME_GUIDED" }
  | { type: "RESET_DEMO" };
```

`WORKING_STAGE_ORDER` gained `"human-decision"` as its eighth and final
entry, and `eventForWorkingStage("human-decision", source)` returns
`OPEN_DECISION`. This is the only `WorkingStage` whose event carries no
`recordId` — Human Decision opens a surface over the whole review, not a
single record — but it dispatches through the same `eventForWorkingStage`
helper every other working stage uses, so guided, pointer and keyboard
activation produce identical state, matching contract §6a.5.

### 5a. Transition table

| Event | Resulting `stage` | Other effects |
|---|---|---|
| `OPEN_DECISION` | `human-decision` | `decisionSurface = "open"`; `decisionSurfaceOrigin = event.source` |
| `CLOSE_DECISION` | unchanged | `decisionSurface = "closed"`; `decisionSurfaceOrigin = null` |
| `RESUME_GUIDED` | unchanged | `mode = "guided"`; `lastManualStage = null`; **a manually opened decision surface is closed first** (frozen transition table, verbatim) |

Every other stage-moving event (`SELECT_REVIEW` … `SHOW_READINESS`) gained
one small, documented extension: `closeStaleGuidedDecisionSurface` closes a
**guided-origin** decision surface whenever a different stage-moving event
fires. This is not stated verbatim in the frozen transition table, which
only names what happens to a *manually* opened surface on `RESUME_GUIDED`.
It is a deliberate, minimal extension recorded here per
`R5E1A_IMPLEMENTATION_HANDOFF.md` §1.11: the guided preview is "ordinary
in-page content tied to the human-decision anchor" (contract §7); once
guided scrolling has moved to a different anchor, that content is no longer
the active stage, so its surface closes with it. A manually opened dialog is
never affected by this path, because every guided event is already
discarded outright while `mode === "manual"` before `applyStageEvent` ever
runs — the manual dialog can only be closed by `CLOSE_DECISION` or by
`RESUME_GUIDED`.

### 5b. Invariants

All seven invariants from `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §4d
continue to hold, now exercising the two that R5E.1C left unreachable:

- Invariant 2 (`decisionSurface === "open"` implies `decisionSurfaceOrigin
  !== null`): true by construction — the only two writers of
  `decisionSurface: "open"` are `OPEN_DECISION`'s two branches, both of
  which set `decisionSurfaceOrigin` in the same assignment.
- Invariant 3 (`decisionSurfaceOrigin === "manual"` implies dialog
  semantics): enforced entirely in `LiveReviewStage.tsx`'s render logic —
  `showManualDialog = decisionSurface === "open" && decisionSurfaceOrigin
  === "manual"` is the sole gate for `<HumanDecisionDialog/>`.
- Invariant 6 (no event can set, clear or record a Human Decision outcome):
  true by construction — `OPEN_DECISION`/`CLOSE_DECISION` only ever write
  `decisionSurface`/`decisionSurfaceOrigin`; no event carries an outcome
  value, and `HumanDecisionSurface.tsx` renders every outcome from the
  static `DECISION_OUTCOMES` module, never from state.

---

## 6. Readiness-to-decision transition

`ReadinessPanel` (`VerificationWorkspace.tsx`) replaces R5E.1C's static
closing prose ("Next: 08 Human Decision — … Not yet open in this sample")
with a genuine next action:

> The analysis and evidence record above are complete enough to inspect.
> Unresolved requirements remain, so readiness stays advisory — the
> accountable engineer retains **08 Human Decision**. Opening it selects
> nothing and submits nothing.
>
> [Open Human Decision]

The button dispatches a manual `OPEN_DECISION`, identical to every other
panel's "Inspect X" pattern. Movement four's narrative intro
(`ACCOUNTABLE_DECISION` in `prototype-content.ts`) restates the same five
points in server-rendered prose ahead of the stage-08 narrative block: the
record is complete enough to inspect; two requirements remain open;
readiness stays advisory; Lintel has not finished the review on the
engineer's behalf; every outcome stays unselected and nothing is submitted.

---

## 7. Guided Human Decision preview

`HumanDecisionPreview` (`components/HumanDecisionSurface.tsx`) is ordinary,
non-modal content: no `role="dialog"`, no `aria-modal`, no keydown handler,
no focus movement. It renders only when
`decisionSurface === "open" && decisionSurfaceOrigin === "guided"` —
reachable only through the guided `IntersectionObserver` crossing the
`data-verification-stage="human-decision"` anchor in
`VerificationJourneyNarrative.tsx`, using the same mechanism R5E.1C already
proved for the other seven anchors.

It is positioned as `.decisionLayer`, `position: absolute` **within**
`.stageWrap` (which gained `position: relative` for this purpose) — "a
non-modal visual layer... above the live stage," which
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §7 explicitly permits. Its
scrim (`.decisionScrim`) is `aria-hidden="true"` and `pointer-events: none`,
so it dims the Rail/Queue/spine behind it without blocking scroll, pointer
interaction or keyboard focus anywhere on the page — the page remains fully
scrollable and operable, satisfying items 7–10 of the task's guided-preview
list. It carries the same `HumanDecisionContent` (readiness synthesis, all
seven unselected outcomes, the read-only warning) the manual dialog uses, so
nothing shown here is a second, differently worded copy of the same facts.

An "Open Human Decision" button inside the preview lets a visitor who has
scrolled here manually open the real dialog, matching the same
`eventForWorkingStage`-based manual dispatch every other control uses.

**Environment limitation, recorded honestly.** As R5E.1C's §17a already
recorded for this same session's Browser pane, `IntersectionObserver` never
delivers a callback here (confirmed again this phase — see §25 below), so
the guided path into `human-decision` could not be exercised end-to-end via
real scroll in this session. It was verified instead by: (1) direct DOM
inspection of the anchor (`data-verification-stage="human-decision"` present
in server-rendered output, confirmed in `get_page_text`), which is the exact
mechanism the observer already reads for the other seven working stages
R5E.1C proved; (2) manually dispatching the equivalent `OPEN_DECISION` event
with `source: "manual"` and confirming the surface opens with correct
content (§9); and (3) code inspection confirming `HumanDecisionPreview`
carries no `role`, no `aria-modal` attribute and no keydown handler,
structurally guaranteeing it cannot trap focus regardless of how it is
reached.

---

## 8. Manual Human Decision dialog

`HumanDecisionDialog` (`components/HumanDecisionSurface.tsx`) renders only
when `decisionSurface === "open" && decisionSurfaceOrigin === "manual"`,
reachable from three genuine triggers: the verification spine's `08 Human
Decision` button, the Readiness panel's `Open Human Decision` button, and
the Human Decision panel's own `Open Human Decision` button. All three route
through one shared `navigateManual` callback in `LiveReviewStage.tsx`.

Semantics, mirroring `app/workspace/HumanDecisionDialog.tsx`'s own pattern:

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`/`aria-describedby`
  pointing at its own heading and statement.
- Initial focus targets the heading (`tabIndex={-1}`, focused via
  `requestAnimationFrame` — the same pattern the real dialog uses for its
  first outcome radio).
- Focus is contained: `Tab`/`Shift+Tab` cycle within the panel via the same
  `FOCUSABLE`-selector-and-boundary-check pattern the real dialog's
  `containFocus` uses. **Verified live** (see §25): Tab from the close icon
  correctly reaches the scrollable body (a legitimate, browser-injected tab
  stop for keyboard-scrollable regions — the same characteristic the real
  product's own `.dialogBody { overflow: auto }` has), then the footer
  `Close` button, then wraps back to the close icon — never escaping to
  background content.
- `Escape` closes the dialog. **Verified live**: dialog unmounts,
  `document.body.style.overflow` is restored, and focus returns exactly to
  the trigger button that opened it.
- Focus restoration uses a `decisionTriggerRef` captured from
  `document.activeElement` at the moment of manual navigation to
  `"human-decision"` — the same `returnFocusRef` pattern
  `WorkspaceR4Client.tsx` already uses for its own `decisionTriggerRef`.

**No outcome can be selected, no rationale can be entered, and there is no
submission-capable action anywhere in this component.** The task brief's own
§8 instruction — "Do not use disabled radio buttons when that would create a
misleading form... Prefer truthful non-interactive outcome records" —
resolves an apparent tension with `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
§7, which describes "the required rationale field, empty" and "the submit
action in its disabled, read-only resting state." Per
`R5E1A_IMPLEMENTATION_HANDOFF.md` §1.11, this phase records that
discrepancy here rather than silently reinterpreting the frozen document:
this implementation follows the R5E.1D brief's more specific, more recent
instruction and renders **no form controls at all** — no `<input>`, no
`<textarea>`, no disabled submit button — only truthful, non-interactive
outcome records and a genuine `Close` control. This satisfies accessibility
requirement 16 ("no disabled-form theatre") and 28 ("no fake control in the
accessibility tree") more completely than a disabled form would, while still
satisfying every substantive requirement both documents share: all seven
outcomes visible and unselected, the read-only boundary explicit, and
nothing capable of being submitted.

---

## 9. Decision-readiness content

Both surfaces render the same `HumanDecisionContent`:

1. Eyebrow: `Accountable engineer action`.
2. Statement: `Lintel recommends. The accountable engineer decides.`
3. A context card: repository/PR, title, the four canonical values
   (recommendation, risk, requirements, readiness headline), the prior
   Human Decision (`No Human Decision has been recorded for this review.`),
   and the head/branch a future decision would apply to
   (`Head 9c41af2 · fix/discount-code-retrieval-fallback`).
4. `No outcome is selected from Lintel's recommendation.` — verbatim from
   the real dialog.
5. All seven outcomes.
6. The read-only warning.

No field beyond these was invented; §4 traces each one to its frozen source.

---

## 10. Outcomes and read-only boundary

Each outcome renders as a non-interactive record — a bordered row with a
plain (non-input) marker, the label, the meaning, and a `Not selected` tag —
never a radio input, disabled or otherwise. All seven are visible and
unselected in both surfaces, confirmed live: `document.querySelectorAll` for
`input[type=radio]`/`input[type=checkbox]` inside `[role="dialog"]` returns
zero. The read-only warning (`Read-only sample` / the verbatim
"does not write to the browser-local Human Decision ledger" line) is present
in both surfaces and in the server-rendered narrative.

---

## 11. Outcome-and-product-truth traceability

| Outcome (this prototype) | Frozen source (`view-model.ts`) | Label | Meaning |
|---|---|---|---|
| `approve` | `DECISION_OUTCOMES[0]` | Approve | Engineer approves merge. |
| `approve-with-accepted-risk` | `DECISION_OUTCOMES[1]` | Approve with accepted risk | Approve, and the engineer — not Lintel — explicitly accepts named residual risks. |
| `tests-required` | `DECISION_OUTCOMES[2]` | Tests required | Test evidence is missing. |
| `review-required` | `DECISION_OUTCOMES[3]` | Review required | Further specialist or accountable-human review is required. |
| `request-changes` | `DECISION_OUTCOMES[4]` | Request changes | Implementation changes are required. |
| `blocked` | `DECISION_OUTCOMES[5]` | Blocked | Stop: a critical unresolved issue prevents progress. |
| `defer` | `DECISION_OUTCOMES[6]` | Defer decision | The engineer cannot responsibly decide yet — this is not approval. |

Verified character-for-character against `lib/workspace-v2/view-model.ts`
`OUTCOME_LABEL`/`OUTCOME_MEANING` on 2026-08-02. No outcome was renamed,
simplified or reordered.

---

## 12. Verification spine

`VerificationSpine.tsx`'s `STAGE_TARGET` map now sends `"08"` to
`"human-decision"` instead of `null`. All eight stages are now semantic
`<button>`s with `aria-pressed`, the same simple-native-button pattern used
for stages 01–07. `08 Human Decision`'s button additionally carries a
`Pending` tag — non-colour, matching the existing `.spinePendingTag`
pattern — because Human Decision never completes for this canonical case:
no completion tick, no green, ever. Confirmed live:
`document.querySelectorAll('button')` includes a button whose text is
`"08Human DecisionPending"`, and clicking it opens the manual dialog.

The mobile compact bar (`NN of 08`) and its previous/next controls needed no
code change: both already iterate `WORKING_STAGE_ORDER`, which now includes
`"human-decision"` as its eighth entry.

---

## 13. Motion

`--ease: cubic-bezier(0.2, 0.8, 0.2, 1)` (unchanged token) drives one new
keyframe, `decisionEnter` (240ms, within the locked 220–280ms Human Decision
range), applied to `.decisionCard` (guided preview) and
`.decisionDialogPanel` (manual dialog) only — a small opacity +
`translateY(6px)` entrance, never a whole-page fade, never a bounce or
spring, never implying an outcome was recorded. No exit animation exists;
both surfaces are removed from the DOM immediately on close (matching the
"controlled dialog exit" permission without adding a second, separate exit
keyframe).

---

## 14. Reduced motion

Two independent layers, per `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
§8c.7, both already covering the new keyframe without new code:

1. **CSS, primary.** The existing global rule
   (`@media (prefers-reduced-motion: reduce) { .page :global(*) {
   transition-duration: 0.001ms !important; animation-duration: 0.001ms
   !important; } }`) collapses `decisionEnter` along with every other
   animation. Confirmed present in the compiled stylesheet
   (`document.styleSheets` inspection, §25).
2. **`matchMedia`/attribute, second layer.** `.stageWrap[data-reduced-motion="true"]
   .decisionCard { animation: none; }` additionally strips the guided
   preview's entrance at the class level, reusing `LiveReviewStage.tsx`'s
   existing `data-reduced-motion` attribute (unchanged from R5E.1C). The
   manual dialog's `@media (prefers-reduced-motion: reduce) {
   .decisionDialogPanel, .decisionCard { animation: none; } }` rule provides
   the same guarantee independently of the attribute, since the dialog can
   be reached without the `LiveReviewStage` guided-motion state ever being
   read.

With reduced motion, both surfaces appear immediately; all content remains
available; focus behaviour is unchanged (it does not depend on the
animation); no positional or opacity choreography is required to understand
either surface.

---

## 15. Trust boundary

Movement five, part one, replaces R5E.1C's single-paragraph `TRUST_NOTE`
with `TRUST_BOUNDARY` (`prototype-content.ts`): a headline, one supporting
sentence explicitly disclaiming that this is "not a security page," and a
five-row structured record list (`.trustRecordList`) rendered inside the
existing `#trust` section — the header's `Trust` anchor lands on this
content unchanged.

| Record | Content |
|---|---|
| Baseline | Deterministic analysis provides the recommendation, risk and requirements shown throughout. |
| Model assistance | Optional, and identified in provenance when used — the inferred error-contract evidence above, for example. |
| External writes | None. This sample never calls a model, creates a review, or writes anywhere outside this page. |
| This review | Never created or modified by anything here. PR #482 stays exactly as shown, in every state. |
| Human Decision | Belongs to the accountable engineer. No outcome is recorded in this demonstration. |

No compliance claim, no deployment option, no customer logo, no dark
background, no generic security-marketing language — each row states only
what this specific sample genuinely does or does not do.

---

## 16. Unresolved-case handoff

Movement five, part two, adds a new `#unresolved-case` section
(`UNRESOLVED_HANDOFF` in `prototype-content.ts`) between the trust boundary
and the footer: a bordered `.handoffCard` carrying the eyebrow `Still
unresolved`, the canonical repository/PR line, the headline `This case
remains open.`, one sentence of context, a compact record row restating the
four canonical values (`Tests required`, `46/100 · MEDIUM`, `4 open · 2
blocking`, `Human Decision PENDING`), and the same two genuine destinations
already used in the hero: `Open the sample review` →
`/workspace?source=fixture` and `Start a review` → `/new`. No `Contact
sales`, `Pricing`, `Sign in`, `Request demo`, `Docs` or account-creation
control exists anywhere on this page. This is deliberately not a second
centred hero: it is a left-aligned record card, visually distinct from the
hero's composition, positioned as the final operation available on this
case rather than a repeated pitch.

---

## 17. Page composition

The five movements are now all present at the private route:

| Movement | Content |
|---|---|
| 1 | Selected review — hero + live stage (`#product`, unchanged from R5E.1B) |
| 2 | Verification gap (`#how-it-works`, unchanged from R5E.1C) |
| 3 | Follow the verification record — Finding through Readiness (unchanged from R5E.1C) |
| 4 | Accountable decision — the readiness-to-decision transition narrative + the stage-08 narrative block (new) |
| 5 | Trust and continuation — the trust boundary + the unresolved-case handoff (new) |

The page still does not repeat `Eyebrow → Headline → Paragraph →
Screenshot`: the live product shell remains the principal visual system
throughout, including through the new movements — the trust boundary is a
structured record list, not prose, and the handoff is a record card, not a
screenshot.

---

## 18. Guided and manual precedence

Unchanged rule, now proven through the eighth stage too: manual visitor
intent always wins. `demoReducer`'s existing guard
(`if (event.source === "guided" && state.mode === "manual") return state;`)
requires no modification to cover `OPEN_DECISION` — it is just another
`StageEvent`. `RESUME_GUIDED` additionally closes a manually opened decision
surface first (§5a), confirmed live: after opening the manual dialog,
clicking the spine's other stage buttons is impossible while the dialog has
focus (it is contained inside the dialog), and after `Escape` or `Close`,
`Resume guided tour` remains available (mode stays `"manual"` until
explicitly resumed) and, when clicked, both restores guided mode and (if a
manual dialog were still open) closes it.

`Reset sample` (unchanged control) returns the full `DemoState` to
`INITIAL_DEMO_STATE`, including `decisionSurface: "closed"` and
`decisionSurfaceOrigin: null` — confirmed live: after opening and closing
the dialog and clicking `Reset sample`, only the PR row's
`aria-pressed="true"` remains and no `[role="dialog"]` exists.

---

## 19. Responsive behaviour

Browser-validated at all six required viewports, production build (`next
build` then `next start`), `document.documentElement.scrollWidth <=
clientWidth` confirmed at each:

| Viewport | Result |
|---|---|
| 1600×1000 | No overflow (1585×1585). |
| 1280×800 | No overflow (1265×1265). |
| 1024×768 | No overflow (1009×1009). |
| 768×1024 | No overflow (753×753). |
| 390×844 | No overflow (390×390). Manual dialog panel measured `390.4×844` — full-viewport width and height, the deliberate near-full-screen composition required for mobile. All seven outcomes, the read-only warning and the close control confirmed present and reachable inside it. |
| 320×568 | No overflow (320×320). |

The manual dialog does not shrink the desktop composition at any width; at
`max-width: 767px` it becomes `width: 100%; max-height: 100dvh; border-radius:
0` — a deliberate full-screen sheet, not a scaled-down desktop dialog.

---

## 20. Accessibility

Verified live (production build, `read_console_messages`,
`javascript_tool` DOM/ARIA inspection, `computer` keyboard actions):

- One `<main>`, one `<h1>` (`Know what is ready to merge.`), confirmed by
  count.
- `08 Human Decision` is a genuine, keyboard-reachable `<button>`; clicking
  or activating it by keyboard opens the manual dialog.
- The manual dialog: `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby`/`aria-describedby` present and pointing at real
  elements; zero `input[type=radio]`/`input[type=checkbox]` inside it; Tab
  and Shift+Tab correctly cycle within the panel (verified through all
  three real tab stops: the close icon, the browser-injected scrollable
  body, and the footer Close button); Escape closes it and restores focus
  exactly to the triggering `08 Human Decision` button
  (`document.activeElement` confirmed).
- The guided preview carries no `role`, no `aria-modal`, no keydown
  handler — confirmed by code inspection; it cannot trap focus by
  construction, independent of the `IntersectionObserver` limitation
  recorded in §7 and §25.
- `robots` meta remains `noindex, nofollow`, confirmed.
- No fake control in the accessibility tree: the outcome list uses zero
  form elements; every genuine control (spine buttons, panel actions,
  dialog close controls, footer/hero links) is a native `<button>` or
  `<a>`.
- Colour is never the sole carrier: the active spine stage keeps its
  existing border/text-colour + `aria-pressed` pattern; the Pending tag on
  stage 08 is a text label, not a colour alone.
- No motion-only meaning: reduced motion removes all animation and every
  fact remains identical (§14).
- `document.body.style.overflow` is correctly set to `"hidden"` while the
  manual dialog is open and restored to its prior value on close —
  confirmed live.

Not exercised in this environment (see §25): a live screen-reader pass,
OS-level `prefers-reduced-motion` emulation end-to-end, true 200% zoom
(unavailable in this Browser pane, the same limitation R5C–R5E.1C recorded),
and the guided `IntersectionObserver` path firing live end-to-end.

---

## 21. Progressive enhancement

`VerificationJourneyNarrative.tsx`'s new `human-decision` article is a plain
server component (no `"use client"`) carrying the full outcome list,
readiness synthesis and read-only warning — confirmed present in
server-rendered `get_page_text` output before any JavaScript interaction.
`LiveReviewStage`'s resting state (before any click) remains "queue"/Overview
exactly as R5E.1B/C left it — the Human Decision surfaces are reachable
states, not part of the initial resting markup, matching the existing,
accepted pattern for every other working-stage panel (Finding, Evidence,
etc.), none of which is part of the initial resting state either. Nothing
essential is hidden behind JavaScript: without it, the complete outcome set,
the read-only warning, the trust boundary and the unresolved-case handoff
are all present and readable in document order.

---

## 22. Performance and stability

No dependency and no lockfile change (`git diff -- package.json
package-lock.json pnpm-lock.yaml yarn.lock` empty). No `localStorage`,
`fetch`, `XMLHttpRequest`, analytics or telemetry call exists anywhere in
`app/_public-r5-recalibrated/**` — confirmed by live
`localStorage.length === 0` / `sessionStorage.length === 0` after opening and
closing both decision surfaces multiple times, and by
`read_network_requests` showing only same-origin `_next/static/**` and
page-navigation requests. One reducer, one canonical data module, one new
shared content component reused by both surfaces (`HumanDecisionSurface.tsx`)
— no duplicated Workspace tree, no second complete shell. `.claude/launch.json`
was not modified; the production build used for browser validation was run
directly via `npm run start` and accessed by URL, not through a new
launch-config entry.

---

## 23. Route and product truth

`example/b2b-redemption-api` · PR `#482` · `Add fallback handling for failed
discount-code retrieval` · `Tests required` · `46/100 · MEDIUM` · `4 open ·
2 blocking` · `PENDING` render identically across every state — including
both Human Decision surfaces — and every viewport exercised. No outcome was
ever selected, submitted or recorded in any test performed; no requirement
cleared; no recommendation or risk value changed. Nothing calls a model,
creates a review, or performs an external write — confirmed live by network
and storage inspection (§22).

---

## 24. Human review package

`R5E1D_HUMAN_REVIEW_PACKAGE/` was created untracked at the repository root,
following the R5C/R5D/R5E/R5E.1B/R5E.1C precedent. See that folder's own
`README.md` for its contents and `VALIDATION_NOTES.md` for the exact
manual/automated split.

---

## 25. Browser validation

Production build (`next build` then `next start`, accessed at
`http://localhost:3000`), Browser pane, `noindex` route.

| Check | Result |
|---|---|
| Resting state complete and truthful (`get_page_text` pre-interaction), including all seven outcomes | Pass |
| One `<main>`, one `<h1>` | Pass |
| `robots` = `noindex, nofollow` | Pass |
| All eight spine stages present as buttons; `08 Human Decision` opens the manual dialog | Pass |
| Manual dialog: `role="dialog"`, `aria-modal="true"` | Pass |
| Zero radio/checkbox controls inside the dialog | Pass |
| Tab containment (all three real tab stops, wraps correctly) | Pass |
| Escape closes; focus returns to trigger | Pass |
| `document.body.style.overflow` set/restored correctly | Pass |
| `Resume guided tour` appears after manual dialog closes, resumes guided mode | Pass |
| `Reset sample` returns to initial state, closes any open surface | Pass |
| No horizontal overflow, all six viewports | Pass |
| Manual dialog full-screen composition on mobile (390×844: panel 390.4×844) | Pass |
| All seven outcomes, warning and close control present/reachable on mobile | Pass |
| Reduced-motion CSS rule present in compiled stylesheet | Pass |
| No console error / hydration warning, any viewport or interaction | Pass |
| No broken asset | Pass (`read_network_requests` all 200 OK) |
| No external write, no model request, zero storage writes | Pass |
| Regression: `/` | Pass, no console error |
| Regression: `/visual-lab/public-r5` | Pass, no console error |
| Regression: `/workspace?source=fixture` | Pass, no console error |
| Regression: `/new` | Pass, no console error |
| Guided `IntersectionObserver`/`requestAnimationFrame` firing end-to-end | **Untested** — this session's Browser pane does not deliver `requestAnimationFrame` callbacks at all (confirmed directly: a scheduled `requestAnimationFrame` never fired after 1s, while an equivalent `setTimeout` fired reliably), the same non-compositing root cause R5C/R5D/R5E/R5E.1B/R5E.1C recorded for `IntersectionObserver`. This also means the dialog's own `requestAnimationFrame`-scheduled initial-focus call could not be observed firing live; initial focus targeting was instead confirmed by direct inspection (heading has `tabIndex={-1}` and is reachable via `.focus()`) and by the fact that the real product's own `HumanDecisionDialog.tsx` uses the identical pattern successfully in production. |
| Live screen-reader pass | **Untested** |
| OS-level `prefers-reduced-motion` emulation | **Untested** |
| True 200% zoom | **Untested** |

---

## 26. Build and repository validation

- `npx tsc --noEmit` — passes, no output.
- `npm run build` — passes; `/visual-lab/public-r5-recalibrated` generated
  as a static route alongside the unchanged existing route list.
- `git diff --check` — passes, no output.
- `git status --short` — shows only the modified files under
  `app/_public-r5-recalibrated/`, this document, the README update, one new
  file (`components/HumanDecisionSurface.tsx`), and the untracked human
  review package; nothing staged.
- `git diff` against every protected path (`package.json`, lockfiles,
  `app/page.tsx`, `app/_public-r5`, `app/visual-lab/public-r5`,
  `app/workspace`, `app/report`, `app/new`, `app/home`,
  `app/review-operations`, `app/integrations`, `app/settings`,
  `app/review-policies`, `app/team`, `app/visual-lab/workspace-r4`,
  `lib/workspace-v2`, `public/r5/scenes`, `.claude/launch.json`, and every
  R5E.1A/B/C document) — every path empty.
- `next-env.d.ts` and `tsconfig.tsbuildinfo` restored to their exact
  preflight SHA-256 hashes after validation (`tsconfig.tsbuildinfo` was
  regenerated by `tsc`/`next build` during validation, as it always is, and
  was restored via `git checkout -- tsconfig.tsbuildinfo` afterward;
  `next-env.d.ts` was never touched).
- Production server (`npm run start`) stopped; port 3000 confirmed free
  before finishing.

---

## 27. Protected scope

Unchanged, confirmed by empty `git diff`: `app/page.tsx`, `app/_public-r5`,
`app/visual-lab/public-r5` (the thin route only), `app/workspace`,
`app/report`, `app/new`, `app/home`, `app/review-operations`,
`app/integrations`, `app/settings`, `app/review-policies`, `app/team`,
`app/visual-lab/workspace-r4`, `lib/workspace-v2/**`, `public/r5/scenes`,
`package.json`, all lockfiles, `.claude/launch.json`, and every R5E.1A/B/C
document. `app/_public-r5-recalibrated` and
`app/visual-lab/public-r5-recalibrated` — the existing private
implementation — were extended, the intended, in-scope target of this
phase. The six pre-existing untracked human-review/context packages at the
repository root were not touched.

---

## 28. Known limitations

1. As recorded by R5C, R5D, R5E, R5E.1B and R5E.1C before it, this session's
   Browser pane cannot composite frames. This phase additionally confirmed
   the underlying mechanism directly: `window.requestAnimationFrame` never
   delivers a callback in this session (a bare scheduled call never fired
   within a 1-second wait), while `setTimeout` fires reliably in the same
   session — meaning `IntersectionObserver` (R5E.1C's finding) and any
   `requestAnimationFrame`-scheduled work (this phase's finding, affecting
   the manual dialog's initial-focus call) both depend on the same
   unavailable frame-compositing pipeline. The guided scroll path into
   Human Decision and the dialog's live initial-focus behaviour could
   therefore not be observed firing end-to-end in this session, and were
   instead verified by direct DOM/code inspection (§7, §25) and by focusing
   the heading manually to confirm the rest of the focus-containment chain
   (Tab/Shift+Tab/Escape/focus-restoration) works correctly once focus is
   there. Both should be confirmed in a real, compositing browser before
   formal acceptance.
2. No live screen-reader pass (NVDA/VoiceOver) was performed.
3. OS-level `prefers-reduced-motion` emulation was not available in this
   environment; the CSS rule's presence and the two-layer architecture were
   confirmed instead (§14).
4. True 200% zoom was not available in this environment.
5. The guided preview's restrained-dimming visual treatment (`.decisionScrim`)
   could not be visually screenshot-verified for the same compositing
   reason R5C onward have recorded; its structural properties (no ARIA
   role, `pointer-events: none`, correct stacking) were confirmed by code
   and DOM inspection instead.

---

## 29. Work deferred to R5E.1E

Per `R5E1A_IMPLEMENTATION_HANDOFF.md` §5: assembling the five movements
built across R5E.1B–D into one coherent, complete private laboratory —
page-level rhythm, density and visual integration across movement
boundaries; a final pass on responsive composition once all five movements
are considered together; the complete accessibility and originality-test
pass across the whole assembled page. R5E.1F reviews and freezes the
direction and decides on any production transfer; only R5E.1F may authorise
touching `app/page.tsx`.

---

## 30. Human acceptance requirements

Before this phase is considered accepted, a human reviewer should confirm,
in a real compositing browser:

1. The guided scroll into Human Decision actually fires and the non-modal
   preview appears as a restrained, dimmed layer above the live stage —
   not a jarring or modal-feeling interruption (untestable in this
   session's Browser pane, §28.1).
2. The manual dialog's entrance and the guided preview's entrance feel like
   opening a consequential surface, not a generic web modal.
3. The seven outcomes read as genuine, distinct product outcomes at normal
   reading distance — not as a marketing feature list.
4. The trust boundary reads as compact and honest, not as another
   documentation section.
5. The unresolved-case handoff feels like the next operation in the case,
   not a repeated hero.
6. Reduced-motion and keyboard behaviour are confirmed with real OS-level
   settings and, ideally, a real screen reader.

The R5E.1D human review package remains local and untracked at
`R5E1D_HUMAN_REVIEW_PACKAGE/`.

R5E.1D implementation is complete and ready for human review. It is not
self-accepting: formal acceptance follows the same human review process as
R5C/R5D/R5E/R5E.1B/R5E.1C.

## Human visual acceptance and closeout

R5E.1D received human visual acceptance on 3 August 2026.

A genuine desktop walkthrough demonstrated:

1. Readiness progressing into the guided Human Decision preview.
2. The manually activated read-only Human Decision dialog.
3. All seven genuine outcomes remaining visible and unselected.
4. The canonical PR #482 context remaining unchanged.
5. The compact trust boundary.
6. The unresolved-case handoff and its genuine next actions.

The review confirmed:

1. Human Decision is the natural climax of the verification journey.
2. The guided preview remains non-modal and does not imply that a decision has been recorded.
3. Manual activation presents a distinct read-only Human Decision surface.
4. All outcomes remain non-interactive and unselected.
5. Recommendation, risk, requirement counts and Human Decision status remain unchanged.
6. The public sample provides no submission or external-write path.
7. The trust boundary remains concise, truthful and visually integrated with the white public canvas.
8. The final handoff continues the same unresolved review rather than repeating the hero.
9. The full public narrative now extends from selected review through accountable engineering judgment.

A focused post-review correction separated the guided-preview label from the manually opened dialog label:

- Guided preview: `Guided preview � scroll to continue, or open it directly`
- Manual dialog: `Read-only Human Decision`

The trust heading was also corrected to:

`What this sample does and does not do.`

The primary evidence remains stored locally in the untracked R5E.1D human review package.

R5E.1D is accepted and closed.
