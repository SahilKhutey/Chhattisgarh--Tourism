"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ContentEntry } from "../../../types/content-entry";
import { listContentEntries } from "../../../lib/api/content-entries";

export default function ContentDashboardPage() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listContentEntries({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setEntries(data.items);
    } catch (err) {
      setError((err as Error).message || "Failed to load content entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEntries();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Entries</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage, edit, publish, and monitor tourism content entries bound to template versions.
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
        >
          + Create Content
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 flex gap-2">
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="status-filter" className="text-xs font-medium text-gray-500 whitespace-nowrap">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border rounded-md border-gray-300 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div role="alert" className="p-4 rounded-md bg-red-50 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-base font-medium text-gray-700">No content entries found.</p>
            <p className="text-xs text-gray-500">
              Create your first entry against a published tourism template.
            </p>
            <Link
              href="/admin/content/new"
              className="inline-block mt-2 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded border border-amber-200 hover:bg-amber-100"
            >
              Create Content Entry
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3">Title & Slug</th>
                <th className="px-6 py-3">Template & Version</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Revision</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/content/${entry.id}`}
                      className="font-medium text-amber-900 hover:text-amber-700 block"
                    >
                      {entry.title}
                    </Link>
                    <span className="text-xs text-gray-400 font-mono">/{entry.slug}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-800">
                      {entry.template_name || "Template"}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                        v{entry.template_version_number ?? 1}
                      </span>
                      {entry.schema_state === "STALE" && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded border border-amber-300">
                          STALE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : entry.status === "ARCHIVED"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600">
                    r{entry.revision}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(entry.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-3">
                    <Link
                      href={`/admin/content/${entry.id}`}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      Edit
                    </Link>
                    {entry.status === "PUBLISHED" && (
                      <Link
                        href={`/content/${entry.template_name?.toLowerCase() || "destination"}/${entry.slug}`}
                        target="_blank"
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        View Public
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
