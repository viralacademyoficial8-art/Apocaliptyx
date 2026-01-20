// src/app/contacto/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MessageCircle, MapPin, Clock, Send } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contacto | Apocaliptyx",
  description: "Ponte en contacto con el equipo de Apocaliptyx",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Contacto</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            ¿Tienes alguna pregunta, sugerencia o necesitas ayuda? Estamos aquí para ti.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Información de contacto */}
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Chat en Vivo</h3>
                  <p className="text-sm text-gray-400">Respuesta inmediata</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                La forma más rápida de obtener ayuda. Nuestro equipo responde en minutos.
              </p>
              <Link
                href="/soporte"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Iniciar Chat
              </Link>
            </div>

            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Email</h3>
                  <p className="text-sm text-gray-400">Respuesta en 24-48h</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Para consultas detalladas o temas que requieran documentación.
              </p>
              <a
                href="mailto:contacto@apocaliptyx.com"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                contacto@apocaliptyx.com
              </a>
            </div>

            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Horario de Atención</h3>
                  <p className="text-sm text-gray-400">Zona horaria CST</p>
                </div>
              </div>
              <div className="space-y-2 text-gray-400">
                <p><span className="text-white">Lunes - Viernes:</span> 9:00 AM - 6:00 PM</p>
                <p><span className="text-white">Sábado:</span> 10:00 AM - 2:00 PM</p>
                <p><span className="text-white">Domingo:</span> Cerrado</p>
              </div>
            </div>

            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Ubicación</h3>
                  <p className="text-sm text-gray-400">Oficinas centrales</p>
                </div>
              </div>
              <p className="text-gray-400">
                Ciudad de México, México<br />
                Operamos de forma remota a nivel global
              </p>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold mb-6">Envíanos un mensaje</h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Asunto
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Selecciona un tema</option>
                  <option value="general">Consulta general</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="pagos">Pagos y facturación</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="prensa">Prensa y medios</option>
                  <option value="partnership">Colaboraciones</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={5}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Enviar Mensaje
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Al enviar este formulario, aceptas nuestra{" "}
              <Link href="/politica-de-privacidad" className="text-purple-400 hover:text-purple-300">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>

        {/* Links rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/ayuda"
            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-center"
          >
            <h3 className="font-bold text-white mb-1">Centro de Ayuda</h3>
            <p className="text-sm text-gray-400">Artículos y guías</p>
          </Link>
          <Link
            href="/faq"
            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-center"
          >
            <h3 className="font-bold text-white mb-1">FAQ</h3>
            <p className="text-sm text-gray-400">Preguntas frecuentes</p>
          </Link>
          <Link
            href="/soporte"
            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-center"
          >
            <h3 className="font-bold text-white mb-1">Soporte Técnico</h3>
            <p className="text-sm text-gray-400">Chat en tiempo real</p>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}