// src/app/cookies/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Cookie } from "lucide-react";

export const metadata = {
  title: "Política de Cookies | Apocaliptyx",
  description: "Información sobre el uso de cookies en Apocaliptyx",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
            <Cookie className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Política de Cookies</h1>
          <p className="text-gray-400">Última actualización: Enero 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">¿Qué son las cookies?</h2>
            <p className="text-gray-400">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
              Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y proporcionar 
              información a los propietarios del sitio.
            </p>
          </div>

          <div className="space-y-6">
            <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cookies que utilizamos</h2>
              
              <div className="space-y-4">
                <div className="border-b border-gray-800 pb-4">
                  <h3 className="font-bold text-green-400 mb-2">🟢 Cookies Esenciales</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Necesarias para el funcionamiento básico del sitio. No se pueden desactivar.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Autenticación y sesión de usuario</li>
                    <li>• Preferencias de idioma</li>
                    <li>• Seguridad y prevención de fraude</li>
                  </ul>
                </div>

                <div className="border-b border-gray-800 pb-4">
                  <h3 className="font-bold text-blue-400 mb-2">🔵 Cookies de Rendimiento</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Nos ayudan a entender cómo los visitantes interactúan con el sitio.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Análisis de páginas visitadas</li>
                    <li>• Tiempo de permanencia</li>
                    <li>• Errores encontrados</li>
                  </ul>
                </div>

                <div className="border-b border-gray-800 pb-4">
                  <h3 className="font-bold text-purple-400 mb-2">🟣 Cookies de Funcionalidad</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Permiten recordar tus preferencias y personalizar tu experiencia.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Tema claro/oscuro</li>
                    <li>• Configuraciones de notificaciones</li>
                    <li>• Historial de búsqueda reciente</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-yellow-400 mb-2">🟡 Cookies de Marketing</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Utilizadas para mostrar anuncios relevantes (si aplica).
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Actualmente no utilizamos cookies de marketing</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cookies de terceros</h2>
              <p className="text-gray-400 mb-4">
                Utilizamos servicios de terceros que pueden establecer sus propias cookies:
              </p>
              <ul className="space-y-2 text-gray-400">
                <li><strong className="text-white">Supabase:</strong> Gestión de autenticación y base de datos</li>
                <li><strong className="text-white">Stripe:</strong> Procesamiento de pagos seguros</li>
                <li><strong className="text-white">Vercel:</strong> Hosting y análisis de rendimiento</li>
              </ul>
            </section>

            <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cómo gestionar las cookies</h2>
              <p className="text-gray-400 mb-4">
                Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las cookies 
                que ya están en tu dispositivo y configurar la mayoría de los navegadores para evitar que se coloquen.
              </p>
              <p className="text-gray-400">
                Sin embargo, si haces esto, es posible que tengas que ajustar manualmente algunas preferencias 
                cada vez que visites el sitio, y algunos servicios y funcionalidades pueden no funcionar.
              </p>
            </section>

            <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Configuración por navegador</h2>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/es-mx/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                    Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </section>

            <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Contacto</h2>
              <p className="text-gray-400">
                Si tienes preguntas sobre nuestra política de cookies, contáctanos en:{" "}
                <a href="mailto:privacidad@apocaliptyx.com" className="text-purple-400 hover:text-purple-300">
                  privacidad@apocaliptyx.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}