'use client';

import { AdminScenario, getStatusColor } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Eye, Check, X, Trash2, Flag } from 'lucide-react';

interface ScenariosTableProps {
  scenarios: AdminScenario[];
  onViewScenario: (scenario: AdminScenario) => void;
  onApproveScenario: (scenario: AdminScenario) => void;
  onRejectScenario: (scenario: AdminScenario) => void;
  onResolveScenario: (
    scenario: AdminScenario,
    resolution: 'success' | 'failure'
  ) => void;
  onDeleteScenario: (scenario: AdminScenario) => void;
}

export function ScenariosTable({
  scenarios,
  onViewScenario,
  onApproveScenario,
  onRejectScenario,
  onResolveScenario,
  onDeleteScenario,
}: ScenariosTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-lg">Escenarios</h2>
        <span className="text-xs text-muted-foreground">
          {scenarios.length.toLocaleString()} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Creador</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Pool</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Votos</th>
              <th className="px-4 py-3 text-right">Reportes</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => {
              const statusClass = getStatusColor(scenario.status);

              return (
                <tr
                  key={scenario.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1">
                        {scenario.title}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {scenario.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium">
                      @{scenario.creatorUsername}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs capitalize ${statusClass}`}
                    >
                      {scenario.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {scenario.totalPool.toLocaleString()} AP
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {scenario.currentPrice} AP
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    <span className="text-green-400 font-semibold mr-1">
                      +{scenario.votesUp}
                    </span>
                    <span className="text-red-400 font-semibold">
                      -{scenario.votesDown}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {scenario.reports > 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                        <Flag className="w-3 h-3" />
                        {scenario.reports}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border"
                        onClick={() => onViewScenario(scenario)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {scenario.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-500/60 text-green-400"
                            onClick={() => onApproveScenario(scenario)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-500/60 text-red-400"
                            onClick={() => onRejectScenario(scenario)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {scenario.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-500/60 text-green-400"
                            onClick={() =>
                              onResolveScenario(scenario, 'success')
                            }
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-amber-500/60 text-amber-400"
                            onClick={() =>
                              onResolveScenario(scenario, 'failure')
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-500/60 text-red-400"
                        onClick={() => onDeleteScenario(scenario)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {scenarios.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No hay escenarios registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
