'use client';

import { useState } from 'react';
import { AdminHeader, PromoCodeForm, PromoCodesList, StatsCard } from '@/components/admin';
import { mockPromoCodes, PromoCode } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Users, Percent, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPromociones() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(mockPromoCodes);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | undefined>();

  // Stats
  const activeCount = promoCodes.filter(p => p.status === 'active').length;
  const totalUsage = promoCodes.reduce((sum, p) => sum + p.usageCount, 0);
  const totalSavings = promoCodes.reduce((sum, p) => {
    if (p.type === 'free_coins') return sum + (p.value * p.usageCount);
    return sum;
  }, 0);

  const handleSave = (data: Partial<PromoCode>) => {
    if (editingCode) {
      setPromoCodes(prev => prev.map(p => 
        p.id === editingCode.id ? { ...p, ...data } : p
      ));
    } else {
      const newCode: PromoCode = {
        id: `promo-${Date.now()}`,
        code: data.code || '',
        description: data.description || '',
        type: (data.type as PromoCode['type']) || 'percentage',
        value: data.value ?? 0,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit ?? 0,
        usageCount: 0,
        perUserLimit: data.perUserLimit ?? 1,
        status: (data.status as PromoCode['status']) || 'inactive',
        validFrom: data.validFrom || new Date().toISOString(),
        validUntil: data.validUntil || new Date().toISOString(),
        applicableTo: (data.applicableTo as PromoCode['applicableTo']) || 'all',
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        usedBy: [],
      };
      setPromoCodes(prev => [newCode, ...prev]);
    }
    setShowForm(false);
    setEditingCode(undefined);
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setShowForm(true);
  };

  const handleDelete = (promoCode: PromoCode) => {
    setPromoCodes(prev => prev.filter(p => p.id !== promoCode.id));
    toast.success('Código eliminado');
  };

  const handleToggleStatus = (promoCode: PromoCode) => {
    const newStatus: PromoCode['status'] = promoCode.status === 'active' ? 'inactive' : 'active';
    setPromoCodes(prev => prev.map(p => 
      p.id === promoCode.id ? { ...p, status: newStatus } : p
    ));
    toast.success(newStatus === 'active' ? 'Código activado' : 'Código desactivado');
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Códigos Promocionales" 
        subtitle="Crea cupones y promociones para tus usuarios"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Códigos Activos"
            value={activeCount}
            icon={Tag}
            iconColor="text-green-400"
            iconBgColor="bg-green-500/20"
          />
          <StatsCard
            title="Total Usos"
            value={totalUsage.toLocaleString()}
            icon={Users}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
          />
          <StatsCard
            title="AP Regalados"
            value={totalSavings.toLocaleString()}
            icon={Coins}
            iconColor="text-yellow-400"
            iconBgColor="bg-yellow-500/20"
          />
          <StatsCard
            title="Códigos Totales"
            value={promoCodes.length}
            icon={Percent}
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/20"
          />
        </div>

        {/* New Code Button */}
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Código
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <PromoCodeForm
            promoCode={editingCode}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingCode(undefined);
            }}
          />
        )}

        {/* List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Códigos Existentes</h2>
          <PromoCodesList
            promoCodes={promoCodes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    </div>
  );
}
