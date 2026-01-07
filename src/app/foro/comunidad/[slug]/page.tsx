'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Settings,
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Pin,
  Trash2,
  Image as ImageIcon,
  Send,
  Globe,
  Lock,
  CheckCircle,
  Crown,
  Shield,
  Loader2,
  UserPlus,
  UserMinus,
  Calendar,
  TrendingUp,
  Bell,
  BellOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CommunitySettingsModal } from '@/components/communities/CommunitySettingsModal';
import { PostCard } from '@/components/communities/PostCard';

interface CommunityMember {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  level: number;
  role: 'member' | 'moderator' | 'admin' | 'owner';
  joinedAt: string;
}

interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    level?: number;
  } | null;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  requiresApproval: boolean;
  membersCount: number;
  postsCount: number;
  rules: string[];
  categories: string[];
  createdAt: string;
  creatorId: string;
}

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuthStore();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'about'>('posts');
  const [showSettings, setShowSettings] = useState(false);

  // Create post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load community data
  const loadCommunity = useCallback(async () => {
    try {
      const response = await fetch(`/api/communities/${slug}`);
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        router.push('/foro');
        return;
      }

      setCommunity(data.community);
      setIsMember(data.isMember);
      setUserRole(data.userRole);
    } catch (error) {
      console.error('Error loading community:', error);
      toast.error('Error al cargar la comunidad');
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!community) return;
    setPostsLoading(true);
    try {
      const response = await fetch(`/api/communities/${community.id}/posts?sort=pinned`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar publicaciones');
    } finally {
      setPostsLoading(false);
    }
  }, [community]);

  // Load members
  const loadMembers = useCallback(async () => {
    if (!community) return;
    try {
      const response = await fetch(`/api/communities/${community.id}/members`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }, [community]);

  useEffect(() => {
    loadCommunity();
  }, [loadCommunity]);

  useEffect(() => {
    if (community) {
      loadPosts();
      loadMembers();
    }
  }, [community, loadPosts, loadMembers]);

  // Join/Leave community
  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para unirte');
      return;
    }

    try {
      const response = await fetch(`/api/communities/${community?.id}/join`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setIsMember(true);
      setUserRole('member');
      if (community) {
        setCommunity({ ...community, membersCount: community.membersCount + 1 });
      }
      toast.success('Te has unido a la comunidad');
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Error al unirse a la comunidad');
    }
  };

  const handleLeaveCommunity = async () => {
    if (userRole === 'owner') {
      toast.error('El propietario no puede abandonar la comunidad');
      return;
    }

    try {
      const response = await fetch(`/api/communities/${community?.id}/join`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setIsMember(false);
      setUserRole(null);
      if (community) {
        setCommunity({ ...community, membersCount: community.membersCount - 1 });
      }
      toast.success('Has abandonado la comunidad');
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Error al abandonar la comunidad');
    }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    if (!isMember) {
      toast.error('Debes ser miembro para publicar');
      return;
    }

    setIsCreatingPost(true);
    try {
      const response = await fetch(`/api/communities/${community?.id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          imageUrl: newPostImage,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPosts([data.post, ...posts]);
      setNewPostContent('');
      setNewPostImage(null);
      // Update posts count in community state
      if (community) {
        setCommunity({ ...community, postsCount: community.postsCount + 1 });
      }
      toast.success('Publicación creada');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al crear publicación');
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Like post
  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const method = post.isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/communities/${community?.id}/posts/${postId}/like`, { method });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Error al procesar like');
    }
  };

  // Delete post handler
  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    if (community) {
      setCommunity({ ...community, postsCount: Math.max(0, community.postsCount - 1) });
    }
  };

  // Pin/Unpin post handler
  const handlePinPost = (postId: string, isPinned: boolean) => {
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, isPinned } : p
    ));
  };

  // Role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-red-400" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-2xl font-bold mb-4">Comunidad no encontrada</h1>
          <Button onClick={() => router.push('/foro')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al foro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Community Header */}
      <div className="relative">
        {/* Banner */}
        <div
          className="h-48 md:h-64 w-full"
          style={{
            background: community.bannerUrl
              ? `url(${community.bannerUrl}) center/cover`
              : `linear-gradient(135deg, ${community.themeColor}60, ${community.themeColor}20)`,
          }}
        />

        {/* Back button */}
        <button
          onClick={() => router.push('/foro')}
          className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Community Info */}
        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Icon */}
            <div
              className="w-28 h-28 rounded-2xl border-4 border-gray-950 flex items-center justify-center text-4xl font-bold shadow-lg"
              style={{
                background: community.iconUrl
                  ? `url(${community.iconUrl}) center/cover`
                  : `linear-gradient(135deg, ${community.themeColor}, ${community.themeColor}cc)`,
              }}
            >
              {!community.iconUrl && community.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{community.name}</h1>
                {community.isVerified && (
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                )}
                {!community.isPublic && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Privada
                  </span>
                )}
              </div>
              <p className="text-gray-400 mt-1">{community.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {community.membersCount.toLocaleString()} miembros
                </span>
                <span>{community.postsCount.toLocaleString()} publicaciones</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pb-4">
              {isMember ? (
                <>
                  <Button
                    variant="outline"
                    className="border-gray-700"
                    onClick={handleLeaveCommunity}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Salir
                  </Button>
                  {(userRole === 'owner' || userRole === 'admin') && (
                    <Button
                      variant="outline"
                      className="border-gray-700"
                      onClick={() => setShowSettings(true)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleJoinCommunity}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Unirse
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mt-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'posts' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Publicaciones
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'members' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Miembros
              {activeTab === 'members' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'about' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Acerca de
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'posts' && (
              <>
                {/* Create Post */}
                {isMember && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                        {user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Escribe algo para la comunidad..."
                          className="bg-gray-800 border-gray-700 min-h-[80px] resize-none"
                          maxLength={2000}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <ImageIcon className="w-5 h-5" />
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // In production, upload to storage and get URL
                                  setNewPostImage(URL.createObjectURL(file));
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {newPostContent.length}/2000
                            </span>
                            <Button
                              onClick={handleCreatePost}
                              disabled={!newPostContent.trim() || isCreatingPost}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {isCreatingPost ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Publicar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        {newPostImage && (
                          <div className="relative mt-3">
                            <img
                              src={newPostImage}
                              alt="Preview"
                              className="max-h-40 rounded-lg"
                            />
                            <button
                              onClick={() => setNewPostImage(null)}
                              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-900/50 rounded-xl h-48 animate-pulse" />
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        communityId={community.id}
                        communitySlug={community.slug}
                        currentUserId={user?.id}
                        userRole={userRole}
                        isAuthenticated={isAuthenticated}
                        isMember={isMember}
                        onLike={handleLikePost}
                        onDelete={handleDeletePost}
                        onPin={handlePinPost}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-semibold mb-2">No hay publicaciones aún</h3>
                    <p className="text-gray-400">
                      {isMember
                        ? 'Sé el primero en publicar algo'
                        : 'Únete a la comunidad para ver y crear publicaciones'}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
                    >
                      <Link href={`/perfil/${member.username}`}>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                          style={{
                            background: member.avatarUrl
                              ? `url(${member.avatarUrl}) center/cover`
                              : 'linear-gradient(135deg, #6366f1, #ec4899)',
                          }}
                        >
                          {!member.avatarUrl && member.username?.[0]?.toUpperCase()}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/perfil/${member.username}`}
                            className="font-semibold hover:text-purple-400 transition-colors"
                          >
                            {member.displayName || member.username}
                          </Link>
                          {getRoleBadge(member.role)}
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                            Lvl {member.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          @{member.username} · Miembro desde{' '}
                          {formatDistanceToNow(new Date(member.joinedAt), { locale: es })}
                        </p>
                      </div>
                      {member.role !== 'owner' &&
                        member.role !== 'admin' &&
                        (userRole === 'owner' || userRole === 'admin') && (
                          <Button variant="outline" size="sm" className="border-gray-700">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-semibold mb-2">No hay miembros</h3>
                    <p className="text-gray-400">Sé el primero en unirte</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-3">Acerca de esta comunidad</h3>
                  <p className="text-gray-300">{community.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Creada {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true, locale: es })}
                    </span>
                    {community.isPublic ? (
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Pública
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Privada
                      </span>
                    )}
                  </div>
                </div>

                {/* Rules */}
                {community.rules && community.rules.length > 0 && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-3">Reglas de la comunidad</h3>
                    <ol className="space-y-2">
                      {community.rules.map((rule, index) => (
                        <li key={index} className="flex gap-2 text-gray-300">
                          <span className="text-purple-400 font-semibold">{index + 1}.</span>
                          {rule}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Categories */}
                {community.categories && community.categories.length > 0 && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-3">Categorías</h3>
                    <div className="flex flex-wrap gap-2">
                      {community.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {community.membersCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Miembros</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {community.postsCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Publicaciones</div>
                </div>
              </div>
            </div>

            {/* Top Members */}
            {members.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="font-semibold mb-4">Miembros destacados</h3>
                <div className="space-y-3">
                  {members.slice(0, 5).map((member) => (
                    <Link
                      key={member.id}
                      href={`/perfil/${member.username}`}
                      className="flex items-center gap-3 hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{
                          background: member.avatarUrl
                            ? `url(${member.avatarUrl}) center/cover`
                            : 'linear-gradient(135deg, #6366f1, #ec4899)',
                        }}
                      >
                        {!member.avatarUrl && member.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium truncate">
                            {member.displayName || member.username}
                          </span>
                          {getRoleBadge(member.role)}
                        </div>
                        <span className="text-xs text-gray-500">@{member.username}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                {members.length > 5 && (
                  <button
                    onClick={() => setActiveTab('members')}
                    className="w-full mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Ver todos los miembros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {community && (userRole === 'owner' || userRole === 'admin') && (
        <CommunitySettingsModal
          community={community}
          userRole={userRole}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onUpdate={(updates) => {
            setCommunity({ ...community, ...updates });
          }}
          onDelete={() => {
            router.push('/foro');
          }}
        />
      )}
    </div>
  );
}
