"use client";

import React, { useState } from "react";
import {
  ContentEntry,
  RuntimeSchema,
} from "../../types/content-entry";
import {
  ApiConflictError,
  ApiValidationError,
  archiveContentEntry,
  createContentEntry,
  publishContentEntry,
  updateContentEntry,
} from "../../lib/api/content-entries";
import { DynamicEntryForm } from "./DynamicEntryForm";
import { EntryPreview } from "./EntryPreview";

interface ContentEntryEditorProps {
  templateId: string;
  schema: RuntimeSchema;
  initialEntry?: ContentEntry | null;
  onSaved?: (entry: ContentEntry) => void;
}

export function ContentEntryEditor({
  templateId,
  schema,
  initialEntry,
  onSaved,
}: ContentEntryEditorProps) {
  const [entry, setEntry] = useState<ContentEntry | null>(initialEntry ?? null);
  const [title, setTitle] = useState(initialEntry?.title ?? "");
  const [slug, setSlug] = useState(initialEntry?.slug ?? "");
  const [values, setValues] = useState<Record<string, unknown>>(
    initialEntry?.values ?? {},
  );
  const [localeValues, setLocaleValues] = useState<Record<string, Record<string, unknown>>>(
    initialEntry?.locale_values ?? {},
  );

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [conflict, setConflict] = useState<{ message: string; currentRevision?: number } | null>(
    null,
  );
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isStale = entry?.schema_state === "STALE";

  const clearAlerts = () => {
    setGeneralError(null);
    setFieldErrors({});
    setSuccessMessage(null);
    setConflict(null);
  };

  const handleSave = async () => {
    clearAlerts();
    if (!title.trim()) {
      setFieldErrors({ title: "Title is required." });
      return;
    }

    setIsSaving(true);
    try {
      if (!entry) {
        // Create
        const created = await createContentEntry(templateId, {
          title,
          slug: slug.trim() || undefined,
          values,
          locale_values: localeValues,
        });
        setEntry(created);
        setSlug(created.slug);
        setSuccessMessage("Content entry created successfully as draft.");
        onSaved?.(created);
      } else {
        // Update with optimistic concurrency revision check
        const updated = await updateContentEntry(entry.id, {
          title,
          slug: slug.trim() || undefined,
          values,
          locale_values: localeValues,
          revision: entry.revision,
        });
        setEntry(updated);
        setSlug(updated.slug);
        setSuccessMessage("Changes saved successfully.");
        onSaved?.(updated);
      }
    } catch (err) {
      if (err instanceof ApiConflictError) {
        setConflict({
          message: err.message,
          currentRevision: err.currentRevision,
        });
      } else if (err instanceof ApiValidationError) {
        setGeneralError(err.message);
        const mapped: Record<string, string> = {};
        for (const e of err.errors) {
          const parts = e.split(":");
          if (parts.length >= 2) {
            mapped[parts[0].trim()] = parts.slice(1).join(":").trim();
          }
        }
        setFieldErrors(mapped);
      } else {
        setGeneralError((err as Error).message || "An error occurred.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!entry) return;
    clearAlerts();
    setIsPublishing(true);
    try {
      const published = await publishContentEntry(entry.id);
      setEntry(published);
      setSuccessMessage("Content entry published successfully!");
      onSaved?.(published);
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setGeneralError(err.message);
        const mapped: Record<string, string> = {};
        for (const e of err.errors) {
          const parts = e.split(":");
          if (parts.length >= 2) {
            mapped[parts[0].trim()] = parts.slice(1).join(":").trim();
          }
        }
        setFieldErrors(mapped);
      } else {
        setGeneralError((err as Error).message || "Unable to publish entry.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!entry) return;
    clearAlerts();
    setIsArchiving(true);
    try {
      const archived = await archiveContentEntry(entry.id);
      setEntry(archived);
      setSuccessMessage("Content entry archived.");
      onSaved?.(archived);
    } catch (err) {
      setGeneralError((err as Error).message || "Unable to archive entry.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">
            {schema.template.slug}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            v{entry?.template_version_number ?? schema.template.version}
          </span>
          {isStale && (
            <span
              data-testid="badge-stale"
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"
              title="Bound version differs from live template version"
            >
              STALE SCHEMA
            </span>
          )}
          {entry && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                entry.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800"
                  : entry.status === "ARCHIVED"
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {entry.status} (rev {entry.revision})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-md shadow-sm border border-gray-300 overflow-hidden mr-2">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 text-xs font-medium ${
                activeTab === "edit"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Edit Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 text-xs font-medium ${
                activeTab === "preview"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Live Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isPublishing || isArchiving}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>

          {entry && entry.status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSaving || isPublishing || isArchiving}
              className="px-4 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
          )}

          {entry && entry.status !== "ARCHIVED" && (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isSaving || isPublishing || isArchiving}
              className="px-4 py-1.5 text-sm font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700 shadow-sm disabled:opacity-50"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </button>
          )}
        </div>
      </div>

      {/* Optimistic Concurrency Conflict Banner */}
      {conflict && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">This content was changed by another user.</h3>
            <span className="text-xs bg-red-100 text-red-900 px-2 py-0.5 rounded font-mono">
              Current server revision: {conflict.currentRevision ?? "latest"}
            </span>
          </div>
          <p className="text-xs">
            Your changes were not overwritten. You can reload the latest content from the server, or keep editing your local draft.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 shadow-sm"
            >
              Reload latest
            </button>
            <button
              type="button"
              onClick={() => setConflict(null)}
              className="px-3 py-1 text-xs font-semibold rounded border border-red-300 bg-white text-red-800 hover:bg-red-50"
            >
              Keep editing
            </button>
          </div>
        </div>
      )}

      {/* General error message */}
      {generalError && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium"
        >
          {generalError}
        </div>
      )}

      {/* Success notification */}
      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium"
        >
          {successMessage}
        </div>
      )}

      {/* Content Form / Preview */}
      {activeTab === "edit" ? (
        <div className="space-y-6">
          <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="entry-title" className="block text-sm font-medium text-gray-900 mb-1">
                  Title <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="entry-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Barnawapara Wildlife Sanctuary"
                  className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
                {fieldErrors.title && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="entry-slug" className="block text-sm font-medium text-gray-900 mb-1">
                  Custom Slug (optional)
                </label>
                <input
                  id="entry-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <DynamicEntryForm
            schema={schema}
            values={values}
            onChange={setValues}
            errors={fieldErrors}
          />
        </div>
      ) : (
        <EntryPreview
          title={title}
          slug={slug}
          schema={schema}
          values={values}
        />
      )}
    </div>
  );
}
