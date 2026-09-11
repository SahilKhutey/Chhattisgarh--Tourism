import {
  ContentEntry,
  ContentEntryListResponse,
  PublicContent,
  RuntimeSchema,
} from "../../types/content-entry";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiConflictError extends Error {
  currentRevision?: number;
  constructor(message: string, currentRevision?: number) {
    super(message);
    this.name = "ApiConflictError";
    this.currentRevision = currentRevision;
  }
}

export class ApiValidationError extends Error {
  errors: string[];
  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

export async function getRuntimeSchema(
  templateId: string,
): Promise<RuntimeSchema> {
  const response = await fetch(
    `${API_BASE}/admin/templates/${templateId}/runtime-schema`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail ?? "Unable to load runtime schema.");
  }

  return response.json();
}

export async function createContentEntry(
  templateId: string,
  payload: {
    title: string;
    slug?: string;
    values?: Record<string, unknown>;
    locale_values?: Record<string, Record<string, unknown>>;
  },
): Promise<ContentEntry> {
  const response = await fetch(
    `${API_BASE}/admin/content-entries/templates/${templateId}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 409) {
      throw new ApiConflictError(
        errorData?.detail?.message ?? "Template has no published version.",
      );
    }
    if (response.status === 422) {
      throw new ApiValidationError(
        errorData?.detail?.message ?? "Invalid content entry.",
        errorData?.detail?.errors ?? [],
      );
    }
    throw new Error(
      errorData?.detail?.message ??
        errorData?.detail ??
        "Unable to create content entry.",
    );
  }

  return response.json();
}

export async function updateContentEntry(
  entryId: string,
  payload: {
    title?: string;
    slug?: string;
    values?: Record<string, unknown>;
    locale_values?: Record<string, Record<string, unknown>>;
    revision: number;
  },
): Promise<ContentEntry> {
  const response = await fetch(
    `${API_BASE}/admin/content-entries/${entryId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 409) {
      throw new ApiConflictError(
        errorData?.detail?.message ?? "Content entry has changed.",
        errorData?.detail?.current_revision,
      );
    }
    if (response.status === 422) {
      throw new ApiValidationError(
        errorData?.detail?.message ?? "Invalid content entry.",
        errorData?.detail?.errors ?? [],
      );
    }
    throw new Error(
      errorData?.detail?.message ??
        errorData?.detail ??
        "Unable to update content entry.",
    );
  }

  return response.json();
}

export async function publishContentEntry(
  entryId: string,
): Promise<ContentEntry> {
  const response = await fetch(
    `${API_BASE}/admin/content-entries/${entryId}/publish`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 422) {
      throw new ApiValidationError(
        errorData?.detail?.message ?? "Cannot publish invalid content entry.",
        errorData?.detail?.errors ?? [],
      );
    }
    throw new Error(
      errorData?.detail?.message ??
        errorData?.detail ??
        "Unable to publish content entry.",
    );
  }

  return response.json();
}

export async function archiveContentEntry(
  entryId: string,
): Promise<ContentEntry> {
  const response = await fetch(
    `${API_BASE}/admin/content-entries/${entryId}/archive`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.message ??
        errorData?.detail ??
        "Unable to archive content entry.",
    );
  }

  return response.json();
}

export async function getContentEntry(
  entryId: string,
): Promise<ContentEntry> {
  const response = await fetch(
    `${API_BASE}/admin/content-entries/${entryId}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.message ??
        errorData?.detail ??
        "Unable to load content entry.",
    );
  }

  return response.json();
}

export async function listContentEntries(params?: {
  template_id?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<ContentEntryListResponse> {
  const query = new URLSearchParams();
  if (params?.template_id) query.set("template_id", params.template_id);
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.page_size) query.set("page_size", params.page_size.toString());

  const response = await fetch(
    `${API_BASE}/admin/content-entries?${query.toString()}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to list content entries.");
  }

  return response.json();
}

export async function getPublicContent(
  templateSlug: string,
  entrySlug: string,
  locale = "en",
): Promise<PublicContent> {
  const response = await fetch(
    `${API_BASE}/content/${templateSlug}/${entrySlug}?locale=${locale}`,
  );

  if (!response.ok) {
    throw new Error("Unable to load public content.");
  }

  return response.json();
}
