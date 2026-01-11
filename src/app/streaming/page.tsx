'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Search, TrendingUp, Users, Clock, X, Sparkles, Video, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LiveStreamCard } from '@/components/streaming/LiveStreamCard';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';

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

const STREAM_CATEGORIES = [
  { id: 'predicciones', name: 'Predicciones', emoji: '🔮' },
  { id: 'analisis', name: 'Análisis', emoji: '📊' },
  { id: 'debate', name: 'Debate', emoji: '💬' },
  { id: 'noticias', name: 'Noticias', emoji: '📰' },
  { id: 'estrategia', name: 'Estrategia', emoji: '🎯' },
  { id: 'entretenimiento', name: 'Entretenimiento', emoji: '🎮' },
];

export default function StreamingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'live' | 'all' | 'following'>('live');
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingStream, setIsStartingStream] = useState(false);

  // Stats from database (real-time)
  const [stats, setStats] = useState({
    liveNow: 0,
    totalViewers: 0,
    peakViewersToday: 0,
    streamsToday: 0,
  });

  // Modal state
  const [showStartModal, setShowStartModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [streamCategory, setStreamCategory] = useState('');

  useEffect(() => {
    loadStreams();
  }, [filter]);

  // Auto-refresh stats every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadStreams();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [filter]);

  const loadStreams = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('filter', filter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/streaming?${params.toString()}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setStreams(data.streams || []);

      // Update stats from server
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading streams:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStream = async () => {
    if (!streamTitle.trim()) {
      toast.error('Por favor ingresa un título para tu stream');
      return;
    }

    setIsStartingStream(true);
    try {
      const response = await fetch('/api/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: streamTitle,
          description: streamDescription,
          category: streamCategory,
        }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      toast.success(t('streaming.connecting'));
      setShowStartModal(false);

      // Redirect to the live stream page as host
      router.push(`/streaming/live/${data.stream.id}?host=true`);
    } catch (error: unknown) {
      console.error('Error starting stream:', error);
      toast.error(error instanceof Error ? error.message : t('common.error'));
      setIsStartingStream(false);
    }
  };

  const openStartModal = () => {
    if (!user) {
      toast.error(t('streaming.chat.loginRequired'));
      return;
    }
    setStreamTitle('');
    setStreamDescription('');
    setStreamCategory('');
    setShowStartModal(true);
  };

  const filteredStreams = streams.filter((stream) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        stream.title.toLowerCase().includes(query) ||
        stream.displayName?.toLowerCase().includes(query) ||
        stream.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Start Stream Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isStartingStream && setShowStartModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 animate-pulse" />

            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-red-600/20 via-purple-600/20 to-pink-600/20 px-6 py-5 border-b border-gray-800">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                      <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Iniciar Transmisión</h2>
                      <p className="text-sm text-gray-400">Comparte con tu audiencia en vivo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !isStartingStream && setShowStartModal(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                    disabled={isStartingStream}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Title input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título del stream *
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Ej: Predicciones para el fin de semana 🔥"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isStartingStream}
                      maxLength={100}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{streamTitle.length}/100 caracteres</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={streamDescription}
                    onChange={(e) => setStreamDescription(e.target.value)}
                    placeholder="Cuéntale a tu audiencia de qué tratará tu stream..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    disabled={isStartingStream}
                    maxLength={500}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STREAM_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setStreamCategory(streamCategory === cat.id ? '' : cat.id)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          streamCategory === cat.id
                            ? 'bg-red-600/20 border-red-500 text-red-400'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                        disabled={isStartingStream}
                      >
                        <span className="mr-1">{cat.emoji}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Tips para un buen stream
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <Video className="w-3 h-3 text-purple-400" />
                      Asegúrate de tener buena iluminación
                    </li>
                    <li className="flex items-center gap-2">
                      <Mic className="w-3 h-3 text-purple-400" />
                      Usa audífonos para evitar eco
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isStartingStream}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartStream}
                  disabled={isStartingStream || !streamTitle.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingStream ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4" />
                      Ir en Vivo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radio className="w-8 h-8 text-red-500" />
              {t('streaming.title')}
            </h1>
            <p className="text-gray-400 mt-1">
              {t('streaming.subtitle')}
            </p>
          </div>
          {user && (
            <Button
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 border-0"
              onClick={openStartModal}
              disabled={isStartingStream}
            >
              <Radio className={`w-4 h-4 mr-2 ${isStartingStream ? 'animate-pulse' : ''}`} />
              {isStartingStream ? t('streaming.starting') : t('streaming.startStream')}
            </Button>
          )}
        </div>

        {/* Stats - Real-time from database */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">{t('streaming.liveNow')}</span>
            </div>
            <p className="text-2xl font-bold">{stats.liveNow}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{t('streaming.viewers')}</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalViewers.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t('streaming.mostWatchedToday')}</span>
            </div>
            <p className="text-2xl font-bold">{stats.peakViewersToday.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t('streaming.streamsToday')}</span>
            </div>
            <p className="text-2xl font-bold">{stats.streamsToday}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t('common.search')}...`}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'live' ? 'default' : 'outline'}
              onClick={() => setFilter('live')}
              className={`text-sm ${filter === 'live' ? 'bg-red-600' : 'border-gray-700'}`}
              size="sm"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              {t('streaming.live')}
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={`text-sm ${filter === 'all' ? 'bg-purple-600' : 'border-gray-700'}`}
              size="sm"
            >
              {t('streaming.all')}
            </Button>
            <Button
              variant={filter === 'following' ? 'default' : 'outline'}
              onClick={() => setFilter('following')}
              className={`text-sm ${filter === 'following' ? 'bg-purple-600' : 'border-gray-700'}`}
              size="sm"
            >
              <Users className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t('streaming.following')}</span>
              <span className="sm:hidden">Seguidos</span>
            </Button>
          </div>
        </div>

        {/* Streams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filteredStreams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {filter === 'live'
                ? t('streaming.noLiveStreams')
                : t('streaming.noLiveStreams')}
            </p>
            {filter === 'live' && (
              <Button
                variant="link"
                onClick={() => setFilter('all')}
                className="text-purple-400 mt-2"
              >
                {t('streaming.viewAllStreams')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
