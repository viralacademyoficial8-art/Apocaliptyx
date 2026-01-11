"use client";

import { useState } from "react";
import { ForumPost, FORUM_TAGS, PROPHET_LEVELS } from "@/types";
import { useAuthStore, useForumStore } from "@/lib/stores";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Crown,
  Trash2,
  Flag,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LinkPreview, extractUrls } from "@/components/LinkPreview";

interface ForumPostCardProps {
  post: ForumPost;
  onOpenComments: (postId: string) => void;
}

export function ForumPostCard({ post, onOpenComments }: ForumPostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toggleLikePost, deletePost } = useForumStore();
  const [isLiking, setIsLiking] = useState(false);

  const hasLiked = user ? post.likes.includes(user.id) : false;
  const isAuthor = user?.id === post.authorId;
  const prophetLevel = PROPHET_LEVELS[post.authorLevel];

  const handleLike = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para dar like");
      return;
    }
    setIsLiking(true);
    toggleLikePost(post.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/foro?post=${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.authorDisplayName} en Apocaliptics`,
          text: post.content.substring(0, 100) + "...",
          url,
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles");
    }
  };

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este post?")) {
      deletePost(post.id);
      toast.success("Post eliminado");
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const processContent = (content: string) => {
    let processed = content.replace(
      /@(\w+)/g,
      '<span class="text-purple-400 hover:underline cursor-pointer">@$1</span>'
    );

    processed = processed.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" class="text-blue-500 hover:underline">$1</a>'
    );

    return processed;
  };

  return (
    <div className="bg-card/60 border border-border rounded-xl hover:border-muted-foreground/60 transition-all">
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push(`/perfil/${post.authorUsername}`)}
          >
            <Avatar className="w-12 h-12 border-2 border-border">
              <AvatarImage src={post.authorAvatar} alt={post.authorUsername} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-foreground">
                {post.authorUsername.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold hover:text-purple-400 transition-colors text-foreground">
                  {post.authorDisplayName}
                </span>
                <Badge
                  variant="outline"
                  className={`${prophetLevel.color} border-border text-xs`}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {prophetLevel.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>@{post.authorUsername}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-popover border border-border"
            >
              <DropdownMenuItem
                onClick={handleShare}
                className="cursor-pointer hover:bg-muted"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Copiar link
              </DropdownMenuItem>
              {isAuthor ? (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer hover:bg-red-500/10 text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                  <Flag className="w-4 h-4 mr-2" />
                  Reportar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4">
        <div
          className="text-foreground whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
        />

        {/* Link Previews */}
        {extractUrls(post.content).slice(0, 2).map((url, index) => (
          <div key={`${url}-${index}`} className="mt-3">
            <LinkPreview url={url} />
          </div>
        ))}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tagId) => {
              const tag = FORUM_TAGS.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tagId}
                  variant="outline"
                  className={`${tag.color} text-xs`}
                >
                  {tag.label}
                </Badge>
              );
            })}
          </div>
        )}

        {post.linkedScenarioId && (
          <div
            className="mt-4 p-3 bg-muted/60 border border-border rounded-lg cursor-pointer hover:border-purple-500/60 transition-colors"
            onClick={() => router.push("/dashboard")}
          >
            <div className="flex items-center gap-2 text-sm text-purple-500">
              <LinkIcon className="w-4 h-4" />
              <span>Ver escenario vinculado</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-1 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex-1 ${
              hasLiked ? "text-red-500" : "text-muted-foreground"
            } hover:text-red-500`}
          >
            <Heart
              className={`w-5 h-5 mr-2 ${hasLiked ? "fill-red-500" : ""}`}
            />
            <span>{post.likes.length}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenComments(post.id)}
            className="flex-1 text-muted-foreground hover:text-blue-500"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span>{post.commentsCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex-1 text-muted-foreground hover:text-green-500"
          >
            <Share2 className="w-5 h-5 mr-2" />
            <span>Compartir</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
