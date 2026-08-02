# R5E.1A — Implementation Handoff

Companion to `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`. Authoritative for what
each R5E.1 subphase builds, what it may not touch, what it must validate,
and the gate it must pass before the next phase begins.

Nothing below requires a further direction decision. Every open item is an
execution value, not a decision about what the page says or shows.

---

## 1. Shared constraints for every implementation phase

Binding on R5E.1B, C, D and E without restatement in each section.

**Route and file ownership**

1. All prototype work happens at the private route
   `/visual-lab/public-r5-recalibrated`, which must be `noindex, nofollow`.
   It is created by R5E.1B, not by R5E.1A.
2. Its implementation lives in a new private folder — for example
   `app/_public-r5-recalibrated/` — outside the route tree, following the
   `app/_public-r5/` precedent set by R5D.
3. `app/page.tsx` and `app/visual-lab/public-r5/page.tsx` are **not
   modified** by any phase before R5E.1F accepts a transfer. The production
   homepage keeps rendering the accepted R5E experience throughout.
4. `app/_public-r5/**` is not modified. The recalibrated implementation is a
   separate implementation, not an edit of the accepted one.
5. No dependency and no lockfile change, in any phase. Native tools only:
   `IntersectionObserver`, `matchMedia`, CSS transitions, plain DOM. A
   dependency may be proposed only after native tools have been shown
   inadequate, and only by an explicit human decision.

**Protected R4 scope — unchanged in every phase**

`app/workspace`, `app/report`, `app/new`, `app/home`,
`app/review-operations`, `app/integrations`, `app/settings`,
`app/review-policies`, `app/team`, `app/visual-lab/workspace-r4`,
`lib/workspace-v2/**`, storage schemas and keys, Human Decision logic,
product fixture values, and every R4 document. `git diff` against each path
returns empty at every phase gate.

**Product truth**

6. Frozen R4 product truth outranks public visual preference, always.
7. No invented identifier grammar
   (`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §2c.i).
8. No control for an action the demonstration cannot truthfully perform.
9. The seven canonical values never change, in any state, at any viewport.
10. Nothing is written, sent, stored, recorded or analysed.

**Documentation**

11. Each phase writes its own milestone document under `docs/r5/`. No phase
    edits an earlier accepted R5 or R4 document, including the five R5E.1A
    documents. A phase that finds a genuine defect in an R5E.1A decision
    records it in its own document and raises it for a human decision; it
    does not silently reinterpret it.
12. Each phase creates its own untracked human review package at the
    repository root, following the R5C/R5D/R5E precedent.

**Validation at every phase gate**

13. `npx tsc --noEmit` passes.
14. `npm run build` passes.
15. Browser-pane validation of the production build at all six required
    viewports: 1600×1000, 1280×800, 1024×768, 768×1024, 390×844, 320×568.
16. `document.documentElement.scrollWidth <= clientWidth` at every viewport.
17. No console error and no hydration warning on the prototype route.
18. Regression check that `/`, `/workspace?source=fixture`, `/new` and
    `/visual-lab/public-r5` still load without console errors.
19. Where the Browser pane cannot composite frames — a limitation recorded
    by R5C §12, R5D §14 and R5E §16 in this same environment — the phase
    reports the affected checks as **untested**, never as passed, and
    records exact manual steps a human can run. Do not fabricate captures.
20. No development server is left running at the end of a phase.

---

## 2. R5E.1B — Navigation, Hero and Live Shell Prototype

Model: Sonnet 5. Effort: High.

**Goal.** Prove the white canvas, final navigation, left-aligned hero,
persistent shell, PR selection, overview, finding focus and the initial
verification spine.

**Builds**

1. The private route and its metadata (`noindex, nofollow`).
2. The white canvas and the token layer, per
   `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §2 — public tokens for
   chrome, the frozen product's own tokens inside the demonstration.
3. The sticky compact header and the white footer, per
   `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §3–§5, including the anchor
   `id` values, which are then fixed for the rest of R5E.1.
4. Movement one: left-aligned hero copy block, primary and secondary
   actions, trust line, and the live product stage.
5. The persistent shell: Global Rail, Review Queue, Verification Workspace,
   Contextual Inspector, at the public-stage ranges in
   `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §6.
6. The canonical data module, typed and read-only, cross-checked against
   `lib/workspace-v2/fixture-adapter.ts`.
7. The state machine skeleton with the full state shape and event set from
   `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §4, wired for `queue`,
   `overview` and `finding` only.
8. The verification spine in its initial form, with all eight stages present
   and stages beyond `02` inactive but truthfully labelled.

**Does not build.** Evidence, missing proof, requirement, affected context,
readiness or Human Decision states; the guided/manual coordination layer
beyond what stages `01`–`02` require; any dropdown; any second public page.

**Gate**

1. Canvas is `#FFFFFF` throughout; no charcoal, band, gradient or tint. ☐
2. Navigation is exactly the five items in the navigation contract §2, all
   resolving to destinations that exist. ☐
3. The header is sticky with **zero layout movement** on state change, and
   in-page anchors are not obscured by it at any viewport. ☐
4. The hero is left-aligned and the live stage replaces the static hero
   screenshot. ☐
5. The shell shows PR #482 selected with the Overview resolved, all seven
   canonical values legible, nothing implying analysis is running. ☐
6. Selection carries a non-colour cue. ☐
7. Queue rows other than PR #482 are inert, unfocusable and not styled as
   controls. ☐
8. Contrast obligations met; tertiary text carries nothing essential. ☐
9. The server-rendered resting state is complete and truthful with
   JavaScript disabled. ☐
10. Shared constraints §1.13–§1.20 pass. ☐

---

## 3. R5E.1C — Verification Journey Prototype

Model: Sonnet 5. Effort: Extra.

**Goal.** Implement Finding, Evidence, Missing proof, Requirement, Affected
context, Readiness, guided/manual coordination, the verification spine,
keyboard behaviour and reduced motion.

**Builds**

1. States `finding` through `readiness`, with the state-to-surface mapping
   in `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §9 verified against the
   frozen product before implementation.
2. Guided advancement driven by `IntersectionObserver`, as a deterministic
   function of scroll position, with entrance motion firing at most once per
   session.
3. Manual activation for every record control, with `mode` switching to
   `manual` and guided events discarded thereafter.
4. The `Resume guided tour` / `Replay` affordance.
5. The complete verification spine, desktop and the compact mobile
   current-stage control with previous, next and expandable stage list.
6. The full keyboard model in that contract's §6a.
7. Reduced motion, CSS-first with a `matchMedia` second layer.
8. Movements two and three of the page composition.

**Does not build.** The Human Decision surface in either form; movement four
or five; any transfer to production.

**Gate**

1. All seven state invariants hold in every reachable state. ☐
2. Manual intent wins: after a manual activation, scrolling never replaces
   the selection. ☐
3. Scrolling up and down does not reset or replay the guided story. ☐
4. No wheel hijacking, snapping, scroll trapping or horizontal scroll
   theatre; touch scrolling is unimpeded. ☐
5. Every record and stage control is keyboard operable with visible focus;
   no arrow key is bound at document level. ☐
6. Focus is never moved by scroll position. ☐
7. Green appears nowhere; no stage renders complete. ☐
8. Missing proof always carries `Derived · not persisted` in the same state
   as the claim. ☐
9. With reduced motion, every state change is immediate and everything
   remains usable. ☐
10. No cumulative layout shift; the shell's height is stable across states. ☐
11. Shared constraints §1.13–§1.20 pass. ☐

---

## 4. R5E.1D — Readiness, Human Decision and Handoff

Model: Sonnet 5. Effort: High.

**Goal.** Complete readiness, Human Decision, read-only boundaries, trust
and unresolved-case continuation.

**Builds**

1. The `readiness` state in full.
2. Both Human Decision surfaces, exactly as specified in
   `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §7 and
   `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §12a: guided preview with no
   dialog semantics, manually activated dialog with full dialog semantics.
3. Movement four and movement five, including the compact trust boundary
   and the unresolved-case handoff.
4. The explicit read-only boundary copy wherever the decision surface
   appears.

**Does not build.** Any writable decision path — none exists and none may be
added; any persistence; any external write; any transfer to production.

**Gate**

1. All seven outcomes visibly unselected, `Tests required` not preselected,
   rationale empty, submit disabled, read-only boundary visible. ☐
2. The guided preview has no `role="dialog"`, no `aria-modal`, no focus
   trap, and never moves focus. ☐
3. The manual dialog contains focus, closes on Escape, and returns focus to
   the triggering control. ☐
4. Scrolling past the guided preview never captures the visitor. ☐
5. Nothing is recorded, stored, sent or written; no event in the machine is
   capable of it. ☐
6. Human Decision remains `PENDING` and readiness remains blocked in every
   state. ☐
7. Trust content makes no absolute local, privacy, safety or enterprise
   claim, and describes browser-stored data honestly. ☐
8. Shared constraints §1.13–§1.20 pass. ☐

---

## 5. R5E.1E — Full Private Recalibrated Laboratory

Model: Sonnet 5. Effort: High.

**Goal.** Assemble the accepted prototypes into one complete private public
experience.

**Builds.** One coherent page at the private route: five movements, one
persistent shell, one state machine, one canonical data module, one
navigation system, complete responsive behaviour at all six viewports,
complete accessibility, complete reduced-motion behaviour.

**Does not build.** Any production route change. Any new direction. Any new
section, reference, colour, image or motion class not already accepted.

**Gate**

1. The page reads as one investigation, not as separate presentation
   slides. ☐
2. The `Eyebrow → Headline → Paragraph → Screenshot` repetition is gone. ☐
3. All six viewports behave per
   `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §11; mobile is a deliberate
   sequential composition, not a scaled-down desktop. ☐
4. All twenty accessibility requirements pass, including 200% zoom. ☐
5. All five originality tests pass. ☐
6. Every canonical value is identical across every movement and viewport. ☐
7. Production and the existing private laboratory are untouched. ☐
8. Shared constraints §1.13–§1.20 pass. ☐

---

## 6. R5E.1F — Visual Direction Review and Freeze

Model: Opus 5. Effort: Extra.

**Goal.** Review and freeze visual identity, navigation, composition, live
demo, responsive behaviour, motion, accessibility and production-transfer
boundaries.

**Does**

1. Reviews the assembled laboratory against all five R5E.1A documents.
2. Records the frozen values that were provisional in R5E.1A: final token
   values, easing, per-interaction durations, shell region widths, spine
   treatment, anchor ids.
3. Runs the five originality tests formally and records the result.
4. Decides whether the recalibrated experience transfers to production, and
   under what conditions. **Only R5E.1F may authorise touching
   `app/page.tsx`.**
5. Records what remains deferred beyond R5E.1.

**Does not.** Redesign. Reopen a closed decision from
`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §15 without an explicit new human
decision.

---

## 7. Codex boundary

Codex may be used **after** an implementation phase, and only for focused
engineering validation, debugging, accessibility defects, hydration
problems, responsive regressions and performance investigation.

Codex must not independently redesign accepted work, change a canonical
value, alter the state model, add a dependency, touch the frozen R4 product,
or edit an accepted document.

Fast mode remains off throughout R5E.1.

---

## 8. Deferred beyond R5E.1

Carried forward and unaffected by this phase:

1. Public documentation, changelog, pricing, customer proof, an integrations
   directory and governance pages.
2. Deeper product pages and any second public route.
3. Any second canonical scenario.
4. Search, internationalisation and a public status surface.
5. A real production origin and canonical URL, deferred since R5D §5.
6. A dedicated mobile capture for Scene F, and formal pixel-accepted crop
   boundaries for Scenes B, E, F and H — relevant only to any image the
   recalibrated page still ships.
7. Onboarding and account creation. `Start a review` remains the existing
   `/new` route.
