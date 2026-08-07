import { Copy, Identifier, SectionHeading, StructuredRecord, TechnicalExcerpt } from "../../../_public/primitives";

type SectionMeta = { id: string; heading: string };

export const GITHUB_APP_PROTOTYPE_SECTIONS: readonly SectionMeta[] = [
  { id: "doc-app-what", heading: "What the prototype is" },
  { id: "doc-app-environment", heading: "Environment configuration" },
  { id: "doc-app-settings", heading: "GitHub App settings and permissions" },
  { id: "doc-app-delivery", heading: "What happens on a verified delivery" },
  { id: "doc-app-dedup", heading: "Deduplication" },
  { id: "doc-app-comment", heading: "The pull-request comment" },
  { id: "doc-app-enable", heading: "Enabling and disabling a repository" },
  { id: "doc-app-deterministic", heading: "Deterministic-only analysis" },
  { id: "doc-app-limitations", heading: "Limitations" },
];

export function GitHubAppPrototypeBody() {
  return (
    <>
      <div>
        <SectionHeading headingId="doc-app-what" title="What the prototype is" />
        <Copy variant="technical">
          The GitHub App prototype is an environment-configured local integration that analyses a
          pull request when GitHub sends a verified webhook delivery, and posts or updates one
          decision comment on that pull request. It is a prototype with local filesystem
          persistence, not a hosted service.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-app-environment" title="Environment configuration" />
        <TechnicalExcerpt label="GitHub App environment variables">
          {"GITHUB_APP_ID=\nGITHUB_APP_PRIVATE_KEY=\nGITHUB_WEBHOOK_SECRET="}
        </TechnicalExcerpt>
        <Copy variant="technical">
          The private key may be stored with escaped newlines. Use real values only in a local,
          untracked environment file, and never commit it.
        </Copy>
        <TechnicalExcerpt label="Escaped private key form">
          {'GITHUB_APP_PRIVATE_KEY="<escaped private key with \\n newlines>"'}
        </TechnicalExcerpt>
      </div>

      <div>
        <SectionHeading headingId="doc-app-settings" title="GitHub App settings and permissions" />
        <Copy variant="technical">
          Create a GitHub App for local testing. Point its webhook at a local HTTPS tunnel ending
          in <Identifier>/api/github-app/webhook</Identifier>, using the same value as{" "}
          <Identifier>GITHUB_WEBHOOK_SECRET</Identifier> for the webhook secret.
        </Copy>
        <StructuredRecord
          headingId="doc-app-settings-record"
          title="What the prototype actually calls"
          items={[
            { label: "Repository contents", value: "Read, to fetch pull-request metadata and diff." },
            { label: "Pull requests", value: "Read and write, to fetch metadata and post or update one conversation comment." },
            { label: "Events subscribed", value: "installation, installation_repositories, pull_request." },
            { label: "Pull request actions handled", value: "opened, reopened, synchronize, ready_for_review." },
          ]}
        />
        <Copy variant="technical">
          The prototype requests no contents-write, administration, checks-write, actions-write or
          merge permission.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-app-delivery" title="What happens on a verified delivery" />
        <StructuredRecord
          headingId="doc-app-delivery-record"
          title="In order, on every webhook POST"
          items={[
            { label: "1", value: "The HMAC-SHA256 signature is verified against the raw request body before the body is parsed as JSON. An invalid signature returns 401 and nothing is stored." },
            { label: "2", value: "The delivery is normalised into a minimal, typed event envelope." },
            { label: "3", value: "Installation and repository state are recorded locally." },
            { label: "4", value: "Repository-enable state is checked; a disabled repository is acknowledged and not analysed." },
            { label: "5", value: "A short-lived installation access token is exchanged using a nine-minute RS256 JWT." },
            { label: "6", value: "Pull-request metadata and diff are fetched with that token, bounded to 200,000 characters." },
            { label: "7", value: "An optional Change Passport is parsed from the pull-request body, if a marked block is present." },
            { label: "8", value: "Lintel runs deterministic analysis and stores the completed report." },
            { label: "9", value: "Lintel creates or updates one marked pull-request comment." },
          ]}
        />
      </div>

      <div>
        <SectionHeading headingId="doc-app-dedup" title="Deduplication" />
        <Copy variant="technical">
          Deliveries are deduplicated by the GitHub delivery identifier: a delivery already
          recorded is not reprocessed. Analysis is separately deduplicated by head commit SHA: a
          pull request already analysed at its current head returns a duplicate result rather than
          running again.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-app-comment" title="The pull-request comment" />
        <Copy variant="technical">
          Lintel looks for one existing comment carrying a hidden marker before deciding whether
          to create a new comment or update the existing one, so a pull request never accumulates
          duplicate Lintel comments.
        </Copy>
        <TechnicalExcerpt label="Comment identity marker">
          {"<!-- lintel:merge-readiness -->"}
        </TechnicalExcerpt>
        <Copy variant="technical">
          The comment carries recommendation, risk, readiness movement since the previous
          analysis, top blockers, missing tests, conditions before merge, reviewer focus and a
          next action. Lintel never edits or deletes a comment that does not carry the marker, does
          not block merging by default, and does not post inline line comments.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-app-enable" title="Enabling and disabling a repository" />
        <Copy variant="technical">
          A local management surface can enable or disable an installed repository for Lintel
          processing. This changes only Lintel&rsquo;s local state; it does not alter the GitHub
          App installation or its repository permissions on GitHub. A disabled repository&rsquo;s
          history stays available, and future events are acknowledged without analysis or comment
          publishing until it is re-enabled.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-app-deterministic" title="Deterministic-only analysis" />
        <Copy variant="technical">
          Analysis on this path is deterministic only. The GitHub App prototype does not call a
          model provider, regardless of whether model environment variables are configured
          elsewhere.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-app-limitations" title="Limitations" />
        <Copy variant="technical">
          The local store is a single-process JSON file. It is not a production database, a
          distributed queue, an audit log or a multi-instance persistence layer. What it stores,
          what it never stores, and its exact retention bounds are recorded on{" "}
          <Identifier>/docs/data-boundaries</Identifier> rather than restated here.
        </Copy>
      </div>
    </>
  );
}
