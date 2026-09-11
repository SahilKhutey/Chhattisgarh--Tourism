import type {
  TemplateVersionListItem,
  TemplateVersionResponse,
  VersionDiffResponse,
} from "@/types/template-version";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function getTemplateVersions(
  templateId: string,
): Promise<{
  items: TemplateVersionListItem[];
  total: number;
}> {
  const response = await fetch(
    `${API_BASE}/api/admin/templates/${templateId}/versions`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load versions.");
  }

  return response.json();
}

export async function getVersionDetail(
  templateId: string,
  versionNumber: number,
): Promise<TemplateVersionResponse> {
  const response = await fetch(
    `${API_BASE}/api/admin/templates/${templateId}/versions/${versionNumber}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load version detail.");
  }

  return response.json();
}

export async function getVersionDiff(
  templateId: string,
  version: number,
  against = "previous",
): Promise<VersionDiffResponse> {
  const params = new URLSearchParams({
    against,
  });

  const response = await fetch(
    `${API_BASE}/api/admin/templates/${templateId}/versions/${version}/diff?${params.toString()}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load version diff.");
  }

  return response.json();
}

export async function rollbackTemplate(
  templateId: string,
  versionNumber: number,
): Promise<TemplateVersionResponse> {
  const response = await fetch(
    `${API_BASE}/api/admin/templates/${templateId}/rollback`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version_number: versionNumber,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? "Rollback failed.");
  }

  return response.json();
}

export async function unlockDraft(
  templateId: string,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `${API_BASE}/api/admin/templates/${templateId}/draft`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to unlock draft.");
  }

  return response.json();
}
