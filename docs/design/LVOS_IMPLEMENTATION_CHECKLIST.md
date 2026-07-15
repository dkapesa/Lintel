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
