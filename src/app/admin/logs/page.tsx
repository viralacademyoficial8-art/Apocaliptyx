import { AuditLogs } from '@/components/admin';

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Logs de Auditoría</h1>
      <AuditLogs />
    </div>
  );
}
