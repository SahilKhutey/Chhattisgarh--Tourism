'use client';

import React, { useState } from 'react';
import { Eye, Smartphone, Monitor, FileText, CheckCircle2 } from 'lucide-react';
import { TemplateFieldModel } from '../renderer/field-registry';
import { ContentRenderer } from '../renderer/ContentRenderer';
import { DynamicEntryForm } from './DynamicEntryForm';

export interface TemplatePreviewProps {
  name: string;
  slug: string;
  description?: string;
  fields: TemplateFieldModel[];
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  name,
  slug,
  description,
  fields,
}) => {
  const [activeTab, setActiveTab] = useState<'renderer' | 'form'>('renderer');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Generate sample mock data from fields to demonstrate public rendering
  const generateMockData = (): Record<string, any> => {
    const data: Record<string, any> = {
      title: `${name || 'Tourism'} Preview Showcase`,
    };

    for (const f of fields) {
      const type = (f.fieldType || 'TEXT').toUpperCase();
      switch (type) {
        case 'TEXT':
          data[f.key] = `${f.label} Example`;
          break;
        case 'TEXTAREA':
          data[f.key] = `This is a sample multiline description for ${f.label}. Experience the vibrant culture and natural beauty of Chhattisgarh.`;
          break;
        case 'RICHTEXT':
          data[f.key] = `<p>Experience <strong>${f.label}</strong> with deep historical and cultural context.</p><p>Surrounded by dense sal forests and sacred groves.</p>`;
          break;
        case 'NUMBER':
          data[f.key] = 1250;
          break;
        case 'BOOLEAN':
          data[f.key] = true;
          break;
        case 'DATE':
          data[f.key] = new Date().toISOString().split('T')[0];
          break;
        case 'IMAGE':
          data[f.key] =
            'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=1200&q=80';
          break;
        case 'GALLERY':
          data[f.key] = [
            'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800&q=80',
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
          ];
          break;
        case 'TAGS':
          data[f.key] = ['chhattisgarh', 'heritage', 'nature'];
          break;
        case 'DROPDOWN':
          data[f.key] =
            Array.isArray(f.options?.choices) && f.options.choices[0]
              ? f.options.choices[0].label || f.options.choices[0]
              : 'Featured';
          break;
        case 'GEO_POINT':
          data[f.key] = { lat: 19.201, lng: 81.701 };
          break;
        default:
          data[f.key] = `${f.label} sample`;
      }
    }

    return data;
  };

  const mockEntry = {
    title: `${name || 'Tourism'} Preview Showcase`,
    slug: slug || 'preview-entry',
    data: generateMockData(),
    region: 'Bastar',
    district: 'Bastar',
    lat: 19.201,
    lng: 81.701,
    publishedAt: new Date().toISOString(),
    template: {
      id: 'preview-template',
      name: name || 'Template',
      slug: slug || 'template',
      version: 1,
      fields,
    },
  };

  return (
    <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Preview Navigation Header */}
      <div className="bg-white px-5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('renderer')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'renderer'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Public Experience Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'form'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Creator Form Preview
          </button>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewport === 'desktop'
                ? 'bg-white shadow-xs text-stone-900'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title="Desktop Viewport"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewport === 'mobile'
                ? 'bg-white shadow-xs text-stone-900'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title="Mobile Viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="p-6 overflow-x-auto flex justify-center bg-stone-100/60 min-h-[400px]">
        <div
          className={`transition-all duration-300 w-full ${
            viewport === 'mobile'
              ? 'max-w-sm bg-white rounded-3xl p-4 shadow-xl border-4 border-stone-300'
              : 'max-w-4xl'
          }`}
        >
          {fields.length === 0 ? (
            <div className="py-16 text-center text-stone-400 bg-white rounded-xl border border-dashed border-stone-300 text-xs">
              No fields added to this template yet. Add fields to view preview.
            </div>
          ) : activeTab === 'renderer' ? (
            <ContentRenderer entry={mockEntry} />
          ) : (
            <DynamicEntryForm
              template={{
                id: 'preview',
                name: name || 'Template',
                slug: slug || 'template',
                fields,
              }}
              onSubmit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};
