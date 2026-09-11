'use client';

import React, { useEffect, useState, use } from 'react';
import { getApiBase } from '@/app/data/api-config';
import { ContentEntry, ContentTemplate } from '@/types/content';
import { MapPin, Sparkles, Layers, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    templateSlug: string;
  }>;
}

export default function ContentListPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { templateSlug } = resolvedParams;

  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [template, setTemplate] = useState<ContentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = getApiBase();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch published entries for this template slug
        const res = await fetch(`${API_BASE}/entries?templateSlug=${templateSlug}&status=PUBLISHED`);
        if (res.ok) {
          const json = await res.json();
          setEntries(json.data || []);
        }

        // Fetch template info
        const tplRes = await fetch(`${API_BASE}/templates`);
        if (tplRes.ok) {
          const tpls: ContentTemplate[] = await tplRes.json();
          const match = tpls.find((t) => t.slug === templateSlug);
          if (match) setTemplate(match);
        }
      } catch (err) {
        console.error('Failed to load content entries', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [API_BASE, templateSlug]);

  return (
    <main className="min-h-screen bg-sand-beige/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Banner */}
        <div className="bg-white rounded-3xl border border-charcoal-stone/15 p-8 shadow-xs">
          <div className="flex items-center gap-2 text-forest-emerald text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4" />
            Generic Tourism Catalog &bull; {template?.name || templateSlug}
          </div>
          <h1 className="text-3xl font-extrabold text-charcoal-stone">
            Explore {template?.name || templateSlug}
          </h1>
          {template?.description && (
            <p className="text-sm text-charcoal-stone/70 mt-2 max-w-3xl">
              {template.description}
            </p>
          )}
        </div>

        {/* Entries Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-charcoal-stone/10 p-6 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => {
              const data = entry.data || {};
              const title = (data.title as string) || (data.name as string) || 'Untitled';
              const summary = (data.summary as string) || (data.description as string);
              const heroImage = (data.heroImage as string) || (data.image as string);
              const district = (data.district as string) || entry.region;
              const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];

              return (
                <Link
                  key={entry.id}
                  href={`/content/${templateSlug}/${entry.id}`}
                  className="bg-white rounded-2xl border border-charcoal-stone/15 overflow-hidden shadow-xs hover:border-forest-emerald/50 hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    {heroImage ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-sand-beige/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroImage}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {district && (
                          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {district}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-sand-beige/30 border-b border-charcoal-stone/10 flex items-center justify-between">
                        <span className="text-xs font-semibold text-forest-emerald flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          {template?.name || 'Experience'}
                        </span>
                        {district && (
                          <span className="text-xs text-charcoal-stone/70 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {district}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-charcoal-stone group-hover:text-forest-emerald transition line-clamp-1">
                        {title}
                      </h3>
                      {summary && (
                        <p className="text-xs text-charcoal-stone/70 mt-2 line-clamp-2">
                          {summary}
                        </p>
                      )}

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full bg-sand-beige/40 text-[10px] text-charcoal-stone font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold text-forest-emerald">
                    <span>Explore Experience</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-charcoal-stone/15 p-12 text-center">
            <Layers className="w-10 h-10 text-charcoal-stone/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal-stone">No Entries Published Yet</h3>
            <p className="text-xs text-charcoal-stone/60 max-w-sm mx-auto mt-1 mb-4">
              Be the first creator to contribute an entry to the {template?.name || templateSlug} catalog!
            </p>
            <Link
              href="/creator/entries"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-emerald text-white text-xs font-semibold hover:bg-forest-emerald/90 transition"
            >
              Contribute Entry
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
