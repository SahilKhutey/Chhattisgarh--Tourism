'use client';

import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  CheckCircle2,
  Code2,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { FieldPalette } from './FieldPalette';
import { ContentTemplate, FieldType, TemplateFieldConfig } from './types';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface TemplateBuilderProps {
  initialTemplate?: ContentTemplate;
  onSave?: (template: Partial<ContentTemplate>, shouldPublish?: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function TemplateBuilder({
  initialTemplate,
  onSave,
  isLoading = false,
}: TemplateBuilderProps) {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [slug, setSlug] = useState(initialTemplate?.slug || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [icon, setIcon] = useState(initialTemplate?.icon || 'Compass');
  const [fields, setFields] = useState<TemplateFieldConfig[]>(
    initialTemplate?.fields || [
      {
        key: 'title',
        label: 'Title',
        fieldType: 'TEXT',
        required: true,
        order: 0,
        translatable: true,
        options: { minLength: 3, maxLength: 100 },
      },
    ],
  );
  const [showJson, setShowJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Auto-generate slug from name if empty
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initialTemplate) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      );
    }
  };

  const addField = (fieldType: FieldType) => {
    const fieldCount = fields.length;
    const baseKey = fieldType.toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${baseKey}_${fieldCount + 1}`;
    const label = `${fieldType.charAt(0) + fieldType.slice(1).toLowerCase()} ${fieldCount + 1}`;

    const newField: TemplateFieldConfig = {
      key,
      label,
      fieldType,
      required: false,
      order: fieldCount,
      translatable: fieldType === 'TEXT' || fieldType === 'TEXTAREA' || fieldType === 'RICHTEXT',
      options:
        fieldType === 'DROPDOWN' || fieldType === 'MULTISELECT'
          ? {
              options: [
                { label: 'Option A', value: 'OPTION_A' },
                { label: 'Option B', value: 'OPTION_B' },
              ],
            }
          : fieldType === 'NUMBER'
            ? { min: 0, max: 10000 }
            : null,
    };

    setFields([...fields, newField]);
    toast.success(`Added ${fieldType} field`);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i }));
    setFields(updated);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index]!;
    updated[index] = updated[targetIndex]!;
    updated[targetIndex] = temp;

    // Recalculate orders
    setFields(updated.map((f, i) => ({ ...f, order: i })));
  };

  const updateField = (index: number, patch: Partial<TemplateFieldConfig>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index]!, ...patch };
    setFields(updated);
  };

  const handleSave = async (publish: boolean) => {
    if (!name.trim() || !slug.trim()) {
      toast.error('Template Name and Slug are required');
      return;
    }
    if (fields.length === 0) {
      toast.error('At least one field is required');
      return;
    }

    // Check unique keys
    const keys = fields.map((f) => f.key.trim());
    const uniqueKeys = new Set(keys);
    if (uniqueKeys.size !== keys.length) {
      toast.error('All field keys must be unique within the template');
      return;
    }

    if (onSave) {
      await onSave(
        {
          name,
          slug,
          description,
          icon,
          fields,
        },
        publish,
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-forest-emerald/10 text-forest-emerald">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-charcoal-stone">
              {initialTemplate ? 'Edit Content Template' : 'Create Generic Content Template'}
            </h1>
          </div>
          <p className="text-sm text-charcoal-stone/70 mt-1">
            Build schema definitions for tourism entities (Temples, Waterfalls, Folk Arts, Cuisines) without hardcoding database tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-2"
          >
            <Code2 className="w-4 h-4" />
            {showJson ? 'Hide JSON' : 'View Schema JSON'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            isLoading={isLoading}
            onClick={() => handleSave(false)}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isLoading}
            onClick={() => handleSave(true)}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish Template
          </Button>
        </div>
      </div>

      {/* JSON Schema Preview Modal/Drawer */}
      {showJson && (
        <div className="bg-charcoal-stone text-white rounded-2xl p-6 overflow-x-auto text-xs font-mono border border-charcoal-stone/40">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sand-beige text-sm">Canonical Schema JSON</span>
            <button
              onClick={() => setShowJson(false)}
              className="text-white/60 hover:text-white"
            >
              Close
            </button>
          </div>
          <pre>
            {JSON.stringify(
              {
                name,
                slug,
                description,
                icon,
                version: initialTemplate?.version || 1,
                fields,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}

      {/* Main Grid: Palette on Left, Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <FieldPalette onAddField={addField} />
        </div>

        <div className="lg:col-span-8 space-y-6">
          {/* Template Metadata Box */}
          <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-charcoal-stone flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-forest-emerald" />
              Template Metadata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="template-name"
                  className="block text-xs font-semibold text-charcoal-stone mb-1"
                >
                  Template Name *
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Sacred Grove or Tribal Craft"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
                />
              </div>

              <div>
                <label
                  htmlFor="template-slug"
                  className="block text-xs font-semibold text-charcoal-stone mb-1"
                >
                  Unique Slug *
                </label>
                <input
                  id="template-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. sacred-grove"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-stone mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what content this template standardizes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-stone mb-1">
                  Icon Identifier
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. MapPin, Compass"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
                />
              </div>
            </div>
          </div>

          {/* Canvas: Configured Fields */}
          <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-charcoal-stone">
                  Template Fields ({fields.length})
                </h2>
                <p className="text-xs text-charcoal-stone/60">
                  Reorder and customize the validation rules for each attribute.
                </p>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-charcoal-stone/15 rounded-xl">
                <p className="text-sm font-medium text-charcoal-stone/60">
                  No fields defined yet.
                </p>
                <p className="text-xs text-charcoal-stone/40 mt-1">
                  Click on an item in the Field Palette to the left to add fields.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.key + index}
                    className="p-4 rounded-xl border border-charcoal-stone/15 bg-sand-beige/10 hover:border-forest-emerald/30 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sand-beige text-charcoal-stone text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-forest-emerald/10 text-forest-emerald text-xs font-bold">
                          {field.fieldType}
                        </span>
                        <span className="text-sm font-semibold text-charcoal-stone">
                          {field.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-charcoal-stone/60 hover:text-forest-emerald hover:bg-forest-emerald/10 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                          className="p-1.5 rounded-lg text-charcoal-stone/60 hover:text-forest-emerald hover:bg-forest-emerald/10 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="p-1.5 rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50"
                          title="Delete Field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Field Settings Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-charcoal-stone/10">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-stone/70 mb-1">
                          Field Key (Unique Identifier)
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => updateField(index, { key: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-stone/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-forest-emerald"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-stone/70 mb-1">
                          Display Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-stone/20 text-xs focus:outline-none focus:ring-1 focus:ring-forest-emerald"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-4">
                        <label className="flex items-center gap-1.5 text-xs text-charcoal-stone cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="rounded text-forest-emerald focus:ring-forest-emerald"
                          />
                          <span>Required</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-xs text-charcoal-stone cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={field.translatable ?? true}
                            onChange={(e) => updateField(index, { translatable: e.target.checked })}
                            className="rounded text-forest-emerald focus:ring-forest-emerald"
                          />
                          <span>Translatable</span>
                        </label>
                      </div>
                    </div>

                    {/* Dropdown Options Editor */}
                    {(field.fieldType === 'DROPDOWN' || field.fieldType === 'MULTISELECT') && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-semibold text-charcoal-stone/70 mb-1">
                          Choices (format: Label:value, comma-separated)
                        </label>
                        <input
                          type="text"
                          defaultValue={
                            field.options?.options?.map((o) => `${o.label}:${o.value}`).join(', ') || ''
                          }
                          onBlur={(e) => {
                            const raw = e.target.value;
                            const parsed = raw
                              .split(',')
                              .map((item) => item.trim())
                              .filter(Boolean)
                              .map((item) => {
                                const parts = item.split(':');
                                const label = parts[0]?.trim() || '';
                                const value = (parts[1]?.trim() || label).toUpperCase().replace(/\s+/g, '_');
                                return { label, value };
                              });
                            updateField(index, {
                              options: { ...field.options, options: parsed },
                            });
                          }}
                          placeholder="e.g. Bastar:BASTAR, Raipur:RAIPUR, Bilaspur:BILASPUR"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-stone/20 text-xs focus:outline-none focus:ring-1 focus:ring-forest-emerald"
                        />
                      </div>
                    )}

                    {/* Number Limits */}
                    {field.fieldType === 'NUMBER' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-charcoal-stone/70 mb-1">
                            Min Value
                          </label>
                          <input
                            type="number"
                            value={field.options?.min ?? ''}
                            onChange={(e) =>
                              updateField(index, {
                                options: { ...field.options, min: Number(e.target.value) },
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-stone/20 text-xs focus:outline-none focus:ring-1 focus:ring-forest-emerald"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-charcoal-stone/70 mb-1">
                            Max Value
                          </label>
                          <input
                            type="number"
                            value={field.options?.max ?? ''}
                            onChange={(e) =>
                              updateField(index, {
                                options: { ...field.options, max: Number(e.target.value) },
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-stone/20 text-xs focus:outline-none focus:ring-1 focus:ring-forest-emerald"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
