import type { Metadata } from "next";
import type { PublicContent } from "@/types/public-content";

function getHeroImage(content: PublicContent): string | undefined {
  const field = content.fields.find(
    (item) => item.key === "hero_image" && item.type === "IMAGE",
  );

  if (field?.value && typeof field.value === "object") {
    return (field.value as { url?: string }).url;
  }

  return undefined;
}

export function buildContentMetadata(content: PublicContent): Metadata {
  const title =
    content.seo_title ??
    content.name ??
    content.slug;

  const description =
    content.seo_description ??
    content.description ??
    "Discover Chhattisgarh tourism destinations.";

  const heroImage = getHeroImage(content);

  return {
    title: `${title} | CG Tourism`,
    description,
    alternates: {
      canonical: content.canonical_url,
    },
    openGraph: {
      title: `${title} | CG Tourism`,
      description,
      url: content.canonical_url,
      type: "article",
      images: heroImage ? [{ url: heroImage }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
