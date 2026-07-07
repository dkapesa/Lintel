# Lintel case study

## Project status

Lintel is a V2.x local-first merge-readiness prototype for pull requests.

It helps engineering teams decide whether PRs are safe, tested, operationally ready and ready to merge.

The product is not a generic code review tool. It is designed around a narrower question:

> What needs to be true before this PR can safely merge?

Coding agents help teams create code faster. Lintel helps teams decide what is ready to merge.

Lintel does not replace human review, CI, security review or tests. It creates a decision artifact for review conversations.

## Problem

AI-assisted development increases PR volume and review ambiguity.

Generated or heavily assisted PRs can look plausible while still hiding:

- missing tests for new behavior;
- retry paths that duplicate customer-facing side effects;
- provider timeout and fallback handling gaps;
- client-facing API contract instability;
- sensitive logging;
- database migration or data-write risk;
- poor observability;
- unclear rollback or recovery paths.

The bottleneck moves from writing code to verifying whether a change is safe to merge. One senior reviewer can quickly become the constraint.

## Product thesis

Merge readiness is a separate product category from generic code review.

Code review tools help identify comments, suggestions and code-level improvements. Lintel focuses on the merge decision:

1. What is the recommendation?
2. What is the risk band?
3. What evidence supports the findings?
4. What tests or review work are missing?
5. What conditions must be met before merge?

The strongest validated wedge is:

> Lintel helps engineering teams decide whether a pull request is safe, tested, operationally ready and ready to merge.

## What I built

Lintel evolved from a static report UI into a local merge-readiness workspace.

Current product capabilities:

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

The current workflow:

1. Import a public GitHub PR, paste a diff or load a sample.
2. Generate a merge-readiness report.
3. Review Conditions before merge.
4. Copy conditions or export Markdown.
5. Track reports in the local Risk inbox.

## Architecture / guardrails

Lintel uses a small Next.js App Router architecture with TypeScript and plain CSS.

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

Key technical decisions:

- Deterministic baseline first.
- Model-assisted analysis only as enrichment.
- Normalization before rendering.
- Risk level derived from final risk score.
- Missing tests preserve `TESTS_REQUIRED`.
- Operational attention cannot be downgraded to clean approval.
- Unsupported reviewer-focus areas are pruned.
- Report quality checks validate consistency.
- Raw patch markers are blocked from shareable output.
- Provider failures fall back to deterministic reports.

This keeps the prototype useful without adding database, auth, billing, a GitHub App or private repo access before validation.

## Report artifact

The report has been restructured into a decision-first artifact.

Current hierarchy:

1. Recommendation, risk band and executive summary.
2. Conditions before merge.
3. Risk findings.
4. Test plan.
5. Operational readiness.
6. Reviewer focus.
7. Changed files.
8. Engineering review.
9. Report quality.
10. Closing summary.

Important report details:

- Risk band is shown before score detail.
- Conditions before merge are near the top and deduped.
- Copy conditions produces a PR-comment-ready Markdown block.
- Clean `APPROVE` reports stay quiet.
- Findings include provenance labels such as `Rule detected` and `Model assisted`.
- Missing coverage, suggested tests and reviewer checklist are consolidated into Test plan.
- Markdown copy/download follows the same V2 hierarchy.

External product feedback, including Fable/Claude review notes, shaped this shift toward a sharper decision artifact and a homepage that leads with “Decide what’s ready to merge.” The feedback was useful, but the implementation remained grounded in the product’s actual capabilities and limitations.

## Workspace / Risk inbox

The `/workspace` page started as a simple recent-report list. It now behaves more like a local merge-readiness inbox.

Current behavior:

- Groups duplicate runs by PR identity.
- Shows one row per tracked PR.
- Uses the latest report as the visible row.
- Shows a run count.
- Adds a triage strip for needs attention, tests required, ready and tracked PRs.
- Splits reports into Needs attention and Ready / cleared.
- Adds local-only status: Needs work, Conditions met, Merged and Dismissed.
- Supports filters by readiness state.
- Lets users open reports, copy conditions and delete local report groups.

This makes the workspace feel less like a log and more like a local view of what is blocked, ready or waiting on review.

## Evaluation evidence

Lintel uses manual regression evaluation rather than relying on anecdotal prompt tests.

Current documented scenarios include:

- clean APPROVE sample;
- provider retry / discount-code sample;
- public GitHub import for `vercel/next.js` PR 63226;
- manual pasted clean diff.

Validated outcomes:

- Clean utility changes remain `APPROVE`, `LOW`, operationally `CLEAR`, with no invented work.
- Provider retry / discount-code risk escalates to `TESTS_REQUIRED`, `HIGH`, operational `ATTENTION`.
- Frontend/API public PR imports do not show unsupported Payments/domain logic.
- Stack inference detects `TypeScript / Next.js` for the tested Next.js PR.
- Report quality checks pass across the evaluated scenarios.
- Raw diff markers do not appear in UI, copied conditions, copied summaries, downloaded Markdown, session storage or local history.

Evaluation documents:

- [Evaluation workflow](evaluation.md)
- [Evaluation results](evaluation-results.md)
- [Manual evaluation](manual-evaluation.md)

## Public pilot and distribution

Lintel is being prepared for founder-led public pilot outreach.

The current pilot wedge:

> Teams using coding agents are creating PRs faster than senior engineers can review them.

Target pilot users:

- tech leads and staff engineers at 3-15 person AI-heavy startups;
- agency technical directors shipping client work with Claude Code, Cursor, Codex or Copilot;
- technical founders using coding agents heavily;
- senior engineers who are review bottlenecks.

The strongest distribution artifact is Conditions before merge pasted into a PR thread.

Pilot and distribution docs:

- [Public pilot package](public-pilot.md)
- [Distribution assets](distribution-assets.md)

## Limitations

Lintel is still a prototype.

Current limitations:

- no auth;
- no billing system;
- no database;
- no private repo import;
- no GitHub App;
- no CI integration;
- no automatic PR comments;
- no team dashboard;
- no line-level diff hunk evidence;
- no test execution;
- no static-analysis engine;
- frontend-specific reviewer routing still needs refinement;
- model-assisted quality depends on the configured provider when enabled.

Reports support engineering judgment. They do not catch all bugs and do not prove a PR is safe.

## Roadmap

Near-term roadmap:

1. GitHub Action planning.
2. Minimal PR comment workflow.
3. Before/after verification.
4. More real public and anonymized PR evaluations.
5. Frontend/API reviewer-routing refinement.

Later roadmap:

1. Private repository support.
2. GitHub App.
3. Team workflow.
4. Database-backed report history.
5. Authentication.
6. Billing.
7. Model modes and provider configuration.

Lintel should only expand into heavier SaaS infrastructure after validating that teams use the report artifact during real merge decisions.

## What this project demonstrates

Lintel demonstrates:

- product positioning around a specific engineering decision;
- typed Next.js App Router implementation;
- deterministic report generation;
- model-assisted generation with fallback;
- guardrails and normalization around generated output;
- raw-diff privacy constraints;
- local-first browser storage;
- public GitHub PR import;
- Markdown export workflows;
- report-quality validation;
- evaluation-driven iteration;
- founder-led pilot packaging.

## Conclusion

Lintel started as a static report prototype and evolved into a local-first merge-readiness system.

The useful insight is not that every PR needs another reviewer. It is that the hard PRs need a clearer decision artifact:

> What are the risks, what evidence is missing, and what conditions must be met before merge?
