'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ReelCard } from './ReelCard';

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

interface ReelsFeedProps {
  reels: Reel[];
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  onLoadMore?: () => void;
}

export function ReelsFeed({
  reels,
  onLike,
  onBookmark,
  onShare,
  onComment,
  onLoadMore,
}: ReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (currentIndex >= reels.length - 3 && onLoadMore) {
        onLoadMore();
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Handle scroll/swipe
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;

      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex]);

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-card rounded-xl">
        <p className="text-muted-foreground">No hay reels disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-[400px] mx-auto" ref={containerRef}>
      {/* Navigation Buttons */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10 flex flex-col gap-1">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`p-2 rounded-full bg-black/50 backdrop-blur-sm transition-opacity ${
            currentIndex === 0 ? 'opacity-30' : 'opacity-100 hover:bg-black/70'
          }`}
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-10 flex flex-col gap-1">
        <button
          onClick={goToNext}
          disabled={currentIndex >= reels.length - 1}
          className={`p-2 rounded-full bg-black/50 backdrop-blur-sm transition-opacity ${
            currentIndex >= reels.length - 1
              ? 'opacity-30'
              : 'opacity-100 hover:bg-black/70'
          }`}
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
        {reels.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => {
          const actualIndex = Math.max(0, currentIndex - 2) + i;
          return (
            <div
              key={actualIndex}
              className={`w-1 h-4 rounded-full transition-all ${
                actualIndex === currentIndex
                  ? 'bg-white'
                  : 'bg-white/30'
              }`}
            />
          );
        })}
      </div>

      {/* Current Reel */}
      <ReelCard
        reel={reels[currentIndex]}
        isActive={true}
        onLike={onLike}
        onBookmark={onBookmark}
        onShare={onShare}
        onComment={onComment}
      />

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
        {currentIndex + 1} / {reels.length}
      </div>
    </div>
  );
}
