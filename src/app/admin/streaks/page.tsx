'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import {
  Flame,
  Loader2,
  Search,
  RefreshCcw,
  Trophy,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


interface UserStreak {
  id: string;
  user_id: string;
  current_login_streak: number;
  longest_login_streak: number;
  current_prediction_streak: number;
  longest_prediction_streak: number;
  current_correct_streak: number;
  longest_correct_streak: number;
  last_login_date: string;
  total_login_days: number;
  user?: {
    username: string;
    avatar_url: string;
    level: number;
  };
}

export default function AdminStreaksPage() {
  const supabase = getSupabaseBrowser();
  const [streaks, setStreaks] = useState<UserStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadStreaks = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_streaks')
        .select('*, user:users(username, avatar_url, level)')
        .order('current_login_streak', { ascending: false })
        .limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Error loading streaks:', error);
        return;
      }

      setStreaks(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreaks();
  }, [loadStreaks]);

  const handleResetStreak = async (streak: UserStreak, type: string) => {
    if (!confirm(`¿Resetear la racha de ${type} de este usuario?`)) return;

    setActionLoading(streak.id);

    const updateData: any = { updated_at: new Date().toISOString() };

    switch (type) {
      case 'login':
        updateData.current_login_streak = 0;
        break;
      case 'prediction':
        updateData.current_prediction_streak = 0;
        break;
      case 'correct':
        updateData.current_correct_streak = 0;
        break;
    }

    const { error } = await supabase
      .from('user_streaks')
      .update(updateData)
      .eq('id', streak.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadStreaks();
    }

    setActionLoading(null);
  };

  // Stats
  const maxLoginStreak = Math.max(...streaks.map(s => s.current_login_streak || 0), 0);
  const maxPredictionStreak = Math.max(...streaks.map(s => s.current_prediction_streak || 0), 0);
  const maxCorrectStreak = Math.max(...streaks.map(s => s.current_correct_streak || 0), 0);

  // Filter by search
  const filteredStreaks = search
    ? streaks.filter(s => s.user?.username?.toLowerCase().includes(search.toLowerCase()))
    : streaks;

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Rachas"
        subtitle="Visualiza y gestiona las rachas de los usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maxLoginStreak}</p>
                <p className="text-xs text-muted-foreground">Mayor Racha Login</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maxPredictionStreak}</p>
                <p className="text-xs text-muted-foreground">Mayor Racha Predicciones</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maxCorrectStreak}</p>
                <p className="text-xs text-muted-foreground">Mayor Racha Correctas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredStreaks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de rachas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Racha Login</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Racha Predicciones</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Racha Correctas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Último Login</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStreaks.map((streak, index) => (
                    <tr key={streak.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-300 text-black' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {streak.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">@{streak.user?.username || 'Usuario'}</p>
                            <p className="text-xs text-muted-foreground">Nivel {streak.user?.level || 1}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400 font-bold">{streak.current_login_streak}</span>
                          <span className="text-xs text-muted-foreground">
                            (max: {streak.longest_login_streak})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold">{streak.current_prediction_streak}</span>
                          <span className="text-xs text-muted-foreground">
                            (max: {streak.longest_prediction_streak})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold">{streak.current_correct_streak}</span>
                          <span className="text-xs text-muted-foreground">
                            (max: {streak.longest_correct_streak})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {streak.last_login_date
                          ? formatDistanceToNow(new Date(streak.last_login_date), { addSuffix: true, locale: es })
                          : 'Nunca'
                        }
                      </td>
                      <td className="py-3 px-4 text-right">
                        <PermissionGate permission="admin.users.edit">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetStreak(streak, 'login')}
                              disabled={actionLoading === streak.id}
                              title="Resetear racha login"
                            >
                              <RefreshCcw className="w-4 h-4 text-orange-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetStreak(streak, 'prediction')}
                              disabled={actionLoading === streak.id}
                              title="Resetear racha predicciones"
                            >
                              <RefreshCcw className="w-4 h-4 text-purple-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetStreak(streak, 'correct')}
                              disabled={actionLoading === streak.id}
                              title="Resetear racha correctas"
                            >
                              <RefreshCcw className="w-4 h-4 text-green-400" />
                            </Button>
                          </div>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
