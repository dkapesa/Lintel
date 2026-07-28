# R4B Route Ownership and Capability Matrix

> **Milestone:** R4B — Workspace Information and Interaction Architecture
> **Status:** Binding R4B contract pending human acceptance
> **Scope:** Five-area route-family ownership, primary and contextual destinations, review-context transfer, route-header responsibility, mobile navigation, integration truth states, and cross-route capability boundaries.
> **Authoritative inputs:** The six accepted R4A contracts under `docs/r4/`; the binding R4B task prompt; current `app/nav-config.tsx` route evidence; targeted Workspace, history, run, evidence, and Human Decision evidence.
> **Excluded scope:** Creating or redesigning routes, production navigation changes, authentication, hosted teams, live integration setup, policy enforcement, dependencies, and R4C visual implementation.
> **Next owning milestone:** R4C — Workspace Reconstruction Lab.

## Area ownership

| Rail area | Primary destination | Primary responsibility | Contextual/supporting destinations | R4 capability status |
| --- | --- | --- | --- | --- |
| Reviews | `/workspace` | Select and verify one review through the full evidence chain and accountable Human Decision. | `/new` intake; `/report` contextual Case File/deep lineage. | `/workspace`, `/new`, `/report` are current routes; R4 composition is planned. |
| Operations | `/review-operations` | Inspect dense local operational review records, filtering, and workload state. | `/team` for real local ownership/responsibility metadata. | Current browser-local routes; no organisation analytics or shared presence. |
| Governance | `/review-policies` | Inspect local policy/profile/template records and their truthful application capability. | No second current route. Settings links remain System links. | Current prototype/conceptual records; no enforcement or repository assignment. |
| Integrations | Planned `/integrations` primary area destination | Explain and manage truthful external capability states without merging distinct delivery contracts. | `/github-action` blueprint; `/slack-handoff` export-only; configured GitHub App contextual handoff; provider configuration link to System. | Primary destination is planned for R4F and is not created in R4B. Existing supporting routes retain current boundaries. |
| System | `/settings` | Inspect system, analysis, model/provider, provenance, and local-environment configuration truth. | No second current route. | Current settings are largely read-only/conceptual where persistence is absent. |

The Rail marks exactly one area from pathname ownership. It does not mark two areas because a contextual review link is present. The Rail remains compact and does not list all destinations. Entering an area opens its primary destination. Contextual destinations live in the route header or compact area menu.

The current production navigation defaults Review to `/new` and Integrations to `/github-action`. R4 route ownership supersedes those defaults after the owning implementation milestones: Reviews defaults to `/workspace`; the future Integrations area defaults to planned `/integrations`. R4B records this direction only and changes no route.

## Route register

| Route | Owning area | Route header owns | Review-context rule | Mobile route navigation | Truthful capability state |
| --- | --- | --- | --- | --- | --- |
| `/workspace` | Reviews | Selected-review identity inside the Workspace; Reviews area context; `Check a pull request` secondary action | Establishes and owns stable `reportId`; unknown ID is unavailable with no substitution | Opens Review list, then selected-review sequence; global navigation remains a disclosure | Real local history by default; explicit fixture source; empty/partial/unavailable/invalid states. |
| `/new` | Reviews | `New Review`, input source, analysis mode/source, local/session result handoff | Accepts optional return context but never overwrites the current review before a valid result exists; successful durable creation links to exact `reportId` | Full-step intake; Back returns to prior review/list when supplied | Deterministic current; configured model optional; session/durable result truth; no hidden fallback claim. |
| `/report` | Reviews | `Case File`, repository/PR/title, durable/session/demo provenance, run and Human Decision lineage | Preserves exact `reportId` only for durable local records; session/demo uses explicit non-durable context | Opens as contextual review detail with Back to Workspace/review list | Durable local decisions only where supported; session/demo read-only for durable decision storage. |
| `/review-operations` | Operations | `Review Operations`, local-device scope, filters, record density | May link to `/workspace?reportId=…`; keeps a `Return to operations` token in route state, not Workspace domain state | Operational list → record → contextual Workspace link | Browser-local operational projection, not organisation analytics. |
| `/team` | Operations | `Team`, local responsibility source and limitations | Review links carry exact local identity when real; fixture people remain labelled | Local ownership list → responsibility detail → linked review | No authentication, RBAC, presence, shared team, or real fixture people. |
| `/review-policies` | Governance | `Review Policies`, profile/template source and capability | A review-context link may carry repository/review identity for explanation only; it does not imply assignment | Policy list → preview/detail → explicit supported action | Prototype/conceptual and largely read-only; no repository enforcement or assignment without a later contract. |
| `/settings` | System | `System`, configuration source, persistence truth, provider/model capability | A `Return to review` link may preserve exact identity; settings never owns review selection | Settings categories → detail; global navigation disclosure | Read-only/conceptual where persistence is absent; no claim that displayed provider values are saved. |
| `/github-action` | Integrations | `GitHub Action blueprint`, conceptual scope and non-capabilities | May show `Return to review` when invoked from handoff context; never records a post state | Blueprint document with Back to Integrations/review | `Blueprint`; does not install, execute, connect, analyse, comment, or post. |
| `/slack-handoff` | Integrations | `Slack handoff`, exact export format and delivery boundary | Receives review summary context only when explicitly supplied; no external delivery state is written | Export step with Back to review/Integrations | `Export-only`; copy/download only, no API, OAuth, workspace connection, schedule, or send. |
| Planned `/integrations` | Integrations | `Integrations`, truthful connection/capability inventory, owner/access only when real | A review-context entry highlights its configured handoff capability and retains Return to review | Integration list → capability detail → setup/info route | Planned R4F route; no route exists or is implied current in R4B. |

## Review-context transfer

### Context payload

Only these review values cross routes:

- stable local `reportId` when one exists;
- repository and PR identity as display context;
- invoking route and a single `Return to [context]` label;
- selected run ID only when the destination truthfully understands it;
- source/provenance label.

Primary object, Workspace scroll positions, Queue filters, Inspector presentation, and unsaved decision drafts never become generic cross-route query state. They remain in the mounted Reviews session. A Human Decision modal must close or resolve before route navigation; a dirty draft invokes discard warning.

### Preservation rules

- `/workspace` ↔ `/report` preserves durable `reportId`, current run when valid, and review source. Returning reselects that review and recomputes the object context.
- `/workspace` → `/new` preserves a return link only. It does not copy recommendation, risk, or decision into a new analysis.
- Operations/Team → Workspace passes exact real local `reportId`; unknown or unavailable identity receives the normal unavailable state.
- Governance/Integrations/System → Workspace passes review identity only when the user arrived from a real selected review. Otherwise `/workspace` applies its truthful default-selection rule.
- Leaving Reviews never converts the destination into a Review sub-mode and never leaves the Reviews Rail area selected.

## Route-header ownership

Every supporting route header owns:

1. area and route name;
2. route-specific primary task;
3. source/capability limitation that changes interpretation;
4. one primary action only when currently supported;
5. contextual Back/Return link when the route was opened from a selected review;
6. route-local search/filter/sort controls when applicable.

The route header never repeats Global Rail controls, Workspace recommendation/risk, full selected-review summary, or unavailable actions. `/workspace` uses its selected-review header instead of a generic route hero.

## Mobile area navigation

The Global Rail becomes one labelled `Product areas` disclosure. Opening it presents five area controls, with the current area first and marked. Selecting an area navigates to its primary destination. A second `In this area` section lists current contextual/supporting destinations.

Mobile Back hierarchy is:

1. close menu/drawer/dialog when safe;
2. return from contextual route to its invoking review/area;
3. return from an area detail to its primary destination;
4. rely on browser Back for earlier route history.

The menu contains no review records. Reviews remain in the Review-list step.

## Integration truth-state vocabulary

| State | Required evidence | Interface statement | Allowed action | Prohibited implication |
| --- | --- | --- | --- | --- |
| `Connected` | Implemented connection plus verified active configuration/credentials and current status. | `[Capability] is connected for this environment.` Include scope/owner only when real. | Open/manage current supported connection; perform supported action. | Organisation-wide connection, endorsement, or permissions not present in data. |
| `Available` | Implemented capability exists, but configuration or credentials are absent/incomplete. | `[Capability] is available but not configured.` | Open setup instructions or System configuration when implemented. | Connection, successful delivery, or background operation. |
| `Blueprint` | Documentation or conceptual architecture only. | `Blueprint — does not install, execute, connect, or post.` | Read/copy blueprint material. | Executable integration. |
| `Export-only` | Local copy/download formatting exists. | `Export-only — produces content but does not deliver it.` | Copy/download. | OAuth, connected workspace, scheduling, send, delivery receipt. |
| `Unavailable` | Implemented capability cannot establish required configuration/source/service now, or environment does not expose it. | Name the exact missing or failed dependency and recovery. | Retry or open setup/info when real. | Silent fallback or success. |

`Configured` is supporting language for a real capability and maps to `Connected` only when the current status is actually verified. It does not become a sixth state.

## Capability matrix

| Capability | Current repository truth | Area/route owner | Workspace exposure | Action architecture | R4 status |
| --- | --- | --- | --- | --- | --- |
| Stored review history | Browser-local `lintel.reportHistory.v1`, validated reports, maximum 10, raw diff rejected | Reviews `/workspace`; Case File `/report` | Queue and History limitation | Read/select; no hosted claim | Current. |
| Explicit fixture | `source=fixture`, read-only sample snapshot | Reviews `/workspace` | Persistent sample label; no mutations | Inspect only | Current. |
| Canonical run manifest | Run/head/base, source, fingerprints, versions, provider/model, reproducibility, prior run when present | Reviews History; System for configuration meaning | Header/History/Inspector | Inspect; compare valid runs | Current data, R4 composition planned. |
| Evidence hierarchy | Classes, strength, provenance, status, run/head, staleness, explicit relationship IDs | Reviews Evidence | Records and Inspector | Inspect/traverse only | Current core; dedicated missing-proof R4 object planned where absent. |
| Exact condition clear/reopen | Only canonical Conditions before merge with exact condition key | Reviews Requirements | Requirement capability | Verified persisted clear/reopen | Current. |
| Derived requirement | No persisted condition identity | Reviews Requirements | Read-only capability explanation | Inspect only | Current. |
| Local review-action status | `Open`, `In progress`, `Done`, `Not needed`; task tracking | Reviews/Operations | Contextual task state | Persist task progress where supported | Current; never proof/waiver. |
| Requirement acknowledgement | No general durable contract | Reviews Requirements | Read-only explanation | None | Unavailable unless later schema approved. |
| Requirement waiver | No durable requirement-level waiver contract | Reviews Requirements | Direct to Human Decision accepted risk when appropriate | None at requirement level | Unavailable. |
| Human Decision | Seven outcomes; local append-only ledger; references; actor/rationale; run/head/report applicability; lineage; idempotent verified writes | Reviews Workspace/Case File | Readiness, History, modal | Record/change/reaffirm/withdraw where mutation capability is available | Current core; R4 modal composition planned. |
| GitHub App analysis/comment | Environment-gated supported PR-event analysis and one marked PR comment | Future Integrations primary; contextual Workspace handoff | `Connected`, `Available`, or `Unavailable` only from real status | Perform supported configured handoff; show precise failure | Current configured real capability. |
| GitHub Action | Route and blueprint documentation | `/github-action` | Blueprint link only | Read/copy blueprint | Blueprint. |
| Slack handoff | Formatted copy/export | `/slack-handoff` | Export-only link/result | Copy/download | Export-only. |
| Model/provider analysis | Deterministic analysis plus optional configured model/fallback provenance | System `/settings`; intake `/new` | Header/run provenance and limitation | Configure only when real; rerun from intake | Mixed current/configuration truth; no saved-config claim without persistence. |
| Team/ownership | Browser-local responsibility metadata | Operations `/team` | Queue/header/Inspector when real | Inspect/update only under existing local contract | Current local; no auth/shared team. |
| Policy/profile/template | Local prototype/conceptual profiles | Governance `/review-policies` | Review context explains source only | Preview/read; clone/apply only after implementation | Mostly conceptual/planned. |

## GitHub composition

The future Integrations primary surface lists two distinct GitHub records:

1. `GitHub App` — current configured real capability. Its state is Connected, Available, or Unavailable from verified environment truth. It owns supported PR-event analysis and the single marked automated-analysis comment.
2. `GitHub Action blueprint` — Blueprint. It links to `/github-action` and never inherits the App's connection state.

Workspace decision readiness reports the configured App handoff status only. It never states that a Human Decision was posted unless an explicit verified path publishes that decision record. The automated analysis comment and Human Decision remain separate records.

## Slack composition

The future Integrations primary surface lists `Slack handoff` as Export-only and links to `/slack-handoff`. Copy success is announced `Copied` rather than `Sent`. Download success is `Exported` rather than `Delivered`. No owner, workspace, channel, OAuth, schedule, or delivery status appears without a future implemented contract.

## Model/provider composition

System owns configuration and capability truth. New Review owns selecting an available analysis path for a new run. Workspace owns only the recorded provenance and limitation of the selected run.

- A deterministic run is labelled `Deterministic`.
- A model run names provider/model only when recorded in the manifest and states `Traceable; exact model replay is not promised` where applicable.
- Fallback is labelled as fallback with the failure/limitation that caused it.
- Missing provider/model configuration displays Available or Unavailable according to actual implementation; a displayed conceptual setting never appears saved.

## Route-family failure behaviour

| Failure | Owner | Retained context | Recovery |
| --- | --- | --- | --- |
| Unknown review route identity | Reviews `/workspace` | Requested ID, local source, available review count | Return to list or retry; no substitute. |
| Contextual route loses review | Route header | Repository/PR display context and invoking area when known | Return to Workspace list. |
| Integration configuration missing | Integrations/System | Capability identity and required configuration | Open truthful setup/info; never mark connected. |
| External service/write failure | Invoking route/action | Review, draft/export content, last verified state | Retry; copy/export locally when independently supported and labelled. |
| Local storage unavailable | Owning Reviews/Operations/System route | Current in-memory view and source limitation | Retry/reopen browser storage context; no in-memory success claim. |
| Unsupported mobile route action | Owning route | Route header and source truth | Read-only explanation and Back; no disabled fictional control. |

## R4C representation requirements

R4C must represent the five Rail areas, the primary/contextual hierarchy, selected Reviews area, `/workspace` dominance, route-header contract, mobile area disclosure, review-context return link, and every integration truth state. Planned `/integrations` appears only as a labelled laboratory navigation state and must carry `Planned R4F route — not current production`.

R4C may create and operate only the private `/visual-lab/workspace-r4` route. Inside that laboratory it may use internal fixture-state navigation and visually represent the five Rail areas and planned route states. R4C must not change production routing, create the production `/integrations` route, implement external connection, execute a GitHub Action, send to Slack, persist provider configuration, enforce policy, or add team authentication.

## Acceptance

This contract is accepted when each current route belongs to one area, every area has one primary destination, review context crosses routes by exact identity only, route headers own route tasks rather than Workspace summaries, and Connected, Available, Blueprint, Export-only, and Unavailable remain semantically and operationally distinct.
