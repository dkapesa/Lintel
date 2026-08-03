# R5E.1E.2C — Cursor and Skybase Reference Fidelity Evaluation

Visual evaluation and implementation planning only. **No application code, CSS,
route, canonical data, package file or accepted milestone document was modified
in this phase.** Nothing was staged, committed, pushed or merged.

Companion documents (unchanged authority):
[`R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md),
[`R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md),
[`R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md`](./R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md).

---

## 1. Evidence and measurement basis

### 1a. New Lintel recording — access confirmed

| Property | Value |
|---|---|
| Path | `C:\Users\dkape\Videos\Captures\01_complete_reference_reconstruction_desktop.mp4` |
| Size | 11,286,402 B, valid `ftyp mp42` header |
| Container duration | 11.920 s |
| Video-stream duration | 11.850 s |
| Dimensions | 1920 × 1140 |
| Nominal / average frame rate | 60/1 · 21.098 fps (VFR) |
| Codec | h264 / yuv420p |
| Coded frames | 250 |

Extracted and visually inspected: **24 frames at 1 per 0.5 s**, **84 dense
frames at 8 fps** spanning the whole page traversal (1.4–11.9 s), **12
full-resolution key frames**, **10 full-resolution motion-probe frames**, and
two labelled contact sheets. All frames were opened and read as images.

Cursor and Skybase were **not re-extracted**: the R5E.1E.2A full-timeline and
dense evidence is intact and readable, and was re-inspected directly.

### 1b. The device-pixel-ratio correction — a material finding

All three recordings are 1920 × 1140 captures of the same browser on the same
machine. The Lintel recording lets us calibrate that capture against known CSS
values:

| Known CSS value | Measured in video px | Implied ratio |
|---|---|---|
| `.wrap` inner width (`max-width:1300` − 2 × `40` padding) = 1220 px | 1523 | 1.248 |
| `--header-h: 62px` | 78 | 1.258 |

**The capture is at a 1.25 device pixel ratio.** Video pixels are therefore
1.25 × CSS pixels.

This corrects a figure carried in the R5E.1E.2A lock. That document recorded
Cursor's content band as "≈1620 px" and Skybase's as "≈1598 px" and concluded
Lintel's 1300 px was "20 % narrower". Those were **video** pixels. Converted:

| Site | Content band, video px | Content band, CSS px |
|---|---|---|
| Cursor | 1620 | **1296** |
| Skybase | 1598 | **1278** |
| Lintel | 1523 | **1218** |

Cursor and Skybase sit almost exactly on Lintel's `--pub-max: 1300px` envelope.
The real remaining gap is not 20 % — it is **60–78 CSS px of inner content
width**, caused by Lintel's larger gutters, not by a fundamentally narrower
band. The R5E.1E.2A lock's §2 note that "the ratio transfers, not the absolute
width" remains sound; the stated magnitude of the difference does not.

DPR 1.25 is *proven* for the Lintel recording and *assumed* for Cursor and
Skybase (identical window geometry, same capture session). Every cross-site
comparison below is therefore **also** expressed as a fraction of the page
viewport, which is DPR-independent and safe regardless.

---

## 2. Three-site geometry matrix

Page viewport: Cursor/Skybase ≈ 1835 video px (1468 CSS); Lintel ≈ 1830 video
px (1464 CSS). Viewport height ≈ 1085 video px (868 CSS).

| # | Property | Cursor | Skybase | Lintel | Class |
|---|---|---|---|---|---|
| 1 | Navigation height | ~78 vpx / 62 CSS | ~80 vpx / 64 CSS | 78 vpx / **62 CSS** | A |
| 2 | Content band (CSS px) | 1296 | 1278 | **1218** | B |
| 2b | Band as % of viewport | 88.3 % | 87.1 % | **83.2 %** | B |
| 3 | Page gutter (CSS px) | 82 | 100 | **123** | B |
| 4 | Hero top spacing | — | — | 72 px above H1 | A |
| 5 | H1 size | ~44 CSS | ~48 CSS | **52 CSS**, one line | A |
| 6 | Supporting copy | none | 2 lines, ~640 CSS wide | 2 lines, ~603 CSS wide | A |
| 7 | Action placement | left, 2 pills | left, 2 pills | left, 2 pills | A |
| 8 | Hero scene top (% of viewport height) | 40.7 % | 48.2 % | **42.7 %** | A |
| 9 | Hero scene width | full band | full band | full band | A |
| 10 | Split: text / gap / scene (% of band) | 29.0 / 5.3 / **65.7** | 30.4 / 2.9 / **66.7** | 32.8 / 5.3 / **61.9** | B |
| 10b | Section scene width (CSS px) | 852 | 853 | **754** | B |
| 11 | Section scene height (CSS px) | 718 | 572 | 588 | A |
| 12 | Presentation plate | photographic plate | photographic plate | **none** | B |
| 13 | Card inset inside plate | ~45–85 vpx | **~72 vpx uniform** (6.8 % of plate width) | **0** | B |
| 14 | Scene border / radius | plate radius, card shadow | 24 px plate radius, white card | 1 px `#dededc`, 14 px radius | B |
| 15 | Product type (body) | ~14–16 CSS | ~14–16 CSS | **13 CSS** (statements), 11 CSS (micro labels) | B |
| 16 | Active-record hierarchy | one dominant panel | one dominant card | one dominant column | A |
| 17 | Secondary metadata density | low | low | **moderate–high** in Readiness | B |
| 18 | Ideas per scene | 1 | 1 | 1 (all four scenes) | A |
| 19 | Section vertical spacing | ~150 CSS | ~180 CSS | **176 CSS** | A |
| 20 | Alternating rhythm | 4 cycles | 3 cycles + full-width | **3 cycles** | A |
| 21 | Section entry / exit | ordinary scroll | ordinary scroll | ordinary scroll | A |
| 22 | Whitespace reset between sections | full-width empty band | full-width empty band | full-width empty band + hairline | A |
| 23–28 | Motion | see §4 | see §4 | see §4 | mixed |
| 29 | Trust composition | logo row + one line | n/a (FAQ) | 4 text records, **69 % of band used** | B |
| 30 | Final handoff | centred CTA + pill | centred CTA + 2 pills | left CTA + 2 pills + **13 px record line** | B |
| 31 | Footer density | 5 columns | 5 columns | 2-part flex, 3 links | A |
| 32 | Closing vertical rhythm | varied (quotes/cards/photo/list) | FAQ → CTA → footer | **3 consecutive text-only sections** | B |
| 33 | Campaign-level polish | high | high | high in sections 1–4, **thin in 5–7** | B |

---

## 3. Section-by-section findings

### 3a. Hero and hero scene — strong

**Measured.** Hero scene top at 462 video px into the viewport = 42.7 % of
viewport height, between Cursor (40.7 %) and Skybase (48.2 %). H1 sets on one
line at 52 CSS px. Supporting copy is two lines at ~603 CSS px. Scene occupies
the full 1218 CSS px band; the review-context column is 231 CSS px (19 %) and
the selected working area 987 CSS px (81 %).

**Judgment.** The R5E.1E.2B aside narrowing worked: the selected review is
clearly dominant. Hero geometry is reference-credible.

### 3b. Two-column proportion — measurably short

**Measured.** Lintel's scene occupies **61.9 %** of the band against Cursor's
65.7 % and Skybase's 66.7 %; its copy column is **32.8 %** against 29.0 % and
30.4 %. In absolute terms the section scenes are 754 CSS px against 852–853.

**Judgment.** The scene is the weaker party in the split by roughly 4–5
percentage points. Correctable by reducing the copy track and the gap, without
touching the band.

### 3c. Product-scene framing — the largest single gap

**Measured.** Skybase's section scene is a 1066 × 715 video px plate with a
white card inset **72 video px uniformly on all four sides** — a 6.8 %
proportional inset. Cursor's is the same pattern with a 45–85 video px inset.
Lintel has **no plate and no inset**: a single white card on a white page,
separated only by a 1 px `#dededc` border and a `#fafaf9` chrome bar.

**Judgment.** This is the difference between a product that reads as
*presented* and one that reads as *placed*. Both references achieve it with
imagery, which
[`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`](./R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md)
§5 prohibits outright. The *structural* device — an outer plate containing an
inset card — is not imagery and does transfer.

### 3d. Product typography — at the small end

**Measured.** Record statements 13 CSS px, micro labels 11 CSS px, mono
identifiers 12 CSS px, fact values 14 CSS px, record titles 16–17 CSS px.
Reference card interiors run 14–16 CSS px for equivalent body content.

**Judgment.** Legible, but consistently one step below the references. The
11 px micro labels are the weakest; at DPR 1.25 they render at ~14 device px,
which is readable but reads as fine print rather than as product chrome.

### 3e. Readiness and Human Decision — density and dead space

**Measured.** At 7.60 s the copy column's content ends at y ≈ 600 while the
scene continues to y ≈ 1120 — **≈416 CSS px of empty copy column** beside a
live scene. The scene's lower third is the seven outcome chips (two rows) plus
a two-line note: text-heavy relative to the fact row and PENDING block above.

**Judgment.** The scene reads as authority, not as a disabled form — the
PENDING block is prominent, the chips are visibly inert, and the authority
statement is legible. But the section is the densest on the page and the
copy-column dead space is the most visible rhythm break.

### 3f. Trust — measurably sparse

**Measured.** The Trust record grid spans x 224 → 1275 = 1051 of 1523 video px
— **69 % of the content band**. The right ~31 % is empty. Four text records,
no visual anchor of any kind.

**Judgment.** Too sparse, and unbalanced rather than merely quiet. The
emptiness is asymmetric (right-hand), which reads as unfinished rather than as
deliberate whitespace.

### 3g. Unresolved handoff — not tangible

**Measured.** The canonical record renders as one line of 13 CSS px grey text:
`example/b2b-redemption-api · PR #482 · Tests required · 46/100 · MEDIUM ·
4 open · 2 blocking · Human Decision PENDING`.

**Judgment.** It reads as a caption, not as a product record. The same seven
values appear in the hero scene inside a bordered fact row where they read as
data. Here they read as editorial copy. This directly answers the brief's
question 14: the handoff currently feels like editorial copy with a metadata
footnote, not like a product record.

### 3h. Footer and closing rhythm

**Measured.** Footer occupies ~228 CSS px. Restrained, correct.

**Measured.** Trust → handoff → footer spans 8.5–11.9 s of the traversal —
**roughly one third of the page with no product scene at all**, three
consecutive hairline-separated left-aligned text blocks of similar weight.

**Judgment.** The footer itself closes cleanly. The *approach* to it does not:
the page's product-led character evaporates over the final third.

---

## 4. Motion fidelity

### 4a. Proven: the staged reveal works and is visible

Two full-resolution frames 125 ms apart, during the Finding and Evidence
section's entry:

| Frame | Scene state |
|---|---|
| **t = 4.025 s** | Finding card only — tags, title, statement, source. The "supported by" edge and both evidence records are **absent** |
| **t = 4.150 s** | Edge and first evidence record now present. The record's **provenance tag and source path are still absent** — those are `data-step="3"` |

This is direct proof that the one-shot staged reveal fires, stages correctly in
the designed order, and is genuinely perceptible in ordinary use. **Class A.**

### 4b. Proven: the trigger fires while the scene is still largely off-screen

At **t = 6.65 s** the Readiness scene's chrome bar sits at y ≈ 922 of a
viewport ending at 1140 — the scene is roughly **82 % below the fold** — yet
its fact row and tag row (steps 1 and 2) have already revealed.

This follows directly from `rootMargin: "0px 0px -80px 0px"`: the observer
fires when the scene's top edge is 80 px above the fold. The full sequence then
costs 540 ms of delay plus a 420 ms transition ≈ **960 ms**, which at the
observed scroll velocities (measured 132–384 video px/s, i.e. 106–307 CSS px/s)
is spent while the scene is still entering.

**Consequence.** The motion is real and correctly built, but a large share of
it is spent below the fold. By the time a scene is comfortably readable it is
frequently already complete. This is the one genuine motion gap, and it is
fixable by changing a single `rootMargin` value — no pinning, no scroll
reading, no architecture change.

### 4c. NOT PROVEN BY RECORDING

| Property | Why not proven |
|---|---|
| **Hero scene reveal visibility** | The page finishes loading at ≈1.45 s and the first clean frame at 1.525 s already shows the hero scene complete. The reveal, if it ran, finished inside the load transition |
| **Whether any sequence loops** | The recording is a single forward pass. No scene is revisited, so a restart could not have been observed |
| **Whether a sequence completes before its scene leaves the viewport** | Scroll velocity is non-uniform (measured 132–384 video px/s) and no section is dwelt on. For Finding and Evidence the reveal was observed mid-sequence and the section remained on screen afterwards, but this cannot be generalised |
| **Reduced-motion truthfulness** | Not exercised by this recording. It was verified programmatically in R5E.1E.2B; it is not re-proven here |
| **Hover, focus and keyboard states** | No interaction occurs in the recording |
| **Any responsive behaviour** | Desktop only, single viewport |

`REQUIRED_FINAL_RECORDING.md` in the review package specifies exactly how the
next recording must be made to close these.

---

## 5. Answers to the twenty required questions

| # | Question | Answer |
|---|---|---|
| 1 | Hero scene presented or merely placed? | **Placed.** No plate, no inset, 1 px border on white |
| 2 | Sufficient scale vs references? | **Hero yes** (42.7 % viewport entry, full band). **Section scenes no** — 754 CSS px vs 852–853 |
| 3 | Selected working area dominant enough? | **Yes.** 81 % of scene width. Freeze |
| 4 | Product typography readable at ordinary distance? | **Yes, but one step small.** 13 px body vs reference 14–16 px; 11 px micro labels are the weakest |
| 5 | One relationship per scene? | **Yes**, all four. Freeze |
| 6 | Unnecessary records or metadata? | **Yes, one place** — the Readiness scene's lower third (7 chips + 2-line note) |
| 7 | Does white-on-white framing feel flat? | **Yes** — measurably the largest gap against both references |
| 8 | Would a restrained neutral plate materially improve it? | **Yes.** It is the structural device both references use, and it carries no imagery |
| 9 | Readiness: authority or disabled form? | **Authority.** PENDING is prominent, chips are visibly inert, statement is clear |
| 10 | Should all seven outcomes remain visible? | **Yes.** Truthfulness outranks density; reduce their *weight*, not their number |
| 11 | Is Trust too sparse? | **Yes** — 69 % band usage, asymmetric emptiness, no anchor |
| 12 | What composition should Trust use? | Full-band 4-column row, or 2 × 2 with a compact provenance record. See §6 |
| 13 | Is unresolved-case metadata tangible? | **No.** One line of 13 px grey text |
| 14 | Does the handoff feel like a product record? | **No** — editorial copy plus a metadata footnote |
| 15 | Does the footer close cleanly? | **Yes.** Freeze |
| 16 | Is local motion visible and meaningful? | **Visible and meaningful — proven.** But largely spent below the fold |
| 17 | Which motion changes are required? | One: increase the observer's negative bottom `rootMargin` so the sequence begins when the scene is meaningfully in view |
| 18 | Recognisably Lintel, not a Cursor clone? | **Yes.** Every scene names a repository, PR number, recommendation, risk score, requirement counts, provenance and a pending Human Decision. The transplant test fails cleanly for an editor, a CRM or a knowledge base |
| 19 | Smallest bounded pass to close the gap? | Seven changes, all CSS plus one observer constant and two small component edits. See §6 |
| 20 | What is already strong enough to freeze? | Navigation, hero geometry, alternating rhythm, section spacing, one-idea discipline, scene motion *design*, footer, product truth, accessibility structure |

---

## 6. R5E.1E.2D implementation brief (summary)

The full brief is `R5E1E2C_HUMAN_REVIEW_PACKAGE/R5E1E2D_IMPLEMENTATION_BRIEF.md`.
It is bounded to seven corrections, ordered by impact per unit of change:

1. **Neutral presentation plate.** Wrap each scene in an outer `--pub-surface-2`
   plate with a 24–28 px inset and move the border to the plate. Flat neutral
   only — no imagery, no gradient, no shadow identity.
2. **Split proportion.** Copy track 400 → 360 px, gap 64 → 56 px. Scene grows
   754 → ~802 CSS px (65.8 % of band, matching the references).
3. **Gutter and band.** `--pub-gutter` 40 → 32 px, lifting inner content 1218 →
   1236 CSS px. `--pub-max` stays 1300 (the R5E.1E.2A envelope is not reopened).
4. **Product typography.** Statements 13 → 14 px, micro labels 11 → 12 px, mono
   12 → 12.5 px. Titles unchanged.
5. **Readiness density.** Demote the seven chips to a single quieter row and
   shorten the note to one line. All seven stay. Vertically centre the copy
   column against the scene to remove the ~416 px dead space.
6. **Trust composition.** Four records across the full band (4-up desktop,
   2-up tablet, 1-up mobile) so band usage goes 69 % → 100 %.
7. **Handoff record.** Promote the canonical line into a bordered record strip
   using the existing fact-row primitive, so it reads as data rather than
   caption.

Plus one motion constant: `rootMargin` `0px 0px -80px 0px` →
`0px 0px -22% 0px`.

**Not permitted by this brief:** any sticky element other than navigation, any
overlay, any internal scene scrollbar, any scroll-controlled product state, any
decorative imitation of either reference, any change to canonical values, any
new dependency, and any reopening of the accepted architecture.

**Stopping condition.** R5E.1E.2D ends when the seven corrections are
implemented and validated. It does not add sections, routes, content or
capability.

---

## 7. Gap classification summary

Every finding is classified in
`R5E1E2C_HUMAN_REVIEW_PACKAGE/GAP_CLASSIFICATION.md`. Totals:

| Class | Count | Examples |
|---|---|---|
| **A — Freeze now** | 14 | Navigation, hero geometry, scene entry point, one-idea discipline, section spacing, alternation, motion design, footer, product truth, accessibility |
| **B — Bounded correction** | 9 | Plate/inset, split proportion, gutter, product type scale, Readiness density and dead space, Trust band usage, handoff tangibility, closing rhythm, motion trigger point |
| **C — Defer** | 6 | Mobile re-validation, 200 % zoom re-check, supporting public routes, production transfer, detailed Trust page, cross-route continuity application |
| **D — Reject** | 5 | Sticky/pinned scenes, photographic plates, scroll-driven product state, adding a customer-logo row, expanding Readiness toward the full decision form |

No finding is unclassified.

---

## 8. Scope

Created by this phase: this document and the untracked
`R5E1E2C_HUMAN_REVIEW_PACKAGE/`.

Not modified: `app/_public-r5-reference-reconstruction/`, every route, every
CSS file, canonical data, package files, `.claude/launch.json`, all accepted R5
documentation, and all existing review packages. `docs/r5/README.md` was
deliberately **not** updated — the R5E.1E.2C brief authorises only the two
paths above, unlike previous milestones which explicitly authorised a README
update. Its pending modification in `git status` is carried over from
R5E.1E.2B.

No production build was run: this phase changes no application code.
