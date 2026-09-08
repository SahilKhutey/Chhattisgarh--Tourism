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
              handleChange('label', label);
              if (!current.id) {
                handleChange('key', key);
              }
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

        {/* Dropdown Options Editor */}
        {current.type === 'DROPDOWN' && (
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-700">Dropdown Options</span>
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
