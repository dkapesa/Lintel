# R5E.2H — Final Public System Freeze

## 1. Status

**Status: ACCEPTED AND COMPLETE**

**Branch:** `r5e2h-final-public-system-freeze`

**Milestone:** Phase 8H — Final public design-system freeze.

**Preceding milestone:** Phase 8G (`R5E2G_CROSS_ROUTE_PUBLIC_REVIEW.md`),
**ACCEPTED AND COMPLETE**. Zero Category C defects, zero Category D
architectural conflicts. No application, style, content or configuration
file was modified by 8G.

This is not a redesign, a feature phase, or a deployment phase. No public
surface is added. No accepted application behaviour is changed. Nothing is
staged, committed, pushed or merged by this milestone. The human owner gave
final acceptance on 8 August 2026; Phase 8H and the Phase 8 public-system
programme are formally closed.

## 2. Purpose

Phase 8H closes the Phase 8 public-system programme (8A–8G) by recording, in
one place and in the form Phase 7.1F froze the Hero, exactly what is frozen:
the accepted public route set, the accepted visual and interaction system,
the accepted navigation architecture, the accepted product-truth authority
boundaries, and the change-control rule that governs every future public
change. It carries forward — without resolving — every gate 8B through 8G
already named, and it hands off the next product programme (R6) as
explicitly separate from this freeze.

## 3. Authoritative inputs

Read in full before this freeze: `R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT.md`,
`R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`, `R5E2G_CROSS_ROUTE_PUBLIC_REVIEW.md`,
`docs/r5/README.md`, and `R5E2G_CROSS_ROUTE_PUBLIC_REVIEW_PACKAGE/PHASE_8H_HANDOFF.md`,
`CARRIED_GATES.md` and `HUMAN_ACCEPTANCE.md`. No historical visual-analysis
package was reread. No broad repository audit was performed. The current
public registry (`app/_public/routes.ts`) and route tree
(`app/(public)/**`) were inspected only as needed to verify the frozen state
described below, per Section 7.

## 4. Frozen public inventory

### 4a. Public page routes

| # | Route | Status |
| --- | --- | --- |
| 1 | `/` | Frozen — production Home, the accepted interactive demonstration |
| 2 | `/product` | Frozen — capability depth |
| 3 | `/how-it-works` | Frozen — procedural verification sequence |
| 4 | `/trust` | Frozen — evidentiary, canonical for availability and product truth |
| 5 | `/resources` | Frozen — curated discovery layer |

### 4b. Curated public documents

| # | Route | Status |
| --- | --- | --- |
| 6 | `/docs/run-lintel-locally` | Frozen — curated |
| 7 | `/docs/data-boundaries` | Frozen — curated, canonical security-model destination |
| 8 | `/docs/github-app-prototype` | Frozen — curated |

### 4c. Documentation namespace

- `/docs` is a live namespace with **deliberately no `/docs` index route.**
  `app/(public)/docs/[slug]` exists; no `app/(public)/docs/page.tsx` exists.
  `sitemapPublicPaths()` excludes the `documentation` namespace id from its
  own generic pathname list for exactly this reason.
- `/docs/security-model.md` permanently redirects (HTTP 308) to
  `/docs/data-boundaries`.
- Unknown curated slugs return a genuine 404.
- The retained uncurated blueprint (`public/docs/cli-github-action-blueprint.md`)
  remains `robots.txt`-disallowed and is not a curated route.

### 4d. Primary navigation

Frozen as exactly: **Home, Product, How it works, Trust.** Resources remains
supporting navigation, reachable from the footer and from Trust/Resources
cross-links, never from primary navigation. There is no Pricing, no
standalone Models route, no Security primary destination, no Documentation
primary item, and no mega-menu anywhere in the public system.

## 5. Frozen visual and interaction system

The accepted public system is frozen as:

1. continuous white editorial canvas;
2. Geist Sans (`--font-geist`) / Geist Mono (`--font-geist-mono`) exclusively;
3. shared shell (`app/_public/shell`) and responsive gutters at every tier;
4. restrained neutral presentation plates (`NeutralPlate`, `ProductFrame`);
5. opaque white inset product frames where already accepted;
6. no gradients, glow, glass or decorative reset anywhere;
7. no generic marketing imagery;
8. no unnecessary public animation — motion exists only inside Home's frozen
   Hero and its three product scenes;
9. normal document flow on every route;
10. no internal public-scene scrolling, other than the bounded
    `overflow-x: auto` exception for a genuine unwrappable technical
    identifier column;
11. semantic colour only for genuine product meaning (amber / orange / red /
    green / violet / blue, per the six-meaning system), never decoratively;
12. Home remains the interactive demonstration;
13. Product remains capability depth;
14. How it works remains procedural;
15. Trust remains evidentiary;
16. Resources remains the curated discovery layer;
17. Docs remain technical reading surfaces.

The frozen Home Hero and its dimension matrix (88/56/64 through the
below-360px 12/12/12 compact fallback, recorded originally in
`R5E1E5F_FINAL_SURFACE_PUBLIC_VISUAL_FREEZE.md` and re-verified unchanged at
every milestone through 8G) **remain untouched by Phase 8H.** This document
does not restate every historical implementation detail; it references the
accepted milestone documents in Section 3 and in `docs/r5/README.md`.

## 6. Frozen product-truth authority

1. **Trust owns** availability, commercial status, execution boundaries,
   model provenance, Human Decision authority and current limitations.
2. **Product owns** capability depth.
3. **How it works owns** the verification sequence.
4. **Resources owns** discovery.
5. **Curated docs own** setup/reference detail within their declared scope.
6. **Repository implementation outranks stale prose** where documentation
   conflicts with what the repository actually does.
7. **Lintel recommends; the accountable engineer decides.**
8. **Agent Change Passport declarations remain declarations, not independent
   evidence.**
9. **The GitHub App analysis path is currently deterministic-only.**
10. **Model assistance remains optional and externally configured.**
11. **A run fingerprint identifies a run; it is not cryptographic
    attestation.**

No new product-truth claim is introduced by this document.

## 7. Change control after freeze

After Phase 8H, a public visual, structural, navigation or interaction
change requires a **deliberately scoped revision** — a named milestone with
its own evidence and human gate, not a silent edit inside an unrelated
change.

Future work must **not** silently modify:

- the frozen Hero composition (hierarchy, dimension matrix, materials,
  interaction model, performance budget);
- the primary navigation architecture (Home / Product / How it works /
  Trust, Resources supporting-only);
- the cross-route visual grammar (Section 5);
- product-truth authority (Section 6);
- curated-document publication rules (the six-part curation gate in
  `R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md` §7, and the
  filesystem-scan prohibition);
- the responsive/accessibility contracts (the five-tier matrix, keyboard
  order, reduced-motion, forced-colours and no-JavaScript behaviour).

**Minor factual corrections, security fixes and deployment configuration**
may be made without reopening the entire design programme, but must preserve
every frozen contract above. A change that cannot be made while preserving
them is not minor, and requires the scoped-revision path.

**The later logged-in Workspace redesign (R6, Section 9) is a separate
programme** and must not silently reopen the public system. Public design
remains frozen while R6 proceeds.

## 8. Deployment blockers (carried, not resolved)

Phase 8H **does not resolve** these. They are carried forward exactly as
Phase 8G classified them.

| # | Blocker | Status |
| --- | --- | --- |
| A1 | Logged-in route indexability/`noindex` decision. Logged-in product routes carry no `robots` metadata today and default to indexable. | **Unresolved.** Named a pre-deployment safety task with no Phase 8 owner under current authorisation; no Phase 8 milestone, including 8H, may modify protected logged-in routes to add it. |
| A2 | Production origin / canonical / `metadataBase` configuration. | **Unresolved.** Policy is written and correctly origin-gated (verified through 8G); implementation requires a genuine deployment target. None is invented here. |

**This document must not, and does not, describe the public system as
launch-ready, production-ready, deployment-ready, or complete for
deployment** while A1 and A2 remain open. It states instead: the public
design system is frozen, the public experience is accepted, public surface
implementation is complete for the current milestone, and the system is
ready for the next product-design programme.

## 9. Non-blocking debt (carried, not resolved)

| # | Item | Classification |
| --- | --- | --- |
| B3 | Missing favicon / public-identity polish (`/favicon.ico` 404s; invisible to the rendered page and its accessibility tree). | Non-blocking polish. `public/**` remains protected scope. |
| B4 | Root `README.md` omits the Agent Change Passport. | Repository-documentation debt. Root README remains protected scope; every passport claim on Product and Trust already traces directly to `lib/change-passport.ts`, which is the accepted mitigation. |
| B5 | Other already-recorded README/repository-identity drift. | Repository-documentation debt, unchanged since 8A. |

## 10. Intentional current state

| # | Item |
| --- | --- |
| C6 | The retained uncurated CLI/GitHub Action blueprint (`public/docs/cli-github-action-blueprint.md`) remains `robots.txt`-disallowed — a deliberate, mitigated state, not a defect. |
| C7 | No `/docs` index exists — deliberate, per Section 4c. |
| C8 | Resources has no kind filter — grouped headings are the accepted composition below the scale trigger. |

## 11. Future scale trigger

| # | Trigger | Current state |
| --- | --- | --- |
| D9 | Add Resources filtering only when there are at least 8 curated documents across at least 3 genuinely useful kinds. | Not met — 3 published documents span 2 kinds (Setup, Reference). |

## 12. Repository validation

Performed as a lightweight final verification, per Section 7 of the Phase 8H
instructions — not a re-review of 8G's evidence.

```
git branch --show-current   → r5e2h-final-public-system-freeze
git status --short          → only the historical untracked *_PACKAGE/ and *_EVIDENCE/ directories; no tracked-file changes
git log --oneline -14       → 9e0d6d9 (merge: complete cross-route public review) at HEAD, full 8B–8G history beneath it
git diff --cached --name-only → empty
git diff --check            → clean
```

Confirmed directly against the current tree:

- the Phase 8G accepted merge (`9e0d6d9`) is present at `HEAD`;
- five public page routes exist under `app/(public)/`: `product`,
  `how-it-works`, `trust`, `resources`, plus Home at `app/page.tsx`;
- `app/(public)/docs/[slug]` exists and `app/(public)/docs/page.tsx` does
  **not** — no `/docs` index;
- three curated docs are registered in `app/_public/routes.ts`;
- the `/docs/security-model.md` alias remains recorded and correct (verified
  at 8G, unchanged source since);
- primary navigation labels in `app/_public/routes.ts` are exactly Home,
  Product, How it works, Trust; Resources and Documentation sit in the
  footer's "Trust and resources" group only;
- the public registry and route tree show no route beyond the eight accepted
  surfaces — no accidental new public route exists;
- no diff exists against `app`, `lib`, `public`, `package.json`, the
  lockfile or `.claude/launch.json` on this branch — no application
  implementation change has occurred;
- all thirty-four-plus historical untracked review packages remain present
  and untouched.

The complete 8G responsive/accessibility/special-state matrix was not
re-run, because repository state is unchanged since 8G's own measurement
(confirmed by the empty diff above). No typecheck or build was run for this
freeze, because 8G already supplied full build and resilience evidence
against this identical tree.

## 13. Final human acceptance

**ACCEPTED AND COMPLETE.** On 8 August 2026, the human owner accepted:

1. the frozen public inventory (Section 4) as the complete and final Phase 8
   route set;
2. the frozen visual/interaction system (Section 5) and that the frozen Hero
   remains untouched;
3. the frozen navigation architecture (Section 4d);
4. the frozen product-truth authority boundaries (Section 6);
5. the change-control contract (Section 7) as binding on all future public
   work;
6. that Sections 8–11 correctly carry forward, without resolving, every gate
   named by 8B through 8G;
7. that this document does not claim launch-readiness while A1 and A2 remain
   open;
8. the R6 post-Phase-8 handoff (Section 14) as a separate programme that does
   not reopen the public system.

The owner also confirmed that the Phase 8G accessibility and responsive
contracts are the final Phase 8 baseline. Phase 8 is formally closed. This
acceptance freezes the public experience under the change-control contract
in Section 7; it does not resolve A1 or A2 and does not authorise readiness
language prohibited by Section 8.

## 14. Post-Phase-8 handoff — R6

**R6 — Workspace Experience Refinement** is authorised as the next product
programme and is explicitly separate from this freeze.

Initial sequence:

- **R6A** — current Workspace friction audit
- **R6B** — Cursor + Mobbin reference study
- **R6C** — logged-in interaction architecture
- **R6D** — private Workspace comparison laboratory
- **R6E onward** — implementation only after those gates

Explicit statements:

1. **No immediate logged-in redesign begins in Phase 8H.**
2. **Existing Workspace behaviour and data contracts remain protected**
   through this freeze and into R6's research phases.
3. **R6 begins with research and friction analysis, not code.**
4. **Public design remains frozen while R6 proceeds**, per Section 7's
   change-control contract.
5. **Phase 8H does not begin R6.** R6 starts separately with research and
   friction analysis, while existing logged-in behaviour and data contracts
   remain protected.

## 15. What this document does not do

- Does not resolve the A1 or A2 deployment blockers.
- Does not begin R6.
- Does not stage, commit, push or merge anything.
- Does not change any application, style, content, route, dependency or
  configuration file.
