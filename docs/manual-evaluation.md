# Lintel manual evaluation

## Purpose

Lintel helps engineering teams assess whether AI-assisted pull requests are safe, tested, maintainable, and ready to merge. This prototype combines deterministic local rules with an optional server-side AI analysis route and always returns the existing typed report shape.

## Current prototype flow

1. Open `/new` and enter a PR title, repository, language/framework, and unified diff.
2. Select **Generate Report**.
3. The client sends the input to `POST /api/generate-report`.
4. The route creates a deterministic baseline, optionally attempts AI generation, and normalises the result.
5. If AI is unavailable or invalid, the route returns the deterministic report.
6. The client stores the returned report and its `ai` or `deterministic` source under `lintel.generatedReport.v1` in `sessionStorage`, then navigates to `/report`.
7. `/report` renders the generated report or the demo report when no generated report is available.

Run the app with `npm run dev` and use `http://localhost:3000/new`. Use browser developer tools to inspect the API response and session storage. Never paste a real secret into test evidence, screenshots, or this document.

## Report source visibility

- A successful AI response stores `{ report, source: "ai" }` and shows **AI generated**.
- An API or client-side deterministic fallback stores `{ report, source: "deterministic" }` and shows **Local fallback**.
- No generated report shows the bundled demo report with **Demo report**.
- Legacy bare Report objects remain readable and display **Local fallback** because their original source is unknown.
- Malformed storage is removed and the demo report is shown.

## Copy summary

Use **Copy summary** on `/report` to copy a concise Markdown report. Confirm the copied text includes the PR title, repository, source label, recommendation, risk score and level, executive summary, key findings, suggested tests and merge conditions.

- Finding, test and condition sections show at most five items, followed by `...and N more` when truncated.
- Empty sections show `None detected`.
- The button temporarily shows `Copied` only after the browser clipboard or hidden-textarea fallback succeeds.
- If both copy methods fail, the button shows `Copy failed`.
- Raw diff markers, submitted patch lines and secret values must not appear in the copied Markdown.
- Verify all three source labels: `AI generated`, `Local fallback` and `Demo report`.

## Expected outcome matrix

| Case | Expected source | Recommendation | Expected risk level | Expected finding themes |
| --- | --- | --- | --- | --- |
| Clean change with tests | `deterministic` when AI is disabled | `APPROVE` | `LOW` | None; security, reliability, and maintainability reviews are clear |
| Risky change without tests | `deterministic` when AI is disabled | `TESTS_REQUIRED` | `HIGH` | Missing tests, duplicate side effects, provider failures, API error contract, sensitive logging |
| Risky change with tests | `deterministic` when AI is disabled | `REVIEW_REQUIRED` | `HIGH` | Duplicate side effects, provider failures, API error contract, sensitive logging; no generic missing-test finding |
| Missing API key fallback | `deterministic` | `TESTS_REQUIRED` | `HIGH` | Same themes as the risky change without tests |
| AI source | `ai` | `TESTS_REQUIRED` for the risky change without tests | `HIGH` | Semantically equivalent risk themes; exact wording may vary |

Risk levels are derived from the final score: `LOW` 0–30, `MEDIUM` 31–60, `HIGH` 61–80, and `CRITICAL` 81–100.

AI reports are normalised against the deterministic baseline. Concrete baseline findings, test gaps, suggested tests and merge conditions remain present even when the AI omits them. A baseline `ATTENTION` review cannot be downgraded to `CLEAR`. Untested changes have a minimum `MEDIUM` score, while a `HIGH` baseline with multiple concrete findings remains `HIGH` and can fall by no more than five points.

## Clean APPROVE test case

Use:

- PR title: `Format display names consistently`
- Repository: `acme/profile-api`
- Language/framework: `Python / FastAPI`

```diff
diff --git a/app/utils/format_name.py b/app/utils/format_name.py
--- a/app/utils/format_name.py
+++ b/app/utils/format_name.py
@@ -1,2 +1,5 @@
+def format_name(first_name: str, last_name: str) -> str:
+    return f"{first_name.strip()} {last_name.strip()}".strip()

diff --git a/tests/test_format_name.py b/tests/test_format_name.py
--- a/tests/test_format_name.py
+++ b/tests/test_format_name.py
@@ -0,0 +1,5 @@
+from app.utils.format_name import format_name
+
+def test_format_name_trims_whitespace():
+    assert format_name(" Ada ", " Lovelace ") == "Ada Lovelace"
```

Expected:

- Recommendation: `APPROVE`
- Risk level: `LOW` (the deterministic score is 22; a valid AI score may vary within 0–30)
- Findings: none
- Missing tests: none
- Conditions before merge: none
- Review themes: neutral `CLEAR` copy only

## Shared risky discount-code diff

Use this diff for the next cases:

```diff
diff --git a/app/services/redemption_service.py b/app/services/redemption_service.py
--- a/app/services/redemption_service.py
+++ b/app/services/redemption_service.py
@@ -10,3 +10,16 @@
+try:
+    code = self.partner_client.fetch_discount_code(partner_id)
+except TimeoutError:
+    self.logger.warning("partner discount code timeout", extra={
+        "user_id": user_id,
+        "partner_id": partner_id,
+    })
+    code = self.partner_client.fetch_discount_code(partner_id)
+
+return self.repository.create_redemption(
+    user_id=user_id,
+    partner_id=partner_id,
+    code=code,
+)

diff --git a/app/clients/partner_code_client.py b/app/clients/partner_code_client.py
--- a/app/clients/partner_code_client.py
+++ b/app/clients/partner_code_client.py
@@ -8,3 +8,9 @@
+if response.status_code >= 500:
+    raise PartnerProviderError("provider unavailable")
+if response.status_code == 408:
+    raise TimeoutError("provider timeout")
+if not response.json().get("code"):
+    raise PartnerProviderError("empty discount code response")

diff --git a/app/api/redemptions.py b/app/api/redemptions.py
--- a/app/api/redemptions.py
+++ b/app/api/redemptions.py
@@ -20,3 +20,8 @@
+return JSONResponse(
+    status_code=503,
+    content={
+        "error_code": "discount_code_unavailable",
+        "retryable": True,
+    },
+)
```

Use this metadata:

- PR title: `Add fallback handling for failed discount-code retrieval`
- Repository: `acme/redemption-api`
- Language/framework: `Python / FastAPI`

## Risky TESTS_REQUIRED test case

Submit the shared risky diff without adding a test file.

Expected:

- Recommendation: `TESTS_REQUIRED`
- Risk level: `HIGH` (the deterministic score is 78; the current AI guardrail floor is 73)
- Finding themes:
  - Risk-specific tests are missing
  - Retry behaviour may duplicate redemptions or discount codes
  - External provider timeout, 5xx, unavailable, or empty-response handling needs review
  - The client-facing API error contract needs review
  - Structured logging of identifiers or discount-code data needs review
- Conditions include focused tests plus reliability, API-contract, and logging checks

## Risky REVIEW_REQUIRED test case

Append this test-file change to the shared risky diff:

```diff
diff --git a/tests/test_redemption_service.py b/tests/test_redemption_service.py
--- a/tests/test_redemption_service.py
+++ b/tests/test_redemption_service.py
@@ -0,0 +1,4 @@
+def test_provider_timeout_returns_retryable_error():
+    result = redeem_after_provider_timeout()
+    assert result.status_code == 503
+    assert result.body["retryable"] is True
```

Expected:

- Recommendation: `REVIEW_REQUIRED`
- Risk level: `HIGH` (the deterministic score is 64; the current AI guardrail floor is 61)
- Findings remain for duplicate side effects, provider failures, API error contracts, and sensitive logging
- No generic missing-test finding and no missing-tests list
- Conditions require focused human review rather than a generic instruction to add tests
- Production-risk evidence must not list `tests/test_redemption_service.py` as a relevant production file

## Missing API key fallback test

1. Confirm `.env.local` is absent and `OPENAI_API_KEY` and `OPENAI_MODEL` are unset. Do not print environment values.
2. Restart `npm run dev` so the server uses that environment.
3. Submit the shared risky diff without a test file.
4. Inspect the `POST /api/generate-report` response.

Expected:

- HTTP status: `200`
- Response source: `deterministic`
- Source badge: `Local fallback`
- A complete `report` object is returned
- Recommendation: `TESTS_REQUIRED`
- Risk level: `HIGH`
- Finding themes match the risky TESTS_REQUIRED case
- The UI navigates to `/report` and renders the returned report

Deterministic fallback summaries may state that findings were generated using **Lintel's local prototype rules**. This is expected prototype copy.

## AI source test

1. Use an ignored local environment file with evaluator-owned test credentials. Do not commit it or record its values:

   ```text
   OPENAI_API_KEY=<test-key>
   OPENAI_MODEL=<configured-model>
   ```

2. Restart `npm run dev` after setting the environment.
3. Submit the shared risky diff without a test file.
4. Inspect the `POST /api/generate-report` response.

Expected:

- HTTP status: `200`
- Response source: `ai`
- Source badge: `AI generated`
- The result matches the existing Report shape
- Submitted PR metadata and changed files are preserved
- Recommendation: `TESTS_REQUIRED`
- Risk level: `HIGH`
- Findings cover missing tests, duplicate side effects, provider failures, API error contracts, and sensitive logging; wording may differ from the deterministic report
- If the response source is `deterministic`, the AI attempt failed or could not be normalised, so this case has not passed even though fallback worked

Remove the local environment file after testing if it is no longer needed.

## Privacy check

Perform this check once with AI disabled and once with AI enabled:

1. Add a unique harmless comment to the submitted diff, such as `UNIQUE_DIFF_MARKER_<timestamp>`.
2. Submit the form and inspect the `POST /api/generate-report` response body.
3. Confirm the response contains only the report and source metadata, not the raw patch.
4. In browser developer tools, inspect `sessionStorage` key `lintel.generatedReport.v1`.
5. Search the stored JSON for the unique marker, `diff --git`, hunk headers such as `@@`, and exact added code lines.

Expected:

- The unique marker is absent from the API response and session storage
- The raw diff is absent from the API response and session storage
- Only the returned Report and its `ai` or `deterministic` source metadata are stored in `lintel.generatedReport.v1`
- Changed filenames and concise evidence terms may appear in the report; that is expected and is not raw-diff storage
- No raw diff or secret value appears in server or browser logs

## Public GitHub PR URL import

Lintel can import the diff for a public GitHub pull request before report generation. The supported format is:

```text
https://github.com/<owner>/<repository>/pull/<positive-number>
```

`www.github.com` is also accepted. Private repositories, GitHub authentication, query-dependent URLs, fragments, custom ports and additional path segments are not supported.

### Import flow

1. Open `/new`.
2. Paste a supported public pull request URL into **Public GitHub PR URL**.
3. Select **Fetch diff**.
4. Confirm the repository and diff fields are populated.
5. Confirm the title is populated when unauthenticated GitHub metadata is available. Metadata failure must not block a successful diff import.
6. Add or confirm the language/framework and edit any imported field if needed.
7. Select **Generate Report** and confirm the existing report flow works normally.

Fetching a diff must not submit the report, navigate away from `/new`, or call `/api/generate-report`.

### Import privacy and storage expectations

- The server fetches only reconstructed `github.com` and `api.github.com` URLs derived from validated PR coordinates.
- The raw diff is returned to the current form so the user can review and edit it.
- The import response must use `Cache-Control: no-store`.
- Raw diffs and secret values must not be written to server or browser logs.
- Importing alone must not write the raw diff to session storage.
- After generation, `lintel.generatedReport.v1` must still contain only `{ report, source }`, without the raw diff.

### Manual import tests

- Import a valid public PR and confirm repository, diff and available title metadata are populated.
- Confirm all populated fields remain editable.
- Confirm **Fetch diff** has compact loading, success and error states.
- Confirm the built-in sample picker and manual paste still work after importing.
- Generate an imported PR and confirm `/report`, source badges and **Copy summary** still work.
- Confirm an imported diff larger than `MAX_DIFF_CHARS` returns HTTP `413`.
- Confirm an empty or non-diff GitHub response is rejected.
- Confirm keyboard access, mobile layout and no console errors.

### Import failure cases

Expect a safe inline error without clearing existing form values for:

- Non-HTTPS URLs or non-GitHub hosts
- GitHub URLs containing credentials, custom ports, query parameters or fragments
- Malformed PR paths, zero or negative PR numbers, and additional path segments
- Missing, private or inaccessible pull requests
- GitHub rate limits
- Oversized diffs
- Upstream timeout, network failure or invalid diff content

## Operational readiness evaluation

Every newly generated report should include an **Operational readiness** section after Engineering Review. It covers failure modes, detection signals, observability gaps, recovery or rollback, customer or data impact, and owner or reviewer focus.

Operational readiness rules:

- Detection and recovery controls must be tied to evidence in the submitted diff.
- Gaps should appear only when risky behavior exists without a matching control.
- Reports must not invent dashboards, alerts, owners, rollback mechanisms, incidents or customer impact.
- Deterministic `ATTENTION` cannot be downgraded to `CLEAR` by AI output.
- Missing tests continue to produce `TESTS_REQUIRED`.
- Tests present with operational `ATTENTION` produce `REVIEW_REQUIRED`.
- `APPROVE` requires operational readiness to be `CLEAR`.
- Operational rules do not produce `BLOCK`.

### Clean operational readiness test

Generate the **Clean utility change** sample.

Expected:

- Recommendation: `APPROVE`
- Operational readiness: `CLEAR`
- No failure modes, observability gaps, recovery gaps, customer/data impact or additional owner focus
- Neutral empty-state copy is shown for empty operational areas
- The clean change is not penalized for lacking metrics, alerts or rollback controls when no risky operational behavior is detected

### Risky operational readiness test

Generate the **Provider failure / retry risk** sample without a test file.

Expected:

- Recommendation: `TESTS_REQUIRED`
- Operational readiness: `ATTENTION`
- Failure modes cover repeated side effects, provider failure behavior, API error semantics and sensitive logging where detected
- Detection signals include only evidenced logging, structured context, status codes or other controls
- Observability gaps identify missing metrics, alerts, traces or monitoring for the risky behavior
- Recovery or rollback identifies missing idempotency, compensation or rollback evidence without inventing a control
- Customer/data impact is expressed as potential impact, not an incident claim
- Owner or reviewer focus uses roles such as reliability, API or security review and does not invent people or teams

Append the documented test-file change and generate again. The recommendation should become `REVIEW_REQUIRED`; specific operational attention should remain.

### Evidenced controls test

Add harmless diff lines that explicitly introduce a metric or alert plus an idempotency guard, feature flag, rollback, restore or compensation path.

Expected:

- Only the controls present in the diff appear as detection or recovery evidence
- Matching observability or recovery gaps are reduced or removed
- Unrelated dashboards, alerts and rollback mechanisms are not invented

### Operational compatibility and privacy

- Load a legacy bare Report or stored report envelope without `operationalReadiness`; `/report` should render **Not assessed — regenerate this report** without an error.
- Copy summaries for new reports should include a concise Operational readiness section.
- Legacy copied summaries should state that operational readiness was not assessed.
- Copied markdown must not include raw diff markers, patch fragments or secret values.
- `lintel.generatedReport.v1` must continue to contain only `{ report, source }`; the raw diff must remain absent.
- Paste, samples, public GitHub import, source badges and Copy summary should continue to work.

## Reviewer focus evaluation

Every newly generated report should include a **Reviewer focus** section after Operational readiness and before Gaps. Focus items contain an engineering review area, `PRIMARY` or `SECONDARY` priority, and an evidence-based reason. They must not assign or invent people, usernames, owners or teams.

Deterministic review areas:

- Missing tests or risky backend, provider or retry behavior: **Backend reliability**
- API routes, status codes or error contracts: **API contract**
- Identifiers, logging, authentication, permissions or sensitive data: **Security/privacy**
- Database, migration, schema or data-write behavior: **Data/migration**
- Payments, redemptions, billing, refunds or side effects: **Payments/domain logic**
- Metrics, logs, alerts, traces, rollback controls or operational gaps: **Platform/observability**
- Frontend, UI, browser or analytics behavior: **Frontend integration**
- Documentation, OpenAPI, Swagger or public API documentation: **Docs/API consumer review**

### Reviewer focus sample tests

Generate the **Clean utility change** sample.

Expected:

- `reviewerFocus` is present, even when empty
- The UI shows neutral copy when no specialist focus is detected
- No person, owner or team is invented

Generate the **Provider failure / retry risk** sample without tests.

Expected:

- **Backend reliability** is `PRIMARY`
- **API contract** is `PRIMARY`
- **Security/privacy** appears for structured identifier or sensitive-value logging
- **Payments/domain logic** appears for redemption or discount-code side effects
- **Platform/observability** appears for detection, recovery or operational gaps
- Reasons refer to findings, changed behavior or operational readiness rather than generic assignments

Append the documented test file and generate again. Specific focus areas should remain where risks remain, even though the recommendation becomes `REVIEW_REQUIRED`.

### Reviewer focus targeted cases

- Add a database migration or schema change and confirm **Data/migration** appears.
- Add a frontend component, browser integration or analytics change and confirm **Frontend integration** appears.
- Add OpenAPI, Swagger, README or public API documentation changes and confirm **Docs/API consumer review** appears.
- Submit AI reviewer focus with a duplicate area and confirm deterministic and AI items are merged and deduplicated.
- Submit an unknown area or a reason containing an explicit owner, team assignment or username and confirm it is dropped by normalisation.

### Reviewer focus compatibility and copy

- Load a legacy report without `reviewerFocus`; `/report` should show a neutral not-assessed message without crashing.
- Copy summary should include Reviewer focus, capped consistently with other summary sections.
- Empty new-report focus should copy as `None detected`.
- Legacy focus should copy as not assessed.
- Raw diff markers, patch fragments and secrets must remain absent from copied markdown and session storage.

## Built-in sample library

Use the **Load sample** picker on `/new`. Loading a sample must populate all four report fields without submitting, navigating or calling an API. Every field remains editable before **Generate Report** is selected.

| Sample | Expected broad outcome |
| --- | --- |
| Clean utility change | `APPROVE`, `LOW`, operational `CLEAR` |
| Provider failure / retry risk | `TESTS_REQUIRED` or `REVIEW_REQUIRED`, `HIGH`, operational `ATTENTION` |
| Auth/session change | `TESTS_REQUIRED` or `REVIEW_REQUIRED`; security/privacy review expected |
| Database migration | `TESTS_REQUIRED` or `REVIEW_REQUIRED`; data/migration review expected |
| Payment/refund side effect | `TESTS_REQUIRED`; payments/domain and reliability review expected |
| API contract change | `REVIEW_REQUIRED` or `TESTS_REQUIRED`; API contract review expected |
| Logging/privacy risk | `REVIEW_REQUIRED` or `TESTS_REQUIRED`; security/privacy review expected |
| Frontend analytics/type change | `TESTS_REQUIRED` when no test file is present; frontend and docs review expected |

For each sample, confirm the selected input can be edited, generation still stores only `{ report, source }`, and no raw diff appears in session storage or copied markdown. AI wording and exact scores may vary, but the broad recommendation and review themes should remain consistent with the deterministic baseline.

## Report quality evaluation

New deterministic and AI-normalised reports include a **Report quality** section. The overall status is `PASS` only when every check passes; otherwise it is `WARNING` and the UI lists the failed checks. Legacy reports without `reportQuality` show **Not assessed — regenerate this report**.

Checks:

1. Risk level matches the configured score thresholds.
2. `TESTS_REQUIRED` includes missing tests or suggested tests.
3. `APPROVE` has no findings, missing tests, suggested tests or merge conditions.
4. Operational `ATTENTION` does not result in `APPROVE`.
5. Reviewer focus areas are supported by report evidence.
6. Payment, refund, authentication or logging paths do not remain `LOW` risk.
7. Security `CLEAR` does not conflict with security, privacy or sensitive-logging findings.
8. Shareable report fields contain no raw patch markers.

Manual tests:

- Generate **Clean utility change** and expect `PASS` with **Checks passed** and no suggested tests.
- Generate each risky sample and confirm its risk level, recommendation, operational status and reviewer focus remain internally consistent.
- Construct a legacy stored report without `reportQuality` and confirm the neutral not-assessed state renders without crashing.
- Temporarily inspect a malformed report fixture with a mismatched score/level, inconsistent approval, unsupported reviewer focus or sensitive path at `LOW` risk and confirm `WARNING` details identify the conflict.
- Copy a report and confirm markdown includes report quality status and warning items only, never raw diff content.
- Confirm `lintel.generatedReport.v1` still stores only `{ report, source }` and never the submitted raw diff.
