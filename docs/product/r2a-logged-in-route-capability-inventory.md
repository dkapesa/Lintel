# R2A — Logged-in Route Capability Inventory

**Status:** Planning artifact (read-only audit). No application code changed.
**Branch:** `r2a-logged-in-convergence-contract`
**Scope:** Every authenticated / logged-in route, its shared systems, and its real capabilities as they exist in the repository today.
**Companion:** `docs/design/r2a-whole-product-visual-interaction-contract.md`

> This document classifies what each logged-in route *genuinely does today* based on source evidence (readers, writers, storage keys, API boundaries), not on labels, buttons or visual appearance. Where evidence is incomplete the claim is marked **unverified** with the missing file cited. No route or capability is left unclassified.

---

## 1. Executive summary

Lintel's logged-in product is a **local-first, single-device** engineering-verification tool with one genuinely authoritative workstation (the Workspace), one authoritative review-creation flow (New Review), one authoritative human-decision document (Case File), two production-functional local-only operational surfaces (Review Operations, Team), and a set of honest, static or export-only prototypes (Review Policies, Analysis Settings, GitHub Action blueprint, Slack handoff). A small number of internal and rollback routes exist outside navigation.

The spine of the product is a single durable browser store, `lintel.reportHistory.v1`, written by New Review and read by the Workspace, Review Operations and Team. Everything else (condition progress, decision history, the human-decision ledger, review state, team workspaces) is layered local storage keyed off that history. There is **no authentication, no server-side account, and no shared/organisation state** anywhere in the logged-in product. Report *generation* is the only meaningful server capability: `/api/generate-report` runs a deterministic baseline and optionally enriches it with an OpenAI model call when environment variables are configured, always falling back to the deterministic result. GitHub connectivity (token workspace and GitHub App webhooks) is real but entirely environment-gated and off by default.

The most important convergence facts for R2:

- **The Workspace is the reference-quality system and is frozen.** It is full-bleed and uses its own `WorkspaceShellState`, not the shared `AppShell`. It must not be restyled or wrapped in the broad product shell.
- **All routes rendered through `AppShell` already share one shell** (`/new`, `/report`, `/review-operations`, `/team`, `/review-policies`, `/settings`, `/github-action`, `/slack-handoff`, plus the rollback `/workspace-legacy`). Convergence is largely a matter of unifying the *content surfaces inside* that shell, not building new navigation from scratch.
- **The default Case File view is a demo fixture.** `/report` renders `demoReport` unless a real report was just generated in `/new` (handed off through `sessionStorage`). This is badged "Demo report" but is a fixture-backed default. `/report` is therefore reclassified as **production-secondary with mixed provenance modes** (durable / session / demo), not broadly authoritative.
- **The logged-in product is dark-only for R2 (locked).** The token layer and the public landing support light, but the flagship Workspace ships a private, dark-only palette with no light override. System and Light are **not** supported logged-in themes during R2; R2B should remove or hide the logged-in Theme control (not replace it with a disabled Dark-only selector).
- **A few surfaces risk over-claiming**: Team roles/members read like access control (they are local responsibility metadata), and the Team "sample" workspace shows a fabricated person and activity. All are correctable with precise language and small scoping decisions in R2 — none require new backend work. See **§18 Locked product decisions for R2**.

---

## 2. Capability-status taxonomy

The classification vocabulary used throughout this document:

- **production-authoritative** — Real capability, real reads/writes, the system of record for its data. Trustworthy to ship and to build convergence on. (Workspace, New Review, Case File document engine.)
- **production-functional, local-only** — Real, working feature with real persistence, but scoped to one browser/device with no server, sync or authentication. Honest about that boundary. (Review Operations, Team.)
- **production-secondary** — Real and shippable but a supporting/secondary surface rather than a primary workflow. (Case File *default* demo view; connected-GitHub browse inside New Review.)
- **functional prototype** — Interactive and does something real locally (e.g. clipboard copy, local selection) but its *content* is fixture and its headline capability (delivery, integration) is not implemented. (Slack handoff.)
- **fixture/demo-only** — Renders fixed sample data with no read of user data and no write. (Case File when `?demo=1`; sample-review source content.)
- **conceptual** — Documents an intended future capability; performs no real action. (GitHub Action blueprint; several Analysis Settings and Review Policies records.)
- **internal/QA** — Unlinked, `noindex`, developer-facing surfaces. (`/workspace-v2`, `/visual-lab/workspace-v2`, `/lvos/typography-proof`.)
- **rollback/deprecated** — Retained temporarily as a fallback for a superseded implementation. (`/workspace-legacy`.)
- **deferred** — Named but intentionally not built in this milestone (authentication, sync, enforcement, provider config, delivery).

---

## 3. Complete route inventory

| # | Route | Shell | In nav? | Primary classification |
|---|-------|-------|---------|------------------------|
| 1 | `/workspace` | Full-bleed `WorkspaceShellState` | Yes (Workspace) | production-authoritative |
| 2 | `/new` | `AppShell` | Yes (contextual) | production-authoritative |
| 3 | `/report` | `AppShell` | Contextual (Review) | production-secondary with mixed provenance modes |
| 4 | `/review-operations` | `AppShell` | Yes (Operations) | production-functional, local-only |
| 5 | `/team` | `AppShell` | Yes (Team) | production-functional, local-only |
| 6 | `/review-policies` | `AppShell` | Yes (Policies) | functional prototype / conceptual |
| 7 | `/settings` | `AppShell` | Yes (Settings) | conceptual (read-only prototype) |
| 8 | `/github-action` | `AppShell` | Yes (contextual) | conceptual (blueprint) |
| 9 | `/slack-handoff` | `AppShell` | Yes (contextual) | functional prototype |
| 10 | `/workspace-v2` | Full-bleed `WorkspaceShellState` | No (`noindex`) | internal/QA |
| 11 | `/workspace-legacy` | `AppShell` | No | rollback/deprecated |
| 12 | `/visual-lab/workspace-v2` | None | No (`noindex`) | internal/QA |
| 13 | `/lvos/typography-proof` | None | No (`noindex`) | internal/QA |
| 14 | `/` (root) | Landing (`LandingNav`) | Public | public (out of R2 scope; R3A) |

Backend/API routes (not user-navigable; establish whether a feature has a real capability):

| API route | Real? | Gate | Used by |
|-----------|-------|------|---------|
| `/api/generate-report` | Yes | Deterministic always; OpenAI when `OPENAI_API_KEY`+`OPENAI_MODEL` set | New Review |
| `/api/fetch-pr-diff` | Yes | Public PRs; token for private | New Review (Public PR URL) |
| `/api/github-workspace` | Yes | `GITHUB_TOKEN` env | New Review (Connected GitHub) |
| `/api/github-app` | Yes | GitHub App env | New Review (App installations/PRs) |
| `/api/github-app/webhook` | Yes | GitHub App env | GitHub App webhook analyses |

---

## 4. Route-family classification

- **Verification workstation (frozen):** `/workspace` — and its internal siblings `/workspace-v2` (QA) and `/workspace-legacy` (rollback).
- **Review creation:** `/new`.
- **Human-decision document:** `/report` (Case File).
- **Operational dashboards (local-only):** `/review-operations`, `/team`.
- **Governance / configuration (static prototypes):** `/review-policies`, `/settings`.
- **Integrations (setup/blueprint/export):** `/github-action`, `/slack-handoff` (and the *real* GitHub App/token capabilities surfaced inside `/new`).
- **Internal / QA:** `/visual-lab/workspace-v2`, `/lvos/typography-proof`.
- **Public:** `/` (landing — R3A milestone, not converged here).

---

## 5. Route-by-route capability records

Each record states: URL · intended user · primary job · status · data source · read behaviour · write behaviour · persistence · loading/empty/unavailable/malformed states · sample behaviour · keyboard/responsive posture · entry/exit · must-preserve capability · gaps/misleading cues · R2 priority.

### 5.1 `/workspace` — Risk Inbox / verification workstation

- **Intended user:** The accountable engineer doing merge-readiness verification.
- **Primary job:** Triage the real queue of stored reports, inspect the Change → Observation → Evidence → Requirement spine, and record the human decision.
- **Status:** **production-authoritative.**
- **Data source:** Real stored report history in `localStorage` (`lintel.reportHistory.v1`) projected read-only through `lib/workspace-v2/real-adapter.ts` (wrapped by `read-only-storage.ts`). `?source=fixture` loads the deterministic sample snapshot via `fixture-adapter.ts`. `?reportId=<stable-id>` selects a specific case; unknown id → unavailable (never silently substitutes another case or fixture).
- **Read behaviour:** `/workspace` resolves `defaultSource = "real"` (`renderWorkspaceRoute` in `WorkspaceRouteEntry.tsx`). Real reads happen browser-side via `RealWorkspaceBootstrap`. Any unsupported `?source` value resolves to real, never silently to fixture.
- **Write behaviour:** The adapter is strictly read-only. The *writable* decision/persistence services are built separately in `RealWorkspaceBootstrap` for the real path (human decision ledger, decision history). Queue selection/collapse state is UI state (see storage map, `lintel.workspaceSelectedGroup.v1`).
- **Persistence:** Reads `lintel.reportHistory.v1`, `lintel.reviewState.v1`; decision writes go to `lintel.humanDecisionLedger.v1` / `lintel.decisionHistory.v1` through the bootstrap's writable services. `readReportHistory` prunes/rewrites malformed entries on read — the read-only guard neutralises that write on the Workspace projection path.
- **States:** Truthful loading → ready / empty / unavailable are first-class (see `WorkspaceV2Client` / `WorkspaceShellState`). Empty = no stored reports; unavailable = storage inaccessible or unknown `reportId`.
- **Sample behaviour:** Only via explicit `?source=fixture` (and canonical `/workspace-v2` default). Never silent.
- **Keyboard/responsive:** Full-bleed multi-pane workstation (queue · spine · canvas · inspector · decision context) with its own responsive rules; `data-tour="risk-inbox"`/`"selected-pr"` targets present for the guided tour.
- **Entry:** Global rail "Workspace"; New Review after generating; Team/Operations "Open Workspace" links; guided tour step 1. **Exit:** "Check a pull request" → `/new`; decision links to Case File.
- **Must-preserve:** The full-bleed layout, the read-only real projection, the strict source resolution, the recorded-decision path, and the loading/empty/unavailable truthfulness. **This route is frozen.**
- **Gaps/misleading cues:** None material. The Theme control (in the shared shell language) is not honoured here because the Workspace uses a private dark-only palette — see §17 and the theme decision.
- **R2 priority:** Preserve unchanged (reference system). Highest protection, lowest change.

### 5.2 `/new` — New Review (Check merge readiness)

- **Intended user:** Engineer bringing one change into review.
- **Primary job:** Choose a change source, verify the change brief, run a readiness review, and generate a Case File.
- **Status:** The **route** is production-authoritative for *local review creation*. This authority belongs to the route's creation/persistence role, **not** uniformly to every source mode — fixture/sample and unavailable-integration modes must not inherit authoritative status from the route.
- **Source-mode classification (each mode rated on its own evidence):**
  - **Manual diff** — production-authoritative local input (real user-supplied diff → deterministic report).
  - **Public PR URL** — production-authoritative, network-dependent (`/api/fetch-pr-diff`; real public PRs).
  - **Connected GitHub** — production-secondary, **env-gated** (`GITHUB_TOKEN`); off by default, "Not configured" until set.
  - **Sample review** — fixture/demo-only (`PR_SAMPLES`); explicit, never authoritative.
- **Data source & sources:** Change sources (`SOURCE_LABELS`): **Connected GitHub** (`/api/github-workspace?action=status|repositories|pulls`, requires `GITHUB_TOKEN`), **GitHub App** (`/api/github-app?view=status|installations|repositories|pull-requests|deliveries`, requires App env), **Public PR URL** (`/api/fetch-pr-diff`), **Manual diff** (paste), **Sample review** (`PR_SAMPLES` fixtures).
- **Read behaviour:** Reads local report history (`readReportHistory`) for the local-history panel. Fetches GitHub status/repos/PRs only when the user acts; all `cache: "no-store"`.
- **Write behaviour:** On generate → POST `/api/generate-report`; result written to `sessionStorage` (`lintel.generatedReport.v1`) for handoff to `/report`, appended to durable `lintel.reportHistory.v1` (`addReportToHistory`), and associated to the active workspace (`associateReportWithWorkspace`). Also supports delete/clear of local history.
- **Persistence:** `sessionStorage` handoff + `localStorage` durable history + team-workspace association.
- **Report generation reality:** `/api/generate-report` builds a deterministic baseline (`lib/report-generator.ts`) first; if `OPENAI_API_KEY`+`OPENAI_MODEL` are set it attempts model-assisted synthesis (`https://api.openai.com/v1/responses`, 20s timeout) and falls back to deterministic on any failure/timeout. Matches the Analysis Settings claims.
- **States:** "Not configured" states for token and App are shown honestly; import errors ("No repositories are available to this GitHub token…", "…has no open pull requests…") name the remaining working sources. Malformed input guarded server-side (size caps `MAX_DIFF_CHARACTERS`, `MAX_REQUEST_BYTES`).
- **Sample behaviour:** "Sample review" source is explicit and labelled; not a silent fallback.
- **Keyboard/responsive:** `AppShell`; multi-column builder (source list · change material · review setup). Source buttons keyboard-selectable.
- **Entry:** Workspace primary action; contextual nav; Team/Operations/Settings CTAs. **Exit:** Generate → `/report`.
- **Must-preserve:** The five change sources, the deterministic-first generation contract with model fallback, the `sessionStorage`→`/report` handoff, durable-history append, workspace association, and the honest "Not configured" states.
- **Gaps/misleading cues:** "Connected GitHub" / "GitHub App" panels imply a connection capability that only works with server env configured; today they correctly render "Not configured," but R2 language should keep the *local-first / env-gated* boundary explicit.
- **R2 priority:** High. This is the entry point of the whole data spine and the most complex `AppShell` route to converge.

### 5.3 `/report` — Case File (human decision document)

- **Intended user:** The engineer making and recording the merge decision.
- **Primary job:** Read the structured case (what changed, what Lintel observed, uncertain/missing, merge contract) and record a bounded human decision.
- **Status:** **production-secondary with mixed provenance modes.** The document engine is real, but the route operates in three distinct provenance modes that must be classified separately:
  - **Durable history-backed Case File** — *authoritative local read/write.* The report exists in `lintel.reportHistory.v1`; condition/ledger/history/review-state writes persist.
  - **Session-generated Case File** — *functional session state with guarded persistence.* Hydrated from the `sessionStorage` handoff; decisions are recorded in-session but persistence is guarded until/unless the report is durable.
  - **Demo Case File** — *fixture/demo-only, read-only.* `demoReport` default and `?demo=1`; writes route through the read-only no-op guard.
- **Data source:** Default `demoReport` (`lib/mock-report.ts`, `source: "demo"`, historical schema/run). If `sessionStorage` holds `lintel.generatedReport.v1` (just generated in `/new`), it hydrates that real report instead. `?demo=1` forces the demo and skips the session read.
- **Read behaviour:** On mount reads the session handoff, then reads local condition progress, human-decision ledger, decision history, review state, assumption/clause overrides for the active report; matches durable history entries via a read-only storage view (`readOnlyStorage`) to decide whether the report is durable.
- **Write behaviour:** Records condition-progress toggles (`writeConditionProgress`), human-decision ledger entries (`appendHumanDecisionLedgerEntryToStorage`), decision-history events (`appendDecisionHistoryEvent`), review state (`writeReviewState`), and assumption/clause overrides — **but** for demo/session-only reports not in durable history, writes route through the read-only no-op guard (persistence is silently skipped). Durable persistence occurs only for reports present in `lintel.reportHistory.v1`.
- **Persistence:** `lintel.conditionProgress.v1`, `lintel.humanDecisionLedger.v1`, `lintel.decisionHistory.v1`, `lintel.reviewState.v1` — durable only for history-backed reports.
- **States:** Loading via demo default; session-hydrated when present; graceful fallback to demo on parse errors; session key removed after read.
- **Sample behaviour:** The demo report is the intentional default and is badged "Demo report" with a historical schema label; `?demo=1` is an explicit fixture path.
- **Keyboard/responsive:** `AppShell`; case-outline nav + document + right-hand recommendation/decision context; tabbed sections driven by `lintel:tour-tab` events (`findings`/`tests`/`evidence`/`actions`/`export`).
- **Entry:** New Review generation; Reports rail; Operations "Open current Case File"; guided tour steps 3–7. **Exit:** New Review; Risk Inbox; export/copy actions.
- **Must-preserve:** The five-part case structure, the recommendation/decision context panel, the bounded human-decision recorder, condition/ledger/history persistence for durable reports, the demo default badge, and the read-only guard that prevents demo writes from polluting storage.
- **Gaps/misleading cues:** The default view is a fixture with sample risk score/band; clearly badged but a first-time user with no generated report sees demo numbers. The distinction between "durable, decisions persist" and "demo/session, decisions don't persist" is real but subtle — R2 should surface it explicitly.
- **Locked decision — contextual deep link (R2E):** Case File is contextual, not a permanent global destination. Durable history-backed Case Files should receive a **stable local deep link** using the existing durable report identity, recommended form `/report?reportId=<durable-history-identity>`. The identity must survive refresh; an unknown identity must render **unavailable** (never silently select another report); return-to-Workspace must preserve the same report identity. Session and demo reports remain explicitly ephemeral/demo and persistence-guarded. **A local deep link is not a hosted or shareable server URL and must never be described as one.** Implementation lands in **R2E**, preserving current persistence guards and storage contracts (no schema/key changes).
- **R2 priority:** High. Second-largest converge surface; must not regress the persistence-guard behaviour.

### 5.4 `/review-operations` — Review Operations

- **Intended user:** Engineer/lead reviewing recurring requirements and recorded decisions across local reports.
- **Primary job:** Repository verification activity, recurring requirements, and decision/readiness history from locally stored reports.
- **Status:** **production-functional, local-only.**
- **Data source:** `readReportHistory(localStorage)` plus per-report condition progress, decision history, and human-decision ledger projections.
- **Read behaviour:** On mount builds `OperationalRecord[]`; derives blocker records (grouped by normalised requirement text), repository records, and a merged decision/readiness chronology.
- **Write behaviour:** None. Pure read/projection surface.
- **Persistence:** Reads only.
- **States:** First-class `loading | local | empty | unavailable` (`LoadState`) with distinct boundary copy for each; empty state offers "Start a review"/"Open Workspace". Missing timestamps/repository identity/decisions render as explicitly unavailable rather than inferred.
- **Sample behaviour:** No fixture injection on the used code path; boundary text repeatedly states "not hosted organisation analytics." (A `loading` branch in the unused `boundaryText` variable mentions "demo evidence"; the rendered `operationalBoundaryText` does not.)
- **Keyboard/responsive:** `AppShell`; tablist (`role="tab"`) for records/requirements/decisions; responsive admin tables with `data-label` cells.
- **Entry:** Operations rail; Team; Workspace; Case File links. **Exit:** "Open current Case File" (current review only); "Start a review".
- **Must-preserve:** The three views, the four load states, the "not organisation analytics" boundary, and the honest "no stable per-report URL for archived reports" limitation.
- **Gaps/misleading cues:** A dashboard of tables can read as org-wide telemetry; the page mitigates this well with boundary copy that R2 must keep.
- **R2 priority:** Medium-high. Prime example of the operational-dashboard layout family.

### 5.5 `/team` — Team Workspace

- **Intended user:** Engineer organising local review responsibility.
- **Primary job:** Name/create local workspaces, record members and responsibility roles, view repository evidence and recent local activity.
- **Status:** **production-functional, local-only.**
- **Data source:** `lib/team-workspace.ts` over `localStorage` (`lintel.teamWorkspaces.v1`, `lintel.activeTeamWorkspace.v1`), scoped against `lintel.reportHistory.v1` and review state.
- **Read behaviour:** Loads store + scoped history + scoped review states; derives attention/ownership counts and activity.
- **Write behaviour:** Real CRUD — create/rename/archive workspace, add/update/deactivate members, all persisted locally. Dispatches `lintel:workspace-changed` so the shell switcher stays in sync.
- **Persistence:** `lintel.teamWorkspaces.v1` / `lintel.activeTeamWorkspace.v1`.
- **States:** Loading note; per-section empty states ("No repositories observed yet…", "No reviews in this workspace yet.", "No activity yet…"); `error` alert on storage failure.
- **Sample behaviour:** For the `SAMPLE_WORKSPACE_ID` workspace with no derived activity, `sampleActivity()` injects two fabricated events attributed to "Maya Chen"/"Lintel" on `acme/*` repos. This is fixture content presented as activity — see §10 and §17.
- **Keyboard/responsive:** `AppShell`; section nav; forms and admin tables with responsive `data-label`s; destructive archive isolated.
- **Entry:** Team rail; account avatar; shell workspace switcher "Team workspace" link. **Exit:** Risk Inbox; New Review; Operations.
- **Must-preserve:** Local workspace CRUD, member/role responsibility metadata, workspace scoping of history/state, the `workspace-changed` sync event, and the explicit "not authenticated access control / no invitations / no live collaboration" language. "Members" and "roles" remain **local responsibility metadata**, not accounts, authentication or access control.
- **Gaps/misleading cues:** Roles (`admin/maintainer/reviewer/observer`), members and "assigned reviews" read like access control and real people; the page says otherwise, but the sample-workspace fabricated person is the clearest truthfulness risk on this route.
- **Locked decision — no fabricated identity in production state (R2F):** Production/local Team must **not** inject a fabricated person or fabricated activity as ordinary state. The default production state should be truthful **empty** or **user-created** local responsibility metadata. Sample people/activity may exist **only** inside an explicitly badged fixture/sample workspace, with sample provenance visible throughout that mode. **Removal or explicit isolation of the `sampleActivity()` "Maya Chen" injection is an R2F requirement.**
- **R2 priority:** Medium-high. Second operational-dashboard exemplar; the sample-person isolation is a locked R2F requirement (above).

### 5.6 `/review-policies` — Review Policies

- **Intended user:** Engineer understanding readiness gate expectations.
- **Primary job:** Show policy profiles and their gate levels (Required/Recommended/Optional).
- **Status:** **functional prototype / conceptual.**
- **Data source:** `REVIEW_POLICY_PROFILES` constant (`lib/review-policies.ts`). No user data.
- **Read/write:** Renders the constant; no writes; `<details>` disclosures are the only interactivity.
- **Persistence:** None.
- **States:** Static; no loading/empty/unavailable (nothing async).
- **Sample behaviour:** Entire content is fixed profiles labelled "Local prototype · not an enterprise policy engine" and each row marked "Local-only".
- **Keyboard/responsive:** `AppShell`; native `<details>` disclosures; responsive columns.
- **Entry:** Policies rail; Settings link. **Exit:** Settings; Operations; Security model doc.
- **Must-preserve:** The explicit "Policy enforcement: Unavailable / does not block merges / does not sync / does not save org settings" limitations.
- **Gaps/misleading cues:** "Policy profiles" and gate levels can imply enforcement; the page is careful to deny this. Keep that denial prominent in R2.
- **R2 priority:** Low-medium. Small governance surface; mostly a visual-system reconciliation.

### 5.7 `/settings` — System (visible label)

- **Locked decision — naming:** The visible product label is **System**. The route path stays `/settings`. Until editable settings genuinely exist, this is a **read-only System/environment surface**, not editable configuration.
- **Intended user:** Engineer evaluating how Lintel runs analysis and what the local environment permits.
- **Primary job:** Describe the read-only System/environment surface: runtime mode, provider availability, storage boundaries, integration status, local-only behaviour, and genuine version/build information when available.
- **Status:** **conceptual (read-only System surface).**
- **Data source:** Hardcoded arrays (`analysisModes`, `providerPaths`, `dataHandling`, `limitations`). No user data.
- **Read/write:** No reads of user state; **no writes, no configuration, no key storage.**
- **Persistence:** None.
- **States:** Static.
- **Sample behaviour:** All records are descriptive; statuses ("Available now", "Prototype", "Planned", "Concept") are honest.
- **Keyboard/responsive:** `AppShell`; record lists; responsive.
- **Entry:** Settings rail; cross-links from Policies/Integrations. **Exit:** Review Policies, GitHub Action, Slack handoff, Security model, CLI blueprint.
- **Must-preserve:** "Read-only prototype · no provider keys stored", "Provider configuration: Read-only", "Enterprise controls: Unavailable (no SOC 2/SSO/RBAC/audit log claims)", "Repository delivery: Unavailable".
- **Gaps/misleading cues:** Currently named "Settings" but nothing is settable. Locked resolution: present the surface as **System** (read-only), covering runtime/provider/storage/integration/version facts. R2 must **not** describe read-only information as editable configuration.
- **R2 priority:** Low-medium. Read-only System-surface layout exemplar (§16 configuration/governance model, adapted to read-only).

### 5.8 `/github-action` — GitHub Action blueprint

- **Intended user:** Engineer evaluating CI integration direction.
- **Primary job:** Document the intended CLI-first GitHub Action workflow and decision-comment contract.
- **Status:** **conceptual (blueprint).**
- **Data source:** Hardcoded workflow steps, illustrative YAML, sample comment sections. No user data, no GitHub calls.
- **Read/write:** None. Static document with in-page anchors.
- **Persistence:** None.
- **States:** Static; a "Current status" strip states Implementation: Prototype, Posting: Does not post, Enforcement: Non-blocking, Execution: Planned.
- **Sample behaviour:** The comment preview ("TESTS_REQUIRED / HIGH 78/100", conditions, missing tests) is fixed sample content, labelled "Prototype preview. This page does not post to GitHub."
- **Keyboard/responsive:** `AppShell`; section anchors; selectable YAML.
- **Entry:** Operations contextual nav; Settings link. **Exit:** Settings, Slack handoff, Security model, CLI blueprint doc.
- **Must-preserve:** "Prototype only · no GitHub posting · no `pull_request_target`" and the non-blocking-by-default framing.
- **Locked decision — GitHub App vs GitHub Action separation:** The visible GitHub integration surface must clearly separate two things:
  - **GitHub App** — the *real*, env-gated connection/configuration with webhook-backed capabilities and a truthful connected / not-configured status (`/api/github-app*`, `lib/github-app-*`; surfaced inside `/new`).
  - **GitHub Action** — a *workflow blueprint / export / setup* surface; not automatically installed and not itself a live connection.
  R2 must not allow the static Action blueprint to look like the real App integration.
- **R2 priority:** Low-medium. Integration setup/status layout exemplar; must render the App-vs-Action distinction unmistakably.

### 5.9 `/slack-handoff` — Slack handoff export

- **Intended user:** Engineer sharing a decision into a channel.
- **Primary job:** Produce concise, copy-ready handoff text in three formats.
- **Status:** **functional prototype** (real clipboard copy; fixture content; no Slack integration).
- **Data source:** `handoffVariants` fixtures (short alert / reviewer handoff / daily digest). No user data.
- **Read/write:** Local `useState` selection; real clipboard copy via `navigator.clipboard.writeText` with an `execCommand` fallback. No network.
- **Persistence:** None (session state only).
- **States:** Copy state `idle | copied | failed` with 2s reset; no async load states.
- **Sample behaviour:** All handoff text is fixed sample content on `acme/*` repos, each ending "Prototype/export-only… not a live Slack integration."
- **Keyboard/responsive:** `AppShell`; radio-selectable formats; `aria-live` copy status.
- **Entry:** Operations contextual nav; Settings/GitHub Action links. **Exit:** GitHub Action, Settings, Security model.
- **Must-preserve:** The three formats, real local copy, raw-diff-free content, and "no Slack API / no OAuth / does not send" boundaries.
- **Gaps/misleading cues:** Format selection and a "Copy handoff" button can imply delivery; the page repeatedly denies it. Keep that denial in R2.
- **Locked decision — destination label:** The visible destination label is **"Slack handoff"**, not merely "Slack", because the current capability is export/copy-oriented and does not send messages.
- **R2 priority:** Low-medium. Integration/export layout exemplar; the one prototype with genuine local behaviour to preserve.

### 5.10 `/workspace-v2` — Workspace (QA/compatibility)

- **Status:** **internal/QA.** Renders the *same* production Workspace via `renderWorkspaceRoute(params, "fixture")` — fixture default, `?source=real` still works for compatibility checks. `robots: noindex/nofollow`; not in nav. Must-preserve: it is not a second Workspace tree; it shares one implementation. R2 priority: keep out of primary navigation; do not converge as a user route.

### 5.11 `/workspace-legacy` — Workspace (rollback)

- **Status:** **rollback/deprecated.** The previous `/workspace` implementation, retained as a temporary non-primary fallback. Uses `AppShell`, reads/writes real report history, review state, condition progress, decision history. Not in nav. Must-preserve *only* as a rollback path until the production Workspace cut-over is considered irreversible; then schedule removal. R2 priority: do not converge/restyle; flag for eventual deletion (see open questions).

### 5.12 `/visual-lab/workspace-v2` — Workspace V2 visual lab

- **Status:** **internal/QA.** `noindex`, no `AppShell`, not in nav; renders a route-local `WorkspaceV2Client` over `decision-*` fixtures. Contained entirely under `app/visual-lab/`. Must-preserve: none as product; keep unlinked. R2 priority: none (internal).

### 5.13 `/lvos/typography-proof` — LVOS typography proof

- **Status:** **internal/QA.** `noindex`, no `AppShell`, not in nav; a typography specimen using `mock-report`. Must-preserve: none as product; a design reference. R2 priority: none (internal); may inform the visual contract's typography roles.

### 5.14 `/` (root) — Landing

- **Status:** **public** (not logged-in). Uses `LandingNav`/`LandingMotion`, illustrates with `mock-report`. Distinguished here only to draw the public/logged-in boundary. **Out of R2 scope; belongs to the R3A landing milestone.** No landing audit is performed in this document.

---

## 6. Capability-domain inventory

- **Review creation:** `/new` (authoritative) + `/api/generate-report` (deterministic + optional model) + `/api/fetch-pr-diff` + `/api/github-workspace` + `/api/github-app*`. Produces the durable report that seeds every other surface.
- **Verification:** `/workspace` (authoritative, read-only projection + writable decision path) and `/report` (authoritative document engine; demo default). Internal siblings `/workspace-v2`, `/workspace-legacy`.
- **Workflow / operations:** `/review-operations` (blockers, repository activity, decision history) and the review-state/condition-progress/decision-history/human-decision-ledger libraries that power it. Local-only.
- **Integrations:** Real — GitHub token workspace and GitHub App (env-gated, surfaced in `/new`). Conceptual/export — `/github-action` (blueprint), `/slack-handoff` (copy-only).
- **Organisation / governance:** `/team` (local workspaces/members/roles, no auth), `/review-policies` (static gate profiles, no enforcement), `/settings` (read-only analysis descriptions, no config).

---

## 7. Data and persistence ownership matrix

| Data | Owner (writer) | Readers | Store | Scope |
|------|----------------|---------|-------|-------|
| Report history | `/new` (`addReportToHistory`) | Workspace, Review Operations, Team, Case File (match) | `lintel.reportHistory.v1` (localStorage) | Device |
| Generated-report handoff | `/new` | `/report` | `lintel.generatedReport.v1` (**sessionStorage**) | Tab/session |
| Condition progress | `/report`, `/workspace-legacy` | `/report`, Operations, Workspace | `lintel.conditionProgress.v1` | Device |
| Decision history | `/report`, `/workspace-legacy`, Workspace bootstrap | Operations, `/report` | `lintel.decisionHistory.v1` | Device |
| Human decision ledger | `/report`, Workspace bootstrap | Operations, Team, Workspace | `lintel.humanDecisionLedger.v1` | Device |
| Review state / ownership | `/report`, `/team`, `/workspace-legacy` | Operations, Team, Workspace | `lintel.reviewState.v1` (+ legacy `lintel.workspaceStatus.v1`) | Device |
| Review action status | review-actions lib | `/report` (actions) | `lintel.reviewActionStatus.v1` | Device |
| Team workspaces | `/team`, shell switcher | `/team`, shell, `/new` association | `lintel.teamWorkspaces.v1`, `lintel.activeTeamWorkspace.v1` | Device |
| Theme preference | `ThemeControl` | Root layout bootstrap | `lintel.themePreference.v1` | Device |
| Guided tour seen | `GuidedTour` | Tour start button | `lintel.guided-tour.v1` | Device |
| Workspace queue selection | Workspace queue | Workspace | `lintel.workspaceSelectedGroup.v1` | Device (**unverified exact semantics** — key observed in `app/`; confirm session vs durable in `WorkspaceQueue.tsx`) |

Cross-cutting events (not storage): `lintel:workspace-changed`, `lintel:shell-navigation-open`, `lintel:tour-tab`.

---

## 8. Storage-key and schema map

- `lintel.reportHistory.v1` — durable array of report entries (report + source + canonical run + change passport + merge contract + verification pack + contract recheck). Read helper `readReportHistory` prunes/rewrites malformed/overflow entries on read. **The product spine.**
- `lintel.generatedReport.v1` — **sessionStorage** JSON handoff of the last generated report from `/new` to `/report`; removed after read.
- `lintel.conditionProgress.v1` — cleared-condition keys per report.
- `lintel.decisionHistory.v1` — ordered readiness/decision events per report key.
- `lintel.humanDecisionLedger.v1` — human decision ledger entries (outcomes, reaffirmation, accepted risk) per report key; self-normalising on read.
- `lintel.reviewState.v1` (+ legacy `lintel.workspaceStatus.v1`) — review status + owner per report key; workspace-scoped variant via `workspaceScopedReviewKey`.
- `lintel.reviewActionStatus.v1` — per-action progress state.
- `lintel.teamWorkspaces.v1` / `lintel.activeTeamWorkspace.v1` — local workspace store + active selection.
- `lintel.themePreference.v1` — `system|dark|light`.
- `lintel.guided-tour.v1` — `completed|skipped` marker.
- `lintel.workspaceSelectedGroup.v1` — Workspace queue group selection (**unverified** durability).

All keys are `v1`-suffixed and namespaced `lintel.*`. **No schema/key changes are proposed by R2A.**

---

## 9. Route-to-route dependency map

- `/new` **writes** `lintel.reportHistory.v1` and `sessionStorage` handoff → **enables** `/report` (session), `/workspace` (history), `/review-operations` (history), `/team` (history scope).
- `/report` **writes** condition/decision/ledger/review-state → **feeds** `/review-operations` and `/workspace` decision context.
- `/workspace` **reads** history (read-only) and **writes** decisions through its bootstrap → **feeds** `/review-operations`, `/team`.
- `/team` **writes** workspace store; shell switcher and `/new` association depend on `lintel:workspace-changed`.
- **Guided tour** couples `/workspace` → `/report` → `/review-operations` (targets `risk-inbox`, `selected-pr`, `report-findings/tests`, `merge-contract`, `review-actions`, `report-export`, `review-operations`; all present).
- **Shell** (`AppShell` + `nav-config`) owns global areas and contextual destinations for all routes rendered through `AppShell`; the Workspace stands outside it.

---

## 10. Real / local / GitHub / session / fixture provenance map

- **Real durable (device):** report history and all layered ledgers; team workspaces; theme; tour marker.
- **Real session (tab):** `/new`→`/report` handoff (`sessionStorage`).
- **Real network (env-gated):** GitHub token workspace, GitHub App, PR-diff fetch, model-assisted generation. All off without env config; deterministic generation and public-PR/manual/sample paths work regardless.
- **Fixture (explicit):** Workspace `?source=fixture` / `/workspace-v2` default; `/report` `demoReport` default and `?demo=1`; New Review "Sample review"; visual-lab and typography-proof.
- **Fixture (implicit/at-risk):** Team `sampleActivity()` fabricated "Maya Chen" events for the sample workspace; static sample content in `/github-action` and `/slack-handoff` (labelled).
- **Conceptual (no data):** `/settings`, `/review-policies`, `/github-action` capability claims.

---

## 11. Existing capability conflicts / duplicated concepts

- **Two "GitHub" surfaces:** the real GitHub App/token capability inside `/new` vs the static `/github-action` blueprint. Same word, different reality — a naming/IA risk.
- **Two "Workspace" meanings:** the verification *Workspace* (`/workspace`) vs the *Team* "Local Review Workspace" store. The shell switcher and Team page both use "workspace"; the Workspace route means something else.
- **Three Workspace routes:** `/workspace` (canonical), `/workspace-v2` (QA), `/workspace-legacy` (rollback) — one implementation shared by the first two, a separate legacy tree for the third. Not a conflict if kept unlinked, but a cleanup obligation.
- **Case File entry points:** `/report` has no stable per-report URL; Operations/Team can only open "the current Case File." Multiple links imply addressable reports that do not exist yet.
- **Review "status" vocabulary** spans review-state, human-decision-ledger applicability, and merge-contract clause status; Operations reconciles them but the overlap is a modelling seam to keep consistent visually.

---

## 12. Internal and rollback routes

- **Internal/QA (keep unlinked, `noindex`):** `/workspace-v2`, `/visual-lab/workspace-v2`, `/lvos/typography-proof`.
- **Rollback/deprecated:** `/workspace-legacy` — retain only as a fallback for the Workspace cut-over; not in nav; schedule removal once cut-over is final (open question §16).
- **Requirement:** None of these may appear in the converged navigation or be presented as product surfaces.

---

## 13. Must-remain-unchanged contract

R2 convergence must **not** alter:

1. The Workspace's full-bleed layout, read-only real projection, source resolution, decision path, and loading/empty/unavailable truthfulness (**frozen**).
2. Storage keys, schemas, and the `v1` conventions in §8.
3. The `/new`→`/report` `sessionStorage` handoff and durable-history append + workspace association.
4. The `/report` read-only guard that prevents demo/session reports from writing durable storage.
5. Review Operations' four load states and "not organisation analytics" boundary.
6. Team's local-only CRUD, workspace scoping, and `lintel:workspace-changed` sync.
7. The honest limitation blocks on Policies, Settings, GitHub Action and Slack handoff.
8. The deterministic-baseline-first + model-fallback generation contract.
9. The guided-tour target contract across `/workspace`, `/report`, `/review-operations`.
10. `noindex`/unlinked status of internal and QA routes.

---

## 14. Route-by-route convergence recommendation

- **`/workspace`** — Preserve unchanged. Reference system; do not wrap in `AppShell`; do not restyle.
- **`/new`** — Converge onto the shared shell + primitives: product rail, collapsible source/config sidebar, central builder, verification-plan context, persistent run action. Preserve all sources and the generation contract.
- **`/report`** — Converge as a **contextual** destination: product rail, collapsible case outline, document body, decision/utility context. Preserve tabs, decision recorder, persistence guard, demo badge. Add durable **local deep link** `/report?reportId=<durable-history-identity>` in R2E (never a hosted/shareable URL).
- **`/review-operations`** — Converge onto the operational-dashboard model: compact route header, tabbed operational views, actionable tables. Preserve load states + boundary copy.
- **`/team`** — Same operational-dashboard model. Preserve CRUD + scoping; remove/isolate the fabricated "Maya Chen" sample identity from production state (R2F).
- **`/review-policies`, `/settings` (System)** — Converge onto the configuration/governance model: section navigation, **read-only** description surface, consequence/help context. `/settings` presents as **System** (read-only). Keep enforcement/read-only denials prominent; do not imply editable configuration.
- **`/github-action`, `/slack-handoff`** — Converge onto the integration model: setup/progress navigation, configuration/preview, connection/provenance status. Keep "does not post/send" boundaries; separate the real env-gated **GitHub App** from the static **GitHub Action** blueprint; label the Slack surface **"Slack handoff"** (export-only).
- **`/workspace-v2`, `/workspace-legacy`, `/visual-lab/*`, `/lvos/*`** — Do not converge; keep unlinked; schedule `/workspace-legacy` for removal.

---

## 15. Proposed R2 implementation order

1. **R2B — Product shell & navigation** (nav IA, rail, contextual sidebars, active-state, focus restoration) — the frame everything else sits in; Workspace stays outside it.
2. **R2C — Shared logged-in visual/interaction primitives** (tokens, controls, content patterns, states) — the vocabulary all `AppShell` routes adopt.
3. **R2D — New Review convergence** — highest-value, most complex `AppShell` route; validates the shell against a real workflow.
4. **R2E — Case File convergence** — second document surface; must preserve the persistence guard.
5. **R2F — Team & Review Operations convergence** — the two operational dashboards together.
6. **R2G — Policies, Settings & integrations** — the static/prototype surfaces; language corrections land here.
7. **R2H — Logged-in product QA** — cross-route continuity, keyboard/focus, states, provenance/theme truthfulness.

(Shared milestone detail with the design contract appears at the end of both documents.)

---

## 16. Open questions requiring product decisions

**Resolved by R2A.1 (now locked — see §18):**

- **Case File addressability** → contextual with a durable local deep link `/report?reportId=<durable-history-identity>` (R2E); not a hosted/shareable URL.
- **Team sample workspace** → no fabricated identity in production state; sample people/activity only inside an explicitly badged sample workspace (R2F).
- **"Settings" naming** → visible label **System**; route stays `/settings`; read-only System/environment surface.
- **Theme** → one authoritative **dark** logged-in theme for R2; System/Light not supported logged-in; R2B removes/hides the Theme control.
- **Integration IA** → Integrations is a global **area**; GitHub App (real) and GitHub Action (blueprint) are separated; the Slack destination is labelled "Slack handoff".

**Still open:**

1. **Workspace rollback lifecycle:** When is the Workspace cut-over final enough to delete `/workspace-legacy`? Keeping it indefinitely is dead weight and a second decision-writing path.
2. **Integration destination shape:** Within the Integrations area, how much of the real GitHub App configuration (shown in `/new`) should also surface as its own Integrations destination vs remaining inside New Review?
3. **Deferred capabilities language:** How explicitly should the product name authentication/sync/enforcement/delivery as deferred — in-product vs docs only?

---

## 17. Explicit claims the logged-in product must NOT make yet

Until the corresponding capability exists, no logged-in surface may imply:

- **Authentication or accounts.** There is no auth; "members", "roles", avatars and "Team" must not read as authenticated access control.
- **Team/organisation persistence or sharing.** Team workspaces are single-device local storage; nothing syncs or is shared.
- **Real people, ownership or activity when fixture-backed.** The Team sample workspace's fabricated person/activity must not present as real events.
- **A live GitHub connection by default.** GitHub token/App capabilities are env-gated and off by default; "Connected GitHub" must keep its "Not configured" honesty.
- **Provider availability / model configuration.** Analysis Settings describes concepts and stores nothing; no provider is selectable or saved.
- **Policy enforcement.** Review Policies does not block merges, sync, or save organisation settings.
- **Saved settings.** Settings persists nothing.
- **Production/organisation metrics.** Operations reflects local report history only, not hosted analytics.
- **Slack/GitHub delivery.** Slack handoff copies text; the GitHub Action page posts nothing.
- **Light/system theme support in the Workspace.** The flagship workstation is dark-only; the product must not imply a working light theme there.

---

## 18. Locked product decisions for R2

These decisions are authoritative for R2 and appear identically in the companion visual/interaction contract.

1. **Dark-only logged-in theme.** System and Light are not supported logged-in themes during R2. R2B removes/hides the logged-in Theme control (not a disabled Dark-only selector). Dormant internal theme infrastructure may remain where harmless. The public R3 landing may independently use mixed light/dark editorial sections. Full logged-in light support requires future Workspace parity and cross-route QA.
2. **Area-based global rail.** The global product rail represents product **areas** — Review, Operations, Governance, Integrations, System — not every route. Not every contextual destination receives its own permanent rail icon.
3. **Route-based contextual navigation.** Destinations sit under areas: Review → Workspace, New Review, contextual Case File (when an active/durable case exists); Operations → Review Operations, Team; Governance → Review Policies; Integrations → GitHub, Slack handoff; System → System.
4. **Contextual Case File with durable local deep links.** Case File is contextual, not a permanent global destination. Durable history-backed Case Files get a stable local deep link `/report?reportId=<durable-history-identity>` (survives refresh; unknown → unavailable; return-to-Workspace preserves identity). Session/demo reports stay ephemeral and persistence-guarded. A local deep link is never described as a hosted/shareable server URL. Implementation: R2E.
5. **No fabricated Team identity in production state.** Default production Team state is truthful empty or user-created local metadata; fabricated people/activity ("Maya Chen") exist only in an explicitly badged sample workspace. "Members"/"roles" are local responsibility metadata, not accounts/auth/access control. Implementation: R2F.
6. **`/settings` visible label is System.** Route stays `/settings`; read-only System/environment surface (runtime mode, provider availability, storage boundaries, integration status, local-only behaviour, genuine version/build info). Not described as editable configuration.
7. **GitHub App vs GitHub Action separation.** GitHub App = real, env-gated, webhook-backed, truthful connected/not-configured status. GitHub Action = blueprint/export/setup, not auto-installed, not a live connection. The blueprint must not look like the real App.
8. **Slack handoff export-only language.** Visible label "Slack handoff" (not "Slack"); copy/export-only; does not send.
9. **R2C token recalibration toward the final Workspace.** R2C preserves semantic token names/contracts but recalibrates logged-in dark token *values* toward the final Workspace visual system (warm-neutral graphite; remove the broad cool blue-grey cast; low-chroma pane relationships; blue reserved for interaction; restrained semantic colour; quieter borders; fewer nested raised cards; flatter operational lists). Reusing current token values is insufficient. The frozen Workspace private tokens and the public `.lp` scope are untouched.
10. **Workspace remains full-bleed and frozen.** `/workspace` keeps its own `WorkspaceShellState`; it is not wrapped in `AppShell` and is not restyled.
