import Link from "next/link";
import AppShell from "../app-shell";
import styles from "../administrative-document.module.css";

const analysisModes = [
  {
    name: "Deterministic-only",
    status: "Available now",
    boundary: "Runs through Lintel's local rule baseline. No external model call is required.",
    use: "Repeatable merge-readiness checks, fallback behaviour, or a raw-diff-minimising local flow.",
  },
  {
    name: "Baseline + model-assisted",
    status: "Prototype",
    boundary: "The deterministic baseline is created first. Model-assisted synthesis can enrich wording and prioritisation when configured.",
    use: "Configured-provider review where synthesis is useful without losing baseline guardrails.",
  },
  {
    name: "Future BYO provider",
    status: "Planned",
    boundary: "Customer-provided keys would run under user control, ideally inside CI or a future controlled execution path.",
    use: "Teams that need model assistance under their own provider account and policy boundary.",
  },
  {
    name: "Future internal/local model",
    status: "Concept",
    boundary: "Execution would stay inside the customer's environment. No hosted Lintel server would need to process code.",
    use: "Higher-sensitivity teams that want model assistance without external provider data flow.",
  },
] as const;

const providerPaths = [
  {
    path: "OpenAI",
    status: "Prototype route when environment variables are configured",
    boundary: "Server-side call from the local prototype route. No key is exposed client-side.",
    use: "Optional model-assisted synthesis during prototype evaluation.",
  },
  {
    path: "Anthropic",
    status: "Future provider path",
    boundary: "Not integrated. Would require BYO key and explicit enablement.",
    use: "Potential alternative for teams standardised on Anthropic.",
  },
  {
    path: "Local/internal model",
    status: "Future private execution path",
    boundary: "Not integrated. Intended to keep code inside customer-controlled infrastructure.",
    use: "Sensitive repositories, internal codebases, or strict data-control environments.",
  },
  {
    path: "Custom endpoint",
    status: "Future adapter concept",
    boundary: "Not integrated. Would require explicit configuration, timeout and fallback rules.",
    use: "Teams using a gateway, proxy, internal LLM service or evaluation harness.",
  },
] as const;

const dataHandling = [
  {
    label: "Deterministic baseline",
    detail: "Every review begins with the local baseline; missing configuration, timeouts, malformed output and failed normalisation fall back to it.",
    value: "Available",
  },
  {
    label: "Model-assisted analysis",
    detail: "Optional synthesis is available only when the prototype route is configured.",
    value: "Environment controlled",
  },
  {
    label: "Provider keys",
    detail: "This read-only surface does not save keys or switch models.",
    value: "Not retained locally",
  },
  {
    label: "Raw diff storage",
    detail: "Raw diffs are not saved as durable app data or local report history.",
    value: "Not retained",
  },
] as const;

const limitations = [
  {
    label: "Provider configuration",
    detail: "No provider configuration, key management or model selection is available on this page.",
    value: "Read-only",
  },
  {
    label: "Enterprise controls",
    detail: "This prototype does not claim SOC 2, SSO, RBAC, audit logs or enterprise compliance.",
    value: "Unavailable",
  },
  {
    label: "Repository delivery",
    detail: "This page does not post to GitHub or save configuration for a repository.",
    value: "Unavailable",
  },
] as const;

export default function SettingsPage() {
  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>Analysis settings</h1>
            <p>Review modes describe what engineers want checked; analysis modes describe how Lintel runs that check.</p>
            <div className={styles.statusLine}>Read-only prototype · no provider keys stored · <Link href="/docs/security-model.md">Security model</Link></div>
          </header>

          <div>
            <section className={styles.section} aria-labelledby="review-analysis-title">
              <div className={styles.sectionHeader}>
                <h2 id="review-analysis-title">Review and analysis</h2>
                <p>Deterministic analysis remains the baseline. Model-assisted paths are explicit about their present boundary.</p>
              </div>
              <div className={styles.group}>
                <div className={styles.groupHeader}>
                  <h3>Analysis modes</h3>
                  <p>Current and future paths are listed as records, not selectable configuration.</p>
                </div>
                <ul className={styles.recordList}>
                  {analysisModes.map((mode) => (
                    <li className={styles.record} key={mode.name}>
                      <div>
                        <span className={styles.recordTitle}>{mode.name}</span>
                        <span className={styles.recordSupport}>{mode.boundary} {mode.use}</span>
                      </div>
                      <span className={styles.recordValue}>{mode.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="provider-status-title">
              <div className={styles.sectionHeader}>
                <h2 id="provider-status-title">Provider status</h2>
                <p>These records describe possible execution paths. They do not expose a model selector or save provider settings.</p>
              </div>
              <div className={styles.group}>
                <div className={styles.groupHeader}>
                  <h3>Execution paths</h3>
                  <p>Provider availability and data boundaries remain explicit for the local prototype.</p>
                </div>
                <ul className={styles.recordList}>
                  {providerPaths.map((provider) => (
                    <li className={styles.record} key={provider.path}>
                      <div>
                        <span className={styles.recordTitle}>{provider.path}</span>
                        <span className={styles.recordSupport}>{provider.boundary} {provider.use}</span>
                      </div>
                      <span className={styles.recordValue}>{provider.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="data-handling-title">
              <div className={styles.sectionHeader}>
                <h2 id="data-handling-title">Data handling</h2>
                <p>Current handling is described as it exists in the prototype, including the deterministic fallback and raw-diff boundary.</p>
              </div>
              <div className={styles.group}>
                <ul className={styles.recordList}>
                  {dataHandling.map((item) => (
                    <li className={styles.record} key={item.label}>
                      <div>
                        <span className={styles.recordTitle}>{item.label}</span>
                        <span className={styles.recordSupport}>{item.detail}</span>
                      </div>
                      <span className={styles.recordValue}>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="limitations-title">
              <div className={styles.sectionHeader}>
                <h2 id="limitations-title">Prototype limitations</h2>
                <p>These boundaries are intentional and do not imply editable configuration or managed enforcement.</p>
              </div>
              <div className={`${styles.group} ${styles.limitationGroup}`}>
                <ul className={styles.recordList}>
                  {limitations.map((item) => (
                    <li className={styles.record} key={item.label}>
                      <div>
                        <span className={styles.recordTitle}>{item.label}</span>
                        <span className={styles.recordSupport}>{item.detail}</span>
                      </div>
                      <span className={`${styles.recordValue} ${styles["recordValue--muted"]}`}>{item.value}</span>
                    </li>
                  ))}
                </ul>
                <nav className={styles.routeLinks} aria-label="Related documentation and prototypes">
                  <Link href="/review-policies">Review policies</Link>
                  <Link href="/github-action">GitHub Action prototype</Link>
                  <Link href="/slack-handoff">Slack handoff concept</Link>
                  <Link href="/docs/security-model.md">Security model</Link>
                  <Link href="/docs/cli-github-action-blueprint.md">CLI / GitHub Action blueprint</Link>
                </nav>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
