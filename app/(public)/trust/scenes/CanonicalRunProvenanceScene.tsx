import {
  Identifier,
  MetadataGrid,
  MetadataItem,
  NeutralPlate,
  StructuredRecord,
} from "../../../_public/primitives";
import { RUN_PROVENANCE_CONTENT } from "../trust-content";
import styles from "../trust.module.css";

export function CanonicalRunProvenanceScene() {
  return (
    <NeutralPlate label="Canonical run provenance record">
      <div className={styles.sceneStack}>
        <MetadataGrid label="Canonical review context" columns={4}>
          {RUN_PROVENANCE_CONTENT.canonicalFacts.map((fact) => (
            <MetadataItem label={fact.label} key={fact.label}>
              <Identifier>{fact.value}</Identifier>
            </MetadataItem>
          ))}
        </MetadataGrid>
        <StructuredRecord
          headingId="trust-run-manifest-fields"
          title="Manifest fields"
          items={RUN_PROVENANCE_CONTENT.manifestFields.map((field) => ({
            label: field.label,
            value: <Identifier>{field.value}</Identifier>,
          }))}
        />
        <StructuredRecord
          headingId="trust-reproducibility-classifications"
          title="Eight reproducibility classifications"
          items={RUN_PROVENANCE_CONTENT.classifications.map((classification) => ({
            label: <Identifier>{classification.value}</Identifier>,
            value: classification.meaning,
          }))}
        />
      </div>
    </NeutralPlate>
  );
}
