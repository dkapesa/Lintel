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

export const AUTH_SESSION_SAMPLE = {
  title: "Rotate sessions during authentication refresh",
  repository: "acme/customer-portal",
  technology: "TypeScript / Next.js",
  diff: `diff --git a/app/auth/session.ts b/app/auth/session.ts
--- a/app/auth/session.ts
+++ b/app/auth/session.ts
@@ -8,3 +8,10 @@
+export async function refreshSession(request: Request) {
+  const token = request.headers.get("x-session-token");
+  if (!token) return null;
+
+  const session = await sessionStore.rotate(token);
+  return session;
+}`,
} satisfies ReportInput;

export const DATABASE_MIGRATION_SAMPLE = {
  title: "Make customer account references unique",
  repository: "acme/accounts-api",
  technology: "Python / Django",
  diff: `diff --git a/accounts/migrations/0042_unique_account_reference.py b/accounts/migrations/0042_unique_account_reference.py
--- /dev/null
+++ b/accounts/migrations/0042_unique_account_reference.py
@@ -0,0 +1,11 @@
+from django.db import migrations, models
+
+class Migration(migrations.Migration):
+    dependencies = [("accounts", "0041_account_reference")]
+
+    operations = [
+        migrations.AlterField(
+            model_name="account",
+            name="reference",
+            field=models.CharField(max_length=64, unique=True),
+        ),
+    ]`,
} satisfies ReportInput;

export const PAYMENT_REFUND_SAMPLE = {
  title: "Retry refunds after gateway timeouts",
  repository: "acme/billing-service",
  technology: "TypeScript / Node.js",
  diff: `diff --git a/src/payments/refund-service.ts b/src/payments/refund-service.ts
--- a/src/payments/refund-service.ts
+++ b/src/payments/refund-service.ts
@@ -18,3 +18,12 @@
+export async function issueRefund(paymentId: string, amount: number) {
+  try {
+    return await paymentGateway.refund(paymentId, amount);
+  } catch (error) {
+    if (!(error instanceof GatewayTimeoutError)) throw error;
+    return paymentGateway.refund(paymentId, amount);
+  }
+}`,
} satisfies ReportInput;

export const API_CONTRACT_SAMPLE = {
  title: "Return retry details for unavailable exports",
  repository: "acme/reporting-api",
  technology: "Python / FastAPI",
  diff: `diff --git a/app/api/exports.py b/app/api/exports.py
--- a/app/api/exports.py
+++ b/app/api/exports.py
@@ -12,3 +12,8 @@
+return JSONResponse(
+    status_code=503,
+    content={"error_code": "export_unavailable", "retryable": True},
+)

diff --git a/tests/test_exports_api.py b/tests/test_exports_api.py
--- a/tests/test_exports_api.py
+++ b/tests/test_exports_api.py
@@ -4,3 +4,7 @@
+def test_unavailable_export_has_retryable_contract(client):
+    response = client.post("/exports")
+    assert response.status_code == 503
+    assert response.json()["retryable"] is True`,
} satisfies ReportInput;

export const LOGGING_PRIVACY_SAMPLE = {
  title: "Add session refresh diagnostics",
  repository: "acme/identity-api",
  technology: "Python / FastAPI",
  diff: `diff --git a/app/services/session_service.py b/app/services/session_service.py
--- a/app/services/session_service.py
+++ b/app/services/session_service.py
@@ -20,3 +20,8 @@
+logger.info("session refreshed", extra={
+    "user_id": user_id,
+    "account_id": account_id,
+    "token": session_token,
+})

diff --git a/tests/test_session_service.py b/tests/test_session_service.py
--- a/tests/test_session_service.py
+++ b/tests/test_session_service.py
@@ -8,3 +8,6 @@
+def test_refresh_returns_active_session(session_service):
+    result = session_service.refresh("user-1")
+    assert result.is_active`,
} satisfies ReportInput;

export const FRONTEND_ANALYTICS_SAMPLE = {
  title: "Add typed sendGAEvent helper",
  repository: "vercel/next.js",
  technology: "TypeScript / Next.js",
  diff: `diff --git a/packages/next/src/client/analytics/send-ga-event.ts b/packages/next/src/client/analytics/send-ga-event.ts
--- /dev/null
+++ b/packages/next/src/client/analytics/send-ga-event.ts
@@ -0,0 +1,8 @@
+export type GAEvent = {
+  name: string
+  value?: string | number
+}
+
+export function sendGAEvent(event: GAEvent) {
+  window.gtag?.("event", event.name, { value: event.value })
+}

diff --git a/docs/app/analytics.md b/docs/app/analytics.md
--- a/docs/app/analytics.md
+++ b/docs/app/analytics.md
@@ -12,3 +12,7 @@
+Call sendGAEvent from a client component after a browser interaction.
+The helper accepts a typed event name and optional value.`,
} satisfies ReportInput;

export type PrSample = {
  id: string;
  name: string;
  input: ReportInput;
};

export const PR_SAMPLES = [
  { id: "clean-utility", name: "Clean utility change", input: CLEAN_APPROVE_SAMPLE },
  { id: "provider-retry", name: "Provider failure / retry risk", input: RISKY_TESTS_REQUIRED_SAMPLE },
  { id: "auth-session", name: "Auth/session change", input: AUTH_SESSION_SAMPLE },
  { id: "database-migration", name: "Database migration", input: DATABASE_MIGRATION_SAMPLE },
  { id: "payment-refund", name: "Payment/refund side effect", input: PAYMENT_REFUND_SAMPLE },
  { id: "api-contract", name: "API contract change", input: API_CONTRACT_SAMPLE },
  { id: "logging-privacy", name: "Logging/privacy risk", input: LOGGING_PRIVACY_SAMPLE },
  { id: "frontend-analytics", name: "Frontend analytics/type change", input: FRONTEND_ANALYTICS_SAMPLE },
] satisfies PrSample[];
