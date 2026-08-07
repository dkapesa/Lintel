import {
  Identifier,
  ProductFrame,
  SemanticStatus,
  TechnicalExcerpt,
} from "../../../_public/primitives";
import { PASSPORT_CONTENT } from "../product-content";
import styles from "../product.module.css";

export function ChangePassportBoundaryScene() {
  return (
    <ProductFrame
      headingId="product-passport-boundary-scene"
      title="Agent Change Passport"
      eyebrow="Declared context · independent observation"
    >
      <div className={styles.passportAbsent}>
        <SemanticStatus
          tone="review"
          label={`Change Passport completeness: ${PASSPORT_CONTENT.canonical.completeness}`}
          detail={PASSPORT_CONTENT.canonical.statement}
        />
        <p>{PASSPORT_CONTENT.canonical.concernBoundary}</p>
        <ul>
          {PASSPORT_CONTENT.canonical.concerns.map((concern) => (
            <li key={concern}>
              <Identifier>{concern}</Identifier>
              <span className={styles.reviewState}>observed but undeclared</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.passportExplanation} aria-label="Supported Change Passport vocabulary">
        <p className={styles.explanatoryLabel}>{PASSPORT_CONTENT.exampleLabel}</p>
        <TechnicalExcerpt
          label={PASSPORT_CONTENT.exampleLabel}
        >
          {PASSPORT_CONTENT.exampleExcerpt}
        </TechnicalExcerpt>
        <div className={styles.passportStates}>
          {PASSPORT_CONTENT.vocabulary.map((item) => (
            <div
              className={
                item.state === "unverified" || item.state === "observed but undeclared"
                  ? styles.passportStateReview
                  : styles.passportState
              }
              key={item.label}
            >
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </ProductFrame>
  );
}
