# R6H accepted evidence — Requirements and Verification Relationships

## Independent review result

Independent reviewer: Sonnet 5, High effort.

Verdict:

> ACCEPT R6H WITH NON-BLOCKING FOLLOW-UPS
>
> READY TO FREEZE R6H
>
> R6H READY TO FREEZE

Blockers: none. Required corrections before freeze: none.

The reviewer independently verified the exact 10 modified existing plus 11 new path scope, nothing staged, HEAD/main alignment, canonical `RequirementView` truth without a second Requirement model, and the bounded production, validation, responsive, focus, Inspector, relationship, and action-registry contracts. This included no `conditionProgress` or `finding.action` exposure; exact grouping/precedence; Requirement selection/detail; one Inspector; no Change Inspector; surgical Evidence evolution; raw-ID non-disclosure; no Back; no new R6C or workspace-v2 contract; and honest evidence classification.

## Accepted product result

R6H provides a real Requirements Review mode from canonical `RequirementView` only, with Remaining, Stale, Satisfied, and Inactive or unavailable groups; duplicate Requirement identity defence; bounded selection/detail; no selection-driven Inspector opening; and explicit Requirement inspection.

There remains one contextual Inspector, now with Requirement and Finding projections while preserving R6G Evidence Inspector semantics. Evidence, Requirement, and Finding relationships are wired for traversal; Change relationships remain inert for R6I. Internal `ContextRef` targets stay separated from visible/accessibility text, exact targets are deduplicated, and raw IDs are never rendered.

Traversal uses the existing R6C state machine: it leaves `primarySelection` untouched, grows the internal-only `relationshipTrail`, and uses the existing Inspector focus-region architecture after success. R6H adds no Back, breadcrumb, or forward UI; no R6C schema/reducer/state changes; no workspace-v2 changes; and no responsive geometry.

## Action registries

The production registry is exactly 10 actions:

1. `route/navigate`
2. `route/apply`
3. `queue/set-manual-preference`
4. `queue/show-narrow-surface`
5. `review/select`
6. `mode/activate`
7. `selection/set`
8. `inspector/open`
9. `inspector/close`
10. `inspector/traverse-relationship`

`inspector/replace-context` remains unbound. The historical R6D registry remains exactly four actions.

## NATIVE EXTERNAL RECORDING EVIDENCE

An externally inspected continuous Chrome recording exists: `Lintel — engineering verification for pull requests - Google Chrome 2026-08-12 14-17-57.mp4`.

It demonstrates the native current-adapter workflow: Requirements mode, populated register, Requirement selection, bounded detail, no selection-driven Inspector opening, explicit `Inspect relationships`, Requirement Inspector and standing, one contextual Inspector, coherent selection-versus-Inspector behavior, explicit primary-object Inspector replacement, no Back/breadcrumb UI, and stable browser presentation.

The recording remains external acceptance evidence: it will be attached directly to independent Sonnet review and is intentionally neither copied nor committed to this repository, following the R6G large-MP4 follow-up. The reviewer could not play the MP4 in its environment and did not frame-inspect it.

## DETERMINISTIC / SOURCE EVIDENCE

Independent review inspected all five R6H tests and judged them substantively dense rather than shallow. Their coverage includes Requirement grouping and precedence, source order, duplicate defence, open-and-stale truth, Requirement/Finding projections, forbidden-field absence, selection route freedom, selection/Inspector independence, traversal application, trail growth, same-context no-op, A→B→A cycle safety, relationship target deduplication, internal target retention, visible/accessibility raw-ID non-disclosure, and exact current/historical action registries.

The inherited source and validation contracts additionally establish Review-switch clearing, same-Review preservation, traversal target re-proof, unchanged primary selection during traversal, and unavailable traversal behavior. For unavailable traversal targets specifically, correctness is supported by source inspection: the target is re-proved through `resolveContext`, an unavailable result leaves state unchanged, and no substitution occurs. There is not a dedicated executed regression case for that behavior.

## NOT PRODUCIBLE HONESTLY IN CURRENT NATIVE DATA

The current real adapter data exposes no genuine traversable Evidence/Finding/Requirement edge. The recording therefore does not prove `inspector/traverse-relationship`, multi-hop traversal, trail growth, cycles, Finding traversal, Requirement → Evidence/Finding traversal, or Evidence → Requirement/Finding traversal. These remain deterministic/source evidence. The current native data also does not produce every Requirement status group; no relationship edge or status state was fabricated.

## Native production build

The exact accepted candidate passed the native Windows PowerShell production build: Next.js 16.2.9 compiled successfully in 3.2s, completed TypeScript in 8.5s, generated 47/47 static pages, and exited 0. Independent Sonnet review also reproduced `npm run build`, 47/47, exit code 0, and independently verified TypeScript with no diagnostics. The earlier Codex Google Fonts networking failure is superseded by these successful builds; production source has not changed, so no build was rerun for this reconciliation.

## Accepted non-blocking follow-ups

### NB-H1 — unavailable traversal-target executable regression coverage

Unavailable traversal-target behavior is source-inspected and judged correct, but lacks a dedicated executable regression case dispatching `inspector/traverse-relationship` against a fabricated/nonexistent `ContextRef` and asserting `status === "unavailable"` with unchanged state. This is a regression-coverage gap, not a product-correctness blocker, and is deferred to a later verification-hardening pass.

### NB-H2 — theoretical Change-context Inspector fallback

A theoretical `ContextRef` with `kind === "change"` falls through to existing unavailable/default Inspector behavior rather than a dedicated Change surface. It is unreachable through R6H UI because Change relationships are inert. This is deferred directly to R6I, which owns Change/diff and future Change Inspector semantics.

## Scope and freeze status

The accepted scope remains exactly 10 modified existing paths plus 11 new paths, for 21 literal R6H paths. No recording is present in the repository, and no final evidence path beyond this document was added.
