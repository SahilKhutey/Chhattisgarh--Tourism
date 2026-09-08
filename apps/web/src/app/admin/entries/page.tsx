'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  Filter,
} from 'lucide-react';
import { ContentEntry } from '../../../types/content';
import { fetchEntries, reviewEntry } from '../../../lib/content/api';
import { EntryStatusBadge } from '../../../components/content/EntryStatusBadge';
import { GenericEntryRenderer } from '../../../components/content/GenericEntryRenderer';

export default function AdminModerationPage() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ContentEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING_REVIEW');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await fetchEntries(
        undefined,
        filterStatus === 'all' ? undefined : (filterStatus as any),
      );
      setEntries(data || []);
    } catch (err) {
      console.warn('Failed to load moderation entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [filterStatus]);

  const handleReview = async (approved: boolean) => {
    if (!selectedEntry) return;

    setReviewing(true);
    try {
      await reviewEntry(selectedEntry.id, {
        approved,
        note: reviewNote.trim() || undefined,
      });

      setActionMessage(
        approved
          ? `Entry "${selectedEntry.title}" approved and published!`
          : `Entry "${selectedEntry.title}" rejected with feedback.`,
      );
      setSelectedEntry(null);
      setReviewNote('');
      await loadEntries();

      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Review submission failed');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Content Moderation Pipeline
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              Review Queue & Quality Governance
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Inspect submitted entries, review geographic data, and approve or reject tourism contributions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/templates"
              className="px-3.5 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50"
            >
              Template Builder
            </Link>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400 ml-1" />
          <span className="text-xs text-stone-500 font-medium">Status:</span>
          {['PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'DRAFT', 'all'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Main Grid: List & Detail Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Entries Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-4 rounded-xl border border-stone-200 h-24 animate-pulse" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-700">No Entries in Queue</h3>
                <p className="text-xs text-stone-400 mt-1">
                  No submissions currently matching &quot;{filterStatus}&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {entries.map((entry) => {
                  const isSelected = selectedEntry?.id === entry.id;
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-stone-900 truncate">
                            {entry.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                            <span>{entry.template?.name || 'Generic Entry'}</span>
                            <span>&bull;</span>
                            <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <EntryStatusBadge status={entry.status} />
                      </div>

                      {entry.lat && entry.lng && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-mono mt-2">
                          <MapPin className="w-3 h-3" />
                          <span>{entry.lat.toFixed(2)}, {entry.lng.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Review Actions & Preview (7 cols) */}
          <div className="lg:col-span-7">
            {selectedEntry ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
                      Reviewing Submission
                    </span>
                    <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                      {selectedEntry.title}
                    </h2>
                  </div>
                  <EntryStatusBadge status={selectedEntry.status} />
                </div>

                {/* Moderator Decision Box */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <label className="block text-xs font-semibold text-stone-700">
                    Review Feedback / Notes (Optional for approval, required for rejection)
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="e.g. Coordinates verified, high-quality images. Or explain needed revisions..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={reviewing}
                      onClick={() => handleReview(false)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      Reject Entry
                    </button>

                    <button
                      type="button"
                      disabled={reviewing}
                      onClick={() => handleReview(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Publish
                    </button>
                  </div>
                </div>

                {/* Entry Live Renderer Preview */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
                    Payload Preview
                  </h3>
                  <GenericEntryRenderer
                    template={{
                      name: selectedEntry.template?.name || 'Entry',
                      fields: selectedEntry.template?.fields?.map((f) => ({
                        key: f.key,
                        label: f.label,
                        fieldType: f.type,
                        order: f.order,
                      })) || [],
                    }}
                    entry={{
                      data: selectedEntry.data,
                      lat: selectedEntry.lat,
                      lng: selectedEntry.lng,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 text-xs">
                Select an entry from the queue on the left to inspect content and render review controls.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
