'use client';

import { useState, useEffect } from 'react';
import { Trophy, Search, Filter, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { useAuthStore } from '@/lib/stores';
import toast from 'react-hot-toast';

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

export default function TorneosPage() {
  const { user } = useAuthStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [joinedTournaments, setJoinedTournaments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'ended'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setIsLoading(true);
    // Mock data - replace with actual API call
    const now = new Date();
    const mockTournaments: Tournament[] = [
      {
        id: '1',
        name: 'Copa Crypto Enero 2026',
        description: 'El torneo más grande de predicciones crypto del mes. Demuestra tus habilidades prediciendo Bitcoin, Ethereum y más.',
        tournamentType: 'open',
        categoryName: 'Crypto',
        categoryIcon: '₿',
        entryFee: 100,
        prizePool: 50000,
        maxParticipants: 500,
        participantsCount: 342,
        minPredictions: 10,
        startDate: new Date(now.getTime() + 86400000 * 2).toISOString(),
        endDate: new Date(now.getTime() + 86400000 * 9).toISOString(),
        status: 'upcoming',
        prizes: [
          { position: 1, amount: 25000 },
          { position: 2, amount: 15000 },
          { position: 3, amount: 10000 },
        ],
      },
      {
        id: '2',
        name: 'Liga de Fútbol - Jornada 20',
        description: 'Predice los resultados de la jornada 20 de La Liga Española.',
        tournamentType: 'open',
        categoryName: 'Deportes',
        categoryIcon: '⚽',
        entryFee: 0,
        prizePool: 10000,
        maxParticipants: 1000,
        participantsCount: 756,
        minPredictions: 5,
        startDate: new Date(now.getTime() - 86400000).toISOString(),
        endDate: new Date(now.getTime() + 86400000 * 2).toISOString(),
        status: 'active',
        prizes: [
          { position: 1, amount: 5000 },
          { position: 2, amount: 3000 },
          { position: 3, amount: 2000 },
        ],
      },
      {
        id: '3',
        name: 'Tech Predictions Challenge',
        description: 'Predice los próximos movimientos de las empresas tech.',
        tournamentType: 'open',
        categoryName: 'Tecnología',
        categoryIcon: '💻',
        entryFee: 50,
        prizePool: 15000,
        participantsCount: 189,
        minPredictions: 8,
        startDate: new Date(now.getTime() + 86400000 * 5).toISOString(),
        endDate: new Date(now.getTime() + 86400000 * 12).toISOString(),
        status: 'upcoming',
        prizes: [
          { position: 1, amount: 7500 },
          { position: 2, amount: 4500 },
          { position: 3, amount: 3000 },
        ],
      },
      {
        id: '4',
        name: 'Esports Masters',
        description: 'Torneo de predicciones de esports: LoL, CS2, Valorant.',
        tournamentType: 'open',
        categoryName: 'Gaming',
        categoryIcon: '🎮',
        entryFee: 25,
        prizePool: 8000,
        maxParticipants: 200,
        participantsCount: 200,
        minPredictions: 5,
        startDate: new Date(now.getTime() - 86400000 * 7).toISOString(),
        endDate: new Date(now.getTime() - 86400000).toISOString(),
        status: 'ended',
        prizes: [
          { position: 1, amount: 4000 },
          { position: 2, amount: 2400 },
          { position: 3, amount: 1600 },
        ],
      },
    ];

    setTournaments(mockTournaments);
    setJoinedTournaments(['2']);
    setIsLoading(false);
  };

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (tournament?.entryFee && tournament.entryFee > 0) {
      toast.success(`Te has inscrito por ${tournament.entryFee} AP`);
    } else {
      toast.success('Te has inscrito al torneo');
    }
    setJoinedTournaments([...joinedTournaments, tournamentId]);
  };

  const handleLeaveTournament = async (tournamentId: string) => {
    setJoinedTournaments(joinedTournaments.filter((id) => id !== tournamentId));
    toast.success('Has abandonado el torneo');
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    if (searchQuery && !tournament.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && tournament.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, ended: 2, cancelled: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Torneos
          </h1>
          <p className="text-gray-400 mt-1">
            Compite con otros profetas y gana premios increíbles
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Torneos activos</p>
            <p className="text-2xl font-bold text-green-400">
              {tournaments.filter((t) => t.status === 'active').length}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Próximos</p>
            <p className="text-2xl font-bold text-blue-400">
              {tournaments.filter((t) => t.status === 'upcoming').length}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Premio total</p>
            <p className="text-2xl font-bold text-yellow-400">
              {tournaments
                .filter((t) => t.status !== 'ended')
                .reduce((sum, t) => sum + t.prizePool, 0)
                .toLocaleString()}{' '}
              AP
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Mis torneos</p>
            <p className="text-2xl font-bold text-purple-400">{joinedTournaments.length}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar torneos..."
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'upcoming', 'ended'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                size="sm"
                className={statusFilter === status ? 'bg-purple-600' : 'border-gray-700'}
              >
                {status === 'all'
                  ? 'Todos'
                  : status === 'active'
                  ? 'En curso'
                  : status === 'upcoming'
                  ? 'Próximos'
                  : 'Finalizados'}
              </Button>
            ))}
          </div>
        </div>

        {/* Tournaments Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : sortedTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                isJoined={joinedTournaments.includes(tournament.id)}
                onJoin={handleJoinTournament}
                onLeave={handleLeaveTournament}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No se encontraron torneos</p>
          </div>
        )}
      </div>
    </div>
  );
}
