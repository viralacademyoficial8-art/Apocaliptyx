export const dynamic = 'force-dynamic';

// src/app/privacidad/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skull, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Politica de Privacidad | Apocaliptyx",
  description: "Politica de privacidad y proteccion de datos de Apocaliptyx",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">POLITICA DE PRIVACIDAD DE APOCALIPTYX</h1>
          <p className="text-muted-foreground">Ultima actualizacion: 8 de enero de 2026</p>
          <p className="text-muted-foreground">Contacto oficial: contacto@apocaliptyx.com</p>
        </div>

        {/* Intro */}
        <div className="mb-8 p-6 bg-card/50 border border-border rounded-xl">
          <p className="text-foreground leading-relaxed">
            En Apocaliptyx (&quot;nosotros&quot;, &quot;la Plataforma&quot;) nos comprometemos a proteger tu privacidad y tus datos personales. Esta Politica de Privacidad describe como recopilamos, usamos, almacenamos y protegemos tu informacion cuando utilizas nuestra plataforma. Al usar Apocaliptyx, aceptas las practicas descritas en esta politica.
          </p>
          <p className="text-foreground leading-relaxed mt-4">
            Esta politica complementa nuestros <Link href="/terminos-y-condiciones" className="text-purple-400 hover:text-purple-300">Terminos de Servicio</Link>. Te recomendamos leer ambos documentos para comprender completamente tus derechos y obligaciones.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">1. INFORMACION QUE RECOPILAMOS</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Recopilamos diferentes tipos de informacion para proporcionarte nuestros servicios:
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">1.1 Informacion que nos proporcionas directamente</h3>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li><strong>Datos de registro:</strong> nombre de usuario, direccion de correo electronico y contrasena.</li>
              <li><strong>Informacion de perfil:</strong> foto de perfil, biografia, preferencias de usuario.</li>
              <li><strong>Contenido:</strong> escenarios, predicciones, comentarios y publicaciones que creas.</li>
              <li><strong>Comunicaciones:</strong> mensajes que nos envias a traves de soporte o contacto.</li>
            </ul>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">1.2 Informacion recopilada automaticamente</h3>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li><strong>Datos de uso:</strong> paginas visitadas, funciones utilizadas, interacciones con el contenido.</li>
              <li><strong>Datos del dispositivo:</strong> tipo de dispositivo, sistema operativo, navegador, direccion IP.</li>
              <li><strong>Cookies y tecnologias similares:</strong> para mejorar tu experiencia y recordar tus preferencias.</li>
              <li><strong>Datos de ubicacion general:</strong> pais o region basada en tu direccion IP.</li>
            </ul>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">1.3 Informacion de terceros</h3>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li><strong>Proveedores de autenticacion:</strong> si inicias sesion con Google, Discord u otros servicios.</li>
              <li><strong>Proveedores de pago:</strong> informacion de transacciones procesadas por Stripe u otros procesadores.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">2. USO DE COOKIES</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Utilizamos cookies y tecnologias similares para mejorar tu experiencia en la Plataforma. Las cookies son pequenos archivos de texto que se almacenan en tu dispositivo.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">2.1 Tipos de cookies que utilizamos</h3>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li><strong>Cookies necesarias:</strong> Esenciales para el funcionamiento del sitio, incluyendo autenticacion, seguridad y preferencias basicas. No se pueden desactivar.</li>
              <li><strong>Cookies de analisis:</strong> Nos ayudan a entender como usas el sitio para mejorar tu experiencia (Google Analytics, etc.).</li>
              <li><strong>Cookies de marketing:</strong> Utilizadas para mostrarte anuncios relevantes basados en tus intereses.</li>
              <li><strong>Cookies de preferencias:</strong> Recuerdan tus configuraciones como idioma, tema y otras preferencias personalizadas.</li>
            </ul>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">2.2 Gestion de cookies</h3>
            <p className="text-foreground leading-relaxed">
              Puedes gestionar tus preferencias de cookies en cualquier momento a traves del banner de cookies o desde la configuracion de tu navegador. Ten en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del sitio.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">3. COMO USAMOS TU INFORMACION</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Utilizamos tu informacion para los siguientes propositos:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li><strong>Proporcionar y mejorar el servicio:</strong> operar la Plataforma, procesar transacciones y personalizar tu experiencia.</li>
              <li><strong>Comunicaciones:</strong> enviarte notificaciones, actualizaciones, alertas de seguridad y mensajes de soporte.</li>
              <li><strong>Seguridad:</strong> detectar y prevenir fraude, abuso y actividades no autorizadas.</li>
              <li><strong>Analisis:</strong> entender como se usa la Plataforma para mejorar nuestros servicios.</li>
              <li><strong>Cumplimiento legal:</strong> cumplir con obligaciones legales y responder a solicitudes de autoridades.</li>
              <li><strong>Marketing:</strong> con tu consentimiento, enviarte informacion sobre nuevas funciones y promociones.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">4. COMPARTIR INFORMACION</h2>
            <p className="text-foreground leading-relaxed mb-4">
              No vendemos tu informacion personal. Podemos compartir tu informacion en las siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li><strong>Proveedores de servicios:</strong> compartimos datos con terceros que nos ayudan a operar la Plataforma (hosting, pagos, analisis).</li>
              <li><strong>Cumplimiento legal:</strong> cuando sea requerido por ley, orden judicial o autoridad competente.</li>
              <li><strong>Proteccion de derechos:</strong> para proteger los derechos, seguridad o propiedad de Apocaliptyx, nuestros usuarios o terceros.</li>
              <li><strong>Contenido publico:</strong> el contenido que publicas (escenarios, comentarios) es visible para otros usuarios segun tu configuracion de privacidad.</li>
              <li><strong>Transferencias empresariales:</strong> en caso de fusion, adquisicion o venta de activos.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">5. SEGURIDAD DE TUS DATOS</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Implementamos medidas de seguridad tecnicas y organizativas para proteger tu informacion:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li>Encriptacion de datos en transito (HTTPS/TLS) y en reposo.</li>
              <li>Acceso restringido a datos personales solo a personal autorizado.</li>
              <li>Monitoreo continuo de seguridad y deteccion de amenazas.</li>
              <li>Copias de seguridad regulares y planes de recuperacion.</li>
              <li>Autenticacion segura y gestion de sesiones.</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              Sin embargo, ningun sistema es 100% seguro. Te recomendamos usar contrasenas fuertes y no compartir tus credenciales.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">6. RETENCION DE DATOS</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Retenemos tu informacion mientras tu cuenta este activa o sea necesaria para proporcionarte servicios. Tambien podemos retener informacion para:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li>Cumplir con obligaciones legales y regulatorias.</li>
              <li>Resolver disputas y hacer cumplir nuestros acuerdos.</li>
              <li>Prevenir fraude y abuso.</li>
              <li>Mantener registros de transacciones financieras segun las leyes aplicables.</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              Cuando elimines tu cuenta, eliminaremos o anonimizaremos tu informacion, excepto cuando debamos retenerla por razones legales.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">7. TUS DERECHOS</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Dependiendo de tu ubicacion, puedes tener los siguientes derechos sobre tus datos personales:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
              <li><strong>Acceso:</strong> solicitar una copia de tus datos personales.</li>
              <li><strong>Rectificacion:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Eliminacion:</strong> solicitar la eliminacion de tus datos.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado.</li>
              <li><strong>Oposicion:</strong> oponerte al procesamiento de tus datos para ciertos fines.</li>
              <li><strong>Retiro del consentimiento:</strong> retirar tu consentimiento en cualquier momento.</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              Para ejercer estos derechos, contactanos en <a href="mailto:contacto@apocaliptyx.com" className="text-purple-400 hover:text-purple-300">contacto@apocaliptyx.com</a>. Responderemos dentro de los plazos legales aplicables.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">8. MENORES DE EDAD</h2>
            <p className="text-foreground leading-relaxed">
              Apocaliptyx esta destinado exclusivamente a personas mayores de 18 anos. No recopilamos intencionalmente informacion de menores de edad. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos de inmediato. Si crees que tenemos informacion de un menor, contactanos inmediatamente.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">9. TRANSFERENCIAS INTERNACIONALES</h2>
            <p className="text-foreground leading-relaxed">
              Tu informacion puede ser transferida y almacenada en servidores ubicados fuera de tu pais de residencia. Cuando transferimos datos internacionalmente, implementamos medidas de proteccion adecuadas, como clausulas contractuales estandar, para garantizar que tus datos esten protegidos conforme a las leyes aplicables.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">10. CAMBIOS A ESTA POLITICA</h2>
            <p className="text-foreground leading-relaxed">
              Podemos actualizar esta Politica de Privacidad periodicamente. Te notificaremos sobre cambios significativos publicando la nueva politica en la Plataforma y actualizando la fecha de &quot;ultima actualizacion&quot;. Te recomendamos revisar esta politica regularmente. El uso continuado de la Plataforma despues de los cambios constituye tu aceptacion de la politica actualizada.
            </p>
          </section>

          {/* Section 11 */}
          <section className="p-6 bg-card/30 border border-border rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">11. CONTACTO</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Si tienes preguntas, inquietudes o solicitudes relacionadas con esta Politica de Privacidad o el tratamiento de tus datos personales, puedes contactarnos en:
            </p>
            <ul className="list-none text-foreground space-y-2 ml-4">
              <li><strong>Correo electronico:</strong> <a href="mailto:contacto@apocaliptyx.com" className="text-purple-400 hover:text-purple-300">contacto@apocaliptyx.com</a></li>
              <li><strong>Asunto sugerido:</strong> &quot;Solicitud de Privacidad - [Tu solicitud]&quot;</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              Nos comprometemos a responder a tus solicitudes de manera oportuna y conforme a las leyes aplicables de proteccion de datos.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            <Skull className="w-5 h-5" />
            Volver al inicio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
