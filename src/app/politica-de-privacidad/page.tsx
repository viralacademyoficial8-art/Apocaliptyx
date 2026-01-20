// src/app/privacidad/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skull, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Apocaliptyx",
  description: "Política de privacidad y protección de datos de Apocaliptyx",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">POLÍTICA DE PRIVACIDAD DE APOCALIPTYX</h1>
          <p className="text-gray-400 text-sm">(Integrada: LFPDPPP – México + GDPR – Unión Europea)</p>
          <p className="text-gray-400 mt-2">Última actualización: 2 de enero de 2026</p>
          <p className="text-gray-400">Responsable del tratamiento: Apocalyptix</p>
          <p className="text-gray-400">Correo de contacto: contacto@apocaliptyx.com</p>
        </div>

        {/* Intro */}
        <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-gray-300 leading-relaxed">
            La presente Política de Privacidad (la &quot;Política&quot;) describe de manera clara, detallada y transparente cómo Apocalyptix trata los datos personales de las personas que utilizan la Plataforma, en cumplimiento de la legislación mexicana aplicable en materia de protección de datos personales (Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su Reglamento), así como del Reglamento General de Protección de Datos de la Unión Europea (GDPR), cuando resulte aplicable.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Al utilizar la Plataforma, crear una cuenta o interactuar con cualquiera de sus funcionalidades, otorgas tu consentimiento para el tratamiento de tus datos personales conforme a los términos de esta Política.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">1. Identidad del responsable y base legal del tratamiento</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Apocalyptix es el responsable del tratamiento de los datos personales recabados a través de la Plataforma. Esto significa que Apocalyptix decide sobre las finalidades y medios del tratamiento, y asume la responsabilidad por el cumplimiento de las obligaciones legales correspondientes.
            </p>
            <p className="text-gray-300 leading-relaxed">
              La base legal para el tratamiento de tus datos personales es, según corresponda: tu consentimiento expreso al aceptar esta Política; la necesidad del tratamiento para la ejecución de un contrato o relación jurídica contigo como Usuario; el cumplimiento de obligaciones legales; y, en ciertos casos, el interés legítimo de Apocalyptix para proteger la seguridad, integridad y correcto funcionamiento de la Plataforma.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">2. Datos personales que se recaban</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Apocalyptix recaba datos personales cuando tú los proporcionas directamente al registrarte, cuando interactúas con la Plataforma y cuando dichos datos se generan automáticamente como parte del funcionamiento técnico del servicio.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Esto incluye, de manera no limitativa:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Tu nombre o alias</li>
              <li>Dirección de correo electrónico</li>
              <li>Identificadores de cuenta</li>
              <li>Información de perfil que decidas compartir</li>
              <li>El contenido que publiques</li>
              <li>Tus interacciones en la Plataforma</li>
              <li>Datos técnicos como dirección IP, navegador, sistema operativo, dispositivo y registros de acceso</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Apocalyptix no recaba datos personales sensibles ni datos financieros confidenciales, ya que los pagos son gestionados directamente por proveedores externos certificados.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">3. Finalidades del tratamiento</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Tus datos personales se tratan para finalidades determinadas, explícitas y legítimas. En particular:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Permitir tu registro y autenticación</li>
              <li>Operar las funcionalidades de la Plataforma</li>
              <li>Facilitar la publicación, seguimiento y moderación de escenarios</li>
              <li>Garantizar la seguridad, prevenir fraude y abusos</li>
              <li>Atender solicitudes de soporte</li>
              <li>Cumplir obligaciones legales</li>
              <li>Mejorar el servicio mediante análisis internos anonimizados</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              No utilizamos tus datos para finalidades incompatibles con las anteriores sin tu consentimiento previo.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">4. Transferencias y encargados del tratamiento</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Tus datos pueden ser compartidos con proveedores que actúan como encargados del tratamiento (por ejemplo, servicios de hosting, seguridad, analítica o pagos), quienes tratan los datos únicamente conforme a nuestras instrucciones y bajo acuerdos de confidencialidad.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Asimismo, podrán transferirse cuando sea requerido por ley o autoridad competente, o cuando sea necesario para proteger derechos o seguridad.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">5. Medidas de seguridad</h2>
            <p className="text-gray-300 leading-relaxed">
              Apocalyptix aplica medidas técnicas, administrativas y organizativas razonables para proteger tus datos personales contra pérdida, acceso no autorizado, alteración o destrucción.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">6. Conservación de los datos</h2>
            <p className="text-gray-300 leading-relaxed">
              Tus datos se conservan durante el tiempo necesario para cumplir las finalidades descritas, mientras exista relación activa o durante los plazos legales aplicables, tras lo cual podrán eliminarse o anonimizarse.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">7. Derechos del titular (ARCO y derechos GDPR)</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Acceder</strong> a tus datos personales</li>
              <li><strong>Rectificarlos</strong> si son inexactos o incompletos</li>
              <li><strong>Cancelarlos o eliminarlos</strong></li>
              <li><strong>Oponerte</strong> a su tratamiento</li>
              <li><strong>Solicitar la limitación</strong> del tratamiento</li>
              <li><strong>Solicitar la portabilidad</strong> de tus datos</li>
              <li><strong>Revocar tu consentimiento</strong></li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Estos derechos se ejercen en los términos de la ley aplicable.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">8. Procedimiento para ejercer derechos</h2>
            <p className="text-gray-300 leading-relaxed">
              Puedes ejercer tus derechos enviando una solicitud a <a href="mailto:contacto@apocaliptyx.com" className="text-green-400 hover:text-green-300">contacto@apocaliptyx.com</a>, indicando tu identidad, derecho que deseas ejercer y descripción de la solicitud. Apocalyptix responderá dentro de los plazos legales.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">9. Revocación del consentimiento</h2>
            <p className="text-gray-300 leading-relaxed">
              Puedes revocar tu consentimiento en cualquier momento, sin efectos retroactivos, lo cual puede implicar la imposibilidad de seguir usando la Plataforma.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">10. Uso de cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Usamos cookies para operación técnica, preferencias y análisis. Puedes deshabilitarlas en tu navegador, aunque esto puede afectar algunas funcionalidades de la Plataforma.
            </p>
          </section>

          {/* Section 11 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">11. Menores de edad</h2>
            <p className="text-gray-300 leading-relaxed">
              La Plataforma está dirigida a mayores de 18 años. No recopilamos intencionalmente información de menores. Si descubrimos que hemos recopilado información de un menor, tomaremos medidas para eliminarla lo antes posible.
            </p>
          </section>

          {/* Section 12 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">12. Cambios a esta Política</h2>
            <p className="text-gray-300 leading-relaxed">
              Apocalyptix puede modificar esta Política; la versión vigente estará disponible en la Plataforma con su fecha de actualización. Te notificaremos sobre cambios significativos a través de un aviso en la Plataforma o por email.
            </p>
          </section>

          {/* Section 13 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">13. Consentimiento</h2>
            <p className="text-gray-300 leading-relaxed">
              Al usar la Plataforma consientes el tratamiento de tus datos personales conforme a esta Política. Si tienes preguntas, contáctanos en <a href="mailto:contacto@apocaliptyx.com" className="text-green-400 hover:text-green-300">contacto@apocaliptyx.com</a>.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
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