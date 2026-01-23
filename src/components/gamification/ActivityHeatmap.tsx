'use client';

import { useMemo } from 'react';
import { Calendar } from 'lucide-react';

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
  year?: number;
}

export function ActivityHeatmap({ data, year = new Date().getFullYear() }: ActivityHeatmapProps) {
  const { weeks, maxCount } = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Adjust start to Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const dataMap = new Map(data.map((d) => [d.date, d.count]));
    const weeks: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];
    let maxCount = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = dataMap.get(dateStr) || 0;
      maxCount = Math.max(maxCount, count);

      currentWeek.push({ date: new Date(currentDate), count });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate > endDate && currentWeek.length === 0) break;
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, maxCount };
  }, [data, year]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    const intensity = Math.min(count / Math.max(maxCount, 1), 1);
    if (intensity < 0.25) return 'bg-purple-900/50';
    if (intensity < 0.5) return 'bg-purple-700/60';
    if (intensity < 0.75) return 'bg-purple-600/80';
    return 'bg-purple-500';
  };

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const totalActivity = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div className="bg-muted/50 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Actividad {year}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalActivity.toLocaleString()} actividades</span>
          <span>{activeDays} días activo</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[750px]">
          {/* Month labels */}
          <div className="flex mb-1 pl-8">
            {months.map((month, i) => (
              <div
                key={month}
                className="text-xs text-muted-foreground"
                style={{ width: `${100 / 12}%` }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pr-2">
              {days.map((day, i) => (
                <div
                  key={day}
                  className="text-[10px] text-muted-foreground h-[12px] flex items-center"
                  style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => {
                  const isCurrentYear = day.date.getFullYear() === year;
                  return (
                    <div
                      key={dayIndex}
                      className={`w-[12px] h-[12px] rounded-sm ${
                        isCurrentYear ? getColor(day.count) : 'bg-transparent'
                      } transition-colors hover:ring-1 hover:ring-white/50`}
                      title={`${day.date.toLocaleDateString('es')}: ${day.count} actividades`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-purple-900/50" />
              <div className="w-3 h-3 rounded-sm bg-purple-700/60" />
              <div className="w-3 h-3 rounded-sm bg-purple-600/80" />
              <div className="w-3 h-3 rounded-sm bg-purple-500" />
            </div>
            <span>Más</span>
          </div>
        </div>
      </div>
    </div>
  );
}
