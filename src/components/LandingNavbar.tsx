"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAuthStore } from "@/lib/stores";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/MobileMenu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, MessageCircle, Trophy, Sparkles, User, Settings, LogOut, ChevronDown, Flame, Infinity, Shield } from "lucide-react";

export function LandingNavbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const { user, logout, refreshBalance } = useAuthStore();
  const { hasInfiniteCoins, isAdmin, roleName, roleIcon, roleColor } = usePermissions();

  // Determinar si está autenticado
  const isLoggedIn = status === "authenticated" && !!session?.user;

  // Usar datos de Zustand si existen, sino de la session
  const currentUser = user || (session?.user ? {
    id: session.user.id || "",
    email: session.user.email || "",
    username: session.user.username || session.user.email?.split("@")[0] || "user",
    displayName: session.user.name || "Usuario",
    avatarUrl: session.user.image || "",
    apCoins: null,
    role: session.user.role || "USER",
  } : null);

  // Cargar datos del usuario desde la BD cuando esté autenticado
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      refreshBalance();
    }
  }, [status, session, refreshBalance]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    logout();
    await signOut({ callbackUrl: "/" });
  };

  const navItems = [
    { href: "/foro", label: "Comunidad", icon: MessageCircle },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-area-top ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-purple-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-left safe-area-right">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <Image
                src="/apocaliptyx-logo.png"
                alt="Apocaliptyx"
                width={180}
                height={50}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 backdrop-blur-sm rounded-full p-1 border border-zinc-800/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-5 py-2 text-zinc-400 hover:text-foreground rounded-full hover:bg-zinc-800/50 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile/Tablet: Nav icons with gradient style */}
              <div className="flex md:hidden items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const gradients: Record<string, string> = {
                    "/foro": "from-green-500 to-emerald-500",
                    "/leaderboard": "from-yellow-500 to-orange-500",
                  };
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative group p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[item.href]} rounded-xl opacity-0 group-hover:opacity-20 transition-opacity`} />
                      <div className={`p-1.5 bg-gradient-to-br ${gradients[item.href]} rounded-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Language Selector - All devices */}
              <div className="hidden xs:block sm:block">
                <LanguageSelector variant="minimal" />
              </div>

              {/* Auth Buttons / User Dropdown - Desktop */}
              <div className="hidden sm:flex items-center gap-3">
                {isLoggedIn && currentUser ? (
                  <>
                    {/* AP Coins */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      hasInfiniteCoins
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                        : 'bg-zinc-800/50'
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

                    {/* User Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 hover:bg-zinc-800/50 rounded-xl px-2 py-1.5 transition-colors">
                          <div className="relative">
                            <Avatar className={`w-8 h-8 border-2 ${isAdmin ? 'border-yellow-500' : 'border-zinc-700'}`}>
                              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
                              <AvatarFallback className="text-sm bg-gradient-to-br from-purple-600 to-pink-600">
                                {currentUser.username?.substring(0, 2).toUpperCase() || "US"}
                              </AvatarFallback>
                            </Avatar>
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
                            <div className="text-xs text-zinc-400 flex items-center gap-1">
                              @{currentUser.username}
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-zinc-400 hidden lg:block" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border border-zinc-800">
                        {/* Header */}
                        <div className="px-3 py-2 border-b border-zinc-800">
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
                          <p className="text-xs text-zinc-400">@{currentUser.username}</p>
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

                        {/* Options */}
                        <DropdownMenuItem
                          onClick={() => router.push("/explorar")}
                          className="cursor-pointer hover:bg-zinc-800"
                        >
                          <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                          Ir a Explorar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push(`/perfil/${currentUser.username}`)}
                          className="cursor-pointer hover:bg-zinc-800"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Mi Perfil
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/configuracion")}
                          className="cursor-pointer hover:bg-zinc-800"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configuración
                        </DropdownMenuItem>

                        {isAdmin && (
                          <>
                            <div className="my-1 h-px bg-zinc-800" />
                            <DropdownMenuItem
                              onClick={() => router.push("/admin")}
                              className="cursor-pointer hover:bg-red-500/10 text-red-400"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Panel Admin
                            </DropdownMenuItem>
                          </>
                        )}

                        <div className="my-1 h-px bg-zinc-800" />

                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer hover:bg-red-500/10 text-red-500"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="text-zinc-400 hover:text-foreground hover:bg-zinc-800/50 rounded-xl px-5"
                      >
                        Iniciar Sesion
                      </Button>
                    </Link>
                    <Link href="/registro">
                      <Button className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl px-6 font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Comenzar
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile/Tablet: User Avatar or Register Button + Menu */}
              <div className="flex sm:hidden items-center gap-2">
                {isLoggedIn && currentUser ? (
                  <>
                    {/* Mobile User Avatar Button - Opens menu */}
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="relative group flex items-center gap-2"
                    >
                      <div className={`absolute -inset-1 bg-gradient-to-r ${isAdmin ? 'from-yellow-500/40 to-orange-500/40' : 'from-purple-600/40 to-pink-600/40'} rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity`} />
                      <div className="relative flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-2 py-1.5">
                        <Avatar className={`w-7 h-7 border-2 ${isAdmin ? 'border-yellow-500' : 'border-zinc-600'}`}>
                          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-600 to-pink-600">
                            {currentUser.username?.substring(0, 2).toUpperCase() || "US"}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/registro" className="relative group">
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                      <Button
                        size="sm"
                        className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold rounded-xl px-4 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Unirse
                      </Button>
                    </Link>

                    {/* Gradient Menu Button */}
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="relative group p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                      aria-label="Abrir menu"
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                      <div className="relative p-1 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-lg group-hover:border-purple-500/30 transition-colors">
                        <Menu className="w-5 h-5 text-zinc-300 group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
