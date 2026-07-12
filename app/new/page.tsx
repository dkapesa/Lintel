"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { generateReport, GENERATED_REPORT_STORAGE_KEY, type ReportInput, type ReportInputSource } from "../../lib/report-generator";
import { addReportToHistory, clearReportHistory, deleteReportFromHistory, readReportHistory, type ReportHistoryEntry } from "../../lib/report-history";
import type { Report } from "../../lib/mock-report";
import { shortSha, type ReadinessDelta } from "../../lib/readiness-delta";
import { PR_SAMPLES } from "../../lib/sample-pr-input";
import { inferStack } from "../../lib/stack-inference";
import { REVIEW_PROFILES, reviewProfileDescription, type ReviewProfile } from "../../lib/review-profiles";

type ReportSource = "ai" | "deterministic";

type StoredReport = {
  report: Report;
  source: ReportSource;
  readinessDelta?: ReadinessDelta;
};

type GitHubImportResponse = {
  repository: string;
  owner: string;
  repo: string;
  number: number;
  url: string;
  publicRepository: boolean;
  diff: string;
  title?: string;
  author?: string;
  state?: string;
  baseBranch?: string;
  headBranch?: string;
  changedFiles?: number;
  additions?: number;
  deletions?: number;
};

type GitHubWorkspaceStatus = {
  connected: boolean;
  identity?: string;
  error?: string;
};

type GitHubWorkspaceRepository = {
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  updatedAt?: string;
};

type GitHubWorkspacePullRequest = {
  number: number;
  title: string;
  author?: string;
  state?: string;
  baseBranch?: string;
  headBranch?: string;
  updatedAt?: string;
};

type GitHubAppStatus = {
  configured: boolean;
  authenticated: boolean;
  slug?: string;
  name?: string;
  error?: string;
};

type GitHubAppInstallation = {
  installationId: number;
  accountLogin?: string;
  active: boolean;
  updatedAt: string;
};

type GitHubAppRepository = {
  installationId: number;
  repositoryId: number;
  owner: string;
  name: string;
  visibility: "public" | "private";
  enabled: boolean;
  active: boolean;
  updatedAt: string;
};

type GitHubAppPullRequest = {
  id: string;
  installationId: number;
  repositoryId: number;
  owner: string;
  repository: string;
  number: number;
  title?: string;
  baseSha?: string;
  headSha: string;
  state: string;
  failureCategory?: string;
  latestReport?: Report;
  reportSource?: "deterministic";
  latestDelta?: ReadinessDelta;
  deltaFailureCategory?: string;
  analysisRuns?: Array<{
    runId: string;
    headSha: string;
    recommendation: string;
    readinessScore: number;
    riskLevel: string;
    completedAt: string;
    delta?: ReadinessDelta;
    deltaFailureCategory?: string;
  }>;
  commentPublishingState?: string;
  commentFailureCategory?: string;
  githubCommentHtmlUrl?: string;
  latestPublishedHeadSha?: string;
  latestPublishedAt?: string;
  updatedAt: string;
};

type GitHubAppDelivery = {
  deliveryId: string;
  event: string;
  action?: string;
  state: string;
  failureCategory?: string;
  updatedAt: string;
};

type ImportStatus = {
  type: "loading" | "success" | "error";
  message: string;
};

function isReportResponse(value: unknown): value is StoredReport {
  if (typeof value !== "object" || value === null || !("report" in value) || !("source" in value)) return false;
  const report = value.report;
  return (value.source === "ai" || value.source === "deterministic")
    && typeof report === "object"
    && report !== null
    && "pr" in report
    && "verdict" in report
    && "findings" in report
    && Array.isArray(report.findings);
}

function isGitHubImportResponse(value: unknown): value is GitHubImportResponse {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (!("repository" in value) || typeof value.repository !== "string" || !value.repository.trim()) return false;
  if (!("owner" in value) || typeof value.owner !== "string" || !value.owner.trim()) return false;
  if (!("repo" in value) || typeof value.repo !== "string" || !value.repo.trim()) return false;
  if (!("number" in value) || typeof value.number !== "number" || !Number.isFinite(value.number)) return false;
  if (!("url" in value) || typeof value.url !== "string" || !value.url.trim()) return false;
  if (!("publicRepository" in value) || typeof value.publicRepository !== "boolean") return false;
  if (!("diff" in value) || typeof value.diff !== "string" || !value.diff.trim()) return false;
  return ["title", "author", "state", "baseBranch", "headBranch"].every((key) => (
    !(key in record) || record[key] === undefined || typeof record[key] === "string"
  ))
    && ["changedFiles", "additions", "deletions"].every((key) => (
      !(key in record) || record[key] === undefined || typeof record[key] === "number"
    ));
}

function importErrorMessage(value: unknown) {
  if (typeof value !== "object" || value === null || !("error" in value)) return null;
  return typeof value.error === "string" ? value.error : null;
}

function isGitHubWorkspaceStatus(value: unknown): value is GitHubWorkspaceStatus {
  if (typeof value !== "object" || value === null || !("connected" in value) || typeof value.connected !== "boolean") return false;
  return true;
}

function isRepositoryListResponse(value: unknown): value is { repositories: GitHubWorkspaceRepository[] } {
  if (typeof value !== "object" || value === null || !("repositories" in value) || !Array.isArray(value.repositories)) return false;
  return value.repositories.every((repo) => (
    typeof repo === "object"
    && repo !== null
    && "owner" in repo
    && typeof repo.owner === "string"
    && "name" in repo
    && typeof repo.name === "string"
    && "fullName" in repo
    && typeof repo.fullName === "string"
    && "private" in repo
    && typeof repo.private === "boolean"
  ));
}

function isPullRequestListResponse(value: unknown): value is { pullRequests: GitHubWorkspacePullRequest[] } {
  if (typeof value !== "object" || value === null || !("pullRequests" in value) || !Array.isArray(value.pullRequests)) return false;
  return value.pullRequests.every((pr) => (
    typeof pr === "object"
    && pr !== null
    && "number" in pr
    && typeof pr.number === "number"
    && "title" in pr
    && typeof pr.title === "string"
  ));
}

function arrayField<T>(value: unknown, field: string): T[] {
  if (typeof value !== "object" || value === null || !(field in value) || !Array.isArray((value as Record<string, unknown>)[field])) return [];
  return (value as Record<string, T[]>)[field];
}

function historySourceLabel(source: ReportHistoryEntry["source"]) {
  return source === "ai" ? "Baseline + model-assisted" : "Baseline only";
}

function historyTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function deltaIndicator(delta?: ReadinessDelta, failureCategory?: string) {
  if (failureCategory) return `Delta unavailable: ${failureCategory}`;
  if (!delta || delta.classification === "initial") return "Initial analysis";
  if (delta.classification === "unchanged") return "No material change";
  if (delta.classification === "mixed") return "Mixed";
  if (typeof delta.scoreChange === "number" && delta.scoreChange !== 0) {
    const sign = delta.scoreChange > 0 ? "+" : "";
    return `${sign}${delta.scoreChange} ${delta.classification}`;
  }
  return delta.classification;
}

function deltaIndicatorWithSha(delta?: ReadinessDelta, failureCategory?: string) {
  const label = deltaIndicator(delta, failureCategory);
  if (!delta || !delta.previousHeadSha || delta.classification === "initial") return label;
  return `${label} (${shortSha(delta.previousHeadSha)} → ${shortSha(delta.currentHeadSha)})`;
}

export default function NewReportPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingDiff, setIsFetchingDiff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [importedPullRequest, setImportedPullRequest] = useState<GitHubImportResponse | null>(null);
  const [githubImportMode, setGitHubImportMode] = useState<"public-url" | "connected" | null>(null);
  const [githubWorkspaceStatus, setGitHubWorkspaceStatus] = useState<GitHubWorkspaceStatus | null>(null);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);
  const [isLoadingPullRequests, setIsLoadingPullRequests] = useState(false);
  const [repositories, setRepositories] = useState<GitHubWorkspaceRepository[]>([]);
  const [repositorySearch, setRepositorySearch] = useState("");
  const [selectedRepository, setSelectedRepository] = useState<GitHubWorkspaceRepository | null>(null);
  const [pullRequests, setPullRequests] = useState<GitHubWorkspacePullRequest[]>([]);
  const [githubAppStatus, setGitHubAppStatus] = useState<GitHubAppStatus | null>(null);
  const [githubAppInstallations, setGitHubAppInstallations] = useState<GitHubAppInstallation[]>([]);
  const [githubAppRepositories, setGitHubAppRepositories] = useState<GitHubAppRepository[]>([]);
  const [githubAppPullRequests, setGitHubAppPullRequests] = useState<GitHubAppPullRequest[]>([]);
  const [githubAppDeliveries, setGitHubAppDeliveries] = useState<GitHubAppDelivery[]>([]);
  const [isLoadingGitHubApp, setIsLoadingGitHubApp] = useState(false);
  const [githubUrl, setGitHubUrl] = useState("");
  const [title, setTitle] = useState("");
  const [repository, setRepository] = useState("");
  const [technology, setTechnology] = useState("");
  const [diff, setDiff] = useState("");
  const [inputSource, setInputSource] = useState<ReportInputSource>("pasted-diff");
  const [reviewProfile, setReviewProfile] = useState<ReviewProfile>("standard");
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const technologyValueRef = useRef("");
  const technologyEditedRef = useRef(false);
  const selectedReviewModeDescription = reviewProfileDescription(reviewProfile);
  const filteredRepositories = repositories.filter((repo) => (
    repo.fullName.toLowerCase().includes(repositorySearch.trim().toLowerCase())
  ));

  function updateTechnology(value: string, manuallyEdited: boolean) {
    technologyValueRef.current = value;
    technologyEditedRef.current = manuallyEdited;
    setTechnology(value);
  }

  useEffect(() => {
    try {
      setHistory(readReportHistory(window.localStorage));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadGitHubAppManagement();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadGitHubStatus() {
      try {
        const response = await fetch("/api/github-workspace?action=status", { cache: "no-store" });
        const payload: unknown = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setGitHubWorkspaceStatus({ connected: false, error: importErrorMessage(payload) ?? "GitHub workspace status could not be checked." });
          return;
        }
        if (!isGitHubWorkspaceStatus(payload)) {
          setGitHubWorkspaceStatus({ connected: false, error: "GitHub workspace status could not be read." });
          return;
        }
        setGitHubWorkspaceStatus(payload);
        if (payload.connected) loadRepositories();
      } catch {
        if (!cancelled) setGitHubWorkspaceStatus({ connected: false, error: "GitHub workspace status could not be checked." });
      }
    }

    loadGitHubStatus();
    return () => { cancelled = true; };
  }, []);

  function useSample(sample: ReportInput) {
    setTitle(sample.title);
    setRepository(sample.repository);
    updateTechnology(sample.technology, false);
    setDiff(sample.diff);
    setInputSource("sample");
    setImportStatus(null);
    setImportedPullRequest(null);
    setGitHubImportMode(null);
  }

  function clearGitHubImport() {
    setImportedPullRequest(null);
    setGitHubImportMode(null);
    setGitHubUrl("");
    setTitle("");
    setRepository("");
    updateTechnology("", false);
    setDiff("");
    setImportStatus(null);
    if (inputSource === "github-pr") setInputSource("pasted-diff");
  }

  function changeGitHubImport() {
    setImportedPullRequest(null);
    setGitHubImportMode(null);
    setImportStatus(null);
    if (inputSource === "github-pr") setInputSource("pasted-diff");
  }

  function changeConnectedRepository() {
    setImportedPullRequest(null);
    setGitHubImportMode(null);
    setSelectedRepository(null);
    setPullRequests([]);
    setImportStatus(null);
    if (inputSource === "github-pr") setInputSource("pasted-diff");
  }

  function disconnectConnectedSelection() {
    changeConnectedRepository();
    setRepositorySearch("");
  }

  async function loadRepositories() {
    setIsLoadingRepositories(true);

    try {
      const response = await fetch("/api/github-workspace?action=repositories", { cache: "no-store" });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(importErrorMessage(payload) ?? "Repositories could not be fetched.");
      if (!isRepositoryListResponse(payload)) throw new Error("GitHub returned an invalid repository list.");
      setRepositories(payload.repositories);
      setImportStatus(payload.repositories.length === 0 ? { type: "error", message: "No repositories are available to this GitHub token. Manual paste and public URL import are still available." } : null);
    } catch (repoError) {
      setImportStatus({ type: "error", message: repoError instanceof Error ? repoError.message : "Repositories could not be fetched." });
    } finally {
      setIsLoadingRepositories(false);
    }
  }

  async function loadPullRequests(repo: GitHubWorkspaceRepository) {
    setSelectedRepository(repo);
    setPullRequests([]);
    setImportedPullRequest(null);
    setGitHubImportMode(null);
    setIsLoadingPullRequests(true);
    setImportStatus({ type: "loading", message: `Fetching open pull requests for ${repo.fullName}...` });

    try {
      const response = await fetch(`/api/github-workspace?action=pulls&owner=${encodeURIComponent(repo.owner)}&repo=${encodeURIComponent(repo.name)}`, { cache: "no-store" });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(importErrorMessage(payload) ?? "Open pull requests could not be fetched.");
      if (!isPullRequestListResponse(payload)) throw new Error("GitHub returned an invalid pull request list.");
      setPullRequests(payload.pullRequests);
      setImportStatus(payload.pullRequests.length === 0
        ? { type: "error", message: `${repo.fullName} has no open pull requests. Manual paste and public URL import are still available.` }
        : { type: "success", message: `Choose an open pull request from ${repo.fullName}.` });
    } catch (prError) {
      setImportStatus({ type: "error", message: prError instanceof Error ? prError.message : "Open pull requests could not be fetched." });
    } finally {
      setIsLoadingPullRequests(false);
    }
  }

  async function importConnectedPullRequest(repo: GitHubWorkspaceRepository, pr: GitHubWorkspacePullRequest) {
    setIsFetchingDiff(true);
    setImportStatus({ type: "loading", message: `Importing ${repo.fullName} #${pr.number}...` });

    try {
      const response = await fetch("/api/github-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: repo.owner, repo: repo.name, number: pr.number, private: repo.private }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(importErrorMessage(payload) ?? "The pull request could not be imported.");
      if (!isGitHubImportResponse(payload)) throw new Error("GitHub returned an invalid import response.");

      setImportedPullRequest(payload);
      setGitHubImportMode("connected");
      setRepository(payload.repository);
      setDiff(payload.diff);
      setInputSource("github-pr");
      const inferredTechnology = inferStack(payload.diff);
      if (inferredTechnology && (!technologyEditedRef.current || !technologyValueRef.current.trim())) {
        updateTechnology(inferredTechnology, false);
      }
      if (payload.title?.trim()) setTitle(payload.title.trim());
      setError(null);
      setImportStatus({ type: "success", message: "Pull request imported from connected GitHub. Review the context and run the readiness review when ready." });
    } catch (importError) {
      setImportStatus({ type: "error", message: importError instanceof Error ? importError.message : "The pull request could not be imported." });
      setImportedPullRequest(null);
      setGitHubImportMode(null);
    } finally {
      setIsFetchingDiff(false);
    }
  }

  async function loadGitHubAppManagement() {
    setIsLoadingGitHubApp(true);

    try {
      const [statusResponse, installationsResponse, repositoriesResponse, pullRequestsResponse, deliveriesResponse] = await Promise.all([
        fetch("/api/github-app?view=status", { cache: "no-store" }),
        fetch("/api/github-app?view=installations", { cache: "no-store" }),
        fetch("/api/github-app?view=repositories", { cache: "no-store" }),
        fetch("/api/github-app?view=pull-requests", { cache: "no-store" }),
        fetch("/api/github-app?view=deliveries", { cache: "no-store" }),
      ]);

      const [statusPayload, installationsPayload, repositoriesPayload, pullRequestsPayload, deliveriesPayload] = await Promise.all([
        statusResponse.json() as Promise<GitHubAppStatus>,
        installationsResponse.json() as Promise<unknown>,
        repositoriesResponse.json() as Promise<unknown>,
        pullRequestsResponse.json() as Promise<unknown>,
        deliveriesResponse.json() as Promise<unknown>,
      ]);

      setGitHubAppStatus(statusPayload);
      setGitHubAppInstallations(arrayField<GitHubAppInstallation>(installationsPayload, "installations"));
      setGitHubAppRepositories(arrayField<GitHubAppRepository>(repositoriesPayload, "repositories"));
      setGitHubAppPullRequests(arrayField<GitHubAppPullRequest>(pullRequestsPayload, "pullRequests"));
      setGitHubAppDeliveries(arrayField<GitHubAppDelivery>(deliveriesPayload, "deliveries"));
    } catch {
      setGitHubAppStatus({ configured: false, authenticated: false, error: "local_store_unavailable" });
    } finally {
      setIsLoadingGitHubApp(false);
    }
  }

  async function setGitHubAppRepositoryEnabled(repo: GitHubAppRepository, enabled: boolean) {
    try {
      const response = await fetch("/api/github-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-repository-enabled",
          installationId: repo.installationId,
          repositoryId: repo.repositoryId,
          enabled,
        }),
      });
      if (!response.ok) throw new Error("Repository state could not be updated.");
      await loadGitHubAppManagement();
    } catch {
      setImportStatus({ type: "error", message: "Local GitHub App repository state could not be updated." });
    }
  }

  function openAutomatedReport(pr: GitHubAppPullRequest) {
    if (!pr.latestReport) {
      setImportStatus({ type: "error", message: "This automated pull request does not have a completed report yet." });
      return;
    }

    try {
      sessionStorage.setItem(GENERATED_REPORT_STORAGE_KEY, JSON.stringify({
        report: pr.latestReport,
        source: pr.reportSource ?? "deterministic",
        readinessDelta: pr.latestDelta,
      }));
      router.push("/report");
    } catch {
      setImportStatus({ type: "error", message: "This automated report could not be opened locally." });
    }
  }

  async function handleFetchDiff() {
    if (!githubUrl.trim()) {
      setImportStatus({ type: "error", message: "Enter a public GitHub pull request URL first." });
      return;
    }

    setIsFetchingDiff(true);
    setImportStatus({ type: "loading", message: "Fetching the public pull request diff..." });

    try {
      const response = await fetch("/api/fetch-pr-diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl.trim() }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(importErrorMessage(payload) ?? "The pull request could not be imported.");
      }
      if (!isGitHubImportResponse(payload)) throw new Error("GitHub returned an invalid import response.");

      setImportedPullRequest(payload);
      setGitHubImportMode("public-url");
      setRepository(payload.repository);
      setDiff(payload.diff);
      setInputSource("github-pr");
      const inferredTechnology = inferStack(payload.diff);
      if (inferredTechnology && (!technologyEditedRef.current || !technologyValueRef.current.trim())) {
        updateTechnology(inferredTechnology, false);
      }
      if (payload.title?.trim()) setTitle(payload.title.trim());
      setError(null);
      setImportStatus({
        type: "success",
        message: "Pull request imported. Review the context and run the readiness review when ready.",
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "The pull request could not be imported.";
      setImportStatus({ type: "error", message });
      setImportedPullRequest(null);
    } finally {
      setIsFetchingDiff(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const input: ReportInput = {
      title: String(formData.get("title") ?? ""),
      repository: String(formData.get("repository") ?? ""),
      technology: String(formData.get("technology") ?? ""),
      diff: String(formData.get("diff") ?? ""),
      inputSource,
      reviewProfile,
    };

    try {
      let generatedReport: Report;
      let source: ReportSource;

      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (response.status === 413) {
          setError("This diff is too large for the prototype generator.");
          setIsGenerating(false);
          return;
        }
        if (!response.ok) throw new Error("Report route failed");

        const payload: unknown = await response.json();
        if (!isReportResponse(payload)) throw new Error("Invalid report response");
        generatedReport = payload.report;
        source = payload.source;
      } catch {
        generatedReport = generateReport(input);
        source = "deterministic";
      }

      sessionStorage.setItem(GENERATED_REPORT_STORAGE_KEY, JSON.stringify({ report: generatedReport, source }));
      try {
        setHistory(addReportToHistory(window.localStorage, generatedReport, source));
      } catch {
        // Report generation remains usable when persistent browser storage is unavailable.
      }
      router.push("/report");
    } catch {
      setError("The report could not be generated locally. Please try again.");
      setIsGenerating(false);
    }
  }

  function openHistoryReport(entry: ReportHistoryEntry) {
    try {
      sessionStorage.setItem(GENERATED_REPORT_STORAGE_KEY, JSON.stringify({ report: entry.report, source: entry.source }));
      router.push("/report");
    } catch {
      setError("This saved report could not be opened. Please try again.");
    }
  }

  function deleteHistoryReport(createdAt: string) {
    try {
      setHistory(deleteReportFromHistory(window.localStorage, createdAt));
    } catch {
      setError("This saved report could not be deleted.");
    }
  }

  function clearHistory() {
    try {
      setHistory(clearReportHistory(window.localStorage));
    } catch {
      setError("Report history could not be cleared.");
    }
  }

  return (
    <main className="new-page">
      <header className="new-topbar">
        <Link className="new-brand" href="/">
          <span className="brand-mark" aria-hidden="true">◢</span>
          <span>Lintel</span>
        </Link>
        <nav className="new-topbar-links" aria-label="Workspace navigation">
          <Link href="/workspace">Risk inbox</Link>
          <Link href="/settings">Analysis settings</Link>
          <Link href="/docs/security-model.md">Security model</Link>
        </nav>
      </header>

      <div className="new-content">
        <section className="new-intro">
          <div className="new-intro-actions">
            <span className="eyebrow">NEW REPORT</span>
            <label className="sample-picker">
              <span>Load sample</span>
              <select
                aria-label="Load sample pull request"
                defaultValue=""
                onChange={(event) => {
                  const sample = PR_SAMPLES.find((item) => item.id === event.target.value);
                  if (sample) useSample(sample.input);
                  event.target.value = "";
                }}
              >
                <option value="">Choose scenario</option>
                {PR_SAMPLES.map((sample) => (
                  <option key={sample.id} value={sample.id}>{sample.name}</option>
                ))}
              </select>
            </label>
          </div>
          <h1>Check merge readiness</h1>
          <p>Paste the PR context and diff. Lintel turns it into a merge-readiness checklist: recommendation, risks, missing tests, reviewer focus and conditions before merge.</p>
          <p className="new-trust-note">Local-first history stores generated reports, not raw diffs. <Link href="/docs/security-model.md">Read the security model.</Link></p>
        </section>

        <form className="report-form" onSubmit={handleSubmit}>
          <section className="connected-github" aria-labelledby="connected-github-title">
            <div className="connected-github-header">
              <div>
                <span className="card-kicker">CONNECTED SOURCE</span>
                <h2 id="connected-github-title">GitHub workspace</h2>
                <p>
                  {githubWorkspaceStatus?.connected
                    ? `Connected as ${githubWorkspaceStatus.identity ?? "GitHub token"}. Choose a repository and open pull request.`
                    : "Set GITHUB_TOKEN locally to browse repositories. Public URL import, samples and manual paste still work."}
                </p>
              </div>
              <span className={githubWorkspaceStatus?.connected ? "connected-github-state connected-github-state--on" : "connected-github-state"}>
                {githubWorkspaceStatus?.connected ? "Connected" : "Not configured"}
              </span>
            </div>

            {githubWorkspaceStatus?.connected ? (
              <div className="connected-github-body">
                <label className="connected-github-search">
                  <span>Repository search</span>
                  <input
                    type="search"
                    value={repositorySearch}
                    onChange={(event) => setRepositorySearch(event.target.value)}
                    placeholder="Filter loaded repositories"
                  />
                </label>
                <button type="button" onClick={loadRepositories} disabled={isLoadingRepositories || isGenerating}>
                  {isLoadingRepositories ? "Loading repositories..." : "Refresh repositories"}
                </button>

                <div className="connected-github-columns">
                  <section aria-label="Repositories">
                    <h3>Repositories</h3>
                    {repositories.length === 0 && !isLoadingRepositories ? (
                      <p className="connected-github-empty">No repositories loaded for this token.</p>
                    ) : (
                      <ul className="connected-github-list">
                        {filteredRepositories.slice(0, 40).map((repo) => (
                          <li key={repo.fullName}>
                            <button
                              type="button"
                              className={selectedRepository?.fullName === repo.fullName ? "connected-github-item connected-github-item--selected" : "connected-github-item"}
                              onClick={() => loadPullRequests(repo)}
                              disabled={isLoadingPullRequests || isGenerating}
                            >
                              <strong>{repo.fullName}</strong>
                              <span>{repo.private ? "Private" : "Public"} repository</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section aria-label="Open pull requests">
                    <h3>{selectedRepository ? `Open PRs in ${selectedRepository.fullName}` : "Open pull requests"}</h3>
                    {!selectedRepository ? (
                      <p className="connected-github-empty">Choose a repository to load open pull requests.</p>
                    ) : pullRequests.length === 0 && !isLoadingPullRequests ? (
                      <p className="connected-github-empty">No open pull requests found for this repository.</p>
                    ) : (
                      <ul className="connected-github-list">
                        {pullRequests.map((pr) => (
                          <li key={pr.number}>
                            <button
                              type="button"
                              className="connected-github-item"
                              onClick={() => importConnectedPullRequest(selectedRepository, pr)}
                              disabled={isFetchingDiff || isGenerating}
                            >
                              <strong>#{pr.number} {pr.title}</strong>
                              <span>{pr.author ?? "Unknown author"} / {pr.baseBranch ?? "base"} ← {pr.headBranch ?? "head"}{pr.updatedAt ? ` / updated ${new Date(pr.updatedAt).toLocaleDateString()}` : ""}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
                <p className="github-import-help">The token stays server-side. Raw diffs are fetched transiently for the selected PR and are not stored in local report history.</p>
              </div>
            ) : (
              <p className="github-import-help">
                {githubWorkspaceStatus?.error ?? "Connected GitHub browsing is optional for local development."}
              </p>
            )}
          </section>

          <section className="github-app-management" aria-labelledby="github-app-management-title">
            <div className="connected-github-header">
              <div>
                <span className="card-kicker">GITHUB APP MVP</span>
                <h2 id="github-app-management-title">Automated PR analysis</h2>
                <p>
                  {githubAppStatus?.authenticated
                    ? `Authenticated${githubAppStatus.name || githubAppStatus.slug ? ` as ${githubAppStatus.name ?? githubAppStatus.slug}` : ""}. Webhook analyses can publish one marked decision comment.`
                    : "Configure the GitHub App environment to receive verified webhooks and publish one Lintel decision comment."}
                </p>
              </div>
              <span className={githubAppStatus?.authenticated ? "connected-github-state connected-github-state--on" : "connected-github-state"}>
                {githubAppStatus?.authenticated ? "Authenticated" : githubAppStatus?.configured ? "Configured" : "Not configured"}
              </span>
            </div>

            <div className="github-app-grid">
              <article>
                <h3>Installations</h3>
                {githubAppInstallations.length === 0 ? (
                  <p className="connected-github-empty">{githubAppStatus?.error ?? "No installation webhooks received yet."}</p>
                ) : (
                  <ul className="connected-github-list">
                    {githubAppInstallations.map((installation) => (
                      <li key={installation.installationId} className="github-app-row">
                        <strong>{installation.accountLogin ?? "GitHub installation"}</strong>
                        <span>{installation.active ? "Active" : "Inactive"} / ID {installation.installationId}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article>
                <h3>Installed repositories</h3>
                {githubAppRepositories.length === 0 ? (
                  <p className="connected-github-empty">No installed repositories stored locally.</p>
                ) : (
                  <ul className="connected-github-list">
                    {githubAppRepositories.slice(0, 8).map((repo) => (
                      <li key={`${repo.installationId}:${repo.repositoryId}`} className="github-app-row">
                        <div>
                          <strong>{repo.owner}/{repo.name}</strong>
                          <span>{repo.visibility} / {repo.active ? "installed" : "removed"} / {repo.enabled ? "enabled" : "disabled"}</span>
                        </div>
                        <button type="button" onClick={() => setGitHubAppRepositoryEnabled(repo, !repo.enabled)}>
                          {repo.enabled ? "Disable" : "Enable"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article>
                <h3>Webhook health</h3>
                {githubAppDeliveries.length === 0 ? (
                  <p className="connected-github-empty">No webhook deliveries stored locally.</p>
                ) : (
                  <ul className="connected-github-list">
                    {githubAppDeliveries.slice(0, 5).map((delivery) => (
                      <li key={delivery.deliveryId} className="github-app-row">
                        <strong>{delivery.event}{delivery.action ? ` / ${delivery.action}` : ""}</strong>
                        <span>{delivery.state}{delivery.failureCategory ? ` / ${delivery.failureCategory}` : ""} / {new Date(delivery.updatedAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article>
                <h3>Automated pull requests</h3>
                {githubAppPullRequests.length === 0 ? (
                  <p className="connected-github-empty">No automated pull-request analyses stored locally.</p>
                ) : (
                  <ul className="connected-github-list">
                    {githubAppPullRequests.slice(0, 8).map((pr) => (
                      <li key={pr.id} className="github-app-row">
                        <div>
                          <strong>{pr.owner}/{pr.repository} #{pr.number}{pr.title ? ` — ${pr.title}` : ""}</strong>
                          <span>
                            {pr.state} / head {pr.headSha.slice(0, 7)}{pr.baseSha ? ` / base ${pr.baseSha.slice(0, 7)}` : ""}
                            {pr.latestReport ? ` / ${pr.latestReport.verdict.recommendation.replaceAll("_", " ")} ${pr.latestReport.verdict.riskScore}/100` : ""}
                            {pr.latestDelta || pr.deltaFailureCategory ? ` / ${deltaIndicatorWithSha(pr.latestDelta, pr.deltaFailureCategory)}` : ""}
                            {pr.commentPublishingState ? ` / comment ${pr.commentPublishingState}` : ""}
                            {pr.commentFailureCategory ? ` / ${pr.commentFailureCategory}` : ""}
                          </span>
                        </div>
                        <div className="github-app-row-actions">
                          {pr.latestReport && <button type="button" onClick={() => openAutomatedReport(pr)}>Open report</button>}
                          {pr.githubCommentHtmlUrl && <a href={pr.githubCommentHtmlUrl} target="_blank" rel="noreferrer">Comment</a>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>

            <div className="github-app-footer">
              <button type="button" onClick={loadGitHubAppManagement} disabled={isLoadingGitHubApp}>
                {isLoadingGitHubApp ? "Refreshing..." : "Refresh GitHub App state"}
              </button>
              <p className="github-import-help">GitHub App state is local MVP server data. Repository enable/disable changes only Lintel’s local processing state.</p>
            </div>
          </section>

          <div className="github-import">
            {importedPullRequest ? (
              <section className="github-pr-preview" aria-labelledby="github-pr-preview-title">
                <div className="github-pr-preview-header">
                  <div>
                    <span className="card-kicker">PUBLIC GITHUB PR</span>
                    <h2 id="github-pr-preview-title">{importedPullRequest.repository} #{importedPullRequest.number}</h2>
                    <p>{importedPullRequest.title ?? title}</p>
                  </div>
                  <span className="github-pr-public-status">{importedPullRequest.publicRepository ? "Public repository" : "Private repository"}</span>
                </div>
                <dl className="github-pr-preview-grid">
                  <div>
                    <dt>Author</dt>
                    <dd>{importedPullRequest.author ?? "Unavailable without authentication"}</dd>
                  </div>
                  <div>
                    <dt>State</dt>
                    <dd>{importedPullRequest.state ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Branches</dt>
                    <dd>{importedPullRequest.baseBranch ?? "base"} ← {importedPullRequest.headBranch ?? "head"}</dd>
                  </div>
                  <div>
                    <dt>Changed files</dt>
                    <dd>{importedPullRequest.changedFiles ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Additions</dt>
                    <dd>{importedPullRequest.additions ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Deletions</dt>
                    <dd>{importedPullRequest.deletions ?? "Unknown"}</dd>
                  </div>
                </dl>
                <div className="github-pr-preview-actions">
                  {githubImportMode === "connected" ? (
                    <>
                      {selectedRepository && <button type="button" onClick={() => { setImportedPullRequest(null); setGitHubImportMode(null); if (inputSource === "github-pr") setInputSource("pasted-diff"); }} disabled={isGenerating}>Choose another pull request</button>}
                      <button type="button" onClick={changeConnectedRepository} disabled={isGenerating}>Change repository</button>
                      <button type="button" onClick={disconnectConnectedSelection} disabled={isGenerating}>Disconnect from this selection</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={changeGitHubImport} disabled={isGenerating}>Change pull request</button>
                      <button type="button" onClick={clearGitHubImport} disabled={isGenerating}>Clear import</button>
                    </>
                  )}
                  <a href={importedPullRequest.url} target="_blank" rel="noreferrer">Open on GitHub</a>
                </div>
                <p className="github-import-help">Review mode and fields remain editable. Raw diffs are used for analysis and are not saved in local report history.</p>
              </section>
            ) : (
              <>
                <div className="github-import-row">
                  <label className="form-field" htmlFor="github-pr-url">
                    <span>Public GitHub PR URL <small>Optional</small></span>
                    <input
                      id="github-pr-url"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      value={githubUrl}
                      onChange={(event) => {
                        setGitHubUrl(event.target.value);
                        setImportStatus(null);
                      }}
                      placeholder="https://github.com/owner/repository/pull/123"
                      aria-describedby="github-import-help"
                    />
                  </label>
                  <button
                    className="fetch-diff-button"
                    type="button"
                    onClick={handleFetchDiff}
                    disabled={isFetchingDiff || isGenerating}
                  >
                    {isFetchingDiff ? "Fetching..." : "Fetch diff"}
                  </button>
                </div>
                <p id="github-import-help" className="github-import-help">Public pull requests only. Manual title, repository and diff entry remain available if import fails.</p>
              </>
            )}
            {importStatus && (
              <p
                className={`github-import-status github-import-status--${importStatus.type}`}
                role={importStatus.type === "error" ? "alert" : "status"}
              >
                {importStatus.message}
              </p>
            )}
          </div>

          <div className="form-grid">
            <label className="form-field form-field--wide">
              <span>PR title</span>
              <input name="title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add fallback handling for failed code retrieval" />
            </label>
            <label className="form-field">
              <span>Repository</span>
              <input name="repository" required value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="acme/redemption-api" />
            </label>
            <label className="form-field">
              <span>Language / framework</span>
              <input name="technology" required value={technology} onChange={(event) => updateTechnology(event.target.value, true)} placeholder="Python / FastAPI" />
            </label>
            <label className="form-field form-field--wide review-profile-field">
              <span>Review mode <small>Optional</small></span>
              <select name="reviewProfile" value={reviewProfile} onChange={(event) => setReviewProfile(event.target.value as ReviewProfile)}>
                {REVIEW_PROFILES.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
              </select>
              <small className="review-mode-description">{selectedReviewModeDescription}</small>
            </label>
            <label className="form-field form-field--wide">
              <span>PR diff</span>
              <textarea name="diff" required rows={16} value={diff} onChange={(event) => setDiff(event.target.value)} spellCheck={false} placeholder="Paste the pull request diff here. Raw diffs are analysed transiently and are not saved in local report history." />
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-footer">
            <p>Your diff is sent for analysis when model-assisted generation is enabled. Lintel does not store the raw diff in local report history.</p>
            <button className="generate-button" type="submit" disabled={isGenerating || isFetchingDiff}>
              {isGenerating ? "Generating…" : importedPullRequest ? "Run readiness review" : "Generate Report"}<span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <section className="report-history" aria-labelledby="report-history-title">
          <div className="report-history-heading">
            <div>
              <span className="eyebrow">LOCAL HISTORY</span>
              <h2 id="report-history-title">Recent reports</h2>
            </div>
            {history.length > 0 && <button type="button" onClick={clearHistory}>Clear all</button>}
          </div>

          {history.length > 0 ? (
            <ul className="report-history-list">
              {history.map((entry) => (
                <li key={entry.createdAt}>
                  <button className="history-open" type="button" onClick={() => openHistoryReport(entry)}>
                    <span className="history-title">{entry.metadata.title}</span>
                    <span className="history-repository">{entry.metadata.repository}</span>
                    <span className="history-meta">
                      <strong>{entry.metadata.recommendation.replaceAll("_", " ")}</strong>
                      <span>{entry.metadata.riskScore}/100</span>
                      <span>{historySourceLabel(entry.source)}</span>
                      <span>{entry.inputLabel}</span>
                      <span>Mode: {entry.metadata.reviewProfile}</span>
                      <time dateTime={entry.createdAt}>{historyTime(entry.createdAt)}</time>
                    </span>
                  </button>
                  <button className="history-delete" type="button" onClick={() => deleteHistoryReport(entry.createdAt)} aria-label={`Delete ${entry.metadata.title} from report history`}>Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="report-history-empty">Generated reports will appear here on this browser.</p>
          )}
        </section>
      </div>
    </main>
  );
}
