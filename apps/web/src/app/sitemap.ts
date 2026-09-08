import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://tourism.cg.gov.in';

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'http://localhost:4000/api/v1';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/content`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return staticRoutes;
    }

    const entries = await res.json();
    if (!Array.isArray(entries)) {
      return staticRoutes;
    }

    const dynamicRoutes: MetadataRoute.Sitemap = entries
      .filter((e) => e.slug && e.template?.slug)
      .map((entry) => ({
        url: `${baseUrl}/content/${entry.template.slug}/${entry.slug}`,
        lastModified: entry.publishedAt ? new Date(entry.publishedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
