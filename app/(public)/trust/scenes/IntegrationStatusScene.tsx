import {
  NeutralPlate,
  SemanticStatus,
  StructuredRecord,
} from "../../../_public/primitives";
import { INTEGRATION_STATUS_CONTENT } from "../trust-content";

export function IntegrationStatusScene() {
  return (
    <NeutralPlate label="Integration status vocabulary">
      <StructuredRecord
        headingId="trust-integration-status-records"
        title="Current-state vocabulary"
        items={INTEGRATION_STATUS_CONTENT.records.map((record) => ({
          label: record.status,
          value: (
            <SemanticStatus
              tone={record.tone}
              label={record.status}
              detail={record.detail}
            />
          ),
        }))}
      />
    </NeutralPlate>
  );
}
