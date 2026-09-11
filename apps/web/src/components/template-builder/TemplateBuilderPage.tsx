"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";
import Link from "next/link";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTemplate,
  updateTemplate,
  updateTemplateFields,
  validateTemplate,
  publishTemplate,
} from "@/lib/api/templates";
import { unlockDraft } from "@/lib/api/template-versions";


import {
  useTemplateBuilder,
} from "./useTemplateBuilder";

import {
  useUnsavedChangesWarning,
} from "./useUnsavedChangesWarning";

import {
  FieldPalette,
} from "./FieldPalette";

import {
  SortableFieldList,
} from "./SortableFieldList";

import {
  TemplatePreview,
} from "./TemplatePreview";

import {
  createField,
} from "./fieldFactory";

import type {
  ContentTemplate,
  TemplateFieldType,
} from "@/types/template";

interface Props {
  templateId: string;
}

export function TemplateBuilderPage({
  templateId,
}: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TemplateBuilderContent templateId={templateId} />
    </QueryClientProvider>
  );
}

function TemplateBuilderContent({
  templateId,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "template", templateId],
    queryFn: () => getTemplate(templateId),
    staleTime: 30_000,
  });

  if (query.isLoading) {
    return (
      <main className="p-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Loading template builder...</span>
        </div>
      </main>
    );
  }

  if (query.isError || !query.data) {
    return (
      <main className="p-8">
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900"
        >
          <h2 className="font-semibold text-base">Unable to load template.</h2>
          <p className="text-sm mt-1 text-rose-700">
            {query.error instanceof Error
              ? query.error.message
              : "An unexpected error occurred."}
          </p>

          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <Builder
      template={query.data}
      templateId={templateId}
      onBack={() => router.push("/admin/templates")}
      invalidate={() =>
        queryClient.invalidateQueries({
          queryKey: ["admin", "template", templateId],
        })
      }
    />
  );
}

interface BuilderProps {
  template: ContentTemplate;
  templateId: string;
  onBack: () => void;
  invalidate: () => void;
}

function Builder({
  template,
  templateId,
  onBack,
  invalidate,
}: BuilderProps) {
  const builder = useTemplateBuilder(template);
  useUnsavedChangesWarning(builder.dirty);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  async function save() {
    setSaving(true);
    setMessage(null);

    try {
      await updateTemplate(templateId, {
        name: builder.template.name,
        slug: builder.template.slug,
        description: builder.template.description,
        icon: builder.template.icon,
        category: builder.template.category,
      });

      await updateTemplateFields(
        templateId,
        builder.template.fields,
      );

      builder.markSaved();
      invalidate();
      setMessage("Saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save.",
      );
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function validate() {
    setValidationErrors([]);

    try {
      await save();

      const result = await validateTemplate(templateId);

      if (!result.valid) {
        setValidationErrors(result.errors);
        return;
      }

      setMessage(
        result.warnings && result.warnings.length
          ? `Valid with ${result.warnings.length} warning(s).`
          : "Template is valid.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Validation failed.",
      );
    }
  }

  async function publish() {
    setValidationErrors([]);

    try {
      await save();

      const result = await validateTemplate(templateId);

      if (!result.valid) {
        setValidationErrors(result.errors);
        return;
      }

      await publishTemplate(templateId);

      invalidate();
      setMessage("Template published.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to publish.",
      );
    }
  }

  async function handleUnlockDraft() {
    try {
      await unlockDraft(templateId);
      invalidate();
      setMessage("Draft editing enabled.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to edit draft.",
      );
    }
  }

  function addField(type: TemplateFieldType) {
    builder.addField(
      createField(
        type,
        builder.template.fields.map((field) => field.key),
      ),
    );
  }

  const readOnly = builder.template.status === "PUBLISHED";

  return (
    <main className="min-h-screen bg-stone-50/50">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
            >
              ← Templates
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight">
                  {builder.template.name}
                </h1>
                {readOnly ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                    PUBLISHED
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                    DRAFT
                  </span>
                )}
                {builder.template.published_version_number && (
                  <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    Live: v{builder.template.published_version_number}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground font-mono">
                /{builder.template.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {builder.dirty && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                Unsaved changes
              </span>
            )}

            {message && (
              <span
                role="status"
                className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200"
              >
                {message}
              </span>
            )}

            {readOnly ? (
              <>
                <button
                  type="button"
                  onClick={handleUnlockDraft}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-xs"
                >
                  Edit draft
                </button>

                <Link
                  href={`/admin/templates/${templateId}/versions`}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors shadow-xs"
                >
                  Versions
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40 transition-colors shadow-xs"
                >
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={validate}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40 transition-colors shadow-xs"
                >
                  Validate draft
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={publish}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-xs"
                >
                  Publish version
                </button>

                <Link
                  href={`/admin/templates/${templateId}/versions`}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors shadow-xs"
                >
                  Versions
                </Link>
              </>
            )}
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto grid gap-6 p-6 xl:grid-cols-[240px_minmax(0,1fr)_360px]">
        {!readOnly && (
          <div className="xl:sticky xl:top-24 xl:self-start">
            <FieldPalette onAdd={addField} />
          </div>
        )}

        <section className="min-w-0 space-y-5">
          {validationErrors.length > 0 && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900"
            >
              <h2 className="font-semibold text-sm">Validation errors</h2>

              <ul className="mt-2 list-disc pl-5 text-xs space-y-1 text-rose-800">
                {validationErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {!readOnly && (
            <section className="rounded-xl border p-5 bg-background shadow-xs">
              <h2 className="font-semibold text-sm tracking-tight">
                Template metadata
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium">Name</span>

                  <input
                    value={builder.template.name}
                    onChange={(event) =>
                      builder.updateTemplate({
                        name: event.target.value,
                      })
                    }
                    className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium">Category</span>

                  <input
                    value={builder.template.category ?? ""}
                    onChange={(event) =>
                      builder.updateTemplate({
                        category: event.target.value || null,
                      })
                    }
                    className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
                  />
                </label>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Fields
                </h2>

                <p className="text-xs text-muted-foreground">
                  {builder.template.fields.length} field(s) configured
                </p>
              </div>
            </div>

            {builder.template.fields.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center text-xs text-muted-foreground bg-background">
                Add a field from the field palette to begin designing this template.
              </div>
            ) : readOnly ? (
              <SortableFieldList
                fields={builder.template.fields}
                onReorder={() => {}}
                onUpdate={() => {}}
                onRemove={() => {}}
              />
            ) : (
              <SortableFieldList
                fields={builder.template.fields}
                onReorder={builder.reorderFields}
                onUpdate={builder.updateField}
                onRemove={builder.removeField}
              />
            )}
          </section>
        </section>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <TemplatePreview fields={builder.template.fields} />
        </aside>
      </div>
    </main>
  );
}
