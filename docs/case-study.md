# Lintel case study

## Overview

Lintel is a local-first merge-readiness workspace for engineering teams.

It turns public GitHub pull requests, pasted diffs, and built-in evaluation scenarios into structured reports that help reviewers decide whether a change is safe, tested, operationally ready, and ready to merge.

The product is designed around a simple engineering question:

> Is this pull request ready to merge?

Lintel does not replace human review, CI, security review, or tests. It makes the merge decision more explicit, evidence-grounded, and easier to share.

## Product thesis

Modern engineering teams can create code faster than they can confidently verify it.

Coding agents, autocomplete systems, generated patches, and faster developer workflows increase output, but they do not automatically increase merge confidence. The bottleneck shifts from writing code to verifying behavior, risk, test coverage, operational readiness, and review ownership.

Lintel tests the thesis that a compact merge-readiness report can help reviewers answer five questions faster:

1. What changed?
2. What could go wrong?
3. What evidence or tests are missing?
4. Who or what area needs focused review?
5. What must happen before merge?

## Problem

Pull requests can look plausible while still hiding important engineering risk.

Examples include:

- retry logic that duplicates a customer-facing side effect
- fallback handling that hides provider failure
- client-facing API contracts that change without compatibility review
- logs that expose identifiers, tokens, or sensitive values
- migrations that are valid locally but risky to deploy
- frontend or documentation changes that alter public consumer behavior
- large changes that are too broad for a single review pass
- changes with no focused tests for the new behavior

These are not only code-explanation problems. They are merge-readiness problems.

Lintel is designed to help reviewers move from:

> What does this diff do?

to:

> What needs to be true before this can safely merge?

## What was built

Lintel evolved from a static report UI into a local-first merge-readiness workspace.

| Stage | Product capability |
| --- | --- |
| V0.1 | Static report-detail UI with typed demo data |
| V0.2 to V0.3 | `/new` input flow, deterministic report generation, session storage, and recommendation consistency |
| V0.4 to V0.6 | Server-side model-assisted generation, normalization, deterministic fallback, risk floors, and source visibility |
| V0.7 | Strict public GitHub PR URL import with server-side diff fetching |
| V0.8 | Operational-readiness assessment covering failure, detection, recovery, rollback, and impact |
| V0.9 | Evidence-based reviewer focus with false-positive pruning |
| V0.10 | Eight built-in samples for repeatable demos and evaluation |
| V0.11 | Internal report-quality checks and safe copy validation |
| V0.12 to V1.0 | Pilot-ready copy, input-source labels, empty states, documentation, and portfolio workflow |
| V1.1 | Raw-diff-free browser-local report history for the 10 most recent reports |
| V1.2 | Client-side Markdown report downloads using the safe summary formatter |
| V1.3 | Manual evaluation workflow for repeatable regression testing |
| V1.4 | Landing page refresh and clearer product positioning |
| V1.5 | Stack/context inference for imported pull requests |
| V1.6 | Evidence-gated review policy profiles carried through reports, history, and exports |
| V1.7 | Observed evaluation-results documentation |
| V1.8 | Local reports workspace for browsing, opening, deleting, and clearing recent reports |

## Current product flow

1. Open `/new`.
2. Load a built-in sample, import a public GitHub PR, or paste a unified diff.
3. Review or edit PR metadata.
4. Select a review profile.
5. Generate a merge-readiness report.
6. Review the result on `/report`.
7. Copy or download the Markdown summary.
8. Browse recent local reports in `/workspace`.

## Core capabilities

### Pull request input

Lintel supports three input modes:

- built-in evaluation samples
- public GitHub PR import
- manually pasted unified diffs

Public GitHub imports are strictly validated and only support URLs in this format:

```text
https://github.com/<owner>/<repository>/pull/<number>
```

The server reconstructs trusted GitHub URLs internally before fetching the public diff.

### Stack and context inference

For imported pull requests, Lintel infers likely stack context from changed file paths and diff signals.

Current inference targets include:

- TypeScript / Next.js
- TypeScript / React
- Python / FastAPI
- TypeScript / Node.js
- SQL / Database migration
- Markdown / Documentation

The inferred values remain editable and do not overwrite manual user edits.

### Review profiles

Lintel supports lightweight review policy profiles:

- Standard
- High assurance
- Payments/refunds
- Auth/security
- Data/migrations
- Frontend/API consumer

Profiles act as evidence-gated risk lenses. They strengthen relevant checks when supporting evidence exists, without creating unsupported findings.

### Merge-readiness reports

Each report includes:

- final recommendation
- risk score and risk level
- confidence
- executive summary
- changed files
- evidence-backed findings
- missing tests
- suggested tests
- security, reliability, and maintainability review states
- operational readiness
- reviewer focus
- report quality checks
- conditions before merge

### Local reports workspace

The `/workspace` page turns local report history into a lightweight product workspace.

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

## Technical architecture

Lintel uses a small Next.js App Router architecture with TypeScript and plain CSS.

```
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

## Technical decisions

### Deterministic baseline first

Every generation request begins with deterministic rules.

The baseline inspects:

- changed file paths
- test-file presence
- diff size
- provider failure signals
- retry and duplicate side-effect signals
- API contract signals
- logging and privacy signals
- authentication/session signals
- migration/schema signals
- payments/refund/domain-side-effect signals
- frontend and documentation signals

This creates a minimum evidence set that remains available when model-assisted analysis is disabled, unavailable, malformed, or unsafe.

### Model-assisted analysis as enrichment

Model-assisted analysis is optional.

When enabled, the server sends the diff and a concise baseline summary to the configured provider. The prompt treats the diff as untrusted input and requests structured JSON matching the report schema.

The model can improve wording, detect nuance, and enrich the report, but it is not treated as the sole decision-maker.

### Normalization over trust

Lintel normalizes the generated output before rendering.

The normalizer:

- preserves submitted PR metadata
- preserves changed files
- merges concrete baseline findings
- keeps baseline missing tests and merge conditions
- clamps risk scores
- derives risk levels from final scores
- prevents unsafe recommendation upgrades
- prevents operational-readiness downgrades
- deduplicates arrays
- prunes unsupported reviewer-focus areas
- keeps legacy reports safe

This limits the impact of malformed, inconsistent, generic, or overconfident model output.

### Report quality checks

Lintel validates the final report before presenting it as shareable output.

Current report-quality checks cover:

- score and risk-level consistency
- recommendation consistency
- missing-test requirements
- APPROVE reports with hidden blockers
- operational ATTENTION conflicting with approval
- reviewer-focus evidence support
- sensitive path risk floors
- security review conflicts
- raw patch marker leakage

This makes report quality an explicit product concern rather than an implicit assumption.

### Privacy-conscious local storage

Lintel is local-first in its current form.

The raw diff exists during generation, but it is not stored in current-report session storage or local report history.

Storage behavior:

- `sessionStorage` stores the current `{ report, source }`
- `localStorage` stores up to 10 recent report entries
- local history stores generated reports, source/input labels, timestamps, and minimal display metadata
- copied Markdown summaries do not include raw diffs
- downloaded Markdown reports do not include raw diffs

When model-assisted analysis is enabled, the submitted diff is sent to the configured provider for analysis. The prototype does not claim that the provider does not retain submitted data.

### Small dependency surface

The prototype uses:

- Next.js
- React
- TypeScript
- native `fetch`
- plain CSS
- browser `sessionStorage`
- browser `localStorage`

No AI SDK, database, auth provider, component library, client state framework, or background worker was required for this validation slice.

## Evaluation approach

Lintel uses repeatable manual evaluation rather than anecdotal prompt testing alone.

The evaluation set includes scenarios for:

- clean utility changes
- provider failure handling
- retry and duplicate side-effect risk
- authentication/session changes
- database migrations
- payment/refund behavior
- API contract changes
- logging/privacy risk
- frontend analytics and TypeScript changes
- public GitHub PR import
- manual pasted diffs

Each case records:

- expected recommendation
- observed recommendation
- expected risk level
- observed risk level
- operational readiness
- reviewer focus
- report quality
- pass/fail
- notes

The current evaluation documents are:

- Evaluation workflow
- Evaluation results
- Manual evaluation

## Observed evaluation results

The current observed pass includes four representative scenarios:

| Scenario | Input source | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| Clean utility change | Sample | APPROVE / LOW / CLEAR | APPROVE / 22 LOW / CLEAR | PASS |
| Provider retry and duplicate redemption risk | Sample | TESTS_REQUIRED / HIGH / ATTENTION | TESTS_REQUIRED / 78 HIGH / ATTENTION | PASS |
| Next.js sendGAEvent PR | GitHub PR import | TypeScript / Next.js inferred, no payment false positive | TESTS_REQUIRED / 52 MEDIUM / CLEAR, no Payments/domain logic | PASS |
| Clean manual pasted diff | Pasted diff | APPROVE / LOW / CLEAR | APPROVE / 22 LOW / CLEAR | PASS |

Key regressions covered:

- clean utility changes remain low risk
- clean APPROVE reports do not produce unnecessary suggested tests
- provider retry risk escalates correctly
- operational readiness is raised for retry/provider/logging risk
- GitHub PR import infers TypeScript / Next.js
- frontend/API consumer reports do not show unsupported Payments/domain focus
- manual pasted diff flow works
- report quality checks pass
- raw diff markers do not appear in the report UI

## How Lintel differs from generic code review tools

Lintel is not designed to be another generic code summary.

It differs in several ways:

- It optimizes for a merge decision.
- It establishes deterministic evidence before optional model analysis.
- It makes missing tests first-class.
- It makes operational readiness first-class.
- It makes reviewer focus first-class.
- It produces explicit conditions before merge.
- It validates report quality before sharing.
- It distinguishes model-assisted output, deterministic fallback, and demo data.
- It fails safely to a useful local report when provider calls are unavailable or invalid.
- It provides a local workspace for browsing recent reports.

The product is complementary to coding agents.

Coding agents help teams create code faster.

Lintel helps teams decide what is ready to merge.

## Current limitations

Lintel is still a prototype.

Current limitations include:

- heuristics and model output can miss or misclassify risk
- no private repository support
- no GitHub App
- no webhooks
- no automatic PR comments
- no CI integration
- no authentication
- no team accounts
- no server-side saved report history
- no billing
- no audit log
- no repository-wide context
- no dependency graph
- no test execution
- no static-analysis engine
- public GitHub imports are subject to unauthenticated rate limits

Reports support engineering judgment. They are not a security, compliance, or production-readiness guarantee.

## Future roadmap

The next meaningful product steps are:

1. Complete evaluation results for all eight built-in sample scenarios.
2. Add more public and anonymized real-world PR evaluations.
3. Improve reviewer-focus routing for frontend/API consumer changes.
4. Polish the workspace and report UI.
5. Prepare a deployable pilot version.
6. Add shareable report links.
7. Add database-backed report history.
8. Add authentication and private reports.
9. Add authenticated GitHub App support for private repositories.
10. Add opt-in automatic PR comments.
11. Add CI and test-result ingestion.
12. Add team policy configuration.
13. Add model/provider configuration.
14. Add organization-level risk and quality analytics.

Lintel should only expand into heavier SaaS infrastructure after validating that teams find the reports useful during real merge decisions.

## What this project demonstrates

Lintel demonstrates:

- full-stack product development with Next.js and TypeScript
- structured report generation
- deterministic guardrails around model output
- fallback behavior for provider failures
- product-level privacy constraints
- evidence-based risk classification
- operational-readiness modeling
- reviewer-routing logic
- local-first state management
- Markdown export workflows
- public GitHub PR import
- evaluation-driven product development
- documentation and case-study discipline

## Conclusion

Lintel started as a static report prototype and evolved into a local-first merge-readiness workspace.

The strongest validated product insight is:

> As engineering teams ship faster, the hard problem becomes deciding what is safe to merge.
> 

Lintel is an early attempt to build the verification layer for that workflow.
