"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { NotificationCenter } from "@/components/NotificationCenter";
import { MobileMenu } from "@/components/MobileMenu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skull, Menu, Flame, User, Settings, LogOut, ChevronDown } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t("nav.home") },
    { href: "/tienda", label: t("nav.shop") },
    { href: "/leaderboard", label: t("nav.rankings") },
    { href: "/foro", label: t("nav.forum") },
    { href: "/crear", label: t("scenarios.create") },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Skull className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
              <span className="text-lg sm:text-xl font-bold text-yellow-500 hidden sm:block">
                Apocaliptics
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block ml-4">
              <SearchBar variant="navbar" />
            </div>

            {/* Navegación desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Zona derecha */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Selector de idioma (siempre visible) */}
              <LanguageSelector variant="default" />

              {isAuthenticated && user ? (
                <>
                  {/* AP Coins (solo sm+) */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg">
                    <Flame className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-yellow-400 text-sm">
                      {user.apCoins.toLocaleString("es-MX")}
                    </span>
                  </div>

                  {/* 🔔 Centro de Notificaciones (única campanita) */}
                  <NotificationCenter />

                  {/* Dropdown usuario (desktop) */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
                          <Avatar className="w-8 h-8 border-2 border-border">
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                            <AvatarFallback className="text-sm bg-gradient-to-br from-purple-600 to-pink-600">
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden lg:block text-left">
                            <div className="text-sm font-semibold text-foreground">
                              {user.displayName ?? user.username}
                            </div>
                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-56 bg-card border border-border">
                        {/* Header manual */}
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground">
                            {user.displayName ?? user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Flame className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-semibold text-yellow-400">
                              {user.apCoins.toLocaleString("es-MX")} AP Coins
                            </span>
                          </div>
                        </div>

                        {/* Opciones */}
                        <DropdownMenuItem
                          onClick={() => router.push(`/perfil/${user.username}`)}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {t("nav.profile")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/configuracion")}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          {t("nav.settings")}
                        </DropdownMenuItem>

                        {/* Separador manual */}
                        <div className="my-1 h-px bg-border" />

                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer hover:bg-red-500/10 text-red-500"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t("nav.logout")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Botón menú móvil */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label={t("common.open")}
                  >
                    <Menu className="w-6 h-6 text-foreground" />
                  </button>
                </>
              ) : (
                <>
                  {/* Desktop no logueado */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link href="/registro">
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        {t("nav.register")}
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile no logueado */}
                  <div className="flex sm:hidden items-center gap-2">
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="border-border text-foreground">
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label={t("common.open")}
                    >
                      <Menu className="w-6 h-6 text-foreground" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Menú móvil */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}