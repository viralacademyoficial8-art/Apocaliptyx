// src/components/perfil/ProfileTabs.tsx

'use client';

import { Package, History, Trophy, Activity, LayoutGrid } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';

const tabs = [
  { id: 'overview', label: 'General', icon: LayoutGrid },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'achievements', label: 'Logros', icon: Trophy },
  { id: 'activity', label: 'Actividad', icon: Activity },
] as const;

export function ProfileTabs() {
  const { activeTab, setActiveTab } = useProfileStore();

  return (
    <div className="border-b border-gray-800">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-colors relative ${
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}