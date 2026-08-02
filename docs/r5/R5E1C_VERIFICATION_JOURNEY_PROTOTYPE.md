# R5E.1C — Verification Journey Prototype

Branch: `r5e1c-verification-journey-prototype`
Status: implementation prototype at a private route. No production route, no
accepted R5 or R4 document, no R5E.1A or R5E.1B document was modified.
Owning phase: R5E.1 — deliberate recalibration of Lintel's public visual
identity, composition and interactive product storytelling.

R5E.1A is accepted and closed
(`docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`, human acceptance recorded
2 August 2026). R5E.1B is accepted and closed
(`docs/r5/R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md`, human visual
acceptance recorded 2 August 2026). R5E.1C extends R5E.1B's accepted
implementation at the same private route.

This is not the complete recalibrated homepage. It proves the central
verification journey and defers the rest to R5E.1D–F.

---

## 1. Purpose and scope

R5E.1C proves Lintel's central verification mechanism inside the persistent
product shell R5E.1B built:

1. the working states Evidence, Missing proof, Requirement, Affected
   context and Readiness, extending R5E.1B's Overview and Finding;
2. guided scroll advancement through the canonical investigation, driven by
   `IntersectionObserver`, as a deterministic function of scroll position;
3. manual activation for every record control, with manual visitor intent
   overriding guided choreography;
4. the `Resume guided tour` affordance;
5. the complete eight-stage verification spine, desktop and a compact
   mobile current-stage control with previous/next navigation;
6. the full keyboard model for the working stages;
7. reduced motion, CSS-first with a `matchMedia` second layer;
8. movements two ("verification gap") and three ("follow the verification
   record") of the five-movement page composition.

It does not build the Human Decision surface in either form, movement four
or five, or any transfer to production. Those remain assigned to R5E.1D–F.

---

## 2. Authoritative inputs

Read before implementation, in this order:

1. `docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
2. `docs/r5/R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md`
3. `docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
4. `docs/r5/R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`
5. `docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md`
6. `docs/r5/R5E1B_NAVIGATION_HERO_LIVE_SHELL_PROTOTYPE.md`
7. `docs/r5/README.md`
8. the existing `app/_public-r5-recalibrated/**` implementation (read in
   full before any edit)
9. `lib/workspace-v2/fixture-adapter.ts` (frozen canonical fixture,
   `case482`), read in full for findings, evidence, requirements,
   readiness and context
10. `app/workspace/WorkspaceR4Client.tsx`, read for the genuine derivation
    rules behind "4 open · 2 blocking" (`openRequirements` excludes only
    `satisfied`/`accepted`/`invalidated`/`superseded` statuses, so the
    `stale` `req_latency_budget` counts as open) and "2 missing/unverified·
    1 stale" (`incompleteEvidence`, evidence `stale` flag), so no displayed
    count in this prototype is invented or approximated
11. `docs/r4/R4A_WORKSPACE_SHELL_CONTRACT.md` and
    `docs/r4/R4B_RESPONSIVE_KEYBOARD_FOCUS.md`, for R4 shell/responsive
    truth this phase must not contradict

No broad repository audit was conducted. No R5E.1A or R5E.1B document, no
earlier accepted R5/R4 document, was edited.

---

## 3. Implementation architecture

All work is inside the existing private folder and route from R5E.1B; no
new route was created.

```
app/_public-r5-recalibrated/
  R5RecalibratedPrototype.tsx      page composition (server component) — extended
  canonical-review.ts              typed, read-only canonical data module — extended
  demo-reducer.ts                  full state model — extended
  prototype-content.ts             nav/hero/trust/journey copy — extended
  public-r5-recalibrated.module.css — extended
  components/
    PublicPrototypeHeader.tsx      unchanged
    LiveReviewStage.tsx            extended: guided controller, reduced-motion layer, full dispatch surface
    GlobalRail.tsx                 unchanged
    ReviewQueue.tsx                unchanged
    VerificationWorkspace.tsx      extended: five new panels
    ContextualInspector.tsx        extended: five new panels
    VerificationSpine.tsx          extended: stages 03–07 interactive, mobile prev/next, Resume guided tour
    VerificationJourneyNarrative.tsx  new — server-rendered movement two/three narrative
```

`app/visual-lab/public-r5-recalibrated/page.tsx` (the route wrapper) was not
modified — it already imports `R5RecalibratedPrototype` and needed no
change.

---

## 4. Canonical product data

One typed, read-only module, `canonical-review.ts`, extended with five new
exports, each cross-checked against `lib/workspace-v2/fixture-adapter.ts`
(`case482`) on 2026-08-02:

| Export | Frozen fixture source | Values |
|---|---|---|
| `PRIMARY_EVIDENCE` | `case482.evidence[0..1]` | `ev_retry_path` (confirmed), `ev_no_idempotency_key` (present) — full statement/provenance/source, not just the title/status pair R5E.1B's Finding panel needed |
| `MISSING_PROOF_RECORDS` | `case482.evidence[2]`, `[3]` | `ev_coverage_gap` (missing, affects `req_test_provider_failure`, blocking·open), `ev_error_shape_inferred` (unverified, affects `req_api_error_contract`, advisory·open) |
| `STALE_EVIDENCE` | `case482.evidence[4]` | `ev_prior_load_test` (stale, affects `req_latency_budget`, advisory·stale) |
| `BLOCKING_REQUIREMENT` | `case482.requirements[0]` | `req_test_idempotency` — blocking·open, `supportingEvidenceIds: []` in the frozen fixture (no evidence yet proves idempotency, which is itself why it remains open) |
| `AFFECTED_FILES` | `case482.changedFiles` | the four genuine changed files with additions/deletions/risk |
| `AFFECTED_CONTEXT_SUMMARY` | derived narrative, no new fact | restates the same files/finding relationship already in the module |
| `READINESS` | `case482.readiness.readiness` | classification `improved`, `58→46` (`-12`), `clearedCount: 2`, `becameStaleCount: 1`, the fixture's own note, plus the frozen `2 blockers · 2 missing/unverified · 1 stale` and `Merge readiness blocked` values from `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §2 |

No disagreement was found between these values and the frozen fixture; none
was corrected.

### 4a. The missing-proof → requirement relationship, resolved honestly

`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §9 locks the missing-proof
stage's records as `ev_coverage_gap`/`ev_error_shape_inferred` and the
requirement stage's record as `req_test_idempotency`. In the frozen
fixture these are **not** a single evidentiary chain: `ev_coverage_gap`
genuinely blocks `req_test_provider_failure` (not `req_test_idempotency`),
and `req_test_idempotency` genuinely has zero supporting evidence of its
own. Rather than fabricate a false direct link, this prototype presents
both relationships as they truly exist: the Missing proof panel states
which requirement each gap actually affects (using the fixture's own
`supportingEvidenceIds` reverse relationship), and the Requirement panel
states that `req_test_idempotency` remains open because no evidence yet
satisfies it — a fact drawn directly from the fixture's empty
`supportingEvidenceIds` array, not invented. The stage-to-stage narrative
progression is a curated tour through one review's records in the
product's own stage order, not a claim that every stage's record is a
logical premise for the next.

### 4b. No invented identifiers

Only the genuine stage numbers `01`–`08` and the fixture's own internal
keys (`ev_retry_path`, `req_test_idempotency`, …) are used, as state keys
and, where the frozen product itself displays that class of information,
as content. No `EV-07`/`MP-02`/`REQ-04` form, and no new sequential
identifier scheme, was introduced (`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`
§2c.i).

---

## 5. State model

`demo-reducer.ts` is rewritten to the full shape from
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §4, with the R5E.1C event set
added:

```ts
type DemoStage = "queue" | "overview" | "finding" | "evidence"
  | "missing-proof" | "requirement" | "affected-context" | "readiness"
  | "human-decision";
type DemoMode = "guided" | "manual";
type EventSource = "guided" | "manual";

type DemoEvent =
  | { type: "SELECT_REVIEW"; source: EventSource }
  | { type: "SHOW_OVERVIEW"; source: EventSource }
  | { type: "FOCUS_FINDING"; source: EventSource; recordId: string }
  | { type: "OPEN_EVIDENCE"; source: EventSource; recordId: string }
  | { type: "OPEN_MISSING_PROOF"; source: EventSource; recordId: string }
  | { type: "OPEN_REQUIREMENT"; source: EventSource; recordId: string }
  | { type: "OPEN_AFFECTED_CONTEXT"; source: EventSource }
  | { type: "SHOW_READINESS"; source: EventSource }
  | { type: "RESUME_GUIDED" }
  | { type: "RESET_DEMO" };
```

`human-decision` remains part of the typed stage union so R5E.1D can extend
this reducer without rebuilding it; no event in this file can reach it.

### 5a. Event origin model

The task brief for this phase names three origins — `guided`, `manual`,
`system`. The authoritative, closed `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`
§4b defines exactly two: `EventSource = "guided" | "manual"`, with
`RESUME_GUIDED` and `RESET_DEMO` carrying no source field because they are
"always visitor-initiated." Per `R5E1A_IMPLEMENTATION_HANDOFF.md` §1.11, a
phase that finds a discrepancy with a closed R5E.1A decision records it
here and does not silently reinterpret the lock. This implementation uses
the frozen two-origin contract exactly as written: `demoReducer` in
`demo-reducer.ts` type-checks `EventSource` as `"guided" | "manual"` only,
and `RESUME_GUIDED`/`RESET_DEMO` carry no `source` field, matching §4b
verbatim.

### 5b. Helper functions

`eventForWorkingStage(stage, source)` builds the correctly typed event for
any of the seven working stages, so the guided controller, the
verification spine, the Workspace panels' "next" actions and the mobile
previous/next control all dispatch identically shaped events for identical
intent — satisfying §6a.5, "activation by keyboard and by pointer produce
identical state," extended here to cover activation by scroll as well.
`workingStageFor(stage)` maps a `DemoStage` back to its `WorkingStage` (or
`null` for `"queue"`/`"human-decision"`), used by the spine's active-item
highlight and the guided-entrance tracker.

---

## 6. Transition table and invariants

| Event | Resulting `stage` | `activeRecordId` |
|---|---|---|
| `SELECT_REVIEW` | `queue` | review key |
| `SHOW_OVERVIEW` | `overview` | review key |
| `FOCUS_FINDING` | `finding` | `finding_retry_idempotency` |
| `OPEN_EVIDENCE` | `evidence` | `ev_retry_path` |
| `OPEN_MISSING_PROOF` | `missing-proof` | `ev_coverage_gap` |
| `OPEN_REQUIREMENT` | `requirement` | `req_test_idempotency` |
| `OPEN_AFFECTED_CONTEXT` | `affected-context` | `null` |
| `SHOW_READINESS` | `readiness` | `null` |
| `RESUME_GUIDED` | unchanged | unchanged; `mode` → `guided`, `lastManualStage` → `null` |
| `RESET_DEMO` | `queue` | full return to `INITIAL_DEMO_STATE` |

Two rules apply to every stage-moving row, implemented in one place
(`demoReducer`, not duplicated in the guided controller or any component):

1. A manual event sets `mode` to `"manual"` and records `lastManualStage`.
2. A guided event is discarded outright while `mode === "manual"` — not
   queued, not deferred, not replayed later. `demoReducer` returns the
   exact same state object reference in this case (no new object is
   allocated), which is itself a cheap, correct way to guarantee no
   re-render occurs from a discarded guided event.

### 6a. Invariants verified

All seven invariants from
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §4d hold by construction and
were directly exercised by a standalone unit test (§28 below):

1. The canonical values are a separate, `as const` module never read from
   `stage` — verified structurally: `DemoState`'s keys contain no
   recommendation/risk/requirement/decision field.
2. `decisionSurface`/`decisionSurfaceOrigin` are present in the type but
   unreachable in R5E.1C (no event sets them) — deferred to R5E.1D.
3. (Same as 2; not yet applicable.)
4. `mode === "guided"` implies `lastManualStage === null` — true in the
   initial state and restored by every `RESUME_GUIDED`.
5. `activeRecordId`, when non-null, is always a canonical fixture key —
   every `eventForWorkingStage` branch uses a key imported from
   `canonical-review.ts`, never a literal string composed elsewhere.
6. No event can set, clear or record a Human Decision outcome — no such
   event exists in the R5E.1C event union.
7. No event writes to storage, network, or any surface outside the
   demonstration — confirmed by code inspection (zero `localStorage`,
   `fetch`, `XMLHttpRequest` calls anywhere in
   `app/_public-r5-recalibrated/**`) and by live `read_network_requests`
   / `localStorage` inspection during browser validation (§28).

---

## 7. Persistent shell

The four-region hierarchy `Global Rail → Review Queue → Verification
Workspace → Contextual Inspector` R5E.1B built is unchanged in composition
and unchanged in its own internal responsive breakpoints
(`.stageGrid`'s `@media (max-width: 1279px)` / `(max-width: 1023px)` /
`(max-width: 767px)` rules are untouched). Two changes support the journey
without altering that internal grid:

1. `.stageGrid` moved from `min-height: 520px` to a fixed `height: 560px`
   (`height: auto` restored under 767px, matching R5E.1B's mobile stack),
   with `overflow-y: auto` added to `.workspace` (already present on
   `.queue`/`.inspector`). This makes the shell's total height constant
   across all nine stages — Readiness and Affected context have more
   content than Overview — satisfying the explicit requirement that "the
   shell occupies a stable, bounded region whose height does not change
   between states" (`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §8b.4)
   and the R5E.1C gate item "No cumulative layout shift; the shell's height
   is stable across states."
2. The shell became `position: sticky` at `min-width: 1024px` (§9 below).

Across every one of the nine reachable states: PR #482 remains selected,
repository/title/branch/head remain stable, `Tests required` / `46/100 ·
MEDIUM` / `4 open · 2 blocking` / `PENDING` render identically (confirmed
live in the browser at every stage transition exercised), the Rail stays
on `Reviews`, the two Queue context rows stay inert, no loading state or
analysis simulation appears anywhere, and no content frame is ever replaced
by a screenshot. Only the active stage, the active record, the Workspace
focus and the Inspector content change.

---

## 8. One shell, no duplicate DOM: the sticky mechanism

Movement three requires "one persistent shell" that "follows" the guided
stages. The shell was not duplicated (prohibited by
`R5E1A_IMPLEMENTATION_HANDOFF.md` §1 shared constraints and by this
phase's own §21 instruction against "rendering seven complete duplicate
product shells"), and it was not squeezed into a narrow sidebar column,
which would have forced its internal four-region grid — sized for the full
`.wrap` width — to break under a viewport-media-query mismatch (the internal
grid's breakpoints respond to viewport width, not container width, so a
narrow sidebar would silently overflow at wide viewports where the internal
breakpoints don't fire).

Instead, `<LiveReviewStage/>` and `<VerificationJourneyNarrative/>` are
siblings inside one shared parent, `.journeyColumn`:

```
.journeyColumn
  .stageSticky      → <LiveReviewStage/>   (position: sticky at ≥1024px)
  .journeyNarrative → <VerificationJourneyNarrative/>
```

CSS `position: sticky` keeps an element pinned for the full scrollable
height of its parent's box. Because the narrative is a later sibling
within the *same* parent as the sticky shell — not nested inside a
separately-scoped `#how-it-works` section — the shell remains pinned near
the top of the viewport for the narrative's entire height, releasing
naturally once `.journeyColumn` ends (there is no movement four/five
content yet, so it releases at the top of the `#trust` section). The shell
stays at its full, already-accepted width throughout; only its vertical
position changes.

Sticky is disabled (`position: static`) below `1024px` — the same
breakpoint where the shell's own internal grid already reflows to a
two-row layout — because a sticky, taller two-row shell pinned over a long
narrative would consume most of a tablet or mobile viewport, which
`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §11 and this phase's own responsive
section both prohibit ("no sticky shell when it harms usability").
Confirmed live: `position: sticky` at 1600×1000, 1280×800 and 1024×768;
`position: static` at 768×1024, 390×844 and 320×568.

`#product` remains on the hero copy; `#how-it-works` moved to the first
narrative block (the movement-two "verification gap" copy, which also
carries `data-verification-stage="overview"` so scrolling back up from
Finding returns the shell to its Overview state rather than leaving it
stranded). Both anchor targets carry `scroll-margin-top: var(--header-h)`
so the sticky header never obscures them.

---

## 9. Verification spine

`VerificationSpine.tsx` renders all eight genuine product stages. Stages
`01`–`07` are semantic `<button>`s, each an independent tab stop carrying
`aria-pressed` — the same simple-native-button pattern R5E.1B used for
`01`–`02`, deliberately not a roving-focus composite
(`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §6a.2 prefers simple buttons
"unless a composite gives a clear accessibility benefit"; at seven items a
composite adds risk — arrow-key semantics, `Home`/`End` scoping — without a
clear benefit over plain Tab). `08 Human Decision` renders as visible,
readable, non-interactive content — not `aria-hidden`, not a disabled
button, confirmed via a live `document.querySelectorAll('button')` count
showing zero buttons contain "Human Decision" while the text "08 Human
Decision … Pending" is present in `document.body.innerText`.

No completion tick, no green, anywhere. Only the single active stage
carries a non-colour emphasis marker (a border-top colour step plus text
colour, matching R5E.1B's existing pattern) — confirmed by code: the
active-state CSS rule touches only `border-top-color`/`color`, no fill, no
icon.

### 9a. Mobile compact control

Below 767px, `.spineList` (the full eight-item list) is hidden and
`.spineCompactBar` (hidden above 767px) shows instead: a live `NN of 08 ·
<Stage name>` label plus `← Previous`/`Next →` buttons that step through
`WORKING_STAGE_ORDER`, disabled at the two ends. Verified live at 390×844
and 640×800: clicking `Next →` from Evidence moved the compact label to
`04 of 08 · Missing proof`, and the boundary buttons correctly disable at
Overview and Readiness.

---

## 10. Finding state

Unchanged from R5E.1B in content and behaviour; the panel and Inspector
code were re-keyed by stage (`key={stage}`) to participate in the same
panel-entrance treatment the five new states use, with no change to what
they render. `FindingPanel` now offers one working next action, "Inspect
evidence," in place of R5E.1B's dead-end finding view.

---

## 11. Evidence state

`EvidencePanel` in `VerificationWorkspace.tsx` shows both canonical
evidence records supporting the primary finding
(`PRIMARY_EVIDENCE`: `ev_retry_path` confirmed, `ev_no_idempotency_key`
present) with their full statement, provenance and source, plus the
evidence-boundary sentence. It states explicitly that nothing shown is
newly collected or verified. The Inspector shows each record's status and
which finding it supports, plus the evidence-boundary summary and
provenance identity. No requirement is implied cleared; no new evidence
identifier is invented. Next action: Missing proof.

---

## 12. Missing-proof state

`MissingProofPanel` shows both derived missing-or-unverified records
(`ev_coverage_gap` missing, `ev_error_shape_inferred` unverified), each
carrying a `Derived · not persisted` tag in the same card as the claim
(satisfying gate item 8: the qualifier "always carries `Derived · not
persisted` in the same state as the claim"), the genuine requirement each
one affects (per §4a above — the real relationship, not an invented one to
`req_test_idempotency`), and a quiet "Evidence that remains available"
list restating the primary finding's two confirmed/present records for
contrast. Amber is used only on the two gap cards' status word, the
`Derived` tag and the card's amber-tinted border/background — not the
Inspector, not the spine, not any other region of the interface. Red is
not used here (neither gap is itself "genuinely blocking" in the sense
§3 of the visual-system lock reserves for red — the blocking state belongs
to the *requirement* they affect, shown one stage later). Next action:
Requirement.

---

## 13. Requirement state

`RequirementPanel` shows `req_test_idempotency` — the genuine requirement
tied to the primary finding — with its statement, its `blocking · open`
badge (red, permitted here because this requirement genuinely is
blocking), the finding it follows from, and its `evidenceRequired` text.
A plain-language note states explicitly that no automated completion
occurs and that the recommendation/risk shown in the band above are
unchanged. The Inspector adds the required proof, the contributing
finding, and the review-level `4 open · 2 blocking` context. No decorative
connecting line exists anywhere; the relationship reads through shared
structure (the same card layout, the same "follows from" phrase pattern
used across states) rather than a drawn line or graph. Next action:
Affected context.

---

## 14. Affected-context state

`AffectedContextPanel` shows the four genuine changed files from
`case482.changedFiles` (path, additions, deletions, risk), plus three
concern sentences tying each file to the finding/evidence already shown.
No deployment impact, customer impact, incident, additional file or service
dependency is claimed — only what `case482.changedFiles` itself records.
The Inspector adds the primary surface (the finding's own file), a file
count, and the single highest-risk file. Next action: Readiness.

---

## 15. Readiness state

`ReadinessPanel` states the frozen `Merge readiness blocked · 2 blockers ·
2 missing/unverified · 1 stale` line, the fixture's own `readiness.note`
("Two blocking requirements cleared since the previous head. One latency
requirement became stale…"), the `58 → 46` score movement, and the
decision-context sentence — all read from the static `READINESS` module,
never recalculated, with no number-count animation and no progress ring.
No merge action exists anywhere in this state. The panel closes with a
plain-text orientation line, "Next: 08 Human Decision — … Not yet open in
this sample," which is prose, not a button — confirmed absent from the
live interactive-element listing.

---

## 16. Structural provenance

The always-visible verification spine (stable placement, active-record
emphasis, consistent stage numbering) is the one structural-provenance
mechanism used, per
`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §14's allowed techniques ("stable
shared headings," "active-record emphasis," "consistent placement of the
relevant condition"). No separate breadcrumb, connector line, canvas or
graph component was added — the shell itself is the explanation, exactly
as §14 requires ("The product shell remains the primary explanation").
Every panel additionally uses a consistent "follows from …" / "affects …"
phrase pattern so the relationship reads in plain text without motion or a
diagram, remaining understandable with reduced motion and without
JavaScript (the same sentences exist in `VerificationJourneyNarrative.tsx`,
server-rendered).

---

## 17. Guided scroll system

One `IntersectionObserver`, created once inside `LiveReviewStage.tsx`,
observes every element carrying `data-verification-stage` — seven anchors,
rendered as plain server-rendered content in
`VerificationJourneyNarrative.tsx`, located via
`document.querySelectorAll` (the same pattern
`PublicPrototypeHeader.tsx` already used for its own active-section
tracking; no continuous scroll listener anywhere in this codebase).

**Trigger band.** `rootMargin: "-35% 0px -55% 0px"`,
`threshold: [0, 0.25, 0.5, 0.75, 1]`. This narrows the observer's
"viewport" to roughly the middle 10% of the actual viewport, offset below
the sticky header. A narrative block is treated as "arrived" once it
crosses into that band; the most-intersecting anchor at any callback drives
the stage. This keeps the guided stage a deterministic function of scroll
position (§5.1 of the state-model contract): scrolling back up moves back
through the same states because the same anchors re-cross the same band in
reverse, with no accumulating sequence and no forced reset.

**Entrance-once discipline.** A `Set<WorkingStage>` ref in
`LiveReviewStage.tsx` tracks which working stages have been visited this
session; the Workspace and Inspector panels only receive the
`panelEnter` animation class on a stage's first visit (guided or manual —
unified under one rule, since the underlying requirement, "don't replay a
flourish the visitor has already seen," applies regardless of how they got
there). `RESET_DEMO` clears the set, so a fresh session replays entrances
again.

No wheel hijacking, no scroll trapping, no snapping, no horizontal scroll
theatre and no blocked touch scrolling exist anywhere in this codebase —
confirmed by code inspection (no `wheel`/`touchmove` listener, no
`scroll-snap-type`, no `overflow-x` restriction beyond the page's normal
`box-sizing`/`wrap` rules).

### 17a. A documented environment limitation

The Browser pane in this session cannot composite frames (the same root
cause R5C, R5D, R5E and R5E.1B each recorded for screenshot capture). A
bare `IntersectionObserver` observing `document.body` (guaranteed 100%
intersecting) was tested directly and never delivered a callback within a
two-second wait — confirming the observer mechanism itself cannot fire in
this session's Browser pane, independent of anything in this
implementation. Because of this, the guided path could not be exercised
end-to-end live in the browser. It was instead verified two other ways:
(1) direct unit testing of the reducer's guided/manual precedence logic in
isolation (§28), which is the part of the guided system that actually
enforces the manual-precedence rule, and (2) code inspection of the
observer wiring itself (anchor discovery, trigger band, dispatch call).
See §29 for the full record.

---

## 18. Manual-intent precedence

Manual activation exists on: the PR #482 Queue row (unchanged from
R5E.1B), all seven working verification-spine stages, and every panel's
"next action" button (Inspect finding → Inspect evidence → Inspect missing
proof → Inspect requirement → Inspect affected context → Inspect
readiness). Every one of these calls `eventForWorkingStage(stage,
"manual")` through one shared `navigateManual` callback in
`LiveReviewStage.tsx`, so activation by pointer and by keyboard (native
button `Enter`/`Space`) produce identical dispatched events.

The precedence rule itself lives in exactly one place — `demoReducer`'s
guard `if (event.source === "guided" && state.mode === "manual") return
state;` — not duplicated in the guided controller, which dispatches guided
events unconditionally and trusts the reducer to discard them. This was
proven directly: after a manual `OPEN_REQUIREMENT`, dispatching a guided
`FOCUS_FINDING` through the same reducer instance left `stage` unchanged
and returned the *same object reference* (§28, assertions 7–8) — i.e. the
event was discarded, not queued or deferred, exactly as
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §4c requires. The same
behaviour was additionally exercised live in the browser: after clicking
"05 Requirement," scrolling the "finding" narrative anchor into view (which
would dispatch a guided `FOCUS_FINDING` if the observer could fire in this
environment) left the spine's active state unchanged at "05 Requirement."

---

## 19. Resume and reset behaviour

`Resume guided tour` renders inside `VerificationSpine.tsx`, directly below
the compact bar, only when `mode === "manual"` — confirmed absent from the
DOM in guided mode and present, focusable and correctly labelled once a
manual activation occurs. It is a real `<button>`, not a hover-only or
icon-only control, and is not styled as a video-player scrubber. Clicking
it dispatches `RESUME_GUIDED`, which sets `mode` back to `"guided"` and
clears `lastManualStage` without changing the current stage — confirmed
live: the button disappeared immediately after activation.

`Reset sample` remains a separate control in the shell's footer (unchanged
position from R5E.1B), dispatching `RESET_DEMO`, which returns the entire
`DemoState` to `INITIAL_DEMO_STATE` — confirmed live (spine returned to `01
Change`/Overview) and by the unit test (`JSON.stringify(s5) ===
JSON.stringify(INITIAL_DEMO_STATE)`).

---

## 20. Motion

`--ease: cubic-bezier(0.2, 0.8, 0.2, 1)` (unchanged token from R5E.1B) is
reused for every new transition. `.panelEnter` is a 200ms
opacity+`translateY(4px)` keyframe — within the "Selection and record
changes: 180–240ms" range — applied to the Workspace's inner panel and the
Inspector's content only, never the whole `.stageWrap` shell, never a
layout dimension (`height`/`width` are untouched by the animation; the
shell's fixed `560px` height, §7, means nothing needs to reflow). No
bounce, no spring, no parallax, no autoplay, no loop, and no number-count
animation exist anywhere in the new code.

Reduced motion is two independent layers, per
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §8c.7:

1. **CSS, primary.** The existing global rule
   (`@media (prefers-reduced-motion: reduce) { .page :global(*) {
   transition-duration: 0.001ms !important; animation-duration: 0.001ms
   !important; } }`) collapses every transition and animation, including
   `.panelEnter`, regardless of any JS state. Confirmed present in the
   compiled stylesheet via `document.styleSheets` inspection.
2. **`matchMedia`, second layer.** `LiveReviewStage.tsx` reads
   `window.matchMedia("(prefers-reduced-motion: reduce)")` on mount and on
   `change`, and sets `data-reduced-motion="true"` on `.stageWrap` when it
   matches. A CSS rule, `.stageWrap[data-reduced-motion="true"]
   .panelEnter { animation: none; }`, additionally strips the animation at
   the class level, and the same boolean gates whether
   `LiveReviewStage.tsx` even passes the `panelEnter` class to a panel at
   all (`animateEntrance = isFirstVisit && !reducedMotion`). The two layers
   are independent: either alone is sufficient to guarantee immediate,
   motion-free state changes.

No essential content is ever hidden behind an animation: every panel's
content is present in the DOM immediately on stage change; `panelEnter`
only affects opacity/position of already-present content, never its
existence.

---

## 21. Responsive behaviour

Browser-validated at all six required viewports, production build
(`next build` then `next start`),
`document.documentElement.scrollWidth <= clientWidth` confirmed at each:

| Viewport | Result |
|---|---|
| 1600×1000 | No overflow (1585×1585). Sticky shell active. Full spine. |
| 1280×800 | No overflow (1265×1265). Sticky shell active. Full spine. |
| 1024×768 | No overflow (1009×1009). Sticky shell active (four-column single-row grid: `44px 220px 389.2px 290px`, confirmed via computed style). |
| 768×1024 | No overflow (753×753). Sticky disabled (`position: static`, confirmed via computed style). Grid reflows to the existing two-row `rail/queue/workspace` + `rail/queue/inspector` areas. |
| 390×844 | No overflow (390×390). Sticky disabled. Rail hidden, full spine hidden, compact `NN of 08` bar shown (`display: flex`, confirmed). Mobile `Next →` verified to advance the stage. |
| 320×568 | No overflow (320×320). Same mobile composition. |

A seventh, informal check at 640×800 (a rough proxy for 200% zoom on a
1280px display, since this environment has no direct OS-level zoom
emulation) also showed no horizontal overflow and a working `Next →`
control.

The sticky/static breakpoint (`min-width: 1024px`) is deliberately the
same breakpoint where the shell's own internal grid already reflows
(`max-width: 1023px`), so sticky is only ever active while the shell is in
its compact, single-row, ~560px-tall form — never while it's the taller
two-row tablet layout, which is where a pinned shell would most harm
usability.

---

## 22. Accessibility

Verified live (production build, `read_page`, `javascript_tool` DOM/ARIA
inspection):

- One `<main>`, one `<h1>` (`Know what is ready to merge.`), confirmed by
  count.
- Logical heading order: `h1` → `h2` (verification gap) → `h2` (follow the
  record) → `h3` × 6 (one per working stage in the narrative) → `h2`
  (Trust).
- 12 buttons total at the resting Overview state (PR row, Inspect finding,
  seven spine buttons, mobile prev/next, Reset sample), matching exactly
  the intended working-control set — no fake control, no disabled
  placeholder for Human Decision.
- `aria-pressed` on every spine button reflects true state, confirmed by
  live inspection before and after activation.
- The two Queue context rows and the five Global Rail areas remain
  `aria-hidden`, non-focusable, carrying zero interactive elements inside
  them (confirmed: `document.querySelectorAll('[aria-hidden="true"]
  button, [aria-hidden="true"] a').length === 0`).
- `08 Human Decision` is plain visible text, zero buttons, confirmed
  present in `innerText` as "08 Human Decision … Pending" and absent from
  the button list.
- The single `aria-live="polite"` region announces only after a manual
  activation (confirmed: "Requirement opened" appeared after a manual
  click; cleared to empty after `RESUME_GUIDED`, which is not itself an
  announced event) — guided scroll changes are never announced, by
  construction (the announcement text is only computed when `mode ===
  "manual"`).
- No `tabIndex`/custom keyboard handling exists anywhere in
  `app/_public-r5-recalibrated/**` (confirmed by search) — every control is
  a native `<button>` or `<a>`, reached by normal Tab order, activated by
  native `Enter`/`Space`, with no document-level arrow-key interception and
  no roving-focus composite.
- Skip link (`Skip to content` → `#main`) remains the first element in the
  DOM's interactive order, confirmed.
- `robots` meta remains `noindex, nofollow`, confirmed.
- Anchor targets (`#product`, `#how-it-works`, `#trust`, and the new
  `.movementBlock`/`.stageNarrative` blocks) all carry
  `scroll-margin-top: var(--header-h)`.
- Colour is never the sole carrier: every active/selected state pairs a
  structural marker (border, `aria-pressed`, a text label) with any colour
  step, unchanged from R5E.1B's pattern and extended identically to the
  five new panels.

Not exercised in this environment (see §29): a live screen-reader pass,
OS-level `prefers-reduced-motion` emulation end-to-end, and true 200% zoom
(approximated by a narrow-viewport check instead).

---

## 23. Progressive enhancement

Every fact any interactive state can show already exists in
server-rendered markup: `VerificationJourneyNarrative.tsx` is a plain
server component (no `"use client"`) that renders the same
`canonical-review.ts` values the client panels render — the finding's full
statement, both evidence records, both missing-proof records, the
requirement's statement and required proof, all four affected files, and
the full readiness summary — confirmed by reading the server-rendered
`get_page_text` output before any interaction, which already contained
every one of those facts. `LiveReviewStage` remains a Next.js client
component that is still server-rendered by default, so its own initial
markup (PR #482 selected, Overview resolved, spine present, Human Decision
pending) is unchanged from R5E.1B and remains complete without JavaScript.
No content is removed after mount; no state flashes from unselected to
selected; the shell's fixed height (§7) means hydration introduces no
cumulative layout shift.

---

## 24. Performance and stability

No dependency and no lockfile change
(`git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock`
empty). No `localStorage`, `fetch`, `XMLHttpRequest`, analytics or
telemetry call exists anywhere in `app/_public-r5-recalibrated/**`
(confirmed by search and by live `read_network_requests`, same-origin
`_next/static/**` and page-navigation requests only). One
`IntersectionObserver` instance, one reducer, one canonical data module,
one guided controller. No canvas, no WebGL, no video. `.claude/launch.json`
gained one additional entry (`lintel-prod`, running `npm run start`) purely
to validate a production build in the Browser pane — not a product
dependency and not part of the shipped application.

---

## 25. Route and product truth

`example/b2b-redemption-api` · PR `#482` · `Add fallback handling for
failed discount-code retrieval` · `Tests required` · `46/100 · MEDIUM` ·
`4 open · 2 blocking` · `PENDING` render identically across all nine
reachable states and all six viewports exercised. Every new value —
evidence statements, missing-proof records, the blocking requirement, the
four affected files, the readiness note and score movement — is taken
verbatim from `case482` in `lib/workspace-v2/fixture-adapter.ts`; none is
invented, approximated, or given a changed status/count. No control exists
for an action this prototype cannot truthfully perform. Nothing calls a
model, creates a review, records a Human Decision, or performs an external
write.

---

## 26. Browser validation

Production build (`next build` then `next start`), Browser pane, `noindex`
route. See §17a and §29 for the documented `IntersectionObserver`
limitation.

| Check | Result |
|---|---|
| Resting state complete and truthful (`get_page_text` pre-interaction) | Pass |
| One `<main>`, one `<h1>` | Pass |
| `robots` = `noindex, nofollow` | Pass |
| Manual spine navigation (all seven working stages) | Pass |
| Manual precedence: guided scroll change ignored after manual activation | Pass (live) |
| `Resume guided tour` appears only in manual mode, restores guided mode | Pass |
| `Reset sample` returns to initial state | Pass |
| Keyboard activation (focus + native `Enter`) | Pass |
| `08 Human Decision` non-interactive, visible, not `aria-hidden` | Pass |
| Reduced-motion CSS rule present in compiled stylesheet | Pass |
| No horizontal overflow, all six viewports | Pass |
| Sticky active ≥1024px, static <1024px | Pass |
| Mobile compact bar + working `Next →` | Pass |
| No console error / hydration warning, any viewport or interaction | Pass |
| No broken asset | Pass (`read_network_requests` all 200 OK) |
| No external write or model request | Pass (same-origin only; zero storage writes by this code) |
| Regression: `/` | Pass, no console error |
| Regression: `/visual-lab/public-r5` | Pass, no console error |
| Regression: `/workspace?source=fixture` | Pass, no console error |
| Regression: `/new` | Pass, no console error |
| Guided `IntersectionObserver` firing, end-to-end in this Browser pane | **Untested** — environment cannot composite frames (§17a, §29) |
| Live screen-reader pass | **Untested** |
| OS-level `prefers-reduced-motion` emulation | **Untested** |
| True 200% zoom | **Untested** (640×800 narrow-viewport proxy passed) |
| Pixel screenshot capture | **Untested** (same Browser-pane limitation R5C/R5D/R5E/R5E.1B recorded) |

---

## 27. Build and repository validation

- `npx tsc --noEmit` — passes, no output.
- `npm run build` — passes; `/visual-lab/public-r5-recalibrated` generated
  as a static route alongside the unchanged existing route list.
- A standalone Node unit test (compiled `demo-reducer.ts` +
  `canonical-review.ts` via `tsc` to a scratch directory outside the repo,
  executed with plain `node`) ran 32 assertions against the reducer's
  transition table, guided/manual precedence, `RESUME_GUIDED`/`RESET_DEMO`
  behaviour and every working-stage round trip — all 32 passed. This gave
  direct proof of the state-model logic independent of the Browser pane's
  `IntersectionObserver` limitation.
- `git diff --check`, `git status --short`, and `git diff` against every
  protected path in §27 of the phase brief — see the Final Report's
  "Build and repository validation" section for the literal command output.

---

## 28. Protected scope

Unchanged, confirmed by empty `git diff`: `app/page.tsx`, `app/_public-r5`,
`app/visual-lab/public-r5` (the thin route only — R5E.1C never touched
it), `app/workspace`, `app/report`, `app/new`, `app/home`,
`app/review-operations`, `app/integrations`, `app/settings`,
`app/review-policies`, `app/team`, `app/visual-lab/workspace-r4`,
`lib/workspace-v2/**`, `public/r5/scenes`, `package.json`, all lockfiles,
and every R5E.1A/R5E.1B document. `app/visual-lab/public-r5-recalibrated`
and `app/_public-r5-recalibrated` — R5E.1B's own private implementation —
were extended, which is the intended, in-scope target of this phase.

---

## 29. Known limitations

1. As recorded by R5C, R5D, R5E and R5E.1B before it, this session's
   Browser pane cannot composite frames: no pixel screenshot could be
   captured, and (newly relevant to this phase) `IntersectionObserver`
   never delivers a callback, confirmed by a bare
   `document.body`-observing test that received no callback within two
   seconds. Practical consequence: the guided scroll-driven state
   transitions could not be observed firing live end-to-end in this
   session. They were instead verified by (a) a standalone unit test of
   the reducer logic that actually enforces manual precedence (§27), (b)
   code inspection of the observer wiring, and (c) a live functional test
   of the reverse condition — that a guided-shaped event genuinely has no
   effect once manual mode is active — which does not itself require the
   observer to fire. This should be confirmed in a real, compositing
   browser before formal acceptance, alongside a direct visual check of
   the sticky shell's behaviour while scrolling.
2. No live screen-reader pass (NVDA/VoiceOver) was performed; the
   accessibility-tree and keyboard checks above are a proxy, not a
   substitute — the same limitation R5E.1B recorded.
3. OS-level `prefers-reduced-motion` emulation was not available in this
   environment; the CSS rule's presence and the two-layer JS/CSS
   architecture were confirmed instead.
4. True 200% zoom was not available; a 640×800 narrow-viewport check was
   used as an informal proxy and passed, but is not a substitute for
   genuine zoom testing.
5. `read_page`'s accessibility-tree dump appeared to return only a partial
   interactive-element list in this session (8 of 12 known buttons on one
   call); `javascript_tool` DOM queries were used as the reliable source of
   truth for every structural/ARIA check in this document instead. This
   looks like the same Browser-pane compositing limitation as items 1 and
   4 above, not a defect in the page.

---

## 30. Work deferred to R5E.1D

Per `R5E1A_IMPLEMENTATION_HANDOFF.md` §4: the `readiness` state's
Human-Decision-facing completion (this phase's Readiness panel already
exists and is complete for R5E.1C's own gate, but the *transition into* a
working Human Decision surface is explicitly out of scope); both Human
Decision surfaces (guided in-page preview with no dialog semantics, and
the manually activated `role="dialog"` surface) exactly as specified in
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §7 and
`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §12a; movement four (Accountable
decision) and movement five (Trust and continuation, beyond the existing
compact Trust section this phase left untouched); the explicit read-only
boundary copy wherever the decision surface will appear; any writable
decision path (none exists and none may be added). R5E.1E assembles the
accepted prototypes into one complete private laboratory. R5E.1F reviews
and freezes the direction and decides on any production transfer.

---

## 31. Human acceptance requirements

Before this phase is considered accepted, a human reviewer should confirm,
in a real compositing browser:

1. The sticky shell's visual behaviour while scrolling through the
   narrative feels like "one reviewer moving through one review," not a
   mechanical panel swap.
2. Guided scroll advancement actually fires and tracks scroll position
   bidirectionally (untestable in this session's Browser pane, §29.1).
3. The five new panels (Evidence, Missing proof, Requirement, Affected
   context, Readiness) read as genuine product records, not marketing
   cards, at normal reading distance and font size.
4. Amber and red usage in the Missing proof and Requirement panels feels
   restrained, not alarming, against the otherwise-neutral shell.
5. The mobile compact spine and prev/next control feel usable on a real
   touch device, not just in a resized desktop browser.
6. Reduced-motion behaviour is confirmed with a real OS-level reduced-motion
   setting enabled.

The R5E.1C human review package remains local and untracked at
`R5E1C_HUMAN_REVIEW_PACKAGE/`.

R5E.1C implementation is complete and ready for human visual review. It is
not self-accepting: formal acceptance follows the same human review process
as R5C/R5D/R5E/R5E.1B.

## Human visual acceptance and closeout

R5E.1C received human visual acceptance on 2 August 2026.

A genuine desktop recording demonstrated the complete guided verification journey inside one stable Lintel product shell:

1. Finding
2. Evidence
3. Missing proof
4. Requirement
5. Affected context
6. Readiness

The review confirmed:

1. The Rail, Queue, Workspace, Inspector and verification spine remain visually continuous.
2. PR #482 and all canonical readiness values remain unchanged throughout.
3. Each state reads as inspection of one unresolved review rather than replacement marketing content.
4. Evidence, missing proof and blocking requirements remain visually and semantically distinct.
5. Readiness acts as a synthesis of the preceding records rather than a newly calculated result.
6. The verification spine advances without implying stage completion.
7. The white visual system remains coherent as the product demonstration becomes denser.
8. The guided shell releases naturally and does not trap page scrolling.
9. The live demonstration now explains Lintel's verification model primarily through product behaviour.
10. Human Decision remains pending and intentionally deferred to R5E.1D.

The primary visual evidence is stored locally in the untracked R5E.1C human review package as:

`recordings/01_guided_verification_journey_desktop.mp4`

R5E.1C is accepted and closed.
