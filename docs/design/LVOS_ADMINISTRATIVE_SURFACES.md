# LVOS administrative surfaces

**Status:** LVOS-4A and LVOS-4B approved — 15 July 2026
**LVOS baseline:** v1.0  
**Approved archetype:** D — Administrative document

## Purpose

LVOS-4 consolidates administrative, policy and integration-adjacent routes into quiet, record-led engineering documents. The work preserves existing product truth and behaviour while replacing route-specific dashboard and showcase composition.

## LVOS-4A scope

This bounded pass changes only `/settings`, `/review-policies` and their shared administrative-document stylesheet. It also records the implementation status here and in the typography ledger. The application shell, navigation, APIs, schemas, storage, report generation and every other route remain unchanged.

## LVOS-4B scope

The second bounded pass changes only `/team`, `/github-action`, `/slack-handoff`, the approved shared administrative-document stylesheet and these LVOS records. It preserves the LVOS-2 shell, LVOS-1 typography contract, LVOS-3 Workspace, route data and interactions, APIs, schemas, storage formats, report generation and scoring. `/review-operations` is explicitly deferred to LVOS-4C.

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

## Shared administrative grammar

The five migrated routes share one locally scoped stylesheet and use the same 1180px document measure, heading rhythm, compact section navigation, connected summary strips, group headers, hairline-bounded planes, aligned record/table padding, supporting-copy tier, written status treatment, technical evidence treatment and deliberate responsive collapse. The grammar uses existing semantic colour, material, border, radius, focus and typography tokens only; there are no gradients, route-local palettes, ordinary panel shadows, third-party chrome or card catalogues. LVOS-4B extends the approved LVOS-4A rules rather than introducing another visual direction.

## Preserved behaviour and truth boundaries

- Settings retains baseline-first deterministic analysis, optional environment-controlled model assistance, all current provider-path language, raw-diff handling and read-only prototype limitations.
- Review Policies retains every existing profile, required/recommended/optional gate, gate description and profile scope relationship.
- Team retains workspace loading and switching context, local storage, rename/create/archive, member add/role/status actions, existing repository and ownership records, derived activity, sample fallback, validation/error feedback and all limitation language.
- GitHub Action retains the full workflow, YAML, decision-comment fields, conditions, missing tests, reviewer focus, trust boundaries and every existing route/document link without adding posting or execution behaviour.
- Slack Handoff retains all three generated text variants, exact line breaks, clipboard API plus fallback copy behaviour, copy feedback, trust language and links; selection only changes which existing artifact is presented for copying.
- Existing navigational links remain real links. The added disclosures only reveal already-present policy clauses in place.
- No migrated route claims stored keys, model switching, policy enforcement, authenticated organisation configuration, server-backed assignment, external delivery or persistence that does not exist.

## Responsive behaviour

At 1180px and above, the documents use a disciplined 1180px working measure; Team tables, workflow records, comment fields and export formats align as columns while technical evidence uses the available width. At 900–1179px, the shell remains intact, summary strips move to two columns and records tighten without preserving crushed card grids. Below 900px, administrative groups stack, tables become labelled records, forms become one column, workflow steps regroup, export-format labels remain explicit and code/text scrolls internally only. At 520px the summary strip becomes one connected column and actions become full-width 44px targets. The 52px mobile command bar remains owned by LVOS-2 and there is no document-level horizontal overflow.

## Accessibility

Each route retains the shell main landmark and adds labelled administrative sections, semantic tables/lists/description lists, explicit written state values and native controls. Team inputs and selects retain associated labels; table rows expose mobile field labels; activity uses ordered chronological records. Slack format selection uses native radio semantics and visible selected state, while copy feedback is announced. Links and buttons retain correct semantics, code remains selectable, focus uses the shared visible treatment, and narrow-route controls meet the 44px target requirement. No hidden focusable preview content is introduced.

## Typography adoption

All five migrated routes adopt LVOS-1 application roles: 20px/28px page titles, 16px/24px major section headings, 14px/20px group headings, 13px record titles and body copy, 12px support, and sparse 10px micro-labels. Team empty/unavailable states and human-readable timestamps remain sans. Mono is limited to YAML, commands, identifiers, the stable comment marker and exported text evidence. LVOS-4B introduces no decorative mono, serif, sub-10px application text or weight above 600.

## Retained legacy debt

The old `.settings-*`, `.policy-*`, `.team-*`, `.action-*` and `.slack-*` card/showcase selectors in `app/globals.css` are no longer consumed by the five migrated route bodies; those routes now use the scoped administrative grammar. The legacy global blocks and shared `settings-section` / `settings-doc-links` compatibility selectors are retained as bounded cascade debt rather than removed during the structural pass. Their safe deletion, wider administrative aliases and unrelated compatibility tokens remain LVOS-7 work. `/review-operations` retains its current `.operations-*` generation until LVOS-4C.

## Remaining LVOS-4 routes

LVOS-4B is approved for `/team`, `/github-action` and `/slack-handoff`. LVOS-4C remains responsible for `/review-operations`. LVOS-4 is not complete; AU-05, AU-09 and AU-17 remain pending final LVOS-4 closure, and AU-10 remains partially open until the full milestone completes review.

## Validation matrix

| Route | Dark | Light | Desktop 1440px | Intermediate 1024px | Mobile 390px |
| --- | --- | --- | --- | --- | --- |
| `/settings` | Required | Required | Required | Required | Required |
| `/review-policies` | Required | Required | Required | Required | Required |
| `/team` | Required | Required | Required | Required | Required |
| `/github-action` | Required | Required | Required | Required | Required |
| `/slack-handoff` | Required | Required | Required | Required | Required |

Required implementation checks are `git diff --check`, `npx tsc --noEmit --incremental false`, `npm run build`, and targeted browser review of the matrix above. Manual review must additionally verify visible focus, disclosure keyboard access, 200% zoom/reflow, no horizontal page overflow, no console/hydration/duplicate-key errors and unchanged shell behaviour.

## Approval record

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

LVOS-4 is not complete. AU-05, AU-09 and AU-17 remain pending final LVOS-4 closure; AU-10 remains partially open until the complete milestone closes. `/review-operations` remains the only pending LVOS-4C route.
