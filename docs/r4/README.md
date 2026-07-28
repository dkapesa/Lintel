# R4 — Workspace Product Experience Rebuild

> **Milestone:** R4D — Core Workspace Production Upgrade
> **Status:** Canonical `/workspace` upgrade and focused visual correction implemented; production build validated; refreshed rendered review pending
> **Scope:** Index for the accepted R4A/R4B contracts, accepted R4C laboratory authority, and the contained R4D production transfer.
> **Authoritative inputs:** The accepted R4A and R4B contracts under `docs/r4/`, the accepted R4C laboratory and review package, and `R4D_CORE_WORKSPACE_PRODUCTION_UPGRADE.md`.
> **Excluded scope:** R4E deep-review interaction, command palette, general acknowledgement/waiver schemas, `/integrations`, app-wide R4 propagation, supporting-route redesign, dependencies, and new storage keys.
> **Next owning milestone:** R4E — deeper investigation and sustained review interaction.

## Contract status

R4 is selected. R4A remains the accepted authoritative foundation, R4B remains the binding information and interaction architecture, and the accepted R4C laboratory remains the visual and core-interaction authority. R4D transfers that authority into canonical `/workspace` using real production adapters and mutation contracts. It does not reopen strategy, the light application direction, visual references, the master shell, or product authority.

The governing evidence model is:

`Change → Observation → Evidence → Requirement → Human Decision`

The governing authority model is:

- Lintel recommends.
- The accountable engineer decides.
- Recommendation, review status, task progress, requirement state, accepted risk, and Human Decision remain separate records.

The governing shell is:

`Global Rail → Review Queue → Verification Workspace → Contextual Inspector`

The Workspace remains visually and operationally dominant. It contains five modes:

`Overview · Change · Evidence · Requirements · History`

There is exactly one selected review and at most one primary selected object. The Inspector derives from that context and never owns a competing selection.

## First-five-second contract

Within five seconds of opening a selected review, the engineer must understand without opening a modal or changing mode:

1. repository, PR, title, and current run/head when available;
2. Lintel recommendation and risk;
3. the highest-impact reason the review is not ready or the strongest ready signal;
4. open and blocking requirements;
5. missing/unverified and stale proof;
6. current-versus-prior movement or explicit initial/unavailable comparison state;
7. Human Decision state and applicability;
8. one next inspection target or accountable action.

Unavailable values remain unavailable in place. Fixture, inferred, previous-run, stale, session, local, Blueprint, Export-only, and unavailable states retain explicit labels.

## Contract set

### Accepted R4A foundation

| Document | Binding responsibility |
| --- | --- |
| `R4A_ENGINEER_WORKFLOW_CONTRACT.md` | Engineer intent, complete workflow, information principles, requirement truth, and Human Decision principles. |
| `R4A_REFERENCE_AND_VISUAL_SYSTEM_LOCK.md` | Bounded reference responsibilities, faithful-reconstruction rules, rejected patterns, and documentation tokens. |
| `R4A_WORKSPACE_SHELL_CONTRACT.md` | Four-region shell, dimensions, Queue, five modes, Inspector, responsive responsibility, and app-wide pattern. |
| `R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md` | Current/planned capability truth, provenance, accessibility, keyboard/focus, modal, and performance boundaries. |
| `R4A_R4B_R4C_HANDOFF.md` | Locked R4 foundation, R4B detail boundary, R4C scenario, milestone ownership, and authority transfer. |

### Binding R4B architecture

| Document | Binding responsibility |
| --- | --- |
| `R4B_WORKSPACE_INFORMATION_ARCHITECTURE.md` | Region and information ownership; Queue and modes; selection/Inspector; relationships; requirement actions; comparison; readiness; Human Decision. |
| `R4B_INTERACTION_STATE_MODEL.md` | State ownership/lifetimes; survival/reset; 14 workflow transitions; mutation transactions; non-ready/failure recovery; focus mode distinction. |
| `R4B_SCREEN_STATE_ATLAS.md` | Twenty-four labelled desktop, selection, comparison, modal, responsive, loading, unavailable, and mobile structural states. |
| `R4B_RESPONSIVE_KEYBOARD_FOCUS.md` | Breakpoint responsibilities; responsive transfer; Tab/focus order; shortcut candidates; palette; drawers/modals; announcements; scroll. |
| `R4B_ROUTE_OWNERSHIP_AND_CAPABILITY_MATRIX.md` | Five Rail areas; current/planned destinations; review-context transfer; route headers; integration and capability truth. |
| `R4B_R4C_HANDOFF.md` | Canonical fixtures, exact relationships, interaction/accessibility/responsive/stress states, screenshot package, and R4C acceptance gates. |

### R4C implementation candidate

| Document or route | Responsibility |
| --- | --- |
| `R4C_VISUAL_LAB_GUIDE.md` | Route, complete state/variant catalogue, capture mode, keyboard map, viewports, reset/storage boundary, browser results, screenshot manifest, and pending authority transfer. |
| `/visual-lab/workspace-r4` | Contained in-memory reconstruction lab for the complete future Workspace system. It is not production implementation. |
| `R4C_HUMAN_REVIEW_PACKAGE/` | Temporary untracked 28-PNG acceptance package, exact URLs, viewport/browser notes, and keyboard/focus capture instructions. |

The canonical laboratory fixture is `acme/redemption-api`, PR #482, run `run_482_03`, recommendation `TESTS REQUIRED`, risk `46/100 MEDIUM`, four open blocking requirements, and Human Decision `PENDING`. Every fixture surface retains `Controlled R4C fixture — planned R4 behaviour`.

### R4D production transfer

| Document or route | Responsibility |
| --- | --- |
| `R4D_CORE_WORKSPACE_PRODUCTION_UPGRADE.md` | Production architecture, truth boundaries, responsive behaviour, validation, known limitations, and R4E handoff. |
| `/workspace` | Canonical R4 engineering verification workstation. Real validated browser-local history is the default; fixture coverage is explicit and read-only. |
| `/workspace-v2` | Preserved compatibility and QA route using the prior production Workspace implementation. |
| `/workspace-legacy` | Preserved rollback route. |
| `R4D_HUMAN_REVIEW_PACKAGE/` | Focused 22-PNG production-route review package and validation notes. |

The R4C laboratory remains intact at `/visual-lab/workspace-r4` as the accepted comparison authority. R4D does not make production depend on laboratory fixtures or controls.

## Locked interaction architecture

- Queue groups are `Needs attention`, `In review`, `Ready`, and `Reviewed`, with deterministic priority and stable identity through filters, collapse, regrouping, and 50+ records.
- Modes are views of one selected review. Each owns one question, collection order, scroll anchor, selection rule, and empty/partial/unavailable behaviour.
- Explicit selection replaces the previous primary object. Related navigation stores one contextual return level and never creates stacked Inspector state.
- Relationship traversal uses explicit repository IDs or deterministic exact-path relationships. Unavailable, unresolved, and none-recorded states remain different. No graph canvas or workflow authoring is permitted.
- Exact canonical conditions support verified persisted clear/reopen. Derived requirements are read-only. Local task progress is not proof, resolution, acknowledgement, or waiver. Accepted risk belongs to Human Decision.
- Readiness Delta owns directional movement; Review Diff owns inspectable changed records.
- Decision readiness exposes recommendation, risk, blockers, requirements, missing/stale proof, run/head, prior decision applicability, owner, handoff state, and one next action before the modal.
- Human Decision exposes seven unselected outcomes, required rationale, references, outcome-specific acknowledgements, contained scrolling, dirty discard, stale conflict, failure recovery, duplicate prevention, verified success, and focus restoration.

## Responsive and keyboard architecture

The recommended R4C validation thresholds are Wide `≥1440px`, Normal `1280–1439px`, Narrow `960–1279px`, Tablet `640–959px`, and Mobile `<640px`. Responsive states preserve responsibility rather than compressing panels. Mobile is a functional sequence from review list to selected review to selected record or consequential action.

Core work is keyboard-complete through visible controls. Candidate shortcuts are `J/K`, `Enter`, `E`, `R`, `H`, `D`, `[`, `]`, `Cmd/Ctrl K`, and `Esc`, under the exact scope and suppression rules in `R4B_RESPONSIVE_KEYBOARD_FOCUS.md`. R4C must validate candidates in real browsers before they gain production authority. No shortcut is required.

## Route-family ownership

| Area | R4 primary destination | Supporting context |
| --- | --- | --- |
| Reviews | `/workspace` | `/new`, contextual `/report`. |
| Operations | `/review-operations` | `/team`. |
| Governance | `/review-policies` | Route-local policy/profile context. |
| Integrations | Planned `/integrations` in R4F | Configured GitHub App, `/github-action` Blueprint, `/slack-handoff` Export-only, provider link to System. |
| System | `/settings` | System/model/provider configuration truth. |

R4B creates no route. The future Integrations primary destination remains planned and explicitly non-current until its owning milestone.

## Product-truth lock

- `/workspace` defaults to real validated browser-local Report history and never silently falls back to fixture content.
- Current local history is capped at 10; R4 long-history interaction is a planned implementation requirement.
- A dedicated complete missing-proof object is planned where current data lacks one.
- Human Decision ledger events are local, append-only, identity-bound where data permits, idempotent, stale-command guarded, and verified by read-back.
- The configured GitHub App is a real environment-gated capability; GitHub Action remains Blueprint; Slack remains Export-only.
- Team/ownership is local metadata, not authenticated collaboration. Policies/settings remain conceptual or read-only where persistence/enforcement is absent.
- No visual prominence upgrades a capability.

## R4B acceptance standard

R4B is acceptable only when every region has one primary responsibility; every canonical transition defines state, focus, announcement, scroll, responsive survival, and recovery; persistent and contextual information remain distinct; one selection produces one Inspector response; unsupported actions remain truthful; failures preserve context and input; route families are coherent; and R4C can implement the laboratory without repeating reference analysis or inventing interaction rules.

The R4C authority transfer is implemented in canonical `/workspace`. The focused R4D correction replaces green application chrome with neutral charcoal/black roles, restores neutral selection and blue focus, compacts production typography/density, and distinguishes the read-only `Preview decision flow` from authoritative Human Decision recording. Workspace-local variables prepare later surface/text/border substitution without implementing dark mode. The optimized production build passes; the human-review package truthfully marks its existing captures as pre-correction until the in-app browser URL-policy block can be cleared and the corrected production route recaptured. R4E remains intentionally deferred.
