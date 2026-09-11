import type {
  AccessibilityAudit,
  AccessibilityAuditSummary,
} from "@/types/accessibility";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

export async function getAccessibilityAudit(): Promise<AccessibilityAuditSummary> {
  const response = await fetch(`${API_BASE}/admin/accessibility/audit`, {
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? "Failed to load accessibility audit.",
    );
  }

  return response.json();
}

export async function runAccessibilityAudit(
  entryId: string,
  locale: string = "en",
): Promise<AccessibilityAudit> {
  const response = await fetch(
    `${API_BASE}/admin/accessibility/entries/${entryId}/audit?locale=${locale}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? "Failed to run accessibility audit.",
    );
  }

  return response.json();
}

export async function getEntryAudit(
  entryId: string,
): Promise<AccessibilityAudit> {
  const response = await fetch(
    `${API_BASE}/admin/accessibility/entries/${entryId}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? "Failed to get entry audit.",
    );
  }

  return response.json();
}

export async function remediateField(
  entryId: string,
  fieldKey: string,
  payload: { alt_text: string; index?: number },
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE}/admin/accessibility/entries/${entryId}/fields/${fieldKey}`,
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
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? "Failed to remediate accessibility field.",
    );
  }

  return response.json();
}
