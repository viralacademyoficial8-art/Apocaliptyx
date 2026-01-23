// src/components/perfil/ProfileActivity.tsx

'use client';

import { Activity } from 'lucide-react';
import { useProfileStore, ActivityItem } from '@/stores/profileStore';

function ActivityItemCard({ item }: { item: ActivityItem }) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
    return `hace ${Math.floor(seconds / 86400)} d`;
  };

  const typeColors: Record<string, string> = {
    PREDICTION: 'bg-blue-500/20 text-blue-400',
    ACHIEVEMENT: 'bg-yellow-500/20 text-yellow-400',
    PURCHASE: 'bg-green-500/20 text-green-400',
    LEVEL_UP: 'bg-purple-500/20 text-purple-400',
    STEAL: 'bg-orange-500/20 text-orange-400',
    STOLEN: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${typeColors[item.type]}`}>
        {item.icon}
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">{item.title}</p>
        <p className="text-muted-foreground text-sm">{item.description}</p>
      </div>
      <span className="text-muted-foreground text-sm whitespace-nowrap">{timeAgo(item.timestamp)}</span>
    </div>
  );
}

export function ProfileActivity() {
  const { activity } = useProfileStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-green-400" />
        <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
      </div>

      {/* List */}
      <div className="bg-card rounded-xl border border-border divide-y divide-gray-800">
        {activity.length > 0 ? (
          <div className="p-4">
            {activity.map((item) => (
              <ActivityItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  );
}