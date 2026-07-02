export const runtime = "nodejs";

export const MAX_DIFF_CHARS = 200_000;

const MAX_REQUEST_BYTES = 2_000;
const FETCH_TIMEOUT_MS = 12_000;
const OWNER_PATTERN = /^[A-Za-z0-9-]+$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+$/;
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };
const DIFF_REQUEST_HEADERS = {
  Accept: "text/plain",
  "User-Agent": "Lintel-public-pr-import",
};

type GitHubPullRequest = {
  owner: string;
  repository: string;
  number: string;
};

type UnknownRecord = Record<string, unknown>;

function jsonResponse(body: UnknownRecord, status = 200) {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

function parseGitHubPullRequestUrl(value: unknown): GitHubPullRequest | null {
  if (typeof value !== "string") return null;
  const submittedUrl = value.trim();
  if (!submittedUrl || submittedUrl.length > 500) return null;

  const authority = submittedUrl.match(/^https:\/\/([^/?#]+)/i)?.[1];
  if (!authority || authority.includes("@") || authority.includes(":")) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(submittedUrl);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== "https:") return null;
  if (parsedUrl.username || parsedUrl.password || parsedUrl.port) return null;
  if (parsedUrl.search || parsedUrl.hash) return null;

  const hostname = parsedUrl.hostname.toLowerCase();
  if (hostname !== "github.com" && hostname !== "www.github.com") return null;

  const pathMatch = parsedUrl.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/([1-9]\d*)\/?$/);
  if (!pathMatch) return null;

  const [, owner, repository, number] = pathMatch;
  if (owner.length > 39 || repository.length > 100 || number.length > 12) return null;
  if (!OWNER_PATTERN.test(owner) || !REPOSITORY_PATTERN.test(repository)) return null;
  if (owner === "." || owner === ".." || repository === "." || repository === "..") return null;

  return { owner, repository, number };
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

async function fetchPullRequestTitle(metadataUrl: string, signal: AbortSignal) {
  try {
    const response = await fetch(metadataUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Lintel-public-pr-import",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
      redirect: "error",
      signal,
    });

    if (!response.ok) return undefined;
    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || !("title" in payload)) return undefined;
    if (typeof payload.title !== "string") return undefined;

    const title = payload.title.trim();
    return title ? title.slice(0, 500) : undefined;
  } catch {
    return undefined;
  }
}

async function fetchGitHubDiff(diffUrl: string, signal: AbortSignal) {
  const response = await fetch(diffUrl, {
    headers: DIFF_REQUEST_HEADERS,
    cache: "no-store",
    redirect: "manual",
    signal,
  });

  if (response.status < 300 || response.status >= 400) return response;

  const location = response.headers.get("location");
  if (!location) throw new Error("GitHub diff redirect is missing a location.");

  const redirectUrl = new URL(location, diffUrl);
  if (
    redirectUrl.protocol !== "https:"
    || redirectUrl.hostname.toLowerCase() !== "patch-diff.githubusercontent.com"
    || redirectUrl.username
    || redirectUrl.password
    || redirectUrl.port
  ) {
    throw new Error("GitHub diff redirect is not trusted.");
  }

  await response.body?.cancel();
  return fetch(redirectUrl, {
    headers: DIFF_REQUEST_HEADERS,
    cache: "no-store",
    redirect: "error",
    signal,
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "The request is too large." }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request." }, 400);
  }

  if (typeof body !== "object" || body === null || !("url" in body)) {
    return jsonResponse({ error: "A public GitHub pull request URL is required." }, 400);
  }

  const pullRequest = parseGitHubPullRequestUrl(body.url);
  if (!pullRequest) {
    return jsonResponse({ error: "Enter a valid public GitHub PR URL without query parameters or fragments." }, 400);
  }

  const { owner, repository, number } = pullRequest;
  const diffUrl = `https://github.com/${owner}/${repository}/pull/${number}.diff`;
  const metadataUrl = `https://api.github.com/repos/${owner}/${repository}/pulls/${number}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const titlePromise = fetchPullRequestTitle(metadataUrl, controller.signal);
    const response = await fetchGitHubDiff(diffUrl, controller.signal);

    if (response.status === 404) {
      return jsonResponse({ error: "This public pull request could not be found." }, 404);
    }
    if (response.status === 403 || response.status === 429) {
      return jsonResponse({ error: "GitHub rate-limited this request. Please try again later." }, 429);
    }
    if (!response.ok) {
      return jsonResponse({ error: "GitHub could not provide this pull request diff." }, 502);
    }

    const { text: diff, exceeded } = await readTextWithLimit(response);
    if (exceeded) {
      return jsonResponse({ error: `This diff exceeds the ${MAX_DIFF_CHARS.toLocaleString()} character limit.` }, 413);
    }
    if (!diff.trim() || !/^diff --git /m.test(diff)) {
      return jsonResponse({ error: "GitHub returned an empty or invalid pull request diff." }, 502);
    }

    const title = await titlePromise;
    return jsonResponse({
      repository: `${owner}/${repository}`,
      diff,
      ...(title ? { title } : {}),
    });
  } catch {
    if (controller.signal.aborted) {
      return jsonResponse({ error: "GitHub took too long to return this pull request." }, 504);
    }
    return jsonResponse({ error: "The pull request could not be fetched from GitHub." }, 502);
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}
