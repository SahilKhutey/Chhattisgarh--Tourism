import type { PublicContent } from "@/types/public-content";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

export async function getPublicContent(
  slug: string,
  locale: string = "en",
  route: string = "destinations",
): Promise<PublicContent> {
  const url = `${API_BASE}/content/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}&route=${encodeURIComponent(route)}`;

  const response = await fetch(url, {
    next: {
      revalidate: 300,
      tags: [`content:${slug}`, `locale:${locale}`],
    },
  });

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error("Failed to load content.");
  }

  return response.json();
}

export async function getPreviewContent(
  id: string,
  locale: string = "en",
): Promise<PublicContent> {
  const url = `${API_BASE}/content/preview/${encodeURIComponent(id)}?locale=${encodeURIComponent(locale)}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error("Failed to load preview content.");
  }

  return response.json();
}
