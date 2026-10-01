export type ContentSectionVisibility =
  | "visible"
  | "hidden";

export type ContentSection = {
  id: string;
  type: string;
  order: number;
  visibility: ContentSectionVisibility;
  data: unknown;
};

export type ContentUIModel = {
  templateId: string;
  entryId: string;
  locale: string;
  title: string;
  summary?: string;
  sections: ContentSection[];
  metadata?: Record<string, unknown>;
};
