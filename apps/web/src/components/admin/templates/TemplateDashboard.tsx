"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTemplates } from "./useAdminTemplates";
import { TemplateStats } from "./TemplateStats";
import { TemplateFilters } from "./TemplateFilters";
import { TemplateTable } from "./TemplateTable";
import { TemplateEmptyState } from "./TemplateEmptyState";
import { CreateTemplateDialog } from "./CreateTemplateDialog";

export function TemplateDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAdminTemplates({
    search: search.trim() || undefined,
    status: status || undefined,
    category: category.trim() || undefined,
    page,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const isFiltered = Boolean(search || status || category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Content Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define, structure, and govern reusable schemas for tourism content.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          Create template
        </button>
      </div>

      <TemplateStats
        total={data.total}
        draft={data.draft_count}
        published={data.published_count}
        archived={data.archived_count}
      />

      <TemplateFilters
        search={search}
        status={status}
        category={category}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
      />

      {isLoading ? (
        <div className="space-y-3 rounded-xl border bg-background p-6">
          <div className="h-6 w-1/4 rounded bg-muted/40 animate-pulse" />
          <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
          <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
          <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900"
        >
          <h3 className="font-semibold text-base">Failed to load templates</h3>
          <p className="text-sm mt-1 text-rose-700">
            {error?.message || "An unexpected error occurred while fetching templates."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : data.items.length === 0 ? (
        <TemplateEmptyState
          filtered={isFiltered}
          onCreate={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <TemplateTable templates={data.items} />

          {data.total_pages > 1 && (
            <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
              <div>
                Page <span className="font-medium text-foreground">{data.page}</span> of{" "}
                <span className="font-medium text-foreground">{data.total_pages}</span> ({data.total} total)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted/10 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= data.total_pages}
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted/10 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <CreateTemplateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          setCreateOpen(false);
          router.push(`/admin/templates/${id}/builder`);
        }}
      />
    </div>
  );
}
