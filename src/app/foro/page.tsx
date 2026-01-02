'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { forumService, ForumPost, ForumComment, ForumCategory } from '@/services/forum.service';
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
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'popular' | 'comments'>('recent');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal de crear post
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  
  // Modal de comentarios
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Cargar posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await forumService.getPosts({
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
  }, [filter, selectedCategory, selectedTag]);

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    const data = await forumService.getCategories();
    setCategories(data);
  }, []);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [loadPosts, loadCategories]);

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
              onClick={() => setIsCreateModalOpen(false)}
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
}: {
  post: ForumPost;
  currentUserId?: string;
  onOpenComments: (postId: string) => void;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}) {
  const isAuthor = currentUserId === post.author_id;

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
      <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Heart className="w-5 h-5" />
          <span>{post.likes_count || 0}</span>
        </button>

        <button
          onClick={() => onOpenComments(post.id)}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count || 0}</span>
        </button>

        <span className="text-gray-500 text-sm ml-auto">
          {post.views_count || 0} vistas
        </span>
      </div>
    </div>
  );
}