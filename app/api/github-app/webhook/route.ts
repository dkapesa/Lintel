import { createInstallationToken, installationFetch, installationFetchError } from "../../../../lib/github-app-auth";
import { githubDecisionCommentBody, publishGitHubDecisionComment } from "../../../../lib/github-app-comments";
import {
  completePullRequestAnalysis,
  completeCommentPublishing,
  failPullRequestAnalysis,
  failCommentPublishing,
  findCompletedAnalysis,
  markCommentPublishing,
  markPullRequestProcessing,
  markRepositoryRemoved,
  recordDelivery,
  repositoryIsEnabled,
  updateDeliveryState,
  upsertInstallation,
  upsertRepository,
} from "../../../../lib/github-app-store";
import {
  installationAccountLogin,
  normaliseGitHubWebhookDelivery,
  removedRepositoryRecordsFromPayload,
  repositoryRecordsFromPayload,
  verifyGitHubWebhookSignature,
} from "../../../../lib/github-app-webhook";
import { generateReport, type ReportInput } from "../../../../lib/report-generator";
import { inferStack } from "../../../../lib/stack-inference";

export const runtime = "nodejs";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };
const MAX_DIFF_CHARS = 200_000;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

function record(value: unknown) {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

async function readTextWithLimit(response: Response) {
  const text = await response.text();
  return { text: text.length > MAX_DIFF_CHARS ? "" : text, exceeded: text.length > MAX_DIFF_CHARS };
}

async function handleInstallationEvent(payload: unknown, deliveryId: string) {
  const body = record(payload);
  const installation = record(body?.installation);
  const installationId = numberValue(installation?.id);
  const action = stringValue(body?.action);
  if (!installationId) {
    await updateDeliveryState(deliveryId, "failed", "malformed_webhook_payload");
    return jsonResponse({ ok: true, state: "failed", error: "malformed_webhook_payload" });
  }

  const active = action !== "deleted" && action !== "suspend";
  await upsertInstallation(installationId, installationAccountLogin(payload), active);

  for (const repository of repositoryRecordsFromPayload(payload)) {
    await upsertRepository({ ...repository, active });
  }

  await updateDeliveryState(deliveryId, "completed");
  return jsonResponse({ ok: true, state: "completed" });
}

async function handleInstallationRepositoriesEvent(payload: unknown, deliveryId: string) {
  const body = record(payload);
  const installationId = numberValue(record(body?.installation)?.id);
  if (!installationId) {
    await updateDeliveryState(deliveryId, "failed", "malformed_webhook_payload");
    return jsonResponse({ ok: true, state: "failed", error: "malformed_webhook_payload" });
  }

  await upsertInstallation(installationId, installationAccountLogin(payload), true);

  for (const repository of repositoryRecordsFromPayload(payload)) {
    await upsertRepository({ ...repository, active: true });
  }

  for (const repository of removedRepositoryRecordsFromPayload(payload)) {
    await markRepositoryRemoved(repository.installationId, repository.repositoryId);
  }

  await updateDeliveryState(deliveryId, "completed");
  return jsonResponse({ ok: true, state: "completed" });
}

async function processPullRequest(payload: unknown, deliveryId: string) {
  const normalised = normaliseGitHubWebhookDelivery({
    deliveryId,
    event: "pull_request",
    payload,
  });

  if (!normalised.accepted) {
    await updateDeliveryState(deliveryId, normalised.reason === "ignored" ? "ignored" : "failed", normalised.reason);
    return jsonResponse({ ok: true, state: normalised.reason });
  }

  const envelope = normalised.envelope;
  if (!envelope.installationId || !envelope.repositoryId || !envelope.repositoryOwner || !envelope.repositoryName || !envelope.pullRequestNumber || !envelope.headSha) {
    await updateDeliveryState(deliveryId, "failed", "malformed_webhook_payload");
    return jsonResponse({ ok: true, state: "failed", error: "malformed_webhook_payload" });
  }

  await upsertInstallation(envelope.installationId, undefined, true);
  await upsertRepository({
    installationId: envelope.installationId,
    repositoryId: envelope.repositoryId,
    owner: envelope.repositoryOwner,
    name: envelope.repositoryName,
    visibility: envelope.repositoryVisibility ?? "public",
    active: true,
  });

  if (!(await repositoryIsEnabled(envelope.installationId, envelope.repositoryId))) {
    await updateDeliveryState(deliveryId, "ignored", "repository_disabled");
    return jsonResponse({ ok: true, state: "ignored", reason: "repository_disabled" });
  }

  const existing = await findCompletedAnalysis(envelope.installationId, envelope.repositoryId, envelope.pullRequestNumber, envelope.headSha);
  if (existing) {
    await updateDeliveryState(deliveryId, "completed", undefined, existing.id);
    return jsonResponse({ ok: true, state: "duplicate_head_sha" });
  }

  const processingRecord = await markPullRequestProcessing(envelope);
  await updateDeliveryState(deliveryId, "processing", undefined, processingRecord?.id);

  if (!processingRecord) {
    await updateDeliveryState(deliveryId, "failed", "malformed_webhook_payload");
    return jsonResponse({ ok: true, state: "failed", error: "malformed_webhook_payload" });
  }

  const token = await createInstallationToken(envelope.installationId);
  if (!token.ok) {
    await failPullRequestAnalysis(processingRecord.id, token.error);
    await updateDeliveryState(deliveryId, "failed", token.error, processingRecord.id);
    return jsonResponse({ ok: true, state: "failed", error: token.error });
  }

  const metadataResponse = await installationFetch(`/repos/${envelope.repositoryOwner}/${envelope.repositoryName}/pulls/${envelope.pullRequestNumber}`, token.value);
  if (!metadataResponse.ok) {
    const error = installationFetchError(metadataResponse);
    await failPullRequestAnalysis(processingRecord.id, error);
    await updateDeliveryState(deliveryId, "failed", error, processingRecord.id);
    return jsonResponse({ ok: true, state: "failed", error });
  }

  const metadata: unknown = await metadataResponse.json();
  const pullRequest = record(metadata);
  const title = stringValue(pullRequest?.title) ?? `Pull request #${envelope.pullRequestNumber}`;

  const diffResponse = await installationFetch(
    `/repos/${envelope.repositoryOwner}/${envelope.repositoryName}/pulls/${envelope.pullRequestNumber}`,
    token.value,
    "application/vnd.github.v3.diff",
  );
  if (!diffResponse.ok) {
    const error = installationFetchError(diffResponse) === "github_rate_limited" ? "github_rate_limiting" : "diff_fetch_failure";
    await failPullRequestAnalysis(processingRecord.id, error);
    await updateDeliveryState(deliveryId, "failed", error, processingRecord.id);
    return jsonResponse({ ok: true, state: "failed", error });
  }

  const { text: diff, exceeded } = await readTextWithLimit(diffResponse);
  if (exceeded || !diff.trim() || !/^diff --git /m.test(diff)) {
    const error = exceeded ? "diff_too_large" : "diff_fetch_failure";
    await failPullRequestAnalysis(processingRecord.id, error);
    await updateDeliveryState(deliveryId, "failed", error, processingRecord.id);
    return jsonResponse({ ok: true, state: "failed", error });
  }

  try {
    const input: ReportInput = {
      title,
      repository: `${envelope.repositoryOwner}/${envelope.repositoryName}`,
      technology: inferStack(diff) ?? "Unknown",
      diff,
      inputSource: "github-pr",
      reviewProfile: "standard",
    };
    const report = generateReport(input);
    const completedRecord = await completePullRequestAnalysis(processingRecord.id, report, {
      input,
      sourceType: "github-app",
      analysisSource: "deterministic",
      sourceUrl: `https://github.com/${envelope.repositoryOwner}/${envelope.repositoryName}/pull/${envelope.pullRequestNumber}`,
    });
    await updateDeliveryState(deliveryId, "completed", undefined, processingRecord.id);

    if (completedRecord && completedRecord.latestPublishedHeadSha !== envelope.headSha) {
      await markCommentPublishing(processingRecord.id);
      const body = githubDecisionCommentBody(report, {
        headSha: envelope.headSha,
        analysedAt: new Date().toISOString(),
        delta: completedRecord.analysisRuns?.[0]?.delta,
        canonicalRun: completedRecord.analysisRuns?.[0]?.canonicalRun,
      });
      const published = await publishGitHubDecisionComment({
        owner: envelope.repositoryOwner,
        repo: envelope.repositoryName,
        number: envelope.pullRequestNumber,
        token: token.value,
        body,
        storedCommentId: completedRecord.githubCommentId,
      });

      if (published.ok) {
        await completeCommentPublishing(processingRecord.id, {
          commentId: published.commentId,
          htmlUrl: published.htmlUrl,
          headSha: envelope.headSha,
        });
      } else {
        await failCommentPublishing(processingRecord.id, published.error);
      }
    }

    return jsonResponse({ ok: true, state: "completed" });
  } catch {
    await failPullRequestAnalysis(processingRecord.id, "report_generation_failure");
    await updateDeliveryState(deliveryId, "failed", "report_generation_failure", processingRecord.id);
    return jsonResponse({ ok: true, state: "failed", error: "report_generation_failure" });
  }
}

export async function POST(request: Request) {
  const deliveryId = request.headers.get("x-github-delivery")?.trim();
  const event = request.headers.get("x-github-event")?.trim();
  const signature = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  if (!deliveryId || !event) return jsonResponse({ error: "Missing GitHub delivery headers." }, 400);
  if (!verifyGitHubWebhookSignature(rawBody, signature)) return jsonResponse({ error: "Invalid GitHub webhook signature." }, 401);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid GitHub webhook JSON." }, 400);
  }

  const normalised = normaliseGitHubWebhookDelivery({ deliveryId, event, payload });
  if (!normalised.accepted) {
    const state = normalised.reason === "ignored" ? "ignored" : "failed";
    await recordDelivery({
      deliveryId,
      event: event === "installation" || event === "installation_repositories" || event === "pull_request" || event === "ping" ? event : "ping",
      action: stringValue(record(payload)?.action),
      receivedAt: new Date().toISOString(),
    }, state);
    return jsonResponse({ ok: true, state });
  }

  const delivery = await recordDelivery(normalised.envelope, "received");
  if (delivery.duplicate) {
    return jsonResponse({ ok: true, state: "duplicate", previousState: delivery.delivery.state });
  }

  if (event === "ping") {
    await updateDeliveryState(deliveryId, "completed");
    return jsonResponse({ ok: true, state: "completed" });
  }

  if (event === "installation") return handleInstallationEvent(payload, deliveryId);
  if (event === "installation_repositories") return handleInstallationRepositoriesEvent(payload, deliveryId);
  if (event === "pull_request") return processPullRequest(payload, deliveryId);

  await updateDeliveryState(deliveryId, "ignored");
  return jsonResponse({ ok: true, state: "ignored" });
}
