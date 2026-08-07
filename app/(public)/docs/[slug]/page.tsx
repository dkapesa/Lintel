import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  CURATED_PUBLIC_DOCUMENTS,
  LEGACY_DOCUMENT_ALIASES,
  type CuratedPublicDocument,
} from "../../../_public/routes";
import { buildPublicDocumentMetadata, PRIVATE_PUBLIC_ROBOTS } from "../../../_public/metadata";
import { EditorialSection, Identifier, MetadataGrid, MetadataItem, RouteIntroduction } from "../../../_public/primitives";
import { DOCUMENT_BODIES } from "../documents";
import styles from "./docs.module.css";

/* Publication authority is CURATED_PUBLIC_DOCUMENTS + LEGACY_DOCUMENT_ALIASES
   only. dynamicParams = false makes any slug outside those two sets a static
   404 rather than a rendered page — there is no fs/readdir/glob path here. */
const PUBLISHED_DOCUMENTS: readonly CuratedPublicDocument[] = CURATED_PUBLIC_DOCUMENTS
  .filter((document) => document.publicationStatus === "published")
  .slice()
  .sort((a, b) => a.order - b.order);

const ADAPTATION_LABEL: Record<CuratedPublicDocument["adaptation"], string> = {
  verbatim: "Verbatim from its repository source",
  adaptation: "Adaptation of a repository source",
  authored: "Authored for this public audience",
};

function findDocument(slug: string) {
  return PUBLISHED_DOCUMENTS.find((document) => document.slug === slug);
}

export function generateStaticParams() {
  const publishedSlugs = PUBLISHED_DOCUMENTS.map((document) => ({ slug: document.slug }));
  const aliasSlugs = Object.keys(LEGACY_DOCUMENT_ALIASES).map((slug) => ({ slug }));
  return [...publishedSlugs, ...aliasSlugs];
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (LEGACY_DOCUMENT_ALIASES[slug]) return { robots: PRIVATE_PUBLIC_ROBOTS };

  const document = findDocument(slug);
  return document ? buildPublicDocumentMetadata(document) : {};
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const alias = LEGACY_DOCUMENT_ALIASES[slug];
  if (alias) permanentRedirect(`/docs/${alias}`);

  const document = findDocument(slug);
  if (!document) notFound();

  const bodyModule = DOCUMENT_BODIES[document.slug];
  if (!bodyModule) notFound();

  const index = PUBLISHED_DOCUMENTS.findIndex((entry) => entry.slug === document.slug);
  const previous = index > 0 ? PUBLISHED_DOCUMENTS[index - 1] : undefined;
  const next = index < PUBLISHED_DOCUMENTS.length - 1 ? PUBLISHED_DOCUMENTS[index + 1] : undefined;
  const showContents = bodyModule.sections.length >= 4;
  const { Body } = bodyModule;

  return (
    <EditorialSection labelledBy="doc-title" opening>
      <RouteIntroduction
        eyebrow={document.kind}
        title={document.title}
        summary={document.description}
        headingId="doc-title"
      />

      <MetadataGrid label="Document metadata" columns={3}>
        <MetadataItem label="Kind">{document.kind}</MetadataItem>
        <MetadataItem label="Updated">
          <Identifier accessibleName={`Updated ${document.updated}`}>{document.updated}</Identifier>
        </MetadataItem>
        <MetadataItem label="Source">{ADAPTATION_LABEL[document.adaptation]}</MetadataItem>
      </MetadataGrid>

      <div className={styles.documentBody} data-with-contents={showContents ? "true" : undefined}>
        {showContents ? (
          <nav className={styles.contents} aria-labelledby="doc-contents-heading">
            <p id="doc-contents-heading" className={styles.contentsHeading}>
              Contents
            </p>
            <ol>
              {bodyModule.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className={styles.content}>
          <Body />
        </div>
      </div>

      <nav className={styles.pager} aria-label="Document navigation">
        {previous ? (
          <Link
            href={`/docs/${previous.slug}`}
            className={styles.pagerLink}
            aria-label={`Previous document: ${previous.title}`}
          >
            <span className={styles.pagerDirection}>Previous</span>
            <span className={styles.pagerTitle}>{previous.title}</span>
          </Link>
        ) : (
          <span className={styles.pagerSpacer} />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className={`${styles.pagerLink} ${styles.pagerLinkNext}`}
            aria-label={`Next document: ${next.title}`}
          >
            <span className={styles.pagerDirection}>Next</span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        ) : (
          <span className={styles.pagerSpacer} />
        )}
      </nav>
    </EditorialSection>
  );
}
