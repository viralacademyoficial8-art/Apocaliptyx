"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/MobileMenu";
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-purple-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl">
                  <Image
                    src="/apocaliptyx-logo.png"
                    alt="Apocaliptics"
                    width={28}
                    height={28}
                    className="w-6 h-6 sm:w-7 sm:h-7"
                  />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight hidden sm:block">
                <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  APOCALIPTICS
                </span>
              </span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 backdrop-blur-sm rounded-full p-1 border border-zinc-800/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-5 py-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/50 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Mobile: Nav icons */}
              <div className="flex md:hidden items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>

              {/* Auth Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl px-5"
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

              {/* Mobile: Login + Menu */}
              <div className="flex sm:hidden items-center gap-2">
                <Link href="/registro">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-xl px-4 shadow-lg shadow-purple-500/25"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Unirse
                  </Button>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2.5 hover:bg-zinc-800/50 rounded-xl transition-colors"
                  aria-label="Abrir menu"
                >
                  <Menu className="w-6 h-6 text-zinc-300" />
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
