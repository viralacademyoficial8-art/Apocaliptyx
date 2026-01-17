'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Save,
  Trash2,
  Globe,
  Lock,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  ShieldOff,
  Crown,
  Search,
  Check,
  Ban,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  themeColor: string;
  isPublic: boolean;
  isVerified: boolean;
  requiresApproval: boolean;
  membersCount: number;
  postsCount: number;
  rules: string[];
  categories: string[];
  createdAt: string;
  creatorId: string;
}

interface JoinRequest {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  users?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface Member {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  level: number;
  role: string;
  joinedAt: string;
}

interface CommunitySettingsModalProps {
  community: Community;
  userRole: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Partial<Community>) => void;
  onDelete: () => void;
}

type Section = 'general' | 'privacy' | 'rules' | 'requests' | 'members' | 'danger';

export function CommunitySettingsModal({
  community,
  userRole,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: CommunitySettingsModalProps) {
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Form state
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description || '');
  const [themeColor, setThemeColor] = useState(community.themeColor);
  const [isPublic, setIsPublic] = useState(community.isPublic);
  const [requiresApproval, setRequiresApproval] = useState(community.requiresApproval);
  const [rules, setRules] = useState<string[]>(community.rules || []);
  const [newRule, setNewRule] = useState('');

  // Requests state
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [processingMember, setProcessingMember] = useState<string | null>(null);

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;

  // Load requests when section changes
  useEffect(() => {
    if (activeSection === 'requests' && isAdmin) {
      loadRequests();
    }
  }, [activeSection, isAdmin]);

  // Load members when section changes
  useEffect(() => {
    if (activeSection === 'members') {
      loadMembers();
    }
  }, [activeSection]);

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch(`/api/communities/${community.id}/requests`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch(`/api/communities/${community.id}/members`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Error al cargar miembros');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingRequest(requestId);
    try {
      const response = await fetch(`/api/communities/${community.id}/requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success(action === 'approve' ? 'Solicitud aprobada' : 'Solicitud rechazada');
      setRequests(requests.filter(r => r.id !== requestId));

      if (action === 'approve') {
        loadMembers();
        onUpdate({ membersCount: community.membersCount + 1 });
      }
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast.error(error.message || 'Error al procesar solicitud');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingMember(userId);
    try {
      const response = await fetch(`/api/communities/${community.id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success('Rol actualizado');
      setMembers(members.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error al actualizar rol');
    } finally {
      setProcessingMember(null);
    }
  };

  const handleRemoveMember = async (userId: string, ban: boolean = false) => {
    if (!confirm(ban ? '¿Banear a este usuario? No podrá volver a unirse.' : '¿Expulsar a este usuario?')) {
      return;
    }

    setProcessingMember(userId);
    try {
      const response = await fetch(`/api/communities/${community.id}/members?userId=${userId}&ban=${ban}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success(ban ? 'Usuario baneado' : 'Usuario expulsado');
      setMembers(members.filter(m => m.userId !== userId));
      onUpdate({ membersCount: community.membersCount - 1 });
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Error al expulsar usuario');
    } finally {
      setProcessingMember(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<Community> = {
        name,
        description,
        themeColor,
        isPublic,
        requiresApproval,
        rules,
      };

      const response = await fetch(`/api/communities/${community.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      onUpdate(updates);
      toast.success('Configuracion guardada');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar configuracion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== community.name) {
      toast.error('El nombre no coincide');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/communities/${community.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Comunidad eliminada');
      onDelete();
    } catch (error) {
      console.error('Error deleting community:', error);
      toast.error('Error al eliminar comunidad');
    } finally {
      setDeleting(false);
    }
  };

  const addRule = () => {
    if (newRule.trim() && rules.length < 10) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const filteredMembers = members.filter(m =>
    m.username?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.displayName?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full"><Crown className="w-3 h-3" /> Owner</span>;
      case 'admin':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full"><Shield className="w-3 h-3" /> Admin</span>;
      case 'moderator':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full"><Shield className="w-3 h-3" /> Mod</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full">Miembro</span>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuracion de la comunidad
          </DialogTitle>
          <DialogDescription>
            Administra la configuracion de {community.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0 mt-4">
          {/* Sidebar */}
          <div className="w-44 shrink-0 space-y-1">
            <button
              onClick={() => setActiveSection('general')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'general'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveSection('privacy')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'privacy'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Privacidad
            </button>
            <button
              onClick={() => setActiveSection('rules')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'rules'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Reglas
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveSection('requests')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  activeSection === 'requests'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Solicitudes
                </span>
                {requests.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {requests.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setActiveSection('members')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                activeSection === 'members'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Miembros
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveSection('danger')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === 'danger'
                    ? 'bg-red-600 text-white'
                    : 'text-red-400 hover:bg-red-900/30'
                }`}
              >
                Zona peligrosa
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre de la comunidad</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700"
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripcion</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700 min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
                </div>

                <div>
                  <Label htmlFor="themeColor">Color del tema</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      id="themeColor"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <Input
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="bg-gray-800 border-gray-700 w-28"
                      maxLength={7}
                    />
                    <div
                      className="flex-1 h-10 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}80)` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isPublic ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                      {isPublic ? (
                        <Globe className="w-5 h-5 text-green-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Visibilidad</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {isPublic
                          ? 'Cualquiera puede ver y unirse a esta comunidad'
                          : 'Solo los miembros pueden ver el contenido'}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant={isPublic ? 'default' : 'outline'}
                          onClick={() => setIsPublic(true)}
                          className={isPublic ? 'bg-green-600' : 'border-gray-700'}
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Publica
                        </Button>
                        <Button
                          size="sm"
                          variant={!isPublic ? 'default' : 'outline'}
                          onClick={() => setIsPublic(false)}
                          className={!isPublic ? 'bg-yellow-600' : 'border-gray-700'}
                        >
                          <Lock className="w-4 h-4 mr-1" />
                          Privada
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Requiere aprobacion</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Los nuevos miembros necesitan aprobacion para unirse
                      </p>
                    </div>
                    <button
                      onClick={() => setRequiresApproval(!requiresApproval)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        requiresApproval ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          requiresApproval ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'rules' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Define las reglas de tu comunidad. Maximo 10 reglas.
                </p>

                {rules.length > 0 && (
                  <div className="space-y-2">
                    {rules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg"
                      >
                        <span className="text-purple-400 font-medium shrink-0">{index + 1}.</span>
                        <span className="flex-1 text-sm">{rule}</span>
                        <button
                          onClick={() => removeRule(index)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {rules.length < 10 && (
                  <div className="flex gap-2">
                    <Input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="Escribe una nueva regla..."
                      className="bg-gray-800 border-gray-700"
                      maxLength={200}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRule();
                        }
                      }}
                    />
                    <Button onClick={addRule} disabled={!newRule.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {rules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay reglas definidas</p>
                    <p className="text-sm">Anade reglas para mantener el orden en tu comunidad</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'requests' && isAdmin && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-500" />
                    Solicitudes de admision
                  </h3>
                  <Button size="sm" variant="outline" onClick={loadRequests} disabled={loadingRequests}>
                    {loadingRequests ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar'}
                  </Button>
                </div>

                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : requests.length > 0 ? (
                  <div className="space-y-3">
                    {requests.map((request) => {
                      const userData = request.user || request.users;
                      const username = userData?.username || 'Usuario';
                      const displayName = (request.user?.displayName || request.users?.display_name) || username;
                      const avatarUrl = request.user?.avatarUrl || request.users?.avatar_url;

                      return (
                        <div key={request.id} className="p-4 bg-gray-800/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{
                                background: avatarUrl
                                  ? `url(${avatarUrl}) center/cover`
                                  : 'linear-gradient(135deg, #6366f1, #ec4899)',
                              }}
                            >
                              {!avatarUrl && username?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{displayName}</p>
                              <p className="text-sm text-gray-400">@{username}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: es })}
                            </div>
                          </div>

                          {request.message && (
                            <p className="mt-2 text-sm text-gray-400 italic">"{request.message}"</p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleRequest(request.id, 'approve')}
                              disabled={processingRequest === request.id}
                            >
                              {processingRequest === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprobar
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500/20"
                              onClick={() => handleRequest(request.id, 'reject')}
                              disabled={processingRequest === request.id}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay solicitudes pendientes</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'members' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Buscar miembros..."
                      className="pl-9 bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={loadMembers} disabled={loadingMembers}>
                    {loadingMembers ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar'}
                  </Button>
                </div>

                {loadingMembers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="p-3 bg-gray-800/50 rounded-xl flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            background: member.avatarUrl
                              ? `url(${member.avatarUrl}) center/cover`
                              : 'linear-gradient(135deg, #6366f1, #ec4899)',
                          }}
                        >
                          {!member.avatarUrl && member.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{member.displayName || member.username}</p>
                            {getRoleBadge(member.role)}
                          </div>
                          <p className="text-xs text-gray-500">@{member.username}</p>
                        </div>

                        {/* Actions - only show for non-owners and if current user has permission */}
                        {member.role !== 'owner' && isAdmin && (
                          <div className="flex items-center gap-1">
                            {isOwner && member.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                                onClick={() => handleRoleChange(member.userId, 'admin')}
                                disabled={processingMember === member.userId}
                                title="Hacer admin"
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                            )}
                            {isOwner && member.role === 'admin' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/20"
                                onClick={() => handleRoleChange(member.userId, 'member')}
                                disabled={processingMember === member.userId}
                                title="Quitar admin"
                              >
                                <ShieldOff className="w-4 h-4" />
                              </Button>
                            )}
                            {(isOwner || (isAdmin && member.role !== 'admin')) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  onClick={() => handleRemoveMember(member.userId, false)}
                                  disabled={processingMember === member.userId}
                                  title="Expulsar"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-red-600 hover:text-red-500 hover:bg-red-500/20"
                                  onClick={() => handleRemoveMember(member.userId, true)}
                                  disabled={processingMember === member.userId}
                                  title="Banear"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{memberSearch ? 'No se encontraron miembros' : 'No hay miembros'}</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'danger' && isOwner && (
              <div className="space-y-4">
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-400">Eliminar comunidad</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Esta accion es irreversible. Se eliminaran todos los posts, miembros y datos de la comunidad.
                      </p>

                      {!showDeleteConfirm ? (
                        <Button
                          variant="outline"
                          className="mt-4 border-red-500 text-red-400 hover:bg-red-500/20"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar comunidad
                        </Button>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm text-gray-300">
                            Escribe <strong className="text-red-400">{community.name}</strong> para confirmar:
                          </p>
                          <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={community.name}
                            className="bg-gray-800 border-red-500/50"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="border-gray-700"
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteConfirmText('');
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              className="bg-red-600 hover:bg-red-700"
                              onClick={handleDelete}
                              disabled={deleteConfirmText !== community.name || deleting}
                            >
                              {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                              )}
                              Eliminar permanentemente
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t border-gray-800">
          <Button variant="outline" onClick={onClose} className="border-gray-700">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
