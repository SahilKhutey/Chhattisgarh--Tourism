"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getVersionDiff } from "@/lib/api/template-versions";
import type { FieldChange, VersionDiffResponse } from "@/types/template-version";

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 min-w-[120px]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function DiffSection({
  title,
  items,
}: {
  title: string;
  items: FieldChange[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <h2 className="font-semibold text-sm tracking-tight">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item.key}-${item.change}-${index}`}
            className="rounded-lg border bg-card p-4 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium font-mono">{item.key}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {item.change}
              </span>
            </div>

            {item.breaking && (
              <p className="mt-2 text-xs font-semibold text-rose-600">
                • Breaking change
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function DiffContent({
  templateId,
  version,
}: {
  templateId: string;
  version: number;
}) {
  const query = useQuery<VersionDiffResponse>({
    queryKey: ["template-version-diff", templateId, version],
    queryFn: () => getVersionDiff(templateId, version),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <p className="text-muted-foreground animate-pulse">Loading diff...</p>
      </main>
    );
  }

  if (query.isError || !query.data) {
    return (
      <main className="p-8 max-w-5xl mx-auto" role="alert">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-semibold">Unable to load version diff.</p>
          <Link
            href={`/admin/templates/${templateId}/versions`}
            className="mt-3 inline-block text-xs font-medium underline"
          >
            ← Back to Versions
          </Link>
        </div>
      </main>
    );
  }

  const diff = query.data;

  if (!diff.diff) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <Link
          href={`/admin/templates/${templateId}/versions`}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Versions
        </Link>
        <h1 className="text-2xl font-bold mt-4">Version {version}</h1>
        <p className="mt-2 text-muted-foreground">
          This is the first version. There is no previous version to compare.
        </p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <Link
          href={`/admin/templates/${templateId}/versions`}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Versions
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Version {diff.version} Diff
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compared with version {diff.against}.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap gap-3">
          <SummaryCard label="Added" value={diff.added.length} />
          <SummaryCard label="Removed" value={diff.removed.length} />
          <SummaryCard label="Changed" value={diff.changed.length} />
          <SummaryCard label="Reordered" value={diff.reordered.length} />
        </div>

        <div className="mt-5">
          {diff.breaking ? (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"
            >
              Breaking changes detected.
            </div>
          ) : (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700"
            >
              No breaking changes detected.
            </div>
          )}
        </div>
      </section>

      <DiffSection title="Added fields" items={diff.added} />
      <DiffSection title="Removed fields" items={diff.removed} />
      <DiffSection title="Changed fields" items={diff.changed} />
      <DiffSection title="Reordered fields" items={diff.reordered} />
    </main>
  );
}

export function TemplateVersionDiffPage({
  templateId,
  version,
}: {
  templateId: string;
  version: number;
}) {
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
      <DiffContent templateId={templateId} version={version} />
    </QueryClientProvider>
  );
}
