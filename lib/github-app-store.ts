import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Report } from "./mock-report";
import { createReadinessDelta, createReviewDiff, type AnalysisRunSnapshot, type ReadinessDelta } from "./readiness-delta";

export type GitHubWebhookProcessingState = "received" | "processing" | "completed" | "failed" | "ignored";
export type GitHubCommentPublishingState = "not_published" | "publishing" | "completed" | "failed";

export type GitHubWebhookEnvelope = {
  deliveryId: string;
  event: "ping" | "installation" | "installation_repositories" | "pull_request";
  action?: string;
  installationId?: number;
  repositoryId?: number;
  repositoryOwner?: string;
  repositoryName?: string;
  repositoryVisibility?: "public" | "private";
  pullRequestNumber?: number;
  baseSha?: string;
  headSha?: string;
  receivedAt: string;
};

export type GitHubInstallationRecord = {
  installationId: number;
  accountLogin?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GitHubRepositoryRecord = {
  installationId: number;
  repositoryId: number;
  owner: string;
  name: string;
  visibility: "public" | "private";
  enabled: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GitHubPullRequestRecord = {
  id: string;
  installationId: number;
  repositoryId: number;
  owner: string;
  repository: string;
  number: number;
  title?: string;
  baseSha?: string;
  headSha: string;
  state: GitHubWebhookProcessingState;
  latestDeliveryId: string;
  latestReport?: Report;
  reportSource?: "deterministic";
  analysisRuns?: GitHubAnalysisRunRecord[];
  failureCategory?: string;
  githubCommentId?: number;
  githubCommentHtmlUrl?: string;
  latestPublishedHeadSha?: string;
  latestPublishedAt?: string;
  commentPublishingState?: GitHubCommentPublishingState;
  commentFailureCategory?: string;
  createdAt: string;
  updatedAt: string;
};

export type GitHubAnalysisRunRecord = AnalysisRunSnapshot & {
  installationId: number;
};

export type GitHubDeliveryRecord = {
  deliveryId: string;
  event: string;
  action?: string;
  state: GitHubWebhookProcessingState;
  failureCategory?: string;
  pullRequestRecordId?: string;
  createdAt: string;
  updatedAt: string;
};

type StoreData = {
  deliveries: Record<string, GitHubDeliveryRecord>;
  installations: Record<string, GitHubInstallationRecord>;
  repositories: Record<string, GitHubRepositoryRecord>;
  pullRequests: Record<string, GitHubPullRequestRecord>;
};

const STORE_DIR = path.join(process.cwd(), ".lintel-data");
const STORE_PATH = path.join(STORE_DIR, "github-app-store.json");
export const GITHUB_APP_ANALYSIS_RUN_RETENTION = 20;
let writeQueue = Promise.resolve();

function now() {
  return new Date().toISOString();
}

function emptyStore(): StoreData {
  return { deliveries: {}, installations: {}, repositories: {}, pullRequests: {} };
}

function repositoryKey(installationId: number, repositoryId: number) {
  return `${installationId}:${repositoryId}`;
}

export function pullRequestKey(installationId: number, repositoryId: number, number: number) {
  return `${installationId}:${repositoryId}:${number}`;
}

async function readStore(): Promise<StoreData> {
  try {
    const text = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(text) as Partial<StoreData>;
    return {
      deliveries: parsed.deliveries ?? {},
      installations: parsed.installations ?? {},
      repositories: parsed.repositories ?? {},
      pullRequests: parsed.pullRequests ?? {},
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(data: StoreData) {
  await mkdir(STORE_DIR, { recursive: true });
  const tempPath = `${STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await rename(tempPath, STORE_PATH);
}

async function updateStore<T>(updater: (data: StoreData) => T | Promise<T>) {
  const run = async () => {
    const data = await readStore();
    const result = await updater(data);
    await writeStore(data);
    return result;
  };

  const next = writeQueue.then(run, run);
  writeQueue = next.then(() => undefined, () => undefined);
  return next;
}

export async function readGitHubAppStore() {
  return readStore();
}

export async function recordDelivery(envelope: GitHubWebhookEnvelope, state: GitHubWebhookProcessingState) {
  return updateStore((data) => {
    const existing = data.deliveries[envelope.deliveryId];
    if (existing) return { duplicate: true, delivery: existing };

    const timestamp = now();
    const delivery: GitHubDeliveryRecord = {
      deliveryId: envelope.deliveryId,
      event: envelope.event,
      action: envelope.action,
      state,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    data.deliveries[envelope.deliveryId] = delivery;
    return { duplicate: false, delivery };
  });
}

export async function updateDeliveryState(deliveryId: string, state: GitHubWebhookProcessingState, failureCategory?: string, pullRequestRecordId?: string) {
  return updateStore((data) => {
    const delivery = data.deliveries[deliveryId];
    if (!delivery) return null;
    delivery.state = state;
    delivery.failureCategory = failureCategory;
    delivery.pullRequestRecordId = pullRequestRecordId ?? delivery.pullRequestRecordId;
    delivery.updatedAt = now();
    return delivery;
  });
}

export async function upsertInstallation(installationId: number, accountLogin: string | undefined, active: boolean) {
  return updateStore((data) => {
    const key = String(installationId);
    const timestamp = now();
    data.installations[key] = {
      installationId,
      accountLogin,
      active,
      createdAt: data.installations[key]?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    return data.installations[key];
  });
}

export async function upsertRepository(record: Omit<GitHubRepositoryRecord, "enabled" | "active" | "createdAt" | "updatedAt"> & { active?: boolean }) {
  return updateStore((data) => {
    const key = repositoryKey(record.installationId, record.repositoryId);
    const existing = data.repositories[key];
    const timestamp = now();
    data.repositories[key] = {
      ...record,
      enabled: existing?.enabled ?? true,
      active: record.active ?? true,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    return data.repositories[key];
  });
}

export async function markRepositoryRemoved(installationId: number, repositoryId: number) {
  return updateStore((data) => {
    const key = repositoryKey(installationId, repositoryId);
    const existing = data.repositories[key];
    if (!existing) return null;
    existing.active = false;
    existing.updatedAt = now();
    return existing;
  });
}

export async function repositoryIsEnabled(installationId: number, repositoryId: number) {
  const data = await readStore();
  const record = data.repositories[repositoryKey(installationId, repositoryId)];
  return record ? record.enabled && record.active : true;
}

export async function findCompletedAnalysis(installationId: number, repositoryId: number, number: number, headSha: string) {
  const data = await readStore();
  const record = data.pullRequests[pullRequestKey(installationId, repositoryId, number)];
  if (!record) return null;
  if (record.analysisRuns?.some((run) => run.headSha === headSha)) return record;
  return record.state === "completed" && record.headSha === headSha ? record : null;
}

export async function markPullRequestProcessing(envelope: GitHubWebhookEnvelope) {
  return updateStore((data) => {
    if (!envelope.installationId || !envelope.repositoryId || !envelope.repositoryOwner || !envelope.repositoryName || !envelope.pullRequestNumber || !envelope.headSha) return null;
    const id = pullRequestKey(envelope.installationId, envelope.repositoryId, envelope.pullRequestNumber);
    const existing = data.pullRequests[id];
    const timestamp = now();
    data.pullRequests[id] = {
      id,
      installationId: envelope.installationId,
      repositoryId: envelope.repositoryId,
      owner: envelope.repositoryOwner,
      repository: envelope.repositoryName,
      number: envelope.pullRequestNumber,
      title: existing?.title,
      baseSha: envelope.baseSha,
      headSha: envelope.headSha,
      state: "processing",
      latestDeliveryId: envelope.deliveryId,
      latestReport: existing?.latestReport,
      reportSource: existing?.reportSource,
      analysisRuns: existing?.analysisRuns,
      githubCommentId: existing?.githubCommentId,
      githubCommentHtmlUrl: existing?.githubCommentHtmlUrl,
      latestPublishedHeadSha: existing?.latestPublishedHeadSha,
      latestPublishedAt: existing?.latestPublishedAt,
      commentPublishingState: existing?.commentPublishingState ?? "not_published",
      commentFailureCategory: existing?.commentFailureCategory,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    return data.pullRequests[id];
  });
}

function stableRunId(id: string, headSha: string) {
  return `${id}:${headSha}`;
}

function legacyRunFromRecord(record: GitHubPullRequestRecord): GitHubAnalysisRunRecord | null {
  if (!record.latestReport) return null;

  return {
    runId: stableRunId(record.id, record.headSha),
    installationId: record.installationId,
    repositoryId: record.repositoryId,
    owner: record.owner,
    repository: record.repository,
    pullRequestNumber: record.number,
    baseSha: record.baseSha,
    headSha: record.headSha,
    recommendation: record.latestReport.verdict.recommendation,
    readinessScore: record.latestReport.verdict.riskScore,
    riskLevel: record.latestReport.verdict.riskLevel,
    report: record.latestReport,
    analysisSource: record.reportSource ?? "deterministic",
    completedAt: record.updatedAt,
  };
}

function completedRunFromReport(record: GitHubPullRequestRecord, report: Report, completedAt: string): GitHubAnalysisRunRecord {
  return {
    runId: stableRunId(record.id, record.headSha),
    installationId: record.installationId,
    repositoryId: record.repositoryId,
    owner: record.owner,
    repository: record.repository,
    pullRequestNumber: record.number,
    baseSha: record.baseSha,
    headSha: record.headSha,
    recommendation: report.verdict.recommendation,
    readinessScore: report.verdict.riskScore,
    riskLevel: report.verdict.riskLevel,
    report,
    analysisSource: "deterministic",
    completedAt,
  };
}

export async function completePullRequestAnalysis(id: string, report: Report) {
  return updateStore((data) => {
    const record = data.pullRequests[id];
    if (!record) return null;
    const timestamp = now();
    const existingRuns = record.analysisRuns ?? [];
    const duplicateRun = existingRuns.find((run) => run.headSha === record.headSha);

    if (duplicateRun) {
      record.state = "completed";
      record.title = report.pr.title;
      record.latestReport = duplicateRun.report;
      record.reportSource = duplicateRun.analysisSource;
      record.failureCategory = undefined;
      record.commentPublishingState = record.latestPublishedHeadSha === record.headSha ? "completed" : "not_published";
      record.commentFailureCategory = undefined;
      record.updatedAt = timestamp;
      return record;
    }

    const legacyRun = existingRuns.length === 0 && record.latestReport && record.headSha !== undefined
      ? legacyRunFromRecord(record)
      : null;
    const comparisonHistory = legacyRun && legacyRun.headSha !== record.headSha
      ? [legacyRun, ...existingRuns]
      : existingRuns;
    const previousRun = comparisonHistory[0] ?? null;
    const earlierRuns = comparisonHistory.slice(1);
    const currentRun = completedRunFromReport(record, report, timestamp);

    try {
      currentRun.delta = createReadinessDelta(previousRun, currentRun, earlierRuns, timestamp);
      currentRun.reviewDiff = createReviewDiff(previousRun, currentRun, currentRun.delta, earlierRuns, timestamp) ?? undefined;
    } catch {
      currentRun.deltaFailureCategory = "delta_generation_failed";
    }

    record.state = "completed";
    record.title = report.pr.title;
    record.latestReport = report;
    record.reportSource = "deterministic";
    record.analysisRuns = [currentRun, ...comparisonHistory.filter((run) => run.headSha !== record.headSha)]
      .slice(0, GITHUB_APP_ANALYSIS_RUN_RETENTION);
    record.failureCategory = undefined;
    record.commentPublishingState = record.latestPublishedHeadSha === record.headSha ? "completed" : "not_published";
    record.commentFailureCategory = undefined;
    record.updatedAt = timestamp;
    return record;
  });
}

export async function failPullRequestAnalysis(id: string | null, failureCategory: string) {
  return updateStore((data) => {
    if (!id) return null;
    const record = data.pullRequests[id];
    if (!record) return null;
    record.state = "failed";
    record.failureCategory = failureCategory;
    record.updatedAt = now();
    return record;
  });
}

export async function setRepositoryEnabled(installationId: number, repositoryId: number, enabled: boolean) {
  return updateStore((data) => {
    const record = data.repositories[repositoryKey(installationId, repositoryId)];
    if (!record) return null;
    record.enabled = enabled;
    record.updatedAt = now();
    return record;
  });
}

export async function markCommentPublishing(id: string) {
  return updateStore((data) => {
    const record = data.pullRequests[id];
    if (!record) return null;
    record.commentPublishingState = "publishing";
    record.commentFailureCategory = undefined;
    record.updatedAt = now();
    return record;
  });
}

export async function completeCommentPublishing(
  id: string,
  metadata: { commentId: number; htmlUrl?: string; headSha: string },
) {
  return updateStore((data) => {
    const record = data.pullRequests[id];
    if (!record) return null;
    record.githubCommentId = metadata.commentId;
    record.githubCommentHtmlUrl = metadata.htmlUrl;
    record.latestPublishedHeadSha = metadata.headSha;
    record.latestPublishedAt = now();
    record.commentPublishingState = "completed";
    record.commentFailureCategory = undefined;
    record.updatedAt = now();
    return record;
  });
}

export async function failCommentPublishing(id: string, failureCategory: string) {
  return updateStore((data) => {
    const record = data.pullRequests[id];
    if (!record) return null;
    record.commentPublishingState = "failed";
    record.commentFailureCategory = failureCategory;
    record.updatedAt = now();
    return record;
  });
}
