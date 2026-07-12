import { getGitHubAppStatus, isGitHubAppConfigured } from "../../../lib/github-app-auth";
import { readGitHubAppStore, setRepositoryEnabled } from "../../../lib/github-app-store";

export const runtime = "nodejs";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

function analysisRunSummary(record: { runId: string; headSha: string; baseSha?: string; recommendation: string; readinessScore: number; riskLevel: string; completedAt: string; delta?: unknown; deltaFailureCategory?: string }) {
  return {
    runId: record.runId,
    headSha: record.headSha,
    baseSha: record.baseSha,
    recommendation: record.recommendation,
    readinessScore: record.readinessScore,
    riskLevel: record.riskLevel,
    completedAt: record.completedAt,
    delta: record.delta,
    deltaFailureCategory: record.deltaFailureCategory,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "status";

  if (view === "status") {
    if (!isGitHubAppConfigured()) {
      return jsonResponse({ configured: false, authenticated: false, error: "missing_app_configuration" });
    }

    const status = await getGitHubAppStatus();
    return status.ok
      ? jsonResponse({ configured: true, authenticated: true, ...status.value })
      : jsonResponse({ configured: true, authenticated: false, error: status.error });
  }

  const store = await readGitHubAppStore();

  if (view === "installations") {
    return jsonResponse({ installations: Object.values(store.installations) });
  }

  if (view === "repositories") {
    return jsonResponse({ repositories: Object.values(store.repositories) });
  }

  if (view === "pull-requests") {
    return jsonResponse({
      pullRequests: Object.values(store.pullRequests).map((record) => ({
        id: record.id,
        installationId: record.installationId,
        repositoryId: record.repositoryId,
        owner: record.owner,
        repository: record.repository,
        number: record.number,
        title: record.title,
        baseSha: record.baseSha,
        headSha: record.headSha,
        state: record.state,
        latestDeliveryId: record.latestDeliveryId,
        failureCategory: record.failureCategory,
        latestReport: record.latestReport,
        reportSource: record.reportSource,
        latestDelta: record.analysisRuns?.[0]?.delta,
        deltaFailureCategory: record.analysisRuns?.[0]?.deltaFailureCategory,
        analysisRuns: record.analysisRuns?.map(analysisRunSummary) ?? [],
        commentPublishingState: record.commentPublishingState ?? "not_published",
        commentFailureCategory: record.commentFailureCategory,
        githubCommentId: record.githubCommentId,
        githubCommentHtmlUrl: record.githubCommentHtmlUrl,
        latestPublishedHeadSha: record.latestPublishedHeadSha,
        latestPublishedAt: record.latestPublishedAt,
        updatedAt: record.updatedAt,
      })),
    });
  }

  if (view === "analysis-runs") {
    const pullRequestId = url.searchParams.get("pullRequestId");
    if (!pullRequestId) return jsonResponse({ error: "pullRequestId is required." }, 400);
    const record = store.pullRequests[pullRequestId];
    if (!record) return jsonResponse({ error: "Automated pull-request record was not found." }, 404);
    return jsonResponse({ pullRequestId, analysisRuns: record.analysisRuns?.map(analysisRunSummary) ?? [] });
  }

  if (view === "analysis-run") {
    const pullRequestId = url.searchParams.get("pullRequestId");
    const runId = url.searchParams.get("runId");
    if (!pullRequestId || !runId) return jsonResponse({ error: "pullRequestId and runId are required." }, 400);
    const record = store.pullRequests[pullRequestId];
    const run = record?.analysisRuns?.find((item) => item.runId === runId);
    if (!record || !run) return jsonResponse({ error: "Analysis run was not found." }, 404);
    return jsonResponse({ pullRequestId, analysisRun: run });
  }

  if (view === "deliveries") {
    return jsonResponse({ deliveries: Object.values(store.deliveries) });
  }

  return jsonResponse({ error: "Unsupported GitHub App read view." }, 400);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request." }, 400);
  }

  if (typeof body !== "object" || body === null) return jsonResponse({ error: "Invalid request body." }, 400);
  const record = body as Record<string, unknown>;

  if (record.action !== "set-repository-enabled") {
    return jsonResponse({ error: "Unsupported GitHub App mutation." }, 400);
  }

  const installationId = typeof record.installationId === "number" && Number.isInteger(record.installationId) && record.installationId > 0
    ? record.installationId
    : null;
  const repositoryId = typeof record.repositoryId === "number" && Number.isInteger(record.repositoryId) && record.repositoryId > 0
    ? record.repositoryId
    : null;
  const enabled = typeof record.enabled === "boolean" ? record.enabled : null;

  if (!installationId || !repositoryId || enabled === null) {
    return jsonResponse({ error: "Valid installationId, repositoryId and enabled are required." }, 400);
  }

  const updated = await setRepositoryEnabled(installationId, repositoryId, enabled);
  return updated
    ? jsonResponse({ repository: updated })
    : jsonResponse({ error: "Installed repository was not found in the local Lintel store." }, 404);
}
