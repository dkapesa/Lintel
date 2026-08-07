import { Copy, Identifier, SectionHeading, TechnicalExcerpt } from "../../../_public/primitives";

type SectionMeta = { id: string; heading: string };

export const RUN_LINTEL_LOCALLY_SECTIONS: readonly SectionMeta[] = [
  { id: "doc-run-requirements", heading: "Requirements" },
  { id: "doc-run-install", heading: "Install and run" },
  { id: "doc-run-sample", heading: "Open the fixed sample" },
  { id: "doc-run-build", heading: "Production build" },
  { id: "doc-run-model", heading: "Optional model analysis" },
  { id: "doc-run-github-token", heading: "Optional public GitHub access" },
  { id: "doc-run-github-app", heading: "Optional GitHub App prototype" },
  { id: "doc-run-baseline", heading: "What runs with no configuration at all" },
];

export function RunLintelLocallyBody() {
  return (
    <>
      <div>
        <SectionHeading headingId="doc-run-requirements" title="Requirements" />
        <Copy variant="technical">
          The repository does not currently declare an exact Node.js version. Use a current
          long-term-support Node.js release and npm, the package manager the lockfile is
          written for.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-run-install" title="Install and run" />
        <Copy variant="technical">Install dependencies, then start the development server.</Copy>
        <TechnicalExcerpt label="Install and start the development server">
          {"npm ci\nnpm run dev"}
        </TechnicalExcerpt>
        <Copy variant="technical">
          The application opens at <Identifier>http://localhost:3000</Identifier>.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-run-sample" title="Open the fixed sample" />
        <TechnicalExcerpt label="Canonical sample review URL">
          {"http://localhost:3000/workspace?source=fixture"}
        </TechnicalExcerpt>
        <Copy variant="technical">
          The fixture is read-only sample data. It does not make network requests, clear
          requirements or record a Human Decision. It is pull request <Identifier>#482</Identifier>{" "}
          in <Identifier>example/b2b-redemption-api</Identifier>, and it stays unresolved on
          every load.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-run-build" title="Production build" />
        <TechnicalExcerpt label="Build and start a production server">
          {"npm run build\nnpm run start"}
        </TechnicalExcerpt>
        <Copy variant="technical">
          There is no dedicated automated test or lint script exposed through
          <Identifier> package.json</Identifier> today. Only <Identifier>dev</Identifier>,
          <Identifier> build</Identifier> and <Identifier>start</Identifier> are defined.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-run-model" title="Optional model analysis" />
        <Copy variant="technical">
          Copy the example environment file, then set the two model variables to enable
          model-assisted analysis. Leaving either value empty keeps analysis deterministic.
        </Copy>
        <TechnicalExcerpt label="Copy the environment file">
          {"cp .env.example .env.local\n\n# Windows PowerShell\nCopy-Item .env.example .env.local"}
        </TechnicalExcerpt>
        <TechnicalExcerpt label="Model environment variables">
          {"OPENAI_API_KEY=\nOPENAI_MODEL="}
        </TechnicalExcerpt>
        <Copy variant="technical">
          What is sent to the configured provider when these are set, and what stays local
          when they are not, is recorded on <Identifier>/docs/data-boundaries</Identifier> and
          summarised on Trust.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-run-github-token" title="Optional public GitHub access" />
        <TechnicalExcerpt label="Public GitHub access variable">{"GITHUB_TOKEN="}</TechnicalExcerpt>
        <Copy variant="technical">
          This can be used for authenticated GitHub API access where supported, for example
          when importing a public pull request. It is unrelated to the GitHub App prototype
          below.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-run-github-app" title="Optional GitHub App prototype" />
        <TechnicalExcerpt label="GitHub App prototype environment variables">
          {"GITHUB_APP_ID=\nGITHUB_APP_PRIVATE_KEY=\nGITHUB_WEBHOOK_SECRET="}
        </TechnicalExcerpt>
        <Copy variant="technical">
          Configuring these enables the local GitHub App prototype. The full delivery path,
          permissions and configuration steps are on{" "}
          <Identifier>/docs/github-app-prototype</Identifier>. Never commit
          <Identifier> .env.local</Identifier>, private keys, tokens or credentials.
        </Copy>
      </div>

      <div>
        <SectionHeading headingId="doc-run-baseline" title="What runs with no configuration at all" />
        <Copy variant="technical">
          Deterministic analysis, the fixed sample review and the main Workspace all run with
          zero environment configuration. Every optional value above only adds capability; none
          is required to run Lintel locally.
        </Copy>
      </div>
    </>
  );
}
