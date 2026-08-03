# R5E.1E — Full Private Public Experience Assembly

Branch: `r5e1e-full-private-public-assembly`
Status: assembly at the same private route. No production route, no accepted
R5 or R4 document, no R5E.1A–D document was modified.
Owning phase: R5E.1 — deliberate recalibration of Lintel's public visual
identity, composition and interactive product storytelling.

R5E.1A is accepted and closed. R5E.1B is accepted and closed. R5E.1C is
accepted and closed. R5E.1D is accepted and closed
(`docs/r5/R5E1D_HUMAN_DECISION_TRUST_AND_HANDOFF.md`, human visual
acceptance recorded 3 August 2026). R5E.1E assembles the five movements those
phases built, at the same private route,
`/visual-lab/public-r5-recalibrated`.

This is a complete-page assembly and integration milestone. It is not a
production transfer, not a new visual-direction exploration, and not the
final R5E.1F freeze.

---

## 1. Purpose and scope

R5E.1E's objective, per the task brief: the complete private page should feel
like one continuous Lintel investigation — selected review → verification gap
→ follow the verification record → accountable decision → trust and
continuation — through one unresolved PR #482, from the hero to the final
handoff.

By the close of R5E.1D, all five movements already existed in one page
composition (`R5RecalibratedPrototype.tsx`): R5E.1B built movement one
(navigation, hero, live shell), R5E.1C built movements two and three
(verification gap, the guided verification journey), and R5E.1D built
movements four and five (accountable decision, trust and unresolved
handoff) directly into the same file and the same shared shell R5E.1B/C
established. There was no second, unassembled page to merge — each phase
extended the one implementation in place.

R5E.1E's actual work was therefore an integration and polish pass over the
already-complete composition, not a re-architecture:

1. remove public-facing milestone/prototype scaffolding language that
   competed with the product (the hero's `Prototype — R5E.1D Human Decision
   and handoff` eyebrow, and the footer's milestone-named boundary line);
2. review all five movements' copy for repetition introduced by combining
   R5E.1B–D, and consolidate where genuinely redundant;
3. re-verify the assembled page — now exercised as one continuous whole
   rather than as three incremental slices — against the full accessibility,
   responsive, motion, progressive-enhancement and product-truth
   requirements in the five R5E.1A documents;
4. document the assembled architecture as one record, and produce the
   R5E.1E human review package.

No new section, reference, colour, image or motion class was added. No
canonical value changed. No production route was touched.

---

## 2. Authoritative inputs

Read before this assembly pass, in this order:

1. `docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
2. `docs/r5/R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md`
3. `docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
4. `docs/r5/R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`
5. `docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md`
6. `docs/r5/R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md`
7. `docs/r5/R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md`
8. `docs/r5/R5E1D_HUMAN_DECISION_TRUST_AND_HANDOFF.md`
9. `docs/r5/README.md`
10. the complete current `app/_public-r5-recalibrated/**` implementation,
    read in full before any edit
11. `app/visual-lab/public-r5-recalibrated/page.tsx`, the thin route wrapper
12. `lib/workspace-v2/fixture-adapter.ts` (`case482`), spot-checked against
    the already cross-checked values in `canonical-review.ts` — no new
    cross-check was needed because no canonical value changed
13. the R5E.1B, R5E.1C and R5E.1D human review packages, read for their
    recorded environment limitations before repeating the same validation

No broad repository audit was conducted. No R5E.1A–D document, no earlier
accepted R5/R4 document, was edited.

---

## 3. Preflight

Confirmed before any edit:

1. Branch: `r5e1e-full-private-public-assembly`.
2. `git status --short` showed only the eight pre-existing untracked
   human-review/context packages; nothing staged.
3. `git log --oneline -10` showed R5E.1D's merge and feature commits at the
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
    R5E.1D acceptance record.

Preflight SHA-256 hashes recorded before any change:

- `next-env.d.ts`: `4e4da12aa061aac172fb1bcb48e9b6e4b293080d2f494327925fdba8f39632a`
- `tsconfig.tsbuildinfo`: `6882f72e36c3a9a6bbcae2d1c03fa5d303cbefe23decfe4cbd5cab34ca72be8`

`next-env.d.ts` was never touched. `tsconfig.tsbuildinfo` was regenerated by
`tsc`/`next build` during validation, as it always is, and is restored via
`git checkout -- tsconfig.tsbuildinfo` at the close of this milestone (see
§29).

---

## 4. What changed in this assembly pass

Four files were edited, all inside the private implementation this phase
owns:

| File | Change |
|---|---|
| `app/_public-r5-recalibrated/prototype-content.ts` | Removed `PROTOTYPE_LABEL` (`"Prototype — R5E.1D Human Decision and handoff"`); reworded `CLOSEOUT.boundary` from `"Private prototype — R5E.1D. Not linked from the production site."` to `"Private visual laboratory — not linked from production."` |
| `app/_public-r5-recalibrated/R5RecalibratedPrototype.tsx` | Removed the `PROTOTYPE_LABEL` import and its hero-eyebrow `<span>`; updated the file's own top-of-file doc comment to describe the R5E.1E assembly instead of restating R5E.1B/C/D as if still separate |
| `app/_public-r5-recalibrated/public-r5-recalibrated.module.css` | Removed the now-unused `.prototypeLabel` rule |
| `app/visual-lab/public-r5-recalibrated/page.tsx` | Updated the route's `description` metadata and top-of-file comment to describe the assembled experience instead of the R5E.1B prototype slice; `title` and `robots` unchanged |

No component was added or removed. No canonical value, event, state field,
route, or dependency changed. `demo-reducer.ts`, `canonical-review.ts`'s data
exports, `VerificationSpine.tsx`, `VerificationWorkspace.tsx`,
`ContextualInspector.tsx`, `VerificationJourneyNarrative.tsx`,
`HumanDecisionSurface.tsx`, `LiveReviewStage.tsx`, `GlobalRail.tsx`,
`ReviewQueue.tsx` and `PublicPrototypeHeader.tsx` are byte-for-byte unchanged
from R5E.1D.

---

## 5. Removing temporary prototype scaffolding (§6 of the task brief)

Two visible strings carried milestone naming that competed with the product,
identified by reading every component and grepping the private folder for
`R5E.1`/`R5E1` occurrences:

1. **Hero eyebrow.** `PROTOTYPE_LABEL = "Prototype — R5E.1D Human Decision
   and handoff"` rendered directly above the `<h1>` as the first thing a
   visitor read. This is exactly the "prototype milestone name" §6
   prohibits from the main experience. It is removed outright, not replaced
   — the hero now opens on the headline, which is more product-led (§9's
   "avoid excessive introductory copy") and matches accepted competitors'
   pattern of not narrating their own build process to visitors.
2. **Footer legal line.** `CLOSEOUT.boundary` named the specific milestone
   (`"R5E.1D"`). §6 explicitly permits the private route to keep "a concise,
   unobtrusive development-only footer note stating that the route is a
   private visual laboratory and is not linked from production" — so this
   line was not removed, only reworded to drop the milestone name:
   `"Private visual laboratory — not linked from production."`

Every remaining `R5E.1B`/`R5E.1C`/`R5E.1D` occurrence in the codebase (grep
results in §3 of the review package's `VALIDATION_NOTES.md`) is inside a
source code comment, never rendered to a visitor — confirmed live:
`document.body.innerText.includes('R5E.1')` returns `false` on the assembled
page.

Honest public labels were preserved exactly, per §6's keep-list: `Interactive
sample` (stage footer), `SELECTED REVIEW · READ-ONLY SAMPLE` (Workspace
header), `Selected · inspectable in this sample` (Queue row), `Read-only
sample` (Human Decision content), `Human Decision PENDING` /
`Human Decision Pending` (band cell and spine tag).

---

## 6. Five-movement composition, confirmed assembled

| Movement | Content | Anchor |
|---|---|---|
| 1 | Selected review — hero + live product stage | `#product` |
| 2 | Verification gap | `#how-it-works` |
| 3 | Follow the verification record — Finding through Readiness | (within the journey column) |
| 4 | Accountable decision — readiness-to-decision transition + stage-08 narrative | (within the journey column) |
| 5 | Trust and continuation — trust boundary + unresolved-case handoff | `#trust`, `#unresolved-case` |

The visible narrative walks one unresolved case end to end, confirmed via
`get_page_text` on the resting, pre-interaction page: hero → PR #482 selected
in the live Queue → Overview → the verification-gap statement → the guided
narrative through Finding, Evidence, Missing proof, Requirement, Affected
context, Readiness → the accountable-decision transition → the Human
Decision content (all seven outcomes, unselected) → the trust boundary → the
unresolved-case handoff restating the same four canonical values. No
`Eyebrow → Headline → Paragraph → Screenshot` repetition exists: every
movement after the hero is either the live product shell itself, a plain
narrative paragraph tied to the shell's own state, or a structured record
list (trust boundary, handoff card) — never a generic marketing slide.

The `.journeyColumn` sticky mechanism from R5E.1C (the shell and the
narrative as siblings sharing one parent, so the shell stays pinned near the
top of the viewport for the full height of the narrative that follows it)
still governs the whole of movements two through four — confirmed live:
`position: sticky` at 1600×1000/1280×800/1024×768, `position: static` at
768×1024/390×844/320×568, matching R5E.1C's original values exactly.

---

## 7. White-canvas integration

Confirmed unchanged from R5E.1B: `--pub-canvas: #ffffff` on `.page`, no
full-width charcoal section, no coloured band, no gradient, no atmospheric
imagery, no tinted background, no glass/blur identity anywhere in the
assembled page — visually verified by reading every section's background
declaration in `public-r5-recalibrated.module.css` (`.header`, `.hero`,
`.section`, `.footer` all resolve to `var(--pub-canvas)` or transparent). The
only non-white surfaces are the live product stage's own `--prod-*`
tokens (`#ffffff`/`#fafaf9`/`#eeeeec`), which the visual-system lock §4
explicitly permits inside the demonstration, and the trust/handoff records'
thin `--pub-border-subtle` dividers.

---

## 8. Public grid

`.wrap` remains a 1280px max-width container with 32px side padding (20px
under 768px) — inside the task brief's "approximately 1240–1320px" target
range, so no change was made. Header, hero, the live stage, the journey
narrative, the trust section and the handoff section all share this one
container; confirmed by reading the CSS (`.headerInner`, `.wrap` both use
`max-width: 1280px`) and by live measurement at each of the six required
viewports (§21). No section uses a different max-width, no floating
decorative window exists, and the live stage is the widest single element on
the page at desktop widths, matching §7's "maximum width reserved for the
live product."

---

## 9. Navigation

Unchanged from R5E.1B/R5E.1A's frozen contract: `Lintel` · `Product` ·
`How it works` · `Trust` · `Open the sample review`. Destinations confirmed
live: `Lintel` → `/visual-lab/public-r5-recalibrated`, `Product` → `#product`,
`How it works` → `#how-it-works`, `Trust` → `#trust`, `Open the sample
review` → `/workspace?source=fixture`. No dropdown, no hamburger, no pricing,
docs, sign-in or invented route exists. At 767px and below, `.nav` (the
three anchors) is `display: none` and the header shows `Lintel` + a compact
`Open sample` action, confirmed live (`navDisplay: "none"` at 390×844). No
navigation change was needed for this assembly — the composition already
satisfied the contract exactly.

---

## 10. Hero

Headline `Know what is ready to merge.` and trust line unchanged verbatim.
With the milestone eyebrow removed (§5), the hero now opens directly on the
`<h1>`, immediately followed by the supporting sentence, the two actions,
and the trust line, then the live product stage in the same `#product`
section — confirmed live: the live stage's outer border (`.stageWrap`) sits
within the first viewport at 1280×800 and 1600×1000 (the hero section's
total rendered height above the stage, `padding + heroCopy`, is well under
600px at both). The hero remains left-aligned; no centred slide-deck
composition exists.

---

## 11. Verification gap

Movement two's copy (`VERIFICATION_GAP`) is unchanged: `Changes arrive
faster than proof does.`, followed by two sentences that point directly at
the live shell above and name the specific finding it demonstrates. It
transitions directly into the guided narrative (`JOURNEY_INTRO`, `Follow the
verification record.`) without a second screenshot, card grid, or repeated
concept list — confirmed by reading the rendered DOM order: the verification
gap block and the journey-intro block are consecutive `.movementBlock`
elements inside the same `.journeyNarrative` column as the live shell, not a
separate page section.

---

## 12. Central verification journey

Preserved exactly, confirmed live and by code inspection: one stable shell
(Rail/Queue/Workspace/Inspector), PR #482 selected throughout, the eight-item
verification spine, guided scroll wiring
(`data-verification-stage` anchors + `IntersectionObserver` in
`LiveReviewStage.tsx`), manual activation on every record control and stage
button, `Resume guided tour`, `Reset sample`, reduced-motion CSS rule, and
the mobile compact `NN of 08` control with working `← Previous`/`Next →`.
Manual precedence re-verified live this session: manually activating `08
Human Decision`, then attempting a guided-shaped state change while `mode
=== "manual"`, is discarded by the reducer's existing guard — unchanged code,
re-confirmed rather than re-derived. No new stage was added; no state
sequence changed; the demonstration is not a carousel, horizontal-scroll
experience, or video player.

---

## 13. Shell and internal scrolling

`.stageGrid`'s fixed `560px` height (`height: auto` under 767px) and the
existing `overflow-y: auto` on `.queue`/`.workspace`/`.inspector` were
reviewed for genuine integration defects across all nine reachable states,
now that the assembled page exercises every state in one continuous session
rather than in three separate milestone slices. No defect was found:

1. The shell remains a stable, bounded region at every viewport tested — no
   layout shift was observed moving between any two states.
2. Ordinary page scrolling is never trapped: the shell's own internal
   scrollbars are contained to `.queue`/`.workspace`/`.inspector`
   individually; the outer page scrolls normally past and through the
   sticky shell via the `.journeyColumn` mechanism (§6).
3. The Human Decision guided preview (`.decisionLayer`, `position: absolute;
   inset: 0` inside `.stageWrap`, which gained `position: relative` for this
   purpose in R5E.1D) and the manual dialog (`position: fixed`, viewport
   layer) both remain reachable and do not conflict with the shell's own
   internal overflow.
4. On mobile (390×844/320×568), `.stageGrid` becomes `height: auto` and a
   column flex stack, so no internal scrollbar competes with page scrolling
   at those widths — confirmed live, no independent scroll region measured
   inside the stage at 390×844.
5. At 200% zoom (approximated, as in R5E.1C/D, by a narrow-viewport check —
   see §22 for the exact limitation), the shell continued to reflow through
   its existing breakpoints without a new overflow condition.

No correction was needed. The existing stable-dimension design (deliberately
kept in R5E.1C precisely so Readiness's and Affected context's larger content
would not shift the shell) continues to serve every state, including the
Human Decision content added by R5E.1D, without modification.

---

## 14. Verification spine

Unchanged. All eight stages (`01 Change` … `08 Human Decision`) render with
their genuine names as semantic `<button>`s with `aria-pressed`; only `08`
carries the non-colour `Pending` tag; no completion tick, no green, anywhere
in the assembled page — confirmed live via `document.body.innerText`
containing no cleared/approved/resolved language anywhere in any of the nine
states. The spine's relationship to the shell (border-top emphasis, no fill,
no icon) is unchanged from R5E.1C/D.

---

## 15. Human Decision climax

Re-verified live this session as the narrative's climax, now reached through
the fully assembled page rather than in isolation: manual activation from the
spine's `08` button, from the Readiness panel's `Open Human Decision` button,
and from the Human Decision panel's own button, all open the same
`role="dialog"` surface with `aria-modal="true"`, zero
`input[type=radio]`/`input[type=checkbox]` elements, `document.body.style.
overflow` correctly set to `"hidden"` while open and restored on close.
Escape closes the dialog and focus returns to the triggering `Open Human
Decision` control — confirmed live once focus was manually placed inside the
dialog to work around this session's `requestAnimationFrame` limitation (see
§22, the same limitation R5E.1D recorded for its own initial-focus call).
All seven outcomes render unselected with the read-only boundary visible in
both the guided preview and the manual dialog. Human Decision remains
`PENDING` throughout; nothing was recorded, submitted, or written.

---

## 16. Trust boundary

Unchanged five-row structured record list (`Baseline`, `Model assistance`,
`External writes`, `This review`, `Human Decision`), landing correctly at the
`#trust` anchor — confirmed live via `document.getElementById('trust')`
resolving to the section containing `TRUST_BOUNDARY.headline`. No compliance
claim, no deployment option, no customer logo, no dark background exists
anywhere in this section.

---

## 17. Unresolved-case handoff

Unchanged `.handoffCard` at `#unresolved-case`, restating
`example/b2b-redemption-api · PR #482`, `Tests required`, `46/100 · MEDIUM`,
`4 open · 2 blocking`, `Human Decision PENDING`, with the same two genuine
destinations (`Open the sample review`, `Start a review`) used in the hero.
Visually distinct from the hero (a left-aligned bordered record card, not a
second centred headline) — confirmed by reading the CSS: `.handoffCard` uses
`border` + `border-radius`, not the hero's typography-led composition.

---

## 18. Footer

Unchanged composition: `Lintel` identity, one supporting line, the same
`Product`/`How it works`/`Trust` links, the primary/secondary actions, a
legal line (`© Lintel`), and the reworded private-lab boundary note (§5). No
fake company page, legal route, social link, documentation link, pricing, or
newsletter form exists.

---

## 19. Copy consolidation

Every visible string across all five movements was read in one pass (rather
than per-phase, as R5E.1B–D each necessarily did) to check for repetition
introduced by combining three separately built slices. Findings:

1. **Genuine redundancy found and fixed:** the hero's milestone eyebrow (§5)
   was the only material duplication — it restated the page's own
   development history in a way that added nothing for a visitor and
   directly competed with the headline for first-viewport attention.
2. **Apparent overlap reviewed and kept:** `HERO.supporting` previews the
   product's capability in one sentence ("connects a change to its
   findings, its evidence, its missing proof and its open requirements");
   `VERIFICATION_GAP.supporting` frames the specific problem and points at
   the live shell; `JOURNEY_INTRO.supporting` orients the reader to the
   stage sequence before the guided narrative begins. These are
   complementary framings at three different points in the journey, not
   restatements of the same sentence, and no single fact appears verbatim
   in two places. `JOURNEY_INTRO.supporting`'s stage-by-stage sentence does
   not duplicate `VERIFICATION_STAGES[].body` (the canonical stage
   descriptions) because that field is never rendered anywhere in the
   assembled UI — confirmed by grep (`VERIFICATION_STAGES[].body` has zero
   render sites) — so `JOURNEY_INTRO` is the only place that orientation
   exists for a visitor.
3. **Progressive-enhancement constraint respected:** every fact any
   interactive panel shows must also exist in server-rendered narrative copy
   (`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §8b.2), so some structural
   restatement between the narrative and the interactive panels (e.g. the
   finding's statement appearing in both `VerificationJourneyNarrative.tsx`
   and `VerificationWorkspace.tsx`'s `FindingPanel`) is a requirement, not an
   assembly defect, and was left untouched.

No copy beyond §5's two edits was changed. No unsupported claim was
introduced or found (`prevents incidents`, `guarantees safe merges`,
`enterprise ready`, `trusted by major companies`, `fully autonomous`,
`complete security coverage` — none present, confirmed by reading every
string in `prototype-content.ts` and `canonical-review.ts`).

---

## 20. Motion and interaction integration

Unchanged: `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)` drives `panelEnter`
(200ms) and `decisionEnter` (240ms), both within their locked ranges; no
bounce, spring, parallax, autoplay, or whole-section entrance animation
exists anywhere in the assembled page — confirmed by reading every
`@keyframes` rule in `public-r5-recalibrated.module.css` (exactly two:
`panelEnter`, `decisionEnter`). Reduced motion remains two independent
layers (the global CSS media query, and the `data-reduced-motion` attribute
`LiveReviewStage.tsx` sets from `matchMedia`), unchanged from R5E.1C/D.
Motion timings do not overlap or compete with page scrolling: `panelEnter`
and `decisionEnter` only ever animate opacity/`translateY` on already-mounted
content inside the fixed-height shell, never a layout dimension.

---

## 21. Guided and manual behaviour

Re-confirmed across the assembled page: manual visitor intent wins
(`demoReducer`'s `if (event.source === "guided" && state.mode === "manual")
return state;` guard, unchanged and exercised live this session, §12);
`Resume guided tour` appears only in manual mode and restores guided mode
without changing the active stage; `Reset sample` returns the full
`DemoState` to `INITIAL_DEMO_STATE`, confirmed live (no `[role="dialog"]`
and the PR row is the only `aria-pressed="true"` control after reset); the
guided Human Decision preview carries no dialog semantics and the manual
dialog carries full dialog semantics, confirmed live. No auto-restart occurs
when leaving and returning to a section — the reducer holds state
independent of scroll position once `mode === "manual"`.

---

## 22. Responsive assembly

Browser-validated at all six required viewports on the production build
(`next build` then `next start`), `document.documentElement.scrollWidth <=
clientWidth` confirmed at each:

| Viewport | Result |
|---|---|
| 1600×1000 | No overflow (1585×1585). Sticky shell active. |
| 1280×800 | No overflow (1265×1265). Sticky shell active. |
| 1024×768 | No overflow (1009×1009). Sticky shell active; grid columns `44px 220px 389px 290px`, matching R5E.1C's original measurement. |
| 768×1024 | No overflow (753×753). Sticky disabled (`position: static`, confirmed via computed style). |
| 390×844 | No overflow (390×390). Nav hidden, compact spine bar shown (`display: flex`, confirmed). |
| 320×568 | No overflow (320×320). |

Desktop: the first viewport is product-led (hero copy is compact enough that
the live stage begins within the first screen at 1280×800/1600×1000);
navigation, hero and shell share one grid; the journey narrative's pacing and
the sticky-release behaviour are unchanged from R5E.1C's accepted values.
Medium widths: no squeezed four-column shell at 1024×768 (Inspector at its
documented 290px minimum); Workspace remains dominant; no internal-scroll
trap was found (§13). Mobile: compact navigation, left-aligned hero,
sequential product composition, compact stage control, working guided/manual
behaviour where testable, and no horizontal overflow at either mobile
viewport. This is the same responsive system R5E.1B–D built and validated
incrementally; this pass re-confirms it holds for the complete, assembled
page in one session rather than per-movement.

---

## 23. Accessibility

Re-verified live on the assembled page (production build):

- One `<main>`, one `<h1>` (`Know what is ready to merge.`), confirmed by
  `document.querySelectorAll` count.
- Logical heading order across the whole page, confirmed by DOM query:
  `h1` → `h2` (verification gap) → `h2` (follow the record) → `h3` × 6 (one
  per working stage, Finding through Readiness) → `h2` (accountable
  decision) → `h3` (Human Decision) → `h2` (trust) → `h2` (unresolved
  handoff). No heading level is skipped.
- `robots` meta = `noindex, nofollow`, confirmed.
- 13 buttons at the resting Overview state (PR row, Inspect finding, 8 spine
  buttons, mobile prev/next, Reset sample), matching the intended
  working-control set exactly — no fake control was introduced by assembly.
- The manual Human Decision dialog: `role="dialog"`, `aria-modal="true"`,
  zero radio/checkbox controls, `Escape` closes and focus returns to the
  trigger (§15) — all re-confirmed on the complete assembled page, not just
  in isolation.
- No milestone/scaffolding text is present in `document.body.innerText`
  (§5), so no assistive-technology user encounters internal development
  language.
- Colour is never the sole carrier of meaning anywhere in the assembled
  page: selection, active spine state, and the Pending tag all pair a
  structural marker or text label with any colour step — unchanged pattern,
  re-confirmed.
- No document-level arrow-key handling exists anywhere in
  `app/_public-r5-recalibrated/**` (confirmed by search); every control is a
  native `<button>` or `<a>`.

### 23a. Originality tests (§7a of the visual-system lock), run formally on the assembled page

1. **Remove the wordmark.** With `Lintel` removed, the page still
   communicates through the verification spine's stage grammar, PR #482's
   persistent identity, and the recommendation/risk/requirements/Human
   Decision band — none of which is generic SaaS chrome. **Pass.**
2. **Transplant test.** The interaction model (a persistent Rail/Queue/
   Workspace/Inspector shell driving a Finding → Evidence → Missing proof →
   Requirement → Affected context → Readiness → Human Decision spine) is
   specific to Lintel's verification vocabulary; reusing it unchanged for a
   CRM or knowledge base would require inventing an equivalent evidentiary
   model, not just relabelling it. **Pass.**
3. **Motion test.** Every animation (`panelEnter`, `decisionEnter`) fires
   only on a genuine Lintel operation (record focus change, decision surface
   open) — confirmed by code inspection, no decorative or ambient motion
   exists. **Pass.**
4. **Model visibility test.** The verification model (finding → evidence →
   missing proof → requirement → readiness → decision) is visible through
   product structure and record relationships, not only through explanatory
   copy — the live shell demonstrates it directly. **Pass.**
5. **Imagery test.** Zero images ship in this assembly; the visual identity
   depends entirely on the live HTML product, not on copied environmental
   imagery. **Pass.**

---

## 24. Progressive enhancement

Confirmed unchanged and complete: `VerificationJourneyNarrative.tsx` (no
`"use client"`) renders every fact any interactive panel can show, in
document order, before any JavaScript runs — confirmed by reading
`get_page_text` output captured before any interaction (§ resting-state
excerpt in the review package). `LiveReviewStage` remains a Next.js client
component that is still server-rendered by default, so PR #482 selected, the
Overview resolved, and Human Decision pending are all present without
JavaScript. No content is removed after mount; no state flashes from
unselected to selected; no hydration warning was observed in the console at
any viewport or after any interaction performed this session.

---

## 25. Performance and stability

No dependency and no lockfile change (`git diff -- package.json
package-lock.json pnpm-lock.yaml yarn.lock` empty). No `localStorage`,
`fetch`, `XMLHttpRequest`, analytics or telemetry call exists anywhere in
`app/_public-r5-recalibrated/**` — unchanged, confirmed by search. The two
same-origin `GET /api/generate-report` and `GET /api/github-workspace?
action=status` requests observed in `read_network_requests` during this
session's validation originate from the application's global layout/provider
code outside `app/_public-r5-recalibrated/**` (confirmed absent from every
file this milestone's private folder contains) — pre-existing app-level
behaviour unrelated to this route or this milestone, not a write, and
unmodified by this phase. `.claude/launch.json` was not modified; the
production build used for validation was run directly via `npm run start`
and accessed by URL, matching R5E.1D's own precedent.

---

## 26. Image policy

Zero new images. The live HTML product remains the page's sole visual
system — unchanged from R5E.1B–D and confirmed by grep (no `<img>`, no
`background-image`, no `next/image` usage anywhere in
`app/_public-r5-recalibrated/**`).

---

## 27. Route and product truth

`example/b2b-redemption-api` · PR `#482` · `Add fallback handling for failed
discount-code retrieval` · `Tests required` · `46/100 · MEDIUM` · `4 open ·
2 blocking` · `PENDING` render identically across every one of the nine
reachable states, the Human Decision preview and dialog, and all six
viewports exercised this session — no value differs from the R5E.1D
acceptance record. `noindex, nofollow` confirmed. No control exists for an
action this page cannot truthfully perform. Nothing calls a model, creates a
review, records a Human Decision, or performs an external write — confirmed
by network inspection (§25) and by code inspection (zero write-capable calls
in the private folder).

---

## 28. Browser validation

Production build (`next build` then `next start`, accessed at
`http://localhost:3000`), Browser pane, `noindex` route.

| Check | Result |
|---|---|
| Resting state complete and truthful (`get_page_text` pre-interaction) | Pass |
| One `<main>`, one `<h1>` | Pass |
| `robots` = `noindex, nofollow` | Pass |
| No milestone/scaffolding text in `document.body.innerText` | Pass |
| Navigation destinations, active-section wiring present | Pass |
| Hero opens on `<h1>`, no eyebrow | Pass |
| Manual spine navigation to `08 Human Decision` opens dialog | Pass |
| Dialog: `role="dialog"`, `aria-modal="true"`, zero radio/checkbox | Pass |
| Escape closes dialog; focus returns to trigger (with focus manually seeded inside the dialog to work around this session's `requestAnimationFrame` limitation) | Pass |
| `document.body.style.overflow` set/restored correctly | Pass |
| `Reset sample` returns to initial state | Pass |
| No horizontal overflow, all six required viewports | Pass |
| Sticky shell active ≥1024px, static <1024px | Pass |
| Mobile compact spine bar shown, desktop nav hidden at 390×844 | Pass |
| No console error / hydration warning at any viewport or after any interaction performed | Pass |
| No broken asset (`read_network_requests` all 200 OK) | Pass |
| No external write, no model request (same-origin only) | Pass |
| Regression: `/` | Pass, no console error |
| Regression: `/visual-lab/public-r5` | Pass, no console error |
| Regression: `/workspace?source=fixture` | Pass, no console error |
| Regression: `/new` | Pass, no console error |
| Guided `IntersectionObserver` firing end-to-end in this Browser pane | **Untested** — same environment limitation R5C–R5E.1D recorded (§29) |
| Dialog's own `requestAnimationFrame`-scheduled initial focus firing live | **Untested** — same limitation; verified instead by manually seeding focus and confirming the rest of the containment chain (§15) |
| Live screen-reader pass | **Untested** |
| OS-level `prefers-reduced-motion` emulation | **Untested** |
| True 200% zoom | **Untested** (narrow-viewport proxy used, as in R5E.1C/D) |
| Pixel screenshot capture | **Untested** — `computer{action:"screenshot"}` returned "the Browser pane is not displayed, so the page is not compositing frames," the same root cause R5C–R5E.1D recorded |

---

## 29. Build and repository validation

- `npx tsc --noEmit` — passes, no output.
- `npm run build` — passes; `/visual-lab/public-r5-recalibrated` generated
  as a static route alongside the unchanged existing route list (27 routes
  total, matching the pre-existing route count).
- `git diff --check` — passes, no output.
- `git status --short` — shows only the four modified files listed in §4,
  the unmodified `tsconfig.tsbuildinfo` diff (restored below), this
  document, the README update, and the untracked
  `R5E1E_HUMAN_REVIEW_PACKAGE/`; nothing staged.
- `git diff` against every protected path — `package.json`, all lockfiles,
  `app/page.tsx`, `app/_public-r5`, `app/visual-lab/public-r5`,
  `app/workspace`, `app/report`, `app/new`, `app/home`,
  `app/review-operations`, `app/integrations`, `app/settings`,
  `app/review-policies`, `app/team`, `app/visual-lab/workspace-r4`,
  `lib/workspace-v2`, `public/r5/scenes`, `.claude/launch.json`, and every
  R5E.1A/B/C/D document — every path empty.
- `next-env.d.ts` — untouched, hash unchanged from preflight (§3).
- `tsconfig.tsbuildinfo` — regenerated during `tsc`/`next build` as always;
  restored via `git checkout -- tsconfig.tsbuildinfo` after validation.
- `R5E1E_HUMAN_REVIEW_PACKAGE/` created untracked at the repository root.
  The eight pre-existing untracked packages
  (`R5A_VISUAL_CONTEXT_PACKAGE`, `R5C_HUMAN_REVIEW_PACKAGE`,
  `R5D_HUMAN_REVIEW_PACKAGE`, `R5E_HUMAN_REVIEW_PACKAGE`,
  `R5E1A_HUMAN_REVIEW_PACKAGE`, `R5E1B_HUMAN_REVIEW_PACKAGE`,
  `R5E1C_HUMAN_REVIEW_PACKAGE`, `R5E1D_HUMAN_REVIEW_PACKAGE`) were not
  touched.
- Production server (`npm run start`) stopped; port 3000 confirmed free
  before finishing.

---

## 30. Known limitations

1. As recorded by R5C, R5D, R5E, R5E.1B, R5E.1C and R5E.1D before it, this
   session's Browser pane cannot composite frames — confirmed directly this
   session, with the same root cause now surfaced explicitly in the tool's
   own error text ("the Browser pane is not displayed, so the page is not
   compositing frames"). No pixel screenshot could be captured, and the
   guided `IntersectionObserver` path and the dialog's
   `requestAnimationFrame`-scheduled initial focus could not fire live.
   Guided-path correctness was verified instead by (a) re-confirming the
   reducer's manual-precedence guard live via manual state changes, (b) code
   inspection of the unchanged observer wiring already proven correct by
   R5E.1C's standalone reducer unit test, and (c) manually seeding DOM focus
   inside the dialog to exercise the rest of the focus-containment chain
   (Tab/Shift+Tab/Escape/restoration), which does not itself depend on
   `requestAnimationFrame` firing. This should be confirmed in a real,
   compositing browser before formal acceptance.
2. No live screen-reader pass (NVDA/VoiceOver) was performed.
3. OS-level `prefers-reduced-motion` emulation was not available in this
   environment; the CSS rule's presence and the two-layer JS/CSS
   architecture were confirmed instead (unchanged from R5E.1C/D).
4. True 200% zoom was not available; a narrow-viewport proxy was used, as in
   R5E.1C/D.
5. The two same-origin API status requests noted in §25 are pre-existing,
   global application behaviour outside this milestone's scope; they were
   observed but not investigated further, as doing so would exceed this
   phase's private-folder boundary.

---

## 31. Work deferred to R5E.1F

Per `R5E1A_IMPLEMENTATION_HANDOFF.md` §6: reviewing and formally freezing the
visual identity, navigation, composition, live demo, responsive behaviour,
motion, and accessibility decisions that were provisional through R5E.1A–E
(final token values, easing, per-interaction durations, shell region widths,
spine treatment, anchor ids); running the five originality tests as the
formal freeze gate (this document runs them as a pass/fail check per §23a,
but only R5E.1F can formally freeze the result); deciding whether and how the
recalibrated experience transfers to production — only R5E.1F may authorise
touching `app/page.tsx`; a live screen-reader pass, OS-level reduced-motion
emulation, true 200% zoom, and a real, compositing-browser confirmation of
the guided scroll path and the dialog's live initial-focus behaviour, all
recorded as untested by every R5E.1 implementation phase in this environment
and still owed before formal production-transfer confidence.

---

## 32. Acceptance evidence

- `npx tsc --noEmit` — passes, no output.
- `npm run build` — passes; `/visual-lab/public-r5-recalibrated` generated
  as a static route.
- `git diff --check` — passes, no output.
- `git status --short` — shows only the four modified files, this document,
  the README update, and the untracked human review package; nothing
  staged.
- `git diff` against every protected path — every path empty (§29).
- `next-env.d.ts` and `tsconfig.tsbuildinfo` restored to their exact
  preflight SHA-256 hashes after validation.
- Browser validation per §28, production build, all six required viewports,
  four regression routes.
- `R5E1E_HUMAN_REVIEW_PACKAGE/` created untracked at the repository root.

R5E.1E assembly is complete and ready for human visual review. It is not
self-accepting: formal acceptance follows the same human review process as
R5C/R5D/R5E/R5E.1B/R5E.1C/R5E.1D.

## Human visual acceptance and closeout

R5E.1E received human visual acceptance on 3 August 2026.

A complete desktop recording demonstrated the assembled private public experience from the first viewport through the unresolved-case handoff.

The review confirmed:

1. The five accepted movements operate as one continuous Lintel investigation.
2. The public canvas remains white throughout.
3. The live HTML product is the dominant visual identity.
4. PR #482 remains continuous from the hero through Human Decision and the final handoff.
5. The guided verification journey communicates Lintel through product behaviour rather than screenshot transitions.
6. Human Decision remains the clear narrative and operational climax.
7. The compact trust boundary remains truthful and connected to the product.
8. The unresolved-case handoff continues the canonical review rather than repeating the hero.
9. The page expresses Cursor-level product-led discipline while remaining recognisably Lintel.
10. No production, R4 or accepted R5 product truth was changed.

The assembly is accepted. The complete-page review identified a bounded set of composition and interaction refinements that are intentionally assigned to R5E.1E.1:

1. Nested-scroll and scrollbar refinement.
2. Guided narrative pacing and sticky-shell release.
3. Verification-spine legibility.
4. Live-shell density and active-record hierarchy.
5. Stronger visual separation between guided Human Decision preview and the manually opened dialog.
6. Removal of internal roadmap language from public Trust copy.
7. Handoff and footer deduplication.
8. Final vertical-rhythm refinement.
9. Minor navigation and first-viewport polish where supported by evidence.

These are material polish items, not a reopening of the accepted visual direction.

R5E.1E is accepted and closed.
