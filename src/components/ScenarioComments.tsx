'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScenarioComment, PROPHET_LEVELS } from '@/types';
import { useAuthStore } from '@/lib/stores';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Heart,
  Send,
  Loader2,
  Crown,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ScenarioCommentsProps {
  scenarioId: string;
}

export function ScenarioComments({ scenarioId }: ScenarioCommentsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [comments, setComments] = useState<ScenarioComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar comentarios desde la API
  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/comments`);
      const data = await response.json();

      if (data.comments) {
        setComments(
          data.comments.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          }))
        );
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comentar');
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al publicar comentario');
      }

      if (data.comment) {
        setComments((prev) => [
          ...prev,
          {
            ...data.comment,
            createdAt: new Date(data.comment.createdAt),
          },
        ]);
        setNewComment('');
        toast.success('Comentario publicado');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Error al publicar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    // Actualización optimista
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        const hasLiked = comment.likes.includes(user.id);
        return {
          ...comment,
          likes: hasLiked
            ? comment.likes.filter((id) => id !== user.id)
            : [...comment.likes, user.id],
        };
      }
      return comment;
    });
    setComments(updatedComments);

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/comments/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        // Revertir si falla
        loadComments();
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revertir en caso de error
      loadComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    // Actualización optimista
    const previousComments = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      const response = await fetch(
        `/api/scenarios/${scenarioId}/comments?commentId=${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        // Revertir si falla
        setComments(previousComments);
        toast.error('Error al eliminar comentario');
      } else {
        toast.success('Comentario eliminado');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setComments(previousComments);
      toast.error('Error al eliminar comentario');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          Comentarios
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        Comentarios ({comments.length})
      </h3>

      {/* New Comment */}
      {user ? (
        <div className="flex gap-3 mb-6">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="bg-purple-600">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="¿Qué opinas de este escenario?"
              className="bg-muted border-border focus:border-blue-500 min-h-[80px]"
              maxLength={500}
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700 self-end"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-muted-foreground mb-2">
            Inicia sesión para comentar
          </p>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="border-border"
          >
            Iniciar sesión
          </Button>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay comentarios aún. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const hasLiked = user
              ? comment.likes.includes(user.id)
              : false;
            const isAuthor = user?.id === comment.authorId;
            const prophetLevel = PROPHET_LEVELS[comment.authorLevel as keyof typeof PROPHET_LEVELS] || PROPHET_LEVELS.monividente;
            const timeAgo = formatDistanceToNow(
              new Date(comment.createdAt),
              {
                addSuffix: true,
                locale: es,
              },
            );

            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar
                  className="w-10 h-10 cursor-pointer"
                  onClick={() =>
                    router.push(`/perfil/${comment.authorUsername}`)
                  }
                >
                  <AvatarImage src={comment.authorAvatar} />
                  <AvatarFallback className="bg-purple-600">
                    {comment.authorUsername
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-semibold text-sm hover:text-purple-400 cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/perfil/${comment.authorUsername}`,
                          )
                        }
                      >
                        {comment.authorDisplayName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${prophetLevel.color} border-border text-xs py-0`}
                      >
                        <Crown className="w-2 h-2 mr-1" />
                        {prophetLevel.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-1 ml-2">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs ${
                        hasLiked ? 'text-red-400' : 'text-muted-foreground'
                      } hover:text-red-400`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          hasLiked ? 'fill-red-400' : ''
                        }`}
                      />
                      <span>{comment.likes.length}</span>
                    </button>

                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
