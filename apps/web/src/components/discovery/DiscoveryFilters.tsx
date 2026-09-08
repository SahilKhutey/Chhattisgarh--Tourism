'use client';

import React from 'react';
import { Filter, X, Layers, MapPin, RotateCcw } from 'lucide-react';
import { ContentTemplate } from '../../types/content';

interface DiscoveryFiltersProps {
  templates: ContentTemplate[];
  selectedTemplateId?: string;
  selectedDistrict?: string;
  selectedRegion?: string;
  onTemplateChange: (templateId: string | undefined) => void;
  onDistrictChange: (district: string | undefined) => void;
  onRegionChange: (region: string | undefined) => void;
  onReset: () => void;
}

const CHHATTISGARH_DISTRICTS = [
  'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur',
  'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela-Pendra-Marwahi',
  'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba',
  'Koriya', 'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki',
  'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sarangarh-Bilaigarh',
  'Sakti', 'Sukma', 'Surajpur', 'Surguja', 'Khairagarh-Chhuikhadan-Gandai'
];

const CHHATTISGARH_REGIONS = [
  'Bastar', 'Bilaspur', 'Durg', 'Raipur', 'Surguja'
];

export function DiscoveryFilters({
  templates,
  selectedTemplateId,
  selectedDistrict,
  selectedRegion,
  onTemplateChange,
  onDistrictChange,
  onRegionChange,
  onReset,
}: DiscoveryFiltersProps) {
  const hasActiveFilters = Boolean(
    selectedTemplateId || selectedDistrict || selectedRegion,
  );

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filter Tourism Content</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Template Category Chips */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            Content Schema
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onTemplateChange(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                !selectedTemplateId
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Types
            </button>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() =>
                  onTemplateChange(
                    selectedTemplateId === tpl.id ? undefined : tpl.id,
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedTemplateId === tpl.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region & District Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label htmlFor="region-filter-select" className="text-[11px] font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1">
            <MapPin className="w-3 h-3 text-stone-400" />
            Division / Region
          </label>
          <select
            id="region-filter-select"
            aria-label="Division / Region"
            value={selectedRegion || ''}
            onChange={(e) => onRegionChange(e.target.value || undefined)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Regions</option>
            {CHHATTISGARH_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="district-filter-select" className="text-[11px] font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1">
            <MapPin className="w-3 h-3 text-stone-400" />
            District
          </label>
          <select
            id="district-filter-select"
            aria-label="District"
            value={selectedDistrict || ''}
            onChange={(e) => onDistrictChange(e.target.value || undefined)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All 33 Districts</option>
            {CHHATTISGARH_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default DiscoveryFilters;
