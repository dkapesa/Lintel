# R5C — Private Public Visual Laboratory

Branch: `r5c-private-public-visual-laboratory`
Route: `/visual-lab/public-r5`
Status: implemented, not linked from any production surface.

This document records what R5C built, the sources it used, the deliberate
deviations it made from the working copy under the accepted authority order,
and what remains for R5D and R5E. It does not reopen or restate the R5A
visual direction or the R5B page architecture beyond what is needed to
explain an implementation choice; those documents remain authoritative and
were not edited.

---

## 1. Purpose

R5C proves the accepted public homepage direction — **Precise Product
Editorial, One Continuous Case** — as working code, at a private, unlinked,
noindexed route, before any change is made to the production landing page
(`app/page.tsx`). It resolves execution values only: type scale, grid,
colour values, crop boundaries, and accessibility/keyboard behaviour. It
does not decide narrative, section responsibility, copy direction, scene
assignment, motion count or the canonical scenario, all of which were
decided in R5A and R5B.

## 2. Route ownership

- `app/visual-lab/public-r5/page.tsx` — server component, `export const
  metadata` sets `robots: { index: false, follow: false, googleBot: {
  index: false, follow: false } }`.
- `app/visual-lab/public-r5/sections.tsx` — the eight section components.
- `app/visual-lab/public-r5/content.ts` — the single content source and
  single canonical-facts source (R5B §19f), including every eyebrow,
  headline, supporting paragraph, caption and alt-text string.
- `app/visual-lab/public-r5/components/PublicR5Header.tsx`,
  `PublicR5Footer.tsx`, `CropFrame.tsx` — shell and shared scene primitives.
- `app/visual-lab/public-r5/public-r5.module.css` — a self-contained CSS
  module. No class or custom property is shared with the production landing
  page, `app/landing/*`, or any other visual-lab route.

The route is not imported by `app/page.tsx`, not registered in any nav
config, and not reachable from logged-in application navigation. It follows
the existing precedent set by `app/visual-lab/landing-v3` and
`app/visual-lab/workspace-r4`. No dependency was added; the route uses only
`next/image`, `next/link` and the Geist Sans / Geist Mono font variables
already registered on `<html>` by `app/layout.tsx`.

The page is fully server-rendered. There is no client component and no
JavaScript in this route: the header is static (not fixed, not sticky, no
scroll listener), and R5C's motion placeholders (§7 below) require no
hydration boundary, since nothing is hidden behind an observer.

## 3. Accepted visual direction implemented

- Geist Sans for headings, body and interface copy; Geist Mono restricted to
  stage/section numbers and the provenance line (run, head, branch) — no
  other monospace use.
- Warm neutral page ground (`#f7f4ee`), white product surfaces, charcoal
  primary type (`#1c1a16`), fine 1px structural borders, no shadow, no
  radius on scene frames.
- Exactly two charcoal sections (verification model, trust and
  architecture); product insets inside them stay light and are never
  recoloured.
- No display font, no gradient, no glass, no glow, no decorative particle,
  no browser chrome around any scene, no fixed product summary band, no
  persistent page index.

## 4. Eight-section structure

Implemented in order, each a single React component in `sections.tsx`,
matching R5B §5 exactly: Hero, Verification problem, Verification model,
Investigation Workspace, Missing proof and requirements, Readiness and Human
Decision, Trust and architecture, Final action. Every section carries
exactly one `<h2>` (the hero carries the page's only `<h1>`), one eyebrow,
and the working copy from R5B §5, copied verbatim into `content.ts`. The
canonical case — `Tests required`, `46/100 MEDIUM`, `4 open · 2 blocking`,
`Merge readiness blocked`, `Human Decision pending` — is unchanged across
all eight sections; no requirement clears and no decision is recorded
anywhere on the page.

## 5. Product-scene sources

All scenes use only the accepted files under `public/r5/scenes`. None were
edited, annotated, composited, recoloured, resized or re-encoded.

| Section | Scene | Source file(s) |
|---|---|---|
| 1 Hero | A | `hero-workspace.jpg` (full), `mobile-queue.jpg` (mobile) |
| 2 Verification problem | B | `hero-workspace.jpg`, two CSS-cropped fragments (see §6) |
| 3 Verification model | C | `review-map.png`, CSS-cropped (see §6) |
| 4 Investigation Workspace | D | `workspace-inspector.jpg` (full), `mobile-record.jpg` (mobile) |
| 5 Missing proof and requirements | E | `evidence-missing-proof.jpg` + `requirement-continuation.jpg` (two genuine sequential states, now CSS-cropped — see §6 and §13), `mobile-record.jpg` (mobile) |
| 6 Readiness and Human Decision | F | `human-decision-preview.jpg` (CSS-cropped since the §13 correction pass — see §6) |
| 7 Trust and architecture | G | `handoff-boundaries.jpg`, CSS-cropped (see §6) |
| 8 Final action | H | `hero-workspace.jpg`, CSS-cropped; `mobile-queue.jpg`, CSS-cropped (mobile) |

Two source-file identities worth recording explicitly, both truthful and
both already documented upstream:

- `handoff-boundaries.jpg` (Scene G) and `workspace-inspector.jpg` (Scene D)
  are byte-identical (confirmed by SHA-256). Both are the same genuine
  Overview + Inspector capture, used at two different crop responsibilities,
  exactly as `R5B1_CAPTURE_MANIFEST.md` records.
- Every file under `public/r5/scenes` except `review-map.png` carried a
  `.png` extension but was actually JPEG-encoded (confirmed by magic-byte
  inspection). This was a pre-existing property of the accepted asset set,
  not something the original R5C build introduced. By the time of the §13
  correction pass, the rendered route showed broken images and alt-text
  fallbacks in Investigation Workspace, Evidence, Requirement continuation
  and Readiness/Human Decision, so as its first step that pass verified
  every file's true format against its extension and renamed the eight
  mismatched files to their true `.jpg` extension (bytes untouched,
  confirmed byte-identical before/after by SHA-256, and confirmed via
  `createImageBitmap` decode and a direct `fetch()` content-type check
  against the rebuilt route afterward — see §13). `review-map.png` was
  already genuinely PNG-encoded and was not renamed.

**Frozen-product-truth deviation from the R5B working copy.** R5B's working
copy for the Missing proof and requirements section uses the placeholder
requirement title `Prove merge condition`. The accepted
`requirement-continuation.jpg` capture shows the frozen product's actual
requirement: **`Idempotency proven under retry`**, `blocking · open`. This
exact string is also listed as accepted record content in
`R5B1_SCENE_RESOLUTION_ADDENDUM.md`. Per that addendum's authority order
(frozen production truth outranks the architecture's working copy for
product-scene detail), `content.ts` and Section 5's copy use `Idempotency
proven under retry`, not `Prove merge condition`. No other locked value was
changed.

## 6. CSS crop boundaries

All crops are non-destructive: the source file is never touched. A
rectangle in source-pixel space is revealed through an `overflow: hidden`
window, using `width` and `margin` percentages on the `next/image` element
(`components/CropFrame.tsx`). Both axes resolve against the same
containing-block width (a property of how CSS resolves margin percentages),
so the crop is exact at every viewport width with no JavaScript. This was
verified against `getBoundingClientRect()` output on the built page and
matched the expected offsets within sub-pixel rounding.

| Crop | Source | Rectangle (source px) | Origin |
|---|---|---|---|
| Scene C — Review Map stages | `review-map.png` (1585×991) | left 350, top 92, right 1450, bottom 200 | Exact, accepted boundary from `R5B1_CAPTURE_MANIFEST.md` §Scene C. |
| Scene G — handoff rows | `handoff-boundaries.jpg` (1600×1000) | left 1250, top 520, right 1600, bottom 685 | Measured directly against the source image. No R5 document gives pixel coordinates for this crop; R5B §12 only specifies "from GitHub App to the end of the Slack handoff description." |
| Scene B fragment 1 — Next inspection | `hero-workspace.jpg` (1600×1000) | left 335, top 200, right 1215, bottom 275 | Measured directly. See note below. |
| Scene B fragment 2 — Evidence boundary | `hero-workspace.jpg` (1600×1000) | left 325, top 600, right 790, bottom 800 | Measured directly. |
| Scene H desktop — closing record line | `hero-workspace.jpg` (1600×1000) | left 330, top 0, right 1600, bottom 142 | Measured directly. |
| Scene H mobile — closing queue rows | `mobile-queue.jpg` (390×843) | left 0, top 195, right 390, bottom 350 | Measured directly. |
| Scene E primary — evidence state | `evidence-missing-proof.jpg` (1600×1000) | left 0, top 155, right 1600, bottom 755 | Added in the §13 correction pass. Measured by canvas pixel-boundary scan against the served asset; trims the header/four-cell band above and the Findings list below, keeping the tab row through the missing-proof block. |
| Scene E secondary — requirement continuation | `requirement-continuation.jpg` (1600×1000) | left 0, top 460, right 1600, bottom 750 | Added in the §13 correction pass. Measured the same way; keeps the Requirements heading and the first (linked) requirement row only, deliberately excluding the remaining requirement list to stay compact and secondary to the evidence state above it. |
| Scene F — decision flow | `human-decision-preview.jpg` (1600×1000) | left 0, top 60, right 1600, bottom 950 | Added in the §13 correction pass. Measured by canvas pixel-boundary scan for the modal's true top/bottom edges (≈y115–y880); the crop trims the excess blank margin above and below the modal while keeping the full-width dimmed Queue and Inspector context on both sides. |

**On the unresolved Scene B / Scene H crop boundaries.** Neither the R5C
brief nor `R5B1_SCENE_RESOLUTION_ADDENDUM.md` names Scene B or Scene H by
letter or gives them pixel boundaries — only Scenes A, C, D, E, F and G are
resolved there. R5B §13's scene map assigns both to the pre-recapture source
`01_workspace_core.png`, which `hero-workspace.png` supersedes. Lacking any
accepted rectangle, R5C measured these six crops directly against the
accepted source images and deliberately over-padded every boundary, so a
small measurement error only shows a sliver more surrounding white space —
never a truncated value. This is recorded here as the specific execution
decision it is, not as a reinterpretation of the architecture: the content
required by R5B §5 for sections 2 and 8 is present and unedited in every
crop.

## 7. Static motion placeholder boundary

R5C does not implement the final motion system. All three future motion
moments' complete final content is present, readable and unhidden by
default:

- `data-motion-slot="queue-entry"` on the hero scene wrapper (moment one).
- `data-motion-slot="evidence-to-requirement"` on the evidence/requirement
  scene wrapper in section 5 (moment two).
- `data-motion-slot="decision-surface-open"` on the readiness scene wrapper
  in section 6 (moment three).

These are inert data attributes only — no observer, no initial-opacity
state, no scroll listener, no JavaScript exists in this route. They mark
where a future milestone (R5D) attaches the motion system named in R5B §18,
without R5C guessing at its implementation.

## 8. Responsive behaviour

Breakpoints: mobile styles apply below 768px (nav labels and desktop scenes
hidden, mobile scenes and compact header action shown); two-column sections
(3, 5, 7) stack below 1100px, matching R5B §17b's "down to roughly 1100
pixels" rule. Verified overflow-free (`document.documentElement.scrollWidth
<= clientWidth`) at all six required viewports: 1600×1000, 1280×800,
1024×768, 768×1024, 390×844, 320×568.

The Review Map inset (section 3) becomes a horizontally scrollable region
at mobile width (`overflow-x: auto` on a bounded container), with a
Geist Mono stage-number index rendered beneath it — the one place a locally
scrollable strip is used, per the R5C brief's explicit allowance.

A genuine CSS Grid bug was found and fixed during this milestone: nested
`1fr` grid tracks (`.modelGrid` → `.stageRow`, and equivalently
`.trustGrid` → `.statement`) do not shrink below their content's min-content
width by default, and grid items carry an implicit `min-width: auto` that
propagates the same way. At mobile width this caused the entire document to
overflow horizontally (confirmed via `getBoundingClientRect` scanning, not
guessed). The fix — `minmax(0, 1fr)` on every such track, plus explicit
`min-width: 0` on the grid-item wrappers that hold them, including the
wrapper around the intentionally-fixed-width (720px) mobile Review Map
scroll frame — is present in `public-r5.module.css` and was re-verified
overflow-free after the fix.

## 9. Protected R4 surfaces

Not modified by this milestone: `app/page.tsx`, `app/workspace`,
`app/report`, `app/new`, `app/home`, `app/review-operations`,
`app/integrations`, `app/settings`, `app/review-policies`, `app/team`,
`app/visual-lab/workspace-r4`, storage schemas or keys, Human Decision
logic, product fixture values, authentication or organisation capability,
and `package.json` / lockfiles. Confirmed by `git diff` against each path
returning empty (§11) and by `/`, `/workspace?source=fixture` and
`/visual-lab/workspace-r4?source=fixture` all returning HTTP 200 from the
production build unchanged.

## 10. Work intentionally deferred

The locked milestone sequence (see `docs/r5/README.md`) is: R5D transfers the
accepted private laboratory to the production homepage without redesign;
R5E implements the accepted product-scene transitions and restrained motion
system. Deferred work below is organised under that order.

**To R5D:**

1. Promoting the proven direction from this private route onto the
   production `app/page.tsx` landing page, without redesign.
2. Anything explicitly deferred beyond the initial homepage in R5A §19b /
   R5B §20b: public documentation, changelog, pricing, customer proof,
   integrations directory, governance pages, a second canonical scenario,
   search, internationalisation, a public status surface.

**To R5E:**

1. The three named motion moments (`queue-entry`,
   `evidence-to-requirement`, `decision-surface-open`) — easing, duration,
   scroll-trigger thresholds and one-time-fire behaviour, attached to the
   placeholders described in §7.
2. A dedicated mobile capture for Scene F (Human Decision), if one is
   accepted in a future scene-resolution pass — R5C reuses the single
   accepted `human-decision-preview.jpg` at every width, since no mobile
   decision-surface asset exists in the accepted set (see §5, §12).
3. Pixel-accepted crop boundaries for Scene B and Scene H, if a future
   milestone wants to formalise the measured rectangles in §6 the way Scene
   C's rectangle is formalised in `R5B1_CAPTURE_MANIFEST.md`.

## 11. Build and browser validation

- `npx tsc --noEmit` — passes, no errors.
- `npm run build` — passes; `/visual-lab/public-r5` builds as a static
  (`○`) page.
- Production server (`npm run start`) validated in the Browser pane at all
  six required viewports: no horizontal overflow, exactly one `<main>`,
  exactly one `<h1>` and seven `<h2>` (one per non-hero section), exactly
  two charcoal sections (`verification-model`, `trust-architecture`),
  `<meta name="robots" content="noindex, nofollow">` present.
- Every scene image (9 unique source files, 14 `<img>` placements) verified
  to fetch HTTP 200 through the Next.js image optimizer and decode to
  exactly its expected intrinsic dimensions (1600×1000, 390×843, or
  1585×991 for `review-map.png`).
- The Scene C crop was verified pixel-exact: the built page's computed
  `margin-left` / `margin-top` / `width` percentages on that `<img>`,
  measured via `getBoundingClientRect()`, reproduced the accepted (350, 92,
  1450, 200) rectangle within sub-pixel rounding.
- Keyboard tab order verified: skip link → brand → Product → How it works →
  Security → header primary action, each with a visible focus outline.
- Text contrast checked against WCAG 2.1 thresholds for every text colour
  token; `--r5-ink-3` (trust line, footer legal line) was found under
  4.5:1 against the warm-neutral ground during this pass and was darkened
  from `#948c7a` to `#726a56` (4.89:1) to pass AA for small text. All other
  tokens passed without change (ink on ground 15.83:1, ink-2 on ground
  5.34:1, charcoal-ink on charcoal 15.5:1, charcoal-ink-2 on charcoal
  6.78:1).
- Protected routes re-confirmed unchanged and serving: `/`,
  `/workspace?source=fixture`, `/visual-lab/workspace-r4?source=fixture`.

## 12. Known limitations

- **This session's Browser pane could not composite frames.**
  `computer` screenshot calls failed with "the Browser pane is not
  displayed, so the page is not compositing frames" for the entire
  session, on every attempted retry. `window.scrollTo()` and native
  anchor-hash scrolling likewise had no visible effect on `window.scrollY`
  in this session, and native lazy-loaded images did not transition out of
  `img.complete === false` even after scrolling and generous waits —
  consistent with the same non-compositing limitation, not a defect in the
  page. Because of this, **no genuine PNG screenshots could be produced in
  this session**, and the `R5C_HUMAN_REVIEW_PACKAGE` documents this
  explicitly rather than fabricating captures. All layout, overflow,
  contrast, focus-order and crop-geometry claims in §11 were instead
  verified through DOM/CSSOM introspection
  (`getBoundingClientRect`, `getComputedStyle`, direct `fetch()` and
  `new Image()` decode checks), which do not depend on compositing and
  were cross-checked multiple times.
- Scene F (Human Decision) has no accepted mobile-specific capture. R5C
  presents the single accepted `human-decision-preview.jpg` responsively at
  every width rather than inventing a crop; at 320–390px width its interior
  text is smaller than the page's other scenes. This mirrors how R5B's own
  responsive table already treats the section 7 handoff inset as a
  "preserved desktop crop" on mobile.
- Scene B and Scene H crop boundaries are measured, not accepted-document
  pixel values (see §6). They were deliberately over-padded to avoid
  truncating any value, but they have not been through the same explicit
  human-acceptance pass as Scene C's rectangle. The same is true of the
  Scene E and Scene F crop boundaries added in §13.
- Sections 4 and 5 both use `mobile-record.jpg` at mobile width, since it
  is the only accepted mobile record capture and genuinely contains both
  sections' required content as one continuous scrollable record in the
  real product.

## 13. Correction pass (visual defects and composition)

A follow-up pass on this same branch corrected visual defects and
composition weaknesses observed on the rendered route, without reopening
the accepted R5A direction, the R5B architecture, or this document's
section/scene assignments. No section was added or removed, no accepted
copy was rewritten, `app/page.tsx` and the frozen R4 product were not
touched, and no dependency was added.

**a. Image format correction.** The eight JPEG-encoded files under
`public/r5/scenes` that carried a `.png` extension (see §5) were renamed to
`.jpg`, bytes unchanged: `evidence-missing-proof`, `handoff-boundaries`,
`hero-workspace`, `human-decision-preview`, `mobile-queue`, `mobile-record`,
`requirement-continuation`, `workspace-inspector`. `review-map.png` was left
untouched (genuinely PNG). Every `src` reference in `sections.tsx` was
updated to match. Verified byte-identical before/after by SHA-256, verified
decodable via `createImageBitmap`, and verified served with the correct
`image/jpeg` content type by the built route.

**b. Action-label correction.** The primary and secondary action labels
were rendering with invisible (inherited) text colour because
`public-r5.module.css`'s `.page a { color: inherit; }` (specificity 0,1,1,
inside `.page` and matching the `<a>` element) outranked `.btnPrimary`'s own
`color` declaration (specificity 0,1,0), so the button's inherited charcoal
text sat on its own charcoal background. Changed the selector to
`.page :where(a)`, which zeroes the selector's specificity, so any later,
equal-or-higher-specificity rule (`.btnPrimary`, `.btnSecondary`,
`.navLink`, `.footerLink`) wins as originally intended. No other rule
changed; hover and focus states were already correct once the resting-state
colour was fixed.

**c. Hero correction.** The hero copy block (`.heroCopy`) was recomposed as
a centred editorial introduction — eyebrow, H1, supporting paragraph,
actions and trust line all centred, measure constrained to 820px (within
the requested 760–860px range) — on desktop only; the existing mobile
left-aligned treatment was left unchanged, consistent with this pass's
scope of desktop composition and no mobile redesign. The Workspace scene
below was already breaking to 1360px on a 1600px viewport (within the
requested 1240–1360px range) and required no change.

**d. Verification model correction.** The Review Map inset was constrained
to roughly a third of the two-column `modelGrid`, rendering at
approximately 380px wide (≈37px tall at its accepted aspect ratio) — a
thumbnail. Restructured Section 3 so the eight-stage record and the
orientation note stay in the editorial column, and the Review Map inset
moves to its own full-width wrap (`modelInsetWrap`, up to 1360px, mirroring
the Investigation Workspace scene's wrap) beneath it. The inset now renders
at up to 1360px wide (≈133px tall at the same aspect ratio), roughly 3.6×
larger, with the accepted crop rectangle from `R5B1_CAPTURE_MANIFEST.md`
unchanged.

**e. Investigation Workspace.** No composition change was needed once (a)
was fixed: the scene was already framed at up to 1360px with no fixed
height, so it renders at full intrinsic scale (1296×810 measured at a
1600px viewport) with no reserved empty space.

**f. Evidence and requirement correction.** The two full 1600×1000 frames
were replaced with two non-destructive crops (`evidenceState`,
`requirementState` — see §6), stacked in a compact vertical sequence: the
evidence/missing-proof state renders first and full width; the requirement
continuation renders second, narrower (`width: 86%`, right-aligned) and
shorter, so the pair reads as primary-then-secondary rather than two
equal-sized crops. Both genuine product states and their exact recorded
values are unchanged.

**g. Readiness and Human Decision correction.** The full 1600×1000 frame
was replaced with a non-destructive crop (`humanDecision` — see §6) that
trims the blank margin above and below the decision modal (measured at
≈y115–y880 of 1000) while keeping the full width, so the dimmed Review
Queue and Contextual Inspector context on both sides of the modal is
preserved. The read-only warning, all seven outcomes and the disabled
submit action are unchanged and remain inside the crop.

**h. Trust and architecture density correction.** `.statementList` now uses
`column-count: 2` above 1100px (four statements per column, `break-inside:
avoid` on each `.statement`, source order preserved — column fill order is
top-to-bottom-then-next-column, so statements 1–4 sit in the first column
and 5–8 in the second), collapsing to a single column below 1100px. The
handoff inset moved out of the two-column grid into its own supporting
block below the statements (max-width 460px, right-aligned on wide
desktop), materially shortening the section.

**i. Final action correction.** `.finalSceneFrame`'s max-width increased
from 560px to 680px (`.finalCopy` from 560px to 620px to keep the column
in proportion), a moderate, bounded increase. This session could not
visually confirm fine-print legibility at that scale (§12's compositing
limitation), so this is recorded as a judgement call rather than a
measured pass/fail; the fallback of removing the crop entirely was
considered and not taken, since the crop still fits its role as the
smallest, quietest scene on the page per R5B §5.8i.

**j. Charcoal neutralisation.** `--r5-charcoal` (#19180f → #181815),
`--r5-charcoal-surface` (#211f16 → #1c1c19), `--r5-charcoal-border`
(#38352a → `rgba(245,244,239,0.14)`, an explicitly neutral low-opacity
light hairline rather than a warm-toned solid colour), `--r5-charcoal-ink`
(#f3efe4 → #f5f4ef, matching the requested warm near-white) and
`--r5-charcoal-ink-2` (#a89f8b → #a6a196, a gentler warm grey) were
adjusted to remove the brown/olive cast (the prior background's R/G/B
channels differed by up to 10; the new background's channels differ by at
most 3). Product insets inside both charcoal sections were not recoloured.
Contrast re-checked after the change: charcoal-ink on charcoal ≈15.9:1,
charcoal-ink-2 on charcoal ≈8.4:1 — both comfortably pass AA.

**k. Validation performed.** `npx tsc --noEmit` and `npm run build` both
passed. The production build (`npm run start`) was checked in the Browser
pane at 1600×1000, 1280×800, 1024×768, 768×1024, 390×844 and 320×568: no
document-level horizontal overflow at any width, exactly one `<h1>` and
seven `<h2>`, exactly one `<main>`, exactly two charcoal sections (both
confirmed `rgb(24, 24, 21)`), `<meta name="robots" content="noindex,
nofollow">` present, the architecture two-column layout active above
1100px and single-column below, and every scene image fetched with HTTP
200 and the correct `image/jpeg` or `image/png` content type. Because this
session's Browser pane could not composite frames (§12), these checks used
DOM/CSSOM introspection and `fetch()`/`createImageBitmap()` decode checks
rather than screenshots; the `git diff` / lockfile / protected-route
checks in §11's method were re-run and are unchanged in outcome.

**l. Remaining limitations carried forward from this pass.** Final-action
crop legibility at 680px could not be visually confirmed (see (i) above).
Evidence/requirement crop boundaries in §6 are measured, not
accepted-document pixel values, matching the existing caveat on Scene B and
Scene H. No genuine screenshots were produced this pass either, for the
same reason recorded in §12.
