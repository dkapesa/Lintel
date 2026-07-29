"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import AppShell from "../app-shell";
import { historicalCanonicalRunManifest, type CanonicalReviewRunManifest } from "../../lib/canonical-review-run";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import { REPORT_HISTORY_STORAGE_KEY, readReportHistory, type ReportHistoryEntry, type ReportHistorySource } from "../../lib/report-history";
import { readOnlyStorage } from "../../lib/workspace-v2/read-only-storage";
import { createRealWorkspaceAdapter } from "../../lib/workspace-v2/real-adapter";
import {
  APPLICABILITY_LABEL,
  OUTCOME_LABEL,
  RECOMMENDATION_LABEL,
  type CaseDetail,
  type DecisionLedgerEventView,
  type RelatedArtifact,
  type RelationshipState,
  type WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";
import type { MergeContract } from "../../lib/merge-contract";
import type { VerificationPack } from "../../lib/verification-pack";
import type { ContractRecheckRecord } from "../../lib/contract-recheck";
import type { Report } from "../../lib/mock-report";
import { report as demoReport } from "../../lib/mock-report";
import styles from "./case-file.module.css";

type Provenance = "durable" | "session" | "sample";
type Resolution =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "unavailable"; requestedId: string | null; reason: string }
  | {
      status: "ready";
      caseDetail: CaseDetail;
      report: Report;
      source: ReportHistorySource;
      title: string;
      reportId: string | null;
      provenance: Provenance;
      limitations: string[];
    };

type SessionPayload = {
  report: Report;
  source: ReportHistorySource;
  canonicalRun?: CanonicalReviewRunManifest;
  mergeContract?: MergeContract;
  verificationPack?: VerificationPack;
  contractRecheck?: ContractRecheckRecord;
};

type SectionId = "identity" | "map" | "findings" | "evidence" | "requirements" | "context" | "history" | "decisions" | "export";
type RecordKind = "change" | "finding" | "evidence" | "missing-proof" | "requirement" | "context" | "readiness" | "run" | "decision";

type MapNode = {
  key: string;
  kind: RecordKind;
  id: string;
  label: string;
  detail: string;
  section: SectionId;
  provenance: "stored" | "derived";
  sourceId?: string;
};

type MapStage = {
  label: string;
  state: "available" | "none" | "unavailable";
  stateLabel: string;
  nodes: MapNode[];
};

type RelationshipDisplay = {
  key: string;
  label: string;
  state: "stored" | "derived" | "unavailable" | "none" | "unresolved";
  detail: string;
  targets: RelatedArtifact[];
};

type GitHubAppState = "checking" | "connected" | "not-configured" | "unavailable";

const SECTION_LINKS: Array<{ id: SectionId; label: string }> = [
  { id: "identity", label: "Case identity" },
  { id: "map", label: "Review Map" },
  { id: "findings", label: "Findings" },
  { id: "evidence", label: "Evidence & missing proof" },
  { id: "requirements", label: "Requirements" },
  { id: "context", label: "Affected context" },
  { id: "history", label: "Run history" },
  { id: "decisions", label: "Human Decisions" },
  { id: "export", label: "Export & handoff" },
];

const PROVENANCE_COPY: Record<Provenance, { label: string; detail: string }> = {
  durable: {
    label: "Durable local Case File",
    detail: "Stored in bounded browser-local report history on this device. It is not hosted or shared authority.",
  },
  session: {
    label: "Session Case File",
    detail: "Available only from the current browser session. It is not durable and cannot identify an exact Workspace case.",
  },
  sample: {
    label: "Read-only sample Case File",
    detail: "Explicit fixture content for inspection only. It is not written to durable history and carries no mutation authority.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isReport(value: unknown): value is Report {
  return isRecord(value)
    && isRecord(value.pr)
    && isRecord(value.verdict)
    && typeof value.pr.title === "string"
    && typeof value.pr.repository === "string"
    && typeof value.verdict.recommendation === "string"
    && Array.isArray(value.findings)
    && Array.isArray(value.changedFiles)
    && Array.isArray(value.conditionsBeforeMerge);
}

function parseSessionPayload(value: unknown): SessionPayload | null {
  if (isReport(value)) return { report: value, source: "deterministic" };
  if (!isRecord(value) || !isReport(value.report)) return null;
  if (value.source !== "ai" && value.source !== "deterministic") return null;
  return {
    report: value.report,
    source: value.source,
    canonicalRun: isRecord(value.canonicalRun) ? value.canonicalRun as CanonicalReviewRunManifest : undefined,
    mergeContract: isRecord(value.mergeContract) ? value.mergeContract as MergeContract : undefined,
    verificationPack: isRecord(value.verificationPack) ? value.verificationPack as VerificationPack : undefined,
    contractRecheck: isRecord(value.contractRecheck) ? value.contractRecheck as ContractRecheckRecord : undefined,
  };
}

function normaliseReportId(value: string) {
  return value.startsWith("report-") ? value.slice("report-".length) : value;
}

function validTimestamp(value?: string) {
  return value && !Number.isNaN(Date.parse(value)) ? value : "1970-01-01T00:00:00.000Z";
}

function transientStorage(payload: SessionPayload, sourceType: "manual" | "sample"): Storage {
  const canonicalRun = payload.canonicalRun ?? historicalCanonicalRunManifest(payload.report, sourceType);
  const createdAt = validTimestamp(canonicalRun.completedAt ?? canonicalRun.createdAt);
  const values = new Map<string, string>([[REPORT_HISTORY_STORAGE_KEY, JSON.stringify([{
    report: payload.report,
    source: payload.source,
    canonicalRun,
    mergeContract: payload.mergeContract,
    verificationPack: payload.verificationPack,
    contractRecheck: payload.contractRecheck,
    createdAt,
  }])]]);

  return {
    get length() { return values.size; },
    clear() { values.clear(); },
    getItem(key) { return values.get(key) ?? null; },
    key(index) { return [...values.keys()][index] ?? null; },
    removeItem(key) { values.delete(key); },
    setItem(key, value) { values.set(key, value); },
  };
}

async function projectEntry(storage: Storage, reportId: string | null): Promise<WorkspaceSnapshot> {
  return createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId });
}

function entryForCase(history: ReportHistoryEntry[], caseId: string) {
  const id = normaliseReportId(caseId);
  return history.find((entry) => entry.createdAt === id) ?? null;
}

function shortId(value?: string | null) {
  if (!value) return "Not recorded";
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

function formatDate(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function humanLabel(value: string) {
  return value.replaceAll("-", " ").replaceAll("_", " ");
}

function safeFilename(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
  return `${cleaned || "lintel-case-file"}.txt`;
}

function relationSummary(state: RelationshipState) {
  if (state.status === "linked") return `${state.related.length} linked`;
  if (state.status === "unresolved") return `${state.unresolved.length} unresolved`;
  if (state.status === "unavailable") return "Unavailable";
  return "None recorded";
}

function mapNodeForArtifact(artifact: RelatedArtifact): MapNode {
  const section: SectionId = artifact.kind === "change" ? "context" : artifact.kind === "finding" ? "findings" : artifact.kind === "evidence" ? "evidence" : "requirements";
  return {
    key: `${artifact.kind}:${artifact.id}`,
    kind: artifact.kind,
    id: artifact.id,
    label: artifact.label,
    detail: artifact.detail ?? humanLabel(artifact.kind),
    section,
    provenance: "stored",
  };
}

function buildMap(caseDetail: CaseDetail): MapStage[] {
  const changes: MapNode[] = caseDetail.changedFiles.slice(0, 3).map((item) => ({
    key: `change:${item.artifactId}`,
    kind: "change",
    id: item.artifactId,
    label: item.path,
    detail: item.focusedRegions.length ? "Exact recorded line context" : "File-only context",
    section: "context",
    provenance: "stored",
  }));
  const findings: MapNode[] = caseDetail.findings.slice(0, 3).map((item) => ({
    key: `finding:${item.findingId}`,
    kind: "finding",
    id: item.findingId,
    label: item.title,
    detail: `${item.severity} · ${item.category}`,
    section: "findings",
    provenance: "stored",
  }));
  const presentEvidence: MapNode[] = caseDetail.evidence.filter((item) => item.status !== "missing" && item.status !== "unverified").slice(0, 3).map((item) => ({
    key: `evidence:${item.evidenceId}`,
    kind: "evidence",
    id: item.evidenceId,
    label: item.title,
    detail: `${humanLabel(item.evidenceClass)} · ${item.status}`,
    section: "evidence",
    provenance: "stored",
  }));
  const missingProof: MapNode[] = caseDetail.evidence.filter((item) => item.status === "missing" || item.status === "unverified").slice(0, 3).map((item) => ({
    key: `missing-proof:${item.evidenceId}`,
    kind: "missing-proof",
    id: `missing-proof-${item.evidenceId}`,
    sourceId: item.evidenceId,
    label: item.statement,
    detail: `Derived from canonical evidence status: ${item.status}`,
    section: "evidence",
    provenance: "derived",
  }));
  const requirements: MapNode[] = caseDetail.requirements.slice(0, 3).map((item) => ({
    key: `requirement:${item.requirementId}`,
    kind: "requirement",
    id: item.requirementId,
    label: item.title,
    detail: `${item.importance} · ${item.status}`,
    section: "requirements",
    provenance: "stored",
  }));
  const contexts: MapNode[] = caseDetail.context.reviewerFocus.slice(0, 3).map((item, index) => ({
    key: `context:${index}`,
    kind: "context",
    id: `context-${index}`,
    label: item,
    detail: "Stored reviewer-focus context",
    section: "context",
    provenance: "stored",
  }));
  const readiness: MapNode[] = caseDetail.readiness.available ? [{
    key: "readiness:current",
    kind: "readiness",
    id: "current-readiness",
    label: humanLabel(caseDetail.readiness.readiness.classification),
    detail: `${caseDetail.readiness.readiness.previousScore} → ${caseDetail.readiness.readiness.currentScore}`,
    section: "history",
    provenance: "derived",
  }] : [];
  const decisions: MapNode[] = caseDetail.decision.status === "recorded" ? [{
    key: `decision:${caseDetail.decision.effectiveEntryId ?? "effective"}`,
    kind: "decision",
    id: caseDetail.decision.effectiveEntryId ?? "effective",
    label: OUTCOME_LABEL[caseDetail.decision.outcome],
    detail: APPLICABILITY_LABEL[caseDetail.decision.applicability],
    section: "decisions",
    provenance: "stored",
  }] : [];

  const stage = (label: string, nodes: MapNode[], empty: string, unavailable = false): MapStage => ({
    label,
    nodes,
    state: nodes.length ? "available" : unavailable ? "unavailable" : "none",
    stateLabel: nodes.length ? `${nodes.length} shown` : unavailable ? "Unavailable" : empty,
  });

  return [
    stage("Change", changes, "None recorded"),
    stage("Finding", findings, "No findings"),
    stage("Evidence", presentEvidence, "No evidence"),
    stage("Missing proof", missingProof, "None derived"),
    stage("Requirement", requirements, "No requirements"),
    stage("Affected context", contexts, "Unavailable", !contexts.length),
    stage("Readiness", readiness, "No comparison", !caseDetail.readiness.available),
    stage("Human Decision", decisions, caseDetail.decision.status === "empty" ? "None recorded" : "Unavailable", caseDetail.decision.status === "unavailable"),
  ];
}

function relationshipDisplays(caseDetail: CaseDetail, node: MapNode): RelationshipDisplay[] {
  const rows: RelationshipDisplay[] = [];
  const add = (key: string, label: string, value: RelationshipState, provenance: "stored" | "derived", detail: string) => {
    if (value.status === "linked") {
      rows.push({ key, label, state: provenance, detail, targets: value.related });
      if (value.unresolved.length) rows.push({ key: `${key}-unresolved`, label, state: "unresolved", detail: `Stored references did not resolve: ${value.unresolved.join(", ")}`, targets: [] });
    } else if (value.status === "unresolved") {
      rows.push({ key, label, state: "unresolved", detail: `Stored references did not resolve: ${value.unresolved.join(", ")}`, targets: [] });
    } else if (value.status === "unavailable") {
      rows.push({ key, label, state: "unavailable", detail: value.reason, targets: [] });
    } else {
      rows.push({ key, label, state: "none", detail: "The source could express this relationship and recorded none.", targets: [] });
    }
  };

  if (node.kind === "change") {
    const item = caseDetail.changedFiles.find((record) => record.artifactId === node.id);
    if (item) {
      add("change-findings", "raises", item.observations, "derived", "Deterministic derived relationship from an exact recorded finding path.");
      add("change-evidence", "supported by", item.evidence, "stored", "Stored relationship from a canonical evidence source path.");
    }
  }
  if (node.kind === "finding") {
    const item = caseDetail.findings.find((record) => record.findingId === node.id);
    if (item) {
      add("finding-change", "affects", item.affectedChange, "derived", "Deterministic derived relationship from an exact recorded location.");
      add("finding-evidence", "supported by", item.supportingEvidence, "stored", "Inverse of stored canonical evidence-to-finding references.");
      add("finding-requirement", "blocks or informs", item.relatedRequirements, "derived", "Deterministic requirement linkage supplied by the canonical adapter.");
    }
  }
  if (node.kind === "evidence" || node.kind === "missing-proof") {
    const sourceId = node.kind === "missing-proof" ? node.sourceId : node.id;
    const item = caseDetail.evidence.find((record) => record.evidenceId === sourceId);
    if (item) {
      add("evidence-findings", node.kind === "missing-proof" ? "weakens" : "supports", item.supportsFindings, "stored", "Stored canonical evidence-to-finding references.");
      add("evidence-requirements", node.kind === "missing-proof" ? "lacks proof for" : "supports", item.supportsRequirements, "stored", "Inverse of stored requirement supporting-evidence references.");
      add("evidence-changes", "applies to", item.relatedChanges, "stored", "Stored canonical evidence source path.");
    }
  }
  if (node.kind === "requirement") {
    const item = caseDetail.requirements.find((record) => record.requirementId === node.id);
    if (item) {
      add("requirement-evidence", "supported by", item.supportingEvidence, "stored", "Stored canonical requirement supporting-evidence references.");
      add("requirement-findings", "inferred from", item.relatedFindings, "derived", "Deterministic finding-to-requirement linkage supplied by the canonical adapter.");
    }
  }
  if (node.kind === "decision" && caseDetail.decision.status === "recorded") {
    const run = caseDetail.run;
    if (run && caseDetail.decision.applicableHeadSha && run.headSha === caseDetail.decision.applicableHeadSha) {
      rows.push({
        key: "decision-run",
        label: "applies to",
        state: "stored",
        detail: `Stored Human Decision head binding matches ${shortId(run.headSha)}.`,
        targets: [],
      });
    } else {
      rows.push({
        key: "decision-run",
        label: "applies to",
        state: "unavailable",
        detail: "The current run/head relationship is not available or does not establish current applicability.",
        targets: [],
      });
    }
  }
  if (node.kind === "context" || node.kind === "readiness" || node.kind === "run") {
    rows.push({
      key: `${node.kind}-relationships`,
      label: "related records",
      state: "unavailable",
      detail: "The current canonical relationship contract does not assert object-level edges from this record.",
      targets: [],
    });
  }
  return rows;
}

function recordNode(caseDetail: CaseDetail, kind: RelatedArtifact["kind"], id: string): MapNode | null {
  if (kind === "change") {
    const item = caseDetail.changedFiles.find((record) => record.artifactId === id);
    return item ? { key: `change:${id}`, kind, id, label: item.path, detail: "Affected file", section: "context", provenance: "stored" } : null;
  }
  if (kind === "finding") {
    const item = caseDetail.findings.find((record) => record.findingId === id);
    return item ? { key: `finding:${id}`, kind, id, label: item.title, detail: item.severity, section: "findings", provenance: "stored" } : null;
  }
  if (kind === "evidence") {
    const item = caseDetail.evidence.find((record) => record.evidenceId === id);
    return item ? { key: `evidence:${id}`, kind, id, label: item.title, detail: item.status, section: "evidence", provenance: "stored" } : null;
  }
  const item = caseDetail.requirements.find((record) => record.requirementId === id);
  return item ? { key: `requirement:${id}`, kind, id, label: item.title, detail: item.status, section: "requirements", provenance: "stored" } : null;
}

function buildExport(resolution: Extract<Resolution, { status: "ready" }>) {
  const { caseDetail, title, provenance, reportId } = resolution;
  const decision = caseDetail.decision.status === "recorded"
    ? `${OUTCOME_LABEL[caseDetail.decision.outcome]} · ${APPLICABILITY_LABEL[caseDetail.decision.applicability]} · ${caseDetail.decision.rationale ?? "No rationale recorded"}`
    : caseDetail.decision.status === "empty"
      ? "None recorded"
      : `Unavailable: ${caseDetail.decision.readError}`;
  return [
    "Lintel Case File",
    "",
    `Review: ${title}`,
    `Repository: ${caseDetail.github.repository}`,
    `Pull request: #${caseDetail.github.pullRequestNumber}`,
    `Report identity: ${reportId ?? `${provenance} only`}`,
    `Run: ${caseDetail.run?.runId ?? "Not recorded"}`,
    `Head: ${caseDetail.github.headSha ?? "Not recorded"}`,
    `Lintel recommendation: ${RECOMMENDATION_LABEL[caseDetail.recommendation]}`,
    `Risk: ${caseDetail.riskScore}/100 ${caseDetail.riskLevel}`,
    "",
    "Findings",
    ...(caseDetail.findings.length ? caseDetail.findings.map((item) => `- [${item.severity}] ${item.title}: ${item.statement}`) : ["- None recorded"]),
    "",
    "Evidence",
    ...(caseDetail.evidence.length ? caseDetail.evidence.map((item) => `- [${item.evidenceClass}/${item.status}] ${item.title}: ${item.statement}`) : ["- None recorded"]),
    "",
    "Requirements",
    ...(caseDetail.requirements.length ? caseDetail.requirements.map((item) => `- [${item.importance}/${item.status}] ${item.title}: ${item.evidenceRequired}`) : ["- None recorded"]),
    "",
    `Human Decision: ${decision}`,
    "",
    "Local export only. No external write was performed. Raw diff content is not included.",
  ].join("\n");
}

function copyFallback(value: string) {
  const area = document.createElement("textarea");
  area.value = value;
  area.readOnly = true;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied;
}

function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" | "danger" | "success" | "information" | "provenance" }) {
  return <span className={styles.statusPill} data-tone={tone}>{children}</span>;
}

function EmptyRecord({ children }: { children: ReactNode }) {
  return <p className={styles.emptyRecord}>{children}</p>;
}

export default function CaseFilePage() {
  const [resolution, setResolution] = useState<Resolution>({ status: "loading" });
  const [activeSection, setActiveSection] = useState<SectionId>("identity");
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [downloadState, setDownloadState] = useState<"idle" | "downloaded" | "failed">("idle");
  const [githubAppState, setGithubAppState] = useState<GitHubAppState>("checking");
  const [githubAppDetail, setGithubAppDetail] = useState("Checking the environment-gated GitHub App capability.");

  useEffect(() => {
    let active = true;
    async function resolve() {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("reportId");
      const sessionRequested = params.get("session") === "1";
      const demoRequested = params.get("demo") === "1";

      try {
        if (requested !== null) {
          const trimmed = requested.trim();
          if (!trimmed) {
            setResolution({ status: "unavailable", requestedId: requested, reason: "The requested report identity is empty. No other Case File was substituted." });
            return;
          }
          const snapshot = await projectEntry(window.localStorage, trimmed);
          if (!active) return;
          if (snapshot.status !== "ready") {
            setResolution({ status: "unavailable", requestedId: trimmed, reason: snapshot.status === "unavailable" ? snapshot.reason : "The requested Case File is not available in browser-local history. No other report was selected." });
            return;
          }
          const wantedCaseId = `report-${normaliseReportId(trimmed)}`;
          const caseDetail = snapshot.cases.find((item) => item.caseId === wantedCaseId);
          const history = readReportHistory(readOnlyStorage(window.localStorage));
          const entry = history.find((item) => item.createdAt === normaliseReportId(trimmed));
          if (!caseDetail || !entry) {
            setResolution({ status: "unavailable", requestedId: trimmed, reason: "The stored review could not be projected as the requested Case File. No substitute was selected." });
            return;
          }
          setResolution({ status: "ready", caseDetail, report: entry.report, source: entry.source, title: entry.report.pr.title, reportId: entry.createdAt, provenance: "durable", limitations: snapshot.limitations ?? [] });
          return;
        }

        if (sessionRequested) {
          const raw = sessionStorage.getItem(GENERATED_REPORT_STORAGE_KEY);
          const payload = raw ? parseSessionPayload(JSON.parse(raw) as unknown) : null;
          if (!payload) {
            setResolution({ status: "unavailable", requestedId: null, reason: "No valid session review is available. A durable report was not substituted." });
            return;
          }
          const provenance: Provenance = payload.canonicalRun?.sourceType === "sample" || payload.report.pr.branch === "sample" ? "sample" : "session";
          const storage = transientStorage(payload, provenance === "sample" ? "sample" : "manual");
          const snapshot = await projectEntry(storage, null);
          if (!active) return;
          if (snapshot.status !== "ready") {
            setResolution({ status: "unavailable", requestedId: null, reason: snapshot.status === "unavailable" ? snapshot.reason : "The session review could not be projected." });
            return;
          }
          const caseDetail = snapshot.cases.find((item) => item.caseId === snapshot.defaultCaseId);
          if (!caseDetail) {
            setResolution({ status: "unavailable", requestedId: null, reason: "The session review did not resolve to a canonical Case File." });
            return;
          }
          setResolution({ status: "ready", caseDetail, report: payload.report, source: payload.source, title: payload.report.pr.title, reportId: null, provenance, limitations: snapshot.limitations ?? [] });
          return;
        }

        if (demoRequested) {
          const payload: SessionPayload = { report: demoReport, source: "deterministic", canonicalRun: historicalCanonicalRunManifest(demoReport, "demo") };
          const snapshot = await projectEntry(transientStorage(payload, "sample"), null);
          if (!active) return;
          if (snapshot.status !== "ready") {
            setResolution({ status: "unavailable", requestedId: null, reason: "The explicit sample Case File could not be projected." });
            return;
          }
          const caseDetail = snapshot.cases.find((item) => item.caseId === snapshot.defaultCaseId);
          if (!caseDetail) {
            setResolution({ status: "unavailable", requestedId: null, reason: "The explicit sample did not resolve to a canonical Case File." });
            return;
          }
          setResolution({ status: "ready", caseDetail, report: demoReport, source: "deterministic", title: demoReport.pr.title, reportId: null, provenance: "sample", limitations: snapshot.limitations ?? [] });
          return;
        }

        const snapshot = await projectEntry(window.localStorage, null);
        if (!active) return;
        if (snapshot.status === "empty") {
          setResolution({ status: "empty" });
          return;
        }
        if (snapshot.status !== "ready") {
          setResolution({ status: "unavailable", requestedId: null, reason: snapshot.status === "unavailable" ? snapshot.reason : "Browser-local Case File history could not be loaded." });
          return;
        }
        const caseDetail = snapshot.cases.find((item) => item.caseId === snapshot.defaultCaseId);
        const history = readReportHistory(readOnlyStorage(window.localStorage));
        const entry = caseDetail ? entryForCase(history, caseDetail.caseId) : null;
        if (!caseDetail || !entry) {
          setResolution({ status: "unavailable", requestedId: null, reason: "Stored history exists but the selected Case File could not be resolved." });
          return;
        }
        setResolution({ status: "ready", caseDetail, report: entry.report, source: entry.source, title: entry.report.pr.title, reportId: entry.createdAt, provenance: "durable", limitations: snapshot.limitations ?? [] });
      } catch (error) {
        if (!active) return;
        setResolution({ status: "unavailable", requestedId: requested, reason: error instanceof Error ? `The Case File could not be read: ${error.message}` : "The Case File could not be read from this browser." });
      }
    }

    void resolve();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadGitHubAppState() {
      try {
        const response = await fetch("/api/github-app?view=status", { cache: "no-store" });
        const payload: unknown = await response.json();
        if (!active || !isRecord(payload)) return;
        if (payload.authenticated === true) {
          setGithubAppState("connected");
          setGithubAppDetail(`Verified for this environment${typeof payload.name === "string" ? ` as ${payload.name}` : ""}. This Case File does not publish a comment.`);
        } else if (payload.configured === false) {
          setGithubAppState("not-configured");
          setGithubAppDetail("Implemented but not configured for this environment. No external write is available from this Case File.");
        } else {
          setGithubAppState("unavailable");
          setGithubAppDetail(`Configured capability is unavailable: ${typeof payload.error === "string" ? humanLabel(payload.error) : "status could not be verified"}.`);
        }
      } catch {
        if (!active) return;
        setGithubAppState("unavailable");
        setGithubAppDetail("GitHub App status could not be established. No external write was attempted.");
      }
    }
    void loadGitHubAppState();
    return () => { active = false; };
  }, []);

  const mapStages = useMemo(() => resolution.status === "ready" ? buildMap(resolution.caseDetail) : [], [resolution]);
  const mapNodes = useMemo(() => mapStages.flatMap((stage) => stage.nodes), [mapStages]);
  const selectedNode = activeNode ?? mapNodes[0] ?? null;
  const relationships = useMemo(() => resolution.status === "ready" && selectedNode ? relationshipDisplays(resolution.caseDetail, selectedNode) : [], [resolution, selectedNode]);
  const missingEvidence = resolution.status === "ready" ? resolution.caseDetail.evidence.filter((item) => item.status === "missing" || item.status === "unverified") : [];
  const exportText = useMemo(() => resolution.status === "ready" ? buildExport(resolution) : "", [resolution]);
  const selectedIndex = selectedNode ? mapNodes.findIndex((item) => item.key === selectedNode.key) : -1;

  function selectNode(node: MapNode) {
    setActiveNode(node);
    setActiveSection(node.section);
    window.requestAnimationFrame(() => document.getElementById(`case-${node.section}`)?.scrollIntoView({ block: "start" }));
  }

  function selectRelated(target: RelatedArtifact) {
    if (resolution.status !== "ready") return;
    const node = recordNode(resolution.caseDetail, target.kind, target.id);
    if (node) selectNode(node);
  }

  async function copyCaseFile() {
    if (!exportText) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(exportText);
      copied = true;
    } catch {
      try { copied = copyFallback(exportText); } catch { copied = false; }
    }
    setCopyState(copied ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2_000);
  }

  function downloadCaseFile() {
    if (resolution.status !== "ready" || !exportText) return;
    try {
      const url = URL.createObjectURL(new Blob([exportText], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = safeFilename(`${resolution.caseDetail.github.repository}-${resolution.caseDetail.github.pullRequestNumber}-case-file`);
      link.click();
      URL.revokeObjectURL(url);
      setDownloadState("downloaded");
    } catch {
      setDownloadState("failed");
    }
    window.setTimeout(() => setDownloadState("idle"), 2_000);
  }

  const shellContext = resolution.status === "ready" ? `${resolution.caseDetail.github.repository} #${resolution.caseDetail.github.pullRequestNumber}` : "Durable review record";

  return (
    <AppShell context={shellContext} contextTone="technical">
      {resolution.status === "loading" && (
        <div className={styles.statePage} aria-busy="true" aria-live="polite">
          <span>CASE FILE</span>
          <h1>Loading known review identity</h1>
          <p>Reading browser-local report history and canonical projections. No stale report detail is shown while loading.</p>
        </div>
      )}

      {resolution.status === "empty" && (
        <div className={styles.statePage}>
          <span>CASE FILE</span>
          <h1>No Case Files are stored in this browser</h1>
          <p>This is a real empty local history, not a sample. Begin a review to create a canonical browser-local record.</p>
          <a href="/new">Start a New Review</a>
        </div>
      )}

      {resolution.status === "unavailable" && (
        <div className={styles.statePage} role="alert" aria-live="assertive">
          <span>CASE FILE UNAVAILABLE</span>
          <h1>The requested review is not available</h1>
          <p>{resolution.reason}</p>
          {resolution.requestedId && <dl><div><dt>Requested identity</dt><dd><code>{resolution.requestedId}</code></dd></div></dl>}
          <small>No other review or fixture was substituted. Nothing in browser-local history was changed.</small>
          <div><a href="/new">Start a New Review</a></div>
        </div>
      )}

      {resolution.status === "ready" && (() => {
        const { caseDetail, title, reportId, provenance, limitations } = resolution;
        const run = caseDetail.run;
        const history = caseDetail.history;
        const decision = caseDetail.decision;
        const openBlocking = caseDetail.requirements.filter((item) => item.importance === "blocking" && (item.status === "open" || item.status === "stale" || item.status === "unavailable")).length;
        const applicableDecision = decision.status === "recorded" ? APPLICABILITY_LABEL[decision.applicability] : decision.status === "empty" ? "None recorded" : "Unavailable";
        const workspaceHref = reportId ? `/workspace?reportId=${encodeURIComponent(reportId)}` : "/workspace";

        return (
          <div className={styles.page}>
            <header className={styles.caseHeader} id="case-identity">
              <div className={styles.caseTitle}>
                <span>CASE FILE · {PROVENANCE_COPY[provenance].label.toUpperCase()}</span>
                <h1>{title}</h1>
                <p><code>{caseDetail.github.repository}</code> · Pull request #{caseDetail.github.pullRequestNumber} · {caseDetail.github.branch}</p>
              </div>
              <div className={styles.headerActions}>
                {reportId && <a className={styles.primaryLink} href={workspaceHref}>Open in Workspace</a>}
                <a href="/new">New Review</a>
              </div>
              <section className={styles.provenanceNote} data-provenance={provenance}>
                <StatusPill tone="provenance">{PROVENANCE_COPY[provenance].label}</StatusPill>
                <p>{PROVENANCE_COPY[provenance].detail}</p>
                {!reportId && <span>Active investigation requires a durable Workspace case; this record has no authoritative local report ID.</span>}
              </section>
              {limitations.map((limitation) => <p className={styles.limitation} key={limitation}>{limitation}</p>)}
              <div className={styles.verdictStrip}>
                <div>
                  <span>Lintel recommendation</span>
                  <strong data-recommendation={caseDetail.recommendation}>{RECOMMENDATION_LABEL[caseDetail.recommendation]}</strong>
                  <p>{caseDetail.executiveSummary}</p>
                </div>
                <dl>
                  <div><dt>Risk</dt><dd><strong>{caseDetail.riskScore}/100</strong><span>{caseDetail.riskLevel}</span></dd></div>
                  <div><dt>Confidence</dt><dd><strong>{caseDetail.confidence}</strong><span>Recorded analysis confidence</span></dd></div>
                  <div><dt>Blocking open</dt><dd><strong>{openBlocking}</strong><span>{caseDetail.requirements.length} total requirements</span></dd></div>
                  <div><dt>Human Decision</dt><dd><strong>{applicableDecision}</strong><span>Separate accountable record</span></dd></div>
                </dl>
              </div>
              <dl className={styles.identityGrid}>
                <div><dt>Report identity</dt><dd><code>{reportId ?? `${provenance} · not durable`}</code></dd></div>
                <div><dt>Run</dt><dd><code>{run?.runId ?? "Not recorded"}</code></dd></div>
                <div><dt>Head</dt><dd><code>{caseDetail.github.headSha ?? "Not recorded"}</code></dd></div>
                <div><dt>Base</dt><dd><code>{run?.baseSha ?? "Not recorded"}</code></dd></div>
                <div><dt>Analysis</dt><dd>{run ? humanLabel(run.analysisSource) : "Historical detail unavailable"}</dd></div>
                <div><dt>Reproducibility</dt><dd>{run ? humanLabel(run.reproducibility) : "Unavailable"}</dd></div>
                <div><dt>Completed</dt><dd>{formatDate(run?.completedAt ?? run?.createdAt)}</dd></div>
                <div><dt>Source</dt><dd>{run ? humanLabel(run.sourceType) : humanLabel(resolution.source)}</dd></div>
              </dl>
              {run?.reproducibilityLimitation && <p className={styles.limitation}>{run.reproducibilityLimitation}</p>}
            </header>

            <div className={styles.caseLayout}>
              <nav className={styles.outline} aria-label="Case File sections">
                <span>CASE RECORD</span>
                {SECTION_LINKS.map((item, index) => (
                  <a href={`#case-${item.id}`} aria-current={activeSection === item.id ? "location" : undefined} onClick={() => setActiveSection(item.id)} key={item.id}>
                    <code>{String(index + 1).padStart(2, "0")}</code>
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className={styles.record} role="region" aria-label="Case File record">
                <section className={styles.section} id="case-map" aria-labelledby="map-heading">
                  <div className={styles.sectionHeading}>
                    <div><span>RELATIONSHIP ORIENTATION</span><h2 id="map-heading">Review Map</h2></div>
                    <p>Read-only · current run <code>{shortId(run?.runId)}</code> · head <code>{shortId(caseDetail.github.headSha)}</code></p>
                  </div>
                  <p className={styles.mapBoundary}>Stage order is orientation only. The active relationship records below are the only asserted edges; no link is inferred from visual proximity.</p>
                  <div className={styles.mapScroller} tabIndex={0} aria-label="Review Map stages; horizontally scrollable">
                    <ol className={styles.mapStages}>
                      {mapStages.map((stage, index) => (
                        <li key={stage.label} data-state={stage.state}>
                          <header><code>{String(index + 1).padStart(2, "0")}</code><strong>{stage.label}</strong><span>{stage.stateLabel}</span></header>
                          <div>
                            {stage.nodes.map((node) => (
                              <button type="button" aria-pressed={selectedNode?.key === node.key} onClick={() => selectNode(node)} key={node.key}>
                                <strong>{node.label}</strong>
                                <span>{node.detail}</span>
                                <small>{node.provenance === "stored" ? "Stored record" : "Derived · not persisted"}</small>
                              </button>
                            ))}
                            {!stage.nodes.length && <p>{stage.stateLabel}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {selectedNode ? (
                    <div className={styles.mapSelection}>
                      <header>
                        <div><span>ACTIVE NODE · {humanLabel(selectedNode.kind)}</span><h3>{selectedNode.label}</h3><p>{selectedNode.detail}</p></div>
                        <button type="button" onClick={() => selectNode(selectedNode)}>Open record</button>
                      </header>
                      <div className={styles.mobileMapControls}>
                        <button type="button" disabled={selectedIndex <= 0} onClick={() => selectedIndex > 0 && selectNode(mapNodes[selectedIndex - 1])}>Previous</button>
                        <span>{Math.max(1, selectedIndex + 1)} / {mapNodes.length}</span>
                        <button type="button" disabled={selectedIndex < 0 || selectedIndex >= mapNodes.length - 1} onClick={() => selectedIndex >= 0 && selectedIndex < mapNodes.length - 1 && selectNode(mapNodes[selectedIndex + 1])}>Next</button>
                      </div>
                      <ul className={styles.relationships} aria-label={`Relationships for ${selectedNode.label}`}>
                        {relationships.map((relationship) => (
                          <li key={relationship.key} data-state={relationship.state}>
                            <div><span>{relationship.label}</span><StatusPill tone={relationship.state === "unavailable" || relationship.state === "unresolved" ? "warning" : "neutral"}>{relationship.state === "stored" ? "Stored relationship" : relationship.state === "derived" ? "Deterministic derived" : humanLabel(relationship.state)}</StatusPill></div>
                            <p>{relationship.detail}</p>
                            {relationship.targets.length > 0 && <div>{relationship.targets.map((target) => <button type="button" onClick={() => selectRelated(target)} key={`${target.kind}:${target.id}`}>{target.label}<small>{target.detail}</small></button>)}</div>}
                          </li>
                        ))}
                        {!relationships.length && <li data-state="none"><p>No relationship source is available for this record.</p></li>}
                      </ul>
                    </div>
                  ) : <EmptyRecord>No canonical records are available for Review Map orientation.</EmptyRecord>}
                  {caseDetail.changedFiles.length + caseDetail.findings.length + caseDetail.evidence.length + caseDetail.requirements.length > mapNodes.length && <p className={styles.boundedNote}>Map orientation is bounded. Full records remain available in the sections below.</p>}
                </section>

                <section className={styles.section} id="case-findings" aria-labelledby="findings-heading">
                  <div className={styles.sectionHeading}><div><span>WHY</span><h2 id="findings-heading">Findings</h2></div><p>{caseDetail.findings.length} recorded for the current projected case</p></div>
                  {caseDetail.findings.length ? <ul className={styles.recordList}>{caseDetail.findings.map((finding) => {
                    const node: MapNode = { key: `finding:${finding.findingId}`, kind: "finding", id: finding.findingId, label: finding.title, detail: finding.severity, section: "findings", provenance: "stored" };
                    return <li key={finding.findingId}><button type="button" aria-pressed={selectedNode?.key === node.key} onClick={() => setActiveNode(node)}><div><StatusPill tone={finding.severity === "CRITICAL" || finding.severity === "HIGH" ? "danger" : "warning"}>{finding.severity}</StatusPill><StatusPill>{finding.category}</StatusPill><StatusPill tone={finding.provenance === "Model assisted" ? "provenance" : "neutral"}>{finding.provenance}</StatusPill></div><h3>{finding.title}</h3><p>{finding.statement}</p><dl><div><dt>Source</dt><dd>{finding.file}</dd></div><div><dt>Applicability</dt><dd>Current projected case · {caseDetail.github.headSha ? `head ${shortId(caseDetail.github.headSha)}` : "head not recorded"}</dd></div><div><dt>Related evidence</dt><dd>{relationSummary(finding.supportingEvidence)}</dd></div><div><dt>Related requirements</dt><dd>{relationSummary(finding.relatedRequirements)}</dd></div></dl><small>Action: {finding.action}</small></button></li>;
                  })}</ul> : <EmptyRecord>No findings were recorded for this run. This does not assert no risk.</EmptyRecord>}
                </section>

                <section className={styles.section} id="case-evidence" aria-labelledby="evidence-heading">
                  <div className={styles.sectionHeading}><div><span>PROOF</span><h2 id="evidence-heading">Evidence and missing proof</h2></div><p>{caseDetail.evidence.length} evidence records · {missingEvidence.length} missing or unverified</p></div>
                  {missingEvidence.length > 0 && <div className={styles.missingProof}>
                    <h3>Derived missing proof</h3>
                    <p>These presentation records are derived from canonical evidence status. No missing-proof schema is persisted.</p>
                    <ul>{missingEvidence.map((item) => {
                      const node: MapNode = { key: `missing-proof:${item.evidenceId}`, kind: "missing-proof", id: `missing-proof-${item.evidenceId}`, sourceId: item.evidenceId, label: item.statement, detail: item.status, section: "evidence", provenance: "derived" };
                      return <li key={item.evidenceId}><button type="button" aria-pressed={selectedNode?.key === node.key} onClick={() => setActiveNode(node)}><StatusPill tone="warning">Derived · {item.status}</StatusPill><strong>{item.statement}</strong><span>Source evidence <code>{shortId(item.evidenceId)}</code> · {item.provenance}</span></button></li>;
                    })}</ul>
                  </div>}
                  {caseDetail.evidence.length ? <ul className={styles.recordList}>{caseDetail.evidence.map((evidence) => {
                    const node: MapNode = { key: `evidence:${evidence.evidenceId}`, kind: "evidence", id: evidence.evidenceId, label: evidence.title, detail: evidence.status, section: "evidence", provenance: "stored" };
                    return <li key={evidence.evidenceId}><button type="button" aria-pressed={selectedNode?.key === node.key} onClick={() => setActiveNode(node)}><div><StatusPill tone={evidence.status === "missing" || evidence.status === "unverified" || evidence.stale ? "warning" : "neutral"}>{evidence.status}</StatusPill><StatusPill tone={evidence.evidenceClass === "model-inferred" ? "provenance" : "neutral"}>{humanLabel(evidence.evidenceClass)}</StatusPill>{evidence.stale && <StatusPill tone="warning">Stale</StatusPill>}</div><h3>{evidence.title}</h3><p>{evidence.statement}</p><dl><div><dt>Source</dt><dd>{evidence.source}</dd></div><div><dt>Provenance</dt><dd>{evidence.provenance}</dd></div><div><dt>Observed</dt><dd>{formatDate(evidence.observedAt)}</dd></div><div><dt>Applicability</dt><dd>{evidence.stale ? "Stale" : caseDetail.github.headSha ? `Current head ${shortId(caseDetail.github.headSha)}` : "Head applicability unavailable"}</dd></div></dl></button></li>;
                  })}</ul> : <EmptyRecord>No evidence records are available. This is distinct from an asserted missing-proof record.</EmptyRecord>}
                </section>

                <section className={styles.section} id="case-requirements" aria-labelledby="requirements-heading">
                  <div className={styles.sectionHeading}><div><span>REQUIRED PROOF</span><h2 id="requirements-heading">Requirements</h2></div><p>Read-oriented · mutations remain in Workspace</p></div>
                  {caseDetail.requirements.length ? <ul className={styles.recordList}>{caseDetail.requirements.map((requirement) => {
                    const node: MapNode = { key: `requirement:${requirement.requirementId}`, kind: "requirement", id: requirement.requirementId, label: requirement.title, detail: requirement.status, section: "requirements", provenance: "stored" };
                    const capability = requirement.conditionProgress.kind === "available"
                      ? `Exact canonical Condition · ${requirement.conditionProgress.cleared ? "cleared" : "open"} · persisted clear/reopen belongs in Workspace`
                      : requirement.conditionProgress.kind === "read-only"
                        ? requirement.conditionProgress.reason
                        : "Read-only sample requirement";
                    const requirementTone = requirement.status === "satisfied" ? "success" : requirement.status === "open" || requirement.status === "stale" || requirement.status === "unavailable" || requirement.status === "accepted" ? "warning" : "neutral";
                    return <li key={requirement.requirementId}><button type="button" aria-pressed={selectedNode?.key === node.key} onClick={() => setActiveNode(node)}><div><StatusPill tone={requirement.importance === "blocking" ? "danger" : "neutral"}>{requirement.importance}</StatusPill><StatusPill tone={requirementTone}>{requirement.status}</StatusPill>{requirement.stale && <StatusPill tone="warning">Stale</StatusPill>}</div><h3>{requirement.title}</h3><p>{requirement.statement}</p><dl><div><dt>Required proof</dt><dd>{requirement.evidenceRequired}</dd></div><div><dt>Related evidence</dt><dd>{relationSummary(requirement.supportingEvidence)}</dd></div><div><dt>Source relation</dt><dd>{relationSummary(requirement.relatedFindings)}</dd></div><div><dt>Applicability</dt><dd>{requirement.stale ? "Stale" : caseDetail.github.headSha ? `Current head ${shortId(caseDetail.github.headSha)}` : "Head not recorded"}</dd></div></dl><small>{capability}. Task progress is not proof; accepted risk belongs only to Human Decision.</small></button></li>;
                  })}</ul> : <EmptyRecord>No requirements were recorded for this run. This does not assert merge readiness.</EmptyRecord>}
                </section>

                <section className={styles.section} id="case-context" aria-labelledby="context-heading">
                  <div className={styles.sectionHeading}><div><span>AFFECTED CONTEXT</span><h2 id="context-heading">Changed files and review context</h2></div><p>{caseDetail.changedFiles.length} stored changed-file records</p></div>
                  <p className={styles.contextSummary}>{caseDetail.context.summary}</p>
                  {caseDetail.changedFiles.length ? <ul className={styles.fileList}>{caseDetail.changedFiles.map((file) => {
                    const node: MapNode = { key: `change:${file.artifactId}`, kind: "change", id: file.artifactId, label: file.path, detail: "Affected file", section: "context", provenance: "stored" };
                    return <li key={file.artifactId}><button type="button" aria-pressed={selectedNode?.key === node.key} onClick={() => setActiveNode(node)}><code>{file.path}</code><span>{file.risk ? `${file.risk} recorded risk` : "Risk not recorded"}</span><small>{file.additions === null ? "+?" : `+${file.additions}`} / {file.deletions === null ? "−?" : `−${file.deletions}`} · {file.focusedRegions.length ? `${file.focusedRegions.length} exact line anchor${file.focusedRegions.length === 1 ? "" : "s"}` : "File-only context; raw diff unavailable"}</small></button></li>;
                  })}</ul> : <EmptyRecord>No changed-file records are available for this review.</EmptyRecord>}
                  {caseDetail.context.reviewerFocus.length > 0 && <div className={styles.contextList}><h3>Reviewer focus recorded</h3><ul>{caseDetail.context.reviewerFocus.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                  {caseDetail.context.limitations.length > 0 && <div className={styles.contextList}><h3>Context limitations</h3><ul>{caseDetail.context.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                </section>

                <section className={styles.section} id="case-history" aria-labelledby="history-heading">
                  <div className={styles.sectionHeading}><div><span>RUN HISTORY</span><h2 id="history-heading">Readiness movement</h2></div><p>Current run remains fixed</p></div>
                  {history?.status === "comparison" ? <>
                    <div className={styles.runPair}>
                      <article><span>Previous compatible run</span><code>{shortId(history.previous.runId)}</code><strong>{history.readiness.previousScore}</strong><small>{RECOMMENDATION_LABEL[history.readiness.previousRecommendation]}</small><p>{shortId(history.previous.headSha)}</p></article>
                      <i aria-hidden="true">→</i>
                      <article><span>Current run</span><code>{shortId(history.current.runId)}</code><strong>{history.readiness.currentScore}</strong><small>{RECOMMENDATION_LABEL[history.readiness.currentRecommendation]}</small><p>{shortId(history.current.headSha)}</p></article>
                    </div>
                    <p className={styles.movement}><StatusPill tone={history.readiness.classification === "regressed" ? "danger" : history.readiness.classification === "improved" ? "success" : "neutral"}>{humanLabel(history.readiness.classification)}</StatusPill>{history.readiness.note}</p>
                    {history.limitation && <p className={styles.limitation}>{history.limitation}</p>}
                    {history.changes.length ? <ul className={styles.changeList}>{history.changes.slice(0, 36).map((change) => <li key={change.key}><StatusPill tone={change.status === "reopened" || change.status === "added" ? "warning" : change.status === "cleared" ? "success" : "neutral"}>{change.status}</StatusPill><div><strong>{change.title}</strong><span>{change.category}</span></div><p>{change.previousState ?? "Not present"} → {change.currentState ?? "Not present"}</p></li>)}</ul> : <EmptyRecord>No inspectable record changes were produced for this comparison.</EmptyRecord>}
                    {history.comparisons && history.comparisons.length > 1 && <details className={styles.historyDetails}><summary>{history.comparisons.length - 1} other compatible comparison target{history.comparisons.length === 2 ? "" : "s"}</summary><ul>{history.comparisons.slice(1, 9).map((comparison) => <li key={comparison.target.runId}><code>{shortId(comparison.target.runId)}</code><span>{humanLabel(comparison.readiness.classification)} · {comparison.changes.length} changed records</span></li>)}</ul></details>}
                  </> : history?.status === "initial" ? <div className={styles.initialRun}><StatusPill>Initial run</StatusPill><strong>{shortId(history.current.runId)}</strong><p>{history.reason}</p></div> : <EmptyRecord>{history?.reason ?? "No usable run comparison is available. Current Case File facts remain intact."}</EmptyRecord>}
                </section>

                <section className={styles.section} id="case-decisions" aria-labelledby="decisions-heading">
                  <div className={styles.sectionHeading}><div><span>ACCOUNTABLE HISTORY</span><h2 id="decisions-heading">Human Decisions</h2></div><p>Separate from Lintel recommendation</p></div>
                  {decision.status === "recorded" ? <>
                    <article className={styles.currentDecision}>
                      <div><StatusPill tone={decision.applicability === "applicable" ? "success" : "warning"}>{APPLICABILITY_LABEL[decision.applicability]}</StatusPill><span>Current effective Human Decision</span></div>
                      <h3>{OUTCOME_LABEL[decision.outcome]}</h3>
                      <p>{decision.rationale ?? "No rationale was stored for this historical decision."}</p>
                      <dl><div><dt>Actor</dt><dd>{decision.actor.displayLabel}</dd></div><div><dt>Recorded</dt><dd>{formatDate(decision.recordedAt)}</dd></div><div><dt>Applicable head</dt><dd><code>{decision.applicableHeadSha ?? "Unbound"}</code></dd></div><div><dt>Current head</dt><dd><code>{decision.currentHeadSha ?? "Not recorded"}</code></dd></div></dl>
                      {decision.acceptedRiskReferences.length > 0 && <div><strong>Accepted-risk references</strong><ul>{decision.acceptedRiskReferences.map((reference) => <li key={reference.id}>{reference.label} · {reference.available ? "available" : "unresolved"}{reference.stale ? " · stale" : ""}</li>)}</ul></div>}
                    </article>
                    {decision.history?.length ? <ol className={styles.decisionHistory}>{decision.history.slice(0, 40).map((entry: DecisionLedgerEventView) => <li key={entry.entryId}><div><StatusPill tone={entry.role === "effective" ? "success" : entry.role === "withdrawn" || entry.role === "superseded" ? "warning" : "neutral"}>{entry.role}</StatusPill><strong>{entry.outcome ? OUTCOME_LABEL[entry.outcome] : humanLabel(entry.eventType)}</strong></div><p>{entry.rationale ?? "No rationale stored"}</p><dl><div><dt>Recorded</dt><dd>{formatDate(entry.recordedAt)}</dd></div><div><dt>Actor</dt><dd>{entry.actor.displayLabel}</dd></div><div><dt>Head</dt><dd><code>{entry.applicableHeadSha ?? "Unbound"}</code></dd></div><div><dt>Event</dt><dd>{humanLabel(entry.eventType)}</dd></div></dl></li>)}</ol> : <EmptyRecord>Historical decision detail is not available beyond the effective record.</EmptyRecord>}
                  </> : decision.status === "empty" ? <EmptyRecord>No Human Decision has been recorded. Lintel’s recommendation is not a Human Decision.</EmptyRecord> : <EmptyRecord>Human Decision history is unavailable: {decision.readError}</EmptyRecord>}
                </section>

                <section className={styles.section} id="case-export" aria-labelledby="export-heading">
                  <div className={styles.sectionHeading}><div><span>LOCAL CAPABILITY</span><h2 id="export-heading">Export and handoff</h2></div><p>No action below silently performs an external write</p></div>
                  <ul className={styles.capabilities}>
                    <li><div><strong>Case File text export</strong><StatusPill tone="success">Available</StatusPill></div><p>Contains identity, run/head, current recommendation, findings, evidence, requirements and the current Human Decision state. Raw diff is excluded.</p><dl><div><dt>Boundary</dt><dd>Local copy or download</dd></div><div><dt>External write</dt><dd>None</dd></div><div><dt>Human Decision</dt><dd>Included</dd></div><div><dt>Head applicability</dt><dd>{decision.status === "recorded" ? APPLICABILITY_LABEL[decision.applicability] : "No decision recorded"}</dd></div></dl><div><button type="button" onClick={copyCaseFile}>{copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy Case File"}</button><button type="button" onClick={downloadCaseFile}>{downloadState === "downloaded" ? "Downloaded" : downloadState === "failed" ? "Download failed" : "Download .txt"}</button></div></li>
                    <li><div><strong>GitHub App</strong><StatusPill tone={githubAppState === "connected" ? "success" : githubAppState === "unavailable" ? "warning" : "neutral"}>{humanLabel(githubAppState)}</StatusPill></div><p>{githubAppDetail}</p><dl><div><dt>Boundary</dt><dd>Environment-gated capability status only</dd></div><div><dt>External write</dt><dd>None from Case File</dd></div><div><dt>Human Decision</dt><dd>Not published</dd></div><div><dt>Head applicability</dt><dd>{caseDetail.github.headSha ? `Current recorded head ${shortId(caseDetail.github.headSha)}` : "Unavailable"}</dd></div></dl></li>
                    <li><div><strong>GitHub Action</strong><StatusPill>Blueprint</StatusPill></div><p>Architecture and copyable setup material only. It does not install, execute, connect, analyse, comment or post.</p><dl><div><dt>Boundary</dt><dd>Blueprint document</dd></div><div><dt>External write</dt><dd>None</dd></div><div><dt>Human Decision</dt><dd>Not included as a publication</dd></div><div><dt>Head applicability</dt><dd>Not an execution record</dd></div></dl><a href="/github-action">Open Blueprint</a></li>
                    <li><div><strong>Slack handoff</strong><StatusPill>Export-only</StatusPill></div><p>The existing route supplies fixed local export examples. It does not ingest this Case File, connect to Slack or send a message.</p><dl><div><dt>Boundary</dt><dd>Local copy/export</dd></div><div><dt>External write</dt><dd>None</dd></div><div><dt>Human Decision</dt><dd>Case File export above includes it; fixed Slack examples may not</dd></div><div><dt>Head applicability</dt><dd>Confirm in copied content</dd></div></dl><a href="/slack-handoff">Open Export-only route</a></li>
                  </ul>
                </section>

                <footer className={styles.workspaceFooter}>
                  <div><span>ACTIVE INVESTIGATION</span><strong>{reportId ? "Continue this exact review in Verification Workspace" : "No exact durable Workspace target"}</strong><p>Workspace owns evidence traversal, requirement operations, readiness assessment and Human Decision recording. Case File remains read-oriented.</p></div>
                  {reportId && <a className={styles.primaryLink} href={workspaceHref}>Open in Workspace</a>}
                </footer>
              </div>
            </div>
          </div>
        );
      })()}
    </AppShell>
  );
}
