import { createSign } from "node:crypto";

const GITHUB_API = "https://api.github.com";
const USER_AGENT = "Lintel-github-app";

export type GitHubAppSafeError =
  | "missing_app_configuration"
  | "invalid_app_credentials"
  | "unavailable_installation"
  | "installation_token_failure"
  | "insufficient_repository_access"
  | "github_rate_limited"
  | "github_unavailable";

export type GitHubAppResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: GitHubAppSafeError };

type GitHubAppConfig = {
  appId: string;
  privateKey: string;
};

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function appConfig(): GitHubAppResult<GitHubAppConfig> {
  const appId = process.env.GITHUB_APP_ID?.trim();
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.trim().replace(/\\n/g, "\n");

  if (!appId || !privateKey) return { ok: false, error: "missing_app_configuration" };
  return { ok: true, value: { appId, privateKey } };
}

export function isGitHubAppConfigured() {
  return appConfig().ok;
}

export function createGitHubAppJwt(): GitHubAppResult<string> {
  const config = appConfig();
  if (!config.ok) return config;

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = base64Url(JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: config.value.appId,
    }));
    const signingInput = `${header}.${payload}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signingInput);
    signer.end();
    const signature = signer.sign(config.value.privateKey);

    return { ok: true, value: `${signingInput}.${base64Url(signature)}` };
  } catch {
    return { ok: false, error: "invalid_app_credentials" };
  }
}

function safeGitHubError(response: Response): GitHubAppSafeError {
  if (response.status === 401) return "invalid_app_credentials";
  if (response.status === 403 || response.status === 429) return "github_rate_limited";
  if (response.status === 404) return "unavailable_installation";
  return "github_unavailable";
}

export async function githubAppFetch(path: string, jwt: string, init?: RequestInit) {
  return fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${jwt}`,
      "User-Agent": USER_AGENT,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function getGitHubAppStatus(): Promise<GitHubAppResult<{ slug?: string; name?: string }>> {
  const jwt = createGitHubAppJwt();
  if (!jwt.ok) return jwt;

  try {
    const response = await githubAppFetch("/app", jwt.value);
    if (!response.ok) return { ok: false, error: safeGitHubError(response) };

    const payload: unknown = await response.json();
    const record = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
    return {
      ok: true,
      value: {
        slug: typeof record.slug === "string" ? record.slug : undefined,
        name: typeof record.name === "string" ? record.name : undefined,
      },
    };
  } catch {
    return { ok: false, error: "github_unavailable" };
  }
}

export async function createInstallationToken(installationId: number): Promise<GitHubAppResult<string>> {
  const jwt = createGitHubAppJwt();
  if (!jwt.ok) return jwt;

  try {
    const response = await githubAppFetch(`/app/installations/${installationId}/access_tokens`, jwt.value, { method: "POST" });
    if (!response.ok) return { ok: false, error: response.status === 404 ? "unavailable_installation" : safeGitHubError(response) };

    const payload: unknown = await response.json();
    const token = typeof payload === "object" && payload !== null && typeof (payload as Record<string, unknown>).token === "string"
      ? (payload as Record<string, string>).token
      : null;

    return token ? { ok: true, value: token } : { ok: false, error: "installation_token_failure" };
  } catch {
    return { ok: false, error: "installation_token_failure" };
  }
}

export async function installationFetch(path: string, token: string, accept = "application/vnd.github+json") {
  return fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
}

export function installationFetchError(response: Response): GitHubAppSafeError {
  if (response.status === 401) return "installation_token_failure";
  if (response.status === 403 || response.status === 429) return "github_rate_limited";
  if (response.status === 404) return "insufficient_repository_access";
  return "github_unavailable";
}
