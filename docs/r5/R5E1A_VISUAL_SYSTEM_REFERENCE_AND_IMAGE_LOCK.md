# R5E.1A — Visual System, Reference and Image Lock

Companion to `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`. Authoritative for the
public token registry, surface and structure rules, semantic colour,
typography, image policy, the Cursor and Skybase reference boundary, and the
originality tests.

Documentation only. No CSS file, token, asset or component was created or
modified.

---

## 1. What this supersedes

| Superseded | Source | Replacement |
|---|---|---|
| Warm neutral page ground `#f7f4ee` and its warm border/ink family | `R5A_DIRECTION_LOCK.md` §7; `R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md` §3 | Neutral white canvas and the token registry in §2 |
| Two full-width charcoal sections and the charcoal token family | `R5A_DIRECTION_LOCK.md` §7; `R5B_LANDING_PAGE_ARCHITECTURE.md` §14 | No full-width charcoal section; the charcoal tokens are retired for public use |
| Cropped product screenshots as the primary visual system | `R5A_DIRECTION_LOCK.md` §9; `R5B_LANDING_PAGE_ARCHITECTURE.md` §13 | Live product demonstration is primary; images become supporting evidence (§4) |
| Reference hierarchy Cursor / incident.io / Littlebird, Attio excluded | `R5A_DIRECTION_LOCK.md` §13 | Cursor sole primary visible reference; Skybase as evidence; incident.io and Attio bounded (§5) |

Unchanged and still in force from R5A: the typography contract (§3 below),
structure made from fine borders rather than shadows and large radii, the
prohibition on a public brand accent, and the prohibited-pattern list in
R5A §17 as narrowed by `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §3a.

---

## 2. Provisional public token registry

This section is the **single place public token values may be written**. No
other R5E.1 document restates a hex value. Values are provisional: R5E.1B
validates them in a real browser and may adjust within the stated intent;
the continuous white-canvas direction itself is frozen and is not a
prototype question.

### 2a. Public surfaces and text

| Role | Provisional value |
|---|---|
| Public canvas | `#FFFFFF` |
| Primary surface | `#FFFFFF` |
| Secondary surface | `#FAFAF9` |
| Quiet selected state | ~`#F3F3F1` |
| Strong divider | ~`#E1E1DE` |
| Subtle divider | ~`#ECECEA` |
| Primary text | ~`#181818` |
| Secondary text | ~`#6E6E6A` |
| Tertiary text | ~`#8A8A85` |

### 2b. Use the frozen product's own tokens inside the demonstration

The frozen product (`app/workspace/workspace-r4.module.css`) already defines
a neutral family within a few units of §2a:

| Product token | Value | Nearest public token |
|---|---|---|
| `--surface-primary` | `#ffffff` | Primary surface |
| `--surface-secondary` | `#fafaf9` | Secondary surface (exact match) |
| `--surface-selected` | `#eeeeec` | Quiet selected state |
| `--surface-hover` | `#f1f1ef` | — |
| `--border-strong` | `#dededc` | Strong divider |
| `--border-subtle` | `#eaeae8` | Subtle divider |
| `--text-primary` | `#1c1c1c` | Primary text |
| `--text-important` | `#656565` | Secondary text |
| `--text-secondary` | `#767676` | Secondary text |
| `--text-tertiary` | `#8a8a8a` | Tertiary text |
| `--focus` | `#2563eb` | — |

**Locked rule.** Where the public demonstration renders a product surface,
it uses the **product's own values**, not a near-miss public approximation.
Public chrome outside the demonstration — header, footer, movement copy,
actions — uses §2a. Two nearly-identical greys in one viewport read as a
rendering fault, and a demonstration that is a few units off the real
product is not a truthful demonstration.

### 2c. Contrast obligations

Computed against a `#FFFFFF` canvas. These are binding constraints on how
each token may be used, not suggestions.

| Token | Ratio on white | Permitted use |
|---|---|---|
| Primary text `#181818` | ≈17.7:1 | Anything |
| Product primary `#1c1c1c` | ≈16.9:1 | Anything |
| Secondary text `#6E6E6A` | ≈5.1:1 | Body and metadata at any size |
| Product `--text-important` `#656565` | ≈5.8:1 | Body and metadata at any size |
| Product `--text-secondary` `#767676` | ≈4.5:1 | Passes AA for normal text with no margin — verify per size in R5E.1B |
| Tertiary text `#8A8A85` | ≈3.5:1 | **Fails AA for normal text.** Non-essential, disabled, placeholder or structurally redundant content only |
| Product `--text-tertiary` `#8a8a8a` | ≈3.5:1 | Same restriction |
| Quiet selected `#F3F3F1` fill | ≈1.06:1 | Never the sole signal of selection |
| Dividers `#E1E1DE` / `#ECECEA` | ≈1.2:1 / ≈1.1:1 | Structural only; never the sole boundary of an interactive control |

Two consequences, both binding:

1. **Tertiary text may never carry essential metadata, status, instructions
   or actions at compact sizes.** This restates
   `docs/r4/R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md`'s rule and
   matches the correction R5C already had to make when its `--r5-ink-3` was
   found under 4.5:1. If a value must be tertiary-weighted and essential,
   darken the token rather than shipping it under-contrast.
2. **Selection must never be conveyed by the quiet fill alone.** It requires
   a second cue: a structural marker, a text state, `aria-pressed`, or the
   product's own `SELECTED REVIEW · READ-ONLY SAMPLE` label. This is
   accessibility requirement 10 in `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
   §12 and it is the single easiest requirement to fail on a white canvas.

Focus indication uses a strong, high-contrast outline, always visible, never
removed, and never expressed only as a colour change of the control.

---

## 3. Semantic colour

Meanings are locked:

| Colour | Meaning — and nothing else |
|---|---|
| Blue | Selection and evidence |
| Amber | Tests, missing proof and unresolved requirements |
| Red | Genuinely blocking or failed |
| Green | Genuinely cleared **only** |
| Violet | Explicit model provenance **only** |

**No new public accent is introduced.** All five meanings already exist as
frozen product tokens in `app/workspace/workspace-r4.module.css`:

| Meaning | Frozen product token | Value |
|---|---|---|
| Blue — observed evidence, focus | `--status-observed`, `--focus` | `#2563eb` |
| Amber — warning, missing proof | `--status-warning` / `--status-warning-soft` | `#94600a` / `#fff7e3` |
| Red — blocking | `--status-blocking` / `--status-blocking-soft` | `#b42318` / `#fff0ed` |
| Green — cleared | `--status-success` / `--status-success-soft` | `#2f855a` / `#edf7f0` |
| Violet — model assisted | `--status-model` | `#7040c7` |

R5E.1B adopts these values rather than inventing public equivalents. This
also satisfies `R5A_DIRECTION_LOCK.md` §7's prohibition on a public brand
accent: semantic colour continues to belong to the product.

Discipline:

1. Colour is sparse. The page is overwhelmingly neutral; semantic colour
   appears only where the product itself asserts the state.
2. **Green must not appear anywhere in the canonical story.** The case never
   resolves. A green stage, tick, badge or bar would misrepresent it.
3. Violet appears only against genuinely model-assisted provenance — in the
   canonical case, the inferred error-shape evidence. It is never used
   decoratively or as an "AI" flourish.
4. No colour may be the only carrier of meaning (§2c).
5. No gradient, no glow, no tinted canvas, no colour that competes with
   product semantics.

---

## 4. Typography

Unchanged from `R5A_DIRECTION_LOCK.md` §6 and restated because the spine
adds new monospace pressure:

1. Geist Sans and Geist Mono. No third family. No display font.
2. Geist Sans carries headlines, body and interface copy. Hierarchy comes
   from optical size and colour, not from many weights.
3. **Geist Mono is restricted to provenance**: run, head and branch; file
   paths; stage and section numbers; identifiers and technical metadata.
4. Prohibited monospace uses: headlines, body prose, marketing labels,
   navigation, buttons, and any decorative or texture role.
5. Body copy sits at a comfortable 60–70 character measure.
6. Uppercase micro labels in wide tracking are permitted where they match
   the product's own label grammar. No letterspaced headlines, no italic
   flourishes.

The verification spine's monospace budget is: the stage numbers `01`–`08`,
the compact mobile `03 of 08` counter, and genuine product metadata. It does
not extend to stage names, which stay in Geist Sans, and it does not license
an invented identifier grammar (`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
§2c.i).

---

## 5. Image policy

The live HTML product demonstration is the homepage's **primary visual
system**. Static imagery becomes supporting evidence rather than the central
storytelling mechanism.

Images are permitted only when they perform a truthful and necessary role.

**Allowed categories**

1. Genuine product-derived imagery.
2. Real diff or code context.
3. Genuine evidence sources.
4. Truthful mobile product states.
5. Integration or handoff evidence.
6. Technical architecture diagrams.
7. Evidence-provenance diagrams.
8. Data-flow or trust-boundary diagrams.

**Prohibited**

1. Generic engineers-at-laptops photography.
2. Stock offices.
3. Stock server racks.
4. Abstract AI spheres.
5. Decorative code screenshots.
6. Atmospheric sky imagery.
7. Copied Cursor or Skybase environmental imagery.
8. Synthetic customers or workplaces.
9. Decorative images that do not improve understanding.

**An image earns a place only when it:**

1. provides genuine product evidence;
2. explains a relationship more clearly than the live demo;
3. adds trustworthy context not available from the demo;
4. preserves a real state that would be wasteful or misleading to
   reconstruct.

Carried forward from R5A §9 and R5B.1, and still binding for any image that
ships: real product regions only; no invented labels; no added radius, no
added shadow, no recoloured state, no simplified band; no floating
fragments, no tilt, no device mockup, no browser chrome; no public
annotation drawn onto a product surface; **no product value edited in an
image**. The public page may crop and frame. It may not restyle.

Nothing in this policy authorises creating new imagery during R5E.1A. No
visual mockups are produced in this phase.

---

## 6. Reference boundary

### 6a. What may be learned from Cursor and Skybase

1. Product-first hierarchy.
2. A stable live product shell.
3. A continuous light canvas.
4. Compact navigation.
5. Large live demonstrations.
6. Concise surrounding copy.
7. Motion tied to interface state.
8. A disciplined grid.
9. A consistent public-route system.
10. Confident whitespace.

### 6b. What must not be copied

1. Exact navigation labels or information architecture.
2. Exact hero proportions or line breaks.
3. Sky imagery.
4. Atmospheric blue environments.
5. Identical floating-window compositions.
6. Exact section order.
7. Exact button geometry.
8. Cursor logos or illustrations.
9. Code-agent metaphors.
10. Distinctive Cursor animation sequences.
11. Branded icons or assets.
12. Copied copywriting.

### 6c. Bounded supporting references

- **incident.io** — enterprise trust, operational clarity, public
  information architecture. Nothing else: not its branding, navigation,
  illustration system, customer proof, sales model or enterprise claims.
- **Attio** — structured records, metadata and relationship clarity.
  Nothing else. Attio is explicitly reintroduced here under this bound;
  `R5A_DIRECTION_LOCK.md` §13 had excluded it "unless explicitly
  reintroduced".
- Neither may introduce a competing outer visual identity.
- Vercel remains excluded. Littlebird is no longer a named reference; the
  restrained-motion responsibility it owned is now carried by
  `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §9.
- No further reference may be added by R5E.1B–F without an explicit human
  decision.

---

## 7. What makes it Lintel

Lintel must remain recognisable through:

1. the verification spine;
2. PR #482 as one persistent case;
3. finding, evidence and requirement identifiers, in the product's own
   grammar;
4. evidence provenance;
5. explicit missing proof;
6. blocking requirements;
7. readiness state;
8. recommendation versus Human Decision;
9. the Queue, Workspace and Inspector hierarchy;
10. restrained semantic colour.

### 7a. Originality tests

Applied at every R5E.1 acceptance gate, and formally at R5E.1F:

1. **Remove the wordmark.** Does the experience still communicate Lintel?
2. **Transplant test.** Could the same interaction be reused unchanged for
   an AI editor, a CRM or a knowledge base? If yes, it is generic.
3. **Motion test.** Does every major motion correspond to a genuine Lintel
   operation?
4. **Model visibility test.** Is the verification model visible without
   relying on explanatory copy?
5. **Imagery test.** Does the visual identity depend on copied
   environmental imagery?

A failure on any test is a direction defect, not a polish item, and is fixed
before the phase is accepted.

---

## 8. Acceptance checklist

1. One continuous white canvas; no charcoal section, coloured band,
   gradient, sky field, tinted canvas or glass identity. ☐
2. Public tokens exist in exactly one place and no other document restates a
   hex value. ☐
3. The demonstration uses the frozen product's own surface, border and text
   tokens; public chrome uses the public tokens. ☐
4. Every contrast obligation in §2c is met, tertiary text is restricted, and
   selection carries a second non-colour cue. ☐
5. Semantic colour uses the frozen product's own tokens; no new public
   accent exists; green appears nowhere in the canonical story. ☐
6. Geist Sans and Geist Mono only, with monospace restricted to provenance,
   stage numbers and technical metadata. ☐
7. The live demonstration is the primary visual system; every shipped image
   satisfies one allowed category and one earns-its-place test. ☐
8. No prohibited imagery category appears anywhere. ☐
9. Nothing from the never-copy list appears; Cursor is the only primary
   visible reference; incident.io and Attio stay inside their bounds. ☐
10. All five originality tests pass. ☐

---

## Phase 7.1F reconciliation addendum — final neutral decision

**Status: DOCUMENTED — PENDING HUMAN FREEZE ACCEPTANCE**

This bounded addendum preserves the historical image-policy record above while
reconciling it with the completed, authorised Phase 7.1 evaluation. Earlier
image exploration was intentionally conditional: it established what imagery
could be tested, not a requirement that imagery must eventually ship.

Phase 7.1B–D completed that evaluation. Neither the atmospheric treatment nor
the structural treatment materially outperformed Extended Neutral. The human
owner selected Extended Neutral at 72/75, and Phase 7.1E propagated and
accepted it with zero bounded correction required. Subject to the Phase 7.1F
human freeze gate, Extended Neutral is therefore the accepted and frozen Hero
treatment and no Hero background image is authorised.

The resulting policy is explicit:

1. B2 remains private, experimental, non-shippable historical evidence.
2. C2 remains retired conditional diagnostic evidence.
3. No responsive image family proceeds.
4. No Readiness companion proceeds.
5. The accepted Cursor lesson is composition, scale, spacing, and product
   staging—not literal scenic imagery.
6. This addendum supersedes any earlier implication in this document that a
   Hero image must eventually ship.
7. Future imagery requires a new, explicit amendment and cannot be inferred
   from the historical lock or the completed candidate exercise.

The earlier reasoning remains part of the decision history. Image exploration
did occur, under bounded authority, and its negative result is now itself an
authoritative input to the zero-image Hero policy.
