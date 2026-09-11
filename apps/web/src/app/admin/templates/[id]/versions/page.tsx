'use client';

import React, { use, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Clock,
  User,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  fetchTemplate,
  fetchTemplateVersions,
  fetchTemplateVersionDiff,
  rollbackTemplate,
  TemplateVersionItem,
  VersionDiffItem,
} from '@/lib/template';
import { ContentTemplate } from '@/types/content';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TemplateVersionsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [template, setTemplate] = useState<ContentTemplate | null>(null);
  const [versions, setVersions] = useState<TemplateVersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded diff state keyed by version number
  const [expandedVersions, setExpandedVersions] = useState<Record<number, boolean>>({});
  const [diffs, setDiffs] = useState<Record<number, VersionDiffItem>>({});
  const [loadingDiffs, setLoadingDiffs] = useState<Record<number, boolean>>({});

  // Rollback modal state
  const [rollbackTarget, setRollbackTarget] = useState<TemplateVersionItem | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  // Banner notification
  const [notification, setNotification] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplData, verData] = await Promise.all([
        fetchTemplate(id),
        fetchTemplateVersions(id),
      ]);
      setTemplate(tplData);
      setVersions(verData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load template version history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const toggleDiff = async (versionNum: number) => {
    const isCurrentlyExpanded = expandedVersions[versionNum];

    setExpandedVersions((prev) => ({
      ...prev,
      [versionNum]: !isCurrentlyExpanded,
    }));

    // If expanding and diff not yet fetched, fetch it
    if (!isCurrentlyExpanded && !diffs[versionNum]) {
      setLoadingDiffs((prev) => ({ ...prev, [versionNum]: true }));
      try {
        const diffData = await fetchTemplateVersionDiff(id, versionNum);
        setDiffs((prev) => ({ ...prev, [versionNum]: diffData }));
      } catch (err: any) {
        setNotification({
          text: `Failed to load diff for version ${versionNum}: ${err?.message || 'Unknown error'}`,
          type: 'error',
        });
      } finally {
        setLoadingDiffs((prev) => ({ ...prev, [versionNum]: false }));
      }
    }
  };

  const handleRollbackConfirm = async () => {
    if (!rollbackTarget) return;

    setIsRollingBack(true);
    setNotification(null);
    try {
      const updated = await rollbackTemplate(id, rollbackTarget.version);
      setTemplate(updated);
      setNotification({
        text: `Live pointer successfully rolled back to Version ${rollbackTarget.version}.`,
        type: 'success',
      });
      setRollbackTarget(null);
      // Reload versions to reflect fresh state
      startTransition(async () => {
        const refreshedVersions = await fetchTemplateVersions(id);
        setVersions(refreshedVersions);
      });
    } catch (err: any) {
      setNotification({
        text: err?.message || `Failed to rollback template to version ${rollbackTarget.version}.`,
        type: 'error',
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  const currentLiveVersion = template?.publishedVersion ?? template?.version ?? 1;

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-stone-600 font-medium">Loading version timeline...</p>
        </div>
      </main>
    );
  }

  if (error || !template) {
    return (
      <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Unable to load version history</h2>
          <p className="text-stone-600 text-sm">{error || 'Template not found'}</p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/admin/templates"
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Back to Templates
            </Link>
            <button
              onClick={loadData}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/templates"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Templates
            </Link>
            <span className="text-stone-300">/</span>
            <Link
              href={`/admin/templates/${template.id}/builder`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm"
            >
              Builder
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/templates/${template.id}/builder`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl shadow-sm transition-colors"
            >
              Edit in Builder
            </Link>
          </div>
        </div>

        {/* Overview Banner */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-stone-900">{template.name}</h1>
              <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md border border-stone-200">
                {template.slug}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  template.status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : template.status === 'DRAFT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {template.status}
              </span>
            </div>
            <p className="text-sm text-stone-600 max-w-2xl">
              {template.description || 'Version history and schema snapshot timeline for this template.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-stone-50 px-5 py-3.5 rounded-xl border border-stone-200 self-start md:self-center shrink-0">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Live Pointer
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-emerald-700">
                  v{currentLiveVersion}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Releases
              </span>
              <span className="text-lg font-bold text-stone-800 mt-0.5">
                {versions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-stone-600 text-xs uppercase font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Timeline Content */}
        {versions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-stone-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No Published Versions Yet</h3>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              This template is currently in draft. Once you publish it in the Template Builder,
              an immutable snapshot will be recorded here with complete audit trail and rollback capabilities.
            </p>
            <Link
              href={`/admin/templates/${template.id}/builder`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Open Builder to Publish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
                <History className="w-4 h-4 text-stone-600" />
                Snapshot History ({versions.length})
              </h2>
              <span className="text-xs text-stone-500">
                Snapshots are immutable records preserved on every publish.
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-0.5 before:bg-stone-200 before:z-0">
              {versions.map((ver) => {
                const isLive = ver.version === currentLiveVersion;
                const isExpanded = !!expandedVersions[ver.version];
                const diff = diffs[ver.version];
                const isLoadingDiff = !!loadingDiffs[ver.version];

                return (
                  <div
                    key={ver.id || ver.version}
                    className={`relative z-10 bg-white rounded-2xl border transition-all shadow-sm ${
                      isLive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Version badge and metadata */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${
                            isLive
                              ? 'bg-emerald-700 text-white shadow-emerald-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          v{ver.version}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-stone-900 text-base">
                              Release v{ver.version}
                            </span>
                            {isLive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Current Live Pointer
                              </span>
                            )}
                            {ver.version > currentLiveVersion && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                Newer Historical Snapshot
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              {new Date(ver.publishedAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-stone-400" />
                              {ver.createdBy}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-stone-600">
                              <Layers className="w-3.5 h-3.5 text-stone-400" />
                              {ver.fieldCount} fields
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleDiff(ver.version)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            isExpanded
                              ? 'bg-stone-100 text-stone-900 border-stone-300'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {isExpanded ? (
                            <>
                              Hide Changes
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              Inspect Changes
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        {!isLive ? (
                          <button
                            type="button"
                            onClick={() => setRollbackTarget(ver)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Rollback
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-1 cursor-default">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Active
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Diff Section */}
                    {isExpanded && (
                      <div className="border-t border-stone-100 bg-stone-50/75 p-5 sm:p-6 rounded-b-2xl">
                        {isLoadingDiff ? (
                          <div className="flex items-center justify-center py-6 gap-2 text-stone-500 text-xs font-medium">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            Calculating schema diff and upgrade risk...
                          </div>
                        ) : diff ? (
                          <div className="space-y-4">
                            {/* Risk Header */}
                            <div
                              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                diff.riskLevel === 'BREAKING'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {diff.riskLevel === 'BREAKING' ? (
                                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                                ) : (
                                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                )}
                                <div>
                                  <span className="font-bold text-xs uppercase tracking-wider block">
                                    {diff.riskLevel === 'BREAKING'
                                      ? 'Contains Breaking Changes'
                                      : 'Fully Backward Compatible'}
                                  </span>
                                  <p className="text-xs mt-0.5 opacity-90">{diff.summary}</p>
                                </div>
                              </div>

                              <div className="text-xs font-medium self-end sm:self-center shrink-0">
                                {diff.fromVersion === 0 ? (
                                  <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                                    Initial Release
                                  </span>
                                ) : (
                                  <span className="bg-white/80 px-2 py-0.5 rounded border">
                                    Comparing v{diff.toVersion} vs v{diff.fromVersion}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Changes List */}
                            {diff.changes && diff.changes.length > 0 ? (
                              <div className="space-y-2">
                                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block px-0.5">
                                  Field-Level Changes ({diff.changes.length})
                                </span>
                                <div className="space-y-2">
                                  {diff.changes.map((change, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-white p-3 rounded-xl border border-stone-200 flex items-start justify-between gap-3 text-xs"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                              change.type === 'ADDED'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : change.type === 'REMOVED'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}
                                          >
                                            {change.type}
                                          </span>
                                          <span className="font-bold text-stone-800 font-mono">
                                            {change.key}
                                          </span>
                                          {change.fieldLabel && (
                                            <span className="text-stone-500 font-sans">
                                              ({change.fieldLabel})
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-stone-600 pl-0.5">{change.detail}</p>
                                      </div>

                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                                          change.changeType === 'BREAKING'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}
                                      >
                                        {change.changeType}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-stone-500 italic py-1 px-1">
                                {diff.fromVersion === 0
                                  ? `Initial version snapshot containing ${ver.fieldCount} fields.`
                                  : 'No schema differences detected against the previous snapshot.'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-500 italic py-1">
                            Failed to compute diff for this version.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rollback Confirmation Modal */}
      {rollbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Rollback Live Pointer to v{rollbackTarget.version}
                </h3>
                <p className="text-xs text-stone-500">
                  Target: {template.name} ({template.slug})
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Non-Destructive Pointer Shift
              </div>
              <p>
                Rolling back moves the active template pointer to <strong>v{rollbackTarget.version}</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-amber-800/90">
                <li>Existing content entries created with newer releases remain completely intact.</li>
                <li>Newer snapshots (up to v{template.version}) remain in history and can be re-promoted anytime.</li>
                <li>New entries created after rollback will conform to schema v{rollbackTarget.version}.</li>
              </ul>
            </div>

            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-500">Snapshot Date:</span>
              <span className="font-semibold text-stone-800">
                {new Date(rollbackTarget.publishedAt).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRollbackTarget(null)}
                disabled={isRollingBack}
                className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRollbackConfirm}
                disabled={isRollingBack}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {isRollingBack ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rolling back...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Confirm Rollback to v{rollbackTarget.version}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
