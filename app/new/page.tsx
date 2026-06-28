"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { generateReport, GENERATED_REPORT_STORAGE_KEY, type ReportInput } from "../../lib/report-generator";
import type { Report } from "../../lib/mock-report";
import { CLEAN_APPROVE_SAMPLE, RISKY_TESTS_REQUIRED_SAMPLE } from "../../lib/sample-pr-input";

type ReportSource = "ai" | "deterministic";

type StoredReport = {
  report: Report;
  source: ReportSource;
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

export default function NewReportPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [repository, setRepository] = useState("");
  const [technology, setTechnology] = useState("");
  const [diff, setDiff] = useState("");

  function useSample(sample: ReportInput) {
    setTitle(sample.title);
    setRepository(sample.repository);
    setTechnology(sample.technology);
    setDiff(sample.diff);
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
            <div className="sample-buttons" role="group" aria-label="Load sample pull request">
              <button className="sample-diff-button" type="button" onClick={() => useSample(CLEAN_APPROVE_SAMPLE)}>
                Clean sample
              </button>
              <button className="sample-diff-button" type="button" onClick={() => useSample(RISKY_TESTS_REQUIRED_SAMPLE)}>
                Risky sample
              </button>
            </div>
          </div>
          <h1>Check merge readiness</h1>
          <p>Paste the PR context and diff. Lintel will analyse the change and produce a merge-readiness report.</p>
        </section>

        <form className="report-form" onSubmit={handleSubmit}>
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
            <button className="generate-button" type="submit" disabled={isGenerating}>
              {isGenerating ? "Generating…" : "Generate Report"}<span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
