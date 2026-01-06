'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Story {
  id: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
  isViewed: boolean;
}

interface UserStories {
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  hasUnviewed: boolean;
  storiesCount: number;
  stories: Story[];
}

interface StoriesBarProps {
  onCreateStory: () => void;
  onViewStories: (userStories: UserStories, startIndex?: number) => void;
  currentUserId?: string;
}

export function StoriesBar({ onCreateStory, onViewStories, currentUserId }: StoriesBarProps) {
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch('/api/stories?includeOwn=true');
      const data = await response.json();
      if (data.stories) {
        setUserStories(data.stories);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [userStories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const isCurrentUser = (userId: string) => currentUserId === userId;

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-700" />
              <div className="w-12 h-3 rounded bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 mb-4 relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-gray-700 p-1.5 rounded-full shadow-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-gray-700 p-1.5 rounded-full shadow-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Stories scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {userStories.map((user, index) => {
          const isOwn = isCurrentUser(user.userId);
          const hasStories = user.storiesCount > 0;

          return (
            <button
              key={user.userId}
              onClick={() => {
                if (isOwn && !hasStories) {
                  onCreateStory();
                } else if (hasStories) {
                  onViewStories(user);
                } else {
                  // Can't view others' empty stories
                }
              }}
              className="flex flex-col items-center gap-2 min-w-[72px] group"
            >
              {/* Avatar with ring */}
              <div className="relative">
                {/* Gradient ring for unviewed stories */}
                <div
                  className={cn(
                    'w-[68px] h-[68px] rounded-full p-[3px]',
                    hasStories && user.hasUnviewed
                      ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                      : hasStories
                      ? 'bg-gray-500'
                      : 'bg-transparent'
                  )}
                >
                  <div className="w-full h-full rounded-full bg-gray-900 p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName || user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                          {(user.displayName || user.username || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add button for own story */}
                {isOwn && (
                  <div
                    className={cn(
                      'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center',
                      'bg-blue-500 border-2 border-gray-900',
                      'group-hover:bg-blue-400 transition-colors'
                    )}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Username */}
              <span
                className={cn(
                  'text-xs truncate max-w-[72px] text-center',
                  isOwn ? 'text-gray-300' : 'text-gray-400',
                  'group-hover:text-white transition-colors'
                )}
              >
                {isOwn ? 'Tu historia' : user.displayName || user.username || 'Usuario'}
              </span>
            </button>
          );
        })}

        {/* Empty state - show if no stories at all */}
        {userStories.length === 0 && (
          <div className="flex items-center justify-center w-full py-4 text-gray-500">
            No hay stories disponibles. ¡Sé el primero en publicar!
          </div>
        )}
      </div>
    </div>
  );
}

export default StoriesBar;
