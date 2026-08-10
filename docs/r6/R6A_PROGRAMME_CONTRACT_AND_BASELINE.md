# R6A — Programme Contract and Baseline

> **Status:** Accepted and frozen R6A baseline. Programme contract and factual
> repository baseline approved for consumption by R6B–R6P. No production
> implementation occurred in R6A.
>
> **Scope:** Repository-level contract for the authenticated R6 migration,
> current-owner inventory, no-regression evidence map, fixture catalogue and
> migration guardrails.
>
> **Authority order:** accepted R6 programme truth in the task that created
> this record; current implementation for factual location/status; accepted
> R5 freeze for the public boundary. If old prose and current source disagree,
> source determines the current fact but does not override protected R6 truth.

## 1. Programme contract

Lintel is an engineering-verification product for human- and agent-produced
pull requests. Its canonical record is:

`Change → Finding → Evidence → Missing proof → Requirement → Affected context → Readiness → Human Decision`

Lintel recommends; the accountable engineer decides. Recommendation, risk,
readiness, findings, evidence, missing proof, requirements and Human Decision
retain their existing meanings. A Human Decision is not an automatic outcome
of a recommendation, model, policy, condition-progress record or UI state.

R6 is an **authenticated application migration**, not a new verification
engine or a public redesign. Its target top-level information architecture is
**Reviews** (default), **Policies**, **Integrations**, and **Settings**. A
selected Review has exactly five working modes: **Overview**, **Change**,
**Evidence**, **Requirements**, and **History**. The target workstation is
`supporting Review Queue → dominant Workspace → contextual Inspector`; the
Inspector is not a permanent generic Review summary. When space is constrained,
two useful regions are preferable to three cramped ones.

### R6A–R6P responsibility and acceptance ownership

The programme is a sequence of bounded milestones, not a single generic
implementation phase. The table records accepted responsibility and gates only;
it does not design later APIs, URLs, geometry or component structure.

| Milestone | Bound responsibility | Dependency/gate | Acceptance responsibility |
| --- | --- | --- | --- |
| R6A | Contract, factual baseline, fixtures and migration limits. | Existing accepted R6 truth. | This document; targeted source/doc validation. |
| R6B | Private visual/interaction laboratory only. | R6A; shared canonical product truth. | Milestone-specific visual and interaction evidence; no production authority. |
| R6C | Application state and interaction foundation, including the common application-action/state architecture. | Accepted R6A and R6B direction. | State ownership, route/deep-link and shared-action evidence. |
| R6D | Production shell and unified left region behind an internal/controlled boundary. | Accepted R6B laboratory shell visual/interaction contract and R6C application-state/action foundation. | Geometry, no-regression and controlled-boundary evidence. |
| R6E | Reviews collection migration. | R6D foundation. | Queue ownership, collection behaviour and parity evidence. |
| R6F | Selected Review foundation and Overview. | R6E; selected Review truth remains shared. | Overview/default-state and Review identity evidence. |
| R6G | Evidence and contextual Inspector. | R6F. | Context replacement, evidence and Inspector evidence. |
| R6H | Requirements and verification relationships. | R6G shared selected-Review foundation. | Requirement/relationship parity and interaction evidence. |
| R6I | Change focus Workspace. | R6H. | Change-context, constrained-width and parity evidence. |
| R6J | History, comparison and readiness movement. | R6I. | Run/history, Review Diff and Readiness Delta parity evidence. |
| R6K | Human Decision presentation over the existing canonical decision path. | R6J and the frozen draft/transaction contract below. | Draft, stale/reconciliation, persistence-failure and lineage evidence. |
| R6L | Commands, keyboard and focus behaviour over the R6C action foundation. | R6C plus migrated applicable surfaces. | Shortcut scope/conflict, Commands and focus-path evidence. |
| R6M | Responsive workstation, continuous resizing and restoration. | R6D–R6L applicable geometry/state. | Wide/compact/narrow, resize/restoration and constrained-width evidence. |
| R6N | Policies, Integrations and Settings migration. | Core Reviews migration and shared shell/action foundations. | Destination, capability-vocabulary and parity evidence. |
| R6O | Scale, performance, accessibility and adversarial hardening. | Migrated surfaces and specified fixture coverage. | Large-state, accessibility, cross-state and adversarial evidence. |
| R6P | Production migration, default authenticated experience, cutover and freeze. | Replacement coverage and proven parity/no-regression. | Explicit final acceptance; then obsolete authenticated presentation may be removed. |

The migration progression is private laboratory → accepted shell contract →
controlled production R6 shell → mode-by-mode migration → supporting-domain
migration → cross-state/parity validation → R6 as default authenticated
experience → obsolete shell removal only after replacement coverage → R6
freeze. Review migration is **Overview → Evidence → Requirements → Change →
History → Human Decision**, followed by **Policies, Integrations and Settings**.

R6 excludes public R5 changes, new verification/domain capability, accounts,
billing, entitlement, SSO/RBAC, realtime collaboration, comments, assignments,
presence, generic workflow authoring/graphs, Verification Trace, native
packaging, dark mode, and any fabricated Team or Enterprise capability. It also
defers final URL schema,
implementation APIs, CSS/type tokens, production pane widths/breakpoints and
motion constants, and Commands ranking/search implementation to their owning
later milestone. R6L owns that Commands implementation choice.

Existing reviewer-ownership and suggested-reviewer data remains secondary
metadata. R6 must not promote it into collaboration/assignment capability or a
fifth Queue group, and this baseline neither deletes nor redesigns it.

## 2. State ownership contract

Canonical product truth refreshes. UI state may restore only after validation.
First visit to a Review defaults to **Overview with Inspector closed**; a
revisit may restore that Review's still-valid mode and context. Invalid context
is discarded, never rebound. Review investigation state never crosses into
another Review. Manual Queue preference and temporary responsive collapse are
different state and the latter must never overwrite the former.

| State class | Canonical/current owner | Lifetime and persistence intent | Reset/invalidation | Canonical product truth? |
| --- | --- | --- | --- | --- |
| Review/domain/verification record | `lib/report-generator.ts` generates Report records; domain relationship builders are `lib/evidence-hierarchy.ts`, `lib/merge-contract.ts`, `lib/verification-pack.ts`. `lib/mock-report.ts` is a fixed sample, not a canonical owner. | Current production browser-local Report persistence is `lib/report-history.ts` (`lintel.reportHistory.v1`); GitHub App has a separate local file store. R6 reads/shared-adapts, never forks it. | Refresh/reprojection follows current record/run; missing or invalid stored reports fail closed. | Yes. |
| Review workflow state | `lib/review-state.ts` owns `lintel.reviewState.v1`. `lib/workspace-v2/persistence.ts` is the current narrow V2 writer for status; legacy `app/workspace-legacy/page.tsx` still writes status and owner. | V2 key: `reviewStateKeyForReport` (repository/title/input-label). Legacy Workspace reads a workspace-scoped key derived from its group identity before an unscoped fallback, and writes the scoped key. These scopes are not interchangeable. | Invalid/unavailable storage withholds mutation; records are not Human Decisions. | Separate local workflow state, not canonical Human Decision truth. |
| Condition progress | `lib/condition-progress.ts` owns `lintel.conditionProgress.v1`, keyed by report identity plus canonical condition set. `lib/workspace-v2/persistence.ts` is the current narrow V2 clear/reopen mutation seam. | Browser-local cleared-condition keys; legacy Workspace reads the same progress for display but is not a second V2 writer. | Condition-set/report identity change produces a different key; progress is not proof, requirement resolution or a Human Decision. | Separate workflow-state mutation, not canonical Human Decision truth. |
| Legacy decision-history log | `lib/decision-history.ts` owns `lintel.decisionHistory.v1`; legacy `app/workspace-legacy/page.tsx` appends status/ownership events. | Browser-local event/history log keyed from the report/legacy group identity. `lib/verification-pack.ts` may consume supplied history events. | Clear/delete of legacy records removes this log; it does not determine canonical Decision applicability. | No. It is not a second canonical Human Decision ledger. |
| Contract-recheck record | `lib/contract-recheck.ts` defines/builds the record. `lib/report-history.ts` persists it as an optional field of a Report-history entry; `lib/github-app-store.ts` builds/retains the optional GitHub analysis-run record. | No separate browser-local recheck key is established. `lib/verification-pack.ts` consumes a supplied recheck record for its projection. | New/changed run or contract changes the applicable record; absence remains explicit. | Derived record, not a second Review/domain store. |
| Generated-report session path | `lib/report-generator.ts` defines `lintel.generatedReport.v1`; `app/new/page.tsx` writes the payload to session storage before durable persistence, and legacy Workspace may write its handoff payload. `app/report/page.tsx` reads it only for the explicit session path. | Session-only additional generated-report read path; durable Report history remains the authoritative V2 adapter source. | Session end, invalid payload or failed durable write leaves only the truthful session/unavailable outcome. | No. |
| Canonical run/provenance | `lib/canonical-review-run.ts` | Attached manifest: source, run/commit identity, versions, fingerprints, analysis source and reproducibility classification. | New run; failed/historical states retain explicit limitation. | Yes. |
| Recommendation/readiness/relationships | `lib/report-generator.ts` and `lib/readiness-delta.ts`; relationship builders above. `lib/workspace-v2/real-adapter.ts`, `queue-projection.ts` and `projections.ts` are read-only presentation projections/adapters, not domain owners. | Derived from the canonical report/run and comparison, not an R6 UI cache. | Recompute/reproject when run, comparison or report changes. | Yes, as derived canonical record. |
| Human Decision ledger | `lib/human-decision-ledger.ts`; exclusive production writer `lib/workspace-v2/decision-mutations.ts` | Browser-local `lintel.humanDecisionLedger.v1`, append/verified-read-back semantics and lineage. | Current head/applicability and referenced canonical records govern effectiveness; malformed/stale commands are refused. | Yes. |
| Route/navigation | Current route entries: `app/nav-config.tsx`, `app/workspace/page.tsx`, `app/(public)/layout.tsx` | Route path/query remains navigation state; R6 may migrate authenticated presentation but not invent final URL semantics here. | Invalid route identity fails closed/no substitute. | No. |
| Review investigation | Current `WorkspaceR4Client` selection, origin, comparison, mode, collapsed groups and scroll; return payload `app/workspace-return-context.ts` | Presently session-only `lintel.r4f.workspaceReturnContext.v1`; R6 may persist validated per-Review convenience state. | Change Review, unavailable record/object, incompatible mode, unavailable comparison or source mismatch clears only invalid context. | No. |
| Device-local layout preference | No dedicated current owner: current `WorkspaceR4Client` keeps Queue/Inspector/focus state in memory and copies it into return context. | R6 may restore device-local preferences; preference is never domain truth. | User reset, unavailable storage, or an invalid stored value. Responsive adaptation is temporary. | No. |
| Human Decision draft | Current `app/workspace/HumanDecisionDialog.tsx` form state; it submits only through the decision service. | **Current R4 fact:** in-memory and unrecorded. **Protected R6 target:** device-local, private, persistent, unrecorded, per Review and associated with its canonical verification basis. | The R6 draft becomes stale when its basis changes; it is deleted only after successful canonical recording or explicit discard. A failed persistence attempt preserves it. | No. |
| Guided Tour | `app/guided-tour.tsx`, mounted by root `app/layout.tsx`. | Device-local `lintel.guided-tour.v1` completion state plus mounted transient step/target/dialog state; steps couple route, target and optional tab and can programmatically navigate. | Finish/skip, route/target absence and unmount clear transient state; persisted completion is convenience only. | No. Global/transient surface later routing and focus work must account for. |
| Theme and forced-theme state | Root `app/layout.tsx` owns pre-paint path classification/bootstrap and mounts `ThemeProvider`; `app/theme-provider.tsx` owns `lintel.themePreference.v1` and `setForcedTheme`. | Device-local preference is retained. Current `PRODUCT_LIGHT_PATHS`/ `LEGACY_DARK_PATHS` classify paths at bootstrap; supported AppShell pages and specialist `/workspace` force light, while `/workspace-legacy` forces dark. | Preference changes do not override a forced route lock; path arrays are current route coupling/debt, not future R6 architecture. | No. Current production authenticated surfaces are forced light; dark is confined to the legacy rollback surface. |
| Ephemeral interaction | React state/refs in `WorkspaceR4Client`: drawers, palette, dialogs, focus return, pending/result notices, live announcements. | Mounted interaction only. | Close, navigation/unmount, completion/failure and accessibility focus return. | No. |
| Derived/cache projection | `lib/workspace-v2/real-adapter.ts`, `queue-projection.ts`, `projections.ts`, `app/use-operational-projection.ts` | In-memory/read-only projection of the canonical stores. | Always replace on authoritative reload; never persist as a competing truth source. | No; derived. |

### Human Decision draft and submission invariant

The protected R6 Human Decision draft is device-local, private, persistent and
unrecorded. It belongs to one Review and the canonical verification basis
against which the engineer authored it. It cannot alter canonical Review state
before successful canonical recording. A basis change makes it **stale**;
submission is blocked until the engineer deliberately reconciles or discards
it. It is never silently rebased, overwritten or time-expired.

R6K defers storage implementation, transaction types and UI composition, but
inherits this programme-level transaction:

`freeze the current submission snapshot → confirm it still applies to the current canonical basis → attempt the existing canonical persistence path`

On successful canonical persistence, the recorded Human Decision becomes
canonical, History/decision lineage reflects that record, authoritative Review
state is refreshed/reprojected, and only then is the matching local draft
removed. On failure, canonical Review/Human Decision state remains unchanged;
the local draft and entered engineer input remain available; truthful failure
feedback is shown; and no optimistic or fake recorded Decision state appears.

If verification changes while the decision interaction is open or before
submission, the draft becomes stale. If a conflicting canonical Human Decision
appears, preserve the local draft and require deliberate reconciliation or
discard rather than silently overwriting it. Any future action that clears
local Lintel application state must disclose that private unrecorded drafts
will also be removed.

A logically identical already-recorded canonical command is an idempotent
unchanged/no-op outcome, not a duplicate ledger append. A write whose expected
canonical record cannot be confirmed through authoritative read-back is not
successful recording: it remains a truthful failure/recovery state, must not
clear the local draft, and must not show a fake recorded Decision.

### Current-to-R6 state gap, not a product contradiction

`app/workspace/WorkspaceR4Client.tsx` currently initialises Overview, a live
Inspector on wide viewports, and in-memory Queue/Inspector state. Its
session-return payload can restore that state. Its initial responsive effect
also writes Queue collapse into the same state as the manual control. This is
the factual R4 baseline. R6's first-visit closed Inspector and separate manual
Queue preference are protected target behaviour; later implementation must
change presentation-state ownership without changing canonical review truth.

## 3. Factual authenticated route and surface baseline

`app/layout.tsx` owns root fonts/global CSS, pre-paint theme bootstrap,
`ThemeProvider` and `GuidedTour`; it does **not** mount the authenticated
`AppShell`. Authenticated/supporting pages currently mount `AppShell`
individually. `app/app-shell.tsx` dispatches to `LegacyAppShell` for
`/workspace-legacy` and `SharedProductShell` otherwise. `/workspace`
uses its specialist Workspace shell and does not mount `AppShell`.
`app/nav-config.tsx` currently exposes five global areas (Reviews,
Operations, Governance, Integrations, System). This is current repository
baseline, not R6D implementation guidance; it differs from the accepted
four-area R6 IA and is a migration disposition, not an excuse to reinterpret
current records.

| Route/surface | Current purpose and source | Current shell/state owner | Status | R6 disposition / milestone | Protected behaviour and material debt |
| --- | --- | --- | --- | --- | --- |
| `/workspace` | Primary selected-review investigation; `app/workspace/page.tsx`, `RealWorkspaceR4Bootstrap.tsx`, `WorkspaceR4Client.tsx` | Specialist R4 shell; `real-adapter`, report history, decision/persistence services; session return context | Current production authenticated surface | Replace incrementally, starting after private R6B; final cutover R6P | One real selected record; five modes; local truth, fail-closed loading/empty/unavailable states, contextual Inspector and ledger semantics. Current geometry/state ownership is legacy R4. |
| `/new` | Intake and report generation; `app/new/page.tsx`, `app/api/generate-report/route.ts` | Generic AppShell; intake-local state then report-history write | Current | Retain/migrate in Reviews | Deterministic baseline, optional guarded model path and only verified durable handoff may select a Review. |
| `/report` | Read-only Case File; `app/report/page.tsx` | Generic AppShell; exact report/ledger projections | Current | Migrate or retain as contextual detail; decide later | Exact durable identity; no competing Workspace or decision writer. |
| `/home`, `/review-operations` | Browser-local cross-review orientation/operations; `app/home/*`, `app/review-operations/*`, `lib/operational-review-projection.ts` | Generic AppShell, URL/local projection | Current | Retire/re-distribute later into Reviews; no top-level R6 Operations | Must remain truthful local projection until replacement coverage. |
| `/review-policies` | Bundled policy/profile browse and impact boundary; `app/review-policies/*`, `lib/review-policies.ts` | Generic administrative shell | Current | Migrate to Policies | No enforcement/assignment mutation or parallel policy truth. |
| `/integrations` | Capability configuration/status inventory; `app/integrations/page.tsx` | Generic administrative shell/API status reads | Current | Migrate to Integrations | Vocabulary remains `Configured`, `Unavailable`, `Blueprint`, `Export only`; no implied connection. |
| `/settings` | Local data/model/runtime/settings records; `app/settings/*` | Generic administrative shell; local storage owners | Current | Migrate to Settings | Truthful browser/device scope, recovery and report-history action boundaries. |
| `/team` | Browser-local responsibility/workspace boundary; `app/team/page.tsx`, `lib/team-workspace.ts` | Generic administrative shell/local store | Current supporting surface | Retire/re-distribute later; not R6 top-level IA | Current team/workspace scoping participates in legacy workspace-scoped review-state keys. Do not retire it or its scope semantics until migration has deliberately accounted for still-relevant scoped records; this does not authorise Team/RBAC/collaboration capability. |
| `/github-action`, `/slack-handoff` | GitHub Action documentation and Slack export handoff; matching `app/*/page.tsx` | Generic shell; no canonical Review writer | Current supporting surfaces | Retain as Integration support or retire later | GitHub Action is `Blueprint`; Slack is `Export only`. |
| `/workspace-v2`, `/workspace-legacy`, `/visual-lab/workspace-r4`, `/visual-lab/workspace-v2` | Compatibility, rollback and accepted R4 labs; matching `app/` sources | Isolated legacy/lab owners | Present, non-target | Retire only after replacement coverage at R6P | Labs are not production truth; legacy removal needs parity/no-regression evidence. |
| `/api/generate-report`, `/api/github-*` | Analysis/GitHub boundaries; `app/api/**` | Server/API and canonical libraries | Current capability surface, not authenticated IA | Retain unchanged beneath presentation migration | Security, provenance, idempotency and deterministic behaviour are protected. |

### Boundaries redistribution

There is no R6 top-level **Boundaries** destination. The existing boundary
content is redistributed by its durable responsibility, not collected behind a
new generic summary:

| Current boundary material | R6 destination | Protected meaning |
| --- | --- | --- |
| Selected-review findings, evidence, missing proof, requirements, readiness and Human Decision | Reviews / selected Review | Canonical verification and accountable-decision meaning remains on the Review. |
| Cross-review orientation and operations (`/home`, `/review-operations`) | Reviews | They remain projections of canonical Review state, never a second operational domain. |
| Bundled policy profile, provenance, applicability and non-enforcement limits | Policies | Policy browsing does not create an applied/enforced policy truth. |
| GitHub configuration/status, GitHub Action blueprint, Slack export and provider boundaries | Integrations | Capability vocabulary and external-write limits remain exact. |
| Local browser data, model/runtime settings and local responsibility/workspace metadata currently exposed by `/settings` and `/team` | Settings | Local scope is not a Team, account, role or collaboration claim. |

### Frozen public boundary

The public route registry lives in `app/_public/routes.ts`; public pages live
in `app/(public)/**`; the accepted freeze is
`docs/r5/R5E2H_FINAL_PUBLIC_SYSTEM_FREEZE.md`. R6 must not alter public
routes, public shell/primitives, frozen Home/Hero or public design. It protects
truthful metadata behaviour, but does not prevent a future explicitly scoped
deployment task from resolving the existing deployment configuration blockers.
They remain factual and unresolved: authenticated logged-in routes require the
correct `noindex` boundary, and no valid production HTTPS origin/canonical
configuration is present (`app/_public/metadata.ts`). Neither resolution is a
public redesign.

## 4. No-regression and capability matrix

“Current evidence” means source inspected for R6A plus the named accepted
documentation where available. The repository has no `test`/`lint`/`typecheck`
script in `package.json` and no discovered `*.test.*`/`*.spec.*` files; this
table does not invent executable coverage. Later validation is required before
R6P where stated.

| Protected area | Canonical/current source | Current evidence | R6 may change | Prohibited regression | R6P evidence expected |
| --- | --- | --- | --- | --- | --- |
| Verification ontology | `lib/report-generator.ts`, `lib/evidence-hierarchy.ts`, `lib/merge-contract.ts` | Source; README model | Presentation/projection only | Rename/redefine/fork any stage | Canonical record/projection parity. |
| Recommendation vs Human Decision | `lib/report-generator.ts`, `lib/human-decision-ledger.ts` | Source; R4/R5 contracts | Labels, placement, workflow | Automatic decision or merged authority | Decision/recommendation separation scenarios. |
| Canonical Review/domain state | `lib/report-generator.ts` generates Reports; `lib/report-history.ts` owns persisted browser Report storage. `lib/workspace-v2/real-adapter.ts` is a read-only projection consumer, not a canonical owner. | Source | Adapters only | R6 local store/domain duplicate | Refresh/fail-closed parity. |
| Deterministic verification | `lib/report-generator.ts`, `lib/canonical-review-run.ts` | Source | Invocation/presentation only | Rule/result semantic change | Same-input deterministic checks. |
| Optional model assistance | `app/api/generate-report/route.ts`, `lib/report-normalizer.ts`, `lib/canonical-review-run.ts` | Source | Configuration presentation | Model becomes authority, silent fallback claim, exact replay claim | Guard/fallback/provenance scenarios. |
| GitHub App auth | `lib/github-app-auth.ts` | Source | Integration UI only | Credential/JWT/token weakening | Configured and unavailable states. |
| HMAC-SHA256 webhook | `lib/github-app-webhook.ts`, webhook route | Source: raw-body HMAC and timing-safe comparison | Nothing semantic | Accept unsigned/changed comparison | Valid/invalid signature exercises. |
| Idempotent PR processing | `lib/github-app-store.ts`, webhook route | Source: delivery and completed-head checks | Nothing semantic | Duplicate analysis/comment for a delivery/head | Duplicate delivery/head scenarios. |
| GitHub decision comment | `lib/github-app-comments.ts`, webhook route | Source: marker, create/update and stored id | Presentation of status only | New comment per update or Human Decision publication claim | Create/update/failure evidence. |
| Run manifests/fingerprints/replay | `lib/canonical-review-run.ts`, `app/api/github-app/route.ts` | Source | Display only | Unstable fingerprint, manifest rewrite or deterministic replay loss | Manifest/fingerprint/replay parity. |
| Readiness Delta / Review Diff | `lib/readiness-delta.ts`, `lib/verification-pack.ts` | Source | Presentation only | Reclassification or comparison fork | Previous/current run comparison. |
| Agent Change Passport | `lib/change-passport.ts`, `lib/builder-verifier-boundary.ts` | Source | Presentation only | Treat declarations as evidence | Agent/human provenance cases. |
| Human Decision draft/basis | Current `app/workspace/HumanDecisionDialog.tsx`; canonical writer `lib/workspace-v2/decision-mutations.ts` | Source; current draft is memory-only | Persistent private per-Review R6 draft/restoration under frozen contract | Let draft affect canonical state, silently rebase/expire/overwrite it, or clear it after a failed write | Draft/stale/reconcile/discard/submit/failure scenarios. |
| Human Decision canonical persistence | `lib/human-decision-ledger.ts`, `decision-mutations.ts` | Source | Invoke existing service only | Second writer/store or non-verified write | Record/supersede/reaffirm/withdraw/read-back lineage. |
| Authenticated IA/five modes | Accepted R6 contract; current `app/nav-config.tsx`, `WorkspaceR4Client.tsx` | Source; current IA is five-area R4 | Incremental IA/shell migration | Home/Boundaries top-level, missing Review mode | Navigation/mode parity. |
| Queue/Workspace/Inspector | Accepted R6 contract; current Workspace client | Source | Geometry and presentation state | Permanent generic Inspector or cramped forced third pane | Width/responsive/context replacement acceptance. |
| Queue grouping / basis | `lib/workspace-v2/queue-projection.ts` | Source: recorded review state → current/applicable effective Human Decision → open blocking state → recommendation fallback | Presentation and future helper structure | Treat fallback as recorded workflow state; let stale/moved-head Decision retain Reviewed; reorder the semantic precedence | Grouping-basis scenarios, including explicit `recommendation-fallback` labelling. |
| Boundaries redistribution | Accepted R6 contract; current `/team`, `/review-operations`, `/home` | Source | Move presentation responsibility gradually | New top-level Boundaries | Exact destination coverage. |
| Integration vocabulary | `app/integrations/page.tsx`, R4F4 contract | Source/docs | Layout only | “Connected/Sent” claim where unavailable/Blueprint/export only | Configured/unavailable/Blueprint/export-only matrix. |
| Frozen R5 public product | `app/(public)/**`, `app/_public/**`, R5E2H | Source/docs | R6A: nothing. A future explicitly scoped deployment/configuration task may make only the metadata/configuration correction genuinely necessary for the recorded authenticated-route `noindex` or production-origin/canonical blockers. | Any public route, content, visual/design-system, shell/primitive or accepted-experience change; any blocker correction that fails to preserve truthful metadata behaviour. | R6A diff confirms no R5 changes. A later scoped correction must show preserved frozen experience and truthful metadata, not a public redesign. |
| Truthful deployment claims | README, Trust/public metadata, GitHub sources | Source/docs | Authenticated wording may become clearer | Hosted/team/production claims not implemented | Claim audit. |
| `noindex` / origin-canonical blockers | `app/_public/metadata.ts`, `app/robots.ts`, R5E2G/R5E2H | Source/docs | Must be separately solved, not hidden | Claim launch/deployment readiness while open | Explicit deployment evidence or carried blockers. |

### Current Queue grouping / basis semantics

The current Queue grouping contract is semantic, not a freeze of
`queue-projection.ts` helper structure. It applies this precedence:

1. explicit recorded review state;
2. effective Human Decision only while it is current/applicable;
3. open blocking state;
4. recommendation fallback.

A stale, withdrawn, unavailable or moved-head Human Decision must not keep a
Review falsely **Reviewed**. Open blocking state is evaluated before any
recommendation fallback. The fallback basis is explicitly
`recommendation-fallback`: it is not persisted workflow state and must never
be presented as if an engineer recorded it.

## 5. Fixture catalogue

Fixtures reuse the existing sample/adapter systems. “Specified” means a useful
R6 validation target exists but is not an executable repository fixture yet; it
does not create new domain semantics.

| Stable identifier | Purpose/stress dimension | Established expected state | Actual source | Later use | Capability expectation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `example/b2b-redemption-api#482` | Canonical unresolved review | **Add fallback handling for failed discount-code retrieval**; `TESTS_REQUIRED`, risk 46/100 `MEDIUM`, 4 open/2 blocking requirements, Human Decision `PENDING` | `lib/mock-report.ts`; `lib/workspace-v2/fixture-adapter.ts`; `lib/landing-theatre-fixtures.ts` | All review/mode/decision parity | Deterministic/read-only fixture; no mutation/network | Implemented. |
| `clean-utility` | Clean/approve path | Derived through real deterministic generator; no fabricated findings | `lib/sample-pr-input.ts` (`CLEAN_APPROVE_SAMPLE`, `PR_SAMPLES`) | Empty/ready states | Deterministic, sample provenance | Implemented. |
| `provider-retry` | High-risk retry/provider failure | Tests-required/idempotency stress through deterministic sample | `lib/sample-pr-input.ts` (`RISKY_TESTS_REQUIRED_SAMPLE`) | Findings, proof, requirements | Deterministic, sample provenance | Implemented. |
| `payment-refund` | Historical/moved-head and decision lineage | Sample supplies decision-ledger demonstration, stale/supersede intent | `lib/sample-pr-input.ts` | History/decision migration | Local ledger/applicability; sample label | Implemented as source sample; not a separately executable R6 scenario. |
| Agent-produced `payment-refund` passport | Agent declaration/provenance | Builder/provider/model, claims, assumptions and uncertainty remain claims until supported | `lib/sample-pr-input.ts`; `lib/change-passport.ts` | Passport/boundary views | Deterministic baseline; optional model remains advisory | Implemented. |
| Degraded capability cases | Missing model/GitHub configuration, storage/read failure, unavailable comparison | Must withhold capability/authority rather than substitute fixture truth | Existing guards across `app/api/generate-report/route.ts`, `lib/github-app-auth.ts`, `real-adapter.ts` | Error/loading/retry/capability UI | `Unavailable` truthful; no fake Connected | Specified as cross-cutting states; no dedicated fixture catalogue entry. |
| Large-scale synthetic set: ~1, ~100, ~500 Reviews plus large findings/evidence/requirements/diff/history | Queue, density, focus, resize and rendering adversarial targets | No production-scale/adoption claim; must be synthetic and labelled | No current executable fixture source found | Scale/performance acceptance | Deterministic/generated, isolated from domain semantics | Specified, not implemented. |

## 6. Migration boundaries

1. There is one canonical Review/domain model, one recommendation truth, one
   Findings/Evidence/Requirements truth, and one Human Decision persistence
   path.
2. Thin presentation adapters are acceptable. Parallel R6 verification
   semantics, duplicate domain stores, duplicate Human Decision writers and
   competing recommendation sources are not.
3. Old and new authenticated UI may coexist temporarily only over shared
   product truth. Presentation may migrate incrementally; product meaning may
   not fork.
4. Private lab precedes production shell migration. Production migration is
   incremental. Obsolete authenticated presentation is removed only after
   replacement coverage plus demonstrated parity/no-regression evidence.
5. The frozen R5 public product remains outside this migration.

### Shared application actions and routing

One application action has one behavioural meaning even when invoked through
different UI affordances. Visible controls, menus, keyboard shortcuts and
Commands must not develop competing implementations of the same application
behaviour. R6C owns the common application-action/state foundation, or an
equivalent architecture; R6L owns Commands, final keyboard expression,
shortcut scope/conflict handling and focus behaviour over that foundation.
Commands remains global acceleration; collection search/filter remains locally
owned. This does not freeze action function names or API structure.

Meaningful durable product navigation should be deep-linkable where
appropriate. Top-level destination, selected Review and selected Review mode
are durable navigation concepts. Transient Commands, dialog and overlay state
are not URL or browser-history navigation; device-local pane/layout preferences
are restoration state, not product URLs. Fine Inspector/context selections
should not automatically flood browser history. Relationship investigation may
maintain local semantic history distinct from browser Back, while browser Back
remains meaningful product/browser navigation. Final URL schema,
push/replace mechanics and exact object deep-link rules remain R6C work.

## 7. Programme guardrails

### Spatial and interaction

- Maintain one coherent supporting-left-region direction, Workspace dominance
  and contextual Inspector. Queue and Inspector must support bounded
  resize/collapse/restoration; two useful regions win over three cramped ones.
- Commands is global acceleration. Collection search/filter remains locally
  owned. Durable navigation and transient investigation are distinct.
- Local loading/error state preserves unrelated workstation geometry.
- Prototype starting geometry only: Queue roughly 232/264/340px with a
  48–52px compact state; Inspector roughly 300/336/440px; Workspace useful
  minimum roughly 720px. Starting responsive bands are Spacious ≥1600,
  Standard 1360–1599, Compact 1100–1359, Constrained 900–1099, Narrow <900.
  These are not production constants.

### Typography

Geist Sans is the default candidate for human application language. Geist Mono
is for genuine technical identifiers, paths, commands, hashes and code;
comparable application numbers normally remain sans with tabular numerals.
Machine enums and human presentation are distinct. Regular/medium hierarchy,
alignment and “dense locally, spacious globally” should remove unnecessary
cards, borders, badges and metric treatment. Exact tokens remain later work.

### Performance and accessibility

Stable shell geometry, Review identity through mode changes, and Inspector
context replacement without unrelated Workspace reconstruction are durable
requirements. Commands overlays the existing workstation. Pointer resize must
ultimately track pointer movement without unnecessary broad rendering. Loading
is localised; large Queue/diff/Evidence/Requirements/History states remain
usable. Core workflows are keyboard-first with visible focus, deliberate focus
return, meaningful semantics, no colour-only communication, 200% zoom,
forced-colours, reduced motion and context-appropriate targets.

Resize separators must be keyboard accessible. Focus order must be logical;
Escape unwinds a transient/local interaction rather than navigating the
application. Commands, Queue traversal and Review-mode navigation must be
keyboard operable. Long identifiers must remain readable and discoverable, and
constrained-width states remain accessible. This does not promote a historical
32px dense-control size into a universal R6 rule, or freeze final shortcut
vocabulary or DOM focus order.

Prototype motion starting ranges only: selection 80–120ms; small controls
90–140ms; Commands 120–180ms; Inspector open 160–210ms/close 140–190ms; Queue
collapse 160–220ms; focus transformation 180–240ms; modal 140–200ms. The
durable requirement is restrained purposeful motion with reduced-motion
meaning preserved, not these exact values.

## 8. Evidence and freeze discipline

Every R6 milestone follows:

`Contract → bounded implementation → automated validation → visual evidence → interaction evidence → adversarial validation → accept or revise → freeze`

A TypeScript compile or production build alone is never completion. Evidence is
milestone-specific. R6A requires factual contract/baseline evidence, not
redesigned visual evidence. This record's factual anchors are the source files
named in its route, state, capability and fixture tables. Current gaps are
explicit: there is no configured executable test suite, dedicated degraded
fixture set or large-scale fixture set. R6B or later production UI work did
not start as part of R6A.

For a production R6 milestone, select the evidence package as applicable from
its contract/scope, exact changed files, targeted automated validation,
protected-parity/no-regression statement, wide/compact/narrow visual evidence,
interaction evidence, keyboard/focus path, responsive/overflow evidence,
milestone-relevant accessibility evidence, adversarial/large-fixture result,
known limitations, allocated Claude judgement, and accepted commit/freeze
identifier. This is a selection discipline, not a mechanical visual-evidence
requirement for non-visual work such as R6A.

## 9. R6A acceptance gate

R6A can be accepted only when materially relevant authenticated
capabilities/surfaces are factually mapped; canonical verification and Human
Decision owners are identified; state ownership is explicit; current evidence
is distinct from later-required evidence; the required fixture family is
catalogued as implemented or specified; migration boundaries prevent semantic
forks; spatial, interaction, typography, performance and accessibility
guardrails are recorded without freezing later implementation; exclusions and
deferred work are explicit; and later milestones can consume the contract
without architectural rediscovery.

It also requires confirmation that no R6B private visual/interaction laboratory
work and no R6B-or-later implementation work began as part of R6A: R6A is
contract/baseline work only. Targeted R6A validation must pass, and the
required independent review, any bounded corrections, explicit acceptance and
freeze must occur before merge. These conditions were satisfied before R6A was
accepted and frozen.

## 10. R6 milestone Git lifecycle

Every R6 milestone, R6A through R6P, follows this execution discipline:

`fresh updated main → dedicated milestone branch/worktree → bounded milestone implementation → validation/evidence → Claude review where allocated → bounded corrections → explicit acceptance/freeze → final milestone commit → merge into main → verify main → remove merged worktree → delete merged local/remote milestone branch → begin the next milestone from newly updated main`

Never carry an old milestone branch into the next milestone. Never merge before
that milestone's acceptance gate passes. Keep commits scoped to the current
milestone and preserve unrelated repository work. R6A records this discipline
only; this correction pass performs no commit, merge, worktree removal or
branch cleanup.

## 11. R6A validation record

R6A changes documentation only. Validation performed for this record is
recorded with the change handoff: internal Markdown-link existence check,
`git diff --check`, changed-file scope inspection and a public/authenticated
production-file diff check. No TypeScript/build command is required for these
documentation-only changes, and no validation/fixture support code changed.
