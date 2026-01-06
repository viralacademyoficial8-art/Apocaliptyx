'use client';

import { Trophy, Users, Calendar, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  tournamentType: 'open' | 'invite_only' | 'community';
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  entryFee: number;
  prizePool: number;
  maxParticipants?: number;
  participantsCount: number;
  minPredictions: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  prizes: {
    position: number;
    amount: number;
    percentage?: number;
  }[];
}

interface TournamentCardProps {
  tournament: Tournament;
  isJoined?: boolean;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
}

const statusColors = {
  upcoming: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  ended: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusLabels = {
  upcoming: 'Próximamente',
  active: 'En curso',
  ended: 'Finalizado',
  cancelled: 'Cancelado',
};

export function TournamentCard({
  tournament,
  isJoined = false,
  onJoin,
  onLeave,
}: TournamentCardProps) {
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  const now = new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getTimeRemaining = () => {
    if (tournament.status === 'upcoming') {
      const diff = startDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) return `Inicia en ${days}d ${hours}h`;
      return `Inicia en ${hours}h`;
    }
    if (tournament.status === 'active') {
      const diff = endDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) return `${days}d ${hours}h restantes`;
      return `${hours}h restantes`;
    }
    return null;
  };

  const spotsLeft = tournament.maxParticipants
    ? tournament.maxParticipants - tournament.participantsCount
    : null;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-colors">
      {/* Banner */}
      <div
        className="h-32 relative"
        style={{
          background: tournament.bannerUrl
            ? `url(${tournament.bannerUrl}) center/cover`
            : 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tournament.status]}`}>
            {statusLabels[tournament.status]}
          </span>
        </div>

        {/* Category Badge */}
        {tournament.categoryName && (
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
            {tournament.categoryIcon} {tournament.categoryName}
          </div>
        )}

        {/* Prize Pool */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">
              {tournament.prizePool.toLocaleString()} AP
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{tournament.name}</h3>

        {tournament.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {tournament.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>
              {tournament.participantsCount}
              {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Coins className="w-4 h-4" />
            <span>Entrada: {tournament.entryFee > 0 ? `${tournament.entryFee} AP` : 'Gratis'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
          </div>
          {getTimeRemaining() && (
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Clock className="w-4 h-4" />
              <span>{getTimeRemaining()}</span>
            </div>
          )}
        </div>

        {/* Spots Progress */}
        {tournament.maxParticipants && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Plazas</span>
              <span>{spotsLeft} disponibles</span>
            </div>
            <Progress
              value={(tournament.participantsCount / tournament.maxParticipants) * 100}
              className="h-1.5"
            />
          </div>
        )}

        {/* Prizes Preview */}
        {tournament.prizes.length > 0 && (
          <div className="flex gap-2 mb-4">
            {tournament.prizes.slice(0, 3).map((prize, i) => (
              <div
                key={prize.position}
                className={`flex-1 text-center p-2 rounded-lg ${
                  i === 0
                    ? 'bg-yellow-500/20 border border-yellow-500/50'
                    : i === 1
                    ? 'bg-gray-400/20 border border-gray-400/50'
                    : 'bg-orange-500/20 border border-orange-500/50'
                }`}
              >
                <p className="text-xs text-gray-400">#{prize.position}</p>
                <p className="font-bold text-sm">{prize.amount.toLocaleString()} AP</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {tournament.status !== 'ended' && tournament.status !== 'cancelled' && (
          <div className="flex gap-2">
            <Link href={`/torneos/${tournament.id}`} className="flex-1">
              <Button variant="outline" className="w-full border-gray-600">
                Ver detalles
              </Button>
            </Link>
            {isJoined ? (
              <Button
                variant="outline"
                onClick={() => onLeave?.(tournament.id)}
                className="border-green-500 text-green-400"
              >
                Inscrito
              </Button>
            ) : (
              <Button
                onClick={() => onJoin?.(tournament.id)}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={
                  tournament.status !== 'upcoming' ||
                  (spotsLeft !== null && spotsLeft <= 0)
                }
              >
                {spotsLeft !== null && spotsLeft <= 0 ? 'Lleno' : 'Unirse'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
