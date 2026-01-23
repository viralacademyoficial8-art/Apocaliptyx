export const dynamic = 'force-dynamic';

// src/app/ayuda/metodos-pago/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, CreditCard, CheckCircle, Globe } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Métodos de pago aceptados | Centro de Ayuda | Apocaliptyx",
  description: "Información sobre métodos de pago disponibles",
};

export default function MetodosPagoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Métodos de pago aceptados</h1>
          <p className="text-muted-foreground">Opciones disponibles para comprar AP Coins</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Tarjetas aceptadas</h2>
          
          <div className="grid gap-3 mb-8">
            {[
              { name: "Visa", color: "text-blue-400" },
              { name: "Mastercard", color: "text-orange-400" },
              { name: "American Express", color: "text-blue-300" },
              { name: "Discover", color: "text-orange-300" },
            ].map((card) => (
              <div key={card.name} className="flex items-center gap-3 bg-card/50 border border-border rounded-lg p-4">
                <CheckCircle className={`w-5 h-5 ${card.color}`} />
                <span className="text-foreground">{card.name}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Monedas soportadas</h2>
          
          <div className="flex items-start gap-3 bg-card/50 border border-border rounded-lg p-4 mb-8">
            <Globe className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground">
                Los precios se muestran en <strong>USD (dólares estadounidenses)</strong>. Tu banco puede aplicar conversión de moneda si tu tarjeta es de otro país.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Procesador de pagos</h2>
          
          <div className="bg-card/50 border border-border rounded-lg p-6 mb-8">
            <p className="text-foreground mb-4">
              Todos los pagos se procesan de forma segura a través de <strong className="text-purple-400">Stripe</strong>, uno de los procesadores de pago más confiables del mundo.
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Encriptación SSL de extremo a extremo</li>
              <li>• Cumplimiento PCI-DSS nivel 1</li>
              <li>• Protección contra fraude</li>
              <li>• Apocaliptyx nunca ve ni almacena datos de tu tarjeta</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-yellow-400 mb-2">¿Problemas con el pago?</h3>
            <p className="text-foreground">
              Si tu pago es rechazado, verifica que los datos sean correctos y que tu tarjeta tenga fondos suficientes. Algunos bancos bloquean compras internacionales por seguridad - contacta a tu banco si el problema persiste.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/comprar-coins" className="text-muted-foreground hover:text-foreground transition-colors">
              → ¿Cómo comprar AP Coins?
            </Link>
            <Link href="/ayuda/reembolsos" className="text-muted-foreground hover:text-foreground transition-colors">
              → Política de reembolsos
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}