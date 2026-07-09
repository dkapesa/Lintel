"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HandoffVariant = {
  id: "short-alert" | "reviewer-handoff" | "daily-digest";
  name: string;
  description: string;
  body: string;
};

type CopyState = "idle" | "copied" | "failed";

const handoffVariants: HandoffVariant[] = [
  {
    id: "short-alert",
    name: "Short alert",
    description: "Use when a risky PR needs quick channel attention.",
    body: [
      "Lintel merge readiness: TESTS_REQUIRED / HIGH risk",
      "PR: Add fallback handling for failed discount-code retrieval",
      "Repo: acme/redemption-api",
      "Top blocker: Retry fallback may duplicate customer-facing redemptions.",
      "Missing tests: 7 gaps, including retry/idempotency and provider timeout coverage.",
      "Operational/security attention: provider failure paths and identifier logging need review.",
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
      "- Start with the high-risk redemption PR. Clear retry/idempotency conditions before merge.",
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

export default function SlackHandoffPage() {
  const [copyStates, setCopyStates] = useState<Record<HandoffVariant["id"], CopyState>>({
    "short-alert": "idle",
    "reviewer-handoff": "idle",
    "daily-digest": "idle",
  });
  const resetTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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
    <div className="app-shell workspace-shell">
      <aside className="sidebar workspace-sidebar">
        <Link className="brand workspace-brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lintel</span>
        </Link>
        <nav className="side-nav workspace-side-nav" aria-label="Primary navigation">
          <span className="workspace-nav-label">Workspace</span>
          <Link className="nav-item workspace-nav-item" href="/new">New report</Link>
          <Link className="nav-item workspace-nav-item" href="/workspace">Risk inbox</Link>
          <Link className="nav-item workspace-nav-item" href="/review-operations">Review operations</Link>
          <Link className="nav-item workspace-nav-item" href="/report">Reports</Link>
          <span className="workspace-nav-label">System</span>
          <Link className="nav-item workspace-nav-item" href="/settings">Analysis settings</Link>
          <Link className="nav-item workspace-nav-item" href="/github-action">GitHub Action</Link>
          <Link className="nav-item workspace-nav-item nav-item--active" href="/slack-handoff" aria-current="page">Slack handoff</Link>
          <span className="workspace-nav-label">Evidence</span>
          <Link className="nav-item workspace-nav-item" href="/docs/evaluation-results.md">Evaluation</Link>
          <Link className="nav-item workspace-nav-item" href="/docs/security-model.md">Security model</Link>
        </nav>
        <div className="workspace-sidebar-panel">
          <span>Handoff, not chat</span>
          <p>Share the merge decision in existing team channels without turning Lintel into a collaboration app.</p>
        </div>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Export concept</span></div>
        </div>
      </aside>

      <main className="workspace-main slack-main">
        <header className="workspace-header workspace-header--app slack-header">
          <div className="workspace-header-copy">
            <span className="eyebrow">SLACK-READY HANDOFF</span>
            <h1>Share the merge decision.</h1>
            <p>Lintel should create concise, structured review decisions that teams can paste into their existing communication channels. This is copy/export-only, not a live Slack integration.</p>
            <span className="workspace-header-note">Prototype only / no Slack API calls / raw-diff-free handoff / <Link href="/docs/security-model.md">Security model</Link></span>
          </div>
          <div className="workspace-header-actions">
            <Link className="workspace-secondary-action" href="/github-action">GitHub Action concept</Link>
            <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
          </div>
        </header>

        <section className="slack-hero" aria-label="Slack-ready summary preview">
          <article className="slack-preview-card">
            <div className="slack-window-top">
              <span>team-review</span>
              <strong>Preview</strong>
            </div>
            <div className="slack-message">
              <div className="slack-avatar">L</div>
              <div>
                <div className="slack-message-heading">
                  <strong>Lintel</strong>
                  <span>merge-readiness handoff</span>
                </div>
                <p><strong>TESTS_REQUIRED / HIGH risk</strong></p>
                <p>Add fallback handling for failed discount-code retrieval - acme/redemption-api</p>
                <div className="slack-message-block">
                  <span>Top blocker</span>
                  <p>Retry fallback may duplicate customer-facing redemption side effects.</p>
                </div>
                <div className="slack-message-block">
                  <span>Next action</span>
                  <p>Prove retries cannot issue duplicate discount codes before merge.</p>
                </div>
                <div className="slack-tags">
                  <span>7 missing tests</span>
                  <span>Backend reliability</span>
                  <span>API contract</span>
                  <span>Security/privacy</span>
                </div>
              </div>
            </div>
          </article>

          <article className="slack-explanation-card">
            <span className="card-kicker">HANDOFF, NOT CHAT</span>
            <h2>A checklist for the channel.</h2>
            <p>Lintel should not become another place to discuss code. It should produce the merge-readiness decision, the blocker, the reviewer focus and the next action so teams can coordinate in tools they already use.</p>
            <ul>
              {handoffPrinciples.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </section>

        <section className="settings-section" aria-labelledby="slack-variants-title">
          <div className="section-heading">
            <div>
              <span className="card-kicker">COPY VARIANTS</span>
              <h2 id="slack-variants-title">Slack-ready formats</h2>
            </div>
          </div>
          <div className="slack-variant-grid">
            {handoffVariants.map((variant) => (
              <article className="slack-variant-card" key={variant.id}>
                <div className="slack-variant-header">
                  <div>
                    <h3>{variant.name}</h3>
                    <p>{variant.description}</p>
                  </div>
                  <button
                    className={`copy-summary-button copy-summary-button--${copyStates[variant.id]}`}
                    type="button"
                    onClick={() => handleCopy(variant)}
                    aria-live="polite"
                  >
                    {copyLabels[copyStates[variant.id]]}
                  </button>
                </div>
                <pre className="slack-handoff-preview" aria-label={`${variant.name} Slack handoff text`}>{variant.body}</pre>
              </article>
            ))}
          </div>
        </section>

        <section className="settings-section slack-trust-section" aria-labelledby="slack-trust-title">
          <div>
            <span className="card-kicker">TRUST BOUNDARIES</span>
            <h2 id="slack-trust-title">Export-only by design</h2>
          </div>
          <ul>
            {trustBoundaries.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="settings-doc-links">
            <Link href="/github-action">GitHub Action prototype</Link>
            <Link href="/settings">Analysis settings</Link>
            <Link href="/docs/security-model.md">Security model</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
