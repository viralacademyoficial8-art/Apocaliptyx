"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = 3,
  gap = "md",
  className,
}: ResponsiveGridProps) {
  const colClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const gapClasses: Record<string, string> = {
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface SidebarGridProps {
  children: ReactNode;
  sidebar: ReactNode;
  sidebarPosition?: "left" | "right";
  className?: string;
}

export function SidebarGrid({
  children,
  sidebar,
  sidebarPosition = "right",
  className,
}: SidebarGridProps) {
  return (
    <div
      className={cn("grid gap-6 lg:gap-8", "grid-cols-1 lg:grid-cols-3", className)}
    >
      {sidebarPosition === "left" && (
        <aside className="lg:col-span-1 order-2 lg:order-1">{sidebar}</aside>
      )}

      <main
        className={cn(
          "lg:col-span-2",
          sidebarPosition === "left" ? "order-1 lg:order-2" : ""
        )}
      >
        {children}
      </main>

      {sidebarPosition === "right" && (
        <aside className="lg:col-span-1">{sidebar}</aside>
      )}
    </div>
  );
}
