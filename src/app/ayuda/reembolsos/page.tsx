// src/app/ayuda/reembolsos/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, RefreshCcw, CheckCircle, XCircle, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Política de reembolsos | Centro de Ayuda | Apocaliptyx",
  description: "Información sobre reembolsos de AP Coins",
};

export default function ReembolsosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Ayuda
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-4">
            <RefreshCcw className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Política de reembolsos</h1>
          <p className="text-gray-400">Información sobre devoluciones y reembolsos</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed text-lg">
              <strong>Las compras de AP Coins son finales y no reembolsables.</strong> Los AP Coins son bienes digitales para uso inmediato dentro de la plataforma.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Excepciones</h2>
          
          <p className="text-gray-300 mb-4">Solo consideramos reembolsos en casos excepcionales:</p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300"><strong>Error técnico comprobable</strong></p>
                <p className="text-sm text-gray-500">Si pagaste pero no recibiste los AP Coins por un error de nuestro sistema.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300"><strong>Cobro duplicado verificable</strong></p>
                <p className="text-sm text-gray-500">Si se te cobró dos veces por la misma transacción.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">No se otorgan reembolsos por:</h2>
          
          <div className="space-y-3 mb-8">
            {[
              "Cambio de opinión después de la compra",
              "AP Coins ya utilizados en predicciones",
              "Pérdidas en escenarios",
              "No usar los AP Coins comprados",
              "Suspensión de cuenta por violar términos",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">¿Cómo solicitar un reembolso?</h2>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
            <p className="text-gray-300 mb-4">
              Si crees que tienes derecho a un reembolso, envía una solicitud dentro de las <strong>72 horas</strong> posteriores a la transacción:
            </p>
            <ol className="space-y-2 text-gray-400">
              <li>1. Envía un email a <span className="text-purple-400">contacto@apocaliptyx.com</span></li>
              <li>2. Incluye el ID de transacción o folio de pago</li>
              <li>3. Describe el problema detalladamente</li>
              <li>4. Adjunta capturas de pantalla si es posible</li>
            </ol>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mt-8">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-6 h-6 text-blue-400" />
              <h3 className="font-bold text-white">Contacto para reembolsos</h3>
            </div>
            <p className="text-gray-300">
              <a href="mailto:contacto@apocaliptyx.com" className="text-blue-400 hover:text-blue-300">
                contacto@apocaliptyx.com
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-2">Tiempo de respuesta: 24-48 horas hábiles</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="font-bold text-white mb-4">Artículos relacionados</h3>
          <div className="grid gap-2">
            <Link href="/ayuda/comprar-coins" className="text-gray-400 hover:text-white transition-colors">
              → ¿Cómo comprar AP Coins?
            </Link>
            <Link href="/terminos-y-condiciones" className="text-gray-400 hover:text-white transition-colors">
              → Términos de Servicio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}