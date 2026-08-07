import type { Metadata } from "next";
import { CANONICAL_REVIEW, PRIMARY_EVIDENCE } from "../../../_public-r5-recalibrated/canonical-review";
import { buildPrivateLabMetadata } from "../../../_public/metadata";
import {
  Action,
  ActionGroup,
  Copy,
  Divider,
  EditorialSection,
  Identifier,
  MetadataGrid,
  MetadataItem,
  NeutralPlate,
  ProductFrame,
  ProseColumn,
  RelationshipGroup,
  ResponsiveGroup,
  RouteIntroduction,
  SectionHeading,
  SemanticStatus,
  StructuredRecord,
  TechnicalExcerpt,
  VisuallyHidden,
} from "../../../_public/primitives";

export const metadata: Metadata = buildPrivateLabMetadata({
  title: "Shared public primitives laboratory",
  description:
    "Private, noindex Phase 8C laboratory for the bounded shared Lintel public primitives.",
});

const excerpt = JSON.stringify(
  {
    repository: CANONICAL_REVIEW.repository,
    pull_request: CANONICAL_REVIEW.pullRequestNumber,
    recommendation: CANONICAL_REVIEW.recommendation,
    human_decision: CANONICAL_REVIEW.humanDecision,
  },
  null,
  2,
);

export default function SharedPublicPrimitivesLabPage() {
  return (
    <div data-private-primitives-lab>
      <EditorialSection labelledBy="primitives-lab-heading" opening>
        <RouteIntroduction
          eyebrow="Private design-system laboratory"
          headingId="primitives-lab-heading"
          title="Shared public primitives"
          summary="A bounded Phase 8C specimen of the real editorial, action, metadata and technical-surface grammar. This is not a public marketing route and introduces no future-route content."
          actions={
            <ActionGroup>
              <Action href="/workspace?source=fixture">Open the sample review</Action>
              <Action href="/new" variant="secondary">
                Start a review
              </Action>
              <Action href="#structured-record" variant="quiet">
                Inspect the record specimen
              </Action>
            </ActionGroup>
          }
        />
      </EditorialSection>

      <EditorialSection labelledBy="hierarchy-heading">
        <ResponsiveGroup>
          <ProseColumn>
            <SectionHeading
              eyebrow="Editorial hierarchy"
              headingId="hierarchy-heading"
              title="Route copy stays legible beside technical detail."
              summary="Section headings, supporting copy and body copy share the accepted type roles and measures rather than inventing route-local sizes."
            />
            <Copy>
              The group collapses to normal source order at tablet widths. At mobile widths, content
              recomposes into one column instead of compressing the desktop arrangement.
            </Copy>
          </ProseColumn>
          <MetadataGrid label="Canonical sample review metadata" columns={3}>
            <MetadataItem label="Repository">
              <Identifier>{CANONICAL_REVIEW.repository}</Identifier>
            </MetadataItem>
            <MetadataItem label="Pull request">
              <Identifier>{CANONICAL_REVIEW.pullRequestLabel}</Identifier>
            </MetadataItem>
            <MetadataItem label="Head commit">
              <Identifier accessibleName={`Full sample head commit ${CANONICAL_REVIEW.headSha}`}>
                {CANONICAL_REVIEW.headSha}
              </Identifier>
            </MetadataItem>
            <MetadataItem label="Recommendation">{CANONICAL_REVIEW.recommendation}</MetadataItem>
            <MetadataItem label="Risk">{CANONICAL_REVIEW.riskLabel}</MetadataItem>
            <MetadataItem label="Human Decision">{CANONICAL_REVIEW.humanDecision}</MetadataItem>
          </MetadataGrid>
        </ResponsiveGroup>
      </EditorialSection>

      <EditorialSection labelledBy="status-heading">
        <SectionHeading
          eyebrow="Meaning, never decoration"
          headingId="status-heading"
          title="Semantic statuses carry text and distinct markers."
          summary="The vocabulary below demonstrates the six accepted meanings. Cleared and review-attention are explicitly vocabulary specimens; neither is asserted as the outcome of PR #482."
        />
        <MetadataGrid label="Semantic status vocabulary specimens" columns={3}>
          <MetadataItem label="Selection and evidence">
            <SemanticStatus tone="observed" label="Observed evidence" detail="ev_retry_path" />
          </MetadataItem>
          <MetadataItem label="Tests and missing proof">
            <SemanticStatus tone="warning" label="Tests required" detail="Missing proof remains" />
          </MetadataItem>
          <MetadataItem label="Review attention">
            <SemanticStatus tone="review" label="Review attention" detail="Vocabulary specimen" />
          </MetadataItem>
          <MetadataItem label="Blocking and failure">
            <SemanticStatus tone="blocking" label="Blocking" detail="2 requirements" />
          </MetadataItem>
          <MetadataItem label="Cleared">
            <SemanticStatus tone="success" label="Cleared" detail="Vocabulary specimen only" />
          </MetadataItem>
          <MetadataItem label="Model provenance">
            <SemanticStatus tone="model" label="Model assisted" detail="Provenance identified" />
          </MetadataItem>
        </MetadataGrid>
      </EditorialSection>

      <EditorialSection labelledBy="surface-heading">
        <SectionHeading
          eyebrow="Technical presentation"
          headingId="surface-heading"
          title="Neutral plates stage opaque product frames."
          summary="The plate is restrained and non-semantic. The inset frame remains white, bordered and readable without imagery, animation or internal scrolling."
        />
        <Divider />
        <NeutralPlate label="Canonical PR 482 product excerpt presentation">
          <ProductFrame
            eyebrow="Read-only sample"
            headingId="product-frame-heading"
            title={`${CANONICAL_REVIEW.repository} · ${CANONICAL_REVIEW.pullRequestLabel}`}
          >
            <ResponsiveGroup>
              <TechnicalExcerpt label="Structured review excerpt">{excerpt}</TechnicalExcerpt>
              <RelationshipGroup
                headingId="evidence-relationship-heading"
                title="Evidence relationship"
                items={PRIMARY_EVIDENCE.map((evidence) => ({
                  label: <Identifier>{evidence.recordKey}</Identifier>,
                  value: evidence.title,
                  relation: "supports finding",
                }))}
              />
            </ResponsiveGroup>
          </ProductFrame>
        </NeutralPlate>
      </EditorialSection>

      <EditorialSection id="structured-record" labelledBy="record-section-heading">
        <ResponsiveGroup reverse>
          <ProseColumn>
            <SectionHeading
              eyebrow="Structured record"
              headingId="record-section-heading"
              title="Identifiers and values retain explicit relationships."
              summary="The manifest specimen is a labelled record, not a decorative dashboard. Every value remains visible when the layout stacks."
            />
            <Copy variant="technical">
              The private laboratory restates no customer, metric, integration or availability
              claim. Values come from the accepted fixed sample only.
            </Copy>
          </ProseColumn>
          <NeutralPlate label="Review manifest specimen">
            <StructuredRecord
              headingId="manifest-heading"
              title="Review manifest"
              items={[
                { label: "Repository", value: <Identifier>{CANONICAL_REVIEW.repository}</Identifier> },
                { label: "Pull request", value: <Identifier>{CANONICAL_REVIEW.pullRequestLabel}</Identifier> },
                { label: "Branch", value: <Identifier>{CANONICAL_REVIEW.branch}</Identifier> },
                { label: "Recommendation", value: CANONICAL_REVIEW.recommendation },
                { label: "Requirements", value: CANONICAL_REVIEW.requirementsSummary },
                { label: "Human Decision", value: CANONICAL_REVIEW.humanDecision },
              ]}
            />
            <VisuallyHidden>
              End of the private design-system structured-record specimen.
            </VisuallyHidden>
          </NeutralPlate>
        </ResponsiveGroup>
      </EditorialSection>
    </div>
  );
}
