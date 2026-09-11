export type AdminTemplateStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface AdminTemplateItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  status: AdminTemplateStatus;
  field_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminTemplateListResponse {
  items: AdminTemplateItem[];

  page: number;
  page_size: number;

  total: number;
  total_pages: number;

  draft_count: number;
  published_count: number;
  archived_count: number;
}
