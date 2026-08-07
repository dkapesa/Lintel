import type { Metadata } from "next";
import {
  Action,
  ActionGroup,
  Copy,
  Divider,
  EditorialSection,
  Identifier,
  MetadataGrid,
  MetadataItem,
  ProseColumn,
  RelationshipGroup,
  ResponsiveGroup,
  RouteIntroduction,
  SectionHeading,
  SemanticStatus,
  StructuredRecord,
  TechnicalExcerpt,
} from "../../_public/primitives";
import { buildPublicMetadata } from "../../_public/metadata";
import {
  AVAILABILITY_CONTENT,
  CHANGE_PASSPORT_CONTENT,
  DETERMINISTIC_BASELINE_CONTENT,
  GITHUB_APP_CONTENT,
  HUMAN_DECISION_CONTENT,
  INTEGRATION_STATUS_CONTENT,
  LIMITATIONS_CONTENT,
  MODEL_PROVENANCE_CONTENT,
  RUN_BOUNDARIES_CONTENT,
  RUN_PROVENANCE_CONTENT,
  SUBMITTED_CONTENT,
  TRUST_HANDOFF,
  TRUST_INTRODUCTION,
  TRUST_METADATA,
} from "./trust-content";
import { CanonicalRunProvenanceScene } from "./scenes/CanonicalRunProvenanceScene";
import { IntegrationStatusScene } from "./scenes/IntegrationStatusScene";
import styles from "./trust.module.css";

export const metadata: Metadata = buildPublicMetadata("trust", TRUST_METADATA);

function StatementList({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <ol className={styles.statementList} aria-label={label}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ol>
  );
}

export default function TrustPage() {
  return (
    <>
      <EditorialSection labelledBy="trust-title" opening>
        <RouteIntroduction
          eyebrow={TRUST_INTRODUCTION.eyebrow}
          title={TRUST_INTRODUCTION.title}
          summary={TRUST_INTRODUCTION.lead}
          headingId="trust-title"
          actions={
            <ActionGroup>
              <Action href={TRUST_INTRODUCTION.primaryAction.href}>
                {TRUST_INTRODUCTION.primaryAction.label}
              </Action>
              <Action href={TRUST_INTRODUCTION.secondaryAction.href} variant="secondary">
                {TRUST_INTRODUCTION.secondaryAction.label}
              </Action>
            </ActionGroup>
          }
        />
      </EditorialSection>

      <EditorialSection labelledBy="trust-availability-title" id="availability">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="trust-availability-title" title={AVAILABILITY_CONTENT.title} />
          <div className={styles.availabilityCopy}>
            <Copy variant="supporting">{AVAILABILITY_CONTENT.statement}</Copy>
            {AVAILABILITY_CONTENT.paragraphs.map((paragraph) => (
              <Copy key={paragraph}>{paragraph}</Copy>
            ))}
          </div>
          <MetadataGrid label="Availability facts" columns={4}>
            {AVAILABILITY_CONTENT.facts.map((fact) => (
              <MetadataItem label={fact.label} key={fact.label}>{fact.value}</MetadataItem>
            ))}
          </MetadataGrid>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-run-boundaries-title" id="run-boundaries">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="trust-run-boundaries-title"
            title={RUN_BOUNDARIES_CONTENT.title}
            summary={RUN_BOUNDARIES_CONTENT.lead}
          />
          <div className={styles.recordGrid}>
            {RUN_BOUNDARIES_CONTENT.records.map((record, index) => (
              <StructuredRecord
                key={record.title}
                headingId={`trust-run-boundary-${index + 1}`}
                title={record.title}
                items={[
                  { label: "Runs", value: record.runs },
                  { label: "External destination", value: <Identifier>{record.destination}</Identifier> },
                  { label: "Entered when", value: record.condition },
                ]}
              />
            ))}
          </div>
          <div className={styles.boundaryStack}>
            <Copy variant="technical">{RUN_BOUNDARIES_CONTENT.publicSiteBoundary}</Copy>
            <Copy variant="technical">{RUN_BOUNDARIES_CONTENT.externalWriteBoundary}</Copy>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-deterministic-title" id="deterministic-baseline">
        <ResponsiveGroup>
          <ProseColumn>
            <SectionHeading
              headingId="trust-deterministic-title"
              title={DETERMINISTIC_BASELINE_CONTENT.title}
            />
            <Copy>{DETERMINISTIC_BASELINE_CONTENT.body}</Copy>
            <Copy variant="technical">{DETERMINISTIC_BASELINE_CONTENT.limitation}</Copy>
          </ProseColumn>
          <StructuredRecord
            headingId="trust-deterministic-vocabulary"
            title="Recommendation vocabulary"
            items={DETERMINISTIC_BASELINE_CONTENT.recommendations.map((recommendation) => ({
              label: "Recommendation",
              value: <Identifier>{recommendation}</Identifier>,
            }))}
          />
        </ResponsiveGroup>
      </EditorialSection>

      <EditorialSection labelledBy="trust-model-provenance-title" id="model-provenance">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="trust-model-provenance-title"
            title={MODEL_PROVENANCE_CONTENT.title}
          />
          <StatementList items={MODEL_PROVENANCE_CONTENT.statements} label="Model provenance statements" />
          <div className={styles.statusPair} aria-label="Analysis provenance labels">
            {MODEL_PROVENANCE_CONTENT.statuses.map((status) => (
              <SemanticStatus
                key={status.label}
                tone={status.tone}
                label={status.label}
                detail={status.detail}
              />
            ))}
          </div>
          <MetadataGrid label="Model provenance facts" columns={4}>
            {MODEL_PROVENANCE_CONTENT.facts.map((fact) => (
              <MetadataItem label={fact.label} key={fact.label}>{fact.value}</MetadataItem>
            ))}
          </MetadataGrid>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-run-provenance-title" id="run-provenance">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="trust-run-provenance-title"
            title={RUN_PROVENANCE_CONTENT.title}
            summary={RUN_PROVENANCE_CONTENT.body}
          />
          <CanonicalRunProvenanceScene />
          <Copy variant="technical">{RUN_PROVENANCE_CONTENT.fingerprintBoundary}</Copy>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-submitted-content-title" id="submitted-content">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="trust-submitted-content-title" title={SUBMITTED_CONTENT.title} />
          <div className={styles.threeColumnRecords}>
            {[SUBMITTED_CONTENT.sent, SUBMITTED_CONTENT.stored, SUBMITTED_CONTENT.notPersisted].map((group, index) => (
              <StructuredRecord
                key={group.title}
                headingId={`trust-submitted-content-${index + 1}`}
                title={group.title}
                items={group.items.map((item, itemIndex) => ({
                  label: String(itemIndex + 1).padStart(2, "0"),
                  value: item,
                }))}
              />
            ))}
          </div>
          <div className={styles.boundaryStack}>
            <Copy variant="technical">{SUBMITTED_CONTENT.sizeBoundary}</Copy>
            <Copy variant="technical">{SUBMITTED_CONTENT.limitation}</Copy>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-github-app-title" id="github-app">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="trust-github-app-title"
            title={GITHUB_APP_CONTENT.title}
            summary={GITHUB_APP_CONTENT.lead}
          />
          <div className={styles.recordGrid}>
            {GITHUB_APP_CONTENT.records.map((record, index) => (
              <StructuredRecord
                key={record.title}
                headingId={`trust-github-app-record-${index + 1}`}
                title={record.title}
                items={[{ label: "Boundary", value: record.statement }]}
              />
            ))}
          </div>
          <Divider />
          <div className={styles.githubDetails}>
            <div className={styles.boundaryStack}>
              <Copy variant="technical">{GITHUB_APP_CONTENT.allowlist}</Copy>
              <Copy variant="technical">{GITHUB_APP_CONTENT.enableGate}</Copy>
              <Copy variant="technical">{GITHUB_APP_CONTENT.diffBound}</Copy>
              <Copy variant="technical">{GITHUB_APP_CONTENT.errorBoundary}</Copy>
            </div>
            <TechnicalExcerpt label="GitHub App environment configuration">
              {GITHUB_APP_CONTENT.environmentVariables}
            </TechnicalExcerpt>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-integrations-title" id="integrations">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="trust-integrations-title"
            title={INTEGRATION_STATUS_CONTENT.title}
            summary={INTEGRATION_STATUS_CONTENT.body}
          />
          <IntegrationStatusScene />
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-change-passport-title" id="change-passport">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="trust-change-passport-title"
            title={CHANGE_PASSPORT_CONTENT.title}
          />
          <StatementList items={CHANGE_PASSPORT_CONTENT.statements} label="Change Passport boundaries" />
          <ResponsiveGroup>
            <RelationshipGroup
              headingId="trust-passport-relationship"
              title="Declaration and observation"
              items={CHANGE_PASSPORT_CONTENT.relationship}
            />
            <TechnicalExcerpt label={CHANGE_PASSPORT_CONTENT.excerptLabel}>
              {CHANGE_PASSPORT_CONTENT.excerpt}
            </TechnicalExcerpt>
          </ResponsiveGroup>
          <div className={styles.passportStates} aria-label="Change Passport declaration states">
            {CHANGE_PASSPORT_CONTENT.states.map((state) => (
              <SemanticStatus
                key={state.state}
                tone={state.tone}
                label={state.label}
                detail={state.detail}
              />
            ))}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-human-decision-title" id="human-decision">
        <div className={styles.sectionStack}>
          <SectionHeading
            headingId="trust-human-decision-title"
            title={HUMAN_DECISION_CONTENT.title}
          />
          <StructuredRecord
            headingId="trust-human-decision-boundaries"
            title="Recommendation and authority remain separate"
            items={HUMAN_DECISION_CONTENT.statements.map((statement, index) => ({
              label: String(index + 1).padStart(2, "0"),
              value: statement,
            }))}
          />
          <div className={styles.decisionState} aria-label="Canonical Human Decision state">
            {HUMAN_DECISION_CONTENT.currentState}
          </div>
          <Copy variant="technical">{HUMAN_DECISION_CONTENT.storageBoundary}</Copy>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-limitations-title" id="limitations">
        <div className={styles.sectionStack}>
          <SectionHeading headingId="trust-limitations-title" title={LIMITATIONS_CONTENT.title} />
          <ol className={styles.limitationsList}>
            {LIMITATIONS_CONTENT.items.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ol>
        </div>
      </EditorialSection>

      <EditorialSection labelledBy="trust-handoff-title" id="handoff">
        <div className={styles.handoff}>
          <SectionHeading headingId="trust-handoff-title" title={TRUST_HANDOFF.title} />
          <StructuredRecord
            headingId="trust-handoff-record"
            title={TRUST_HANDOFF.recordTitle}
            items={TRUST_HANDOFF.items.map((item) => ({
              label: item.label,
              value: <Identifier>{item.value}</Identifier>,
            }))}
          />
          <Copy variant="technical">{TRUST_HANDOFF.boundary}</Copy>
          <ActionGroup>
            <Action href={TRUST_HANDOFF.action.href}>{TRUST_HANDOFF.action.label}</Action>
          </ActionGroup>
        </div>
      </EditorialSection>
    </>
  );
}
