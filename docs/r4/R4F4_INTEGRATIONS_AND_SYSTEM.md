# R4F.4 — Integrations and System

> **Milestone:** R4F.4 — Integrations and System  
> **Production routes:** `/integrations` and `/settings`  
> **Authority:** Accepted R4A–R4E and R4F.1–R4F.3 contracts  
> **Boundary:** Truthful capability inspection and browser-local administration; no hosted organisation, credential, billing, policy or team authority

## Outcome and route ownership

R4F.4 creates `/integrations` as the dedicated capability-management route and matures `/settings` into System administration. Both use the accepted R4F.1 administrative shell. They contain no Review Queue, Workspace Inspector, readiness action or Human Decision action.

`/integrations` owns current capability state, configuration scope, data-boundary inspection and genuine next actions. `/settings` owns read-only configuration truth, bounded local-data records and the one genuine destructive browser-local history action. `/github-action` remains the Blueprint reference and `/slack-handoff` remains the Export-only handoff route. Team and policy maturity remain assigned to R4F.5.

## Administrative shell and context restoration

Administration has explicit **Back to Reviews**, calm section navigation, a route-owned central surface, and a bounded modal navigation drawer below the administrative breakpoint. It retains one `main` landmark and one page `h1`; neutral selection remains distinct from blue focus.

Back to Reviews reuses `lintel.r4f.workspaceReturnContext.v1`; R4F.4 creates no second restoration mechanism. The tab-scoped record contains identifiers and presentation context only. Workspace revalidates the exact review and any resolvable mode, selected object, Queue/Inspector preference, focus mode and scroll context. Missing authority fails closed to the review list rather than substituting another review.

The validated controlled flow entered System from `R4F.4 controlled local review` and returned through `/workspace?restore=1` to that exact selected browser-local review.

## Integration capability vocabulary

| State | Meaning |
| --- | --- |
| Connected | A current authenticated external connection is verified. |
| Configured | Required environment configuration is verified; connection or installation is not inferred. |
| Available | Usable now without stored external configuration. |
| Not configured | Implementation exists but required current-environment configuration is absent. |
| Blueprint | Reference/setup material only; no install, execution or external write. |
| Export-only | Local handoff content only; Lintel does not deliver it. |
| Unavailable | Current status or a required execution boundary failed or is unsupported. |

Connected and Configured are deliberately different. GitHub App status can prove server configuration but not installation. Connected GitHub workspace status is shown only when its endpoint proves authenticated source access. Available never means Connected, while Blueprint and Export-only never use positive connection colour.

The bounded record set contains only existing capabilities: GitHub App, public GitHub pull-request import, connected GitHub workspace import, GitHub Action, Slack handoff, deterministic local analysis, model-assisted analysis, and local Case File copy/download. There is no fabricated marketplace inventory, owner, sync timestamp, installation date, usage count, health telemetry, monitoring or background ingestion.

## Integration information and boundaries

A selected record discloses, where relevant, category, purpose, current state, configuration requirement, data-read and external-write boundary, credential boundary, review/repository/local/environment scope, execution capability, Human Decision publication boundary, environment status, next action and unsupported explanation.

Capability reads run once per route load or explicit Retry; there is no polling. Partial or unavailable status withholds unresolved facts instead of retaining stale success. Search, filters and selection are unpersisted presentation state.

Current actions preserve existing boundaries:

- public GitHub import performs one explicit external read and no write;
- connected GitHub import remains environment-gated and read-only;
- GitHub Action opens Blueprint material only;
- Slack opens/copies Export-only content and does not send;
- deterministic analysis is local;
- model-assisted analysis may receive a submitted diff only after explicit selection, requests `store:false`, and performs no repository or collaboration-system write;
- Case File copy/download is an explicit local export.

Provider keys and secret-presence details remain server-side. Browser responses contain only safe configured/unconfigured state and the provider/model identity already supplied by the existing capability endpoint.

## System architecture and configuration scope

System is one quiet route with in-page sections for Review and analysis, Provider status, Local data, Privacy and security, Usage, Import and export, and Storage and recovery.

Every row names an exact scope such as **This review**, **Current browser**, **Current environment**, **Future analyses**, **All local reviews**, **Repository**, **Local export** or **Planned**. Browser-local state is never presented as an organisation-wide setting.

Implementation status, profile availability, provider state, retention limits and unsupported future paths are read-only records, not toggles or credential controls. A mutation control appears only when a current contract exists. The only System mutation is clearing the bounded Report-history key. There is no provider credential storage, default-profile persistence, broad backup/restore, cloud recovery, policy editing or team setting.

## Provider and analysis boundaries

Deterministic verification remains authoritative. Model-assisted synthesis is additive and environment-gated. New Review selects execution per review; System invents no global default.

The provider record discloses safe configured/unconfigured/unavailable state, provider/model identity where available, server-side execution scope, submitted-diff boundary, `store:false`, labelled deterministic fallback, no external-system write, and unchanged Human Decision authority. Bring-your-own-provider and local/internal model execution remain Planned with no mutation, credential or execution claim.

## Local data, retention and usage

System reads the canonical `lintel.reportHistory.v1` contract used by Workspace, Case File, Operational Home and Review Operations:

- at most ten newest valid Reports;
- canonical content, source, timestamps and run/head/provenance only where recorded;
- raw diff rejected from durable history;
- invalid records rejected rather than presented as Case Files.

The Human Decision ledger is separate, append-only, identity-bound where possible and bounded to 80 events. Clearing Report history does not clear Human Decisions, navigation context, session/sample records or any external system.

Usage truth is limited to local Case File count, the ten-record cap and current model-assistance availability. Token billing, spend, quota, plan limits, team activity, trends, daily usage, monitoring and organisation telemetry are explicitly unavailable rather than estimated.

## Consequential-action safety

**Clear Report history** appears only when valid browser-local Reports exist. The shared dialog states the exact key/count, irreversible consequence, untouched records, current state, proposed zero-record state and unresolved open-route memory condition. Cancel is neutral and the destructive primary is red.

Opening moves focus to Cancel. Focus is contained; Escape cancels and restores the trigger. If confirmed, the handler clears only Report history, performs authoritative read-back and reports success only at zero. Write, partial-clear or read-back failure preserves the most truthful state and announces failure assertively.

The browser pass created one explicitly controlled deterministic Case File to expose the genuine action and validate its one-record scope. It opened and dismissed the dialog without confirming deletion; no pre-existing data was removed.

## Import, export, privacy and recovery

Import/export rows state source, destination and write consequence. General backup import/export remains Unavailable because no duplicate/conflict contract exists. Storage recovery is browser-local only: storage access and history validation are inspectable, unknown identities fail closed, and cloud backup/sync/organisation restore is Unavailable.

No surface exposes a credential, performs a silent external write, publishes a Human Decision, treats provider output as accountable authority or implies hosted certification. Transient diff handling and durable raw-diff exclusion are separate records.

## Responsive, keyboard and accessibility

- Wide/normal retain visible administration and dense list/detail responsibility.
- Narrow reduces lower-priority metadata without crushed values.
- Tablet and smaller move administration into a bounded modal drawer.
- Mobile Integrations becomes list then detail with **Back to capabilities**.
- Mobile System becomes a sequential flow with locally scrollable section navigation.
- Destructive confirmation avoids sticky/modal overlap.
- No document horizontal overflow exists at validated wide, 1024px, 768px, 390px or effective-200% layouts.

Both routes use native controls and complete accessible names. Live status is polite; destructive/failure feedback is assertive. The drawer and consequential dialog use dialog semantics, focus containment, Escape dismissal and trigger restoration. Reduced-motion styles remove non-essential transition behaviour. Browser validation confirmed one logical `h1`, one `main`, focus entry/return and keyboard access to return, sections, filtering, detail and cancellation.

## Performance and state boundaries

Capability reads are one bounded `Promise.all` per route load or Retry. There is no polling, continuous sync, layout loop, duplicated route tree, unbounded store, animation library, marketplace dependency or data-grid dependency. Local records retain accepted caps.

## R4F.5 deferrals

R4F.4 does not implement governance templates, applicability preview, policy apply/clone, team membership, assignments, organisation administration, hosted roles/permissions, collaboration, approval chains or shared settings. Authentication, billing, pricing, deployment administration, dark mode, theme controls, public landing redesign and R5 motion are also out of scope.

## Remaining limitations

- GitHub App configuration does not prove installation.
- Connected GitHub import depends on current environment access.
- Provider credential mutation and usage/billing telemetry do not exist.
- Slack does not deliver; GitHub Action does not install or execute.
- Browser-local history has no broad backup/restore or cloud recovery.
- An open route may retain its in-memory projection until reload after history deletion.
- Overridden viewport captures may contain the in-app browser's duplicated edge-strip artifact; DOM viewport and overflow measurements are recorded separately.

