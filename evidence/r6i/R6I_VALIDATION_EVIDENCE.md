# R6I Validation Evidence

## Final classification and verdict

**NATIVE REPOSITORY EVIDENCE**

**NATIVE EXTERNAL TEMPORAL EVIDENCE**

**DETERMINISTIC / SOURCE EVIDENCE**

**ACCEPT R6I WITH NON-BLOCKING FOLLOW-UPS**

**READY TO FREEZE R6I**

**R6I READY TO FREEZE**

Independent reviewer: Opus 5, Extra effort.

Initial review returned **REVISE R6I / NOT READY TO FREEZE R6I** solely because evidence documentation attributed divergence to the wrong PNG and claimed a nonexistent 120-file exercise. The correction was documentation-only. Focused independent re-review found no blockers and no required corrections before freeze; the implementation itself was sound in the initial review.

## Canonical truth and privacy boundary

Canonical persisted changed-file truth contains path, optional additions/deletions, optional risk, recorded focused regions, canonical Finding relationships, and canonical Evidence relationships. It contains no patch, hunks, before/after source, old/new diff line numbers, rename state, binary state, or diff completeness/truncation state.

Raw diff is transient analysis input rather than Report/Case truth. Report-history persistence rejects raw-diff-shaped Report content on read and write. R6I truthfully implements changed-file verification without a diff renderer, patch parser, hunk model, syntax highlighting, source retrieval, network enrichment, or diff library.

## Deterministic and source evidence

R6I validation covers current-Case source truth, canonical ordering and duplicate handling, truthful nullable labels, raw-id non-disclosure, selection/Inspector independence, exact Change Inspector projection, all canonical traversal directions, unavailable target/noop/cycle behaviour, reconciliation, action boundaries, rendering safety, and semantic identity adversaries.

Semantic Change identity is:

`change:${occurrence}:${file.path.length}:${file.path}`

The Case A (`path/A.ts`, `path/B.ts`) and Case B (`path/C.ts`, `path/A.ts`) adversary proves that A remains A despite index movement and never aliases C. Primary selection, Inspector context, and `relationshipTrail` obey the same invariant. Duplicate paths receive occurrence-qualified identities; removed/renamed paths do not rebind; legacy `change-0` refs are discarded without migration or substitution.

`conservativeReviewIdentityProvider` derives Review identity from Case identity, and production injects no durable joining provider. Case advancement is therefore structurally unreachable in current production configuration.

Collection behaviour is supported by direct source inspection showing no collection cap, canonical source order through existing R6I validation and source inspection, and bounded projection through the closed register shape and existing validation. No performance or bulk-count validation claim is made.

## Native repository evidence

Exactly four unchanged PNGs are accepted:

- `R6I-1440-change-index.png` proves the real Change mode, real paths, canonical orientation, truthful nullable labels, no-diff statement, and no automatic selection.
- `R6I-1440-selected-file.png` proves selected-file expansion, the content limitation, recorded-location state, standing, and explicit Inspector affordance.
- `R6I-1440-change-inspector.png` proves the dedicated Change Inspector and genuine divergence: Workspace is selected/expanded on `docs/app/analytics.md`, while the Inspector shows `packages/next/src/client/analytics/send-ga-event.ts`; `In Inspector` appears on the unselected send-ga-event row. The still proves coexistence, not a temporal transition.
- `R6I-1440-selection-inspector-divergence.png` retains its filename for path stability but shows convergence: both Workspace selection and Inspector context are `packages/next/src/client/analytics/send-ga-event.ts`, and the selected row carries `In Inspector`. Claims follow inspected pixels, not filenames.

## External temporal evidence

`R6I-traversal.mp4` remains external and outside path accounting. It was manually inspected during candidate preparation for Change → Evidence → Change traversal, Inspector replacement, Workspace-selection preservation, and Review-mode URL stability.

Independent Opus verified container metadata but could not decode the frames and is not represented as having personally inspected the video contents. Production source and executable deterministic validation independently corroborate the claimed interaction behaviour.

## Native build evidence

Candidate native Windows build:

```text
Next.js 16.2.9
Compiled: 3.5s
TypeScript: 12.0s
Static pages: 47/47
Exit code: 0
```

Independent Opus native Windows reproduction:

```text
Next.js 16.2.9
Compiled: 3.4s
TypeScript: 13.2s
Static pages: 47/47
Exit code: 0
```

Timing variation is immaterial. The build was not rerun during final reconciliation.

## R6H follow-ups

- **NB-H1 — CLOSED BY R6I.** Executable coverage dispatches `inspector/traverse-relationship` with a genuinely unavailable target and proves `status === "unavailable"` with the entire state unchanged.
- **NB-H2 — CLOSED BY R6I.** Change has a dedicated Inspector projection in the same milestone that makes Change targets user-reachable and no longer falls through to Evidence.

Historical R6H evidence remains untouched.

## Finding identity prerequisite

Finding identity remains positional. Before any future durable joining `ReviewIdentityProvider` enters production, Finding identity requires equivalent semantic-identity adjudication and hardening. This is a non-blocking architectural prerequisite, not a current production defect.

## Remaining R6I follow-ups

Exactly two non-blocking follow-ups remain:

- **NB-I2 — duplicate exact-path relationship asymmetry.** `changeIdByPath` remains first-occurrence-wins. Duplicate-occurrence relationship behaviour requires re-evaluation only if a future ingestion path admits duplicate exact changed-file paths; canonical report generation deduplicates them today.
- **NB-I3 — source-text UI validation.** Some UI guarantees use source-text assertions rather than rendered-DOM tests. Native PNG evidence corroborates important visible behaviour; rendered tests are later verification hardening only.

## Resolved review findings

- **Previous evidence blocker — RESOLVED.** Divergence is correctly attributed to `R6I-1440-change-inspector.png`; the filename-retained `R6I-1440-selection-inspector-divergence.png` is documented as convergent.
- **NB-I1 — RESOLVED.** No 120-file exercise exists. The unsupported claim was removed and is not recreated. Actual collection support is source/shape/validation evidence, not a performance claim.

## Final validation gate

Independent Opus reproduced all seven results:

- R6I: 13/13 passed;
- R6H: 5/5 passed;
- R6G: 11/11 passed;
- R6F: 14/14 passed;
- R6E: 8/8 passed;
- R6D: 23/23 passed;
- R6C: 36/36 passed.

Prior validation files remain unmodified.

```text
npx tsc --noEmit --incremental false
PASS

git diff --check
PASS
```

No generated drift exists.

## Action and scope evidence

The production registry remains exactly ten: `route/navigate`, `route/apply`, `queue/set-manual-preference`, `queue/show-narrow-surface`, `review/select`, `mode/activate`, `selection/set`, `inspector/open`, `inspector/close`, and `inspector/traverse-relationship`.

`inspector/replace-context` remains unbound, historical R6D remains exactly four, and no action-registry source changed.

Final freeze scope is exactly five modified existing paths plus fourteen new paths: nineteen literal paths. `docs/r6/R6I_CHANGE_DIFF_WORKING_SURFACE_EVIDENCE.md` replaces the retired candidate path one-for-one. Exactly four PNGs remain; the external MP4 does not count.

No R6C code, Finding identity, report/domain schema, privacy logic, prior R6A–R6H implementation/evidence, package/configuration/lockfile, API, shell geometry, screenshot bytes, recording asset, or generated file changed during final reconciliation.
