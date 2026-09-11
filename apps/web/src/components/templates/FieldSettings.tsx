'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FieldOption, TemplateField } from '../../types/content';

interface FieldSettingsProps {
  field: TemplateField;
  onUpdate: (updatedField: TemplateField) => void;
  onClose: () => void;
}

export const FieldSettings: React.FC<FieldSettingsProps> = ({
  field,
  onUpdate,
  onClose,
}) => {
  const [current, setCurrent] = useState<TemplateField>({
    ...field,
    validation: { ...(field.validation || {}) },
    options: field.options ? [...field.options] : [],
  });

  const handleChange = (key: keyof TemplateField, value: any) => {
    const updated = { ...current, [key]: value };
    setCurrent(updated);
    onUpdate(updated);
  };

  const handleValidationChange = (key: string, value: any) => {
    const updatedVal = {
      ...current.validation,
      [key]: value === '' ? undefined : value,
    };
    const updated = { ...current, validation: updatedVal };
    setCurrent(updated);
    onUpdate(updated);
  };

  const handleAddOption = () => {
    const newOptions: FieldOption[] = [
      ...(current.options || []),
      { label: `Option ${(current.options?.length || 0) + 1}`, value: `opt_${Date.now()}` },
    ];
    handleChange('options', newOptions);
  };

  const handleOptionChange = (index: number, key: 'label' | 'value', val: string) => {
    const newOptions = [...(current.options || [])];
    newOptions[index] = { ...newOptions[index], [key]: val };
    handleChange('options', newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = (current.options || []).filter((_, i) => i !== index);
    handleChange('options', newOptions);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-5 w-full">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
        <div>
          <h3 className="text-sm font-bold text-stone-800">
            Configure {field.type} Field
          </h3>
          <p className="text-xs text-stone-500">Edit attributes and validation rules</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* Label */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Display Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={current.label}
            onChange={(e) => {
              const label = e.target.value;
              const key = current.key || label.toLowerCase().replace(/[^a-z0-9]/g, '_');
              const updated = {
                ...current,
                label,
                ...(!current.id ? { key } : {}),
              };
              setCurrent(updated);
              onUpdate(updated);
            }}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Festival Name"
          />
        </div>

        {/* Field Key */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Field Key (API / Database identifier) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={current.key}
            onChange={(e) =>
              handleChange('key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
            placeholder="e.g. festival_name"
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Placeholder Text
          </label>
          <input
            type="text"
            value={current.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Hint shown inside the field..."
          />
        </div>

        {/* Help Text */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Help Text
          </label>
          <input
            type="text"
            value={current.helpText || ''}
            onChange={(e) => handleChange('helpText', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Instructions for the content creator..."
          />
        </div>

        {/* Group / Section */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Section Group
          </label>
          <input
            type="text"
            value={current.group || ''}
            onChange={(e) => handleChange('group', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Overview, Media, Location..."
          />
        </div>

        {/* Checkbox Flags */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={current.required}
              onChange={(e) => handleChange('required', e.target.checked)}
              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-semibold text-stone-700">Required field</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={current.translatable ?? true}
              onChange={(e) => handleChange('translatable', e.target.checked)}
              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-stone-700 font-medium">Translatable (EN/HI/CG)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={current.isSearchable ?? true}
              onChange={(e) => handleChange('isSearchable', e.target.checked)}
              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-stone-700">Searchable</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={current.isFilterable ?? false}
              onChange={(e) => handleChange('isFilterable', e.target.checked)}
              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-stone-700">Filterable</span>
          </label>
        </div>

        {/* Image & Gallery Accessibility & Media Constraints */}
        {(current.type === 'IMAGE' || current.type === 'GALLERY') && (
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <span className="block font-semibold text-stone-700">Media & Accessibility Rules</span>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between">
              <span className="font-semibold">Compulsory Alt Text (WCAG 2.1 AA)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold uppercase text-[9px]">LOCKED ON</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-500 mb-1">Max Size (MB)</label>
                <input
                  type="number"
                  value={current.validation?.maxSizeMb ?? 5}
                  onChange={(e) => handleValidationChange('maxSizeMb', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">Aspect Ratio</label>
                <select
                  value={current.validation?.aspectRatio || '16:9'}
                  onChange={(e) => handleValidationChange('aspectRatio', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md bg-white"
                >
                  <option value="16:9">16:9 (Landscape banner)</option>
                  <option value="4:3">4:3 (Standard photo)</option>
                  <option value="1:1">1:1 (Square thumbnail)</option>
                  <option value="free">Free / Any</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Geo Constraints */}
        {(current.type === 'GEO_POINT' || current.type === 'MAP_REGION') && (
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="block font-semibold text-stone-700">Geographic Spatial Bounds</span>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-1">
              <div className="font-semibold text-stone-800">State Extent: Chhattisgarh</div>
              <div className="text-stone-500 font-mono">Latitude: 17.78° N to 24.11° N</div>
              <div className="text-stone-500 font-mono">Longitude: 80.24° E to 84.40° E</div>
              <p className="text-[10px] text-emerald-700 font-medium">Automatic PostGIS ST_Within spatial polygon validation enabled.</p>
            </div>
          </div>
        )}

        {/* Dropdown & MultiSelect Options Editor */}
        {(current.type === 'DROPDOWN' || current.type === 'MULTI_SELECT') && (
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-700">Options / Choices</span>
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {(current.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                  <input
                    type="text"
                    value={opt.value}
                    onChange={(e) => handleOptionChange(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Validation Constraints */}
        {(current.type === 'TEXT' || current.type === 'RICHTEXT') && (
          <div className="pt-3 border-t border-stone-100">
            <span className="block font-semibold text-stone-700 mb-2">
              Length Validation
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-500 mb-1">Min Length</label>
                <input
                  type="number"
                  value={current.validation?.minLength ?? ''}
                  onChange={(e) =>
                    handleValidationChange(
                      'minLength',
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">Max Length</label>
                <input
                  type="number"
                  value={current.validation?.maxLength ?? ''}
                  onChange={(e) =>
                    handleValidationChange(
                      'maxLength',
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {current.type === 'NUMBER' && (
          <div className="pt-3 border-t border-stone-100">
            <span className="block font-semibold text-stone-700 mb-2">
              Number Bounds
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-500 mb-1">Min Value</label>
                <input
                  type="number"
                  value={current.validation?.min ?? ''}
                  onChange={(e) =>
                    handleValidationChange(
                      'min',
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1">Max Value</label>
                <input
                  type="number"
                  value={current.validation?.max ?? ''}
                  onChange={(e) =>
                    handleValidationChange(
                      'max',
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
