# R4F.5 — Governance, Policies and Team Boundaries

> **Milestone:** R4F.5 — Governance, Policies and Team Boundaries  
> **Production routes:** `/review-policies` and `/team`  
> **Authority:** Accepted R4A–R4E contracts, accepted R4F.1–R4F.4 route and truth boundaries, the bundled review-policy/profile contracts, and the R4 product-truth implementation register  
> **Boundary:** Governance inspection, bounded impact preview and truthful browser/environment capability boundaries; no hosted organisation, collaboration, policy deployment or repository enforcement

## Outcome and route ownership

R4F.5 completes the administrative-governance portion of the R4 logged-in product system without creating authority the product does not possess.

- `/review-policies` owns browsing bundled policy records, exact definition inspection, bounded impact preview, intake applicability and unsupported-action explanation.
- `/team` owns the current browser/environment boundary, local responsibility metadata semantics, unavailable collaboration foundations, and the separation between policy context and accountable Human Decision authority.
- `/new` remains the only current owner of per-review review-profile selection.
- `/workspace` remains the only owner of supported exact-condition mutation and browser-local Human Decision recording.
- `/report` remains the exact read-oriented Case File.
- `/settings` remains the owner of current system/configuration truth and its one accepted bounded Report-history mutation.

Both R4F.5 routes use the accepted administrative shell: explicit Lintel identity, Back to Reviews, Administration navigation, compact route identity and a single route-owned main region. They introduce no Review Queue, Workspace Inspector, readiness bar or Human Decision entry point.

The focused repository search did not find a separate document literally titled **R4 Product Maturity Backlog — Post-R4C**. R4F.5 therefore applies the R4F-owned post-R4C principles recorded in `R4A_R4B_R4C_HANDOFF.md`'s product-truth implementation register and the accepted R4F.1–R4F.4 handoffs: propagate the accepted light system; keep profiles distinct from enforcement; expose policy applicability without creating persistence; keep hosted/team collaboration unavailable; and leave exhaustive final acceptance to R4G.

## Governance truth model

The governing sequence is:

`Browse → inspect → preview impact → understand applicability → use only a supported intake action`

Inspection and preview are presentation state. They do not create a report, apply a policy, assign a repository, alter a requirement, change an existing Case File, change a Human Decision, publish externally or create organisation state.

The authority sequence remains:

`Policy definition → review profile selected for a future review → Lintel analysis and recommendation → accountable engineer Human Decision`

Policy context may frame supported analysis behaviour. It never becomes the accountable decision.

## Policy, profile, rule, requirement and gate

| Term | R4F.5 definition | Authority and persistence |
| --- | --- | --- |
| **Policy** | A bundled, versioned governance presentation that groups intent, mapped profiles, deterministic gate expectations, model-assistance boundary, applicability and unsupported effects. | Inspectable in `/review-policies`; not independently deployed or assigned. |
| **Review profile** | A selectable New Review scope preset such as Standard readiness, Deep review or Security-sensitive. | Selected per future review and recorded with the canonical run where supported. It is not a team default or provider switch. |
| **Rule** | A deterministic implementation check or supported signal in analysis. | Executes only through the existing analysis contracts; the policy route does not run it. |
| **Requirement** | A canonical condition/evidence obligation or deterministic supported projection in a review. | Created by the existing analysis/merge-contract boundary. Preview does not manufacture one. Exact condition progress remains Workspace-owned. |
| **Gate** | A Required, Recommended or Optional expectation attached to the bundled policy profile. | Frames inspection and merge-summary language. It does not enforce a repository merge. |

These terms are not interchangeable. In particular, a review profile is the current intake mechanism; a policy is the inspectable governance definition around that profile; and a gate is not a GitHub branch-protection rule.

## Policy record model

`lib/review-policies.ts` remains the single bundled review-policy module. R4F.5 extends its existing `ReviewPolicyProfile` records instead of creating a second policy schema. Every record now exposes:

- stable identifier, label and description;
- category;
- version and provenance;
- deterministic, model-assisted or mixed execution description;
- current capability state;
- mapped New Review profile identifiers;
- applicability tags;
- review intent;
- model-assisted contribution boundary;
- evidence expectations;
- requirement and merge-gate effects;
- repository applicability;
- current-versus-future scope;
- persistence and enforcement boundaries;
- Human Decision boundary;
- unsupported capabilities;
- exact Required, Recommended and Optional gates.

Records remain bounded, statically imported and deterministically ordered. No remote template fetch, marketplace, generation path or new durable namespace exists.

## Categories, version and provenance

Categories are limited to semantics already present in profile, report-generator and merge-contract code:

- General readiness;
- Evidence and proof;
- Security-sensitive changes;
- Operational readiness;
- AI-generated code.

Current records use version `1.0`, matching the existing canonical policy-profile run manifest. Current selectable records have provenance **Lintel bundled review-policy profile**. The database/data-migration record is explicitly **Lintel bundled preview-only policy template** because no current New Review profile maps to it.

Version describes the bundled definition represented by the application. It is not a deployment version, organisation rollout or proof that a repository accepted the policy.

## Deterministic and model-assisted distinction

Current selectable profiles shape deterministic baseline behaviour. New Review separately selects deterministic-only or configured model-assisted execution. A policy does not enable a provider, hide an external call or grant a model decision authority.

Selectable policy records are labelled **Mixed** only because their mapped profile can contribute to the deterministic baseline and, when the user separately chooses configured model assistance, to bounded synthesis context. Mixed never means model-controlled. The preview-only database/data-migration template is labelled **Deterministic** and does not execute. No model-assisted-only policy record exists, so that filter can truthfully produce no matches.

Model output cannot satisfy evidence, clear a requirement, apply policy, assign a reviewer or record Human Decision. Canonical provenance continues to describe whether a future review actually used a model.

## Policy browse, filters and selection

The policy browse surface supports:

- bounded search over name, identifier, category, provenance, description, intended context and mapped profile labels;
- category filter;
- deterministic/model-assisted/mixed execution filter;
- current-review, future-review, repository-scoped and preview-only applicability filter;
- Available at intake, Preview only and Unavailable capability filter.

Filters compose as an intersection. Compatible selected policy identity remains selected. When a control removes the selected record, selection clears, no replacement is chosen, the changing control retains focus and a polite live announcement explains the invalidation. Result count has a separate polite announcement.

Selection identity uses the bounded `policy` URL parameter so an inspectable record is refresh- and Back-compatible. Unknown identities fail closed, retain the requested identifier in the unavailable state and never select a substitute. Search and filters remain route-local presentation state and create no global store.

The no-match state preserves current controls, states that capability was not changed and exposes one **Reset presentation** action.

## Policy detail and impact preview

A selected policy exposes:

1. exact identity, version, provenance, category, execution type and intake mapping;
2. policy intent;
3. every deterministic gate and its level;
4. the model-assisted boundary;
5. bounded impact preview;
6. repository, future/current, persistence and Human Decision scope;
7. unsupported capabilities;
8. the one truthful next action.

The impact preview uses source-backed clauses only. It says what **would be checked**, what evidence is expected, when a canonical requirement **could** be introduced, and that existing records have **no retroactive effect**, there is **no external enforcement**, and policies have **no Human Decision authority**.

It does not calculate a risk score, run analysis, fabricate findings or evidence, create requirements, create a recommendation, assert readiness, claim repository matches or imply a Human Decision.

## Applicability and current-versus-future scope

Six bundled records map to current New Review profiles and are **Available at intake**. The mapped review profile must still be chosen in New Review; opening the route link does not preselect it. The database/data-migration record is **Preview only** because no current intake profile selects it.

Current policies are not repository-scoped. They may be selected for future review input from a repository or manual source, but Lintel stores no repository assignment or ownership match. The current review, existing Case Files, existing requirements and existing Human Decisions are untouched.

The canonical future run may record the selected review profile and policy-profile version under the accepted run contract. The policy route stores no applied/active state.

## Supported action and mutation boundary

No policy application or cloning service exists. R4F.5 therefore adds no Apply, Clone, Deploy or Enforce control and no policy storage key.

- **Available at intake:** the detail links to New Review and names the exact mapped profile labels. The link itself does not select or mutate anything.
- **Preview only:** the detail ends with an explicit no-supported-mutation state and no disabled unexplained button.
- **Unknown/unavailable:** no action substitutes another record.

No consequential policy dialog is added because there is no supported policy mutation to confirm. Existing Case Files and Human Decisions cannot be changed retroactively.

## Team-boundary truth

`/team` is now a read-only capability and authority map, not a local member-management simulation. On load it performs one bounded, non-mutating read of `lintel.teamWorkspaces.v1` only to distinguish:

- checking;
- a structurally recognisable browser-local record;
- no record established;
- unresolved/partial stored data;
- unavailable browser storage.

The route never calls `ensureWorkspaceStore`, never creates default/sample workspaces, never loads sample people and never turns an absent local record into a hosted team with zero members. A partial record remains unresolved. Unavailable storage retains truthful static facts and offers Retry because the same bounded local read is genuinely retryable.

The route deliberately renders no people, avatars, names, member counts, roles, invitations, assignment controls, organisation chart or activity feed.

## Current local and environment boundaries

The route describes these existing concepts without upgrading their authority:

- workspace partition metadata in `lintel.teamWorkspaces.v1`;
- optional review ownership cues in `lintel.reviewState.v1`;
- bounded Case File history in `lintel.reportHistory.v1`;
- the accepted browser-local Human Decision ledger;
- bundled review-policy/profile definitions;
- repository identity supplied by a review or an explicit environment-gated read path.

Each record names current state, scope, source, read/write behaviour, authority boundary, unavailable capability and the technical foundation that a future hosted system would require. Browser-local and read-only states use neutral presentation, not success green.

Repository identity is not repository ownership. A local owner label is not an authenticated assignment. Local review history is not organisation activity. Environment configuration is not team identity.

## Unavailable collaboration capabilities

The route explicitly marks these as technically unavailable:

- authenticated organisation;
- shared accounts and membership;
- role-based access control;
- reviewer assignments;
- invitations;
- approval chains;
- organisation activity and analytics;
- repository ownership directory;
- shared policy authority;
- external team synchronisation.

Each unavailable record also names the missing foundation, such as identity, tenancy, shared persistence, authorisation, delivery, audit, reconciliation or policy-deployment contracts. None is presented as an empty current table or a merely unconfigured toggle.

## Human Decision and governance authority

Human Decision remains separate accountable-engineer authority under the accepted Workspace contract. Policy definitions, profile selection, deterministic analysis, optional model synthesis, owner cues and team-boundary metadata cannot:

- choose or replace Human Decision;
- approve a pull request;
- assign an accountable reviewer;
- publish a GitHub status;
- create a team vote or approval chain;
- satisfy evidence or waive a requirement;
- turn Lintel recommendation into repository authority.

The Team boundary sequence makes this separation explicit from policy definition through intake, analysis and engineer decision.

## Administrative shell and context restoration

Both routes retain the accepted R4F.1/R4F.4 administrative shell. The only shared navigation copy changes are narrower route descriptions in `app/nav-config.tsx`:

- Team now says it inspects browser-local responsibility metadata and unavailable collaboration boundaries.
- Review Policies now says it inspects bundled profiles, intake applicability, impact preview and non-enforcement boundaries.

The route paths, family assignments, shell structure and navigation architecture are unchanged.

Back to Reviews continues to use `lintel.r4f.workspaceReturnContext.v1`. R4F.5 does not modify the key, schema, read/write helpers or Workspace validation. A valid prior review and compatible mode/selection/preferences are restored by Workspace; unresolved context fails closed without substituting authority.

## Loading, empty, unavailable and partial states

- **Policy loading:** route identity remains; counts, selection and detail authority are withheld.
- **Policy no match:** controls remain visible; policy capability is unchanged; Reset presentation is available.
- **Unknown policy:** requested identity is retained; no substitute is selected.
- **Team checking:** member-like counts and authority are withheld.
- **No team record:** described as no local workspace metadata, not a hosted team with zero members.
- **Partial team record:** unresolved schema state is disclosed and identities are withheld.
- **Unavailable team storage:** static boundaries remain; no fixture is substituted; Retry performs a real local read.

Because bundled policy definitions are compile-time records, a remote policy-loading failure state is not invented. If the bounded module contains zero records, the normal no-record browse state remains the truthful presentation.

## Responsive responsibility transfer

- **Wide and normal desktop:** visible administrative sidebar; policy list and sticky contextual detail; dense team boundary records.
- **Narrow desktop:** policy records reduce lower-priority columns; detail remains readable without compressed data tables.
- **Tablet:** administration uses the accepted drawer; policy list/detail become sequential; team records remain one readable column where required.
- **Mobile:** one policy responsibility at a time. The list changes to selected detail and exposes **Back to policies**. Team content is a single sequential capability narrative.
- **Effective 200% zoom:** CSS viewport responsibility resolves to tablet/mobile composition; no document-level horizontal scroll is required. The team section index is the only bounded horizontal strip.

Labels remain complete. Primary actions are textual. The shell's constrained Back to Reviews control preserves its full accessible name through the accepted hidden support text.

## Keyboard and accessibility

Both routes retain one shell `main`, one logical route `h1`, semantic Administration navigation, current-route state, the shared skip link and visible blue route-heading focus.

Policy controls are native search/select/button/link elements. Selection uses neutral background and `aria-pressed`; focus uses a distinct blue outline. Filtering keeps focus on the changed control. Result counts and selection invalidation use polite live regions. On mobile, selection transfers focus to the detail heading and Back to policies restores the originating policy button where it remains available.

Team sections use semantic headings, description lists, ordered authority steps, native links and one genuine Retry button for a failed/partial local read. No inaccessible disabled action or empty accessible button exists.

The accepted administrative drawer continues to contain focus, close on Escape and restore its trigger. R4F.5 adds no animation library; its reduced-motion rule removes nonessential transition and animation duration.

## Performance boundaries

R4F.5 uses:

- one bounded static policy module import;
- memoised policy search/filter projection over seven records;
- stable identifiers and deterministic source ordering;
- URL state for selected policy identity only;
- route-local presentation state for search and filters;
- one bounded non-mutating team-storage inspection per route load or explicit Retry;
- existing CSS variables and administrative shell contracts.

It adds no polling, remote API, background synchronisation, monitoring, global store, unbounded storage, policy namespace, data-grid, graph, animation library or dependency.

## Deliberate R4G deferrals

R4G retains exhaustive adversarial production acceptance: cross-browser and assistive-technology coverage, large-state stress, performance profiling, complete 200% browser-zoom verification and final product freeze. R4F.5 does not begin R4G and does not use that deferral to imply a missing governance capability is planned.

Hosted organisation/authentication, shared membership, permissions, reviewer assignment, invitations, approval chains, policy deployment/enforcement, repository ownership, external publication, collaboration telemetry, shared analytics, cloud recovery, dark mode and theme work remain outside current R4 capability unless separately authorised and implemented.
