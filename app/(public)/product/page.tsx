import type { Metadata } from "next";
import {
  Action,
  ActionGroup,
  Copy,
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
} from "../../_public/primitives";
import { buildPublicMetadata } from "../../_public/metadata";
import {
  ANALYSIS_SOURCE_CONTENT,
  AVAILABILITY_CONTENT,
  CHANGE_SUMMARY,
  DECISION_CONTENT,
  EVIDENCE_CONTENT,
  EVIDENCE_MODEL_CONTENT,
  GITHUB_WORKFLOW_CONTENT,
  MISSING_PROOF_CONTENT,
  PASSPORT_CONTENT,
  PRODUCT_CLOSING,
  PRODUCT_INTRODUCTION,
  PRODUCT_METADATA,
  READINESS_CONTENT,
  READINESS_MOVEMENT_CONTENT,
  REVIEW_QUEUE_CONTENT,
} from "./product-content";
import { ChangePassportBoundaryScene } from "./scenes/ChangePassportBoundaryScene";
import { ReadinessDeltaScene } from "./scenes/ReadinessDeltaScene";
import { ReviewDiffScene } from "./scenes/ReviewDiffScene";
import { ReviewQueueScene } from "./scenes/ReviewQueueScene";
import styles from "./product.module.css";

export const metadata: Metadata = buildPublicMetadata("product", PRODUCT_METADATA);

function FilePath({ value }: { value: string }) {
  const tail = value.split("/").at(-1) ?? value;

  return (
    <Identifier accessibleName={value}>
      <span className={styles.pathFull}>{value}</span>
      <span className={styles.pathShort} aria-hidden="true">…/{tail}</span>
    </Identifier>
  );
}

export default function ProductPage() {
  return (
    <>
      <EditorialSection labelledBy="product-title" opening>
        <RouteIntroduction
          eyebrow={PRODUCT_INTRODUCTION.eyebrow}
          title={PRODUCT_INTRODUCTION.title}
          summary={PRODUCT_INTRODUCTION.lead}
          headingId="product-title"
          actions={
            <ActionGroup>
              <Action href={PRODUCT_INTRODUCTION.primaryAction.href}>
                {PRODUCT_INTRODUCTION.primaryAction.label}
              </Action>
              <Action href={PRODUCT_INTRODUCTION.secondaryAction.href} variant="secondary">
                {PRODUCT_INTRODUCTION.secondaryAction.label}
              </Action>
            </ActionGroup>
          }
        />
      </EditorialSection>

      <EditorialSection labelledBy="product-analysis-title">
        <ResponsiveGroup>
          <ProseColumn>
            <SectionHeading
              headingId="product-analysis-title"
              title={ANALYSIS_SOURCE_CONTENT.title}
            />
            <Copy>{ANALYSIS_SOURCE_CONTENT.body}</Copy>
            <Copy variant="technical">{ANALYSIS_SOURCE_CONTENT.limitation}</Copy>
            <ActionGroup>
              <Action href={ANALYSIS_SOURCE_CONTENT.trustPointer.href} variant="quiet">
                {ANALYSIS_SOURCE_CONTENT.trustPointer.label}
              </Action>
            </ActionGroup>
          </ProseColumn>
          <div className={styles.analysisSources} aria-label="Analysis source vocabulary">
            <SemanticStatus
              tone="observed"
              label={ANALYSIS_SOURCE_CONTENT.sources[0].label}
              detail={ANALYSIS_SOURCE_CONTENT.sources[0].detail}
            />
            <SemanticStatus
              tone="model"
              label={ANALYSIS_SOURCE_CONTENT.sources[1].label}
              detail={ANALYSIS_SOURCE_CONTENT.sources[1].detail}
            />
          </div>
        </ResponsiveGroup>
      </EditorialSection>

      <EditorialSection labelledBy="product-record-title">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="product-record-title" title={CHANGE_SUMMARY.title} />
          <ProductFrame
            headingId="product-change-summary-scene"
            title="PR #482 change summary"
            eyebrow="Read-only sample"
          >
            <MetadataGrid label="Canonical change facts" columns={3}>
              {CHANGE_SUMMARY.facts.map((fact) => (
                <MetadataItem label={fact.label} key={fact.label}>
                  {fact.identifier ? <Identifier>{fact.value}</Identifier> : fact.value}
                </MetadataItem>
              ))}
            </MetadataGrid>
            <p className={styles.caption}>{CHANGE_SUMMARY.caption}</p>
          </ProductFrame>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="product-evidence-model-title">
        <ResponsiveGroup reverse>
          <ProseColumn>
            <SectionHeading
              headingId="product-evidence-model-title"
              title={EVIDENCE_MODEL_CONTENT.title}
            />
            <Copy variant="technical">{EVIDENCE_MODEL_CONTENT.boundary}</Copy>
          </ProseColumn>
          <RelationshipGroup
            headingId="product-evidence-chain-scene"
            title="One accountable chain"
            items={EVIDENCE_MODEL_CONTENT.relations.map((item) => ({
              label: item.label,
              value: <Identifier>{item.value}</Identifier>,
              relation: item.relation,
            }))}
          />
        </ResponsiveGroup>
      </EditorialSection>

      <EditorialSection labelledBy="product-queue-title">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="product-queue-title"
            title={REVIEW_QUEUE_CONTENT.title}
            summary={REVIEW_QUEUE_CONTENT.body}
          />
          <ReviewQueueScene />
          <Copy variant="technical">{REVIEW_QUEUE_CONTENT.boundary}</Copy>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="product-evidence-title">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="product-evidence-title" title={EVIDENCE_CONTENT.title} />
          <ProductFrame
            headingId="product-evidence-scene"
            title={EVIDENCE_CONTENT.finding.title}
            eyebrow={`${EVIDENCE_CONTENT.finding.severity} · ${EVIDENCE_CONTENT.finding.category} · ${EVIDENCE_CONTENT.finding.provenance}`}
          >
            <div className={styles.evidenceFrameBody}>
              <StructuredRecord
                headingId="product-finding-record"
                title={EVIDENCE_CONTENT.finding.recordKey}
                items={[
                  { label: "Statement", value: EVIDENCE_CONTENT.finding.statement },
                  { label: "Location", value: <FilePath value={EVIDENCE_CONTENT.finding.file} /> },
                ]}
              />
              {EVIDENCE_CONTENT.evidence.map((evidence) => (
                <StructuredRecord
                  key={evidence.recordKey}
                  headingId={`product-${evidence.recordKey}`}
                  title={evidence.recordKey}
                  items={[
                    { label: "Statement", value: evidence.statement },
                    { label: "Source", value: <FilePath value={evidence.source} /> },
                    { label: "Status", value: evidence.status },
                  ]}
                />
              ))}
              <ul className={styles.evidenceClassList} aria-label="Evidence classes in provenance order">
                {EVIDENCE_CONTENT.evidenceClassLabels.map((label, index) => (
                  <li key={EVIDENCE_CONTENT.evidenceClasses[index]}>{label}</li>
                ))}
              </ul>
            </div>
          </ProductFrame>
          <Copy variant="technical">{EVIDENCE_CONTENT.boundary}</Copy>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="product-missing-proof-title">
        <ResponsiveGroup>
          <ProseColumn>
            <SectionHeading
              headingId="product-missing-proof-title"
              title={MISSING_PROOF_CONTENT.title}
            />
            <Copy variant="technical">{MISSING_PROOF_CONTENT.boundary}</Copy>
          </ProseColumn>
          <RelationshipGroup
            headingId="product-missing-proof-scene"
            title="Proof state to Requirement"
            items={MISSING_PROOF_CONTENT.records.map((record) => ({
              label: `${record.status} · ${record.recordKey}`,
              value: <Identifier>{record.affectsRequirement.recordKey}</Identifier>,
              relation: record.affectsRequirement.state,
            }))}
          />
        </ResponsiveGroup>
      </EditorialSection>

      <EditorialSection labelledBy="product-readiness-title">
        <ResponsiveGroup reverse>
          <ProseColumn>
            <SectionHeading headingId="product-readiness-title" title={READINESS_CONTENT.title} />
            <Copy variant="technical">{READINESS_CONTENT.boundary}</Copy>
          </ProseColumn>
          <NeutralPlate label="Readiness record">
            <div className={styles.recordStack}>
              <SemanticStatus tone="blocking" label={READINESS_CONTENT.record.headline} />
              <StructuredRecord
                headingId="product-readiness-record"
                title="Current Readiness"
                items={[
                  { label: "Blockers", value: READINESS_CONTENT.record.blockers },
                  {
                    label: "Missing or unverified",
                    value: READINESS_CONTENT.record.missingOrUnverified,
                  },
                  { label: "Stale", value: READINESS_CONTENT.record.stale },
                  { label: "Recommendation", value: READINESS_CONTENT.recommendation },
                ]}
              />
            </div>
          </NeutralPlate>
        </ResponsiveGroup>
      </EditorialSection>

      <EditorialSection labelledBy="product-movement-title">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="product-movement-title"
            title={READINESS_MOVEMENT_CONTENT.title}
          />
          <div className={styles.sceneStack}>
            <ReadinessDeltaScene />
            <ReviewDiffScene />
          </div>
          <div className={styles.boundaryStack}>
            <p>{READINESS_MOVEMENT_CONTENT.persistenceBoundary}</p>
            <p>{READINESS_MOVEMENT_CONTENT.diffBoundary}</p>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="product-passport-title">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="product-passport-title" title={PASSPORT_CONTENT.title} />
          <Copy>{PASSPORT_CONTENT.body}</Copy>
          <ChangePassportBoundaryScene />
          <div className={styles.boundaryStack}>
            <p>{PASSPORT_CONTENT.optionalBoundary}</p>
            <p>{PASSPORT_CONTENT.unverifiedBoundary}</p>
            <p>{PASSPORT_CONTENT.scoringBoundary}</p>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="product-decision-title">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="product-decision-title" title={DECISION_CONTENT.title} />
          <Copy>{DECISION_CONTENT.body}</Copy>
          <StructuredRecord
            headingId="product-decision-outcomes"
            title="Seven Human Decision outcomes · none selected"
            items={DECISION_CONTENT.outcomes.map((outcome) => ({
              label: outcome.label,
              value: outcome.meaning,
            }))}
          />
          <div className={styles.boundaryStack}>
            <p>{DECISION_CONTENT.currentState}</p>
            <p>{DECISION_CONTENT.headBoundary}</p>
            <p>{DECISION_CONTENT.storageBoundary}</p>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="product-workflow-title">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="product-workflow-title" title={GITHUB_WORKFLOW_CONTENT.title} />
          <NeutralPlate label="GitHub App delivery workflow">
            <StructuredRecord
              headingId="product-github-workflow"
              title="Verified webhook to marked comment"
              items={GITHUB_WORKFLOW_CONTENT.steps.map((step, index) => ({
                label: `Step ${String(index + 1).padStart(2, "0")}`,
                value: step,
              }))}
            />
          </NeutralPlate>
          <div className={styles.boundaryStack}>
            {GITHUB_WORKFLOW_CONTENT.boundaries.map((boundary) => (
              <p key={boundary}>{boundary}</p>
            ))}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="product-availability-title">
        <ProseColumn>
          <SectionHeading headingId="product-availability-title" title={AVAILABILITY_CONTENT.title} />
          <div className={styles.availabilitySentences}>
            {AVAILABILITY_CONTENT.sentences.map((sentence) => (
              <p key={sentence}>{sentence}</p>
            ))}
          </div>
          <ActionGroup>
            <Action href={AVAILABILITY_CONTENT.trustPointer.href} variant="quiet">
              {AVAILABILITY_CONTENT.trustPointer.label}
            </Action>
          </ActionGroup>
        </ProseColumn>
      </EditorialSection>

      <EditorialSection labelledBy="product-closing-title">
        <SectionHeading headingId="product-closing-title" title={PRODUCT_CLOSING.title} />
        <Copy>{PRODUCT_CLOSING.body}</Copy>
        <ActionGroup>
          <Action href={PRODUCT_CLOSING.action.href}>{PRODUCT_CLOSING.action.label}</Action>
        </ActionGroup>
      </EditorialSection>
    </>
  );
}
