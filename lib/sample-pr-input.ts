import type { ReportInput } from "./report-generator";

export const CLEAN_APPROVE_SAMPLE = {
  title: "Format display names consistently",
  repository: "acme/profile-api",
  technology: "Python / FastAPI",
  diff: `diff --git a/app/utils/format_name.py b/app/utils/format_name.py
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
+    assert format_name(" Ada ", " Lovelace ") == "Ada Lovelace"`,
} satisfies ReportInput;

export const RISKY_TESTS_REQUIRED_SAMPLE = {
  title: "Add fallback handling for failed discount-code retrieval",
  repository: "acme/redemption-api",
  technology: "Python / FastAPI",
  diff: `diff --git a/app/services/redemption_service.py b/app/services/redemption_service.py
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
+)`,
} satisfies ReportInput;
