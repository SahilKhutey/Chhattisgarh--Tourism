export const CacheKeys = {
  publishedTemplates: 'content:templates:published',

  template: (id: string) => `content:template:${id}`,

  publicEntries: (templateId?: string, region?: string) =>
    `content:entries:${templateId ?? 'all'}:${region ?? 'all'}`,
};
