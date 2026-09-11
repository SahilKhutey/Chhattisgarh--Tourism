export interface Locale {
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  enabled: boolean;
}

export interface LocalizationCompleteness {
  locale_code: string;
  total_fields: number;
  translated_fields: number;
  percentage: number;
  complete: boolean;
}

export interface TemplateLocalization {
  id: number;
  template_id: string;
  locale_code: string;
  name: string | null;
  description: string | null;
  status: string;
}

export interface ContentLocalization {
  id: number;
  content_entry_id: string;
  locale_code: string;
  field_key: string;
  value: string | null;
  status: string;
}
