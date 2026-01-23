'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Radio, ArrowLeft, Clock, Eye, Heart, Users, Calendar, Play, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface StreamDetail {
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
  endedAt?: string;
  duration?: number;
}

export default function StreamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const streamId = params.id as string;

  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (streamId) {
      loadStreamDetail();
    }
  }, [streamId]);

  const loadStreamDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/streaming/${streamId}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // If stream is live, redirect to live page
      if (data.stream?.status === 'live') {
        router.push(`/streaming/live/${streamId}`);
        return;
      }

      setStream(data.stream);
    } catch (err) {
      console.error('Error loading stream:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el stream');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (startedAt?: string, endedAt?: string) => {
    if (!startedAt || !endedAt) return 'N/A';
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-12 h-12 animate-pulse text-purple-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Radio className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Stream no encontrado</h2>
          <p className="text-muted-foreground mb-6">{error || 'Este stream no existe o ha sido eliminado'}</p>
          <Button onClick={() => router.push('/streaming')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a streams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/streaming')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Stream Archivado</h1>
              <p className="text-sm text-muted-foreground">Detalles de la transmisión</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail/Preview */}
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
              {stream.thumbnailUrl ? (
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                  <Radio className="w-24 h-24 text-white/30" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 bg-muted px-3 py-1 rounded-lg text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  TERMINADO
                </span>
              </div>

              {/* Duration */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                Duración: {formatDuration(stream.startedAt, stream.endedAt)}
              </div>
            </div>

            {/* Stream Info */}
            <div className="bg-muted/50 rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold mb-2">{stream.title}</h2>

              {stream.category && (
                <span className="inline-block bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-sm mb-4">
                  {stream.category}
                </span>
              )}

              {stream.description && (
                <p className="text-muted-foreground mb-4">{stream.description}</p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-card/50 rounded-lg p-3 text-center">
                  <Eye className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                  <p className="text-lg font-bold">{stream.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Vistas totales</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-green-400" />
                  <p className="text-lg font-bold">{stream.peakViewers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Pico de viewers</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3 text-center">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-red-400" />
                  <p className="text-lg font-bold">{stream.likesCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                  <p className="text-lg font-bold">{formatDuration(stream.startedAt, stream.endedAt)}</p>
                  <p className="text-xs text-muted-foreground">Duración</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Iniciado: {formatDate(stream.startedAt)}</span>
                </div>
                {stream.endedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Terminado: {formatDate(stream.endedAt)}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {stream.tags && stream.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {stream.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted rounded-full text-xs text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streamer Card */}
            <div className="bg-muted/50 rounded-xl border border-border p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 border-2 border-purple-500">
                  <AvatarImage src={stream.avatarUrl} />
                  <AvatarFallback className="text-xl">
                    {stream.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{stream.displayName || stream.username}</h3>
                  <p className="text-muted-foreground text-sm">@{stream.username}</p>
                </div>
              </div>

              <Link href={`/perfil/${stream.username}`}>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Users className="w-4 h-4 mr-2" />
                  Ver perfil
                </Button>
              </Link>
            </div>

            {/* Actions */}
            <div className="bg-muted/50 rounded-xl border border-border p-4 space-y-3">
              <Button
                variant="outline"
                className="w-full border-border"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Enlace copiado al portapapeles');
                  } catch (err) {
                    // Fallback for browsers that don't support clipboard API
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    toast.success('Enlace copiado al portapapeles');
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>

              <Button
                variant="outline"
                className="w-full border-border"
                onClick={() => router.push('/streaming')}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver más streams
              </Button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-gray-600/10 to-gray-500/10 border border-border/20 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Este stream ha terminado. Los streams archivados muestran las estadísticas finales de la transmisión.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
