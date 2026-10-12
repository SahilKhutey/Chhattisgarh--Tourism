import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SOCIAL_CONTENT } from '@/lib/social/mock-data';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const upstreamUrl = new URL(`/social/content/${encodeURIComponent(id)}`, FASTAPI_URL);
    const backendRes = await fetch(upstreamUrl.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Graceful fallback
  }

  const found = MOCK_SOCIAL_CONTENT.find(
    (item) => item.id === id || item.slug === id
  );

  if (found) {
    return NextResponse.json(found);
  }

  return NextResponse.json({ error: 'Social content not found' }, { status: 404 });
}
