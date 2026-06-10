const DEFAULT_API_ORIGIN = "http://localhost:4000";

export function getApiOrigin(): string {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (publicApiUrl) {
    return publicApiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  }

  return DEFAULT_API_ORIGIN;
}

export function getApiBase(): string {
  return `${getApiOrigin()}/api/v1`;
}

export function resolveAssetUrl(url?: string | null): string {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  if (url.startsWith("/uploads/") || url.startsWith("/cdn/")) {
    return `${getApiOrigin()}${url}`;
  }

  return url;
}
