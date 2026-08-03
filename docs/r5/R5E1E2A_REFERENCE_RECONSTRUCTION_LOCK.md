# R5E.1E.2A — Reference Reconstruction Lock

Authoritative implementation contract for the reference-led public
reconstruction at `/visual-lab/public-r5-reference-reconstruction`.

Derived from direct frame-by-frame inspection of three screen recordings, not
from description. Media metadata, extraction evidence and the complete
timestamped observation set live in the untracked
`R5E1E2A_REFERENCE_VIDEO_ANALYSIS/VIDEO_COMPARISON.md`. This document does not
restate that analysis — it converts it into binding implementation values.

This lock does not supersede `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` or
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`. Where they speak, they win.
This lock governs **composition and normal-flow architecture only**.

All reference measurements are in video pixels from a 1920 × 1140 capture whose
usable page viewport is ≈1850 × 1085.

---

## 1. Cursor section architecture

Observed order: hero → trust strip → four alternating feature sections →
testimonials → cards → research statement → changelog → closing CTA → footer.

The transferable rule is not the order but the unit: **every section is a
self-contained band in normal document flow containing exactly one message and
at most one product scene.** Sections enter and leave the viewport by ordinary
scrolling (`dense_t16` frames 1–11 show the trust strip leaving the top while
the next section enters the bottom, both partially visible, neither pinned).

**Lintel binding rule.** The page is a vertical stack of independent
`<section>` elements. No section may depend on another section's scroll state.

## 2. Cursor product-scene scale

| Measurement | Cursor | Lintel value |
|---|---|---|
| Content band width | ≈1620 px on a ≈1850 px viewport (88 %) | **1300 px** (spec §9 bounds 1240–1320) |
| Two-column scene width | ≈1065 px (x 727 → 1793) | **≈836 px** |
| Two-column text width | ≈470 px (x 197 → 665) | **400 px** |
| Scene : text ratio | ≈69 % / 29 % | **≈68 % / 32 %** |
| Scene height | ≈897 px | **≈560–620 px** |
| Hero scene entry point | y ≈497 of 1140 (44 %) | **≈400 px from page top** |

Lintel's band is narrower than Cursor's because §9 of the task brief fixes
1240–1320 px. The *ratio* is what transfers, not the absolute width.

**Lintel binding rule.** In every two-column section the product scene is at
least twice the width of its supporting copy.

## 3. Cursor one-message-per-section discipline

Every Cursor feature section contains exactly three copy elements: a short
heading, a paragraph of at most three lines, and one text link. Nothing else.
No sub-headings, no bullet lists, no secondary CTAs, no badges.

**Lintel binding rule.** A section's copy column contains: one `<h2>` (≤2
lines), one paragraph (≤4 lines at a 60–70 character measure), and at most one
action. Product detail lives in the scene, never in the copy.

## 4. Cursor motion model

Proven, not assumed. `probe_19.0s.jpg` and `probe_27.0s.jpg` show an identical
browser scroll-thumb position and an identical text baseline while the scene
interior differs. The same holds for Skybase between 15.5 s and 21 s.

Therefore:

1. The page does not move while the scene animates.
2. The scene animates while the page is stationary.
3. Scroll position never maps to product state.
4. State changes are ≈0.4–0.8 s apart and read as short fades and small
   translations. No parallax, no springs, no bounce, no zoom.

**Lintel binding rule.** An `IntersectionObserver` may do exactly one thing:
tell an individual scene that it has entered the viewport, once. It may not
pin, may not read scroll offset, may not write global state, and may not
restart.

## 5. Cursor whitespace rhythm

Inter-section gap ≈150 px; intra-section padding ≈100 px; a full band of empty
canvas separates the end of one scene from the start of the next heading.

**Lintel values.** Section padding **88 px** top and bottom on desktop
(≈176 px between adjacent sections), **56 px** at ≤1023 px, **40 px** at
≤767 px.

## 6. Cursor normal-flow scrolling

No scroll snapping, no wheel interception, no scroll-linked transforms, no
overlay, no pinned element other than the header. Confirmed across all 45
one-second frames and all 216 dense frames.

**Lintel binding rule.** `position: sticky` appears exactly once in the
stylesheet, on the header. `position: fixed` appears nowhere.

## 7. Skybase white-canvas translation

Skybase demonstrates that Cursor's system survives on white:

| Element | Skybase treatment | Lintel treatment |
|---|---|---|
| Canvas | Pure white throughout, no section reset | Same — `--pub-canvas: #ffffff` |
| Text | Near-black heading, one grey for support | `--pub-text` / `--pub-text-2` |
| Scene frame | Photographic plate, 24 px radius | **Flat `--pub-surface-2` plate, 14 px radius** — the image lock forbids atmospheric imagery |
| Product card | White card inset ≈75 px inside the plate | White card inset **28–40 px** inside a flat plate |
| Structure | Hairline rules, no shadow, no gradient | Same, using the frozen product's own border tokens |
| Card fills | Very light grey blocks | `--pub-surface-2` |

Skybase's sky photographs are the one thing that must **not** transfer:
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §5 prohibits atmospheric sky
imagery and copied environmental imagery outright. Lintel achieves the same
"framed product" reading with a flat neutral plate.

## 8. Skybase alternating section system

Observed: text-left/scene-right (6.0–16.7 s) → scene-left/text-right
(17.4–22.5 s) → full-width scene (23.0 s) → text-left/scene-right (25.0 s).

**Lintel first-gate order.**

| Section | Desktop | Mobile |
|---|---|---|
| Hero | Copy full width, scene full width beneath | Same |
| Finding and Evidence | Text left, scene right | Text first, scene second |
| Missing Proof and Requirement | Scene left, text right | Text first, scene second |

Mobile always places text before its scene regardless of desktop side. This is
achieved with grid `order` on the copy column, so the DOM order is already
text-then-scene and source order stays coherent for assistive technology.

Skybase right-aligns its right-hand text column. Lintel does **not**: §11 of
the task brief requires left alignment, and a right-aligned technical record is
harder to scan. Left alignment is used in every column.

## 9. Skybase product framing

The product card is inset inside a plate with visible plate margin on all four
sides. The card reads as *presented*, not *embedded*. Card interior type stays
≈14–16 px — never the 11–12 px the current Lintel route uses.

**Lintel binding rule.** Minimum type size inside a product scene is **12 px**
for uppercase micro labels and **13 px** for any record content. Nothing
essential is smaller.

## 10. Skybase copy restraint

Heading ≤2 lines, paragraph ≤4 lines, two actions, nothing else — even on a
technical product. Adopted verbatim as §3's rule.

## 11. Exact timestamped reference observations

The full set is in `R5E1E2A_REFERENCE_VIDEO_ANALYSIS/VIDEO_COMPARISON.md`. The
eleven that drive this contract:

| # | Source | Timestamp | Observation |
|---|---|---|---|
| 1 | Cursor | 0.4 s | Hero: left H1, **no paragraph**, two pills; scene begins at 44 % viewport height |
| 2 | Cursor | 13.4 s | Trust strip is one centred line plus a rule-separated logo row — ≈250 px band |
| 3 | Cursor | 16.75–17.9 s | Section transition is pure scroll; both sections briefly visible; nothing pinned |
| 4 | Cursor | 19.0 s vs 27.0 s | Identical scroll thumb, identical text baseline, different scene interior — motion is local |
| 5 | Cursor | 18.0–31.5 s | Text column ≈470 px, scene ≈1065 × 897 px, ratio ≈69/29 |
| 6 | Cursor | 33.5 s | Composition mirrors: scene left, text right; ≈150 px of empty canvas between sections |
| 7 | Skybase | 0.4 s | White canvas, left H1, 2-line grey paragraph, two pills, scene at 51 % viewport height |
| 8 | Skybase | 10.5 s | Text 485 px / scene 1066 × 715 px; white card inset ≈75 px inside a plate; no scrollbar |
| 9 | Skybase | 16.75–17.4 s | Alternating handoff by ordinary scroll only |
| 10 | Skybase | 19.5 s | Scene left / text right; scene interior builds one row at a time, ≈0.4 s apart |
| 11 | Skybase | 27.4 s | Closeout: centred short CTA, two pills, hairline, five-column footer |

## 12. Architectural differences in current Lintel

Measured from the third recording.

| Dimension | Reference | Current Lintel |
|---|---|---|
| Sticky elements | Header only | Header **and** the entire Workspace shell |
| Shell residency | n/a | Pinned at y 163–1063 for ≈30 s of a 39 s recording |
| Narrative position | Beside the scene | **Underneath** the scene |
| Page progression | Independent sections | Eight-stage scroll-driven state machine |
| Ideas per viewport | One | Four to five (rail, queue, workspace, inspector, stage strip) |
| Product type size | ≈14–16 px | ≈11–12 px |
| Inter-section whitespace | ≈150–180 px | None — there are effectively no sections |
| Internal scroll regions | None | Queue, Workspace and Inspector each scroll |

`dense_t18` (41 frames spanning 18.0–23.0 s) is the decisive evidence: the
shell rectangle is pixel-identical across every frame while only a caption at
the bottom edge changes.

## 13. Rejected Lintel patterns

Prohibited in this route without exception:

1. A persistent sticky Workspace.
2. Narrative content moving behind or underneath a product scene.
3. IntersectionObserver-controlled multi-stage page progression.
4. Fixed-height application shells requiring overflow.
5. Nested Queue / Workspace / Inspector scrolling.
6. Internal scrollbars inside any public scene.
7. A guided Human Decision presentation inside a sticky shell.
8. Reproducing the complete application workflow on the homepage.
9. Scroll snapping, wheel interception, scroll-driven global state.
10. Page-level overlays and floating marketing cards.

## 14. Retained Lintel product truth

Unchanged, and rendered from the existing typed module
`app/_public-r5-recalibrated/canonical-review.ts` by import — that file is
**read, never modified**:

| Field | Value |
|---|---|
| Repository | `example/b2b-redemption-api` |
| Pull request | `PR #482` |
| Title | Add fallback handling for failed discount-code retrieval |
| Recommendation | Tests required |
| Risk | 46/100 · MEDIUM |
| Requirements | 4 open · 2 blocking |
| Human Decision | PENDING |

Plus, verbatim: `PRIMARY_FINDING`, `PRIMARY_EVIDENCE`,
`MISSING_PROOF_RECORDS`, `BLOCKING_REQUIREMENT`, `READINESS`,
`REVIEW_OVERVIEW`, `QUEUE_CONTEXT_ROWS`.

Nothing is invented: no record identifier, reviewer name, organisation,
selected outcome, completed decision, cleared requirement, customer claim,
model execution, collaboration feature or enterprise capability.

## 15. Exact first-gate composition

Implemented in this milestone, and nothing further:

1. Compact sticky navigation.
2. Hero (headline, supporting paragraph, two actions).
3. Hero product scene — full content width.
4. Finding and Evidence — text left, scene right.
5. Missing Proof and Requirement — scene left, text right.

**Deliberately not implemented:** Readiness, Human Decision, Trust, the
unresolved-case handoff, the footer, production transfer, and supporting public
pages. The page therefore ends after section 5 with no closing composition.
This is the gate, not an omission.

Because Trust does not exist in this gate, the navigation carries no Trust
link (task brief §10).

## 16. Public grid

```
--pub-max:      1300px
--pub-gutter:   40px   (≤1023px: 32px, ≤767px: 20px)
--section-pad:  88px   (≤1023px: 56px, ≤767px: 40px)
--split-gap:    64px   (≤1023px: 40px)
--header-h:     62px
```

Two-column split: `grid-template-columns: minmax(0, 400px) minmax(0, 1fr)`
with the copy column capped at 400 px, giving ≈836 px of scene at full width.
Editorial measure is capped at `62ch`.

Below 1023 px the split collapses to a single column and the scene runs full
width.

## 17. Product-scene dimensions

| Scene | Desktop width | Min height | Plate inset | Radius |
|---|---|---|---|---|
| Hero | 1300 px | 520 px | 24 px | 14 px |
| Finding / Evidence | ≈836 px | 560 px | 20 px | 14 px |
| Missing Proof / Requirement | ≈836 px | 560 px | 20 px | 14 px |

Every scene:

1. is a bounded `<div>` in normal flow;
2. has `overflow: hidden` **only** as a paint boundary — its content is
   composed to fit, so nothing is actually clipped and no scrollbar can appear;
3. carries no `position: sticky`, no `position: fixed`, no fixed height;
4. is built from real HTML — headings, lists, definition lists, `<code>`;
5. renders identically without JavaScript.

## 18. Responsive composition

| Viewport | Behaviour |
|---|---|
| 1600 × 1000 | Full grid; hero copy and the top of the hero scene share the first viewport |
| 1280 × 800 | Full grid; ≈380 px of the hero scene is visible above the fold |
| 1024 × 768 | Split collapses to one column; scenes run full width |
| 768 × 1024 | One column; scene internals reflow from 2-up to 1-up; type unchanged |
| 390 × 844 | Compact nav (wordmark + "Open sample"); copy before every scene; scene records stack |
| 320 × 568 | As above; no horizontal overflow; actions remain full-width tappable |

No scene ever becomes a shrunken desktop dashboard. Below 768 px each scene
drops its side-by-side internals and stacks, keeping every record legible.

## 19. Motion rules

| Property | Value |
|---|---|
| Trigger | `IntersectionObserver`, `threshold: 0`, `rootMargin: 0px 0px -80px 0px`, fires once, then disconnects |
| Properties animated | `opacity`, `transform: translateY(8px)`, `border-color`, `background-color` |
| Easing | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Duration | 260–560 ms |
| Step delays | 0 ms / 180 ms / 360 ms |
| Loops | None |
| No-JS state | Final state, immediately |
| Reduced motion | Final state, immediately; observer never arms |

Sequences (each entirely local to its own scene):

- **Hero** — selected PR already visible → readiness facts receive restrained
  emphasis → the attention finding becomes prominent.
- **Finding / Evidence** — finding established → evidence relationship becomes
  visible → provenance receives restrained emphasis.
- **Missing Proof / Requirement** — missing proof established → blocking
  requirement becomes visibly connected → unresolved status remains visible.

Prohibited: parallax, ambient loops, springs, bounce, large zoom, whole-section
fades, fake typing, cursor choreography, page scrims, modal animation,
horizontal scrolling.

Because only `opacity` and `transform` animate, and both operate on elements
whose boxes are already laid out, the sequences cannot produce layout shift.

## 20. Originality boundaries

Not copied, at any fidelity: Cursor or Skybase wordmarks and marks; branded
assets; exact wording; proprietary illustrations; exact interface geometry;
branded animation sequences; Cursor's agent metaphors and orange accent;
Skybase's product content, sky photography and FAQ; customer logos; any claim
Lintel cannot support.

What transfers is the **compositional operating system**: normal flow, one
message per section, scene-dominant proportion, alternating sides, whitespace
rhythm, local scene motion, copy restraint.

The originality tests in
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §7a apply. In particular the
transplant test: the hero scene names a repository, a pull request, a
recommendation, a risk score, a requirement count and a pending Human
Decision — it could not be reused for an editor, a CRM or a knowledge base.

## 21. Implementation boundaries

1. New directory `app/_public-r5-reference-reconstruction/` and one thin route
   at `app/visual-lab/public-r5-reference-reconstruction/page.tsx`.
2. `app/_public-r5-recalibrated/` is imported for typed canonical data and is
   never modified.
3. No dependency, lockfile, `public/` asset or `.claude/launch.json` change.
4. No production route, no `app/page.tsx`, no `lib/workspace-v2` change.
5. `noindex`, `nofollow`, absent from sitemap and production navigation.
6. No analytics, external write, model call, or persistence.
7. Server-rendered composition; client components exist only for the header's
   scrolled border and active link, and for the scene reveal.
8. Zero images. Zero animation libraries.
9. The route is independently removable: deleting the two new directories
   leaves every other route byte-identical.

## 22. Acceptance criteria

1. Only the header is sticky; `position: fixed` appears nowhere. ☐
2. Every product scene sits in normal flow and enters and leaves by ordinary
   scrolling. ☐
3. No scene has an internal scrollbar at any of the six required viewports. ☐
4. No narrative text passes behind or under any scene. ☐
5. Each section presents exactly one principal message. ☐
6. Scene width ≥ 2× copy width in every two-column section. ☐
7. The hero scene is visible within a 1280 × 800 first viewport. ☐
8. Product-scene type is ≥12 px for micro labels, ≥13 px for record content. ☐
9. Every canonical value in §14 renders exactly as specified. ☐
10. Nothing outside §14 is asserted as product truth. ☐
11. One `<main>`, one `<h1>`, headings descend without skipping. ☐
12. Scenes are fully truthful with JavaScript disabled and under
    `prefers-reduced-motion: reduce`. ☐
13. No hydration warning, no console error, no horizontal overflow, no layout
    shift. ☐
14. Navigation carries no Trust link and no invented destination. ☐
15. The page ends after Missing Proof and Requirement. ☐
