'use client';

import { useState } from 'react';
import { Camera, Music, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect } from 'react';

interface ProfileBannerProps {
  bannerUrl?: string | null;
  musicUrl?: string | null;
  musicTitle?: string | null;
  musicArtist?: string | null;
  isOwnProfile: boolean;
  onBannerChange?: (file: File) => void;
  themeColors?: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export function ProfileBanner({
  bannerUrl,
  musicUrl,
  musicTitle,
  musicArtist,
  isOwnProfile,
  onBannerChange,
  themeColors,
}: ProfileBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (musicUrl) {
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onBannerChange) {
      onBannerChange(file);
    }
  };

  const gradientStyle = themeColors ? {
    background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}40)`,
  } : {};

  return (
    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-xl">
      {/* Banner Image or Gradient */}
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900"
          style={gradientStyle}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

      {/* Edit Banner Button */}
      {isOwnProfile && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-card/80 border-border hover:bg-muted"
          >
            <Camera className="w-4 h-4 mr-2" />
            Cambiar banner
          </Button>
        </>
      )}

      {/* Profile Music Player */}
      {musicUrl && (
        <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-card/90 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
          <button
            onClick={toggleMusic}
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <div className="text-sm">
              <p className="font-medium text-foreground truncate max-w-[150px]">
                {musicTitle || 'Profile Music'}
              </p>
              {musicArtist && (
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {musicArtist}
                </p>
              )}
            </div>
          </div>
          {isPlaying && (
            <div className="flex items-center gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-purple-400 rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
