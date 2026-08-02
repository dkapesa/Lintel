# R5E.1A — Live Demo and State Model Contract

Companion to `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`. Authoritative for the
public live demonstration: what it is, what it may and may not do, its typed
state model, its event set, guided/manual coordination, its data source, its
no-JavaScript behaviour and its decision-surface semantics.

Documentation only. No component, state machine, route or style was created
by this milestone.

---

## 1. What the demonstration is

A controlled, **read-only** public implementation that demonstrates real
product behaviour on one fixed canonical case.

It is not a second complete Lintel application. It does not replace the real
read-only sample, which remains at `/workspace?source=fixture` and remains
the destination of the primary action.

It must be labelled honestly, in visible copy, as an interactive sample or a
read-only product demonstration. The label is content, not a tooltip, and is
present without JavaScript.

---

## 2. The canonical case

Locked values, unchanged in every state and at every viewport:

| Field | Locked value |
|---|---|
| Repository | `example/b2b-redemption-api` |
| PR | `#482` |
| Title | `Add fallback handling for failed discount-code retrieval` |
| Recommendation | `TESTS REQUIRED` |
| Risk | `46/100 · MEDIUM` |
| Requirements | `4 open · 2 blocking` |
| Human Decision | `PENDING` |

Supporting canonical facts, already accepted in `R5A_DIRECTION_LOCK.md` §4,
`R5B_LANDING_PAGE_ARCHITECTURE.md` §7 and `app/_public-r5/content.ts`, and
confirmed against the frozen fixture `lib/workspace-v2/fixture-adapter.ts`:

| Record | Frozen value |
|---|---|
| Confidence | `MEDIUM` |
| Branch / head | `fix/discount-code-retrieval-fallback` · `9c41af2` |
| Primary finding | `Retry behaviour may create duplicate redemption risk` — `HIGH` · `Reliability` · `Rule detected` · `app/services/redemption_service.py:118` |
| Supporting evidence | `Retry path observed in redemption service` (`confirmed`), `No idempotency key present on redemption write` (`present`) |
| Missing proof | Derived from canonical evidence status. `Provider failure cases absent from test suite` (`missing`); `Client-facing error shape inferred, not verified` (`unverified`) |
| Stale evidence | `Prior load test result for redemption endpoint` (`stale`) |
| Evidence boundary | `5 canonical evidence records. 2 missing or unverified; 1 stale.` |
| Blocking requirement | `Idempotency proven under retry` — `blocking · open` |
| Readiness | `Merge readiness blocked` · `2 blockers · 2 missing/unverified · 1 stale` |
| Decision context | `Review decision context · Human Decision pending` |

**The visitor changes what they inspect, not the truth of the review.** No
requirement clears. No outcome is ever selected. No value moves.

### 2a. Identifiers

Per `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §2c.i, no invented sequential
identifier scheme (`EV-07`, `MP-02`, `REQ-04`) may be displayed. Only the
genuine product stage numbers `01`–`08` and metadata the frozen product
itself displays may appear. Internal fixture ids
(`ev_retry_path`, `req_test_idempotency`, …) are used as **state keys**, and
are displayed only where the frozen product displays them.

---

## 3. Prohibited demonstration behaviour

The public demo must not:

1. call a model;
2. create a review;
3. write to local storage;
4. record a Human Decision;
5. send GitHub or Slack actions;
6. perform external writes;
7. imply hosted collaboration;
8. imply that live analysis is running;
9. change canonical fixture values;
10. replace the complete sample Workspace.

Additional prohibitions that follow from the frozen R4 product-truth rule:

11. No control may exist for an action the demo cannot truthfully perform.
    Queue rows other than PR #482 render as genuine, truthful context and
    are **not** interactive: not focusable, not styled as controls, carrying
    no button or link semantics. A short visible line states that PR #482 is
    the inspectable review in this sample.
12. No loading, spinner, progress bar, streaming, typing or "analysing"
    affordance anywhere in the demonstration.
13. No success, completion, cleared, approved or resolved state.
14. No fabricated organisation, team, presence, reviewer activity or
    customer identity beyond the fixture's clearly-sampled reviewer.

---

## 4. The typed state model

One conceptual state model governs the demonstration. The final
implementation may use a reducer or an explicit state machine, but it must
not scatter unrelated public-demo state across many disconnected `useState`
calls.

### 4a. State shape

```ts
type DemoStage =
  | "queue"
  | "overview"
  | "finding"
  | "evidence"
  | "missing-proof"
  | "requirement"
  | "affected-context"
  | "readiness"
  | "human-decision";

type DemoMode = "guided" | "manual";

type DecisionSurface = "closed" | "open";

interface DemoState {
  /** Which verification state is active. */
  stage: DemoStage;
  /** Whether guided choreography may still move `stage`. */
  mode: DemoMode;
  /** Whether the Human Decision surface is showing. */
  decisionSurface: DecisionSurface;
  /**
   * How the decision surface came to be open. Determines its semantics:
   * "guided" => in-page preview, no dialog role, no focus trap.
   * "manual" => full dialog, focus contained, Escape closes.
   */
  decisionSurfaceOrigin: "guided" | "manual" | null;
  /** Canonical fixture record key for the active record, never invented. */
  activeRecordId: string | null;
  /** Stage the visitor last chose explicitly; drives the resume affordance. */
  lastManualStage: DemoStage | null;
}
```

Initial state:

```ts
{
  stage: "queue",
  mode: "guided",
  decisionSurface: "closed",
  decisionSurfaceOrigin: null,
  activeRecordId: null,
  lastManualStage: null,
}
```

### 4b. Events

Every event carries its origin:

```ts
type DemoEvent =
  | { type: "SELECT_REVIEW";         source: EventSource }
  | { type: "SHOW_OVERVIEW";         source: EventSource }
  | { type: "FOCUS_FINDING";         source: EventSource; recordId: string }
  | { type: "OPEN_EVIDENCE";         source: EventSource; recordId: string }
  | { type: "OPEN_MISSING_PROOF";    source: EventSource; recordId: string }
  | { type: "OPEN_REQUIREMENT";      source: EventSource; recordId: string }
  | { type: "OPEN_AFFECTED_CONTEXT"; source: EventSource }
  | { type: "SHOW_READINESS";        source: EventSource }
  | { type: "OPEN_DECISION";         source: EventSource }
  | { type: "CLOSE_DECISION";        source: EventSource }
  | { type: "RESUME_GUIDED" }
  | { type: "RESET_DEMO" };

type EventSource = "guided" | "manual";
```

`RESUME_GUIDED` and `RESET_DEMO` are always visitor-initiated and carry no
source field.

### 4c. Transition table

| Event | Resulting `stage` | Other effects |
|---|---|---|
| `SELECT_REVIEW` | `queue` | Emphasis moves to the PR #482 Queue row. Selection itself never changes — PR #482 is always the selected review. `activeRecordId` = the review key |
| `SHOW_OVERVIEW` | `overview` | Workspace shows the genuine Overview record. `activeRecordId` = the review key |
| `FOCUS_FINDING` | `finding` | `activeRecordId` = finding key |
| `OPEN_EVIDENCE` | `evidence` | `activeRecordId` = evidence key |
| `OPEN_MISSING_PROOF` | `missing-proof` | `activeRecordId` = the source evidence key whose status is `missing` or `unverified` |
| `OPEN_REQUIREMENT` | `requirement` | `activeRecordId` = requirement key |
| `OPEN_AFFECTED_CONTEXT` | `affected-context` | `activeRecordId` = the affected surface key |
| `SHOW_READINESS` | `readiness` | `activeRecordId` = null |
| `OPEN_DECISION` | `human-decision` | `decisionSurface` = `open`; `decisionSurfaceOrigin` = event source |
| `CLOSE_DECISION` | unchanged | `decisionSurface` = `closed`; `decisionSurfaceOrigin` = null |
| `RESUME_GUIDED` | unchanged until the next guided event | `mode` = `guided`; `lastManualStage` = null; a manually opened decision surface is closed first |
| `RESET_DEMO` | `queue` | Full return to initial state; entrance motion may play once more |

Two rules apply to every row:

1. **Manual events set `mode` to `"manual"` and record `lastManualStage`.**
2. **Guided events are ignored entirely while `mode === "manual"`.** They
   are not queued, not deferred, and not applied later.

### 4d. Invariants

These must hold in every reachable state, and are the correctness bar for
R5E.1C and R5E.1D:

1. The seven locked canonical values in §2 are never derived from `stage`
   and never change.
2. `decisionSurface === "open"` implies `decisionSurfaceOrigin !== null`.
3. `decisionSurfaceOrigin === "manual"` implies dialog semantics are active
   (§7).
4. `mode === "guided"` implies `lastManualStage === null`.
5. `activeRecordId`, when non-null, is always a key present in the canonical
   fixture module. No invented key may ever enter state.
6. No event may set, clear or record a Human Decision outcome. There is no
   event that could.
7. No event writes to storage, network, or any surface outside the
   demonstration.

---

## 5. Guided behaviour

Guided scrolling advances through the canonical investigation:

`PR selection → Finding → Evidence → Missing proof → Requirement →
Affected context → Readiness → Human Decision`

Rules:

1. The guided stage is a **deterministic function of scroll position**, not
   an accumulating sequence. Scrolling back up moves back through the same
   states; it does not reset the demonstration and does not restart a
   sequence from the beginning.
2. Use `IntersectionObserver` per movement or per stage anchor. Do not use a
   continuous scroll listener, and do not measure layout in a loop.
3. Entrance motion for a given stage plays at most once per session unless
   `RESET_DEMO` fires. Re-entering a stage restores its state without
   replaying an entrance.
4. No forced scroll behaviour: no wheel hijacking, no scroll trapping, no
   snapping between stages, no requirement to complete the sequence before
   leaving the section, no horizontal scroll theatre, no blocked touch
   scrolling.
5. Guided advancement never moves DOM focus and never fires an assertive
   announcement.

---

## 6. Manual behaviour and precedence

**Frozen: manual visitor intent always wins over automated choreography.**

Visitors may directly activate: the PR #482 Queue row; verification stages;
finding records; evidence records; missing-proof records; the blocking
requirement; affected context; readiness; the Human Decision surface.

After a manual activation:

1. `mode` becomes `"manual"` and guided state changes stop.
2. The visitor's selected record remains active.
3. Nearby scroll movement does not replace the selection — guided events are
   discarded, not deferred.
4. A quiet `Resume guided tour` / `Replay` affordance becomes available. It
   is a real, focusable button with a visible label, not a hover-only or
   icon-only control.
5. The page does not fight the visitor.

A full reset happens only through explicit replay, explicit reset, or a full
page reload.

### 6a. Keyboard model

1. The PR #482 Queue row is a semantic `<button>`. Other Queue rows are
   inert content (§3.11).
2. Verification stage controls are semantic buttons. They may form one
   composite control with a single tab stop and roving focus; if they do,
   Left/Right/Up/Down and Home/End apply **only while focus is inside that
   control**. No arrow-key behaviour is registered at document level.
3. Record controls (finding, evidence, missing proof, requirement, affected
   context) are semantic buttons carrying `aria-pressed` for their active
   state, matching the frozen Workspace's own record-button pattern.
4. `Escape` closes a manually opened dialog only. It never changes the
   selected review, never resets the demonstration, and is not bound while
   only the guided preview is showing.
5. Activation by keyboard and by pointer produce identical state.
6. At most one restrained polite status region exists for the whole
   demonstration. It announces the active record only after a **manual**
   activation. Guided scroll changes are never announced.

---

## 7. The Human Decision surface

Two surfaces, deliberately different, per
`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §12a.

**Guided preview** — `decisionSurfaceOrigin === "guided"`. Ordinary in-page
content inside the demonstration. No `role="dialog"`, no `aria-modal`, no
focus trap, no inert background, no focus movement. The page remains
scrollable and operable. A visitor scrolling past is never captured.

**Manually activated dialog** — `decisionSurfaceOrigin === "manual"`. Full
dialog semantics: `role="dialog"`, `aria-modal="true"`, labelled by its own
heading, deliberate initial focus, contained focus, `Escape` closes, focus
returns to the triggering control, background may be inert while open.

Both surfaces, in every state:

1. Show all seven outcomes visibly **unselected**. `Tests required` is not
   preselected even though it matches the recommendation. This is the point
   of the moment.
2. Show the required rationale field, empty.
3. Show the submit action in its disabled, read-only resting state.
4. Carry the explicit read-only sample boundary, visibly.
5. State that Lintel recommends and the accountable engineer decides.
6. Record nothing. There is no event in §4b capable of recording a decision.

Motion may open the surface. Motion may never complete a decision.

---

## 8. Data source and progressive enhancement

### 8a. One canonical data source

1. Exactly one module owns every PR #482 fixture value used by the public
   demonstration — canonical values, record titles, statuses, provenance,
   file paths, spine stage names and record keys.
2. It is typed and read-only (`as const` or an equivalent), and it is the
   only place a canonical value is written.
3. No UI component may hardcode, re-type or paraphrase a canonical value.
   Copy, `alt` text, accessible names and announcements all derive from it.
4. The existing production content source `app/_public-r5/content.ts` is
   **not** edited by any R5E.1 prototype phase. The recalibrated
   implementation gets its own source under its own private folder; it may
   follow the same shape.
5. Values are cross-checked against `lib/workspace-v2/fixture-adapter.ts`.
   Where the two disagree, the frozen fixture wins and the public source is
   corrected.

### 8b. Server-rendered resting state

1. The demonstration's server-rendered markup is a complete, truthful
   resting state: the shell present, PR #482 selected, the genuine Overview
   record resolved around it, the four canonical values legible, the spine
   present, Human Decision pending.
2. Every fact the demonstration ever shows also exists in server-rendered
   page content — in the movement copy and record content of movements two
   through five. The interactive shell never holds the only copy of any
   fact.
3. Consequences: without JavaScript the page is a complete, ordered,
   readable investigation; with JavaScript the shell follows the visitor
   along it. Nothing essential is JavaScript-only, nothing is hidden behind
   an observer, and no content is removed after mount — so there is no
   hydration flash and no cumulative layout shift.
4. The shell occupies a stable, bounded region whose height does not change
   between states. Internal overflow scrolls inside the shell, as the real
   product does.
5. Client-rendered stage panels may only present facts already available in
   the canonical module and already stated in server-rendered page content.
   They may never introduce a new fact.

### 8c. Reduced motion

1. State changes happen immediately.
2. All content remains usable.
3. No essential opacity or positional transition exists.
4. Verification state still updates.
5. Manual interaction still works.
6. The Human Decision surface opens without movement.
7. Reduced motion is enforced in CSS as the primary contract, with the
   controller's `matchMedia` check as a second, independent layer — the
   two-layer pattern already proven in `R5E_PUBLIC_MOTION_SYSTEM.md` §9.

---

## 9. State-to-surface mapping

What each state changes. The application frame, the canonical values and the
selected review never change.

| Stage | Spine | Workspace focus | Inspector | Canonical record |
|---|---|---|---|---|
| `queue` | `01 Change` | Selected-review header and Overview resolving | Review-level next inspection | The review |
| `overview` | `01 Change` | Overview record | Review-level context | The review |
| `finding` | `02 Finding` | The primary finding, with severity, category, provenance, affected surface | Finding detail and its explicit relationships | `finding_retry_idempotency` |
| `evidence` | `03 Evidence` | Supporting canonical evidence for that finding | Evidence detail: class, status, provenance, source, applicability | `ev_retry_path`, `ev_no_idempotency_key` |
| `missing-proof` | `04 Missing proof` | The derived missing-or-unverified-proof presentation, carrying its `Derived · not persisted` qualifier | Why the gap matters and what it blocks | `ev_coverage_gap` (`missing`), `ev_error_shape_inferred` (`unverified`) |
| `requirement` | `05 Requirement` | The blocking requirement | Requirement definition, required proof, contributing finding | `req_test_idempotency` |
| `affected-context` | `06 Affected context` | Affected surfaces and concerns the change reaches | Relationship detail for that surface | `app/services/redemption_service.py:118` |
| `readiness` | `07 Readiness` | Readiness summary: `Merge readiness blocked`, `2 blockers · 2 missing/unverified · 1 stale` | Decision-readiness context, explicitly not a decision | — |
| `human-decision` | `08 Human Decision` | Workspace remains recognisable behind the surface | Unchanged or dimmed | — |

The derived qualifier must never arrive after the claim: wherever missing
proof appears, `Derived · not persisted` and its derivation from canonical
evidence status appear with it, in the same state.

R5E.1B and R5E.1C must verify each row against the frozen product before
implementing it, and must correct this table's product detail in their own
milestone document — never by editing this one — if the frozen product
disagrees.

---

## 10. Acceptance checklist

1. One fixed canonical case, seven locked values, unchanged in every state
   and viewport. ☐
2. All fourteen prohibited behaviours hold, including no interactive Queue
   row other than PR #482 and no loading or analysing affordance. ☐
3. Nine active states, two interaction modes, two decision-surface states
   and twelve conceptual events exist as one reducer or explicit state
   machine. ☐
4. Every event carries its origin; manual events set `manual` mode; guided
   events are discarded while manual. ☐
5. All seven invariants hold in every reachable state. ☐
6. Guided stage is a deterministic function of scroll position, driven by
   observers, with entrance motion firing at most once per session. ☐
7. No forced scroll, snapping, trapping or wheel hijacking exists. ☐
8. A visible, focusable resume affordance appears once the visitor takes
   manual control. ☐
9. Guided preview has no dialog semantics and never traps focus; the
   manually activated dialog has full dialog semantics and returns focus. ☐
10. All seven outcomes are unselected, rationale empty, submit disabled and
    the read-only boundary visible in both surfaces. ☐
11. One typed, read-only canonical module owns every value; no component
    hardcodes one; values are cross-checked against the frozen fixture. ☐
12. The server-rendered resting state is complete and truthful, every fact
    exists in server-rendered content, and nothing is hidden or removed
    after mount. ☐
13. Reduced motion is complete and enforced in CSS first. ☐
14. Nothing is written, sent, stored or recorded anywhere. ☐
