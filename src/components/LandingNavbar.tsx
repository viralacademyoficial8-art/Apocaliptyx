"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/MobileMenu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Menu, MessageCircle, Trophy, Sparkles } from "lucide-react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

              {/* Auth Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-3">
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
              </div>

              {/* Mobile/Tablet: Gradient Register Button + Menu */}
              <div className="flex sm:hidden items-center gap-2">
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
