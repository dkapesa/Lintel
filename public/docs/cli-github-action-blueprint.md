# Lintel CLI and GitHub Action workflow blueprint

Status: planning documentation only. The CLI and GitHub Action do not exist yet.

Lintel is a local-first merge-readiness workspace for pull requests. The intended CI path is CLI-first, with a thin GitHub Action wrapper.

## Intended flow

1. A pull request is opened or updated.
2. GitHub Actions runs inside the user's repository.
3. The workflow checks out the PR code or fetches the PR diff.
4. The Lintel CLI runs inside CI.
5. Lintel analyzes the PR diff.
6. Deterministic checks run by default.
7. Optional model-assisted analysis runs only when the user provides their own model key.
8. Lintel generates Markdown from a structured merge-readiness report.
9. The Action posts or updates one PR summary comment.

The comment should include recommendation, risk band, Conditions before merge, key findings, Test plan, operational readiness, reviewer focus and report quality.

## Architecture direction

```text
shared analysis core -> CLI -> thin GitHub Action wrapper
```

The CLI should contain reusable behavior. The GitHub Action should mainly handle GitHub context, diff retrieval and PR comment updates.

## Future CLI example

Illustrative command:

```text
npx lintel review --base main --head HEAD --format markdown
```

Other likely modes:

```text
npx lintel review --diff pr.diff --profile standard --format markdown
npx lintel review --diff pr.diff --profile high-assurance --format json
```

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

Implementation note: v1 may fetch the PR diff through the GitHub API instead of checking out the repository if that is simpler and safer. If checkout is used, the Action must treat PR content as data and must not execute untrusted code from the PR head.

## Trust boundaries

- No hosted Lintel server is required for v1.
- Customer code stays inside the user's repository and CI environment.
- No Lintel server should receive or store customer diffs in v1.
- Raw diffs should not be stored as durable app data.
- Raw diffs should not be uploaded as workflow artifacts.
- Raw diffs should not be written to logs.
- Model-assisted analysis should be opt-in with the user's own provider key.
- No key means deterministic-only mode.
- Deterministic-only mode should be first-class.

If model-assisted analysis is enabled, the diff may be sent to the user's configured model provider. That must be explicit.

## GitHub security guidance

v1 should use `pull_request`.

v1 should not use `pull_request_target`.

Reasons:

- `pull_request_target` can expose secrets to fork PR risk if misused.
- PR diffs can contain attacker-controlled text.
- The Action must treat diff content as data, not instructions.
- The Action must not execute, eval, import or run code from the PR head.

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
