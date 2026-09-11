'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, Loader2 } from 'lucide-react';
import { ContentTemplate } from '../../../../types/content';
import { fetchTemplates } from '../../../../lib/template';
import { DynamicForm } from '../../../../components/content/DynamicForm';

export default function CreatorNewEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get('templateId');

  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTemplates('PUBLISHED');
        const list: ContentTemplate[] = Array.isArray(res) ? res : (res?.items || []);
        setTemplates(list);

        if (templateIdParam) {
          const match = list.find((t: ContentTemplate) => t.id === templateIdParam || t.slug === templateIdParam);
          if (match) setSelectedTemplate(match);
        } else if (list.length > 0) {
          setSelectedTemplate(list[0]);
        }
      } catch (err) {
        console.warn('Failed to load published templates', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [templateIdParam]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading templates...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/creator/entries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Creator Portal
        </Link>

        {/* Template Selector Pills */}
        {templates.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="block text-xs font-semibold text-stone-500 mb-2">
              Select Tourism Content Schema:
            </span>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                    selectedTemplate?.id === tpl.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTemplate ? (
          <DynamicForm template={selectedTemplate} />
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-500 text-xs">
            No published templates available. Ask an administrator to create and publish a template.
          </div>
        )}
      </div>
    </main>
  );
}
