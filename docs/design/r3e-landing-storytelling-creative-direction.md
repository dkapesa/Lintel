# R3E — Landing Storytelling and Creative Direction

**Status:** Creative direction and narrative contract. No production code, style, asset, dependency or route was changed. No asset was created. Nothing staged, committed or pushed.
**Branch:** `r3e-storytelling-creative-direction`
**Governs:** the R3E implementation milestones (R3E.1–R3E.5). R3F inherits the boundaries stated in §18.
**Upstream authority:** `docs/product/r3a-landing-positioning-proof-contract.md` (claims, terminology, capability boundaries), `docs/design/r3b-landing-information-architecture-visual-intent.md` (narrative spine, section contracts, light-first direction, single-dark-section rule), `docs/design/r3c-public-visual-system.md` (tokens, type, spacing, line doctrine, motion values).
**Subject:** the production landing at `/` as shipped by R3D — `app/page.tsx`, `app/landing/**`, `app/landing-nav.tsx`, `app/landing-motion.tsx`, `lib/landing-theatre-fixtures.ts`.

---

## 1. Purpose and authority

R3D produced a technically correct landing page: the build passes, routes and anchors work, the theatre is interactive and isolated, accessibility and responsive behaviour hold, fixtures derive from the real builders, and every claim is truthful.

**R3E fixes a different problem: the page is assembled rather than authored.** This document is the single creative decision record for that fix. Where it conflicts with a *visual* decision in R3C, R3E supersedes it and says so explicitly (§6.1 is the only such case). It does not touch R3A's claims or R3B's narrative spine.

**What R3E may not reopen:** the product category, the positioning line, `Change → Observation → Evidence → Requirement → Human Decision`, the accountability rule, the light-first identity, the single-dark-section rule, the pinned palette and type scale, capability boundaries, sample provenance, CTA destinations, the theatre's interaction model.

**What R3E decides here, once:** page pacing, chapter structure, section order, hero composition, imagery, which product scenes exist, the trust composition, copy density, and what is cut.

---

## 2. Diagnosis of the current production page

The page does not feel machine-made because any one section is weak. Six of them are individually good. It feels machine-made because of what is *identical* across them.

**D1 · Seven sections open in exactly the same way.** Verification gap, evidence chain, review evolution, recommendation-versus-decision, GitHub, trust and audience each begin with a mono coordinate at the top-left, a section name at the top-right, then a heading in the left column and a paragraph in the right column at the same measure. R3C.1 varied what happens *inside* each section but left the *entrance* uniform. A reader scrolling at speed sees the same shape seven times. This is the single strongest tell.

**D2 · Nothing has a different scale.** Every section sits on the same 1240px shell, at the same optical distance, at the same measure, with the same texture. There are no scale events — nothing enormous, nothing tiny, nothing that bleeds. Littlebird, Giga and Aeterna all place at least one element far outside the ordinary rhythm. Lintel's page never does, except the dark theatre, which is a *material* change rather than a *scale* change.

**D3 · The page never leaves its grid.** Only the theatre reaches the viewport edge. Everything else is politely contained. Containment reads as caution, and caution reads as generated.

**D4 · The first viewport is a document, not an opening.** The hero currently carries an eyebrow, a three-line headline, a 26-word lede, two actions, a provenance note line, six product records, a rail with six nodes and six connector stubs, and a field-foot line with a second provenance mark — roughly fourteen discrete elements, none dominant. It explains the entire product model before the visitor has agreed to care. It is intelligent and it is exhausting.

**D5 · The five-stage model is explained three times.** The hero draws the chain, the evidence-chain section names and defines all five stages with a worked example, and the theatre presents the same five stages as its spine with its own definitions. Nothing is wrong in any one of them; the repetition is what reads as automated completeness rather than editorial judgement.

**D6 · "Human Decision is pending" appears six times.** Hero note, hero terminal fragment, theatre lede, theatre panel header chip, theatre decision stage, recommendation-versus-decision column, GitHub comment footer. The point is load-bearing and must survive — but stating it six times converts conviction into anxiety.

**D7 · There is no atmosphere.** The paper texture resolves to roughly 3% and is effectively invisible at normal viewing distance. There is no light, no depth, no environment, no sense that the records sit *somewhere*. The page is ink on flat white-ish paper for 10,000 pixels.

**D8 · Trust is a half-built section.** "Deterministic first, model optional, results traceable, boundaries explicit." sits above four staggered principles that occupy roughly the left 60% of the shell. The right side is not generous negative space — it is an unfilled column, because nothing was ever designed to go there. The section also reads as internal architecture notes rather than public trust storytelling.

**D9 · The page is long without being paced.** ≈10,176px at 1440 — about 11.3 viewports — divided into eleven sections whose heights cluster between 1,000 and 1,300px. Nothing is short enough to feel like a breath, and nothing is long enough to feel like an arrival, except the theatre.

**These nine, and only these nine, are what R3E has to fix.**

---

## 3. Final reference hierarchy

Four references, four jobs, no averaging. Where two would pull a decision apart, the owner of that dimension wins.

| Reference | Owns, and only owns | What R3E takes | What R3E must not take |
|---|---|---|---|
| **Littlebird** — *master* | Atmosphere, compositional confidence, scale, negative space that holds something | Product surfaces set inside a wider visual world rather than on blank ground; a single enormous statement carrying a viewport; a warm ground that reads as material; partial product artifacts cropped by the composition edge | Its foliage, its whimsy, its assistant framing, its scattered-card literalism |
| **incident.io** — *organisation* | Page architecture and chapter clarity | A first viewport that states the category and shows one product thing and stops; strongly marked chapters instead of equal sections; the movement proposition → product → trust → action | Its layout, its colour, its logo wall, its category, its density |
| **Giga** — *atmosphere* | The immersive opening and mid-page resets | One environment at the top that establishes a world; deliberate moments that reset attention on a long page; the sense that the product sits inside somewhere | Its photography, its landscape, its full-bleed video, its customer logos |
| **Aeterna** (screenshot) — *hero* | The asymmetric copy/image relationship | Copy held tight to the left at a narrow measure; the visual field taking the right and bleeding past the grid; imagery that creates a world instead of decorating a gap | Its imagery, its ornament, its commerce chrome, its subject matter |
| **Cursor** — *interaction only* | Interactive product proof | Nothing new. Cursor's contribution is already implemented in the theatre and is frozen | Any influence on the light sections, the palette, the type, or the page's feel |

**Precedence.** Littlebird governs how the page feels. incident.io governs how it is organised. Giga governs the opening and the two mid-page peaks. Aeterna governs the hero's geometry. Cursor governs one component that R3E does not touch.

---

## 4. Desired first five-second impression

**The sentence the visitor should be able to say:** *"This is a serious, calm instrument for deciding whether a change is safe to merge — and it clearly keeps the decision with me."*

The first viewport must land four things and **nothing else**:

1. **What it does** — the headline, unchanged: *Agents create code. Lintel verifies what is ready.*
2. **Why it matters** — one visible product state that is obviously consequential: `TESTS REQUIRED · 46/100 MEDIUM · HUMAN DECISION PENDING`.
3. **One memorable idea** — a single opened case plate on a drawn engineering ground, with a trace running down its edge to a terminal mark that has not been resolved.
4. **One next action** — *Review a pull request*.

**It must not attempt** the five-stage model, the evidence classes, the requirement register, the provenance vocabulary, or the deterministic/model distinction. Those are Acts II–V. The hero's job is to be believed, not understood.

---

## 5. Hero creative direction

### 5.1 The concept: *the case, opened on the table*

One dominant object — a Case File plate — lying on a drawn engineering ground, lit from the upper left, with two records overlapping its edge and a verification trace descending its left side to a mark that has not yet resolved. Not a diagram. Not a dashboard. A **thing on a surface**.

This is the direct answer to D2, D3, D4 and D7: it introduces scale (one big object), a bleed (the ground and plate run off the right edge), a world (the drawn ground and the raking light), and it cuts the hero's element count roughly in half.

### 5.2 Desktop (≥ 1180px)

- Section height `min(94vh, 900px)`, floor 760px. No top rule; the navigation's hairline is the only edge.
- Grid **44 / 56**, gap `clamp(40px, 4vw, 72px)`, on the wide shell (1400px), with the right column **allowed to bleed to the viewport edge**.
- **Left column**, top-aligned at ~26% of the section height, max measure 520px:
  - Eyebrow `ENGINEERING VERIFICATION` — retained. Two words, and it buys the category instantly.
  - Headline, Newsreader, retained verbatim with its authored break: *Agents create code.* / *Lintel verifies* / *what is ready.*
  - Lede — R3A's locked subheadline, retained verbatim, but set at a **38ch measure** so it reads as three short lines rather than a paragraph. (Its 26-word length is the one hero copy question left to R3F; see §14.)
  - Actions — *Review a pull request* → `/new`, *Explore the sample Workspace* → `/workspace?source=fixture`. Unchanged.
- **Right column — the plate.** One composed artifact:
  - **Identity band** (dominant): `acme/redemption-api · #482`, the change title at 19–21px, and the verdict row `TESTS REQUIRED · RISK 46/100 MEDIUM · HUMAN DECISION PENDING`. This band is the focal object of the entire first viewport.
  - **Two overlapping records**, offset so each crosses the plate's edge — proof that this is a stack of paper, not a rectangle:
    - `E4 · MISSING PROOF — No test proves a repeated attempt cannot issue a second code.`
    - the pending Human Decision plate, dashed, quiet, terminal.
  - **The trace**: a single vertical rule down the plate's left edge with **five node marks, of which only two are labelled** — the mark beside the missing-proof record, and the terminal mark beside the pending decision. The other three are unlabelled. Suggestion, not explanation.
  - **One provenance mark**, small, at the plate's lower-left.
- **The ground**: an enlarged crop of the footer plate's own drawing language (branch lines gathering into evidence stems), bleeding off the right and bottom, at 5–8% ink. See §6.
- **Raking light**: the page-level luminance field of §6.1, strongest at the upper left, so the plate sits in light rather than on nothing.

**Element count: eight** (eyebrow, headline, lede, two actions, plate, trace, provenance) against roughly fourteen today, with exactly one dominant.

### 5.3 Tablet (768–1179px)

Copy column first at full width, measure capped at 620px. The plate follows below at full width, bleed removed, keeping the identity band, both overlapping records and all five trace nodes. The drawn ground crops to its central third and drops to 4–6%.

### 5.4 Mobile (< 768px)

Copy first: eyebrow, headline, lede, both actions stacked full-width with the primary first. Then the plate at full width carrying **the identity band and the pending decision only** — the missing-proof record is deferred to Act III rather than shrunk. The trace runs down the left edge with all five nodes, one labelled. The drawn ground reduces to a single lower-right corner crop at ≤4%. Provenance mark stays. No horizontal scroll.

### 5.5 Removed from the hero, and where each thing goes

| Removed | Why | Where it goes |
|---|---|---|
| `F1 · OBSERVATION` fragment | The hero does not need the finding to make the point; the missing proof is the sharper artifact | Theatre, Observation stage |
| `E1 · EVIDENCE` fragment | Duplicates the missing-proof record's job at lower stakes | Theatre, Evidence stage; recommendation register |
| `C1 · REQUIREMENT` fragment | The verdict row already says requirements are open | Act III register; theatre, Requirement stage |
| Hero note line (*"One change, moving through five stages…"*) | Explains the composition instead of trusting it; states pending a second time in one viewport | Deleted. Act III makes the same point structurally |
| Hero field-foot (`acme/redemption-api · run …`) | Second provenance mark in one viewport | Collapsed into the single mark on the plate |
| Four of six connector stubs | Visual noise once the fragments are gone | Deleted |

### 5.6 Motion intent

One entrance, **≤ 900ms total**, on load, once:

| Step | Property | Duration | Delay |
|---|---|---|---|
| Drawn ground | opacity 0 → 1 | 400ms | 0 |
| Plate | opacity + `translateY(12px → 0)` | 360ms | 120ms |
| Trace | `scaleY(0 → 1)` from top | 420ms | 200ms |
| Two records | opacity + `translateY(8px → 0)` | 240ms | 380ms / 500ms |

Easing `cubic-bezier(.16,.76,.3,1)` (R3C's enter curve). Reduced motion: every element present at final position and opacity, no transform, no draw. Nothing in the hero is legible only after motion.

### 5.7 Why this reads as authored rather than generated

Three reasons, all structural: **one thing is clearly the most important thing** (a generated composition weights everything equally); **the composition crops its own content** — records cross the plate edge and the ground leaves the viewport, which only happens when someone decided where the frame is; and **it withholds** — three unlabelled nodes and a deferred finding say a person judged what the opening did not need.

---

## 6. Imagery and atmosphere system

### 6.1 One narrow amendment to R3C

R3C §2 prohibits gradients and §9 sets elevation to none. That prohibition was aimed at decorative element gradients, glows and floating cards, and it stands. **R3E adds exactly one page-level device and nothing else:**

- **Raking light** — a warm luminance field on the page ground: `radial-gradient(120% 80% at 18% 0%, rgb(255 253 246 / 55%), transparent 62%)`, plus an edge vignette `radial-gradient(140% 100% at 50% 45%, transparent 62%, rgb(28 30 33 / 3.5%))`. Combined contribution **capped at 4%** luminance difference across the page.
- Still prohibited, unchanged: element gradients, glows, glassmorphism, box shadows on records or cards, coloured section backgrounds, a second dark band.

Depth comes from light on the ground and from overlap between records — never from shadow.

### 6.2 The imagery decision: no photography, no raster, no screenshots

**R3E creates no images.** Every visual on the page is either live product DOM or hand-authored SVG.

This is a deliberate quality decision, not a shortcut. Every product surface on the page is already rendered as real DOM from the real builders, which beats a screenshot on every axis that matters: it is accessible, it reflows, it cannot go stale against the product, it costs no bytes, and it is demonstrably real rather than a picture of something real. Replacing any of it with a raster capture would *lower* the page's quality and its credibility. Photography, 3D, server rooms, code rain and generated engineering art are all prohibited outright — each would read as the exact generic AI-startup signal R3E exists to remove.

The one capture that may still be justified is the social/OG share image, which is **R3F's** decision, not R3E's.

### 6.3 The drawing system: one plate, seen close and seen whole

The page is bookended by **the same original drawing at two zooms**. The footer's evidence landscape — branch lines gathering into evidence stems, past requirement plates, converging on a bronze decision marker — already exists in `app/landing/landing-footer-scene.tsx`. R3E adds one export: **a hero crop** of the same drawing, enlarged roughly 4×, showing only the branch-to-stem transition.

The visitor meets the drawing at the top without being able to read it, operates the product, and then sees the whole plate at the bottom and recognises it. That is a genuinely authored device, it is free, and it is unavailable to anyone who does not own the drawing.

### 6.4 Where illustration appears, and where it must not

| Location | Treatment | Ink |
|---|---|---|
| Hero right ground | Enlarged branch-to-stem crop, bleeding right and bottom | 5–8% |
| Act III lead-in register | The existing opt-in drafting grid only, no drawing | ≤ 7% |
| Act IV background | **None.** The accountability split must hold still | — |
| Trust provenance plate | The drafting grid behind the plate only | ≤ 7% |
| Footer | The full evidence landscape at full strength | 100% |

**Never**: behind body copy at a measure, inside the dark theatre, inside any product record, or anywhere it exists only because a column looked empty.

### 6.5 Contrast, format and performance rules

- Any illustration under text yields: no text may fall below 4.5:1 against the lightest point of the artwork beneath it.
- Inline SVG only — no `<img>`, no external request, no font in artwork. Both plates ship as JSX in the landing component tree, as the footer does today.
- Illustration is decorative: `role="presentation"`, `aria-hidden="true"`, `focusable="false"`. The hero crop must add no accessible text, because everything it depicts is stated in Act III.
- Budget: the hero crop must add **≤ 6KB** of markup before compression. If it exceeds that, simplify the crop rather than rasterise it.
- Zero new binary assets. The page's asset weight after R3E should be *lower* than today, because six hero records become one plate.

---

## 7. Final chapter-based narrative

Five acts. Sections remain semantically distinct and keep their anchors, but the visitor should feel five arrivals, not eleven.

### Act I — **The promise**
- **Purpose:** earn the next thirty seconds.
- **Question answered:** *what is this, and is it serious?*
- **Contains:** navigation, hero.
- **Visual peak:** the Case File plate on the drawn ground — the page's second-strongest image after the footer.
- **Transition out:** the plate's unresolved terminal node is the question the gap section picks up. The hero's bottom edge is open air, no rule.
- **Length:** ≈ 860px · 11% of the page.
- **Dominant composition:** asymmetric 44/56 with a right bleed.
- **Product proof required:** one real verdict row and one real missing-proof record, with visible provenance.

### Act II — **The gap**
- **Purpose:** make verification, not creation, the reader's problem before Lintel is explained.
- **Question answered:** *why isn't my pipeline enough?*
- **Contains:** the verification gap.
- **Visual peak:** the pipeline-versus-findings proof scene, **enlarged and bled left** past the shell, so the green passing record sits at the page's left margin and the unresolved findings hang off its structural stem.
- **Transition out:** the third distinction is *Recommendation ≠ Human Decision*, which hands directly to the instrument.
- **Length:** ≈ 900px · 12%.
- **Dominant composition:** typographic descent — three staggered statements, no rules — then one focal proof scene.
- **Product proof required:** three real findings from the canonical record.

### Act III — **The instrument**
- **Purpose:** the visitor operates the product.
- **Question answered:** *what does it actually do, and can I drive it?*
- **Contains:** the five-stage register (`#how-it-works`) leading directly into the interactive theatre (`#product`).
- **Visual peak:** the material change from paper to instrument — the page's one dark band.
- **Transition in:** the five-stage register runs the full shell width immediately above the dark edge, and the chain line it carries **continues into the theatre's top descender**, so the light register is visibly swallowed by the instrument.
- **Transition out:** the light paper returns on the same hard edge.
- **Length:** ≈ 1,950px · 25%.
- **Dominant composition:** one wide horizontal register, then a full-bleed dark stage.
- **Product proof required:** the complete interactive theatre, unchanged.

### Act IV — **Accountability**
- **Purpose:** show what happens after analysis — the record moves, a person decides, the result travels.
- **Question answered:** *who is answerable, and how does this reach my workflow?*
- **Contains:** review evolution, recommendation-versus-Human-Decision (`#principles`), GitHub workflow (`#github`).
- **Visual peak:** the recommendation/decision split, promoted to the page's second-largest typographic moment after the hero.
- **Transition in:** the theatre showed one run; evolution asks what the next one changes.
- **Transition out:** the GitHub comment is the last artifact of the act, and it raises the data question Act V answers.
- **Length:** ≈ 2,350px · 30%.
- **Dominant composition:** a compressed comparison, then an unmatched split, then a stem resolving into one artifact.
- **Product proof required:** two real runs, the real recommendation register, the real decision comment shape.

### Act V — **Ground**
- **Purpose:** make the system trustworthy, name the reader, ask.
- **Question answered:** *can I rely on this, is it for me, what do I do?*
- **Contains:** trust and architecture, the final CTA (which absorbs the audience statements), the illustrated footer.
- **Visual peak:** the canonical run manifest plate, then the full evidence landscape as the closing image.
- **Transition out:** the CTA's ground continues into the footer drawing with no dividing band.
- **Length:** ≈ 1,700px · 22%.
- **Dominant composition:** a 2×2 principles field against one large provenance artifact, then a wide centred statement, then the plate.
- **Product proof required:** a real canonical run manifest.

**Target total ≈ 7,760px at 1440 — about 8.3 viewports, roughly 24% shorter than the R3D page's 10,176px.**

### 7.1 The device that makes chapters visible

Section entries stop being uniform. **Four entry types, assigned once, never mixed:**

- **Type A · Scene entry** — no coordinate, no heading row; the composition opens directly. *Hero, theatre.*
- **Type B · Statement entry** — a Newsreader statement at the left with nothing above it; the section coordinate demoted to a quiet line at the section's **foot**. *Verification gap, recommendation-versus-decision, final CTA.*
- **Type C · Register entry** — coordinate, then a single full-width horizontal register with no two-column heading row. *Five-stage register, trust.*
- **Type D · Artifact entry** — the product artifact appears **before** its heading; the heading annotates what the reader is already looking at. *Review evolution, GitHub.*

No two consecutive sections share an entry type. This one rule resolves D1 on its own.

---

## 8. What to keep

Kept because it is right, not because it exists:

- The positioning line, the locked hero headline, the locked CTA labels and both routes.
- The warm light-first palette, the pinned `--lnd-*` tokens, the type scale, the semantic state colours, the record left-edge convention.
- Newsreader confined to four editorial moments.
- The hairline doctrine and its three line roles.
- **The product theatre in full** — architecture, scenarios, five stages, context rail, keyboard model, intro sequence and its stop condition, reserved panel height, isolation from production state. Frozen.
- `Change → Observation → Evidence → Requirement → Human Decision`, and the pending Human Decision in every theatre scenario.
- Recommendation versus Human Decision as a structural separation, not a comparison table.
- The canonical fixture adapter and its build-time derivation from the real builders.
- Review evolution's two-run comparison and its reconciling counts.
- One continuously updated GitHub decision comment, and every capability boundary in R3A §21.
- The footer evidence-landscape drawing.
- Sample provenance on every product surface.
- Accessibility architecture: one `h1`, landmarks, skip link, focus, keyboard-complete controls, decorative SVG hidden.
- Reduced-motion as an authored mode, and the reveal failsafe.
- Application/landing isolation.

**Explicitly not kept for reasons of sunk cost:** the six-record hero rail, the uniform section entry, the standalone evidence-chain section, and the current trust layout. Each is discussed below.

---

## 9. What to cut, merge or compress

**C1 · The hero record rail — simplified, not replaced.**
Six equal-weight records become one plate with two overlapping records and a five-node trace, two nodes labelled. *Why:* D4 and D2 — the hero must have one dominant object. *Information moves to:* Act III (the stages), the theatre (findings, evidence, requirements). *Must remain visible:* the repository and PR identity, the recommendation, the risk band, one missing-proof record, the pending decision, provenance.

**C2 · The verification gap stays standalone.**
*Why:* it is the only section that argues rather than demonstrates, and it is what makes Act III land. It is compressed roughly 20% and gains a bled proof scene, but it is not merged. Merging it into the hero would recreate D4.

**C3 · The evidence-chain section is absorbed into Act III's lead-in.**
The standalone section — coordinate, two-column heading, five stations each carrying a name, a definition *and* a worked record, then a bridge line — becomes a **single full-width horizontal register** immediately above the dark band: five stage names, one short definition each, the chain line, and **one** worked identity per stage (`4 files → F1 → E1 → C1 → —`). The per-station record blocks, the section heading row and the bridge line are removed.
*Why:* D5. The model is explained three times; this reduces it to once, in the place where the visitor is about to use it. *Information moves to:* the theatre, which already carries the full definitions and records per stage. *Must remain visible:* all five stage names in order, the continuous line, one worked example, the terminal pending state. *Saving:* ≈ 340px, and the third explanation disappears.

**C4 · Review evolution and recommendation-versus-decision stay separate sections inside one act.**
*Why:* they answer different questions — *does the record move?* and *who is answerable?* — and merging them would produce one 1,800px section, which is the pacing problem, not the fix. They gain a shared act framing and different entry types (D then B), and evolution compresses by ≈ 300px: the two-column comparison keeps both runs but the *What moved* register drops from five rows to three, and the head note becomes a footnote-weight line.

**C5 · GitHub and trust stay separate sections, adjacent, with one shared act identity.**
R3B fixed this adjacency deliberately: naming webhooks, tokens and model context raises the data question that trust answers immediately. Merging them into one scene would break that logic and lose an anchor. Instead: GitHub closes Act IV as the *workflow* answer, trust opens Act V as the *architecture* answer, and trust gains the artifact it was missing (§12). GitHub compresses by ≈ 400px — the capability register and boundary note both become footnote-weight, and the webhook well shrinks to four lines.

**C6 · "Who Lintel is for" merges into the final CTA.**
The three audience statements become a **single quiet register directly above the CTA statement**, on the same ground, with no coordinate, no section heading and no separate framing.
*Why:* it is currently a 331px section that exists to be exhaled through, and R3B already intended it as the release into the CTA. *Information moves to:* the CTA section's opening register; all three statements survive verbatim. *Must remain visible:* all three audience statements, in order, with no persona cards, logos or invented users. *Saving:* ≈ 200px and one section boundary.

**C7 · Pending-decision statements reduced from six to three.**
Keep: the theatre panel's persistent `HUMAN DECISION · PENDING` state, the recommendation-versus-decision dashed plate, and the GitHub comment footer. Remove: the hero note line, and the theatre lede's restatement (the panel already says it). The theatre's decision-stage record keeps its own copy because that stage *is* the statement.
*Why:* D6. Three placements are conviction; six are anxiety.

**C8 · Technical caveats become annotation.**
Demote to footnote weight (13px, `--lnd-ink-3`, no heading): the theatre boundary paragraph, the GitHub boundary note, the evolution head note, the recorded-decision explanation, and the trust principles' second sentences. **Nothing is deleted** — every boundary in R3A §21 and every qualification in R3C §16 stays on the page, at a weight that matches its role.

**C9 · Content that is useful internally but too detailed for the public story.**
The full evidence-class vocabulary, the requirement importance taxonomy, and the reproducibility classification set stay *inside* product artifacts where they appear as real state — they do not become prose. The section coordinates (`01 · THE VERIFICATION GAP`) survive but move to section feet under entry type B, where they read as plate numbers rather than headers.

---

## 10. New recommended section order

Eleven sections, five acts, four entry types. Anchors unchanged.

| # | Label | Act | Entry | Purpose | Primary copy idea | Composition | Product artifact | Interaction | Status | ≈ Height |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Navigation | I | — | Two real destinations and one action | — | Sticky bar, ghost hairline on scroll | — | Menu, focus | Retained | 70px |
| 2 | Hero | I | A | Earn the next thirty seconds | *Agents create code. Lintel verifies what is ready.* | 44/56 asymmetric, right bleed, drawn ground | Case File plate + 2 records + trace | Static; one entrance | **Recomposed** | 860px |
| 3 | The verification gap | II | B | Make verification the reader's problem | *Software can now be created faster than teams can verify it.* | Three staggered statements, no rules; bled proof scene | Pipeline record + 3 findings on a stem | Static | Retained, −20% | 900px |
| 4 | The five stages `#how-it-works` | III | C | Name the model once, at the door of the instrument | *One record, five stages.* | Full-width horizontal register, chain line continuing down | Five stage identities, one worked example | Static | **Merged** (was the evidence-chain section) | 420px |
| 5 | Product theatre `#product` | III | A | The visitor operates the product | *Drive one verification record.* | Full-bleed dark, copy beside panel | The interactive panel | **Interactive** | Retained, frozen | 1,240px |
| 6 | Review evolution | IV | D | The record moves with the change | *The next run changes the record, not just the score.* | Artifact first, heading after; two runs, both readable | Two-run comparison + 3 movements | Toggle | Retained, −300px | 780px |
| 7 | Recommendation vs Human Decision `#principles` | IV | B | Fix accountability | *Lintel recommends. The engineer decides.* | Unmatched 54/46 split, ink rule between | Recommendation register + dashed pending plate + example | Static | Retained, promoted | 1,000px |
| 8 | GitHub workflow `#github` | IV | D | It reaches your workflow, bounded | *A pull request goes in. One updated decision comment comes out.* | Stem of five nodes resolving into one artifact | Webhook well (4 lines) + decision comment | Static | Retained, −400px | 570px |
| 9 | Trust and architecture | V | C | Trust from a real record, not assurance | *Deterministic first, model optional, results traceable, boundaries explicit.* | 2×2 principles field against a large provenance plate | **Canonical run manifest** | Optional 2-state | **Recomposed** | 780px |
| 10 | Final CTA (+ audience) | V | B | Name the reader, then ask | *Move from generated code to an accountable merge decision.* | Quiet three-item register, then wide centred statement | — | — | **Merged** | 480px |
| 11 | Illustrated footer | V | — | Close as an image | — | Wide plate, navigation in its upper air | The full evidence landscape | Static | Retained | 440px |

**≈ 7,540px + inter-act air ≈ 7,760px at 1440.**

---

## 11. Three major product storytelling scenes

The page carries **one establishing artifact** (the hero plate, §5), **three major scenes**, and **two supporting artifacts**. Everything else is type.

### Scene 1 — The interactive verification theatre *(Act III, interactive)*
- **User story:** *"Show me the record, and let me move through it myself."*
- **Surface:** the landing simulation of a Lintel verification record.
- **Focal state:** scenario 1, Change stage, `TESTS REQUIRED · 46/100 MEDIUM · 4 open · PENDING`.
- **Crop:** none — full panel, full-bleed dark band.
- **Copy:** the existing three-part copy column, with the boundary paragraph demoted to annotation (C8) and the pending restatement removed (C7).
- **Real data:** the canonical dossier and two generated samples via `lib/landing-theatre-fixtures.ts`.
- **Motion:** the existing 5.5s intro, stopped permanently on interaction; `state`-band transitions.
- **Mobile:** scenario and stage controls scroll in their own bounds; verdict row persistent.
- **Why it earns the space:** it is the only place the product is *operated* rather than described, and it is the only claim on the page a competitor cannot make by writing better copy.

### Scene 2 — Recommendation versus Human Decision *(Act IV, art-directed static)*
- **User story:** *"Prove this tool will not decide for me."*
- **Surface:** the real recommendation register beside the decision record structure.
- **Focal state:** a dense six-entry recommendation on the left; a dashed `No engineer decision recorded` plate on the right, with the recorded-decision example beneath it at reduced weight.
- **Crop/framing:** deliberately unmatched columns, 54/46, divided by the page's strongest ink rule; the Newsreader statement spans both above them.
- **Copy:** the statement stays prominent; the four limitation lines and the recorded-decision explanation become annotation.
- **Real data:** the canonical record's finding, evidence, missing proof, requirement, counts and risk.
- **Motion:** none beyond a single opacity reveal. This scene holds still by design.
- **Mobile:** stacks with a horizontal ink rule; recommendation always first.
- **Why it earns the space:** it is the page's moral centre and Lintel's single sharpest differentiator against every AI code-review product.

### Scene 3 — The canonical run manifest *(Act V, art-directed static)*
- **User story:** *"What exactly did you run, and can you prove it again?"*
- **Surface:** a real `CanonicalReviewRunManifest`, composed as a technical plate.
- **Focal state:** `reproducibility: EXACT`, set against the deterministic ruleset and generator versions.
- **Crop:** a tall right-hand plate, roughly 420 × 560px, on the drafting grid, holding a mono field register:

  ```
  CANONICAL RUN
  run identity           run_xxxxxxxxxxxx
  run schema             1.3          report schema   1.0
  generator              6.6          ruleset         6.3
  review mode            standard
  analysis source        deterministic
  input fingerprint      xxxxxxxxxxxx
  configuration          xxxxxxxxxxxx
  result fingerprint     xxxxxxxxxxxx
  reproducibility        EXACT
  ```

- **Copy:** the four principles sit at the left as a 2×2 field; the plate needs no caption beyond one annotation line.
- **Real data:** produced by `createCanonicalReviewRunManifest` over a canonical sample with `analysisSource: "deterministic"` — which returns `exact` with no limitation. The versions are the repository's real `CANONICAL_RUN_SCHEMA_VERSION`, `REPORT_SCHEMA_VERSION`, `REPORT_GENERATOR_VERSION` and `DETERMINISTIC_RULESET_VERSION`.
- **Motion:** optionally a single two-state control switching `analysis source` between `deterministic` and `model`, which truthfully flips `reproducibility` to `TRACEABLE` and reveals the real limitation string *"Model-assisted output is traceable by provenance, but exact model replay is not promised."* Instant, no autoplay, keyboard-operable. If R3E.3 runs short, ship the static deterministic state.
- **Mobile:** the plate moves below the principles at full width; the fingerprint rows may scroll within their own bounds.
- **Why it earns the space:** it converts "trust us" into "here is the record", it is the strongest available substitute for certifications the product does not have, and it fills the exact space D8 identified as unresolved.

### Supporting artifacts, deliberately demoted
- **Review evolution's two-run comparison** — kept, but framed as a compact artifact with three movements rather than a full scene.
- **The GitHub decision comment** — kept as the resolution of the flow stem, at its current size, with the webhook well reduced to four lines.

**Not selected, and why:** *Case File provenance* is absorbed into Scene 3. *Evidence ledger / merge requirement* is already fully expressed inside the theatre's Requirement stage. *Workspace overview* would be a fourth surface with nothing to add to the argument, and would push the page back toward a screenshot gallery.

---

## 12. Trust and architecture resolution

**Chosen treatment: a lead trust statement with a 2×2 editorial principles field on the left, and one large real provenance artifact on the right.** This is one of the five candidate treatments listed in the brief; the others are rejected below.

### Composition
- **Entry type C.** Coordinate, then the statement at section-heading scale across the shell: *Deterministic first, model optional, results traceable, boundaries explicit.*
- **Left, 54%:** the four principles as a **2×2 field**, not a staggered vertical list. Each cell is a mono index, a title at 20–26px, and **one** short lead sentence in full ink. The qualifying second sentence becomes annotation beneath at 13px `--lnd-ink-3`.
- **Right, 46%:** the canonical run manifest plate (Scene 3), aligned to the top of the first principle row and running past the fourth.
- One annotation line beneath the plate: that this is a real run record for a sample review, and that provenance describes reproducibility, not a guarantee.

### Every current boundary survives, at annotation weight
Deterministic baseline as the floor · optional model context · deterministic result retained on model failure, timeout or invalid output · model output cannot silently remove a known blocker or a required test · canonical provenance · deterministic reproducibility distinguished from model traceability · review history on the device by default · raw diffs excluded from persisted local history · integration credentials server-side · no privacy, security or compliance guarantee.

### Rejected alternatives
- *Composed architecture trace* — a second stem device three sections after GitHub's; repetitive.
- *2×2 field with a central technical object* — pushes the principles to the margins and weakens the reading order.
- *Real policy surface* — `/review-policies` is read-only and enforces nothing; showing it publicly invites exactly the misreading R3A §22 forbids.
- *Merging trust into GitHub* — breaks R3B's deliberate adjacency and loses an anchor (C5).

### Prohibited here
Badges, certification marks, shield icons, padlocks, generic cards, "enterprise-grade" language, invented assurance, and large blank space.

---

## 13. Enterprise credibility without social proof

Lintel has no customers to name, no metrics to publish and no certifications to display, and R3A forbids inventing any. Credibility must therefore be *demonstrated*, and the page has six mechanisms:

1. **Operable product.** The theatre is real, visitor-controlled and consequential. Nothing signals seriousness like a control that does what it says.
2. **Real provenance.** Scene 3 shows an actual run manifest with real schema, generator and ruleset versions and a real reproducibility classification. Marketing pages do not usually contain a reproducibility field, because most products cannot fill one in.
3. **Precise language.** *Directly observed*, *missing · unverified*, `OPEN · BLOCKING`, *deterministic ruleset*, *timing-safe comparison*. Vocabulary a practitioner recognises and a copywriter would not invent.
4. **Visible boundaries.** Stating that the GitHub Action is a blueprint, that Slack copies rather than sends, that exact model replay is not promised, and that device storage is not a privacy guarantee. Voluntary limitation is the most credible signal available to a product with no adoption story.
5. **Explicit human authority.** A product that refuses to decide is a product that has thought about consequence.
6. **Implementation quality.** Deliberate line breaks, one clear focal object per section, keyboard-complete controls, an authored reduced-motion mode, no layout shift. Craft is read as competence.

**The page must never imply otherwise:** no logo wall, no "trusted by", no counters, no fabricated quotes, no named organisation, no security or compliance certification, and no visual borrowing that implies partnership.

---

## 14. Copy-density hierarchy

**Tier 1 — prominent, unchanged.** The hero headline; *Software can now be created faster than teams can verify it.*; the three `≠` distinctions; *Lintel recommends. The engineer decides.*; *A pull request goes in. One updated decision comment comes out.*; the trust statement; *Move from generated code to an accountable merge decision.*; the four principle titles; every CTA label.

**Tier 2 — supporting, one paragraph maximum.** The hero lede; each act's opening paragraph; the theatre's product lede; the evolution paragraph; the accountability paragraph.

**Tier 3 — annotation (13px, `--lnd-ink-3`, no heading).** The theatre boundary line; the GitHub boundary note; the evolution head note; the recorded-decision explanation; each trust principle's second sentence; the manifest plate's caption; all section coordinates.

**Removed as duplication.** The hero note line; the hero field-foot; the theatre lede's pending restatement; the evidence-chain bridge line; the standalone chain section's five per-station definitions *(the register keeps one line each)*; two of five movement rows; the audience section's heading and coordinate.

**Where the product replaces explanation.** The five-stage definitions are stated once in Act III's register rather than three times. The requirement taxonomy is shown as real clause state rather than described. The deterministic/model distinction is shown by the manifest's `reproducibility` field rather than argued in prose.

**Left to R3F.** Line-level conversion polish, including whether R3A's 26-word hero subheadline should be shortened, and the exact wording of Tier 3 annotations. R3E does not rewrite copy; it assigns weight.

---

## 15. Motion intent

Values are R3C's, unchanged: `micro 120ms`, `state 180ms`, `spatial 240ms`, `narrative 360ms`, `cubic-bezier(.2,.65,.35,1)` for state, `cubic-bezier(.16,.76,.3,1)` for entry.

**Permitted, and only these:**
1. The hero entrance — one sequence, ≤ 900ms, §5.6.
2. Section reveals — one-time, opacity plus ≤ 10px translate, 360ms, 70ms stagger, unobserved after reveal.
3. The theatre — unchanged: the 5.5s intro that stops permanently on any interaction, and `state`-band scenario and stage transitions.
4. The evolution toggle and the optional manifest toggle — instant or ≤ 180ms, no travel.
5. Act III's chain line drawing once as the register enters, ≤ 420ms.

**Prohibited:** perpetual motion, simulated pointer, typing sequences, scroll hijacking, parallax, looping carousels, animated counters, any motion required for comprehension, and any animation of width, height, `top`/`left`, filters, blur or shadow.

**Layout shift: none.** Every animated element reserves its final size before it animates. The hero plate must not reflow when the ground fades in.

**Reduced motion** remains an authored mode: the hero is fully composed at rest, the theatre presents its final default state and never starts its sequence, toggles are instant replacements, and the reveal failsafe stands.

---

## 16. Responsive narrative

Mobile is a **re-authored composition**, not stacked desktop sections. The act order never changes.

| Act | Mobile treatment |
|---|---|
| I | Copy first at full width; plate below carrying the identity band and the pending decision only; trace on the left edge with five nodes, one labelled; drawn ground reduced to one corner crop ≤ 4%; both CTAs full-width, primary first |
| II | Statement, paragraph, then the three distinctions with the stagger removed; the proof scene stacks — pipeline record above, findings on their stem below |
| III | The five-stage register becomes a **vertical** rail with five rows; the theatre keeps its full interaction with scenario and stage controls scrolling in their own bounds, ≥ 44px targets, verdict row persistent above the fold of the panel |
| IV | Evolution: both runs stack, both readable, toggle moves emphasis only. Accountability: horizontal ink rule, **recommendation always before Human Decision**. GitHub: vertical stem, webhook well scrolls in its own bounds, the comment is full width |
| V | Trust: principles as a single column, manifest plate below at full width with fingerprint rows scrolling internally. CTA: audience register, statement, actions stacked. Footer: the narrow evidence-landscape variant, which must still visibly resolve at the bronze decision marker |

**Mobile rules.** No horizontal page scroll at any point. Wide content scrolls inside its own container. Reductions show **fewer complete elements**, never the same elements cropped. Sample provenance is never the first thing dropped. No product surface is reduced to an illegible screenshot — because there are no screenshots (§6.2), every product surface reflows as real DOM.

**Target mobile length: ≤ 11,500px at 390px**, against ≈ 14,400px today.

---

## 17. R3E implementation roadmap

Sequenced so each milestone leaves the page shippable.

### R3E.1 — Chapter architecture and section entries
Introduce the four entry types (§7.1); move coordinates to section feet for type B; merge the evidence-chain section into the Act III register (C3); merge the audience section into the final CTA (C6); apply the new rhythm values and per-section heights (§10); add the raking-light field (§6.1).
*Touches:* `app/page.tsx`, `app/landing/landing.module.css`.
*Ships:* the pacing fix — D1, D5, D9 resolved without any new artifact.

### R3E.2 — Hero recomposition
Build the Case File plate, the two overlapping records and the five-node trace; add the hero crop export to `landing-footer-scene.tsx`; wire the bleed and the entrance sequence; project the plate's fields in the fixture adapter.
*Touches:* `app/page.tsx`, `app/landing/landing.module.css`, `app/landing/landing-footer-scene.tsx`, `lib/landing-theatre-fixtures.ts`, plus a new `app/landing/landing-hero-plate.tsx`.
*Ships:* D2, D3, D4, D7 resolved.

### R3E.3 — Trust resolution and Act IV compression
Add `createCanonicalReviewRunManifest` derivation to the adapter and build the manifest plate; recompose trust as the 2×2 field plus plate; compress GitHub (−400px) and review evolution (−300px); demote all Tier 3 copy.
*Touches:* `lib/landing-theatre-fixtures.ts`, `app/page.tsx`, `app/landing/landing.module.css`, `app/landing/landing-evolution.tsx`, plus a new `app/landing/landing-provenance-plate.tsx`.
*Ships:* D8 resolved; Act IV paced.

### R3E.4 — Act II peak, final CTA and footer integration
Enlarge and bleed the gap proof scene; integrate the audience register into the CTA; tune the CTA-to-footer transition so the drawing rises into the CTA's lower margin; complete the mobile re-authoring of §16.
*Touches:* `app/page.tsx`, `app/landing/landing.module.css`.
*Ships:* the remaining visual peak and the responsive narrative.

### R3E.5 — Acceptance
Verify §19 at 1440, 1280, 1024, 768 and 390; confirm no horizontal overflow, one dark band, CTA contrast, keyboard completeness on every control, reduced-motion completeness, zero layout shift, no new binary asset, theatre behaviour unchanged, application isolation intact; run `npx tsc --noEmit` once and `npm run build` once.

### Reuse, recomposition and freeze

| Component | Disposition |
|---|---|
| `app/landing-nav.tsx` | **Reuse unchanged** |
| `app/landing-motion.tsx` | **Reuse**, extended with the hero entrance sequence |
| `app/landing/landing-primitives.tsx` | **Reuse unchanged** — Chip, Sample, Coordinate, EDGE, step |
| `app/landing/landing-theatre.tsx` | **FROZEN.** No structural, interaction or data change |
| `app/landing/landing-evolution.tsx` | **Reuse**, compressed to three movements |
| `app/landing/landing-footer-scene.tsx` | **Reuse**, plus one new hero-crop export |
| `app/landing/landing.module.css` | **Extend** — entry types, hero plate, manifest plate, light field |
| `lib/landing-theatre-fixtures.ts` | **Extend** — hero plate projection, manifest projection. Existing scenario derivation unchanged |
| `app/page.tsx` | **Recomposed** — section order, entry types, two merges |
| **New assets required** | **None.** Two new SVG compositions authored as JSX (hero crop, drafting grid reuse); no raster, no font, no dependency |

### Frozen product behaviour
The theatre's scenarios, stages, context rail, keyboard model, intro sequence and stop condition, reserved panel height and isolation; the fixture derivation from `mock-report`, `generateReport`, `buildEvidenceHierarchy` and `buildMergeContract`; the requirement-counting rule; the "head not recorded" honesty; every CTA route; every capability boundary.

---

## 18. R3F boundaries

R3F, not R3E, owns:
- Line-level copy and conversion polish, including the hero subheadline length question (§14).
- Page metadata beyond R3D's title/description/OG basics: canonical URL, social share image, any structured data.
- Analytics, conversion instrumentation and CTA experimentation.
- Performance budgeting and Core Web Vitals measurement on a deployed build.
- Final cross-browser and assistive-technology QA.
- The decision on whether a captured social/OG image is produced, and by what process.

R3E must not begin any of these, and must not block on them.

---

## 19. Acceptance criteria

R3E succeeds when:

1. No two consecutive sections share a section-entry type.
2. The first viewport carries **≤ 8** discrete elements and exactly one dominant object.
3. The hero shows a verdict row, one missing-proof record and a pending decision — and does not explain the five-stage model.
4. At least one composition bleeds past the content shell in the hero, and one in Act II.
5. The five-stage model is explained **once** on the page.
6. "Human Decision is pending" appears in **exactly three** places outside the theatre's own stage record.
7. The page reads as five acts; each act has one identifiable visual peak.
8. Total desktop height at 1440 is **≤ 8,000px** (from 10,176px), and mobile at 390 is **≤ 11,500px**.
9. The trust section's right side carries the canonical run manifest plate, and no part of the section is unfilled column.
10. The manifest plate shows real schema, generator and ruleset versions and a real reproducibility classification.
11. The raking-light field contributes **≤ 4%** luminance difference and no element-level gradient, glow or shadow exists.
12. The hero crop and the footer plate are visibly the same drawing at two zooms.
13. **Zero new binary assets**; total page transfer is not larger than R3D's.
14. The theatre's behaviour, data and markup are byte-for-byte unchanged in interaction terms.
15. Exactly one full-width dark band remains.
16. All four anchors resolve; all CTA routes work; all CTA labels are visible in every state.
17. One `h1`, correct heading order, skip link, keyboard-complete nav, theatre, evolution toggle and manifest toggle.
18. Reduced motion presents the complete page immediately; the hero is fully composed at rest.
19. No layout shift from any entrance.
20. No horizontal page scroll at 1440, 1280, 1024, 768 or 390.
21. No customer, adoption, endorsement, metric or certification claim appears; every existing boundary from R3A §21 and R3C §16 is still on the page.
22. Application theme and OS preference cannot invert the landing; no public style reaches a logged-in route.
23. `npx tsc --noEmit` and `npm run build` both pass.
24. R3F can begin without reopening hero hierarchy, chapter structure, section order, product-scene selection, imagery role or trust composition.

---

## 20. Genuine unresolved decisions

Three, all matters of visual taste that cannot be settled from the references or the product. Each changes the page's character rather than its correctness, and R3E.2 needs answers before the hero is built.

**Q1 · How present is the drawn ground behind the hero plate?**
- **(a) Near-invisible, 2–3%** — the plate floats in almost pure paper; maximum calm, closest to Littlebird's restraint; risks leaving D7 partly unfixed.
- **(b) Present, 5–8%** *(recommended)* — the drawing is legible as structure without competing with the plate; gives the opening a world.
- **(c) Assertive, 10–12%** — closest to Giga's immersion; risks the plate reading as an overlay on a diagram, which is the exact failure R3B warned about.

**Q2 · Does the hero plate bleed off the right viewport edge, or stay inside the 1400px shell?**
- **(a) Bleeds** *(recommended)* — Aeterna's geometry, resolves D3, makes the composition feel photographed rather than laid out; costs some right-hand record legibility on very wide screens.
- **(b) Contained** — safer, more symmetrical, more conventional; leaves the page fully inside its grid.

**Q3 · Is the raking light warm or neutral?**
- **(a) Warm, faintly bronze** *(recommended)* — ties the light to the footer plate's single accent and reinforces the paper identity.
- **(b) Neutral** — cooler, more clinical, closer to the current page; less distinctive.

Nothing else in this document requires user judgement.

*End of R3E creative direction.*
