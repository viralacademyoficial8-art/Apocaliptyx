export const dynamic = 'force-dynamic';

// src/app/ayuda/comprar-coins/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ShoppingCart, CreditCard, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "¿Cómo comprar AP Coins? | Centro de Ayuda | Apocaliptyx",
  description: "Guía para comprar paquetes de AP Coins",
};

export default function ComprarCoinsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-4">
            <ShoppingCart className="w-6 h-6 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¿Cómo comprar AP Coins?</h1>
          <p className="text-gray-400">Guía para adquirir paquetes de AP Coins</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed">
              Si quieres más AP Coins para participar en escenarios, puedes comprar paquetes en la tienda. Las compras se procesan de forma segura a través de Stripe.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Paso a paso</h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">1</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Ve a la Tienda</h3>
                <p className="text-sm text-gray-400">Haz clic en &quot;Tienda&quot; en el menú o ve directamente a <Link href="/tienda" className="text-orange-400">/tienda</Link></p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">2</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Selecciona un paquete</h3>
                <p className="text-sm text-gray-400">Elige el paquete que mejor se adapte a tus necesidades. Los paquetes más grandes suelen tener bonificaciones.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">3</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">Completa el pago</h3>
                <p className="text-sm text-gray-400">Ingresa los datos de tu tarjeta. El pago se procesa de forma segura con Stripe.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">4</div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex-1">
                <h3 className="font-semibold text-white mb-1">¡Recibe tus coins!</h3>
                <p className="text-sm text-gray-400">Los AP Coins se acreditan instantáneamente a tu cuenta.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Métodos de pago aceptados</h2>
          
          <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-8">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-gray-300">Tarjetas de crédito y débito (Visa, Mastercard, American Express)</p>
              <p className="text-sm text-gray-500">Procesado de forma segura por Stripe</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Seguridad</h2>
          
          <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-8">
            <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-300">
                <strong>Tus datos están protegidos.</strong> Apocaliptyx no almacena información de tarjetas. Todos los pagos se procesan directamente por Stripe, que cumple con los estándares PCI-DSS.
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">Importante</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Los AP Coins no tienen valor monetario fuera de la plataforma</li>
                  <li>• Las compras son finales y no reembolsables (salvo excepciones)</li>
                  <li>• Lee los <Link href="/terminos-y-condiciones" className="text-yellow-400">Términos de Servicio</Link> antes de comprar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/metodos-pago" className="text-gray-400 hover:text-white transition-colors">
              → Métodos de pago aceptados
            </Link>
            <Link href="/ayuda/reembolsos" className="text-gray-400 hover:text-white transition-colors">
              → Política de reembolsos
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}