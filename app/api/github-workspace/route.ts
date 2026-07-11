export const runtime = "nodejs";

const MAX_DIFF_CHARS = 200_000;
const FETCH_TIMEOUT_MS = 12_000;
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };
const OWNER_PATTERN = /^[A-Za-z0-9-]+$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+$/;

type UnknownRecord = Record<string, unknown>;

function jsonResponse(body: UnknownRecord, status = 200) {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

function githubToken() {
  const token = process.env.GITHUB_TOKEN?.trim();
  return token || null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function recordValue(value: unknown) {
  return typeof value === "object" && value !== null ? value as UnknownRecord : null;
}

function validateRepository(owner: unknown, repo: unknown) {
  if (typeof owner !== "string" || typeof repo !== "string") return null;
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  if (!OWNER_PATTERN.test(cleanOwner) || !REPOSITORY_PATTERN.test(cleanRepo)) return null;
  return { owner: cleanOwner, repo: cleanRepo };
}

function validatePullRequestNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) return null;
  if (value > 999_999_999) return null;
  return value;
}

async function githubFetch(path: string, token: string, signal: AbortSignal, accept = "application/vnd.github+json") {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${token}`,
      "User-Agent": "Lintel-connected-github-workspace",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
    redirect: "error",
    signal,
  });
}

function githubError(response: Response, fallback: string) {
  if (response.status === 401) return jsonResponse({ error: "The configured GitHub token is invalid or expired." }, 401);
  if (response.status === 403 || response.status === 429) return jsonResponse({ error: "GitHub rate-limited this token or denied access to this resource." }, 429);
  if (response.status === 404) return jsonResponse({ error: "GitHub could not find this resource or the token does not have access." }, 404);
  return jsonResponse({ error: fallback }, 502);
}

async function withTimeout<T>(task: (signal: AbortSignal) => Promise<T>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await task(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

async function readTextWithLimit(response: Response) {
  if (!response.body) return { text: "", exceeded: false };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });

    if (text.length > MAX_DIFF_CHARS) {
      await reader.cancel();
      return { text: "", exceeded: true };
    }
  }

  text += decoder.decode();
  return { text, exceeded: text.length > MAX_DIFF_CHARS };
}

function repositoryPayload(value: unknown) {
  const repo = recordValue(value);
  const owner = recordValue(repo?.owner);
  const ownerLogin = stringValue(owner?.login);
  const name = stringValue(repo?.name);
  if (!repo || !ownerLogin || !name) return null;

  return {
    owner: ownerLogin,
    name,
    fullName: `${ownerLogin}/${name}`,
    private: booleanValue(repo.private) ?? false,
    updatedAt: stringValue(repo.updated_at),
  };
}

function pullRequestPayload(value: unknown) {
  const pr = recordValue(value);
  const user = recordValue(pr?.user);
  const base = recordValue(pr?.base);
  const head = recordValue(pr?.head);
  const number = numberValue(pr?.number);
  const title = stringValue(pr?.title);
  if (!pr || !number || !title) return null;

  return {
    number,
    title,
    author: stringValue(user?.login),
    state: stringValue(pr.state),
    baseBranch: stringValue(base?.ref),
    headBranch: stringValue(head?.ref),
    updatedAt: stringValue(pr.updated_at),
  };
}

function importPayload(metadata: unknown, diff: string, owner: string, repo: string, repositoryIsPrivate: boolean) {
  const pr = recordValue(metadata);
  const user = recordValue(pr?.user);
  const base = recordValue(pr?.base);
  const head = recordValue(pr?.head);
  const number = numberValue(pr?.number);
  const title = stringValue(pr?.title);

  if (!pr || !number || !title) return null;

  return {
    repository: `${owner}/${repo}`,
    owner,
    repo,
    number,
    url: `https://github.com/${owner}/${repo}/pull/${number}`,
    publicRepository: !repositoryIsPrivate,
    diff,
    title,
    author: stringValue(user?.login),
    state: stringValue(pr.state),
    baseBranch: stringValue(base?.ref),
    headBranch: stringValue(head?.ref),
    changedFiles: numberValue(pr.changed_files),
    additions: numberValue(pr.additions),
    deletions: numberValue(pr.deletions),
  };
}

export async function GET(request: Request) {
  const token = githubToken();
  if (!token) {
    return jsonResponse({ connected: false, error: "Set GITHUB_TOKEN to enable the connected GitHub workspace." }, 200);
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "status";

  try {
    return await withTimeout(async (signal) => {
      if (action === "status") {
        const response = await githubFetch("/user", token, signal);
        if (!response.ok) return githubError(response, "GitHub connection status could not be checked.");
        const payload: unknown = await response.json();
        const user = recordValue(payload);
        return jsonResponse({
          connected: true,
          identity: stringValue(user?.login) ?? "GitHub token",
        });
      }

      if (action === "repositories") {
        const response = await githubFetch("/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", token, signal);
        if (!response.ok) return githubError(response, "Repositories could not be fetched from GitHub.");
        const payload: unknown = await response.json();
        const repositories = Array.isArray(payload) ? payload.map(repositoryPayload).filter((repo) => repo !== null) : [];
        return jsonResponse({ connected: true, repositories });
      }

      if (action === "pulls") {
        const repository = validateRepository(url.searchParams.get("owner"), url.searchParams.get("repo"));
        if (!repository) return jsonResponse({ error: "A valid owner and repository are required." }, 400);

        const response = await githubFetch(`/repos/${repository.owner}/${repository.repo}/pulls?state=open&per_page=50&sort=updated&direction=desc`, token, signal);
        if (!response.ok) return githubError(response, "Open pull requests could not be fetched from GitHub.");
        const payload: unknown = await response.json();
        const pullRequests = Array.isArray(payload) ? payload.map(pullRequestPayload).filter((pr) => pr !== null) : [];
        return jsonResponse({ connected: true, pullRequests });
      }

      return jsonResponse({ error: "Unsupported GitHub workspace action." }, 400);
    });
  } catch {
    return jsonResponse({ error: "GitHub did not respond in time." }, 504);
  }
}

export async function POST(request: Request) {
  const token = githubToken();
  if (!token) {
    return jsonResponse({ error: "Set GITHUB_TOKEN to enable the connected GitHub workspace." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request." }, 400);
  }

  const record = recordValue(body);
  const repository = validateRepository(record?.owner, record?.repo);
  const number = validatePullRequestNumber(record?.number);
  const repositoryIsPrivate = record?.private === true;
  if (!repository || !number) return jsonResponse({ error: "A valid repository and pull request number are required." }, 400);

  try {
    return await withTimeout(async (signal) => {
      const metadataResponse = await githubFetch(`/repos/${repository.owner}/${repository.repo}/pulls/${number}`, token, signal);
      if (!metadataResponse.ok) return githubError(metadataResponse, "Pull request metadata could not be fetched from GitHub.");
      const metadata: unknown = await metadataResponse.json();

      const diffResponse = await githubFetch(`/repos/${repository.owner}/${repository.repo}/pulls/${number}`, token, signal, "application/vnd.github.v3.diff");
      if (!diffResponse.ok) return githubError(diffResponse, "Pull request diff could not be fetched from GitHub.");

      const { text: diff, exceeded } = await readTextWithLimit(diffResponse);
      if (exceeded) return jsonResponse({ error: `This diff exceeds the ${MAX_DIFF_CHARS.toLocaleString()} character limit.` }, 413);
      if (!diff.trim() || !/^diff --git /m.test(diff)) return jsonResponse({ error: "GitHub returned an empty or invalid pull request diff." }, 502);

      const payload = importPayload(metadata, diff, repository.owner, repository.repo, repositoryIsPrivate);
      if (!payload) return jsonResponse({ error: "GitHub returned malformed pull request metadata." }, 502);
      return jsonResponse(payload);
    });
  } catch {
    return jsonResponse({ error: "GitHub did not respond in time." }, 504);
  }
}
