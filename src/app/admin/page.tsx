'use client';

import { 
  AdminHeader, 
  StatsCard, 
  ActivityFeed, 
  QuickActions,
  MiniStats 
} from '@/components/admin';
import { 
  mockPlatformStats, 
  mockAdminActivities,
  mockAdminReports 
} from '@/lib/admin-data';
import { 
  Users, 
  FileText, 
  Flame, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const stats = mockPlatformStats;
  const activities = mockAdminActivities;
  const pendingReports = mockAdminReports.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Dashboard" 
        subtitle="Resumen general de la plataforma" 
      />

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <QuickActions />

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Usuarios Totales"
            value={stats.totalUsers}
            change={5.2}
            changeLabel="vs semana pasada"
            icon={Users}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
            delay={0}
          />
          <StatsCard
            title="Escenarios Activos"
            value={stats.activeScenarios}
            change={12.8}
            changeLabel="vs semana pasada"
            icon={FileText}
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/20"
            delay={0.1}
          />
          <StatsCard
            title="Volumen Total (AP)"
            value={stats.totalVolume.toLocaleString()}
            change={8.3}
            changeLabel="vs semana pasada"
            icon={Flame}
            iconColor="text-yellow-400"
            iconBgColor="bg-yellow-500/20"
            delay={0.2}
          />
          <StatsCard
            title="Ingresos del Mes"
            value={`$${(stats.revenueThisMonth / 100).toLocaleString()}`}
            change={15.4}
            changeLabel="vs mes pasado"
            icon={DollarSign}
            iconColor="text-green-400"
            iconBgColor="bg-green-500/20"
            delay={0.3}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Usuarios Activos"
            value={stats.activeUsers}
            icon={TrendingUp}
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-500/20"
            delay={0.4}
          />
          <StatsCard
            title="Nuevos Hoy"
            value={stats.newUsersToday}
            change={23}
            changeLabel="vs ayer"
            icon={Users}
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/20"
            delay={0.5}
          />
          <StatsCard
            title="Reportes Pendientes"
            value={stats.pendingReports}
            icon={AlertTriangle}
            iconColor="text-orange-400"
            iconBgColor="bg-orange-500/20"
            delay={0.6}
          />
          <StatsCard
            title="Tasa de Retención"
            value={`${stats.retentionRate}%`}
            change={2.1}
            icon={Target}
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
              <Button variant="ghost" size="sm">Ver todo</Button>
            </div>
            <ActivityFeed activities={activities} maxItems={7} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Reports */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Reportes Pendientes
                </h3>
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                  {pendingReports.length}
                </span>
              </div>
              <div className="space-y-2">
                {pendingReports.slice(0, 3).map((report) => (
                  <div 
                    key={report.id}
                    className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium line-clamp-1">{report.targetTitle}</p>
                    <p className="text-xs text-muted-foreground">{report.reason}</p>
                  </div>
                ))}
              </div>
              <Link href="/admin/reportes">
                <Button variant="outline" size="sm" className="w-full mt-3 border-border">
                  Ver todos los reportes
                </Button>
              </Link>
            </div>

            {/* Platform Health */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Salud de la Plataforma</h3>
              <div className="space-y-1">
                <MiniStats label="Tiempo promedio sesión" value={stats.avgSessionTime} icon={Clock} />
                <MiniStats label="Escenarios completados" value={stats.completedScenarios} icon={FileText} color="text-green-400" />
                <MiniStats label="Transacciones totales" value={stats.totalTransactions} icon={TrendingUp} color="text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
