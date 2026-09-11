import type {
  AdminTemplateListResponse,
} from "@/types/admin-template";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

export interface ListParams {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

export async function listAdminTemplates(
  params: ListParams = {},
): Promise<AdminTemplateListResponse> {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.category) {
    query.set("category", params.category);
  }

  query.set("page", String(params.page ?? 1));
  query.set("page_size", String(params.page_size ?? 20));

  const response = await fetch(
    `${API_BASE}/admin/templates?${query}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => null);

    throw new Error(
      body?.detail ??
      "Unable to load templates.",
    );
  }

  return response.json();
}
