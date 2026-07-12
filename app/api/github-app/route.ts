import { getGitHubAppStatus, isGitHubAppConfigured } from "../../../lib/github-app-auth";
import { readGitHubAppStore } from "../../../lib/github-app-store";

export const runtime = "nodejs";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
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
        baseSha: record.baseSha,
        headSha: record.headSha,
        state: record.state,
        latestDeliveryId: record.latestDeliveryId,
        failureCategory: record.failureCategory,
        latestReport: record.latestReport,
        reportSource: record.reportSource,
        updatedAt: record.updatedAt,
      })),
    });
  }

  if (view === "deliveries") {
    return jsonResponse({ deliveries: Object.values(store.deliveries) });
  }

  return jsonResponse({ error: "Unsupported GitHub App read view." }, 400);
}
