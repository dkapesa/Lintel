import { createHmac, timingSafeEqual } from "node:crypto";
import type { GitHubWebhookEnvelope } from "./github-app-store";

type UnknownRecord = Record<string, unknown>;

const SUPPORTED_PULL_REQUEST_ACTIONS = new Set(["opened", "reopened", "synchronize", "ready_for_review"]);

function record(value: unknown) {
  return typeof value === "object" && value !== null ? value as UnknownRecord : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function verifyGitHubWebhookSignature(rawBody: string, signatureHeader: string | null, secret = process.env.GITHUB_WEBHOOK_SECRET) {
  const webhookSecret = secret?.trim();
  if (!webhookSecret || !signatureHeader?.startsWith("sha256=")) return false;

  const expected = `sha256=${createHmac("sha256", webhookSecret).update(rawBody).digest("hex")}`;
  const receivedBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function normaliseGitHubWebhookDelivery({
  deliveryId,
  event,
  payload,
}: {
  deliveryId: string;
  event: string;
  payload: unknown;
}): { accepted: true; envelope: GitHubWebhookEnvelope } | { accepted: false; reason: "ignored" | "malformed" } {
  const body = record(payload);
  if (!body) return { accepted: false, reason: "malformed" };

  const action = stringValue(body.action);
  const installation = record(body.installation);
  const installationId = numberValue(installation?.id);
  const repository = record(body.repository);
  const repositoryId = numberValue(repository?.id);
  const repositoryName = stringValue(repository?.name);
  const repositoryOwner = stringValue(record(repository?.owner)?.login);
  const repositoryVisibility = repository?.private === true ? "private" : "public";
  const timestamp = new Date().toISOString();

  if (event === "ping") {
    return {
      accepted: true,
      envelope: {
        deliveryId,
        event: "ping",
        action,
        installationId,
        repositoryId,
        repositoryOwner,
        repositoryName,
        repositoryVisibility,
        receivedAt: timestamp,
      },
    };
  }

  if (event === "installation" || event === "installation_repositories") {
    if (!installationId) return { accepted: false, reason: "malformed" };
    return {
      accepted: true,
      envelope: {
        deliveryId,
        event,
        action,
        installationId,
        repositoryId,
        repositoryOwner,
        repositoryName,
        repositoryVisibility,
        receivedAt: timestamp,
      },
    };
  }

  if (event === "pull_request") {
    if (!action || !SUPPORTED_PULL_REQUEST_ACTIONS.has(action)) return { accepted: false, reason: "ignored" };
    const pullRequest = record(body.pull_request);
    const pullRequestNumber = numberValue(pullRequest?.number);
    const baseSha = stringValue(record(pullRequest?.base)?.sha);
    const headSha = stringValue(record(pullRequest?.head)?.sha);

    if (!installationId || !repositoryId || !repositoryOwner || !repositoryName || !pullRequestNumber || !headSha) {
      return { accepted: false, reason: "malformed" };
    }

    return {
      accepted: true,
      envelope: {
        deliveryId,
        event: "pull_request",
        action,
        installationId,
        repositoryId,
        repositoryOwner,
        repositoryName,
        repositoryVisibility,
        pullRequestNumber,
        baseSha,
        headSha,
        receivedAt: timestamp,
      },
    };
  }

  return { accepted: false, reason: "ignored" };
}

export function repositoryRecordsFromPayload(payload: unknown) {
  const body = record(payload);
  const installation = record(body?.installation);
  const installationId = numberValue(installation?.id);
  if (!installationId) return [];

  const repositories = Array.isArray(body?.repositories)
    ? body.repositories
    : Array.isArray(body?.repositories_added)
      ? body.repositories_added
      : [];

  return repositories.flatMap((item) => {
    const repository = record(item);
    const repositoryId = numberValue(repository?.id);
    const fullName = stringValue(repository?.full_name);
    const name = stringValue(repository?.name);
    const owner = fullName?.split("/")[0] ?? stringValue(record(repository?.owner)?.login);
    if (!repositoryId || !owner || !name) return [];
    return [{
      installationId,
      repositoryId,
      owner,
      name,
      visibility: repository?.private === true ? "private" as const : "public" as const,
    }];
  });
}

export function removedRepositoryRecordsFromPayload(payload: unknown) {
  const body = record(payload);
  const installation = record(body?.installation);
  const installationId = numberValue(installation?.id);
  if (!installationId || !Array.isArray(body?.repositories_removed)) return [];

  return body.repositories_removed.flatMap((item) => {
    const repository = record(item);
    const repositoryId = numberValue(repository?.id);
    return repositoryId ? [{ installationId, repositoryId }] : [];
  });
}

export function installationAccountLogin(payload: unknown) {
  const body = record(payload);
  const account = record(record(body?.installation)?.account);
  return stringValue(account?.login);
}
