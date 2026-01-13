'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus,
  Tag,
  Users,
  Percent,
  Coins,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  Copy,
  CheckCircle
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PromoCode {
  id: string;
  code: string;
  description: string;
  type: string;
  value: number;
  min_purchase: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  status: string;
  valid_from: string | null;
  valid_until: string | null;
  applicable_to: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  percentage: 'Porcentaje',
  fixed: 'Fijo',
  free_coins: 'AP Coins Gratis',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  expired: 'bg-red-500/20 text-red-400',
};

export default function AdminPromocionesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'free_coins',
    value: 50,
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    per_user_limit: '1',
    status: 'active',
    valid_from: '',
    valid_until: '',
    applicable_to: 'all',
  });

  const loadPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading promo codes:', error);
        return;
      }

      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromoCodes();
  }, [loadPromoCodes]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (promoCode: PromoCode) => {
    setActionLoading(promoCode.id);
    const newStatus = promoCode.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('promo_codes')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', promoCode.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadPromoCodes();
    }
    setActionLoading(null);
  };

  const handleDelete = async (promoCode: PromoCode) => {
    if (!confirm('¿Eliminar este código promocional?')) return;
    
    setActionLoading(promoCode.id);
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', promoCode.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      loadPromoCodes();
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingCode(null);
    setFormData({
      code: '',
      description: '',
      type: 'free_coins',
      value: 50,
      min_purchase: '',
      max_discount: '',
      usage_limit: '',
      per_user_limit: '1',
      status: 'active',
      valid_from: '',
      valid_until: '',
      applicable_to: 'all',
    });
    setShowModal(true);
  };

  const openEditModal = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      description: promoCode.description || '',
      type: promoCode.type,
      value: promoCode.value,
      min_purchase: promoCode.min_purchase?.toString() || '',
      max_discount: promoCode.max_discount?.toString() || '',
      usage_limit: promoCode.usage_limit?.toString() || '',
      per_user_limit: promoCode.per_user_limit.toString(),
      status: promoCode.status,
      valid_from: promoCode.valid_from ? new Date(promoCode.valid_from).toISOString().slice(0, 16) : '',
      valid_until: promoCode.valid_until ? new Date(promoCode.valid_until).toISOString().slice(0, 16) : '',
      applicable_to: promoCode.applicable_to,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      alert('El código es requerido');
      return;
    }

    const promoData = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      type: formData.type,
      value: formData.value,
      min_purchase: formData.min_purchase ? parseInt(formData.min_purchase) : null,
      max_discount: formData.max_discount ? parseInt(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      per_user_limit: parseInt(formData.per_user_limit) || 1,
      status: formData.status,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      applicable_to: formData.applicable_to,
      updated_at: new Date().toISOString(),
    };

    setActionLoading('saving');

    if (editingCode) {
      const { error } = await supabase
        .from('promo_codes')
        .update(promoData)
        .eq('id', editingCode.id);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadPromoCodes();
      }
    } else {
      const { error } = await supabase
        .from('promo_codes')
        .insert(promoData);

      if (error) {
        toast.error('Error: ' + error.message);
      } else {
        setShowModal(false);
        loadPromoCodes();
      }
    }

    setActionLoading(null);
  };

  // Stats
  const activeCount = promoCodes.filter(p => p.status === 'active').length;
  const totalUsage = promoCodes.reduce((sum, p) => sum + (p.usage_count || 0), 0);
  const totalCoinsGiven = promoCodes
    .filter(p => p.type === 'free_coins')
    .reduce((sum, p) => sum + (p.value * (p.usage_count || 0)), 0);

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Códigos Promocionales" 
        subtitle="Crea cupones y promociones para tus usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Tag className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsage}</p>
                <p className="text-xs text-muted-foreground">Usos Totales</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCoinsGiven.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">AP Regalados</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Percent className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{promoCodes.length}</p>
                <p className="text-xs text-muted-foreground">Total Códigos</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Button */}
        <PermissionGate permission="admin.promos.create">
          <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Código
          </Button>
        </PermissionGate>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay códigos promocionales</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Código</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usos</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Válido hasta</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((promo) => (
                    <tr key={promo.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {promo.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(promo.code)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {copiedCode === promo.code ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {promo.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                            {promo.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {TYPE_LABELS[promo.type] || promo.type}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-yellow-400">
                          {promo.type === 'percentage' ? `${promo.value}%` : promo.value}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {promo.usage_count || 0}
                        {promo.usage_limit && <span className="text-muted-foreground"> / {promo.usage_limit}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[promo.status]}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {promo.valid_until 
                          ? formatDistanceToNow(new Date(promo.valid_until), { addSuffix: true, locale: es })
                          : 'Sin límite'
                        }
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === promo.id}>
                              {actionLoading === promo.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.promos.edit">
                              <DropdownMenuItem onClick={() => openEditModal(promo)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(promo)}>
                                <Power className="w-4 h-4 mr-2" />
                                {promo.status === 'active' ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="admin.promos.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem onClick={() => handleDelete(promo)} className="text-red-400">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingCode ? 'Editar Código' : 'Nuevo Código'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="EJEMPLO10"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción del código..."
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="free_coins">AP Coins Gratis</option>
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed">Descuento Fijo</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Valor {formData.type === 'percentage' ? '(%)' : '(AP)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(f => ({ ...f, value: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Límite de usos (vacío = sin límite)</label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData(f => ({ ...f, usage_limit: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Usos por usuario</label>
                  <input
                    type="number"
                    value={formData.per_user_limit}
                    onChange={(e) => setFormData(f => ({ ...f, per_user_limit: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Válido desde</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(f => ({ ...f, valid_from: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Válido hasta</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(f => ({ ...f, valid_until: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
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
    </div>
  );
}