'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ContentEntry, ContentTemplate } from '../../../types/content';
import { fetchEntries, fetchTemplates } from '../../../lib/template';

export default function CreatorEntriesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tplList, entryList] = await Promise.all([
          fetchTemplates('PUBLISHED').catch(() => []),
          fetchEntries().catch(() => []),
        ]);
        setTemplates(tplList || []);
        setEntries(entryList || []);
      } catch (err) {
        console.warn('Failed to load creator hub data', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredEntries =
    selectedTemplateId === 'all'
      ? entries
      : entries.filter((e) => e.templateId === selectedTemplateId);

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Creator Portal &bull; Dynamic Tourism Entries
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              My Tourism Contributions
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Author and submit cultural, geographical, and historical tourism entries using published schemas.
            </p>
          </div>

          {templates.length > 0 && (
            <Link
              href={`/creator/entries/new/${templates[0].id}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </Link>
          )}
        </div>

        {/* Template Creation Shortcuts */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Create Entry by Tourism Schema
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {templates.map((tpl) => (
              <Link
                key={tpl.id}
                href={`/creator/entries/new/${tpl.id}`}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 hover:text-emerald-900 text-xs font-semibold transition-all group"
              >
                <Layers className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600" />
                <span>{tpl.name}</span>
                <span className="text-[10px] text-stone-400 font-mono">v{tpl.version}</span>
              </Link>
            ))}

            {templates.length === 0 && !loading && (
              <p className="text-xs text-stone-400 italic">
                No published templates yet. Ask an admin to publish a template.
              </p>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedTemplateId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTemplateId === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              All Entries ({entries.length})
            </button>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedTemplateId === tpl.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-stone-200 p-4 h-20 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-800">No Entries Authored Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              Contribute heritage and tourism knowledge to Chhattisgarh by choosing a template above.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 shadow-sm overflow-hidden">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900">{entry.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        entry.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : entry.status === 'APPROVED'
                            ? 'bg-blue-50 text-blue-700'
                            : entry.status === 'PENDING_REVIEW'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    {entry.template?.name && (
                      <span className="font-medium text-stone-700">
                        {entry.template.name}
                      </span>
                    )}
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    {entry.lat && entry.lng && (
                      <>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-mono text-[11px]">
                          Geo: {entry.lat.toFixed(2)}, {entry.lng.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/content/${entry.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 text-xs font-semibold bg-white transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Entry
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
