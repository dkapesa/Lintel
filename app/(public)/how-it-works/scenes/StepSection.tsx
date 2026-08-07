import type { ReactNode } from "react";
import {
  Copy,
  EditorialSection,
  SectionHeading,
} from "../../../_public/primitives";
import styles from "../how-it-works.module.css";

export function StepSection({
  index,
  title,
  body,
  children,
}: {
  index: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  const headingId = `how-step-${index}`;

  return (
    <li className={styles.stepItem}>
      <EditorialSection labelledBy={headingId}>
        <div className={styles.stepLayout}>
          <span className={styles.stepIndex} aria-label={`Step ${index}`}>
            {index}
          </span>
          <div className={styles.stepContent}>
            <SectionHeading headingId={headingId} title={title} />
            <Copy>{body}</Copy>
            <div className={styles.stepScene}>{children}</div>
          </div>
        </div>
      </EditorialSection>
    </li>
  );
}
