# R5 — Public Homepage Direction

This directory holds the R5 authoritative documents and milestone records for
the Lintel public homepage direction.

## Reading order

1. [`R5A_DIRECTION_LOCK.md`](./R5A_DIRECTION_LOCK.md) — the locked visual
   direction: Precise Product Editorial, One Continuous Case. Typography,
   colour, motion budget, reference hierarchy and prohibited patterns.
2. [`R5B_LANDING_PAGE_ARCHITECTURE.md`](./R5B_LANDING_PAGE_ARCHITECTURE.md) —
   the accepted page architecture: eight-section narrative, working copy,
   scene map, responsive rules and motion placement, composed inside the R5A
   lock.
3. [`R5B1_SCENE_RESOLUTION_ADDENDUM.md`](./R5B1_SCENE_RESOLUTION_ADDENDUM.md) —
   canonical product scene sources and crop resolutions, including the
   accepted Scene C crop boundary. Where its product-scene detail differs
   from R5B's working copy, this addendum is authoritative.
4. [`R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md`](./R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md) —
   the implementation of the accepted direction at the private
   `/visual-lab/public-r5` route.
5. [`R5D_PRODUCTION_HOMEPAGE_TRANSFER.md`](./R5D_PRODUCTION_HOMEPAGE_TRANSFER.md) —
   transferring the accepted R5C implementation onto the production
   homepage (`/`) without redesign, via a shared implementation at
   `app/_public-r5/`.
6. [`R5E_PUBLIC_MOTION_SYSTEM.md`](./R5E_PUBLIC_MOTION_SYSTEM.md) —
   attaching the three accepted, restrained motion moments
   (`queue-entry`, `evidence-to-requirement`, `decision-surface-open`) to
   the shared implementation, as progressive enhancement over the
   already-complete server-rendered page. Accepted and closed.

None of the five prior documents (R5A, R5B, R5B.1, R5C, R5D) were edited to
produce R5E. They remain the decision of record.

## R5E.1 — public recalibration

R5E.1 is a deliberate recalibration of Lintel's public visual identity,
composition and interactive product storytelling, begun after R5E closed.
Its locked direction is **Cursor's product-led composition and motion
discipline, translated through Lintel's verification model and enterprise
engineering identity**, on one continuous white canvas, with a live
read-only product demonstration replacing screenshot-led storytelling.

R5E.1A is documentation only. Its five documents are read in this order:

7. [`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`](./R5E1A_SYSTEM_AND_INTERACTION_LOCK.md) —
   the top-level lock: central direction, source authority, the numbered
   supersession record, the white canvas lock, the persistent Workspace
   shell, the verification spine, guided/manual precedence, motion,
   five-movement composition, responsive contract, accessibility,
   performance and product-truth boundaries, and the R5E.1 subphase
   contract.
8. [`R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md`](./R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md) —
   public navigation, destinations, sticky header and footer contracts,
   the future dropdown rule and navigation accessibility.
9. [`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`](./R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md) —
   the canonical read-only demonstration, its typed state model, event set,
   invariants, guided/manual coordination, data source, no-JavaScript
   resting state and Human Decision surface semantics.
10. [`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`](./R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md) —
    the single public token registry, contrast obligations, semantic
    colour, typography, image policy, the Cursor/Skybase reference boundary
    and the originality tests.
11. [`R5E1A_IMPLEMENTATION_HANDOFF.md`](./R5E1A_IMPLEMENTATION_HANDOFF.md) —
    R5E.1B–F scope, deliverables, boundaries, validation duties and
    acceptance gates.
12. [`R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md`](./R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md) —
    the first R5E.1 implementation slice: private prototype route, white
    canvas, navigation, left-aligned hero, the stable live Rail/Queue/
    Workspace/Inspector shell, PR #482 selection, Workspace overview, first
    finding focus, and the initial verification-spine treatment.
13. [`R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md`](./R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md) —
    the second R5E.1 implementation slice, extending R5E.1B's private
    prototype: Evidence, Missing proof, Requirement, Affected context and
    Readiness states; guided `IntersectionObserver` scroll advancement with
    manual-intent precedence; the complete eight-stage verification spine;
    the `Resume guided tour` affordance; the full keyboard model; two-layer
    reduced motion; movements two and three of the five-movement page
    composition.
14. [`R5E1D_HUMAN_DECISION_TRUST_AND_HANDOFF.md`](./R5E1D_HUMAN_DECISION_TRUST_AND_HANDOFF.md) —
    the third R5E.1 implementation slice, extending R5E.1C's private
    prototype: the eighth working verification stage (Human Decision), the
    guided non-modal preview and the manually activated dialog with the
    frozen product's own seven outcomes, decision-readiness content, the
    compact trust boundary and the unresolved-case handoff, completing
    movements four and five of the five-movement page composition.

No earlier R5 or R4 document was edited to produce R5E.1A. Where R5E.1A
deliberately changes an earlier public visual decision, the change is
recorded as a numbered supersession in
`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §3, with a per-area supersession
table at the head of each companion document.

## Authority order for product-scene detail

1. Frozen production product truth
2. `R5B1_SCENE_RESOLUTION_ADDENDUM.md`
3. `R5B_LANDING_PAGE_ARCHITECTURE.md`
4. `R5A_DIRECTION_LOCK.md`

This order governs product-scene detail only. It does not permit any R5
milestone to reopen the accepted visual direction or page architecture.

## Authority order for R5E.1

1. Frozen R4 product truth
2. The five R5E.1A documents, for public visual identity, composition,
   navigation and public interaction
3. `R5B1_SCENE_RESOLUTION_ADDENDUM.md`, for any product-scene source detail
   still in use
4. `R5A_DIRECTION_LOCK.md`, `R5B_LANDING_PAGE_ARCHITECTURE.md`, R5C, R5D and
   R5E, for everything R5E.1A does not supersede

Frozen R4 product truth always outranks public visual preference.

## Milestone status

- R5A — visual direction: locked.
- R5B — page architecture: accepted.
- R5B.1 — canonical scene capture: accepted.
- R5C — private public visual laboratory: implemented at
  `/visual-lab/public-r5`, described in
  [`R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md`](./R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md).
- R5D — production homepage transfer: implemented. The accepted R5C
  implementation now renders at `/` (indexable) via a shared
  `app/_public-r5/` implementation also used by the now-thin
  `/visual-lab/public-r5` (noindex) route. Described in
  [`R5D_PRODUCTION_HOMEPAGE_TRANSFER.md`](./R5D_PRODUCTION_HOMEPAGE_TRANSFER.md).
- R5E — public motion system: implemented, accepted and closed. The three
  accepted motion moments are attached to the shared `app/_public-r5/`
  implementation via one client boundary (`MotionController`), as
  progressive enhancement over the unchanged, complete server-rendered
  page. Described in
  [`R5E_PUBLIC_MOTION_SYSTEM.md`](./R5E_PUBLIC_MOTION_SYSTEM.md), with human
  visual acceptance recorded 2 August 2026.
- R5E.1A — system and interaction lock: documentation only, complete. The
  five documents listed above freeze the system and interaction contract
  governing all later R5E.1 implementation. No component, style, route,
  asset or dependency was created or modified.
- R5E.1B — navigation, hero and live shell prototype: implemented at the
  private route `/visual-lab/public-r5-recalibrated`
  (`app/_public-r5-recalibrated/`), human visual acceptance recorded
  2 August 2026. Described in
  [`R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md`](./R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md).
- R5E.1C — verification journey prototype: implemented at the same private
  route, extending R5E.1B's shell with the Evidence, Missing proof,
  Requirement, Affected context and Readiness states, guided/manual
  scroll coordination, the complete verification spine and movements two
  and three of the page composition. Human visual acceptance recorded
  2 August 2026. Described in
  [`R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md`](./R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md).
- R5E.1D — readiness, Human Decision, trust and handoff: implemented at the
  same private route, extending R5E.1C's shell with the eighth working
  verification stage (Human Decision), the guided non-modal preview and the
  manually activated dialog, the compact trust boundary and the
  unresolved-case handoff, completing movements four and five of the page
  composition, pending human review. Described in
  [`R5E1D_HUMAN_DECISION_TRUST_AND_HANDOFF.md`](./R5E1D_HUMAN_DECISION_TRUST_AND_HANDOFF.md).
- R5E.1E–F — not started. Scope, boundaries and acceptance gates are in
  [`R5E1A_IMPLEMENTATION_HANDOFF.md`](./R5E1A_IMPLEMENTATION_HANDOFF.md).
  The production homepage at `/` and the private laboratory at
  `/visual-lab/public-r5` continue to render the accepted R5E experience
  until R5E.1F authorises a transfer.

See `R5E_PUBLIC_MOTION_SYSTEM.md`'s deferred-work sections and
`R5E1A_IMPLEMENTATION_HANDOFF.md` §8 for what remains open beyond these
milestones.
