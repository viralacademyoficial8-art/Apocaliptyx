'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { Trophy, Search } from 'lucide-react';
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
  isJoined?: boolean;
}

export default function TorneosPage() {
  const { user, refreshBalance } = useAuthStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'ended'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, [statusFilter]);

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/tournaments?${params.toString()}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setTournaments(data.tournaments || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      toast.error('Error al cargar torneos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const tournament = tournaments.find((t) => t.id === tournamentId);
      setTournaments(tournaments.map(t =>
        t.id === tournamentId
          ? { ...t, isJoined: true, participantsCount: t.participantsCount + 1 }
          : t
      ));

      toast.success(data.message || 'Te has inscrito al torneo');
      // Actualizar balance de AP coins si hubo fee de entrada
      await refreshBalance();
    } catch (error: unknown) {
      console.error('Error joining tournament:', error);
      toast.error(error instanceof Error ? error.message : 'Error al inscribirse');
    }
  };

  const handleLeaveTournament = async (tournamentId: string) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setTournaments(tournaments.map(t =>
        t.id === tournamentId
          ? { ...t, isJoined: false, participantsCount: Math.max(0, t.participantsCount - 1) }
          : t
      ));
      toast.success('Has abandonado el torneo');
    } catch (error) {
      console.error('Error leaving tournament:', error);
      toast.error('Error al abandonar el torneo');
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    if (searchQuery && !tournament.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, ended: 2, cancelled: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const joinedCount = tournaments.filter(t => t.isJoined).length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Torneos
          </h1>
          <p className="text-muted-foreground mt-1">
            Compite con otros profetas y gana premios increíbles
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Torneos activos</p>
            <p className="text-2xl font-bold text-green-400">
              {tournaments.filter((t) => t.status === 'active').length}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Próximos</p>
            <p className="text-2xl font-bold text-blue-400">
              {tournaments.filter((t) => t.status === 'upcoming').length}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Premio total</p>
            <p className="text-2xl font-bold text-yellow-400">
              {tournaments
                .filter((t) => t.status !== 'ended')
                .reduce((sum, t) => sum + t.prizePool, 0)
                .toLocaleString()}{' '}
              AP
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Mis torneos</p>
            <p className="text-2xl font-bold text-purple-400">{joinedCount}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar torneos..."
              className="pl-10 bg-muted border-border"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'upcoming', 'ended'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                size="sm"
                className={statusFilter === status ? 'bg-purple-600' : 'border-border'}
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
              <div key={i} className="bg-muted/50 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : sortedTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                isJoined={tournament.isJoined || false}
                onJoin={handleJoinTournament}
                onLeave={handleLeaveTournament}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No se encontraron torneos</p>
          </div>
        )}
      </div>
    </div>
  );
}
