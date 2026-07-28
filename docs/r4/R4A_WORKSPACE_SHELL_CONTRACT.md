# R4A Workspace Shell Contract

> **Milestone:** R4A — Engineer Workflow and Reference Lock
> **Status:** Binding R4A contract pending human acceptance
> **Scope:** The four-region Workspace shell, dimensions, anatomy, information ownership, selection, modes, responsive collapse, and app-wide route pattern.
> **Authoritative inputs:** The binding R4A task prompt; authoritative R4 continuity brief; Cursor, Vizually, Vercel, StackAI, and current Lintel screenshots; current Workspace route and shell repository evidence.
> **Excluded scope:** Final breakpoints, production grid code, exact transitions, exact shortcuts, modal field composition, and R4C pixel calibration.
> **Next owning milestone:** R4B — Workspace Information and Interaction Architecture.

## Locked shell

The Workspace shell is:

`Global Rail → Review Queue → Verification Workspace → Contextual Inspector`

The Workspace is visually dominant. The Rail establishes product area, the Queue establishes work selection, the Workspace carries the verification record, and the Inspector explains or acts on one contextual object. No region may assume another region's primary responsibility.

## Wide-desktop dimensions

| Region | Recommended default | Documented minimum | Documented maximum | Reason |
| --- | ---: | ---: | ---: | --- |
| Global Rail | `52px` | `52px` | `56px` | The locked hypothesis starts at 52px; it is sufficient for 18px navigation icons, focus, and compact area identity without becoming a sidebar. |
| Review Queue | `264px` | `248px` | `276px` | The midpoint supports repository, PR, two-line title, recommendation, and blocker metadata while preserving Workspace dominance. |
| Verification Workspace | Flexible | `640px` usable content target | No fixed maximum | It absorbs available width and remains the dominant working surface. R4B must validate the practical minimum against real content and zoom. |
| Contextual Inspector | `352px` | `320px` | `380px` | It supports explanations, technical metadata, relationships, and deliberate actions without duplicating the Workspace. It is collapsible. |

These are documentation values, not implementation code. R4B may choose exact breakpoint transitions but may not replace the four-region hierarchy or make the Queue or Inspector visually dominant.

## Global Rail anatomy

The Rail is a compact product-area switcher with five areas:

1. Reviews;
2. Operations;
3. Governance;
4. Integrations;
5. System.

The Rail includes the Lintel identity, area controls, and a bottom-anchored account/local-environment control only where current capability supports it. Labels remain available through accessible names and discoverable tooltips or an expanded navigation state. Selection uses the understated selected surface plus an explicit active marker. The Rail never contains every route, review status, or review object and never expands into a permanent conventional sidebar.

## Review Queue anatomy

The Queue groups work into:

- Needs attention;
- In review;
- Ready;
- Reviewed.

Group counts are collection orientation, not generic metrics. Groups are collapsible only if selection remains visible and keyboard-operable. Updating or regrouping a list must preserve stable selection by review identity.

### Queue-row fields

| Priority | Field | Requirement |
| --- | --- | --- |
| Required 1 | Repository and PR number | Always visible in expanded rows; compact technical label; never title-only identity. |
| Required 2 | Concise PR title | Primary row label; maximum two visual lines in expanded Queue and one line in compact Queue. |
| Required 3 | Recommendation | Explicit text such as `Tests required`; never colour-only and never called a decision. |
| Required 4 | Risk | Band is required; score appears when the source record has a score and space permits. |
| Required 5 | Requirement summary | Open and blocking counts; blockers outrank open-total display when space is constrained. |
| Optional 1 | Real ownership | Show only real local ownership metadata; fixture people remain visibly fixtures. |
| Optional 2 | Changed-since-last-run | High-priority optional signal; show when a valid comparison exists. |
| Optional 3 | Updated time | Relative time in the row; exact accessible timestamp on demand. |
| Optional 4 | Run/head cue | Use when necessary to distinguish analyses of the same PR; otherwise keep in Workspace. |

### Truncation and priority

Repository, PR number, recommendation, risk band, and blocking count must not be truncated into ambiguity. The title truncates before those fields. Ownership and time disappear before required fields. Technical identifiers may middle-truncate visually only if keyboard, pointer, and assistive-technology users can access the full value without copying from hidden DOM. A changed-since-last-run signal outranks updated time because it changes review urgency.

Selected, focused, hovered, disabled, and pressed states remain visually distinct. The selected row retains its state when focus moves into the Workspace. Focus remains visible independently of selection.

## Verification Workspace anatomy

The Workspace contains:

1. a compact selected-review header;
2. mode navigation for `Overview`, `Change`, `Evidence`, `Requirements`, and `History`;
3. one primary work surface for the active mode;
4. a persistent decision-readiness region or action entry that never obscures content;
5. controlled internal scrolling with stable header and selection context.

### Selected-review header

The header owns repository, PR number, title, recommendation, risk, run/head identity, provenance, Human Decision applicability, and the most important limitation. It must not become a marketing hero or a metric-card strip.

### Workspace modes

| Mode | Primary question | Required content |
| --- | --- | --- |
| Overview | Why is this review ready or not ready now? | Change summary, recommendation/risk explanation, highest-impact finding, evidence/missing-proof summary, open/blocking requirements, decision readiness, and next inspection target. |
| Change | What changed and where should I inspect? | Changed files/surfaces, technical metadata, available focused diff context, affected findings, and run/head provenance. |
| Evidence | What supports or weakens the recommendation? | Findings, evidence records, missing proof, strength/class/provenance/staleness, and explicit relationships. |
| Requirements | What must be proved or acted on? | Blocking/advisory requirements, status, required/supporting evidence, current capability, and history. |
| History | What moved and does an earlier decision still apply? | Run list, current/previous comparison, Readiness Delta, Review Diff, recommendation/risk movement, record movement, and Human Decision applicability. |

Modes are views of one selected review, not unrelated routes. Changing modes does not change Queue selection. Object selection survives a mode change only when the object remains relevant and visible; R4B defines the exact transition and announcement.

## Contextual Inspector anatomy

The Inspector supports the central work and may show:

- selected-object identity and state;
- why the object matters;
- provenance, run, and head applicability;
- explicit related records;
- affected file or surface;
- missing or required proof;
- truthful available actions;
- decision-readiness implications;
- owner/reviewer context where real;
- a clear route back to the primary record.

It must not permanently repeat the full recommendation, all findings, all requirements, or the complete History mode. It contains one contextual vertical scroll region. When collapsed, selection remains represented in the Workspace; reopening restores the selected object's context.

### Inspector state precedence

The Inspector resolves one state in this order:

1. explicit selected object: finding, evidence, missing proof, requirement, file, or run;
2. explicit reviewer/ownership context;
3. explicit decision-readiness context;
4. no explicit selection: concise review-level next-inspection guidance.

New explicit selection replaces the prior Inspector object. It does not create stacked inspectors. A related-object activation moves the primary Workspace focus to that object and then recomputes the Inspector; it does not leave two objects selected.

## Relationship visualisation

Relationships may appear as a compact ordered list, trace, adjacency view, or small fixed-layout link set when data contains explicit IDs. A finding can link to evidence, missing proof, requirements, and files; an evidence record can link back to supported findings and requirements. The view must state unavailable or unresolved relationships truthfully.

No free-form layout, draggable nodes, zoomable canvas, workflow editing, decorative graph, or expensive automatic graph arrangement is permitted.

## Scroll ownership

- Rail: no routine scrolling; an accessible overflow strategy is required at extreme height/zoom.
- Queue: one independent vertical scroll region; group header treatment may remain orienting without masking rows.
- Workspace: one primary vertical scroll region for the selected review; mode header and decision entry may remain stable without overlaying records.
- Inspector: one independent vertical scroll region when open.
- Modal: contained internal scrolling only when viewport height requires it; the background does not scroll.

Focus movement must not unexpectedly scroll a different region. Overscroll must not chain into another panel during routine use. R4B validates sticky regions at 200% zoom.

## Responsive responsibilities

Responsive design is defined by preserved responsibility, not by shrinking all four panels.

| Layout state | Regions and responsibility |
| --- | --- |
| Wide workstation | Rail + Queue + dominant Workspace + Inspector. All four are visible and independently legible. |
| Normal laptop | Rail + Queue + dominant Workspace; Inspector collapses to a labelled control and opens without losing selection. |
| Narrow laptop | Rail + compact Queue + Workspace; Inspector becomes a drawer. The Queue preserves selected review identity and blocker state. |
| Tablet | Review list first → selected Workspace second → contextual detail drawer. Global navigation is a compact disclosure, not a persistent four-panel layout. |
| Mobile | Review list → selected review → selected record or consequential action. Each step is a full functional view with a clear back path and preserved review identity. |

The mobile fallback must allow the engineer to select a review, understand recommendation/risk, inspect the top finding and evidence, see missing proof and blockers, compare essential run movement, and reach the Human Decision flow. It does not reproduce a compressed desktop grid. No critical workflow depends on hover, pointer precision, simultaneous panels, or duplicated hidden Workspace DOM.

Final breakpoint values, Queue collapse mechanics, drawer behaviour, and diagrams are R4B responsibilities.

## App-wide route pattern for R4F

R4F carries the light system across logged-in routes without making every route a Workspace clone. The Global Rail areas remain authoritative; contextual navigation and the route's dominant task surface follow.

| Route | R4F responsibility | Current truth that must remain visible |
| --- | --- | --- |
| `/workspace` | Primary verification workstation; full four-region model where width permits. | Real local report history default; explicit fixture path; unavailable rather than substituted data. |
| `/new` | Review intake and analysis-run creation. | Multiple input sources, deterministic baseline, optional configured model, session handoff, durable history append where supported. |
| `/report` | Deep Case File and Human Decision history/context; may converge with Workspace responsibilities without duplicating authority. | Durable/session/demo provenance; durable-only persistence; full decision/run/evidence contracts. |
| `/review-operations` | Dense operational review records and filtering. | Local-device history, not organisation analytics; recommendation remains distinct from Human Decision. |
| `/team` | Local reviewer and ownership coordination. | No authentication, RBAC, presence, shared team state, or real fixture people. |
| `/review-policies` | Searchable policies/profiles/templates with preview-before-apply when implemented. | Current profiles are local prototype/conceptual and do not enforce or assign repository policy. |
| `/settings` | System and analysis configuration records. | Current settings are read-only/conceptual where the repository does not persist configuration. |
| `/github-action` | GitHub integration information and future setup pattern. | Action route is a blueprint; it does not install, execute, connect, or post. Keep separate from the real configured GitHub App. |
| `/slack-handoff` | Concise export/handoff formats. | Copy/export only; no Slack API, OAuth, workspace connection, schedule, or automated delivery. |

Sana's Connected/Available pattern may govern a future integrations route only when real connection status, owner, access, and capability data exist. Attio's template pattern may govern policies/profiles/onboarding only when preview, clone, or apply actions are implemented truthfully. R4A does not redesign those routes.

## Shell acceptance

The shell is accepted when each region has one clear responsibility, the Workspace dominates, selection is stable, dense records remain readable, responsive states preserve the canonical workflow, and no surface duplicates or invents product truth to fill space.
