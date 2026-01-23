'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { Video, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReelsFeed } from '@/components/reels/ReelsFeed';
import { CreateReelModal } from '@/components/reels/CreateReelModal';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import toast from 'react-hot-toast';

interface Reel {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  duration: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags: string[];
  createdAt: string;
}

export default function ReelsPage() {
  const { user } = useAuthStore();
  const [reels, setReels] = useState<Reel[]>([]);
  const [filter, setFilter] = useState<'foryou' | 'following' | 'trending'>('foryou');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReels();
  }, [filter]);

  const loadReels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reels?filter=${filter}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setReels(data.reels || []);
    } catch (error) {
      console.error('Error loading reels:', error);
      toast.error('Error al cargar reels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (reelId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    try {
      const method = reel.isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/reels/${reelId}/like`, { method });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setReels(
        reels.map((r) =>
          r.id === reelId
            ? {
                ...r,
                isLiked: !r.isLiked,
                likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
              }
            : r
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Error al dar like');
    }
  };

  const handleBookmark = async (reelId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setReels(
      reels.map((reel) =>
        reel.id === reelId
          ? { ...reel, isBookmarked: !reel.isBookmarked }
          : reel
      )
    );
    const reel = reels.find((r) => r.id === reelId);
    toast.success(reel?.isBookmarked ? 'Eliminado de guardados' : 'Guardado');
  };

  const handleShare = async (reelId: string) => {
    const url = `${window.location.origin}/reels/${reelId}`;
    if (navigator.share) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado');
    }
  };

  const handleComment = (reelId: string) => {
    toast('Comentarios próximamente', { icon: '💬' });
  };

  const handleCreateReel = async (data: {
    videoFile: File;
    caption: string;
    tags: string[];
  }) => {
    try {
      const formData = new FormData();
      formData.append('video', data.videoFile);
      formData.append('caption', data.caption);
      formData.append('tags', JSON.stringify(data.tags));

      const response = await fetch('/api/reels', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.error) throw new Error(result.error);

      toast.success('Reel publicado exitosamente');
      loadReels();
    } catch (error) {
      console.error('Error creating reel:', error);
      toast.error('Error al publicar reel');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="w-8 h-8 text-purple-400" />
              Reels
            </h1>
            <p className="text-muted-foreground mt-1">
              Videos cortos de predicciones y análisis
            </p>
          </div>
          {user && <CreateReelModal onCreateReel={handleCreateReel} />}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === 'foryou' ? 'default' : 'outline'}
            onClick={() => setFilter('foryou')}
            className={filter === 'foryou' ? 'bg-purple-600' : 'border-border'}
          >
            Para ti
          </Button>
          <Button
            variant={filter === 'following' ? 'default' : 'outline'}
            onClick={() => setFilter('following')}
            className={filter === 'following' ? 'bg-purple-600' : 'border-border'}
          >
            <Users className="w-4 h-4 mr-1" />
            Siguiendo
          </Button>
          <Button
            variant={filter === 'trending' ? 'default' : 'outline'}
            onClick={() => setFilter('trending')}
            className={filter === 'trending' ? 'bg-purple-600' : 'border-border'}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Tendencias
          </Button>
        </div>

        {/* Reels Feed */}
        {isLoading ? (
          <div className="max-w-[400px] mx-auto">
            <div className="bg-muted/50 rounded-xl aspect-[9/16] max-h-[600px] animate-pulse" />
          </div>
        ) : reels.length > 0 ? (
          <ReelsFeed
            reels={reels}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onShare={handleShare}
            onComment={handleComment}
            onLoadMore={() => {}}
          />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay reels disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
