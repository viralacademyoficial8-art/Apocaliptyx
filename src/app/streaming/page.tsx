'use client';

import { useState, useEffect } from 'react';
import { Radio, Search, TrendingUp, Users, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LiveStreamCard } from '@/components/streaming/LiveStreamCard';
import { useAuthStore } from '@/lib/stores';

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

export default function StreamingPage() {
  const { user } = useAuthStore();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'live' | 'all' | 'following'>('live');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStreams();
  }, [filter]);

  const loadStreams = async () => {
    setIsLoading(true);
    // Mock data - replace with actual API call
    const mockStreams: LiveStream[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'cryptomaster',
        displayName: 'Crypto Master',
        avatarUrl: '/avatars/user1.jpg',
        title: '🔴 Análisis en VIVO: Bitcoin rumbo a 100K',
        description: 'Analizando el mercado crypto en tiempo real',
        thumbnailUrl: '/thumbnails/stream1.jpg',
        status: 'live',
        viewersCount: 1250,
        peakViewers: 1800,
        totalViews: 15420,
        likesCount: 890,
        category: 'Crypto',
        tags: ['bitcoin', 'trading', 'análisis'],
        startedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        userId: 'user2',
        username: 'sportsguru',
        displayName: 'Sports Guru',
        avatarUrl: '/avatars/user2.jpg',
        title: '⚽ Predicciones La Liga - Jornada 20',
        thumbnailUrl: '/thumbnails/stream2.jpg',
        status: 'live',
        viewersCount: 856,
        peakViewers: 1200,
        totalViews: 8930,
        likesCount: 456,
        category: 'Deportes',
        tags: ['futbol', 'laliga', 'predicciones'],
        startedAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: '3',
        userId: 'user3',
        username: 'techprophet',
        displayName: 'Tech Prophet',
        avatarUrl: '/avatars/user3.jpg',
        title: '💻 Review: Lo que Apple anunciará en 2026',
        thumbnailUrl: '/thumbnails/stream3.jpg',
        status: 'live',
        viewersCount: 423,
        peakViewers: 600,
        totalViews: 3200,
        likesCount: 234,
        category: 'Tecnología',
        tags: ['apple', 'tech', 'predicciones'],
        startedAt: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: '4',
        userId: 'user4',
        username: 'gamingpro',
        displayName: 'Gaming Pro',
        avatarUrl: '/avatars/user4.jpg',
        title: '🎮 Predicciones Esports - League of Legends',
        thumbnailUrl: '/thumbnails/stream4.jpg',
        status: 'ended',
        viewersCount: 0,
        peakViewers: 2300,
        totalViews: 12500,
        likesCount: 1200,
        category: 'Gaming',
        tags: ['lol', 'esports', 'predicciones'],
      },
      {
        id: '5',
        userId: 'user5',
        username: 'economista',
        displayName: 'El Economista',
        avatarUrl: '/avatars/user5.jpg',
        title: '📈 Mercados financieros - Semana entrante',
        thumbnailUrl: '/thumbnails/stream5.jpg',
        status: 'ended',
        viewersCount: 0,
        peakViewers: 890,
        totalViews: 5600,
        likesCount: 345,
        category: 'Economía',
        tags: ['bolsa', 'mercados', 'inversiones'],
      },
    ];

    let filteredStreams = mockStreams;
    if (filter === 'live') {
      filteredStreams = mockStreams.filter((s) => s.status === 'live');
    }

    setStreams(filteredStreams);
    setIsLoading(false);
  };

  const filteredStreams = streams.filter((stream) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        stream.title.toLowerCase().includes(query) ||
        stream.displayName.toLowerCase().includes(query) ||
        stream.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const liveCount = streams.filter((s) => s.status === 'live').length;
  const totalViewers = streams
    .filter((s) => s.status === 'live')
    .reduce((sum, s) => sum + s.viewersCount, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radio className="w-8 h-8 text-red-500" />
              Streaming
            </h1>
            <p className="text-gray-400 mt-1">
              Transmisiones en vivo de predicciones y análisis
            </p>
          </div>
          {user && (
            <Button className="bg-red-600 hover:bg-red-700">
              <Radio className="w-4 h-4 mr-2" />
              Iniciar stream
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">En vivo ahora</span>
            </div>
            <p className="text-2xl font-bold">{liveCount}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Espectadores</span>
            </div>
            <p className="text-2xl font-bold">{totalViewers.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Más visto hoy</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.max(...streams.map((s) => s.peakViewers)).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Streams hoy</span>
            </div>
            <p className="text-2xl font-bold">{streams.length}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar streams..."
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'live' ? 'default' : 'outline'}
              onClick={() => setFilter('live')}
              className={filter === 'live' ? 'bg-red-600' : 'border-gray-700'}
            >
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              En vivo
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-purple-600' : 'border-gray-700'}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'following' ? 'default' : 'outline'}
              onClick={() => setFilter('following')}
              className={filter === 'following' ? 'bg-purple-600' : 'border-gray-700'}
            >
              <Users className="w-4 h-4 mr-1" />
              Siguiendo
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
                ? 'No hay streams en vivo ahora'
                : 'No se encontraron streams'}
            </p>
            {filter === 'live' && (
              <Button
                variant="link"
                onClick={() => setFilter('all')}
                className="text-purple-400 mt-2"
              >
                Ver todos los streams
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
