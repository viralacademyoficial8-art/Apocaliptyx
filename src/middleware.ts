// src/middleware.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/perfil",
  "/crear",
  "/configuracion",
  "/tienda",
];

// Rutas que requieren rol de admin
const adminRoutes = ["/admin"];

// Rutas públicas (no requieren auth)
const publicRoutes = ["/", "/login", "/registro", "/about", "/faq"];

// Roles que pueden acceder al panel de admin
const adminRoles = ["ADMIN", "SUPER_ADMIN", "STAFF", "MODERATOR"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/registro";

  // Si está en ruta de auth y ya está logueado, redirigir a dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Si está en ruta protegida y no está logueado, redirigir a login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está en ruta admin y no tiene rol de admin, redirigir a dashboard
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (!userRole || !adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};