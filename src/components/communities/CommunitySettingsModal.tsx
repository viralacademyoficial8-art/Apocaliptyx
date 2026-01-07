'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

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

interface CommunitySettingsModalProps {
  community: Community;
  userRole: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Partial<Community>) => void;
  onDelete: () => void;
}

export function CommunitySettingsModal({
  community,
  userRole,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: CommunitySettingsModalProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'privacy' | 'rules' | 'danger'>('general');
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

  const isOwner = userRole === 'owner';

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
      toast.success('Configuración guardada');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar configuración');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de la comunidad
          </DialogTitle>
          <DialogDescription>
            Administra la configuración de {community.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0 mt-4">
          {/* Sidebar */}
          <div className="w-40 shrink-0 space-y-1">
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
                  <Label htmlFor="description">Descripción</Label>
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
                          Pública
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
                      <h4 className="font-medium">Requiere aprobación</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Los nuevos miembros necesitan aprobación para unirse
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
                  Define las reglas de tu comunidad. Máximo 10 reglas.
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
                    <p className="text-sm">Añade reglas para mantener el orden en tu comunidad</p>
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
                        Esta acción es irreversible. Se eliminarán todos los posts, miembros y datos de la comunidad.
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
