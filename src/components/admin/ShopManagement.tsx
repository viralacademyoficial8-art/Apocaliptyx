'use client';

import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Power, ShoppingBag } from 'lucide-react';
import { useAdminStore, ShopItem } from '@/stores/adminStore';
import { AdminDataTable } from './AdminDataTable';
import { AdminModal } from './AdminModal';
import { StatCard, StatsGrid } from './AdminStats';

type FormState = {
  name: string;
  description: string;
  type: ShopItem['type'];
  price: number;
  stock: number | null;
  maxPerUser: number | null;
  isActive: boolean;
  imageUrl: string | null;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  type: 'BOOST',
  price: 0,
  stock: null,
  maxPerUser: null,
  isActive: true,
  imageUrl: null,
};

export function ShopManagement() {
  const { shopItems, addShopItem, updateShopItem, toggleShopItem, deleteShopItem } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ShopItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const stats = useMemo(() => {
    const total = shopItems.length;
    const active = shopItems.filter(i => i.isActive).length;
    const sales = shopItems.reduce((acc, i) => acc + i.totalSales, 0);
    const revenue = shopItems.reduce((acc, i) => acc + (i.totalSales * i.price), 0);
    return { total, active, sales, revenue };
  }, [shopItems]);

  const columns = [
    {
      key: 'name',
      header: 'Item',
      render: (i: ShopItem) => (
        <div className="space-y-1">
          <div className="text-white font-medium">{i.name}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{i.description}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Tipo' },
    { key: 'price', header: 'Precio', render: (i: ShopItem) => <span className="text-gray-300">{i.price.toLocaleString()}</span> },
    { key: 'stock', header: 'Stock', render: (i: ShopItem) => <span className="text-gray-300">{i.stock === null ? '∞' : i.stock}</span> },
    { key: 'isActive', header: 'Activo', render: (i: ShopItem) => <span className={i.isActive ? 'text-green-300' : 'text-gray-500'}>{i.isActive ? 'Sí' : 'No'}</span> },
    { key: 'totalSales', header: 'Ventas', render: (i: ShopItem) => <span className="text-gray-300">{i.totalSales.toLocaleString()}</span> },
  ] as const;

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: ShopItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      type: item.type,
      price: item.price,
      stock: item.stock,
      maxPerUser: item.maxPerUser,
      isActive: item.isActive,
      imageUrl: item.imageUrl,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateShopItem(editing.id, {
        name: form.name,
        description: form.description,
        type: form.type,
        price: form.price,
        stock: form.stock,
        maxPerUser: form.maxPerUser,
        isActive: form.isActive,
        imageUrl: form.imageUrl,
      });
    } else {
      addShopItem({
        name: form.name,
        description: form.description,
        type: form.type,
        price: form.price,
        stock: form.stock,
        maxPerUser: form.maxPerUser,
        isActive: form.isActive,
        imageUrl: form.imageUrl,
      });
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <StatsGrid>
        <StatCard title="Items" value={stats.total} icon={ShoppingBag} />
        <StatCard title="Activos" value={stats.active} icon={Power} />
        <StatCard title="Ventas" value={stats.sales} icon={ShoppingBag} />
        <StatCard title="Ingresos (mock)" value={stats.revenue} icon={ShoppingBag} />
      </StatsGrid>

      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
        >
          <Plus className="w-4 h-4" /> Nuevo item
        </button>
      </div>

      <AdminDataTable
        data={shopItems}
        columns={columns as any}
        getItemId={(i) => i.id}
        searchPlaceholder="Buscar items..."
        actions={(i: ShopItem) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openEdit(i)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleShopItem(i.id, !i.isActive)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
              title={i.isActive ? 'Desactivar' : 'Activar'}
            >
              <Power className="w-4 h-4" />
            </button>

            <button
              onClick={() => deleteShopItem(i.id)}
              className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <AdminModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar item' : 'Nuevo item'}
        size="lg"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700">
              Cancelar
            </button>
            <button onClick={save} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500">
              Guardar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Nombre</div>
            <input
              value={form.name}
              onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Descripción</div>
            <textarea
              value={form.description}
              onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
              className="w-full min-h-[110px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Tipo</div>
            <select
              value={form.type}
              onChange={(e) => setForm(s => ({ ...s, type: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="PROTECTION">PROTECTION</option>
              <option value="POWER">POWER</option>
              <option value="BOOST">BOOST</option>
              <option value="COSMETIC">COSMETIC</option>
              <option value="SPECIAL">SPECIAL</option>
            </select>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Precio</div>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm(s => ({ ...s, price: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Stock (vacío = infinito)</div>
            <input
              type="number"
              value={form.stock ?? ''}
              onChange={(e) => setForm(s => ({ ...s, stock: e.target.value === '' ? null : Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Máx por usuario (vacío = sin límite)</div>
            <input
              type="number"
              value={form.maxPerUser ?? ''}
              onChange={(e) => setForm(s => ({ ...s, maxPerUser: e.target.value === '' ? null : Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <input
              id="active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm(s => ({ ...s, isActive: e.target.checked }))}
            />
            <label htmlFor="active" className="text-sm text-gray-300">Item activo</label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
