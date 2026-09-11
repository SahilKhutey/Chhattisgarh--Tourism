"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RuntimeSchema } from "../../../../types/content-entry";
import { getRuntimeSchema } from "../../../../lib/api/content-entries";
import { listAdminTemplates } from "@/lib/api/admin-templates";
import { AdminTemplateItem } from "@/types/admin-template";
import { ContentEntryEditor } from "../../../../components/content-entry/ContentEntryEditor";

function NewContentContent() {
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("template");
  const router = useRouter();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templateIdParam || "",
  );
  const [templates, setTemplates] = useState<AdminTemplateItem[]>([]);
  const [schema, setSchema] = useState<RuntimeSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load published templates for selection
  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await listAdminTemplates({ status: "PUBLISHED" });
        setTemplates(res.items);
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    }
    loadTemplates();
  }, []);

  // When template selected, fetch runtime schema
  useEffect(() => {
    if (!selectedTemplateId) {
      setSchema(null);
      return;
    }

    async function loadSchema() {
      setLoading(true);
      setError(null);
      try {
        const data = await getRuntimeSchema(selectedTemplateId);
        setSchema(data);
      } catch (err) {
        setError((err as Error).message || "Unable to load runtime schema.");
        setSchema(null);
      } finally {
        setLoading(false);
      }
    }

    loadSchema();
  }, [selectedTemplateId]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Content Entry</h1>
          <p className="text-sm text-gray-500">
            Generate and validate new tourism content against a published template version.
          </p>
        </div>
        <Link
          href="/admin/content"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Content
        </Link>
      </div>

      {/* Template Selector if not preset or to change */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm space-y-2">
        <label htmlFor="template-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
          Target Tourism Template
        </label>
        <select
          id="template-select"
          value={selectedTemplateId}
          onChange={(e) => {
            setSelectedTemplateId(e.target.value);
            router.push(`/admin/content/new?template=${e.target.value}`);
          }}
          className="w-full sm:w-96 px-3 py-2 border rounded-md border-gray-300 text-sm bg-white"
        >
          <option value="">-- Choose a published template --</option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name} ({tpl.slug})
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="p-12 text-center text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
          Loading runtime schema...
        </div>
      )}

      {error && (
        <div role="alert" className="p-4 rounded-md bg-red-50 text-red-800 text-sm border border-red-200">
          <p className="font-semibold">Cannot Create Content</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {schema && selectedTemplateId && !loading && (
        <ContentEntryEditor
          templateId={selectedTemplateId}
          schema={schema}
          onSaved={(created) => {
            router.push(`/admin/content/${created.id}`);
          }}
        />
      )}
    </div>
  );
}

export default function NewContentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading...</div>}>
      <NewContentContent />
    </Suspense>
  );
}
