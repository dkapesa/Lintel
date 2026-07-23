# R2A — Whole-Product Visual & Interaction Contract (Logged-in)

**Status:** Planning artifact (read-only audit). No application code or styling changed.
**Branch:** `r2a-logged-in-convergence-contract`
**Companion:** `docs/product/r2a-logged-in-route-capability-inventory.md`

> This contract defines one coherent visual and interaction system for the whole logged-in product, plus purpose-built layout models per route family. It is grounded in the repository's existing systems: the semantic token layer in `app/design-system.css` / `app/globals.css`, the shared `AppShell` (`app/app-shell.tsx`) and route ownership (`app/nav-config.tsx`), and the frozen production Workspace (`app/workspace-v2/**`). It borrows composure from Cursor's density and pane cohesion without copying its product structure.

---

## 1. Design thesis

**One Lintel product system. Several purpose-built working modes.**

Every logged-in surface shares one token layer, one control vocabulary, one set of state semantics, and one navigation frame. Within that shared system, each route family gets a layout tuned to its job: a verification *workstation*, a review *builder*, a decision *document*, operational *dashboards*, configuration *surfaces*, and integration *setup* pages. Coherence comes from shared primitives, not from forcing one layout onto every route.

## 2. Relationship to the final Workspace

The production Workspace (`/workspace`) is the reference-quality system and is **frozen**. It is full-bleed and renders through its own `WorkspaceShellState` — it does **not** use `AppShell`. The rest of the logged-in product should feel like it belongs to the same product as the Workspace (same tokens, type, density, state colours, focus behaviour) **without** adopting the Workspace's specialist multi-pane layout. The Workspace sets the quality bar; it is not a template to replicate on every route.

## 3. Cursor influence boundary

**Borrow:** composure and calm; high information density that stays readable; cohesive panes with quiet separators; a stable left rail; keyboard-first ergonomics; restraint in colour and motion.

**Do not copy:** Cursor's product structure or route model; its branding; and its agent-chat metaphors (conversation panes, "Agent/Composer" affordances, chat inputs). Lintel's central surfaces are evidence, documents and dashboards — not a chat. Influence is limited to *feel and density*, never to *structure or metaphor*.

## 4. Product-level neutral primitives

The neutral substrate shared by every logged-in surface (existing tokens):

- **Surfaces:** `--color-canvas` (app background), `--color-sidebar` (rails/nav), `--color-surface` / `--color-surface-raised` (panels/cards), `--color-surface-inset` (wells/code), `--color-surface-hover`, `--color-surface-selected`.
- **Borders:** `--color-border` (default hairline), `--color-border-strong` (emphasis/active).
- **Elevation:** `--shadow-card`, `--shadow-panel`, `--shadow-overlay`, `--shadow-selected` (used sparingly; the product is mostly flat with hairline separation).
- **Radius/rhythm:** consistent small radii and an 8px-based spacing rhythm (see §7).

## 5. Semantic colour system

Colour is semantic, never decorative. Existing semantic tokens:

- **Text:** `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-faint`, `--color-text-inverse`.
- **Accent/interactive:** `--color-accent`, `--color-accent-strong`, `--color-focus-ring`, `--color-selection`.
- **State:** `--color-success` (+ `-soft`), `--color-warning` (+ `-strong`/`-muted`/`-soft`), `--color-danger` (+ `-strong`/`-soft`), `--color-information` (+ `-muted`/`-soft`).
- **Provenance:** `--color-provenance` (+ `-soft`) — reserved for source/provenance signalling (e.g. observed vs assumed evidence).

Rule: recommendation/risk/decision state must always map to these tokens (e.g. TESTS_REQUIRED → warning, Ready to merge → success, Blocked → danger, informational context → information). No route may introduce ad-hoc hex for state. **Exception on record:** the frozen Workspace defines a private palette (`--wsv2-c-*`, ~23 fixed values) — it is exempt because it is frozen, and this exemption is the root of the theme decision (§ theme).

**R2C token recalibration mandate (locked).** R2C must **preserve the semantic token names and contracts** but **recalibrate the logged-in dark token *values*** toward the final Workspace visual system. Merely reusing the current token values is **insufficient** for convergence. Direction: warm-neutral graphite; remove the broad cool blue-grey cast; low-chroma pane relationships; blue reserved for interaction; restrained semantic colour; quieter borders; fewer nested raised cards; flatter operational lists and records; improved pane cohesion. No exact hex values are defined in R2A. The frozen Workspace private token implementation (`--wsv2-c-*`) remains unchanged, and the public `.lp` visual scope must not be changed.

## 6. Typography roles

- **Sans (`--font-sans`, Geist):** all product UI — headings, body, labels, controls.
- **Mono (`--font-mono`, Geist Mono):** technical tokens — file paths, SHAs, run ids, code blocks, YAML, identifiers.
- **Newsreader (`--font-newsreader`):** **landing-only** (`.lp` scope). Must not appear in logged-in product surfaces.
- **Roles:** page title → section title → group heading → record title → support/meta. Support and metadata step down through `--color-text-secondary`/`-muted`/`-faint`. The `/lvos/typography-proof` specimen is the internal reference for these roles.

## 7. Border, spacing & density system

- **Density:** dense but readable — the Workspace is the density anchor; `AppShell` routes are one notch more relaxed but never sparse.
- **Separators:** prefer hairline `--color-border`; reserve shadows for overlays/menus and true elevation.
- **Spacing:** 8px base rhythm; consistent group padding and record row heights; tables use compact rows with `data-label` responsive collapse (already used in Team/Operations).
- **Structure:** `page` → `document`/section → `group` (header + body) → record/row is the existing content skeleton (`administrative-document.module.css`) and should remain the shared scaffold.

## 8. Interaction states

Every interactive element must express: **focus, selected, active, pressed, disabled, pending**.

- **Focus:** visible ring via `--color-focus-ring` (never removed); focus must be restored after navigation/drawer collapse (see §17).
- **Selected:** `--color-surface-selected` + `--shadow-selected` inset; `aria-current="page"` for nav.
- **Active (current route/tab):** strong text + `--color-border-strong`; `aria-selected` for tabs.
- **Pressed:** momentary surface shift; respects reduced-motion.
- **Disabled:** reduced contrast text, no pointer, `disabled`/`aria-disabled`; never a bare grey with no affordance.
- **Pending:** explicit busy/loading state with `aria-live`/`aria-busy`; no silent spinners that hide truth.

## 9. Shared control contract

- **Buttons:** primary (accent fill), secondary (bordered), danger (danger token), all with focus/hover/pressed/disabled. Primary reserved for the one main action per surface (e.g. "Generate Case File", "Record decision").
- **Icon buttons:** square hit target, `aria-label`, tooltip where the rail already uses `RailTooltip`.
- **Inputs / textarea / selects:** bordered, `--color-control-background`, autofill-safe, focus ring; labelled via `<label>`; consistent sizing with buttons.
- **Checkboxes / radios:** native, themed, keyboard-operable (Slack handoff radios and Workspace queue are the references).
- **Tabs:** `role="tablist"`/`role="tab"`/`aria-selected` (Review Operations is the reference); tabpanels labelled.
- **Disclosures:** native `<details>`/`<summary>` (Review Policies is the reference) with a consistent chevron affordance.
- **Notices:** state-toned inline blocks (success/warning/danger/information) with an icon and `role="status"`/`role="alert"` as appropriate.
- **Dialogs:** `role="dialog"`/`aria-modal`, focus-trapped, Escape-closable, focus-restoring. **The production Workspace Human Decision dialog is the primary modal/focus-quality reference;** the shell drawer and guided-tour card are secondary references.

## 10. Shared content patterns

- **Evidence records:** title + support + provenance chip (`directly-observed` / `unknown` / `PRESENT` / `MISSING`) mapped to state/provenance tokens.
- **Requirement clauses:** clause text + importance (blocking/advisory) + status (open/satisfied/accepted), state-toned.
- **Human Decision records:** actor label, outcome, timestamp (`<time>`), reaffirmation state; decisions always visually separated as the human authority.
- **Metadata:** monospace technical ids, truncation with title tooltip (`shortIdentifier` pattern), stepped-down colour.
- **Metric summaries:** `dl` summary strips (Operations ledger, Team overview) — compact `dt/dd` counts.
- **Tables / operational lists:** compact rows, `data-label` responsive collapse, state-toned status cells, right-aligned actions.
- **Empty / unavailable / partial states:** first-class, worded honestly (see §21), never a blank panel.

## 11. Product-shell architecture

The shared shell (`AppShell`) has three structural zones at wide desktop:

1. **Global product rail** (56px) — always visible.
2. **Contextual sidebar** (220px) — area-specific destinations + workspace switcher.
3. **Body** — a 52px command bar (breadcrumb context + actions) above the route `main`. The logged-in Theme control is removed/hidden in R2B (dark-only, locked).

The Workspace is the deliberate exception: it replaces this shell with its own full-bleed workstation.

## 12. Global product rail

- 56px icon rail: brand mark → global **areas** → account/workspace control. The rail carries product **areas** (Review, Operations, Governance, Integrations, System) — **not** every route. Contextual destinations do not each get a permanent rail icon.
- Each area: icon + accessible label + tooltip; `aria-current="page"` when active.
- Areas come from `SHELL_GLOBAL_AREAS`; icons from `nav-config`'s `ShellIcon`. (R2B updates area membership to the five areas above.)
- The rail persists across all routes rendered through `AppShell` and collapses into the mobile drawer below 900px.

## 13. Contextual-sidebar pattern

- 220px sidebar showing the current area identity and its `SHELL_CONTEXT_DESTINATIONS`, the workspace switcher, and the local-first note.
- Collapses into a drawer between 900–1179px (contextual mode) and into the combined mobile drawer below 900px.
- Active destination uses `aria-current` + "Current" affordance.

## 14. Route-header pattern

- The 52px command bar shows: navigation trigger (drawer widths) · `Area / Title` breadcrumb · optional context meta (support/technical tone) · route actions (primary + overflow). The logged-in Theme control is removed/hidden in R2B (dark-only).
- Route actions are declared in `nav-config` (`primaryAction`, `commandActions`) so headers stay consistent and overflow behaviour is centralised.
- Dense operational routes may add a compact in-body route header (title + boundary line + metric strip), as Operations/Team already do.

## 15. Navigation information architecture

**Locked:** the global product rail represents product **areas**, not every route. Areas are **Review, Operations, Governance, Integrations, System**. Contextual destinations live under an area and do **not** each receive their own permanent global-rail icon.

```
Global areas (rail):   Review · Operations · Governance · Integrations · System

REVIEW
  Workspace                 /workspace   (full-bleed; replaces AppShell)
  New Review                /new
  Case File (contextual)    /report?reportId=<durable-history-identity>   (only when an active/durable case exists)
OPERATIONS
  Review Operations         /review-operations
  Team                      /team
GOVERNANCE
  Review Policies           /review-policies
INTEGRATIONS
  GitHub                    (GitHub App = real env-gated; GitHub Action = blueprint/export)
  Slack handoff             /slack-handoff   (export/copy-only)
SYSTEM
  System                    /settings   (read-only System/environment surface)
```

- **Case File is contextual, not a permanent global area.** It is reached under Review from Workspace/New Review/Operations. Durable, history-backed cases get a stable **local** deep link `/report?reportId=<durable-history-identity>` (survives refresh; unknown identity → unavailable, never silently substituted; return-to-Workspace preserves identity). A local deep link is **never** a hosted/shareable server URL. (This changes the current `nav-config`, where "Reports" is a permanent area.)
- **Integrations grouped, not scattered.** GitHub and Slack handoff form one Integrations area. Within it, the real env-gated **GitHub App** is kept distinct from the static **GitHub Action** blueprint; the Slack destination is labelled **"Slack handoff"** because it is export/copy-only and does not send.
- **Workspace stays reachable but unconstrained.** It appears under Review in the rail and remains full-bleed; entering it leaves the broad shell (replaces `AppShell` with the frozen full-bleed workstation), and exiting returns to the last shell context.

## 16. Route-family layout models

- **Workspace** — specialist full-bleed verification workstation (queue · spine · canvas · inspector · decision context). **Frozen.** No product rail wrapping.
- **New Review** — product rail · collapsible source/configuration sidebar · central review builder · verification-plan context · persistent run action.
- **Case File** — **contextual** (under Review), not a permanent area · product rail · collapsible case outline · technical document body · decision & utility context (recommendation/decision panel). Durable cases addressable via the local deep link `/report?reportId=<durable-history-identity>` (§15); never a hosted/shareable URL.
- **Team / Review Operations** — product rail · collapsible contextual navigation · compact route header · tabs/operational views · actionable dashboard content (tables, metric strips, load states).
- **Policies / System** — product rail · section navigation · **read-only** description surface · consequence/help context; enforcement/read-only denials always visible. `/settings` presents as **System** (runtime mode, provider availability, storage boundaries, integration status, local-only behaviour, version/build info); never described as editable configuration.
- **GitHub / Slack handoff** — product rail · setup/progress navigation · configuration or preview · connection/provenance status; "does not post/send" boundaries always visible. The real env-gated **GitHub App** is separated from the static **GitHub Action** blueprint; the Slack destination is labelled **"Slack handoff"** (export-only).

**Deviations from the proposed models (justified by repository evidence):**
- Case File's right context is a *recommendation + human-decision* panel, not a generic "utility" sidebar — the decision surface is load-bearing and must stay prominent.
- Settings is currently *read-only description*, not editable configuration; its "configuration surface" is a description surface until real config exists. Do not imply editability.
- GitHub Action and Slack handoff have no live connection state to show; their "connection/provenance status" is an explicit *"not connected / export-only"* status, not a real integration health panel.

## 17. Patterns transferred from R1D.2

The Workspace/shell navigation lifecycle whose **interaction contract is transferred, with its implementation adapted to each route family**, across the product:

**expanded navigation → compact rail → stable selection → accessible restoration.**

- Expanded contextual nav at wide widths; compact icon rail persists as widths shrink; contextual nav moves to a drawer, then a combined mobile drawer.
- Selection/active-route semantics stay stable across the transition (`aria-current`, `aria-selected`).
- On drawer open/close, focus is trapped while open and **restored to the trigger** on close (already implemented in `AppShell`); this restoration contract is mandatory for every collapsing surface.

## 18. Route-specific responsive contracts

- **Breakpoints (current baseline):** mobile ≤899px (combined drawer), drawer 900–1179px (rail + contextual drawer), wide ≥1180px (rail + inline contextual nav). These are the **existing baseline**, not an unconditional requirement for every future route composition — a route family may justify its own breakpoints where its content genuinely needs them, provided the navigation interaction contract (§17) is preserved.
- **New Review / Case File:** three-column at wide; the side context (config / case outline / decision) collapses first; the central builder/document is never sacrificed.
- **Operations / Team:** tables collapse to `data-label` stacked rows; tab bars remain reachable; metric strips wrap.
- **Policies / Settings / Integrations:** single readable column with section nav collapsing into the drawer.
- **Workspace:** owns its own responsive rules (frozen).

## 19. Keyboard & accessibility requirements

- Every interactive element reachable and operable by keyboard; visible focus always.
- Landmarks: `banner` (command bar), `navigation` (rails/contextual), `main` (route body), labelled `dialog`s.
- Tabs use roving/`aria-selected`; disclosures use native semantics; tables use `<th scope>`.
- `aria-live` for async status (import errors, copy status, load states); `role="alert"` for errors.
- Focus restoration after navigation collapse and dialog close (§17).
- Colour is never the sole state carrier — pair with text/label/icon.

## 20. Motion & reduced-motion contract

- Motion is functional and quiet: drawer slide, theme cross-fade (~180ms), spotlight movement.
- `prefers-reduced-motion: reduce` disables transitions (already honoured in `theme-provider` and guided-tour CSS); the product must remain fully usable and truthful without motion.
- No decorative or attention-grabbing animation in the logged-in product; landing motion stays in the `.lp` scope.

## 21. Loading, empty, unavailable, malformed & partial-state contract

Every data surface must express these truthfully (Review Operations' `loading | local | empty | unavailable` is the reference):

- **Loading:** explicit, not a flash of fixture data.
- **Empty:** worded with a next action ("Generate a report to…"), never a bare panel.
- **Unavailable:** storage/connection genuinely inaccessible → say so; do not substitute fixture or another record.
- **Malformed:** guarded reads (history pruning, ledger normalisation) degrade gracefully; the surface shows what is valid and marks the rest unavailable.
- **Partial:** partially satisfied evidence/requirements render as partial (warning/information), not as satisfied.

## 22. Truthful provenance contract

- Real, fixture, session, and env-gated data must be visually distinguishable.
- Fixture/demo surfaces carry an explicit badge (the Case File "Demo report" badge is the model).
- Provenance chips (`directly-observed`, `unknown`, `PRESENT`, `MISSING`, source labels) use the provenance/state tokens consistently.
- No surface may present fixture people, activity, connections or metrics as real (see the capability inventory §17).

## 23. Local-only vs connected/team language

- Default framing is **local-first / this device**. "Team", "members", "roles", "workspace" must read as *local responsibility metadata*, not authenticated multi-user state.
- "Connected GitHub" / "GitHub App" must keep an explicit configured/not-configured status and never imply a live connection by default.
- Operations must keep "not hosted organisation analytics"; Policies "does not enforce"; Settings "read-only / stores nothing".
- A shared, reusable "local-only" / "not connected" / "export-only" chip vocabulary should be standardised in R2C.

## 24. Visual patterns to retire

- Any route-local ad-hoc state colours that bypass the semantic tokens.
- Any implication of editable configuration on read-only Settings, or enforcement on Policies.
- Any control that looks like delivery/connection but only copies/reads locally, unless paired with an explicit "export-only / not connected" chip.
- Fixture data shown without a badge (esp. the Team sample-workspace person/activity).
- Newsreader or landing motion leaking into logged-in surfaces.

## 25. Non-goals

- Not restyling or re-architecting the Workspace (frozen).
- Not building authentication, sync, multi-user, enforcement, provider config or delivery.
- Not adding a light theme to the Workspace in R2.
- Not copying Cursor's structure or chat metaphors.
- Not creating stable per-report Case File URLs unless the product decision in the inventory (§16) chooses to.

## 26. Migration rules

- Converge onto shared primitives without changing storage keys, schemas, data flow, or route behaviour.
- Preserve every must-remain-unchanged item in the capability inventory §13.
- Introduce primitives (R2C) before migrating routes (R2D+); no route adopts a bespoke version of a shared control.
- Land truthfulness language corrections with the relevant route, not as a separate pass.
- Keep the Workspace outside the shell throughout.

## 27. R2 visual acceptance criteria

A converged logged-in product passes when:

- All routes rendered through `AppShell` share one rail, contextual-sidebar, command-bar, and control vocabulary.
- All state colour maps to semantic tokens; no ad-hoc state hex outside the frozen Workspace.
- Every data surface shows correct loading/empty/unavailable/partial states.
- Focus is always visible and restored after navigation/dialog collapse.
- Fixture/demo/local-only/not-connected surfaces are explicitly badged.
- The Workspace is visually unchanged.
- One authoritative dark theme renders every logged-in route coherently.

## 28. Whole-product QA checklist

- [ ] Rail + contextual nav + command bar consistent on all `AppShell` routes.
- [ ] Active route/tab/selection semantics (`aria-current`/`aria-selected`) correct everywhere.
- [ ] Keyboard traversal + visible focus on every interactive element.
- [ ] Drawer/dialog focus trap + restoration verified at all breakpoints.
- [ ] Load/empty/unavailable/partial states present and truthful.
- [ ] Provenance/demo/local-only/not-connected badges present where required.
- [ ] No Newsreader/landing motion in logged-in surfaces.
- [ ] Reduced-motion fully usable.
- [ ] Semantic state colours only (Workspace exempt, unchanged).
- [ ] Workspace visually identical to reference.

## 29. Transferable foundations for later R3

- The semantic token layer, typography roles, state/provenance vocabulary, and motion/reduced-motion contract are shared with the public landing (which already scopes light overrides under `.lp`).
- The truthful-provenance and honest-limitation language patterns transfer directly to landing positioning.
- The navigation lifecycle (§17) and accessibility contract are reusable for any future authenticated area.

## 30. Workspace layout is not copied to every route

Explicit statement: **the Workspace's full-bleed multi-pane layout is a specialist model for verification and is not the template for the product.** Other routes adopt the shared shell and their own family layout models (§16). Coherence is delivered by shared tokens, type, states, controls and navigation — not by replicating the Workspace canvas.

---

## Theme decision (logged-in)

**Finding:** The repository has a complete semantic light palette (`:root[data-theme="light"]` in `design-system.css`) and the public landing has genuine `.lp` light overrides. Most `AppShell` routes consume semantic tokens and would render in light. **However, the flagship Workspace ships a private, dark-only palette (`--wsv2-c-*`, ~23 fixed hex values, no `data-theme="light"` override).** The `ThemeControl` offers System/Dark/Light on every route including the Workspace, where light is not honoured.

**Decision (locked):** R2 ships **one authoritative dark logged-in theme.** System and Light are **not** supported logged-in themes during R2. Because the frozen flagship cannot render light, offering System/Light across the logged-in product is misleading.

- **R2B removes or hides the visible logged-in Theme control.** It is **not** replaced with a disabled Dark-only selector — a control that offers no real choice is itself misleading.
- Existing internal theme infrastructure (the `data-theme` bootstrap, tokens, provider) **may remain dormant** where harmless; it simply is not surfaced logged-in.
- The **public R3 landing may independently** use mixed light and dark editorial sections; that is a separate scope and does not imply application-theme support.
- **Full logged-in light support is deferred** and requires future Workspace light parity plus cross-route QA (out of R2 scope; Workspace frozen).

**Unverified:** exact light-mode rendering of every route rendered through `AppShell` was not visually validated in this audit (spot-checks showed token-based CSS that should adapt); a visual pass would be required before any future light claim.

---

## Locked product decisions for R2

These decisions are authoritative for R2 and appear identically in the companion capability inventory (§18 there).

1. **Dark-only logged-in theme.** System/Light not supported logged-in; R2B removes/hides the Theme control (not a disabled selector); dormant theme infra may remain; public R3 landing may mix light/dark independently; full light needs future Workspace parity + cross-route QA.
2. **Area-based global rail.** Rail = product areas (Review, Operations, Governance, Integrations, System), not every route; contextual destinations do not each get a permanent icon.
3. **Route-based contextual navigation.** Review → Workspace, New Review, contextual Case File (when a durable/active case exists); Operations → Review Operations, Team; Governance → Review Policies; Integrations → GitHub, Slack handoff; System → System.
4. **Contextual Case File with durable local deep links.** `/report?reportId=<durable-history-identity>` for durable cases (survives refresh; unknown → unavailable; return-to-Workspace preserves identity); session/demo stay ephemeral and persistence-guarded; never a hosted/shareable URL. Implementation R2E.
5. **No fabricated Team identity in production state.** Truthful empty or user-created local metadata by default; sample people/activity only in an explicitly badged sample workspace; "members"/"roles" are local responsibility metadata, not auth. Implementation R2F.
6. **`/settings` visible label is System.** Read-only System/environment surface; not editable configuration.
7. **GitHub App vs GitHub Action separation.** App = real, env-gated, webhook-backed; Action = blueprint/export/setup, not a live connection.
8. **Slack handoff export-only language.** Label "Slack handoff"; copy/export-only; does not send.
9. **R2C token recalibration toward the final Workspace.** Preserve semantic token names/contracts; recalibrate dark token values (warm-neutral graphite, no broad cool cast, low-chroma panes, blue for interaction, quieter borders, fewer raised cards, flatter lists); reusing current values is insufficient; frozen Workspace tokens and public `.lp` scope untouched; no exact hex in R2A.
10. **Workspace remains full-bleed and frozen.** Keeps `WorkspaceShellState`; not wrapped in `AppShell`; not restyled.

## Shared proposed milestone sequence (with the capability inventory)

| Milestone | Purpose | Route scope | Dependencies | Must-preserve | Main risks | Acceptance threshold | Recommended tool/model |
|-----------|---------|-------------|--------------|---------------|------------|----------------------|------------------------|
| **R2B — Product shell & navigation** | Grouped IA, rail, contextual sidebar, command bar, active-state, focus restoration | All `AppShell` routes (Workspace stays outside) | This R2A contract | Drawer focus trap/restoration; `nav-config` route ownership; Workspace exclusion | Nav regressions; Workspace accidentally wrapped | All `AppShell` routes share one shell; Workspace unchanged; keyboard/focus intact | High-capability model; careful review |
| **R2C — Shared visual/interaction primitives + token recalibration** | Tokens, controls, content patterns, states, provenance/local-only chips; **recalibrate dark token values toward the final Workspace** (names/contracts preserved) | Cross-cutting | R2B | Semantic token names/contracts; frozen Workspace `--wsv2-c-*`; public `.lp` scope | Divergent bespoke controls; merely reusing old token values | One control set; state colours semantic; chips standardised; dark values recalibrated (not reused) | High-capability model |
| **R2D — New Review convergence** | Converge the review builder | `/new` | R2B, R2C | 5 sources; deterministic+model contract; session handoff; history append; workspace association | Breaking the data spine | All sources work; generation contract intact; converged layout | Highest-capability model; heavy QA |
| **R2E — Case File convergence** | Converge the decision document | `/report` | R2B, R2C | Tabs; decision recorder; read-only persistence guard; demo badge | Demo writes leaking to storage; persistence regressions | Durable vs demo persistence correct; decisions record; tabs/tour intact | Highest-capability model; heavy QA |
| **R2F — Team & Operations convergence** | Converge the two dashboards | `/team`, `/review-operations` | R2B, R2C | CRUD + scoping + `workspace-changed`; four load states; boundary copy | Sample-person cue; org-analytics implication | Dashboards converged; states truthful; sample-person resolved | High-capability model |
| **R2G — Governance, System & integrations** | Converge static/prototype surfaces + land language corrections | `/review-policies`, `/settings` (System), `/github-action`, `/slack-handoff` | R2B, R2C | Enforcement/read-only/does-not-send denials; System read-only label; GitHub App vs Action separation; "Slack handoff" export-only; real clipboard copy | Over-claiming enforcement/config/delivery; App/Action confusion | Honest limitations prominent; System read-only; App/Action separated; converged layout | Mid/high-capability model |
| **R2H — Logged-in product QA** | Cross-route continuity, keyboard/focus, states, provenance/theme truthfulness | All logged-in routes | R2B–R2G | Everything in §13 of the inventory | Missed regressions across routes | §27 criteria + §28 checklist pass; subagent verification | High-capability model + verification subagent |

**Note:** Implementation prompts are intentionally not written here (per scope). This sequence and these acceptance thresholds are the shared contract between the capability inventory and this visual/interaction contract.
