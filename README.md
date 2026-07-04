# Lintel

**Lintel is a local-first merge-readiness workspace for engineering teams.**

It turns public GitHub pull requests, pasted diffs, and built-in evaluation scenarios into structured reports that help reviewers decide whether a change is safe, tested, operationally ready, and ready to merge.

Lintel does not replace human review, CI, security review, or tests. It makes the merge decision more explicit, evidence-grounded, and easier to share.

## Why Lintel exists

Modern engineering teams can create code faster than they can confidently verify it.

A pull request may look reasonable while still hiding missing tests, unsafe retries, unstable API contracts, sensitive logging, migration risk, poor observability, or unclear recovery paths. Reviewers are often left answering the most important question manually:

> Is this change actually ready to merge?

Lintel is designed around that decision.

Instead of producing a generic code summary, Lintel generates a merge-readiness report covering:

- risk and recommendation
- missing tests
- operational readiness
- reviewer focus
- report quality
- conditions before merge

## What Lintel does

Lintel evaluates a pull request and produces a structured report with:

- `APPROVE`, `REVIEW_REQUIRED`, or `TESTS_REQUIRED` recommendation
- risk score, risk level, confidence, and evidence-backed findings
- missing-test detection and suggested tests
- security, reliability, and maintainability review states
- operational readiness analysis covering failure modes, detection, observability, recovery, rollback, and customer or data impact
- reviewer-focus guidance for areas such as backend reliability, API contracts, security/privacy, data/migrations, frontend integration, platform/observability, and domain logic
- report-quality checks that validate internal consistency before the result is shared
- copyable and downloadable Markdown summaries
- browser-local report history
- a local reports workspace for browsing recent reports

## Product flow

1. Open `/new`.
2. Load a built-in scenario, import a public GitHub PR, or paste a unified diff.
3. Choose a review profile.
4. Generate a report.
5. Review the result on `/report`.
6. Browse previous local reports in `/workspace`.
7. Copy or download the Markdown summary for sharing.

## Core features

### PR input

- Public GitHub PR import with strict URL validation
- Manual pasted diff workflow
- Eight built-in evaluation samples
- Stack/context inference for imported PRs
- Editable PR title, repository, language, framework, and review profile

### Review profiles

Lintel supports lightweight review policy profiles:

- Standard
- High assurance
- Payments/refunds
- Auth/security
- Data/migrations
- Frontend/API consumer

Profiles act as risk lenses. They strengthen relevant checks when supporting evidence exists, without creating unsupported findings.

### Merge-readiness reports

Each report includes:

- final merge recommendation
- risk score and risk level
- executive summary
- changed files
- risk findings
- engineering review states
- operational readiness
- reviewer focus
- report quality checks
- missing tests
- suggested tests
- conditions before merge

### Local workspace

The `/workspace` page provides a local report workspace backed by browser storage.

It shows recent reports with:

- PR title
- repository
- recommendation
- risk
- operational status
- reviewer focus
- report quality
- input source
- review profile
- creation time

Reports can be opened, deleted, or cleared locally.

## Architecture

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
  -> localStorage stores up to 10 raw-diff-free report history entries
  -> /report renders the selected report
  -> /workspace lists recent local reports
```

There is currently no database, authentication layer, background worker, billing system, GitHub App, or private repository access.

## Guardrails and fallback

Lintel creates a deterministic baseline before any optional model call.

The normalizer then:

- preserves submitted PR metadata and changed files
- merges concrete baseline findings, tests, and merge conditions
- derives risk level from the final risk score
- prevents unsafe recommendation upgrades
- prevents operational-readiness downgrades
- prunes unsupported reviewer-focus areas
- checks report consistency before rendering or export
- blocks raw patch markers from shareable outputs

If credentials are missing, a provider request fails, JSON is malformed, or output does not meet the expected structure, Lintel falls back to the deterministic report.

## Public GitHub PR import

`/new` accepts public GitHub pull request URLs in this format:

```
https://github.com/<owner>/<repository>/pull/<number>
```

The server validates the host and path, reconstructs trusted GitHub URLs, fetches the public `.diff`, and attempts an unauthenticated metadata lookup for the PR title.

Private repositories and authenticated GitHub access are not currently supported.

## Privacy and storage

Lintel is local-first in its current form.

- Raw diffs are used during report generation.
- Raw diffs are not stored in `sessionStorage`.
- Raw diffs are not stored in local report history.
- Raw diffs are not included in copied Markdown summaries.
- Raw diffs are not included in downloaded Markdown reports.
- Current report storage uses `lintel.generatedReport.v1`.
- Local report history uses `lintel.reportHistory.v1`.
- Local history stores generated reports, source/input labels, timestamps, and minimal display metadata.

When model-assisted analysis is enabled, the submitted diff is sent to the configured model provider for analysis. This prototype does not claim that the provider does not retain submitted data.

Do not submit secrets, private source code, credentials, or sensitive production data to this prototype.

## Evaluation

Lintel includes a manual evaluation workflow and observed evaluation results.

Current documented scenarios cover:

- clean utility changes
- provider failure and retry risk
- duplicate side-effect risk
- public GitHub PR import
- frontend/API consumer changes
- manual pasted diffs
- operational-readiness checks
- reviewer-focus regressions
- report-quality checks
- raw-diff privacy checks

Useful evaluation documents:

- Evaluation workflow
- Evaluation results
- Manual evaluation

## Current limitations

Lintel is a prototype and has important limitations:

- Heuristics and model output can miss or misclassify risk.
- No private repository access.
- No GitHub App.
- No webhooks.
- No automatic PR comments.
- No authentication or team accounts.
- No server-side saved report history.
- No billing.
- No audit log.
- No repository-wide dependency graph.
- No test execution.
- No static-analysis engine.
- Public GitHub imports are subject to unauthenticated rate limits.
- Reports support engineering judgment but are not a security, compliance, or production-readiness guarantee.

## Run locally

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Open:

```
http://localhost:3000/new
```

Run a production build:

```
npm run build
```

## Optional model configuration

Model-assisted report generation is optional.

Copy `.env.example` to `.env.local` and provide evaluator-owned values:

```
OPENAI_API_KEY=
OPENAI_MODEL=
```

Leave both values empty to exercise deterministic fallback.

Never commit `.env.local` or real credentials.

## Project structure

```
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
  evaluation.md
  evaluation-results.md
  manual-evaluation.md
  screenshot-checklist.md
```

## Documentation

- Case study
- Demo script
- Evaluation workflow
- Evaluation results
- Manual evaluation
- Screenshot checklist

## Roadmap

Near-term:

- complete evaluation results for all built-in scenarios
- improve reviewer-focus routing for frontend/API consumer changes
- polish workspace and report UI
- refine product copy and positioning
- prepare deployment-ready screenshots and case study

Future:

- shared reports
- authentication
- database-backed report history
- private repository support
- GitHub App integration
- automatic PR comments
- CI integration
- team policy settings
- model/provider configuration
- organization-level risk and quality analytics

## Positioning

Lintel is not a coding agent and not a generic AI code review tool.

Coding agents help teams create code faster.

Lintel helps teams decide what is ready to merge.
