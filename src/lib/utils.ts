import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return format(date, "dd MMM yyyy", { locale: es });
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num);
}

export function calculateTimeLeft(dueDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
} {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isExpired: false };
}

export function getProphetLevelColor(level: string): string {
  const colors: Record<string, string> = {
    monividente: 'text-gray-400',
    oraculo: 'text-blue-400',
    vidente: 'text-purple-400',
    nostradamus: 'text-yellow-400'
  };
  return colors[level] || 'text-gray-400';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    tecnologia: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    politica: 'bg-red-500/20 text-red-400 border-red-500/30',
    deportes: 'bg-green-500/20 text-green-400 border-green-500/30',
    farandula: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    guerra: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    economia: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    salud: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ciencia: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    entretenimiento: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    otros: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };
  // Normalize to lowercase to handle any case input
  const normalizedCategory = category?.toLowerCase() || 'otros';
  return colors[normalizedCategory] || colors.otros;
}

// ─────────────────────────────────────────────
// Helpers seguros para localStorage
// ─────────────────────────────────────────────

export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("No se pudo leer localStorage:", error);
    return null;
  }
}

export function safeSetItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;

  try {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);

    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn("No se pudo guardar en localStorage:", error);
  }
}