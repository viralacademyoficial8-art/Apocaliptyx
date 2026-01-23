'use client';

import { useMemo, useState } from 'react';
import { Trophy, Plus, Pencil } from 'lucide-react';
import { useAdminStore, Achievement } from '@/stores/adminStore';
import { AdminDataTable } from './AdminDataTable';
import { AdminModal } from './AdminModal';
import { StatCard, StatsGrid } from './AdminStats';

type FormState = {
  icon: string;
  name: string;
  description: string;
  requirementType: string;
  requirementCount: number;
  rewardCoins: number;
  rewardXp: number;
  isActive: boolean;
};

const emptyForm: FormState = {
  icon: '🏆',
  name: '',
  description: '',
  requirementType: 'predictions',
  requirementCount: 1,
  rewardCoins: 0,
  rewardXp: 0,
  isActive: true,
};

export function AchievementsManager() {
  const { achievements, addAchievement, updateAchievement } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const stats = useMemo(() => {
    const total = achievements.length;
    const active = achievements.filter(a => a.isActive).length;
    const unlocked = achievements.reduce((acc, a) => acc + a.unlockedCount, 0);
    return { total, active, unlocked };
  }, [achievements]);

  const columns = [
    {
      key: 'name',
      header: 'Logro',
      render: (a: Achievement) => (
        <div className="space-y-1">
          <div className="text-white font-medium flex items-center gap-2">
            <span>{a.icon}</span>
            <span>{a.name}</span>
          </div>
          <div className="text-xs text-muted-foreground line-clamp-1">{a.description}</div>
        </div>
      ),
    },
    {
      key: 'requirement',
      header: 'Requisito',
      render: (a: Achievement) => (
        <span className="text-foreground text-sm">
          {a.requirement.type} ≥ {a.requirement.count}
        </span>
      ),
    },
    {
      key: 'reward',
      header: 'Recompensa',
      render: (a: Achievement) => (
        <span className="text-foreground text-sm">
          {a.rewardCoins.toLocaleString()} coins / {a.rewardXp.toLocaleString()} xp
        </span>
      ),
    },
    { key: 'unlockedCount', header: 'Desbloqueos', render: (a: Achievement) => <span className="text-foreground">{a.unlockedCount.toLocaleString()}</span> },
    { key: 'isActive', header: 'Activo', render: (a: Achievement) => <span className={a.isActive ? 'text-green-300' : 'text-muted-foreground'}>{a.isActive ? 'Sí' : 'No'}</span> },
  ] as const;

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (a: Achievement) => {
    setEditing(a);
    setForm({
      icon: a.icon,
      name: a.name,
      description: a.description,
      requirementType: a.requirement.type,
      requirementCount: a.requirement.count,
      rewardCoins: a.rewardCoins,
      rewardXp: a.rewardXp,
      isActive: a.isActive,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;

    const payload = {
      icon: form.icon,
      name: form.name,
      description: form.description,
      requirement: { type: form.requirementType, count: form.requirementCount },
      rewardCoins: form.rewardCoins,
      rewardXp: form.rewardXp,
      isActive: form.isActive,
    };

    if (editing) updateAchievement(editing.id, payload as any);
    else addAchievement(payload as any);

    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <StatsGrid columns={3}>
        <StatCard title="Total" value={stats.total} icon={Trophy} />
        <StatCard title="Activos" value={stats.active} icon={Trophy} />
        <StatCard title="Desbloqueos (suma)" value={stats.unlocked} icon={Trophy} />
      </StatsGrid>

      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
        >
          <Plus className="w-4 h-4" /> Nuevo logro
        </button>
      </div>

      <AdminDataTable
        data={achievements}
        columns={columns as any}
        getItemId={(a) => a.id}
        searchPlaceholder="Buscar logros..."
        actions={(a: Achievement) => (
          <div className="flex justify-end">
            <button
              onClick={() => openEdit(a)}
              className="p-2 rounded-lg bg-muted text-foreground hover:text-foreground hover:bg-muted"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <AdminModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar logro' : 'Nuevo logro'}
        size="lg"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2 bg-muted text-gray-200 rounded-lg hover:bg-muted">
              Cancelar
            </button>
            <button onClick={save} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500">
              Guardar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-foreground">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Ícono</div>
            <input
              value={form.icon}
              onChange={(e) => setForm(s => ({ ...s, icon: e.target.value }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-white"
              placeholder="Ej: 🏆"
            />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Activo</div>
            <label className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm(s => ({ ...s, isActive: e.target.checked }))}
              />
              <span className="text-sm">Habilitado</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Nombre</div>
            <input
              value={form.name}
              onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Descripción</div>
            <textarea
              value={form.description}
              onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
              className="w-full min-h-[110px] px-3 py-2 bg-muted border border-border rounded-lg text-white"
            />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Tipo requisito</div>
            <input
              value={form.requirementType}
              onChange={(e) => setForm(s => ({ ...s, requirementType: e.target.value }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-white"
              placeholder="Ej: correct_predictions"
            />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Cantidad</div>
            <input
              type="number"
              value={form.requirementCount}
              onChange={(e) => setForm(s => ({ ...s, requirementCount: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-white"
            />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Reward coins</div>
            <input
              type="number"
              value={form.rewardCoins}
              onChange={(e) => setForm(s => ({ ...s, rewardCoins: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-white"
            />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Reward XP</div>
            <input
              type="number"
              value={form.rewardXp}
              onChange={(e) => setForm(s => ({ ...s, rewardXp: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-white"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
