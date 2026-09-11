"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ContentEntry, RuntimeSchema } from "../../../../types/content-entry";
import {
  getContentEntry,
  getRuntimeSchema,
} from "../../../../lib/api/content-entries";
import { ContentEntryEditor } from "../../../../components/content-entry/ContentEntryEditor";

export default function EditContentPage() {
  const params = useParams();
  const entryId = params.id as string;

  const [entry, setEntry] = useState<ContentEntry | null>(null);
  const [schema, setSchema] = useState<RuntimeSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!entryId) return;
      setLoading(true);
      setError(null);
      try {
        const entryData = await getContentEntry(entryId);
        setEntry(entryData);

        const schemaData = await getRuntimeSchema(entryData.template_id);
        setSchema(schemaData);
      } catch (err) {
        setError((err as Error).message || "Unable to load content entry.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [entryId]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {entry ? `Edit: ${entry.title}` : "Edit Content Entry"}
          </h1>
          <p className="text-sm text-gray-500">
            {entry ? `Entry ID: ${entry.id}` : "Loading..."}
          </p>
        </div>
        <Link
          href="/admin/content"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Content
        </Link>
      </div>

      {loading && (
        <div className="p-12 text-center text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
          Loading content entry...
        </div>
      )}

      {error && (
        <div role="alert" className="p-4 rounded-md bg-red-50 text-red-800 text-sm border border-red-200">
          <p className="font-semibold">Error Loading Entry</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {entry && schema && !loading && (
        <ContentEntryEditor
          templateId={entry.template_id}
          schema={schema}
          initialEntry={entry}
          onSaved={(updated) => setEntry(updated)}
        />
      )}
    </div>
  );
}
