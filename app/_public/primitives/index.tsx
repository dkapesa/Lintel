import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./public-primitives.module.css";

type HeadingLevel = 2 | 3;
type ActionVariant = "primary" | "secondary" | "quiet";
type CopyVariant = "supporting" | "body" | "technical";
type StatusTone = "observed" | "warning" | "review" | "blocking" | "success" | "model";

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageWrap({ children }: { children: ReactNode }) {
  return <div className={styles.pageWrap}>{children}</div>;
}

export function EditorialSection({
  children,
  labelledBy,
  id,
  opening = false,
}: {
  children: ReactNode;
  labelledBy: string;
  id?: string;
  opening?: boolean;
}) {
  return (
    <section
      className={joinClasses(styles.editorialSection, opening && styles.openingSection)}
      aria-labelledby={labelledBy}
      id={id}
    >
      <PageWrap>{children}</PageWrap>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className={styles.eyebrow}>{children}</p>;
}

export function TechnicalLabel({ children }: { children: ReactNode }) {
  return <span className={styles.technicalLabel}>{children}</span>;
}

export function RouteIntroduction({
  eyebrow,
  title,
  summary,
  headingId,
  actions,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  summary: ReactNode;
  headingId: string;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.routeIntroduction}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 id={headingId} className={styles.routeTitle}>
        {title}
      </h1>
      <p className={styles.routeLead}>{summary}</p>
      {actions}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  summary,
  headingId,
  level = 2,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  summary?: ReactNode;
  headingId: string;
  level?: HeadingLevel;
}) {
  const Heading = level === 3 ? "h3" : "h2";

  return (
    <div className={styles.sectionHeading}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading id={headingId} className={level === 3 ? styles.subsectionTitle : styles.sectionTitle}>
        {title}
      </Heading>
      {summary ? <p className={styles.sectionSummary}>{summary}</p> : null}
    </div>
  );
}

export function Copy({ children, variant = "body" }: { children: ReactNode; variant?: CopyVariant }) {
  return <p className={joinClasses(styles.copy, styles[variant])}>{children}</p>;
}

export function ProseColumn({ children }: { children: ReactNode }) {
  return <div className={styles.proseColumn}>{children}</div>;
}

export function ResponsiveGroup({
  children,
  reverse = false,
}: {
  children: ReactNode;
  reverse?: boolean;
}) {
  return <div className={joinClasses(styles.responsiveGroup, reverse && styles.responsiveGroupReverse)}>{children}</div>;
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return <div className={styles.actionGroup}>{children}</div>;
}

export function Action({
  children,
  href,
  variant = "primary",
  accessibleName,
}: {
  children: ReactNode;
  href: string;
  variant?: ActionVariant;
  accessibleName?: string;
}) {
  return (
    <Link
      className={joinClasses(styles.action, styles[`action-${variant}`])}
      href={href}
      aria-label={accessibleName}
    >
      {children}
    </Link>
  );
}

export function MetadataGrid({
  children,
  label,
  columns = 3,
}: {
  children: ReactNode;
  label: string;
  columns?: 2 | 3 | 4;
}) {
  return (
    <dl className={joinClasses(styles.metadataGrid, styles[`metadataColumns${columns}`])} aria-label={label}>
      {children}
    </dl>
  );
}

export function MetadataItem({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.metadataItem}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function Identifier({
  children,
  accessibleName,
}: {
  children: ReactNode;
  accessibleName?: string;
}) {
  return (
    <code className={styles.identifier} aria-label={accessibleName}>
      {children}
    </code>
  );
}

const STATUS_MARKERS: Record<StatusTone, string> = {
  observed: "●",
  warning: "△",
  review: "◆",
  blocking: "×",
  success: "✓",
  model: "◇",
};

export function SemanticStatus({
  tone,
  label,
  detail,
}: {
  tone: StatusTone;
  label: string;
  detail?: ReactNode;
}) {
  return (
    <span className={joinClasses(styles.status, styles[`status-${tone}`])}>
      <span className={styles.statusMarker} aria-hidden="true">
        {STATUS_MARKERS[tone]}
      </span>
      <span className={styles.statusText}>{label}</span>
      {detail ? <span className={styles.statusDetail}>{detail}</span> : null}
    </span>
  );
}

export function NeutralPlate({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className={styles.neutralPlate} role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function ProductFrame({
  children,
  headingId,
  title,
  eyebrow = "Product excerpt",
}: {
  children: ReactNode;
  headingId: string;
  title: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <section className={styles.productFrame} aria-labelledby={headingId}>
      <div className={styles.productFrameHeader}>
        <TechnicalLabel>{eyebrow}</TechnicalLabel>
        <h3 id={headingId}>{title}</h3>
      </div>
      <div className={styles.productFrameBody}>{children}</div>
    </section>
  );
}

export function TechnicalExcerpt({
  children,
  label,
}: {
  children: string;
  label: string;
}) {
  return (
    <figure className={styles.technicalExcerpt}>
      <figcaption>{label}</figcaption>
      <pre aria-label={label}>
        <code>{children}</code>
      </pre>
    </figure>
  );
}

export type StructuredRecordItem = {
  label: ReactNode;
  value: ReactNode;
};

export function StructuredRecord({
  headingId,
  title,
  items,
}: {
  headingId: string;
  title: ReactNode;
  items: readonly StructuredRecordItem[];
}) {
  return (
    <section className={styles.structuredRecord} aria-labelledby={headingId}>
      <h3 id={headingId}>{title}</h3>
      <dl>
        {items.map((item, index) => (
          <div key={index}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export type RelationshipItem = {
  label: ReactNode;
  value: ReactNode;
  relation?: ReactNode;
};

export function RelationshipGroup({
  headingId,
  title,
  items,
}: {
  headingId: string;
  title: ReactNode;
  items: readonly RelationshipItem[];
}) {
  return (
    <section className={styles.relationshipGroup} aria-labelledby={headingId}>
      <h3 id={headingId}>{title}</h3>
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            <span className={styles.relationshipLabel}>{item.label}</span>
            <span className={styles.relationshipValue}>{item.value}</span>
            {item.relation ? <span className={styles.relationshipRelation}>{item.relation}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Divider() {
  return <hr className={styles.divider} />;
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className={styles.visuallyHidden}>{children}</span>;
}
