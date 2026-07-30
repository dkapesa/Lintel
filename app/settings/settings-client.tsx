"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import AppShell from "../app-shell";
import ConsequentialDialog from "../consequential-dialog";
import styles from "../r4f4-administration.module.css";
import {
  MAX_REPORT_HISTORY,
  REPORT_HISTORY_STORAGE_KEY,
  clearReportHistory,
  readReportHistory,
} from "../../lib/report-history";
import { HUMAN_DECISION_LEDGER_ENTRY_LIMIT } from "../../lib/human-decision-ledger";
import { REVIEW_PROFILES } from "../../lib/review-profiles";

type ProviderState = {
  status: "checking" | "current" | "unavailable";
  configured: boolean;
  provider: string;
  model: string | null;
};

type LocalDataState = {
  status: "checking" | "available" | "unavailable";
  reportCount: number;
};

type Feedback = {
  tone: "success" | "error";
  message: string;
} | null;

function stateToken(state: string) {
  return state.toLowerCase().replace(/\s+/g, "-");
}

function StateBadge({ state }: { state: string }) {
  return <span className={styles.stateBadge} data-state={stateToken(state)}>{state}</span>;
}

function ScopeBadge({ children }: { children: ReactNode }) {
  return <span className={styles.scopeBadge}>{children}</span>;
}

function SystemRecord({
  title,
  detail,
  value,
  support,
}: {
  title: string;
  detail: string;
  value: string | ReactNode;
  support: string;
}) {
  return (
    <li className={styles.systemRecord}>
      <div className={styles.recordBody}>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <dl>
        <dt>Current value</dt>
        <dd><strong>{value}</strong><span>{support}</span></dd>
      </dl>
    </li>
  );
}

export default function SettingsClient() {
  const [provider, setProvider] = useState<ProviderState>({
    status: "checking",
    configured: false,
    provider: "openai",
    model: null,
  });
  const [localData, setLocalData] = useState<LocalDataState>({
    status: "checking",
    reportCount: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [providerRetry, setProviderRetry] = useState(0);
  const clearButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.getItem(REPORT_HISTORY_STORAGE_KEY);
      const entries = readReportHistory(window.localStorage);
      setLocalData({ status: "available", reportCount: entries.length });
    } catch {
      setLocalData({ status: "unavailable", reportCount: 0 });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setProvider((current) => ({ ...current, status: "checking" }));

    fetch("/api/generate-report", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Provider status unavailable");
        const value: unknown = await response.json();
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid provider status");
        const record = value as Record<string, unknown>;
        const modelAssisted = record.modelAssisted;
        if (!modelAssisted || typeof modelAssisted !== "object" || Array.isArray(modelAssisted)) throw new Error("Invalid provider status");
        const modelRecord = modelAssisted as Record<string, unknown>;
        if (!active) return;
        setProvider({
          status: "current",
          configured: modelRecord.state === "configured",
          provider: typeof modelRecord.provider === "string" ? modelRecord.provider : "openai",
          model: typeof modelRecord.model === "string" ? modelRecord.model : null,
        });
      })
      .catch(() => {
        if (active && !controller.signal.aborted) {
          setProvider({ status: "unavailable", configured: false, provider: "openai", model: null });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [providerRetry]);

  const providerLabel = provider.status === "checking"
    ? "Checking"
    : provider.status === "unavailable"
      ? "Unavailable"
      : provider.configured
        ? "Configured"
        : "Not configured";

  const storageLabel = localData.status === "checking"
    ? "Checking"
    : localData.status === "unavailable"
      ? "Unavailable"
      : "Available";

  function openClearDialog() {
    setClearError(null);
    setDialogOpen(true);
  }

  function confirmClear() {
    if (localData.status !== "available" || localData.reportCount === 0) {
      setClearError("No durable Report history is currently available to clear.");
      return false;
    }

    try {
      clearReportHistory(window.localStorage);
      const stored = window.localStorage.getItem(REPORT_HISTORY_STORAGE_KEY);
      const remaining = readReportHistory(window.localStorage);
      if (stored !== null || remaining.length !== 0) {
        setClearError("Report history may not have been fully removed. No external system was affected; retry after checking browser storage access.");
        setFeedback({ tone: "error", message: "Browser-local Report history could not be verified as cleared." });
        return false;
      }
      const removed = localData.reportCount;
      setLocalData({ status: "available", reportCount: 0 });
      setFeedback({
        tone: "success",
        message: `${removed} browser-local ${removed === 1 ? "Case File was" : "Case Files were"} removed and read-back verified. Human Decision ledgers, workspace metadata and external systems were not cleared.`,
      });
      setClearError(null);
      return true;
    } catch {
      setClearError("Browser storage refused the clear operation. The prior local record count remains displayed and no external system was affected.");
      setFeedback({ tone: "error", message: "Browser-local Report history was not cleared." });
      return false;
    }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <span className={styles.eyebrow}>Browser-local administration</span>
            <h1>System</h1>
            <p>Inspect analysis paths, provider boundaries, local retention and recovery without implying hosted settings or organisation-wide control.</p>
          </header>

          <div className={styles.boundaryBanner}>
            <div>
              <strong>Configuration scope</strong>
              <p>Every record below names its real scope. No setting is treated as a shared team policy, and read-only implementation status is not rendered as an editable control.</p>
            </div>
            <span className={styles.boundaryState}>Current browser · current environment</span>
          </div>

          {feedback && (
            <p className={feedback.tone === "success" ? styles.successNotice : styles.errorNotice} role={feedback.tone === "error" ? "alert" : "status"}>
              {feedback.message}
            </p>
          )}

          <div className={styles.systemLayout}>
            <nav className={styles.systemSectionNav} aria-label="System sections">
              <span className={styles.sectionNavTitle}>On this page</span>
              <a className={styles.sectionNavLink} href="#review-analysis">Review & analysis</a>
              <a className={styles.sectionNavLink} href="#provider-status">Provider status</a>
              <a className={styles.sectionNavLink} href="#local-data">Local data</a>
              <a className={styles.sectionNavLink} href="#privacy-security">Privacy & security</a>
              <a className={styles.sectionNavLink} href="#usage">Usage</a>
              <a className={styles.sectionNavLink} href="#import-export">Import & export</a>
              <a className={styles.sectionNavLink} href="#storage-recovery">Storage & recovery</a>
            </nav>

            <div className={styles.systemContent}>
              <section className={styles.systemSection} id="review-analysis" aria-labelledby="review-analysis-title">
                <div className={styles.sectionHeader}>
                  <h2 id="review-analysis-title">Review and analysis</h2>
                  <p>Review mode describes what engineers want checked. Analysis mode describes how Lintel performs that check.</p>
                </div>

                <div className={styles.systemGroup}>
                  <header className={styles.systemGroupHeader}>
                    <div>
                      <h3>Analysis execution paths</h3>
                      <p>Deterministic verification remains authoritative; model synthesis is additive and environment-gated.</p>
                    </div>
                    <ScopeBadge>Read-only implementation status</ScopeBadge>
                  </header>
                  <ul className={styles.systemRecordList}>
                    <SystemRecord
                      title="Deterministic-only"
                      detail="Runs the local rule baseline without an external model-provider request."
                      value={<StateBadge state="Available" />}
                      support="This review · takes effect when selected in New Review"
                    />
                    <SystemRecord
                      title="Baseline + model-assisted"
                      detail="Creates the deterministic baseline first, then may enrich wording and prioritisation through the configured provider."
                      value={<StateBadge state={providerLabel} />}
                      support="Current environment · future analyses only"
                    />
                    <SystemRecord
                      title="Default analysis selection"
                      detail="No supported browser-local mutation stores a future-review default. New Review resolves availability and lets the engineer select a path."
                      value="No stored default"
                      support="Read-only · no retroactive change"
                    />
                  </ul>
                </div>

                <div className={styles.systemGroup}>
                  <header className={styles.systemGroupHeader}>
                    <div>
                      <h3>Review profiles</h3>
                      <p>Profiles are chosen for one review during intake. This surface does not duplicate the New Review form or invent a global default.</p>
                    </div>
                    <ScopeBadge>This review</ScopeBadge>
                  </header>
                  <ul className={styles.systemRecordList}>
                    {REVIEW_PROFILES.map((profile) => (
                      <SystemRecord
                        key={profile.id}
                        title={profile.label}
                        detail={profile.description}
                        value="Available at intake"
                        support="Selection applies to the new review only"
                      />
                    ))}
                  </ul>
                </div>
              </section>

              <section className={styles.systemSection} id="provider-status" aria-labelledby="provider-status-title">
                <div className={styles.sectionHeader}>
                  <h2 id="provider-status-title">Provider status and data flow</h2>
                  <p>Only safe configured/unconfigured truth is returned. Provider keys and secret-presence detail never enter the browser.</p>
                </div>
                {provider.status === "unavailable" && (
                  <p className={styles.errorNotice} role="status">
                    Provider status is unavailable. No previous configured state is retained.
                    {" "}
                    <button className={styles.secondaryAction} type="button" onClick={() => setProviderRetry((value) => value + 1)}>Retry provider status</button>
                  </p>
                )}
                <div className={styles.systemGroup}>
                  <header className={styles.systemGroupHeader}>
                    <div>
                      <h3>{provider.configured && provider.status === "current" ? `${provider.provider}${provider.model ? ` / ${provider.model}` : ""}` : "Model-assisted provider"}</h3>
                      <p>Server-side execution may receive submitted diff content only when model assistance is explicitly selected.</p>
                    </div>
                    <StateBadge state={providerLabel} />
                  </header>
                  <dl className={styles.factGrid}>
                    <div><dt>Scope</dt><dd>Current environment</dd></div>
                    <div><dt>Execution</dt><dd>Server-side only</dd></div>
                    <div><dt>Data boundary</dt><dd>{provider.configured ? "Submitted diff may cross the provider boundary." : "No provider request is available."}</dd></div>
                    <div><dt>Provider storage request</dt><dd><span className={styles.technical}>store:false</span></dd></div>
                    <div><dt>Credential boundary</dt><dd>Server-side; never returned to browser</dd></div>
                    <div><dt>Fallback</dt><dd>Labelled deterministic baseline</dd></div>
                    <div><dt>External system write</dt><dd>None</dd></div>
                    <div><dt>Human Decision</dt><dd>Unaffected; remains accountable engineer authority</dd></div>
                  </dl>
                </div>
                <div className={styles.systemGroup}>
                  <ul className={styles.systemRecordList}>
                    <SystemRecord
                      title="Bring-your-own provider"
                      detail="No provider account, key entry or model selection is implemented on this browser surface."
                      value={<StateBadge state="Planned" />}
                      support="No current mutation or credential storage"
                    />
                    <SystemRecord
                      title="Internal or local model"
                      detail="A customer-controlled execution path is not integrated in the current application."
                      value={<StateBadge state="Planned" />}
                      support="No current execution capability"
                    />
                  </ul>
                </div>
              </section>

              <section className={styles.systemSection} id="local-data" aria-labelledby="local-data-title">
                <div className={styles.sectionHeader}>
                  <h2 id="local-data-title">Local data and retention</h2>
                  <p>The durable record is bounded Report history in this browser. Raw diff content is rejected from that history.</p>
                </div>
                <div className={styles.systemGroup}>
                  <ul className={styles.summaryGrid} aria-label="Browser-local data summary">
                    <li className={styles.summaryCell}>
                      <span>Durable Case Files</span>
                      <strong>{localData.status === "available" ? localData.reportCount : "—"}</strong>
                      <p>{localData.status === "available" ? "Known valid records in this browser" : storageLabel}</p>
                    </li>
                    <li className={styles.summaryCell}>
                      <span>History cap</span>
                      <strong>{MAX_REPORT_HISTORY}</strong>
                      <p>Newest valid Reports retained</p>
                    </li>
                    <li className={styles.summaryCell}>
                      <span>Raw diff retention</span>
                      <strong>None</strong>
                      <p>Rejected from durable Report history</p>
                    </li>
                  </ul>
                </div>
                <div className={styles.systemGroup}>
                  <header className={styles.systemGroupHeader}>
                    <div>
                      <h3>Retention boundaries</h3>
                      <p>Records name what is stored, what stays separate and what is excluded.</p>
                    </div>
                    <ScopeBadge>All local reviews</ScopeBadge>
                  </header>
                  <ul className={styles.systemRecordList}>
                    <SystemRecord
                      title="Canonical Report history"
                      detail="Stores validated Report content, source, timestamps and canonical run/head/provenance fields where the source recorded them."
                      value={`Maximum ${MAX_REPORT_HISTORY}`}
                      support="Browser-local · newest valid entries"
                    />
                    <SystemRecord
                      title="Human Decision ledger"
                      detail="Stored separately from Report history, append-only and identity-bound where current data permits."
                      value={`Bounded to ${HUMAN_DECISION_LEDGER_ENTRY_LIMIT}`}
                      support="Per Report ledger · not cleared by Report-history action"
                    />
                    <SystemRecord
                      title="Session and sample records"
                      detail="Session Case Files are not durable; controlled samples are read-only fixtures and are never counted as local history."
                      value="Excluded"
                      support="No durable Report-history write"
                    />
                    <SystemRecord
                      title="Raw diff"
                      detail="Used transiently for analysis and rejected when durable Report history is validated."
                      value="Not retained"
                      support="Current analysis request only"
                    />
                  </ul>
                </div>
                <div className={styles.systemGroup}>
                  <header className={styles.systemGroupHeader}>
                    <div>
                      <h3>Clear browser-local Report history</h3>
                      <p>This is the only supported destructive System mutation. It targets one exact storage contract.</p>
                    </div>
                    <ScopeBadge>All local reviews</ScopeBadge>
                  </header>
                  <div className={styles.destructiveBody}>
                    <p>
                      {localData.status === "unavailable"
                        ? "Browser storage is unavailable. No destructive control is offered."
                        : localData.reportCount === 0
                          ? "No durable Case Files are currently stored. Demonstration fixtures, Human Decision ledgers and workspace metadata are not Report history."
                          : `Remove ${localData.reportCount} durable browser-local ${localData.reportCount === 1 ? "Case File" : "Case Files"}. This cannot be undone and does not delete anything from GitHub, Slack or a model provider.`}
                    </p>
                    {localData.status === "available" && localData.reportCount > 0 && (
                      <button className={styles.dangerAction} type="button" ref={clearButtonRef} onClick={openClearDialog}>
                        Clear Report history
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <section className={styles.systemSection} id="privacy-security" aria-labelledby="privacy-security-title">
                <div className={styles.sectionHeader}>
                  <h2 id="privacy-security-title">Privacy and security</h2>
                  <p>Current implementation boundaries are stated without certification, enterprise-control or hosted-authority claims.</p>
                </div>
                <div className={styles.systemGroup}>
                  <ul className={styles.systemRecordList}>
                    <SystemRecord
                      title="Browser-local Report history"
                      detail="Durable Case Files remain on this device under the browser-local history contract."
                      value="Local"
                      support="No cloud sync or organisation store"
                    />
                    <SystemRecord
                      title="Transient diff handling"
                      detail="Raw diff content may be analysed for the current request but is excluded from durable Report history and local exports."
                      value="Not retained"
                      support="External provider boundary only when explicitly selected"
                    />
                    <SystemRecord
                      title="External writes"
                      detail="Public/connected GitHub import is read-only, Slack is Export-only and the GitHub Action remains a Blueprint."
                      value="No silent write"
                      support="Explicit local copy/download only"
                    />
                    <SystemRecord
                      title="Accountable authority"
                      detail="Lintel recommends. The accountable engineer records Human Decision through the separate verified ledger flow."
                      value="Human Decision"
                      support="Never selected by provider or integration status"
                    />
                  </ul>
                  <div className={styles.detailActions}>
                    <Link className={styles.secondaryAction} href="/docs/security-model.md">Open security model</Link>
                    <Link className={styles.secondaryAction} href="/integrations">Inspect capability boundaries</Link>
                  </div>
                </div>
              </section>

              <section className={styles.systemSection} id="usage" aria-labelledby="usage-title">
                <div className={styles.sectionHeader}>
                  <h2 id="usage-title">Usage and capability boundaries</h2>
                  <p>Only bounded local counts and current capability facts are available. No organisation telemetry is inferred.</p>
                </div>
                <div className={styles.systemGroup}>
                  <ul className={styles.summaryGrid} aria-label="Truthful local usage">
                    <li className={styles.summaryCell}>
                      <span>Local Case Files</span>
                      <strong>{localData.status === "available" ? localData.reportCount : "—"}</strong>
                      <p>{storageLabel}</p>
                    </li>
                    <li className={styles.summaryCell}>
                      <span>Retention limit</span>
                      <strong>{MAX_REPORT_HISTORY}</strong>
                      <p>Browser-local Reports</p>
                    </li>
                    <li className={styles.summaryCell}>
                      <span>Model assistance</span>
                      <strong>{provider.status === "current" ? provider.configured ? "On" : "Off" : "—"}</strong>
                      <p>{providerLabel}</p>
                    </li>
                  </ul>
                  <div className={styles.destructiveBody}>
                    <p>No token billing, spend, quota, plan limit, team activity, trend chart or daily usage history is instrumented. Those records are unavailable rather than estimated.</p>
                  </div>
                </div>
              </section>

              <section className={styles.systemSection} id="import-export" aria-labelledby="import-export-title">
                <div className={styles.sectionHeader}>
                  <h2 id="import-export-title">Import and export</h2>
                  <p>Every current path names its source, destination and external-write consequence.</p>
                </div>
                <div className={styles.systemGroup}>
                  <ul className={styles.systemRecordList}>
                    <SystemRecord
                      title="Public GitHub pull-request import"
                      detail="Source: one public GitHub pull request. Destination: New Review memory, then canonical browser-local history only after successful analysis. Raw diff is excluded from durable history."
                      value="Available"
                      support="External read · no external write"
                    />
                    <SystemRecord
                      title="Connected GitHub import"
                      detail="Source: an explicitly selected accessible repository and pull request. Destination: the same New Review and canonical local persistence path."
                      value="Environment-gated"
                      support="Authenticated external read · no external write"
                    />
                    <SystemRecord
                      title="Case File text"
                      detail="Source: one resolved Case File. Destination: clipboard or local text download. Includes structured evidence and Human Decision label where available; excludes raw diff."
                      value="Available"
                      support="Local copy/download · no external write"
                    />
                    <SystemRecord
                      title="Slack handoff"
                      detail="Source: selected local demonstration handoff content. Destination: clipboard. No workspace, channel, OAuth or delivery target is known."
                      value="Export-only"
                      support="Local copy · does not send"
                    />
                    <SystemRecord
                      title="GitHub Action setup"
                      detail="Source: local Blueprint documentation. Destination: engineer-controlled copy/reference only."
                      value="Blueprint"
                      support="Does not install, execute, connect or post"
                    />
                    <SystemRecord
                      title="General backup import/export"
                      detail="No established broad backup schema exists, so System does not offer a misleading archive or restore control."
                      value="Unavailable"
                      support="No duplicate or conflict contract"
                    />
                  </ul>
                </div>
              </section>

              <section className={styles.systemSection} id="storage-recovery" aria-labelledby="storage-recovery-title">
                <div className={styles.sectionHeader}>
                  <h2 id="storage-recovery-title">Storage and recovery</h2>
                  <p>Local read and deletion failures preserve the maximum truthful context and never imply external recovery.</p>
                </div>
                <div className={styles.systemGroup}>
                  <ul className={styles.systemRecordList}>
                    <SystemRecord
                      title="Local storage status"
                      detail="The current browser must allow access to the exact Report-history key before counts or destructive action are offered."
                      value={<StateBadge state={storageLabel} />}
                      support="Current browser"
                    />
                    <SystemRecord
                      title="History validation"
                      detail="The existing reader retains only valid bounded entries and rejects Report records containing raw diff material."
                      value="Authoritative read"
                      support="Invalid records are not presented as Case Files"
                    />
                    <SystemRecord
                      title="Unknown identity"
                      detail="Workspace and Case File routes fail closed when an exact stored review no longer resolves; they do not substitute another review."
                      value="Fail closed"
                      support="No stale authority"
                    />
                    <SystemRecord
                      title="Cloud recovery"
                      detail="No hosted backup, sync, account recovery or organisation restore capability exists."
                      value="Unavailable"
                      support="Browser-local records only"
                    />
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <ConsequentialDialog
        open={dialogOpen}
        title="Clear browser-local Report history?"
        eyebrow="Destructive local-data action"
        affectedObject={`${localData.reportCount} durable browser-local ${localData.reportCount === 1 ? "Case File" : "Case Files"} under ${REPORT_HISTORY_STORAGE_KEY}`}
        currentState={`${localData.reportCount} valid Report-history ${localData.reportCount === 1 ? "record" : "records"}`}
        proposedState="0 Report-history records after verified read-back"
        consequence="This permanently removes the bounded browser-local Report history used by Workspace, Case File, Operational Home and Review Operations. It cannot be undone. It does not delete GitHub data, Slack content, provider data, Human Decision ledgers or local workspace metadata."
        unresolvedConditions={[
          "Open routes may continue showing their current in-memory projection until reloaded.",
          "Human Decision ledgers and workspace associations are separate browser-local records and remain untouched.",
        ]}
        confirmLabel={`Clear ${localData.reportCount} ${localData.reportCount === 1 ? "Case File" : "Case Files"}`}
        error={clearError}
        returnFocusRef={clearButtonRef}
        onConfirm={confirmClear}
        onCancel={() => {
          setDialogOpen(false);
          setClearError(null);
        }}
      />
    </AppShell>
  );
}
