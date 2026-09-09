'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { fetchTemplate } from '@/lib/template';
import { ContentTemplate } from '@/types/content';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditTemplateBuilderPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [template, setTemplate] = useState<ContentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTemplate() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTemplate(id);
        if (isMounted) {
          setTemplate(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load template data for builder',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadTemplate();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/templates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Templates List
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 flex flex-col items-center justify-center text-stone-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-forest-emerald" />
            <p className="text-sm font-medium">Loading template builder...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold">Unable to load template</h3>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <div className="mt-4">
                <Link
                  href="/admin/templates"
                  className="text-xs font-medium bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg transition-colors inline-block"
                >
                  Return to Templates
                </Link>
              </div>
            </div>
          </div>
        ) : template ? (
          <TemplateBuilder
            initialTemplate={template}
            onSaved={(updated) => {
              setTemplate(updated);
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
