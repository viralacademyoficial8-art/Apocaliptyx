"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FlameIcon, ShieldCheckIcon, TimerIcon, UsersIcon } from "lucide-react";
import type { Scenario } from "@/types";
import {
  calculateTimeLeft,
  formatCurrency,
  formatDate,
  getCategoryColor,
} from "@/lib/utils";

interface ScenarioCardProps {
  scenario: Scenario;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const router = useRouter();

  // ✅ Memoizamos fechas para que no cambien en cada render
  const dueDate = useMemo(() => new Date(scenario.dueDate as any), [scenario.dueDate]);
  const createdAt = useMemo(() => new Date(scenario.createdAt as any), [scenario.createdAt]);

  // Normalizamos números
  const totalPot = Number(scenario.totalPot ?? 0);
  const currentPrice = Number(scenario.currentPrice ?? 0);
  const transferCount = Number(scenario.transferCount ?? 0);

  // Normalizamos votos
  const votesYes = scenario.votes?.yes ?? 0;
  const votesNo = scenario.votes?.no ?? 0;

  const [time, setTime] = useState({
    isExpired: false,
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const updateTime = () => {
      setTime(calculateTimeLeft(dueDate));
    };

    updateTime();

    const id = window.setInterval(updateTime, 60_000);
    return () => clearInterval(id);
  }, [dueDate]);

  const timeLabel = time.isExpired
    ? "Escenario expirado"
    : `${time.days}d ${time.hours}h ${time.minutes}m restantes`;

  return (
    <motion.div
      onClick={() => router.push(`/escenario/${scenario.id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(168, 85, 247, 0.15)",
      }}
      transition={{ duration: 0.25 }}
      className="
        group flex flex-col gap-3 rounded-2xl border border-border
        bg-card dark:bg-gradient-to-br dark:from-zinc-900/80 dark:via-zinc-950 dark:to-black
        p-4 shadow-lg shadow-black/10 dark:shadow-black/40
        transition hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-amber-500/20
        cursor-pointer
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getCategoryColor(
              scenario.category
            )}`}
          >
            {scenario.category.toUpperCase()}
          </div>
          <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-amber-400 transition-colors">
            {scenario.title}
          </h3>
        </div>
        <div className="flex flex-col items-end text-right text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">
            @{scenario.currentHolderUsername}
          </span>
          <span className="text-[10px]">Creado el {formatDate(createdAt)}</span>
        </div>
      </div>

      <p className="line-clamp-3 text-xs text-muted-foreground">
        {scenario.description}
      </p>

      <div className="mt-1 grid grid-cols-2 gap-3 text-[11px] text-foreground">
        <div className="flex items-center gap-2">
          <TimerIcon className="h-3.5 w-3.5 text-amber-400" />
          <div>
            <div className="font-medium">{timeLabel}</div>
            <div className="text-[10px] text-muted-foreground">
              Límite: {formatDate(dueDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end text-right">
          <FlameIcon className="h-3.5 w-3.5 text-orange-400" />
          <div>
            <div className="font-semibold text-amber-500">
              Pozo: {formatCurrency(totalPot)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Precio actual: {formatCurrency(currentPrice)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-3.5 w-3.5" />
          <span>
            Transferencias:{" "}
            <span className="font-semibold text-foreground">{transferCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {scenario.isProtected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
              <ShieldCheckIcon className="h-3 w-3" />
              Protegido
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            Votos: ✅ {votesYes} / ❌ {votesNo}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
