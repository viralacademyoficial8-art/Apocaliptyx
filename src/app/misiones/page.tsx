'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { Target, Trophy, Flame, Clock, Calendar, Gift, Loader2 } from 'lucide-react';
import { MissionsPanel } from '@/components/gamification/MissionsPanel';
import { useAuthStore } from '@/lib/stores';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Mission {
  id: string;
  missionId: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  progress: number;
  target: number;
  rewards: {
    ap_coins?: number;
    xp?: number;
  };
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt?: string;
}

export default function MisionesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, refreshBalance } = useAuthStore();
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load missions
  useEffect(() => {
    if (status === 'authenticated') {
      loadMissions();
    }
  }, [status]);

  const loadMissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gamification/missions');
      if (!response.ok) throw new Error('Error al cargar misiones');

      const data = await response.json();

      // Map API response to component format
      setDailyMissions(data.daily?.map((m: Mission) => ({
        ...m,
        rewards: {
          apCoins: m.rewards?.ap_coins,
          xp: m.rewards?.xp,
        },
      })) || []);

      setWeeklyMissions(data.weekly?.map((m: Mission) => ({
        ...m,
        rewards: {
          apCoins: m.rewards?.ap_coins,
          xp: m.rewards?.xp,
        },
      })) || []);
    } catch (error) {
      console.error('Error loading missions:', error);
      toast.error('Error al cargar misiones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      const response = await fetch('/api/gamification/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al reclamar recompensa');
      }

      // Show success toast with rewards
      const rewardText = [];
      if (data.rewards?.ap_coins) rewardText.push(`${data.rewards.ap_coins} AP`);
      if (data.rewards?.xp) rewardText.push(`${data.rewards.xp} XP`);

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">¡Recompensa reclamada!</span>
          {rewardText.length > 0 && (
            <span className="text-sm">+{rewardText.join(' y ')}</span>
          )}
        </div>,
        { duration: 4000 }
      );

      // Refresh AP coins balance from database
      await refreshBalance();

      // Update local state to mark as claimed
      setDailyMissions(prev =>
        prev.map(m => m.id === missionId ? { ...m, isClaimed: true } : m)
      );
      setWeeklyMissions(prev =>
        prev.map(m => m.id === missionId ? { ...m, isClaimed: true } : m)
      );
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error(error instanceof Error ? error.message : 'Error al reclamar');
    } finally {
      setClaimingId(null);
    }
  };

  // Stats calculations
  const totalDaily = dailyMissions.length;
  const completedDaily = dailyMissions.filter(m => m.isCompleted).length;
  const claimedDaily = dailyMissions.filter(m => m.isClaimed).length;

  const totalWeekly = weeklyMissions.length;
  const completedWeekly = weeklyMissions.filter(m => m.isCompleted).length;
  const claimedWeekly = weeklyMissions.filter(m => m.isClaimed).length;

  const pendingRewards = [...dailyMissions, ...weeklyMissions].filter(
    m => m.isCompleted && !m.isClaimed
  ).length;

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-blue-400" />
          Misiones
        </h1>
        <p className="text-muted-foreground">
          Completa misiones para ganar AP coins y XP
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="w-4 h-4" />
            Diarias
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {completedDaily}/{totalDaily}
          </div>
          <div className="text-xs text-muted-foreground">completadas</div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Semanales
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {completedWeekly}/{totalWeekly}
          </div>
          <div className="text-xs text-muted-foreground">completadas</div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Gift className="w-4 h-4" />
            Por reclamar
          </div>
          <div className="text-2xl font-bold text-green-400">
            {pendingRewards}
          </div>
          <div className="text-xs text-muted-foreground">recompensas</div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Flame className="w-4 h-4" />
            Tu balance
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {user?.apCoins || 0}
          </div>
          <div className="text-xs text-muted-foreground">AP coins</div>
        </div>
      </div>

      {/* Pending Rewards Alert */}
      {pendingRewards > 0 && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
          <Gift className="w-6 h-6 text-green-400" />
          <div>
            <span className="font-semibold text-green-400">
              ¡Tienes {pendingRewards} recompensa{pendingRewards > 1 ? 's' : ''} por reclamar!
            </span>
            <p className="text-sm text-green-300/70">
              No olvides reclamar tus recompensas antes de que expiren
            </p>
          </div>
        </div>
      )}

      {/* Missions Panel */}
      <MissionsPanel
        dailyMissions={dailyMissions}
        weeklyMissions={weeklyMissions}
        onClaimReward={handleClaimReward}
      />

      {/* Info Section */}
      <div className="mt-8 bg-muted/30 rounded-lg p-6 border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          ¿Cómo funcionan las misiones?
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-2">Misiones Diarias</h4>
            <ul className="space-y-1">
              <li>- Se renuevan cada día a medianoche</li>
              <li>- Completa acciones como votar, crear escenarios, etc.</li>
              <li>- Recompensas pequeñas pero frecuentes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Misiones Semanales</h4>
            <ul className="space-y-1">
              <li>- Se renuevan cada lunes</li>
              <li>- Requieren más esfuerzo pero dan mejores recompensas</li>
              <li>- Ideales para jugadores dedicados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
