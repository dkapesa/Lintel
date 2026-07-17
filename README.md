# Lintel

Lintel is a local-first merge-readiness workspace for pull requests.

It helps engineering teams decide whether a PR is safe, tested, operationally ready, maintainable, and ready to merge.

> Agents create code. Lintel verifies what is ready.

Lintel is not a generic AI code review chatbot. It creates a decision artifact for reviewers: recommendation, risk band, missing tests, merge conditions, operational readiness, reviewer focus, and shareable Markdown.

## Who it is for

Lintel is designed for:

- senior engineers and tech leads reviewing more PRs than they can comfortably verify;
- small teams using coding agents heavily;
- agency technical leads shipping client work with assisted coding tools;
- founders who need a second-pass merge-readiness check before shipping.

The product principle is simple:

> A checklist, not a lecture.

## Why Lintel exists

Coding agents increase implementation speed. Review confidence does not automatically scale with that speed.

A PR can look plausible while still hiding:

- missing tests for new behavior;
- retry paths that duplicate customer-facing side effects;
- provider timeout or fallback gaps;
- unstable API contracts;
- sensitive logging;
- database migration or data-write risk;
- weak observability or unclear recovery paths.

Lintel focuses on the merge decision: what needs to be true before this PR can safely merge?

## Current workflow

1. Open the local Risk inbox at `/workspace`.
2. Start a new report from `/new`.
3. Import a public GitHub PR, paste a diff, or load a built-in sample.
4. Generate a merge-readiness report.
5. Review the report working surface:
   - recommendation and risk band;
   - Conditions before merge;
   - risk findings with provenance;
   - missing coverage and suggested tests;
   - operational readiness;
   - reviewer focus;
   - report quality checks.
6. Copy conditions, copy a summary, or download Markdown.
7. Track recent reports locally in the Risk inbox.
8. Use the security model documentation to understand current privacy boundaries.

## What it does today

- Public GitHub PR import.
- Manual pasted diff analysis.
- Built-in sample reports.
- Deterministic report generation.
- Optional model-assisted analysis through a server route.
- Typed report normalization and guardrails.
- Deterministic fallback when model-assisted analysis fails.
- Stack/context inference.
- Review modes for fast triage, standard readiness, deep review, security, tests, operations and generated-code review.
- Structured recommendations: `APPROVE`, `REVIEW_REQUIRED`, `TESTS_REQUIRED`.
- Risk band and score detail.
- Missing tests and suggested tests.
- Conditions before merge.
- Copy conditions for PR-thread handoff.
- Evidence-backed findings.
- Provenance labels such as `Rule detected` and `Model assisted`.
- Operational readiness checks.
- Reviewer focus guidance.
- Report quality checks.
- Local workspace / Risk inbox.
- Local-first report history.
- Raw-diff-free local history.
- Copy summary and Markdown download.
- Security model documentation.

## Product surfaces

- `/` - positioning and product overview.
- `/workspace` - local Risk inbox for recent reports and condition progress.
- `/new` - new report working surface with sample PRs, public PR import, pasted diffs, and review modes.
- `/report` - report working surface with a sticky decision panel, merge conditions, findings, test plan, operational readiness, reviewer focus, and export actions.
- `/docs/security-model.md` - public security model summary.
- `/docs/cli-github-action-blueprint.md` - planned CLI and GitHub Action workflow blueprint.

## Trust and privacy model

Lintel is intentionally local-first in this prototype.

- Generated reports are stored in browser storage on the user device.
- Local report history stores reports and metadata, not raw diffs.
- Condition progress and local statuses are stored locally.
- Copied summaries, copied conditions, and downloaded Markdown are designed to avoid raw diff hunks and patch markers.
- Public GitHub import supports public PRs only.
- The current web app does not support private repository import.

When model-assisted analysis is enabled, the submitted diff is sent to the configured provider for analysis. Lintel does not claim that the provider does not retain submitted data.

Do not submit secrets, private source code, credentials, or sensitive production data to this prototype.

Read more in the [security model](docs/security-model.md).

## Architecture overview

Lintel is built with Next.js App Router, TypeScript, and plain CSS.

```text
/new
  -> optional POST /api/fetch-pr-diff
  -> POST /api/generate-report
       -> deterministic baseline
       -> optional model-assisted analysis
       -> normalization and guardrails
       -> report-quality assessment
  -> sessionStorage stores the current { report, source }
  -> localStorage stores raw-diff-free report history and local workflow state
  -> /report renders the selected report
  -> /workspace groups reports into a local Risk inbox
```

There is currently no database, authentication layer, billing system, hosted GitHub App, private repository web import, team account system, or CI integration.

The planned CI direction is CLI-first: a reusable Lintel CLI runs inside the user's CI environment, with a thin GitHub Action wrapper posting or updating one PR summary comment. See the [CLI and GitHub Action blueprint](docs/cli-github-action-blueprint.md).

## Case study summary

Lintel started as a static merge-readiness report and evolved into a local workspace for reviewing PR risk.

The product direction changed as the artifact became clearer:

- the report should lead with the merge decision;
- risky PRs should produce concrete Conditions before merge;
- clean PRs should stay quiet;
- reviewers should see missing tests, operational gaps, and reviewer focus without reading a long generic critique;
- local history should help track what is blocked, ready, or waiting on review.

The technical approach is deliberately small:

- deterministic analysis provides a safety floor;
- optional model-assisted analysis can improve synthesis;
- normalization and report-quality checks prevent obvious internal inconsistencies;
- local-first storage keeps the prototype useful without adding premature SaaS infrastructure.

Read the full [case study](docs/case-study.md).

## Screenshots and demo captures

Screenshots are not committed yet. Suggested placeholder paths:

| Capture | Placeholder path |
| --- | --- |
| Homepage positioning | `outputs/screenshots/01-homepage.png` |
| Risk inbox workspace | `outputs/screenshots/02-workspace-risk-inbox.png` |
| New report working surface | `outputs/screenshots/03-new-report.png` |
| Public GitHub PR import | `outputs/screenshots/04-github-import.png` |
| Clean APPROVE report | `outputs/screenshots/05-approve-report.png` |
| Risky TESTS_REQUIRED report | `outputs/screenshots/06-tests-required-report.png` |
| Conditions before merge | `outputs/screenshots/07-conditions-before-merge.png` |
| Security model documentation | `outputs/screenshots/08-security-model.png` |

See the [screenshot checklist](docs/screenshot-checklist.md) for capture guidance.

## Public pilot status

Lintel is in public pilot preparation.

The current pilot is best suited for:

- tech leads and staff engineers at small AI-heavy startups;
- agency technical directors shipping client work with coding agents;
- technical founders using coding agents heavily;
- senior engineers who are the review bottleneck.

Useful pilot docs:

- [Evaluation results](docs/evaluation-results.md)
- [Public pilot package](docs/public-pilot.md)
- [Security model](docs/security-model.md)
- [Distribution assets](docs/distribution-assets.md)
- [GitHub Action plan](docs/github-action-plan.md)
- [CLI and GitHub Action blueprint](docs/cli-github-action-blueprint.md)

## Current limitations

Lintel is still a prototype.

- Heuristics and model-assisted output can miss or misclassify risk.
- No private repository web import.
- No GitHub App.
- No CI integration.
- No automatic PR comments.
- No authentication.
- No billing.
- No database-backed team workspace.
- No production team account system or database-backed shared workspace.
- No line-level diff hunk evidence.
- No test execution.
- No static-analysis engine.
- Frontend-specific reviewer routing still needs refinement.
- Public GitHub imports are subject to unauthenticated GitHub rate limits.

Reports support engineering judgment. They do not prove a PR is safe, catch every bug, or replace human review, CI, tests, or security review.

## Run locally

Install dependencies:

```text
npm install
```

Start the development server:

```text
npm run dev
```

Open:

```text
http://localhost:3000
```

Run a production build:

```text
npm run build
```

## Optional model configuration

Model-assisted report generation is optional.

Copy `.env.example` to `.env.local` and provide evaluator-owned values:

```text
OPENAI_API_KEY=
OPENAI_MODEL=
```

Leave both values empty to exercise deterministic fallback.

Never commit `.env.local` or real credentials.

## Project structure

```text
app/
  api/
    fetch-pr-diff/
    generate-report/
  new/
  report/
  workspace/
lib/
  report-generator.ts
  report-normalizer.ts
  report-quality.ts
  report-history.ts
  report-markdown.ts
  stack-inference.ts
  sample-pr-input.ts
docs/
  case-study.md
  demo-script.md
  distribution-assets.md
  evaluation.md
  evaluation-results.md
  cli-github-action-blueprint.md
  github-action-plan.md
  manual-evaluation.md
  public-pilot.md
  screenshot-checklist.md
  security-model.md
```

## Documentation

- [Design documentation and LVOS governance](docs/design/README.md)
- [Case study](docs/case-study.md)
- [Demo script](docs/demo-script.md)
- [Evaluation workflow](docs/evaluation.md)
- [Evaluation results](docs/evaluation-results.md)
- [Manual evaluation](docs/manual-evaluation.md)
- [Public pilot package](docs/public-pilot.md)
- [Security model](docs/security-model.md)
- [Distribution assets](docs/distribution-assets.md)
- [GitHub Action plan](docs/github-action-plan.md)
- [CLI and GitHub Action blueprint](docs/cli-github-action-blueprint.md)
- [Screenshot checklist](docs/screenshot-checklist.md)

## Roadmap

The current consolidation programme is:

1. Typography Proof and Core Type System
2. Application Shell and Navigation
3. Workspace Command Centre
4. Administrative Surfaces
5. Case File Convergence
6. Website and Product Continuity
7. Cross-Surface Visual QA and Migration Lock
8. Motion Constitution, Foundation and Tuning

The LVOS-1 through LVOS-7 static consolidation sequence is complete and approved as of 17 July 2026. LVOS v1.0 is APPROVED AND CLOSED. See the [LVOS final system audit](docs/design/LVOS_FINAL_SYSTEM_AUDIT.md) for the final route matrix, corrections, removal log and migration-lock decision.

The next programme is Visual Convergence, beginning with VC-1 Workspace and Command-Centre Refinement. Major Phase 4 and Phase 5 capability expansion may resume after the completed static migration lock unless an explicit bounded exception or later governance decision changes that order. Subsequent visual and motion work refines LVOS v1.0; it does not reopen the architecture.

See the [LVOS implementation roadmap](docs/design/LVOS_IMPLEMENTATION_ROADMAP.md) for scope, dependencies and acceptance criteria.
