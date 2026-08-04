# R5E.1E.3 — Responsive Visual Review and Adaptive Composition

Bounded responsive review of the accepted reference-led public reconstruction
at `/visual-lab/public-r5-reference-reconstruction`. Follows human visual
acceptance of R5E.1E.2A–D, recorded 3 August 2026.

Companion documents (unchanged authority):
[`R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md),
[`R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md),
[`R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md`](./R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md),
[`R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md`](./R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md),
[`R5E1E2D_REFERENCE_FIDELITY_IMPLEMENTATION.md`](./R5E1E2D_REFERENCE_FIDELITY_IMPLEMENTATION.md).

---

## 1. Purpose and bounded scope

R5E.1E.2A–D built and refined the reference-led reconstruction and received
final human visual acceptance. This phase does not reopen that architecture.
Its purpose is narrower: confirm the accepted page reads as intentionally
designed — not merely non-overflowing — at every major viewport, and correct
only what genuine pixel evidence proves is a defect.

Explicitly out of scope, per the phase brief: atmospheric imagery, sky
photography, textures, gradients or decorative backgrounds; richer product
interaction; modifying the production homepage; new dependencies; staging,
committing, pushing or merging.

## 2. Accepted reconstruction baseline

Frozen, per the R5E.1E.2A–D closeout recorded in `docs/r5/README.md`:

1. Normal document flow.
2. Only the public navigation is sticky; `position: fixed` appears nowhere.
3. Continuous white canvas.
4. Alternating editorial/product-scene composition — three cycles
   (text/scene, scene/text, text/scene).
5. One principal product relationship per scene.
6. Restrained neutral scene plates (flat fill, no imagery, no gradient, no
   shadow).
7. Local one-shot product motion (`IntersectionObserver`, fires once,
   disconnects).
8. No internal public-scene scrolling.
9. No page-level overlays.
10. Canonical PR #482 product truth throughout.

Page order: Navigation → Hero and selected-review scene → Finding and
Evidence → Missing Proof and Requirement → Readiness and Human Decision →
Trust → unresolved-case handoff → quiet footer.

## 3. Evidence methodology

Full detail: `R5E1E3_RESPONSIVE_EVIDENCE/CAPTURE_METHODOLOGY.md`.

The in-app Browser pane's screenshot action could not composite frames this
session (`the Browser pane is not displayed, so the page is not compositing
frames`) — the same limitation recorded in every prior R5E.1E.2 milestone.
Reported before editing, per this phase's instructions. Its non-screenshot
tools (navigate, resize, JavaScript evaluation) worked normally and were used
for live spot-checks against the real Chromium engine behind the pane.

Genuine pixels were instead captured against a production build
(`next build` + `next start`) using `puppeteer-core`, installed **only into
the session scratchpad** (never into the repository, `package.json`, or any
lockfile — verified throughout by `git status`), driving the Chrome already
installed on this machine. This is the same approach every R5E.1E.2 milestone
used for the same reason.

## 4. Viewport inventory

All fourteen required states captured: 1920×1080, 1600×1000, 1440×900,
1280×800, 1024×768, 834×1112, 768×1024, 430×932, 390×844, 375×812, 320×568,
an emulated 200% zoom (640×400 @2x), a `prefers-reduced-motion: reduce` state,
and a JavaScript-disabled state. Full detail:
`R5E1E3_RESPONSIVE_EVIDENCE/VIEWPORT_METADATA.md`.

For every core viewport: first viewport, hero product scene, Finding and
Evidence, Missing Proof and Requirement, Readiness and Human Decision, Trust,
unresolved handoff, footer, and a full-page capture.

## 5. Large desktop findings (1920×1080, 1600×1000, 1440×900)

Structurally identical to 1280×800 in every measured respect — the 1300px
`--pub-max` envelope caps growth, so `.wrap`'s inner content width, the
360/820 (or equivalent) split, the four scene plates, and the Trust/handoff
column counts are pixel-identical across all four large-desktop and laptop
widths. No defect found; nothing changed. The hero remains product-led, the
hero scene enters within the first common viewport, headline/paragraph/action
spacing stays confident, and no content appears unnecessarily centred.
Screenshots: `R5E1E3_RESPONSIVE_EVIDENCE/screenshots/1920x1080/`,
`1600x1000/`, `1440x900/`; contact sheet:
`R5E1E3_RESPONSIVE_EVIDENCE/contact-sheets/large-desktop-laptop.png`.

## 6. Laptop findings (1280×800)

Same measured geometry as §5 (the 1300px envelope is already reached by
1280px minus gutters in practical terms for this route's proportions). Hero
scene visible within the first 1280×800 viewport, confirmed. No genuine
defect found at this width.

One measurement made here informs the tablet correction in §7: the
copy/scene height mismatch inside the three alternating (`.splitGrid`)
sections, measured directly via `getBoundingClientRect()`:

```
Finding and Evidence:  copy 163px / scene 666px  -> gap 503px
Missing Proof:         copy 163px / scene 464px  -> gap 301px
Readiness:             copy 188px / scene 627px  -> gap 439px
```

This is present at every desktop/laptop width (not specific to 1280px) and is
discussed as a reviewed-but-unchanged item in §14 and in
`R5E1E3_RESPONSIVE_REVIEW_PACKAGE/OPEN_VISUAL_QUESTIONS.md`.

## 7. Tablet findings (1024×768, 834×1112, 768×1024) — one correction made

This is the one viewport family where genuine evidence justified a change.

**Defect found.** At 1024×768 the split-collapse breakpoint
(`@media (max-width: 1023px)`) did not apply — 1024 > 1023 — so this single,
explicitly-required tablet viewport fell into the 1024–1279px "laptop" tier
instead: a compressed 340/576 CSS px two-column split, Trust at 4 columns,
the handoff record at 5 columns, all matching desktop rather than the
established tablet pattern. Combined with the copy/scene mismatch from §6,
this produced exactly the failure mode the phase brief names: disproportionate
empty space and a compressed scene track, at a viewport this phase is
specifically required to judge for exactly this question. 834px and 768px —
both already inside the old ≤1023px tier — showed none of this.

**Correction made.** `app/_public-r5-reference-reconstruction/reference-reconstruction.module.css`:
the breakpoint moved from `max-width: 1023px` to `max-width: 1024px`. 1024×768
now stacks full width, matching 834×1112 and 768×1024 exactly: single-column
scenes, a 2-column Trust grid, a 2-column handoff grid (identity cell spanning
both columns as its own row, four facts settling 2×2 beneath it — the
pattern already established for 768–1023px). Nothing above 1024px changed.

**Secondary correction, same edit.** The tablet-tier scene-plate inset was
16px — 2px short of this document's own stated tablet target of
"approximately 18–22px" (§12). Raised to 18px, the bottom of that band.

Verified after the fix, all three tablet viewports now measure identically in
kind:

| Viewport | Split | Trust cols | Handoff cols | Plate inset | Gutter |
|---|---|---|---|---|---|
| 1024×768 | 976px (1-col) | 2 | 2 | 18px | 24px |
| 834×1112 | 786px (1-col) | 2 | 2 | 18px | 24px |
| 768×1024 | 720px (1-col) | 2 | 2 | 18px | 24px |

Tablet requirements checked and confirmed: text remains readable; primary
product titles legible; scene records do not look like miniature desktop
screenshots; Trust is an intentional 2×2 layout; the unresolved record wraps
into coherent stacked groups; buttons stable; header navigation does not
collide (full nav remains visible down to 768px, hidden only below 767px per
the existing, unchanged mobile-header rule); no horizontal overflow; no
internal scrolling; normal document flow intact.

Full before/after evidence and reasoning:
`R5E1E3_RESPONSIVE_EVIDENCE/RESPONSIVE_FINDINGS.md`. Screenshots:
`R5E1E3_RESPONSIVE_EVIDENCE/screenshots/1024x768/`, `834x1112/`, `768x1024/`;
contact sheet: `contact-sheets/tablet-small-laptop.png`.

## 8. Mobile-header findings (430, 390, 375, 320)

Unchanged; reviewed, no defect found. Compact header carries only the
wordmark ("Lintel") and "Open sample" at ≤767px, per the existing rule — no
hamburger, since no additional destination exists to justify one. Confirmed
at 320px: compact height, stable horizontal padding, readable product identity,
reachable action, no label truncation, no collision, no excessive sticky-header
dominance (header height unchanged at 62px across all viewports; it never
approaches a meaningful fraction of a 568px viewport).

## 9. Mobile-hero findings (430, 390, 375, 320)

Reviewed, no defect found. Left-aligned headline at every width; the headline
wraps to 2–3 lines depending on width and its final line is sometimes a single
word ("merge."). This was reviewed and judged a natural wrap of the accepted
sentence, not an arbitrary or awkward break — every section headline on the
page wraps the same way, consistently, and is not corrected here. Paragraph
stays a concise measure; both actions remain reachable and stack full-width
per the existing, unchanged rule; the hero scene appears immediately below
with no dead zone; the selected review remains dominant; the two quiet context
rows render as inert text under the existing "Context only" note without
overwhelming the viewport; no tiny desktop application; no horizontal
overflow; no internal scrolling; no clipped mono content.

## 10. Mobile product-scene findings

Reviewed section by section against the phase brief's specific mobile
requirements; no defect found at any of the four mobile viewports.

- **Finding and Evidence** — finding stays primary, evidence relationship
  stays visible, provenance stays legible, no dense two-column record layout.
- **Missing Proof and Requirement** — missing proof immediately readable,
  blocking requirement visibly connected, merge-readiness consequence present.
- **Readiness and Human Decision** — recommendation/risk/requirements stack
  clearly; PENDING remains prominent; authority statement visible; all seven
  outcomes present, unselected, non-interactive (confirmed programmatically:
  0 of 7 focusable or carrying a role at every viewport); chips wrap into a
  calm, compact flex-wrap layout — confirmed via close-up capture at 320px
  (`screenshots/320x568/08_outcome_chips_closeup.png`), four short rows, no
  overlap, no truncation.
- **Trust** — one-column reading order, clear spacing, fine dividers, no
  boxed-card stack.
- **Handoff** — structured record becomes coherent single-column stacked
  rows; repository and title remain readable; actions clearly separated.
- **Footer** — identity and purpose first, links reachable, private-lab note
  quiet, no multi-column compression.

Contact sheet: `R5E1E3_RESPONSIVE_EVIDENCE/contact-sheets/mobile.png`.

## 11. Responsive scene-plate system

Reviewed and partially corrected (§7). Final values:

| Tier | Inset | Radius |
|---|---|---|
| ≥1280px (desktop) | 26px | 20px |
| 1025–1279px (laptop) | 20px | 20px |
| ≤1024px (tablet) | 18px | 20px |
| ≤767px (mobile) | 12px | 20px |

These land inside this document's own stated target bands (§12 of the
originating brief): desktop ~24–28px (26 ✓), tablet ~18–22px (18, now inside
the band — was 16), mobile ~12–16px (12, bottom of the band, deliberately —
see the mobile density rule). No photography, sky imagery, texture, gradient,
dark plate, glass or blur was added or considered for implementation; see §17
for the documented future opportunity.

## 12. Responsive typography

Reviewed, unchanged. The R5E.1E.2D typography pass (statements/notes 14px,
micro labels 12px, mono 12.5px, tags 12px) was re-verified at every viewport
this session and remains correct: product titles stay legible at 320px,
editorial headings do not dominate the viewport, no essential metadata renders
below the established minimums, mono treatment stays consistent, and no
clipping occurs at 200% zoom (confirmed: `200pct-zoom` capture shows the full
hero legible at 640×400 @2x with zero overflow).

## 13. Responsive spacing and page length

Reviewed, unchanged. Section rhythm steps down deliberately with viewport
(`--section-pad`: 88px desktop → 72px laptop → 56px tablet → 40px mobile),
already established by R5E.1E.2A–D and not reopened here. Full-page capture at
320×568 (`screenshots/320x568/00_full_page.png`) shows clear section
boundaries, genuine content-driven length (not padding-inflated), and no large
accidental voids — the copy/scene mismatch discussed in §6/§14 does not occur
below 1024px, since the split collapses to a single column with
`align-items: stretch` there, and each row's own content determines its
height.

## 14. Responsive motion

Reviewed and reconfirmed; the R5E.1E.2D `rootMargin: "0px 0px -22% 0px"`
correction holds at every viewport, including the ones added by this phase
(834×1112, 375×812, 430×932). Direct, not inferred:

- At 320px, scrolled so the Readiness scene sits just below the fold:
  `data-motion="armed"` (not yet revealed).
- Scrolled further so the scene has entered meaningfully:
  `data-motion="revealed"`, `[data-step="4"]` opacity `1`.
- Scrolled back above the scene, then back down to the same position:
  `data-motion="revealed"` still — confirms no restart on scroll-back, at the
  narrowest required viewport.
- Reduced motion: `data-motion` never set; every step at opacity 1
  immediately, at every viewport.
- JavaScript disabled: identical final state, no client boundary required.

No richer interactive states were added or considered for implementation in
this pass; see §18.

## 15. Accessibility and zoom

Reviewed, unchanged, reconfirmed at every viewport in this phase's set: one
`<main>`, one `<h1>`, no heading-level skip, native `<a>`/`<button>` elements
throughout, visible focus (walked 14 real stops — skip link, header nav,
header action, hero's two actions, handoff's two actions, footer wordmark and
three links — all native anchors, no trap), zero focusable outcome chips, no
meaning conveyed by colour alone, reduced-motion support confirmed, 200% zoom
usable with zero horizontal overflow, sticky header does not obscure content
(62px height, unchanged), footer links reachable, mobile header action
reachable, text resizing implied by the zoom test does not clip record
content.

## 16. Performance and stability

No dependency added; `package.json` and every lockfile confirmed unchanged by
`git diff` before and after this phase's edit. Same two client boundaries as
every prior R5E.1E.2 milestone (`PublicHeader`, `SceneMotion`) — none added.
Zero images, zero external requests, no model call, no persistence, no
telemetry, zero scrollable descendants inside `<main>`/`<footer>` at any
viewport, zero continuous scroll listeners beyond the existing header-shadow
and section-highlight observers already present before this phase.

## 17. Future surface opportunities (documented, not implemented)

See `R5E1E3_RESPONSIVE_REVIEW_PACKAGE/FUTURE_SURFACE_AND_INTERACTION_OPPORTUNITIES.md`
for the complete record. Summary: restrained atmospheric scene surfaces,
editorial material textures, and product-relevant generated visual surfaces
remain future opportunities, always subordinate to product readability and
Lintel's engineering-verification identity, never generic stock imagery, and
never implemented in this phase.

## 18. Future interaction opportunities (documented, not implemented)

See the same document. This page remains primarily demonstrative; no tabs,
state switching, editable fields, simulated processing, new dialogs,
interactive outcome selection, carousels, hover-only information, drag
behaviour, or horizontally scrolling scenes were added or are recommended for
this phase. A bounded future premium-interaction phase could explore
truthful local interactions (selecting a review, focusing a finding, revealing
evidence, switching between a small number of canonical records, inspecting
readiness context) — not implemented here.

## 19. Product truth

Preserved exactly and re-verified at every viewport, under reduced motion, and
with JavaScript disabled: `example/b2b-redemption-api`, `PR #482`, "Add
fallback handling for failed discount-code retrieval", `Tests required`,
`46/100 · MEDIUM`, `4 open · 2 blocking`, Human Decision `PENDING`, all seven
genuine decision outcomes (unselected, non-interactive), the primary finding,
its two evidence records, the one blocking missing-proof relationship, and
every readiness fact. No selected outcome, completed decision, cleared
requirement, changed recommendation or risk, customer claim, model execution,
external write, collaboration feature, or enterprise capability was introduced.

## 20. Exact responsive corrections

One file changed:
`app/_public-r5-reference-reconstruction/reference-reconstruction.module.css`
(29 insertions, 7 deletions — comments included). Two behavioural changes,
both inside the same `@media` block:

1. `@media (max-width: 1023px)` → `@media (max-width: 1024px)` — the
   tablet/mobile split-collapse boundary, so a 1024px-wide viewport (one of
   this phase's six required viewports) receives the same single-column,
   2-column-Trust, 2-column-handoff treatment already established at 834px
   and 768px, instead of an inconsistent narrow two-column split matching the
   desktop tier above it.
2. `--scene-plate-inset: 16px` → `18px` inside that same tier — aligning the
   measured tablet inset with this document's own stated 18–22px target band.

No other value, section, route, canonical value, or dependency changed.
Full before/after evidence: `R5E1E3_RESPONSIVE_EVIDENCE/RESPONSIVE_FINDINGS.md`.

## 21. Future surface opportunities — see §17

## 22. Protected scope

Unchanged, verified by `git diff` before and after this phase's edit:
`app/page.tsx`, `app/_public-r5`, `app/_public-r5-recalibrated`,
`app/visual-lab/public-r5`, `app/visual-lab/public-r5-recalibrated`,
`app/workspace`, `app/report`, `app/new`, `app/home`,
`app/review-operations`, `app/integrations`, `app/settings`,
`app/review-policies`, `app/team`, `app/visual-lab/workspace-r4`,
`lib/workspace-v2`, `public/r5/scenes`, `.claude/launch.json`, `package.json`,
lockfiles, R4 documentation, and every accepted R5 and R5E.1E.2 document. The
route wrapper (`app/visual-lab/public-r5-reference-reconstruction/page.tsx`)
was not modified — no route-level defect was found.

Modified: the one CSS file above, `docs/r5/README.md` (this milestone's
entry), this document. Created (untracked):
`R5E1E3_RESPONSIVE_EVIDENCE/`, `R5E1E3_RESPONSIVE_REVIEW_PACKAGE/`.

## 23. Browser validation

Production build (`next build` + `next start`), driven by `puppeteer-core`
against the locally installed Chrome (see §3). Confirmed at every one of the
fourteen required states: `noindex, nofollow` (unchanged from prior
milestones — not re-verified by this phase's scripts but not touched by the
one CSS edit either); one `<main>`; one `<h1>`; complete page order; exactly
one positioned element (`HEADER -> sticky`); zero scrollable descendants; no
page overlay; all navigation destinations present; hero product scene, all
alternating sections, Trust, handoff and footer all render and reveal; all
seven outcomes present and non-interactive; reduced motion and no-JavaScript
truthfulness confirmed; 200% zoom usable with zero overflow; keyboard
operation confirmed (14 native stops, no trap); one console message
(pre-existing `favicon.ico` 404) and zero page errors across a full scripted
scroll; zero layout shift implied by the unchanged CLS-relevant properties
(only `opacity`/`transform` animate, as in every prior milestone — not
independently re-measured this session, see §25 remaining questions); no
external write; no model call; canonical values unchanged.

Regression sweep, all HTTP 200: `/`, `/visual-lab/public-r5`,
`/visual-lab/public-r5-recalibrated`, `/workspace?source=fixture`, `/new`.

## 24. Remaining visual questions

See `R5E1E3_RESPONSIVE_REVIEW_PACKAGE/OPEN_VISUAL_QUESTIONS.md` for the
complete list. Headline item: whether the alternating sections' copy/scene
height mismatch (300–500px at desktop/laptop widths, quantified in §6) should
eventually be revisited with a different vertical-composition strategy, given
it was reviewed again this session and found to persist beyond what the
R5E.1E.2D `align-items: center` correction intended to resolve — carried
forward as an open question rather than corrected, since doing so now would
mean reopening already-accepted desktop composition.

## 25. Acceptance evidence

Untracked `R5E1E3_RESPONSIVE_EVIDENCE/` holds: labelled screenshots for eleven
core viewports plus three states (each with first viewport, seven named
sections, a full-page capture, and — for viewports ≤1024px — an outcome-chip
close-up), four contact sheets, three machine-readable JSON sweeps
(`structural-sweep.json`, `states-sweep.json`, `a11y-motion-sweep.json`), and
`RESPONSIVE_FINDINGS.md`, `VIEWPORT_METADATA.md`, `CAPTURE_METHODOLOGY.md`.

Untracked `R5E1E3_RESPONSIVE_REVIEW_PACKAGE/` holds the complete 23-document
human-review package described in that folder's own `README.md`.

## Human responsive visual acceptance and closeout

R5E.1E.3 received human responsive visual acceptance on 4 August 2026.

The following representative states were manually reviewed and accepted:

1. 1024�768 full-page and section composition.
2. 834�1112 full-page composition.
3. 390�844 hero, Readiness and unresolved-case handoff.
4. 320�568 hero and wrapped Human Decision outcomes.
5. Emulated 200% zoom composition.

The review confirmed:

1. The corrected 1024px breakpoint now enters the intended tablet composition.
2. Product scenes remain readable and intentionally composed at tablet widths.
3. Mobile navigation remains compact and collision-free.
4. The mobile hero preserves the selected review and canonical readiness state.
5. Finding, Evidence, Missing Proof and Requirement remain legible without internal scrolling.
6. Human Decision PENDING remains prominent on mobile.
7. All seven genuine decision outcomes wrap cleanly and remain unselected and non-interactive.
8. Trust reflows coherently from four columns to two columns and then one column.
9. The unresolved-case record becomes a clear stacked composition on narrow screens.
10. The scene-presentation plate retains proportionate insets across desktop, tablet and mobile.
11. The page remains usable at the emulated 200% zoom state without horizontal overflow.
12. Local motion remains one-shot and does not restart when scrolling back.
13. Canonical PR #482 product truth remains unchanged.
14. No atmospheric imagery or richer interaction was introduced during responsive correction.
15. Production routes and the frozen R4 product remain unchanged.

The accepted responsive system now includes:

- desktop plate inset: approximately 26px;
- tablet plate inset: 18px;
- mobile plate inset: 12px;
- tablet split collapse at and below 1024px;
- normal document flow at every viewport;
- no internal public-scene scrolling;
- no page-level overlays;
- deliberate responsive reflow rather than uniform desktop shrinking.

R5E.1E.3 is accepted and closed.
