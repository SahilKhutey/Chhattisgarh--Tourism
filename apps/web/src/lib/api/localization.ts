import type {
  Locale,
  LocalizationCompleteness,
  TemplateLocalization,
} from "@/types/localization";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail?.message ??
      (typeof body?.detail === "string" ? body.detail : null) ??
      `Request failed: ${response.status}`,
    );
  }

  return response.json();
}

export function getLocales(): Promise<Locale[]> {
  return request<Locale[]>("/admin/localization/locales");
}

export function updateTemplateLocalization(
  templateId: string,
  payload: {
    locale_code: string;
    name?: string | null;
    description?: string | null;
  },
): Promise<TemplateLocalization> {
  return request<TemplateLocalization>(
    `/admin/localization/templates/${templateId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function getTemplateLocalizations(
  templateId: string,
): Promise<TemplateLocalization[]> {
  return request<TemplateLocalization[]>(
    `/admin/localization/templates/${templateId}`,
  );
}

export function getTemplateCompleteness(
  templateId: string,
  locale: string = "en",
): Promise<LocalizationCompleteness> {
  return request<LocalizationCompleteness>(
    `/admin/localization/templates/${templateId}/completeness?locale=${locale}`,
  );
}

export function updateContentFieldTranslation(
  entryId: string,
  fieldKey: string,
  payload: {
    locale_code: string;
    field_key: string;
    value?: string | null;
  },
) {
  return request(
    `/admin/localization/content/${entryId}/fields/${fieldKey}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
