"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
        { href: "/dashboard", label: t("nav.home"), icon: LayoutDashboard },
        { href: "/explorar", label: t("nav.scenarios"), icon: Home },
        { href: "/tienda", label: t("nav.shop"), icon: ShoppingBag },
        { href: "/leaderboard", label: t("nav.rankings"), icon: Trophy },
        { href: "/foro", label: t("nav.forum"), icon: MessageCircle },
        { href: "/crear", label: t("scenarios.create"), icon: PlusCircle },
      ]
    : [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/foro", label: t("nav.forum"), icon: MessageCircle },
        { href: "/leaderboard", label: t("nav.rankings"), icon: Trophy },
      ];

  const socialItems = isAuthenticated
    ? [
        { href: "/streaming", label: t("nav.streaming"), icon: Radio, color: "text-red-400" },
        { href: "/reels", label: t("nav.reels"), icon: Film, color: "text-pink-400" },
        { href: "/comunidades", label: t("nav.communities"), icon: Users, color: "text-blue-400" },
      ]
    : [];

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 w-full max-w-sm bg-background z-50
          transform transition-transform duration-300 ease-in-out
          translate-x-0 safe-area-all
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-2 border-b border-border">
            <span className="text-xl font-bold text-red-500">Apocaliptics</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={t("common.close")}
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-border">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback className="bg-purple-600 text-foreground">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-foreground">
                    {user.displayName}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 bg-muted rounded-lg px-3 py-2">
                <Flame className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-yellow-400">{user.apCoins}</span>
                <span className="text-sm text-muted-foreground">AP Coins</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Social Section */}
            {isAuthenticated && socialItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {t("nav.social")}
                </span>
                <div className="space-y-1 mt-2">
                  {socialItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                          ${
                            isActive
                              ? "bg-purple-600 text-white"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${!isActive ? item.color : ""}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Actions */}
            {isAuthenticated && user && (
              <div className="mt-4 pt-4 border-t border-border space-y-1">
                <Link
                  href={`/perfil/${user.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{t("nav.profile")}</span>
                </Link>

                <Link
                  href="/configuracion"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">{t("nav.settings")}</span>
                </Link>

                {/* Language Selector */}
                <LanguageSelector variant="mobile" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t("nav.logout")}</span>
                </button>
              </div>
            )}
          </nav>

          {/* Footer (no logueado) */}
          {!isAuthenticated && (
            <div className="p-4 border-t border-border space-y-3">
              {/* Language Selector for non-authenticated users */}
              <div className="pb-3 border-b border-border">
                <LanguageSelector variant="mobile" />
              </div>
              <Link href="/login" onClick={onClose} className="block">
                <Button variant="outline" className="w-full border-border text-foreground">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link href="/registro" onClick={onClose} className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  {t("nav.register")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
