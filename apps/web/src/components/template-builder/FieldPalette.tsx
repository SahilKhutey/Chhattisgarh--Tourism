'use client';

import React from 'react';
import {
  Type,
  AlignLeft,
  FileText,
  Hash,
  ToggleLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  Images,
  Video,
  Volume2,
  MapPin,
  Map,
  ChevronDownSquare,
  CheckSquare,
  Tag,
  Link2,
} from 'lucide-react';
import { FieldType } from './types';

interface PaletteItem {
  type: FieldType;
  label: string;
  category: string;
  description: string;
  icon: React.ElementType;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Text & Primitives
  {
    type: 'TEXT',
    label: 'Short Text',
    category: 'Primitives',
    description: 'Single-line string for titles or names',
    icon: Type,
  },
  {
    type: 'TEXTAREA',
    label: 'Paragraph',
    category: 'Primitives',
    description: 'Multi-line plain text for summaries',
    icon: AlignLeft,
  },
  {
    type: 'RICHTEXT',
    label: 'Rich Text',
    category: 'Primitives',
    description: 'Formatted narrative with markdown/HTML',
    icon: FileText,
  },
  {
    type: 'NUMBER',
    label: 'Number',
    category: 'Primitives',
    description: 'Integer or decimal values with limits',
    icon: Hash,
  },
  {
    type: 'BOOLEAN',
    label: 'Toggle / Boolean',
    category: 'Primitives',
    description: 'Yes/No switch for accessibility or flags',
    icon: ToggleLeft,
  },
  {
    type: 'DATE',
    label: 'Date',
    category: 'Primitives',
    description: 'Calendar date (e.g. festival start)',
    icon: Calendar,
  },
  {
    type: 'DATETIME',
    label: 'Date & Time',
    category: 'Primitives',
    description: 'Timestamp for events and schedules',
    icon: Clock,
  },

  // Media
  {
    type: 'IMAGE',
    label: 'Hero Image',
    category: 'Media',
    description: 'High-resolution photo or banner URL',
    icon: ImageIcon,
  },
  {
    type: 'GALLERY',
    label: 'Photo Gallery',
    category: 'Media',
    description: 'Array of high-res destination images',
    icon: Images,
  },
  {
    type: 'VIDEO',
    label: 'Video',
    category: 'Media',
    description: 'Travel reel or YouTube/MP4 stream URL',
    icon: Video,
  },
  {
    type: 'AUDIO',
    label: 'Audio Story',
    category: 'Media',
    description: 'Folk audio narration, guide, or soundscape',
    icon: Volume2,
  },

  // Geography
  {
    type: 'GEO_POINT',
    label: 'Geographic Point',
    category: 'Geography',
    description: 'Latitude & Longitude coordinate pair',
    icon: MapPin,
  },
  {
    type: 'MAP_REGION',
    label: 'Map Boundary / Polygon',
    category: 'Geography',
    description: 'GeoJSON region or sanctuary polygon',
    icon: Map,
  },

  // Selection & Links
  {
    type: 'DROPDOWN',
    label: 'Dropdown Select',
    category: 'Selection',
    description: 'Single-select options (e.g. District)',
    icon: ChevronDownSquare,
  },
  {
    type: 'MULTISELECT',
    label: 'Multi-Select',
    category: 'Selection',
    description: 'Pick multiple values from presets',
    icon: CheckSquare,
  },
  {
    type: 'TAGS',
    label: 'Content Tags',
    category: 'Selection',
    description: 'Keyword tags for filtering & search',
    icon: Tag,
  },
  {
    type: 'RELATION',
    label: 'Entity Relation',
    category: 'Selection',
    description: 'Link to another tourism entry or place',
    icon: Link2,
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  const categories = Array.from(new Set(PALETTE_ITEMS.map((i) => i.category)));

  return (
    <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-5 shadow-xs">
      <h3 className="text-base font-bold text-charcoal-stone mb-1">Field Palette</h3>
      <p className="text-xs text-charcoal-stone/60 mb-4">
        Click any field type to add it to your tourism template schema.
      </p>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-stone/40 block mb-2">
              {cat}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PALETTE_ITEMS.filter((i) => i.category === cat).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => onAddField(item.type)}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-charcoal-stone/10 hover:border-forest-emerald/40 hover:bg-forest-emerald/5 transition text-left group w-full"
                  >
                    <div className="p-2 rounded-lg bg-sand-beige/40 text-forest-emerald group-hover:bg-forest-emerald group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-charcoal-stone group-hover:text-forest-emerald">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-charcoal-stone/60 line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
