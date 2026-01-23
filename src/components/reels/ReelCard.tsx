'use client';

import { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Bookmark } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

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

interface ReelCardProps {
  reel: Reel;
  isActive?: boolean;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
}

export function ReelCard({
  reel,
  isActive = false,
  onLike,
  onBookmark,
  onShare,
  onComment,
}: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-[9/16] max-h-[600px]">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* User Info (Bottom Left) */}
      <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <Link href={`/perfil/${reel.username}`} className="flex items-center gap-2 mb-2">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={reel.avatarUrl} />
            <AvatarFallback>{reel.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white text-sm">{reel.displayName}</p>
            <p className="text-xs text-foreground">@{reel.username}</p>
          </div>
        </Link>

        {/* Caption */}
        {reel.caption && (
          <p className="text-sm text-foreground mb-2 line-clamp-2">{reel.caption}</p>
        )}

        {/* Tags */}
        {reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reel.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-blue-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions (Right Side) */}
      <div className="absolute right-2 bottom-20 flex flex-col gap-4">
        {/* Like */}
        <button
          onClick={() => onLike?.(reel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              reel.isLiked ? 'bg-red-500' : 'bg-black/50 backdrop-blur-sm'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${reel.isLiked ? 'fill-white text-white' : 'text-white'}`}
            />
          </div>
          <span className="text-xs text-white font-medium">
            {formatCount(reel.likesCount)}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={() => onComment?.(reel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-white font-medium">
            {formatCount(reel.commentsCount)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={() => onShare?.(reel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-white font-medium">
            {formatCount(reel.sharesCount)}
          </span>
        </button>

        {/* Bookmark */}
        <button
          onClick={() => onBookmark?.(reel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              reel.isBookmarked ? 'bg-yellow-500' : 'bg-black/50 backdrop-blur-sm'
            }`}
          >
            <Bookmark
              className={`w-5 h-5 ${reel.isBookmarked ? 'fill-white text-white' : 'text-white'}`}
            />
          </div>
        </button>

        {/* Mute Toggle */}
        <button onClick={toggleMute} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Views */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
        {formatCount(reel.viewsCount)} vistas
      </div>
    </div>
  );
}
