'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Pin,
  Trash2,
  Send,
  X,
  Loader2,
  Copy,
  Check,
  Reply,
  CornerDownRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PostAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  level?: number;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: PostAuthor | null;
  content: string;
  createdAt: string;
  parentId?: string | null;
  replyToUsername?: string | null;
  repliesCount?: number;
}

interface Post {
  id: string;
  communityId: string;
  authorId: string;
  author: PostAuthor | null;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isLiked: boolean;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  communityId: string;
  communitySlug: string;
  currentUserId?: string;
  userRole: string | null;
  isAuthenticated: boolean;
  isMember: boolean;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onPin: (postId: string, isPinned: boolean) => void;
}

export function PostCard({
  post,
  communityId,
  communitySlug,
  currentUserId,
  userRole,
  isAuthenticated,
  isMember,
  onLike,
  onDelete,
  onPin,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const canModerate = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';
  const canDelete = currentUserId === post.authorId || canModerate;
  const canPin = canModerate;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load comments
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${post.id}/comments`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoadingComments(false);
    }
  };

  // Toggle comments
  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  // Submit comment or reply
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    setSubmittingComment(true);
    try {
      const body: any = { content: newComment };

      // If replying to a comment
      if (replyingTo) {
        body.parentId = replyingTo.id;
        body.replyToUsername = replyingTo.author?.username;
      }

      const response = await fetch(`/api/communities/${communityId}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setComments([...comments, data.comment]);
      setLocalCommentsCount(prev => prev + 1);
      setNewComment('');
      setReplyingTo(null);
      toast.success(replyingTo ? 'Respuesta añadida' : 'Comentario añadido');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Error al crear comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle reply click
  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.author?.username} `);
    commentInputRef.current?.focus();
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  // Get parent comments (not replies)
  const parentComments = comments.filter(c => !c.parentId);

  // Get replies for a comment
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/${post.id}/comments?commentId=${commentId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setComments(comments.filter(c => c.id !== commentId));
      setLocalCommentsCount(prev => Math.max(0, prev - 1));
      toast.success('Comentario eliminado');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar comentario');
    }
  };

  // Share post
  const handleShare = async () => {
    const url = `${window.location.origin}/foro/comunidad/${communitySlug}?post=${post.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch {
      toast.error('Error al copiar enlace');
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${post.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      onDelete(post.id);
      toast.success('Publicación eliminada');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar publicación');
    }
    setShowMenu(false);
  };

  // Pin/Unpin post
  const handleTogglePin = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      onPin(post.id, !post.isPinned);
      toast.success(post.isPinned ? 'Publicación desfijada' : 'Publicación fijada');
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Error al actualizar publicación');
    }
    setShowMenu(false);
  };

  return (
    <div
      className={`bg-gray-900/50 border border-gray-800 rounded-xl p-4 ${
        post.isPinned ? 'border-yellow-500/30' : ''
      }`}
    >
      {post.isPinned && (
        <div className="flex items-center gap-1 text-xs text-yellow-400 mb-3">
          <Pin className="w-3 h-3" />
          Publicación fijada
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/perfil/${post.author?.username}`}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
            style={{
              background: post.author?.avatarUrl
                ? `url(${post.author.avatarUrl}) center/cover`
                : 'linear-gradient(135deg, #6366f1, #ec4899)',
            }}
          >
            {!post.author?.avatarUrl && post.author?.username?.[0]?.toUpperCase()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/perfil/${post.author?.username}`}
              className="font-semibold hover:text-purple-400 transition-colors"
            >
              {post.author?.displayName || post.author?.username}
            </Link>
            {post.author?.level && (
              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                Lvl {post.author.level}
              </span>
            )}
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>

          <p className="mt-2 text-gray-200 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="mt-3 rounded-xl max-h-96 object-cover"
            />
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 ${
                post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              } transition-colors`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likesCount}</span>
            </button>

            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-1 ${
                showComments ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'
              } transition-colors`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{localCommentsCount}</span>
            </button>

            {/* Share */}
            <div className="relative" ref={shareRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {showShareMenu && (
                <div className="absolute left-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 min-w-[160px]">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar enlace</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1" />

            {/* Options Menu */}
            {canDelete && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 min-w-[160px]">
                    {canPin && (
                      <button
                        onClick={handleTogglePin}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-t-lg transition-colors"
                      >
                        <Pin className="w-4 h-4" />
                        <span>{post.isPinned ? 'Desfijar' : 'Fijar'}</span>
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* Comments List */}
                  {comments.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {parentComments.map((comment) => (
                        <div key={comment.id}>
                          {/* Main Comment */}
                          <div className="flex gap-2">
                            <Link href={`/perfil/${comment.author?.username}`}>
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{
                                  background: comment.author?.avatarUrl
                                    ? `url(${comment.author.avatarUrl}) center/cover`
                                    : 'linear-gradient(135deg, #6366f1, #ec4899)',
                                }}
                              >
                                {!comment.author?.avatarUrl && comment.author?.username?.[0]?.toUpperCase()}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-800 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/perfil/${comment.author?.username}`}
                                    className="text-sm font-medium hover:text-purple-400 transition-colors"
                                  >
                                    {comment.author?.displayName || comment.author?.username}
                                  </Link>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment.createdAt), {
                                      addSuffix: true,
                                      locale: es,
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 mt-1 break-words">
                                  {comment.content}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 ml-2">
                                {isMember && isAuthenticated && (
                                  <button
                                    onClick={() => handleReplyClick(comment)}
                                    className="text-xs text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                                  >
                                    <Reply className="w-3 h-3" />
                                    Responder
                                  </button>
                                )}
                                {(currentUserId === comment.authorId || canModerate) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Replies to this comment */}
                          {getReplies(comment.id).length > 0 && (
                            <div className="ml-10 mt-2 space-y-2 border-l-2 border-gray-800 pl-3">
                              {getReplies(comment.id).map((reply) => (
                                <div key={reply.id} className="flex gap-2">
                                  <Link href={`/perfil/${reply.author?.username}`}>
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                      style={{
                                        background: reply.author?.avatarUrl
                                          ? `url(${reply.author.avatarUrl}) center/cover`
                                          : 'linear-gradient(135deg, #6366f1, #ec4899)',
                                      }}
                                    >
                                      {!reply.author?.avatarUrl && reply.author?.username?.[0]?.toUpperCase()}
                                    </div>
                                  </Link>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-gray-800/50 rounded-lg px-2 py-1.5">
                                      <div className="flex items-center gap-2">
                                        <Link
                                          href={`/perfil/${reply.author?.username}`}
                                          className="text-xs font-medium hover:text-purple-400 transition-colors"
                                        >
                                          {reply.author?.displayName || reply.author?.username}
                                        </Link>
                                        {reply.replyToUsername && (
                                          <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <CornerDownRight className="w-3 h-3" />
                                            @{reply.replyToUsername}
                                          </span>
                                        )}
                                        <span className="text-[10px] text-gray-500">
                                          {formatDistanceToNow(new Date(reply.createdAt), {
                                            addSuffix: true,
                                            locale: es,
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 mt-0.5 break-words">
                                        {reply.content}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 ml-2">
                                      {isMember && isAuthenticated && (
                                        <button
                                          onClick={() => handleReplyClick(reply)}
                                          className="text-[10px] text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                                        >
                                          <Reply className="w-2.5 h-2.5" />
                                          Responder
                                        </button>
                                      )}
                                      {(currentUserId === reply.authorId || canModerate) && (
                                        <button
                                          onClick={() => handleDeleteComment(reply.id)}
                                          className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                          Eliminar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-3">
                      No hay comentarios aún
                    </p>
                  )}

                  {/* Add Comment / Reply */}
                  {isMember && isAuthenticated && (
                    <div className="space-y-2">
                      {/* Reply indicator */}
                      {replyingTo && (
                        <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Reply className="w-3 h-3" />
                            Respondiendo a <span className="text-purple-400 font-medium">@{replyingTo.author?.username}</span>
                          </span>
                          <button
                            onClick={cancelReply}
                            className="text-gray-500 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          ref={commentInputRef}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={replyingTo ? `Responder a @${replyingTo.author?.username}...` : "Escribe un comentario..."}
                          className="bg-gray-800 border-gray-700 text-sm"
                          maxLength={500}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment();
                            }
                            if (e.key === 'Escape' && replyingTo) {
                              cancelReply();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || submittingComment}
                          size="sm"
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

                  {!isMember && (
                    <p className="text-sm text-gray-500 text-center">
                      Únete a la comunidad para comentar
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
