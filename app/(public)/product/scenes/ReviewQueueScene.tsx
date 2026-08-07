import {
  Identifier,
  NeutralPlate,
  StructuredRecord,
} from "../../../_public/primitives";
import { REVIEW_QUEUE_CONTENT } from "../product-content";
import styles from "../product.module.css";

export function ReviewQueueScene() {
  return (
    <NeutralPlate label="Inert review queue context">
      <div className={styles.queueRows}>
        {REVIEW_QUEUE_CONTENT.rows.map((review) => (
          <StructuredRecord
            key={review.reviewKey}
            headingId={`queue-${review.reviewKey}`}
            title={review.title}
            items={[
              { label: "Pull request", value: <Identifier>{review.pullRequestLabel}</Identifier> },
              { label: "Repository", value: <Identifier>{review.repository}</Identifier> },
              { label: "Recommendation", value: review.recommendation },
              { label: "Risk", value: <Identifier>{review.riskLabel}</Identifier> },
            ]}
          />
        ))}
      </div>
    </NeutralPlate>
  );
}
