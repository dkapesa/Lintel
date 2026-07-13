# GitHub App local setup

Lintel’s GitHub App workflow is a local-development foundation for automated pull-request ingestion and analysis.

It does not add OAuth, user accounts, GitHub comments, merge blocking, or a production queue. Runtime records are stored in `.lintel-data/`, which is ignored by Git and intended only for local MVP testing.

## Environment

Add these values to `.env.local`:

```env
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
```

Use placeholder-free real values only in local environment files. Do not commit them.

Private keys may be stored with escaped newlines:

```env
GITHUB_APP_PRIVATE_KEY="<escaped private key with \\n newlines>"
```

## Development GitHub App settings

Create a GitHub App for local testing and configure:

- Webhook URL: your public HTTPS tunnel URL ending in `/api/github-app/webhook`
- Webhook secret: the same value as `GITHUB_WEBHOOK_SECRET`
- Repository permissions:
  - Contents: read-only
  - Pull requests: read and write
- Subscribe to events:
  - Installation
  - Installation repositories
  - Pull request

Pull requests write permission is used only to create or update one Lintel conversation comment on each pull request. Lintel does not request contents write, administration, checks write, actions write or merge permissions for this MVP.

For local testing, use an HTTPS tunnel such as ngrok or Cloudflare Tunnel to forward to your local Next.js server.

## What happens on webhook delivery

For verified webhook deliveries, Lintel:

1. Validates `X-Hub-Signature-256` before parsing JSON.
2. Normalises only the minimal event envelope.
3. Deduplicates by `X-GitHub-Delivery`.
4. Stores safe processing state in `.lintel-data/github-app-store.json`.
5. Uses a short-lived installation token server-side.
6. Fetches pull-request metadata and diff.
7. Runs the existing deterministic readiness generator.
8. Stores the completed report for later display/comment delivery work.
9. Creates or updates one pull-request conversation comment marked with:

```md
<!-- lintel:merge-readiness -->
```

Lintel looks for this marker before creating a new comment. It never edits or deletes comments that do not contain the marker.

Raw webhook payloads, installation tokens and raw diffs are not persisted.

## Commit-aware re-review

When the same pull request is analysed at a new head SHA, Lintel keeps the previous completed analysis and stores a bounded completed-run history for that PR.

Each completed run stores only safe report data needed for comparison:

- run ID
- repository and pull-request identity
- base and head SHA
- recommendation
- readiness score and risk level
- completed normalised report
- analysis source
- completion timestamp
- deterministic Readiness Delta where available

The local MVP keeps the latest 20 completed runs per pull request. It does not persist raw diffs, raw webhook payloads, GitHub tokens, App JWTs or authorization headers.

The first completed run is labelled as the initial readiness baseline. Later completed runs compare against the most recent earlier completed run for the same PR. The delta is deterministic and compares structured report fields such as recommendation, score, risk level, merge conditions, findings and missing tests. It classifies movement as:

- initial
- improved
- regressed
- mixed
- unchanged

Comparison is field-based and intentionally conservative. It does not perform line-by-line review diffs, fuzzy AI matching or AI-generated comparison text. If a comparison cannot be generated safely, the completed report remains available and the delta failure is recorded separately.

## Review Diff

For re-analyses after the initial baseline, Lintel also stores a focused Review Diff for the latest completed run when the immediately previous completed run is available.

The Review Diff compares structured report objects only:

- findings
- evidence signals
- missing or suggested tests
- merge conditions

Items are classified as added, cleared, changed, unchanged or reopened. Reopened is only used for merge conditions when bounded run history proves the condition existed earlier, disappeared from the immediately previous completed run, and returned in the current run.

The Review Diff is not a source-code diff. It does not fetch or persist raw diffs, compare patch hunks, render line-level changes, or use model-generated comparison text. Field identity is deterministic and normalised to avoid treating whitespace or casing differences as meaningful changes.

The local API exposes the latest Review Diff and run-specific Review Diff data from the `.lintel-data` store. Old V6.0 records and initial analyses remain readable, but they may not have a detailed Review Diff until a new completed head-SHA analysis is stored.

## Canonical review runs and reproducibility

Each completed review can carry a canonical run manifest. The manifest records safe provenance metadata:

- run ID and schema version
- source type, repository, PR number and safe source URL where available
- base and head SHA where available
- input, configuration and result fingerprints
- review mode and policy profile
- report generator, deterministic ruleset and report schema versions
- analysis source: deterministic, model, fallback or demo
- provider/model names where applicable
- previous run relationship
- processing timestamps
- reproducibility classification

The manifest never stores raw diffs, prompts containing source code, API keys, GitHub tokens, authorization headers, webhook secrets or hidden model reasoning.

Fingerprints are deterministic hashes over normalized safe snapshots. Raw diffs may be hashed transiently while a review is being generated, but the raw diff is not retained in the manifest or local report history.

Reproducibility classifications are explicit:

- exact
- traceable
- source-unavailable
- configuration-unavailable
- manual-input-not-retained
- historical-schema
- drift-detected
- failed

Manual pasted-diff runs are traceable by manifest and report fingerprint, but they are not replayable because the raw manual input is intentionally not retained. Model-assisted runs are traceable, not promised to reproduce exactly.

For GitHub App automated deterministic runs, Lintel can attempt a local verification. Verification re-fetches the current PR metadata and diff through the installation token, re-runs deterministic analysis when the stored head SHA still matches, and compares the reproduced result fingerprint to the canonical result fingerprint. Verification creates a new verification record and never mutates the original canonical run.

## Change Passport

Lintel can attach an optional Change Passport to manual, sample, public PR and GitHub App reviews.

A Change Passport is builder-declared context, not verified evidence. It may describe producer type, tool/model context, task intent, change summary, claimed validation, assumptions, known limitations, unresolved uncertainty and reviewer handoff notes.

GitHub PR bodies may include one fenced block:

````
```lintel-change-passport
{
  "producerType": "agent",
  "taskIntent": "Prevent duplicate refund creation after timeouts",
  "producer": {
    "tool": "Cursor",
    "model": "example-model"
  },
  "changeSummary": "Adds bounded retries around refund creation.",
  "claimedTests": [
    "npm test -- refund-service"
  ],
  "assumptions": [
    "The provider honours the existing idempotency key."
  ],
  "unresolvedUncertainty": [
    "A timeout may occur after the provider accepted the request."
  ],
  "handoffNotes": "Review idempotency and timeout recovery."
}
```
````

Lintel parses only the marked block, validates supported fields, enforces text and item limits, ignores unsupported fields and safely ignores malformed JSON. Missing or malformed passports do not fail PR analysis.

The canonical review-run manifest stores only safe passport provenance: passport ID, schema version, source, producer type, completeness and fingerprint. The complete normalized passport is stored only with the local report/run record. Raw diffs, prompts, transcripts, hidden reasoning, credentials and tokens are never retained as passport data.

Passport claims do not alter readiness scoring, recommendations, blockers or merge conditions. Lintel compares declarations with structured report signals using deterministic field matching and labels claims as supported, unverified, declared, observed by Lintel but undeclared, or not applicable.

## Evidence hierarchy and assumptions

Lintel records a typed evidence hierarchy for new canonical runs. Evidence classes are ordered by provenance strength:

1. Externally verified
2. Directly observed
3. Human confirmed
4. Builder declared
5. Model inferred
6. Assumption
7. Unknown

The hierarchy describes provenance and strength. It does not automatically prove a conclusion, clear a merge condition, change readiness scoring or change the recommendation.

The Assumption Registry records unresolved dependencies from Change Passport assumptions, declared uncertainty, selected merge conditions and findings that require proof. Assumption statuses are:

- open
- supported
- invalidated
- accepted
- superseded
- stale

Supported and accepted are deliberately different. Supported means evidence backs the proposition. Accepted means a human chose to proceed despite incomplete proof.

Canonical manifests store only safe evidence-model metadata: schema versions, fingerprints, counts by evidence class, active assumption IDs and open blocking/advisory assumption counts. They do not embed raw diffs, prompts, transcripts, credentials, webhook payloads or full unbounded metadata.

## Builder-verifier boundary

Lintel records a safe Builder-Verifier assessment for new canonical runs.

The assessment separates:

- builder context declared through the Change Passport;
- deterministic Lintel verification;
- optional model-assisted verification;
- local human decisions where present.

Separation dimensions are non-numeric:

- separate;
- shared;
- unknown;
- not applicable.

Tracked dimensions include tool, provider, model, execution/run, deterministic-analysis and human-review boundaries.

Overall classifications are:

- independently verified;
- partially separated;
- same-context verification;
- separation unknown;
- not applicable.

The classification is conservative. A different provider or model is one separation dimension, not proof of complete independence. Self-review or shared model context is not presented as independent verification. Unknown metadata remains unknown.

The deterministic Lintel baseline is recorded as independently applied to observed change input and does not rely on builder claims. Builder declarations do not suppress findings, clear missing tests, prove assumptions, change risk bands or change recommendations.

Canonical manifests store only safe boundary provenance: schema version, assessment ID, fingerprint, classification, builder producer type, verifier types, dimension summary and deterministic-baseline presence. They do not store prompts, transcripts, raw diffs, secrets, tokens or arbitrary execution metadata.

## Machine-readable Merge Contract

Each newly completed review can include an Evidence-backed Merge Contract.

The contract is a versioned, deterministic snapshot of the requirements that remain before the reviewed change can move forward. It records blocking and advisory clauses, why each clause exists, what evidence would satisfy it, currently linked evidence, related assumptions, affected surfaces, owner cues, head-SHA applicability and safe fingerprints.

The contract is not the final human decision. It does not change Lintel’s recommendation, score, risk band or GitHub mergeability. Accepted risk is tracked separately from satisfied requirements, builder declarations are not automatically sufficient evidence, and model-inferred context is not treated as direct observation.

The local store and report history persist only the normalized safe contract object. They do not persist raw diffs, prompts, transcripts, webhook payloads, GitHub tokens, App JWTs, authorization headers or secrets.

Canonical manifests store only safe Merge Contract provenance: schema version, contract ID, contract fingerprint, current evaluation fingerprint, contract state, blocking/advisory clause counts, satisfied count, accepted-risk count and open assumption-linked clause count. Older runs remain readable and may show historical or unavailable contract metadata.

The GitHub App API exposes contract data through the existing safe read path:

`/api/github-app?view=merge-contract&pullRequestId=<id>&runId=<run-id>`

The GitHub decision comment and Slack/GitHub handoff surfaces include only a concise contract summary such as open blocking clauses, advisory clauses, satisfied clauses and unresolved assumptions. They do not include the full contract JSON.

## Repository enable and disable

The local GitHub App management surface can enable or disable installed repositories for Lintel processing.

This changes only Lintel’s local `.lintel-data` state. It does not alter the GitHub App installation, repository permissions or GitHub settings.

Disabled repositories remain visible and historical analyses remain available. Future relevant PR webhook events are acknowledged without analysis or comment publishing until the repository is re-enabled.

## Comment behaviour

After a completed analysis, Lintel posts or updates one marked pull-request comment containing the merge-readiness decision, blockers, missing tests, conditions before merge, reviewer focus and next action.

Lintel does not block merging by default and does not post inline comments.

## Local MVP limitation

The `.lintel-data` store is a single-process local file store. It is not a production database, distributed queue, audit log, or multi-instance persistence layer.
