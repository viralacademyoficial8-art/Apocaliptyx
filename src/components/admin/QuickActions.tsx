'use client';

import { Button } from '@/components/ui/button';
import {
  UserPlus,
  FileText,
  AlertTriangle,
  Settings,
  Download,
  Mail,
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      label: 'Agregar Usuario',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Nuevo Escenario',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      label: 'Ver Reportes',
      icon: AlertTriangle,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      label: 'Exportar Datos',
      icon: Download,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Enviar Anuncio',
      icon: Mail,
      color: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      label: 'Configuración',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          className={`${action.color} flex flex-col items-center gap-2 h-auto py-4`}
        >
          <action.icon className="w-5 h-5" />
          <span className="text-xs">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
