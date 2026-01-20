"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { LandingNavbar } from "@/components/LandingNavbar";
import { ResponsiveContainer } from "./ResponsiveContainer";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function PageLayout({
  children,
  title,
  subtitle,
  headerAction,
  containerSize = "xl",
  className,
  showBackButton = false,
  onBack,
}: PageLayoutProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleBack = () => {
    if (onBack) return onBack();
    if (typeof window !== "undefined") window.history.back();
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {isAuthenticated ? <Navbar /> : <LandingNavbar />}

      <ResponsiveContainer size={containerSize} as="main">
        <div className={cn("py-6 sm:py-8", className)}>
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm sm:text-base">Volver</span>
            </button>
          )}

          {(title || headerAction) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                {title && (
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-400 mt-1 text-sm sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>

              {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
            </div>
          )}

          {children}
        </div>
      </ResponsiveContainer>
    </div>
  );
}
