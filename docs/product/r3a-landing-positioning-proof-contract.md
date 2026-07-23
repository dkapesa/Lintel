# R3A — Landing Positioning and Product Proof Contract

**Status:** Planning artifact (read-only product, capability and storytelling audit). No landing page, application source, styling, route, API, schema or package changed. No screenshots or image assets generated. Nothing staged, committed or pushed.
**Branch:** `r3a-landing-positioning-proof-contract`
**Governs:** the future R3 landing page rebuild (R3B information architecture and copy → R3C visual system → R3D implementation → R3E screenshot and proof system → R3F conversion and QA).
**Primary sources:** `docs/product/r2a-logged-in-route-capability-inventory.md`, `docs/design/r2a-whole-product-visual-interaction-contract.md`, `README.md`, `docs/case-study.md`, `docs/security-model.md`, `docs/evaluation.md`, `docs/evaluation-results.md`, `docs/public-pilot.md`, and directly inspected implemented routes and helpers.
**Authority rule:** the repository is authoritative for every capability claim. Older marketing and pilot documents (README, case study, security model, public pilot) are treated as intent and history, not as capability truth, wherever they disagree with the code. Screenshots supply visual context only and never upgrade a prototype, fixture or conceptual state into a production claim.

> Aspirational quality calibration only: the landing must feel credible to senior, staff and principal engineers at highly demanding engineering organisations. This is a quality bar, not an adoption claim. Nothing in this contract may imply that any named organisation uses, endorses, pilots or has evaluated Lintel.

---

## 1. Executive summary

Lintel is an engineering verification workspace. It analyses the change in a pull request, connects each finding to inspectable evidence, records what proof is still missing, turns those gaps into explicit merge requirements, and gives the accountable engineer one place to record the final decision. The recommendation is Lintel's; the decision stays human.

The current public landing already tells a strong, differentiated story ("Agents create code. Lintel verifies what is ready." / "CI green does not mean the change is ready."). This contract keeps that thesis and category and tightens it against the repository. The most important corrections it makes are:

1. **The GitHub App is real, not conceptual.** The repository implements an environment-gated GitHub App with HMAC webhook signature verification (`lib/github-app-webhook.ts`), RSA-signed App authentication (`lib/github-app-auth.ts`), and idempotent decision-comment posting that updates a single comment (`lib/github-app-comments.ts`). Several older docs (README, `security-model.md`, `case-study.md`, `public-pilot.md`) still say "no GitHub App"; they are out of date. The landing may claim a real GitHub App **only** with the correct configured / not-configured qualification, and must keep it clearly separate from the static GitHub Action blueprint.

2. **There are no published evaluation numbers.** `docs/evaluation-results.md` is a manual regression framework whose result cells are all `<record>` placeholders; the evaluation date and evaluator are unfilled. The landing must make **no** measured accuracy, precision, recall or outcome claim. Methodology (deterministic baseline first, guardrails, fallback) is claimable; measured performance is not.

3. **The product is single-device and local by default, and this is a trust characteristic, not the category.** Review history is stored on the device by default; there is no authentication, no server account and no shared or organisation state. The landing states this precisely and does not lead with "local-first" as a slogan.

4. **Several surfaces must not overclaim.** Team "members" and "roles" are local responsibility metadata, not access control; Operations reflects local report history, not hosted analytics; Policies and System are read-only and do not enforce or store configuration; the Case File default view is a labelled demo fixture. The landing may show these surfaces only in states that are truthful and clearly badged.

The landing's job is to make a demanding engineer understand the product in one viewport, believe the claims because the proof comes from the real product, and see clearly where Lintel's analysis ends and human accountability begins. Product proof replaces social proof until real, permissioned evidence exists.

---

## 2. Positioning statement

- **Category:** engineering verification — specifically, verifying whether a pull request is ready to merge.
- **Concise position:** "Lintel helps engineers decide whether a pull request is ready to merge."
- **Full one-sentence position:** "Lintel is an engineering verification workspace that helps engineers decide whether a pull request is ready to merge." (Use "engineers", not "teams", in the primary positioning: the current product does not provide hosted collaboration. The audience section may still discuss engineering teams.)
- **Primary value:** it replaces a vague sense that a change "looks fine" with an inspectable record — findings tied to evidence, the proof that is still missing, the requirements that must clear, and a recorded human decision.
- **Core distinction:** Lintel is not a stream of review comments and not a passing pipeline. It produces one structured verification record per change and keeps the final decision with the accountable engineer.
- **Short product description (for cards, meta, previews):** "Lintel analyses a pull request, connects findings to evidence, identifies missing proof, and turns the gaps into explicit merge requirements — then the accountable engineer records the decision."
- **Long product description (for the product section):** "Lintel reviews the change in a pull request and produces a Case File: what changed, what Lintel observed, the evidence behind each finding, the proof that is still missing, and the requirements that must be satisfied before merge. It reaches a recommendation and a risk band, but it does not decide. The accountable engineer records the decision, which can accept explicit risk, and that decision is tied to the exact commit where the head is available. Review history is stored on the device by default. Analysis runs a deterministic baseline and can be enriched by a configured model, with the deterministic result retained as a fallback."

---

## 3. Primary and secondary audiences

### 3.1 Primary audiences

**Senior engineers who are the review bottleneck.**
- *Jobs to be done:* verify more changes than they can comfortably read; decide quickly and defensibly whether a change is ready; leave a record of why.
- *Pains:* plausible-looking changes hiding missing tests, retry and side-effect risk, unstable API contracts, sensitive logging; review load rising faster than review time.
- *Objections:* "another AI reviewer that adds noise"; "I already have CI and comments"; "will this slow me down".
- *Proof required:* a real finding tied to real evidence and a concrete missing-proof requirement; the restraint to stay quiet on a clean change; a recommendation that clearly is not authority.

**Staff and principal engineers.**
- *Jobs to be done:* set and defend the bar for merge readiness; make accountability legible; reason about change risk at a system level.
- *Pains:* readiness lives in people's heads; decisions are not recorded; "green pipeline" is treated as "ready".
- *Objections:* skepticism of model output; concern about overclaiming; concern about hidden data flows.
- *Proof required:* the deterministic baseline and guardrails; the evidence chain; recommendation-versus-decision separation; decisions that can go stale, be reaffirmed, superseded or withdrawn; precise data-handling language.

**Platform and engineering-productivity teams.**
- *Jobs to be done:* introduce a consistent verification step; integrate with GitHub; keep review artifacts durable and inspectable.
- *Pains:* inconsistent review quality; no shared shape for "is this ready"; tool sprawl.
- *Objections:* "is this yet another dashboard"; "does it need us to send code somewhere".
- *Proof required:* the GitHub App workflow (configured/not-configured), the Action blueprint boundary, the durable Case File, and honest architecture limits.

### 3.2 Secondary audiences

Developer-tool leaders and founders evaluating direction; reliability, security and infrastructure focused engineers who care about failure states, contracts and logging; teams reviewing rising volumes of code written by engineers or coding agents. These are served by the same proof, framed for evaluation rather than daily use.

### 3.3 Audiences the landing should NOT optimise for

- Engineering managers wanting productivity dashboards or developer-analytics scorecards. Lintel is not that, and the local Operations surface must not be dressed up as organisation analytics.
- Buyers shopping for a generic AI code-review chatbot or a line-comment bot.
- Enterprise buyers shopping for SSO, RBAC, SOC 2, audit logs or a hosted admin console. None of these exist; the landing must not court that expectation.

---

## 4. Category and anti-category

**Lintel is:** an engineering verification workspace that decides whether a pull request is ready to merge, by connecting findings to evidence, naming missing proof, resolving merge requirements, and recording an accountable human decision.

**Lintel is not:** a generic AI code-review chatbot; a line-comment bot; a CI system; a test runner or static-analysis engine; a merge queue; an enforcement or policy engine; an engineering-management analytics product; a hosted team platform.

- **Relationship to AI code review:** complementary, not competing. Code-review tools focus on comments and suggestions on lines. Lintel focuses on the merge decision and the evidence behind it. It sits alongside review, not in place of it.
- **Relationship to CI:** complementary. A green pipeline shows tests that exist passed; it does not show whether retry behaviour, failure handling and client contracts were proven. Lintel keeps those gaps as explicit records. Lintel does not run CI and does not replace it.
- **Relationship to testing:** Lintel identifies missing test coverage and suggests tests; it does not execute tests. Do not imply test execution.
- **Relationship to merge queues:** none today. Lintel does not gate or block merges. It informs the decision; it does not enforce it.
- **Relationship to review-policy tools:** Lintel shows read-only policy profiles for framing only; it does not enforce, sync or store organisation policy.
- **Competitor comparisons:** keep them category-level and truthful (for example, distinguishing a merge decision from line comments). Do not name competitors on the landing or assert unsupported superiority.

---

## 5. Core narrative

1. **Code creation is accelerating.** Engineers and coding agents produce changes faster than they can be verified.
2. **Verification and evidence are the bottleneck.** The hard part is no longer writing the change; it is proving the change is ready.
3. **A green pipeline does not prove the whole change is ready.** Passing CI can still leave retry behaviour, provider-failure handling and client contracts unverified.
4. **Readiness needs inspectable evidence and an accountable decision.** A finding matters only when its proof travels with it, and a decision matters only when an accountable engineer records it.
5. **Lintel creates a structured verification record.** One Case File per change: what changed, what Lintel observed, the evidence, the missing proof, the requirements, and the human decision — with the recommendation kept distinct from the decision.

This narrative is the spine of the page. Every section either advances it or proves a step of it.

---

## 6. Message hierarchy

- **Hero message:** "Agents create code. Lintel verifies what is ready."
- **Supporting message:** "Inspect the evidence behind a change, identify missing proof, see what must be resolved before merge, and record the final human decision."
- **Messaging pillars (in proof order):**
  1. **Evidence chain.** Findings connect to evidence; missing proof becomes explicit requirements. (Proof: Case File and Workspace spine.)
  2. **Recommendation, not authority.** Lintel recommends; the accountable engineer decides and the decision is recorded. (Proof: Human Decision surfaces.)
  3. **Deterministic baseline, optional model.** A deterministic analysis runs first; a configured model can enrich it; the deterministic result is retained as a fallback. (Proof: analysis architecture, Case File provenance labels.)
  4. **Fits the GitHub workflow.** A real GitHub App when configured, a workflow blueprint for CI, and a copy-ready handoff. (Proof: New Review sources, GitHub App state, Action blueprint.)
  5. **Stored on your device by default.** Review history stays on the device; no account, no hosted sync. (Proof: architecture section.)
- **Proof order:** lead with the evidence chain (the differentiator), then recommendation-versus-decision (the trust anchor), then analysis architecture, then workflow, then storage and architecture.
- **Final CTA message:** "Bring the change you're unsure about." → "Review a pull request."

---

## 7. Claim taxonomy

- **Safe without qualification:** Lintel analyses pull-request changes; connects findings to evidence; identifies missing proof; produces merge requirements; produces a recommendation and a risk band; keeps the final decision with the engineer; produces a durable Case File; supports public PR import, pasted diffs and built-in samples; runs a deterministic baseline; exports Markdown and copyable summaries; keeps the record concise when it finds no material issue.
- **Safe only with explicit qualification:** GitHub App (real *when configured*; not configured by default); model enrichment (*optional*, from a *configured* model; deterministic fallback retained); connected GitHub browsing (*requires a configured token*); local deep links to a Case File (*on-device*, not a shareable URL); Team/Operations surfaces (*local responsibility metadata / local history*, not accounts or hosted analytics); decisions tied to a commit (*where the head is available*).
- **Internal technical claims unsuitable for primary marketing (true, but for docs/trust section, not the hero):** HMAC webhook signature verification; RSA App authentication; typed report normalisation; schema validation; idempotent single-comment posting; malformed-state guarded reads; storage key/schema details.
- **Unverified (do not publish until verified):** any measured accuracy, precision, recall, false-positive/negative rate, time saved, or adoption number; exact light-mode rendering of every route; any claim that a specific model is used.
- **Forbidden (see §7 boundaries and the boundaries list at the end):** guaranteed safe merges; complete bug detection; autonomous merge authority; hosted team collaboration; SSO/RBAC; cloud sync; organisation-wide live analytics; automatic policy enforcement; live Slack delivery; automatic GitHub installation; security or compliance certifications; support or SLA commitments; adoption or endorsement by named organisations; any invented customer, testimonial or metric.
- **R2-gated (approved only after the assigned milestone passes):** *A claim mapped to an unfinished R2 proof obligation is approved for the future R3 landing only after that milestone passes its acceptance criteria. Until then, it is not approved for publication.* This applies to claims whose implementation or convergence is still assigned to R2 — for example durable Case File deep links (R2E) and final screenshot-ready product states across the surfaces in §14 (R2B–R2H).

---

## 8. Public claims register

Format per claim: proposed wording · category · supporting implementation/document · proving route or state · required qualifier · risk of misunderstanding · approved placement.

**Publication gate:** *A claim mapped to an unfinished R2 proof obligation is approved for the future R3 landing only after that milestone passes its acceptance criteria. Until then, it is not approved for publication.* Register entries whose proof depends on an R2 milestone (notably the durable Case File history and on-device deep link — §9 capability-to-proof row 15 and §19, assigned to R2E — and any claim whose proving state is a §14 screenshot capture) are approved for build reference but not for publication until the responsible R2 milestone (see §9 and §30) has passed acceptance.

1. **"Lintel verifies what is ready."** · safe · `app/page.tsx` thesis, whole product · Case File / Workspace · none · could imply guarantee — pair with human-decision framing nearby · **hero.**
2. **"Inspect the evidence behind a change."** · safe · `lib/evidence-hierarchy.ts`, Case File "What Lintel observed" + Evidence · Case File §02–§03, Workspace Evidence stage · none · none material · **hero subheadline / product section.**
3. **"Identify missing proof."** · safe · merge-contract missing-proof records (`lib/merge-contract.ts`, `lib/verification-pack.ts`) · Case File "Uncertain or missing", Workspace "Missing or unverified" evidence · none · none · **hero subheadline / product section.**
4. **"Resolve merge requirements."** · safe · `lib/merge-contract.ts` clauses (blocking/advisory, open/satisfied/accepted) · Case File "Merge Contract", Workspace Requirement stage · none · "resolve" must not imply Lintel clears them — the engineer does · **product section.**
5. **"Record the final human decision."** · safe · `lib/human-decision-ledger.ts` · Case File Human Decision, Workspace decision plate · none · none · **hero subheadline / product section.**
6. **"Lintel produces a recommendation. You decide."** · safe · recommendation vs ledger separation across product · Case File right rail, Workspace "Lintel recommends" vs "Record decision" · none · strongest trust line — keep prominent · **product / trust section.**
7. **"A deterministic analysis runs first; an optional configured model can enrich it."** · qualified · `app/api/generate-report/route.ts` (baseline then optional OpenAI), `lib/report-generator.ts` · New Review review behaviour; Case File provenance labels · "optional", "configured" · could imply a model is always used · **product / trust section.**
8. **"If the model is unavailable, Lintel keeps its deterministic result."** · qualified · `generate-report/route.ts` fallback path (20s timeout, catch → deterministic) · Analysis behaviour · none · none · **trust section.**
9. **"Review a public pull request, paste a diff, or load a sample."** · safe · `app/new/page.tsx` sources; `app/api/fetch-pr-diff` · New Review · none · none · **product / CTA context.**
10. **"Connect a GitHub App to review pull requests in your workflow."** · qualified · `lib/github-app-*`, `app/api/github-app/*`, webhook signature verification · New Review GitHub App state · "when configured", "not configured by default" · could imply a hosted, always-on integration — keep configured/not-configured status visible · **workflow section.**
11. **"One decision comment per pull request, updated in place."** · qualified · `lib/github-app-comments.ts` update/upsert logic · GitHub App path · "when the App is configured" · could imply it posts by default · **workflow section (paired with App state).**
12. **"A GitHub Action blueprint you can adopt in CI."** · qualified · `app/github-action/page.tsx` ("Prototype only · no GitHub posting") · GitHub Action page · "blueprint / not a live connection", "does not post" · could be read as an installed integration — must be visually separated from the App · **workflow section.**
13. **"Copy a decision handoff for Slack or a PR thread."** · qualified · `app/slack-handoff/page.tsx` clipboard copy; Case File copy/export · Slack handoff, Case File export · "copy/export only", "does not send" · could imply delivery · **workflow section.**
14. **"Review history is stored on your device by default."** · qualified · `lib/report-history.ts`, storage map R2A §7–§8 · architecture section · "by default" · could imply guaranteed privacy/security — do not · **trust / architecture section.**
15. **"Decisions are tied to the exact commit, where the head is available."** · qualified · `human-decision-ledger.ts` `applicableHeadSha`, applicability states · Case File / Workspace decision context · "where the head is available" · head is sometimes "not recorded" in samples — keep the qualifier · **product / trust section.**
16. **"A recorded decision can go stale, be reaffirmed, superseded or withdrawn."** · safe · `human-decision-ledger.ts` event/applicability types · Workspace decision inspector · none · none · **product / trust section.**
17. **"When Lintel finds no material issue, the record stays concise."** · safe · `docs/evaluation-results.md` restraint spec; APPROVE sample · Workspace clean approval, Case File APPROVE · none · avoid implying absolute silence — it is restraint, not a guarantee of nothing to say · **product section.**
18. **"Every finding shows where it came from — rule detected or model assisted."** · safe · provenance labels (`lib/report-generator.ts`, security-model.md) · Case File / Workspace provenance chips · none · none · **product / trust section.**
19. **"Lintel does not replace human review, CI, tests or security review."** · safe (limitation) · README, security-model, case-study · footer / trust · none · essential honesty line · **trust / footer.**
20. **Any accuracy/precision/adoption number.** · unverified/forbidden · none (evaluation-results all placeholders) · none · — · would be fabrication · **not public.**

---

## 9. Capability-to-proof matrix

For every major promise: capability · authoritative source · route · exact UI state · screenshot/interaction proof · fixture vs real requirement · qualification · R2 milestone responsible.

| # | Capability | Authoritative source | Route | Exact UI state to show | Proof kind | Fixture vs real | Qualification | R2 owner |
|---|-----------|----------------------|-------|------------------------|-----------|-----------------|---------------|----------|
| 1 | Review creation on the engineer's device | `app/new/page.tsx`, `lib/report-history.ts` | `/new` | Source list + change material, "Generate Case File" enabled | Screenshot + interaction | Real UI; sample change source | none | R2D |
| 2 | Manual diff review | `/new` manual source, `/api/generate-report` | `/new` | Manual diff selected, diff pasted, ready to run | Screenshot | Real path | none | R2D |
| 3 | Public pull request review | `/api/fetch-pr-diff`, `/new` public-url | `/new` | Public PR URL entered, imported brief | Screenshot | Real path | subject to public GitHub rate limits | R2D |
| 4 | Deterministic analysis | `lib/report-generator.ts`, `generate-report/route.ts` | `/new`→`/report` | Provenance "Rule detected" on a finding | Screenshot + copy | Real | "safety floor / runs first" | R2E |
| 5 | Optional analysis from a configured model | `generate-report/route.ts` OpenAI branch | `/new` behaviour, `/report` | "Model assisted" provenance where applicable | Screenshot + copy | Real, env-gated | "optional / configured / not default" | R2E |
| 6 | Fallback when model analysis is unavailable | `generate-report/route.ts` catch→deterministic | (architecture) | Trust-section statement + provenance | Copy | Real | none | R2G/R3 |
| 7 | Findings connected to evidence | `lib/evidence-hierarchy.ts` | `/report`, `/workspace` | Finding F1 with linked evidence E1 | Screenshot | Real engine; sample data badged | none | R2E |
| 8 | Missing proof | `lib/merge-contract.ts`, `lib/verification-pack.ts` | `/report`, `/workspace` | "Missing or unverified" evidence; "Uncertain or missing" section | Screenshot | Real engine | none | R2E |
| 9 | Merge requirements | `lib/merge-contract.ts` | `/report`, `/workspace` | Requirement C1 OPEN · BLOCKING | Screenshot | Real engine | "does not block merges" | R2E |
| 10 | Recommendation separated from Human Decision | recommendation build vs `human-decision-ledger.ts` | `/report`, `/workspace` | Recommendation panel + "No engineer decision recorded" / "Record decision" | Screenshot | Real | none | R2E |
| 11 | Accepted risk | `human-decision-ledger.ts` `approve-with-accepted-risk`, `acceptedRiskReferences` | `/workspace`, `/report` | Approve-with-accepted-risk decision state | Screenshot | Real; needs a decision recorded | none | R2E |
| 12 | Decision history | `lib/decision-history.ts` | `/workspace`, `/review-operations` | Decision/readiness chronology | Screenshot | Real, local | "local history" | R2E/R2F |
| 13 | Reaffirmed / superseded / withdrawn decisions | `human-decision-ledger.ts` event types | `/workspace` | Decision inspector showing applicability | Screenshot | Real | none | R2E |
| 14 | Decisions tied to the exact commit | `human-decision-ledger.ts` `applicableHeadSha` | `/report`, `/workspace` | Head reference / "head not recorded" honesty | Screenshot | Real | "where head available" | R2E |
| 15 | Durable Case File history | `lib/report-history.ts` | `/report?reportId=…` | Durable Case File (not demo) with recommendation | Screenshot | Real durable report | not a shareable URL | R2E |
| 16 | Queue navigation and focus mode | `app/workspace-v2/components/WorkspaceQueue.tsx` | `/workspace` | Queue expanded and collapsed | 2 screenshots | Real projection; fixture source acceptable if badged | none | R2B/R2E |
| 17 | GitHub App workflow | `lib/github-app-*`, `api/github-app/*` | `/new`, GitHub area | Configured vs Not configured status | Screenshot | Real, env-gated | "configured/not configured" | R2G |
| 18 | GitHub Action blueprint | `app/github-action/page.tsx` | `/github-action` | "Prototype only · no GitHub posting" strip | Screenshot | Conceptual blueprint | "blueprint / not a live connection" | R2G |
| 19 | Slack handoff | `app/slack-handoff/page.tsx` | `/slack-handoff` | Copy-ready formats + "does not send" | Screenshot | Functional copy; fixture content | "export/copy only" | R2G |
| 20 | Review Operations | `app/review-operations/page.tsx` | `/review-operations` | Local records + "not hosted organisation analytics" | Screenshot | Real local history | "local only" | R2F |
| 21 | Team responsibility metadata | `lib/team-workspace.ts`, `app/team/page.tsx` | `/team` | User-created workspace/roles, no fabricated person | Screenshot | Real local; sample only if badged | "local metadata, not accounts" | R2F |
| 22 | Policy and System limitations | `app/review-policies/page.tsx`, `app/settings/page.tsx` | `/review-policies`, `/settings` | Read-only profiles; "does not enforce / stores nothing" | Screenshot | Conceptual/read-only | "read-only, no enforcement" | R2G |

---

## 10. Hero contract

- **Final recommended headline:** "Agents create code. Lintel verifies what is ready."
- **Final subheadline:** "Inspect the evidence behind a change, identify missing proof, see what must be resolved before merge, and record the final human decision."
- **Primary CTA:** "Review a pull request" → `/new`.
- **Secondary CTA:** "Explore the sample Workspace" → `/workspace?source=fixture`.
- **Hero product visual:** a real Case File verification dossier (canonical B2B redemption API scenario, PR #482) showing the Change → Observation → Evidence → Requirement → Human Decision spine, the recommendation (TESTS_REQUIRED, risk band), one finding tied to one requirement, and "Pending engineer decision". This is the current hero composition and it is strong; keep the substance, refine the framing in R3C.
- **Required visible provenance:** the hero product visual must carry a "Sample data" (or equivalent) badge and show "Pending engineer decision" so the recommendation is never mistaken for authority or for a real customer outcome.
- **Claims that must NOT appear in the hero:** any accuracy/adoption/endorsement number; "guaranteed safe"; "autonomous"; "enterprise ready"; "local-first" as a slogan; "team collaboration"; any named company.
- **Desktop composition:** two-column — editorial thesis and CTAs left, product dossier right — understandable in one viewport without scrolling; real UI, not a disconnected marketing mock.
- **Mobile hero behaviour:** headline, subheadline and both CTAs first; the product dossier stacks below, cropped to the recommendation + one finding + decision-pending line, with labels legible and the sample badge visible. No text baked into images where real text can be used.

The wording is natural and direct; no hyphenated marketing compound was added to shorten it.

---

## 11. CTA contract

- **Primary — "Review a pull request" → `/new`:** lands on New Review. Expected state: source list with Public PR URL, Manual diff and Sample review available immediately; Connected GitHub / GitHub App show "Not configured" honestly. Fallback: even with nothing configured, the three offline-capable sources work. Sample provenance: sample source is labelled. Keyboard/accessibility: it is a real link with an accessible name ("Review a pull request"), reachable and focus-visible.
- **Secondary — "Explore the sample Workspace" → `/workspace?source=fixture`:** lands on the Workspace loaded from the deterministic fixture snapshot; the fixture provenance is explicit (never silently substituted). Keyboard/accessibility: real link, accessible name, visible focus.
- **No dead or conceptual CTA:** both destinations exist and function today. No CTA may point at an unbuilt capability. Do not add a "Connect GitHub" hero CTA that implies an always-on hosted integration.

---

## 12. Landing page narrative and section order

Confirmed order (refined labels; final layout is decided in R3B/R3C, not here):

1. **Hero** — thesis, subheadline, both CTAs, real Case File dossier. *Message:* Lintel verifies what is ready. *Proof:* the dossier. *Prohibited overclaim:* guarantee, adoption. *Bridges to:* the verification gap.
2. **The verification gap** — "CI green does not mean the change is ready." *Message:* a passing pipeline leaves real gaps. *Proof:* CI-passed record beside unresolved failure modes (retry duplication, provider failures, unclear contract). *Prohibited:* implying Lintel replaces CI. *Bridges from* the hero claim *to* how the gap is closed.
3. **Evidence chain** — Change → Observation → Evidence → Requirement → Human Decision. *Message:* proof travels with the finding. *Proof:* finding F1 bound to evidence E1 and requirement C1. *Prohibited:* generic process decoration. *Bridges to* the product proof.
4. **Product proof** — real Workspace and Case File states. *Message:* this is the actual product. *Proof:* screenshots from §14. *Prohibited:* fixture shown as real; unbadged sample. *Bridges to* how it works.
5. **How Lintel works** — source in, analysis, Case File out. *Message:* import a change, get a verification record. *Proof:* New Review + Case File. *Prohibited:* implying automatic installation or test execution. *Bridges to* the decision model.
6. **Recommendation versus Human Decision** — *Message:* Lintel recommends; the engineer decides and records it. *Proof:* recommendation panel vs decision ledger. *Prohibited:* autonomous authority. *Bridges to* the workflow.
7. **GitHub workflow** — App (real, configured/not-configured), Action (blueprint), Slack handoff (copy/export). *Message:* fits your workflow, honestly bounded. *Proof:* the three surfaces, clearly separated. *Prohibited:* App/Action confusion, live delivery. *Bridges to* trust.
8. **Trust and architecture** — device storage, deterministic baseline, optional model, provenance, GitHub App security behaviour. *Message:* precise about where data lives and how analysis works. *Proof:* architecture statements + provenance. *Prohibited:* privacy/security guarantees, certifications. *Bridges to* audience.
9. **Who Lintel is for** — senior/staff/principal engineers, platform teams, teams reviewing agent-written code. *Message:* built for the people accountable for merges. *Prohibited:* fake logos or "trusted by". *Bridges to* the final CTA.
10. **Final CTA** — "Bring the change you're unsure about." → "Review a pull request" (+ "Explore the sample Workspace"). *Prohibited:* new claims introduced only at the end.

This stage fixes narrative and proof order only. Pixel layout, exact composition and finished art direction are R3B/R3C.

---

## 13. Evidence chain story

**Chain:** Change → Observation → Evidence → Requirement → Human Decision.

- **Plain-language explanation:** Lintel starts from what changed, describes what it observed, shows the evidence behind each observation, turns anything unproven into a requirement to satisfy before merge, and hands the decision to the accountable engineer.
- **Technical explanation:** the changed-file scope frames the review (Change); deterministic and optional model analysis produce findings with provenance (Observation); each finding is bound to evidence records classified as observed/verified, inferred/assumed, or missing/unverified (Evidence, `lib/evidence-hierarchy.ts`); unmet proof becomes merge-contract clauses with importance and status (Requirement, `lib/merge-contract.ts`); and the human-decision ledger records the bounded outcome, accepted risk and applicability to the head commit (Human Decision, `lib/human-decision-ledger.ts`).
- **Public diagram content:** five labelled nodes in sequence with a one-line gloss each, and a single worked example carried across all five (finding F1 "retry may create duplicate redemptions" → evidence E1 "directly observed" → requirement C1 "prove retries cannot issue duplicate discount codes, OPEN · BLOCKING" → decision "pending"). Use the canonical scenario so the example is concrete, not abstract.
- **Which real Workspace state proves each stage:** Change → Workspace "Change" (files, medium/low tags); Observation → "Observation" findings with severity; Evidence → "Evidence · Observed/Inferred/Missing" composition; Requirement → "Requirement · blocking open" counts; Human Decision → the decision plate ("No engineer decision recorded" / recorded decision).
- **Keeping it from becoming decoration:** always show the same real record flowing through all five stages, with real counts and a real requirement — not five empty icons. The chain must display at least one open blocking requirement and one missing-proof record so the mechanism is visible.
- **How the chain distinguishes Lintel from a stream of review comments:** a comment thread is unordered opinion; the chain is one auditable record where each finding carries its proof and its unresolved requirement, ending in a recorded human decision. The differentiator is the binding of finding → evidence → requirement → decision, not the volume of remarks.

---

## 14. Product screenshot and proof-state requirements

Exact capture list. For each: real vs fixture · viewport · crop · visible metadata · provenance badge · exclusions · landing section · R2 owner. (No screenshots are produced in R3A; this is the specification R2 and R3E fulfil.)

**Workspace (`/workspace`):**
- Queue expanded — real projection or badged fixture · desktop ≥1180px · queue + spine + first finding · repo, PR#, "Local report"/sample badge · sample badge if fixture · exclude real repo names/secrets · Product proof · R2B/R2E.
- Queue collapsed — same source · desktop · spine + canvas focus · same · same · same · Product proof / focus mode · R2B.
- Tests required — real engine, canonical scenario · desktop · Observation list with HIGH findings · risk score/band, "Tests required" · sample badge · exclude head-not-recorded ambiguity from hero use · Verification gap / Product proof · R2E.
- Blocking requirement — real · desktop · Requirement stage, C1 OPEN · BLOCKING · counts · sample badge · — · Evidence chain · R2E.
- Missing evidence — real · desktop · Evidence "Missing or unverified" · composition counts · sample badge · — · Product proof · R2E.
- Clean approval — real, "Normalize customer display names" scenario · desktop · Approve, score 22, evidence PRESENT · "Reviewed", low risk · sample badge · — · "When Lintel finds no material issue, the record stays concise" · R2E.
- Accepted risk — real, decision recorded · desktop · approve-with-accepted-risk state · accepted-risk reference · sample badge · — · Recommendation vs decision · R2E.
- Pending decision — real · desktop · "No engineer decision recorded" + "Record decision" · "Lintel recommends" · sample badge · — · Recommendation vs decision · R2E.
- Applicable recorded decision — real · desktop · recorded decision with applicability/head reference · timestamp, head state · sample badge · — · Trust section · R2E.

**New Review (`/new`):**
- Source choice — real · desktop · source list + review setup · — · — · Product / CTA · R2D.
- Manual diff — real · desktop · manual source selected · — · — · How it works · R2D.
- Public PR — real · desktop · public URL entered · — · — · How it works · R2D.
- GitHub configured — real, env-gated · desktop · App/token "Connected" status · installation/repo names redacted or sample · configured badge · exclude real private data · Workflow · R2G.
- GitHub not configured — real · desktop · "Not configured" with working sources named · — · not-configured state visible · — · Workflow · R2D/R2G.
- Review profile — real · desktop · review-behaviour selector (Standard readiness) · — · — · How it works · R2D.
- Ready to run — real · desktop · "Generate Case File" enabled · — · — · CTA context · R2D.

**Case File (`/report`):**
- Durable report — real durable (not demo) · desktop · full dossier header + spine · reportId present, "unknown" head honesty · **must not** carry the demo badge (must be a real durable report) · exclude demo numbers · Product proof · R2E.
- Recommendation — real · desktop · right rail TESTS_REQUIRED, risk 46/100 MEDIUM, blocking/missing counts · — · sample/demo badge as applicable · Recommendation vs decision · R2E.
- Evidence — real · desktop · "What Lintel observed" + evidence register (records, directly observed, unknown) · — · badge · Evidence chain · R2E.
- Merge contract — real · desktop · "Merge Contract" clauses · required/recommended/optional counts · badge · Product proof · R2E.
- Human Decision — real · desktop · decision panel, "Engineer decision pending" / recorded · — · badge · Recommendation vs decision · R2E.
- Export actions — real · desktop · "Copy summary" / "Download Markdown" · — · — · Workflow · R2E.
- Explicit demo provenance — the demo default view · desktop · "Demo report" badge visible · demo/historical label · **demo badge required** · never used as a real-outcome proof · Trust/provenance · R2E.

**GitHub:**
- App configuration — real env-gated · desktop · App status configured/not-configured · — · status badge · Workflow · R2G.
- Webhook-backed analysis — real · desktop · installation/delivery state (sample/redacted) · — · badge · Workflow · R2G.
- Decision comment — real capability · desktop · single updated PR comment shape (sample) · "sample" · sample badge · exclude real repo · Workflow · R2G.
- Action blueprint — conceptual · desktop · "Prototype only · no GitHub posting" strip + YAML · "Prototype" · blueprint badge · must be visually separate from the App · Workflow · R2G.

**Operations and Team:**
- Only states that are safe and useful for public proof. No fabricated person; no ordinary unbadged sample activity; no implication of hosted organisation analytics. Prefer a truthful empty or user-created state, or an explicitly badged sample workspace. Operations must show the "not hosted organisation analytics" boundary in-frame. R2F owns making these truthful.

---

## 15. Screenshot visual standards

- No fabricated results, adoption, productivity or security outcomes.
- No unsupported company names; use the canonical `acme/*` sample repositories.
- No fake team members (the `sampleActivity()` "Maya Chen" injection must be removed or explicitly isolated to a badged sample workspace in R2F before any Team capture).
- No hidden sample badge — fixture/demo/sample states are always badged in-frame.
- No invented timestamps, activity or repository history.
- No secrets, access tokens or personal data.
- Use the canonical B2B redemption API scenario where a rich risky case is needed; use the smaller clean scenario for the restraint proof.
- Use real product UI, not a disconnected marketing mock.
- Preserve meaningful labels; keep text legible at landing presentation size.
- Avoid showing controls that imply unsupported capabilities (no delivery buttons that read as "send", no editable-config affordances on read-only surfaces, no logged-in Theme control implying light support).

---

## 16. Demo and canonical scenario contract

- **Canonical B2B redemption API scenario** (`acme/redemption-api`, "Add fallback handling for failed discount-code retrieval", PR #482): the default for hero, verification gap, evidence chain and rich product proof. It carries a real HIGH finding, missing proof and an open blocking requirement — ideal for showing the mechanism.
- **Smaller clean approval scenario** (`acme/profile-api`, "Normalize customer display names"): used to prove restraint — Approve, low risk, evidence PRESENT, no invented work.
- **Accepted-risk scenario:** a separate capture where a decision is recorded as approve-with-accepted-risk, to prove the concept without implying it is the default.
- **Additional scenarios** are justified only when they prove a capability the two above cannot (for example a decision that has gone stale). Do not multiply scenarios for variety.
- **Sample provenance** stays visible in every demo capture (badge in-frame); demo Case File keeps its "Demo report" badge.
- **Values that may be labelled sample:** scores, bands, counts, findings, requirements and repository names in any fixture/demo/sample capture.
- **Prohibited:** invented adoption, productivity, time-saved or security outcomes attached to any scenario.

---

## 17. Public terminology contract

**Preferred wording (lock these):**

- **engineering verification** (the category)
- **whether a pull request is ready** (the job)
- **change** / **the change in a pull request** (not "diff" in body copy; "diff" is fine as a source label)
- **Case File** (the durable verification record)
- **evidence** / **inspectable evidence**
- **missing proof**
- **requirement** / **merge requirement**
- **recommendation** (Lintel's output)
- **Human Decision** (the recorded human outcome)
- **accepted risk**
- **review history stored on the device** (storage framing)
- **optional analysis from a configured model** (model framing)
- **deterministic analysis** / **deterministic baseline**
- **GitHub App** (real, when configured)
- **GitHub Action** (blueprint/export)
- **Slack handoff** (copy/export only)

**Avoid or heavily qualify:** autonomous; guaranteed; safe; secure; enterprise ready; team collaboration; policy enforcement; "connected" (without a configured/not-configured status); AI reviewer; agentic review; production ready; local-first (as a slogan); evidence-backed; merge-readiness workspace; model-assisted (prefer "optional analysis from a configured model").

**Punctuation note:** hyphens remain allowed in route names, code identifiers, official product names, quoted source material and recognised technical terms (for example `pull_request`, `pull-requests: write`, `data-theme`). The style rule targets *marketing compounds*, not technically necessary punctuation.

---

## 18. Recommendation versus decision contract

Public framing:

- Lintel produces a recommendation and a risk band.
- The accountable engineer makes and records the decision.
- A recommendation is never authority; the analysis ends where accountable judgment begins.
- Human Decisions are recorded, with an actor label, outcome and timestamp.
- Accepted risk is explicit and referenced.
- A decision may go stale as the change moves on.
- A decision may be reaffirmed, superseded or withdrawn.
- Applicability to the current commit matters; where the head is available, the decision is tied to it.

**Main page:** the recommendation-versus-decision distinction, accepted risk, and "the decision stays human". **Technical documentation:** the full applicability model (stale/partially-applicable/superseded/withdrawn semantics, head-SHA binding details). Keep the page clear; keep the ledger mechanics in docs.

---

## 19. Device storage and architecture contract

Stated precisely on the landing (trust section), grounded in R2A §7–§8 and `lib/report-history.ts`:

- **Stored on the device (durable, localStorage):** report history and the layered ledgers (condition progress, decision history, human-decision ledger, review state), team workspaces, theme preference, guided-tour marker.
- **Survives refresh:** durable, history-backed Case Files and their recorded decisions; the Workspace queue reads them back.
- **Session only (sessionStorage):** the just-generated report handoff from New Review to the Case File; removed after read. Session-only and demo Case Files are persistence-guarded — their decisions do not write to durable storage.
- **Fixture paths:** `/workspace?source=fixture`, `/workspace-v2` default, the Case File demo default and `?demo=1`, and New Review "Sample review".
- **May contact an external model provider:** report generation, only when a model is configured (`OPENAI_API_KEY` + `OPENAI_MODEL`); the submitted change is sent to that provider for analysis. Lintel does not claim the provider does not retain data.
- **GitHub capabilities that require configuration:** Connected GitHub (token) and the GitHub App (App environment + webhook secret); both are off by default and show "Not configured".
- **Not hosted:** there is no Lintel server account, no hosted report sharing, no server-side workspace.
- **Not synchronised:** nothing syncs across devices or users; there is no cross-user state.
- **Browser-local Case File links** are on-device deep links (`/report?reportId=<durable-history-identity>`), not shareable server URLs; an unknown identity renders unavailable.
- **Fixture vs session vs durable local history** are visually distinct and truthfully badged.

"Local-first" is not required in primary copy. Device storage is described as an architecture and trust characteristic and **must not** be presented as a guarantee of privacy, security, offline operation or regulatory compliance.

---

## 20. AI and model contract

- **Deterministic analysis** runs first and is the safety floor (`lib/report-generator.ts`).
- **Optional model enrichment** runs only when a model is configured; it improves wording and adds nuance but cannot suppress deterministic findings, clear missing tests, prove assumptions or downgrade risk beyond guardrails (`generate-report/route.ts` instructions).
- **Fallback:** on any model failure, timeout (20s) or invalid output, Lintel returns the deterministic result and labels the source as a fallback.
- **Provider configuration:** the operator supplies the key and model; nothing is stored by the product; deterministic-only is first-class, not degraded.
- **Provenance:** findings are labelled "Rule detected" or "Model assisted" so origin is visible.
- **Uncertainty:** Lintel does not claim model output is complete or cannot be wrong.
- **Model-independence boundary:** the deterministic baseline and guardrails hold regardless of model behaviour.
- **Invalid model output:** discarded in favour of the deterministic baseline.
- **Claims that must not be made:** that a specific named model is used; that model analysis is always on; that the model catches every issue; "model-assisted verification" as a headline.

The landing is not model-centric. Prefer "optional analysis from a configured model" over "model-assisted verification."

---

## 21. GitHub claim contract

**GitHub App (real, environment-gated):**
- Real capability when configured: installation/repository/pull-request browsing (`/api/github-app`), webhook-backed analysis (`/api/github-app/webhook`), HMAC SHA-256 webhook signature verification (`verifyGitHubWebhookSignature`), RSA App authentication (`lib/github-app-auth.ts`), and one decision comment per pull request, updated in place (`lib/github-app-comments.ts`).
- Truthful status: "Connected" vs "Not configured"; off by default.
- Current limitations: requires the App environment; not a hosted managed service; not installed automatically.
- **Note:** README, `security-model.md`, `case-study.md` and `public-pilot.md` still list "no GitHub App"; they are outdated. The App is real in the code. R3 follows the repository, with the configured/not-configured qualifier always attached.

**GitHub Action (blueprint):**
- A workflow blueprint and export/setup surface, with illustrative YAML and a sample comment shape.
- Explicitly "Prototype only · no GitHub posting · no `pull_request_target`."
- Not a live App connection; not automatically installed; not evidence of an active repository integration.

Only claims supported by implementation are approved. The landing must make the App-versus-Action distinction unmistakable and never let the static blueprint read as the real App.

---

## 22. Team, Operations, Policy and System boundaries

- **Team:** local responsibility metadata (workspaces, members, roles) with real local CRUD; no authenticated collaboration, no invitations, no live multi-user state. "Members"/"roles" are not accounts or access control. No fabricated person may appear in production state (R2F removes/isolates "Maya Chen").
- **Operations:** derived from local report history only; must keep "not hosted organisation analytics"; no fabricated production activity.
- **Policy (Review Policies):** read-only profiles for framing; does not enforce, block merges, sync or store organisation settings.
- **System (`/settings`):** read-only environment surface (runtime, provider availability, storage boundaries, integration status, version/build); stores nothing; not editable configuration; no SOC 2/SSO/RBAC/audit-log claims.
- **Slack handoff:** prepares or copies content; does not send; no Slack OAuth or workspace connection.

Publicly, these may be shown only in truthful states with their boundary language visible.

---

## 23. Trust and architecture section

Approved, verified topics only:

- deterministic baseline as the safety floor;
- explicit provenance labels;
- schema validation and typed normalisation of generated reports;
- fallback when model output is unavailable or invalid;
- HMAC SHA-256 webhook signature verification (GitHub App);
- idempotent single decision comment per pull request;
- durable on-device history and the persistence guard that prevents demo/session writes from polluting storage;
- Human Decision authority and applicability;
- guarded reads that degrade malformed state gracefully.

Distinguish clearly: **product capability** (what a user does) vs **engineering implementation detail** (how it is built, for the trust section) vs **security-relevant behaviour** (signature verification, raw-diff-free exports) vs **certification/compliance** (none — must never be implied). Engineering practices must never be converted into certification claims.

---

## 24. Social proof policy

- No fake logos, fabricated testimonials, unsupported user counts, invented performance metrics, or "trusted by" language.
- Product proof (real Case File and Workspace states) replaces social proof until real, permissioned evidence exists.
- Genuine design-partner evidence may be added later only when a real partner gives written permission; it must be attributable, dated, and specific, and must never imply broader adoption than granted. Named-organisation endorsement remains forbidden until such permission exists.

---

## 25. Pricing and commercial boundary decision

- **Recommendation:** do not put pricing on the R3 landing. Internal pilot tiers exist in `docs/public-pilot.md` (£99/£199 Founding Team, £249 Agency), but they are pilot offers, not a live self-serve commercial product, and the app exposes no billing.
- Do not invent plans, service guarantees, hosted support, SLAs or enterprise deployment.
- **Truthful current treatment:** frame access as a pilot. A single honest line and a contact/pilot path is sufficient if any commercial framing is needed; otherwise omit pricing entirely and keep the page product-proof-led. Revisit when real commercial infrastructure exists.

---

## 26. Public visual direction

- The public page should feel like the same product as the logged-in workspace (shared tokens, type, state and provenance language) while being free to use warm editorial light sections alongside immersive graphite product-proof sections.
- Use real product records and screenshots; restrained technical rules and diagrams; the landing may use Newsreader in the `.lp` scope where editorially justified (it must never appear in logged-in surfaces).
- Prohibited: generic AI gradients; glows; chat imagery; agent-interface theatre.

**Evaluation of the current landing (from the reference screenshots):**
- *Strengths worth preserving:* the confident editorial thesis and typographic scale ("CI green does not mean the change is ready."); the real Case File dossier as hero proof; the calm graphite palette; the "finding travels with its proof" section; the clear "analysis ends where accountable judgment begins" framing.
- *Too static / over-reliant on mock cards:* the hero leans on a single large product card; several sections are essentially static exhibits with limited real interaction. R3 should let more proof come from live, inspectable product states.
- *Typography strengths:* strong display hierarchy and restraint; keep it.
- *Density / narrative gaps:* long editorial stretches with sparse proof density in places; the GitHub App reality (now real) is under-represented; recommendation-vs-decision is present but could be a named section.
- *Patterns to retire in R3C:* purely decorative "exhibit" framing that does not add proof; any reliance on the demo Case File as if it were a real outcome; any static card that could be replaced by a real product state.

R3A does not design the finished landing. Layout and art direction are R3B/R3C.

---

## 27. Motion and interaction boundary

- Restrained, content-led motion; product proof stays inspectable and readable.
- No animation that simulates functionality the product does not have.
- Reduced-motion support complete; the page is fully usable and truthful without motion.
- No parallax, no decorative particle fields, no agent-chat theatre, no auto-animation that prevents reading technical proof.

---

## 28. Accessibility, responsive and performance contract

- Semantic heading order (one h1, logical nesting).
- Full keyboard navigation; visible focus on every interactive element.
- Accessible CTA names ("Review a pull request", "Explore the sample Workspace").
- Real text rather than text embedded in images wherever possible; useful alt text on every product image describing the state shown.
- Every screenshot has nearby explanatory text.
- Mobile proof stays legible; important labels (recommendation, requirement, decision state, sample badge) are never cropped out.
- Manage asset size and loading priority; prioritise the hero and defer below-the-fold captures.
- Respect `prefers-reduced-motion`.

---

## 29. SEO and metadata direction

- Truthful title and description in natural category language (for example title: "Lintel — engineering verification for pull requests"; description: "Lintel helps engineers decide whether a pull request is ready to merge: inspect the evidence behind a change, identify missing proof, see what must be resolved before merge, and record the final decision.").
- No unsupported superlatives; no awkward hyphenated marketing phrases.
- The social/share image must show real product proof with a visible sample badge, not a slogan card.
- Link to technical documentation only where it is public and maintained.
- R3A does not implement metadata; this is direction for R3B/R3D.

---

## 30. R2 proof obligations

For each surface the landing depends on, R2 must make it screenshot-ready and truthful.

- **R2B — Shell and navigation:** coherent shell across `AppShell` routes; no misleading logged-in Theme control (dark-only, locked). *Proof state:* consistent rail/sidebar/command bar. *Acceptance:* all `AppShell` routes share one shell; Workspace unchanged.
- **R2C — Shared visual system:** warm-neutral graphite token recalibration; consistent state/provenance language and chips. *Proof state:* coherent colour and state vocabulary across captures. *Acceptance:* semantic state colours only; chips standardised.
- **R2D — New Review:** New Review is the primary-CTA destination; clear source states (Public PR, Manual diff, Sample, Connected GitHub, GitHub App) with honest not-configured status; ready-to-run state. *Proof state:* §14 New Review captures. *Acceptance:* all sources work; generation contract intact.
- **R2E — Case File:** durable Case File with a stable local deep link; recommendation; evidence; requirements; Human Decision; demo badge on the demo default. *Proof state:* §14 Case File captures, durable (non-demo) hero-quality report. *Acceptance:* durable vs demo persistence correct; decisions record; deep link survives refresh.
- **R2F — Team and Operations truthfulness:** no fabricated production identity; "not hosted organisation analytics" visible; sample content isolated and badged. *Proof state:* truthful empty/user-created Team; local Operations. *Acceptance:* sample-person resolved; boundary copy present.
- **R2G — GitHub App/Action separation, Slack handoff, Policy/System limits:** App (real, configured/not-configured) visibly separate from the Action blueprint; Slack handoff export-only; Policy/System read-only limits prominent. *Proof state:* §14 GitHub/Slack/System captures. *Acceptance:* App/Action separated; "does not send/post/enforce" visible.
- **R2H — Cross-route QA:** cross-route continuity, keyboard/focus, states, provenance/theme truthfulness. *Proof state:* every capture in §14 verified truthful. *Acceptance:* R2 §27 criteria + §28 checklist pass.

---

## 31. R3 implementation sequence

- **R3B — Landing information architecture and final copy.** *Purpose:* fix the section IA (§12) and write final, audited copy. *Dependencies:* this contract. *Risks:* reintroducing hyphenated marketing language; overclaiming. *Acceptance:* every line traces to an approved claim; narrative order confirmed. **Final landing layout begins to be designed here.**
- **R3C — Public visual system and detailed landing design.** *Purpose:* art direction, composition, typography, editorial-vs-graphite section system. *Dependencies:* R3B, R2C tokens. *Risks:* decorative drift, mock-card reliance. *Acceptance:* real product proof is central; no prohibited visual patterns. **Final visual composition is designed here.**
- **R3D — Production landing implementation.** *Purpose:* build the page. *Dependencies:* R3B, R3C. *Risks:* accessibility/performance regressions; text baked into images. *Acceptance:* semantic, accessible, performant; both CTAs work.
- **R3E — Screenshot and product-proof system.** *Purpose:* produce the §14 captures from the real, R2-truthful product with visible provenance. *Dependencies:* R2B–R2H, R3D. *Risks:* fixture-as-real; unbadged samples. *Acceptance:* every capture matches §14/§15 standards.
- **R3F — Conversion, performance and final QA.** *Purpose:* CTA behaviour, metadata, performance, final truthfulness QA. *Dependencies:* R3B–R3E. *Risks:* last-minute overclaim in metadata/social image. *Acceptance:* §34 landing acceptance criteria pass.

R3B and R3C are where the final landing layout and visual composition are designed.

---

## 32. Open product questions

Only questions not resolvable from repository evidence, R2A locked decisions or positioning principles.

1. **Should the outdated "no GitHub App" docs be corrected before R3 ships?** *Recommended:* yes — reconcile README/`security-model.md`/`case-study.md`/`public-pilot.md` with the implemented App (as a docs task outside R3A) so public claims and docs agree. Until then, R3 follows the code with the configured/not-configured qualifier.
2. **How prominent should the GitHub App be on the landing given it is env-gated?** *Recommended:* present it in the workflow section as a real capability with its status, not in the hero; keep the hero on the verification record.
3. **Any commercial framing on the landing at all?** *Recommended:* pilot-only framing or none (see §25); revisit when billing exists.
4. **Which single durable Case File becomes the canonical hero dossier?** *Recommended:* the canonical B2B redemption API PR #482 as a real durable report (not the demo default), prepared in R2E.

---

## 33. Locked decisions for R3

- **Audience:** senior/staff/principal engineers, platform and engineering-productivity teams, reliability/security/infra engineers, teams reviewing agent-written code. Not eng-management analytics buyers, not generic AI-review shoppers, not enterprise-controls buyers.
- **Category:** engineering verification — deciding whether a pull request is ready to merge.
- **Hero thesis:** "Agents create code. Lintel verifies what is ready."
- **Concise product description:** "Lintel helps engineers decide whether a pull request is ready to merge."
- **Primary CTA:** "Review a pull request" → `/new`. **Secondary CTA:** "Explore the sample Workspace" → `/workspace?source=fixture`.
- **Page narrative:** the ten-section order in §12.
- **Public writing style:** direct, natural engineering language; short declarative sentences; one idea per sentence; calm confidence.
- **Avoid unnecessary hyphenated marketing compounds** (evidence-backed, merge-readiness workspace, model-assisted, local-first as a slogan, etc.); keep technically necessary hyphens in identifiers/terms.
- **Local operation language:** "Review history is stored on your device by default"; never "local-first" as a slogan; never a privacy/security guarantee.
- **Claim boundaries:** the §7 taxonomy and the forbidden list at the end of this document.
- **Proof hierarchy:** evidence chain → recommendation vs decision → deterministic + optional model → GitHub workflow → device storage.
- **Social proof policy:** product proof only; no logos/testimonials/counts until real permissioned evidence exists.
- **Pricing treatment:** no pricing on the landing (pilot framing or none).
- **Visual direction:** shared product feel; editorial light + graphite proof sections; real product states; no AI gradients/glows/chat theatre.
- **Screenshot standards:** real UI, badged provenance, canonical scenarios, no fabricated people/metrics/outcomes.
- **AI and model language:** "optional analysis from a configured model"; deterministic baseline with fallback; not model-centric.
- **GitHub and Slack boundaries:** App (real, configured/not-configured) separated from Action (blueprint); Slack handoff copy/export only.
- **Relationship to R2:** every landing proof state is an R2B–R2H obligation (§30); R3E captures only R2-truthful states.

---

## 34. Landing acceptance criteria

The future landing page passes when:

- an engineer understands the product in one viewport;
- every claim is supported by real capability;
- proof comes from the real product;
- sample provenance is visible in every product capture;
- Lintel is clearly differentiated from generic AI code review;
- recommendation versus Human Decision is unambiguous;
- device storage is described precisely and without guarantees;
- GitHub claims are qualified correctly (App real/configured; Action blueprint);
- no fabricated social proof exists;
- both CTAs work and reach truthful states;
- desktop and mobile narratives stay coherent;
- accessibility and reduced-motion pass;
- the writing is natural and direct, with no unnecessary hyphenated marketing phrases;
- the page feels like serious engineering software without claiming unsupported enterprise operations.

---

## Important claim boundaries (forbidden)

The landing must not publicly imply: guaranteed safe merges; complete bug detection; autonomous merge authority; hosted team collaboration; SSO or RBAC; cloud synchronisation; organisation-wide live analytics; automatic policy enforcement; live Slack delivery; automatic GitHub installation; security certifications; compliance certifications; support commitments; SLA commitments; adoption by named organisations; or measured customer outcomes that do not exist. Important limitations must not be hidden in footnotes where the primary wording would otherwise mislead.

*End of R3A contract.*
