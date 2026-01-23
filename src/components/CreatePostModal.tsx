'use client';

import { useState } from 'react';
import { useAuthStore, useForumStore, useScenarioStore } from '@/lib/stores';
import { FORUM_TAGS } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Send,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user } = useAuthStore();
  const { createPost } = useForumStore();
  const { scenarios } = useScenarioStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [linkedScenarioId, setLinkedScenarioId] = useState<string>('');

  if (!user) return null;

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    if (content.length > 1000) {
      toast.error('El contenido no puede exceder 1000 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        tags: selectedTags,
        linkedScenarioId: linkedScenarioId || undefined,
      });

      toast.success('¡Post publicado!');
      setContent('');
      setSelectedTags([]);
      setLinkedScenarioId('');
      onClose();
    } catch (error) {
      toast.error('Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      toast.error('Máximo 3 etiquetas');
    }
  };

  // Escenarios del usuario actual
  const userScenarios = scenarios.filter(
    (s) => s.currentHolderId === user.id,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        {/* Header simple (sin DialogHeader / DialogTitle) */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">Crear publicación</h2>
        </div>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user.displayName}</div>
              <div className="text-sm text-muted-foreground">@{user.username}</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué predicción o pensamiento quieres compartir con la comunidad?"
              className="bg-muted border-border focus:border-purple-500 min-h-[150px] text-base"
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Tip: Usa @usuario para mencionar a otros profetas
              </span>
              <span
                className={`text-xs ${
                  content.length > 900 ? 'text-red-400' : 'text-muted-foreground'
                }`}
              >
                {content.length}/1000
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Etiquetas (máx. 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {FORUM_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`
                    px-3 py-1 rounded-full text-sm border transition-all
                    ${
                      selectedTags.includes(tag.id)
                        ? tag.color
                        : 'border-border text-muted-foreground hover:border-border'
                    }
                  `}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link Scenario */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              Vincular escenario (opcional)
            </label>

            {/* Select nativo en lugar de shadcn Select */}
            <select
              value={linkedScenarioId}
              onChange={(e) => setLinkedScenarioId(e.target.value)}
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Ninguno</option>
              {userScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title.length > 50
                    ? `${scenario.title.substring(0, 50)}...`
                    : scenario.title}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              {/* Placeholder para imágenes futuras */}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                disabled
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !content.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publicar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
