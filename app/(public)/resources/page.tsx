import type { Metadata } from "next";
import Link from "next/link";
import { Action, ActionGroup, Copy, EditorialSection, RouteIntroduction, SectionHeading } from "../../_public/primitives";
import { buildPublicMetadata } from "../../_public/metadata";
import { CURATED_PUBLIC_DOCUMENTS } from "../../_public/routes";
import {
  PUBLIC_ROUTE_ENTRIES,
  RESOURCES_CLOSING,
  RESOURCES_INTRODUCTION,
  RESOURCES_METADATA,
  type ResourceEntry,
} from "./resources-content";
import styles from "./resources.module.css";

export const metadata: Metadata = buildPublicMetadata("resources", RESOURCES_METADATA);

const PUBLISHED_DOCUMENTS = CURATED_PUBLIC_DOCUMENTS.filter(
  (document) => document.publicationStatus === "published",
)
  .slice()
  .sort((a, b) => a.order - b.order);

function ResourceRow({ title, href, description, kind }: ResourceEntry) {
  return (
    <li className={styles.entry}>
      <Link href={href} className={styles.entryTitle}>
        {title}
      </Link>
      <p className={styles.entryDescription}>{description}</p>
      <p className={styles.entryMeta}>{kind}</p>
    </li>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <EditorialSection labelledBy="resources-title" opening>
        <RouteIntroduction
          eyebrow={RESOURCES_INTRODUCTION.eyebrow}
          title={RESOURCES_INTRODUCTION.title}
          summary={RESOURCES_INTRODUCTION.lead}
          headingId="resources-title"
        />
      </EditorialSection>

      <EditorialSection labelledBy="resources-routes-title">
        <SectionHeading headingId="resources-routes-title" title="Public routes" />
        <ul className={styles.list}>
          {PUBLIC_ROUTE_ENTRIES.map((entry) => (
            <ResourceRow key={entry.href} {...entry} />
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection labelledBy="resources-docs-title">
        <SectionHeading headingId="resources-docs-title" title="Documentation" />
        <ul className={styles.list}>
          {PUBLISHED_DOCUMENTS.map((document) => (
            <ResourceRow
              key={document.slug}
              title={document.title}
              href={`/docs/${document.slug}`}
              description={document.description}
              kind={document.kind}
            />
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection labelledBy="resources-closing-title">
        <div className={styles.closing}>
          <SectionHeading headingId="resources-closing-title" title={RESOURCES_CLOSING.title} />
          <Copy>{RESOURCES_CLOSING.body}</Copy>
          <ActionGroup>
            <Action href={RESOURCES_CLOSING.action.href}>{RESOURCES_CLOSING.action.label}</Action>
          </ActionGroup>
        </div>
      </EditorialSection>
    </>
  );
}
