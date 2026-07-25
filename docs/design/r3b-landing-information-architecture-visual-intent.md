# R3B — Landing Information Architecture and Visual Intent

**Status:** Documentation and repository-mapping artifact. No landing page, component, style, token, route, API or dependency was changed. No illustration or screenshot asset was produced. Nothing staged, committed or pushed.
**Branch:** `r3b-landing-information-architecture`
**Governs:** R3C (public visual system) and R3D (landing implementation). R3E (screenshot and proof system) and R3F (conversion and QA) inherit the boundaries stated here.
**Upstream authority:** `docs/product/r3a-landing-positioning-proof-contract.md` (positioning, claim taxonomy, capability-to-proof matrix, terminology, forbidden claims). R3B does not reopen the product category, positioning or claim boundaries; it fixes information architecture, section contracts and visual intent on top of them.
**Secondary repository inputs:** `app/page.tsx`, `app/landing-nav.tsx`, `app/landing-motion.tsx`, the `.lp` layer in `app/globals.css`, `app/design-system.css`, `app/layout.tsx`, `app/workspace/page.tsx`, `docs/design/V8_MOTION_CONSTITUTION.md`, `docs/design/LVOS_WEBSITE_PRODUCT_CONTINUITY.md`, `docs/design/VC_3_LANDING_PAGE_FINAL_ART_DIRECTION.md`.

---

## 1. Purpose and authority

R3B answers three questions and closes them:

1. **What is on the landing page, in what order, and what does each section have to prove?**
2. **What does the page look and feel like at the level of composition, material, typography and motion — before any pixel or hex value is chosen?**
3. **Which parts of the existing landing implementation survive, which are retired, and where do R3C and R3D draw their file boundaries?**

**Authority rules.**

- R3A is authoritative for every claim, term and capability boundary. Where this document names copy, that copy is a *direction* traceable to an approved R3A claim, not a new claim.
- The repository is authoritative for capability truth. Older marketing documents are history, not permission.
- This document is authoritative for section order, section contracts, the light-first direction, the 80/20 balance, typography roles, motion boundaries, the responsive story order and the footer concept. R3C and R3D **must not reopen** those. R3C decides colour values, illustration, spacing scale and composition detail. R3D decides component structure, markup and implementation.
- Where R3B and the superseded landing dialects (`VC_3`, `V8B.1`, `LVOS website continuity`) disagree, R3B supersedes them for the public landing only. The V8 Motion Constitution remains binding as a floor — R3B narrows it further; it never widens it.

**Non-goals (restated so they are enforceable):** no implementation, no production CSS or component edits, no final colour selection, no illustration or screenshot assets, no Workspace or logged-in change, no new dependencies, no broad repository audit.

---

## 2. Product and positioning foundation

**Product.** Lintel is an engineering verification product that helps an engineer decide whether a pull request is ready to merge.

**Core positioning.** *Agents create code. Lintel verifies what is ready.*

**Core verification sequence.** Change → Observation → Evidence → Requirement → Human Decision.

**Accountability rule.** Lintel recommends. The accountable engineer decides. This is not a tagline decoration; it is a structural constraint on the page. Every section that shows a recommendation must be within one screen of something that shows the decision is still human, and no section may render a recommendation as an outcome.

**The narrative spine the page must carry** (from R3A §5, compressed):

1. Code is being produced faster than it can be verified.
2. Verification, not creation, is the bottleneck.
3. A passing pipeline does not prove a change is ready.
4. Readiness needs inspectable evidence and an accountable decision.
5. Lintel produces one structured verification record per change, ending at the Human Decision stage, which remains pending until an accountable engineer records an outcome.

**Canonical scenario.** `acme/redemption-api` PR #482, "Add fallback handling for failed discount-code retrieval" — recommendation TESTS REQUIRED, risk 46/100 medium, one HIGH finding bound to one open blocking requirement, no Human Decision recorded. This is the default scenario for hero, verification gap, evidence chain and the product theatre. The smaller clean scenario (`acme/profile-api`, "Normalize customer display names") exists to prove restraint and is used only where restraint is the point.

**Sample provenance is permanent.** Every product surface on the landing — hero fragments, evidence-chain example, product theatre, review-evolution composition — carries visible sample provenance. There is no exception for "it looks better without the badge."

---

## 3. Reference hierarchy

Four live references and four screenshot references, each with one job. They are **not** to be averaged. Where two references would pull a decision in different directions, the reference that owns that dimension wins.

| Reference | Owns | Extract | Do not take |
|---|---|---|---|
| **Littlebird** (`littlebird.ai`) — *primary* | Atmosphere, editorial pacing, whitespace, typographic scale, composed product fragments | A single enormous serif statement carrying a whole viewport; warm off-white ground that reads as paper, not as `#fff`; product shown as *fragments in a composed field* (a message card, a meeting card, a preference note) each annotated with the question it answers, rather than one screenshot; long vertical breathing room between statements | Its illustrated foliage, its whimsy, its assistant/memory framing, its floating-card scatter as a literal layout |
| **Cursor** (`cursor.com/home`) | Interactive product proof; visitor-controlled interface states | A dark product panel that behaves like the real thing — real panes, real technical text, a state the visitor can change and inspect; copy sitting *beside* the panel rather than on top of it | Its full-bleed dark page, its brand, its IDE chrome, its exact panel furniture |
| **Giga** (`giga.ai`) | Guided capability sequencing | Capabilities presented as an ordered progression with a named step at each stage, each step tied to a concrete surface rather than an icon | Its logo wall, its case-study metrics, its compliance badges, its five-step-per-feature repetition (Lintel has one five-stage chain, used once) |
| **Hex** (`hex.co`) | Concise technical copy; direct problem framing | Short declarative sentences that name the technical problem without euphemism; no adjective stacking; the problem stated before the product is named. *Note: hex.co returned HTTP 403 during R3B. This role is applied from the locked written direction, not from a live inspection. R3C must not treat this row as an inspected reference.* | Its category, its layout, its wording |
| **Aeterna** (screenshot) | Asymmetric editorial hero composition | Off-centre column weighting; eyebrow → very large serif headline → short lede → single dark pill CTA stacked tight on the left, with the visual field taking the right and bleeding past the grid | Its imagery, its ornament, its commerce chrome |
| **Vale** (screenshot) | Calm, scale, whitespace | The confidence to leave large areas empty; a hero that says one thing; a small centred announcement chip as the only element above the headline | Its centred symmetry (Lintel's hero is asymmetric), its photography, its pastel wash |
| **Runcycle** (screenshot) | Restrained dark technical atmosphere | How a dark section stays quiet: near-black ground, one structural mark, dense small technical text used as *texture* rather than as content, no glow | Its dark navigation, its full-page darkness, its mascot glyph, its floating chat pill |
| **Zuno** (screenshot) | Expansive illustrated footer | A footer that resolves into a wide illustrated landscape band; ordinary navigation sitting calmly above it; the illustration reading as printed, not rendered | Its literal landscape subject, its newsletter block, its colour, its halftone treatment as a copy target |

**Reference precedence.** Littlebird governs the page's overall feel. Where Cursor's density and Littlebird's air conflict, Littlebird wins everywhere except inside the product theatre, where Cursor wins.

---

## 4. Final light-first visual direction

**Working identity: "editorial verification instrument."** A premium engineering publication that opens, once, into a precise instrument, and then closes back into the publication.

**Locked balance.**

- Approximately **80% light editorial surface**, approximately **20% dark product theatre**.
- **Exactly one** major fully dark section: section 5, the interactive product theatre. No other section may use a full-width dark band. Small dark or graphite *records* (a code fragment, a comment shape, a terminal-like line) are permitted inside light sections and are not "dark bands."
- The footer is light.

**Light surface character — technical paper, not SaaS white.**

- **Pinned public palette.** The landing owns a light-first palette inside its public scope. Existing light application tokens may inform its values, but application theme state and OS theme preference must never invert the landing or alter its locked light/dark balance.
- Warm or neutral off-white ground; the page must never read as pure `#ffffff`.
- Dark ink typography, close to a printed graphite black rather than a pure black.
- **Precise graphite rules** as the primary structural device. Rules — not cards — separate, group and align content across the light sections. A 1px hairline doing real structural work is the page's signature.
- **Restrained interaction blue**, reserved for links, focus and interactive affordances. Blue is never decorative and never a fill for a whole surface.
- **Subtle technical texture**: paper grain, faint drafting marks, sparse halftone, low-contrast structural linework. Texture is always beneath content and never reduces text legibility.
- **Generous editorial spacing.** Section rhythm is set by vertical air, not by boxes.
- Semantic colour (warning, danger, success, information, provenance) appears only where it carries product state, and appears in its light-theme values.

**Dark product theatre character.**

- Near-black or warm graphite ground; precise hierarchy; the interaction blue and semantic state colours at product intensity; real Lintel product language (repository, PR number, run identity, finding, evidence class, clause, risk band, decision state).
- Its darkness is earned by being the one place the visitor operates the product. It must feel like arriving inside an instrument.

**Prohibited throughout.** Gradients; glows; glassmorphism; repeated dark full-width bands; generic AI imagery; excessive rounded cards; cyber-security theatre; decorative floating elements without product meaning.

**Relationship to the logged-in product.** The landing shares the product's vocabulary, state language and provenance chips so a visitor recognises the same system when they arrive at `/new` or `/workspace`. It does not share the logged-in shell, rail, dark-locked theme or Newsreader-free application typography.

---

## 5. Typography and visual-language intent

**Newsreader — editorial voice.**

- Hero statement.
- Selected major editorial headings: the verification-gap statement, the Recommendation-versus-Human-Decision statement, the final CTA statement. At most one Newsreader heading per section, and not in every section — its scarcity is what gives it weight.
- Never inside the dark product theatre (that section speaks in product type).
- Never in any logged-in surface. The `.lp` scoping that currently confines Newsreader is a hard boundary and R3C/R3D must preserve it.

**Geist Sans — the page's working voice.** Navigation, body copy, ledes, buttons, explanations, labels, captions and every public control.

**Geist Mono — technical provenance only.** Repository names, pull request numbers, commit identities and SHAs, run and report identities, evidence IDs (`E1`), finding IDs (`F1`), clause IDs (`C1`), risk values, counts presented as values, state tokens (`OPEN · BLOCKING`), and workflow identifiers. Mono is never used for prose, never for emphasis, and never to make body copy look technical.

**Scale intent (relative, not final values).** One dominant display size (hero), one large editorial size (major statements), one section-heading size, one body size, one supporting size, one micro-label size, one technical size. R3C sets values. The page should have visible jumps between levels — Littlebird's confidence comes from a wide gap between display and body, not from many intermediate sizes.

**Visual-language primitives (the page's vocabulary).**

- **Rule** — a hairline that separates or aligns; the default grouping device.
- **Record** — a bordered technical fragment carrying real product data and an identity (`F1`, `E1`, `C1`). Records are square-ish; heavy corner rounding is prohibited.
- **Chain link** — the visible connective device between chain stages. It must read as a single continuous structure, not as arrows between icons.
- **Coordinate** — a small mono line giving a section its place in the case (existing `lp-case-coordinate` is the right idea, and it survives conceptually).
- **Provenance mark** — the sample/fixture badge. Always present on product surfaces, always legible, never styled to disappear.

---

## 6. Global page rhythm

| # | Section | Surface | Newsreader | Product proof |
|---|---|---|---|---|
| 1 | Navigation | Light | — | — |
| 2 | Hero | Light, asymmetric | Yes (hero statement) | Composed fragments forming one chain |
| 3 | Verification gap | Light, editorial | Yes (gap statement) | Contrast records, no full product surface |
| 4 | Evidence chain | Light, structural | — | One worked example across five stages |
| 5 | Interactive product theatre | **Dark** | — | The principal proof; visitor-controlled |
| 6 | Review evolution | Light | — | One before/after or commit toggle |
| 7 | Recommendation vs Human Decision | Light, editorial | Yes (the statement) | Two visibly separate records |
| 8 | GitHub workflow | Light with graphite records | — | Sequence + one comment shape |
| 9 | Trust and architecture | Light, ruled | — | Four ruled principles |
| 10 | Who Lintel is for | Light, brief | — | — |
| 11 | Final CTA | Light | Yes (the statement) | — |
| 12 | Illustrated footer | Light, illustrated | — | — |

**Rhythm intent.** The page opens wide and calm (1–3), tightens into structure (4), drops once into the instrument (5), returns to light and stays there (6–11), and resolves into an illustrated scene (12). The single dark section sits at roughly the page's first third-to-midpoint so the visitor operates the product before being asked to read the trust argument. Sections 6–11 must progressively *lighten in density*, not accumulate weight, so the final CTA arrives as a release rather than as another block.

---

## 7. Detailed twelve-section information architecture

Each section documents: purpose · primary message · copy hierarchy · visual composition · product state or proof shown · interaction and motion · responsive hierarchy · capability and claim boundaries · transition in · transition out.

---

### 7.1 Navigation

**Purpose.** Orient the visitor, give them the two real actions, and stay out of the way. It is a public navigation, not the logged-in application rail.

**Primary message.** This is a serious product with a small number of real destinations.

**Copy hierarchy.** Brand mark and wordmark (left) · four in-page/section links (centre or left-adjacent) · one primary action (right).

**Destinations (locked).**

| Label | Destination | Kind |
|---|---|---|
| Lintel (brand) | `/` | Route |
| Product | Section 5, interactive product theatre | In-page anchor |
| How it works | Section 4, evidence chain | In-page anchor |
| Principles | Section 9, trust and architecture (with section 7 as its narrative partner) | In-page anchor |
| GitHub | Section 8, GitHub workflow | In-page anchor |
| Review a pull request | `/new` | Route, primary action |

No pricing, customers, company, careers, sign-in, blog or dropdown. No destination is added unless it resolves to real content. **"Explore the sample Workspace" does not belong in the navigation** — it is a hero and final-CTA action only, so the navigation carries exactly one action.

**Visual composition.** Full-width light bar on the page ground; a single bottom hairline; brand at optical left; links in Geist Sans at a small size with generous horizontal spacing; the primary action as a solid dark ink pill at the right. Height is compact. No shadow, no blur, no translucency.

**Product state or proof.** None. Navigation makes no claim.

**Interaction and motion.** Hover is a colour change only. Focus is a visible ring on every item. The bar may become sticky with a hairline that appears only once the page has scrolled past the hero; that is the only permitted state change and it is instant or a sub-140ms opacity change. No hide-on-scroll, no shrink animation, no translucency change, no scroll-spy that moves anything.

**Responsive hierarchy.** Desktop (≥ 1024px): brand, all links, action inline. Tablet (768–1023px): brand, action, and a menu toggle; links move into the menu. Mobile (< 768px): brand + toggle; the primary action moves into the opened menu as a full-width item at the bottom of the list. The menu is a panel anchored under the bar (not a full-screen takeover), opens with focus moving to the first item, traps nothing but returns focus to the toggle on close, closes on Escape and on selection, and sets `aria-expanded` on the toggle. Anchor links close the menu and then scroll. The existing `LandingNav` already implements this behaviour correctly and is the reference for R3D.

**Boundaries.** No "Sign in", no "Log in", no "Book a demo", no pricing. No theme toggle (see §13/§14 — the page is light-first and the current public toggle is retired).

**Transition in.** Page start.
**Transition out.** The navigation hairline is the top edge of the hero's field; the hero begins immediately below it with no intervening band.

---

### 7.2 Hero

**Purpose.** State the category and the thesis, show that Lintel produces a verification chain rather than opinions, and give both actions — inside one viewport on a laptop.

**Primary message.** *Agents create code. Lintel verifies what is ready.*

**Copy hierarchy.**

1. Eyebrow (Geist Sans, micro, uppercase, tracked): **ENGINEERING VERIFICATION**
2. Headline (Newsreader, display, two lines):
   **Agents create code.**
   **Lintel verifies what is ready.**
3. Supporting copy (Geist Sans, lede): *Inspect the evidence behind a change, identify missing proof, see what must be resolved before merge, and record the final human decision.*
4. Actions: primary **Review a pull request** → `/new`; secondary **Explore the sample Workspace** → `/workspace?source=fixture`.

**Visual composition.** Asymmetric on large screens: a narrower editorial column at the left (roughly 40–45% of the grid) holding eyebrow, headline, lede and actions, top-aligned rather than vertically centred; a wider composed product field at the right that may bleed past the content grid toward the viewport edge. The two are separated by air and, optionally, a single vertical hairline — not by a card boundary.

The right field holds **composed Lintel product fragments**, not one dashboard screenshot and not a single large panel. Fragments to compose from:

- pull request identity (`acme/redemption-api` · `#482` · branch)
- one observation (the HIGH finding, with its provenance label)
- one evidence state (`E1`, directly observed)
- one missing-proof record
- one requirement (`C1 · OPEN · BLOCKING`)
- the pending Human Decision plate

**The fragments must visibly form one chain.** They are connected by a continuous structural line that passes through them in chain order, so the eye reads a single record moving through five stages. Unconnected floating cards are a failure of this section. The fragments are light-surface records on the light ground, with their own hairlines and semantic state colour — they are not a dark panel.

The composition may *lean* toward the dark theatre below: the fragments may drift lower-right, the connecting line may continue past the last fragment toward the page edge, and the section's bottom edge may darken only as a hairline or a narrow graphite rule. The hero must **not** become half-dark and must **not** contain a large black application rectangle.

**Product state or proof shown.** The canonical scenario at its default state: TESTS REQUIRED, risk 46/100 medium, open blocking requirement, **no Human Decision recorded**. Sample provenance visible on the composed field.

**Interaction and motion.** Static on arrival. Permitted: a single one-time entrance in which the connecting line draws and the fragments settle in chain order, once, under 600ms total, opacity and small transform only. It must never gate readability — the server-rendered state is already complete and correct. No loop, no hover animation on the fragments, no parallax. Fragments are not interactive; the interactive proof is section 5.

**Responsive hierarchy.**

- **Desktop (≥ 1180px):** asymmetric two-column as described; whole hero readable without scrolling on a standard laptop viewport.
- **Tablet (768–1179px):** copy column first at full width; the fragment field moves below it and reflows to a horizontal or two-column chain, keeping the connective line intact. The bleed is removed.
- **Mobile (< 768px):** eyebrow, headline, lede, both actions (stacked, full-width, primary first). The fragment field follows, reduced to **three** fragments — identity, the requirement, the pending decision — arranged vertically with the connective line running down their left edge. Labels stay legible; the provenance mark stays visible; nothing important is cropped. The remaining fragments are not hidden behind an interaction — they are simply not part of the mobile composition.

**Boundaries.** No adoption, accuracy, endorsement or outcome claim. No "guaranteed", "safe", "autonomous", "enterprise". No named organisation. No logo wall. The recommendation shown must be visibly a recommendation with a pending decision. No text baked into an image where real text can be used.

**Transition in.** From navigation, immediately.
**Transition out.** The verification gap follows on the same light ground; the hero's connective line ends, and the gap section opens with air rather than with a new band. The chain's last fragment ("pending") is the unanswered note the gap section picks up.

---

### 7.3 Verification gap

**Purpose.** Establish why verification is the bottleneck, before Lintel is explained. This is the argument section; it earns the rest of the page.

**Primary message.** *Software can now be created faster than teams can verify it.*

**Copy hierarchy.**

1. Eyebrow: the section's coordinate/label (e.g. **THE VERIFICATION GAP**).
2. Statement (Newsreader, large editorial): *Software can now be created faster than teams can verify it.*
3. Supporting argument (Geist Sans, one short paragraph): a passing build does not show that a change is understood, that important failure paths were tested, or that the evidence is strong enough to merge.
4. Three distinctions, set as ruled editorial lines rather than cards:
   - Created quickly ≠ understood
   - Tests passed ≠ sufficient proof
   - Recommendation ≠ Human Decision
5. Optional: the CI-passed record contrasted with two or three named unresolved failure modes drawn from the canonical scenario (retry duplication, provider failure handling, unclear client error contract).

**Visual composition.** Editorial typography and precise rules. The statement occupies real width and vertical air. The three distinctions are separated by full-width hairlines with generous vertical padding, each line reading as an entry in a ledger — mono for the `≠` construction is permitted since it functions as a technical operator. If the CI-passed contrast is used, it is a small graphite record set against the failure-mode list, aligned to a rule, not boxed into a panel. **No grid of feature cards.** No icons.

**Product state or proof shown.** Not a product surface. If failure modes are shown they come from the canonical report's real content and carry sample provenance; they are presented as *what remains unproved*, never as Lintel output being celebrated.

**Interaction and motion.** None required. Permitted: the ruled distinctions may reveal once on entry as a short staggered opacity change; nothing moves on hover. This section must be completely comprehensible with motion disabled.

**Responsive hierarchy.** Statement first at every width. Desktop may set the supporting paragraph beside or below the statement in an asymmetric arrangement. Tablet and mobile stack: statement → paragraph → distinctions, distinctions remaining full-width ruled rows (never a horizontal scroller, never a carousel).

**Boundaries.** **No statistics.** No "X% of engineers", no time-saved figure, no adoption figure, no measured outcome — R3A forbids all of them and none exist. No implication that Lintel replaces CI, runs tests, or performs security review. The failure modes are examples from a sample change, not industry findings.

**Transition in.** From the hero's pending note: the hero showed a change waiting on proof; this section says why that waiting is now the norm.
**Transition out.** Having named the gap, the page owes a mechanism. The evidence chain answers it directly, so the two sections are adjacent with no interruption and the gap's final rule becomes the chain section's top edge.

---

### 7.4 Evidence chain

**Purpose.** Explain Lintel's model — how a finding becomes a requirement and how a requirement reaches a decision — so the product theatre that follows is legible.

**Primary message.** Proof travels with the finding, and the chain ends with a person.

**Copy hierarchy.**

1. Eyebrow: **HOW IT WORKS**.
2. Section heading (Geist Sans at editorial scale — Newsreader is not spent here): a short statement of the chain, e.g. *One record, five stages.*
3. The five stages with a one-line definition each:
   - **Change** — what the pull request actually alters.
   - **Observation** — what Lintel found, with its origin labelled.
   - **Evidence** — the supporting record behind each observation, classified as observed, inferred or missing.
   - **Requirement** — anything unproved, turned into an explicit condition to satisfy before merge.
   - **Human Decision** — the accountable engineer's recorded outcome.
4. One grounded worked example carried across all five stages (canonical scenario): finding F1 "a retry can duplicate a redemption" → evidence E1, directly observed → requirement C1, OPEN · BLOCKING → decision pending.

**Visual composition.** The chain is the section's structure, not an illustration inside it. Five stations along one continuous horizontal line (desktop), each station a stage label with its definition beneath, with the worked example appearing as a second register below the line — so the visitor reads the model on the top line and the instance on the bottom line, aligned stage-for-stage. Graphite rule work, mono identities, no icons, no numbered circles that look like a marketing process diagram.

**Product state or proof shown.** The worked example uses real engine output from the canonical scenario with sample provenance visible. The chain must display at least one open blocking requirement and one missing-proof record, so the mechanism is visible rather than abstract.

**Interaction and motion.** **Light and optional.** Focusing or selecting a stage may reveal that stage's example detail in the second register; the default state already shows the complete example for at least one stage, so nothing is hidden behind interaction. Keyboard-operable if interactive at all. This section is **not** the main demo — it must not grow a scenario switcher, a play control, or a dark panel.

**Responsive hierarchy.** Desktop: horizontal five-station chain with the example register beneath. Tablet: the chain may wrap to two rows or become vertical; the connective line must survive the change. Mobile: vertical chain, line running down the left edge, each stage a row of label → definition → its example fragment. Stage order never changes.

**Boundaries.** No implication that Lintel executes tests, enforces requirements, or clears its own requirements — requirements clear when a person supplies proof. No implication that the chain is exhaustive or that a cleared chain guarantees safety.

**Transition in.** The gap asked for a mechanism; this is the mechanism, stated abstractly and once.
**Transition out.** The chain has been explained; the visitor should now want to operate it. The section ends with a short bridge line inviting them into the product, and the page's ground darkens — a deliberate, single, unmistakable change of material into section 5.

---

### 7.5 Interactive product theatre

**Purpose.** The page's principal product proof. The visitor operates a real-shaped Lintel verification record and sees the chain move under their own control.

**Primary message.** This is what the product actually does, and you can drive it.

**Copy hierarchy.**

1. Eyebrow: **PRODUCT**.
2. A short heading and one supporting line, both in Geist Sans, set beside or above the panel — the panel is the argument, so the copy is minimal.
3. Scenario selector labels.
4. Stage labels inside the panel.
5. A provenance/boundary line: this is a landing demonstration using sample data; it does not read or write real review history.

**Visual composition.** The one fully dark section. Near-black or warm graphite full-width ground. Within it, a single product panel using real Lintel product language and real product structure — stage spine, record area, state chips, mono identities. Copy sits beside or above the panel (Cursor's arrangement), never overlaid on it. One structural mark or sparse technical linework may sit in the ground behind the panel at very low contrast; nothing floats, nothing glows.

**Stages shown inside the panel:** Change · Observation · Evidence · Requirement · Human Decision.

**Scenarios (three, visitor-selectable):**

1. **Missing tests** — the default.
2. **Provider failure** — a different failure class, showing that the record structure holds.
3. **Ready for decision** — a positive Lintel recommendation.

**Human Decision state (locked):** the Human Decision plate remains pending in all three scenarios.

**Default state (locked):** scenario 1 — recommendation **TESTS REQUIRED**, risk **46**, **four requirements open**, **Human Decision pending**.

**The "Ready for decision" scenario is load-bearing.** It must show a positive recommendation *and*, simultaneously and unmistakably, that the Human Decision is still not recorded — the decision plate stays in its pending state, and the panel offers no control that would record one. A visitor must leave this scenario understanding that Lintel reaching a favourable recommendation does not conclude anything.

**Product state or proof shown.** A dedicated **landing-page simulation** — not the production Workspace embedded, not an iframe of `/workspace`. It reuses Lintel's vocabulary, state language, chip system and record shapes so it is recognisably the same product. A compact landing-owned fixture adapter derives the scenarios at build or server time from canonical sample data and the existing report builders, then passes only the small serialisable theatre shape to the client component. Sample provenance is visible at all times.

**Interaction and motion.** See §8 for the full contract. Summary: one restrained introductory sequence on entering the viewport, five to seven seconds, no loop, permanently stopped by any visitor interaction; visitor-controlled scenario and stage selection thereafter; keyboard, touch and pointer support; reduced motion presents the final information immediately.

**Responsive hierarchy.** Desktop: copy beside the panel; the stage spine horizontal; scenario selector as a small segmented control. Tablet: copy above the panel; panel full width; spine may remain horizontal if all five stages stay legible, otherwise it becomes vertical. Mobile: heading → scenario selector → panel with a vertical stage spine, one stage's content visible at a time with the others reachable by tap or by scroll within the panel; the recommendation, the open-requirement count and the decision state must all remain visible or immediately reachable — they are the three things a mobile visitor must not miss. The panel never introduces horizontal page scroll; if the panel itself scrolls, it scrolls inside its own bounds.

**Boundaries.** No connection to production persistence. No mutation of real Workspace or report state. No control that implies merging, approving, blocking or posting. The simulated data is sample data and is labelled as such. No claim of accuracy, coverage or completeness. No implication that the demonstration reflects a customer's repository.

**Transition in.** The material changes from paper to instrument. This is the page's one permitted material shock and it should be clean — a hard edge, not a fade or a gradient.
**Transition out.** The section closes and the light paper returns, equally cleanly. The visitor has now seen one commit's record; section 6 asks what happens on the next commit, which is the natural next question after operating the panel.

---

### 7.6 Review evolution

**Purpose.** Show that Lintel is commit-aware: a review is not a one-off opinion but a record that moves as the change moves.

**Primary message.** When the change moves, the record moves with it — and you can see exactly what moved.

**Copy hierarchy.**

1. Eyebrow: **REVIEW EVOLUTION**.
2. Section heading (Geist Sans): a short statement, e.g. *The next commit changes the record, not just the score.*
3. One supporting paragraph.
4. The comparison itself, labelled: previous head → current head.

**Visual composition.** One restrained before-and-after composition, or a two-state commit toggle. Two aligned columns (previous head, current head) on the same light ground, separated by a vertical rule, with changed values marked. Commit identities in mono. Movement indicated by a small, unambiguous change mark — never by an animated counter, never by an arrow that implies improvement as a value judgement.

**Proof that may be shown.** Previous head and current head; recommendation movement; risk movement; requirements opened; requirements cleared; requirements reopened; changed findings or evidence.

**Product state or proof shown.** Two valid runs of the canonical scenario across two commits, with sample provenance. Whatever is shown must be internally consistent — if two requirements cleared, the counts must reflect it.

**Interaction and motion.** At most a two-state toggle between the previous and current head, visitor-controlled, with an instant or sub-200ms crossfade. No autoplay, no timeline scrubber, no third state. **Do not create a second full interactive application** — the toggle is the entire interaction.

**Responsive hierarchy.** Desktop: two columns side by side. Tablet: two columns, tightened. Mobile: the toggle becomes the primary control and a single column shows one head at a time with the changed values marked, or the two heads stack vertically with the changed values aligned; either is acceptable, but a side-by-side two-column comparison must not be forced into a mobile width.

**Boundaries.** No claim that risk movement measures anything beyond Lintel's own scoring. No implication that a cleared requirement was cleared by Lintel. Decisions tie to a commit *where the head is available* — if a head is not recorded, that must be shown truthfully rather than hidden.

**Transition in.** After operating one record, the visitor asks "and then?" — this answers it.
**Transition out.** Having shown the record moving, the page must state who is accountable for it. Section 7 follows directly and is the page's moral centre.

---

### 7.7 Recommendation versus Human Decision

**Purpose.** Make the boundary between Lintel's analysis and human accountability structurally undeniable.

**Primary message.**
*Lintel recommends.*
*The engineer decides.*

**Copy hierarchy.**

1. Eyebrow: **PRINCIPLES** (this is also the "Principles" navigation destination's narrative partner).
2. Statement (Newsreader, large, two lines): *Lintel recommends. / The engineer decides.*
3. One supporting paragraph.
4. Two visibly separate record columns:

| Lintel recommendation | Human Decision |
|---|---|
| findings | decision |
| evidence | rationale |
| missing proof | accepted risk |
| requirements | applicability |
| risk | recorded lineage |
| limitations | |

**Visual composition.** Two columns, deliberately **not** matched — they are different kinds of record and must not read as a comparison table of two competing products. The Lintel column is denser, more technical, mono-heavy. The Human Decision column is sparser, with more air and a clear authored quality. A strong vertical rule separates them, and the separation is the point. The statement sits above, spanning both, so the two columns read as its two halves.

**Product state or proof shown.** The canonical scenario's real recommendation content on the left, and the decision record structure on the right in its pending state, with a second small record showing what a *recorded* decision contains (actor, outcome, timestamp, accepted-risk reference, applicability). Sample provenance visible.

**Interaction and motion.** None. This section is a statement and should hold still. Optional single reveal of the two columns on entry, opacity only.

**Responsive hierarchy.** Desktop: statement, then two columns. Tablet: same, tightened. Mobile: statement, then Lintel recommendation column, then Human Decision column, with the separating rule becoming a horizontal rule and a clear label on each. The order never inverts — the recommendation is always shown first and the decision always last, because that is the accountability order.

**Boundaries (explicit prohibitions for this section).** Do not imply that Lintel approves code; that a recommendation is authority; that accepted risk is equivalent to clean approval; or that a positive recommendation guarantees safety. Do not show any control that would let Lintel record a decision. Accepted risk must always appear as an explicit, referenced, human act.

**Transition in.** Section 6 showed the record moving across commits; the obvious question is who is answerable for it.
**Transition out.** Having fixed accountability, the page can safely describe the machinery. Section 8 becomes practical: how this reaches the visitor's actual workflow.

---

### 7.8 GitHub workflow

**Purpose.** Show that Lintel fits an existing GitHub workflow, truthfully and without a second dark band.

**Primary message.** A pull request goes in; one updated decision comment comes out.

**Copy hierarchy.**

1. Eyebrow: **GITHUB**.
2. Section heading (Geist Sans): a short direct statement.
3. The truthful sequence, as five labelled steps:
   **Pull request → verified webhook → deterministic analysis → optional model context → one updated decision comment**
4. A short list of the implemented capabilities that back the sequence.
5. Boundary line naming what this is not.

**Visual composition.** **Light-first.** The sequence runs as a ruled horizontal or stepped progression on the light ground. Small graphite technical records are permitted and encouraged here — a webhook signature line, a short YAML or payload fragment, the shape of the single decision comment — each as a compact dark-on-light or graphite record, none wider than a column, none full-bleed. **No second dark band.**

**Product state or proof shown (implemented capabilities that may be named):**

- GitHub App authentication
- short-lived JWTs and installation tokens
- raw-body HMAC-SHA256 webhook verification
- timing-safe signature comparison
- idempotent event ingestion
- automated pull-request analysis
- one continuously updated GitHub decision comment
- server-side credential handling

**Interaction and motion.** Static. The sequence may reveal once, left to right, as a short staggered opacity change. The code fragments do not animate, do not type, and are not tabbed.

**Responsive hierarchy.** Desktop: horizontal five-step sequence with the technical records beneath or beside. Tablet: sequence wraps or becomes vertical. Mobile: vertical numbered sequence; technical records reduced to at most one (the decision comment shape), and any code fragment scrolls within its own container so the page never scrolls horizontally.

**Boundaries.** Present the App with its configured / not-configured status. Keep the GitHub Action **blueprint** visually and verbally separate from the App, and do not present the blueprint as production availability. Do not imply: automatic merge; enforced repository policies; production GitHub Action availability while it remains a blueprint; exact stochastic model reproducibility; automatic installation; live Slack delivery.

**Transition in.** After the accountability statement, this is the practical answer to "how does it reach me".
**Transition out.** Naming webhooks, tokens and model context raises the question of what happens to the code and the data. Section 9 answers it immediately — this adjacency is deliberate and must not be reordered.

---

### 7.9 Trust and architecture

**Purpose.** Answer the technical reader's data and reliability questions precisely, without security theatre.

**Primary message.** Deterministic first, model optional, results traceable, boundaries explicit.

**Copy hierarchy.** Four ruled principles, each a heading plus two or three short sentences:

1. **Deterministic by default** — a deterministic analysis runs first and is the safety floor; deterministic-only operation is first-class, not degraded.
2. **Optional model analysis** — a configured model can enrich the analysis; on failure, timeout or invalid output the deterministic result is retained.
3. **Traceable results** — every finding shows its origin; canonical provenance distinguishes deterministic reproducibility from model traceability.
4. **Explicit data boundaries** — where review history lives, what is excluded from it, and where credentials stay.

**Accurate boundary statements available to this section:**

- optional model output cannot silently remove known blockers or required tests;
- canonical provenance distinguishes deterministic reproducibility from model traceability;
- review history is stored on the device by default;
- raw diffs are excluded from persisted local report history;
- integration credentials remain server-side;
- the final accountable decision remains human.

**Visual composition.** Four principles as ruled editorial entries — full-width hairline above each, number or short label at the left, heading and copy in a measured column. **Not four cards in a grid.** This is the page's most text-dense light section, and its density should read as documentation, not as marketing. A link to the security model (`/docs/security-model.md`, which exists) is appropriate here.

**Product state or proof shown.** No product surface required. Provenance chips may appear inline as small examples of the labels described.

**Interaction and motion.** None beyond a single reveal.

**Responsive hierarchy.** The four principles are vertical at every width, so this section barely changes. Mobile reduces the horizontal rule inset and tightens spacing; nothing collapses or hides.

**Boundaries.** No compliance badges. No certifications. No SOC 2, SSO, RBAC or audit-log language. No unsupported security claim. Device storage is described as an architecture characteristic and never as a guarantee of privacy, security, offline operation or regulatory compliance. "Local-first" is not used as a slogan.

**Transition in.** Directly from the workflow's technical surface.
**Transition out.** With the mechanism, the accountability and the architecture established, the page can name who this is for — a short, human section after the densest one.

---

### 7.10 Who Lintel is for

**Purpose.** Let the right reader recognise themselves. Brief and editorial.

**Primary message.** This is for the people who are answerable for what merges.

**Copy hierarchy.** Eyebrow, one short heading, and three audience statements:

- teams using coding agents to produce more software changes;
- engineers responsible for deciding what reaches production;
- organisations that need evidence and explicit requirements before merge.

**Visual composition.** Three ruled lines or one short editorial paragraph set at generous scale. Deliberately the lightest section on the page in both density and weight — it exists to let the reader exhale before the final CTA.

**Product state or proof shown.** None.

**Interaction and motion.** None.

**Responsive hierarchy.** Identical at all widths; stacked.

**Boundaries.** **No persona cards.** No invented organisations, no job-title avatars, no fabricated quotations, no logo wall, no "trusted by". No adoption implication of any kind.

**Transition in.** From architecture to people.
**Transition out.** Recognition leads directly to the ask; the final CTA follows with no intervening section.

---

### 7.11 Final CTA

**Purpose.** Convert, in the page's own voice.

**Primary message.**
*Move from generated code*
*to an accountable merge decision.*

**Copy hierarchy.**

1. Statement (Newsreader, large, two lines) — as above.
2. Supporting copy (Geist Sans): *Bring one pull request into Lintel and inspect what changed, what evidence exists, what proof is missing, and what must happen next.*
3. Actions: primary **Review a pull request** → `/new`; secondary **Explore the sample Workspace** → `/workspace?source=fixture`.

**Visual composition.** Wide, calm, generous vertical air — the page's second-largest typographic moment after the hero, and its deliberate echo. Centred or left-set is an R3C decision; either way it must not be boxed, must not sit on a tinted band, and must not be a card. The section's lower edge is where the footer illustration begins to appear, so its bottom spacing is shared with the footer rather than closed off by a rule.

**Product state or proof shown.** None. **No new claim may be introduced here** — every idea in the final CTA must already have been established above.

**Interaction and motion.** Buttons have hover and focus states only.

**Responsive hierarchy.** Statement, supporting copy, then actions stacked full-width with the primary first at mobile widths. The statement's two-line break is preserved wherever the width allows and is never allowed to produce an orphan.

**Boundaries.** Both destinations exist and function today. No third CTA. No email capture. No "book a demo". No pricing. No urgency language.

**Transition in.** From audience recognition.
**Transition out.** The CTA's ground continues into the footer illustration without a dividing band — the illustration rises into the CTA's bottom margin, so the page resolves rather than stops.

---

### 7.12 Illustrated footer

**Purpose.** Close the page as an editorial scene and provide real navigation. It is not an administrative strip.

**Primary message.** The verification sequence, restated once more as an image.

**Copy hierarchy.**

1. Upper footer: Lintel brand mark and wordmark; one concise product description; navigation columns; the final product action.
2. Lower footer: the illustration band, with copyright and, where useful, a truthful local-product boundary line.

**Content (real destinations and verified landing anchors only).**

- Brand and one-line description.
- Product: Review a pull request (`/new`), Sample Workspace (`/workspace?source=fixture`).
- Reference: verified landing anchors only, plus genuine public browser routes verified during R3D. Do not list `/docs/security-model.md` unless that verification establishes it as a genuine public browser route.
- Final product action: **Review a pull request**.
- Copyright.
- Truthful boundary line where useful (for example, that review history is stored on the device by default).

**Prohibited.** Newsletter signup (there is no newsletter); social profiles that do not exist; dead links; fake status indicators; pricing or company links that do not exist; unverified application, document, local-only or boundary-bearing destinations. Every footer link must be verified live at R3D.

**Lower-footer visual intent — the evidence landscape.** The illustration band renders the verification sequence as a single continuous scene:

**change → observation → evidence → requirement → decision**

Visual language to draw from: archival engineering drawing; abstract branch and diff-like linework resolving into structured evidence; graphite and ink; restrained bronze as the single accent; sparse halftone; drafting texture. The scene should read as printed — plate-like, slightly aged, drawn rather than rendered. It is an original, layered, hand-authored SVG: it must not be generated from repository structure and must not copy reference artwork.

Composition intent: a wide horizontal band, left-to-right, in which loose diverging branch lines at the left gradually organise into ruled evidence structures in the middle and resolve into a single marked point at the right. It is one continuous drawing, not five vignettes. The navigation above sits calmly on the illustration's upper air, exactly as in the Zuno reference's arrangement — **the arrangement only; the subject, style, palette and halftone treatment must be original.** Do not literally copy the reference footer.

Legibility rule: all footer text must meet contrast requirements against whatever part of the illustration sits behind it. Where the illustration would compromise text, the illustration yields.

**Interaction and motion.** Static. The illustration never animates, never parallaxes, and never responds to the pointer.

**Responsive hierarchy.** Desktop: navigation columns in a row above a full-width illustration band. Tablet: two navigation columns; illustration band retained at reduced height. Mobile: navigation stacked; the illustration crops to its most legible segment (the resolution into a single marked point at the right) rather than being scaled down to illegibility, or is replaced by a simplified single-line variant. It is never removed entirely — the closing scene is part of the page.

**Transition in.** From the final CTA, continuous.
**Transition out.** End of document.

---

## 8. Product-theatre interaction contract

This section is binding on R3D.

**What it is.** A dedicated landing-page simulation of a Lintel verification record. It reuses the product's language, states and record structure. It is **not** the production Workspace embedded, iframed, imported or re-rendered.

**Data.** A compact landing-owned fixture adapter derives all three scenarios at build or server time from canonical sample data and the existing report builders, so the content is truthful in shape and detail. It sends only the small serialisable theatre shape to the client component; it does not expose or import Workspace persistence, decision services or storage. Sample provenance is visible in every state.

**Stages.** Change · Observation · Evidence · Requirement · Human Decision. All five exist in every scenario; a scenario may show a stage as empty or unresolved, but no stage disappears.

**Scenarios and default.**

| Scenario | Recommendation | Risk | Requirements | Human Decision |
|---|---|---|---|---|
| **1. Missing tests** *(default)* | TESTS REQUIRED | 46 | four open | pending |
| 2. Provider failure | a failure-class recommendation consistent with its findings | consistent with its findings | consistent with its findings | pending |
| 3. Ready for decision | a positive recommendation | consistent | none open, or none blocking | **pending** |

All three scenarios keep the Human Decision stage pending. Scenario 3's purpose is to prove that a positive recommendation is not a decision; no theatre control offers to record one. The only recorded-decision example belongs in section 7.

**Introductory sequence.**

- Runs **once**, when the section first enters the viewport.
- Duration **approximately five to seven seconds** total.
- It reveals the default scenario's stages in chain order, using opacity and small transform only. It reveals existing state; it never simulates processing, analysis, progress or confidence.
- **No continuous loop.** It does not restart on re-entry.
- **Stops permanently on any visitor interaction** — pointer, touch, keyboard, or focus entering the panel. On stop, the panel jumps immediately to its complete final state; it never leaves a partial state behind.
- **No fake cursor.** **No prolonged fake typing.** No fabricated agent thought stream. No progress bar.

**Visitor control.**

- Scenario selection: a labelled control with three options; selection is immediate.
- Stage selection: stages are selectable; selecting a stage shows that stage's records.
- Full **keyboard** support: the scenario control is a proper radio group or tab list with arrow-key movement and a visible focus ring; stages are focusable and operable by Enter/Space; nothing is reachable only by pointer.
- Full **touch** support: tap targets meet minimum size; no hover-only affordance carries meaning.
- Full **pointer** support: hover is feedback only, never a state change that reveals otherwise-unavailable content.
- Interaction is never required to understand the section — the default state is complete and readable on its own.

**Reduced motion.** With `prefers-reduced-motion: reduce`, the introductory sequence does not run at all. The panel presents its final default state immediately and completely. Scenario and stage switching become instant replacements with no transform travel. No information is delayed, hidden or removed.

**Persistence and safety.**

- No connection to production persistence.
- No read or write of real Workspace state, report history, decision ledgers or any storage key used by the application.
- No network request.
- No control that implies merging, approving, blocking, posting or recording a decision.

**Motion budget.** Within the V8 Motion Constitution's `narrative` class (320–480ms per transition) for the introductory sequence's individual steps, and `state` (160–200ms) for visitor-initiated changes. The five-to-seven-second total is a sequence duration, not a single transition.

---

## 9. Motion and reduced-motion contract

**Permitted across the page.**

- Subtle technical-paper grain, faint drafting marks, sparse halftone, low-contrast structural linework — all static.
- One-time reveals on section entry (opacity and small transform).
- Line drawing (the hero's connective line; the footer illustration is static).
- Restrained opacity and transform transitions on state change.
- Visitor-controlled state changes.
- Hover and focus feedback on interactive elements.

**Not permitted anywhere.**

- Gradients, glows, glass effects.
- Perpetual floating or ambient movement.
- Looping carousels or autoplaying sequences.
- Fake mouse movement; long fake typing; fabricated progress or agent activity.
- Large parallax.
- Scroll hijacking, wheel interception, forced snapping.
- Motion required to understand content.
- Texture that reduces text legibility.
- Animated counters implying live data.
- Animating width, height, `top`/`left`, broad filters, blur or shadow.

**Reduced motion.** `prefers-reduced-motion: reduce` is an authored mode, not a suppression. In it: all reveals are absent and content is present from the start; the product theatre presents its final state immediately; state changes are instant; smooth scrolling is disabled; focus indicators, semantic colour and every piece of information remain. The page must be complete, truthful and beautiful with motion fully disabled — this is a design requirement, not an accessibility afterthought.

**Static completeness rule.** The server-rendered document is the complete final state. No motion system may be responsible for making content readable, and no section may render in a state where a visitor with JavaScript disabled sees less than the full argument.

---

## 10. Responsive hierarchy

**Breakpoints (intent, not final values).** Desktop ≥ 1180px · laptop 1024–1179px · tablet 768–1023px · mobile < 768px.

**Global rules.**

- Section order never changes across widths. The narrative order is the same story on every device.
- Within a section, the copy hierarchy order never inverts: eyebrow → statement → supporting copy → proof → actions.
- The page body never scrolls horizontally. Wide content (the product panel, code fragments, the review-evolution comparison, the footer illustration) scrolls inside its own container or recomposes.
- Nothing important is hidden behind an interaction at small widths. Where a composition must reduce, it reduces by showing **fewer** elements, each complete, rather than the same elements cropped.
- On every product surface at every width, three things must remain visible or immediately reachable: the recommendation, the open-requirement state, and the Human Decision state.
- Sample provenance is never the first thing to be dropped.

**Per-section reductions** are stated in each section's contract in §7. The recurring pattern: asymmetric desktop compositions become single-column stacks with the editorial column first; horizontal chains become vertical chains with the connective line on the left edge; multi-column comparisons become a toggle or a labelled stack.

---

## 11. Product-proof and capability boundaries

**The landing may truthfully show or claim:** pull request import; deterministic analysis; optional model analysis; observations and findings; evidence and missing proof; merge requirements; recommendations; Human Decision separation; commit-aware review changes; the GitHub App workflow; verified webhooks; one updated decision comment; durable local Case Files; report history stored on the device by default.

**The landing must not claim:** production customer adoption; paying customers; user counts; guaranteed safe merges; complete defect detection; autonomous merge authority; hosted team collaboration; live Slack integration; enforced repository policies; enterprise authentication; external certifications; exact reproduction of stochastic model output.

**Qualification rules that survive into R3C/R3D.**

- The GitHub App is real *when configured* and is not configured by default; its status is always visible where it is claimed.
- The GitHub Action is a **blueprint** and must be visually and verbally separate from the App.
- Slack handoff, if mentioned at all, is copy/export only and does not send.
- Model analysis is *optional*, from a *configured* model, with the deterministic result retained as a fallback.
- Decisions tie to a commit *where the head is available*.
- Device storage is *by default*, and is never presented as a privacy, security, offline or compliance guarantee.

**Provenance rule.** Every product surface on the page carries a visible sample/fixture mark. Fixture, session and durable states are never presented interchangeably. No demo state is ever shown as a real outcome.

**Copy rule.** Terminology follows R3A §17. Avoid unnecessary hyphenated marketing compounds; keep technically necessary hyphens in identifiers and recognised terms.

---

## 12. Footer visual intent

Consolidated from §7.12 so R3C can brief the illustration without re-reading the IA:

- **Concept:** an evidence landscape rendering change → observation → evidence → requirement → decision as one continuous archival engineering drawing.
- **Composition:** wide horizontal band; loose diverging branch lines at the left organising into ruled evidence structures in the middle and resolving into a single marked point at the right; one continuous scene, not five vignettes.
- **Material:** graphite and ink line work; sparse halftone; drafting texture; restrained bronze as the single accent; printed rather than rendered.
- **Placement:** the illustration rises into the final CTA's bottom margin so the page resolves continuously; navigation and copyright sit calmly in the illustration's upper air.
- **Constraints:** static; light; legibility wins over illustration wherever they conflict; an original layered hand-authored SVG — the reference footer supplies arrangement only, never subject, style, palette or treatment. It is neither generated from repository structure nor copied from reference artwork.
- **Responsive:** crops to its most legible segment or simplifies to a single-line variant at mobile; never removed.

---

## 13. Repository findings

### 13.1 Landing route ownership

| File | Role | Lines |
|---|---|---|
| `app/page.tsx` | The entire landing page. Server component; imports the canonical mock report and derives evidence hierarchy and merge contract at module scope; renders nav, six sections and a footer. | 450 |
| `app/landing-nav.tsx` | Public navigation client component: brand, four links, theme toggle, primary action, mobile menu with Escape handling. | 76 |
| `app/landing-motion.tsx` | Landing-only narrative ownership: IntersectionObserver assigns `data-motion-state` to `[data-motion-section]` elements; authored reduced-motion branch; no loop; static DOM is the complete final state. | 105 |
| `app/globals.css` lines ~833–2876 | The entire `.lp` public layer — tokens, navigation, shared product grammar, six section layouts, responsive rules and motion selectors. Roughly **2,040 lines**. | — |

**The `.lp` scope is a genuine isolation boundary and it works.** It redeclares its own `--lp-*` variables that resolve through the semantic system, and application routes are outside it. Landing/application style isolation is currently sound and must be preserved, not re-derived.

### 13.2 Current sections versus the R3B order

| Current section (`app/page.tsx`) | R3B disposition |
|---|---|
| `lp-hero` — two-column, one large Case File dossier frame | **Rebuild.** The thesis and the real-data approach survive; the single large dossier is replaced by composed chain fragments, and the layout becomes properly asymmetric. |
| `lp-problem` (readiness gap) — "CI green does not mean the change is ready." | **Rebuild.** Becomes section 3 with the broader statement "Software can now be created faster than teams can verify it." The CI contrast survives as supporting material. |
| `lp-exhibit--finding` (Exhibit I) | **Retire as a section; preserve its content.** Its finding→evidence binding becomes part of the evidence chain (section 4) and the product theatre. |
| `lp-exhibit--contract` (Exhibit II) | **Retire as a section; preserve its content.** The merge-contract clause becomes the Requirement stage in sections 4 and 5. |
| `lp-thesis` (verification ledger + four trust records) | **Rebuild** as section 9, restructured to the four locked principles. |
| `lp-decision` (Exhibit III, human authority) | **Rebuild** as section 7 with the two-column recommendation/decision separation. |
| `lp-final` | **Rebuild** as section 11 with the new statement and corrected CTAs. |
| `lp-footer` | **Rebuild** as section 12 with the illustration band and corrected destinations. |
| *(absent)* | **New:** interactive product theatre (5), review evolution (6), GitHub workflow (8), who Lintel is for (10). |

The current page has **no** interactive product proof, **no** commit-awareness section, **no** GitHub workflow section, and **no** audience section. Adding the theatre is the single largest piece of new work in R3D.

### 13.3 CTA and copy inconsistencies with R3A

These are real defects in the current landing, and R3D must not carry them forward:

1. **Primary CTA label is wrong.** Current: "Check a pull request" (hero, nav, final). R3A locks **"Review a pull request"**. Three occurrences plus the mobile menu.
2. **Secondary CTA destination is wrong.** Current: "View the sample report" → `/report?demo=1`. R3A locks **"Explore the sample Workspace" → `/workspace?source=fixture`**. Two occurrences.
3. **Hero eyebrow is off-contract.** Current: "Engineering verification workspace". R3B locks **ENGINEERING VERIFICATION**.
4. **Hero lede is off-contract.** Current copy paraphrases; R3A's locked subheadline is the one in §7.2.
5. **Navigation destinations do not match §7.1.** Current: `#case-file`, `/report?demo=1`, `/workspace`, `/docs/security-model.md`. R3B's set is Product, How it works, Principles, GitHub, plus the action.
6. **A public theme toggle exists in `LandingNav`.** The R3B page is light-first with one deliberate dark section; a visitor-controlled dark inversion of the whole page contradicts the locked 80/20 balance and would make the theatre's material shift meaningless.
7. **Footer contains destinations that need re-verification** (`/review-operations`, `/review-policies`, `/settings`, `/slack-handoff`, `/github-action`). These routes exist, but R3A §22 requires their public presentation to carry boundary language; several are read-only or local-only surfaces that should not be presented as plain product links in a public footer.
8. **`role="img"` with a long `aria-label` on product frames, with children `aria-hidden`.** This is a defensible current pattern for a static exhibit, but the interactive product theatre cannot use it — an interactive panel must expose real, navigable semantics.

### 13.4 Motion utilities

`app/landing-motion.tsx` plus the `.lp-motion[data-motion-ready][data-reduced-motion]` selectors in `app/globals.css` (~lines 2688–2775) are the only landing motion system. It is **already correct in principle**: no keyframes, no rAF loop, no autoplay, authored reduced-motion branch, IntersectionObserver-free fallback that renders the complete state, and a static DOM that is the final state. Shared application motion tokens (`--transition-fast: 130ms`, `--transition-base: 160ms` in `app/design-system.css`) exist but the `.lp` layer does not consume them. The V8 Motion Constitution's token bands (`immediate`/`micro`/`state`/`spatial`/`narrative`) are documented but not implemented as CSS tokens anywhere.

### 13.5 Visual-lab and proof routes

`app/visual-lab/workspace-v2/` contains a decision-model lab (fixtures, decision atoms, dialogs, inspector, plate) that is **not** part of the landing and must not be linked from it. R3C must create a separate, isolated landing visual laboratory using these existing visual-lab conventions; it is lab-owned and does not alter the production landing route. `app/workspace/page.tsx` is the canonical production Workspace and supports `?source=fixture` as the explicit sample path, which is exactly what the secondary CTA needs — the destination is real and behaves correctly today. `/report?demo=1` renders the demo Case File with its demo badge.

### 13.6 Theme and typography boundaries

`app/layout.tsx` loads Geist, Geist Mono and Newsreader via `next/font`, and its bootstrap script forces dark for the logged-in `SHELL_DARK_PATHS`. **`/workspace` is not in `SHELL_DARK_PATHS`** — noted as an observation only; it is outside R3B's scope and must not be changed here. `:root[data-theme="light"]` in `app/design-system.css` already defines a warm-paper light palette (`--color-canvas: #f5f3ee`, ink `#24262a`, borders `#d8d5ce`/`#bcb8af`, interaction blue `#426f9e`) that is directionally very close to R3B's "technical paper" brief. R3C may use those values as input, but must pin landing-owned public tokens inside the landing scope so application or OS theme preference cannot invert the landing.

### 13.7 Style-isolation risks for R3C/R3D

1. **Scale.** The `.lp` layer is ~2,040 lines in a 2,876-line `globals.css`. A rebuild that edits in place risks touching application rules by proximity. Extracting the public layer into its own file is the safer path.
2. **Newsreader containment.** Newsreader currently reaches the page only through `--lp-serif` inside `.lp`. Any new public component built outside `.lp` would break that containment. R3D must keep every public surface inside one public root class.
3. **Theme dependency.** `.lp` tokens alias the global semantic tokens, which flip with `data-theme`. A light-first page whose tokens flip under a user or OS dark preference would violate the locked 80/20 balance. This must be resolved deliberately, not by accident.
4. **`html { scroll-behavior: smooth }`** is global. Anchor navigation from the public nav inherits it; reduced-motion suppression already exists and must be retained.
5. **Shared status classes.** `.lp-status--*` consume `--color-warning-soft` etc. If the public page pins its own light palette, these must resolve within the public scope rather than through the theme root.

---

## 14. Preserve, retire and rebuild recommendations

### Preserve

- **The thesis and its typographic confidence.** "Agents create code. Lintel verifies what is ready." at display scale in Newsreader is the strongest thing on the current page.
- **Real product data at build time.** Deriving the hero's content from `lib/mock-report`, `buildEvidenceHierarchy` and `buildMergeContract` means the numbers are internally consistent. Keep this approach for every product surface on the page.
- **The `.lp` isolation principle** and the Newsreader-only-in-public rule.
- **`landing-motion.tsx`'s architecture** — observer-driven section ownership, authored reduced-motion branch, no loop, complete static DOM. Extend it for the product theatre rather than replacing it with a new system.
- **The case-coordinate device** (`lp-case-coordinate`): a small mono line placing each section within the case. It is a genuinely original piece of visual language and fits the "editorial verification instrument" identity.
- **Sample-provenance marking** (`lp-sample`, `FrameHeader`) — the discipline is right; only the styling changes.
- **The skip link, focus-visible rules, and the mobile menu's Escape/focus behaviour** in `LandingNav`.
- **The verification-trace primitive** (`lp-trace`) as the conceptual basis for the chain, though its rendering is redesigned.

### Retire

- **The public theme toggle** in `LandingNav`. The page is light-first with one deliberate dark section.
- **The "Exhibit" framing** (`Exhibit I / II / III`). It reads as museum decoration rather than product proof, and R3A already flags decorative exhibit framing for retirement.
- **The single large hero Case File frame** (`lp-frame--hero`, with its `min-width: 680px` and negative-bleed width calculation). Replaced by composed chain fragments.
- **`#case-file` as the "Product" navigation destination.** Product now means the interactive theatre.
- **"Check a pull request"** as a CTA label, everywhere.
- **`/report?demo=1` as the secondary CTA.** It remains a legitimate link elsewhere but is not the secondary action.
- **The current footer's flat link strip**, and any footer link whose public presentation would need boundary language it cannot carry.
- **The dark-theme rendering of the whole landing page.**

### Rebuild

- **Hero composition** — asymmetric, fragment-based, chain-connected.
- **All section layouts** — the current six sections become twelve with different contracts.
- **The trust section** — into the four locked ruled principles.
- **The decision section** — into the two-column recommendation/decision separation.
- **The footer** — into the illustrated editorial scene.
- **The public token layer** — into the pinned light-first public palette recorded in §17.

### Build new

- The interactive product theatre (§7.5, §8) — the largest new piece.
- The review-evolution comparison (§7.6).
- The GitHub workflow section (§7.8).
- The audience section (§7.10).
- The footer illustration asset (R3C art direction; R3D integration).

---

## 15. Proposed R3C boundaries

**R3C owns:** the public visual system and detailed landing design.

**Deliverables.**

1. **Public light-first token set** — canvas, paper surfaces, ink tiers, graphite rules, interaction blue, semantic state colours in their public light values, and the dark theatre's ground and hierarchy. It is pinned within the public landing scope; existing light application tokens may inform it, but application and OS theme preferences must not invert it.
2. **Typographic scale** — concrete sizes, weights, line heights and tracking for the display, editorial, section, body, support, micro-label and technical roles, per §5's role assignments.
3. **Spacing and rhythm scale** — section padding, the vertical air between the twelve sections, the gutter, and the content max-width.
4. **The visual-language primitives** — rule, record, chain link, coordinate, provenance mark — specified as reusable visual specs.
5. **Texture specification** — paper grain, drafting marks, halftone and linework: how they are produced, at what opacity, and how legibility is guaranteed.
6. **Section-by-section composition** for all twelve sections at desktop, tablet and mobile, honouring §7 and §10 without reopening them.
7. **Hero fragment composition** — which fragments, their arrangement, and the connective line's geometry.
8. **Product-theatre visual design** — dark ground, panel structure, stage spine, scenario control, state chips, and the exact relationship to the logged-in product's appearance.
9. **Footer illustration asset and art direction** — an original layered hand-authored SVG, plus its concept, style reference and production specification. It must not be generated from repository structure or copied from reference artwork.
10. **Motion specification** — concrete durations and easings per interaction, within §9's boundaries and the V8 token bands.

**R3C must create:**

1. `docs/design/r3c-public-visual-system.md`.
2. An isolated, working landing visual laboratory using the repository's existing visual-lab conventions.
3. Non-production lab-owned components, styles and reference assets required to exercise and approve the visual system.

**R3C must not:** change section order, reopen the light-first direction or the 80/20 balance, make the hero symmetric, add a second dark band, introduce a new claim, replace or materially modify the production `/` landing route, or modify logged-in routes, the application shell or application visual tokens.

**R3C file boundaries.** `docs/design/r3c-public-visual-system.md`; an isolated landing lab under the repository's established visual-lab area; and only the lab's own components, styles and reference assets. These lab-owned files must not be imported by production routes or shared application surfaces.

---

## 16. Proposed R3D boundaries

**R3D owns:** applying the approved R3C visual system to the production `/` landing route and implementing the complete twelve-section experience.

**Likely file boundaries.**

| File | Action |
|---|---|
| `app/page.tsx` | Rewritten as the twelve-section composition. Remains a server component; continues to derive product content from `lib/` at build time. |
| `app/landing-nav.tsx` | Rewritten to §7.1's destinations; theme toggle removed; focus and menu behaviour preserved. |
| `app/landing-motion.tsx` | Extended, not replaced: retains section ownership and the reduced-motion branch. |
| **New** `app/(landing)/` components — e.g. `landing-hero.tsx`, `landing-chain.tsx`, `landing-theatre.tsx` (client), `landing-evolution.tsx` (client), `landing-workflow.tsx`, `landing-footer.tsx` | The theatre and evolution toggle are the only client components required; everything else stays server-rendered. |
| **New** `app/landing.css` (or an equivalent single public stylesheet) | The `.lp` layer extracted from `app/globals.css` and rewritten light-first. Extraction is strongly preferred over in-place editing of a 2,876-line shared file. |
| `app/globals.css` | Only the removal of the extracted `.lp` block. No application rule is touched. |
| **New** landing fixture adapter — e.g. `lib/landing-theatre-fixtures.ts` | Landing-owned. At build or server time, derives the three scenarios from canonical sample data and existing report builders, then passes only a small serialisable theatre shape to the client component. It imports nothing from the Workspace's persistence, decision services or storage layer. |
| **Approved** footer illustration asset under `public/` | Static, optimised original layered hand-authored SVG, with correct loading priority; not generated from repository structure and not copied from reference artwork. |
| `app/layout.tsx` | Metadata only, per R3A §29, if R3F does not own it. The theme bootstrap and `SHELL_DARK_PATHS` are **not** modified. |

**R3D must not:** modify the Workspace, any logged-in route, the application shell, `app/design-system.css`'s application tokens, or `app/app-shell.css`; add dependencies; embed the production Workspace in the theatre; write to any production storage key; or introduce a claim not present in R3A and R3B.

**R3D acceptance gates.** Semantic heading order with one `h1`; every interactive element keyboard-reachable with visible focus; the page complete and truthful with JavaScript disabled and with reduced motion enabled; no horizontal page scroll at any width; both CTAs resolve to working, truthful states; every footer link verified live; sample provenance visible on every product surface; production build clean.

---

## 17. Resolved implementation decisions

No direction-level questions remain before R3C.

1. **Public palette.** Pin the light-first palette inside the public landing scope. Existing light application tokens may inform it, but application or OS theme preference must not invert the landing.
2. **Footer art.** Use an original layered hand-authored SVG. Do not generate it from repository structure and do not copy reference artwork.
3. **Product-theatre fixture.** Use a compact landing-owned fixture adapter. Derive its data at build or server time from canonical sample data and existing report builders, then send only the small serialisable theatre shape to the client component.
4. **Footer destinations.** Use **Sample Workspace** → `/workspace?source=fixture`. Permit only real routes and verified landing anchors; do not list `/docs/security-model.md` unless R3D verifies it as a genuine public browser route.
5. **Recorded-decision placement.** All three product-theatre scenarios keep Human Decision pending. The recorded-decision example belongs only in section 7.

---

## 18. R3B acceptance criteria

R3B passes when:

1. The deliverable exists at `docs/design/r3b-landing-information-architecture-visual-intent.md` and is the only file created or modified.
2. R3A's positioning, capability boundaries, terminology and forbidden claims are preserved, and the product category is not reopened.
3. All twelve sections are defined in the locked order, each with purpose, primary message, copy hierarchy, visual composition, product state or proof, interaction and motion, responsive hierarchy, capability and claim boundaries, and both transitions.
4. The light-first direction, the approximate 80/20 balance, and the single-dark-section rule are stated unambiguously.
5. The navigation contract names only destinations with real purpose, with desktop and mobile behaviour including focus and menu handling.
6. The hero contract fixes the asymmetric composition, the eyebrow, headline, supporting copy and both CTAs with their routes, the chain-fragment approach, and the tablet and mobile collapse.
7. The product-theatre contract fixes the stages, the three scenarios with Human Decision pending, the locked default state, the compact landing-owned fixture adapter and serialisation boundary, the introductory sequence's duration and stop condition, the input support, the reduced-motion behaviour, and the persistence prohibitions — in enough detail for R3D to implement without embedding the application.
8. Typography roles are assigned to Newsreader, Geist Sans and Geist Mono, with Newsreader confined to the public experience.
9. Motion boundaries list what is permitted and what is not, and reduced motion is specified as an authored mode.
10. The footer's evidence-landscape concept is specified with composition, material and constraints as an original layered hand-authored SVG, neither generated from repository structure nor copied from the reference.
11. Repository findings identify landing route ownership, related components, public styles and tokens, navigation ownership, motion utilities, visual-lab boundaries, and the CTA and copy inconsistencies with R3A.
12. Preserve, retire and rebuild recommendations are explicit and actionable.
13. R3C and R3D file boundaries are proposed, including the corrected R3C visual-lab boundary: R3C creates the visual-system document, an isolated working landing lab using existing visual-lab conventions, and only lab-owned non-production components, styles and reference assets; it does not replace or materially modify the production `/` route, logged-in routes, application shell or application visual tokens.
14. Section 17 records the resolved implementation decisions, and states that no direction-level questions remain before R3C.
15. No production code, style, token, route or dependency was modified; no asset was generated; nothing was staged, committed or pushed.

*End of R3B contract.*
