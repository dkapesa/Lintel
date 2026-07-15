# LVOS administrative surfaces

**Status:** LVOS-4A Approved — 15 July 2026  
**LVOS baseline:** v1.0  
**Approved archetype:** D — Administrative document

## Purpose

LVOS-4 consolidates administrative, policy and integration-adjacent routes into quiet, record-led engineering documents. The work preserves existing product truth and behaviour while replacing route-specific dashboard and showcase composition.

## LVOS-4A scope

This bounded pass changes only `/settings`, `/review-policies` and their shared administrative-document stylesheet. It also records the implementation status here and in the typography ledger. The application shell, navigation, APIs, schemas, storage, report generation and every other route remain unchanged.

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

## Shared administrative grammar

The two routes share one locally scoped stylesheet and use the same page-width logic, heading rhythm, group headers, hairline-bounded planes, row padding, supporting-copy tier, right-aligned desktop values, status wording, disclosure treatment and responsive collapse. The grammar uses existing semantic colour, material, border, radius, focus and typography tokens only; there are no gradients, route-local palettes, ordinary panel shadows or card catalogues.

## Preserved behaviour and truth boundaries

- Settings retains baseline-first deterministic analysis, optional environment-controlled model assistance, all current provider-path language, raw-diff handling and read-only prototype limitations.
- Review Policies retains every existing profile, required/recommended/optional gate, gate description and profile scope relationship.
- Existing navigational links remain real links. The added disclosures only reveal already-present policy clauses in place.
- Neither route claims stored keys, model switching, saving, policy enforcement, organisation configuration, repository assignment, external delivery or persistence.

## Responsive behaviour

At 1180px and above, both documents use a disciplined 1180px working measure; records align as columns and policy clauses remain connected to their profile. At 900–1179px, the shell remains intact and the same record grammar tightens without page-level overflow. Below 900px, groups become single-column documents, settings values move beneath their labels, policies expose labelled stacked fields and gate clauses stack while retaining gate, level and requirement meaning. The 52px mobile command bar remains owned by LVOS-2.

## Accessibility

Each route retains the shell main landmark and adds labelled administrative sections, semantic lists, explicit written state values and native disclosure controls. Links retain link semantics; disclosures work with keyboard and reveal connected content without hidden controls. Focus uses the shared visible focus treatment. The mobile layout removes document-level horizontal overflow and has no route-body controls below the 44px target requirement.

## Typography adoption

Both routes adopt LVOS-1 application roles: 20px/28px page titles, 16px/24px section headings, 14px/20px group headings, 13px record titles and body copy, 12px support, and sparse 10px micro-labels. All values are Geist Sans unless genuinely technical; this pass introduces no decorative mono, serif, sub-10px application text or weight above 600.

## Retained legacy debt

The old `.settings-*` and `.policy-*` card selectors in `app/globals.css` are superseded for these two routes by the scoped administrative grammar. Shared `settings-section` and `settings-doc-links` compatibility selectors remain because `/github-action` and `/slack-handoff` still consume them; their migration belongs to LVOS-4B/4C. Wider administrative cascade cleanup, legacy aliases and other route selectors remain LVOS-7 work.

## Remaining LVOS-4 routes

LVOS-4B remains responsible for `/team`, `/github-action` and `/slack-handoff`. LVOS-4C remains responsible for `/review-operations`. AU-05 and AU-10 remain open until the full LVOS-4 route set completes its visual review and the remaining administrative surfaces migrate.

## Validation matrix

| Route | Dark | Light | Desktop 1440px | Intermediate 1024px | Mobile 390px |
| --- | --- | --- | --- | --- | --- |
| `/settings` | Required | Required | Required | Required | Required |
| `/review-policies` | Required | Required | Required | Required | Required |

Required implementation checks are `git diff --check`, `npx tsc --noEmit --incremental false`, `npm run build`, and targeted browser review of the matrix above. Manual review must additionally verify visible focus, disclosure keyboard access, 200% zoom/reflow, no horizontal page overflow, no console/hydration/duplicate-key errors and unchanged shell behaviour.

## Approval record

**Approval date:** 15 July 2026

- LVOS-4A status: Approved.
- `/settings` Archetype D adoption: Approved.
- `/review-policies` Archetype D adoption: Approved.
- Shared administrative document grammar: Approved.
- Settings analysis-mode records: Approved.
- Settings provider and data-handling records: Approved.
- Review Policies level summary: Approved.
- Review Policies aligned policy records: Approved.
- Desktop, intermediate and mobile transformations: Approved.
- Route truth and read-only limitations: Preserved.
- Shell and unrelated routes: Unchanged.

AU-10 remains partially open until the complete LVOS-4 milestone closes. AU-05 remains open until all administrative surfaces adopt the shared grammar.
