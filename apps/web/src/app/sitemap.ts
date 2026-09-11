import type { MetadataRoute } from "next";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

const SITE_URL =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

interface SitemapContent {
  slug: string;
  updated_at?: string;
}

async function getPublishedContent(): Promise<SitemapContent[]> {
  try {
    const response = await fetch(`${API_BASE}/content/sitemap`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getPublishedContent();
  const locales = ["en", "hi", "chg"];

  const dynamicRoutes = items.flatMap((item) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/destinations/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/${locale}/destinations`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/${locale}/districts`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  return [...staticRoutes, ...dynamicRoutes];
}
