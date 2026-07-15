# LVOS administrative surfaces

**Status:** LVOS-4 — Approved and closed

**Approval date:** 16 July 2026

**LVOS baseline:** v1.0  
**Approved archetypes:** D — Administrative document; E — Timeline or graph surface for genuine Review Operations relationships and chronology

## Purpose

LVOS-4 consolidates administrative, policy and integration-adjacent routes into quiet, record-led engineering documents. The work preserves existing product truth and behaviour while replacing route-specific dashboard and showcase composition.

## LVOS-4A scope

This bounded pass changes only `/settings`, `/review-policies` and their shared administrative-document stylesheet. It also records the implementation status here and in the typography ledger. The application shell, navigation, APIs, schemas, storage, report generation and every other route remain unchanged.

## LVOS-4B scope

The second bounded pass changes only `/team`, `/github-action`, `/slack-handoff`, the approved shared administrative-document stylesheet and these LVOS records. It preserves the LVOS-2 shell, LVOS-1 typography contract, LVOS-3 Workspace, route data and interactions, APIs, schemas, storage formats, report generation and scoring. `/review-operations` is explicitly deferred to LVOS-4C.

## LVOS-4C scope

The final bounded implementation pass changes `/review-operations`, the shared administrative stylesheet only where needed for six-route convergence, confirmed obsolete Operations selectors, and the LVOS-4 documentation record. It does not reopen approved LVOS-4A or LVOS-4B route structures. The LVOS-2 shell, LVOS-3 Workspace, Report, New Review, landing page, APIs, schemas, scoring, report generation, storage keys and product data models remain outside this pass.

## Settings structure

`/settings` is organised as a concise heading followed by rule-separated groups for:

- Review and analysis — deterministic-only, baseline plus model-assisted, BYO provider and internal/local model records.
- Provider status — current and future provider paths with their status, code/data boundary and intended use.
- Data handling — deterministic fallback, environment-controlled model assistance, key handling and raw-diff retention statements.
- Prototype limitations — read-only provider configuration, unavailable enterprise controls and unavailable repository delivery, followed by genuine related links.

Values are aligned on desktop and stack beneath the supporting explanation on narrow screens. The route does not add a model selector, toggle, save action, provider configuration or repository delivery behaviour.

## Review Policies structure

`/review-policies` presents the Required, Recommended and Optional definitions as one connected, rule-separated summary. The policy profiles follow as aligned records with Policy, Levels, Scope or trigger and State columns. Each profile uses a native, keyboard-accessible disclosure for its existing gate clauses; the expanded region states the gate, written level and requirement in connected rows.

The final limitations group makes the local-only, non-enforcing boundary explicit. No policy editing, persistence, repository assignment or merge enforcement is implied or added.

## Team structure

`/team` is an Administrative Document with a concise workspace heading, compact jump navigation and sections for Overview, Members, Repositories, Ownership and Activity. Overview uses one connected strip for active local members, observed repositories, unresolved ownership and derived activity, followed by the existing workspace rename/create controls as one administrative group.

Members use a labelled add-member group and an aligned table for member, responsibility role, assigned review count, state and contextual activation action. Repository records align the existing repository identifier, recorded owner, attention count, review activity and connection/status metadata. Ownership aligns each existing review with its responsible local engineer cue, repository scope, open blocking clauses and current review or decision state. Activity is a chronological, hairline-separated list using only events derived by the existing workspace helper or the existing bounded sample fallback.

The local/shared truth boundary remains explicit throughout: workspaces, members, roles and assignments are device-local responsibility metadata. No authentication, invitations, live collaboration, organisation membership, server persistence, repository connection or enterprise role is invented. Archive remains the existing destructive local action and is isolated in the final limitations region. Human authority remains separate from Lintel recommendations.

## GitHub Action structure

`/github-action` is a technical configuration and export-reference document. It presents a connected status strip, the existing five-step intended workflow as rule-separated records, the complete selectable YAML as internally scrollable evidence, the intended one-comment contract as structured fields and evidence lists, and a final security/setup region with the existing links.

The page remains a prototype blueprint. It does not install an Action, post to GitHub, connect a repository, store credentials or execute checks. User-controlled CI, the CLI wrapper and comment update are described as planned architecture; the non-blocking default, avoidance of `pull_request_target`, baseline-first analysis, stable marker, single-comment strategy and raw-diff boundary remain intact. The former PR-comment/browser presentation and showcase cards are not retained.

## Slack Handoff structure

`/slack-handoff` is an export-record document. A connected status strip states the prototype, no-send, no-connection and raw-diff-free boundaries. Existing handoff variants appear as aligned native-radio records with intended use, included evidence, computed text length and programmatic selected state. The selected variant is shown once as a technical export artifact with its identity, included/excluded fields, exact generated text and the preserved local copy action and fallback.

The surface remains export-only. It has no Slack API call, OAuth flow, workspace connection, channel lookup, sender identity, delivery scheduling or sent-message state. Copying remains local browser behaviour and raw diffs remain excluded. The former simulated Slack window, message bubbles, tag clusters and one-card-per-variant catalogue are not retained.

## Review Operations purpose and structure

`/review-operations` uses Archetype E only where existing report relationships and timestamps require it. It is a local verification-operations ledger, not an analytics dashboard. The route asks which requirements recur, which repositories and changes carry repeated evidence, what verification activity has happened, and which readiness or human-decision events have been recorded.

The document order is a concise page heading and device-local boundary, one connected operational summary strip, compact jump navigation, recurring blockers, repository verification activity, decision and readiness history, and a final evidence-boundary section. The former six KPI tiles, recommendation percentage bars, process-signal advice, analytics side column, sticky latest-report card and duplicated page-header actions are removed. No visual chart or graph is retained because aligned evidence and chronology communicate the current data more truthfully.

### Operational summary strip

The five connected values are derived without percentages or scoring: reviews needing attention counts stored recommendations other than `APPROVE`; recurring blockers counts normalized evidence present in more than one stored report; active repositories counts usable repository identities; decisions recorded counts Human Decision Ledger entries with an outcome; reaffirmation required counts ledger projections whose effective decision predates the current recorded head. The strip is static evidence, not a speculative filter or navigation system.

### Recurring blocker relationship grammar

Report merge conditions, missing tests and finding titles are normalized by trimmed, case-insensitive text and counted at most once per report. Each aligned record exposes the requirement identity, evidence kind, genuine occurrence count, affected change count, repository count and identities, latest stored report timestamp and a written recorded state. `Cleared locally` is shown only when the existing condition-progress store contains the matching condition key; otherwise the surface says `Open when recorded` or `Recorded finding`. Single-report requirements remain visible as evidence but do not increase the recurring-blocker summary.

### Repository verification activity grammar

Repository records group only stored reports with their existing repository identity. Reviews is the stored report count. Open requirements is the distinct merge-condition and missing-test count in that repository's latest available report. Latest recommendation and activity come directly from that report and its stored creation timestamp. Latest human decision comes from the effective existing Human Decision Ledger entry when present. Missing repository identity remains `Repository unavailable`; no health score, ranking, owner, productivity measure or generalised trend is inferred.

### Decision and readiness history grammar

The chronology is newest first. Every available report contributes its genuine stored creation timestamp, recommendation, analysis source and review profile. Existing local decision-history records contribute only recorded workflow changes; generated/recommendation seed events and human-decision mirrors are omitted to avoid duplicates. Human Decision Ledger entries contribute their recorded timestamp, event type, outcome or reason, actor, repository/PR relationship and run or head identifier where present. The current report or explicit demo may retain the existing Case File link; archived report history has no invented per-report URL.

### Empty, demo and limitation states

The existing demo report remains only as an explicitly labelled fallback while history loads, when no usable local reports exist, or when local storage is unavailable. Reports with no blocker evidence show a requirement empty state. A chronology with no human decisions says so while retaining genuine report activity. Missing identities, timestamps and actors remain unavailable. The final boundary states that history is device-local and bounded, archived reports lack stable Case File URLs, and no hosted monitoring, collaboration or organisation telemetry exists.

## Shared administrative grammar

All six LVOS-4 routes share one locally scoped stylesheet and the same 1180px document measure, introduction rhythm, section heading roles, truthful status line, compact section navigation where needed, connected summary-strip construction, administrative group headers, hairline-bounded planes, aligned record/table padding, supporting-copy tier, written status treatment, technical evidence treatment, empty-state language and deliberate responsive collapse. The grammar uses existing semantic colour, material, border, radius, focus and typography tokens only; there are no gradients, route-local palettes, ordinary panel shadows, third-party chrome, card catalogues or dashboard chart colours. Consistency is grammatical: each route retains only the sections and interactions its real data requires.

## Preserved behaviour and truth boundaries

- Settings retains baseline-first deterministic analysis, optional environment-controlled model assistance, all current provider-path language, raw-diff handling and read-only prototype limitations.
- Review Policies retains every existing profile, required/recommended/optional gate, gate description and profile scope relationship.
- Team retains workspace loading and switching context, local storage, rename/create/archive, member add/role/status actions, existing repository and ownership records, derived activity, sample fallback, validation/error feedback and all limitation language.
- GitHub Action retains the full workflow, YAML, decision-comment fields, conditions, missing tests, reviewer focus, trust boundaries and every existing route/document link without adding posting or execution behaviour.
- Slack Handoff retains all three generated text variants, exact line breaks, clipboard API plus fallback copy behaviour, copy feedback, trust language and links; selection only changes which existing artifact is presented for copying.
- Review Operations retains the existing report-history source, demo fallback, repository identities, recommendations, risk/readiness evidence, blocker inputs, report timestamps, source/profile metadata and available Case File/New Review links. It additionally reads existing condition progress, decision history, review state and Human Decision Ledger records without changing their schemas, keys or write behaviour.
- Existing navigational links remain real links. The added disclosures only reveal already-present policy clauses in place.
- No migrated route claims stored keys, model switching, policy enforcement, authenticated organisation configuration, server-backed assignment, external delivery or persistence that does not exist.

## Responsive behaviour

At 1180px and above, the documents use a disciplined 1180px working measure; Team and Review Operations tables, workflow records, comment fields and export formats align as columns while technical evidence uses the available width. Review Operations uses one five-region summary strip and a readable three-column chronological ledger. At 900–1179px, the shell remains intact, the Operations strip regroups to three columns, lower-priority blocker-change and latest-human-decision columns are deliberately omitted, and repository identity, counts, recommendation and latest activity remain visible. Below 900px, summary strips use two connected columns, tables become labelled records, the chronology becomes one readable column, forms become one column, workflow steps regroup, export-format labels remain explicit and code/text scrolls internally only. At 520px the summary strip becomes one connected column and actions become full-width 44px targets. The 52px mobile command bar remains owned by LVOS-2 and there is no document-level horizontal overflow.

## Accessibility

Each route retains the shell main landmark and adds labelled sections, semantic tables/lists/description lists, correct heading order, explicit written state values and native controls. Team inputs and selects retain associated labels; table headers remain associated on desktop and `data-label` values preserve equivalent meaning in mobile records; Team and Operations activity use ordered chronological records with understandable `time` elements. Slack format selection uses native radio semantics and visible selected state, while copy feedback is announced. Links and buttons retain correct semantics, technical content remains selectable, focus uses the shared visible treatment, and narrow-route controls meet the 44px target requirement. Statuses never rely on colour alone, unavailable values are neutral, and no hidden focusable preview or disclosure content is introduced.

## Typography adoption

All six LVOS-4 routes have implemented the LVOS-1 application roles: 20px/28px page titles, 16px/24px major section headings, 14px/20px group headings, 13px record titles and body copy, 12px support, and sparse 10px micro-labels. Human-readable empty, unavailable and timestamp values remain sans with tabular numerals where aligned. Mono is limited to genuine YAML, commands, identifiers, hashes, run/head metadata, the stable comment marker and exported text evidence. Review Operations introduces no decorative mono, serif, sub-10px application text or weight above 600. Final adoption was approved with the closure of LVOS-4 on 16 July 2026.

## Retained legacy debt

The confirmed obsolete Operations generation was removed from `app/globals.css`: `.operations-main`, `.operations-header`, `.operations-demo-note`, `.operations-metric-grid`, `.operations-layout`, `.operations-main-column`, `.operations-side-column`, `.operations-panel`, `.operations-distribution`, `.operations-bar*`, `.operations-ranked-list`, `.operations-signal-list`, `.operations-compact-list`, `.operations-empty`, `.operations-latest-panel` and `.operations-link-row`, including their responsive and later override references. Superseded `.operations-header`, `.operations-section-heading`, `.operations-link-row` and `.operations-main` compatibility references were also removed from `app/design-system.css`.

The old `.settings-*`, `.policy-*`, `.team-*`, `.action-*` and `.slack-*` card/showcase selectors in `app/globals.css` remain confirmed zero-consumer LVOS-4 route-body debt, together with shared `settings-section` / `settings-doc-links` compatibility selectors and unrelated global aliases. They are deliberately retained because deleting those broad legacy families would exceed the bounded LVOS-4C CSS audit and could affect non-owning compatibility consumers. Their repository-wide cascade removal remains LVOS-7 work.

## LVOS-4 completion boundary

LVOS-4A, LVOS-4B and LVOS-4C are approved. LVOS-4 — Administrative Surfaces is complete and closed as of 16 July 2026. AU-05, AU-08, AU-09, AU-10 and AU-17 are formally closed by the resolution register in the current-state audit. Retained presentation debt remains assigned to LVOS-7. LVOS-5 — Case File Convergence is the next implementation milestone.

## Validation matrix

| Route | Dark | Light | Desktop 1440px | Intermediate 1024px | Mobile 390px |
| --- | --- | --- | --- | --- | --- |
| `/settings` | Approved | Approved | Approved | Approved | Approved |
| `/review-policies` | Approved | Approved | Approved | Approved | Approved |
| `/team` | Approved | Approved | Approved | Approved | Approved |
| `/github-action` | Approved | Approved | Approved | Approved | Approved |
| `/slack-handoff` | Approved | Approved | Approved | Approved | Approved |
| `/review-operations` | Approved | Approved | Approved | Approved | Approved |

Deep Review Operations review requires 1440px dark and light, 1024px dark and 390px light, with populated or explicitly labelled demo evidence, empty/limited states and any genuine selected/expanded relationship state. Convergence spot-checks require `/settings` at 1440px light, `/review-policies` at 390px dark, `/team` at 1440px dark, `/github-action` at 390px light and `/slack-handoff` at 1440px light. Required implementation checks are `git diff --check`, `npx tsc --noEmit --incremental false`, `npm run build`, `git status`, `git diff --stat` and `git diff --name-only`. Manual review must additionally verify visible focus, 200% zoom/reflow, no horizontal page overflow, no console/hydration/duplicate-key errors and unchanged shell behaviour.

Final manual review on 16 July 2026 approved the complete dark, light, desktop, intermediate and mobile matrix, including labelled mobile records and the five convergence spot-checks. Review Operations retained every legitimate history event while correcting its stable React-key construction; the development runtime is clean and contains no duplicate-key warning. TypeScript validation and the production build pass.

## LVOS-4A and LVOS-4B approval record

**Approval date:** 15 July 2026

- LVOS-4A status: Approved.
- LVOS-4B status: Approved.
- `/settings` Archetype D adoption: Approved.
- `/review-policies` Archetype D adoption: Approved.
- `/team` Archetype D adoption: Approved.
- `/github-action` Archetype D adoption: Approved.
- `/slack-handoff` Archetype D adoption: Approved.
- Shared administrative document grammar: Approved.
- Settings analysis-mode records: Approved.
- Settings provider and data-handling records: Approved.
- Review Policies level summary: Approved.
- Review Policies aligned policy records: Approved.
- Team connected summary strip: Approved.
- Team member, repository, ownership and activity grammar: Approved.
- Team local/shared truth boundary: Preserved.
- GitHub Action configuration-document structure: Approved.
- GitHub Action current-versus-planned boundary: Preserved.
- Slack Handoff export-record structure: Approved.
- Slack export-only boundary: Preserved.
- Desktop, intermediate and mobile transformations: Approved.
- Working forms, selection and copy/export behaviour: Preserved.
- Duplicate React-key runtime warnings: Resolved.
- Development runtime: Clean.
- LVOS-2 shell and unrelated routes: Unchanged.
- Fake product capability introduced: No.

## Final LVOS-4 approval record

**Approval date:** 16 July 2026

**LVOS-4C status:** Approved and closed

**LVOS-4 status:** Approved and closed

### Approved route and archetype matrix

| Route | Approved archetype | Final approved state |
| --- | --- | --- |
| `/settings` | D — Administrative document | Read-only and local configuration boundaries remain explicit. |
| `/review-policies` | D — Administrative document | Local structured gates remain explicit and are not presented as an enterprise policy engine. |
| `/team` | D — Administrative document | Local responsibility records remain explicit and are not presented as authenticated collaboration. |
| `/github-action` | D — Administrative document | The workflow remains a blueprint and does not post or install. |
| `/slack-handoff` | D — Administrative document | The handoff remains copy/export-only and does not send. |
| `/review-operations` | E — Timeline or graph surface | Genuine local report relationships and chronology are shown without hosted organisation analytics. |

### Approved Review Operations composition

- The former generic KPI-dashboard composition is removed.
- The operational summary is one connected strip whose values are derived from existing local report history.
- Recurring blockers are evidence-derived requirement relationships. Occurrence counts come from existing local reports, and single-report requirements remain visible without being described as trends.
- Repository verification activity uses existing report and repository evidence without repository health scores, engineer rankings or fabricated ownership.
- Decision and readiness history uses existing recorded events and timestamps. Unavailable actors, timestamps and decisions remain explicit and neutral.
- Desktop, intermediate and mobile transformations are approved in dark and light themes. Mobile tables preserve meaning as labelled records.

### Approved shared administrative grammar

All six routes share the approved route introduction hierarchy, limitation and prototype-boundary treatment, section navigation, connected summary-strip grammar where applicable, administrative group headers, aligned records and tables, status and value alignment, disclosure treatment, empty-state language, desktop content measures, intermediate regrouping, mobile labelled-record transformations, border and radius hierarchy, material hierarchy and LVOS-1 typography roles. Consistency is grammatical; route content remains specific to its truthful purpose.

### Accessibility, typography and validation approval

- Meaningful landmarks, heading order, associated record labels, keyboard semantics, visible focus and written status labels are preserved.
- Application typography contains no serif, sub-10px text, weight above 600 or decorative mono treatment.
- Duplicate React-key warnings in Review Operations history were resolved using stable event identity while preserving all legitimate duplicate-looking events and their order.
- The development runtime is clean. TypeScript validation and the production build pass.
- Responsive reflow, labelled mobile records, dark and light contrast, and the absence of page-level horizontal overflow are approved.

### Legacy-dialect closure and retained debt

The active Review Operations KPI-card, percentage-bar and dashboard-layout dialect was removed, together with the confirmed superseded LVOS-4 selectors recorded in the cleanup inventory above. Shared focus, form, feedback and responsive rules were retained. Deliberately retained settings, policy, Team, GitHub Action and Slack Handoff legacy selectors remain assigned to LVOS-7 because their ownership cannot yet be separated safely from routes outside the LVOS-4 boundary.

No new product capability was introduced. Team remains local, GitHub Action remains a non-posting blueprint, Slack Handoff remains copy/export-only, Settings remains read-only where configuration does not exist, Review Policies remain local structured gates, and Review Operations remains local report-derived evidence. No organisation telemetry, customer analytics, fabricated trends, percentages, actors, monitoring or hosted operational capability was added.

LVOS-4 — Administrative Surfaces is formally closed. Only AU-05, AU-08, AU-09, AU-10 and AU-17 are closed by this milestone; findings owned by LVOS-5, LVOS-6, LVOS-7 and V8 remain open.
