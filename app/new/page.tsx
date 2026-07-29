"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import AppShell from "../app-shell";
import ConsequentialDialog from "../consequential-dialog";
import { createCanonicalReviewRunManifest, type CanonicalReviewRunManifest } from "../../lib/canonical-review-run";
import { buildMergeContract, type MergeContract } from "../../lib/merge-contract";
import { buildVerificationPack, type VerificationPack } from "../../lib/verification-pack";
import type { ContractRecheckRecord } from "../../lib/contract-recheck";
import { generateReport, GENERATED_REPORT_STORAGE_KEY, type ReportInput, type ReportInputSource } from "../../lib/report-generator";
import { addReportToHistory, readReportHistory, type ReportHistoryEntry, type ReportHistorySource } from "../../lib/report-history";
import { associateReportWithWorkspace, ensureWorkspaceStore } from "../../lib/team-workspace";
import type { Report } from "../../lib/mock-report";
import { PR_SAMPLES } from "../../lib/sample-pr-input";
import { inferStack } from "../../lib/stack-inference";
import { REVIEW_PROFILES, reviewProfileDescription, reviewProfileLabel, type ReviewProfile } from "../../lib/review-profiles";
import styles from "./new-review.module.css";

type SourceKind = "manual" | "public-github" | "connected-github" | "sample";
type AnalysisMode = "deterministic-only" | "model-assisted";
type IntakeStep = 1 | 2 | 3 | 4;
type FieldName = "source" | "diff" | "githubUrl" | "connectedPullRequest" | "sample" | "title" | "repository" | "technology" | "analysisMode";
type FieldErrors = Partial<Record<FieldName, string>>;
type RunPhase = "idle" | "analysis" | "normalising" | "persisting" | "complete" | "failed";

type ProviderCapability = {
  checked: boolean;
  configured: boolean;
  provider: string;
  model?: string;
};

type GitHubWorkspaceStatus = {
  connected: boolean;
  identity?: string;
  error?: string;
};

type GitHubRepository = {
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
};

type GitHubPullRequest = {
  number: number;
  title: string;
  author?: string;
  updatedAt?: string;
};

type ImportedPullRequest = {
  repository: string;
  number: number;
  title?: string;
  author?: string;
  url: string;
  diff: string;
  publicRepository?: boolean;
  baseBranch?: string;
  headBranch?: string;
  changedFiles?: number;
  additions?: number;
  deletions?: number;
};

type GeneratedPayload = {
  report: Report;
  source: ReportHistorySource;
  canonicalRun: CanonicalReviewRunManifest;
  mergeContract?: MergeContract;
  verificationPack?: VerificationPack;
  contractRecheck?: ContractRecheckRecord;
};

type CompletedReview = GeneratedPayload & {
  reportId: string | null;
  persistence: "durable" | "session" | "sample";
  navigationAttempted: boolean;
};

type DialogIntent =
  | { kind: "source"; nextSource: SourceKind }
  | { kind: "leave"; href: string };

const SOURCE_COPY: Record<SourceKind, {
  label: string;
  state: string;
  input: string;
  boundary: string;
}> = {
  manual: {
    label: "Local pasted diff",
    state: "Available",
    input: "Required: review metadata and a unified diff.",
    boundary: "No external read or write. The raw diff is analysed transiently and is not retained in report history.",
  },
  "public-github": {
    label: "Public GitHub pull request",
    state: "Available",
    input: "Required: a public github.com pull-request URL.",
    boundary: "Performs an external read from GitHub. It does not authenticate or write to GitHub. The raw diff is not retained.",
  },
  "connected-github": {
    label: "Connected GitHub workspace",
    state: "Configuration dependent",
    input: "Required: a configured server-side token, repository and open pull request.",
    boundary: "Reads the selected repository and pull request from GitHub. It performs no external write and exposes no token to the browser.",
  },
  sample: {
    label: "Built-in sample",
    state: "Sample-only",
    input: "Required: one explicit built-in scenario.",
    boundary: "No external read or write. The generated sample remains session-only and does not become durable review authority.",
  },
};

const STEP_LABELS = ["Choose source", "Review context", "Analysis profile", "Verify scope"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isReport(value: unknown): value is Report {
  return isRecord(value)
    && isRecord(value.pr)
    && isRecord(value.verdict)
    && Array.isArray(value.findings)
    && Array.isArray(value.changedFiles)
    && Array.isArray(value.conditionsBeforeMerge)
    && typeof value.pr.title === "string"
    && typeof value.pr.repository === "string"
    && typeof value.verdict.recommendation === "string";
}

function parseGeneratedPayload(value: unknown): GeneratedPayload | null {
  if (!isRecord(value) || !isReport(value.report)) return null;
  if (value.source !== "ai" && value.source !== "deterministic") return null;
  if (!isRecord(value.canonicalRun) || typeof value.canonicalRun.runId !== "string") return null;
  return {
    report: value.report,
    source: value.source,
    canonicalRun: value.canonicalRun as CanonicalReviewRunManifest,
    mergeContract: isRecord(value.mergeContract) ? value.mergeContract as MergeContract : undefined,
    verificationPack: isRecord(value.verificationPack) ? value.verificationPack as VerificationPack : undefined,
    contractRecheck: isRecord(value.contractRecheck) ? value.contractRecheck as ContractRecheckRecord : undefined,
  };
}

function errorMessage(value: unknown, fallback: string) {
  if (isRecord(value) && typeof value.error === "string") return value.error;
  return fallback;
}

function shortId(value?: string) {
  if (!value) return "Not recorded";
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

function sourceInputType(source: SourceKind): ReportInputSource {
  if (source === "sample") return "sample";
  if (source === "public-github" || source === "connected-github") return "github-pr";
  return "pasted-diff";
}

function firstInvalidField(errors: FieldErrors) {
  const order: FieldName[] = ["source", "githubUrl", "connectedPullRequest", "sample", "diff", "title", "repository", "technology", "analysisMode"];
  return order.find((field) => errors[field]);
}

function persistCanonicalReview(payload: GeneratedPayload): { reportId: string | null; duplicate: boolean } {
  const history = readReportHistory(window.localStorage);
  const existing = history.find((entry) => entry.canonicalRun?.runId === payload.canonicalRun.runId);
  if (existing) return { reportId: existing.createdAt, duplicate: true };

  addReportToHistory(
    window.localStorage,
    payload.report,
    payload.source,
    payload.canonicalRun,
    undefined,
    payload.mergeContract,
    payload.verificationPack,
    payload.contractRecheck,
  );
  const verified = readReportHistory(window.localStorage).find((entry) => entry.canonicalRun?.runId === payload.canonicalRun.runId);
  if (!verified) return { reportId: null, duplicate: false };

  // The report-history read-back above is the canonical persistence boundary.
  // Workspace association is recovery metadata; a failure there must not relabel
  // an already durable report as session-only or invite an unnecessary rerun.
  try {
    const store = ensureWorkspaceStore(window.localStorage, readReportHistory(window.localStorage));
    associateReportWithWorkspace(window.localStorage, verified, store.activeWorkspaceId);
  } catch {
    // The durable Case File remains reachable by its verified report identity.
  }
  return { reportId: verified.createdAt, duplicate: false };
}

function sourceStatus(source: SourceKind, github: GitHubWorkspaceStatus | null) {
  if (source !== "connected-github") return SOURCE_COPY[source].state;
  if (github === null) return "Checking configuration";
  return github.connected ? "Available · configured" : "Unavailable · not configured";
}

export default function NewReviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<IntakeStep>(1);
  const [source, setSource] = useState<SourceKind>("manual");
  const [title, setTitle] = useState("");
  const [repository, setRepository] = useState("");
  const [technology, setTechnology] = useState("");
  const [diff, setDiff] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [importedPullRequest, setImportedPullRequest] = useState<ImportedPullRequest | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [reviewProfile, setReviewProfile] = useState<ReviewProfile>("standard");
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("deterministic-only");
  const [analysisModeTouched, setAnalysisModeTouched] = useState(false);
  const [provider, setProvider] = useState<ProviderCapability>({ checked: false, configured: false, provider: "openai" });
  const [githubStatus, setGithubStatus] = useState<GitHubWorkspaceStatus | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepositoryKey, setSelectedRepositoryKey] = useState("");
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [selectedPullRequestNumber, setSelectedPullRequestNumber] = useState("");
  const [sourceBusy, setSourceBusy] = useState(false);
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [runPhase, setRunPhase] = useState<RunPhase>("idle");
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState<CompletedReview | null>(null);
  const [dialogIntent, setDialogIntent] = useState<DialogIntent | null>(null);
  const dialogReturnRef = useRef<HTMLElement | null>(null);
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});
  const allowExitRef = useRef(false);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedSample = PR_SAMPLES.find((item) => item.id === selectedSampleId) ?? null;
  const selectedRepository = repositories.find((item) => item.fullName === selectedRepositoryKey) ?? null;
  const selectedProfile = REVIEW_PROFILES.find((item) => item.id === reviewProfile) ?? REVIEW_PROFILES[1];
  const meaningfulInput = Boolean(
    diff.trim()
    || title.trim()
    || repository.trim()
    || technology.trim()
    || githubUrl.trim()
    || selectedRepositoryKey
    || selectedPullRequestNumber
    || selectedSampleId
    || reviewProfile !== "standard"
    || analysisModeTouched,
  );
  const shouldProtectInput = meaningfulInput && runPhase !== "complete";

  const inputSummary = useMemo(() => {
    if (!diff.trim()) return "No review input loaded";
    const lines = diff.split(/\r?\n/).length;
    return `${lines.toLocaleString()} diff lines available for transient analysis`;
  }, [diff]);

  useEffect(() => {
    let active = true;
    async function loadCapabilities() {
      try {
        const [analysisResponse, githubResponse] = await Promise.all([
          fetch("/api/generate-report", { cache: "no-store" }),
          fetch("/api/github-workspace?action=status", { cache: "no-store" }),
        ]);
        const analysisPayload: unknown = await analysisResponse.json();
        const githubPayload: unknown = await githubResponse.json();
        if (!active) return;

        const modelRecord = isRecord(analysisPayload) && isRecord(analysisPayload.modelAssisted)
          ? analysisPayload.modelAssisted
          : null;
        const configured = modelRecord?.state === "configured";
        setProvider({
          checked: true,
          configured,
          provider: typeof modelRecord?.provider === "string" ? modelRecord.provider : "openai",
          model: typeof modelRecord?.model === "string" ? modelRecord.model : undefined,
        });
        if (configured && !analysisModeTouched) setAnalysisMode("model-assisted");

        if (isRecord(githubPayload) && typeof githubPayload.connected === "boolean") {
          setGithubStatus({
            connected: githubPayload.connected,
            identity: typeof githubPayload.identity === "string" ? githubPayload.identity : undefined,
            error: typeof githubPayload.error === "string" ? githubPayload.error : undefined,
          });
          if (githubPayload.connected) await loadRepositories();
        } else {
          setGithubStatus({ connected: false, error: "GitHub workspace capability could not be established." });
        }
      } catch {
        if (!active) return;
        setProvider({ checked: true, configured: false, provider: "openai" });
        setGithubStatus({ connected: false, error: "GitHub workspace capability could not be established." });
      }
    }

    void loadCapabilities();
    return () => { active = false; };
  // The untouched default is resolved once from server capability truth.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!shouldProtectInput || allowExitRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function onDocumentClick(event: MouseEvent) {
      if (!shouldProtectInput || allowExitRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const next = new URL(target.href, window.location.href);
      if (next.origin !== window.location.origin || next.href === window.location.href) return;
      event.preventDefault();
      dialogReturnRef.current = target;
      setDialogIntent({ kind: "leave", href: next.href });
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [shouldProtectInput]);

  useEffect(() => () => {
    if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
  }, []);

  async function loadRepositories() {
    try {
      const response = await fetch("/api/github-workspace?action=repositories", { cache: "no-store" });
      const payload: unknown = await response.json();
      if (!response.ok || !isRecord(payload) || !Array.isArray(payload.repositories)) return;
      setRepositories(payload.repositories.filter((item): item is GitHubRepository => (
        isRecord(item)
        && typeof item.owner === "string"
        && typeof item.name === "string"
        && typeof item.fullName === "string"
        && typeof item.private === "boolean"
      )));
    } catch {
      setSourceMessage("Connected repositories could not be read. Other source paths remain available.");
    }
  }

  async function chooseConnectedRepository(fullName: string) {
    setSelectedRepositoryKey(fullName);
    setSelectedPullRequestNumber("");
    setPullRequests([]);
    setImportedPullRequest(null);
    setDiff("");
    const next = repositories.find((item) => item.fullName === fullName);
    if (!next) return;
    setSourceBusy(true);
    setSourceMessage(`Reading open pull requests from ${fullName}…`);
    try {
      const response = await fetch(`/api/github-workspace?action=pulls&owner=${encodeURIComponent(next.owner)}&repo=${encodeURIComponent(next.name)}`, { cache: "no-store" });
      const payload: unknown = await response.json();
      if (!response.ok || !isRecord(payload) || !Array.isArray(payload.pullRequests)) throw new Error(errorMessage(payload, "Open pull requests could not be read."));
      const nextPulls = payload.pullRequests.filter((item): item is GitHubPullRequest => (
        isRecord(item) && typeof item.number === "number" && typeof item.title === "string"
      ));
      setPullRequests(nextPulls);
      setSourceMessage(nextPulls.length ? `${nextPulls.length} open pull request${nextPulls.length === 1 ? "" : "s"} available.` : "No open pull requests are available for this repository.");
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : "Open pull requests could not be read.");
    } finally {
      setSourceBusy(false);
    }
  }

  function applyImportedPullRequest(value: ImportedPullRequest) {
    setImportedPullRequest(value);
    setTitle(value.title?.trim() ?? "");
    setRepository(value.repository);
    setDiff(value.diff);
    const inferred = inferStack(value.diff);
    if (inferred) setTechnology(inferred);
    setErrors({});
    setSourceMessage(`Imported ${value.repository} #${value.number}. Verify the metadata before analysis.`);
  }

  async function importPublicPullRequest() {
    if (!githubUrl.trim()) {
      const next = { githubUrl: "Enter a public GitHub pull-request URL." };
      setErrors(next);
      fieldRefs.current.githubUrl?.focus();
      return;
    }
    setSourceBusy(true);
    setSourceMessage("Reading the public pull request from GitHub…");
    try {
      const response = await fetch("/api/fetch-pr-diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl.trim() }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isRecord(payload) || typeof payload.diff !== "string" || typeof payload.repository !== "string" || typeof payload.number !== "number" || typeof payload.url !== "string") {
        throw new Error(errorMessage(payload, "The public pull request could not be imported."));
      }
      applyImportedPullRequest(payload as ImportedPullRequest);
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : "The public pull request could not be imported.");
    } finally {
      setSourceBusy(false);
    }
  }

  async function importConnectedPullRequest() {
    if (!selectedRepository || !selectedPullRequestNumber) {
      const next = { connectedPullRequest: "Choose an available repository and pull request." };
      setErrors(next);
      fieldRefs.current.connectedPullRequest?.focus();
      return;
    }
    const number = Number(selectedPullRequestNumber);
    setSourceBusy(true);
    setSourceMessage(`Importing ${selectedRepository.fullName} #${number}…`);
    try {
      const response = await fetch("/api/github-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: selectedRepository.owner, repo: selectedRepository.name, number, private: selectedRepository.private }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isRecord(payload) || typeof payload.diff !== "string" || typeof payload.repository !== "string" || typeof payload.number !== "number" || typeof payload.url !== "string") {
        throw new Error(errorMessage(payload, "The connected pull request could not be imported."));
      }
      applyImportedPullRequest(payload as ImportedPullRequest);
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : "The connected pull request could not be imported.");
    } finally {
      setSourceBusy(false);
    }
  }

  function applySample(sampleId: string) {
    const sample = PR_SAMPLES.find((item) => item.id === sampleId);
    setSelectedSampleId(sampleId);
    if (!sample) return;
    setTitle(sample.input.title);
    setRepository(sample.input.repository);
    setTechnology(sample.input.technology);
    setDiff(sample.input.diff);
    setReviewProfile(sample.input.reviewProfile ?? "standard");
    setImportedPullRequest(null);
    setSourceMessage("Sample loaded. It will remain explicitly sample-only and session-only.");
    setErrors({});
  }

  function clearSourceData() {
    setTitle("");
    setRepository("");
    setTechnology("");
    setDiff("");
    setGithubUrl("");
    setImportedPullRequest(null);
    setSelectedSampleId("");
    setSelectedRepositoryKey("");
    setSelectedPullRequestNumber("");
    setPullRequests([]);
    setSourceMessage(null);
    setErrors({});
    setCompleted(null);
    setRunPhase("idle");
  }

  function requestSourceChange(nextSource: SourceKind, trigger: HTMLElement) {
    if (nextSource === source) return;
    if (diff.trim() || title.trim() || repository.trim() || technology.trim() || githubUrl.trim() || selectedRepositoryKey || selectedSampleId) {
      dialogReturnRef.current = trigger;
      setDialogIntent({ kind: "source", nextSource });
      return;
    }
    setSource(nextSource);
    setStep(1);
    setErrors({});
  }

  function validate(targetStep: IntakeStep): FieldErrors {
    const next: FieldErrors = {};
    if (targetStep >= 1) {
      if (source === "manual" && !diff.trim()) next.diff = "Paste a unified diff before continuing.";
      if (source === "public-github" && !importedPullRequest) next.githubUrl = "Import a supported public pull request before continuing.";
      if (source === "connected-github" && !importedPullRequest) next.connectedPullRequest = "Import an available connected pull request before continuing.";
      if (source === "sample" && !selectedSample) next.sample = "Choose a built-in sample before continuing.";
    }
    if (targetStep >= 2) {
      if (!title.trim()) next.title = "Review title is required and becomes the durable Case File title.";
      if (!repository.trim()) next.repository = "Repository identity is required.";
      if (!technology.trim()) next.technology = "Language or framework is required because the current generator uses it as analysis context.";
    }
    if (targetStep >= 3 && analysisMode === "model-assisted" && !provider.configured) {
      next.analysisMode = "Model assistance is not configured. Choose deterministic-only analysis.";
    }
    return next;
  }

  function focusErrors(next: FieldErrors) {
    setErrors(next);
    const first = firstInvalidField(next);
    if (first) window.requestAnimationFrame(() => fieldRefs.current[first]?.focus());
  }

  function goForward() {
    const nextErrors = validate(step);
    if (Object.keys(nextErrors).length) {
      focusErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep((current) => Math.min(4, current + 1) as IntakeStep);
  }

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(3);
    if (Object.keys(nextErrors).length) {
      focusErrors(nextErrors);
      setStep(nextErrors.title || nextErrors.repository || nextErrors.technology ? 2 : nextErrors.analysisMode ? 3 : 1);
      return;
    }

    const input: ReportInput = {
      title: title.trim(),
      repository: repository.trim(),
      technology: technology.trim(),
      diff,
      inputSource: sourceInputType(source),
      reviewProfile,
      changePassport: selectedSample?.input.changePassport,
    };
    setRunPhase("analysis");
    setRunMessage(null);
    setCompleted(null);

    let payload: GeneratedPayload;
    try {
      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...input,
            analysisMode,
            sourceUrl: importedPullRequest?.url,
            pullRequestNumber: importedPullRequest?.number,
          }),
        });
        const value: unknown = await response.json();
        if (response.status === 413) throw new Error("This diff exceeds the current 200,000-character analysis limit.");
        if (!response.ok) throw new Error(errorMessage(value, "Analysis could not be completed."));
        const parsed = parseGeneratedPayload(value);
        if (!parsed) throw new Error("The analysis result could not be normalised into a canonical review.");
        payload = parsed;
      } catch (error) {
        if (error instanceof Error && error.message.includes("200,000-character")) throw error;
        const report = generateReport(input);
        const canonicalRun = createCanonicalReviewRunManifest({
          input,
          report,
          analysisSource: "fallback",
          sourceUrl: importedPullRequest?.url,
          pullRequestNumber: importedPullRequest?.number,
          provider: analysisMode === "model-assisted" ? provider.provider : undefined,
          model: analysisMode === "model-assisted" ? provider.model : undefined,
        });
        const mergeContract = buildMergeContract({
          report,
          changePassport: input.changePassport,
          canonicalRunId: canonicalRun.runId,
          baseSha: canonicalRun.baseSha,
          headSha: canonicalRun.headSha,
          sourceType: canonicalRun.sourceType,
          reviewMode: canonicalRun.reviewMode,
          createdAt: canonicalRun.completedAt,
        });
        const verificationPack = buildVerificationPack({ report, canonicalRun, changePassport: input.changePassport, mergeContract, sourceUrl: importedPullRequest?.url, createdAt: canonicalRun.completedAt });
        payload = { report, source: "deterministic", canonicalRun, mergeContract, verificationPack };
      }

      setRunPhase("normalising");
      try {
        sessionStorage.setItem(GENERATED_REPORT_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Durable persistence below may still make the canonical review available.
      }

      setRunPhase("persisting");
      let reportId: string | null = null;
      let persistence: CompletedReview["persistence"] = source === "sample" ? "sample" : "session";
      if (source !== "sample") {
        try {
          const result = persistCanonicalReview(payload);
          reportId = result.reportId;
          if (reportId) persistence = "durable";
        } catch {
          reportId = null;
        }
      }

      const nextCompleted: CompletedReview = { ...payload, reportId, persistence, navigationAttempted: false };
      setCompleted(nextCompleted);
      setRunPhase("complete");
      setRunMessage(
        payload.canonicalRun.analysisSource === "fallback"
          ? "Deterministic fallback completed. Model assistance was unavailable or its result could not be normalised."
          : payload.canonicalRun.analysisSource === "model"
            ? "Deterministic verification and model-assisted synthesis completed."
            : "Deterministic verification completed.",
      );
      allowExitRef.current = true;

      if (reportId) {
        navigationTimerRef.current = setTimeout(() => {
          setCompleted((current) => current ? { ...current, navigationAttempted: true } : current);
          router.push(`/workspace?reportId=${encodeURIComponent(reportId)}`);
        }, 900);
      }
    } catch (error) {
      setRunPhase("failed");
      setRunMessage(error instanceof Error ? error.message : "Analysis failed before a canonical review was available. No durable report was created.");
    }
  }

  function retryPersistence() {
    if (!completed || completed.reportId || completed.persistence === "sample") return;
    setRunPhase("persisting");
    try {
      const result = persistCanonicalReview(completed);
      if (!result.reportId) throw new Error("read-back did not confirm the stored report");
      setCompleted({ ...completed, reportId: result.reportId, persistence: "durable", navigationAttempted: false });
      setRunPhase("complete");
      setRunMessage("The canonical review is now stored in this browser. It can be opened in Workspace or Case File.");
    } catch {
      setRunPhase("complete");
      setRunMessage("Persistence still failed. The completed review remains available in this tab as a session Case File; retrying will not rerun analysis.");
    }
  }

  function confirmDialog() {
    if (!dialogIntent) return false;
    if (dialogIntent.kind === "source") {
      clearSourceData();
      setSource(dialogIntent.nextSource);
      setStep(1);
      return true;
    }
    allowExitRef.current = true;
    window.location.assign(dialogIntent.href);
    return true;
  }

  const finalActionLabel = runPhase === "analysis" || runPhase === "normalising" || runPhase === "persisting"
    ? "Analysis in progress"
    : "Begin verification";
  const analysisBusy = runPhase === "analysis" || runPhase === "normalising" || runPhase === "persisting";
  const completionHeading = completed?.persistence === "sample"
    ? "Sample review ready"
    : completed?.persistence === "durable"
      ? "Canonical review available"
      : "Session-only review available";
  const persistenceStepState = source === "sample"
    ? "not-applicable"
    : runPhase === "persisting"
      ? "current"
      : runPhase === "complete"
        ? completed?.persistence === "durable" ? "complete" : "failed"
        : "pending";
  const persistenceStepText = source === "sample"
    ? "Not applicable for sample-only input. Samples are not written to durable Report history."
    : runPhase === "persisting"
      ? "Saving, then verifying by reading browser-local Report history back."
      : runPhase === "complete" && completed?.persistence === "durable"
        ? "Completed. Verified by reading browser-local Report history back."
        : runPhase === "complete" && completed
          ? "Failed. The completed review remains in this tab; retry persistence without rerunning analysis."
          : "Pending canonical analysis result.";

  return (
    <AppShell context={`Step ${step} of 4`} contextTone="technical">
      <div className={styles.page}>
        <header className={styles.intro}>
          <span>NEW REVIEW</span>
          <h1>Prepare one change for verification</h1>
          <p>Choose a supported source, provide only analysis-used context, choose what to review and how Lintel will execute it, then verify the exact privacy and persistence boundary.</p>
        </header>

        <ol className={styles.steps} aria-label="New Review progress">
          {STEP_LABELS.map((label, index) => {
            const number = (index + 1) as IntakeStep;
            return (
              <li key={label} data-state={number === step ? "current" : number < step ? "complete" : "upcoming"}>
                <button type="button" onClick={() => number <= step && setStep(number)} disabled={number > step || analysisBusy} aria-current={number === step ? "step" : undefined}>
                  <span>{String(number).padStart(2, "0")}</span>
                  <strong>{label}</strong>
                </button>
              </li>
            );
          })}
        </ol>

        <form className={styles.form} onSubmit={runAnalysis} noValidate>
          {step === 1 && (
            <section className={styles.panel} aria-labelledby="source-heading">
              <div className={styles.sectionHeading}>
                <span>01 / SOURCE</span>
                <h2 id="source-heading">Choose review material</h2>
                <p>Only source paths backed by the current repository are shown.</p>
              </div>
              <fieldset className={styles.sourceGrid} ref={(node) => { fieldRefs.current.source = node; }}>
                <legend className={styles.srOnly}>Review source</legend>
                {(Object.keys(SOURCE_COPY) as SourceKind[]).map((option) => {
                  const copy = SOURCE_COPY[option];
                  const unavailable = option === "connected-github" && githubStatus?.connected === false;
                  return (
                    <button
                      type="button"
                      className={source === option ? styles.sourceCardSelected : styles.sourceCard}
                      aria-pressed={source === option}
                      onClick={(event) => requestSourceChange(option, event.currentTarget)}
                      key={option}
                    >
                      <span className={unavailable ? styles.stateUnavailable : styles.stateNeutral}>{sourceStatus(option, githubStatus)}</span>
                      <strong>{copy.label}</strong>
                      <p>{copy.input}</p>
                      <small>{copy.boundary}</small>
                    </button>
                  );
                })}
              </fieldset>

              <div className={styles.sourceSetup}>
                {source === "manual" && (
                  <label className={styles.field}>
                    <span>Unified diff <b>Required</b></span>
                    <textarea
                      ref={(node) => { fieldRefs.current.diff = node; }}
                      value={diff}
                      onChange={(event) => { setDiff(event.target.value); setErrors((current) => ({ ...current, diff: undefined })); }}
                      rows={14}
                      spellCheck={false}
                      placeholder={'diff --git a/src/example.ts b/src/example.ts\n@@ -1,3 +1,4 @@'}
                      aria-invalid={Boolean(errors.diff)}
                      aria-describedby={errors.diff ? "diff-error" : "diff-help"}
                    />
                    <small id="diff-help">Analysed transiently. The raw diff is rejected from durable report history.</small>
                    {errors.diff && <em id="diff-error" role="alert">{errors.diff}</em>}
                  </label>
                )}

                {source === "public-github" && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.field}>
                      <span>Public pull-request URL <b>Required</b></span>
                      <input ref={(node) => { fieldRefs.current.githubUrl = node; }} type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/owner/repository/pull/123" aria-invalid={Boolean(errors.githubUrl)} aria-describedby={errors.githubUrl ? "github-url-error" : "github-url-help"} />
                      <small id="github-url-help">The server reads the public PR diff from GitHub. No authentication and no external write.</small>
                      {errors.githubUrl && <em id="github-url-error" role="alert">{errors.githubUrl}</em>}
                    </label>
                    <button className={styles.secondaryButton} type="button" onClick={importPublicPullRequest} disabled={sourceBusy}>{sourceBusy ? "Importing…" : importedPullRequest ? "Re-import pull request" : "Import pull request"}</button>
                  </div>
                )}

                {source === "connected-github" && (
                  <div className={styles.fieldGroup} ref={(node) => { fieldRefs.current.connectedPullRequest = node; }} tabIndex={-1}>
                    {githubStatus === null ? (
                      <p className={styles.notice} role="status">Checking the server-side GitHub workspace configuration…</p>
                    ) : githubStatus.connected ? (
                      <>
                        <p className={styles.notice}><strong>Available.</strong> Configured as <code>{githubStatus.identity ?? "server-side GitHub token"}</code>. Credentials remain server-side.</p>
                        <div className={styles.twoFields}>
                          <label className={styles.field}>
                            <span>Repository <b>Required</b></span>
                            <select value={selectedRepositoryKey} onChange={(event) => void chooseConnectedRepository(event.target.value)}>
                              <option value="">Choose a repository</option>
                              {repositories.map((item) => <option value={item.fullName} key={item.fullName}>{item.fullName}{item.private ? " · private" : ""}</option>)}
                            </select>
                          </label>
                          <label className={styles.field}>
                            <span>Open pull request <b>Required</b></span>
                            <select value={selectedPullRequestNumber} onChange={(event) => setSelectedPullRequestNumber(event.target.value)} disabled={!selectedRepositoryKey || sourceBusy}>
                              <option value="">Choose a pull request</option>
                              {pullRequests.map((item) => <option value={item.number} key={item.number}>#{item.number} · {item.title}</option>)}
                            </select>
                          </label>
                        </div>
                        <button className={styles.secondaryButton} type="button" onClick={importConnectedPullRequest} disabled={sourceBusy || !selectedPullRequestNumber}>{sourceBusy ? "Reading from GitHub…" : importedPullRequest ? "Re-import pull request" : "Import pull request"}</button>
                        {errors.connectedPullRequest && <em role="alert">{errors.connectedPullRequest}</em>}
                      </>
                    ) : (
                      <div className={styles.unavailable}>
                        <strong>Connected GitHub is unavailable.</strong>
                        <p>{githubStatus.error ?? "A server-side GitHub token is not configured."}</p>
                        <span>Use a public pull-request URL, local pasted diff or explicit sample. Lintel will not substitute a sample automatically.</span>
                      </div>
                    )}
                  </div>
                )}

                {source === "sample" && (
                  <label className={styles.field}>
                    <span>Sample scenario <b>Required</b></span>
                    <select ref={(node) => { fieldRefs.current.sample = node; }} value={selectedSampleId} onChange={(event) => applySample(event.target.value)} aria-invalid={Boolean(errors.sample)}>
                      <option value="">Choose an explicit sample</option>
                      {PR_SAMPLES.map((sample) => <option value={sample.id} key={sample.id}>{sample.name}</option>)}
                    </select>
                    <small>Built-in diff · sample-only · session-only result · no external read or write.</small>
                    {errors.sample && <em role="alert">{errors.sample}</em>}
                  </label>
                )}

                {sourceMessage && <p className={styles.notice} role="status">{sourceMessage}</p>}
                {diff.trim() && <p className={styles.inputReady}><strong>Input available.</strong> {inputSummary}. {importedPullRequest ? `${importedPullRequest.repository} #${importedPullRequest.number}.` : ""}</p>}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className={styles.panel} aria-labelledby="context-heading">
              <div className={styles.sectionHeading}>
                <span>02 / CONTEXT</span>
                <h2 id="context-heading">Confirm review identity</h2>
                <p>Each required value is consumed by the current analysis and becomes part of the Case File identity or technical context.</p>
              </div>
              <div className={styles.contextFields}>
                <label className={styles.field}>
                  <span>Review title <b>Required</b></span>
                  <input ref={(node) => { fieldRefs.current.title = node; }} value={title} onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: undefined })); }} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : "title-help"} />
                  <small id="title-help">Used as the review and durable Case File title.</small>
                  {errors.title && <em id="title-error" role="alert">{errors.title}</em>}
                </label>
                <label className={styles.field}>
                  <span>Repository <b>Required</b></span>
                  <input className={styles.mono} ref={(node) => { fieldRefs.current.repository = node; }} value={repository} onChange={(event) => { setRepository(event.target.value); setErrors((current) => ({ ...current, repository: undefined })); }} placeholder="owner/repository" aria-invalid={Boolean(errors.repository)} aria-describedby={errors.repository ? "repository-error" : "repository-help"} />
                  <small id="repository-help">Used for review identity, history matching and run context.</small>
                  {errors.repository && <em id="repository-error" role="alert">{errors.repository}</em>}
                </label>
                <label className={styles.field}>
                  <span>Language / framework <b>Required</b></span>
                  <input ref={(node) => { fieldRefs.current.technology = node; }} value={technology} onChange={(event) => { setTechnology(event.target.value); setErrors((current) => ({ ...current, technology: undefined })); }} placeholder="TypeScript / Next.js" aria-invalid={Boolean(errors.technology)} aria-describedby={errors.technology ? "technology-error" : "technology-help"} />
                  <small id="technology-help">Supplied to deterministic and model-assisted analysis as technical context.</small>
                  {errors.technology && <em id="technology-error" role="alert">{errors.technology}</em>}
                </label>
              </div>
              <dl className={styles.keyValues}>
                <div><dt>Source</dt><dd>{SOURCE_COPY[source].label}</dd></div>
                <div><dt>Pull request</dt><dd>{importedPullRequest ? `#${importedPullRequest.number}` : "Not recorded"}</dd></div>
                <div><dt>Branches</dt><dd className={styles.mono}>{importedPullRequest?.baseBranch || importedPullRequest?.headBranch ? `${importedPullRequest.baseBranch ?? "base"} ← ${importedPullRequest.headBranch ?? "head"}` : "Not recorded"}</dd></div>
                <div><dt>Raw diff retention</dt><dd>Not retained in durable history</dd></div>
              </dl>
            </section>
          )}

          {step === 3 && (
            <section className={styles.panel} aria-labelledby="profile-heading">
              <div className={styles.sectionHeading}>
                <span>03 / ANALYSIS</span>
                <h2 id="profile-heading">Choose review and execution modes</h2>
                <p>Review mode controls what engineers want checked. Analysis mode controls how Lintel performs that check.</p>
              </div>
              <div className={styles.analysisColumns}>
                <fieldset className={styles.choiceList}>
                  <legend>Review mode</legend>
                  {REVIEW_PROFILES.map((profile) => (
                    <label key={profile.id} className={reviewProfile === profile.id ? styles.choiceSelected : styles.choice}>
                      <input type="radio" name="review-profile" value={profile.id} checked={reviewProfile === profile.id} onChange={() => setReviewProfile(profile.id)} />
                      <span><strong>{profile.label}</strong><small>{profile.description}</small></span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className={styles.choiceList} ref={(node) => { fieldRefs.current.analysisMode = node; }} tabIndex={-1}>
                  <legend>Analysis mode</legend>
                  <label className={analysisMode === "deterministic-only" ? styles.choiceSelected : styles.choice}>
                    <input type="radio" name="analysis-mode" value="deterministic-only" checked={analysisMode === "deterministic-only"} onChange={() => { setAnalysisMode("deterministic-only"); setAnalysisModeTouched(true); }} />
                    <span>
                      <strong>Deterministic-only <i>Always available</i></strong>
                      <small>Runs the versioned local rules baseline. No model call. Exact output is reproducible for the same normalised input and configuration.</small>
                    </span>
                  </label>
                  <label className={analysisMode === "model-assisted" ? styles.choiceSelected : provider.configured ? styles.choice : styles.choiceUnavailable}>
                    <input type="radio" name="analysis-mode" value="model-assisted" checked={analysisMode === "model-assisted"} disabled={!provider.configured} onChange={() => { setAnalysisMode("model-assisted"); setAnalysisModeTouched(true); }} />
                    <span>
                      <strong>Baseline + model-assisted <i>{provider.checked ? provider.configured ? "Configured" : "Unavailable" : "Checking"}</i></strong>
                      <small>{provider.configured ? `${provider.provider}${provider.model ? ` / ${provider.model}` : ""}. The deterministic baseline runs first; the diff may be sent to the configured model with store:false. If synthesis fails, Lintel keeps a labelled deterministic fallback.` : "Selectable only when OPENAI_API_KEY and OPENAI_MODEL are configured server-side. No provider key is exposed to this page."}</small>
                    </span>
                  </label>
                  {errors.analysisMode && <em role="alert">{errors.analysisMode}</em>}
                  <div className={styles.executionNote}>
                    <strong>Current default</strong>
                    <p>{provider.configured ? "Model-assisted when configured and not manually changed; deterministic otherwise." : "Deterministic-only because model assistance is unavailable."}</p>
                    <span>Model assistance may enrich synthesis; it never replaces deterministic verification.</span>
                  </div>
                </fieldset>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className={styles.panel} aria-labelledby="scope-heading">
              <div className={styles.sectionHeading}>
                <span>04 / VERIFY</span>
                <h2 id="scope-heading">Verify scope and boundaries</h2>
                <p>No recommendation, risk score or finding exists yet. This is the exact execution request.</p>
              </div>
              <dl className={styles.scopeGrid}>
                <div><dt>Source selected</dt><dd><strong>{SOURCE_COPY[source].label}</strong><span>{sourceStatus(source, githubStatus)}</span></dd></div>
                <div><dt>Review identity</dt><dd><strong>{title || "Missing title"}</strong><code>{repository || "Missing repository"}{importedPullRequest ? ` #${importedPullRequest.number}` : ""}</code></dd></div>
                <div><dt>Review mode</dt><dd><strong>{reviewProfileLabel(reviewProfile)}</strong><span>{reviewProfileDescription(reviewProfile)}</span></dd></div>
                <div><dt>Execution path</dt><dd><strong>{analysisMode === "model-assisted" ? "Deterministic baseline + configured model" : "Deterministic-only"}</strong><span>{analysisMode === "model-assisted" ? "Model call may occur; deterministic fallback remains authoritative when needed." : "No external model call."}</span></dd></div>
                <div><dt>Input availability</dt><dd><strong>{diff.trim() ? "Available" : "Missing"}</strong><span>{inputSummary}</span></dd></div>
                <div><dt>Privacy boundary</dt><dd><strong>{source === "manual" || source === "sample" ? "Local input" : "External GitHub read"}</strong><span>{analysisMode === "model-assisted" ? "The diff may cross the configured model-provider boundary with store:false." : "No model-provider boundary."}</span></dd></div>
                <div><dt>Persistence</dt><dd><strong>{source === "sample" ? "Session-only sample" : "Browser-local report history"}</strong><span>{source === "sample" ? "Not written to durable report history." : "Canonical result only, bounded to 10 reports on this device."}</span></dd></div>
                <div><dt>Raw diff retention</dt><dd><strong>Not retained</strong><span>Raw diff content is rejected from durable report history.</span></dd></div>
                <div><dt>External write</dt><dd><strong>None</strong><span>No GitHub comment, Slack message or other external write occurs from this workflow.</span></dd></div>
                <div><dt>Unavailable capability</dt><dd><strong>{githubStatus?.connected === false ? "Connected GitHub" : provider.configured ? "None in selected path" : "Model assistance"}</strong><span>GitHub Action remains Blueprint. Slack remains Export-only.</span></dd></div>
              </dl>

              {runPhase !== "idle" && (
                <section className={styles.progress} aria-labelledby="progress-heading" aria-live="polite">
                  <div>
                    <span>ANALYSIS STATUS</span>
                    <h3 id="progress-heading">{runPhase === "complete" ? completionHeading : runPhase === "failed" ? "Analysis did not complete" : "Verification in progress"}</h3>
                    {runMessage && <p className={runPhase === "failed" ? styles.progressError : undefined}>{runMessage}</p>}
                  </div>
                  <ol>
                    <li data-state="complete"><strong>Validate input</strong><span>Required source and context checked locally.</span></li>
                    <li data-state={runPhase === "analysis" ? "current" : ["normalising", "persisting", "complete"].includes(runPhase) ? "complete" : "pending"}><strong>Deterministic analysis</strong><span>Versioned baseline; no fabricated percentage.</span></li>
                    <li data-state={analysisMode !== "model-assisted" ? "not-applicable" : runPhase === "analysis" ? "current" : ["normalising", "persisting", "complete"].includes(runPhase) ? completed?.canonicalRun.analysisSource === "model" ? "complete" : "fallback" : "pending"}><strong>Model-assisted synthesis</strong><span>{analysisMode === "model-assisted" ? "Result provenance is confirmed only when the canonical response is available." : "Not selected."}</span></li>
                    <li data-state={runPhase === "normalising" ? "current" : ["persisting", "complete"].includes(runPhase) ? "complete" : "pending"}><strong>Normalise canonical result</strong><span>Report, run manifest, evidence and requirements.</span></li>
                    <li data-state={persistenceStepState}><strong>Persist local record</strong><span>{persistenceStepText}</span></li>
                  </ol>
                </section>
              )}

              {completed && (
                <section className={styles.success} aria-labelledby="success-heading">
                  <span>{completed.persistence === "durable" ? "DURABLE LOCAL REVIEW" : completed.persistence === "sample" ? "SAMPLE-ONLY RESULT" : "SESSION RESULT"}</span>
                  <h3 id="success-heading">{completionHeading}</h3>
                  <p>{completed.persistence === "durable" ? "Opening Verification Workspace for active investigation. The Case File remains available as the durable record." : completed.persistence === "sample" ? "This explicit sample stays read-only and session-only. Open its Case File to inspect the labelled result." : "Persistence failed, but the completed canonical result remains in this tab. Retry persistence safely or open the session Case File."}</p>
                  <dl>
                    <div><dt>Run</dt><dd><code>{shortId(completed.canonicalRun.runId)}</code></dd></div>
                    <div><dt>Analysis</dt><dd>{completed.canonicalRun.analysisSource}</dd></div>
                    <div><dt>Persistence</dt><dd>{completed.persistence === "durable" ? "Durable · read-back verified" : completed.persistence === "sample" ? "Sample-only · session-only" : "Session-only · not persisted"}</dd></div>
                    <div><dt>Recommendation</dt><dd>{completed.report.verdict.recommendation.replaceAll("_", " ")}</dd></div>
                  </dl>
                  <div className={styles.successActions}>
                    {completed.reportId ? <a className={styles.primaryLink} href={`/workspace?reportId=${encodeURIComponent(completed.reportId)}`}>Open Verification Workspace</a> : <a className={styles.primaryLink} href="/report?session=1">{completed.persistence === "sample" ? "Open sample Case File" : "Open session Case File"}</a>}
                    {completed.reportId && <a href={`/report?reportId=${encodeURIComponent(completed.reportId)}`}>Open durable Case File</a>}
                    {!completed.reportId && completed.persistence !== "sample" && <button type="button" onClick={retryPersistence}>Retry persistence without rerunning</button>}
                  </div>
                  {completed.reportId && completed.navigationAttempted && <p className={styles.navigationRecovery}>Automatic navigation did not replace this page. The completed record is safe; use either explicit link above.</p>}
                </section>
              )}
            </section>
          )}

          <footer className={styles.footer}>
            <div>
              <strong>{STEP_LABELS[step - 1]}</strong>
              <span>{step === 4 ? "Review the boundaries before beginning verification." : "Entered values stay in memory while moving between steps."}</span>
            </div>
            <div className={styles.footerActions}>
              {step > 1 && <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1) as IntakeStep)} disabled={analysisBusy}>Back</button>}
              {step < 4 ? <button className={styles.primaryButton} type="button" onClick={goForward} disabled={sourceBusy}>Continue</button> : runPhase !== "complete" && <button className={styles.primaryButton} type="submit" disabled={analysisBusy}>{finalActionLabel}</button>}
            </div>
          </footer>
        </form>
      </div>

      <ConsequentialDialog
        open={dialogIntent !== null}
        title={dialogIntent?.kind === "source" ? "Change review source?" : "Leave New Review?"}
        affectedObject={dialogIntent?.kind === "source" ? SOURCE_COPY[source].label : "Current review intake"}
        currentState={dialogIntent?.kind === "source" ? "Source input and review metadata are present" : "Meaningful unsaved input is present"}
        proposedState={dialogIntent?.kind === "source" ? `Clear source-specific input and switch to ${SOURCE_COPY[dialogIntent.nextSource].label}` : "Leave this route and discard the intake"}
        consequence={dialogIntent?.kind === "source" ? "Changing source clears the loaded diff and source-specific review metadata. Review and analysis mode selections are preserved." : "The raw diff and unsaved intake fields are held only in this route and will be lost."}
        unresolvedConditions={["No raw input recovery key will be created.", "Cancel keeps every entered value unchanged."]}
        confirmLabel={dialogIntent?.kind === "source" ? "Continue and clear input" : "Leave New Review"}
        eyebrow="Unsaved review intake"
        confirmTone="neutral"
        returnFocusRef={dialogReturnRef as RefObject<HTMLElement | null>}
        onConfirm={confirmDialog}
        onCancel={() => setDialogIntent(null)}
      />
    </AppShell>
  );
}
