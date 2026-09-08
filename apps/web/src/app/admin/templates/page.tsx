'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  LayoutTemplate,
  Layers,
  CheckCircle2,
  ExternalLink,
  Edit,
  Eye,
} from 'lucide-react';
import { ContentTemplate } from '../../../types/content';
import { fetchTemplates, publishTemplate } from '../../../lib/template';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.warn('Could not fetch templates from backend; fallback mock/offline active', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await publishTemplate(id);
      setActionMessage('Template published successfully!');
      await load();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to publish template');
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <LayoutTemplate className="w-4 h-4" />
              Generic Content Architecture
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              Content Template Engine
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Define, version, and publish generic tourism schemas without modifying backend code.
            </p>
          </div>

          <Link
            href="/admin/templates/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create New Template
          </Link>
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Existing Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-stone-200 p-6 h-52 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:border-emerald-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        tpl.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tpl.status === 'ARCHIVED'
                            ? 'bg-stone-100 text-stone-600'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {tpl.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-900">{tpl.name}</h3>
                    <div className="text-xs font-mono text-stone-400 mt-0.5">
                      /{tpl.slug} &bull; v{tpl.version}
                    </div>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2">
                      {tpl.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-xs font-semibold text-stone-500">
                      Fields: {tpl.fields?.length || 0} configured
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tpl.fields?.slice(0, 4).map((f) => (
                        <span
                          key={f.key}
                          className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] text-stone-700 font-mono"
                        >
                          {f.key}
                        </span>
                      ))}
                      {(tpl.fields?.length || 0) > 4 && (
                        <span className="text-[10px] text-stone-400">
                          +{tpl.fields.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/content/${tpl.slug}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Public View
                  </Link>

                  <div className="flex items-center gap-2">
                    {tpl.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => handlePublish(tpl.id)}
                        className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                      >
                        Publish
                      </button>
                    )}
                    <Link
                      href={`/creator/entries/new/${tpl.id}`}
                      className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium"
                    >
                      + Entry
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center">
                <LayoutTemplate className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">No Templates Found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                  Get started by creating your first generic tourism template (e.g. Festival, Waterfall, or Craft).
                </p>
                <Link
                  href="/admin/templates/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Create Template
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
