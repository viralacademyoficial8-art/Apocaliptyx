"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/MobileMenu";
import { Skull, Menu, MessageCircle, Trophy } from "lucide-react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/foro", label: "Comunidad", icon: MessageCircle },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Skull className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
              <span className="text-lg sm:text-xl font-bold hidden sm:block text-foreground">
                APOCALIPTICS
              </span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile: Nav icons */}
              <div className="flex md:hidden items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>

              {/* Auth Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Registrarse
                  </Button>
                </Link>
              </div>

              {/* Mobile: Login + Menu */}
              <div className="flex sm:hidden items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground text-sm"
                  >
                    Entrar
                  </Button>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6 text-foreground" />
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
