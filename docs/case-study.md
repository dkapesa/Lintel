# Lintel case study

## Product thesis

AI-assisted development shifts the bottleneck from writing code to verifying it. Teams need more than a generated review summary: they need a defensible merge decision that connects changed behavior to evidence, missing tests, operational risk, and the right reviewer attention.

Lintel tests the thesis that a compact merge-readiness report can help reviewers answer three questions faster:

1. What could go wrong?
2. What evidence or tests are missing?
3. What must happen before merge?

## Why AI-assisted PRs need verification

Generated code is often syntactically convincing while remaining incomplete at system boundaries. Retry logic may duplicate a side effect. A fallback may hide provider failure. A new error response may break clients. Logging added for diagnosis may expose identifiers or tokens. A migration may be valid in isolation but unsafe to deploy.

These are review and readiness problems, not merely code-explanation problems. Lintel therefore treats AI as an enrichment layer around deterministic safety signals rather than as the sole decision-maker.

## What was built from V0.1 to V1.0

| Stage | Product capability |
| --- | --- |
| V0.1 | Premium static report-detail UI and typed demo data |
| V0.2–V0.3 | `/new` input flow, deterministic report generation, session storage, and recommendation consistency |
| V0.4–V0.6 | Server-side AI generation through native fetch, normalization, deterministic fallback, risk floors, and source visibility |
| V0.7 | Strict public GitHub PR URL import with server-side diff fetching |
| V0.8 | Operational-readiness assessment covering failure, detection, recovery, and impact |
| V0.9 | Evidence-based reviewer focus with false-positive pruning |
| V0.10 | Eight built-in samples for repeatable demos and evaluation |
| V0.11 | Internal report-quality checks and safe copy validation |
| V0.12–V1.0 | Pilot-ready copy, input-source labels, empty states, documentation, and portfolio workflow |
| V1.1 | Raw-diff-free browser-local history for the 10 most recent reports |
| V1.2 | Client-side Markdown report downloads using the existing safe summary formatter |

## Technical decisions

### Deterministic baseline first

Every request begins with local rules that inspect changed files, test-file presence, diff size, and targeted signals for provider failures, retries, API contracts, logging, authentication, migrations, payments, and frontend changes. This creates a minimum evidence set that remains available when AI is disabled or fails.

### AI as constrained enrichment

The server sends the diff and a concise baseline summary to the configured model. The prompt treats the diff as untrusted input and asks for structured JSON matching the report schema. AI can improve wording and add nuance, but normalization preserves baseline metadata and concrete safety findings.

### Normalization over trust

The normalizer clamps scores, derives risk levels, recomputes recommendations, retains test gaps, prevents operational downgrades, deduplicates arrays, and removes unsupported reviewer-focus areas. This design limits the impact of malformed, inconsistent, or overconfident model output.

### Privacy-conscious prototype storage

The raw diff exists only in the form and generation request. The browser stores the current report plus a bounded local report history, never the submitted patch. Copyable Markdown is capped, redacted, and checked for raw patch markers.

### Small dependency surface

The prototype uses Next.js, React, TypeScript, native `fetch`, and plain CSS. No AI SDK, component library, database, or client state framework was required for the validation slice.

## Evaluation approach

Lintel uses repeatable manual cases rather than anecdotal prompt testing alone:

- a clean utility change with tests;
- provider retry and duplicate-side-effect risk;
- authentication/session changes;
- database migrations;
- payment/refund behavior;
- API contract changes;
- logging/privacy risk;
- frontend analytics and TypeScript changes.

Each case has an expected recommendation range, risk level, finding themes, operational status, and reviewer focus. Additional tests cover AI success, deterministic fallback, malformed output, public GitHub imports, legacy stored reports, source labels, copy safety, and raw-diff absence.

The report-quality layer also checks internal invariants: score/level agreement, recommendation consistency, operational attention, reviewer-focus evidence, sensitive-path risk floors, security-review conflicts, and raw patch markers.

## How Lintel differs from generic AI code review

- It optimizes for a merge decision, not a prose summary.
- It establishes deterministic evidence before asking AI.
- It makes missing tests and merge conditions first-class outputs.
- It includes operational readiness and reviewer routing, not only code findings.
- It visibly distinguishes AI output, local fallback, and demo data.
- It validates the generated report itself before presenting it as shareable output.
- It fails safely to a useful local report when the model is unavailable or invalid.

## Future roadmap

The next meaningful product steps would be:

1. Pilot evaluation against public and anonymized real-world PRs.
2. Automated regression fixtures and quality metrics for false positives and missed risks.
3. Repository context and test-result ingestion without storing unnecessary source data.
4. Authenticated GitHub App support for private repositories and opt-in PR checks.
5. Team policy configuration for risk thresholds and required reviewers.
6. Server-side or team-shared report history, auditability, and feedback loops.
7. Production privacy controls, retention policy, access control, and provider governance.

Lintel should only expand into these areas after validating that teams find the report useful during real merge decisions.
