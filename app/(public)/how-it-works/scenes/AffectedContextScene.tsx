import {
  Identifier,
  NeutralPlate,
  RelationshipGroup,
  StructuredRecord,
} from "../../../_public/primitives";
import { STEP_06 } from "../how-it-works-content";
import styles from "../how-it-works.module.css";

export function AffectedContextScene() {
  const affectedLabels = ["Redemption write path", "Partner client", "Public API layer"];

  return (
    <NeutralPlate label="Requirement and affected context">
      <div className={styles.affectedContext}>
        <StructuredRecord
          headingId="how-step-06-requirement"
          title={STEP_06.requirement.recordKey}
          items={[
            { label: "State", value: `${STEP_06.requirement.importance} · ${STEP_06.requirement.status}` },
            { label: "Requirement", value: STEP_06.requirement.statement },
            { label: "Evidence required", value: STEP_06.requirement.evidenceRequired },
          ]}
        />
        <RelationshipGroup
          headingId="how-step-06-context"
          title="Affected context follows"
          items={STEP_06.affectedContext.concerns.map((concern, index) => ({
            label: affectedLabels[index],
            value: concern,
            relation: <Identifier>context</Identifier>,
          }))}
        />
      </div>
    </NeutralPlate>
  );
}
