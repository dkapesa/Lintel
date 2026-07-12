import type { Report } from "./mock-report";
import { shortSha, type ReadinessDelta } from "./readiness-delta";
import { decisionConditions, deduplicateReportItems, pruneUnsupportedReviewerFocus } from "./report-quality";

export const LINTEL_COMMENT_MARKER = "<!-- lintel:merge-readiness -->";

export type GitHubCommentPublishError =
  | "comment_permission_missing"
  | "comment_rate_limited"
  | "comment_not_found"
  | "comment_publish_failure";

export type GitHubCommentPublishResult =
  | { ok: true; commentId: number; htmlUrl?: string; mode: "created" | "updated" }
  | { ok: false; error: GitHubCommentPublishError };

type CommentRecord = {
  id: number;
  body?: string;
  html_url?: string;
};

function safeMarkdownText(value: string) {
  return value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/m, "[Raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim();
}

function bulletList(items: string[], emptyCopy: string, limit = 5) {
  const values = deduplicateReportItems(items).slice(0, limit);
  if (values.length === 0) return emptyCopy;
  return values.map((item) => `- ${safeMarkdownText(item)}`).join("\n");
}

function nextAction(report: Report) {
  if (report.verdict.recommendation === "APPROVE") return "Complete normal human review and CI checks.";
  if (report.missingTests.length > 0) return "Add the missing focused tests and re-check readiness.";
  if (decisionConditions(report.conditionsBeforeMerge).length > 0) return "Resolve the merge conditions before approving.";
  if (report.findings.length > 0) return "Complete focused engineering review on the findings.";
  return "Review the report and clear any remaining local decision state.";
}

function topBlockers(report: Report) {
  return [
    ...decisionConditions(report.conditionsBeforeMerge),
    ...report.findings.map((finding) => `${finding.severity} ${finding.category}: ${finding.title}`),
  ];
}

function reviewerFocus(report: Report) {
  return pruneUnsupportedReviewerFocus(report)?.map((item) => `${item.priority}: ${item.area}`) ?? [];
}

function deltaSection(delta?: ReadinessDelta) {
  if (!delta) {
    return [
      "### Readiness delta",
      "Initial readiness baseline for this automated analysis.",
    ];
  }

  if (delta.classification === "initial" || delta.previousScore === undefined || !delta.previousHeadSha) {
    return [
      "### Readiness delta",
      `Initial readiness baseline at \`${safeMarkdownText(shortSha(delta.currentHeadSha))}\`.`,
    ];
  }

  const scoreChange = delta.scoreChange === undefined
    ? "No score movement recorded"
    : `${delta.previousScore} → ${delta.currentScore} (${delta.scoreChange > 0 ? "+" : ""}${delta.scoreChange})`;
  const recommendation = delta.recommendationChanged
    ? `${delta.previousRecommendation?.replaceAll("_", " ")} → ${delta.currentRecommendation.replaceAll("_", " ")}`
    : delta.currentRecommendation.replaceAll("_", " ");
  const stillOpenCount = delta.unchangedOpenMergeConditions.length + delta.openedMergeConditions.length + delta.reopenedMergeConditions.length;

  return [
    "### Readiness delta",
    "Since the previous analysis:",
    `- Readiness: ${safeMarkdownText(scoreChange)}`,
    `- Recommendation: ${safeMarkdownText(recommendation)}`,
    `- Cleared: ${delta.clearedMergeConditions.length} conditions`,
    `- Opened: ${delta.openedMergeConditions.length + delta.reopenedMergeConditions.length} conditions`,
    `- Still open: ${stillOpenCount} ${stillOpenCount === 1 ? "condition" : "conditions"}`,
  ];
}

export function githubDecisionCommentBody(report: Report, options: { headSha: string; analysedAt: string; reportUrl?: string; delta?: ReadinessDelta }) {
  const recommendation = report.verdict.recommendation.replaceAll("_", " ");
  const shortSha = options.headSha.slice(0, 7);

  return [
    LINTEL_COMMENT_MARKER,
    "## Lintel merge-readiness decision",
    "",
    `**Recommendation:** ${recommendation}`,
    `**Risk:** ${report.verdict.riskLevel} (${report.verdict.riskScore}/100)`,
    `**Head SHA:** \`${safeMarkdownText(shortSha)}\``,
    `**Analysed:** ${safeMarkdownText(options.analysedAt)}`,
    `**Source:** GitHub App automated analysis`,
    "",
    "### Top blockers",
    bulletList(topBlockers(report), "No blockers detected.", 4),
    "",
    "### Missing tests or evidence",
    bulletList(report.missingTests, "No missing test gaps detected.", 5),
    "",
    "### Conditions before merge",
    bulletList(decisionConditions(report.conditionsBeforeMerge), "No merge conditions detected.", 6),
    "",
    ...deltaSection(options.delta),
    "",
    "### Reviewer focus",
    bulletList(reviewerFocus(report), "No specialist reviewer focus detected.", 4),
    "",
    "### Next action",
    safeMarkdownText(nextAction(report)),
    "",
    options.reportUrl ? `[Open in Lintel](${options.reportUrl})` : "_Open the local Lintel workspace to inspect the full report._",
    "",
    "_Lintel does not block merging by default. Treat this as a merge-readiness decision aid alongside human review and CI._",
  ].join("\n");
}

function safeCommentError(response: Response): GitHubCommentPublishError {
  if (response.status === 403) return "comment_permission_missing";
  if (response.status === 404) return "comment_not_found";
  if (response.status === 429) return "comment_rate_limited";
  return "comment_publish_failure";
}

async function githubCommentFetch(path: string, token: string, init?: RequestInit) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Lintel-github-app",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function updateComment(owner: string, repo: string, commentId: number, token: string, body: string): Promise<GitHubCommentPublishResult> {
  const response = await githubCommentFetch(`/repos/${owner}/${repo}/issues/comments/${commentId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
  if (!response.ok) return { ok: false, error: safeCommentError(response) };
  const payload = await response.json() as Partial<CommentRecord>;
  return { ok: true, commentId: payload.id ?? commentId, htmlUrl: payload.html_url, mode: "updated" };
}

async function readComment(owner: string, repo: string, commentId: number, token: string): Promise<CommentRecord | GitHubCommentPublishError> {
  const response = await githubCommentFetch(`/repos/${owner}/${repo}/issues/comments/${commentId}`, token);
  if (!response.ok) return safeCommentError(response);
  const payload = await response.json() as Partial<CommentRecord>;
  return typeof payload.id === "number"
    ? { id: payload.id, body: payload.body, html_url: payload.html_url }
    : "comment_publish_failure";
}

async function listComments(owner: string, repo: string, number: number, token: string): Promise<CommentRecord[] | GitHubCommentPublishError> {
  const response = await githubCommentFetch(`/repos/${owner}/${repo}/issues/${number}/comments?per_page=100`, token);
  if (!response.ok) return safeCommentError(response);
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) return "comment_publish_failure";
  return payload.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const record = item as Partial<CommentRecord>;
    return typeof record.id === "number" ? [{ id: record.id, body: record.body, html_url: record.html_url }] : [];
  });
}

async function createComment(owner: string, repo: string, number: number, token: string, body: string): Promise<GitHubCommentPublishResult> {
  const response = await githubCommentFetch(`/repos/${owner}/${repo}/issues/${number}/comments`, token, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  if (!response.ok) return { ok: false, error: safeCommentError(response) };
  const payload = await response.json() as Partial<CommentRecord>;
  return typeof payload.id === "number"
    ? { ok: true, commentId: payload.id, htmlUrl: payload.html_url, mode: "created" }
    : { ok: false, error: "comment_publish_failure" };
}

export async function publishGitHubDecisionComment({
  owner,
  repo,
  number,
  token,
  body,
  storedCommentId,
}: {
  owner: string;
  repo: string;
  number: number;
  token: string;
  body: string;
  storedCommentId?: number;
}): Promise<GitHubCommentPublishResult> {
  if (storedCommentId) {
    const existingStoredComment = await readComment(owner, repo, storedCommentId, token);
    if (typeof existingStoredComment !== "string" && existingStoredComment.body?.includes(LINTEL_COMMENT_MARKER)) {
      const updated = await updateComment(owner, repo, storedCommentId, token, body);
      if (updated.ok || updated.error !== "comment_not_found") return updated;
    } else if (typeof existingStoredComment === "string" && existingStoredComment !== "comment_not_found") {
      return { ok: false, error: existingStoredComment };
    }
  }

  const comments = await listComments(owner, repo, number, token);
  if (typeof comments === "string") return { ok: false, error: comments };

  const existing = comments.find((comment) => comment.body?.includes(LINTEL_COMMENT_MARKER));
  if (existing) return updateComment(owner, repo, existing.id, token, body);

  return createComment(owner, repo, number, token, body);
}
