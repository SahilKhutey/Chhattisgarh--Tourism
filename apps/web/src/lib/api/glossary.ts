import type { GlossaryTerm } from "@/types/glossary";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

export async function getGlossary(): Promise<GlossaryTerm[]> {
  const response = await fetch(`${API_BASE}/admin/glossary`, {
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? "Failed to load glossary.");
  }

  return response.json();
}

export async function createGlossaryTerm(
  payload: Omit<GlossaryTerm, "id">,
): Promise<GlossaryTerm> {
  const response = await fetch(`${API_BASE}/admin/glossary`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? "Failed to create glossary term.",
    );
  }

  return response.json();
}

export async function updateGlossaryTerm(
  termId: number,
  payload: Partial<Omit<GlossaryTerm, "id">>,
): Promise<GlossaryTerm> {
  const response = await fetch(`${API_BASE}/admin/glossary/${termId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? "Failed to update glossary term.",
    );
  }

  return response.json();
}

export async function deleteGlossaryTerm(
  termId: number,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/admin/glossary/${termId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? "Failed to delete glossary term.",
    );
  }

  return response.json();
}
