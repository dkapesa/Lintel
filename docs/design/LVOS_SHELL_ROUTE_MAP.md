# LVOS shell route map

**Status:** Approved  
**LVOS baseline:** v1.0  
**Milestone:** LVOS-2 — Application Shell and Navigation  
**Approved system layer:** Global authenticated application shell

## Final approval record

- **Approval date:** 15 July 2026
- **LVOS-2:** Approved.
- **Global authenticated application shell:** Approved.
- **Audit findings:** AU-02, AU-03 and AU-16 closed.
- **Desktop shell:** 56px global rail, approximately 220px contextual navigation and 52px command bar.
- **Intermediate shell:** persistent 56px rail, contextual drawer and shared command overflow.
- **Mobile shell:** 52px command bar, combined navigation drawer and shared command overflow.
- **Authenticated route bodies:** Preserved.
- **Deferred scope:** `/new` body typography and route-level visual convergence remain pending their later milestones.

## Purpose

This document records the definitive authenticated Lintel application shell approved under LVOS-2. It centralises route ownership, contextual navigation and command-bar context without migrating any route-body archetype. Final manual review closes AU-02, AU-03 and AU-16; route-body convergence remains assigned to later LVOS milestones.

## Approved shell dimensions

| Region | Wide desktop (1180px and above) | Intermediate (900–1179px) | Mobile (below 900px) |
| --- | --- | --- | --- |
| Global rail | 56px, persistent | 56px, persistent | Not persistent |
| Contextual navigation | 220px, persistent | 292px drawer | Included after global destinations in the combined drawer |
| Command bar | 52px | 52px | 52px |
| Navigation drawer | Not present | 292px, viewport-safe | Up to 300px, constrained to viewport minus 24px |

The global rail and contextual navigation are separate structural layers. The route working surface begins immediately beneath the command bar and receives all remaining width.

## Global destination ownership

| Global area | Permanent destination | Owned routes |
| --- | --- | --- |
| Workspace | `/workspace` | `/workspace`, `/new` |
| Reports | `/report` | `/report` |
| Operations | `/review-operations` | `/review-operations`, `/github-action`, `/slack-handoff` |
| Policies | `/review-policies` | `/review-policies` |
| Team | `/team` | `/team` |
| Settings | `/settings` | `/settings` |

Every authenticated route resolves to exactly one global area through `app/nav-config.tsx`. Query strings do not affect ownership, so `/report?demo=1` remains owned by Reports without rewriting or discarding the URL.

## Route-to-global-area and command-bar map

| Route | Global area | Current contextual item | Command-bar context | Central primary action | Route-owned actions preserved |
| --- | --- | --- | --- | --- | --- |
| `/workspace` | Workspace | Risk Inbox | Workspace / Risk Inbox plus current workspace summary | Check a pull request → `/new` | Guided tour; clear history when available |
| `/new` | Workspace | New Review | Workspace / New Review | None | Route-body review submission remains in place |
| `/report` | Reports | Case File | Reports / Case File plus repository and PR identifier | None | Source, command/quick actions, copy and download |
| `/review-operations` | Operations | Review Operations | Operations / Review Operations | None | Existing route-body actions |
| `/github-action` | Operations | GitHub Action | Operations / GitHub Action | None | Existing route-body actions |
| `/slack-handoff` | Operations | Slack Handoff | Operations / Slack Handoff | None | Existing route-body actions |
| `/review-policies` | Policies | Review Policies | Policies / Review Policies | None | Existing route-body actions |
| `/team` | Team | Team Workspace | Team / Team Workspace plus active workspace summary | None | Existing route-body actions |
| `/settings` | Settings | Analysis Settings | Settings / Analysis Settings | None | Existing route-body actions |

The shell does not invent a search field or command palette. The report route's existing command/quick-action behavior and shortcut remain route-owned and functional.

## Contextual navigation map

| Active global area | Destinations |
| --- | --- |
| Workspace | Risk Inbox → `/workspace`; New Review → `/new` |
| Reports | Case File → `/report`; New Review → `/new`; Risk Inbox → `/workspace` |
| Operations | Review Operations → `/review-operations`; GitHub Action → `/github-action`; Slack Handoff → `/slack-handoff` |
| Policies | Review Policies → `/review-policies`; Security Model → `/docs/security-model.md` |
| Team | Team Workspace → `/team`; Review Operations → `/review-operations` |
| Settings | Analysis Settings → `/settings`; GitHub Action → `/github-action`; Slack Handoff → `/slack-handoff` |

Every item is backed by a current route or an existing static documentation target. No future Members, Ownership, Repository Assignments or Decision History destinations were added.

## Desktop behavior

At 1180px and above, the 56px icon-only rail remains fixed at the left edge. Its six 16px geometric line icons use `currentColor`; the selected destination occupies a 32px × 32px neutral plane with a structural edge marker. Pointer hover and keyboard focus reveal a labelled tooltip while the link retains its own accessible name. The 220px contextual navigation sits beside the rail on an adjacent semantic plane. The 52px command bar spans only the working surface.

## Intermediate behavior

At 900–1179px, the global rail remains 56px and contextual navigation leaves the layout. A 44px command-bar trigger opens the active area's contextual navigation in a 292px modal drawer adjacent to the rail. The drawer traps focus, closes on Escape or backdrop activation, locks document scrolling and returns focus to the trigger. The working surface receives all width not used by the rail.

## Mobile behavior

Below 900px, the rail and persistent contextual navigation are removed. The 52px command bar retains a 44px navigation trigger. The combined drawer presents global destinations first, then the active area's contextual destinations, followed by workspace, theme and local-security controls. Its width is `min(300px, viewport minus 24px)`. The shared command overflow retains route actions without command-bar or document-level horizontal scrolling.

Shell navigation dispatches a shared close signal before opening. The existing workspace inspector and report decision sheet respond by closing first, preventing modal stacking while leaving their own focus trap, Escape, focus-return and scroll-lock mechanics independent.

## Accessibility requirements implemented

## Responsive command-action overflow

At 1180px and above, the command bar permits one filled primary action and up to two useful route actions beside a readable context. Additional actions use the shared overflow menu rather than compressing context. The theme control remains visible. Workspace keeps **Check a pull request** as its filled action and can show **Restart guided tour** and **Clear history** directly. Report keeps its source status as metadata, can show **Actions** and **Copy summary**, and puts **Download Markdown** in overflow.

At 900â€“1179px, the command bar keeps its navigation trigger, concise current context, and at most one primary action. All secondary route actions move into the shared 44px overflow trigger. The theme control moves to the existing drawer footer so it cannot displace current context.

Below 900px, the command bar never scrolls horizontally. It retains the concise current item, one filled primary action only when it fits, and the shared 44px overflow trigger for remaining actions. Workspace places the guided-tour and clear-history controls in overflow; Report places source state, **Actions**, **Copy summary** and **Download Markdown** in the same overflow list. The drawer footer remains the reliable location for theme and workspace controls.

The shell owns one responsive command-overflow primitive driven by the route/context configuration. It classifies existing route-provided controls as contextual metadata, useful wide-desktop actions, remaining overflow actions and, where applicable, destructive actions. It does not alter the underlying action element, URL, handler, shortcut or disabled state. The overflow trigger has the accessible name **More actions**, controls a semantic action list, and is keyboard and touch reachable. The list is not mounted while closed. Escape and outside interaction close it; Escape restores focus to the trigger. Opening shell navigation closes the action list first. The menu is constrained to the viewport, uses the existing raised overlay material and overlay shadow only, and is layered below the navigation drawer while remaining above the command bar.

- One labelled primary navigation for global areas and a distinctly labelled contextual navigation.
- `aria-current` on the active global and contextual links; selected state also uses a plane, border and edge marker.
- Accessible names for icon-only links and controls; rail tooltips appear on hover and focus.
- A labelled command-bar banner and a labelled main working region per route.
- Logical keyboard order with visible shared focus styles.
- Modal drawer semantics, focus trap, Escape close, focus return, backdrop close and HTML/body scroll locking.
- Background shell content becomes inert and `aria-hidden` only while the drawer is open, then returns to the accessibility tree on close.
- 44px drawer and mobile command-bar controls.
- Command-action overflow has an accessible trigger, a semantic action list, keyboard-reachable original controls, Escape and outside close, focus return after Escape, and no hidden focusable actions while closed.
- Reduced-motion-safe tooltip behavior and no required motion for comprehension.

## Typography adoption

LVOS-2 applies the approved LVOS-1 role tokens to the global rail, contextual navigation, command bar, tooltips and drawer controls. Shell text is at least 10px, uses weights no higher than 600, uses sans for ordinary interface language and reserves mono for the report's repository/PR technical context. Uppercase is limited to scarce micro-labels. `/new` receives the shell integration only; its route-body typography remains pending its owning migration work.

LVOS-2 shell typography is approved following final manual review in dark and light themes on 15 July 2026. `/new` receives shell integration only; its route-body typography remains pending its owning later milestone.

## Preserved route mechanics

- Direct route and query-string navigation, refresh, browser history and active route matching.
- System, light and dark theme bootstrap, persistence and selection.
- Report command/quick actions, copy and download controls.
- Workspace guided tour, clear-history state and review action.
- Current team workspace selection and local metadata.
- Workspace inspector and report decision-sheet behavior.
- All route data, forms, imports, report generation, normalisation, scoring, schemas, storage and local review mechanics.

## Intentional current limitations

- No new command palette or search behavior is introduced.
- Route bodies retain their current LVOS migration debt and visual grammar until LVOS-3 through LVOS-5.
- `/new` body typography remains pending; it was not migrated by this milestone.
- `/new` body typography and route-level visual convergence remain deferred to their owning later milestones.

## Retained legacy selectors and compatibility rules

The definitive shell styles are isolated in `app/app-shell.css`, imported after the shared design-system layers. The active component no longer renders the old expandable/collapsible sidebar classes, and the superseded E7.1 `.shell-sidebar`, `.shell-nav*`, `.shell-topbar`, `.shell-drawer` and collapsed-nav rules were removed as proven zero-consumer selectors.

Older pre-shell `.sidebar`, `.side-nav`, `.nav-item`, `.topbar` and `.main-content` generations remain intentionally for LVOS-7 because report-era and route-body consumers have not yet completed their owning migrations. The `app-shell` class also remains on authenticated route roots because existing route-body compatibility selectors use it. Semantic token aliases and all E6/V2/V3/V4/V5/E7 route selectors remain untouched unless required for shell integration.

## Validation matrix

| Check | 1440 | 1180 | 1024 | 900 | 768 | 390 |
| --- | --- | --- | --- | --- | --- | --- |
| 56px rail | Required | Required | Required | Required | Not present | Not present |
| 220px contextual navigation | Required | Required | Drawer | Drawer | Combined drawer | Combined drawer |
| 52px command bar | Required | Required | Required | Required | Required | Required |
| Dark and light geometry parity | Required | Required | Required | Required | Required | Required |
| Active global/context state | Required | Required | Required | Required | Required | Required |
| Drawer focus/Escape/return/lock | N/A | N/A | Required | Required | Required | Required |
| No document horizontal overflow | Required | Required | Required | Required | Required | Required |

Representative route checks covered `/workspace`, `/new`, `/report?demo=1`, `/review-operations`, `/team`, `/settings`, `/review-policies`, `/github-action` and `/slack-handoff`. Final manual review confirmed route reachability, both themes and the width matrix.

## Approval status

**Approved — 15 July 2026.** LVOS-2 final manual review is complete. Retained legacy shell debt remains assigned to LVOS-7.
