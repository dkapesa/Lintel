# Lintel CLI and GitHub Action workflow blueprint

Status: planning documentation only. The CLI and GitHub Action do not exist yet.

Lintel is a local-first merge-readiness workspace for pull requests. The intended CI path is CLI-first, with a thin GitHub Action wrapper.

Core positioning:

> Agents create code. Lintel decides what is ready to merge.

## Intended workflow

The first CI workflow should automate the current strongest Lintel artifact: a structured merge-readiness report that can be posted into a pull request conversation.

Target flow:

1. A pull request is opened or updated.
2. GitHub Actions runs inside the user's repository.
3. The workflow checks out the PR code or fetches the PR diff.
4. The Lintel CLI runs inside CI.
5. Lintel analyzes the PR diff.
6. Deterministic checks run by default.
7. Optional model-assisted analysis runs only when the user provides their own model key.
8. Lintel generates Markdown from a structured merge-readiness report.
9. The Action posts or updates one PR summary comment.

The comment should feel like the existing Lintel report surface: recommendation, risk band, Conditions before merge, key findings, Test plan, operational readiness, reviewer focus and report quality.

## Architecture direction

Recommended architecture:

```text
shared analysis core -> CLI -> thin GitHub Action wrapper
```

The CLI should contain the reusable behavior. The GitHub Action should mainly handle GitHub context, diff retrieval and PR comment upsert.

This avoids creating separate web and CI report logic.

## Future CLI shape

Illustrative command:

```text
npx lintel review --base main --head HEAD --format markdown
```

Other likely modes:

```text
npx lintel review --diff pr.diff --profile standard --format markdown
npx lintel review --diff pr.diff --profile high-assurance --format json
```

Expected CLI behavior:

- accepts PR metadata and diff input;
- runs deterministic analysis by default;
- optionally uses model-assisted synthesis when a provider key is present;
- writes Markdown or JSON to stdout or a file;
- avoids logging raw diff content;
- fails clearly when diff size limits are exceeded;
- never silently truncates analysis without saying so.

## Illustrative GitHub Actions workflow

This example is documentation only. It is not currently implemented or tested.

```yaml
name: Lintel merge readiness

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  lintel:
    name: Generate merge-readiness report
    runs-on: ubuntu-latest

    steps:
      - name: Check out pull request
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Lintel report
        env:
          # Optional. No key means deterministic-only mode.
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: ${{ vars.OPENAI_MODEL }}
        run: |
          npx lintel review \
            --base "${{ github.base_ref }}" \
            --head HEAD \
            --profile standard \
            --format markdown \
            --output lintel-report.md

      - name: Post or update PR comment
        run: |
          npx lintel github comment \
            --file lintel-report.md \
            --marker "<!-- lintel-report -->"
```

Implementation note: a v1 Action may fetch the PR diff through the GitHub API instead of checking out the repository if that is simpler and safer. If checkout is used, the Action must treat PR content as data and must not execute untrusted code from the PR head.

## PR comment shape

The Action should post or update one comment, not one comment per finding.

Comment outline:

```markdown
<!-- lintel-report -->

## Lintel merge-readiness report

**Recommendation:** TESTS_REQUIRED  
**Risk band:** HIGH  
**Source:** Deterministic, or deterministic + model-assisted

### Conditions before merge
- [ ] Prove retries cannot create duplicate redemptions or issue duplicate discount codes
- [ ] Verify provider handling for timeout, 5xx and unavailable responses
- [ ] Confirm the frontend-safe API error contract remains stable

### Key findings
- Rule detected: Duplicate side-effect risk around retry and redemption flow.
- Rule detected: Provider failure handling needs focused tests.

### Test plan
- Missing coverage: retry after provider timeout must not issue duplicate codes.
- Suggested test: test_provider_timeout_does_not_issue_duplicate_code

### Operational readiness
ATTENTION - recovery, observability or customer impact needs review.

### Reviewer focus
Primary: Backend reliability  
Secondary: API contract, Security/privacy

### Report quality
PASS
```

Long sections can use collapsible details blocks later, but v1 should keep the artifact short.

## Trust boundaries

The first CI implementation should preserve a simple trust story.

- No hosted Lintel server is required for v1.
- Customer code stays inside the user's repository and CI environment.
- No Lintel server should receive or store customer diffs in v1.
- Raw diffs should not be stored as durable app data.
- Raw diffs should not be uploaded as workflow artifacts.
- Raw diffs should not be written to logs.
- Model-assisted analysis should be opt-in with the user's own provider key.
- No key means deterministic-only mode.
- Deterministic-only mode should be first-class, not treated as broken.

If model-assisted analysis is enabled, the diff may be sent to the user's configured model provider. That must be explicit.

## GitHub security guidance

v1 should use `pull_request`.

v1 should not use `pull_request_target`.

Reasons:

- `pull_request_target` can expose secrets to fork PR risk if misused.
- PR diffs can contain attacker-controlled text.
- The Action must treat diff content as data, not instructions.
- The Action must not execute, eval, import or run code from the PR head.
- If a config file is supported later, read it from the base branch.

Minimal permissions for comment mode:

```yaml
permissions:
  contents: read
  pull-requests: write
```

Add `checks: write` only if a neutral check-run is implemented.

## What v1 should avoid

- No hosted diff processing.
- No GitHub App.
- No private repo SaaS import.
- No inline PR comments.
- No noisy comment-per-finding behavior.
- No blocking required status checks by default.
- No merge blocking by default.
- No telemetry.
- No team dashboard.
- No custom organization policy engine.

The first version should prove whether a concise Conditions before merge artifact is useful inside real PR conversations.

## Relationship to the current web app

The current web app remains the local product surface:

- public GitHub PR import;
- pasted diff analysis;
- sample reports;
- local Risk inbox;
- report working surface;
- Markdown export;
- security model documentation.

The future CLI/Action path should reuse the same report concepts rather than creating a separate CI-only product.

## Implementation checkpoint

Do not build the Action until these are true:

- the report artifact remains stable;
- Markdown export is stable;
- raw-diff-free output checks are reliable;
- at least one pilot user asks for PR-thread automation;
- the implementation can preserve the trust boundaries above.
