'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Search, TrendingUp, Users, Clock } from 'lucide-react';
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

export default function StreamingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'live' | 'all' | 'following'>('live');
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingStream, setIsStartingStream] = useState(false);

  useEffect(() => {
    loadStreams();
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
    } catch (error) {
      console.error('Error loading streams:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStream = async () => {
    if (!user) {
      toast.error(t('streaming.chat.loginRequired'));
      return;
    }

    const title = prompt(t('streaming.streamTitle'));
    if (!title) return;

    setIsStartingStream(true);
    try {
      const response = await fetch('/api/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      toast.success(t('streaming.connecting'));

      // Redirect to the live stream page as host
      router.push(`/streaming/live/${data.stream.id}?host=true`);
    } catch (error: unknown) {
      console.error('Error starting stream:', error);
      toast.error(error instanceof Error ? error.message : t('common.error'));
      setIsStartingStream(false);
    }
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
              {t('streaming.title')}
            </h1>
            <p className="text-gray-400 mt-1">
              {t('streaming.subtitle')}
            </p>
          </div>
          {user && (
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleStartStream}
              disabled={isStartingStream}
            >
              <Radio className={`w-4 h-4 mr-2 ${isStartingStream ? 'animate-pulse' : ''}`} />
              {isStartingStream ? t('streaming.starting') : t('streaming.startStream')}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">{t('streaming.liveNow')}</span>
            </div>
            <p className="text-2xl font-bold">{liveCount}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{t('streaming.viewers')}</span>
            </div>
            <p className="text-2xl font-bold">{totalViewers.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t('streaming.mostWatchedToday')}</span>
            </div>
            <p className="text-2xl font-bold">
              {streams.length > 0
                ? Math.max(...streams.map((s) => s.peakViewers || 0)).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t('streaming.streamsToday')}</span>
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
