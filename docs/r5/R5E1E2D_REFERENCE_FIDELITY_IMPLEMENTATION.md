# R5E.1E.2D — Reference Fidelity Implementation Pass

Bounded implementation record for the corrections R5E.1E.2C measured and
classified. Implements exactly the nine bounded corrections from
[`R5E1E2C_HUMAN_REVIEW_PACKAGE/R5E1E2D_IMPLEMENTATION_BRIEF.md`](../../R5E1E2C_HUMAN_REVIEW_PACKAGE/R5E1E2D_IMPLEMENTATION_BRIEF.md).
Architecture is not reopened; no section, route or canonical value changed.

Companion documents (unchanged authority):
[`R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md),
[`R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md),
[`R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md`](./R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md),
[`R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md`](./R5E1E2C_REFERENCE_FIDELITY_EVALUATION.md).

---

## 1. Purpose and bounded scope

R5E.1E.2C measured the remaining visual, motion and compositional gap between
Cursor, Skybase and the completed reference reconstruction, and classified
every finding as Freeze / Bounded correction / Defer / Reject. This milestone
implements the nine **Bounded correction** findings and nothing else. Fourteen
**Freeze now** findings were left untouched; six **Deferred** findings were not
attempted; five **Rejected** directions were not taken.

## 2. R5E.1E.2C inputs

The exact bounded correction list from the implementation brief, each
traceable to a measured finding:

| # | Correction | Measured gap |
|---|---|---|
| A | Gutter refinement | 123→100 CSS px vs Cursor 82, Skybase 100 |
| B | Split geometry | Scene 61.9% of band vs Cursor 65.7%, Skybase 66.7% |
| C | Scene presentation plate | No plate/inset vs Skybase's uniform 72 video px |
| D | Product typography | Statements 13px vs reference 14–16px |
| E | Readiness density + copy alignment | ≈416 CSS px dead space; 2-row chip block |
| F | Trust full band | 69% band usage, asymmetric |
| G | Handoff structured record | Canonical values as one 13px caption line |
| H | Motion trigger timing | Sequence 82% below fold at reveal |

## 3. Frozen findings

Preserved without redesign, per R5E.1E.2C's fourteen Freeze-now findings:
normal document flow; only the header sticky; the complete page order; ~176px
section rhythm; three alternating product relationships; the accepted 1300px
outer envelope; the hero scene's vertical entry position and overall scale;
the ~81% working-area dominance; the Finding and Evidence content model; the
simplified one-chain Missing Proof scene; Readiness as an authority boundary;
all seven Human Decision outcomes; the unresolved PR #482; the white canvas;
local one-shot motion; the quiet footer; zero internal scene scrollbars; zero
overlays; zero images; zero gradients; no dark section reset; no new public
routes; no production transfer.

None of these was touched. Cursor fidelity was not reinterpreted as exact
visual copying at any point — no reference asset, wording, geometry or
animation was introduced.

## 4. Public gutter

`--pub-gutter` reduced from 40px to **32px** at the base tier. `--pub-max`
stays at its accepted 1300px — R5E.1E.2C's device-pixel-ratio analysis proved
Cursor's band is 1296 CSS px and Skybase's 1278, both already within a few
pixels of Lintel's existing envelope, so only the gutter needed correcting.

The tablet tier was **not** clamped to the same 32px — it steps further down to
**24px**, and the mobile tier stays at its already-safe **20px**, giving each
tier its own value rather than forcing one desktop number everywhere narrow.

| Tier | Before | After |
|---|---|---|
| ≥1280px (and 1024–1279px, unchanged at this tier) | 40px | **32px** |
| ≤1023px | 32px | **24px** |
| ≤767px | 20px | 20px (unchanged) |

Verified: inner content width now 1216 CSS px at 1280px viewport (was 1200);
navigation, hero, every section and the footer all remain aligned to the same
`.wrap` — they share one class, so alignment could not drift.

## 5. Alternating section geometry

`.splitGrid` copy column 400px → **360px**, gap 64px → **56px** (via
`--split-gap`), applied uniformly to Finding and Evidence, Missing Proof and
Requirement, and Readiness and Human Decision — the only three sections using
`.splitGrid`. Trust and the handoff, which never used this primitive, were not
touched.

Measured result at 1280px: scene track **800 CSS px** of 1216 available
(65.8%), up from 754px (61.9%) — now inside the 65.7–66.7% range both
references occupy.

`align-items: start` → **`center`** on `.splitGrid`. This has a visual effect
only once the two tracks sit side by side (≥1024px); below that the grid
collapses to one column where each row is sized to its own content and
centring is a no-op, so an explicit `align-items: stretch` was added at that
breakpoint for clarity rather than relying on the no-op. This directly
corrects the ≈416 CSS px of empty copy column measured beside the Readiness
scene. `.splitCopy`'s vestigial `padding-top: 8px` (a leftover optical nudge
from the `start`-aligned era) was removed, since it would otherwise offset the
now-centred block.

## 6. Product-scene presentation plate

The single largest measured gap. A new shared class, `.scenePlate`, wraps
`.sceneFrame` in all four scene components (`HeroReviewScene`,
`FindingEvidenceScene`, `MissingProofRequirementScene`,
`ReadinessDecisionScene`):

```css
.scenePlate {
  background: var(--pub-surface-2);   /* #fafaf9 — existing token */
  border: 1px solid var(--pub-border); /* #e1e1de — existing token */
  border-radius: 20px;
  padding: var(--scene-plate-inset);
}
```

No new token was introduced. No imagery, gradient, glass or shadow was added —
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §5's prohibition on copied
environmental imagery is why the references' photographic plates become a flat
surface here instead. `.sceneFrame` itself — background, border, radius,
`overflow: hidden` — is byte-identical to before; only a new ancestor wraps it.

`--scene-plate-inset` steps down with the existing breakpoint tiers rather than
staying fixed:

| Viewport | Inset |
|---|---|
| ≥1280px | 26px |
| 1024–1279px | 20px |
| 768–1023px | 16px |
| ≤767px | 12px |

Verified at every required viewport: the plate is present (4 instances,
confirmed programmatically), never causes horizontal overflow — including at
320px, the narrowest tier and the one place additive padding could have
regressed — and introduces zero scrollable descendants.

## 7. Product typography

One controlled step up, inside product scenes only:

| Class | Before | After |
|---|---|---|
| `.recordStatement` | 13px / 1.55 | **14px** / 1.5 |
| `.readinessNote` | 13px / 1.55 | **14px** / 1.5 |
| `.unresolvedDetail` | 13px | **14px** |
| `.sceneFootnote` | 13px / 1.45 | **14px** / 1.45 |
| `.microLabel` | 11px, 0.07em | **12px**, 0.06em |
| `.mono` | 12px | **12.5px** |
| Tag pills (`.tagSeverity` etc.) | 11px, 0.05em | **12px**, 0.04em |

Record and scene titles (16–20px), fact values (14px), the authority
statement (15px), hero/section headings and editorial supporting copy were
**not** touched — R5E.1E.2C measured these as already comparable to both
references, and the brief explicitly excludes navigation, the hero headline,
editorial section headings, buttons and the footer from this correction.
`.microLabel` and `.mono` are shared with the Trust section's record labels;
raising them there too keeps one coherent type scale rather than forking it
for a 1px difference, and neither Trust's heading nor its paragraph size
changed.

## 8. Readiness and Human Decision density

Preserved exactly: the fact row, the tag row, the readiness note, the PENDING
block, the authority statement, all seven outcomes, and the four-step motion
sequence.

Corrected:

1. **Copy-column dead space** — resolved by the `align-items: center` change
   in §5, which applies to this section along with the other two.
2. **Outcome-chip weight** — `.outcomeChip` padding `5px 12px` → `4px 10px`,
   font-size `12.5px` → `12px`; `.outcomeChipList` gap `8px` → `6px`. Borders
   and background were already the quiet `--prod-border-subtle` /
   `--prod-surface-2` tokens and were not changed further.
3. **Closing note** — shortened from a two-line, 34-word sentence to one line,
   17 words: *"Seven outcomes are available and unselected. Open the sample
   review for the complete decision surface."*
4. **Wording** — the phrase "shown below" was removed; the new sentence states
   what is true independent of layout.

None of the seven outcome labels was renamed, reordered or removed. None
carries a selected state, a `role`, or a focusable attribute — verified
programmatically: 0 of 7 are interactive at every tested viewport.

## 9. Trust composition

`.trustGrid` changed from a 2-column grid capped at `max-width: 900px` (69% of
band, empty right third) to **4 equal columns spanning the full band**, each
record carrying a fine top rule (`border-top: 1px solid var(--pub-border-subtle)`)
as its only structural cue — no fill, no card, no illustration.

| Viewport | Columns |
|---|---|
| ≥1024px | 4 |
| 768–1023px | 2 |
| ≤767px | 1 (unchanged) |

Heading, paragraph and all four records' text are byte-identical to R5E.1E.2B.
No compliance claim, deployment claim, customer logo, diagram, roadmap
language, dark background or second call to action was added — all explicitly
prohibited by the R5E.1E.2B brief and re-confirmed here.

Verified: band usage now 100% at every desktop/tablet width where 4 or 2
columns render (measured directly against `.wrap`'s width).

## 10. Unresolved-case structured record

The single line of 13px grey caption text is replaced by `.handoffGrid`, a
5-cell bordered record reusing the exact `.fact` / `.factValue` / `.microLabel`
primitives the hero scene's fact row already establishes — the same product
grammar, not a new one:

| Cell | Content |
|---|---|
| 1 (wider, 1.6fr) | "REVIEW" — repository (mono), then PR label + title |
| 2 | "RECOMMENDATION" — Tests required |
| 3 | "RISK" — 46/100 · MEDIUM |
| 4 | "REQUIREMENTS" — 4 open · 2 blocking |
| 5 | "HUMAN DECISION" — PENDING (amber, via the existing `.factPending`) |

No canonical value changed; every value already existed elsewhere on the page.
No new component was created — `HandoffSection.tsx` gained markup, not a new
file.

Responsive: 5 columns at ≥1024px; at 768–1023px the identity cell spans both
columns as its own row above a 2×2 grid of the four facts; at ≤767px, one
column, all cells stacked.

## 11. Scene-motion trigger timing

One constant, in `SceneMotion.tsx`:

```
REVEAL_ROOT_MARGIN: "0px 0px -80px 0px"  →  "0px 0px -22% 0px"
```

Verified directly: with the viewport scrolled so the Readiness scene's chrome
bar sits 49px *below* the fold (`top: 849` in an 800px-tall viewport), the
scene is still `armed`, not `revealed` — the sequence no longer fires while a
scene is mostly off-screen. Scrolling the same scene to centre reveals it
completely, with `[data-step="4"]` reaching `opacity: 1`.

Everything else about the controller is unchanged: `threshold: 0` (required
for scenes taller than the viewport — the R5E.1E.2A fix), one-shot activation,
immediate disconnect, no scroll reading, no global state, no pinning.

## 12. Local motion preservation

All four sequences are byte-identical to R5E.1E.2B/R5E.1E.2A in content and
order:

| Scene | Sequence |
|---|---|
| Hero | Selected review → readiness emphasis → attention finding emphasis |
| Finding and Evidence | Finding → evidence relationship → provenance emphasis |
| Missing Proof and Requirement | Missing proof → open blocking requirement → blocked-readiness consequence |
| Readiness and Human Decision | Readiness facts → blockers and missing proof → Human Decision PENDING → authority statement |

`opacity` + small `translateY`, `cubic-bezier(0.2, 0.8, 0.2, 1)`, 420ms,
180ms staging — all unchanged. No fake typing, cursor choreography, parallax,
whole-section fades, bounce, spring motion, large zoom, ambient animation,
scrolling text or overlay was added.

## 13. Responsive implications

Validated at all six required viewports plus 200% zoom (emulated). Measured
directly, not estimated:

| Viewport | Gutter | Plate inset | Scene track | Trust cols | Handoff cols |
|---|---|---|---|---|---|
| 1600×1000 | 32px | 26px | 820px (66.3%) | 4 | 5 |
| 1280×800 | 32px | 26px | 800px (65.8%) | 4 | 5 |
| 1024×768 | 32px | 20px | 576px (single col) | 4 | 5 |
| 768×1024 | 24px | 16px | 720px (single col) | 2 | 2 |
| 390×844 | 20px | 12px | 350px (single col) | 1 | 1 |
| 320×568 | 20px | 12px | 280px (single col) | 1 | 1 |

No horizontal overflow, no scrollable descendant, at any of the six viewports.
The plate's additive padding at 320px — the one place §14 of the brief flagged
as a genuine regression risk — was measured clean.

## 14. Accessibility

Structure unchanged from R5E.1E.2B, re-verified: one `<main>`, one `<footer>`,
one `<h1>`, the same heading outline with no forward skip, zero `position:
fixed` elements, zero modals, zero live regions, zero autofocus. Tab order
walked 14 stops deep — identical sequence to R5E.1E.2B (skip link, header nav,
header action, hero's two actions, handoff's two actions, footer wordmark and
three links) — confirming the new plate and the new handoff grid introduced no
focusable element and did not alter tab order. All seven outcome chips remain
non-interactive: 0 of 7 are focusable or carry a role, at every viewport.

## 15. Progressive enhancement

Unchanged mechanism. With JavaScript disabled, every canonical value across
all six sections still renders, including all seven outcome labels and the new
handoff record's five cells. Under reduced motion, `data-motion` is never set
and every `[data-step]` element — including the unchanged four Readiness
steps — computes to `opacity: 1` immediately.

## 16. Performance

No dependency added. `package.json` and the lockfile are unchanged. The same
two client boundaries as before (`PublicHeader`, `SceneMotion`) — no third was
introduced; the plate and the handoff grid are both plain server-rendered
markup. Zero images, zero external requests, no model call, no persistence, no
telemetry. Cumulative layout shift across a full-page scroll: **0** (was
0–0.0004 in R5E.1E.2B).

## 17. Cross-route continuity implications

The shared scene-presentation plate (`.scenePlate`) becomes part of the future
public grammar documented in
`R5E1E2B_HUMAN_REVIEW_PACKAGE/CROSS_ROUTE_CONTINUITY.md`: any future genuine
public route inherits it alongside the existing navigation, grid, typography,
motion and footer rules. No supporting route was built in this milestone.

## 18. Product truth

Unchanged and re-verified at every viewport, under reduced motion, and with
JavaScript disabled: `example/b2b-redemption-api`, `PR #482`, "Add fallback
handling for failed discount-code retrieval", `Tests required`,
`46/100 · MEDIUM`, `4 open · 2 blocking`, Human Decision `PENDING`, all seven
genuine decision outcomes, the primary finding, its two evidence records, the
one blocking missing-proof relationship, and every readiness fact. No selected
outcome, completed decision, cleared requirement, changed recommendation or
risk, reviewer identity, customer claim, model execution, external write,
collaboration feature or enterprise capability was introduced.

## 19. Protected scope

Unchanged, verified by `git diff`: `app/page.tsx`, `app/_public-r5`,
`app/_public-r5-recalibrated`, `app/visual-lab/public-r5`,
`app/visual-lab/public-r5-recalibrated`, `app/workspace`, `app/report`,
`app/new`, `app/home`, `app/review-operations`, `app/integrations`,
`app/settings`, `app/review-policies`, `app/team`,
`app/visual-lab/workspace-r4`, `lib/workspace-v2`, `public/r5/scenes`,
`.claude/launch.json`, `package.json`, lockfiles, R4 documentation, and every
earlier accepted R5 and R5E.1E.2 document (A, B and C).

Modified: `app/_public-r5-reference-reconstruction/` (the CSS file, five of
nine components, and `reconstruction-content.ts`), `docs/r5/README.md`.

Created: `docs/r5/R5E1E2D_REFERENCE_FIDELITY_IMPLEMENTATION.md` (this
document), `R5E1E2D_HUMAN_REVIEW_PACKAGE/` (untracked).

The route wrapper (`app/visual-lab/public-r5-reference-reconstruction/page.tsx`)
was not modified — no route defect was discovered.

## 20. Browser validation

Production build, headless Chrome. Confirmed: `noindex, nofollow`; one
`<main>`; one `<h1>`; complete unchanged page order; only the header sticky;
the accepted 1300px envelope unchanged; the gutter reduced as specified; the
split geometry corrected; all four scenes share one plate system; no product
scene sticky; zero internal scene scrollbars; zero page overlays; product
typography raised one step; no product content clipped at any viewport;
Readiness remains truthful; all seven outcomes visible and unselected; the
corrected outcome wording present, "shown below" absent; Trust spans the full
band; the handoff uses the structured record; the footer is byte-identical;
motion activates only once a scene is meaningfully in view — proven directly,
not inferred; every scene still activates at 320px; motion remains one-shot;
reduced motion and no-JavaScript truthfulness both confirmed; no hydration
warning; no console error beyond the pre-existing `favicon.ico` 404; no
horizontal overflow at any of the six viewports or at 200% zoom; no layout
shift (CLS 0); no external write; no model call; canonical values unchanged.

Regression sweep, all HTTP 200, no page errors: `/`, `/visual-lab/public-r5`,
`/visual-lab/public-r5-recalibrated`, `/workspace?source=fixture`, `/new`.

## 21. Final recording requirements

Not re-attempted in this milestone — `REQUIRED_FINAL_RECORDING.md`'s five
recording specifications from R5E.1E.2C remain the outstanding request for
whoever next validates this route with a real screen capture. The motion
timing correction in §11 was verified programmatically (scroll-position
simulation, computed `data-motion` state) rather than by a new recording,
which is sufficient to prove the constant works but does not replace the dwell
recordings R5E.1E.2C specified for hero-reveal visibility, loop absence, and
per-section completion timing.

## 22. Remaining limitations

1. Visual quality is not self-accepted — this document reports what was
   corrected and measured.
2. The in-app browser pane could not composite frames in this session, as in
   every prior R5E.1E.2 milestone; validation used headless Chrome driving the
   locally installed browser.
3. 200% zoom is emulated (640×400 at device-scale-factor 2), not true browser
   zoom.
4. No screen-reader output was captured; structure was verified
   programmatically.
5. The five dwell recordings specified in R5E.1E.2C's
   `REQUIRED_FINAL_RECORDING.md` were not produced in this milestone.

## 23. Acceptance evidence

Untracked `R5E1E2D_HUMAN_REVIEW_PACKAGE/` holds 21 documents and 21
screenshots: first viewport at all six required viewports, full final state
(reduced motion) at all six, six scrolled section captures, a complete
1440×900 walkthrough, a no-JavaScript capture, and a 200%-zoom capture.

## Human visual acceptance and reconstruction closeout

R5E.1E.2A through R5E.1E.2D received final human visual acceptance on 3 August 2026.

The accepted desktop recording demonstrated the complete reference-led public experience from the hero through the footer, including the local one-shot motion sequences.

The review confirmed:

1. The rejected sticky Workspace architecture has been fully replaced.
2. Only the public navigation remains sticky.
3. Every product scene occupies its own bounded section in normal document flow.
4. No narrative content passes behind or underneath a dashboard.
5. No public product scene contains an internal scrollbar.
6. The hero presents the selected PR #482 review at substantial, readable scale.
7. Finding to Evidence and Missing Proof to Requirement each communicate one primary relationship.
8. Readiness remains an advisory synthesis rather than an autonomous decision.
9. Human Decision remains pending and belongs to the accountable engineer.
10. All seven genuine decision outcomes remain visible, unselected and non-interactive.
11. Product scenes use one restrained neutral presentation-plate system.
12. Product typography, alternating geometry and public gutters now align with the measured reference system.
13. Trust occupies the full public band and preserves truthful analysis and authority boundaries.
14. The unresolved-case handoff ends with a structured canonical review record.
15. Local product motion is bounded, one-shot and independent of page-scroll state.
16. Reduced-motion and no-JavaScript behaviour preserve complete product truth.
17. The page remains recognisably Lintel rather than a branded imitation of Cursor or Skybase.
18. Production routes, the frozen R4 product and existing private public routes remain unchanged.

The accepted reference-led public composition is:

Navigation
? Hero and selected-review scene
? Finding and Evidence
? Missing Proof and Requirement
? Readiness and Human Decision
? Trust
? unresolved-case handoff
? quiet footer

The following direction is now frozen for subsequent responsive review:

1. normal document flow;
2. only navigation sticky;
3. continuous white canvas;
4. alternating editorial and product-scene composition;
5. restrained neutral scene plates;
6. one principal product relationship per scene;
7. local one-shot motion;
8. no page-level overlays;
9. no internal public-scene scrolling;
10. canonical PR #482 product truth.

R5E.1E.2A�D are accepted and closed as the completed reference-led public reconstruction.
