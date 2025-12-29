'use client';

import { useState } from 'react';
import {
  Announcement,
  getAnnouncementTypeColor,
  getAnnouncementTypeIcon,
  getAnnouncementStatusColor,
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
  Eye,
  Edit,
  Trash2,
  Copy,
  Pause,
  Play,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnnouncementsListProps {
  announcements: Announcement[];
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  onDuplicate?: (announcement: Announcement) => void;
  onToggleStatus?: (announcement: Announcement) => void;
}

export function AnnouncementsList({
  announcements,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: AnnouncementsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ann.status === statusFilter;
    const matchesType = typeFilter === 'all' || ann.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const targetLabels: Record<string, string> = {
    all: 'Todos',
    new_users: 'Nuevos',
    active_users: 'Activos',
    inactive_users: 'Inactivos',
    premium: 'Premium',
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anuncios..."
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
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="scheduled">Programado</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-muted border-border">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="info">Información</SelectItem>
            <SelectItem value="success">Éxito</SelectItem>
            <SelectItem value="warning">Advertencia</SelectItem>
            <SelectItem value="promo">Promoción</SelectItem>
            <SelectItem value="maintenance">Mantenimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {paginatedAnnouncements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Chips */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-xl">
                    {getAnnouncementTypeIcon(announcement.type)}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium border',
                      getAnnouncementTypeColor(announcement.type),
                    )}
                  >
                    {announcement.type}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      getAnnouncementStatusColor(announcement.status),
                    )}
                  >
                    {announcement.status === 'draft' && 'Borrador'}
                    {announcement.status === 'scheduled' && 'Programado'}
                    {announcement.status === 'active' && 'Activo'}
                    {announcement.status === 'expired' && 'Expirado'}
                  </span>
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                    {targetLabels[announcement.target]}
                  </span>
                </div>

                {/* Título + mensaje */}
                <h3 className="font-semibold mb-1">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {announcement.message}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span>
                    Creado{' '}
                    {formatDistanceToNow(new Date(announcement.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                  {announcement.scheduledAt &&
                    announcement.status === 'scheduled' && (
                      <span className="text-blue-400">
                        Programado:{' '}
                        {format(
                          new Date(announcement.scheduledAt),
                          'dd MMM yyyy HH:mm',
                          { locale: es },
                        )}
                      </span>
                    )}
                  {announcement.expiresAt && (
                    <span>
                      Expira:{' '}
                      {format(
                        new Date(announcement.expiresAt),
                        'dd MMM yyyy',
                        { locale: es },
                      )}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {(announcement.status === 'active' ||
                  announcement.status === 'expired') && (
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>
                        {announcement.stats.views.toLocaleString()} vistas
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      <span>
                        {announcement.stats.clicks.toLocaleString()} clicks
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      CTR:{' '}
                      {announcement.stats.views > 0
                        ? (
                            (announcement.stats.clicks /
                              announcement.stats.views) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border"
                >
                  <DropdownMenuItem onClick={() => onEdit?.(announcement)}>
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDuplicate?.(announcement)}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Duplicar
                  </DropdownMenuItem>
                  {announcement.status === 'active' && (
                    <DropdownMenuItem
                      onClick={() => onToggleStatus?.(announcement)}
                    >
                      <Pause className="w-4 h-4 mr-2" /> Pausar
                    </DropdownMenuItem>
                  )}
                  {(announcement.status === 'draft' ||
                    announcement.status === 'scheduled') && (
                    <DropdownMenuItem
                      onClick={() => onToggleStatus?.(announcement)}
                      className="text-green-400"
                    >
                      <Play className="w-4 h-4 mr-2" /> Activar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete?.(announcement)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No se encontraron anuncios</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAnnouncements.length,
            )}{' '}
            de {filteredAnnouncements.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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
