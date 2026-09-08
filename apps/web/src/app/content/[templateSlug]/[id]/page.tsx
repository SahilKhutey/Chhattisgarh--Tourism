'use client';

import React, { useEffect, useState, use } from 'react';
import { getApiBase } from '@/app/data/api-config';
import { ContentRenderer } from '@/components/content-renderer/ContentRenderer';
import { ContentEntry } from '@/components/template-builder/types';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PageProps {
  params: Promise<{
    templateSlug: string;
    id: string;
  }>;
}

export default function ContentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { templateSlug, id } = resolvedParams;

  const [entry, setEntry] = useState<ContentEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const { user, token } = useAuthStore();

  const API_BASE = getApiBase();
  const isModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/entries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEntry(data);
      } else {
        toast.error('Entry not found');
      }
    } catch (err) {
      console.error('Failed to load entry', err);
      toast.error('Failed to load entry details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntry();
  }, [API_BASE, id]);

  const handleReview = async (status: 'PUBLISHED' | 'REJECTED', reviewNote?: string) => {
    setIsReviewing(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/entries/${id}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, reviewNote }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update entry review status');
      }

      toast.success(
        status === 'PUBLISHED'
          ? 'Entry has been approved and published!'
          : 'Entry has been rejected with feedback notes.',
      );
      await loadEntry();
    } catch (err: any) {
      toast.error(err.message || 'Error updating review');
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-sand-beige/20 py-20 flex items-center justify-center">
        <div className="flex items-center gap-3 text-forest-emerald font-semibold text-sm">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading tourism experience...</span>
        </div>
      </main>
    );
  }

  if (!entry) {
    return (
      <main className="min-h-screen bg-sand-beige/20 py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-charcoal-stone">Content Not Found</h2>
        <p className="text-xs text-charcoal-stone/60 mt-1 mb-4">
          The requested content entry could not be found or has been removed.
        </p>
        <Link
          href={`/content/${templateSlug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-forest-emerald hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {templateSlug}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sand-beige/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href={`/content/${templateSlug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-stone/70 hover:text-forest-emerald transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all {entry.template?.name || templateSlug}
        </Link>
      </div>

      <ContentRenderer
        entry={entry}
        isModerator={isModerator}
        onReview={handleReview}
        isLoading={isReviewing}
      />
    </main>
  );
}
