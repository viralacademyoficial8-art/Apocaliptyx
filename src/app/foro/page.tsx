'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { forumService, ForumPost, ForumComment, ForumCategory, ReactionType, ReactionCounts, TrendingTag } from '@/services/forum.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquarePlus,
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
  MoreVertical,
  Trash2,
  Pin,
  Lock,
  Bookmark,
  BookMarked,
  Share2,
  Repeat2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Reaction definitions
const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'fire', emoji: '🔥', label: 'Fuego', color: 'text-orange-400' },
  { type: 'love', emoji: '❤️', label: 'Me encanta', color: 'text-red-400' },
  { type: 'clap', emoji: '👏', label: 'Aplausos', color: 'text-yellow-400' },
  { type: 'mindblown', emoji: '🤯', label: 'Increíble', color: 'text-purple-400' },
  { type: 'laugh', emoji: '😂', label: 'Jaja', color: 'text-green-400' },
  { type: 'sad', emoji: '😢', label: 'Triste', color: 'text-blue-400' },
];

// Tags disponibles
const FORUM_TAGS = [
  { id: 'prediccion', label: '🔮 Predicción', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'debate', label: '💬 Debate', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'estrategia', label: '🎯 Estrategia', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'analisis', label: '📊 Análisis', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { id: 'noticia', label: '📰 Noticia', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'humor', label: '😂 Humor', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
];

export default function ForoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'popular' | 'comments' | 'following'>('recent');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal de crear post
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de comentarios
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modal de repost
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [repostingPost, setRepostingPost] = useState<ForumPost | null>(null);
  const [quoteContent, setQuoteContent] = useState('');
  const [isReposting, setIsReposting] = useState(false);

  // Cargar posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await forumService.getPostsWithUserState(user?.id || null, {
        sortBy: filter,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        tag: selectedTag || undefined,
        limit: 50,
      });
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedCategory, selectedTag, user?.id]);

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

  useEffect(() => {
    loadPosts();
    loadCategories();
    loadTrendingTags();
  }, [loadPosts, loadCategories, loadTrendingTags]);

  // Crear post
  const handleCreatePost = async () => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    if (!newPostContent.trim()) {
      toast.error('Escribe algo para publicar');
      return;
    }

    setCreating(true);
    try {
      const post = await forumService.createPost(user.id, {
        content: newPostContent,
        tags: newPostTags,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      });

      if (post) {
        toast.success('¡Publicación creada!');
        setNewPostContent('');
        setNewPostTags([]);
        setIsCreateModalOpen(false);
        loadPosts();
      } else {
        toast.error('Error al crear la publicación');
      }
    } catch (error) {
      toast.error('Error al crear la publicación');
    } finally {
      setCreating(false);
    }
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
  const openComments = (postId: string) => {
    setSelectedPostId(postId);
    loadComments(postId);
  };

  // Crear comentario
  const handleCreateComment = async () => {
    if (!user?.id || !selectedPostId) return;

    if (!newComment.trim()) {
      toast.error('Escribe un comentario');
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
        // Actualizar contador en el post
        setPosts(prev => prev.map(p => 
          p.id === selectedPostId 
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        ));
        toast.success('Comentario añadido');
      }
    } catch (error) {
      toast.error('Error al comentar');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Like post
  const handleLikePost = async (postId: string) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    try {
      const result = await forumService.toggleLikePost(postId, user.id);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes_count: result.likesCount } : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Eliminar post
  const handleDeletePost = async (postId: string) => {
    if (!user?.id) return;
    if (!confirm('¿Eliminar esta publicación?')) return;

    const success = await forumService.deletePost(postId, user.id);
    if (success) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Publicación eliminada');
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
      toast.success(result.bookmarked ? 'Guardado en marcadores' : 'Eliminado de marcadores');
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
        toast.success('¡Publicación compartida!');
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
        toast.error(result.error || 'Error al compartir');
      }
    } catch (error) {
      toast.error('Error al compartir');
    } finally {
      setIsReposting(false);
    }
  };

  // Handle share
  const handleShare = async (post: ForumPost, type: 'clipboard' | 'twitter' | 'whatsapp') => {
    const url = `${window.location.origin}/foro?post=${post.id}`;
    const text = post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '');

    if (type === 'clipboard') {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado');
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }

    // Track share
    forumService.trackShare(post.id, user?.id || null, type);
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast.error('Máximo 4 imágenes por publicación');
      return;
    }
    setSelectedImages(prev => [...prev, ...files].slice(0, 4));
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle tag en nuevo post
  const toggleTag = (tagId: string) => {
    setNewPostTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                  Comunidad
                </h1>
                <p className="text-gray-400 mt-1">
                  Comparte predicciones, debates y estrategias con otros profetas
                </p>
              </div>

              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/login');
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Nueva Publicación
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
              <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setFilter('recent')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'recent'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Recientes
                </button>
                <button
                  onClick={() => setFilter('popular')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'popular'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Populares
                </button>
                <button
                  onClick={() => setFilter('comments')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'comments'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Más comentados
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setFilter('following')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      filter === 'following'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Siguiendo
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
                <h3 className="text-xl font-bold mb-2">No hay publicaciones</h3>
                <p className="text-gray-400 mb-6">
                  {selectedTag
                    ? 'No hay posts con esta etiqueta'
                    : 'Sé el primero en compartir algo con la comunidad'}
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Crear primera publicación
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
                    onLike={handleLikePost}
                    onDelete={handleDeletePost}
                    onReaction={handleReaction}
                    onBookmark={handleBookmark}
                    onRepost={openRepostModal}
                    onShare={handleShare}
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
                <h3 className="text-lg font-semibold mb-4">Categorías</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    Todas
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
                  Trending
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
                              {trend.post_count} {trend.post_count === 1 ? 'post' : 'posts'} esta semana
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
                Etiquetas
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
                📜 Reglas del Foro
              </h3>
              <ul className="space-y-2 text-sm text-yellow-200/80">
                <li>• Respeta a otros profetas</li>
                <li>• No spam ni autopromoción</li>
                <li>• Nada de contenido +18</li>
                <li>• Sin política extrema</li>
                <li>• Diviértete prediciendo 🔮</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
          <h2 className="text-xl font-bold mb-4">Nueva Publicación</h2>

          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="¿Qué quieres compartir con la comunidad?"
            rows={4}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

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
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedImages.length >= 4}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-5 h-5" />
              Imagen
            </button>
            <span className="text-xs text-gray-500">
              {selectedImages.length}/4 imágenes
            </span>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Etiquetas (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {FORUM_TAGS.map((tag) => (
                <button
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
              onClick={() => {
                setIsCreateModalOpen(false);
                setSelectedImages([]);
              }}
              className="border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={creating || !newPostContent.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Publicando...
                </>
              ) : (
                'Publicar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      <Dialog open={!!selectedPostId} onOpenChange={() => setSelectedPostId(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-4">Comentarios</h2>

          {selectedPost && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Post original */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                    {(selectedPost.author?.display_name || selectedPost.author?.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {selectedPost.author?.display_name || selectedPost.author?.username}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      @{selectedPost.author?.username}
                    </span>
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
                  No hay comentarios. ¡Sé el primero!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                          {(comment.author?.display_name || comment.author?.username || 'U')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">
                          {comment.author?.display_name || comment.author?.username}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm ml-8">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input para nuevo comentario */}
          {isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
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

      {/* Repost Modal */}
      <Dialog open={repostModalOpen} onOpenChange={setRepostModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Repeat2 className="w-5 h-5 text-green-400" />
            Compartir Publicación
          </h2>

          {repostingPost && (
            <>
              {/* Original post preview */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                    {(repostingPost.author?.display_name || repostingPost.author?.username || 'U')[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">
                    {repostingPost.author?.display_name || repostingPost.author?.username}
                  </span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">{repostingPost.content}</p>
              </div>

              {/* Quote option */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  Añadir comentario (opcional)
                </label>
                <textarea
                  value={quoteContent}
                  onChange={(e) => setQuoteContent(e.target.value)}
                  placeholder="¿Qué piensas sobre esto?"
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
                  Compartir
                </Button>
                <Button
                  onClick={() => handleRepost(true)}
                  disabled={isReposting || !quoteContent.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isReposting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                  Citar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de tarjeta de post
function PostCard({
  post,
  currentUserId,
  onOpenComments,
  onLike,
  onDelete,
  onReaction,
  onBookmark,
  onRepost,
  onShare,
}: {
  post: ForumPost;
  currentUserId?: string;
  onOpenComments: (postId: string) => void;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReaction: (postId: string, reactionType: ReactionType) => void;
  onBookmark: (postId: string) => void;
  onRepost: (post: ForumPost) => void;
  onShare: (post: ForumPost, type: 'clipboard' | 'twitter' | 'whatsapp') => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
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
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {(post.author?.display_name || post.author?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {post.author?.display_name || post.author?.username}
              </span>
              {post.author?.level && (
                <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                  Lvl {post.author.level}
                </span>
              )}
              {post.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
              {post.is_locked && <Lock className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>@{post.author?.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}</span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

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
              className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[140px] py-1"
              onMouseLeave={() => setShowShareMenu(false)}
            >
              <button
                onClick={() => {
                  onShare(post, 'clipboard');
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                📋 Copiar enlace
              </button>
              <button
                onClick={() => {
                  onShare(post, 'twitter');
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                𝕏 Twitter/X
              </button>
              <button
                onClick={() => {
                  onShare(post, 'whatsapp');
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                💬 WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => onBookmark(post.id)}
          className={`transition-colors ${
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
        </button>

        {/* Views */}
        <span className="text-gray-500 text-sm">
          {post.views_count || 0} vistas
        </span>
      </div>
    </div>
  );
}