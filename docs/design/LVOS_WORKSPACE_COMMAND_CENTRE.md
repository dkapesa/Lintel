# LVOS Workspace Command Centre

**Status:** Approved — 15 July 2026  
**LVOS baseline:** v1.0  
**Milestone:** LVOS-3 — Workspace Command Centre  
**Approved archetype:** A — Queue + inspector  
**Route:** `/workspace` only

## Purpose

LVOS-3 makes the Risk Inbox the operational home for answering “What requires engineering attention now?” It replaces the active segmented-filter and card-row composition with one connected local summary, truthful sibling views, an aligned verification queue and one selected-case inspector. It does not change the LVOS-2 shell or introduce a new visual direction.

## Final approval record

- **Approval date:** 15 July 2026.
- **LVOS-3 — Workspace Command Centre:** Approved.
- **Archetype A — Queue + inspector:** Approved.
- **`/workspace` typography adoption:** Approved.
- **Audit finding AU-06:** Closed.
- **Summary strip:** Approved.
- **Sibling-view tabs:** Approved.
- **Aligned verification queue:** Approved.
- **Selected-case inspector:** Approved.
- **Intermediate inspector-sheet transformation:** Approved.
- **Mobile stacked-record transformation:** Approved.
- **Loading, empty and populated states:** Approved.
- **Existing local report-history and review behaviour:** Preserved.
- **Duplicate React-key runtime warning:** Resolved.
- **Development runtime:** Clean.
- **Global shell and all other route bodies:** Unchanged.
- **Remaining Workspace legacy-debt cleanup:** Deferred to LVOS-7.

## Preserved behaviour

- Local report-history loading and active-workspace scoping.
- Report identity grouping, risk/recency sorting and current review-state derivation.
- Initial and persisted selection, pointer selection and Arrow Up/Arrow Down row selection.
- Local review status, owner and saved-note display.
- Copy conditions, Open Case File navigation, grouped deletion and clear history.
- Guided-tour trigger and the existing `risk-inbox` / `selected-pr` tour targets.
- Loading, no-history, active-view-empty, populated and error handling.
- Intermediate/mobile inspector focus trap, Escape close, backdrop close, focus return and document scroll lock.
- Shell-navigation close signalling so the Workspace inspector does not stack over a shell drawer.
- Local-first and security-boundary language, shell context and all existing shell actions.

No API, schema, report generation, scoring, storage key, storage format or dependency changed.

## Summary derivation

The connected five-cell strip is derived entirely from the latest grouped reports in the active local workspace:

| Summary | Derivation |
| --- | --- |
| Needs attention | Local review state is Needs work, Tests requested, Review required or Blocked. |
| Awaiting evidence | Local review state is Tests requested, the report contains missing tests, or the verification pack contains missing, unverified or stale evidence. |
| Blocking requirements | The latest report has uncleared decision conditions or an open blocking Merge Contract clause. Local condition progress removes fully cleared report conditions from this count. |
| Ready | Local review state is Ready to merge. |
| Reaffirmation | The verification pack marks the human decision stale, its applicability predates the current head, or evidence is stale. Unsupported records remain at zero rather than fabricating a signal. |

Counts use tabular technical numerals. The strip explicitly follows the page’s browser-local context and is not presented as team or server analytics.

## Sibling-view derivation

| View | Derivation |
| --- | --- |
| Inbox | Every grouped report in the active local workspace. |
| Assigned locally | Local owner is not Unassigned. |
| Awaiting evidence | The same missing-test/evidence derivation used by the summary strip. |
| Ready | Local review state is Ready to merge. |
| Reviewed | Local review state is Reviewed or Archived. |

“Assigned to me” cannot be derived truthfully because Lintel has no authenticated-user identity. The closest existing view is therefore **Assigned locally**, which exposes current local owner metadata without implying authentication or server-backed assignment.

No independent filter toolbar was added. Current data supports the sibling views, but adding repository, owner or age filtering would introduce new route behaviour outside this milestone.

## Queue grammar

The queue is one connected, rule-separated surface with the desktop grammar:

`State | PR identity | Recommendation | Requirements | Owner | Updated`

- State uses at most one labelled status chip. Reaffirmation replaces the state label only when current data supports staleness.
- PR identity contains the record title, repository and real PR number, branch or grouped run count when useful.
- Recommendation uses the report recommendation followed by the report verdict summary as its because-clause.
- Requirements show the primary open blocking/proof state and one subordinate condition, proof gap or operational signal when needed.
- Owner uses the existing local owner or the truthful “Unassigned” label.
- Updated uses the stored report timestamp and technical metadata typography; risk remains concise technical metadata rather than a gauge.
- Selection uses a selected plane, left rule, `aria-selected` and visible focus. It never relies on bold weight.
- Actions are absent from rows and remain in the inspector.

## Inspector hierarchy

The inspector is one connected 360–400px plane with this implemented order:

1. PR identity.
2. Compact `Change → Observation → Evidence → Requirement → Human decision` trace.
3. Recommendation and report-derived because-clause.
4. Most important open requirements.
5. Most important missing proof.
6. Required next action.
7. Owner, local review state and saved local note.
8. Named progressive details for status, Merge Contract clauses, assumptions, readiness evolution, provenance and metadata.
9. Actions: Open Case File, Copy conditions and a separated destructive delete action.

Unknown evidence remains neutral. The Human decision trace node is a diamond. The trace has no ambient animation.

## Responsive behaviour

### Desktop — 1180px and above

The approved LVOS-2 rail, contextual navigation and command bar remain unchanged. The route uses a permanent split with the queue taking the remaining working width and a 360–380px sticky inspector. Summary, tabs and queue are not enclosed in one page card.

### Intermediate — 900–1179px

The queue receives the full route working width. Selecting a row opens a right sheet up to 390px wide, offset below the 52px command bar and alongside the preserved 56px rail. The sheet traps focus, closes on Escape or backdrop activation, returns focus to the selected row and locks document scrolling.

### Mobile — below 900px

The summary becomes a deliberate two-column strip with the final reaffirmation cell spanning the row. Tabs scroll internally. Column headers are removed and rows become stacked records in the order state/recommendation, title and identity, requirement/proof, owner and updated timestamp. The inspector becomes a right/full-width sheet, action controls are at least 44px, identifiers wrap and page-level horizontal overflow is clipped.

## State handling

- Loading uses static connected skeleton planes with no shimmer, gradient or ambient motion.
- No report history uses concise local-workspace copy and preserves the existing Check a pull request and demo Case File paths.
- An active sibling view with no matches uses one concise message while the visible tabs provide the route back to Inbox.
- Populated, selected/unselected, ready, reviewed, missing-evidence, open-requirement, assigned/unassigned and supported reaffirmation states use current stored data.
- Errors remain labelled alerts and do not replace stored data with examples.

## Accessibility

- Sibling views implement `tablist`, `tab`, `aria-selected`, `aria-controls`, roving tab stops and Left/Right/Home/End keyboard movement.
- Queue records implement `option` and `aria-selected`; Arrow Up/Arrow Down changes selection and focus, while Enter/Space selects and opens the compact inspector.
- The permanent desktop inspector remains an `aside` complementary landmark. Its intermediate/mobile form uses modal-dialog semantics.
- Compact-sheet focus trap, Escape close, focus return, backdrop close, scroll lock and shell-drawer close coordination are preserved.
- Every state is written as text, focus is visible, disclosures are named, the Human decision diamond is not the only state cue and mobile controls meet the 44px target.
- Reduced-motion rules remove incidental transitions, and internal tab/trace scrolling does not create page-level horizontal overflow.

## Local-first limitations

- Counts, assignment, review state and notes exist only in the active browser workspace.
- “Assigned locally” is responsibility metadata, not authentication, authorisation or a claim about the current signed-in user.
- No live collaboration, server-backed ownership, repository synchronisation or organisation analytics are implied.
- Human decisions remain separate from Lintel recommendations and are never inferred from a recommendation.

## Retained legacy debt

The superseded active E7.2 Workspace workbench block was removed from `app/globals.css`; the implemented composition is owned by `app/workspace/workspace.module.css`. Earlier `.workspace-*` compatibility selectors remain because administrative routes still consume shared legacy Workspace header, action and empty-state classes. Shared compatibility token aliases and later cross-route visual overrides also remain for LVOS-7. No unrelated route CSS was cleaned.

## Validation matrix

| Check | 1440 dark | 1440 light | 1024 dark | 390 dark | 390 light |
| --- | --- | --- | --- | --- | --- |
| Shell geometry unchanged | Approved | Approved | Approved | Approved | Approved |
| Connected summary and truthful counts | Approved | Approved | Approved | Approved | Approved |
| Tabs and active-state semantics | Approved | Approved | Approved | Approved | Approved |
| Aligned/stacked queue grammar | Approved | Approved | Approved | Approved | Approved |
| Inspector closed/open transformation | Approved | Approved | Approved | Approved | Approved |
| Focus, Escape, return and scroll lock | N/A | N/A | Approved | Approved | Approved |
| Long-title and identifier wrapping | Approved | Approved | Approved | Approved | Approved |
| No page-level horizontal overflow | Approved | Approved | Approved | Approved | Approved |
| Loading, empty, no-results, populated and error states | Approved | Approved | Approved | Approved | Approved |
| Guided tour, copy, delete/clear and Open Case File | Approved | Approved | Approved | Approved | Approved |

Final visual, responsive, functional and runtime review passed. The bounded missing-proof list now uses unique stable composite React keys, resolving the duplicate-key warning; the development runtime is clean. The LVOS-2 shell, storage model, local report-history behaviour and every other route body remain unchanged.

## Milestone status

**Approved — 15 July 2026.** LVOS-3 and Archetype A are approved, `/workspace` typography adoption is approved and AU-06 is closed. Remaining Workspace legacy-debt cleanup stays deferred to LVOS-7.
