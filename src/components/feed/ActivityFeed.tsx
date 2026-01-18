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
  ChevronDown,
  ChevronUp,
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

type FilterType = 'all' | 'scenario_created' | 'scenario_stolen' | 'scenario_protected' | 'votes_yes' | 'votes_no' | 'live_stream' | 'scenario_closed' | 'scenario_resolved';

const FILTER_OPTIONS: { id: FilterType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'all', label: 'Todo', icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'scenario_created', label: 'Creados', icon: <Target className="w-3.5 h-3.5" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'scenario_stolen', label: 'Robados', icon: <Swords className="w-3.5 h-3.5" />, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'scenario_protected', label: 'Protegidos', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'votes_yes', label: 'Me gusta', icon: <ThumbsUp className="w-3.5 h-3.5" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'votes_no', label: 'No me gusta', icon: <ThumbsDown className="w-3.5 h-3.5" />, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'live_stream', label: 'En vivo', icon: <Radio className="w-3.5 h-3.5" />, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'scenario_closed', label: 'Cerrados', icon: <Lock className="w-3.5 h-3.5" />, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { id: 'scenario_resolved', label: 'Cumplidos', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
];

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
  scenario_vote_yes: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  scenario_vote_no: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/20 text-red-400',
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

// Compact Feed Item for collapsed view
function CompactFeedItem({ item, onClick }: { item: FeedItem; onClick: () => void }) {
  const isYesVote = item.type === 'scenario_vote' && item.metadata?.voteType === 'YES';
  const isNoVote = item.type === 'scenario_vote' && item.metadata?.voteType === 'NO';

  const getStyleKey = () => {
    if (isYesVote) return 'scenario_vote_yes';
    if (isNoVote) return 'scenario_vote_no';
    return item.type;
  };

  const styles = TYPE_STYLES[getStyleKey()] || TYPE_STYLES.scenario_created;

  const getIcon = () => {
    if (isYesVote) return <ThumbsUp className="w-3.5 h-3.5" />;
    if (isNoVote) return <ThumbsDown className="w-3.5 h-3.5" />;

    switch (item.type) {
      case 'scenario_created': return <Target className="w-3.5 h-3.5" />;
      case 'scenario_stolen': return <Swords className="w-3.5 h-3.5" />;
      case 'scenario_protected': return <Shield className="w-3.5 h-3.5" />;
      case 'scenario_resolved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'scenario_closed': return <Lock className="w-3.5 h-3.5" />;
      case 'live_stream': return <Radio className="w-3.5 h-3.5" />;
      case 'achievement': return <Trophy className="w-3.5 h-3.5" />;
      default: return <Target className="w-3.5 h-3.5" />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 p-2 rounded-lg ${styles.bg} ${styles.border} border hover:bg-gray-800/50 transition-all text-left`}
    >
      {/* User Avatar */}
      <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
        {item.user.avatarUrl ? (
          <img src={item.user.avatarUrl} alt={item.user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
            {item.user.username[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Icon Badge */}
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${styles.iconBg}`}>
        {getIcon()}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 truncate">
          <span className="font-medium text-white">{item.user.displayName || item.user.username}</span>
          {' '}
          <span className="text-gray-500">{item.title.toLowerCase()}</span>
        </p>
      </div>

      {/* Time */}
      <span className="text-[10px] text-gray-500 flex-shrink-0">
        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: false, locale: es })}
      </span>

      {/* Amount if exists */}
      {item.metadata?.amount && item.metadata.amount > 0 && (
        <span className="text-[10px] text-yellow-500 flex-shrink-0 flex items-center gap-0.5">
          <Flame className="w-2.5 h-2.5" />
          {item.metadata.amount.toLocaleString()}
        </span>
      )}
    </button>
  );
}

// Full Feed Item Card
function FeedItemCard({ item, isNew }: { item: FeedItem; isNew?: boolean }) {
  const router = useRouter();
  const isYesVote = item.type === 'scenario_vote' && item.metadata?.voteType === 'YES';
  const isNoVote = item.type === 'scenario_vote' && item.metadata?.voteType === 'NO';

  const getStyleKey = () => {
    if (isYesVote) return 'scenario_vote_yes';
    if (isNoVote) return 'scenario_vote_no';
    return item.type;
  };

  const styles = TYPE_STYLES[getStyleKey()] || TYPE_STYLES.scenario_created;

  const getIcon = () => {
    if (isYesVote) return <ThumbsUp className="w-4 h-4" />;
    if (isNoVote) return <ThumbsDown className="w-4 h-4" />;

    switch (item.type) {
      case 'scenario_created': return <Target className="w-4 h-4" />;
      case 'scenario_stolen': return <Swords className="w-4 h-4" />;
      case 'scenario_protected': return <Shield className="w-4 h-4" />;
      case 'scenario_resolved': return <CheckCircle className="w-4 h-4" />;
      case 'scenario_closed': return <Lock className="w-4 h-4" />;
      case 'live_stream': return <Radio className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

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
      className={`p-3 rounded-lg border ${styles.bg} ${styles.border} hover:bg-gray-800/50 transition-all cursor-pointer ${
        isNew ? 'animate-pulse ring-2 ring-purple-500/50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {/* User Avatar */}
        <button type="button" onClick={handleUserClick} className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
            {item.user.avatarUrl ? (
              <img src={item.user.avatarUrl} alt={item.user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                {item.user.username[0].toUpperCase()}
              </div>
            )}
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button type="button" onClick={handleUserClick} className="font-medium text-white text-sm hover:text-purple-400 transition-colors">
              {item.user.displayName || item.user.username}
            </button>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${styles.iconBg}`}>
              {getIcon()}
              {item.title}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{item.description}</p>
        </div>

        {/* Meta */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] text-gray-500">
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: es })}
          </span>
          {item.metadata?.amount && item.metadata.amount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-yellow-500">
              <Flame className="w-3 h-3" />
              {item.metadata.amount.toLocaleString()} AP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const channelRef = useRef<any>(null);

  const fetchFeed = useCallback(async (reset = false, silent = false) => {
    try {
      if (reset && !silent) {
        setRefreshing(true);
        setOffset(0);
      }

      const currentOffset = reset ? 0 : offset;
      const res = await fetch(`/api/feed?limit=50&offset=${currentOffset}`);

      if (!res.ok) throw new Error('Error al cargar el feed');

      const data = await res.json();

      if (reset) {
        if (silent && items.length > 0) {
          const existingIds = new Set(items.map(i => i.id));
          const newItems = data.items.filter((item: FeedItem) => !existingIds.has(item.id));
          if (newItems.length > 0) {
            setNewItemIds(new Set(newItems.map((i: FeedItem) => i.id)));
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

  // Initial fetch - intentionally empty deps to run only on mount
  useEffect(() => {
    fetchFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup Supabase Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scenarios' }, (payload) => {
        console.log('New scenario created:', payload);
        setNewItemsCount(prev => prev + 1);
        toast('🎯 ¡Nuevo escenario creado!', { icon: '🆕', style: { background: '#1f2937', color: '#fff' } });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const type = (payload.new as any)?.type;
        if (type === 'STEAL') {
          setNewItemsCount(prev => prev + 1);
          toast('🦹 ¡Escenario robado!', { icon: '⚔️', style: { background: '#1f2937', color: '#fff' } });
        } else if (type === 'PROTECT') {
          setNewItemsCount(prev => prev + 1);
          toast('🛡️ ¡Escenario protegido!', { icon: '✨', style: { background: '#1f2937', color: '#fff' } });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'predictions' }, (payload) => {
        setNewItemsCount(prev => prev + 1);
        toast('🎲 ¡Nueva predicción!', { icon: '💰', style: { background: '#1f2937', color: '#fff' } });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scenarios' }, (payload) => {
        const newData = payload.new as any;
        const oldData = payload.old as any;
        if (newData.resolved_at && !oldData?.resolved_at) {
          setNewItemsCount(prev => prev + 1);
          toast('✅ ¡Escenario resuelto!', { icon: '🏆', style: { background: '#1f2937', color: '#fff' } });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_achievements' }, (payload) => {
        setNewItemsCount(prev => prev + 1);
        toast('🏆 ¡Nuevo logro desbloqueado!', { icon: '🎉', style: { background: '#1f2937', color: '#fff' } });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_streams' }, (payload) => {
        setNewItemsCount(prev => prev + 1);
        toast('🔴 ¡Nueva transmisión en vivo!', { icon: '📺', style: { background: '#1f2937', color: '#fff' } });
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Filter items based on active filter
  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'votes_yes') return item.type === 'scenario_vote' && item.metadata?.voteType === 'YES';
    if (activeFilter === 'votes_no') return item.type === 'scenario_vote' && item.metadata?.voteType === 'NO';
    return item.type === activeFilter;
  });

  const displayedItems = isExpanded ? filteredItems : filteredItems.slice(0, 5);

  const handleRefresh = () => fetchFeed(true);
  const handleLoadNewItems = () => fetchFeed(true, true);
  const handleLoadMore = () => fetchFeed(false);

  const handleItemClick = (item: FeedItem) => {
    if (item.metadata?.scenarioId) {
      router.push(`/escenario/${item.metadata.scenarioId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <button type="button" onClick={() => fetchFeed(true)} className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">Actividad en Tiempo Real</h2>
          {isConnected ? (
            <span className="flex items-center gap-1 text-[10px] text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <Wifi className="w-3 h-3" />
            </span>
          ) : (
            <WifiOff className="w-3 h-3 text-gray-500" />
          )}
        </div>
        <button type="button" onClick={handleRefresh} disabled={refreshing} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters - Always visible */}
      <div className="p-2 border-b border-gray-800 flex flex-wrap gap-1">
        {FILTER_OPTIONS.map(filter => (
          <button
            type="button"
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] border transition-all ${
              activeFilter === filter.id ? filter.color : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
            }`}
          >
            {filter.icon}
            {filter.label}
          </button>
        ))}
      </div>

      {/* New items notification */}
      {newItemsCount > 0 && (
        <button
          type="button"
          onClick={handleLoadNewItems}
          className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium transition-colors flex items-center justify-center gap-2 border-b border-gray-800"
        >
          <Bell className="w-3 h-3 animate-bounce" />
          {newItemsCount} {newItemsCount === 1 ? 'nueva actividad' : 'nuevas actividades'}
        </button>
      )}

      {/* Feed Content */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[600px]' : 'max-h-[280px]'}`}>
        <div className={`p-2 space-y-1.5 ${isExpanded ? 'overflow-y-auto max-h-[580px]' : ''}`}>
          {displayedItems.length > 0 ? (
            <>
              {isExpanded ? (
                displayedItems.map((item) => (
                  <FeedItemCard key={item.id} item={item} isNew={newItemIds.has(item.id)} />
                ))
              ) : (
                displayedItems.map((item) => (
                  <CompactFeedItem key={item.id} item={item} onClick={() => handleItemClick(item)} />
                ))
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No hay actividad para este filtro</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800">
        {filteredItems.length > 5 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 text-center text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver {filteredItems.length - 5} más
              </>
            )}
          </button>
        )}
        {isExpanded && hasMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            className="w-full py-2 text-center text-gray-400 hover:text-gray-300 text-xs transition-colors border-t border-gray-800"
          >
            Cargar más actividad
          </button>
        )}
      </div>
    </div>
  );
}
