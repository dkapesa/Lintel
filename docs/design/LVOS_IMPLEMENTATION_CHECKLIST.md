# LVOS v1.0 implementation checklist

Paste this checklist into every visual milestone prompt. Replace bracketed fields before implementation.

## A. Mandatory prompt header

> Lintel follows LVOS v1.0. Do not propose or implement an alternative visual direction. Use the approved page archetype for this route. Preserve the global shell, semantic tokens, typography, spacing, record grammar, inspector rules and responsive transformations. New visual primitives require explicit approval.

## B. Pre-implementation declaration

- [ ] Approved page archetype: [A, B, C, D or E; or named system layer].
- [ ] Exact routes and regions changing: [list].
- [ ] Exact regions untouched: [list].
- [ ] Existing components reused: [list].
- [ ] Desktop composition: [state panes, order and measures].
- [ ] Intermediate-width transformation: [900–1179px behaviour].
- [ ] Mobile transformation: [below 900px behaviour].
- [ ] Data states displayed: [loading, empty, error, populated, selected and stale as applicable].
- [ ] Interactions preserved: [list].
- [ ] LVOS rules applied: [specific sections].
- [ ] Explicit non-goals: [list].
- [ ] Acceptance criteria: [observable checks].

## C. Visual compliance

- [ ] One stable shell; route uses the declared archetype without mixing or inventing another.
- [ ] Type roles follow LVOS; no text below 10px, application weight above 600, decorative mono, or application serif.
- [ ] Neutral planes, typography, alignment and hairlines establish hierarchy; no more than two bordered containment levels.
- [ ] Semantic colour appears only when interpretation changes, always with a text label, and uses the fixed role mapping.
- [ ] Records, lists and tables share aligned columns, identifiers and rule-separated groups; rows do not become action walls.
- [ ] One inspector per surface; selection context remains visible; actions sit in the inspector or correct decision region.
- [ ] Dark and light themes preserve the same hierarchy, dimensions and behaviour.
- [ ] Desktop, intermediate and mobile transformations are deliberate; navigation, inspectors, drawers and sheets follow LVOS.
- [ ] Keyboard, focus, contrast, labels, landmarks, touch targets and reduced-motion parity are verified.
- [ ] Motion, if any, explains verification state and uses LVOS timing; it is not ambient decoration.
- [ ] Website and application use truthful shared terminology, sample data, trace semantics, statuses and materials.

## D. Permanent prohibitions

- [ ] No route-specific visual identity; generic KPI dashboard; glass card; gradient or glow as structure; new non-semantic colour; sub-10px text; weight above 600; more than two bordered nesting levels; card for every concept; readiness gauge or donut; queue-row action wall; complexity-hiding tab; product philosophy inside working surfaces; fake metric, customer or testimonial; decorative AI imagery; contradictory website mockup; or feature without an approved archetype home.

## E. Completion gate

A milestone is not complete merely because it builds or works. It must have:

- [ ] Correct archetype and immediately clear hierarchy.
- [ ] No legacy visual dialect and no unapproved primitive.
- [ ] Deliberate desktop, intermediate and mobile behaviour.
- [ ] Coherent dark and light appearance.
- [ ] Unchanged product semantics, data continuity and preserved interactions.
- [ ] Browser validation of representative states.
- [ ] Passing TypeScript check and production build.

## F. LVOS-6 final approval record

The reusable checklist above remains unchanged for future milestones. This completed record applies specifically to **LVOS-6 — Website and Product Continuity**.

- [x] Approved layer: normative public website movements using the shared Archetype C verification case.
- [x] Scope remained bounded to `/`, landing navigation/footer, public product exhibits and continuity documentation.
- [x] `/report` changes on the branch were treated as corrective LVOS-5 alignment changes, not new LVOS-6 scope.
- [x] Existing page sequence, wording, canonical sample data, interactions and responsive composition were preserved.
- [x] The seven normative website movements remain represented; Movement 6 is intentionally carried within Movement 4 as the accepted sequence interpretation.
- [x] Website and application use the same canonical report identity, finding/evidence/contract relationships, terminology, trace states, status grammar and Human Decision state.
- [x] B1 passed: Risk, Requirements and Conditions remain visible and contained at 1180px and 1024px in dark and light.
- [x] B2 passed: the four product-section headings compute at weight 550 and no public-website weight exceeds 600.
- [x] B3 passed: the hero is the sole elevated product frame; finding, contract and decision frames have no light-theme shadow; open and pending trace states are neutral; the pending decision diamond has no red halo.
- [x] Exactly three approved Newsreader moments remain and no text is below 10px.
- [x] Dark/light verification passed at 1440px, 1180px, 1024px and 390px with identical geometry and no page-level horizontal overflow.
- [x] Mobile navigation, Escape/focus return and theme controls remain functional.
- [x] `/report?demo=1` and `/workspace` remain operational with no new console errors.
- [x] No motion, animation, component, dependency, route, data or product-functionality scope was introduced.
- [x] `git diff --check`, TypeScript and the production build passed.
- [x] Exit record, typography adoption decision and AU-11 closure are recorded.
- [x] Final verdict: **APPROVED**; no LVOS-6 blocker remains.

## G. LVOS-7 final approval record

This completed record applies specifically to **LVOS-7 — Cross-System Final Audit and Consolidation**.

- [x] LVOS v1.0 remained normative; no archetype, visual direction, motion, dependency or product behaviour was introduced.
- [x] All ten in-scope routes passed the 1440px dark/light availability, typography, navigation, overflow and console matrix.
- [x] `/`, `/workspace`, `/report?demo=1`, `/settings` and `/review-operations` passed the 1024px and 390px dark/light matrices.
- [x] No rendered text is below 10px and no rendered weight is above 600.
- [x] Newsreader appears only in the three approved public moments; application routes use no serif.
- [x] Mono candidates are limited to genuine technical values; `/new` decorative mono and legacy title/weight rules were corrected.
- [x] Verification trace wording remains visible and consistent through Human decision.
- [x] No page-level horizontal overflow or clipped meaningful content remains.
- [x] Mobile Case File buttons, selects, disclosures and labelled selection controls meet the 44px interaction floor after correction.
- [x] Shell drawer, Case File decision sheet and landing menu Escape/focus restoration passed; source inspection confirms trapping, inert/scroll handling and restoration mechanics.
- [x] No duplicate React-key warning or application console error appeared.
- [x] Proven zero-consumer shell, Workspace, report and administrative selector generations were removed; live and uncertain compatibility ownership was retained.
- [x] Dark/light hierarchy and material parity passed without gradients, glows or decorative topology.
- [x] The landing Merge Contract semantic-colour mismatch is corrected: blocking-open uses warning, generic open uses neutral text, and danger remains reserved for verified harm.
- [x] Website and `/report?demo=1` Merge Contract semantics agree; the final semantic-colour gate passed in dark and light.
- [x] Product data, report generation, persistence, actors, metrics and decisions remain unchanged.
- [x] `git diff --check`, TypeScript and the production build passed.
- [x] The final audit, closure register, roadmap, typography ledger and documentation index were updated.
- [x] Final LVOS-7 verdict: **APPROVED**; no architectural or system blocker remains.
- [x] Final LVOS v1.0 verdict: **APPROVED AND CLOSED**; the next programme is Visual Convergence, beginning with VC-1 Workspace and Command-Centre Refinement.
