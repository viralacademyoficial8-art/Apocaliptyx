'use client';

import { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Radio,
  Heart,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StreamPlayerProps {
  streamUrl?: string;
  thumbnailUrl?: string;
  title: string;
  streamerName: string;
  streamerUsername: string;
  streamerAvatar?: string;
  isLive: boolean;
  viewersCount: number;
  likesCount: number;
  isLiked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export function StreamPlayer({
  streamUrl,
  thumbnailUrl,
  title,
  streamerName,
  streamerUsername,
  streamerAvatar,
  isLive,
  viewersCount,
  likesCount,
  isLiked = false,
  onLike,
  onShare,
  onFollow,
  isFollowing = false,
}: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);

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

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {/* Video Player */}
      <div
        className="relative aspect-video"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {streamUrl ? (
          <video
            ref={videoRef}
            src={streamUrl}
            poster={thumbnailUrl}
            className="w-full h-full object-contain bg-black"
            onClick={togglePlay}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Radio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isLive ? 'Cargando stream...' : 'Stream no disponible'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1 bg-red-600 px-3 py-1 rounded-lg text-sm font-bold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              EN VIVO
            </span>
            <span className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
              {formatNumber(viewersCount)} viendo
            </span>
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && streamUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold truncate">{title}</h2>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Play className="w-8 h-8 ml-1" />
              </button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  <div className="w-24">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stream Info */}
      <div className="p-4 bg-card">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar className="w-12 h-12 border-2 border-purple-500">
              <AvatarImage src={streamerAvatar} />
              <AvatarFallback>{streamerUsername[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{streamerName}</h3>
              <p className="text-sm text-muted-foreground">@{streamerUsername}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLike}
              className={`border-border ${
                isLiked ? 'bg-red-500/20 border-red-500 text-red-400' : ''
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {formatNumber(likesCount)}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="border-border"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Compartir
            </Button>

            <Button
              onClick={onFollow}
              className={
                isFollowing
                  ? 'bg-muted hover:bg-muted'
                  : 'bg-purple-600 hover:bg-purple-700'
              }
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
