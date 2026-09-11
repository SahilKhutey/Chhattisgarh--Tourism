import type {
  ContentTemplate,
} from "@cg-tourism/types/template";

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
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    },
  );

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => null);

    throw new Error(
      body?.detail ??
      `API request failed: ${response.status}`,
    );
  }

  return response.json();
}

export function getTemplate(
  id: string,
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    `/templates/${id}`,
  );
}

export function createTemplate(
  payload: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    category?: string;
  },
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    "/templates",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateTemplateFields(
  id: string,
  payload: {
    upsert: unknown[];
    delete_keys: string[];
    ordered_keys: string[];
  },
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    `/templates/${id}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function publishTemplate(
  id: string,
): Promise<ContentTemplate> {
  return request<ContentTemplate>(
    `/templates/${id}/publish`,
    {
      method: "POST",
    },
  );
}
