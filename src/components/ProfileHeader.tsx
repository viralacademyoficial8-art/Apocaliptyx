'use client';

import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Trophy,
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  Share2,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import toast from 'react-hot-toast';
import { PROPHET_LEVELS } from '@/types';

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const { data: session } = useSession();
  const { user: storeUser } = useAuthStore();
  // Usar session de NextAuth como fuente primaria, Zustand como fallback
  const currentUser = storeUser || (session?.user ? { id: session.user.id } : null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers);

  const handleFollow = () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      toast.success(`Dejaste de seguir a ${user.username}`);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      toast.success(`Ahora sigues a ${user.username}`);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/perfil/${user.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${user.displayName} en Apocaliptyx`,
          text: `Mira el perfil de ${user.displayName}, nivel ${PROPHET_LEVELS[user.prophetLevel].name}`,
          url,
        });
      } catch (err) {
        // usuario canceló
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado al portapapeles');
    }
  };

  const prophetLevel = PROPHET_LEVELS[user.prophetLevel];

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className="relative mx-auto md:mx-0">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 border-gray-700 shadow-2xl">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-br from-purple-600 to-pink-600">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Prophet Level Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <Badge
                className={`${prophetLevel.color} bg-gray-900 border-2 border-gray-700 px-3 py-1 shadow-lg text-xs sm:text-sm`}
              >
                <Crown className="w-3 h-3 mr-1" />
                {prophetLevel.name}
              </Badge>
            </div>
          </div>

          {/* User Info + Actions */}
          <div className="flex-1 w-full pt-4 md:pt-0">
            {/* Nombre + botones */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 truncate">
                  {user.displayName}
                </h1>
                <p className="text-gray-400 text-sm sm:text-base break-all">
                  @{user.username}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-start sm:justify-end w-full sm:w-auto">
                {!isOwnProfile ? (
                  <Button
                    onClick={handleFollow}
                    className={`flex-1 sm:flex-none ${
                      isFollowing
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Siguiendo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Seguir
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => (window.location.href = '/configuracion')}
                    variant="outline"
                    className="flex-1 sm:flex-none border-gray-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </Button>
                )}

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="border-gray-700 flex-none"
                  aria-label="Compartir perfil"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                  <Trophy className="w-4 h-4" />
                  Reputación
                </div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {user.reputationScore.toLocaleString()}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Win Rate
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-400">
                  {user.winRate.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="text-gray-400 text-xs sm:text-sm mb-1">
                  Escenarios
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {user.scenariosWon}/{user.scenariosCreated}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500">
                  ganados/creados
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Comunidad
                </div>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-bold">{followersCount}</span>
                    <span className="text-gray-500 ml-1">seguidores</span>
                  </div>
                  <div>
                    <span className="font-bold">{user.following}</span>
                    <span className="text-gray-500 ml-1">siguiendo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}
