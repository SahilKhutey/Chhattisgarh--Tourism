'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';

export default function NewTemplatePage() {
  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <a
          href="/admin/templates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Templates List
        </a>

        <TemplateBuilder />
      </div>
    </main>
  );
}
