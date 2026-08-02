# R5E — Public Motion System

Branch: `r5e-public-motion-system`
Route ownership: `/` (production, indexable), `/visual-lab/public-r5` (private, noindex) — unchanged from R5D
Status: implemented.

This document records what R5E did: attaching the three accepted, restrained
motion moments to the already-transferred, already-accepted R5 public
homepage implementation under `app/_public-r5/`. It does not reopen the R5A
visual direction, the R5B page architecture, or the R5D transfer; those
documents remain authoritative and were not edited. Where this document
restates an earlier decision, the earlier document remains the source of
record, per `docs/r5/README.md`'s authority order.

---

## 1. Motion purpose

Motion exists to make the page feel alive, deliberate and premium — not to
narrate a process. It never claims that analysis is running, that evidence
was newly verified, that a requirement cleared, that readiness changed, or
that a Human Decision was recorded. The complete truthful state — every
heading, paragraph, action and product scene — is present in the
server-rendered HTML and remains fully legible with motion disabled,
unavailable, or never triggered. Motion is strictly an entrance
presentation layered on top of content that already exists.

## 2. Exact implementation architecture

Three files changed inside `app/_public-r5/`, plus one new file:

- **`app/_public-r5/components/MotionController.tsx`** (new) — the single
  client boundary. A client component that renders no markup (`return
  null`) and, in one `useEffect`, arms and reveals the three motion slots.
- **`app/_public-r5/components/CropFrame.tsx`** — gained an optional
  `motionPart` prop, rendered as `data-motion-part` on the frame's existing
  wrapper `<div>` (no new element), plus the CSS module's `.motionPart`
  marker class when the prop is set.
- **`app/_public-r5/sections.tsx`** — the three existing
  `data-motion-slot` wrapper elements (already present, unchanged, since
  R5C/R5D) each gained the CSS module's `.motionSlot` marker class
  alongside their existing classes. `Section5Evidence`'s two `CropFrame`
  calls gained `motionPart="evidence"` and `motionPart="requirement"`.
- **`app/_public-r5/public-r5.module.css`** — one new custom property
  (`--r5-motion-ease`) and one new rule block (documented in full below).
- **`app/_public-r5/PublicR5Page.tsx`** — renders `<MotionController />`
  once, as the last child inside `.page`, alongside the existing header,
  main and footer.

No other file changed. No dependency was added — the controller uses only
`IntersectionObserver`, `window.matchMedia` and plain DOM attribute
mutation, all already available to any browser this codebase targets.

### Why attribute selectors plus marker classes

`data-motion-slot` and `data-motion-part` are plain HTML attributes,
already present on these elements since R5C (inert, unused, exactly per
`R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md` §7). `MotionController` targets
them directly (`document.querySelectorAll("[data-motion-slot]")`) by their
stable, unhashed names, so the controller needs no import of the CSS
module's hashed class names. CSS Modules requires every selector to
contain at least one local class ("pure" selectors); `.motionSlot` and
`.motionPart` are two-token marker classes added purely to satisfy that
constraint — they carry no declarations of their own outside the compound
selectors below. The actual targeting precision (which slot, which part,
which state) still comes entirely from the attributes.

## 3. All client boundaries

Exactly one: `MotionController`. It is a leaf client component with no
children and no props. `PublicR5Page.tsx`, `sections.tsx`,
`PublicR5Header.tsx`, `PublicR5Footer.tsx`, `CropFrame.tsx` and `content.ts`
remain server-rendered, unchanged in that respect from R5D. No section, no
scene frame, and no larger subtree was converted to a client component.
The three motion moments are owned entirely by attribute mutation on
already-server-rendered DOM nodes; nothing about their initial visibility
depends on this component ever mounting.

## 4. The three motion contracts

### Moment one — `queue-entry` (hero, `Section1Hero`)

- **Product event named:** the Queue row for PR #482 settles into its
  selected presentation, per R5B §18 moment one.
- **Complete state without motion:** the Queue rail, the selected PR #482
  row and the fully populated centre record (four-cell band, primary
  finding, evidence boundary, readiness bar) are all present in the
  server-rendered HTML, exactly as R5D transferred them. The centre record
  is never rendered active while its Queue row is absent — both come from
  the same single screenshot (`hero-workspace.jpg` / `mobile-queue.jpg`),
  so this cannot happen by construction.
- **What the whole scene wrapper does:** `.heroScene` (the element
  carrying `data-motion-slot="queue-entry"`) settles as one coherent unit —
  opacity 0→1 and `translateY(10px)→0`, 220ms, `var(--r5-motion-ease)`.
  See §8 for why the whole wrapper, not a sub-element, is what animates.
- **Fires once:** the observer unobserves the element on its first
  intersection and never re-arms it.

### Moment two — `evidence-to-requirement` (`Section5Evidence`)

- **Product event named:** evidence connects to the finding, missing proof
  becomes visible, and the linked requirement follows, per R5B §18 moment
  two, re-scoped by the R5E brief to the two genuine sequential scenes
  actually present in the accepted implementation.
- **Complete state without motion:** both `CropFrame` scenes — the
  evidence/missing-proof crop (`evidence-missing-proof.jpg`) and the
  requirement-continuation crop (`requirement-continuation.jpg`) — are
  present, stacked, and fully readable in the server-rendered HTML, exactly
  as R5C's correction pass composed them (primary full-width, secondary
  86%-width and right-aligned). Nothing about their presence or stacking
  depends on JavaScript.
- **What animates:** the parent `.evidenceScenes` wrapper
  (`data-motion-slot="evidence-to-requirement"`) is never itself animated —
  it also holds the caption and the mobile fallback scene. Only its two
  `data-motion-part` children animate independently: `evidence` enters
  first (opacity 0→1, `translateY(8px)→0`, 220ms), `requirement` follows on
  a 140ms stagger using the same duration and easing. The existing
  right-aligned, narrower secondary position already reads as
  primary-then-secondary; the stagger reinforces that relationship without
  adding a connector line, marker or new graphic. R5C's own composition
  rationale (`R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md` §13f) — "no
  connector graphic between fragments; relationship is expressed by the
  product's own labels and by vertical order" — is followed here, not
  reopened.
- **No requirement clears:** the requirement scene reveals showing
  `Idempotency proven under retry` / `blocking · open`, unchanged; nothing
  about the reveal alters its state or counts.
- **Fires once per part:** each of the two parts is a separate
  `data-motion-part`, but both are set to `armed`/`revealed` together, from
  the single intersection of their shared parent (the IntersectionObserver
  target is the slot, not the parts) — so the two-beat stagger is
  timing-only, not two independent triggers, and cannot fire out of order
  or twice.

### Moment three — `decision-surface-open` (`Section6Readiness`)

- **Product event named:** the Human Decision surface opens with no
  outcome selected, per R5B §18 moment three.
- **Complete state without motion:** the single accepted
  `human-decision-preview.jpg` crop — dimmed Queue and Inspector context,
  the four-cell band, the readiness bar, the open decision surface with all
  seven outcomes visibly unselected, the read-only sample warning, and the
  disabled `Record Human Decision` action — is present and fully legible in
  the server-rendered HTML.
- **What animates:** the whole `.readinessSceneWrap` wrapper
  (`data-motion-slot="decision-surface-open"`) settles as one unit —
  opacity 0→1, `translateY(14px)→0`, 240ms, `var(--r5-motion-ease)`. See §8
  for why this moment does not animate a separate "dimmed context settles,
  then surface opens" sequence.
- **No decision is ever recorded or implied:** the reveal only changes
  opacity/position of the existing, already-disabled, already-unselected
  scene. No outcome is selected, no submit state changes, no success state
  exists anywhere in this codebase for this scene.
- **Fires once:** same unobserve-on-first-intersection behaviour as moment
  one.

## 5. Duration and easing choices

| Moment | Property | Duration | Delay | Easing |
|---|---|---|---|---|
| One — `queue-entry` | opacity, transform | 220ms | 0ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Two — `evidence` part | opacity, transform | 220ms | 0ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Two — `requirement` part | opacity, transform | 220ms | 140ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Three — `decision-surface-open` | opacity, transform | 240ms | 0ms | `cubic-bezier(0.16, 1, 0.3, 1)` |

One coherent easing family: every moment and every part uses the same
`--r5-motion-ease` curve, a restrained deceleration with no overshoot and
no spring — a precise approximation of the "ease out" called for in
`R5A_DIRECTION_LOCK.md` §11. All durations sit inside the 180–260ms range
set by that same section and restated in `R5B_LANDING_PAGE_ARCHITECTURE.md`
§18. Translation distances are small and directionally consistent (8–14px,
vertical only) — no scale, no large transform, no property that affects
layout (`opacity` and `transform` only, both compositor-friendly and
incapable of causing layout reflow or cumulative layout shift by
construction).

## 6. Trigger thresholds

A single shared `IntersectionObserver` configuration governs all three
top-level slots: `{ threshold: 0.3, rootMargin: "0px 0px -10% 0px" }`. A
slot's entrance fires once at least 30% of it is within the viewport
(tightened slightly by the negative bottom root margin, so a slot must be
meaningfully on screen, not just brushing the viewport edge). This applies
uniformly, including to the hero: because moment one sits inside the first
viewport, its entrance typically fires very shortly after mount rather than
after a deliberate scroll — which matches R5B §18 moment one's own
framing ("after hydration and motion support are established, the already
present PR #482 row plays its settle"), while keeping the implementation
mechanism (IntersectionObserver) identical across all three moments instead
of special-casing the hero with a timer.

## 7. One-time firing behaviour

Each of the three `data-motion-slot` elements is armed once and observed
once. `MotionController`'s observer callback calls `unobserve` on a target
the instant it is seen intersecting, so a slot cannot re-arm or replay on
further scrolling, and the whole `IntersectionObserver` is disconnected
once all three owned targets have fired (or on unmount). This satisfies
both R5A §11 ("scroll triggers fire once and never on re-entry") and R5E
§11's instruction to disconnect observers after their owned moments
complete. No slot keeps a live observer running indefinitely.

## 8. Why whole-scene entrances, not per-element choreography

R5B's original description of moments one and three imagined multi-layer
choreography (a Queue row settling independently of its centre record; a
dimmed background settling before a modal opens on top of it). The accepted
implementation's scenes are, and always have been, single flat screenshots
(`hero-workspace.jpg`, `human-decision-preview.jpg`) — R5C composited
nothing and R5E is bound by the same constraint (§13 forbids compositing or
editing values inside the source images, and forbids inventing a new
product diagram). There is no DOM boundary between a "Queue row" and "its
centre record," or between "dimmed context" and "decision surface," inside
a single JPEG. Splitting either into independently animated layers would
require either editing the source image (prohibited) or fabricating an
overlay that pretends to be part of the product (also prohibited — it would
misrepresent a static screenshot as live product layering). The
implementation instead treats each of these two moments as one coherent
settle of the whole, already-complete scene, which is explicitly permitted
by the R5E brief's own phrasing ("may enter with a very small... transition
... The effect should feel like the product scene has settled into
place") and is recorded here as a deliberate, bounded interpretation rather
than a shortfall. Moment two is different only because its two scenes are
genuinely two separate source files already composed as two separate DOM
elements — that structural fact, not a difference in ambition, is why only
moment two gets independent, staggered sub-entrances.

## 9. Reduced motion behaviour

CSS is the primary contract, per the R5E brief's explicit instruction, not
a courtesy fallback:

```css
@media (prefers-reduced-motion: reduce) {
  .motionSlot[data-motion-slot][data-motion-state],
  .motionPart[data-motion-part][data-motion-state] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

This rule forces every motion-governed element to its final, fully visible,
untransformed state whenever the user has requested reduced motion — even
in the hypothetical case where `MotionController`'s own check was somehow
bypassed. It sits alongside the pre-existing page-wide rule in
`public-r5.module.css` (`transition-duration: 0.001ms !important` /
`animation-duration: 0.001ms !important` on `.page *`, unchanged from
R5C), giving two independent layers of CSS enforcement.

`MotionController` also respects `matchMedia` directly, per §8 of the R5E
brief: its effect calls `window.matchMedia("(prefers-reduced-motion:
reduce)").matches` first and returns immediately if it is `true`, before
touching any element. Under reduced motion, no slot or part is ever armed —
no `data-motion-state` attribute is ever written — so the page is,
byte-for-byte, in the same DOM state as a JavaScript-disabled visit. This
is not merely a shortened animation; no staged reveal, no positional
transition and no scroll-triggered observer callback exists in that
condition at all. Navigation and focus behaviour are untouched by this
component in every condition, reduced motion or not.

## 10. Progressive enhancement behaviour

- **No JavaScript:** every heading, paragraph, action and product scene
  renders from the server exactly as R5D transferred them.
  `data-motion-slot` / `data-motion-part` attributes exist but no
  `data-motion-state` is ever added, so no CSS rule in §9's block or the
  main motion block ever matches — the page is fully visible.
- **Slow JavaScript:** identical to the no-JS case until
  `MotionController` mounts; nothing before that point depends on it.
- **IntersectionObserver unavailable:** the effect checks `typeof
  IntersectionObserver === "undefined"` and returns before arming anything,
  so no slot is ever hidden.
- **Reduced motion enabled:** see §9.
- **An animation is interrupted** (e.g. the user navigates away or the
  element is removed mid-transition): CSS transitions have no separate
  JavaScript-owned state machine to desynchronise — the browser simply
  stops animating a removed element, and a still-present element left
  mid-transition settles at whatever `data-motion-state` was last set,
  which is always either the fully-hidden armed state (never shown to the
  user, since nothing reveals it) or the fully-visible revealed state.
  There is no partial/inconsistent resting state reachable by this design.
- **Restored through Back/Forward navigation:** this is a fully static,
  non-interactive page with no client-side route transitions or stored
  scroll/animation state; a Back/Forward restore re-runs the same mount
  sequence as a fresh load. No content is hidden by that restore in any of
  the conditions above.

## 11. Responsive adaptations

Per R5E §9's explicit mobile-simplification allowance, motion is a
desktop/tablet enhancement only. Below the existing 768px product-scene
breakpoint (the same breakpoint R5C/R5D already used for `.desktopOnly` /
`.mobileOnly` scene switching), every motion-governed element is forced to
its fully visible, untransformed resting state regardless of
`data-motion-state`:

```css
@media (max-width: 767px) {
  .motionSlot[data-motion-slot][data-motion-state],
  .motionPart[data-motion-part][data-motion-state] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

This is enforced in CSS, not by a one-time JavaScript viewport check at
mount, so it holds correctly through a resize or orientation change without
any resize listener. It was a deliberate choice: the mobile scenes are
different source images from their desktop counterparts (`mobile-queue.jpg`,
`mobile-record.jpg`), swapped in wholesale by the pre-existing
`.desktopOnly` / `.mobileOnly` rules, and no mobile-specific choreography
was invented for them — removing motion at mobile widths avoids inventing
new mobile-only motion values and avoids any risk of a mobile animation
reading slower or more cramped than its desktop counterpart, both
explicitly prohibited by R5E §9. No document-level horizontal overflow, no
clipping, no delayed mobile visibility and no layout shift were introduced
at any of the six required viewports (§14).

## 12. Accessibility treatment

Unchanged from R5D except as follows, all additive: one `<main>` landmark,
one `<h1>`, existing heading order, existing anchor semantics, existing
skip-link behaviour and existing alt text are untouched — no section,
heading, landmark or alt string was edited. `MotionController` never calls
`.focus()`, never manages an ARIA live region, and never intercepts
keyboard events; the browser's own focus order and keyboard navigation are
exactly what R5D already validated. No essential meaning exists only
through movement: every fact `data-motion-slot` / `data-motion-part`
elements ever reveal is already present, complete and readable in the
server-rendered DOM before any attribute is set — motion changes opacity
and position of already-legible content, never its presence.

## 13. Performance boundaries

No dependency, analytics, telemetry, canvas, WebGL, video background,
polling, or continuous scroll listener was added. `MotionController`
creates exactly one `IntersectionObserver` instance per mount, observing
at most three elements, and disconnects it once all three have fired or on
unmount (§7) — it never runs after that point. `will-change` is applied
only to the `armed` (pre-reveal) state of animated elements, not
permanently, so no compositor layer is held open indefinitely once a
moment has settled. No layout-affecting property (`width`, `height`,
`top`, `left`, `margin`, `padding`) is ever animated — only `opacity` and
`transform`, both handled by browser compositing without triggering layout
or paint of surrounding content, so no cumulative layout shift is possible
by construction, not merely by testing.

## 14. Route parity

Both `/` and `/visual-lab/public-r5` render the same
`app/_public-r5/PublicR5Page` tree, including the same single
`<MotionController />` instance and the same `data-motion-slot` /
`data-motion-part` markup — confirmed identical (`armed` state present
after mount, same slot/part list) on both routes in this session's browser
validation (§16). The routes continue to differ only in route-level
metadata: `/` carries `robots: { index: true, follow: true }` plus Open
Graph/Twitter tags; `/visual-lab/public-r5` carries `robots: { index:
false, follow: false, googleBot: { index: false, follow: false } }`. No
motion logic, CSS rule or client boundary is duplicated between the two
route files — both remain thin wrappers, unchanged in that respect from
R5D.

## 15. Protected scope

Not modified: `app/workspace`, `app/report`, `app/new`, `app/home`,
`app/review-operations`, `app/integrations`, `app/settings`,
`app/review-policies`, `app/team`, `app/visual-lab/workspace-r4`,
`public/r5/scenes` (no byte touched, no file renamed — confirmed by the
fetch-based content-type/status check in §16, all nine source files
unchanged from R5D), `package.json`, `package-lock.json`, any R5A or R5B
document, and any R4 documentation or source. `app/page.tsx` and
`app/visual-lab/public-r5/page.tsx` are unchanged byte-for-byte from R5D —
confirmed by `git diff` against both paths returning empty. No new section,
no new route, no new product claim and no rewritten public copy was
introduced; `content.ts` is unchanged from R5D.

## 16. Browser validation performed this session

Validated against a production build (`npm run build` then `npm run
start`) in the Browser pane:

- No console errors or warnings on `/`, `/visual-lab/public-r5`, or the
  regression check at `/workspace?source=fixture`.
- No hydration warnings.
- `document.documentElement.scrollWidth <= clientWidth` (no document-level
  horizontal overflow) confirmed at all six required viewports: 1600×1000,
  1280×800 (default), 1024×768, 768×1024, 390×844, 320×568.
- All ten unique scene image URLs (`/_next/image?url=...`) fetched HTTP 200
  with the correct `image/jpeg` or `image/png` content type — no broken
  image.
- `/` carries `<meta name="robots" content="index, follow">`;
  `/visual-lab/public-r5` carries `<meta name="robots" content="noindex,
  nofollow">`. Both render the identical `<h1>Know what is ready to
  merge.</h1>`, one `<main>`, and the same three `data-motion-slot`
  elements plus the two `data-motion-part` elements.
- Action destinations confirmed unchanged: `Open the sample review` →
  `/workspace?source=fixture` (both hero and final action), `Start a
  review` → `/new`.
- `data-motion-state` correctly stays absent until `MotionController`
  mounts, and correctly becomes `"armed"` on all three slots and both parts
  once it does, on both routes, confirming the client boundary and its
  attribute wiring function identically on both routes.
- Regression check: `/workspace?source=fixture` (protected R4 route) loads
  with no console errors, confirming this milestone did not disturb it.

### Untested / environment-limited in this session

This session's Browser pane could not composite frames, reproducing
exactly the limitation `R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md` §12 and
`R5D_PRODUCTION_HOMEPAGE_TRANSFER.md` §14/§17 already recorded for prior
milestones in this same environment: `computer` screenshot calls failed
with "the Browser pane is not displayed, so the page is not compositing
frames"; `element.scrollIntoView()` had no effect on `window.scrollY`; and,
newly confirmed this session, a bare `new IntersectionObserver(callback,
{threshold: 0}).observe(document.body)` — observing an element guaranteed
to be 100% intersecting, added directly in this session with no relation
to this milestone's code — never invoked its callback within a 2-second
wait. Directly setting `element.style.opacity` inline (which should always
win the cascade) was also not reflected by `getComputedStyle` on elements
carrying an active `data-motion-state`, while it worked normally on a
plain, unrelated `<h1>` in the same document — consistent with the same
non-compositing/non-paint-pipeline characteristic, not a defect in the
motion CSS (independently confirmed correct by direct inspection of the
built, minified stylesheet, §2, and by every selector matching the target
element via `Element.matches()`).

Given this, the following are reported as **untested**, not passed, in
this session, exactly as R5C/R5D's own precedent requires:

1. Live visual confirmation that opacity/`translateY` actually animate on
   screen (genuine screenshots or recordings could not be produced for the
   same reason R5C/R5D's could not).
2. Live confirmation that `IntersectionObserver` fires and flips a slot
   from `armed` to `revealed` in a real, painting browser in this
   environment (the mechanism was verified by code inspection and by
   confirming the observer is correctly constructed and configured; it
   could not be exercised end-to-end here because this environment's
   `IntersectionObserver` does not deliver callbacks at all, independent of
   this milestone's code).
3. Live reduced-motion emulation (no tool in this session's toolset
   emulates `prefers-reduced-motion` before a page's own `useEffect` runs;
   the CSS rule and the `matchMedia` bail-out were verified by direct
   source inspection instead).
4. Correct behaviour with JavaScript disabled and with `IntersectionObserver`
   absent (both were verified by code-path inspection — the relevant
   `useEffect` early-returns before mutating any element in both cases —
   rather than by an actual JS-disabled or API-stubbed browser session).
5. Genuine screenshots or recordings of any of the three motion moments,
   for the human review package (§`R5E_HUMAN_REVIEW_PACKAGE`).

See `R5E_HUMAN_REVIEW_PACKAGE/MANUAL_REVIEW_STEPS.md` for exact manual
verification steps a human reviewer can run in a normal, compositing
browser to close out items 1–3 above.

## 17. Known limitations

- This session's Browser pane cannot composite frames, cannot scroll, and
  its `IntersectionObserver` never delivers callbacks — see §16. This is an
  environment characteristic already documented by R5C and R5D in this same
  repository, not a defect introduced by this milestone. All motion CSS and
  controller logic were instead verified by direct inspection of the built,
  minified stylesheet and by `Element.matches()` confirming every selector
  targets the intended element.
- Moments one and three animate as single coherent scene entrances rather
  than the multi-layer choreography R5B's prose originally imagined,
  because both scenes are single flat screenshots with no internal DOM
  seam to animate independently, and neither compositing a new overlay nor
  editing the source image is permitted. This is recorded in full in §8 as
  a deliberate, bounded interpretation, not a shortfall against the R5E
  brief, which itself frames both moments in "may" language compatible with
  this reading.
- No dedicated mobile motion treatment exists (§11); mobile is deliberately
  simplified to no motion, matching R5E §9's explicit allowance and R5C's
  pre-existing observation that dedicated mobile assets for these scenes
  are limited (`R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md` §12).
- The `--r5-motion-ease` curve and the exact per-moment durations
  (200–240ms sits inside, not merely near, the 180–260ms range) are this
  milestone's own execution values, in the same sense R5C's crop
  boundaries and colour values were R5C's execution values within the R5A
  lock — they are not separately re-litigated against R5A/R5B beyond
  confirming they satisfy the stated numeric range and easing description.

## 18. Work deferred to the post-R5E visual evaluation

1. Genuine visual/recorded confirmation of all three motion moments in a
   real, compositing browser (§16), including subjective judgement of
   whether the settle/stagger timing reads as "precise, calm and
   controlled" versus merely functionally correct.
2. Human acceptance of the specific 8–14px translation distances and the
   140ms stagger, which were chosen within the accepted numeric ranges but
   not separately pixel/millisecond-accepted the way, for example, Scene
   C's crop rectangle was formally accepted in
   `R5B1_CAPTURE_MANIFEST.md`.
3. A dedicated pass, if ever wanted, confirming perceived motion "speed"
   parity across real device classes (a genuine performance/frame-rate
   concern this session's non-compositing tooling cannot measure).

## 19. R5F work intentionally deferred

Per `R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md` §10 and
`R5D_PRODUCTION_HOMEPAGE_TRANSFER.md` §16/§17, the following remain
deferred beyond R5E and are not affected by this milestone:

1. A dedicated mobile capture for Scene F (Human Decision) — R5E continues
   to reuse the single accepted `human-decision-preview.jpg` at every
   width, per R5C §12, and continues to render it without motion below
   768px (§11).
2. Formal, pixel-accepted crop boundaries for Scenes B, E, F and H, the way
   Scene C's rectangle is formally accepted in
   `R5B1_CAPTURE_MANIFEST.md`. R5E did not touch any crop rectangle.
3. A real production origin / canonical URL, deferred since R5D §5 and
   still not configured; unrelated to motion.

## 20. R5G work intentionally deferred

Per `R5B_LANDING_PAGE_ARCHITECTURE.md` §20b and
`R5A_VISUAL_CONTEXT_PACKAGE/R5A_DIRECTION_LOCK.md` §19, everything already
deferred beyond the initial homepage remains deferred and untouched by
R5E: public documentation, changelog, pricing, customer proof, an
integrations directory, governance pages, a second canonical scenario,
search, internationalisation, and a public status surface. R5E added no
fourth motion moment and no new visual language, per R5A §19's explicit
prohibition on either.

## Human visual acceptance and closeout

R5E received human visual acceptance on 2 August 2026.

A genuine 14-second desktop recording was captured from the production homepage. It includes a page reload followed by one continuous walkthrough of the three accepted motion moments:

1. Hero Queue and selected-review settlement.
2. Evidence-to-requirement progression.
3. Human Decision surface opening.

The review confirmed:

1. No visible hydration flash, reverse transition or layout jump.
2. Each motion moment fires once and settles correctly.
3. No motion changes or misrepresents product truth.
4. The Human Decision outcomes remain unselected.
5. Reduced-motion behaviour presents the complete static state.
6. Mobile retains the accepted static composition.
7. No clipping, horizontal overflow or broken product scene was observed.
8. The production route remains stable and usable throughout the sequence.

The recording is stored locally in the untracked R5E human review package as:

`recordings/01_r5e_public_motion_walkthrough_desktop.mp4`

R5E is accepted and closed. The broader visual identity and composition questions revealed during review are intentionally deferred to R5E.1.
