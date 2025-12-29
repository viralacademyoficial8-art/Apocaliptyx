"use client";

import { useState, useEffect } from "react";
import { ForumComment, PROPHET_LEVELS } from "@/types";
import { useAuthStore, useForumStore } from "@/lib/stores";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Reply,
  Trash2,
  Send,
  Crown,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    comments,
    fetchComments,
    createComment,
    toggleLikeComment,
    deleteComment,
  } = useForumStore();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchComments(postId);
  }, [postId, fetchComments]);

  const handleSubmit = async (parentCommentId?: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para comentar");
      return;
    }

    if (!newComment.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment({
        postId,
        content: newComment.trim(),
        parentCommentId,
      });
      setNewComment("");
      setReplyingTo(null);
      toast.success("Comentario publicado");
    } catch (error) {
      toast.error("Error al publicar comentario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (commentId: string) => {
    if (confirm("¿Eliminar este comentario?")) {
      deleteComment(commentId);
      toast.success("Comentario eliminado");
    }
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: ForumComment;
    isReply?: boolean;
  }) => {
    const hasLiked = user ? comment.likes.includes(user.id) : false;
    const isAuthor = user?.id === comment.authorId;
    const prophetLevel = PROPHET_LEVELS[comment.authorLevel];

    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
      locale: es,
    });

    return (
      <div className={isReply ? "ml-12 mt-3" : ""}>
        <div className="flex gap-3">
          <Avatar
            className="w-8 h-8 cursor-pointer"
            onClick={() => router.push(`/perfil/${comment.authorUsername}`)}
          >
            <AvatarImage src={comment.authorAvatar} alt={comment.authorUsername} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-600 to-pink-600">
              {comment.authorUsername.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-semibold text-sm hover:text-purple-400 cursor-pointer"
                  onClick={() => router.push(`/perfil/${comment.authorUsername}`)}
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
                <span className="text-xs text-gray-500">{timeAgo}</span>
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
            </div>

            <div className="flex items-center gap-4 mt-1 ml-2">
              <button
                onClick={() => toggleLikeComment(comment.id)}
                className={`flex items-center gap-1 text-xs ${
                  hasLiked ? "text-red-400" : "text-gray-500"
                } hover:text-red-400`}
              >
                <Heart
                  className={`w-3 h-3 ${hasLiked ? "fill-red-400" : ""}`}
                />
                <span>{comment.likes.length}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400"
                >
                  <Reply className="w-3 h-3" />
                  <span>Responder</span>
                </button>
              )}

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

            {replyingTo === comment.id && (
              <div className="mt-3 flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Responder a @${comment.authorUsername}...`}
                  className="bg-gray-800 border-gray-700 focus:border-purple-500 text-sm min-h-[60px]"
                />
                <Button
                  onClick={() => handleSubmit(comment.id)}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {comments
          .filter((c) => c.parentCommentId === comment.id)
          .map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
      </div>
    );
  };

  const mainComments = comments.filter((c) => !c.parentCommentId);

  return (
    <div className="space-y-4">
      {user && (
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-600 to-pink-600">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={replyingTo ? "" : newComment}
              onChange={(e) => !replyingTo && setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="bg-gray-800 border-gray-700 focus:border-purple-500 text-sm min-h-[60px]"
              disabled={!!replyingTo}
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !newComment.trim() || !!replyingTo}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {mainComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay comentarios aún. ¡Sé el primero!</p>
          </div>
        ) : (
          mainComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
