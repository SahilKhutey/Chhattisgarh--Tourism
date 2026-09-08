'use client';

import React, { useEffect, useState } from 'react';
import { TemplateBuilder } from '@/components/template-builder/TemplateBuilder';
import { ContentTemplate } from '@/components/template-builder/types';
import { getApiBase } from '@/app/data/api-config';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/Button';
import { Plus, LayoutTemplate, Layers, CheckCircle2, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuthStore();

  const API_BASE = getApiBase();

  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/templates`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Failed to load templates', err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [API_BASE]);

  const handleSaveTemplate = async (
    templateData: Partial<ContentTemplate>,
    shouldPublish?: boolean,
  ) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Create or update template
      const res = await fetch(`${API_BASE}/admin/templates`, {
        method: 'POST',
        headers,
        body: JSON.stringify(templateData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save template');
      }

      const created = await res.json();

      if (shouldPublish && created.id) {
        const pubRes = await fetch(`${API_BASE}/admin/templates/${created.id}/publish`, {
          method: 'POST',
          headers,
        });
        if (!pubRes.ok) {
          throw new Error('Template created, but failed to publish.');
        }
      }

      toast.success(
        shouldPublish
          ? 'Template created and published successfully!'
          : 'Template draft saved successfully!',
      );
      setIsCreating(false);
      setSelectedTemplate(null);
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message || 'Error saving template');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreating || selectedTemplate) {
    return (
      <main className="min-h-screen bg-sand-beige/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mb-6">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setIsCreating(false);
              setSelectedTemplate(null);
            }}
          >
            &larr; Back to Templates List
          </Button>
        </div>
        <TemplateBuilder
          initialTemplate={selectedTemplate || undefined}
          onSave={handleSaveTemplate}
          isLoading={isLoading}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sand-beige/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-forest-emerald text-xs font-semibold uppercase tracking-wider mb-1">
              <LayoutTemplate className="w-4 h-4" />
              Generic Content Architecture
            </div>
            <h1 className="text-2xl font-bold text-charcoal-stone">
              Content Template Engine
            </h1>
            <p className="text-sm text-charcoal-stone/70 mt-1">
              Define, version, and publish generic tourism schemas without modifying backend models.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>

        {/* Existing Templates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-charcoal-stone/15 p-6 shadow-xs hover:border-forest-emerald/40 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-sand-beige/50 text-forest-emerald">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      tpl.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : tpl.status === 'ARCHIVED'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {tpl.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-charcoal-stone">{tpl.name}</h3>
                  <div className="text-xs font-mono text-charcoal-stone/50 mt-0.5">
                    /{tpl.slug} &bull; v{tpl.version}
                  </div>
                  <p className="text-xs text-charcoal-stone/70 mt-2 line-clamp-2">
                    {tpl.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-charcoal-stone/10">
                  <span className="text-xs font-semibold text-charcoal-stone/60">
                    Fields: {tpl.fields?.length || 0} configured
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tpl.fields?.slice(0, 4).map((f) => (
                      <span
                        key={f.key}
                        className="px-2 py-0.5 rounded-md bg-sand-beige/40 text-[10px] text-charcoal-stone font-mono"
                      >
                        {f.key}
                      </span>
                    ))}
                    {(tpl.fields?.length || 0) > 4 && (
                      <span className="text-[10px] text-charcoal-stone/40">
                        +{tpl.fields.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-charcoal-stone/10 flex items-center justify-between">
                <a
                  href={`/content/${tpl.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-forest-emerald hover:underline"
                >
                  View Public Entries &rarr;
                </a>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedTemplate(tpl)}
                >
                  Edit Schema
                </Button>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border-2 border-dashed border-charcoal-stone/20 p-12 text-center">
              <LayoutTemplate className="w-10 h-10 text-charcoal-stone/30 mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal-stone">No Templates Found</h3>
              <p className="text-xs text-charcoal-stone/60 max-w-sm mx-auto mt-1 mb-4">
                Get started by creating your first generic tourism template (e.g. Destination, Folk Story, or Festival).
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsCreating(true)}
              >
                Create Template
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
