import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

// Si tienes Footer real, descomenta el import y el componente.
// import { Footer } from "@/components/Footer";

export default function TiendaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Si tu Navbar es fixed/sticky y se encima, activa este padding:
          <main className="pt-16"> 
      */}
      <main>{children}</main>

      {/* <Footer /> */}
    </div>
  );
}
