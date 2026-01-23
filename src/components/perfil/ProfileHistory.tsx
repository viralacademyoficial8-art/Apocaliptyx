// src/components/perfil/ProfileHistory.tsx

'use client';

import { useState } from 'react';
import { History, Filter } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { PredictionHistoryCard } from './PredictionHistoryCard';

export function ProfileHistory() {
  const { history } = useProfileStore();
  const [resultFilter, setResultFilter] = useState<string>('all');

  const filteredHistory = history.filter((h) => {
    if (resultFilter !== 'all' && h.result !== resultFilter) return false;
    return true;
  });

  const stats = {
    total: history.length,
    won: history.filter((h) => h.result === 'WON').length,
    lost: history.filter((h) => h.result === 'LOST').length,
    pending: history.filter((h) => h.result === 'PENDING').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Historial de Predicciones</h2>
            <p className="text-muted-foreground text-sm">
              {stats.total} predicciones • {stats.won} ganadas • {stats.lost} perdidas
            </p>
          </div>
        </div>

        {/* Filter */}
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-white text-sm"
        >
          <option value="all">Todos los resultados</option>
          <option value="WON">Ganadas</option>
          <option value="LOST">Perdidas</option>
          <option value="PENDING">Pendientes</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredHistory.map((prediction) => (
          <PredictionHistoryCard key={prediction.id} prediction={prediction} />
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay predicciones que mostrar</p>
        </div>
      )}
    </div>
  );
}