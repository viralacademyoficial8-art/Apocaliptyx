'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { createClient } from '@supabase/supabase-js';
import {
  Trophy,
  Loader2,
  Medal,
  Target,
  Coins,
  Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string;
  level: number;
  xp: number;
  ap_coins: number;
  total_predictions: number;
  correct_predictions: number;
  accuracy: number;
  total_earnings: number;
}

export default function AdminLeaderboardsPage() {
  const [leaderboardLevel, setLeaderboardLevel] = useState<LeaderboardUser[]>([]);
  const [leaderboardCoins, setLeaderboardCoins] = useState<LeaderboardUser[]>([]);
  const [leaderboardAccuracy, setLeaderboardAccuracy] = useState<LeaderboardUser[]>([]);
  const [leaderboardPredictions, setLeaderboardPredictions] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboards = useCallback(async () => {
    setLoading(true);
    try {
      // Por nivel
      const { data: levelData } = await supabase
        .from('users')
        .select('id, username, avatar_url, level, xp, ap_coins, total_predictions, correct_predictions, total_earnings')
        .order('level', { ascending: false })
        .order('xp', { ascending: false })
        .limit(50);

      setLeaderboardLevel(levelData?.map(u => ({
        ...u,
        accuracy: u.total_predictions > 0 ? Math.round((u.correct_predictions / u.total_predictions) * 100) : 0
      })) || []);

      // Por AP Coins
      const { data: coinsData } = await supabase
        .from('users')
        .select('id, username, avatar_url, level, xp, ap_coins, total_predictions, correct_predictions, total_earnings')
        .order('ap_coins', { ascending: false })
        .limit(50);

      setLeaderboardCoins(coinsData?.map(u => ({
        ...u,
        accuracy: u.total_predictions > 0 ? Math.round((u.correct_predictions / u.total_predictions) * 100) : 0
      })) || []);

      // Por Accuracy (mínimo 10 predicciones)
      const { data: accuracyData } = await supabase
        .from('users')
        .select('id, username, avatar_url, level, xp, ap_coins, total_predictions, correct_predictions, total_earnings')
        .gte('total_predictions', 10)
        .order('correct_predictions', { ascending: false })
        .limit(50);

      setLeaderboardAccuracy(accuracyData?.map(u => ({
        ...u,
        accuracy: u.total_predictions > 0 ? Math.round((u.correct_predictions / u.total_predictions) * 100) : 0
      })).sort((a, b) => b.accuracy - a.accuracy) || []);

      // Por Total Predicciones
      const { data: predictionsData } = await supabase
        .from('users')
        .select('id, username, avatar_url, level, xp, ap_coins, total_predictions, correct_predictions, total_earnings')
        .order('total_predictions', { ascending: false })
        .limit(50);

      setLeaderboardPredictions(predictionsData?.map(u => ({
        ...u,
        accuracy: u.total_predictions > 0 ? Math.round((u.correct_predictions / u.total_predictions) * 100) : 0
      })) || []);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  const renderLeaderboard = (users: LeaderboardUser[], metric: 'level' | 'coins' | 'accuracy' | 'predictions') => {
    if (users.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay datos</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {users.map((user, index) => {
          let value = '';
          let valueColor = 'text-foreground';

          switch (metric) {
            case 'level':
              value = `Nivel ${user.level} (${user.xp.toLocaleString()} XP)`;
              valueColor = 'text-purple-400';
              break;
            case 'coins':
              value = `${user.ap_coins.toLocaleString()} AP`;
              valueColor = 'text-yellow-400';
              break;
            case 'accuracy':
              value = `${user.accuracy}% (${user.correct_predictions}/${user.total_predictions})`;
              valueColor = 'text-green-400';
              break;
            case 'predictions':
              value = `${user.total_predictions.toLocaleString()} predicciones`;
              valueColor = 'text-blue-400';
              break;
          }

          return (
            <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-300 text-black' :
                  index === 2 ? 'bg-orange-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {user.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">@{user.username}</p>
                  <p className="text-xs text-muted-foreground">Nivel {user.level}</p>
                </div>
              </div>
              <span className={`font-bold ${valueColor}`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Leaderboards"
        subtitle="Visualiza los rankings de usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leaderboardLevel[0]?.level || 0}</p>
                <p className="text-xs text-muted-foreground">Mayor Nivel</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(leaderboardCoins[0]?.ap_coins || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Máx AP Coins</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leaderboardAccuracy[0]?.accuracy || 0}%</p>
                <p className="text-xs text-muted-foreground">Mayor Accuracy</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Medal className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(leaderboardPredictions[0]?.total_predictions || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Máx Predicciones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <Tabs defaultValue="level" className="bg-card border border-border rounded-xl p-6">
            <TabsList className="bg-muted mb-6">
              <TabsTrigger value="level" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Por Nivel
              </TabsTrigger>
              <TabsTrigger value="coins" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Por AP Coins
              </TabsTrigger>
              <TabsTrigger value="accuracy" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Por Accuracy
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center gap-2">
                <Medal className="w-4 h-4" />
                Por Predicciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="level">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 50 por Nivel
              </h3>
              {renderLeaderboard(leaderboardLevel, 'level')}
            </TabsContent>

            <TabsContent value="coins">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 50 por AP Coins
              </h3>
              {renderLeaderboard(leaderboardCoins, 'coins')}
            </TabsContent>

            <TabsContent value="accuracy">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 50 por Accuracy (mín. 10 predicciones)
              </h3>
              {renderLeaderboard(leaderboardAccuracy, 'accuracy')}
            </TabsContent>

            <TabsContent value="predictions">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 50 por Total de Predicciones
              </h3>
              {renderLeaderboard(leaderboardPredictions, 'predictions')}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
