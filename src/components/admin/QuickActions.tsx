'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  FileText,
  AlertTriangle,
  Settings,
  Download,
  Bell,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function QuickActions() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      // Obtener datos para exportar
      const { data: users } = await supabase
        .from('users')
        .select('id, username, email, display_name, role, ap_coins, level, created_at')
        .order('created_at', { ascending: false });

      const { data: scenarios } = await supabase
        .from('scenarios')
        .select('id, title, category, status, total_pool, participant_count, created_at')
        .order('created_at', { ascending: false });

      // Crear CSV
      const exportData = {
        exportDate: new Date().toISOString(),
        users: users || [],
        scenarios: scenarios || [],
        summary: {
          totalUsers: users?.length || 0,
          totalScenarios: scenarios?.length || 0,
        }
      };

      // Descargar como JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apocaliptyx-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar datos');
    } finally {
      setExporting(false);
    }
  };

  const actions = [
    {
      label: 'Agregar Usuario',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => router.push('/admin/usuarios?action=new'),
    },
    {
      label: 'Nuevo Escenario',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => router.push('/admin/escenarios?action=new'),
    },
    {
      label: 'Ver Reportes',
      icon: AlertTriangle,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => router.push('/admin/reportes'),
    },
    {
      label: exporting ? 'Exportando...' : 'Exportar Datos',
      icon: exporting ? Loader2 : Download,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: handleExportData,
      disabled: exporting,
    },
    {
      label: 'Enviar Anuncio',
      icon: Bell,
      color: 'bg-pink-500 hover:bg-pink-600',
      onClick: () => router.push('/admin/anuncios'),
    },
    {
      label: 'Configuración',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => router.push('/admin/configuracion'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          onClick={action.onClick}
          disabled={action.disabled}
          className={`${action.color} flex flex-col items-center gap-2 h-auto py-4`}
        >
          <action.icon className={`w-5 h-5 ${action.disabled ? 'animate-spin' : ''}`} />
          <span className="text-xs">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}