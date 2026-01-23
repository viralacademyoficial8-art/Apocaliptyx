export const dynamic = 'force-dynamic';

// src/app/ayuda/premium/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Crown, CheckCircle, Zap, Shield, Star } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Beneficios premium | Centro de Ayuda | Apocaliptyx",
  description: "Descubre las ventajas de ser usuario premium",
};

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-4">
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Beneficios Premium</h1>
          <p className="text-muted-foreground">Lleva tu experiencia al siguiente nivel</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <p className="text-foreground leading-relaxed text-lg">
              Los usuarios Premium disfrutan de beneficios exclusivos que mejoran su experiencia en Apocaliptyx.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Beneficios incluidos</h2>
          
          <div className="space-y-3 mb-8">
            {[
              { icon: Zap, color: "text-yellow-400", text: "Bonus diario de AP Coins aumentado (2x)" },
              { icon: Star, color: "text-purple-400", text: "Insignia Premium exclusiva" },
              { icon: Shield, color: "text-blue-400", text: "Sin límite en creación de escenarios" },
              { icon: Crown, color: "text-orange-400", text: "Acceso anticipado a nuevas funciones" },
              { icon: CheckCircle, color: "text-green-400", text: "Soporte prioritario" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-card/50 border border-border rounded-lg p-4">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-card/50 border border-border rounded-xl p-6 mt-8">
            <h3 className="font-bold text-foreground mb-2">¿Cómo obtener Premium?</h3>
            <p className="text-muted-foreground mb-4">
              Puedes adquirir una suscripción Premium en la tienda. Los planes están disponibles mensual y anualmente.
            </p>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors"
            >
              <Crown className="w-5 h-5" />
              Ver planes Premium
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/comprar-coins" className="text-muted-foreground hover:text-foreground transition-colors">
              → ¿Cómo comprar AP Coins?
            </Link>
            <Link href="/ayuda/niveles-xp" className="text-muted-foreground hover:text-foreground transition-colors">
              → Sistema de niveles y XP
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}