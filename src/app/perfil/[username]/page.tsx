// src/app/perfil/[username]/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import {
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  ProfileHistory,
  ProfileAchievements,
  ProfileActivity,
} from '@/components/perfil';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const {
    currentProfile,
    viewingProfile,
    activeTab,
    loadProfile,
    followUser,
    unfollowUser,
    isLoading,
  } = useProfileStore();

  useEffect(() => {
    loadProfile(username);
  }, [username, loadProfile]);

  // Si es el perfil propio, mostrar currentProfile
  const isOwnProfile = currentProfile?.username === username;
  const profile = isOwnProfile ? currentProfile : viewingProfile;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Usuario no encontrado</p>
          <p className="text-gray-400">@{username} no existe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800">
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onFollow={() => followUser(profile.id)}
            onUnfollow={() => unfollowUser(profile.id)}
          />
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-6 py-6 border-b border-gray-800 bg-gray-900/50">
          <ProfileStats stats={profile.stats} />
        </div>

        {/* Tabs */}
        <div className="bg-gray-900/50 px-4 sm:px-6">
          <ProfileTabs />
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProfileActivity />
              <ProfileAchievements />
            </div>
          )}
          {activeTab === 'history' && <ProfileHistory />}
          {activeTab === 'achievements' && <ProfileAchievements />}
          {activeTab === 'activity' && <ProfileActivity />}
          {/* Inventory solo visible en perfil propio */}
          {activeTab === 'inventory' && isOwnProfile && (
            <div className="text-center py-12">
              <p className="text-gray-400">El inventario solo es visible para ti</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}