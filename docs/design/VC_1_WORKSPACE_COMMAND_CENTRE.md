# VC-1 Workspace Command Centre

## Final VC-1C approval record

**Final verdict:** APPROVED  
**VC-1A desktop convergence:** Complete  
**VC-1B responsive convergence:** Complete  
**VC-1 overall status:** APPROVED AND COMPLETE  
**Next milestone:** VC-2 — Case File and Cross-Route Refinement

The final independent review found no blocking corrections. Workspace is confirmed as a calm engineering verification command centre: the verification queue and selected-case inspector read as one connected workbench, not competing dashboard panels.

### Final review results

- Dark/light structural parity passed.
- Final representative review passed at 1440px, 1024px and 390px; the earlier manual checks at 1180px, 768px and 620px remain passed.
- No page-level horizontal overflow was found.
- No rendered text is below 10px, no computed weight is above 600, and no Newsreader is present in the application.
- No console errors or duplicate-key warnings were recorded.
- Mobile selected-case sheet accessibility passed, including its established focus, Escape, restoration and scroll-lock mechanics.
- The global shell, canonical data and persistence semantics remained unchanged.
- No motion was introduced.

### Accepted limitations

1. The truthful live Workspace remained empty because the Case File demo does not persist into Workspace history.
2. Populated queue and inspector composition were therefore verified through source, component structure and existing LVOS-3 evidence rather than fabricated local-storage data.
3. A future real populated-history review may be performed when genuine records exist, but it does not block VC-1 approval.
4. Listbox rows retain the existing `tabIndex` behaviour rather than introducing a new roving-tabindex model during visual refinement.

### Environment notes

The following were tooling incidents during final review, not product defects:

- Screenshot capture timed out in the Claude browser.
- The existing port-3000 development process became unhealthy.
- Final review ran successfully against a healthy server on port 3002.

All status text below this record is retained as historical VC-1A/VC-1B implementation evidence and is superseded where it conflicts with this final approval.

**Status:** Implemented — pending visual approval  
**Date:** 17 July 2026  
**LVOS baseline:** v1.0 (closed)  
**Scope:** VC-1A desktop convergence for `/workspace`

## Objective

Refine the existing Risk Inbox into a premium, calm verification command centre: an engineer can scan attention, select a pull request, inspect proof and requirements, and understand the next human decision without leaving the operational surface.

## Fixed LVOS constraints

- Archetype A, Queue + inspector, remains approved and unchanged.
- The LVOS-2 shell, contextual navigation, command bar, report Case File, data schemas, scoring, local storage and decision semantics are fixed boundaries.
- Geist Sans is application text; Geist Mono remains limited to identifiers, timestamps and technical values. No rendered text is below 10px and no computed weight exceeds 600.
- Dark material remains matte near-black planes; light material remains warm technical paper. Theme changes material, not structure.
- Semantic colour remains reserved for real recommendation, risk, requirement and evidence interpretation. No gradients, glow, decorative shadow or motion is introduced.

## Pre-implementation declaration

- **Approved layer:** visual refinement inside LVOS v1.0 Archetype A.
- **Regions changing:** `/workspace` context/header, summary/tabs, verification queue, selected-case inspector and workspace-owned CSS.
- **Regions untouched:** global application shell and navigation, `/new`, Case File, public site, administrative routes, report generation, sample data and local persistence.
- **Responsive implication:** desktop is refined at approximately 1440px; the existing intermediate drawer and mobile sheet/stacked-queue contracts are retained. Dedicated convergence is deferred to VC-1B.
- **Explicit non-goals:** a new identity, redesign of shell/navigation, filtering behaviour, live collaboration claims, motion, dependencies, fabricated history or changes to human authority.

## Previous Workspace dialect

The completed LVOS-3 Workspace already had truthful local-first queue grouping, a summary strip, sibling views and an inspector. Its desktop presentation read as adjacent bordered panels with a visible inter-pane gap and a comparatively generous context/header rhythm. The refinement preserves its data and interactions while making the route read as one operational workbench.

## New desktop composition

At desktop width the retained shell leads immediately into a compact local verification context, a five-cell operational summary and true sibling-view tabs. The queue and inspector now occupy one shared bordered work surface: the aligned queue is the primary plane; the 380px selected-case inspector is a persistent secondary plane divided by a single hairline. There is no dashboard-card grid or floating-widget layer.

## Queue hierarchy

The queue remains the visual backbone:

`State | PR identity | Recommendation | Requirements | Owner | Updated`

- Columns were tightened and made more intentional for the available working width.
- Row rhythm is 56px minimum with one-line supporting evidence/reason text to preserve calm scanning.
- Group labels and descriptions are compact, rule-separated ledger headers.
- Selection remains selected plane, focus ring and left rule—not a bright card or font-weight jump.
- State chips are squared technical labels; semantic treatment appears only when the local record’s state warrants it.

## Inspector hierarchy

The permanent inspector remains a connected selected-case plane with the verified record grammar:

1. Pull-request identity and local run context.
2. Change → Observation → Evidence → Requirement → Human decision trace.
3. Recommendation and because-clause.
4. Open requirements and missing proof.
5. Required next action.
6. Local owner/review state and explicit human-decision applicability when present.
7. Progressive details and actions, including Open Case File.

The refinement reduces topbar, title and section spacing while preserving disclosures, real local controls, the evidence/requirement lists and separate destructive action.

## Empty and populated state handling

The live empty state remains honest: it offers Check a pull request and the existing demo Case File path without seeding report history. Populated composition continues to derive solely from browser-local report history and existing review metadata. `/report?demo=1` remains the canonical sample verification record; it is not presented as organisation history.

## Visual reference translation

Waypoint informs the bounded queue and focused inspector; Giga informs restraint, hierarchy and intentional quiet space; Cursor informs retained context across queue and inspection. None supplies branding, controls, decorative effects or an IDE/dashboard pattern.

## Selectors and components changed

- `app/workspace/page.tsx`: Workspace context gains a quiet local-verification kicker; all state and behaviour are unchanged.
- `app/workspace/workspace.module.css`: context, summary, tabs, workbench, queue column/row grammar, selection, status labels and inspector density/connection.
- `docs/design/VC_1_WORKSPACE_COMMAND_CENTRE.md`: this VC-1A exit record.

## Responsive behaviour deferred to VC-1B

VC-1A deliberately retains LVOS-3’s 900–1179px inspector sheet and below-900px stacked records/mobile sheet. It does not redesign breakpoints, navigation, focus trapping, touch target rules or tab overflow; VC-1B will conduct dedicated responsive visual convergence.

## Validation matrix

| Check | VC-1A result |
| --- | --- |
| 1440px dark | Passed: compact context, quiet summary/queue plane and no page-level horizontal overflow in the available local preview. |
| 1440px light | Theme-token parity retained in Workspace CSS; direct preview toggle was not stable in the browser session, so this remains a follow-up visual confirmation rather than a claimed capture. |
| 1024px regression | Existing sheet breakpoint code retained; the local browser viewport override remained at 1280px, preventing direct 1024px capture. |
| 390px regression | Existing stacked/mobile sheet code retained; the local browser viewport override remained at 1280px, preventing direct 390px capture. |
| Empty local Workspace | Preserved; no seeded history |
| Truthfully populated/sample reference | Existing local-history queue and `/report?demo=1` retained |
| Keyboard/focus semantics | Existing queue, tabs and compact-sheet semantics retained |
| TypeScript/build/diff checks | Passed: `git diff --check`, `npx tsc --noEmit --incremental false` and `npm run build`. |

## VC-1B responsive convergence

**Status:** Implemented — validation in progress  
**Scope:** Responsive convergence for `/workspace`; VC-1A desktop composition remains fixed.

### Bounded declaration and fixed desktop state

- **Responsive layer changing:** Workspace-owned layout, queue record grammar and compact inspector mechanics only.
- **Fixed regions:** global rail, contextual Workspace navigation, command bar, 1440px column proportions, queue hierarchy, inspector hierarchy, labels, schemas and persistence.
- **Inspector strategy:** persistent at wide/compact desktop, bounded right sheet at intermediate widths and full-width/right sheet on tablet/mobile.
- **Queue transformation:** aligned ledger at desktop; labelled structured ledger records below 900px, not a decorative card grid.
- **Typography and semantic colours:** existing Geist roles and semantic tokens only; no new colour role, motion, shadow, dependency or product logic.
- **Interaction implication:** compact sheet keeps focus trapping, Escape/backdrop close, selected-row focus return, body/document scroll lock and inert queue/view controls.
- **Explicit non-goals:** no shell architecture change, new filters, fabricated local history, sample seeding, report changes or Case File redesign.

### Breakpoint strategy

| Width | Workspace treatment |
| --- | --- |
| 1440px | Regression state: six-field queue and persistent inspector. |
| 1180–1279px | Compact desktop: persistent 332–344px inspector; owner moves from the queue to selected detail to preserve a usable five-field ledger. |
| 900–1179px | Intermediate: the existing shell drawer and the existing 390px selected-case right sheet remain mutually exclusive. |
| 620–899px | Narrow tablet: one primary column of labelled records, intentionally scrolling view tabs and full-width/right detail sheet. |
| Below 620px | Mobile ledger: same labelled-record grammar, two-column summary and full-width selected-case sheet. |

### Field visibility decisions

| Field | Desktop | Compact/intermediate | Tablet/mobile |
| --- | --- | --- | --- |
| Review state | Always visible | Always visible | Always visible, labelled State. |
| Pull-request title, repository and technical identity | Always visible | Always visible | Always visible, labelled Pull request. |
| Recommendation and because-clause | Always visible | Always visible | Always visible, labelled Recommendation. |
| Requirement / missing-proof summary | Always visible | Always visible | Always visible, labelled Requirements. |
| Next action | Selected detail | Selected detail | Always visible, labelled Next action. |
| Owner | Visible | Selected detail at compact desktop | Labelled record field and selected detail. |
| Updated time | Always visible | Always visible | Always visible, labelled Updated. |
| Risk / urgency | Updated technical metadata | Updated technical metadata | Always visible with a Risk / urgency label. |

Long values wrap, or are intentionally line-clamped only where their full context remains in selected detail and the Case File. No displayed technical value may create page-width overflow.

### Filters, states and accessibility

The existing sibling views remain the sole filter system: Inbox, Assigned locally, Awaiting evidence, Ready and Reviewed retain explicit active state and keyboard tab operation. No unsupported repository, owner or age filter was added.

The truthful local-first empty state remains balanced at every width with its Check a pull request and demo Case File paths. Populated rendering continues to derive only from existing local report history; `/report?demo=1` remains Case File evidence rather than injected Workspace history.

The compact selected case retains an accessible name, named close action, Escape handling, focus trap, focus restoration, backdrop close and 44px controls. Queue selection has written and ARIA-selected state in addition to selected plane/left-rule treatment. Dark near-black planes and light warm-paper planes retain identical hierarchy and geometry.

### Acceptance matrix

| Check | VC-1B result |
| --- | --- |
| 1440px | Desktop composition preserved. |
| 1180px | Compact persistent inspector protects queue width. |
| 1024px | Intermediate sheet and contextual-shell drawer boundary retained. |
| 768px / 620px / 390px | Labelled ledger records retain identity, recommendation, requirements, next action, review state, risk and updated context. |
| Empty state | Truthful local-first behaviour preserved. |
| Populated/sample state | Existing local-history semantics and canonical demo Case File preserved; no data fabricated. |
| Modal and keyboard mechanics | Focus, Escape, scroll lock, close/focus return and background queue/control inertness retained or strengthened. |
| Dark/light | Token-driven structural parity retained. |

### Deferred to VC-1C

- New Workspace views or filter semantics require data/product scope rather than responsive inference.
- No independently seeded Workspace fixture is introduced; a future fixture would require an explicit product-data decision.
- The global shell, Case File and persistence model remain outside VC-1B.

### Current milestone status

**VC-1B implemented and validated.** `git diff --check`, TypeScript and the production build pass. The empty local Workspace was checked at 1440px, 1180px, 1024px, 768px, 620px and 390px in dark and light with no page-level horizontal overflow. No commit or push was made.

### Superseded in-progress record

**VC-1B implemented — validation in progress.** No commit or push is part of this milestone.

## Superseded VC-1A approval status

**Implemented — pending validation and visual approval.** LVOS v1.0 remains closed and unchanged. VC-1B owns any dedicated intermediate/mobile convergence beyond regression preservation.
