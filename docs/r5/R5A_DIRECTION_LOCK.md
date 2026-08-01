# Lintel R5A Direction Lock

Authoritative visual direction for the Lintel public product experience.

This document supersedes the R5A proposal as the decision of record. R5B and R5C inherit it. Nothing in it may be reinterpreted without a new human decision.

---

## 1. R5A outcome

R5A is closed. The public visual identity is decided and locked.

Decided in R5A:

1. Page identity and central mechanic
2. Hero headline, hero scene and hero trust line
3. Typography families and the role of monospace
4. Colour, contrast and dark section placement
5. Canonical scenario and its resting state
6. Motion budget and the meaning of each motion moment
7. Reference responsibility hierarchy
8. Prohibited patterns

Not decided in R5A: layout composition, exact grids, exact type scale values, exact crop boundaries, component structure, implementation. Those belong to R5B and R5C.

R5A authorises no code and no repository changes.

---

## 2. Selected direction

**Precise Product Editorial: One Continuous Case.**

The public page is a single walk through one real review, from arrival to recorded decision. Editorial space frames the product. The product is never reframed.

The central mechanic is contrast: spacious, calm, predominantly light editorial presentation outside, and a dense, technical, truthful workstation inside. Every section advances the same case rather than introducing a new feature.

**The Case Record is a bounded structural treatment, not a page identity.** It is permitted only in three places:

1. The verification model section
2. The technical architecture section
3. Future deeper product pages

Explicitly rejected for the homepage: a persistent page index, and a fixed product summary band. These were the two elements of The Case Record that could later be mistaken for product behaviour. They do not appear.

---

## 3. Public visual personality

Composed, exact, unhurried and slightly austere. The page behaves like a well set technical publication that happens to contain a working instrument.

Confidence comes from restraint, alignment and pacing. Nothing on the page is decorative. Nothing is there to impress.

The defining impression to produce: a precise engineering product that makes difficult review decisions easier to understand and defend.

Premium quality is produced by spacing, typography, pacing, stability and immediate interaction. It is never produced by visual excess.

Quality calibration target: Quartr's composure with Polar's responsiveness. Calibration only. Neither site's layout, identity or section structure is copied.

---

## 4. Canonical scenario

One scenario runs unbroken across the whole public experience.

**Add fallback handling for failed discount-code retrieval.**

Fixed facts, taken from the frozen R4 product and not to be altered:

| Element | Locked value |
|---|---|
| Change | Add fallback handling for failed discount-code retrieval |
| Lintel recommendation | Tests required |
| Risk | 46/100 MEDIUM |
| Confidence | MEDIUM |
| Requirements | 4 open · 2 blocking |
| Human Decision | Human Decision pending |
| Primary finding | 01 · HIGH · Retry behaviour may create duplicate redemption risk |
| Evidence boundary | 5 canonical evidence records. 2 missing or unverified. 1 stale. |
| Next inspection | Provider failure cases absent from test suite |
| Readiness context | Merge readiness blocked. 2 blockers · 2 missing/unverified · 1 stale |

Sequence shown to the public, in the product's own order: change, finding, evidence, missing proof, requirement, affected context, readiness, Human Decision.

**The case remains unresolved throughout R5A.** Tests required stands. Human Decision stays pending. No section shows the case concluded.

No other example appears anywhere on the page.

---

## 5. Hero contract

**Headline: Know what is ready to merge.**

This is the working R5A headline. The word merge is used sparingly elsewhere: it may appear in the hero and in the readiness context that the product itself already carries. It does not lead any other section.

**Trust line: Deterministic by default. Model assistance is optional. The engineer decides.**

Set small and quiet beneath the actions. It is the hero's only trust statement. Storage and provider boundaries are deferred to the trust and architecture section.

The hero contains exactly six elements:

1. One proposition line
2. One supporting explanation of at most two lines
3. One dominant Workspace scene
4. One primary action
5. One secondary action
6. One quiet trust line

**Hero scene: a large, complete Workspace scene, not a tight summary crop.**

At rest the hero shows one clear investigation responsibility and preserves all of the following as legible:

1. The selected review title and provenance
2. The four cell summary band: Lintel recommendation, Risk, Requirements, Human Decision
3. The next inspection context
4. The primary finding
5. Evidence boundary and Requirements
6. The bottom readiness context

**Queue and Inspector are never both fully open at the same time.** The scene shows one investigation responsibility with focus, not a maximally populated interface.

The hero must be understandable with the copy removed. A reader should learn the product's job from the scene alone.

The product is never placed inside a small decorative card.

---

## 6. Typography contract

**Geist Sans and Geist Mono. No third family. No display font in R5A.**

Geist Sans carries headlines, body and interface copy. Hierarchy is produced by optical size and colour, not by many weights.

**Geist Mono is restricted to provenance.** Permitted uses only:

1. Run identifiers, head and branch
2. File paths
3. Stage numbers and section numbers
4. Identifiers and technical metadata

Prohibited monospace uses: headlines, body prose, marketing labels, navigation, buttons, and any decorative or texture role.

Body copy sits at a comfortable reading measure of roughly 60 to 70 characters. Uppercase micro labels in wide tracking are permitted as section eyebrows, matching the product's own label grammar. No letterspaced headlines. No italic flourishes.

Exact scale values are an R5B decision. The families and the monospace restriction are not.

---

## 7. Colour and contrast contract

Page ground: warm neutral. Product surfaces: white, sitting on that ground with a fine one pixel border. Primary type: charcoal. Secondary type: warm grey.

Structure is made from fine borders, not from shadows and not from large radii.

**Semantic colour belongs to the product.** It appears only with the meanings R4 already assigns:

1. Ochre for recommendation and attention
2. Red for high findings and blocking counts
3. Green for cleared and ready

No public brand accent is introduced. No gradient. No colour that competes with product semantics.

**Two charcoal sections maximum, placed at:**

1. The verification model responsibility
2. The trust and architecture responsibility

Dark is a change of register at a change of responsibility. It is never decoration and never spreads across the page.

---

## 8. Page spacing and rhythm

Generous outside. Compact inside. This contrast is the direction and must not be softened.

Desktop:

1. Wide outer margins
2. Single content column of roughly 1200 pixels
3. Product scenes permitted to break wider to roughly 1360 pixels
4. Vertical rhythm of roughly 140 to 180 pixels between responsibilities

**Public spacing never leaks into product scenes.** If a product scene has been given breathing room to look attractive, it is wrong.

Rhythm across the eight responsibilities in narrative order: hero, verification problem, verification model, Investigation Workspace, missing proof and requirements, readiness and Human Decision, trust and architecture, final action.

Emphasis alternates rather than repeating uniform blocks: a wide product scene, then a narrower explanatory passage, then a product scene again. Each section carries a small numbered eyebrow so the page reads as one sequence.

No feature card grid anywhere on the page.

---

## 9. Product scene contract

The product is the proof. Every responsibility is explained with a real region of the frozen R4 interface showing real record text.

Rules:

1. Real Workspace regions, cropped by responsibility. Never a full screenshot dump, never an abstract render.
2. Scenes sit as white surfaces with a fine border and very slight elevation, in a light frame that does not imitate a browser chrome.
3. The four cell summary band is the recurring anchor. It appears in the hero and reappears at readiness so the reader learns one summary grammar. It is not a fixed page element.
4. Genuine text and genuine states only. No invented labels, no rounded corners added, no shadows added, no recoloured states, no simplified band.
5. No floating fragments, no tilted perspective, no device mockups.

The public page may crop and frame. It may not restyle.

---

## 10. Verification model treatment

The verification model section is the one place where The Case Record grammar is fully expressed.

Treatment:

1. Numbered record structure, monospace stage numbers, hairline rules as the structural device
2. Charcoal section, one of the two permitted dark sections
3. The eight stage sequence preserved in order: Change, Finding, Evidence, Missing proof, Requirement, Affected context, Readiness, Human Decision

Simplifying the Review Map for public legibility is permitted. Reordering it, merging stages, dropping missing proof or affected context, or implying relationships the product does not assert is not permitted.

The trust and architecture section inherits the same restraint at lower density.

No other section adopts this grammar.

---

## 11. Motion contract

**Three motion moments only across the entire page.**

1. A review enters the Queue and becomes the active investigation.
2. Evidence connects to the finding, missing proof becomes visible, and the related requirement follows.
3. The Human Decision surface opens with no outcome selected.

**No requirement clears during the canonical story.** The case ends R5A unresolved, with Tests required standing and Human Decision pending.

Motion character:

1. Opacity and small translation only
2. Roughly 180 to 260 milliseconds, ease out
3. Scroll triggers fire once and never on re-entry
4. All content readable before any motion runs
5. Every state legible in its resting form under reduced motion

Motion may open the Human Decision surface. **Motion may never complete a decision.**

The page must be fully understandable with motion disabled.

---

## 12. Mobile interpretation

Mobile inherits the product's own rule: one responsibility at a time.

1. Product scenes switch to the genuine mobile product views for queue and record. Desktop layouts are never shrunk into narrow columns.
2. Where a desktop scene has no mobile equivalent, it becomes a horizontally scrollable region with a visible stage index, not a squeezed column.
3. Section spacing compresses to roughly half.
4. The hero keeps the same six elements and shows the mobile queue view.
5. No fixed summary band and no persistent index on mobile, consistent with the desktop decision.

---

## 13. Reference responsibility hierarchy

Each reference owns one responsibility. They are not combined equally. No reference is added during R5B or R5C without explicit permission.

| Reference | Owns | Never taken |
|---|---|---|
| Cursor | Hero confidence, product prominence, concise introductory copy, visual ambition, willingness to make the interface the main proof | Its hero composition, typography, dark identity, agent positioning, animation, product breadth |
| incident.io | Page structure, narrative clarity, responsibility based sections, product explanation, operational credibility | Its branding, navigation, illustration system, customer proof, sales model, enterprise claims |
| Littlebird | Product scene continuity, restrained motion, transitions between product states, progression through one workflow | Its consumer tone, rounded softness, assistant framing, device compositions, exact motion, typography |

Quality calibration only, never a direction: Quartr for composure, Polar for responsiveness.

Excluded from R5A, R5B and R5C unless explicitly reintroduced: Vercel and Attio.

---

## 14. Premium quality standard

Quality is judged on:

1. Spacing discipline and consistent vertical rhythm
2. Exact alignment and optical correctness
3. Typographic restraint and legible measure
4. Stability. Nothing shifts, jumps or reflows after load
5. Immediate interaction response
6. Real product text at readable scale
7. Pacing. Each responsibility lands before the next begins

Quality is never sought through added visual effect, additional colour, additional motion or additional ornament.

The failure mode to guard against is not ugliness. It is genericness. The mitigations are scale, specificity and real record text.

---

## 15. Protected R4 boundaries

The frozen R4 product is authoritative. The public experience frames and explains it. It never silently redesigns it.

Not to be changed or reinterpreted:

1. Workspace anatomy
2. Review Queue responsibility
3. Contextual Inspector responsibility
4. Findings
5. Evidence semantics
6. Missing proof semantics
7. Requirements semantics
8. Readiness semantics
9. Human Decision authority
10. Operational and administrative shell distinctions
11. Route and storage contracts
12. Responsive responsibility transfer
13. Existing keyboard foundations
14. Existing accessibility foundations

Human Decision is never shown as resolved by Lintel. Recommendation and decision are always visibly separate, with no outcome preselected.

Public structural inventions must never be capable of being mistaken for product behaviour. This is the reason the persistent index and fixed summary band were rejected.

---

## 16. Copy principles

Clear sentences. Clean punctuation. No dash heavy construction.

Preferred vocabulary: verification, readiness, evidence, proof, requirement, review, change, decision, accountable engineer, investigation.

Used sparingly and only where they add precision: merge, local, AI, agent. The word local does not lead the product identity.

Never claimed: autonomous approval, guaranteed safety, hosted organisation accounts, shared team collaboration, repository enforcement, cloud synchronisation, available enterprise controls, existing customer adoption, external writes that do not exist, pricing for undelivered capabilities.

Never used: magical, seamless, revolutionary, ten times better, fully safe, automatic certainty, intelligent platform, agentic in every section.

Browser stored data is never presented as organisation wide data. Future capabilities are never presented as available today.

The copy is confident because it is precise.

---

## 17. Prohibited patterns

1. Purple AI gradients
2. Glowing orbs
3. Decorative particles
4. Fake terminal typing
5. Fake cursor movement
6. Floating cards without product meaning
7. Excessive rounded surfaces
8. Heavy shadows
9. Constant parallax
10. Animated headline gimmicks
11. Fake customer logos or fabricated metrics
12. Dark developer tool styling across the whole page
13. A literal copy of any reference website
14. Abstract AI artwork replacing the real product
15. A generic feature card grid as the main narrative
16. A persistent public page index
17. A fixed public product summary band
18. A display typeface
19. Monospace used as prose or decoration
20. Motion that delays readable content or that does not name a product event

---

## 18. Decisions deferred to R5B

R5B composes the page within this lock. It decides:

1. Exact type scale, line heights and the optical size steps
2. Exact grid, column and breakpoint values
3. Exact crop boundaries for each of the eight responsibilities
4. Section by section copy, within the copy principles
5. Numbered eyebrow treatment and section labelling
6. Primary and secondary action wording and placement
7. Composition of the verification model record section
8. Composition of the trust and architecture section
9. Mobile scene selection per responsibility
10. Placement of the three motion moments within the page

R5B may not change direction, headline, trust line, typefaces, dark section count or placement, motion count, or the canonical scenario's resting state.

---

## 19. Decisions deferred to the R5C visual laboratory

R5C prototypes and proves execution. It resolves:

1. Exact easing curves and durations within the stated range
2. Scroll trigger thresholds and one time firing behaviour
3. Reduced motion resting states for each motion moment
4. Product scene frame treatment, border weight and elevation value
5. Warm neutral ground and charcoal section colour values
6. Geist Sans and Geist Mono rendering, weights and optical tuning
7. Performance budget and load stability
8. Accessibility verification of contrast, focus order and keyboard behaviour
9. Horizontal scroll behaviour and stage index on mobile
10. Fidelity check of every scene against the frozen R4 screenshots

R5C may not introduce new visual language, new colour, new motion moments or new references.

---

## 20. R5A acceptance checklist

R5A is accepted when every item below is true of this document.

1. One direction is selected and no alternative remains open.
2. The Case Record is bounded to the verification model, technical architecture and future deeper pages.
3. No persistent page index and no fixed product summary band appear anywhere in the public experience.
4. The hero headline is Know what is ready to merge.
5. The hero trust line is Deterministic by default. Model assistance is optional. The engineer decides.
6. The hero scene is a large complete Workspace showing one investigation responsibility, with Queue and Inspector never both fully open.
7. The six preserved hero scene elements are named.
8. Typography is Geist Sans and Geist Mono only, with monospace restricted to provenance.
9. Exactly two charcoal sections are placed, at the verification model and trust and architecture.
10. Semantic colour is limited to the product's ochre, red and green meanings, with no public accent introduced.
11. Exactly three motion moments are defined, each naming a product event.
12. No requirement clears in the canonical story. Tests required stands and Human Decision remains pending.
13. The canonical scenario's locked values match the frozen R4 product.
14. All fourteen protected R4 boundaries are restated and unmodified.
15. Reference responsibilities are unchanged and no reference has been added.
16. No code was written and the repository was not edited.
17. R5B and R5C scopes are separated and neither can reinterpret the central visual identity.
