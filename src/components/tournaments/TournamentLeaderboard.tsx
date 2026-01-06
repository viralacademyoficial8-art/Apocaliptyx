'use client';

import { Trophy, Medal, TrendingUp, Target } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface Participant {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  predictionsMade: number;
  correctPredictions: number;
  accuracy: number;
  points: number;
  rank: number;
  prizeWon?: number;
}

interface TournamentLeaderboardProps {
  participants: Participant[];
  currentUserId?: string;
  showPrizes?: boolean;
  prizes?: { position: number; amount: number }[];
}

export function TournamentLeaderboard({
  participants,
  currentUserId,
  showPrizes = false,
  prizes = [],
}: TournamentLeaderboardProps) {
  const getPrizeForPosition = (position: number) => {
    const prize = prizes.find((p) => p.position === position);
    return prize?.amount || 0;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-yellow-900" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <Medal className="w-4 h-4 text-gray-700" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
          <Medal className="w-4 h-4 text-orange-900" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
        {rank}
      </div>
    );
  };

  const getRowBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-purple-500/20 border-purple-500';
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/50';
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/50';
    if (rank === 3) return 'bg-orange-500/10 border-orange-500/50';
    return 'bg-gray-800/50 border-gray-700';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Tabla de posiciones
        </h3>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Jugador</div>
        <div className="col-span-2 text-center">Pred.</div>
        <div className="col-span-2 text-center">Precisión</div>
        <div className="col-span-2 text-center">Puntos</div>
        {showPrizes && <div className="col-span-1 text-right">Premio</div>}
      </div>

      {/* Participants */}
      <div className="divide-y divide-gray-700/50">
        {participants.map((participant) => {
          const isCurrentUser = participant.userId === currentUserId;
          const prize = getPrizeForPosition(participant.rank);

          return (
            <div
              key={participant.userId}
              className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-l-2 ${getRowBg(
                participant.rank,
                isCurrentUser
              )}`}
            >
              {/* Rank */}
              <div className="col-span-1">{getRankBadge(participant.rank)}</div>

              {/* User */}
              <div className="col-span-4">
                <Link
                  href={`/perfil/${participant.username}`}
                  className="flex items-center gap-2 hover:text-purple-400 transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={participant.avatarUrl} />
                    <AvatarFallback>
                      {participant.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {participant.displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      @{participant.username}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Predictions */}
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Target className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">
                    {participant.correctPredictions}/{participant.predictionsMade}
                  </span>
                </div>
              </div>

              {/* Accuracy */}
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-sm text-green-400">
                    {participant.accuracy.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="col-span-2 text-center">
                <span className="font-bold text-purple-400">
                  {participant.points.toLocaleString()}
                </span>
              </div>

              {/* Prize */}
              {showPrizes && (
                <div className="col-span-1 text-right">
                  {prize > 0 && (
                    <span className="text-yellow-400 font-bold text-sm">
                      {prize.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {participants.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay participantes aún</p>
        </div>
      )}
    </div>
  );
}
