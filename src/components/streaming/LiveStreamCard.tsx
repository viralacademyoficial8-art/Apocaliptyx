'use client';

import { Eye, Heart, MessageCircle, Radio } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface LiveStream {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: 'offline' | 'live' | 'ended';
  viewersCount: number;
  peakViewers: number;
  totalViews: number;
  likesCount: number;
  category?: string;
  tags: string[];
  startedAt?: string;
}

interface LiveStreamCardProps {
  stream: LiveStream;
  onWatch?: (streamId: string) => void;
}

export function LiveStreamCard({ stream, onWatch }: LiveStreamCardProps) {
  const isLive = stream.status === 'live';

  const formatViewers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getStreamDuration = () => {
    if (!stream.startedAt || !isLive) return null;
    const start = new Date(stream.startedAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    if (minutes > 0) return `hace ${minutes}m`;
    return 'ahora';
  };

  const isEnded = stream.status === 'ended';

  return (
    <Link
      href={isLive ? `/streaming/live/${stream.id}` : `/streaming/${stream.id}`}
      className="block group"
      onClick={(e) => {
        if (onWatch) {
          e.preventDefault();
          onWatch(stream.id);
        }
      }}
    >
      <div className="bg-muted/50 rounded-xl border border-border overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
        {/* Thumbnail */}
        <div className="relative aspect-video">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
              <Radio className="w-12 h-12 text-white/50" />
            </div>
          )}

          {/* Status Badge */}
          {isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full" />
                EN VIVO
              </span>
              {getStreamDuration() && (
                <span className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  {getStreamDuration()}
                </span>
              )}
            </div>
          )}
          {isEnded && (
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-medium">
                TERMINADO
              </span>
              {getTimeAgo(stream.startedAt) && (
                <span className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  {getTimeAgo(stream.startedAt)}
                </span>
              )}
            </div>
          )}

          {/* Viewers */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs">
            <Eye className="w-3 h-3" />
            {formatViewers(stream.viewersCount)}
          </div>

          {/* Category */}
          {stream.category && (
            <div className="absolute bottom-3 left-3 bg-purple-600/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
              {stream.category}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-purple-600 px-4 py-2 rounded-lg font-medium">
              {isLive ? 'Ver ahora' : 'Ver detalles'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 border-2 border-border">
              <AvatarImage src={stream.avatarUrl} />
              <AvatarFallback>{stream.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-purple-400 transition-colors">
                {stream.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{stream.displayName}</p>
            </div>
          </div>

          {/* Tags */}
          {stream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {stream.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-muted rounded text-xs text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViewers(stream.totalViews)} vistas
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatViewers(stream.likesCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
