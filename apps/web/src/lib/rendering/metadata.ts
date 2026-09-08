import type { Metadata } from 'next';

export interface MetadataEntryInput {
  title?: string;
  slug?: string;
  data?: Record<string, unknown>;
  region?: string | null;
  district?: string | null;
  publishedAt?: string | Date | null;
  template?: {
    name?: string;
    slug?: string;
  };
}

export function buildMetadata(entry: MetadataEntryInput): Metadata {
  const data = entry.data || {};
  const templateName = entry.template?.name || 'Tourism Experience';
  const templateSlug = entry.template?.slug || 'explore';

  const rawTitle =
    entry.title ||
    (typeof data.title === 'string' ? data.title : null) ||
    (typeof data.name === 'string' ? data.name : null) ||
    templateName;

  const pageTitle = `${rawTitle} | Chhattisgarh Tourism`;

  const description =
    (typeof data.summary === 'string' ? data.summary : null) ||
    (typeof data.shortDescription === 'string' ? data.shortDescription : null) ||
    (typeof data.description === 'string' ? data.description : null) ||
    (typeof data.story === 'string' ? data.story : null) ||
    `Discover ${rawTitle} in ${entry.district || entry.region || 'Chhattisgarh'}. Authentic tribal heritage, eco-tourism, and cultural wonders.`;

  // Find image
  const imageUrl =
    (typeof data.heroImage === 'string' ? data.heroImage : null) ||
    (typeof data.image === 'string' ? data.image : null) ||
    (Array.isArray(data.gallery) && typeof data.gallery[0] === 'string'
      ? data.gallery[0]
      : '/images/cg-tourism-og.jpg');

  // Extract tags
  const tags: string[] = Array.isArray(data.tags)
    ? data.tags.map(String)
    : ['Chhattisgarh', 'Tourism', templateName];

  if (entry.district) tags.push(entry.district);
  if (entry.region) tags.push(entry.region);

  const canonicalUrl = entry.slug
    ? `/content/${templateSlug}/${entry.slug}`
    : `/content/${templateSlug}`;

  return {
    title: pageTitle,
    description: description.slice(0, 160),
    keywords: tags,
    openGraph: {
      title: pageTitle,
      description: description.slice(0, 200),
      url: canonicalUrl,
      siteName: 'Chhattisgarh Tourism',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: rawTitle,
        },
      ],
      locale: 'en_IN',
      type: 'article',
      publishedTime: entry.publishedAt
        ? new Date(entry.publishedAt).toISOString()
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: description.slice(0, 200),
      images: [imageUrl],
    },
  };
}
