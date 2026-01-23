'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import {
  Plus,
  Trophy,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Power,
  Users,
  Coins,
  Calendar,
  Eye,
  XCircle
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


interface Tournament {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  creator_id: string;
  community_id: string;
  tournament_type: string;
  category_id: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  participants_count: number;
  min_predictions: number;
  start_date: string;
  end_date: string;
  status: string;
  rules: any;
  prizes: any[];
  created_at: string;
}

interface TournamentParticipant {
  id: string;
  user_id: string;
  predictions_made: number;
  correct_predictions: number;
  accuracy: number;
  points: number;
  rank: number;
  user?: {
    username: string;
    avatar_url: string;
    level: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  ended: 'bg-gray-500/20 text-muted-foreground',
  cancelled: 'bg-red-500/20 text-red-400',
};

const TYPE_LABELS: Record<string, string> = {
  open: 'Abierto',
  invite_only: 'Solo Invitados',
  community: 'Comunidad',
};

export default function AdminTorneosPage() {
  const supabase = getSupabaseBrowser();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_url: '',
    tournament_type: 'open',
    entry_fee: 0,
    prize_pool: 0,
    max_participants: 100,
    min_predictions: 5,
    start_date: '',
    end_date: '',
    status: 'upcoming',
  });

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prediction_tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tournaments:', error);
        return;
      }

      setTournaments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const loadParticipants = async (tournamentId: string) => {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select('*, user:users(username, avatar_url, level)')
      .eq('tournament_id', tournamentId)
      .order('points', { ascending: false });

    if (error) {
      console.error('Error loading participants:', error);
      return;
    }

    setParticipants(data || []);
  };

  const handleToggleStatus = async (tournament: Tournament, newStatus: string) => {
    setActionLoading(tournament.id);
    const { error } = await supabase
      .from('prediction_tournaments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', tournament.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadTournaments();
    }
    setActionLoading(null);
  };

  const handleDelete = async (tournament: Tournament) => {
    if (!confirm('¿Eliminar este torneo? Esta acción no se puede deshacer.')) return;

    setActionLoading(tournament.id);
    const { error } = await supabase
      .from('prediction_tournaments')
      .delete()
      .eq('id', tournament.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadTournaments();
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingTournament(null);
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000); // 8 days from now

    setFormData({
      name: '',
      description: '',
      banner_url: '',
      tournament_type: 'open',
      entry_fee: 0,
      prize_pool: 1000,
      max_participants: 100,
      min_predictions: 5,
      start_date: startDate.toISOString().slice(0, 16),
      end_date: endDate.toISOString().slice(0, 16),
      status: 'upcoming',
    });
    setShowModal(true);
  };

  const openEditModal = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      banner_url: tournament.banner_url || '',
      tournament_type: tournament.tournament_type,
      entry_fee: tournament.entry_fee || 0,
      prize_pool: tournament.prize_pool || 0,
      max_participants: tournament.max_participants || 100,
      min_predictions: tournament.min_predictions || 5,
      start_date: tournament.start_date ? new Date(tournament.start_date).toISOString().slice(0, 16) : '',
      end_date: tournament.end_date ? new Date(tournament.end_date).toISOString().slice(0, 16) : '',
      status: tournament.status,
    });
    setShowModal(true);
  };

  const openParticipantsModal = async (tournament: Tournament) => {
    setSelectedTournament(tournament);
    await loadParticipants(tournament.id);
    setShowParticipantsModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const tournamentData = {
      name: formData.name,
      description: formData.description,
      banner_url: formData.banner_url,
      tournament_type: formData.tournament_type,
      entry_fee: formData.entry_fee,
      prize_pool: formData.prize_pool,
      max_participants: formData.max_participants,
      min_predictions: formData.min_predictions,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status,
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingTournament) {
      const { error } = await supabase
        .from('prediction_tournaments')
        .update(tournamentData)
        .eq('id', editingTournament.id);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadTournaments();
      }
    } else {
      const { error } = await supabase
        .from('prediction_tournaments')
        .insert(tournamentData);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadTournaments();
      }
    }

    setActionLoading(null);
  };

  // Stats
  const totalTournaments = tournaments.length;
  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').length;
  const totalPrizePool = tournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0);

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Torneos"
        subtitle="Crea y administra torneos de predicciones"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTournaments}</p>
                <p className="text-xs text-muted-foreground">Total Torneos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Power className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTournaments}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingTournaments}</p>
                <p className="text-xs text-muted-foreground">Próximos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPrizePool.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Prize Pool Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.tournaments.create">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Torneo
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay torneos creados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Torneo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Participantes</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Prize Pool</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fechas</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament) => (
                    <tr key={tournament.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{tournament.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {tournament.description || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {TYPE_LABELS[tournament.tournament_type] || tournament.tournament_type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{tournament.participants_count || 0}</span>
                          {tournament.max_participants && (
                            <span className="text-muted-foreground">/ {tournament.max_participants}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium text-yellow-400">{tournament.prize_pool?.toLocaleString() || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tournament.status] || 'bg-gray-500/20 text-muted-foreground'}`}>
                          {tournament.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        <div>
                          <p>Inicio: {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}</p>
                          <p>Fin: {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === tournament.id}>
                              {actionLoading === tournament.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openParticipantsModal(tournament)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Participantes
                            </DropdownMenuItem>
                            <PermissionGate permission="admin.tournaments.edit">
                              <DropdownMenuItem onClick={() => openEditModal(tournament)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {tournament.status === 'upcoming' && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(tournament, 'active')}>
                                  <Power className="w-4 h-4 mr-2" />
                                  Iniciar Torneo
                                </DropdownMenuItem>
                              )}
                              {tournament.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(tournament, 'ended')}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Finalizar Torneo
                                </DropdownMenuItem>
                              )}
                              {tournament.status !== 'cancelled' && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(tournament, 'cancelled')} className="text-red-400">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                            </PermissionGate>
                            <PermissionGate permission="admin.tournaments.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleDelete(tournament)} className="text-red-400">
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
        </div>
      </div>

      {/* Tournament Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre del torneo"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Descripción del torneo..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Banner URL</label>
                <input
                  type="text"
                  value={formData.banner_url}
                  onChange={(e) => setFormData(f => ({ ...f, banner_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={formData.tournament_type}
                    onChange={(e) => setFormData(f => ({ ...f, tournament_type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="open">Abierto</option>
                    <option value="invite_only">Solo Invitados</option>
                    <option value="community">Comunidad</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="upcoming">Próximo</option>
                    <option value="active">Activo</option>
                    <option value="ended">Finalizado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Cuota de Entrada (AP)</label>
                  <input
                    type="number"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData(f => ({ ...f, entry_fee: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Prize Pool (AP)</label>
                  <input
                    type="number"
                    value={formData.prize_pool}
                    onChange={(e) => setFormData(f => ({ ...f, prize_pool: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Máx. Participantes</label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(f => ({ ...f, max_participants: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Mín. Predicciones</label>
                  <input
                    type="number"
                    value={formData.min_predictions}
                    onChange={(e) => setFormData(f => ({ ...f, min_predictions: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Fecha Inicio</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fecha Fin</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={actionLoading === 'saving'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {actionLoading === 'saving' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Participantes: {selectedTournament.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {participants.length} participantes registrados
              </p>
            </div>

            <div className="p-6">
              {participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay participantes aún</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
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
                          {participant.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">@{participant.user?.username || 'Usuario'}</p>
                          <p className="text-xs text-muted-foreground">Nivel {participant.user?.level || 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-purple-400">{participant.points || 0} pts</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.correct_predictions || 0}/{participant.predictions_made || 0} ({participant.accuracy || 0}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end">
              <Button variant="outline" onClick={() => setShowParticipantsModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
