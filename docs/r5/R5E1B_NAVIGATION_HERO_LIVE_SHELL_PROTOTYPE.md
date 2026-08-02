# R5E.1B — Navigation, Hero and Live Shell Prototype

Branch: `r5e1b-navigation-hero-live-shell`
Status: implementation prototype at a private route. No production route, no
accepted R5 or R4 document, no R5E.1A document was modified.
Owning phase: R5E.1 — deliberate recalibration of Lintel's public visual
identity, composition and interactive product storytelling.

R5E.1A is accepted and closed
(`docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`, human acceptance recorded
2 August 2026). R5E.1B is the first private implementation slice governed by
that lock, per `docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md` §2.

This is not the complete recalibrated homepage. It proves ten things and
defers the rest to R5E.1C–F.

---

## 1. Purpose and scope

R5E.1B proves:

1. one continuous white public canvas;
2. the final compact navigation direction;
3. a left-aligned product-led hero;
4. a large live HTML Lintel product stage;
5. one stable Rail, Queue, Workspace and Inspector shell;
6. truthful PR #482 selection;
7. Workspace overview;
8. first finding focus;
9. the initial verification-spine treatment;
10. deliberate desktop and mobile compositions.

It does not build Evidence, Missing proof, Requirement, Affected context,
Readiness or Human Decision interaction; the complete guided scroll journey;
or any change to the production homepage, the accepted R5 implementation, or
the frozen R4 product.

---

## 2. Authoritative inputs

Read before implementation, in this order:

1. `docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
2. `docs/r5/R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md`
3. `docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
4. `docs/r5/R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`
5. `docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md`
6. `docs/r5/README.md`
7. `docs/r4/R4A_WORKSPACE_SHELL_CONTRACT.md`
8. `docs/r4/R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md`
9. `docs/r4/R4B_RESPONSIVE_KEYBOARD_FOCUS.md`
10. `lib/workspace-v2/fixture-adapter.ts` (frozen canonical fixture, case482)
11. `app/workspace/workspace-r4.module.css` (frozen product token values)
12. `app/_public-r5/**` (read only, to confirm protected scope and the
    existing implementation pattern for a shared private-folder page)

No broad repository audit was conducted. No R5E.1A or earlier accepted R5/R4
document was edited.

---

## 3. Private route and implementation architecture

Route: `/visual-lab/public-r5-recalibrated`
(`app/visual-lab/public-r5-recalibrated/page.tsx`), `noindex, nofollow`, not
registered in navigation, not in a sitemap, not imported by any production
route.

The route is a thin metadata and rendering wrapper, following the
`app/_public-r5` / `app/visual-lab/public-r5` precedent. All implementation
lives in the non-route folder `app/_public-r5-recalibrated/`:

```
app/_public-r5-recalibrated/
  R5RecalibratedPrototype.tsx      page composition (server component)
  canonical-review.ts              typed, read-only canonical data module
  demo-reducer.ts                  limited prototype state model
  prototype-content.ts             nav/hero/trust/footer copy
  public-r5-recalibrated.module.css
  components/
    PublicPrototypeHeader.tsx      sticky header (small client boundary)
    LiveReviewStage.tsx            the one client-owned product stage
    GlobalRail.tsx
    ReviewQueue.tsx
    VerificationWorkspace.tsx
    ContextualInspector.tsx
    VerificationSpine.tsx
```

`app/page.tsx`, `app/_public-r5/**` and `app/visual-lab/public-r5/**` were
not read for editing purposes beyond confirming protected scope, and were
not modified.

---

## 4. Canonical data source

`canonical-review.ts` is the one typed, read-only module owning every PR #482
value the prototype renders (`docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
§8a). It is a distinct module from `app/_public-r5/content.ts` — that file is
not edited by any R5E.1 phase — but follows the same shape and was
cross-checked against it.

Cross-check performed against `lib/workspace-v2/fixture-adapter.ts`
(`case482`) on 2026-08-02: repository, PR number, title, branch, head,
recommendation, risk, confidence, requirements, Human Decision, the primary
finding (`finding_retry_idempotency`) and its two supporting evidence
records (`ev_retry_path` confirmed, `ev_no_idempotency_key` present), the
evidence-boundary sentence (5 records, 2 missing/unverified, 1 stale — this
matches `ev_coverage_gap` missing, `ev_error_shape_inferred` unverified,
`ev_prior_load_test` stale), and the two inert Queue context rows
(`case489`, `case471`, values taken verbatim). No disagreement was found; no
value in `canonical-review.ts` was corrected against the fixture.

No sequential identifier scheme is invented. The only identifiers shown are
the genuine stage numbers `01`–`08` and the fixture's own internal keys
(`finding_retry_idempotency`, `ev_retry_path`, …), used as state keys and, in
the finding panel, as content only where the frozen product itself would
show that class of information (evidence titles and status words).

---

## 5. White canvas and visual system

The page background, header, footer and all major sections are `#FFFFFF`.
No full-width charcoal section, coloured band, gradient, sky field, tinted
canvas, glass/blur identity or decorative dark reset exists anywhere.

Two token families in `public-r5-recalibrated.module.css`, per
`docs/r5/R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §2:

- `--pub-*` for chrome outside the demonstration (header, footer, hero and
  section copy, actions) — the provisional public registry values from
  §2a (`#FFFFFF` canvas, `#FAFAF9` secondary, `#F3F3F1` selected,
  `#E1E1DE`/`#ECECEA` dividers, `#181818`/`#6E6E6A`/`#8A8A85` text).
- `--prod-*` inside the live stage — copied verbatim from
  `app/workspace/workspace-r4.module.css` (`#ffffff`, `#fafaf9`, `#eeeeec`,
  `#f1f1ef`, `#dededc`, `#eaeae8`, `#1c1c1c`, `#656565`, `#767676`,
  `#8a8a8a`, focus `#2563eb`, warning `#94600a`/`#fff7e3`, blocking
  `#b42318`/`#fff0ed`, success `#2f855a`, observed `#2563eb`).

Tertiary text (`--pub-text-3` / `--prod-text-3`) carries only supplementary
metadata (file paths, provenance identity) and never the sole carrier of an
essential fact — every essential value (recommendation, risk, requirements,
Human Decision, finding title/statement, evidence status) is set in primary
or secondary-weighted text.

Selection carries a non-colour cue everywhere it appears: the selected PR
row and the selected finding/evidence emphasis use the product's own
`box-shadow: inset 3px 0 var(--prod-text)` structural marker (copied from
`workspace-r4.module.css`'s own `queueRowSelected`/`recordSelected`
pattern) plus an explicit text label (`Selected · inspectable in this
sample`, `SELECTED REVIEW · READ-ONLY SAMPLE`), never the quiet fill alone.

Typography: Geist Sans for headlines/body/interface copy via the
`--font-geist` variable already registered on `<html>`; Geist Mono
(`--font-geist-mono`) restricted to provenance (`Head 9c41af2 · fix/…`),
file paths, and the spine's stage numbers/compact counter — never headlines,
body prose or button labels.

Zero new images. The live HTML stage is the page's only visual system in
this phase.

---

## 6. Public grid

`.wrap` constrains header, hero and section content to a 1280px max width
with 32px side padding (20px under 768px). The live stage shares the same
container and, at 1280px, fills it edge to edge, giving it the widest
measure on the page as required. Hero copy is capped at a 60-character
reading measure (`max-width: 60ch`). No centred slide-deck composition, no
repeated card grid, no decorative floating window exists.

---

## 7. Navigation

Header (`PublicPrototypeHeader.tsx`): `Lintel` · `Product` `How it works`
`Trust` · `Open the sample review`, matching
`R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §2 exactly. Destinations:

| Item | Destination |
|---|---|
| `Lintel` | `/visual-lab/public-r5-recalibrated` (this prototype's own root — the production `/` was not touched, so the identity link stays inside the prototype rather than leaving it silently) |
| `Product` | `#product` (the hero + live stage section) |
| `How it works` | `#how-it-works` |
| `Trust` | `#trust` |
| `Open the sample review` | `/workspace?source=fixture` |

`Start a review` → `/new` appears only in the hero and the closeout area, not
in primary navigation, per the contract.

Header: white, 62px (`--header-h`, inside the 60–64px range), sticky, a fine
lower border that fades in via `border-bottom-color` transition (transparent
→ `--pub-border`) with no other box dimension changing — height, padding and
control sizes are identical scrolled and unscrolled, verified in the browser
by scrolling the live stage into sticky range and confirming layout does not
shift. Active-section indication is `aria-current="true"` set by an
`IntersectionObserver` (not a scroll listener) in a small client boundary; it
never moves focus and never announces. Below 767px the three anchor labels
are omitted, identity and a shortened `Open sample` action remain (full
`Open the sample review` accessible name preserved via the anchor's
`aria-label`), and no hamburger menu was added.

Footer: white, identity, one trust/brand line, the same three anchors,
primary/secondary actions, and a legal line. No newsletter, no invented
destination.

---

## 8. Hero

Left-aligned. Headline `Know what is ready to merge.` and trust line
`Deterministic by default. Model assistance is optional. The engineer
decides.` are unchanged verbatim, per
`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §10. Primary action `Open the sample
review` → `/workspace?source=fixture`; secondary action `Start a review` →
`/new`. The live product stage sits immediately beneath the hero copy inside
the same `#product` section — it is the hero's primary visual object, not a
screenshot behind or inside it.

---

## 9. Stable live shell

`LiveReviewStage.tsx` is the one small client-owned product stage
(`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §13). It renders the four-region
hierarchy `Global Rail → Review Queue → Verification Workspace → Contextual
Inspector` at the public-stage ranges from §6: Rail 44–48px, Queue 200–240px,
Workspace flexible/dominant, Inspector 290–320px, narrowing at 1279px and
reflowing to a stacked contextual panel below the Workspace at 1023px (Queue
spans both grid rows; verified in the browser: `grid-template-areas: "rail
queue workspace" "rail queue inspector"` at 1024×768/768×1024, no overflow).

Because `LiveReviewStage` is a Next.js client component, it is still
server-rendered: its initial markup — PR #482 selected, Overview resolved,
all values legible — exists and is correct without JavaScript, and
interaction is progressive enhancement over that resting state
(`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §8b).

Across every state exercised in this phase, the application frame stays
stable and the seven canonical values never change: PR #482 remains
selected, `Tests required`, `46/100 · MEDIUM`, `4 open · 2 blocking`, and
`PENDING` render identically in the "queue", "overview" and "finding"
states.

---

## 10. Global Rail

`GlobalRail.tsx` shows the five R4A areas (Reviews, Operations, Governance,
Integrations, System) as `aria-hidden` decorative markers; only `Reviews`
carries a non-colour active marker (filled surface + border). None of the
five is a link, button or otherwise focusable/interactive — there is nowhere
in this prototype for any of them to navigate to, so none pretends to.

---

## 11. Review Queue

`ReviewQueue.tsx`: PR #482 is a real `<button aria-pressed="true">` carrying
repository, PR number, title, recommendation, risk and requirements summary,
plus the `Selected · inspectable in this sample` text cue. Activating it
dispatches `SELECT_REVIEW`, returning the Workspace/Inspector to the
"queue" resting content — verified in the browser (click → page text
reverted to the initial Overview/"Next inspection" pairing).

Two inert context rows (`case489`, `case471`, genuine fixture titles/values)
render as plain, non-interactive list items, `aria-hidden="true"`, with no
button or link semantics and reduced visual weight — confirmed absent from
the `read_page` interactive-element listing.

Server-rendered initial state already shows PR #482 selected; there is no
post-hydration reselection.

---

## 12. Workspace Overview

`VerificationWorkspace.tsx`'s `OverviewPanel` communicates, in the
server-rendered resting state: selected repository/PR/title, the four-cell
summary band (recommendation, risk, requirements, Human Decision), the
primary finding summary, the "Next inspection" banner
(`Provider failure cases absent from test suite`), the evidence-boundary
sentence, and an `Inspect finding` control. The `SELECTED REVIEW ·
READ-ONLY SAMPLE` label states the read-only boundary explicitly. Real
product vocabulary is used throughout; nothing is rendered as a generic
SaaS card.

---

## 13. Finding focus

Activating `Inspect finding` (or the spine's `02 Finding` control) dispatches
`FOCUS_FINDING` with the canonical `finding_retry_idempotency` key. Verified
in the browser: the shell frame is unchanged; the Workspace swaps to the
finding's title, full statement, file location and its two supporting
evidence rows with genuine status words (`confirmed`, `present`); the
Inspector swaps to finding detail (provenance, affected surface, related
requirement, evidence count, provenance identity); the four-cell band is
unchanged; no evidence or requirement stage was opened; nothing appears
newly generated or resolved. `Back to overview` returns to the Overview
panel via `SHOW_OVERVIEW`, restoring the Overview's own Inspector content
(distinct from the initial "queue" Inspector — see §9's state-to-surface
notes below).

---

## 14. Verification spine

`VerificationSpine.tsx` renders all eight product stages
(`01 Change` … `08 Human Decision`) with their genuine names. Only `01` and
`02` are semantic `<button>`s with `aria-pressed` reflecting the active
stage (verified via computed `aria-pressed` values: `01` → `false`, `02` →
`true` after focusing the finding, and the reverse after `Back to
overview`); stages `03`–`08` render as plain, non-interactive list content —
confirmed absent from the interactive-element listing. No completion tick,
no green, no checkout-stepper affordance exists. A compact `NN of 08 ·
<Stage name>` label (CSS-only swap, `display:none`/`block` by breakpoint,
same server-rendered DOM) replaces the full spine below 767px, matching the
typography lock's compact-counter pattern; the Overview/Finding controls
inside the Workspace itself remain the primary interactive path on mobile,
so the mobile compact spine is orientation, not the only way to act.

---

## 15. Interaction and motion

`demo-reducer.ts` implements the full typed `DemoState`/`DemoEvent` shape
from `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §4, restricted in this
phase to the four required events — `SELECT_REVIEW`, `SHOW_OVERVIEW`,
`FOCUS_FINDING`, `RESET_DEMO` — all sourced `"manual"` (no guided scroll
choreography exists yet; that is R5E.1C). `RESET_DEMO` returns to the exact
initial state and is exposed as a small `Reset sample` control in the stage
footer, verified to restore the "queue" Overview content.

Motion in this phase is limited to local CSS transitions on hover/focus
states and the header's border-colour fade; no whole-stage entrance
animation, no parallax, no bounce/spring, no autoplay, no layout-dimension
animation. `@media (prefers-reduced-motion: reduce)` collapses all
transition/animation durations to effectively zero; the rule's presence in
the compiled stylesheet was confirmed via `document.styleSheets`
inspection. Because there is no motion-dependent reveal anywhere (every
panel swap is an immediate DOM/content change, not an opacity/position
transition), the reduced-motion contract is satisfied by construction, not
only by the media query.

A single `aria-live="polite"` region announces the active record only after
a manual `FOCUS_FINDING`/`SHOW_OVERVIEW` activation (verified: "Finding
focused: Retry behaviour may create duplicate redemption risk" / "Overview
shown" appeared in `get_page_text` after each interaction); there is no
guided-scroll announcement to suppress in this phase.

---

## 16. Responsive behaviour

Browser-validated at all six required viewports, production build,
`document.documentElement.scrollWidth <= clientWidth` confirmed at each:

| Viewport | Result |
|---|---|
| 1600×1000 | No overflow (1585×1585 reported by the browser's inner content box). Full four-region grid. |
| 1280×800 | No overflow (1265×1265). Full four-region grid. |
| 1024×768 | No overflow (1009×1009). Four-region grid, Inspector at its narrower range. |
| 768×1024 | No overflow (753×753). Grid reflows to `rail / queue / workspace` + `rail / queue / inspector`, Queue spanning both rows, Inspector as a stacked contextual panel. |
| 390×844 | No overflow (390×390). Sequential stack: Rail hidden, Queue → Workspace → Inspector → compact spine, in document order. |
| 320×568 | No overflow (320×320). Same sequential composition, confirmed via `get_page_text`. |

Mobile is not a scaled desktop shell: the Global Rail is `display:none`
(decorative only, no information loss), the four-column grid becomes a
column flex stack, and the eight-item spine is replaced by the compact `NN
of 08` label. `Inspect finding`, `Back to overview` and the PR #482 Queue row
remain real, working controls at every width.

---

## 17. Accessibility

Verified in the browser (production build):

- Exactly one `<main>`, exactly one `<h1>` (`document.querySelectorAll`
  counts = 1/1).
- Logical heading order: `h1` (hero) → `h2` (How it works) → `h2` (Trust).
- Skip link (`Skip to content` → `#main`) is the first focusable element on
  a fresh page load, confirmed via `document.activeElement` after one `Tab`
  press from a clean navigation.
- PR #482 row, `Inspect finding`, `Back to overview`, the two interactive
  spine stages and `Reset sample` are semantic `<button>`s; all destinations
  are native `<a>` elements.
- `aria-pressed` on the PR row and the two interactive spine buttons
  reflects true state and was confirmed programmatically.
- No fake control appears in the accessibility tree: the `read_page`
  interactive-element listing contains exactly the working controls (nav
  links, hero/footer actions, the PR row, `Inspect finding`/`Back to
  overview`, the two spine buttons, `Reset sample`) and none of the inert
  Rail areas, inert Queue context rows, or non-interactive spine stages.
- Active nav-section state is exposed via `aria-current`, not colour alone;
  selection is exposed via a structural marker plus text, not fill alone.
- Anchor targets (`#product`, `#how-it-works`, `#trust`) carry
  `scroll-margin-top: var(--header-h)` so the sticky header does not obscure
  them.
- No document-level arrow-key handling was added (none exists in this
  phase's controls).
- `prefers-reduced-motion: reduce` rule confirmed present in the compiled
  stylesheet.

Not exercised by this environment (see §21 Known limitations): a live
screen-reader pass, and OS-level `prefers-reduced-motion` emulation (the
Browser pane has no control for it; the CSS rule's presence and the
motion-free interaction model were verified instead, as described in §15).

---

## 18. Progressive enhancement

Confirmed by design and by reading the server-rendered HTML: every fact the
prototype shows in any interactive state (recommendation, risk,
requirements, Human Decision, the primary finding's full statement and
file, its two evidence records, the related requirement) already exists in
`canonical-review.ts` and is present in the initial server-rendered
"queue"/Overview markup or in the server-rendered "How it works"/"Trust"
section copy. `LiveReviewStage` is a client component but is still
server-rendered by Next.js, so its resting state requires no JavaScript to
be complete and truthful; only the three interactive transitions
(`SELECT_REVIEW`, `SHOW_OVERVIEW`/`Inspect finding`↔`FOCUS_FINDING`,
`RESET_DEMO`) are JavaScript-only, and none of them reveals a previously
hidden fact.

---

## 19. Performance and stability

No dependency and no lockfile change (`git diff -- package.json
package-lock.json pnpm-lock.yaml yarn.lock` empty). No `localStorage`,
`fetch`, `XMLHttpRequest`, analytics or telemetry call exists anywhere in
`app/_public-r5-recalibrated/**`; `read_network_requests` during the browser
session showed only same-origin static asset requests
(`_next/static/**`). The header's active-section tracking uses
`IntersectionObserver`, not a scroll listener. No layout-dimension
animation, no measured layout loop, no cumulative layout shift was observed
across the "queue" → "overview" → "finding" → "queue" interaction sequence
(the shell's grid dimensions do not change; only inner panel content
swaps).

---

## 20. Route and product truth

`example/b2b-redemption-api` · PR `#482` · `Add fallback handling for failed
discount-code retrieval` · `Tests required` · `46/100 · MEDIUM` · `4 open ·
2 blocking` · `PENDING` render identically across every state and viewport
exercised. No evidence, missing-proof, requirement, affected-context,
readiness or Human Decision state was built. No control exists for an
action this prototype cannot truthfully perform — the two inert Queue rows
carry no button/link semantics, and stages `03`–`08` of the spine are not
styled or exposed as controls. Nothing calls a model, creates a review,
records a Human Decision, or performs an external write.

---

## 21. Browser validation

Production build (`next build` then `next start`), Browser pane, `noindex`
route:

| Check | Result |
|---|---|
| `/visual-lab/public-r5-recalibrated` loads, no console error | Pass |
| `robots` meta = `noindex, nofollow` | Pass (confirmed via DOM query) |
| One `<main>`, one `<h1>` | Pass |
| Navigation destinations correct | Pass |
| Anchor scroll-margin present | Pass (CSS confirmed) |
| Sticky header, no layout movement | Pass (dimensions unchanged; only border-colour transitions) |
| Initial PR #482 selection, server-rendered | Pass (confirmed pre-interaction `get_page_text`) |
| Overview interaction | Pass |
| Finding interaction | Pass |
| Return to Overview | Pass |
| Keyboard activation (Tab to skip link, click-equivalent activation of all controls) | Pass |
| Visible focus | Present via the shared `:focus-visible` outline rule (not independently screenshot-verified — see §22 limitations) |
| Reduced motion | CSS rule confirmed present; OS-level emulation untested (see §22) |
| No hydration warning, no console error | Pass at every viewport and after every interaction |
| No broken asset | Pass (`read_network_requests` all 200 OK) |
| No horizontal overflow, all six viewports | Pass (`scrollWidth === clientWidth` at each) |
| No layout shift from state changes | Pass by construction (fixed shell grid, verified qualitatively) |
| No fake control in tab order | Pass (`read_page` interactive listing matches the intended control set exactly) |
| No external write or request | Pass (`read_network_requests` same-origin only) |
| Regression: `/` | Pass, no console error |
| Regression: `/visual-lab/public-r5` | Pass, no console error |
| Regression: `/workspace?source=fixture` | Pass, no console error |
| Regression: `/new` | Pass, no console error |
| Reload behaviour | Pass (re-navigated mid-session; resting state identical) |

Untested in this environment: full visual screenshot capture (the Browser
pane could not composite frames — the same limitation recorded by R5C §12,
R5D §14 and R5E §16) and a live screen-reader pass. Both are recorded as
untested, not passed; see §22.

---

## 22. Known limitations

1. The Browser pane could not composite frames in this session, so no pixel
   screenshot was captured — the same limitation `R5C_HUMAN_REVIEW_PACKAGE`,
   `R5D_HUMAN_REVIEW_PACKAGE` and `R5E_HUMAN_REVIEW_PACKAGE` already recorded
   for the prior three milestones' sessions in this repository, not a defect
   in this implementation. A bare, unrelated `IntersectionObserver` observing
   `document.body` (guaranteed 100% intersecting) was tested directly in this
   session and never delivered a callback within a two-second wait,
   confirming the same root cause R5E's package named. All checks above were
   performed instead via `get_page_text`, `read_page` (accessibility-tree),
   `read_console_messages`, `read_network_requests` and `javascript_tool`
   DOM/CSS/computed-style inspection, which verify content, structure, ARIA
   state and computed layout dimensions but not final visual rendering or
   IntersectionObserver-driven behaviour. Practical consequence for this
   milestone: `PublicPrototypeHeader`'s `aria-current` active-section
   indication (§7) is implemented correctly and is confirmed present in the
   compiled bundle, but could not be observed actually firing in this
   session — it degrades gracefully (the header remains fully usable and
   every destination still resolves without it) and should be confirmed in a
   real, compositing browser before formal acceptance, alongside a direct
   visual check of typography, spacing and colour.
2. `prefers-reduced-motion: reduce` was confirmed present as a CSS rule and
   the interaction model was confirmed to be motion-free by construction,
   but OS-level emulation of the media feature was not available in this
   environment to confirm end to end.
3. No live screen-reader pass (NVDA/VoiceOver) was performed; the
   accessibility-tree and keyboard checks above are a proxy, not a
   substitute.
4. The full keyboard model from
   `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §6a (composite roving focus
   for verification stages, `Escape` semantics, dialog focus containment)
   is out of scope for R5E.1B and is not implemented — there is no dialog in
   this phase, and the two interactive spine stages are two independent tab
   stops rather than a roving-focus composite, which is acceptable at this
   scale and will be revisited if R5E.1C's larger stage set warrants it.

---

## 23. Work intentionally deferred to R5E.1C

Per `R5E1A_IMPLEMENTATION_HANDOFF.md` §3: Evidence, Missing proof,
Requirement, Affected context and Readiness states; guided
`IntersectionObserver`-driven scroll advancement and the manual-precedence
coordination layer; the `Resume guided tour` / `Replay` affordance; the full
verification-spine keyboard model (§6a); complete reduced-motion validation
with a second `matchMedia` layer; movements two and three of the five-part
page composition. R5E.1D adds readiness, both Human Decision surfaces, and
the trust/unresolved-case handoff. R5E.1E assembles the accepted prototypes
into one complete private laboratory. R5E.1F reviews and freezes the
direction and decides on any production transfer.

---

## 24. Acceptance evidence

- `npx tsc --noEmit` — passes, no output.
- `npm run build` — passes; `/visual-lab/public-r5-recalibrated` is
  generated as a static route.
- `git diff --check` — passes, no output.
- `git status --short` — shows only new untracked files under
  `app/_public-r5-recalibrated/`, `app/visual-lab/public-r5-recalibrated/`,
  this document, the README update, and the untracked human review package;
  nothing staged.
- `git diff` against `package.json`, lockfiles, `app/page.tsx`,
  `app/_public-r5`, `app/visual-lab/public-r5`, `app/workspace`,
  `app/report`, `app/new`, `app/home`, `app/review-operations`,
  `app/integrations`, `app/settings`, `app/review-policies`, `app/team`,
  `app/visual-lab/workspace-r4`, `public/r5/scenes` — every path empty.
- `next-env.d.ts` and `tsconfig.tsbuildinfo` restored to their exact
  preflight SHA-256 hashes after validation.
- Browser validation per §21, production build, all six required
  viewports, four regression routes.
- `R5E1B_HUMAN_REVIEW_PACKAGE/` created untracked at the repository root.

R5E.1B implementation is complete and ready for human visual review. It is
not self-accepting: formal acceptance follows the same human review process
as R5C/R5D/R5E.

## Human visual acceptance and closeout

R5E.1B received human visual acceptance on 2 August 2026.

The review confirmed:

1. The continuous white canvas feels deliberate and coherent.
2. The left-aligned hero is more product-led than the previous centred composition.
3. The compact navigation is clear and complete without invented menus.
4. The live HTML stage is visually dominant and readable.
5. PR #482 is selected truthfully from the initial server-rendered state.
6. Overview and Finding behave as two states of one stable Lintel product shell.
7. The Rail, Queue, Workspace and Inspector hierarchy remains recognisably Lintel.
8. The initial verification spine communicates traceability without implying completion.
9. Mobile uses a deliberate sequential composition rather than a compressed desktop shell.
10. The result is strong enough to proceed into the deeper verification journey.

Human evidence is stored locally in the untracked R5E1B human review package.

R5E.1B is accepted and closed.
