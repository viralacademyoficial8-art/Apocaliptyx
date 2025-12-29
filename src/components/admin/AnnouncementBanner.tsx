'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface AnnouncementBannerProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'promo' | 'maintenance';
  dismissible?: boolean;
  onDismiss?: () => void;
  onClick?: () => void;
}

export function AnnouncementBanner({
  id,
  title,
  message,
  type,
  dismissible = true,
  onDismiss,
  onClick,
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(`announcement-dismissed-${id}`);
    if (dismissed) setIsVisible(false);
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`announcement-dismissed-${id}`, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  const typeStyles: Record<string, string> = {
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
    success: 'bg-green-500/10 border-green-500/50 text-green-400',
    promo:
      'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-400',
    maintenance: 'bg-orange-500/10 border-orange-500/50 text-orange-400',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'border-b px-4 py-3 flex items-center justify-between gap-4',
              typeStyles[type],
              onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
            )}
            onClick={onClick}
          >
            <div className="flex-1 min-w-0">
              <span className="font-semibold">{title}</span>
              <span className="mx-2 text-current/60">·</span>
              <span className="text-sm opacity-90">{message}</span>
            </div>
            {dismissible && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
