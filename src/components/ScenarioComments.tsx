'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(`scenarioComments_${scenarioId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setComments(
        parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })),
      );
    } else {
      setComments([
        {
          id: 'sc_1',
          scenarioId,
          authorId: 'user_2',
          authorUsername: 'prophet_maria',
          authorDisplayName: 'María Vidente',
          authorAvatar:
            'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
          authorLevel: 'vidente',
          content:
            'Este escenario tiene mucho potencial. Creo que se va a cumplir antes de la fecha límite.',
          likes: ['user_1', 'user_3'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: 'sc_2',
          scenarioId,
          authorId: 'user_3',
          authorUsername: 'oracle_carlos',
          authorDisplayName: 'Carlos Oráculo',
          authorAvatar:
            'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
          authorLevel: 'oraculo',
          content:
            'No estoy tan seguro... hay muchos factores en contra. Pero buena predicción de todas formas 👍',
          likes: ['user_1'],
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ]);
    }
  }, [scenarioId]);

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
      await new Promise((resolve) => setTimeout(resolve, 500));

      const comment: ScenarioComment = {
        id: `sc_${Date.now()}`,
        scenarioId,
        authorId: user.id,
        authorUsername: user.username,
        authorDisplayName: user.displayName ?? user.username,
        authorAvatar: user.avatarUrl,
        authorLevel: user.prophetLevel,
        content: newComment.trim(),
        likes: [],
        createdAt: new Date(),
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      localStorage.setItem(
        `scenarioComments_${scenarioId}`,
        JSON.stringify(updatedComments),
      );
      setNewComment('');
      toast.success('Comentario publicado');
    } catch {
      toast.error('Error al publicar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

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
    localStorage.setItem(
      `scenarioComments_${scenarioId}`,
      JSON.stringify(updatedComments),
    );
  };

  const handleDelete = (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    const updatedComments = comments.filter((c) => c.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(
      `scenarioComments_${scenarioId}`,
      JSON.stringify(updatedComments),
    );
    toast.success('Comentario eliminado');
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
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
              className="bg-gray-800 border-gray-700 focus:border-blue-500 min-h-[80px]"
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
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-400 mb-2">
            Inicia sesión para comentar
          </p>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="border-gray-700"
          >
            Iniciar sesión
          </Button>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
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
            const prophetLevel = PROPHET_LEVELS[comment.authorLevel];
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
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
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
                        className={`${prophetLevel.color} border-gray-700 text-xs py-0`}
                      >
                        <Crown className="w-2 h-2 mr-1" />
                        {prophetLevel.name}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {timeAgo}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-1 ml-2">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs ${
                        hasLiked ? 'text-red-400' : 'text-gray-500'
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
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400"
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
