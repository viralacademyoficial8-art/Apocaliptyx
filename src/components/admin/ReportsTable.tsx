'use client';

import {
  AdminReport,
  getStatusColor,
  getReportPriorityColor,
} from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';

interface ReportsTableProps {
  reports: AdminReport[];
  onViewReport: (report: AdminReport) => void;
  onResolveReport: (report: AdminReport) => void;
  onDismissReport: (report: AdminReport) => void;
}

export function ReportsTable({
  reports,
  onViewReport,
  onResolveReport,
  onDismissReport,
}: ReportsTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-lg">Reportes</h2>
        <span className="text-xs text-muted-foreground">
          {reports.length.toLocaleString()} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Objetivo</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Prioridad</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Reportado por</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const statusClass = getStatusColor(report.status);
              const priorityClass = getReportPriorityColor(report.priority);

              return (
                <tr
                  key={report.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1">
                        {report.targetTitle}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {report.reason}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">
                    {report.type}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs capitalize ${priorityClass}`}
                    >
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs capitalize ${statusClass}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium">
                      @{report.reporterUsername}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border"
                        onClick={() => onViewReport(report)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-green-500/60 text-green-400"
                        onClick={() => onResolveReport(report)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-500/60 text-red-400"
                        onClick={() => onDismissReport(report)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {reports.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No hay reportes por el momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
