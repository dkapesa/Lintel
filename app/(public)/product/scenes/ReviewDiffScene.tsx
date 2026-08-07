import {
  Identifier,
  NeutralPlate,
  StructuredRecord,
} from "../../../_public/primitives";
import { READINESS_MOVEMENT_CONTENT } from "../product-content";
import styles from "../product.module.css";

export function ReviewDiffScene() {
  return (
    <NeutralPlate label="Structured Review Diff vocabulary">
      <StructuredRecord
        headingId="product-review-diff-scene"
        title="Review Diff"
        items={READINESS_MOVEMENT_CONTENT.diffObjectClasses.map((objectClass) => ({
          label: objectClass,
          value: (
            <span className={styles.diffVocabulary}>
              {READINESS_MOVEMENT_CONTENT.diffStatuses.map((status) => (
                <Identifier key={status}>{status}</Identifier>
              ))}
            </span>
          ),
        }))}
      />
    </NeutralPlate>
  );
}
