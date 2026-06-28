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
