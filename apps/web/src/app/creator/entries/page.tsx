'use client';

import React, { useEffect, useState } from 'react';
import { DynamicForm } from '@/components/dynamic-form/DynamicForm';
import { ContentTemplate } from '@/components/template-builder/types';
import { getApiBase } from '@/app/data/api-config';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/Button';
import { Sparkles, Layers, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatorEntriesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuthStore();

  const API_BASE = getApiBase();

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch(`${API_BASE}/templates`);
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
          if (data.length > 0 && !selectedTemplate) {
            setSelectedTemplate(data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load published templates', err);
      }
    }
    loadTemplates();
  }, [API_BASE]);

  const handleSubmitEntry = async (
    formData: Record<string, any>,
    status: 'DRAFT' | 'PENDING_REVIEW',
  ) => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        templateId: selectedTemplate.id,
        data: formData,
        status,
      };

      const res = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit content entry');
      }

      const created = await res.json();
      toast.success(
        status === 'PENDING_REVIEW'
          ? 'Content submitted for moderation review!'
          : 'Draft saved successfully!',
      );
    } catch (err: any) {
      toast.error(err.message || 'Error creating entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-sand-beige/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-forest-emerald text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Creator Portal &bull; Dynamic Content Entry
            </div>
            <h1 className="text-2xl font-bold text-charcoal-stone">
              Contribute Tourism Content
            </h1>
            <p className="text-sm text-charcoal-stone/70 mt-1">
              Select a standardized content template and enter verified cultural, geographical, or tourism data.
            </p>
          </div>
        </div>

        {/* Template Selector Pills */}
        {templates.length > 0 && (
          <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-4 shadow-xs">
            <label className="block text-xs font-semibold text-charcoal-stone/60 mb-2">
              Select Tourism Content Template:
            </label>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    selectedTemplate?.id === tpl.id
                      ? 'bg-forest-emerald text-white shadow-xs'
                      : 'bg-sand-beige/40 text-charcoal-stone hover:bg-sand-beige/70'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Dynamic Form */}
        {selectedTemplate ? (
          <DynamicForm
            template={selectedTemplate}
            onSubmit={handleSubmitEntry}
            isLoading={isLoading}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-12 text-center">
            <p className="text-sm text-charcoal-stone/60">
              No published templates available. Please ask an administrator to publish a template.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
