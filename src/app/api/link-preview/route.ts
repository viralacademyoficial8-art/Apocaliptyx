// src/app/api/link-preview/route.ts

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

// Simple in-memory cache (will reset on server restart)
const cache = new Map<string, { data: LinkPreviewData; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL es requerida' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, data: cached.data });
    }

    // Fetch the page
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    let html: string;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Apocaliptics/1.0; +https://apocaliptics.com)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      html = await response.text();
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ error: 'Timeout al obtener el enlace' }, { status: 408 });
      }
      return NextResponse.json({ error: 'No se pudo acceder al enlace' }, { status: 400 });
    }

    // Parse Open Graph and meta tags
    const preview = parseMetaTags(html, parsedUrl);

    // Cache the result
    cache.set(url, { data: preview, timestamp: Date.now() });

    return NextResponse.json({ success: true, data: preview });
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return NextResponse.json(
      { error: 'Error al obtener vista previa' },
      { status: 500 }
    );
  }
}

function parseMetaTags(html: string, url: URL): LinkPreviewData {
  const getMetaContent = (property: string): string | null => {
    // Try Open Graph
    const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'));
    if (ogMatch) return ogMatch[1];

    // Try name attribute (for twitter cards and regular meta)
    const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'));
    if (nameMatch) return nameMatch[1];

    return null;
  };

  const getTitle = (): string | null => {
    // Try Open Graph title first
    const ogTitle = getMetaContent('og:title');
    if (ogTitle) return ogTitle;

    // Try Twitter title
    const twitterTitle = getMetaContent('twitter:title');
    if (twitterTitle) return twitterTitle;

    // Try regular title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim();

    return null;
  };

  const getDescription = (): string | null => {
    return getMetaContent('og:description')
      || getMetaContent('twitter:description')
      || getMetaContent('description');
  };

  const getImage = (): string | null => {
    const image = getMetaContent('og:image')
      || getMetaContent('twitter:image')
      || getMetaContent('twitter:image:src');

    if (!image) return null;

    // Handle relative URLs
    if (image.startsWith('/')) {
      return `${url.protocol}//${url.host}${image}`;
    }
    if (!image.startsWith('http')) {
      return `${url.protocol}//${url.host}/${image}`;
    }
    return image;
  };

  const getSiteName = (): string | null => {
    return getMetaContent('og:site_name')
      || getMetaContent('application-name')
      || url.hostname.replace('www.', '');
  };

  const getFavicon = (): string | null => {
    // Try to find favicon link
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
      || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

    if (faviconMatch) {
      const favicon = faviconMatch[1];
      if (favicon.startsWith('/')) {
        return `${url.protocol}//${url.host}${favicon}`;
      }
      if (!favicon.startsWith('http')) {
        return `${url.protocol}//${url.host}/${favicon}`;
      }
      return favicon;
    }

    // Default to /favicon.ico
    return `${url.protocol}//${url.host}/favicon.ico`;
  };

  return {
    url: url.href,
    title: getTitle(),
    description: getDescription(),
    image: getImage(),
    siteName: getSiteName(),
    favicon: getFavicon(),
  };
}
