# R4F.2 — New Review and Case File

> **Milestone:** R4F.2 — New Review and Case File
> **Status:** Production implementation complete; automated build, type and repository checks pass. Browser evidence and any limitations are recorded in the temporary untracked `R4F2_HUMAN_REVIEW_PACKAGE/`.
> **Production routes:** `/new` and `/report`.
> **Authority:** Accepted R4A–R4E contracts and the accepted R4F.1 shared logged-in product system.
> **Excluded:** Workspace redesign, operational-home work, integrations/settings maturity, governance/team maturity, collaboration/auth claims, a graph canvas, dependency changes, and R4F.3 implementation.

## Lifecycle ownership

R4F.2 owns two consecutive, non-competing phases of one local review lifecycle:

`New Review intake → canonical local report → Workspace investigation → Case File reference`

`/new` owns source selection, review context, analysis profile, scope verification, execution feedback and verified local persistence. `/workspace` remains the authoritative active-investigation surface and is unchanged by this milestone. `/report` owns the dense read-oriented record of one exact review identity. It does not own requirement mutation, task progress, decision recording, source-code reconstruction or a second investigation workspace.

## New Review architecture

The New Review is a four-step guided flow:

1. **Source** — choose one explicit acquisition path and complete only its relevant fields.
2. **Context** — name the review, repository and optional technology context.
3. **Review** — choose the review profile and truthful analysis execution path.
4. **Scope** — verify the exact source, context, profile, scope and persistence boundary before starting.

Form state is component memory only until a canonical response is returned and verified. Source changes with meaningful source-specific input use the shared consequential-dialog anatomy and explain exactly which input will be cleared. Validation remains field-specific, moves focus to the first invalid field, and preserves valid input. The browser-leave guard applies while meaningful unpersisted input or a running analysis exists.

Successful analysis uses the existing `/api/generate-report` contract, report-history helper and canonical run identity. It rejects duplicate canonical run persistence, reads the history back, and treats that read-back as the durability boundary. Workspace association is recovery metadata and cannot downgrade a verified report if it fails. Durable success moves to `/workspace?reportId=<exact-id>`. If navigation does not complete, both exact Workspace and Case File recovery links remain visible. Explicit sample reviews remain session-only and never enter durable history.

## Supported sources and capability truth

| Source | Current state | Input and boundary |
| --- | --- | --- |
| Manual diff | Available | Pasted diff text. No repository network write. |
| Public GitHub pull request | Available | Uses the existing public import endpoint; the URL is validated and imported before analysis. |
| Connected GitHub pull request | Configuration-dependent | Uses the existing GitHub App status and pull-request endpoints. The option remains explanatory when unconfigured and cannot advance. |
| Controlled sample | Available, explicitly non-durable | Uses an existing labelled sample profile for safe evaluation. It remains session-only and is never silently substituted. |

No source path claims repository mutation, authentication, team ownership or external collaboration. A failed import preserves entered context and presents a retryable error.

## Analysis truth and scope verification

The API exposes a read-only capability response that identifies deterministic analysis as available and model-assisted analysis as configured or unavailable. It exposes provider/model labels only and no credential material. The user can explicitly select:

- **Deterministic only** — canonical baseline generation with no model request.
- **Model-assisted** — available only when configured; if capability changes between selection and execution, the canonical response is labelled as a deterministic fallback.

The existing automatic request behaviour remains compatible for callers that omit the new `analysisMode` field. The New Review does not describe the model path as authoritative: provenance is confirmed from the returned canonical run.

Review profiles are explicit scope presets, not hidden capability switches. The final Scope step repeats the source, identity, profile, included checks, excluded checks, execution path and local-persistence consequence before analysis can begin.

## Progress, failure and recovery

Analysis progress uses ordered phases for preparing the input, deterministic analysis, optional model assistance and canonical finalisation. Progress copy does not announce a later phase as complete before the response confirms it. A request failure retains all input and offers a retry. A canonical persistence failure retains the successful payload in memory and offers **Retry local save** without rerunning analysis. Duplicate run identities resolve to the already-stored report. Session-only success provides an explicit Case File link and makes the lack of durable Workspace identity clear.

## Persistence and privacy

- Form and progress state live only in React component memory.
- Durable reports use the existing report-history storage contract and no new persistent intake key.
- The existing session recovery key is used only for an explicitly session-only successful report.
- Samples never enter report history.
- Workspace association uses the existing browser-local store and exact report identity.
- No credentials, connection secrets or raw environment values are rendered or captured.

## Workspace transition

Workspace is the immediate destination after verified durable persistence because it owns investigation and accountable action. The exact report identity is carried in the query string. The shared shell navigation-context mechanism continues to own normal return-to-Reviews context; R4F.2 adds no competing navigation store. Case File links retain the same exact identity.

## Case File architecture

The Case File resolves data through `createRealWorkspaceAdapter(window.localStorage)`, the same production projection boundary used by Workspace. An explicit `reportId` must resolve exactly; an unknown identity renders unavailable and never substitutes another record or fixture. Without an ID, the route uses the adapter's canonical default review and exact raw-history match. Session and demonstration records are available only through explicit `?session=1` and `?demo=1` modes and carry visible provenance labels.

The read-oriented record order is:

1. case identity, recommendation and risk;
2. run, head and provenance;
3. compact Review Map;
4. findings;
5. evidence and derived missing proof;
6. requirements;
7. affected context and readiness movement;
8. run history and Human Decision history;
9. export and handoff boundaries;
10. exact **Open in Workspace** for durable records.

Loading, empty, unavailable and partial states do not show stale detail. Absent values remain labelled `Unavailable`, `None recorded` or `Unresolved` according to their actual meaning.

## Case File versus Workspace

| Case File | Workspace |
| --- | --- |
| Read, scan, reference, copy and export one exact review record. | Investigate, traverse context and perform accountable local actions. |
| Fixed information order and bounded relationships. | Five investigation modes, Queue, Inspector and primary selection. |
| No requirement or Human Decision mutation. | Owns supported condition mutation and Human Decision recording. |
| Session/sample records may be viewed with explicit provenance. | Authoritative actions require a durable exact review identity. |

## Compact Review Map

The map is a fixed, horizontally bounded eight-stage orientation sequence:

`Change → Finding or Observation → Evidence → Missing proof → Requirement → Affected context → Readiness → Human Decision`

It is not a graph canvas, workflow editor or inferred dependency network. The fixed wide strip communicates orientation only: its arrows do not assert relationships and do not alter the accepted `Change → Observation → Evidence → Requirement → Human Decision` evidence model. Selectable node records come from stored adapter projections, with relationship rows restricted to explicit canonical IDs or deterministic exact-path links already asserted by the projection. Each item distinguishes:

- **Stored** — present in canonical report/history or adapter records.
- **Deterministic** — derived from exact stored fields or the accepted deterministic hierarchy.
- **Unavailable** — the source record cannot support the requested value.
- **None recorded** — the collection or relationship is known and empty.
- **Unresolved** — a referenced record identity is known but cannot be resolved.

On mobile, the full stage strip becomes one current stage with previous/next sequential controls while the same selected-node detail and relationship truth remain available. The Review Map remains read-only and bounded at every width; no free-form graph behaviour exists.

## Findings, evidence and requirements

Findings expose recorded severity, title, description, exact file/line where stored, and evidence references. Evidence exposes type, source, location and verification state. Missing proof is derived deterministically from evidence and requirement state and is labelled as derived rather than persisted. Requirements preserve blocking/important distinction, stored condition state, evidence linkage and unavailable context. Case File does not provide clear, reopen, assign, progress or accept-risk actions.

## Run and Human Decision history

Run history shows current canonical identity, head/provenance, immediately compatible prior-run comparison when available, initial-run truth otherwise, and explicit unavailable values. Human Decision shows the current ledger projection and append-only historical events supplied by the real adapter. No-decision and unavailable-ledger states remain distinct. Applicability, including stale decisions, is displayed but never recalculated into an unrecorded decision.

## Export and handoff

Copy and `.txt` download are local exports of the currently resolved Case File and its current Human Decision projection. They do not mutate the review or contact an external service.

- **GitHub App:** configuration/status only; no Case File external-write control.
- **GitHub Action:** Blueprint only; no workflow installation or dispatch claim.
- **Slack:** Export-only; no message is sent and no delivery claim is made.

The existing handoff routes remain the detailed capability boundaries. The Case File only links to them and labels their truth.

## Responsive, accessibility and performance behaviour

Both routes preserve reading and task order from wide desktop through 1024px narrow, 768px tablet and 390px mobile layouts. The New Review becomes a single-column sequential form. The Case File moves its section outline into a bounded horizontal index and reduces the map to one-stage navigation on mobile. At effective 200% zoom the document reflows without requiring page-level horizontal scrolling; only the explicitly labelled desktop map region may scroll horizontally before the mobile transfer.

Native fieldsets, labels, headings, lists and buttons provide semantics. Validation uses focus and live-region announcements. Dialog focus/escape/restore behaviour comes from the accepted shared consequential dialog. Every pointer action has a keyboard control, focus indicators remain visible, and reduced motion suppresses nonessential transition duration.

Initial route shells render without loading the report generator. The Case File adapter projection is computed only for the resolved record; map and export text are memoised from that projection. No polling, external write, new dependency, new service, global state store or new durable storage namespace was introduced.

## Validation record and known limitations

The temporary untracked `R4F2_HUMAN_REVIEW_PACKAGE/` contains viewport captures, scenario notes and the exact browser validation record. The milestone also runs `npm run build`, `npx tsc --noEmit`, `git diff --check`, branch/status/stat/name-only checks, and a cached-diff audit.

Known product limitations remain truthful:

- public and connected GitHub imports depend on their existing network/configuration boundaries;
- the model-assisted path depends on server configuration and may return a labelled deterministic fallback;
- browser-local history retains its existing cap and device/profile scope;
- raw diffs do not manufacture repository head metadata;
- missing proof remains a deterministic read-only projection where no canonical stored object exists;
- Case File export is local and external handoff remains status, Blueprint or Export-only;
- there is no authenticated collaboration, server persistence or organisation scope.

## R4F.3 handoff

R4F.3 owns the Operational Home and Review Operations: operational orientation, real saved-work views, bounded recent-review context and dense cross-review engineering records without duplicating the Workspace Queue. R4F.2 contributes only an exact lifecycle boundary and durable link targets. It does not begin R4F.3, change `/review-operations`, add an operational dashboard, or reinterpret Case File as the operational home.
