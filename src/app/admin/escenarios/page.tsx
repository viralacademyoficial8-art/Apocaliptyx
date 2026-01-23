'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { adminService, ScenarioData } from '@/services/admin.service';
import { 
  Search,
  MoreVertical,
  Eye,
  Star,
  StarOff,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Flame,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  DRAFT: 'bg-yellow-500/20 text-yellow-400',
  RESOLVED: 'bg-blue-500/20 text-blue-400',
  CLOSED: 'bg-purple-500/20 text-purple-400',
  CANCELLED: 'bg-gray-500/20 text-muted-foreground',
};

const STATUS_NAMES: Record<string, string> = {
  ACTIVE: 'Activo',
  DRAFT: 'Borrador',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
};

const CATEGORY_NAMES: Record<string, string> = {
  tecnologia: '💻 Tecnología',
  politica: '🏛️ Política',
  deportes: '⚽ Deportes',
  farandula: '🎬 Farándula',
  guerra: '⚔️ Guerra',
  economia: '💰 Economía',
  salud: '🏥 Salud',
  otros: '📦 Otros',
  Crypto: '🪙 Crypto',
  Deportes: '⚽ Deportes',
  Tecnología: '💻 Tecnología',
};

export default function AdminEscenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change (immediate)
  useEffect(() => {
    setPage(1);
  }, [statusFilter, categoryFilter]);

  const loadScenarios = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getScenarios({
        limit,
        offset: (page - 1) * limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      setScenarios(result.scenarios);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, categoryFilter, limit]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const handleToggleFeatured = async (scenarioId: string, currentFeatured: boolean) => {
    setActionLoading(scenarioId);
    const result = await adminService.updateScenario(scenarioId, { is_featured: !currentFeatured } as any);
    if (result.success) {
      loadScenarios();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleToggleHot = async (scenarioId: string, currentHot: boolean) => {
    setActionLoading(scenarioId);
    const result = await adminService.updateScenario(scenarioId, { is_hot: !currentHot } as any);
    if (result.success) {
      loadScenarios();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleChangeStatus = async (scenarioId: string, newStatus: string) => {
    setActionLoading(scenarioId);
    const result = await adminService.updateScenario(scenarioId, { status: newStatus } as any);
    if (result.success) {
      loadScenarios();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (scenarioId: string) => {
    if (!confirm('¿Estás seguro de eliminar este escenario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setActionLoading(scenarioId);
    const result = await adminService.deleteScenario(scenarioId);
    if (result.success) {
      loadScenarios();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / limit);

  // Stats
  const activeCount = scenarios.filter(s => s.status === 'ACTIVE').length;
  const resolvedCount = scenarios.filter(s => s.status === 'RESOLVED').length;
  const featuredCount = scenarios.filter(s => s.is_featured).length;

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Gestión de Escenarios" 
        subtitle={`${total} escenarios en total`}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-xs text-muted-foreground">Resueltos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featuredCount}</p>
                <p className="text-xs text-muted-foreground">Destacados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="DRAFT">Borradores</option>
            <option value="RESOLVED">Resueltos</option>
            <option value="CLOSED">Cerrados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="tecnologia">Tecnología</option>
            <option value="politica">Política</option>
            <option value="deportes">Deportes</option>
            <option value="farandula">Farándula</option>
            <option value="guerra">Guerra</option>
            <option value="economia">Economía</option>
            <option value="salud">Salud</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron escenarios
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Escenario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pool</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario) => (
                    <tr key={scenario.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium truncate flex items-center gap-2">
                            {scenario.is_featured && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                            {scenario.is_hot && <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                            {scenario.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{scenario.description}</p>
                          {scenario.creator && (
                            <p className="text-xs text-muted-foreground mt-1">
                              por @{scenario.creator.username}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {CATEGORY_NAMES[scenario.category] || scenario.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[scenario.status] || 'bg-gray-500/20 text-muted-foreground'}`}>
                          {STATUS_NAMES[scenario.status] || scenario.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium text-yellow-400">
                            {(scenario.total_pool || 0).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {scenario.participant_count || 0} participantes
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(scenario.created_at), { addSuffix: true, locale: es })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === scenario.id}>
                              {actionLoading === scenario.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.scenarios.edit">
                              <DropdownMenuItem onClick={() => handleToggleFeatured(scenario.id, scenario.is_featured)}>
                                {scenario.is_featured ? (
                                  <>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    Quitar destacado
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-2" />
                                    Destacar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleHot(scenario.id, scenario.is_hot)}>
                                <Flame className="w-4 h-4 mr-2" />
                                {scenario.is_hot ? 'Quitar Hot 🔥' : 'Marcar Hot 🔥'}
                              </DropdownMenuItem>
                              
                              <div className="h-px bg-border my-1" />
                              
                              <DropdownMenuItem onClick={() => handleChangeStatus(scenario.id, 'ACTIVE')}>
                                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                Marcar Activo
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(scenario.id, 'RESOLVED')}>
                                <CheckCircle className="w-4 h-4 mr-2 text-blue-400" />
                                Marcar Resuelto
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(scenario.id, 'CANCELLED')}>
                                <XCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                                Cancelar
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate permission="admin.scenarios.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(scenario.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}