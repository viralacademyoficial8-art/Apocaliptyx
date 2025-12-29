'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useForumStore, useScenarioStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { ForumPostCard } from '@/components/ForumPostCard';
import { CommentSection } from '@/components/CommentSection';
import { CreatePostModal } from '@/components/CreatePostModal';
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
} from 'lucide-react';
import { FORUM_TAGS } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function ForoPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    posts,
    isLoading,
    filter,
    selectedTag,
    fetchPosts,
    setFilter,
    setSelectedTag,
  } = useForumStore();
  const { fetchScenarios } = useScenarioStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchScenarios();
  }, [fetchPosts, fetchScenarios]);

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  const selectedPost = posts.find((p) => p.id === selectedPostId);

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
                  Comparte predicciones, debates y estrategias con otros
                  profetas
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
                  onClick={() => setFilter('recientes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'recientes'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Recientes
                </button>
                <button
                  onClick={() => setFilter('populares')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'populares'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Populares
                </button>
                <button
                  onClick={() => setFilter('siguiendo')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'siguiendo'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Siguiendo
                </button>
              </div>

              {selectedTag && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/20 text-purple-400 border-purple-500/30 cursor-pointer"
                  onClick={() => setSelectedTag(null)}
                >
                  {FORUM_TAGS.find((t) => t.id === selectedTag)?.label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>

            {/* Posts Feed */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
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
                {filteredPosts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    onOpenComments={(postId) => setSelectedPostId(postId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
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
                    onClick={() =>
                      setSelectedTag(
                        selectedTag === tag.id ? null : tag.id,
                      )
                    }
                    className={`
                      px-3 py-1.5 rounded-lg text-sm border transition-all
                      ${
                        selectedTag === tag.id
                          ? tag.color
                          : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                      }
                    `}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Temas Trending
              </h3>
              <div className="space-y-3">
                {[
                  'Bitcoin $200K',
                  'Elecciones USA',
                  'GPT-5',
                  'Mundial 2026',
                  'Crisis Económica',
                ].map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{topic}</div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 50 + 10)} escenarios
                      </div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Comunidad
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Profetas activos</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts hoy</span>
                  <span className="font-semibold">56</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Comentarios hoy</span>
                  <span className="font-semibold">234</span>
                </div>
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
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Comments Modal */}
      <Dialog
        open={!!selectedPostId}
        onOpenChange={() => setSelectedPostId(null)}
      >
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
          {/* Header simple (sin DialogHeader / DialogTitle) */}
          <div className="mb-4">
            <h2 className="text-xl font-bold">Comentarios</h2>
          </div>

          {selectedPost && (
            <div className="space-y-6">
              {/* Original Post Preview */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {selectedPost.authorDisplayName}
                  </span>
                  <span className="text-gray-500">
                    @{selectedPost.authorUsername}
                  </span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">
                  {selectedPost.content}
                </p>
              </div>

              {/* Comments */}
              <CommentSection postId={selectedPost.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
