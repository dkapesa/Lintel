# R5E.1E.5A — Surface Hierarchy and Visual-Direction Contract

Date: 5 August 2026

Route governed: `/visual-lab/public-r5-reference-reconstruction`

Branch: `r5e1e5a-surface-hierarchy-visual-direction`

Documentation only. No asset was generated, no surface implemented, no
application code, CSS, route, interaction, choreography or canonical value
changed. Nothing was staged, committed, pushed or merged.

**Addendum recorded 5 August 2026 — see §32.** Amendment A1 is approved for
Phase 7.1 in the bounded form §32a states; Amendment A2 is not approved at
this stage and Candidate B is restricted to a private, non-shippable
diagnostic role (§32b). The comparison laboratory now requires four
configurations, not three (§32c). No earlier accepted lock document was
modified to record this addendum; formal reconciliation of
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` is deferred to R5E.1E.5F.

---

## 1. Purpose

Phase 7 (R5E.1E.4A–4D) is accepted and closed. The accepted public experience
is complete as *behaviour*: normal document flow, header-only sticky, a
continuous white editorial canvas, responsive product-scene plates, Hero
Overview/Finding/Readiness, Finding and Evidence inspection, Missing Proof and
Requirement choreography, the Readiness/Decision boundary, restrained one-shot
local motion, manual visitor intent authoritative, complete reduced-motion and
no-JavaScript states, and canonical PR #482 product truth.

What it does not yet have is **visual hierarchy between its scenes**. Every
product scene sits on the same `#fafaf9` plate with the same hairline and the
same radius. The page is credible and calm, and it makes no claim about which
moment matters.

This contract locks, for documentation only:

1. the visual role of presentation surfaces;
2. which scenes receive atmosphere and which remain neutral;
3. the relationship between Cursor-inspired staging and Lintel identity;
4. the candidate surface directions that enter the comparison laboratory;
5. the exact briefs those candidates must be generated against;
6. colour, tonal, material and texture boundaries;
7. responsive crop behaviour;
8. accessibility, contrast, interaction and motion compatibility;
9. performance, format and provenance requirements;
10. the private comparison-laboratory specification;
11. the human evaluation framework and rejection conditions;
12. the R5E.1E.5B–5F implementation and selection sequence;
13. early Phase 8 continuity requirements.

It does not create a comparison route, build supporting public routes, modify
the production homepage, add a dependency, or begin Phase 8.

## 2. Reference-evidence reuse

No recording was re-extracted. The evidence gate is
`R5E1E5A_SURFACE_DIRECTION_PACKAGE/REFERENCE_EVIDENCE_REUSE.md`
(untracked), which records **SURFACE REFERENCE GATE: PASSED**, the six evidence
paths reused, and the sixteen images inspected at full resolution.

The three findings that drive every decision below:

| # | Finding | Source frames |
|---|---|---|
| 1 | Cursor applies its painterly plate **selectively** — the Hero and one later section have it; the intervening feature section has a flat neutral plate with identical grammar. The selection *is* the hierarchy. | `cursor/key/k02` (2.0 s) and `k08` (37.5 s) vs `k06` (21.0 s); `cursor/sheets/cursor_full_timeline.jpg` |
| 2 | Because the product window is opaque and inset, the visible surface is a **margin around a frame**, never a picture. Composition must survive being seen only as a band. | `cursor/key/k02`, `skybase/key/k02` |
| 3 | Skybase supplies the failure mode: its Hero sky plate is pale and works; its later literal, saturated sky and sunset photography competes with the product and reads as a travel site. | `skybase/key/k02` vs `k07`, `k08` |

Cross-route: Cursor's `/product/agents`, changelog and documentation routes
reuse the identical plate and window grammar with almost no imagery — the
documentation route has none (`R5E1E4A_CURSOR_INTERACTION_ANALYSIS/dense/d07`,
`d08`). Continuity is the system, not the picture.

## 3. Accepted public baseline (unchanged by this contract)

| Element | Accepted value | Source |
|---|---|---|
| Canvas | `#ffffff`, continuous, no section reset | R5E.1A §2a; R5E.1E.2D |
| Plate (`.scenePlate`) | `background: #fafaf9`; `border: 1px solid #e1e1de`; `border-radius: 20px`; `padding: var(--scene-plate-inset)` | Implementation, l. 429–434 |
| Plate inset | 26 px ≥1280 · 20 px ≤1279 · 18 px ≤1024 · 12 px ≤767 | R5E.1E.2D §6; R5E.1E.3 |
| Product surface (`.sceneFrame`) | `background: #ffffff`; `border: 1px solid #dededc`; `border-radius: 14px`; `overflow: hidden` | Implementation, l. 442–447 |
| Band | `--pub-max: 1300px`; `--pub-gutter: 32/24/20px` | R5E.1E.2A §16; R5E.1E.2D §4 |
| Split | copy 360 px / gap 56 px; scene ≈65.8 % of band | R5E.1E.2D §5 |
| Section rhythm | `--section-pad: 88/56/40px` | R5E.1E.2A §16 |
| Breakpoints | 1279 / 1024 / 767 / 359 px | Implementation |
| Motion | one-shot, local, `opacity` + ≤8 px `translateY`; no meaningful text ever faded | R5E.1E.4A.2 |
| Contrast | primary 17.76:1, secondary 5.12:1, PENDING 5.33:1, focus-on-selected 4.65:1; CLS 0 | R5E.1E.4D §16–17 |

Everything in this table is input, not output. This contract changes none of it.

## 4. Visual-direction thesis

> **Lintel should capture Cursor's premium product-led atmosphere and
> compositional discipline without reproducing Cursor's paintings, assets,
> brand language or exact visual scenes.**

The page should feel more alive through hierarchy, product staging and material
atmosphere. It must not become visually busy.

The locked public rhythm:

```
White editorial canvas
  → distinctive Hero presentation
  → quieter evidence presentation
  → restrained consequence presentation
  → secondary Readiness presentation
  → white Trust and unresolved-case close
```

Surface treatment must:

1. make important product scenes feel deliberately staged;
2. separate the product interface from the public page;
3. add emotional and material tone;
4. strengthen Lintel's identity;
5. preserve complete interface readability;
6. remain subordinate to product truth;
7. create hierarchy **through selective use**;
8. remain static while product motion occurs above it;
9. support future route reuse without becoming mandatory anywhere.

Surface treatment must never exist merely to fill white space. A surface that
would be applied to a scene *because the scene looks empty* is refused on that
ground alone.

## 5. Cursor-vibe translation

### 5a. Retained

1. Product is visually dominant.
2. Scenes receive substantial presentation space.
3. Atmospheric or material staging surrounds the product.
4. The product interface stays legible and operationally credible.
5. Motion occurs inside a stable product frame.
6. White editorial space creates confidence.
7. Special visual treatment is selective.
8. Sections remain conventionally scrollable.
9. Visual identity stays consistent across routes.
10. Different routes use different content templates under one system.

### 5b. Rejected

1. Direct use of Cursor artwork.
2. Recreation of Cursor's compositions.
3. Cursor's logo or brand treatments.
4. Painterly imagery with no relationship to Lintel.
5. Image-led product scenes that weaken verification semantics.
6. Continuous automated scene rebuilding.
7. Marketing controls that appear operable but are not.
8. Route structures unsupported by real Lintel content.

### 5c. The locked phrase

> **Cursor informs the operating quality. Lintel supplies the identity and
> product meaning.**

## 6. Surface role — the three-layer presentation grammar

| Layer | Name | Role |
|---|---|---|
| 1 | Public editorial canvas | `#ffffff`. The document. Never treated. |
| 2 | Outer presentation surface | The plate. Where colour, material or atmosphere may live. Decorative. |
| 3 | Inset opaque Lintel product surface | `#ffffff`. Where all meaningful product content lives. Never treated. |

Locked:

1. The public canvas remains predominantly white.
2. Atmospheric or material treatment belongs **only** to layer 2.
3. Meaningful product text always remains on an opaque layer-3 surface.
4. Layer 2 may create depth; it may never become the reading surface.
5. No translucent glass product window.
6. No atmospheric image behind product copy.
7. No product-interface opacity introduced to reveal the surface.
8. No surface treatment may change canonical product styling.
9. The current neutral plate is the fallback for every scene.
10. The interface must remain complete when the decorative surface is absent.

### 6a. The annulus rule

Because layer 3 is opaque and inset inside layer 2, **the only part of a
surface a visitor ever sees is the band around the product frame.** This is
observable in both references (`cursor/key/k02`, `skybase/key/k02`) and it is
the single most consequential composition constraint in this contract.

Consequences, all binding:

1. A candidate is composed as a **margin**, not as a picture.
2. It must read continuously across the top band, both side bands and the
   bottom band, and across the four corners where they meet.
3. It may contain no feature that requires being seen whole.
4. The region geometrically behind the product frame is never visible, and is
   nevertheless constrained: it must stay quiet, so that no strong feature can
   be revealed by a crop shift or by a narrower frame at another tier.
5. Any candidate that only works when the whole field is visible fails.

### 6b. Surface categories

| Tier | Name | Treatment | Image asset | Applied to |
|---|---|---|---|---|
| **S0** | Editorial canvas | `#ffffff`, no plate | No | Trust, unresolved-case handoff, footer |
| **S1** | Neutral technical plate | Accepted `.scenePlate` tokens, unchanged | No | Finding and Evidence; Missing Proof and Requirement; **and the fallback for S2 and S3** |
| **S2** | Companion presentation surface | Reduced-energy member of the accepted Hero family | Yes, one | Readiness and Human Decision |
| **S3** | Primary presentation surface | Full-strength accepted surface | Yes, one (two art-directed sources) | Hero |

## 7. Definitive surface hierarchy

Resolved. Nothing here is left as a hypothesis.

| Section | Category | Visual strength | Image permitted | CSS-only permitted | Relationship to Hero | Fallback | Responsive | Rationale |
|---|---|---|---|---|---|---|---|---|
| **Hero** | **S3** | Strongest on the page | **Yes** — one candidate, two art-directed sources | Yes (it is the fallback) | Origin of the family | S1 neutral plate | Wide source ≥768 px; tall source ≤767 px; S1 below 360 px | The only scene a visitor is guaranteed to see, the only arrival moment, and the only scene whose plate can grow outward without disturbing an adjacent column |
| **Finding and Evidence** | **S1** | None | **No** | No — accepted tokens only | None | Is the fallback | Unchanged | Highest-density inspection scene on the page: two selectable evidence records, provenance, source paths, selected-state geometry. Every added tone is a competitor for attention that the scene cannot afford |
| **Missing Proof and Requirement** | **S1** | None | **No** | **No** — decided, see §9 | None | Is the fallback | Unchanged | Carries `--prod-blocking` red and `--prod-warning` amber as genuine status. Any tonal shift of its plate would be read as a status signal, which §11 forbids outright |
| **Readiness and Human Decision** | **S2** | Distinctly quieter than Hero | **Yes** — one companion asset | Yes | Same family, reduced energy | S1 neutral plate | One source, safe crop at every tier; S1 below 768 px | Closes the rhythm the Hero opens and gives consequence a register, without asserting an outcome |
| **Trust** | **S0** | None | No | No | None | n/a | n/a | A boundary statement about what is deterministic and what is not. Atmosphere on a statement about honesty is a contradiction |
| **Unresolved-case handoff** | **S0** | None | No | No | None | n/a | n/a | Ends on a structured canonical record. The return to plain white is what makes the record final |
| **Footer** | **S0** | None | No | No | None | n/a | n/a | The page closes quietly |

Two scenes staged, two scenes neutral, three sections editorial. Strong imagery
is deliberately **not** applied to every product scene.

### 7a. Hierarchy dependency

If **Candidate A (neutral)** wins the Hero, there is no accepted surface family
to derive from, and Readiness is neutral by definition. Readiness never
receives a surface the Hero does not have. This is a consequence of the
hierarchy, not an open question.

## 8. Candidate A — accepted neutral technical plate (the control)

Grammar preserved exactly: white canvas → restrained neutral plate → inset
white product surface.

**Strengths.** Zero bytes, zero requests, zero decode, CLS structurally
impossible. Zero contrast risk: the plate carries no text and sits at ≈1.03:1
against the canvas. Zero crop risk at any of the twelve required viewports and
at 200 % reflow. Zero forced-colours risk. Zero provenance, licensing or
originality exposure. Already accepted by a human on 3 August 2026 and
re-validated on 5 August 2026. It is the fallback for every other candidate, so
it must be correct regardless of the outcome.

**Weaknesses.** No hierarchy — all four scenes are identical, so the Hero makes
no claim. No arrival moment. No material or emotional register. The 26 px inset
makes the plate read as a border rather than a presentation field; both
references give the surface 3–5× that band. `#fafaf9` on `#ffffff` is a step so
small that at normal viewing distance the plate is nearly invisible.

**Identity limitation.** It passes the originality tests by having no
distinctive visual identity to test. Removing the wordmark leaves a page that
is recognisably Lintel *because of its product content*, which is genuine, but
the surface contributes nothing.

**Readability benefit.** Total. It is the reference case every other candidate
is measured against.

**Performance benefit.** Total.

**Suitability by scene.** Correct and locked for Finding and Evidence and for
Missing Proof and Requirement. Under-powered for the Hero. Neutral for
Readiness.

**Why it must remain in the comparison.** Without a full-scale control at
identical dimensions, "does the surface improve the scene?" cannot be answered
— only "do I like this image?" can.

**What would justify retaining it as the final answer.** Any of: no candidate
clears the acceptance threshold in §22; a candidate wins on impression but
fails an invariant; the winning candidate cannot be produced within the
performance budget; or the reviewer judges that the staged Hero makes the
evidence scenes look unfinished rather than deliberately quiet.

Candidate A is not a placeholder. It is the current accepted answer and it wins
by default.

## 9. Missing Proof — CSS-only structural treatment refused

Decided: **Missing Proof and Requirement remains fully neutral (S1). It does
not receive a CSS-only structural treatment.**

Reasons:

1. It is the only scene on the page whose plate would sit beside genuine
   `--prod-blocking` `#b42318` and `--prod-warning` `#94600a` content. §11 locks
   "surface colour is atmosphere, not product status". A deliberate tonal step
   on *this* plate and no other would be read as the page agreeing that
   something is wrong — surface asserting status.
2. Its accepted job is one relationship, one blocking consequence, clarity and
   restraint. A structural treatment adds a fourth thing to look at.
3. Its scene is the shortest and its plate band the thinnest of the four; a
   ≤1.5 % luminance step at 26 px would either be invisible or, if made
   visible, would be a coloured border.
4. Keeping it identical to Finding and Evidence makes the pair legible as "the
   quiet technical middle of the page", which is what gives the Hero and
   Readiness their contrast.

Consequence: no third CSS-only tier exists. The system has exactly four
categories, S0–S3.

## 10. Candidate B — Atmospheric Horizon

### 10a. Concept

Uncertainty → evidence → clarity. The register is *early*: before the weather
is known, before the decision is made. Diffuse light, no event.

### 10b. Locked specification

| Property | Value |
|---|---|
| Tonal range | Mean field L\* 90–95. Local excursions L\* 86–97. Absolute floor L\* 84, absolute ceiling L\* 97 |
| Permitted hue families | Cool neutral slate, LCh hue 205–235° only |
| Prohibited hue families | Everything else. Specifically: violet/magenta 260–330°; cyan/teal 165–205°; orange/red 15–55°; green 100–160°; any yellow above C\* 2 |
| Maximum chroma | C\* ≤ 4 (LCh, D65) at every pixel. Mean C\* ≤ 2 |
| Contrast boundaries | Plate vs `#ffffff` canvas: ≥1.05:1 and ≤1.55:1. Internal field range within any single visible band: ΔL\* ≤ 6 |
| Composition | Horizontal tonal banding only. No discrete object, no line, no edge sharper than a 120 px feather at source scale |
| Focal region | None. The lightest zone sits in the upper-middle third and dissipates outward; there is nothing to look at |
| Edge behaviour | Every source edge resolves to a flat, featureless tone so any crop terminates cleanly. No vignette, no framing device |
| Desktop crop | Centre-weighted, `background-position: center 40%`, `background-size: cover` |
| Tablet crop | Same source, `center 45%` |
| Mobile crop | Dedicated tall source, `center center` |
| Relationship to the white interface | The plate is materially present against `#ffffff` and the white product frame reads as lifted out of it. The frame's `#dededc` hairline stays visible against every part of the field |
| Emotional quality | Quiet, cool, provisional, unresolved. Calm rather than serene; nothing is being celebrated |
| Rejection conditions | Reads as sky, cloud, weather, sunrise or sunset. Reads as blue. Any recognisable location. Any visible horizon *line* rather than a tonal change. Any feature identifiable in a 26 px band. Chroma above C\* 4 anywhere. Any resemblance to Skybase's plates |

### 10c. Standing conflict with the accepted image lock

Candidate B, as briefed, sits on the wrong side of a prohibition the accepted
documentation states three times:

- `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §5 prohibited 6,
  "Atmospheric sky imagery";
- the same document §6b never-copy 3 and 4, "Sky imagery" and "Atmospheric blue
  environments";
- the same document §8 acceptance 1, "no … sky field";
- and it is re-affirmed in `R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md` §7.

A "quiet horizon" is a horizon reading. Narrowing the specification to
near-achromatic slate reduces the collision but does not remove it.

This contract does not amend an accepted document. **Amendment A2 has since
been considered and is not approved at this stage** (§32b): the existing
prohibition remains authoritative for any accepted or production-facing public
direction. Candidate B may still be generated and compared — comparison is not
adoption — but only as a private, non-shippable diagnostic candidate inside
the Phase 7.1 laboratory. It may not be propagated to the accepted
reconstruction, may not become the final direction, and may not enter
production. If it later wins the evaluation framework at R5E.1E.5D, a
**separate, explicit** approval of Amendment A2 is required before any
propagation step is even considered.

## 11. Candidate C — Structural Light

### 11a. Concept

Evidence → support → readiness. Something is carrying load, calmly, and the
light shows you it is there.

A lintel carries load across an opening. Lintel the product connects evidence
and requirements strongly enough for an engineer to judge whether a change is
ready. The reading permitted here is **span, threshold and transmitted light** —
folded into this candidate deliberately, because it is the strongest reading
available inside a structural direction and does not deserve to be a separate
candidate competing with it (§12).

This must remain a *quality*, not an illustration. No literal building. No
literal lintel. No arch, no masonry course, no window frame, no blueprint.

### 11b. Locked specification

| Property | Value |
|---|---|
| Tonal range | Mean field L\* 91–96. Local excursions L\* 88–97. Absolute floor L\* 86, absolute ceiling L\* 97 |
| Permitted hue families | Warm neutral, LCh hue 60–95° only — the family `#fafaf9` already belongs to |
| Prohibited hue families | Everything else, as §10b, plus any cool cast below hue 55° or above 100° |
| Maximum chroma | C\* ≤ 5 at every pixel. Mean C\* ≤ 3 |
| Contrast boundaries | Plate vs `#ffffff`: ≥1.04:1 and ≤1.45:1. Plane-to-plane step: ΔL\* 2–6, never more |
| Composition | Two or three broad pale planes meeting at soft, imperfect boundaries. One implied horizontal span across the upper third, expressed as a change of tone and a change of light direction, never as a drawn edge. Diffuse daylight enters upper-left and falls away to lower-right |
| Material | Fine plaster, limestone or matte technical paper. Grain present in the master, resolving to ≤1.5 % local luminance variation at production scale |
| Focal region | None. The implied span is a *structure*, not a subject; it must not be identifiable as an object |
| Edge behaviour | Planes run off every edge. No plane terminates inside the frame. No vignette |
| Desktop crop | `background-position: center 35%`, `background-size: cover` — keeps the implied span in the top band, where the band is widest |
| Tablet crop | Same source, `center 38%` |
| Mobile crop | Dedicated tall source with the span reproportioned to the top ~22 %, `center top` |
| Relationship to the white interface | Warm-neutral, so the product frame's `#ffffff` reads as cleaner and more precise than the surface holding it — the intended relationship between a record and the material it rests on |
| Emotional quality | Load-bearing calm. Daylight in a quiet building. Sober, not soft |
| Rejection conditions | Any recognisable building, room, wall or window. Visible bricks, blocks, courses, joints or an arch. Blueprint or drafting language. Reads as concrete brutalism or as a texture pack. Grain visible as noise at production scale. Reads as paper stock or letterhead. Any plane edge sharp enough to be mistaken for interface chrome |

### 11c. Lock position

Candidate C requires only the general amendment permitting bespoke presentation
surfaces (§25 Amendment A1), **which is approved for Phase 7.1 in the bounded
form §32a states.** It collides with no specific prohibition in the accepted
image lock: it is not sky, not an atmospheric blue environment, not stock, not
a photograph, not a person, not a decorative code or AI motif. **Candidate C is
fully eligible for adoption** — no further amendment or approval is required
for it.

## 12. Candidate D — decided: rejected

**Candidate D does not proceed to the comparison laboratory.**

The comparison laboratory runs **three** candidates: A (neutral control), B
(Atmospheric Horizon), C (Structural Light). The maximum is four; four is not a
target.

Reasons:

1. Every hybrid that can be specified precisely is either B with a plane added
   or C with depth added. Neither makes an identity claim B or C does not
   already make, and a candidate that cannot state an identity claim of its own
   cannot be evaluated against criterion 2 of §22.
2. The strongest genuinely Lintel-specific idea available to a hybrid — the
   span, the threshold, the light passing under it — is not a fourth direction.
   It is the best reading *inside* the structural direction, and it has been
   folded into Candidate C (§11a). Extracting it would weaken C to create a
   near-neighbour of C.
3. Two adjacent architectural readings in the same lab split judgement between
   themselves and make the human evaluation less decisive, not more. The lab
   exists to produce a clear answer.
4. A fourth candidate is a fourth asset family, a fourth crop matrix and a
   fourth contrast pass, for an outcome already covered.

If R5E.1E.5D finds that B and C each solve half the problem, a hybrid may be
commissioned then, as a bounded second round with a stated identity claim — not
speculatively now.

## 13. Hero surface contract

### 13a. Requirements

The Hero surface must:

1. create the strongest public visual moment;
2. preserve the accepted Hero composition;
3. preserve Hero interaction (Overview / Finding / Readiness);
4. preserve H1–H3 choreography exactly;
5. preserve scene dimensions — `.sceneFrame` width, height and position
   byte-identical at every tier;
6. preserve the opaque white product interface;
7. maintain product contrast — no meaningful text moves off `#ffffff`;
8. work before product motion begins, and in the settled state;
9. remain visually stable throughout interaction;
10. crop safely at all twelve required viewports and at 200 % reflow;
11. keep a quiet region behind the product frame (§6a.4);
12. never compete with the H1 or the two hero actions, which sit on the white
    canvas *above* the plate and are unaffected;
13. avoid recognisable landscape storytelling;
14. fall back cleanly to the S1 neutral plate.

### 13b. Locked characteristics

| Property | Value |
|---|---|
| Target emotional tone | Deliberate, calm arrival. A record placed on a considered surface |
| Visual energy | Low. Mean local contrast across the visible band ΔL\* ≤ 6; no feature crossing a band boundary |
| Luminance distribution | Lightest zone in the upper third; monotonic falloff outward; no bright spot within 120 px of the product frame edge |
| Focal placement | None. The product frame is the focus |
| Desktop crop | `cover`, `center 35–40 %` per candidate |
| Tablet crop | `cover`, `center 38–45 %` per candidate |
| Mobile crop | Dedicated tall source, `cover`, top-anchored |
| Spans the complete plate | Yes — the surface fills the whole plate box; the product frame then occludes its centre |
| Assets required | **Two art-directed sources** (wide and tall). Justified in §19b — the mobile Hero plate aspect is ≈0.19:1 against ≈2.0:1 at desktop, a 10× aspect change that no single source survives |
| Fails when | Any feature is identifiable within the visible band; the band reads as a coloured border rather than a surface; the surface draws the eye before the product frame does; the `#dededc` frame hairline stops being visible against any part of the field; the corners read differently from the edges; the tall and wide sources do not read as the same surface |

### 13c. Required geometry change — the presentation band

**Finding.** The accepted plate inset is 26 px at desktop and 12 px at mobile.
The visible surface is therefore a 26 px border. Cursor gives its Hero surface
≈103 CSS px of inset; Skybase ≈75 px. At 26 px, no surface candidate can be
evaluated fairly, because there is nowhere for it to exist.

**Locked resolution.** The Hero plate extends **outward**, beyond the 1300 px
content band. `.sceneFrame` is not moved, not resized, and not restyled.

| Tier | Hero presentation band width | Visible surface band (top / sides / bottom) | Source |
|---|---|---|---|
| ≥1440 px | `min(100vw − 64px, 1412px)` | 88 / 56 / 64 px | wide |
| 1280–1439 px | `100vw − 64px` | 80 / 48 / 56 px | wide |
| 1025–1279 px | `100vw − 48px` | 72 / 40 / 48 px | wide |
| 768–1024 px | `100vw − 48px` | 64 / 32 / 40 px | wide |
| 360–767 px | `100vw − 40px` | 56 / 20 / 40 px | tall |
| < 360 px | — | — | **S1 neutral, no asset** |

Binding constraints on this change:

1. `.sceneFrame`'s computed box is byte-identical to the accepted
   implementation at every tier — verified by direct measurement, not inferred.
2. Section height may change only by the amount the band adds above and below,
   and that amount is fixed and stated; it is not content-dependent, so CLS
   stays 0.
3. No new horizontal overflow at any tier: the band is clamped by the viewport.
4. The band is top-weighted so the surface has a genuine field above the
   product frame rather than an even outline.
5. Under S1 fallback, the band reverts to the accepted 26/20/18/12 px insets —
   the fallback is the accepted geometry, unchanged.

This is a requirement **on R5E.1E.5C**, to be implemented by Codex. It is not
implemented here. **The exact pixel values in the table above are laboratory
starting values, not production-frozen values** (§32d); R5E.1E.5C may adjust
them within these constraints, and R5E.1E.5F freezes whatever geometry is
finally adopted.

## 14. Readiness surface contract

**Decided: option 2 as stated precisely — Readiness receives one dedicated
companion asset drawn from the accepted Hero surface family, at reduced
energy.** Not a re-crop of the identical Hero file (a re-crop inherits the
Hero's focal geometry at a different aspect and reads as a repeat), and not
CSS-only (a token-level variant cannot express family membership).

Conditional in the sense established in §7a — if Candidate A wins the Hero,
there is no family, and Readiness is neutral — **and additionally conditional
on a materiality test, restated precisely in §32e: Readiness receives a
companion only when the selected Hero family wins *and* the companion,
evaluated on its own, materially improves consequence and authority without
competing with PENDING or the seven outcome chips.** "Wins the Hero" is
necessary but not sufficient.

### 14a. Requirements

The Readiness treatment must:

1. remain clearly less visually dominant than the Hero;
2. support consequence and authority;
3. preserve PENDING and outcome readability — the `#fff7e3` PENDING block and
   the seven outcome chips sit on the white product surface and are untouched;
4. avoid making the section feel alarming or celebratory;
5. remain compatible with R1–R4 choreography;
6. avoid implying a completed decision;
7. retain the S1 neutral fallback.

### 14b. Exact relationship to the Hero

| Dimension | Hero (S3) | Readiness (S2) |
|---|---|---|
| Family | Origin | Same generative family and palette |
| Mean luminance | L\* 90–96 | **+2 L\*** relative to the Hero, i.e. lighter and flatter |
| Internal contrast | ΔL\* ≤ 6 | **ΔL\* ≤ 3** |
| Mean chroma | ≤ C\* 3 | **≤ C\* 2** |
| Structure | Implied span / banding present | Present but attenuated to roughly half the Hero's amplitude |
| Presentation band | 88 / 56 / 64 px at ≥1440 px | **48 / 32 / 40 px** at ≥1440 px, stepping down proportionally; S1 below 768 px |
| Sources | Two (wide, tall) | **One** (wide only) |
| Loading | `fetchpriority="high"` | `loading="lazy"`, `fetchpriority="low"` — never first-load priority |
| Recognisability | The visitor should recognise Readiness as the same world as the Hero, and should not be able to say why without looking twice |

Below 768 px Readiness falls back to S1. Justification: the mobile Readiness
scene is ~1,278 px tall at 390 px wide; a 20 px band around it is a border, and
a second tall asset for a deliberately secondary surface is not justified by
§21's budget.

## 15. Neutral scene rules

### 15a. Finding and Evidence — S1, locked

Priorities preserved without competition: provenance; source; selected-state
clarity; engineering credibility; interaction readability.

1. No image asset. No tonal variant. No material treatment.
2. The accepted `.scenePlate` tokens are used unchanged.
3. Rationale: this is the highest-density inspection scene on the page — two
   selectable evidence records, a leading rail, two provenance blocks, two
   source paths, and the forced-colours `Highlight` treatment from Phase 7D.
   Selected state must be the most salient thing in the section. A surface is a
   competitor for exactly that salience.
4. No evidence-heavy scene may become harder to inspect because of atmosphere.
   This rule is invariant and is not tradeable against visual impression.

### 15b. Missing Proof and Requirement — S1, locked

Priorities preserved: one relationship; blocking consequence; clarity;
restraint. CSS-only structural treatment refused, with reasons, in §9.

### 15c. The pair

Finding and Evidence and Missing Proof and Requirement are visually identical
at the plate level, deliberately. That identity is what makes them read as the
page's quiet technical middle, and it is what gives the Hero and Readiness
their contrast. Treating one and not the other would destroy both readings.

## 16. Trust, unresolved-case handoff and footer

Locked as editorial (S0). The evidence supports this and nothing contradicts
it: Cursor's own closeout is quiet and imageless, and Skybase's is a hairline
rule and a five-column footer.

| Question | Locked answer |
|---|---|
| White-canvas behaviour | Pure `#ffffff`, continuous, no plate, no band, no tint |
| Divider treatment | Existing hairlines only — `--pub-border-subtle` `#ececea` above Trust's four records, `--pub-border` `#e1e1de` on the handoff record grid |
| Structured-record treatment | The handoff's five-cell record keeps the hero's `.fact` / `.factValue` / `.microLabel` primitives and its `#e1e1de` borders, on white |
| Spacing relationship to atmospheric scenes | The accepted 88 px section padding is unchanged. The first fully white section after Readiness is the reset; it needs no extra space, because the removal of the surface *is* the transition |
| How the return to white resets attention | After two staged scenes the eye has adapted to a material field. Removing it makes the Trust statement read as spoken plainly, which is the content of that statement |
| How the footer closes | Unchanged: hairline, wordmark, tagline, three links, copyright, private-laboratory note |
| Any subtle material colour permitted | **No.** Not on Trust, not on the handoff, not on the footer |
| Why image surfaces are inappropriate | Trust states what is deterministic, what is model-assisted, and what this sample does not do. Staging a statement about honesty undermines it. The handoff's job is to end on a canonical record that is plainly true. The footer's job is to stop |

## 17. Colour and tonal system

Binding on every candidate.

| Property | Boundary |
|---|---|
| Luminance range | Mean field L\* 90–96. Absolute floor L\* 84 (≈ `#d0d0cd`), absolute ceiling L\* 97 (≈ `#f6f6f4`) |
| Contrast against `#ffffff` | ≥1.04:1 (visible as a plate) and ≤1.60:1 (never a dark band) |
| Maximum saturation | C\* ≤ 5 (LCh, D65) at every pixel; mean C\* ≤ 3. Approximately ≤4 % HSL saturation |
| Dominant neutral families | Warm neutral hue 60–95° (the `#fafaf9` family) — default, and mandatory for Candidate C |
| Permitted restrained hue family | Cool neutral slate hue 205–235° at C\* ≤ 4 — Candidate B only |
| Prohibited: violet AI cliché | Hue 260–330° at any chroma. Also reserved: `--status-model` `#7040c7` means model provenance and nothing else |
| Prohibited: bright cyan SaaS cliché | Hue 165–205° above C\* 2 |
| Prohibited: dramatic sunset orange | Hue 15–55° above C\* 2. Also collides with `--status-warning` `#94600a` |
| Prohibited: green | Hue 100–160° above C\* 2. Green must not appear anywhere in the canonical story (R5E.1A §3.2) — the case never resolves |
| Prohibited: red | Any perceptible red cast. Collides with `--status-blocking` `#b42318` |
| Prohibited: dark cinematic contrast | Any field below L\* 84; any internal range exceeding ΔL\* 8 |
| Relationship to semantic colour | None. No candidate may introduce a hue within ΔE 25 of `#2563eb`, `#94600a`, `#b42318`, `#2f855a` or `#7040c7` |

Locked: **no new semantic colour system is created. Surface colour is
atmosphere, not product status.** A surface that could be read as agreeing or
disagreeing with a product state has failed, regardless of how it looks.

The surface must remain calm beside red, amber, blue and green product
semantics. Operationally this is satisfied by the chroma ceiling: at C\* ≤ 5 the
plate cannot compete with a `#b42318` label at any size.

## 18. Material and texture boundary

Locked:

1. Texture remains subtle at normal viewing size — ≤1.5 % local luminance
   variation at production scale, measured over a 4 px radius.
2. No visible repeated tile. Sources are single non-tiling images.
3. No grunge, no distress, no wear, no scratches.
4. No film grain strong enough to affect compression — grain that raises the
   AVIF payload above the §21 budget is by definition too strong.
5. No high-frequency pattern anywhere, and specifically none within 120 px of
   the product frame edge.
6. No literal blueprint, drafting grid, dimension line or annotation.
7. No code texture, terminal glyphs or character grid.
8. No AI-network imagery, node graph, particle field or constellation.
9. No glowing nodes, bloom, lens flare or light leak.
10. No glass, frosted panel, refraction or specular highlight.
11. No heavy shadow. No drop shadow of any kind is introduced by the surface;
    the accepted design uses borders, not shadows.
12. No visible stock-photo subject of any kind.
13. No asset that becomes the primary content of its section.

### 18a. Texture survival

The binding test is whether the material still reads *as material* in the
narrowest band it will ever occupy.

| Tier | Narrowest visible band | Required |
|---|---|---|
| ≥1440 px | 56 px (sides) | Material reading present; plane/banding structure legible in the 88 px top band |
| 1025–1279 px | 40 px | Material reading present; structure may be implied rather than legible |
| 768–1024 px | 32 px | Material reading present; structure not required |
| 360–767 px | 20 px (sides) | **Tone only.** Structure must not be legible in a 20 px band; the 56 px top band carries the reading |
| < 360 px | — | S1 neutral |

A candidate whose grain resolves into visible noise at 20 px, or whose
structure reads as a stripe at 20 px, fails. A candidate that becomes a flat
tone at 20 px is acceptable — flat tone is the correct degradation.

## 19. Accessibility and contrast

The Phase 7 contrast amendment (`R5E1E4A2_MOTION_CHOREOGRAPHY_CONTRACT.md` §26a)
is preserved in full and extended here.

1. Meaningful product text remains on opaque surfaces. Every string on the page
   sits on `#ffffff` today, and no candidate may change that.
2. No text-bearing parent opacity, at rest or during choreography.
3. No translucent product panel, at any opacity, for any reason.
4. The outer plate may not reduce product contrast. Because layer 3 is opaque,
   a surface change cannot alter a single measured ratio — this is a structural
   guarantee, not a promise, and R5E.1E.5C must re-measure and prove it.
5. Normal meaningful text remains ≥4.5:1. Current: primary 17.76:1, secondary
   5.12:1, metadata 5.58:1, PENDING 5.33:1, outcomes 5.58:1.
6. Qualifying large text remains ≥3:1.
7. Focus and selected states remain visible. The `#2563eb` focus ring on the
   `#f3f3f1` selected surface is 4.65:1 and must be re-measured over every
   candidate — focus rings on scene controls sit inside the product frame, so
   the expected delta is zero, and zero must be demonstrated.
8. Forced-colours behaviour is unaffected. Under `forced-colors: active` the
   surface must not paint at all: background images are dropped, the plate
   resolves to the system `Canvas` colour, and the Phase 7D `Highlight`
   treatment for selected borders and the evidence rail is untouched.
9. The surface is decorative and absent from the accessibility tree. This is
   guaranteed by implementation: it is a CSS `background-image` on the plate,
   not an `<img>`, so it has no node, no role and no alternative text.
10. No meaning depends on the surface. Removing every asset must leave the page
    exactly as truthful.
11. The neutral fallback retains the complete experience — it is the accepted
    page.
12. A surface candidate is changed or rejected when contrast cannot be
    preserved. This is not a variable a candidate may trade against impression.

### 19a. Additional non-text obligation

The product frame's `#dededc` hairline is the boundary between layer 2 and
layer 3. Against the plate it must remain visible at every point of the band:
minimum 1.15:1 against the adjacent surface tone. Against `#fafaf9` it is
currently ≈1.09:1 — a candidate that is *darker* than `#fafaf9` improves this,
and a candidate that is lighter in any zone must be rejected on this test.

## 20. Interaction and motion compatibility

Locked, extending `R5E1E4A2_MOTION_CHOREOGRAPHY_CONTRACT.md` §26:

1. Motion belongs to the product interface, not the surface.
2. Surfaces remain static — always, in every state.
3. No surface parallax.
4. No background video.
5. No animated gradient.
6. No surface crossfade during interaction.
7. No image motion on scene activation.
8. H1–H3, E1–E4, M1–M4 and R1–R4 remain unchanged — same steps, same
   durations (90/140/260/300/380/420 ms), same reading pauses
   (760/980/1220 ms), same easings, same 8 px / 4 px distances, same totals.
9. Manual interaction remains unchanged, including manual-authority
   interruption and the `data-motion="settled"` mechanism.
10. Surface loading cannot delay control availability. Controls are
    server-rendered inside the product frame and do not wait on a background
    image.
11. Surface loading cannot cause layout shift. The plate box is laid out by CSS
    before any decode; `background-color` is painted first; CLS must remain 0.
12. Every sequence remains legible over every approved surface. Since all
    choreographed regions live inside the opaque frame, this is structural —
    and must still be demonstrated per candidate.
13. Reduced motion does not need a different surface. The surface is static, so
    `prefers-reduced-motion` has nothing to reduce; the same asset is used.
14. No-JavaScript retains the same static surface, or the S1 neutral fallback.
    The surface is pure CSS, so it renders identically with scripts disabled.

### 20a. Consequence for the interaction system

No interaction contract, state, primitive, keyboard behaviour, touch behaviour,
tab semantic or accessibility-tree structure is opened by this contract. The
17-stop desktop / 14-stop mobile keyboard order is unchanged. If a candidate
would require any of these to change, the candidate is rejected — not the
contract.

## 21. Responsive crop contract

### 21a. Behaviour at every required viewport

| Viewport | Hero band | Hero source | Hero position | Readiness | Notes |
|---|---|---|---|---|---|
| 1920 × 1080 | 1412 px | wide | `center 35–40 %` | S2 wide | Widest band; most surface visible |
| 1600 × 1000 | 1412 px | wide | `center 35–40 %` | S2 wide | |
| 1440 × 900 | 1376 px | wide | `center 35–40 %` | S2 wide | |
| 1280 × 800 | 1216 px | wide | `center 35–40 %` | S2 wide | Hero band ≈2.0:1 |
| 1024 × 768 | 976 px | wide | `center 38–45 %` | S2 wide | Split already collapsed at this tier (R5E.1E.3) |
| 834 × 1112 | 786 px | wide | `center 38–45 %` | S2 wide | |
| 768 × 1024 | 720 px | wide | `center 38–45 %` | S2 wide | Last tier with S2 |
| 430 × 932 | 390 px | **tall** | `center top` | **S1** | |
| 390 × 844 | 350 px | tall | `center top` | S1 | Hero plate ≈0.19:1 |
| 375 × 812 | 335 px | tall | `center top` | S1 | |
| 320 × 568 | 280 px | tall | `center top` | S1 | |
| 200 % reflow (640 × 400 CSS) | 592 px | wide | `center 38–45 %` | S1 | Treated as the 768–1024 rule with the mobile fallback for Readiness |

### 21b. Locked crop rules

| Rule | Value |
|---|---|
| Focal-safe region | There is no focal point. The **structure-safe region** is the top band: whatever structure a candidate has must sit in the top 30 % of the wide source and the top 22 % of the tall source, and must be intact at every listed position value |
| Crop strategy | `background-size: cover` throughout. No `contain`, no fixed `background-size`, no `background-attachment: fixed` |
| `background-position` | Per §21a. One value per breakpoint tier, declared in CSS; never computed at runtime |
| Art-directed sources required | **Yes — two for the Hero, one for Readiness.** Justification in §21c |
| Minimum visual information retained | At every tier the visible band must carry (a) the candidate's tone, and (b) at ≥768 px, its material reading. Structure is required only at ≥1025 px |
| No crop-dependent meaning | Nothing in any crop carries information. Removing the surface removes nothing |
| No subject clipping | There is no subject to clip |
| No high-frequency crop on mobile | The tall source is authored at lower spatial frequency than the wide source, not merely resized |
| No empty visual imbalance | Sources resolve to flat featureless tone at all four edges, so no crop can produce a heavy corner |
| No new horizontal overflow | The band is clamped by the viewport at every tier; verified by direct measurement at all twelve viewports |
| No scene-height change | `.sceneFrame` height is byte-identical at every tier; the only height delta is the fixed band addition in §13c |
| Neutral fallback | Below 360 px; for Readiness below 768 px; under `forced-colors: active`; on decode failure; and whenever a tier cannot satisfy §18a |

### 21c. Why two Hero sources are required

The brief warns against a unique image per viewport without strong
justification. Two sources is not per-viewport, and the justification is
measured:

- Hero plate at 1280 × 800: ≈1216 × ≈620 px → aspect ≈ **1.96 : 1**.
- Hero plate at 390 × 844: ≈350 × ≈1799 px → aspect ≈ **0.19 : 1**
  (`R5E1E4D_FINAL_INTERACTION_REVIEW.md` §5 records the 390 px Hero scene at
  1,799.30 px tall).

That is a **10× change in aspect ratio.** `cover` on a 2:1 source inside a
0.19:1 box magnifies the source ≈5× and shows roughly 4 % of its width — every
frequency in the material is magnified past the §18 texture ceiling and the
composition is destroyed. This is not a preference; a single source physically
cannot serve both.

Readiness needs one source because it is S1 below 768 px, so it never meets a
portrait box.

## 22. Human evaluation framework

### 22a. Scale

Each criterion is scored **0–4**: 0 fails; 1 poor; 2 acceptable; 3 good;
4 excellent. Scored independently by the human reviewer and by Claude, at
1440 × 900 and 390 × 844, against the accepted route open in an adjacent window.

### 22b. Criteria

| # | Criterion | Weight |
|---|---|---|
| 1 | Immediate premium impression | ×1 |
| 2 | Lintel-specific identity | **×2** |
| 3 | Product readability | **×2** — invariant |
| 4 | Hierarchy created across the page | **×2** — invariant |
| 5 | Relationship with the white page | ×1 |
| 6 | Originality | ×1 |
| 7 | Cursor-vibe alignment without imitation | ×1 |
| 8 | Engineering credibility | ×1 |
| 9 | Interaction visibility (selected, focus, hover) | ×1 — invariant |
| 10 | Motion compatibility | ×1 — invariant |
| 11 | Responsive crop quality | ×1 |
| 12 | Contrast | ×1 — invariant |
| 13 | Performance | ×1 |
| 14 | Emotional tone | ×1 |
| 15 | Future-route reuse | ×1 |
| 16 | Improves the scene rather than decorating it | **×2** |

Maximum weighted total: **84**.

### 22c. Automatic rejection

Any condition in §23 ends that candidate's evaluation. A rejected candidate is
not scored and cannot be revived by a high score elsewhere.

### 22d. Minimum acceptance threshold

A candidate may be adopted only if **all four** hold:

1. no automatic rejection condition is met;
2. it scores **≥3** on every criterion marked *invariant* (3, 4, 9, 10, 12);
3. it scores **≥2** on every other criterion;
4. its weighted total exceeds Candidate A's weighted total by **≥15 %**.

### 22e. Tie-break

In order: (1) product readability; (2) Lintel-specific identity; (3) responsive
crop quality; (4) performance; (5) Candidate A wins.

### 22f. When neutral remains strongest

**Candidate A wins by default.** If no alternative clears §22d, the accepted
neutral plate is confirmed as the final answer, the accepted geometry is
retained, R5E.1E.5E propagates a *neutral* hierarchy, and R5E.1E.5F freezes it.
That is a successful outcome of this programme, not a failure, and no
consolation adoption is permitted.

## 23. Automatic rejection conditions

A candidate fails automatically when it:

1. resembles Cursor artwork too closely;
2. resembles Skybase sky imagery too closely;
3. reads as generic AI marketing;
4. competes with the interface;
5. weakens text contrast;
6. requires translucent product panels;
7. requires product-style changes;
8. introduces an obvious stock-photo subject;
9. becomes visually noisy on mobile;
10. creates crop-dependent meaning;
11. causes layout shift;
12. adds excessive asset weight (breaches §24);
13. requires animation;
14. implies product status through surface colour;
15. makes evidence inspection harder;
16. fails to work with the neutral fallback;
17. cannot be reused coherently on a future route;
18. feels decorative rather than product-led.

Plus, from this contract: 19. breaches a §17 colour boundary; 20. breaches the
§18a texture-survival test; 21. requires a change to any accepted interaction,
choreography, keyboard, touch or accessibility contract.

## 24. Performance and format boundary

Provisional production budget, binding on R5E.1E.5B and R5E.1E.5C.

| # | Decision | Value |
|---|---|---|
| 1 | Preferred production formats | **AVIF** primary, **WebP** fallback, via CSS `image-set()`. No JPEG, no PNG in production, no SVG |
| 2 | Source / master format | 16-bit PNG or TIFF, sRGB, no embedded metadata beyond the provenance record |
| 3 | Desktop target dimensions | Hero wide master **3000 × 1600**; Readiness master **3000 × 1200** |
| 4 | Responsive source strategy | Hero: wide + tall (**1400 × 2600**), selected by media query on the plate rule. Readiness: wide only |
| 5 | Max compressed Hero | **90 KB** AVIF wide, **60 KB** AVIF tall (WebP fallbacks ≤140 KB / ≤95 KB) |
| 6 | Max compressed Readiness | **55 KB** AVIF (WebP ≤85 KB) |
| 7 | Total page surface budget | **≤205 KB** AVIF delivered at any single viewport (one Hero source + Readiness) |
| 8 | Loading priority | Hero `fetch-priority` high on the background rule; Readiness lazy and low |
| 9 | Fallback colour | `background-color: var(--pub-surface-2)` declared **before** `background-image` on every plate rule, so an undecoded or failed surface is exactly Candidate A |
| 10 | Preload policy | **No `<link rel="preload">`.** It would compete with the font and CSS on the critical path for a decorative asset |
| 11 | Lazy-loading policy | Readiness lazy. Hero not lazy — it is in the first viewport at every desktop tier |
| 12 | Layout stability | CLS must remain **0**, measured by a `PerformanceObserver` registered before navigation, as in Phase 7D |
| 13 | No external image host | Assets live under `public/`, served same-origin. No CDN, no third party |
| 14 | No runtime transformation | No image CDN, no `next/image` loader, no server-side resize, no query-string transform |
| 15 | No background video | Absolute |
| 16 | No excessive DPR variants | **One source per art direction.** The 3000 px wide master already exceeds 2× the largest 1412 px band (2824 px), so 2× DPR is covered without a variant |
| 17 | Implementation mechanism | CSS `background-image` on the plate element, not an `<img>` — decorative by construction, absent from the accessibility tree, and structurally incapable of shifting layout |
| 18 | Decode | `image-rendering` untouched; no `will-change`; no filter, blend mode or backdrop filter |

The Hero may be prioritised because it occupies the first viewport at every
desktop tier. **Readiness must not receive first-load priority.**

## 25. Asset creation and provenance

No asset is created in this phase.

### 25a. Creation requirements (R5E.1E.5B)

1. Bespoke generated visual surfaces only.
2. Produced through Claude Design, image generation, or another controlled
   generative workflow under Lintel's own direction.
3. A written internal prompt and provenance record per asset — tool, model,
   date, operator, full prompt, seed or equivalent, iteration count, and every
   post-process step.
4. No scraped or unlicensed web imagery.
5. No copied Cursor or Skybase asset, at any fidelity.
6. No photographer or artist imitation, and no named style reference in any
   prompt.
7. No recognisable copyrighted artwork.
8. No embedded logo or mark.
9. No people.
10. No text, glyph, numeral or symbol.

### 25b. Required brief content per retained candidate

Composition; material; light; palette (with L\* and C\* bounds); focal region;
negative space; texture; prohibited content; target aspect ratio; source
dimensions; responsive crop guidance; production-format guidance. The full
briefs for Candidates B and C are in
`R5E1E5A_SURFACE_DIRECTION_PACKAGE/ASSET_CREATION_BRIEFS.md`.

### 25c. Required amendments to the accepted image lock

This contract does not amend `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`.
It originally recorded precisely what adoption would require, for a human to
grant or refuse. **That decision has since been made — see §32 — and this
section is retained as the originally-proposed wording for traceability; §32a
and §32b are the operative, current status.**

**Amendment A1 — required for any S2/S3 surface at all, including Candidate C.**
**Status: APPROVED for Phase 7.1, in the bounded form §32a states (5 August
2026).**

> Originally proposed as: add to §5 allowed categories:
> "10. Bespoke non-representational presentation surfaces, generated for Lintel
> under a recorded provenance workflow, applied only to the outer presentation
> surface of a product scene; never behind meaningful text; never as page
> canvas; and bounded by the colour, material, contrast, crop, provenance and
> performance limits of
> `R5E1E5A_SURFACE_HIERARCHY_VISUAL_DIRECTION_CONTRACT.md`."
>
> Amend §8 acceptance criterion 1 to add: "a bespoke presentation surface
> admitted under §5.10 is not a tinted canvas."

The literal edit to `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` implied
by this approval is **not made in this turn** and is deferred to R5E.1E.5F,
alongside the final freeze. §32a is the governing Phase 7.1 interpretation in
the meantime.

**Amendment A2 — required *additionally* for Candidate B only.**
**Status: NOT APPROVED at this stage (5 August 2026).** The existing
prohibition remains authoritative for any accepted or production-facing public
direction — see §32b.

> Originally proposed as: narrow §5 prohibition 6 from "Atmospheric sky
> imagery" to "Atmospheric sky imagery — photographic or generated fields that
> read as sky, cloud, weather, sunrise or sunset."
>
> Narrow §6b never-copy items 3 and 4 identically, so that a near-achromatic,
> non-photographic, non-cloud tonal field at C\* ≤ 4 is not caught.

Amendment A2 asks a human to relax a prohibition that three accepted documents
state and one re-affirms. It was deliberately separated from A1 so that
approving A1 for Candidate C would not smuggle in a change Candidate C does not
need — and that separation is exactly what allowed A1 to be approved while A2
was not.

Candidate B therefore proceeds only as the private, non-shippable diagnostic
role §10c and §32b describe. If it later wins the evaluation framework at
R5E.1E.5D, Amendment A2 requires its own separate, explicit approval before any
propagation step is considered.

## 26. Private comparison laboratory

**Revised by addendum, §32c: the laboratory now requires four configurations,
not three.** §26a–c below are updated accordingly; the underlying method
(stacked plus isolated, no switch control) is unchanged.

### 26a. Method — decided

**Stacked full-scale candidates on one route, plus one isolated route per
candidate. No switch control anywhere.**

| Option | Decision |
|---|---|
| Stacked candidates | **Adopted** for the main lab route |
| Side-by-side | **Rejected** — halving the scene width destroys the very proportion being judged |
| Genuine candidate switch | **Rejected** — it would create a new public interaction pattern, and §5b.7 forbids marketing controls in this system |
| Separate route variants | **Adopted as a companion**, so a reviewer can see one candidate alone in a first viewport with no peripheral competition, which stacking cannot provide |

### 26a-i. Four required configurations (§32c)

| # | Configuration | Band | Status |
|---|---|---|---|
| 1 | Candidate A | Accepted 26 px inset | Control — production baseline |
| 2 | Candidate A | Extended presentation band (§13c) | Diagnostic — isolates the space-only effect from the imagery effect |
| 3 | Candidate B | Extended presentation band | **Experimental, non-shippable** — labelled as such in the route, in every capture, and on the score sheet |
| 4 | Candidate C | Extended presentation band | Fully eligible |

Configuration 2 was previously an optional aside (the informal `A-extended`
diagnostic); it is now a **required** laboratory configuration. Configuration
3 must carry a visible, unmissable "EXPERIMENTAL — NOT FOR PRODUCTION" label in
the lab route itself, not only in the documentation package.

Routes (private, `noindex`, `nofollow`, absent from navigation and sitemap):

- `/visual-lab/public-r5-surface-lab` — the accepted Hero section repeated once
  per configuration in fixed order **1 → 2 → 3 → 4**, at true dimensions, each
  preceded by a plain static `<h2>` outside the plate naming the configuration
  and, for configuration 3, the experimental label.
- `/visual-lab/public-r5-surface-lab/a`, `/a-extended`, `/b`, `/c` — one
  configuration each, first-viewport isolated. `/b` carries the same
  experimental label as configuration 3.

### 26b. Invariants

Everything except the outer presentation surface (and, for configurations 1
vs 2–4, the presentation band itself) is identical across every configuration:
route context; headline and copy; actions; scene dimensions; white product
interface; interaction; choreography; typography; border; radius; responsive
layout; canonical product truth.

### 26c. Required coverage

1. neutral baseline at the accepted band (configuration 1); 2. neutral baseline
at the extended band (configuration 2); 3. every retained candidate at the
extended band (configurations 3 and 4); 4. desktop comparison; 5. tablet
comparison; 6. mobile comparison; 7. interaction over each configuration;
8. reduced-motion state; 9. no-JavaScript state; 10. asset-loading state
(throttled, so the fallback colour is observed before decode); 11. neutral
fallback state (assets deliberately unavailable).

Two written findings are required from this coverage at R5E.1E.5D, per §32c:

1. whether the wider band alone (configuration 1 vs 2) materially improves the
   product presentation;
2. whether an image surface (configurations 3, 4) materially improves on the
   extended neutral band (configuration 2).

The comparison control — the stacking, the labels and the experimental marking
— exists in the private laboratory only and never reaches the accepted route
or production.

## 27. R5E.1E.5B–5F implementation sequence

| Phase | Purpose | Preferred tool | Permitted scope | Required evidence | Stopping condition | Negative outcome | Protected scope |
|---|---|---|---|---|---|---|---|
| **5B** Candidate Asset Creation | Produce Candidate B and C sources to §10/§11/§25 | Claude Design / image generation | New untracked asset workspace; provenance records; no repository asset committed to `public/` until 5C | Every source at master dimensions; per-asset provenance record; measured L\*/C\* histograms; §18a band tests at 56/40/32/20 px | Every retained candidate has compliant wide and tall sources with recorded provenance | A candidate cannot be produced inside §10/§11/§17/§18 → it is withdrawn before the lab, and the lab runs with fewer candidates | All application code, CSS, routes, docs, production `/` |
| **5C** Private Surface Comparison Laboratory | Build the routes in §26 and the §13c band | Codex | New `app/visual-lab/public-r5-surface-lab/**` and a new private implementation directory; `public/r5/surface/**` for accepted assets | Proof that `.sceneFrame` is byte-identical at all twelve viewports; CLS 0; contrast re-measured; forced-colours drop; no-JS; reduced motion; loading and fallback states captured | All ten §26c states captured at 1440×900 and 390×844 | Band change cannot preserve scene dimensions or CLS 0 → the band change is reverted and the lab runs at the accepted 26 px inset, with that limitation stated | The accepted reference-reconstruction route; production `/`; `app/_public-r5*`; frozen R4; `lib/workspace-v2`; dependencies; lockfiles; `.claude/launch.json` |
| **5D** Human and Claude Visual Evaluation | Score every configuration under §22; **Amendment A1 is already approved (§32a) — Candidate C needs no further approval.** Candidate B, if it wins, requires a separate explicit approval of Amendment A2 before propagation can even be considered | Claude Opus + human | Documentation only | Completed §22b score sheets from both reviewers, for all four §32c configurations; rejection log; the two §32c written findings (space-only effect; imagery-over-band effect); if Candidate B wins, an explicit written A2 decision | One configuration clears §22d, or Candidate A (either band) is confirmed | No configuration clears → Candidate A is confirmed at whichever band configuration 1 vs 2 supports, and 5E propagates that | Everything; no code changes in this phase |
| **5E** Accepted Surface Hierarchy Propagation | Apply the accepted outcome to the accepted route; retire the lab | Codex | The reference-reconstruction implementation; `public/r5/surface/**`; the lab routes may be deleted | Full Phase-7D-equivalent re-validation: twelve viewports, 200 % reflow, keyboard, touch, reduced motion, no-JS, forced colours, accessibility tree, contrast, CLS, performance, regression sweep | The accepted route renders the accepted hierarchy with every Phase 7 gate still green | Any Phase 7 gate regresses → the propagation is reverted in full; partial adoption is not permitted | Production `/`; `app/_public-r5*`; frozen R4; all accepted documentation |
| **5F** Final Surface and Public Visual Freeze | Freeze the public visual system for Phase 8 | Claude Opus + human | Documentation; the frozen token and asset manifest | Human acceptance record; frozen surface manifest; the five originality tests re-run | Written human acceptance | Acceptance withheld → the surface reverts to S1 everywhere and the freeze records the neutral system | Everything outside the freeze document |

Tool allocation: Claude Opus for visual contract and review; Claude Design or
image generation for candidate exploration; Codex for controlled implementation
and validation; human acceptance for selection and freeze.

## 28. Phase 8 continuity

Early cross-route implications only. The full cross-route design-system
contract remains Phase 8.

**Reusable:** surface hierarchy (S0–S3); surface tokens; the three-layer
product-presentation grammar; asset provenance rules; responsive crop rules;
the neutral fallback; motion compatibility; accessibility rules; performance
budgets.

**Not assumed:**

1. Not every route receives an atmospheric surface.
2. Product is the strongest candidate for reuse.
3. Trust should remain predominantly editorial.
4. Pricing should remain clear and restrained.
5. Resources should prioritise metadata and reading.
6. Documentation should remain largely static — Cursor's own documentation
   route carries no imagery at all (`d08`), and that separation is correct.
7. Model Assistance may use one controlled product scene.
8. Security or Architecture may use quiet structural materiality — the
   strongest reuse case for Candidate C outside the homepage.
9. Routes need distinct templates.
10. No route inherits imagery merely for brand consistency.

The rule that transfers is §4.7: **selective use is the mechanism.** A surface
applied everywhere produces less hierarchy than no surface at all.

## 29. Acceptance criteria

1. The reference-evidence gate passed without re-extracting any recording. ☐
2. The visual-direction thesis is stated and every decision traces to it. ☐
3. Retained and rejected Cursor qualities are both enumerated. ☐
4. The three-layer surface grammar and the annulus rule are locked. ☐
5. The surface hierarchy is definitive for all seven sections, with category,
   strength, image permission, CSS permission, Hero relationship, fallback,
   responsive behaviour and rationale each stated. ☐
6. Candidate A is documented as a genuine control, not a placeholder. ☐
7. Candidates B and C carry complete, generation-ready specifications. ☐
8. Candidate D is definitively decided. ☐
9. The Hero surface contract states tone, energy, luminance, focal placement,
   three crops, plate span, source count and failure conditions. ☐
10. The Readiness decision is closed, with an exact Hero relationship. ☐
11. Missing Proof's CSS-only question is closed with reasons. ☐
12. Trust, handoff and footer are locked editorial. ☐
13. Colour and tonal boundaries are numeric and testable. ☐
14. Material and texture boundaries include a per-tier survival test. ☐
15. Every Phase 7 contrast and accessibility guarantee is preserved. ☐
16. Every Phase 7 interaction and choreography value is preserved. ☐
17. The responsive crop contract covers all twelve states plus 200 % reflow. ☐
18. Art direction is justified by measurement, not preference. ☐
19. Performance, format and provenance boundaries are numeric. ☐
20. The comparison-laboratory method is decided and creates no new public
    interaction pattern. ☐
21. The evaluation framework has a scale, weights, invariants, a threshold,
    tie-breaks and a default winner. ☐
22. Rejection conditions are enumerated. ☐
23. R5E.1E.5B–5F each have purpose, tool, scope, evidence, stopping condition,
    negative outcome and protected scope. ☐
24. Phase 8 continuity is recorded without pre-empting Phase 8. ☐
25. The conflict with the accepted image lock is disclosed, and the exact
    amendments required are written out rather than assumed. ☐
26. No asset was generated, no surface implemented, no application code, CSS,
    route, interaction or choreography changed. ☐
27. Only this document, `docs/r5/README.md` and the untracked package changed. ☐
28. Nothing was staged, committed, pushed or merged. ☐

## 30. Protected scope

Not modified: `app/page.tsx`; `app/_public-r5`; `app/_public-r5-recalibrated`;
`app/_public-r5-reference-reconstruction`; `app/visual-lab/public-r5`;
`app/visual-lab/public-r5-recalibrated`;
`app/visual-lab/public-r5-reference-reconstruction`; `app/workspace`;
`app/report`; `app/new`; `app/home`; `app/review-operations`;
`app/integrations`; `app/settings`; `app/review-policies`; `app/team`;
`app/visual-lab/workspace-r4`; `lib/workspace-v2`; `package.json`; lockfiles;
`public/r5/scenes`; `.claude/launch.json`; accepted R4 documentation; accepted
R5E.1E.2 documentation; accepted R5E.1E.3 documentation; accepted Phase 7
documentation; all previous evidence and review packages.

Created or modified: `docs/r5/R5E1E5A_SURFACE_HIERARCHY_VISUAL_DIRECTION_CONTRACT.md`
(this document); `docs/r5/README.md`; untracked
`R5E1E5A_SURFACE_DIRECTION_PACKAGE/`.

## 31. Remaining non-core questions

Core visual-direction questions are all resolved. These remain open and none
blocks R5E.1E.5B:

1. The exact pixel values inside the §13c presentation-band ranges, which
   R5E.1E.5C determines by measurement.
2. Whether the Hero band is symmetric or top-weighted at 768–1024 px
   specifically, where the scene is tallest relative to its width above mobile.
3. Whether the accepted plate radius stays 20 px once the band widens, or steps
   to 24 px to match the wider band's optical weight.
4. Whether the S1 plate's own `#fafaf9` should be re-measured against a
   surfaced Hero — a neutral scene may look *too* light beside a staged one.
5. Whether the Readiness companion is generated from the same seed lineage or
   authored separately inside the same specification.
6. Whether `public/r5/surface/` or `public/r5/plates/` is the correct asset
   location, given `public/r5/scenes` is protected.
7. Whether Phase 8's Security or Architecture routes should reuse the Hero
   family or receive their own member of it.
8. Whether a future dark-mode public system would need a separate surface
   family. No dark mode exists and none is proposed.

## 32. Phase 7.1 adoption decision — human addendum

Recorded 5 August 2026. This addendum resolves the two amendment questions
§25c originally left open, so R5E.1E.5B can proceed. It does not reopen the
surface hierarchy (§7), the candidate definitions (§10–12), the evaluation
system (§22), the asset briefs
(`R5E1E5A_SURFACE_DIRECTION_PACKAGE/ASSET_CREATION_BRIEFS.md`), the responsive
crop contract (§21) or the performance budgets (§24). **No earlier accepted
lock document is modified by this addendum.** Formal reconciliation of
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` is deferred to R5E.1E.5F.

### 32a. Amendment A1 — approved

Bespoke static presentation surfaces become an allowed visual category **only
when they satisfy every one of the following, binding without exception:**

1. live within the outer product presentation plate — layer 2 only (§6);
2. remain decorative and non-semantic;
3. preserve an opaque white Lintel product surface — layer 3 unchanged (§6);
4. remain static (§20);
5. have a neutral (S1) fallback (§6b);
6. do not change interaction, choreography, product truth or scene dimensions
   (§20, §13a);
7. are used only in explicitly approved staged scenes — Hero under S3, and
   Readiness under S2 subject to the §32e materiality test;
8. satisfy the accepted accessibility (§19), provenance (§25) and performance
   (§24) contracts in full.

This is the governing Phase 7.1 interpretation of Amendment A1. It supersedes
the provisional wording §25c originally proposed for the purpose of unblocking
R5E.1E.5B; the literal edit to
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §5/§8 is **not made in this
turn** and is deferred to R5E.1E.5F.

**Consequence: Candidate C (§11) is fully eligible for adoption under this
contract. No further amendment or approval is required for it.**

### 32b. Amendment A2 — not approved at this stage

**The existing prohibition against atmospheric sky imagery, atmospheric blue
environments and sky fields — `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`
§5 prohibited 6, §6b never-copy 3–4, §8 acceptance 1 — remains authoritative
for any accepted or production-facing public direction.**

Consequence for Candidate B (§10): it may proceed **only** as a private,
non-shippable diagnostic candidate inside the Phase 7.1 comparison laboratory.
Specifically, Candidate B:

1. may not be propagated to the accepted reconstruction at R5E.1E.5E;
2. may not become the final direction at R5E.1E.5F;
3. may not enter production;
4. may not weaken the existing image lock — its presence in the laboratory
   implies no interim relaxation of §5.6, §6b.3–4 or §8.1;
5. requires a **separate, explicit** approval of Amendment A2 if it later wins
   the evaluation framework (§22) at R5E.1E.5D, sought before any propagation
   step is even considered.

Every Candidate B requirement elsewhere in this contract — the specification in
§10b, the colour and material boundaries (§17–18), the crop rules (§21), the
asset brief — is unchanged and remains fully binding on the diagnostic asset.
The restriction recorded here is one of **disposition**, not of specification:
B must still be built exactly to §10b; it simply cannot leave the laboratory.

### 32c. Comparison-laboratory configurations — revised

The laboratory now requires **four** configurations rather than three, so it
can separate the effect of space from the effect of imagery:

| # | Configuration | Band | Status |
|---|---|---|---|
| 1 | Candidate A | Accepted 26 px inset | Control — production baseline |
| 2 | Candidate A | Extended presentation band (§13c) | Diagnostic — isolates the space-only effect |
| 3 | Candidate B | Extended presentation band | **Experimental, non-shippable** — labelled as such everywhere it appears |
| 4 | Candidate C | Extended presentation band | Fully eligible |

Configuration 2 was an optional aside in the original §26 (the informal
`A-extended` diagnostic capture); it is now a **required** configuration.
Configuration 3 must carry a visible "EXPERIMENTAL — NOT FOR PRODUCTION" label
in the route itself, in every capture, and on the score sheet — not only in
this documentation.

§26 is updated in place to reflect this (§26a-i, §26b, §26c).

Two written findings are required at R5E.1E.5D:

1. **whether a wider band alone materially improves the product presentation**
   — configuration 1 vs configuration 2;
2. **whether an image surface materially improves on the extended neutral
   band** — configuration 2 vs configurations 3 and 4.

Finding 1 answered "yes" without finding 2 also being "yes" is a complete and
legitimate outcome: the accepted geometry at the extended band, not a new
asset, is adopted.

### 32d. Presentation-band dimensions — status

The exact pixel values in §13c (88/56/64 px at ≥1440 px, stepping to
56/20/40 px at mobile) are **laboratory starting values, not
production-frozen values.** R5E.1E.5C measures and may adjust them within the
ranges and constraints §13c already states — top-weighted, scene-dimension
preserving, CLS 0. R5E.1E.5F is where any band geometry is finally frozen,
alongside the surface decision itself.

### 32e. Readiness condition — restated precisely

Readiness receives a companion surface **only when both hold:**

1. the selected Hero family (candidate) wins at R5E.1E.5D; **and**
2. the companion, evaluated on its own, **materially improves consequence and
   authority without competing with PENDING or the seven outcome chips** — the
   same "does removing it make the scene worse" test §22 criterion 16 already
   applies to the Hero.

Failing either condition, Readiness remains S1 — exactly as §7a already
required when Candidate A wins. This addendum does not change the Readiness
specification in §14b; it makes explicit that "wins the Hero" is necessary but
not sufficient, and the companion must independently earn its place rather
than being adopted automatically as a family member.

### 32f. What remains deferred

The literal edit to `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` implied
by the approved Amendment A1, and any final reconciliation the adopted surface
or band geometry requires, are **deferred to R5E.1E.5F**, together with the
final freeze. §32a–e are the governing Phase 7.1 adoption decision until then.

## Human acceptance and R5E.1E.5A closeout

R5E.1E.5A received human acceptance on 5 August 2026.

The accepted surface-direction decisions are:

1. Cursor informs the operating quality. Lintel supplies the identity and
   product meaning.
2. The public editorial canvas remains predominantly white.
3. Atmospheric or material treatment belongs only to the outer presentation
   surface.
4. Meaningful product content remains on an opaque white Lintel product
   surface.
5. Bespoke static presentation surfaces are permitted under Amendment A1.
6. Amendment A1 applies only to decorative, non-semantic outer surfaces in
   explicitly approved staged scenes.
7. Amendment A2 is not approved.
8. Atmospheric sky imagery, atmospheric blue environments and sky fields
   remain prohibited for accepted and production-facing directions.
9. Candidate B may appear only as a private, non-shippable diagnostic.
10. Candidate C is fully eligible under Amendment A1.
11. Candidate D remains rejected.
12. Hero receives the strongest eligible staged treatment.
13. Finding and Evidence remains neutral.
14. Missing Proof and Requirement remains neutral.
15. Readiness may receive a quieter companion treatment only when it passes an
    independent material-improvement test.
16. Trust, the unresolved-case handoff and footer remain editorial white.
17. The private laboratory must compare:
    - accepted neutral 26px band;
    - extended neutral band;
    - Candidate B extended band, experimental and non-shippable;
    - Candidate C extended band.
18. The laboratory must separate the benefit of additional presentation space
    from the benefit of imagery.
19. Proposed band dimensions remain laboratory starting values rather than
    frozen production values.
20. The neutral direction wins whenever no alternative materially exceeds it.
21. Surfaces remain static and may not alter interaction, choreography,
    product truth, scene dimensions or accessibility.
22. Formal reconciliation with the earlier image lock remains deferred to
    R5E.1E.5F after the final surface direction is selected.

R5E.1E.5A is accepted and closed.

The next milestone is R5E.1E.5B: Candidate Asset Creation.
