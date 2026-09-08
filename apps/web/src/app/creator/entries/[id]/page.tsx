'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import { ContentEntry } from '../../../../types/content';
import { fetchEntryById, submitEntry } from '../../../../lib/content/api';
import { DynamicForm } from '../../../../components/content/DynamicForm';
import { EntryStatusBadge } from '../../../../components/content/EntryStatusBadge';

export default function CreatorEditEntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [entry, setEntry] = useState<ContentEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEntryById(id);
      setEntry(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load content entry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleResubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await submitEntry(id);
      router.push('/creator/entries');
    } catch (err: any) {
      alert(err.message || 'Failed to submit entry for review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading entry details...</span>
        </div>
      </main>
    );
  }

  if (error || !entry) {
    return (
      <main className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-stone-900">Entry Not Found</h2>
          <p className="text-xs text-stone-500">{error || 'Unable to locate requested entry.'}</p>
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
        <div className="flex items-center justify-between">
          <Link
            href="/creator/entries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Creator Portal
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Current Status:</span>
            <EntryStatusBadge status={entry.status} />
          </div>
        </div>

        {/* Review feedback note banner if rejected or note provided */}
        {(entry as any).reviewNote && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Moderator Feedback</span>
            </div>
            <p className="text-amber-800 leading-relaxed pl-6">
              {(entry as any).reviewNote}
            </p>
          </div>
        )}

        {/* Dynamic Form with initial data */}
        {entry.template ? (
          <DynamicForm
            template={entry.template}
            initialEntry={entry}
          />
        ) : (
          <div className="p-6 bg-white rounded-xl border border-stone-200 text-xs text-stone-500">
            Missing template definition for this entry.
          </div>
        )}
      </div>
    </main>
  );
}
