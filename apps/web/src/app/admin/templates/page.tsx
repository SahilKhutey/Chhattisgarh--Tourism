'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Plus,
  LayoutTemplate,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Edit,
  History,
  Copy,
  Archive,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  MapPin,
  Landmark,
  Mountain,
  Music,
  Camera,
  Trees,
  Utensils,
  Award,
  BookOpen,
} from 'lucide-react';
import { ContentTemplate, TemplateStatus } from '../../../types/content';
import {
  fetchTemplates,
  publishTemplate,
  duplicateTemplate,
  archiveTemplate,
  QueryTemplatesParams,
} from '../../../lib/template';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass: LayoutTemplate,
  MapPin,
  Landmark,
  Mountain,
  Sparkles,
  Music,
  Camera,
  Trees,
  Utensils,
  Award,
  BookOpen,
  Layers,
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TemplateStatus | 'ALL'>('ALL');
  const [category, setCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'entryCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [isPending, startTransition] = useTransition();

  const load = async () => {
    setLoading(true);
    try {
      const params: QueryTemplatesParams = {
        search: search.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
        category: category !== 'ALL' ? category : undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      };

      const res = await fetchTemplates(params);
      if (Array.isArray(res)) {
        setTemplates(res);
        setTotal(res.length);
        setTotalPages(1);
      } else if (res && typeof res === 'object') {
        setTemplates(res.items || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.warn('Could not fetch templates from backend; using local fallback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, status, category, sortBy, sortOrder, page]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handlePublish = async (id: string, name: string) => {
    try {
      await publishTemplate(id);
      showToast(`Template "${name}" published successfully!`);
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish template', 'error');
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    try {
      await duplicateTemplate(id);
      showToast(`Duplicated "${name}" into a new draft template!`);
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate template', 'error');
    }
  };

  const handleArchive = async (id: string, name: string, entriesCount: number) => {
    if (entriesCount > 0) {
      showToast(`Cannot archive "${name}" because it has ${entriesCount} active entry/entries. Archive or reassign entries first.`, 'error');
      return;
    }
    if (!confirm(`Are you sure you want to archive template "${name}"?`)) {
      return;
    }
    try {
      await archiveTemplate(id);
      showToast(`Template "${name}" archived successfully!`);
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive template', 'error');
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

        {/* Action Message Toast */}
        {actionMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Filter / Search Controls */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Box */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or slug..."
                className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                <option value="ALL">All Categories</option>
                <option value="Culture & Heritage">Culture & Heritage</option>
                <option value="Eco & Nature">Eco & Nature</option>
                <option value="Tribal Craft">Tribal Craft</option>
                <option value="Spiritual & Temples">Spiritual & Temples</option>
                <option value="Culinary Tourism">Culinary Tourism</option>
                <option value="Adventure & Wildlife">Adventure & Wildlife</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="updatedAt-asc">Oldest Updated</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="entryCount-desc">Most Entries</option>
                <option value="entryCount-asc">Fewest Entries</option>
              </select>
            </div>
          </div>
        </div>

        {/* Templates Table View */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center">
              <LayoutTemplate className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">No Templates Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                No templates matched your current filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('ALL');
                  setCategory('ALL');
                }}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 divide-y divide-stone-200">
                <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Template & Key
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Version
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Entries
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {templates.map((tpl) => {
                    const IconComponent = (tpl.icon && ICON_MAP[tpl.icon]) || LayoutTemplate;
                    const entriesCount = tpl.entryCount ?? 0;

                    return (
                      <tr
                        key={tpl.id}
                        className="hover:bg-stone-50/80 transition-colors group cursor-pointer"
                      >
                        {/* Name, Icon, Slug */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <Link
                                href={`/admin/templates/${tpl.id}/builder`}
                                className="font-bold text-stone-900 hover:text-emerald-700 text-sm flex items-center gap-1.5"
                              >
                                {tpl.name}
                              </Link>
                              <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                                /{tpl.slug}
                              </div>
                              {tpl.category && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-medium">
                                  {tpl.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              tpl.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : tpl.status === 'ARCHIVED'
                                  ? 'bg-stone-100 text-stone-600 border border-stone-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {tpl.status}
                          </span>
                        </td>

                        {/* Current Version */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/templates/${tpl.id}/versions`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-xs font-semibold"
                            title="View version history"
                          >
                            v{tpl.version}
                            <History className="w-3 h-3 text-stone-400" />
                          </Link>
                        </td>

                        {/* Entry Count */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              entriesCount > 0
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {entriesCount} {entriesCount === 1 ? 'entry' : 'entries'}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="px-6 py-4 text-stone-500 whitespace-nowrap">
                          {new Date(tpl.updatedAt || tpl.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Row Actions */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Builder */}
                            <Link
                              href={`/admin/templates/${tpl.id}/builder`}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                              title="Edit in Template Builder"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Versions */}
                            <Link
                              href={`/admin/templates/${tpl.id}/versions`}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                              title="Version History & Rollback"
                            >
                              <History className="w-3.5 h-3.5" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(tpl.id, tpl.name);
                              }}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
                              title="Duplicate Template"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Publish (if DRAFT) */}
                            {tpl.status === 'DRAFT' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublish(tpl.id, tpl.name);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                                title="Publish Template"
                              >
                                <Send className="w-3 h-3" /> Publish
                              </button>
                            )}

                            {/* Archive */}
                            {tpl.status !== 'ARCHIVED' && (
                              <button
                                type="button"
                                disabled={entriesCount > 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchive(tpl.id, tpl.name, entriesCount);
                                }}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  entriesCount > 0
                                    ? 'border-stone-100 text-stone-300 cursor-not-allowed'
                                    : 'border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                                }`}
                                title={
                                  entriesCount > 0
                                    ? `Cannot archive: ${entriesCount} active entry/entries linked`
                                    : 'Archive Template'
                                }
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div>
                Showing page <span className="font-semibold text-stone-800">{page}</span> of{' '}
                <span className="font-semibold text-stone-800">{totalPages}</span> ({total} templates)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-white text-stone-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-white text-stone-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

