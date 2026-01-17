'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

function FeedItemCard({ item }: { item: FeedItem }) {
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
      className={`p-4 rounded-xl border ${styles.bg} ${styles.border} hover:bg-gray-800/50 transition-all cursor-pointer`}
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

  const fetchFeed = async (reset = false) => {
    try {
      if (reset) {
        setRefreshing(true);
        setOffset(0);
      }

      const currentOffset = reset ? 0 : offset;
      const res = await fetch(`/api/feed?limit=30&offset=${currentOffset}`);

      if (!res.ok) throw new Error('Error al cargar el feed');

      const data = await res.json();

      if (reset) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }

      setHasMore(data.hasMore);
      setOffset(currentOffset + data.items.length);
      setError(null);
    } catch (err) {
      setError('Error al cargar la actividad');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed(true);
  }, []);

  const handleRefresh = () => {
    fetchFeed(true);
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
          <h2 className="text-lg font-semibold text-white">Actividad Reciente</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feed Items */}
      {items.length > 0 ? (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <FeedItemCard key={item.id} item={item} />
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
            La actividad de la plataforma aparecerá aquí
          </p>
        </div>
      )}
    </div>
  );
}
