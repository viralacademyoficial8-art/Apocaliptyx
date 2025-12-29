// src/components/perfil/ProfileHeader.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Settings, Share2, UserPlus, UserMinus, MessageCircle,
  CheckCircle, Crown, Check, Twitter, MoreHorizontal,
} from 'lucide-react';
import { UserProfile } from '@/stores/profileStore';
import { LevelProgress } from './LevelProgress';
import { BadgeDisplay } from './BadgeDisplay';
import Link from 'next/link';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onFollow,
  onUnfollow,
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/perfil/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAvatarFrame = () => {
    if (profile.customization.avatarFrame === 'golden') {
      return 'ring-4 ring-yellow-500 shadow-lg shadow-yellow-500/30';
    }
    if (profile.customization.avatarFrame === 'purple') {
      return 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/30';
    }
    return 'ring-4 ring-gray-700';
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 rounded-t-2xl overflow-hidden relative">
        {profile.bannerUrl ? (
          <Image
            src={profile.bannerUrl}
            alt="Banner"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, 1200px"
          />
        ) : (
          <div className="w-full h-full bg-[url('/grid.svg')] opacity-20" />
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 sm:-top-20 left-6">
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-800 ${getAvatarFrame()} overflow-hidden relative`}
          >
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.username}
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl">
                {profile.displayName?.[0] || profile.username[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          {isOwnProfile ? (
            <>
              <Link
                href="/perfil/editar"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Editar perfil</span>
              </Link>
              <button
                onClick={copyProfileLink}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <>
              {profile.isFollowing ? (
                <button
                  onClick={onUnfollow}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-600 text-white rounded-lg transition-colors group"
                >
                  <UserMinus className="w-4 h-4" />
                  <span className="group-hover:hidden">Siguiendo</span>
                  <span className="hidden group-hover:inline">Dejar de seguir</span>
                </button>
              ) : (
                <button
                  onClick={onFollow}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Seguir
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 sm:mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {profile.displayName || profile.username}
              </h1>
              {profile.isVerified && (
                <CheckCircle className="w-6 h-6 text-blue-400 fill-blue-400" />
              )}
              {profile.isPremium && <Crown className="w-6 h-6 text-yellow-400" />}
            </div>

            {profile.activeTitle && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-full w-fit">
                {profile.activeTitle}
              </span>
            )}
          </div>

          <p className="text-gray-400 mt-1">@{profile.username}</p>

          {profile.bio && <p className="text-gray-300 mt-4 max-w-2xl">{profile.bio}</p>}

          {profile.badges.length > 0 && (
            <div className="mt-4">
              <BadgeDisplay badges={profile.badges} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold">{profile.followersCount.toLocaleString()}</span>
              <span className="text-gray-400">seguidores</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white font-bold">{profile.followingCount.toLocaleString()}</span>
              <span className="text-gray-400">siguiendo</span>
            </div>
            {isOwnProfile && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 font-bold">{profile.apCoins.toLocaleString()}</span>
                <span className="text-gray-400">AP Coins</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-purple-400 font-bold">#{profile.stats.rank}</span>
              <span className="text-gray-400">ranking</span>
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <LevelProgress level={profile.level} xp={profile.xp} xpToNextLevel={profile.xpToNextLevel} />
          </div>

          {(profile.socialLinks.twitter || profile.socialLinks.discord) && (
            <div className="flex items-center gap-4 mt-4">
              {profile.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${profile.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">@{profile.socialLinks.twitter}</span>
                </a>
              )}
              {profile.socialLinks.discord && (
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="text-lg">💬</span>
                  <span className="text-sm">{profile.socialLinks.discord}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
