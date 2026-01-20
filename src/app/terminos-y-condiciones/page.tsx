// src/app/terminos/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skull, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Términos de Servicio | Apocaliptyx",
  description: "Términos y condiciones de uso de la plataforma Apocaliptyx",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">TÉRMINOS DE SERVICIO DE APOCALIPTYX</h1>
          <p className="text-gray-400">Última actualización: 2 de enero de 2026</p>
          <p className="text-gray-400">Contacto oficial: contacto@apocaliptyx.com</p>
        </div>

        {/* Intro */}
        <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-gray-300 leading-relaxed">
            Estos Términos de Servicio (los &quot;Términos&quot;) constituyen un contrato legal entre tú, en lo individual o en representación de una entidad (&quot;Usuario&quot;, &quot;tú&quot;), y Apocalyptix (&quot;Apocalyptix&quot;, &quot;nosotros&quot;, &quot;la Plataforma&quot;). Al acceder, registrarte, crear una cuenta, navegar, comprar AP Coins o utilizar cualquier funcionalidad de Apocalyptix, confirmas que has leído, entendido y aceptas quedar vinculado por estos Términos. Si no estás de acuerdo con estos Términos, debes abstenerte de usar la Plataforma.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Estos Términos se complementan con nuestra <Link href="/privacidad" className="text-purple-400 hover:text-purple-300">Política de Privacidad</Link>, que describe cómo recopilamos y tratamos datos personales. En caso de conflicto entre ambos documentos, prevalecerá lo que resulte más específico respecto de la materia discutida.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">1. DESCRIPCIÓN DEL SERVICIO Y NATURALEZA DE APOCALIPTYX</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Apocalyptix es una plataforma tecnológica de entretenimiento, simulación predictiva y participación comunitaria. Su finalidad es permitir que los Usuarios creen, publiquen, evalúen y sigan &quot;escenarios&quot; (predicciones estructuradas sobre eventos futuros) y que interactúen con dichos escenarios utilizando unidades virtuales internas denominadas AP Coins.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              La Plataforma se concibe única y estrictamente como un sistema de dinámica social. Los escenarios, opiniones, probabilidades, rankings y cualquier métrica derivada (incluyendo cálculos automatizados, &quot;probabilidad&quot;, &quot;valor&quot; o &quot;tendencia&quot;) son elementos de juego y simulación, diseñados para fomentar el análisis, el debate y el entretenimiento. En consecuencia, el Usuario reconoce expresamente que Apocalyptix:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>a)</strong> No es una institución financiera, no ofrece servicios bancarios, no administra patrimonio ni realiza intermediación financiera.</li>
              <li><strong>b)</strong> No es un casino ni una casa de apuestas. Aunque existen &quot;compras&quot; de AP Coins (ver Sección 5), la participación interna no implica apuestas con dinero real ni promesas de retorno económico real.</li>
              <li><strong>c)</strong> No presta asesoría de ningún tipo. Nada de lo publicado en la Plataforma debe interpretarse como recomendación profesional.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              El Usuario acepta que utilizará la Plataforma exclusivamente como servicio digital de entretenimiento, y que cualquier decisión real que tome basada en contenido visto en Apocalyptix es bajo su total y exclusivo riesgo.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">2. ELEGIBILIDAD, EDAD MÍNIMA Y DECLARACIONES DEL USUARIO</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              La Plataforma está destinada exclusivamente a personas mayores de 18 años. Al registrarte y usar Apocalyptix declaras y garantizas que:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Tienes al menos 18 años a la fecha de registro y durante el uso del servicio.</li>
              <li>Tienes capacidad legal para aceptar estos Términos.</li>
              <li>Utilizarás la Plataforma conforme a la ley aplicable y a estos Términos.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Si Apocalyptix detecta, sospecha razonablemente o recibe reporte de que un Usuario es menor de edad, podrá suspender o cancelar la cuenta de manera inmediata, sin obligación de mantener acceso o contenidos, y sin que ello genere derecho a reembolso (salvo lo estrictamente exigido por ley aplicable).
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">3. REGISTRO, CUENTA, SEGURIDAD Y RESPONSABILIDAD DEL USUARIO</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Para utilizar ciertas funcionalidades (por ejemplo, publicar escenarios, participar con AP Coins, comentar o votar), debes crear una cuenta. Al hacerlo, aceptas proporcionar información veraz, actualizada y suficiente para operar el servicio.
            </p>
            <p className="text-gray-300 leading-relaxed mb-2">El Usuario es responsable de:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>a)</strong> Mantener la confidencialidad de su contraseña y credenciales.</li>
              <li><strong>b)</strong> Toda actividad realizada dentro de la cuenta, sea o no realizada directamente por el Usuario, si deriva de negligencia, acceso indebido por falta de resguardo o uso compartido de credenciales.</li>
              <li><strong>c)</strong> Notificar inmediatamente a Apocalyptix si sospecha de acceso no autorizado o vulneración de seguridad, escribiendo a contacto@apocaliptyx.com.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Apocalyptix podrá, a su discreción razonable, implementar medidas de seguridad como verificación de correo, bloqueos por comportamiento anómalo, límites por IP o dispositivo, autenticación reforzada u otras medidas.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">4. AP COINS: DEFINICIÓN, NATURALEZA, USOS Y RESTRICCIONES</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Las AP Coins son unidades virtuales internas que permiten participar en el ecosistema de Apocalyptix (por ejemplo, apoyar escenarios, desbloquear acciones o participar en dinámicas del juego). El Usuario entiende y acepta expresamente que:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>No son dinero, no son moneda de curso legal, no son saldo bancario, no son criptomoneda y no representan un derecho de cobro.</li>
              <li>No tienen valor monetario fuera de la Plataforma. No existe obligación, presente o futura, de convertir AP Coins a dinero real ni a ningún activo externo de ningún tipo.</li>
              <li>No generan intereses ni rendimientos.</li>
              <li>Su uso es estrictamente dentro del entorno Apocalyptix, sujeto a reglas que pueden evolucionar.</li>
              <li>Pueden estar sujetas a límites, reglas de expiración, topes de compra/uso, restricciones por región o por comportamiento antifraude.</li>
              <li>No son reembolsables, salvo lo indicado expresamente en la Sección 5.7 o cuando una ley aplicable obligue lo contrario.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Apocalyptix puede ajustar (a) mecánicas del sistema, (b) reglas de consumo, (c) costos por acción, (d) balances, (e) penalizaciones, (f) recompensas internas, y (g) disponibilidad de AP Coins, cuando sea necesario para estabilidad, seguridad, operación, prevención de abuso o evolución del producto. Tales ajustes no constituyen incumplimiento contractual.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">5. PRECIOS, PAGOS, PROCESAMIENTO, FACTURACIÓN Y REEMBOLSOS (AP COINS)</h2>
            
            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.1 Compras y precios</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Apocalyptix permite adquirir AP Coins mediante pago real a través de Medios de Pago Autorizados (definidos abajo). Los precios de paquetes, promociones, bonificaciones, impuestos aplicables (si corresponden) y condiciones se mostrarán antes de que el Usuario confirme la compra. Apocalyptix puede modificar precios, paquetes, promociones o condiciones en cualquier momento por razones comerciales, técnicas o estratégicas. Dichos cambios no afectarán retroactivamente compras ya confirmadas y cobradas.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.2 Medios de Pago Autorizados (Stripe y otros)</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Los pagos se realizan mediante proveedores de pago externos certificados, tales como Stripe, y/o cualquier otro proveedor que Apocalyptix habilite en el futuro (&quot;Medios de Pago Autorizados&quot; o &quot;Proveedores de Pago&quot;). El Usuario acepta que el procesamiento del pago es realizado por el Proveedor de Pago, bajo sus propios términos y políticas. Apocalyptix no almacena datos completos de tarjeta ni credenciales bancarias.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.3 Autorización, validación y procesamiento del pago</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Al confirmar una compra, el Usuario autoriza al Proveedor de Pago a cargar el monto correspondiente al método de pago seleccionado. La compra se considerará completada cuando el Proveedor de Pago confirme la transacción como exitosa y la Plataforma acredite las AP Coins en la cuenta del Usuario.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.4 Pagos retenidos, revisiones y bloqueos preventivos</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Por motivos de seguridad, cumplimiento, prevención de fraude o políticas del Proveedor de Pago, ciertas transacciones pueden quedar retenidas o en revisión. Apocalyptix podrá no acreditar temporalmente las AP Coins, acreditar parcialmente, o acreditar pero bloquear su uso hasta que la operación se confirme como definitiva.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.5 Reversos, contracargos (chargebacks) y disputas</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Si el Usuario, el banco o el Proveedor de Pago inicia un contracargo, disputa o reverso, Apocalyptix podrá suspender temporalmente la cuenta del Usuario, deducir, retirar o bloquear las AP Coins asociadas, y tomar medidas adicionales permitidas por ley.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.6 Moneda, impuestos y conversión</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Los precios pueden mostrarse en una moneda determinada según región. El tipo de cambio, comisiones por conversión, comisiones bancarias, impuestos locales y cargos adicionales pueden ser calculados y cobrados por el Proveedor de Pago o el banco emisor.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.7 Comprobantes de pago y facturación</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              El Usuario recibirá un comprobante de pago emitido por el Proveedor de Pago, conforme a sus políticas y la regulación aplicable.
            </p>

            <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">5.8 Política de reembolsos (no reembolsable; excepciones limitadas)</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Todas las compras de AP Coins son finales y no reembolsables. Únicamente se considerará una solución excepcional en casos de error técnico comprobable atribuible a Apocalyptix o cobro duplicado verificable. Cualquier solicitud deberá realizarse a contacto@apocaliptyx.com dentro de 72 horas posterior a la transacción.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">6. RESPONSABILIDAD Y PAPEL DE APOCALYPTIX EN PAGOS</h2>
            <p className="text-gray-300 leading-relaxed">
              El Usuario reconoce que Apocalyptix actúa como intermediario tecnológico que integra o conecta servicios de Proveedores de Pago certificados para permitir la compra de AP Coins. Apocalyptix no es una entidad bancaria ni financiera, ni garantiza la aprobación de transacciones. La autorización, rechazo o retención de pagos depende del Proveedor de Pago, del banco emisor y de validaciones antifraude.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">7. PREVENCIÓN DE FRAUDE, VERIFICACIÓN Y CUMPLIMIENTO</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Para proteger a la comunidad y la integridad del sistema, Apocalyptix podrá implementar controles antifraude, verificación de identidad, análisis de patrones de compra, límites por cuenta, límites por dispositivo, límites por región, bloqueos preventivos y cualquier medida razonable.
            </p>
            <p className="text-gray-300 leading-relaxed">
              La negativa a completar verificaciones razonables o el uso de información falsa puede resultar en retención de pagos, cancelación de compras, bloqueo del uso de AP Coins, suspensión o terminación de la cuenta.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">8. CONTENIDO GENERADO POR EL USUARIO Y LICENCIA</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              El Usuario puede publicar contenido, incluyendo escenarios, títulos, descripciones, comentarios y material permitido por la Plataforma (&quot;Contenido del Usuario&quot;). El Usuario mantiene la titularidad de los derechos que le correspondan; sin embargo, para operar el servicio, el Usuario otorga a Apocalyptix una licencia mundial, no exclusiva, gratuita y sublicenciable para alojar, reproducir, mostrar, distribuir y comunicar su Contenido del Usuario dentro de la Plataforma.
            </p>
            <p className="text-gray-300 leading-relaxed">
              El Usuario declara que su contenido no infringe derechos de terceros, no es ilegal ni dañino, y no contiene datos personales sensibles de terceros sin autorización.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">9. REGLAS DE CONDUCTA Y PROHIBICIONES</h2>
            <p className="text-gray-300 leading-relaxed mb-4">El Usuario se obliga a no utilizar Apocalyptix para:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Difusión de odio, violencia, contenido sexual, amenazas o acoso.</li>
              <li>Fraude, suplantación, manipulación, ingeniería social.</li>
              <li>Publicación de información privada de terceros (doxing).</li>
              <li>Uso de bots, automatizaciones o scraping para manipular el sistema.</li>
              <li>Intentos de vulneración técnica o explotación de fallas.</li>
              <li>Actividades ilegales o que pongan en riesgo a la comunidad.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Apocalyptix podrá eliminar contenido, aplicar sanciones, suspender funciones, limitar compras o cerrar cuentas ante violaciones.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">10. MODERACIÓN, VEREDICTOS Y DINÁMICAS DEL SISTEMA</h2>
            <p className="text-gray-300 leading-relaxed">
              Apocalyptix podrá moderar contenido y conductas para asegurar integridad y seguridad. El Usuario acepta que pueden existir mecanismos internos o comunitarios para validar si un escenario &quot;se cumplió&quot; o &quot;no se cumplió&quot;. Cuando exista ambigüedad, Apocalyptix podrá apoyarse en fuentes públicas, criterios razonables, votación comunitaria o decisiones internas de moderación para resolver el veredicto del evento.
            </p>
          </section>

          {/* Section 11 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">11. DESCARGOS: SIN ASESORÍA Y SIN GARANTÍAS</h2>
            <p className="text-gray-300 leading-relaxed mb-4">El Usuario reconoce que:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Los escenarios son hipótesis, opiniones o simulaciones.</li>
              <li>Apocalyptix no garantiza exactitud, completitud o veracidad.</li>
              <li>La Plataforma se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;.</li>
              <li>Puede haber interrupciones, errores o cambios.</li>
              <li>Apocalyptix no será responsable por decisiones tomadas fuera de la Plataforma basadas en contenido visto en ella.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">12. LIMITACIÓN DE RESPONSABILIDAD</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              En la máxima medida permitida por ley, Apocalyptix no será responsable por daños indirectos, incidentales, especiales, punitivos o consecuentes, incluyendo pérdida de ganancias, reputación, oportunidades o datos, derivados del uso o imposibilidad de uso de la Plataforma.
            </p>
            <p className="text-gray-300 leading-relaxed">
              No existe responsabilidad por pérdidas internas de AP Coins derivadas de reglas del juego, participación, penalizaciones, ajustes de balance o sanciones por incumplimiento. Apocalyptix no responde por fallas del Proveedor de Pago, contracargos, retenciones, conversiones o comisiones bancarias.
            </p>
          </section>

          {/* Section 13 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">13. SUSPENSIÓN Y TERMINACIÓN</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Apocalyptix puede suspender o terminar tu acceso, con o sin aviso, cuando exista violación a estos Términos, se detecte fraude, abuso o riesgo de seguridad, existan Disputas recurrentes o uso indebido de pagos, o sea requerido por ley o autoridad competente.
            </p>
            <p className="text-gray-300 leading-relaxed">
              La terminación no genera derecho a reembolso de AP Coins no utilizadas, salvo obligación legal expresa.
            </p>
          </section>

          {/* Section 14 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">14. CAMBIOS A LOS TÉRMINOS Y AL SERVICIO</h2>
            <p className="text-gray-300 leading-relaxed">
              Apocalyptix puede modificar estos Términos, así como mecánicas, balances, precios, categorías y funcionalidades. La versión vigente se publica en la Plataforma con su fecha de actualización. El uso continuado después de cambios constituye aceptación.
            </p>
          </section>

          {/* Section 15 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">15. LEGISLACIÓN APLICABLE Y CONTACTO</h2>
            <p className="text-gray-300 leading-relaxed">
              Estos Términos se regirán por la legislación aplicable en la jurisdicción donde Apocalyptix opere formalmente. Para cualquier duda, solicitud, aclaración, reportes o soporte, contáctanos en: <a href="mailto:contacto@apocaliptyx.com" className="text-purple-400 hover:text-purple-300">contacto@apocaliptyx.com</a>
            </p>
          </section>

          {/* Section 16 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">16. SUSCRIPCIONES, PLANES RECURRENTES Y CANCELACIONES</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Apocalyptix podrá ofrecer, ahora o en el futuro, planes de suscripción recurrentes que otorguen al Usuario beneficios adicionales. Al contratar un Plan de Suscripción, el Usuario acepta que:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>El cargo es recurrente y se realizará automáticamente hasta que el Usuario cancele.</li>
              <li>El Usuario puede cancelar la renovación automática en cualquier momento desde su perfil o contactando a soporte.</li>
              <li>La cancelación impide cargos futuros, pero no genera reembolso de periodos ya iniciados o consumidos.</li>
              <li>Apocalyptix puede modificar precios, beneficios o condiciones notificándolo previamente.</li>
              <li>La falta de uso del Plan de Suscripción no da derecho a reembolso.</li>
            </ul>
          </section>

          {/* Section 17 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">17. IMPUESTOS Y RESPONSABILIDAD FISCAL DEL USUARIO</h2>
            <p className="text-gray-300 leading-relaxed">
              El Usuario reconoce que los precios mostrados pueden o no incluir impuestos indirectos, dependiendo de la jurisdicción. El Usuario es responsable del pago de cualquier impuesto aplicable a sus compras. Apocalyptix no brinda asesoría fiscal ni garantiza el tratamiento fiscal de las compras.
            </p>
          </section>

          {/* Section 18 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">18. ABUSO DE CONTRACARGOS, DISPUTAS FRAUDULENTAS Y CONSECUENCIAS</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              El uso indebido de contracargos, disputas falsas o desconocimiento intencional de cargos válidos constituye fraude y abuso del sistema. En caso de abuso, Apocalyptix podrá:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Suspender o cancelar definitivamente la cuenta del Usuario.</li>
              <li>Bloquear permanentemente el acceso futuro a la Plataforma.</li>
              <li>Anular todas las AP Coins asociadas al Usuario.</li>
              <li>Reclamar al Usuario los costos administrativos y penalizaciones.</li>
              <li>Cooperar con autoridades en investigaciones de fraude.</li>
            </ul>
          </section>

          {/* Section 19 */}
          <section className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">19. RESOLUCIÓN DE CONTROVERSIAS, MEDIACIÓN Y ARBITRAJE</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Antes de iniciar cualquier acción legal, el Usuario y Apocalyptix acuerdan intentar resolver de buena fe cualquier controversia mediante comunicación directa al correo contacto@apocaliptyx.com.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Si la controversia no se resuelve dentro de 30 días naturales, las partes podrán someter la disputa a los mecanismos legales disponibles. Las controversias se resolverán preferentemente mediante mediación o arbitraje. El Usuario renuncia, en la medida permitida por ley, a presentar acciones colectivas.
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