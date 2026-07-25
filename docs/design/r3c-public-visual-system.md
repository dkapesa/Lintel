# R3C — Public Visual System

**Status:** Visual system and isolated visual laboratory, calibrated at R3C.1. No production route, logged-in route, application token, storage layer, schema, workflow or dependency was changed. Nothing staged, committed or pushed.
**Branch:** `r3c-public-visual-system`
**Deliverables:** this document, and the working laboratory at `app/visual-lab/landing-v3/`.
**Route:** `/visual-lab/landing-v3` — unlinked, `noindex`, not imported by `app/page.tsx` or any production surface.

> **R3C.1 calibration.** This document records the *calibrated* system. The first R3C pass was structurally correct but read as a technical ledger: hairlines were default decoration, a uniform graph grid covered the page, most light sections resolved to the same two-column ledger, and the primary CTA labels were invisible. R3C.1 fixed all of that. Where this document gives a value, that value is the current one — there is no earlier version to reconcile against.

---

## 1. Authority and relationship to R3A/R3B

R3A is authoritative for positioning, claims, terminology and capability boundaries. R3B is authoritative for the twelve-section order, the section contracts, the light-first direction, the single-dark-section rule, the reference hierarchy, typography roles, motion boundaries, the responsive story order and the footer concept. **R3C does not reopen any of them.**

R3C decides, and this document records as final: colour values, typographic values, spacing and rhythm values, the line doctrine, the visual-language primitives, texture production, section composition at three widths, hero fragment hierarchy, product-theatre visual design, the footer illustration, and concrete motion timings.

**The laboratory is the specification.** Anything ambiguous in prose is settled by `app/visual-lab/landing-v3/landing-v3.module.css`, which is written to be lifted into the production public stylesheet with class renaming and no re-design.

**Reference hierarchy after R3C.1 is singular.** Littlebird is the sole master for atmosphere, page organisation, compositional confidence, section pacing, negative space, hierarchy, variation between product moments and composed product fragments. Cursor governs one thing only: the interactive product proof inside the dark theatre. No other company governs visual design.

---

## 2. Master visual direction

**Identity: editorial verification instrument.** A premium engineering publication that opens once into a precise instrument and then closes back into the publication.

Four signatures make the system Lintel's rather than any reference's:

1. **The hairline is a signature, not furniture.** Every visible line performs a job (§9). Section coordinates, list rows, principle rows, audience rows, chain cells, flow columns and header underlines carry no rule at all — whitespace, scale and alignment separate them.
2. **Actions are round; records are square.** Buttons use a full pill radius; every product record uses a 3px radius. The page says at a glance which things a person does and which things the machine wrote.
3. **The chain is a literal continuous line.** In the hero rail, the evidence chain, the pipeline-to-findings stem, the GitHub flow stem, the theatre spine and the footer plate, the same idea is drawn the same way: one line, marks on it, ending at a person.
4. **Each light section has one dominant visual idea.** No section is solved by *coordinate → rule → two columns → ledger rows → rule*. The gap is a typographic descent; the chain is a single instrumented register; evolution is a paired comparison; recommendation-versus-decision is an unmatched split; GitHub is a stem resolving into one artifact; trust is a staggered editorial measure; audience is a three-column register.

**Prohibited throughout:** gradients, glows, glassmorphism, a second dark band, generic AI imagery, heavy rounded cards, coloured section backgrounds, decorative dashboards, large icon sets, cyber-security theatre.

---

## 3. Pinned public colour tokens (final)

Declared on the public scope root, never on `:root`, `html` or `body`. Verified in the lab: with `html[data-theme="dark"]` set by the application bootstrap, the lab root still computes `rgb(246, 244, 239)` on `rgb(28, 30, 33)`.

| Token | Value | Role |
|---|---|---|
| `--lv3-canvas` | `#f6f4ef` | Page ground. Warm technical paper. Never `#ffffff`. |
| `--lv3-paper` | `#fbfaf6` | Raised paper — records, panels, the menu sheet. |
| `--lv3-paper-sunk` | `#efece4` | Recessed paper — technical wells, limitation blocks. |
| `--lv3-paper-tint` | `#f1eee6` | Differentiated paper band where one is needed. |
| `--lv3-ink` | `#1c1e21` | Printed graphite black. Primary type. |
| `--lv3-ink-2` | `#4a4f56` | Secondary copy, ledes, record detail. 7.7:1 on canvas. |
| `--lv3-ink-3` | `#5f656d` | Muted copy, micro labels, captions. 5.5:1 on canvas. |
| `--lv3-ink-4` | `#7e848c` | Decorative marks and drawing labels only. **Never body text.** |
| `--lv3-rule` | `#ddd8cd` | Hairline. |
| `--lv3-rule-strong` | `#b9b3a6` | Structural rule; record left edge; chain connectors. |
| `--lv3-rule-ink` | `#3a3d42` | Ink rule — chain spines, the accountability divider, drawing linework. |
| `--lv3-blue` | `#2f5f92` | Interaction blue. Links, focus, changed values, the resolved output. |
| `--lv3-blue-strong` | `#24507f` | Link hover. |
| `--lv3-blue-soft` | `rgb(47 95 146 / 9%)` | Selection. |
| `--lv3-focus` | `#2f6ea8` | Focus ring. |
| `--lv3-bronze` | `#8a6a3c` | The single illustration accent, reserved for the resolved decision. |

---

## 4. Dark theatre tokens (final)

| Token | Value | Role |
|---|---|---|
| `--lv3-t-ground` | `#0d0f12` | The band. Near-black, faintly warm. |
| `--lv3-t-panel` | `#14171c` | Panel plane. |
| `--lv3-t-panel-2` | `#1b1f26` | Raised record plane inside the panel. |
| `--lv3-t-inset` | `#0a0c0f` | Panel head, stage spine, wells, panel foot. |
| `--lv3-t-rule` | `rgb(255 255 255 / 8%)` | Hairline. |
| `--lv3-t-rule-strong` | `rgb(255 255 255 / 17%)` | Panel edge, record left edge. |
| `--lv3-t-text` | `#e9e7e2` / `--lv3-t-text-2` `#a9aeb6` / `--lv3-t-text-3` `#7f858e` | Text tiers; the third is 4.8:1 on panel. |
| `--lv3-t-blue` | `#6fa2dc` | Active stage underline and index. |

Four planes, spread far enough to survive a blur test: ground → inset → panel → record.

---

## 5. Semantic public state tokens

Light: success `#1f7554`, warning `#8a5a10`, danger `#9c3b33`, information `#3a6c9b`, provenance `#6f5389`, each with a 10–11% soft fill of itself.
Dark (theatre only): success `#5fbd93`, warning `#d3a04f`, danger `#e0776c`, information `#6fa2dc`, provenance `#b291d1`, each on a 13% fill.

Semantic colour appears **only** where it carries product state. It is also the record's left-edge colour: `--lv3-edge` is set per record from its tone, so a finding, an evidence class and a requirement are distinguishable before a word is read.

---

## 6. Typography scale (final)

Newsreader resolves only through `--lv3-serif` and is used by exactly two classes — the display and editorial roles. It cannot reach a logged-in surface.

| Role | Face | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Display (hero) | Newsreader | `clamp(40px, 4.3vw, 62px)` | 500 | 1.06 | −0.026em |
| Display (final CTA) | Newsreader | `clamp(34px, 3.9vw, 56px)` | 500 | 1.10 | −0.026em |
| Editorial | Newsreader | `clamp(31px, 3.4vw, 47px)` | 500 | 1.12 | −0.024em |
| Section heading | Geist Sans | `clamp(23px, 2.3vw, 31px)` | 550 | 1.20 | −0.021em |
| Distinction claim | Geist Sans | `clamp(21px, 2.3vw, 32px)` | 550 / 400 | 1.24 | −0.021em |
| Principle title | Geist Sans | `clamp(20px, 1.9vw, 26px)` | 600 | 1.25 | −0.018em |
| Lede | Geist Sans | `clamp(16px, 1.25vw, 18px)` | 400 | 1.62 | −0.004em |
| Body | Geist Sans | 15px | 400 | 1.68 | 0 |
| Support | Geist Sans | 13px | 400 | 1.55 | 0 |
| Micro label | Geist Sans | 10.5px | 600 | 1.30 | 0.13em, uppercase |
| Technical | Geist Mono | 11.5px | 450 | 1.50 | 0.01em |

**Newsreader appears four times and nowhere else:** hero statement, verification-gap statement, Recommendation-versus-Human-Decision statement, final CTA. Its scarcity is why it carries weight.

**Line breaks are authored, not accidental.** Both display statements are split into `<span>` lines with `text-wrap: balance`, and neither carries a `ch`-based cap, so each authored line takes its own full width. Measured at 1440: the hero renders *Agents create code.* / *Lintel verifies* / *what is ready.* (1 + 2 lines in a 566px column), and the final CTA renders *Move from generated code* / *to an accountable merge decision.* on exactly one line each. No orphaned word.

**Geist Mono is provenance only:** repository names, PR numbers, branches, SHAs, `F1`/`E1`/`C1` identities, risk values, counts as values, state tokens, file paths, the `≠` operator, and drawing labels. Never prose, never emphasis.

---

## 7. Content width, grid and gutter

| Token | Value | Use |
|---|---|---|
| `--lv3-max` | `1240px` | Standard editorial content column. |
| `--lv3-max-wide` | `1400px` | Navigation, hero, theatre and the footer plate. |
| `--lv3-measure` | `640px` | Maximum measure for ledes and body paragraphs. |
| `--lv3-gutter` | `clamp(20px, 4.5vw, 56px)` | Page gutter at every width. |

Column ratios, all `minmax(0, Nfr)` so nothing can overflow:

- hero **46 / 54**, gap `clamp(36px, 4vw, 64px)` — widened from the first pass so the display type fits its authored break
- theatre **27 / 73**
- verification gap **58 / 42**; gap contrast **300px / 1fr**
- Recommendation vs Human Decision **54 / 46** (deliberately unequal)
- GitHub scene **41 / 59**
- evidence chain: `repeat(5, minmax(0, 1fr))` with a `clamp(14px, 1.9vw, 30px)` column gap
- audience register: `repeat(3, minmax(0, 1fr))`
- theatre stage body: `minmax(0, 1fr) minmax(0, 264px)`

---

## 8. Spacing and section rhythm

Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.

| Token | Value | Applied to |
|---|---|---|
| `--lv3-y-major` | `clamp(84px, 8.4vw, 140px)` | Verification gap, Recommendation vs Human Decision. |
| `--lv3-y` | `clamp(66px, 6.6vw, 108px)` | Evidence chain, evolution, GitHub, trust. |
| `--lv3-y-tight` | `clamp(48px, 4.6vw, 72px)` | Audience — it begins the release into the CTA. |
| Theatre | `clamp(76px, 8.4vw, 148px)` | The one dark band, deliberately the most generous. |
| Hero | `clamp(40px, 4.2vw, 66px)` top / `clamp(72px, 8vw, 124px)` bottom | Top-weighted so the thesis sits high. |
| Final CTA | `clamp(84px, 9vw, 148px)` top / `clamp(52px, 5.5vw, 84px)` bottom | The page's largest single opening of air. |

**Measured composition at 1440 × 900**, all sections expanded, fonts loaded:

| Section | Height | | Section | Height |
|---|---|---|---|---|
| Hero | 1006 | | Recommendation vs Decision | 1295 |
| Verification gap | 1113 | | GitHub workflow | 1065 |
| Evidence chain | 765 | | Trust and architecture | 1020 |
| **Product theatre (dark)** | **1236** | | Who Lintel is for | 331 |
| Review evolution | 1095 | | Final CTA | 498 |
| | | | Illustrated footer | 595 |

Total document **10,090px** — **15.7% shorter** than the first pass (11,966px), inside the 15–20% target. The largest single reductions came from the audience register (−50%), the evidence chain collapsing two registers into one (−19%), the final CTA (−35%) and the footer (−43%).

**The dark share.** The theatre is 1,236px, **12.2%** of scroll height, and is the second-largest section after the accountability split. R3B's ~80/20 is delivered as: exactly one full-width dark band, the most generous section by padding, holding a 940px instrument, and the only place the visitor operates the product. A literal 20% would need ~2,000px of continuous dark, which would break the calm requirement. R3D may increase the theatre's reserved panel height; it must not add empty dark padding to hit a ratio. **The binding rule is "exactly one major fully dark section", and it is satisfied.**

---

## 9. Line doctrine, radius and elevation

Every visible line performs one of three jobs. If a line performs none, it does not exist.

**1 · Structural — `--lv3-line-structural` (`#3a3d42`).** Carries the product model. Exactly seven uses: the hero rail, the evidence-chain line, the pipeline-to-findings stem, the GitHub flow stem, the divider between recommendation and Human Decision, the divider between the two commit heads, the footer datum.

**2 · Record — `--lv3-line-record` (`#ddd8cd`).** Divides genuinely different records inside a technical surface: record borders and their internal meta rules, theatre records, evolution rows, recommendation entries, comment sections, the mobile menu.

**3 · Ghost — `--lv3-line-ghost` (`rgb(28 30 33 / 7%)`).** Sparse atmosphere in intentional product moments only: the opt-in `.fieldGrid`, and the navigation's scrolled hairline.

**Removed entirely at R3C.1:** the rule under every section coordinate (×7), the four verification-gap row separators, the three unresolved-findings row rules, the evidence chain's five vertical cell dividers and two horizontal register rules, the chain bridge rule, both hero rules, the GitHub five-column verticals plus its top rule and six capability-list rules, the trust top rule and four principle rules, the audience top rule and three row rules, the evolution and movements top rules, the recommendation top rule and note rule, the footer navigation rule. **Measured result: 5 full-width horizontal rules remain across every light section, from roughly forty.**

Connectors replaced them where the relationship was real: each hero fragment now has a stub whose length equals its own indent, and each unresolved finding and flow step hangs off its stem by a short tick.

Radii: `--lv3-r-action: 999px`, `--lv3-r-record: 3px`, `--lv3-r-panel: 4px`, `--lv3-r-chip: 2px`.

**Elevation: none.** No `box-shadow` anywhere in the public system except a 1px inset marking a selected segment in a control.

---

## 10. Public button and link treatment

| Element | Spec |
|---|---|
| Primary | 46px min height, 22px inline padding, pill radius, `--lv3-ink` fill, `--lv3-canvas` label, 14px/550. Hover and active darken the fill to `#000`. Measured contrast **15.2:1**. |
| Secondary | Same metrics, transparent fill, `--lv3-rule-strong` border, `--lv3-ink-2` label; hover moves both to `--lv3-ink`. |
| Small (nav, footer) | 38px min height, 17px padding, 12.5px. |
| Text link | 13px/550 in `--lv3-blue` with a 32%-opacity underline reaching full strength on hover. |
| Focus | `2px solid var(--lv3-focus)`, `outline-offset: 3px`, on every interactive element. |

> **Defect fixed at R3C.1 — invisible primary CTA labels.** The reset `.root a { color: inherit }` has specificity (0,1,1) and therefore beat `.btnPrimary` (0,1,0). Every dark pill inherited `--lv3-ink` and rendered ink-on-ink; the same defect silently stripped the blue from `.textLink`. It was not opacity, blend mode, clipping, a pseudo-element or an animation state.
> **The fix is structural, not a patch:** every element reset is now wrapped in `:where()` on both sides — `:where(.root) :where(a)` — dropping it to (0,0,0) so a component class always wins. `.btnPrimary` additionally restates its colour across `:link`, `:visited`, `:hover`, `:focus`, `:focus-visible` and `:active`. **R3D must not reintroduce a bare type selector in the public reset.**

There are exactly two actions on the page: **Review a pull request** → `/new`, and **Explore the sample Workspace** → `/workspace?source=fixture`. Navigation and footer carry the primary only. No third action exists.

---

## 11. Product-fragment visual language

A **record** is the atomic product surface: `--lv3-paper` on a 1px `--lv3-line-record` border with a 2px `--lv3-edge` left rule (its semantic tone), 3px radius. Parts, always in this order: mono identity → uppercase kind → state chip → title → detail → optional mono well (`overflow-x: auto`) → optional meta `dl`.

**Hero fragment hierarchy (R3C.1).** The six fragments no longer carry equal weight. Four roles, with measured desktop widths:

| Role | Fragment | Indent | Width | Treatment |
|---|---|---|---|---|
| **anchor** | PR identity `#482` | 0px | 630px | Bordered, ink left edge, 19px title, 18/20/19 padding |
| support | Observation `F1` | 48px | 391px | **No box** — bare type, 5px node, 13.5px title in ink-2 |
| **principal** | Evidence `E1` | 20px | 517px | Bordered, tone edge, 14.5px title |
| **principal** | Missing proof `E4` | 68px | 479px | Bordered, tone edge, offset furthest right |
| support | Requirement `C1` | 36px | 416px | **No box** — bare type |
| terminal | Human Decision | 8px | 593px | **No box** — dashed top rule, 15px title, wide and shallow |

Width, vertical rhythm, indentation, density, node size (9 / 7 / 5px) and border presence all vary. Two of six fragments have no border at all, so typography and position carry the composition.

**The chain is unbroken and now geometrically correct.** In the first pass the node marks were offset by each fragment's indent, so they drifted off the rail and read as unrelated marks. Nodes are now fixed to the rail and the *stub* absorbs the indent. Verified: all six node centres compute to x = 693 against a rail at x = 692, with stub lengths 34 / 82 / 54 / 102 / 70 / 42px matching each indent.

**Provenance mark.** A 5px rotated square outline plus `SAMPLE DATA` in mono 9.5px/600 uppercase. Nine marks are present on the page and none is dropped at any width.

**Coordinate.** A mono 10px/0.11em uppercase line in `--lv3-ink-4`, with **no rule**, opening each light section.

---

## 12. Evidence-chain visual language

**One register, not two.** The first pass explained the chain twice at near-equal weight. It now explains it once, with the definitions as the quiet caption and the worked canonical record as the principal object.

One continuous 1px structural line spans the content width at `top: 30px`. Five stations sit on it in a 5-column grid with **no cell dividers**. Each station carries, top to bottom: mono index → 9px rotated node **on the line** (the fifth is filled solid) → stage name 16.5px/600 → definition 12.5px in `--lv3-ink-3` → the worked record as a paper block with a 2px semantic left edge, carrying its mono identity, 14px title and state chip.

An opt-in `.fieldGrid` sits behind the chain — this is one of only three places drafting geometry appears.

Tablet and mobile rotate the line to a left rail at `left: 4px`; stations become rows with the node on the rail. Stage order never changes and the line is never broken.

---

## 13. Product-theatre visual system

**Preserved from R3C without redesign**, per the R3C.1 brief: the three scenarios, the five-stage model, the context rail, the identity header, the persistent recommendation / risk / decision state, the pending decision in all three scenarios, the keyboard model, and the introductory sequence and its stop condition.

**Ground.** `--lv3-t-ground`, entered on a hard edge. Behind the panel, 1px vertical rules at 88px at 2.6% white, masked at top and bottom.

**Arrangement.** 27 / 73, copy sticky at `top: 100px`; below 1180px it stacks above.

**Panel anatomy:** identity head (`--lv3-t-inset`) with three right-aligned verdict blocks → three-scenario `radiogroup` with the selected scenario's summary beside it → five-stage `tablist` → stage body → context rail → provenance foot.

**R3C.1 refinements only:**
- **Transition into and out of the band.** A 44px structural descender at the top edge and a matching riser at the bottom, both fading from `--lv3-t-rule-strong`, so the chain visibly enters and leaves the instrument instead of the band simply starting.
- **Active-stage hierarchy strengthened.** The underline goes 1px → 2px, the selected name goes 550 → 600 weight, and its mono index takes `--lv3-t-blue`.
- **Reserved stage height 660 → 700px.** Verified: the stage body measures 700px before and after a scenario switch, so the instrument holds still while its contents change.
- **Mobile controls.** Spine tabs get `min-height: 62px` and `scroll-snap-align: start` with `scroll-snap-type: x proximity`; scenario buttons get `min-height: 40px`.

**Locked states** are unchanged: scenario 1 `TESTS REQUIRED` / risk 46 MEDIUM / four open / pending; scenario 2 `REVIEW REQUIRED` / 58 / three open / pending; scenario 3 `APPROVE` / 22 LOW / none open / **pending**, with copy stating that no control records a decision.

---

## 14. Review-evolution presentation

A two-state commit toggle and nothing else. Two columns divided by the structural rule — **the only rule in the composition**, because the division between heads is the point. The section's own top and bottom framing rules are gone; the comparison is the focal scene.

Each column is a `dl` of six rows with record-weight dividers and no final rule. A changed value renders in `--lv3-blue` with a mono `CHANGED` marker on its label. Below, a *What moved* ledger of five rows: mono identity, state chip, description.

**R3C.2 closure.** Both desktop heads remain fully readable at all times: inactive labels, values and headings retain their normal paper contrast, with no column-wide opacity reduction. Selection is expressed through the existing selected toggle, a stronger active heading, and interaction blue on changed values; the inactive heading is only quietly secondary. The mobile control still presents one complete selected head at a time.

**The counts reconcile exactly:** open requirements read 4 → 4 while blocking moves 1 → 2, missing proof 2 → 1, risk 41 → 46, and the recommendation moves from `REVIEW REQUIRED` to `TESTS REQUIRED`. The score barely moves; the record changes substantially. That is the section's argument.

---

## 15. Recommendation versus Human Decision presentation

**The quality reference for every other light product moment**, and preserved substantially as built. Two columns at 54 / 46 divided by a 1px structural rule, with the Newsreader statement spanning above them.

**Left — recommendation.** Dense, technical, mono-heavy: six entries in a `30px / 1fr` grid, then a limitations block on `--lv3-paper-sunk` (now a 2px left edge rather than a full box) stating that a recommendation is not an approval, that Lintel does not run tests or gate merges, that exact reproduction of optional model output is not claimed, and that requirements clear when a person supplies proof.

**Right — Human Decision.** Calmer and visibly authored: four fields at 20–30px spacing, the Decision field a **dashed** plate reading `No engineer decision recorded` — dashed because nothing has been written. Below it, one smaller recorded-decision example with a 2px `--lv3-success` left edge.

R3C.1 removed only the section's top rule and the note's rule; the record distinction is untouched. On mobile the divider becomes horizontal and the order never inverts.

---

## 16. GitHub workflow presentation

**One composed product scene**, replacing the five-column documentation grid.

The five steps hang off a **single structural stem** on the left, each with a 7px node; the fifth node is filled `--lv3-blue` because it is the output. Beneath the stem sit two quiet registers: the implemented capabilities as one mono line (`GitHub App auth · short-lived JWTs · installation tokens · raw-body HMAC SHA-256 · timing-safe comparison · idempotent ingestion · deterministic fallback · one updated comment · server-side credentials`), and a single restrained note carrying every boundary.

The right column is the **resolution**: the webhook-verification graphite record, then the updated GitHub comment — enlarged (16px title, 18px padding) and carrying a 2px `--lv3-blue` left edge, marking it as what the whole stem produces.

**No boundary was weakened.** The App is real when configured and not configured by default with its status always shown; HMAC SHA-256 over the raw body with timing-safe comparison; idempotent ingestion; deterministic fallback; one updated comment; no automatic merge; no enforced policy; the Action is a separate blueprint, not a live connection; the Slack handoff copies rather than sends; exact reproduction of stochastic model output is not claimed. They now occupy one note instead of dominating the section.

---

## 17. Trust-principle presentation

**Composed editorial, no rules at all.** Four principles on a `54px / 1fr` grid, separated by `clamp(32px, 3.6vw, 54px)` of air, with the **even-numbered principles indented** by up to 118px so the measure staggers rather than stacking.

Each principle states its point first and short (`lead`, in full ink), then qualifies it quietly (`note`, in support size). The copy was rewritten so trust is communicated before architecture is documented — nothing accurate was dropped.

Below, a provenance row demonstrating the vocabulary it describes: `RULE DETECTED`, `MODEL ASSISTED`, `MISSING · UNVERIFIED`, `INFERRED`.

No cards, no icons, no compliance badges, no certification theatre.

---

## 18. Audience presentation

Compressed from a near-full-viewport stack of three ruled rows (659px) to a **three-column register** (331px, −50%). The heading is *For the engineers answerable for what merges.* Each item is a mono index above a 15.5px statement at a 30ch measure, with no rules. On mobile it becomes a compact labelled stack.

It uses `--lv3-y-tight` padding so it visually begins the release into the final CTA while remaining a distinct semantic section. No persona cards, images, logos, testimonials or invented organisations.

---

## 19. Texture rules

**The page-wide graph grid is gone.** What remains across ordinary editorial sections is only:

1. a sparse 23px halftone dot at 3.4%, masked out entirely below ~62% of the page, so the lower half is almost unmarked paper;
2. one very-large-scale 240px ghost column line at 2% — large-scale linework, not a small grid;
3. a 5px paper tooth at 3% × 0.42 opacity.

**Drafting geometry is now opt-in.** A `.fieldGrid` layer (44px, ghost weight, radially masked, 0.5 opacity, `z-index: -1`) appears in exactly two product moments — the hero product field and the evidence chain — plus the footer plate, which draws its own. Nowhere else.

Texture must not reduce body-copy legibility, must not repeat visibly, must not appear inside dense records (records paint their own opaque `--lv3-paper`), and must not appear inside the theatre. It cannot reach a logged-in route because it is declared on lab-owned classes only.

---

## 20. Footer illustration system

An original, layered, hand-authored inline SVG — `viewBox="0 0 1440 330"`, rendered at the wide measure (1288 × 295px at 1440). Not generated from repository structure; copies no reference artwork.

**One continuous scene:** a single origin node labelled `HEAD` → seven diverging branch curves acquiring nodes → six evidence stems standing on the datum beneath one dashed shelf, carrying solid, halftone and open record bars, with a light polyline through their caps → three standing requirement plates with mono marks, underlined by a 2px base rule → three curves converging on one point that a 2.4px stem carries up to the bronze resolution.

**R3C.1 gave it a resolution.** Three changes:

1. **A single left-to-right stroke gradient** (`#lv3Travel`, `--lv3-rule-strong` @ 50% → `--lv3-rule-ink` @ 100%) runs through the branches, the stems and the convergence, so the drawing physically darkens as it becomes more accountable. The transition from loose to structured is now the scene's principal movement.
2. **Competing marks reduced:** datum ticks halved to every 80px and shortened, both dashed guide rules replaced by one shelf, evidence bars thinned from 3–4 to 2–3 per stem, one registration cross instead of two.
3. **The Human Decision became the focal conclusion:** a 2.4px stem, a solid ink base square, an 80px bronze bracket, a large bronze diamond inside a drafting registration ring, a `HUMAN / DECISION` label in full ink, and the only ink-weight stage label on the register.

Bronze appears exactly four times, all at the resolution. A narrow `viewBox="0 0 480 200"` variant shows the same resolution for mobile and is never removed. The illustration is static: it never animates, parallaxes or responds to the pointer.

---

## 21. Motion timings and easings

| Token | Value | Applied to |
|---|---|---|
| `--lv3-micro` | `120ms` | Hover and focus feedback; the navigation's scrolled hairline. |
| `--lv3-state` | `180ms` | Scenario switch, stage switch, evolution toggle, stage-pane entry. |
| `--lv3-spatial` | `240ms` | Reserved. |
| `--lv3-narrative` | `360ms` | Section-entry reveal only. |
| `--lv3-ease` | `cubic-bezier(.2, .65, .35, 1)` | Standard state change. |
| `--lv3-ease-enter` | `cubic-bezier(.16, .76, .3, 1)` | Entrances. |

**Hero:** the rail draws once via `scaleY` over **520ms**, under the 600ms budget, with a 70ms fragment stagger.
**Section entry:** one-time per section on first intersection, opacity plus 10px `translateY` at 360ms, 70ms stagger, `unobserve` on reveal.
**Theatre sequence:** 5 × 1,100ms = **5.5s**, once, never restarting, stopped permanently by any pointer, focus or key event, jumping immediately to the complete final state.

**Content wins over motion.** The reveal is gated on the controller declaring itself ready, so a visitor without JavaScript sees the complete page, and a 1.6s failsafe reveals every section if the observer is present but never delivers.

**Prohibited:** perpetual floating, looping carousels, simulated pointer movement, fake typing, animated gradients, large parallax, scroll hijacking, animated counters, and animation of width, height, `top`/`left`, filters, blur or shadow.

---

## 22. Reduced-motion behaviour

`prefers-reduced-motion: reduce` is an authored mode. Five rules, all verified present in the built stylesheet:

- `[data-reveal]` forced to full opacity, no transform, no transition — `!important`;
- the hero rail does not draw;
- the stage-pane entry animation is removed, so stage and scenario switches are instant replacements;
- smooth scrolling is disabled inside the public scope;
- spine tabs are never dimmed.

The theatre's introductory sequence additionally never starts: the component checks the media query on mount and marks the sequence done. Every interaction, focus indicator, semantic colour and piece of information remains.

---

## 23. Desktop, tablet and mobile composition

Breakpoints: **desktop ≥ 1180px · laptop/tablet 768–1179px · mobile < 768px**, with a first stacking step at `max-width: 1179px`.

**Desktop (1440).** Verified: no page overflow; 46/54 hero with four-role fragments on one rail; horizontal five-station chain; theatre copy beside the panel; two-column evolution; 54/46 accountability split; GitHub stem and comment side by side; three-column audience; 1288px footer plate.

**Laptop and tablet (1024).** Verified: no page overflow; no element outside the viewport. Below 1180px the hero and theatre copy stack and the GitHub scene goes single-column; the chain register tightens its type rather than being squeezed. Below 1024px the navigation collapses to a toggle, the chain rotates to a left rail, the theatre's context rail moves beneath the records, the accountability split stacks with a horizontal divider, and the trust stagger halves.

**Mobile (390).** Verified: no horizontal page scroll; three complete hero fragments; scenario control and stage spine scroll inside their own bounds with 40px and 62px tap targets; one evolution head under the toggle; single-column audience; narrow footer scene active; nine sample marks present; all visible primary CTAs at 15.2:1.

**R3C.2 mobile acceptance.** At approximately 390px the composed hero fragments, both CTA labels, readable touch-operable scenario and stage controls, the Recommendation-before-Human-Decision order, concise audience register, deliberate final CTA breaks, narrow Human Decision footer resolution, and sample provenance remain intact. Theatre scrolling is contained within its controls; no desktop reserve is introduced. No GitHub or Trust spacing change was required: neither section had a clearly unnecessary local reserve to remove.

**Global rules.** Section order never changes. Copy hierarchy never inverts. Wide content scrolls inside its own container. Reductions show *fewer complete* elements, never the same elements cropped. Sample provenance is never the first thing dropped.

---

## 24. Landing/application isolation rules

1. **Every public token is `--lv3-*` on the public scope root.** Nothing on `:root`, `html` or `body`; nothing consumes `--color-*`, `--app-*`, `--d*`, `--wsv2-*` or the `.lp` layer. Only the three `next/font` variables are read.
2. **Application theme state and OS preference cannot invert the public page.** Verified with `html[data-theme="dark"]` active: the root computes `rgb(246, 244, 239)` on `rgb(28, 30, 33)`, and exactly one full-width dark band exists.
3. **Newsreader reaches only the display and editorial roles** inside the public scope.
4. **The lab is a CSS module**, so its selectors are hashed and cannot collide with application CSS. R3D should keep the equivalent discipline: one public root class, one public stylesheet, no public rule outside it.
5. **No public component reads or writes storage, contacts the network, or imports Workspace persistence, decision services or report history.**
6. **The lab is unlinked and `noindex`**, is not in `app/nav-config.tsx`, does not render `AppShell`, and is imported by no production route.

---

## 25. R3D implementation handoff

1. **Extract** the `.lp` layer out of `app/globals.css` into `app/landing.css` and rewrite it light-first from `landing-v3.module.css`, renaming `lv3-` to the production public prefix. **Carry the `:where()` reset across verbatim** — a bare `a { color: inherit }` reintroduces the invisible-CTA defect.
2. **Lift the section markup** from `app/visual-lab/landing-v3/page.tsx`. It is semantic, has one `h1`, and is server-rendered apart from four client boundaries.
3. **Replace `fixtures.ts` with the canonical landing fixture adapter** (R3B §16). It must derive the same shape at build or server time from `lib/mock-report`, `buildEvidenceHierarchy` and `buildMergeContract`, and pass only the small serialisable theatre shape to the client. The lab's exported types are the target shape. Scenario 2 (`acme/checkout-gateway` #211) is lab-authored and must be re-derived or replaced with a scenario the builders can produce.
4. **Keep four client boundaries only:** navigation, reveal controller, theatre, evolution toggle.
5. **Extend `app/landing-motion.tsx`** rather than replacing it — the lab's controller is the same architecture plus the failsafe timer.
6. **Rewrite `app/landing-nav.tsx`** to the locked destinations, remove the public theme toggle, preserve the skip link, focus-visible rules and Escape/focus menu behaviour.
7. **Fix the three carried-forward CTA defects:** "Check a pull request" → "Review a pull request"; `/report?demo=1` → `/workspace?source=fixture` labelled "Explore the sample Workspace"; the hero eyebrow to `ENGINEERING VERIFICATION`.
8. **Verify every footer destination live.** The lab uses in-page anchors throughout so it never navigates into production.
9. **Do not change** `app/design-system.css` application tokens, `app/app-shell.css`, the theme bootstrap, `SHELL_DARK_PATHS`, any logged-in route, or any storage key.

Open for R3D, and only R3D: the real route destinations, the canonical fixture adapter, page metadata per R3A §29, and whether the theatre's reserved panel height grows. **No further art-direction pass is required.**

---

## 26. Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Littlebird is unmistakably the compositional master | ✔ |
| 2 | Cursor visible only through the interactive-product approach | ✔ |
| 3 | The page no longer reads primarily as a technical ledger | ✔ |
| 4 | The hairline remains a signature but is materially less frequent | ✔ 5 full-width rules remain in the light sections |
| 5 | The uniform full-page grid is substantially reduced | ✔ removed; drafting geometry is opt-in in three places |
| 6 | Light sections have distinct compositional identities | ✔ |
| 7 | The page stays calm while becoming more visually authored | ✔ |
| 8 | Vertical rhythm ~15–20% tighter | ✔ 15.7% (11,966 → 10,090px) |
| 9 | All dark CTA labels visible in every state and viewport | ✔ 15.2:1, all states restated |
| 10 | Hero fragments have hierarchy, not equal box weight | ✔ four roles, two unboxed, widths 630–391px |
| 11 | The verification gap is editorial, not tabular | ✔ staggered, unruled |
| 12 | The evidence chain is simplified without losing precision | ✔ one register instead of two |
| 13 | The theatre's functionality and composition are preserved | ✔ verified by interaction |
| 14 | Review Evolution is legible and more tightly framed | ✔ |
| 15 | Recommendation vs Human Decision remains the strongest accountability moment | ✔ |
| 16 | GitHub is one composed story, not a documentation grid | ✔ stem → comment |
| 17 | Trust communicates principles before implementation detail | ✔ lead / note split |
| 18 | The audience section is concise and confident | ✔ −50% |
| 19 | The final CTA has deliberate line breaks | ✔ 1 line each at desktop |
| 20 | The footer resolves clearly at Human Decision | ✔ gradient travel + bronze focal marker |
| 21 | No customer, adoption or endorsement claim introduced | ✔ |
| 22 | No production or logged-in code changed | ✔ |
| 23 | TypeScript passes | ✔ |
| 24 | The document is sufficient for R3D without another art-direction pass | ✔ |

*End of R3C visual system.*
