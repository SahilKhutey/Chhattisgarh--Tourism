'use client';

import React from 'react';
import {
  Type,
  AlignLeft,
  Image as ImageIcon,
  Images,
  MapPin,
  Map,
  ChevronDownSquare,
  Tags,
  Video,
  Volume2,
  Calendar,
  Hash,
  ToggleLeft,
  Link2,
} from 'lucide-react';
import { FieldType } from '../../types/content';

interface FieldPaletteItem {
  type: FieldType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Text' | 'Media' | 'Location' | 'Choice' | 'Data';
}

export const PALETTE_FIELDS: FieldPaletteItem[] = [
  {
    type: 'TEXT',
    label: 'Text',
    description: 'Single-line text for names, titles, and short info',
    icon: Type,
    category: 'Text',
  },
  {
    type: 'RICHTEXT',
    label: 'Rich Text',
    description: 'Multi-line formatted content and narrative descriptions',
    icon: AlignLeft,
    category: 'Text',
  },
  {
    type: 'IMAGE',
    label: 'Image',
    description: 'Single banner or showcase photograph',
    icon: ImageIcon,
    category: 'Media',
  },
  {
    type: 'GALLERY',
    label: 'Gallery',
    description: 'Multi-image photo collection',
    icon: Images,
    category: 'Media',
  },
  {
    type: 'GEO_POINT',
    label: 'Geo Point',
    description: 'Latitude and Longitude pin for PostGIS indexing',
    icon: MapPin,
    category: 'Location',
  },
  {
    type: 'MAP_REGION',
    label: 'Map Region',
    description: 'District boundary or polygon area',
    icon: Map,
    category: 'Location',
  },
  {
    type: 'DROPDOWN',
    label: 'Dropdown',
    description: 'Single selection from configured options',
    icon: ChevronDownSquare,
    category: 'Choice',
  },
  {
    type: 'TAGS',
    label: 'Tags',
    description: 'Searchable keyword chips (e.g., eco, tribal, waterfall)',
    icon: Tags,
    category: 'Choice',
  },
  {
    type: 'VIDEO',
    label: 'Video',
    description: 'Embedded video link or walkthrough',
    icon: Video,
    category: 'Media',
  },
  {
    type: 'AUDIO',
    label: 'Audio',
    description: 'Audio guide or regional pronunciation sample',
    icon: Volume2,
    category: 'Media',
  },
  {
    type: 'DATE',
    label: 'Date',
    description: 'Date or calendar event reference',
    icon: Calendar,
    category: 'Data',
  },
  {
    type: 'NUMBER',
    label: 'Number',
    description: 'Numeric measurement (elevation, fee, capacity)',
    icon: Hash,
    category: 'Data',
  },
  {
    type: 'BOOLEAN',
    label: 'Boolean',
    description: 'Yes/No switch (e.g. guide required, wheelchair access)',
    icon: ToggleLeft,
    category: 'Choice',
  },
  {
    type: 'RELATION',
    label: 'Relation',
    description: 'Link to an entry in another tourism template',
    icon: Link2,
    category: 'Data',
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">
        Field Palette
      </h3>
      <p className="text-xs text-stone-500 mb-4">
        Click a field type to add it to your tourism content template.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PALETTE_FIELDS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onAddField(item.type)}
              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-stone-100 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
            >
              <div className="p-1.5 rounded-md bg-stone-100 group-hover:bg-emerald-100 text-stone-700 group-hover:text-emerald-700 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-stone-800 group-hover:text-emerald-900">
                  {item.label}
                </div>
                <div className="text-[10px] text-stone-500 line-clamp-1">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
