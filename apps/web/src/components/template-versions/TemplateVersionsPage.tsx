"use client";

import Link from "next/link";
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { getTemplateVersions } from "@/lib/api/template-versions";
import { VersionRow } from "./VersionRow";

function VersionsContent({ templateId }: { templateId: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["template-versions", templateId],
    queryFn: () => getTemplateVersions(templateId),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <p className="text-muted-foreground animate-pulse">Loading versions...</p>
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800"
        >
          <p className="font-semibold">Unable to load versions.</p>
          <p className="mt-1 text-xs text-rose-600">
            {query.error instanceof Error ? query.error.message : "Network error"}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-3 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const versions = query.data?.items ?? [];

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/templates/${templateId}/builder`}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Builder
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Template Versions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable schema history and published versions.
          </p>
        </div>
      </header>

      {versions.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No versions have been published yet.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border bg-card">
          <div className="divide-y">
            {versions.map((version) => (
              <VersionRow
                key={version.id}
                templateId={templateId}
                version={version}
                onRollback={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["template-versions", templateId],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "template", templateId],
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export function TemplateVersionsPage({ templateId }: { templateId: string }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <VersionsContent templateId={templateId} />
    </QueryClientProvider>
  );
}
