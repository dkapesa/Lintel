import {
  Identifier,
  MetadataGrid,
  MetadataItem,
  ProductFrame,
  SemanticStatus,
} from "../../../_public/primitives";
import { READINESS_MOVEMENT_CONTENT } from "../product-content";

export function ReadinessDeltaScene() {
  const { delta } = READINESS_MOVEMENT_CONTENT;

  return (
    <ProductFrame
      headingId="product-readiness-delta-scene"
      title="Readiness Delta"
      eyebrow="GitHub App persistence path"
    >
      <SemanticStatus
        tone="observed"
        label={delta.classification}
        detail="Movement classification"
      />
      <MetadataGrid label="Readiness Delta facts" columns={4}>
        <MetadataItem label="Previous score">
          <Identifier>{delta.previousScore}</Identifier>
        </MetadataItem>
        <MetadataItem label="Current score">
          <Identifier>{delta.currentScore}</Identifier>
        </MetadataItem>
        <MetadataItem label="Movement">
          <Identifier>−{Math.abs(delta.scoreChange)}</Identifier>
        </MetadataItem>
        <MetadataItem label="Requirement movement">
          {delta.cleared}; {delta.stale.toLowerCase()}.
        </MetadataItem>
      </MetadataGrid>
    </ProductFrame>
  );
}
