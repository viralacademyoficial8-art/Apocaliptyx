'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Globe, Loader2 } from 'lucide-react';

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

interface LinkPreviewProps {
  url: string;
  className?: string;
}

// Cache for previews to avoid re-fetching
const previewCache = new Map<string, LinkPreviewData | null>();

export function LinkPreview({ url, className = '' }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      // Check cache first
      if (previewCache.has(url)) {
        const cached = previewCache.get(url);
        setPreview(cached || null);
        setLoading(false);
        setError(!cached);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preview');
        }

        const data = await response.json();
        if (data.success && data.data) {
          previewCache.set(url, data.data);
          setPreview(data.data);
        } else {
          previewCache.set(url, null);
          setError(true);
        }
      } catch (err) {
        previewCache.set(url, null);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando vista previa...</span>
      </div>
    );
  }

  if (error || !preview) {
    // Show simple link fallback
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors ${className}`}
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-purple-400 hover:underline truncate">{url}</span>
        <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block overflow-hidden rounded-xl border border-border bg-muted/50 hover:bg-muted/80 transition-all hover:border-border ${className}`}
    >
      {/* Image */}
      {preview.image && !imageError && (
        <div className="relative w-full h-48 bg-card">
          <Image
            src={preview.image}
            alt={preview.title || 'Link preview'}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Site info */}
        <div className="flex items-center gap-2 mb-2">
          {preview.favicon && !imageError && (
            <Image
              src={preview.favicon}
              alt=""
              width={16}
              height={16}
              className="rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              unoptimized
            />
          )}
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {preview.siteName || new URL(url).hostname}
          </span>
        </div>

        {/* Title */}
        {preview.title && (
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
            {preview.title}
          </h3>
        )}

        {/* Description */}
        {preview.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {preview.description}
          </p>
        )}

        {/* URL */}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <ExternalLink className="w-3 h-3" />
          <span className="truncate">{new URL(url).hostname}</span>
        </div>
      </div>
    </a>
  );
}

// Helper function to extract URLs from text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
  const matches = text.match(urlRegex) || [];
  // Remove duplicates and clean up trailing punctuation
  return [...new Set(matches.map(url => url.replace(/[.,;:!?)]+$/, '')))];
}

// Helper function to process mentions in text
function processMentions(text: string): string {
  // Match @username (alphanumeric and underscores)
  const mentionRegex = /@(\w+)/g;
  return text.replace(
    mentionRegex,
    '<a href="/perfil/$1" class="text-purple-400 hover:text-purple-300 hover:underline font-medium">@$1</a>'
  );
}

// Component to render text with link previews
export function TextWithLinkPreviews({
  text,
  className = '',
  maxPreviews = 3
}: {
  text: string;
  className?: string;
  maxPreviews?: number;
}) {
  const urls = extractUrls(text).slice(0, maxPreviews);

  // Process mentions first
  let processedText = processMentions(text);

  // Remove URLs from the displayed text (they will show as previews)
  urls.forEach(url => {
    processedText = processedText.replace(url, '');
  });

  // Clean up extra whitespace and line breaks from removed URLs
  processedText = processedText
    .replace(/\n\s*\n/g, '\n')  // Remove empty lines
    .replace(/^\s+|\s+$/g, '')  // Trim
    .replace(/\s{2,}/g, ' ');   // Multiple spaces to single

  // If no URLs, just return the text with mentions processed
  if (urls.length === 0) {
    return (
      <p
        className={className}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Only show text if there's content besides the URL */}
      {processedText.trim() && (
        <p
          className={className}
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      )}
      {/* Link previews */}
      <div className="space-y-2">
        {urls.map((url, index) => (
          <LinkPreview key={`${url}-${index}`} url={url} />
        ))}
      </div>
    </div>
  );
}
