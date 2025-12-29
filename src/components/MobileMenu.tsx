"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
        { href: "/dashboard", label: t("nav.home"), icon: LayoutDashboard }, // puedes crear nav.dashboard luego si quieres
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
          translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
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

            {/* User Actions */}
            {isAuthenticated && user && (
              <div className="mt-6 pt-6 border-t border-border space-y-1">
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
