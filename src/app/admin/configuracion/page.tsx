import { SystemConfig } from '@/components/admin';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Configuración del Sistema</h1>
      <SystemConfig />
    </div>
  );
}
