'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { adminService } from '@/services/admin.service';
import { 
  Search,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  Power,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Flame,
  Package,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  price: number;
  original_price?: number;
  stock?: number;
  max_per_user?: number;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  BOOST: 'bg-blue-500/20 text-blue-400',
  PROTECTION: 'bg-green-500/20 text-green-400',
  POWER: 'bg-red-500/20 text-red-400',
  COSMETIC: 'bg-purple-500/20 text-purple-400',
  SPECIAL: 'bg-yellow-500/20 text-yellow-400',
};

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-gray-500/20 text-gray-400',
  RARE: 'bg-blue-500/20 text-blue-400',
  EPIC: 'bg-purple-500/20 text-purple-400',
  LEGENDARY: 'bg-yellow-500/20 text-yellow-400',
};

export default function AdminTiendaPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'BOOST',
    rarity: 'COMMON',
    price: 100,
    original_price: 0,
    stock: '',
    max_per_user: '',
    is_active: true,
    is_featured: false,
    image_url: '',
  });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getShopItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading shop items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (itemId: string, currentActive: boolean) => {
    setActionLoading(itemId);
    const result = await adminService.updateShopItem(itemId, { is_active: !currentActive });
    if (result.success) {
      loadItems();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleToggleFeatured = async (itemId: string, currentFeatured: boolean) => {
    setActionLoading(itemId);
    const result = await adminService.updateShopItem(itemId, { is_featured: !currentFeatured });
    if (result.success) {
      loadItems();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('¿Estás seguro de eliminar este item? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setActionLoading(itemId);
    const result = await adminService.deleteShopItem(itemId);
    if (result.success) {
      loadItems();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      type: 'BOOST',
      rarity: 'COMMON',
      price: 100,
      original_price: 0,
      stock: '',
      max_per_user: '',
      is_active: true,
      is_featured: false,
      image_url: '',
    });
    setShowModal(true);
  };

  const openEditModal = (item: ShopItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      price: item.price,
      original_price: item.original_price || 0,
      stock: item.stock?.toString() || '',
      max_per_user: item.max_per_user?.toString() || '',
      is_active: item.is_active,
      is_featured: item.is_featured,
      image_url: item.image_url || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      rarity: formData.rarity,
      price: formData.price,
      original_price: formData.original_price || null,
      stock: formData.stock ? parseInt(formData.stock) : null,
      max_per_user: formData.max_per_user ? parseInt(formData.max_per_user) : null,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      image_url: formData.image_url || null,
    };

    setActionLoading('saving');

    if (editingItem) {
      const result = await adminService.updateShopItem(editingItem.id, itemData);
      if (result.success) {
        setShowModal(false);
        loadItems();
      } else {
        alert(result.error);
      }
    } else {
      const result = await adminService.createShopItem(itemData);
      if (result.success) {
        setShowModal(false);
        loadItems();
      } else {
        alert(result.error);
      }
    }

    setActionLoading(null);
  };

  // Stats
  const totalItems = items.length;
  const activeItems = items.filter(i => i.is_active).length;
  const featuredItems = items.filter(i => i.is_featured).length;
  const totalValue = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Gestión de Tienda" 
        subtitle={`${totalItems} items en total`}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Power className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeItems}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featuredItems}</p>
                <p className="text-xs text-muted-foreground">Destacados</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Valor Total AP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <PermissionGate permission="admin.shop.create">
            <Button onClick={openNewModal} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Item
            </Button>
          </PermissionGate>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron items
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rareza</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Precio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {item.is_featured && <Flame className="w-4 h-4 text-orange-400" />}
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[item.type] || 'bg-gray-500/20 text-gray-400'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RARITY_COLORS[item.rarity] || 'bg-gray-500/20 text-gray-400'}`}>
                          {item.rarity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium text-yellow-400">
                            {item.price.toLocaleString()}
                          </span>
                        </div>
                        {item.original_price && item.original_price > item.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {item.original_price.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {item.stock === null || item.stock === undefined ? '∞' : item.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {item.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === item.id}>
                              {actionLoading === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <PermissionGate permission="admin.shop.edit">
                              <DropdownMenuItem onClick={() => openEditModal(item)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(item.id, item.is_active)}>
                                <Power className="w-4 h-4 mr-2" />
                                {item.is_active ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(item.id, item.is_featured)}>
                                <Flame className="w-4 h-4 mr-2" />
                                {item.is_featured ? 'Quitar destacado' : 'Destacar'}
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate permission="admin.shop.delete">
                              <div className="h-px bg-border my-1" />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item.id)}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Editar Item' : 'Nuevo Item'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={3}
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
                    <option value="BOOST">BOOST</option>
                    <option value="PROTECTION">PROTECTION</option>
                    <option value="POWER">POWER</option>
                    <option value="COSMETIC">COSMETIC</option>
                    <option value="SPECIAL">SPECIAL</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Rareza</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData(f => ({ ...f, rarity: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="COMMON">Común</option>
                    <option value="RARE">Raro</option>
                    <option value="EPIC">Épico</option>
                    <option value="LEGENDARY">Legendario</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Precio (AP Coins)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Precio Original (opcional)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData(f => ({ ...f, original_price: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Stock (vacío = infinito)</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(f => ({ ...f, stock: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Máx por usuario (vacío = sin límite)</label>
                  <input
                    type="number"
                    value={formData.max_per_user}
                    onChange={(e) => setFormData(f => ({ ...f, max_per_user: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">URL de imagen (opcional)</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Activo</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(f => ({ ...f, is_featured: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Destacado</span>
                </label>
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
                {actionLoading === 'saving' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}