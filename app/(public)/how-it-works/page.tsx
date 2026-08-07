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
  RelationshipGroup,
  RouteIntroduction,
  SectionHeading,
  SemanticStatus,
  StructuredRecord,
} from "../../_public/primitives";
import { buildPublicMetadata } from "../../_public/metadata";
import {
  HOW_IT_WORKS_CLOSING,
  HOW_IT_WORKS_INTRODUCTION,
  HOW_IT_WORKS_METADATA,
  STEP_01,
  STEP_02,
  STEP_03,
  STEP_04,
  STEP_05,
  STEP_06,
  STEP_07,
  STEP_08,
  STEP_09,
} from "./how-it-works-content";
import { AffectedContextScene } from "./scenes/AffectedContextScene";
import { FocusedContextScene } from "./scenes/FocusedContextScene";
import { StepSection } from "./scenes/StepSection";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = buildPublicMetadata(
  "how-it-works",
  HOW_IT_WORKS_METADATA,
);

function FilePath({ value }: { value: string }) {
  const tail = value.split("/").at(-1) ?? value;

  return (
    <Identifier accessibleName={value}>
      <span className={styles.pathFull}>{value}</span>
      <span className={styles.pathShort} aria-hidden="true">…/{tail}</span>
    </Identifier>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <EditorialSection labelledBy="how-it-works-title" opening>
        <RouteIntroduction
          eyebrow={HOW_IT_WORKS_INTRODUCTION.eyebrow}
          title={HOW_IT_WORKS_INTRODUCTION.title}
          summary={HOW_IT_WORKS_INTRODUCTION.lead}
          headingId="how-it-works-title"
          actions={
            <ActionGroup>
              <Action href={HOW_IT_WORKS_INTRODUCTION.primaryAction.href}>
                {HOW_IT_WORKS_INTRODUCTION.primaryAction.label}
              </Action>
              <Action href={HOW_IT_WORKS_INTRODUCTION.secondaryAction.href} variant="secondary">
                {HOW_IT_WORKS_INTRODUCTION.secondaryAction.label}
              </Action>
            </ActionGroup>
          }
        />
      </EditorialSection>

      <ol className={styles.steps} aria-label="How a change becomes a Human Decision">
        <StepSection index={STEP_01.index} title={STEP_01.title} body={STEP_01.body}>
          <div className={styles.sceneStack}>
            <MetadataGrid label="Genuine change entry points" columns={4}>
              {STEP_01.entryPoints.map((entryPoint) => (
                <MetadataItem label="Entry point" key={entryPoint}>
                  {entryPoint}
                </MetadataItem>
              ))}
            </MetadataGrid>
            <StructuredRecord
              headingId="how-step-01-change"
              title={STEP_01.change.title}
              items={[
                { label: "Repository", value: <Identifier>{STEP_01.change.repository}</Identifier> },
                { label: "Pull request", value: <Identifier>{STEP_01.change.pullRequestLabel}</Identifier> },
                { label: "Branch", value: <Identifier>{STEP_01.change.branch}</Identifier> },
                { label: "Head", value: <Identifier>{STEP_01.change.headSha}</Identifier> },
              ]}
            />
            <ul className={styles.fileList} aria-label="Affected files">
              {STEP_01.files.map((file) => (
                <li key={file.path}>
                  <Identifier>{file.path}</Identifier>
                  <span className={styles.fileFacts}>
                    +{file.additions} · −{file.deletions} · {file.risk}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.sceneCaption}>{STEP_01.boundary}</p>
          </div>
        </StepSection>

        <StepSection index={STEP_02.index} title={STEP_02.title} body={STEP_02.body}>
          <StructuredRecord
            headingId="how-step-02-analysis"
            title="Analysis path"
            items={STEP_02.stages.map((stage, index) => ({
              label: String(index + 1).padStart(2, "0"),
              value: stage,
            }))}
          />
          <div className={styles.boundaryStack}>
            <p>{STEP_02.passportBoundary}</p>
          </div>
        </StepSection>

        <StepSection index={STEP_03.index} title={STEP_03.title} body={STEP_03.body}>
          <FocusedContextScene />
          <div className={styles.boundaryStack}>
            <p>{STEP_03.boundary}</p>
          </div>
        </StepSection>

        <StepSection index={STEP_04.index} title={STEP_04.title} body={STEP_04.body}>
          <div className={styles.sceneStack}>
            {STEP_04.evidence.map((evidence) => (
              <StructuredRecord
                key={evidence.recordKey}
                headingId={`how-step-04-${evidence.recordKey}`}
                title={evidence.recordKey}
                items={[
                  { label: "Statement", value: evidence.statement },
                  { label: "Source", value: <FilePath value={evidence.source} /> },
                  { label: "Status", value: evidence.status },
                ]}
              />
            ))}
          </div>
          <div className={styles.boundaryStack}>
            <p>{STEP_04.boundary}</p>
          </div>
        </StepSection>

        <StepSection index={STEP_05.index} title={STEP_05.title} body={STEP_05.body}>
          <RelationshipGroup
            headingId="how-step-05-proof-states"
            title="Distinct proof states"
            items={STEP_05.records.map((record) => ({
              label: record.status,
              value: <Identifier>{record.recordKey}</Identifier>,
              relation: record.affectsRequirement.recordKey,
            }))}
          />
          <div className={styles.boundaryStack}>
            <p>{STEP_05.boundary}</p>
          </div>
        </StepSection>

        <StepSection index={STEP_06.index} title={STEP_06.title} body={STEP_06.body}>
          <AffectedContextScene />
        </StepSection>

        <StepSection index={STEP_07.index} title={STEP_07.title} body={STEP_07.body}>
          <ProductFrame
            headingId="how-step-07-readiness"
            title="Readiness movement"
            eyebrow="The only full product window on this route"
          >
            <SemanticStatus
              tone="blocking"
              label="Merge readiness blocked"
              detail={`Movement: ${STEP_07.readiness.classification}`}
            />
            <MetadataGrid label="Readiness movement facts" columns={4}>
              <MetadataItem label="Previous score">
                <Identifier>{STEP_07.readiness.previousScore}</Identifier>
              </MetadataItem>
              <MetadataItem label="Current score">
                <Identifier>{STEP_07.readiness.currentScore}</Identifier>
              </MetadataItem>
              <MetadataItem label="Movement">
                <Identifier>−{Math.abs(STEP_07.readiness.scoreChange)}</Identifier>
              </MetadataItem>
              <MetadataItem label="Current state">Blocked</MetadataItem>
            </MetadataGrid>
            <ul className={styles.classificationList} aria-label="Readiness movement classifications">
              {STEP_07.classifications.map((classification) => (
                <li
                  key={classification}
                  data-current={classification === STEP_07.readiness.classification ? "true" : undefined}
                >
                  {classification}
                </li>
              ))}
            </ul>
            <p className={styles.sceneCaption}>{STEP_07.readiness.note}</p>
          </ProductFrame>
          <div className={styles.boundaryStack}>
            {STEP_07.boundaries.map((boundary) => (
              <p key={boundary}>{boundary}</p>
            ))}
          </div>
        </StepSection>

        <StepSection index={STEP_08.index} title={STEP_08.title} body={STEP_08.body}>
          <StructuredRecord
            headingId="how-step-08-outcomes"
            title="Seven outcomes · none selected"
            items={STEP_08.outcomes.map((outcome) => ({
              label: outcome.label,
              value: outcome.meaning,
            }))}
          />
          <div className={styles.boundaryStack}>
            {STEP_08.boundaries.map((boundary) => (
              <p key={boundary}>{boundary}</p>
            ))}
          </div>
        </StepSection>

        <StepSection index={STEP_09.index} title={STEP_09.title} body={STEP_09.body}>
          <NeutralPlate label="Existing workflow handoffs">
            <StructuredRecord
              headingId="how-step-09-handoffs"
              title="Two genuine handoffs"
              items={STEP_09.handoffs.map((handoff, index) => ({
                label: `Handoff ${String(index + 1).padStart(2, "0")}`,
                value: handoff,
              }))}
            />
          </NeutralPlate>
          <div className={styles.boundaryStack}>
            {STEP_09.boundaries.map((boundary) => (
              <p key={boundary}>{boundary}</p>
            ))}
          </div>
        </StepSection>
      </ol>

      <EditorialSection labelledBy="how-it-works-closing-title">
        <div className={styles.closingContent}>
          <SectionHeading
            headingId="how-it-works-closing-title"
            title={HOW_IT_WORKS_CLOSING.title}
          />
          <Copy>{HOW_IT_WORKS_CLOSING.body}</Copy>
          <ActionGroup>
            <Action href={HOW_IT_WORKS_CLOSING.action.href}>
              {HOW_IT_WORKS_CLOSING.action.label}
            </Action>
          </ActionGroup>
        </div>
      </EditorialSection>
    </>
  );
}
