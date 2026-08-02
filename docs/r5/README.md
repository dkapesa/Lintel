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
6. [`R5E_PUBLIC_MOTION_SYSTEM.md`](./R5E_PUBLIC_MOTION_SYSTEM.md) — this
   milestone: attaching the three accepted, restrained motion moments
   (`queue-entry`, `evidence-to-requirement`, `decision-surface-open`) to
   the shared implementation, as progressive enhancement over the
   already-complete server-rendered page.

None of the five prior documents (R5A, R5B, R5B.1, R5C, R5D) were edited to
produce R5E. They remain the decision of record.

## Authority order for product-scene detail

1. Frozen production product truth
2. `R5B1_SCENE_RESOLUTION_ADDENDUM.md`
3. `R5B_LANDING_PAGE_ARCHITECTURE.md`
4. `R5A_DIRECTION_LOCK.md`

This order governs product-scene detail only. It does not permit any R5
milestone to reopen the accepted visual direction or page architecture.

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
- R5E — public motion system: implemented. The three accepted motion
  moments are attached to the shared `app/_public-r5/` implementation via
  one client boundary (`MotionController`), as progressive enhancement over
  the unchanged, complete server-rendered page. Described in
  [`R5E_PUBLIC_MOTION_SYSTEM.md`](./R5E_PUBLIC_MOTION_SYSTEM.md).

See `R5E_PUBLIC_MOTION_SYSTEM.md`'s deferred-work sections for what remains
open beyond this milestone.
