import { Copy, Identifier, SectionHeading, StructuredRecord, TechnicalExcerpt } from "../../../_public/primitives";

type SectionMeta = { id: string; heading: string };

export const DATA_BOUNDARIES_SECTIONS: readonly SectionMeta[] = [
  { id: "doc-data-where", heading: "Where analysis runs" },
  { id: "doc-data-model", heading: "What is sent when model assistance is configured" },
  { id: "doc-data-browser", heading: "What the browser stores" },
  { id: "doc-data-github-app-disk", heading: "What the GitHub App prototype writes to disk" },
  { id: "doc-data-not-persisted", heading: "What is deliberately not persisted" },
  { id: "doc-data-bounds", heading: "Bounds and limits" },
  { id: "doc-data-not-claimed", heading: "What this document does not claim" },
];

export function DataBoundariesBody() {
  return (
    <>
      <div>
        <SectionHeading headingId="doc-data-where" title="Where analysis runs" />
        <Copy variant="technical">
          Deterministic analysis runs locally in the Next.js application process and makes no
          network request. Three other paths reach outside the local process only when they are
          used:
        </Copy>
        <StructuredRecord
          headingId="doc-data-where-boundaries"
          title="External destinations"
          items={[
            { label: "Model-assisted analysis", value: "A configured request to api.openai.com, only when both model variables are set." },
            { label: "Public pull request import", value: "An explicit read from github.com after a pull request URL is submitted." },
            { label: "GitHub App prototype", value: "Configured reads and writes through api.github.com, after a verified webhook delivery." },
          ]}
        />
        <Copy variant="technical">
          The public marketing routes — Home, Product, How it works, Trust, Resources and this
          document — make no external request at all.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-data-model" title="What is sent when model assistance is configured" />
        <Copy variant="technical">
          When both <Identifier>OPENAI_API_KEY</Identifier> and <Identifier>OPENAI_MODEL</Identifier> are
          set, a report request is sent to the OpenAI Responses API at{" "}
          <Identifier>https://api.openai.com/v1/responses</Identifier>. The request is sent with{" "}
          <Identifier>store: false</Identifier>. That is a request Lintel makes on every call; it
          is not a guarantee about how the configured provider stores data on its own systems.
        </Copy>
        <Copy variant="technical">
          Missing configuration, a failed call, or output that does not normalise all return the
          deterministic report instead of failing silently.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-data-browser" title="What the browser stores" />
        <StructuredRecord
          headingId="doc-data-browser-record"
          title="Local browser storage"
          items={[
            { label: "Current report envelope", value: "sessionStorage, for the active session only." },
            { label: "Recent report history", value: "localStorage, most recent 10 entries." },
            { label: "Condition progress", value: "localStorage." },
            { label: "Local workspace status", value: "localStorage." },
            { label: "Human Decision Ledger", value: "localStorage, most recent 80 entries." },
          ]}
        />
        <Copy variant="technical">
          Clearing report history removes it from the browser. There is no server-side team
          database and no shared account record for any of this.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-data-github-app-disk" title="What the GitHub App prototype writes to disk" />
        <Copy variant="technical">
          The prototype writes to one local, git-ignored JSON file:{" "}
          <Identifier>.lintel-data/github-app-store.json</Identifier>. It records delivery,
          installation, repository and pull-request state, and up to 20 completed analysis runs
          per pull request, each with its structured report, canonical run manifest and up to 20
          verification records.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-data-not-persisted" title="What is deliberately not persisted" />
        <StructuredRecord
          headingId="doc-data-not-persisted-record"
          title="Never written to durable storage"
          items={[
            { label: "Raw diffs", value: "Used transiently to generate a report, then discarded." },
            { label: "Raw webhook payloads", value: "Only a normalised, safe event envelope is recorded." },
            { label: "GitHub tokens and App JWTs", value: "Installation tokens are short-lived and held in memory only for the request that uses them." },
            { label: "Authorization headers, API keys and secrets", value: "Never written to the local store, a report or a comment." },
          ]}
        />
        <Copy variant="technical">
          A pull-request comment redacts likely secret-shaped text and strips raw diff markers
          such as <Identifier>diff --git</Identifier> and <Identifier>@@</Identifier> before it is
          posted.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-data-bounds" title="Bounds and limits" />
        <StructuredRecord
          headingId="doc-data-bounds-record"
          title="Exact numeric bounds"
          items={[
            { label: "Diff size accepted for GitHub App analysis", value: "200,000 characters." },
            { label: "Completed GitHub App runs retained per pull request", value: "20." },
            { label: "Verification records retained per run", value: "20." },
            { label: "Browser report history entries", value: "10." },
            { label: "Human Decision Ledger entries", value: "80." },
            { label: "Change Passport text field", value: "900 characters." },
            { label: "Change Passport short field", value: "160 characters." },
            { label: "Change Passport list items", value: "12 per list." },
            { label: "Change Passport fenced block", value: "8,000 characters." },
          ]}
        />
      </div>

      <div>
        <SectionHeading headingId="doc-data-not-claimed" title="What this document does not claim" />
        <Copy variant="technical">
          This document makes no certification claim (no SOC 2, no ISO, no SSO, no RBAC), no
          hosted-infrastructure claim, no encryption-at-rest claim, no access-control claim, no
          retention-policy or deletion-guarantee claim, no audit-log claim, and no SLA or uptime
          claim. None of these controls exist in the repository today.
        </Copy>
        <Copy variant="technical">
          <Identifier>/trust</Identifier> is the canonical source for availability and product
          truth. Where this document and Trust could be read differently, Trust is authoritative.
        </Copy>
      </div>
    </>
  );
}
