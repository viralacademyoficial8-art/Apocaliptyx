'use client';

import { useState } from 'react';
import { ForumPost, ForumComment, getForumPostStatusColor } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Pin,
  PinOff,
  Lock,
  Unlock,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ForumPostsTableProps {
  posts: ForumPost[];
  comments: ForumComment[];
  onPublishPost?: (post: ForumPost) => void;
  onHidePost?: (post: ForumPost) => void;
  onDeletePost?: (post: ForumPost) => void;
  onPinPost?: (post: ForumPost) => void;
  onLockPost?: (post: ForumPost) => void;
  onHideComment?: (comment: ForumComment) => void;
  onDeleteComment?: (comment: ForumComment) => void;
}

export function ForumPostsTable({
  posts,
  comments,
  onPublishPost,
  onHidePost,
  onDeletePost,
  onPinPost,
  onLockPost,
  onHideComment,
  onDeleteComment,
}: ForumPostsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const itemsPerPage = 5;

  // categorías únicas sin usar Set (para evitar problemas con target antiguo)
  const categories = posts.reduce<string[]>((acc, p) => {
    if (!acc.includes(p.categoryName)) acc.push(p.categoryName);
    return acc;
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorUsername.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.categoryName === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.authorUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPostsPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCommentsPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingPosts = posts.filter(p => p.status === 'pending').length;
  const reportedPosts = posts.filter(p => p.reportsCount > 0).length;
  const reportedComments = comments.filter(c => c.reportsCount > 0).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold">{posts.length}</div>
          <div className="text-sm text-muted-foreground">Total Posts</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{pendingPosts}</div>
          <div className="text-sm text-muted-foreground">Pendientes</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-400">{reportedPosts}</div>
          <div className="text-sm text-muted-foreground">Posts Reportados</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{reportedComments}</div>
          <div className="text-sm text-muted-foreground">Comentarios Reportados</div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as 'posts' | 'comments');
          setCurrentPage(1);
        }}
      >
        <TabsList className="bg-muted">
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="comments">Comentarios ({comments.length})</TabsTrigger>
        </TabsList>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'posts' ? 'Buscar posts...' : 'Buscar comentarios...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-border"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 bg-muted border-border">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="published">Publicados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="hidden">Ocultos</SelectItem>
              <SelectItem value="deleted">Eliminados</SelectItem>
            </SelectContent>
          </Select>

          {activeTab === 'posts' && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-muted border-border">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* TAB POSTS */}
        <TabsContent value="posts" className="mt-4">
          <div className="space-y-3">
            {paginatedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'bg-card border rounded-xl p-4 hover:border-purple-500/50 transition-colors',
                  post.reportsCount > 0 ? 'border-orange-500/50' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {post.isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
                      {post.isLocked && <Lock className="w-4 h-4 text-red-400" />}
                      <h3 className="font-semibold">{post.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          getForumPostStatusColor(post.status)
                        )}
                      >
                        {post.status === 'published' && 'Publicado'}
                        {post.status === 'pending' && 'Pendiente'}
                        {post.status === 'hidden' && 'Oculto'}
                        {post.status === 'deleted' && 'Eliminado'}
                      </span>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                        {post.categoryName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        por @{post.authorUsername}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> {post.commentsCount}
                      </span>
                      {post.reportsCount > 0 && (
                        <span className="flex items-center gap-1 text-orange-400">
                          <AlertTriangle className="w-4 h-4" /> {post.reportsCount} reportes
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" /> Ver post
                      </DropdownMenuItem>
                      {post.status === 'pending' && (
                        <DropdownMenuItem
                          onClick={() => onPublishPost?.(post)}
                          className="text-green-400"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Aprobar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onPinPost?.(post)}>
                        {post.isPinned ? (
                          <>
                            <PinOff className="w-4 h-4 mr-2" /> Desfijar
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4 mr-2" /> Fijar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onLockPost?.(post)}>
                        {post.isLocked ? (
                          <>
                            <Unlock className="w-4 h-4 mr-2" /> Desbloquear
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" /> Bloquear
                          </>
                        )}
                      </DropdownMenuItem>
                      {post.status !== 'hidden' && (
                        <DropdownMenuItem
                          onClick={() => onHidePost?.(post)}
                          className="text-orange-400"
                        >
                          <EyeOff className="w-4 h-4 mr-2" /> Ocultar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDeletePost?.(post)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No se encontraron posts</p>
              </div>
            )}
          </div>

          {totalPostsPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {filteredPosts.length} posts encontrados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPostsPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPostsPages, p + 1))
                  }
                  disabled={currentPage === totalPostsPages}
                  className="border-border"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB COMENTARIOS */}
        <TabsContent value="comments" className="mt-4">
          <div className="space-y-3">
            {paginatedComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'bg-card border rounded-xl p-4 hover:border-purple-500/50 transition-colors',
                  comment.reportsCount > 0 ? 'border-orange-500/50' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-2 line-clamp-2">{comment.content}</p>

                    <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          getForumPostStatusColor(comment.status)
                        )}
                      >
                        {comment.status === 'published' && 'Publicado'}
                        {comment.status === 'hidden' && 'Oculto'}
                        {comment.status === 'deleted' && 'Eliminado'}
                      </span>
                      <span>por @{comment.authorUsername}</span>

                      {/* FIX ESLINT: no comillas literales en JSX */}
                      <span>en {`"${comment.postTitle}"`}</span>

                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {comment.likes}
                      </span>
                      {comment.reportsCount > 0 && (
                        <span className="flex items-center gap-1 text-orange-400">
                          <AlertTriangle className="w-3 h-3" /> {comment.reportsCount} reportes
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" /> Ver en contexto
                      </DropdownMenuItem>
                      {comment.status !== 'hidden' && (
                        <DropdownMenuItem
                          onClick={() => onHideComment?.(comment)}
                          className="text-orange-400"
                        >
                          <EyeOff className="w-4 h-4 mr-2" /> Ocultar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDeleteComment?.(comment)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            {filteredComments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No se encontraron comentarios</p>
              </div>
            )}
          </div>

          {totalCommentsPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {filteredComments.length} comentarios encontrados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalCommentsPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalCommentsPages, p + 1))
                  }
                  disabled={currentPage === totalCommentsPages}
                  className="border-border"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
