'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Send, Pause, Play, MoreHorizontal, Trash2, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

interface Story {
  id: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  backgroundColor?: string;
  textColor?: string;
  fontStyle?: string;
  viewsCount?: number;
  createdAt: string;
  isViewed: boolean;
  linkUrl?: string;
  linkPreview?: LinkPreviewData;
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

interface StoryViewerProps {
  userStories: UserStories;
  allUsersStories?: UserStories[];
  currentUserIndex?: number;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentUserId?: string;
}

const STORY_DURATION = 5000; // 5 seconds per story
const REACTIONS = ['❤️', '😍', '😂', '😮', '😢', '🔥', '👏', '💯'];

export function StoryViewer({
  userStories,
  allUsersStories,
  currentUserIndex = 0,
  onClose,
  onNext,
  onPrevious,
  currentUserId,
}: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<{ userId: string; username?: string; displayName?: string; avatarUrl?: string; viewedAt: string }[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);

  const currentStory = userStories.stories[currentStoryIndex];
  const isOwnStory = currentUserId === userStories.userId;

  // Mark story as viewed
  const markAsViewed = useCallback(async (storyId: string) => {
    try {
      await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  }, []);

  // Load viewers (for own stories)
  const loadViewers = useCallback(async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/view`);
      const data = await response.json();
      if (data.viewers) {
        setViewers(data.viewers);
      }
    } catch (error) {
      console.error('Error loading viewers:', error);
    }
  }, []);

  // Navigation functions - defined before useEffect that uses them
  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < userStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (onNext) {
      onNext();
    } else {
      onClose();
    }
  }, [currentStoryIndex, userStories.stories.length, onNext, onClose]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (onPrevious) {
      onPrevious();
    }
  }, [currentStoryIndex, onPrevious]);

  // Start progress timer
  useEffect(() => {
    if (!currentStory || isPaused) return;

    // Mark as viewed when story is displayed
    if (!currentStory.isViewed) {
      markAsViewed(currentStory.id);
    }

    // Load viewers if own story
    if (isOwnStory) {
      loadViewers(currentStory.id);
    }

    setProgress(0);
    const startTime = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        goToNextStory();
      }
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, isPaused, currentStory, isOwnStory, markAsViewed, loadViewers, goToNextStory]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          goToNextStory();
          break;
        case 'ArrowLeft':
          goToPreviousStory();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextStory, goToPreviousStory, onClose]);

  // Handle touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextStory();
      } else {
        goToPreviousStory();
      }
    }
  };

  // Handle click on left/right side
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      goToPreviousStory();
    } else if (x > width * 0.7) {
      goToNextStory();
    }
  };

  // Send reaction
  const sendReaction = async (reaction: string) => {
    try {
      await fetch(`/api/stories/${currentStory.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });
      setShowReactions(false);
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  // Delete story
  const deleteStory = async () => {
    if (!confirm('¿Estás seguro de eliminar este story?')) return;

    try {
      const response = await fetch(`/api/stories/${currentStory.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (userStories.stories.length === 1) {
          onClose();
        } else {
          goToNextStory();
        }
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  if (!currentStory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Story container */}
      <div
        className="relative w-full max-w-[420px] h-full max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {userStories.stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-gray-600/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width:
                    index < currentStoryIndex
                      ? '100%'
                      : index === currentStoryIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
              {userStories.avatarUrl ? (
                <img
                  src={userStories.avatarUrl}
                  alt={userStories.displayName || userStories.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                  {(userStories.displayName || userStories.username || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {userStories.displayName || userStories.username}
              </p>
              <p className="text-gray-400 text-xs">
                {formatDistanceToNow(new Date(currentStory.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(prev => !prev);
              }}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>

            {isOwnStory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(prev => !prev);
                }}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative"
              >
                <MoreHorizontal className="w-5 h-5" />
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden min-w-[150px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStory();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-gray-700 text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story content */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: currentStory.backgroundColor || '#1a1a2e' }}
        >
          {/* Link Preview Story */}
          {currentStory.linkPreview ? (
            <a
              href={currentStory.linkUrl || currentStory.linkPreview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Link Image */}
              {currentStory.linkPreview.image ? (
                <div className="flex-1 relative">
                  <img
                    src={currentStory.linkPreview.image}
                    alt={currentStory.linkPreview.title || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <Globe className="w-24 h-24 text-gray-600" />
                </div>
              )}

              {/* Link Info */}
              <div className="absolute bottom-20 left-0 right-0 p-6">
                {currentStory.linkPreview.siteName && (
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400 font-medium uppercase tracking-wide">
                      {currentStory.linkPreview.siteName}
                    </span>
                  </div>
                )}
                {currentStory.linkPreview.title && (
                  <h3 className="text-white font-bold text-xl line-clamp-2 mb-2">
                    {currentStory.linkPreview.title}
                  </h3>
                )}
                {currentStory.linkPreview.description && (
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                    {currentStory.linkPreview.description}
                  </p>
                )}
                {/* User's comment */}
                {currentStory.content && (
                  <p
                    className={cn(
                      'text-white mt-3 text-lg',
                      currentStory.fontStyle === 'bold' && 'font-bold',
                      currentStory.fontStyle === 'italic' && 'italic'
                    )}
                    style={{ color: currentStory.textColor || '#ffffff' }}
                  >
                    &ldquo;{currentStory.content}&rdquo;
                  </p>
                )}
                {/* Tap to open indicator */}
                <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  <span>Toca para abrir el enlace</span>
                </div>
              </div>
            </a>
          ) : currentStory.mediaUrl ? (
            currentStory.mediaType === 'video' ? (
              <video
                src={currentStory.mediaUrl}
                className="w-full h-full object-contain"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                className="w-full h-full object-contain"
              />
            )
          ) : currentStory.content ? (
            <div
              className={cn(
                'px-8 text-center max-w-full',
                currentStory.fontStyle === 'bold' && 'font-bold',
                currentStory.fontStyle === 'italic' && 'italic'
              )}
              style={{ color: currentStory.textColor || '#ffffff' }}
            >
              <p className="text-2xl leading-relaxed break-words">{currentStory.content}</p>
            </div>
          ) : null}
        </div>

        {/* Bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          {isOwnStory ? (
            // Show viewers for own story
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowViewers(true);
              }}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>{currentStory.viewsCount || 0} vistas</span>
            </button>
          ) : (
            // Show reaction button for others' stories
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactions(prev => !prev);
                }}
                className="flex-1 flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-3 text-white/80"
              >
                <Send className="w-5 h-5" />
                <span>Enviar mensaje</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sendReaction('❤️');
                }}
                className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-full text-white/80 hover:text-red-400 transition-colors"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Reactions popup */}
          {showReactions && (
            <div className="absolute bottom-20 left-4 right-4 bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 flex justify-around">
              {REACTIONS.map(reaction => (
                <button
                  key={reaction}
                  onClick={(e) => {
                    e.stopPropagation();
                    sendReaction(reaction);
                  }}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {reaction}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Viewers modal */}
        {showViewers && (
          <div
            className="absolute inset-0 z-30 bg-black/80 flex items-end"
            onClick={(e) => {
              e.stopPropagation();
              setShowViewers(false);
            }}
          >
            <div
              className="w-full bg-gray-900 rounded-t-xl max-h-[60vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold">
                  Vistas ({viewers.length})
                </h3>
                <button
                  onClick={() => setShowViewers(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[50vh]">
                {viewers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aún nadie ha visto este story</p>
                ) : (
                  viewers.map(viewer => (
                    <div key={viewer.userId} className="flex items-center gap-3 p-4 hover:bg-gray-800/50">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                        {viewer.avatarUrl ? (
                          <img
                            src={viewer.avatarUrl}
                            alt={viewer.displayName || viewer.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                            {(viewer.displayName || viewer.username || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {viewer.displayName || viewer.username}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(viewer.viewedAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation arrows (desktop) */}
        {onPrevious && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPreviousStory();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors hidden md:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNextStory();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors hidden md:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

export default StoryViewer;
