// src/app/perfil/page.tsx

'use client';

import { useProfileStore } from '@/stores/profileStore';
import {
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  ProfileInventory,
  ProfileHistory,
  ProfileAchievements,
  ProfileActivity,
} from '@/components/perfil';

export default function PerfilPage() {
  const { currentProfile, activeTab } = useProfileStore();

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800">
          <ProfileHeader profile={currentProfile} isOwnProfile={true} />
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-6 py-6 border-b border-gray-800 bg-gray-900/50">
          <ProfileStats stats={currentProfile.stats} />
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
          {activeTab === 'inventory' && <ProfileInventory />}
          {activeTab === 'history' && <ProfileHistory />}
          {activeTab === 'achievements' && <ProfileAchievements />}
          {activeTab === 'activity' && <ProfileActivity />}
        </div>
      </div>
    </div>
  );
}