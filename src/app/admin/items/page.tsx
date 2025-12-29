'use client';

import { useState } from 'react';
import { AdminHeader, ItemForm, ItemsGrid } from '@/components/admin';
import { mockShopItems, ShopItem } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminItems() {
  const [items, setItems] = useState(mockShopItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | undefined>();

  const handleSave = (data: Partial<ShopItem>) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? { ...i, ...data, updatedAt: new Date().toISOString() }
            : i,
        ),
      );
      toast.success('Ítem actualizado');
    } else {
      const now = new Date().toISOString();
      const newItem: ShopItem = {
        id: `item-${Date.now()}`,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        icon: data.icon || '🎁',
        price: data.price ?? 0,
        originalPrice: data.originalPrice,
        currency: (data.currency as any) || 'AP',
        category: (data.category as any) || 'special',
        rarity: (data.rarity as any) || 'common',
        effect: data.effect || '',
        duration: data.duration,
        usageLimit: data.usageLimit,
        cooldown: data.cooldown,
        stock: data.stock,
        isActive: data.isActive ?? true,
        isNew: data.isNew || false,
        isFeatured: data.isFeatured || false,
        soldCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success('Ítem creado');
    }

    setShowForm(false);
    setEditingItem(undefined);
  };

  const handleEdit = (item: ShopItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: ShopItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success('Ítem eliminado');
  };

  const handleToggleActive = (item: ShopItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isActive: !i.isActive } : i,
      ),
    );
    toast.success(item.isActive ? 'Ítem desactivado' : 'Ítem activado');
  };

  const handleToggleFeatured = (item: ShopItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isFeatured: !i.isFeatured } : i,
      ),
    );
    toast.success(
      item.isFeatured ? 'Destacado removido' : 'Ítem marcado como destacado',
    );
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Ítems"
        subtitle="Administra los ítems de la tienda"
      />

      <div className="p-6 space-y-6">
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ítem
          </Button>
        )}

        {showForm && (
          <ItemForm
            item={editingItem}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(undefined);
            }}
          />
        )}

        {!showForm && (
          <ItemsGrid
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onToggleFeatured={handleToggleFeatured}
          />
        )}
      </div>
    </div>
  );
}
