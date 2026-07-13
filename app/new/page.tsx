"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../app-shell";
import { createCanonicalReviewRunManifest, type CanonicalReviewRunManifest } from "../../lib/canonical-review-run";
import { normalizeChangePassport, type ChangePassport, type ChangePassportProducerType } from "../../lib/change-passport";
import { generateReport, GENERATED_REPORT_STORAGE_KEY, type ReportInput, type ReportInputSource } from "../../lib/report-generator";
import { addReportToHistory, clearReportHistory, deleteReportFromHistory, readReportHistory, type ReportHistoryEntry } from "../../lib/report-history";
import type { Report } from "../../lib/mock-report";
import { shortSha, type ReadinessDelta, type ReviewDiff } from "../../lib/readiness-delta";
import { PR_SAMPLES } from "../../lib/sample-pr-input";
import { inferStack } from "../../lib/stack-inference";
import { REVIEW_PROFILES, reviewProfileDescription, type ReviewProfile } from "../../lib/review-profiles";

type ReportSource = "ai" | "deterministic";

type StoredReport = {
  report: Report;
  source: ReportSource;
  readinessDelta?: ReadinessDelta;
  reviewDiff?: ReviewDiff;
  canonicalRun?: CanonicalReviewRunManifest;
  changePassport?: ChangePassport;
  verificationTarget?: { pullRequestId: string; runId: string };
  initialTab?: "review-diff";
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
  changePassport?: ChangePassport;
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
  canonicalRun?: CanonicalReviewRunManifest;
  changePassport?: ChangePassport;
  latestDelta?: ReadinessDelta;
  latestReviewDiff?: ReviewDiff;
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

type ChangeSource = "connected" | "public-url" | "manual" | "sample";

type MergedRepository = {
  key: string;
  owner: string;
  name: string;
  fullName: string;
  tokenRepo?: GitHubWorkspaceRepository;
  appRepo?: GitHubAppRepository;
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

function linesFromTextarea(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
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

function humanizeCategory(value?: string) {
  return value ? value.replaceAll("_", " ") : "";
}

function analysisStateLabel(pr: GitHubAppPullRequest) {
  if (pr.state === "processing") return "Analysis processing";
  if (pr.state === "failed") return pr.failureCategory ? `Analysis failed — ${humanizeCategory(pr.failureCategory)}` : "Analysis failed";
  if (pr.state === "completed") return "Analysis complete";
  return humanizeCategory(pr.state) || "Unknown";
}

function commentStateLabel(pr: GitHubAppPullRequest) {
  const state = pr.commentPublishingState;
  if (!state || state === "not_published") return "Not published";
  if (state === "publishing") return "Publishing";
  if (state === "completed") return "Published";
  if (state === "failed") return pr.commentFailureCategory ? `Publishing failed — ${humanizeCategory(pr.commentFailureCategory)}` : "Publishing failed";
  return humanizeCategory(state);
}

const SOURCE_LABELS: Record<ChangeSource, string> = {
  connected: "Connected GitHub",
  "public-url": "Public PR URL",
  manual: "Manual diff",
  sample: "Sample review",
};

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
  const [passportOpen, setPassportOpen] = useState(false);
  const [passportProducerType, setPassportProducerType] = useState<ChangePassportProducerType>("unknown");
  const [passportTaskIntent, setPassportTaskIntent] = useState("");
  const [passportTool, setPassportTool] = useState("");
  const [passportModel, setPassportModel] = useState("");
  const [passportChangeSummary, setPassportChangeSummary] = useState("");
  const [passportValidation, setPassportValidation] = useState("");
  const [passportAssumptions, setPassportAssumptions] = useState("");
  const [passportLimitations, setPassportLimitations] = useState("");
  const [passportUncertainty, setPassportUncertainty] = useState("");
  const [passportHandoffNotes, setPassportHandoffNotes] = useState("");
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [activeSource, setActiveSource] = useState<ChangeSource>("connected");
  const [selectedRepoKey, setSelectedRepoKey] = useState<string | null>(null);
  const [selectedAutomatedPrId, setSelectedAutomatedPrId] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const technologyValueRef = useRef("");
  const technologyEditedRef = useRef(false);
  const selectedReviewModeDescription = reviewProfileDescription(reviewProfile);

  const mergedRepositories = useMemo(() => {
    const map = new Map<string, MergedRepository>();
    for (const repo of repositories) {
      const key = repo.fullName.toLowerCase();
      map.set(key, { key, owner: repo.owner, name: repo.name, fullName: repo.fullName, tokenRepo: repo });
    }
    for (const repo of githubAppRepositories) {
      const key = `${repo.owner}/${repo.name}`.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.appRepo = repo;
      } else {
        map.set(key, { key, owner: repo.owner, name: repo.name, fullName: `${repo.owner}/${repo.name}`, appRepo: repo });
      }
    }
    return [...map.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [repositories, githubAppRepositories]);

  const filteredRepositories = mergedRepositories.filter((repo) => (
    repo.fullName.toLowerCase().includes(repositorySearch.trim().toLowerCase())
  ));

  const selectedRepo = selectedRepoKey
    ? mergedRepositories.find((repo) => repo.key === selectedRepoKey) ?? null
    : null;

  const automatedPullRequests = useMemo(() => {
    const list = selectedRepo
      ? githubAppPullRequests.filter((pr) => `${pr.owner}/${pr.repository}`.toLowerCase() === selectedRepo.key)
      : githubAppPullRequests;
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [githubAppPullRequests, selectedRepo]);

  const selectedAppRepo = selectedRepo?.appRepo ?? null;

  const selectedAutomatedPr = selectedAutomatedPrId
    ? githubAppPullRequests.find((pr) => pr.id === selectedAutomatedPrId) ?? null
    : null;

  const selectedSample = selectedSampleId
    ? PR_SAMPLES.find((sample) => sample.id === selectedSampleId) ?? null
    : null;
  const manualChangePassport = passportOpen
    ? normalizeChangePassport({
      producerType: passportProducerType,
      taskIntent: passportTaskIntent,
      changeSummary: passportChangeSummary,
      producer: { tool: passportTool, model: passportModel },
      claimedValidation: linesFromTextarea(passportValidation),
      assumptions: linesFromTextarea(passportAssumptions),
      knownLimitations: linesFromTextarea(passportLimitations),
      unresolvedUncertainty: linesFromTextarea(passportUncertainty),
      handoffNotes: passportHandoffNotes,
    }, "manual")
    : null;
  const selectedChangePassport = importedPullRequest?.changePassport
    ?? selectedSample?.input.changePassport
    ?? manualChangePassport
    ?? undefined;

  const tokenConnected = githubWorkspaceStatus?.connected === true;
  const appAuthenticated = githubAppStatus?.authenticated === true;
  const githubAvailable = tokenConnected || appAuthenticated || githubAppRepositories.length > 0 || githubAppPullRequests.length > 0;
  const hasLoadedChange = diff.trim().length > 0;

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

  function applySample(sampleId: string, sample: ReportInput) {
    setSelectedSampleId(sampleId);
    setTitle(sample.title);
    setRepository(sample.repository);
    updateTechnology(sample.technology, false);
    setDiff(sample.diff);
    setInputSource("sample");
    setImportStatus(null);
    setImportedPullRequest(null);
    setGitHubImportMode(null);
    setSelectedAutomatedPrId(null);
    setError(null);
  }

  function clearManualPassport() {
    setPassportOpen(false);
    setPassportProducerType("unknown");
    setPassportTaskIntent("");
    setPassportTool("");
    setPassportModel("");
    setPassportChangeSummary("");
    setPassportValidation("");
    setPassportAssumptions("");
    setPassportLimitations("");
    setPassportUncertainty("");
    setPassportHandoffNotes("");
  }

  function clearSample() {
    setSelectedSampleId(null);
    setTitle("");
    setRepository("");
    updateTechnology("", false);
    setDiff("");
    clearManualPassport();
    if (inputSource === "sample") setInputSource("pasted-diff");
  }

  function clearGitHubImport() {
    setImportedPullRequest(null);
    setGitHubImportMode(null);
    setGitHubUrl("");
    setTitle("");
    setRepository("");
    updateTechnology("", false);
    setDiff("");
    clearManualPassport();
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
    setSelectedRepoKey(null);
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
      setImportStatus(payload.repositories.length === 0 ? { type: "error", message: "No repositories are available to this GitHub token. Public PR URL, manual diff and sample review remain available." } : null);
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
        ? { type: "error", message: `${repo.fullName} has no open pull requests. Public PR URL, manual diff and sample review remain available.` }
        : { type: "success", message: `Choose an open pull request from ${repo.fullName}.` });
    } catch (prError) {
      setImportStatus({ type: "error", message: prError instanceof Error ? prError.message : "Open pull requests could not be fetched." });
    } finally {
      setIsLoadingPullRequests(false);
    }
  }

  function selectMergedRepository(entry: MergedRepository) {
    setSelectedRepoKey(entry.key);
    setSelectedAutomatedPrId(null);
    if (entry.tokenRepo) {
      loadPullRequests(entry.tokenRepo);
    } else {
      setSelectedRepository(null);
      setPullRequests([]);
      setImportedPullRequest(null);
      setGitHubImportMode(null);
      setImportStatus(null);
      if (inputSource === "github-pr") setInputSource("pasted-diff");
    }
  }

  async function importConnectedPullRequest(repo: GitHubWorkspaceRepository, pr: GitHubWorkspacePullRequest) {
    setIsFetchingDiff(true);
    setSelectedAutomatedPrId(null);
    setSelectedSampleId(null);
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
      setImportStatus({ type: "success", message: "Pull request imported. Verify the change brief, then run the readiness review." });
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

  function refreshConnectedGitHub() {
    if (githubWorkspaceStatus?.connected) loadRepositories();
    loadGitHubAppManagement();
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

  function openAutomatedReport(pr: GitHubAppPullRequest, initialTab?: StoredReport["initialTab"]) {
    if (!pr.latestReport) {
      setImportStatus({ type: "error", message: "This automated pull request does not have a completed report yet." });
      return;
    }

    try {
      sessionStorage.setItem(GENERATED_REPORT_STORAGE_KEY, JSON.stringify({
        report: pr.latestReport,
        source: pr.reportSource ?? "deterministic",
        readinessDelta: pr.latestDelta,
        reviewDiff: pr.latestReviewDiff,
        canonicalRun: pr.canonicalRun,
        changePassport: pr.changePassport,
        verificationTarget: pr.canonicalRun ? { pullRequestId: pr.id, runId: pr.canonicalRun.runId } : undefined,
        initialTab,
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
      setSelectedAutomatedPrId(null);
      setSelectedSampleId(null);
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
        message: "Pull request imported. Verify the change brief, then run the readiness review.",
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
    if (!diff.trim()) {
      setError("Choose a pull request or paste a diff before running a readiness review.");
      return;
    }
    setIsGenerating(true);
    setError(null);

    const input: ReportInput = {
      title,
      repository,
      technology,
      diff,
      inputSource,
      reviewProfile,
      changePassport: selectedChangePassport,
    };

    try {
      let generatedReport: Report;
      let source: ReportSource;
      let canonicalRun: CanonicalReviewRunManifest | undefined;

      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...input,
            sourceUrl: importedPullRequest?.url,
            pullRequestNumber: importedPullRequest?.number,
          }),
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
        canonicalRun = payload.canonicalRun;
      } catch {
        generatedReport = generateReport(input);
        source = "deterministic";
        canonicalRun = createCanonicalReviewRunManifest({
          input,
          report: generatedReport,
          analysisSource: "fallback",
          sourceUrl: importedPullRequest?.url,
          pullRequestNumber: importedPullRequest?.number,
        });
      }

      sessionStorage.setItem(GENERATED_REPORT_STORAGE_KEY, JSON.stringify({ report: generatedReport, source, canonicalRun, changePassport: selectedChangePassport }));
      try {
        setHistory(addReportToHistory(window.localStorage, generatedReport, source, canonicalRun, selectedChangePassport));
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
      sessionStorage.setItem(GENERATED_REPORT_STORAGE_KEY, JSON.stringify({ report: entry.report, source: entry.source, canonicalRun: entry.canonicalRun, changePassport: entry.changePassport }));
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

  const tokenStatusChip = githubWorkspaceStatus === null
    ? { label: "Checking", tone: "" }
    : tokenConnected
      ? { label: "Connected", tone: "state-chip--on" }
      : { label: "Not configured", tone: "" };

  const appStatusChip = githubAppStatus === null
    ? { label: "Checking", tone: "" }
    : appAuthenticated
      ? { label: "Authenticated", tone: "state-chip--on" }
      : githubAppStatus.configured
        ? { label: "Auth failed", tone: "state-chip--warn" }
        : { label: "Not configured", tone: "" };

  const connectedRailCaption = githubWorkspaceStatus === null && githubAppStatus === null
    ? "Checking connection..."
    : tokenConnected && appAuthenticated
      ? "Token and App connected"
      : tokenConnected
        ? `Connected as ${githubWorkspaceStatus?.identity ?? "GitHub token"}`
        : appAuthenticated
          ? `App authenticated${githubAppStatus?.name || githubAppStatus?.slug ? ` as ${githubAppStatus?.name ?? githubAppStatus?.slug}` : ""}`
          : githubAppStatus?.configured
            ? "App configured, not authenticated"
            : "Not configured";

  const commandTarget = selectedAutomatedPr
    ? `${selectedAutomatedPr.owner}/${selectedAutomatedPr.repository} #${selectedAutomatedPr.number}`
    : importedPullRequest
      ? `${importedPullRequest.repository} #${importedPullRequest.number}`
      : inputSource === "sample" && selectedSample
        ? selectedSample.name
        : hasLoadedChange
          ? (repository.trim() || "Manual diff")
          : "No change loaded";

  const importStatusNotice = importStatus && (
    <p
      className={`github-import-status github-import-status--${importStatus.type}`}
      role={importStatus.type === "error" ? "alert" : "status"}
    >
      {importStatus.message}
    </p>
  );

  const briefContextFields = (
    <div className="brief-fields">
      <label className="brief-field">
        <span>PR title</span>
        <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Pull request title" />
      </label>
      <label className="brief-field">
        <span>Repository</span>
        <input name="repository" value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="owner/repository" className="brief-field-code" />
      </label>
      <label className="brief-field">
        <span>Language / framework</span>
        <input name="technology" value={technology} onChange={(event) => updateTechnology(event.target.value, true)} placeholder="Python / FastAPI" />
      </label>
    </div>
  );

  let inspector: ReactNode;
  if (selectedAutomatedPr) {
    const pr = selectedAutomatedPr;
    inspector = (
      <div className="change-brief" aria-label="Automated analysis brief">
        <div className="brief-head">
          <span className="card-kicker">Automated analysis</span>
          <button type="button" className="brief-dismiss" onClick={() => setSelectedAutomatedPrId(null)}>Dismiss</button>
        </div>
        <h2 className="brief-id"><span className="wb-code">{pr.owner}/{pr.repository}</span> #{pr.number}</h2>
        {pr.title && <p className="brief-title">{pr.title}</p>}
        <dl className="brief-grid">
          <div>
            <dt>Analysis</dt>
            <dd>{analysisStateLabel(pr)}</dd>
          </div>
          <div>
            <dt>Head</dt>
            <dd className="wb-code">{shortSha(pr.headSha)}</dd>
          </div>
          {pr.baseSha && (
            <div>
              <dt>Base</dt>
              <dd className="wb-code">{shortSha(pr.baseSha)}</dd>
            </div>
          )}
          {pr.latestReport && (
            <div>
              <dt>Latest result</dt>
              <dd>{pr.latestReport.verdict.recommendation.replaceAll("_", " ")} · {pr.latestReport.verdict.riskScore}/100</dd>
            </div>
          )}
          <div>
            <dt>Readiness delta</dt>
            <dd>{deltaIndicatorWithSha(pr.latestDelta, pr.deltaFailureCategory)}</dd>
          </div>
          <div>
            <dt>PR comment</dt>
            <dd>{commentStateLabel(pr)}</dd>
          </div>
          {pr.analysisRuns && pr.analysisRuns.length > 0 && (
            <div>
              <dt>Analysis runs</dt>
              <dd>{pr.analysisRuns.length} recorded</dd>
            </div>
          )}
        </dl>
        <div className="brief-actions">
          {pr.latestReport && <button type="button" onClick={() => openAutomatedReport(pr)}>Open latest report</button>}
          {pr.latestReviewDiff && <button type="button" onClick={() => openAutomatedReport(pr, "review-diff")}>Open review diff</button>}
          {pr.githubCommentHtmlUrl && <a href={pr.githubCommentHtmlUrl} target="_blank" rel="noreferrer">Comment on GitHub</a>}
        </div>
        <p className="brief-note">Automated analyses run from webhook events. To run a fresh readiness review here, import this pull request from open pull requests or by public URL.</p>
      </div>
    );
  } else if (importedPullRequest) {
    const pr = importedPullRequest;
    inspector = (
      <div className="change-brief" aria-label="Imported pull request brief">
        <div className="brief-head">
          <span className="card-kicker">{githubImportMode === "connected" ? "Connected pull request" : "Public pull request"}</span>
          <span className="state-chip">{pr.publicRepository ? "Public" : "Private"}</span>
        </div>
        <h2 className="brief-id"><span className="wb-code">{pr.repository}</span> #{pr.number}</h2>
        {(pr.title ?? title) && <p className="brief-title">{pr.title ?? title}</p>}
        <dl className="brief-grid">
          <div>
            <dt>Author</dt>
            <dd>{pr.author ?? "Unavailable without authentication"}</dd>
          </div>
          <div>
            <dt>State</dt>
            <dd>{pr.state ?? "Unknown"}</dd>
          </div>
          <div>
            <dt>Branches</dt>
            <dd className="wb-code">{pr.baseBranch ?? "base"} ← {pr.headBranch ?? "head"}</dd>
          </div>
          <div>
            <dt>Changed files</dt>
            <dd>{pr.changedFiles ?? "Unknown"}</dd>
          </div>
          <div>
            <dt>Lines</dt>
            <dd className="wb-code">
              {typeof pr.additions === "number" ? `+${pr.additions}` : "+?"} / {typeof pr.deletions === "number" ? `−${pr.deletions}` : "−?"}
            </dd>
          </div>
        </dl>
        {briefContextFields}
        <div className="brief-actions">
          {githubImportMode === "connected" ? (
            <>
              {selectedRepository && (
                <button
                  type="button"
                  onClick={() => { setImportedPullRequest(null); setGitHubImportMode(null); if (inputSource === "github-pr") setInputSource("pasted-diff"); }}
                  disabled={isGenerating}
                >
                  Choose another pull request
                </button>
              )}
              <button type="button" onClick={changeConnectedRepository} disabled={isGenerating}>Change repository</button>
              <button type="button" onClick={disconnectConnectedSelection} disabled={isGenerating}>Clear selection</button>
            </>
          ) : (
            <>
              <button type="button" onClick={changeGitHubImport} disabled={isGenerating}>Change pull request</button>
              <button type="button" onClick={clearGitHubImport} disabled={isGenerating}>Clear import</button>
            </>
          )}
          <a href={pr.url} target="_blank" rel="noreferrer">Open on GitHub</a>
        </div>
        <p className="brief-note">Fields stay editable. The raw diff is analysed transiently and is not saved in local report history.</p>
      </div>
    );
  } else if (activeSource === "sample" && selectedSample) {
    inspector = (
      <div className="change-brief" aria-label="Sample scenario brief">
        <div className="brief-head">
          <span className="card-kicker">Sample scenario</span>
          <button type="button" className="brief-dismiss" onClick={clearSample}>Clear sample</button>
        </div>
        <h2 className="brief-id">{selectedSample.name}</h2>
        <p className="brief-title">{selectedSample.input.title}</p>
        <dl className="brief-grid">
          <div>
            <dt>Repository</dt>
            <dd className="wb-code">{selectedSample.input.repository}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{selectedSample.input.technology}</dd>
          </div>
        </dl>
        {briefContextFields}
        <p className="brief-note">Sample scenarios use built-in diffs, so you can inspect a full readiness report without sharing code.</p>
      </div>
    );
  } else {
    const stepOneState = selectedRepoKey ? "done" : activeSource === "connected" ? "current" : "upcoming";
    const stepTwoState = hasLoadedChange ? "done" : selectedRepoKey ? "current" : "upcoming";
    const stepThreeState = hasLoadedChange ? "current" : "upcoming";
    inspector = (
      <div className="inspector-guide" aria-label="Review setup">
        <span className="card-kicker">Review setup</span>
        <ol className="guide-steps">
          <li data-state={stepOneState}>
            <strong>Choose a change source</strong>
            <span>
              {githubAvailable
                ? "Connected GitHub lists repositories and pull requests Lintel already understands."
                : "Connected GitHub is not configured. Public PR URL, manual diff and sample review are available now."}
            </span>
          </li>
          <li data-state={stepTwoState}>
            <strong>Verify the change brief</strong>
            <span>Selected pull requests import their diff and context. Automated analyses open their latest recorded report.</span>
          </li>
          <li data-state={stepThreeState}>
            <strong>Run readiness review</strong>
            <span>Lintel produces a recommendation, risk band, missing tests and conditions before merge.</span>
          </li>
        </ol>
      </div>
    );
  }

  const showInspector = activeSource !== "manual";

  return (
    <AppShell>
      <div className="new-content">
        <section className="new-intro">
          <span className="eyebrow">NEW REVIEW</span>
          <h1>Check merge readiness</h1>
          <p>Choose a pull request Lintel already understands, or bring another change source.</p>
          <p className="new-trust-note">Local-first history stores generated reports, not raw diffs. <Link href="/docs/security-model.md">Read the security model.</Link></p>
        </section>

        <form className="report-form review-workbench" onSubmit={handleSubmit}>
          <div className={showInspector ? "workbench-body" : "workbench-body workbench-body--no-inspector"}>
            <aside className="source-rail" aria-label="Change source">
              <span className="source-rail-label" id="source-rail-primary">Primary source</span>
              <button
                type="button"
                className={activeSource === "connected" ? "source-option source-option--primary source-option--active" : "source-option source-option--primary"}
                aria-pressed={activeSource === "connected"}
                onClick={() => setActiveSource("connected")}
              >
                <strong>Connected GitHub</strong>
                <span>{connectedRailCaption}</span>
              </button>
              <span className="source-rail-label">Other sources</span>
              <button
                type="button"
                className={activeSource === "public-url" ? "source-option source-option--active" : "source-option"}
                aria-pressed={activeSource === "public-url"}
                onClick={() => setActiveSource("public-url")}
              >
                <strong>Public PR URL</strong>
                <span>Import any public pull request</span>
              </button>
              <button
                type="button"
                className={activeSource === "manual" ? "source-option source-option--active" : "source-option"}
                aria-pressed={activeSource === "manual"}
                onClick={() => setActiveSource("manual")}
              >
                <strong>Manual diff</strong>
                <span>Paste a diff directly</span>
              </button>
              <button
                type="button"
                className={activeSource === "sample" ? "source-option source-option--active" : "source-option"}
                aria-pressed={activeSource === "sample"}
                onClick={() => setActiveSource("sample")}
              >
                <strong>Sample review</strong>
                <span>Built-in review scenarios</span>
              </button>
            </aside>

            <div className="workbench-main">
              {activeSource === "connected" && (
                <>
                  <div className="connection-strip">
                    <div className="connection-facts">
                      <span className="connection-fact">
                        <span className={`state-chip ${tokenStatusChip.tone}`.trim()}>{tokenStatusChip.label}</span>
                        <span>
                          Token workspace
                          {tokenConnected ? <> — <span className="wb-code">{githubWorkspaceStatus?.identity ?? "GitHub token"}</span></> : " — set GITHUB_TOKEN to browse repositories"}
                        </span>
                      </span>
                      <span className="connection-fact">
                        <span className={`state-chip ${appStatusChip.tone}`.trim()}>{appStatusChip.label}</span>
                        <span>
                          GitHub App
                          {appAuthenticated
                            ? <> — <span className="wb-code">{githubAppStatus?.name ?? githubAppStatus?.slug ?? "authenticated"}</span></>
                            : githubAppStatus?.configured
                              ? ` — ${humanizeCategory(githubAppStatus.error) || "authentication failed"}`
                              : " — configure the App environment for webhook analyses"}
                        </span>
                      </span>
                      {githubAppInstallations.length > 0 && (
                        <span className="connection-fact">
                          <span className="state-chip state-chip--on">Installed</span>
                          <span>
                            {githubAppInstallations.map((installation) => (
                              `${installation.accountLogin ?? `installation ${installation.installationId}`}${installation.active ? "" : " (inactive)"}`
                            )).join(", ")}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="connection-actions">
                      <button type="button" onClick={refreshConnectedGitHub} disabled={isLoadingRepositories || isLoadingGitHubApp}>
                        {isLoadingRepositories || isLoadingGitHubApp ? "Refreshing..." : "Refresh"}
                      </button>
                    </div>
                  </div>

                  {githubAvailable ? (
                    <>
                      <div className="wb-columns">
                        <section className="wb-pane" aria-label="Repositories">
                          <div className="wb-pane-header">
                            <h3>Repositories</h3>
                            <span className="wb-pane-count">{filteredRepositories.length}</span>
                          </div>
                          <div className="wb-search">
                            <input
                              type="search"
                              value={repositorySearch}
                              onChange={(event) => setRepositorySearch(event.target.value)}
                              placeholder="Filter repositories"
                              aria-label="Filter repositories"
                            />
                          </div>
                          <div className="wb-pane-body">
                            {isLoadingRepositories ? (
                              <p className="wb-empty">Loading repositories...</p>
                            ) : filteredRepositories.length === 0 ? (
                              <p className="wb-empty">
                                {mergedRepositories.length === 0
                                  ? "No repositories available yet. Token repositories and App installations appear here."
                                  : "No repositories match this filter."}
                              </p>
                            ) : (
                              filteredRepositories.slice(0, 60).map((entry) => (
                                <button
                                  key={entry.key}
                                  type="button"
                                  className={selectedRepoKey === entry.key ? "wb-row wb-row--selected" : "wb-row"}
                                  aria-pressed={selectedRepoKey === entry.key}
                                  onClick={() => selectMergedRepository(entry)}
                                  disabled={isLoadingPullRequests || isGenerating}
                                >
                                  <strong className="wb-code">{entry.fullName}</strong>
                                  <span>
                                    {entry.tokenRepo ? (entry.tokenRepo.private ? "Private" : "Public") : entry.appRepo?.visibility === "private" ? "Private" : "Public"}
                                    {entry.appRepo ? ` · App ${entry.appRepo.enabled ? "enabled" : "disabled"}${entry.appRepo.active ? "" : " · removed"}` : ""}
                                    {!entry.tokenRepo && entry.appRepo ? " · App-installed" : ""}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </section>

                        <section className="wb-pane" aria-label="Pull requests">
                          <div className="wb-pane-header">
                            <h3>{selectedRepo ? <span className="wb-code">{selectedRepo.fullName}</span> : "Pull requests"}</h3>
                            {selectedAppRepo && (
                              <button
                                type="button"
                                className="wb-mini-action"
                                onClick={() => setGitHubAppRepositoryEnabled(selectedAppRepo, !selectedAppRepo.enabled)}
                              >
                                {selectedAppRepo.enabled ? "Disable automated analysis" : "Enable automated analysis"}
                              </button>
                            )}
                          </div>
                          <div className="wb-pane-body">
                            <div className="wb-group">
                              <h4>Open pull requests</h4>
                              {!selectedRepo ? (
                                <p className="wb-empty">Choose a repository to load its open pull requests.</p>
                              ) : !selectedRepo.tokenRepo ? (
                                <p className="wb-empty">Open pull requests need the token workspace. This repository is known through the App installation only.</p>
                              ) : isLoadingPullRequests ? (
                                <p className="wb-empty">Loading open pull requests...</p>
                              ) : pullRequests.length === 0 ? (
                                <p className="wb-empty">No open pull requests in this repository.</p>
                              ) : (
                                pullRequests.map((pr) => (
                                  <button
                                    key={pr.number}
                                    type="button"
                                    className={importedPullRequest && githubImportMode === "connected" && importedPullRequest.number === pr.number ? "wb-row wb-row--selected" : "wb-row"}
                                    onClick={() => selectedRepository && importConnectedPullRequest(selectedRepository, pr)}
                                    disabled={isFetchingDiff || isGenerating}
                                  >
                                    <strong>#{pr.number} {pr.title}</strong>
                                    <span>
                                      {pr.author ?? "Unknown author"} · <span className="wb-code">{pr.baseBranch ?? "base"} ← {pr.headBranch ?? "head"}</span>
                                      {pr.updatedAt ? ` · updated ${new Date(pr.updatedAt).toLocaleDateString()}` : ""}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>

                            <div className="wb-group">
                              <h4>{selectedRepo ? "Automated analyses" : "Automated analyses · all repositories"}</h4>
                              {isLoadingGitHubApp && automatedPullRequests.length === 0 ? (
                                <p className="wb-empty">Loading automated analyses...</p>
                              ) : automatedPullRequests.length === 0 ? (
                                <p className="wb-empty">
                                  {appAuthenticated
                                    ? "No automated pull-request analyses recorded yet. They appear when the App receives pull request webhooks."
                                    : "Automated analyses appear here once the GitHub App is configured and receiving webhooks."}
                                </p>
                              ) : (
                                automatedPullRequests.slice(0, 12).map((pr) => (
                                  <button
                                    key={pr.id}
                                    type="button"
                                    className={selectedAutomatedPrId === pr.id ? "wb-row wb-row--selected" : "wb-row"}
                                    aria-pressed={selectedAutomatedPrId === pr.id}
                                    onClick={() => setSelectedAutomatedPrId(pr.id)}
                                  >
                                    <strong><span className="wb-code">{pr.owner}/{pr.repository}</span> #{pr.number}{pr.title ? ` — ${pr.title}` : ""}</strong>
                                    <span>
                                      {analysisStateLabel(pr)}
                                      {pr.latestReport ? ` · ${pr.latestReport.verdict.recommendation.replaceAll("_", " ")} ${pr.latestReport.verdict.riskScore}/100` : ""}
                                      {" · head "}
                                      <span className="wb-code">{shortSha(pr.headSha)}</span>
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        </section>
                      </div>

                      {importStatusNotice}

                      <details className="connection-deliveries">
                        <summary>Webhook activity ({githubAppDeliveries.length})</summary>
                        {githubAppDeliveries.length === 0 ? (
                          <p className="wb-empty">No webhook deliveries stored locally.</p>
                        ) : (
                          <ul>
                            {githubAppDeliveries.slice(0, 5).map((delivery) => (
                              <li key={delivery.deliveryId}>
                                <span className="wb-code">{delivery.event}{delivery.action ? `/${delivery.action}` : ""}</span>
                                <span>
                                  {humanizeCategory(delivery.state)}
                                  {delivery.failureCategory ? ` — ${humanizeCategory(delivery.failureCategory)}` : ""}
                                  {" · "}
                                  {new Date(delivery.updatedAt).toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="pane-help">Repository enable and disable changes only Lintel&apos;s local processing state.</p>
                      </details>
                    </>
                  ) : (
                    <div className="connection-setup">
                      <h3>Connect GitHub to review live pull requests</h3>
                      <p>Set <span className="wb-code">GITHUB_TOKEN</span> locally to browse repositories and import open pull requests. Configure the GitHub App environment to receive verified webhook analyses and publish one decision comment per pull request.</p>
                      <p>Reviews do not depend on this connection — the other sources work now:</p>
                      <div className="connection-setup-actions">
                        <button type="button" onClick={() => setActiveSource("public-url")}>Public PR URL</button>
                        <button type="button" onClick={() => setActiveSource("manual")}>Manual diff</button>
                        <button type="button" onClick={() => setActiveSource("sample")}>Sample review</button>
                      </div>
                      {importStatusNotice}
                    </div>
                  )}
                </>
              )}

              {activeSource === "public-url" && (
                <div className="public-pane">
                  <div className="github-import-row">
                    <label className="form-field" htmlFor="github-pr-url">
                      <span>Public GitHub PR URL</span>
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
                      {isFetchingDiff ? "Importing..." : "Import pull request"}
                    </button>
                  </div>
                  <p id="github-import-help" className="github-import-help">Public pull requests only. The imported diff is analysed transiently; manual diff entry remains available if import fails.</p>
                  {importStatusNotice}
                </div>
              )}

              {activeSource === "manual" && (
                <div className="manual-pane">
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
                    <label className="form-field form-field--wide">
                      <span>PR diff</span>
                      <textarea name="diff" required rows={16} value={diff} onChange={(event) => setDiff(event.target.value)} spellCheck={false} placeholder="Paste the pull request diff here. Raw diffs are analysed transiently and are not saved in local report history." />
                    </label>
                  </div>
                  <p className="github-import-help">Your diff is sent for analysis when model-assisted generation is enabled. Lintel does not store the raw diff in local report history.</p>
                </div>
              )}

              {activeSource === "sample" && (
                <div className="sample-pane">
                  <section className="wb-pane" aria-label="Sample scenarios">
                    <div className="wb-pane-header">
                      <h3>Sample scenarios</h3>
                      <span className="wb-pane-count">{PR_SAMPLES.length}</span>
                    </div>
                    <div className="wb-pane-body">
                      {PR_SAMPLES.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          className={selectedSampleId === sample.id ? "wb-row wb-row--selected" : "wb-row"}
                          aria-pressed={selectedSampleId === sample.id}
                          onClick={() => applySample(sample.id, sample.input)}
                          disabled={isGenerating}
                        >
                          <strong>{sample.name}</strong>
                          <span><span className="wb-code">{sample.input.repository}</span> · {sample.input.technology}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                  <p className="github-import-help">Built-in scenarios with realistic diffs. Use them to inspect a full readiness report without sharing code.</p>
                </div>
              )}

              <details className="change-passport-input" open={passportOpen} onToggle={(event) => setPassportOpen(event.currentTarget.open)}>
                <summary>
                  <span>Add Change Passport</span>
                  <small>Optional builder-declared context. It never clears blockers or changes the recommendation.</small>
                </summary>
                {importedPullRequest?.changePassport || selectedSample?.input.changePassport ? (
                  <div className="passport-import-note">
                    <strong>Passport supplied by {importedPullRequest?.changePassport ? "PR body" : "sample scenario"}.</strong>
                    <span>{selectedChangePassport?.completeness ?? "partial"} · Producer {selectedChangePassport?.producerType ?? "unknown"}</span>
                  </div>
                ) : (
                  <div className="passport-form-grid">
                    <label className="form-field">
                      <span>Producer type</span>
                      <select value={passportProducerType} onChange={(event) => setPassportProducerType(event.target.value as ChangePassportProducerType)}>
                        <option value="unknown">Unknown</option>
                        <option value="human">Human</option>
                        <option value="agent">Agent</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Tool</span>
                      <input value={passportTool} onChange={(event) => setPassportTool(event.target.value)} placeholder="Cursor, Claude Code, Codex" />
                    </label>
                    <label className="form-field">
                      <span>Model</span>
                      <input value={passportModel} onChange={(event) => setPassportModel(event.target.value)} placeholder="Optional model name" />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Task intent</span>
                      <input value={passportTaskIntent} onChange={(event) => setPassportTaskIntent(event.target.value)} placeholder="What was the change meant to accomplish?" />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Change summary</span>
                      <textarea rows={3} value={passportChangeSummary} onChange={(event) => setPassportChangeSummary(event.target.value)} placeholder="Builder-declared summary of the implementation." />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Claimed validation</span>
                      <textarea rows={3} value={passportValidation} onChange={(event) => setPassportValidation(event.target.value)} placeholder="One command or validation claim per line. Use 'none' if none was run." />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Assumptions</span>
                      <textarea rows={3} value={passportAssumptions} onChange={(event) => setPassportAssumptions(event.target.value)} placeholder="One assumption per line. Use 'none' if there are no known assumptions." />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Known limitations</span>
                      <textarea rows={3} value={passportLimitations} onChange={(event) => setPassportLimitations(event.target.value)} placeholder="Known constraints or omitted cases." />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Unresolved uncertainty</span>
                      <textarea rows={3} value={passportUncertainty} onChange={(event) => setPassportUncertainty(event.target.value)} placeholder="One uncertainty per line. Use 'none' if none is known." />
                    </label>
                    <label className="form-field form-field--wide">
                      <span>Reviewer handoff notes</span>
                      <textarea rows={3} value={passportHandoffNotes} onChange={(event) => setPassportHandoffNotes(event.target.value)} placeholder="What should the reviewer pay attention to?" />
                    </label>
                    <div className="passport-form-footer">
                      <span>{manualChangePassport ? `Passport ${manualChangePassport.completeness}; fingerprint ${manualChangePassport.fingerprint.slice(0, 8)}` : "No retained passport yet."}</span>
                      <button type="button" onClick={clearManualPassport}>Clear passport</button>
                    </div>
                  </div>
                )}
              </details>
            </div>

            {showInspector && (
              <aside className="workbench-inspector" aria-label="Selected change">
                {inspector}
              </aside>
            )}
          </div>

          <div className="command-dock">
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="command-bar">
              <div className="command-context">
                <span className="command-source">{SOURCE_LABELS[activeSource]}</span>
                <span className="command-target">{commandTarget}</span>
              </div>
              <label className="command-mode">
                <span>Review mode</span>
                <select name="reviewProfile" value={reviewProfile} onChange={(event) => setReviewProfile(event.target.value as ReviewProfile)}>
                  {REVIEW_PROFILES.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
                </select>
                <small className="review-mode-description">{selectedReviewModeDescription}</small>
              </label>
              <div className="command-run">
                {!hasLoadedChange && <span className="command-hint">Load a change to enable the review</span>}
                <button className="generate-button" type="submit" disabled={isGenerating || isFetchingDiff || !hasLoadedChange}>
                  {isGenerating ? "Running review…" : "Run readiness review"}<span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
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
    </AppShell>
  );
}
