"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AppShell from "../app-shell";
import styles from "../administrative-document.module.css";

type HandoffVariant = {
  id: "short-alert" | "reviewer-handoff" | "daily-digest";
  name: string;
  description: string;
  includedEvidence: string;
  body: string;
};

type CopyState = "idle" | "copied" | "failed";

const handoffVariants: HandoffVariant[] = [
  {
    id: "short-alert",
    name: "Short alert",
    description: "Use when a risky PR needs quick channel attention.",
    includedEvidence: "Recommendation, blocker, test gaps, owner cue and next action",
    body: [
      "Lintel merge readiness: TESTS_REQUIRED / HIGH risk",
      "PR: Add fallback handling for failed discount-code retrieval",
      "Repo: acme/redemption-api",
      "Top blocker: Retry fallback may duplicate customer-facing redemptions.",
      "Missing tests: 7 gaps, including retry/idempotency and provider timeout coverage.",
      "Operational/security attention: provider failure paths and identifier logging need review.",
      "Owner cue: Test owner, then Backend reviewer",
      "Reviewer focus: Backend reliability, API contract, Security/privacy, Payments/domain logic",
      "Next action: Prove retries cannot issue duplicate discount codes before merge.",
      "",
      "Prototype/export-only: this is copied text, not a live Slack integration.",
    ].join("\n"),
  },
  {
    id: "reviewer-handoff",
    name: "Reviewer handoff",
    description: "Use when assigning review attention across engineering areas.",
    includedEvidence: "Recommendation, conditions, reviewer focus, owner cues and next action",
    body: [
      "Lintel reviewer handoff",
      "",
      "PR: Add fallback handling for failed discount-code retrieval",
      "Repo: acme/redemption-api",
      "Recommendation: TESTS_REQUIRED",
      "Risk: HIGH / 78/100",
      "",
      "Top blocker",
      "- Retry fallback may duplicate customer-facing redemption side effects.",
      "",
      "Conditions before merge",
      "- Prove retries cannot create duplicate redemptions or issue duplicate discount codes",
      "- Verify provider handling for 5xx response, timeout and unavailable states",
      "- Confirm the frontend-safe API error contract remains stable",
      "- Confirm identifier logging is intentional, hashed or redacted",
      "",
      "Reviewer focus",
      "- Backend reliability: retry and provider failure behavior",
      "- API contract: stable retryable/non-retryable client response",
      "- Security/privacy: structured logging near user and partner identifiers",
      "",
      "Owner cue",
      "- Test owner for missing retry/provider coverage",
      "- Backend reviewer for retry and provider failure behavior",
      "",
      "Next action",
      "- Add the missing risk-specific tests, then rerun Lintel and complete normal human review.",
      "",
      "Prototype/export-only: Lintel is not sending this to Slack.",
    ].join("\n"),
  },
  {
    id: "daily-digest",
    name: "Daily digest concept",
    description: "Use as a future team-summary shape, not a live digest.",
    includedEvidence: "Three readiness groups and one team action",
    body: [
      "Lintel daily merge-readiness digest concept",
      "",
      "Needs tests",
      "- acme/redemption-api: Add fallback handling for failed discount-code retrieval - HIGH risk - 7 missing tests",
      "",
      "Needs review",
      "- acme/session-api: Rotate refresh session token - MEDIUM risk - Security/privacy review",
      "",
      "Ready to merge",
      "- acme/profile-api: Trim whitespace in formatted names - LOW risk - no conditions",
      "",
      "Team action",
      "- Start with the high-risk redemption PR. Assign a test owner and clear retry/idempotency conditions before merge.",
      "",
      "Prototype/export-only: this shows a possible handoff format, not scheduled Slack delivery.",
    ].join("\n"),
  },
];

const handoffPrinciples = [
  "Lintel creates structured merge-readiness decisions.",
  "Teams can share those decisions in the tools they already use.",
  "The handoff should stay concise: recommendation, blocker, reviewer focus and next action.",
  "Full collaboration, Slack OAuth and automated delivery can come later.",
] as const;

const trustBoundaries = [
  "No Slack API calls are made from this page.",
  "No Slack OAuth or workspace connection exists in this prototype.",
  "Copying is local browser behavior only.",
  "Raw diffs are not included in the Slack-ready handoff text.",
  "This is an export surface, not a chat product.",
] as const;

const copyLabels: Record<CopyState, string> = {
  idle: "Copy handoff",
  copied: "Copied",
  failed: "Copy failed",
};

function copyWithFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).length;
}

export default function SlackHandoffPage() {
  const [selectedId, setSelectedId] = useState<HandoffVariant["id"]>("short-alert");
  const [copyStates, setCopyStates] = useState<Record<HandoffVariant["id"], CopyState>>({
    "short-alert": "idle",
    "reviewer-handoff": "idle",
    "daily-digest": "idle",
  });
  const resetTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const selectedVariant = handoffVariants.find((variant) => variant.id === selectedId) ?? handoffVariants[0];

  useEffect(() => () => {
    Object.values(resetTimers.current).forEach((timer) => clearTimeout(timer));
  }, []);

  async function handleCopy(variant: HandoffVariant) {
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(variant.body);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) copied = copyWithFallback(variant.body);

    setCopyStates((current) => ({ ...current, [variant.id]: copied ? "copied" : "failed" }));
    if (resetTimers.current[variant.id]) clearTimeout(resetTimers.current[variant.id]);
    resetTimers.current[variant.id] = setTimeout(() => {
      setCopyStates((current) => ({ ...current, [variant.id]: "idle" }));
    }, 2_000);
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>Slack handoff export</h1>
            <p>Lintel produces concise, structured merge decisions that teams can copy into tools they already use. This is copy/export-only—not a live Slack integration.</p>
            <div className={styles.statusLine}>Prototype only · no Slack API calls · raw-diff-free handoff · <Link href="/docs/security-model.md">Security model</Link></div>
            <div className={styles.pageActions}>
              <Link className={styles.secondaryAction} href="/github-action">GitHub Action concept</Link>
              <Link className={styles.secondaryAction} href="/new">Check a pull request</Link>
            </div>
          </header>

          <nav className={styles.sectionNav} aria-label="Slack handoff export sections">
            <a href="#slack-status">Current status</a>
            <a href="#slack-formats">Handoff formats</a>
            <a href="#slack-content">Selected content</a>
            <a href="#slack-boundary">Data boundary</a>
            <a href="#slack-export">Export action</a>
          </nav>

          <section className={styles.section} id="slack-status" aria-labelledby="slack-status-title">
            <div className={styles.sectionHeader}>
              <h2 id="slack-status-title">Current export status</h2>
              <p>A checklist for the channel, not another chat product or a simulated Slack workspace.</p>
            </div>
            <ul className={styles.summaryStrip} aria-label="Slack handoff export status">
              <li><span>Surface</span><strong>Prototype</strong><p>Local export record</p></li>
              <li><span>Delivery</span><strong>Does not send</strong><p>No Slack API behavior</p></li>
              <li><span>Connection</span><strong>None</strong><p>No OAuth or workspace</p></li>
              <li><span>Content boundary</span><strong>Raw-diff-free</strong><p>Structured decision text</p></li>
            </ul>
            <div className={styles.groupStack}>
              <div className={styles.group}>
                <div className={styles.groupHeader}>
                  <h3>Handoff purpose</h3>
                  <p>Lintel hands over the decision, blocker, reviewer focus and next action so coordination can remain elsewhere.</p>
                </div>
                <ul className={styles.boundaryList}>{handoffPrinciples.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </section>

          <section className={styles.section} id="slack-formats" aria-labelledby="slack-formats-title">
            <div className={styles.sectionHeader}>
              <h2 id="slack-formats-title">Handoff formats</h2>
              <p>Select one existing text variant. Selection changes only the local export artifact below; it does not identify a channel or delivery target.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>Available formats</h3>
                <p>Every record is keyboard-selectable and keeps its export-only state explicit.</p>
              </div>
              <div className={styles.formatColumns} aria-hidden="true"><span /><span>Format</span><span>Intended use</span><span>Included evidence</span><span>Length / state</span></div>
              <ul className={styles.formatList} aria-label="Slack handoff formats">
                {handoffVariants.map((variant) => {
                  const selected = variant.id === selectedId;
                  return (
                    <li key={variant.id}>
                      <label className={styles.formatOption}>
                        <input type="radio" name="handoff-format" value={variant.id} checked={selected} onChange={() => setSelectedId(variant.id)} />
                        <span className={styles.formatName}>{variant.name}</span>
                        <span className={styles.formatDescription}>{variant.description}</span>
                        <span className={styles.formatEvidence}>{variant.includedEvidence}</span>
                        <span className={styles.formatLength}>{wordCount(variant.body)} words{selected && <span className={styles.selectedLabel}>Selected</span>}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section className={styles.section} id="slack-content" aria-labelledby="slack-content-title">
            <div className={styles.sectionHeader}>
              <h2 id="slack-content-title">Selected handoff content</h2>
              <p>The generated text is presented as a technical export artifact, not as a sent message or third-party application window.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>{selectedVariant.name}</h3>
                <p>{selectedVariant.description}</p>
              </div>
              <dl className={styles.definitionList}>
                <div><dt>Format identity</dt><dd>{selectedVariant.name}</dd></div>
                <div><dt>Included fields</dt><dd>{selectedVariant.includedEvidence}</dd></div>
                <div><dt>Excluded sensitive content</dt><dd>Raw diff content</dd></div>
                <div><dt>Delivery state</dt><dd>Export only · not sent</dd></div>
              </dl>
              <pre className={styles.exportText} aria-label={`${selectedVariant.name} handoff text`}>{selectedVariant.body}</pre>
              <div className={styles.artifactActions} id="slack-export">
                <p>Copying uses local browser behavior only. No workspace, channel or sender is known to Lintel.</p>
                <button className={styles.primaryAction} type="button" onClick={() => handleCopy(selectedVariant)}>
                  <span aria-live="polite">{copyLabels[copyStates[selectedVariant.id]]}</span>
                </button>
              </div>
            </div>
          </section>

          <section className={styles.section} id="slack-boundary" aria-labelledby="slack-boundary-title">
            <div className={styles.sectionHeader}>
              <h2 id="slack-boundary-title">Data boundary</h2>
              <p>The handoff excludes raw diff content and makes every unavailable integration capability explicit.</p>
            </div>
            <div className={`${styles.group} ${styles.limitationGroup}`}>
              <div className={styles.groupHeader}>
                <h3>Export-only by design</h3>
                <p>No OAuth, delivery, scheduling, workspace connection or channel lookup is implemented.</p>
              </div>
              <ul className={styles.boundaryList}>{trustBoundaries.map((item) => <li key={item}>{item}</li>)}</ul>
              <nav className={styles.routeLinks} aria-label="Slack handoff related documentation">
                <Link href="/github-action">GitHub Action prototype</Link>
                <Link href="/settings">Analysis settings</Link>
                <Link href="/docs/security-model.md">Security model</Link>
              </nav>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
