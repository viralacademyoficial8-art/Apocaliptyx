"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import {
  X,
  Home,
  LayoutDashboard,
  ShoppingBag,
  Trophy,
  MessageCircle,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Flame,
  Radio,
  Film,
  Users,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useTranslation();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = isAuthenticated
    ? [
        { href: "/dashboard", label: t("nav.home"), icon: LayoutDashboard, gradient: "from-purple-500 to-indigo-500" },
        { href: "/explorar", label: t("nav.scenarios"), icon: Home, gradient: "from-blue-500 to-cyan-500" },
        { href: "/tienda", label: t("nav.shop"), icon: ShoppingBag, gradient: "from-pink-500 to-rose-500" },
        { href: "/leaderboard", label: t("nav.rankings"), icon: Trophy, gradient: "from-yellow-500 to-orange-500" },
        { href: "/foro", label: t("nav.forum"), icon: MessageCircle, gradient: "from-green-500 to-emerald-500" },
        { href: "/crear", label: t("scenarios.create"), icon: PlusCircle, gradient: "from-violet-500 to-purple-500" },
      ]
    : [
        { href: "/", label: t("nav.home"), icon: Home, gradient: "from-purple-500 to-indigo-500" },
        { href: "/foro", label: t("nav.forum"), icon: MessageCircle, gradient: "from-green-500 to-emerald-500" },
        { href: "/leaderboard", label: t("nav.rankings"), icon: Trophy, gradient: "from-yellow-500 to-orange-500" },
      ];

  const socialItems = isAuthenticated
    ? [
        { href: "/streaming", label: t("nav.streaming"), icon: Radio, color: "from-red-500 to-rose-500", badge: "LIVE" },
        { href: "/reels", label: t("nav.reels"), icon: Film, color: "from-pink-500 to-fuchsia-500" },
        { href: "/comunidades", label: t("nav.communities"), icon: Users, color: "from-blue-500 to-indigo-500" },
      ]
    : [];

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 w-full max-w-[320px] z-50
          transform transition-transform duration-300 ease-out
          translate-x-0 overflow-hidden
        `}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl" />

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content */}
        <div className="relative flex flex-col h-full safe-area-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
            <Link href="/" onClick={onClose} className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-1.5 rounded-lg">
                  <Image
                    src="/apocaliptyx-logo.png"
                    alt="Apocaliptics"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </div>
              </div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                APOCALIPTICS
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800/50 rounded-xl transition-colors touch-target-sm"
              aria-label={t("common.close")}
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* User Info Card */}
          {isAuthenticated && user && (
            <div className="p-4">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur" />

                <div className="relative bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-sm opacity-50" />
                      <Avatar className="relative w-14 h-14 border-2 border-zinc-700">
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-zinc-500 truncate">
                        @{user.username}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600" />
                  </div>

                  {/* AP Coins */}
                  <div className="mt-3 flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl px-3 py-2.5">
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                      <Flame className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="font-bold text-yellow-400">{(user.apCoins || 0).toLocaleString()}</span>
                    <span className="text-sm text-yellow-500/70">AP Coins</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group touch-target
                      ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25"
                          : "hover:bg-zinc-800/50"
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg transition-all
                      ${isActive
                        ? "bg-white/20"
                        : `bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-100`
                      }
                    `}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-medium ${isActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                      {item.label}
                    </span>
                    {isActive && <Zap className="w-4 h-4 text-yellow-300 ml-auto" />}
                  </Link>
                );
              })}
            </div>

            {/* Social Section */}
            {isAuthenticated && socialItems.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 px-3 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                    {t("nav.social")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {socialItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group touch-target
                          ${isActive
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25"
                            : "hover:bg-zinc-800/50"
                          }
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg bg-gradient-to-br ${item.color}
                          ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}
                        `}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`font-medium ${isActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Actions */}
            {isAuthenticated && user && (
              <div className="mt-6 pt-4 border-t border-zinc-800/50 space-y-1.5">
                <Link
                  href={`/perfil/${user.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-all touch-target"
                >
                  <div className="p-2 rounded-lg bg-zinc-800">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{t("nav.profile")}</span>
                </Link>

                <Link
                  href="/configuracion"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-all touch-target"
                >
                  <div className="p-2 rounded-lg bg-zinc-800">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{t("nav.settings")}</span>
                </Link>

                {/* Language Selector */}
                <LanguageSelector variant="mobile" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all touch-target"
                >
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{t("nav.logout")}</span>
                </button>
              </div>
            )}
          </nav>

          {/* Footer (no logueado) */}
          {!isAuthenticated && (
            <div className="p-4 border-t border-zinc-800/50 space-y-3">
              {/* Language Selector */}
              <div className="pb-3 border-b border-zinc-800/50">
                <LanguageSelector variant="mobile" />
              </div>

              {/* Login Button */}
              <Link href="/login" onClick={onClose} className="block">
                <button className="w-full py-3.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {t("nav.login")}
                </button>
              </Link>

              {/* Register Button */}
              <Link href="/registro" onClick={onClose} className="block">
                <button className="relative w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t("nav.register")}
                  </span>
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </Link>

              {/* Bonus text */}
              <p className="text-center text-xs text-zinc-500">
                <span className="text-yellow-400">+1,000 AP Coins</span> gratis al registrarte
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
