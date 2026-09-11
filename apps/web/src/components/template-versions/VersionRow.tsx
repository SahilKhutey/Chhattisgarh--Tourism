"use client";

import { useState } from "react";
import Link from "next/link";
import { rollbackTemplate } from "@/lib/api/template-versions";
import type { TemplateVersionListItem } from "@/types/template-version";

interface VersionRowProps {
  templateId: string;
  version: TemplateVersionListItem;
  onRollback: () => void;
}

export function VersionRow({
  templateId,
  version,
  onRollback,
}: VersionRowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRollback() {
    const confirmed = window.confirm(
      `Rollback to version ${version.version_number}?`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await rollbackTemplate(templateId, version.version_number);
      onRollback();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rollback failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-muted/30 transition-colors">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-base">
            v{version.version_number}
          </span>

          {version.is_published && (
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
              Published
            </span>
          )}

          {version.breaking_change && (
            <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 text-xs font-semibold">
              Breaking
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(version.created_at).toLocaleString()}
        </p>

        {error && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/admin/templates/${templateId}/versions/${version.version_number}/diff`}
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          View diff
        </Link>

        {!version.is_published && (
          <button
            type="button"
            onClick={handleRollback}
            disabled={loading}
            className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm font-medium hover:bg-amber-100 disabled:opacity-50 transition-colors"
          >
            {loading ? "Rolling back..." : "Rollback"}
          </button>
        )}
      </div>
    </div>
  );
}
