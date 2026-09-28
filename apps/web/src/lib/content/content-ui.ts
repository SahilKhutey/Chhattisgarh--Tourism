/**
 * CG Tourism OS — Content UI Contract
 * Defines the contract boundary between Template Engine and Canonical UI Renderers.
 */

export type ContentUIContext = {
  templateId: string;
  entryId: string;
  locale: string;
  preview?: boolean;
  authenticated?: boolean;
};

export type ContentSection = {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  data: unknown;
};

export type ContentRenderModel = {
  templateId: string;
  entryId: string;
  title: string;
  sections: ContentSection[];
  metadata?: Record<string, unknown>;
};
