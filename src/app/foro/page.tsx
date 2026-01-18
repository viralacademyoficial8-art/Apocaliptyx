'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import {
  forumService,
  ForumPost,
  ForumComment,
  ForumCategory,
  ReactionType,
  TrendingTag,
  ForumStory,
  ForumPoll,
  AwardType,
  BadgeType,
  MentionSuggestion,
} from '@/services/forum.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TextWithLinkPreviews } from '@/components/LinkPreview';
import {
  MessageSquarePlus,
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Hash,
  X,
  MessageCircle,
  Flame,
  Loader2,
  Heart,
  Send,
  Trash2,
  Pin,
  Lock,
  Bookmark,
  BookMarked,
  Share2,
  Repeat2,
  Image as ImageIcon,
  Sparkles,
  BarChart3,
  Plus,
  Gift,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  AlertCircle,
  Award,
  ListPlus,
  AtSign,
  Video,
  Radio,
  Globe,
  Search,
  MoreVertical,
  Link2,
  Flag,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDistanceToNow, type Locale } from 'date-fns';
import { es, enUS, pt, fr, de, ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from '@/hooks/useTranslation';

// Supabase client for image uploads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import { useLanguage } from '@/contexts/LanguageContext';
import { StoriesBar, StoryViewer, CreateStoryModal } from '@/components/stories';
import { ReelsFeed } from '@/components/reels/ReelsFeed';
import { CreateReelModal } from '@/components/reels/CreateReelModal';
import { CreateCommunityModal } from '@/components/communities/CreateCommunityModal';
import { ActivityFeed } from '@/components/feed';
import Link from 'next/link';

// Reaction and tag definitions are now inside ForoContent component for i18n support

// Badge colors
const BADGE_STYLES: Record<BadgeType, { icon: string; color: string; bg: string }> = {
  verified: { icon: '✓', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  creator: { icon: '★', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  prophet: { icon: '🔮', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  og: { icon: '👑', color: 'text-green-400', bg: 'bg-green-500/20' },
  moderator: { icon: '🛡️', color: 'text-red-400', bg: 'bg-red-500/20' },
  apocaliptyx: { icon: '⚡', color: 'text-pink-400', bg: 'bg-pink-500/20' },
};

// Loading fallback component
function ForoLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function ForoPage() {
  return (
    <Suspense fallback={<ForoLoadingFallback />}>
      <ForoContent />
    </Suspense>
  );
}

function ForoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { user, isAuthenticated, refreshBalance } = useAuthStore();
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Sync NextAuth session with Zustand store using refreshBalance
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      refreshBalance();
    }
  }, [status, session, refreshBalance]);

  // Determine if user is logged in (check both NextAuth and Zustand)
  const isLoggedIn = (status === 'authenticated' && !!session?.user) || isAuthenticated;
  const currentUserId = user?.id || session?.user?.id;

  // Map language to date-fns locale
  const dateLocales: Record<string, Locale> = { es, en: enUS, pt, fr, de, ru };
  const dateLocale = dateLocales[language] || es;

  // Reaction definitions with translations
  const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
    { type: 'fire', emoji: '🔥', label: t('forum.reactions.fire'), color: 'text-orange-400' },
    { type: 'love', emoji: '❤️', label: t('forum.reactions.love'), color: 'text-red-400' },
    { type: 'clap', emoji: '👏', label: t('forum.reactions.clap'), color: 'text-yellow-400' },
    { type: 'mindblown', emoji: '🤯', label: t('forum.reactions.mindblown'), color: 'text-purple-400' },
    { type: 'laugh', emoji: '😂', label: t('forum.reactions.laugh'), color: 'text-green-400' },
    { type: 'sad', emoji: '😢', label: t('forum.reactions.sad'), color: 'text-blue-400' },
  ];

  // Forum tags with translations
  const FORUM_TAGS = [
    { id: 'prediccion', label: `🔮 ${t('forum.tags.prediction')}`, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'debate', label: `💬 ${t('forum.tags.debate')}`, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'estrategia', label: `🎯 ${t('forum.tags.strategy')}`, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { id: 'analisis', label: `📊 ${t('forum.tags.analysis')}`, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { id: 'noticia', label: `📰 ${t('forum.tags.news')}`, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { id: 'humor', label: `😂 ${t('forum.tags.humor')}`, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  ];

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [stories, setStories] = useState<ForumStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'popular' | 'comments' | 'following' | 'hot' | 'rising'>('recent');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal de crear post
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'post' | 'poll' | 'thread'>('post');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedGif, setSelectedGif] = useState<{ url: string; width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Poll creation
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(24);

  // Thread creation
  const [threadPosts, setThreadPosts] = useState(['']);

  // Mentions
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Modal de comentarios
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modal de confirmación de eliminación de comentarios
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal de confirmación de eliminación de posts
  const [deletePostConfirmOpen, setDeletePostConfirmOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Modal de repost
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [repostingPost, setRepostingPost] = useState<ForumPost | null>(null);
  const [quoteContent, setQuoteContent] = useState('');
  const [isReposting, setIsReposting] = useState(false);

  // Modal de awards
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [awardingPost, setAwardingPost] = useState<ForumPost | null>(null);
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [selectedAward, setSelectedAward] = useState<AwardType | null>(null);
  const [awardMessage, setAwardMessage] = useState('');
  const [givingAward, setGivingAward] = useState(false);

  // Stories Modal - New Instagram-style components
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [viewingUserStories, setViewingUserStories] = useState<{
    userId: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    hasUnviewed: boolean;
    storiesCount: number;
    stories: {
      id: string;
      content?: string;
      mediaUrl?: string;
      mediaType?: string;
      backgroundColor?: string;
      textColor?: string;
      createdAt: string;
      isViewed: boolean;
    }[];
  } | null>(null);

  // Create Story Modal
  const [createStoryModalOpen, setCreateStoryModalOpen] = useState(false);
  const [storiesKey, setStoriesKey] = useState(0); // For refreshing StoriesBar

  // Tab navigation for social hub - persist with localStorage and URL
  // Use lazy initialization to read from localStorage immediately on client
  const [activeTab, setActiveTab] = useState<'feed' | 'reels' | 'lives' | 'comunidades'>(() => {
    // This runs only on client side
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('foro_active_tab') as 'feed' | 'reels' | 'lives' | 'comunidades' | null;
      if (savedTab && ['feed', 'reels', 'lives', 'comunidades'].includes(savedTab)) {
        return savedTab;
      }
    }
    return 'feed';
  });

  // Sync with URL params on mount (URL takes priority if present)
  useEffect(() => {
    const urlTab = searchParams.get('tab') as 'feed' | 'reels' | 'lives' | 'comunidades' | null;
    if (urlTab && ['feed', 'reels', 'lives', 'comunidades'].includes(urlTab)) {
      setActiveTab(urlTab);
      localStorage.setItem('foro_active_tab', urlTab);
    }
  }, [searchParams]);

  // Handle direct link to a specific post
  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId && posts.length > 0) {
      // Make sure we're on the feed tab
      setActiveTab('feed');
      // Wait for render then scroll to the post
      setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the post briefly
          postElement.classList.add('ring-2', 'ring-purple-500');
          setTimeout(() => {
            postElement.classList.remove('ring-2', 'ring-purple-500');
          }, 3000);
        }
      }, 100);
    }
  }, [searchParams, posts]);

  // Function to change tab and update URL + localStorage
  const changeTab = useCallback((tab: 'feed' | 'reels' | 'lives' | 'comunidades') => {
    setActiveTab(tab);
    localStorage.setItem('foro_active_tab', tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/foro?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Reels state
  interface Reel {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    duration: number;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    tags: string[];
    createdAt: string;
  }
  const [reels, setReels] = useState<Reel[]>([]);
  const [reelsFilter, setReelsFilter] = useState<'foryou' | 'following' | 'trending'>('foryou');
  const [reelsLoading, setReelsLoading] = useState(false);

  // Communities state
  interface Community {
    id: string;
    name: string;
    slug: string;
    description: string;
    iconUrl?: string;
    bannerUrl?: string;
    themeColor: string;
    isPublic: boolean;
    isVerified: boolean;
    membersCount: number;
    postsCount: number;
    categories: string[];
    isMember?: boolean;
    hasPendingRequest?: boolean;
    requiresApproval?: boolean;
  }
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesFilter, setCommunitiesFilter] = useState<'all' | 'joined' | 'popular'>('all');
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [communitySearch, setCommunitySearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openCommunityMenu, setOpenCommunityMenu] = useState<string | null>(null);
  const communityMenuRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(communitySearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [communitySearch]);

  // Close community menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (communityMenuRef.current && !communityMenuRef.current.contains(event.target as Node)) {
        setOpenCommunityMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lives/Streams state
  const [streams, setStreams] = useState<{
    id: string;
    userId: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    title?: string;
    viewersCount: number;
    category?: string;
    startedAt?: string;
  }[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [liveStats, setLiveStats] = useState({
    liveNow: 0,
    totalViewers: 0,
    mostWatchedToday: 0,
    streamsToday: 0,
  });

  // Función para ordenar posts respetando el orden de los hilos
  const sortPostsRespectingThreads = useCallback((posts: ForumPost[]): ForumPost[] => {
    // Agrupar posts por thread_id
    const threadGroups = new Map<string, ForumPost[]>();
    const postsWithoutThread: ForumPost[] = [];
    const processedThreads = new Set<string>();

    // Separar posts con y sin hilo
    posts.forEach((post) => {
      if (post.thread_id) {
        const group = threadGroups.get(post.thread_id) || [];
        group.push(post);
        threadGroups.set(post.thread_id, group);
      } else {
        postsWithoutThread.push(post);
      }
    });

    // Ordenar cada grupo de hilo por thread_position
    threadGroups.forEach((group, threadId) => {
      group.sort((a, b) => (a.thread_position || 0) - (b.thread_position || 0));
    });

    // Reconstruir la lista respetando el orden original pero agrupando los hilos
    const result: ForumPost[] = [];

    posts.forEach((post) => {
      if (post.thread_id) {
        // Si es un post de hilo y no hemos procesado este hilo aún
        if (!processedThreads.has(post.thread_id)) {
          // Agregar todos los posts del hilo en orden
          const threadPosts = threadGroups.get(post.thread_id) || [];
          result.push(...threadPosts);
          processedThreads.add(post.thread_id);
        }
        // Si ya procesamos el hilo, no hacer nada (ya se agregaron todos)
      } else {
        // Post sin hilo, agregar directamente
        result.push(post);
      }
    });

    return result;
  }, []);

  // Cargar posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let data: ForumPost[];

      if (filter === 'hot' || filter === 'rising') {
        data = await forumService.getPostsBySorting(filter, {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 50,
          userId: user?.id,
        });
      } else {
        data = await forumService.getPostsWithUserState(user?.id || null, {
          sortBy: filter as 'recent' | 'popular' | 'comments' | 'following',
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          tag: selectedTag || undefined,
          limit: 50,
        });
      }
      // Ordenar posts respetando el orden de los hilos
      const sortedData = sortPostsRespectingThreads(data);
      setPosts(sortedData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedCategory, selectedTag, user?.id, sortPostsRespectingThreads]);

  // Cargar reels
  const loadReels = useCallback(async () => {
    setReelsLoading(true);
    try {
      const response = await fetch(`/api/reels?filter=${reelsFilter}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setReels(data.reels || []);
    } catch (error) {
      console.error('Error loading reels:', error);
      toast.error(t('forum.reels.loadError'));
    } finally {
      setReelsLoading(false);
    }
  }, [reelsFilter]);

  // Reels handlers
  const handleReelLike = async (reelId: string) => {
    if (!user) {
      toast.error(t('forum.errors.loginRequired'));
      return;
    }
    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    try {
      const method = reel.isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/reels/${reelId}/like`, { method });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setReels(reels.map((r) =>
        r.id === reelId
          ? { ...r, isLiked: !r.isLiked, likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1 }
          : r
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(t('forum.reels.likeError'));
    }
  };

  const handleReelBookmark = (reelId: string) => {
    if (!user) {
      toast.error(t('forum.errors.loginRequired'));
      return;
    }
    setReels(reels.map((reel) =>
      reel.id === reelId ? { ...reel, isBookmarked: !reel.isBookmarked } : reel
    ));
    const reel = reels.find((r) => r.id === reelId);
    toast.success(reel?.isBookmarked ? t('forum.reels.removed') : t('forum.reels.saved'));
  };

  const handleReelShare = async (reelId: string) => {
    const url = `${window.location.origin}/reels/${reelId}`;
    if (navigator.share) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(t('forum.actions.linkCopied'));
    }
  };

  const handleReelComment = (reelId: string) => {
    toast(t('forum.reels.comingSoon'), { icon: '💬' });
  };

  const handleCreateReel = async (data: { videoFile: File; caption: string; tags: string[] }) => {
    try {
      const formData = new FormData();
      formData.append('video', data.videoFile);
      formData.append('caption', data.caption);
      formData.append('tags', JSON.stringify(data.tags));

      const response = await fetch('/api/reels', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast.success(t('forum.reels.published'));
      loadReels();
    } catch (error) {
      console.error('Error creating reel:', error);
      toast.error(t('forum.reels.publishError'));
    }
  };

  // Cargar streams/lives
  const loadStreams = useCallback(async () => {
    setStreamsLoading(true);
    try {
      const response = await fetch('/api/streaming?filter=live');
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const liveStreams = data.streams || [];
      setStreams(liveStreams);

      // Calculate stats
      const totalViewers = liveStreams.reduce((sum: number, s: { viewersCount?: number }) => sum + (s.viewersCount || 0), 0);
      const mostWatched = liveStreams.length > 0 ? Math.max(...liveStreams.map((s: { viewersCount?: number }) => s.viewersCount || 0)) : 0;

      setLiveStats({
        liveNow: liveStreams.length,
        totalViewers,
        mostWatchedToday: mostWatched,
        streamsToday: liveStreams.length, // Could be expanded to include ended streams
      });
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setStreamsLoading(false);
    }
  }, []);

  // Cargar comunidades
  const loadCommunities = useCallback(async () => {
    setCommunitiesLoading(true);
    try {
      const params = new URLSearchParams();
      if (communitiesFilter === 'popular') params.set('sort', 'popular');
      if (communitiesFilter === 'joined') params.set('filter', 'joined');
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

      const response = await fetch(`/api/communities?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCommunities(data.communities || []);
    } catch (error) {
      console.error('Error loading communities:', error);
      toast.error(t('forum.communities.loadError'));
    } finally {
      setCommunitiesLoading(false);
    }
  }, [communitiesFilter, debouncedSearch, t]);

  // Communities handlers
  const handleJoinCommunity = async (communityId: string) => {
    if (!isLoggedIn) {
      toast.error(t('forum.errors.loginRequired'));
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error: ${response.status}`);
      }
      if (data.error) throw new Error(data.error);

      // Check if it's a join request (private community) or direct join
      if (data.requestPending) {
        setCommunities(communities.map(c =>
          c.id === communityId
            ? { ...c, hasPendingRequest: true }
            : c
        ));
        toast.success('Solicitud de admisión enviada');
      } else {
        setCommunities(communities.map(c =>
          c.id === communityId
            ? { ...c, isMember: true, membersCount: c.membersCount + 1 }
            : c
        ));
        toast.success(t('forum.communities.joined'));
      }
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast.error(error.message || t('forum.communities.joinError'));
    }
  };

  const handleLeaveCommunity = async (communityId: string, confirmTransfer: boolean = false) => {
    try {
      const url = confirmTransfer
        ? `/api/communities/${communityId}/join?confirmTransfer=true`
        : `/api/communities/${communityId}/join`;

      const response = await fetch(url, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error: ${response.status}`);
      }
      if (data.error) throw new Error(data.error);

      // If requires confirmation (owner leaving), show confirmation dialog
      if (data.requiresConfirmation) {
        const nextOwnerName = data.nextOwner?.displayName || data.nextOwner?.username || 'otro miembro';
        const confirmed = confirm(
          `⚠️ Advertencia: Eres el propietario de esta comunidad.\n\n` +
          `Si abandonas, "${nextOwnerName}" se convertirá en el nuevo propietario.\n\n` +
          `¿Estás seguro de que quieres abandonar y transferir la propiedad?`
        );

        if (confirmed) {
          handleLeaveCommunity(communityId, true);
        }
        return;
      }

      setCommunities(communities.map(c =>
        c.id === communityId
          ? { ...c, isMember: false, membersCount: Math.max(0, c.membersCount - 1) }
          : c
      ));

      if (data.ownershipTransferred) {
        toast.success(`Has abandonado la comunidad. ${data.newOwner} es el nuevo propietario.`);
      } else {
        toast.success(t('forum.communities.left'));
      }
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast.error(error.message || t('forum.communities.leaveError'));
    }
  };

  const handleCreateCommunity = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
    requiresApproval: boolean;
    categories: string[];
    themeColor: string;
  }): Promise<boolean> => {
    if (!isLoggedIn) {
      toast.error(t('forum.communities.loginToCreate'));
      return false;
    }

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok || result.error) {
        console.error('Community creation error:', result);
        toast.error(result.error || t('forum.communities.createError'));
        return false;
      }

      toast.success(t('forum.communities.created', { name: data.name }));
      loadCommunities();
      return true;
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error(t('forum.communities.createError'));
      return false;
    }
  };

  // Communities are now filtered server-side, so just use them directly
  const filteredCommunities = communities;

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    const data = await forumService.getCategories();
    setCategories(data);
  }, []);

  // Cargar trending tags
  const loadTrendingTags = useCallback(async () => {
    const data = await forumService.getTrendingTags(6);
    setTrendingTags(data);
  }, []);

  // Cargar stories
  const loadStories = useCallback(async () => {
    if (!user?.id) return;
    const data = await forumService.getFollowingStories(user.id);
    setStories(data);
  }, [user?.id]);

  // Cargar award types
  const loadAwardTypes = useCallback(async () => {
    const data = await forumService.getAwardTypes();
    setAwardTypes(data);
  }, []);

  useEffect(() => {
    loadPosts();
    loadCategories();
    loadTrendingTags();
    loadStories();
    loadAwardTypes();
  }, [loadPosts, loadCategories, loadTrendingTags, loadStories, loadAwardTypes]);

  // Load reels when tab changes to reels or filter changes
  useEffect(() => {
    if (activeTab === 'reels') {
      loadReels();
    }
  }, [activeTab, loadReels]);

  // Load communities when tab changes to comunidades or filter changes
  useEffect(() => {
    if (activeTab === 'comunidades') {
      loadCommunities();
    }
  }, [activeTab, loadCommunities]);

  // Load streams when lives tab is active
  useEffect(() => {
    if (activeTab === 'lives') {
      loadStreams();
    }
  }, [activeTab, loadStreams]);

  // Search mentions
  const searchMentions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setMentionSuggestions([]);
      return;
    }
    const suggestions = await forumService.searchUsersForMention(query);
    setMentionSuggestions(suggestions);
  }, []);

  // Handle content change with mention detection
  const handleContentChange = (value: string, cursorPos: number) => {
    setNewPostContent(value);
    setCursorPosition(cursorPos);

    // Detect @ mentions
    const beforeCursor = value.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      searchMentions(mentionMatch[1]);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  // Insert mention
  const insertMention = (username: string) => {
    const beforeMention = newPostContent.substring(0, cursorPosition - mentionQuery.length - 1);
    const afterMention = newPostContent.substring(cursorPosition);
    setNewPostContent(`${beforeMention}@${username} ${afterMention}`);
    setShowMentions(false);
    setMentionQuery('');
  };

  // Trigger mention mode (when @ button is clicked)
  const triggerMention = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const curPos = textarea.selectionStart || newPostContent.length;
      const before = newPostContent.substring(0, curPos);
      const after = newPostContent.substring(curPos);
      setNewPostContent(`${before}@${after}`);
      setCursorPosition(curPos + 1);
      setShowMentions(true);
      setMentionQuery('');
      searchMentions('');
      // Focus and set cursor after @
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(curPos + 1, curPos + 1);
      }, 0);
    }
  };

  // Crear post
  const handleCreatePost = async () => {
    if (!isLoggedIn || !currentUserId) {
      router.push('/login');
      return;
    }

    if (createMode === 'poll') {
      if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
        toast.error(t('forum.poll.needQuestionAndOptions'));
        return;
      }

      setCreating(true);
      try {
        const post = await forumService.createPostWithPoll(currentUserId, {
          content: newPostContent || pollQuestion,
          tags: newPostTags,
          category_id: selectedCategory !== 'all' ? selectedCategory : categories.find(c => c.slug === 'general')?.id,
          poll: {
            question: pollQuestion,
            options: pollOptions.filter(o => o.trim()),
            ends_in_hours: pollDuration,
          },
        });

        if (post) {
          toast.success(t('forum.poll.created'));
          resetCreateModal();
          loadPosts();
        }
      } catch (error) {
        toast.error(t('forum.poll.createError'));
      } finally {
        setCreating(false);
      }
      return;
    }

    if (createMode === 'thread') {
      const validPosts = threadPosts.filter(p => p.trim());
      if (validPosts.length < 2) {
        toast.error(t('forum.thread.needAtLeast2'));
        return;
      }

      setCreating(true);
      try {
        const result = await forumService.createThread(
          currentUserId,
          newPostContent || t('forum.createModal.thread'),
          validPosts.map(content => ({ content, tags: newPostTags }))
        );

        if (result.success) {
          toast.success(t('forum.thread.created'));
          resetCreateModal();
          loadPosts();
        } else {
          console.error('Thread creation failed:', result.error);
          toast.error(result.error || t('forum.thread.createError'));
        }
      } catch (error) {
        console.error('Thread creation exception:', error);
        toast.error(t('forum.thread.createError'));
      } finally {
        setCreating(false);
      }
      return;
    }

    // Regular post
    if (!newPostContent.trim() && !selectedGif && selectedImages.length === 0) {
      toast.error(t('forum.actions.writeToPublish'));
      return;
    }

    setCreating(true);
    try {
      // Upload images if any
      let imageUrl: string | null = null;
      if (selectedImages.length > 0) {
        toast.loading('Subiendo imagen...', { id: 'upload-image' });
        imageUrl = await uploadPostImage(selectedImages[0]);
        toast.dismiss('upload-image');

        if (!imageUrl) {
          if (!newPostContent.trim() && !selectedGif) {
            toast.error('Error al subir la imagen');
            setCreating(false);
            return;
          } else {
            toast.error('No se pudo subir la imagen, publicando solo el texto');
          }
        }
      }

      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          tags: newPostTags,
          category_id: selectedCategory !== 'all' ? selectedCategory : categories.find(c => c.slug === 'general')?.id,
          gif_url: selectedGif?.url,
          gif_width: selectedGif?.width,
          gif_height: selectedGif?.height,
          image_url: imageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t('forum.actions.postCreated'));
        resetCreateModal();
        loadPosts();
      } else {
        toast.error(data.error || t('forum.actions.postCreateError'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(t('forum.actions.postCreateError'));
    } finally {
      setCreating(false);
    }
  };

  const resetCreateModal = () => {
    setNewPostContent('');
    setNewPostTags([]);
    setIsCreateModalOpen(false);
    setSelectedImages([]);
    setSelectedGif(null);
    setCreateMode('post');
    setPollQuestion('');
    setPollOptions(['', '']);
    setThreadPosts(['']);
  };

  // Cargar comentarios
  const loadComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const data = await forumService.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Abrir modal de comentarios
  const openComments = async (postId: string) => {
    setSelectedPostId(postId);
    loadComments(postId);

    // Incrementar contador de vistas
    await forumService.incrementViewCount(postId);
    // Actualizar el contador local
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, views_count: (p.views_count || 0) + 1 }
          : p
      )
    );
  };

  // Crear comentario
  const handleCreateComment = async () => {
    if (!user?.id || !selectedPostId) return;

    if (!newComment.trim()) {
      toast.error(t('forum.comments.writeComment'));
      return;
    }

    setSubmittingComment(true);
    try {
      const comment = await forumService.createComment(user.id, {
        post_id: selectedPostId,
        content: newComment,
      });

      if (comment) {
        setComments(prev => [...prev, comment]);
        setNewComment('');
        setPosts(prev => prev.map(p =>
          p.id === selectedPostId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        ));
        toast.success(t('forum.comments.added'));
      }
    } catch (error) {
      toast.error(t('forum.comments.addError'));
    } finally {
      setSubmittingComment(false);
    }
  };

  // Eliminar post
  // Abrir modal de confirmación para eliminar post
  const openDeletePostConfirm = (postId: string) => {
    setDeletingPostId(postId);
    setDeletePostConfirmOpen(true);
  };

  // Eliminar post (llamado desde el modal de confirmación)
  const handleDeletePost = async () => {
    if (!user?.id || !deletingPostId) return;

    setIsDeletingPost(true);
    try {
      console.log('Deleting post:', deletingPostId, 'User:', user.id);
      const success = await forumService.deletePost(deletingPostId, user.id);
      console.log('Delete result:', success);
      if (success) {
        setPosts(prev => prev.filter(p => p.id !== deletingPostId));
        toast.success('Publicación eliminada');
      } else {
        toast.error('Error al eliminar publicación');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar publicación');
    } finally {
      setIsDeletingPost(false);
      setDeletePostConfirmOpen(false);
      setDeletingPostId(null);
    }
  };

  // Abrir modal de confirmación para eliminar comentario
  const openDeleteConfirm = (commentId: string) => {
    setDeletingCommentId(commentId);
    setDeleteConfirmOpen(true);
  };

  // Eliminar comentario (llamado desde el modal de confirmación)
  const handleDeleteComment = async () => {
    if (!user?.id || !deletingCommentId) return;

    setIsDeleting(true);
    try {
      const success = await forumService.deleteComment(deletingCommentId, user.id);
      if (success) {
        setComments(prev => prev.filter(c => c.id !== deletingCommentId));
        // Decrementar contador de comentarios del post
        if (selectedPostId) {
          setPosts(prev => prev.map(p =>
            p.id === selectedPostId
              ? { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) }
              : p
          ));
        }
        toast.success(t('forum.comments.deleted') || 'Comentario eliminado');
      } else {
        toast.error(t('forum.comments.deleteError') || 'Error al eliminar comentario');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(t('forum.comments.deleteError') || 'Error al eliminar comentario');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setDeletingCommentId(null);
    }
  };

  // Toggle reaction
  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    try {
      const result = await forumService.toggleReaction(postId, user.id, reactionType);
      setPosts(prev =>
        prev.map(p => {
          if (p.id !== postId) return p;
          const currentReactions = p.user_reactions || [];
          const newReactions = result.added
            ? [...currentReactions, reactionType]
            : currentReactions.filter(r => r !== reactionType);
          return {
            ...p,
            reactions_count: result.counts,
            user_reactions: newReactions,
          };
        })
      );
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // Toggle bookmark
  const handleBookmark = async (postId: string) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    try {
      const result = await forumService.toggleBookmark(postId, user.id);
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, user_bookmarked: result.bookmarked, bookmarks_count: result.count }
            : p
        )
      );
      toast.success(result.bookmarked ? t('forum.actions.savedToBookmarks') : t('forum.actions.removedFromBookmarks'));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Open repost modal
  const openRepostModal = (post: ForumPost) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }
    setRepostingPost(post);
    setQuoteContent('');
    setRepostModalOpen(true);
  };

  // Handle repost
  const handleRepost = async (withQuote: boolean = false) => {
    if (!user?.id || !repostingPost) return;

    setIsReposting(true);
    try {
      const result = await forumService.createRepost(
        repostingPost.id,
        user.id,
        withQuote ? quoteContent : undefined
      );

      if (result.success) {
        toast.success(t('forum.actions.shared'));
        setPosts(prev =>
          prev.map(p =>
            p.id === repostingPost.id
              ? { ...p, user_reposted: true, reposts_count: (p.reposts_count || 0) + 1 }
              : p
          )
        );
        setRepostModalOpen(false);
        setRepostingPost(null);
        setQuoteContent('');
      } else {
        toast.error(result.error || t('forum.actions.shareError'));
      }
    } catch (error) {
      toast.error(t('forum.actions.shareError'));
    } finally {
      setIsReposting(false);
    }
  };

  // Handle share
  const handleShare = async (post: ForumPost, type: 'clipboard' | 'twitter' | 'whatsapp' | 'facebook' | 'tiktok' | 'telegram' | 'reddit' | 'linkedin' | 'instagram') => {
    const url = `${window.location.origin}/foro?post=${post.id}`;
    const text = post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '');

    if (type === 'clipboard') {
      await navigator.clipboard.writeText(url);
      toast.success(t('forum.actions.linkCopied'));
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    } else if (type === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (type === 'reddit') {
      window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank');
    } else if (type === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'tiktok' || type === 'instagram') {
      // Estas redes no tienen API de compartir web directa, copiamos el link
      await navigator.clipboard.writeText(url);
      toast.success(`Link copiado - Pégalo en ${type === 'tiktok' ? 'TikTok' : 'Instagram'}`);
    }

    forumService.trackShare(post.id, user?.id || null, type);
  };

  // Open award modal
  const openAwardModal = (post: ForumPost) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }
    setAwardingPost(post);
    setSelectedAward(null);
    setAwardMessage('');
    setAwardModalOpen(true);
  };

  // Give award
  const handleGiveAward = async () => {
    if (!user?.id || !awardingPost || !selectedAward) return;

    setGivingAward(true);
    try {
      const result = await forumService.giveAward(
        awardingPost.id,
        selectedAward.id,
        user.id,
        awardMessage || undefined
      );

      if (result.success) {
        toast.success(t('forum.actions.awardGiven', { name: result.award_name || 'Award' }));
        setAwardModalOpen(false);
        setAwardingPost(null);
        setSelectedAward(null);
        setAwardMessage('');
      } else {
        toast.error(result.error || t('forum.actions.awardError'));
      }
    } catch (error) {
      toast.error(t('forum.actions.awardError'));
    } finally {
      setGivingAward(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast.error(t('forum.actions.maxImages'));
      return;
    }
    setSelectedImages(prev => [...prev, ...files].slice(0, 4));
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Upload image via API (server-side to bypass RLS)
  const uploadPostImage = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      toast.error('Debes iniciar sesión para subir imágenes');
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB');
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/forum/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al subir la imagen');
        return null;
      }

      return data.url;
    } catch (error) {
      toast.error('Error al subir la imagen');
      return null;
    }
  };

  // Toggle tag en nuevo post
  const toggleTag = (tagId: string) => {
    setNewPostTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Add thread post
  const addThreadPost = () => {
    if (threadPosts.length < 10) {
      setThreadPosts([...threadPosts, '']);
    }
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Stories Section - Instagram Style */}
        {isLoggedIn && (
          <StoriesBar
            key={storiesKey}
            currentUserId={currentUserId}
            onCreateStory={() => setCreateStoryModalOpen(true)}
            onViewStories={(userStories) => {
              setViewingUserStories(userStories);
              setStoryViewerOpen(true);
            }}
          />
        )}

        {/* Social Hub Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => changeTab('feed')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Feed
          </button>
          <button
            type="button"
            onClick={() => changeTab('reels')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'reels'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'
            }`}
          >
            <Video className="w-4 h-4" />
            Reels
          </button>
          <button
            type="button"
            onClick={() => changeTab('lives')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === 'lives'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'
            }`}
          >
            <Radio className="w-4 h-4" />
            Lives
            {/* Live indicator dot */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => changeTab('comunidades')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'comunidades'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'
            }`}
          >
            <Users className="w-4 h-4" />
            {t('forum.tabs.communities')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Activity Feed Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <ActivityFeed />
            </div>

            {/* Community Posts Section */}
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                  {t('forum.title')}
                </h1>
                <p className="text-gray-400 mt-1">
                  {t('forum.subtitle')}
                </p>
              </div>

              <Button
                onClick={() => {
                  if (!isLoggedIn) {
                    router.push('/login');
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                {t('forum.newPost')}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
              <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setFilter('recent')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'recent'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {t('forum.filters.recent')}
                </button>
                <button
                  onClick={() => setFilter('hot')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'hot'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  {t('forum.filters.hot')}
                </button>
                <button
                  onClick={() => setFilter('rising')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'rising'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {t('forum.filters.rising')}
                </button>
                <button
                  onClick={() => setFilter('popular')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'popular'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {t('forum.filters.top')}
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => setFilter('following')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      filter === 'following'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {t('forum.filters.following')}
                  </button>
                )}
              </div>

              {selectedTag && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/20 text-purple-400 border-purple-500/30 cursor-pointer"
                  onClick={() => setSelectedTag(null)}
                >
                  {FORUM_TAGS.find(t => t.id === selectedTag)?.label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>

            {/* Posts Feed */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <MessageCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('forum.posts.noPosts')}</h3>
                <p className="text-gray-400 mb-6">
                  {selectedTag
                    ? t('forum.posts.noPostsWithTag')
                    : t('forum.posts.beFirstToShare')}
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {t('forum.posts.createFirst')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onOpenComments={openComments}
                    onDelete={openDeletePostConfirm}
                    onReaction={handleReaction}
                    onBookmark={handleBookmark}
                    onRepost={openRepostModal}
                    onShare={handleShare}
                    onAward={openAwardModal}
                    REACTIONS={REACTIONS}
                    FORUM_TAGS={FORUM_TAGS}
                    dateLocale={dateLocale}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">{t('forum.sidebar.categories')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {t('forum.sidebar.allCategories')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Tags */}
            {trendingTags.length > 0 && (
              <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  {t('forum.sidebar.trending')}
                </h3>
                <div className="space-y-3">
                  {trendingTags.map((trend, index) => {
                    const tagInfo = FORUM_TAGS.find(t => t.id === trend.tag);
                    return (
                      <button
                        key={trend.tag}
                        onClick={() => setSelectedTag(trend.tag)}
                        className="w-full text-left hover:bg-white/5 rounded-lg p-2 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-sm w-4">{index + 1}</span>
                          <div className="flex-1">
                            <span className="font-medium text-white group-hover:text-orange-400 transition-colors">
                              {tagInfo?.label || `#${trend.tag}`}
                            </span>
                            <p className="text-xs text-gray-500">
                              {t('forum.sidebar.postsThisWeek', { count: trend.post_count })}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-400" />
                {t('forum.sidebar.tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {FORUM_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      selectedTag === tag.id
                        ? tag.color
                        : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">
                📜 {t('forum.sidebar.rules')}
              </h3>
              <ul className="space-y-2 text-sm text-yellow-200/80">
                <li>• {t('forum.sidebar.rule1')}</li>
                <li>• {t('forum.sidebar.rule2')}</li>
                <li>• {t('forum.sidebar.rule3')}</li>
                <li>• {t('forum.sidebar.rule4')}</li>
                <li>• {t('forum.sidebar.rule5')}</li>
              </ul>
            </div>
          </div>
        </div>
        )}

        {/* Reels Tab */}
        {activeTab === 'reels' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Video className="w-7 h-7 text-pink-400" />
                  {t('forum.reels.title')}
                </h2>
                <p className="text-gray-400 mt-1">{t('forum.reels.subtitle')}</p>
              </div>
              {isLoggedIn && (
                <CreateReelModal onCreateReel={handleCreateReel} />
              )}
            </div>

            {/* Reels Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button
                variant={reelsFilter === 'foryou' ? 'default' : 'outline'}
                onClick={() => setReelsFilter('foryou')}
                className={reelsFilter === 'foryou' ? 'bg-pink-600' : 'border-gray-700'}
                size="sm"
              >
                {t('forum.reels.forYou')}
              </Button>
              <Button
                variant={reelsFilter === 'following' ? 'default' : 'outline'}
                onClick={() => setReelsFilter('following')}
                className={reelsFilter === 'following' ? 'bg-pink-600' : 'border-gray-700'}
                size="sm"
              >
                <Users className="w-4 h-4 mr-1" />
                {t('forum.reels.following')}
              </Button>
              <Button
                variant={reelsFilter === 'trending' ? 'default' : 'outline'}
                onClick={() => setReelsFilter('trending')}
                className={reelsFilter === 'trending' ? 'bg-pink-600' : 'border-gray-700'}
                size="sm"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {t('forum.reels.trending')}
              </Button>
            </div>

            {/* Reels Content */}
            {reelsLoading ? (
              <div className="max-w-[400px] mx-auto">
                <div className="bg-gray-800/50 rounded-xl aspect-[9/16] max-h-[600px] animate-pulse flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                </div>
              </div>
            ) : reels.length > 0 ? (
              <ReelsFeed
                reels={reels}
                onLike={handleReelLike}
                onBookmark={handleReelBookmark}
                onShare={handleReelShare}
                onComment={handleReelComment}
                onLoadMore={() => {}}
              />
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                <Video className="w-16 h-16 text-pink-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('forum.reels.noReels')}</h3>
                <p className="text-gray-400 mb-4">
                  {t('forum.reels.beFirst')}
                </p>
                {isLoggedIn && (
                  <CreateReelModal onCreateReel={handleCreateReel} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Lives Tab */}
        {activeTab === 'lives' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Radio className="w-7 h-7 text-red-400" />
                  {t('forum.lives.title')}
                </h2>
                <p className="text-gray-400 mt-1">{t('forum.lives.subtitle')}</p>
              </div>
              {isLoggedIn && (
                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => router.push('/streaming')}
                >
                  <Radio className="w-4 h-4 mr-2" />
                  {t('forum.lives.startStream')}
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">{t('forum.lives.liveNow')}</span>
                </div>
                <p className="text-2xl font-bold">{liveStats.liveNow}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{t('forum.lives.viewers')}</span>
                </div>
                <p className="text-2xl font-bold">{liveStats.totalViewers}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">{t('forum.lives.mostWatchedToday')}</span>
                </div>
                <p className="text-2xl font-bold">{liveStats.mostWatchedToday}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{t('forum.lives.streamsToday')}</span>
                </div>
                <p className="text-2xl font-bold">{liveStats.streamsToday}</p>
              </div>
            </div>

            {/* Streams Grid or Empty State */}
            {streamsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : streams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams.map((stream) => (
                  <div
                    key={stream.id}
                    onClick={() => router.push(`/streaming/live/${stream.id}`)}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-red-500/50 transition-all group"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="aspect-video bg-gray-900 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Radio className="w-12 h-12 text-red-400/50 group-hover:text-red-400 transition-colors" />
                      </div>
                      {/* Live badge */}
                      <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                      {/* Viewers count */}
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {stream.viewersCount || 0}
                      </div>
                    </div>
                    {/* Stream info */}
                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(stream.displayName || stream.username || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{stream.title || 'Stream en vivo'}</h3>
                          <p className="text-sm text-gray-400 truncate">{stream.displayName || stream.username}</p>
                          {stream.category && (
                            <span className="text-xs text-red-400">{stream.category}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                <Radio className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('forum.lives.noStreams')}</h3>
                <p className="text-gray-400 mb-4">
                  {t('forum.lives.beFirst')}
                </p>
                {isLoggedIn && (
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => router.push('/streaming')}
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    {t('forum.lives.startMyFirst')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Comunidades Tab */}
        {activeTab === 'comunidades' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Users className="w-7 h-7 text-blue-400" />
                  {t('forum.communities.title')}
                </h2>
                <p className="text-gray-400 mt-1">{t('forum.communities.subtitle')}</p>
              </div>
              {isLoggedIn && (
                <CreateCommunityModal
                  onCreateCommunity={(data) => handleCreateCommunity({
                    name: data.name,
                    description: data.description,
                    isPublic: data.isPublic,
                    requiresApproval: data.requiresApproval,
                    categories: data.categories,
                    themeColor: data.themeColor,
                  })}
                />
              )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  placeholder={t('forum.communities.searchPlaceholder')}
                  className="pl-10 bg-gray-800 border-gray-700"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={communitiesFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setCommunitiesFilter('all')}
                  className={communitiesFilter === 'all' ? 'bg-blue-600' : 'border-gray-700'}
                  size="sm"
                >
                  {t('forum.communities.all')}
                </Button>
                <Button
                  type="button"
                  variant={communitiesFilter === 'joined' ? 'default' : 'outline'}
                  onClick={() => setCommunitiesFilter('joined')}
                  className={communitiesFilter === 'joined' ? 'bg-blue-600' : 'border-gray-700'}
                  size="sm"
                >
                  {t('forum.communities.myCommunities')}
                </Button>
                <Button
                  type="button"
                  variant={communitiesFilter === 'popular' ? 'default' : 'outline'}
                  onClick={() => setCommunitiesFilter('popular')}
                  className={communitiesFilter === 'popular' ? 'bg-blue-600' : 'border-gray-700'}
                  size="sm"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {t('forum.communities.popular')}
                </Button>
              </div>
            </div>

            {/* Communities Grid */}
            {communitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community, i) => (
                  <div
                    key={community.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors relative"
                  >
                    {/* Private Badge & Menu */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                      {!community.isPublic && (
                        <span className="bg-gray-900/80 backdrop-blur-sm text-gray-300 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Privada
                        </span>
                      )}
                      <div className="relative" ref={openCommunityMenu === community.id ? communityMenuRef : null}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenCommunityMenu(openCommunityMenu === community.id ? null : community.id);
                          }}
                          className="w-7 h-7 rounded-full bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openCommunityMenu === community.id && (
                          <div className="absolute right-0 top-9 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = `${window.location.origin}/foro/comunidad/${community.slug}`;
                                navigator.clipboard.writeText(url);
                                toast.success('Enlace copiado');
                                setOpenCommunityMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            >
                              <Link2 className="w-4 h-4" />
                              Copiar enlace
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(`/foro/comunidad/${community.slug}`, '_blank');
                                setOpenCommunityMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Abrir en nueva pestaña
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = `${window.location.origin}/foro/comunidad/${community.slug}`;
                                if (navigator.share) {
                                  navigator.share({
                                    title: community.name,
                                    text: community.description || `Únete a ${community.name}`,
                                    url: url,
                                  });
                                } else {
                                  navigator.clipboard.writeText(url);
                                  toast.success('Enlace copiado');
                                }
                                setOpenCommunityMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            >
                              <Share2 className="w-4 h-4" />
                              Compartir
                            </button>
                            {community.isMember && (
                              <>
                                <div className="border-t border-gray-700 my-1" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleLeaveCommunity(community.id);
                                    setOpenCommunityMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Salir de la comunidad
                                </button>
                              </>
                            )}
                            {isLoggedIn && !community.isMember && (
                              <>
                                <div className="border-t border-gray-700 my-1" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toast.success('Gracias por tu reporte. Lo revisaremos pronto.');
                                    setOpenCommunityMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-orange-400 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <Flag className="w-4 h-4" />
                                  Reportar comunidad
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/foro/comunidad/${community.slug}`}>
                      <div
                        className="h-20 cursor-pointer"
                        style={{
                          background: community.bannerUrl
                            ? `url(${community.bannerUrl}) center/cover`
                            : `linear-gradient(135deg, ${community.themeColor || '#6366f1'}, ${community.themeColor || '#6366f1'}88)`
                        }}
                      />
                    </Link>
                    <div className="p-4">
                      <Link href={`/foro/comunidad/${community.slug}`}>
                        <div className="flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg lowercase"
                            style={{
                              background: community.iconUrl
                                ? `url(${community.iconUrl}) center/cover`
                                : `linear-gradient(135deg, ${community.themeColor || '#6366f1'}, ${community.themeColor || '#6366f1'}cc)`
                            }}
                          >
                            {!community.iconUrl && community.name[0].toLowerCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold flex items-center gap-1 truncate">
                              {community.name}
                              {community.isVerified && (
                                <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              )}
                            </h3>
                          </div>
                        </div>
                      </Link>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {community.description || t('forum.communities.defaultDescription')}
                      </p>

                      {/* Category Tags */}
                      {community.categories && community.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {community.categories.slice(0, 3).map((cat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {community.membersCount} miembros
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {community.postsCount || 0} posts
                        </span>
                      </div>

                      {/* Action Buttons */}
                      {community.hasPendingRequest ? (
                        // Pending request state
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled
                          className="w-full border-orange-500/50 text-orange-400 bg-orange-500/10"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Solicitud pendiente
                        </Button>
                      ) : community.isMember ? (
                        // Member state - View + Leave
                        <div className="flex gap-2">
                          <Link href={`/foro/comunidad/${community.slug}`} className="flex-1">
                            <Button
                              type="button"
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {t('forum.communities.viewCommunity')} →
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-500/50"
                            onClick={(e) => {
                              e.preventDefault();
                              handleLeaveCommunity(community.id);
                            }}
                          >
                            {t('forum.communities.leave')}
                          </Button>
                        </div>
                      ) : !community.isPublic ? (
                        // Private community - Request to join
                        <Button
                          type="button"
                          size="sm"
                          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJoinCommunity(community.id);
                          }}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Solicitar unirse
                        </Button>
                      ) : (
                        // Public community - Join directly
                        <Button
                          type="button"
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJoinCommunity(community.id);
                          }}
                        >
                          {t('forum.communities.join')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                <Users className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('forum.communities.noCommunitiesFound')}</h3>
                <p className="text-gray-400 mb-4">
                  {communitySearch
                    ? t('forum.communities.tryOtherTerms')
                    : t('forum.communities.beFirstToCreate')}
                </p>
                {communitySearch && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setCommunitySearch('')}
                    className="text-blue-400"
                  >
                    {t('forum.communities.clearSearch')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{t('forum.createModal.title')}</h2>

          {/* Post Type Selector */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCreateMode('post')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                createMode === 'post'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              {t('forum.createModal.post')}
            </button>
            <button
              type="button"
              onClick={() => setCreateMode('poll')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                createMode === 'poll'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {t('forum.createModal.poll')}
            </button>
            <button
              type="button"
              onClick={() => setCreateMode('thread')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                createMode === 'thread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <ListPlus className="w-4 h-4" />
              {t('forum.createModal.thread')}
            </button>
          </div>

          {/* Regular Post Content */}
          {createMode === 'post' && (
            <>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={newPostContent}
                  onChange={(e) => handleContentChange(e.target.value, e.target.selectionStart)}
                  placeholder={t('forum.createModal.placeholder')}
                  rows={4}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />

                {/* Mention Suggestions */}
                {showMentions && mentionSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    {mentionSuggestions.map((user) => (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => insertMention(user.username)}
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">@{user.username}</span>
                            {user.badges?.map((badge, i) => (
                              <span key={i} className={`text-xs ${BADGE_STYLES[badge]?.color}`}>
                                {BADGE_STYLES[badge]?.icon}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* GIF Preview */}
              {selectedGif && (
                <div className="relative mt-3">
                  <img
                    src={selectedGif.url}
                    alt="GIF"
                    className="max-h-48 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedGif(null)}
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-900/80 rounded-full flex items-center justify-center text-white hover:bg-gray-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Media buttons */}
              <div className="flex items-center gap-2 mt-3 pb-3 border-b border-gray-800">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 4}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                >
                  <ImageIcon className="w-5 h-5" />
                  {t('forum.createModal.image')}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                >
                  GIF
                </button>
                <button
                  type="button"
                  onClick={triggerMention}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                >
                  <AtSign className="w-5 h-5" />
                  {t('forum.createModal.mention')}
                </button>
              </div>
            </>
          )}

          {/* Poll Creation */}
          {createMode === 'poll' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">{t('forum.poll.question')}</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder={t('forum.poll.questionPlaceholder')}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('forum.poll.options')}</label>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        placeholder={t('forum.poll.optionPlaceholder', { number: index + 1 })}
                        className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="mt-2 text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t('forum.poll.addOption')}
                  </button>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">{t('forum.poll.duration')}</label>
                <select
                  value={pollDuration}
                  onChange={(e) => setPollDuration(Number(e.target.value))}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={1}>1 {t('forum.poll.hour')}</option>
                  <option value={6}>6 {t('forum.poll.hours')}</option>
                  <option value={12}>12 {t('forum.poll.hours')}</option>
                  <option value={24}>24 {t('forum.poll.hours')}</option>
                  <option value={48}>2 {t('forum.poll.days')}</option>
                  <option value={168}>1 {t('forum.poll.week')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Thread Creation */}
          {createMode === 'thread' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">{t('forum.thread.titleOptional')}</label>
                <input
                  type="text"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={t('forum.thread.titlePlaceholder')}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('forum.thread.posts')}</label>
                <div className="space-y-3">
                  {threadPosts.map((post, index) => (
                    <div key={index} className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-500/30" />
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold z-10">
                          {index + 1}
                        </div>
                        <textarea
                          value={post}
                          onChange={(e) => {
                            const newPosts = [...threadPosts];
                            newPosts[index] = e.target.value;
                            setThreadPosts(newPosts);
                          }}
                          placeholder={t('forum.thread.postPlaceholder', { number: index + 1 })}
                          rows={3}
                          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {threadPosts.length < 10 && (
                  <button
                    type="button"
                    onClick={addThreadPost}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t('forum.thread.addToThread')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">{t('forum.createModal.tagsOptional')}</p>
            <div className="flex flex-wrap gap-2">
              {FORUM_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    newPostTags.includes(tag.id)
                      ? tag.color
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={resetCreateModal}
              className="border-gray-700"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={creating}
              className={
                createMode === 'poll'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : createMode === 'thread'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('forum.createModal.publishing')}
                </>
              ) : (
                createMode === 'poll' ? t('forum.createModal.createPoll') :
                createMode === 'thread' ? t('forum.createModal.publishThread') :
                t('forum.createModal.publish')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      <Dialog open={!!selectedPostId} onOpenChange={() => setSelectedPostId(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-4">{t('forum.comments.title')}</h2>

          {selectedPost && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Post original */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/perfil/${selectedPost.author?.username}`}>
                    <div
                      className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all overflow-hidden"
                      style={selectedPost.author?.avatar_url ? { background: `url(${selectedPost.author.avatar_url}) center/cover` } : undefined}
                    >
                      {!selectedPost.author?.avatar_url && (selectedPost.author?.display_name || selectedPost.author?.username || 'U')[0].toUpperCase()}
                    </div>
                  </Link>
                  <div>
                    <Link href={`/perfil/${selectedPost.author?.username}`} className="font-semibold hover:text-purple-400 transition-colors">
                      {selectedPost.author?.display_name || selectedPost.author?.username}
                    </Link>
                    <Link href={`/perfil/${selectedPost.author?.username}`} className="text-gray-500 text-sm ml-2 hover:text-purple-400 transition-colors">
                      @{selectedPost.author?.username}
                    </Link>
                  </div>
                </div>
                <p className="text-gray-300">{selectedPost.content}</p>
              </div>

              {/* Lista de comentarios */}
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {t('forum.comments.noComments')}
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/perfil/${comment.author?.username}`}>
                            <div
                              className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all overflow-hidden"
                              style={comment.author?.avatar_url ? { background: `url(${comment.author.avatar_url}) center/cover` } : undefined}
                            >
                              {!comment.author?.avatar_url && (comment.author?.display_name || comment.author?.username || 'U')[0].toUpperCase()}
                            </div>
                          </Link>
                          <Link href={`/perfil/${comment.author?.username}`} className="font-medium text-sm hover:text-purple-400 transition-colors">
                            {comment.author?.display_name || comment.author?.username}
                          </Link>
                          <span className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: dateLocale })}
                          </span>
                        </div>
                        {user?.id === comment.author_id && (
                          <button
                            onClick={() => openDeleteConfirm(comment.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title={t('forum.comments.delete') || 'Eliminar comentario'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm ml-8">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input para nuevo comentario */}
          {isLoggedIn && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('forum.comments.placeholder')}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateComment()}
                />
                <Button
                  onClick={handleCreateComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Comment Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => {
        if (!isDeleting) {
          setDeleteConfirmOpen(open);
          if (!open) setDeletingCommentId(null);
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-sm">
          <div className="flex flex-col items-center text-center py-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 animate-pulse">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-2">
              ¿Eliminar comentario?
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-6">
              Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeletingCommentId(null);
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteComment}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation Modal */}
      <Dialog open={deletePostConfirmOpen} onOpenChange={(open) => {
        if (!isDeletingPost) {
          setDeletePostConfirmOpen(open);
          if (!open) setDeletingPostId(null);
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-sm">
          <div className="flex flex-col items-center text-center py-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 animate-pulse">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-2">
              ¿Eliminar publicación?
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-6">
              Esta acción no se puede deshacer. La publicación será eliminada permanentemente.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
                onClick={() => {
                  setDeletePostConfirmOpen(false);
                  setDeletingPostId(null);
                }}
                disabled={isDeletingPost}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeletePost}
                disabled={isDeletingPost}
              >
                {isDeletingPost ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Repost Modal */}
      <Dialog open={repostModalOpen} onOpenChange={setRepostModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Repeat2 className="w-5 h-5 text-green-400" />
            {t('forum.actions.sharePost')}
          </h2>

          {repostingPost && (
            <>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/perfil/${repostingPost.author?.username}`}>
                    <div
                      className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all overflow-hidden"
                      style={repostingPost.author?.avatar_url ? { background: `url(${repostingPost.author.avatar_url}) center/cover` } : undefined}
                    >
                      {!repostingPost.author?.avatar_url && (repostingPost.author?.display_name || repostingPost.author?.username || 'U')[0].toUpperCase()}
                    </div>
                  </Link>
                  <Link href={`/perfil/${repostingPost.author?.username}`} className="font-medium text-sm hover:text-purple-400 transition-colors">
                    {repostingPost.author?.display_name || repostingPost.author?.username}
                  </Link>
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">{repostingPost.content}</p>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  {t('forum.actions.addCommentOptional')}
                </label>
                <textarea
                  value={quoteContent}
                  onChange={(e) => setQuoteContent(e.target.value)}
                  placeholder={t('forum.actions.whatDoYouThink')}
                  rows={3}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleRepost(false)}
                  disabled={isReposting}
                  variant="outline"
                  className="flex-1 border-gray-700 hover:border-green-500 hover:text-green-400"
                >
                  {isReposting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat2 className="w-4 h-4 mr-2" />}
                  {t('forum.actions.share')}
                </Button>
                <Button
                  onClick={() => handleRepost(true)}
                  disabled={isReposting || !quoteContent.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isReposting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                  {t('forum.actions.quote')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Award Modal */}
      <Dialog open={awardModalOpen} onOpenChange={setAwardModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            {t('forum.actions.giveAward')}
          </h2>

          {awardingPost && (
            <>
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-700">
                <p className="text-gray-300 text-sm line-clamp-2">{awardingPost.content}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {t('forum.actions.by')} <Link href={`/perfil/${awardingPost.author?.username}`} className="hover:text-purple-400 transition-colors">@{awardingPost.author?.username}</Link>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {awardTypes.map((award) => (
                  <button
                    key={award.id}
                    onClick={() => setSelectedAward(award)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedAward?.id === award.id
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{award.icon}</span>
                      <span className="font-medium" style={{ color: award.color }}>
                        {award.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{award.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-yellow-400">{t('forum.actions.apCost', { cost: award.ap_cost })}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-green-400">{t('forum.actions.apReward', { reward: award.ap_reward })}</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedAward && (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">
                    {t('forum.actions.messageOptional')}
                  </label>
                  <input
                    type="text"
                    value={awardMessage}
                    onChange={(e) => setAwardMessage(e.target.value)}
                    placeholder={t('forum.actions.addMessage')}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setAwardModalOpen(false)}
                  className="border-gray-700"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleGiveAward}
                  disabled={givingAward || !selectedAward}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {givingAward ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Gift className="w-4 h-4 mr-2" />
                  )}
                  {t('forum.actions.give')} {selectedAward?.name || t('forum.actions.giveAward')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Stories Viewer Modal - Instagram Style */}
      {storyViewerOpen && viewingUserStories && (
        <StoryViewer
          userStories={viewingUserStories}
          currentUserId={user?.id}
          onClose={() => {
            setStoryViewerOpen(false);
            setViewingUserStories(null);
            // Refresh stories bar after viewing
            setStoriesKey(prev => prev + 1);
          }}
        />
      )}

      {/* Create Story Modal - Instagram Style */}
      {createStoryModalOpen && (
        <CreateStoryModal
          onClose={() => setCreateStoryModalOpen(false)}
          onSuccess={() => {
            toast.success(t('forum.actions.storyPublished'));
            // Refresh stories bar
            setStoriesKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}

// Componente de tarjeta de post
function PostCard({
  post,
  currentUserId,
  onOpenComments,
  onDelete,
  onReaction,
  onBookmark,
  onRepost,
  onShare,
  onAward,
  REACTIONS,
  FORUM_TAGS,
  dateLocale,
}: {
  post: ForumPost;
  currentUserId?: string;
  onOpenComments: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReaction: (postId: string, reactionType: ReactionType) => void;
  onBookmark: (postId: string) => void;
  onRepost: (post: ForumPost) => void;
  onShare: (post: ForumPost, type: 'clipboard' | 'twitter' | 'whatsapp' | 'facebook' | 'tiktok' | 'telegram' | 'reddit' | 'linkedin' | 'instagram') => void;
  onAward: (post: ForumPost) => void;
  REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[];
  FORUM_TAGS: { id: string; label: string; color: string }[];
  dateLocale: Locale;
}) {
  const { t } = useTranslation();
  const [showReactions, setShowReactions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const isAuthor = currentUserId === post.author_id;

  // Calculate total reactions
  const totalReactions = post.reactions_count
    ? Object.values(post.reactions_count).reduce((a, b) => a + b, 0)
    : post.likes_count || 0;

  // Get top reactions (non-zero)
  const topReactions = post.reactions_count
    ? Object.entries(post.reactions_count)
        .filter(([_, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji)
        .filter(Boolean)
    : [];

  return (
    <div id={`post-${post.id}`} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all">
      {/* Thread indicator */}
      {post.thread_id && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <ListPlus className="w-4 h-4" />
              <span className="font-medium">{t('forum.posts.thread')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300 text-xs font-medium">
                {post.thread_position}/{post.thread?.total_posts || '?'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/perfil/${post.author?.username}`}>
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all overflow-hidden"
              style={post.author?.avatar_url ? { background: `url(${post.author.avatar_url}) center/cover` } : undefined}
            >
              {!post.author?.avatar_url && (post.author?.display_name || post.author?.username || 'U')[0].toUpperCase()}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/perfil/${post.author?.username}`} className="font-semibold hover:text-purple-400 transition-colors">
                {post.author?.display_name || post.author?.username}
              </Link>
              {/* Badges */}
              {post.author?.badges?.map((badge, i) => (
                <span
                  key={i}
                  className={`text-xs px-1.5 py-0.5 rounded ${BADGE_STYLES[badge]?.bg} ${BADGE_STYLES[badge]?.color}`}
                  title={badge}
                >
                  {BADGE_STYLES[badge]?.icon}
                </span>
              ))}
              {post.author?.level && (
                <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                  Lvl {post.author.level}
                </span>
              )}
              {post.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
              {post.is_locked && <Lock className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href={`/perfil/${post.author?.username}`} className="hover:text-purple-400 transition-colors">
                @{post.author?.username}
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Award button - Oculto temporalmente (monetización futura)
          {!isAuthor && currentUserId && (
            <button
              onClick={() => onAward(post)}
              className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
              title="Dar premio"
            >
              <Gift className="w-4 h-4" />
            </button>
          )}
          */}
          {isAuthor && (
            <button
              onClick={() => onDelete(post.id)}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Awards display */}
      {post.awards && post.awards.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          {post.awards.slice(0, 5).map((award) => (
            <span
              key={award.id}
              className="text-lg"
              title={`${award.award_type.name} de @${award.giver.username}`}
            >
              {award.award_type.icon}
            </span>
          ))}
          {post.awards.length > 5 && (
            <span className="text-xs text-gray-500">+{post.awards.length - 5}</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <TextWithLinkPreviews
          text={post.content}
          className="text-gray-200 whitespace-pre-wrap"
          maxPreviews={2}
        />
      </div>

      {/* GIF */}
      {post.gif_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={post.gif_url}
            alt="GIF"
            className="max-h-80 w-auto"
          />
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div
          className="mb-4 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowImageModal(true)}
        >
          <img
            src={post.image_url}
            alt="Imagen del post"
            className="w-full max-h-[500px] object-contain bg-gray-800/50"
          />
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <PollDisplay poll={post.poll} postId={post.id} currentUserId={currentUserId} dateLocale={dateLocale} />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tagId) => {
            const tag = FORUM_TAGS.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <span key={tagId} className={`px-2 py-1 rounded-full text-xs border ${tag.color}`}>
                {tag.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        {/* Reactions Button with Popup */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            onMouseEnter={() => setShowReactions(true)}
            className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors group"
          >
            {topReactions.length > 0 ? (
              <span className="text-base">{topReactions.join('')}</span>
            ) : (
              <Heart className="w-5 h-5" />
            )}
            <span>{totalReactions}</span>
          </button>

          {/* Reactions Popup */}
          {showReactions && (
            <div
              className="absolute bottom-full left-0 mb-2 flex gap-1 bg-gray-800 border border-gray-700 rounded-full px-2 py-1 shadow-xl z-50"
              onMouseLeave={() => setShowReactions(false)}
            >
              {REACTIONS.map((reaction) => {
                const isActive = post.user_reactions?.includes(reaction.type);
                return (
                  <button
                    key={reaction.type}
                    onClick={() => {
                      onReaction(post.id, reaction.type);
                      setShowReactions(false);
                    }}
                    title={reaction.label}
                    className={`text-xl hover:scale-125 transition-transform p-1 rounded ${
                      isActive ? 'bg-gray-700' : ''
                    }`}
                  >
                    {reaction.emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments */}
        <button
          onClick={() => onOpenComments(post.id)}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count || 0}</span>
        </button>

        {/* Repost */}
        <button
          onClick={() => onRepost(post)}
          className={`flex items-center gap-2 transition-colors ${
            post.user_reposted
              ? 'text-green-400'
              : 'text-gray-400 hover:text-green-400'
          }`}
        >
          <Repeat2 className="w-5 h-5" />
          <span>{post.reposts_count || 0}</span>
        </button>

        {/* Share Menu */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {showShareMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[160px] py-2"
              onMouseLeave={() => setShowShareMenu(false)}
            >
              <button
                onClick={() => { onShare(post, 'clipboard'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                {t('forum.actions.copyLink')}
              </button>
              <button
                onClick={() => { onShare(post, 'twitter'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </button>
              <button
                onClick={() => { onShare(post, 'whatsapp'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button
                onClick={() => { onShare(post, 'telegram'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="#0088cc" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </button>
              <button
                onClick={() => { onShare(post, 'facebook'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
              <button
                onClick={() => { onShare(post, 'instagram'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="url(#instagram-gradient)" viewBox="0 0 24 24"><defs><linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFDC80"/><stop offset="25%" stopColor="#F77737"/><stop offset="50%" stopColor="#E1306C"/><stop offset="75%" stopColor="#C13584"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                Instagram
              </button>
              <button
                onClick={() => { onShare(post, 'tiktok'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                TikTok
              </button>
              <button
                onClick={() => { onShare(post, 'reddit'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="#FF4500" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                Reddit
              </button>
              <button
                onClick={() => { onShare(post, 'linkedin'); setShowShareMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="#0A66C2" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => onBookmark(post.id)}
          className={`flex items-center gap-1 transition-colors ${
            post.user_bookmarked
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-yellow-400'
          }`}
        >
          {post.user_bookmarked ? (
            <BookMarked className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
          {(post.bookmarks_count || 0) > 0 && (
            <span className="text-sm">{post.bookmarks_count}</span>
          )}
        </button>

        {/* Views */}
        <span className="text-gray-500 text-sm">
          {post.views_count || 0} {t('forum.posts.views')}
        </span>
      </div>

      {/* Image Modal */}
      {showImageModal && post.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setShowImageModal(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={post.image_url}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// Poll Display Component
function PollDisplay({
  poll,
  postId,
  currentUserId,
  dateLocale
}: {
  poll: ForumPoll;
  postId: string;
  currentUserId?: string;
  dateLocale: Locale;
}) {
  const { t } = useTranslation();
  const [localPoll, setLocalPoll] = useState(poll);
  const [voting, setVoting] = useState(false);

  const handleVote = async (optionId: string) => {
    if (!currentUserId || localPoll.has_voted || voting) return;

    setVoting(true);
    try {
      const result = await forumService.voteOnPoll(localPoll.id, optionId, currentUserId);
      if (result.success && result.options) {
        setLocalPoll(prev => ({
          ...prev,
          has_voted: true,
          user_votes: [optionId],
          options: result.options!,
          total_votes: result.options!.reduce((sum, opt) => sum + opt.votes_count, 0),
        }));
        toast.success(t('forum.poll.voteRecorded'));
      }
    } catch (error) {
      toast.error(t('forum.poll.voteError'));
    } finally {
      setVoting(false);
    }
  };

  const isExpired = new Date(localPoll.ends_at) < new Date();
  const showResults = localPoll.has_voted || isExpired;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-orange-400" />
        <span className="font-medium">{localPoll.question}</span>
      </div>

      <div className="space-y-2">
        {localPoll.options.map((option) => {
          const percentage = localPoll.total_votes > 0
            ? Math.round((option.votes_count / localPoll.total_votes) * 100)
            : 0;
          const isSelected = localPoll.user_votes?.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={showResults || voting || !currentUserId}
              className={`w-full text-left rounded-lg overflow-hidden transition-all ${
                showResults
                  ? 'cursor-default'
                  : 'hover:bg-gray-700/50 cursor-pointer'
              }`}
            >
              <div className="relative p-3 border border-gray-700 rounded-lg">
                {showResults && (
                  <div
                    className="absolute inset-0 bg-orange-500/20 rounded-lg transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-400" />
                    )}
                    <span className={isSelected ? 'text-orange-400 font-medium' : ''}>
                      {option.option_text}
                    </span>
                  </div>
                  {showResults && (
                    <span className="text-sm text-gray-400">
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>{localPoll.total_votes} {localPoll.total_votes === 1 ? t('forum.poll.vote') : t('forum.poll.votes')}</span>
        <span>
          {isExpired ? (
            t('forum.poll.pollEnded')
          ) : (
            `${t('forum.poll.endsIn')} ${formatDistanceToNow(new Date(localPoll.ends_at), { addSuffix: false, locale: dateLocale })}`
          )}
        </span>
      </div>
    </div>
  );
}
