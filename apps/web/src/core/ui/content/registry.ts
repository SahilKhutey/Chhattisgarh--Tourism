import type { ReactNode } from "react";

export type ContentRenderer = (
  data: unknown,
) => ReactNode;

const registry = new Map<
  string,
  ContentRenderer
>();

export function registerContentRenderer(
  type: string,
  renderer: ContentRenderer,
): void {
  if (!type || !type.trim()) {
    throw new Error(
      "Content renderer type cannot be empty.",
    );
  }

  registry.set(type, renderer);
}

export function getContentRenderer(
  type: string,
): ContentRenderer | undefined {
  return registry.get(type);
}

export function hasContentRenderer(
  type: string,
): boolean {
  return registry.has(type);
}

export function clearContentRenderers(): void {
  registry.clear();
}
