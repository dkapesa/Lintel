# V8 Motion Constitution

**Status:** Normative for V8 implementation  
**Applies to:** V8B, V8C and V8D; `/`, `/workspace` and `/report?demo=1`  
**Authority:** Subordinate to [LVOS v1.0](./LVOS_V1.md) and the [Visual Calibration Note](./LVOS_VISUAL_CALIBRATION_NOTE.md). It does not amend either.  
**Governing principle:** **Nothing moves unless meaning changes.**

## V8A declaration

V8A changes only this constitution, the companion storyboard, the design index and the active roadmap. Implementation, CSS, dependencies, component structure, product semantics, data, persistence, scoring, recommendations and report generation remain fixed. The goal is to make selection, focus, evidence relationships, requirement progression, responsive ownership and the hand-off from machine analysis to human authority easier to understand. Every proposed sequence has a static complete state, a reduced-motion equivalent and a bounded performance cost.

## 1. Normative principles

1. **Meaning before movement.** Motion occurs only for a selection, state, focus, ownership or spatial-context change.
2. **Verification continuity.** It may reinforce `Change → Observation → Evidence → Requirement → Human decision`; it must not invent a stage or a result.
3. **Human authority.** Analysis may arrive at a recommendation. Motion must never imply autonomous approval, rejection, merge or human action.
4. **Truthful state.** Reveal existing state only. Do not simulate processing, confidence, completion, agent activity or live data.
5. **User control.** No scroll-jacking, forced tour, autoplay loop or interaction-blocking sequence.
6. **Spatial ownership.** When a surface moves, it explains both its source and its new owner.
7. **Calm technical character.** Use restrained distance and easing; no bounce, elastic overshoot or theatrical zoom.
8. **Static completeness.** The initial and final DOM states convey the same information without animation.
9. **Reduced motion is authored.** `prefers-reduced-motion` is a designed mode, not a blanket afterthought.
10. **Performance is part of correctness.** Motion must preserve input response, scroll stability and ordinary-device usability.

## 2. Permanent prohibitions

- Idle or ambient interface movement; looping decorative animation; animated gradients, glows or background textures.
- Parallax scenery, scroll-jacking, wheel interception, forced snapping or trapped sections.
- Fake typing, fabricated agent thought streams, simulated analysis/progress, or pulsing status without a real temporal state.
- Spring bounce, elastic overshoot, animated counters implying live data, auto-advancing carousels and unnecessary hover movement.
- Animated layout reflow, `transition: all`, broad `top`/`left`, width or height animation, uncontrolled auto-height animation, expensive large-surface blur/filter, repeated box-shadow animation or cumulative layout shift.
- Status communicated by movement or colour alone; delayed access to essential controls; competing animations on more than one plane.

## 3. Current inventory — V8A baseline

| Existing behaviour | Evidence and meaning | Classification | V8 disposition |
| --- | --- | --- | --- |
| Shared tokens: `--transition-fast: 130ms ease`, `--transition-base: 160ms ease` | Current compact control vocabulary | refine during V8 | Replace the generic `ease` vocabulary only through approved tokens; retain the small scale. |
| Copy/download controls; form fields; report-diff row; decision-timeline border | 130–150ms colour, border, background or shadow feedback | retain | Compact confirmation/hover/focus feedback already communicates a bounded local state. |
| Shell-rail tooltip | 130ms opacity on hover/focus | retain | Tooltip is an orientation aid; remain opacity-only. |
| Theme switch | A root class enables a 180ms transition on a limited control set; reduced motion is immediate | refine during V8 | Keep semantic palette change and immediate reduced mode; remove `transform` from the broad selector unless a named consumer proves it necessary. Do not animate whole surfaces. |
| Guided-tour target geometry | 160ms `top/left/width/height` transition | refine during V8 | This is guidance geometry, not product motion; do not expand it and avoid layout-affecting geometry animation where the tour remains. |
| Global smooth scroll and report outline/jump scrolling | Programmatic Case File navigation may use smooth scroll; reduced motion changes it to auto | refine during V8 | Keep document navigation user-led; reduce distance/duration only if it preserves location clarity. Never use it for landing choreography. |
| Shell drawer, Workspace selected-case surface, Case File decision sheet | State, inertness, focus trap and restoration exist; no authored entrance/exit transition is present | refine during V8 | Spatial ownership is a valid V8C candidate. Semantic modal state must change before any visual transition. |
| Workspace queue, modes, canvas and contextual inspector | Selected data and focus change immediately; no visual animation | refine during V8 | Valid state/projection candidates; unrelated panes must remain stable. |
| Landing Case File exhibits and verification traces | Static persistent Case File; no animation | refine during V8 | Landing-only staged narrative candidates; no fabricated progression. |
| `requestAnimationFrame` calls | Used to defer focus/scroll or set an already-requested drawer state; no loop | not motion; behavioural timing only | Preserve only for lifecycle ordering. No V8 sequence may depend on a frame loop. |
| Clipboard/status reset timers and object-URL cleanup timers | Feedback expiry and resource cleanup | not motion; behavioural timing only | Leave outside the motion system. |
| Reduced-motion rules | Global 0.01ms override and route-level smooth-scroll/landing/Workspace suppression | refine during V8 | Replace only if needed with explicit class policy; do not weaken coverage. |

There are no `@keyframes`, Web Animations API calls, animation-library consumers, `requestAnimationFrame` loops or existing CSS animation declarations in the inspected surfaces. Areas that already feel correct and remain static: dense queue rows, independent desktop pane scrolling, Case File document reading, the persistent landing Case File, evidence/trace records at rest, and all decision states.

## 4. Tokens and property rules

Exact values are implementation-test decisions for V8B/V8C, but cannot leave these bands without a written reason in V8D.

| Token | Range / target | Permitted use |
| --- | --- | --- |
| `immediate` | 0–80ms | Focus correction, non-visual behavioural ordering and reduced-motion replacement. |
| `micro` | 100–140ms | Hover, pressed, focus and compact selection feedback. |
| `state` | 160–200ms | Tabs, selected rows, artifact focus and inspector projection. |
| `spatial` | 220–280ms | Drawers, sheets, pane/layer ownership. |
| `narrative` | 320–480ms | Landing product-story transitions only. |

The ordinary hard maximum is **280ms**. Only a named landing narrative sequence may use `narrative`; no ordinary product interaction waits for it.

| Easing | Use |
| --- | --- |
| `standard` | Local state change; a restrained symmetric curve. |
| `enter` | A surface becoming owned/visible; decelerates into rest. |
| `exit` | A surface yielding ownership; accelerates out. |
| `linear` | Genuine determinate progress only, when the underlying technical progress is real and visible. It is not currently approved for a Lintel consumer. |

Prefer `opacity`, `transform`, semantic `color`/`background-color`/`border-color`, and a carefully bounded accessible `clip-path` or mask. A View Transition may be progressive enhancement only when its fallback is the same static state. Width, height, `top`, `left`, broad filters, blur and shadow animation are prohibited. An exception requires: a named storyboard sequence, a demonstrated ownership benefit unavailable through permitted properties, reduced-motion parity, interruption handling and a recorded performance check.

## 5. Responsive ownership

| Context | Rule |
| --- | --- |
| Desktop connected planes | Use state/projection emphasis only; do not sweep the queue, canvas or inspector. Preserve each plane’s scroll position. |
| Intermediate work layer | A selected case may enter as one bounded working layer. It alone may move; queue ownership remains visibly behind it. |
| Mobile sheet surfaces | A drawer or full-width sheet may use `spatial` motion to show ownership. Only one modal layer animates at a time. |

For every modal state, focus trap and inertness begin when the semantic modal state begins, not when animation ends. Close restoration is deterministic. An interrupted animation leaves the correct visible state, DOM state, focus and inertness immediately.

## 6. Reduced-motion constitution

When `prefers-reduced-motion: reduce` is active:

| Class | Behaviour |
| --- | --- |
| Immediate | instant. |
| Micro | short opacity only where it does not delay feedback; otherwise instant. |
| State | instant replacement or short opacity; no transform travel. |
| Spatial | instant surface ownership; no slide or staged layer movement. |
| Narrative | disabled; landing renders the final readable product state. |
| Behavioural timing | unchanged where it is focus, inertness, cleanup, data or non-visual ordering. |

Also remove smooth scrolling and staged scroll choreography; preserve focus indicators, semantic colour, dialog behaviour and all information. No content is delayed, hidden pending completion, or removed. The user’s preference applies to theme changes as well.

## 7. Accessibility rules

- Preserve logical DOM order, keyboard access, visible focus and deterministic return focus. Do not move focus purely to serve visual storytelling.
- Movement and colour never carry status alone. Decorative visual changes get no live-region announcement.
- A live region is permitted only for a genuine user-initiated content-context result that otherwise has no accessible confirmation (for example, a new selected case summary after the user chooses it). It is prohibited for landing stage changes, hover, focus, decorative attachment emphasis, continuous scroll position and any fabricated/derived activity.
- Dialog open/close must retain current focus-trap, inertness and escape semantics during interrupted animation. No sequence may cause context loss, flashing or seizure-risk behaviour.
- Any non-trivial user-initiated sequence must be interruptible by the next input and must not block its destination control.

## 8. Performance and implementation preference

Use compositor-friendly properties; batch reads/writes; avoid layout thrashing; animate only visible elements; reserve dimensions before content changes; and clean up observers, timers and listeners. Do not set React state on every scroll when CSS or `IntersectionObserver` can own section ownership. No continuous `requestAnimationFrame` loop, and no large motion library by default.

Implementation order is mandatory:

1. CSS transitions/keyframes for bounded visual state.
2. React state for genuine interaction state.
3. `IntersectionObserver` for landing section ownership.
4. Web Animations API only for a clear lifecycle advantage.
5. View Transitions API only as progressive enhancement with a safe fallback.
6. A third-party dependency only after documenting why existing primitives cannot safely meet the requirement.

V8D measures: input responsiveness during rapid repeat, scroll/frame stability on representative ordinary laptop and mobile hardware, layout-shift absence, observer/listener cleanup, off-screen animation avoidance, dark/light equivalence, reduced-motion correctness, and interruption/close/focus consistency. Profile before adding any dependency or exception.

## 9. Acceptance gates

1. Every animation maps to a real state or ownership change.
2. The complete product is usable and understandable with motion disabled.
3. No sequence fabricates progress, completion, agent activity or human decision.
4. Ordinary interactions are not unnecessarily slowed.
5. Landing scrolling remains normal and user-controlled.
6. Focus, inertness and accessibility state are correct before, during and after motion.
7. No layout shift or hidden essential content occurs.
8. Reduced motion is authored and verified.
9. Rapid input leaves no stale or contradictory state.
10. Motion performs acceptably on representative desktop and mobile devices.
11. Dark and light retain equivalent motion meaning.
12. Lintel remains calm, technical and evidence-led.

## Deferred decisions

V8A does not choose exact curves, transform distances, an observer threshold, a View Transitions consumer, keyframe use, or any dependency. V8B/V8C may propose values only inside this constitution; V8D records approval or a reasoned exception.

## V8C implementation clarification

For a responsive surface, semantic open/close state (dialog role, inertness, scroll lock and focus trap) is allowed to change immediately while a separate, short-lived visual close phase preserves the already-inert surface for its `spatial` exit. This is lifecycle presentation only: it must not retain interactivity, delay restoration under reduced motion, duplicate selected-case data or create a parallel selection/focus model. Reopening interrupts the close and renders the final open state directly.

## V8D final motion decision

**Status:** Finalised for external approval, subject to the recorded runtime environment limits in the final audit.

The V8 vocabulary is now fixed: `120ms` Micro for Workspace row ownership; `180ms` State for Workspace projection, controls and Case File local feedback; `240ms` Spatial for the responsive Workspace selected-case surface and Case File decision sheet; and `360ms` Narrative only for the named landing Case File ownership moments. The approved curves remain the existing restrained standard (`cubic-bezier(.2,.65,.3,1)` / landing `.2,.65,.35,1`) and enter/exit (`cubic-bezier(.16,.8,.25,1)` / landing `.16,.76,.3,1`) curves. All values are within the constitutional bands.

The responsive Workspace visual-close lifecycle now lasts the same `240ms` as its named Spatial CSS transition. A viewport hand-off clears any pending close lifecycle before the surface is synchronously closed, so resize and reopen always leave the final requested ownership state. Semantic closure remains immediate: the surface is non-interactive, its background is released, and focus restoration is independent of visual completion. Reduced motion remains an immediate authored state rather than a shortened transition.
