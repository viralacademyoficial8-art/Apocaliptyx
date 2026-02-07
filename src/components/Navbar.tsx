"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores";
import { NotificationCenter } from "@/components/NotificationCenter";
import { MobileMenu } from "@/components/MobileMenu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { usePermissions } from "@/hooks/usePermissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skull, Menu, Flame, User, Settings, LogOut, ChevronDown, Shield, Infinity, HelpCircle, MessageCircle, Users, Film, Radio, Trophy, Sparkles, Mail, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user, logout, refreshBalance } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { hasInfiniteCoins, isAdmin, roleName, roleIcon, roleColor } = usePermissions();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Determinar si está autenticado (priorizar session de NextAuth)
  const isLoggedIn = status === "authenticated" && !!session?.user;

  // Usar datos de Zustand si existen, sino de la session
  const currentUser = user || (session?.user ? {
    id: session.user.id || "",
    email: session.user.email || "",
    username: session.user.username || session.user.email?.split("@")[0] || "user",
    displayName: session.user.name || "Usuario",
    avatarUrl: session.user.image || "",
    apCoins: null, // null indica que aún no se ha cargado
    role: session.user.role || "USER",
  } : null);

  // Cargar datos del usuario desde la BD cuando esté autenticado
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // refreshBalance() crea el usuario en Zustand si no existe
      refreshBalance();
    }
  }, [status, session, refreshBalance, pathname]);

  const navItems = [
    { href: "/explorar", label: t("nav.scenarios") },
    { href: "/tienda", label: t("nav.shop") },
    { href: "/leaderboard", label: t("nav.rankings") },
    { href: "/foro", label: t("nav.forum") },
  ];

  const handleLogout = async () => {
    logout();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 safe-area-left safe-area-right">
          <div className="flex items-center justify-between h-16">
            {/* Logo - cambia según el tema */}
            <Link
              href={isLoggedIn ? "/explorar" : "/"}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src={resolvedTheme === 'dark' ? "/apocaliptyx-logo.png" : "/Diseño_sin_título__46_-removebg-preview.png"}
                alt="Apocaliptyx"
                width={resolvedTheme === 'dark' ? 140 : 180}
                height={resolvedTheme === 'dark' ? 40 : 50}
                className={resolvedTheme === 'dark' ? "h-8 sm:h-10 w-auto" : "h-10 sm:h-12 w-auto"}
                priority
              />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block ml-4">
              <SearchBar variant="navbar" />
            </div>

            {/* Navegación desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
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
              
              {/* Botón Crear Escenario */}
              {isLoggedIn && (
                <Link
                  href="/crear"
                  className={`
                    px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5
                    ${
                      pathname === "/crear"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }
                  `}
                >
                  {t("nav.createScenario")}
                </Link>
              )}

              {/* Link al panel de admin (solo para roles con acceso) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`
                    px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5
                    ${
                      pathname.startsWith("/admin")
                        ? "bg-red-500/20 text-red-400"
                        : "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                    }
                  `}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Zona derecha */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors group"
                aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                )}
              </button>

              {/* Selector de idioma (siempre visible) */}
              <LanguageSelector variant="default" />

              {isLoggedIn && currentUser ? (
                <>
                  {/* AP Coins (solo sm+) */}
                  <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    hasInfiniteCoins 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                      : 'bg-muted'
                  }`}>
                    <Flame className="w-4 h-4 text-yellow-500" />
                    {hasInfiniteCoins ? (
                      <div className="flex items-center gap-1">
                        <Infinity className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs text-yellow-500/70 font-medium">
                          {roleIcon}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-yellow-400 text-sm">
                        {user?.apCoins != null ? user.apCoins.toLocaleString("es-MX") : '...'}
                      </span>
                    )}
                  </div>

                  {/* Centro de Notificaciones (única campanita) */}
                  <NotificationCenter />

                  {/* Dropdown usuario (desktop) */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
                          <div className="relative">
                            <Avatar className={`w-8 h-8 border-2 ${isAdmin ? 'border-yellow-500' : 'border-border'}`}>
                              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
                              <AvatarFallback className="text-sm bg-gradient-to-br from-purple-600 to-pink-600">
                                {currentUser.username?.substring(0, 2).toUpperCase() || "US"}
                              </AvatarFallback>
                            </Avatar>
                            {/* Badge de rol para admin */}
                            {isAdmin && (
                              <span className="absolute -bottom-1 -right-1 text-xs">
                                {roleIcon}
                              </span>
                            )}
                          </div>
                          <div className="hidden lg:block text-left">
                            <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                              {currentUser.displayName ?? currentUser.username}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              @{currentUser.username}
                              {isAdmin && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${roleColor.bg} ${roleColor.text}`}>
                                  {roleName}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-56 bg-card border border-border">
                        {/* Header manual */}
                        <div className="px-3 py-2 border-b border-border">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                              {currentUser.displayName ?? currentUser.username}
                            </p>
                            {isAdmin && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleColor.bg} ${roleColor.text}`}>
                                {roleIcon} {roleName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Flame className="w-3 h-3 text-yellow-500" />
                            {hasInfiniteCoins ? (
                              <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
                                <Infinity className="w-4 h-4" /> AP Coins Infinitas
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-yellow-400">
                                {user?.apCoins != null ? user.apCoins.toLocaleString("es-MX") : '...'} AP Coins
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Opciones */}
                        <DropdownMenuItem
                          onClick={() => router.push(`/perfil/${currentUser.username}`)}
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

                        <DropdownMenuItem
                          onClick={() => router.push("/mensajes")}
                          className="cursor-pointer hover:bg-blue-500/10"
                        >
                          <Mail className="mr-2 h-4 w-4 text-blue-400" />
                          Mensajes
                        </DropdownMenuItem>

                        {/* Separador - Social */}
                        <div className="my-1 h-px bg-border" />
                        <div className="px-2 py-1">
                          <span className="text-xs text-muted-foreground font-medium">{t("nav.social")}</span>
                        </div>

                        {/* COMUNIDADES - OCULTO TEMPORALMENTE PARA MVP
                        <DropdownMenuItem
                          onClick={() => router.push("/foro?tab=comunidades")}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <Users className="mr-2 h-4 w-4 text-blue-400" />
                          {t("nav.communities")}
                        </DropdownMenuItem>
                        */}

                        <DropdownMenuItem
                          onClick={() => router.push("/reels")}
                          className="cursor-pointer hover:bg-pink-500/10"
                        >
                          <Film className="mr-2 h-4 w-4 text-pink-400" />
                          {t("nav.reels")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/streaming")}
                          className="cursor-pointer hover:bg-red-500/10"
                        >
                          <Radio className="mr-2 h-4 w-4 text-red-400" />
                          {t("nav.streaming")}
                        </DropdownMenuItem>

                        {/* Ocultos temporalmente:
                        <DropdownMenuItem
                          onClick={() => router.push("/coleccionables")}
                          className="cursor-pointer hover:bg-yellow-500/10"
                        >
                          <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                          {t("nav.collectibles")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/torneos")}
                          className="cursor-pointer hover:bg-orange-500/10"
                        >
                          <Trophy className="mr-2 h-4 w-4 text-orange-400" />
                          {t("nav.tournaments")}
                        </DropdownMenuItem>
                        */}

                        {/* Separador */}
                        <div className="my-1 h-px bg-border" />

                        {/* Centro de Ayuda */}
                        <DropdownMenuItem
                          onClick={() => router.push("/ayuda")}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <HelpCircle className="mr-2 h-4 w-4" />
                          {t("nav.helpCenter")}
                        </DropdownMenuItem>

                        {/* Soporte Técnico */}
                        <DropdownMenuItem
                          onClick={() => router.push("/soporte")}
                          className="cursor-pointer hover:bg-purple-500/10 text-purple-400"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          {t("nav.support")}
                        </DropdownMenuItem>

                        {/* Link al admin panel */}
                        {isAdmin && (
                          <>
                            <div className="my-1 h-px bg-border" />
                            <DropdownMenuItem
                              onClick={() => router.push("/admin")}
                              className="cursor-pointer hover:bg-red-500/10 text-red-400"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {t("nav.adminPanel")}
                            </DropdownMenuItem>
                          </>
                        )}

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

                  {/* Botón menú móvil - Gradient Style */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden relative group p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                    aria-label={t("common.open")}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-accent-primary/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                    <div className="relative p-1 bg-card border border-border rounded-lg group-hover:border-accent transition-colors">
                      <Menu className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
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

                  {/* Mobile no logueado - Gradient Style */}
                  <div className="flex sm:hidden items-center gap-2">
                    {/* Login button with gradient border */}
                    <Link href="/login" className="relative group">
                      <div className="absolute -inset-0.5 bg-accent-primary/30 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-accent/30 hover:bg-muted/50 transition-all"
                      >
                        {t("nav.login")}
                      </Button>
                    </Link>

                    {/* Menu button */}
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="relative group p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                      aria-label={t("common.open")}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-accent-primary/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                      <div className="relative p-1 bg-card border border-border rounded-lg group-hover:border-accent transition-colors">
                        <Menu className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
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