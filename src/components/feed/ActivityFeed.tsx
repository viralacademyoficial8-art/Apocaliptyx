'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-client';
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
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookMarked,
  Eye,
  Send,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

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
  // Interaction counts
  likes_count?: number;
  comments_count?: number;
  bookmarks_count?: number;
  views_count?: number;
  // User state
  user_liked?: boolean;
  user_bookmarked?: boolean;
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
  { id: 'scenario_closed', label: 'Cerrados', icon: <Lock className="w-3.5 h-3.5" />, color: 'bg-gray-500/20 text-muted-foreground border-gray-500/30' },
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
    iconBg: 'bg-gray-500/20 text-muted-foreground',
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
      className={`w-full flex items-center gap-2 p-2 rounded-lg ${styles.bg} ${styles.border} border hover:bg-muted/50 transition-all text-left`}
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
        <p className="text-xs text-foreground truncate">
          <span className="font-medium text-white">{item.user.displayName || item.user.username}</span>
          {' '}
          <span className="text-muted-foreground">{item.title.toLowerCase()}</span>
        </p>
      </div>

      {/* Time */}
      <span className="text-[10px] text-muted-foreground flex-shrink-0">
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

// Full Feed Item Card with Interactions
function FeedItemCard({
  item,
  isNew,
  onLike,
  onBookmark,
  onShare,
  onOpenComments,
}: {
  item: FeedItem;
  isNew?: boolean;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onShare?: (item: FeedItem) => void;
  onOpenComments?: (id: string) => void;
}) {
  const router = useRouter();
  const [showShareMenu, setShowShareMenu] = useState(false);
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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(item.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(item.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenComments?.(item.id);
  };

  const shareToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = item.metadata?.scenarioId
      ? `${window.location.origin}/escenario/${item.metadata.scenarioId}`
      : window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Enlace copiado');
    setShowShareMenu(false);
  };

  const shareToTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${item.user.displayName || item.user.username} ${item.title}: "${item.description}"`;
    const url = item.metadata?.scenarioId
      ? `${window.location.origin}/escenario/${item.metadata.scenarioId}`
      : window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${item.user.displayName || item.user.username} ${item.title}: "${item.description}"`;
    const url = item.metadata?.scenarioId
      ? `${window.location.origin}/escenario/${item.metadata.scenarioId}`
      : window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <div
      className={`p-3 rounded-lg border ${styles.bg} ${styles.border} hover:bg-muted/50 transition-all ${
        isNew ? 'animate-pulse ring-2 ring-purple-500/50' : ''
      }`}
    >
      {/* Main Content - Clickable */}
      <div onClick={handleCardClick} className="cursor-pointer">
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
            <p className="text-muted-foreground text-xs mt-0.5 truncate">{item.description}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-muted-foreground">
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

      {/* Interaction Bar */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1 text-xs transition-colors ${
            item.user_liked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${item.user_liked ? 'fill-current' : ''}`} />
          <span>{item.likes_count || 0}</span>
        </button>

        {/* Comments */}
        <button
          type="button"
          onClick={handleCommentsClick}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{item.comments_count || 0}</span>
        </button>

        {/* Share */}
        <div className="relative">
          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-purple-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {showShareMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[140px] py-1"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={shareToClipboard}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                Copiar enlace
              </button>
              <button
                onClick={shareToTwitter}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </button>
              <button
                onClick={shareToWhatsApp}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`flex items-center gap-1 text-xs transition-colors ${
            item.user_bookmarked ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
          }`}
        >
          {item.user_bookmarked ? (
            <BookMarked className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          <span>{item.bookmarks_count || 0}</span>
        </button>

        {/* Views */}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{item.views_count || 0}</span>
        </span>
      </div>
    </div>
  );
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
  };
}

export function ActivityFeed() {
  const supabase = getSupabaseBrowser();
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

  // Comments modal state
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [commentsActivityId, setCommentsActivityId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchFeed = useCallback(async (reset = false, silent = false) => {
    try {
      if (reset && !silent) {
        setRefreshing(true);
        setOffset(0);
      }

      const currentOffset = reset ? 0 : offset;
      const res = await fetch(`/api/feed?limit=50&offset=${currentOffset}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

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

  // Setup Supabase Realtime subscription to feed_activities table
  useEffect(() => {
    const channel = supabase
      .channel('activity-feed')
      // Subscribe to new activities in feed_activities table
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_activities' }, (payload) => {
        const activity = payload.new as any;
        console.log('New feed activity:', activity);
        setNewItemsCount(prev => prev + 1);

        // Show toast based on activity type
        const toastStyle = { background: '#1f2937', color: '#fff' };
        switch (activity.type) {
          case 'scenario_created':
            toast('🎯 ¡Nuevo escenario creado!', { icon: '🆕', style: toastStyle });
            break;
          case 'scenario_stolen':
            toast('🦹 ¡Escenario robado!', { icon: '⚔️', style: toastStyle });
            break;
          case 'scenario_protected':
            toast('🛡️ ¡Escenario protegido!', { icon: '✨', style: toastStyle });
            break;
          case 'scenario_vote':
            toast('🎲 ¡Nueva prediccion!', { icon: '💰', style: toastStyle });
            break;
          case 'scenario_resolved':
            toast('✅ ¡Escenario resuelto!', { icon: '🏆', style: toastStyle });
            break;
          case 'scenario_closed':
            toast('🔒 Escenario cerrado', { icon: '📝', style: toastStyle });
            break;
          case 'achievement':
            toast('🏆 ¡Nuevo logro desbloqueado!', { icon: '🎉', style: toastStyle });
            break;
          case 'live_stream':
            toast('🔴 ¡Nueva transmision en vivo!', { icon: '📺', style: toastStyle });
            break;
        }
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

  // Interaction handlers
  const handleLike = async (activityId: string) => {
    try {
      const res = await fetch(`/api/feed/activities/${activityId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => prev.map(item =>
          item.id === activityId
            ? {
                ...item,
                user_liked: data.liked,
                likes_count: (item.likes_count || 0) + (data.liked ? 1 : -1),
              }
            : item
        ));
        toast.success(data.liked ? 'Te gusta' : 'Ya no te gusta');
      }
    } catch (error) {
      toast.error('Error al dar like');
    }
  };

  const handleBookmark = async (activityId: string) => {
    try {
      const res = await fetch(`/api/feed/activities/${activityId}/bookmark`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => prev.map(item =>
          item.id === activityId
            ? {
                ...item,
                user_bookmarked: data.bookmarked,
                bookmarks_count: (item.bookmarks_count || 0) + (data.bookmarked ? 1 : -1),
              }
            : item
        ));
        toast.success(data.bookmarked ? 'Guardado' : 'Eliminado de guardados');
      }
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleOpenComments = async (activityId: string) => {
    setCommentsActivityId(activityId);
    setCommentsModalOpen(true);
    setLoadingComments(true);
    setComments([]);

    try {
      const res = await fetch(`/api/feed/activities/${activityId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commentsActivityId || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/feed/activities/${commentsActivityId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
        // Update comments count in the feed item
        setItems(prev => prev.map(item =>
          item.id === commentsActivityId
            ? { ...item, comments_count: (item.comments_count || 0) + 1 }
            : item
        ));
        toast.success('Comentario publicado');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al publicar');
      }
    } catch (error) {
      toast.error('Error al publicar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const closeCommentsModal = () => {
    setCommentsModalOpen(false);
    setCommentsActivityId(null);
    setComments([]);
    setNewComment('');
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
    <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">Actividad en Tiempo Real</h2>
          {isConnected ? (
            <span className="flex items-center gap-1 text-[10px] text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <Wifi className="w-3 h-3" />
            </span>
          ) : (
            <WifiOff className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
        <button type="button" onClick={handleRefresh} disabled={refreshing} className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters - Always visible */}
      <div className="p-2 border-b border-border flex flex-wrap gap-1">
        {FILTER_OPTIONS.map(filter => (
          <button
            type="button"
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] border transition-all ${
              activeFilter === filter.id ? filter.color : 'bg-muted/50 text-muted-foreground border-border hover:border-border'
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
          className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium transition-colors flex items-center justify-center gap-2 border-b border-border"
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
                  <FeedItemCard
                    key={item.id}
                    item={item}
                    isNew={newItemIds.has(item.id)}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onOpenComments={handleOpenComments}
                  />
                ))
              ) : (
                displayedItems.map((item) => (
                  <CompactFeedItem key={item.id} item={item} onClick={() => handleItemClick(item)} />
                ))
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-xs">No hay actividad para este filtro</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border">
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
            className="w-full py-2 text-center text-muted-foreground hover:text-foreground text-xs transition-colors border-t border-border"
          >
            Cargar más actividad
          </button>
        )}
      </div>

      {/* Comments Modal */}
      {commentsModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-card w-full sm:max-w-2xl sm:rounded-xl rounded-t-xl border border-border max-h-[calc(100vh-100px)] sm:max-h-[80vh] flex flex-col mb-16 sm:mb-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h3 className="text-xl font-bold text-white">Comentarios</h3>
              <button
                type="button"
                onClick={closeCommentsModal}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Activity original */}
            {(() => {
              const activity = items.find(i => i.id === commentsActivityId);
              if (!activity) return null;
              return (
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 mt-3 sm:mt-4 border border-border flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all overflow-hidden flex-shrink-0"
                      style={activity.user.avatarUrl ? { background: `url(${activity.user.avatarUrl}) center/cover` } : undefined}
                    >
                      {!activity.user.avatarUrl && (activity.user.displayName || activity.user.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-white text-sm sm:text-base">
                        {activity.user.displayName || activity.user.username}
                      </span>
                      <span className="text-muted-foreground text-xs sm:text-sm ml-1 sm:ml-2">
                        @{activity.user.username}
                      </span>
                    </div>
                  </div>
                  <p className="text-foreground text-sm sm:text-base line-clamp-2">{activity.description}</p>
                </div>
              );
            })()}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-[100px]">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div
                          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all overflow-hidden flex-shrink-0"
                          style={comment.users?.avatar_url ? { background: `url(${comment.users.avatar_url}) center/cover` } : undefined}
                        >
                          {!comment.users?.avatar_url && (comment.users?.display_name || comment.users?.username || 'U')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-white">
                          {comment.users?.display_name || comment.users?.username}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">
                          @{comment.users?.username}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className="text-foreground text-sm ml-8">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay comentarios. ¡Sé el primero!
                </p>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-3 sm:p-4 border-t border-border flex-shrink-0 bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment(e)}
                  placeholder="Escribe un comentario..."
                  maxLength={500}
                  className="flex-1 px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                />
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
