import { UserManagement } from '@/components/admin';

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
      <UserManagement />
    </div>
  );
}
