# R6I — Change and Diff Working Surface Evidence

## Final status

R6I is accepted with non-blocking follow-ups and ready to freeze. There are no blockers and no required corrections before freeze.

```text
Independent reviewer:
Opus 5, Extra effort

Initial independent verdict:
REVISE R6I
NOT READY TO FREEZE R6I

Reason:
native evidence documentation incorrectly attributed Workspace/Inspector divergence to the wrong PNG, and both documents claimed a nonexistent 120-file exercise.

Correction:
documentation-only.

Focused independent re-review verdict:
ACCEPT R6I WITH NON-BLOCKING FOLLOW-UPS
READY TO FREEZE R6I
R6I READY TO FREEZE

Required corrections before freeze:
None.
```

The implementation did not fail the initial review. That review found the product, source, validation, configuration, security/trust, accessibility, responsive boundaries, native build, and product-quality translation sound; revision was confined to evidence accuracy.

## Accepted product result

R6I delivers:

- a real production Change Review mode;
- a verification-oriented changed-file working surface;
- a canonical source-ordered changed-file document spine;
- no automatic first-file selection;
- selected-file progressive disclosure;
- truthful nullable line-count and risk handling;
- recorded-location presentation;
- an explicit `Inspect relationships` action;
- a dedicated Change Inspector;
- Change → Finding and Change → Evidence relationship presentation;
- Finding → Change, Evidence → Change, Change → Finding, and Change → Evidence traversal;
- Workspace primary selection independent from Inspector context;
- existing forward-only `relationshipTrail` semantics without Back or breadcrumb UI;
- the existing Inspector focus architecture;
- semantic collision-safe Change artifact identity;
- truthful discard of legacy positional Change refs;
- no R6C state, reducer, dispatch, restoration, or reconciliation modification;
- an unchanged production action registry.

## Canonical Change and diff truth

Canonical persisted Lintel analysis does not contain line-level diff content. Canonical changed-file truth contains only supported metadata such as path, optional additions/deletions, optional risk, recorded focused regions, canonical Finding relationships, and canonical Evidence relationships.

It does not contain:

- patch;
- hunks;
- before source;
- after source;
- old/new diff line numbers;
- rename state;
- binary state;
- diff completeness/truncation state.

Raw diff is transient analysis input and is not retained as Report/Case truth. Report-history persistence actively rejects raw-diff-shaped Report content on read and write.

R6I therefore correctly contains no diff renderer, patch parser, hunk model, syntax highlighting, source retrieval, network enrichment, or diff library. The product truthfully states that changed-file content is not part of the stored analysis. The absence of a diff renderer is a trust and persistence property, not incomplete implementation.

## Semantic Change identity

The accepted opaque identity is:

`change:${occurrence}:${file.path.length}:${file.path}`

Example:

`change:0:9:path/A.ts`

Accepted properties:

- identity derives from the canonical exact path;
- duplicate identical paths receive occurrence-qualified distinct ids;
- index movement across Cases does not change identity;
- another path cannot silently alias to an old Change ref;
- a removed path stops resolving;
- a renamed path receives another identity;
- old positional `change-0` refs do not resolve;
- old refs are discarded truthfully through existing R6C machinery;
- no migration silently remaps old refs;
- no R6C, state-model, persistence, or domain-schema change was introduced.

The adversarial proof uses:

```text
Case A:
path/A.ts
path/B.ts

Case B:
path/C.ts
path/A.ts
```

The old A reference continues to denote `path/A.ts` under semantic identity and never becomes `path/C.ts`. Primary selection, Inspector context, and `relationshipTrail` obey the same invariant.

## Conservative Review identity invariant

`conservativeReviewIdentityProvider` derives `ReviewId` from Case identity. Production currently injects no durable joining `ReviewIdentityProvider`; consequently one Review cannot span multiple Cases and Case advancement is structurally unreachable in current production configuration.

This is why the remaining positional Finding identity is not presently a user-reachable defect.

## Finding identity prerequisite

Finding artifact identity remains positional. Before any future durable joining `ReviewIdentityProvider` is introduced into production, Finding identity must receive equivalent semantic-identity adjudication and hardening.

This is a non-blocking architectural prerequisite, not a current product defect. It is not fixed in R6I. Historical R6C–R6H evidence remains untouched.

## R6H follow-up disposition

### NB-H1 — CLOSED BY R6I

R6I includes executable regression coverage that dispatches `inspector/traverse-relationship` with a genuinely unavailable target and proves `status === "unavailable"` and the entire state remains unchanged.

### NB-H2 — CLOSED BY R6I

Change has a dedicated Inspector projection in the same milestone that makes Change relationship targets user-reachable. Change no longer falls through to Evidence projection.

## Remaining non-blocking follow-ups

Exactly two R6I follow-ups remain.

### NB-I2 — duplicate exact-path relationship asymmetry

`changeIdByPath` remains first-occurrence-wins for exact paths. If a future ingestion path permits duplicate exact changed-file paths, relationship-edge behaviour for duplicate occurrences requires re-evaluation. Current canonical report generation deduplicates changed paths, so this is not production-reachable today. Relationship assembly is not altered in R6I.

### NB-I3 — source-text UI validation

Some R6I UI guarantees are protected by source-text assertions rather than rendered-DOM tests. Native PNG evidence corroborates the important visible behaviour. This remains later verification hardening only; no rendering test framework is added during R6I freeze.

## Resolved independent-review findings

### Previous evidence blocker — RESOLVED

The correct native divergence evidence is `evidence/r6i/R6I-1440-change-inspector.png`. It shows:

```text
Workspace selection:
docs/app/analytics.md

Inspector:
packages/next/src/client/analytics/send-ga-event.ts
```

The still proves coexistence of independent contexts, not the temporal transition that created them.

`evidence/r6i/R6I-1440-selection-inspector-divergence.png` is retained under its existing filename for path stability but shows a convergent state:

```text
Workspace selection:
packages/next/src/client/analytics/send-ga-event.ts

Inspector:
packages/next/src/client/analytics/send-ga-event.ts

Selected row:
In Inspector
```

Evidence claims follow inspected pixels, not filenames.

### NB-I1 — RESOLVED

No 120-file exercise exists. The unsupported claim was removed and is not recreated. Actual support for collection behaviour is: no collection cap by direct source inspection; canonical source order through existing R6I validation and source inspection; and bounded projection through the closed register shape and existing validation. These are not performance claims, and no bulk-count validation is claimed.

## Native repository evidence

Exactly four accepted PNGs are retained without rename or byte change.

### `evidence/r6i/R6I-1440-change-index.png`

Proves the real Change mode, real changed paths, canonical orientation, truthful nullable line-count/risk presentation, the mode-level no-diff statement, and no automatic first-file selection.

### `evidence/r6i/R6I-1440-selected-file.png`

Proves selected-file expansion, the changed-content-unavailability statement, recorded-location state, standing, and the explicit Inspector affordance.

### `evidence/r6i/R6I-1440-change-inspector.png`

Proves the dedicated Change Inspector, truthful standing and relationship presentation, and the genuine divergent Workspace/Inspector state described above.

### `evidence/r6i/R6I-1440-selection-inspector-divergence.png`

Despite its filename, the image content is convergent. It is used only for selected-file detail, Change Inspector alignment, `In Inspector` orientation, and truthful standing/relationship claims supported by its pixels.

## External temporal evidence

`R6I-traversal.mp4` remains external and is not copied into the repository or path accounting. It was manually inspected during candidate evidence preparation as temporal evidence for genuine Change → Evidence → Change traversal, including Inspector replacement, Workspace-selection preservation, and Review-mode URL stability.

Independent Opus verified the MP4 container metadata but could not decode frames in its review environment and is not represented as having personally inspected the video contents. The claimed interaction behaviour is independently corroborated by production source and executable deterministic validation.

## Native build evidence

The candidate native Windows build:

```text
Next.js 16.2.9
Compiled: 3.5s
TypeScript: 12.0s
Static pages: 47/47
Exit code: 0
```

Independent Opus native Windows build reproduction:

```text
Next.js 16.2.9
Compiled: 3.4s
TypeScript: 13.2s
Static pages: 47/47
Exit code: 0
```

Timing variation is immaterial. Both builds successfully produced 47/47 pages with exit code 0. No build was rerun during final evidence reconciliation.

## Validation and integrity

Final candidate validation, reproduced by independent Opus across all seven suites:

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

There is no generated-file drift.

## Production action registry

The final production action registry remains exactly ten:

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

`inspector/replace-context` remains unbound. The historical R6D registry remains exactly four. No action-registry source changed in R6I.

## Final accepted scope

Modified existing paths:

1. `app/(workstation)/SelectedReviewFoundation.tsx`
2. `app/(workstation)/ReviewModeUnavailable.tsx`
3. `app/(workstation)/ContextualInspector.tsx`
4. `lib/workspace-v2/relationships.ts`
5. `lib/workspace-v2/view-model.ts`

New paths:

1. `lib/r6i/labels.ts`
2. `lib/r6i/change-register.ts`
3. `lib/r6i/change-context.ts`
4. `lib/r6i/index.ts`
5. `app/(workstation)/ChangeMode.tsx`
6. `app/(workstation)/ChangedFileRow.tsx`
7. `app/(workstation)/change.module.css`
8. `lib/r6i/__validation__/r6i.validation.ts`
9. `docs/r6/R6I_CHANGE_DIFF_WORKING_SURFACE_EVIDENCE.md`
10. `evidence/r6i/R6I_VALIDATION_EVIDENCE.md`
11. `evidence/r6i/R6I-1440-change-index.png`
12. `evidence/r6i/R6I-1440-selected-file.png`
13. `evidence/r6i/R6I-1440-change-inspector.png`
14. `evidence/r6i/R6I-1440-selection-inspector-divergence.png`

Final freeze scope is exactly five modified existing paths plus fourteen new paths: nineteen literal paths. The candidate document is retired, the final evidence document replaces it one-for-one, and the external MP4 does not count.

## Protected-scope result

No R6C state/reducer/dispatch/restoration/reconciliation code, Finding identity, report/domain schema, report-history privacy logic, evidence hierarchy, prior R6A–R6H implementation/evidence, package, lockfile, TypeScript configuration, Next configuration, API, shell geometry, or generated file changed.

The `relationships.ts` edit remains limited to semantic Change identity construction and its smallest local occurrence counter. The `view-model.ts` edit remains comment-only.
