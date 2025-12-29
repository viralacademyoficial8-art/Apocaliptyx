'use client';

import { useState } from 'react';
import {
  ShopItem,
  getItemCategoryLabel,
  getItemCategoryColor,
  getItemRarityColor,
  getItemRarityLabel,
} from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ItemsGridProps {
  items: ShopItem[];
  onEdit?: (item: ShopItem) => void;
  onDelete?: (item: ShopItem) => void;
  onToggleActive?: (item: ShopItem) => void;
  onToggleFeatured?: (item: ShopItem) => void;
}

export function ItemsGrid({
  items,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}: ItemsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const matchesRarity =
      rarityFilter === 'all' || item.rarity === rarityFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive) ||
      (statusFilter === 'featured' && item.isFeatured);

    return matchesSearch && matchesCategory && matchesRarity && matchesStatus;
  });

  const activeItems = items.filter((i) => i.isActive).length;
  const totalSold = items.reduce((sum, i) => sum + i.soldCount, 0);
  const totalRevenue = items.reduce(
    (sum, i) => sum + i.soldCount * i.price,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold">{items.length}</div>
          <div className="text-sm text-muted-foreground">Total Ítems</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {activeItems}
          </div>
          <div className="text-sm text-muted-foreground">Activos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {totalSold.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Vendidos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">
            {totalRevenue.toLocaleString()} AP
          </div>
          <div className="text-sm text-muted-foreground">Ingresos</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ítems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted border-border"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-muted border-border">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="protection">Protección</SelectItem>
            <SelectItem value="power">Poder</SelectItem>
            <SelectItem value="boost">Boost</SelectItem>
            <SelectItem value="cosmetic">Cosmético</SelectItem>
            <SelectItem value="special">Especial</SelectItem>
          </SelectContent>
        </Select>

        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-muted border-border">
            <SelectValue placeholder="Rareza" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="common">Común</SelectItem>
            <SelectItem value="rare">Raro</SelectItem>
            <SelectItem value="epic">Épico</SelectItem>
            <SelectItem value="legendary">Legendario</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-muted border-border">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="featured">Destacados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'border-2 rounded-xl p-4 relative',
              getItemRarityColor(item.rarity),
              !item.isActive && 'opacity-50',
            )}
          >
            <div className="absolute top-2 right-2 flex gap-1">
              {item.isNew && (
                <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                  NEW
                </span>
              )}
              {item.isFeatured && (
                <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded">
                  <Sparkles className="w-3 h-3 inline" />
                </span>
              )}
              {!item.isActive && (
                <span className="px-1.5 py-0.5 bg-gray-500 text-white text-[10px] font-bold rounded">
                  OFF
                </span>
              )}
            </div>

            <div className="text-4xl mb-3">{item.icon}</div>

            <h3 className="font-semibold mb-1 pr-10">{item.name}</h3>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium',
                  getItemCategoryColor(item.category),
                )}
              >
                {getItemCategoryLabel(item.category)}
              </span>
              <span className="text-xs text-muted-foreground">
                {getItemRarityLabel(item.rarity)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {item.shortDescription}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>{item.soldCount.toLocaleString()} vendidos</span>
              {item.stock && (
                <span className="text-orange-400">Stock: {item.stock}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-xs text-muted-foreground line-through mr-1">
                    {item.currency === 'AP'
                      ? item.originalPrice
                      : `$${item.originalPrice}`}
                  </span>
                )}
                <span className="font-bold text-yellow-400">
                  {item.currency === 'AP'
                    ? `${item.price} AP`
                    : `$${item.price}`}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border"
                >
                  <DropdownMenuItem onClick={() => onEdit?.(item)}>
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActive?.(item)}>
                    {item.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" /> Desactivar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" /> Activar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleFeatured?.(item)}>
                    {item.isFeatured ? (
                      <>
                        <StarOff className="w-4 h-4 mr-2" /> Quitar
                        destacado
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" /> Destacar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(item)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron ítems
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Mostrando {filteredItems.length} de {items.length} ítems
      </p>
    </div>
  );
}
