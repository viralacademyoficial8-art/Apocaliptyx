'use client';

import { useState } from 'react';
import { 
  PromoCode, 
  getPromoTypeLabel,
  getPromoTypeColor,
  getPromoStatusColor,
  formatPromoValue
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
  Copy,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface PromoCodesListProps {
  promoCodes: PromoCode[];
  onEdit?: (promoCode: PromoCode) => void;
  onDelete?: (promoCode: PromoCode) => void;
  onToggleStatus?: (promoCode: PromoCode) => void;
}

export function PromoCodesList({ 
  promoCodes, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: PromoCodesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredCodes = promoCodes.filter((code) => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    const matchesType = typeFilter === 'all' || code.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage) || 1;
  const paginatedCodes = filteredCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado');
  };

  const applicableLabels: Record<string, string> = {
    all: 'Todo',
    first_purchase: 'Primera compra',
    ap_coins: 'AP Coins',
    items: 'Ítems',
    premium: 'Premium',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar códigos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted border-border"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-muted border-border">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="depleted">Agotados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-muted border-border">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="percentage">Porcentaje</SelectItem>
            <SelectItem value="fixed_discount">Descuento fijo</SelectItem>
            <SelectItem value="free_coins">Coins gratis</SelectItem>
            <SelectItem value="bonus_multiplier">Multiplicador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Promo Codes List */}
      <div className="space-y-4">
        {paginatedCodes.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <button 
                    onClick={() => handleCopyCode(promo.code)}
                    className="font-mono text-lg font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {promo.code}
                  </button>
                  <Copy 
                    className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" 
                    onClick={() => handleCopyCode(promo.code)}
                  />
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    getPromoTypeColor(promo.type)
                  )}>
                    {getPromoTypeLabel(promo.type)}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    getPromoStatusColor(promo.status)
                  )}>
                    {promo.status === 'active' && 'Activo'}
                    {promo.status === 'inactive' && 'Inactivo'}
                    {promo.status === 'expired' && 'Expirado'}
                    {promo.status === 'depleted' && 'Agotado'}
                  </span>
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                    {applicableLabels[promo.applicableTo]}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>
                      {promo.usageCount} / {promo.usageLimit === 0 ? '∞' : promo.usageLimit} usos
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span>
                      {format(new Date(promo.validFrom), 'dd MMM', { locale: es })} -{' '}
                      {format(new Date(promo.validUntil), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>

                {/* Progress bar for usage */}
                {promo.usageLimit > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all',
                          promo.usageCount >= promo.usageLimit ? 'bg-red-500' : 'bg-purple-500'
                        )}
                        style={{ width: `${Math.min((promo.usageCount / promo.usageLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((promo.usageCount / promo.usageLimit) * 100).toFixed(0)}% usado
                    </p>
                  </div>
                )}
              </div>

              {/* Value Badge */}
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">
                  {formatPromoValue(promo)}
                </div>
                {promo.minPurchase && promo.minPurchase > 0 && (
                  <p className="text-xs text-muted-foreground">Mín. {promo.minPurchase} AP</p>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem onClick={() => handleCopyCode(promo.code)}>
                    <Copy className="w-4 h-4 mr-2" /> Copiar código
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(promo)}>
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  {promo.status === 'active' && (
                    <DropdownMenuItem onClick={() => onToggleStatus?.(promo)}>
                      <Pause className="w-4 h-4 mr-2" /> Desactivar
                    </DropdownMenuItem>
                  )}
                  {promo.status === 'inactive' && (
                    <DropdownMenuItem onClick={() => onToggleStatus?.(promo)} className="text-green-400">
                      <Play className="w-4 h-4 mr-2" /> Activar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onDelete?.(promo)} className="text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}

        {filteredCodes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No se encontraron códigos promocionales</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {filteredCodes.length} códigos encontrados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
