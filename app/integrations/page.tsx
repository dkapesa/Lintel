"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../app-shell";
import styles from "../r4f4-administration.module.css";

type CapabilityState =
  | "Connected"
  | "Configured"
  | "Available"
  | "Not configured"
  | "Blueprint"
  | "Export-only"
  | "Unavailable"
  | "Checking";

type CapabilityGroup = "configured" | "available" | "handoff" | "attention" | "checking";
type FilterId = "all" | "configured" | "available" | "handoff" | "attention";

type CapabilityRecord = {
  id: string;
  name: string;
  category: string;
  state: CapabilityState;
  purpose: string;
  configuration: string;
  readBoundary: string;
  writeBoundary: string;
  credentialBoundary: string;
  scope: string;
  execution: string;
  humanDecisionBoundary: string;
  environmentStatus: string;
  nextAction: string;
  limitation: string;
  actionHref?: string;
  actionLabel?: string;
};

type EndpointResult = {
  ok: boolean;
  value?: Record<string, unknown>;
};

type CapabilityStatus = "checking" | "current" | "partial" | "unavailable";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "configured", label: "Connected / configured" },
  { id: "available", label: "Available" },
  { id: "handoff", label: "Blueprint / Export-only" },
  { id: "attention", label: "Not configured / unavailable" },
];

const STATIC_RECORDS: CapabilityRecord[] = [
  {
    id: "public-github-import",
    name: "Public GitHub pull-request import",
    category: "Source import",
    state: "Available",
    purpose: "Read one public pull request and its diff into New Review after an explicit URL submission.",
    configuration: "No stored connection is required for a public repository.",
    readBoundary: "GitHub pull-request metadata and diff are fetched on demand through the server route.",
    writeBoundary: "None. Lintel does not comment, label, merge or change the repository.",
    credentialBoundary: "No GitHub credential is stored by this capability.",
    scope: "This review",
    execution: "Available now from New Review. There is no background ingestion or synchronisation.",
    humanDecisionBoundary: "A Human Decision remains a separate browser-local record and is not published to GitHub.",
    environmentStatus: "Implemented without a configured workspace connection for public repositories.",
    nextAction: "Open New Review and choose the public GitHub pull-request source.",
    limitation: "Private repositories require the separately configured GitHub workspace capability.",
    actionHref: "/new",
    actionLabel: "Open New Review",
  },
  {
    id: "deterministic-analysis",
    name: "Deterministic local analysis",
    category: "Analysis execution",
    state: "Available",
    purpose: "Create the authoritative baseline from submitted review input without a model-provider call.",
    configuration: "No provider configuration is required.",
    readBoundary: "Reads only the review input explicitly supplied to the current analysis request.",
    writeBoundary: "Writes no external system. A successful canonical result can be retained in browser-local history.",
    credentialBoundary: "No external credential is used.",
    scope: "This review",
    execution: "Available now and retained as the fallback when model assistance is unavailable or fails.",
    humanDecisionBoundary: "The baseline produces a Lintel recommendation, never the accountable Human Decision.",
    environmentStatus: "Implemented in the current application.",
    nextAction: "Start a review and keep Deterministic-only selected.",
    limitation: "It does not claim repository enforcement, monitoring or external delivery.",
    actionHref: "/new",
    actionLabel: "Start deterministic review",
  },
  {
    id: "case-file-export",
    name: "Local Case File copy and download",
    category: "Local export",
    state: "Available",
    purpose: "Copy or download the selected Case File as a structured local text artifact.",
    configuration: "Requires a resolvable Case File; no external integration configuration is required.",
    readBoundary: "Reads one resolved Case File from the current session or bounded browser-local history.",
    writeBoundary: "Clipboard or downloaded file only. No external service receives the artifact.",
    credentialBoundary: "No credential is used.",
    scope: "This review",
    execution: "Available now when the Case File resolves.",
    humanDecisionBoundary: "The export includes the recorded Human Decision label when available, without publishing it.",
    environmentStatus: "Implemented in the Case File route.",
    nextAction: "Open a Case File and use its Export & handoff section.",
    limitation: "Raw diff content is excluded. The export is not a backup schema and does not update another system.",
    actionHref: "/report",
    actionLabel: "Open Case File",
  },
  {
    id: "github-action",
    name: "GitHub Action",
    category: "CI handoff",
    state: "Blueprint",
    purpose: "Document a possible CLI-first CI workflow and merge-readiness comment contract.",
    configuration: "No Action is installed or configured by Lintel.",
    readBoundary: "None from this route. The Blueprint does not fetch repository content.",
    writeBoundary: "None. It does not install, execute, comment or post.",
    credentialBoundary: "The Blueprint page stores no credentials and has no repository access.",
    scope: "Future repository workflow",
    execution: "Documentation and copyable setup material only.",
    humanDecisionBoundary: "The proposed automated comment remains distinct from accountable Human Decision authority.",
    environmentStatus: "Non-executing Blueprint.",
    nextAction: "Inspect the setup architecture and illustrative YAML.",
    limitation: "A Blueprint is not an available or connected Action.",
    actionHref: "/github-action",
    actionLabel: "Open Blueprint",
  },
  {
    id: "slack-handoff",
    name: "Slack handoff",
    category: "Communication export",
    state: "Export-only",
    purpose: "Prepare a concise merge-readiness handoff and copy it through local browser behaviour.",
    configuration: "No Slack OAuth, workspace, channel or sender connection exists.",
    readBoundary: "Reads only the selected local handoff variant.",
    writeBoundary: "Clipboard only. Lintel does not call Slack or deliver a message.",
    credentialBoundary: "No Slack credential is requested, stored or exposed.",
    scope: "This local export",
    execution: "Copy is available now; external delivery is unavailable.",
    humanDecisionBoundary: "Exported text may describe a decision, but copying it is not publication or acknowledgement.",
    environmentStatus: "Export-only route implemented.",
    nextAction: "Open the export route, inspect the content and copy it locally.",
    limitation: "No OAuth, delivery, scheduling, connection status or background sync is implemented.",
    actionHref: "/slack-handoff",
    actionLabel: "Open Slack export",
  },
];

const CHECKING_RECORDS: CapabilityRecord[] = [
  {
    id: "github-app",
    name: "GitHub App",
    category: "Repository automation",
    state: "Checking",
    purpose: "Environment-gated GitHub App authentication, webhook ingestion and automated analysis records.",
    configuration: "Server-side GitHub App configuration is required.",
    readBoundary: "Status is withheld while the current environment is checked.",
    writeBoundary: "No write capability is claimed while status is unresolved.",
    credentialBoundary: "Credentials remain server-side and are never returned to this page.",
    scope: "Current environment",
    execution: "Checking server capability status once for this route load.",
    humanDecisionBoundary: "Automated analysis never substitutes for an accountable Human Decision.",
    environmentStatus: "Checking configuration and authentication.",
    nextAction: "Wait for the bounded status check.",
    limitation: "No stale status is shown as current.",
  },
  {
    id: "github-workspace",
    name: "Connected GitHub workspace",
    category: "Authenticated source import",
    state: "Checking",
    purpose: "Read accessible repositories, open pull requests and a selected diff through a server-side token.",
    configuration: "A server-side GitHub token is required.",
    readBoundary: "Status is withheld while the current environment is checked.",
    writeBoundary: "This capability has no external write path.",
    credentialBoundary: "The token remains server-side and is not returned to this page.",
    scope: "Current environment",
    execution: "Checking the authenticated GitHub read path once for this route load.",
    humanDecisionBoundary: "Human Decision remains browser-local and is not published through this token path.",
    environmentStatus: "Checking connection.",
    nextAction: "Wait for the bounded status check.",
    limitation: "No connection claim is made until GitHub authentication succeeds.",
  },
  {
    id: "model-assisted-analysis",
    name: "Model-assisted analysis",
    category: "Analysis execution",
    state: "Checking",
    purpose: "Enrich deterministic wording and prioritisation after the baseline completes.",
    configuration: "A provider key and model label must be configured server-side.",
    readBoundary: "Status is withheld while the current environment is checked.",
    writeBoundary: "No repository or collaboration-system write is performed.",
    credentialBoundary: "Provider credentials remain server-side and are never returned to this page.",
    scope: "Current environment",
    execution: "Checking provider availability once for this route load.",
    humanDecisionBoundary: "Provider synthesis remains advisory and cannot record Human Decision.",
    environmentStatus: "Checking provider configuration.",
    nextAction: "Wait for the bounded status check.",
    limitation: "Deterministic analysis remains available independently.",
  },
];

const GROUP_COPY: Record<CapabilityGroup, { title: string; detail: string }> = {
  configured: {
    title: "Configured or connected capabilities",
    detail: "Rendered only when current environment status verifies a genuine configured or authenticated path.",
  },
  available: {
    title: "Available capabilities",
    detail: "Usable now without implying a stored third-party connection.",
  },
  handoff: {
    title: "Blueprint and Export-only",
    detail: "Non-executing architecture or local-copy handoff with no external delivery claim.",
  },
  attention: {
    title: "Not configured or unavailable",
    detail: "Configuration attention and current failure are named separately with no positive state treatment.",
  },
  checking: {
    title: "Checking current environment",
    detail: "Status-dependent facts remain withheld until the one-time checks resolve.",
  },
};

function groupFor(record: CapabilityRecord): CapabilityGroup {
  if (record.state === "Connected" || record.state === "Configured") return "configured";
  if (record.state === "Available") return "available";
  if (record.state === "Blueprint" || record.state === "Export-only") return "handoff";
  if (record.state === "Checking") return "checking";
  return "attention";
}

function stateToken(state: CapabilityState) {
  return state.toLowerCase().replace(/\s+/g, "-");
}

function matchesFilter(record: CapabilityRecord, filter: FilterId) {
  if (filter === "all") return true;
  return groupFor(record) === filter;
}

function matchesPresentation(record: CapabilityRecord, filter: FilterId, query: string) {
  if (!matchesFilter(record, filter)) return false;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    record.name,
    record.category,
    record.state,
    record.purpose,
    record.scope,
    record.environmentStatus,
  ].some((value) => value.toLowerCase().includes(normalized));
}

async function readEndpoint(url: string, signal: AbortSignal): Promise<EndpointResult> {
  try {
    const response = await fetch(url, { cache: "no-store", signal });
    if (!response.ok) return { ok: false };
    const value: unknown = await response.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? { ok: true, value: value as Record<string, unknown> }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}

function environmentRecords(
  githubApp: EndpointResult,
  githubWorkspace: EndpointResult,
  analysis: EndpointResult,
): CapabilityRecord[] {
  const appConfigured = githubApp.value?.configured === true;
  const appAuthenticated = githubApp.value?.authenticated === true;
  const githubConnected = githubWorkspace.value?.connected === true;
  const model = analysis.value?.modelAssisted;
  const modelRecord = model && typeof model === "object" && !Array.isArray(model)
    ? model as Record<string, unknown>
    : null;
  const providerConfigured = modelRecord?.state === "configured";
  const provider = typeof modelRecord?.provider === "string" ? modelRecord.provider : "openai";
  const modelLabel = typeof modelRecord?.model === "string" ? modelRecord.model : null;

  const githubAppState: CapabilityState = !githubApp.ok
    ? "Unavailable"
    : !appConfigured
      ? "Not configured"
      : appAuthenticated
        ? "Configured"
        : "Unavailable";

  const githubWorkspaceState: CapabilityState = !githubWorkspace.ok
    ? "Unavailable"
    : githubConnected
      ? "Connected"
      : "Not configured";

  const providerState: CapabilityState = !analysis.ok
    ? "Unavailable"
    : providerConfigured
      ? "Configured"
      : "Not configured";

  return [
    {
      id: "github-app",
      name: "GitHub App",
      category: "Repository automation",
      state: githubAppState,
      purpose: "Authenticate the environment-gated GitHub App, receive verified webhooks and retain automated analysis records.",
      configuration: appConfigured
        ? "Server-side App identifiers and private key configuration are present."
        : "Server-side GitHub App identifiers, private key and webhook secret are required.",
      readBoundary: appAuthenticated
        ? "The server can authenticate the configured App and read installation-scoped GitHub data when an installation record exists."
        : "No authenticated GitHub App read is claimed in the current state.",
      writeBoundary: "The status surface writes nothing externally. Existing repository enablement and automated analysis remain separately guarded server operations.",
      credentialBoundary: "App credentials and webhook secret remain server-side. This page receives only configured/authenticated truth.",
      scope: "Current environment",
      execution: appAuthenticated
        ? "App authentication is available; installation and repository records remain separate implementation facts."
        : "Automated App execution is unavailable from this state.",
      humanDecisionBoundary: "GitHub App analysis does not publish or replace the accountable Human Decision.",
      environmentStatus: !githubApp.ok
        ? "The GitHub App status endpoint could not be resolved."
        : appAuthenticated
          ? "Configuration authenticated successfully. Connected installations are not inferred from authentication alone."
          : appConfigured
            ? "Configuration exists, but authentication is unavailable."
            : "No GitHub App configuration is present.",
      nextAction: appAuthenticated
        ? "Inspect exact GitHub App records only where an installation-scoped workflow already exposes them."
        : appConfigured
          ? "Correct the server-side App configuration, then retry status."
          : "Configure the GitHub App outside the browser using the existing local setup contract.",
      limitation: "This route does not install the App, expose secrets, fabricate installation health or claim background synchronisation.",
    },
    {
      id: "github-workspace",
      name: "Connected GitHub workspace",
      category: "Authenticated source import",
      state: githubWorkspaceState,
      purpose: "Read accessible repositories, open pull requests and a selected diff through a server-side GitHub token.",
      configuration: githubConnected
        ? "A server-side token was authenticated by the current status check."
        : "A valid server-side GitHub token is required.",
      readBoundary: githubConnected
        ? "On explicit user action, the server may list accessible repositories and pull requests or fetch one selected diff."
        : "No authenticated GitHub read is available in the current state.",
      writeBoundary: "None. The connected workspace route does not comment, label, merge or modify GitHub.",
      credentialBoundary: "The token remains server-side. Browser code receives bounded repository and pull-request records, never the credential.",
      scope: "Current environment",
      execution: githubConnected
        ? "Authenticated repository and pull-request selection is available from New Review."
        : "Authenticated source selection is unavailable; public import remains separate.",
      humanDecisionBoundary: "Human Decision remains browser-local and is not published through this read-only token path.",
      environmentStatus: !githubWorkspace.ok
        ? "The connected GitHub status check was unavailable."
        : githubConnected
          ? "GitHub authenticated the configured token for this environment."
          : "No connected GitHub workspace is configured.",
      nextAction: githubConnected
        ? "Open New Review and select the connected GitHub source."
        : "Configure a server-side token outside the browser, or use public GitHub import.",
      limitation: "No monitoring, sync cadence, installation owner, repository count or health telemetry is inferred.",
      actionHref: githubConnected ? "/new" : undefined,
      actionLabel: githubConnected ? "Start connected review" : undefined,
    },
    {
      id: "model-assisted-analysis",
      name: "Model-assisted analysis",
      category: "Analysis execution",
      state: providerState,
      purpose: "Enrich deterministic wording and prioritisation after the authoritative baseline completes.",
      configuration: providerConfigured
        ? `Server-side ${provider}${modelLabel ? ` / ${modelLabel}` : ""} configuration is present.`
        : "A provider key and model label must be configured server-side.",
      readBoundary: providerConfigured
        ? "The submitted diff may cross the configured model-provider boundary for the current analysis request."
        : "No provider request is available in the current state.",
      writeBoundary: "No repository or collaboration-system write is performed. Provider response storage is requested with store:false.",
      credentialBoundary: "Provider credentials remain server-side and are never returned to the browser.",
      scope: "Current environment",
      execution: providerConfigured
        ? "Model-assisted synthesis is selectable after deterministic analysis."
        : "Deterministic analysis remains available; model-assisted selection is withheld.",
      humanDecisionBoundary: "Provider synthesis may enrich a Lintel recommendation; it cannot choose or record Human Decision.",
      environmentStatus: !analysis.ok
        ? "Provider status could not be resolved; no stale configured state is retained."
        : providerConfigured
          ? `${provider}${modelLabel ? ` / ${modelLabel}` : ""} is configured for this server environment.`
          : "No model-assisted provider path is configured.",
      nextAction: providerConfigured
        ? "Open New Review and choose Baseline + model-assisted."
        : "Configure the existing server environment outside the browser; provider key entry is not available here.",
      limitation: "Provider failure retains a labelled deterministic fallback and never silently replaces evidence.",
      actionHref: providerConfigured ? "/new" : "/settings#provider-status",
      actionLabel: providerConfigured ? "Start assisted review" : "Inspect provider boundary",
    },
  ];
}

function StateBadge({ state }: { state: CapabilityState }) {
  return <span className={styles.stateBadge} data-state={stateToken(state)}>{state}</span>;
}

function CapabilityDetail({
  record,
  onBack,
}: {
  record: CapabilityRecord | null;
  onBack: () => void;
}) {
  if (!record) {
    return (
      <aside className={styles.detailPanel} aria-label="Capability detail">
        <div className={styles.emptyState}>
          <span className={styles.eyebrow}>Capability detail</span>
          <h2>Select a capability</h2>
          <p>Inspect its current state, configuration scope, data read and write boundaries, credential boundary and genuine next action.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.detailPanel} aria-label={`${record.name} capability detail`}>
      <button className={styles.mobileBack} type="button" onClick={onBack}>← Back to capabilities</button>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderTop}>
          <div>
            <span className={styles.recordCategory}>{record.category}</span>
            <h2>{record.name}</h2>
          </div>
          <StateBadge state={record.state} />
        </div>
        <p className={styles.detailPurpose}>{record.purpose}</p>
      </header>
      <dl className={styles.factList}>
        <div><dt>Configuration</dt><dd>{record.configuration}</dd></div>
        <div><dt>Data read</dt><dd>{record.readBoundary}</dd></div>
        <div><dt>External write</dt><dd>{record.writeBoundary}</dd></div>
        <div><dt>Credential</dt><dd>{record.credentialBoundary}</dd></div>
        <div><dt>Scope</dt><dd>{record.scope}</dd></div>
        <div><dt>Execution now</dt><dd>{record.execution}</dd></div>
        <div><dt>Human Decision</dt><dd>{record.humanDecisionBoundary}</dd></div>
        <div><dt>Environment</dt><dd>{record.environmentStatus}</dd></div>
        <div><dt>Next action</dt><dd>{record.nextAction}</dd></div>
      </dl>
      {record.actionHref && record.actionLabel && (
        <div className={styles.detailActions}>
          <Link className={styles.primaryAction} href={record.actionHref}>{record.actionLabel}</Link>
        </div>
      )}
      <p className={styles.detailNote}><strong>Current limitation:</strong> {record.limitation}</p>
    </aside>
  );
}

export default function IntegrationsPage() {
  const [records, setRecords] = useState<CapabilityRecord[]>([...CHECKING_RECORDS, ...STATIC_RECORDS]);
  const [status, setStatus] = useState<CapabilityStatus>("checking");
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setStatus("checking");
    setRecords([...CHECKING_RECORDS, ...STATIC_RECORDS]);

    Promise.all([
      readEndpoint("/api/github-app?view=status", controller.signal),
      readEndpoint("/api/github-workspace?action=status", controller.signal),
      readEndpoint("/api/generate-report", controller.signal),
    ]).then(([githubApp, githubWorkspace, analysis]) => {
      const resolved = [githubApp, githubWorkspace, analysis];
      const availableCount = resolved.filter((item) => item.ok).length;
      if (active) {
        setRecords([...environmentRecords(githubApp, githubWorkspace, analysis), ...STATIC_RECORDS]);
        setStatus(availableCount === 3 ? "current" : availableCount === 0 ? "unavailable" : "partial");
      }
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryKey]);

  const visibleRecords = useMemo(() => {
    return records.filter((record) => matchesPresentation(record, filter, query));
  }, [filter, query, records]);

  const selectedRecord = selectedId ? visibleRecords.find((record) => record.id === selectedId) ?? null : null;

  function applyPresentation(nextFilter: FilterId, nextQuery: string) {
    setFilter(nextFilter);
    setQuery(nextQuery);
    if (!selectedId) {
      setSelectionAnnouncement("");
      return;
    }
    const selected = records.find((record) => record.id === selectedId);
    if (selected && matchesPresentation(selected, nextFilter, nextQuery)) {
      setSelectionAnnouncement("");
      return;
    }
    setSelectedId(null);
    setSelectionAnnouncement("Selection cleared because the capability does not match the current search and filter.");
  }

  const groups: CapabilityGroup[] = ["configured", "available", "handoff", "attention", "checking"];
  const statusCopy = status === "checking"
    ? "Checking current environment"
    : status === "current"
      ? "Current bounded status"
      : status === "partial"
        ? "Partial current status"
        : "Status unavailable";

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <span className={styles.eyebrow}>Capability management</span>
            <h1>Integrations</h1>
            <p>Inspect what Lintel can read, execute, copy or hand off—and what remains unconfigured, non-executing or unavailable.</p>
          </header>

          <div className={styles.boundaryBanner}>
            <div>
              <strong>Current environment and browser-local boundary</strong>
              <p>Configuration checks are read once for this route load. Secrets stay server-side; no background synchronisation, monitoring or external write begins here.</p>
            </div>
            <span className={styles.boundaryState} data-state={status}>{statusCopy}</span>
          </div>

          {(status === "partial" || status === "unavailable") && (
            <div className={styles.errorNotice} role="status">
              {status === "partial"
                ? "Some environment-backed capability checks failed. Resolved records remain current; unresolved records are marked Unavailable."
                : "Environment-backed capability status could not be checked. Static available, Blueprint and Export-only records remain inspectable."}
              {" "}
              <button className={styles.secondaryAction} type="button" onClick={() => setRetryKey((value) => value + 1)}>Retry status</button>
            </div>
          )}

          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <span>Search capabilities</span>
              <input
                type="search"
                value={query}
                placeholder="Name, category, state or scope"
                onChange={(event) => {
                  applyPresentation(filter, event.target.value);
                }}
              />
            </label>
            <div className={styles.filterGroup} aria-label="Capability state filters">
              {FILTERS.map((item) => (
                <button
                  className={filter === item.id ? `${styles.filterButton} ${styles.filterButtonActive}` : styles.filterButton}
                  type="button"
                  aria-pressed={filter === item.id}
                  key={item.id}
                  onClick={() => {
                    applyPresentation(item.id, query);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.integrationLayout}${selectedRecord ? ` ${styles.hasSelection}` : ""}`}>
            <div className={styles.capabilityList}>
              {visibleRecords.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.eyebrow}>No matching capabilities</span>
                  <h2>No record matches this search and state filter</h2>
                  <p>Clear the local presentation controls to return to all real capability records. No capability state has been changed.</p>
                  <div className={styles.emptyActions}>
                    <button className={styles.secondaryAction} type="button" onClick={() => applyPresentation("all", "")}>Clear filters</button>
                  </div>
                </div>
              ) : (
                groups.map((group) => {
                  const items = visibleRecords.filter((record) => groupFor(record) === group);
                  if (!items.length) return null;
                  return (
                    <section className={styles.capabilityGroup} key={group} aria-labelledby={`capability-group-${group}`}>
                      <div className={styles.sectionHeader}>
                        <h2 id={`capability-group-${group}`}>{GROUP_COPY[group].title}</h2>
                        <p>{GROUP_COPY[group].detail}</p>
                      </div>
                      <ul className={styles.recordTable}>
                        {items.map((record) => (
                          <li key={record.id}>
                            <button
                              className={selectedId === record.id ? `${styles.rowButton} ${styles.rowSelected}` : styles.rowButton}
                              type="button"
                              aria-pressed={selectedId === record.id}
                              onClick={() => {
                                setSelectionAnnouncement("");
                                setSelectedId(record.id);
                              }}
                            >
                              <span className={styles.recordIdentity}>
                                <strong>{record.name}</strong>
                                <span>{record.category}</span>
                              </span>
                              <span className={styles.recordBoundary}>
                                <StateBadge state={record.state} />
                                <span>{record.writeBoundary.startsWith("None") ? "No external write" : record.state === "Export-only" ? "Local copy only" : "Boundary inspectable"}</span>
                              </span>
                              <span className={styles.recordScope}>{record.scope}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })
              )}
            </div>
            <CapabilityDetail record={selectedRecord} onBack={() => setSelectedId(null)} />
          </div>

          <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">
            {selectionAnnouncement ? `${selectionAnnouncement} ` : ""}{statusCopy}. {visibleRecords.length} of {records.length} capability records shown.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
