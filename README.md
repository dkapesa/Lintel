# Lintel

Lintel is a merge-readiness system for pull requests.

It helps engineering teams decide whether PRs are safe, tested, operationally ready and ready to merge.

Coding agents help teams create code faster. Lintel helps teams decide what is ready to merge.

Lintel is not a generic code review tool and does not replace human review, CI, security review or tests. It creates a decision artifact: recommendation, risk band, evidence, missing tests and Conditions before merge.

## Why Lintel exists

Modern teams can generate and modify code faster than they can confidently verify it.

A PR can look reasonable while still hiding:

- missing tests for new behavior;
- retry paths that duplicate customer-facing side effects;
- provider failure handling gaps;
- unstable API contracts;
- sensitive logging;
- migration or data-write risk;
- weak observability or unclear recovery paths.

The bottleneck shifts from creating code to deciding whether the change is ready to merge.

Lintel is built around that decision.

## What it does today

Current capabilities:

- Public GitHub PR import.
- Pasted diff analysis.
- Built-in sample reports.
- Review policy profiles.
- Stack/context inference.
- `APPROVE`, `REVIEW_REQUIRED` and `TESTS_REQUIRED` recommendations.
- Risk band and score detail.
- Conditions before merge.
- Copy conditions.
- Evidence-backed findings.
- Provenance labels such as `Rule detected` and `Model assisted`.
- Test plan with missing coverage, suggested tests and reviewer checklist.
- Operational readiness.
- Reviewer focus.
- Report quality checks.
- Copy summary.
- Download Markdown.
- Local workspace / Risk inbox.
- Grouped PR rows.
- Triage strip.
- Local status.
- Local-first report history.
- Raw diffs are not saved in local report history.

## Current workflow

1. Import a public GitHub PR, paste a diff or load a sample.
2. Generate a merge-readiness report.
3. Review Conditions before merge.
4. Copy conditions or export Markdown.
5. Track reports in the local Risk inbox.

## Trust and safety

Lintel is intentionally conservative about trust.

- Clean `APPROVE` reports stay quiet and do not invent generic review work.
- Findings can show provenance labels such as `Rule detected` and `Model assisted`.
- Report quality checks look for internal inconsistencies before sharing.
- Raw diffs are not stored in local report history.
- Raw diff markers are blocked from shareable report outputs.
- Current limitations are documented and visible.

When model-assisted analysis is enabled, the submitted diff is sent to the configured provider for analysis. This prototype does not claim that the provider does not retain submitted data.

Do not submit secrets, private source code, credentials or sensitive production data to this prototype.

## Architecture

Lintel is built with Next.js App Router, TypeScript and plain CSS.

```text
/new
  -> optional POST /api/fetch-pr-diff
  -> POST /api/generate-report
       -> deterministic baseline
       -> optional model-assisted analysis
       -> normalization and guardrails
       -> report-quality assessment
  -> sessionStorage stores the current { report, source }
  -> localStorage stores raw-diff-free report history
  -> /report renders the selected report
  -> /workspace groups reports into a local Risk inbox
```

There is currently no database, authentication layer, billing system, GitHub App, private repository access or CI integration.

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
- [Distribution assets](docs/distribution-assets.md)

## Current limitations

Lintel is still a prototype.

- Heuristics and model output can miss or misclassify risk.
- No private repository import.
- No GitHub App.
- No CI integration.
- No automatic PR comments.
- No authentication.
- No billing.
- No database-backed team workspace.
- No team dashboard.
- No line-level diff hunk evidence.
- No test execution.
- No static-analysis engine.
- Frontend-specific reviewer routing still needs refinement.
- Public GitHub imports are subject to unauthenticated rate limits.

Reports support engineering judgment. They are not a security, compliance or production-readiness guarantee.

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
http://localhost:3000/new
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
  manual-evaluation.md
  public-pilot.md
  screenshot-checklist.md
```

## Documentation

- [Case study](docs/case-study.md)
- [Demo script](docs/demo-script.md)
- [Evaluation workflow](docs/evaluation.md)
- [Evaluation results](docs/evaluation-results.md)
- [Manual evaluation](docs/manual-evaluation.md)
- [Public pilot package](docs/public-pilot.md)
- [Distribution assets](docs/distribution-assets.md)
- [Screenshot checklist](docs/screenshot-checklist.md)

## Roadmap

Near-term:

- GitHub Action planning.
- Minimal PR comment workflow.
- Before/after verification.
- More public and anonymized real-world PR evaluations.
- Frontend/API reviewer routing refinement.

Later:

- Private repo support.
- GitHub App.
- Team workflow.
- Database-backed report history.
- Authentication.
- Billing.
- Model modes and provider configuration.

Lintel should only expand into heavier SaaS infrastructure after validating that teams use the report artifact during real merge decisions.
