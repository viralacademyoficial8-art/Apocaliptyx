'use client';

import { useState, useEffect } from 'react';
import { Video, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReelsFeed } from '@/components/reels/ReelsFeed';
import { CreateReelModal } from '@/components/reels/CreateReelModal';
import { useAuthStore } from '@/lib/stores';
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
    // Mock data - replace with actual API call
    const mockReels: Reel[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'cryptomaster',
        displayName: 'Crypto Master',
        avatarUrl: '/avatars/user1.jpg',
        videoUrl: 'https://example.com/reel1.mp4',
        thumbnailUrl: '/thumbnails/reel1.jpg',
        caption: '¡Bitcoin va a romper los 100K! Aquí mi análisis completo 📈',
        duration: 45,
        viewsCount: 15420,
        likesCount: 2340,
        commentsCount: 156,
        sharesCount: 89,
        isLiked: false,
        isBookmarked: false,
        tags: ['bitcoin', 'crypto', 'trading'],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'user2',
        username: 'sportsguru',
        displayName: 'Sports Guru',
        avatarUrl: '/avatars/user2.jpg',
        videoUrl: 'https://example.com/reel2.mp4',
        thumbnailUrl: '/thumbnails/reel2.jpg',
        caption: 'Mi predicción para el clásico de mañana ⚽',
        duration: 30,
        viewsCount: 8750,
        likesCount: 1230,
        commentsCount: 89,
        sharesCount: 45,
        isLiked: true,
        isBookmarked: false,
        tags: ['futbol', 'laliga', 'predicciones'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        userId: 'user3',
        username: 'techprophet',
        displayName: 'Tech Prophet',
        avatarUrl: '/avatars/user3.jpg',
        videoUrl: 'https://example.com/reel3.mp4',
        thumbnailUrl: '/thumbnails/reel3.jpg',
        caption: '¿El nuevo iPhone tendrá esta función? 🤔',
        duration: 60,
        viewsCount: 5600,
        likesCount: 890,
        commentsCount: 67,
        sharesCount: 23,
        isLiked: false,
        isBookmarked: true,
        tags: ['apple', 'iphone', 'tech'],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    setReels(mockReels);
    setIsLoading(false);
  };

  const handleLike = async (reelId: string) => {
    setReels(
      reels.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              isLiked: !reel.isLiked,
              likesCount: reel.isLiked ? reel.likesCount - 1 : reel.likesCount + 1,
            }
          : reel
      )
    );
  };

  const handleBookmark = async (reelId: string) => {
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
    // Open comment modal
    toast('Comentarios próximamente', { icon: '💬' });
  };

  const handleCreateReel = async (data: {
    videoFile: File;
    caption: string;
    tags: string[];
  }) => {
    toast.success('Reel publicado exitosamente');
    loadReels();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="w-8 h-8 text-purple-400" />
              Reels
            </h1>
            <p className="text-gray-400 mt-1">
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
            className={filter === 'foryou' ? 'bg-purple-600' : 'border-gray-700'}
          >
            Para ti
          </Button>
          <Button
            variant={filter === 'following' ? 'default' : 'outline'}
            onClick={() => setFilter('following')}
            className={filter === 'following' ? 'bg-purple-600' : 'border-gray-700'}
          >
            <Users className="w-4 h-4 mr-1" />
            Siguiendo
          </Button>
          <Button
            variant={filter === 'trending' ? 'default' : 'outline'}
            onClick={() => setFilter('trending')}
            className={filter === 'trending' ? 'bg-purple-600' : 'border-gray-700'}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Tendencias
          </Button>
        </div>

        {/* Reels Feed */}
        {isLoading ? (
          <div className="max-w-[400px] mx-auto">
            <div className="bg-gray-800/50 rounded-xl aspect-[9/16] max-h-[600px] animate-pulse" />
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
          <div className="text-center py-16 text-gray-400">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay reels disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
