'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { ContentTemplate } from '../../../../../types/content';
import { fetchTemplate } from '../../../../../lib/template';
import { DynamicForm } from '../../../../../components/content/DynamicForm';

export default function NewCreatorEntryPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<ContentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTemplate(templateId);
        if (!data) {
          setError(`Template "${templateId}" could not be found.`);
        } else {
          setTemplate(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load content template.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [templateId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading template form schema...</span>
        </div>
      </main>
    );
  }

  if (error || !template) {
    return (
      <main className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-stone-900">Template Not Found</h2>
          <p className="text-xs text-stone-500">{error || 'The requested template does not exist.'}</p>
          <Link
            href="/creator/entries"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Entries
          </Link>
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
          <ArrowLeft className="w-4 h-4" /> Back to Creator Hub
        </Link>

        <DynamicForm template={template} />
      </div>
    </main>
  );
}
