'use client';

import React from 'react';
import { Link2 } from 'lucide-react';

interface RelationFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function RelationField({
  value = '',
  onChange,
  label = 'Related Entity',
  placeholder = 'Enter related entry ID or slug...',
  error,
}: RelationFieldProps) {
  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-stone-700">
        <Link2 className="w-4 h-4 text-emerald-600" />
        <span>{label}</span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
      />

      {error && <p className="text-red-600 font-medium">{error}</p>}
    </div>
  );
}
export default RelationField;
