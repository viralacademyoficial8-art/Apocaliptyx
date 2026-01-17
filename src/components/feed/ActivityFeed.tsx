'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Loader2,
  Target,
  Swords,
  Shield,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Lock,
  Radio,
  Trophy,
  Flame,
  Users,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Supabase client for realtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FeedUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  isVerified: boolean;
}

interface FeedItem {
  id: string;
  type: 'scenario_created' | 'scenario_stolen' | 'scenario_protected' | 'scenario_vote' | 'scenario_resolved' | 'scenario_closed' | 'live_stream' | 'achievement';
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  user: FeedUser;
  metadata?: {
    scenarioId?: string;
    scenarioTitle?: string;
    amount?: number;
    voteType?: 'YES' | 'NO';
    outcome?: boolean;
    previousHolder?: string;
  };
}

const TYPE_STYLES: Record<string, { bg: string; border: string; iconBg: string }> = {
  scenario_created: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  scenario_stolen: {
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/20 text-orange-400',
  },
  scenario_protected: {
    bg: 'bg-green-500/5',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/20 text-green-400',
  },
  scenario_vote: {
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
  scenario_resolved: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  scenario_closed: {
    bg: 'bg-gray-500/5',
    border: 'border-gray-500/20',
    iconBg: 'bg-gray-500/20 text-gray-400',
  },
  live_stream: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/20 text-red-400',
  },
  achievement: {
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/20 text-yellow-400',
  },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  scenario_created: <Target className="w-5 h-5" />,
  scenario_stolen: <Swords className="w-5 h-5" />,
  scenario_protected: <Shield className="w-5 h-5" />,
  scenario_vote: <ThumbsUp className="w-5 h-5" />,
  scenario_resolved: <CheckCircle className="w-5 h-5" />,
  scenario_closed: <Lock className="w-5 h-5" />,
  live_stream: <Radio className="w-5 h-5" />,
  achievement: <Trophy className="w-5 h-5" />,
};

const ACTIVITY_MESSAGES: Record<string, string> = {
  scenario_created: '¡Nuevo escenario creado!',
  scenario_stolen: '¡Escenario robado!',
  scenario_vote: '¡Nueva votación!',
  scenario_resolved: '¡Escenario resuelto!',
  achievement: '¡Logro desbloqueado!',
};

function FeedItemCard({ item, isNew }: { item: FeedItem; isNew?: boolean }) {
  const router = useRouter();
  const styles = TYPE_STYLES[item.type] || TYPE_STYLES.scenario_created;

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/perfil/${item.user.username}`);
  };

  const handleCardClick = () => {
    if (item.metadata?.scenarioId) {
      router.push(`/escenario/${item.metadata.scenarioId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-4 rounded-xl border ${styles.bg} ${styles.border} hover:bg-gray-800/50 transition-all cursor-pointer ${
        isNew ? 'animate-pulse ring-2 ring-purple-500/50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <button
          onClick={handleUserClick}
          className="flex-shrink-0 relative group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
            {item.user.avatarUrl ? (
              <img
                src={item.user.avatarUrl}
                alt={item.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {item.user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          {item.user.isVerified && (
            <span className="absolute -bottom-0.5 -right-0.5 text-xs bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
              ✓
            </span>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleUserClick}
              className="font-semibold text-white hover:text-purple-400 transition-colors"
            >
              {item.user.displayName || item.user.username}
            </button>
            <span className="text-xs text-gray-500">@{item.user.username}</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">Nivel {item.user.level}</span>
            {isNew && (
              <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded-full">
                NUEVO
              </span>
            )}
          </div>

          {/* Activity Type Badge */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${styles.iconBg}`}>
              {TYPE_ICONS[item.type]}
              {item.title}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: es })}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mt-2 line-clamp-2">
            {item.description}
          </p>

          {/* Metadata */}
          {item.metadata?.amount && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-yellow-500">
                <Flame className="w-3 h-3" />
                {item.metadata.amount.toLocaleString()} AP
              </span>
            </div>
          )}
        </div>

        {/* Activity Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl ${styles.iconBg}`}>
          {item.icon}
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<any>(null);

  const fetchFeed = useCallback(async (reset = false, silent = false) => {
    try {
      if (reset && !silent) {
        setRefreshing(true);
        setOffset(0);
      }

      const currentOffset = reset ? 0 : offset;
      const res = await fetch(`/api/feed?limit=30&offset=${currentOffset}`);

      if (!res.ok) throw new Error('Error al cargar el feed');

      const data = await res.json();

      if (reset) {
        // Check for new items
        if (silent && items.length > 0) {
          const existingIds = new Set(items.map(i => i.id));
          const newItems = data.items.filter((item: FeedItem) => !existingIds.has(item.id));
          if (newItems.length > 0) {
            setNewItemIds(new Set(newItems.map((i: FeedItem) => i.id)));
            // Clear new item highlight after 5 seconds
            setTimeout(() => setNewItemIds(new Set()), 5000);
          }
        }
        setItems(data.items);
        setNewItemsCount(0);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }

      setHasMore(data.hasMore);
      setOffset(currentOffset + data.items.length);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError('Error al cargar la actividad');
      }
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [offset, items]);

  // Initial fetch
  useEffect(() => {
    fetchFeed(true);
  }, []);

  // Setup Supabase Realtime subscriptions
  useEffect(() => {
    // Create a channel for all activity-related tables
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scenarios' },
        (payload) => {
          console.log('New scenario created:', payload);
          setNewItemsCount(prev => prev + 1);
          toast('🎯 ¡Nuevo escenario creado!', {
            icon: '🆕',
            style: { background: '#1f2937', color: '#fff' },
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          const type = (payload.new as any)?.type;
          if (type === 'STEAL') {
            console.log('New steal:', payload);
            setNewItemsCount(prev => prev + 1);
            toast('🦹 ¡Escenario robado!', {
              icon: '⚔️',
              style: { background: '#1f2937', color: '#fff' },
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('New vote:', payload);
          setNewItemsCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'scenarios' },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          // Check if scenario was just resolved
          if (newData.resolved_at && !oldData?.resolved_at) {
            console.log('Scenario resolved:', payload);
            setNewItemsCount(prev => prev + 1);
            toast('✅ ¡Escenario resuelto!', {
              icon: '🏆',
              style: { background: '#1f2937', color: '#fff' },
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_achievements' },
        (payload) => {
          console.log('New achievement:', payload);
          setNewItemsCount(prev => prev + 1);
          toast('🏆 ¡Nuevo logro desbloqueado!', {
            icon: '🎉',
            style: { background: '#1f2937', color: '#fff' },
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    fetchFeed(true);
  };

  const handleLoadNewItems = () => {
    fetchFeed(true, true);
  };

  const handleLoadMore = () => {
    fetchFeed(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchFeed(true)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Actividad en Tiempo Real</h2>
          {/* Connection status indicator */}
          <div className="flex items-center gap-1">
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <Wifi className="w-3 h-3" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <WifiOff className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* New items notification */}
      {newItemsCount > 0 && (
        <button
          onClick={handleLoadNewItems}
          className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Bell className="w-4 h-4 animate-bounce" />
          {newItemsCount} {newItemsCount === 1 ? 'nueva actividad' : 'nuevas actividades'}
          <span className="text-xs text-purple-500">• Click para ver</span>
        </button>
      )}

      {/* Feed Items */}
      {items.length > 0 ? (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <FeedItemCard
                key={item.id}
                item={item}
                isNew={newItemIds.has(item.id)}
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full py-3 text-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              Cargar más
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay actividad reciente</p>
          <p className="text-gray-500 text-sm mt-1">
            La actividad de la plataforma aparecerá aquí en tiempo real
          </p>
        </div>
      )}
    </div>
  );
}
