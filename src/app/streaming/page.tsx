'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Radio, Search, TrendingUp, Users, Clock, X, Sparkles, Video, Mic, Flame, Crown, Eye, Star, Folder, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LiveStreamCard } from '@/components/streaming/LiveStreamCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/hooks/useTranslation';
import { Navbar } from '@/components/Navbar';
import toast from 'react-hot-toast';
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

interface SidebarStream {
  id: string;
  title: string;
  status: string;
  viewersCount: number;
  peakViewers: number;
  category?: string;
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  followersCount: number;
  fameScore: number;
  endedAt?: string;
}

interface SidebarCategory {
  name: string;
  totalStreams: number;
  liveStreams: number;
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
  const { data: session, status } = useSession();
  const { user, refreshBalance } = useAuthStore();
  const { t } = useTranslation();

  // Sincronizar sesión de NextAuth con Zustand
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !user) {
      refreshBalance();
    }
  }, [status, session, user, refreshBalance]);

  const currentUser = user || (session?.user ? {
    id: session.user.id || "",
    username: (session.user as any).username || session.user.email?.split("@")[0] || "user",
  } : null);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'live' | 'following'>('live');
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingStream, setIsStartingStream] = useState(false);

  // Stats from database (real-time)
  const [stats, setStats] = useState({
    liveNow: 0,
    totalViewers: 0,
    peakViewersToday: 0,
    streamsToday: 0,
  });

  // Sidebar data from database
  const [sidebar, setSidebar] = useState<{
    live: SidebarStream[];
    ended: SidebarStream[];
    categories: SidebarCategory[];
  }>({
    live: [],
    ended: [],
    categories: [],
  });

  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modal state
  const [showStartModal, setShowStartModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [streamCategory, setStreamCategory] = useState('');

  useEffect(() => {
    loadStreams();
  }, [filter, selectedCategory]);

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
      if (selectedCategory) params.set('category', selectedCategory);

      const response = await fetch(`/api/streaming?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setStreams(data.streams || []);

      // Update stats from server
      if (data.stats) {
        setStats(data.stats);
      }

      // Update sidebar from server
      if (data.sidebar) {
        setSidebar(data.sidebar);
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
    if (!isLoggedIn || !currentUser) {
      toast.error(t('streaming.chat.loginRequired'));
      router.push('/login');
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
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

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
                        type="button"
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
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isStartingStream}
                >
                  Cancelar
                </button>
                <button
                  type="button"
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

      <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
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
          {isLoggedIn && (
            <Button
              type="button"
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

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Main Content */}
          <div className="flex-1 min-w-0">
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

            {/* Category Filter Badge */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-400">Filtrando por:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                  <Folder className="w-3 h-3" />
                  {selectedCategory}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}

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
            {filter === 'following' && !isLoggedIn ? (
              <>
                <p className="text-lg mb-2">Inicia sesión para ver streams</p>
                <p className="text-sm">Debes iniciar sesión para ver streams de usuarios que sigues</p>
              </>
            ) : filter === 'following' ? (
              <>
                <p className="text-lg mb-2">No hay streams de usuarios que sigues</p>
                <p className="text-sm mb-4">Sigue a más usuarios para ver sus transmisiones aquí</p>
                <Button
                  variant="link"
                  onClick={() => setFilter('live')}
                  className="text-purple-400"
                >
                  Ver streams en vivo
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg mb-2">
                  {t('streaming.noLiveStreams')}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Sé el primero en iniciar una transmisión
                </p>
                {isLoggedIn && (
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500"
                    onClick={openStartModal}
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Iniciar mi primer stream
                  </Button>
                )}
              </>
            )}
          </div>
        )}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:w-80 xl:w-96 space-y-6">
            {/* Live Now Section */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-red-600/20 to-pink-600/20">
                <h3 className="font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" />
                  En Vivo Ahora
                  <span className="ml-auto text-xs bg-red-600 px-2 py-0.5 rounded-full">
                    {sidebar.live.length}
                  </span>
                </h3>
              </div>
              <div className="divide-y divide-gray-700/50">
                {sidebar.live.length > 0 ? (
                  sidebar.live.slice(0, 5).map((stream, index) => (
                    <Link
                      key={stream.id}
                      href={`/streaming/live/${stream.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="relative">
                        {index === 0 && (
                          <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                        )}
                        <Avatar className="w-10 h-10 border-2 border-red-500">
                          <AvatarImage src={stream.avatarUrl} />
                          <AvatarFallback>{stream.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{stream.displayName || stream.username}</p>
                        <p className="text-xs text-gray-400 truncate">{stream.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-red-400">
                            <Eye className="w-3 h-3" />
                            {stream.viewersCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {stream.followersCount}
                          </span>
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3" />
                            {stream.fameScore}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay streams en vivo
                  </div>
                )}
              </div>
            </div>

            {/* Recently Ended Section */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-gray-600/20 to-gray-500/20">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Terminados Recientes
                </h3>
              </div>
              <div className="divide-y divide-gray-700/50">
                {sidebar.ended.length > 0 ? (
                  sidebar.ended.slice(0, 5).map((stream) => (
                    <Link
                      key={stream.id}
                      href={`/streaming/${stream.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-700/30 transition-colors opacity-75 hover:opacity-100"
                    >
                      <Avatar className="w-10 h-10 border border-gray-600">
                        <AvatarImage src={stream.avatarUrl} />
                        <AvatarFallback>{stream.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{stream.displayName || stream.username}</p>
                        <p className="text-xs text-gray-400 truncate">{stream.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {stream.peakViewers} pico
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {stream.followersCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay streams terminados
                  </div>
                )}
              </div>
            </div>

            {/* Categories Section */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
                <h3 className="font-semibold flex items-center gap-2">
                  <Folder className="w-4 h-4 text-purple-400" />
                  Categorías
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {sidebar.categories.length > 0 ? (
                  sidebar.categories.map((cat) => {
                    const categoryInfo = STREAM_CATEGORIES.find(
                      c => c.id === cat.name || c.name.toLowerCase() === cat.name.toLowerCase()
                    );
                    return (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                          selectedCategory === cat.name
                            ? 'bg-purple-600/30 border border-purple-500/50'
                            : 'hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span>{categoryInfo?.emoji || '📁'}</span>
                          {categoryInfo?.name || cat.name}
                        </span>
                        <span className="flex items-center gap-2 text-xs">
                          {cat.liveStreams > 0 && (
                            <span className="flex items-center gap-1 text-red-400">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              {cat.liveStreams}
                            </span>
                          )}
                          <span className="text-gray-500">{cat.totalStreams} total</span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 text-sm py-2">
                    No hay categorías
                  </div>
                )}
              </div>
            </div>

            {/* Fame Legend */}
            <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Puntuación de Fama
              </h4>
              <p className="text-xs text-gray-400">
                La fama se calcula: <span className="text-yellow-300">(Viewers × 2) + Seguidores</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Los streamers con más fama aparecen primero
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
