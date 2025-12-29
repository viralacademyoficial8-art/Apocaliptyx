'use client';

import { AdminActivity, getActivityIcon } from '@/lib/admin-data';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

export function ActivityFeed({
  activities,
  maxItems = 10,
}: {
  activities: AdminActivity[];
  maxItems?: number;
}) {
  return (
    <div className="space-y-3">
      {activities.slice(0, maxItems).map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50"
        >
          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.description}</span>
              {activity.username && (
                <span className="text-purple-400"> @{activity.username}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
