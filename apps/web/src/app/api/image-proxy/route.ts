import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://en.wikipedia.org/'
      }
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image from source', { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=604800, immutable'); // Cache aggressively for 7 days

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Error proxying image', { status: 500 });
  }
}
