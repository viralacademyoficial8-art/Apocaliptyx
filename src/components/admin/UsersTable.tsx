'use client';

import { AdminUser, getStatusColor } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Eye, Edit2, Ban, Coins } from 'lucide-react';

interface UsersTableProps {
  users: AdminUser[];
  onViewUser: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onBanUser: (user: AdminUser) => void;
  onGiveCoins: (user: AdminUser) => void;
}

export function UsersTable({
  users,
  onViewUser,
  onEditUser,
  onBanUser,
  onGiveCoins,
}: UsersTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-lg">Usuarios</h2>
        <span className="text-xs text-muted-foreground">
          {users.length.toLocaleString()} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Nivel</th>
              <th className="px-4 py-3 text-right">AP Coins</th>
              <th className="px-4 py-3 text-right">Win Rate</th>
              <th className="px-4 py-3 text-right">Reportes</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const statusClass = getStatusColor(user.status);

              return (
                <tr
                  key={user.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        @{user.username} · {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-xs">
                    <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/40">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs ${statusClass}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{user.prophetLevel}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {user.apCoins.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.winRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.reports > 0 ? (
                      <span className="text-red-400 font-semibold">
                        {user.reports}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border"
                        onClick={() => onViewUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border"
                        onClick={() => onEditUser(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-500/60 text-red-400"
                        onClick={() => onBanUser(user)}
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-amber-500/60 text-amber-400"
                        onClick={() => onGiveCoins(user)}
                      >
                        <Coins className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No hay usuarios registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
