"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { generateReport, GENERATED_REPORT_STORAGE_KEY, type ReportInput } from "../../lib/report-generator";
import type { Report } from "../../lib/mock-report";
import { PR_SAMPLES } from "../../lib/sample-pr-input";

type ReportSource = "ai" | "deterministic";

type StoredReport = {
  report: Report;
  source: ReportSource;
};

type GitHubImportResponse = {
  repository: string;
  diff: string;
  title?: string;
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
  if (!("repository" in value) || typeof value.repository !== "string" || !value.repository.trim()) return false;
  if (!("diff" in value) || typeof value.diff !== "string" || !value.diff.trim()) return false;
  return !("title" in value) || value.title === undefined || typeof value.title === "string";
}

function importErrorMessage(value: unknown) {
  if (typeof value !== "object" || value === null || !("error" in value)) return null;
  return typeof value.error === "string" ? value.error : null;
}

export default function NewReportPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingDiff, setIsFetchingDiff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [githubUrl, setGitHubUrl] = useState("");
  const [title, setTitle] = useState("");
  const [repository, setRepository] = useState("");
  const [technology, setTechnology] = useState("");
  const [diff, setDiff] = useState("");

  function useSample(sample: ReportInput) {
    setTitle(sample.title);
    setRepository(sample.repository);
    setTechnology(sample.technology);
    setDiff(sample.diff);
    setImportStatus(null);
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

      setRepository(payload.repository);
      setDiff(payload.diff);
      if (payload.title?.trim()) setTitle(payload.title.trim());
      setError(null);
      setImportStatus({
        type: "success",
        message: "Diff imported. Review the fields and confirm the language or framework before generating.",
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "The pull request could not be imported.";
      setImportStatus({ type: "error", message });
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
      router.push("/report");
    } catch {
      setError("The report could not be generated locally. Please try again.");
      setIsGenerating(false);
    }
  }

  return (
    <main className="new-page">
      <header className="new-topbar">
        <Link className="new-brand" href="/">
          <span className="brand-mark" aria-hidden="true">◢</span>
          <span>Lintel</span>
        </Link>
        <span>Local prototype</span>
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
          <p>Paste the PR context and diff. Lintel will analyse the change and produce a merge-readiness report.</p>
        </section>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="github-import">
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
            <p id="github-import-help" className="github-import-help">Public pull requests only. Nothing is generated until you select Generate Report.</p>
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
              <input name="technology" required value={technology} onChange={(event) => setTechnology(event.target.value)} placeholder="Python / FastAPI" />
            </label>
            <label className="form-field form-field--wide">
              <span>PR diff</span>
              <textarea name="diff" required rows={16} value={diff} onChange={(event) => setDiff(event.target.value)} spellCheck={false} placeholder={"diff --git a/app/service.py b/app/service.py\n--- a/app/service.py\n+++ b/app/service.py\n@@ -12,6 +12,10 @@"} />
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-footer">
            <p>Your diff is sent for analysis when AI generation is enabled. Lintel does not store the raw diff.</p>
            <button className="generate-button" type="submit" disabled={isGenerating || isFetchingDiff}>
              {isGenerating ? "Generating…" : "Generate Report"}<span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
