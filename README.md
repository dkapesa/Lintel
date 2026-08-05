# Lintel

**Engineering verification for pull requests produced by engineers and coding agents.**

Lintel helps engineering teams determine whether a change is genuinely ready to merge. It connects code changes, findings, evidence, missing proof, explicit requirements, readiness and an accountable Human Decision.

> Agents create code. Lintel verifies what is ready.

Lintel is not a generic AI code review chatbot. It creates a structured verification record that helps reviewers understand what is known, what remains uncertain and what must be resolved before a pull request can merge.

![Lintel Workspace showing pull request 482 with a tests required recommendation, medium risk, open blocking requirements, and a pending Human Decision.](docs/assets/readme/lintel-workspace-overview.png)

*A read only sample Workspace keeps the pull request, risk, open proof, requirements and accountable decision in one review surface.*

## Product overview

|                    |                                                               |
| ------------------ | ------------------------------------------------------------- |
| Primary purpose    | Help engineers judge whether a pull request is ready to merge |
| Main demonstration | `/workspace?source=fixture`                                   |
| Canonical review   | Pull request `#482` in `example/b2b-redemption-api`           |
| Core approach      | Deterministic analysis with optional model assisted review    |
| Decision authority | Lintel recommends. The accountable engineer decides           |
| Project status     | Actively developed portfolio product                          |

## Why Lintel exists

Coding agents can increase implementation speed. Review confidence does not automatically increase with them.

A pull request may look plausible while still containing missing tests, unsafe retry behaviour, provider failure gaps, unstable contracts, sensitive logging, weak observability or unclear recovery paths.

The central question is not simply whether the code looks correct.

It is:

> What needs to be true before this change is genuinely ready to merge?

Lintel turns that question into a structured verification workflow.

## How verification works

Lintel organises review information through the following model:

**Change → Finding → Evidence → Missing proof → Requirement → Readiness → Human Decision**

### 1. Change

The reviewer begins with the pull request, affected files and relevant context.

### 2. Finding

Lintel identifies a concrete risk, gap or review concern.

### 3. Evidence

Each finding is connected to the information that supports it. Provenance remains visible so reviewers can distinguish rule detected evidence, model assisted evidence and supporting artefacts.

### 4. Missing proof

Lintel separates evidence that exists from proof that is absent, stale or still unverified.

### 5. Requirement

Important gaps become explicit requirements that can block readiness.

### 6. Readiness

The Workspace presents the current recommendation, risk, open requirements and decision readiness.

### 7. Human Decision

Lintel provides a recommendation. An accountable engineer retains authority over the final decision.

![Lintel evidence view showing a duplicate redemption finding, supporting evidence provenance, missing proof, and an open idempotency requirement.](docs/assets/readme/lintel-evidence-and-missing-proof.jpg)

*Findings, provenance, missing proof and merge requirements remain connected and inspectable.*

## Canonical review example

The primary product demonstration uses a fixed sample review:

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Repository     | `example/b2b-redemption-api`                             |
| Pull request   | `#482`                                                   |
| Title          | Add fallback handling for failed discount code retrieval |
| Recommendation | `TESTS_REQUIRED`                                         |
| Risk           | `46/100`, `MEDIUM`                                       |
| Requirements   | `4 open`, `2 blocking`                                   |
| Human Decision | `PENDING`                                                |

The review focuses on fallback handling for failed discount code retrieval. It includes a high severity concern about duplicate redemption risk, supporting evidence, missing proof and blocking requirements.

The case intentionally remains unresolved. Requirements do not clear and no Human Decision is recorded.

This keeps the demonstration stable, truthful and repeatable.

![Lintel Human Decision dialog for pull request 482 showing tests required, medium risk, open blockers, and no outcome selected.](docs/assets/readme/lintel-readiness-human-decision.png)

*Lintel recommends. The accountable engineer decides. The sample remains read only and unresolved.*

## Explore the product

### Recorded walkthrough

A concise product walkthrough follows the canonical pull request from the initial recommendation through evidence, requirements, readiness and the pending Human Decision.

<!-- Replace this URL after the walkthrough is published. -->

[Watch the Lintel product walkthrough](WALKTHROUGH_URL)

### Run the fixed sample locally

Install the project:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open the canonical sample review:

```text
http://localhost:3000/workspace?source=fixture
```

The fixture is read only sample data. It does not make network requests, clear requirements or record a Human Decision.

## Core capabilities

### Pull request analysis

| Capability                          | Current status                                |
| ----------------------------------- | --------------------------------------------- |
| Deterministic report generation     | Implemented                                   |
| Optional model assisted analysis    | Implemented through environment configuration |
| Structured model output             | Implemented                                   |
| Report normalisation and guardrails | Implemented                                   |
| Deterministic fallback              | Implemented                                   |
| Public GitHub pull request import   | Implemented                                   |
| Manual diff analysis                | Implemented                                   |
| Fixed sample reviews                | Implemented                                   |

### Verification and evidence

| Capability                           | Current status                                 |
| ------------------------------------ | ---------------------------------------------- |
| Findings with provenance             | Implemented                                    |
| Missing and unverified proof states  | Implemented                                    |
| Explicit uncertainty                 | Implemented                                    |
| Suggested tests and missing coverage | Implemented                                    |
| Merge requirements                   | Implemented                                    |
| Recommendation and risk assessment   | Implemented                                    |
| Readiness Delta                      | Implemented in the GitHub App persistence path |
| Structured Review Diff               | Implemented in the GitHub App persistence path |

### Decision support

| Capability                        | Current status      |
| --------------------------------- | ------------------- |
| Human Decision authority          | Implemented         |
| Local decision ledger             | Implemented         |
| Review and decision history       | Implemented locally |
| Read only canonical demonstration | Implemented         |
| Markdown and summary handoff      | Implemented         |

### GitHub integration

| Capability                         | Current status                                |
| ---------------------------------- | --------------------------------------------- |
| GitHub App authentication          | Implemented through environment configuration |
| Installation token exchange        | Implemented                                   |
| HMAC SHA256 webhook verification   | Implemented                                   |
| Delivery deduplication             | Implemented                                   |
| Same commit analysis deduplication | Implemented                                   |
| Pull request comment publishing    | Implemented as a prototype                    |
| Hosted production deployment       | Not claimed                                   |
| GitHub Action                      | Planned                                       |
| Command line interface             | Planned                                       |

## Product surfaces

| Route                       | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `/`                         | Public product overview                                           |
| `/workspace`                | Main verification Workspace                                       |
| `/workspace?source=fixture` | Canonical sample review                                           |
| `/new`                      | Create a review from a sample, public pull request or pasted diff |
| `/report`                   | Secondary Case File surface                                       |
| `/home`                     | Operational overview                                              |
| `/review-operations`        | Review record filtering and inspection                            |
| `/review-policies`          | Policy and governance inspection                                  |
| `/integrations`             | Integration capability and configuration status                   |
| `/slack-handoff`            | Local handoff and export concept                                  |
| `/settings`                 | Local configuration information                                   |

Legacy Workspace and visual laboratory routes are retained for historical and development purposes. They are not part of the primary recruiter demonstration.

## Architecture

Lintel separates analysis, verification and decision authority.

```text
Pull request or diff
        ↓
Deterministic analysis
        ↓
Optional model assisted synthesis
        ↓
Structured output validation
        ↓
Normalisation and guardrails
        ↓
Findings, evidence and missing proof
        ↓
Requirements and readiness
        ↓
Accountable Human Decision
```

### Analysis layer

Deterministic checks provide a consistent baseline. Model assisted analysis is optional and can improve synthesis when configured.

### Verification layer

Reports are normalised into a typed structure. Findings remain connected to evidence, provenance, uncertainty, missing proof and requirements.

### Decision layer

The Workspace presents the current recommendation and readiness state. It does not silently convert a recommendation into an engineer decision.

### Local product state

The main web workflow stores review state and decision history in the browser. Raw pull request diffs are not required for the canonical fixture.

### GitHub App prototype

The repository includes an environment configured GitHub App implementation with:

1. GitHub App JWT authentication
2. Installation token exchange
3. HMAC SHA256 webhook verification
4. Delivery deduplication
5. Duplicate analysis protection for the same commit
6. Pull request analysis persistence
7. Readiness Delta and Review Diff generation
8. Pull request comment creation and updates

The current prototype uses local filesystem persistence. The repository does not claim a hosted production service, shared team database or active customer deployment.

## Engineering decisions

### Deterministic analysis provides a reliability floor

Model access is not required for the core report path. When model configuration is absent or model analysis fails, Lintel can return deterministic output instead of failing silently.

### Model output is constrained

Model responses use a strict structured schema before they enter the report workflow. Normalisation and guardrails reduce internal inconsistencies.

### Evidence and uncertainty remain visible

Lintel distinguishes confirmed evidence from missing, stale, inferred or unverified proof. This prevents a confident summary from hiding weak support.

### Recommendation and authority remain separate

Lintel can recommend `APPROVE`, `REVIEW_REQUIRED` or `TESTS_REQUIRED`. The final decision remains an explicit human action.

### GitHub processing is designed to be idempotent

Webhook delivery identifiers and pull request commit state are used to avoid processing the same event or commit repeatedly.

### The canonical demonstration cannot alter product truth

The sample Workspace is fixed and read only. It cannot clear requirements or create a false completed decision.

### Security boundaries are stated directly

Model assisted analysis may send submitted content to the configured provider. Users should not submit credentials, secrets or sensitive production source code without understanding those provider and deployment boundaries.

## Technology

| Area                        | Technology                                       |
| --------------------------- | ------------------------------------------------ |
| Application framework       | Next.js App Router                               |
| Language                    | TypeScript                                       |
| Interface                   | React, CSS and CSS Modules                       |
| Model integration           | OpenAI Responses API                             |
| GitHub integration          | GitHub App authentication, REST API and webhooks |
| Local state                 | Browser storage                                  |
| Prototype integration state | Local filesystem persistence                     |
| Package management          | npm                                              |

This repository does not currently contain a Python or FastAPI backend, PostgreSQL database, SQLAlchemy models, Pydantic models, Docker configuration or Tailwind CSS setup.

## Run locally

### Requirements

A supported Node.js version is required. The repository does not currently declare an exact Node version.

### Install dependencies

```bash
npm ci
```

### Start development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Open the canonical demonstration

```text
http://localhost:3000/workspace?source=fixture
```

### Create a production build

```bash
npm run build
```

### Start the production build

```bash
npm run start
```

## Optional environment configuration

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### Model analysis

```text
OPENAI_API_KEY=
OPENAI_MODEL=
```

Leave these values empty to use deterministic analysis without model access.

### Public GitHub access

```text
GITHUB_TOKEN=
```

This can be used for authenticated GitHub API access where supported.

### GitHub App prototype

```text
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
```

Never commit `.env.local`, private keys, tokens or credentials.

## Repository structure

```text
app/
  api/
    fetch-pr-diff/
    generate-report/
    github-app/
  new/
  report/
  workspace/
  _public-r5/

lib/
  workspace-v2/
  report-generator.ts
  report-normalizer.ts
  report-quality.ts
  readiness-delta.ts
  evidence-hierarchy.ts
  human-decision-ledger.ts
  github-app-auth.ts
  github-app-webhook.ts
  github-app-store.ts
  github-app-comments.ts

public/
  r5/
    scenes/

docs/
  case-study.md
  evaluation.md
  evaluation-results.md
  security-model.md
  cli-github-action-blueprint.md
```

## Project status

Lintel is an actively developed portfolio product.

### Complete and stable

1. Main verification Workspace
2. Canonical PR #482 fixture
3. Deterministic report generation
4. Optional model assisted analysis
5. Report normalisation and fallback
6. Evidence, missing proof and requirement model
7. Human Decision workflow
8. Browser based review and decision history

### Implemented as prototypes

1. GitHub App authentication
2. Verified webhook handling
3. Idempotent pull request analysis
4. Pull request decision comments
5. Local GitHub App persistence
6. Readiness Delta
7. Structured Review Diff

### Active development

1. Consistency across public product routes
2. Recruiter presentation and documentation
3. Product screenshots and recorded walkthrough
4. Further integration and reliability validation

### Planned

1. Reusable command line interface
2. Thin GitHub Action wrapper
3. Hosted persistence
4. Shared team workflows
5. Private repository support
6. Production access control

## Current limitations

1. Lintel can miss or misclassify engineering risk.

2. Reports support engineering judgment. They do not prove that a pull request is safe.

3. The product does not replace tests, continuous integration, static analysis, security review or human code review.

4. Private repository import is not available through the public web flow.

5. The repository does not include end user authentication, team accounts or a hosted shared database.

6. The GitHub App implementation is a prototype and uses local filesystem persistence.

7. No GitHub Actions workflow or command line package is currently committed.

8. The product does not execute test suites or perform full static analysis.

9. A dedicated automated test and lint script is not currently exposed through `package.json`.

10. Model assisted analysis depends on the configured provider and may send submitted content outside the local application.

## What I designed and built

I designed and built Lintel as a long running product and engineering project focused on verification, reliability and accountable software delivery.

My work includes:

1. Defining the product problem, positioning and verification model

2. Designing the relationship between changes, findings, evidence, missing proof, requirements, readiness and Human Decision

3. Building the Next.js and TypeScript application

4. Implementing deterministic pull request analysis

5. Integrating optional structured model analysis

6. Building normalisation, guardrails and deterministic fallback behaviour

7. Designing and implementing the verification Workspace and Case File surfaces

8. Building evidence provenance and explicit uncertainty states

9. Implementing browser based review history and Human Decision records

10. Prototyping GitHub App authentication, verified webhooks, idempotent analysis and decision comments

11. Implementing Readiness Delta and structured Review Diff generation

12. Developing responsive, accessible and reduced motion product behaviour

13. Maintaining clear boundaries between recommendations, evidence and accountable human authority

The project demonstrates my ability to combine product judgment, interface design, backend integration, reliability engineering and long term technical execution.

## Further reading

1. [Case study](docs/case-study.md)

2. [Security model](docs/security-model.md)

3. [Evaluation workflow](docs/evaluation.md)

4. [Evaluation results](docs/evaluation-results.md)

5. [Command line and GitHub Action blueprint](docs/cli-github-action-blueprint.md)

## Author

Built by [Denis Kapesa](https://github.com/dkapesa).

[LinkedIn](https://www.linkedin.com/in/denis-kapesa) · [GitHub](https://github.com/dkapesa)
