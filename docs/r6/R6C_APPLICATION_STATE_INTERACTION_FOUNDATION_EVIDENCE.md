# R6C — Application State and Interaction Foundation evidence

> **Status:** **Accepted R6C foundation. Application state and interaction
> architecture approved for consumption by R6D and later milestones. No
> production shell migration occurred in R6C.**
>
> **Final independent review:** **ACCEPT R6C WITH NON-BLOCKING FOLLOW-UPS**

## 0. Final acceptance record

The first independent review returned `REQUIRES BOUNDED CORRECTIONS`. Its three
blocking findings were resolved and independently verified:

1. false ReviewId merging from placeholder projected PR numbers was removed by
   making the built-in provider conservatively Case-singleton;
2. bare `/reviews` no longer auto-selects a persisted Review and remains the
   idle Reviews collection destination;
3. a production-shaped false-merge regression now covers two GitHub-labelled
   Cases with the same repository and projected placeholder PR number.

The final independent verdict is **ACCEPT R6C WITH NON-BLOCKING FOLLOW-UPS** and
**READY TO FREEZE R6C**. The `ReviewIdentityProvider` architecture is unchanged
and is separately exercised with an injected durable provider.

## 1. Outcome and boundaries

R6C now provides a pure TypeScript application-state, restoration,
reconciliation, routing, action, focus and persistence foundation under
`lib/r6c/**`. It consumes the existing Workspace V2 `CaseDetail`, `RunView` and
snapshot projections by read-only import. It does not mirror or mutate
canonical verification records.

The central invariant is:

**UI state may restore. Canonical product truth always refreshes.**

There are zero changes under `app/**`. The frozen R5 public implementation,
the frozen R6B laboratory, `lib/workspace-v2/**`, canonical Report/run owners,
the Human Decision ledger and its production mutation service are unchanged.

No production presentation, production routing integration, R6D shell work,
R6E collection schema, R6L command/shortcut vocabulary, R6M breakpoint/width
policy or R6K draft persistence was implemented.

## 2. Verified source facts

Targeted source inspection confirmed:

- `CaseDetail.caseId` is the existing string Case identity.
- `RunView.sourceType` is exactly `github-app | github-pr | manual | sample |
  demo`.
- `RunView.createdAt` is the available reliable run chronology field.
- `CaseDetail.github` projects repository and a numeric pull-request field, but
  the current generator can populate that number with placeholder `1`,
  including on Cases later labelled with `run.sourceType = "github-pr"`.
  Repository plus this projected number therefore does not prove durable PR
  identity.
- `CaseDetail.run` supplies current run/head identity when available; the
  GitHub projection also carries the current head or explicit `null`.
- real Workspace cases preserve report-history order, whose owner writes
  newest first; `MAX_REPORT_HISTORY` remains 10 and is the conservative bound
  used for the Review-context map.
- current fixture Cases are `case-489`, `case-482`, `case-476`, `case-471`; the
  fixture has no canonical `RunView`, so the conservative provider correctly
  treats each as a singleton Review.

No required source assumption contradicted the implementation contract.

## 3. Identity separation

`ReviewId`, existing `CaseId` and `DecisionSubjectId` remain distinct:

- `ReviewId` is branded and opaque. With today's `CaseDetail` projection, the
  built-in provider always emits collision-safe singleton
  `case:<caseIdLength>:<caseId>` identity. It does not trust source type,
  repository, placeholder PR number, title, branch, label or display data.
  This can fail to merge but cannot falsely merge two Reviews.
- `ReviewIdentityProvider` remains the injection seam. A later trusted adapter
  may supply an opaque durable ReviewId only when an authoritative source
  independently proves upstream Review identity. Route encoding continues to
  treat every provider token as one opaque percent-encoded segment.
- `ReviewIndex` is rebuilt from each fresh authoritative Case snapshot and
  maps `ReviewId → { caseIds, currentCaseId }` without retaining Case records.
  Valid `run.createdAt` chronology selects the latest Case. Missing/equal
  chronology uses first authoritative snapshot appearance, matching the
  repository's documented newest-first report projection.
- `DecisionSubjectId` is separately branded, capability supplied and opaque.
  No R6C code derives it from repository, title, label or other display text.

Titles, labels, branches, recommendations and display strings participate in
neither Review identity nor context resolution.

## 4. State ownership and persistence

Per-Review convenience records are keyed by `ReviewId` and contain schema
version, redundant Review scope, mode, exact primary selection, valid open
Inspector candidate/context, comparison run, detection-only last Case,
semantic mode anchors and capture time. They never contain canonical records,
raw scroll pixels, relationship trails, Focus/DOM origins, overlays, Narrow
surface, notices or loading state.

Device-global preferences separately contain:

- Queue manual preference (`expanded | compact`);
- nullable preferred width for each manual Queue preference;
- nullable Inspector preferred width.

`null` leaves all presentation defaults to later milestones. No production
width or breakpoint constant exists in R6C.

The only active UI-state namespaces are:

- `lintel.r6.workstation.v1`;
- `lintel.r6.reviewContext.v1`.

Readers validate schema, shape, scope, semantic primitives, timestamps and
finite numeric bounds. Reads/writes catch Storage failures, and write results
claim persistence only after `setItem` succeeds. The Review map is bounded to
10 and evicts deterministically by oldest `capturedAt`, then ReviewId. Storage
keys are accessed only from the explicit allow-list; Storage is never
enumerated.

One embedded/map-key ReviewId mismatch rejects that Review record only. One
bad collection preference rejects that collection slot only. `clearUiState()`
removes only the two UI keys and returns `draftsPreserved: true`.

The collection preference facility owns opaque collection IDs, versioning,
bounded size, per-slot corruption isolation and per-slot clear behavior. It
defines no Reviews filter/group/search fields.

## 5. Route and history contract

The parser and formatter implement only:

- `/reviews`;
- `/reviews/<percent-encoded-review-id>`;
- `/reviews/<percent-encoded-review-id>/<overview|change|evidence|requirements|history>`;
- `/policies`;
- `/integrations`;
- `/settings`.

Review tokens are decoded/encoded as one opaque segment and never interpreted.
An explicit URL mode wins over stored mode. A valid stored mode fills an
omitted mode; canonical completion uses Replace.

Bare `/reviews` is the idle Reviews collection destination: no selected
Review, quiet Workspace, closed Inspector and no Review-route Replace. Review
selection occurs only through a deliberate Push action or a direct
`/reviews/<reviewId>` route. Device-global state does not persist Review
selection.

Destination changes, Review selection and committed mode activation return a
Push effect. Canonicalisation/restoration completion returns Replace. Object
selection, Inspector operations, relationship traversal, Queue state, Focus,
overlays and Escape return no route effect. Active mode reactivation is a
no-op. Applying a browser route (Back/Forward) returns no new history effect.
There is no object deep-link grammar.

## 6. Restoration and canonical reconciliation

Initial restoration implements R0–R9:

1. parse durable route syntax;
2. fault-tolerantly read structural convenience state;
3. accept the freshly supplied authoritative snapshot before semantic proof;
4. rebuild `ReviewIndex` and resolve Review to current Case;
5. resolve explicit mode, valid stored mode, then Overview;
6. independently re-prove selection, Inspector, comparison and semantic
   anchor identities against the current Case;
7. compare detection-only `lastKnownCaseId` to current Case;
8. derive Inspector open state and effective layout;
9. return Replace, discard, announcement and validated write-back evidence.

Bare `/reviews` remains idle. A first direct visit to a Review is Overview,
Inspector closed and no object selection. A projection failure/loading
snapshot cannot prove Review disappearance and therefore does not delete
Review convenience. A ready/empty authoritative snapshot that genuinely omits
an explicitly requested Review returns an unavailable selected Review without
substituting another Review and requests only that Review's convenience
removal.

Every accepted canonical refresh rebuilds the Review index. For the same
Review with a newer Case, the durable Review and URL remain stable while
`currentCaseId` advances. Selection, Inspector context/trail, comparison and
mode anchor are independently re-proved. Mode, manual Queue preference,
persistent Focus, overlays and shell-local state survive. One consolidated
announcement reports advancement and discards.

If an open Inspector context disappears, the Inspector remains logically open,
the missing `ContextRef` is retained as `unavailableContext`, no replacement is
chosen and focus state is not moved. The relationship trail is pruned to exact
surviving identities.

## 7. Queue, Inspector, Escape, actions and focus

`effectiveQueue()` accepts an injected `LayoutPolicy`; R6C provides no default
policy or numeric layout constants. Its structural priority is Narrow
sequential presentation, Focus hiding, contextual-pane yielding, manual
Compact, Expanded. The result has no manual-preference write field, so
temporary adaptation cannot overwrite the engineer's preference. There is no
glyph/mini Queue state.

Object selection and Inspector opening are separate actions. Opening is
explicit; same-context open is a no-op; replacement changes one logical
Inspector; relationship history and focus origin remain in memory; Review
switch clears Inspector scope.

Escape reduces exactly one layer: top overlay, open Inspector, primary
selection, then no-op. It does not navigate, change Review/mode, exit
persistent Focus, change Queue preference, pop relationship history or touch
draft/canonical state.

All invocation surfaces dispatch the same namespaced `ApplicationAction` to a
single pure dispatcher/reducer. The dispatcher re-resolves Review/object
targets against current action context and returns a truthful unavailable
reason for stale targets. Results describe state, route, focus and optional
announcement effects; they do no DOM, Storage, service or canonical mutation.

Focus records are memory-only opaque handles scoped by destination/Review.
Injected validity resolves return in this order: exact recorded origin,
registered origin region, Workspace primary, destination main. There is no
`document.body` fallback, fixed DOM ID or DOM ordering contract.

## 8. Human Decision draft boundary

The reserved `lintel.r6.humanDecisionDraft.v1` constant exists only in
`human-decision-draft-boundary.ts` and is not re-exported by the generic R6C
barrel. `persistence.ts` neither imports nor names it. R6C implements no draft
reader, writer, content schema, pruning, eviction, reassignment or canonical
mutation.

`DecisionDraftBinding` is binding metadata keyed/owned by `ReviewId`, with
capability-supplied Decision subject plus Case/run/head basis. Unknown subject,
run or head is indeterminate, never unchanged. Applicability precedence is:

`indeterminate > changed-decision-subject > stale-verification-basis > applicable`

Every verdict except `applicable` blocks submission; `applicable` itself is not
submission permission. Malformed binding integrity returns `quarantine`; no
R6C path returns automatic discard. Two Reviews with colliding
`DecisionSubjectId` values remain separate because ownership is exactly
`ReviewId`.

## 9. Deterministic scenario evidence

| Scenario | Executable proof |
| --- | --- |
| A | Bare Reviews remains idle; direct first Review visit defaults and Replace completion. |
| B | Valid per-Review revisit. |
| C | Invalid child reference discarded without losing valid mode/Inspector. |
| D | Review A → B → A scope clearing and durable selection. |
| E | Same title/different ID never rebinds. |
| F | Same Review/new Case with open Inspector and stable URL. |
| G | Same Review/new verification makes existing binding stale. |
| H | Compact → temporary yield → Compact. |
| I | Expanded → temporary Focus adaptation → Expanded. |
| J | Narrow full-surface Queue/Workspace sequencing. |
| K | Back applies durable mode only and creates no history entry. |
| L | Relationship trail stays local with no route effect. |
| M | Overlay survives canonical refresh. |
| N | Review disappearance versus comparison/history pruning. |
| O | Storage read/write failure and canonical projection-failure retention. |
| P | Malformed JSON and Review-scope corruption isolation. |
| Q | Identical result across visible UI, keyboard and Commands sources. |
| R | Missing focus-origin fallback ordering. |
| S | Same Review with changed capability-supplied Decision subject. |
| T | Colliding Decision subjects remain separate across Review owners. |

## 10. Invariant evidence

| Invariant | Result |
| --- | --- |
| I1 | Table of invalid change/finding/evidence/requirement refs: all discarded. |
| I2 | Manual preference unchanged across band/preference derivation matrix. |
| I3 | Invocation-source ActionResults deep-equal. |
| I4 | Reducer transition table proves only `queue-user-preference` changes manual preference. |
| I5 | Same-title replacement with new ID is not rebound. |
| I6 | Four Escape layers preserve route, Review, mode, Focus and Queue preference. |
| I7 | Embedded/map-key Review mismatch rejects the whole convenience record. |
| I8 | Serialized map key is ReviewId; CaseId appears only as detection metadata. |
| I9 | New Case removes every ref unique to the superseded projection. |
| I10 | Any unavailable required draft proof dimension is never applicable. |
| I11 | Two bindings with colliding subjects retain two ReviewId owners. |
| I12 | Pre-populated draft bytes survive UI clear byte-identically with zero draft-key access. |
| I13 | Exhaustive subject × case × run × head precedence matrix passes. |
| I14 | Malformed binding quarantines with zero write/remove mutation. |

An additional production-shaped regression constructs two Cases with the same
repository, projected PR number `1`, canonical source literal `github-pr` and
different CaseIds. It proves two default ReviewIds, two `ReviewIndex` entries,
no current-Case replacement and two independent persisted Review scopes. An
injected deterministic provider separately proves intentional grouping,
chronological current-Case advancement and stable selected Review identity.

All A–T and I1–I14 checks plus the placeholder-number regression pass in the
deterministic 36-test suite.

## 11. Storage-failure and corruption evidence

The executable doubles cover `getItem` throw, `setItem` throw, malformed JSON,
wrong schema/collection version, corrupt collection slot, Review scope
mismatch, over-bound Review map and byte-identical draft preservation during UI
clear. Failures remain local and write results remain truthful.

## 12. Files in accepted R6C

Present:

- `lib/r6c/review-identity.ts`
- `lib/r6c/route-contract.ts`
- `lib/r6c/context-identity.ts`
- `lib/r6c/state-model.ts`
- `lib/r6c/reducer.ts`
- `lib/r6c/restoration.ts`
- `lib/r6c/reconciliation.ts`
- `lib/r6c/queue-layout.ts`
- `lib/r6c/actions.ts`
- `lib/r6c/dispatch.ts`
- `lib/r6c/focus.ts`
- `lib/r6c/persistence.ts`
- `lib/r6c/human-decision-draft-boundary.ts`
- `lib/r6c/index.ts`
- `lib/r6c/__validation__/r6c.validation.ts`
- `lib/r6c/__validation__/node-hooks.mjs`
- `lib/r6c/__validation__/typecheck.cjs`
- `docs/r6/R6C_APPLICATION_STATE_INTERACTION_FOUNDATION_EVIDENCE.md`

`package.json` and `tsconfig.json` are unchanged. No dependency was installed.

## 13. Validation record

The repository contains no local `node_modules`. The first requested local
command, `npx tsc --noEmit --incremental false`, did not execute because npm
correctly refused an uncached network fetch (`ENOTCACHED`). No package or
configuration workaround was added.

An existing offline VS Code TypeScript 6.0.3 compiler was then injected into
the checked-in scoped compiler harness:

```powershell
$env:R6C_TYPESCRIPT_LIB = 'C:\Users\dkape\AppData\Local\Programs\Microsoft VS Code\df53daabb1\resources\app\extensions\node_modules\typescript\lib\typescript.js'
node .\lib\r6c\__validation__\typecheck.cjs
```

Result: `R6C TypeScript validation: 37 source files passed with TypeScript 6.0.3`.
The count includes R6C roots plus their transitive internal canonical imports.

```powershell
node --experimental-strip-types --no-warnings --import ./lib/r6c/__validation__/node-hooks.mjs ./lib/r6c/__validation__/r6c.validation.ts
```

Result: `R6C validation: 36/36 passed`.

Final scope validation also runs `git diff --check`, `git status --short`,
`git diff --stat`, explicit changed-path inspection and protected-path checks.
Because the accepted implementation remains intentionally untracked/unstaged
during freeze preparation, plain `git diff --stat` is empty; `git status
--short` is the authoritative scope listing.

## 14. Accepted non-blocking follow-ups and deferred work

- R6C is a pure foundation and has no production component integration.
- Production cross-Case Review grouping requires a future authoritative
  identity source and injected `ReviewIdentityProvider` before R6D/R6E can
  rely on durable grouping. R6C does not change the current canonical
  projection.
- Later presentation milestones must supply actual layout policies/defaults,
  semantic anchor refinements and DOM focus registration/validity.
- R6E owns collection filter/group/search value schemas.
- R6K owns draft content, storage, recovery/discard and final submission
  revalidation.
- R6L owns Commands ranking/search and shortcut vocabulary.
- R6M owns final responsive bands, widths and continuous resizing.
- No object-level deep link exists in this milestone.
- Independent review recorded these as non-blocking later work, not R6C
  defects requiring correction:
  - reconciliation currently retains only the active mode anchor while
    restoration can merge multiple mode anchors;
  - loading and unavailable selected-Review representation overlap, with
    authoritative status currently disambiguating;
  - applicability-coverage wording is broader than the deterministic sweep
    actually exercised;
  - scoped TypeScript validation depends on an available offline compiler
    path;
  - persistence invalidation is coarse at container level;
  - Inspector open/trail action distinction should be documented for
    downstream binding;
  - the unreachable `stored-review-unavailable` branch may be removed later.
