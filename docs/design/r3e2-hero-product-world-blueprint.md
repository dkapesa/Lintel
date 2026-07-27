# R3E.2A — Hero and Product World Visual Blueprint Lock

**Status:** Binding visual-direction, interaction-quality, and repository-mapping contract for R3E.2B. Documentation only.

**Authority:** This document resolves the R3E.2 hero direction within the product, narrative, and visual boundaries established by R3A, R3B, R3C, R3E.0, and R3E.1. If an earlier document describes a denser hero rail, six equal product fragments, a five-node explanatory trace, or a footer-derived hero illustration, this more specific R3E.2A contract governs R3E.2B.

**Locked direction:** **The case, opened on the table.** One calm proposition is followed by one large, coherent Case File entering from below. The Case File is live, server-rendered DOM built from canonical sample data. It is not a screenshot, dashboard montage, SVG product mock, or collection of floating cards.

**Milestone boundary:** R3E.2A creates this file only. It does not implement the hero, change production or laboratory code, create an asset, add a dependency, or run TypeScript or the production build.

---

## 1. Purpose and authority

R3E.2A removes the remaining ambiguity around the opening of Lintel's public landing page. R3E.2B must be able to implement the hero without reopening:

- incident.io as the sole structural reference for the hero;
- Cursor as an interaction reference only;
- the light-first public identity;
- the proposition-first, product-second reading order;
- one dominant Case File;
- the amount of product detail allowed above the fold;
- live DOM rather than a screenshot;
- the desktop bleed and mobile containment strategy;
- the engineering-ground and lighting intensity;
- the motion sequence and failure state;
- the copy and technical-mark budget; or
- the separation between Lintel's recommendation and Human Decision.

R3A remains authoritative for product truth, terminology, canonical sample data, CTA destinations, and forbidden claims. R3B remains authoritative for the page narrative and interaction boundaries. R3C remains authoritative for the scoped public palette, type roles, action/record distinction, semantic colours, focus treatment, and application isolation. R3E.0 and R3E.1 remain authoritative for the five acts, the current section order, chapter pacing, and the frozen interactive theatre.

This document changes no lower-page scene. It defines a reusable product-world grammar for future R3E scenes, but does not redesign those scenes here.

## 2. Exact reference hierarchy

The references have separate, non-overlapping jobs.

| Reference | Authority in R3E.2 | Take | Do not take |
|---|---|---|---|
| [incident.io](https://incident.io/) | **Sole hero structural reference** | Immediate proposition clarity; restrained first-screen density; one obvious action hierarchy; purposeful air; a large product surface entering beneath the proposition; a crop that promises more product below; clear separation between promise and explanation | Wording, colours, typography, branding, interface, imagery, navigation, animation, exact geometry, customer proof, or proprietary assets |
| [Cursor](https://cursor.com/home) | **Interaction reference only** | Real interfaces as proof; visitor control; meaningful state changes; product behaviour carrying the story | Hero layout, darkness, palette, typography, scenic background, brand language, social proof, or visual style |
| Current Lintel screenshots | **Negative hero reference and continuity reference** | Canonical truth, warm paper, headline, semantic state vocabulary, useful IDs, CTA destinations | The full rail, the side-by-side analytical wall, equal fragment weighting, repeated sample explanation, or diagram density |
| R3A/R3B/R3C/R3E | **Product and system authority** | Claims, data, page order, tokens, type, light/dark balance, accessibility, frozen scenes | Earlier hero geometry where R3E.2A explicitly supersedes it |

The current incident.io homepage was inspected on 2026-07-26. Its relevant lesson is structural: a short promise and CTA group own the first reading pass, while a large product surface begins near the bottom of the viewport and is intentionally incomplete. Lintel must translate that discipline, not imitate the page.

The current Cursor homepage was inspected on 2026-07-26. Its relevant lesson is already fulfilled by Lintel's visitor-controlled theatre: a real interface exposes meaningful states rather than using explanatory illustration. R3E.2B must not apply Cursor's dark visual language to the hero or alter the theatre.

No named organisation shown by either reference may be carried into Lintel. No adoption or endorsement relationship may be implied.

## 3. Current-hero diagnosis

The current hero is truthful but asks the first viewport to do the work of several later sections.

### Structural diagnosis

- The copy and product rail compete as two near-equal columns. The eye does not get a clean proposition-first pass.
- Six sequential fragments, six nodes, six connector stubs, two provenance treatments, an eyebrow, a three-line display, a 26-word lede, two CTAs, and a sample explanation create approximately fourteen discrete items.
- The continuous rail makes the product read as a technical process diagram. Every stage is introduced before the visitor understands why the product matters.
- The identity, finding, evidence, missing proof, requirement, and Human Decision are all visible together. Their truthfulness does not compensate for the lack of editorial omission.
- Bordered and unbordered fragments vary, but the composition still reads as assembled parts rather than one consequential record.
- The side-by-side geometry fills the first viewport horizontally and vertically. There is little calm, no product reveal from below, and no reason for the crop itself to encourage the next scroll.
- `SAMPLE DATA` is followed by an explanatory sentence and repeated again in the field foot beside repository/run provenance. The second mark adds technical density, not trust.
- `F1`, `E1`, `E4`, and `C1` are individually legitimate, but the opening does not give the visitor time to understand their relationships. At this density they become aesthetic marks.

### Implementation diagnosis

The current hero lives directly in `app/page.tsx`. It maps `LANDING_HERO_FRAGMENTS` through four visual roles (`anchor`, `principal`, `support`, `terminal`) and applies per-fragment indent, width, semantic edge, mobile visibility, reveal step, nodes, and stubs. `LANDING_HERO_PROVENANCE` supplies the second provenance line.

The hero-specific CSS in `app/landing/landing.module.css` owns the 46/54 grid, rail, fragments, nodes, stubs, role styling, field foot, and the three-fragment mobile reduction. The shared palette, type roles, buttons, chips, focus rules, page texture, shells, and responsive breakpoints are not the cause of the overload and should survive.

The failure is therefore local and replaceable. R3E.2B does not need a page redesign, theatre change, new dependency, screenshot pipeline, or application-level theme work.

## 4. Locked first-five-second experience

The first five seconds have one ordered reading path:

1. **Category:** this is engineering verification.
2. **Promise:** “Agents create code. Lintel verifies what is ready.”
3. **Meaning:** evidence, missing proof, and pre-merge resolution lead to a recorded human decision.
4. **Action:** review a pull request, with the sample Workspace clearly secondary.
5. **Proof:** one Case File appears to have been opened for inspection. Its recommendation, risk, missing proof, open requirement, and pending Human Decision are visible without explaining the whole product model.
6. **Continuation:** the Case File continues below the viewport. Scrolling feels like opening the record further, not leaving the hero for an unrelated section.

The visitor should be able to say: **“Lintel gives me an inspectable record for a consequential merge decision; it recommends, and the human decision is still pending.”**

The first viewport must not teach the five stages, deterministic/model architecture, GitHub workflow, evidence classes, requirement taxonomy, run-manifest vocabulary, or decision-ledger mechanics. Those remain later-page material.

### First-viewport element budget

Nine semantic units is the ceiling:

1. category eyebrow;
2. headline;
3. supporting statement;
4. CTA pair as one action group;
5. Case File identity/title band;
6. recommendation/risk/Human Decision band;
7. one missing-proof record;
8. one connected open-requirement continuation; and
9. one compact sample-provenance mark.

The engineering ground and directional light are environmental treatments, not additional informational units. No other visible label, coordinate, node, run identity, caption, plate number, or decorative mark is allowed above the fold.

## 5. Light-first identity rules

The hero remains unmistakably Lintel and unmistakably light-first.

- Ground: `--lnd-canvas` (`#f6f4ef`), never white and never theme-dependent.
- Case File: `--lnd-paper` (`#fbfaf6`) with selective `--lnd-paper-sunk`/`--lnd-paper-tint` differentiation.
- Text: `--lnd-ink`, `--lnd-ink-2`, and `--lnd-ink-3`; `--lnd-ink-4` is decorative only.
- Structural edges: `--lnd-rule`, `--lnd-rule-strong`, and one ink-weight relationship line. A line must separate records or show a real relationship.
- Semantic colour: amber for `TESTS REQUIRED`, `MEDIUM`, `MISSING · UNVERIFIED`, and `OPEN · BLOCKING`; blue only for interaction/focus or directly observed informational state elsewhere; red only for genuine severity. The hero does not need red merely to add urgency.
- Newsreader: headline only. Geist Sans carries eyebrow, support, actions, product labels, and record prose. Geist Mono carries repository/PR identity, `E4`, `C1`, risk values, and state tokens only.
- Actions remain pills; product records remain near-square with a 3px radius. The outer Case File may use **6px maximum** to establish one coherent instrument without becoming a generic rounded SaaS card. Internal records remain 3px.
- Elevation comes from overlap, crop, material contrast, and light. No box shadow, glass, glow, or floating-card cloud.
- The dark theatre later in Act III remains the only major full-width dark product environment.

The hero must not respond to application theme state or OS dark preference. Public tokens stay scoped to the landing root. Newsreader and all hero styles stay inside that same scope.

## 6. Exact hero copy hierarchy

The copy order and budget are locked. R3F may polish a line within the budget; it may not add a new tier or restore removed explanation.

| Tier | Locked content/role | Budget and treatment |
|---|---|---|
| Eyebrow | `ENGINEERING VERIFICATION` | Retain. It adds the category. One line, no coordinate, no section number. |
| Headline | `Agents create code.` / `Lintel verifies what is ready.` | Retain verbatim. Two authored semantic lines; wrapping may create a third visual line at narrow widths. Newsreader only. |
| Supporting statement | Shortened hero form of the R3A meaning | **18–22 words, one sentence, 42ch maximum.** Working handoff: “Inspect the evidence behind a change, find missing proof, and see what must be resolved before recording the final human decision.” R3F may polish this line without changing its four ideas. |
| Primary CTA | `Review a pull request` → `/new` | Unchanged. |
| Secondary CTA | `Explore the sample Workspace` → `/workspace?source=fixture` | Unchanged. |

The full R3A supporting wording should remain available elsewhere in the page or product explanation; it is too long for the locked hero. R3E.2B must use the shortened semantic shape rather than preserve the current 26-word sentence by default.

Prohibited hero copy:

- the current “One change, moving through five stages. Nothing here has been decided.” sentence;
- any second sentence saying Lintel does not decide;
- “Case 01”, “plate”, coordinates, chapter labels, or decorative mono captions;
- adoption, customer, usage, accuracy, security, certification, or enterprise-ready claims;
- marketing compounds or inflated AI language;
- branch, file-count, run-ID, SHA, generator, ruleset, or schema metadata; and
- labels that repeat the adjacent heading or status.

### CTA behaviour

- The group sits **24px** below the supporting statement on desktop/tablet and **22px** below on mobile.
- Primary precedes secondary in DOM and visual order.
- Desktop/tablet: inline pair with a 12px gap; do not centre the secondary beneath the primary.
- Mobile: two full-width rows with a 10px gap, primary first.
- Minimum height: 46px desktop/tablet; 48px mobile. The visible label never truncates.
- Primary: graphite fill, canvas text; hover to `#000`; active remains black with a 1px downward transform; no gradient or shadow.
- Secondary: transparent fill, strong paper border, secondary ink; hover strengthens border/text to full ink and may add `--lnd-paper-tint`; active returns to canvas with a 1px downward transform.
- Keyboard focus: existing 2px `--lnd-focus` outline with 3px offset, never replaced by hover treatment. `:focus-visible` must be unmistakable on both paper and the lit region.
- Visited state must not change either CTA's hierarchy or colour.

## 7. Exact desktop composition

### Composition model

Desktop is **not** the current 46/54 copy-versus-rail split. It is a proposition field above a single product reveal:

- The proposition begins inside the 1400px wide shell, aligned to the page gutter.
- The copy occupies the upper-left region and never shares a squeezed row with detailed product records.
- The Case File begins beneath the CTA group, offset toward the right, and rises into the lower portion of the viewport.
- The Case File is wider than the copy and intentionally crosses the shell's right content edge.
- A hero-owned clipping wrapper contains the bleed. The page root may retain `overflow-x: clip` as a guard, but must not be the only overflow strategy.

### Exact viewport recommendations

All y positions are measured from the viewport top, including navigation. They are target bands, not post-hydration calculations.

| Viewport | Copy geometry | CTA geometry | Case File geometry | Visible before fold |
|---|---|---|---|---|
| **1440 × 900** | Left x **56px**; first copy baseline region y **150–164px**; headline max width **620px** and optical measure **15–17 words per line**; support max width **520px / 42ch** | Starts y **386–410px**, inline | Top y **515–535px**; left x **340–380px**; width **1100–1140px**; right edge **40–80px beyond** the viewport; outer height **620–680px** | **365–385px**: complete identity/title and verdict bands, complete missing-proof record, and the opening **32–64px** of the requirement continuation |
| **1280 × 800** | Left x **48–56px**; copy begins y **120–136px**; headline max width **590px**; support max width **500px** | Starts y **342–366px**, inline | Top y **462–482px**; left x **270–310px**; width **1000–1040px**; right bleed **24–64px**; height **600–650px** | **318–338px**: identity/title, full verdict band, full missing-proof record, and the requirement's top edge/label |

### Wide-desktop internal geometry

- Case File safe-content inset: **28–32px** left, **36–48px** right, **24–28px** top.
- Identity/title band height: **118–132px**. Repository/PR identity sits above the title; title is the largest product text at 20–22px.
- Verdict band height: **68–76px**, in three unequal cells: recommendation **42%**, risk **28%**, Human Decision **30%**. Each cell may wrap internally but cannot be clipped by the right bleed.
- The safe crop zone is the Case File's far-right **64–96px** and its lower continuation. Only nonessential paper edge, empty measure, or low-priority continuation may enter that zone.
- Repository/PR identity, change title, `TESTS REQUIRED`, `46/100 MEDIUM`, and `HUMAN DECISION PENDING` must remain left of `calc(100vw - 32px)` at both desktop sizes.
- Missing proof occupies **54–62%** of the Case File's usable width and begins **22–28px** below the verdict band. It may overlap the inner paper field by 12–18px, but never float outside the Case File.
- The requirement continuation is visually attached to the missing-proof record with one 1px ink/strong-rule stem and one small node or elbow, not a multi-stage rail.
- The outer product surface is intentionally incomplete at the fold. Do not compress it to make the whole Case File fit.

The hero section reserves its final height in CSS before fonts or motion resolve. For 1440 × 900 use a target hero block of **828px after the navigation**, with a minimum total first-act height of 900px. For 1280 × 800 use **728px after navigation**. The following act begins in normal flow; the Case File may continue into the hero's lower clipping field but must not overlap interactive content in Act II.

## 8. Tablet composition

Tablet/laptop widths use one column. There is no squeezed two-column copy/product layout.

| Viewport | Copy and actions | Case File | Crop and simplification |
|---|---|---|---|
| **1024 × 768** | x **44–48px**, top y **112–124px**, copy max width **620px**; actions inline | Top y **490–510px**; left x **80–96px**; width **928–944px**; right edge flush to viewport or at most **16px clipped inside the hero wrapper** | **258–278px** visible. Identity/title and verdict bands complete; missing-proof header/title visible; requirement remains below fold. Hide branch, file count, run ID, evidence source, and record descriptions. |
| **768 × 900** | x **28–32px**, top y **102–116px**, copy max width **704px**; actions inline while both labels fit without compression | Top y **530–550px**; left x **28–32px**; width **736–740px**; no viewport bleed | **350–370px** visible. Identity/title, verdict, and missing proof complete; show the start of the attached requirement. |

Tablet rules:

- The Case File follows the CTA group in document order.
- The identity/title and verdict bands keep their full hierarchy. Do not turn them into a dense dashboard header.
- Bleed is reduced to zero or a maximum internal clip of 16px at 1024. At 768 the surface is fully contained.
- The three verdict cells may become a 2+1 grid: recommendation and risk share the first row, Human Decision spans the second. Human Decision is never pushed below the initial visible product region.
- Product text remains at least 13px for labels and 15px for record titles. If content cannot fit, remove lower-priority metadata rather than reduce type.
- The engineering ground is cropped to the Case File's lower-right/underlay region at 4–6% intensity. It never runs behind the proposition copy.
- The product reveal uses normal vertical flow and a reserved min-height. No sticky or viewport-height JavaScript is allowed.

## 9. Mobile composition

At **390 × 844**, the composition is re-authored, not a scaled desktop crop.

- Page gutter: **20px**.
- Copy begins y **94–104px** after the compact navigation.
- Headline width: **350px** maximum. Authored semantic lines remain, but natural wrapping may produce three visual lines. Use the existing 40px minimum display size; do not shrink below 38px to force two lines.
- Supporting statement width: **350px**, no more than four visual lines.
- CTA stack begins approximately y **392–420px** and consumes **106px** including the gap.
- Case File begins y **548–568px**, left x **20px**, width **350px**, no negative margin and no page-level bleed.
- Approximately **276–296px** of the Case File is visible before the fold.

The mobile Case File reflows internally:

1. repository/PR identity on one line: `acme/redemption-api · PR #482`;
2. title at 17–18px, two lines maximum;
3. verdict as three complete rows or a 2+1 grid: `TESTS REQUIRED`, `46/100 · MEDIUM`, `HUMAN DECISION · PENDING`;
4. one compact `SAMPLE DATA` provenance mark in the identity band;
5. the top of `E4 · MISSING PROOF` as the continuation cue.

The `C1` requirement remains in the DOM immediately after the missing-proof record but is below the initial fold. This is deliberate deferral, not concealment behind an interaction. F1, E1, branch, file count, run ID, source strings, trace nodes, and explanatory decision prose do not render in the mobile hero.

The crop is produced by the viewport and the hero's contained reveal window, not by horizontal scrolling. `document.documentElement.scrollWidth` and `body.scrollWidth` must equal the viewport width. No internal horizontal scrolling is necessary for the hero at 390px.

The engineering ground reduces to one lower-right crop at **3–4%** intensity. The directional light may be removed entirely below 480px; the paper/material contrast must still be sufficient without it.

## 10. Case File information hierarchy

The Case File is one coherent object with three information levels.

### Level 1 — dominant identity and decision state

Visible at every target size:

- `CASE FILE` only if required to name the object; omit it if the surrounding product semantics already do so;
- `acme/redemption-api · PR #482`;
- `Add fallback handling for failed discount-code retrieval`;
- `TESTS REQUIRED`;
- `46/100 · MEDIUM`; and
- `HUMAN DECISION · PENDING`.

The recommendation, risk, and Human Decision are peers within one verdict band, but Human Decision must be materially separated by a rule or paper tint so the recommendation is never mistaken for authority.

### Level 2 — one focused proof relationship

Visible above the fold on desktop and mostly visible at 768:

- `E4 · MISSING PROOF`;
- `Test evidence unavailable`;
- `MISSING · UNVERIFIED`;
- one connector into `C1 · REQUIREMENT`;
- `Prove retries cannot issue duplicate discount codes`; and
- `OPEN · BLOCKING`.

This relationship explains why `TESTS REQUIRED` is credible. It does not explain the whole evidence chain.

### Level 3 — deferred detail

Below the fold or removed from the hero:

- requirement detail and any proof-satisfaction note;
- observation `F1`;
- observed evidence `E1`;
- finding severity and category;
- branch and changed-file count;
- run identity, head/SHA, source, generator, schema, and ruleset;
- the full Human Decision record fields; and
- all other requirements, evidence records, and stages.

### Meaningful ID rule inside the Case File

`PR #482`, `E4`, and `C1` survive because they identify a real pull request and make a visible missing-proof-to-requirement relationship traceable. `F1` and `E1` are removed from the hero because their referents are not shown. No five-stage numbers or anonymous node IDs appear.

## 11. What appears above and below the fold

| Record/content | 1440 × 900 | 1280 × 800 | 1024 × 768 | 768 × 900 | 390 × 844 |
|---|---|---|---|---|---|
| Category, headline, short support, CTA pair | Complete | Complete | Complete | Complete | Complete |
| Case File identity/title | Complete | Complete | Complete | Complete | Complete |
| Recommendation, risk, Human Decision pending | Complete | Complete | Complete | Complete | Complete |
| Sample provenance | Complete | Complete | Complete | Complete | Complete |
| E4 missing-proof record | Complete | Complete | Header/title visible | Complete | Top/header visible |
| C1 open requirement | Label/top 32–64px | Label/top edge | Below fold | Opening visible | Below fold |
| F1 observation / E1 observed evidence | Removed | Removed | Removed | Removed | Removed |
| Full five-stage model | Later Act III only | Later Act III only | Later Act III only | Later Act III only | Later Act III only |

Below the fold, the Case File may complete the C1 record and then yield to Act II. It must not grow into a hidden second hero page. The visitor should encounter no more than the one E4→C1 relationship before the existing verification-gap act begins.

## 12. Engineering-ground specification

The engineering ground is a subtle authored underlay beneath and around the lower Case File. Its job is to establish a product world and material depth while making the composition feel calmer.

### Content

- One close crop of Lintel's evidence-landscape vocabulary: two or three branch traces converging toward one evidence stem.
- One restrained drafting baseline or elbow that visually supports the Case File's orientation.
- At most **two** registration marks, used only where a line changes direction or the crop needs a measured anchor.
- Existing paper tooth remains page-owned and low contrast.
- No readable code, terminal text, schema text, coordinates, labels, random crosses, plus signs, or dense grid.

### Rendering recommendation for R3E.2B

- Use a **small server-rendered inline SVG/JSX ground component** for the authored branch/trace geometry. It is decorative: `aria-hidden="true"`, `role="presentation"`, `focusable="false"`.
- Use CSS only for paper tooth, sparse existing texture, masks, opacity, and responsive crop.
- Do not create an external SVG file, raster asset, canvas renderer, or image request.
- Keep the ground hero-owned. Do not modify the frozen visual laboratory or require a footer component change in R3E.2B.

### Intensity and material

- Desktop line opacity: **5–8%**, target **6.5%**.
- Tablet: **4–6%**.
- Mobile: **3–4%** or removed when it competes with the crop.
- The ground occupies the lower **48–58%** of the hero and the right **70–82%**; it does not sit beneath headline or supporting copy.
- No more than one line may approach ink weight above 10%, and that line must be the meaningful E4→C1 relationship inside the Case File, not the ground.
- The ground must remain visually subordinate when the page is viewed blurred or at 50% scale. If it reads as a diagram, it is too strong.

Performance budget: **≤ 5KB uncompressed JSX/SVG markup**, no filters, no masks with large filter regions, no animated paths, no external request, and no more than roughly 20 path/line primitives.

## 13. Directional-light specification

Use one static, page-owned warm light field entering from the upper left.

### Locked treatment

- Source: outside the viewport at approximately **x 12%, y -8%**.
- Colour: warm paper/bronze-neutral, closer to `#f7eddc` than orange. No saturated colour stop.
- Primary affected region: upper-left hero ground through the Case File's upper-left quarter.
- Perceived luminance change: **≤ 4%** across the hero. The target is 2.5–3.5%.
- Falloff: broad and complete by approximately **62% viewport width / 68% hero height**. No visible edge or band.
- The light may make the Case File's paper slightly warmer than the canvas; it may not create a halo around records or change semantic state colours.
- No light field inside the logged-in product, the dark theatre, product records elsewhere, or application routes.

### Contrast protection

- The eyebrow, headline, support, and CTA labels must compute against a stable opaque or near-opaque canvas layer. The strongest light region must not sit directly behind the support text.
- Text contrast remains at least 4.5:1; primary display and body targets should continue to exceed the R3C values.
- Semantic amber must remain distinguishable from the warm light. If the light makes amber status treatment look decorative, reduce the light before changing semantic colour.

### CSS/SVG decision

- **CSS is recommended for the light field**: one pseudo-element on the hero environment using a broad radial gradient and, only if necessary, a very faint edge falloff.
- Inline SVG is reserved for the authored engineering ground. Do not use an SVG filter, blur, or lighting primitive.
- The CSS gradient is an environmental illumination exception, not permission for element gradients, button gradients, or card glows.

### Mobile and paint

- At 768px, simplify to one radial field with lower opacity.
- Below 480px, remove it if it does not materially improve the composition. Mobile correctness cannot depend on lighting.
- Static background only; no animation, pointer response, scroll response, blend mode, filter, or JavaScript.
- Keep the gradient layer to one composited pseudo-element. Avoid multiple large translucent layers that cause full-viewport repaints.

## 14. Product-world visual grammar

R3E.2 establishes a reusable grammar, not a single reusable template.

Every major product scene must have:

1. **One dominant product object.** It is recognizable at a glance and materially larger or denser than support.
2. **One narrative purpose.** The scene proves one claim, not a product inventory.
3. **One focal state.** Recommendation, missing proof, Human Decision, run reproducibility, or another single consequential state owns the first read.
4. **Lower-weight support.** Supporting records are fewer, smaller, quieter, or partially cropped. They do not become a card cloud.
5. **Product first, annotation second.** A real state carries the argument; explanatory prose only closes a gap the state cannot.
6. **Meaningful crop or overlap.** The composition has a chosen frame. Crop never removes recommendation, open-requirement state, Human Decision, or provenance.
7. **One compact provenance mark.** `SAMPLE DATA` or an equivalent fixture label is visible and legible.
8. **Truthful responsive reduction.** Small widths show fewer complete units, not the full desktop density at tiny type.

Depth may come from scale, overlap, crop, restrained directional light, paper/ground contrast, and different information densities. It may not come from heavy shadows, glow, glass, random perspective, floating-card clouds, ornamental parallax, or border accumulation.

A product scene is not automatically a white card. It may be a Case File, interactive instrument, split accountability record, manifest, review comparison, or GitHub comment. Shared grammar creates kinship; object shape and density remain specific to the scene's purpose.

## 15. Motion and smoothness contract

The hero entrance is one coordinated sequence and completes by **800ms target / 900ms hard maximum**.

### Exact sequence

| Time band | Element | Motion |
|---|---|---|
| **0ms** | Eyebrow, headline, supporting statement | Present at final position and fully readable. No display-text stagger. |
| **80–220ms** | CTA group | Opacity `0.88 → 1` and `translateY(4px → 0)`, 140ms. Both actions move as one group. |
| **80–440ms** | Engineering ground | Opacity `0 → final`, 360ms. No path drawing. |
| **180–620ms** | Case File | Opacity `0 → 1`, `translateY(12px → 0)`, optional single clip reveal from the bottom edge, 440ms. The reserved box never changes. |
| **420–780ms** | E4→C1 supporting relationship | Opacity `0 → 1`, `translateY(6px → 0)`, 240ms. It resolves as one unit, not per label. |

Easing: existing `cubic-bezier(.16,.76,.3,1)` for entrance; existing state curve for hover/active feedback.

### Ownership

- Prefer CSS keyframes/transitions on hero-owned classes under `prefers-reduced-motion: no-preference`.
- The server-rendered DOM is the complete final DOM. JavaScript does not create, measure, fetch, or sequence product content.
- Avoid adding a hero client component. If the existing `LandingMotion` root is used as an arming signal, default CSS remains fully visible and a controller failure leaves the final composition present.
- Do not apply the generic per-label `data-reveal` stagger to the new Case File. The whole artifact and its one supporting relationship move as units.

### Prohibitions

No spring, overshoot, bounce, cursor simulation, typing, progress state, autoplay loop, scroll hijack, sticky choreography, large parallax, animated gradient, perpetual motion, or animation of width, height, `top`, `left`, shadow, filter, or blur.

### Reduced motion and failure state

- Under `prefers-reduced-motion: reduce`, all hero elements render immediately at final opacity and position, with no clip or transform.
- A no-JavaScript page is complete.
- A CSS-animation failure is complete.
- Motion may never be needed to discover the recommendation, risk, Human Decision, sample provenance, CTA, or continuation.

## 16. Technical-mark and copy-pruning rules

Every word, ID, number, line, and mark must answer one of three questions: **what is this, what state is it in, or what can I do next?** If it answers none, remove it.

### Retain an ID only when all are true

- it names a real product record in the scene;
- the referent is visible;
- the ID improves traceability between visible records; and
- the surrounding surface behaves like a product record, not decoration.

Therefore `PR #482`, `E4`, and `C1` survive in the hero. `F1`, `E1`, run IDs, plate numbers, section coordinates, stage numbering, anonymous node labels, and arbitrary letters do not.

### Page-wide cleanup policy for R3E.2B and later R3E work

- One sample-provenance mark per major product scene. Never repeat a nearby sample sentence.
- One status statement per concept per scene. Do not say Human Decision is pending in a chip and then repeat “nothing has been decided” beside it.
- Technical mono is for provenance, identity, values, and state tokens, never atmospheric captions.
- Do not label a region with the same words as its immediately adjacent heading.
- Do not show strings below a readable size merely to suggest complexity.
- Do not add coordinates, rules, crosses, nodes, or legends to occupy empty space.
- Preserve IDs and state tokens where they support a visible relationship; defer them when the relationship is not shown.
- Product truth is never deleted to simplify a scene. It moves to the later scene that can explain it.

R3E.2B applies this policy to the hero only. It must not rewrite unrelated lower-page copy during the hero replacement.

## 17. Enterprise credibility rules

Credibility for senior, staff, and principal engineers comes from the product's restraint and precision:

- one coherent Case File rather than a marketing montage;
- canonical sample data and stable internally consistent states;
- visible separation of `TESTS REQUIRED` from `HUMAN DECISION · PENDING`;
- a missing-proof-to-open-requirement relationship that explains the recommendation;
- one useful provenance mark;
- honest omission of adoption, security, and outcome claims;
- controlled responsive behaviour with readable product type;
- stable, fast motion and no layout shift;
- exact CTA destinations; and
- confidence through omission.

Forbidden:

- customer or prospect names;
- fabricated logos, testimonials, usage counts, benchmarks, monitoring data, badges, certifications, or security seals;
- “enterprise-grade AI”, “autonomous approval”, “safe merge”, or similar unsupported language;
- any suggestion that NVIDIA, Adobe, Spotify, OpenAI, Figma, Notion, or another named organisation uses, endorses, pilots, or has evaluated Lintel; and
- visual borrowing strong enough to imply a relationship with incident.io or Cursor.

“Enterprise-grade” is a quality target for execution, not copy for the page.

## 18. Shared product-scene system

The product-world grammar applies differently to the approved scene hierarchy.

| Scene | Dominant object and purpose | Focal state | Shared treatment | Deliberate difference |
|---|---|---|---|---|
| **Establishing: Hero Case File** | Open review record; establish consequence and product category | Tests required + risk + Human Decision pending | Warm paper, live DOM, compact provenance, meaningful crop, single entrance | Largest light object; right bleed; least explanation |
| **Principal operated: Interactive theatre** | Visitor-controlled verification instrument; prove behaviour | Selected scenario/stage with persistent verdict | Canonical sample, provenance, semantic state, keyboard/touch support | Frozen dark environment; denser; state changes are visitor controlled |
| **Principal accountability: Recommendation vs Human Decision** | Two different records; prove authority boundary | Recommendation separate from authored outcome | Precise rule, product language, calm hierarchy | Light split composition; no crop that could confuse the two sides |
| **Principal trust: Canonical run manifest (R3E.3)** | Reproducibility/provenance record | Exact vs traceable classification | Live DOM, mono values, provenance, responsive simplification | Dense field register; static or one explicit toggle, not a Case File |
| **Supporting: Review Evolution** | Compare record movement | What changed between runs | Lower scale, canonical IDs, controlled state emphasis | Compact comparison, not a hero-sized object |
| **Supporting: GitHub comment** | Show durable workflow output | One updated decision comment | Realistic record, sample provenance, truthful boundaries | Resolved endpoint artifact, not a screenshot gallery item |

### Shared surface rules

- Radius: actions 999px; product records 3px; major product instruments 4–6px maximum.
- Edge: one outer edge plus only the internal rules needed to separate real records. No decorative border nesting.
- Crop: may remove continuation or low-priority metadata; never recommendation, risk, Human Decision, open requirement where it is the focal state, or provenance.
- Density: one focal density tier and at least one visibly quieter tier.
- Annotation: follows the product state and stays at support weight. It never becomes a second headline.
- Provenance: one compact mark per scene, visible at every breakpoint.
- Light/dark: light scenes use paper/graphite; the theatre alone owns the major dark environment. Small graphite records elsewhere do not become bands.
- Motion: one entrance per static scene; state motion only for a real visitor-controlled state change.
- Scene transitions: use spacing, crop, and material change. Do not repeat the same top-rule/two-column entry pattern or turn the page into consecutive screenshots.

## 19. What the current hero keeps and retires

### Keep

- the core headline, verbatim;
- the category eyebrow, because it adds information;
- CTA labels and destinations;
- Newsreader's limited display role and Geist for working/product language;
- the canonical `acme/redemption-api` PR #482 change and title;
- `TESTS REQUIRED` and `46/100 · MEDIUM`;
- `HUMAN DECISION · PENDING`;
- one missing-proof-to-open-requirement relationship (`E4`→`C1`);
- warm paper, graphite, semantic amber, scoped blue focus, and compact sample provenance;
- server-side derivation from canonical builders; and
- complete DOM, accessible links, and reduced-motion support.

### Retire from the hero

- the complete six-fragment rail;
- observation F1 and observed evidence E1;
- six nodes, all connector stubs, and the five-stage explanation;
- equal or near-equal weighting across product fragments;
- the branch and changed-file count;
- the run identity and second provenance line;
- the explanatory sample sentence beside the CTAs;
- duplicate “Lintel does not decide” prose;
- the desktop-only/mobile fragment-role system;
- decorative field-grid density behind the whole product column; and
- any technical mark retained solely because it already exists in CSS.

The full five-stage model remains in Act III and the theatre. Recommendation-versus-Human-Decision detail remains in Act IV. Run provenance remains for the R3E.3 manifest.

## 20. Repository implementation map

### `app/page.tsx`

- Replace only the current hero section markup inside Act I.
- Retain `LandingMotion`, `LandingNav`, `Act`, the five-act order, following sections, CTA constants, and server-component ownership.
- Retire the `FRAGMENT_ROLE` mapping and hero use of `LANDING_HERO_FRAGMENTS`/`LANDING_HERO_PROVENANCE` when no longer referenced.
- Import one server-rendered hero component if extracted.
- Keep one `h1`, the existing `aria-labelledby` relationship, real `Link` CTAs, and logical reading order.

### `app/landing/landing.module.css`

- Reuse the scoped palette, type roles, shell tokens, CTA/focus treatment, chip tones, paper texture, and breakpoint structure.
- Replace the current 46/54 hero grid with the proposition-over-product reveal geometry in §§7–9.
- Retire, once unused: `.heroNote`, `.heroRail`, `.heroFragments`, `.heroFragment`, `.heroFragmentIn`, `.fragAnchor`, `.fragPrincipal`, `.fragSupport`, `.fragTerminal`, `.fragHead`, `.fragTitle`, `.fragDetail`, `.fragState`, `.heroFieldFoot`, `.heroFragmentDesktopOnly`, and their pseudo-elements/mobile overrides.
- `.fieldGrid` is shared by the later chain and must **not** be deleted. Stop using it as the hero's primary atmosphere; the new hero ground is separately scoped.
- `.heroCopy`, `.heroTitle`, `.heroLede`, `.heroActions`, `.display`, `.lede`, `.actions`, `.btnPrimary`, and `.btnSecondary` may be reused/tuned rather than duplicated.
- Add hero-owned containment, Case File, ground, light, and motion selectors. Every new selector remains inside the CSS module/public root.

### `app/landing/landing-primitives.tsx`

- Reuse `Chip`, `Sample`, and `EDGE` where they reduce duplication.
- Do not change `Coordinate`, `OperationalHead`, or unrelated lower-page primitives for this milestone.
- No client directive is required.

### `app/landing/landing-act.tsx`

- Reuse unchanged. Act I still contains only the hero; the five-act architecture and rhythm contract remain intact.

### `app/landing-motion.tsx`

- Prefer no change. It continues to own the public scope, page texture, generic section reveals, reduced-motion state, and failsafe.
- The new hero should not use the generic label-by-label reveal sequence. Hero motion is CSS-owned and grouped.
- Modify this file only if R3E.2B proves an arming signal is necessary to prevent a first-paint flash; any change must preserve complete static DOM, the 1.6s failsafe, reduced motion, and application isolation.

### `lib/landing-theatre-fixtures.ts`

- Preserve `LANDING_SCENARIOS`, theatre derivation, canonical builders, requirement-counting rule, and all later-scene projections.
- The current `LandingFragmentRole`, `LandingFragment`, `LANDING_HERO_FRAGMENTS`, and `LANDING_HERO_PROVENANCE` are hero-shape coupling and may be retired.
- Preferred adaptation: export a compact serialisable `LANDING_HERO_CASE_FILE` projection containing only repository, PR, title, recommendation, risk score/band, decision state, E4 missing-proof fields, C1 requirement fields, and provenance label.
- Derive it from the existing canonical report/evidence/contract helpers. Do not duplicate literal risk/count values in JSX and do not change the canonical scenario.
- If the same truthful projection can be assembled without new public fixture API and without importing internal report objects into a client boundary, leave this file unchanged. Truthful server-side derivation is the deciding criterion.

### New server-rendered hero component

Preferred path: `app/landing/landing-hero-case-file.tsx` (exact filename may vary). It owns the semantic Case File DOM and, optionally, a small decorative JSX ground child. It has no `"use client"`, no effect, no storage access, no network request, and no product action beyond the page CTAs.

### Files explicitly unchanged

- visual laboratory files;
- `app/landing/landing-theatre.tsx` and its behaviour;
- `app/landing/landing-evolution.tsx` and Review Evolution behaviour;
- logged-in routes, application shell, theme bootstrap, and application tokens;
- footer scene during R3E.2B;
- package manifests and dependencies.

## 21. R3E.2B permitted scope

R3E.2B may change only the smallest credible set needed to replace the hero:

- `app/page.tsx`;
- `app/landing/landing.module.css`;
- `app/landing/landing-primitives.tsx` only if a genuinely reusable hero atom belongs there;
- one new server-rendered hero component under `app/landing/`;
- one small hero-owned JSX/SVG ground component, which may be the same file as the hero;
- `app/landing-motion.tsx` only if required by the no-flash/failure-state contract; and
- `lib/landing-theatre-fixtures.ts` only for the compact canonical hero projection.

R3E.2B may not:

- alter section order, act wrappers, or later-section copy/layout;
- modify the visual laboratory;
- modify the frozen theatre or Review Evolution behaviour;
- add a raster, external SVG, font, icon pack, animation library, or dependency;
- embed or screenshot the Workspace/Case File application;
- add storage, network, theme, or hydration dependencies to the hero;
- change CTA destinations or product truth;
- touch logged-in application routes or styling; or
- introduce a named-company, adoption, customer, performance, security, or certification claim.

Likely dead styles and exports should be removed in the same hero change only after search confirms they are unused. Do not leave the six-fragment rail hidden behind the new component as a fallback.

## 22. Performance and accessibility requirements

### Performance

- Server-render the complete copy and Case File.
- No hero network request, client data derivation, canvas, video, raster, or external asset.
- Hero-owned inline SVG/JSX ground ≤ 5KB uncompressed and approximately ≤ 20 primitives.
- CSS-only motion using transform and opacity. No continuous JavaScript, scroll listeners, resize observers, or layout measurement.
- Reserve all hero, Case File, verdict, and record dimensions before motion starts.
- Preloaded Next fonts must not cause a late line-break change that moves the Case File. Use authored measures and the existing font loading strategy; verify after fonts are loaded.
- Avoid large filter regions, blur, blend modes, and multiple viewport-sized translucent layers.
- No page-level horizontal overflow at any acceptance viewport.
- No hero height change after hydration; no card jump; no sticky handoff; no motion that fights an immediate user scroll.

### Accessibility

- Exactly one `h1`; eyebrow is a paragraph, not a heading.
- Product identity and states are real text in logical DOM order.
- Case File may be a labelled region/group but must not use `role="img"` to hide readable children.
- The decorative ground and light are ignored by assistive technology and never receive focus.
- Both CTAs are real links with the locked accessible names and visible `:focus-visible` treatment.
- Semantic colour is redundant with text (`TESTS REQUIRED`, `MEDIUM`, `PENDING`, `MISSING`, `OPEN · BLOCKING`).
- Minimum mobile product text: 13px labels/technical values, 15px record titles, 17px change title.
- Reduced motion presents the complete final composition immediately.
- Zoom to 200% must preserve reading order and avoid horizontal page scroll; the Case File may recompose like tablet/mobile rather than clip text.
- The hero remains truthful and understandable with CSS background layers disabled.

### Visual-performance acceptance checklist for R3E.2B

- [ ] First contentful paint shows final proposition copy, not an empty hero.
- [ ] Hero DOM exists before motion and remains complete with JavaScript disabled.
- [ ] Entrance settles by 800ms target and 900ms maximum.
- [ ] No `layout-shift` event is attributable to the hero after first paint.
- [ ] No product state moves when fonts finish loading.
- [ ] Scrolling during the entrance immediately wins; animation does not hold or snap the viewport.
- [ ] The Case File and ground animate only on compositor-friendly properties.
- [ ] No repeated paint from an animated gradient, filter, or JavaScript loop.
- [ ] Root/body scroll width equals viewport width at all five target sizes.
- [ ] Reduced-motion and no-motion states are visually complete.

## 23. R3E.2B acceptance criteria

R3E.2B is accepted only when all of the following are true:

1. The first viewport feels calm.
2. One live-DOM Case File clearly dominates.
3. The proposition is understood before detailed product records.
4. The Case File begins inside the first viewport at every target size.
5. The complete five-stage model is absent from the hero and remains later in Act III.
6. The hero remains warm-paper, graphite, and light-first.
7. The dark theatre remains the only major full-width dark section.
8. The Case File is intentionally incomplete at the fold and encourages scrolling.
9. The hero data is derived from the canonical sample and remains internally consistent.
10. Human Decision is visibly pending and visually separate from Lintel's recommendation.
11. No named-company adoption, endorsement, pilot, or evaluation is implied.
12. Decorative technical marks are materially reduced: no full rail, six nodes, section coordinate, plate number, or run caption.
13. Hero supporting copy is 18–22 words and no explanatory sample sentence sits beside the CTAs.
14. No page-level horizontal overflow exists at 1440×900, 1280×800, 1024×768, 768×900, or 390×844.
15. Tablet and mobile use intentional one-column compositions with readable product type.
16. The coordinated entrance completes within 900ms.
17. Reduced motion displays the complete composition immediately.
18. No layout shift, hero-height change after hydration, product jump, or late font reflow occurs.
19. TypeScript and the production build pass in R3E.2B (not run in this documentation milestone).
20. Logged-in routes, application tokens, theme behaviour, storage, and product surfaces remain unchanged.
21. The result feels authored: it has one dominant object, a chosen crop, meaningful omission, and no card cloud.
22. The result is recognisably Lintel and does not copy incident.io's wording, branding, interface, colour, type, geometry, assets, navigation, or animation.
23. CTA labels, routes, hover, active, visited, and focus-visible states meet this contract.
24. The sample-provenance mark remains visible at every target size.
25. `PR #482`, `E4`, and `C1` are the only hero record IDs; each has a visible referent.
26. F1, E1, branch, file count, run identity, duplicate pending prose, and the second sample mark are absent from the hero.
27. Engineering-ground intensity stays within 5–8% desktop, 4–6% tablet, and 3–4% mobile.
28. Directional light is static, warm-bronze-neutral, ≤4% perceived luminance change, and absent from logged-in surfaces.
29. The interactive theatre and Review Evolution behaviour are unchanged.
30. No new dependency or external/binary visual asset is introduced.

## 24. Genuine unresolved visual-taste decisions

No direction-level decision remains. Light versus dark, reference hierarchy, copy density, Case File hierarchy, live-DOM strategy, right bleed, mobile containment, ground intensity band, light direction, and motion timing are locked.

Only two optical judgments should be made after the first R3E.2B implementation is visible at all five target sizes:

1. **Final Case File vertical crop within a ±20px band.** Choose the exact y position inside the ranges in §§7–9 based on whether the C1 continuation feels invitational rather than accidentally cut. This may not expose the full Case File or remove the visible E4 state.
2. **Final ground opacity within the locked band.** Choose approximately 5.5%, 6.5%, or 7.5% on desktop after viewing the Case File on real displays. The test is whether the hero feels calmer with the ground than without it. The ground may not become a diagram.

These are implementation-tuning calls, not alternative concepts. They do not permit a contained desktop card, a dark hero, a different light direction, a full five-stage rail, a screenshot, or a different product object.

---

**R3E.2A lock:** Build one calm proposition over one opened Case File. Show identity, `TESTS REQUIRED`, `46/100 · MEDIUM`, `HUMAN DECISION · PENDING`, and one `E4` missing-proof → `C1` open-requirement relationship. Let the Case File continue below the fold. Everything else waits.

## R3E.2B.1 visual-acceptance amendment

R3E.2B.1 supersedes only the parts of §§7–9 that require upper-left editorial copy, a strongly right-offset Case File, and right-edge viewport bleed as the dominant reveal technique. The revised direction is: **“The case, opened on the table — centred beneath one calm proposition.”** Eyebrow, two-line headline, supporting statement, CTA pair, and the outer Case File share one optical centre; the Case File is centred within the product track and its first-viewport reveal crops primarily through the bottom.

All other R3E.2A rules remain binding: light-first Lintel identity; one dominant live, server-rendered Case File; canonical sample truth; concise copy; meaningful omission; one `E4` → `C1` relationship; restrained warm light and engineering ground; the approved motion and reduced-motion behavior; no screenshot, card cloud, generic dashboard, decorative technical clutter, or named-company adoption claim. Later sections retain their narrative roles and may remain asymmetric, but navigation, content sections, large product objects, and the dark theatre must use the shared page, content, editorial, and product alignment tracks established in R3E.2B.1.
