# R5E.1E.1 — Public Identity, Composition and Interaction Polish

Branch: `r5e1e1-public-identity-polish`
Status: bounded complete-page polish at the same private route. No production
route, no accepted R5 or R4 document, no R5E.1A–E document was modified.
Owning phase: R5E.1 — deliberate recalibration of Lintel's public visual
identity, composition and interactive product storytelling.

R5E.1A–E are accepted, committed, merged and closed. R5E.1E's own human
acceptance (`docs/r5/R5E1E_FULL_PRIVATE_PUBLIC_ASSEMBLY.md`, recorded
3 August 2026) named a bounded set of complete-page findings and assigned
them to this milestone. R5E.1E.1 addresses only those findings, at the same
private route, `/visual-lab/public-r5-recalibrated`.

---

## 1. Purpose and bounded scope

The accepted private recalibrated experience already reads as one continuous
Lintel investigation — selected review → verification gap → follow the
verification record → accountable decision → trust and continuation. R5E.1E's
own review found the assembly sound but identified nine complete-page
composition and interaction items that only became visible once the whole
page was judged as a continuous experience rather than as incremental
prototype slices:

1. Nested-scroll and scrollbar refinement.
2. Guided narrative pacing and sticky-shell release.
3. Verification-spine legibility.
4. Live-shell density and active-record hierarchy.
5. Stronger visual separation between the guided Human Decision preview and
   the manually opened dialog.
6. Removal of internal roadmap language from public Trust copy.
7. Handoff and footer deduplication.
8. Final vertical-rhythm refinement.
9. Minor navigation and first-viewport polish where supported by evidence.

This milestone addresses exactly these nine items. It does not redesign the
page, change the five-movement architecture, replace the live HTML product
system, change canonical product truth, modify the production homepage,
modify the frozen R4 product, add a dependency, or begin the R5E.1F freeze.

---

## 2. Preflight

Confirmed before any edit:

1. Branch: `r5e1e1-public-identity-polish`.
2. `git status --short` showed only the nine pre-existing untracked
   human-review/context packages; nothing staged.
3. `git log --oneline -10` showed R5E.1E's merge and feature commits at the
   head.
4. `git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock` —
   empty.
5. `git diff -- app/page.tsx` — empty.
6. `git diff -- app/_public-r5` — empty.
7. `git diff -- app/visual-lab/public-r5` — empty.
8. `git diff -- app/workspace app/report app/new` — empty.
9. `git diff -- public/r5/scenes` — empty.
10. `git diff -- .claude/launch.json` — empty.
11. `app/_public-r5-recalibrated/**` and
    `app/visual-lab/public-r5-recalibrated/page.tsx` present, matching the
    R5E.1E acceptance record.

Preflight SHA-256 hashes recorded before any change:

- `next-env.d.ts`: `4e4da12aa061aac172fb1bcb48e9b6e4b293080d2f494327925fdba8f39632a`
- `tsconfig.tsbuildinfo`: `6882f72e36c3a9a6bbcae2d1c03fa5d303cbefe23decfe4cbd5cab34ca72be8`

Both were regenerated during `tsc`/`next build` validation, as they always
are, and restored via `git checkout -- next-env.d.ts tsconfig.tsbuildinfo`
after validation — confirmed identical to the preflight hashes above.

---

## 3. Files changed

| File | Change |
|---|---|
| `app/_public-r5-recalibrated/prototype-content.ts` | `TRUST_BOUNDARY.supporting` reworded to remove internal-roadmap language; `CLOSEOUT` lost its unused `headline` field and its `supporting` line was reworded to a concise, non-repeating purpose statement |
| `app/_public-r5-recalibrated/R5RecalibratedPrototype.tsx` | Footer no longer renders the primary/secondary action buttons (deduplicated against the handoff card immediately above it); top-of-file doc comment extended to record this milestone |
| `app/_public-r5-recalibrated/components/LiveReviewStage.tsx` | Guided `IntersectionObserver` trigger band (`rootMargin`) retuned from `-35% 0px -55% 0px` to `-45% 0px -35% 0px` |
| `app/_public-r5-recalibrated/components/VerificationWorkspace.tsx` | The finding-severity tag in `OverviewPanel`/`FindingPanel` now carries its own class (`findingSeverityTag`) instead of inheriting the shared `findingMeta` alarm-red colour |
| `app/_public-r5-recalibrated/public-r5-recalibrated.module.css` | Nested-scroll/scrollbar treatment; sticky offset and narrative padding; verification-spine legibility; guided-preview/manual-dialog elevation differentiation; `findingMeta`/`findingSeverityTag` split — see §4–§10 below for the specific rules |

No component was added or removed. No canonical value, event, state field,
route, or dependency changed. `canonical-review.ts`, `demo-reducer.ts`,
`VerificationSpine.tsx` (markup, not CSS), `VerificationJourneyNarrative.tsx`,
`HumanDecisionSurface.tsx`, `ContextualInspector.tsx`, `GlobalRail.tsx`,
`ReviewQueue.tsx`, `PublicPrototypeHeader.tsx`, and
`app/visual-lab/public-r5-recalibrated/page.tsx` are byte-for-byte unchanged
from R5E.1E.

---

## 4. Nested-scroll ownership and scrollbar refinement

Per-region overflow ownership at desktop widths (`.stageGrid` height raised
from 560px to 580px, which reduces how often the Workspace column needs to
scroll at all in the common case):

| Region | Overflow behaviour | Rationale |
|---|---|---|
| Queue | `overflow-y: auto`, rarely triggers | Content is a single selected-review card plus two inert context rows — well under the shell's height in every state exercised |
| Workspace | `overflow-y: auto`, the primary owner | The only region whose content height varies enough across states (Missing proof, Readiness) to occasionally need its own scroll |
| Inspector | `overflow-y: auto`, rarely triggers | Each stage's Inspector column is four to five short rows, comfortably under the shell height |

All three keep `overflow-y: auto` rather than `hidden` — removing scroll
capability would conceal genuinely overflowing content at high zoom or with
browser-level text scaling, which the task brief explicitly forbids. Instead,
every internal scrollbar shares one restrained, thin, low-contrast treatment
(`scrollbar-width: thin` plus `::-webkit-scrollbar` rules using the shell's
own `--prod-border` token on a transparent track) so that even in the rare
case more than one region scrolls at once, none of them visually competes
with the page's own scrollbar or with each other. Confirmed live: a `div`
with `scrollbar-width: thin` resolves for the Queue column in the production
build.

No wheel hijacking, no `overflow-x` restriction, and no JavaScript layout
measurement was introduced — this is a CSS-only refinement.

---

## 5. Guided narrative pacing and sticky-shell release

The R5E.1E review recorded that narrative headings could "enter beneath or
too close to" the sticky live stage. Two independent adjustments:

1. **Trigger band.** The guided `IntersectionObserver`'s `rootMargin` in
   `LiveReviewStage.tsx` moved from `-35% 0px -55% 0px` to
   `-45% 0px -35% 0px`. At ≥1024px the shell itself occupies roughly the top
   half of the viewport while pinned, so the original band — centred on the
   full viewport — was misaligned with the space actually visible below the
   shell. The retuned band sits lower and is proportionally wider, closer to
   the space genuinely available for the narrative once the shell's own
   height is accounted for.
2. **Narrative spacing.** `.journeyNarrative`'s `padding-top` increased from
   40px to 64px, giving the first heading clear breathing room below the
   shell's bottom edge instead of starting flush against it. A new
   `padding-bottom: 32px` gives the final (Human Decision) narrative block
   room to settle before `.journeyColumn` ends and the sticky shell releases
   into the Trust section, so the release reads as a deliberate stop.
3. **Sticky offset.** `.stageSticky`'s `top` offset reduced from
   `calc(var(--header-h) + 16px)` to `calc(var(--header-h) + 12px)`,
   reclaiming a few pixels of vertical space for the narrative without
   touching the header's own no-layout-movement contract.

No stage order, trigger technique (still one `IntersectionObserver`, no
scroll listener), min-height, or dwell-time value changed — this addresses
the reported spacing/alignment defect specifically, not the pacing model.

### 5a. Environment limitation, honestly recorded

As every R5E.1 implementation phase before this one recorded (R5E.1B §22,
R5E.1C §29, R5E.1D §28, R5E.1E §30), this session's Browser pane cannot
composite frames and does not deliver `IntersectionObserver` callbacks. The
retuned trigger band could not be exercised end-to-end via real scroll in
this session. It was verified instead by: (1) confirming the observer's
`rootMargin` value is compiled into the running bundle by reading the source
of `LiveReviewStage.tsx` in the production build's behaviour (the manual
dispatch path that shares the same `eventForWorkingStage` helper was
exercised live and worked correctly, §9); and (2) reasoning from the shell's
own measured height (580px) and the sticky offset against typical viewport
heights at the required desktop breakpoints. This should be confirmed by
scrolling through the guided journey in a real, compositing browser before
formal acceptance.

---

## 6. Verification-spine refinements

| Change | Before | After | Reason |
|---|---|---|---|
| Inactive stage number colour | `--prod-text-3` (~3.5:1, fails AA) | `--prod-text-2` (~4.5:1) | The stage number is structural wayfinding a visitor reads while scanning the spine, not decorative filler — `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §2c reserves sub-AA tertiary text for non-essential content |
| `Pending` tag colour | `--prod-text-3` | `--prod-text-2` | Same reasoning: "Pending" is a status word, not decoration |
| Active item | border-top colour step only | border-top colour step **plus** a quiet `--prod-selected` background fill and a bolder (700) stage-name weight | Gives the active stage a clearer, still non-colour-only hierarchy over its seven neighbours, matching the same quiet-fill-plus-structural-marker pattern already used for the selected Queue row |
| Item spacing | `gap: 2px` between items, `8px 10px` padding | `gap: 4px`, `10px 12px` padding | More legible separation between the eight stage buttons |

No completion tick, no green, no progress percentage, no glowing line, and no
checkout-style treatment were introduced — the spine still reads as a record
of stages, not a stepper. `08 Human Decision` still renders permanently
`Pending`, never complete. Confirmed live in the production build: the active
spine item's background resolves to `rgb(238, 238, 236)` (`--prod-selected`)
and its border-top to `rgb(28, 28, 28)` (`--prod-text`).

---

## 7. Live-shell density edits

The Finding panel's metadata row (`.findingMeta`) previously coloured every
tag inside it — severity, category, and (in the Finding panel) provenance —
with the same alarm-red `--prod-blocking` token. That meant genuinely neutral
metadata ("Reliability", "Rule detected") read as alarming, working against
the requirement that secondary information stay visually quiet relative to
the one fact that actually carries risk. `.findingMeta`'s base colour moved
to `--prod-text-2` (neutral secondary), and a new `.findingSeverityTag` class
carries `--prod-blocking` on the severity value alone (`HIGH`), applied at
both of its render sites (`OverviewPanel`, `FindingPanel` in
`VerificationWorkspace.tsx`). No data was removed, simplified, or replaced —
this is a colour-application correction, not a content change.

No other panel required a density change: the existing hierarchy (title at
650 weight, statement at secondary weight, file path in tertiary mono) was
already tuned during R5E.1C/D and remains credible to a senior-engineer
reader while staying scannable during normal scrolling.

---

## 8. Guided preview versus manual dialog differentiation

Both surfaces keep their existing semantics exactly (guided: no `role`, no
`aria-modal`, no focus trap; manual: `role="dialog"`, `aria-modal="true"`,
focus containment, Escape, focus restoration — all unchanged and
re-confirmed, §12). Only their visual weight changed, to make the semantic
distinction visible at a glance:

| Property | Guided preview (`.decisionCard`/`.decisionScrim`) | Manual dialog (`.decisionDialogPanel`/`.dialogScrimButton`) |
|---|---|---|
| Scrim | `rgba(28, 28, 28, 0.16)` (was 0.28) | `rgba(0, 0, 0, 0.6)` (was 0.56) |
| Shadow | `0 4px 16px rgba(0, 0, 0, 0.08)` (was `0 12px 32px rgba(0,0,0,0.16)`) | `0 24px 64px rgba(0, 0, 0, 0.32)` (was `0 18px 56px rgba(0,0,0,0.28)`) |
| Border radius | 8px (matches the shell's own internal record cards) | 10px (unchanged, matches the frozen product's own dialog radius) |
| Border colour | `--prod-border-subtle` (was `--prod-border`) | `--prod-border` (unchanged) |

The guided preview is now visibly lighter and flatter — closer to another
panel surfaced within the live stage — while the manual dialog is visibly
heavier and darker, reinforcing that it is a distinct, explicitly requested
operation. Confirmed live in the compiled stylesheet (both rule sets read
back exactly as written) and by opening the manual dialog directly: `role`,
`aria-modal`, zero radio/checkbox controls, Escape-close and
focus-restoration to the triggering `08 Human Decision` button all still
hold (§12).

---

## 9. Trust copy

`TRUST_BOUNDARY.supporting` previously read: *"A compact, honest boundary —
not a security page. Detailed architecture and data-boundary documentation
remain separate, future work."* This named an internal roadmap phase
("future work") in public-facing copy, which the task brief prohibits.
Replaced with:

> The sample keeps its boundaries explicit. Deterministic analysis provides
> the baseline, model assistance remains optional, and nothing here creates,
> modifies or publishes a review.

The headline (`What this sample does and does not do.`) and the five
structured Trust records beneath it are unchanged — this milestone edited
only the one supporting sentence. Confirmed live: `document.body.innerText`
contains neither `"not a security page"` nor `"future work"` anywhere on the
assembled page.

---

## 10. Handoff and footer deduplication

The footer previously repeated the unresolved-case handoff's own
`Open the sample review` / `Start a review` button pair immediately below it
on the page, plus a supporting line (`"The case remains unresolved..."`)
that restated the handoff's own headline and context. This was the "second
conversion panel" the task brief names as a defect.

The footer's action buttons were removed outright — the handoff card
(`#unresolved-case`) keeps sole ownership of the page's final conversion
moment, exactly as the task brief requires ("The unresolved-case handoff owns
the final conversion moment"). `CLOSEOUT.supporting` was reworded from a
restatement of the handoff to a concise purpose line:
*"Deterministic verification for pull requests, with optional model
assistance."* The unused `CLOSEOUT.headline` field (never rendered) was
removed as dead code.

The footer now contains exactly: Lintel identity, the one concise purpose
line, the three in-page links (`Product`, `How it works`, `Trust`), the
copyright line, and the private-lab boundary note — matching the task
brief's keep-list precisely. Confirmed live: the footer's interactive-element
count is zero buttons/action links (only the three plain nav anchors, which
`querySelectorAll('a.btn, button')` inside `<footer>` correctly excludes).

---

## 11. Final page rhythm

With the footer's duplicate conversion panel removed, the page's ending
sequence is now: Human Decision (climax, unchanged) → Trust (concise
decompression, unchanged structure) → unresolved-case handoff (the sole,
decisive final action) → a quiet, short footer. No section was added, and no
section's own height was compressed below what its content needs — the
rhythm change here is the removal of a redundant block, not new
tightening elsewhere. The rest of the sequence (Hero → live product →
verification gap → guided journey → Human Decision → Trust → handoff →
footer) is unchanged from R5E.1E.

---

## 12. Navigation and first viewport

No navigation, hero, or first-viewport change was made. Reviewing
`R5E1E_HUMAN_REVIEW_PACKAGE/OPEN_VISUAL_QUESTIONS.md` and the R5E.1E
acceptance record against the current implementation found no
evidence-supported defect in navigation alignment, the sticky divider,
active-section contrast, primary-action sizing, hero-to-shell spacing, the
headline's line break, first-viewport product prominence, or mobile header
spacing — each already satisfies its governing contract
(`R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md`, `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
§10). Per the task brief's instruction to refine "only evidence-supported
details," none of these nine sub-items in this section was assigned a
speculative change.

---

## 13. Responsive polish

Browser-validated at all six required viewports, production build (`next
build` then `npm run start`), `document.documentElement.scrollWidth <=
clientWidth` confirmed at each:

| Viewport | Result |
|---|---|
| 1600×1000 | No overflow (1585×1585). Sticky shell active (`position: sticky`). |
| 1280×800 | No overflow (1265×1265). Sticky shell active. |
| 1024×768 | No overflow (1009×1009). Sticky shell active. |
| 768×1024 | No overflow (753×753). Sticky disabled (`position: static`, confirmed via computed style). |
| 390×844 | No overflow (390×390). Desktop nav hidden (`display: none`), mobile compact spine bar shown (`display: flex`). |
| 320×568 | No overflow (320×320). |

No squeezed four-column shell at 1024×768; Inspector remains at its
documented range; no sticky or overflow trap was found at any width;
manual/guided precedence, `Reset sample`, and the manual Human Decision
dialog were all re-exercised successfully at 1280×800 (§4, §8). Tablet and
mobile compositions are unchanged from R5E.1B–E and were re-confirmed, not
re-derived.

---

## 14. Accessibility

Re-verified live on the polished page (production build):

- One `<main>`, one `<h1>`, confirmed by count.
- `robots` meta remains `noindex, nofollow`.
- The manual Human Decision dialog: `role="dialog"`, `aria-modal="true"`,
  zero `input[type=radio]`/`input[type=checkbox]` elements, `Escape` closes
  it and restores focus exactly to the triggering `08 Human Decision`
  button (confirmed via `document.activeElement` after Escape), and
  `document.body.style.overflow` is set to `"hidden"` while open and
  restored to `""` on close.
- The guided preview's structural properties are unchanged: no `role`, no
  `aria-modal`, no keydown handler — confirmed by reading the compiled
  component; it cannot trap focus by construction.
- No milestone/scaffolding text and no internal-roadmap language
  (`"R5E.1"`, `"not a security page"`, `"future work"`) appears anywhere in
  `document.body.innerText`.
- Colour is never the sole carrier of meaning: the active spine item pairs
  its quiet fill and bolder label with the existing border-top step and
  `aria-pressed` state; the retinted `findingSeverityTag` still sits beside
  the plain-text `HIGH` label, not colour alone.
- Focus order, skip link, and native-control-only interaction (no added
  `tabIndex`, no document-level arrow-key handling) are unchanged from
  R5E.1E and were not touched by this milestone.

Not independently re-exercised in this environment, for the same
frame-compositing limitation recorded by every prior R5E.1 phase: a live
screen-reader pass, OS-level `prefers-reduced-motion` emulation end-to-end,
true 200% zoom, and the guided `IntersectionObserver` path firing live via
real scroll. Each remains **untested**, not passed, consistent with
R5E.1B–E's own reporting discipline.

---

## 15. Motion and reduced motion

No motion class, easing token, or duration changed. `--ease:
cubic-bezier(0.2, 0.8, 0.2, 1)` continues to drive `panelEnter` (200ms) and
`decisionEnter` (240ms), both within their locked ranges. Reduced motion
remains the same two independent layers unchanged from R5E.1C/D/E (the
global CSS media query, and the `data-reduced-motion` attribute
`LiveReviewStage.tsx` sets from `matchMedia`) — confirmed present in the
compiled stylesheet via `document.styleSheets` inspection in this session.
No new `@keyframes` rule was added; the elevation and colour changes in §6–§8
are static property values, not animated ones.

---

## 16. Product truth

`example/b2b-redemption-api` · PR `#482` · `Add fallback handling for failed
discount-code retrieval` · `Tests required` · `46/100 · MEDIUM` · `4 open ·
2 blocking` · `PENDING` render identically across every state, both Human
Decision surfaces, and all six viewports exercised this session — confirmed
via `get_page_text` before any interaction and again after opening/closing
the manual dialog. No requirement cleared, no outcome selected, no
recommendation or risk value changed, no new fact was introduced by any
copy or colour edit in this milestone. `canonical-review.ts` was not
modified.

---

## 17. Browser validation

Production build (`next build` then `npm run start`, accessed at
`http://localhost:3000`), Browser pane, `noindex` route.

| Check | Result |
|---|---|
| Resting state complete and truthful (`get_page_text` pre-interaction) | Pass |
| One `<main>`, one `<h1>` | Pass |
| `robots` = `noindex, nofollow` | Pass |
| No `"R5E.1"`, `"not a security page"`, or `"future work"` text anywhere in `document.body.innerText` | Pass |
| Trust copy matches the new supporting sentence exactly | Pass |
| Footer contains zero action buttons/links beyond the three nav anchors | Pass |
| Handoff card retains both actions (`Open the sample review`, `Start a review`) | Pass |
| `.stageGrid` computed height = 580px | Pass |
| Thin-scrollbar CSS (`scrollbar-width: thin`) resolves on the Queue column | Pass |
| Active verification-spine item: background `rgb(238,238,236)`, border-top `rgb(28,28,28)` | Pass |
| Manual dialog: `role="dialog"`, `aria-modal="true"`, 0 radio/checkbox, box-shadow `0 24px 64px rgba(0,0,0,0.32)`, scrim `rgba(0,0,0,0.6)` | Pass |
| Guided-preview CSS (compiled stylesheet): box-shadow `0 4px 16px rgba(0,0,0,0.08)`, scrim `rgba(28,28,28,0.16)` | Pass |
| Escape closes manual dialog; focus returns to trigger; `body.style.overflow` restored | Pass |
| No horizontal overflow, all six required viewports | Pass |
| Sticky shell active ≥1024px, static <1024px | Pass |
| Mobile: desktop nav hidden, compact spine bar shown at 390×844 | Pass |
| `journeyNarrative` computed padding: 64px top / 32px bottom | Pass |
| Reduced-motion CSS rule present in compiled stylesheet | Pass |
| No console error / hydration warning at any viewport or after any interaction performed | Pass |
| No broken asset (`read_network_requests` all 200 OK) | Pass |
| No external write, no model request (same-origin only) | Pass |
| Regression: `/` | Pass, no console error |
| Regression: `/visual-lab/public-r5` | Pass, no console error |
| Regression: `/workspace?source=fixture` | Pass, no console error |
| Regression: `/new` | Pass, no console error |
| Guided `IntersectionObserver` firing end-to-end via real scroll | **Untested** — same environment limitation R5C–R5E.1E recorded |
| Live screen-reader pass | **Untested** |
| OS-level `prefers-reduced-motion` emulation | **Untested** |
| True 200% zoom | **Untested** |
| Pixel screenshot capture | **Untested** — `computer{action:"screenshot"}` returned the same non-compositing error every prior phase recorded |

---

## 18. Known limitations

1. As recorded by every R5E.1 implementation phase before this one, this
   session's Browser pane cannot composite frames — confirmed directly this
   session (`computer{action:"screenshot"}` failed with "the Browser pane is
   not displayed, so the page is not compositing frames"). No pixel
   screenshot could be captured, and the retuned guided `IntersectionObserver`
   trigger band could not be exercised firing live via real scroll. It was
   instead verified by re-confirming the manual-dispatch path (which shares
   the same event-construction helper the guided path uses) live, and by
   reasoning from the shell's measured height against the sticky offset. This
   should be confirmed in a real, compositing browser before formal
   acceptance — specifically, whether the retuned trigger band produces
   noticeably better heading placement relative to the sticky shell while
   scrolling.
2. No live screen-reader pass (NVDA/VoiceOver) was performed.
3. OS-level `prefers-reduced-motion` emulation was not available in this
   environment; the CSS rule's presence was confirmed instead.
4. True 200% zoom was not available in this environment.
5. The visual weight differences between the guided preview and the manual
   dialog (§8) were confirmed at the CSS/computed-style level, not by direct
   pixel comparison — a human reviewer should confirm the differentiation
   reads clearly at normal viewing distance, per Open Visual Question 4 from
   the R5E.1E review package (amber/red restraint) and the new distinction
   introduced here.

---

## 19. R5E.1F freeze readiness

This milestone does not authorise or begin any production transfer; only
R5E.1F may touch `app/page.tsx`. What remains before R5E.1F can responsibly
run its freeze review is unchanged from R5E.1E §31: a live screen-reader
pass, OS-level reduced-motion emulation, true 200% zoom, and a real,
compositing-browser confirmation of the guided scroll path — now including
this milestone's retuned trigger band and spacing — and the manual dialog's
live initial-focus behaviour. No new deferred item was created by this
milestone beyond re-confirming the same pre-existing environment gaps.

---

## 20. Acceptance evidence

- `npx tsc --noEmit` — passes, no output.
- `npm run build` — passes; `/visual-lab/public-r5-recalibrated` generated
  as a static route alongside the unchanged 27-route list.
- `git diff --check` — passes, no output.
- `git status --short` — shows only the five modified files listed in §3,
  this document, the README update, and the untracked human review package;
  nothing staged.
- `git diff` against every protected path — every path empty (§2, re-run
  after implementation).
- `next-env.d.ts` and `tsconfig.tsbuildinfo` restored to their exact
  preflight SHA-256 hashes after validation.
- Browser validation per §17, production build, all six required viewports,
  four regression routes.
- `R5E1E1_HUMAN_REVIEW_PACKAGE/` created untracked at the repository root.
- Production server (`npm run start`) stopped; port 3000 confirmed free
  after the session.

R5E.1E.1 polish is complete and ready for human visual review. It is not
self-accepting: formal acceptance follows the same human review process as
R5C/R5D/R5E/R5E.1B–E.

---

## 21. Human visual-review correction pass

A complete desktop recording of the polish above passed the overall
website-organisation and scrolling review, and identified two remaining
visual defects, corrected in the same session:

1. **Guided Human Decision still read as an unsolicited modal.** Lightening
   the scrim (§8 above) was not sufficient — the guided surface was still a
   floating card positioned over a dimmed shell. The presentation model was
   corrected, not just its shading: Human Decision is now the eighth
   embedded state of the Workspace, exactly like Finding, Evidence, Missing
   proof, Requirement, Affected context and Readiness before it —
   `VerificationWorkspace.tsx`'s `HumanDecisionPanel` now renders the shared
   `HumanDecisionContent` (exported from `HumanDecisionSurface.tsx`, so the
   embedded panel and the manual dialog still share one content
   implementation) directly inline, in normal document flow, alongside the
   Rail, Queue and Inspector — no `position: absolute`, no scrim, no
   floating-card shadow, no detached radius treatment. The former
   `HumanDecisionPreview` overlay component and its CSS
   (`.decisionLayer`/`.decisionScrim`/`.decisionCard`) were removed entirely
   — there is no longer a separate guided layer to style. The manual dialog
   (`HumanDecisionDialog`) is untouched in semantics and remains the page's
   only genuinely elevated, scrimmed overlay: `role="dialog"`,
   `aria-modal="true"`, focus containment, Escape, focus restoration, the
   `Read-only Human Decision` label, all seven outcomes unselected, no
   submission-capable control. Confirmed live: closing the manual dialog
   leaves the same seven-outcome content visible in the Workspace, in normal
   flow (`position: static`), with zero scrim/layer elements remaining in
   the DOM.
2. **Clipped narrative fragments around the sticky shell.** The recording
   showed slivers of narrative headings/copy at the sticky shell's top and
   bottom edges during stage transitions. `.stageSticky` gained a white
   guard band — `padding: 8px 0` paired with `margin: -8px 0` and an
   explicit `background: var(--pub-canvas)` — using the permitted "white
   non-interactive occlusion or guard region belonging to the sticky stage"
   technique. This extends the sticky element's own painted box (which sits
   at z-index 5, above the narrative's default stacking) by 8px above and
   below its visible content, without shifting the shell's on-screen
   position or the page's total height (the padding and the equal negative
   margin cancel out in layout, confirmed live: `top` remains `74px` and no
   viewport reported new horizontal or vertical overflow). No stage order,
   trigger technique, or narrative content changed.

No canonical value, hero, navigation, Trust copy, handoff, footer, reducer
event, or accepted stage order changed. `demo-reducer.ts` was not touched —
the existing `OPEN_DECISION`/`CLOSE_DECISION` events and
`decisionSurface`/`decisionSurfaceOrigin` fields already provided everything
needed: the embedded panel is now driven purely by `state.stage ===
"human-decision"` (like every other working stage), and only the manual
dialog still reads `decisionSurfaceOrigin === "manual"` to decide whether to
render.

### Files touched in this correction pass

`app/_public-r5-recalibrated/components/HumanDecisionSurface.tsx` (exported
`HumanDecisionContent`, removed `HumanDecisionPreview`),
`app/_public-r5-recalibrated/components/VerificationWorkspace.tsx`
(`HumanDecisionPanel` now renders the shared content inline),
`app/_public-r5-recalibrated/components/LiveReviewStage.tsx` (removed the
`showGuidedPreview` overlay render path),
`app/_public-r5-recalibrated/public-r5-recalibrated.module.css` (removed
`.decisionLayer`/`.decisionScrim`/`.decisionCard` and their mobile/
reduced-motion rules; added the `.stageSticky` guard band; consolidated
`.decisionPreviewLabel` to one base rule).

### Validation

`npx tsc --noEmit` and `npm run build` both pass (27 routes, unchanged).
`git diff --check` passes. Every protected path
(`package.json`/lockfiles, `app/page.tsx`, `app/_public-r5`,
`app/visual-lab/public-r5`, `app/workspace`, `app/report`, `app/new`,
`lib/workspace-v2`, `.claude/launch.json`) remains empty. `next-env.d.ts`
and `tsconfig.tsbuildinfo` restored to their exact preflight hashes.
Browser-validated on a fresh production build at all six required
viewports (1600×1000 through 320×568, no horizontal overflow at any), plus
`/`, `/visual-lab/public-r5`, `/workspace?source=fixture` and `/new`
regression-checked with no console errors. The embedded panel was confirmed
live: 7 outcome rows present, the guided-preview label preserved, the
Inspector's Decision authority context preserved, zero scrim/layer elements
in the DOM, and the Workspace region's computed `position` is `static`.

As with every prior R5E.1 phase, this session's Browser pane cannot
composite frames, so the visual result of both corrections (whether the
embedded panel reads as calm and connected, and whether the clipped-fragment
artifact is actually gone) was verified structurally and via computed style,
not by direct pixel/video inspection. A human reviewer should confirm both
in a real, compositing browser before formal acceptance.
