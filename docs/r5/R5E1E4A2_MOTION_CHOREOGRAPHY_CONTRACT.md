# R5E.1E.4A.2 — Premium Motion and Scene Choreography Contract

Motion and temporal choreography only. No motion or interaction was
implemented; no application code, CSS, canonical product data or dependency was
created or modified in this phase.

> **Amendment 1 — accessibility correction, documentation only.**
> The first issue of this contract permitted choreographed text to begin at an
> `opacity: 0.72` baseline. That could take existing secondary text to
> ≈ 2.94 : 1 — below WCAG AA — during choreography, which is not an acceptable
> implementation target. The baseline-visibility policy, the opacity rule, the
> motion vocabulary's permitted properties, all four scene contracts, the
> reduced-motion and no-JavaScript clarifications, the Phase 7.1 surface handoff
> and the failure conditions are corrected accordingly (§13, §6, §14–§17, §24a,
> §25b, §26a, §32b). **Every duration, delay, easing value, distance, sequence
> order, total sequence time, activation rule, manual-intent rule, responsive
> timing and implementation sequence is unchanged.** The superseded reasoning is
> preserved in §13d so it cannot be reintroduced.

Companion documents (unchanged authority):
[`R5E1E4A_PREMIUM_INTERACTION_ARCHITECTURE_CONTRACT.md`](./R5E1E4A_PREMIUM_INTERACTION_ARCHITECTURE_CONTRACT.md),
[`R5E1E3_RESPONSIVE_VISUAL_REVIEW.md`](./R5E1E3_RESPONSIVE_VISUAL_REVIEW.md),
[`R5E1E2D_REFERENCE_FIDELITY_IMPLEMENTATION.md`](./R5E1E2D_REFERENCE_FIDELITY_IMPLEMENTATION.md),
[`R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md`](./R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md),
[`R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md).

---

## 1. Purpose

R5E.1E.4A locked *what* becomes inspectable, *who* owns each state and *what
may never change*. It deliberately specified no duration, no easing and no
sequence, and handed those to this phase.

This document locks them: the motion thesis, the exact automatic narrative for
each of the four product scenes, element-level sequence order, exact durations
and pauses, easing, scene activation, settled states, manual interruption,
offscreen behaviour, replay and reset rules, reduced-motion and no-JavaScript
equivalents, responsive timing, layout stability, motion accessibility,
performance boundaries, reusable motion tokens, and the Phase 7B/7C/7D handoffs.

It does not reopen the interaction architecture. Where the two could be read as
disagreeing, R5E.1E.4A wins on state, controls, manual intent, accessibility and
product truth.

## 2. Evidence reuse

**MOTION EVIDENCE REUSE GATE: PASSED.** The Cursor recording was not
re-extracted or reanalysed. Existing evidence — 216 files across
`R5E1E4A_CURSOR_INTERACTION_ANALYSIS/` and
`R5E1E4A_INTERACTION_ARCHITECTURE_PACKAGE/` — was located and inspected, and
frame-level observations specific to *motion* were newly drawn from the frames
already on disk. Full record:
untracked `R5E1E4A2_MOTION_CHOREOGRAPHY_PACKAGE/EVIDENCE_REUSE_CONFIRMATION.md`.

Five new motion observations do real work in this contract:

| # | Observation | Frame | Rule it justifies |
|---|---|---|---|
| 1 | The scene is structurally complete at first paint; the first local change comes ≈ 1 s later | `dense/d01` cells 2–6 | Baseline visibility (§13); the 760 ms pre-roll |
| 2 | Inter-step gaps span ≈ 0.5 s to ≈ 4 s | `dense/d01`, `dense/d04` | The 760 / 980 / 1,220 ms reading pauses (§7) |
| 3 | Long quiet holds of 2–3 s are normal and read as premium | `dense/d04` row 1 | Few steps, generous pauses; no busyness |
| 4 | Emphasis is done with **surface fills**, never opacity fades from nothing | `crops/recordlist_46.0s.jpg`, `d01` rows 1 and 5 | Status emphasis is a container surface/border change that never touches the value itself (§6) |
| 5 | Translation inside a scene is effectively zero; change is replacement, highlight, or accumulation inside a fixed region | `d04` rows 4–5 | 8 px enter, 4 px panel — restrained, never a slide (§7) |

Two facts about the accepted implementation were read directly from the
stylesheet and must be confronted rather than discovered later:

- **The accepted sequence runs ≈ 960 ms end to end** (steps at 0 / 180 / 360 /
  540 ms delay, each 420 ms). This phase directs a 4–7 s narrative. That is a
  deliberate change of character, justified in §7d.
- **The accepted pre-state starts choreographed content at `opacity: 0`**,
  including — in the Readiness scene — the blocking/missing/stale tags, the
  Human Decision block and the outcome list. That conflicts with this phase's
  requirement that no essential value begin at zero opacity. §13 resolves it.

## 3. Accepted interaction baseline

Unchanged and not reopened:

1. Three interactive scenes — Hero (`overview`/`finding`/`readiness`), Finding
   and Evidence (`ev_retry_path`/`ev_no_idempotency_key`), Readiness
   (`readiness`/`decision-boundary`). Missing Proof is choreography-only.
2. Defaults: `overview`, `ev_retry_path`, `readiness`.
3. One grammar — tabs and tab panels, two orientations, automatic activation,
   roving tabindex.
4. Every canonical product value lives in **persistent scene chrome, outside
   every panel**.
5. Manual intent always wins; manual state persists for the page lifetime and
   resets only on reload or a new route visit.
6. All panels of a scene share one CSS grid cell; scene height cannot change.
7. No live region anywhere.
8. Server emits no control; the control row is a plain text panel label.
9. Three primitives; five client components on the route maximum.
10. Existing motion controller: `SceneMotion`, one-shot `IntersectionObserver`,
    `threshold: 0`, `rootMargin: "0px 0px -22% 0px"`, fires once, disconnects.

## 4. Motion thesis

> Motion explains product relationships over time without changing product
> truth, changing active interaction state, or turning the homepage into an
> autonomous application.

The scene frame remains stable. Motion occurs within local regions.

**Motion may:** direct attention; establish reading order; foreground an
existing record; reveal an existing relationship; emphasise existing provenance;
clarify consequence; settle into a truthful canonical state.

**Motion may not:** switch an active tab automatically; select a different
evidence record automatically; switch Readiness to Decision boundary
automatically; create a finding; create evidence; change recommendation; change
risk; clear a requirement; select a Human Decision outcome; simulate analysis;
simulate loading; imply repository activity; loop indefinitely; depend on
precise page-scroll progress; control another scene; move browser focus; scroll
the page; change scene height.

**The visitor controls inspection state. Automatic choreography controls
emphasis only.**

## 5. Stable frame principle

Locked, per Cursor evidence 1, 4 and 5:

| # | Rule |
|---|---|
| 1 | Product-scene outer dimensions remain fixed |
| 2 | Presentation-plate dimensions remain fixed |
| 3 | Scene chrome remains fixed |
| 4 | Persistent canonical facts remain fixed |
| 5 | Control rows remain fixed |
| 6 | Panels occupy a stable shared layout region |
| 7 | Movement is region-local |
| 8 | No whole-scene replacement |
| 9 | No entire-scene fade-out |
| 10 | No scene-scale animation |
| 11 | No animated height |
| 12 | No internal scrollbar |
| 13 | No pinned public scene |
| 14 | No narrative passing behind product |

### 5a. Element classification per scene

Four classes. **Persistent** = always present and fully visible, never
choreographed. **Choreographed** = participates in the automatic introduction.
**Manually controlled** = changes only on visitor selection. **Static** = never
changes by any means.

| Scene | Persistent | Choreographed | Manually controlled | Static |
|---|---|---|---|---|
| **Hero** | Chrome bar; review-context aside; title; branch/head; the four canonical facts; control row | Overview panel: next inspection · reviewer focus · evidence boundary | Which of the three panels is active | Plate; frame; aside's two inert queue rows |
| **Finding and Evidence** | Finding head (tags, title, statement, source); control row | Edge label and rule; both record cards; the active-record emphasis; trace panel | Which record is focused; which trace panel is shown | Plate; frame; finding head content |
| **Missing Proof** | — | Missing-proof record; edge rule and `Leaves open`; requirement card; unresolved bar | *nothing — no controls exist* | Plate; frame; chrome bar |
| **Readiness** | Chrome bar; the three facts; `PENDING`; the seven outcomes; outcomes note; control row | Blocking/missing/stale tags; change note; the `PENDING` block's container emphasis; the outcomes container settle | Which of the two panels is active | Plate; frame; the seven outcome chips themselves |

Note the Readiness rows carefully: `PENDING` and the seven outcomes are
**persistent** — their own opacity, colour and position never change. What is
choreographed is the *container* around them (§6, Status emphasis).

## 6. Motion vocabulary

Eight items. Every one is reusable across scenes and future routes; none is
scene-specific.

| # | Item | Duration | Easing | Properties | Max translate | Text opacity | Auto | Manual |
|---|---|---|---|---|---|---|---|---|
| 1 | **Scene readiness** | 420 ms | standard | container `background-color`, container `border-color`, `transform: translateY` | 8 px Y (4 px ≤767) | **1 throughout** | ✓ | — |
| 2 | **Local reveal** | 300 ms | standard | container `background-color`, container `border-color`, `transform: translateY` | 8 px Y (4 px ≤767) | **1 throughout** | ✓ | — |
| 3 | **Selection acknowledgement** | 140 ms | selection | `background-color`, `border-color`, `font-weight` (discrete) | none | **1 throughout** | — | ✓ |
| 4 | **Panel transition** | 260 ms | panel | `transform: translateY` | 4 px Y (2 px ≤767) | **1 throughout** | — | ✓ |
| 5 | **Record emphasis** | 380 ms | standard | `background-color`, `border-color`, `transform: scaleY` on a leading rule, `font-weight` (discrete) | 0 | **1 throughout** | ✓ | — |
| 6 | **Relationship trace** | 380 ms | standard | `transform: scaleX` and `opacity` **on the decorative rule only**; `transform: translateY` on its label | none | **1 throughout** — label never fades | ✓ | — |
| 7 | **Status emphasis** | 380 ms | standard | `border-color`, `background-color` — **of a container, never of the value** | none | **1 throughout** | ✓ | — |
| 8 | **Settling** | 0 ms | — | state only | — | **1 throughout** | ✓ | ✓ |

**No vocabulary item animates the opacity of meaningful text, or of any element
that contains meaningful text.** Durations, easings, distances and step order are
unchanged from the values originally locked; only the permitted-property
definitions are corrected (§13a).

### 6a. Per-item notes

**Scene readiness** is a state transition, not a scene-scale animation. Its
420 ms applies to the scene's *first* choreographed region, which is the only
thing that visually marks readiness. It preserves the accepted `--dur: 420ms`.
Its region's text is fully readable before, during and after it runs; what
changes is the region's container and its 8 px settle.

**Local reveal** does not reveal text. Its region's text is present at full
opacity from first paint; the reveal is the container's `background-color` and
`border-color` arriving, together with a restrained 8 px settle. "Reveal" names
what the visitor's attention does, not what becomes visible.

**Selection acknowledgement** animates no layout property and no opacity. It is
a surface, border and weight change on the control, exactly as Cursor's active
record reads (evidence 4). `font-weight` is discrete and does not tween; it
simply applies at selection.

**Panel transition** carries no fade. The incoming panel is at full opacity from
the moment it becomes visible; the transition is a 4 px settle. This is stricter
than a cross-fade and also more legible: there is no moment at which the panel's
text is harder to read than at rest.

**Record emphasis** is the automatic equivalent of selection acknowledgement,
applied to the already-default record. It uses the same visual cues so that the
automatic default and a manual selection look identical — the visitor must never
be able to tell whether the current focus was chosen by them or was the default.
**The inactive record is never dimmed**; it remains fully readable and gains its
own quiet border cue.

**Relationship trace** animates the decorative `aria-hidden` rule only. Its label
never fades — it is meaningful text, present and readable from first paint, and
it may receive the 8 px settle but no opacity change.

**Status emphasis** never touches the value. It changes only the container's
`border-color` and `background-color`, from `--pub-border-subtle` /
transparent to `--pub-border` / `--pub-surface-2`. This is how §5's "persistent
canonical facts remain fixed" and §15's "PENDING receives restrained emphasis"
are both literally true.

**Settling** has zero duration because it is a state, not an effect: the scene
is settled when its last step's transition has completed. Every meaningful text
element is fully readable both before and after settling.

### 6b. Reduced-motion equivalents

| Item | Under `prefers-reduced-motion: reduce` |
|---|---|
| Scene readiness | Does not run. Final state at first paint. |
| Local reveal | Does not run. Final state at first paint. |
| Selection acknowledgement | **Still applies**, instantly (≤ 1 ms). The state change is not motion. |
| Panel transition | Instant swap. No transform tween. Text was already at full opacity, so nothing about legibility changes. |
| Record emphasis | Final state at first paint. |
| Relationship trace | Final state at first paint — rule at full `scaleX`. |
| Status emphasis | Final state at first paint. |
| Settling | Immediate, at first paint. |

### 6c. Responsive adaptation

Distances halve at ≤ 767 px (8 → 4 px enter, 4 → 2 px panel). Durations are
unchanged at every viewport — they are perceptual constants. Reading pauses
scale by 0.75 at ≤ 767 px (§17).

### 6d. Prohibited variants

Spring motion; bounce; elastic easing; fake typing; blinking cursors;
indefinite pulsing; glowing; animated gradients; parallax; zooming the full
interface; blur-heavy transitions; dramatic 3D transforms; autonomous
carousels; whole-scene crossfades; and any motion whose purpose is only
spectacle.

Also prohibited, specific to this design: animating a canonical value's own
opacity, colour or position; **animating the opacity of any meaningful text, or
of any element that contains meaningful text**; animating any layout-affecting
property; `transition: all`; and staggering the individual lines of a single
canonical list.

## 7. Exact timing system

### 7a. Durations

| Token | Value | Brief's band | Purpose |
|---|---|---|---|
| `--motion-duration-immediate` | **90 ms** | — | Hover tone changes only |
| `--motion-duration-selection` | **140 ms** | 120–180 | Selection acknowledgement |
| `--motion-duration-panel` | **260 ms** | 220–320 | Panel transition |
| `--motion-duration-reveal` | **300 ms** | 240–360 | Local reveal |
| `--motion-duration-relationship` | **380 ms** | 300–450 | Relationship trace, record emphasis, status emphasis |
| `--motion-duration-scene-ready` | **420 ms** | 350–500 | Scene readiness |

`140 ms` sits low in its band because acknowledgement must feel instant;
`260 ms` sits low in its band because a panel swap must survive rapid keyboard
arrowing without feeling sludgy; `380 ms` and `420 ms` sit mid-band because they
carry meaning rather than response. `420 ms` is also exactly the accepted
`--dur`, so the scene's most prominent single reveal keeps its accepted feel.

### 7b. Reading pauses

| Token | Value | Used when |
|---|---|---|
| `--motion-delay-reading-short` | **760 ms** | Pre-roll after activation; after a short label or an emphasis-only step |
| `--motion-delay-reading-standard` | **980 ms** | After one sentence |
| `--motion-delay-reading-long` | **1220 ms** | After a multi-line group or two records |

Derived two ways and cross-checked. **From evidence:** Cursor's observed
inter-step gaps span ≈ 0.5 s to ≈ 4 s, with within-panel steps at ≈ 0.5–1.5 s
(`d04` rows 4–5). **From budget:** a bounded three-or-four-step narrative in a
4–6 s envelope forces pauses near 1 s. The three values bracket that point and
all sit inside the 700–1,300 ms band the brief sets.

The 760 ms **pre-roll** before every scene's first step is directly evidenced:
Cursor paints at t ≈ 1.5 s and makes its first in-scene change at t ≈ 2.5 s
(`d01`). The pre-roll separates "the page arrived" from "the scene is explaining
itself".

### 7c. Total sequence times

| Scene | Desktop / laptop / tablet | Mobile ≤ 767 px | Brief's target | Steps |
|---|---|---|---|---|
| Hero | **4,300 ms** | 3,500 ms | 4–6 s | 3 |
| Finding and Evidence | **4,860 ms** | 3,985 ms | 4–5.5 s | 4 |
| Missing Proof and Requirement | **4,820 ms** | 4,005 ms | 4–5 s | 4 |
| Readiness and Human Decision | **5,420 ms** | 4,435 ms | 5–6.5 s | 4 |

All four land inside their bands.

### 7d. Why the narrative lengthens from ≈ 960 ms to 4.3–5.4 s

Stated plainly because it is the largest change this phase makes.

The accepted implementation is a **stagger**: four steps 180 ms apart, complete
in under a second. It reads as one reveal with texture. This phase's brief
directs a **narrative**: ordered steps separated by reading pauses, in which each
step is registered before the next begins.

That is a change of character, not a refinement, and it is the brief's decision,
not an inference. It is also better supported by the evidence: Cursor's steps
are seconds apart, never milliseconds, and its long quiet holds are what make
the scenes read as considered rather than animated.

The risk it introduces — that a fast-scrolling visitor sees an incomplete scene
— is eliminated structurally by §11: sequences run to completion offscreen and
never restart, so no visitor can ever encounter a half-revealed scene.

## 8. Exact easing system

Three curves. No scene defines its own.

| Token | Value | Used for | Why |
|---|---|---|---|
| `--motion-ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Scene readiness, local reveal, record emphasis, relationship trace, status emphasis | The accepted route easing, unchanged. Fast out, long settle, no overshoot (both control points ≤ 1). Reads precise rather than playful. |
| `--motion-ease-panel` | `cubic-bezier(0.4, 0, 0.2, 1)` | Panel transition | A panel swap is a replacement, not an arrival. A gentler start avoids the "flick" the enter curve would give a 260 ms change. No overshoot. |
| `--motion-ease-selection` | `cubic-bezier(0, 0, 0.2, 1)` | Selection acknowledgement | Begins at full speed, so a 140 ms response feels immediate. Equivalent to `ease-out`. No overshoot. |

None of the three overshoots, so none can produce bounce, elastic or spring
behaviour. All three are reusable on any future public route.

## 9. Movement distances and opacity

| Token | Desktop / laptop / tablet | Mobile ≤ 767 px | Applies to |
|---|---|---|---|
| `--motion-distance-enter` | **8 px** translateY | **4 px** | Scene readiness, local reveal, relationship-trace label |
| `--motion-distance-panel` | **4 px** translateY | **2 px** | Panel transition |
| `--motion-opacity-decorative-quiet` | **0** | 0 | **Decorative, non-text elements only** (§13c) |

8 px is the accepted implementation's value and is kept deliberately: Cursor's
in-scene translation is effectively zero (evidence 5), so 8 px is already at the
restrained end, and changing an accepted, human-reviewed value without cause
would be churn. It halves at ≤ 767 px because the same absolute distance reads
larger relative to a narrower element.

**No element moves more than 8 px, in any direction, in any state, at any
viewport.** Nothing moves horizontally.

`--motion-opacity-decorative-quiet` is deliberately named for its only permitted
use. It may be applied **only** to decorative, non-text elements — never to
meaningful text, and never to any element that is an ancestor of meaningful
text. Its value is `0` because a decorative element that begins quiet rather
than absent needs no token: it simply renders at its own settled colour. The
locked choreography currently has **zero uses** of it — the one decorative
element, the relationship rule, animates `transform: scaleX` instead. It exists
so that any future decorative fade has a sanctioned value and cannot reach for an
ad-hoc one.

**There is no general-purpose quiet-opacity token, and none may be
reintroduced.** See §13d.

## 10. Scene activation

The accepted observer configuration is **preserved unchanged**:

```
threshold:   0
rootMargin:  0px 0px -22% 0px
```

R5E.1E.2D derived `-22%` from a full-resolution frame pair proving the previous
fixed `-80px` fired while a scene was still ≈ 82 % below the fold, and
R5E.1E.3 re-verified it at every viewport including 320 px. No evidence in this
phase contradicts it, and a percentage margin scales with viewport height, which
is what a 4–5 s narrative needs. It is not reopened.

| Question | Lock |
|---|---|
| What qualifies as meaningful entry | Any intersection once the scene's top has entered the lower ≈ 78 % of the viewport |
| Activation frequency | **Once.** The observer disconnects on first fire. |
| Continues after leaving the viewport | **Yes** — runs to completion offscreen |
| Pauses offscreen | **No** |
| Restarts after re-entry | **Never** |
| Rapid scrolling | Sequence starts on entry and completes regardless of scroll speed; the visitor returns to a settled scene |
| Tab becomes hidden | Nothing special happens (§11) |
| Back-forward cache restore | Nothing to do — the DOM is restored already settled |
| Viewport resize | Nothing to do — no measurement, no layout-keyed timer |
| Reduced-motion preference changes | The existing `@media (prefers-reduced-motion: reduce)` block forces the final state live |

No global observer is added. No continuous scroll listener is added. No second
observer is added.

## 11. Offscreen, hidden-tab and interruption safety

The whole introduction is driven by **CSS `transition-delay`**, not by
JavaScript timers (§21). One class flip on the scene arms every step at its own
delay. This makes the eight required behaviours fall out without any lifecycle
machinery:

| Situation | Behaviour | Why nothing is needed |
|---|---|---|
| Activated, then rapidly scrolled away | Completes offscreen; settled on return | CSS transitions are not scroll-dependent |
| Activated, then tab hidden | Completes; settled on return | CSS transitions are not suspended the way `setTimeout` is throttled |
| Activated, then viewport resized | Unaffected | No measurement, no layout-keyed value |
| Activated, then reduced motion becomes active | Snaps to final state | The media block carries `!important` final values |
| Manual interaction halfway through | Scene settles at once (§12) | One attribute change removes all pending delays |
| Back-forward cache restore | Already settled | DOM state is restored intact |
| Route navigation away and back | Fresh document, fresh introduction | Matches the interaction contract's reset rule |
| Hydration completes after the scene is visible | No flash | `SceneMotion` arms in `useLayoutEffect`, before paint, and arming changes no text opacity at all |

The single JavaScript timer per scene — the one that marks
`introductionComplete` — may fire late in a hidden tab because background
`setTimeout` is throttled. **This is harmless by design:** the CSS has already
settled, and any manual interaction sets `introductionComplete` immediately
regardless. No `visibilitychange` handler is required, and none may be added.

The scene may never remain partially hidden, permanently muted, between panels,
missing canonical truth, or dependent on a timer that no longer runs. Each is
structurally impossible under this model.

## 12. Manual interruption

Interruption behaviour, exact:

| # | Effect | Timing |
|---|---|---|
| 1 | `authority` becomes `"manual"` | 0 ms — synchronous with the event |
| 2 | Every pending automatic step is cancelled | 0 ms — the scene's `data-motion` becomes `"settled"`, which sets `transition-delay: 0ms` on all steps |
| 3 | `introductionComplete` becomes `true` | 0 ms; the pending timer is cleared |
| 4 | All persistent regions settle into their canonical final presentation | Steps already complete stay complete; pending steps transition over **300 ms** (`--motion-duration-reveal`) |
| 5 | The selected control is acknowledged | **140 ms**, beginning at 0 ms |
| 6 | The content panel transitions to the manually selected state | **260 ms**, beginning at 0 ms |
| 7 | Automatic choreography does not resume | permanent |
| 8 | The selected manual state persists while scrolling | page lifetime |
| 9 | Focus does not move | — |
| 10 | The page does not scroll | — |
| 11 | Other scenes are untouched | — |

Effects 4, 5 and 6 run **concurrently**, all beginning at the moment of
selection. The scene is fully settled at **300 ms** after interruption, worst
case. Nothing is queued and nothing waits.

### 12a. Selecting the already-active state

**Locked: a genuine activation of the already-active control claims manual
authority.**

It sets `authority: "manual"`, cancels pending automatic steps and marks
`introductionComplete`. The panel does not change, and no panel transition runs
— there is nothing to transition to. The control still receives its 140 ms
acknowledgement.

The reason: activating the current control expresses intent to inspect that
state. A visitor who clicks "Overview" while Overview is showing has told the
page they are reading Overview, and the page should stop moving underneath them.
Treating that as a no-op would leave the introduction running against explicit
intent.

## 13. First-paint, hydration and baseline visibility

> **Amended.** This section was corrected after the contract was first issued.
> The superseded policy is recorded in §13d as rejected reasoning so it cannot
> be reintroduced by accident.

### 13a. Governing principle

> **Canonical and supporting textual content remains fully readable throughout
> the complete scene lifecycle.**

Automatic choreography directs attention through:

1. container background
2. container border
3. a decorative rule
4. selected or active treatment
5. restrained local translation
6. text weight, where semantically and visually appropriate
7. relationship-line appearance
8. adjacent status-surface emphasis

**It must never rely on reducing meaningful text opacity below an accessible
contrast threshold — and, in this contract, it never reduces meaningful text
opacity at all.**

### 13b. The corrected three-class baseline visibility policy

| Class | What | Baseline | May begin absent? |
|---|---|---|---|
| **A — Persistent canonical content** | Every value in the interaction contract's product-truth table; all persistent scene chrome; the finding head; `PENDING`; the seven outcomes; every control | **Fully visible from first paint at full accepted text contrast. No opacity choreography. No positional choreography.** May receive container-level emphasis around it. | **Never** |
| **B — Choreographed meaningful content** | The regions listed as *Choreographed* in §5a | **Present and readable from first paint. Meaningful text at opacity 1 throughout.** Choreography alters the surrounding container, border, rule, local translation or text weight. | **Never** |
| **C — Purely decorative content** | `.relationEdgeRule` only — an `aria-hidden` hairline | **`scaleX(0)`** → `scaleX(1)`, and/or opacity from `--motion-opacity-decorative-quiet` | **Yes** |

**Class A — full rules.** Fully visible from first paint; full accepted text
contrast; no opacity choreography; no positional choreography; may receive
container-level emphasis around it; includes all canonical values and persistent
public-scene facts.

**Class B — full rules.** Present and readable from first paint. Meaningful text
remains at full opacity. Text colour must preserve at least **4.5 : 1 for
normal-size text** and **3 : 1 for qualifying large text**. Choreography may
alter the surrounding container, border, rule, local translation or text weight.
Text may not begin hidden. Text may not transition through a sub-AA state. No
essential meaning depends on the visual emphasis.

**Class C — full rules.** May begin visually absent. Must be marked or treated as
decorative. Must not contain product truth. Must not contain meaningful text.
Must not be required to understand a relationship. Its textual equivalent must
already exist in structure or copy.

`.relationEdgeRule` satisfies every Class C rule: it is `aria-hidden`, contains
no text, and always sits beside `Leaves open` or `Supported by 2 canonical
evidence records` — meaningful text that is itself Class A or B and readable
from first paint.

### 13c. The opacity rule

| # | Rule |
|---|---|
| 1 | `--motion-opacity-decorative-quiet` must not apply to meaningful text. |
| 2 | It may apply only to: (a) decorative, non-text elements; (b) non-essential relationship traces; (c) surfaces whose child text remains independently fully opaque — which, because CSS parent opacity composites onto descendants, means a **sibling or background layer**, never an ancestor. |
| 3 | Applying opacity to a parent containing meaningful text is forbidden when it reduces the child text's contrast. |
| 4 | Container emphasis must use explicit `background-color`, `border-color` and rule properties — **never parent opacity**. |
| 5 | No implementation may use `opacity` on an entire record or panel when that record or panel contains meaningful copy. |
| 6 | If an approved future surface changes the contrast calculation, **the surface or the text treatment changes. The accessibility requirement does not.** |

### 13d. Rejected reasoning — the superseded 0.72 quiet baseline

Recorded so it is not re-proposed.

The first issue of this contract set Class B to an `opacity: 0.72` baseline,
justified by the observation that `--pub-text` (`#181818`) composited at 0.72
over white gives ≈ 7.04 : 1.

**Rejected.** The same treatment reduced `--pub-text-2` (`#6e6e6a`) to
≈ **2.94 : 1** — below WCAG AA — for the duration of the quiet phase. Meaningful
text must not pass through a sub-AA contrast state merely to create visual
emphasis, however briefly, and "it is better than the `opacity: 0` it replaced"
is not a sufficient standard for an implementation target.

The corrected policy achieves the same emphasis with container background,
border and a restrained settle, and costs nothing: **every text token actually
used by the route is already above AA at full opacity**, so Class B is
satisfiable with the existing palette and no colour change.

| Token | Settled contrast on `#ffffff` | Status |
|---|---|---|
| `--pub-text` `#181818` | ≈ 17.75 : 1 | AAA |
| `--pub-text-2` `#6e6e6a` | ≈ 5.10 : 1 | AA |
| `--pub-text-3` `#8a8a85` | ≈ 3.45 : 1 | **Declared but never used** in the route stylesheet — verified directly. No text renders at this value. |

### 13e. The six hydration guarantees

| Requirement | How it is met |
|---|---|
| No canonical truth hidden at server render | Class A **and** Class B text are `opacity: 1` in the served HTML; only container states and a transform are applied by arming, which requires JavaScript |
| No flash from complete to incomplete | `SceneMotion` arms in `useLayoutEffect`, before the browser paints. No text opacity changes at any point, so there is nothing that could flash. |
| No layout shift | Only `transform` and container colours animate, on boxes already laid out |
| No non-working controls before enhancement | The server emits no control; the control row is a plain text panel label |
| No hydration mismatch | The first client render is identical to the server render; arming is a post-render attribute change |
| No disappear-and-rebuild | Nothing is removed from or added to the DOM at any point in any sequence |

## 14. Hero choreography

Active state remains `overview` for the entire introduction. Nothing switches to
Finding or Readiness.

**Persistent and static throughout:** repository; PR number; title; branch and
head; selected-review context including both inert queue rows; recommendation;
risk; requirements; `Human Decision PENDING`; the view control row.

### 14a. Sequence

| Step | Start | Duration | End | Pause before | Region | Vocabulary |
|---|---|---|---|---|---|---|
| — | 0 | — | — | — | activation | — |
| **H1** | 760 ms | 420 ms | 1,180 ms | 760 (short, pre-roll) | Overview panel — `Next inspection` and its value | Scene readiness |
| **H2** | 2,400 ms | 300 ms | 2,700 ms | 1,220 (long) | Reviewer focus — all three lines as **one group** | Local reveal |
| **H3** | 3,920 ms | 380 ms | 4,300 ms | 1,220 (long) | Evidence boundary line | Status emphasis |

**Total 4,300 ms.**

### 14b. Per-step detail

| Property | H1 | H2 | H3 |
|---|---|---|---|
| Text opacity | **1 throughout** | **1 throughout** | **1 throughout** |
| Permitted properties | container `background-color`, container `border-color`, `transform: translateY` | container `background-color`, container `border-color`, `transform: translateY` | `border-color`, `background-color` on the boundary line's container |
| Start state | text readable, container `--pub-border-subtle` / transparent, +8 px | same | `--pub-border-subtle`, transparent |
| Final state | container `--pub-border` / `--pub-surface-2`, no transform | same | `--pub-border` / `--pub-surface-2` |
| Skipped under reduced motion | Yes — final state at first paint | Yes | Yes |
| Cancelled by manual interaction | Yes — settles over 300 ms | Yes | Yes |
| Mobile | start 570, dur 420, end 990 | start 1,905, dur 300, end 2,205 | start 3,120, dur 380, end 3,500 |
| No-JavaScript equivalent | Rendered at final state | Rendered at final state | Rendered at final state |

The three reviewer-focus lines reveal as **one group**. Staggering three lines
of a single canonical list would be animating values independently, which §14
of the brief forbids.

**Text readability, explicitly (§13a):** the `Next inspection` text, all three
reviewer-focus lines and the evidence-boundary copy are fully readable at first
paint and remain so throughout. Choreography uses the surrounding rule, border,
background and a restrained 8 px settle. None of them fades.

### 14c. What the sequence communicates

Items 1 and 2 of the brief's list — that a selected review is already
established, and that it has a clear readiness state — are communicated by
**first paint**, not by a step, because both are persistent chrome. This is why
the Hero has three steps and not five: every canonical fact is already visible,
which is a stronger guarantee than revealing it.

### 14d. Canonical settled Hero state

`active: "overview"`; H1–H3 complete; persistent chrome, title, branch/head and
all four canonical facts fully visible; the Overview panel's three groups at
full emphasis; the control row available and unmoved.

### 14e. The Hero must not

Simulate opening a review; simulate analysis; switch queue records; change tabs
automatically; rebuild the product frame; animate every visible value
independently; become visually busy.

## 15. Finding and Evidence choreography

Active record remains `ev_retry_path` for the entire introduction.
`ev_no_idempotency_key` is never selected automatically.

**Persistent and static throughout:** finding identity; finding title; severity,
category and provenance tags; the finding statement and source; the Evidence
control row.

### 15a. Sequence

| Step | Start | Duration | End | Pause before | Region | Vocabulary |
|---|---|---|---|---|---|---|
| — | 0 | — | — | — | activation | — |
| **E1** | 760 ms | 380 ms | 1,140 ms | 760 (short, pre-roll) | Edge rule + `Supported by 2 canonical evidence records` | Relationship trace |
| **E2** | 1,900 ms | 300 ms | 2,200 ms | 760 (short) | **Both** record cards, as one group | Local reveal |
| **E3** | 3,420 ms | 380 ms | 3,800 ms | 1,220 (long) | `ev_retry_path` active treatment **and** `ev_no_idempotency_key` quiet affordance cue, in the same step | Record emphasis |
| **E4** | 4,560 ms | 300 ms | 4,860 ms | 760 (short) | Trace panel — Provenance · Source · Supports | Local reveal |

**Total 4,860 ms.**

### 15b. Why E3 is one step, not two

Foregrounding the two records in sequence would give the second record narrative
weight equal to the first, which contradicts the locked interaction state in
which exactly one record is active. In E3 the active record receives its full
selected treatment — filled `--pub-selected` surface, `--pub-border` outline,
3 px leading rule, title weight 550 — while the second record simultaneously
receives only a **quiet affordance cue**: its border steps from
`--pub-border-subtle` to `--pub-border`. That says *available*, not *equal*.

The active treatment is visually identical to what a manual selection produces,
so the visitor cannot tell whether the current focus was theirs or the default.

**The inactive record is never dimmed.** Its title, statement, status,
provenance and source remain fully readable at every moment, at full opacity.
The distinction between active and available is carried entirely by surface and
border, never by making one record harder to read than the other.

**Text readability, explicitly (§13a):** the finding text, both evidence-record
titles and all their metadata, and the trace panel's provenance and source text
are fully readable at first paint and remain so throughout. The active record
gains **container** treatment rather than gaining opacity from an inaccessible
baseline. Only the decorative relationship rule may begin absent.

### 15c. Locked states

| | State |
|---|---|
| Canonical initial | `active: "ev_retry_path"`; finding head at full emphasis; edge label, both records and the trace panel **fully readable at opacity 1**, their containers at `--pub-border-subtle` / transparent and offset +8 px; edge rule at `scaleX(0)` |
| Canonical settled | `active: "ev_retry_path"`; E1–E4 complete; finding head, both records, active-record emphasis and the trace panel fully visible |
| Manual-selection transition | Acknowledgement 140 ms on the record control; active treatment moves to the newly selected record over 380 ms; trace panel transitions over 260 ms |
| Manual interruption | Settles over 300 ms; the selected record's treatment applies immediately |
| Active-record acknowledgement | 140 ms, `--motion-ease-selection`, surface + border + weight |
| Trace-panel transition | 260 ms, `--motion-ease-panel`, translateY 4 px → 0. **No opacity change — the panel's text is at full opacity throughout.** |
| Stable height | Both trace panels share one grid cell; the inactive one is `visibility: hidden` + `inert` and still contributes height |
| Reduced motion | All four steps at final state on first paint; controls available; panel swaps instant |
| No JavaScript | Finding head, edge with rule at full `scaleX`, both records complete, `ev_retry_path` trace panel visible; no control emitted |
| Mobile | E1 570→950; E2 1,520→1,820; E3 2,735→3,115; E4 3,685→3,985. **Total 3,985 ms** |

### 15d. Phase 7B proof obligation — preserved

Unchanged from the interaction contract and restated here because this phase
implements the scene first:

> If selecting between the two evidence records does not create meaningful
> additional understanding, reclassify the scene as choreography-only rather
> than forcing weak interaction.

If that outcome is taken, the choreography above survives intact — E1–E4 need no
change — and only the controls are removed. That is deliberate: the sequence was
designed so its value does not depend on the interaction being kept.

## 16. Missing Proof and Requirement choreography

Choreography only. No interaction state, no controls, nothing focusable.

One relationship: **missing proof → open blocking requirement → merge readiness
remains blocked.**

### 16a. Sequence

| Step | Start | Duration | End | Pause before | Region | Vocabulary |
|---|---|---|---|---|---|---|
| — | 0 | — | — | — | activation | — |
| **M1** | 760 ms | 420 ms | 1,180 ms | 760 (short, pre-roll) | Missing-proof record card | Scene readiness |
| **M2** | 2,160 ms | 380 ms | 2,540 ms | 980 (standard) | Edge rule `scaleX(0)` → `scaleX(1)` **and** `Leaves open` | Relationship trace |
| **M3** | 3,300 ms | 380 ms | 3,680 ms | 760 (short) | Requirement card — `blocking · open`, `Provider failure states covered` | Status emphasis |
| **M4** | 4,440 ms | 380 ms | 4,820 ms | 760 (short) | Unresolved bar — `Merge readiness blocked`, `4 open · 2 blocking · Human Decision PENDING` | Status emphasis |

**Total 4,820 ms.**

The 980 ms pause after M1 is a `standard` pause, not `long`: the missing-proof
statement is one sentence of about sixteen words, shorter than the Hero's
three-line focus group.

**Text readability, explicitly (§13a):** the missing-proof text, the requirement
text and the readiness-consequence text are fully readable at first paint and
remain so throughout. Relationship emphasis uses the decorative trace and
container treatments. **No record-level opacity reduction is permitted anywhere
in this scene** — which matters more here than anywhere else on the page,
because this scene has no persistent chrome and everything it says, it says
through choreographed regions.

### 16b. Locked behaviours

| Question | Lock |
|---|---|
| Rapid-scroll behaviour | Sequence starts on entry and completes regardless of scroll speed |
| Offscreen completion | Completes offscreen; never restarts |
| Reduced-motion settled state | All four steps at final state on first paint |
| No-JavaScript presentation | Identical to the settled state: record, rule at full `scaleX`, `Leaves open`, requirement card, unresolved bar — all fully visible |
| Does the final emphasis remain visible permanently | **Yes.** M3 and M4 leave permanent container states. Nothing decays, fades back or pulses. |
| Mobile | M1 570→990; M2 1,725→2,105; M3 2,675→3,055; M4 3,625→4,005. **Total 4,005 ms** |

The settled state does not depend on animation memory: it is the CSS default, so
a visitor who never saw a single step sees exactly the same scene.

### 16c. Must not

Reveal another missing-proof relationship; introduce tabs; make static records
focusable; resolve anything; loop the relationship; pulse the blocking
requirement; animate indefinitely.

## 17. Readiness and Human Decision choreography

Active state remains `readiness` for the entire introduction. Nothing switches to
Decision boundary.

**Persistent and static throughout:** recommendation; risk; requirements;
`Human Decision PENDING`; all seven outcomes; the outcomes note; the view control
row.

### 17a. Sequence

| Step | Start | Duration | End | Pause before | Region | Vocabulary |
|---|---|---|---|---|---|---|
| — | 0 | — | — | — | activation | — |
| **R1** | 760 ms | 420 ms | 1,180 ms | 760 (short, pre-roll) | `2 blocking` · `2 missing or unverified` · `1 stale` | Scene readiness |
| **R2** | 2,160 ms | 300 ms | 2,460 ms | 980 (standard) | The change note | Local reveal |
| **R3** | 3,680 ms | 380 ms | 4,060 ms | 1,220 (long) | The `PENDING` block's **container** | Status emphasis |
| **R4** | 5,040 ms | 380 ms | 5,420 ms | 980 (standard) | The outcomes **container** | Status emphasis |

**Total 5,420 ms.**

### 17b. How PENDING is both persistent and emphasised

The brief lists `Human Decision PENDING` as persistent *and* asks the narrative
to give it restrained emphasis. Both are satisfied because **R3 changes only the
container**: `border-color` from `--pub-border-subtle` to `--pub-border`, and
`background-color` from transparent to `--pub-surface-2`. The word `PENDING`
itself never changes opacity, colour, weight or position, and is fully legible
from first paint.

R4 does the same for the outcomes container, which is how "the authority
boundary settles" is expressed without touching a single outcome chip. No chip
changes appearance, gains a hover response, or acquires anything that could read
as interactive.

**Text readability, explicitly (§13a):** recommendation, risk, the requirement
facts, `PENDING` and all seven outcome labels remain fully readable and
byte-identical in textual styling, as §17c already requires. Emphasis applies to
tag, panel, border, background and rule containers only. **Outcome labels never
become dimmed to create sequence hierarchy** — the hierarchy between R3 and R4
is carried by the order in which their containers settle, not by making one set
of labels quieter than another. The R1 tags and the R2 change note are likewise
readable at full opacity from first paint.

### 17c. Locked states

| | State |
|---|---|
| Canonical initial | `active: "readiness"`; all persistent content at full emphasis; R1 and R2 regions **fully readable at opacity 1**, their containers at `--pub-border-subtle` / transparent and offset +8 px; R3 and R4 containers at `--pub-border-subtle` |
| Canonical settled | `active: "readiness"`; R1–R4 complete; persistent content including `PENDING` and all seven outcomes fully visible |
| Manual switch to Decision boundary | Acknowledgement 140 ms; panel transition 260 ms; persistent content unchanged |
| Manual interruption | Settles over 300 ms |
| Panel transition | 260 ms, `--motion-ease-panel` |
| Stable height | Both panels share one grid cell |
| Reduced motion | All four steps at final state on first paint |
| No JavaScript | Persistent content complete; Readiness panel visible; Decision-boundary panel present, hidden, inert; no control emitted |
| Mobile | R1 570→990; R2 1,725→2,025; R3 2,940→3,320; R4 4,055→4,435. **Total 4,435 ms** |

### 17d. Must not

Select an outcome; pulse outcome chips; make outcome chips look interactive;
switch to Decision boundary automatically; open a modal; simulate decision
recording; change recommendation; change risk; clear a requirement.

## 18. Manual panel transitions

One shared transition for Hero view switching, Evidence-record inspection and
Readiness view switching.

### 18a. Mechanism

Both panels occupy one CSS grid cell. On selection:

| Layer | Timing | Behaviour |
|---|---|---|
| **Semantic** | 0 ms, synchronous | `aria-selected` flips; the outgoing panel becomes `visibility: hidden` + `inert`; the incoming panel becomes visible. Assistive technology sees the new panel immediately and never sees two. |
| **Visual** | 260 ms | The incoming panel transitions `translateY` 4 px → 0, with `--motion-ease-panel`. **No opacity change** — the panel's text is at full opacity the moment it becomes visible. The outgoing panel does not animate out. |
| **Focus** | unchanged | Focus stays on the control. Nothing is focused, blurred or scrolled. |

The outgoing panel disappearing instantly rather than cross-fading is
deliberate: two overlapping text blocks in one grid cell would be unreadable for
the whole transition, and a cross-fade is explicitly prohibited. `display: none`
is **not** used — `visibility: hidden` preserves the panel's height contribution,
which is what keeps the scene's dimensions constant.

### 18b. Rapid successive selections

**Latest intent wins, structurally.**

Nothing is queued, because nothing is scheduled: the panel transition is a plain
CSS transition on whichever panel is currently active. Re-selecting mid-transition
switches `visibility` immediately and retargets the transition. There is no timer
to cancel, no animation to interrupt and no stale callback to invalidate.

Under rapid keyboard arrowing — three tabs at, say, 80 ms apart — each press
flips the semantic state instantly and the final panel completes its 260 ms
settle. No intermediate panel is ever left exposed to assistive technology, and
no intermediate transition is ever seen to completion.

### 18c. The three states, kept distinct

| State | Authority | Changes when |
|---|---|---|
| **Semantic active panel** | `aria-selected`, `visibility`, `inert` | Immediately on selection |
| **Visual transition state** | `opacity`, `transform` | Over 260 ms after selection |
| **Keyboard focus** | `:focus-visible` on the control | Only when the visitor moves it |

These are never conflated. A panel can be visually mid-transition while being
semantically fully active, and focus is unaffected by both.

### 18d. Under reduced motion

Instant. `opacity` and `transform` do not tween; the semantic flip is the whole
change. Selection acknowledgement still applies, instantly.

## 19. Responsive motion

The narrative, states, relationships, final meaning and manual-intent rules are
**identical at every viewport**. No viewport gets a different story.

### 19a. Locked adjustments

| Property | ≥ 768 px | ≤ 767 px | Justification |
|---|---|---|---|
| Durations | as locked | **unchanged** | Durations are perceptual constants |
| Reading pauses | 760 / 980 / 1,220 ms | **× 0.75** → 570 / 735 / 915 ms | Mobile dwell per section is shorter; the narrative must complete within it |
| Enter distance | 8 px | **4 px** | The same absolute distance reads larger against a narrower element |
| Panel distance | 4 px | **2 px** | Same |
| Simultaneous emphasis layers | up to 2 | **1** | A single emphasis at a time on a small screen |
| Relationship trace | horizontal rule, `scaleX` from left | **vertical rule, `scaleY` from top** | The Missing Proof relationship stacks vertically at ≤ 1024 px |
| Panel transition direction | translateY | translateY | Unchanged — source order is vertical at every viewport |

Total sequence times at ≤ 767 px: Hero 3,500 ms; Finding and Evidence 3,985 ms;
Missing Proof 4,005 ms; Readiness 4,435 ms. **Modestly shorter — approximately
0.82× desktop.** This is the locked answer to the brief's question.

Tablet (768–1024 px) uses desktop timing: the split has collapsed to full width
but dwell behaviour is desktop-like.

The emulated 200 % zoom state (640 × 400 @2x) is 640 CSS px wide and therefore
uses mobile timing.

### 19b. Requirements

| # | Requirement | How it is met |
|---|---|---|
| 1 | No motion causes horizontal overflow | Nothing moves horizontally; `scaleX` on the edge rule is bounded by its own box |
| 2 | No moving region is clipped | Maximum movement is 8 px, inside a plate with ≥ 12 px inset at every tier |
| 3 | No layout jump | Only `opacity` and `transform` animate |
| 4 | Touch controls remain stable | Controls never participate in choreography (§20) |
| 5 | Narrative completes under normal mobile dwell | ≤ 4,435 ms at ≤ 767 px, and completion is guaranteed offscreen regardless |
| 6 | Rapid scrolling leaves a complete scene | Sequences run to completion and never restart |
| 7 | No internal scrolling | Unchanged |
| 8 | Stable height across manual states | Shared grid cell |

## 20. Automatic and manual layers

Two layers, strictly separated.

**Automatic layer** — introduces and emphasises content *within* the default
active state. It never changes `active`.

**Manual layer** — lets the visitor select another existing canonical state.

Automatic choreography may never change the active Hero view, the active
Evidence record, or the active Readiness view. Defaults remain `overview`,
`ev_retry_path`, `readiness`.

### 20a. Controls do not participate in choreography

**Locked: the control row is Class A. It is fully visible and fully operable
from the moment client enhancement completes, and it never animates.**

This resolves the question the interaction contract left open, in the direction
that contract preferred. Three reasons:

1. A visitor must never reach for a control that has not arrived. With a 4–5 s
   narrative — five times longer than the accepted stagger — a control that
   faded in late would be unavailable for a meaningful period.
2. Controls are the manual layer. Making them part of the automatic layer blurs
   the separation this contract exists to enforce.
3. Cursor's evidence shows the frame and its affordances complete at first
   paint; only content changes afterwards.

A restrained initial control-row appearance is therefore **not** permitted.

## 21. Performance and implementation boundary

### 21a. Mechanism

The entire automatic introduction is driven by **CSS `transition-delay`**. One
attribute change on the scene arms every step at its own delay, exactly as the
accepted implementation already does — only the delay values change.

```
.scene[data-motion="armed"]    → Class B container pre-state + 8px offset; Class C absent
.scene[data-motion="revealed"] → final state, per-step transition-delay applied
.scene[data-motion="settled"]  → final state, transition-delay: 0ms  (new)
```

`"settled"` is the one addition: it is what a manual interruption sets, and it
makes cancellation a single attribute change rather than a timer sweep.

### 21b. Boundaries

| # | Lock |
|---|---|
| 1–2 | No new dependency; no animation library |
| 3 | CSS transitions only |
| 4 | A single timer per scene, only to mark `introductionComplete` |
| 5 | The existing scene-entry observer, unchanged |
| 6–8 | No continuous scroll listener; no `requestAnimationFrame` loop; no layout-measurement loop |
| 9–10 | No animated height; no duplicated product trees |
| 11–14 | No external request; no model call; no persistence; no telemetry |
| 15–19 | No background video; no parallax; no canvas; no WebGL; no CSS filter animation |
| 20 | **No `will-change` at all** — only `opacity` and `transform` animate, on a handful of elements; compositor promotion is unnecessary |

### 21c. Timers, cleanup and cancellation

| Question | Lock |
|---|---|
| Maximum timers per active scene | **One.** It marks `introductionComplete` at the sequence's total duration. |
| Total timers on the route | Four, one per scene, each existing for at most 5.42 s |
| Cleanup | Cleared in the effect's cleanup function on unmount |
| Cancellation | Cleared immediately on manual interruption |
| Stale callbacks | The timer sets one boolean and is cleared before any manual path runs; there is no callback that can act on stale state |
| React Strict Mode double-invocation | The effect's cleanup clears the timer, so a double mount produces one live timer, not two. `data-motion` is idempotent — setting `"revealed"` twice is indistinguishable from once. |
| Unmounting | Clears the timer; no other pending work exists |
| Visibility change | **Not handled, deliberately** (§11) |
| Layout stability | Guaranteed by the shared grid cell and by animating only `opacity` and `transform` |

The implementation must remain reviewable: one attribute, three values, a CSS
block of per-step delays, and one timer per scene.

## 22. Motion tokens

Proposed for Phase 7 implementation and later Phase 8 formalisation. Not a
production design system in this phase.

| Token | Value | Purpose | Permitted | Prohibited | Reduced motion | Future-route note |
|---|---|---|---|---|---|---|
| `--motion-duration-immediate` | `90ms` | Hover tone | Hover `background-color` | Any state change; any transform | ≤ 1 ms | Reusable |
| `--motion-duration-selection` | `140ms` | Selection acknowledgement | Control surface, border, weight | Panels; opacity of content | ≤ 1 ms, still applies | Reusable |
| `--motion-duration-panel` | `260ms` | Panel transition | Incoming panel `transform` | Outgoing panel; height; **any text opacity** | ≤ 1 ms | Reusable |
| `--motion-duration-reveal` | `300ms` | Local reveal; interruption settle | Class B **containers and offsets** | Class A; controls; **any text opacity** | not applied | Reusable |
| `--motion-duration-relationship` | `380ms` | Relationship trace, record emphasis, status emphasis | Rules, containers, record surfaces | Canonical values themselves | not applied | Reusable |
| `--motion-duration-scene-ready` | `420ms` | Scene readiness | A scene's first choreographed region only | Any later step | not applied | Reusable |
| `--motion-delay-reading-short` | `760ms` | Pre-roll; after a short label | Between steps | Inside a step | not applied | Reusable |
| `--motion-delay-reading-standard` | `980ms` | After one sentence | Between steps | Inside a step | not applied | Reusable |
| `--motion-delay-reading-long` | `1220ms` | After a multi-line group | Between steps | Inside a step | not applied | Reusable |
| `--motion-ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Enter and emphasis | Vocabulary 1, 2, 5, 6, 7 | Panels; selection | n/a | Reusable |
| `--motion-ease-panel` | `cubic-bezier(0.4, 0, 0.2, 1)` | Panel change | Vocabulary 4 | Enter; selection | n/a | Reusable |
| `--motion-ease-selection` | `cubic-bezier(0, 0, 0.2, 1)` | Immediate response | Vocabulary 3 | Anything ≥ 260 ms | n/a | Reusable |
| `--motion-distance-enter` | `8px` / `4px` ≤767 | Enter offset | `translateY` only | `translateX`; any value > 8 px | not applied | Reusable |
| `--motion-distance-panel` | `4px` / `2px` ≤767 | Panel offset | `translateY` only | `translateX` | not applied | Reusable |
| `--motion-opacity-decorative-quiet` | `0` | Decorative fade origin | **Decorative, non-text elements only** | Meaningful text; **any ancestor of meaningful text**; records; panels; Class A; Class B | not applied | Reusable, with the same restriction |

Fifteen tokens. The accepted `--dur: 420ms` and `--ease` remain and map onto
`--motion-duration-scene-ready` and `--motion-ease-standard`.

The last token replaces the superseded `--motion-opacity-quiet: 0.72`
(§13d). It is deliberately named for its only permitted use, so that no
implementer can read it as safe for a text-bearing container. **No
general-purpose quiet-opacity token exists, and none may be reintroduced.**

## 23. Motion accessibility

| # | Lock |
|---|---|
| 1 | Motion never moves focus |
| 2 | Motion never steals input authority |
| 3 | Automatic steps create no announcements — no node is inserted, removed or relabelled |
| 4 | The active manual panel remains programmatically associated with its control via `aria-controls` / `aria-labelledby` |
| 5 | Inactive panels are removed from the accessibility tree by `visibility: hidden` + `inert` |
| 6 | Visible motion never reorders DOM content |
| 7 | No important meaning is expressed by motion alone |
| 8 | Status emphasis is also expressed through text and structure — every emphasised container carries a text label |
| 9 | Relationship traces have textual equivalents — the decorative rule always sits beside `Leaves open` or `Supported by 2 canonical evidence records` |
| 10 | Colour is not the sole emphasis channel — emphasis combines surface, border and, for selection, weight |
| 11 | Focus indicators remain visible during transitions; the focus outline is never animated or suppressed |
| 12 | Rapid keyboard navigation never leaves a stale panel exposed — the semantic flip is synchronous (§18c) |
| 13 | Zoom does not clip moving content — maximum 8 px inside a ≥ 12 px plate inset |
| 14 | Motion pauses are not required for comprehension — the settled state is the CSS default |
| 15 | Content remains complete when animation is blocked |

**No live region is introduced.** The interaction contract's decision is
preserved, and this phase strengthens the reason for it: with automatic
activation and a 260 ms panel transition, arrowing across three tabs would fire
three interrupting announcements. Tab-panel semantics already announce the
selection, and the automatic layer changes no semantics at all, so there is
nothing for a live region to announce that is not already announced or not worth
announcing.

## 24. Reduced motion

| # | Lock |
|---|---|
| 1 | No automatic choreography runs |
| 2 | No delayed reading sequence runs |
| 3 | Every scene renders its canonical settled state immediately |
| 4 | Manual controls remain available |
| 5 | Control selection acknowledgement remains clear |
| 6 | Panel content changes immediately |
| 7 | No relationship is unavailable |
| 8 | No scene remains muted |
| 9 | No outcome changes |
| 10 | No focus movement occurs |

**A minimal colour, border or surface state change remains permissible**, and is
required for selection acknowledgement — a visitor who has selected a control
must see that it is selected. What is removed is *transition over time*, not
*state difference*. Reduced motion is not slower animation; it is the absence of
animation with every state intact.

### 24a. Contrast clarification

Behaviour above is unchanged. Made explicit:

1. **All meaningful text remains at full accessible contrast** — which is
   trivially satisfied, because no text opacity is ever reduced in any mode.
2. The canonical settled **container** treatments render immediately.
3. Decorative traces may render immediately, without transition.
4. Manual interaction remains available.

Mechanism: `SceneMotion` never arms, so the CSS default — which is the final
state — is what renders. The existing `@media (prefers-reduced-motion: reduce)`
block additionally forces final values with `!important`, so a preference change
mid-session takes effect live.

## 25. No-JavaScript equivalent

| # | Lock |
|---|---|
| 1 | No automatic choreography exists |
| 2 | No interactive controls appear |
| 3 | Static truthful panel labels remain |
| 4 | Canonical default content is complete |
| 5 | Each scene resembles its canonical settled state |
| 6 | Every required relationship remains understandable |
| 7 | Essential truth is not hidden |
| 8 | No CSS animation loops independently |
| 9 | No timed reveal depends only on CSS |
| 10 | Genuine links remain operational |

### 25a. Exact static presentation

| Scene | Without JavaScript |
|---|---|
| **Hero** | Persistent chrome complete; control row renders the plain label `Overview`; Overview panel at full emphasis; Finding and Readiness panels present, `visibility: hidden`, `inert` |
| **Finding and Evidence** | Finding head; edge label with the rule at full `scaleX`; both records complete; control row renders `Provenance and source`; `ev_retry_path` trace panel visible; second trace panel hidden and inert |
| **Missing Proof** | Record, full-scale rule, `Leaves open`, requirement card, unresolved bar — all at final emphasis. Identical to the settled state. |
| **Readiness** | Persistent content complete including `PENDING` and all seven outcomes; control row renders `Readiness`; Readiness panel at full emphasis; Decision-boundary panel hidden and inert |

The no-JavaScript and reduced-motion states are **visually identical**, with one
difference: reduced motion retains the enhanced control row, no-JavaScript shows
the plain panel label in its place. Both show every scene at its settled state.

This is guaranteed by construction: the armed pre-state is applied only by
`SceneMotion` arming, which requires JavaScript. Without it, the CSS default —
the settled state — is what renders. No CSS animation, keyframe or transition
runs on its own.

### 25b. Contrast clarification

Behaviour above is unchanged. Made explicit:

1. **All meaningful text remains at full accessible contrast.**
2. The static scene resembles the settled state.
3. **No CSS-only timed text-opacity reveal is permitted** — and none exists;
   there is no `@keyframes` rule on the route, and every transition is gated
   behind a `data-motion` attribute that only JavaScript sets.
4. Decorative traces may be statically visible, or omitted, when the textual
   relationship remains explicit. The locked choice is **statically visible at
   full scale**, because the rule costs nothing and reinforces the label.

## 26. Phase 7.1 surface continuity

No atmospheric surface is implemented, selected or designed here.

| # | Lock |
|---|---|
| 1 | Motion belongs to the product interface, not the background surface |
| 2 | Atmospheric or structural surfaces remain static |
| 3 | No background parallax |
| 4 | No background video |
| 5 | No animated gradient |
| 6 | No scene motion depends on a particular image crop |
| 7 | Product contrast remains stable throughout motion |
| 8 | Surface changes cannot alter choreography timing |
| 9 | The neutral fallback preserves the complete experience |
| 10 | Motion remains legible over every future approved surface |

### 26a. The strengthened contrast handoff

Rule 7, stated as five binding requirements on Phase 7.1:

| # | Requirement |
|---|---|
| 1 | Every proposed neutral, atmospheric, structural or hybrid scene surface must **preserve accessible contrast for all meaningful text-bearing product surfaces** — at least 4.5 : 1 for normal-size text and 3 : 1 for qualifying large text. |
| 2 | Product text should normally remain on the **inset white product surface**, rather than being placed directly over atmospheric imagery. |
| 3 | A decorative outer plate **may not force dimmer text or translucent product panels**. |
| 4 | The surface candidate **changes or is rejected** when contrast cannot be preserved. |
| 5 | **Motion contrast requirements are invariant across surface candidates.** They are not a variable a surface proposal may trade against. |

This is materially easier to satisfy than it was under the superseded 0.72
policy. Because no product text is ever composited at partial opacity, a surface
only has to hold each text token's **settled** contrast — the same check the
accepted design already passes — rather than a second, harder check against a
transient reduced-opacity state.

Requirement 3 is the one most likely to be reached for: a translucent product
panel over an atmospheric plate is the conventional way to make a surface read
through a scene, and it is forbidden here, because it dims every value inside
the panel.

Current likely hierarchy, recorded as a **hypothesis only**; the Phase 7.1
contract retains final authority:

1. Hero may earn the strongest atmospheric or structural surface.
2. Readiness may earn a quieter related surface.
3. Finding and Evidence likely remains neutral.
4. Missing Proof and Requirement likely remains neutral or structurally quiet.
5. Trust remains editorial and non-atmospheric.

## 27. Phase 8 cross-route continuity

Early note only. The full public motion system remains Phase 8.

**Reusable:** motion tokens; panel transitions; scene-entry rules;
manual-intent authority; reduced-motion behaviour; stable-frame principles;
accessibility requirements.

**Not assumed:**

1. Not every route needs motion.
2. Not every route needs interactive scenes.
3. Resources and Documentation likely remain largely static.
4. Trust should use motion only when it clarifies a real system relationship.
5. Pricing should avoid decorative product choreography.
6. Product may reuse the fullest scene system.
7. Route transitions are not part of Phase 7.
8. No global animated page shell should be assumed.

Cursor informs continuity of grammar, not mandatory animation density: its
documentation route abandons scene motion entirely, and that separation is
correct.

## 28. Phase 7B implementation handoff

**Scope: Finding and Evidence interaction and choreography gate.**

| | |
|---|---|
| **Files likely to change** | `components/FindingEvidenceScene.tsx`; new `components/PublicSceneViews.tsx`, `PublicSceneTab.tsx`, `PublicScenePanel.tsx`, `public-interaction-types.ts`; `reference-reconstruction.module.css` (motion tokens, `data-motion="settled"`, per-step delays, control and panel styles); possibly `SceneMotion.tsx` for the `introductionComplete` timer |
| **Primitives** | All three, complete |
| **Choreography** | E1–E4 exactly as §15a, plus the mobile variant |
| **Manual interaction** | Two record controls, vertical tablist, automatic activation, roving tabindex, one trace panel per record |
| **Browser evidence** | Screenshots at 1280×800 and 390×844 of the initial, mid-sequence and settled states; a scripted keyboard walk; a reduced-motion capture; a JavaScript-disabled capture; scene-height measurements in both record states at both viewports; a CLS measurement across load |
| **Recording** | A screen recording of one full page load through the scene's complete sequence, then a manual selection of the second record, then a manual interruption on reload — at 1280×800 |
| **Proof obligation** | Whether selecting between the two evidence records creates meaningful additional understanding |
| **Accepted negative outcome** | Reclassify the scene as choreography-only. E1–E4 survive unchanged; only the controls are removed. Two interactive scenes ship, not three. |
| **Stopping conditions** | Gate passes when: the sequence matches §15a to the millisecond; no layout shift at hydration; scene height constant across record selection at both viewports; the keyboard model correct; the no-JavaScript and reduced-motion states match §25a and §24; and the proof obligation is resolved either way |
| **Protected scope** | Everything in §31, plus the Hero, Missing Proof and Readiness scene components, which 7B does not touch |

## 29. Phase 7C implementation handoff

**Scope: Hero and Readiness interaction and choreography completion.**

| | |
|---|---|
| **Files likely to change** | `components/HeroReviewScene.tsx`, `components/ReadinessDecisionScene.tsx`, `components/MissingProofRequirementScene.tsx` (choreography re-grouping only, no controls), `reference-reconstruction.module.css` |
| **Primitives** | **None new.** Needing one means 7B's abstraction was wrong and belongs corrected in 7B's shape. |
| **Choreography** | H1–H3 (§14a), M1–M4 (§16a), R1–R4 (§17a), plus mobile variants |
| **Manual interaction** | Hero three-view tablist; Readiness two-view tablist. Both horizontal, automatic activation, roving tabindex |
| **Browser evidence** | The same matrix as 7B for all three scenes, plus verification that `PENDING` and all seven outcomes remain fully visible in both Readiness views and in every state |
| **Recording** | One full-page load through all four sequences at 1280×800, and one at 390×844 |
| **Stopping conditions** | Gate passes when: all four sequences match their locked timings; the Missing Proof scene has zero controls and zero focusable records; `PENDING` and the seven outcomes never change opacity, colour or position; no scene changes height in any state; and the complete page keyboard walk shows 17 stops with no trap |
| **Protected scope** | §31 |

## 30. Phase 7D review handoff

**Scope: responsive, accessibility, reduced-motion, no-JavaScript, and final
interaction and motion review.**

| Matrix | Contents |
|---|---|
| **Viewport** | 1920×1080, 1600×1000, 1440×900, 1280×800, 1024×768, 834×1112, 768×1024, 430×932, 390×844, 375×812, 320×568, emulated 200 % zoom |
| **Keyboard** | Full walk at three viewports: 17 stops, no trap; per-group arrows on-axis, off-axis passes to the page; Home/End; wrapping; Space/Enter; focus never moves on selection |
| **Touch** | Tap targets measured per tier; whole-card targets; no hover dependency; no swipe gesture bound |
| **Reduced motion** | `data-motion` never set; every step at final state on first paint; controls operable; panel swaps instant; scene heights identical to the animated settled state |
| **No JavaScript** | The §25a presentation for all four scenes; zero `[role="tab"]`; zero `<button>` in `<main>`; every canonical value present |
| **Rapid interruption** | Selection at 1,000 ms, 3,000 ms and 4,500 ms into each sequence; assert settle within 300 ms, focus unmoved, `scrollY` unchanged, no resumption |
| **Scroll-back** | Scroll past each scene, return; assert no restart, state preserved |
| **Layout stability** | Scene `offsetHeight` in every state at every viewport; CLS across load with and without interaction |
| **Performance** | First-load JS delta; client component count (≤ 5); observer count (1 per scene, disconnected); timer count (≤ 1 per scene); zero network requests during interaction; zero `will-change` |
| **Final gate** | Human acceptance of the complete interactive, choreographed page |

## 31. Protected scope

Not modified, verified by `git diff` before and after: `app/page.tsx`;
`app/_public-r5`; `app/_public-r5-recalibrated`;
`app/_public-r5-reference-reconstruction`; `app/visual-lab/public-r5`;
`app/visual-lab/public-r5-recalibrated`;
`app/visual-lab/public-r5-reference-reconstruction`; `app/workspace`;
`app/report`; `app/new`; `app/home`; `app/review-operations`;
`app/integrations`; `app/settings`; `app/review-policies`; `app/team`;
`app/visual-lab/workspace-r4`; `lib/workspace-v2`; `package.json`; every
lockfile; `public/r5/scenes`; `.claude/launch.json`; accepted R4 documentation;
accepted R5E.1E.2 and R5E.1E.3 documentation;
`docs/r5/R5E1E4A_PREMIUM_INTERACTION_ARCHITECTURE_CONTRACT.md` (SHA-256
`c7e7d8fa…ea07`, unchanged); and the existing R5E.1E.4A evidence packages.

Created or modified: this document, and `docs/r5/README.md` (this milestone's
entry). Created untracked: `R5E1E4A2_MOTION_CHOREOGRAPHY_PACKAGE/`.

No application code, CSS, canonical data or dependency changed. Nothing was
staged, committed, pushed or merged. No build was run and no server was started.

## 32. Acceptance criteria and automatic failure conditions

### 32a. The contract passes only when

| # | Criterion | Status |
|---|---|---|
| 1 | Every scene has an exact sequence | §14a, §15a, §16a, §17a |
| 2 | Every timing value is exact | §7a, §7b, §7c |
| 3 | Every easing is exact | §8 |
| 4 | Every settled state is exact | §14d, §15c, §16b, §17c |
| 5 | Manual interruption is exact | §12 |
| 6 | Offscreen behaviour is exact | §11 |
| 7 | Reduced-motion behaviour is exact | §24 |
| 8 | No-JavaScript behaviour is exact | §25 |
| 9 | Mobile adaptation is exact | §19a |
| 10 | Accessibility behaviour is exact | §23 |
| 11 | Performance boundaries are exact | §21 |
| 12 | No automatic state switching is introduced | §4, §20 |
| 13 | No product truth changes | §5a Class A, §13a |
| 14 | No architecture is reopened | §3 |
| 15 | Implementation gates can proceed without motion invention | §28, §29, §30 |
| 16 | Surface work remains deferred | §26 |
| 17 | Cross-route notes remain bounded | §27 |
| 18 | No application code changed | §31 |

### 32c. Amendment 1 acceptance

| # | Criterion | Where satisfied |
|---|---|---|
| 1 | No meaningful text may transition through sub-AA contrast | §13a, §13b Class B rule 6, §32b.3b |
| 2 | Normal-size meaningful text retains ≥ 4.5 : 1 | §13b Class B rule 3 |
| 3 | Qualifying large text retains ≥ 3 : 1 | §13b Class B rule 3 |
| 4 | No parent-opacity treatment may dim meaningful child text | §13c rules 3–5 |
| 5 | The generic quiet-opacity token is removed and replaced by a decorative-only token | §9, §22 |
| 6 | All four scene contracts use container-level emphasis | §14b, §15b, §16a, §17b |
| 7 | Decorative traces remain permitted | §13b Class C |
| 8 | Exact durations unchanged | §7a |
| 9 | Exact delays unchanged | §7b |
| 10 | Exact easing unchanged | §8 |
| 11 | Sequence order unchanged | §14a, §15a, §16a, §17a |
| 12 | Total sequence times unchanged | §7c |
| 13 | Manual-intent behaviour unchanged | §12 |
| 14 | Reduced-motion behaviour unchanged except for the clarification | §24, §24a |
| 15 | No-JavaScript behaviour unchanged except for the clarification | §25, §25b |
| 16 | Phase 7.1 receives the strengthened contrast handoff | §26a |
| 17 | No application or CSS file changed | §31 |
| 18 | Nothing staged | §31 |

### 32b. Automatic failure conditions for Phase 7

Any one fails acceptance outright:

1. Automatic choreography changes an active view or record.
2. Any canonical value animates its own opacity, colour or position.
3. Any element begins at zero opacity other than the decorative relationship
   rule.
3a. **Any implementation applies opacity to a text-bearing parent and causes
   meaningful text to fall below its required contrast ratio** — 4.5 : 1 for
   normal-size text, 3 : 1 for qualifying large text.
3b. Any meaningful text transitions through a sub-AA contrast state, however
   briefly.
4. A scene changes height during a sequence or a selection.
5. A sequence loops, restarts on scroll-back, or depends on scroll percentage.
6. A sequence continues after a manual interaction.
7. Focus moves, or the page scrolls, as a result of motion.
8. A live region is introduced.
9. A dependency or animation library is added.
10. More than one timer per scene exists, or any timer is not cleared on unmount.
11. A continuous scroll listener, a second observer, or a `requestAnimationFrame`
    loop is added.
12. An outcome chip changes appearance, gains a hover response, or becomes
    focusable.
13. Any easing overshoots.
14. Any element moves more than 8 px, or moves horizontally.
15. A control participates in the automatic introduction.

## 33. Remaining non-core questions

None blocks Phase 7.

1. **Whether the Hero's three-step sequence should gain a fourth step** if 7C's
   composition work moves the reviewer-focus lines into persistent chrome — the
   open question the interaction contract already carries. If they move, the
   Hero drops to two steps and the timing must be re-derived. Owner: 7C.
2. **Whether the 0.75× mobile pause scale is right**, or whether 0.8× reads
   better on a real device. A measurement 7D can settle. Owner: 7D.
3. **Whether the 760 ms pre-roll should be shorter for the Hero specifically**,
   since it is the first scene a visitor meets and has already been looked at
   during page load. Owner: 7C.
4. **Whether `--motion-duration-relationship` should split** into separate
   relationship and status tokens if 7C finds they want different values.
   Currently one token serves three vocabulary items. Owner: 7C.
5. **Whether the interruption settle should be instant rather than 300 ms.**
   300 ms is chosen so an interruption reads as completion rather than as a
   snap; if it reads as lag in practice, 7B should reduce it. Owner: 7B.
6. **Which atmospheric surfaces can hold every text token's settled contrast**
   (§26a). No longer a question about a transient reduced-opacity state — that
   policy was rejected (§13d) — but the settled-contrast check still has to be
   run per surface candidate. Owner: Phase 7.1.

## Human acceptance and Phase 7A closeout

R5E.1E.4A Premium Interaction Architecture and R5E.1E.4A.2 Premium Motion and Scene Choreography received human acceptance on 4 August 2026.

The accepted Phase 7A system locks:

1. Three manually interactive public scenes:
   - Hero selected review
   - Finding and Evidence
   - Readiness and Human Decision
2. Missing Proof and Requirement as choreography-only.
3. Trust, unresolved-case handoff and footer as non-interactive except for genuine links.
4. Independent local scene state with no global homepage state machine.
5. Tabs and tab panels as the shared public interaction grammar.
6. Manual visitor intent as authoritative for the remainder of the page lifetime.
7. Automatic choreography that changes emphasis only and never changes active interaction state.
8. Stable product-scene frames and region-local motion.
9. One-shot activation with no replay on scroll-back.
10. Exact durations, pauses, easing, movement distances and scene sequences.
11. Complete truthful progressive enhancement and no-JavaScript presentation.
12. Reduced-motion behaviour that preserves genuine interaction while removing temporal choreography.
13. No live-region announcements for bounded tab-panel changes.
14. No simulated analysis, loading, repository activity, model execution or Human Decision.
15. No meaningful text opacity treatment that falls below WCAG AA.
16. Container, border, rule, translation and surface treatments as the primary emphasis vocabulary.
17. Decorative opacity restricted to non-text, non-essential elements.
18. A defined Phase 7B Finding and Evidence proof gate.
19. A defined Phase 7C Hero and Readiness completion phase.
20. A defined Phase 7D responsive, accessibility and final-review phase.

The exact interaction states remain:

Hero:
Overview / Finding / Readiness

Finding and Evidence:
ev_retry_path / ev_no_idempotency_key

Readiness and Human Decision:
Readiness / Decision boundary

The accepted motion totals remain:

Hero:
4,300 ms desktop

Finding and Evidence:
4,860 ms desktop

Missing Proof and Requirement:
4,820 ms desktop

Readiness and Human Decision:
5,420 ms desktop

Phase 7A is accepted and closed. Implementation begins through the bounded Phase 7B gate.
