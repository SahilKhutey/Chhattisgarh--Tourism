import type {
  ContentTemplate,
  TemplateField,
} from "@/types/template";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
  );

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => null);

    const errorMessage =
      typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message ??
          body?.message ??
          `API request failed: ${response.status}`;

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getTemplate(
  id: string,
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    `/admin/templates/${id}`,
  );
}

export async function createTemplate(
  payload: {
    name: string;
    slug: string;
    category?: string;
    description?: string;
  },
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    "/admin/templates",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  ).catch(async (err) => {
    // Fallback to /templates if /admin/templates POST returns error
    if (err.message?.includes("404") || err.message?.includes("405")) {
      return request<ContentTemplate>(
        "/templates",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    }
    throw err;
  });
}

export async function updateTemplate(
  id: string,
  payload: Partial<ContentTemplate>,
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    `/admin/templates/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateTemplateFields(
  id: string,
  fields: TemplateField[],
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    `/admin/templates/${id}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields,
      }),
    },
  );
}

export async function validateTemplate(
  id: string,
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  return request<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>(
    `/admin/templates/${id}/validate`,
    {
      method: "POST",
    },
  );
}

export async function publishTemplate(
  id: string,
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    `/admin/templates/${id}/publish`,
    {
      method: "POST",
    },
  );
}
