'use client';

import { useEffect, useState } from 'react';
import { 
  AdminHeader, 
  StatsCard, 
  QuickActions,
  MiniStats 
} from '@/components/admin';
import { adminService, PlatformStats, RecentActivity } from '@/services/admin.service';
import { 
  Users, 
  FileText, 
  Flame, 
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Bell,
  Loader2,
  UserPlus,
  Trophy,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, activitiesData] = await Promise.all([
          adminService.getPlatformStats(),
          adminService.getRecentActivity(10),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'scenario_created':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'purchase':
        return <ShoppingBag className="w-4 h-4 text-yellow-400" />;
      case 'report':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Dashboard" 
        subtitle="Resumen general de la plataforma (datos en tiempo real)" 
      />

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <QuickActions />

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Usuarios Totales"
            value={stats?.totalUsers || 0}
            change={stats?.newUsersThisWeek || 0}
            changeLabel="nuevos esta semana"
            icon={Users}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
            delay={0}
          />
          <StatsCard
            title="Escenarios Activos"
            value={stats?.activeScenarios || 0}
            icon={FileText}
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/20"
            delay={0.1}
          />
          <StatsCard
            title="Volumen Total (AP)"
            value={(stats?.totalVolume || 0).toLocaleString()}
            icon={Flame}
            iconColor="text-yellow-400"
            iconBgColor="bg-yellow-500/20"
            delay={0.2}
          />
          <StatsCard
            title="Items en Tienda"
            value={stats?.totalShopItems || 0}
            icon={ShoppingBag}
            iconColor="text-green-400"
            iconBgColor="bg-green-500/20"
            delay={0.3}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Usuarios Activos"
            value={stats?.activeUsers || 0}
            icon={TrendingUp}
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-500/20"
            delay={0.4}
          />
          <StatsCard
            title="Nuevos Hoy"
            value={stats?.newUsersToday || 0}
            icon={UserPlus}
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/20"
            delay={0.5}
          />
          <StatsCard
            title="Transacciones"
            value={stats?.totalTransactions || 0}
            icon={CreditCard}
            iconColor="text-orange-400"
            iconBgColor="bg-orange-500/20"
            delay={0.6}
          />
          <StatsCard
            title="Escenarios Completados"
            value={stats?.completedScenarios || 0}
            icon={Trophy}
            iconColor="text-pink-400"
            iconBgColor="bg-pink-500/20"
            delay={0.7}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Actividad Reciente</h2>
              <span className="text-xs text-muted-foreground">Tiempo real</span>
            </div>
            
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay actividad reciente
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 bg-background rounded-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          por @{activity.user.username}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { 
                        addSuffix: true,
                        locale: es 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Resumen Rápido</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Total Usuarios</span>
                  </div>
                  <span className="font-bold">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Total Escenarios</span>
                  </div>
                  <span className="font-bold">{stats?.totalScenarios || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Notificaciones</span>
                  </div>
                  <span className="font-bold">{stats?.totalNotifications || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Accesos Rápidos</h3>
              <div className="space-y-2">
                <Link href="/admin/usuarios">
                  <Button variant="outline" size="sm" className="w-full justify-start border-border">
                    <Users className="w-4 h-4 mr-2" />
                    Gestionar Usuarios
                  </Button>
                </Link>
                <Link href="/admin/escenarios">
                  <Button variant="outline" size="sm" className="w-full justify-start border-border">
                    <FileText className="w-4 h-4 mr-2" />
                    Gestionar Escenarios
                  </Button>
                </Link>
                <Link href="/admin/tienda">
                  <Button variant="outline" size="sm" className="w-full justify-start border-border">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Gestionar Tienda
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}