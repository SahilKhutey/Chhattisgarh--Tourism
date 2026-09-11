'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  ArrowUp,
  ArrowDown,
  Settings2,
  Trash2,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  ContentTemplate,
  CreateTemplateInput,
  FieldType,
  TemplateField,
} from '../../types/content';
import { FieldPalette } from './FieldPalette';
import { FieldSettings } from './FieldSettings';
import { TemplatePreview } from './TemplatePreview';
import { createTemplate, updateTemplate, publishTemplate } from '../../lib/template';

interface TemplateBuilderProps {
  initialTemplate?: ContentTemplate;
  onSaved?: (template: ContentTemplate) => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  initialTemplate,
  onSaved,
}) => {
  const router = useRouter();
  const isEditing = Boolean(initialTemplate?.id);

  const [name, setName] = useState(initialTemplate?.name || '');
  const [slug, setSlug] = useState(initialTemplate?.slug || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [icon, setIcon] = useState(initialTemplate?.icon || 'Compass');
  const [category, setCategory] = useState(initialTemplate?.category || '');
  const [fields, setFields] = useState<TemplateField[]>(
    initialTemplate?.fields
      ? initialTemplate.fields.map((f, idx) => ({ ...f, order: idx }))
      : [],
  );

  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upgrade Risk Modal State
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<{
    breaking: string[];
    safe: string[];
  }>({ breaking: [], safe: [] });
  const [confirmedRisk, setConfirmedRisk] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      );
    }
  };

  const handleAddField = (type: FieldType) => {
    const nextOrder = fields.length;
    const baseKey = `${type.toLowerCase()}_${nextOrder + 1}`;
    const newField: TemplateField = {
      key: baseKey,
      label: `${type.charAt(0) + type.slice(1).toLowerCase()} Field`,
      type,
      required: false,
      order: nextOrder,
      placeholder: '',
      helpText: '',
      isSearchable: true,
      isFilterable: false,
      options: type === 'DROPDOWN' ? [{ label: 'Option 1', value: 'opt_1' }] : undefined,
    };

    const nextFields = [...fields, newField];
    setFields(nextFields);
    setEditingFieldIndex(nextFields.length - 1);
  };

  const handleUpdateField = (index: number, updated: TemplateField) => {
    const nextFields = [...fields];
    nextFields[index] = updated;
    setFields(nextFields);
  };

  const handleDeleteField = (index: number) => {
    const nextFields = fields
      .filter((_, i) => i !== index)
      .map((f, idx) => ({ ...f, order: idx }));
    setFields(nextFields);
    if (editingFieldIndex === index) {
      setEditingFieldIndex(null);
    } else if (editingFieldIndex !== null && editingFieldIndex > index) {
      setEditingFieldIndex(editingFieldIndex - 1);
    }
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const nextFields = [...fields];
    const [moved] = nextFields.splice(index, 1);
    nextFields.splice(targetIndex, 0, moved);

    const reindexed = nextFields.map((f, idx) => ({ ...f, order: idx }));
    setFields(reindexed);

    if (editingFieldIndex === index) {
      setEditingFieldIndex(targetIndex);
    } else if (editingFieldIndex === targetIndex) {
      setEditingFieldIndex(index);
    }
  };

  const validateTemplate = (forPublish = false): string | null => {
    if (!name.trim()) return 'Template name is required';
    if (!slug.trim()) return 'Template slug is required';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return 'Slug must consist of lowercase alphanumeric characters and hyphens only';
    }
    if (forPublish && fields.length === 0) {
      return 'At least one field is required in the template to publish';
    }

    const keys = new Set<string>();
    for (const field of fields) {
      if (!field.key.trim()) return 'All fields must have a valid field key';
      if (!field.label.trim()) return 'All fields must have a label';
      if (keys.has(field.key)) {
        return `Duplicate field key detected: "${field.key}". Keys must be unique.`;
      }
      keys.add(field.key);
    }

    return null;
  };

  const checkUpgradeRisk = () => {
    if (!initialTemplate?.fields || initialTemplate.fields.length === 0) {
      return { breaking: [], safe: [] };
    }

    const oldMap = new Map(initialTemplate.fields.map((f) => [f.key, f]));
    const newMap = new Map(fields.map((f) => [f.key, f]));
    const breaking: string[] = [];
    const safe: string[] = [];

    for (const [key, oldField] of oldMap.entries()) {
      const newField = newMap.get(key);
      if (!newField) {
        breaking.push(`Field "${oldField.label}" (${key}) was removed`);
      } else {
        if (oldField.type !== newField.type) {
          breaking.push(`Field "${key}" type changed from ${oldField.type} to ${newField.type}`);
        }
        if (!oldField.required && newField.required) {
          breaking.push(`Field "${key}" was changed from optional to required`);
        }
      }
    }

    for (const [key, newField] of newMap.entries()) {
      if (!oldMap.has(key)) {
        if (newField.required) {
          breaking.push(`New required field "${newField.label}" (${key}) was added`);
        } else {
          safe.push(`New optional field "${newField.label}" (${key}) was added`);
        }
      }
    }

    return { breaking, safe };
  };

  const handleSave = async (publishAfterSave = false, bypassRiskCheck = false) => {
    setError(null);
    setSuccess(null);

    const validationError = validateTemplate(publishAfterSave);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check for breaking changes if publishing an existing template
    if (publishAfterSave && isEditing && !bypassRiskCheck) {
      const risk = checkUpgradeRisk();
      if (risk.breaking.length > 0) {
        setRiskAssessment(risk);
        setConfirmedRisk(false);
        setShowRiskModal(true);
        return;
      }
    }

    setSaving(true);
    try {
      let savedTemplate: ContentTemplate;

      if (isEditing && initialTemplate) {
        savedTemplate = await updateTemplate(initialTemplate.id, {
          name,
          description,
          icon,
          fields,
        });
      } else {
        const payload: CreateTemplateInput = {
          name,
          slug,
          description,
          icon,
          fields: fields.map(({ id, ...rest }) => rest),
        };
        savedTemplate = await createTemplate(payload);
      }

      if (publishAfterSave) {
        savedTemplate = await publishTemplate(savedTemplate.id);
      }

      setSuccess(
        publishAfterSave
          ? `Template "${savedTemplate.name}" published successfully!`
          : `Template "${savedTemplate.name}" saved as draft!`,
      );

      if (onSaved) {
        onSaved(savedTemplate);
      } else {
        setTimeout(() => {
          router.push('/admin/templates');
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save template. Please check the backend connection.');
    } finally {
      setSaving(false);
      setShowRiskModal(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            {isEditing ? `Edit Template: ${initialTemplate?.name}` : 'New Content Template'}
          </h1>
          <p className="text-xs text-stone-500">
            Define dynamic schema, validation constraints, and geographic indexing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-stone-500" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Publish Template'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Template Metadata Configuration */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-stone-800 text-sm">Template Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Traditional Festival"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-stone-700">
                URL Slug <span className="text-red-500">*</span>
              </label>
              {initialTemplate?.status === 'PUBLISHED' && (
                <span className="text-[10px] text-amber-600 font-medium">Locked (Published)</span>
              )}
            </div>
            <input
              type="text"
              disabled={initialTemplate?.status === 'PUBLISHED'}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. traditional-festival"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Category
            </label>
            <input
              type="text"
              list="tourism-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Culture & Heritage"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            />
            <datalist id="tourism-categories">
              <option value="Culture & Heritage" />
              <option value="Eco & Nature" />
              <option value="Tribal Craft" />
              <option value="Spiritual & Temples" />
              <option value="Culinary Tourism" />
              <option value="Adventure & Wildlife" />
            </datalist>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Icon
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
            >
              <option value="Compass">Compass (Explore)</option>
              <option value="MapPin">MapPin (Location)</option>
              <option value="Landmark">Landmark (Heritage)</option>
              <option value="Mountain">Mountain (Nature)</option>
              <option value="Sparkles">Sparkles (Folklore/Festivals)</option>
              <option value="Music">Music (Tribal Arts)</option>
              <option value="Camera">Camera (Scenic Spot)</option>
              <option value="Trees">Trees (Eco/Forest)</option>
              <option value="Utensils">Utensils (Culinary)</option>
              <option value="Award">Award (GI Tag Craft)</option>
              <option value="BookOpen">BookOpen (Story/History)</option>
              <option value="Layers">Layers (Generic Schema)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief explanation of this tourism content type..."
            className="w-full px-3 py-2 border border-stone-300 rounded-lg"
          />
        </div>
      </div>


      {/* Main Builder Grid: Canvas, Palette, Settings, and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Field Palette & Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <FieldPalette onAddField={handleAddField} />

          {/* Canvas: Ordered Fields List */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                Template Canvas ({fields.length} {fields.length === 1 ? 'field' : 'fields'})
              </h3>
              <span className="text-[11px] text-stone-400">Order from top to bottom</span>
            </div>

            {fields.length === 0 ? (
              <div className="py-10 text-center text-stone-400 border border-dashed border-stone-200 rounded-lg text-xs">
                No fields on the canvas. Click a field type in the palette above.
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const isSelected = editingFieldIndex === index;
                  return (
                    <div
                      key={field.key || index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-stone-400 w-5 text-center">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-stone-800">
                              {field.label}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-mono">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="text-[10px] text-red-500 font-bold">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-stone-400">
                            key: {field.key}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveField(index, 'up')}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === fields.length - 1}
                          onClick={() => handleMoveField(index, 'down')}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFieldIndex(isSelected ? null : index)}
                          className={`p-1.5 rounded transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'text-stone-500 hover:bg-stone-100'
                          }`}
                          title="Configure field settings"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(index)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Field Settings OR Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {editingFieldIndex !== null && fields[editingFieldIndex] ? (
            <FieldSettings
              field={fields[editingFieldIndex]}
              onUpdate={(updated) => handleUpdateField(editingFieldIndex, updated)}
              onClose={() => setEditingFieldIndex(null)}
            />
          ) : null}

          <TemplatePreview
            name={name}
            slug={slug}
            description={description}
            fields={fields}
          />
        </div>
      </div>

      {/* Upgrade Risk Modal for Breaking Changes */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 border border-stone-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Breaking Schema Changes Detected
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Publishing these modifications introduces backwards-incompatible changes. Existing entries under version {initialTemplate?.version ?? 1} may experience schema drift.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Breaking Changes ({riskAssessment.breaking.length})
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-800">
                  {riskAssessment.breaking.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {riskAssessment.safe.length > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                    Safe Additions ({riskAssessment.safe.length})
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800">
                    {riskAssessment.safe.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedRisk}
                onChange={(e) => setConfirmedRisk(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-stone-700 font-medium">
                I understand this update introduces breaking schema changes and wish to publish version {(initialTemplate?.version || 1) + 1} to live content.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmedRisk || saving}
                onClick={() => handleSave(true, true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                {saving ? 'Publishing...' : 'Confirm & Publish v' + ((initialTemplate?.version || 1) + 1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Re-export types so consumers can import directly from this canonical module
export type { ContentEntry, ContentTemplate, TemplateField } from '../../types/content';
