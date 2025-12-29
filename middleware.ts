// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Aquí podrías meter reglas extras si quieres (roles, etc.)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // si hay token => está logueado
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protege SOLO estas rutas (ajústalas a tu app)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/perfil/:path*",
    "/tienda/:path*",
    "/inventario/:path*",
    "/foro/:path*",
    "/ranking/:path*",
    "/crear/:path*",
    "/admin/:path*",
    "/usuarios/:path*",
    "/items/:path*",
    "/promociones/:path*",
    "/reportes/:path*",
    "/usuarios/:path*",
  ],
};
