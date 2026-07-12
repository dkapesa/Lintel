import {
  createCanonicalReviewRunManifest,
  reviewConfigurationFingerprint,
  type CanonicalRunVerificationRecord,
} from "../../../lib/canonical-review-run";
import { createInstallationToken, getGitHubAppStatus, installationFetch, installationFetchError, isGitHubAppConfigured } from "../../../lib/github-app-auth";
import { addRunVerification, readGitHubAppStore, setRepositoryEnabled } from "../../../lib/github-app-store";
import { generateReport, type ReportInput } from "../../../lib/report-generator";
import { inferStack } from "../../../lib/stack-inference";

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

async function readDiff(response: Response) {
  const text = await response.text();
  return text.length > 250_000 ? null : text;
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
        canonicalRun: record.analysisRuns?.[0]?.canonicalRun,
        latestDelta: record.analysisRuns?.[0]?.delta,
        latestReviewDiff: record.analysisRuns?.[0]?.reviewDiff,
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

  if (view === "canonical-run") {
    const pullRequestId = url.searchParams.get("pullRequestId");
    const runId = url.searchParams.get("runId");
    if (!pullRequestId) return jsonResponse({ error: "pullRequestId is required." }, 400);
    const record = store.pullRequests[pullRequestId];
    const run = runId
      ? record?.analysisRuns?.find((item) => item.runId === runId)
      : record?.analysisRuns?.[0];
    if (!record || !run) return jsonResponse({ error: "Analysis run was not found." }, 404);
    return jsonResponse({
      pullRequestId,
      runId: run.runId,
      canonicalRun: run.canonicalRun,
      verifications: run.verifications ?? [],
      reproducibility: run.canonicalRun?.reproducibility ?? "historical-schema",
    });
  }

  if (view === "review-diff") {
    const pullRequestId = url.searchParams.get("pullRequestId");
    const runId = url.searchParams.get("runId");
    if (!pullRequestId) return jsonResponse({ error: "pullRequestId is required." }, 400);
    const record = store.pullRequests[pullRequestId];
    if (!record) return jsonResponse({ error: "Automated pull-request record was not found." }, 404);
    const run = runId
      ? record.analysisRuns?.find((item) => item.runId === runId)
      : record.analysisRuns?.[0];
    if (!run) return jsonResponse({ error: "Completed analysis run was not found." }, 404);
    if (!run.reviewDiff) {
      return jsonResponse({
        pullRequestId,
        runId: run.runId,
        available: false,
        reason: run.delta?.classification === "initial" ? "initial_analysis" : run.deltaFailureCategory ?? "review_diff_unavailable",
      });
    }
    return jsonResponse({ pullRequestId, runId: run.runId, available: true, reviewDiff: run.reviewDiff });
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

  if (record.action === "verify-run") {
    const pullRequestId = typeof record.pullRequestId === "string" ? record.pullRequestId : null;
    const runId = typeof record.runId === "string" ? record.runId : null;
    if (!pullRequestId || !runId) return jsonResponse({ error: "pullRequestId and runId are required." }, 400);

    const store = await readGitHubAppStore();
    const pullRequest = store.pullRequests[pullRequestId];
    const run = pullRequest?.analysisRuns?.find((item) => item.runId === runId);
    if (!pullRequest || !run) return jsonResponse({ error: "Analysis run was not found." }, 404);

    const timestamp = new Date().toISOString();
    let verification: CanonicalRunVerificationRecord;

    if (!run.canonicalRun) {
      verification = {
        id: `verify_${Date.now().toString(36)}`,
        runId,
        createdAt: timestamp,
        sourceMatched: false,
        configurationMatched: false,
        reproducibility: "historical-schema",
        failureCategory: "historical-schema",
        details: "This run predates canonical-run metadata.",
      };
    } else if (run.canonicalRun.sourceType !== "github-app") {
      verification = {
        id: `verify_${Date.now().toString(36)}`,
        runId,
        createdAt: timestamp,
        sourceMatched: false,
        configurationMatched: true,
        reproducibility: run.canonicalRun.reproducibility,
        failureCategory: "source-unavailable",
        details: "Only GitHub App automated runs can be verified server-side in this local MVP.",
      };
    } else {
      const token = await createInstallationToken(pullRequest.installationId);
      if (!token.ok) {
        verification = {
          id: `verify_${Date.now().toString(36)}`,
          runId,
          createdAt: timestamp,
          sourceMatched: false,
          configurationMatched: true,
          reproducibility: "source-unavailable",
          failureCategory: token.error,
          details: "GitHub installation token could not be created for verification.",
        };
      } else {
        const metadataResponse = await installationFetch(`/repos/${pullRequest.owner}/${pullRequest.repository}/pulls/${pullRequest.number}`, token.value);
        if (!metadataResponse.ok) {
          const error = installationFetchError(metadataResponse);
          verification = {
            id: `verify_${Date.now().toString(36)}`,
            runId,
            createdAt: timestamp,
            sourceMatched: false,
            configurationMatched: true,
            reproducibility: "source-unavailable",
            failureCategory: error,
            details: "GitHub source metadata could not be fetched for verification.",
          };
        } else {
          const metadata = await metadataResponse.json() as { head?: { sha?: string }, title?: string };
          const sourceMatched = metadata.head?.sha === run.headSha;
          if (!sourceMatched) {
            verification = {
              id: `verify_${Date.now().toString(36)}`,
              runId,
              createdAt: timestamp,
              sourceMatched: false,
              configurationMatched: true,
              reproducibility: "drift-detected",
              failureCategory: "head_sha_changed",
              details: "The pull request head SHA no longer matches the canonical run.",
            };
          } else {
            const diffResponse = await installationFetch(`/repos/${pullRequest.owner}/${pullRequest.repository}/pulls/${pullRequest.number}`, token.value, "application/vnd.github.v3.diff");
            const diff = diffResponse.ok ? await readDiff(diffResponse) : null;
            if (!diff?.trim()) {
              verification = {
                id: `verify_${Date.now().toString(36)}`,
                runId,
                createdAt: timestamp,
                sourceMatched: true,
                configurationMatched: true,
                reproducibility: "source-unavailable",
                failureCategory: diffResponse.ok ? "diff_unavailable" : installationFetchError(diffResponse),
                details: "GitHub diff could not be fetched for deterministic replay.",
              };
            } else {
              const input: ReportInput = {
                title: metadata.title ?? run.report.pr.title,
                repository: `${pullRequest.owner}/${pullRequest.repository}`,
                technology: inferStack(diff) ?? `${run.report.pr.language} / ${run.report.pr.framework}`,
                diff,
                inputSource: "github-pr",
                reviewProfile: run.report.pr.reviewProfile ?? "standard",
              };
              const configurationFingerprint = reviewConfigurationFingerprint(input, "deterministic");
              const configurationMatched = configurationFingerprint === run.canonicalRun.configurationFingerprint;
              const reproducedReport = generateReport(input);
              const reproducedManifest = createCanonicalReviewRunManifest({
                input,
                report: reproducedReport,
                sourceType: "github-app",
                analysisSource: "deterministic",
                baseSha: run.baseSha,
                headSha: run.headSha,
                pullRequestNumber: pullRequest.number,
              });
              const resultMatched = reproducedManifest.resultFingerprint === run.canonicalRun.resultFingerprint;
              verification = {
                id: `verify_${Date.now().toString(36)}`,
                runId,
                createdAt: timestamp,
                sourceMatched: true,
                configurationMatched,
                resultMatched,
                reproducibility: configurationMatched && resultMatched ? "exact" : "drift-detected",
                failureCategory: configurationMatched && resultMatched ? undefined : "fingerprint_mismatch",
                details: resultMatched
                  ? "Result fingerprint matched the canonical run. This verifies deterministic replay for the stored source and configuration, not broader correctness."
                  : "Reproduced result fingerprint differed from the canonical run.",
              };
            }
          }
        }
      }
    }

    const updated = await addRunVerification(pullRequestId, runId, verification);
    return updated ? jsonResponse({ verification, verifications: updated.verifications ?? [] }) : jsonResponse({ error: "Verification could not be stored." }, 500);
  }

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
