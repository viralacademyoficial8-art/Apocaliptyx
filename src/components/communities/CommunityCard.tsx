'use client';

import { Users, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  themeColor: string;
  isPublic: boolean;
  isVerified: boolean;
  membersCount: number;
  postsCount: number;
  categories: string[];
}

interface CommunityCardProps {
  community: Community;
  isMember?: boolean;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
}

export function CommunityCard({
  community,
  isMember = false,
  onJoin,
  onLeave,
}: CommunityCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors group">
      {/* Banner */}
      <div
        className="h-24 relative"
        style={{
          background: community.bannerUrl
            ? `url(${community.bannerUrl}) center/cover`
            : `linear-gradient(135deg, ${community.themeColor}60, ${community.themeColor}20)`,
        }}
      >
        {/* Icon */}
        <div className="absolute -bottom-6 left-4">
          {community.iconUrl ? (
            <img
              src={community.iconUrl}
              alt={community.name}
              className="w-14 h-14 rounded-xl border-4 border-gray-800 object-cover"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl border-4 border-gray-800 flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: community.themeColor }}
            >
              {community.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {!community.isPublic && (
            <span className="bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Privada
            </span>
          )}
          {community.isVerified && (
            <span className="bg-blue-500/20 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1 text-blue-400">
              <CheckCircle className="w-3 h-3" />
              Verificada
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-8">
        <h3 className="font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors">
          {community.name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {community.description}
        </p>

        {/* Categories */}
        {community.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {community.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {community.membersCount.toLocaleString()} miembros
          </span>
          <span>{community.postsCount.toLocaleString()} posts</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isMember ? (
            <>
              <Link href={`/foro/comunidad/${community.slug}`} className="flex-1">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Ver comunidad
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              {onLeave && (
                <Button
                  variant="outline"
                  onClick={() => onLeave(community.id)}
                  className="border-gray-600"
                >
                  Salir
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => onJoin?.(community.id)}
              className="w-full bg-gray-700 hover:bg-gray-600"
            >
              Unirse
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
