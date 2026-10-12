import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SOCIAL_CONTENT } from '@/lib/social/mock-data';
import { SocialContent } from '@/lib/social/types';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  const contentType = searchParams.get('content_type');
  const districtId = searchParams.get('district_id');
  const placeSlug = searchParams.get('place_slug');
  const creator = searchParams.get('creator');
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Try proxying to backend FastAPI public feed
  try {
    const upstreamUrl = new URL('/public/feed', FASTAPI_URL);
    if (districtId) upstreamUrl.searchParams.set('district_id', districtId);
    if (contentType) upstreamUrl.searchParams.set('content_type', contentType);
    if (placeSlug) upstreamUrl.searchParams.set('place_slug', placeSlug);
    upstreamUrl.searchParams.set('limit', String(limit));
    upstreamUrl.searchParams.set('offset', String(offset));

    const backendRes = await fetch(upstreamUrl.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const items = await backendRes.json();
      if (Array.isArray(items) && items.length > 0) {
        return NextResponse.json({
          items,
          next_cursor: items.length >= limit ? String(offset + limit) : null,
          total_estimate: items.length + offset,
          filters: {
            platform: platform || undefined,
            content_type: contentType || undefined,
            district_id: districtId || undefined,
            place_slug: placeSlug || undefined,
          },
        });
      }
    }
  } catch {
    // Backend offline; continue to graceful regional fallback
  }

  // Graceful regional mock fallback
  let items: SocialContent[] = [...MOCK_SOCIAL_CONTENT];

  if (platform) {
    items = items.filter(
      (i) => i.provider && i.provider.toUpperCase() === platform.toUpperCase()
    );
  }

  if (contentType) {
    items = items.filter(
      (i) => i.content_type && i.content_type.toUpperCase() === contentType.toUpperCase()
    );
  }

  if (districtId) {
    items = items.filter(
      (i) => i.district_id && i.district_id.toLowerCase() === districtId.toLowerCase()
    );
  }

  if (placeSlug) {
    items = items.filter(
      (i) => i.place_slug && i.place_slug.toLowerCase() === placeSlug.toLowerCase()
    );
  }

  if (creator) {
    items = items.filter(
      (i) =>
        i.creator?.handle.toLowerCase() === creator.toLowerCase() ||
        i.creator_id.toLowerCase() === creator.toLowerCase()
    );
  }

  const paged = items.slice(offset, offset + limit);
  const nextCursor = offset + limit < items.length ? String(offset + limit) : null;

  return NextResponse.json({
    items: paged,
    next_cursor: nextCursor,
    total_estimate: items.length,
    filters: {
      platform: platform || undefined,
      content_type: contentType || undefined,
      district_id: districtId || undefined,
      place_slug: placeSlug || undefined,
    },
  });
}
