/**
 * CG Tourism OS — General UI Helpers
 */

export function formatAriaLabel(...parts: (string | undefined | null)[]): string {
  return parts.filter(Boolean).join(" - ");
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
